import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { AdData } from '@/pages/AdGenerator';

interface SimpleCanvasProps {
  adData: AdData;
  onElementSelect: (element: any) => void;
  selectedElement: any;
}

const SimpleCanvas = forwardRef<any, SimpleCanvasProps>(({ adData, onElementSelect, selectedElement }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textElementsRef = useRef<Array<{
    type: 'title' | 'subtitle' | 'cta';
    text: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }>>([]);

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

    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;

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

  // Helper function to wrap text
  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + ' ' + word).width;
      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  };

  const renderLayoutElements = (ctx: CanvasRenderingContext2D) => {
    const width = 800;
    const height = 600;

    // Clear text elements array at the start of each render
    textElementsRef.current = [];

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
      default:
        renderCenteredLayout(ctx, width, height);
    }
  };

  const renderCenteredLayout = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Clear text elements array
    textElementsRef.current = [];

    // Title with text wrapping
    ctx.font = 'bold 64px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const titleLines = wrapText(ctx, adData.title, width - 100); // Leave 50px padding on each side
    const lineHeight = 70;
    const totalHeight = titleLines.length * lineHeight;
    const startY = height / 2 - totalHeight / 2 + lineHeight / 2;
    
    titleLines.forEach((line, index) => {
      const y = startY + (index * lineHeight);
      ctx.fillText(line, width / 2, y);
    });
    
    // Store title element bounds (using bounding box of all lines)
    const titleMetrics = ctx.measureText(adData.title);
    textElementsRef.current.push({
      type: 'title',
      text: adData.title,
      x: width / 2 - titleMetrics.width / 2,
      y: startY - lineHeight / 2,
      width: titleMetrics.width,
      height: totalHeight
    });

    // CTA Button
    ctx.fillStyle = adData.accentColor;
    const buttonX = width / 2 - 100;
    const buttonY = height * 2 / 3 - 25;
    roundRect(ctx, buttonX, buttonY, 200, 50, 8);
    ctx.fill();

    // Button text
    ctx.font = 'bold 18px Arial';
    ctx.fillStyle = '#ffffff';
    const ctaY = height * 2 / 3;
    ctx.fillText(adData.ctaText, width / 2, ctaY);
    
    // Store CTA element bounds
    textElementsRef.current.push({
      type: 'cta',
      text: adData.ctaText,
      x: buttonX,
      y: buttonY,
      width: 200,
      height: 50
    });
  };

  const renderLeftAlignedLayout = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const leftPadding = 60;

    // Title with text wrapping
    ctx.font = 'bold 56px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    
    const titleLines = wrapText(ctx, adData.title, width - leftPadding - 60); // Leave padding on both sides
    const lineHeight = 62;
    const totalHeight = titleLines.length * lineHeight;
    const startY = height / 2 - totalHeight / 2 + lineHeight / 2;
    
    titleLines.forEach((line, index) => {
      const y = startY + (index * lineHeight);
      ctx.fillText(line, leftPadding, y);
    });
    
    // Store title element bounds
    const maxLineWidth = Math.max(...titleLines.map(line => ctx.measureText(line).width));
    textElementsRef.current.push({
      type: 'title',
      text: adData.title,
      x: leftPadding,
      y: startY - lineHeight / 2,
      width: maxLineWidth,
      height: totalHeight
    });

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
    const ctaY = height * 3 / 4;
    ctx.fillText(adData.ctaText, leftPadding + 90, ctaY);
    
    textElementsRef.current.push({
      type: 'cta',
      text: adData.ctaText,
      x: buttonX,
      y: buttonY,
      width: 180,
      height: 45
    });
  };

  const renderBottomOverlayLayout = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Overlay background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, height * 2 / 3, width, height / 3);

    // Title
    ctx.font = 'bold 52px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const titleMetrics = ctx.measureText(adData.title);
    const titleY = height * 5 / 6;
    ctx.fillText(adData.title, width / 2, titleY);
    
    textElementsRef.current.push({
      type: 'title',
      text: adData.title,
      x: width / 2 - titleMetrics.width / 2,
      y: titleY - 26,
      width: titleMetrics.width,
      height: 52
    });

    // CTA Button
    ctx.fillStyle = adData.accentColor;
    const buttonX = width - 180;
    const buttonY = height - 60;
    roundRect(ctx, buttonX, buttonY, 150, 40, 5);
    ctx.fill();

    // Button text
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = '#ffffff';
    const ctaY = height - 40;
    ctx.fillText(adData.ctaText, width - 105, ctaY);
    
    textElementsRef.current.push({
      type: 'cta',
      text: adData.ctaText,
      x: buttonX,
      y: buttonY,
      width: 150,
      height: 40
    });
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
          const rect = canvasRef.current?.getBoundingClientRect();
          if (rect) {
            const x = (e.clientX - rect.left) * (800 / rect.width);
            const y = (e.clientY - rect.top) * (600 / rect.height);
            // Check if click hit any text element
            const clickedElement = textElementsRef.current.find(element => 
              x >= element.x && x <= element.x + element.width &&
              y >= element.y && y <= element.y + element.height
            );
            
            if (clickedElement) {
              onElementSelect({
                type: clickedElement.type,
                text: clickedElement.text,
                x: clickedElement.x,
                y: clickedElement.y,
                width: clickedElement.width,
                height: clickedElement.height
              });
            } else {
              onElementSelect(null);
            }
          }
        }}
      />
      
    </div>
  );
});

SimpleCanvas.displayName = 'SimpleCanvas';

export default SimpleCanvas;