-- Activity History System Migration
-- Creates comprehensive activity tracking and analytics infrastructure

-- Main activity history table
CREATE TABLE IF NOT EXISTS activity_history (
    id VARCHAR(255) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID,
    activity_type VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id VARCHAR(255),
    details JSONB NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    location JSONB,
    
    -- Constraints
    CHECK (LENGTH(activity_type) > 0),
    CHECK (LENGTH(category) > 0),
    CHECK (LENGTH(action) > 0)
);

-- Activity aggregations table for performance
CREATE TABLE IF NOT EXISTS activity_aggregations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    aggregation_date DATE NOT NULL,
    aggregation_type VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'monthly'
    activity_counts JSONB NOT NULL DEFAULT '{}',
    category_counts JSONB NOT NULL DEFAULT '{}',
    resource_counts JSONB NOT NULL DEFAULT '{}',
    unique_sessions INTEGER DEFAULT 0,
    total_activities INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint to prevent duplicates
    UNIQUE(user_id, aggregation_date, aggregation_type)
);

-- Activity sessions table for session-level analytics
CREATE TABLE IF NOT EXISTS activity_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID UNIQUE NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    activity_count INTEGER DEFAULT 0,
    unique_resources INTEGER DEFAULT 0,
    categories JSONB DEFAULT '[]',
    ip_address INET,
    user_agent TEXT,
    location JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity bookmarks for users to save important activities
CREATE TABLE IF NOT EXISTS activity_bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_id VARCHAR(255) NOT NULL REFERENCES activity_history(id) ON DELETE CASCADE,
    bookmark_name VARCHAR(255),
    notes TEXT,
    tags JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint to prevent duplicate bookmarks
    UNIQUE(user_id, activity_id)
);

-- Activity alerts for monitoring unusual patterns
CREATE TABLE IF NOT EXISTS activity_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL,
    alert_condition JSONB NOT NULL,
    alert_threshold JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_triggered_at TIMESTAMP WITH TIME ZONE,
    trigger_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity exports for GDPR compliance
CREATE TABLE IF NOT EXISTS activity_exports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    requested_by UUID NOT NULL REFERENCES users(id),
    export_format VARCHAR(20) NOT NULL CHECK (export_format IN ('json', 'csv', 'xml')),
    date_range_start TIMESTAMP WITH TIME ZONE NOT NULL,
    date_range_end TIMESTAMP WITH TIME ZONE NOT NULL,
    filters JSONB DEFAULT '{}',
    options JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    file_path TEXT,
    file_size INTEGER,
    record_count INTEGER,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Indexes for optimal query performance
CREATE INDEX IF NOT EXISTS idx_activity_history_user_id 
ON activity_history(user_id);

