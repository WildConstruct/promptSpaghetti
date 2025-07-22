-- Placement Management Database Schema - Epic 17.5.2
-- Task: E17-1753114397326-68B279 - Develop placement management
-- Epic: 17 - Backstage Admin Controls
--
-- Comprehensive database schema for marketplace content placement and featured content management.
-- Provides slot management, content placement, scheduling, and performance analytics.

-- =============================================================================
-- Core Placement Tables
-- =============================================================================

-- Placement slots define areas where content can be placed
CREATE TABLE placement_slots (
    slot_id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Placement Configuration
    placement_area VARCHAR(50) NOT NULL CHECK (placement_area IN (
        'homepage', 'category_page', 'search_results', 'template_detail',
        'user_dashboard', 'checkout', 'sidebar', 'header', 'footer', 'modal'
    )),
    position VARCHAR(50) NOT NULL CHECK (position IN (
        'hero_banner', 'top_carousel', 'sidebar_top', 'sidebar_middle', 'sidebar_bottom',
        'content_top', 'content_middle', 'content_bottom', 'floating', 'inline', 'overlay'
    )),
    max_items INTEGER NOT NULL DEFAULT 1 CHECK (max_items > 0),
    min_items INTEGER NOT NULL DEFAULT 1 CHECK (min_items > 0 AND min_items <= max_items),
    
    -- Visual Configuration (JSON fields)
    dimensions JSONB NOT NULL DEFAULT '{}',
    styling JSONB NOT NULL DEFAULT '{}',
    layout JSONB NOT NULL DEFAULT '{}',
    
    -- Targeting and Rules (JSON fields)
    targeting_rules JSONB NOT NULL DEFAULT '{}',
    display_rules JSONB NOT NULL DEFAULT '{}',
    
    -- Status and Management
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    priority INTEGER NOT NULL DEFAULT 50 CHECK (priority >= 0 AND priority <= 100),
    tags JSONB NOT NULL DEFAULT '[]',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255) NOT NULL,
    last_modified_by VARCHAR(255),
    
    -- Constraints
    CONSTRAINT slot_name_valid CHECK (length(name) >= 3),
    CONSTRAINT slot_display_name_valid CHECK (length(display_name) >= 3)
);

-- Content placements link content to slots
CREATE TABLE content_placements (
    placement_id VARCHAR(255) PRIMARY KEY,
    slot_id VARCHAR(255) NOT NULL REFERENCES placement_slots(slot_id) ON DELETE CASCADE,
    content_id VARCHAR(255) NOT NULL,
    content_type VARCHAR(50) NOT NULL CHECK (content_type IN (
        'template', 'collection', 'category', 'promotion', 'banner', 'announcement', 'custom'
    )),
    
    -- Placement Configuration
    priority INTEGER NOT NULL DEFAULT 50 CHECK (priority >= 0 AND priority <= 100),
    weight DECIMAL(5,2) CHECK (weight > 0),
    
    -- Scheduling
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    timezone VARCHAR(50) DEFAULT 'UTC',
    
    -- Targeting Overrides (JSON field)
    targeting_overrides JSONB NOT NULL DEFAULT '{}',
    
    -- Placement-Specific Styling (JSON fields)
    custom_styling JSONB NOT NULL DEFAULT '{}',
    custom_data JSONB NOT NULL DEFAULT '{}',
    
    -- Status and Management
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft', 'scheduled', 'active', 'paused', 'expired', 'archived'
    )),
    approval_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (approval_status IN (
        'pending', 'approved', 'rejected', 'needs_review'
    )),
    
    -- A/B Testing
    experiment_id VARCHAR(255),
    variant_id VARCHAR(255),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255) NOT NULL,
    last_modified_by VARCHAR(255),
    notes TEXT,
    tags JSONB NOT NULL DEFAULT '[]',
    
    -- Constraints
    CONSTRAINT placement_scheduling CHECK (
        (start_time IS NULL AND end_time IS NULL) OR
        (start_time IS NOT NULL AND end_time IS NULL) OR
        (start_time IS NOT NULL AND end_time IS NOT NULL AND start_time < end_time)
    )
);

-- Placement schedules for recurring and complex scheduling
CREATE TABLE placement_schedules (
    schedule_id VARCHAR(255) PRIMARY KEY,
    placement_id VARCHAR(255) NOT NULL REFERENCES content_placements(placement_id) ON DELETE CASCADE,
    
    -- Schedule Configuration
    schedule_type VARCHAR(20) NOT NULL CHECK (schedule_type IN (
        'one_time', 'recurring', 'conditional', 'event_based'
    )),
    pattern JSONB NOT NULL DEFAULT '{}',
    
    -- Timing
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
    
    -- Recurrence (JSON field)
    recurrence_rules JSONB NOT NULL DEFAULT '{}',
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    next_execution TIMESTAMP WITH TIME ZONE,
    last_execution TIMESTAMP WITH TIME ZONE,
    execution_count INTEGER NOT NULL DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255) NOT NULL
);

