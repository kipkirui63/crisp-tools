import { useState } from 'react';
import { Sparkles, Download, Wand2 } from 'lucide-react';
import ModelSelector from '../ModelSelector';
import { AIModel, supabase } from '../../lib/supabase';
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

  const { profile, refreshProfile } = useAuth();

  const handleGenerate = async () => {
    if (isVisitor && onRequestAuth) {
      onRequestAuth();
      return;
    }

    if (!prompt.trim() || !selectedModel || !profile) {
      return;
    }

    const totalCost = selectedModel.cost_per_use * numberOfImages;
    if (profile.credits < totalCost) {
      alert('Insufficient credits');
      return;
    }

    setGenerating(true);

    try {
      const { data, error } = await supabase
        .from('generation_jobs')
        .insert([
          {
            user_id: profile.id,
            model_id: selectedModel.id,
            tool_type: 'generator',
            prompt: prompt,
            parameters: { numberOfImages },
            status: 'completed',
            result_url: `https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1024`,
          },
        ])
        .select()
        .single();

      if (!error && data) {
        const demoImages = [
          'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1024',
          'https://images.pexels.com/photos/414612/pexels-photo-414612.jpeg?auto=compress&cs=tinysrgb&w=1024',
          'https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg?auto=compress&cs=tinysrgb&w=1024',
        ];
        setGeneratedImages(demoImages.slice(0, numberOfImages));

        await supabase
          .from('profiles')
          .update({ credits: profile.credits - totalCost })
          .eq('id', profile.id);

        await refreshProfile();
      }
    } catch (err) {
      console.error('Generation error:', err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="h-full flex">
      <div className="w-96 bg-slate-800 border-r border-slate-700 p-6 overflow-y-auto">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Select Model
            </label>
            <button
              onClick={() => setModelSelectorOpen(true)}
              className="w-full p-4 bg-slate-900/50 border-2 border-slate-600 hover:border-cyan-500 rounded-lg transition-all text-left"
            >
              {selectedModel ? (
                <div>
                  <div className="text-white font-semibold">{selectedModel.name}</div>
                  <div className="text-sm text-slate-400">{selectedModel.provider}</div>
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-yellow-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{selectedModel.cost_per_use} credits per image</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-2">
                  <div className="text-slate-400 mb-1">Choose an AI model</div>
                  <div className="text-xs text-slate-500">Click to browse models</div>
                </div>
              )}
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to create..."
              rows={6}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Number of Images: {numberOfImages}
            </label>
            <input
              type="range"
              min="1"
              max="4"
              value={numberOfImages}
              onChange={(e) => setNumberOfImages(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>1</span>
              <span>4</span>
            </div>
          </div>

          {selectedModel && (
            <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300">Total Cost:</span>
                <div className="flex items-center gap-1.5 text-yellow-400 font-semibold">
                  <Sparkles className="w-4 h-4" />
                  <span>{selectedModel.cost_per_use * numberOfImages} credits</span>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || !selectedModel || generating}
            className="w-full py-4 px-6 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                Generate Images
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto bg-slate-900">
        {generatedImages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {generatedImages.map((url, index) => (
              <div key={index} className="group relative bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-cyan-500 transition-all">
                <img src={url} alt={`Generated ${index + 1}`} className="w-full aspect-square object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-4 flex gap-2">
                    <button className="flex-1 py-2 px-4 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center">
                <Sparkles className="w-12 h-12 text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Ready to Create</h3>
              <p className="text-slate-400">
                Select a model, enter your prompt, and generate stunning images with AI
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
