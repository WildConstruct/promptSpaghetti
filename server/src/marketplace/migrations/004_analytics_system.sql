-- Analytics System Migration
-- Epic 16.2.3 - Creator Analytics Dashboard

-- Analytics Events Table
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
        'views', 'downloads', 'likes', 'ratings', 'revenue', 
        'usage_time', 'error_rate', 'conversion'
    )),
    event_data JSONB NOT NULL DEFAULT '{}',
    metadata JSONB NOT NULL DEFAULT '{}',
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Indexes for performance
    INDEX idx_analytics_template_id (template_id),
    INDEX idx_analytics_user_id (user_id),
    INDEX idx_analytics_event_type (event_type),
    INDEX idx_analytics_timestamp (timestamp),
    INDEX idx_analytics_composite (template_id, event_type, timestamp),
    INDEX idx_analytics_metadata_gin (metadata) USING GIN,
    INDEX idx_analytics_event_data_gin (event_data) USING GIN
);

-- Custom Reports Table
CREATE TABLE IF NOT EXISTS custom_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    configuration JSONB NOT NULL,
    is_scheduled BOOLEAN NOT NULL DEFAULT false,
    schedule JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_name_length CHECK (length(name) >= 1),
    CONSTRAINT valid_description_length CHECK (description IS NULL OR length(description) <= 1000),
    CONSTRAINT valid_schedule CHECK (
        NOT is_scheduled OR 
        (schedule IS NOT NULL AND 
         schedule->>'frequency' IN ('daily', 'weekly', 'monthly') AND
         schedule->>'time' ~ '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$')
    ),
    
    -- Indexes
    INDEX idx_custom_reports_creator_id (creator_id),
    INDEX idx_custom_reports_created_at (created_at),
    INDEX idx_custom_reports_scheduled (is_scheduled) WHERE is_scheduled = true
);

-- Analytics Insights Table
CREATE TABLE IF NOT EXISTS analytics_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
    insight_type VARCHAR(50) NOT NULL CHECK (insight_type IN (
        'trend', 'anomaly', 'opportunity', 'warning'
    )),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    data JSONB NOT NULL,
    recommendations TEXT[],
    severity VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    is_read BOOLEAN NOT NULL DEFAULT false,
    is_dismissed BOOLEAN NOT NULL DEFAULT false,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_analytics_insights_creator_id (creator_id),
    INDEX idx_analytics_insights_template_id (template_id),
    INDEX idx_analytics_insights_type (insight_type),
    INDEX idx_analytics_insights_severity (severity),
    INDEX idx_analytics_insights_unread (creator_id, is_read) WHERE is_read = false,
    INDEX idx_analytics_insights_expires (expires_at) WHERE expires_at IS NOT NULL
);

-- Analytics Aggregations Table (for performance)
CREATE TABLE IF NOT EXISTS analytics_aggregations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    metric_type VARCHAR(50) NOT NULL,
    aggregation_type VARCHAR(20) NOT NULL CHECK (aggregation_type IN (
        'hourly', 'daily', 'weekly', 'monthly'
    )),
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    value DECIMAL(15,4) NOT NULL DEFAULT 0,
    count INTEGER NOT NULL DEFAULT 0,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Unique constraint to prevent duplicates
    UNIQUE (template_id, metric_type, aggregation_type, period_start),
    
    -- Indexes
    INDEX idx_analytics_agg_template_metric (template_id, metric_type),
    INDEX idx_analytics_agg_creator_period (creator_id, period_start),
    INDEX idx_analytics_agg_period_range (period_start, period_end),
    INDEX idx_analytics_agg_type (aggregation_type),
    INDEX idx_analytics_agg_value (value)
);

-- Report Executions Table
CREATE TABLE IF NOT EXISTS report_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES custom_reports(id) ON DELETE CASCADE,
    executed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    execution_type VARCHAR(20) NOT NULL DEFAULT 'manual' CHECK (execution_type IN (
        'manual', 'scheduled', 'api'
    )),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'running', 'completed', 'failed', 'cancelled'
    )),
    result_data JSONB,
    error_message TEXT,
    execution_time_ms INTEGER,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    -- Indexes
    INDEX idx_report_executions_report_id (report_id),
    INDEX idx_report_executions_status (status),
    INDEX idx_report_executions_started_at (started_at),
    INDEX idx_report_executions_type (execution_type)
);

