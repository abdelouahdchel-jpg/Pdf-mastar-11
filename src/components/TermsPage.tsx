import React from 'react';
import { ArrowLeft, FileText, CheckCircle2, AlertTriangle, Shield } from 'lucide-react';

interface TermsPageProps {
  onBackToHome: () => void;
  onNavigateContact: () => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({
  onBackToHome,
  onNavigateContact,
}) => {
  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto animate-in fade-in">
      {/* Back button */}
      <div className="mb-6">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-red-600 transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Tools</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Header */}
        <div className="p-6 sm:p-10 border-b border-slate-100 bg-gradient-to-b from-slate-50/80 to-white">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold tracking-wide uppercase mb-3">
            <FileText className="w-3.5 h-3.5 text-slate-600" />
            <span>Legal Agreement</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Terms of Service
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
            Please read these Terms of Service carefully before accessing or using the PDF Master website and document tools.
          </p>
          <p className="mt-2 text-xs text-slate-400">
            Last updated: October 2026 • Effective immediately
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-10 space-y-8 text-slate-700 text-sm leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">1. Acceptance of Terms</h2>
            <p className="text-slate-600">
              By accessing and using PDF Master, you acknowledge that you have read, understood, and agree to be bound
              by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our website.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">2. Permitted Use</h2>
            <p className="text-slate-600">
              PDF Master provides browser-based tools for organizing, converting, compressing, editing, and protecting
              PDF documents. You may use our services for lawful personal, educational, and commercial document tasks.
            </p>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2">
              <p className="font-semibold text-slate-800">You agree not to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Use the service to process documents that violate applicable laws or copyright protections.</li>
                <li>Attempt to bypass, disable, or tamper with security features or advertising integrations.</li>
                <li>Deploy automated scrapers or bots to disrupt platform availability for other users.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">3. Disclaimer of Warranties</h2>
            <p className="text-slate-600">
              PDF Master is provided on an "as is" and "as available" basis without warranties of any kind, whether
              express or implied. While our algorithms are rigorously tested for format fidelity and speed, we do not
              guarantee that all document conversions will produce identical visual layouts across all PDF versions.
            </p>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Important Backup Recommendation:</strong> We strongly recommend maintaining original, local
                backup copies of any critical contracts or files before performing irreversible operations like page deletion.
              </span>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">4. Limitation of Liability</h2>
            <p className="text-slate-600">
              To the fullest extent permitted by applicable law, PDF Master and its operators shall not be liable for
              any indirect, incidental, special, consequential, or punitive damages arising from the use of or inability
              to use our document tools.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">5. Contact Information</h2>
            <p className="text-slate-600">
              If you have any questions or require clarification regarding these terms, please contact us at:
            </p>
            <div className="p-4 bg-slate-900 text-white rounded-2xl text-xs space-y-1">
              <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">
                Support Email
              </span>
              <a
                href="mailto:brayachmohamad@gmail.com"
                className="text-sm font-mono font-bold text-red-400 hover:text-red-300 underline"
              >
                brayachmohamad@gmail.com
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
