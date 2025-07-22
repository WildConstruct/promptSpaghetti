-- Recovery Automation System Database Schema - Epic 17
-- Task: E17-1753114397258-697892 - Create recovery automation
-- 
-- Comprehensive database schema for automated recovery system that provides
-- intelligent failure detection, recovery orchestration, and monitoring.

-- ==========================================
-- Recovery Automation Rules Table
-- ==========================================

CREATE TABLE IF NOT EXISTS recovery_automation_rules (
    rule_id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(500) NOT NULL,
    description TEXT,
    trigger_type VARCHAR(50) NOT NULL CHECK (trigger_type IN (
        'system_failure', 'data_corruption', 'performance_degradation',
        'security_incident', 'compliance_violation', 'scheduled_maintenance',
        'manual_trigger', 'cascade_failure'
    )),
    trigger_conditions JSONB NOT NULL DEFAULT '{}',
    recovery_strategy VARCHAR(50) NOT NULL CHECK (recovery_strategy IN (
        'immediate_rollback', 'selective_recovery', 'phased_recovery',
        'full_system_recovery', 'failover_recovery', 'hybrid_recovery'
    )),
    urgency VARCHAR(20) NOT NULL CHECK (urgency IN (
        'critical', 'high', 'medium', 'low', 'maintenance'
    )),
    auto_execute BOOLEAN NOT NULL DEFAULT false,
    max_attempts INTEGER NOT NULL DEFAULT 3 CHECK (max_attempts > 0),
    cooldown_period INTEGER NOT NULL DEFAULT 300 CHECK (cooldown_period >= 0), -- seconds
    notification_recipients JSONB NOT NULL DEFAULT '[]',
    escalation_policy JSONB NOT NULL DEFAULT '{}',
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by VARCHAR(100) NOT NULL
);

-- Indexes for recovery automation rules
CREATE INDEX IF NOT EXISTS idx_recovery_rules_trigger_type ON recovery_automation_rules(trigger_type);
CREATE INDEX IF NOT EXISTS idx_recovery_rules_urgency ON recovery_automation_rules(urgency);
CREATE INDEX IF NOT EXISTS idx_recovery_rules_enabled ON recovery_automation_rules(enabled);
CREATE INDEX IF NOT EXISTS idx_recovery_rules_created_at ON recovery_automation_rules(created_at);

-- ==========================================
-- Recovery Automation Executions Table
-- ==========================================

CREATE TABLE IF NOT EXISTS recovery_automation_executions (
    execution_id VARCHAR(100) PRIMARY KEY,
    rule_id VARCHAR(100) NOT NULL,
    trigger_type VARCHAR(50) NOT NULL,
    trigger_details JSONB NOT NULL DEFAULT '{}',
    recovery_strategy VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL CHECK (status IN (
        'monitoring', 'analyzing', 'preparing', 'executing', 'validating',
        'completed', 'failed', 'requires_intervention', 'cancelled'
    )),
    urgency VARCHAR(20) NOT NULL,
    auto_executed BOOLEAN NOT NULL DEFAULT false,
    recovery_steps JSONB NOT NULL DEFAULT '[]',
    recovery_point_used VARCHAR(100),
    execution_timeline JSONB NOT NULL DEFAULT '{}',
    metrics JSONB NOT NULL DEFAULT '{}',
    validation_results JSONB NOT NULL DEFAULT '{}',
    notifications_sent JSONB NOT NULL DEFAULT '[]',
    escalations JSONB NOT NULL DEFAULT '[]',
    admin_interventions JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Foreign key constraint
    CONSTRAINT fk_recovery_executions_rule 
        FOREIGN KEY (rule_id) REFERENCES recovery_automation_rules(rule_id)
        ON DELETE SET NULL
);

