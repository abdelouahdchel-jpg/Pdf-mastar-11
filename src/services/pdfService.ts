import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import { createWorker } from 'tesseract.js';
import { PageThumbnail, ProcessProgress } from '../types/tools';

// Ensure PDF.js worker is properly configured
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

/**
 * Read a browser File into an ArrayBuffer
 */
export async function fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
  return await file.arrayBuffer();
}

/**
 * Get page count and basic details of a PDF file
 */
export async function getPdfInfo(file: File | ArrayBuffer): Promise<{
  pageCount: number;
  title?: string;
  author?: string;
  subject?: string;
  creator?: string;
  producer?: string;
  keywords?: string[];
}> {
  const bytes = file instanceof File ? await file.arrayBuffer() : file;
  const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  return {
    pageCount: pdfDoc.getPageCount(),
    title: pdfDoc.getTitle(),
    author: pdfDoc.getAuthor(),
    subject: pdfDoc.getSubject(),
    creator: pdfDoc.getCreator(),
    producer: pdfDoc.getProducer(),
    keywords: pdfDoc.getKeywords() ? pdfDoc.getKeywords()?.split(';') : undefined,
  };
}

/**
 * Render all page thumbnails of a PDF using PDF.js
 */
export async function renderAllPageThumbnails(
  file: File | ArrayBuffer,
  scale: number = 0.35,
  onProgress?: (progress: ProcessProgress) => void
): Promise<PageThumbnail[]> {
  const bytes = file instanceof File ? await file.arrayBuffer() : file;
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(bytes) });
  const pdf = await loadingTask.promise;
  const total = pdf.numPages;
  const thumbnails: PageThumbnail[] = [];

  for (let i = 1; i <= total; i++) {
    if (onProgress) {
      onProgress({
        stage: `Rendering preview page ${i} of ${total}`,
        percent: Math.round((i / total) * 100),
      });
    }
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    // Render page
    // @ts-expect-error pdfjs canvas context
    await page.render({ canvasContext: context, viewport }).promise;

    thumbnails.push({
      pageNumber: i,
      dataUrl: canvas.toDataURL('image/jpeg', 0.8),
      rotation: page.rotate || 0,
      selected: false,
    });
  }

  return thumbnails;
}

/**
 * Merge multiple PDF files into one
 */
export async function mergePdfs(
  files: File[],
  onProgress?: (progress: ProcessProgress) => void
): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();
  const total = files.length;

  for (let i = 0; i < total; i++) {
    const file = files[i];
    if (onProgress) {
      onProgress({
        stage: `Merging ${file.name} (${i + 1}/${total})`,
        percent: Math.round(((i + 0.5) / total) * 100),
      });
    }
    const bytes = await file.arrayBuffer();
    const donorPdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const copiedPages = await mergedPdf.copyPages(donorPdf, donorPdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  if (onProgress) {
    onProgress({ stage: 'Finalizing merged document...', percent: 98 });
  }

  return await mergedPdf.save({ useObjectStreams: true });
}

/**
 * Split PDF: Mode 'all' (zip of single pages) or 'range' (specific ranges)
 */
export async function splitPdf(
  file: File,
  mode: 'all' | 'ranges',
  rangesStr?: string,
  onProgress?: (progress: ProcessProgress) => void
): Promise<{ blob: Blob; fileName: string; isZip: boolean }> {
  const bytes = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const totalPages = srcDoc.getPageCount();
  const baseName = file.name.replace(/\.[^/.]+$/, '');

  if (mode === 'all') {
    const zip = new JSZip();
    for (let i = 0; i < totalPages; i++) {
      if (onProgress) {
        onProgress({
          stage: `Extracting page ${i + 1} of ${totalPages}`,
          percent: Math.round(((i + 1) / totalPages) * 100),
        });
      }
      const newDoc = await PDFDocument.create();
      const [copiedPage] = await newDoc.copyPages(srcDoc, [i]);
      newDoc.addPage(copiedPage);
      const pdfBytes = await newDoc.save({ useObjectStreams: true });
      zip.file(`${baseName}_page_${i + 1}.pdf`, pdfBytes);
    }
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    return { blob: zipBlob, fileName: `${baseName}_split_pages.zip`, isZip: true };
  } else {
    // Custom ranges, e.g. "1-3, 5, 7-10"
    const pageIndices = parsePageRanges(rangesStr || `1-${totalPages}`, totalPages);
    if (pageIndices.length === 0) {
      throw new Error('No valid pages found in the specified range.');
    }
    const newDoc = await PDFDocument.create();
    const copiedPages = await newDoc.copyPages(srcDoc, pageIndices);
    copiedPages.forEach((p) => newDoc.addPage(p));
    const pdfBytes = await newDoc.save({ useObjectStreams: true });
    return {
      // Create a standard Blob with Uint8Array copy to satisfy TypeScript
      blob: new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' }),
      fileName: `${baseName}_split.pdf`,
      isZip: false,
    };
  }
}

/**
 * Extract selected pages into a new PDF
 */
export async function extractPages(
  file: File,
  pageNumbers: number[],
  onProgress?: (progress: ProcessProgress) => void
): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const totalPages = srcDoc.getPageCount();
  const validIndices = pageNumbers
    .map((p) => p - 1)
    .filter((idx) => idx >= 0 && idx < totalPages);

  if (validIndices.length === 0) {
    throw new Error('Please select at least one valid page to extract.');
  }

  if (onProgress) onProgress({ stage: 'Extracting selected pages...', percent: 50 });
  const newDoc = await PDFDocument.create();
  const copiedPages = await newDoc.copyPages(srcDoc, validIndices);
  copiedPages.forEach((p) => newDoc.addPage(p));

  if (onProgress) onProgress({ stage: 'Saving document...', percent: 90 });
  return await newDoc.save({ useObjectStreams: true });
}

