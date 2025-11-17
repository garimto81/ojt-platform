-- Migration 006: User Question History (Spaced Repetition System)
-- PRD v3.0.0 - SRS Quiz Algorithm (SuperMemo SM-2)
-- Created: 2025-01-17

-- Create user_question_history table for SRS tracking
CREATE TABLE IF NOT EXISTS user_question_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,

  -- Attempt tracking
  attempts INTEGER DEFAULT 0,
  consecutive_correct INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMP WITH TIME ZONE,

  -- SRS (Spaced Repetition System) fields
  next_review_at TIMESTAMP WITH TIME ZONE,
  ease_factor DECIMAL(3,2) DEFAULT 2.5, -- SM-2 algorithm
  interval_days INTEGER DEFAULT 1,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT unique_user_question UNIQUE(user_id, question_id),
  CONSTRAINT ease_factor_range CHECK (ease_factor >= 1.3 AND ease_factor <= 3.0),
  CONSTRAINT interval_positive CHECK (interval_days > 0)
);

-- Create indexes
CREATE INDEX idx_user_question_history_user_id ON user_question_history(user_id);
CREATE INDEX idx_user_question_history_question_id ON user_question_history(question_id);
CREATE INDEX idx_user_question_history_next_review ON user_question_history(next_review_at);
CREATE INDEX idx_user_question_history_user_review ON user_question_history(user_id, next_review_at);

-- Enable RLS
ALTER TABLE user_question_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only view their own history
CREATE POLICY "Users can view own question history"
  ON user_question_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert/update their own history
CREATE POLICY "Users can update own question history"
  ON user_question_history
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to update next_review_at based on SM-2 algorithm
CREATE OR REPLACE FUNCTION calculate_next_review(
  p_is_correct BOOLEAN,
  p_ease_factor DECIMAL(3,2),
  p_interval_days INTEGER,
  p_consecutive_correct INTEGER
)
RETURNS TABLE(
  new_ease_factor DECIMAL(3,2),
  new_interval_days INTEGER,
  new_next_review_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  v_ease_factor DECIMAL(3,2);
  v_interval_days INTEGER;
BEGIN
  IF p_is_correct THEN
    -- Correct answer: increase ease factor slightly
    v_ease_factor := GREATEST(1.3, p_ease_factor + 0.1);

    -- Calculate next interval based on consecutive correct answers
    CASE p_consecutive_correct
      WHEN 0 THEN v_interval_days := 1;   -- First time correct: 1 day
      WHEN 1 THEN v_interval_days := 3;   -- Second time: 3 days
      WHEN 2 THEN v_interval_days := 7;   -- Third time: 7 days
      WHEN 3 THEN v_interval_days := 14;  -- Fourth time: 14 days
      ELSE v_interval_days := ROUND(p_interval_days * v_ease_factor)::INTEGER;
    END CASE;
  ELSE
    -- Incorrect answer: decrease ease factor, reset to 1 day
    v_ease_factor := GREATEST(1.3, p_ease_factor - 0.2);
    v_interval_days := 1;
  END IF;

  -- Ensure ease factor stays within bounds
  v_ease_factor := LEAST(3.0, GREATEST(1.3, v_ease_factor));

  RETURN QUERY SELECT
    v_ease_factor,
    v_interval_days,
    (NOW() + (v_interval_days || ' days')::INTERVAL)::TIMESTAMP WITH TIME ZONE;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_question_history_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_user_question_history_updated_at
  BEFORE UPDATE ON user_question_history
  FOR EACH ROW
  EXECUTE FUNCTION update_user_question_history_timestamp();

-- Comments
COMMENT ON TABLE user_question_history IS 'SRS quiz history per user-question pair (PRD v3.0.0)';
COMMENT ON COLUMN user_question_history.ease_factor IS 'SM-2 ease factor (1.3-3.0)';
COMMENT ON COLUMN user_question_history.interval_days IS 'Days until next review';
COMMENT ON COLUMN user_question_history.next_review_at IS 'Scheduled review date (SRS)';
COMMENT ON FUNCTION calculate_next_review IS 'SuperMemo SM-2 algorithm for spaced repetition';
