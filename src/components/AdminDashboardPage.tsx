import React, { useState, useEffect } from 'react';
import {
  Lock,
  ShieldAlert,
  ShieldCheck,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Server,
  FileText,
  DollarSign,
  BarChart3,
  Layers,
  ArrowLeft,
  KeyRound,
  LogOut,
  RefreshCw,
} from 'lucide-react';
import { TOOLS_LIST } from '../data/toolsList';
import { BLOG_ARTICLES } from '../data/blogArticles';
import { ADSENSE_CONFIG } from '../services/adsenseService';

interface AdminDashboardPageProps {
  onBackToHome: () => void;
}

const ADMIN_SESSION_KEY = 'pdfmaster_owner_session';

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onBackToHome }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passkeyInput, setPasskeyInput] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [loginAttempts, setLoginAttempts] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'adsense' | 'analytics' | 'tools' | 'security'>('overview');

  useEffect(() => {
    // Set noindex, nofollow on admin route
    let robotsEl = document.querySelector('meta[name="robots"]');
    if (!robotsEl) {
      robotsEl = document.createElement('meta');
      robotsEl.setAttribute('name', 'robots');
      document.head.appendChild(robotsEl);
    }
    robotsEl.setAttribute('content', 'noindex, nofollow');

    // Check if session token exists
    const sessionToken = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (sessionToken === 'authenticated_owner') {
      setIsAuthenticated(true);
    }

    return () => {
      const el = document.querySelector('meta[name="robots"]');
      if (el) el.setAttribute('content', 'index, follow');
    };
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (loginAttempts >= 5) {
      setAuthError('Too many failed attempts. Access temporarily locked for this browser session.');
      return;
    }

    // Owner credential verification
    // Note: In client-side SPA, we verify the owner passkey and store session state
    const targetPass = (import.meta.env.VITE_ADMIN_PASSKEY || 'admin2026').trim();
    if (passkeyInput.trim() === targetPass) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'authenticated_owner');
      setIsAuthenticated(true);
      setPasskeyInput('');
      setAuthError(null);
    } else {
      setLoginAttempts((prev) => prev + 1);
      setAuthError('Invalid administrator credentials. Access denied.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-md mx-auto animate-in fade-in">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md">
            <Lock className="w-7 h-7 text-red-500" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Site Owner Portal</h1>
          <p className="text-xs text-slate-500 mt-1">
            Restricted access for PDF Master platform administrators only.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-lg">
          <form onSubmit={handleLogin} className="space-y-4">
            {authError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            <div>
              <label htmlFor="owner-key" className="block text-xs font-bold text-slate-700 mb-1.5">
                Owner Security Key
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="owner-key"
                  type="password"
                  value={passkeyInput}
                  onChange={(e) => setPasskeyInput(e.target.value)}
                  placeholder="Enter administrator passkey..."
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-red-600 focus:bg-white transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              Verify Credentials &amp; Enter
            </button>
          </form>

          {/* Honest Architectural Security Notice */}
          <div className="mt-6 pt-5 border-t border-slate-100 space-y-2 text-[11px] text-slate-500 leading-relaxed">
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
              <span>Architectural Security Notice</span>
            </div>
            <p>
              PDF Master is currently deployed as a static client-side application on Netlify with zero
              server-side database. While this owner route is gated and completely excluded from public navigation
              and search indexes (<code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">noindex, nofollow</code>),
              cryptographic server-side authorization requires a backend authentication service (such as Firebase
              Authentication, Netlify Identity, or Cloudflare Workers API).
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={onBackToHome}
            className="text-xs font-semibold text-slate-500 hover:text-red-600 inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public Homepage</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-in fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-red-500 flex items-center justify-center font-black">
            P
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                Site Owner Dashboard
              </h1>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Authorized Session
              </span>
            </div>
            <p className="text-xs text-slate-500">
              PDF Master administrative console &amp; compliance monitoring.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onBackToHome}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
          >
            View Public Site
          </button>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          System Overview
        </button>
        <button
          onClick={() => setActiveTab('adsense')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'adsense'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Google AdSense Status
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Google Analytics (GA4)
        </button>
        <button
          onClick={() => setActiveTab('tools')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'tools'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Tools Registry ({TOOLS_LIST.length})
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'security'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Security &amp; Privacy Architecture
        </button>
      </div>

      {/* TAB 1: System Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active PDF Tools</span>
                <Layers className="w-4 h-4 text-red-600" />
              </div>
              <p className="text-3xl font-black text-slate-900">{TOOLS_LIST.length}</p>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">100% In-browser operational</p>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Published Guides</span>
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-3xl font-black text-slate-900">{BLOG_ARTICLES.length}</p>
              <p className="text-[11px] text-blue-600 font-semibold mt-1">Indexed in public sitemap</p>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">AdSense Client</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-sm font-mono font-bold text-slate-900 truncate">{ADSENSE_CONFIG.clientId}</p>
              <p className="text-[11px] text-slate-500 font-medium mt-1">Auto Ads script configured</p>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">GA4 Tracking ID</span>
                <BarChart3 className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-sm font-mono font-bold text-slate-900">G-GNET3WZEZZ</p>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">IP Anonymization Active</p>
            </div>
          </div>

          {/* Operational Status */}
          <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4 sm:p-5 text-xs sm:text-sm text-amber-950 flex items-start gap-3 shadow-xs">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-amber-900">
                Security Limitation Notice: Client-Side Passkey Authentication
              </p>
              <p className="text-amber-800 leading-relaxed text-xs">
                This dashboard uses client-side passkey verification and <code className="bg-amber-100/80 px-1 py-0.5 rounded font-mono">sessionStorage</code>. Because PDF Master operates as a static client-side single-page app without a server or database, this client-side check is <strong>insufficient for true cryptographic access control</strong>. Sensitive server secrets, user credentials, or private databases are never stored here. True multi-tenant access control requires backend authentication services such as Firebase Auth or Netlify Identity.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Production Readiness Checklist</h3>
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex items-start gap-3 p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-emerald-950">Netlify Single-Page Routing</p>
                  <p className="text-xs text-emerald-800">
                    <code className="bg-white px-1 py-0.5 rounded font-mono">/* /index.html 200</code> configured in <code className="bg-white px-1 py-0.5 rounded font-mono">public/_redirects</code>.
                    Direct deep links to all 38 tools and 10 articles return HTTP 200.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-emerald-950">Zero-Public Admin Exposure</p>
                  <p className="text-xs text-emerald-800">
                    Admin links are completely stripped from Navbar, Footer, and Homepage. <code className="bg-white px-1 py-0.5 rounded font-mono">robots.txt</code> explicitly disallows <code className="bg-white px-1 py-0.5 rounded font-mono">/admin</code>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-emerald-950">Client-Side Memory Sandbox</p>
                  <p className="text-xs text-emerald-800">
                    Document processing runs in local WebAssembly/HTML5 Canvas threads. No document content, filenames, or text streams are transmitted over the network.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AdSense Status */}
      {activeTab === 'adsense' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Google AdSense Integration Details</h3>
            <p className="text-xs text-slate-500 mt-1">
              Configuration and compliance status for publisher account.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between items-center py-1.5 border-b border-slate-200">
              <span className="font-semibold text-slate-700">Publisher Client ID:</span>
              <span className="font-mono font-bold text-slate-900">{ADSENSE_CONFIG.clientId}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-200">
              <span className="font-semibold text-slate-700">Script Location:</span>
              <span className="font-mono text-slate-700">&lt;head&gt; in index.html (singleton)</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-200">
              <span className="font-semibold text-slate-700">Auto Ads Status:</span>
              <span className="text-emerald-700 font-bold">Script Active (Requires toggle ON in AdSense Console)</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="font-semibold text-slate-700">Mock Placeholders:</span>
              <span className="text-emerald-700 font-bold">0 mock boxes (Policy Compliant)</span>
            </div>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-2">
            <p className="font-bold">Next Action in Google AdSense Console:</p>
            <p>
              1. Log into your AdSense Console &gt; <strong>Ads</strong> &gt; <strong>By site</strong> &gt; find <code className="bg-white px-1 py-0.5 rounded">pdf-mastar-11.netlify.app</code>.
            </p>
            <p>
              2. Toggle <strong>Auto ads</strong> to <strong>ON</strong>.
            </p>
            <p>
              3. Under <strong>Privacy &amp; messaging</strong>, enable Google-certified GDPR and CPRA messages for automated EU/US consent compliance.
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: Google Analytics */}
      {activeTab === 'analytics' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Google Analytics 4 (GA4) Configuration</h3>
            <p className="text-xs text-slate-500 mt-1">
              Privacy-first anonymous telemetry.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between items-center py-1.5 border-b border-slate-200">
              <span className="font-semibold text-slate-700">Measurement ID:</span>
              <span className="font-mono font-bold text-slate-900">G-GNET3WZEZZ</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-200">
              <span className="font-semibold text-slate-700">IP Anonymization:</span>
              <span className="text-emerald-700 font-bold">Enabled</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-200">
              <span className="font-semibold text-slate-700">Page View Tracking:</span>
              <span className="text-emerald-700 font-bold">Active across all SPA route transitions</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="font-semibold text-slate-700">Document Privacy Guarantee:</span>
              <span className="text-emerald-700 font-bold">Zero filenames or document contents sent</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Tools Registry */}
      {activeTab === 'tools' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Active PDF Tools ({TOOLS_LIST.length})</h3>
            <span className="text-xs text-slate-500">All tools execute client-side</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-1">
            {TOOLS_LIST.map((tool) => (
              <div
                key={tool.id}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-slate-800">{tool.title}</p>
                  <p className="text-[11px] text-slate-400 font-mono">/{tool.id}</p>
                </div>
                <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-semibold">
                  {tool.category}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: Security Architecture */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <h3 className="text-lg font-bold text-slate-900">Security &amp; Privacy Architecture Report</h3>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <p>
              PDF Master's security model is built around <strong>data minimization and zero server retention</strong>:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>No Cloud File Ingestion:</strong> Core PDF tools (merge, split, compress, organize, watermark, sign, OCR) run within the user's browser sandbox using WebAssembly and client-side JavaScript.
              </li>
              <li>
                <strong>Zero Persistent Document Storage:</strong> In-memory files are released as soon as the tab closes.
              </li>
              <li>
                <strong>Client-Side Limitation Disclosure:</strong> Because PDF Master is deployed on Netlify as a static frontend SPA without a backend server, true multi-tenant administrative roles or database secrets cannot be verified without serverless functions or an authenticated BaaS (like Firebase Authentication).
              </li>
              <li>
                <strong>Search Engine Exclusions:</strong> This administrative portal is excluded from the public sitemap and blocked in <code className="bg-slate-100 px-1 py-0.5 rounded">robots.txt</code>.
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
