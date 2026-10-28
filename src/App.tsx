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
import { BlogIndexPage } from './components/BlogIndexPage';
import { BlogArticlePage } from './components/BlogArticlePage';
import { AdminDashboardPage } from './components/AdminDashboardPage';
import { ADSENSE_CONFIG } from './services/adsenseService';
import { TOOLS_LIST, CATEGORIES } from './data/toolsList';
import { TOOLS_SEO_DATA } from './data/toolsSeo';
import { BLOG_ARTICLES, BlogArticle } from './data/blogArticles';
import { PDFTool, ToolCategory } from './types/tools';
import {
  Shield,
  Zap,
  Smartphone,
  Star,
  BookOpen,
  ArrowRight,
  Clock,
  Files,
  Minimize2,
  ArrowRightLeft,
  PenTool,
  ScanText,
  ShieldCheck,
} from 'lucide-react';

type PageState =
  | { type: 'home' }
  | { type: 'tool'; toolId: string }
  | { type: 'contact' }
  | { type: 'about' }
  | { type: 'privacy' }
  | { type: 'terms' }
  | { type: 'blog' }
  | { type: 'blog-article'; slug: string }
  | { type: 'admin' }
  | { type: 'not-found'; path: string };

const BASE_URL = 'https://pdf-mastar-11.netlify.app';

