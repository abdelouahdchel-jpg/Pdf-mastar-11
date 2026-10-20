import React from 'react';
import { ShieldCheck, Heart } from 'lucide-react';
import { ToolCategory } from '../types/tools';

import { AdSenseBanner } from './AdSenseBanner';
import { ADSENSE_CONFIG } from '../services/adsenseService';

interface FooterProps {
  onSelectCategory: (category: ToolCategory) => void;
  onSelectTool: (toolId: string) => void;
  onOpenModal: (modal: 'about' | 'privacy' | 'terms' | 'contact') => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  onSelectTool,
  onOpenModal,
}) => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-20 pt-16 pb-12 text-slate-600 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Responsive AdSense placement near footer (renders only when configured) */}
        <AdSenseBanner slotId={ADSENSE_CONFIG.slotFooter} className="mb-10" />

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Column 1: Brand Info */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-black text-sm">
                P
              </div>
              <span className="text-xl font-black text-slate-900 tracking-tight">
                PDF <span className="text-red-600">Master</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every PDF tool you need in one place. Engineered for speed, accessibility, and zero-compromise
              local client-side privacy.
            </p>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/60">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Zero server uploads</span>
            </div>
          </div>

          {/* Column 2: Organize PDF */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Organize PDF
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onSelectTool('merge-pdf')}
                  className="hover:text-red-600 transition-colors"
                >
                  Merge PDF
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTool('split-pdf')}
                  className="hover:text-red-600 transition-colors"
                >
                  Split PDF
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTool('remove-pages')}
                  className="hover:text-red-600 transition-colors"
                >
                  Remove Pages
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTool('rotate-pages')}
                  className="hover:text-red-600 transition-colors"
                >
                  Rotate Pages
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTool('organize-pdf')}
                  className="hover:text-red-600 transition-colors"
                >
                  Organize Pages
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTool('add-page-numbers')}
                  className="hover:text-red-600 transition-colors"
                >
                  Add Page Numbers
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Convert */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Convert & Export
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onSelectTool('pdf-to-jpg')}
                  className="hover:text-red-600 transition-colors"
                >
                  PDF to JPG
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTool('pdf-to-word')}
                  className="hover:text-red-600 transition-colors"
                >
                  PDF to Word
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTool('pdf-to-excel')}
                  className="hover:text-red-600 transition-colors"
                >
                  PDF to Excel
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTool('jpg-to-pdf')}
                  className="hover:text-red-600 transition-colors"
                >
                  JPG to PDF
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTool('images-to-pdf')}
                  className="hover:text-red-600 transition-colors"
                >
                  Images to PDF
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTool('txt-to-pdf')}
                  className="hover:text-red-600 transition-colors"
                >
                  Text to PDF
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Edit & Sign */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Edit & Security
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onSelectTool('sign-pdf')}
                  className="hover:text-red-600 transition-colors"
                >
                  Sign PDF
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTool('add-watermark')}
                  className="hover:text-red-600 transition-colors"
                >
                  Add Watermark
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTool('compress-pdf')}
                  className="hover:text-red-600 transition-colors"
                >
                  Compress PDF
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTool('protect-pdf')}
                  className="hover:text-red-600 transition-colors"
                >
                  Protect PDF
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTool('unlock-pdf')}
                  className="hover:text-red-600 transition-colors"
                >
                  Unlock PDF
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTool('ocr-pdf')}
                  className="hover:text-red-600 transition-colors"
                >
                  OCR Scanned PDF
                </button>
              </li>
            </ul>
          </div>

          {/* Column 5: Trust & Legal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Trust & Legal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onOpenModal('about')}
                  className="hover:text-red-600 transition-colors"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenModal('privacy')}
                  className="hover:text-red-600 transition-colors"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenModal('terms')}
                  className="hover:text-red-600 transition-colors"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenModal('contact')}
                  className="hover:text-red-600 transition-colors"
                >
                  Contact Support
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <p>© 2026 PDF Master. All rights reserved. Free and private online PDF tools.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Built with precision for speed and privacy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
