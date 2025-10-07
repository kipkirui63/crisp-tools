import { useState } from 'react';
import { Upload, Home, Wand2 } from 'lucide-react';

interface InteriorDesignProps {
  isVisitor?: boolean;
  onRequestAuth?: () => void;
}

export default function InteriorDesign({ isVisitor = false, onRequestAuth }: InteriorDesignProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [designStyle, setDesignStyle] = useState('modern');

  const styles = [
    { id: 'modern', name: 'Modern', desc: 'Clean lines and minimalism' },
    { id: 'luxury', name: 'Luxury', desc: 'Elegant and sophisticated' },
    { id: 'minimalist', name: 'Minimalist', desc: 'Simple and functional' },
    { id: 'rustic', name: 'Rustic', desc: 'Warm and natural' },
    { id: 'industrial', name: 'Industrial', desc: 'Urban and edgy' },
    { id: 'scandinavian', name: 'Scandinavian', desc: 'Light and cozy' },
  ];

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
              Upload Room Photo
            </label>
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-cyan-500 transition-all bg-slate-900/50">
              {uploadedImage ? (
                <img src={uploadedImage} alt="Room" className="max-h-full object-contain" />
              ) : (
                <div className="text-center">
                  <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-400">Upload room image</p>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Design Style
            </label>
            <div className="space-y-2">
              {styles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setDesignStyle(style.id)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    designStyle === style.id
                      ? 'border-cyan-500 bg-cyan-500/10'
                      : 'border-slate-600 bg-slate-900/50 hover:border-slate-500'
                  }`}
                >
                  <div className="font-semibold text-white">{style.name}</div>
                  <div className="text-sm text-slate-400">{style.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => isVisitor && onRequestAuth && onRequestAuth()}
            disabled={!uploadedImage}
            className="w-full py-4 px-6 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2"
          >
            <Wand2 className="w-5 h-5" />
            Redesign Room
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto bg-slate-900">
        <div className="h-full flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center">
              <Home className="w-12 h-12 text-cyan-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">AI Interior Design</h3>
            <p className="text-slate-400">
              Transform your rooms with AI-powered interior design
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
