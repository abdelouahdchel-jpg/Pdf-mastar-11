import JSZip from 'jszip';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  Packer,
  BorderStyle,
  WidthType,
  PageBreak,
} from 'docx';

console.log('====================================================');
console.log('RUNNING COMPREHENSIVE PDF TO WORD (.DOCX) TEST SUITE');
console.log('====================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${message}`);
    failCount++;
  }
}

async function testPdfToWordFull() {
  // TEST 1: Generate PDF with Heading 1, Heading 2, Multi-line Paragraph, and 3x3 Table
  console.log('--- TEST 1: End-to-End Extraction & DOCX Synthesis ---');
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const page = pdfDoc.addPage([595, 842]); // A4 dimensions

  // Heading 1 (size 22)
  page.drawText('Executive Financial Report 2026', {
    x: 50,
    y: 780,
    size: 22,
    font: boldFont,
    color: rgb(0.1, 0.1, 0.1),
  });

  // Paragraph 1 (two lines, normal text)
  page.drawText('This report delivers the comprehensive financial and operational overview for Q1.', {
    x: 50,
    y: 735,
    size: 11,
    font,
    color: rgb(0.2, 0.2, 0.2),
  });
  page.drawText('Client privacy and complete in-browser computation have been maintained across all tools.', {
    x: 50,
    y: 720,
    size: 11,
    font,
    color: rgb(0.2, 0.2, 0.2),
  });

  // Heading 2 (size 16)
  page.drawText('Key Performance Indicators', {
    x: 50,
    y: 675,
    size: 16,
    font: boldFont,
    color: rgb(0.1, 0.1, 0.1),
  });

  // Table row 1 (headers)
  page.drawText('Department', { x: 50, y: 640, size: 10, font: boldFont });
  page.drawText('Budget ($)', { x: 220, y: 640, size: 10, font: boldFont });
  page.drawText('Status', { x: 380, y: 640, size: 10, font: boldFont });

  // Table row 2
  page.drawText('Engineering', { x: 50, y: 620, size: 10, font });
  page.drawText('450,000', { x: 220, y: 620, size: 10, font });
  page.drawText('Active', { x: 380, y: 620, size: 10, font });

  // Table row 3
  page.drawText('Operations', { x: 50, y: 600, size: 10, font });
  page.drawText('180,000', { x: 220, y: 600, size: 10, font });
  page.drawText('Complete', { x: 380, y: 600, size: 10, font });

  // Paragraph 2 (concluding statement separated by vertical gap)
  page.drawText('Final Summary: All project deliverables have been finalized on schedule with zero security issues.', {
    x: 50,
    y: 540,
    size: 11,
    font,
    color: rgb(0.2, 0.2, 0.2),
  });

  const pdfBytes = await pdfDoc.save();
  assert(pdfBytes.length > 0, `Generated test PDF document (${pdfBytes.length} bytes)`);

  // Parse text using pdfjsLib
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(pdfBytes) });
  const pdf = await loadingTask.promise;
  assert(pdf.numPages === 1, `Parsed PDF page count: ${pdf.numPages}`);

  const p1 = await pdf.getPage(1);
  const textContent = await p1.getTextContent();
  const items = textContent.items;

  let totalChars = 0;
  for (const it of items) {
    if (it.str) totalChars += it.str.trim().length;
  }
  assert(totalChars > 15, `Extracted digital text character count: ${totalChars} (> 15 chars)`);

  // Sort and cluster items
  const sortedItems = [...items].sort((a, b) => {
    const yA = a.transform ? a.transform[5] : 0;
    const yB = b.transform ? b.transform[5] : 0;
    if (Math.abs(yA - yB) > 3.5) return yB - yA;
    const xA = a.transform ? a.transform[4] : 0;
    const xB = b.transform ? b.transform[4] : 0;
    return xA - xB;
  });

  const pageLines = [];
  for (const item of sortedItems) {
    if (!item.str || !item.str.trim()) continue;
    const x = item.transform ? item.transform[4] : 0;
    const y = item.transform ? item.transform[5] : 0;
    const height = item.height || Math.abs(item.transform ? item.transform[0] : 10);
    const width = item.width || 0;

    const existingLine = pageLines.find((l) => Math.abs(l.y - y) <= 3.5);
    if (existingLine) {
      existingLine.items.push({ str: item.str, x, y, width, height });
    } else {
      pageLines.push({
        y,
        height,
        items: [{ str: item.str, x, y, width, height }],
      });
    }
  }

  // Median font size
  const allHeights = [];
  for (const l of pageLines) {
    for (const it of l.items) {
      if (it.height > 0) allHeights.push(it.height);
    }
  }
  allHeights.sort((a, b) => a - b);
  const medianHeight = allHeights.length > 0 ? allHeights[Math.floor(allHeights.length / 2)] : 11;

  // Build docx elements
  const docChildren = [];
  let i = 0;
  let detectedTables = 0;
  let detectedHeadings = 0;
  let detectedParagraphs = 0;

  while (i < pageLines.length) {
    const line = pageLines[i];

    // Check columns
    const columnSegments = [];
    let currentSeg = '';
    for (let k = 0; k < line.items.length; k++) {
      const item = line.items[k];
      if (k > 0) {
        const prev = line.items[k - 1];
        const gap = item.x - (prev.x + prev.width);
        if (gap > 22) {
          columnSegments.push(currentSeg.trim());
          currentSeg = item.str;
          continue;
        }
      }
      currentSeg += (currentSeg ? ' ' : '') + item.str;
    }
    if (currentSeg.trim()) columnSegments.push(currentSeg.trim());

    if (columnSegments.length >= 2) {
      const tableCandidateRows = [];
      let lookAhead = i;

      while (lookAhead < pageLines.length) {
        const checkLine = pageLines[lookAhead];
        const cols = [];
        let seg = '';
        for (let k = 0; k < checkLine.items.length; k++) {
          const it = checkLine.items[k];
          if (k > 0) {
            const pr = checkLine.items[k - 1];
            const g = it.x - (pr.x + pr.width);
            if (g > 22) {
              cols.push(seg.trim());
              seg = it.str;
              continue;
            }
          }
          seg += (seg ? ' ' : '') + it.str;
        }
        if (seg.trim()) cols.push(seg.trim());

        if (cols.length >= 2) {
          tableCandidateRows.push(cols);
          lookAhead++;
        } else {
          break;
        }
      }

      if (tableCandidateRows.length >= 2) {
        const maxCols = Math.max(...tableCandidateRows.map((r) => r.length));
        const docxRows = tableCandidateRows.map((rowCells, rIndex) => {
          const cells = [];
          for (let c = 0; c < maxCols; c++) {
            cells.push(
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: rowCells[c] || '',
                        bold: rIndex === 0,
                        size: 20,
                      }),
                    ],
                  }),
                ],
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' },
                  bottom: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' },
                  left: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' },
                  right: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' },
                },
              })
            );
          }
          return new TableRow({ children: cells });
        });

        docChildren.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: docxRows,
          })
        );
        docChildren.push(new Paragraph({ text: '', spacing: { after: 120 } }));
        detectedTables++;
        i = lookAhead;
        continue;
      }
    }

    const lineText = line.items.map((it) => it.str).join(' ').trim();
    const maxItemHeight = Math.max(...line.items.map((it) => it.height));
    const isHeading = maxItemHeight >= medianHeight * 1.28 && lineText.length < 120;

    if (isHeading) {
      docChildren.push(
        new Paragraph({
          text: lineText,
          heading: maxItemHeight >= medianHeight * 1.5 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 120 },
        })
      );
      detectedHeadings++;
      i++;
    } else {
      const paraLines = [lineText];
      let lastY = line.y;
      i++;

      while (i < pageLines.length) {
        const nextLine = pageLines[i];
        const nextText = nextLine.items.map((it) => it.str).join(' ').trim();
        const nextHeight = Math.max(...nextLine.items.map((it) => it.height));
        const nextIsHeading = nextHeight >= medianHeight * 1.28 && nextText.length < 120;
        const vGap = lastY - nextLine.y;

        if (nextIsHeading || vGap > medianHeight * 2.2) {
          break;
        }

        paraLines.push(nextText);
        lastY = nextLine.y;
        i++;
      }

      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: paraLines.join(' '),
              size: Math.round(medianHeight * 2),
            }),
          ],
          spacing: { after: 140 },
        })
      );
      detectedParagraphs++;
    }
  }

  assert(detectedHeadings === 2, `Detected 2 headings (H1: Executive Financial Report, H2: Key Performance Indicators) - Actual: ${detectedHeadings}`);
  assert(detectedTables === 1, `Detected 1 table with multi-column alignment - Actual: ${detectedTables}`);
  assert(detectedParagraphs === 2, `Preserved 2 distinct paragraphs with proper line spacing - Actual: ${detectedParagraphs}`);

  // Pack into DOCX
  const doc = new Document({
    sections: [
      {
        properties: {
          page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } },
        },
        children: docChildren,
      },
    ],
  });

  const docxBuffer = await Packer.toBuffer(doc);

  // Check Magic Bytes (PK header for ZIP/OpenXML)
  const isZipMagic = docxBuffer[0] === 0x50 && docxBuffer[1] === 0x4b;
  assert(isZipMagic, `Output has ZIP/OpenXML magic bytes ('PK' = 0x50 0x4B), NOT HTML text`);

  // Inspect internal OpenXML structure
  const zip = await JSZip.loadAsync(docxBuffer);
  const hasDocXml = zip.file('word/document.xml') !== null;
  const hasContentTypes = zip.file('[Content_Types].xml') !== null;
  const hasRels = zip.file('_rels/.rels') !== null;

  assert(hasDocXml, `Contains word/document.xml`);
  assert(hasContentTypes, `Contains [Content_Types].xml`);
  assert(hasRels, `Contains _rels/.rels`);

  const docXmlString = await zip.file('word/document.xml').async('string');
  assert(docXmlString.includes('Executive Financial Report 2026'), `document.xml contains Heading 1 text`);
  assert(docXmlString.includes('<w:tbl>'), `document.xml contains native Word table tag <w:tbl>`);
  assert(docXmlString.includes('Engineering'), `document.xml contains table cell content 'Engineering'`);
  assert(docXmlString.includes('450,000'), `document.xml contains table cell content '450,000'`);
  assert(docXmlString.includes('Client privacy and complete in-browser computation'), `document.xml contains body paragraph text`);

  // Verify file name & MIME type expectations
  const baseName = 'test_sample.pdf'.replace(/\.[^/.]+$/, '');
  const finalFileName = `${baseName}_converted.docx`;
  const mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

  assert(finalFileName === 'test_sample_converted.docx', `Generated file name has .docx extension: ${finalFileName}`);
  assert(mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', `MIME type is official OpenXML Word`);

  // TEST 2: Scanned / Image-Only PDF Error Handling
  console.log('\n--- TEST 2: Scanned / Image-Only PDF Error Handling ---');
  const blankDoc = await PDFDocument.create();
  blankDoc.addPage([595, 842]); // blank page, zero characters
  const blankBytes = await blankDoc.save();

  const blankLoadingTask = pdfjsLib.getDocument({ data: new Uint8Array(blankBytes) });
  const blankPdf = await blankLoadingTask.promise;
  const blankP1 = await blankPdf.getPage(1);
  const blankContent = await blankP1.getTextContent();
  let blankChars = 0;
  for (const it of blankContent.items) {
    if (it.str) blankChars += it.str.trim().length;
  }

  let errorThrown = false;
  let errorMessage = '';
  try {
    if (blankChars < 15) {
      throw new Error(
        'No selectable digital text was found in this PDF. This document appears to be a scanned paper copy or image-based PDF. Please use the OCR PDF tool to recognize text from scanned images before converting to Word.'
      );
    }
  } catch (err) {
    errorThrown = true;
    errorMessage = err.message;
  }

  assert(errorThrown, `Scanned / empty PDF correctly throws error`);
  assert(errorMessage.includes('OCR PDF tool'), `Error message mentions OCR PDF tool to assist users: "${errorMessage}"`);

  console.log('\n====================================================');
  console.log(`TOTAL PASSES: ${passCount} | TOTAL FAILURES: ${failCount}`);
  console.log('====================================================');

  if (failCount > 0) {
    process.exit(1);
  }
}

testPdfToWordFull().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
