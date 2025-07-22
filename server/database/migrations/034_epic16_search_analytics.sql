-- Epic 16 Search Analytics Database Schema
-- Migration: 034_epic16_search_analytics.sql
-- 
-- Comprehensive database schema for tracking search performance, user behavior,
-- and analytics for the marketplace search system.

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- ============================================================================
-- Search Events Tracking
-- ============================================================================

-- Main search events table for tracking all search queries
CREATE TABLE IF NOT EXISTS marketplace_search_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id VARCHAR(255) NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  query TEXT NOT NULL,
  filters JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  result_count INTEGER NOT NULL DEFAULT 0,
  response_time_ms INTEGER NOT NULL,
  source VARCHAR(50) NOT NULL CHECK (source IN ('elasticsearch', 'postgresql')),
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for search events
CREATE INDEX IF NOT EXISTS idx_search_events_timestamp ON marketplace_search_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_search_events_session ON marketplace_search_events(session_id);
CREATE INDEX IF NOT EXISTS idx_search_events_user ON marketplace_search_events(user_id);
CREATE INDEX IF NOT EXISTS idx_search_events_query ON marketplace_search_events(query);
CREATE INDEX IF NOT EXISTS idx_search_events_response_time ON marketplace_search_events(response_time_ms);
CREATE INDEX IF NOT EXISTS idx_search_events_result_count ON marketplace_search_events(result_count);
CREATE INDEX IF NOT EXISTS idx_search_events_filters ON marketplace_search_events USING GIN(filters);

-- Composite indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_search_events_query_performance 
  ON marketplace_search_events(query, timestamp, response_time_ms);
CREATE INDEX IF NOT EXISTS idx_search_events_session_journey 
  ON marketplace_search_events(session_id, timestamp);

-- ============================================================================
-- Search Click Tracking
-- ============================================================================

-- Track when users click on search results
CREATE TABLE IF NOT EXISTS marketplace_search_clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id VARCHAR(255) NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  query TEXT NOT NULL,
  template_id UUID REFERENCES marketplace_templates(id) ON DELETE CASCADE,
  position INTEGER NOT NULL, -- Position in search results (1-based)
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  clicked_from_search BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for click tracking
CREATE INDEX IF NOT EXISTS idx_search_clicks_timestamp ON marketplace_search_clicks(timestamp);
CREATE INDEX IF NOT EXISTS idx_search_clicks_session ON marketplace_search_clicks(session_id);
CREATE INDEX IF NOT EXISTS idx_search_clicks_template ON marketplace_search_clicks(template_id);
CREATE INDEX IF NOT EXISTS idx_search_clicks_query ON marketplace_search_clicks(query);
CREATE INDEX IF NOT EXISTS idx_search_clicks_position ON marketplace_search_clicks(position);

-- Composite indexes for CTR analysis
CREATE INDEX IF NOT EXISTS idx_search_clicks_ctr_analysis 
  ON marketplace_search_clicks(query, timestamp, position);
CREATE INDEX IF NOT EXISTS idx_search_clicks_template_performance 
  ON marketplace_search_clicks(template_id, position, timestamp);

-- ============================================================================
-- Search Abandonment Tracking
-- ============================================================================

-- Track when users abandon searches
CREATE TABLE IF NOT EXISTS marketplace_search_abandonments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id VARCHAR(255) NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  query TEXT NOT NULL,
  time_spent_ms INTEGER NOT NULL, -- Time spent on search results page
  scroll_depth INTEGER NOT NULL DEFAULT 0, -- Percentage scrolled (0-100)
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reason VARCHAR(50) NOT NULL CHECK (reason IN ('no_results', 'irrelevant_results', 'timeout', 'navigation')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for abandonment tracking
CREATE INDEX IF NOT EXISTS idx_search_abandonments_timestamp ON marketplace_search_abandonments(timestamp);
CREATE INDEX IF NOT EXISTS idx_search_abandonments_session ON marketplace_search_abandonments(session_id);
CREATE INDEX IF NOT EXISTS idx_search_abandonments_query ON marketplace_search_abandonments(query);
CREATE INDEX IF NOT EXISTS idx_search_abandonments_reason ON marketplace_search_abandonments(reason);

-- ============================================================================
-- A/B Testing Framework
-- ============================================================================

-- A/B tests for search ranking and features
CREATE TABLE IF NOT EXISTS marketplace_search_ab_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  variant_a JSONB NOT NULL, -- Configuration for variant A
  variant_b JSONB NOT NULL, -- Configuration for variant B
  traffic_split DECIMAL(3,2) NOT NULL DEFAULT 0.5 CHECK (traffic_split BETWEEN 0 AND 1),
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- A/B test assignments
CREATE TABLE IF NOT EXISTS marketplace_search_ab_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id UUID REFERENCES marketplace_search_ab_tests(id) ON DELETE CASCADE,
  session_id VARCHAR(255) NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  variant CHAR(1) NOT NULL CHECK (variant IN ('A', 'B')),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(test_id, session_id)
);

