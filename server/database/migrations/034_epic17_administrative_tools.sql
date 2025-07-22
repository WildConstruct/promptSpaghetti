-- Epic 17 Administrative Tools Database Schema
-- Task: E17-1753114397013-996416 - Create administrative tools
-- 
-- Creates comprehensive administrative infrastructure for Epic 17 API Management System
-- including system monitoring, bulk operations, maintenance management, security scanning,
-- compliance reporting, and emergency operations tracking.

-- Bulk operations tracking
CREATE TABLE IF NOT EXISTS epic17_bulk_operations (
    id SERIAL PRIMARY KEY,
    operation_id UUID UNIQUE NOT NULL,
    operation_type VARCHAR(50) NOT NULL, -- revoke_keys, suspend_keys, rotate_secrets, update_limits, bulk_export, cleanup_data
    status VARCHAR(20) DEFAULT 'pending', -- pending, running, completed, failed, cancelled
    
    -- Operation metrics
    target_count INTEGER NOT NULL,
    processed_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    
    -- Timing
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    estimated_completion TIMESTAMP WITH TIME ZONE,
    
    -- Configuration
    parameters JSONB DEFAULT '{}'::jsonb,
    batch_size INTEGER DEFAULT 100,
    
    -- Results and logging
    results JSONB DEFAULT '[]'::jsonb,
    errors JSONB DEFAULT '[]'::jsonb,
    summary TEXT,
    
    -- Metadata
    initiated_by VARCHAR(255) NOT NULL,
    reason TEXT NOT NULL,
    approved_by VARCHAR(255),
    rollback_possible BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_epic17_bulk_ops_operation_id (operation_id),
    INDEX idx_epic17_bulk_ops_type (operation_type),
    INDEX idx_epic17_bulk_ops_status (status),
    INDEX idx_epic17_bulk_ops_initiated_by (initiated_by),
    INDEX idx_epic17_bulk_ops_created_at (created_at),
    INDEX idx_epic17_bulk_ops_composite (operation_type, status, created_at)
);

-- Maintenance windows management
CREATE TABLE IF NOT EXISTS epic17_maintenance_windows (
    id SERIAL PRIMARY KEY,
    window_id UUID UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    
    -- Scheduling
    scheduled_start TIMESTAMP WITH TIME ZONE NOT NULL,
    scheduled_end TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_start TIMESTAMP WITH TIME ZONE,
    actual_end TIMESTAMP WITH TIME ZONE,
    
    -- Status and impact
    status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, active, completed, cancelled
    impact_level VARCHAR(10) NOT NULL, -- low, medium, high
    affected_services JSONB DEFAULT '[]'::jsonb,
    expected_duration INTEGER NOT NULL, -- minutes
    
    -- Operations
    operations JSONB NOT NULL, -- Array of maintenance operations
    
    -- Notifications
    notifications_sent JSONB DEFAULT '[]'::jsonb,
    notify_before JSONB DEFAULT '[1440, 60, 15]'::jsonb, -- minutes before start
    
    -- Metadata
    created_by VARCHAR(255) NOT NULL,
    approved_by VARCHAR(255),
    reason TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_epic17_maintenance_window_id (window_id),
    INDEX idx_epic17_maintenance_scheduled_start (scheduled_start),
    INDEX idx_epic17_maintenance_status (status),
    INDEX idx_epic17_maintenance_impact (impact_level),
    INDEX idx_epic17_maintenance_created_by (created_by),
    INDEX idx_epic17_maintenance_upcoming (scheduled_start, status) WHERE status = 'scheduled'
);

