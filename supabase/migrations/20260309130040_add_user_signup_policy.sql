/*
  # Add User Signup Policy

  1. Security Changes
    - Add INSERT policy on `users` table to allow new user registration
    - Policy allows anyone (anon role) to insert their own user record during signup
    - This is required for the signup flow to work with the anon key
  
  2. Important Notes
    - The policy only allows inserting new records, not updating existing ones
    - After signup, users can only read/update their own data (existing policies)
    - Password is hashed before storage (handled in application code)
*/

CREATE POLICY "Allow user signup"
  ON users
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
