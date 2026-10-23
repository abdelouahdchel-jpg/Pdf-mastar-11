import React, { useEffect } from 'react';
import { ArrowLeft, FileQuestion, ArrowRight, Merge, Split, Minimize2, Image } from 'lucide-react';

interface NotFoundPageProps {
  onBackToHome: () => void;
  onSelectTool: (toolId: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({
  onBackToHome,
  onSelectTool,
}) => {
  useEffect(() => {
    document.title = 'Page Not Found (404) – PDF Master';

    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.setAttribute('name', 'robots');
      document.head.appendChild(robotsMeta);
    }
    robotsMeta.setAttribute('content', 'noindex, nofollow');

    return () => {
      // Clean up robots tag when navigating away
      const el = document.querySelector('meta[name="robots"]');
      if (el) el.setAttribute('content', 'index, follow');
    };
  }, []);

  const popularTools = [
    { id: 'merge-pdf', title: 'Merge PDF', icon: Merge, desc: 'Combine multiple PDFs into one.' },
    { id: 'split-pdf', title: 'Split PDF', icon: Split, desc: 'Extract pages or split ranges.' },
    { id: 'compress-pdf', title: 'Compress PDF', icon: Minimize2, desc: 'Reduce file size efficiently.' },
    { id: 'pdf-to-jpg', title: 'PDF to JPG', icon: Image, desc: 'Convert pages into JPG pictures.' },
  ];

  return (
    <div className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto text-center animate-in fade-in">
      <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
        <FileQuestion className="w-10 h-10" />
      </div>

      <span className="text-xs font-bold text-red-600 uppercase tracking-widest block mb-2">
        Error 404 • Page Not Found
      </span>

      <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
        Oops! We couldn't find that page
      </h1>

      <p className="mt-3 text-sm sm:text-base text-slate-500 max-w-lg mx-auto leading-relaxed">
        The link you followed may be incorrect, broken, or the tool may have been moved.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-sm font-bold shadow-md shadow-red-500/20 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Tools</span>
        </button>
      </div>

      {/* Suggested Tools */}
      <div className="mt-14 pt-10 border-t border-slate-200 text-left">
        <h2 className="text-base font-bold text-slate-900 mb-4 text-center">
          Looking for one of our popular PDF tools?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {popularTools.map((t) => {
            const Icon = t.icon;
            return (
              <a
                key={t.id}
                href={`/${t.id}`}
                onClick={(e) => {
                  if (!e.metaKey && !e.ctrlKey) {
                    e.preventDefault();
                    onSelectTool(t.id);
                  }
                }}
                className="group p-4 bg-white border border-slate-200 hover:border-red-400 rounded-2xl flex items-center justify-between shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white flex items-center justify-center transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-red-600 transition-colors">
                      {t.title}
                    </h3>
                    <p className="text-xs text-slate-500">{t.desc}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-red-600 group-hover:translate-x-0.5 transition-all" />
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};
