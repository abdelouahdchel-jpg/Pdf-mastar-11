import React, { useState } from 'react';
import { ShieldCheck, Menu, X, Sparkles, ChevronDown } from 'lucide-react';
import { ToolCategory } from '../types/tools';

interface NavbarProps {
  onSelectCategory: (category: ToolCategory) => void;
  onSelectTool: (toolId: string) => void;
  onGoHome: () => void;
  onOpenModal: (modal: 'about' | 'privacy' | 'terms' | 'contact') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onSelectCategory,
  onSelectTool,
  onGoHome,
  onOpenModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={onGoHome}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shadow-md shadow-red-500/20 group-hover:scale-105 transition-transform">
            <svg
              className="w-6 h-6 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-2xl font-black tracking-tight text-red-600">PDF</span>
              <span className="text-2xl font-bold tracking-tight text-slate-800">Master</span>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 -mt-1 hidden sm:block">
              Free & Private Online Tools
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <a
            href="/"
            onClick={(e) => {
              if (!e.metaKey && !e.ctrlKey) {
                e.preventDefault();
                onSelectCategory('all');
                onGoHome();
              }
            }}
            className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-red-600 hover:bg-red-50/60 rounded-lg transition-colors"
          >
            All Tools
          </a>
          <a
            href="/merge-pdf"
            onClick={(e) => {
              if (!e.metaKey && !e.ctrlKey) {
                e.preventDefault();
                onSelectTool('merge-pdf');
              }
            }}
            className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-red-600 hover:bg-red-50/60 rounded-lg transition-colors"
          >
            Merge PDF
          </a>
          <a
            href="/split-pdf"
            onClick={(e) => {
              if (!e.metaKey && !e.ctrlKey) {
                e.preventDefault();
                onSelectTool('split-pdf');
              }
            }}
            className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-red-600 hover:bg-red-50/60 rounded-lg transition-colors"
          >
            Split PDF
          </a>
          <a
            href="/compress-pdf"
            onClick={(e) => {
              if (!e.metaKey && !e.ctrlKey) {
                e.preventDefault();
                onSelectTool('compress-pdf');
              }
            }}
            className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-red-600 hover:bg-red-50/60 rounded-lg transition-colors"
          >
            Compress
          </a>

