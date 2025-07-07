import { useState, useRef } from "react";
import { Camera, Upload, Download, Trash2, RotateCcw, Settings, Moon, Sun, Star, Info, FileText, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/sonner";
import jsPDF from 'jspdf';
import AdSenseAd from "@/components/ads/AdSenseAd";
import RemoveAdsModal from "@/components/ads/RemoveAdsModal";
import InterstitialAd from "@/components/ads/InterstitialAd";
import { useAdFree } from "@/hooks/useAdFree";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useAdTimer } from "@/hooks/useAdTimer";

interface ImageFile {
  id: string;
  file: File;
  url: string;
  name: string;
}

const Index = () => {
  // PDF Converter States
  const [pdfImages, setPdfImages] = useState<ImageFile[]>([]);
  const [pdfName, setPdfName] = useState("converted-images");
  const [pageSize, setPageSize] = useState("a4");
  const [imageScaling, setImageScaling] = useState("fit");
  const [isPdfConverting, setIsPdfConverting] = useState(false);
  
  // SVG Converter States
  const [svgImages, setSvgImages] = useState<ImageFile[]>([]);
  const [svgName, setSvgName] = useState("converted-image");
  const [svgSize, setSvgSize] = useState("original");
  const [isSvgConverting, setIsSvgConverting] = useState(false);
  
  // Common States
  const [showRemoveAdsModal, setShowRemoveAdsModal] = useState(false);
  const [showInterstitialAd, setShowInterstitialAd] = useState(false);
  const [conversionType, setConversionType] = useState<'pdf' | 'svg'>('pdf');
  const pdfFileInputRef = useRef<HTMLInputElement>(null);
  const pdfCameraInputRef = useRef<HTMLInputElement>(null);
  const svgFileInputRef = useRef<HTMLInputElement>(null);
  const svgCameraInputRef = useRef<HTMLInputElement>(null);
  
  const { isAdFree, loading } = useAdFree();
  const { theme, setTheme } = useTheme();
  const { adKey, timeUntilRefresh, refreshAd } = useAdTimer({ 
    refreshInterval: 30, 
    isAdFree 
  });

  // PDF Converter Functions
  const handlePdfFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    addPdfImages(files);
  };

  const handlePdfCameraCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    addPdfImages(files);
  };

  const addPdfImages = (files: File[]) => {
    const newImages: ImageFile[] = files.map(file => ({
      id: Date.now() + Math.random().toString(),
      file,
      url: URL.createObjectURL(file),
      name: file.name
    }));
    setPdfImages(prev => [...prev, ...newImages]);
    toast.success(`Added ${files.length} image(s) for PDF conversion`);
  };

  const removePdfImage = (id: string) => {
    setPdfImages(prev => {
      const imageToRemove = prev.find(img => img.id === id);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.url);
      }
      return prev.filter(img => img.id !== id);
    });
  };

  const clearAllPdf = () => {
    pdfImages.forEach(img => URL.revokeObjectURL(img.url));
    setPdfImages([]);
    toast.success("All PDF images cleared");
  };

  // SVG Converter Functions
  const handleSvgFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    addSvgImages(files);
  };

  const handleSvgCameraCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    addSvgImages(files);
  };

  const addSvgImages = (files: File[]) => {
    const newImages: ImageFile[] = files.map(file => ({
      id: Date.now() + Math.random().toString(),
      file,
      url: URL.createObjectURL(file),
      name: file.name
    }));
    setSvgImages(prev => [...prev, ...newImages]);
    toast.success(`Added ${files.length} image(s) for SVG conversion`);
  };

  const removeSvgImage = (id: string) => {
    setSvgImages(prev => {
      const imageToRemove = prev.find(img => img.id === id);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.url);
      }
      return prev.filter(img => img.id !== id);
    });
  };

  const clearAllSvg = () => {
    svgImages.forEach(img => URL.revokeObjectURL(img.url));
    setSvgImages([]);
    toast.success("All SVG images cleared");
  };

  const convertToSVG = async () => {
    if (svgImages.length === 0) {
      toast.error("Please select at least one image for SVG conversion");
      return;
    }

    // Show interstitial ad before conversion (if not ad-free)
    if (!isAdFree) {
      setConversionType('svg');
      setShowInterstitialAd(true);
      return;
    }

    await performSVGConversion();
  };

  const performSVGConversion = async () => {
    setIsSvgConverting(true);
    try {
      for (let i = 0; i < svgImages.length; i++) {
        const image = svgImages[i];
        
        const img = new Image();
        img.src = image.url;
        
        await new Promise((resolve, reject) => {
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
              reject(new Error('Canvas context not available'));
              return;
            }

            // Get original image dimensions for maximum quality
            const originalWidth = img.naturalWidth || img.width;
            const originalHeight = img.naturalHeight || img.height;
            
            let canvasWidth, canvasHeight;
            
            if (svgSize === 'original') {
              canvasWidth = originalWidth;
              canvasHeight = originalHeight;
            } else if (svgSize === 'hd') {
              // HD: 1920x1080 aspect ratio maintained
              const aspectRatio = originalWidth / originalHeight;
              if (aspectRatio > 16/9) {
                canvasWidth = 1920;
                canvasHeight = 1920 / aspectRatio;
              } else {
                canvasHeight = 1080;
                canvasWidth = 1080 * aspectRatio;
              }
            } else { // 4k
              // 4K: 3840x2160 aspect ratio maintained
              const aspectRatio = originalWidth / originalHeight;
              if (aspectRatio > 16/9) {
                canvasWidth = 3840;
                canvasHeight = 3840 / aspectRatio;
              } else {
                canvasHeight = 2160;
                canvasWidth = 2160 * aspectRatio;
              }
            }
            
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;
            
            // Enable high-quality rendering
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            
            // Draw image at high resolution
            ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
            
            // Convert to high-quality data URL
            const dataURL = canvas.toDataURL('image/png', 1.0);
            
            // Create SVG with embedded image at maximum quality
            const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${canvasWidth}" height="${canvasHeight}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <image width="${canvasWidth}" height="${canvasHeight}" xlink:href="${dataURL}" />
</svg>`;
            
            // Download SVG
            const blob = new Blob([svgContent], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${svgName}${svgImages.length > 1 ? `-${i + 1}` : ''}.svg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            resolve(void 0);
          };
          
          img.onerror = () => {
            reject(new Error(`Failed to load image: ${image.name}`));
          };
        });
      }

      toast.success(`${svgImages.length} SVG file(s) generated successfully!`);
    } catch (error) {
      console.error("Error generating SVG:", error);
      toast.error("Failed to generate SVG");
    } finally {
      setIsSvgConverting(false);
      setShowInterstitialAd(false);
    }
  };

  const convertToPDF = async () => {
    if (pdfImages.length === 0) {
      toast.error("Please select at least one image for PDF conversion");
      return;
    }

    // Show interstitial ad before conversion (if not ad-free)
    if (!isAdFree) {
      setConversionType('pdf');
      setShowInterstitialAd(true);
      return;
    }

    await performPDFConversion();
  };

  const handleAdComplete = async () => {
    setShowInterstitialAd(false);
    if (conversionType === 'pdf') {
      await performPDFConversion();
    } else {
      await performSVGConversion();
    }
  };

  const performPDFConversion = async () => {
    setIsPdfConverting(true);
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: pageSize
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      for (let i = 0; i < pdfImages.length; i++) {
        if (i > 0) {
          pdf.addPage();
        }

        const img = new Image();
        img.src = pdfImages[i].url;
        
        await new Promise((resolve) => {
          img.onload = () => {
            // Create high-resolution canvas
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
              resolve(void 0);
              return;
            }

            // Get original image dimensions
            const originalWidth = img.naturalWidth || img.width;
            const originalHeight = img.naturalHeight || img.height;
            
            let canvasWidth, canvasHeight, drawWidth, drawHeight, offsetX = 0, offsetY = 0;
            
            if (imageScaling === 'fit') {
              // Calculate aspect ratio preserving dimensions
              const aspectRatio = originalWidth / originalHeight;
              const pageAspectRatio = pageWidth / pageHeight;
              
              if (aspectRatio > pageAspectRatio) {
                // Image is wider than page ratio
                drawWidth = pageWidth;
                drawHeight = pageWidth / aspectRatio;
                offsetY = (pageHeight - drawHeight) / 2;
              } else {
                // Image is taller than page ratio
                drawHeight = pageHeight;
                drawWidth = pageHeight * aspectRatio;
                offsetX = (pageWidth - drawWidth) / 2;
              }
              
              // Use high resolution for canvas
              const scaleFactor = Math.max(1, Math.min(originalWidth / drawWidth, originalHeight / drawHeight));
              canvasWidth = drawWidth * scaleFactor;
              canvasHeight = drawHeight * scaleFactor;
              
            } else if (imageScaling === 'fill') {
              drawWidth = pageWidth;
              drawHeight = pageHeight;
              // Use page dimensions but maintain high resolution
              const scaleFactor = Math.max(originalWidth / pageWidth, originalHeight / pageHeight);
              canvasWidth = pageWidth * scaleFactor;
              canvasHeight = pageHeight * scaleFactor;
              
            } else { // original
              drawWidth = Math.min(originalWidth * 0.264583, pageWidth); // Convert px to mm (96 DPI)
              drawHeight = Math.min(originalHeight * 0.264583, pageHeight);
              offsetX = (pageWidth - drawWidth) / 2;
              offsetY = (pageHeight - drawHeight) / 2;
              canvasWidth = originalWidth;
              canvasHeight = originalHeight;
            }
            
            // Set canvas dimensions to maintain high quality
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;
            
            // Enable high-quality rendering
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            
            // Draw image at high resolution
            ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
            
            // Convert to high-quality JPEG
            const imgData = canvas.toDataURL('image/jpeg', 1.0); // Maximum quality
            
            // Add to PDF
            pdf.addImage(imgData, 'JPEG', offsetX, offsetY, drawWidth, drawHeight);
            resolve(void 0);
          };
          
          img.onerror = () => {
            console.error('Failed to load image:', pdfImages[i].name);
            resolve(void 0);
          };
        });
      }

      pdf.save(`${pdfName}.pdf`);
      toast.success("PDF generated successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    } finally {
      setIsPdfConverting(false);
      setShowInterstitialAd(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold">Image Converter</h1>
          <div className="flex items-center gap-2">
            {!isAdFree && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRemoveAdsModal(true)}
                className="text-xs"
              >
                <Star className="h-3 w-3 mr-1" />
                Remove Ads
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Top Banner Ad */}
        {!isAdFree && (
          <AdSenseAd 
            key={`top-${adKey}`}
            adSlot="1234567890"
            className="w-full"
            style={{ minHeight: '90px' }}
            showTimer={true}
            timeUntilRefresh={timeUntilRefresh}
            onRefresh={refreshAd}
          />
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Image Converter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pdf" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="pdf" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Image to PDF
                </TabsTrigger>
                <TabsTrigger value="svg" className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Image to SVG
                </TabsTrigger>
              </TabsList>
              
              {/* PDF Converter Tab */}
              <TabsContent value="pdf" className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button
                    onClick={() => pdfFileInputRef.current?.click()}
                    className="h-12 text-base"
                    variant="outline"
                  >
                    <Upload className="mr-2 h-5 w-5" />
                    Select Images
                  </Button>
                  <Button
                    onClick={() => pdfCameraInputRef.current?.click()}
                    className="h-12 text-base"
                    variant="outline"
                  >
                    <Camera className="mr-2 h-5 w-5" />
                    Take Photo
                  </Button>
                </div>

                <input
                  ref={pdfFileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePdfFileSelect}
                  className="hidden"
                />
                <input
                  ref={pdfCameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePdfCameraCapture}
                  className="hidden"
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="pdfName">PDF Name</Label>
                    <Input
                      id="pdfName"
                      value={pdfName}
                      onChange={(e) => setPdfName(e.target.value)}
                      placeholder="Enter PDF name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pageSize">Page Size</Label>
                    <Select value={pageSize} onValueChange={setPageSize}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="a4">A4</SelectItem>
                        <SelectItem value="letter">Letter</SelectItem>
                        <SelectItem value="legal">Legal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="scaling">Image Scaling</Label>
                    <Select value={imageScaling} onValueChange={setImageScaling}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fit">Fit to Page</SelectItem>
                        <SelectItem value="fill">Fill Page</SelectItem>
                        <SelectItem value="original">Original Size</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {pdfImages.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">
                        Selected Images ({pdfImages.length})
                      </h3>
                      <Button onClick={clearAllPdf} variant="destructive" size="sm">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Clear All
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {pdfImages.map((image, index) => (
                        <div
                          key={image.id}
                          className="relative group border rounded-lg overflow-hidden bg-muted"
                        >
                          <img
                            src={image.url}
                            alt={image.name}
                            className="w-full h-32 object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removePdfImage(image.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                            {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  onClick={convertToPDF}
                  disabled={pdfImages.length === 0 || isPdfConverting}
                  className="w-full h-12 text-base"
                  size="lg"
                >
                  {isPdfConverting ? (
                    <>
                      <RotateCcw className="mr-2 h-5 w-5 animate-spin" />
                      Converting...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-5 w-5" />
                      Convert to PDF
                    </>
                  )}
                </Button>
              </TabsContent>

              {/* SVG Converter Tab */}
              <TabsContent value="svg" className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button
                    onClick={() => svgFileInputRef.current?.click()}
                    className="h-12 text-base"
                    variant="outline"
                  >
                    <Upload className="mr-2 h-5 w-5" />
                    Select Images
                  </Button>
                  <Button
                    onClick={() => svgCameraInputRef.current?.click()}
                    className="h-12 text-base"
                    variant="outline"
                  >
                    <Camera className="mr-2 h-5 w-5" />
                    Take Photo
                  </Button>
                </div>

                <input
                  ref={svgFileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleSvgFileSelect}
                  className="hidden"
                />
                <input
                  ref={svgCameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleSvgCameraCapture}
                  className="hidden"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="svgName">SVG Name</Label>
                    <Input
                      id="svgName"
                      value={svgName}
                      onChange={(e) => setSvgName(e.target.value)}
                      placeholder="Enter SVG name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="svgSize">Output Quality</Label>
                    <Select value={svgSize} onValueChange={setSvgSize}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="original">Original Size</SelectItem>
                        <SelectItem value="hd">HD Quality</SelectItem>
                        <SelectItem value="4k">4K Quality</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {svgImages.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">
                        Selected Images ({svgImages.length})
                      </h3>
                      <Button onClick={clearAllSvg} variant="destructive" size="sm">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Clear All
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {svgImages.map((image, index) => (
                        <div
                          key={image.id}
                          className="relative group border rounded-lg overflow-hidden bg-muted"
                        >
                          <img
                            src={image.url}
                            alt={image.name}
                            className="w-full h-32 object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removeSvgImage(image.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                            {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  onClick={convertToSVG}
                  disabled={svgImages.length === 0 || isSvgConverting}
                  className="w-full h-12 text-base"
                  size="lg"
                >
                  {isSvgConverting ? (
                    <>
                      <RotateCcw className="mr-2 h-5 w-5 animate-spin" />
                      Converting...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-5 w-5" />
                      Convert to SVG
                    </>
                  )}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Middle Banner Ad */}
        {!isAdFree && (pdfImages.length > 0 || svgImages.length > 0) && (
          <AdSenseAd 
            key={`middle-${adKey}`}
            adSlot="0987654321"
            className="w-full"
            style={{ minHeight: '250px' }}
            showTimer={true}
            timeUntilRefresh={timeUntilRefresh}
            onRefresh={refreshAd}
          />
        )}
      </div>

      {/* Bottom Banner Ad - Fixed */}
      {!isAdFree && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t">
          <AdSenseAd 
            key={`bottom-${adKey}`}
            adSlot="1122334455"
            className="w-full"
            style={{ minHeight: '60px' }}
            showTimer={true}
            timeUntilRefresh={timeUntilRefresh}
            onRefresh={refreshAd}
          />
        </div>
      )}

      {/* Modals */}
      <RemoveAdsModal 
        isOpen={showRemoveAdsModal}
        onClose={() => setShowRemoveAdsModal(false)}
      />
      
      <InterstitialAd
        isOpen={showInterstitialAd}
        onClose={() => setShowInterstitialAd(false)}
        onRemoveAds={() => {
          setShowInterstitialAd(false);
          setShowRemoveAdsModal(true);
        }}
        onAdComplete={handleAdComplete}
      />

      {/* Add bottom padding when bottom ad is visible */}
      {!isAdFree && <div className="h-16" />}
    </div>
  );
};

export default Index;
