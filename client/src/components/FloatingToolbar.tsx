import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Type, Check } from 'lucide-react';
import { AdData } from '@/pages/AdGenerator';

interface FloatingToolbarProps {
  selectedElement: any;
  canvasRef: React.RefObject<any>;
  onElementUpdate: (updates: any) => void;
  onDone: () => void;
  adData: AdData;
  setAdData: (data: AdData) => void;
}

export default function FloatingToolbar({ 
  selectedElement, 
  canvasRef, 
  onElementUpdate, 
  onDone,
  adData,
  setAdData
}: FloatingToolbarProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [text, setText] = useState('');
  const [fontSize, setFontSize] = useState(16);
  const [color, setColor] = useState('#000000');
  const [isVisible, setIsVisible] = useState(false);

  // Update toolbar position and content when element is selected
  useEffect(() => {
    if (selectedElement && canvasRef.current) {
      const canvasElement = canvasRef.current;
      
      // Check if canvasElement is a proper DOM element with getBoundingClientRect method
      if (canvasElement && typeof canvasElement.getBoundingClientRect === 'function') {
        const canvasRect = canvasElement.getBoundingClientRect();
        
        // Position toolbar at fixed location above canvas
        setPosition({
          x: canvasRect.left + canvasRect.width / 2,
          y: canvasRect.top - 60
        });
      } else {
        // Fallback positioning if getBoundingClientRect is not available
        setPosition({
          x: 400,
          y: 100
        });
      }

      // Update form values based on selected element type
      if (selectedElement.type === 'title') {
        setText(adData.title);
        setColor(adData.primaryColor);
      } else if (selectedElement.type === 'subtitle') {
        setText(adData.subtitle);
        setColor(adData.primaryColor);
      } else if (selectedElement.type === 'cta') {
        setText(adData.ctaText);
        setColor('#ffffff');
      }

      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [selectedElement, adData]);

  const handleTextChange = (newText: string) => {
    setText(newText);
    if (selectedElement) {
      // Update adData based on element type
      updateAdData(newText, 'text');
      onElementUpdate({ text: newText });
    }
  };

  const updateAdData = (value: any, property: string) => {
    const newAdData = { ...adData };
    
    // Update based on selected element type
    if (selectedElement?.type === 'title') {
      if (property === 'text') newAdData.title = value;
      else if (property === 'color') newAdData.primaryColor = value;
    } else if (selectedElement?.type === 'subtitle') {
      if (property === 'text') newAdData.subtitle = value;
    } else if (selectedElement?.type === 'cta') {
      if (property === 'text') newAdData.ctaText = value;
      else if (property === 'color') newAdData.accentColor = value;
    }
    
    setAdData(newAdData);
  };

  const handleFontSizeChange = (newSize: number) => {
    setFontSize(newSize);
    if (selectedElement) {
      if (selectedElement.type === 'text') {
        selectedElement.set('fontSize', newSize);
      } else if (selectedElement.type === 'group') {
        const textElement = selectedElement.getObjects().find((obj: any) => obj.type === 'text');
        if (textElement) {
          textElement.set('fontSize', newSize);
        }
      }
      canvasRef.current?.renderAll();
      onElementUpdate({ fontSize: newSize });
    }
  };

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    if (selectedElement) {
      if (selectedElement.type === 'text') {
        selectedElement.set('fill', newColor);
      } else if (selectedElement.type === 'group') {
        const textElement = selectedElement.getObjects().find((obj: any) => obj.type === 'text');
        if (textElement) {
          textElement.set('fill', newColor);
        }
      }
      canvasRef.current?.renderAll();
      onElementUpdate({ color: newColor });
      
      // Update adData
      updateAdData(newColor, 'color');
    }
  };

  const handleDone = () => {
    onDone();
  };

  if (!isVisible || !selectedElement) return null;

  return (
    <div
      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[300px]"
      style={{
        left: Math.max(10, Math.min(position.x - 150, window.innerWidth - 320)),
        top: Math.max(10, position.y),
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Type className="w-4 h-4" />
        <span className="font-medium text-sm">Edit Element</span>
      </div>

      {(selectedElement.type === 'text' || selectedElement.type === 'group') && (
        <div className="space-y-3">
          <div>
            <Label htmlFor="toolbar-text" className="text-xs font-medium">
              Text
            </Label>
            <Input
              id="toolbar-text"
              value={text}
              onChange={(e) => handleTextChange(e.target.value)}
              className="h-8 text-sm"
              placeholder="Enter text..."
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="toolbar-size" className="text-xs font-medium">
                Size
              </Label>
              <Input
                id="toolbar-size"
                type="number"
                value={fontSize}
                onChange={(e) => handleFontSizeChange(parseInt(e.target.value) || 16)}
                className="h-8 text-sm"
                min="8"
                max="200"
              />
            </div>
            <div>
              <Label htmlFor="toolbar-color" className="text-xs font-medium">
                Color
              </Label>
              <div className="flex gap-1">
                <Input
                  id="toolbar-color"
                  type="color"
                  value={color}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="h-8 w-12 p-1 border rounded"
                />
                <Input
                  value={color}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="h-8 text-xs flex-1"
                  placeholder="#000000"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <Separator className="my-3" />

      <div className="flex justify-end">
        <Button
          onClick={handleDone}
          className="bg-green-600 hover:bg-green-700 text-white h-8 px-4"
          size="sm"
        >
          <Check className="w-3 h-3 mr-1" />
          Done
        </Button>
      </div>
    </div>
  );
}