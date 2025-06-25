import type { AdData } from "@/pages/AdGenerator";

const DEFAULT_BACKGROUND = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1080' height='1080' viewBox='0 0 1080 1080'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%234285F4;stop-opacity:0.8' /%3E%3Cstop offset='100%25' style='stop-color:%2334A853;stop-opacity:0.6' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1080' height='1080' fill='url(%23grad)'/%3E%3C/svg%3E";

export async function renderAd(canvas: HTMLCanvasElement, adData: AdData): Promise<void> {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Clear canvas
  ctx.clearRect(0, 0, 1080, 1080);

  // Load and draw background
  const bgImage = new Image();
  bgImage.crossOrigin = 'anonymous';
  
  bgImage.onload = () => {
    // Draw background
    ctx.drawImage(bgImage, 0, 0, 1080, 1080);
    
    // Apply layout-specific rendering
    switch (adData.layout) {
      case 'centered':
        renderCenteredLayout(ctx, adData);
        break;
      case 'left-aligned':
        renderLeftAlignedLayout(ctx, adData);
        break;
      case 'bottom-overlay':
        renderBottomOverlayLayout(ctx, adData);
        break;
      case 'split-screen':
        renderSplitScreenLayout(ctx, adData);
        break;
      default:
        renderBottomOverlayLayout(ctx, adData);
    }
  };

  bgImage.onerror = () => {
    // Fallback: draw gradient background
    const gradient = ctx.createLinearGradient(0, 0, 1080, 1080);
    gradient.addColorStop(0, adData.primaryColor + '80');
    gradient.addColorStop(1, adData.accentColor + '60');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1080);
    
    // Render layout
    switch (adData.layout) {
      case 'centered':
        renderCenteredLayout(ctx, adData);
        break;
      case 'left-aligned':
        renderLeftAlignedLayout(ctx, adData);
        break;
      case 'bottom-overlay':
        renderBottomOverlayLayout(ctx, adData);
        break;
      case 'split-screen':
        renderSplitScreenLayout(ctx, adData);
        break;
      default:
        renderBottomOverlayLayout(ctx, adData);
    }
  };

  bgImage.src = adData.backgroundImageUrl || DEFAULT_BACKGROUND;
}

function renderCenteredLayout(ctx: CanvasRenderingContext2D, adData: AdData) {
  // Semi-transparent background for text
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.fillRect(140, 340, 800, 400);
  
  // Title
  ctx.fillStyle = '#1a1a1a';
  ctx.font = 'bold 72px Inter, sans-serif';
  ctx.textAlign = 'center';
  const titleLines = wrapText(ctx, adData.title, 720);
  titleLines.forEach((line, index) => {
    ctx.fillText(line, 540, 440 + (index * 80));
  });
  
  // Subtitle
  ctx.fillStyle = '#4a4a4a';
  ctx.font = '42px Inter, sans-serif';
  const subtitleLines = wrapText(ctx, adData.subtitle, 720);
  subtitleLines.forEach((line, index) => {
    ctx.fillText(line, 540, 540 + (index * 50));
  });
  
  // CTA Button
  const buttonY = 640;
  drawButton(ctx, 540, buttonY, adData.ctaText, adData.accentColor);
}

function renderLeftAlignedLayout(ctx: CanvasRenderingContext2D, adData: AdData) {
  // Semi-transparent background for text
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.fillRect(80, 340, 640, 400);
  
  // Title
  ctx.fillStyle = '#1a1a1a';
  ctx.font = 'bold 64px Inter, sans-serif';
  ctx.textAlign = 'left';
  const titleLines = wrapText(ctx, adData.title, 560);
  titleLines.forEach((line, index) => {
    ctx.fillText(line, 120, 420 + (index * 70));
  });
  
  // Subtitle
  ctx.fillStyle = '#4a4a4a';
  ctx.font = '36px Inter, sans-serif';
  const subtitleLines = wrapText(ctx, adData.subtitle, 560);
  subtitleLines.forEach((line, index) => {
    ctx.fillText(line, 120, 520 + (index * 45));
  });
  
  // CTA Button
  const buttonY = 620;
  drawButton(ctx, 280, buttonY, adData.ctaText, adData.accentColor, 'left');
}

function renderBottomOverlayLayout(ctx: CanvasRenderingContext2D, adData: AdData) {
  // Bottom overlay background
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.fillRect(80, 680, 920, 320);
  
  // Title
  ctx.fillStyle = '#1a1a1a';
  ctx.font = 'bold 64px Inter, sans-serif';
  ctx.textAlign = 'left';
  const titleLines = wrapText(ctx, adData.title, 840);
  titleLines.forEach((line, index) => {
    ctx.fillText(line, 120, 750 + (index * 70));
  });
  
  // Subtitle
  ctx.fillStyle = '#4a4a4a';
  ctx.font = '36px Inter, sans-serif';
  const subtitleLines = wrapText(ctx, adData.subtitle, 840);
  subtitleLines.forEach((line, index) => {
    ctx.fillText(line, 120, 830 + (index * 45));
  });
  
  // CTA Button
  const buttonY = 920;
  drawButton(ctx, 280, buttonY, adData.ctaText, adData.accentColor, 'left');
}

function renderSplitScreenLayout(ctx: CanvasRenderingContext2D, adData: AdData) {
  // Left side background for text
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.fillRect(0, 0, 540, 1080);
  
  // Title
  ctx.fillStyle = '#1a1a1a';
  ctx.font = 'bold 56px Inter, sans-serif';
  ctx.textAlign = 'center';
  const titleLines = wrapText(ctx, adData.title, 460);
  titleLines.forEach((line, index) => {
    ctx.fillText(line, 270, 400 + (index * 65));
  });
  
  // Subtitle
  ctx.fillStyle = '#4a4a4a';
  ctx.font = '32px Inter, sans-serif';
  const subtitleLines = wrapText(ctx, adData.subtitle, 460);
  subtitleLines.forEach((line, index) => {
    ctx.fillText(line, 270, 520 + (index * 40));
  });
  
  // CTA Button
  const buttonY = 650;
  drawButton(ctx, 270, buttonY, adData.ctaText, adData.accentColor);
}

function drawButton(
  ctx: CanvasRenderingContext2D, 
  x: number, 
  y: number, 
  text: string, 
  color: string,
  align: 'center' | 'left' = 'center'
) {
  const buttonWidth = Math.max(200, text.length * 20 + 80);
  const buttonHeight = 60;
  const buttonX = align === 'center' ? x - buttonWidth / 2 : x;
  
  // Button background
  ctx.fillStyle = color;
  ctx.fillRect(buttonX, y - buttonHeight / 2, buttonWidth, buttonHeight);
  
  // Button text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(text, buttonX + buttonWidth / 2, y + 10);
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
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
}
