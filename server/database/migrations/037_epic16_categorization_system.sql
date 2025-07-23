-- Epic 16 Categorization System Database Schema
-- Migration: 037_epic16_categorization_system.sql
-- 
-- Hierarchical categorization system with intelligent classification,
-- tagging, and organization capabilities for marketplace templates.

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "ltree";

-- ============================================================================
-- Category Hierarchy System
-- ============================================================================

-- Main categories table with hierarchical structure
CREATE TABLE IF NOT EXISTS marketplace_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  parent_id UUID REFERENCES marketplace_categories(id) ON DELETE CASCADE,
  
  -- Visual and branding
  icon VARCHAR(50),
  color VARCHAR(7), -- Hex color code
  image_url TEXT,
  
  -- Hierarchy management
  path LTREE, -- Materialized path for efficient queries
  depth INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  
  -- Configuration
  featured BOOLEAN NOT NULL DEFAULT false,
  visible BOOLEAN NOT NULL DEFAULT true,
  searchable BOOLEAN NOT NULL DEFAULT true,
  auto_classification BOOLEAN NOT NULL DEFAULT true,
  require_approval BOOLEAN NOT NULL DEFAULT false,
  
  -- Classification keywords
  keywords TEXT[] NOT NULL DEFAULT '{}',
  aliases TEXT[] NOT NULL DEFAULT '{}',
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Constraints
  CONSTRAINT valid_slug CHECK (slug ~ '^[a-z0-9\-]+$'),
  CONSTRAINT valid_depth CHECK (depth >= 0 AND depth <= 10),
  CONSTRAINT no_self_reference CHECK (id != parent_id)
);

-- Indexes for categories
CREATE INDEX IF NOT EXISTS idx_categories_parent ON marketplace_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON marketplace_categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_path ON marketplace_categories USING GIST(path);
CREATE INDEX IF NOT EXISTS idx_categories_depth ON marketplace_categories(depth);
CREATE INDEX IF NOT EXISTS idx_categories_featured ON marketplace_categories(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_categories_visible ON marketplace_categories(visible) WHERE visible = true;
CREATE INDEX IF NOT EXISTS idx_categories_sort ON marketplace_categories(sort_order, name);
CREATE INDEX IF NOT EXISTS idx_categories_keywords ON marketplace_categories USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_categories_aliases ON marketplace_categories USING GIN(aliases);

-- ============================================================================
-- Tag System
-- ============================================================================

-- Tags table for flexible content labeling
CREATE TABLE IF NOT EXISTS marketplace_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL,
  slug VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  category_id UUID REFERENCES marketplace_categories(id) ON DELETE SET NULL,
  
  -- Statistics
  usage_count INTEGER NOT NULL DEFAULT 0,
  trending_score DECIMAL(5,4) NOT NULL DEFAULT 0,
  related_tags UUID[] NOT NULL DEFAULT '{}',
  
  -- Classification
  type VARCHAR(20) NOT NULL DEFAULT 'topical' CHECK (type IN ('functional', 'topical', 'industry', 'technical', 'style')),
  confidence DECIMAL(4,3) NOT NULL DEFAULT 0.5 CHECK (confidence BETWEEN 0 AND 1),
  
  -- Approval and quality
  approved BOOLEAN NOT NULL DEFAULT false,
  quality_score DECIMAL(4,3) NOT NULL DEFAULT 0.5,
  suggested_by VARCHAR(20) CHECK (suggested_by IN ('ai', 'user', 'admin')),
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Constraints
  CONSTRAINT valid_tag_slug CHECK (slug ~ '^[a-z0-9\-]+$'),
  CONSTRAINT valid_usage_count CHECK (usage_count >= 0)
);

-- Indexes for tags
CREATE INDEX IF NOT EXISTS idx_tags_name ON marketplace_tags(name);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON marketplace_tags(slug);
CREATE INDEX IF NOT EXISTS idx_tags_category ON marketplace_tags(category_id);
CREATE INDEX IF NOT EXISTS idx_tags_type ON marketplace_tags(type);
CREATE INDEX IF NOT EXISTS idx_tags_usage ON marketplace_tags(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_tags_trending ON marketplace_tags(trending_score DESC);
CREATE INDEX IF NOT EXISTS idx_tags_approved ON marketplace_tags(approved) WHERE approved = true;
CREATE INDEX IF NOT EXISTS idx_tags_quality ON marketplace_tags(quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_tags_related ON marketplace_tags USING GIN(related_tags);

-- ============================================================================
-- Template-Tag Relationships
-- ============================================================================

-- Many-to-many relationship between templates and tags
CREATE TABLE IF NOT EXISTS marketplace_template_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES marketplace_templates(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES marketplace_tags(id) ON DELETE CASCADE,
  
  -- Relationship metadata
  confidence DECIMAL(4,3) NOT NULL DEFAULT 1.0 CHECK (confidence BETWEEN 0 AND 1),
  source VARCHAR(20) NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'ai', 'suggested', 'imported')),
  approved BOOLEAN NOT NULL DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Ensure uniqueness
  UNIQUE(template_id, tag_id)
);