// Grouping structure for clean Directory display
interface DirectoryGroup {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  toolIds: string[];
}

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [pageState, setPageState] = useState<PageState>({ type: 'home' });
  const [activeModal, setActiveModal] = useState<'about' | 'privacy' | 'terms' | 'contact' | null>(null);

  // Synchronize clean path routing
  useEffect(() => {
    const resolveCurrentRoute = () => {
      const pathname = window.location.pathname.replace(/^\/+/, '').replace(/\/+$/, '');
      const hash = window.location.hash.replace(/^#/, '');

      // 1. Root pathname
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
        if (hash === 'blog') {
          setPageState({ type: 'blog' });
          return;
        }
        if (hash && hash.startsWith('blog/')) {
          const articleSlug = hash.replace(/^blog\//, '');
          const match = BLOG_ARTICLES.find((a) => a.slug === articleSlug);
          if (match) {
            setPageState({ type: 'blog-article', slug: match.slug });
            return;
          }
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
      if (pathname === 'blog') {
        setPageState({ type: 'blog' });
        return;
      }
      if (pathname.startsWith('blog/')) {
        const articleSlug = pathname.replace(/^blog\//, '');
        const match = BLOG_ARTICLES.find((a) => a.slug === articleSlug);
        if (match) {
          setPageState({ type: 'blog-article', slug: match.slug });
          return;
        }
      }
      // Owner admin route (hidden from public UI)
      if (pathname === 'admin') {
        setPageState({ type: 'admin' });
        return;
      }

      if (TOOLS_LIST.some((t) => t.id === pathname)) {
        setPageState({ type: 'tool', toolId: pathname });
        return;
      }

      // 3. Unrecognized -> 404
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

  // Synchronize document title, meta description, OpenGraph, canonical link, and Schema.org
  useEffect(() => {
    let title = 'PDF Master – Free Online PDF Tools (Merge, Split, Compress & Convert)';
    let description =
      'Merge, split, compress, convert, edit, and sign PDF files in your browser with PDF Master. Fast and accessible web tools with 100% in-browser processing.';
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
    } else if (pageState.type === 'blog') {
      title = 'PDF Guides, Tutorials & Document Processing Tips – PDF Master';
      description =
        'Explore comprehensive step-by-step guides on merging, compressing, converting, and protecting PDF files securely with browser-based tools.';
      canonicalPath = '/blog';
    } else if (pageState.type === 'blog-article') {
      const match = BLOG_ARTICLES.find((a) => a.slug === pageState.slug);
      if (match) {
        title = `${match.title} | PDF Master`;
        description = match.excerpt;
        canonicalPath = `/blog/${match.slug}`;
        schemaJson = {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: match.title,
          description: match.excerpt,
          datePublished: '2026-10-25',
          author: {
            '@type': 'Organization',
            name: match.author,
          },
          publisher: {
            '@type': 'Organization',
            name: 'PDF Master',
            url: `${BASE_URL}/`,
          },
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${BASE_URL}/blog/${match.slug}`,
          },
        };
      }
    } else if (pageState.type === 'admin') {
      title = 'Site Owner Portal – PDF Master';
      description = 'Administrative monitoring and compliance dashboard.';
      is404 = true; // force noindex
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

    // 1. Title
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

    // 5. Robots meta tag for 404/admin vs indexable
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

  const navigateToPage = (page: 'about' | 'privacy' | 'terms' | 'contact' | 'blog') => {
    const pathMap: Record<string, string> = {
      about: '/about',
      privacy: '/privacy-policy',
      terms: '/terms',
      contact: '/contact',
      blog: '/blog',
    };
    const targetPath = pathMap[page] || `/${page}`;
    window.history.pushState({ page }, '', targetPath);
    setPageState({ type: page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectBlogArticle = (slug: string) => {
    window.history.pushState({ slug }, '', `/blog/${slug}`);
    setPageState({ type: 'blog-article', slug });
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

  const activeArticle = useMemo(() => {
    if (pageState.type === 'blog-article') {
      return BLOG_ARTICLES.find((a) => a.slug === pageState.slug) || null;
    }
    return null;
  }, [pageState]);

  // Popular Tools Spotlight (Top 6 most frequently used)
  const popularTools = useMemo(() => {
    const popularIds = ['merge-pdf', 'compress-pdf', 'split-pdf', 'pdf-to-word', 'pdf-to-jpg', 'sign-pdf'];
    return popularIds.map((id) => TOOLS_LIST.find((t) => t.id === id)).filter((t): t is PDFTool => Boolean(t));
  }, []);

  // Directory categorical groupings based on existing tools
  const directoryGroups: DirectoryGroup[] = useMemo(() => {
    return [
      {
        id: 'organize-group',
        name: 'Organize PDF',
        description: 'Merge, split, extract, rotate, and rearrange pages into the exact order you need.',
        icon: <Files className="w-5 h-5 text-red-600" />,
        toolIds: [
          'merge-pdf',
          'split-pdf',
          'extract-pages',
          'remove-pages',
          'reorder-pages',
          'rotate-pages',
          'organize-pdf',
          'add-page-numbers',
        ],
      },
      {
        id: 'compress-group',
        name: 'Compress & Optimize',
        description: 'Reduce file size for email attachments and streamline internal object streams.',
        icon: <Minimize2 className="w-5 h-5 text-amber-600" />,
        toolIds: ['compress-pdf', 'optimize-pdf', 'flatten-pdf'],
      },
      {
        id: 'convert-group',
        name: 'Convert PDF',
        description: 'Convert PDF documents to and from Word, Excel, JPG, PNG, HTML, Text, and Markdown.',
        icon: <ArrowRightLeft className="w-5 h-5 text-blue-600" />,
        toolIds: [
          'pdf-to-word',
          'pdf-to-jpg',
          'pdf-to-excel',
          'pdf-to-png',
          'pdf-to-text',
          'pdf-to-html',
          'pdf-to-powerpoint',
          'word-to-pdf',
          'jpg-to-pdf',
          'png-to-pdf',
          'images-to-pdf',
          'txt-to-pdf',
          'html-to-pdf',
          'markdown-to-pdf',
        ],
      },
      {
        id: 'edit-group',
        name: 'Edit & Sign',
        description: 'Add electronic signatures, custom text, watermarks, stamps, and metadata.',
        icon: <PenTool className="w-5 h-5 text-emerald-600" />,
        toolIds: [
          'sign-pdf',
          'add-text',
          'add-image',
          'add-watermark',
          'edit-metadata',
          'annotate-pdf',
        ],
      },
      {
        id: 'ocr-group',
        name: 'OCR & Text Recognition',
        description: 'Recognize text from paper scans and images using in-browser Tesseract OCR engine.',
        icon: <ScanText className="w-5 h-5 text-purple-600" />,
        toolIds: ['ocr-pdf', 'extract-text', 'scanned-to-searchable'],
      },
      {
        id: 'protect-group',
        name: 'Advanced Tools & Security',
        description: 'Password protect, decrypt, compare documents, repair corrupt files, and extract assets.',
        icon: <ShieldCheck className="w-5 h-5 text-slate-800" />,
        toolIds: ['protect-pdf', 'unlock-pdf', 'compare-pdf', 'repair-pdf', 'extract-images'],
      },
    ];
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased selection:bg-red-500 selection:text-white">
      {/* Top Professional Header (Zero admin links) */}
      <Navbar
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          if (pageState.type !== 'home') goHome();
        }}
        onSelectTool={selectTool}
        onGoHome={goHome}
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
        ) : pageState.type === 'blog' ? (
          <BlogIndexPage
            onBackToHome={goHome}
            onSelectArticle={selectBlogArticle}
            onSelectTool={selectTool}
          />
        ) : pageState.type === 'blog-article' && activeArticle ? (
          <BlogArticlePage
            article={activeArticle}
            onBackToBlog={() => navigateToPage('blog')}
            onSelectArticle={selectBlogArticle}
            onSelectTool={selectTool}
          />
        ) : pageState.type === 'admin' ? (
          <AdminDashboardPage onBackToHome={goHome} />
        ) : pageState.type === 'not-found' ? (
          <NotFoundPage
            onBackToHome={goHome}
            onSelectTool={selectTool}
          />
        ) : activeTool ? (
          /* Active Tool Execution Workbench */
          <ToolWorkbench tool={activeTool} onBack={goHome} onSelectTool={selectTool} />
        ) : (
          /* Professional Online Tools Directory Homepage */
          <>
            {/* Hero Section with Search and Category Bar */}
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

            <div id="all-tools-directory" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
              {/* If Searching or Category is Filtered: Display Filtered Grid */}
              {searchQuery || selectedCategory !== 'all' ? (
                <div className="mb-14">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                        {searchQuery
                          ? `Search Results for "${searchQuery}"`
                          : CATEGORIES.find((c) => c.id === selectedCategory)?.name || 'Filtered Tools'}
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                        {filteredTools.length} {filteredTools.length === 1 ? 'tool' : 'tools'} ready for instant in-browser processing
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('all');
                      }}
                      className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
                    >
                      Clear Filters / View All
                    </button>
                  </div>

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
                        Reset Search
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Default Clean Directory View */
                <>
                  {/* 1. Popular Tools Spotlight Section */}
                  <section aria-label="Popular PDF Tools" className="mb-14">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                            Popular Tools
                          </h2>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                          Most frequently used document utilities, ready in one click.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                      {popularTools.map((tool) => (
                        <ToolCard
                          key={tool.id}
                          tool={tool}
                          onClick={() => selectTool(tool.id)}
                        />
                      ))}
                    </div>
                  </section>

                  {/* 2. Categorized Directory Sections */}
                  <div className="space-y-14">
                    {directoryGroups.map((group) => {
                      const toolsInGroup = group.toolIds
                        .map((id) => TOOLS_LIST.find((t) => t.id === id))
                        .filter((t): t is PDFTool => Boolean(t));

                      return (
                        <section key={group.id} aria-label={group.name} className="pt-2">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-5 pb-3 border-b border-slate-200">
                            <div className="flex items-center gap-2.5">
                              {group.icon}
                              <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                                {group.name}
                              </h3>
                              <span className="text-xs text-slate-400 font-medium">
                                ({toolsInGroup.length})
                              </span>
                            </div>
                            <p className="text-xs text-slate-500">
                              {group.description}
                            </p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                            {toolsInGroup.map((tool) => (
                              <ToolCard
                                key={tool.id}
                                tool={tool}
                                onClick={() => selectTool(tool.id)}
                              />
                            ))}
                          </div>
                        </section>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Responsive AdSense Placement (Homepage Mid) */}
              <AdSenseBanner
                slotId={ADSENSE_CONFIG.slotHomeMid}
                slotLabel="Home Mid"
                className="my-10"
              />

              {/* 3. Recently Added Articles Section */}
              <section aria-label="Latest PDF Guides" className="mt-14 pt-12 border-t border-slate-200/80">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-red-600" />
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        Latest PDF Guides &amp; Document Tips
                      </h2>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      Step-by-step tutorials and security insights written by our document engineering team.
                    </p>
                  </div>

                  <a
                    href="/blog"
                    onClick={(e) => {
                      if (!e.metaKey && !e.ctrlKey) {
                        e.preventDefault();
                        navigateToPage('blog');
                      }
                    }}
                    className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 hover:underline"
                  >
                    <span>View all 10 guides</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {BLOG_ARTICLES.slice(0, 3).map((article) => (
                    <article
                      key={article.id}
                      className="group bg-white rounded-2xl border border-slate-200/90 hover:border-red-400 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-semibold mb-2">
                          <span className="text-red-600 uppercase tracking-wider">{article.category}</span>
                          <span aria-hidden="true">·</span>
                          <span className="flex items-center gap-1 font-normal text-slate-500">
                            <Clock className="w-3 h-3" />
                            <span>{article.readTime}</span>
                          </span>
                        </div>

                        <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-red-600 transition-colors leading-snug line-clamp-2">
                          <a
                            href={`/blog/${article.slug}`}
                            onClick={(e) => {
                              if (!e.metaKey && !e.ctrlKey) {
                                e.preventDefault();
                                selectBlogArticle(article.slug);
                              }
                            }}
                          >
                            {article.title}
                          </a>
                        </h3>

                        <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {article.excerpt}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-400 text-[11px]">{article.publishedDate}</span>
                        <a
                          href={`/blog/${article.slug}`}
                          onClick={(e) => {
                            if (!e.metaKey && !e.ctrlKey) {
                              e.preventDefault();
                              selectBlogArticle(article.slug);
                            }
                          }}
                          className="font-bold text-red-600 hover:text-red-700 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                        >
                          <span>Read</span>
                          <ArrowRight className="w-3 h-3" />
                        </a>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="mt-4 text-center sm:hidden">
                  <a
                    href="/blog"
                    onClick={(e) => {
                      if (!e.metaKey && !e.ctrlKey) {
                        e.preventDefault();
                        navigateToPage('blog');
                      }
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:underline"
                  >
                    <span>View all 10 guides</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </section>

              {/* 4. Why Choose PDF Master Trust Section */}
              <section aria-label="Platform Advantages" className="mt-14 pt-16 border-t border-slate-200/80">
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
                      Core tools like merge, split, rotate, and watermark run directly in your browser sandbox, keeping document data on your device for these tasks.
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
                    type="button"
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

      {/* Clean Footer (with About, Contact, Privacy, Terms, and Blog) */}
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
