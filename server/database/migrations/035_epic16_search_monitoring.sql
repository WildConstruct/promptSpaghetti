-- Epic 16 Search Monitoring Database Schema
-- Migration: 035_epic16_search_monitoring.sql
-- 
-- Database schema for search performance monitoring, alerting,
-- and optimization tracking for the marketplace search system.

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Search Performance Alerts
-- ============================================================================

-- Table for tracking search performance alerts
CREATE TABLE IF NOT EXISTS marketplace_search_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(50) NOT NULL CHECK (type IN ('performance', 'availability', 'error_rate', 'user_experience')),
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  metric VARCHAR(100) NOT NULL,
  current_value DECIMAL(10,4) NOT NULL,
  threshold DECIMAL(10,4) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  actions JSONB, -- Array of recommended actions
  metadata JSONB, -- Additional alert context
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for alerts
CREATE INDEX IF NOT EXISTS idx_search_alerts_type ON marketplace_search_alerts(type);
CREATE INDEX IF NOT EXISTS idx_search_alerts_severity ON marketplace_search_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_search_alerts_resolved ON marketplace_search_alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_search_alerts_timestamp ON marketplace_search_alerts(timestamp);
CREATE INDEX IF NOT EXISTS idx_search_alerts_metric ON marketplace_search_alerts(metric);

-- Composite indexes for alert queries
CREATE INDEX IF NOT EXISTS idx_search_alerts_active 
  ON marketplace_search_alerts(resolved, severity, timestamp) WHERE resolved = false;

-- ============================================================================
-- Search Infrastructure Health Monitoring
-- ============================================================================

-- Health check results for search infrastructure components
CREATE TABLE IF NOT EXISTS marketplace_search_health_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service VARCHAR(100) NOT NULL, -- 'elasticsearch', 'postgresql', 'redis', etc.
  status VARCHAR(20) NOT NULL CHECK (status IN ('healthy', 'degraded', 'unhealthy')),
  response_time_ms INTEGER NOT NULL,
  message TEXT,
  details JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for health checks
CREATE INDEX IF NOT EXISTS idx_search_health_service ON marketplace_search_health_checks(service);
CREATE INDEX IF NOT EXISTS idx_search_health_status ON marketplace_search_health_checks(status);
CREATE INDEX IF NOT EXISTS idx_search_health_timestamp ON marketplace_search_health_checks(timestamp);

-- Composite index for service health trends
CREATE INDEX IF NOT EXISTS idx_search_health_service_time 
  ON marketplace_search_health_checks(service, timestamp);

-- ============================================================================
-- Search Performance Metrics Storage
-- ============================================================================

-- Aggregated performance metrics for historical analysis
CREATE TABLE IF NOT EXISTS marketplace_search_performance_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  granularity VARCHAR(20) NOT NULL CHECK (granularity IN ('minute', 'hour', 'day')),
  
  -- Latency metrics
  latency_p50 DECIMAL(8,2),
  latency_p95 DECIMAL(8,2),
  latency_p99 DECIMAL(8,2),
  latency_avg DECIMAL(8,2),
  
  -- Throughput metrics
  total_searches INTEGER NOT NULL DEFAULT 0,
  searches_per_second DECIMAL(8,2),
  
  -- Success metrics
  successful_searches INTEGER NOT NULL DEFAULT 0,
  zero_result_searches INTEGER NOT NULL DEFAULT 0,
  success_rate DECIMAL(5,4),
  
  -- Error metrics
  error_count INTEGER NOT NULL DEFAULT 0,
  error_rate DECIMAL(5,4),
  
  -- User experience metrics
  total_clicks INTEGER NOT NULL DEFAULT 0,
  click_through_rate DECIMAL(5,4),
  abandonment_count INTEGER NOT NULL DEFAULT 0,
  abandonment_rate DECIMAL(5,4),
  
  -- Infrastructure metrics
  elasticsearch_health VARCHAR(20),
  postgresql_health VARCHAR(20),
  redis_health VARCHAR(20),
  cache_hit_rate DECIMAL(5,4),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance metrics