-- Indexes for template-tag relationships
CREATE INDEX IF NOT EXISTS idx_template_tags_template ON marketplace_template_tags(template_id);
CREATE INDEX IF NOT EXISTS idx_template_tags_tag ON marketplace_template_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_template_tags_confidence ON marketplace_template_tags(confidence);
CREATE INDEX IF NOT EXISTS idx_template_tags_source ON marketplace_template_tags(source);
CREATE INDEX IF NOT EXISTS idx_template_tags_approved ON marketplace_template_tags(approved) WHERE approved = true;

-- ============================================================================
-- Category Statistics and Analytics
-- ============================================================================

-- Pre-computed category statistics for performance
CREATE TABLE IF NOT EXISTS marketplace_category_stats (
  category_id UUID PRIMARY KEY REFERENCES marketplace_categories(id) ON DELETE CASCADE,
  
  -- Template counts
  template_count INTEGER NOT NULL DEFAULT 0,
  active_count INTEGER NOT NULL DEFAULT 0,
  featured_count INTEGER NOT NULL DEFAULT 0,
  verified_count INTEGER NOT NULL DEFAULT 0,
  
  -- Engagement metrics
  total_downloads INTEGER NOT NULL DEFAULT 0,
  total_views INTEGER NOT NULL DEFAULT 0,
  total_bookmarks INTEGER NOT NULL DEFAULT 0,
  
  -- Quality metrics
  average_rating DECIMAL(3,2) NOT NULL DEFAULT 0,
  total_reviews INTEGER NOT NULL DEFAULT 0,
  quality_score DECIMAL(4,3) NOT NULL DEFAULT 0,
  
  -- Trending and performance
  trending_score DECIMAL(6,4) NOT NULL DEFAULT 0,
  growth_rate DECIMAL(5,2) NOT NULL DEFAULT 0, -- Percentage growth
  engagement_rate DECIMAL(5,4) NOT NULL DEFAULT 0,
  
  -- Time-based metrics
  last_template_added TIMESTAMPTZ,
  peak_activity_hour INTEGER CHECK (peak_activity_hour BETWEEN 0 AND 23),
  
  -- Analytics periods
  stats_date DATE NOT NULL DEFAULT CURRENT_DATE,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_counts CHECK (
    template_count >= 0 AND 
    active_count >= 0 AND 
    featured_count >= 0 AND 
    verified_count >= 0 AND
    active_count <= template_count AND
    featured_count <= template_count AND
    verified_count <= template_count
  ),
  CONSTRAINT valid_rating CHECK (average_rating BETWEEN 0 AND 5)
);

-- Indexes for category statistics
CREATE INDEX IF NOT EXISTS idx_category_stats_template_count ON marketplace_category_stats(template_count DESC);
CREATE INDEX IF NOT EXISTS idx_category_stats_downloads ON marketplace_category_stats(total_downloads DESC);
CREATE INDEX IF NOT EXISTS idx_category_stats_rating ON marketplace_category_stats(average_rating DESC);
CREATE INDEX IF NOT EXISTS idx_category_stats_trending ON marketplace_category_stats(trending_score DESC);
CREATE INDEX IF NOT EXISTS idx_category_stats_growth ON marketplace_category_stats(growth_rate DESC);
CREATE INDEX IF NOT EXISTS idx_category_stats_date ON marketplace_category_stats(stats_date);

-- ============================================================================
-- Classification and AI Analysis
-- ============================================================================