-- Placement campaigns group related placements
CREATE TABLE placement_campaigns (
    campaign_id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Campaign Configuration
    objective VARCHAR(20) NOT NULL CHECK (objective IN (
        'awareness', 'engagement', 'conversions', 'revenue', 'retention'
    )),
    budget_total DECIMAL(12,2),
    budget_daily DECIMAL(12,2),
    budget_currency VARCHAR(3) DEFAULT 'USD',
    spending_pace VARCHAR(20) DEFAULT 'even' CHECK (spending_pace IN ('even', 'accelerated')),
    
    -- Targeting (JSON field)
    global_targeting JSONB NOT NULL DEFAULT '{}',
    
    -- Performance Goals (JSON field)
    kpis JSONB NOT NULL DEFAULT '[]',
    
    -- Status and Timeline
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft', 'scheduled', 'running', 'paused', 'completed', 'cancelled'
    )),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255) NOT NULL,
    tags JSONB NOT NULL DEFAULT '[]'
);

-- Many-to-many relationship between campaigns and placements
CREATE TABLE campaign_placements (
    campaign_id VARCHAR(255) NOT NULL REFERENCES placement_campaigns(campaign_id) ON DELETE CASCADE,
    placement_id VARCHAR(255) NOT NULL REFERENCES content_placements(placement_id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    added_by VARCHAR(255) NOT NULL,
    
    PRIMARY KEY (campaign_id, placement_id)
);

-- =============================================================================
-- Performance and Analytics Tables
-- =============================================================================

-- Placement slot performance metrics
CREATE TABLE placement_slot_metrics (
    metric_id VARCHAR(255) PRIMARY KEY,
    slot_id VARCHAR(255) NOT NULL REFERENCES placement_slots(slot_id) ON DELETE CASCADE,
    
    -- Period Definition
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    granularity VARCHAR(10) NOT NULL CHECK (granularity IN ('hour', 'day', 'week', 'month')),
    
    -- Visibility Metrics
    impressions INTEGER NOT NULL DEFAULT 0,
    unique_views INTEGER NOT NULL DEFAULT 0,
    view_duration_seconds INTEGER NOT NULL DEFAULT 0,
    viewability_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
    
    -- Engagement Metrics
    clicks INTEGER NOT NULL DEFAULT 0,
    click_through_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
    interaction_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
    bounce_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
    
    -- Performance Metrics
    conversions INTEGER NOT NULL DEFAULT 0,
    conversion_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
    revenue DECIMAL(12,2) NOT NULL DEFAULT 0,
    revenue_per_view DECIMAL(8,4) NOT NULL DEFAULT 0,
    
    -- Quality Metrics
    load_time_ms INTEGER NOT NULL DEFAULT 0,
    error_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
    performance_index INTEGER NOT NULL DEFAULT 0,
    competitive_index INTEGER,
    
    -- Metadata
    calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT slot_metrics_period CHECK (period_start < period_end)
);

-- Content placement performance metrics
CREATE TABLE content_placement_metrics (
    metric_id VARCHAR(255) PRIMARY KEY,
    placement_id VARCHAR(255) NOT NULL REFERENCES content_placements(placement_id) ON DELETE CASCADE,
    
    -- Period Definition
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    granularity VARCHAR(10) NOT NULL CHECK (granularity IN ('hour', 'day', 'week', 'month')),
    
    -- Content Performance
    impressions INTEGER NOT NULL DEFAULT 0,
    clicks INTEGER NOT NULL DEFAULT 0,
    click_through_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
    engagement_score DECIMAL(5,2) NOT NULL DEFAULT 0,
    
    -- Business Impact
    conversions INTEGER NOT NULL DEFAULT 0,
    conversion_value DECIMAL(12,2) NOT NULL DEFAULT 0,
    attributed_revenue DECIMAL(12,2) NOT NULL DEFAULT 0,
    cost_per_conversion DECIMAL(8,2),
    
    -- User Behavior
    average_time_spent INTEGER NOT NULL DEFAULT 0,
    interaction_depth INTEGER NOT NULL DEFAULT 0,
    return_visitor_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
    
    -- A/B Testing Results
    lift_over_control DECIMAL(8,4),
    confidence_level DECIMAL(5,2),
    statistical_significance BOOLEAN,
    
    -- Metadata
    calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT placement_metrics_period CHECK (period_start < period_end)
);

-- Campaign performance metrics
CREATE TABLE campaign_metrics (
    metric_id VARCHAR(255) PRIMARY KEY,
    campaign_id VARCHAR(255) NOT NULL REFERENCES placement_campaigns(campaign_id) ON DELETE CASCADE,
    
    -- Period Definition
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    granularity VARCHAR(10) NOT NULL CHECK (granularity IN ('hour', 'day', 'week', 'month')),
    
    -- Overall Performance
    total_impressions INTEGER NOT NULL DEFAULT 0,
    total_clicks INTEGER NOT NULL DEFAULT 0,
    total_conversions INTEGER NOT NULL DEFAULT 0,
    total_revenue DECIMAL(12,2) NOT NULL DEFAULT 0,
    
    -- Efficiency Metrics
    cost_per_click DECIMAL(8,4),
    cost_per_conversion DECIMAL(8,2),
    return_on_ad_spend DECIMAL(8,4),
    
    -- Goal Achievement (JSON field for KPI progress)
    kpi_progress JSONB NOT NULL DEFAULT '[]',
    
    -- Budget Utilization
    budget_spent DECIMAL(12,2),
    budget_remaining DECIMAL(12,2),
    pace_to_goal DECIMAL(5,2),
    
    -- Metadata
    calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT campaign_metrics_period CHECK (period_start < period_end)
);

-- =============================================================================
-- Indexes for Performance
-- =============================================================================

-- Placement slots indexes
CREATE INDEX idx_placement_slots_area_position ON placement_slots(placement_area, position);
CREATE INDEX idx_placement_slots_active ON placement_slots(is_active) WHERE is_active = true;
CREATE INDEX idx_placement_slots_priority ON placement_slots(priority DESC);
CREATE INDEX idx_placement_slots_tags ON placement_slots USING GIN(tags);

-- Content placements indexes
CREATE INDEX idx_content_placements_slot_id ON content_placements(slot_id);
CREATE INDEX idx_content_placements_content ON content_placements(content_type, content_id);
CREATE INDEX idx_content_placements_status ON content_placements(status);
CREATE INDEX idx_content_placements_scheduling ON content_placements(start_time, end_time);
CREATE INDEX idx_content_placements_experiment ON content_placements(experiment_id, variant_id);
CREATE INDEX idx_content_placements_priority ON content_placements(priority DESC);

-- Schedules indexes
CREATE INDEX idx_placement_schedules_placement ON placement_schedules(placement_id);
CREATE INDEX idx_placement_schedules_next_execution ON placement_schedules(next_execution) WHERE is_active = true;

-- Campaign indexes
CREATE INDEX idx_placement_campaigns_status ON placement_campaigns(status);
CREATE INDEX idx_placement_campaigns_dates ON placement_campaigns(start_date, end_date);
CREATE INDEX idx_campaign_placements_campaign ON campaign_placements(campaign_id);
CREATE INDEX idx_campaign_placements_placement ON campaign_placements(placement_id);

-- Metrics indexes
CREATE INDEX idx_slot_metrics_slot_period ON placement_slot_metrics(slot_id, period_start, period_end);
CREATE INDEX idx_placement_metrics_placement_period ON content_placement_metrics(placement_id, period_start, period_end);
CREATE INDEX idx_campaign_metrics_campaign_period ON campaign_metrics(campaign_id, period_start, period_end);

-- =============================================================================
-- Triggers for Automation
-- =============================================================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_placement_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timestamp triggers
CREATE TRIGGER trigger_update_placement_slots_timestamp
    BEFORE UPDATE ON placement_slots
    FOR EACH ROW EXECUTE FUNCTION update_placement_timestamp();

CREATE TRIGGER trigger_update_content_placements_timestamp
    BEFORE UPDATE ON content_placements
    FOR EACH ROW EXECUTE FUNCTION update_placement_timestamp();

CREATE TRIGGER trigger_update_placement_schedules_timestamp
    BEFORE UPDATE ON placement_schedules
    FOR EACH ROW EXECUTE FUNCTION update_placement_timestamp();

CREATE TRIGGER trigger_update_placement_campaigns_timestamp
    BEFORE UPDATE ON placement_campaigns
    FOR EACH ROW EXECUTE FUNCTION update_placement_timestamp();

-- =============================================================================
-- Views for Common Queries
-- =============================================================================

-- Active placements view
CREATE VIEW active_placements AS
SELECT 
    cp.*,
    ps.name as slot_name,
    ps.display_name as slot_display_name,
    ps.placement_area,
    ps.position
FROM content_placements cp
JOIN placement_slots ps ON cp.slot_id = ps.slot_id
WHERE cp.status = 'active'
  AND ps.is_active = true
  AND (cp.start_time IS NULL OR cp.start_time <= NOW())
  AND (cp.end_time IS NULL OR cp.end_time > NOW());

-- Sample placement slots for testing
INSERT INTO placement_slots (
    slot_id, name, display_name, description, placement_area, position,
    max_items, min_items, dimensions, styling, layout, created_by
) VALUES 
(
    'slot-homepage-hero', 'homepage_hero_banner', 'Homepage Hero Banner',
    'Main hero banner on homepage for featured content', 'homepage', 'hero_banner',
    1, 1, '{"width": 1200, "height": 400, "responsive": true}',
    '{"backgroundColor": "transparent", "borderRadius": 8}',
    '{"type": "stack", "alignment": "center"}', 'system'
),
(
    'slot-sidebar-top', 'sidebar_featured', 'Sidebar Featured Content',
    'Featured content area in sidebar', 'sidebar', 'sidebar_top',
    3, 1, '{"width": 300, "height": 250, "responsive": true}',
    '{"backgroundColor": "#f8f9fa", "borderRadius": 6, "padding": 16}',
    '{"type": "grid", "columns": 1, "gap": 12}', 'system'
);

COMMIT;