-- Security scans and assessments
CREATE TABLE IF NOT EXISTS epic17_security_scans (
    id SERIAL PRIMARY KEY,
    scan_id UUID UNIQUE NOT NULL,
    scan_type VARCHAR(30) NOT NULL, -- vulnerability, compliance, configuration, permissions, keys
    status VARCHAR(20) DEFAULT 'running', -- running, completed, failed
    
    -- Timing
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    duration INTEGER, -- seconds
    
    -- Results summary
    total_checks INTEGER DEFAULT 0,
    passed_checks INTEGER DEFAULT 0,
    failed_checks INTEGER DEFAULT 0,
    critical_findings INTEGER DEFAULT 0,
    high_findings INTEGER DEFAULT 0,
    medium_findings INTEGER DEFAULT 0,
    low_findings INTEGER DEFAULT 0,
    
    -- Detailed results
    findings JSONB DEFAULT '[]'::jsonb,
    recommendations JSONB DEFAULT '[]'::jsonb,
    
    -- Metadata
    initiated_by VARCHAR(255) NOT NULL,
    scan_parameters JSONB DEFAULT '{}'::jsonb,
    
    -- Indexes
    INDEX idx_epic17_security_scans_scan_id (scan_id),
    INDEX idx_epic17_security_scans_type (scan_type),
    INDEX idx_epic17_security_scans_status (status),
    INDEX idx_epic17_security_scans_started_at (started_at),
    INDEX idx_epic17_security_scans_initiated_by (initiated_by),
    INDEX idx_epic17_security_scans_composite (scan_type, status, started_at)
);

-- Compliance reports and auditing
CREATE TABLE IF NOT EXISTS epic17_compliance_reports (
    id SERIAL PRIMARY KEY,
    report_id UUID UNIQUE NOT NULL,
    report_type VARCHAR(30) NOT NULL, -- soc2, gdpr, hipaa, pci_dss, custom
    
    -- Report scope
    date_range JSONB NOT NULL, -- {start, end} dates
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    generated_by VARCHAR(255) NOT NULL,
    
    -- Report data
    report_data JSONB NOT NULL, -- Complete report structure
    file_path TEXT, -- Path to generated report file
    file_format VARCHAR(20) DEFAULT 'json', -- json, pdf, excel, csv
    file_size BIGINT, -- bytes
    
    -- Status and access
    status VARCHAR(20) DEFAULT 'generating', -- generating, completed, failed, archived
    access_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE, -- Report retention
    
    -- Indexes
    INDEX idx_epic17_compliance_reports_report_id (report_id),
    INDEX idx_epic17_compliance_reports_type (report_type),
    INDEX idx_epic17_compliance_reports_generated_at (generated_at),
    INDEX idx_epic17_compliance_reports_status (status),
    INDEX idx_epic17_compliance_reports_expires_at (expires_at)
);

-- Data cleanup operations tracking
CREATE TABLE IF NOT EXISTS epic17_data_cleanup_operations (
    id SERIAL PRIMARY KEY,
    cleanup_id UUID UNIQUE NOT NULL,
    cleanup_type VARCHAR(30) NOT NULL, -- logs, expired_keys, old_sessions, unused_permissions, audit_trails
    status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, running, completed, failed
    
    -- Cleanup criteria
    cutoff_date TIMESTAMP WITH TIME ZONE,
    criteria JSONB NOT NULL,
    dry_run BOOLEAN DEFAULT TRUE,
    
    -- Results
    records_identified INTEGER DEFAULT 0,
    records_deleted INTEGER DEFAULT 0,
    space_freed BIGINT DEFAULT 0, -- bytes
    errors JSONB DEFAULT '[]'::jsonb,
    
    -- Execution timing
    scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration INTEGER, -- seconds
    
    -- Metadata
    initiated_by VARCHAR(255) NOT NULL,
    approved_by VARCHAR(255),
    backup_location TEXT, -- Location of backup before deletion
    
    -- Indexes
    INDEX idx_epic17_cleanup_cleanup_id (cleanup_id),
    INDEX idx_epic17_cleanup_type (cleanup_type),
    INDEX idx_epic17_cleanup_status (status),
    INDEX idx_epic17_cleanup_scheduled_at (scheduled_at),
    INDEX idx_epic17_cleanup_initiated_by (initiated_by)
);

-- System health monitoring data
CREATE TABLE IF NOT EXISTS epic17_system_health_snapshots (
    id SERIAL PRIMARY KEY,
    snapshot_id UUID UNIQUE NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Overall health
    overall_status VARCHAR(20) NOT NULL, -- healthy, degraded, unhealthy
    
    -- Component health
    components JSONB NOT NULL, -- Health status of all system components
    metrics JSONB NOT NULL, -- System performance metrics
    alerts JSONB DEFAULT '[]'::jsonb, -- Active system alerts
    recommendations JSONB DEFAULT '[]'::jsonb, -- Health recommendations
    
    -- Performance data
    response_time INTEGER, -- milliseconds
    error_rate DECIMAL(5,2), -- percentage
    memory_usage DECIMAL(5,2), -- percentage
    cpu_usage DECIMAL(5,2), -- percentage
    active_connections INTEGER,
    
    -- Retention policy (keep snapshots for analysis)
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    
    -- Indexes
    INDEX idx_epic17_health_timestamp (timestamp),
    INDEX idx_epic17_health_status (overall_status),
    INDEX idx_epic17_health_expires_at (expires_at),
    INDEX idx_epic17_health_performance (timestamp, overall_status, error_rate)
);

