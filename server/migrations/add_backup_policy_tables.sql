-- Migration: Add Backup Policy Tables
-- Epic 19 - Security & Compliance Framework - Backup Policy Model
-- Task: E17-1753114397265-49E36B

-- Backup policies table - defines backup governance and rules
CREATE TABLE IF NOT EXISTS backup_policies (
    policy_id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(500) NOT NULL UNIQUE,
    description TEXT,
    policy_type VARCHAR(20) NOT NULL CHECK (policy_type IN ('standard', 'compliance', 'custom')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('draft', 'active', 'suspended', 'expired', 'archived')) DEFAULT 'draft',
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    
    -- Scope definition
    scope JSONB NOT NULL DEFAULT '{
        "scope_type": "global",
        "target_databases": [],
        "target_schemas": [],
        "target_tables": [],
        "data_classifications": [],
        "user_types": [],
        "business_units": [],
        "inclusion_patterns": [],
        "exclusion_patterns": []
    }'::jsonb,
    
    -- Schedule configuration
    schedule JSONB NOT NULL DEFAULT '{
        "frequency": "daily",
        "backup_types": ["full"],
        "start_time": "02:00",
        "timezone": "UTC",
        "cron_expression": null,
        "max_parallel_backups": 1,
        "backup_window_hours": 4
    }'::jsonb,
    
    -- Retention configuration
    retention JSONB NOT NULL DEFAULT '{
        "full_backup_retention": {"value": 30, "unit": "days"},
        "incremental_backup_retention": {"value": 7, "unit": "days"},
        "log_backup_retention": {"value": 3, "unit": "days"},
        "archive_after": {"value": 90, "unit": "days"},
        "legal_hold_retention": null,
        "minimum_recovery_points": 3,
        "maximum_recovery_points": 30
    }'::jsonb,
    
    -- Storage configuration
    storage JSONB NOT NULL DEFAULT '{
        "primary_storage_type": "local",
        "storage_locations": ["/backups"],
        "replication_factor": 1,
        "encryption_required": true,
        "compression_enabled": true,
        "deduplication_enabled": false,
        "geographic_distribution": []
    }'::jsonb,
    
    -- Performance configuration
    performance JSONB NOT NULL DEFAULT '{
        "max_backup_size_gb": null,
        "max_backup_duration_hours": null,
        "bandwidth_limit_mbps": null,
        "cpu_limit_percentage": null,
        "memory_limit_mb": null,
        "io_priority": "medium"
    }'::jsonb,
    
    -- Compliance configuration
    compliance JSONB NOT NULL DEFAULT '{
        "frameworks": [],
        "audit_logging_required": true,
        "access_logging_required": true,
        "encryption_standards": [],
        "data_residency_requirements": [],
        "retention_justification": "Business continuity requirement",
        "deletion_requirements": {
            "secure_deletion_required": false,
            "deletion_verification_required": false,
            "certificate_retention_required": false
        }
    }'::jsonb,
    
    -- Quality assurance configuration
    quality_assurance JSONB NOT NULL DEFAULT '{
        "validation_required": true,
        "integrity_check_frequency": "weekly",
        "restore_testing_frequency": "monthly",
        "success_rate_threshold": 95,
        "alert_on_failure": true,
        "escalation_threshold": 3
    }'::jsonb,
    
    -- Policy metadata
    effective_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expiration_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255) NOT NULL,
    updated_by VARCHAR(255) NOT NULL,
    version VARCHAR(20) DEFAULT '1.0.0',
    approval_required BOOLEAN DEFAULT FALSE,
    approved_by VARCHAR(255),
    approved_at TIMESTAMP WITH TIME ZONE
);

-- Backup policy rules - conditional logic for policy execution
CREATE TABLE IF NOT EXISTS backup_policy_rules (
    rule_id VARCHAR(255) PRIMARY KEY,
    policy_id VARCHAR(255) NOT NULL REFERENCES backup_policies(policy_id) ON DELETE CASCADE,
    name VARCHAR(500) NOT NULL,
    description TEXT,
    rule_type VARCHAR(20) NOT NULL CHECK (rule_type IN ('trigger', 'condition', 'action', 'exception')),
    
    -- Rule condition
    condition JSONB NOT NULL DEFAULT '{
        "field": "",
        "operator": "eq",
        "value": null,
        "data_type": "string"
    }'::jsonb,
    
    -- Rule action
    action JSONB NOT NULL DEFAULT '{
        "action_type": "backup",
        "parameters": {},
        "priority_override": null
    }'::jsonb,
    
    -- Rule metadata
    is_active BOOLEAN DEFAULT TRUE,
    execution_order INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255) NOT NULL
);

