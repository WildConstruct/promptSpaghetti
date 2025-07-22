-- Epic 17.5.2 Promotion Scheduling Migration
-- Creates database schema for featured content promotion scheduling system

-- Create promotion slots table
CREATE TABLE IF NOT EXISTS promotion_slots (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- FEATURED_HOMEPAGE, CATEGORY_SPOTLIGHT, etc.
    location VARCHAR(255) NOT NULL, -- Homepage, Category page, etc.
    max_concurrent_promotions INTEGER DEFAULT 1,
    traffic_allocation DECIMAL(5,2) DEFAULT 100.00, -- Percentage of traffic
    priority INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create promotion schedules table
CREATE TABLE IF NOT EXISTS promotion_schedules (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    promotion_type VARCHAR(50) NOT NULL,
    slot_id VARCHAR(36) NOT NULL REFERENCES promotion_slots(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'DRAFT', -- DRAFT, SCHEDULED, ACTIVE, COMPLETED, CANCELLED, PAUSED
    
    -- Content selection
    selection_strategy VARCHAR(20) DEFAULT 'MANUAL', -- MANUAL, PERFORMANCE_BASED, ALGORITHMIC, HYBRID
    content_criteria JSONB DEFAULT '{}',
    selected_content_ids JSONB DEFAULT '[]',
    
    -- Scheduling
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    timezone VARCHAR(50) DEFAULT 'UTC',
    rotation_pattern VARCHAR(30) DEFAULT 'FIXED_DURATION',
    rotation_config JSONB DEFAULT '{}',
    
    -- Performance tracking
    target_metrics JSONB DEFAULT '{}',
    actual_metrics JSONB,
    
    -- A/B Testing
    ab_test_config JSONB,
    
    -- Management
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_by VARCHAR(36),
    approved_at TIMESTAMP WITH TIME ZONE,
    
    metadata JSONB DEFAULT '{}'
);

-- Junction table for schedule-content relationships
CREATE TABLE IF NOT EXISTS promotion_schedule_content (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id VARCHAR(36) NOT NULL REFERENCES promotion_schedules(id) ON DELETE CASCADE,
    content_id VARCHAR(36) NOT NULL,
    content_type VARCHAR(50) NOT NULL DEFAULT 'template', -- template, collection, etc.
    
    -- Performance data for this specific content in this promotion
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    revenue DECIMAL(12,2) DEFAULT 0.00,
    
    -- Rotation tracking
    rotation_order INTEGER,
    time_promoted_minutes INTEGER DEFAULT 0,
    last_promoted_at TIMESTAMP WITH TIME ZONE,
    performance_score DECIMAL(5,2), -- 0-100 calculated score
    
    -- A/B test variant assignment
    ab_variant VARCHAR(100),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(schedule_id, content_id)
);

-- Create promotion performance metrics table for detailed tracking
CREATE TABLE IF NOT EXISTS promotion_performance_metrics (
    id BIGSERIAL PRIMARY KEY,
    schedule_id VARCHAR(36) NOT NULL REFERENCES promotion_schedules(id) ON DELETE CASCADE,
    content_id VARCHAR(36),
    slot_id VARCHAR(36) NOT NULL REFERENCES promotion_slots(id),
    
    -- Metrics data
    metric_date DATE NOT NULL,
    metric_hour INTEGER, -- 0-23 for hourly granularity
    
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    revenue DECIMAL(12,2) DEFAULT 0.00,
    ctr DECIMAL(8,4), -- Click-through rate
    conversion_rate DECIMAL(8,4),
    engagement_time INTEGER, -- seconds
    bounce_rate DECIMAL(8,4),
    
    -- A/B testing data
    ab_variant VARCHAR(100),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(schedule_id, content_id, metric_date, metric_hour, ab_variant)
);

-- Create promotion rotation log for tracking content rotations
CREATE TABLE IF NOT EXISTS promotion_rotation_log (
    id BIGSERIAL PRIMARY KEY,
    schedule_id VARCHAR(36) NOT NULL REFERENCES promotion_schedules(id) ON DELETE CASCADE,
    content_id VARCHAR(36) NOT NULL,
    slot_id VARCHAR(36) NOT NULL REFERENCES promotion_slots(id),
    
    -- Rotation details
    rotation_event VARCHAR(20) NOT NULL, -- START, STOP, ROTATE, PAUSE
    previous_content_id VARCHAR(36),
    rotation_reason VARCHAR(50), -- TIME_THRESHOLD, PERFORMANCE_THRESHOLD, MANUAL, SCHEDULED
    rotation_trigger JSONB, -- Details about what triggered the rotation
    
    -- Performance at rotation
    performance_snapshot JSONB,
    
    -- Timing
    event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    rotation_duration_minutes INTEGER, -- How long the content was promoted
    
    -- System info
    triggered_by VARCHAR(36), -- User ID if manual, 'system' if automatic
    automation_rule_id VARCHAR(36) -- Reference to automation rule if applicable
);

-- Create promotion conflicts detection table
CREATE TABLE IF NOT EXISTS promotion_conflicts (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id_1 VARCHAR(36) NOT NULL REFERENCES promotion_schedules(id) ON DELETE CASCADE,
    schedule_id_2 VARCHAR(36) NOT NULL REFERENCES promotion_schedules(id) ON DELETE CASCADE,
    conflict_type VARCHAR(50) NOT NULL, -- SLOT_OVERLAP, CONTENT_OVERLAP, RESOURCE_CONFLICT
    conflict_details JSONB NOT NULL,
    severity VARCHAR(20) DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, CRITICAL
    
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_method VARCHAR(50), -- SCHEDULE_ADJUSTED, PRIORITY_OVERRIDE, MANUAL_RESOLUTION
    resolved_by VARCHAR(36),
    
    UNIQUE(schedule_id_1, schedule_id_2, conflict_type)
);

-- Create promotion templates for quick setup
CREATE TABLE IF NOT EXISTS promotion_templates (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    promotion_type VARCHAR(50) NOT NULL,
    
    -- Template configuration
    default_duration_hours INTEGER DEFAULT 168, -- 1 week
    default_rotation_config JSONB DEFAULT '{}',
    default_content_criteria JSONB DEFAULT '{}',
    default_target_metrics JSONB DEFAULT '{}',
    
    -- Usage tracking
    usage_count INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2), -- Percentage of successful promotions using this template
    
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    is_system_template BOOLEAN DEFAULT FALSE,
    enabled BOOLEAN DEFAULT TRUE
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_promotion_schedules_status ON promotion_schedules(status);
CREATE INDEX IF NOT EXISTS idx_promotion_schedules_dates ON promotion_schedules(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_promotion_schedules_slot ON promotion_schedules(slot_id);
CREATE INDEX IF NOT EXISTS idx_promotion_schedules_type ON promotion_schedules(promotion_type);

CREATE INDEX IF NOT EXISTS idx_promotion_schedule_content_schedule ON promotion_schedule_content(schedule_id);
CREATE INDEX IF NOT EXISTS idx_promotion_schedule_content_content ON promotion_schedule_content(content_id);
CREATE INDEX IF NOT EXISTS idx_promotion_schedule_content_performance ON promotion_schedule_content(performance_score DESC);

CREATE INDEX IF NOT EXISTS idx_promotion_performance_schedule_date ON promotion_performance_metrics(schedule_id, metric_date);
CREATE INDEX IF NOT EXISTS idx_promotion_performance_slot_date ON promotion_performance_metrics(slot_id, metric_date);
CREATE INDEX IF NOT EXISTS idx_promotion_performance_content_date ON promotion_performance_metrics(content_id, metric_date);

CREATE INDEX IF NOT EXISTS idx_promotion_rotation_log_schedule ON promotion_rotation_log(schedule_id);
CREATE INDEX IF NOT EXISTS idx_promotion_rotation_log_timestamp ON promotion_rotation_log(event_timestamp);
CREATE INDEX IF NOT EXISTS idx_promotion_rotation_log_event ON promotion_rotation_log(rotation_event);

CREATE INDEX IF NOT EXISTS idx_promotion_conflicts_schedules ON promotion_conflicts(schedule_id_1, schedule_id_2);
CREATE INDEX IF NOT EXISTS idx_promotion_conflicts_unresolved ON promotion_conflicts(resolved_at) WHERE resolved_at IS NULL;

-- Insert default promotion slots
INSERT INTO promotion_slots (name, type, location, max_concurrent_promotions, traffic_allocation, priority, metadata) VALUES 
(
    'Homepage Hero Banner', 
    'FEATURED_HOMEPAGE', 
    'Homepage', 
    1, 
    100.00, 
    1,
    '{
        "dimensions": {"width": 1200, "height": 400},
        "position": "hero",
        "styling": {"background": "gradient", "text_color": "white"}
    }'::jsonb
),
(
    'Homepage Featured Carousel', 
    'TRENDING_CAROUSEL', 
    'Homepage', 
    6, 
    80.00, 
    2,
    '{
        "dimensions": {"width": 300, "height": 200},
        "position": "carousel",
        "auto_rotate": true,
        "rotation_seconds": 5
    }'::jsonb
),
(
    'Category Spotlight', 
    'CATEGORY_SPOTLIGHT', 
    'Category Pages', 
    3, 
    90.00, 
    2,
    '{
        "dimensions": {"width": 400, "height": 300},
        "position": "sidebar",
        "category_specific": true
    }'::jsonb
),
(
    'Editor\'s Choice Sidebar', 
    'EDITOR_CHOICE', 
    'All Pages', 
    4, 
    50.00, 
    3,
    '{
        "dimensions": {"width": 250, "height": 150},
        "position": "sidebar",
        "sticky": true
    }'::jsonb
),
(
    'New Arrivals Section', 
    'NEW_ARRIVALS', 
    'Homepage', 
    8, 
    60.00, 
    4,
    '{
        "dimensions": {"width": 250, "height": 200},
        "position": "grid",
        "auto_refresh": true,
        "refresh_hours": 24
    }'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- Insert default promotion templates
