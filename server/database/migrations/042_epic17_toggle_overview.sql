-- Epic 17 Toggle Overview Database Schema
-- Task: E17-1753114396748-B93794 - Develop toggle overview
-- 
-- Creates comprehensive toggle overview infrastructure for Epic 17 API Management System
-- including dashboard widgets, analytics data, reporting, health monitoring, and
-- comprehensive visualization capabilities with real-time updates and insights.

-- Dashboard widgets configuration and management
CREATE TABLE IF NOT EXISTS epic17_dashboard_widgets (
    id SERIAL PRIMARY KEY,
    widget_id UUID UNIQUE NOT NULL,
    dashboard_id UUID, -- Optional grouping for multiple dashboards
    widget_type VARCHAR(30) NOT NULL, -- metric, chart, table, alert, status, heatmap, gauge
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Position and sizing
    position JSONB NOT NULL, -- {x, y, width, height} for grid layout
    z_index INTEGER DEFAULT 1,
    
    -- Data configuration
    data_source VARCHAR(100) NOT NULL, -- toggles, analytics, health, audit_logs, etc.
    metrics JSONB DEFAULT '[]'::jsonb, -- Array of metric types
    time_range VARCHAR(30) DEFAULT 'last_24_hours', -- last_hour, last_4_hours, last_24_hours, last_7_days, etc.
    filters JSONB DEFAULT '{}'::jsonb, -- Data filtering configuration
    
    -- Visualization settings
    chart_type VARCHAR(30), -- line_chart, bar_chart, pie_chart, heatmap, gauge, treemap, scatter_plot
    color_scheme VARCHAR(50),
    display_options JSONB DEFAULT '{}'::jsonb, -- Widget-specific display options
    
    -- Update and refresh settings
    auto_refresh BOOLEAN DEFAULT TRUE,
    refresh_interval INTEGER DEFAULT 30, -- seconds
    last_refreshed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Interactivity
    drill_down_enabled BOOLEAN DEFAULT TRUE,
    click_actions JSONB DEFAULT '[]'::jsonb, -- Array of click action configurations
    
    -- Widget lifecycle
    is_active BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Access control
    is_public BOOLEAN DEFAULT TRUE,
    allowed_users JSONB DEFAULT '[]'::jsonb, -- Array of user IDs with access
    allowed_roles JSONB DEFAULT '[]'::jsonb, -- Array of roles with access
    
    -- Organization and metadata
    tags JSONB DEFAULT '[]'::jsonb, -- Array of tags for categorization
    category VARCHAR(50), -- performance, health, usage, security, etc.
    priority INTEGER DEFAULT 1, -- Display priority
    
    -- Indexes
    INDEX idx_epic17_widgets_widget_id (widget_id),
    INDEX idx_epic17_widgets_dashboard_id (dashboard_id),
    INDEX idx_epic17_widgets_type (widget_type),
    INDEX idx_epic17_widgets_data_source (data_source),
    INDEX idx_epic17_widgets_created_by (created_by),
    INDEX idx_epic17_widgets_active (is_active, priority),
    INDEX idx_epic17_widgets_category (category),
    INDEX idx_epic17_widgets_tags_gin (tags) USING gin,
    INDEX idx_epic17_widgets_public (is_public, created_at)
);

-- Toggle analytics data aggregated for dashboard consumption
CREATE TABLE IF NOT EXISTS epic17_toggle_analytics_aggregated (
    id SERIAL PRIMARY KEY,
    analytics_id UUID UNIQUE NOT NULL,
    aggregation_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    aggregation_period VARCHAR(20) NOT NULL, -- minute, hour, day, week, month
    aggregation_level VARCHAR(20) NOT NULL, -- system, category, toggle, user
    
    -- Aggregation scope
    scope_identifier VARCHAR(255), -- toggle_id, category name, user_id, or 'system' for global
    scope_metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Core metrics
    total_requests INTEGER DEFAULT 0,
    successful_requests INTEGER DEFAULT 0,
    failed_requests INTEGER DEFAULT 0,
    unique_users INTEGER DEFAULT 0,
    
    -- Performance metrics
    avg_response_time DECIMAL(10,2) DEFAULT 0,
    min_response_time INTEGER DEFAULT 0,
    max_response_time INTEGER DEFAULT 0,
    p95_response_time INTEGER DEFAULT 0,
    p99_response_time INTEGER DEFAULT 0,
    
    -- Usage patterns
    peak_usage_count INTEGER DEFAULT 0,
    peak_usage_time TIMESTAMP WITH TIME ZONE,
    usage_distribution JSONB DEFAULT '{}'::jsonb, -- Hourly distribution
    
    -- Toggle-specific metrics
    toggle_changes INTEGER DEFAULT 0,
    toggle_failures INTEGER DEFAULT 0,
    dependency_violations INTEGER DEFAULT 0,
    
    -- Geographic and environmental data
    geographic_breakdown JSONB DEFAULT '{}'::jsonb,
    environment_breakdown JSONB DEFAULT '{}'::jsonb,
    user_agent_breakdown JSONB DEFAULT '{}'::jsonb,
    
    -- Trend indicators
    growth_rate DECIMAL(5,2) DEFAULT 0, -- Percentage change from previous period
    trend_direction VARCHAR(10) DEFAULT 'stable', -- increasing, decreasing, stable, volatile
    seasonality_score DECIMAL(3,2) DEFAULT 0, -- 0-1 scale indicating seasonal patterns
    
    -- Quality metrics
    data_quality_score DECIMAL(3,2) DEFAULT 1.0, -- 0-1 scale
    completeness_percentage DECIMAL(5,2) DEFAULT 100,
    anomaly_count INTEGER DEFAULT 0,
    
    -- Indexes
    INDEX idx_epic17_analytics_agg_analytics_id (analytics_id),
    INDEX idx_epic17_analytics_agg_timestamp (aggregation_timestamp),
    INDEX idx_epic17_analytics_agg_period (aggregation_period),
    INDEX idx_epic17_analytics_agg_level (aggregation_level),
    INDEX idx_epic17_analytics_agg_scope (scope_identifier),
    INDEX idx_epic17_analytics_agg_requests (total_requests, successful_requests),
    INDEX idx_epic17_analytics_agg_performance (avg_response_time, p95_response_time),
    INDEX idx_epic17_analytics_agg_recent (aggregation_timestamp DESC, aggregation_period) WHERE aggregation_timestamp >= NOW() - INTERVAL '7 days',
    INDEX idx_epic17_analytics_agg_trending (scope_identifier, aggregation_period, aggregation_timestamp DESC)
);