-- Indexes for recovery automation executions
CREATE INDEX IF NOT EXISTS idx_recovery_executions_rule_id ON recovery_automation_executions(rule_id);
CREATE INDEX IF NOT EXISTS idx_recovery_executions_trigger_type ON recovery_automation_executions(trigger_type);
CREATE INDEX IF NOT EXISTS idx_recovery_executions_status ON recovery_automation_executions(status);
CREATE INDEX IF NOT EXISTS idx_recovery_executions_urgency ON recovery_automation_executions(urgency);
CREATE INDEX IF NOT EXISTS idx_recovery_executions_created_at ON recovery_automation_executions(created_at);
CREATE INDEX IF NOT EXISTS idx_recovery_executions_auto_executed ON recovery_automation_executions(auto_executed);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_recovery_executions_status_created ON recovery_automation_executions(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recovery_executions_rule_status ON recovery_automation_executions(rule_id, status);

-- ==========================================
-- Recovery Automation Steps Table
-- ==========================================

CREATE TABLE IF NOT EXISTS recovery_automation_steps (
    step_id VARCHAR(100) PRIMARY KEY,
    execution_id VARCHAR(100) NOT NULL,
    step_name VARCHAR(500) NOT NULL,
    step_type VARCHAR(50) NOT NULL CHECK (step_type IN (
        'validation', 'backup', 'restore', 'verification', 'notification', 'custom'
    )),
    description TEXT,
    status VARCHAR(20) NOT NULL CHECK (status IN (
        'pending', 'running', 'completed', 'failed', 'skipped'
    )),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    duration_seconds INTEGER,
    error_message TEXT,
    retry_count INTEGER NOT NULL DEFAULT 0,
    max_retries INTEGER NOT NULL DEFAULT 3,
    step_data JSONB DEFAULT '{}',
    validation_results JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Foreign key constraint
    CONSTRAINT fk_recovery_steps_execution 
        FOREIGN KEY (execution_id) REFERENCES recovery_automation_executions(execution_id)
        ON DELETE CASCADE
);

-- Indexes for recovery automation steps
CREATE INDEX IF NOT EXISTS idx_recovery_steps_execution_id ON recovery_automation_steps(execution_id);
CREATE INDEX IF NOT EXISTS idx_recovery_steps_status ON recovery_automation_steps(status);
CREATE INDEX IF NOT EXISTS idx_recovery_steps_step_type ON recovery_automation_steps(step_type);
CREATE INDEX IF NOT EXISTS idx_recovery_steps_created_at ON recovery_automation_steps(created_at);

-- ==========================================
-- Recovery Automation Metrics Table
-- ==========================================

CREATE TABLE IF NOT EXISTS recovery_automation_metrics (
    metric_id VARCHAR(100) PRIMARY KEY,
    execution_id VARCHAR(100),
    rule_id VARCHAR(100),
    metric_name VARCHAR(200) NOT NULL,
    metric_value DECIMAL(15,4),
    metric_unit VARCHAR(50),
    metric_type VARCHAR(50) CHECK (metric_type IN (
        'performance', 'availability', 'recovery_time', 'success_rate', 
        'resource_usage', 'cost', 'compliance'
    )),
    measurement_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    tags JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    
    -- Foreign key constraints
    CONSTRAINT fk_recovery_metrics_execution 
        FOREIGN KEY (execution_id) REFERENCES recovery_automation_executions(execution_id)
        ON DELETE SET NULL,
    CONSTRAINT fk_recovery_metrics_rule 
        FOREIGN KEY (rule_id) REFERENCES recovery_automation_rules(rule_id)
        ON DELETE SET NULL
);

-- Indexes for recovery automation metrics
CREATE INDEX IF NOT EXISTS idx_recovery_metrics_execution_id ON recovery_automation_metrics(execution_id);
CREATE INDEX IF NOT EXISTS idx_recovery_metrics_rule_id ON recovery_automation_metrics(rule_id);
CREATE INDEX IF NOT EXISTS idx_recovery_metrics_name ON recovery_automation_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_recovery_metrics_type ON recovery_automation_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_recovery_metrics_time ON recovery_automation_metrics(measurement_time DESC);

-- ==========================================
-- Recovery Automation Alerts Table
-- ==========================================

CREATE TABLE IF NOT EXISTS recovery_automation_alerts (
    alert_id VARCHAR(100) PRIMARY KEY,
    execution_id VARCHAR(100),
    rule_id VARCHAR(100),
    alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN (
        'recovery_started', 'recovery_completed', 'recovery_failed',
        'escalation_triggered', 'intervention_required', 'threshold_breached'
    )),
    severity VARCHAR(20) NOT NULL CHECK (severity IN (
        'critical', 'high', 'medium', 'low', 'info'
    )),
    title VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    alert_data JSONB DEFAULT '{}',
    status VARCHAR(20) NOT NULL CHECK (status IN (
        'new', 'acknowledged', 'in_progress', 'resolved', 'suppressed'
    )) DEFAULT 'new',
    acknowledged_by VARCHAR(100),
    acknowledged_at TIMESTAMPTZ,
    resolved_by VARCHAR(100),
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Foreign key constraints
    CONSTRAINT fk_recovery_alerts_execution 
        FOREIGN KEY (execution_id) REFERENCES recovery_automation_executions(execution_id)
        ON DELETE SET NULL,
    CONSTRAINT fk_recovery_alerts_rule 
        FOREIGN KEY (rule_id) REFERENCES recovery_automation_rules(rule_id)
        ON DELETE SET NULL
);