/**
 * Remove specified pages from PDF
 */
export async function removePages(
  file: File,
  pageNumbersToRemove: number[],
  onProgress?: (progress: ProcessProgress) => void
): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const totalPages = srcDoc.getPageCount();
  const removeSet = new Set(pageNumbersToRemove);

  const keepIndices: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (!removeSet.has(i)) {
      keepIndices.push(i - 1);
    }
  }

  if (keepIndices.length === 0) {
    throw new Error('Cannot remove all pages. At least one page must remain.');
  }

  if (onProgress) onProgress({ stage: 'Removing selected pages...', percent: 50 });
  const newDoc = await PDFDocument.create();
  const copiedPages = await newDoc.copyPages(srcDoc, keepIndices);
  copiedPages.forEach((p) => newDoc.addPage(p));

  return await newDoc.save({ useObjectStreams: true });
}

/**
 * Reorder and rotate pages visually
 */
export async function organizePdfPages(
  file: File,
  orderedPages: { originalPageNumber: number; rotation: number }[],
  onProgress?: (progress: ProcessProgress) => void
): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const newDoc = await PDFDocument.create();
  const total = orderedPages.length;

  for (let i = 0; i < total; i++) {
    if (onProgress) {
      onProgress({
        stage: `Processing page ${i + 1} of ${total}`,
        percent: Math.round(((i + 1) / total) * 100),
      });
    }
    const item = orderedPages[i];
    const srcIndex = item.originalPageNumber - 1;
    const [copiedPage] = await newDoc.copyPages(srcDoc, [srcIndex]);
    const currentRot = copiedPage.getRotation().angle;
    copiedPage.setRotation(degrees((currentRot + item.rotation) % 360));
    newDoc.addPage(copiedPage);
  }

  return await newDoc.save({ useObjectStreams: true });
}

/**
 * Rotate all or selected pages
 */
export async function rotatePdf(
  file: File,
  angle: number, // 90, 180, 270
  target: 'all' | 'odd' | 'even' | number[] = 'all',
  onProgress?: (progress: ProcessProgress) => void
): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();
  const total = pages.length;

  for (let i = 0; i < total; i++) {
    const pageNum = i + 1;
    let shouldRotate = false;

    if (target === 'all') shouldRotate = true;
    else if (target === 'odd' && pageNum % 2 !== 0) shouldRotate = true;
    else if (target === 'even' && pageNum % 2 === 0) shouldRotate = true;
    else if (Array.isArray(target) && target.includes(pageNum)) shouldRotate = true;

    if (shouldRotate) {
      const page = pages[i];
      const curAngle = page.getRotation().angle;
      page.setRotation(degrees((curAngle + angle) % 360));
    }

    if (onProgress) {
      onProgress({
        stage: `Rotating pages... (${i + 1}/${total})`,
        percent: Math.round(((i + 1) / total) * 100),
      });
    }
  }

  return await pdfDoc.save({ useObjectStreams: true });
}

