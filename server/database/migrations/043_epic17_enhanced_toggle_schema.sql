-- Epic 17 Enhanced Toggle Schema
-- Task: E17-1753114396713-B269E4 - Create toggle schema
-- 
-- This migration enhances the existing feature toggle system with Epic 17
-- admin dashboard capabilities, advanced analytics, performance tracking,
-- and comprehensive toggle management features.
--
-- Builds on: 014_feature_toggle_system.sql

-- ====================================
-- Epic 17 Toggle Analytics Tables
-- ====================================

-- Toggle analytics aggregation table for dashboard performance
CREATE TABLE IF NOT EXISTS feature_toggle_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    toggle_id UUID NOT NULL REFERENCES feature_toggle(id) ON DELETE CASCADE,
    
    -- Time period for aggregation
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    period_type VARCHAR(20) NOT NULL CHECK (period_type IN ('hourly', 'daily', 'weekly')),
    
    -- Evaluation metrics
    evaluation_count BIGINT DEFAULT 0,
    success_count BIGINT DEFAULT 0,
    error_count BIGINT DEFAULT 0,
    cache_hit_count BIGINT DEFAULT 0,
    cache_miss_count BIGINT DEFAULT 0,
    
    -- Performance metrics
    avg_evaluation_time DECIMAL(10, 4) DEFAULT 0,
    min_evaluation_time DECIMAL(10, 4) DEFAULT 0,
    max_evaluation_time DECIMAL(10, 4) DEFAULT 0,
    p50_evaluation_time DECIMAL(10, 4) DEFAULT 0,
    p95_evaluation_time DECIMAL(10, 4) DEFAULT 0,
    p99_evaluation_time DECIMAL(10, 4) DEFAULT 0,
    
    -- User engagement
    unique_users BIGINT DEFAULT 0,
    new_users BIGINT DEFAULT 0,
    returning_users BIGINT DEFAULT 0,
    
    -- Calculated metrics
    success_rate DECIMAL(5, 2) DEFAULT 100.00,
    error_rate DECIMAL(5, 2) DEFAULT 0.00,
    cache_hit_rate DECIMAL(5, 2) DEFAULT 0.00,
    popularity_score DECIMAL(5, 2) DEFAULT 0.00,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure unique periods per toggle
    UNIQUE(toggle_id, period_start, period_type)
);

-- Toggle health monitoring table
CREATE TABLE IF NOT EXISTS feature_toggle_health (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    toggle_id UUID NOT NULL REFERENCES feature_toggle(id) ON DELETE CASCADE,
    
    -- Health status
    status VARCHAR(20) NOT NULL DEFAULT 'healthy' 
        CHECK (status IN ('healthy', 'degraded', 'error', 'disabled')),
    health_score DECIMAL(5, 2) DEFAULT 100.00 CHECK (health_score >= 0 AND health_score <= 100),
    
    -- Performance indicators
    evaluation_latency_ms DECIMAL(10, 4) DEFAULT 0,
    error_rate_24h DECIMAL(5, 2) DEFAULT 0.00,
    cache_performance DECIMAL(5, 2) DEFAULT 100.00,
    dependency_status VARCHAR(20) DEFAULT 'ok' 
        CHECK (dependency_status IN ('ok', 'warning', 'blocked')),
    
    -- Health check metadata
    last_health_check TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    health_check_duration_ms INTEGER DEFAULT 0,
    issues_detected INTEGER DEFAULT 0,
    critical_issues INTEGER DEFAULT 0,
    
    -- System flags
    is_monitored BOOLEAN DEFAULT true,
    alert_threshold DECIMAL(5, 2) DEFAULT 90.00,
    last_alert_sent TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    -- One health record per toggle
    UNIQUE(toggle_id)
);

