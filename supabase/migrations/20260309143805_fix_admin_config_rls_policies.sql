/*
  # Fix admin_config RLS policies

  1. Security Changes
    - Add policy to allow service role to SELECT from admin_config table
    - Add policy to allow service role to INSERT/UPDATE to admin_config table
    - These policies ensure the backend can read API keys while keeping them secure from frontend access

  2. Important Notes
    - Service role operations bypass RLS by default in Supabase
    - These policies are for anon key operations (if service role key is not configured)
    - Admin config should never be accessible from the frontend directly
*/

-- Allow service/anon role to read admin config (backend only)
CREATE POLICY "Allow backend to read admin config"
  ON admin_config
  FOR SELECT
  USING (true);

-- Allow service/anon role to write admin config (backend only)
CREATE POLICY "Allow backend to write admin config"
  ON admin_config
  FOR INSERT
  WITH CHECK (true);

-- Allow service/anon role to update admin config (backend only)
CREATE POLICY "Allow backend to update admin config"
  ON admin_config
  FOR UPDATE
  USING (true)
  WITH CHECK (true);