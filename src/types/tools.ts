export type ToolCategory =
  | 'all'
  | 'organize'
  | 'compress'
  | 'convert-to'
  | 'convert-from'
  | 'ocr'
  | 'edit'
  | 'protect';

export interface CategoryInfo {
  id: ToolCategory;
  name: string;
  description: string;
  icon: string;
}

export interface PDFTool {
  id: string;
  title: string;
  category: ToolCategory;
  description: string;
  badge?: 'Popular' | 'New' | 'Batch' | 'Client-Side' | 'Fast' | 'Essential';
  icon: string;
  accept: string;
  multiple: boolean;
  maxFiles?: number;
  acceptedFileTypesLabel: string;
  requiresBackend?: boolean;
  privacyNote?: string;
}

export interface ProcessProgress {
  stage: string;
  percent: number;
  message?: string;
}

export interface ProcessResult {
  blob: Blob;
  fileName: string;
  fileSize: number;
  originalSize?: number;
  downloadUrl?: string;
  previewUrl?: string;
  textOutput?: string;
  meta?: {
    pageCount?: number;
    pagesProcessed?: number;
    compressionRatio?: string;
    extractedCount?: number;
  };
}

export interface PageThumbnail {
  pageNumber: number;
  dataUrl: string;
  rotation: number;
  selected?: boolean;
}

export interface ToolSeoData {
  title: string;
  description: string;
  heading: string;
  steps: { step: number; title: string; desc: string }[];
  features: string[];
  relatedToolIds: string[];
}

