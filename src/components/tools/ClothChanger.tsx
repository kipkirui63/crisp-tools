import { useState } from 'react';
import { Upload, Image, Wand2, Loader2, Download, AlertCircle, X } from 'lucide-react';

interface ClothChangerProps {
  isAuthenticated: boolean;
  onRequestAuth: () => void;
}

export default function ClothChanger({ isAuthenticated, onRequestAuth }: ClothChangerProps) {
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [uploadedPreviews, setUploadedPreviews] = useState<string[]>([]);
  const [clothDescription, setClothDescription] = useState('');
  const [numImages, setNumImages] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const filesArray = Array.from(files);
      setUploadedImages(filesArray);
      const previews = filesArray.map((file) => URL.createObjectURL(file));
      setUploadedPreviews(previews);
    }
  };

  const handleGenerate = async () => {
    if (!isAuthenticated) {
      onRequestAuth();
      return;
    }

    if (!clothDescription || uploadedImages.length === 0) {
      setError('Please upload images and provide a description');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedImages([]);

    try {
      const token = localStorage.getItem('token');

      // Get first available model
      const modelsResponse = await fetch('/api/models', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!modelsResponse.ok) {
        throw new Error('Failed to load models');
      }

      const modelsData = await modelsResponse.json();
      const firstModel = modelsData.models?.[0];

      if (!firstModel) {
        throw new Error('No models available');
      }

      const results: string[] = [];

      for (let i = 0; i < numImages; i++) {
        const prompt = `Apply virtual clothing transformation to this image: ${clothDescription}. Maintain person's body proportions, skin tone, and facial features. Professional fashion photography, high quality, realistic clothing simulation, photorealistic output.`;

        const formData = new FormData();
        formData.append('modelId', firstModel.id);
        formData.append('toolType', 'cloth-changer');
        formData.append('prompt', prompt);
        formData.append('options', JSON.stringify({
          numberOfImages: 1,
          width: 1024,
          height: 1024,
        }));
        formData.append('strength', '0.7');

        if (uploadedImages.length > 0) {
          formData.append('inputImage', uploadedImages[0]);
        }

        const response = await fetch('/api/generationJobs', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to generate image');
        }

        const data = await response.json();
        const imageUrl = data.images?.[0] || data.imageUrl;
        if (imageUrl) {
          results.push(imageUrl);
          setGeneratedImages([...results]);
        }
      }
    } catch (error: any) {
      console.error('Cloth changer error:', error);
      setError(error.message || 'Failed to generate images');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = async (url: string, index: number) => {
    try {
      if (url.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = url;
        link.download = `cloth-change-${index + 1}-${Date.now()}.png`;
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
      link.download = `cloth-change-${index + 1}-${Date.now()}.png`;
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

            {uploadedPreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-2">
                {uploadedPreviews.map((src, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={src}
                      alt={`Upload ${i}`}
                      className="rounded-lg object-cover w-full h-24 border border-slate-700"
                    />
                    <button
                      onClick={() => {
                        setUploadedImages(uploadedImages.filter((_, idx) => idx !== i));
                        setUploadedPreviews(uploadedPreviews.filter((_, idx) => idx !== i));
                      }}
                      className="absolute top-1 right-1 p-1 bg-red-500/90 hover:bg-red-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove image"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
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

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!clothDescription || uploadedImages.length === 0 || isGenerating}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating... {generatedImages.length}/{numImages}
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                Generate
              </>
            )}
          </button>
        </div>

        {/* Right Section */}
        <div className="flex-1 p-10 bg-slate-900 overflow-y-auto">
          {generatedImages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center">
                  <Image className="w-12 h-12 text-cyan-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Your transformed images will appear here
                </h3>
                <p className="text-slate-400">
                  Upload images and describe the clothing you want to try on
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              {generatedImages.map((url, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={url}
                    alt={`Generated ${idx + 1}`}
                    className="w-full h-auto rounded-lg border border-slate-700"
                  />
                  <button
                    onClick={() => downloadImage(url, idx)}
                    className="absolute top-2 right-2 p-2 bg-slate-800/90 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-700"
                  >
                    <Download className="w-5 h-5 text-cyan-400" />
                  </button>
                </div>
              ))}
              {isGenerating && generatedImages.length < numImages && (
                <div className="flex items-center justify-center border-2 border-dashed border-slate-700 rounded-lg h-64">
                  <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
