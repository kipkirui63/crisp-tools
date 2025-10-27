import { useState } from 'react';
import { Upload, User, Wand2, Loader2, Download, X, AlertCircle } from 'lucide-react';

interface HeadshotGeneratorProps {
  isAuthenticated: boolean;
  onRequestAuth: () => void;
}

export default function HeadshotGenerator({ isAuthenticated, onRequestAuth }: HeadshotGeneratorProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [style, setStyle] = useState('professional');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedHeadshot, setGeneratedHeadshot] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const styles = [
    { id: 'professional', name: 'Professional', desc: 'Corporate headshot' },
    { id: 'casual', name: 'Casual', desc: 'Relaxed and friendly' },
    { id: 'artistic', name: 'Artistic', desc: 'Creative portrait' },
    { id: 'linkedin', name: 'LinkedIn', desc: 'Perfect for profiles' },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setUploadedImage(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!isAuthenticated) {
      onRequestAuth();
      return;
    }

    if (!uploadedFile) {
      setError('Please upload a photo first');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedHeadshot(null);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();

      const styleDescriptions = {
        professional: 'professional corporate headshot, business attire, studio lighting, neutral background',
        casual: 'casual friendly portrait, natural lighting, soft focus, approachable',
        artistic: 'artistic creative portrait, dramatic lighting, unique composition, expressive',
        linkedin: 'professional LinkedIn profile photo, business casual, clean background, confident'
      };

      const prompt = `Transform this portrait into a high-quality ${styleDescriptions[style as keyof typeof styleDescriptions]}, professional photography, sharp focus, 8k resolution, maintain person's likeness and features`;

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

      const response = await fetch('/api/generationJobs', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          modelId: firstModel.id, // UUID string
          toolType: 'headshot-generator',
          prompt,
          options: {
            numberOfImages: 1,
            width: 1024,
            height: 1024,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate headshot');
      }

      const data = await response.json();
      const imageUrl = data.images?.[0] || data.imageUrl;
      if (!imageUrl) {
        throw new Error('No image URL in response');
      }
      setGeneratedHeadshot(imageUrl);
    } catch (error: any) {
      console.error('Headshot generation error:', error);
      setError(error.message || 'Failed to generate headshot');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadHeadshot = async () => {
    if (generatedHeadshot) {
      try {
        const response = await fetch(generatedHeadshot);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `professional-headshot-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Download failed:', error);
        const link = document.createElement('a');
        link.href = generatedHeadshot;
        link.download = `professional-headshot-${Date.now()}.png`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
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
            <div className="relative">
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
              {uploadedImage && !isGenerating && (
                <button
                  onClick={() => {
                    setUploadedImage(null);
                    setUploadedFile(null);
                    setGeneratedHeadshot(null);
                    setError(null);
                  }}
                  className="absolute top-2 right-2 p-2 bg-red-500/90 hover:bg-red-600 rounded-lg transition-colors"
                  title="Remove image"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              )}
            </div>
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

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={!uploadedImage || isGenerating}
            className="w-full py-4 px-6 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                Generate Headshot
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto bg-slate-900">
        <div className="h-full flex items-center justify-center">
          {!generatedHeadshot ? (
            <div className="text-center max-w-md">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">AI Headshot Generator</h3>
              <p className="text-slate-400">
                Transform your photos into professional headshots with AI
              </p>
            </div>
          ) : (
            <div className="max-w-2xl w-full">
              <div className="relative group">
                <img
                  src={generatedHeadshot}
                  alt="Generated Headshot"
                  className="w-full h-auto rounded-lg border border-slate-700"
                />
                <button
                  onClick={downloadHeadshot}
                  className="absolute top-4 right-4 p-3 bg-slate-800/90 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-700"
                >
                  <Download className="w-6 h-6 text-cyan-400" />
                </button>
              </div>
              <div className="mt-4 text-center">
                <button
                  onClick={() => setGeneratedHeadshot(null)}
                  className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                >
                  Generate Another
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
