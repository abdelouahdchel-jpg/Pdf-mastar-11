import React from 'react';
import { ArrowLeft, ShieldCheck, Lock, EyeOff, Cookie, Mail, CheckCircle2 } from 'lucide-react';

interface PrivacyPolicyPageProps {
  onBackToHome: () => void;
  onNavigateContact: () => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold tracking-wide uppercase mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Privacy &amp; Data Protection</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Privacy &amp; File Retention Policy
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
            At PDF Master, we believe your personal documents belong solely to you. This policy outlines
            how our browser-based tools operate, our zero-retention architecture, and advertising practices.
          </p>
          <p className="mt-2 text-xs text-slate-400">
            Last updated: October 2026 • Effective immediately
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-10 space-y-8 text-slate-700 text-sm leading-relaxed">
          {/* Highlight Box */}
          <div className="p-4 sm:p-5 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-emerald-900 text-xs sm:text-sm font-medium flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong>Client-Side Document Handling:</strong> For core operations like merging, splitting,
              reordering, watermarking, electronic signing, and page numbering, your files are processed directly
              within your browser sandbox using client-side JavaScript and WebAssembly. Your document contents
              remain on your device for these operations.
            </div>
          </div>

          {/* Section 1 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-700" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                1. Local In-Browser Processing
              </h2>
            </div>
            <p className="text-slate-600">
              PDF Master is built with modern web technologies that enable complex document operations to execute
              locally on your computer, smartphone, or tablet. We do not store, inspect, copy, or sell the
              contents of your PDF documents during these browser-based operations.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-slate-700" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                2. Data Retention &amp; Memory Clearing
              </h2>
            </div>
            <p className="text-slate-600">
              When you load a file into a client-side tool, the file data resides temporarily in your browser's
              random-access memory (RAM). Once you close the browser tab, navigate away, or click "Process Another File",
              the temporary in-memory document data is immediately discarded by your browser. No files are retained on our servers.
            </p>
          </section>

          {/* Section 3: Google Analytics */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-slate-700" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                3. Anonymous Analytics (Google Analytics 4)
              </h2>
            </div>
            <p className="text-slate-600">
              To monitor platform stability, identify broken links, and optimize tool performance, PDF Master uses
              Google Analytics 4 (Measurement ID: <code>G-GNET3WZEZZ</code>) with IP anonymization enabled.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
              <li>Analytics collects aggregate, non-personally identifiable metrics such as page visits, device type, and browser version.</li>
              <li><strong>Strict Privacy Rule:</strong> We never transmit document contents, file names, text extracted from PDFs, or signature data to Google Analytics.</li>
            </ul>
          </section>

          {/* Section 4: Google AdSense */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Cookie className="w-4 h-4 text-slate-700" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                4. Google AdSense &amp; Advertising Cookies
              </h2>
            </div>
            <p className="text-slate-600">
              To keep our PDF utilities free and accessible to everyone without mandatory paid subscriptions or accounts,
              PDF Master displays advertisements served by Google AdSense (Publisher ID: <code>ca-pub-1555504428910902</code>).
            </p>
            <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <p>
                <strong>Third-Party Cookies:</strong> Third-party vendors, including Google, use cookies to serve ads
                based on a user's prior visits to this website or other websites on the Internet.
              </p>
              <p>
                <strong>Personalized vs. Non-Personalized Ads:</strong> Google's use of advertising cookies enables it
                and its partners to serve ads to users based on their visit to PDF Master and/or other sites on the Internet.
                Users who decline personalized cookies in our consent prompt will receive non-personalized ads.
              </p>
              <p>
                <strong>Opt-Out Options:</strong> You may opt out of personalized advertising by visiting{' '}
                <a
                  href="https://www.google.com/settings/ads"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-600 underline font-semibold"
                >
                  Google Ads Settings
                </a>{' '}
                or by visiting{' '}
                <a
                  href="https://www.aboutads.info"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-600 underline font-semibold"
                >
                  aboutads.info
                </a>.
              </p>
              <p>
                <strong>Zero Document Exposure:</strong> Advertising scripts have absolutely NO access to your uploaded files,
                document text, signature drawings, or processed files. All document data is strictly sandboxed.
              </p>
            </div>
          </section>

          {/* Section 5: Contact */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-700" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                5. Questions &amp; Support Contact
              </h2>
            </div>
            <p className="text-slate-600">
              If you have any questions about this Privacy Policy, your document privacy, or our data practices,
              please reach out to our official support team:
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