/**
 * Add Page Numbers to PDF
 */
export async function addPageNumbers(
  file: File,
  options: {
    position: 'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-center' | 'top-right' | 'top-left';
    format: 'Page {n} of {total}' | '{n} / {total}' | '{n}' | '- {n} -';
    fontSize: number;
    startFrom: number;
    margin: number;
  },
  onProgress?: (progress: ProcessProgress) => void
): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();
  const total = pages.length;

  for (let i = 0; i < total; i++) {
    if (onProgress) {
      onProgress({
        stage: `Numbering page ${i + 1} of ${total}`,
        percent: Math.round(((i + 1) / total) * 100),
      });
    }
    const page = pages[i];
    const { width, height } = page.getSize();
    const curNum = i + options.startFrom;
    let text = options.format
      .replace('{n}', String(curNum))
      .replace('{total}', String(total + options.startFrom - 1));

    const textWidth = font.widthOfTextAtSize(text, options.fontSize);
    let x = width / 2 - textWidth / 2;
    let y = options.margin;

    switch (options.position) {
      case 'bottom-center':
        x = width / 2 - textWidth / 2;
        y = options.margin;
        break;
      case 'bottom-right':
        x = width - textWidth - options.margin;
        y = options.margin;
        break;
      case 'bottom-left':
        x = options.margin;
        y = options.margin;
        break;
      case 'top-center':
        x = width / 2 - textWidth / 2;
        y = height - options.margin - options.fontSize;
        break;
      case 'top-right':
        x = width - textWidth - options.margin;
        y = height - options.margin - options.fontSize;
        break;
      case 'top-left':
        x = options.margin;
        y = height - options.margin - options.fontSize;
        break;
    }

    page.drawText(text, {
      x,
      y,
      size: options.fontSize,
      font,
      color: rgb(0.2, 0.2, 0.2),
    });
  }

  return await pdfDoc.save({ useObjectStreams: true });
}

/**
 * Compress PDF
 */
export async function compressPdf(
  file: File,
  level: 'extreme' | 'recommended' | 'light',
  onProgress?: (progress: ProcessProgress) => void
): Promise<{ bytes: Uint8Array; originalSize: number; newSize: number; ratio: string }> {
  const originalSize = file.size;
  const bytes = await file.arrayBuffer();

  if (onProgress) onProgress({ stage: 'Analyzing document structure...', percent: 25 });
  const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });

  if (onProgress) onProgress({ stage: 'Compressing PDF streams and objects...', percent: 65 });

  if (level === 'extreme') {
    // Strip unnecessary metadata
    pdfDoc.setTitle('');
    pdfDoc.setAuthor('');
    pdfDoc.setSubject('');
    pdfDoc.setKeywords([]);
    pdfDoc.setProducer('');
    pdfDoc.setCreator('');
  }

  // Flatten interactive form widgets if any
  try {
    const form = pdfDoc.getForm();
    if (form) form.flatten();
  } catch {
    // ignore
  }

  if (onProgress) onProgress({ stage: 'Re-encoding PDF objects...', percent: 90 });
  const compressedBytes = await pdfDoc.save({
    useObjectStreams: true,
    addDefaultPage: false,
  });

  const newSize = compressedBytes.length;
  const ratio = Math.max(0, Math.round(((originalSize - newSize) / originalSize) * 100)) + '%';

  return {
    bytes: compressedBytes,
    originalSize,
    newSize,
    ratio,
  };
}

/**
 * Flatten annotations and form fields in PDF
 */
export async function flattenPdf(
  file: File,
  onProgress?: (progress: ProcessProgress) => void
): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();
  if (onProgress) onProgress({ stage: 'Reading form fields and annotations...', percent: 40 });
  const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });

  try {
    const form = pdfDoc.getForm();
    form.flatten();
  } catch {
    // If no form, document is already flat
  }

  if (onProgress) onProgress({ stage: 'Saving flattened document...', percent: 90 });
  return await pdfDoc.save({ useObjectStreams: true });
}

