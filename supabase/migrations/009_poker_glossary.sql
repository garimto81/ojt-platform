-- Migration 009: Poker Glossary (Domain Terminology Validation)
-- PRD v3.0.0 - AI Quality System
-- Created: 2025-01-17

-- Create poker_glossary table
CREATE TABLE IF NOT EXISTS poker_glossary (
  term TEXT PRIMARY KEY,
  definition TEXT NOT NULL,
  aliases TEXT[] DEFAULT '{}',
  context_examples TEXT[] DEFAULT '{}',
  category TEXT CHECK (category IN ('betting', 'hands', 'positions', 'actions', 'tournament', 'general')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_poker_glossary_category ON poker_glossary(category);
CREATE INDEX idx_poker_glossary_aliases ON poker_glossary USING GIN(aliases);

-- Enable RLS
ALTER TABLE poker_glossary ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Everyone can read glossary
CREATE POLICY "Everyone can read poker glossary"
  ON poker_glossary
  FOR SELECT
  TO authenticated
  USING (true);

-- Only admins/trainers can modify glossary
CREATE POLICY "Admins and trainers can modify glossary"
  ON poker_glossary
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role IN ('admin', 'trainer')
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role IN ('admin', 'trainer')
    )
  );

-- Function to search glossary (including aliases)
CREATE OR REPLACE FUNCTION search_poker_term(p_search_term TEXT)
RETURNS TABLE(
  term TEXT,
  definition TEXT,
  category TEXT,
  matched_by TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    g.term,
    g.definition,
    g.category,
    CASE
      WHEN LOWER(g.term) = LOWER(p_search_term) THEN 'exact_term'
      WHEN p_search_term = ANY(g.aliases) THEN 'alias'
      WHEN LOWER(g.term) LIKE LOWER('%' || p_search_term || '%') THEN 'partial_term'
      ELSE 'alias_partial'
    END as matched_by
  FROM poker_glossary g
  WHERE LOWER(g.term) = LOWER(p_search_term)
     OR p_search_term = ANY(g.aliases)
     OR LOWER(g.term) LIKE LOWER('%' || p_search_term || '%')
     OR EXISTS (
       SELECT 1 FROM unnest(g.aliases) AS alias
       WHERE LOWER(alias) LIKE LOWER('%' || p_search_term || '%')
     )
  ORDER BY
    CASE
      WHEN LOWER(g.term) = LOWER(p_search_term) THEN 1
      WHEN p_search_term = ANY(g.aliases) THEN 2
      WHEN LOWER(g.term) LIKE LOWER('%' || p_search_term || '%') THEN 3
      ELSE 4
    END;
END;
$$ LANGUAGE plpgsql;

-- Function to validate content for unknown terms
CREATE OR REPLACE FUNCTION validate_poker_content(p_content TEXT)
RETURNS TABLE(
  unknown_terms TEXT[],
  suggestion_count INTEGER
) AS $$
DECLARE
  v_words TEXT[];
  v_word TEXT;
  v_unknown_terms TEXT[] := '{}';
BEGIN
  -- Extract words from content (simple tokenization)
  v_words := regexp_split_to_array(LOWER(p_content), '\s+');

  -- Check each capitalized or poker-specific word
  FOREACH v_word IN ARRAY v_words
  LOOP
    -- Skip short words and common words
    IF LENGTH(v_word) > 3 AND v_word !~ '^[0-9]+$' THEN
      -- Check if term exists in glossary
      IF NOT EXISTS (
        SELECT 1 FROM poker_glossary g
        WHERE LOWER(g.term) = v_word
           OR v_word = ANY(g.aliases)
      ) THEN
        -- Add to unknown terms if looks like poker term (contains uppercase in original)
        IF position(upper(substring(v_word, 1, 1)) in p_content) > 0 THEN
          v_unknown_terms := array_append(v_unknown_terms, v_word);
        END IF;
      END IF;
    END IF;
  END LOOP;

  RETURN QUERY SELECT
    array_agg(DISTINCT u) FILTER (WHERE u IS NOT NULL) as unknown_terms,
    COUNT(DISTINCT u)::INTEGER as suggestion_count
  FROM unnest(v_unknown_terms) u;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_poker_glossary_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER update_poker_glossary_updated_at
  BEFORE UPDATE ON poker_glossary
  FOR EACH ROW
  EXECUTE FUNCTION update_poker_glossary_timestamp();

-- Comments
COMMENT ON TABLE poker_glossary IS 'Poker terminology dictionary (PRD v3.0.0)';
COMMENT ON COLUMN poker_glossary.aliases IS 'Alternative names (e.g., Korean translations)';
COMMENT ON COLUMN poker_glossary.context_examples IS 'Example sentences using the term';
COMMENT ON FUNCTION search_poker_term IS 'Search glossary by term or alias';
COMMENT ON FUNCTION validate_poker_content IS 'Check content for unknown poker terms';
