import { useState, useEffect } from 'react';
import { X, Search, Sparkles, CheckCircle } from 'lucide-react';
import { supabase, AIModel } from '../lib/supabase';

interface ModelSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (model: AIModel) => void;
  selectedModel?: AIModel | null;
}

const providerColors: Record<string, string> = {
  'OpenAI': 'from-green-500 to-emerald-500',
  'Google': 'from-blue-500 to-cyan-500',
  'Midjourney': 'from-purple-500 to-pink-500',
  'Stability AI': 'from-orange-500 to-red-500',
  'Black Forest Labs': 'from-slate-600 to-slate-800',
  'Leonardo': 'from-yellow-500 to-orange-500',
};

export default function ModelSelector({ isOpen, onClose, onSelect, selectedModel }: ModelSelectorProps) {
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string>('all');

  useEffect(() => {
    if (isOpen) {
      fetchModels();
    }
  }, [isOpen]);

  const fetchModels = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('ai_models')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (data && !error) {
      setModels(data);
    }
    setLoading(false);
  };

  const filteredModels = models.filter((model) => {
    const matchesSearch =
      model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.provider.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProvider = selectedProvider === 'all' || model.provider === selectedProvider;
    return matchesSearch && matchesProvider;
  });

  const providers = ['all', ...Array.from(new Set(models.map((m) => m.provider)))];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Select AI Model</h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-slate-400 text-sm mb-4">
            Different models excel at different tasks. Try multiple models and compare results to find the best fit.
          </p>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search models..."
              className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {providers.map((provider) => (
              <button
                key={provider}
                onClick={() => setSelectedProvider(provider)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedProvider === provider
                    ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {provider === 'all' ? 'All Providers' : provider}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredModels.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    onSelect(model);
                    onClose();
                  }}
                  className={`p-5 rounded-xl border-2 transition-all text-left hover:scale-[1.02] ${
                    selectedModel?.id === model.id
                      ? 'border-cyan-500 bg-cyan-500/10'
                      : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-white">{model.name}</h3>
                        {selectedModel?.id === model.id && (
                          <CheckCircle className="w-5 h-5 text-cyan-400" />
                        )}
                      </div>
                      <div
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${
                          providerColors[model.provider] || 'from-slate-600 to-slate-700'
                        }`}
                      >
                        {model.provider}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded-full">
                      <Sparkles className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm font-semibold text-yellow-400">
                        {model.cost_per_use}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    {model.capabilities.styles && (
                      <div>
                        <span className="text-slate-400">Styles: </span>
                        <span className="text-slate-300">
                          {(model.capabilities.styles as string[]).join(', ')}
                        </span>
                      </div>
                    )}
                    {model.capabilities.maxResolution && (
                      <div>
                        <span className="text-slate-400">Max Resolution: </span>
                        <span className="text-slate-300">{model.capabilities.maxResolution as string}</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {!loading && filteredModels.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-400">No models found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
