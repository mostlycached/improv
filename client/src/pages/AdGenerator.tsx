import { useState, useRef } from "react";
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
    title: "Transform Your Business Today",
    ctaText: "Get Started Free",
    primaryColor: "#4285F4",
    accentColor: "#EA4335",
    layout: "bottom-overlay",
    backgroundImageUrl: ""
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const canvasRef = useRef<any>(null);

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
          <Button 
            onClick={handleExport}
            className="bg-google-blue hover:bg-blue-600 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Ad
          </Button>
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
