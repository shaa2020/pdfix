
import { useState, useRef } from "react";
import { Camera, Upload, Download, Trash2, RotateCcw, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import jsPDF from 'jspdf';

interface ImageFile {
  id: string;
  file: File;
  url: string;
  name: string;
}

const Index = () => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [pdfName, setPdfName] = useState("converted-images");
  const [pageSize, setPageSize] = useState("a4");
  const [imageScaling, setImageScaling] = useState("fit");
  const [isConverting, setIsConverting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    addImages(files);
  };

  const handleCameraCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    addImages(files);
  };

  const addImages = (files: File[]) => {
    const newImages: ImageFile[] = files.map(file => ({
      id: Date.now() + Math.random().toString(),
      file,
      url: URL.createObjectURL(file),
      name: file.name
    }));
    setImages(prev => [...prev, ...newImages]);
    toast.success(`Added ${files.length} image(s)`);
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const imageToRemove = prev.find(img => img.id === id);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.url);
      }
      return prev.filter(img => img.id !== id);
    });
  };

  const reorderImages = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    setImages(newImages);
  };

  const convertToPDF = async () => {
    if (images.length === 0) {
      toast.error("Please select at least one image");
      return;
    }

    setIsConverting(true);
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: pageSize
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      for (let i = 0; i < images.length; i++) {
        if (i > 0) {
          pdf.addPage();
        }

        const img = new Image();
        img.src = images[i].url;
        
        await new Promise((resolve) => {
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            let { width, height } = img;
            
            // Calculate dimensions based on scaling option
            if (imageScaling === 'fit') {
              const ratio = Math.min(pageWidth / width, pageHeight / height);
              width *= ratio;
              height *= ratio;
            } else if (imageScaling === 'fill') {
              width = pageWidth;
              height = pageHeight;
            }
            
            canvas.width = width;
            canvas.height = height;
            ctx?.drawImage(img, 0, 0, width, height);
            
            const imgData = canvas.toDataURL('image/jpeg', 0.8);
            
            // Center the image on the page
            const x = (pageWidth - width) / 2;
            const y = (pageHeight - height) / 2;
            
            pdf.addImage(imgData, 'JPEG', x, y, width, height);
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
      setIsConverting(false);
    }
  };

  const clearAll = () => {
    images.forEach(img => URL.revokeObjectURL(img.url));
    setImages([]);
    toast.success("All images cleared");
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Image to PDF Converter
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Input Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="h-12 text-base"
                variant="outline"
              >
                <Upload className="mr-2 h-5 w-5" />
                Select Images
              </Button>
              <Button
                onClick={() => cameraInputRef.current?.click()}
                className="h-12 text-base"
                variant="outline"
              >
                <Camera className="mr-2 h-5 w-5" />
                Take Photo
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCameraCapture}
              className="hidden"
            />

            {/* PDF Settings */}
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

            {/* Image Preview */}
            {images.length > 0 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">
                    Selected Images ({images.length})
                  </h3>
                  <Button onClick={clearAll} variant="destructive" size="sm">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear All
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {images.map((image, index) => (
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
                          onClick={() => removeImage(image.id)}
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

            {/* Convert Button */}
            <Button
              onClick={convertToPDF}
              disabled={images.length === 0 || isConverting}
              className="w-full h-12 text-base"
              size="lg"
            >
              {isConverting ? (
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