-- Emergency actions and incidents
CREATE TABLE IF NOT EXISTS epic17_emergency_actions (
    id SERIAL PRIMARY KEY,
    action_id UUID UNIQUE NOT NULL,
    action_type VARCHAR(50) NOT NULL, -- emergency_lockdown, emergency_recovery_unlock, emergency_recovery_restore, emergency_recovery_failover
    reason TEXT NOT NULL,
    
    -- Action details
    initiated_by VARCHAR(255) NOT NULL,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'executing', -- executing, completed, failed, cancelled
    
    -- Impact assessment
    affected_systems JSONB DEFAULT '[]'::jsonb,
    estimated_downtime INTEGER, -- minutes
    actual_downtime INTEGER, -- minutes
    
    -- Details and results
    details JSONB DEFAULT '{}'::jsonb,
    results JSONB DEFAULT '{}'::jsonb,
    error_message TEXT,
    
    -- Follow-up actions
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_notes TEXT,
    resolved_by VARCHAR(255),
    resolved_at TIMESTAMP WITH TIME ZONE,
    
    -- Indexes
    INDEX idx_epic17_emergency_action_id (action_id),
    INDEX idx_epic17_emergency_type (action_type),
    INDEX idx_epic17_emergency_executed_at (executed_at),
    INDEX idx_epic17_emergency_initiated_by (initiated_by),
    INDEX idx_epic17_emergency_status (status),
    INDEX idx_epic17_emergency_unresolved (executed_at, status) WHERE status != 'completed'
);

-- System configuration and feature flags for administrative tools
CREATE TABLE IF NOT EXISTS epic17_admin_config (
    id SERIAL PRIMARY KEY,
    config_key VARCHAR(255) UNIQUE NOT NULL,
    config_value JSONB NOT NULL,
    config_type VARCHAR(50) NOT NULL, -- feature_flag, threshold, limit, setting, schedule
    description TEXT,
    
    -- Environment and scope
    environment VARCHAR(50) DEFAULT 'production',
    scope VARCHAR(50) DEFAULT 'global', -- global, service, component
    enabled BOOLEAN DEFAULT TRUE,
    
    -- Change tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by VARCHAR(255),
    version INTEGER DEFAULT 1,
    
    -- Validation and constraints
    validation_rules JSONB DEFAULT '{}'::jsonb,
    allowed_values JSONB DEFAULT '[]'::jsonb,
    
    -- Indexes
    INDEX idx_epic17_admin_config_key (config_key),
    INDEX idx_epic17_admin_config_type (config_type),
    INDEX idx_epic17_admin_config_environment (environment),
    INDEX idx_epic17_admin_config_enabled (enabled),
    INDEX idx_epic17_admin_config_scope (scope)
);

-- Administrative notifications and alerts
CREATE TABLE IF NOT EXISTS epic17_admin_notifications (
    id SERIAL PRIMARY KEY,
    notification_id UUID UNIQUE NOT NULL,
    notification_type VARCHAR(50) NOT NULL, -- maintenance, security, system, compliance, emergency
    severity VARCHAR(20) NOT NULL, -- low, medium, high, critical
    
    -- Notification content
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    
    -- Targeting
    recipients JSONB NOT NULL, -- Array of recipients (emails, user IDs, etc.)
    channels JSONB DEFAULT '["email"]'::jsonb, -- email, webhook, slack, sms
    
    -- Delivery tracking
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivery_status JSONB DEFAULT '{}'::jsonb, -- Status per channel
    delivery_attempts INTEGER DEFAULT 0,
    last_attempt_at TIMESTAMP WITH TIME ZONE,
    
    -- Response tracking
    acknowledged_by JSONB DEFAULT '[]'::jsonb,
    response_required BOOLEAN DEFAULT FALSE,
    response_deadline TIMESTAMP WITH TIME ZONE,
    
    -- Related entities
    related_entity_type VARCHAR(50), -- maintenance_window, security_scan, bulk_operation, etc.
    related_entity_id UUID,
    
    -- Metadata
    created_by VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    
    -- Indexes
    INDEX idx_epic17_notifications_notification_id (notification_id),
    INDEX idx_epic17_notifications_type (notification_type),
    INDEX idx_epic17_notifications_severity (severity),
    INDEX idx_epic17_notifications_sent_at (sent_at),
    INDEX idx_epic17_notifications_related (related_entity_type, related_entity_id),
    INDEX idx_epic17_notifications_expires_at (expires_at)
);

