-- Data Retention System Migration
-- Creates tables to support comprehensive data retention controls

-- Data retention policies table
CREATE TABLE IF NOT EXISTS data_retention_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    data_types JSONB NOT NULL,
    retention_period_days INTEGER NOT NULL CHECK (retention_period_days > 0),
    delete_type VARCHAR(20) NOT NULL CHECK (delete_type IN ('soft', 'hard', 'archive')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for active policies lookup
CREATE INDEX IF NOT EXISTS idx_retention_policies_active 
ON data_retention_policies(is_active) WHERE is_active = true;

-- Data export requests table
CREATE TABLE IF NOT EXISTS data_export_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    requested_by UUID NOT NULL REFERENCES users(id),
    purpose VARCHAR(50) NOT NULL CHECK (purpose IN ('user_request', 'legal_hold', 'compliance', 'migration')),
    data_types JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    export_url TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for data export requests
CREATE INDEX IF NOT EXISTS idx_export_requests_user 
ON data_export_requests(user_id);

CREATE INDEX IF NOT EXISTS idx_export_requests_status 
ON data_export_requests(status);

CREATE INDEX IF NOT EXISTS idx_export_requests_expires 
ON data_export_requests(expires_at);

-- Retention schedule executions table
CREATE TABLE IF NOT EXISTS retention_schedule_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id UUID NOT NULL REFERENCES data_retention_policies(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    records_processed INTEGER DEFAULT 0,
    records_deleted INTEGER DEFAULT 0,
    errors JSONB,
    execution_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for execution history queries
CREATE INDEX IF NOT EXISTS idx_retention_executions_policy 
ON retention_schedule_executions(policy_id, executed_at DESC);

CREATE INDEX IF NOT EXISTS idx_retention_executions_status 
ON retention_schedule_executions(status, executed_at DESC);

-- Archive tables for long-term data retention

-- Archived audit logs table
CREATE TABLE IF NOT EXISTS audit_logs_archive (
    LIKE audit_logs INCLUDING ALL
);

-- Index for archived audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_archive_user_action 
ON audit_logs_archive(user_id, action_type, created_at);

-- User projects archive (for deleted projects)
CREATE TABLE IF NOT EXISTS user_projects_archive (
    id UUID,
    user_id UUID,
    name VARCHAR(255),
    description TEXT,
    graph_data JSONB,
    archived_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    original_created_at TIMESTAMP WITH TIME ZONE,
    original_updated_at TIMESTAMP WITH TIME ZONE,
    archived_reason VARCHAR(100)
);

-- Index for archived projects
CREATE INDEX IF NOT EXISTS idx_projects_archive_user 
ON user_projects_archive(user_id, archived_at);

-- Analytics events archive table
CREATE TABLE IF NOT EXISTS analytics_events_archive (
    id UUID,
    user_id UUID,
    event_type VARCHAR(100),
    event_data JSONB,
    archived_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    original_created_at TIMESTAMP WITH TIME ZONE
);

-- Index for archived analytics
CREATE INDEX IF NOT EXISTS idx_analytics_archive_user_type 
ON analytics_events_archive(user_id, event_type, archived_at);

-- Add retention-related columns to existing tables if they don't exist

-- Add archived_at column to analytics_events if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'analytics_events' AND column_name = 'archived_at'
    ) THEN
        ALTER TABLE analytics_events ADD COLUMN archived_at TIMESTAMP WITH TIME ZONE;
        CREATE INDEX idx_analytics_events_archived ON analytics_events(archived_at) WHERE archived_at IS NOT NULL;
    END IF;
END $$;

-- Add retention metadata to user_sessions if needed
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_sessions' AND column_name = 'retention_eligible_at'
    ) THEN
        ALTER TABLE user_sessions ADD COLUMN retention_eligible_at TIMESTAMP WITH TIME ZONE;
        CREATE INDEX idx_sessions_retention ON user_sessions(retention_eligible_at) WHERE retention_eligible_at IS NOT NULL;
    END IF;
END $$;

-- Data retention configuration table for system settings
CREATE TABLE IF NOT EXISTS data_retention_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default retention configuration
INSERT INTO data_retention_config (setting_key, setting_value, description)
VALUES 
    ('auto_execution_enabled', 'true', 'Enable automatic execution of retention policies'),
    ('execution_schedule', 'daily', 'Schedule for automatic retention execution (daily, weekly, monthly)'),
    ('max_export_retention_days', '30', 'Days to keep user data exports before deletion'),
    ('notification_email', '', 'Email address for retention notifications'),
    ('dry_run_mode', 'false', 'Run retention policies in dry-run mode (log only, no deletions)')
ON CONFLICT (setting_key) DO NOTHING;

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at
CREATE TRIGGER update_retention_policies_updated_at
    BEFORE UPDATE ON data_retention_policies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_export_requests_updated_at
    BEFORE UPDATE ON data_export_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_retention_config_updated_at
    BEFORE UPDATE ON data_retention_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant appropriate permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON data_retention_policies TO app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON data_export_requests TO app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON retention_schedule_executions TO app_user;
-- GRANT SELECT, INSERT ON audit_logs_archive TO app_user;
-- GRANT SELECT, INSERT ON user_projects_archive TO app_user;
-- GRANT SELECT, INSERT ON analytics_events_archive TO app_user;
-- GRANT SELECT, UPDATE ON data_retention_config TO app_user;

-- Create a view for retention policy summaries
CREATE OR REPLACE VIEW retention_policy_summary AS
SELECT 
    p.id,
    p.name,
    p.description,
    p.retention_period_days,
    p.delete_type,
    p.is_active,
    COUNT(e.id) as execution_count,
    MAX(e.executed_at) as last_executed_at,
    COALESCE(SUM(e.records_processed), 0) as total_records_processed,
    COALESCE(SUM(e.records_deleted), 0) as total_records_deleted
FROM data_retention_policies p
LEFT JOIN retention_schedule_executions e ON p.id = e.policy_id
GROUP BY p.id, p.name, p.description, p.retention_period_days, p.delete_type, p.is_active;

-- Create a view for export request status
CREATE OR REPLACE VIEW export_request_status AS
SELECT 
    er.id,
    er.user_id,
    u.email as user_email,
    er.purpose,
    er.status,
    er.created_at,
    er.expires_at,
    CASE 
        WHEN er.expires_at < NOW() THEN true 
        ELSE false 
    END as is_expired,
    rb.email as requested_by_email
FROM data_export_requests er
JOIN users u ON er.user_id = u.id
JOIN users rb ON er.requested_by = rb.id;

COMMENT ON TABLE data_retention_policies IS 'Stores data retention policies for automated cleanup';
COMMENT ON TABLE data_export_requests IS 'Tracks user data export requests for GDPR compliance';
COMMENT ON TABLE retention_schedule_executions IS 'Logs execution of retention policies';
COMMENT ON TABLE audit_logs_archive IS 'Archive table for old audit logs';
COMMENT ON TABLE user_projects_archive IS 'Archive table for deleted user projects';
COMMENT ON TABLE analytics_events_archive IS 'Archive table for old analytics data';
COMMENT ON TABLE data_retention_config IS 'System configuration for data retention';