-- Toggle reports and scheduled reporting
CREATE TABLE IF NOT EXISTS epic17_toggle_reports (
    id SERIAL PRIMARY KEY,
    report_id UUID UNIQUE NOT NULL,
    report_type VARCHAR(30) NOT NULL, -- summary, detailed, trend, health, compliance, custom
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Report configuration
    time_range VARCHAR(30) NOT NULL, -- last_hour, last_24_hours, last_7_days, etc.
    custom_time_range JSONB, -- {start: timestamp, end: timestamp} for custom ranges
    filters JSONB DEFAULT '{}'::jsonb, -- Report filtering configuration
    metrics JSONB DEFAULT '[]'::jsonb, -- Array of metrics to include
    
    -- Output configuration
    format VARCHAR(20) NOT NULL, -- html, pdf, csv, json, excel
    output_options JSONB DEFAULT '{}'::jsonb, -- Format-specific options
    
    -- Report content
    executive_summary TEXT,
    key_findings JSONB DEFAULT '[]'::jsonb, -- Array of key finding strings
    recommendations JSONB DEFAULT '[]'::jsonb, -- Array of recommendation strings
    data_analysis JSONB DEFAULT '{}'::jsonb, -- Complete analytics data structure
    
    -- Generation metadata
    generated_by VARCHAR(255) NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    generation_duration INTEGER DEFAULT 0, -- milliseconds
    report_period JSONB NOT NULL, -- {start: timestamp, end: timestamp}
    version VARCHAR(20) DEFAULT '1.0',
    
    -- Distribution and delivery
    recipients JSONB DEFAULT '[]'::jsonb, -- Array of recipient identifiers
    delivery_methods JSONB DEFAULT '[]'::jsonb, -- email, download, api, webhook
    delivered_at TIMESTAMP WITH TIME ZONE,
    delivery_status VARCHAR(20) DEFAULT 'pending', -- pending, delivered, failed
    
    -- Scheduling (for recurring reports)
    is_scheduled BOOLEAN DEFAULT FALSE,
    schedule_config JSONB DEFAULT '{}'::jsonb, -- Cron expression, frequency, etc.
    next_generation TIMESTAMP WITH TIME ZONE,
    last_generated TIMESTAMP WITH TIME ZONE,
    
    -- File management
    output_file_path TEXT,
    output_file_size INTEGER,
    file_checksum VARCHAR(255),
    file_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Report lifecycle
    status VARCHAR(20) DEFAULT 'completed', -- generating, completed, failed, expired
    errors JSONB DEFAULT '[]'::jsonb,
    warnings JSONB DEFAULT '[]'::jsonb,
    
    -- Indexes
    INDEX idx_epic17_reports_report_id (report_id),
    INDEX idx_epic17_reports_type (report_type),
    INDEX idx_epic17_reports_generated_by (generated_by),
    INDEX idx_epic17_reports_generated_at (generated_at),
    INDEX idx_epic17_reports_status (status),
    INDEX idx_epic17_reports_scheduled (is_scheduled, next_generation),
    INDEX idx_epic17_reports_recent (generated_at DESC) WHERE generated_at >= NOW() - INTERVAL '30 days',
    INDEX idx_epic17_reports_delivery (delivery_status, delivered_at)
);

-- Dashboard layout and configuration management
CREATE TABLE IF NOT EXISTS epic17_dashboard_layouts (
    id SERIAL PRIMARY KEY,
    layout_id UUID UNIQUE NOT NULL,
    layout_name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Layout configuration
    layout_type VARCHAR(30) DEFAULT 'grid', -- grid, flex, absolute
    layout_config JSONB NOT NULL, -- Layout-specific configuration
    
    -- Widget organization
    widget_positions JSONB DEFAULT '[]'::jsonb, -- Array of widget position configurations
    default_widget_size JSONB DEFAULT '{"width": 4, "height": 3}'::jsonb,
    grid_configuration JSONB DEFAULT '{"columns": 12, "rowHeight": 30, "margin": [10, 10]}'::jsonb,
    
    -- Layout metadata
    is_default BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,
    category VARCHAR(50), -- executive, operational, technical, custom
    
    -- Access control
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    allowed_users JSONB DEFAULT '[]'::jsonb,
    allowed_roles JSONB DEFAULT '[]'::jsonb,
    
    -- Usage statistics
    usage_count INTEGER DEFAULT 0,
    last_used TIMESTAMP WITH TIME ZONE,
    average_session_duration INTEGER DEFAULT 0, -- seconds
    
    -- Version control
    version VARCHAR(20) DEFAULT '1.0',
    parent_layout_id UUID, -- For layout inheritance
    
    -- Indexes
    INDEX idx_epic17_layouts_layout_id (layout_id),
    INDEX idx_epic17_layouts_name (layout_name),
    INDEX idx_epic17_layouts_type (layout_type),
    INDEX idx_epic17_layouts_created_by (created_by),
    INDEX idx_epic17_layouts_category (category),
    INDEX idx_epic17_layouts_default (is_default),
    INDEX idx_epic17_layouts_public (is_public),
    INDEX idx_epic17_layouts_usage (usage_count DESC, last_used DESC),
    
    FOREIGN KEY (parent_layout_id) REFERENCES epic17_dashboard_layouts(layout_id) ON DELETE SET NULL
);

