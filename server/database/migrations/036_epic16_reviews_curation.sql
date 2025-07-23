-- Epic 16 Reviews & Curation Database Schema
-- Migration: 036_epic16_reviews_curation.sql
-- 
-- Database schema for template review system and curation workflow
-- for Epic 16 Marketplace & Community Features

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Template Reviews System
-- ============================================================================

-- Main template reviews table
CREATE TABLE IF NOT EXISTS marketplace_template_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES marketplace_templates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Review content
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  
  -- Multi-criteria ratings (1-5 scale)
  quality_rating INTEGER NOT NULL CHECK (quality_rating BETWEEN 1 AND 5),
  usability_rating INTEGER NOT NULL CHECK (usability_rating BETWEEN 1 AND 5),
  documentation_rating INTEGER NOT NULL CHECK (usability_rating BETWEEN 1 AND 5),
  support_rating INTEGER NOT NULL CHECK (support_rating BETWEEN 1 AND 5),
  overall_rating DECIMAL(3,2) NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
  
  -- Review metadata
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verified BOOLEAN NOT NULL DEFAULT false,
  helpful INTEGER NOT NULL DEFAULT 0,
  reported INTEGER NOT NULL DEFAULT 0,
  
  -- Moderation
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'flagged')),
  moderator_id UUID REFERENCES users(id) ON DELETE SET NULL,
  moderated_at TIMESTAMPTZ,
  moderation_notes TEXT,
  
  -- Sentiment analysis
  sentiment_score DECIMAL(4,3) CHECK (sentiment_score BETWEEN -1 AND 1),
  sentiment_confidence DECIMAL(4,3) CHECK (sentiment_confidence BETWEEN 0 AND 1),
  
  -- Fraud detection
  fraud_score DECIMAL(4,3) NOT NULL DEFAULT 0 CHECK (fraud_score BETWEEN 0 AND 1),
  fraud_flags JSONB,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for reviews
CREATE INDEX IF NOT EXISTS idx_template_reviews_template ON marketplace_template_reviews(template_id);
CREATE INDEX IF NOT EXISTS idx_template_reviews_user ON marketplace_template_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_template_reviews_status ON marketplace_template_reviews(status);
CREATE INDEX IF NOT EXISTS idx_template_reviews_timestamp ON marketplace_template_reviews(timestamp);
CREATE INDEX IF NOT EXISTS idx_template_reviews_rating ON marketplace_template_reviews(overall_rating);
CREATE INDEX IF NOT EXISTS idx_template_reviews_helpful ON marketplace_template_reviews(helpful);
CREATE INDEX IF NOT EXISTS idx_template_reviews_verified ON marketplace_template_reviews(verified);

-- Composite indexes for review queries
CREATE INDEX IF NOT EXISTS idx_template_reviews_template_status 
  ON marketplace_template_reviews(template_id, status, timestamp);
CREATE INDEX IF NOT EXISTS idx_template_reviews_moderation 
  ON marketplace_template_reviews(status, fraud_score, timestamp) 
  WHERE status IN ('pending', 'flagged');

-- ============================================================================
-- Review Helpfulness Tracking
-- ============================================================================

-- Track which users found reviews helpful
CREATE TABLE IF NOT EXISTS marketplace_review_helpfulness (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID NOT NULL REFERENCES marketplace_template_reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  helpful BOOLEAN NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(review_id, user_id)
);

-- Indexes for helpfulness
CREATE INDEX IF NOT EXISTS idx_review_helpfulness_review ON marketplace_review_helpfulness(review_id);
CREATE INDEX IF NOT EXISTS idx_review_helpfulness_user ON marketplace_review_helpfulness(user_id);

-- ============================================================================
-- Review Moderation Log
-- ============================================================================