INSERT INTO promotion_templates (name, description, promotion_type, default_duration_hours, default_rotation_config, default_content_criteria, default_target_metrics, created_by, is_system_template) VALUES 
(
    'Weekend Feature Campaign',
    'Standard weekend promotion for high-performing templates',
    'FEATURED_HOMEPAGE',
    72, -- 3 days
    '{
        "rotation_pattern": "PERFORMANCE_THRESHOLD",
        "performance_threshold": {"click_threshold": 100, "time_threshold": 4},
        "randomize_order": true,
        "allow_repeat": false
    }'::jsonb,
    '{
        "min_rating": 4.0,
        "min_download_count": 50,
        "exclude_recently_promoted": true,
        "max_content_count": 4,
        "categories": ["video-editing", "motion-graphics", "compositing"]
    }'::jsonb,
    '{
        "target_impressions": 10000,
        "target_ctr": 3.5,
        "target_conversions": 50
    }'::jsonb,
    'system',
    true
),
(
    'New Creator Spotlight',
    'Promote content from new creators to boost engagement',
    'EDITOR_CHOICE',
    168, -- 1 week
    '{
        "rotation_pattern": "EQUAL_TIME",
        "equal_time_duration": 28,
        "randomize_order": false,
        "cooldown_period": 168
    }'::jsonb,
    '{
        "creator_tiers": ["new", "rising"],
        "min_rating": 3.5,
        "published_after": "30_days_ago",
        "max_content_count": 6,
        "diversification_rules": [
            {"attribute": "category", "max_percentage": 40, "enforce_uniqueness": true}
        ]
    }'::jsonb,
    '{
        "target_impressions": 5000,
        "target_ctr": 2.5,
        "min_engagement_time": 30
    }'::jsonb,
    'system',
    true
),
(
    'Seasonal Campaign',
    'Template for seasonal promotions with A/B testing',
    'SEASONAL_PROMOTION',
    504, -- 3 weeks
    '{
        "rotation_pattern": "WEIGHTED_ROTATION",
        "weight_criteria": {
            "performance_weight": 0.4,
            "recency_weight": 0.2,
            "diversity_weight": 0.3,
            "creator_tier_weight": 0.1
        },
        "randomize_order": true
    }'::jsonb,
    '{
        "tags": ["seasonal", "holiday", "trending"],
        "min_rating": 4.2,
        "quality_score_threshold": 85,
        "max_content_count": 10
    }'::jsonb,
    '{
        "target_impressions": 25000,
        "target_ctr": 4.0,
        "target_conversions": 150,
        "target_revenue": 5000
    }'::jsonb,
    'system',
    true
)
ON CONFLICT (id) DO NOTHING;