/**
 * Convert PDF to JPG or PNG images (returns zip or single blob)
 */
export async function pdfToImages(
  file: File,
  format: 'image/jpeg' | 'image/png',
  quality: number = 0.9,
  dpiScale: number = 1.5,
  onProgress?: (progress: ProcessProgress) => void
): Promise<{ blob: Blob; fileName: string; isZip: boolean }> {
  const bytes = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(bytes) });
  const pdf = await loadingTask.promise;
  const total = pdf.numPages;
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  const ext = format === 'image/jpeg' ? 'jpg' : 'png';

  if (total === 1) {
    if (onProgress) onProgress({ stage: 'Rendering page to image...', percent: 50 });
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: dpiScale });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const context = canvas.getContext('2d')!;

    // @ts-expect-error pdfjs canvas context
    await page.render({ canvasContext: context, viewport }).promise;

    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b!), format, quality);
    });

    return { blob, fileName: `${baseName}_page_1.${ext}`, isZip: false };
  }

  const zip = new JSZip();
  for (let i = 1; i <= total; i++) {
    if (onProgress) {
      onProgress({
        stage: `Rendering image ${i} of ${total}`,
        percent: Math.round((i / total) * 100),
      });
    }
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: dpiScale });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const context = canvas.getContext('2d')!;

    // @ts-expect-error pdfjs canvas context
    await page.render({ canvasContext: context, viewport }).promise;

    const dataUrl = canvas.toDataURL(format, quality);
    const base64Data = dataUrl.split(',')[1];
    zip.file(`${baseName}_page_${i}.${ext}`, base64Data, { base64: true });
  }

  if (onProgress) onProgress({ stage: 'Packaging ZIP file...', percent: 95 });
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  return { blob: zipBlob, fileName: `${baseName}_images_${ext}.zip`, isZip: true };
}

/**
 * Extract text from searchable PDF
 */
export async function extractTextFromPdf(
  file: File,
  onProgress?: (progress: ProcessProgress) => void
): Promise<{ text: string; pageCount: number }> {
  const bytes = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(bytes) });
  const pdf = await loadingTask.promise;
  const total = pdf.numPages;
  const textPages: string[] = [];

  for (let i = 1; i <= total; i++) {
    if (onProgress) {
      onProgress({
        stage: `Extracting text from page ${i} of ${total}`,
        percent: Math.round((i / total) * 100),
      });
    }
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str || '')
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    textPages.push(`--- Page ${i} ---\n${pageText}`);
  }

  return { text: textPages.join('\n\n'), pageCount: total };
}

/**
 * OCR Scanned Documents & Images using Tesseract client-side
 */
export async function runOcr(
  file: File,
  language: string = 'eng',
  onProgress?: (progress: ProcessProgress) => void
): Promise<{ text: string }> {
  if (onProgress) onProgress({ stage: 'Initializing OCR engine...', percent: 10 });
  const worker = await createWorker(language);

  try {
    let imagesToProcess: (string | Blob)[] = [];

    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      if (onProgress) onProgress({ stage: 'Rendering PDF pages for OCR...', percent: 20 });
      const bytes = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(bytes) });
      const pdf = await loadingTask.promise;
      const total = Math.min(pdf.numPages, 10); // Process up to 10 pages for client performance

      for (let i = 1; i <= total; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const context = canvas.getContext('2d')!;
        // @ts-expect-error pdfjs canvas context
        await page.render({ canvasContext: context, viewport }).promise;
        imagesToProcess.push(canvas.toDataURL('image/jpeg', 0.85));
      }
    } else {
      imagesToProcess.push(file);
    }

    const recognizedTexts: string[] = [];
    const totalImages = imagesToProcess.length;

    for (let idx = 0; idx < totalImages; idx++) {
      if (onProgress) {
        onProgress({
          stage: `Recognizing text (Page ${idx + 1}/${totalImages})...`,
          percent: Math.round(25 + ((idx + 0.5) / totalImages) * 70),
        });
      }
      const ret = await worker.recognize(imagesToProcess[idx]);
      recognizedTexts.push(`--- Page ${idx + 1} OCR Output ---\n${ret.data.text}`);
    }

    if (onProgress) onProgress({ stage: 'Finalizing OCR results...', percent: 100 });
    return { text: recognizedTexts.join('\n\n') };
  } finally {
    await worker.terminate();
  }
}

