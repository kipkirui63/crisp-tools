import { useState } from 'react';
import { Upload, Image, Eraser, Wand2 } from 'lucide-react';

interface BackgroundRemoverProps {
  isVisitor?: boolean;
  onRequestAuth?: () => void;
}

export default function BackgroundRemover({ isVisitor = false, onRequestAuth }: BackgroundRemoverProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [replaceBackground, setReplaceBackground] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setUploadedImage(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Simulate background removal process
  const handleRemoveBackground = () => {
    if (!uploadedImage) return;
    setIsProcessing(true);
    setProcessedImage(null);

    // Simulate a 2s AI background removal delay
    setTimeout(() => {
      // In production, replace this with your AI API endpoint
      // For demo: show same image pretending background was removed
      setProcessedImage(uploadedImage);
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex justify-center py-10 text-slate-100">
      <div className="w-full max-w-6xl flex bg-slate-800 rounded-2xl shadow-lg overflow-hidden border border-slate-700">
        
        {/* LEFT PANEL */}
        <div className="w-96 bg-slate-800 p-8 border-r border-slate-700 overflow-y-auto">
          <h2 className="text-2xl font-bold text-white mb-1">AI Background Remover</h2>
          <p className="text-sm text-slate-400 mb-8">
            Instantly remove or replace backgrounds from your images using AI
          </p>

          {/* Upload Image */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Upload Your Image
            </label>
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-600 rounded-xl cursor-pointer hover:border-cyan-500 transition-all bg-slate-900/50">
              {uploadedImage ? (
                <img
                  src={uploadedImage}
                  alt="Uploaded"
                  className="max-h-full object-contain rounded-lg"
                />
              ) : (
                <div className="text-center">
                  <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">Drag & drop or click to browse</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
            <p className="text-xs text-slate-400 mt-2">
              Upload an image to remove its background instantly.
            </p>
          </div>

          {/* Replace Background Option */}
          <div className="flex items-center gap-3 mb-4">
            <input
              type="checkbox"
              id="replaceBackground"
              checked={replaceBackground}
              onChange={(e) => setReplaceBackground(e.target.checked)}
              className="w-5 h-5 rounded border-slate-600 bg-slate-900/50 text-cyan-500 focus:ring-2 focus:ring-cyan-500"
            />
            <label
              htmlFor="replaceBackground"
              className="text-sm font-medium text-slate-300 cursor-pointer"
            >
              Replace Background
            </label>
          </div>

          {replaceBackground && (
            <div className="mb-6">
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

          {/* Remove Background Button */}
          <button
            onClick={handleRemoveBackground}
            disabled={!uploadedImage || isProcessing}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-cyan-500/30"
          >
            {isProcessing ? (
              <span className="animate-pulse">Processing...</span>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                Remove Background
              </>
            )}
          </button>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 flex items-center justify-center p-10 bg-slate-900">
          {processedImage ? (
            <div className="max-w-md w-full flex flex-col items-center">
              <img
                src={processedImage}
                alt="Processed"
                className="w-full rounded-xl border border-slate-700 mb-4 object-contain"
                style={{ backgroundColor: replaceBackground ? backgroundColor : 'transparent' }}
              />
              <p className="text-slate-400 text-sm">
                Background {replaceBackground ? 'replaced' : 'removed'} successfully.
              </p>
            </div>
          ) : (
            <div className="text-center max-w-md">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center">
                <Eraser className="w-12 h-12 text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Your generated image will appear here
              </h3>
              <p className="text-slate-400 text-sm">
                Upload your image and click <span className="text-cyan-400 font-medium">Remove Background</span>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
