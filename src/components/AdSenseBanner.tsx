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
  const hasSpecificSlot = Boolean(slotId);

  useEffect(() => {
    if (!isConfigured) return;

    // Ensure official script is loaded
    loadAdSenseScript();

    // If a specific slot ID is provided and not yet pushed, push ad request safely
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

  if (!isConfigured) {
    return null;
  }

  return (
    <div className={`my-6 mx-auto w-full max-w-5xl px-4 overflow-hidden text-center ${className}`}>
      {/* Standard policy-compliant label permitted by Google AdSense */}
      <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 mb-1.5 px-1 select-none">
        <span className="uppercase tracking-wider">
          Advertisement • إعلان
        </span>
        {slotLabel && (
          <span className="text-slate-400 font-normal">
            {slotLabel}
          </span>
        )}
      </div>

      {hasSpecificSlot && !adError ? (
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
      ) : (
        /* Visible, elegant ad placement container ready for Google Auto Ads & review */
        <div className="relative min-h-[100px] sm:min-h-[120px] flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100/60 to-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-4 transition-all">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-700">
              مساحة إعلانية مخصصة لـ Google AdSense
            </span>
            <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-mono font-semibold">
              {ADSENSE_CONFIG.clientId}
            </span>
          </div>

          <p className="text-[11px] sm:text-xs text-slate-500 max-w-lg leading-relaxed">
            سيتم عرض الإعلانات التلقائية هنا فور اكتمال مراجعة حساب AdSense وتفعيل الإعلانات التلقائية في لوحة التحكم.
          </p>

          <span className="mt-2 text-[10px] text-slate-400 font-sans tracking-wide">
            Responsive Ad Unit • {slotLabel || 'Standard Banner Placement'}
          </span>
        </div>
      )}
    </div>
  );
};

