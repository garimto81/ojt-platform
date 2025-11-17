-- Migration 008: Content Creation Metrics (Measurable Success Indicators)
-- PRD v3.0.0 - Success Metrics Section
-- Created: 2025-01-17

-- Create content_creation_metrics table
CREATE TABLE IF NOT EXISTS content_creation_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Trainer and lesson information
  trainer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,

  -- Time tracking
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  saved_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER GENERATED ALWAYS AS (
    EXTRACT(EPOCH FROM (saved_at - started_at)) / 60
  ) STORED,

  -- AI usage
  ai_used BOOLEAN DEFAULT false,
  edit_count INTEGER DEFAULT 0, -- Number of times AI result was edited

  -- Content metrics
  final_word_count INTEGER,

  -- Quality feedback
  satisfaction_score INTEGER CHECK (satisfaction_score >= 1 AND satisfaction_score <= 5),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_content_metrics_trainer ON content_creation_metrics(trainer_id);
CREATE INDEX idx_content_metrics_lesson ON content_creation_metrics(lesson_id);
CREATE INDEX idx_content_metrics_created_at ON content_creation_metrics(created_at DESC);
CREATE INDEX idx_content_metrics_ai_used ON content_creation_metrics(ai_used);

-- Enable RLS
ALTER TABLE content_creation_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Trainers can view their own metrics
CREATE POLICY "Trainers can view own metrics"
  ON content_creation_metrics
  FOR SELECT
  TO authenticated
  USING (auth.uid() = trainer_id);

-- Admins can view all metrics
CREATE POLICY "Admins can view all metrics"
  ON content_creation_metrics
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- Trainers can insert their own metrics
CREATE POLICY "Trainers can insert own metrics"
  ON content_creation_metrics
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = trainer_id);

-- Function to calculate AI effectiveness
CREATE OR REPLACE FUNCTION get_ai_effectiveness_metrics()
RETURNS TABLE(
  metric_name TEXT,
  ai_enabled DECIMAL(10,2),
  manual DECIMAL(10,2),
  improvement_percentage DECIMAL(5,2)
) AS $$
BEGIN
  RETURN QUERY
  -- Average duration
  WITH stats AS (
    SELECT
      AVG(duration_minutes) FILTER (WHERE ai_used = true) as ai_avg_duration,
      AVG(duration_minutes) FILTER (WHERE ai_used = false) as manual_avg_duration,
      AVG(satisfaction_score) FILTER (WHERE ai_used = true) as ai_avg_satisfaction,
      AVG(satisfaction_score) FILTER (WHERE ai_used = false) as manual_avg_satisfaction,
      AVG(edit_count) FILTER (WHERE ai_used = true) as ai_avg_edits
    FROM content_creation_metrics
    WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
  )
  SELECT 'avg_duration_minutes'::TEXT,
         ROUND(ai_avg_duration::DECIMAL, 2),
         ROUND(manual_avg_duration::DECIMAL, 2),
         ROUND(((manual_avg_duration - ai_avg_duration) / NULLIF(manual_avg_duration, 0) * 100)::DECIMAL, 2)
  FROM stats
  UNION ALL
  SELECT 'avg_satisfaction_score'::TEXT,
         ROUND(ai_avg_satisfaction::DECIMAL, 2),
         ROUND(manual_avg_satisfaction::DECIMAL, 2),
         ROUND(((ai_avg_satisfaction - manual_avg_satisfaction) / NULLIF(manual_avg_satisfaction, 0) * 100)::DECIMAL, 2)
  FROM stats
  UNION ALL
  SELECT 'avg_edit_count'::TEXT,
         ROUND(ai_avg_edits::DECIMAL, 2),
         0::DECIMAL,
         NULL::DECIMAL
  FROM stats;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate AI acceptance rate
CREATE OR REPLACE FUNCTION get_ai_acceptance_rate()
RETURNS TABLE(
  total_ai_sessions INTEGER,
  zero_edits INTEGER,
  acceptance_rate DECIMAL(5,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER as total_ai_sessions,
    COUNT(*) FILTER (WHERE edit_count = 0)::INTEGER as zero_edits,
    ROUND((COUNT(*) FILTER (WHERE edit_count = 0)::DECIMAL / NULLIF(COUNT(*), 0) * 100)::DECIMAL, 2) as acceptance_rate
  FROM content_creation_metrics
  WHERE ai_used = true
    AND created_at >= CURRENT_DATE - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON TABLE content_creation_metrics IS 'Content creation time tracking (PRD v3.0.0)';
COMMENT ON COLUMN content_creation_metrics.duration_minutes IS 'Auto-calculated from saved_at - started_at';
COMMENT ON COLUMN content_creation_metrics.edit_count IS 'Number of edits to AI-generated content';
COMMENT ON COLUMN content_creation_metrics.satisfaction_score IS 'Trainer satisfaction rating (1-5)';
COMMENT ON FUNCTION get_ai_effectiveness_metrics IS 'Compare AI vs manual content creation';
COMMENT ON FUNCTION get_ai_acceptance_rate IS 'Calculate AI result acceptance rate';
