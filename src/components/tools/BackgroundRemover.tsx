import { useState } from 'react';
import { Upload, Eraser, Wand2 } from 'lucide-react';

interface BackgroundRemoverProps {
  isVisitor?: boolean;
  onRequestAuth?: () => void;
}

export default function BackgroundRemover({ isVisitor = false, onRequestAuth }: BackgroundRemoverProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [replaceBackground, setReplaceBackground] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');

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
              Upload Image
            </label>
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-cyan-500 transition-all bg-slate-900/50">
              {uploadedImage ? (
                <img src={uploadedImage} alt="Upload" className="max-h-full object-contain" />
              ) : (
                <div className="text-center">
                  <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-400">Upload image</p>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="replaceBackground"
              checked={replaceBackground}
              onChange={(e) => setReplaceBackground(e.target.checked)}
              className="w-5 h-5 rounded border-slate-600 bg-slate-900/50 text-cyan-500 focus:ring-2 focus:ring-cyan-500"
            />
            <label htmlFor="replaceBackground" className="text-sm font-medium text-slate-300 cursor-pointer">
              Replace background
            </label>
          </div>

          {replaceBackground && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Background Color
              </label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-16 h-12 rounded-lg cursor-pointer bg-slate-900/50 border border-slate-600"
                />
                <input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="flex-1 px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                />
              </div>
            </div>
          )}

          <button
            onClick={() => isVisitor && onRequestAuth && onRequestAuth()}
            disabled={!uploadedImage}
            className="w-full py-4 px-6 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2"
          >
            <Wand2 className="w-5 h-5" />
            Remove Background
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto bg-slate-900">
        <div className="h-full flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center">
              <Eraser className="w-12 h-12 text-cyan-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Background Remover</h3>
            <p className="text-slate-400">
              Remove or replace image backgrounds with one click
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
