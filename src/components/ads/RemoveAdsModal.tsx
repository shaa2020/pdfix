
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, CreditCard, Smartphone } from "lucide-react";
import { toast } from "@/components/ui/sonner";

interface RemoveAdsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RemoveAdsModal: React.FC<RemoveAdsModalProps> = ({ isOpen, onClose }) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [transactionId, setTransactionId] = useState('');

  const paymentMethods = [
    {
      id: 'bkash',
      name: 'bKash',
      number: '+880-1234-567890',
      icon: <Smartphone className="h-6 w-6" />,
      color: 'bg-pink-500'
    },
    {
      id: 'nagad',
      name: 'Nagad',
      number: '+880-0987-654321',
      icon: <Smartphone className="h-6 w-6" />,
      color: 'bg-orange-500'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      number: 'your-paypal-id@example.com',
      icon: <CreditCard className="h-6 w-6" />,
      color: 'bg-blue-500'
    }
  ];

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshot(file);
      toast.success('Screenshot uploaded successfully');
    }
  };

  const handleSubmitPayment = () => {
    if (!selectedMethod || !screenshot || !transactionId) {
      toast.error('Please fill all required fields');
      return;
    }

    // Store payment verification request in localStorage
    const paymentRequest = {
      method: selectedMethod,
      transactionId,
      timestamp: Date.now(),
      status: 'pending'
    };
    
    localStorage.setItem('paymentVerificationRequest', JSON.stringify(paymentRequest));
    toast.success('Payment verification request submitted! We will review and activate ad-free access within 24 hours.');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Remove Ads - $2.99</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Choose a payment method and upload payment screenshot for verification
          </p>
          
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <Card 
                key={method.id}
                className={`cursor-pointer transition-all ${
                  selectedMethod === method.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedMethod(method.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full text-white ${method.color}`}>
                      {method.icon}
                    </div>
                    <div>
                      <h4 className="font-medium">{method.name}</h4>
                      <p className="text-sm text-muted-foreground">{method.number}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedMethod && (
            <div className="space-y-3 pt-4 border-t">
              <div>
                <Label htmlFor="transactionId">Transaction ID</Label>
                <Input
                  id="transactionId"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Enter transaction/reference ID"
                />
              </div>
              
              <div>
                <Label htmlFor="screenshot">Upload Payment Screenshot</Label>
                <div className="mt-2">
                  <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:bg-muted/50">
                    <div className="text-center">
                      <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {screenshot ? screenshot.name : 'Click to upload screenshot'}
                      </p>
                    </div>
                    <input
                      id="screenshot"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleScreenshotUpload}
                    />
                  </label>
                </div>
              </div>
              
              <Button onClick={handleSubmitPayment} className="w-full">
                Submit for Verification
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RemoveAdsModal;