CREATE INDEX IF NOT EXISTS idx_search_metrics_period ON marketplace_search_performance_metrics(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_search_metrics_granularity ON marketplace_search_performance_metrics(granularity);
CREATE INDEX IF NOT EXISTS idx_search_metrics_latency ON marketplace_search_performance_metrics(latency_p95);
CREATE INDEX IF NOT EXISTS idx_search_metrics_success ON marketplace_search_performance_metrics(success_rate);

-- Unique constraint to prevent duplicate metrics
CREATE UNIQUE INDEX IF NOT EXISTS idx_search_metrics_unique 
  ON marketplace_search_performance_metrics(period_start, granularity);

-- ============================================================================
-- Search Optimization Tracking
-- ============================================================================

-- Track search optimization initiatives and their impact
CREATE TABLE IF NOT EXISTS marketplace_search_optimizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL CHECK (category IN ('index', 'query', 'cache', 'infrastructure')),
  priority VARCHAR(20) NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status VARCHAR(30) NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
  
  -- Implementation details
  implementation_details JSONB,
  estimated_impact TEXT,
  actual_impact TEXT,
  
  -- Metrics before and after
  baseline_metrics JSONB,
  post_implementation_metrics JSONB,
  
  -- Timeline
  planned_start_date TIMESTAMPTZ,
  actual_start_date TIMESTAMPTZ,
  planned_completion_date TIMESTAMPTZ,
  actual_completion_date TIMESTAMPTZ,
  
  -- Ownership
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for optimizations
CREATE INDEX IF NOT EXISTS idx_search_optimizations_status ON marketplace_search_optimizations(status);
CREATE INDEX IF NOT EXISTS idx_search_optimizations_priority ON marketplace_search_optimizations(priority);
CREATE INDEX IF NOT EXISTS idx_search_optimizations_category ON marketplace_search_optimizations(category);
CREATE INDEX IF NOT EXISTS idx_search_optimizations_assigned ON marketplace_search_optimizations(assigned_to);

-- ============================================================================
-- Search Configuration Management
-- ============================================================================

-- Track search configuration changes and their impact
CREATE TABLE IF NOT EXISTS marketplace_search_configurations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  component VARCHAR(100) NOT NULL, -- 'elasticsearch', 'cache', 'ranking', etc.
  configuration_key VARCHAR(255) NOT NULL,
  previous_value JSONB,
  new_value JSONB,
  reason TEXT,
  
  -- Change tracking
  changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  change_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  rollback_timestamp TIMESTAMPTZ,
  rolled_back_by UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Impact tracking
  performance_impact JSONB,
  monitoring_period_hours INTEGER DEFAULT 24,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for configuration tracking
CREATE INDEX IF NOT EXISTS idx_search_config_component ON marketplace_search_configurations(component);
CREATE INDEX IF NOT EXISTS idx_search_config_timestamp ON marketplace_search_configurations(change_timestamp);
CREATE INDEX IF NOT EXISTS idx_search_config_changed_by ON marketplace_search_configurations(changed_by);

-- ============================================================================
-- Search Performance Baselines
-- ============================================================================

-- Store performance baselines for comparison
CREATE TABLE IF NOT EXISTS marketplace_search_baselines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  baseline_name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  baseline_type VARCHAR(50) NOT NULL CHECK (baseline_type IN ('daily', 'weekly', 'monthly', 'release')),
  
  -- Baseline metrics
  avg_latency_ms DECIMAL(8,2) NOT NULL,
  p95_latency_ms DECIMAL(8,2) NOT NULL,
  p99_latency_ms DECIMAL(8,2) NOT NULL,
  success_rate DECIMAL(5,4) NOT NULL,
  click_through_rate DECIMAL(5,4) NOT NULL,
  error_rate DECIMAL(5,4) NOT NULL,
  cache_hit_rate DECIMAL(5,4) NOT NULL,
  
  -- Context
  measurement_period_start TIMESTAMPTZ NOT NULL,
  measurement_period_end TIMESTAMPTZ NOT NULL,
  total_searches INTEGER NOT NULL,
  
  -- Metadata
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for baselines
CREATE INDEX IF NOT EXISTS idx_search_baselines_type ON marketplace_search_baselines(baseline_type);
CREATE INDEX IF NOT EXISTS idx_search_baselines_created ON marketplace_search_baselines(created_at);

-- ============================================================================
-- Views for Monitoring Dashboards
-- ============================================================================

-- Real-time search performance overview
CREATE OR REPLACE VIEW search_performance_overview AS
SELECT 
  'current' as period,
  COUNT(*) as total_searches,
  AVG(response_time_ms) as avg_latency,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY response_time_ms) as p95_latency,
  COUNT(*) FILTER (WHERE result_count > 0)::float / COUNT(*) as success_rate,
  COUNT(*) FILTER (WHERE source = 'elasticsearch')::float / COUNT(*) as elasticsearch_usage,
  DATE_TRUNC('hour', NOW()) as period_start,
  NOW() as period_end
