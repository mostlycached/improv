import { useEffect, useRef, useState } from 'react';
import { AdData } from '@/pages/AdGenerator';

// Dynamic import for fabric
declare const fabric: any;

interface FabricCanvasProps {
  adData: AdData;
  onElementSelect: (element: any) => void;
  selectedElement: any;
}

export default function FabricCanvas({ adData, onElementSelect, selectedElement }: FabricCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [fabricLoaded, setFabricLoaded] = useState(false);

  // Load Fabric.js dynamically
  useEffect(() => {
    const loadFabric = async () => {
      if (typeof window !== 'undefined' && !window.fabric) {
        const fabricModule = await import('fabric');
        window.fabric = fabricModule.fabric;
      }
      setFabricLoaded(true);
    };
    loadFabric();
  }, []);

  useEffect(() => {
    if (!canvasRef.current || fabricRef.current || !fabricLoaded || !window.fabric) return;

    // Initialize Fabric.js canvas
    const canvas = new window.fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#ffffff',
      selection: true,
    });

    fabricRef.current = canvas;

    // Handle object selection
    canvas.on('selection:created', (e: any) => {
      onElementSelect(e.selected?.[0] || e.target || null);
    });

    canvas.on('selection:updated', (e: any) => {
      onElementSelect(e.selected?.[0] || e.target || null);
    });

    canvas.on('selection:cleared', () => {
      onElementSelect(null);
    });

    setIsReady(true);

    return () => {
      canvas.dispose();
      fabricRef.current = null;
    };
  }, [fabricLoaded, onElementSelect]);

  // Update canvas when adData changes
  useEffect(() => {
    if (!fabricRef.current || !isReady || !window.fabric) return;

    const canvas = fabricRef.current;
    
    // Clear existing objects
    canvas.clear();
    canvas.backgroundColor = '#ffffff';

    // Apply background image if exists
    if (adData.backgroundImageUrl) {
      window.fabric.Image.fromURL(adData.backgroundImageUrl, (img: any) => {
        const scaleX = canvas.width / img.width;
        const scaleY = canvas.height / img.height;
        const scale = Math.max(scaleX, scaleY);
        
        img.set({
          scaleX: scale,
          scaleY: scale,
          left: canvas.width / 2,
          top: canvas.height / 2,
          originX: 'center',
          originY: 'center',
          selectable: false,
          evented: false,
        });
        canvas.backgroundImage = img;
        canvas.renderAll();
      });
    }

    // Add elements based on layout
    renderLayout(canvas, adData);
  }, [adData, isReady, fabricLoaded]);

  const renderLayout = (canvas: any, data: AdData) => {
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    switch (data.layout) {
      case 'centered':
        renderCenteredLayout(canvas, data, canvasWidth, canvasHeight);
        break;
      case 'left-aligned':
        renderLeftAlignedLayout(canvas, data, canvasWidth, canvasHeight);
        break;
      case 'bottom-overlay':
        renderBottomOverlayLayout(canvas, data, canvasWidth, canvasHeight);
        break;
      case 'split-screen':
        renderSplitScreenLayout(canvas, data, canvasWidth, canvasHeight);
        break;
      default:
        renderCenteredLayout(canvas, data, canvasWidth, canvasHeight);
    }
  };

  const renderCenteredLayout = (canvas: any, data: AdData, width: number, height: number) => {
    // Title
    const title = new window.fabric.Text(data.title, {
      left: width / 2,
      top: height / 3,
      originX: 'center',
      originY: 'center',
      fontSize: 48,
      fontWeight: 'bold',
      fill: data.primaryColor,
      fontFamily: 'Arial',
    });

    // Subtitle
    const subtitle = new window.fabric.Text(data.subtitle, {
      left: width / 2,
      top: height / 2,
      originX: 'center',
      originY: 'center',
      fontSize: 24,
      fill: '#333333',
      fontFamily: 'Arial',
    });

    // CTA Button
    const buttonRect = new window.fabric.Rect({
      left: width / 2 - 100,
      top: height * 2 / 3 - 25,
      width: 200,
      height: 50,
      fill: data.accentColor,
      rx: 8,
      ry: 8,
    });

    const buttonText = new window.fabric.Text(data.ctaText, {
      left: width / 2,
      top: height * 2 / 3,
      originX: 'center',
      originY: 'center',
      fontSize: 18,
      fill: '#ffffff',
      fontFamily: 'Arial',
      fontWeight: 'bold',
    });

    // Group button elements
    const buttonGroup = new window.fabric.Group([buttonRect, buttonText], {
      left: width / 2,
      top: height * 2 / 3,
      originX: 'center',
      originY: 'center',
    });

    canvas.add(title, subtitle, buttonGroup);
  };

  const renderLeftAlignedLayout = (canvas: any, data: AdData, width: number, height: number) => {
    const leftPadding = 60;

    // Title
    const title = new window.fabric.Text(data.title, {
      left: leftPadding,
      top: height / 4,
      fontSize: 42,
      fontWeight: 'bold',
      fill: data.primaryColor,
      fontFamily: 'Arial',
    });

    // Subtitle
    const subtitle = new window.fabric.Text(data.subtitle, {
      left: leftPadding,
      top: height / 2,
      fontSize: 20,
      fill: '#333333',
      fontFamily: 'Arial',
    });

    // CTA Button
    const buttonRect = new window.fabric.Rect({
      left: leftPadding,
      top: height * 3 / 4,
      width: 180,
      height: 45,
      fill: data.accentColor,
      rx: 6,
      ry: 6,
    });

    const buttonText = new window.fabric.Text(data.ctaText, {
      left: leftPadding + 90,
      top: height * 3 / 4 + 22,
      originX: 'center',
      originY: 'center',
      fontSize: 16,
      fill: '#ffffff',
      fontFamily: 'Arial',
      fontWeight: 'bold',
    });

    const buttonGroup = new window.fabric.Group([buttonRect, buttonText], {
      left: leftPadding,
      top: height * 3 / 4,
    });

    canvas.add(title, subtitle, buttonGroup);
  };

  const renderBottomOverlayLayout = (canvas: any, data: AdData, width: number, height: number) => {
    // Create overlay background
    const overlay = new window.fabric.Rect({
      left: 0,
      top: height * 2 / 3,
      width: width,
      height: height / 3,
      fill: 'rgba(0, 0, 0, 0.7)',
      selectable: false,
    });

    // Title
    const title = new window.fabric.Text(data.title, {
      left: width / 2,
      top: height * 3 / 4,
      originX: 'center',
      originY: 'center',
      fontSize: 36,
      fontWeight: 'bold',
      fill: '#ffffff',
      fontFamily: 'Arial',
    });

    // Subtitle
    const subtitle = new window.fabric.Text(data.subtitle, {
      left: width / 2,
      top: height * 5 / 6,
      originX: 'center',
      originY: 'center',
      fontSize: 18,
      fill: '#ffffff',
      fontFamily: 'Arial',
    });

    // CTA Button
    const buttonRect = new window.fabric.Rect({
      left: width - 180,
      top: height - 60,
      width: 150,
      height: 40,
      fill: data.accentColor,
      rx: 5,
      ry: 5,
    });

    const buttonText = new window.fabric.Text(data.ctaText, {
      left: width - 105,
      top: height - 40,
      originX: 'center',
      originY: 'center',
      fontSize: 14,
      fill: '#ffffff',
      fontFamily: 'Arial',
      fontWeight: 'bold',
    });

    const buttonGroup = new window.fabric.Group([buttonRect, buttonText], {
      left: width - 180,
      top: height - 60,
    });

    canvas.add(overlay, title, subtitle, buttonGroup);
  };

  const renderSplitScreenLayout = (canvas: any, data: AdData, width: number, height: number) => {
    const splitX = width / 2;

    // Left section background
    const leftBg = new window.fabric.Rect({
      left: 0,
      top: 0,
      width: splitX,
      height: height,
      fill: data.primaryColor,
      selectable: false,
    });

    // Title on left
    const title = new window.fabric.Text(data.title, {
      left: splitX / 2,
      top: height / 3,
      originX: 'center',
      originY: 'center',
      fontSize: 38,
      fontWeight: 'bold',
      fill: '#ffffff',
      fontFamily: 'Arial',
    });

    // Subtitle on right
    const subtitle = new window.fabric.Text(data.subtitle, {
      left: splitX + (splitX / 2),
      top: height / 2,
      originX: 'center',
      originY: 'center',
      fontSize: 22,
      fill: '#333333',
      fontFamily: 'Arial',
    });

    // CTA Button on right
    const buttonRect = new window.fabric.Rect({
      left: splitX + (splitX / 2) - 80,
      top: height * 2 / 3 - 22,
      width: 160,
      height: 45,
      fill: data.accentColor,
      rx: 6,
      ry: 6,
    });

    const buttonText = new window.fabric.Text(data.ctaText, {
      left: splitX + (splitX / 2),
      top: height * 2 / 3,
      originX: 'center',
      originY: 'center',
      fontSize: 16,
      fill: '#ffffff',
      fontFamily: 'Arial',
      fontWeight: 'bold',
    });

    const buttonGroup = new window.fabric.Group([buttonRect, buttonText], {
      left: splitX + (splitX / 2),
      top: height * 2 / 3,
      originX: 'center',
      originY: 'center',
    });

    canvas.add(leftBg, title, subtitle, buttonGroup);
  };

  const exportCanvas = () => {
    if (!fabricRef.current) return;
    
    const dataURL = fabricRef.current.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2,
    });

    // Create download link
    const link = document.createElement('a');
    link.download = 'ad-design.png';
    link.href = dataURL;
    link.click();
  };

  if (!fabricLoaded) {
    return (
      <div className="flex items-center justify-center w-[800px] h-[600px] border border-gray-200 rounded-lg">
        <div className="text-gray-500">Loading canvas...</div>
      </div>
    );
  }

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="border border-gray-200 rounded-lg shadow-sm"
      />
      <button
        onClick={exportCanvas}
        className="absolute top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-md shadow-lg hover:bg-blue-700 transition-colors"
      >
        Export PNG
      </button>
    </div>
  );
}

// Add fabric to window for dynamic loading
declare global {
  interface Window {
    fabric: any;
  }
}