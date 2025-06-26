import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface LayoutSelectorProps {
  selectedLayout: string;
  onLayoutSelect: (layout: string) => void;
}

export default function LayoutSelector({ selectedLayout, onLayoutSelect }: LayoutSelectorProps) {
  const layouts = [
    { id: "centered", name: "Centered", description: "Title and text centered in the middle" },
    { id: "left-aligned", name: "Left Aligned", description: "Content aligned to the left side" },
    { id: "bottom-overlay", name: "Bottom Overlay", description: "Text overlaid at the bottom" },
    { id: "split-screen", name: "Split Screen", description: "Content split between left and right" }
  ];

  const currentLayout = layouts.find(layout => layout.id === selectedLayout);

  return (
    <div>
      <Label className="text-google-gray mb-2 block">Layout</Label>
      <Select value={selectedLayout} onValueChange={onLayoutSelect}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select layout">
            {currentLayout?.name}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {layouts.map((layout) => (
            <SelectItem key={layout.id} value={layout.id}>
              <div className="flex flex-col">
                <span className="font-medium">{layout.name}</span>
                <span className="text-xs text-gray-500">{layout.description}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
