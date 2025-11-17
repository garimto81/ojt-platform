-- Migration 007: AI Processing Logs (Cost Tracking & Debugging)
-- PRD v3.0.0 - Cost Management & Monitoring
-- Created: 2025-01-17

-- Create ai_processing_logs table
CREATE TABLE IF NOT EXISTS ai_processing_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Entity information
  entity_type TEXT NOT NULL CHECK (entity_type IN ('lesson', 'quiz')),
  entity_id UUID NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('content_cleanup', 'quiz_generation')),

  -- Input/Output
  input_text TEXT NOT NULL,
  output_text TEXT,

  -- AI Model information
  model_used TEXT DEFAULT 'gemini-1.5-flash',
  confidence_score DECIMAL(5,2) CHECK (confidence_score >= 0 AND confidence_score <= 100),

  -- Performance & Cost
  processing_time_ms INTEGER,
  tokens_used INTEGER,
  cost_usd DECIMAL(10,4),

  -- Status
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'partial')),
  error_message TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_ai_logs_entity ON ai_processing_logs(entity_type, entity_id);
CREATE INDEX idx_ai_logs_created_at ON ai_processing_logs(created_at DESC);
CREATE INDEX idx_ai_logs_status ON ai_processing_logs(status);
CREATE INDEX idx_ai_logs_operation ON ai_processing_logs(operation);
CREATE INDEX idx_ai_logs_cost ON ai_processing_logs(cost_usd DESC);

-- Enable RLS
ALTER TABLE ai_processing_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Only admins/trainers can view logs
CREATE POLICY "Admins and trainers can view AI logs"
  ON ai_processing_logs
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role IN ('admin', 'trainer')
    )
  );

-- System can insert logs (service role)
CREATE POLICY "Service role can insert AI logs"
  ON ai_processing_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Create materialized view for cost analytics
CREATE MATERIALIZED VIEW ai_cost_analytics AS
SELECT
  DATE(created_at) as date,
  operation,
  COUNT(*) as total_operations,
  COUNT(*) FILTER (WHERE status = 'success') as successful_operations,
  COUNT(*) FILTER (WHERE status = 'failed') as failed_operations,
  SUM(tokens_used) as total_tokens,
  SUM(cost_usd) as total_cost_usd,
  AVG(processing_time_ms) as avg_processing_time_ms,
  AVG(confidence_score) FILTER (WHERE confidence_score IS NOT NULL) as avg_confidence_score
FROM ai_processing_logs
GROUP BY DATE(created_at), operation
ORDER BY date DESC, operation;

-- Create index on materialized view
CREATE INDEX idx_ai_cost_analytics_date ON ai_cost_analytics(date DESC);

-- Function to refresh analytics
CREATE OR REPLACE FUNCTION refresh_ai_cost_analytics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY ai_cost_analytics;
END;
$$ LANGUAGE plpgsql;

-- Function to get daily cost summary
CREATE OR REPLACE FUNCTION get_daily_ai_cost()
RETURNS TABLE(
  date DATE,
  total_cost DECIMAL(10,2),
  operations_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(created_at) as date,
    ROUND(SUM(cost_usd)::DECIMAL, 2) as total_cost,
    COUNT(*)::INTEGER as operations_count
  FROM ai_processing_logs
  WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY DATE(created_at)
  ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to check budget alert
CREATE OR REPLACE FUNCTION check_daily_budget_alert(
  p_budget_limit DECIMAL DEFAULT 50.00
)
RETURNS TABLE(
  alert BOOLEAN,
  current_cost DECIMAL(10,2),
  budget_limit DECIMAL(10,2),
  percentage DECIMAL(5,2)
) AS $$
DECLARE
  v_current_cost DECIMAL(10,2);
BEGIN
  SELECT COALESCE(SUM(cost_usd), 0)
  INTO v_current_cost
  FROM ai_processing_logs
  WHERE DATE(created_at) = CURRENT_DATE;

  RETURN QUERY SELECT
    (v_current_cost >= p_budget_limit) as alert,
    v_current_cost,
    p_budget_limit,
    ROUND((v_current_cost / NULLIF(p_budget_limit, 0) * 100)::DECIMAL, 2) as percentage;
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON TABLE ai_processing_logs IS 'AI processing logs with cost tracking (PRD v3.0.0)';
COMMENT ON COLUMN ai_processing_logs.cost_usd IS 'API cost in USD';
COMMENT ON COLUMN ai_processing_logs.confidence_score IS 'AI confidence score (0-100)';
COMMENT ON VIEW ai_cost_analytics IS 'Daily AI cost and performance analytics';
COMMENT ON FUNCTION get_daily_ai_cost IS 'Get daily AI costs for last 30 days';
COMMENT ON FUNCTION check_daily_budget_alert IS 'Check if daily budget limit exceeded';