-- Health monitoring and alerting configuration
CREATE TABLE IF NOT EXISTS epic17_health_monitoring (
    id SERIAL PRIMARY KEY,
    monitor_id UUID UNIQUE NOT NULL,
    monitor_name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Monitoring configuration
    monitor_type VARCHAR(30) NOT NULL, -- metric_threshold, trend_analysis, anomaly_detection, availability
    metric_type VARCHAR(50) NOT NULL, -- usage_count, response_time, error_rate, etc.
    
    -- Threshold configuration
    warning_threshold DECIMAL(10,2),
    critical_threshold DECIMAL(10,2),
    comparison_operator VARCHAR(20) DEFAULT 'greater_than', -- greater_than, less_than, equals, between
    threshold_config JSONB DEFAULT '{}'::jsonb, -- Additional threshold configuration
    
    -- Monitoring scope
    scope_type VARCHAR(30) NOT NULL, -- system, category, toggle, user
    scope_identifiers JSONB DEFAULT '[]'::jsonb, -- Array of identifiers to monitor
    
    -- Evaluation settings
    evaluation_window VARCHAR(30) DEFAULT 'last_5_minutes', -- Time window for evaluation
    evaluation_frequency INTEGER DEFAULT 300, -- seconds
    consecutive_violations_required INTEGER DEFAULT 1,
    
    -- Alert configuration
    alert_enabled BOOLEAN DEFAULT TRUE,
    alert_channels JSONB DEFAULT '[]'::jsonb, -- email, slack, webhook, sms
    alert_recipients JSONB DEFAULT '[]'::jsonb, -- Array of recipient configurations
    escalation_policy JSONB DEFAULT '{}'::jsonb, -- Escalation rules and timeouts
    
    -- State tracking
    current_status VARCHAR(20) DEFAULT 'healthy', -- healthy, warning, critical, unknown
    current_value DECIMAL(10,2),
    last_evaluation TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_violation TIMESTAMP WITH TIME ZONE,
    violation_count INTEGER DEFAULT 0,
    
    -- Alert suppression
    suppression_enabled BOOLEAN DEFAULT FALSE,
    suppression_until TIMESTAMP WITH TIME ZONE,
    suppression_reason TEXT,
    
    -- Monitor lifecycle
    is_active BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_epic17_health_monitoring_monitor_id (monitor_id),
    INDEX idx_epic17_health_monitoring_type (monitor_type),
    INDEX idx_epic17_health_monitoring_metric (metric_type),
    INDEX idx_epic17_health_monitoring_status (current_status),
    INDEX idx_epic17_health_monitoring_active (is_active, alert_enabled),
    INDEX idx_epic17_health_monitoring_evaluation (last_evaluation, evaluation_frequency),
    INDEX idx_epic17_health_monitoring_violations (violation_count, last_violation),
    INDEX idx_epic17_health_monitoring_scope (scope_type, scope_identifiers) USING gin
);

-- Health monitoring alerts and incidents
CREATE TABLE IF NOT EXISTS epic17_health_alerts (
    id SERIAL PRIMARY KEY,
    alert_id UUID UNIQUE NOT NULL,
    monitor_id UUID NOT NULL,
    
    -- Alert details
    alert_type VARCHAR(30) NOT NULL, -- threshold_exceeded, anomaly_detected, service_down
    severity VARCHAR(20) NOT NULL, -- low, medium, high, critical
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    
    -- Alert data
    triggered_value DECIMAL(10,2),
    threshold_value DECIMAL(10,2),
    evaluation_context JSONB DEFAULT '{}'::jsonb, -- Context data for the evaluation
    
    -- Alert lifecycle
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    acknowledged_by VARCHAR(255),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by VARCHAR(255),
    resolution_notes TEXT,
    
    -- Status tracking
    status VARCHAR(20) DEFAULT 'triggered', -- triggered, acknowledged, resolved, suppressed
    escalation_level INTEGER DEFAULT 1,
    escalated_at TIMESTAMP WITH TIME ZONE,
    escalated_to VARCHAR(255),
    
    -- Notification tracking
    notifications_sent INTEGER DEFAULT 0,
    last_notification_sent TIMESTAMP WITH TIME ZONE,
    notification_channels JSONB DEFAULT '[]'::jsonb, -- Channels actually used
    notification_errors JSONB DEFAULT '[]'::jsonb,
    
    -- Impact assessment
    affected_toggles JSONB DEFAULT '[]'::jsonb, -- Array of affected toggle IDs
    estimated_impact VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
    user_impact_count INTEGER DEFAULT 0,
    
    -- Indexes
    INDEX idx_epic17_health_alerts_alert_id (alert_id),
    INDEX idx_epic17_health_alerts_monitor_id (monitor_id),
    INDEX idx_epic17_health_alerts_severity (severity),
    INDEX idx_epic17_health_alerts_status (status),
    INDEX idx_epic17_health_alerts_triggered_at (triggered_at),
    INDEX idx_epic17_health_alerts_active (status, triggered_at) WHERE status IN ('triggered', 'acknowledged'),
    INDEX idx_epic17_health_alerts_recent (triggered_at DESC) WHERE triggered_at >= NOW() - INTERVAL '30 days',
    
    FOREIGN KEY (monitor_id) REFERENCES epic17_health_monitoring(monitor_id) ON DELETE CASCADE
);

