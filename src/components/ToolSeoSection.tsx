import React from 'react';
import { PDFTool } from '../types/tools';
import { TOOLS_SEO_DATA } from '../data/toolsSeo';
import { TOOLS_LIST } from '../data/toolsList';
import { ToolIcon } from './ToolIcon';
import { CheckCircle2, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';

interface ToolSeoSectionProps {
  tool: PDFTool;
  onSelectTool: (toolId: string) => void;
}

export const ToolSeoSection: React.FC<ToolSeoSectionProps> = ({ tool, onSelectTool }) => {
  const seoData = TOOLS_SEO_DATA[tool.id];

  if (!seoData) return null;

  // Retrieve related tools objects
  const relatedTools = (seoData.relatedToolIds || [])
    .map((id) => TOOLS_LIST.find((t) => t.id === id))
    .filter((t): t is PDFTool => Boolean(t));

  return (
    <section
      aria-label={`About ${tool.title}`}
      className="mt-14 pt-10 border-t border-slate-200/80 text-left text-slate-800"
    >
      {/* 1. How It Works (Step-by-Step Guide) */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-2">
          <HelpCircle className="w-5 h-5 text-red-600" />
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            How to use {tool.title}
          </h2>
        </div>
        <p className="text-sm text-slate-500 mb-6">{seoData.heading}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {seoData.steps.map((s) => (
            <div
              key={s.step}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="w-8 h-8 rounded-xl bg-red-100 text-red-700 font-extrabold text-sm flex items-center justify-center mb-3">
                  {s.step}
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1">{s.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Key Benefits / Privacy & Quality */}
      <div className="mb-12 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <h3 className="text-lg sm:text-xl font-bold text-slate-900">
            Why use PDF Master for {tool.title}?
          </h3>
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-700">
          {seoData.features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 3. Related PDF Tools (Internal Linking) */}
      {relatedTools.length > 0 && (
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-4">
            Related PDF Tools
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {relatedTools.map((relTool) => (
              <button
                key={relTool.id}
                type="button"
                onClick={() => onSelectTool(relTool.id)}
                className="group p-4 bg-white border border-slate-200 hover:border-red-400 rounded-2xl text-left shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white flex items-center justify-center transition-colors mb-2.5">
                    <ToolIcon name={relTool.icon} className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 group-hover:text-red-600 transition-colors">
                    {relTool.title}
                  </h4>
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {relTool.description}
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-red-600">
                  <span>Open Tool</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
