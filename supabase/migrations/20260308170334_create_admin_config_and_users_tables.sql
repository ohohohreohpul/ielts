/*
  # Create Admin Configuration and Users Tables

  1. New Tables
    - `admin_config`
      - `id` (uuid, primary key) - Unique identifier
      - `key` (text, unique) - Configuration key name
      - `value` (text) - Configuration value (encrypted API keys, etc.)
      - `created_at` (timestamptz) - Timestamp when created
      - `updated_at` (timestamptz) - Timestamp when last updated
    
    - `users`
      - `id` (uuid, primary key) - Unique user identifier
      - `email` (text, unique) - User email
      - `name` (text) - User display name
      - `picture` (text) - User profile picture URL
      - `auth_provider` (text) - Authentication provider (google, emergent, etc.)
      - `auth_provider_id` (text) - Provider-specific user ID
      - `subscription_status` (text) - premium or free
      - `subscription_end_date` (timestamptz) - When premium expires
      - `created_at` (timestamptz) - Account creation timestamp
      - `last_login` (timestamptz) - Last login timestamp
    
    - `user_sessions`
      - `id` (uuid, primary key) - Session identifier
      - `user_id` (uuid, foreign key) - Reference to users table
      - `token` (text, unique) - Session token
      - `expires_at` (timestamptz) - Session expiration
      - `created_at` (timestamptz) - Session creation timestamp

  2. Security
    - Enable RLS on all tables
    - Admin config: Only accessible via service role (backend only)
    - Users: Users can read their own data
    - User sessions: Users can read their own sessions
*/

-- Create admin_config table
CREATE TABLE IF NOT EXISTS admin_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text DEFAULT '',
  picture text DEFAULT '',
  auth_provider text DEFAULT 'emergent',
  auth_provider_id text DEFAULT '',
  subscription_status text DEFAULT 'free',
  subscription_end_date timestamptz,
  created_at timestamptz DEFAULT now(),
  last_login timestamptz DEFAULT now()
);

-- Create user_sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE admin_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Admin config policies (service role only, no direct user access)
-- No policies needed - service role bypasses RLS

-- Users policies
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- User sessions policies
CREATE POLICY "Users can read own sessions"
  ON user_sessions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own sessions"
  ON user_sessions FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_config_key ON admin_config(key);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_auth_provider_id ON users(auth_provider, auth_provider_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for admin_config
CREATE TRIGGER update_admin_config_updated_at
  BEFORE UPDATE ON admin_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();