import React, { useEffect, useRef, useState } from 'react';
import { isAdSenseConfigured, ADSENSE_CONFIG, loadAdSenseScript } from '../services/adsenseService';

interface AdSenseBannerProps {
  slotId?: string;
  adFormat?: 'auto' | 'horizontal' | 'rectangle';
  fullWidthResponsive?: boolean;
  className?: string;
}

export const AdSenseBanner: React.FC<AdSenseBannerProps> = ({
  slotId,
  adFormat = 'auto',
  fullWidthResponsive = true,
  className = '',
}) => {
  const adRef = useRef<HTMLModElement>(null);
  const [adError, setAdError] = useState(false);
  const isConfigured = isAdSenseConfigured() && Boolean(slotId);

  useEffect(() => {
    if (!isConfigured || !slotId) return;

    // Ensure official script is loaded
    loadAdSenseScript();

    // Push ad request safely
    try {
      // @ts-expect-error Google adsbygoogle array
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.warn('AdSense push error:', e);
      setAdError(true);
    }
  }, [isConfigured, slotId]);

  // If AdSense is not configured or slot ID is missing or encountered an error, collapse completely
  if (!isConfigured || adError) {
    return null;
  }

  return (
    <div className={`my-6 mx-auto w-full max-w-5xl px-4 overflow-hidden text-center ${className}`}>
      {/* Standard, policy-compliant label permitted by Google AdSense */}
      <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1 select-none">
        Advertisement
      </span>

      <div className="min-h-[90px] flex items-center justify-center bg-slate-50/50 border border-slate-100 rounded-xl overflow-hidden">
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={ADSENSE_CONFIG.clientId}
          data-ad-slot={slotId}
          data-ad-format={adFormat}
          data-full-width-responsive={fullWidthResponsive ? 'true' : 'false'}
        />
      </div>
    </div>
  );
};
