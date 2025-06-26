import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { AdData } from '@/pages/AdGenerator';

interface SimpleCanvasProps {
  adData: AdData;
  onElementSelect: (element: any) => void;
  selectedElement: any;
}

const SimpleCanvas = forwardRef<any, SimpleCanvasProps>(({ adData, onElementSelect, selectedElement }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Expose canvas methods to parent component
  useImperativeHandle(ref, () => ({
    toDataURL: () => canvasRef.current?.toDataURL() || ''
  }));

  useEffect(() => {
    renderCanvas();
  }, [adData]);

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size based on layout
    if (adData.layout === 'split-screen') {
      // 3:2 aspect ratio for split-screen layout
      canvas.width = 800;
      canvas.height = 1200; // 800 * 1.5 = 1200 (3:2 ratio)
    } else {
      // Default 4:3 aspect ratio for other layouts
      canvas.width = 800;
      canvas.height = 600;
    }

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
        renderLayoutElements(ctx);
      };
      img.src = adData.backgroundImageUrl;
    } else {
      renderLayoutElements(ctx);
    }
  };

  const renderLayoutElements = (ctx: CanvasRenderingContext2D) => {
    const width = 800;
    const height = 600;

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
    ctx.textBaseline = 'middle';
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
    ctx.fillText(adData.ctaText, width / 2, height * 2 / 3);
  };

  const renderLeftAlignedLayout = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const leftPadding = 60;

    // Title
    ctx.font = 'bold 42px Arial';
    ctx.fillStyle = adData.primaryColor;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
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
    ctx.fillText(adData.ctaText, leftPadding + 90, height * 3 / 4);
  };

  const renderBottomOverlayLayout = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Overlay background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, height * 2 / 3, width, height / 3);

    // Title
    ctx.font = 'bold 36px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
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
    ctx.fillText(adData.ctaText, width - 105, height - 40);
  };

  const renderSplitScreenLayout = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const splitX = width / 2;

    // Left section background
    ctx.fillStyle = adData.primaryColor;
    ctx.fillRect(0, 0, splitX, height);

    // Title on left - positioned higher for better balance in tall layout
    ctx.font = 'bold 42px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(adData.title, splitX / 2, height * 0.4);

    // Subtitle on right - positioned in upper third
    ctx.font = '24px Arial';
    ctx.fillStyle = '#333333';
    ctx.fillText(adData.subtitle, splitX + (splitX / 2), height * 0.35);

    // CTA Button on right - positioned in middle area
    ctx.fillStyle = adData.accentColor;
    const buttonX = splitX + (splitX / 2) - 80;
    const buttonY = height * 0.55 - 22;
    roundRect(ctx, buttonX, buttonY, 160, 45, 6);
    ctx.fill();

    // Button text
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(adData.ctaText, splitX + (splitX / 2), height * 0.55);
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

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="border border-gray-200 rounded-lg shadow-sm cursor-pointer"
        width={800}
        height={600}
        onClick={(e) => {
          // Simple click handling for demo
          const rect = canvasRef.current?.getBoundingClientRect();
          if (rect) {
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            console.log('Canvas clicked at:', x, y);
            // For now, just trigger selection of a mock element
            onElementSelect({ type: 'text', text: adData.title });
          }
        }}
      />
      <button
        onClick={() => {
          const dataURL = canvasRef.current?.toDataURL() || '';
          const link = document.createElement('a');
          link.download = 'ad-design.png';
          link.href = dataURL;
          link.click();
        }}
        className="absolute top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-md shadow-lg hover:bg-blue-700 transition-colors"
      >
        Export PNG
      </button>
    </div>
  );
});

SimpleCanvas.displayName = 'SimpleCanvas';

export default SimpleCanvas;