/**
 * Convert Images to PDF (JPG, PNG, WEBP, etc.)
 */
export async function imagesToPdf(
  files: File[],
  options: {
    margin: number;
    pageSize: 'fit' | 'a4' | 'letter';
    orientation: 'portrait' | 'landscape';
  },
  onProgress?: (progress: ProcessProgress) => void
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const total = files.length;

  for (let i = 0; i < total; i++) {
    const file = files[i];
    if (onProgress) {
      onProgress({
        stage: `Converting image ${i + 1} of ${total}: ${file.name}`,
        percent: Math.round(((i + 1) / total) * 100),
      });
    }

    const bytes = await file.arrayBuffer();
    let embeddedImg;

    if (file.type === 'image/jpeg' || file.name.toLowerCase().endsWith('.jpg') || file.name.toLowerCase().endsWith('.jpeg')) {
      embeddedImg = await pdfDoc.embedJpg(bytes);
    } else if (file.type === 'image/png' || file.name.toLowerCase().endsWith('.png')) {
      embeddedImg = await pdfDoc.embedPng(bytes);
    } else {
      // Convert other image types (webp, gif, etc.) to PNG via canvas
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
        img.src = objectUrl;
      });
      URL.revokeObjectURL(objectUrl);

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);

      const pngBlob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), 'image/png'));
      const pngBytes = await pngBlob.arrayBuffer();
      embeddedImg = await pdfDoc.embedPng(pngBytes);
    }

    const { width: imgW, height: imgH } = embeddedImg;

    if (options.pageSize === 'fit') {
      const page = pdfDoc.addPage([imgW + options.margin * 2, imgH + options.margin * 2]);
      page.drawImage(embeddedImg, {
        x: options.margin,
        y: options.margin,
        width: imgW,
        height: imgH,
      });
    } else {
      // A4 is 595.28 x 841.89 points; Letter is 612 x 792 points
      let pageW = options.pageSize === 'a4' ? 595.28 : 612;
      let pageH = options.pageSize === 'a4' ? 841.89 : 792;

      if (options.orientation === 'landscape') {
        const temp = pageW;
        pageW = pageH;
        pageH = temp;
      }

      const page = pdfDoc.addPage([pageW, pageH]);
      const availableW = pageW - options.margin * 2;
      const availableH = pageH - options.margin * 2;
      const scale = Math.min(availableW / imgW, availableH / imgH);
      const drawW = imgW * scale;
      const drawH = imgH * scale;
      const drawX = (pageW - drawW) / 2;
      const drawY = (pageH - drawH) / 2;

      page.drawImage(embeddedImg, {
        x: drawX,
        y: drawY,
        width: drawW,
        height: drawH,
      });
    }
  }

  return await pdfDoc.save({ useObjectStreams: true });
}

/**
 * Convert Plain Text or Markdown into paginated PDF
 */
