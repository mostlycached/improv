import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Sparkles, Upload, Link, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
  const [personArchetype, setPersonArchetype] = useState("none");
  const [environment, setEnvironment] = useState("none");
  const [artisticStyle, setArtisticStyle] = useState("Photorealistic");
  const [colorPalette, setColorPalette] = useState("none");
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Professional color palettes with hex values
  const colorPalettes = {
    "Corporate Blue": { primary: "#1B365D", accent: "#4A90E2", light: "#E3F2FD" },
    "Sage Green": { primary: "#2D5016", accent: "#87A96B", light: "#F0F5E8" },
    "Warm Terracotta": { primary: "#D2691E", accent: "#E2725B", light: "#FFF8DC" },
    "Deep Purple": { primary: "#4A148C", accent: "#7B1FA2", light: "#E1BEE7" },
    "Monochrome": { primary: "#2C2C2C", accent: "#757575", light: "#F5F5F5" },
    "Sunset Orange": { primary: "#FF6B35", accent: "#FF8E53", light: "#FFE5B4" },
    "Ocean Teal": { primary: "#006064", accent: "#26A69A", light: "#B2DFDB" },
    "Rich Burgundy": { primary: "#722F37", accent: "#B71C1C", light: "#F8BBD9" }
  };
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
          style: artisticStyle,
          personArchetype: personArchetype === "none" ? undefined : personArchetype,
          environment: environment === "none" ? undefined : environment,
          colorPalette: colorPalette === "none" ? undefined : colorPalette
        });
        return await response.json();
      } catch (error) {
        console.error('Background generation error:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      // Update background image and apply color palette to CTA if selected
      const updates: Partial<AdData> = {
        backgroundImageUrl: data.imageUrl,
      };
      
      // Apply accent color from selected palette to CTA
      if (colorPalette !== "none" && colorPalettes[colorPalette as keyof typeof colorPalettes]) {
        const palette = colorPalettes[colorPalette as keyof typeof colorPalettes];
        updates.accentColor = palette.accent;
        updates.primaryColor = palette.primary;
      }
      
      setAdData({
        ...adData,
        ...updates,
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
            {/* Advanced Options Collapsible */}
            <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-2 h-auto text-left"
                >
                  <span className="text-sm font-medium text-google-gray">Advanced Options</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 pt-2">
                {/* Color Palette Dropdown */}
                <div>
                  <Label className="text-google-gray mb-2 block">Color Palette</Label>
                  <Select value={colorPalette} onValueChange={setColorPalette}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select color palette (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {Object.entries(colorPalettes).map(([name, colors]) => (
                        <SelectItem key={name} value={name}>
                          <div className="flex items-center space-x-2">
                            <div className="flex space-x-1">
                              <div 
                                className="w-3 h-3 rounded-full border border-gray-300" 
                                style={{ backgroundColor: colors.primary }}
                              />
                              <div 
                                className="w-3 h-3 rounded-full border border-gray-300" 
                                style={{ backgroundColor: colors.accent }}
                              />
                              <div 
                                className="w-3 h-3 rounded-full border border-gray-300" 
                                style={{ backgroundColor: colors.light }}
                              />
                            </div>
                            <span>{name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Artistic Style Dropdown */}
                <div>
                  <Label className="text-google-gray mb-2 block">Artistic Style</Label>
                  <Select value={artisticStyle} onValueChange={setArtisticStyle}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select artistic style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Photorealistic">Photorealistic</SelectItem>
                      <SelectItem value="Geometric Abstraction">Geometric Abstraction</SelectItem>
                      <SelectItem value="Neo-Memphis">Neo-Memphis</SelectItem>
                      <SelectItem value="Gradient Silhouette">Gradient Silhouette</SelectItem>
                      <SelectItem value="Brutalist Gradient">Brutalist Gradient</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Person Archetype Dropdown */}
                <div>
                  <Label className="text-google-gray mb-2 block">Person Archetype</Label>
                  <Select value={personArchetype} onValueChange={setPersonArchetype}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select person type (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="Healthcare Professional">Healthcare Professional</SelectItem>
                      <SelectItem value="Construction Worker">Construction Worker</SelectItem>
                      <SelectItem value="Business Executive">Business Executive</SelectItem>
                      <SelectItem value="Tech Developer">Tech Developer</SelectItem>
                      <SelectItem value="Teacher/Educator">Teacher/Educator</SelectItem>
                      <SelectItem value="Chef/Restaurant Worker">Chef/Restaurant Worker</SelectItem>
                      <SelectItem value="Retail Associate">Retail Associate</SelectItem>
                      <SelectItem value="Creative Professional">Creative Professional</SelectItem>
                      <SelectItem value="Fitness Trainer">Fitness Trainer</SelectItem>
                      <SelectItem value="Customer Service Rep">Customer Service Rep</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Environment Dropdown */}
                <div>
                  <Label className="text-google-gray mb-2 block">Environment</Label>
                  <Select value={environment} onValueChange={setEnvironment}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select environment (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="Modern Office">Modern Office</SelectItem>
                      <SelectItem value="Hospital/Medical Facility">Hospital/Medical Facility</SelectItem>
                      <SelectItem value="Construction Site">Construction Site</SelectItem>
                      <SelectItem value="Tech Workspace">Tech Workspace</SelectItem>
                      <SelectItem value="Classroom">Classroom</SelectItem>
                      <SelectItem value="Restaurant Kitchen">Restaurant Kitchen</SelectItem>
                      <SelectItem value="Retail Store">Retail Store</SelectItem>
                      <SelectItem value="Creative Studio">Creative Studio</SelectItem>
                      <SelectItem value="Gym/Fitness Center">Gym/Fitness Center</SelectItem>
                      <SelectItem value="Call Center">Call Center</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CollapsibleContent>
            </Collapsible>

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
