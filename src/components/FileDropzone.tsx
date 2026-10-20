import React, { useRef, useState } from 'react';
import { Upload, Plus, File, AlertCircle } from 'lucide-react';

interface FileDropzoneProps {
  accept: string;
  multiple: boolean;
  acceptedLabel: string;
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  accept,
  multiple,
  acceptedLabel,
  onFilesSelected,
  maxFiles,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (incomingList: FileList | null) => {
    if (!incomingList || incomingList.length === 0) return;
    setErrorMsg(null);

    const validFiles: File[] = [];
    const limit = maxFiles || (multiple ? 50 : 1);

    for (let i = 0; i < incomingList.length; i++) {
      const file = incomingList[i];

      // Validate size (e.g. 100MB limit for browser memory safety)
      if (file.size > 100 * 1024 * 1024) {
        setErrorMsg(`File "${file.name}" is larger than 100MB. Please use smaller files for browser processing.`);
        continue;
      }

      validFiles.push(file);
      if (validFiles.length >= limit) break;
    }

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragOver(true);
    } else if (e.type === 'dragleave') {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 select-none ${
          isDragOver
            ? 'border-red-500 bg-red-50/50 scale-[1.01]'
            : 'border-slate-300 hover:border-red-400 bg-white hover:bg-slate-50/50 shadow-sm'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />

        <div className="max-w-md mx-auto flex flex-col items-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4 shadow-inner group-hover:scale-105 transition-transform">
            <Upload className="w-8 h-8 sm:w-10 sm:h-10 stroke-[1.8]" />
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-slate-800">
            {multiple ? 'Choose files or drop them here' : 'Choose a file or drop it here'}
          </h3>

          <p className="mt-2 text-xs sm:text-sm text-slate-500">
            Supported formats: <strong className="text-slate-700 font-semibold">{acceptedLabel}</strong>
          </p>

          <button
            type="button"
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md shadow-red-500/25 hover:shadow-lg hover:shadow-red-500/35 transition-all transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Select {multiple ? 'Files' : 'File'}</span>
          </button>

          <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-400">
            <span>🔒 Files remain on your device (Client-Side)</span>
            <span>•</span>
            <span>Max 100MB</span>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};