-- Log all moderation actions
CREATE TABLE IF NOT EXISTS marketplace_review_moderation_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID NOT NULL REFERENCES marketplace_template_reviews(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  moderator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for moderation log
CREATE INDEX IF NOT EXISTS idx_moderation_log_review ON marketplace_review_moderation_log(review_id);
CREATE INDEX IF NOT EXISTS idx_moderation_log_moderator ON marketplace_review_moderation_log(moderator_id);
CREATE INDEX IF NOT EXISTS idx_moderation_log_timestamp ON marketplace_review_moderation_log(timestamp);

-- ============================================================================
-- Curation System
-- ============================================================================

-- Main curation queue
CREATE TABLE IF NOT EXISTS marketplace_curation_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES marketplace_templates(id) ON DELETE CASCADE,
  submitted_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Content analysis
  content JSONB NOT NULL, -- Title, description, tags, category, complexity, estimated use time
  
  -- AI assessment
  ai_assessment JSONB NOT NULL, -- Criteria scores, overall score, confidence, flags, suggestions
  
  -- Curator assignment
  curator_id UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  
  -- Curator review
  curator_review JSONB, -- Curator decision, feedback, quality score, modifications
  
  -- Status and priority
  status VARCHAR(30) NOT NULL DEFAULT 'pending_ai' CHECK (status IN (
    'pending_ai', 'pending_curator', 'approved', 'rejected', 'revision_needed'
  )),
  priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  
  -- Analytics
  metrics JSONB, -- Community votes, curator agreement, appeal count, revision count
  appeal_count INTEGER NOT NULL DEFAULT 0,
  revision_count INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for curation queue
CREATE INDEX IF NOT EXISTS idx_curation_queue_template ON marketplace_curation_queue(template_id);
CREATE INDEX IF NOT EXISTS idx_curation_queue_submitted_by ON marketplace_curation_queue(submitted_by);
CREATE INDEX IF NOT EXISTS idx_curation_queue_curator ON marketplace_curation_queue(curator_id);
CREATE INDEX IF NOT EXISTS idx_curation_queue_status ON marketplace_curation_queue(status);
CREATE INDEX IF NOT EXISTS idx_curation_queue_priority ON marketplace_curation_queue(priority);
CREATE INDEX IF NOT EXISTS idx_curation_queue_submitted_at ON marketplace_curation_queue(submitted_at);

-- Composite indexes for curation workflow
CREATE INDEX IF NOT EXISTS idx_curation_queue_workflow 
  ON marketplace_curation_queue(status, priority, submitted_at);
CREATE INDEX IF NOT EXISTS idx_curation_queue_curator_workload 
  ON marketplace_curation_queue(curator_id, status, assigned_at);

-- ============================================================================
-- Curator Profiles
-- ============================================================================

-- Curator profile and performance tracking
CREATE TABLE IF NOT EXISTS marketplace_curators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  -- Profile information
  specializations TEXT[] NOT NULL DEFAULT '{}', -- Categories they specialize in
  languages TEXT[] NOT NULL DEFAULT '{}',
  timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
  
  -- Performance metrics
  total_reviewed INTEGER NOT NULL DEFAULT 0,
  average_review_time DECIMAL(8,2) NOT NULL DEFAULT 0, -- hours
  accuracy_score DECIMAL(4,3) NOT NULL DEFAULT 0, -- 0-1 agreement with community
  throughput_score DECIMAL(4,3) NOT NULL DEFAULT 0, -- reviews per week normalized
  quality_score DECIMAL(4,3) NOT NULL DEFAULT 0, -- feedback quality rating
  performance_rating DECIMAL(4,3) NOT NULL DEFAULT 0, -- overall combined score
  
  -- Workload management
  current_load INTEGER NOT NULL DEFAULT 0,
  capacity INTEGER NOT NULL DEFAULT 10, -- max items per week
  
  -- Status and availability
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'away', 'overloaded', 'inactive')),
  available_until TIMESTAMPTZ,
  last_active TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for curators
CREATE INDEX IF NOT EXISTS idx_curators_user ON marketplace_curators(user_id);
CREATE INDEX IF NOT EXISTS idx_curators_status ON marketplace_curators(status);
CREATE INDEX IF NOT EXISTS idx_curators_specializations ON marketplace_curators USING GIN(specializations);
CREATE INDEX IF NOT EXISTS idx_curators_performance ON marketplace_curators(performance_rating DESC);
CREATE INDEX IF NOT EXISTS idx_curators_workload ON marketplace_curators(current_load, capacity);

-- ============================================================================
-- Curation Activity Log
-- ============================================================================

