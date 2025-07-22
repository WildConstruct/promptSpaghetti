-- Epic 17: Administrative Tools System
-- Migration: 042_admin_tools_system
-- DEPLOYMENT BLOCKER FIX: Creates tables for comprehensive admin interface and system management

-- System configuration storage
CREATE TABLE IF NOT EXISTS system_configuration (
    category VARCHAR(100) PRIMARY KEY,
    settings JSONB NOT NULL,
    last_modified TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    modified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    version INTEGER NOT NULL DEFAULT 1,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_settings CHECK (jsonb_typeof(settings) = 'object')
);

-- Security alerts tracking
CREATE TABLE IF NOT EXISTS security_alerts (
    id UUID PRIMARY KEY,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    type VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    resolved BOOLEAN NOT NULL DEFAULT false,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB,
    source VARCHAR(100), -- System component that generated the alert
    correlation_id VARCHAR(100), -- For grouping related alerts
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_resolution CHECK (
        (resolved = false) 
        OR (resolved = true AND resolved_by IS NOT NULL AND resolved_at IS NOT NULL)
    )
);

-- Maintenance tasks scheduling and tracking
CREATE TABLE IF NOT EXISTS maintenance_tasks (
    id UUID PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    estimated_duration INTEGER NOT NULL CHECK (estimated_duration > 0), -- minutes
    actual_duration INTEGER, -- minutes, filled when completed
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    category VARCHAR(50) NOT NULL CHECK (category IN ('backup', 'update', 'cleanup', 'optimization', 'security', 'migration')),
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    result JSONB, -- Task execution results
    notes TEXT, -- Admin notes about the task
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_execution_times CHECK (
        (status = 'pending' AND started_at IS NULL AND completed_at IS NULL)
        OR (status = 'in_progress' AND started_at IS NOT NULL AND completed_at IS NULL)
        OR (status IN ('completed', 'cancelled') AND started_at IS NOT NULL)
    ),
    CONSTRAINT valid_duration CHECK (
        actual_duration IS NULL OR actual_duration > 0
    )
);

-- System metrics history for trend analysis
CREATE TABLE IF NOT EXISTS system_metrics_history (
    id UUID PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    metric_type VARCHAR(50) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    value NUMERIC NOT NULL,
    unit VARCHAR(20),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Admin session tracking for enhanced security
CREATE TABLE IF NOT EXISTS admin_sessions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    ip_address INET NOT NULL,
    user_agent TEXT,
    permissions_snapshot JSONB, -- Snapshot of permissions at session start
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT false,
    revoked_at TIMESTAMP WITH TIME ZONE,
    revoked_by UUID REFERENCES users(id) ON DELETE SET NULL,
    revoke_reason TEXT,
    activities_count INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT valid_expiration CHECK (expires_at > created_at),
    CONSTRAINT valid_revocation CHECK (
        (revoked = false) 
        OR (revoked = true AND revoked_at IS NOT NULL)
    )
);

-- System health checks results
CREATE TABLE IF NOT EXISTS system_health_checks (
    id UUID PRIMARY KEY,
    check_name VARCHAR(100) NOT NULL,
    check_category VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('healthy', 'warning', 'critical', 'unknown')),
    message TEXT,
    details JSONB,
    execution_time INTEGER, -- milliseconds
    checked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    next_check_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_execution_time CHECK (execution_time IS NULL OR execution_time >= 0)
);

