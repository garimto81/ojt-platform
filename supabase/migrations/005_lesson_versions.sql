-- Migration 005: Lesson Versions (Content Version Control)
-- PRD v3.0.0 - AI Quality System
-- Created: 2025-01-17

-- Create lesson_versions table for tracking content changes
CREATE TABLE IF NOT EXISTS lesson_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  content TEXT NOT NULL,
  raw_content TEXT,
  ai_processed BOOLEAN DEFAULT false,
  change_summary TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT unique_lesson_version UNIQUE(lesson_id, version)
);

-- Create index for faster queries
CREATE INDEX idx_lesson_versions_lesson_id ON lesson_versions(lesson_id);
CREATE INDEX idx_lesson_versions_created_at ON lesson_versions(created_at DESC);

-- Enable RLS
ALTER TABLE lesson_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Trainers can view all versions of their lessons
CREATE POLICY "Trainers can view lesson versions"
  ON lesson_versions
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role IN ('trainer', 'admin')
    )
  );

-- Only trainers/admins can insert new versions
CREATE POLICY "Trainers can create lesson versions"
  ON lesson_versions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role IN ('trainer', 'admin')
    )
  );

-- Function to auto-increment version number
CREATE OR REPLACE FUNCTION increment_lesson_version()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-assign next version number
  SELECT COALESCE(MAX(version), 0) + 1
  INTO NEW.version
  FROM lesson_versions
  WHERE lesson_id = NEW.lesson_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-increment version
CREATE TRIGGER auto_increment_lesson_version
  BEFORE INSERT ON lesson_versions
  FOR EACH ROW
  EXECUTE FUNCTION increment_lesson_version();

-- Comments
COMMENT ON TABLE lesson_versions IS 'Version history for lesson content (PRD v3.0.0)';
COMMENT ON COLUMN lesson_versions.version IS 'Auto-incremented version number per lesson';
COMMENT ON COLUMN lesson_versions.change_summary IS 'Description of changes (e.g., "AI processed", "Manual edit")';
