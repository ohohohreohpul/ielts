/*
  # Add User Session Insert Policy

  1. Security Changes
    - Add INSERT policy on `user_sessions` table to allow session creation
    - Policy allows creating sessions for any user during signup/login
    - Required for authentication flow to work properly
  
  2. Important Notes
    - Sessions are created by the server using service role or anon key
    - Users can only read and delete their own sessions (existing policies)
    - Session tokens are generated server-side with expiration
*/

CREATE POLICY "Allow session creation"
  ON user_sessions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
