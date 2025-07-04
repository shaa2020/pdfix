
import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface InterstitialAdProps {
  isOpen: boolean;
  onClose: () => void;
  onRemoveAds: () => void;
}

const InterstitialAd: React.FC<InterstitialAdProps> = ({ isOpen, onClose, onRemoveAds }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm p-0 gap-0">
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          
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
              Remove Ads - $2.99
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InterstitialAd;
