import React from 'react';
import { ArrowRight } from 'lucide-react';
import { PDFTool } from '../types/tools';
import { ToolIcon } from './ToolIcon';

interface ToolCardProps {
  tool: PDFTool;
  onClick: () => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, onClick }) => {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className="group relative bg-white border border-slate-200/90 hover:border-red-400/80 rounded-2xl p-5 shadow-xs hover:shadow-lg hover:shadow-red-500/10 transition-all duration-200 flex flex-col justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 text-left"
    >
      <div>
        {/* Top row: Icon and Badge */}
        <div className="flex items-start justify-between mb-3.5">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white flex items-center justify-center transition-colors shadow-xs">
            <ToolIcon name={tool.icon} className="w-6 h-6 transition-transform group-hover:scale-110" />
          </div>

          {tool.badge && (
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                tool.badge === 'Popular'
                  ? 'bg-amber-100 text-amber-800'
                  : tool.badge === 'New'
                  ? 'bg-emerald-100 text-emerald-800'
                  : tool.badge === 'Fast'
                  ? 'bg-sky-100 text-sky-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {tool.badge}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 group-hover:text-red-600 transition-colors flex items-center gap-1.5">
          {tool.title}
        </h3>

        {/* Description */}
        <p className="mt-1.5 text-xs sm:text-sm text-slate-500 leading-relaxed line-clamp-2">
          {tool.description}
        </p>
      </div>

      {/* Card bottom action */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-red-600 transition-colors">
        <span className="truncate max-w-[170px]">{tool.acceptedFileTypesLabel}</span>
        <div className="flex items-center gap-1 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
          <span>Open</span>
          <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );
};
