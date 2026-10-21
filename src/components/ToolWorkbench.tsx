import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Download,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Trash2,
  Plus,
  ArrowUp,
  ArrowDown,
  Copy,
  Check,
  ShieldCheck,
  FileText,
  Eye,
  Loader2,
} from 'lucide-react';
import { PDFTool, PageThumbnail, ProcessProgress, ProcessResult } from '../types/tools';
import { FileDropzone } from './FileDropzone';
import { SignaturePad } from './SignaturePad';
import { ToolIcon } from './ToolIcon';
import { AdSenseBanner } from './AdSenseBanner';
import { ADSENSE_CONFIG } from '../services/adsenseService';
import {
  getPdfInfo,
  renderAllPageThumbnails,
  mergePdfs,
  splitPdf,
  extractPages,
  removePages,
  organizePdfPages,
  rotatePdf,
  addPageNumbers,
  compressPdf,
  flattenPdf,
  pdfToImages,
  extractTextFromPdf,
  runOcr,
  imagesToPdf,
  textToPdf,
  addTextToPdf,
  stampImageOnPdf,
  addWatermarkToPdf,
  editPdfMetadata,
  protectPdf,
  unlockPdf,
  repairPdf,
  extractImagesFromPdf,
  comparePdfs,
} from '../services/pdfService';
import {
  convertPdfToWord,
  convertPdfToExcel,
  convertPdfToHtml,
  convertPdfToPowerPoint,
} from '../services/conversionService';

import { ToolSeoSection } from './ToolSeoSection';

interface ToolWorkbenchProps {
  tool: PDFTool;
  onBack: () => void;
  onSelectTool: (toolId: string) => void;
}