-- Toggle issues tracking table
CREATE TABLE IF NOT EXISTS feature_toggle_issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    toggle_id UUID NOT NULL REFERENCES feature_toggle(id) ON DELETE CASCADE,
    
    -- Issue classification
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'critical')),
    category VARCHAR(30) NOT NULL CHECK (category IN ('performance', 'dependency', 'evaluation', 'config', 'security')),
    
    -- Issue details
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    error_code VARCHAR(50),
    
    -- Impact assessment
    affected_users INTEGER DEFAULT 0,
    impact_severity VARCHAR(20) DEFAULT 'low' CHECK (impact_severity IN ('low', 'medium', 'high', 'critical')),
    
    -- Resolution tracking
    detected_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMPTZ,
    auto_resolve BOOLEAN DEFAULT false,
    resolved_by UUID REFERENCES users(id),
    resolution_notes TEXT,
    
    -- Metadata
    source VARCHAR(50) DEFAULT 'system', -- system, user, external
    occurrence_count INTEGER DEFAULT 1,
    last_occurred TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ====================================
-- Epic 17 Toggle Dashboard Metadata
-- ====================================

-- Extended toggle metadata for dashboard features
CREATE TABLE IF NOT EXISTS feature_toggle_dashboard (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    toggle_id UUID NOT NULL REFERENCES feature_toggle(id) ON DELETE CASCADE,
    
    -- Organization and ownership
    category VARCHAR(50) NOT NULL DEFAULT 'general',
    subcategory VARCHAR(50),
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    owner VARCHAR(100) NOT NULL,
    team VARCHAR(100),
    
    -- Review and approval
    reviewed_by VARCHAR(100),
    reviewed_at TIMESTAMPTZ,
    approval_required BOOLEAN DEFAULT false,
    approved_by VARCHAR(100),
    approved_at TIMESTAMPTZ,
    
    -- Documentation
    documentation_url TEXT,
    changelog_url TEXT,
    monitoring_dashboard_url TEXT,
    
    -- Business context
    business_justification TEXT,
    success_criteria TEXT,
    rollback_plan TEXT,
    
    -- Operational metadata
    last_modified_by_system BOOLEAN DEFAULT false,
    system_managed BOOLEAN DEFAULT false,
    maintenance_window VARCHAR(100),
    
    -- Display preferences
    dashboard_priority INTEGER DEFAULT 100,
    featured BOOLEAN DEFAULT false,
    hidden_from_list BOOLEAN DEFAULT false,
    custom_icon VARCHAR(100),
    custom_color VARCHAR(7), -- hex color code
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    -- One dashboard record per toggle
    UNIQUE(toggle_id)
);

-- ====================================
-- Epic 17 Security and Compliance
-- ====================================

-- Toggle security and risk management
CREATE TABLE IF NOT EXISTS feature_toggle_security (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    toggle_id UUID NOT NULL REFERENCES feature_toggle(id) ON DELETE CASCADE,
    
    -- Risk assessment
    risk_level VARCHAR(20) NOT NULL DEFAULT 'low' 
        CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    risk_factors TEXT[] DEFAULT ARRAY[]::TEXT[],
    risk_mitigation TEXT,
    
    -- Approval workflow
    requires_approval BOOLEAN DEFAULT false,
    approval_workflow_id VARCHAR(100),
    bypass_approval_allowed BOOLEAN DEFAULT false,
    emergency_override_allowed BOOLEAN DEFAULT true,
    
    -- Override tracking
    has_active_overrides BOOLEAN DEFAULT false,
    override_count INTEGER DEFAULT 0,
    last_override_at TIMESTAMPTZ,
    last_override_by VARCHAR(100),
    last_override_reason TEXT,
    
    -- Emergency controls
    emergency_kill_switch BOOLEAN DEFAULT false,
    kill_switch_activated BOOLEAN DEFAULT false,
    kill_switch_activated_at TIMESTAMPTZ,
    kill_switch_activated_by VARCHAR(100),
    
    -- Compliance tracking
    compliance_flags TEXT[] DEFAULT ARRAY[]::TEXT[],
    compliance_review_required BOOLEAN DEFAULT false,
    last_compliance_review TIMESTAMPTZ,
    compliance_notes TEXT,
    
    -- Audit requirements
    audit_level VARCHAR(20) DEFAULT 'standard' 
        CHECK (audit_level IN ('none', 'basic', 'standard', 'detailed', 'comprehensive')),
    retain_audit_days INTEGER DEFAULT 365,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    -- One security record per toggle
    UNIQUE(toggle_id)
);

