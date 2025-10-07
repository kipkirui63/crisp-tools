import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Checkout from './components/Checkout';

type AppView = 'visitor' | 'auth' | 'checkout' | 'dashboard';

function AppContent() {
  const { user, loading } = useAuth();
  const [view, setView] = useState<AppView>('visitor');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (view === 'auth') {
      return <Auth />;
    }
    return <Dashboard isVisitor={true} onRequestAuth={() => setView('auth')} />;
  }

  if (user && !user.hasPaid && !user.onboardingCompleted) {
    return <Checkout onComplete={() => setView('dashboard')} />;
  }

  return <Dashboard />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
