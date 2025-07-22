-- Epic 17: Activity Timeline System
-- Migration: 043_activity_timeline_system
-- DEPLOYMENT BLOCKER FIX: Creates enhanced tables for user activity tracking and timeline system

-- Enhanced user activities table (extends existing ActivityHistoryService)
CREATE TABLE IF NOT EXISTS user_activities (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(255),
    activity_type VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id VARCHAR(255),
    details JSONB NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    location JSONB, -- Geolocation data
    duration INTEGER, -- Activity duration in milliseconds
    success BOOLEAN DEFAULT true,
    sensitive BOOLEAN DEFAULT false,
    internal BOOLEAN DEFAULT false,
    correlation_id VARCHAR(255), -- For grouping related activities
    parent_activity_id UUID REFERENCES user_activities(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Indexes for efficient querying
    CONSTRAINT valid_details CHECK (jsonb_typeof(details) = 'object'),
    CONSTRAINT valid_metadata CHECK (jsonb_typeof(metadata) = 'object'),
    CONSTRAINT valid_duration CHECK (duration IS NULL OR duration >= 0)
);

-- Timeline events for grouped activities
CREATE TABLE IF NOT EXISTS timeline_events (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('activity', 'milestone', 'alert', 'system')),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(20),
    severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'success')),
    category VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    location VARCHAR(100),
    device_info VARCHAR(100),
    duration INTEGER, -- Event duration in milliseconds
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT valid_metadata CHECK (jsonb_typeof(metadata) = 'object')
);

-- Mapping between timeline events and activities
CREATE TABLE IF NOT EXISTS timeline_event_activities (
    id UUID PRIMARY KEY,
    timeline_event_id UUID NOT NULL REFERENCES timeline_events(id) ON DELETE CASCADE,
    activity_id UUID NOT NULL REFERENCES user_activities(id) ON DELETE CASCADE,
    sequence_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    UNIQUE(timeline_event_id, activity_id)
);

-- User activity insights and analytics
CREATE TABLE IF NOT EXISTS user_activity_insights (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    analysis_date TIMESTAMP WITH TIME ZONE NOT NULL,
    time_range_start TIMESTAMP WITH TIME ZONE NOT NULL,
    time_range_end TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Activity patterns
    most_active_hours INTEGER[] DEFAULT '{}',
    most_active_days TEXT[] DEFAULT '{}',
    average_session_duration INTEGER, -- minutes
    total_sessions INTEGER DEFAULT 0,
    unique_devices INTEGER DEFAULT 0,
    location_history JSONB DEFAULT '[]'::jsonb,
    
    -- Behavior scores
    activity_score INTEGER CHECK (activity_score BETWEEN 0 AND 100),
    consistency_score INTEGER CHECK (consistency_score BETWEEN 0 AND 100),
    productivity_trend VARCHAR(20) CHECK (productivity_trend IN ('increasing', 'decreasing', 'stable')),
    risk_level VARCHAR(10) CHECK (risk_level IN ('low', 'medium', 'high')),
    anomaly_flags JSONB DEFAULT '[]'::jsonb,
    
    -- Feature usage
    feature_usage JSONB DEFAULT '{}'::jsonb,
    new_features JSONB DEFAULT '[]'::jsonb,
    abandoned_features JSONB DEFAULT '[]'::jsonb,
    
    -- Collaboration metrics
    collaboration_score INTEGER CHECK (collaboration_score BETWEEN 0 AND 100),
    average_shares_per_day NUMERIC(5,2) DEFAULT 0,
    unique_collaborators INTEGER DEFAULT 0,
    team_interactions INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT valid_time_range CHECK (time_range_end > time_range_start),
    CONSTRAINT valid_location_history CHECK (jsonb_typeof(location_history) = 'array'),
    CONSTRAINT valid_anomaly_flags CHECK (jsonb_typeof(anomaly_flags) = 'array'),
    CONSTRAINT valid_feature_usage CHECK (jsonb_typeof(feature_usage) = 'object')
);