-- Indexes for recovery automation alerts
CREATE INDEX IF NOT EXISTS idx_recovery_alerts_execution_id ON recovery_automation_alerts(execution_id);
CREATE INDEX IF NOT EXISTS idx_recovery_alerts_rule_id ON recovery_automation_alerts(rule_id);
CREATE INDEX IF NOT EXISTS idx_recovery_alerts_type ON recovery_automation_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_recovery_alerts_severity ON recovery_automation_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_recovery_alerts_status ON recovery_automation_alerts(status);
CREATE INDEX IF NOT EXISTS idx_recovery_alerts_created_at ON recovery_automation_alerts(created_at DESC);

-- ==========================================
-- Recovery Automation Configuration Table
-- ==========================================

CREATE TABLE IF NOT EXISTS recovery_automation_config (
    config_id VARCHAR(100) PRIMARY KEY,
    config_name VARCHAR(200) NOT NULL,
    config_value JSONB NOT NULL,
    config_type VARCHAR(50) NOT NULL CHECK (config_type IN (
        'system', 'notification', 'escalation', 'validation', 'security', 'performance'
    )),
    description TEXT,
    is_encrypted BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by VARCHAR(100) NOT NULL
);

-- Indexes for recovery automation configuration
CREATE INDEX IF NOT EXISTS idx_recovery_config_name ON recovery_automation_config(config_name);
CREATE INDEX IF NOT EXISTS idx_recovery_config_type ON recovery_automation_config(config_type);
CREATE INDEX IF NOT EXISTS idx_recovery_config_active ON recovery_automation_config(is_active);

-- ==========================================
-- Triggers and Functions
-- ==========================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_recovery_automation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic timestamp updates
DROP TRIGGER IF EXISTS trg_recovery_rules_updated_at ON recovery_automation_rules;
CREATE TRIGGER trg_recovery_rules_updated_at
    BEFORE UPDATE ON recovery_automation_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_recovery_automation_timestamp();

DROP TRIGGER IF EXISTS trg_recovery_executions_updated_at ON recovery_automation_executions;
CREATE TRIGGER trg_recovery_executions_updated_at
    BEFORE UPDATE ON recovery_automation_executions
    FOR EACH ROW
    EXECUTE FUNCTION update_recovery_automation_timestamp();

DROP TRIGGER IF EXISTS trg_recovery_steps_updated_at ON recovery_automation_steps;
CREATE TRIGGER trg_recovery_steps_updated_at
    BEFORE UPDATE ON recovery_automation_steps
    FOR EACH ROW
    EXECUTE FUNCTION update_recovery_automation_timestamp();

DROP TRIGGER IF EXISTS trg_recovery_alerts_updated_at ON recovery_automation_alerts;
CREATE TRIGGER trg_recovery_alerts_updated_at
    BEFORE UPDATE ON recovery_automation_alerts
    FOR EACH ROW
    EXECUTE FUNCTION update_recovery_automation_timestamp();

DROP TRIGGER IF EXISTS trg_recovery_config_updated_at ON recovery_automation_config;
CREATE TRIGGER trg_recovery_config_updated_at
    BEFORE UPDATE ON recovery_automation_config
    FOR EACH ROW
    EXECUTE FUNCTION update_recovery_automation_timestamp();

-- ==========================================
-- Views for Common Queries
-- ==========================================

-- Active recoveries view
CREATE OR REPLACE VIEW active_recovery_executions AS
SELECT 
    e.*,
    r.name as rule_name,
    r.trigger_type as rule_trigger_type,
    r.auto_execute as rule_auto_execute
FROM recovery_automation_executions e
JOIN recovery_automation_rules r ON e.rule_id = r.rule_id
WHERE e.status NOT IN ('completed', 'failed', 'cancelled');

-- Recovery analytics view
CREATE OR REPLACE VIEW recovery_automation_analytics AS
SELECT 
    DATE_TRUNC('day', e.created_at) as execution_date,
    e.trigger_type,
    e.recovery_strategy,
    e.urgency,
    COUNT(*) as total_executions,
    COUNT(*) FILTER (WHERE e.status = 'completed') as successful_executions,
    COUNT(*) FILTER (WHERE e.status = 'failed') as failed_executions,
    AVG(
        CASE 
            WHEN e.execution_timeline->>'completed_at' IS NOT NULL 
            THEN EXTRACT(EPOCH FROM (
                (e.execution_timeline->>'completed_at')::timestamp - 
                (e.execution_timeline->>'started_at')::timestamp
            )) / 60 
        END
    ) as avg_recovery_time_minutes,
    COUNT(*) FILTER (WHERE (e.escalations::text != '[]')) as escalations_count
