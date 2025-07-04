
import React, { useEffect } from 'react';

interface AdSenseAdProps {
  adSlot: string;
  adFormat?: string;
  className?: string;
  style?: React.CSSProperties;
}

const AdSenseAd: React.FC<AdSenseAdProps> = ({ 
  adSlot, 
  adFormat = "auto", 
  className = "",
  style = {} 
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
    <div className={`adsense-container ${className}`} style={style}>
      <ins 
        className="adsbygoogle"
        style={{ display: 'block', ...style }}
        data-ad-client="ca-pub-YOUR_PUBLISHER_ID"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdSenseAd;