-- Toggle insights and recommendations
CREATE TABLE IF NOT EXISTS epic17_toggle_insights (
    id SERIAL PRIMARY KEY,
    insight_id UUID UNIQUE NOT NULL,
    insight_type VARCHAR(30) NOT NULL, -- recommendation, warning, optimization, trend, anomaly
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    
    -- Insight metadata
    confidence DECIMAL(3,2) NOT NULL, -- 0-1 scale
    impact VARCHAR(20) NOT NULL, -- low, medium, high
    category VARCHAR(50), -- performance, security, usage, cost, reliability
    
    -- Insight data
    related_metrics JSONB DEFAULT '[]'::jsonb, -- Array of related metric types
    affected_toggles JSONB DEFAULT '[]'::jsonb, -- Array of affected toggle IDs
    data_context JSONB DEFAULT '{}'::jsonb, -- Supporting data for the insight
    
    -- Recommendations
    action_required BOOLEAN DEFAULT FALSE,
    suggested_actions JSONB DEFAULT '[]'::jsonb, -- Array of suggested action strings
    estimated_effort VARCHAR(20), -- low, medium, high
    expected_benefit VARCHAR(20), -- low, medium, high
    
    -- Insight lifecycle
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- User interaction
    viewed_by JSONB DEFAULT '[]'::jsonb, -- Array of users who have viewed
    acknowledged_by VARCHAR(255),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    dismissed_by VARCHAR(255),
    dismissed_at TIMESTAMP WITH TIME ZONE,
    dismissal_reason TEXT,
    
    -- Action tracking
    actions_taken JSONB DEFAULT '[]'::jsonb, -- Array of actions taken based on insight
    outcome VARCHAR(20), -- improved, no_change, worsened, unknown
    outcome_notes TEXT,
    
    -- Generation metadata
    generation_method VARCHAR(30) DEFAULT 'automated', -- automated, manual, ml_model
    generation_confidence DECIMAL(3,2) DEFAULT 0.8,
    data_sources JSONB DEFAULT '[]'::jsonb, -- Sources used to generate insight
    
    -- Indexes
    INDEX idx_epic17_insights_insight_id (insight_id),
    INDEX idx_epic17_insights_type (insight_type),
    INDEX idx_epic17_insights_impact (impact),
    INDEX idx_epic17_insights_confidence (confidence),
    INDEX idx_epic17_insights_category (category),
    INDEX idx_epic17_insights_active (is_active, generated_at DESC),
    INDEX idx_epic17_insights_action_required (action_required, confidence DESC),
    INDEX idx_epic17_insights_recent (generated_at DESC) WHERE generated_at >= NOW() - INTERVAL '7 days',
    INDEX idx_epic17_insights_affected_toggles_gin (affected_toggles) USING gin
);

-- Real-time metrics cache for fast dashboard loading
CREATE TABLE IF NOT EXISTS epic17_realtime_metrics_cache (
    id SERIAL PRIMARY KEY,
    cache_key VARCHAR(255) UNIQUE NOT NULL,
    metric_type VARCHAR(50) NOT NULL,
    scope_type VARCHAR(30) NOT NULL, -- system, category, toggle
    scope_identifier VARCHAR(255), -- NULL for system-wide metrics
    
    -- Cached values
    current_value DECIMAL(10,2) NOT NULL,
    previous_value DECIMAL(10,2),
    change_percentage DECIMAL(5,2) DEFAULT 0,
    trend_direction VARCHAR(10) DEFAULT 'stable', -- up, down, stable
    
    -- Cache metadata
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '5 minutes'),
    update_frequency INTEGER DEFAULT 60, -- seconds
    
    -- Data quality
    data_freshness_seconds INTEGER DEFAULT 0,
    calculation_confidence DECIMAL(3,2) DEFAULT 1.0,
    anomaly_detected BOOLEAN DEFAULT FALSE,
    
    -- Additional context
    context_data JSONB DEFAULT '{}'::jsonb, -- Additional metric context
    tags JSONB DEFAULT '[]'::jsonb,
    
    -- Indexes
    INDEX idx_epic17_realtime_cache_key (cache_key),
    INDEX idx_epic17_realtime_metric_type (metric_type),
    INDEX idx_epic17_realtime_scope (scope_type, scope_identifier),
    INDEX idx_epic17_realtime_updated (last_updated DESC),
    INDEX idx_epic17_realtime_expires (expires_at),
    INDEX idx_epic17_realtime_trending (scope_type, metric_type, change_percentage DESC)
);

-- Create comprehensive functions for toggle overview management

-- Function to refresh dashboard widget data
CREATE OR REPLACE FUNCTION refresh_dashboard_widget_data(
    p_widget_id UUID
) RETURNS TABLE(
    success BOOLEAN,
    data_points JSONB,
    last_updated TIMESTAMP WITH TIME ZONE,
    errors TEXT[]
) AS $$
DECLARE
    widget_record RECORD;
    data_result JSONB;
    error_messages TEXT[] := '{}';
    success_status BOOLEAN := TRUE;
BEGIN
    -- Get widget configuration
    SELECT * INTO widget_record
    FROM epic17_dashboard_widgets
    WHERE widget_id = p_widget_id AND is_active = TRUE;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, '{}'::jsonb, NOW(), ARRAY['Widget not found or inactive'];
        RETURN;
    END IF;
    
    -- Build data based on widget configuration
    CASE widget_record.data_source
        WHEN 'toggles' THEN
            -- Get toggle statistics
            SELECT jsonb_build_object(
                'total_toggles', COUNT(*),
                'active_toggles', COUNT(CASE WHEN is_enabled = TRUE THEN 1 END),
                'categories', jsonb_object_agg(category, count)
            ) INTO data_result
            FROM (
                SELECT category, COUNT(*) as count
                FROM epic17_toggle_definitions
                GROUP BY category
            ) category_stats;
            
        WHEN 'analytics' THEN
            -- Get aggregated analytics data
            SELECT jsonb_agg(
                jsonb_build_object(
                    'timestamp', aggregation_timestamp,
                    'value', total_requests,
                    'scope', scope_identifier
                )
            ) INTO data_result
            FROM epic17_toggle_analytics_aggregated
            WHERE aggregation_timestamp >= NOW() - (widget_record.time_range || ' hours')::INTERVAL
            ORDER BY aggregation_timestamp DESC
            LIMIT 100;
            
        WHEN 'health' THEN
            -- Get health monitoring data
            SELECT jsonb_build_object(
                'healthy_monitors', COUNT(CASE WHEN current_status = 'healthy' THEN 1 END),
                'warning_monitors', COUNT(CASE WHEN current_status = 'warning' THEN 1 END),
                'critical_monitors', COUNT(CASE WHEN current_status = 'critical' THEN 1 END),
                'active_alerts', (SELECT COUNT(*) FROM epic17_health_alerts WHERE status IN ('triggered', 'acknowledged'))
            ) INTO data_result
            FROM epic17_health_monitoring
            WHERE is_active = TRUE;
            
        ELSE
            error_messages := array_append(error_messages, 'Unknown data source: ' || widget_record.data_source);
            success_status := FALSE;
            data_result := '{}'::jsonb;
    END CASE;
    
    -- Update widget last refresh time
    UPDATE epic17_dashboard_widgets
    SET last_refreshed = NOW()
    WHERE widget_id = p_widget_id;
    
    RETURN QUERY SELECT success_status, COALESCE(data_result, '{}'::jsonb), NOW(), error_messages;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate toggle overview summary