-- ====================================
-- Epic 17 Rollout Management
-- ====================================

-- Rollout strategy and management
CREATE TABLE IF NOT EXISTS feature_toggle_rollout (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    toggle_id UUID NOT NULL REFERENCES feature_toggle(id) ON DELETE CASCADE,
    
    -- Rollout strategy
    strategy VARCHAR(20) NOT NULL DEFAULT 'immediate' 
        CHECK (strategy IN ('immediate', 'gradual', 'canary', 'blue_green')),
    rollout_speed VARCHAR(20) DEFAULT 'medium' CHECK (rollout_speed IN ('slow', 'medium', 'fast')),
    
    -- Progress tracking
    current_stage VARCHAR(50) NOT NULL DEFAULT 'not_started',
    target_percentage DECIMAL(5, 2) DEFAULT 100.00 CHECK (target_percentage >= 0 AND target_percentage <= 100),
    current_percentage DECIMAL(5, 2) DEFAULT 0.00 CHECK (current_percentage >= 0 AND current_percentage <= 100),
    
    -- Scheduling
    scheduled_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    estimated_completion TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- Rollback configuration
    auto_rollback_enabled BOOLEAN DEFAULT false,
    rollback_trigger_conditions JSONB DEFAULT '[]',
    rollback_percentage DECIMAL(5, 2) DEFAULT 0.00,
    max_error_rate DECIMAL(5, 2) DEFAULT 5.00,
    max_latency_ms INTEGER DEFAULT 2000,
    
    -- Stage configuration
    stages JSONB DEFAULT '[]', -- Array of rollout stages with percentages and conditions
    current_stage_started TIMESTAMPTZ,
    next_stage_scheduled TIMESTAMPTZ,
    
    -- Metrics and validation
    validation_criteria JSONB DEFAULT '{}',
    success_metrics JSONB DEFAULT '{}',
    current_metrics JSONB DEFAULT '{}',
    
    -- Control flags
    is_active BOOLEAN DEFAULT false,
    paused BOOLEAN DEFAULT false,
    paused_at TIMESTAMPTZ,
    paused_reason TEXT,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    
    -- One rollout plan per toggle
    UNIQUE(toggle_id)
);

-- ====================================
-- Epic 17 Alert and Notification System
-- ====================================

-- Toggle alert configurations
CREATE TABLE IF NOT EXISTS feature_toggle_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    toggle_id UUID REFERENCES feature_toggle(id) ON DELETE CASCADE,
    
    -- Alert identification
    alert_type VARCHAR(30) NOT NULL CHECK (alert_type IN ('performance', 'health', 'security', 'rollout', 'dependency')),
    alert_name VARCHAR(100) NOT NULL,
    
    -- Alert conditions
    conditions JSONB NOT NULL DEFAULT '{}', -- Threshold conditions
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'critical')),
    
    -- Notification settings
    enabled BOOLEAN DEFAULT true,
    notification_channels JSONB DEFAULT '[]', -- email, slack, webhook, sms
    escalation_rules JSONB DEFAULT '{}',
    
    -- Alert state
    is_triggered BOOLEAN DEFAULT false,
    triggered_at TIMESTAMPTZ,
    last_evaluation TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    evaluation_interval_minutes INTEGER DEFAULT 5,
    
    -- Suppression and throttling
    suppressed BOOLEAN DEFAULT false,
    suppressed_until TIMESTAMPTZ,
    throttle_minutes INTEGER DEFAULT 30,
    last_notification_sent TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id)
);