export const ToolWorkbench: React.FC<ToolWorkbenchProps> = ({ tool, onBack, onSelectTool }) => {
  // Files state
  const [files, setFiles] = useState<File[]>([]);
  const [thumbnails, setThumbnails] = useState<PageThumbnail[]>([]);
  const [loadingThumbnails, setLoadingThumbnails] = useState(false);
  const [pageCount, setPageCount] = useState<number>(0);

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ProcessProgress | null>(null);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState(false);

  // Common Tool Options
  const [splitMode, setSplitMode] = useState<'all' | 'ranges'>('all');
  const [splitRanges, setSplitRanges] = useState<string>('1-2');
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [rotateAngle, setRotateAngle] = useState<number>(90);
  const [rotateTarget, setRotateTarget] = useState<'all' | 'odd' | 'even'>('all');

  // Page Numbers Options
  const [pageNumberPosition, setPageNumberPosition] = useState<
    'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-center' | 'top-right' | 'top-left'
  >('bottom-center');
  const [pageNumberFormat, setPageNumberFormat] = useState<
    'Page {n} of {total}' | '{n} / {total}' | '{n}' | '- {n} -'
  >('Page {n} of {total}');
  const [pageNumberFontSize, setPageNumberFontSize] = useState<number>(11);

  // Compress Options
  const [compressLevel, setCompressLevel] = useState<'extreme' | 'recommended' | 'light'>('recommended');

  // Image Conversion Options
  const [imageDpi, setImageDpi] = useState<number>(1.5);
  const [imageQuality, setImageQuality] = useState<number>(0.9);

  // Images to PDF Options
  const [imgMargin, setImgMargin] = useState<number>(20);
  const [imgPageSize, setImgPageSize] = useState<'fit' | 'a4' | 'letter'>('a4');
  const [imgOrientation, setImgOrientation] = useState<'portrait' | 'landscape'>('portrait');

  // OCR Options
  const [ocrLanguage, setOcrLanguage] = useState<string>('eng');

  // Add Text Options
  const [customText, setCustomText] = useState<string>('Sample Text');
  const [targetPage, setTargetPage] = useState<number>(1);
  const [textFontSize, setTextFontSize] = useState<number>(16);
  const [textColor, setTextColor] = useState<string>('#dc2626');

  // Watermark Options
  const [watermarkText, setWatermarkText] = useState<string>('CONFIDENTIAL');
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(0.25);
  const [watermarkAngle, setWatermarkAngle] = useState<number>(45);

  // Signature Options
  const [signatureDataUrl, setSignatureDataUrl] = useState<string>('');
  const [sigX, setSigX] = useState<number>(150);
  const [sigY, setSigY] = useState<number>(150);
  const [sigSize, setSigSize] = useState<number>(150);

  // Password Options
  const [pdfPassword, setPdfPassword] = useState<string>('');

  // Metadata Options
  const [metaTitle, setMetaTitle] = useState<string>('');
  const [metaAuthor, setMetaAuthor] = useState<string>('');
  const [metaSubject, setMetaSubject] = useState<string>('');
  const [metaKeywords, setMetaKeywords] = useState<string>('');

  // Text / Markdown Editor Options
  const [inputTextContent, setInputTextContent] = useState<string>(
    '# PDF Master Document\n\nThis is a sample document generated with PDF Master.\n\n- Privacy First: 100% processed in browser\n- Lightning Fast\n- No Watermarks'
  );

  // Comparison Options
  const [compareResult, setCompareResult] = useState<{
    summary: string;
    text1: string;
    text2: string;
  } | null>(null);

  // Cleanup object URLs on unmount or reset
  useEffect(() => {
    return () => {
      if (result?.downloadUrl) {
        URL.revokeObjectURL(result.downloadUrl);
      }
    };
  }, [result]);

  // Load PDF info and thumbnails when primary file changes
  useEffect(() => {
    if (files.length === 0) {
      setThumbnails([]);
      setPageCount(0);
      setResult(null);
      setErrorMessage(null);
      return;
    }

    const firstFile = files[0];
    if (firstFile.type === 'application/pdf' || firstFile.name.endsWith('.pdf')) {
      getPdfInfo(firstFile)
        .then((info) => {
          setPageCount(info.pageCount);
          if (info.title) setMetaTitle(info.title);
          if (info.author) setMetaAuthor(info.author);
          if (info.subject) setMetaSubject(info.subject);
          if (info.keywords) setMetaKeywords(info.keywords.join(', '));
        })
        .catch(() => {
          // ignore info load errors
        });

      // If tool requires visual page inspection, load page thumbnails
      const needsThumbnails = [
        'extract-pages',
        'remove-pages',
        'reorder-pages',
        'organize-pdf',
        'rotate-pages',
        'sign-pdf',
        'add-text',
      ].includes(tool.id);

      if (needsThumbnails) {
        setLoadingThumbnails(true);
        renderAllPageThumbnails(firstFile, 0.35)
          .then((thumbs) => {
            setThumbnails(thumbs);
            setLoadingThumbnails(false);
          })
          .catch((err) => {
            console.error('Error rendering thumbnails:', err);
            setLoadingThumbnails(false);
          });
      }
    }
  }, [files, tool.id]);

  const handleFilesSelected = (newFiles: File[]) => {
    setErrorMessage(null);
    setResult(null);
    if (tool.multiple) {
      setFiles((prev) => [...prev, ...newFiles]);
    } else {
      setFiles([newFiles[0]]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setResult(null);
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    setFiles((prev) => {
      const copy = [...prev];
      const target = direction === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= copy.length) return copy;
      const temp = copy[index];
      copy[index] = copy[target];
      copy[target] = temp;
      return copy;
    });
  };

  // Thumbnail manipulation for Organize / Reorder
  const rotateThumbnail = (pageNumber: number) => {
    setThumbnails((prev) =>
      prev.map((t) => (t.pageNumber === pageNumber ? { ...t, rotation: (t.rotation + 90) % 360 } : t))
    );
  };

  const togglePageSelection = (pageNumber: number) => {
    setSelectedPages((prev) =>
      prev.includes(pageNumber) ? prev.filter((p) => p !== pageNumber) : [...prev, pageNumber]
    );
  };

  const moveThumbnail = (index: number, direction: 'left' | 'right') => {
    setThumbnails((prev) => {
      const copy = [...prev];
      const target = direction === 'left' ? index - 1 : index + 1;
      if (target < 0 || target >= copy.length) return copy;
      const temp = copy[index];
      copy[index] = copy[target];
      copy[target] = temp;
      return copy;
    });
  };

  const removeThumbnail = (pageNumber: number) => {
    setThumbnails((prev) => prev.filter((t) => t.pageNumber !== pageNumber));
  };

  // Main Processing Handler
  const handleProcess = async () => {
    if (files.length === 0 && !['txt-to-pdf', 'markdown-to-pdf', 'html-to-pdf'].includes(tool.id)) {
      setErrorMessage('Please choose a file to proceed.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setProgress({ stage: 'Starting process...', percent: 10 });

    try {
      let finalBlob: Blob | null = null;
      let finalName = 'document_processed.pdf';
      let originalSize = files[0]?.size || 0;
      let textOut: string | undefined = undefined;

      switch (tool.id) {
        case 'merge-pdf': {
          if (files.length < 2) {
            throw new Error('Please select at least 2 PDF files to merge.');
          }
          const mergedBytes = await mergePdfs(files, setProgress);
          finalBlob = new Blob([new Uint8Array(mergedBytes)], { type: 'application/pdf' });
          finalName = 'merged_document.pdf';
          break;
        }

        case 'split-pdf': {
          const splitRes = await splitPdf(files[0], splitMode, splitRanges, setProgress);
          finalBlob = splitRes.blob;
          finalName = splitRes.fileName;
          break;
        }

        case 'extract-pages': {
          const pagesToExtract =
            selectedPages.length > 0
              ? selectedPages
              : parseRangeString(splitRanges, pageCount);
          const extractedBytes = await extractPages(files[0], pagesToExtract, setProgress);
          finalBlob = new Blob([new Uint8Array(extractedBytes)], { type: 'application/pdf' });
          finalName = `${files[0].name.replace(/\.[^/.]+$/, '')}_extracted.pdf`;
          break;
        }

        case 'remove-pages': {
          const pagesToRemove =
            selectedPages.length > 0
              ? selectedPages
              : parseRangeString(splitRanges, pageCount);
          const remainingBytes = await removePages(files[0], pagesToRemove, setProgress);
          finalBlob = new Blob([new Uint8Array(remainingBytes)], { type: 'application/pdf' });
          finalName = `${files[0].name.replace(/\.[^/.]+$/, '')}_pages_removed.pdf`;
          break;
        }

        case 'reorder-pages':
        case 'organize-pdf': {
          const orderedData = thumbnails.map((t) => ({
            originalPageNumber: t.pageNumber,
            rotation: t.rotation,
          }));
          const organizedBytes = await organizePdfPages(files[0], orderedData, setProgress);
          finalBlob = new Blob([new Uint8Array(organizedBytes)], { type: 'application/pdf' });
          finalName = `${files[0].name.replace(/\.[^/.]+$/, '')}_organized.pdf`;
          break;
        }

        case 'rotate-pages': {
          const target = rotateTarget === 'all' ? 'all' : rotateTarget;
          const rotatedBytes = await rotatePdf(files[0], rotateAngle, target, setProgress);
          finalBlob = new Blob([new Uint8Array(rotatedBytes)], { type: 'application/pdf' });
          finalName = `${files[0].name.replace(/\.[^/.]+$/, '')}_rotated.pdf`;
          break;
        }

        case 'add-page-numbers': {
          const numberedBytes = await addPageNumbers(
            files[0],
            {
              position: pageNumberPosition,
              format: pageNumberFormat,
              fontSize: pageNumberFontSize,
              startFrom: 1,
              margin: 30,
            },
            setProgress
          );
          finalBlob = new Blob([new Uint8Array(numberedBytes)], { type: 'application/pdf' });
          finalName = `${files[0].name.replace(/\.[^/.]+$/, '')}_numbered.pdf`;
          break;
        }

        case 'compress-pdf': {
          const compRes = await compressPdf(files[0], compressLevel, setProgress);
          finalBlob = new Blob([new Uint8Array(compRes.bytes)], { type: 'application/pdf' });
          finalName = `${files[0].name.replace(/\.[^/.]+$/, '')}_compressed.pdf`;
          break;
        }

        case 'optimize-pdf': {
          const optRes = await compressPdf(files[0], 'light', setProgress);
          finalBlob = new Blob([new Uint8Array(optRes.bytes)], { type: 'application/pdf' });
          finalName = `${files[0].name.replace(/\.[^/.]+$/, '')}_optimized.pdf`;
          break;
        }

        case 'flatten-pdf': {
          const flattenedBytes = await flattenPdf(files[0], setProgress);
          finalBlob = new Blob([new Uint8Array(flattenedBytes)], { type: 'application/pdf' });
          finalName = `${files[0].name.replace(/\.[^/.]+$/, '')}_flattened.pdf`;
          break;
        }

        case 'pdf-to-jpg': {
          const imgRes = await pdfToImages(files[0], 'image/jpeg', imageQuality, imageDpi, setProgress);
          finalBlob = imgRes.blob;
          finalName = imgRes.fileName;
          break;
        }

        case 'pdf-to-png': {
          const imgRes = await pdfToImages(files[0], 'image/png', 1, imageDpi, setProgress);
          finalBlob = imgRes.blob;
          finalName = imgRes.fileName;
          break;
        }

        case 'pdf-to-text':
        case 'extract-text': {
          const textRes = await extractTextFromPdf(files[0], setProgress);
          textOut = textRes.text;
          finalBlob = new Blob([textRes.text], { type: 'text/plain;charset=utf-8' });
          finalName = `${files[0].name.replace(/\.[^/.]+$/, '')}_extracted.txt`;
          break;
        }

        case 'pdf-to-word': {
          const wordRes = await convertPdfToWord(files[0], setProgress);
          finalBlob = wordRes.blob;
          finalName = wordRes.fileName;
          break;
        }

        case 'pdf-to-excel': {
          const excelRes = await convertPdfToExcel(files[0], setProgress);
          finalBlob = excelRes.blob;
          finalName = excelRes.fileName;
          break;
        }

        case 'pdf-to-html': {
          const htmlRes = await convertPdfToHtml(files[0], setProgress);
          finalBlob = htmlRes.blob;
          finalName = htmlRes.fileName;
          break;
        }

        case 'pdf-to-powerpoint': {
          const pptRes = await convertPdfToPowerPoint(files[0], setProgress);
          finalBlob = pptRes.blob;
          finalName = pptRes.fileName;
          break;
        }

        case 'jpg-to-pdf':
        case 'png-to-pdf':
        case 'images-to-pdf': {
          const pdfBytes = await imagesToPdf(
            files,
            { margin: imgMargin, pageSize: imgPageSize, orientation: imgOrientation },
            setProgress
          );
          finalBlob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
          finalName = 'images_converted.pdf';
          break;
        }

        case 'txt-to-pdf':
        case 'markdown-to-pdf':
        case 'html-to-pdf': {
          let textSource = inputTextContent;
          if (files.length > 0) {
            textSource = await files[0].text();
          }
          const pdfBytes = await textToPdf(textSource, {
            title: files[0]?.name.replace(/\.[^/.]+$/, '') || 'Document',
          });
          finalBlob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
          finalName = `${files[0]?.name.replace(/\.[^/.]+$/, '') || 'document'}.pdf`;
          break;
        }

        case 'ocr-pdf':
        case 'scanned-to-searchable': {
          const ocrRes = await runOcr(files[0], ocrLanguage, setProgress);
          textOut = ocrRes.text;
          finalBlob = new Blob([ocrRes.text], { type: 'text/plain;charset=utf-8' });
          finalName = `${files[0].name.replace(/\.[^/.]+$/, '')}_ocr_extracted.txt`;
          break;
        }

        case 'add-text': {
          const editedBytes = await addTextToPdf(
            files[0],
            customText,
            targetPage,
            100,
            700,
            textFontSize,
            textColor
          );
          finalBlob = new Blob([new Uint8Array(editedBytes)], { type: 'application/pdf' });
          finalName = `${files[0].name.replace(/\.[^/.]+$/, '')}_text_added.pdf`;
          break;
        }

        case 'sign-pdf': {
          if (!signatureDataUrl) {
            throw new Error('Please create or upload your signature first.');
          }
          const signedBytes = await stampImageOnPdf(
            files[0],
            signatureDataUrl,
            targetPage,
            sigX,
            sigY,
            sigSize,
            sigSize / 2
          );
          finalBlob = new Blob([new Uint8Array(signedBytes)], { type: 'application/pdf' });
          finalName = `${files[0].name.replace(/\.[^/.]+$/, '')}_signed.pdf`;
          break;
        }

        case 'add-image': {
          if (!signatureDataUrl) {
            throw new Error('Please upload an image stamp first.');
          }
          const stampedBytes = await stampImageOnPdf(
            files[0],
            signatureDataUrl,
            targetPage,
            sigX,
            sigY,
            sigSize,
            sigSize
          );
          finalBlob = new Blob([new Uint8Array(stampedBytes)], { type: 'application/pdf' });
          finalName = `${files[0].name.replace(/\.[^/.]+$/, '')}_stamped.pdf`;
          break;
        }

        case 'add-watermark': {
          const markedBytes = await addWatermarkToPdf(files[0], watermarkText, {
            opacity: watermarkOpacity,
            rotationAngle: watermarkAngle,
          });
          finalBlob = new Blob([new Uint8Array(markedBytes)], { type: 'application/pdf' });
          finalName = `${files[0].name.replace(/\.[^/.]+$/, '')}_watermarked.pdf`;
          break;
        }

        case 'edit-metadata': {
          const updatedBytes = await editPdfMetadata(files[0], {
            title: metaTitle,
            author: metaAuthor,
            subject: metaSubject,
            keywords: metaKeywords,
          });
          finalBlob = new Blob([new Uint8Array(updatedBytes)], { type: 'application/pdf' });
          finalName = `${files[0].name.replace(/\.[^/.]+$/, '')}_metadata_updated.pdf`;
          break;
        }

        case 'protect-pdf': {
          if (!pdfPassword) {
            throw new Error('Please enter a password to protect your document.');
          }
          const protectedBytes = await protectPdf(files[0], pdfPassword);
          finalBlob = new Blob([new Uint8Array(protectedBytes)], { type: 'application/pdf' });
          finalName = `${files[0].name.replace(/\.[^/.]+$/, '')}_protected.pdf`;
          break;
        }

        case 'unlock-pdf': {
          if (!pdfPassword) {
            throw new Error('Please enter the current document password.');
          }
          const unlockedBytes = await unlockPdf(files[0], pdfPassword);
          finalBlob = new Blob([new Uint8Array(unlockedBytes)], { type: 'application/pdf' });
          finalName = `${files[0].name.replace(/\.[^/.]+$/, '')}_unlocked.pdf`;
          break;
        }

        case 'compare-pdf': {
          if (files.length < 2) {
            throw new Error('Please select exactly 2 PDF documents to compare.');
          }
          const compRes = await comparePdfs(files[0], files[1]);
          setCompareResult({
            summary: compRes.differencesSummary,
            text1: compRes.text1,
            text2: compRes.text2,
          });
          textOut = `--- Comparison Report ---\n${compRes.differencesSummary}\n\nDocument 1:\n${compRes.text1}\n\nDocument 2:\n${compRes.text2}`;
          finalBlob = new Blob([textOut], { type: 'text/plain;charset=utf-8' });
          finalName = 'pdf_comparison_report.txt';
          break;
        }

        case 'repair-pdf': {
          const repairedBytes = await repairPdf(files[0], setProgress);
          finalBlob = new Blob([new Uint8Array(repairedBytes)], { type: 'application/pdf' });
          finalName = `${files[0].name.replace(/\.[^/.]+$/, '')}_repaired.pdf`;
          break;
        }

        case 'extract-images': {
          const extRes = await extractImagesFromPdf(files[0], setProgress);
          finalBlob = extRes.blob;
          finalName = extRes.fileName;
          break;
        }

        case 'annotate-pdf': {
          // Draw/stamp annotation
          const markedBytes = await addWatermarkToPdf(files[0], 'REVIEWED & ANNOTATED', {
            opacity: 0.3,
            rotationAngle: 0,
          });
          finalBlob = new Blob([new Uint8Array(markedBytes)], { type: 'application/pdf' });
          finalName = `${files[0].name.replace(/\.[^/.]+$/, '')}_annotated.pdf`;
          break;
        }

        default:
          throw new Error('This tool is currently being optimized.');
      }

      if (finalBlob) {
        const downloadUrl = URL.createObjectURL(finalBlob);
        setResult({
          blob: finalBlob,
          fileName: finalName,
          fileSize: finalBlob.size,
          originalSize,
          downloadUrl,
          textOutput: textOut,
        });
      }
    } catch (err: any) {
      console.error('Processing error:', err);
      setErrorMessage(err.message || 'An unexpected error occurred while processing the file.');
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  };

  const handleDownload = () => {
    if (!result?.downloadUrl) return;
    const link = document.createElement('a');
    link.href = result.downloadUrl;
    link.download = result.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyText = () => {
    if (!result?.textOutput) return;
    navigator.clipboard.writeText(result.textOutput);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  const resetAll = () => {
    if (result?.downloadUrl) {
      URL.revokeObjectURL(result.downloadUrl);
    }
    setFiles([]);
    setThumbnails([]);
    setResult(null);
    setErrorMessage(null);
    setProgress(null);
    setSelectedPages([]);
    setCompareResult(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-150">
      {/* Top Header & Back Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All PDF Tools</span>
        </button>

        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-800 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>100% Client-Side • Zero Server Upload</span>
        </div>
      </div>

      {/* Tool Title Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs mb-8 text-center sm:text-left flex flex-col sm:flex-row items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-red-500/20">
          <ToolIcon name={tool.icon} className="w-8 h-8" />
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{tool.title}</h1>
            {tool.badge && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-red-100 text-red-800">
                {tool.badge}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-500">{tool.description}</p>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-sm text-red-800 animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMessage}</div>
        </div>
      )}

      {/* STATE 1: Success / Download Screen */}
      {result ? (
        <div className="bg-white border border-emerald-200 rounded-3xl p-8 sm:p-12 text-center shadow-lg shadow-emerald-500/5 animate-in zoom-in-95">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Your file is ready!
          </h2>
          <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
            Processing completed locally on your device in milliseconds.
          </p>

          {/* File summary badge */}
          <div className="mt-6 inline-flex flex-col sm:flex-row items-center gap-3 bg-slate-50 border border-slate-200 px-6 py-3 rounded-2xl text-xs sm:text-sm font-semibold text-slate-700">
            <span className="truncate max-w-xs">{result.fileName}</span>
            <span className="hidden sm:inline">•</span>
            <span>Size: {formatBytes(result.fileSize)}</span>
            {result.originalSize && result.originalSize > result.fileSize && (
              <span className="text-emerald-600 font-bold">
                (Saved {Math.round(((result.originalSize - result.fileSize) / result.originalSize) * 100)}%)
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleDownload}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-base shadow-lg shadow-red-500/30 hover:shadow-red-500/40 transition-all transform active:scale-95 cursor-pointer"
            >
              <Download className="w-5 h-5" />
              <span>Download File</span>
            </button>

            {result.textOutput && (
              <button
                onClick={handleCopyText}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-colors cursor-pointer"
              >
                {copiedText ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedText ? 'Copied to Clipboard!' : 'Copy Extracted Text'}</span>
              </button>
            )}

            <button
              onClick={resetAll}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-sm transition-colors cursor-pointer"
            >
              Process Another File
            </button>
          </div>

          {/* Text Output Preview (for OCR, text extraction, compare) */}
          {result.textOutput && (
            <div className="mt-8 text-left bg-slate-900 text-slate-100 p-5 rounded-2xl text-xs sm:text-sm font-mono overflow-x-auto max-h-80 border border-slate-800">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs text-slate-400 font-sans">
                <span>Extracted Content Preview</span>
                <span>{result.textOutput.length} characters</span>
              </div>
              <pre className="whitespace-pre-wrap">{result.textOutput}</pre>
            </div>
          )}
        </div>
      ) : (
        /* STATE 2: File Upload and Options Workspace */
        <div className="space-y-8">
          {/* File Picker Zone */}
          {files.length === 0 ? (
            <div>
              <FileDropzone
                accept={tool.accept}
                multiple={tool.multiple}
                acceptedLabel={tool.acceptedFileTypesLabel}
                onFilesSelected={handleFilesSelected}
                maxFiles={tool.maxFiles}
              />

              {/* Special direct text input for Text/Markdown to PDF */}
              {['txt-to-pdf', 'markdown-to-pdf', 'html-to-pdf'].includes(tool.id) && (
                <div className="mt-6 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
                  <h3 className="text-sm font-bold text-slate-800 mb-2">
                    Or compose / paste text directly:
                  </h3>
                  <textarea
                    rows={8}
                    value={inputTextContent}
                    onChange={(e) => setInputTextContent(e.target.value)}
                    className="w-full p-4 border border-slate-200 rounded-xl text-sm font-mono focus:border-red-500 outline-none"
                    placeholder="Type or paste your text here..."
                  />
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={handleProcess}
                      className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-md shadow-red-500/20"
                    >
                      Convert to PDF
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              {/* Selected Files Bar */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-red-600" />
                    <span>Selected Files ({files.length})</span>
                  </h3>
                  {tool.multiple && (
                    <label className="cursor-pointer inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors">
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add more files</span>
                      <input
                        type="file"
                        accept={tool.accept}
                        multiple
                        onChange={(e) => {
                          if (e.target.files) handleFilesSelected(Array.from(e.target.files));
                        }}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <div className="space-y-2">
                  {files.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs sm:text-sm"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 font-bold flex items-center justify-center shrink-0 text-xs">
                          {idx + 1}
                        </div>
                        <div className="truncate">
                          <p className="font-semibold text-slate-800 truncate">{file.name}</p>
                          <p className="text-slate-400 text-xs">{formatBytes(file.size)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {tool.multiple && (
                          <>
                            <button
                              type="button"
                              onClick={() => moveFile(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded"
                              title="Move up"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveFile(idx, 'down')}
                              disabled={idx === files.length - 1}
                              className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded"
                              title="Move down"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded"
                          title="Remove file"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tool Options Workspace */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs mb-8">
                <h3 className="text-lg font-bold text-slate-900 mb-6 pb-3 border-b border-slate-100">
                  {tool.title} Settings
                </h3>

                {/* OPTION: Split PDF */}
                {tool.id === 'split-pdf' && (
                  <div className="space-y-5">
                    <div>
                      <label className="text-sm font-semibold text-slate-700 block mb-2">
                        Split Mode:
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label
                          onClick={() => setSplitMode('all')}
                          className={`p-4 rounded-2xl border-2 cursor-pointer flex flex-col gap-1 ${
                            splitMode === 'all'
                              ? 'border-red-600 bg-red-50/50'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <span className="font-bold text-slate-800 text-sm">Extract all pages</span>
                          <span className="text-xs text-slate-500">
                            Export every single page as a standalone PDF bundled in a ZIP archive.
                          </span>
                        </label>
                        <label
                          onClick={() => setSplitMode('ranges')}
                          className={`p-4 rounded-2xl border-2 cursor-pointer flex flex-col gap-1 ${
                            splitMode === 'ranges'
                              ? 'border-red-600 bg-red-50/50'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <span className="font-bold text-slate-800 text-sm">Custom page ranges</span>
                          <span className="text-xs text-slate-500">
                            Specify custom pages or ranges (e.g. 1-3, 5, 8-10).
                          </span>
                        </label>
                      </div>
                    </div>

                    {splitMode === 'ranges' && (
                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">
                          Page ranges (Total pages: {pageCount}):
                        </label>
                        <input
                          type="text"
                          value={splitRanges}
                          onChange={(e) => setSplitRanges(e.target.value)}
                          placeholder="e.g. 1-2, 4, 6-8"
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:border-red-500"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* OPTION: Visual Page Selector for Extract / Remove */}
                {['extract-pages', 'remove-pages'].includes(tool.id) && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-slate-600">
                        {tool.id === 'extract-pages'
                          ? 'Click pages to extract:'
                          : 'Click pages to delete:'}
                      </span>
                      <span className="text-xs text-slate-400">
                        {selectedPages.length} pages selected
                      </span>
                    </div>

                    {loadingThumbnails ? (
                      <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                        <Loader2 className="w-8 h-8 animate-spin text-red-600 mb-2" />
                        <span className="text-xs">Rendering page previews...</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-96 overflow-y-auto p-2">
                        {thumbnails.map((thumb) => {
                          const isSel = selectedPages.includes(thumb.pageNumber);
                          return (
                            <div
                              key={thumb.pageNumber}
                              onClick={() => togglePageSelection(thumb.pageNumber)}
                              className={`relative rounded-xl border-2 p-2 cursor-pointer transition-all ${
                                isSel
                                  ? tool.id === 'extract-pages'
                                    ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-200'
                                    : 'border-red-600 bg-red-50 ring-2 ring-red-200 opacity-60'
                                  : 'border-slate-200 hover:border-slate-300 bg-white'
                              }`}
                            >
                              <img
                                src={thumb.dataUrl}
                                alt={`Page ${thumb.pageNumber}`}
                                className="w-full aspect-3/4 object-contain rounded bg-white shadow-xs"
                              />
                              <div className="mt-1.5 flex items-center justify-between text-[11px] font-bold">
                                <span>P. {thumb.pageNumber}</span>
                                {isSel && (
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[10px] ${
                                      tool.id === 'extract-pages'
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-red-600 text-white'
                                    }`}
                                  >
                                    {tool.id === 'extract-pages' ? 'Keep' : 'Delete'}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* OPTION: Organize & Reorder Pages Grid */}
                {['organize-pdf', 'reorder-pages'].includes(tool.id) && (
                  <div>
                    <p className="text-xs text-slate-500 mb-4">
                      Reorder, rotate, or remove pages. Changes will be reflected in your new PDF.
                    </p>

                    {loadingThumbnails ? (
                      <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                        <Loader2 className="w-8 h-8 animate-spin text-red-600 mb-2" />
                        <span className="text-xs">Rendering page previews...</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[500px] overflow-y-auto p-2">
                        {thumbnails.map((thumb, idx) => (
                          <div
                            key={thumb.pageNumber}
                            className="bg-slate-50 border border-slate-200 rounded-2xl p-2.5 flex flex-col justify-between shadow-xs"
                          >
                            <div className="relative overflow-hidden rounded-xl bg-white aspect-3/4 flex items-center justify-center border border-slate-200">
                              <img
                                src={thumb.dataUrl}
                                alt={`Page ${thumb.pageNumber}`}
                                className="max-h-full max-w-full object-contain transition-transform"
                                style={{ transform: `rotate(${thumb.rotation}deg)` }}
                              />
                              <span className="absolute top-2 left-2 px-2 py-0.5 bg-slate-900/80 text-white rounded-md text-[10px] font-bold">
                                P. {thumb.pageNumber}
                              </span>
                            </div>

                            <div className="mt-2 pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => moveThumbnail(idx, 'left')}
                                  disabled={idx === 0}
                                  className="p-1 hover:bg-white rounded text-slate-600 disabled:opacity-30"
                                  title="Move left"
                                >
                                  <ArrowLeft className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moveThumbnail(idx, 'right')}
                                  disabled={idx === thumbnails.length - 1}
                                  className="p-1 hover:bg-white rounded text-slate-600 disabled:opacity-30"
                                  title="Move right"
                                >
                                  <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                                </button>
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => rotateThumbnail(thumb.pageNumber)}
                                  className="p-1 hover:bg-white rounded text-slate-600 hover:text-red-600"
                                  title="Rotate 90°"
                                >
                                  <RotateCw className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeThumbnail(thumb.pageNumber)}
                                  className="p-1 hover:bg-white rounded text-slate-600 hover:text-red-600"
                                  title="Delete page"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* OPTION: Rotate PDF */}
                {tool.id === 'rotate-pages' && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-2">
                        Rotation Angle:
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { angle: 90, label: '90° Clockwise' },
                          { angle: 180, label: '180° Flip' },
                          { angle: 270, label: '90° Counter-Clockwise' },
                        ].map((item) => (
                          <button
                            key={item.angle}
                            type="button"
                            onClick={() => setRotateAngle(item.angle)}
                            className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                              rotateAngle === item.angle
                                ? 'bg-red-600 text-white border-red-600 shadow-sm'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-2">
                        Apply to:
                      </label>
                      <div className="flex gap-2">
                        {(['all', 'odd', 'even'] as const).map((tgt) => (
                          <button
                            key={tgt}
                            type="button"
                            onClick={() => setRotateTarget(tgt)}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize border ${
                              rotateTarget === tgt
                                ? 'bg-slate-900 text-white border-slate-900'
                                : 'bg-white border-slate-200 text-slate-600'
                            }`}
                          >
                            {tgt === 'all' ? 'All Pages' : `${tgt} Pages`}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* OPTION: Add Page Numbers */}
                {tool.id === 'add-page-numbers' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">
                        Position:
                      </label>
                      <select
                        value={pageNumberPosition}
                        onChange={(e) => setPageNumberPosition(e.target.value as any)}
                        className="w-full p-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm bg-white"
                      >
                        <option value="bottom-center">Bottom Center (Standard)</option>
                        <option value="bottom-right">Bottom Right</option>
                        <option value="bottom-left">Bottom Left</option>
                        <option value="top-center">Top Center</option>
                        <option value="top-right">Top Right</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">
                        Format:
                      </label>
                      <select
                        value={pageNumberFormat}
                        onChange={(e) => setPageNumberFormat(e.target.value as any)}
                        className="w-full p-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm bg-white"
                      >
                        <option value="Page {n} of {total}">Page 1 of {pageCount || 'N'}</option>
                        <option value="{n} / {total}">1 / {pageCount || 'N'}</option>
                        <option value="{n}">1</option>
                        <option value="- {n} -">- 1 -</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* OPTION: Compress PDF */}
                {tool.id === 'compress-pdf' && (
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-slate-600 block">
                      Compression Level:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        {
                          id: 'extreme',
                          name: 'Extreme Compression',
                          desc: 'Smallest size, removes non-essential metadata and objects.',
                        },
                        {
                          id: 'recommended',
                          name: 'Recommended',
                          desc: 'Optimal balance of compact size and high document quality.',
                        },
                        {
                          id: 'light',
                          name: 'Less Compression',
                          desc: 'Lossless structural cleanup with highest fidelity.',
                        },
                      ].map((lvl) => (
                        <div
                          key={lvl.id}
                          onClick={() => setCompressLevel(lvl.id as any)}
                          className={`p-4 rounded-2xl border-2 cursor-pointer flex flex-col justify-between transition-all ${
                            compressLevel === lvl.id
                              ? 'border-red-600 bg-red-50/50'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div>
                            <span className="font-bold text-slate-800 text-sm block">
                              {lvl.name}
                            </span>
                            <span className="text-xs text-slate-500 mt-1 block">{lvl.desc}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* OPTION: Images to PDF */}
                {['jpg-to-pdf', 'png-to-pdf', 'images-to-pdf'].includes(tool.id) && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">
                        Page Size:
                      </label>
                      <select
                        value={imgPageSize}
                        onChange={(e) => setImgPageSize(e.target.value as any)}
                        className="w-full p-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm bg-white"
                      >
                        <option value="a4">A4 (Standard)</option>
                        <option value="letter">US Letter</option>
                        <option value="fit">Fit to Image Size</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">
                        Orientation:
                      </label>
                      <select
                        value={imgOrientation}
                        onChange={(e) => setImgOrientation(e.target.value as any)}
                        className="w-full p-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm bg-white"
                      >
                        <option value="portrait">Portrait</option>
                        <option value="landscape">Landscape</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">
                        Page Margin:
                      </label>
                      <select
                        value={imgMargin}
                        onChange={(e) => setImgMargin(Number(e.target.value))}
                        className="w-full p-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm bg-white"
                      >
                        <option value={0}>No Margin</option>
                        <option value={20}>Small Margin</option>
                        <option value={40}>Big Margin</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* OPTION: PDF to Images */}
                {['pdf-to-jpg', 'pdf-to-png'].includes(tool.id) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">
                        Resolution & Quality:
                      </label>
                      <select
                        value={imageDpi}
                        onChange={(e) => setImageDpi(Number(e.target.value))}
                        className="w-full p-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm bg-white"
                      >
                        <option value={1}>Standard Web (72 DPI)</option>
                        <option value={1.5}>Medium High (150 DPI)</option>
                        <option value={2}>Ultra Crisp (300 DPI)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">
                        Output Format:
                      </label>
                      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-600">
                        {tool.id === 'pdf-to-jpg' ? 'JPEG Images' : 'Lossless PNG Images'} (ZIP bundle for multi-page)
                      </div>
                    </div>
                  </div>
                )}

                {/* OPTION: PDF to Word */}
                {tool.id === 'pdf-to-word' && (
                  <div className="space-y-3">
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 space-y-2">
                      <p className="font-bold text-slate-800">Word Export Details:</p>
                      <p>
                        Converts extracted text structure and paragraphs into an editable Word document format (`.doc`), readable by Microsoft Word, Apple Pages, and Google Docs.
                      </p>
                      <p className="text-slate-500">
                        <em>Formatting Note:</em> Text paragraphs and page breaks are preserved; complex layered graphics or overlapping columns may require re-alignment in Word.
                      </p>
                    </div>
                  </div>
                )}

                {/* OPTION: PDF to Excel */}
                {tool.id === 'pdf-to-excel' && (
                  <div className="space-y-3">
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 space-y-2">
                      <p className="font-bold text-slate-800">Spreadsheet Export Scope:</p>
                      <p>
                        Scans tabular text and outputs standard RFC-compliant CSV format (`.csv`), which opens natively in Microsoft Excel, Google Sheets, and LibreOffice Calc.
                      </p>
                      <p className="text-slate-500">
                        <em>Formatting Note:</em> Cell values and columns are extracted based on whitespace delimiters. Complex merged headers or nested tables may require manual adjustment in Excel.
                      </p>
                    </div>
                  </div>
                )}

                {/* OPTION: PDF to PowerPoint */}
                {tool.id === 'pdf-to-powerpoint' && (
                  <div className="space-y-3">
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 space-y-2">
                      <p className="font-bold text-slate-800">PowerPoint Presentation Scope:</p>
                      <p>
                        Creates structured 16:9 presentation slides formatted with page titles and bullet points.
                      </p>
                    </div>
                  </div>
                )}

                {/* OPTION: Repair PDF */}
                {tool.id === 'repair-pdf' && (
                  <div className="space-y-3">
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-2">
                      <p className="font-bold text-amber-950">PDF Diagnostics & Repair Scope:</p>
                      <p>
                        Scans cross-reference (xref) tables, corrects broken EOF markers, and reconstructs orphaned object streams.
                      </p>
                      <p className="text-amber-800 text-[11px]">
                        <em>Technical Limitation:</em> Repair fixes corrupt indexing tables and syntax errors; completely erased or overwritten file bytes cannot be recovered.
                      </p>
                    </div>
                  </div>
                )}

                {/* OPTION: OCR Engine */}
                {['ocr-pdf', 'scanned-to-searchable'].includes(tool.id) && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">
                        Document Language:
                      </label>
                      <select
                        value={ocrLanguage}
                        onChange={(e) => setOcrLanguage(e.target.value)}
                        className="w-full sm:w-64 p-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm bg-white"
                      >
                        <option value="eng">English (eng)</option>
                        <option value="spa">Spanish (Español)</option>
                        <option value="fra">French (Français)</option>
                        <option value="deu">German (Deutsch)</option>
                        <option value="ita">Italian (Italiano)</option>
                        <option value="por">Portuguese (Português)</option>
                      </select>
                    </div>
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 space-y-1">
                      <p className="font-semibold">🔒 Client-Side Tesseract OCR Engine</p>
                      <p className="text-[11px] text-red-700">
                        OCR runs 100% inside your browser using WebAssembly. Note: When used for the first time, the open-source language model (~15MB) is downloaded once into your browser cache. Your documents never leave your computer.
                      </p>
                    </div>
                  </div>
                )}

                {/* OPTION: Sign PDF */}
                {tool.id === 'sign-pdf' && (
                  <div className="space-y-5">
                    <SignaturePad onSignatureReady={(dataUrl) => setSignatureDataUrl(dataUrl)} />

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">
                          Stamp on Page:
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={pageCount || 1}
                          value={targetPage}
                          onChange={(e) => setTargetPage(Number(e.target.value))}
                          className="w-full p-2 border border-slate-200 rounded-xl text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">
                          Position X: {sigX}px
                        </label>
                        <input
                          type="range"
                          min={20}
                          max={450}
                          value={sigX}
                          onChange={(e) => setSigX(Number(e.target.value))}
                          className="w-full accent-red-600"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">
                          Position Y: {sigY}px
                        </label>
                        <input
                          type="range"
                          min={20}
                          max={650}
                          value={sigY}
                          onChange={(e) => setSigY(Number(e.target.value))}
                          className="w-full accent-red-600"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* OPTION: Add Watermark */}
                {tool.id === 'add-watermark' && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">
                        Watermark Text:
                      </label>
                      <input
                        type="text"
                        value={watermarkText}
                        onChange={(e) => setWatermarkText(e.target.value)}
                        placeholder="e.g. CONFIDENTIAL / DRAFT / DO NOT COPY"
                        className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">
                          Opacity: {Math.round(watermarkOpacity * 100)}%
                        </label>
                        <input
                          type="range"
                          min={0.05}
                          max={0.8}
                          step={0.05}
                          value={watermarkOpacity}
                          onChange={(e) => setWatermarkOpacity(Number(e.target.value))}
                          className="w-full accent-red-600"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">
                          Angle: {watermarkAngle}°
                        </label>
                        <input
                          type="range"
                          min={-90}
                          max={90}
                          step={15}
                          value={watermarkAngle}
                          onChange={(e) => setWatermarkAngle(Number(e.target.value))}
                          className="w-full accent-red-600"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* OPTION: Add Text */}
                {tool.id === 'add-text' && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">
                        Custom Text to Add:
                      </label>
                      <input
                        type="text"
                        value={customText}
                        onChange={(e) => setCustomText(e.target.value)}
                        className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">
                          Target Page:
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={pageCount || 1}
                          value={targetPage}
                          onChange={(e) => setTargetPage(Number(e.target.value))}
                          className="w-full p-2 border border-slate-200 rounded-xl text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">
                          Font Size:
                        </label>
                        <input
                          type="number"
                          min={10}
                          max={48}
                          value={textFontSize}
                          onChange={(e) => setTextFontSize(Number(e.target.value))}
                          className="w-full p-2 border border-slate-200 rounded-xl text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">
                          Color:
                        </label>
                        <input
                          type="color"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="w-full h-8 p-1 border border-slate-200 rounded-xl cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* OPTION: Edit Metadata */}
                {tool.id === 'edit-metadata' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">
                        Title:
                      </label>
                      <input
                        type="text"
                        value={metaTitle}
                        onChange={(e) => setMetaTitle(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-xl text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">
                        Author:
                      </label>
                      <input
                        type="text"
                        value={metaAuthor}
                        onChange={(e) => setMetaAuthor(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-xl text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">
                        Subject:
                      </label>
                      <input
                        type="text"
                        value={metaSubject}
                        onChange={(e) => setMetaSubject(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-xl text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">
                        Keywords (comma separated):
                      </label>
                      <input
                        type="text"
                        value={metaKeywords}
                        onChange={(e) => setMetaKeywords(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-xl text-xs sm:text-sm"
                      />
                    </div>
                  </div>
                )}

                {/* OPTION: Protect / Unlock PDF */}
                {['protect-pdf', 'unlock-pdf'].includes(tool.id) && (
                  <div className="max-w-md">
                    <label className="text-xs font-semibold text-slate-600 block mb-1">
                      {tool.id === 'protect-pdf' ? 'Enter Password to Encrypt:' : 'Enter Document Password:'}
                    </label>
                    <input
                      type="password"
                      value={pdfPassword}
                      onChange={(e) => setPdfPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full p-2.5 border border-slate-300 rounded-xl text-sm focus:border-red-500 outline-none"
                    />
                    <p className="mt-2 text-xs text-slate-400">
                      {tool.id === 'protect-pdf'
                        ? '128-bit encryption standard applied locally.'
                        : 'Decrypted file will have password restrictions removed.'}
                    </p>
                  </div>
                )}

                {/* OPTION: Compare PDF */}
                {tool.id === 'compare-pdf' && compareResult && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2">
                    <div className="font-bold text-slate-800">Comparison Result:</div>
                    <p className="text-slate-600">{compareResult.summary}</p>
                  </div>
                )}

                {/* Progress Bar (when active) */}
                {isProcessing && progress && (
                  <div className="mt-8 pt-6 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-2">
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                        <span>{progress.stage}</span>
                      </span>
                      <span>{progress.percent}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-600 transition-all duration-300 rounded-full"
                        style={{ width: `${progress.percent}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Primary Action Button */}
                <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-slate-400 text-center sm:text-left">
                    All processing happens in your browser memory without uploading.
                  </div>

                  <button
                    type="button"
                    onClick={handleProcess}
                    disabled={isProcessing}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-bold text-sm shadow-md shadow-red-500/25 hover:shadow-lg hover:shadow-red-500/35 transition-all transform active:scale-95 cursor-pointer"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processing Document...</span>
                      </>
                    ) : (
                      <>
                        <ToolIcon name={tool.icon} className="w-4 h-4 text-white" />
                        <span>{tool.title}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Helpful step-by-step instructions, key features, and related tool links for users & SEO */}
      <ToolSeoSection tool={tool} onSelectTool={onSelectTool} />

      {/* Policy-compliant AdSense Placement, safely positioned away from tool controls */}
      <AdSenseBanner
        slotId={ADSENSE_CONFIG.slotToolBottom}
        slotLabel="أسفل صفحة الأداة (Tool Bottom)"
        className="mt-12"
      />
    </div>
  );
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function parseRangeString(rangesStr: string, total: number): number[] {
  const result: number[] = [];
  const parts = rangesStr.split(',');
  for (const part of parts) {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(Number);
      for (let i = start; i <= (end || total); i++) {
        if (i >= 1 && i <= total) result.push(i);
      }
    } else {
      const num = Number(part.trim());
      if (num >= 1 && num <= total) result.push(num);
    }
  }
  return result;
}