CREATE OR REPLACE FUNCTION calculate_toggle_overview_summary(
    p_time_range VARCHAR(30) DEFAULT 'last_24_hours'
) RETURNS TABLE(
    total_toggles INTEGER,
    active_toggles INTEGER,
    disabled_toggles INTEGER,
    health_score DECIMAL(5,2),
    health_status VARCHAR(20),
    recent_changes INTEGER,
    pending_approvals INTEGER,
    avg_response_time DECIMAL(10,2),
    error_rate DECIMAL(5,2)
) AS $$
DECLARE
    time_window INTERVAL;
    health_score_calc DECIMAL(5,2);
    health_status_calc VARCHAR(20);
BEGIN
    -- Convert time range to interval
    time_window := CASE p_time_range
        WHEN 'last_hour' THEN '1 hour'::INTERVAL
        WHEN 'last_4_hours' THEN '4 hours'::INTERVAL
        WHEN 'last_24_hours' THEN '24 hours'::INTERVAL
        WHEN 'last_7_days' THEN '7 days'::INTERVAL
        WHEN 'last_30_days' THEN '30 days'::INTERVAL
        ELSE '24 hours'::INTERVAL
    END;
    
    RETURN QUERY
    SELECT 
        -- Toggle counts
        (SELECT COUNT(*)::INTEGER FROM epic17_toggle_definitions) as total_toggles,
        (SELECT COUNT(*)::INTEGER FROM epic17_toggle_definitions WHERE is_enabled = TRUE) as active_toggles,
        (SELECT COUNT(*)::INTEGER FROM epic17_toggle_definitions WHERE current_status = 'disabled') as disabled_toggles,
        
        -- Health metrics (simplified calculation)
        CASE 
            WHEN (SELECT COUNT(*) FROM epic17_health_alerts WHERE status IN ('triggered', 'acknowledged') AND triggered_at >= NOW() - time_window) = 0 THEN 100.0
            WHEN (SELECT COUNT(*) FROM epic17_health_alerts WHERE status = 'triggered' AND severity = 'critical' AND triggered_at >= NOW() - time_window) > 0 THEN 40.0
            WHEN (SELECT COUNT(*) FROM epic17_health_alerts WHERE status IN ('triggered', 'acknowledged') AND triggered_at >= NOW() - time_window) <= 2 THEN 80.0
            ELSE 60.0
        END::DECIMAL(5,2) as health_score,
        
        CASE 
            WHEN (SELECT COUNT(*) FROM epic17_health_alerts WHERE status = 'triggered' AND severity = 'critical' AND triggered_at >= NOW() - time_window) > 0 THEN 'critical'
            WHEN (SELECT COUNT(*) FROM epic17_health_alerts WHERE status IN ('triggered', 'acknowledged') AND triggered_at >= NOW() - time_window) > 2 THEN 'warning'
            ELSE 'healthy'
        END::VARCHAR(20) as health_status,
        
        -- Activity metrics
        (SELECT COUNT(*)::INTEGER FROM epic17_toggle_history WHERE changed_at >= NOW() - time_window) as recent_changes,
        (SELECT COUNT(*)::INTEGER FROM epic17_toggle_change_requests WHERE approval_status = 'pending') as pending_approvals,
        
        -- Performance metrics
        COALESCE((
            SELECT AVG(avg_response_time)::DECIMAL(10,2)
            FROM epic17_toggle_analytics_aggregated
            WHERE aggregation_timestamp >= NOW() - time_window
        ), 0.0) as avg_response_time,
        
        COALESCE((
            SELECT AVG(CASE WHEN total_requests > 0 THEN (failed_requests::DECIMAL / total_requests * 100) ELSE 0 END)::DECIMAL(5,2)
            FROM epic17_toggle_analytics_aggregated
            WHERE aggregation_timestamp >= NOW() - time_window
        ), 0.0) as error_rate;
END;
$$ LANGUAGE plpgsql;

-- Function to generate automated insights
CREATE OR REPLACE FUNCTION generate_automated_insights() RETURNS INTEGER AS $$
DECLARE
    insights_generated INTEGER := 0;
    toggle_record RECORD;
    alert_count INTEGER;
    error_rate DECIMAL(5,2);
    usage_trend DECIMAL(5,2);
