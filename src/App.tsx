import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ToolCard } from './components/ToolCard';
import { ToolWorkbench } from './components/ToolWorkbench';
import { Footer } from './components/Footer';
import { LegalModal } from './components/LegalModals';
import { AdSenseBanner } from './components/AdSenseBanner';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { ADSENSE_CONFIG } from './services/adsenseService';
import { TOOLS_LIST, CATEGORIES } from './data/toolsList';
import { TOOLS_SEO_DATA } from './data/toolsSeo';
import { PDFTool, ToolCategory } from './types/tools';
import { Shield, Zap, Lock, Smartphone, CheckCircle, ArrowRight } from 'lucide-react';

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<'about' | 'privacy' | 'terms' | 'contact' | null>(null);

  // Synchronize both clean path routing (/merge-pdf) and hash routing (#merge-pdf)
  useEffect(() => {
    const resolveCurrentRoute = () => {
      // 1. Check pathname (e.g. /merge-pdf)
      const pathname = window.location.pathname.replace(/^\/+/, '').replace(/\/+$/, '');
      if (pathname && TOOLS_LIST.some((t) => t.id === pathname)) {
        setActiveToolId(pathname);
        return;
      }

      // 2. Fallback to hash (e.g. #merge-pdf) for backward compatibility
      const hash = window.location.hash.replace(/^#/, '');
      if (hash && TOOLS_LIST.some((t) => t.id === hash)) {
        setActiveToolId(hash);
        return;
      }

      // Default root
      setActiveToolId(null);
    };

    resolveCurrentRoute();
    window.addEventListener('popstate', resolveCurrentRoute);
    window.addEventListener('hashchange', resolveCurrentRoute);
    return () => {
      window.removeEventListener('popstate', resolveCurrentRoute);
      window.removeEventListener('hashchange', resolveCurrentRoute);
    };
  }, []);

  // Synchronize document title, meta description, OpenGraph, and canonical link
  useEffect(() => {
    const defaultTitle = 'PDF Master – Merge, Split, Compress & Convert PDF Files';
    const defaultDesc =
      'Merge, split, compress, convert, edit, and sign PDF files directly in your browser with PDF Master. 100% private client-side processing with no file uploads.';
    const baseUrl = 'https://pdf-mastar-11.netlify.app';

    if (activeToolId && TOOLS_SEO_DATA[activeToolId]) {
      const seo = TOOLS_SEO_DATA[activeToolId];
      document.title = seo.title;

      const descEl = document.querySelector('meta[name="description"]');
      if (descEl) descEl.setAttribute('content', seo.description);

      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', seo.title);

      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute('content', seo.description);

      const ogUrl = document.querySelector('meta[property="og:url"]');
      if (ogUrl) ogUrl.setAttribute('content', `${baseUrl}/${activeToolId}`);

      let canonicalEl = document.querySelector('link[rel="canonical"]');
      if (!canonicalEl) {
        canonicalEl = document.createElement('link');
        canonicalEl.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalEl);
      }
      canonicalEl.setAttribute('href', `${baseUrl}/${activeToolId}`);
    } else {
      document.title = defaultTitle;

      const descEl = document.querySelector('meta[name="description"]');
      if (descEl) descEl.setAttribute('content', defaultDesc);

      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', defaultTitle);

      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute('content', defaultDesc);

      const ogUrl = document.querySelector('meta[property="og:url"]');
      if (ogUrl) ogUrl.setAttribute('content', `${baseUrl}/`);

      let canonicalEl = document.querySelector('link[rel="canonical"]');
      if (!canonicalEl) {
        canonicalEl = document.createElement('link');
        canonicalEl.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalEl);
      }
      canonicalEl.setAttribute('href', `${baseUrl}/`);
    }

    // Safely track page view for SPA navigation (no filenames or document contents are ever sent)
    try {
      // @ts-expect-error Google Analytics gtag
      if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        const pagePath = activeToolId ? `/${activeToolId}` : '/';
        const pageTitle =
          activeToolId && TOOLS_SEO_DATA[activeToolId]
            ? TOOLS_SEO_DATA[activeToolId].title
            : defaultTitle;

        // @ts-expect-error Google Analytics gtag
        window.gtag('event', 'page_view', {
          page_path: pagePath,
          page_title: pageTitle,
          page_location: `${baseUrl}${pagePath}`,
        });
      }
    } catch {
      // ignore
    }
  }, [activeToolId]);

  // Keyboard shortcut '/' to search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !activeToolId && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        searchInput?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeToolId]);

  const selectTool = (toolId: string) => {
    window.history.pushState({ toolId }, '', `/${toolId}`);
    setActiveToolId(toolId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goHome = () => {
    window.history.pushState({}, '', '/');
    setActiveToolId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter tools
  const filteredTools = useMemo(() => {
    return TOOLS_LIST.filter((tool) => {
      const matchesCategory =
        selectedCategory === 'all' || tool.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        tool.title.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.id.toLowerCase().includes(q) ||
        (tool.badge && tool.badge.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const activeTool = useMemo(() => {
    return TOOLS_LIST.find((t) => t.id === activeToolId) || null;
  }, [activeToolId]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased selection:bg-red-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          if (activeToolId) goHome();
        }}
        onSelectTool={selectTool}
        onGoHome={goHome}
        onOpenModal={(modal) => setActiveModal(modal)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTool ? (
          /* Active Tool Execution Workbench */
          <ToolWorkbench tool={activeTool} onBack={goHome} onSelectTool={selectTool} />
        ) : (
          /* Homepage Catalog View */
          <>
            {/* Hero Section */}
            <Hero
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />

            {/* Responsive AdSense Placement (Homepage Top - renders only when configured) */}
            <AdSenseBanner slotId={ADSENSE_CONFIG.slotHomeTop} className="my-4" />

            {/* Tools Grid Container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16">
              {/* Category Title & Count */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    {selectedCategory === 'all'
                      ? 'Popular PDF Tools'
                      : CATEGORIES.find((c) => c.id === selectedCategory)?.name || 'Tools'}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    {searchQuery
                      ? `Showing results for "${searchQuery}" (${filteredTools.length} tools found)`
                      : `${filteredTools.length} tools ready for browser processing`}
                  </p>
                </div>

                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-xs font-semibold text-red-600 hover:underline"
                  >
                    Reset Search
                  </button>
                )}
              </div>

              {/* Tools Grid */}
              {filteredTools.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                  {filteredTools.map((tool) => (
                    <ToolCard
                      key={tool.id}
                      tool={tool}
                      onClick={() => selectTool(tool.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-md mx-auto my-8">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                    🔍
                  </div>
                  <h3 className="text-base font-bold text-slate-800">No tools found</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    No PDF tool matches "{searchQuery}". Try searching for merge, split, compress, or ocr.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                    }}
                    className="mt-4 px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl"
                  >
                    View All Tools
                  </button>
                </div>
              )}

              {/* Responsive AdSense Placement (Homepage Mid - renders only when configured) */}
              <AdSenseBanner slotId={ADSENSE_CONFIG.slotHomeMid} className="my-8" />

              {/* Why Choose PDF Master Trust Section */}
              <section className="mt-14 pt-16 border-t border-slate-200/80">
                <div className="text-center max-w-2xl mx-auto mb-12">
                  <span className="text-xs font-bold text-red-600 uppercase tracking-wider">
                    Privacy by Design
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                    Why professionals choose PDF Master
                  </h2>
                  <p className="text-sm text-slate-500 mt-2">
                    Engineered to deliver high-speed PDF operations without compromising your personal or business privacy.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                      <Shield className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">Zero Server Uploads</h3>
                    <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
                      Your files never leave your browser memory. All conversions, compressions, and edits happen
                      locally on your device.
                    </p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                      <Zap className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">Blazing Fast Execution</h3>
                    <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
                      Powered by modern WebAssembly and native TypedArrays. No server queue waits or upload delays
                      on slow internet connections.
                    </p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
                      <Smartphone className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">Android & Mobile Optimized</h3>
                    <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
                      Touch-friendly controls, responsive canvas rendering, and low memory consumption for mobile browsers.
                    </p>
                  </div>
                </div>

                {/* Banner Callout */}
                <div className="mt-10 bg-gradient-to-r from-red-600 to-rose-700 rounded-3xl p-8 sm:p-10 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl shadow-red-500/20">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black">
                      Ready to process your document?
                    </h3>
                    <p className="text-red-100 text-xs sm:text-sm mt-1 max-w-xl">
                      Select any tool above to get started immediately. Free forever, no registration needed.
                    </p>
                  </div>
                  <button
                    onClick={() => selectTool('merge-pdf')}
                    className="px-6 py-3 bg-white text-red-600 hover:bg-red-50 font-bold rounded-2xl text-sm shadow-md transition-all shrink-0 cursor-pointer"
                  >
                    Start with Merge PDF
                  </button>
                </div>
              </section>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <Footer
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          if (activeToolId) goHome();
        }}
        onSelectTool={selectTool}
        onOpenModal={(modal) => setActiveModal(modal)}
      />

      {/* Legal & Informational Modals */}
      <LegalModal type={activeModal} onClose={() => setActiveModal(null)} />

      {/* Cookie & Advertising Consent Banner for Google AdSense Compliance */}
      <CookieConsentBanner onOpenPrivacyPolicy={() => setActiveModal('privacy')} />
    </div>
  );
}
