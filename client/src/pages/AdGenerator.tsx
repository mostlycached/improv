import { useState, useRef, useEffect } from "react";
import { Wand2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import ControlPanel from "@/components/ControlPanel";
import SimpleCanvas from "@/components/SimpleCanvas";
import FloatingToolbar from "@/components/FloatingToolbar";

export interface AdData {
  title: string;
  ctaText: string;
  primaryColor: string;
  accentColor: string;
  layout: string;
  backgroundImageUrl?: string;
}

export default function AdGenerator() {
  const [adData, setAdData] = useState<AdData>({
    title: "Title",
    ctaText: "Learn More",
    primaryColor: "#4285F4",
    accentColor: "#EA4335", 
    layout: "bottom-overlay",
    backgroundImageUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDgwMCA2MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgo8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNjY2NzlBOyIgLz4KPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNDI4NUY0OyIgLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0idXJsKCNncmFkKSIvPgo8L3N2Zz4K"
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const canvasRef = useRef<any>(null);

  // Handle URL parameters for Chrome extension edit mode
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isEditMode = urlParams.get('edit') === 'true';
    const dataParam = urlParams.get('data');
    
    console.log('Edit mode check:', { isEditMode, hasDataParam: !!dataParam, url: window.location.href });
    
    if (isEditMode && dataParam) {
      try {
        const extensionData = JSON.parse(atob(dataParam));
        console.log('Parsed extension data:', extensionData);
        
        // Convert Chrome extension data format to AdData format
        const convertedData: AdData = {
          title: extensionData.title || "Title",
          ctaText: extensionData.ctaText || "Learn More", 
          primaryColor: "#4285F4", // Default since extension doesn't provide this
          accentColor: "#EA4335",  // Default since extension doesn't provide this
          layout: extensionData.layout || "bottom-overlay"
          // backgroundImageUrl will be generated below
        };
        
        setAdData(convertedData);
        console.log('Loaded ad data from Chrome extension:', convertedData);
        
        // Trigger background image generation with the extension data
        if (extensionData.artisticStyle && extensionData.personArchetype && extensionData.environment) {
          generateBackgroundFromExtension(extensionData);
        }
      } catch (error) {
        console.error('Failed to parse Chrome extension data:', error);
        console.error('Raw data param:', dataParam);
      }
    }
  }, []);

  // Generate background image from Chrome extension data
  const generateBackgroundFromExtension = async (extensionData: any) => {
    try {
      setIsGenerating(true);
      
      const response = await fetch('/api/generate-background', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: extensionData.title || 'Professional advertisement',
          style: extensionData.artisticStyle || 'Photorealistic',
          personArchetype: extensionData.personArchetype || 'Business Executive',
          environment: extensionData.environment || 'Modern Office',
          colorPalette: extensionData.colorPalette || 'Corporate Blue'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAdData(prev => ({
          ...prev,
          backgroundImageUrl: data.imageUrl
        }));
        console.log('Generated background image for Chrome extension edit');
      } else {
        console.error('Failed to generate background image:', response.status);
      }
    } catch (error) {
      console.error('Error generating background image:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = () => {
    // Export will be handled by the SimpleCanvas component
    if (canvasRef.current?.toDataURL) {
      const dataURL = canvasRef.current.toDataURL();
      const link = document.createElement('a');
      link.download = 'ad-design.png';
      link.href = dataURL;
      link.click();
    }
  };

  const handleElementUpdate = (updates: any) => {
    // Handle element updates from floating toolbar
    console.log('Element updated:', updates);
  };

  const handleDone = () => {
    setSelectedElement(null);
  };

  return (
    <div className="min-h-screen bg-google-light">
      {/* Header */}
      <header className="bg-white border-b border-google-border px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-google-blue rounded-lg flex items-center justify-center">
              <Wand2 className="text-white text-sm w-4 h-4" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">🧩 Improv Ads</h1>
          </div>

        </div>
      </header>
      <div className="flex h-[calc(100vh-72px)]">
        {/* Control Panel */}
        <ControlPanel 
          adData={adData}
          setAdData={setAdData}
          isGenerating={isGenerating}
          setIsGenerating={setIsGenerating}
        />

        {/* Preview Area */}
        <div className="flex-1 bg-gray-100 flex flex-col">
          <div className="p-6 bg-white border-b border-google-border">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Live Preview</h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-google-gray">1080 × 1080px</span>
              </div>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-8">
            <SimpleCanvas 
              ref={canvasRef}
              adData={adData} 
              onElementSelect={setSelectedElement}
              selectedElement={selectedElement}
            />
          </div>

          {/* Export Button - Hidden for now */}
          {/* <div className="p-6 bg-white border-t border-google-border flex justify-center">
            <Button 
              onClick={handleExport}
              className="bg-google-blue hover:bg-blue-600 text-white px-8 py-2"
            >
              <Download className="w-4 h-4 mr-2" />
              Export PNG
            </Button>
          </div> */}

          {/* Status Bar */}
          <div className="px-6 py-4 bg-white border-t border-google-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-google-gray">
                <div className="w-2 h-2 bg-google-green rounded-full"></div>
                <span>Preview updated</span>
              </div>
              <Button 
                onClick={handleExport}
                className="bg-google-blue hover:bg-blue-600 text-white"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PNG
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Floating Toolbar */}
      <FloatingToolbar 
        selectedElement={selectedElement}
        canvasRef={canvasRef}
        onElementUpdate={handleElementUpdate}
        onDone={handleDone}
        adData={adData}
        setAdData={setAdData}
      />
      {/* Loading Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 text-center">
            <div className="animate-spin w-8 h-8 border-3 border-google-blue border-t-transparent rounded-full mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Generating Content</h3>
            <p className="text-sm text-google-gray">AI is analyzing your URL and creating the perfect ad content...</p>
          </div>
        </div>
      )}
    </div>
  );
}
