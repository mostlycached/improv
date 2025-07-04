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

  // Professional color palettes with hex values - researched trending 2024/2025 combinations
  const colorPalettes = {
    "Corporate Blue": { primary: "#1B365D", accent: "#0066CC", light: "#E3F2FD" },
    "Sage Green": { primary: "#2D5016", accent: "#00C851", light: "#F0F5E8" },
    "Warm Terracotta": { primary: "#8B4513", accent: "#FF6B35", light: "#FFF8DC" },
    "Deep Purple": { primary: "#4A148C", accent: "#9C27B0", light: "#E1BEE7" },
    "Monochrome": { primary: "#2C2C2C", accent: "#FF4444", light: "#F5F5F5" },
    "Sunset Orange": { primary: "#CC4125", accent: "#FF5722", light: "#FFE5B4" },
    "Ocean Teal": { primary: "#006064", accent: "#00BCD4", light: "#B2DFDB" },
    "Rich Burgundy": { primary: "#722F37", accent: "#E91E63", light: "#F8BBD9" }
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
    onSuccess: async (data) => {
      // Update all form fields with AI-generated data
      const colorPalettes = {
        "Corporate Blue": { primary: "#1B365D", accent: "#0066CC", light: "#E3F2FD" },
        "Sage Green": { primary: "#2D5016", accent: "#00C851", light: "#F0F5E8" },
        "Warm Terracotta": { primary: "#8B4513", accent: "#FF6B35", light: "#FFF8DC" },
        "Deep Purple": { primary: "#4A148C", accent: "#9C27B0", light: "#E1BEE7" },
        "Monochrome": { primary: "#2C2C2C", accent: "#FF4444", light: "#F5F5F5" },
        "Sunset Orange": { primary: "#CC4125", accent: "#FF5722", light: "#FFE5B4" },
        "Ocean Teal": { primary: "#006064", accent: "#00BCD4", light: "#B2DFDB" },
        "Rich Burgundy": { primary: "#722F37", accent: "#E91E63", light: "#F8BBD9" }
      };

      const selectedPalette = colorPalettes[data.colorPalette as keyof typeof colorPalettes];
      
      setAdData({
        ...adData,
        title: data.title,
        ctaText: data.ctaText,
        layout: data.layout,
        primaryColor: selectedPalette?.primary || adData.primaryColor,
        accentColor: selectedPalette?.accent || adData.accentColor,
      });

      // Update form state variables
      setPersonArchetype(data.personArchetype);
      setEnvironment(data.environment);
      setArtisticStyle(data.artisticStyle);
      setColorPalette(data.colorPalette);

      toast({
        title: "Content Generated",
        description: "AI has generated comprehensive ad content and settings",
      });

      // Auto-generate background image with AI-selected parameters
      if (data.personArchetype !== "none" || data.environment !== "none") {
        try {
          setIsGenerating(true);
          const backgroundResponse = await apiRequest("POST", "/api/generate-background", {
            description: `Professional ${data.industry} advertisement background for ${data.targetAudience}`,
            style: data.artisticStyle,
            personArchetype: data.personArchetype,
            environment: data.environment,
            colorPalette: data.colorPalette
          });
          
          const backgroundData = await backgroundResponse.json();
          const updatedAdData = {
            ...adData,
            title: data.title,
            subtitle: data.subtitle,
            ctaText: data.ctaText,
            layout: data.layout,
            primaryColor: selectedPalette?.primary || adData.primaryColor,
            accentColor: selectedPalette?.accent || adData.accentColor,
            backgroundImageUrl: backgroundData.imageUrl
          };
          setAdData(updatedAdData);
          
          toast({
            title: "Background Generated",
            description: "AI has created a custom background image",
          });
        } catch (error) {
          console.error('Background generation error:', error);
          toast({
            title: "Background Generation Failed",
            description: "Content was generated but background creation failed",
            variant: "destructive",
          });
        } finally {
          setIsGenerating(false);
        }
      }
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

  // Handle color palette selection and apply colors immediately
  const handleColorPaletteChange = (selectedPalette: string) => {
    setColorPalette(selectedPalette);
    
    // Apply colors immediately when palette is selected
    if (selectedPalette !== "none" && colorPalettes[selectedPalette as keyof typeof colorPalettes]) {
      const palette = colorPalettes[selectedPalette as keyof typeof colorPalettes];
      setAdData({
        ...adData,
        primaryColor: palette.primary,
        accentColor: palette.accent,
      });
    }
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
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
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
                  <Select value={colorPalette} onValueChange={handleColorPaletteChange}>
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

                {/* Color Customization */}
                <div>
                  <Label className="text-google-gray mb-2 block">Custom Colors</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-google-gray mb-1 block">Primary Color</Label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={adData.primaryColor}
                          onChange={(e) => updateAdData("primaryColor", e.target.value)}
                          className="w-8 h-8 rounded border border-google-border cursor-pointer"
                        />
                        <Input
                          value={adData.primaryColor}
                          onChange={(e) => updateAdData("primaryColor", e.target.value)}
                          className="flex-1 text-xs h-8"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-xs text-google-gray mb-1 block">Accent Color</Label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={adData.accentColor}
                          onChange={(e) => updateAdData("accentColor", e.target.value)}
                          className="w-8 h-8 rounded border border-google-border cursor-pointer"
                        />
                        <Input
                          value={adData.accentColor}
                          onChange={(e) => updateAdData("accentColor", e.target.value)}
                          className="flex-1 text-xs h-8"
                        />
                      </div>
                    </div>
                  </div>
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
                      <SelectItem value="Accounting Professional">Accounting Professional</SelectItem>
                      <SelectItem value="Administrative Assistant">Administrative Assistant</SelectItem>
                      <SelectItem value="Arts & Design Professional">Arts & Design Professional</SelectItem>
                      <SelectItem value="Business Development Manager">Business Development Manager</SelectItem>
                      <SelectItem value="Community Services Worker">Community Services Worker</SelectItem>
                      <SelectItem value="Consultant">Consultant</SelectItem>
                      <SelectItem value="Customer Success Manager">Customer Success Manager</SelectItem>
                      <SelectItem value="Educator">Educator</SelectItem>
                      <SelectItem value="Engineer">Engineer</SelectItem>
                      <SelectItem value="Entrepreneur">Entrepreneur</SelectItem>
                      <SelectItem value="Finance Professional">Finance Professional</SelectItem>
                      <SelectItem value="Healthcare Professional">Healthcare Professional</SelectItem>
                      <SelectItem value="HR Professional">HR Professional</SelectItem>
                      <SelectItem value="IT Professional">IT Professional</SelectItem>
                      <SelectItem value="Legal Professional">Legal Professional</SelectItem>
                      <SelectItem value="Marketing Specialist">Marketing Specialist</SelectItem>
                      <SelectItem value="Media & Communications Professional">Media & Communications Professional</SelectItem>
                      <SelectItem value="Military/Security Professional">Military/Security Professional</SelectItem>
                      <SelectItem value="Operations Manager">Operations Manager</SelectItem>
                      <SelectItem value="Product Manager">Product Manager</SelectItem>
                      <SelectItem value="Project Manager">Project Manager</SelectItem>
                      <SelectItem value="Purchasing Professional">Purchasing Professional</SelectItem>
                      <SelectItem value="Quality Assurance Specialist">Quality Assurance Specialist</SelectItem>
                      <SelectItem value="Real Estate Professional">Real Estate Professional</SelectItem>
                      <SelectItem value="Researcher">Researcher</SelectItem>
                      <SelectItem value="Sales Professional">Sales Professional</SelectItem>
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
                      <SelectItem value="Accounting Office">Accounting Office</SelectItem>
                      <SelectItem value="Administrative Office">Administrative Office</SelectItem>
                      <SelectItem value="Design Studio">Design Studio</SelectItem>
                      <SelectItem value="Corporate Boardroom">Corporate Boardroom</SelectItem>
                      <SelectItem value="Community Center">Community Center</SelectItem>
                      <SelectItem value="Consulting Office">Consulting Office</SelectItem>
                      <SelectItem value="Customer Service Center">Customer Service Center</SelectItem>
                      <SelectItem value="Classroom">Classroom</SelectItem>
                      <SelectItem value="Engineering Lab">Engineering Lab</SelectItem>
                      <SelectItem value="Startup Office">Startup Office</SelectItem>
                      <SelectItem value="Financial Institution">Financial Institution</SelectItem>
                      <SelectItem value="Hospital/Medical Facility">Hospital/Medical Facility</SelectItem>
                      <SelectItem value="HR Department">HR Department</SelectItem>
                      <SelectItem value="Tech Workspace">Tech Workspace</SelectItem>
                      <SelectItem value="Law Office">Law Office</SelectItem>
                      <SelectItem value="Marketing Agency">Marketing Agency</SelectItem>
                      <SelectItem value="Media Studio">Media Studio</SelectItem>
                      <SelectItem value="Security Command Center">Security Command Center</SelectItem>
                      <SelectItem value="Operations Floor">Operations Floor</SelectItem>
                      <SelectItem value="Product Development Lab">Product Development Lab</SelectItem>
                      <SelectItem value="Project War Room">Project War Room</SelectItem>
                      <SelectItem value="Procurement Office">Procurement Office</SelectItem>
                      <SelectItem value="Quality Control Lab">Quality Control Lab</SelectItem>
                      <SelectItem value="Real Estate Office">Real Estate Office</SelectItem>
                      <SelectItem value="Research Laboratory">Research Laboratory</SelectItem>
                      <SelectItem value="Sales Floor">Sales Floor</SelectItem>
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
