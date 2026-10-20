import React from 'react';
import {
  Merge,
  Split,
  FileOutput,
  Trash2,
  ArrowUpDown,
  RotateCw,
  LayoutGrid,
  Hash,
  Minimize2,
  Zap,
  Square,
  Image as ImageIcon,
  Sparkles,
  FileText,
  Code,
  FileSpreadsheet,
  Table,
  Presentation,
  FileImage,
  FilePlus,
  Images,
  BookOpen,
  Globe,
  FileSearch,
  ScanText,
  SearchCheck,
  Type,
  Stamp,
  PenTool,
  Award,
  FileEdit,
  Highlighter,
  Lock,
  Unlock,
  Columns2,
  Wrench,
  DownloadCloud,
  Layers,
  Files,
  ArrowRightLeft,
  FileUp,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';

interface ToolIconProps {
  name: string;
  className?: string;
}

export const ToolIcon: React.FC<ToolIconProps> = ({ name, className = 'w-6 h-6' }) => {
  switch (name) {
    case 'Merge':
      return <Merge className={className} />;
    case 'Split':
      return <Split className={className} />;
    case 'FileOutput':
      return <FileOutput className={className} />;
    case 'Trash2':
      return <Trash2 className={className} />;
    case 'ArrowUpDown':
      return <ArrowUpDown className={className} />;
    case 'RotateCw':
      return <RotateCw className={className} />;
    case 'LayoutGrid':
      return <LayoutGrid className={className} />;
    case 'Hash':
      return <Hash className={className} />;
    case 'Minimize2':
      return <Minimize2 className={className} />;
    case 'Zap':
      return <Zap className={className} />;
    case 'Square':
      return <Square className={className} />;
    case 'Image':
      return <ImageIcon className={className} />;
    case 'Sparkles':
      return <Sparkles className={className} />;
    case 'FileText':
      return <FileText className={className} />;
    case 'Code':
      return <Code className={className} />;
    case 'FileSpreadsheet':
      return <FileSpreadsheet className={className} />;
    case 'Table':
      return <Table className={className} />;
    case 'Presentation':
      return <Presentation className={className} />;
    case 'FileImage':
      return <FileImage className={className} />;
    case 'FilePlus':
      return <FilePlus className={className} />;
    case 'Images':
      return <Images className={className} />;
    case 'BookOpen':
      return <BookOpen className={className} />;
    case 'Globe':
      return <Globe className={className} />;
    case 'FileSearch':
      return <FileSearch className={className} />;
    case 'ScanText':
      return <ScanText className={className} />;
    case 'SearchCheck':
      return <SearchCheck className={className} />;
    case 'Type':
      return <Type className={className} />;
    case 'Stamp':
      return <Stamp className={className} />;
    case 'PenTool':
      return <PenTool className={className} />;
    case 'Award':
      return <Award className={className} />;
    case 'FileEdit':
      return <FileEdit className={className} />;
    case 'Highlighter':
      return <Highlighter className={className} />;
    case 'Lock':
      return <Lock className={className} />;
    case 'Unlock':
      return <Unlock className={className} />;
    case 'Columns2':
      return <Columns2 className={className} />;
    case 'Wrench':
      return <Wrench className={className} />;
    case 'DownloadCloud':
      return <DownloadCloud className={className} />;
    case 'Layers':
      return <Layers className={className} />;
    case 'Files':
      return <Files className={className} />;
    case 'ArrowRightLeft':
      return <ArrowRightLeft className={className} />;
    case 'FileUp':
      return <FileUp className={className} />;
    case 'ShieldCheck':
      return <ShieldCheck className={className} />;
    default:
      return <HelpCircle className={className} />;
  }
};