-- Admin action queue for scheduled operations
CREATE TABLE IF NOT EXISTS admin_action_queue (
    id UUID PRIMARY KEY,
    action_type VARCHAR(100) NOT NULL,
    target_type VARCHAR(50) NOT NULL, -- 'user', 'system', 'permission', etc.
    target_id VARCHAR(100),
    parameters JSONB NOT NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    priority INTEGER NOT NULL DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    processed_at TIMESTAMP WITH TIME ZONE,
    processed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    result JSONB,
    error_message TEXT,
    retry_count INTEGER NOT NULL DEFAULT 0,
    max_retries INTEGER NOT NULL DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_processing CHECK (
        (status = 'pending' AND processed_at IS NULL AND processed_by IS NULL)
        OR (status != 'pending' AND processed_at IS NOT NULL)
    ),
    CONSTRAINT valid_retries CHECK (retry_count <= max_retries)
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_system_configuration_modified ON system_configuration(last_modified DESC);
CREATE INDEX IF NOT EXISTS idx_system_configuration_category ON system_configuration(category);

CREATE INDEX IF NOT EXISTS idx_security_alerts_severity_timestamp ON security_alerts(severity, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_security_alerts_resolved ON security_alerts(resolved, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_security_alerts_type ON security_alerts(type, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_security_alerts_correlation ON security_alerts(correlation_id) WHERE correlation_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_status_scheduled ON maintenance_tasks(status, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_priority ON maintenance_tasks(priority DESC, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_category ON maintenance_tasks(category, status);
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_assigned ON maintenance_tasks(assigned_to, status);
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_creator ON maintenance_tasks(created_by);

CREATE INDEX IF NOT EXISTS idx_system_metrics_timestamp ON system_metrics_history(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_system_metrics_type_name ON system_metrics_history(metric_type, metric_name, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_user_active ON admin_sessions(user_id, revoked, expires_at);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(session_token) WHERE revoked = false;
CREATE INDEX IF NOT EXISTS idx_admin_sessions_activity ON admin_sessions(last_activity DESC) WHERE revoked = false;
CREATE INDEX IF NOT EXISTS idx_admin_sessions_ip ON admin_sessions(ip_address, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_health_checks_category_status ON system_health_checks(check_category, status);
CREATE INDEX IF NOT EXISTS idx_health_checks_name_checked ON system_health_checks(check_name, checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_checks_next_check ON system_health_checks(next_check_at) WHERE next_check_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_admin_queue_status_scheduled ON admin_action_queue(status, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_admin_queue_priority ON admin_action_queue(priority DESC, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_admin_queue_target ON admin_action_queue(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_admin_queue_creator ON admin_action_queue(created_by);

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION update_admin_tables_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timestamp update triggers
CREATE TRIGGER trigger_security_alerts_timestamp
    BEFORE UPDATE ON security_alerts
    FOR EACH ROW
    EXECUTE FUNCTION update_admin_tables_timestamp();

CREATE TRIGGER trigger_maintenance_tasks_timestamp
    BEFORE UPDATE ON maintenance_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_admin_tables_timestamp();

CREATE TRIGGER trigger_admin_queue_timestamp
    BEFORE UPDATE ON admin_action_queue
    FOR EACH ROW
    EXECUTE FUNCTION update_admin_tables_timestamp();

-- Function for automatic health check scheduling
CREATE OR REPLACE FUNCTION schedule_next_health_check()
RETURNS TRIGGER AS $$
DECLARE
    check_interval INTERVAL;
BEGIN
    -- Determine next check interval based on status
    CASE NEW.status
        WHEN 'critical' THEN check_interval := INTERVAL '5 minutes';
        WHEN 'warning' THEN check_interval := INTERVAL '15 minutes';
        WHEN 'healthy' THEN check_interval := INTERVAL '1 hour';
        ELSE check_interval := INTERVAL '30 minutes';
    END CASE;
    
    NEW.next_check_at := NEW.checked_at + check_interval;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_schedule_health_check
    BEFORE INSERT OR UPDATE ON system_health_checks
    FOR EACH ROW
    EXECUTE FUNCTION schedule_next_health_check();

-- Function for admin session activity updates
CREATE OR REPLACE FUNCTION update_admin_session_activity()
RETURNS TRIGGER AS $$
BEGIN
    -- Update last activity and increment activities count
    NEW.last_activity = NOW();
    NEW.activities_count = OLD.activities_count + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Views for common admin queries
CREATE OR REPLACE VIEW admin_dashboard_summary AS
SELECT 
    -- User metrics
    (SELECT COUNT(*) FROM users WHERE status != 'deleted') as total_users,
    (SELECT COUNT(*) FROM users WHERE status = 'active') as active_users,
    (SELECT COUNT(*) FROM users WHERE created_at >= NOW() - INTERVAL '1 day') as new_users_today,
    (SELECT COUNT(*) FROM users WHERE status = 'suspended' OR account_locked = true) as blocked_users,
    
    -- Permission metrics
    (SELECT COUNT(*) FROM roles) as total_roles,
    (SELECT COUNT(*) FROM user_direct_permissions WHERE status = 'active') as active_direct_permissions,
    (SELECT COUNT(*) FROM temporary_role_assignments WHERE status = 'active') as active_temp_permissions,
    
    -- System metrics
    (SELECT COUNT(*) FROM security_alerts WHERE resolved = false) as unresolved_alerts,
    (SELECT COUNT(*) FROM security_alerts WHERE resolved = false AND severity = 'critical') as critical_alerts,
    (SELECT COUNT(*) FROM maintenance_tasks WHERE status = 'pending') as pending_maintenance,
    (SELECT COUNT(*) FROM admin_action_queue WHERE status = 'pending') as queued_actions,
    
    -- Health status
    (SELECT COUNT(*) FROM system_health_checks WHERE status = 'critical') as critical_health_checks,
    (SELECT COUNT(*) FROM system_health_checks WHERE status = 'warning') as warning_health_checks;

CREATE OR REPLACE VIEW active_admin_sessions AS
SELECT 
    ass.*,
    u.email,
    u.status as user_status,
    EXTRACT(EPOCH FROM (NOW() - ass.last_activity))::INTEGER as seconds_since_activity
FROM admin_sessions ass
JOIN users u ON ass.user_id = u.id
WHERE ass.revoked = false 
    AND ass.expires_at > NOW()
    AND u.status = 'active';

-- Insert default system configurations
INSERT INTO system_configuration (category, settings, description, modified_by) VALUES
(
    'security',
    '{
        "session_timeout": 3600,
        "max_failed_logins": 5,
        "password_min_length": 8,
        "require_mfa": false,
        "admin_session_timeout": 1800,
        "audit_retention_days": 365
    }'::jsonb,
    'Security-related system settings',
    (SELECT id FROM users WHERE email LIKE '%@system%' LIMIT 1)
),
(
    'maintenance',
    '{
        "auto_cleanup_enabled": true,
        "cleanup_frequency": "daily",
        "backup_retention_days": 30,
        "log_retention_days": 90,
        "metric_retention_days": 180
    }'::jsonb,
    'System maintenance and cleanup settings',
    (SELECT id FROM users WHERE email LIKE '%@system%' LIMIT 1)
),
(
    'monitoring',
    '{
        "health_check_enabled": true,
        "metric_collection_enabled": true,
        "alert_threshold_cpu": 80,
        "alert_threshold_memory": 85,
        "alert_threshold_disk": 90
    }'::jsonb,
    'System monitoring and alerting configuration',
    (SELECT id FROM users WHERE email LIKE '%@system%' LIMIT 1)
) ON CONFLICT (category) DO NOTHING;

-- Insert sample health checks
INSERT INTO system_health_checks (id, check_name, check_category, status, message, details) VALUES
(gen_random_uuid(), 'Database Connection', 'database', 'healthy', 'Database is responsive', '{"response_time": 5, "connections": 12}'::jsonb),
(gen_random_uuid(), 'Memory Usage', 'system', 'healthy', 'Memory usage is within normal limits', '{"usage_percent": 65, "available_gb": 4.2}'::jsonb),
(gen_random_uuid(), 'Disk Space', 'storage', 'healthy', 'Sufficient disk space available', '{"usage_percent": 45, "free_gb": 120}'::jsonb),
(gen_random_uuid(), 'API Response Time', 'performance', 'healthy', 'API responses are within acceptable limits', '{"avg_response_ms": 150, "p95_response_ms": 300}'::jsonb)
ON CONFLICT DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE system_configuration IS 'Centralized system configuration storage with versioning';
COMMENT ON TABLE security_alerts IS 'Security alerts and incidents tracking system';
COMMENT ON TABLE maintenance_tasks IS 'Scheduled and tracked maintenance operations';
COMMENT ON TABLE system_metrics_history IS 'Historical system metrics for trend analysis';
COMMENT ON TABLE admin_sessions IS 'Enhanced admin session tracking with security features';
COMMENT ON TABLE system_health_checks IS 'System health monitoring results and scheduling';
COMMENT ON TABLE admin_action_queue IS 'Queue for scheduled administrative operations';

COMMENT ON COLUMN system_configuration.version IS 'Configuration version number, incremented on each update';
COMMENT ON COLUMN security_alerts.correlation_id IS 'Groups related alerts together for analysis';
COMMENT ON COLUMN maintenance_tasks.actual_duration IS 'Actual time taken for completed tasks (in minutes)';
COMMENT ON COLUMN admin_sessions.permissions_snapshot IS 'Snapshot of admin permissions at session creation';
COMMENT ON COLUMN admin_action_queue.retry_count IS 'Number of times this action has been retried';

COMMENT ON VIEW admin_dashboard_summary IS 'Summarized metrics for admin dashboard display';
COMMENT ON VIEW active_admin_sessions IS 'Currently active admin sessions with user details';