FROM recovery_automation_executions e
WHERE e.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', e.created_at), e.trigger_type, e.recovery_strategy, e.urgency
ORDER BY execution_date DESC;

-- ==========================================
-- Initial Configuration Data
-- ==========================================

-- Insert default system configuration
INSERT INTO recovery_automation_config (config_id, config_name, config_value, config_type, description, created_by, updated_by) 
VALUES 
    ('system_monitoring_interval', 'monitoring_interval_seconds', '30', 'system', 'Interval in seconds between monitoring checks', 'system', 'system'),
    ('system_max_recoveries', 'max_concurrent_recoveries', '3', 'system', 'Maximum number of concurrent recovery operations', 'system', 'system'),
    ('system_default_timeout', 'default_recovery_timeout_minutes', '60', 'system', 'Default timeout for recovery operations in minutes', 'system', 'system'),
    ('notification_email', 'email_enabled', 'true', 'notification', 'Enable email notifications', 'system', 'system'),
    ('notification_sms', 'sms_enabled', 'true', 'notification', 'Enable SMS notifications', 'system', 'system'),
    ('escalation_enabled', 'enable_escalation', 'true', 'escalation', 'Enable automatic escalation', 'system', 'system'),
    ('escalation_default_time', 'default_escalation_minutes', '15', 'escalation', 'Default escalation time in minutes', 'system', 'system'),
    ('validation_pre_recovery', 'enable_pre_recovery_validation', 'true', 'validation', 'Enable pre-recovery validation', 'system', 'system'),
    ('validation_post_recovery', 'enable_post_recovery_validation', 'true', 'validation', 'Enable post-recovery validation', 'system', 'system'),
    ('security_audit_all', 'audit_all_recovery_actions', 'true', 'security', 'Audit all recovery actions', 'system', 'system'),
    ('security_encrypt_logs', 'encrypt_recovery_logs', 'true', 'security', 'Encrypt recovery logs', 'system', 'system'),
    ('performance_cpu_threshold', 'cpu_threshold', '85', 'performance', 'CPU threshold percentage for triggering recovery', 'system', 'system'),
    ('performance_memory_threshold', 'memory_threshold', '90', 'performance', 'Memory threshold percentage for triggering recovery', 'system', 'system'),
    ('performance_response_time', 'response_time_ms', '5000', 'performance', 'Response time threshold in milliseconds', 'system', 'system')
ON CONFLICT (config_id) DO NOTHING;

-- ==========================================
-- Sample Recovery Rules
-- ==========================================

-- Insert sample recovery rules
INSERT INTO recovery_automation_rules (
    rule_id, name, description, trigger_type, trigger_conditions, recovery_strategy,
    urgency, auto_execute, max_attempts, cooldown_period, notification_recipients,
    escalation_policy, created_by, updated_by
) VALUES 
    (
        'rule_system_failure_critical',
        'Critical System Failure Response',
        'Automatic recovery for critical system failures requiring immediate attention',
        'system_failure',
        '{"severity": "critical", "components": ["database", "api", "auth"], "threshold": 1}',
        'immediate_rollback',
        'critical',
        true,
        2,
        600,
        '["admin@company.com", "ops-team@company.com"]',
        '{"escalate_after_minutes": 5, "escalation_recipients": ["cto@company.com"], "escalation_actions": ["page_oncall"]}',
        'system',
        'system'
    ),
    (
        'rule_performance_degradation',
        'Performance Degradation Recovery',
        'Automatic recovery when system performance degrades beyond acceptable thresholds',
        'performance_degradation',
        '{"cpu_threshold": 95, "memory_threshold": 95, "response_time_ms": 10000, "duration": 300}',
        'selective_recovery',
        'high',
        true,
        3,
        900,
        '["performance-team@company.com", "ops-team@company.com"]',
        '{"escalate_after_minutes": 15, "escalation_recipients": ["admin@company.com"], "escalation_actions": ["scale_resources"]}',
        'system',
        'system'
    ),
    (
        'rule_data_corruption',
        'Data Corruption Recovery',
        'Recovery for detected data corruption issues',
        'data_corruption',
        '{"integrity_check_failed": true, "corruption_level": "high", "affected_tables": []}',
        'full_system_recovery',
        'critical',
        false,
        1,
        3600,
        '["data-team@company.com", "admin@company.com"]',
        '{"escalate_after_minutes": 10, "escalation_recipients": ["cto@company.com", "dpo@company.com"], "escalation_actions": ["notify_stakeholders"]}',
        'system',
        'system'
    )