-- Create view for promotion dashboard
CREATE OR REPLACE VIEW promotion_dashboard_overview AS
SELECT 
    ps.id,
    ps.title,
    ps.promotion_type,
    ps.status,
    psl.name as slot_name,
    psl.location as slot_location,
    ps.start_date,
    ps.end_date,
    
    -- Content count
    (SELECT COUNT(*) FROM promotion_schedule_content psc WHERE psc.schedule_id = ps.id) as content_count,
    
    -- Current metrics
    COALESCE(current_metrics.impressions, 0) as current_impressions,
    COALESCE(current_metrics.clicks, 0) as current_clicks,
    COALESCE(current_metrics.conversions, 0) as current_conversions,
    COALESCE(current_metrics.revenue, 0) as current_revenue,
    COALESCE(current_metrics.ctr, 0) as current_ctr,
    
    -- Target metrics
    (ps.target_metrics->>'target_impressions')::INTEGER as target_impressions,
    (ps.target_metrics->>'target_ctr')::DECIMAL as target_ctr,
    (ps.target_metrics->>'target_conversions')::INTEGER as target_conversions,
    
    -- Progress indicators
    CASE 
        WHEN (ps.target_metrics->>'target_impressions')::INTEGER > 0 
        THEN ROUND((COALESCE(current_metrics.impressions, 0)::DECIMAL / (ps.target_metrics->>'target_impressions')::INTEGER) * 100, 1)
        ELSE 0 
    END as impressions_progress,
    
    CASE 
        WHEN (ps.target_metrics->>'target_conversions')::INTEGER > 0 
        THEN ROUND((COALESCE(current_metrics.conversions, 0)::DECIMAL / (ps.target_metrics->>'target_conversions')::INTEGER) * 100, 1)
        ELSE 0 
    END as conversions_progress,
    
    -- Time progress
    CASE 
        WHEN ps.end_date <= NOW() THEN 100
        WHEN ps.start_date >= NOW() THEN 0
        ELSE ROUND(
            (EXTRACT(EPOCH FROM (NOW() - ps.start_date)) / 
             EXTRACT(EPOCH FROM (ps.end_date - ps.start_date))) * 100, 1
        )
    END as time_progress
    
