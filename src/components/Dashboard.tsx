import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Sparkles,
  Image,
  Edit3,
  User,
  Camera,
  Palette,
  Eraser,
  Shirt,
  Home,
  Type,
  Menu,
  X,
  LogOut,
  Coins,
  LogIn,
} from 'lucide-react';
import ImageGenerator from './tools/ImageGenerator';
import ImageEditor from './tools/ImageEditor';
import HeadshotGenerator from './tools/HeadshotGenerator';
import PhotoStudio from './tools/PhotoStudio';
import LogoGenerator from './tools/LogoGenerator';
import BackgroundRemover from './tools/BackgroundRemover';
import ClothChanger from './tools/ClothChanger';
import InteriorDesign from './tools/InteriorDesign';
import ImageToText from './tools/ImageToText';
import SignUpPrompt from './SignUpPrompt';

type ToolType =
  | 'generator'
  | 'editor'
  | 'headshot'
  | 'studio'
  | 'logo'
  | 'background'
  | 'cloth'
  | 'interior'
  | 'text';

const tools = [
  { id: 'generator' as ToolType, name: 'Image Generator', icon: Image, description: 'Create images from text' },
  { id: 'editor' as ToolType, name: 'Image Editor', icon: Edit3, description: 'Modify existing images' },
  { id: 'headshot' as ToolType, name: 'AI Headshot', icon: User, description: 'Professional headshots' },
  { id: 'studio' as ToolType, name: 'Photo Studio', icon: Camera, description: 'Virtual photo studio' },
  { id: 'logo' as ToolType, name: 'Logo Generator', icon: Palette, description: 'Create brand logos' },
  { id: 'background' as ToolType, name: 'Background Remover', icon: Eraser, description: 'Remove backgrounds' },
  { id: 'cloth' as ToolType, name: 'Cloth Changer', icon: Shirt, description: 'Virtual outfit try-on' },
  { id: 'interior' as ToolType, name: 'Interior Design', icon: Home, description: 'Redesign rooms' },
  { id: 'text' as ToolType, name: 'Image to Text', icon: Type, description: 'Extract text from images' },
];

interface DashboardProps {
  isVisitor?: boolean;
  onRequestAuth?: () => void;
}

export default function Dashboard({ isVisitor = false, onRequestAuth }: DashboardProps) {
  const [activeTool, setActiveTool] = useState<ToolType>('generator');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [signUpPromptOpen, setSignUpPromptOpen] = useState(false);
  const { user, signOut } = useAuth();

  const handleToolAction = () => {
    if (isVisitor && onRequestAuth) {
      setSignUpPromptOpen(true);
    }
  };

  const renderTool = () => {
    const toolProps = {
      isVisitor,
      onRequestAuth: handleToolAction
    };

    switch (activeTool) {
      case 'generator':
        return <ImageGenerator {...toolProps} />;
      case 'editor':
        return <ImageEditor {...toolProps} />;
      case 'headshot':
        return <HeadshotGenerator {...toolProps} />;
      case 'studio':
        return <PhotoStudio {...toolProps} />;
      case 'logo':
        return <LogoGenerator {...toolProps} />;
      case 'background':
        return <BackgroundRemover {...toolProps} />;
      case 'cloth':
        return <ClothChanger {...toolProps} />;
      case 'interior':
        return <InteriorDesign {...toolProps} />;
      case 'text':
        return <ImageToText {...toolProps} />;
      default:
        return <ImageGenerator {...toolProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-0'
        } bg-slate-800 border-r border-slate-700 transition-all duration-300 flex flex-col overflow-hidden`}
      >
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl shadow-lg shadow-cyan-500/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Crisp AI</h1>
              <p className="text-xs text-slate-400">Image Tools</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Tools
          </div>
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  activeTool === tool.id
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <div className="text-left">
                  <div className="text-sm font-medium">{tool.name}</div>
                  <div className="text-xs text-slate-400">{tool.description}</div>
                </div>
              </button>
            );
          })}
        </div>

        {!isVisitor && user ? (
          <div className="p-4 border-t border-slate-700 space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-yellow-400" />
                <span className="text-sm font-medium text-white">{user.credits || 0} Credits</span>
              </div>
              <button className="text-xs text-cyan-400 hover:text-cyan-300 font-medium">
                Get More
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {user.fullName?.[0] || user.email?.[0] || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">
                  {user.fullName || 'User'}
                </div>
                <div className="text-xs text-slate-400 truncate">{user.email}</div>
              </div>
              <button
                onClick={() => signOut()}
                className="text-slate-400 hover:text-white transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 border-t border-slate-700">
            <button
              onClick={onRequestAuth}
              className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Sign In to Use
            </button>
            <p className="text-center text-xs text-slate-400 mt-3">
              Exploring in demo mode
            </p>
          </div>
        )}
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-slate-800 border-b border-slate-700 flex items-center px-6">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="ml-4">
            <h2 className="text-lg font-semibold text-white">
              {tools.find((t) => t.id === activeTool)?.name}
            </h2>
            <p className="text-xs text-slate-400">
              {tools.find((t) => t.id === activeTool)?.description}
            </p>
          </div>

          <div className="ml-auto flex items-center gap-3">
            {isVisitor ? (
              <div className="px-4 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full">
                <span className="text-sm font-semibold text-amber-400">Demo Mode</span>
              </div>
            ) : (
              <div className="px-4 py-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded-full flex items-center gap-2">
                <Coins className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-semibold text-yellow-400">{user?.credits || 0}</span>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-auto">{renderTool()}</main>
      </div>

      <SignUpPrompt
        isOpen={signUpPromptOpen}
        onClose={() => setSignUpPromptOpen(false)}
        onSignUp={() => {
          setSignUpPromptOpen(false);
          if (onRequestAuth) onRequestAuth();
        }}
        toolName={tools.find((t) => t.id === activeTool)?.name || 'this tool'}
      />
    </div>
  );
}
