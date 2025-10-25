import { useState } from 'react';
import { Upload, Palette, Wand2, X } from 'lucide-react';

interface ModelOption {
  id: string;
  name: string;
  desc: string;
  details: string;
  image: string;
}

export default function LogoGenerator() {
  const [logoDescription, setLogoDescription] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<ModelOption | null>(null);
  const [showModelModal, setShowModelModal] = useState(false);
  const [logoStyle, setLogoStyle] = useState('Any Style');
  const [numDesigns, setNumDesigns] = useState(4);

  const models: ModelOption[] = [
    {
      id: 'nano-banana',
      name: 'Nano-Banana',
      desc: "Google’s state-of-the-art image model 🍌 (Gemini 2.5 Flash)",
      details: "Best for photo-realistic or branded logo design.",
      image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&q=60',
    },
    {
      id: 'ideogram',
      name: 'Ideogram [v3]',
      desc: 'Stunning realism, text rendering, and consistent styles',
      details: 'Ideal for typography and artistic compositions.',
      image: 'https://images.unsplash.com/photo-1504208434309-cb69f4fe52b0?w=400&q=60',
    },
    {
      id: 'gpt-image-1',
      name: 'GPT Image 1',
      desc: "OpenAI’s state-of-the-art image generation model",
      details: "Balanced and reliable for creative and brand visuals.",
      image: 'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?w=400&q=60',
    },
    {
      id: 'seedream-v4',
      name: 'Seedream V4',
      desc: 'Record-breaking 4K resolution model by ByteDance',
      details: 'Perfect for crisp, high-detail, production-quality designs.',
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&q=60',
    },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map((file) => URL.createObjectURL(file));
      setUploadedImages(newImages);
    }
  };

  const handleModelSelect = (model: ModelOption) => {
    setSelectedModel(model);
    setShowModelModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex justify-center py-10 text-slate-100">
      <div className="w-full max-w-6xl flex bg-slate-800 rounded-2xl shadow-lg overflow-hidden border border-slate-700">
        {/* LEFT PANEL */}
        <div className="w-96 bg-slate-800 p-8 border-r border-slate-700 overflow-y-auto">
          <h2 className="text-2xl font-bold text-white mb-1">AI Logo Generator</h2>
          <p className="text-sm text-slate-400 mb-8">
            Create professional, unique logo designs with AI
          </p>

          {/* Logo Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Logo Description <span className="text-cyan-400">*</span>
            </label>
            <textarea
              value={logoDescription}
              onChange={(e) => setLogoDescription(e.target.value.slice(0, 1000))}
              placeholder="Describe your desired logo design..."
              rows={4}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
            />
            <div className="text-right text-xs text-slate-400 mt-1">
              {logoDescription.length}/1000
            </div>
          </div>

          {/* Upload Box */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Upload Images (Optional)
            </label>
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-600 rounded-xl cursor-pointer hover:border-cyan-500 transition-all bg-slate-900/40">
              <Upload className="w-10 h-10 text-slate-400 mb-2" />
              <p className="text-slate-400 text-sm">Drag & drop or click to browse</p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>

            {uploadedImages.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-2">
                {uploadedImages.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt={`Upload ${i}`}
                    className="rounded-lg object-cover w-full h-24 border border-slate-700"
                  />
                ))}
              </div>
            )}
          </div>

          {/* AI Model Selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              AI Model
            </label>
            <button
              onClick={() => setShowModelModal(true)}
              className="w-full border border-slate-600 rounded-lg p-3 bg-slate-900/50 text-slate-100 text-sm flex justify-between items-center hover:border-cyan-500 focus:ring-2 focus:ring-cyan-500"
            >
              {selectedModel ? selectedModel.name : 'Select Model'}
              <Palette className="w-5 h-5 text-cyan-400" />
            </button>
          </div>

          {/* Logo Style */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">Logo Style</label>
            <select
              value={logoStyle}
              onChange={(e) => setLogoStyle(e.target.value)}
              className="w-full border border-slate-600 rounded-lg p-3 bg-slate-900/50 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option>Any Style</option>
              <option>Minimalist</option>
              <option>Vintage</option>
              <option>Modern</option>
              <option>Playful</option>
              <option>Elegant</option>
              <option>Bold</option>
            </select>
          </div>

          {/* Number of Designs */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Number of Designs
            </label>
            <select
              value={numDesigns}
              onChange={(e) => setNumDesigns(Number(e.target.value))}
              className="w-full border border-slate-600 rounded-lg p-3 bg-slate-900/50 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          {/* Generate Button */}
          <button
            disabled={!logoDescription.trim()}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Wand2 className="w-5 h-5" />
            Generate
          </button>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 flex items-center justify-center p-10 bg-slate-900">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center">
              <Palette className="w-12 h-12 text-cyan-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Your generated logos will appear here
            </h3>
            <p className="text-slate-400 text-sm">
              Provide your inputs and click generate.
            </p>
          </div>
        </div>
      </div>

      {/* MODEL MODAL */}
      {showModelModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-6">
          <div className="bg-slate-800 rounded-2xl max-w-4xl w-full p-8 relative border border-slate-700">
            <button
              onClick={() => setShowModelModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-semibold text-white mb-2">Select AI Model</h3>
            <p className="text-sm text-slate-400 mb-6">
              Choose an AI model for generating your images. 
              <span className="text-cyan-400 font-medium"> ProTip:</span> Different models excel at different tasks — experiment to see which fits best.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {models.map((m) => (
                <div
                  key={m.id}
                  onClick={() => handleModelSelect(m)}
                  className={`rounded-xl border-2 cursor-pointer transition-all ${
                    selectedModel?.id === m.id
                      ? 'border-cyan-500 bg-slate-700/50'
                      : 'border-slate-700 hover:border-cyan-500 hover:bg-slate-700/40'
                  }`}
                >
                  <img
                    src={m.image}
                    alt={m.name}
                    className="w-full h-32 object-cover rounded-t-lg"
                  />
                  <div className="p-4">
                    <h4 className="text-white font-semibold text-sm">{m.name}</h4>
                    <p className="text-xs text-slate-400 mt-1">{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
