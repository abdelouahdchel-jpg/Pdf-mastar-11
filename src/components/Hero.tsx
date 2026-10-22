import React from 'react';
import { Search, ShieldCheck, Zap, Lock, Sparkles } from 'lucide-react';
import { ToolCategory } from '../types/tools';
import { CATEGORIES } from '../data/toolsList';
import { ToolIcon } from './ToolIcon';

interface HeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: ToolCategory;
  onSelectCategory: (cat: ToolCategory) => void;
}

export const Hero: React.FC<HeroProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="relative pt-10 pb-8 sm:pt-14 sm:pb-12 border-b border-slate-200/80 bg-gradient-to-b from-white via-red-50/20 to-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Privacy & Fast badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-100/70 border border-red-200 text-red-700 text-xs sm:text-sm font-semibold mb-6 shadow-xs animate-in fade-in">
          <ShieldCheck className="w-4 h-4 text-red-600" />
          <span>Fast, Browser-Based Tools • Client-Side Processing</span>
        </div>

        {/* Primary Heading */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
          Every PDF tool you need, <br className="hidden sm:inline" />
          <span className="text-red-600 underline decoration-red-200 decoration-wavy decoration-2">
            in one place.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-4 sm:mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Merge, split, compress, convert, rotate, and manage your PDF files quickly and easily.
          Core document operations run directly in your browser for enhanced speed and privacy.
        </p>

        {/* Search Bar */}
        <div className="mt-8 max-w-xl mx-auto relative">
          <div className="relative flex items-center shadow-lg shadow-slate-200/60 rounded-2xl bg-white border border-slate-200 focus-within:border-red-500 focus-within:ring-3 focus-within:ring-red-100 transition-all">
            <Search className="w-5 h-5 text-slate-400 ml-4 pointer-events-none shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search any tool (e.g., merge, compress, word, sign, ocr)..."
              className="w-full py-3.5 px-3 text-slate-800 placeholder-slate-400 bg-transparent text-sm sm:text-base outline-none rounded-2xl"
              aria-label="Search tools"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="mr-3 px-2 py-1 text-xs text-slate-400 hover:text-slate-600 font-semibold"
              >
                Clear
              </button>
            )}
            <div className="hidden sm:flex items-center mr-3 px-2 py-1 bg-slate-100 rounded text-[11px] font-mono text-slate-400 border border-slate-200">
              /
            </div>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="mt-8 flex items-center justify-start sm:justify-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-none px-2">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-red-600 text-white shadow-md shadow-red-500/25 scale-[1.02]'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-slate-200/80 shadow-xs'
                }`}
              >
                <ToolIcon
                  name={cat.icon}
                  className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-500'}`}
                />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