FROM marketplace_search_events
WHERE timestamp >= NOW() - INTERVAL '1 hour'

UNION ALL

SELECT 
  'previous' as period,
  COUNT(*) as total_searches,
  AVG(response_time_ms) as avg_latency,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY response_time_ms) as p95_latency,
  COUNT(*) FILTER (WHERE result_count > 0)::float / COUNT(*) as success_rate,
  COUNT(*) FILTER (WHERE source = 'elasticsearch')::float / COUNT(*) as elasticsearch_usage,
  DATE_TRUNC('hour', NOW() - INTERVAL '1 hour') as period_start,
  DATE_TRUNC('hour', NOW()) as period_end
FROM marketplace_search_events
WHERE timestamp >= NOW() - INTERVAL '2 hours'
  AND timestamp < NOW() - INTERVAL '1 hour';

-- Search health status summary
CREATE OR REPLACE VIEW search_health_summary AS
SELECT 
  service,
  status,
  AVG(response_time_ms) as avg_response_time,
  COUNT(*) as check_count,
  MAX(timestamp) as last_check,
  COUNT(*) FILTER (WHERE status = 'healthy')::float / COUNT(*) as health_percentage
FROM marketplace_search_health_checks
WHERE timestamp >= NOW() - INTERVAL '1 hour'
GROUP BY service, status
ORDER BY service, status;

-- Alert summary view
CREATE OR REPLACE VIEW search_alert_summary AS
SELECT 
  type,
  severity,
  COUNT(*) as alert_count,
  COUNT(*) FILTER (WHERE resolved = true) as resolved_count,
  COUNT(*) FILTER (WHERE resolved = false) as active_count,
  MAX(timestamp) as latest_alert,
  AVG(EXTRACT(EPOCH FROM (resolved_at - timestamp))/60) as avg_resolution_time_minutes
FROM marketplace_search_alerts
WHERE timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY type, severity
ORDER BY severity DESC, type;

-- ============================================================================
-- Monitoring Functions
-- ============================================================================

