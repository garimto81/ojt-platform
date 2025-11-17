-- Migration 010: AI Confidence Score (Lessons Table Extension)
-- PRD v3.0.0 - AI Quality System
-- Created: 2025-01-17

-- Add ai_confidence_score column to lessons table
ALTER TABLE lessons
ADD COLUMN IF NOT EXISTS ai_confidence_score DECIMAL(5,2) CHECK (ai_confidence_score >= 0 AND ai_confidence_score <= 100);

-- Create index for filtering by confidence
CREATE INDEX IF NOT EXISTS idx_lessons_ai_confidence ON lessons(ai_confidence_score DESC);

-- Create index for AI processed lessons
CREATE INDEX IF NOT EXISTS idx_lessons_ai_processed ON lessons(ai_processed) WHERE ai_processed = true;

-- Function to categorize confidence level
CREATE OR REPLACE FUNCTION get_confidence_level(p_score DECIMAL)
RETURNS TEXT AS $$
BEGIN
  RETURN CASE
    WHEN p_score IS NULL THEN 'not_processed'
    WHEN p_score >= 90 THEN 'excellent'  -- Can save immediately
    WHEN p_score >= 70 THEN 'good'       -- Review recommended
    WHEN p_score >= 50 THEN 'fair'       -- Manual editing needed
    ELSE 'poor'                          -- Major revisions required
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get lesson stats by confidence level
CREATE OR REPLACE FUNCTION get_lesson_confidence_stats()
RETURNS TABLE(
  confidence_level TEXT,
  lesson_count INTEGER,
  percentage DECIMAL(5,2)
) AS $$
BEGIN
  RETURN QUERY
  WITH stats AS (
    SELECT
      get_confidence_level(ai_confidence_score) as level,
      COUNT(*) as count
    FROM lessons
    WHERE ai_processed = true
    GROUP BY get_confidence_level(ai_confidence_score)
  ),
  total AS (
    SELECT SUM(count)::INTEGER as total_count
    FROM stats
  )
  SELECT
    s.level,
    s.count::INTEGER,
    ROUND((s.count::DECIMAL / NULLIF(t.total_count, 0) * 100)::DECIMAL, 2) as percentage
  FROM stats s, total t
  ORDER BY
    CASE s.level
      WHEN 'excellent' THEN 1
      WHEN 'good' THEN 2
      WHEN 'fair' THEN 3
      WHEN 'poor' THEN 4
      ELSE 5
    END;
END;
$$ LANGUAGE plpgsql;

-- Function to recommend lessons for review
CREATE OR REPLACE FUNCTION get_lessons_for_review(
  p_min_confidence DECIMAL DEFAULT 70,
  p_max_confidence DECIMAL DEFAULT 90
)
RETURNS TABLE(
  lesson_id UUID,
  title TEXT,
  confidence_score DECIMAL(5,2),
  confidence_level TEXT,
  ai_processed_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.id as lesson_id,
    l.title,
    l.ai_confidence_score,
    get_confidence_level(l.ai_confidence_score) as confidence_level,
    l.ai_processed_at
  FROM lessons l
  WHERE l.ai_processed = true
    AND l.ai_confidence_score >= p_min_confidence
    AND l.ai_confidence_score < p_max_confidence
  ORDER BY l.ai_confidence_score DESC, l.ai_processed_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Update existing lessons to have NULL confidence score (not yet processed)
UPDATE lessons
SET ai_confidence_score = NULL
WHERE ai_processed = false OR ai_processed IS NULL;

-- Comments
COMMENT ON COLUMN lessons.ai_confidence_score IS 'AI processing confidence (0-100), NULL if not processed';
COMMENT ON FUNCTION get_confidence_level IS 'Categorize confidence score: excellent/good/fair/poor';
COMMENT ON FUNCTION get_lesson_confidence_stats IS 'Distribution of lessons by confidence level';
COMMENT ON FUNCTION get_lessons_for_review IS 'Get lessons needing manual review based on confidence';
