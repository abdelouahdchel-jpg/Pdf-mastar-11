import React, { useEffect, useRef, useState } from 'react';
import { isAdSenseConfigured, ADSENSE_CONFIG, loadAdSenseScript } from '../services/adsenseService';

interface AdSenseBannerProps {
  slotId?: string;
  slotLabel?: string;
  adFormat?: 'auto' | 'horizontal' | 'rectangle';
  fullWidthResponsive?: boolean;
  className?: string;
}

export const AdSenseBanner: React.FC<AdSenseBannerProps> = ({
  slotId,
  slotLabel,
  adFormat = 'auto',
  fullWidthResponsive = true,
  className = '',
}) => {
  const adRef = useRef<HTMLModElement>(null);
  const [adPushed, setAdPushed] = useState(false);
  const [adError, setAdError] = useState(false);
  const isConfigured = isAdSenseConfigured();
  const hasSpecificSlot = Boolean(slotId && slotId.trim().length > 0);

  useEffect(() => {
    if (!isConfigured) return;

    // Ensure official script is loaded in head
    loadAdSenseScript();

    // If a valid ad unit slot ID is provided, push the ad unit
    if (hasSpecificSlot && !adPushed) {
      try {
        // @ts-expect-error Google adsbygoogle array
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        setAdPushed(true);
      } catch (e) {
        console.warn('AdSense push error:', e);
        setAdError(true);
      }
    }
  }, [isConfigured, hasSpecificSlot, adPushed]);

  if (!isConfigured || !hasSpecificSlot || adError) {
    // When no manual slot ID is configured, return null to avoid displaying
    // fake placeholders or under-construction boxes that violate Google AdSense review policies.
    // Google Auto Ads (configured via index.html) will automatically insert responsive ads
    // once approved in the AdSense console.
    return null;
  }

  return (
    <aside
      aria-label="Advertisement"
      className={`my-8 mx-auto w-full max-w-5xl px-4 overflow-hidden text-center ${className}`}
    >
      {/* Standard policy-compliant label permitted by Google AdSense */}
      <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 mb-1.5 px-1 select-none">
        <span className="uppercase tracking-wider">
          Advertisement
        </span>
        {slotLabel && (
          <span className="text-slate-400 font-normal">
            {slotLabel}
          </span>
        )}
      </div>

      <div className="min-h-[90px] sm:min-h-[120px] flex items-center justify-center bg-slate-50 border border-slate-200/80 rounded-2xl overflow-hidden p-2">
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: 'block', minHeight: '90px', width: '100%' }}
          data-ad-client={ADSENSE_CONFIG.clientId}
          data-ad-slot={slotId}
          data-ad-format={adFormat}
          data-full-width-responsive={fullWidthResponsive ? 'true' : 'false'}
        />
      </div>
    </aside>
  );
};