-- Alert incident tracking
CREATE TABLE IF NOT EXISTS feature_toggle_alert_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id UUID NOT NULL REFERENCES feature_toggle_alerts(id) ON DELETE CASCADE,
    toggle_id UUID NOT NULL REFERENCES feature_toggle(id) ON DELETE CASCADE,
    
    -- Incident details
    incident_id VARCHAR(100) UNIQUE NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'critical')),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    
    -- State tracking
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'investigating', 'resolved', 'closed')),
    acknowledged BOOLEAN DEFAULT false,
    acknowledged_by UUID REFERENCES users(id),
    acknowledged_at TIMESTAMPTZ,
    
    -- Resolution tracking
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES users(id),
    resolution_notes TEXT,
    auto_resolved BOOLEAN DEFAULT false,
    
    -- Impact tracking
    affected_users INTEGER DEFAULT 0,
    business_impact VARCHAR(20) DEFAULT 'low' CHECK (business_impact IN ('none', 'low', 'medium', 'high', 'critical')),
    
    -- Metadata
    triggered_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    first_notification_sent TIMESTAMPTZ,
    last_notification_sent TIMESTAMPTZ,
    notification_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ====================================
-- Epic 17 Enhanced Indexes
-- ====================================

-- Analytics table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_toggle_analytics_toggle_period 
    ON feature_toggle_analytics(toggle_id, period_start DESC, period_type);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_toggle_analytics_metrics 
    ON feature_toggle_analytics(success_rate, error_rate, popularity_score);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_toggle_analytics_time_series 
    ON feature_toggle_analytics(period_start DESC) 
    WHERE period_type = 'hourly';

