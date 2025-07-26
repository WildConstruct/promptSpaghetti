-- Epic 16 Story 16.1 - Search Analytics Database Schema
-- Enhanced search tracking and analytics for marketplace discovery

-- =============================================================================
-- Search Analytics Tables
-- =============================================================================

-- Main search analytics table
CREATE TABLE IF NOT EXISTS search_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Search data
    query TEXT NOT NULL DEFAULT '',
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id VARCHAR(255),
    
    -- Search context
    filters JSONB DEFAULT '{}'::jsonb,
    results_count INTEGER DEFAULT 0,
    selected_filters JSONB DEFAULT '{}'::jsonb,
    
    -- User context
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    device_type VARCHAR(20), -- mobile, desktop, tablet
    
    -- Performance metrics
    search_duration_ms INTEGER DEFAULT 0,
    db_query_time_ms INTEGER DEFAULT 0,
    
    -- Behavioral data
    clicked_result_position INTEGER, -- which result was clicked (1-based)
    clicked_template_id UUID REFERENCES marketplace_templates(id) ON DELETE SET NULL,
    time_to_click_ms INTEGER, -- time from search to click
    
    -- Geographic data
    country_code VARCHAR(2),
    region VARCHAR(100),
    city VARCHAR(100),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Search session tracking
CREATE TABLE IF NOT EXISTS search_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Session metadata
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    total_searches INTEGER DEFAULT 0,
    total_clicks INTEGER DEFAULT 0,
    total_purchases INTEGER DEFAULT 0,
    
    -- Session context
    entry_point VARCHAR(100), -- home, category, direct, etc.
    exit_point VARCHAR(100),
    device_info JSONB DEFAULT '{}'::jsonb,
    
    -- Conversion tracking
    converted BOOLEAN DEFAULT FALSE,
    conversion_value_cents INTEGER DEFAULT 0,
    time_to_conversion_minutes INTEGER
);

-- Query intent classification
CREATE TABLE IF NOT EXISTS search_query_intents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_normalized TEXT UNIQUE NOT NULL,
    
    -- Intent classification
    primary_intent VARCHAR(50), -- browse, specific, compare, learn
    confidence_score DECIMAL(3,2) DEFAULT 0.00,
    
    -- Query characteristics
    query_type VARCHAR(30), -- keyword, natural_language, partial
    complexity_score INTEGER DEFAULT 1, -- 1-5
    commercial_intent BOOLEAN DEFAULT FALSE,
    
    -- Suggested improvements
    suggested_keywords JSONB DEFAULT '[]'::jsonb,
    related_categories JSONB DEFAULT '[]'::jsonb,
    
    -- Classification metadata
    classified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    classification_method VARCHAR(50) DEFAULT 'manual', -- manual, ml, rule_based
    verified BOOLEAN DEFAULT FALSE
);

-- Popular search patterns
CREATE TABLE IF NOT EXISTS search_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pattern_type VARCHAR(50) NOT NULL, -- sequence, filter_combo, etc.
    pattern_data JSONB NOT NULL,
    
    -- Pattern metrics
    frequency INTEGER DEFAULT 1,
    success_rate DECIMAL(5,2) DEFAULT 0.00, -- % that lead to clicks/purchases
    avg_session_value_cents INTEGER DEFAULT 0,
    
    -- Pattern evolution
    first_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    trend VARCHAR(20) DEFAULT 'stable' -- growing, declining, stable, new
);

-- Search result relevance feedback
CREATE TABLE IF NOT EXISTS search_relevance_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    search_id UUID NOT NULL REFERENCES search_analytics(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES marketplace_templates(id) ON DELETE CASCADE,
    
    -- Feedback data
    position INTEGER NOT NULL, -- position in search results
    relevance_score INTEGER CHECK (relevance_score >= 1 AND relevance_score <= 5),
    feedback_type VARCHAR(20) NOT NULL, -- implicit, explicit
    
    -- Implicit signals
    clicked BOOLEAN DEFAULT FALSE,
    time_on_page_seconds INTEGER,
    bounce_rate BOOLEAN DEFAULT FALSE,
    purchased BOOLEAN DEFAULT FALSE,
    
    -- Explicit feedback
    user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
    feedback_text TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- Performance Optimization Tables
-- =============================================================================

-- Cached search results for popular queries
CREATE TABLE IF NOT EXISTS search_result_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_hash VARCHAR(64) UNIQUE NOT NULL, -- SHA256 of normalized query + filters
    
    -- Cache data
    results_data JSONB NOT NULL,
    results_count INTEGER NOT NULL,
    cache_key VARCHAR(255) NOT NULL,
    
    -- Cache metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    hit_count INTEGER DEFAULT 0,
    last_hit_at TIMESTAMP WITH TIME ZONE
);

-- Search suggestions cache
CREATE TABLE IF NOT EXISTS search_suggestions_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_prefix VARCHAR(100) NOT NULL,
    suggestions JSONB NOT NULL,
    
    -- Cache metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    request_count INTEGER DEFAULT 0
);

