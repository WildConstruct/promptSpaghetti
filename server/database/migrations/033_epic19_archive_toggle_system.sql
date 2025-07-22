-- Epic 19 Archive Toggle System Schema
-- Migration: 033_epic19_archive_toggle_system.sql
-- 
-- This migration creates database tables for the archive toggle system as part of
-- Epic 19's Data Protection & Privacy Controls. It provides toggle-based archiving
-- functionality with comprehensive audit trails and compliance support.

-- Archive Toggle Configurations Table
-- Stores the configuration settings for each archive toggle
CREATE TABLE IF NOT EXISTS archive_toggle_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    scope VARCHAR(50) NOT NULL CHECK (scope IN (
        'global', 'data_type', 'user_data', 'compliance_data',
        'temporary_data', 'log_data', 'system_data', 'backup_data'
    )),
    mode VARCHAR(50) NOT NULL DEFAULT 'manual_only' CHECK (mode IN (
        'disabled', 'manual_only', 'scheduled', 
        'automatic', 'compliance_only', 'emergency'
    )),
    
    -- Data type filters (JSON arrays)
    allowed_archive_types JSONB DEFAULT '[]',
    allowed_categories JSONB DEFAULT '[]',
    allowed_classifications JSONB DEFAULT '[]',
    
    -- Toggle behavior configuration
    enabled_by_default BOOLEAN DEFAULT FALSE,
    requires_explicit_consent BOOLEAN DEFAULT TRUE,
    respects_retention_policies BOOLEAN DEFAULT TRUE,
    
    -- Compliance and security settings
    compliance_required BOOLEAN DEFAULT FALSE,
    gdpr_compliant BOOLEAN DEFAULT FALSE,
    hipaa_compliant BOOLEAN DEFAULT FALSE,
    sox_compliant BOOLEAN DEFAULT FALSE,
    
    -- Notification and audit settings
    audit_archive_operations BOOLEAN DEFAULT TRUE,
    notify_on_toggle_change BOOLEAN DEFAULT TRUE,
    security_event_logging BOOLEAN DEFAULT TRUE,
    
    -- Emergency and override settings
    allow_emergency_override BOOLEAN DEFAULT FALSE,
    emergency_override_ttl_minutes INTEGER DEFAULT 60,
    requires_admin_approval BOOLEAN DEFAULT FALSE,
    
    -- Integration settings
    integrate_with_retention_policies BOOLEAN DEFAULT TRUE,
    respect_user_consent_settings BOOLEAN DEFAULT TRUE,
    
    -- Custom configuration
    custom_settings JSONB DEFAULT '{}',
    
    -- Metadata
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255) NOT NULL,
    last_modified_by VARCHAR(255) NOT NULL,
    
    -- Constraints
    CONSTRAINT unique_toggle_name UNIQUE (name),
    CONSTRAINT valid_ttl_minutes CHECK (emergency_override_ttl_minutes > 0 AND emergency_override_ttl_minutes <= 1440)
);

-- Archive Toggle States Table
-- Stores the runtime state of each archive toggle
CREATE TABLE IF NOT EXISTS archive_toggle_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_id UUID NOT NULL REFERENCES archive_toggle_configs(id) ON DELETE CASCADE,
    org_id UUID, -- Optional organization scope
    user_id UUID, -- Optional user scope
    
    -- Current state
    is_enabled BOOLEAN DEFAULT FALSE,
    current_mode VARCHAR(50) NOT NULL DEFAULT 'manual_only',
    
    -- Context information
    last_toggle_time TIMESTAMP WITH TIME ZONE,
    toggled_by VARCHAR(255),
    toggle_reason TEXT,
    
    -- Emergency override state
    is_overridden BOOLEAN DEFAULT FALSE,
    override_expires_at TIMESTAMP WITH TIME ZONE,
    override_reason TEXT,
    override_approved_by VARCHAR(255),
    
    -- Compliance and consent state
    has_user_consent BOOLEAN,
    compliance_status VARCHAR(50) DEFAULT 'pending_review' CHECK (compliance_status IN (
        'compliant', 'non_compliant', 'pending_review', 'requires_consent', 'unknown'
    )),
    last_consent_check TIMESTAMP WITH TIME ZONE,
    
    -- Statistics
    archive_operations_count INTEGER DEFAULT 0,
    last_archive_operation TIMESTAMP WITH TIME ZONE,
    failed_archive_operations INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_config_org_user UNIQUE (config_id, org_id, user_id),
    CONSTRAINT valid_operations_count CHECK (archive_operations_count >= 0),
    CONSTRAINT valid_failed_count CHECK (failed_archive_operations >= 0),
    CONSTRAINT failed_not_greater_than_total CHECK (failed_archive_operations <= archive_operations_count)
);

