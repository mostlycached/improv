import { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { AdData } from '@/pages/AdGenerator';

interface FabricCanvasProps {
  adData: AdData;
  onElementSelect: (element: fabric.Object | null) => void;
  selectedElement: fabric.Object | null;
}

export default function FabricCanvas({ adData, onElementSelect, selectedElement }: FabricCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || fabricRef.current) return;

    // Initialize Fabric.js canvas
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#ffffff',
      selection: true,
    });

    fabricRef.current = canvas;

    // Handle object selection
    canvas.on('selection:created', (e) => {
      onElementSelect(e.selected?.[0] || null);
    });

    canvas.on('selection:updated', (e) => {
      onElementSelect(e.selected?.[0] || null);
    });

    canvas.on('selection:cleared', () => {
      onElementSelect(null);
    });

    setIsReady(true);

    return () => {
      canvas.dispose();
      fabricRef.current = null;
    };
  }, [onElementSelect]);

  // Update canvas when adData changes
  useEffect(() => {
    if (!fabricRef.current || !isReady) return;

    const canvas = fabricRef.current;
    
    // Clear existing objects
    canvas.clear();
    canvas.setBackgroundColor('#ffffff', canvas.renderAll.bind(canvas));

    // Apply background image if exists
    if (adData.backgroundImageUrl) {
      fabric.Image.fromURL(adData.backgroundImageUrl, (img) => {
        img.set({
          scaleX: canvas.width! / img.width!,
          scaleY: canvas.height! / img.height!,
          selectable: false,
          evented: false,
        });
        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
      });
    }

    // Add elements based on layout
    renderLayout(canvas, adData);
  }, [adData, isReady]);

  const renderLayout = (canvas: fabric.Canvas, data: AdData) => {
    const canvasWidth = canvas.width!;
    const canvasHeight = canvas.height!;

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

  const renderCenteredLayout = (canvas: fabric.Canvas, data: AdData, width: number, height: number) => {
    // Title
    const title = new fabric.Text(data.title, {
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
    const subtitle = new fabric.Text(data.subtitle, {
      left: width / 2,
      top: height / 2,
      originX: 'center',
      originY: 'center',
      fontSize: 24,
      fill: '#333333',
      fontFamily: 'Arial',
    });

    // CTA Button
    const buttonRect = new fabric.Rect({
      left: width / 2,
      top: height * 2 / 3,
      originX: 'center',
      originY: 'center',
      width: 200,
      height: 50,
      fill: data.accentColor,
      rx: 8,
      ry: 8,
    });

    const buttonText = new fabric.Text(data.ctaText, {
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
    const buttonGroup = new fabric.Group([buttonRect, buttonText], {
      left: width / 2,
      top: height * 2 / 3,
      originX: 'center',
      originY: 'center',
    });

    canvas.add(title, subtitle, buttonGroup);
  };

  const renderLeftAlignedLayout = (canvas: fabric.Canvas, data: AdData, width: number, height: number) => {
    const leftPadding = 60;

    // Title
    const title = new fabric.Text(data.title, {
      left: leftPadding,
      top: height / 4,
      fontSize: 42,
      fontWeight: 'bold',
      fill: data.primaryColor,
      fontFamily: 'Arial',
    });

    // Subtitle
    const subtitle = new fabric.Text(data.subtitle, {
      left: leftPadding,
      top: height / 2,
      fontSize: 20,
      fill: '#333333',
      fontFamily: 'Arial',
    });

    // CTA Button
    const buttonRect = new fabric.Rect({
      left: leftPadding,
      top: height * 3 / 4,
      width: 180,
      height: 45,
      fill: data.accentColor,
      rx: 6,
      ry: 6,
    });

    const buttonText = new fabric.Text(data.ctaText, {
      left: leftPadding + 90,
      top: height * 3 / 4 + 22,
      originX: 'center',
      originY: 'center',
      fontSize: 16,
      fill: '#ffffff',
      fontFamily: 'Arial',
      fontWeight: 'bold',
    });

    const buttonGroup = new fabric.Group([buttonRect, buttonText], {
      left: leftPadding,
      top: height * 3 / 4,
    });

    canvas.add(title, subtitle, buttonGroup);
  };

  const renderBottomOverlayLayout = (canvas: fabric.Canvas, data: AdData, width: number, height: number) => {
    // Create overlay background
    const overlay = new fabric.Rect({
      left: 0,
      top: height * 2 / 3,
      width: width,
      height: height / 3,
      fill: 'rgba(0, 0, 0, 0.7)',
      selectable: false,
    });

    // Title
    const title = new fabric.Text(data.title, {
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
    const subtitle = new fabric.Text(data.subtitle, {
      left: width / 2,
      top: height * 5 / 6,
      originX: 'center',
      originY: 'center',
      fontSize: 18,
      fill: '#ffffff',
      fontFamily: 'Arial',
    });

    // CTA Button
    const buttonRect = new fabric.Rect({
      left: width - 180,
      top: height - 60,
      width: 150,
      height: 40,
      fill: data.accentColor,
      rx: 5,
      ry: 5,
    });

    const buttonText = new fabric.Text(data.ctaText, {
      left: width - 105,
      top: height - 40,
      originX: 'center',
      originY: 'center',
      fontSize: 14,
      fill: '#ffffff',
      fontFamily: 'Arial',
      fontWeight: 'bold',
    });

    const buttonGroup = new fabric.Group([buttonRect, buttonText], {
      left: width - 180,
      top: height - 60,
    });

    canvas.add(overlay, title, subtitle, buttonGroup);
  };

  const renderSplitScreenLayout = (canvas: fabric.Canvas, data: AdData, width: number, height: number) => {
    const splitX = width / 2;

    // Left section background
    const leftBg = new fabric.Rect({
      left: 0,
      top: 0,
      width: splitX,
      height: height,
      fill: data.primaryColor,
      selectable: false,
    });

    // Title on left
    const title = new fabric.Text(data.title, {
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
    const subtitle = new fabric.Text(data.subtitle, {
      left: splitX + (splitX / 2),
      top: height / 2,
      originX: 'center',
      originY: 'center',
      fontSize: 22,
      fill: '#333333',
      fontFamily: 'Arial',
    });

    // CTA Button on right
    const buttonRect = new fabric.Rect({
      left: splitX + (splitX / 2),
      top: height * 2 / 3,
      originX: 'center',
      originY: 'center',
      width: 160,
      height: 45,
      fill: data.accentColor,
      rx: 6,
      ry: 6,
    });

    const buttonText = new fabric.Text(data.ctaText, {
      left: splitX + (splitX / 2),
      top: height * 2 / 3,
      originX: 'center',
      originY: 'center',
      fontSize: 16,
      fill: '#ffffff',
      fontFamily: 'Arial',
      fontWeight: 'bold',
    });

    const buttonGroup = new fabric.Group([buttonRect, buttonText], {
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