-- Log all curation activities
CREATE TABLE IF NOT EXISTS marketplace_curation_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  curation_id UUID NOT NULL REFERENCES marketplace_curation_queue(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  details JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for curation log
CREATE INDEX IF NOT EXISTS idx_curation_log_curation ON marketplace_curation_log(curation_id);
CREATE INDEX IF NOT EXISTS idx_curation_log_user ON marketplace_curation_log(user_id);
CREATE INDEX IF NOT EXISTS idx_curation_log_action ON marketplace_curation_log(action);
CREATE INDEX IF NOT EXISTS idx_curation_log_timestamp ON marketplace_curation_log(timestamp);

-- ============================================================================
-- Analytics Views
-- ============================================================================

-- Template rating aggregation view
CREATE OR REPLACE VIEW template_rating_summary AS
SELECT 
  t.id as template_id,
  t.title,
  COUNT(r.id) as review_count,
  AVG(r.overall_rating) as average_rating,
  COUNT(r.id) FILTER (WHERE r.overall_rating = 5) as five_star_count,
  COUNT(r.id) FILTER (WHERE r.overall_rating = 4) as four_star_count,
  COUNT(r.id) FILTER (WHERE r.overall_rating = 3) as three_star_count,
  COUNT(r.id) FILTER (WHERE r.overall_rating = 2) as two_star_count,
  COUNT(r.id) FILTER (WHERE r.overall_rating = 1) as one_star_count,
  COUNT(r.id) FILTER (WHERE r.verified = true) as verified_review_count,
  AVG(r.quality_rating) as avg_quality,
  AVG(r.usability_rating) as avg_usability,
  AVG(r.documentation_rating) as avg_documentation,
  AVG(r.support_rating) as avg_support,
  AVG(r.sentiment_score) as avg_sentiment,
  MAX(r.timestamp) as latest_review_date
FROM marketplace_templates t
LEFT JOIN marketplace_template_reviews r ON t.id = r.template_id AND r.status = 'approved'
GROUP BY t.id, t.title;

-- Curation performance view
CREATE OR REPLACE VIEW curation_performance_summary AS
SELECT 
  DATE_TRUNC('day', submitted_at) as date,
  COUNT(*) as total_submissions,
  COUNT(*) FILTER (WHERE status = 'approved') as approved_count,
  COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count,
  COUNT(*) FILTER (WHERE status = 'revision_needed') as revision_count,
  COUNT(*) FILTER (WHERE status IN ('pending_ai', 'pending_curator')) as pending_count,
  AVG((ai_assessment->>'overallScore')::float) as avg_ai_score,
  AVG(EXTRACT(EPOCH FROM (reviewed_at - assigned_at))/3600) as avg_review_hours,
  COUNT(DISTINCT curator_id) FILTER (WHERE curator_id IS NOT NULL) as active_curators
FROM marketplace_curation_queue
WHERE submitted_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', submitted_at)
ORDER BY date DESC;

-- Curator workload view  
CREATE OR REPLACE VIEW curator_workload_summary AS
SELECT 
  c.id as curator_id,
  u.email as curator_email,
  c.current_load,
  c.capacity,
  c.performance_rating,
  COUNT(q.id) FILTER (WHERE q.status = 'pending_curator') as pending_reviews,
  COUNT(q.id) FILTER (WHERE q.reviewed_at >= NOW() - INTERVAL '7 days') as reviews_this_week,
  AVG(EXTRACT(EPOCH FROM (q.reviewed_at - q.assigned_at))/3600) as avg_review_time_hours,
  c.last_active,
  c.status
FROM marketplace_curators c
JOIN users u ON c.user_id = u.id
LEFT JOIN marketplace_curation_queue q ON c.id = q.curator_id
GROUP BY c.id, u.email, c.current_load, c.capacity, c.performance_rating, c.last_active, c.status
ORDER BY c.performance_rating DESC;

-- ============================================================================
-- Stored Functions for Analytics
-- ============================================================================

-- Function to calculate template popularity score
CREATE OR REPLACE FUNCTION calculate_template_popularity(template_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
  popularity_score DECIMAL := 0;
  review_count INTEGER;
  avg_rating DECIMAL;
  recent_activity INTEGER;
BEGIN
  -- Get review statistics
  SELECT COUNT(*), AVG(overall_rating)
  INTO review_count, avg_rating
  FROM marketplace_template_reviews
  WHERE template_id = template_uuid AND status = 'approved';
  
  -- Get recent activity (last 30 days)
  SELECT COUNT(*)
  INTO recent_activity
  FROM marketplace_template_reviews
  WHERE template_id = template_uuid 
    AND status = 'approved'
    AND timestamp >= NOW() - INTERVAL '30 days';
  
  -- Calculate popularity score
  popularity_score := (
    (COALESCE(review_count, 0) * 0.4) +
    (COALESCE(avg_rating, 0) * 20 * 0.3) +
    (COALESCE(recent_activity, 0) * 0.3)
  );
  
  RETURN GREATEST(0, LEAST(100, popularity_score));
END;
$$ LANGUAGE plpgsql;

-- Function to update curator performance metrics
CREATE OR REPLACE FUNCTION update_curator_performance(curator_uuid UUID)
RETURNS VOID AS $$
DECLARE
  total_reviews INTEGER;
  avg_review_time DECIMAL;
  accuracy_score DECIMAL;
BEGIN
  -- Calculate total reviews
  SELECT COUNT(*)
  INTO total_reviews
  FROM marketplace_curation_queue
  WHERE curator_id = curator_uuid AND reviewed_at IS NOT NULL;
  
  -- Calculate average review time
  SELECT AVG(EXTRACT(EPOCH FROM (reviewed_at - assigned_at))/3600)
  INTO avg_review_time
  FROM marketplace_curation_queue
  WHERE curator_id = curator_uuid AND reviewed_at IS NOT NULL;
  
  -- Calculate accuracy score (simplified - would use community feedback in production)
  SELECT COUNT(*) FILTER (WHERE (curator_review->>'decision')::text = 'approved')::DECIMAL / 
         NULLIF(COUNT(*), 0)
  INTO accuracy_score
  FROM marketplace_curation_queue
  WHERE curator_id = curator_uuid AND reviewed_at IS NOT NULL;
  
  -- Update curator record
  UPDATE marketplace_curators
  SET 
    total_reviewed = COALESCE(total_reviews, 0),
    average_review_time = COALESCE(avg_review_time, 0),
    accuracy_score = COALESCE(accuracy_score, 0),
    performance_rating = (
      (COALESCE(accuracy_score, 0) * 0.4) +
      (GREATEST(0, 1 - (COALESCE(avg_review_time, 24) / 24)) * 0.3) +
      (LEAST(1, COALESCE(total_reviews, 0) / 100.0) * 0.3)
    ),
    updated_at = NOW()
  WHERE id = curator_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to generate curation insights
CREATE OR REPLACE FUNCTION get_curation_insights(days_back INTEGER DEFAULT 7)
RETURNS TABLE (
  metric_name TEXT,
  metric_value DECIMAL,
  comparison_value DECIMAL,
  trend VARCHAR(20)
) AS $$
BEGIN
  RETURN QUERY
  WITH current_period AS (
    SELECT 
      COUNT(*) as submissions,
      COUNT(*) FILTER (WHERE status = 'approved')::DECIMAL / NULLIF(COUNT(*), 0) as approval_rate,
      AVG((ai_assessment->>'overallScore')::DECIMAL) as avg_ai_score,
      AVG(EXTRACT(EPOCH FROM (reviewed_at - assigned_at))/3600) as avg_review_time
    FROM marketplace_curation_queue
    WHERE submitted_at >= NOW() - (days_back || ' days')::INTERVAL
  ),
  previous_period AS (
    SELECT 
      COUNT(*) as submissions,
      COUNT(*) FILTER (WHERE status = 'approved')::DECIMAL / NULLIF(COUNT(*), 0) as approval_rate,
      AVG((ai_assessment->>'overallScore')::DECIMAL) as avg_ai_score,
      AVG(EXTRACT(EPOCH FROM (reviewed_at - assigned_at))/3600) as avg_review_time
    FROM marketplace_curation_queue
    WHERE submitted_at >= NOW() - (days_back * 2 || ' days')::INTERVAL
      AND submitted_at < NOW() - (days_back || ' days')::INTERVAL
  )
  SELECT 
    'submissions'::TEXT,
    c.submissions,
    p.submissions,
    CASE 
      WHEN p.submissions = 0 THEN 'new'
      WHEN c.submissions > p.submissions * 1.1 THEN 'improving'
      WHEN c.submissions < p.submissions * 0.9 THEN 'declining'
      ELSE 'stable'
    END::VARCHAR(20)
  FROM current_period c, previous_period p
  
  UNION ALL
  
  SELECT 
    'approval_rate'::TEXT,
    c.approval_rate * 100,
    p.approval_rate * 100,
    CASE 
      WHEN p.approval_rate = 0 THEN 'new'
      WHEN c.approval_rate > p.approval_rate * 1.05 THEN 'improving'
      WHEN c.approval_rate < p.approval_rate * 0.95 THEN 'declining'
      ELSE 'stable'
    END::VARCHAR(20)
  FROM current_period c, previous_period p;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Triggers for Automated Updates
-- ============================================================================

-- Update template rating cache when reviews change
CREATE OR REPLACE FUNCTION update_template_rating_cache()
RETURNS TRIGGER AS $$
BEGIN
  -- Invalidate/update cached rating for the template
  -- In production, this would trigger cache invalidation
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_template_rating_cache
  AFTER INSERT OR UPDATE OR DELETE ON marketplace_template_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_template_rating_cache();

-- Update curator performance when curation is completed
CREATE OR REPLACE FUNCTION auto_update_curator_performance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.reviewed_at IS NOT NULL AND (OLD.reviewed_at IS NULL OR OLD.reviewed_at != NEW.reviewed_at) THEN
    PERFORM update_curator_performance(NEW.curator_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_update_curator_performance
  AFTER UPDATE ON marketplace_curation_queue
  FOR EACH ROW
  EXECUTE FUNCTION auto_update_curator_performance();

-- ============================================================================
-- Initial Data
-- ============================================================================

-- Create default curator profile for admin users
INSERT INTO marketplace_curators (user_id, specializations, capacity)
SELECT 
  id,
  ARRAY['general', 'quality_assurance'],
  20
FROM users 
WHERE email LIKE '%admin%' 
  AND NOT EXISTS (
    SELECT 1 FROM marketplace_curators WHERE user_id = users.id
  );

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO marketplace_service;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO marketplace_service;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO marketplace_service;

-- Update statistics
ANALYZE marketplace_template_reviews;
ANALYZE marketplace_curation_queue;
ANALYZE marketplace_curators;