-- Analytics Sessions Table (for user behavior tracking)
CREATE TABLE IF NOT EXISTS analytics_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id VARCHAR(255) NOT NULL,
    first_event_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_event_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    event_count INTEGER NOT NULL DEFAULT 0,
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_analytics_sessions_user_id (user_id),
    INDEX idx_analytics_sessions_session_id (session_id),
    INDEX idx_analytics_sessions_duration (duration_seconds),
    INDEX idx_analytics_sessions_last_event (last_event_at)
);

-- Create functions for analytics data aggregation
CREATE OR REPLACE FUNCTION aggregate_analytics_data()
RETURNS VOID AS $$
BEGIN
    -- Aggregate hourly data
    INSERT INTO analytics_aggregations (
        template_id, creator_id, metric_type, aggregation_type,
        period_start, period_end, value, count
    )
    SELECT 
        ae.template_id,
        t.creator_id,
        ae.event_type as metric_type,
        'hourly' as aggregation_type,
        date_trunc('hour', ae.timestamp) as period_start,
        date_trunc('hour', ae.timestamp) + interval '1 hour' as period_end,
        COUNT(*) as value,
        COUNT(*) as count
    FROM analytics_events ae
    JOIN templates t ON ae.template_id = t.id
    WHERE ae.timestamp >= NOW() - interval '25 hours'
    GROUP BY 
        ae.template_id, t.creator_id, ae.event_type, 
        date_trunc('hour', ae.timestamp)
    ON CONFLICT (template_id, metric_type, aggregation_type, period_start)
    DO UPDATE SET 
        value = EXCLUDED.value,
        count = EXCLUDED.count,
        updated_at = NOW();

    -- Aggregate daily data
    INSERT INTO analytics_aggregations (
        template_id, creator_id, metric_type, aggregation_type,
        period_start, period_end, value, count
    )
    SELECT 
        template_id,
        creator_id,
        metric_type,
        'daily' as aggregation_type,
        date_trunc('day', period_start) as period_start,
        date_trunc('day', period_start) + interval '1 day' as period_end,
        SUM(value) as value,
        SUM(count) as count
    FROM analytics_aggregations
    WHERE aggregation_type = 'hourly'
    AND period_start >= date_trunc('day', NOW() - interval '8 days')
    GROUP BY 
        template_id, creator_id, metric_type, 
        date_trunc('day', period_start)
    ON CONFLICT (template_id, metric_type, aggregation_type, period_start)
    DO UPDATE SET 
        value = EXCLUDED.value,
        count = EXCLUDED.count,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Create function for generating analytics insights
CREATE OR REPLACE FUNCTION generate_analytics_insights()
RETURNS VOID AS $$
DECLARE
    template_rec RECORD;
    avg_views DECIMAL;
    current_views DECIMAL;
    growth_rate DECIMAL;
BEGIN
    -- Clean up old insights
    DELETE FROM analytics_insights 
    WHERE expires_at IS NOT NULL AND expires_at < NOW();

    -- Generate trend insights for each template
    FOR template_rec IN 
        SELECT t.id, t.creator_id, t.title
        FROM templates t
        WHERE t.status = 'published'
    LOOP
        -- Get average views for the template
        SELECT COALESCE(AVG(value), 0) INTO avg_views
        FROM analytics_aggregations
        WHERE template_id = template_rec.id
        AND metric_type = 'views'
        AND aggregation_type = 'daily'
        AND period_start >= NOW() - interval '30 days';

        -- Get current day views
        SELECT COALESCE(value, 0) INTO current_views
        FROM analytics_aggregations
        WHERE template_id = template_rec.id
        AND metric_type = 'views'
        AND aggregation_type = 'daily'
        AND period_start = date_trunc('day', NOW());

        -- Calculate growth rate
        IF avg_views > 0 THEN
            growth_rate := ((current_views - avg_views) / avg_views) * 100;
            
            -- Generate insight if significant change
            IF abs(growth_rate) > 20 THEN
                INSERT INTO analytics_insights (
                    creator_id, template_id, insight_type, title, description,
                    data, severity, expires_at
                ) VALUES (
                    template_rec.creator_id,
                    template_rec.id,
                    CASE WHEN growth_rate > 0 THEN 'opportunity' ELSE 'warning' END,
                    CASE 
                        WHEN growth_rate > 0 THEN 'Template Trending Up'
                        ELSE 'Template Views Declining'
                    END,
                    format('Template "%s" has %s %s%% in views compared to the 30-day average.',
                        template_rec.title,
                        CASE WHEN growth_rate > 0 THEN 'increased' ELSE 'decreased' END,
                        abs(growth_rate)::text
                    ),
                    jsonb_build_object(
                        'metric', 'views',
                        'current_value', current_views,
                        'previous_value', avg_views,
                        'change_percentage', growth_rate,
                        'confidence_score', 85
                    ),
                    CASE 
                        WHEN abs(growth_rate) > 50 THEN 'high'
                        WHEN abs(growth_rate) > 30 THEN 'medium'
                        ELSE 'low'
                    END,
                    NOW() + interval '7 days'
                )
                ON CONFLICT DO NOTHING;
            END IF;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_analytics_events_composite_performance 