-- Function to calculate performance degradation
CREATE OR REPLACE FUNCTION detect_performance_degradation(
  hours_to_compare INTEGER DEFAULT 1
) RETURNS TABLE (
  metric_name TEXT,
  current_value DECIMAL,
  baseline_value DECIMAL,
  degradation_percentage DECIMAL,
  severity VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  WITH current_metrics AS (
    SELECT 
      AVG(response_time_ms) as avg_latency,
      PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY response_time_ms) as p95_latency,
      COUNT(*) FILTER (WHERE result_count > 0)::float / COUNT(*) as success_rate
    FROM marketplace_search_events
    WHERE timestamp >= NOW() - (hours_to_compare || ' hours')::INTERVAL
  ),
  baseline_metrics AS (
    SELECT 
      AVG(response_time_ms) as avg_latency,
      PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY response_time_ms) as p95_latency,
      COUNT(*) FILTER (WHERE result_count > 0)::float / COUNT(*) as success_rate
    FROM marketplace_search_events
    WHERE timestamp >= NOW() - (hours_to_compare * 2 || ' hours')::INTERVAL
      AND timestamp < NOW() - (hours_to_compare || ' hours')::INTERVAL
  )
  SELECT 
    'avg_latency'::TEXT,
    c.avg_latency,
    b.avg_latency,
    CASE WHEN b.avg_latency > 0 THEN ((c.avg_latency - b.avg_latency) / b.avg_latency) * 100 ELSE 0 END,
    CASE 
      WHEN b.avg_latency > 0 AND ((c.avg_latency - b.avg_latency) / b.avg_latency) > 0.5 THEN 'critical'
      WHEN b.avg_latency > 0 AND ((c.avg_latency - b.avg_latency) / b.avg_latency) > 0.2 THEN 'warning'
      ELSE 'normal'
    END::VARCHAR
  FROM current_metrics c, baseline_metrics b
  
  UNION ALL
  
  SELECT 
    'p95_latency'::TEXT,
    c.p95_latency,
    b.p95_latency,
    CASE WHEN b.p95_latency > 0 THEN ((c.p95_latency - b.p95_latency) / b.p95_latency) * 100 ELSE 0 END,
    CASE 
      WHEN b.p95_latency > 0 AND ((c.p95_latency - b.p95_latency) / b.p95_latency) > 0.5 THEN 'critical'
      WHEN b.p95_latency > 0 AND ((c.p95_latency - b.p95_latency) / b.p95_latency) > 0.2 THEN 'warning'
      ELSE 'normal'
    END::VARCHAR
  FROM current_metrics c, baseline_metrics b;
END;
$$ LANGUAGE plpgsql;

-- Function to generate performance report
CREATE OR REPLACE FUNCTION generate_search_performance_report(
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ
) RETURNS TABLE (
  metric_category TEXT,
  metric_name TEXT,
  metric_value DECIMAL,
  comparison_period DECIMAL,
  trend VARCHAR,
  recommendation TEXT
) AS $$
BEGIN
  -- Current period metrics
  RETURN QUERY
  SELECT 
    'latency'::TEXT,
    'average_response_time'::TEXT,
    AVG(response_time_ms),
    COALESCE(prev.avg_latency, 0),
    CASE 
      WHEN prev.avg_latency IS NULL THEN 'no_data'
      WHEN AVG(response_time_ms) > prev.avg_latency * 1.1 THEN 'worsening'
      WHEN AVG(response_time_ms) < prev.avg_latency * 0.9 THEN 'improving'
      ELSE 'stable'
    END::VARCHAR,
    CASE 
      WHEN AVG(response_time_ms) > 1000 THEN 'Critical: Optimize slow queries and consider scaling'
      WHEN AVG(response_time_ms) > 500 THEN 'Warning: Monitor performance and prepare optimizations'
      ELSE 'Good: Performance within acceptable range'
    END::TEXT
  FROM marketplace_search_events
  CROSS JOIN (
    SELECT AVG(response_time_ms) as avg_latency
    FROM marketplace_search_events
    WHERE timestamp >= start_date - (end_date - start_date)
      AND timestamp < start_date
  ) prev
  WHERE timestamp BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Automated Maintenance and Cleanup
-- ============================================================================

