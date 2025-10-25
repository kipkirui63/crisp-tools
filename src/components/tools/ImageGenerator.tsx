import { useState } from 'react';
import { Sparkles, Download, Wand2, AlertCircle, Upload, Image as ImageIcon, Lightbulb } from 'lucide-react';
import ModelSelector from '../ModelSelector';
import { AIModel, generations } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

interface ImageGeneratorProps {
  isVisitor?: boolean;
  onRequestAuth?: () => void;
}

export default function ImageGenerator({ isVisitor = false, onRequestAuth }: ImageGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [numberOfImages, setNumberOfImages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [generateFromImage, setGenerateFromImage] = useState(false);
  const [makeBetter, setMakeBetter] = useState(false);
  const [attachedImages, setAttachedImages] = useState<File[]>([]);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [outputFormat, setOutputFormat] = useState('JPEG');

  const { user, refreshProfile } = useAuth();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    setAttachedImages(prev => [...prev, ...imageFiles].slice(0, 10));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    setAttachedImages(prev => [...prev, ...imageFiles].slice(0, 10));
  };

  const removeAttachedImage = (index: number) => {
    setAttachedImages(prev => prev.filter((_, i) => i !== index));
  };

  const tryExample = () => {
    const examples = [
      "A serene mountain landscape at sunset with vibrant orange and purple skies reflecting on a calm lake",
      "A futuristic city with flying cars and neon lights, cyberpunk aesthetic, highly detailed",
      "A cozy coffee shop interior with warm lighting, plants, and people working on laptops",
      "An abstract painting with bold colors and geometric shapes, modern art style",
      "A majestic dragon flying over ancient ruins, fantasy art, epic composition"
    ];
    const randomExample = examples[Math.floor(Math.random() * examples.length)];
    setPrompt(randomExample);
  };

  const handleGenerate = async () => {
    if (isVisitor && onRequestAuth) {
      onRequestAuth();
      return;
    }

    if (!prompt.trim() || !selectedModel || !user) {
      setError('Please select a model and enter a prompt');
      return;
    }

    const totalCost = selectedModel.costPerUse * numberOfImages;
    if (user.credits < totalCost) {
      setError(`Insufficient credits. You have ${user.credits} credits but need ${totalCost}`);
      return;
    }

    setGenerating(true);
    setError(null);
    setSuccess(false);

    try {
      console.log('Generating with model:', selectedModel.name);
      console.log('Prompt:', prompt);
      console.log('Number of images:', numberOfImages);

      const { data, error: apiError } = await generations.create(
        selectedModel.id,
        'generator',
        prompt,
        { 
          numberOfImages,
          aspectRatio,
          outputFormat
        }
      );

      if (apiError) {
        setError(apiError);
        return;
      }

      if (data?.images && data.images.length > 0) {
        setGeneratedImages(data.images);
        setSuccess(true);
        setPrompt('');
        await refreshProfile();
        
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError('No images were generated. Please try again.');
      }
    } catch (err: any) {
      console.error('Generation error:', err);
      setError(err.message || 'Failed to generate images. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (url: string, index: number) => {
    try {
      if (url.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = url;
        link.download = `generated-image-${index + 1}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `generated-image-${index + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Download error:', err);
      setError('Failed to download image');
    }
  };

  return (
    <div className="h-full flex">
      <div className="w-96 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 p-6 overflow-y-auto">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Image Description <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the image you want to generate... or click on 'From Image' to upload an image and generate a prompt from it"
                rows={6}
                maxLength={3500}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all resize-none"
                data-testid="input-image-description"
              />
              <div className="absolute bottom-3 right-3 text-xs text-slate-400">
                {prompt.length}/3500
              </div>
            </div>
            
            <div className="mt-3 space-y-2">
              <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={generateFromImage}
                  onChange={(e) => setGenerateFromImage(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-violet-600 focus:ring-violet-500"
                  data-testid="checkbox-generate-from-image"
                />
                <ImageIcon className="w-4 h-4" />
                Generate prompt from image
              </label>
              
              <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={makeBetter}
                  onChange={(e) => setMakeBetter(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-violet-600 focus:ring-violet-500"
                  data-testid="checkbox-make-better"
                />
                <Wand2 className="w-4 h-4" />
                Make better
              </label>
            </div>

            <div className="mt-3 p-3 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-lg">
              <p className="text-sm text-slate-700 dark:text-slate-300">
                <span className="font-semibold text-violet-600 dark:text-violet-400">💡 ProTip!</span> For best results, explore our{' '}
                <button className="text-violet-600 dark:text-violet-400 underline hover:text-violet-700 dark:hover:text-violet-300">
                  prompt library
                </button>{' '}
                with curated examples and inspiration.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Model
            </label>
            <button
              onClick={() => setModelSelectorOpen(true)}
              className="w-full p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 hover:border-violet-500 dark:hover:border-violet-500 rounded-lg transition-all text-left"
              data-testid="button-select-model"
            >
              {selectedModel ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    {selectedModel.provider.charAt(0)}
                  </div>
                  <div>
                    <div className="text-slate-900 dark:text-white font-semibold">{selectedModel.name}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">{selectedModel.provider}</div>
                  </div>
                </div>
              ) : (
                <div className="text-slate-500 dark:text-slate-400">Choose an AI model</div>
              )}
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Attach Images (Optional)
            </label>
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center hover:border-violet-500 dark:hover:border-violet-500 transition-colors"
            >
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="image-upload"
                data-testid="input-file-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Drag & drop your files or click to browse
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                  Select up to 10 files
                </p>
              </label>
            </div>
            {attachedImages.length > 0 && (
              <div className="mt-3 space-y-2">
                {attachedImages.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-900/50 rounded">
                    <span className="text-sm text-slate-700 dark:text-slate-300 truncate">{file.name}</span>
                    <button
                      onClick={() => removeAttachedImage(index)}
                      className="text-red-500 hover:text-red-600 text-sm"
                      data-testid={`button-remove-image-${index}`}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
              Upload up to 10 images to send with your prompt
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Aspect Ratio
            </label>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              data-testid="select-aspect-ratio"
            >
              <option value="1:1">Square (1:1)</option>
              <option value="16:9">Landscape (16:9)</option>
              <option value="9:16">Portrait (9:16)</option>
              <option value="4:3">Standard (4:3)</option>
              <option value="3:4">Portrait (3:4)</option>
            </select>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
              Aspect ratio for the generated images
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Output Format
            </label>
            <select
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              data-testid="select-output-format"
            >
              <option value="JPEG">JPEG</option>
              <option value="PNG">PNG</option>
              <option value="WEBP">WEBP</option>
            </select>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
              Output format for the images
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Number of Images
            </label>
            <select
              value={numberOfImages}
              onChange={(e) => setNumberOfImages(parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              data-testid="select-number-images"
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </select>
          </div>

          {selectedModel && (
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-700 dark:text-slate-300">Total Cost:</span>
                <div className="flex items-center gap-1.5 text-yellow-600 dark:text-yellow-400 font-semibold">
                  <Sparkles className="w-4 h-4" />
                  <span>{selectedModel.costPerUse * numberOfImages} credits</span>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-600">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Your Balance:</span>
                  <span className={user && user.credits < selectedModel.costPerUse * numberOfImages ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
                    {user?.credits || 0} credits
                  </span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/50 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/50 rounded-lg">
              <p className="text-sm text-green-600 dark:text-green-400">Images generated successfully!</p>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || !selectedModel || generating}
            className="w-full py-3 px-6 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-lg hover:from-violet-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-500/30 flex items-center justify-center gap-2"
            data-testid="button-generate"
          >
            {generating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate
              </>
            )}
          </button>

          <div className="p-4 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-lg">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-5 h-5 text-violet-600 dark:text-violet-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-violet-900 dark:text-violet-300 mb-1">
                  Need inspiration?
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                  Try an example prompt to see how the AI image generator works
                </p>
                <button
                  onClick={tryExample}
                  className="px-4 py-2 bg-white dark:bg-slate-800 border border-violet-300 dark:border-violet-700 text-violet-600 dark:text-violet-400 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-900/30 transition-all text-sm font-medium flex items-center gap-2"
                  data-testid="button-try-example"
                >
                  <Sparkles className="w-4 h-4" />
                  Try an example
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto bg-slate-50 dark:bg-slate-900">
        {generatedImages.length > 0 ? (
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Generated Images</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Click to download</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {generatedImages.map((url, index) => (
                <div 
                  key={index} 
                  className="group relative bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-violet-500 dark:hover:border-violet-500 transition-all cursor-pointer"
                  data-testid={`image-result-${index}`}
                >
                  <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-900">
                    <img 
                      src={url} 
                      alt={`Generated ${index + 1}`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-4 flex gap-2">
                      <button 
                        onClick={() => handleDownload(url, index)}
                        className="flex-1 py-2 px-4 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                        data-testid={`button-download-${index}`}
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-500/20 dark:to-purple-500/20 rounded-full flex items-center justify-center">
                <ImageIcon className="w-12 h-12 text-violet-500 dark:text-violet-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Your creations will appear here</h3>
              <p className="text-slate-500 dark:text-slate-400">
                Start generating stunning images with AI
              </p>
            </div>
          </div>
        )}
      </div>

      <ModelSelector
        isOpen={modelSelectorOpen}
        onClose={() => setModelSelectorOpen(false)}
        onSelect={setSelectedModel}
        selectedModel={selectedModel}
      />
    </div>
  );
}
