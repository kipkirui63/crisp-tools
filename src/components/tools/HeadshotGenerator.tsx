import { useState } from 'react';
import { Upload, User, Wand2 } from 'lucide-react';

interface HeadshotGeneratorProps {
  isAuthenticated: boolean;
  onRequestAuth: () => void;
}

export default function HeadshotGenerator({ isAuthenticated, onRequestAuth }: HeadshotGeneratorProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [style, setStyle] = useState('professional');

  const styles = [
    { id: 'professional', name: 'Professional', desc: 'Corporate headshot' },
    { id: 'casual', name: 'Casual', desc: 'Relaxed and friendly' },
    { id: 'artistic', name: 'Artistic', desc: 'Creative portrait' },
    { id: 'linkedin', name: 'LinkedIn', desc: 'Perfect for profiles' },
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
              Upload Portrait
            </label>
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-cyan-500 transition-all bg-slate-900/50">
              {uploadedImage ? (
                <img src={uploadedImage} alt="Portrait" className="max-h-full object-contain" />
              ) : (
                <div className="text-center">
                  <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-400">Upload your photo</p>
                  <p className="text-slate-500 text-xs mt-1">Best with face-forward photos</p>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Headshot Style
            </label>
            <div className="space-y-2">
              {styles.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStyle(s.id)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    style === s.id
                      ? 'border-cyan-500 bg-cyan-500/10'
                      : 'border-slate-600 bg-slate-900/50 hover:border-slate-500'
                  }`}
                >
                  <div className="font-semibold text-white">{s.name}</div>
                  <div className="text-sm text-slate-400">{s.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => !isAuthenticated ? onRequestAuth() : null}
            disabled={!uploadedImage}
            className="w-full py-4 px-6 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2"
          >
            <Wand2 className="w-5 h-5" />
            Generate Headshot
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto bg-slate-900">
        <div className="h-full flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center">
              <User className="w-12 h-12 text-cyan-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">AI Headshot Generator</h3>
            <p className="text-slate-400">
              Transform your photos into professional headshots with AI
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
