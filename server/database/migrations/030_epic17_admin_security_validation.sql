-- Epic 17 Admin Security Validation Migration
-- Creates database schema for comprehensive admin security validation system
-- Task: E17-1753114397250-47CE63 - Add security validation

-- Admin security policies table
CREATE TABLE IF NOT EXISTS admin_security_policies (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    operation_type VARCHAR(50) NOT NULL,
    min_privilege_level VARCHAR(20) DEFAULT 'standard',
    requires_mfa BOOLEAN DEFAULT FALSE,
    session_timeout INTEGER DEFAULT 480, -- minutes (8 hours)
    max_concurrent_sessions INTEGER DEFAULT 5,
    
    -- Access restrictions
    ip_whitelist JSONB DEFAULT '[]',
    time_restrictions JSONB DEFAULT '[]',
    
    -- Validation rules
    data_validation_rules JSONB DEFAULT '[]',
    rate_limits JSONB DEFAULT '[]',
    audit_requirements JSONB DEFAULT '[]',
    
    -- Policy metadata
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(36) NOT NULL,
    
    UNIQUE(operation_type)
);

-- Security events log table
CREATE TABLE IF NOT EXISTS security_events (
    id BIGSERIAL PRIMARY KEY,
    event_id VARCHAR(36) UNIQUE DEFAULT gen_random_uuid(),
    
    -- User and session context
    user_id VARCHAR(36) NOT NULL,
    session_id VARCHAR(36),
    ip_address INET NOT NULL,
    user_agent TEXT,
    
    -- Operation context
    operation_type VARCHAR(50) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(36),
    
    -- Validation results
    validation_result BOOLEAN NOT NULL,
    security_level VARCHAR(20) NOT NULL,
    requires_additional_auth BOOLEAN DEFAULT FALSE,
    
    -- Security details
    violations JSONB DEFAULT '[]',
    warnings JSONB DEFAULT '[]',
    risk_score INTEGER DEFAULT 0, -- 0-10
    
    -- Timing
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    processing_time_ms INTEGER,
    
    -- Additional data
    metadata JSONB DEFAULT '{}',
    
    -- Indexes for performance
    INDEX idx_security_events_user_id (user_id),
    INDEX idx_security_events_timestamp (timestamp),
    INDEX idx_security_events_operation_type (operation_type),
    INDEX idx_security_events_security_level (security_level),
    INDEX idx_security_events_validation_result (validation_result)
);

-- Security violations tracking table
CREATE TABLE IF NOT EXISTS security_violations (
    id BIGSERIAL PRIMARY KEY,
    violation_id VARCHAR(36) UNIQUE DEFAULT gen_random_uuid(),
    
    -- Linked event
    security_event_id BIGINT NOT NULL REFERENCES security_events(id) ON DELETE CASCADE,
    
    -- Violation details
    violation_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    description TEXT NOT NULL,
    risk_level INTEGER NOT NULL CHECK (risk_level >= 1 AND risk_level <= 10),
    
    -- Affected resources
    affected_resource VARCHAR(100) NOT NULL,
    resource_details JSONB DEFAULT '{}',
    
    -- Detection and remediation
    detection_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    remediation_actions JSONB NOT NULL DEFAULT '[]',
    evidence JSONB DEFAULT '{}',
    
    -- Resolution tracking
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by VARCHAR(36),
    resolution_notes TEXT,
    
    -- Follow-up actions
    requires_investigation BOOLEAN DEFAULT FALSE,
    escalation_level INTEGER DEFAULT 0,
    
    INDEX idx_violations_type (violation_type),
    INDEX idx_violations_severity (severity),
    INDEX idx_violations_resolved (resolved),
    INDEX idx_violations_detection_time (detection_time)
);

