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
import { AboutPage } from './components/AboutPage';
import { PrivacyPolicyPage } from './components/PrivacyPolicyPage';
import { TermsPage } from './components/TermsPage';
import { NotFoundPage } from './components/NotFoundPage';
import { ADSENSE_CONFIG } from './services/adsenseService';
import { TOOLS_LIST, CATEGORIES } from './data/toolsList';
import { TOOLS_SEO_DATA } from './data/toolsSeo';
import { ToolCategory } from './types/tools';
import { Shield, Zap, Smartphone } from 'lucide-react';

type PageState =
  | { type: 'home' }
  | { type: 'tool'; toolId: string }
  | { type: 'contact' }
  | { type: 'about' }
  | { type: 'privacy' }
  | { type: 'terms' }
  | { type: 'not-found'; path: string };

const BASE_URL = 'https://pdf-mastar-11.netlify.app';

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [pageState, setPageState] = useState<PageState>({ type: 'home' });
  const [activeModal, setActiveModal] = useState<'about' | 'privacy' | 'terms' | 'contact' | null>(null);

  // Synchronize clean path routing (/merge-pdf, /contact, /about, /privacy-policy, /terms) and hash fallback
  useEffect(() => {
    const resolveCurrentRoute = () => {
      const pathname = window.location.pathname.replace(/^\/+/, '').replace(/\/+$/, '');
      const hash = window.location.hash.replace(/^#/, '');

      // 1. If root pathname
      if (!pathname) {
        if (hash === 'contact') {
          setPageState({ type: 'contact' });
          return;
        }
        if (hash === 'about' || hash === 'about-us') {
          setPageState({ type: 'about' });
          return;
        }
        if (hash === 'privacy' || hash === 'privacy-policy') {
          setPageState({ type: 'privacy' });
          return;
        }
        if (hash === 'terms' || hash === 'terms-of-service') {
          setPageState({ type: 'terms' });
          return;
        }
        if (hash && TOOLS_LIST.some((t) => t.id === hash)) {
          setPageState({ type: 'tool', toolId: hash });
          return;
        }
        setPageState({ type: 'home' });
        return;
      }

      // 2. Exact pathname routes
      if (pathname === 'contact') {
        setPageState({ type: 'contact' });
        return;
      }
      if (pathname === 'about' || pathname === 'about-us') {
        setPageState({ type: 'about' });
        return;
      }
      if (pathname === 'privacy' || pathname === 'privacy-policy') {
        setPageState({ type: 'privacy' });
        return;
      }
      if (pathname === 'terms' || pathname === 'terms-of-service') {
        setPageState({ type: 'terms' });
        return;
      }
      if (TOOLS_LIST.some((t) => t.id === pathname)) {
        setPageState({ type: 'tool', toolId: pathname });
        return;
      }

      // 3. Fallback for unrecognized URLs -> genuine 404
      setPageState({ type: 'not-found', path: pathname });
    };

    resolveCurrentRoute();
    window.addEventListener('popstate', resolveCurrentRoute);
    window.addEventListener('hashchange', resolveCurrentRoute);
    return () => {
      window.removeEventListener('popstate', resolveCurrentRoute);
      window.removeEventListener('hashchange', resolveCurrentRoute);
    };
  }, []);

  // Synchronize document title, meta description, OpenGraph, canonical link, and Schema.org structured data
  useEffect(() => {
    let title = 'PDF Master – Merge, Split, Compress & Convert PDF Files';
    let description =
      'Merge, split, compress, convert, edit, and sign PDF files in your browser with PDF Master. Fast and accessible web tools with in-browser processing for core operations.';
    let canonicalPath = '';
    let is404 = false;
    let schemaJson: Record<string, unknown> | null = null;

    if (pageState.type === 'home') {
      canonicalPath = '';
      schemaJson = {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'PDF Master',
        url: `${BASE_URL}/`,
        description,
        applicationCategory: 'ProductivityApplication',
        operatingSystem: 'All',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
      };
    } else if (pageState.type === 'contact') {
      title = 'Contact Us – PDF Master';
      description =
        "We're Here to Help. Contact the PDF Master support team for questions, technical issues, or tool feedback. Official support email: brayachmohamad@gmail.com.";
      canonicalPath = '/contact';
      schemaJson = {
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        name: 'Contact Us – PDF Master',
        url: `${BASE_URL}/contact`,
        description,
        mainEntity: {
          '@type': 'Organization',
          name: 'PDF Master',
          url: `${BASE_URL}/`,
          contactPoint: {
            '@type': 'ContactPoint',
            email: 'brayachmohamad@gmail.com',
            contactType: 'customer support',
          },
        },
      };
    } else if (pageState.type === 'about') {
      title = 'About Us – PDF Master | Fast, Accessible & Private PDF Tools';
      description =
        'Learn about PDF Master: fast, accessible online document utilities with 100% in-browser processing for core tasks. Zero queues, zero forced sign-ups.';
      canonicalPath = '/about';
      schemaJson = {
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        name: 'About PDF Master',
        url: `${BASE_URL}/about`,
        description,
      };
    } else if (pageState.type === 'privacy') {
      title = 'Privacy & File Retention Policy – PDF Master';
      description =
        'PDF Master privacy and file retention policy: local in-browser document processing, immediate memory clearing, Google AdSense cookies, and advertising opt-out options.';
      canonicalPath = '/privacy-policy';
    } else if (pageState.type === 'terms') {
      title = 'Terms of Service – PDF Master';
      description =
        'Terms of service and permitted use for PDF Master browser-based document processing utilities.';
      canonicalPath = '/terms';
    } else if (pageState.type === 'tool') {
      const seo = TOOLS_SEO_DATA[pageState.toolId];
      const toolObj = TOOLS_LIST.find((t) => t.id === pageState.toolId);
      if (seo) {
        title = seo.title;
        description = seo.description;
      }
      canonicalPath = `/${pageState.toolId}`;
      schemaJson = {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: toolObj ? `${toolObj.title} – PDF Master` : 'PDF Master Tool',
        url: `${BASE_URL}/${pageState.toolId}`,
        description,
        applicationCategory: 'ProductivityApplication',
        operatingSystem: 'All',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
      };
    } else if (pageState.type === 'not-found') {
      title = 'Page Not Found (404) – PDF Master';
      description = 'The requested PDF tool or page could not be found.';
      is404 = true;
    }

    // 1. Update Title
    document.title = title;

    // 2. Meta description
    const descEl = document.querySelector('meta[name="description"]');
    if (descEl) descEl.setAttribute('content', description);

    // 3. OpenGraph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', description);

    const canonicalUrl = `${BASE_URL}${canonicalPath ? canonicalPath : '/'}`;
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', canonicalUrl);

    // 4. Canonical link tag
    let canonicalEl = document.querySelector('link[rel="canonical"]');
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute('href', canonicalUrl);

    // 5. Robots meta tag for 404 vs indexable
    let robotsEl = document.querySelector('meta[name="robots"]');
    if (is404) {
      if (!robotsEl) {
        robotsEl = document.createElement('meta');
        robotsEl.setAttribute('name', 'robots');
        document.head.appendChild(robotsEl);
      }
      robotsEl.setAttribute('content', 'noindex, nofollow');
    } else if (robotsEl) {
      robotsEl.setAttribute('content', 'index, follow');
    }

    // 6. Schema.org structured data update
    if (schemaJson) {
      let schemaScript = document.getElementById('schema-structured-data') as HTMLScriptElement | null;
      if (!schemaScript) {
        schemaScript = document.createElement('script');
        schemaScript.id = 'schema-structured-data';
        schemaScript.type = 'application/ld+json';
        document.head.appendChild(schemaScript);
      }
      schemaScript.textContent = JSON.stringify(schemaJson);
    }

    // 7. Google Analytics 4 page_view tracking
    try {
      // @ts-expect-error Google Analytics gtag
      if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        // @ts-expect-error Google Analytics gtag
        window.gtag('event', 'page_view', {
          page_path: canonicalPath || '/',
          page_title: title,
          page_location: canonicalUrl,
        });
      }
    } catch {
      // ignore
    }
  }, [pageState]);

  // Keyboard shortcut '/' to search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        pageState.type === 'home' &&
        document.activeElement?.tagName !== 'INPUT'
      ) {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        searchInput?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pageState]);

  const selectTool = (toolId: string) => {
    window.history.pushState({ toolId }, '', `/${toolId}`);
    setPageState({ type: 'tool', toolId });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToPage = (page: 'about' | 'privacy' | 'terms' | 'contact') => {
    const pathMap: Record<string, string> = {
      about: '/about',
      privacy: '/privacy-policy',
      terms: '/terms',
      contact: '/contact',
    };
    const targetPath = pathMap[page] || `/${page}`;
    window.history.pushState({ page }, '', targetPath);
    setPageState({ type: page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goHome = () => {
    window.history.pushState({}, '', '/');
    setPageState({ type: 'home' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter tools for homepage
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
    if (pageState.type === 'tool') {
      return TOOLS_LIST.find((t) => t.id === pageState.toolId) || null;
    }
    return null;
  }, [pageState]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased selection:bg-red-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          if (pageState.type !== 'home') goHome();
        }}
        onSelectTool={selectTool}
        onGoHome={goHome}
        onOpenModal={(modal) => {
          navigateToPage(modal);
        }}
        onNavigatePage={navigateToPage}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {pageState.type === 'contact' ? (
          <ContactPage
            onBackToHome={goHome}
            onOpenPrivacyPolicy={() => navigateToPage('privacy')}
          />
        ) : pageState.type === 'about' ? (
          <AboutPage
            onBackToHome={goHome}
            onSelectTool={selectTool}
            onNavigateContact={() => navigateToPage('contact')}
          />
        ) : pageState.type === 'privacy' ? (
          <PrivacyPolicyPage
            onBackToHome={goHome}
            onNavigateContact={() => navigateToPage('contact')}
          />
        ) : pageState.type === 'terms' ? (
          <TermsPage
            onBackToHome={goHome}
            onNavigateContact={() => navigateToPage('contact')}
          />
        ) : pageState.type === 'not-found' ? (
          <NotFoundPage
            onBackToHome={goHome}
            onSelectTool={selectTool}
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
              slotLabel="Home Top"
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
                    className="text-xs font-semibold text-red-600 hover:underline cursor-pointer"
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
                    className="mt-4 px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    View All Tools
                  </button>
                </div>
              )}

              {/* Responsive AdSense Placement (Homepage Mid) */}
              <AdSenseBanner
                slotId={ADSENSE_CONFIG.slotHomeMid}
                slotLabel="Home Mid"
                className="my-8"
              />

              {/* Why Choose PDF Master Trust Section */}
              <section className="mt-14 pt-16 border-t border-slate-200/80">
                <div className="text-center max-w-2xl mx-auto mb-12">
                  <span className="text-xs font-bold text-red-600 uppercase tracking-wider">
                    Fast &amp; Accessible
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
                    <h3 className="text-base font-bold text-slate-900">Fast &amp; Streamlined</h3>
                    <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
                      Designed with an intuitive interface to help you complete your document tasks quickly without queue delays or software downloads.
                    </p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
                      <Smartphone className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">Mobile &amp; Desktop Ready</h3>
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
          if (pageState.type !== 'home') goHome();
        }}
        onSelectTool={selectTool}
        onOpenModal={(modal) => {
          navigateToPage(modal);
        }}
        onNavigateContact={() => navigateToPage('contact')}
        onNavigatePage={navigateToPage}
      />

      {/* Legal & Informational Modals */}
      <LegalModal
        type={activeModal}
        onClose={() => setActiveModal(null)}
        onNavigateContact={() => navigateToPage('contact')}
        onOpenPrivacy={() => navigateToPage('privacy')}
      />

      {/* Cookie & Advertising Consent Banner for Google AdSense Compliance */}
      <CookieConsentBanner onOpenPrivacyPolicy={() => navigateToPage('privacy')} />
    </div>
  );
}