-- Activity correlations for pattern recognition
CREATE TABLE IF NOT EXISTS activity_correlations (
    id UUID PRIMARY KEY,
    primary_activity_id UUID NOT NULL REFERENCES user_activities(id) ON DELETE CASCADE,
    related_activity_id UUID NOT NULL REFERENCES user_activities(id) ON DELETE CASCADE,
    correlation_type VARCHAR(20) NOT NULL CHECK (correlation_type IN ('sequence', 'concurrent', 'causation', 'pattern')),
    strength NUMERIC(3,2) CHECK (strength BETWEEN 0 AND 1),
    confidence NUMERIC(3,2) CHECK (confidence BETWEEN 0 AND 1),
    description TEXT,
    detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    UNIQUE(primary_activity_id, related_activity_id, correlation_type)
);

-- Activity streams for real-time updates
CREATE TABLE IF NOT EXISTS activity_streams (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stream_id VARCHAR(255) NOT NULL UNIQUE,
    filters JSONB NOT NULL,
    update_frequency INTEGER NOT NULL DEFAULT 30, -- seconds
    active_connections INTEGER NOT NULL DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
    
    CONSTRAINT valid_filters CHECK (jsonb_typeof(filters) = 'object'),
    CONSTRAINT valid_update_frequency CHECK (update_frequency > 0 AND update_frequency <= 3600),
    CONSTRAINT valid_expiration CHECK (expires_at > created_at)
);

