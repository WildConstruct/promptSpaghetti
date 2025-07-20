-- Migration: Session Monitoring System
-- Adds comprehensive session monitoring and alerting capabilities

-- Session alerts table
CREATE TABLE IF NOT EXISTS session_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'concurrent_limit', 
        'suspicious_location', 
        'unusual_device', 
        'rapid_location_change', 
        'session_hijack_attempt'
    )),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    details JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved BOOLEAN NOT NULL DEFAULT false,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES users(id),
    
    -- Indexes
    INDEX idx_alerts_user (user_id),
    INDEX idx_alerts_type (type),
    INDEX idx_alerts_severity (severity),
    INDEX idx_alerts_created (created_at),
    INDEX idx_alerts_resolved (resolved)
);

-- Session monitoring rules table
CREATE TABLE IF NOT EXISTS session_monitoring_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT true,
    threshold NUMERIC,
    parameters JSONB,
    action VARCHAR(50) NOT NULL CHECK (action IN ('alert', 'block', 'require_2fa', 'notify_user')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_monitoring_rules_type (type),
    INDEX idx_monitoring_rules_enabled (enabled)
);

-- Session analytics summary table (for performance)
CREATE TABLE IF NOT EXISTS session_analytics_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_sessions INTEGER NOT NULL DEFAULT 0,
    unique_devices INTEGER NOT NULL DEFAULT 0,
    unique_locations INTEGER NOT NULL DEFAULT 0,
    average_duration_seconds INTEGER,
    peak_concurrent_sessions INTEGER NOT NULL DEFAULT 0,
    failed_login_attempts INTEGER NOT NULL DEFAULT 0,
    successful_logins INTEGER NOT NULL DEFAULT 0,
    alerts_generated INTEGER NOT NULL DEFAULT 0,
    
    -- Indexes and constraints
    UNIQUE(user_id, date),
    INDEX idx_analytics_user_date (user_id, date),
    INDEX idx_analytics_date (date)
);

-- Real-time session metrics table
CREATE TABLE IF NOT EXISTS session_metrics_realtime (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total_active_sessions INTEGER NOT NULL,
    sessions_by_device JSONB NOT NULL,
    sessions_by_location JSONB NOT NULL,
    average_session_duration INTEGER,
    suspicious_activities INTEGER NOT NULL DEFAULT 0,
    concurrent_sessions_per_user JSONB,
    
    -- Index for time-based queries
    INDEX idx_metrics_timestamp (timestamp)
);

-- Session location tracking for anomaly detection
CREATE TABLE IF NOT EXISTS session_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES user_sessions(id) ON DELETE CASCADE,
    ip_address INET NOT NULL,
    country VARCHAR(2),
    region VARCHAR(100),
    city VARCHAR(100),
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_locations_session (session_id),
    INDEX idx_locations_recorded (recorded_at)
);

-- Device fingerprints for better device tracking
CREATE TABLE IF NOT EXISTS device_fingerprints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    fingerprint_hash VARCHAR(64) NOT NULL,
    device_info JSONB NOT NULL,
    first_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    trust_score NUMERIC(3, 2) DEFAULT 0.5,
    sessions_count INTEGER NOT NULL DEFAULT 1,
    
    -- Indexes and constraints
    UNIQUE(user_id, fingerprint_hash),
    INDEX idx_fingerprints_user (user_id),
    INDEX idx_fingerprints_hash (fingerprint_hash)
);

-- Function to update session analytics summary
CREATE OR REPLACE FUNCTION update_session_analytics_summary()
RETURNS TRIGGER AS $$
BEGIN
    -- Update or insert summary for the session's date
    INSERT INTO session_analytics_summary (
        user_id,
        date,
        total_sessions,
        unique_devices,
        unique_locations,
        successful_logins
    ) VALUES (
        NEW.user_id,
        DATE(NEW.created_at),
        1,
        1,
        1,
        1
    )
    ON CONFLICT (user_id, date) DO UPDATE SET
        total_sessions = session_analytics_summary.total_sessions + 1,
        unique_devices = (
            SELECT COUNT(DISTINCT device_info->>'fingerprint')
            FROM user_sessions
            WHERE user_id = NEW.user_id
              AND DATE(created_at) = DATE(NEW.created_at)
        ),
        unique_locations = (
            SELECT COUNT(DISTINCT ip_address)
            FROM user_sessions
            WHERE user_id = NEW.user_id
              AND DATE(created_at) = DATE(NEW.created_at)
        ),
        successful_logins = session_analytics_summary.successful_logins + 1;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update analytics on new sessions
CREATE TRIGGER update_analytics_on_session_create
    AFTER INSERT ON user_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_session_analytics_summary();

-- Default monitoring rules
INSERT INTO session_monitoring_rules (name, type, threshold, parameters, action) VALUES
    ('Concurrent Session Limit', 'concurrent_sessions', 5, '{"grace_period_minutes": 5}', 'alert'),
    ('Rapid Location Change', 'location_velocity', 500, '{"time_window_minutes": 30, "distance_km": 500}', 'alert'),
    ('Suspicious Device Detection', 'device_trust', 0.3, '{"min_trust_score": 0.3}', 'require_2fa'),
    ('Failed Login Threshold', 'failed_logins', 5, '{"time_window_minutes": 15}', 'block'),
    ('Session Hijack Detection', 'session_consistency', 1, '{"check_ip": true, "check_ua": true}', 'alert')
ON CONFLICT DO NOTHING;

-- Materialized view for session monitoring dashboard
CREATE MATERIALIZED VIEW IF NOT EXISTS session_monitoring_dashboard AS
SELECT 
    DATE_TRUNC('hour', created_at) as hour,
    COUNT(*) as total_sessions,
    COUNT(DISTINCT user_id) as unique_users,
    AVG(EXTRACT(EPOCH FROM (last_accessed_at - created_at))) as avg_duration_seconds,
    COUNT(CASE WHEN revoked THEN 1 END) as revoked_sessions
FROM user_sessions
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE_TRUNC('hour', created_at)
ORDER BY hour DESC;

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_monitoring_dashboard_hour 
ON session_monitoring_dashboard(hour);

-- Refresh function for the materialized view
CREATE OR REPLACE FUNCTION refresh_session_monitoring_dashboard()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY session_monitoring_dashboard;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON TABLE session_alerts IS 'Security alerts generated by session monitoring system';
COMMENT ON TABLE session_monitoring_rules IS 'Configurable rules for session monitoring and anomaly detection';
COMMENT ON TABLE session_analytics_summary IS 'Daily aggregated analytics for user sessions';
COMMENT ON TABLE session_metrics_realtime IS 'Real-time metrics snapshots for monitoring dashboard';
COMMENT ON TABLE device_fingerprints IS 'Trusted device tracking for enhanced security';

-- Grant permissions
GRANT SELECT ON session_monitoring_dashboard TO analytics_role;
GRANT SELECT, INSERT ON session_alerts TO app_role;
GRANT SELECT ON session_monitoring_rules TO app_role;
GRANT SELECT, INSERT, UPDATE ON session_analytics_summary TO app_role;
GRANT SELECT, INSERT ON session_metrics_realtime TO app_role;