BEGIN
    -- Generate performance insights for toggles with high error rates
    FOR toggle_record IN 
        SELECT td.toggle_id, td.name, AVG(taa.failed_requests::DECIMAL / NULLIF(taa.total_requests, 0) * 100) as avg_error_rate
        FROM epic17_toggle_definitions td
        JOIN epic17_toggle_analytics_aggregated taa ON td.toggle_id = taa.scope_identifier
        WHERE taa.aggregation_timestamp >= NOW() - INTERVAL '24 hours'
        GROUP BY td.toggle_id, td.name
        HAVING AVG(taa.failed_requests::DECIMAL / NULLIF(taa.total_requests, 0) * 100) > 5
    LOOP
        INSERT INTO epic17_toggle_insights (
            insight_id, insight_type, title, description, confidence, impact, category,
            related_metrics, affected_toggles, action_required, suggested_actions
        ) VALUES (
            gen_random_uuid(),
            'warning',
            'High Error Rate Detected',
            format('Toggle %s has an average error rate of %.2f%% in the last 24 hours', toggle_record.name, toggle_record.avg_error_rate),
            0.9,
            'high',
            'performance',
            '["error_rate"]'::jsonb,
            format('["%s"]', toggle_record.toggle_id)::jsonb,
            true,
            '["Investigate error causes", "Review toggle configuration", "Check dependencies"]'::jsonb
        ) ON CONFLICT DO NOTHING;
        
        insights_generated := insights_generated + 1;
    END LOOP;
    
    -- Generate usage trend insights
    INSERT INTO epic17_toggle_insights (
        insight_id, insight_type, title, description, confidence, impact, category,
        related_metrics, action_required, suggested_actions
    )
    SELECT 
        gen_random_uuid(),
        'trend',
        'Usage Trend Analysis',
        CASE 
            WHEN growth_rate > 20 THEN format('System usage has increased by %.2f%% in the last week', growth_rate)
            WHEN growth_rate < -20 THEN format('System usage has decreased by %.2f%% in the last week', growth_rate)
            ELSE 'System usage has remained stable'
        END,
        0.8,
        CASE 
            WHEN ABS(growth_rate) > 20 THEN 'medium'
            ELSE 'low'
        END,
        'usage',
        '["usage_count"]'::jsonb,
        ABS(growth_rate) > 20,
        CASE 
            WHEN growth_rate > 20 THEN '["Consider scaling resources", "Monitor performance impact"]'::jsonb
            WHEN growth_rate < -20 THEN '["Investigate usage decline", "Review user feedback"]'::jsonb
            ELSE '[]'::jsonb
        END
    FROM (
        SELECT AVG(growth_rate) as growth_rate
        FROM epic17_toggle_analytics_aggregated
        WHERE aggregation_timestamp >= NOW() - INTERVAL '7 days'
          AND aggregation_level = 'system'
    ) trend_data
    WHERE NOT EXISTS (
        SELECT 1 FROM epic17_toggle_insights 
        WHERE insight_type = 'trend' 
          AND generated_at >= NOW() - INTERVAL '24 hours'
    );
    
    IF FOUND THEN
        insights_generated := insights_generated + 1;
    END IF;
    
    -- Log insight generation
    INSERT INTO epic17_admin_tool_usage (
        usage_id, tool_name, action, used_by, records_affected, success
    ) VALUES (
        gen_random_uuid(), 'toggle_overview', 'generate_insights', 'system', insights_generated, true
    );
    
    RETURN insights_generated;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup old analytics and cache data
CREATE OR REPLACE FUNCTION cleanup_toggle_overview_data(
    p_analytics_retention_days INTEGER DEFAULT 90,
    p_cache_retention_hours INTEGER DEFAULT 24,
    p_report_retention_days INTEGER DEFAULT 180
) RETURNS TABLE(
    analytics_deleted INTEGER,
    cache_deleted INTEGER,
    reports_deleted INTEGER,
    insights_deleted INTEGER
) AS $$
DECLARE
    analytics_count INTEGER;
    cache_count INTEGER;
    reports_count INTEGER;
    insights_count INTEGER;
BEGIN
    -- Clean up old analytics data
    DELETE FROM epic17_toggle_analytics_aggregated
    WHERE aggregation_timestamp < NOW() - (p_analytics_retention_days || ' days')::INTERVAL
      AND aggregation_period IN ('minute', 'hour'); -- Keep daily/weekly/monthly aggregates longer
    
    GET DIAGNOSTICS analytics_count = ROW_COUNT;
    
    -- Clean up expired cache entries
    DELETE FROM epic17_realtime_metrics_cache
    WHERE expires_at < NOW() - (p_cache_retention_hours || ' hours')::INTERVAL;
    
    GET DIAGNOSTICS cache_count = ROW_COUNT;
    
    -- Clean up old reports
    DELETE FROM epic17_toggle_reports
    WHERE generated_at < NOW() - (p_report_retention_days || ' days')::INTERVAL
      AND is_scheduled = FALSE; -- Don't delete scheduled report templates
    
    GET DIAGNOSTICS reports_count = ROW_COUNT;
    
    -- Clean up old insights that have been dismissed or expired
    DELETE FROM epic17_toggle_insights
    WHERE (dismissed_at IS NOT NULL AND dismissed_at < NOW() - INTERVAL '30 days')
       OR (expires_at IS NOT NULL AND expires_at < NOW())
       OR (generated_at < NOW() - INTERVAL '30 days' AND is_active = FALSE);
    
    GET DIAGNOSTICS insights_count = ROW_COUNT;
    
    -- Log cleanup operation
    INSERT INTO epic17_admin_tool_usage (
        usage_id, tool_name, action, used_by, records_affected, success
    ) VALUES (
        gen_random_uuid(), 'toggle_overview', 'cleanup_data', 'system', 
        analytics_count + cache_count + reports_count + insights_count, true
    );
    
    RETURN QUERY SELECT analytics_count, cache_count, reports_count, insights_count;
END;
$$ LANGUAGE plpgsql;

