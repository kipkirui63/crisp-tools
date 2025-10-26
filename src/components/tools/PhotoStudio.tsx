import { useState } from 'react';
import { Upload, Camera, Wand2, ArrowLeft, Plus, X } from 'lucide-react';

interface Model {
  id: string;
  name: string;
  type: string;
  images: string[];
  trained: boolean;
}

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
}

interface PhotoStudioProps {
  isAuthenticated: boolean;
  onRequestAuth: () => void;
}

export default function AIPhotoGenerator({ isAuthenticated, onRequestAuth }: PhotoStudioProps) {
  const [currentView, setCurrentView] = useState<'gallery' | 'train' | 'studio'>('gallery');
  const [models, setModels] = useState<Model[]>([]);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  
  // Training form state
  const [modelName, setModelName] = useState('');
  const [subjectType, setSubjectType] = useState('Woman');
  const [trainingImages, setTrainingImages] = useState<string[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  
  // Studio state
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [prompt, setPrompt] = useState('');
  const [lighting, setLighting] = useState('studio');
  const [background, setBackground] = useState('white');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages: string[] = [];
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          newImages.push(e.target?.result as string);
          if (newImages.length === files.length) {
            setTrainingImages([...trainingImages, ...newImages]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeTrainingImage = (index: number) => {
    setTrainingImages(trainingImages.filter((_, i) => i !== index));
  };

  const handleTrainModel = async () => {
    if (!modelName || trainingImages.length < 5) {
      alert('Please provide a model name and at least 5 training images');
      return;
    }

    setIsTraining(true);
    
    // Simulate training process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newModel: Model = {
      id: Date.now().toString(),
      name: modelName,
      type: subjectType,
      images: trainingImages,
      trained: true
    };
    
    setModels([...models, newModel]);
    setIsTraining(false);
    setCurrentView('gallery');
    
    // Reset form
    setModelName('');
    setSubjectType('Woman');
    setTrainingImages([]);
  };

  const handleGenerateImage = async () => {
    if (!isAuthenticated) {
      onRequestAuth();
      return;
    }

    if (!selectedModel || !prompt) {
      alert('Please select a model and enter a prompt');
      return;
    }

    setIsTraining(true);

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

      const fullPrompt = `${prompt}. ${lighting} lighting. ${background} background.`;

      const response = await fetch('/api/generationJobs', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          modelId: firstModel.id,
          toolType: 'photo-studio',
          prompt: fullPrompt,
          options: {
            numberOfImages: 1,
            width: 1024,
            height: 1024,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate image');
      }

      const data = await response.json();

      const imageUrl = data.images?.[0] || data.imageUrl;
      if (!imageUrl) {
        throw new Error('No image URL in response');
      }

      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url: imageUrl,
        prompt: prompt
      };

      setGeneratedImages([newImage, ...generatedImages]);
      setPrompt('');
    } catch (error: any) {
      console.error('Photo generation error:', error);
      alert(error.message || 'Failed to generate photo');
    } finally {
      setIsTraining(false);
    }
  };

  const openStudio = (model: Model) => {
    setSelectedModel(model);
    setCurrentView('studio');
  };

  // Gallery View
  if (currentView === 'gallery') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-6xl font-bold text-white mb-4">AI Photo Generator</h1>
            <p className="text-xl text-slate-400">
              Train custom AI models to create amazing photos for any purpose
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Train New Model Card */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center mb-6">
                <Camera className="w-12 h-12 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No Custom Models Yet</h3>
              <p className="text-slate-400 text-center mb-8">
                Train your first AI model to generate personalized photos
              </p>
              <button
                onClick={() => setCurrentView('train')}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Train Your First Model
              </button>
            </div>

            {/* Display Trained Models */}
            {models.map((model) => (
              <div
                key={model.id}
                onClick={() => openStudio(model)}
                className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl overflow-hidden cursor-pointer hover:border-cyan-500 transition-all group"
              >
                <div className="aspect-[3/4] relative overflow-hidden">
                  <img
                    src={model.images[0]}
                    alt={model.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl font-bold text-white mb-1">{model.name}</h3>
                    <p className="text-slate-300 text-sm">{model.type}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Display Generated Images */}
            {generatedImages.map((image) => (
              <div
                key={image.id}
                className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl overflow-hidden"
              >
                <div className="aspect-[3/4] relative overflow-hidden">
                  <img
                    src={image.url}
                    alt={image.prompt}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <p className="text-slate-300 text-sm">{image.prompt}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Training View
  if (currentView === 'train') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => setCurrentView('gallery')}
            className="mb-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Gallery
          </button>

          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">Train Your Model</h1>
            <p className="text-xl text-slate-400">
              Train your unique AI model to generate images with your own photos
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Form */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    placeholder="e.g. Natalie's Image Model"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Subject Type *
                  </label>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {['Man', 'Woman', 'Product'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setSubjectType(type)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          subjectType === type
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {['Style', 'Object', 'Font'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setSubjectType(type)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          subjectType === type
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {['Pet', 'Food', 'General'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setSubjectType(type)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          subjectType === type
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Samples
                  </label>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-cyan-500 transition-all bg-slate-900/50">
                    <Upload className="w-8 h-8 text-slate-400 mb-2" />
                    <p className="text-slate-400 text-sm">Drag & drop your files or click to browse</p>
                    <p className="text-slate-500 text-xs mt-1">Select up to 20 files</p>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  
                  {trainingImages.length > 0 && (
                    <div className="mt-4 grid grid-cols-4 gap-2">
                      {trainingImages.map((img, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={img}
                            alt={`Training ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => removeTrainingImage(index)}
                            className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleTrainModel}
                  disabled={isTraining || !modelName || trainingImages.length < 5}
                  className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/30"
                >
                  {isTraining ? 'Training Model...' : 'Train Model'}
                </button>

                <div className="bg-slate-900/50 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">Important Details</h4>
                  <ul className="text-sm text-slate-400 space-y-1 list-disc list-inside">
                    <li>Training usually takes between 20 to 40 minutes.</li>
                    <li>When your model is ready, we'll send you an email.</li>
                    <li>No nudes / NSFW images allowed.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Right Column - Instructions */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6">How to train your custom image model:</h3>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-2">Input model name and type</h4>
                    <p className="text-slate-400 text-sm">
                      Name your model any name you want, and select the type of subject (Person, Product, Style, Pet).
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-2">Choose good pictures</h4>
                    <p className="text-slate-400 text-sm mb-3">
                      5-10 high-quality samples, front facing, square aspect ratio, 1 subject in frame, variety
                    </p>
                    <div className="grid grid-cols-5 gap-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="aspect-square bg-slate-700 rounded-lg"></div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                    <X className="w-4 h-4 text-red-500" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-2">Example of bad pictures</h4>
                    <p className="text-slate-400 text-sm mb-3">
                      Side profile, lateral, frontal, cropped poorly, multiple subjects
                    </p>
                    <div className="grid grid-cols-5 gap-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="aspect-square bg-slate-700 rounded-lg"></div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-2">Train your model</h4>
                    <p className="text-slate-400 text-sm">
                      Training your model takes ~30 minutes. You can leave the page and come back later.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-2">Generate images</h4>
                    <p className="text-slate-400 text-sm">
                      Once your model is trained, you can generate images using prompts in our AI Photo Studio.
                    </p>
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mt-6">
                  <h4 className="text-blue-400 font-semibold mb-2">Tips for Better Results</h4>
                  <div className="text-sm text-slate-300 space-y-2">
                    <p><strong>Use Multiple Zoom Levels:</strong> Upload 10-20 high-quality photos of the person, object, or style you want to train on.</p>
                    <p><strong>Add Variety:</strong> Change up poses, backgrounds, and where the subject is looking. This makes your model better.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Studio View
  return (
    <div className="h-screen flex flex-col bg-slate-900">
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-96 bg-slate-800 border-r border-slate-700 p-6 overflow-y-auto">
          <button
            onClick={() => setCurrentView('gallery')}
            className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Gallery
          </button>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">AI Photo Studio</h3>
              <p className="text-sm text-slate-400">Model: {selectedModel?.name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the photo you want to generate..."
                rows={4}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Lighting Style
              </label>
              <select
                value={lighting}
                onChange={(e) => setLighting(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="studio">Studio Lighting</option>
                <option value="natural">Natural Light</option>
                <option value="dramatic">Dramatic</option>
                <option value="soft">Soft Light</option>
                <option value="golden">Golden Hour</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Background
              </label>
              <select
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="white">White</option>
                <option value="black">Black</option>
                <option value="gradient">Gradient</option>
                <option value="blur">Blur</option>
                <option value="custom">Custom Color</option>
              </select>
            </div>

            <button
              onClick={handleGenerateImage}
              disabled={!prompt}
              className="w-full py-4 px-6 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2"
            >
              <Wand2 className="w-5 h-5" />
              Generate Image
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          {generatedImages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center">
                  <Camera className="w-12 h-12 text-cyan-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Virtual Photo Studio</h3>
                <p className="text-slate-400">
                  Enter a prompt and generate amazing photos using your trained model
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {generatedImages.map((image) => (
                <div
                  key={image.id}
                  className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl overflow-hidden"
                >
                  <div className="aspect-square relative overflow-hidden">
                    <img
                      src={image.url}
                      alt={image.prompt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-slate-300 text-sm">{image.prompt}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}