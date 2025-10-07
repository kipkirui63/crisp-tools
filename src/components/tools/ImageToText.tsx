import { useState } from 'react';
import { Upload, Type, Copy, Check } from 'lucide-react';

interface ImageToTextProps {
  isVisitor?: boolean;
  onRequestAuth?: () => void;
}

export default function ImageToText({ isVisitor = false, onRequestAuth }: ImageToTextProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<'caption' | 'ocr'>('caption');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setUploadedImage(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Extraction Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setMode('caption')}
                className={`py-3 px-4 rounded-lg border-2 text-sm font-medium transition-all ${
                  mode === 'caption'
                    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                    : 'border-slate-600 bg-slate-900/50 text-slate-300 hover:border-slate-500'
                }`}
              >
                Caption
              </button>
              <button
                onClick={() => setMode('ocr')}
                className={`py-3 px-4 rounded-lg border-2 text-sm font-medium transition-all ${
                  mode === 'ocr'
                    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                    : 'border-slate-600 bg-slate-900/50 text-slate-300 hover:border-slate-500'
                }`}
              >
                OCR Text
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {mode === 'caption'
                ? 'Generate a description of the image'
                : 'Extract text from the image'}
            </p>
          </div>

          <button
            onClick={() => isVisitor && onRequestAuth && onRequestAuth()}
            disabled={!uploadedImage}
            className="w-full py-4 px-6 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2"
          >
            <Type className="w-5 h-5" />
            Extract {mode === 'caption' ? 'Caption' : 'Text'}
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto bg-slate-900">
        {extractedText ? (
          <div className="max-w-3xl mx-auto">
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  {mode === 'caption' ? 'Image Caption' : 'Extracted Text'}
                </h3>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-white transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                {extractedText}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center">
                <Type className="w-12 h-12 text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Image to Text</h3>
              <p className="text-slate-400">
                Extract text from images or generate captions with AI
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
