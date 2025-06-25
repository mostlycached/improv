import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { AdData } from '@/pages/AdGenerator';

interface FabricCanvasProps {
  adData: AdData;
  onElementSelect: (element: any) => void;
  selectedElement: any;
}

const FabricCanvas = forwardRef<any, FabricCanvasProps>(({ adData, onElementSelect, selectedElement }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [fabricLoaded, setFabricLoaded] = useState(false);

  // Expose canvas methods to parent component
  useImperativeHandle(ref, () => fabricRef.current);

  // Load Fabric.js dynamically
  useEffect(() => {
    const loadFabric = async () => {
      try {
        // Import fabric and handle different module formats
        const fabricModule = await import('fabric');
        console.log('Fabric module loaded:', fabricModule);
        // The fabric module exports the whole library as default
        const fabricInstance = fabricModule.default;
        (window as any).fabric = fabricInstance;
        console.log('Fabric.js loaded successfully', !!fabricInstance?.Canvas);
        setFabricLoaded(!!fabricInstance?.Canvas);
      } catch (error) {
        console.error('Failed to load Fabric.js:', error);
        // Fallback to regular canvas if fabric fails
        setFabricLoaded(false);
      }
    };
    loadFabric();
  }, []);

  // Force regular canvas for now to ensure preview works
  useEffect(() => {
    setTimeout(() => {
      console.log('Checking canvas initialization');
      if (!fabricRef.current && canvasRef.current) {
        console.log('Forcing regular canvas initialization');
        setFabricLoaded(false);
        initializeRegularCanvas();
        setIsReady(true);
      }
    }, 200);
  }, []);

  useEffect(() => {
    if (!canvasRef.current || fabricRef.current) return;

    console.log('Initializing canvas, fabricLoaded:', fabricLoaded, 'fabric available:', !!(window as any).fabric?.Canvas);
    
    if (fabricLoaded && (window as any).fabric?.Canvas) {
      try {
        // Initialize Fabric.js canvas
        const fabric = (window as any).fabric;
        console.log('Creating Fabric canvas');
        const canvas = new fabric.Canvas(canvasRef.current, {
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
        console.log('Fabric canvas ready');

        return () => {
          canvas.dispose();
          fabricRef.current = null;
        };
      } catch (error) {
        console.error('Fabric canvas creation failed:', error);
        initializeRegularCanvas();
        setIsReady(true);
      }
    } else {
      // Fallback to regular canvas rendering
      console.log('Using regular canvas');
      initializeRegularCanvas();
      setIsReady(true);
    }
  }, [fabricLoaded, onElementSelect]);

  const initializeRegularCanvas = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 600;
    
    console.log('Regular canvas initialized');
    
    // Store canvas context for regular rendering
    fabricRef.current = { 
      canvas,
      ctx,
      toDataURL: () => canvas.toDataURL(),
      renderAll: () => renderRegularCanvas()
    };
    
    // Immediately render content
    renderRegularCanvas();
  };

  const renderRegularCanvas = () => {
    if (!fabricRef.current?.ctx) return;
    
    const { ctx, canvas } = fabricRef.current;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply background image if exists
    if (adData.backgroundImageUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
        const x = (canvas.width - img.width * scale) / 2;
        const y = (canvas.height - img.height * scale) / 2;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        renderLayoutElements();
      };
      img.src = adData.backgroundImageUrl;
    } else {
      renderLayoutElements();
    }
  };

  const renderLayoutElements = () => {
    if (!fabricRef.current?.ctx) return;
    
    const { ctx, canvas } = fabricRef.current;
    const width = canvas.width;
    const height = canvas.height;

    switch (adData.layout) {
      case 'centered':
        renderCenteredLayout(ctx, width, height);
        break;
      case 'left-aligned':
        renderLeftAlignedLayout(ctx, width, height);
        break;
      case 'bottom-overlay':
        renderBottomOverlayLayout(ctx, width, height);
        break;
      case 'split-screen':
        renderSplitScreenLayout(ctx, width, height);
        break;
      default:
        renderCenteredLayout(ctx, width, height);
    }
  };

  const renderCenteredLayout = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Title
    ctx.font = 'bold 48px Arial';
    ctx.fillStyle = adData.primaryColor;
    ctx.textAlign = 'center';
    ctx.fillText(adData.title, width / 2, height / 3);

    // Subtitle
    ctx.font = '24px Arial';
    ctx.fillStyle = '#333333';
    ctx.fillText(adData.subtitle, width / 2, height / 2);

    // CTA Button
    ctx.fillStyle = adData.accentColor;
    const buttonX = width / 2 - 100;
    const buttonY = height * 2 / 3 - 25;
    roundRect(ctx, buttonX, buttonY, 200, 50, 8);
    ctx.fill();

    // Button text
    ctx.font = 'bold 18px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(adData.ctaText, width / 2, height * 2 / 3 + 5);
  };

  const renderLeftAlignedLayout = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const leftPadding = 60;

    // Title
    ctx.font = 'bold 42px Arial';
    ctx.fillStyle = adData.primaryColor;
    ctx.textAlign = 'left';
    ctx.fillText(adData.title, leftPadding, height / 4);

    // Subtitle
    ctx.font = '20px Arial';
    ctx.fillStyle = '#333333';
    ctx.fillText(adData.subtitle, leftPadding, height / 2);

    // CTA Button
    ctx.fillStyle = adData.accentColor;
    const buttonX = leftPadding;
    const buttonY = height * 3 / 4 - 22;
    roundRect(ctx, buttonX, buttonY, 180, 45, 6);
    ctx.fill();

    // Button text
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(adData.ctaText, leftPadding + 90, height * 3 / 4 + 5);
  };

  const renderBottomOverlayLayout = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Overlay background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, height * 2 / 3, width, height / 3);

    // Title
    ctx.font = 'bold 36px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(adData.title, width / 2, height * 3 / 4);

    // Subtitle
    ctx.font = '18px Arial';
    ctx.fillText(adData.subtitle, width / 2, height * 5 / 6);

    // CTA Button
    ctx.fillStyle = adData.accentColor;
    const buttonX = width - 180;
    const buttonY = height - 60;
    roundRect(ctx, buttonX, buttonY, 150, 40, 5);
    ctx.fill();

    // Button text
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(adData.ctaText, width - 105, height - 35);
  };

  const renderSplitScreenLayout = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const splitX = width / 2;

    // Left section background
    ctx.fillStyle = adData.primaryColor;
    ctx.fillRect(0, 0, splitX, height);

    // Title on left
    ctx.font = 'bold 38px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(adData.title, splitX / 2, height / 3);

    // Subtitle on right
    ctx.font = '22px Arial';
    ctx.fillStyle = '#333333';
    ctx.fillText(adData.subtitle, splitX + (splitX / 2), height / 2);

    // CTA Button on right
    ctx.fillStyle = adData.accentColor;
    const buttonX = splitX + (splitX / 2) - 80;
    const buttonY = height * 2 / 3 - 22;
    roundRect(ctx, buttonX, buttonY, 160, 45, 6);
    ctx.fill();

    // Button text
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(adData.ctaText, splitX + (splitX / 2), height * 2 / 3 + 5);
  };

  const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };

  // Update canvas when adData changes
  useEffect(() => {
    if (!isReady) return;

    if (fabricLoaded && (window as any).fabric && fabricRef.current?.clear) {
      // Fabric.js rendering
      const canvas = fabricRef.current;
      const fabric = (window as any).fabric;
      
      canvas.clear();
      canvas.backgroundColor = '#ffffff';

      if (adData.backgroundImageUrl) {
        fabric.Image.fromURL(adData.backgroundImageUrl, (img: any) => {
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

      renderFabricLayout(canvas, adData, fabric);
    } else {
      // Regular canvas rendering
      renderRegularCanvas();
    }
  }, [adData, isReady, fabricLoaded]);

  const renderFabricLayout = (canvas: any, data: AdData, fabric: any) => {
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    switch (data.layout) {
      case 'centered':
        renderFabricCenteredLayout(canvas, data, canvasWidth, canvasHeight, fabric);
        break;
      case 'left-aligned':
        renderFabricLeftAlignedLayout(canvas, data, canvasWidth, canvasHeight, fabric);
        break;
      case 'bottom-overlay':
        renderFabricBottomOverlayLayout(canvas, data, canvasWidth, canvasHeight, fabric);
        break;
      case 'split-screen':
        renderFabricSplitScreenLayout(canvas, data, canvasWidth, canvasHeight, fabric);
        break;
      default:
        renderFabricCenteredLayout(canvas, data, canvasWidth, canvasHeight, fabric);
    }
  };

  const renderFabricCenteredLayout = (canvas: any, data: AdData, width: number, height: number, fabric: any) => {
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

    const subtitle = new fabric.Text(data.subtitle, {
      left: width / 2,
      top: height / 2,
      originX: 'center',
      originY: 'center',
      fontSize: 24,
      fill: '#333333',
      fontFamily: 'Arial',
    });

    const buttonRect = new fabric.Rect({
      left: width / 2 - 100,
      top: height * 2 / 3 - 25,
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

    const buttonGroup = new fabric.Group([buttonRect, buttonText], {
      left: width / 2,
      top: height * 2 / 3,
      originX: 'center',
      originY: 'center',
    });

    canvas.add(title, subtitle, buttonGroup);
  };

  const renderFabricLeftAlignedLayout = (canvas: any, data: AdData, width: number, height: number, fabric: any) => {
    const leftPadding = 60;

    const title = new fabric.Text(data.title, {
      left: leftPadding,
      top: height / 4,
      fontSize: 42,
      fontWeight: 'bold',
      fill: data.primaryColor,
      fontFamily: 'Arial',
    });

    const subtitle = new fabric.Text(data.subtitle, {
      left: leftPadding,
      top: height / 2,
      fontSize: 20,
      fill: '#333333',
      fontFamily: 'Arial',
    });

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

  const renderFabricBottomOverlayLayout = (canvas: any, data: AdData, width: number, height: number, fabric: any) => {
    const overlay = new fabric.Rect({
      left: 0,
      top: height * 2 / 3,
      width: width,
      height: height / 3,
      fill: 'rgba(0, 0, 0, 0.7)',
      selectable: false,
    });

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

    const subtitle = new fabric.Text(data.subtitle, {
      left: width / 2,
      top: height * 5 / 6,
      originX: 'center',
      originY: 'center',
      fontSize: 18,
      fill: '#ffffff',
      fontFamily: 'Arial',
    });

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

  const renderFabricSplitScreenLayout = (canvas: any, data: AdData, width: number, height: number, fabric: any) => {
    const splitX = width / 2;

    const leftBg = new fabric.Rect({
      left: 0,
      top: 0,
      width: splitX,
      height: height,
      fill: data.primaryColor,
      selectable: false,
    });

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

    const subtitle = new fabric.Text(data.subtitle, {
      left: splitX + (splitX / 2),
      top: height / 2,
      originX: 'center',
      originY: 'center',
      fontSize: 22,
      fill: '#333333',
      fontFamily: 'Arial',
    });

    const buttonRect = new fabric.Rect({
      left: splitX + (splitX / 2) - 80,
      top: height * 2 / 3 - 22,
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
    }) || fabricRef.current.toDataURL();

    const link = document.createElement('a');
    link.download = 'ad-design.png';
    link.href = dataURL;
    link.click();
  };

  if (!isReady) {
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
        width={800}
        height={600}
      />
      <button
        onClick={exportCanvas}
        className="absolute top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-md shadow-lg hover:bg-blue-700 transition-colors"
      >
        Export PNG
      </button>
    </div>
  );
});

FabricCanvas.displayName = 'FabricCanvas';

export default FabricCanvas;