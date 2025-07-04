
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, TimerReset } from "lucide-react";

interface InterstitialAdProps {
  isOpen: boolean;
  onClose: () => void;
  onRemoveAds: () => void;
}

const InterstitialAd: React.FC<InterstitialAdProps> = ({ isOpen, onClose, onRemoveAds }) => {
  const [timeLeft, setTimeLeft] = useState(5);
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeLeft(5);
      setCanClose(false);
      
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setCanClose(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isOpen]);

  const handleClose = () => {
    if (canClose) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={canClose ? onClose : undefined}>
      <DialogContent className="max-w-sm p-0 gap-0">
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-2 right-2 z-10 ${!canClose ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleClose}
            disabled={!canClose}
          >
            {canClose ? <X className="h-4 w-4" /> : <TimerReset className="h-4 w-4" />}
          </Button>
          
          {!canClose && (
            <div className="absolute top-2 left-2 z-10 bg-black/70 text-white text-xs px-2 py-1 rounded">
              {timeLeft}s
            </div>
          )}
          
          {/* Ad placeholder - replace with actual AdSense */}
          <div className="h-64 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Advertisement</h3>
              <p className="text-sm opacity-80">Your ad content here</p>
            </div>
          </div>
          
          <div className="p-4 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Remove ads for a better experience
            </p>
            <Button onClick={onRemoveAds} className="w-full">
              Remove Ads
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InterstitialAd;