-- Store AI classification results for templates
CREATE TABLE IF NOT EXISTS marketplace_classification_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES marketplace_templates(id) ON DELETE CASCADE,
  
  -- Primary classification
  primary_category_id UUID REFERENCES marketplace_categories(id) ON DELETE SET NULL,
  primary_confidence DECIMAL(4,3) NOT NULL CHECK (primary_confidence BETWEEN 0 AND 1),
  primary_reasoning TEXT,
  
  -- Secondary classifications
  secondary_categories JSONB, -- Array of {category_id, confidence} objects
  
  -- Suggested tags
  suggested_tags JSONB, -- Array of {name, type, confidence, source} objects
  
  -- Content analysis
  complexity VARCHAR(20) CHECK (complexity IN ('beginner', 'intermediate', 'advanced')),
  quality_score DECIMAL(4,3) CHECK (quality_score BETWEEN 0 AND 1),
  content_analysis JSONB, -- Detailed analysis results
  
  -- Flags and issues
  flags JSONB, -- Array of {type, confidence, reason} objects
  
  -- AI model information
  model_version VARCHAR(50),
  model_confidence DECIMAL(4,3),
  
  -- Processing metadata
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processing_time_ms INTEGER,
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'reviewed')),
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  
  UNIQUE(template_id) -- One classification per template
);

-- Indexes for classification results
CREATE INDEX IF NOT EXISTS idx_classification_template ON marketplace_classification_results(template_id);
CREATE INDEX IF NOT EXISTS idx_classification_primary_category ON marketplace_classification_results(primary_category_id);
CREATE INDEX IF NOT EXISTS idx_classification_confidence ON marketplace_classification_results(primary_confidence DESC);
CREATE INDEX IF NOT EXISTS idx_classification_complexity ON marketplace_classification_results(complexity);
CREATE INDEX IF NOT EXISTS idx_classification_quality ON marketplace_classification_results(quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_classification_status ON marketplace_classification_results(status);
CREATE INDEX IF NOT EXISTS idx_classification_processed ON marketplace_classification_results(processed_at);

-- ============================================================================
-- Search Enhancement Tables
-- ============================================================================

-- Enhanced search events with categorization data
CREATE TABLE IF NOT EXISTS marketplace_search_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Search details
  query TEXT,
  category_filter UUID REFERENCES marketplace_categories(id) ON DELETE SET NULL,
  tag_filters UUID[],
  complexity_filter TEXT[],
  
  -- Results and performance
  result_count INTEGER NOT NULL DEFAULT 0,
  search_time_ms INTEGER NOT NULL DEFAULT 0,
  from_cache BOOLEAN NOT NULL DEFAULT false,
  
  -- User interaction
  clicked BOOLEAN NOT NULL DEFAULT false,
  clicked_template_id UUID REFERENCES marketplace_templates(id) ON DELETE SET NULL,
  clicked_position INTEGER,
  
  -- Metadata
  user_agent TEXT,
  ip_address INET,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Error tracking
  error_occurred BOOLEAN NOT NULL DEFAULT false,
  error_message TEXT
);

-- Indexes for search events
CREATE INDEX IF NOT EXISTS idx_search_events_user ON marketplace_search_events(user_id);
CREATE INDEX IF NOT EXISTS idx_search_events_query ON marketplace_search_events(query);
CREATE INDEX IF NOT EXISTS idx_search_events_category ON marketplace_search_events(category_filter);
CREATE INDEX IF NOT EXISTS idx_search_events_timestamp ON marketplace_search_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_search_events_clicked ON marketplace_search_events(clicked) WHERE clicked = true;
CREATE INDEX IF NOT EXISTS idx_search_events_performance ON marketplace_search_events(search_time_ms);

-- Search click tracking
CREATE TABLE IF NOT EXISTS marketplace_search_click_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  template_id UUID NOT NULL REFERENCES marketplace_templates(id) ON DELETE CASCADE,
  
  -- Search context
  query TEXT NOT NULL,
  position INTEGER NOT NULL CHECK (position > 0),
  search_id UUID, -- Reference to search session
  
  -- Click metadata
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_agent TEXT,
  referrer TEXT
);

-- Indexes for click events
CREATE INDEX IF NOT EXISTS idx_click_events_user ON marketplace_search_click_events(user_id);
CREATE INDEX IF NOT EXISTS idx_click_events_template ON marketplace_search_click_events(template_id);
CREATE INDEX IF NOT EXISTS idx_click_events_query ON marketplace_search_click_events(query);
CREATE INDEX IF NOT EXISTS idx_click_events_timestamp ON marketplace_search_click_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_click_events_position ON marketplace_search_click_events(position);

