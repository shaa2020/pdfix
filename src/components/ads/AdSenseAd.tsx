
import React, { useEffect } from 'react';
import { TimerReset } from 'lucide-react';

interface AdSenseAdProps {
  adSlot: string;
  adFormat?: string;
  className?: string;
  style?: React.CSSProperties;
  showTimer?: boolean;
  timeUntilRefresh?: number;
  onRefresh?: () => void;
}

const AdSenseAd: React.FC<AdSenseAdProps> = ({ 
  adSlot, 
  adFormat = "auto", 
  className = "",
  style = {},
  showTimer = false,
  timeUntilRefresh = 0,
  onRefresh
}) => {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <div className={`adsense-container relative ${className}`} style={style}>
      {showTimer && timeUntilRefresh > 0 && (
        <div className="absolute top-2 right-2 z-10 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
          <TimerReset className="h-3 w-3" />
          {timeUntilRefresh}s
        </div>
      )}
      
      <ins 
        className="adsbygoogle"
        style={{ display: 'block', ...style }}
        data-ad-client="ca-pub-YOUR_PUBLISHER_ID"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
      
      {onRefresh && (
        <button
          onClick={onRefresh}
          className="absolute bottom-2 right-2 bg-muted/80 hover:bg-muted text-xs px-2 py-1 rounded opacity-50 hover:opacity-100 transition-opacity"
        >
          Refresh
        </button>
      )}
    </div>
  );
};

export default AdSenseAd;
