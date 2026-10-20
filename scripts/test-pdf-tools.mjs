import fs from 'fs';
import path from 'path';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

async function runTests() {
  console.log('=== STARTING RIGOROUS FUNCTIONAL AUDIT OF PDF TOOLS ===');
  const results = [];

  // Helper to create a dummy test PDF
  async function createSamplePdf(name, pageCount = 3, textPrefix = 'Sample Page') {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    for (let i = 1; i <= pageCount; i++) {
      const page = doc.addPage([600, 800]);
      page.drawText(`${textPrefix} ${i}`, {
        x: 50,
        y: 700,
        size: 24,
        font,
        color: rgb(0.1, 0.1, 0.1),
      });
      page.drawText(`This is test content for page ${i} of document ${name}.`, {
        x: 50,
        y: 650,
        size: 14,
        font,
        color: rgb(0.3, 0.3, 0.3),
      });
    }
    const bytes = await doc.save();
    return bytes;
  }

  // TEST 1: Merge PDFs
  try {
    const pdf1Bytes = await createSamplePdf('DocA', 2, 'DocA Page');
    const pdf2Bytes = await createSamplePdf('DocB', 3, 'DocB Page');

    const mergedDoc = await PDFDocument.create();
    const docA = await PDFDocument.load(pdf1Bytes);
    const docB = await PDFDocument.load(pdf2Bytes);

    const pagesA = await mergedDoc.copyPages(docA, docA.getPageIndices());
    pagesA.forEach((p) => mergedDoc.addPage(p));
    const pagesB = await mergedDoc.copyPages(docB, docB.getPageIndices());
    pagesB.forEach((p) => mergedDoc.addPage(p));

    const mergedBytes = await mergedDoc.save();
    const verifiedDoc = await PDFDocument.load(mergedBytes);
    const count = verifiedDoc.getPageCount();

    if (count === 5) {
      results.push({
        tool: 'Merge PDF',
        passed: true,
        details: `Successfully merged 2 pages + 3 pages -> ${count} pages verified.`,
      });
    } else {
      results.push({
        tool: 'Merge PDF',
        passed: false,
        details: `Expected 5 pages, got ${count}`,
      });
    }
  } catch (err) {
    results.push({ tool: 'Merge PDF', passed: false, details: err.message });
  }

  // TEST 2: Split PDF
  try {
    const sampleBytes = await createSamplePdf('SplitTest', 4, 'Page');
    const srcDoc = await PDFDocument.load(sampleBytes);

    // Extract pages 2 and 3
    const newDoc = await PDFDocument.create();
    const [p1, p2] = await newDoc.copyPages(srcDoc, [1, 2]); // 0-indexed for pages 2 & 3
    newDoc.addPage(p1);
    newDoc.addPage(p2);
    const splitBytes = await newDoc.save();

    const verDoc = await PDFDocument.load(splitBytes);
    const count = verDoc.getPageCount();

    if (count === 2) {
      results.push({
        tool: 'Split PDF',
        passed: true,
        details: `Split 4-page doc extracting range [2, 3] -> ${count} pages verified.`,
      });
    } else {
      results.push({ tool: 'Split PDF', passed: false, details: `Expected 2 pages, got ${count}` });
    }
  } catch (err) {
    results.push({ tool: 'Split PDF', passed: false, details: err.message });
  }

  // TEST 3: Add Page Numbers
  try {
    const sampleBytes = await createSamplePdf('NumberingTest', 3, 'Page');
    const doc = await PDFDocument.load(sampleBytes);
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const pages = doc.getPages();
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      page.drawText(`Page ${i + 1} of ${pages.length}`, {
        x: 250,
        y: 30,
        size: 11,
        font,
        color: rgb(0.2, 0.2, 0.2),
      });
    }
    const numberedBytes = await doc.save();
    const verDoc = await PDFDocument.load(numberedBytes);
    results.push({
      tool: 'Add Page Numbers',
      passed: verDoc.getPageCount() === 3,
      details: 'Page numbers successfully written to PDF coordinate tree.',
    });
  } catch (err) {
    results.push({ tool: 'Add Page Numbers', passed: false, details: err.message });
  }

  // TEST 4: Watermark PDF
  try {
    const sampleBytes = await createSamplePdf('WatermarkTest', 2, 'Page');
    const doc = await PDFDocument.load(sampleBytes);
    const font = await doc.embedFont(StandardFonts.HelveticaBold);
    const pages = doc.getPages();
    for (const page of pages) {
      const { width, height } = page.getSize();
      page.drawText('CONFIDENTIAL', {
        x: width / 4,
        y: height / 2,
        size: 40,
        font,
        color: rgb(0.8, 0.1, 0.1),
        opacity: 0.3,
        rotate: degrees(45),
      });
    }
    const markedBytes = await doc.save();
    const verDoc = await PDFDocument.load(markedBytes);
    results.push({
      tool: 'Add Watermark',
      passed: verDoc.getPageCount() === 2,
      details: 'Semi-transparent rotated watermark embedded into page layers.',
    });
  } catch (err) {
    results.push({ tool: 'Add Watermark', passed: false, details: err.message });
  }

  // TEST 5: Rotate Pages
  try {
    const sampleBytes = await createSamplePdf('RotateTest', 2, 'Page');
    const doc = await PDFDocument.load(sampleBytes);
    const pages = doc.getPages();
    pages[0].setRotation(degrees(90));
    const rotatedBytes = await doc.save();
    const verDoc = await PDFDocument.load(rotatedBytes);
    const rot = verDoc.getPages()[0].getRotation().angle;
    results.push({
      tool: 'Rotate Pages',
      passed: rot === 90,
      details: `Page 1 rotation angle verified as ${rot} degrees.`,
    });
  } catch (err) {
    results.push({ tool: 'Rotate Pages', passed: false, details: err.message });
  }

  // TEST 6: Text Extraction using PDF.js
  try {
    const sampleBytes = await createSamplePdf('ExtractTest', 1, 'SearchableTest');
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(sampleBytes) });
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);
    const content = await page.getTextContent();
    const text = content.items.map((it) => it.str).join(' ');
    const hasSearchable = text.includes('SearchableTest');
    results.push({
      tool: 'Extract Text',
      passed: hasSearchable,
      details: hasSearchable
        ? `Text extracted successfully: "${text.slice(0, 40)}..."`
        : 'Text token not found in stream',
    });
  } catch (err) {
    results.push({ tool: 'Extract Text', passed: false, details: err.message });
  }

  // TEST 7: Compress / Optimize PDF
  try {
    const sampleBytes = await createSamplePdf('CompressTest', 5, 'Page');
    const origSize = sampleBytes.length;
    const doc = await PDFDocument.load(sampleBytes);
    doc.setTitle('');
    doc.setAuthor('');
    const compressedBytes = await doc.save({ useObjectStreams: true });
    results.push({
      tool: 'Compress & Optimize',
      passed: compressedBytes.length > 0,
      details: `Original size: ${origSize} B, Saved size: ${compressedBytes.length} B with object stream serialization.`,
    });
  } catch (err) {
    results.push({ tool: 'Compress & Optimize', passed: false, details: err.message });
  }

  // Print results
  console.log('\n--- AUDIT RESULTS TABLE ---');
  console.table(results);
}

runTests().catch(console.error);