ON analytics_events (template_id, event_type, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_creator_lookup 
ON analytics_events (template_id) 
INCLUDE (event_type, timestamp, event_data);

CREATE INDEX IF NOT EXISTS idx_analytics_aggregations_dashboard 
ON analytics_aggregations (creator_id, aggregation_type, period_start DESC)
WHERE aggregation_type IN ('daily', 'weekly', 'monthly');

-- Create materialized view for dashboard performance
CREATE MATERIALIZED VIEW IF NOT EXISTS creator_dashboard_summary AS
SELECT 
    t.creator_id,
    COUNT(DISTINCT t.id) as total_templates,
    COUNT(DISTINCT CASE WHEN t.status = 'published' THEN t.id END) as active_templates,
    COALESCE(SUM(CASE WHEN aa.metric_type = 'views' AND aa.aggregation_type = 'daily' 
                      AND aa.period_start >= NOW() - interval '30 days' 
                 THEN aa.value END), 0) as total_views_30d,
    COALESCE(SUM(CASE WHEN aa.metric_type = 'downloads' AND aa.aggregation_type = 'daily'
                      AND aa.period_start >= NOW() - interval '30 days' 
                 THEN aa.value END), 0) as total_downloads_30d,
    COALESCE(SUM(CASE WHEN aa.metric_type = 'revenue' AND aa.aggregation_type = 'daily'
                      AND aa.period_start >= NOW() - interval '30 days' 
                 THEN aa.value END), 0) as total_revenue_30d,
    COALESCE(AVG(CASE WHEN r.rating IS NOT NULL THEN r.rating END), 0) as average_rating
FROM templates t
LEFT JOIN analytics_aggregations aa ON t.id = aa.template_id
LEFT JOIN reviews r ON t.id = r.template_id
GROUP BY t.creator_id;

-- Create unique index for materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_creator_dashboard_summary_creator_id 
ON creator_dashboard_summary (creator_id);

-- Add comments for documentation
COMMENT ON TABLE analytics_events IS 'Stores all analytics events for templates including views, downloads, interactions';
COMMENT ON TABLE custom_reports IS 'User-created custom analytics reports with scheduling capabilities';
COMMENT ON TABLE analytics_insights IS 'AI-generated insights and recommendations for creators';
COMMENT ON TABLE analytics_aggregations IS 'Pre-aggregated analytics data for performance optimization';
COMMENT ON TABLE report_executions IS 'Tracks execution history and results of custom reports';
COMMENT ON TABLE analytics_sessions IS 'User session tracking for behavior analysis';

COMMENT ON FUNCTION aggregate_analytics_data() IS 'Aggregates raw analytics events into hourly and daily summaries';
COMMENT ON FUNCTION generate_analytics_insights() IS 'Generates AI-powered insights based on analytics data trends';

COMMENT ON MATERIALIZED VIEW creator_dashboard_summary IS 'Materialized view for fast creator dashboard loading';

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON analytics_events TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON custom_reports TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON analytics_insights TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON analytics_aggregations TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON report_executions TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON analytics_sessions TO app_user;
GRANT SELECT ON creator_dashboard_summary TO app_user;

GRANT EXECUTE ON FUNCTION aggregate_analytics_data() TO app_user;
GRANT EXECUTE ON FUNCTION generate_analytics_insights() TO app_user;