interface LayoutSelectorProps {
  selectedLayout: string;
  onLayoutSelect: (layout: string) => void;
}

export default function LayoutSelector({ selectedLayout, onLayoutSelect }: LayoutSelectorProps) {
  const layouts = [
    {
      id: "centered",
      name: "Centered",
      preview: (
        <div className="aspect-video bg-gradient-to-br from-blue-50 to-blue-100 rounded flex flex-col items-center justify-center space-y-1">
          <div className="w-16 h-2 bg-blue-300 rounded"></div>
          <div className="w-12 h-1.5 bg-blue-200 rounded"></div>
          <div className="w-8 h-1 bg-blue-400 rounded mt-2"></div>
        </div>
      )
    },
    {
      id: "left-aligned",
      name: "Left Aligned",
      preview: (
        <div className="aspect-video bg-gradient-to-br from-green-50 to-green-100 rounded flex flex-col items-start justify-center space-y-1 pl-3">
          <div className="w-16 h-2 bg-green-300 rounded"></div>
          <div className="w-12 h-1.5 bg-green-200 rounded"></div>
          <div className="w-8 h-1 bg-green-400 rounded mt-2"></div>
        </div>
      )
    },
    {
      id: "bottom-overlay",
      name: "Bottom Overlay",
      preview: (
        <div className="aspect-video bg-gradient-to-br from-purple-50 to-purple-100 rounded flex flex-col items-center justify-end space-y-1 pb-2">
          <div className="w-16 h-2 bg-purple-300 rounded"></div>
          <div className="w-12 h-1.5 bg-purple-200 rounded"></div>
          <div className="w-8 h-1 bg-purple-400 rounded mt-1"></div>
        </div>
      )
    },
    {
      id: "split-screen",
      name: "Split Screen",
      preview: (
        <div className="aspect-video bg-gradient-to-br from-orange-50 to-orange-100 rounded flex">
          <div className="w-1/2 flex flex-col items-center justify-center space-y-1">
            <div className="w-8 h-1.5 bg-orange-300 rounded"></div>
            <div className="w-6 h-1 bg-orange-200 rounded"></div>
            <div className="w-4 h-0.5 bg-orange-400 rounded mt-1"></div>
          </div>
          <div className="w-1/2 bg-orange-200 rounded-r"></div>
        </div>
      )
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {layouts.map((layout) => (
        <div
          key={layout.id}
          onClick={() => onLayoutSelect(layout.id)}
          className="group cursor-pointer"
        >
          <div className={`border-2 rounded-lg p-4 transition-all group-hover:shadow-md ${
            selectedLayout === layout.id
              ? 'border-google-blue bg-blue-50'
              : 'border-google-border bg-white hover:border-google-blue'
          }`}>
            {layout.preview}
            <p className={`text-xs font-medium mt-2 text-center ${
              selectedLayout === layout.id ? 'text-google-blue' : 'text-google-gray'
            }`}>
              {layout.name}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
