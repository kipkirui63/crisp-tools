import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth, User } from '../lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const { data, error } = await auth.me();
    if (data?.user) {
      setUser(data.user);
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    fetchUser().finally(() => setLoading(false));
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await auth.register(email, password, fullName);
    if (data?.user) {
      setUser(data.user);
      return { error: null };
    }
    return { error: error || 'Registration failed' };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await auth.login(email, password);
    if (data?.user) {
      setUser(data.user);
      return { error: null };
    }
    return { error: error || 'Login failed' };
  };

  const signOut = async () => {
    await auth.logout();
    setUser(null);
  };

  const refreshProfile = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signUp,
        signIn,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