-- Indexes for A/B testing
CREATE INDEX IF NOT EXISTS idx_ab_tests_status ON marketplace_search_ab_tests(status);
CREATE INDEX IF NOT EXISTS idx_ab_assignments_test ON marketplace_search_ab_assignments(test_id);
CREATE INDEX IF NOT EXISTS idx_ab_assignments_session ON marketplace_search_ab_assignments(session_id);

-- ============================================================================
-- Search Performance Metrics Views
-- ============================================================================

-- Real-time search performance view
CREATE OR REPLACE VIEW search_performance_realtime AS
SELECT 
  DATE_TRUNC('hour', timestamp) as hour,
  COUNT(*) as total_searches,
  AVG(response_time_ms) as avg_response_time,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY response_time_ms) as median_response_time,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY response_time_ms) as p95_response_time,
  PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY response_time_ms) as p99_response_time,
  COUNT(*) FILTER (WHERE result_count > 0)::float / COUNT(*) as success_rate,
  COUNT(*) FILTER (WHERE source = 'elasticsearch')::float / COUNT(*) as elasticsearch_rate
FROM marketplace_search_events
WHERE timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', timestamp)
ORDER BY hour DESC;

-- Search query performance analysis view
CREATE OR REPLACE VIEW search_query_performance AS
SELECT 
  query,
  COUNT(*) as search_count,
  AVG(response_time_ms) as avg_response_time,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY response_time_ms) as p95_response_time,
  AVG(result_count) as avg_result_count,
  COUNT(*) FILTER (WHERE result_count = 0)::float / COUNT(*) as zero_results_rate,
  COUNT(DISTINCT session_id) as unique_sessions,
  MIN(timestamp) as first_seen,
  MAX(timestamp) as last_seen
FROM marketplace_search_events
WHERE timestamp >= NOW() - INTERVAL '7 days'
  AND query IS NOT NULL 
  AND query != ''
GROUP BY query
HAVING COUNT(*) >= 3
ORDER BY search_count DESC;

-- Click-through rate analysis view
CREATE OR REPLACE VIEW search_ctr_analysis AS
SELECT 
  s.query,
  COUNT(DISTINCT s.session_id) as total_searches,
  COUNT(DISTINCT c.session_id) as searches_with_clicks,
  COUNT(c.id) as total_clicks,
  COUNT(DISTINCT c.session_id)::float / COUNT(DISTINCT s.session_id) as click_through_rate,
  AVG(c.position) as avg_click_position,
  COUNT(c.id)::float / COUNT(DISTINCT s.session_id) as clicks_per_search
FROM marketplace_search_events s
LEFT JOIN marketplace_search_clicks c ON s.session_id = c.session_id 
  AND s.query = c.query
  AND c.timestamp BETWEEN s.timestamp AND s.timestamp + INTERVAL '1 hour'
WHERE s.timestamp >= NOW() - INTERVAL '7 days'
  AND s.query IS NOT NULL 
  AND s.query != ''
GROUP BY s.query
HAVING COUNT(DISTINCT s.session_id) >= 5
ORDER BY click_through_rate DESC;

