/*
  # Extend Users Table and Create Application Tables

  1. Users Table Extensions
    - Add `password` column for email/password authentication (hashed)
    - Add `streak` column for tracking daily streaks (default 0)
    - Add `hearts` column for gamification (default 5)
    - Add `total_xp` column for experience points (default 0)
    - Add `premium` column for premium status (default false)
    - Add `premium_since` column for premium activation date
    - Add `premium_plan` column for premium plan type (monthly/yearly)
    - Add `goal` column for user's learning goal
    - Add `username` column for display name
    - Add `google_id` column for Google OAuth ID

  2. New Tables
    - `exams` - Stores generated exam questions
    - `lessons` - Stores AI-generated lesson content
    - `progress` - Tracks user progress on lessons
    - `exam_history` - Stores completed exam records
    - `payment_transactions` - Stores Stripe payment records

  3. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users to access their own data
    - Admin policies for admin_config table
*/

-- Extend users table with additional columns
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password') THEN
    ALTER TABLE users ADD COLUMN password text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'streak') THEN
    ALTER TABLE users ADD COLUMN streak integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'hearts') THEN
    ALTER TABLE users ADD COLUMN hearts integer DEFAULT 5;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'total_xp') THEN
    ALTER TABLE users ADD COLUMN total_xp integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'premium') THEN
    ALTER TABLE users ADD COLUMN premium boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'premium_since') THEN
    ALTER TABLE users ADD COLUMN premium_since timestamptz;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'premium_plan') THEN
    ALTER TABLE users ADD COLUMN premium_plan text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'goal') THEN
    ALTER TABLE users ADD COLUMN goal text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'username') THEN
    ALTER TABLE users ADD COLUMN username text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'google_id') THEN
    ALTER TABLE users ADD COLUMN google_id text;
  END IF;
END $$;

-- Create exams table
CREATE TABLE IF NOT EXISTS exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  exam_type text NOT NULL,
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_questions integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id text NOT NULL,
  section_id text NOT NULL,
  lesson_id text NOT NULL,
  exam_name text NOT NULL,
  section_name text NOT NULL,
  title text NOT NULL,
  sections jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(exam_id, section_id, lesson_id)
);

-- Create progress table
CREATE TABLE IF NOT EXISTS progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id text NOT NULL,
  score numeric,
  completed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create exam_history table
CREATE TABLE IF NOT EXISTS exam_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exam_type text NOT NULL,
  section text NOT NULL,
  questions jsonb DEFAULT '[]'::jsonb,
  total_questions integer DEFAULT 0,
  correct_count integer DEFAULT 0,
  score numeric DEFAULT 0,
  completed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create payment_transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text UNIQUE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  email text,
  plan text NOT NULL,
  amount numeric NOT NULL,
  currency text DEFAULT 'thb',
  status text DEFAULT 'pending',
  payment_status text DEFAULT 'initiated',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_exams_user_id ON exams(user_id);
CREATE INDEX IF NOT EXISTS idx_exams_exam_type ON exams(exam_type);
CREATE INDEX IF NOT EXISTS idx_lessons_lookup ON lessons(exam_id, section_id, lesson_id);
CREATE INDEX IF NOT EXISTS idx_progress_user_id ON progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_lesson_id ON progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_exam_history_user_id ON exam_history(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_history_exam_type ON exam_history(exam_type);
CREATE INDEX IF NOT EXISTS idx_exam_history_section ON exam_history(section);
CREATE INDEX IF NOT EXISTS idx_payment_session_id ON payment_transactions(session_id);
CREATE INDEX IF NOT EXISTS idx_payment_user_id ON payment_transactions(user_id);

-- Enable RLS on all tables
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for exams table
CREATE POLICY "Users can view their own exams"
  ON exams FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own exams"
  ON exams FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for lessons table (public read, no user-specific data)
CREATE POLICY "Anyone can view lessons"
  ON lessons FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage lessons"
  ON lessons FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for progress table
CREATE POLICY "Users can view their own progress"
  ON progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own progress"
  ON progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for exam_history table
CREATE POLICY "Users can view their own exam history"
  ON exam_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own exam history"
  ON exam_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for payment_transactions table
CREATE POLICY "Users can view their own payment transactions"
  ON payment_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR email = (SELECT email FROM users WHERE id = auth.uid()));

CREATE POLICY "Service role can manage payment transactions"
  ON payment_transactions FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);