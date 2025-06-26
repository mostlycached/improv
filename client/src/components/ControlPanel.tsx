import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Sparkles, Upload, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import LayoutSelector from "./LayoutSelector";
import type { AdData } from "@/pages/AdGenerator";

interface ControlPanelProps {
  adData: AdData;
  setAdData: (data: AdData) => void;
  isGenerating: boolean;
  setIsGenerating: (generating: boolean) => void;
}

export default function ControlPanel({ 
  adData, 
  setAdData, 
  isGenerating, 
  setIsGenerating 
}: ControlPanelProps) {
  const [productUrl, setProductUrl] = useState("");
  const { toast } = useToast();

  const generateContentMutation = useMutation({
    mutationFn: async (url: string) => {
      try {
        const response = await apiRequest("POST", "/api/generate-content", { url });
        return await response.json();
      } catch (error) {
        console.error('Content generation error:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      setAdData({
        ...adData,
        title: data.title,
        subtitle: data.subtitle,
        ctaText: data.ctaText,
      });
      toast({
        title: "Content Generated",
        description: "AI has generated new content for your ad",
      });
    },
    onError: (error: any) => {
      console.error('Mutation error:', error);
      toast({
        title: "Generation Failed",
        description: error?.message || "Failed to generate content",
        variant: "destructive",
      });
    },
  });

  const generateBackgroundMutation = useMutation({
    mutationFn: async (description: string) => {
      try {
        const response = await apiRequest("POST", "/api/generate-background", { 
          description,
          style: "photorealistic"
        });
        return await response.json();
      } catch (error) {
        console.error('Background generation error:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      setAdData({
        ...adData,
        backgroundImageUrl: data.imageUrl,
      });
      toast({
        title: "Background Generated",
        description: "AI has generated a new background image",
      });
    },
    onError: (error: any) => {
      console.error('Background mutation error:', error);
      toast({
        title: "Generation Failed",
        description: error?.message || "Failed to generate background",
        variant: "destructive",
      });
    },
  });

  const handleAutoGenerate = async () => {
    if (!productUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a product URL to generate content",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      await generateContentMutation.mutateAsync(productUrl);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateBackground = () => {
    const description = `professionals working with ${adData.title} in a modern office environment`;
    generateBackgroundMutation.mutate(description);
  };

  const updateAdData = (key: keyof AdData, value: string) => {
    setAdData({ ...adData, [key]: value });
  };

  return (
    <div className="w-2/5 bg-white border-r border-google-border overflow-y-auto">
      <div className="p-6 space-y-8">
        
        {/* Quick Generate Section */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Generate</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="productUrl" className="text-google-gray">Product URL</Label>
              <div className="relative">
                <Input
                  id="productUrl"
                  type="url"
                  placeholder="https://example.com/product"
                  value={productUrl}
                  onChange={(e) => setProductUrl(e.target.value)}
                  className="pl-10"
                />
                <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-google-gray w-4 h-4" />
              </div>
            </div>
            <Button
              onClick={handleAutoGenerate}
              disabled={isGenerating || generateContentMutation.isPending}
              className="w-full bg-google-green hover:bg-green-600 text-white"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {generateContentMutation.isPending ? "Generating..." : "Auto-Generate Content"}
            </Button>
          </div>
        </section>

        {/* Layout Selection */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Choose Layout</h2>
          <LayoutSelector
            selectedLayout={adData.layout}
            onLayoutSelect={(layout) => updateAdData("layout", layout)}
          />
        </section>

        {/* Content Fields */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Ad Content</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-google-gray">Title</Label>
              <Input
                id="title"
                placeholder="Your compelling headline"
                value={adData.title}
                onChange={(e) => updateAdData("title", e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="subtitle" className="text-google-gray">Subtitle</Label>
              <Textarea
                id="subtitle"
                placeholder="Supporting text that explains your offer"
                rows={2}
                value={adData.subtitle}
                onChange={(e) => updateAdData("subtitle", e.target.value)}
                className="resize-none"
              />
            </div>
            
            <div>
              <Label htmlFor="ctaText" className="text-google-gray">Call to Action</Label>
              <Input
                id="ctaText"
                placeholder="Get Started, Learn More, etc."
                value={adData.ctaText}
                onChange={(e) => updateAdData("ctaText", e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Color Customization */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Colors</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-google-gray">Primary Color</Label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={adData.primaryColor}
                  onChange={(e) => updateAdData("primaryColor", e.target.value)}
                  className="w-12 h-10 rounded-lg border border-google-border cursor-pointer"
                />
                <Input
                  value={adData.primaryColor}
                  onChange={(e) => updateAdData("primaryColor", e.target.value)}
                  className="flex-1 text-sm"
                />
              </div>
            </div>
            
            <div>
              <Label className="text-google-gray">Accent Color</Label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={adData.accentColor}
                  onChange={(e) => updateAdData("accentColor", e.target.value)}
                  className="w-12 h-10 rounded-lg border border-google-border cursor-pointer"
                />
                <Input
                  value={adData.accentColor}
                  onChange={(e) => updateAdData("accentColor", e.target.value)}
                  className="flex-1 text-sm"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Background Options */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Background</h2>
          <div className="space-y-3">
            <Button
              onClick={handleGenerateBackground}
              disabled={generateBackgroundMutation.isPending}
              className="w-full justify-start bg-transparent border border-google-border text-gray-900 hover:bg-gray-50"
            >
              <Sparkles className="w-4 h-4 mr-3 text-google-blue" />
              {generateBackgroundMutation.isPending ? "Generating..." : "AI Generate Background"}
            </Button>
            
            <Button
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      updateAdData("backgroundImageUrl", e.target?.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                };
                input.click();
              }}
              className="w-full justify-start bg-transparent border border-google-border text-gray-900 hover:bg-gray-50"
            >
              <Upload className="w-4 h-4 mr-3 text-google-gray" />
              Upload Image
            </Button>
          </div>
        </section>

      </div>
    </div>
  );
}
