import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Checkout from './components/Checkout';

type AppView = 'browse' | 'auth' | 'checkout' | 'dashboard';

function AppContent() {
  const { user, loading } = useAuth();
  const [view, setView] = useState<AppView>('browse');

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

  // Show auth modal if user clicked a feature but isn't logged in
  if (!user && view === 'auth') {
    return <Auth onBack={() => setView('browse')} />;
  }

  // If user is logged in but hasn't paid, show checkout
  if (user && !user.hasPaid && view !== 'browse') {
    return <Checkout onBack={() => setView('browse')} />;
  }

  // Show dashboard - it handles both authenticated and browsing modes
  return <Dashboard
    isAuthenticated={!!user && user.hasPaid}
    onRequestAuth={() => setView('auth')}
  />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
