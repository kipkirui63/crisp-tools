import { useState } from 'react';
import { Upload, Wand2, Download, AlertCircle, Plus, X } from 'lucide-react';
import ModelSelector from '../ModelSelector';
import { AIModel } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

interface ImageEditorProps {
  isAuthenticated: boolean;
  onRequestAuth: () => void;
}

export default function ImageEditor({ isAuthenticated, onRequestAuth }: ImageEditorProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null);
  const [instructions, setInstructions] = useState('');
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  
  // Reference images
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [referenceFiles, setReferenceFiles] = useState<File[]>([]);
  
  // Advanced options
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [strength, setStrength] = useState(0.7);
  const [negativePrompt, setNegativePrompt] = useState('');
  const [blankCanvas, setBlankCanvas] = useState(false);
  
  // Processing state
  const [processing, setProcessing] = useState(false);
  const [editHistory, setEditHistory] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { user, refreshProfile } = useAuth();

  const quickPrompts = [
    'Make it more vibrant and colorful',
    'Add dramatic lighting',
    'Make it more photorealistic',
    'Increase contrast and saturation',
    'Add depth of field effect',
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setUploadedImage(e.target?.result as string);
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleReferenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + referenceFiles.length > 5) {
      setError('Maximum 5 reference images allowed');
      return;
    }

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setReferenceImages((prev) => [...prev, e.target?.result as string]);
        setReferenceFiles((prev) => [...prev, file]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeReference = (index: number) => {
    setReferenceImages((prev) => prev.filter((_, i) => i !== index));
    setReferenceFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const applyQuickPrompt = (prompt: string) => {
    setInstructions((prev) => (prev ? `${prev}. ${prompt}` : prompt));
  };

  const downloadEdit = async (url: string, id: number) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = `edited-image-${id}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error('Download failed:', error);
      const link = document.createElement('a');
      link.href = url;
      link.download = `edited-image-${id}-${Date.now()}.png`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleEdit = async () => {
    if (!isAuthenticated) {
      onRequestAuth();
      return;
    }

    if (!instructions.trim()) {
      setError('Please enter editing instructions');
      return;
    }

    if (!blankCanvas && !uploadedImageFile) {
      setError('Please upload an image or choose blank canvas');
      return;
    }

    if (!selectedModel || !user) {
      setError('Please select a model');
      return;
    }

    if (user.credits < selectedModel.costPerUse) {
      setError(`Insufficient credits. You have ${user.credits} but need ${selectedModel.costPerUse}`);
      return;
    }

    setProcessing(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      
      if (!blankCanvas && uploadedImageFile) {
        formData.append('image', uploadedImageFile);
      }
      
      formData.append('instructions', instructions);
      formData.append('modelId', selectedModel.id.toString());
      formData.append('strength', strength.toString());
      formData.append('negativePrompt', negativePrompt);

      referenceFiles.forEach((file) => {
        formData.append('references', file);
      });

      const response = await fetch('/api/image-edit/image-edit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to edit image');
      }

      // Add to edit history
      setEditHistory((prev) => [
        {
          id: Date.now(),
          prompt: instructions,
          imageUrl: data.imageUrl,
          timestamp: new Date(),
        },
        ...prev,
      ]);

      setSuccess(true);
      setInstructions('');
      await refreshProfile();

      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="h-full flex bg-slate-900">
      {/* Left Panel - Controls */}
      <div className="w-96 bg-slate-800 border-r border-slate-700 p-6 overflow-y-auto">
        <div className="space-y-6">
          {/* Choose Starting Point */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Choose Your Starting Point</h3>
            
            {/* Upload Image */}
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-cyan-500 transition-all bg-slate-900/50 mb-3">
              {uploadedImage && !blankCanvas ? (
                <img src={uploadedImage} alt="Uploaded" className="max-h-full object-contain" />
              ) : (
                <div className="text-center">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">Drag & drop your files or click to browse</p>
                  <p className="text-xs text-slate-500">Select a file</p>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>

            {/* Blank Canvas Option */}
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => {
                  setBlankCanvas(!blankCanvas);
                  if (blankCanvas) {
                    setUploadedImage(null);
                  } else {
                    setUploadedImage(null);
                  }
                }}
                className="text-sm text-cyan-400 hover:text-cyan-300"
              >
                ✏ Start from Blank Canvas
              </button>
            </div>
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Model</label>
            <button
              onClick={() => setModelSelectorOpen(true)}
              className="w-full p-3 bg-slate-900/50 border border-slate-600 hover:border-cyan-500 rounded-lg transition-all text-left"
            >
              {selectedModel ? (
                <div>
                  <div className="text-white font-semibold text-sm">{selectedModel.name}</div>
                  <div className="text-xs text-slate-400">{selectedModel.provider}</div>
                </div>
              ) : (
                <div className="text-slate-400 text-sm">Choose a model</div>
              )}
            </button>
          </div>

          {/* Prompt Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-300">Prompt</label>
              <button className="text-xs text-cyan-400 hover:text-cyan-300">⚡ Quick Prompts</button>
            </div>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value.slice(0, 1000))}
              placeholder="Describe what you want to create or how you want to edit the image..."
              rows={5}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all resize-none"
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-slate-400">
                {instructions.length}/1000
              </p>
            </div>

            {/* Quick Prompts Dropdown */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => applyQuickPrompt(prompt)}
                  className="text-xs px-2 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Reference Images */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Reference Images (Optional)
            </label>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-cyan-500 transition-all bg-slate-900/50">
              <div className="text-center">
                <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                <p className="text-xs text-slate-400">Drag & drop your files or click to browse</p>
                <p className="text-xs text-slate-500">Select up to 5 files</p>
              </div>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleReferenceUpload} 
                multiple
                className="hidden" 
              />
            </label>

            {referenceImages.length > 0 && (
              <div className="mt-3 grid grid-cols-5 gap-2">
                {referenceImages.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img src={img} alt={`Ref ${idx}`} className="w-full aspect-square object-cover rounded" />
                    <button
                      onClick={() => removeReference(idx)}
                      className="absolute top-0 right-0 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
                {referenceImages.length < 5 && (
                  <label className="flex items-center justify-center aspect-square border-2 border-dashed border-slate-600 rounded hover:border-cyan-500 cursor-pointer">
                    <Plus className="w-4 h-4 text-slate-400" />
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleReferenceUpload} 
                      className="hidden" 
                    />
                  </label>
                )}
              </div>
            )}
          </div>

          {/* Advanced Options */}
          <div>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-slate-300 hover:text-white font-medium flex items-center gap-2"
            >
              <span>Advanced Options</span>
              <span className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {showAdvanced && (
              <div className="mt-3 space-y-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                {/* Strength Slider */}
                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    Edit Strength: {Math.round(strength * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={strength}
                    onChange={(e) => setStrength(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Lower = preserve original, Higher = more changes
                  </p>
                </div>

                {/* Negative Prompt */}
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Negative Prompt</label>
                  <textarea
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    placeholder="What you DON'T want in the image..."
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-500/10 border border-green-500/50 rounded-lg">
              <p className="text-xs text-green-400">Edit applied successfully!</p>
            </div>
          )}

          {/* Apply Button */}
          <button
            onClick={handleEdit}
            disabled={!instructions.trim() || (!uploadedImage && !blankCanvas) || !selectedModel || processing}
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <Wand2 className="w-4 h-4" />
            {processing ? 'Processing...' : 'Apply Edits'}
          </button>
        </div>
      </div>

      {/* Right Panel - Preview & History */}
      <div className="flex-1 flex flex-col bg-slate-900">
        {/* Edit History Toggle */}
        <div className="border-b border-slate-700 p-4 flex items-center justify-between">
          <h3 className="text-sm font-medium text-slate-300">Edit History</h3>
          <button className="text-slate-400 hover:text-white">›</button>
        </div>

        {/* History Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {editHistory.length > 0 ? (
            <div className="space-y-4">
              {editHistory.map((edit) => (
                <div key={edit.id} className="border border-slate-700 rounded-lg overflow-hidden hover:border-cyan-500 transition-colors">
                  <img src={edit.imageUrl} alt="Edit" className="w-full aspect-video object-cover" />
                  <div className="p-3 bg-slate-800/50">
                    <p className="text-xs text-slate-400">{edit.timestamp.toLocaleTimeString()}</p>
                    <p className="text-xs text-slate-300 mt-1 line-clamp-2">{edit.prompt}</p>
                    <button
                      onClick={() => downloadEdit(edit.imageUrl, edit.id)}
                      className="mt-2 text-xs px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-slate-700 rounded-full flex items-center justify-center">
                  <Wand2 className="w-8 h-8 text-slate-500" />
                </div>
                <p className="text-sm text-slate-400">No edit history yet</p>
                <p className="text-xs text-slate-500">Your edits will appear here</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Model Selector Modal */}
      <ModelSelector
        isOpen={modelSelectorOpen}
        onClose={() => setModelSelectorOpen(false)}
        onSelect={setSelectedModel}
        selectedModel={selectedModel}
      />
    </div>
  );
}