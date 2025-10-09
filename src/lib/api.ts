const API_URL = '';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'An error occurred' };
    }

    return { data };
  } catch (error: any) {
    return { error: error.message || 'Network error' };
  }
}

export interface User {
  id: string;
  email: string;
  fullName: string | null;
  credits: number;
  subscriptionTier: string;
  hasPaid: boolean;
  subscriptionStatus: string;
  subscriptionEndsAt: string | null;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  apiModel: string; // Add this
  modelType: string;
  capabilities: Record<string, any>;
  costPerUse: number;
  isActive: boolean;
  createdAt: string;
}

export interface GenerationJob {
  id: string;
  userId: string;
  modelId: string;
  toolType: string;
  prompt: string;
  parameters: Record<string, any>;
  status: string;
  resultUrl: string | null;  // This is now the main field for image URLs
  errorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
}

export const auth = {
  register: (email: string, password: string, fullName: string) =>
    apiCall<{ user: User; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName }),
    }),

  login: (email: string, password: string) =>
    apiCall<{ user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    apiCall('/api/auth/logout', {
      method: 'POST',
    }),

  me: () => apiCall<{ user: User }>('/api/auth/me'),
};

export const models = {
  list: () => apiCall<{ models: AIModel[] }>('/api/models'),
};

export const generations = {
  create: (modelId: string, toolType: string, prompt: string, parameters: Record<string, any>) =>
    apiCall<{ 
      images: string[];
      generationJobs: GenerationJob[];
      creditsUsed: number;
      creditsRemaining: number;
      warnings?: string[];
    }>('/api/generationJobs', { // Note: fixed endpoint name
      method: 'POST',
      body: JSON.stringify({ modelId, toolType, prompt, options: parameters }),
    }),

  list: () => apiCall<{ generationJobs: GenerationJob[] }>('/api/generationJobs/user'),
};

export const subscriptions = {
  purchase: (planType: 'starter' | 'pro' | 'enterprise') =>
    apiCall<{ user: User }>('/api/subscriptions/purchase', {
      method: 'POST',
      body: JSON.stringify({ planType }),
    }),
};