-- Saved searches
CREATE TABLE IF NOT EXISTS marketplace_saved_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Search details
  name VARCHAR(100) NOT NULL,
  search_query JSONB NOT NULL,
  
  -- Usage tracking
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  use_count INTEGER NOT NULL DEFAULT 1,
  
  -- Notifications
  notify_new_results BOOLEAN NOT NULL DEFAULT false,
  last_notification TIMESTAMPTZ,
  
  UNIQUE(user_id, name)
);

-- Indexes for saved searches
CREATE INDEX IF NOT EXISTS idx_saved_searches_user ON marketplace_saved_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_searches_last_used ON marketplace_saved_searches(last_used);
CREATE INDEX IF NOT EXISTS idx_saved_searches_notifications ON marketplace_saved_searches(notify_new_results) WHERE notify_new_results = true;

-- ============================================================================
-- Functions and Triggers
-- ============================================================================

-- Function to update category path when hierarchy changes
CREATE OR REPLACE FUNCTION update_category_path()
RETURNS TRIGGER AS $$
BEGIN
  -- Update path using recursive CTE
  WITH RECURSIVE category_path AS (
    SELECT id, name, parent_id, name::TEXT as path, 0 as depth
    FROM marketplace_categories 
    WHERE parent_id IS NULL
    
    UNION ALL
    
    SELECT c.id, c.name, c.parent_id, 
           cp.path || '.' || c.name as path,
           cp.depth + 1 as depth
    FROM marketplace_categories c
    JOIN category_path cp ON c.parent_id = cp.id
  )
  UPDATE marketplace_categories 
  SET path = cp.path::LTREE, depth = cp.depth
  FROM category_path cp 
  WHERE marketplace_categories.id = cp.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update paths when categories change
CREATE TRIGGER trigger_update_category_path
  AFTER INSERT OR UPDATE OF parent_id ON marketplace_categories
  FOR EACH STATEMENT
  EXECUTE FUNCTION update_category_path();

-- Function to update tag usage count
CREATE OR REPLACE FUNCTION update_tag_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE marketplace_tags 
    SET usage_count = usage_count + 1, updated_at = NOW()
    WHERE id = NEW.tag_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE marketplace_tags 
    SET usage_count = GREATEST(0, usage_count - 1), updated_at = NOW()
    WHERE id = OLD.tag_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for tag usage updates
CREATE TRIGGER trigger_update_tag_usage
  AFTER INSERT OR DELETE ON marketplace_template_tags
  FOR EACH ROW
  EXECUTE FUNCTION update_tag_usage();

-- Function to update category statistics
CREATE OR REPLACE FUNCTION update_category_stats()
RETURNS TRIGGER AS $$
DECLARE
  cat_id UUID;
BEGIN
  -- Get category ID from template
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    cat_id := NEW.category_id;
  ELSE
    cat_id := OLD.category_id;
  END IF;
  
  -- Update category statistics
  INSERT INTO marketplace_category_stats (category_id, template_count, active_count, last_updated)
  SELECT 
    cat_id,
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'published'),
    NOW()
  FROM marketplace_templates 
  WHERE category_id = cat_id
  ON CONFLICT (category_id) DO UPDATE SET
    template_count = EXCLUDED.template_count,
    active_count = EXCLUDED.active_count,
    last_updated = EXCLUDED.last_updated;
    
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for category statistics updates
CREATE TRIGGER trigger_update_category_stats
  AFTER INSERT OR UPDATE OR DELETE ON marketplace_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_category_stats();

-- ============================================================================
-- Stored Procedures for Analytics
-- ============================================================================

-- Function to calculate trending scores
CREATE OR REPLACE FUNCTION calculate_trending_scores()
RETURNS VOID AS $$
BEGIN
  -- Update category trending scores
  UPDATE marketplace_category_stats 
  SET trending_score = (
    COALESCE(
      (SELECT COUNT(*) * 0.4 FROM marketplace_templates t 
       WHERE t.category_id = marketplace_category_stats.category_id 
       AND t.created_at >= NOW() - INTERVAL '7 days'), 0
    ) +
    COALESCE(
      (SELECT SUM(download_count) * 0.3 FROM marketplace_templates t 
       WHERE t.category_id = marketplace_category_stats.category_id 
       AND t.created_at >= NOW() - INTERVAL '30 days'), 0
    ) +
    COALESCE(average_rating * 20 * 0.3, 0)
  ),
  last_updated = NOW();
  
  -- Update tag trending scores
  UPDATE marketplace_tags 
  SET trending_score = (
    COALESCE(usage_count * 0.6, 0) +
    COALESCE(
      (SELECT COUNT(*) * 0.4 FROM marketplace_template_tags tt
       JOIN marketplace_templates t ON tt.template_id = t.id
       WHERE tt.tag_id = marketplace_tags.id 
       AND t.created_at >= NOW() - INTERVAL '7 days'), 0
    )
  ) / 100.0,
  updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to get category suggestions for content