          {/* Convert dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-red-600 hover:bg-red-50/60 rounded-lg transition-colors flex items-center gap-1"
            >
              Convert
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
            {dropdownOpen && (
              <div
                className="absolute top-full mt-1.5 left-0 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1"
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <div className="px-3 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Convert From PDF
                </div>
                <a
                  href="/pdf-to-jpg"
                  onClick={(e) => {
                    if (!e.metaKey && !e.ctrlKey) {
                      e.preventDefault();
                      onSelectTool('pdf-to-jpg');
                      setDropdownOpen(false);
                    }
                  }}
                  className="block px-4 py-2 text-sm text-slate-700 hover:bg-red-50 hover:text-red-600"
                >
                  PDF to JPG
                </a>
                <a
                  href="/pdf-to-word"
                  onClick={(e) => {
                    if (!e.metaKey && !e.ctrlKey) {
                      e.preventDefault();
                      onSelectTool('pdf-to-word');
                      setDropdownOpen(false);
                    }
                  }}
                  className="block px-4 py-2 text-sm text-slate-700 hover:bg-red-50 hover:text-red-600"
                >
                  PDF to Word
                </a>
                <a
                  href="/pdf-to-excel"
                  onClick={(e) => {
                    if (!e.metaKey && !e.ctrlKey) {
                      e.preventDefault();
                      onSelectTool('pdf-to-excel');
                      setDropdownOpen(false);
                    }
                  }}
                  className="block px-4 py-2 text-sm text-slate-700 hover:bg-red-50 hover:text-red-600"
                >
                  PDF to Excel
                </a>
                <div className="my-1 border-t border-slate-100" />
                <div className="px-3 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Convert To PDF
                </div>
                <a
                  href="/jpg-to-pdf"
                  onClick={(e) => {
                    if (!e.metaKey && !e.ctrlKey) {
                      e.preventDefault();
                      onSelectTool('jpg-to-pdf');
                      setDropdownOpen(false);
                    }
                  }}
                  className="block px-4 py-2 text-sm text-slate-700 hover:bg-red-50 hover:text-red-600"
                >
                  JPG to PDF
                </a>
                <a
                  href="/images-to-pdf"
                  onClick={(e) => {
                    if (!e.metaKey && !e.ctrlKey) {
                      e.preventDefault();
                      onSelectTool('images-to-pdf');
                      setDropdownOpen(false);
                    }
                  }}
                  className="block px-4 py-2 text-sm text-slate-700 hover:bg-red-50 hover:text-red-600"
                >
                  Images to PDF
                </a>
              </div>
            )}
          </div>

          <a
            href="/sign-pdf"
            onClick={(e) => {
              if (!e.metaKey && !e.ctrlKey) {
                e.preventDefault();
                onSelectTool('sign-pdf');
              }
            }}
            className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-red-600 hover:bg-red-50/60 rounded-lg transition-colors"
          >
            Sign PDF
          </a>
          <a
            href="/ocr-pdf"
            onClick={(e) => {
              if (!e.metaKey && !e.ctrlKey) {
                e.preventDefault();
                onSelectTool('ocr-pdf');
              }
            }}
            className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-red-600 hover:bg-red-50/60 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <span>OCR</span>
            <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded-full">
              Engine
            </span>
          </a>
        </nav>

        {/* Right side items: Privacy Badge & Actions */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% Client-Side Privacy</span>
          </div>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-600 hover:text-red-600 hover:bg-slate-100 rounded-lg"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 shadow-xl animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2 mb-4 p-2 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-800 text-xs font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>No uploads: All processing happens inside your phone's browser.</span>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              onClick={() => {
                onSelectTool('merge-pdf');
                setMobileMenuOpen(false);
              }}
              className="p-2.5 text-left text-sm font-medium text-slate-700 bg-slate-50 hover:bg-red-50 hover:text-red-600 rounded-lg"
            >
              Merge PDF
            </button>
            <button
              onClick={() => {
                onSelectTool('split-pdf');
                setMobileMenuOpen(false);
              }}
              className="p-2.5 text-left text-sm font-medium text-slate-700 bg-slate-50 hover:bg-red-50 hover:text-red-600 rounded-lg"
            >
              Split PDF
            </button>
            <button
              onClick={() => {
                onSelectTool('compress-pdf');
                setMobileMenuOpen(false);
              }}
              className="p-2.5 text-left text-sm font-medium text-slate-700 bg-slate-50 hover:bg-red-50 hover:text-red-600 rounded-lg"
            >
              Compress PDF
            </button>
            <button
              onClick={() => {
                onSelectTool('pdf-to-jpg');
                setMobileMenuOpen(false);
              }}
              className="p-2.5 text-left text-sm font-medium text-slate-700 bg-slate-50 hover:bg-red-50 hover:text-red-600 rounded-lg"
            >
              PDF to JPG
            </button>
            <button
              onClick={() => {
                onSelectTool('sign-pdf');
                setMobileMenuOpen(false);
              }}
              className="p-2.5 text-left text-sm font-medium text-slate-700 bg-slate-50 hover:bg-red-50 hover:text-red-600 rounded-lg"
            >
              Sign PDF
            </button>
            <button
              onClick={() => {
                onSelectTool('ocr-pdf');
                setMobileMenuOpen(false);
              }}
              className="p-2.5 text-left text-sm font-medium text-slate-700 bg-slate-50 hover:bg-red-50 hover:text-red-600 rounded-lg"
            >
              OCR Scanned Doc
            </button>
          </div>

          <div className="border-t border-slate-100 pt-3 flex flex-wrap gap-2 text-xs text-slate-500">
            <button
              onClick={() => {
                onOpenModal('about');
                setMobileMenuOpen(false);
              }}
              className="hover:text-red-600"
            >
              About PDF Master
            </button>
            <span>•</span>
            <button
              onClick={() => {
                onOpenModal('privacy');
                setMobileMenuOpen(false);
              }}
              className="hover:text-red-600"
            >
              Privacy Policy
            </button>
            <span>•</span>
            <button
              onClick={() => {
                onOpenModal('terms');
                setMobileMenuOpen(false);
              }}
              className="hover:text-red-600"
            >
              Terms
            </button>
            <span>•</span>
            <button
              onClick={() => {
                onOpenModal('contact');
                setMobileMenuOpen(false);
              }}
              className="hover:text-red-600"
            >
              Contact
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