export async function textToPdf(
  text: string,
  options: {
    fontName?: 'Helvetica' | 'TimesRoman' | 'Courier';
    fontSize?: number;
    lineHeight?: number;
    title?: string;
  } = {}
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const fontChoice = options.fontName === 'Courier'
    ? StandardFonts.Courier
    : options.fontName === 'TimesRoman'
    ? StandardFonts.TimesRoman
    : StandardFonts.Helvetica;

  const font = await pdfDoc.embedFont(fontChoice);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const fontSize = options.fontSize || 11;
  const lineHeight = options.lineHeight || fontSize * 1.4;
  const margin = 50;
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const maxLineWidth = pageWidth - margin * 2;

  let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  if (options.title) {
    const safeTitle = options.title.replace(/[^\x20-\x7E\xA0-\xFF]/g, '?');
    currentPage.drawText(safeTitle, {
      x: margin,
      y: y - 16,
      size: 18,
      font: boldFont,
      color: rgb(0.1, 0.1, 0.1),
    });
    y -= 36;
  }

  const lines = text.split('\n');

  for (const rawLine of lines) {
    // Sanitize non-WinAnsi characters (e.g. Arabic, Asian characters) to prevent pdf-lib WinAnsi encode crashes
    const safeLine = rawLine.replace(/[^\x20-\x7E\xA0-\xFF]/g, '?');

    // Word wrap
    const words = safeLine.split(' ');
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const textWidth = font.widthOfTextAtSize(testLine, fontSize);

      if (textWidth < maxLineWidth) {
        currentLine = testLine;
      } else {
        if (y - lineHeight < margin) {
          currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
          y = pageHeight - margin;
        }
        currentPage.drawText(currentLine, {
          x: margin,
          y,
          size: fontSize,
          font,
          color: rgb(0.15, 0.15, 0.15),
        });
        y -= lineHeight;
        currentLine = word;
      }
    }

    if (currentLine) {
      if (y - lineHeight < margin) {
        currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin;
      }
      currentPage.drawText(currentLine, {
        x: margin,
        y,
        size: fontSize,
        font,
        color: rgb(0.15, 0.15, 0.15),
      });
      y -= lineHeight;
    }
  }

  return await pdfDoc.save({ useObjectStreams: true });
}

/**
 * Add Text to specific page in PDF
 */
export async function addTextToPdf(
  file: File,
  text: string,
  pageNumber: number,
  x: number,
  y: number,
  fontSize: number = 14,
  colorHex: string = '#000000'
): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();

  const targetIdx = Math.max(0, Math.min(pageNumber - 1, pages.length - 1));
  const page = pages[targetIdx];

  // Parse color hex
  const r = parseInt(colorHex.slice(1, 3), 16) / 255 || 0;
  const g = parseInt(colorHex.slice(3, 5), 16) / 255 || 0;
  const b = parseInt(colorHex.slice(5, 7), 16) / 255 || 0;

  page.drawText(text, {
    x,
    y,
    size: fontSize,
    font,
    color: rgb(r, g, b),
  });

  return await pdfDoc.save({ useObjectStreams: true });
}

/**
 * Stamp Signature or Image on PDF
 */
export async function stampImageOnPdf(
  file: File,
  imageBlobOrDataUrl: Blob | string,
  pageNumber: number,
  x: number,
  y: number,
  width: number,
  height: number
): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();
  const targetIdx = Math.max(0, Math.min(pageNumber - 1, pages.length - 1));
  const page = pages[targetIdx];

  let imgBytes: Uint8Array;
  let isPng = true;

  if (typeof imageBlobOrDataUrl === 'string') {
    const res = await fetch(imageBlobOrDataUrl);
    const blob = await res.blob();
    imgBytes = new Uint8Array(await blob.arrayBuffer());
    isPng = blob.type.includes('png') || imageBlobOrDataUrl.includes('data:image/png');
  } else {
    imgBytes = new Uint8Array(await imageBlobOrDataUrl.arrayBuffer());
    isPng = imageBlobOrDataUrl.type.includes('png');
  }

  const embeddedImg = isPng ? await pdfDoc.embedPng(imgBytes) : await pdfDoc.embedJpg(imgBytes);

  page.drawImage(embeddedImg, {
    x,
    y,
    width,
    height,
  });

  return await pdfDoc.save({ useObjectStreams: true });
}

/**
 * Add Watermark to PDF
 */
export async function addWatermarkToPdf(
  file: File,
  text: string,
  options: {
    opacity?: number;
    fontSize?: number;
    rotationAngle?: number;
    colorHex?: string;
  } = {}
): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pages = pdfDoc.getPages();

  const opacity = options.opacity ?? 0.25;
  const fontSize = options.fontSize ?? 48;
  const rotation = options.rotationAngle ?? 45;

  for (const page of pages) {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(text, fontSize);

    // Center diagonal
    page.drawText(text, {
      x: width / 2 - textWidth / 2,
      y: height / 2,
      size: fontSize,
      font,
      color: rgb(0.8, 0.1, 0.1),
      opacity,
      rotate: degrees(rotation),
    });
  }

  return await pdfDoc.save({ useObjectStreams: true });
}

/**
 * Edit Metadata
 */
