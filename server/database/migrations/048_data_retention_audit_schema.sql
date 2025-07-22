-- Data Retention Audit Schema Migration
-- Task: E17-1753114396831-B13C0D - Create audit schema
-- Epic: 19 - Security & Compliance Framework
-- Purpose: Comprehensive audit logging for data retention, deletion, and privacy operations

-- Data Retention Operations Audit Table
CREATE TABLE IF NOT EXISTS data_retention_audit (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    operation_id UUID NOT NULL DEFAULT uuid_generate_v4(),
    correlation_id UUID,
    
    -- Operation details
    operation_type VARCHAR(50) NOT NULL CHECK (operation_type IN (
        'POLICY_EXECUTION', 'DATA_DELETION', 'DATA_ARCHIVAL', 'DATA_EXPORT', 
        'RETENTION_HOLD', 'POLICY_CREATE', 'POLICY_UPDATE', 'POLICY_DELETE',
        'CONSENT_WITHDRAWAL', 'RIGHT_TO_ERASURE', 'DATA_PORTABILITY',
        'RETENTION_REVIEW', 'COMPLIANCE_SCAN', 'AUDIT_EXPORT'
    )),
    operation_status VARCHAR(20) NOT NULL CHECK (operation_status IN (
        'INITIATED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED', 'PARTIALLY_COMPLETED'
    )),
    
    -- Subject information (who initiated/is affected)
    initiated_by_user_id UUID REFERENCES users(id),
    initiated_by_system_component VARCHAR(100),
    affected_user_id UUID REFERENCES users(id),
    affected_data_subject_id VARCHAR(255), -- for cases where user may be deleted
    
    -- Target data information
    target_data_type VARCHAR(100) NOT NULL,
    target_table_name VARCHAR(100),
    target_record_ids JSONB DEFAULT '[]'::jsonb,
    target_data_classification VARCHAR(50),
    target_data_sensitivity VARCHAR(20) CHECK (target_data_sensitivity IN ('PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED')),
    
    -- Policy information
    retention_policy_id UUID REFERENCES data_retention_policies(id),
    retention_policy_name VARCHAR(255),
    retention_period_days INTEGER,
    deletion_method VARCHAR(20) CHECK (deletion_method IN ('soft', 'hard', 'archive', 'anonymize')),
    
    -- Legal and compliance context
    legal_basis VARCHAR(100), -- GDPR legal basis, etc.
    compliance_framework VARCHAR(50), -- GDPR, CCPA, HIPAA, etc.
    is_subject_request BOOLEAN DEFAULT FALSE,
    request_reference VARCHAR(100),
    legal_hold_applied BOOLEAN DEFAULT FALSE,
    data_processing_purpose JSONB DEFAULT '[]'::jsonb,
    
    -- Execution details
    records_processed INTEGER DEFAULT 0,
    records_deleted INTEGER DEFAULT 0,
    records_archived INTEGER DEFAULT 0,
    records_anonymized INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    data_volume_bytes BIGINT,
    execution_duration_ms INTEGER,
    
    -- Results and validation
    validation_checks_passed JSONB DEFAULT '[]'::jsonb,
    validation_checks_failed JSONB DEFAULT '[]'::jsonb,
    integrity_hash VARCHAR(64),
    backup_location VARCHAR(500),
    
    -- Error and exception handling
    error_code VARCHAR(50),
    error_message TEXT,
    error_details JSONB,
    retry_count INTEGER DEFAULT 0,
    exception_granted BOOLEAN DEFAULT FALSE,
    exception_reason TEXT,
    
    -- Audit and compliance metadata
    audit_trail_hash VARCHAR(64),
    previous_audit_hash VARCHAR(64),
    compliance_verified BOOLEAN DEFAULT FALSE,
    compliance_verification_date TIMESTAMP WITH TIME ZONE,
    compliance_verifier_id UUID REFERENCES users(id),
    
    -- Data protection impact
    privacy_impact_assessment_ref VARCHAR(100),
    data_protection_measures JSONB DEFAULT '[]'::jsonb,
    risk_assessment VARCHAR(20) CHECK (risk_assessment IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    mitigation_actions JSONB DEFAULT '[]'::jsonb,
    
    -- Retention and archival
    audit_retention_period INTEGER DEFAULT 2555, -- 7 years default
    archive_after_days INTEGER DEFAULT 365,
    permanent_retention BOOLEAN DEFAULT FALSE,
    
    -- Additional metadata
    system_context JSONB DEFAULT '{}'::jsonb,
    user_agent TEXT,
    ip_address INET,
    geographic_location VARCHAR(100),
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_data_retention_audit_timestamp 
ON data_retention_audit(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_data_retention_audit_operation 
ON data_retention_audit(operation_type, operation_status, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_data_retention_audit_user 
ON data_retention_audit(affected_user_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_data_retention_audit_policy 
ON data_retention_audit(retention_policy_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_data_retention_audit_correlation 
ON data_retention_audit(correlation_id);

CREATE INDEX IF NOT EXISTS idx_data_retention_audit_compliance 
ON data_retention_audit(compliance_framework, timestamp DESC);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_data_retention_audit_user_operation 
ON data_retention_audit(affected_user_id, operation_type, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_data_retention_audit_status_type 
ON data_retention_audit(operation_status, operation_type);

-- Partial indexes for specific cases
CREATE INDEX IF NOT EXISTS idx_data_retention_audit_failed 
ON data_retention_audit(timestamp DESC) 
WHERE operation_status = 'FAILED';

CREATE INDEX IF NOT EXISTS idx_data_retention_audit_subject_requests 
ON data_retention_audit(timestamp DESC) 
WHERE is_subject_request = TRUE;

CREATE INDEX IF NOT EXISTS idx_data_retention_audit_legal_hold 
ON data_retention_audit(affected_user_id, timestamp DESC) 
WHERE legal_hold_applied = TRUE;

-- GIN indexes for JSONB fields
CREATE INDEX IF NOT EXISTS idx_data_retention_audit_target_ids 
ON data_retention_audit USING GIN(target_record_ids);

CREATE INDEX IF NOT EXISTS idx_data_retention_audit_validation_checks 
ON data_retention_audit USING GIN(validation_checks_passed, validation_checks_failed);

CREATE INDEX IF NOT EXISTS idx_data_retention_audit_metadata 
ON data_retention_audit USING GIN(metadata);

-- Data Subject Rights Audit Table
CREATE TABLE IF NOT EXISTS data_subject_rights_audit (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    request_id UUID NOT NULL DEFAULT uuid_generate_v4(),
    
    -- Subject information
    data_subject_id UUID REFERENCES users(id),
    data_subject_email VARCHAR(255),
    data_subject_identifier VARCHAR(255), -- for cases where user account is deleted
    
    -- Request details
    request_type VARCHAR(50) NOT NULL CHECK (request_type IN (
        'ACCESS', 'RECTIFICATION', 'ERASURE', 'RESTRICTION', 
        'PORTABILITY', 'OBJECTION', 'CONSENT_WITHDRAWAL'
    )),
    request_status VARCHAR(30) NOT NULL CHECK (request_status IN (
        'RECEIVED', 'UNDER_REVIEW', 'IDENTITY_VERIFICATION', 'IN_PROGRESS',
        'COMPLETED', 'REJECTED', 'PARTIALLY_FULFILLED', 'ESCALATED'
    )),
    request_method VARCHAR(30) CHECK (request_method IN (
        'EMAIL', 'FORM', 'PHONE', 'LETTER', 'IN_PERSON', 'API'
    )),
    
    -- Processing information
    received_date TIMESTAMP WITH TIME ZONE NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE,
    completed_date TIMESTAMP WITH TIME ZONE,
    processor_user_id UUID REFERENCES users(id),
    reviewer_user_id UUID REFERENCES users(id),
    
    -- Legal basis and justification
    legal_basis VARCHAR(200),
    processing_lawfulness JSONB DEFAULT '[]'::jsonb,
    rejection_reason TEXT,
    identity_verified BOOLEAN DEFAULT FALSE,
    identity_verification_method VARCHAR(100),
    
    -- Data scope and impact
    data_categories_affected JSONB DEFAULT '[]'::jsonb,
    systems_affected JSONB DEFAULT '[]'::jsonb,
    third_parties_notified JSONB DEFAULT '[]'::jsonb,
    data_volume_affected_bytes BIGINT,
    
    -- Response and fulfillment
    response_method VARCHAR(30),
    response_format VARCHAR(30),
    data_delivered_date TIMESTAMP WITH TIME ZONE,
    delivery_confirmation BOOLEAN DEFAULT FALSE,
    delivery_tracking_ref VARCHAR(100),
    
    -- Compliance tracking
    regulatory_deadline_met BOOLEAN,
    escalation_required BOOLEAN DEFAULT FALSE,
    escalation_reason TEXT,
    compliance_risk_level VARCHAR(20) CHECK (compliance_risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    
    -- Documentation
    supporting_documents JSONB DEFAULT '[]'::jsonb,
    communication_log JSONB DEFAULT '[]'::jsonb,
    audit_notes TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for data subject rights audit
CREATE INDEX IF NOT EXISTS idx_data_subject_rights_audit_subject 
ON data_subject_rights_audit(data_subject_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_data_subject_rights_audit_type_status 
ON data_subject_rights_audit(request_type, request_status, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_data_subject_rights_audit_due_date 
ON data_subject_rights_audit(due_date) 
WHERE request_status NOT IN ('COMPLETED', 'REJECTED');

-- Compliance Monitoring Audit Table
CREATE TABLE IF NOT EXISTS compliance_monitoring_audit (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    monitoring_event_id UUID NOT NULL DEFAULT uuid_generate_v4(),
    
    -- Monitoring details
    compliance_framework VARCHAR(50) NOT NULL, -- GDPR, CCPA, HIPAA, etc.
    monitoring_type VARCHAR(50) NOT NULL CHECK (monitoring_type IN (
        'AUTOMATED_SCAN', 'MANUAL_REVIEW', 'INCIDENT_INVESTIGATION',
        'REGULAR_ASSESSMENT', 'BREACH_DETECTION', 'POLICY_COMPLIANCE_CHECK'
    )),
    
    -- Scope and coverage
    scope_description TEXT,
    systems_monitored JSONB DEFAULT '[]'::jsonb,
    data_types_monitored JSONB DEFAULT '[]'::jsonb,
    monitoring_period_start TIMESTAMP WITH TIME ZONE,
    monitoring_period_end TIMESTAMP WITH TIME ZONE,
    
    -- Findings and results
    compliance_status VARCHAR(20) CHECK (compliance_status IN ('COMPLIANT', 'NON_COMPLIANT', 'PARTIAL', 'UNKNOWN')),
    violations_detected INTEGER DEFAULT 0,
    violations_severity VARCHAR(20) CHECK (violations_severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    violations_details JSONB DEFAULT '[]'::jsonb,
    
    -- Risk assessment
    risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
    risk_factors JSONB DEFAULT '[]'::jsonb,
    potential_impact TEXT,
    likelihood_assessment VARCHAR(20),
    
    -- Remediation
    remediation_required BOOLEAN DEFAULT FALSE,
    remediation_actions JSONB DEFAULT '[]'::jsonb,
    remediation_timeline INTERVAL,
    remediation_status VARCHAR(20) CHECK (remediation_status IN ('NOT_REQUIRED', 'PLANNED', 'IN_PROGRESS', 'COMPLETED', 'DELAYED')),
    
    -- Reporting and notification
    authorities_notified JSONB DEFAULT '[]'::jsonb,
    notification_required BOOLEAN DEFAULT FALSE,
    notification_timeline INTERVAL,
    breach_notification_sent BOOLEAN DEFAULT FALSE,
    
    -- Audit trail
    performed_by_user_id UUID REFERENCES users(id),
    performed_by_system VARCHAR(100),
    monitoring_tool VARCHAR(100),
    evidence_collected JSONB DEFAULT '[]'::jsonb,
    
    -- Documentation
    assessment_report_location VARCHAR(500),
    supporting_evidence JSONB DEFAULT '[]'::jsonb,
    recommendations JSONB DEFAULT '[]'::jsonb,
    
    -- Follow-up
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date TIMESTAMP WITH TIME ZONE,
    follow_up_completed BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for compliance monitoring audit
CREATE INDEX IF NOT EXISTS idx_compliance_monitoring_audit_framework 
ON compliance_monitoring_audit(compliance_framework, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_compliance_monitoring_audit_status 
ON compliance_monitoring_audit(compliance_status, violations_severity, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_compliance_monitoring_audit_violations 
ON compliance_monitoring_audit(timestamp DESC) 
WHERE violations_detected > 0;

-- Create comprehensive audit summary view
CREATE OR REPLACE VIEW data_retention_audit_summary AS
SELECT 
    DATE_TRUNC('day', timestamp) as audit_date,
    operation_type,
    compliance_framework,
    COUNT(*) as total_operations,
    COUNT(CASE WHEN operation_status = 'COMPLETED' THEN 1 END) as completed_operations,
    COUNT(CASE WHEN operation_status = 'FAILED' THEN 1 END) as failed_operations,
    SUM(records_processed) as total_records_processed,
    SUM(records_deleted) as total_records_deleted,
    SUM(records_archived) as total_records_archived,
    AVG(execution_duration_ms) as avg_execution_time,
    COUNT(CASE WHEN is_subject_request = TRUE THEN 1 END) as subject_requests,
    COUNT(CASE WHEN legal_hold_applied = TRUE THEN 1 END) as legal_hold_operations,
    COUNT(DISTINCT affected_user_id) as unique_affected_users
FROM data_retention_audit
WHERE timestamp >= NOW() - INTERVAL '90 days'
GROUP BY DATE_TRUNC('day', timestamp), operation_type, compliance_framework
ORDER BY audit_date DESC, operation_type;

-- Create data subject rights summary view
CREATE OR REPLACE VIEW data_subject_rights_summary AS
SELECT 
    DATE_TRUNC('month', timestamp) as request_month,
    request_type,
    COUNT(*) as total_requests,
    COUNT(CASE WHEN request_status = 'COMPLETED' THEN 1 END) as completed_requests,
    COUNT(CASE WHEN request_status = 'REJECTED' THEN 1 END) as rejected_requests,
    COUNT(CASE WHEN regulatory_deadline_met = FALSE THEN 1 END) as missed_deadlines,
    AVG(EXTRACT(EPOCH FROM (completed_date - received_date))/3600/24) as avg_processing_days,
    COUNT(CASE WHEN escalation_required = TRUE THEN 1 END) as escalated_requests
FROM data_subject_rights_audit
WHERE timestamp >= NOW() - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', timestamp), request_type
ORDER BY request_month DESC, request_type;

-- Create compliance violations view
CREATE OR REPLACE VIEW compliance_violations_summary AS
SELECT 
    compliance_framework,
    violations_severity,
    COUNT(*) as violation_count,
    COUNT(CASE WHEN remediation_status = 'COMPLETED' THEN 1 END) as remediated_count,
    COUNT(CASE WHEN authorities_notified != '[]'::jsonb THEN 1 END) as reported_count,
    AVG(risk_score) as avg_risk_score,
    MAX(timestamp) as latest_violation
FROM compliance_monitoring_audit
WHERE violations_detected > 0
    AND timestamp >= NOW() - INTERVAL '6 months'
GROUP BY compliance_framework, violations_severity
ORDER BY compliance_framework, 
    CASE violations_severity 
        WHEN 'CRITICAL' THEN 1 
        WHEN 'HIGH' THEN 2 
        WHEN 'MEDIUM' THEN 3 
        WHEN 'LOW' THEN 4 
    END;

-- Create functions for audit trail integrity
CREATE OR REPLACE FUNCTION generate_audit_trail_hash(audit_record_id UUID)
RETURNS VARCHAR(64) AS $$
DECLARE
    record_data TEXT;
    hash_result VARCHAR(64);
BEGIN
    -- Get the record data for hashing
    SELECT CONCAT(
        operation_id::text, 
        timestamp::text, 
        operation_type, 
        operation_status,
        COALESCE(affected_user_id::text, ''),
        COALESCE(records_processed::text, '0'),
        COALESCE(records_deleted::text, '0')
    ) INTO record_data
    FROM data_retention_audit 
    WHERE id = audit_record_id;
    
    -- Generate SHA-256 hash
    hash_result := encode(digest(record_data, 'sha256'), 'hex');
    
    RETURN hash_result;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function to automatically update audit hash
CREATE OR REPLACE FUNCTION update_audit_trail_hash()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the audit trail hash
    NEW.audit_trail_hash = generate_audit_trail_hash(NEW.id);
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for audit trail hash updates
CREATE TRIGGER data_retention_audit_hash_trigger
    BEFORE INSERT OR UPDATE ON data_retention_audit
    FOR EACH ROW
    EXECUTE FUNCTION update_audit_trail_hash();

-- Create function for audit data export
CREATE OR REPLACE FUNCTION export_audit_data(
    p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_compliance_framework VARCHAR DEFAULT NULL,
    p_operation_type VARCHAR DEFAULT NULL
)
RETURNS TABLE(
    audit_type VARCHAR,
    audit_data JSONB
) AS $$
BEGIN
    -- Export data retention audit records
    RETURN QUERY
    SELECT 
        'data_retention'::VARCHAR as audit_type,
        to_jsonb(dra.*) as audit_data
    FROM data_retention_audit dra
    WHERE (p_start_date IS NULL OR dra.timestamp >= p_start_date)
        AND (p_end_date IS NULL OR dra.timestamp <= p_end_date)
        AND (p_compliance_framework IS NULL OR dra.compliance_framework = p_compliance_framework)
        AND (p_operation_type IS NULL OR dra.operation_type = p_operation_type)
    ORDER BY dra.timestamp DESC;
    
    -- Export data subject rights audit records
    RETURN QUERY
    SELECT 
        'subject_rights'::VARCHAR as audit_type,
        to_jsonb(dsra.*) as audit_data
    FROM data_subject_rights_audit dsra
    WHERE (p_start_date IS NULL OR dsra.timestamp >= p_start_date)
        AND (p_end_date IS NULL OR dsra.timestamp <= p_end_date)
    ORDER BY dsra.timestamp DESC;
    
    -- Export compliance monitoring audit records
    RETURN QUERY
    SELECT 
        'compliance_monitoring'::VARCHAR as audit_type,
        to_jsonb(cma.*) as audit_data
    FROM compliance_monitoring_audit cma
    WHERE (p_start_date IS NULL OR cma.timestamp >= p_start_date)
        AND (p_end_date IS NULL OR cma.timestamp <= p_end_date)
        AND (p_compliance_framework IS NULL OR cma.compliance_framework = p_compliance_framework)
    ORDER BY cma.timestamp DESC;
END;
$$ LANGUAGE plpgsql;

-- Create automatic cleanup function for audit data
CREATE OR REPLACE FUNCTION cleanup_audit_data()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
    temp_count INTEGER;
BEGIN
    -- Clean up data retention audit records past their retention period
    DELETE FROM data_retention_audit 
    WHERE timestamp < NOW() - (audit_retention_period || ' days')::INTERVAL
        AND permanent_retention = FALSE;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_count := deleted_count + temp_count;
    
    -- Clean up data subject rights audit records (keep for 7 years by default)
    DELETE FROM data_subject_rights_audit 
    WHERE timestamp < NOW() - INTERVAL '7 years';
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_count := deleted_count + temp_count;
    
    -- Archive old compliance monitoring records (keep active for 2 years)
    DELETE FROM compliance_monitoring_audit 
    WHERE timestamp < NOW() - INTERVAL '2 years';
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_count := deleted_count + temp_count;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON TABLE data_retention_audit IS 'Comprehensive audit trail for all data retention, deletion, and privacy operations';
COMMENT ON TABLE data_subject_rights_audit IS 'Audit trail for data subject rights requests (GDPR Article 15-22)';
COMMENT ON TABLE compliance_monitoring_audit IS 'Audit trail for compliance monitoring and violation detection';

COMMENT ON COLUMN data_retention_audit.audit_trail_hash IS 'SHA-256 hash for audit record integrity verification';
COMMENT ON COLUMN data_retention_audit.legal_hold_applied IS 'Flag indicating if legal hold prevents standard retention processing';
COMMENT ON COLUMN data_retention_audit.compliance_framework IS 'Regulatory framework applicable to this operation (GDPR, CCPA, etc.)';

-- Grant permissions for audit access
GRANT SELECT ON data_retention_audit TO readonly_users;
GRANT SELECT ON data_subject_rights_audit TO readonly_users;
GRANT SELECT ON compliance_monitoring_audit TO readonly_users;

GRANT SELECT, INSERT, UPDATE ON data_retention_audit TO audit_writers;
GRANT SELECT, INSERT, UPDATE ON data_subject_rights_audit TO audit_writers;
GRANT SELECT, INSERT, UPDATE ON compliance_monitoring_audit TO audit_writers;

GRANT ALL PRIVILEGES ON data_retention_audit TO audit_admins;
GRANT ALL PRIVILEGES ON data_subject_rights_audit TO audit_admins;
GRANT ALL PRIVILEGES ON compliance_monitoring_audit TO audit_admins;