import { X, Sparkles, Check } from 'lucide-react';

interface SignUpPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onSignUp: () => void;
  toolName: string;
}

export default function SignUpPrompt({ isOpen, onClose, onSignUp, toolName }: SignUpPromptProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-lg overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Sign Up to Continue</h2>
                <p className="text-sm text-slate-400">Unlock full access to {toolName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-cyan-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Access All AI Tools</h3>
                <p className="text-slate-400 text-sm">
                  Use all 9 powerful AI image tools with multiple model options
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-cyan-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Free Starting Credits</h3>
                <p className="text-slate-400 text-sm">
                  Get 100 free credits to start creating amazing images
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-cyan-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Premium AI Models</h3>
                <p className="text-slate-400 text-sm">
                  Choose from Stable Diffusion, DALL-E, Midjourney, and more
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-cyan-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Save Your Creations</h3>
                <p className="text-slate-400 text-sm">
                  Store and manage all your generated images in one place
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onSignUp}
            className="w-full py-4 px-6 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all shadow-lg shadow-cyan-500/30"
          >
            Sign Up Now
          </button>

          <p className="text-center text-sm text-slate-400 mt-4">
            Already have an account?{' '}
            <button onClick={onSignUp} className="text-cyan-400 hover:text-cyan-300 font-medium">
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