-- Activity exports for compliance and data portability
CREATE TABLE IF NOT EXISTS activity_exports (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    export_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    exported_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    export_format VARCHAR(10) NOT NULL CHECK (export_format IN ('json', 'csv', 'pdf', 'xml')),
    date_range_start TIMESTAMP WITH TIME ZONE NOT NULL,
    date_range_end TIMESTAMP WITH TIME ZONE NOT NULL,
    total_records INTEGER NOT NULL DEFAULT 0,
    file_size BIGINT, -- bytes
    file_path VARCHAR(500), -- Storage path for the export file
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    privacy_settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT valid_date_range CHECK (date_range_end > date_range_start),
    CONSTRAINT valid_completion CHECK (
        (status IN ('pending', 'processing') AND completed_at IS NULL)
        OR (status IN ('completed', 'failed') AND completed_at IS NOT NULL)
    )
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_user_activities_user_timestamp ON user_activities(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_user_activities_session ON user_activities(session_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_user_activities_type_category ON user_activities(activity_type, category);
CREATE INDEX IF NOT EXISTS idx_user_activities_resource ON user_activities(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_correlation ON user_activities(correlation_id) WHERE correlation_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_activities_sensitive ON user_activities(sensitive, user_id, timestamp DESC) WHERE sensitive = true;
CREATE INDEX IF NOT EXISTS idx_user_activities_parent ON user_activities(parent_activity_id) WHERE parent_activity_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_timeline_events_user_timestamp ON timeline_events(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_timeline_events_type_severity ON timeline_events(event_type, severity);
CREATE INDEX IF NOT EXISTS idx_timeline_events_category ON timeline_events(category, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_timeline_event_activities_event ON timeline_event_activities(timeline_event_id, sequence_order);
CREATE INDEX IF NOT EXISTS idx_timeline_event_activities_activity ON timeline_event_activities(activity_id);

CREATE INDEX IF NOT EXISTS idx_user_insights_user_date ON user_activity_insights(user_id, analysis_date DESC);
CREATE INDEX IF NOT EXISTS idx_user_insights_risk_level ON user_activity_insights(risk_level, user_id);
CREATE INDEX IF NOT EXISTS idx_user_insights_scores ON user_activity_insights(activity_score DESC, consistency_score DESC);

CREATE INDEX IF NOT EXISTS idx_activity_correlations_primary ON activity_correlations(primary_activity_id, correlation_type);
CREATE INDEX IF NOT EXISTS idx_activity_correlations_related ON activity_correlations(related_activity_id, correlation_type);
CREATE INDEX IF NOT EXISTS idx_activity_correlations_strength ON activity_correlations(strength DESC, confidence DESC);

CREATE INDEX IF NOT EXISTS idx_activity_streams_user ON activity_streams(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_streams_expires ON activity_streams(expires_at);
CREATE INDEX IF NOT EXISTS idx_activity_streams_active ON activity_streams(active_connections) WHERE active_connections > 0;

CREATE INDEX IF NOT EXISTS idx_activity_exports_user_date ON activity_exports(user_id, export_date DESC);
CREATE INDEX IF NOT EXISTS idx_activity_exports_status ON activity_exports(status, created_at);
CREATE INDEX IF NOT EXISTS idx_activity_exports_exported_by ON activity_exports(exported_by);

-- Trigger functions for automation
CREATE OR REPLACE FUNCTION update_timeline_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timestamp update triggers
CREATE TRIGGER trigger_timeline_events_timestamp
    BEFORE UPDATE ON timeline_events
    FOR EACH ROW
    EXECUTE FUNCTION update_timeline_timestamp();

CREATE TRIGGER trigger_user_insights_timestamp
    BEFORE UPDATE ON user_activity_insights
    FOR EACH ROW
    EXECUTE FUNCTION update_timeline_timestamp();

-- Function to automatically clean up expired streams
CREATE OR REPLACE FUNCTION cleanup_expired_streams()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM activity_streams WHERE expires_at < NOW();
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for periodic stream cleanup (would be called by a scheduler)
CREATE OR REPLACE FUNCTION schedule_stream_cleanup()
RETURNS void AS $$
BEGIN
    DELETE FROM activity_streams WHERE expires_at < NOW() AND active_connections <= 0;
END;
$$ LANGUAGE plpgsql;

-- Function to generate timeline events from activities
CREATE OR REPLACE FUNCTION auto_create_timeline_events()
RETURNS TRIGGER AS $$
DECLARE
    event_id UUID;
    event_title TEXT;
    event_category TEXT;
BEGIN
    -- Auto-generate timeline event for significant activities
    IF NEW.activity_type IN ('login', 'graph_created', 'graph_executed', 'security_violation') THEN
        event_id := gen_random_uuid();
        event_title := CASE 
            WHEN NEW.activity_type = 'login' THEN 'User Login'
            WHEN NEW.activity_type = 'graph_created' THEN 'Graph Created'
            WHEN NEW.activity_type = 'graph_executed' THEN 'Graph Executed'
            WHEN NEW.activity_type = 'security_violation' THEN 'Security Alert'
            ELSE 'Activity'
        END;
        event_category := NEW.category;
        
        INSERT INTO timeline_events (
            id, user_id, event_type, title, category, timestamp, 
            severity, metadata
        ) VALUES (
            event_id, NEW.user_id, 'activity', event_title, event_category, 
            NEW.timestamp, 
            CASE WHEN NEW.activity_type = 'security_violation' THEN 'error' ELSE 'info' END,
            json_build_object('auto_generated', true, 'activity_type', NEW.activity_type)
        );
        
        -- Link the activity to the timeline event
        INSERT INTO timeline_event_activities (
            id, timeline_event_id, activity_id, sequence_order
        ) VALUES (
            gen_random_uuid(), event_id, NEW.id, 0
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-creating timeline events
CREATE TRIGGER trigger_auto_timeline_events
    AFTER INSERT ON user_activities
    FOR EACH ROW
    EXECUTE FUNCTION auto_create_timeline_events();

-- Views for common queries
CREATE OR REPLACE VIEW user_activity_summary AS
SELECT 
    ua.user_id,
    u.email,
    COUNT(*) as total_activities,
    COUNT(DISTINCT ua.session_id) as unique_sessions,
    COUNT(DISTINCT DATE(ua.timestamp)) as active_days,
    MIN(ua.timestamp) as first_activity,
    MAX(ua.timestamp) as last_activity,
    COUNT(*) FILTER (WHERE ua.success = false) as failed_activities,
    COUNT(*) FILTER (WHERE ua.sensitive = true) as sensitive_activities,
    COUNT(DISTINCT ua.ip_address) as unique_ips,
    ARRAY_AGG(DISTINCT ua.category) as categories_used
FROM user_activities ua
JOIN users u ON ua.user_id = u.id
GROUP BY ua.user_id, u.email;

CREATE OR REPLACE VIEW recent_timeline_events AS
SELECT 
    te.*,
    u.email as user_email,
    COUNT(tea.activity_id) as activity_count,
    ARRAY_AGG(ua.activity_type) as activity_types
FROM timeline_events te
JOIN users u ON te.user_id = u.id
LEFT JOIN timeline_event_activities tea ON te.id = tea.timeline_event_id
LEFT JOIN user_activities ua ON tea.activity_id = ua.id
WHERE te.timestamp >= NOW() - INTERVAL '7 days'
GROUP BY te.id, u.email
ORDER BY te.timestamp DESC;

CREATE OR REPLACE VIEW activity_correlation_summary AS
SELECT 
    ac.primary_activity_id,
    ac.correlation_type,
    COUNT(*) as correlation_count,
    AVG(ac.strength) as avg_strength,
    AVG(ac.confidence) as avg_confidence,
    ARRAY_AGG(DISTINCT ua2.activity_type) as related_activity_types
FROM activity_correlations ac
JOIN user_activities ua1 ON ac.primary_activity_id = ua1.id
JOIN user_activities ua2 ON ac.related_activity_id = ua2.id
GROUP BY ac.primary_activity_id, ac.correlation_type;

-- Insert default activity categories and types
INSERT INTO system_configuration (category, settings, description, modified_by) VALUES
(
    'activity_timeline',
    '{
        "auto_generate_events": true,
        "retention_days": 365,
        "correlation_analysis": true,
        "real_time_streams": true,
        "privacy_mode": false,
        "batch_processing": true,
        "insight_generation": true
    }'::jsonb,
    'Activity timeline system configuration',
    (SELECT id FROM users WHERE email LIKE '%@system%' LIMIT 1)
) ON CONFLICT (category) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE user_activities IS 'Enhanced user activity tracking with rich metadata and correlation support';
COMMENT ON TABLE timeline_events IS 'Grouped activity events for timeline visualization';
COMMENT ON TABLE timeline_event_activities IS 'Many-to-many relationship between timeline events and activities';
COMMENT ON TABLE user_activity_insights IS 'Analytics and behavioral insights derived from user activities';
COMMENT ON TABLE activity_correlations IS 'Detected correlations and patterns between activities';
COMMENT ON TABLE activity_streams IS 'Real-time activity streams for live updates';
COMMENT ON TABLE activity_exports IS 'Activity data exports for compliance and portability';

COMMENT ON COLUMN user_activities.correlation_id IS 'Groups related activities together for analysis';
COMMENT ON COLUMN user_activities.parent_activity_id IS 'Links child activities to parent activities';
COMMENT ON COLUMN timeline_events.event_type IS 'Type of timeline event: activity, milestone, alert, or system';
COMMENT ON COLUMN user_activity_insights.anomaly_flags IS 'Array of detected behavioral anomalies';
COMMENT ON COLUMN activity_correlations.strength IS 'Correlation strength from 0 (weak) to 1 (strong)';
COMMENT ON COLUMN activity_correlations.confidence IS 'Confidence level in the correlation from 0 to 1';
COMMENT ON COLUMN activity_streams.update_frequency IS 'How often the stream updates in seconds';
COMMENT ON COLUMN activity_exports.privacy_settings IS 'Privacy settings applied during export';

COMMENT ON VIEW user_activity_summary IS 'Summary statistics for user activity patterns';
COMMENT ON VIEW recent_timeline_events IS 'Recent timeline events with activity details';
COMMENT ON VIEW activity_correlation_summary IS 'Summary of activity correlations and patterns';