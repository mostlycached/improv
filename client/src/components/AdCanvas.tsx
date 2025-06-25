import { useEffect, useRef } from "react";
import type { AdData } from "@/pages/AdGenerator";
import { renderAd } from "@/lib/adRenderer";

interface AdCanvasProps {
  adData: AdData;
}

export default function AdCanvas({ adData }: AdCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      renderAd(canvasRef.current, adData);
    }
  }, [adData]);

  useEffect(() => {
    const handleExport = () => {
      if (canvasRef.current) {
        const link = document.createElement('a');
        link.download = 'ad-generated.png';
        link.href = canvasRef.current.toDataURL();
        link.click();
      }
    };

    window.addEventListener('export-ad', handleExport);
    return () => window.removeEventListener('export-ad', handleExport);
  }, []);

  return (
    <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full aspect-square overflow-hidden">
      <canvas
        ref={canvasRef}
        width={1080}
        height={1080}
        className="w-full h-full object-contain"
      />
    </div>
  );
}
