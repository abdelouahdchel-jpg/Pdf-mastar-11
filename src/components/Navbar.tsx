import React, { useState } from 'react';
import { Menu, X, ChevronDown, ShieldCheck, Wrench, BookOpen, Layers } from 'lucide-react';
import { ToolCategory } from '../types/tools';

interface NavbarProps {
  onSelectCategory: (category: ToolCategory) => void;
  onSelectTool: (toolId: string) => void;
  onGoHome: () => void;
  onNavigatePage: (page: 'about' | 'privacy' | 'terms' | 'contact' | 'blog') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onSelectCategory,
  onSelectTool,
  onGoHome,
  onNavigatePage,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <a
          href="/"
          onClick={(e) => {
            if (!e.metaKey && !e.ctrlKey) {
              e.preventDefault();
              onGoHome();
            }
          }}
          className="flex items-center gap-3 cursor-pointer group select-none no-underline"
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
            <div className="flex items-center gap-1 leading-none">
              <span className="text-2xl font-black tracking-tight text-red-600">PDF</span>
              <span className="text-2xl font-bold tracking-tight text-slate-800">Master</span>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mt-0.5 hidden sm:block">
              Free &amp; Private Online Tools
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {/* Home */}
          <a
            href="/"
            onClick={(e) => {
              if (!e.metaKey && !e.ctrlKey) {
                e.preventDefault();
                onGoHome();
              }
            }}
            className="px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-red-600 hover:bg-red-50/60 rounded-xl transition-colors"
          >
            Home
          </a>

