import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cookie, X } from 'lucide-react';
import {
  isAdSenseConfigured,
  getCookieConsentStatus,
  setCookieConsentStatus,
  CookieConsentStatus,
} from '../services/adsenseService';

interface CookieConsentBannerProps {
  onOpenPrivacyPolicy: () => void;
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({
  onOpenPrivacyPolicy,
}) => {
  const [consentStatus, setConsentStatus] = useState<CookieConsentStatus>('accepted');

  useEffect(() => {
    // Only show consent banner if AdSense is actively configured and consent has not yet been given
    if (isAdSenseConfigured()) {
      setConsentStatus(getCookieConsentStatus());
    }
  }, []);

  if (consentStatus !== 'pending') {
    return null;
  }

  const handleAccept = () => {
    setCookieConsentStatus('accepted');
    setConsentStatus('accepted');
  };

  const handleDecline = () => {
    setCookieConsentStatus('declined');
    setConsentStatus('declined');
  };

  return (
    <aside
      aria-label="Cookie and Advertising Consent"
      className="fixed bottom-0 inset-x-0 z-50 p-4 bg-slate-900/95 backdrop-blur-md text-white border-t border-slate-800 shadow-2xl animate-in slide-in-from-bottom duration-300"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center shrink-0 mt-0.5">
            <Cookie className="w-5 h-5" />
          </div>
          <div className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            <p className="font-semibold text-white">Privacy & Advertising Notice</p>
            <p className="mt-0.5">
              We and our advertising partners (including Google AdSense) use cookies to serve ads
              based on your visits. Your documents are processed <strong>100% locally</strong> on
              your device and are never shared. You can review our{' '}
              <button
                type="button"
                onClick={onOpenPrivacyPolicy}
                className="text-red-400 underline hover:text-red-300 font-medium"
              >
                Privacy Policy
              </button>{' '}
              for details on opting out.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={handleDecline}
            className="flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Non-Personalized Only
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className="flex-1 md:flex-initial px-5 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/30 transition-colors cursor-pointer"
          >
            Accept All
          </button>
        </div>
      </div>
    </aside>
  );
};
