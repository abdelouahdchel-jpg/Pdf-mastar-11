import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ToolCard } from './components/ToolCard';
import { ToolWorkbench } from './components/ToolWorkbench';
import { Footer } from './components/Footer';
import { LegalModal } from './components/LegalModals';
import { AdSenseBanner } from './components/AdSenseBanner';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { ContactPage } from './components/ContactPage';
import { ADSENSE_CONFIG } from './services/adsenseService';
import { TOOLS_LIST, CATEGORIES } from './data/toolsList';
import { TOOLS_SEO_DATA } from './data/toolsSeo';
import { PDFTool, ToolCategory } from './types/tools';
import { Shield, Zap, Lock, Smartphone, CheckCircle, ArrowRight } from 'lucide-react';

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const [isContactPage, setIsContactPage] = useState<boolean>(false);
  const [activeModal, setActiveModal] = useState<'about' | 'privacy' | 'terms' | 'contact' | null>(null);

  // Synchronize clean path routing (/merge-pdf, /contact) and hash routing (#merge-pdf, #contact)
  useEffect(() => {
    const resolveCurrentRoute = () => {
      // 1. Check pathname (e.g. /merge-pdf or /contact)
      const pathname = window.location.pathname.replace(/^\/+/, '').replace(/\/+$/, '');
      if (pathname === 'contact') {
        setIsContactPage(true);
        setActiveToolId(null);
        return;
      }
      if (pathname && TOOLS_LIST.some((t) => t.id === pathname)) {
        setIsContactPage(false);
        setActiveToolId(pathname);
        return;
      }

      // 2. Fallback to hash (e.g. #contact, #merge-pdf) for backward compatibility
      const hash = window.location.hash.replace(/^#/, '');
      if (hash === 'contact') {
        setIsContactPage(true);
        setActiveToolId(null);
        return;
      }
      if (hash && TOOLS_LIST.some((t) => t.id === hash)) {
        setIsContactPage(false);
        setActiveToolId(hash);
        return;
      }

      // Default root
      setIsContactPage(false);
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

    if (isContactPage) {
      const contactTitle = 'Contact Us – PDF Master';
      const contactDesc =
        "We're Here to Help. Contact the PDF Master support team for questions, technical issues, or tool feedback. Official support email: brayachmohamad@gmail.com.";
      document.title = contactTitle;

      const descEl = document.querySelector('meta[name="description"]');
      if (descEl) descEl.setAttribute('content', contactDesc);

      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', contactTitle);

      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute('content', contactDesc);

      const ogUrl = document.querySelector('meta[property="og:url"]');
      if (ogUrl) ogUrl.setAttribute('content', `${baseUrl}/contact`);

      let canonicalEl = document.querySelector('link[rel="canonical"]');
      if (!canonicalEl) {
        canonicalEl = document.createElement('link');
        canonicalEl.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalEl);
      }
      canonicalEl.setAttribute('href', `${baseUrl}/contact`);

      try {
        // @ts-expect-error Google Analytics gtag
        if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
          // @ts-expect-error Google Analytics gtag
          window.gtag('event', 'page_view', {
            page_path: '/contact',
            page_title: contactTitle,
            page_location: `${baseUrl}/contact`,
          });
        }
      } catch {
        // ignore
      }
    } else if (activeToolId && TOOLS_SEO_DATA[activeToolId]) {
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

      try {
        // @ts-expect-error Google Analytics gtag
        if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
          // @ts-expect-error Google Analytics gtag
          window.gtag('event', 'page_view', {
            page_path: `/${activeToolId}`,
            page_title: seo.title,
            page_location: `${baseUrl}/${activeToolId}`,
          });
        }
      } catch {
        // ignore
      }
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

      try {
        // @ts-expect-error Google Analytics gtag
        if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
          // @ts-expect-error Google Analytics gtag
          window.gtag('event', 'page_view', {
            page_path: '/',
            page_title: defaultTitle,
            page_location: `${baseUrl}/`,
          });
        }
      } catch {
        // ignore
      }
    }
  }, [activeToolId, isContactPage]);

  // Keyboard shortcut '/' to search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        !activeToolId &&
        !isContactPage &&
        document.activeElement?.tagName !== 'INPUT'
      ) {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        searchInput?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeToolId, isContactPage]);

  const selectTool = (toolId: string) => {
    window.history.pushState({ toolId }, '', `/${toolId}`);
    setIsContactPage(false);
    setActiveToolId(toolId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToContact = () => {
    window.history.pushState({ page: 'contact' }, '', '/contact');
    setIsContactPage(true);
    setActiveToolId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goHome = () => {
    window.history.pushState({}, '', '/');
    setIsContactPage(false);
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
          if (activeToolId || isContactPage) goHome();
        }}
        onSelectTool={selectTool}
        onGoHome={goHome}
        onOpenModal={(modal) => {
          if (modal === 'contact') {
            navigateToContact();
          } else {
            setActiveModal(modal);
          }
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {isContactPage ? (
          <ContactPage
            onBackToHome={goHome}
            onOpenPrivacyPolicy={() => setActiveModal('privacy')}
          />
        ) : activeTool ? (
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

            {/* Responsive AdSense Placement (Homepage Top) */}
            <AdSenseBanner
              slotId={ADSENSE_CONFIG.slotHomeTop}
              slotLabel="أعلى الصفحة الرئيسية (Home Top)"
              className="my-4"
            />

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

              {/* Responsive AdSense Placement (Homepage Mid) */}
              <AdSenseBanner
                slotId={ADSENSE_CONFIG.slotHomeMid}
                slotLabel="وسط الصفحة الرئيسية (Home Mid)"
                className="my-8"
              />

              {/* Why Choose PDF Master Trust Section */}
              <section className="mt-14 pt-16 border-t border-slate-200/80">
                <div className="text-center max-w-2xl mx-auto mb-12">
                  <span className="text-xs font-bold text-red-600 uppercase tracking-wider">
                    Fast & Accessible
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                    Why users choose PDF Master
                  </h2>
                  <p className="text-sm text-slate-500 mt-2">
                    Engineered to deliver fast, accessible document tools directly in your browser without complicated setup.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                      <Shield className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">In-Browser Processing</h3>
                    <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
                      Core tools like merge, split, rotate, and watermark run directly in your browser, keeping document data on your device for these tasks.
                    </p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                      <Zap className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">Fast & Streamlined</h3>
                    <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
                      Designed with an intuitive interface to help you complete your document tasks quickly without queue delays or software downloads.
                    </p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
                      <Smartphone className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">Mobile & Desktop Ready</h3>
                    <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
                      Fully responsive layout optimized for smartphones, tablets, laptops, and desktop computers.
                    </p>
                  </div>
                </div>

                {/* Banner Callout */}
                <div className="mt-10 bg-gradient-to-r from-red-600 to-rose-700 rounded-3xl p-8 sm:p-10 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl shadow-red-500/20">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black">
                      Ready to work with your documents?
                    </h3>
                    <p className="text-red-100 text-xs sm:text-sm mt-1 max-w-xl">
                      Select any tool above to get started immediately. Free to use with no account registration needed.
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
          if (activeToolId || isContactPage) goHome();
        }}
        onSelectTool={selectTool}
        onOpenModal={(modal) => {
          if (modal === 'contact') {
            navigateToContact();
          } else {
            setActiveModal(modal);
          }
        }}
        onNavigateContact={navigateToContact}
      />

      {/* Legal & Informational Modals */}
      <LegalModal
        type={activeModal}
        onClose={() => setActiveModal(null)}
        onNavigateContact={navigateToContact}
        onOpenPrivacy={() => setActiveModal('privacy')}
      />

      {/* Cookie & Advertising Consent Banner for Google AdSense Compliance */}
      <CookieConsentBanner onOpenPrivacyPolicy={() => setActiveModal('privacy')} />
    </div>
  );
}