-- Archive Toggle Audit Trail Table
-- Stores detailed audit logs for all archive toggle operations
CREATE TABLE IF NOT EXISTS archive_toggle_audit_trail (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_id UUID NOT NULL REFERENCES archive_toggle_configs(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    action VARCHAR(100) NOT NULL CHECK (action IN (
        'enabled', 'disabled', 'mode_changed', 'scope_updated',
        'emergency_override', 'override_expired', 'compliance_check',
        'consent_granted', 'consent_revoked', 'config_updated',
        'archive_operation_triggered', 'archive_operation_blocked'
    )),
    
    -- Actor information
    actor_id VARCHAR(255) NOT NULL,
    actor_type VARCHAR(50) NOT NULL CHECK (actor_type IN ('user', 'system', 'admin')),
    
    -- State changes
    previous_state JSONB,
    new_state JSONB,
    
    -- Context
    reason TEXT,
    ip_address INET,
    user_agent TEXT,
    is_emergency BOOLEAN DEFAULT FALSE,
    
    -- Related operations
    related_archive_ids JSONB DEFAULT '[]',
    impacted_data_types JSONB DEFAULT '[]',
    
    -- Compliance context
    compliance_context JSONB DEFAULT '{}',
    
    -- Additional metadata
    metadata JSONB DEFAULT '{}',
    
    -- Indexes for efficient querying
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Archive Toggle Evaluations Table
-- Stores evaluation results for audit and analytics
CREATE TABLE IF NOT EXISTS archive_toggle_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id VARCHAR(255) UNIQUE NOT NULL,
    config_id UUID REFERENCES archive_toggle_configs(id) ON DELETE SET NULL,
    
    -- Evaluation context
    user_id VARCHAR(255),
    org_id UUID,
    archive_type VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    data_classification VARCHAR(100) NOT NULL,
    source_identifier VARCHAR(255) NOT NULL,
    
    -- Compliance context
    compliance_requirements JSONB DEFAULT '[]',
    has_user_consent BOOLEAN,
    
    -- Operational context
    is_emergency BOOLEAN DEFAULT FALSE,
    is_scheduled BOOLEAN DEFAULT FALSE,
    triggered_by VARCHAR(50) NOT NULL CHECK (triggered_by IN ('user', 'system', 'policy', 'emergency')),
    
    -- Evaluation result
    is_archiving_allowed BOOLEAN NOT NULL,
    mode_used VARCHAR(50) NOT NULL,
    reason TEXT NOT NULL,
    
    -- Requirements
    requires_user_consent BOOLEAN DEFAULT FALSE,
    requires_admin_approval BOOLEAN DEFAULT FALSE,
    compliance_checks_required BOOLEAN DEFAULT FALSE,
    
    -- Warnings and recommendations
    warnings JSONB DEFAULT '[]',
    recommendations JSONB DEFAULT '[]',
    
    -- Audit information
    evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    evaluated_by VARCHAR(255) NOT NULL,
    
    -- Related policies and configurations
    related_retention_policies JSONB DEFAULT '[]',
    applied_compliance_rules JSONB DEFAULT '[]',
    
    -- Request tracking
    request_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Archive Operations Log Table
-- Links archive operations with toggle evaluations for complete audit trail
CREATE TABLE IF NOT EXISTS archive_operations_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    archive_id VARCHAR(255) NOT NULL, -- References archives table
    evaluation_id VARCHAR(255) REFERENCES archive_toggle_evaluations(evaluation_id),
    config_id UUID REFERENCES archive_toggle_configs(id),
    
    -- Operation details
    operation_type VARCHAR(100) NOT NULL CHECK (operation_type IN (
        'create_archive', 'restore_archive', 'delete_archive', 'validate_archive'
    )),
    operation_status VARCHAR(50) NOT NULL CHECK (operation_status IN (
        'approved', 'rejected', 'pending', 'completed', 'failed'
    )),
    
    -- Context
    requested_by VARCHAR(255) NOT NULL,
    approved_by VARCHAR(255),
    rejection_reason TEXT,
    
    -- Timestamps
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Compliance tracking
    compliance_verified BOOLEAN DEFAULT FALSE,
    consent_verified BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    operation_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient querying

-- Archive Toggle Configs indexes
CREATE INDEX IF NOT EXISTS idx_archive_toggle_configs_scope ON archive_toggle_configs(scope);
CREATE INDEX IF NOT EXISTS idx_archive_toggle_configs_mode ON archive_toggle_configs(mode);
CREATE INDEX IF NOT EXISTS idx_archive_toggle_configs_compliance ON archive_toggle_configs(compliance_required, gdpr_compliant, hipaa_compliant, sox_compliant);
CREATE INDEX IF NOT EXISTS idx_archive_toggle_configs_created_by ON archive_toggle_configs(created_by);
CREATE INDEX IF NOT EXISTS idx_archive_toggle_configs_updated_at ON archive_toggle_configs(updated_at DESC);

-- Archive Toggle States indexes
CREATE INDEX IF NOT EXISTS idx_archive_toggle_states_config_id ON archive_toggle_states(config_id);
CREATE INDEX IF NOT EXISTS idx_archive_toggle_states_org_id ON archive_toggle_states(org_id) WHERE org_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_archive_toggle_states_user_id ON archive_toggle_states(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_archive_toggle_states_enabled ON archive_toggle_states(is_enabled);
CREATE INDEX IF NOT EXISTS idx_archive_toggle_states_overridden ON archive_toggle_states(is_overridden) WHERE is_overridden = true;
CREATE INDEX IF NOT EXISTS idx_archive_toggle_states_compliance ON archive_toggle_states(compliance_status);
CREATE INDEX IF NOT EXISTS idx_archive_toggle_states_updated_at ON archive_toggle_states(updated_at DESC);

-- Archive Toggle Audit Trail indexes
CREATE INDEX IF NOT EXISTS idx_archive_toggle_audit_config_id ON archive_toggle_audit_trail(config_id);
CREATE INDEX IF NOT EXISTS idx_archive_toggle_audit_timestamp ON archive_toggle_audit_trail(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_archive_toggle_audit_action ON archive_toggle_audit_trail(action);
CREATE INDEX IF NOT EXISTS idx_archive_toggle_audit_actor_id ON archive_toggle_audit_trail(actor_id);
CREATE INDEX IF NOT EXISTS idx_archive_toggle_audit_emergency ON archive_toggle_audit_trail(is_emergency) WHERE is_emergency = true;
CREATE INDEX IF NOT EXISTS idx_archive_toggle_audit_composite ON archive_toggle_audit_trail(config_id, timestamp DESC, action);

-- Archive Toggle Evaluations indexes
CREATE INDEX IF NOT EXISTS idx_archive_toggle_evaluations_evaluation_id ON archive_toggle_evaluations(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_archive_toggle_evaluations_config_id ON archive_toggle_evaluations(config_id);
CREATE INDEX IF NOT EXISTS idx_archive_toggle_evaluations_user_id ON archive_toggle_evaluations(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_archive_toggle_evaluations_org_id ON archive_toggle_evaluations(org_id) WHERE org_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_archive_toggle_evaluations_archive_type ON archive_toggle_evaluations(archive_type);
CREATE INDEX IF NOT EXISTS idx_archive_toggle_evaluations_category ON archive_toggle_evaluations(category);
CREATE INDEX IF NOT EXISTS idx_archive_toggle_evaluations_allowed ON archive_toggle_evaluations(is_archiving_allowed);
CREATE INDEX IF NOT EXISTS idx_archive_toggle_evaluations_evaluated_at ON archive_toggle_evaluations(evaluated_at DESC);
CREATE INDEX IF NOT EXISTS idx_archive_toggle_evaluations_triggered_by ON archive_toggle_evaluations(triggered_by);
CREATE INDEX IF NOT EXISTS idx_archive_toggle_evaluations_emergency ON archive_toggle_evaluations(is_emergency) WHERE is_emergency = true;

-- Archive Operations Log indexes
CREATE INDEX IF NOT EXISTS idx_archive_operations_log_archive_id ON archive_operations_log(archive_id);
CREATE INDEX IF NOT EXISTS idx_archive_operations_log_evaluation_id ON archive_operations_log(evaluation_id) WHERE evaluation_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_archive_operations_log_config_id ON archive_operations_log(config_id) WHERE config_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_archive_operations_log_operation_type ON archive_operations_log(operation_type);
CREATE INDEX IF NOT EXISTS idx_archive_operations_log_operation_status ON archive_operations_log(operation_status);
CREATE INDEX IF NOT EXISTS idx_archive_operations_log_requested_by ON archive_operations_log(requested_by);
CREATE INDEX IF NOT EXISTS idx_archive_operations_log_requested_at ON archive_operations_log(requested_at DESC);

-- Create triggers for automatic timestamp updates

-- Update timestamp trigger for archive_toggle_configs
CREATE OR REPLACE FUNCTION update_archive_toggle_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.version = OLD.version + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_archive_toggle_configs_updated_at
    BEFORE UPDATE ON archive_toggle_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_archive_toggle_configs_updated_at();

-- Update timestamp trigger for archive_toggle_states
CREATE OR REPLACE FUNCTION update_archive_toggle_states_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_archive_toggle_states_updated_at
    BEFORE UPDATE ON archive_toggle_states
    FOR EACH ROW
    EXECUTE FUNCTION update_archive_toggle_states_updated_at();

-- Create views for common queries

-- Active Archive Toggles View
CREATE OR REPLACE VIEW active_archive_toggles AS
SELECT 
    c.id,
    c.name,
    c.description,
    c.scope,
    c.mode,
    s.is_enabled,
    s.current_mode,
    s.is_overridden,
    s.archive_operations_count,
    s.failed_archive_operations,
    s.compliance_status,
    c.compliance_required,
    c.gdpr_compliant,
    c.hipaa_compliant,
    c.sox_compliant,
    c.created_at,
    c.updated_at,
    s.last_toggle_time,
    s.override_expires_at
FROM archive_toggle_configs c
LEFT JOIN archive_toggle_states s ON c.id = s.config_id
WHERE s.is_enabled = true OR s.is_overridden = true;

-- Archive Toggle Compliance Summary View
CREATE OR REPLACE VIEW archive_toggle_compliance_summary AS
SELECT 
    c.id,
    c.name,
    c.scope,
    s.compliance_status,
    c.compliance_required,
    c.gdpr_compliant,
    c.hipaa_compliant,
    c.sox_compliant,
    s.has_user_consent,
    s.last_consent_check,
    s.archive_operations_count,
    s.failed_archive_operations,
    CASE 
        WHEN s.archive_operations_count > 0 
        THEN ROUND((s.archive_operations_count - s.failed_archive_operations)::numeric / s.archive_operations_count * 100, 2)
        ELSE 0 
    END as success_rate_percent,
    COUNT(at.id) as audit_entries_count,
    MAX(at.timestamp) as last_audit_entry
FROM archive_toggle_configs c
LEFT JOIN archive_toggle_states s ON c.id = s.config_id
LEFT JOIN archive_toggle_audit_trail at ON c.id = at.config_id
GROUP BY c.id, c.name, c.scope, s.compliance_status, c.compliance_required,
         c.gdpr_compliant, c.hipaa_compliant, c.sox_compliant,
         s.has_user_consent, s.last_consent_check,
         s.archive_operations_count, s.failed_archive_operations;

-- Archive Toggle Usage Statistics View
CREATE OR REPLACE VIEW archive_toggle_usage_stats AS
SELECT 
    c.id,
    c.name,
    c.scope,
    c.mode,
    s.is_enabled,
    s.archive_operations_count,
    s.failed_archive_operations,
    COUNT(e.id) as total_evaluations,
    COUNT(CASE WHEN e.is_archiving_allowed = true THEN 1 END) as approved_evaluations,
    COUNT(CASE WHEN e.is_archiving_allowed = false THEN 1 END) as rejected_evaluations,
    COUNT(CASE WHEN e.is_emergency = true THEN 1 END) as emergency_evaluations,
    MAX(e.evaluated_at) as last_evaluation,
    MAX(s.last_archive_operation) as last_archive_operation
FROM archive_toggle_configs c
LEFT JOIN archive_toggle_states s ON c.id = s.config_id
LEFT JOIN archive_toggle_evaluations e ON c.id = e.config_id
GROUP BY c.id, c.name, c.scope, c.mode, s.is_enabled,
         s.archive_operations_count, s.failed_archive_operations;

-- Add comments for documentation
COMMENT ON TABLE archive_toggle_configs IS 'Archive toggle configuration settings for Epic 19 Data Protection & Privacy Controls';
COMMENT ON TABLE archive_toggle_states IS 'Runtime state tracking for archive toggles';
COMMENT ON TABLE archive_toggle_audit_trail IS 'Comprehensive audit trail for all archive toggle operations';
COMMENT ON TABLE archive_toggle_evaluations IS 'Archive toggle evaluation results for compliance and analytics';
COMMENT ON TABLE archive_operations_log IS 'Links archive operations with toggle evaluations for complete audit trail';

COMMENT ON VIEW active_archive_toggles IS 'Currently enabled or overridden archive toggles';
COMMENT ON VIEW archive_toggle_compliance_summary IS 'Compliance status and metrics for archive toggles';
COMMENT ON VIEW archive_toggle_usage_stats IS 'Usage statistics and evaluation metrics for archive toggles';

-- Insert default system configurations
INSERT INTO archive_toggle_configs 
(name, description, scope, mode, enabled_by_default, compliance_required, gdpr_compliant, created_by, last_modified_by)
VALUES
('System Default Archive Toggle', 'Default system-wide archive toggle for fallback behavior', 'global', 'manual_only', false, false, false, 'system', 'system'),
('GDPR User Data Archive Toggle', 'GDPR compliant user data archiving toggle', 'user_data', 'manual_only', false, true, true, 'system', 'system'),
('System Logs Archive Toggle', 'Automated system logs archiving toggle', 'log_data', 'automatic', true, true, false, 'system', 'system'),
('Compliance Data Archive Toggle', 'Compliance required data archiving toggle', 'compliance_data', 'scheduled', true, true, true, 'system', 'system')
ON CONFLICT (name) DO NOTHING;

-- Initialize default states for system configurations
INSERT INTO archive_toggle_states (config_id, is_enabled, current_mode, compliance_status)
SELECT 
    id, 
    enabled_by_default, 
    mode,
    CASE WHEN compliance_required THEN 'pending_review' ELSE 'compliant' END
FROM archive_toggle_configs
WHERE created_by = 'system'
ON CONFLICT (config_id, org_id, user_id) DO NOTHING;