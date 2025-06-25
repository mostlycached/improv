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
      const canvas = canvasRef.current;
      const canvasElement = canvas.getElement();
      const canvasRect = canvasElement.getBoundingClientRect();
      
      // Position toolbar near selected element
      const elementBounds = selectedElement.getBoundingRect();
      setPosition({
        x: canvasRect.left + elementBounds.left + elementBounds.width / 2,
        y: canvasRect.top + elementBounds.top - 60
      });

      // Update form values based on selected element
      if (selectedElement.type === 'text') {
        setText(selectedElement.text || '');
        setFontSize(selectedElement.fontSize || 16);
        setColor(selectedElement.fill || '#000000');
      } else if (selectedElement.type === 'group') {
        // Handle grouped elements
        const textElement = selectedElement.getObjects().find((obj: any) => obj.type === 'text');
        if (textElement) {
          setText(textElement.text || '');
          setFontSize(textElement.fontSize || 16);
          setColor(textElement.fill || '#000000');
        }
      }

      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [selectedElement, canvasRef]);

  const handleTextChange = (newText: string) => {
    setText(newText);
    if (selectedElement) {
      if (selectedElement.type === 'text') {
        selectedElement.set('text', newText);
      } else if (selectedElement.type === 'group') {
        const textElement = selectedElement.getObjects().find((obj: any) => obj.type === 'text');
        if (textElement) {
          textElement.set('text', newText);
        }
      }
      canvasRef.current?.renderAll();
      onElementUpdate({ text: newText });
      
      // Update adData based on element type
      updateAdData(newText, 'text');
    }
  };

  const updateAdData = (value: any, property: string) => {
    // Determine which field to update based on the selected element and current text
    const currentText = selectedElement?.text || (selectedElement?.type === 'group' ? 
      selectedElement.getObjects().find((obj: any) => obj.type === 'text')?.text : '');
    
    const newAdData = { ...adData };
    
    if (currentText === adData.title) {
      if (property === 'text') newAdData.title = value;
      else if (property === 'color') newAdData.primaryColor = value;
    } else if (currentText === adData.subtitle) {
      if (property === 'text') newAdData.subtitle = value;
    } else if (currentText === adData.ctaText) {
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