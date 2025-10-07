-- Crisp AI Database Schema
-- Run this SQL file on your PostgreSQL database

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  credits INTEGER DEFAULT 100 NOT NULL,
  subscription_tier TEXT DEFAULT 'free' NOT NULL,
  has_paid BOOLEAN DEFAULT FALSE NOT NULL,
  subscription_status TEXT DEFAULT 'none' NOT NULL,
  subscription_ends_at TIMESTAMP,
  onboarding_completed BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create ai_models table
CREATE TABLE IF NOT EXISTS ai_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  provider TEXT NOT NULL,
  model_type TEXT NOT NULL,
  capabilities JSONB DEFAULT '{}' NOT NULL,
  cost_per_use INTEGER DEFAULT 1 NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create generation_jobs table
CREATE TABLE IF NOT EXISTS generation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  model_id UUID NOT NULL REFERENCES ai_models(id),
  tool_type TEXT NOT NULL,
  prompt TEXT NOT NULL,
  parameters JSONB DEFAULT '{}' NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL,
  result_url TEXT,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMP
);

-- Create user_assets table
CREATE TABLE IF NOT EXISTS user_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id UUID REFERENCES generation_jobs(id) ON DELETE SET NULL,
  asset_url TEXT NOT NULL,
  asset_type TEXT DEFAULT 'image' NOT NULL,
  metadata JSONB DEFAULT '{}' NOT NULL,
  is_favorite BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL,
  credits_included INTEGER DEFAULT 0 NOT NULL,
  amount_paid INTEGER NOT NULL,
  status TEXT DEFAULT 'active' NOT NULL,
  starts_at TIMESTAMP DEFAULT NOW() NOT NULL,
  ends_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_generation_jobs_user_id ON generation_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_generation_jobs_status ON generation_jobs(status);
CREATE INDEX IF NOT EXISTS idx_user_assets_user_id ON user_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);

-- Insert sample AI models
INSERT INTO ai_models (name, provider, model_type, capabilities, cost_per_use) VALUES
  ('Stable Diffusion XL', 'Stability AI', 'image_generation', '{"styles": ["realistic", "artistic", "anime"], "maxResolution": "1024x1024"}', 1),
  ('DALL-E 3', 'OpenAI', 'image_generation', '{"styles": ["realistic", "artistic"], "maxResolution": "1792x1024"}', 2),
  ('Midjourney V6', 'Midjourney', 'image_generation', '{"styles": ["artistic", "photorealistic"], "maxResolution": "2048x2048"}', 3),
  ('Imagen 2', 'Google', 'image_generation', '{"styles": ["realistic", "artistic"], "maxResolution": "1536x1536"}', 2),
  ('FLUX Pro', 'Black Forest Labs', 'image_generation', '{"styles": ["realistic", "artistic"], "maxResolution": "1440x1440"}', 2),
  ('Leonardo AI', 'Leonardo', 'image_generation', '{"styles": ["game_assets", "portraits", "3d"], "maxResolution": "1024x1024"}', 1)
ON CONFLICT DO NOTHING;
