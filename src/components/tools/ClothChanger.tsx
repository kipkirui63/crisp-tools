import { useState } from 'react';
import { Upload, Image, Wand2 } from 'lucide-react';

interface ClothChangerProps {
  isAuthenticated: boolean;
  onRequestAuth: () => void;
}

export default function ClothChanger({ isAuthenticated, onRequestAuth }: ClothChangerProps) {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [clothDescription, setClothDescription] = useState('');
  const [numImages, setNumImages] = useState(1);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map((file) => URL.createObjectURL(file));
      setUploadedImages(newImages);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center py-10 text-slate-100">
      <div className="w-full max-w-6xl flex bg-slate-800 rounded-2xl shadow-lg overflow-hidden border border-slate-700">
        
        {/* Left Section */}
        <div className="w-1/3 bg-slate-800 p-8 border-r border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-1">AI Clothes Changer</h2>
          <p className="text-sm text-slate-400 mb-8">
            Try on different clothes virtually using AI
          </p>

          {/* Upload Box */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Upload Images (Max 10)
            </label>
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-600 rounded-xl cursor-pointer hover:border-cyan-500 transition-all bg-slate-900/40">
              <Upload className="w-10 h-10 text-slate-400 mb-2" />
              <p className="text-slate-400 text-sm">
                Drag & drop your files or click to browse
              </p>
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

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={clothDescription}
              onChange={(e) => setClothDescription(e.target.value)}
              placeholder="e.g., 'Create a high-fashion editorial photoshoot with dramatic lighting...' "
              rows={4}
              className="w-full border border-slate-600 rounded-xl p-3 bg-slate-900/50 text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
            />
          </div>

          {/* Number of Images */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Number of Images
            </label>
            <select
              value={numImages}
              onChange={(e) => setNumImages(Number(e.target.value))}
              className="w-full border border-slate-600 rounded-xl p-3 bg-slate-900/50 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          {/* Generate Button */}
          <button
            disabled={!clothDescription || uploadedImages.length === 0}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Wand2 className="w-5 h-5" />
            Generate
          </button>
        </div>

        {/* Right Section */}
        <div className="flex-1 flex items-center justify-center p-10 bg-slate-900">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center">
              <Image className="w-12 h-12 text-cyan-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Your generated image will appear here
            </h3>
            <p className="text-slate-400 text-sm">
              Provide your inputs and click generate.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