-- Rate limiting tracking table
CREATE TABLE IF NOT EXISTS rate_limit_tracking (
    id BIGSERIAL PRIMARY KEY,
    
    -- Rate limit key (usually user_id:operation)
    rate_limit_key VARCHAR(255) NOT NULL,
    
    -- Timing
    request_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    time_window_start TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Limit details
    operation_name VARCHAR(100) NOT NULL,
    max_requests INTEGER NOT NULL,
    window_minutes INTEGER NOT NULL,
    
    -- Current state
    current_count INTEGER NOT NULL DEFAULT 1,
    blocked BOOLEAN DEFAULT FALSE,
    blocked_until TIMESTAMP WITH TIME ZONE,
    
    -- Penalty applied
    penalty_type VARCHAR(20), -- 'warn', 'block', 'delay'
    penalty_duration INTEGER, -- minutes
    
    -- User context
    user_id VARCHAR(36) NOT NULL,
    ip_address INET NOT NULL,
    
    INDEX idx_rate_limit_key (rate_limit_key),
    INDEX idx_rate_limit_timestamp (request_timestamp),
    INDEX idx_rate_limit_user (user_id),
    INDEX idx_rate_limit_blocked (blocked)
);

-- Suspicious activity patterns table
CREATE TABLE IF NOT EXISTS suspicious_activity_patterns (
    id BIGSERIAL PRIMARY KEY,
    pattern_id VARCHAR(36) UNIQUE DEFAULT gen_random_uuid(),
    
    -- User and context
    user_id VARCHAR(36) NOT NULL,
    session_id VARCHAR(36),
    ip_address INET NOT NULL,
    
    -- Pattern details
    pattern_type VARCHAR(50) NOT NULL,
    pattern_description TEXT NOT NULL,
    confidence_score DECIMAL(5,4) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
    
    -- Detection details
    detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    detection_method VARCHAR(50) NOT NULL,
    pattern_data JSONB NOT NULL DEFAULT '{}',
    
    -- Severity and risk
    severity VARCHAR(20) NOT NULL,
    risk_score INTEGER NOT NULL CHECK (risk_score >= 1 AND risk_score <= 10),
    
    -- Investigation status
    investigated BOOLEAN DEFAULT FALSE,
    investigated_at TIMESTAMP WITH TIME ZONE,
    investigated_by VARCHAR(36),
    investigation_notes TEXT,
    
    -- Resolution
    false_positive BOOLEAN DEFAULT FALSE,
    action_taken VARCHAR(100),
    
    INDEX idx_suspicious_patterns_user (user_id),
    INDEX idx_suspicious_patterns_detected (detected_at),
    INDEX idx_suspicious_patterns_type (pattern_type),
    INDEX idx_suspicious_patterns_investigated (investigated)
);

-- User security context table - tracks security-relevant user information
CREATE TABLE IF NOT EXISTS user_security_context (
    user_id VARCHAR(36) PRIMARY KEY,
    
    -- Privilege information
    current_privilege_level VARCHAR(20) NOT NULL DEFAULT 'standard',
    privilege_granted_by VARCHAR(36),
    privilege_granted_at TIMESTAMP WITH TIME ZONE,
    privilege_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Security flags
    requires_mfa BOOLEAN DEFAULT FALSE,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_methods JSONB DEFAULT '[]',
    
    -- Session security
    max_session_duration INTEGER DEFAULT 480, -- minutes
    max_concurrent_sessions INTEGER DEFAULT 5,
    force_session_timeout BOOLEAN DEFAULT FALSE,
    
    -- Access restrictions
    ip_restrictions JSONB DEFAULT '[]',
    time_restrictions JSONB DEFAULT '[]',
    
    -- Security metrics
    failed_auth_count INTEGER DEFAULT 0,
    last_failed_auth TIMESTAMP WITH TIME ZONE,
    successful_auth_count INTEGER DEFAULT 0,
    last_successful_auth TIMESTAMP WITH TIME ZONE,
    
    -- Risk assessment
    risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 10),
    risk_factors JSONB DEFAULT '[]',
    last_risk_assessment TIMESTAMP WITH TIME ZONE,
    
    -- Audit trail
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Admin operation approvals table - for operations requiring additional approval
CREATE TABLE IF NOT EXISTS admin_operation_approvals (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Operation details
    operation_type VARCHAR(50) NOT NULL,
    operation_description TEXT NOT NULL,
    requested_by VARCHAR(36) NOT NULL,
    requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Security context
    security_event_id BIGINT REFERENCES security_events(id),
    risk_assessment JSONB NOT NULL DEFAULT '{}',
    required_approvers INTEGER DEFAULT 1,
    
    -- Approval tracking
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, expired
    approved_by JSONB DEFAULT '[]',
    approval_count INTEGER DEFAULT 0,
    rejected_by VARCHAR(36),
    rejection_reason TEXT,
    
    -- Timing
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Operation execution
    executed BOOLEAN DEFAULT FALSE,
    executed_at TIMESTAMP WITH TIME ZONE,
    execution_result JSONB DEFAULT '{}',
    
    -- Additional context
    metadata JSONB DEFAULT '{}',
    
    INDEX idx_operation_approvals_status (status),
    INDEX idx_operation_approvals_requested_by (requested_by),
    INDEX idx_operation_approvals_expires_at (expires_at),
    
    CONSTRAINT chk_approval_status CHECK (status IN ('pending', 'approved', 'rejected', 'expired', 'executed'))
);