-- Insert default dashboard layouts
INSERT INTO epic17_dashboard_layouts (
    layout_id, layout_name, description, layout_type, layout_config, 
    widget_positions, is_default, is_public, category, created_by
) VALUES 
(
    gen_random_uuid(),
    'Executive Overview',
    'High-level overview dashboard for executives and managers',
    'grid',
    '{"columns": 12, "rowHeight": 60, "margin": [15, 15], "compactType": "vertical"}'::jsonb,
    '[
        {"widget_type": "metric", "position": {"x": 0, "y": 0, "w": 3, "h": 2}, "config": {"metric": "total_toggles", "title": "Total Toggles"}},
        {"widget_type": "metric", "position": {"x": 3, "y": 0, "w": 3, "h": 2}, "config": {"metric": "active_toggles", "title": "Active Toggles"}},
        {"widget_type": "gauge", "position": {"x": 6, "y": 0, "w": 3, "h": 2}, "config": {"metric": "health_score", "title": "System Health"}},
        {"widget_type": "status", "position": {"x": 9, "y": 0, "w": 3, "h": 2}, "config": {"title": "System Status"}},
        {"widget_type": "chart", "position": {"x": 0, "y": 2, "w": 6, "h": 4}, "config": {"chart_type": "line_chart", "metric": "usage_count", "title": "Usage Trends"}},
        {"widget_type": "chart", "position": {"x": 6, "y": 2, "w": 6, "h": 4}, "config": {"chart_type": "bar_chart", "metric": "error_rate", "title": "Error Rate by Category"}}
    ]'::jsonb,
    TRUE,
    TRUE,
    'executive',
    'system'
),
(
    gen_random_uuid(),
    'Operational Dashboard',
    'Detailed operational metrics for system administrators',
    'grid',
    '{"columns": 12, "rowHeight": 50, "margin": [10, 10], "compactType": "vertical"}'::jsonb,
    '[
        {"widget_type": "table", "position": {"x": 0, "y": 0, "w": 12, "h": 3}, "config": {"title": "Recent Alerts", "data_source": "health"}},
        {"widget_type": "heatmap", "position": {"x": 0, "y": 3, "w": 6, "h": 4}, "config": {"title": "Toggle Usage Heatmap"}},
        {"widget_type": "chart", "position": {"x": 6, "y": 3, "w": 6, "h": 4}, "config": {"chart_type": "scatter_plot", "title": "Performance vs Usage"}},
        {"widget_type": "metric", "position": {"x": 0, "y": 7, "w": 2, "h": 2}, "config": {"metric": "avg_response_time", "title": "Avg Response Time"}},
        {"widget_type": "metric", "position": {"x": 2, "y": 7, "w": 2, "h": 2}, "config": {"metric": "error_rate", "title": "Error Rate"}},
        {"widget_type": "metric", "position": {"x": 4, "y": 7, "w": 2, "h": 2}, "config": {"metric": "pending_approvals", "title": "Pending Approvals"}}
    ]'::jsonb,
    FALSE,
    TRUE,
    'operational',
    'system'
),
(
    gen_random_uuid(),
    'Technical Deep Dive',
    'Detailed technical metrics for developers and engineers',
    'grid',
    '{"columns": 12, "rowHeight": 40, "margin": [8, 8], "compactType": "vertical"}'::jsonb,
    '[
        {"widget_type": "chart", "position": {"x": 0, "y": 0, "w": 12, "h": 5}, "config": {"chart_type": "line_chart", "title": "Real-time Performance Metrics", "time_range": "last_hour"}},
        {"widget_type": "table", "position": {"x": 0, "y": 5, "w": 6, "h": 4}, "config": {"title": "Toggle Dependencies", "data_source": "toggles"}},
        {"widget_type": "table", "position": {"x": 6, "y": 5, "w": 6, "h": 4}, "config": {"title": "Recent Changes", "data_source": "audit_logs"}},
        {"widget_type": "treemap", "position": {"x": 0, "y": 9, "w": 6, "h": 4}, "config": {"title": "Toggle Categories"}},
        {"widget_type": "chart", "position": {"x": 6, "y": 9, "w": 6, "h": 4}, "config": {"chart_type": "pie_chart", "title": "Error Distribution"}}
    ]'::jsonb,
    FALSE,
    TRUE,
    'technical',
    'system'
);

-- Insert default health monitors
INSERT INTO epic17_health_monitoring (
    monitor_id, monitor_name, description, monitor_type, metric_type,
    warning_threshold, critical_threshold, comparison_operator,
    scope_type, evaluation_frequency, alert_enabled, created_by
) VALUES 
(
    gen_random_uuid(),
    'System Error Rate Monitor',
    'Monitors system-wide error rate threshold',
    'metric_threshold',
    'error_rate',
    5.0,
    10.0,
    'greater_than',
    'system',
    300, -- 5 minutes
    TRUE,
    'system'
),
(
    gen_random_uuid(),
    'Average Response Time Monitor',
    'Monitors system-wide average response time',
    'metric_threshold',
    'response_time',
    1000.0,
    2000.0,
    'greater_than',
    'system',
    300,
    TRUE,
    'system'
),
(
    gen_random_uuid(),
    'Toggle Change Frequency Monitor',
    'Monitors unusual frequency of toggle changes',
    'trend_analysis',
    'toggle_changes',
    10.0,
    20.0,
    'greater_than',
    'system',
    3600, -- 1 hour
    TRUE,
    'system'
),
(
    gen_random_uuid(),
    'Critical Toggle Availability Monitor',
    'Monitors availability of critical priority toggles',
    'availability',
    'usage_count',
    NULL,
    NULL,
    'equals',
    'category',
    600, -- 10 minutes
    TRUE,
    'system'
);

-- Create performance indexes for large datasets
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_epic17_widgets_performance 
    ON epic17_dashboard_widgets (is_active, auto_refresh, last_refreshed) 
    WHERE is_active = TRUE AND auto_refresh = TRUE;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_epic17_analytics_agg_performance 
    ON epic17_toggle_analytics_aggregated (aggregation_period, aggregation_timestamp DESC, scope_identifier) 
    WHERE aggregation_timestamp >= NOW() - INTERVAL '24 hours';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_epic17_health_monitoring_evaluation 
    ON epic17_health_monitoring (is_active, evaluation_frequency, last_evaluation) 
    WHERE is_active = TRUE;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_epic17_realtime_cache_active 
    ON epic17_realtime_metrics_cache (expires_at, cache_key) 
    WHERE expires_at > NOW();