-- Template performance in search results
CREATE OR REPLACE VIEW template_search_performance AS
SELECT 
  t.id as template_id,
  t.title,
  COUNT(c.id) as total_clicks,
  AVG(c.position) as avg_position,
  COUNT(DISTINCT c.session_id) as unique_clickers,
  COUNT(DISTINCT c.query) as appeared_in_queries,
  MIN(c.position) as best_position,
  COUNT(c.id) FILTER (WHERE c.position <= 3)::float / COUNT(c.id) as top3_click_rate
FROM marketplace_templates t
JOIN marketplace_search_clicks c ON t.id = c.template_id
WHERE c.timestamp >= NOW() - INTERVAL '7 days'
GROUP BY t.id, t.title
HAVING COUNT(c.id) >= 5
ORDER BY total_clicks DESC;

-- ============================================================================
-- Search Analytics Functions
-- ============================================================================

-- Function to calculate search conversion funnel
CREATE OR REPLACE FUNCTION get_search_conversion_funnel(
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ
) RETURNS TABLE (
  total_searches BIGINT,
  searches_with_clicks BIGINT,
  searches_with_previews BIGINT,
  searches_with_purchases BIGINT,
  conversion_rate DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH search_sessions AS (
    SELECT DISTINCT session_id
    FROM marketplace_search_events
    WHERE timestamp BETWEEN start_date AND end_date
  ),
  clicks AS (
    SELECT DISTINCT s.session_id
    FROM search_sessions s
    JOIN marketplace_search_clicks c ON s.session_id = c.session_id
    WHERE c.timestamp BETWEEN start_date AND end_date
  ),
  previews AS (
    SELECT DISTINCT s.session_id
    FROM search_sessions s
    JOIN marketplace_events e ON s.session_id = e.session_id
    WHERE e.event_type = 'preview'
      AND e.timestamp BETWEEN start_date AND end_date
  ),
  purchases AS (
    SELECT DISTINCT s.session_id
    FROM search_sessions s
    JOIN marketplace_events e ON s.session_id = e.session_id
    WHERE e.event_type = 'purchase'
      AND e.timestamp BETWEEN start_date AND end_date
  )
  SELECT 
    (SELECT COUNT(*) FROM search_sessions)::BIGINT,
    (SELECT COUNT(*) FROM clicks)::BIGINT,
    (SELECT COUNT(*) FROM previews)::BIGINT,
    (SELECT COUNT(*) FROM purchases)::BIGINT,
    CASE 
      WHEN (SELECT COUNT(*) FROM search_sessions) > 0 
      THEN (SELECT COUNT(*) FROM purchases)::DECIMAL / (SELECT COUNT(*) FROM search_sessions)::DECIMAL
      ELSE 0
    END;
END;
$$ LANGUAGE plpgsql;

-- Function to get search performance alerts
CREATE OR REPLACE FUNCTION get_search_performance_alerts()
RETURNS TABLE (
  alert_type VARCHAR,
  message TEXT,
  severity VARCHAR,
  metric_value DECIMAL,
  threshold DECIMAL,
  detected_at TIMESTAMPTZ
) AS $$
BEGIN
  -- Slow query alerts
  RETURN QUERY
  SELECT 
    'slow_queries'::VARCHAR,
    'Query "' || query || '" has high average response time'::TEXT,
    CASE 
      WHEN avg_response_time > 2000 THEN 'critical'
      WHEN avg_response_time > 1000 THEN 'warning'
      ELSE 'info'
    END::VARCHAR,
    avg_response_time,
    1000.0,
    NOW()
  FROM search_query_performance
  WHERE avg_response_time > 1000
    AND search_count >= 5;

  -- High zero results rate alerts
  RETURN QUERY
  SELECT 
    'zero_results'::VARCHAR,
    'Query "' || query || '" has high zero results rate'::TEXT,
    CASE 
      WHEN zero_results_rate > 0.8 THEN 'critical'
      WHEN zero_results_rate > 0.5 THEN 'warning'
      ELSE 'info'
    END::VARCHAR,
    zero_results_rate,
    0.5,
    NOW()
  FROM search_query_performance
  WHERE zero_results_rate > 0.5
    AND search_count >= 10;

  -- Low CTR alerts
  RETURN QUERY
  SELECT 
    'low_ctr'::VARCHAR,
    'Query "' || query || '" has low click-through rate'::TEXT,
    CASE 
      WHEN click_through_rate < 0.1 THEN 'warning'
      ELSE 'info'
    END::VARCHAR,
    click_through_rate,
    0.2,
    NOW()
  FROM search_ctr_analysis
  WHERE click_through_rate < 0.2
    AND total_searches >= 20;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Search Index Management
-- ============================================================================

-- Search index status tracking
CREATE TABLE IF NOT EXISTS marketplace_search_index_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  index_name VARCHAR(255) NOT NULL,
  operation VARCHAR(50) NOT NULL, -- 'rebuild', 'update', 'optimize'
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  documents_processed INTEGER DEFAULT 0,
  total_documents INTEGER DEFAULT 0,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for search index operations
CREATE INDEX IF NOT EXISTS idx_search_index_status_name ON marketplace_search_index_status(index_name);
CREATE INDEX IF NOT EXISTS idx_search_index_status_operation ON marketplace_search_index_status(operation, status);

-- ============================================================================
-- Search Cache Performance
-- ============================================================================

-- Search cache hit/miss tracking
CREATE TABLE IF NOT EXISTS marketplace_search_cache_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cache_key VARCHAR(255) NOT NULL,
  query_hash VARCHAR(64) NOT NULL, -- Hash of query + filters
  hit_count INTEGER NOT NULL DEFAULT 0,
  miss_count INTEGER NOT NULL DEFAULT 0,
  total_response_time_ms INTEGER NOT NULL DEFAULT 0,
  cached_response_time_ms INTEGER NOT NULL DEFAULT 0,
  last_hit_at TIMESTAMPTZ,
  last_miss_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for cache performance
CREATE INDEX IF NOT EXISTS idx_search_cache_key ON marketplace_search_cache_stats(cache_key);
CREATE INDEX IF NOT EXISTS idx_search_cache_hash ON marketplace_search_cache_stats(query_hash);
CREATE INDEX IF NOT EXISTS idx_search_cache_performance ON marketplace_search_cache_stats(hit_count, miss_count);

-- ============================================================================
-- Automated Cleanup and Maintenance
-- ============================================================================

-- Function to clean up old analytics data
CREATE OR REPLACE FUNCTION cleanup_search_analytics(retention_days INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER := 0;
  cutoff_date TIMESTAMPTZ := NOW() - (retention_days || ' days')::INTERVAL;
BEGIN
  -- Clean up old search events
  DELETE FROM marketplace_search_events 
  WHERE timestamp < cutoff_date;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Clean up old click events
  DELETE FROM marketplace_search_clicks 
  WHERE timestamp < cutoff_date;
  
  -- Clean up old abandonment events
  DELETE FROM marketplace_search_abandonments 
  WHERE timestamp < cutoff_date;
  
  -- Clean up old cache stats
  DELETE FROM marketplace_search_cache_stats 
  WHERE updated_at < cutoff_date;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Schedule automated cleanup (requires pg_cron extension)
-- SELECT cron.schedule('search-analytics-cleanup', '0 2 * * 0', 'SELECT cleanup_search_analytics(90);');

-- ============================================================================
-- Initial Data and Configuration
-- ============================================================================

-- Insert default search index status
INSERT INTO marketplace_search_index_status (
  index_name, operation, status, metadata
) VALUES (
  'marketplace_templates', 'initial_setup', 'completed',
  '{"description": "Initial search index setup", "version": "1.0"}'
) ON CONFLICT DO NOTHING;

-- Create initial A/B test for search ranking
INSERT INTO marketplace_search_ab_tests (
  name, description, variant_a, variant_b, traffic_split, status
) VALUES (
  'relevance_vs_popularity',
  'Test relevance-based ranking vs popularity-based ranking',
  '{"ranking": "relevance", "boost_factors": {"title": 3, "description": 2, "tags": 2}}',
  '{"ranking": "popularity", "boost_factors": {"total_purchases": 3, "avg_rating": 2, "featured": 5}}',
  0.5,
  'active'
) ON CONFLICT (name) DO NOTHING;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO marketplace_service;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO marketplace_service;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO marketplace_service;

-- Update search statistics
ANALYZE marketplace_search_events;
ANALYZE marketplace_search_clicks;
ANALYZE marketplace_search_abandonments;