CREATE OR REPLACE FUNCTION suggest_categories_for_content(
  content_title TEXT,
  content_description TEXT,
  existing_tags TEXT[] DEFAULT '{}'
)
RETURNS TABLE (
  category_id UUID,
  category_name VARCHAR(100),
  confidence DECIMAL(4,3),
  reasoning TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    CASE 
      WHEN content_title ILIKE ANY(c.keywords) OR content_description ILIKE ANY(c.keywords) THEN 0.9
      WHEN content_title ILIKE '%' || c.name || '%' OR content_description ILIKE '%' || c.name || '%' THEN 0.7
      WHEN content_title ILIKE ANY(c.aliases) OR content_description ILIKE ANY(c.aliases) THEN 0.6
      ELSE 0.3
    END::DECIMAL(4,3),
    CASE 
      WHEN content_title ILIKE ANY(c.keywords) OR content_description ILIKE ANY(c.keywords) THEN 'Matches category keywords'
      WHEN content_title ILIKE '%' || c.name || '%' OR content_description ILIKE '%' || c.name || '%' THEN 'Contains category name'
      WHEN content_title ILIKE ANY(c.aliases) OR content_description ILIKE ANY(c.aliases) THEN 'Matches category aliases'
      ELSE 'General similarity'
    END
  FROM marketplace_categories c
  WHERE c.visible = true 
    AND c.auto_classification = true
  ORDER BY confidence DESC
  LIMIT 5;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Initial Data and Setup
-- ============================================================================

-- Create default category hierarchy
INSERT INTO marketplace_categories (name, slug, description, depth, sort_order, created_by, keywords) 
SELECT 
  'Business', 'business', 'Business and productivity templates', 0, 1,
  (SELECT id FROM users WHERE email LIKE '%admin%' LIMIT 1),
  ARRAY['business', 'productivity', 'corporate', 'professional']
WHERE NOT EXISTS (SELECT 1 FROM marketplace_categories WHERE slug = 'business');

INSERT INTO marketplace_categories (name, slug, description, depth, sort_order, created_by, keywords)
SELECT 
  'Creative', 'creative', 'Creative and artistic templates', 0, 2,
  (SELECT id FROM users WHERE email LIKE '%admin%' LIMIT 1),
  ARRAY['creative', 'art', 'design', 'artistic', 'visual']
WHERE NOT EXISTS (SELECT 1 FROM marketplace_categories WHERE slug = 'creative');

INSERT INTO marketplace_categories (name, slug, description, depth, sort_order, created_by, keywords)
SELECT 
  'Technical', 'technical', 'Technical and development templates', 0, 3,
  (SELECT id FROM users WHERE email LIKE '%admin%' LIMIT 1),
  ARRAY['technical', 'development', 'programming', 'code', 'software']
WHERE NOT EXISTS (SELECT 1 FROM marketplace_categories WHERE slug = 'technical');

INSERT INTO marketplace_categories (name, slug, description, depth, sort_order, created_by, keywords)
SELECT 
  'Educational', 'educational', 'Educational and learning templates', 0, 4,
  (SELECT id FROM users WHERE email LIKE '%admin%' LIMIT 1),
  ARRAY['educational', 'learning', 'training', 'tutorial', 'academic']
WHERE NOT EXISTS (SELECT 1 FROM marketplace_categories WHERE slug = 'educational');

-- Create some common tags
INSERT INTO marketplace_tags (name, slug, type, approved, quality_score)
VALUES 
  ('automation', 'automation', 'functional', true, 0.9),
  ('productivity', 'productivity', 'topical', true, 0.8),
  ('ai', 'ai', 'technical', true, 0.9),
  ('marketing', 'marketing', 'industry', true, 0.8),
  ('beginner-friendly', 'beginner-friendly', 'style', true, 0.7)
ON CONFLICT (slug) DO NOTHING;

-- Update category paths
SELECT update_category_path();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO marketplace_service;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO marketplace_service;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO marketplace_service;

-- Update statistics
ANALYZE marketplace_categories;
ANALYZE marketplace_tags;
ANALYZE marketplace_template_tags;
ANALYZE marketplace_category_stats;