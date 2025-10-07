import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  credits: number;
  subscription_tier: 'free' | 'pro' | 'enterprise';
  created_at: string;
  updated_at: string;
}

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  model_type: string;
  capabilities: Record<string, any>;
  cost_per_use: number;
  is_active: boolean;
  created_at: string;
}

export interface GenerationJob {
  id: string;
  user_id: string;
  model_id: string;
  tool_type: string;
  prompt: string;
  parameters: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result_url: string | null;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface UserAsset {
  id: string;
  user_id: string;
  job_id: string | null;
  asset_url: string;
  asset_type: string;
  metadata: Record<string, any>;
  is_favorite: boolean;
  created_at: string;
}