-- Health monitoring indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_toggle_health_status 
    ON feature_toggle_health(status, health_score);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_toggle_health_check_time 
    ON feature_toggle_health(last_health_check DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_toggle_health_alerts 
    ON feature_toggle_health(health_score) 
    WHERE health_score < 90;

-- Issues tracking indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_toggle_issues_toggle_severity 
    ON feature_toggle_issues(toggle_id, severity, detected_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_toggle_issues_unresolved 
    ON feature_toggle_issues(detected_at DESC) 
    WHERE resolved_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_toggle_issues_category 
    ON feature_toggle_issues(category, severity);

-- Dashboard metadata indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_toggle_dashboard_category 
    ON feature_toggle_dashboard(category, subcategory);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_toggle_dashboard_owner 
    ON feature_toggle_dashboard(owner, team);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_toggle_dashboard_tags 
    ON feature_toggle_dashboard USING GIN(tags);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_toggle_dashboard_featured 
    ON feature_toggle_dashboard(featured, dashboard_priority) 
    WHERE featured = true;

-- Security indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_toggle_security_risk 
    ON feature_toggle_security(risk_level, requires_approval);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_toggle_security_overrides 
    ON feature_toggle_security(has_active_overrides, last_override_at DESC) 
    WHERE has_active_overrides = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_toggle_security_compliance 
    ON feature_toggle_security USING GIN(compliance_flags);

-- Rollout indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_toggle_rollout_active 
    ON feature_toggle_rollout(is_active, current_percentage) 
    WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_toggle_rollout_scheduled 
    ON feature_toggle_rollout(scheduled_at) 
    WHERE scheduled_at > CURRENT_TIMESTAMP;

-- Alert indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_toggle_alerts_enabled 
    ON feature_toggle_alerts(enabled, last_evaluation) 
    WHERE enabled = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_toggle_alerts_triggered 
    ON feature_toggle_alerts(is_triggered, triggered_at DESC) 
    WHERE is_triggered = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_alert_incidents_open 
    ON feature_toggle_alert_incidents(status, triggered_at DESC) 
    WHERE status IN ('open', 'acknowledged', 'investigating');

-- ====================================
-- Epic 17 Functions and Triggers
-- ====================================

-- Function to update analytics aggregations
CREATE OR REPLACE FUNCTION update_toggle_analytics()
RETURNS TRIGGER AS $$
BEGIN
    -- This would be called by application code to aggregate metrics
    -- Placeholder for analytics update logic
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to update health scores
CREATE OR REPLACE FUNCTION calculate_toggle_health_score(p_toggle_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    health_score DECIMAL := 100.0;
    error_rate DECIMAL;
    latency DECIMAL;
    issue_count INTEGER;
BEGIN
    -- Get recent error rate
    SELECT COALESCE(error_rate_24h, 0) INTO error_rate
    FROM feature_toggle_health
    WHERE toggle_id = p_toggle_id;
    
    -- Get issue count
    SELECT COUNT(*) INTO issue_count
    FROM feature_toggle_issues
    WHERE toggle_id = p_toggle_id AND resolved_at IS NULL;
    
    -- Calculate health score based on multiple factors
    health_score := health_score - (error_rate * 10); -- Error rate impact
    health_score := health_score - (issue_count * 5); -- Issue impact
    
    -- Ensure score is between 0 and 100
    health_score := GREATEST(0, LEAST(100, health_score));
    
    RETURN health_score;
END;
$$ LANGUAGE plpgsql;

-- Function to check alert conditions
CREATE OR REPLACE FUNCTION evaluate_toggle_alerts()
RETURNS VOID AS $$
DECLARE
    alert_record RECORD;
    toggle_health RECORD;
    should_trigger BOOLEAN;
BEGIN
    -- Iterate through enabled alerts
    FOR alert_record IN 
        SELECT * FROM feature_toggle_alerts 
        WHERE enabled = true 
        AND (last_evaluation IS NULL OR last_evaluation < NOW() - (evaluation_interval_minutes || ' minutes')::INTERVAL)
    LOOP
        -- Get toggle health data
        SELECT h.*, t.enabled as toggle_enabled
        INTO toggle_health
        FROM feature_toggle_health h
        JOIN feature_toggle t ON h.toggle_id = t.id
        WHERE h.toggle_id = alert_record.toggle_id;
        
        -- Evaluate alert conditions (simplified logic)
        should_trigger := FALSE;
        
        IF alert_record.alert_type = 'health' THEN
            should_trigger := toggle_health.health_score < COALESCE((alert_record.conditions->>'health_threshold')::DECIMAL, 90);
        ELSIF alert_record.alert_type = 'performance' THEN
            should_trigger := toggle_health.error_rate_24h > COALESCE((alert_record.conditions->>'error_threshold')::DECIMAL, 5);
        END IF;
        
        -- Update alert state
        UPDATE feature_toggle_alerts
        SET 
            is_triggered = should_trigger,
            triggered_at = CASE WHEN should_trigger AND NOT is_triggered THEN NOW() ELSE triggered_at END,
            last_evaluation = NOW()
        WHERE id = alert_record.id;
        
        -- Create incident if newly triggered
        IF should_trigger AND NOT alert_record.is_triggered THEN
            INSERT INTO feature_toggle_alert_incidents (
                alert_id, toggle_id, incident_id, severity, title, message, triggered_at
            ) VALUES (
                alert_record.id,
                alert_record.toggle_id,
                'INC_' || generate_random_uuid(),
                alert_record.severity,
                alert_record.alert_name || ' Alert',
                'Alert triggered for toggle: ' || alert_record.toggle_id,
                NOW()
            );
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically create dashboard metadata for new toggles
CREATE OR REPLACE FUNCTION create_toggle_dashboard_metadata()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO feature_toggle_dashboard (toggle_id, category, owner)
    VALUES (NEW.id, 'general', COALESCE(NEW.created_by::text, 'system'))
    ON CONFLICT (toggle_id) DO NOTHING;
    
    INSERT INTO feature_toggle_health (toggle_id)
    VALUES (NEW.id)
    ON CONFLICT (toggle_id) DO NOTHING;
    
    INSERT INTO feature_toggle_security (toggle_id)
    VALUES (NEW.id)
    ON CONFLICT (toggle_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on feature toggle creation
CREATE TRIGGER create_toggle_metadata_trigger
    AFTER INSERT ON feature_toggle
    FOR EACH ROW EXECUTE FUNCTION create_toggle_dashboard_metadata();

-- Trigger to update timestamps
CREATE TRIGGER update_toggle_analytics_timestamp
    BEFORE UPDATE ON feature_toggle_analytics
    FOR EACH ROW EXECUTE FUNCTION update_toggle_timestamp();

CREATE TRIGGER update_toggle_health_timestamp
    BEFORE UPDATE ON feature_toggle_health
    FOR EACH ROW EXECUTE FUNCTION update_toggle_timestamp();

CREATE TRIGGER update_toggle_dashboard_timestamp
    BEFORE UPDATE ON feature_toggle_dashboard
    FOR EACH ROW EXECUTE FUNCTION update_toggle_timestamp();

CREATE TRIGGER update_toggle_security_timestamp
    BEFORE UPDATE ON feature_toggle_security
    FOR EACH ROW EXECUTE FUNCTION update_toggle_timestamp();

CREATE TRIGGER update_toggle_rollout_timestamp
    BEFORE UPDATE ON feature_toggle_rollout
    FOR EACH ROW EXECUTE FUNCTION update_toggle_timestamp();

-- ====================================
-- Epic 17 Views for Dashboard Queries
-- ====================================

-- Comprehensive toggle view for dashboard
CREATE OR REPLACE VIEW epic17_toggle_dashboard_view AS
SELECT 
    t.id,
    t.key,
    t.name,
    t.description,
    t.type,
    t.value,
    t.enabled,
    t.archived,
    t.claude_impact,
    t.created_at,
    t.updated_at,
    t.version,
    
    -- Dashboard metadata
    d.category,
    d.subcategory,
    d.tags,
    d.owner,
    d.team,
    d.reviewed_by,
    d.reviewed_at,
    d.approval_required,
    d.featured,
    
    -- Health information
    h.status as health_status,
    h.health_score,
    h.error_rate_24h,
    h.dependency_status,
    h.last_health_check,
    h.issues_detected,
    h.critical_issues,
    
    -- Security information
    s.risk_level,
    s.requires_approval,
    s.has_active_overrides,
    s.emergency_kill_switch,
    s.compliance_flags,
    
    -- Analytics (latest daily aggregation)
    a.evaluation_count as evaluations_today,
    a.success_rate,
    a.error_rate as current_error_rate,
    a.cache_hit_rate,
    a.popularity_score,
    a.avg_evaluation_time,
    a.p95_evaluation_time,
    
    -- Rollout information
    r.strategy as rollout_strategy,
    r.current_stage as rollout_stage,
    r.current_percentage as rollout_percentage,
    r.is_active as rollout_active

FROM feature_toggle t
LEFT JOIN feature_toggle_dashboard d ON t.id = d.toggle_id
LEFT JOIN feature_toggle_health h ON t.id = h.toggle_id
LEFT JOIN feature_toggle_security s ON t.id = s.toggle_id
LEFT JOIN feature_toggle_rollout r ON t.id = r.toggle_id
LEFT JOIN LATERAL (
    SELECT *
    FROM feature_toggle_analytics
    WHERE toggle_id = t.id 
    AND period_type = 'daily'
    ORDER BY period_start DESC
    LIMIT 1
) a ON true;

-- Toggle summary view for quick dashboard stats
CREATE OR REPLACE VIEW epic17_toggle_summary_view AS
SELECT
    COUNT(*) as total_toggles,
    COUNT(*) FILTER (WHERE enabled = true) as enabled_toggles,
    COUNT(*) FILTER (WHERE archived = true) as archived_toggles,
    COUNT(*) FILTER (WHERE health_status = 'healthy') as healthy_toggles,
    COUNT(*) FILTER (WHERE health_status IN ('degraded', 'error')) as unhealthy_toggles,
    COUNT(*) FILTER (WHERE risk_level IN ('high', 'critical')) as high_risk_toggles,
    COUNT(*) FILTER (WHERE has_active_overrides = true) as toggles_with_overrides,
    COUNT(*) FILTER (WHERE claude_impact != 'NONE') as claude_impacting_toggles,
    AVG(health_score) as avg_health_score,
    AVG(success_rate) as avg_success_rate
FROM epic17_toggle_dashboard_view
WHERE archived = false;

-- ====================================
-- Epic 17 Sample Data and Configuration
-- ====================================

-- Insert some sample Epic 17 enhanced toggles
INSERT INTO feature_toggle (key, name, description, type, value, claude_impact) VALUES
('epic17_enhanced_dashboard', 'Enhanced Admin Dashboard', 'Epic 17 comprehensive admin dashboard with analytics', 'boolean', '{"enabled": true}', 'NONE'),
('claude_advanced_reasoning', 'Claude Advanced Reasoning', 'Enable advanced reasoning capabilities in Claude responses', 'percentage_rollout', '{"percentage": 25}', 'OUTPUT_QUALITY'),
('ai_safety_guardrails', 'AI Safety Guardrails', 'Enhanced safety measures for AI responses', 'boolean', '{"enabled": true}', 'HALLUCINATION_RISK'),
('performance_optimized_cache', 'Performance Cache Optimization', 'Advanced caching for better response times', 'multivariate', '{"variants": [{"key": "standard", "percentage": 70}, {"key": "aggressive", "percentage": 30}]}', 'PROMPT_COST')
ON CONFLICT (key) DO NOTHING;

-- Set up default alert configurations
INSERT INTO feature_toggle_alerts (toggle_id, alert_type, alert_name, conditions, severity, notification_channels) 
SELECT 
    id,
    'health',
    'Health Score Alert',
    '{"health_threshold": 85}',
    'warning',
    '["email"]'
FROM feature_toggle
WHERE key IN ('claude_advanced_reasoning', 'ai_safety_guardrails')
ON CONFLICT DO NOTHING;

-- Grant permissions for Epic 17 tables
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO app_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO app_user;

-- Comments for documentation
COMMENT ON TABLE feature_toggle_analytics IS 'Epic 17: Aggregated analytics data for toggle dashboard performance monitoring';
COMMENT ON TABLE feature_toggle_health IS 'Epic 17: Health monitoring and status tracking for feature toggles';
COMMENT ON TABLE feature_toggle_issues IS 'Epic 17: Issue tracking and resolution for toggle problems';
COMMENT ON TABLE feature_toggle_dashboard IS 'Epic 17: Dashboard metadata and organizational information';
COMMENT ON TABLE feature_toggle_security IS 'Epic 17: Security, risk management, and compliance tracking';
COMMENT ON TABLE feature_toggle_rollout IS 'Epic 17: Advanced rollout strategies and management';
COMMENT ON TABLE feature_toggle_alerts IS 'Epic 17: Alert configurations and monitoring rules';
COMMENT ON TABLE feature_toggle_alert_incidents IS 'Epic 17: Alert incident tracking and resolution';

COMMENT ON VIEW epic17_toggle_dashboard_view IS 'Epic 17: Comprehensive view combining all toggle data for dashboard queries';
COMMENT ON VIEW epic17_toggle_summary_view IS 'Epic 17: Summary statistics for dashboard overview widgets';

-- Create a cron job placeholder for analytics aggregation
-- This would typically be set up with pg_cron or external job scheduler
-- SELECT cron.schedule('toggle-analytics-hourly', '0 * * * *', 'SELECT aggregate_toggle_analytics();');