FROM promotion_schedules ps
LEFT JOIN promotion_slots psl ON psl.id = ps.slot_id
LEFT JOIN (
    SELECT 
        schedule_id,
        SUM(impressions) as impressions,
        SUM(clicks) as clicks,
        SUM(conversions) as conversions,
        SUM(revenue) as revenue,
        CASE WHEN SUM(impressions) > 0 THEN ROUND((SUM(clicks)::DECIMAL / SUM(impressions)) * 100, 2) ELSE 0 END as ctr
    FROM promotion_schedule_content
    GROUP BY schedule_id
) current_metrics ON current_metrics.schedule_id = ps.id;

-- Create function for conflict detection
CREATE OR REPLACE FUNCTION detect_promotion_conflicts(
    p_schedule_id VARCHAR(36),
    p_slot_id VARCHAR(36),
    p_start_date TIMESTAMP WITH TIME ZONE,
    p_end_date TIMESTAMP WITH TIME ZONE
) RETURNS TABLE(
    conflicting_schedule_id VARCHAR(36),
    conflict_type VARCHAR(50),
    conflict_details JSONB
) AS $$
BEGIN
    -- Detect slot overlap conflicts
    RETURN QUERY
    SELECT 
        ps.id,
        'SLOT_OVERLAP'::VARCHAR(50),
        jsonb_build_object(
            'overlap_start', GREATEST(ps.start_date, p_start_date),
            'overlap_end', LEAST(ps.end_date, p_end_date),
            'slot_name', psl.name
        )
    FROM promotion_schedules ps
    LEFT JOIN promotion_slots psl ON psl.id = ps.slot_id
    WHERE ps.id != p_schedule_id
        AND ps.slot_id = p_slot_id
        AND ps.status IN ('SCHEDULED', 'ACTIVE')
        AND (
            (ps.start_date <= p_start_date AND ps.end_date >= p_start_date) OR
            (ps.start_date <= p_end_date AND ps.end_date >= p_end_date) OR
            (ps.start_date >= p_start_date AND ps.end_date <= p_end_date)
        );
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_promotion_slots_updated_at
    BEFORE UPDATE ON promotion_slots
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_promotion_schedules_updated_at
    BEFORE UPDATE ON promotion_schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_promotion_schedule_content_updated_at
    BEFORE UPDATE ON promotion_schedule_content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_promotion_templates_updated_at
    BEFORE UPDATE ON promotion_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON promotion_slots TO policy_service;