-- Administrative tool usage metrics
CREATE TABLE IF NOT EXISTS epic17_admin_tool_usage (
    id SERIAL PRIMARY KEY,
    usage_id UUID UNIQUE NOT NULL,
    tool_name VARCHAR(100) NOT NULL, -- bulk_operations, maintenance, security_scan, cleanup, etc.
    action VARCHAR(100) NOT NULL, -- specific action within the tool
    
    -- Usage details
    used_by VARCHAR(255) NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    duration INTEGER, -- milliseconds
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    
    -- Parameters and results
    parameters JSONB DEFAULT '{}'::jsonb,
    results JSONB DEFAULT '{}'::jsonb,
    
    -- Impact metrics
    records_affected INTEGER,
    resources_used JSONB DEFAULT '{}'::jsonb, -- CPU, memory, etc.
    
    -- Session tracking
    session_id UUID,
    ip_address INET,
    user_agent TEXT,
    
    -- Indexes
    INDEX idx_epic17_tool_usage_tool_name (tool_name),
    INDEX idx_epic17_tool_usage_action (action),
    INDEX idx_epic17_tool_usage_used_by (used_by),
    INDEX idx_epic17_tool_usage_used_at (used_at),
    INDEX idx_epic17_tool_usage_success (success),
    INDEX idx_epic17_tool_usage_composite (tool_name, action, used_at)
);

-- Create functions for administrative operations