-- Insert default security policies
INSERT INTO admin_security_policies (
    name, operation_type, min_privilege_level, requires_mfa, session_timeout,
    data_validation_rules, rate_limits, audit_requirements, created_by
) VALUES 
(
    'Feature Toggle Security Policy',
    'feature_toggle',
    'admin',
    true,
    240, -- 4 hours for feature toggles
    '[
        {
            "field": "feature_name",
            "type": "string",
            "required": true,
            "maxLength": 100,
            "pattern": "^[a-zA-Z0-9_-]+$",
            "sanitization": ["trim", "lowercase"]
        },
        {
            "field": "enabled",
            "type": "boolean",
            "required": true
        }
    ]',
    '[
        {
            "operation": "toggle_feature",
            "maxRequests": 50,
            "timeWindow": 60,
            "penalty": "warn",
            "penaltyDuration": 10
        }
    ]',
    '[
        {
            "level": "comprehensive",
            "retention": 2555, -- 7 years
            "fields": ["user_id", "feature_name", "old_value", "new_value", "timestamp"],
            "realTimeAlerts": true,
            "complianceFlags": ["SOX", "PCI"]
        }
    ]',
    'system'
),
(
    'User Management Security Policy',
    'user_management',
    'admin',
    true,
    180, -- 3 hours for user management
    '[
        {
            "field": "email",
            "type": "email",
            "required": true,
            "maxLength": 255,
            "sanitization": ["trim", "lowercase"]
        },
        {
            "field": "role",
            "type": "string",
            "required": true,
            "allowedValues": ["user", "admin", "super_admin"],
            "sanitization": ["trim"]
        }
    ]',
    '[
        {
            "operation": "create_user",
            "maxRequests": 20,
            "timeWindow": 60,
            "penalty": "block",
            "penaltyDuration": 30
        },
        {
            "operation": "delete_user",
            "maxRequests": 10,
            "timeWindow": 60,
            "penalty": "block",
            "penaltyDuration": 60
        }
    ]',
    '[
        {
            "level": "forensic",
            "retention": 2555, -- 7 years
            "fields": ["user_id", "target_user_id", "action", "old_values", "new_values"],
            "realTimeAlerts": true,
            "complianceFlags": ["GDPR", "HIPAA", "SOX"]
        }
    ]',
    'system'
),
(
    'System Configuration Security Policy',
    'system_configuration',
    'super_admin',
    true,
    120, -- 2 hours for system config
    '[
        {
            "field": "config_key",
            "type": "string",
            "required": true,
            "maxLength": 100,
            "pattern": "^[a-zA-Z0-9._-]+$",
            "sanitization": ["trim"]
        },
        {
            "field": "config_value",
            "type": "string",
            "required": true,
            "maxLength": 10000,
            "sanitization": ["trim"]
        }
    ]',
    '[
        {
            "operation": "update_config",
            "maxRequests": 30,
            "timeWindow": 60,
            "penalty": "block",
            "penaltyDuration": 60
        }
    ]',
    '[
        {
            "level": "forensic",
            "retention": 2555, -- 7 years
            "fields": ["user_id", "config_key", "old_value", "new_value", "impact_assessment"],
            "realTimeAlerts": true,
            "complianceFlags": ["SOX", "PCI", "GDPR"]
        }
    ]',
    'system'
),
(
    'Emergency Actions Security Policy',
    'emergency_actions',
    'super_admin',
    true,
    60, -- 1 hour for emergency actions
    '[]',
    '[
        {
            "operation": "emergency_action",
            "maxRequests": 5,
            "timeWindow": 60,
            "penalty": "block",
            "penaltyDuration": 120
        }
    ]',
    '[
        {
            "level": "forensic",
            "retention": 3650, -- 10 years
            "fields": ["user_id", "action_type", "justification", "approval_chain", "impact"],
            "realTimeAlerts": true,
            "complianceFlags": ["SOX", "PCI", "GDPR", "HIPAA"]
        }
    ]',
    'system'
)
ON CONFLICT (operation_type) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_security_policies_operation ON admin_security_policies(operation_type);
CREATE INDEX IF NOT EXISTS idx_admin_security_policies_enabled ON admin_security_policies(enabled);