-- Backup policy executions - tracks policy execution instances
CREATE TABLE IF NOT EXISTS backup_policy_executions (
    execution_id VARCHAR(255) PRIMARY KEY,
    policy_id VARCHAR(255) NOT NULL REFERENCES backup_policies(policy_id) ON DELETE CASCADE,
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    trigger_type VARCHAR(20) NOT NULL CHECK (trigger_type IN ('scheduled', 'manual', 'event', 'rule')),
    trigger_details JSONB DEFAULT '{}'::jsonb,
    
    -- Execution status
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')) DEFAULT 'pending',
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    
    -- Execution results
    backups_created INTEGER DEFAULT 0,
    backups_failed INTEGER DEFAULT 0,
    total_size_gb DECIMAL(12,2) DEFAULT 0,
    affected_entities JSONB DEFAULT '[]'::jsonb,
    
    -- Execution metadata
    executed_by VARCHAR(255) NOT NULL
);

-- Backup policy execution errors - detailed error tracking
CREATE TABLE IF NOT EXISTS backup_policy_execution_errors (
    error_id VARCHAR(255) PRIMARY KEY,
    execution_id VARCHAR(255) NOT NULL REFERENCES backup_policy_executions(execution_id) ON DELETE CASCADE,
    error_type VARCHAR(20) NOT NULL CHECK (error_type IN ('configuration', 'resource', 'permission', 'storage', 'network')),
    error_message TEXT NOT NULL,
    error_context JSONB DEFAULT '{}'::jsonb,
    is_recoverable BOOLEAN DEFAULT TRUE,
    suggested_action TEXT,
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Backup policy execution warnings - non-critical issues
CREATE TABLE IF NOT EXISTS backup_policy_execution_warnings (
    warning_id VARCHAR(255) PRIMARY KEY,
    execution_id VARCHAR(255) NOT NULL REFERENCES backup_policy_executions(execution_id) ON DELETE CASCADE,
    warning_type VARCHAR(20) NOT NULL CHECK (warning_type IN ('performance', 'capacity', 'compliance', 'quality')),
    warning_message TEXT NOT NULL,
    warning_context JSONB DEFAULT '{}'::jsonb,
    impact_level VARCHAR(10) NOT NULL CHECK (impact_level IN ('low', 'medium', 'high')),
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Policy analytics cache - pre-calculated analytics for performance
CREATE TABLE IF NOT EXISTS backup_policy_analytics (
    analytics_id VARCHAR(255) PRIMARY KEY,
    policy_id VARCHAR(255) NOT NULL REFERENCES backup_policies(policy_id) ON DELETE CASCADE,
    analysis_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    analysis_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Execution metrics
    total_executions INTEGER DEFAULT 0,
    successful_executions INTEGER DEFAULT 0,
    failed_executions INTEGER DEFAULT 0,
    average_execution_time INTEGER DEFAULT 0,
    success_rate_percentage DECIMAL(5,2) DEFAULT 0,
    
    -- Backup metrics
    total_backups_created INTEGER DEFAULT 0,
    total_backup_size_gb DECIMAL(15,2) DEFAULT 0,
    average_backup_size_gb DECIMAL(12,2) DEFAULT 0,
    compression_ratio_average DECIMAL(5,2) DEFAULT 1.0,
    deduplication_savings_percentage DECIMAL(5,2) DEFAULT 0,
    
    -- Performance metrics
    backup_throughput_gbps DECIMAL(8,3) DEFAULT 0,
    resource_utilization_average JSONB DEFAULT '{
        "cpu_percentage": 0,
        "memory_percentage": 0,
        "storage_percentage": 0,
        "network_percentage": 0
    }'::jsonb,
    
    -- Compliance metrics
    sla_compliance_rate DECIMAL(5,2) DEFAULT 100,
    retention_compliance_rate DECIMAL(5,2) DEFAULT 100,
    audit_completeness_percentage DECIMAL(5,2) DEFAULT 100,
    
    -- Quality metrics
    validation_success_rate DECIMAL(5,2) DEFAULT 100,
    restore_test_success_rate DECIMAL(5,2) DEFAULT 100,
    data_integrity_score DECIMAL(5,2) DEFAULT 100,
    
    -- Cost metrics
    estimated_storage_cost DECIMAL(10,2) DEFAULT 0,
    cost_per_gb DECIMAL(8,4) DEFAULT 0,
    cost_trend VARCHAR(20) DEFAULT 'stable',
    
    -- Recommendations
    optimization_recommendations JSONB DEFAULT '[]'::jsonb,
    
    -- Cache metadata
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    calculated_by VARCHAR(255) DEFAULT 'system'
);

-- Policy compliance tracking - tracks compliance with various frameworks
CREATE TABLE IF NOT EXISTS backup_policy_compliance_tracking (
    tracking_id VARCHAR(255) PRIMARY KEY,
    policy_id VARCHAR(255) NOT NULL REFERENCES backup_policies(policy_id) ON DELETE CASCADE,
    compliance_framework VARCHAR(20) NOT NULL CHECK (compliance_framework IN ('gdpr', 'hipaa', 'sox', 'pci_dss', 'iso27001', 'custom')),
    
    -- Compliance status
    compliance_status VARCHAR(20) NOT NULL CHECK (compliance_status IN ('compliant', 'non_compliant', 'partial', 'under_review')),
    last_assessment_date TIMESTAMP WITH TIME ZONE,
    next_assessment_due TIMESTAMP WITH TIME ZONE,
    compliance_score INTEGER CHECK (compliance_score BETWEEN 0 AND 100),
    
    -- Assessment details
    requirements_met INTEGER DEFAULT 0,
    total_requirements INTEGER DEFAULT 0,
    critical_gaps JSONB DEFAULT '[]'::jsonb,
    remediation_actions JSONB DEFAULT '[]'::jsonb,
    
    -- Compliance evidence
    evidence_artifacts JSONB DEFAULT '[]'::jsonb,
    audit_trail_complete BOOLEAN DEFAULT FALSE,
    documentation_complete BOOLEAN DEFAULT FALSE,
    
    -- Assessment metadata
    assessed_by VARCHAR(255),
    assessment_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Policy version history - tracks policy changes over time
CREATE TABLE IF NOT EXISTS backup_policy_version_history (
    version_id VARCHAR(255) PRIMARY KEY,
    policy_id VARCHAR(255) NOT NULL REFERENCES backup_policies(policy_id) ON DELETE CASCADE,
    version VARCHAR(20) NOT NULL,
    change_type VARCHAR(20) NOT NULL CHECK (change_type IN ('created', 'updated', 'activated', 'suspended', 'archived')),
    
    -- Change details
    changes_summary TEXT,
    changed_fields JSONB DEFAULT '[]'::jsonb,
    previous_version VARCHAR(20),
    
    -- Policy snapshot at this version
    policy_snapshot JSONB NOT NULL,
    
    -- Change metadata
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    changed_by VARCHAR(255) NOT NULL,
    change_reason TEXT,
    approval_required BOOLEAN DEFAULT FALSE,
    approved_by VARCHAR(255),
    approved_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for optimal query performance
CREATE INDEX IF NOT EXISTS idx_backup_policies_status ON backup_policies(status);
CREATE INDEX IF NOT EXISTS idx_backup_policies_priority ON backup_policies(priority);
CREATE INDEX IF NOT EXISTS idx_backup_policies_type ON backup_policies(policy_type);
CREATE INDEX IF NOT EXISTS idx_backup_policies_effective_date ON backup_policies(effective_date);
CREATE INDEX IF NOT EXISTS idx_backup_policies_created_by ON backup_policies(created_by);
CREATE INDEX IF NOT EXISTS idx_backup_policies_scope_type ON backup_policies USING GIN((scope->>'scope_type'));

CREATE INDEX IF NOT EXISTS idx_policy_rules_policy_id ON backup_policy_rules(policy_id);
CREATE INDEX IF NOT EXISTS idx_policy_rules_active ON backup_policy_rules(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_policy_rules_execution_order ON backup_policy_rules(policy_id, execution_order);

CREATE INDEX IF NOT EXISTS idx_policy_executions_policy_id ON backup_policy_executions(policy_id);
CREATE INDEX IF NOT EXISTS idx_policy_executions_status ON backup_policy_executions(status);
CREATE INDEX IF NOT EXISTS idx_policy_executions_triggered_at ON backup_policy_executions(triggered_at);
CREATE INDEX IF NOT EXISTS idx_policy_executions_executed_by ON backup_policy_executions(executed_by);

CREATE INDEX IF NOT EXISTS idx_policy_errors_execution_id ON backup_policy_execution_errors(execution_id);
CREATE INDEX IF NOT EXISTS idx_policy_errors_type ON backup_policy_execution_errors(error_type);
CREATE INDEX IF NOT EXISTS idx_policy_errors_occurred_at ON backup_policy_execution_errors(occurred_at);

CREATE INDEX IF NOT EXISTS idx_policy_warnings_execution_id ON backup_policy_execution_warnings(execution_id);
CREATE INDEX IF NOT EXISTS idx_policy_warnings_type ON backup_policy_execution_warnings(warning_type);
CREATE INDEX IF NOT EXISTS idx_policy_warnings_impact ON backup_policy_execution_warnings(impact_level);

CREATE INDEX IF NOT EXISTS idx_policy_analytics_policy_id ON backup_policy_analytics(policy_id);
CREATE INDEX IF NOT EXISTS idx_policy_analytics_period ON backup_policy_analytics(analysis_period_start, analysis_period_end);
CREATE INDEX IF NOT EXISTS idx_policy_analytics_expires ON backup_policy_analytics(expires_at);

CREATE INDEX IF NOT EXISTS idx_compliance_tracking_policy_id ON backup_policy_compliance_tracking(policy_id);
CREATE INDEX IF NOT EXISTS idx_compliance_tracking_framework ON backup_policy_compliance_tracking(compliance_framework);
CREATE INDEX IF NOT EXISTS idx_compliance_tracking_status ON backup_policy_compliance_tracking(compliance_status);
CREATE INDEX IF NOT EXISTS idx_compliance_tracking_assessment_due ON backup_policy_compliance_tracking(next_assessment_due);

CREATE INDEX IF NOT EXISTS idx_policy_version_policy_id ON backup_policy_version_history(policy_id);
CREATE INDEX IF NOT EXISTS idx_policy_version_changed_at ON backup_policy_version_history(changed_at);
CREATE INDEX IF NOT EXISTS idx_policy_version_changed_by ON backup_policy_version_history(changed_by);

-- Triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_backup_policy_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_backup_policies_updated_at 
    BEFORE UPDATE ON backup_policies 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_backup_policy_updated_at_column();

CREATE TRIGGER update_compliance_tracking_updated_at 
    BEFORE UPDATE ON backup_policy_compliance_tracking 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_backup_policy_updated_at_column();

-- Trigger to update execution timing
CREATE OR REPLACE FUNCTION update_backup_policy_execution_timing()
RETURNS TRIGGER AS $$
BEGIN
    -- Set started_at when moving from pending to running
    IF OLD.status = 'pending' AND NEW.status = 'running' THEN
        NEW.started_at = NOW();
    END IF;
    
    -- Set completed_at and calculate duration when reaching terminal status
    IF OLD.status NOT IN ('completed', 'failed', 'cancelled') 
       AND NEW.status IN ('completed', 'failed', 'cancelled') THEN
        NEW.completed_at = NOW();
        IF NEW.started_at IS NOT NULL THEN
            NEW.duration_seconds = EXTRACT(EPOCH FROM (NOW() - NEW.started_at));
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_backup_policy_execution_timing_trigger
    BEFORE UPDATE ON backup_policy_executions
    FOR EACH ROW
    EXECUTE PROCEDURE update_backup_policy_execution_timing();

-- Trigger to create version history on policy changes
CREATE OR REPLACE FUNCTION create_backup_policy_version_history()
RETURNS TRIGGER AS $$
DECLARE
    change_type_val VARCHAR(20);
    version_id_val VARCHAR(255);
BEGIN
    -- Determine change type
    IF TG_OP = 'INSERT' THEN
        change_type_val = 'created';
    ELSIF OLD.status != NEW.status THEN
        CASE NEW.status
            WHEN 'active' THEN change_type_val = 'activated';
            WHEN 'suspended' THEN change_type_val = 'suspended';
            WHEN 'archived' THEN change_type_val = 'archived';
            ELSE change_type_val = 'updated';
        END CASE;
    ELSE
        change_type_val = 'updated';
    END IF;
    
    version_id_val = 'ver-' || NEW.policy_id || '-' || extract(epoch from now());
    
    -- Insert version history record
    INSERT INTO backup_policy_version_history (
        version_id, policy_id, version, change_type, changes_summary,
        previous_version, policy_snapshot, changed_by, change_reason
    ) VALUES (
        version_id_val,
        NEW.policy_id,
        NEW.version,
        change_type_val,
        CASE 
            WHEN TG_OP = 'INSERT' THEN 'Policy created'
            WHEN OLD.status != NEW.status THEN 'Status changed from ' || OLD.status || ' to ' || NEW.status
            ELSE 'Policy configuration updated'
        END,
        CASE WHEN TG_OP = 'UPDATE' THEN OLD.version ELSE NULL END,
        row_to_json(NEW),
        NEW.updated_by,
        'Automatic version tracking'
    );
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER create_backup_policy_version_history_trigger
    AFTER INSERT OR UPDATE ON backup_policies
    FOR EACH ROW
    EXECUTE PROCEDURE create_backup_policy_version_history();

-- Views for common queries and dashboards
CREATE OR REPLACE VIEW active_backup_policies AS
SELECT 
    bp.*,
    COUNT(bpe.execution_id) as total_executions,
    COUNT(bpe.execution_id) FILTER (WHERE bpe.status = 'completed') as successful_executions,
    COUNT(bpe.execution_id) FILTER (WHERE bpe.status = 'failed') as failed_executions,
    MAX(bpe.triggered_at) as last_execution,
    CASE 
        WHEN bp.expiration_date IS NOT NULL AND bp.expiration_date < NOW() THEN 'expired'
        WHEN bp.status = 'active' THEN 'active'
        ELSE bp.status
    END as computed_status
FROM backup_policies bp
LEFT JOIN backup_policy_executions bpe ON bp.policy_id = bpe.policy_id
    AND bpe.triggered_at >= NOW() - INTERVAL '30 days'
WHERE bp.status IN ('active', 'draft')
GROUP BY bp.policy_id, bp.name, bp.description, bp.policy_type, bp.status, bp.priority,
         bp.scope, bp.schedule, bp.retention, bp.storage, bp.performance, bp.compliance,
         bp.quality_assurance, bp.effective_date, bp.expiration_date, bp.created_at,
         bp.updated_at, bp.created_by, bp.updated_by, bp.version, bp.approval_required,
         bp.approved_by, bp.approved_at;

CREATE OR REPLACE VIEW backup_policy_execution_summary AS
SELECT 
    DATE_TRUNC('day', bpe.triggered_at) as execution_date,
    bp.policy_id,
    bp.name as policy_name,
    bp.priority,
    COUNT(*) as total_executions,
    COUNT(*) FILTER (WHERE bpe.status = 'completed') as successful_executions,
    COUNT(*) FILTER (WHERE bpe.status = 'failed') as failed_executions,
    AVG(bpe.duration_seconds) as avg_duration_seconds,
    SUM(bpe.backups_created) as total_backups_created,
    SUM(bpe.total_size_gb) as total_size_gb,
    CASE 
        WHEN COUNT(*) > 0 THEN (COUNT(*) FILTER (WHERE bpe.status = 'completed')::DECIMAL / COUNT(*)) * 100
        ELSE 0
    END as success_rate_percentage
FROM backup_policy_executions bpe
JOIN backup_policies bp ON bpe.policy_id = bp.policy_id
WHERE bpe.triggered_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', bpe.triggered_at), bp.policy_id, bp.name, bp.priority
ORDER BY execution_date DESC, bp.priority DESC;

CREATE OR REPLACE VIEW policy_compliance_dashboard AS
SELECT 
    bp.policy_id,
    bp.name as policy_name,
    bp.policy_type,
    bp.status,
    bp.compliance->>'frameworks' as compliance_frameworks,
    COUNT(bpct.tracking_id) as total_compliance_checks,
    COUNT(bpct.tracking_id) FILTER (WHERE bpct.compliance_status = 'compliant') as compliant_checks,
    COUNT(bpct.tracking_id) FILTER (WHERE bpct.compliance_status = 'non_compliant') as non_compliant_checks,
    AVG(bpct.compliance_score) as avg_compliance_score,
    MIN(bpct.next_assessment_due) as next_assessment_due,
    CASE 
        WHEN COUNT(bpct.tracking_id) FILTER (WHERE bpct.compliance_status = 'non_compliant') > 0 THEN 'action_required'
        WHEN COUNT(bpct.tracking_id) FILTER (WHERE bpct.next_assessment_due < NOW() + INTERVAL '7 days') > 0 THEN 'assessment_due'
        ELSE 'compliant'
    END as overall_compliance_status
FROM backup_policies bp
LEFT JOIN backup_policy_compliance_tracking bpct ON bp.policy_id = bpct.policy_id
WHERE bp.status = 'active'
GROUP BY bp.policy_id, bp.name, bp.policy_type, bp.status, bp.compliance
ORDER BY overall_compliance_status DESC, bp.priority DESC;

-- Insert default backup policies
INSERT INTO backup_policies (
    policy_id, name, description, policy_type, status, priority,
    scope, schedule, retention, compliance, created_by, updated_by
) VALUES (
    'default-daily-backup',
    'Default Daily Backup Policy',
    'Standard daily backup policy for general database protection',
    'standard',
    'active',
    'medium',
    '{"scope_type": "global", "target_databases": ["*"]}'::jsonb,
    '{"frequency": "daily", "backup_types": ["full"], "start_time": "02:00", "timezone": "UTC"}'::jsonb,
    '{"full_backup_retention": {"value": 30, "unit": "days"}, "minimum_recovery_points": 3, "maximum_recovery_points": 30}'::jsonb,
    '{"frameworks": [], "audit_logging_required": true, "retention_justification": "Standard business continuity requirement"}'::jsonb,
    'system',
    'system'
) ON CONFLICT (name) DO NOTHING;

INSERT INTO backup_policies (
    policy_id, name, description, policy_type, status, priority,
    scope, schedule, retention, compliance, created_by, updated_by
) VALUES (
    'compliance-gdpr-backup',
    'GDPR Compliance Backup Policy',
    'Backup policy tailored for GDPR compliance requirements',
    'compliance',
    'active',
    'high',
    '{"scope_type": "data_classification", "data_classifications": ["personal_data", "sensitive_data"]}'::jsonb,
    '{"frequency": "daily", "backup_types": ["full", "incremental"], "start_time": "01:00", "timezone": "UTC"}'::jsonb,
    '{"full_backup_retention": {"value": 6, "unit": "years"}, "legal_hold_retention": {"value": 7, "unit": "years"}, "minimum_recovery_points": 5, "maximum_recovery_points": 50}'::jsonb,
    '{"frameworks": ["gdpr"], "audit_logging_required": true, "encryption_standards": ["AES-256"], "retention_justification": "GDPR Article 5 data retention requirements"}'::jsonb,
    'system',
    'system'
) ON CONFLICT (name) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE backup_policies IS 'Defines backup governance rules and automated backup policies';
COMMENT ON TABLE backup_policy_rules IS 'Conditional logic rules for dynamic policy execution';
COMMENT ON TABLE backup_policy_executions IS 'Tracks instances of policy execution with results';
COMMENT ON TABLE backup_policy_execution_errors IS 'Detailed error tracking for policy execution troubleshooting';
COMMENT ON TABLE backup_policy_execution_warnings IS 'Non-critical issues and optimization suggestions';
COMMENT ON TABLE backup_policy_analytics IS 'Pre-calculated analytics for policy performance monitoring';
COMMENT ON TABLE backup_policy_compliance_tracking IS 'Tracks compliance status with various regulatory frameworks';
COMMENT ON TABLE backup_policy_version_history IS 'Complete audit trail of policy changes over time';

COMMENT ON VIEW active_backup_policies IS 'Currently active backup policies with execution statistics';
COMMENT ON VIEW backup_policy_execution_summary IS 'Daily summary of backup policy execution performance';
COMMENT ON VIEW policy_compliance_dashboard IS 'Compliance status dashboard for all active policies';