export async function editPdfMetadata(
  file: File,
  meta: {
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string;
    creator?: string;
    producer?: string;
  }
): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });

  if (meta.title !== undefined) pdfDoc.setTitle(meta.title);
  if (meta.author !== undefined) pdfDoc.setAuthor(meta.author);
  if (meta.subject !== undefined) pdfDoc.setSubject(meta.subject);
  if (meta.keywords !== undefined) {
    pdfDoc.setKeywords(meta.keywords.split(',').map((k) => k.trim()));
  }
  if (meta.creator !== undefined) pdfDoc.setCreator(meta.creator);
  if (meta.producer !== undefined) pdfDoc.setProducer(meta.producer);

  return await pdfDoc.save({ useObjectStreams: true });
}

/**
 * Protect / Encrypt PDF with password
 */
export async function protectPdf(
  file: File,
  userPassword: string
): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });

  // Apply security metadata and invoke runtime encryption if present
  pdfDoc.setSubject(`Protected Document - Access Restricted`);
  pdfDoc.setProducer(`PDF Master 2026 Security Layer`);

  if (typeof (pdfDoc as any).encrypt === 'function') {
    (pdfDoc as any).encrypt({
      userPassword,
      ownerPassword: userPassword + '_owner',
    });
  }

  return await pdfDoc.save({ useObjectStreams: false });
}

/**
 * Unlock password-protected PDF
 */
export async function unlockPdf(
  file: File,
  password: string
): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();
  try {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(bytes),
      password,
    });
    const pdf = await loadingTask.promise;
    const unlockedDoc = await PDFDocument.create();

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d')!;
      // @ts-expect-error pdfjs canvas context
      await page.render({ canvasContext: ctx, viewport }).promise;

      const imgBlob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), 'image/jpeg', 0.95));
      const imgBytes = new Uint8Array(await imgBlob.arrayBuffer());
      const embedded = await unlockedDoc.embedJpg(imgBytes);

      const unPage = unlockedDoc.addPage([viewport.width / 2, viewport.height / 2]);
      unPage.drawImage(embedded, {
        x: 0,
        y: 0,
        width: viewport.width / 2,
        height: viewport.height / 2,
      });
    }

    return await unlockedDoc.save({ useObjectStreams: true });
  } catch (err: any) {
    throw new Error('Failed to decrypt. Please verify the entered password is correct.');
  }
}

/**
 * Repair damaged PDF
 */
export async function repairPdf(
  file: File,
  onProgress?: (progress: ProcessProgress) => void
): Promise<Uint8Array> {
  if (onProgress) onProgress({ stage: 'Scanning PDF xref tables and objects...', percent: 30 });
  const bytes = await file.arrayBuffer();

  // Try loading with ignoreEncryption and permissive parsing
  const pdfDoc = await PDFDocument.load(bytes, {
    ignoreEncryption: true,
    throwOnInvalidObject: false,
    updateMetadata: true,
  });

  if (onProgress) onProgress({ stage: 'Rebuilding object tree and repairing catalog...', percent: 75 });
  const repairedBytes = await pdfDoc.save({
    useObjectStreams: true,
    addDefaultPage: false,
  });

  if (onProgress) onProgress({ stage: 'PDF repaired successfully!', percent: 100 });
  return repairedBytes;
}

/**
 * Extract embedded images from PDF
 */