-- Create comprehensive toggle overview dashboard view
CREATE VIEW epic17_toggle_overview_dashboard AS
SELECT 
    -- System statistics
    (SELECT COUNT(*) FROM epic17_toggle_definitions) as total_toggles,
    (SELECT COUNT(*) FROM epic17_toggle_definitions WHERE is_enabled = TRUE) as active_toggles,
    (SELECT COUNT(*) FROM epic17_toggle_definitions WHERE current_status = 'disabled') as disabled_toggles,
    (SELECT COUNT(*) FROM epic17_toggle_definitions WHERE current_status = 'maintenance') as maintenance_toggles,
    (SELECT COUNT(*) FROM epic17_toggle_definitions WHERE current_status = 'experimental') as experimental_toggles,
    
    -- Health metrics
    (SELECT COUNT(*) FROM epic17_health_monitoring WHERE is_active = TRUE) as active_monitors,
    (SELECT COUNT(*) FROM epic17_health_monitoring WHERE current_status = 'healthy') as healthy_monitors,
    (SELECT COUNT(*) FROM epic17_health_monitoring WHERE current_status = 'warning') as warning_monitors,
    (SELECT COUNT(*) FROM epic17_health_monitoring WHERE current_status = 'critical') as critical_monitors,
    
    -- Alert status
    (SELECT COUNT(*) FROM epic17_health_alerts WHERE status = 'triggered') as active_alerts,
    (SELECT COUNT(*) FROM epic17_health_alerts WHERE status = 'triggered' AND severity = 'critical') as critical_alerts,
    (SELECT COUNT(*) FROM epic17_health_alerts WHERE triggered_at >= NOW() - INTERVAL '24 hours') as alerts_today,
    
    -- Activity metrics
    (SELECT COUNT(*) FROM epic17_toggle_history WHERE changed_at >= NOW() - INTERVAL '24 hours') as changes_today,
    (SELECT COUNT(*) FROM epic17_toggle_change_requests WHERE approval_status = 'pending') as pending_approvals,
    (SELECT COUNT(*) FROM epic17_toggle_insights WHERE is_active = TRUE AND action_required = TRUE) as actionable_insights,
    
    -- Dashboard usage
    (SELECT COUNT(*) FROM epic17_dashboard_widgets WHERE is_active = TRUE) as active_widgets,
    (SELECT COUNT(*) FROM epic17_dashboard_layouts WHERE is_public = TRUE) as public_layouts,
    (SELECT COUNT(*) FROM epic17_toggle_reports WHERE generated_at >= NOW() - INTERVAL '7 days') as reports_this_week,
    
    -- Performance indicators (from last hour)
    (SELECT AVG(avg_response_time) FROM epic17_toggle_analytics_aggregated 
     WHERE aggregation_timestamp >= NOW() - INTERVAL '1 hour' AND aggregation_level = 'system') as avg_response_time_1h,
    (SELECT AVG(CASE WHEN total_requests > 0 THEN (failed_requests::DECIMAL / total_requests * 100) ELSE 0 END) 
     FROM epic17_toggle_analytics_aggregated 
     WHERE aggregation_timestamp >= NOW() - INTERVAL '1 hour' AND aggregation_level = 'system') as error_rate_1h,
    
    -- Cache statistics
    (SELECT COUNT(*) FROM epic17_realtime_metrics_cache WHERE expires_at > NOW()) as active_cache_entries,
    (SELECT COUNT(*) FROM epic17_realtime_metrics_cache WHERE anomaly_detected = TRUE) as anomalies_detected;

-- Add table comments for documentation
COMMENT ON TABLE epic17_dashboard_widgets IS 'Dashboard widgets configuration and management';
COMMENT ON TABLE epic17_toggle_analytics_aggregated IS 'Aggregated analytics data optimized for dashboard consumption';
COMMENT ON TABLE epic17_toggle_reports IS 'Toggle reports and scheduled reporting configuration';
COMMENT ON TABLE epic17_dashboard_layouts IS 'Dashboard layout and configuration management';
COMMENT ON TABLE epic17_health_monitoring IS 'Health monitoring and alerting configuration';
COMMENT ON TABLE epic17_health_alerts IS 'Health monitoring alerts and incidents tracking';
COMMENT ON TABLE epic17_toggle_insights IS 'Automated insights and recommendations';
COMMENT ON TABLE epic17_realtime_metrics_cache IS 'Real-time metrics cache for fast dashboard loading';

-- Create triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_epic17_overview_timestamp() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_epic17_dashboard_widgets_timestamp
    BEFORE UPDATE ON epic17_dashboard_widgets
    FOR EACH ROW EXECUTE FUNCTION update_epic17_overview_timestamp();

CREATE TRIGGER update_epic17_dashboard_layouts_timestamp
    BEFORE UPDATE ON epic17_dashboard_layouts
    FOR EACH ROW EXECUTE FUNCTION update_epic17_overview_timestamp();

CREATE TRIGGER update_epic17_health_monitoring_timestamp
    BEFORE UPDATE ON epic17_health_monitoring
    FOR EACH ROW EXECUTE FUNCTION update_epic17_overview_timestamp();

-- Create trigger to update widget usage statistics
CREATE OR REPLACE FUNCTION update_dashboard_layout_usage() RETURNS TRIGGER AS $$
BEGIN
    -- Update usage statistics when layout is accessed
    IF TG_OP = 'UPDATE' AND OLD.last_used != NEW.last_used THEN
        NEW.usage_count = COALESCE(OLD.usage_count, 0) + 1;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_epic17_layout_usage_stats
    BEFORE UPDATE ON epic17_dashboard_layouts
    FOR EACH ROW
    WHEN (NEW.last_used IS DISTINCT FROM OLD.last_used)
    EXECUTE FUNCTION update_dashboard_layout_usage();

-- Final setup completion message
DO $$
BEGIN
    RAISE NOTICE '✅ Epic 17 Toggle Overview database schema created successfully';
    RAISE NOTICE '📊 Tables created: 8 core tables + 1 dashboard view';
    RAISE NOTICE '🔧 Functions created: 4 management functions + 1 cleanup function';
    RAISE NOTICE '⚡ Features: Dashboard widgets, analytics aggregation, reporting, health monitoring';
    RAISE NOTICE '🔄 Capabilities: Real-time updates, automated insights, alert management';
    RAISE NOTICE '📈 Analytics: Comprehensive metrics aggregation and trend analysis';
    RAISE NOTICE '🏗️ Dashboards: 3 default layouts (executive, operational, technical)';
    RAISE NOTICE '🛡️ Monitoring: 4 default health monitors with alerting';
    RAISE NOTICE '🚀 Toggle overview system ready for Epic 17 API management';
END $$;