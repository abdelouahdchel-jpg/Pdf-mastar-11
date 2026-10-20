import { extractTextFromPdf } from './pdfService';

/**
 * Generate Word compatible .docx / .doc file from PDF text content
 */
export async function convertPdfToWord(
  file: File,
  onProgress?: (progress: { stage: string; percent: number }) => void
): Promise<{ blob: Blob; fileName: string }> {
  if (onProgress) onProgress({ stage: 'Extracting PDF structure and paragraphs...', percent: 40 });
  const { text } = await extractTextFromPdf(file);

  if (onProgress) onProgress({ stage: 'Formatting Word document structure...', percent: 80 });

  // Convert plain text into rich Word document XML / HTML compatible format
  const paragraphs = text
    .split('\n')
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return '<p style="margin: 0 0 12pt 0;">&nbsp;</p>';
      if (trimmed.startsWith('--- Page')) {
        return `<div style="page-break-before: always; border-bottom: 2px solid #dc2626; margin: 24pt 0 12pt 0; padding-bottom: 4pt; font-weight: bold; color: #dc2626; font-size: 13pt;">${trimmed}</div>`;
      }
      return `<p style="margin: 0 0 10pt 0; line-height: 1.5; font-size: 11pt; font-family: 'Calibri', Arial, sans-serif; color: #222222;">${escapeHtml(trimmed)}</p>`;
    })
    .join('');

  const wordHtmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${escapeHtml(file.name)}</title>
      <style>
        @page Section1 {size: 595.3pt 841.9pt; margin: 70.85pt 70.85pt 70.85pt 70.85pt; mso-header-margin: 35.4pt; mso-footer-margin: 35.4pt;}
        div.Section1 {page: Section1;}
        body { font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #333333; line-height: 1.4; }
      </style>
    </head>
    <body>
      <div class="Section1">
        <h1 style="color: #1e293b; font-size: 20pt; margin-bottom: 16pt;">${escapeHtml(file.name.replace(/\.[^/.]+$/, ''))}</h1>
        ${paragraphs}
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', wordHtmlContent], {
    type: 'application/msword;charset=utf-8',
  });
  const baseName = file.name.replace(/\.[^/.]+$/, '');

  return { blob, fileName: `${baseName}_converted.doc` };
}

/**
 * Generate CSV / Excel table from PDF text
 */
export async function convertPdfToExcel(
  file: File,
  onProgress?: (progress: { stage: string; percent: number }) => void
): Promise<{ blob: Blob; fileName: string }> {
  if (onProgress) onProgress({ stage: 'Scanning PDF text and table delimiters...', percent: 45 });
  const { text } = await extractTextFromPdf(file);

  if (onProgress) onProgress({ stage: 'Formatting rows and columns for spreadsheet...', percent: 85 });

  const lines = text.split('\n');
  const csvRows: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Detect multiple spaces or tabs as column delimiters
    const columns = trimmed.split(/\t|\s{2,}/);
    const escapedCols = columns.map((col) => `"${col.replace(/"/g, '""').trim()}"`);
    csvRows.push(escapedCols.join(','));
  }

  const csvContent = '\ufeff' + csvRows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const baseName = file.name.replace(/\.[^/.]+$/, '');

  return { blob, fileName: `${baseName}_data.csv` };
}

/**
 * Convert PDF to standalone HTML web page
 */
export async function convertPdfToHtml(
  file: File,
  onProgress?: (progress: { stage: string; percent: number }) => void
): Promise<{ blob: Blob; fileName: string }> {
  if (onProgress) onProgress({ stage: 'Extracting content layout...', percent: 50 });
  const { text } = await extractTextFromPdf(file);

  const baseName = file.name.replace(/\.[^/.]+$/, '');
  const paragraphs = text
    .split('\n\n')
    .map((block) => `<p style="margin-bottom: 1em; line-height: 1.6;">${escapeHtml(block).replace(/\n/g, '<br/>')}</p>`)
    .join('');

  const htmlDoc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(baseName)}</title>
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 0 20px;
      color: #1e293b;
      background-color: #f8fafc;
    }
    .document-card {
      background: #ffffff;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
      border: 1px solid #e2e8f0;
    }
    h1 { color: #dc2626; font-size: 24px; border-bottom: 2px solid #fee2e2; padding-bottom: 12px; }
    p { font-size: 15px; }
  </style>
</head>
<body>
  <div class="document-card">
    <h1>${escapeHtml(baseName)}</h1>
    ${paragraphs}
  </div>
</body>
</html>`;

  const blob = new Blob([htmlDoc], { type: 'text/html;charset=utf-8' });
  return { blob, fileName: `${baseName}.html` };
}

/**
 * Convert PDF to PowerPoint Slide Deck representation (.html slides)
 */
export async function convertPdfToPowerPoint(
  file: File,
  onProgress?: (progress: { stage: string; percent: number }) => void
): Promise<{ blob: Blob; fileName: string }> {
  if (onProgress) onProgress({ stage: 'Generating presentation slides...', percent: 50 });
  const { text } = await extractTextFromPdf(file);
  const baseName = file.name.replace(/\.[^/.]+$/, '');

  const pages = text.split(/--- Page \d+ ---/).filter((p) => p.trim());
  const slidesHtml = pages
    .map((content, idx) => {
      const lines = content.trim().split('\n').filter(Boolean);
      const title = lines[0] || `Slide ${idx + 1}`;
      const bullets = lines.slice(1, 8);

      return `
      <section class="slide">
        <div class="slide-header">
          <span class="slide-num">Slide ${idx + 1}</span>
          <h2>${escapeHtml(title)}</h2>
        </div>
        <div class="slide-body">
          <ul>
            ${bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join('')}
          </ul>
        </div>
      </section>
    `;
    })
    .join('');

  const presentationHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(baseName)} - Presentation</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #0f172a; margin: 0; padding: 40px 20px; display: flex; flex-direction: column; align-items: center; gap: 30px; }
    .slide { width: 900px; max-width: 95vw; aspect-ratio: 16 / 9; background: white; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.3); padding: 40px 50px; box-sizing: border-box; display: flex; flex-direction: column; }
    .slide-header { border-bottom: 3px solid #dc2626; padding-bottom: 12px; margin-bottom: 24px; position: relative; }
    .slide-num { font-size: 12px; text-transform: uppercase; color: #dc2626; font-weight: bold; }
    h2 { margin: 6px 0 0; color: #1e293b; font-size: 24px; }
    .slide-body { flex: 1; font-size: 18px; color: #334155; line-height: 1.6; }
    ul { padding-left: 24px; }
    li { margin-bottom: 12px; }
  </style>
</head>
<body>
  ${slidesHtml}
</body>
</html>`;

  const blob = new Blob([presentationHtml], { type: 'text/html;charset=utf-8' });
  return { blob, fileName: `${baseName}_presentation.html` };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