CREATE INDEX IF NOT EXISTS idx_activity_history_timestamp 
ON activity_history(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_activity_history_user_timestamp 
ON activity_history(user_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_activity_history_activity_type 
ON activity_history(activity_type);

CREATE INDEX IF NOT EXISTS idx_activity_history_category 
ON activity_history(category);

CREATE INDEX IF NOT EXISTS idx_activity_history_resource 
ON activity_history(resource_type, resource_id);

CREATE INDEX IF NOT EXISTS idx_activity_history_session_id 
ON activity_history(session_id);

CREATE INDEX IF NOT EXISTS idx_activity_history_ip_address 
ON activity_history(ip_address);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_activity_history_user_type_timestamp 
ON activity_history(user_id, activity_type, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_activity_history_user_category_timestamp 
ON activity_history(user_id, category, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_activity_history_type_timestamp 
ON activity_history(activity_type, timestamp DESC);

-- GIN indexes for JSONB columns
CREATE INDEX IF NOT EXISTS idx_activity_history_details_gin 
ON activity_history USING GIN(details);

CREATE INDEX IF NOT EXISTS idx_activity_history_metadata_gin 
ON activity_history USING GIN(metadata);

CREATE INDEX IF NOT EXISTS idx_activity_history_location_gin 
ON activity_history USING GIN(location);

-- Indexes for aggregations table
CREATE INDEX IF NOT EXISTS idx_activity_aggregations_user_date 
ON activity_aggregations(user_id, aggregation_date DESC);

CREATE INDEX IF NOT EXISTS idx_activity_aggregations_type_date 
ON activity_aggregations(aggregation_type, aggregation_date DESC);

-- Indexes for sessions table
CREATE INDEX IF NOT EXISTS idx_activity_sessions_user_id 
ON activity_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_activity_sessions_start_time 
ON activity_sessions(start_time DESC);

CREATE INDEX IF NOT EXISTS idx_activity_sessions_session_id 
ON activity_sessions(session_id);

-- Indexes for bookmarks table
CREATE INDEX IF NOT EXISTS idx_activity_bookmarks_user_id 
ON activity_bookmarks(user_id);

CREATE INDEX IF NOT EXISTS idx_activity_bookmarks_activity_id 
ON activity_bookmarks(activity_id);

-- Indexes for alerts table
CREATE INDEX IF NOT EXISTS idx_activity_alerts_user_id 
ON activity_alerts(user_id);

CREATE INDEX IF NOT EXISTS idx_activity_alerts_type_active 
ON activity_alerts(alert_type, is_active);

-- Indexes for exports table
CREATE INDEX IF NOT EXISTS idx_activity_exports_user_id 
ON activity_exports(user_id);

CREATE INDEX IF NOT EXISTS idx_activity_exports_status 
ON activity_exports(status);

CREATE INDEX IF NOT EXISTS idx_activity_exports_expires_at 
ON activity_exports(expires_at);

-- Partitioning setup for large datasets (optional, for high-volume systems)
-- This creates monthly partitions for the activity_history table
DO $$ 
BEGIN
    -- Check if partitioning is needed (can be enabled later)
    -- This would create partitions by month for better performance
    -- Example: activity_history_2025_01, activity_history_2025_02, etc.
    NULL; -- Placeholder for partition logic
END $$;

-- Views for common analytics queries

-- Daily activity summary view
CREATE OR REPLACE VIEW daily_activity_summary AS
SELECT 
    user_id,
    DATE(timestamp) as activity_date,
    COUNT(*) as total_activities,
    COUNT(DISTINCT session_id) as unique_sessions,
    COUNT(DISTINCT activity_type) as unique_activity_types,
    COUNT(DISTINCT resource_type) as unique_resource_types,
    jsonb_object_agg(
        category, 
        COALESCE(category_count, 0)
    ) as category_distribution,
    jsonb_object_agg(
        activity_type, 
        COALESCE(type_count, 0)
    ) as type_distribution
FROM activity_history ah
LEFT JOIN (
    SELECT 
        user_id,
        DATE(timestamp) as date,
        category,
        COUNT(*) as category_count
    FROM activity_history
    GROUP BY user_id, DATE(timestamp), category
) cat_counts ON ah.user_id = cat_counts.user_id 
    AND DATE(ah.timestamp) = cat_counts.date 
    AND ah.category = cat_counts.category
LEFT JOIN (
    SELECT 
        user_id,
        DATE(timestamp) as date,
        activity_type,
        COUNT(*) as type_count
    FROM activity_history
    GROUP BY user_id, DATE(timestamp), activity_type
) type_counts ON ah.user_id = type_counts.user_id 
    AND DATE(ah.timestamp) = type_counts.date 
    AND ah.activity_type = type_counts.activity_type
GROUP BY user_id, DATE(timestamp);

-- User activity patterns view
CREATE OR REPLACE VIEW user_activity_patterns AS
SELECT 
    user_id,
    COUNT(*) as total_activities,
    COUNT(DISTINCT DATE(timestamp)) as active_days,
    COUNT(DISTINCT session_id) as total_sessions,
    AVG(daily_activity.daily_count) as avg_daily_activities,
    MAX(daily_activity.daily_count) as max_daily_activities,
    MIN(timestamp) as first_activity,
    MAX(timestamp) as last_activity,
    EXTRACT(EPOCH FROM (MAX(timestamp) - MIN(timestamp))) / 86400 as account_age_days,
    jsonb_object_agg(category, category_count) as category_totals,
    ARRAY_AGG(DISTINCT activity_type ORDER BY activity_type) as activity_types_used,
    COUNT(DISTINCT ip_address) as unique_ip_addresses,
    COUNT(DISTINCT location->>'country') as unique_countries
FROM activity_history ah
LEFT JOIN (
    SELECT 
        user_id,
        DATE(timestamp) as date,
        COUNT(*) as daily_count
    FROM activity_history
    GROUP BY user_id, DATE(timestamp)
) daily_activity ON ah.user_id = daily_activity.user_id
LEFT JOIN (
    SELECT 
        user_id,
        category,
        COUNT(*) as category_count
    FROM activity_history
    GROUP BY user_id, category
) cat_totals ON ah.user_id = cat_totals.user_id AND ah.category = cat_totals.category
GROUP BY user_id;

-- Resource activity view
CREATE OR REPLACE VIEW resource_activity_summary AS
SELECT 
    resource_type,
    resource_id,
    COUNT(*) as total_activities,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT session_id) as unique_sessions,
    MIN(timestamp) as first_activity,
    MAX(timestamp) as last_activity,
    jsonb_object_agg(activity_type, activity_count) as activity_breakdown,
    ARRAY_AGG(DISTINCT user_id) as involved_users
FROM activity_history
WHERE resource_type IS NOT NULL AND resource_id IS NOT NULL
LEFT JOIN (
    SELECT 
        resource_type,
        resource_id,
        activity_type,
        COUNT(*) as activity_count
    FROM activity_history
    WHERE resource_type IS NOT NULL AND resource_id IS NOT NULL
    GROUP BY resource_type, resource_id, activity_type
) activity_breakdown ON activity_history.resource_type = activity_breakdown.resource_type
    AND activity_history.resource_id = activity_breakdown.resource_id
    AND activity_history.activity_type = activity_breakdown.activity_type
GROUP BY resource_type, resource_id;

-- Security events view
CREATE OR REPLACE VIEW security_activity_view AS
SELECT 
    id,
    user_id,
    session_id,
    activity_type,
    timestamp,
    ip_address,
    location,
    details,
    CASE 
        WHEN activity_type IN ('login_failed', 'security_violation', 'suspicious_activity') THEN 'high'
        WHEN activity_type IN ('login', 'password_change', 'api_key_created') THEN 'medium'
        ELSE 'low'
    END as security_level,
    CASE 
        WHEN details->>'success' = 'false' THEN true
        WHEN activity_type IN ('security_violation', 'suspicious_activity', 'rate_limit_hit') THEN true
        ELSE false
    END as is_security_event
FROM activity_history
WHERE category = 'security' OR category = 'authentication'
    OR activity_type IN ('login_failed', 'security_violation', 'suspicious_activity', 'rate_limit_hit');

-- Functions for maintenance and aggregation

-- Function to update activity aggregations
CREATE OR REPLACE FUNCTION update_activity_aggregations()
RETURNS INTEGER AS $$
DECLARE
    processed_count INTEGER := 0;
BEGIN
    -- Update daily aggregations
    INSERT INTO activity_aggregations (
        user_id, aggregation_date, aggregation_type, 
        activity_counts, category_counts, resource_counts,
        unique_sessions, total_activities
    )
    SELECT 
        user_id,
        DATE(timestamp) as aggregation_date,
        'daily' as aggregation_type,
        jsonb_object_agg(activity_type, type_count) as activity_counts,
        jsonb_object_agg(category, cat_count) as category_counts,
        jsonb_object_agg(COALESCE(resource_type, 'unknown'), res_count) as resource_counts,
        COUNT(DISTINCT session_id) as unique_sessions,
        COUNT(*) as total_activities
    FROM (
        SELECT 
            user_id,
            timestamp,
            activity_type,
            category,
            resource_type,
            session_id,
            COUNT(*) OVER (PARTITION BY user_id, DATE(timestamp), activity_type) as type_count,
            COUNT(*) OVER (PARTITION BY user_id, DATE(timestamp), category) as cat_count,
            COUNT(*) OVER (PARTITION BY user_id, DATE(timestamp), COALESCE(resource_type, 'unknown')) as res_count
        FROM activity_history
        WHERE DATE(timestamp) = CURRENT_DATE - INTERVAL '1 day'
    ) daily_data
    GROUP BY user_id, DATE(timestamp)
    ON CONFLICT (user_id, aggregation_date, aggregation_type) 
    DO UPDATE SET
        activity_counts = EXCLUDED.activity_counts,
        category_counts = EXCLUDED.category_counts,
        resource_counts = EXCLUDED.resource_counts,
        unique_sessions = EXCLUDED.unique_sessions,
        total_activities = EXCLUDED.total_activities,
        updated_at = NOW();
    
    GET DIAGNOSTICS processed_count = ROW_COUNT;
    RETURN processed_count;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old activity data
CREATE OR REPLACE FUNCTION cleanup_old_activity_data(retention_days INTEGER DEFAULT 365)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
    cutoff_date TIMESTAMP WITH TIME ZONE;
BEGIN
    cutoff_date := NOW() - (retention_days || ' days')::INTERVAL;
    
    -- Delete old activity records
    DELETE FROM activity_history 
    WHERE timestamp < cutoff_date 
    AND (metadata->>'retentionPeriod')::INTEGER IS NULL; -- Don't delete records with custom retention
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Clean up orphaned sessions
    DELETE FROM activity_sessions 
    WHERE end_time < cutoff_date;
    
    -- Clean up expired exports
    DELETE FROM activity_exports 
    WHERE expires_at < NOW();
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to update session information
CREATE OR REPLACE FUNCTION update_activity_session(
    p_session_id UUID,
    p_user_id UUID,
    p_activity_count INTEGER DEFAULT 0
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO activity_sessions (
        user_id, session_id, start_time, activity_count, 
        ip_address, user_agent, location, categories
    )
    SELECT 
        p_user_id,
        p_session_id,
        MIN(timestamp) as start_time,
        COUNT(*) as activity_count,
        MODE() WITHIN GROUP (ORDER BY ip_address) as ip_address,
        MODE() WITHIN GROUP (ORDER BY user_agent) as user_agent,
        MODE() WITHIN GROUP (ORDER BY location) as location,
        jsonb_agg(DISTINCT category) as categories
    FROM activity_history
    WHERE session_id = p_session_id
    GROUP BY user_id, session_id
    ON CONFLICT (session_id)
    DO UPDATE SET
        end_time = (
            SELECT MAX(timestamp) 
            FROM activity_history 
            WHERE session_id = p_session_id
        ),
        duration_seconds = EXTRACT(EPOCH FROM (
            (SELECT MAX(timestamp) FROM activity_history WHERE session_id = p_session_id) -
            activity_sessions.start_time
        ))::INTEGER,
        activity_count = (
            SELECT COUNT(*) 
            FROM activity_history 
            WHERE session_id = p_session_id
        ),
        unique_resources = (
            SELECT COUNT(DISTINCT resource_id) 
            FROM activity_history 
            WHERE session_id = p_session_id AND resource_id IS NOT NULL
        ),
        categories = (
            SELECT jsonb_agg(DISTINCT category)
            FROM activity_history 
            WHERE session_id = p_session_id
        ),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic maintenance

-- Trigger to update session info when activity is inserted
CREATE OR REPLACE FUNCTION trigger_update_session_info()
RETURNS TRIGGER AS $$
BEGIN
    -- Update session information asynchronously
    PERFORM pg_notify('update_session', NEW.session_id::TEXT);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER activity_session_update_trigger
    AFTER INSERT ON activity_history
    FOR EACH ROW
    WHEN (NEW.session_id IS NOT NULL)
    EXECUTE FUNCTION trigger_update_session_info();

-- Comments for documentation
COMMENT ON TABLE activity_history IS 'Comprehensive activity tracking for all user actions';
COMMENT ON TABLE activity_aggregations IS 'Pre-computed activity aggregations for performance';
COMMENT ON TABLE activity_sessions IS 'Session-level activity analytics and tracking';
COMMENT ON TABLE activity_bookmarks IS 'User bookmarks for important activities';
COMMENT ON TABLE activity_alerts IS 'Automated alerts for unusual activity patterns';
COMMENT ON TABLE activity_exports IS 'Activity data exports for compliance and analysis';

COMMENT ON VIEW daily_activity_summary IS 'Daily activity statistics per user';
COMMENT ON VIEW user_activity_patterns IS 'Long-term user activity pattern analysis';
COMMENT ON VIEW resource_activity_summary IS 'Activity statistics grouped by resource';
COMMENT ON VIEW security_activity_view IS 'Security-focused activity monitoring view';

COMMENT ON FUNCTION update_activity_aggregations() IS 'Updates daily activity aggregation data';
COMMENT ON FUNCTION cleanup_old_activity_data(INTEGER) IS 'Removes old activity data based on retention policy';
COMMENT ON FUNCTION update_activity_session(UUID, UUID, INTEGER) IS 'Updates session tracking information';