ON CONFLICT (rule_id) DO NOTHING;

-- ==========================================
-- Security and Permissions
-- ==========================================

-- Create role for recovery automation access
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'recovery_automation_role') THEN
        CREATE ROLE recovery_automation_role;
    END IF;
END $$;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON recovery_automation_rules TO recovery_automation_role;
GRANT SELECT, INSERT, UPDATE ON recovery_automation_executions TO recovery_automation_role;
GRANT SELECT, INSERT, UPDATE ON recovery_automation_steps TO recovery_automation_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON recovery_automation_metrics TO recovery_automation_role;
GRANT SELECT, INSERT, UPDATE ON recovery_automation_alerts TO recovery_automation_role;
GRANT SELECT ON recovery_automation_config TO recovery_automation_role;
GRANT SELECT ON active_recovery_executions TO recovery_automation_role;
GRANT SELECT ON recovery_automation_analytics TO recovery_automation_role;

-- ==========================================
-- Data Retention and Cleanup
-- ==========================================

-- Function for cleaning up old recovery data
CREATE OR REPLACE FUNCTION cleanup_old_recovery_data(retention_days INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
    temp_count INTEGER;
BEGIN
    -- Clean up old completed executions
    DELETE FROM recovery_automation_executions 
    WHERE status IN ('completed', 'failed', 'cancelled') 
    AND created_at < CURRENT_DATE - INTERVAL '1 day' * retention_days;
    
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_count := deleted_count + temp_count;
    
    -- Clean up old metrics
    DELETE FROM recovery_automation_metrics 
    WHERE measurement_time < CURRENT_DATE - INTERVAL '1 day' * retention_days;
    
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_count := deleted_count + temp_count;
    
    -- Clean up old resolved alerts
    DELETE FROM recovery_automation_alerts 
    WHERE status = 'resolved' 
    AND resolved_at < CURRENT_DATE - INTERVAL '1 day' * retention_days;
    
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_count := deleted_count + temp_count;
    
    -- Log cleanup activity
    INSERT INTO recovery_automation_alerts (
        alert_id, alert_type, severity, title, message, alert_data, status
    ) VALUES (
        'cleanup_' || EXTRACT(EPOCH FROM NOW())::TEXT,
        'recovery_started',
        'info',
        'Recovery Data Cleanup',
        'Cleaned up old recovery automation data',
        json_build_object('deleted_records', deleted_count, 'retention_days', retention_days),
        'resolved'
    );
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- Comments for Documentation
-- ==========================================

COMMENT ON TABLE recovery_automation_rules IS 'Defines automated recovery rules with trigger conditions and recovery strategies';
COMMENT ON TABLE recovery_automation_executions IS 'Tracks execution of recovery automation processes with detailed timelines and metrics';
COMMENT ON TABLE recovery_automation_steps IS 'Individual steps within a recovery execution with status tracking and validation results';
COMMENT ON TABLE recovery_automation_metrics IS 'Performance and operational metrics collected during recovery processes';
COMMENT ON TABLE recovery_automation_alerts IS 'Alerts and notifications generated by the recovery automation system';
COMMENT ON TABLE recovery_automation_config IS 'System configuration settings for recovery automation behavior';

COMMENT ON VIEW active_recovery_executions IS 'Currently active recovery processes with rule details';
COMMENT ON VIEW recovery_automation_analytics IS 'Analytics and reporting data for recovery automation performance';

COMMENT ON FUNCTION cleanup_old_recovery_data IS 'Cleans up old recovery automation data based on retention policy';
COMMENT ON FUNCTION update_recovery_automation_timestamp IS 'Automatically updates timestamp fields on record modifications';

-- ==========================================
-- Migration Completion
-- ==========================================

-- Log migration completion
DO $$
BEGIN
    RAISE NOTICE 'Recovery Automation System migration completed successfully';
    RAISE NOTICE 'Tables created: recovery_automation_rules, recovery_automation_executions, recovery_automation_steps, recovery_automation_metrics, recovery_automation_alerts, recovery_automation_config';
    RAISE NOTICE 'Views created: active_recovery_executions, recovery_automation_analytics';
    RAISE NOTICE 'Sample data inserted: 3 recovery rules, 14 configuration entries';
END $$;