          {/* All Tools dropdown & direct link */}
          <div className="relative">
            <div className="flex items-center">
              <a
                href="/"
                onClick={(e) => {
                  if (!e.metaKey && !e.ctrlKey) {
                    e.preventDefault();
                    onSelectCategory('all');
                    onGoHome();
                    const el = document.getElementById('all-tools-directory');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="px-3 py-2 text-sm font-semibold text-slate-700 hover:text-red-600 hover:bg-red-50/60 rounded-l-xl transition-colors flex items-center gap-1.5"
              >
                <span>All Tools</span>
              </a>
              <button
                type="button"
                onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
                className="py-2 pr-2 text-slate-400 hover:text-red-600 hover:bg-red-50/60 rounded-r-xl transition-colors cursor-pointer"
                aria-label="Toggle popular tools menu"
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${toolsDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {toolsDropdownOpen && (
              <div
                className="absolute top-full mt-2 left-0 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-1"
                onMouseLeave={() => setToolsDropdownOpen(false)}
              >
                <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Popular Tools
                </div>
                <div className="space-y-1 mt-1">
                  {[
                    { id: 'merge-pdf', title: 'Merge PDF' },
                    { id: 'compress-pdf', title: 'Compress PDF' },
                    { id: 'split-pdf', title: 'Split PDF' },
                    { id: 'pdf-to-word', title: 'PDF to Word' },
                    { id: 'pdf-to-jpg', title: 'PDF to JPG' },
                    { id: 'sign-pdf', title: 'Sign PDF' },
                    { id: 'ocr-pdf', title: 'OCR Scanned PDF' },
                  ].map((t) => (
                    <a
                      key={t.id}
                      href={`/${t.id}`}
                      onClick={(e) => {
                        if (!e.metaKey && !e.ctrlKey) {
                          e.preventDefault();
                          onSelectTool(t.id);
                          setToolsDropdownOpen(false);
                        }
                      }}
                      className="block px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      {t.title}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Blog */}
          <a
            href="/blog"
            onClick={(e) => {
              if (!e.metaKey && !e.ctrlKey) {
                e.preventDefault();
                onNavigatePage('blog');
              }
            }}
            className="px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-red-600 hover:bg-red-50/60 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <span>Blog</span>
            <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded-full">
              10 Guides
            </span>
          </a>

          {/* About */}
          <a
            href="/about"
            onClick={(e) => {
              if (!e.metaKey && !e.ctrlKey) {
                e.preventDefault();
                onNavigatePage('about');
              }
            }}
            className="px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-red-600 hover:bg-red-50/60 rounded-xl transition-colors"
          >
            About
          </a>

          {/* Contact */}
          <a
            href="/contact"
            onClick={(e) => {
              if (!e.metaKey && !e.ctrlKey) {
                e.preventDefault();
                onNavigatePage('contact');
              }
            }}
            className="px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-red-600 hover:bg-red-50/60 rounded-xl transition-colors"
          >
            Contact
          </a>
        </nav>

        {/* Right side item: In-Browser Processing Badge */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>In-Browser Processing</span>
          </div>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-600 hover:text-red-600 hover:bg-slate-100 rounded-lg cursor-pointer"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-4 pb-6 shadow-xl animate-in slide-in-from-top-2">
          {/* Main nav items */}
          <div className="space-y-1 mb-4">
            <a
              href="/"
              onClick={(e) => {
                if (!e.metaKey && !e.ctrlKey) {
                  e.preventDefault();
                  onGoHome();
                  setMobileMenuOpen(false);
                }
              }}
              className="block px-3 py-2 text-sm font-bold text-slate-800 hover:bg-red-50 hover:text-red-600 rounded-xl"
            >
              Home
            </a>
            <a
              href="/"
              onClick={(e) => {
                if (!e.metaKey && !e.ctrlKey) {
                  e.preventDefault();
                  onSelectCategory('all');
                  onGoHome();
                  setMobileMenuOpen(false);
                }
              }}
              className="block px-3 py-2 text-sm font-bold text-slate-800 hover:bg-red-50 hover:text-red-600 rounded-xl"
            >
              All Tools (38 Tools)
            </a>
            <a
              href="/blog"
              onClick={(e) => {
                if (!e.metaKey && !e.ctrlKey) {
                  e.preventDefault();
                  onNavigatePage('blog');
                  setMobileMenuOpen(false);
                }
              }}
              className="block px-3 py-2 text-sm font-bold text-slate-800 hover:bg-red-50 hover:text-red-600 rounded-xl"
            >
              Blog &amp; Tutorials
            </a>
            <a
              href="/about"
              onClick={(e) => {
                if (!e.metaKey && !e.ctrlKey) {
                  e.preventDefault();
                  onNavigatePage('about');
                  setMobileMenuOpen(false);
                }
              }}
              className="block px-3 py-2 text-sm font-bold text-slate-800 hover:bg-red-50 hover:text-red-600 rounded-xl"
            >
              About
            </a>
            <a
              href="/contact"
              onClick={(e) => {
                if (!e.metaKey && !e.ctrlKey) {
                  e.preventDefault();
                  onNavigatePage('contact');
                  setMobileMenuOpen(false);
                }
              }}
              className="block px-3 py-2 text-sm font-bold text-slate-800 hover:bg-red-50 hover:text-red-600 rounded-xl"
            >
              Contact
            </a>
          </div>

          {/* Popular tools quick shortcuts */}
          <div className="pt-3 border-t border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2 px-1">
              Popular Tools
            </span>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {[
                { id: 'merge-pdf', title: 'Merge PDF' },
                { id: 'compress-pdf', title: 'Compress PDF' },
                { id: 'split-pdf', title: 'Split PDF' },
                { id: 'pdf-to-word', title: 'PDF to Word' },
                { id: 'pdf-to-jpg', title: 'PDF to JPG' },
                { id: 'sign-pdf', title: 'Sign PDF' },
              ].map((t) => (
                <a
                  key={t.id}
                  href={`/${t.id}`}
                  onClick={(e) => {
                    if (!e.metaKey && !e.ctrlKey) {
                      e.preventDefault();
                      onSelectTool(t.id);
                      setMobileMenuOpen(false);
                    }
                  }}
                  className="p-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-red-50 hover:text-red-600 rounded-lg block"
                >
                  {t.title}
                </a>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 flex flex-wrap gap-2 text-xs text-slate-500">
            <a
              href="/privacy-policy"
              onClick={(e) => {
                if (!e.metaKey && !e.ctrlKey) {
                  e.preventDefault();
                  onNavigatePage('privacy');
                  setMobileMenuOpen(false);
                }
              }}
              className="hover:text-red-600"
            >
              Privacy Policy
            </a>
            <span>•</span>
            <a
              href="/terms"
              onClick={(e) => {
                if (!e.metaKey && !e.ctrlKey) {
                  e.preventDefault();
                  onNavigatePage('terms');
                  setMobileMenuOpen(false);
                }
              }}
              className="hover:text-red-600"
            >
              Terms
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