-- Function to automatically cleanup old health snapshots
CREATE OR REPLACE FUNCTION cleanup_old_health_snapshots() RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM epic17_system_health_snapshots 
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log cleanup in admin tool usage
    INSERT INTO epic17_admin_tool_usage (
        usage_id, tool_name, action, used_by, records_affected, success
    ) VALUES (
        gen_random_uuid(), 'health_monitoring', 'cleanup_snapshots', 'system', deleted_count, true
    );
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get system health summary
CREATE OR REPLACE FUNCTION get_system_health_summary() 
RETURNS TABLE(
    overall_status VARCHAR(20),
    healthy_components INTEGER,
    degraded_components INTEGER,
    unhealthy_components INTEGER,
    critical_alerts INTEGER,
    last_check TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        h.overall_status,
        (SELECT COUNT(*) FROM jsonb_array_elements(h.components) AS comp WHERE comp->>'status' = 'healthy')::INTEGER,
        (SELECT COUNT(*) FROM jsonb_array_elements(h.components) AS comp WHERE comp->>'status' = 'degraded')::INTEGER,
        (SELECT COUNT(*) FROM jsonb_array_elements(h.components) AS comp WHERE comp->>'status' = 'unhealthy')::INTEGER,
        (SELECT COUNT(*) FROM jsonb_array_elements(h.alerts) AS alert WHERE alert->>'severity' = 'critical')::INTEGER,
        h.timestamp
    FROM epic17_system_health_snapshots h
    ORDER BY h.timestamp DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to get active bulk operations summary
CREATE OR REPLACE FUNCTION get_active_bulk_operations_summary() 
RETURNS TABLE(
    total_active INTEGER,
    pending_operations INTEGER,
    running_operations INTEGER,
    operations_today INTEGER,
    avg_completion_time INTERVAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER FILTER (WHERE status IN ('pending', 'running')) AS total_active,
        COUNT(*)::INTEGER FILTER (WHERE status = 'pending') AS pending_operations,
        COUNT(*)::INTEGER FILTER (WHERE status = 'running') AS running_operations,
        COUNT(*)::INTEGER FILTER (WHERE created_at >= CURRENT_DATE) AS operations_today,
        AVG(completed_at - started_at) FILTER (WHERE completed_at IS NOT NULL AND started_at IS NOT NULL) AS avg_completion_time
    FROM epic17_bulk_operations;
END;
$$ LANGUAGE plpgsql;

-- Function to schedule automatic maintenance
CREATE OR REPLACE FUNCTION schedule_automatic_maintenance(
    p_title VARCHAR(255),
    p_description TEXT,
    p_start_time TIMESTAMP WITH TIME ZONE,
    p_duration INTEGER, -- minutes
    p_operations JSONB,
    p_impact_level VARCHAR(10) DEFAULT 'low'
) RETURNS UUID AS $$
DECLARE
    window_id UUID;
BEGIN
    window_id := gen_random_uuid();
    
    INSERT INTO epic17_maintenance_windows (
        window_id, title, description, scheduled_start, scheduled_end,
        impact_level, operations, created_by, reason, expected_duration
    ) VALUES (
        window_id, p_title, p_description, p_start_time, p_start_time + (p_duration * INTERVAL '1 minute'),
        p_impact_level, p_operations, 'system', 'Automatic maintenance', p_duration
    );
    
    -- Log the scheduling
    INSERT INTO epic17_admin_tool_usage (
        usage_id, tool_name, action, used_by, parameters, success
    ) VALUES (
        gen_random_uuid(), 'maintenance', 'schedule_automatic', 'system',
        jsonb_build_object('window_id', window_id, 'duration', p_duration, 'impact', p_impact_level), true
    );
    
    RETURN window_id;
END;
$$ LANGUAGE plpgsql;

-- Insert default administrative configuration
INSERT INTO epic17_admin_config (config_key, config_value, config_type, description) VALUES
-- Health monitoring settings
('health_check_interval', '60', 'setting', 'Health check interval in seconds'),
('performance_thresholds', '{
    "maxResponseTime": 1000,
    "maxErrorRate": 5,
    "maxMemoryUsage": 80,
    "maxCpuUsage": 70
}', 'threshold', 'System performance alert thresholds'),

-- Bulk operation limits
('bulk_operation_limits', '{
    "maxKeysPerOperation": 10000,
    "maxConcurrentOperations": 3,
    "timeoutMinutes": 60
}', 'limit', 'Bulk operation execution limits'),

-- Security scanning settings
('security_scan_schedule', '"0 2 * * 1"', 'schedule', 'Weekly security scan schedule (Monday 2 AM)'),
('security_scan_types', '["vulnerability", "compliance", "configuration"]', 'setting', 'Enabled security scan types'),

-- Data cleanup settings
('data_retention_days', '365', 'setting', 'Default data retention period in days'),
('cleanup_schedule', '"0 1 * * 0"', 'schedule', 'Weekly data cleanup schedule (Sunday 1 AM)'),

-- Notification settings
('notification_channels', '{
    "email": ["admin@example.com"],
    "webhook": [],
    "slack": null
}', 'setting', 'Default notification channels'),

-- Emergency settings
('emergency_contacts', '["emergency@example.com", "oncall@example.com"]', 'setting', 'Emergency contact list'),
('lockdown_enabled', 'true', 'feature_flag', 'Enable emergency lockdown capability'),

-- Maintenance settings
('maintenance_window_buffer', '15', 'setting', 'Buffer time in minutes before/after maintenance'),
('auto_maintenance_enabled', 'true', 'feature_flag', 'Enable automatic maintenance scheduling'),

-- Compliance settings
('compliance_reports_enabled', 'true', 'feature_flag', 'Enable compliance report generation'),
('audit_retention_years', '7', 'setting', 'Audit log retention period in years')

ON CONFLICT (config_key) DO NOTHING;

-- Create indexes for better performance on large datasets
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_epic17_bulk_ops_recent 
    ON epic17_bulk_operations (created_at DESC, status) 
    WHERE created_at >= NOW() - INTERVAL '30 days';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_epic17_health_recent 
    ON epic17_system_health_snapshots (timestamp DESC) 
    WHERE timestamp >= NOW() - INTERVAL '7 days';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_epic17_notifications_pending 
    ON epic17_admin_notifications (sent_at, notification_type) 
    WHERE expires_at > NOW();

-- Create a comprehensive administrative dashboard view
CREATE VIEW epic17_admin_dashboard AS
SELECT 
    -- System health summary
    (SELECT overall_status FROM epic17_system_health_snapshots ORDER BY timestamp DESC LIMIT 1) as current_system_status,
    (SELECT timestamp FROM epic17_system_health_snapshots ORDER BY timestamp DESC LIMIT 1) as last_health_check,
    
    -- Bulk operations summary
    (SELECT COUNT(*) FROM epic17_bulk_operations WHERE status IN ('pending', 'running')) as active_bulk_operations,
    (SELECT COUNT(*) FROM epic17_bulk_operations WHERE created_at >= CURRENT_DATE) as todays_bulk_operations,
    
    -- Maintenance summary
    (SELECT COUNT(*) FROM epic17_maintenance_windows WHERE status = 'scheduled' AND scheduled_start > NOW()) as scheduled_maintenance_windows,
    (SELECT COUNT(*) FROM epic17_maintenance_windows WHERE status = 'active') as active_maintenance_windows,
    
    -- Security summary
    (SELECT COUNT(*) FROM epic17_security_scans WHERE status = 'running') as running_security_scans,
    (SELECT COUNT(*) FROM epic17_security_scans WHERE completed_at >= NOW() - INTERVAL '24 hours' AND critical_findings > 0) as recent_critical_findings,
    
    -- Emergency actions
    (SELECT COUNT(*) FROM epic17_emergency_actions WHERE status != 'completed') as active_emergency_actions,
    
    -- Notifications
    (SELECT COUNT(*) FROM epic17_admin_notifications WHERE sent_at >= NOW() - INTERVAL '24 hours') as notifications_today,
    (SELECT COUNT(*) FROM epic17_admin_notifications WHERE response_required = true AND acknowledged_by = '[]'::jsonb) as pending_responses,
    
    -- Tool usage
    (SELECT COUNT(*) FROM epic17_admin_tool_usage WHERE used_at >= NOW() - INTERVAL '24 hours') as tool_usage_today,
    (SELECT COUNT(*) FROM epic17_admin_tool_usage WHERE used_at >= NOW() - INTERVAL '24 hours' AND success = false) as tool_errors_today;

-- Add table comments
COMMENT ON TABLE epic17_bulk_operations IS 'Tracks bulk operations on API keys and system resources';
COMMENT ON TABLE epic17_maintenance_windows IS 'Manages scheduled maintenance windows and operations';
COMMENT ON TABLE epic17_security_scans IS 'Records security scans and vulnerability assessments';
COMMENT ON TABLE epic17_compliance_reports IS 'Stores compliance reports and audit documentation';
COMMENT ON TABLE epic17_data_cleanup_operations IS 'Tracks data cleanup and retention operations';
COMMENT ON TABLE epic17_system_health_snapshots IS 'Historical system health monitoring data';
COMMENT ON TABLE epic17_emergency_actions IS 'Records emergency actions and incident responses';
COMMENT ON TABLE epic17_admin_config IS 'Administrative tool configuration and settings';
COMMENT ON TABLE epic17_admin_notifications IS 'System notifications and administrative alerts';
COMMENT ON TABLE epic17_admin_tool_usage IS 'Usage metrics and audit trail for administrative tools';

-- Create triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_epic17_admin_timestamp() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_epic17_bulk_operations_timestamp
    BEFORE UPDATE ON epic17_bulk_operations
    FOR EACH ROW EXECUTE FUNCTION update_epic17_admin_timestamp();

CREATE TRIGGER update_epic17_maintenance_windows_timestamp
    BEFORE UPDATE ON epic17_maintenance_windows
    FOR EACH ROW EXECUTE FUNCTION update_epic17_admin_timestamp();

CREATE TRIGGER update_epic17_admin_config_timestamp
    BEFORE UPDATE ON epic17_admin_config
    FOR EACH ROW EXECUTE FUNCTION update_epic17_admin_timestamp();

-- Grant permissions (adjust based on your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO epic17_admin_service;
-- GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO epic17_admin_service;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO epic17_admin_service;

-- Final setup completion message
DO $$
BEGIN
    RAISE NOTICE '✅ Epic 17 Administrative Tools database schema created successfully';
    RAISE NOTICE '📊 Tables created: 10 core tables + 1 dashboard view';
    RAISE NOTICE '🔧 Functions created: 4 utility functions';
    RAISE NOTICE '⚙️  Default configuration: 12 administrative settings';
    RAISE NOTICE '📈 Monitoring: Health snapshots, usage metrics, and audit trails';
    RAISE NOTICE '🚀 Administrative tools ready for Epic 17 operations';
END $$;