/**
 * Google AdSense integration service
 * Handles configuration verification, singleton script injection, and consent state.
 */

export const ADSENSE_CONFIG = {
  clientId: (import.meta.env.VITE_ADSENSE_CLIENT_ID || 'ca-pub-1555504428910902').trim(),
  slotHomeTop: (import.meta.env.VITE_ADSENSE_SLOT_HOME_TOP || '').trim(),
  slotHomeMid: (import.meta.env.VITE_ADSENSE_SLOT_HOME_MID || '').trim(),
  slotToolBottom: (import.meta.env.VITE_ADSENSE_SLOT_TOOL_BOTTOM || '').trim(),
  slotFooter: (import.meta.env.VITE_ADSENSE_SLOT_FOOTER || '').trim(),
};

/**
 * Validate that an AdSense Publisher ID is valid (format: ca-pub-XXXXXXXXXXXXXXXX)
 */
export function isAdSenseConfigured(): boolean {
  const id = ADSENSE_CONFIG.clientId;
  return Boolean(id && /^ca-pub-\d{10,}$/.test(id));
}

let scriptInjected = false;

/**
 * Inject the official Google AdSense library script as a singleton in <head>
 */
export function loadAdSenseScript(): void {
  if (typeof window === 'undefined' || !isAdSenseConfigured()) return;
  if (scriptInjected || document.querySelector('script[src*="adsbygoogle.js"]')) {
    scriptInjected = true;
    return;
  }

  try {
    const script = document.createElement('script');
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CONFIG.clientId}`;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.onerror = () => {
      console.warn('AdSense script failed to load (possible ad-blocker or network restriction).');
    };
    document.head.appendChild(script);
    scriptInjected = true;
  } catch (err) {
    console.warn('Could not inject AdSense script:', err);
  }
}

export type CookieConsentStatus = 'accepted' | 'declined' | 'pending';

const CONSENT_STORAGE_KEY = 'pdfmaster_ad_consent';

/**
 * Get current cookie consent status
 */
export function getCookieConsentStatus(): CookieConsentStatus {
  if (typeof window === 'undefined') return 'pending';
  const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
  if (stored === 'accepted' || stored === 'declined') {
    return stored;
  }
  return 'pending';
}

/**
 * Update user cookie consent preference
 */
export function setCookieConsentStatus(status: 'accepted' | 'declined'): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CONSENT_STORAGE_KEY, status);

  // If declined, configure non-personalized ads for Google AdSense
  if (status === 'declined') {
    try {
      // @ts-expect-error Google AdSense global NPA config
      window.adsbygoogle = window.adsbygoogle || [];
      // @ts-expect-error Google AdSense NPA flag
      window.adsbygoogle.requestNonPersonalizedAds = 1;
    } catch {
      // ignore
    }

    try {
      // @ts-expect-error Google Analytics gtag consent
      if (typeof window.gtag === 'function') {
        // @ts-expect-error Google Analytics gtag consent
        window.gtag('consent', 'update', {
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
        });
      }
    } catch {
      // ignore
    }
  } else if (status === 'accepted') {
    try {
      // @ts-expect-error Google Analytics gtag consent
      if (typeof window.gtag === 'function') {
        // @ts-expect-error Google Analytics gtag consent
        window.gtag('consent', 'update', {
          ad_storage: 'granted',
          ad_user_data: 'granted',
          ad_personalization: 'granted',
          analytics_storage: 'granted',
        });
      }
    } catch {
      // ignore
    }
  }
}
