/*
  # Crisp AI Database Schema

  ## Overview
  Creates the complete database schema for Crisp AI image application with authentication, 
  job management, asset storage, and model tracking.

  ## New Tables
  
  ### `profiles`
  - `id` (uuid, primary key) - References auth.users
  - `email` (text) - User email
  - `full_name` (text) - User's full name
  - `credits` (integer) - Available generation credits
  - `subscription_tier` (text) - free, pro, enterprise
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `ai_models`
  - `id` (uuid, primary key) - Model identifier
  - `name` (text) - Model name (e.g., "Stable Diffusion", "Midjourney")
  - `provider` (text) - Provider name (OpenAI, Google, etc.)
  - `model_type` (text) - image_generation, image_editing, etc.
  - `capabilities` (jsonb) - Model capabilities and features
  - `cost_per_use` (integer) - Credits required per generation
  - `is_active` (boolean) - Whether model is currently available
  - `created_at` (timestamptz)

  ### `generation_jobs`
  - `id` (uuid, primary key) - Job identifier
  - `user_id` (uuid) - References profiles.id
  - `model_id` (uuid) - References ai_models.id
  - `tool_type` (text) - generator, editor, headshot, etc.
  - `prompt` (text) - User input prompt
  - `parameters` (jsonb) - Generation parameters
  - `status` (text) - pending, processing, completed, failed
  - `result_url` (text) - Generated image URL
  - `error_message` (text) - Error details if failed
  - `created_at` (timestamptz)
  - `completed_at` (timestamptz)

  ### `user_assets`
  - `id` (uuid, primary key) - Asset identifier
  - `user_id` (uuid) - References profiles.id
  - `job_id` (uuid) - References generation_jobs.id
  - `asset_url` (text) - Storage URL for the asset
  - `asset_type` (text) - image, logo, etc.
  - `metadata` (jsonb) - Additional asset information
  - `is_favorite` (boolean) - User favorite flag
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Users can only access their own data
  - Public read access to ai_models table
  - Authenticated access required for all operations
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  credits integer DEFAULT 100,
  subscription_tier text DEFAULT 'free',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create ai_models table
CREATE TABLE IF NOT EXISTS ai_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  provider text NOT NULL,
  model_type text NOT NULL,
  capabilities jsonb DEFAULT '{}',
  cost_per_use integer DEFAULT 1,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active models"
  ON ai_models FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Create generation_jobs table
CREATE TABLE IF NOT EXISTS generation_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  model_id uuid NOT NULL REFERENCES ai_models(id),
  tool_type text NOT NULL,
  prompt text NOT NULL,
  parameters jsonb DEFAULT '{}',
  status text DEFAULT 'pending',
  result_url text,
  error_message text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE generation_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own jobs"
  ON generation_jobs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own jobs"
  ON generation_jobs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own jobs"
  ON generation_jobs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create user_assets table
CREATE TABLE IF NOT EXISTS user_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  job_id uuid REFERENCES generation_jobs(id) ON DELETE SET NULL,
  asset_url text NOT NULL,
  asset_type text DEFAULT 'image',
  metadata jsonb DEFAULT '{}',
  is_favorite boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own assets"
  ON user_assets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own assets"
  ON user_assets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assets"
  ON user_assets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own assets"
  ON user_assets FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert sample AI models
INSERT INTO ai_models (name, provider, model_type, capabilities, cost_per_use) VALUES
  ('Stable Diffusion XL', 'Stability AI', 'image_generation', '{"styles": ["realistic", "artistic", "anime"], "maxResolution": "1024x1024"}', 1),
  ('DALL-E 3', 'OpenAI', 'image_generation', '{"styles": ["realistic", "artistic"], "maxResolution": "1792x1024"}', 2),
  ('Midjourney V6', 'Midjourney', 'image_generation', '{"styles": ["artistic", "photorealistic"], "maxResolution": "2048x2048"}', 3),
  ('Imagen 2', 'Google', 'image_generation', '{"styles": ["realistic", "artistic"], "maxResolution": "1536x1536"}', 2),
  ('FLUX Pro', 'Black Forest Labs', 'image_generation', '{"styles": ["realistic", "artistic"], "maxResolution": "1440x1440"}', 2),
  ('Leonardo AI', 'Leonardo', 'image_generation', '{"styles": ["game_assets", "portraits", "3d"], "maxResolution": "1024x1024"}', 1)
ON CONFLICT DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_generation_jobs_user_id ON generation_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_generation_jobs_status ON generation_jobs(status);
CREATE INDEX IF NOT EXISTS idx_user_assets_user_id ON user_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