-- GIN indexes for JSONB columns
CREATE INDEX IF NOT EXISTS idx_security_events_violations_gin ON security_events USING GIN(violations);
CREATE INDEX IF NOT EXISTS idx_security_events_warnings_gin ON security_events USING GIN(warnings);
CREATE INDEX IF NOT EXISTS idx_security_events_metadata_gin ON security_events USING GIN(metadata);

CREATE INDEX IF NOT EXISTS idx_security_violations_evidence_gin ON security_violations USING GIN(evidence);
CREATE INDEX IF NOT EXISTS idx_security_violations_remediation_gin ON security_violations USING GIN(remediation_actions);

-- Partitioning for security_events by month for performance
-- This would be implemented with pg_partman or similar in production

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_admin_security_policies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_admin_security_policies_updated_at
    BEFORE UPDATE ON admin_security_policies
    FOR EACH ROW
    EXECUTE FUNCTION update_admin_security_policies_updated_at();

CREATE TRIGGER trigger_user_security_context_updated_at
    BEFORE UPDATE ON user_security_context
    FOR EACH ROW
    EXECUTE FUNCTION update_admin_security_policies_updated_at();

-- Create views for security monitoring
CREATE OR REPLACE VIEW security_monitoring_dashboard AS
SELECT 
    DATE(se.timestamp) as event_date,
    se.operation_type,
    se.security_level,
    COUNT(*) as total_events,
    COUNT(*) FILTER (WHERE se.validation_result = false) as failed_validations,
    COUNT(*) FILTER (WHERE se.requires_additional_auth = true) as additional_auth_required,
    AVG(se.risk_score) as avg_risk_score,
    COUNT(DISTINCT se.user_id) as unique_users,
    COUNT(DISTINCT se.ip_address) as unique_ips
FROM security_events se
WHERE se.timestamp >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(se.timestamp), se.operation_type, se.security_level
ORDER BY event_date DESC, total_events DESC;

CREATE OR REPLACE VIEW active_security_violations AS
SELECT 
    sv.violation_id,
    sv.violation_type,
    sv.severity,
    sv.description,
    sv.risk_level,
    sv.affected_resource,
    sv.detection_time,
    se.user_id,
    se.ip_address,
    se.operation_type,
    se.resource_type,
    sv.requires_investigation,
    sv.escalation_level