-- Function to clean up old monitoring data
CREATE OR REPLACE FUNCTION cleanup_search_monitoring(retention_days INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER := 0;
  cutoff_date TIMESTAMPTZ := NOW() - (retention_days || ' days')::INTERVAL;
BEGIN
  -- Clean up old health checks
  DELETE FROM marketplace_search_health_checks 
  WHERE timestamp < cutoff_date;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Clean up resolved alerts older than retention period
  DELETE FROM marketplace_search_alerts 
  WHERE resolved = true AND resolved_at < cutoff_date;
  
  -- Clean up old performance metrics (keep daily aggregates longer)
  DELETE FROM marketplace_search_performance_metrics 
  WHERE granularity IN ('minute', 'hour') 
    AND period_start < cutoff_date;
    
  -- Clean up old configuration changes
  DELETE FROM marketplace_search_configurations 
  WHERE change_timestamp < cutoff_date;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to aggregate performance metrics
CREATE OR REPLACE FUNCTION aggregate_search_metrics(
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  granularity_level VARCHAR DEFAULT 'hour'
) RETURNS VOID AS $$
DECLARE
  period_interval INTERVAL;
  current_period TIMESTAMPTZ;
BEGIN
  -- Set interval based on granularity
  period_interval := CASE granularity_level
    WHEN 'minute' THEN INTERVAL '1 minute'
    WHEN 'hour' THEN INTERVAL '1 hour'
    WHEN 'day' THEN INTERVAL '1 day'
    ELSE INTERVAL '1 hour'
  END;
  
  current_period := DATE_TRUNC(granularity_level, start_time);
  
  WHILE current_period < end_time LOOP
    INSERT INTO marketplace_search_performance_metrics (
      period_start, period_end, granularity,
      latency_p50, latency_p95, latency_p99, latency_avg,
      total_searches, searches_per_second,
      successful_searches, zero_result_searches, success_rate,
      error_count, error_rate,
      total_clicks, click_through_rate
    )
    SELECT 
      current_period,
      current_period + period_interval,
      granularity_level,
      PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY s.response_time_ms),
      PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY s.response_time_ms),
      PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY s.response_time_ms),
      AVG(s.response_time_ms),
      COUNT(*),
      COUNT(*)::DECIMAL / EXTRACT(EPOCH FROM period_interval),
      COUNT(*) FILTER (WHERE s.result_count > 0),
      COUNT(*) FILTER (WHERE s.result_count = 0),
      COUNT(*) FILTER (WHERE s.result_count > 0)::DECIMAL / COUNT(*),
      0, -- Error count would be calculated from actual error tracking
      0, -- Error rate would be calculated from actual error tracking
      COALESCE(clicks.total_clicks, 0),
      CASE WHEN COUNT(*) > 0 THEN COALESCE(clicks.total_clicks, 0)::DECIMAL / COUNT(*) ELSE 0 END
    FROM marketplace_search_events s
    LEFT JOIN (
      SELECT COUNT(*) as total_clicks
      FROM marketplace_search_clicks c
      WHERE c.timestamp >= current_period 
        AND c.timestamp < current_period + period_interval
    ) clicks ON true
    WHERE s.timestamp >= current_period 
      AND s.timestamp < current_period + period_interval
    GROUP BY current_period
    ON CONFLICT (period_start, granularity) DO UPDATE SET
      latency_p50 = EXCLUDED.latency_p50,
      latency_p95 = EXCLUDED.latency_p95,
      latency_p99 = EXCLUDED.latency_p99,
      latency_avg = EXCLUDED.latency_avg,
      total_searches = EXCLUDED.total_searches,
      searches_per_second = EXCLUDED.searches_per_second,
      successful_searches = EXCLUDED.successful_searches,
      zero_result_searches = EXCLUDED.zero_result_searches,
      success_rate = EXCLUDED.success_rate,
      total_clicks = EXCLUDED.total_clicks,
      click_through_rate = EXCLUDED.click_through_rate;
    
    current_period := current_period + period_interval;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Initial Data and Configuration
-- ============================================================================

-- Create initial baseline
INSERT INTO marketplace_search_baselines (
  baseline_name, description, baseline_type,
  avg_latency_ms, p95_latency_ms, p99_latency_ms,
  success_rate, click_through_rate, error_rate, cache_hit_rate,
  measurement_period_start, measurement_period_end, total_searches
) VALUES (
  'initial_baseline', 'Initial system baseline for search performance',
  'release', 250.0, 500.0, 1000.0, 0.95, 0.35, 0.02, 0.80,
  NOW() - INTERVAL '1 hour', NOW(), 1000
) ON CONFLICT (baseline_name) DO NOTHING;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO marketplace_service;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO marketplace_service;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO marketplace_service;

-- Update statistics
ANALYZE marketplace_search_alerts;
ANALYZE marketplace_search_health_checks;
ANALYZE marketplace_search_performance_metrics;