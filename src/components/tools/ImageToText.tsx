import { useState } from 'react';
import { Upload,  Copy, Check, FileText } from 'lucide-react';

export default function AIImageToText() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [useAdvancedModel, setUseAdvancedModel] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setUploadedImage(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleExtractText = async () => {
    if (!uploadedImage) {
      alert('Please upload an image first');
      return;
    }

    setIsExtracting(true);
    
    // Simulate text extraction
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const sampleText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.

This is extracted text from your image. In a real implementation, this would use OCR technology to recognize and extract actual text from the uploaded image.

${additionalContext ? `\nAdditional Context Applied: ${additionalContext}` : ''}
${useAdvancedModel ? '\n[Using Advanced AI Model for better accuracy]' : ''}`;
    
    setExtractedText(sampleText);
    setIsExtracting(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex bg-slate-900">
      {/* Left Sidebar - Controls */}
      <div className="w-96 bg-slate-800 border-r border-slate-700 p-6 overflow-y-auto">
        <div className="space-y-6">
          {/* Upload Section */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Upload Image
            </label>
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-cyan-500 transition-all bg-slate-900/50">
              {uploadedImage ? (
                <img src={uploadedImage} alt="Upload" className="max-h-full object-contain rounded-lg" />
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

          {/* Additional Context */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Additional Context (Optional)
            </label>
            <textarea
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              placeholder="Specify any requirements for the text extraction (e.g., 'focus on handwritten text' or 'extract table data')"
              rows={4}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none text-sm"
            />
          </div>

          {/* Advanced Model Toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-600">
            <div className="flex items-center gap-2">
              <span className="text-lg">✨</span>
              <div>
                <p className="text-sm font-semibold text-white">Use advanced AI model?</p>
                <p className="text-xs text-blue-400">Best Results <span className="text-slate-500">for better accuracy</span></p>
              </div>
            </div>
            <button
              onClick={() => setUseAdvancedModel(!useAdvancedModel)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                useAdvancedModel ? 'bg-cyan-500' : 'bg-slate-600'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  useAdvancedModel ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Extract Button */}
          <button
            onClick={handleExtractText}
            disabled={!uploadedImage || isExtracting}
            className="w-full py-4 px-6 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2"
          >
            <FileText className="w-5 h-5" />
            {isExtracting ? 'Extracting...' : 'Extract Text'}
          </button>
        </div>
      </div>

      {/* Right Side - Results */}
      <div className="flex-1 p-6 overflow-y-auto">
        {extractedText ? (
          <div className="max-w-4xl mx-auto">
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Extracted Text</h3>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium text-white transition-all shadow-lg"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Text
                    </>
                  )}
                </button>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-700">
                <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {extractedText}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center">
                <FileText className="w-12 h-12 text-cyan-400" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">Upload an image to see extracted text here.</h3>
              <p className="text-slate-400 text-lg">
                Extract text from images using advanced AI + OCR
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}