FROM security_violations sv
JOIN security_events se ON sv.security_event_id = se.id
WHERE sv.resolved = false
ORDER BY sv.risk_level DESC, sv.detection_time DESC;

CREATE OR REPLACE VIEW user_risk_summary AS
SELECT 
    usc.user_id,
    u.email,
    usc.current_privilege_level,
    usc.risk_score,
    usc.failed_auth_count,
    usc.last_failed_auth,
    usc.last_successful_auth,
    COUNT(sv.id) FILTER (WHERE sv.resolved = false) as open_violations,
    COUNT(sap.id) FILTER (WHERE sap.detected_at > NOW() - INTERVAL '7 days') as recent_suspicious_activity
FROM user_security_context usc
LEFT JOIN users u ON usc.user_id = u.id
LEFT JOIN security_events se ON usc.user_id = se.user_id
LEFT JOIN security_violations sv ON se.id = sv.security_event_id
LEFT JOIN suspicious_activity_patterns sap ON usc.user_id = sap.user_id
WHERE usc.risk_score > 0 OR usc.failed_auth_count > 0
GROUP BY usc.user_id, u.email, usc.current_privilege_level, usc.risk_score, 
         usc.failed_auth_count, usc.last_failed_auth, usc.last_successful_auth
ORDER BY usc.risk_score DESC, open_violations DESC;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON admin_security_policies TO policy_service;
GRANT SELECT, INSERT, UPDATE, DELETE ON security_events TO policy_service;
GRANT SELECT, INSERT, UPDATE, DELETE ON security_violations TO policy_service;
GRANT SELECT, INSERT, UPDATE, DELETE ON rate_limit_tracking TO policy_service;
GRANT SELECT, INSERT, UPDATE, DELETE ON suspicious_activity_patterns TO policy_service;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_security_context TO policy_service;
GRANT SELECT, INSERT, UPDATE, DELETE ON admin_operation_approvals TO policy_service;

GRANT SELECT ON security_monitoring_dashboard TO policy_service;
GRANT SELECT ON active_security_violations TO policy_service;
GRANT SELECT ON user_risk_summary TO policy_service;

GRANT USAGE ON SEQUENCE security_events_id_seq TO policy_service;
GRANT USAGE ON SEQUENCE security_violations_id_seq TO policy_service;
GRANT USAGE ON SEQUENCE rate_limit_tracking_id_seq TO policy_service;
GRANT USAGE ON SEQUENCE suspicious_activity_patterns_id_seq TO policy_service;

-- Add comments for documentation
COMMENT ON TABLE admin_security_policies IS 'Epic 17 Admin Security: Configurable security policies for admin operations';
COMMENT ON TABLE security_events IS 'Epic 17 Admin Security: Comprehensive audit log of all security validation events';
COMMENT ON TABLE security_violations IS 'Epic 17 Admin Security: Detailed tracking of security violations and remediation actions';
COMMENT ON TABLE rate_limit_tracking IS 'Epic 17 Admin Security: Rate limiting enforcement and tracking';
COMMENT ON TABLE suspicious_activity_patterns IS 'Epic 17 Admin Security: Machine learning and pattern-based suspicious activity detection';
COMMENT ON TABLE user_security_context IS 'Epic 17 Admin Security: Enhanced security context and risk profiling for users';
COMMENT ON TABLE admin_operation_approvals IS 'Epic 17 Admin Security: Approval workflow for high-risk administrative operations';

COMMENT ON VIEW security_monitoring_dashboard IS 'Epic 17 Admin Security: Real-time security monitoring dashboard data';
COMMENT ON VIEW active_security_violations IS 'Epic 17 Admin Security: Active violations requiring attention';
COMMENT ON VIEW user_risk_summary IS 'Epic 17 Admin Security: User risk assessment and violation summary';

-- Migration completion log
INSERT INTO schema_migrations (version, applied_at) VALUES ('030_epic17_admin_security_validation', NOW())
ON CONFLICT (version) DO UPDATE SET applied_at = NOW();