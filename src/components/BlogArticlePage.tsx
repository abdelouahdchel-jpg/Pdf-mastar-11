import React from 'react';
import {
  ArrowLeft,
  Clock,
  Calendar,
  Share2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Info,
  Wrench,
  BookOpen,
  ChevronRight,
} from 'lucide-react';
import { BlogArticle, BLOG_ARTICLES } from '../data/blogArticles';

interface BlogArticlePageProps {
  article: BlogArticle;
  onBackToBlog: () => void;
  onSelectArticle: (slug: string) => void;
  onSelectTool: (toolId: string) => void;
}

export const BlogArticlePage: React.FC<BlogArticlePageProps> = ({
  article,
  onBackToBlog,
  onSelectArticle,
  onSelectTool,
}) => {
  const [copiedLink, setCopiedLink] = React.useState(false);

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const relatedArticles = BLOG_ARTICLES.filter((a) => a.id !== article.id).slice(0, 3);

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto animate-in fade-in">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs text-slate-500 flex-wrap">
        <a
          href="/"
          onClick={(e) => {
            if (!e.metaKey && !e.ctrlKey) {
              e.preventDefault();
              window.location.pathname = '/';
            }
          }}
          className="hover:text-red-600 transition-colors"
        >
          Home
        </a>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <a
          href="/blog"
          onClick={(e) => {
            if (!e.metaKey && !e.ctrlKey) {
              e.preventDefault();
              onBackToBlog();
            }
          }}
          className="hover:text-red-600 transition-colors"
        >
          Blog
        </a>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-800 font-medium truncate max-w-xs">{article.title}</span>
      </nav>

      {/* Main Article Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Article Header */}
        <header className="p-6 sm:p-10 border-b border-slate-100 bg-gradient-to-b from-slate-50/80 to-white">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-3 flex-wrap">
            <span className="font-bold text-red-600 uppercase tracking-wider">{article.category}</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{article.publishedDate}</span>
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{article.readTime}</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {article.title}
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed max-w-3xl">
            {article.excerpt}
          </p>

          <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 font-bold flex items-center justify-center">
                P
              </div>
              <div>
                <p className="font-bold text-slate-900">{article.author}</p>
                <p className="text-slate-500 text-[11px]">PDF Master Engineering &amp; Research</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copiedLink ? 'Link Copied!' : 'Share Guide'}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content Body with Sidebar Table of Contents */}
        <div className="p-6 sm:p-10 lg:grid lg:grid-cols-12 lg:gap-10">
          {/* Main Reading Flow */}
          <article className="lg:col-span-8 space-y-10 text-slate-700 text-base leading-relaxed">
            {/* Introductory text */}
            <p className="text-lg text-slate-700 leading-relaxed font-normal">
              {article.content.intro}
            </p>

            {/* Direct Tool Callout Banner */}
            {article.relatedToolId && article.relatedToolName && (
              <div className="p-5 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Looking to use the {article.relatedToolName}?
                    </h3>
                    <p className="text-xs text-slate-600">
                      Run this task directly in your browser with zero uploads and complete privacy.
                    </p>
                  </div>
                </div>

                <a
                  href={`/${article.relatedToolId}`}
                  onClick={(e) => {
                    if (!e.metaKey && !e.ctrlKey) {
                      e.preventDefault();
                      onSelectTool(article.relatedToolId!);
                    }
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Open Tool</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {/* Sections */}
            {article.content.sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-24 space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight pt-2 border-t border-slate-100">
                  {section.title}
                </h2>

                {section.body.map((p, pIdx) => (
                  <p key={pIdx} className="text-slate-600 leading-relaxed">
                    {p}
                  </p>
                ))}

                {/* Optional Step-by-Step Box */}
                {section.steps && section.steps.length > 0 && (
                  <div className="my-6 space-y-3.5">
                    {section.steps.map((st) => (
                      <div
                        key={st.number}
                        className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3.5"
                      >
                        <div className="w-7 h-7 rounded-lg bg-red-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {st.number}
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-bold text-sm text-slate-900">{st.title}</h4>
                          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                            {st.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Optional Callout Box */}
                {section.callout && (
                  <div
                    className={`p-4 sm:p-5 rounded-2xl border text-xs sm:text-sm flex items-start gap-3 ${
                      section.callout.type === 'tip'
                        ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                        : section.callout.type === 'warning'
                        ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                        : 'bg-blue-50/80 border-blue-200 text-blue-950'
                    }`}
                  >
                    {section.callout.type === 'tip' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : section.callout.type === 'warning' ? (
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    ) : (
                      <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1">
                      <p className="font-bold">{section.callout.title}</p>
                      <p className="leading-relaxed opacity-90">{section.callout.text}</p>
                    </div>
                  </div>
                )}
              </section>
            ))}

            {/* FAQs Section */}
            {article.content.faqs && article.content.faqs.length > 0 && (
              <section id="faqs" className="scroll-mt-24 pt-6 border-t border-slate-200 space-y-5">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Frequently Asked Questions
                </h2>
                <div className="space-y-3">
                  {article.content.faqs.map((faq, fIdx) => (
                    <div
                      key={fIdx}
                      className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2"
                    >
                      <h4 className="font-bold text-sm sm:text-base text-slate-900">
                        {faq.question}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Conclusion */}
            <div className="pt-6 border-t border-slate-200 space-y-2">
              <h3 className="text-lg font-bold text-slate-900">Conclusion</h3>
              <p className="text-slate-600 leading-relaxed">{article.content.conclusion}</p>
            </div>
          </article>

          {/* Sticky Table of Contents Sidebar (Desktop) */}
          <aside className="hidden lg:block lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-red-600" />
                  <span>Table of Contents</span>
                </h3>
                <nav className="space-y-1.5 text-xs">
                  {article.tableOfContents.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className="block text-slate-600 hover:text-red-600 hover:underline py-1 transition-colors"
                    >
                      {item.title}
                    </a>
                  ))}
                </nav>
              </div>

              {/* In-Browser Security Badge */}
              <div className="p-5 bg-emerald-50/60 border border-emerald-200 rounded-2xl text-xs space-y-2 text-emerald-950">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>100% Client-Side Safe</span>
                </div>
                <p className="text-[11px] text-emerald-900/80 leading-relaxed">
                  Documents are processed in local device memory. Your confidential records are never uploaded to remote servers.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Related Guides Footer */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900">Related PDF Guides</h3>
          <button
            onClick={onBackToBlog}
            className="text-xs font-semibold text-red-600 hover:underline cursor-pointer"
          >
            View all guides →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {relatedArticles.map((rel) => (
            <article
              key={rel.id}
              className="group bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-red-400 transition-all flex flex-col justify-between"
            >
              <div>
                <span className="text-[11px] font-semibold text-red-600 block mb-1">
                  {rel.category}
                </span>
                <h4 className="font-bold text-sm text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2">
                  <a
                    href={`/blog/${rel.slug}`}
                    onClick={(e) => {
                      if (!e.metaKey && !e.ctrlKey) {
                        e.preventDefault();
                        onSelectArticle(rel.slug);
                      }
                    }}
                  >
                    {rel.title}
                  </a>
                </h4>
                <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {rel.excerpt}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                <span>{rel.readTime}</span>
                <span className="text-red-600 font-semibold group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                  <span>Read</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};