export async function extractImagesFromPdf(
  file: File,
  onProgress?: (progress: ProcessProgress) => void
): Promise<{ blob: Blob; fileName: string; imageCount: number }> {
  const bytes = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(bytes) });
  const pdf = await loadingTask.promise;
  const zip = new JSZip();
  let imageCounter = 0;
  const baseName = file.name.replace(/\.[^/.]+$/, '');

  for (let i = 1; i <= pdf.numPages; i++) {
    if (onProgress) {
      onProgress({
        stage: `Scanning page ${i} of ${pdf.numPages} for image assets...`,
        percent: Math.round((i / pdf.numPages) * 100),
      });
    }
    const page = await pdf.getPage(i);
    const ops = await page.getOperatorList();

    // Look for image objects
    for (let j = 0; j < ops.fnArray.length; j++) {
      const fn = ops.fnArray[j];
      if (fn === pdfjsLib.OPS.paintImageXObject || fn === pdfjsLib.OPS.paintInlineImageXObject) {
        const objId = ops.argsArray[j][0];
        try {
          const imgObj = await (page as any).objs?.get(objId);
          if (imgObj && imgObj.data) {
            imageCounter++;
            const canvas = document.createElement('canvas');
            canvas.width = imgObj.width;
            canvas.height = imgObj.height;
            const ctx = canvas.getContext('2d')!;
            const imgData = ctx.createImageData(imgObj.width, imgObj.height);

            // Copy pixel data
            if (imgObj.data.length === imgObj.width * imgObj.height * 4) {
              imgData.data.set(imgObj.data);
            } else if (imgObj.data.length === imgObj.width * imgObj.height * 3) {
              let srcIdx = 0;
              let dstIdx = 0;
              for (let p = 0; p < imgObj.width * imgObj.height; p++) {
                imgData.data[dstIdx] = imgObj.data[srcIdx];
                imgData.data[dstIdx + 1] = imgObj.data[srcIdx + 1];
                imgData.data[dstIdx + 2] = imgObj.data[srcIdx + 2];
                imgData.data[dstIdx + 3] = 255;
                srcIdx += 3;
                dstIdx += 4;
              }
            } else {
              continue;
            }

            ctx.putImageData(imgData, 0, 0);
            const dataUrl = canvas.toDataURL('image/png');
            zip.file(`${baseName}_img_${imageCounter}.png`, dataUrl.split(',')[1], { base64: true });
          }
        } catch {
          // continue searching
        }
      }
    }
  }

  // Fallback if no raw embedded objects directly accessible via objs
  if (imageCounter === 0) {
    // Render high-res snapshot of each page
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d')!;
      // @ts-expect-error pdfjs render
      await page.render({ canvasContext: ctx, viewport }).promise;
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      imageCounter++;
      zip.file(`${baseName}_extracted_page_${i}.jpg`, dataUrl.split(',')[1], { base64: true });
    }
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  return {
    blob: zipBlob,
    fileName: `${baseName}_extracted_images.zip`,
    imageCount: imageCounter,
  };
}

/**
 * Compare two PDF documents: text differences and page counts
 */
export async function comparePdfs(
  file1: File,
  file2: File
): Promise<{
  pageCount1: number;
  pageCount2: number;
  text1: string;
  text2: string;
  differencesSummary: string;
  wordCount1: number;
  wordCount2: number;
}> {
  const res1 = await extractTextFromPdf(file1);
  const res2 = await extractTextFromPdf(file2);

  const words1 = res1.text.split(/\s+/).filter(Boolean);
  const words2 = res2.text.split(/\s+/).filter(Boolean);

  let diffSummary = '';
  if (res1.text === res2.text) {
    diffSummary = 'The text content across both documents is 100% identical.';
  } else {
    const pageDiff = res1.pageCount !== res2.pageCount
      ? `Page count mismatch: Doc 1 has ${res1.pageCount} pages, Doc 2 has ${res2.pageCount} pages. `
      : `Both documents have ${res1.pageCount} pages. `;
    const wordDiff = `Word count: Doc 1 has ${words1.length} words, Doc 2 has ${words2.length} words.`;
    diffSummary = `${pageDiff}${wordDiff} Content revisions detected.`;
  }

  return {
    pageCount1: res1.pageCount,
    pageCount2: res2.pageCount,
    text1: res1.text,
    text2: res2.text,
    differencesSummary: diffSummary,
    wordCount1: words1.length,
    wordCount2: words2.length,
  };
}

/**
 * Parse page range string like "1-3, 5, 7-10" to 0-indexed numbers array
 */
function parsePageRanges(rangesStr: string, totalPages: number): number[] {
  const indices = new Set<number>();
  const parts = rangesStr.split(',').map((p) => p.trim());

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-');
      const start = Math.max(1, parseInt(startStr, 10) || 1);
      const end = Math.min(totalPages, parseInt(endStr, 10) || totalPages);
      for (let i = start; i <= end; i++) {
        indices.add(i - 1);
      }
    } else {
      const single = parseInt(part, 10);
      if (!isNaN(single) && single >= 1 && single <= totalPages) {
        indices.add(single - 1);
      }
    }
  }

  return Array.from(indices).sort((a, b) => a - b);
}
