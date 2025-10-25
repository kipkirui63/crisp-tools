import { useState } from 'react';
import { Upload, Home, Wand2, X, ChevronDown, Sparkles } from 'lucide-react';

interface GeneratedImage {
  id: string;
  url: string;
  roomType: string;
  style: string;
}

interface InteriorDesignProps {
  isAuthenticated: boolean;
  onRequestAuth: () => void;
}

export default function AIInteriorDesign({ isAuthenticated, onRequestAuth }: InteriorDesignProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [roomType, setRoomType] = useState('Living Room');
  const [designStyle, setDesignStyle] = useState('Modern');
  const [customRequirements, setCustomRequirements] = useState('');
  const [selectedModel, setSelectedModel] = useState('Nano Banana (Gemini 2.5 Flash)');
  const [showModelModal, setShowModelModal] = useState(false);
  const [showRoomDropdown, setShowRoomDropdown] = useState(false);
  const [showStyleDropdown, setShowStyleDropdown] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const roomTypes = [
    'Living Room',
    'Bedroom',
    'Kitchen',
    'Bathroom',
    'Dining Room',
    'Home Office',
    'Kids Room',
    'Outdoor Space',
    'Hallway',
    'Basement',
    'Custom (Enter your own)'
  ];

  const designStyles = [
    'Modern',
    'Luxury',
    'Minimalist',
    'Rustic',
    'Industrial',
    'Scandinavian',
    'Bohemian',
    'Contemporary',
    'Traditional',
    'Mid-Century Modern'
  ];

  const aiModels = [
    {
      name: 'Nano Banana (Gemini 2.5 Flash)',
      category: 'Likeness Preservation',
      description: 'Maintains character likeness perfectly. Best when you provide seamlessly ideal for people & pets.',
      tags: ['Likeness', 'Blend', 'People'],
      recommended: true
    },
    {
      name: 'ByteDance Seedream V4',
      category: 'Unified Creation & Editing',
      description: "World's top-rated image editor. Excels at complex editing and reference consistency.",
      tags: ['Unified', 'Multi-Image', 'Transform']
    },
    {
      name: 'Flux Pro Kontext Max',
      category: 'Precision & Speed',
      description: 'Perfect for precise, localized edits. Handles text consistently, handles text beautifully.',
      tags: ['Fast', 'Precise', 'Text']
    },
    {
      name: 'ByteDance SeedEdit V3',
      category: 'Real Image Expert',
      description: 'Excels in accurately following editing instructions and effectively preserving image content, especially for real images.',
      tags: ['Realistic', 'Preserve', 'Accurate']
    },
    {
      name: 'Qwen Image Edit',
      category: 'Text Editing Master',
      description: 'Superior text editing capabilities. Excels at adding, modifying, or replacing text in images with high accuracy.',
      tags: ['Text', 'Edit', 'Accurate']
    },
    {
      name: 'Reve',
      category: 'Aesthetic & Text Rendering',
      description: 'Detailed visual output with strong aesthetic quality and accurate text rendering. Supports multi-image remix.',
      tags: ['Aesthetic', 'Text', 'Remix']
    }
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setUploadedImage(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!uploadedImage) {
      alert('Please upload a room photo first');
      return;
    }

    setIsGenerating(true);
    
    // Simulate image generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newImage: GeneratedImage = {
      id: Date.now().toString(),
      url: uploadedImage,
      roomType: roomType,
      style: designStyle
    };
    
    setGeneratedImages([newImage, ...generatedImages]);
    setIsGenerating(false);
  };

  return (
    <div className="h-full flex bg-slate-900">
      {/* Left Sidebar - Controls */}
      <div className="w-96 bg-slate-800 border-r border-slate-700 p-6 overflow-y-auto">
        <div className="space-y-6">
          {/* Upload Section */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Upload Room Photo
            </label>
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-cyan-500 transition-all bg-slate-900/50">
              {uploadedImage ? (
                <img src={uploadedImage} alt="Room" className="max-h-full rounded-lg object-contain" />
              ) : (
                <div className="text-center p-4">
                  <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-400">Drag & drop your files or</p>
                  <p className="text-cyan-400 font-medium">click to browse</p>
                  <p className="text-xs text-slate-500 mt-1">Select a file</p>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>

          {/* Room Type */}
          <div className="relative">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Room Type
            </label>
            <button
              onClick={() => {
                setShowRoomDropdown(!showRoomDropdown);
                setShowStyleDropdown(false);
              }}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-left flex items-center justify-between hover:border-slate-500 transition-all text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <span>{roomType}</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
            {showRoomDropdown && (
              <div className="absolute z-10 w-full mt-2 bg-slate-800 border border-slate-600 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                {roomTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setRoomType(type);
                      setShowRoomDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-slate-700 transition-colors text-white"
                  >
                    {type === roomType && <span className="mr-2 text-cyan-400">✓</span>}
                    {type}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Design Style */}
          <div className="relative">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Design Style
            </label>
            <button
              onClick={() => {
                setShowStyleDropdown(!showStyleDropdown);
                setShowRoomDropdown(false);
              }}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-left flex items-center justify-between hover:border-slate-500 transition-all text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <span>{designStyle}</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
            {showStyleDropdown && (
              <div className="absolute z-10 w-full mt-2 bg-slate-800 border border-slate-600 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                {designStyles.map((style) => (
                  <button
                    key={style}
                    onClick={() => {
                      setDesignStyle(style);
                      setShowStyleDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-slate-700 transition-colors text-white"
                  >
                    {style === designStyle && <span className="mr-2 text-cyan-400">✓</span>}
                    {style}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Custom Requirements */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Custom Requirements (Optional)
            </label>
            <textarea
              value={customRequirements}
              onChange={(e) => setCustomRequirements(e.target.value)}
              placeholder="Add specific design requirements like color preferences, furniture styles, lighting preferences, etc."
              rows={4}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
            />
          </div>

          {/* AI Model Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              AI Model
            </label>
            <button
              onClick={() => setShowModelModal(true)}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-left flex items-center justify-between hover:border-slate-500 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="text-white text-sm">{selectedModel}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* Advanced Settings */}
          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-slate-300 flex items-center gap-2 hover:text-white transition-colors">
              <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
              Advanced Settings
            </summary>
          </details>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!uploadedImage || isGenerating}
            className="w-full py-4 px-6 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2"
          >
            <Wand2 className="w-5 h-5" />
            {isGenerating ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </div>

      {/* Right Side - Results */}
      <div className="flex-1 p-6 overflow-y-auto bg-slate-900">
        {generatedImages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center">
                <Home className="w-12 h-12 text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No images to display</h3>
              <p className="text-slate-400">Your generated images will appear here</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {generatedImages.map((image) => (
              <div
                key={image.id}
                className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl overflow-hidden hover:border-cyan-500 transition-all"
              >
                <div className="aspect-[4/3] relative overflow-hidden">
                  <img
                    src={image.url}
                    alt={`${image.roomType} - ${image.style}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>
                </div>
                <div className="p-4">
                  <p className="text-sm font-semibold text-white">{image.roomType}</p>
                  <p className="text-xs text-slate-400">{image.style} Style</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Model Selection Modal */}
      {showModelModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Select AI Model for Image Editing</h2>
                <p className="text-sm text-slate-400 mt-1">Choose an AI model for editing your images</p>
              </div>
              <button
                onClick={() => setShowModelModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-6">
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-white mb-1">ProTip!</p>
                    <p className="text-sm text-slate-300">
                      Different models excel at different tasks. Try multiple models and compare their results to find the best one for your specific use case. What works great for one image might not be ideal for another.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiModels.map((model) => (
                  <button
                    key={model.name}
                    onClick={() => {
                      setSelectedModel(model.name);
                      setShowModelModal(false);
                    }}
                    className={`p-5 rounded-xl border-2 text-left transition-all hover:shadow-lg ${
                      selectedModel === model.name
                        ? 'border-cyan-500 bg-cyan-500/10'
                        : 'border-slate-600 bg-slate-900/50 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <Sparkles className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                        selectedModel === model.name ? 'text-cyan-400' : 'text-slate-500'
                      }`} />
                      <div className="flex-1">
                        <h3 className="font-bold text-white mb-1">{model.name}</h3>
                        <p className="text-xs font-medium text-slate-400 mb-2">{model.category}</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-300 mb-3 leading-relaxed">{model.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {model.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-slate-700 text-slate-300 text-xs font-medium rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}