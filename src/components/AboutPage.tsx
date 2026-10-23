import React from 'react';
import { ArrowLeft, ShieldCheck, Zap, Smartphone, Lock, FileText, CheckCircle2, ArrowRight } from 'lucide-react';

interface AboutPageProps {
  onBackToHome: () => void;
  onSelectTool: (toolId: string) => void;
  onNavigateContact: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  onBackToHome,
  onSelectTool,
  onNavigateContact,
}) => {
  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto animate-in fade-in">
      {/* Back button */}
      <div className="mb-6">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-red-600 transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Tools</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Header Banner */}
        <div className="p-6 sm:p-10 border-b border-slate-100 bg-gradient-to-b from-slate-50/80 to-white">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-red-600 text-xs font-bold tracking-wide uppercase mb-3">
            <FileText className="w-3.5 h-3.5" />
            <span>About PDF Master</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Fast, Accessible &amp; Private PDF Tools
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
            PDF Master is a modern, web-based suite of document utilities designed to make everyday PDF
            tasks fast, straightforward, and dependable without complicated software installations or mandatory subscriptions.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-10 space-y-10 text-slate-700 text-sm leading-relaxed">
          {/* Mission */}
          <section>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3">Our Mission</h2>
            <p className="text-slate-600 leading-relaxed">
              Managing digital documents should not require expensive desktop software, slow email queues,
              or complicated subscription plans. Our goal with PDF Master is to provide everyday users,
              students, and professionals with quick, accessible utilities to merge, split, compress,
              convert, and sign PDF files directly inside any modern web browser.
            </p>
          </section>

          {/* Technical Architecture & Client-Side Processing */}
          <section className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                In-Browser Processing Architecture
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              For core document tasks—including merging PDFs, splitting pages, rotating documents,
              organizing pages, adding watermarks, and stamping electronic signatures—operations execute
              directly inside your browser sandbox using client-side JavaScript, WebAssembly, and HTML5 canvas APIs.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-medium text-slate-700">
              <div className="flex items-start gap-2 bg-white p-3 rounded-xl border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Files for client-side tools stay in local browser memory</span>
              </div>
              <div className="flex items-start gap-2 bg-white p-3 rounded-xl border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Zero server queue delay: instant local processing</span>
              </div>
              <div className="flex items-start gap-2 bg-white p-3 rounded-xl border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Temporary memory is cleared when the browser tab closes</span>
              </div>
              <div className="flex items-start gap-2 bg-white p-3 rounded-xl border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>No user account registration or login required</span>
              </div>
            </div>
          </section>

          {/* Core Values */}
          <section>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4">What Sets Us Apart</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mb-3">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">Fast &amp; Streamlined</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Clean interface designed for efficiency. Open any tool, choose your file, and get results in seconds.
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">Mobile &amp; Desktop</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Fully responsive layout optimized for touch screens on phones and tablets as well as desktop workstations.
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">Honest &amp; Transparent</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Clear explanations of what each tool does, supported file types, and realistic expectations.
                </p>
              </div>
            </div>
          </section>

          {/* Quick Start Callout */}
          <div className="p-6 bg-gradient-to-r from-red-600 to-rose-700 rounded-2xl text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base">Have questions or suggestions?</h3>
              <p className="text-xs text-red-100 mt-0.5">
                We're always working to improve PDF Master. Contact our team anytime.
              </p>
            </div>
            <button
              onClick={onNavigateContact}
              className="px-5 py-2.5 bg-white text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