-- =============================================================================
-- Indexes for Performance
-- =============================================================================

-- Primary search analytics indexes
CREATE INDEX IF NOT EXISTS idx_search_analytics_query ON search_analytics(query);
CREATE INDEX IF NOT EXISTS idx_search_analytics_user ON search_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_search_analytics_session ON search_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_search_analytics_created ON search_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_analytics_template_click ON search_analytics(clicked_template_id);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_search_analytics_user_created ON search_analytics(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_analytics_query_created ON search_analytics(query, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_analytics_results_count ON search_analytics(results_count, created_at DESC);

-- Session tracking indexes
CREATE INDEX IF NOT EXISTS idx_search_sessions_user ON search_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_search_sessions_started ON search_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_sessions_converted ON search_sessions(converted, conversion_value_cents DESC);

-- Query intent indexes
CREATE INDEX IF NOT EXISTS idx_query_intents_normalized ON search_query_intents(query_normalized);
CREATE INDEX IF NOT EXISTS idx_query_intents_primary_intent ON search_query_intents(primary_intent);
CREATE INDEX IF NOT EXISTS idx_query_intents_commercial ON search_query_intents(commercial_intent);

-- Pattern tracking indexes
CREATE INDEX IF NOT EXISTS idx_search_patterns_type ON search_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_search_patterns_frequency ON search_patterns(frequency DESC);
CREATE INDEX IF NOT EXISTS idx_search_patterns_success ON search_patterns(success_rate DESC);

-- Relevance feedback indexes
CREATE INDEX IF NOT EXISTS idx_relevance_feedback_search ON search_relevance_feedback(search_id);
CREATE INDEX IF NOT EXISTS idx_relevance_feedback_template ON search_relevance_feedback(template_id);
CREATE INDEX IF NOT EXISTS idx_relevance_feedback_position ON search_relevance_feedback(position);

-- Cache indexes
CREATE INDEX IF NOT EXISTS idx_search_cache_hash ON search_result_cache(query_hash);
CREATE INDEX IF NOT EXISTS idx_search_cache_expires ON search_result_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_suggestions_cache_prefix ON search_suggestions_cache(query_prefix);
CREATE INDEX IF NOT EXISTS idx_suggestions_cache_expires ON search_suggestions_cache(expires_at);

-- =============================================================================
-- GIN Indexes for JSONB Queries
-- =============================================================================

-- Filters and metadata search
CREATE INDEX IF NOT EXISTS idx_search_analytics_filters_gin ON search_analytics USING gin(filters);
CREATE INDEX IF NOT EXISTS idx_search_analytics_selected_filters_gin ON search_analytics USING gin(selected_filters);
CREATE INDEX IF NOT EXISTS idx_search_sessions_device_gin ON search_sessions USING gin(device_info);
CREATE INDEX IF NOT EXISTS idx_query_intents_keywords_gin ON search_query_intents USING gin(suggested_keywords);
CREATE INDEX IF NOT EXISTS idx_query_intents_categories_gin ON search_query_intents USING gin(related_categories);
CREATE INDEX IF NOT EXISTS idx_search_patterns_data_gin ON search_patterns USING gin(pattern_data);

-- Full-text search on queries
CREATE INDEX IF NOT EXISTS idx_search_analytics_query_fts ON search_analytics 
    USING gin(to_tsvector('english', query));

-- =============================================================================
-- Triggers and Functions
-- =============================================================================

-- Update session activity when search happens
CREATE OR REPLACE FUNCTION update_search_session_activity()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO search_sessions (session_id, user_id, total_searches, last_activity_at)
    VALUES (NEW.session_id, NEW.user_id, 1, NEW.created_at)
    ON CONFLICT (session_id) DO UPDATE SET
        total_searches = search_sessions.total_searches + 1,
        last_activity_at = NEW.created_at,
        user_id = COALESCE(search_sessions.user_id, NEW.user_id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_search_session_activity
    AFTER INSERT ON search_analytics
    FOR EACH ROW
    WHEN (NEW.session_id IS NOT NULL)
    EXECUTE FUNCTION update_search_session_activity();

-- Auto-classify query intents for new queries
CREATE OR REPLACE FUNCTION classify_search_query_intent()
RETURNS TRIGGER AS $$
DECLARE
    normalized_query TEXT;
    intent VARCHAR(50);
    commercial BOOLEAN := FALSE;
BEGIN
    -- Normalize query
    normalized_query := LOWER(TRIM(NEW.query));
    
    -- Skip empty queries
    IF normalized_query = '' THEN
        RETURN NEW;
    END IF;
    
    -- Basic intent classification
    IF normalized_query LIKE '%buy%' OR normalized_query LIKE '%purchase%' OR normalized_query LIKE '%price%' THEN
        intent := 'purchase';
        commercial := TRUE;
    ELSIF normalized_query LIKE '%how%' OR normalized_query LIKE '%tutorial%' OR normalized_query LIKE '%learn%' THEN
        intent := 'learn';
    ELSIF normalized_query LIKE '%vs%' OR normalized_query LIKE '%compare%' OR normalized_query LIKE '%difference%' THEN
        intent := 'compare';
    ELSIF normalized_query LIKE '%best%' OR normalized_query LIKE '%top%' OR normalized_query LIKE '%popular%' THEN
        intent := 'browse';
    ELSE
        intent := 'specific';
    END IF;
    
    -- Insert or update intent classification
    INSERT INTO search_query_intents (query_normalized, primary_intent, commercial_intent, classification_method)
    VALUES (normalized_query, intent, commercial, 'rule_based')
    ON CONFLICT (query_normalized) DO UPDATE SET
        classification_method = 'rule_based',
        verified = FALSE;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_classify_search_query_intent
    AFTER INSERT ON search_analytics
    FOR EACH ROW
    WHEN (NEW.query IS NOT NULL AND NEW.query != '')
    EXECUTE FUNCTION classify_search_query_intent();

-- Cache cleanup function
CREATE OR REPLACE FUNCTION cleanup_expired_search_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM search_result_cache WHERE expires_at < CURRENT_TIMESTAMP;
    DELETE FROM search_suggestions_cache WHERE expires_at < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- Materialized Views for Analytics
-- =============================================================================

-- Popular search terms view
CREATE MATERIALIZED VIEW IF NOT EXISTS popular_search_terms AS
SELECT 
    query,
    COUNT(*) as search_count,
    COUNT(DISTINCT user_id) as unique_users,
    AVG(results_count) as avg_results,
    COUNT(CASE WHEN clicked_template_id IS NOT NULL THEN 1 END) as clicks,
    COUNT(CASE WHEN clicked_template_id IS NOT NULL THEN 1 END)::FLOAT / COUNT(*) as ctr,
    DATE_TRUNC('day', MAX(created_at)) as last_searched
FROM search_analytics 
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
    AND query != ''
GROUP BY query
HAVING COUNT(*) >= 3
ORDER BY search_count DESC;

CREATE UNIQUE INDEX IF NOT EXISTS idx_popular_search_terms_query ON popular_search_terms(query);

-- Search performance view
CREATE MATERIALIZED VIEW IF NOT EXISTS search_performance_metrics AS
SELECT 
    DATE_TRUNC('hour', created_at) as hour,
    COUNT(*) as total_searches,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT session_id) as unique_sessions,
    AVG(search_duration_ms) as avg_search_time_ms,
    AVG(results_count) as avg_results_count,
    COUNT(CASE WHEN results_count = 0 THEN 1 END) as zero_result_searches,
    COUNT(CASE WHEN clicked_template_id IS NOT NULL THEN 1 END) as searches_with_clicks,
    AVG(time_to_click_ms) FILTER (WHERE time_to_click_ms IS NOT NULL) as avg_time_to_click_ms
FROM search_analytics
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE_TRUNC('hour', created_at)
ORDER BY hour DESC;

CREATE UNIQUE INDEX IF NOT EXISTS idx_search_performance_hour ON search_performance_metrics(hour);

-- Function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_search_analytics_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY popular_search_terms;
    REFRESH MATERIALIZED VIEW CONCURRENTLY search_performance_metrics;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- Initial Data and Cleanup
-- =============================================================================

-- Create default query intent classifications for common patterns
INSERT INTO search_query_intents (query_normalized, primary_intent, commercial_intent, classification_method, verified) VALUES
('prompt', 'browse', false, 'manual', true),
('template', 'browse', false, 'manual', true),
('writing', 'specific', false, 'manual', true),
('marketing', 'specific', true, 'manual', true),
('business', 'specific', true, 'manual', true),
('code', 'specific', false, 'manual', true),
('education', 'specific', false, 'manual', true),
('creative', 'specific', false, 'manual', true),
('best prompts', 'browse', false, 'manual', true),
('how to', 'learn', false, 'manual', true),
('tutorial', 'learn', false, 'manual', true)
ON CONFLICT (query_normalized) DO NOTHING;

-- Comments
COMMENT ON TABLE search_analytics IS 'Comprehensive search tracking and analytics for marketplace discovery';
COMMENT ON TABLE search_sessions IS 'User session tracking across multiple searches';
COMMENT ON TABLE search_query_intents IS 'Classification of search query intents and characteristics';
COMMENT ON TABLE search_patterns IS 'Tracking of popular search patterns and behaviors';
COMMENT ON TABLE search_relevance_feedback IS 'User feedback on search result relevance';
COMMENT ON TABLE search_result_cache IS 'Cached search results for performance optimization';
COMMENT ON MATERIALIZED VIEW popular_search_terms IS 'Popular search terms with performance metrics';
COMMENT ON MATERIALIZED VIEW search_performance_metrics IS 'Hourly search performance and quality metrics';