GRANT SELECT, INSERT, UPDATE, DELETE ON promotion_schedules TO policy_service;
GRANT SELECT, INSERT, UPDATE, DELETE ON promotion_schedule_content TO policy_service;
GRANT SELECT, INSERT, UPDATE, DELETE ON promotion_performance_metrics TO policy_service;
GRANT SELECT, INSERT, UPDATE, DELETE ON promotion_rotation_log TO policy_service;
GRANT SELECT, INSERT, UPDATE, DELETE ON promotion_conflicts TO policy_service;
GRANT SELECT, INSERT, UPDATE, DELETE ON promotion_templates TO policy_service;

GRANT SELECT ON promotion_dashboard_overview TO policy_service;
GRANT USAGE ON SEQUENCE promotion_performance_metrics_id_seq TO policy_service;
GRANT USAGE ON SEQUENCE promotion_rotation_log_id_seq TO policy_service;

-- Add comments for documentation
COMMENT ON TABLE promotion_slots IS 'Epic 17.5.2: Available promotion slots for featured content';
COMMENT ON TABLE promotion_schedules IS 'Epic 17.5.2: Promotion schedules with content selection and rotation';
COMMENT ON TABLE promotion_schedule_content IS 'Epic 17.5.2: Junction table linking schedules to promoted content';
COMMENT ON TABLE promotion_performance_metrics IS 'Epic 17.5.2: Detailed performance metrics for promotion tracking';
COMMENT ON TABLE promotion_rotation_log IS 'Epic 17.5.2: Audit log for content rotation events';
COMMENT ON TABLE promotion_conflicts IS 'Epic 17.5.2: Detected conflicts between promotion schedules';
COMMENT ON TABLE promotion_templates IS 'Epic 17.5.2: Reusable templates for quick promotion setup';

COMMENT ON VIEW promotion_dashboard_overview IS 'Epic 17.5.2: Optimized view for promotion management dashboard';
COMMENT ON FUNCTION detect_promotion_conflicts IS 'Epic 17.5.2: Function to detect scheduling conflicts';

-- Migration completion log
INSERT INTO schema_migrations (version, applied_at) VALUES ('029_epic17_promotion_scheduling', NOW())
ON CONFLICT (version) DO UPDATE SET applied_at = NOW();