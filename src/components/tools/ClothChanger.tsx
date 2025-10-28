import { useState } from 'react';
import { Upload, Image, Wand2, Loader2, Download, AlertCircle, X, User, Shirt } from 'lucide-react';

interface ClothChangerProps {
  isAuthenticated: boolean;
  onRequestAuth: () => void;
}

export default function ClothChanger({ isAuthenticated, onRequestAuth }: ClothChangerProps) {
  const [personImage, setPersonImage] = useState<File | null>(null);
  const [personPreview, setPersonPreview] = useState<string>('');
  const [garmentImage, setGarmentImage] = useState<File | null>(null);
  const [garmentPreview, setGarmentPreview] = useState<string>('');
  const [garmentDescription, setGarmentDescription] = useState('');
  const [numImages, setNumImages] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handlePersonImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPersonImage(file);
      setPersonPreview(URL.createObjectURL(file));
    }
  };

  const handleGarmentImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGarmentImage(file);
      setGarmentPreview(URL.createObjectURL(file));
    }
  };

  const handleGenerate = async () => {
    if (!isAuthenticated) {
      onRequestAuth();
      return;
    }

    if (!personImage || !garmentImage) {
      setError('Please upload both person and garment images');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedImages([]);

    try {
      const token = localStorage.getItem('token');

      const modelsResponse = await fetch('/api/models', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!modelsResponse.ok) {
        throw new Error('Failed to load models');
      }

      const modelsData = await modelsResponse.json();

      const virtualTryOnModel = modelsData.models?.find((m: any) =>
        m.provider === 'Replicate' && (m.apiModel.includes('viton') || m.apiModel.includes('idm-vton'))
      );

      if (!virtualTryOnModel) {
        throw new Error('Virtual try-on model not available. Please configure REPLICATE_API_TOKEN in your environment.');
      }

      console.log('[ClothChanger] Using virtual try-on model:', virtualTryOnModel.name, virtualTryOnModel.apiModel);

      const results: string[] = [];

      for (let i = 0; i < numImages; i++) {
        const prompt = garmentDescription || `Virtual try-on: person wearing this garment. Professional fashion photography, high quality, photorealistic output, preserve face and body features.`;

        const formData = new FormData();
        formData.append('modelId', virtualTryOnModel.id);
        formData.append('toolType', 'virtual-tryon');
        formData.append('prompt', prompt);
        formData.append('options', JSON.stringify({
          numberOfImages: 1,
          width: 1024,
          height: 1024,
        }));

        formData.append('inputImage', personImage);
        formData.append('maskImage', garmentImage);

        console.log('[ClothChanger] Sending virtual try-on request...');

        const response = await fetch('/api/generationJobs', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to generate virtual try-on');
        }

        const data = await response.json();
        const imageUrl = data.images?.[0] || data.imageUrl;
        if (imageUrl) {
          results.push(imageUrl);
          setGeneratedImages([...results]);
        }
      }
    } catch (error: any) {
      console.error('Virtual try-on error:', error);
      setError(error.message || 'Failed to generate virtual try-on');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = async (url: string, index: number) => {
    try {
      if (url.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = url;
        link.download = `virtual-tryon-${index + 1}-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      const token = localStorage.getItem('token');
      const response = await fetch('/api/download-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ imageUrl: url }),
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = `virtual-tryon-${index + 1}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error('Download failed:', error);
      window.open(url, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center py-10 text-slate-100">
      <div className="w-full max-w-7xl px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-3">
            AI Virtual Try-On
          </h1>
          <p className="text-lg text-slate-300">
            Experience photorealistic virtual clothing try-on powered by IDM-VTON AI
          </p>
        </div>

        <div className="flex bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-700">
          <div className="w-1/3 bg-slate-800 p-8 border-r border-slate-700 space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-cyan-400" />
                Upload Person Image
              </label>
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-600 rounded-xl cursor-pointer hover:border-cyan-500 transition-all bg-slate-900/40 group">
                {personPreview ? (
                  <div className="relative w-full h-full">
                    <img
                      src={personPreview}
                      alt="Person"
                      className="w-full h-full object-cover rounded-xl"
                    />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setPersonImage(null);
                        setPersonPreview('');
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-500/90 hover:bg-red-600 rounded-lg transition-colors"
                      title="Remove image"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-slate-400 mb-2 group-hover:text-cyan-400 transition-colors" />
                    <p className="text-slate-400 text-sm text-center px-4 group-hover:text-cyan-300">
                      Click to upload or drag & drop
                    </p>
                    <p className="text-slate-500 text-xs mt-1">PNG, JPG, WebP (Max 10MB)</p>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePersonImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                <Shirt className="w-4 h-4 text-blue-400" />
                Upload Garment Image
              </label>
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-600 rounded-xl cursor-pointer hover:border-blue-500 transition-all bg-slate-900/40 group">
                {garmentPreview ? (
                  <div className="relative w-full h-full">
                    <img
                      src={garmentPreview}
                      alt="Garment"
                      className="w-full h-full object-cover rounded-xl"
                    />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setGarmentImage(null);
                        setGarmentPreview('');
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-500/90 hover:bg-red-600 rounded-lg transition-colors"
                      title="Remove image"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-slate-400 mb-2 group-hover:text-blue-400 transition-colors" />
                    <p className="text-slate-400 text-sm text-center px-4 group-hover:text-blue-300">
                      Click to upload or drag & drop
                    </p>
                    <p className="text-slate-500 text-xs mt-1">PNG, JPG, WebP (Max 10MB)</p>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleGarmentImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={garmentDescription}
                onChange={(e) => setGarmentDescription(e.target.value)}
                placeholder="e.g., 'Professional business suit', 'Casual summer dress'..."
                rows={3}
                className="w-full border border-slate-600 rounded-xl p-3 bg-slate-900/50 text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Number of Images
              </label>
              <select
                value={numImages}
                onChange={(e) => setNumImages(Number(e.target.value))}
                className="w-full border border-slate-600 rounded-xl p-3 bg-slate-900/50 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm flex items-start gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={!personImage || !garmentImage || isGenerating}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating... {generatedImages.length}/{numImages}
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  Generate Virtual Try-On
                </>
              )}
            </button>

            <div className="pt-4 border-t border-slate-700">
              <p className="text-xs text-slate-400 leading-relaxed">
                <strong className="text-slate-300">How it works:</strong> Upload a clear photo of a person and a garment image.
                Our AI will create a photorealistic virtual try-on showing the person wearing the garment while preserving
                their pose, face, and body features.
              </p>
            </div>
          </div>

          <div className="flex-1 p-10 bg-slate-900 overflow-y-auto max-h-[900px]">
            {generatedImages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center">
                    <Image className="w-12 h-12 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Your virtual try-on results will appear here
                  </h3>
                  <p className="text-slate-400 max-w-md mx-auto">
                    Upload a person image and garment image, then click generate to see photorealistic virtual try-on results
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                {generatedImages.map((url, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={url}
                      alt={`Virtual Try-On ${idx + 1}`}
                      className="w-full h-auto rounded-lg border border-slate-700 shadow-xl"
                    />
                    <button
                      onClick={() => downloadImage(url, idx)}
                      className="absolute top-2 right-2 p-2 bg-slate-800/90 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-700"
                      title="Download image"
                    >
                      <Download className="w-5 h-5 text-cyan-400" />
                    </button>
                  </div>
                ))}
                {isGenerating && generatedImages.length < numImages && (
                  <div className="flex items-center justify-center border-2 border-dashed border-slate-700 rounded-lg h-96 bg-slate-800/30">
                    <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
