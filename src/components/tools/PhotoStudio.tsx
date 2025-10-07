import { useState } from 'react';
import { Upload, Camera, Wand2 } from 'lucide-react';

interface PhotoStudioProps {
  isVisitor?: boolean;
  onRequestAuth?: () => void;
}

export default function PhotoStudio({ isVisitor = false, onRequestAuth }: PhotoStudioProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [lighting, setLighting] = useState('studio');
  const [background, setBackground] = useState('white');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setUploadedImage(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="h-full flex">
      <div className="w-96 bg-slate-800 border-r border-slate-700 p-6 overflow-y-auto">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Upload Photo
            </label>
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-cyan-500 transition-all bg-slate-900/50">
              {uploadedImage ? (
                <img src={uploadedImage} alt="Photo" className="max-h-full object-contain" />
              ) : (
                <div className="text-center">
                  <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-400">Upload image</p>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Lighting Style
            </label>
            <select
              value={lighting}
              onChange={(e) => setLighting(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="studio">Studio Lighting</option>
              <option value="natural">Natural Light</option>
              <option value="dramatic">Dramatic</option>
              <option value="soft">Soft Light</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Background
            </label>
            <select
              value={background}
              onChange={(e) => setBackground(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="white">White</option>
              <option value="black">Black</option>
              <option value="gradient">Gradient</option>
              <option value="custom">Custom Color</option>
            </select>
          </div>

          <button
            onClick={() => isVisitor && onRequestAuth && onRequestAuth()}
            disabled={!uploadedImage}
            className="w-full py-4 px-6 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2"
          >
            <Wand2 className="w-5 h-5" />
            Apply Studio Effects
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto bg-slate-900">
        <div className="h-full flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center">
              <Camera className="w-12 h-12 text-cyan-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Virtual Photo Studio</h3>
            <p className="text-slate-400">
              Adjust lighting, backgrounds, and effects like a professional studio
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
