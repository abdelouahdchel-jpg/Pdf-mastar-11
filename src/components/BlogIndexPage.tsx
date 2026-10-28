import React, { useState, useMemo } from 'react';
import { ArrowLeft, BookOpen, Clock, Calendar, ArrowRight, Search, FileText } from 'lucide-react';
import { BLOG_ARTICLES, BlogArticle } from '../data/blogArticles';

interface BlogIndexPageProps {
  onBackToHome: () => void;
  onSelectArticle: (slug: string) => void;
  onSelectTool: (toolId: string) => void;
}

export const BlogIndexPage: React.FC<BlogIndexPageProps> = ({
  onBackToHome,
  onSelectArticle,
  onSelectTool,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = useMemo(() => {
    const cats = new Set(BLOG_ARTICLES.map((a) => a.category));
    return ['all', ...Array.from(cats)];
  }, []);

  const filteredArticles = useMemo(() => {
    return BLOG_ARTICLES.filter((article) => {
      const matchesCat = selectedCategory === 'all' || article.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        article.title.toLowerCase().includes(q) ||
        article.excerpt.toLowerCase().includes(q) ||
        article.category.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto animate-in fade-in">
      {/* Top back navigation */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-red-600 transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to All Tools</span>
        </button>

        <div className="text-xs text-slate-500 font-medium">
          {filteredArticles.length} {filteredArticles.length === 1 ? 'guide' : 'guides'} available
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs mb-8">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600 mb-2">
            <BookOpen className="w-4 h-4" />
            <span>Knowledge Base &amp; Tutorials</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            PDF Master Guides &amp; Document Tips
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
            Practical, in-depth tutorials on merging, compressing, converting, editing, and protecting PDF files.
            Learn how browser-based document tools keep your files fast and private.
          </p>

          {/* Search bar inside header */}
          <div className="mt-6 relative max-w-lg">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guides (e.g. merge, compress, protect, word)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-600 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-medium"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category filter tabs */}
          <div className="mt-6 flex flex-wrap items-center gap-1.5 pt-4 border-t border-slate-100">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                  }`}
                >
                  {cat === 'all' ? 'All Guides' : cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Article Grid */}
      {filteredArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <article
              key={article.id}
              className="group bg-white rounded-2xl border border-slate-200/90 hover:border-red-400/80 p-6 shadow-xs hover:shadow-lg hover:shadow-red-500/10 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Quiet unboxed metadata */}
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                  <span className="font-semibold text-red-600">{article.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{article.readTime}</span>
                  </span>
                </div>

                <h2 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-red-600 transition-colors leading-snug">
                  <a
                    href={`/blog/${article.slug}`}
                    onClick={(e) => {
                      if (!e.metaKey && !e.ctrlKey) {
                        e.preventDefault();
                        onSelectArticle(article.slug);
                      }
                    }}
                    className="hover:underline"
                  >
                    {article.title}
                  </a>
                </h2>

                <p className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                  {article.excerpt}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-400">{article.publishedDate}</span>
                <a
                  href={`/blog/${article.slug}`}
                  onClick={(e) => {
                    if (!e.metaKey && !e.ctrlKey) {
                      e.preventDefault();
                      onSelectArticle(article.slug);
                    }
                  }}
                  className="text-red-600 hover:text-red-700 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                >
                  <span>Read Guide</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto my-8">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Search className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No guides found</h3>
          <p className="text-xs text-slate-500 mt-1">
            No articles match "{searchQuery}". Try searching for merge, split, compress, or privacy.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="mt-4 px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            Show All Guides
          </button>
        </div>
      )}

      {/* Explore tools callout */}
      <div className="mt-14 bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 sm:p-10 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-xl sm:text-2xl font-black">Ready to work with your documents?</h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            All PDF Master utilities are free to use with zero registration and 100% in-browser processing for core tasks.
          </p>
        </div>
        <button
          onClick={onBackToHome}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all shrink-0 cursor-pointer"
        >
          Explore All 38 Tools
        </button>
      </div>
    </div>
  );
};
