-- Financial Services & Fintech Toolkit Database Schema
-- Data lifecycle management and automated deletion for financial data
-- Epic 19.2.6 - Data Retention Automation
-- Created: 2025-07-21

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Financial data records table
-- Stores financial data with lifecycle tracking and retention metadata
CREATE TABLE IF NOT EXISTS financial_data_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id VARCHAR(256) NOT NULL, -- Client's unique identifier
    data_type VARCHAR(128) NOT NULL, -- transaction, account, document, etc.
    
    -- Data classification and ownership
    category VARCHAR(64) NOT NULL DEFAULT 'FINANCIAL', -- DataCategory enum
    jurisdiction VARCHAR(32) NOT NULL DEFAULT 'US', -- Jurisdiction enum
    owner_id VARCHAR(128) NOT NULL,
    
    -- Financial-specific metadata
    account_number VARCHAR(128),
    transaction_id VARCHAR(128),
    amount DECIMAL(15,2),
    currency VARCHAR(8) DEFAULT 'USD',
    transaction_date DATE,
    institution_name VARCHAR(256),
    
    -- Data lifecycle tracking
    current_stage VARCHAR(64) NOT NULL DEFAULT 'CREATED', -- LifecycleStage enum
    lifecycle_id UUID, -- References data_lifecycle_automation table
    
    -- Retention and deletion metadata
    retention_period_years INTEGER NOT NULL DEFAULT 7, -- Financial data: 7 years
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    retention_expires_at TIMESTAMP WITH TIME ZONE, -- Calculated field
    deletion_scheduled_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    purged_at TIMESTAMP WITH TIME ZONE,
    
    -- Deletion verification and audit
    deletion_verification_hash VARCHAR(256), -- SHA-256 hash for verification
    deletion_reason TEXT,
    approved_by VARCHAR(128),
    
    -- Legal holds and exceptions
    legal_hold BOOLEAN DEFAULT false,
    legal_hold_reason TEXT,
    legal_hold_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Audit and compliance
    compliance_tags JSONB DEFAULT '[]', -- Array of compliance tags
    audit_metadata JSONB DEFAULT '{}', -- Additional audit information
    
    -- Timestamps
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_data_type CHECK (data_type IN ('transaction', 'account', 'document', 'statement', 'report', 'identity', 'credit', 'loan')),
    CONSTRAINT valid_category CHECK (category IN ('FINANCIAL', 'PII', 'HEALTH_DATA', 'BIOMETRIC', 'LOCATION', 'COMMUNICATION', 'BEHAVIORAL', 'TECHNICAL', 'LEGAL', 'OTHER')),
    CONSTRAINT valid_jurisdiction CHECK (jurisdiction IN ('EU', 'US', 'CALIFORNIA', 'CANADA', 'UK', 'GLOBAL')),
    CONSTRAINT valid_current_stage CHECK (current_stage IN ('CREATED', 'ACTIVE', 'AGING', 'ARCHIVAL_READY', 'ARCHIVED', 'RETENTION_EXPIRED', 'DELETION_PENDING', 'DELETED', 'PURGED')),
    CONSTRAINT valid_currency CHECK (currency ~ '^[A-Z]{3}$'),
    CONSTRAINT valid_retention_period CHECK (retention_period_years > 0 AND retention_period_years <= 100),
    CONSTRAINT valid_legal_hold_expires CHECK (legal_hold = false OR legal_hold_expires_at IS NOT NULL),
    CONSTRAINT valid_compliance_tags CHECK (jsonb_typeof(compliance_tags) = 'array'),
    CONSTRAINT valid_audit_metadata CHECK (jsonb_typeof(audit_metadata) = 'object')
);

-- Automated deletion workflows table
-- Manages scheduled deletion operations with verification steps
CREATE TABLE IF NOT EXISTS financial_deletion_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_name VARCHAR(256) NOT NULL,
    
    -- Workflow configuration
    trigger_type VARCHAR(64) NOT NULL, -- 'schedule', 'retention_expired', 'manual', 'legal_request'
    trigger_config JSONB NOT NULL DEFAULT '{}', -- Cron schedule or other trigger config
    
    -- Selection criteria for records to delete
    selection_criteria JSONB NOT NULL DEFAULT '{}', -- SQL-like criteria for record selection
    batch_size INTEGER DEFAULT 100, -- Number of records to process per batch
    
    -- Verification and safety checks
    require_approval BOOLEAN DEFAULT true,
    verification_steps JSONB DEFAULT '[]', -- Array of verification step configurations
    safety_checks JSONB DEFAULT '[]', -- Array of safety check configurations
    
    -- Workflow state
    is_active BOOLEAN DEFAULT true,
    last_execution_at TIMESTAMP WITH TIME ZONE,
    next_execution_at TIMESTAMP WITH TIME ZONE,
    
    -- Statistics
    total_executions INTEGER DEFAULT 0,
    successful_deletions INTEGER DEFAULT 0,
    failed_deletions INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(128),
    
    CONSTRAINT valid_trigger_type CHECK (trigger_type IN ('schedule', 'retention_expired', 'manual', 'legal_request')),
    CONSTRAINT valid_batch_size CHECK (batch_size > 0 AND batch_size <= 10000),
    CONSTRAINT valid_trigger_config CHECK (jsonb_typeof(trigger_config) = 'object'),
    CONSTRAINT valid_selection_criteria CHECK (jsonb_typeof(selection_criteria) = 'object'),
    CONSTRAINT valid_verification_steps CHECK (jsonb_typeof(verification_steps) = 'array'),
    CONSTRAINT valid_safety_checks CHECK (jsonb_typeof(safety_checks) = 'array')
);

-- Deletion execution log table
-- Tracks individual deletion operations for audit and compliance
CREATE TABLE IF NOT EXISTS financial_deletion_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES financial_deletion_workflows(id) ON DELETE CASCADE,
    
    -- Execution metadata
    execution_batch_id VARCHAR(128) NOT NULL, -- Groups related deletions
    record_id UUID NOT NULL, -- References financial_data_records(id)
    external_record_id VARCHAR(256) NOT NULL, -- External identifier of deleted record
    
    -- Execution details
    execution_status VARCHAR(64) NOT NULL, -- 'pending', 'verified', 'executed', 'failed', 'cancelled'
    verification_hash VARCHAR(256), -- Pre-deletion verification hash
    deletion_hash VARCHAR(256), -- Post-deletion confirmation hash
    
    -- Timing
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    executed_at TIMESTAMP WITH TIME ZONE,
    
    -- Approval and authorization
    approved_by VARCHAR(128),
    approved_at TIMESTAMP WITH TIME ZONE,
    approval_reason TEXT,
    
    -- Error handling
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- Audit trail
    verification_steps_completed JSONB DEFAULT '[]',
    safety_checks_completed JSONB DEFAULT '[]',
    audit_metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_execution_status CHECK (execution_status IN ('pending', 'verified', 'executed', 'failed', 'cancelled')),
    CONSTRAINT valid_retry_count CHECK (retry_count >= 0 AND retry_count <= 10),
    CONSTRAINT valid_verification_steps CHECK (jsonb_typeof(verification_steps_completed) = 'array'),
    CONSTRAINT valid_safety_checks CHECK (jsonb_typeof(safety_checks_completed) = 'array'),
    CONSTRAINT valid_audit_metadata CHECK (jsonb_typeof(audit_metadata) = 'object')
);

-- Financial compliance reporting table
-- Stores compliance reports for data deletion activities
CREATE TABLE IF NOT EXISTS financial_compliance_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Report identification
    report_type VARCHAR(128) NOT NULL, -- 'monthly_deletion', 'gdpr_deletion', 'sox_retention', 'audit_trail'
    reporting_period_start DATE NOT NULL,
    reporting_period_end DATE NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Report content
    total_records_deleted INTEGER DEFAULT 0,
    total_data_volume_deleted BIGINT DEFAULT 0, -- In bytes
    deletion_reasons JSONB DEFAULT '{}', -- Count by reason
    jurisdictions_affected JSONB DEFAULT '[]', -- Array of jurisdictions
    
    -- Compliance metadata
    regulatory_framework VARCHAR(64), -- 'GDPR', 'CCPA', 'SOX', 'HIPAA', 'GLBA'
    compliance_officer VARCHAR(128),
    approval_status VARCHAR(64) DEFAULT 'draft', -- 'draft', 'approved', 'submitted', 'archived'
    
    -- Report data (stored as JSON for flexibility)
    report_data JSONB NOT NULL DEFAULT '{}',
    summary_statistics JSONB DEFAULT '{}',
    
    -- Export and submission
    exported_at TIMESTAMP WITH TIME ZONE,
    export_format VARCHAR(32), -- 'json', 'csv', 'pdf', 'xml'
    submission_confirmation VARCHAR(256),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(128),
    
    CONSTRAINT valid_report_type CHECK (report_type ~ '^[a-z][a-z0-9_]*$'),
    CONSTRAINT valid_period CHECK (reporting_period_end >= reporting_period_start),
    CONSTRAINT valid_regulatory_framework CHECK (regulatory_framework IN ('GDPR', 'CCPA', 'SOX', 'HIPAA', 'GLBA', 'PCI_DSS', 'BASEL_III')),
    CONSTRAINT valid_approval_status CHECK (approval_status IN ('draft', 'approved', 'submitted', 'archived')),
    CONSTRAINT valid_export_format CHECK (export_format IN ('json', 'csv', 'pdf', 'xml')),
    CONSTRAINT valid_deletion_reasons CHECK (jsonb_typeof(deletion_reasons) = 'object'),
    CONSTRAINT valid_jurisdictions CHECK (jsonb_typeof(jurisdictions_affected) = 'array'),
    CONSTRAINT valid_report_data CHECK (jsonb_typeof(report_data) = 'object'),
    CONSTRAINT valid_summary_stats CHECK (jsonb_typeof(summary_statistics) = 'object')
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_financial_data_records_owner_id ON financial_data_records(owner_id);
CREATE INDEX IF NOT EXISTS idx_financial_data_records_data_type ON financial_data_records(data_type);
CREATE INDEX IF NOT EXISTS idx_financial_data_records_current_stage ON financial_data_records(current_stage);
CREATE INDEX IF NOT EXISTS idx_financial_data_records_retention_expires ON financial_data_records(retention_expires_at);
CREATE INDEX IF NOT EXISTS idx_financial_data_records_deletion_scheduled ON financial_data_records(deletion_scheduled_at);
CREATE INDEX IF NOT EXISTS idx_financial_data_records_legal_hold ON financial_data_records(legal_hold) WHERE legal_hold = true;
CREATE INDEX IF NOT EXISTS idx_financial_data_records_account_number ON financial_data_records(account_number) WHERE account_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_financial_data_records_transaction_id ON financial_data_records(transaction_id) WHERE transaction_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_financial_data_records_external_id ON financial_data_records(external_id);

CREATE INDEX IF NOT EXISTS idx_financial_deletion_workflows_trigger_type ON financial_deletion_workflows(trigger_type);
CREATE INDEX IF NOT EXISTS idx_financial_deletion_workflows_is_active ON financial_deletion_workflows(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_financial_deletion_workflows_next_execution ON financial_deletion_workflows(next_execution_at) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_financial_deletion_executions_workflow_id ON financial_deletion_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_financial_deletion_executions_batch_id ON financial_deletion_executions(execution_batch_id);
CREATE INDEX IF NOT EXISTS idx_financial_deletion_executions_status ON financial_deletion_executions(execution_status);
CREATE INDEX IF NOT EXISTS idx_financial_deletion_executions_scheduled ON financial_deletion_executions(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_financial_deletion_executions_record_id ON financial_deletion_executions(record_id);

CREATE INDEX IF NOT EXISTS idx_financial_compliance_reports_type ON financial_compliance_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_financial_compliance_reports_period ON financial_compliance_reports(reporting_period_start, reporting_period_end);
CREATE INDEX IF NOT EXISTS idx_financial_compliance_reports_framework ON financial_compliance_reports(regulatory_framework);
CREATE INDEX IF NOT EXISTS idx_financial_compliance_reports_approval_status ON financial_compliance_reports(approval_status);

-- Triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_financial_data_records_updated_at 
    BEFORE UPDATE ON financial_data_records 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_deletion_workflows_updated_at 
    BEFORE UPDATE ON financial_deletion_workflows 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_deletion_executions_updated_at 
    BEFORE UPDATE ON financial_deletion_executions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_compliance_reports_updated_at 
    BEFORE UPDATE ON financial_compliance_reports 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to automatically calculate retention expiry dates
CREATE OR REPLACE FUNCTION calculate_retention_expiry()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate retention expiry based on creation date and retention period
    NEW.retention_expires_at = NEW.created_at + INTERVAL '1 year' * NEW.retention_period_years;
    
    -- If transaction_date exists and is later than created_at, use it as base
    IF NEW.transaction_date IS NOT NULL THEN
        NEW.retention_expires_at = (NEW.transaction_date + INTERVAL '1 year' * NEW.retention_period_years)::TIMESTAMP WITH TIME ZONE;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER calculate_financial_data_retention_expiry 
    BEFORE INSERT OR UPDATE OF retention_period_years, transaction_date ON financial_data_records 
    FOR EACH ROW EXECUTE FUNCTION calculate_retention_expiry();

-- View for records ready for deletion
CREATE OR REPLACE VIEW financial_records_ready_for_deletion AS
SELECT 
    fdr.id,
    fdr.external_id,
    fdr.data_type,
    fdr.owner_id,
    fdr.current_stage,
    fdr.retention_expires_at,
    fdr.legal_hold,
    fdr.legal_hold_reason,
    fdr.legal_hold_expires_at,
    fdr.created_at,
    fdr.last_accessed_at,
    -- Calculate days overdue for deletion
    EXTRACT(DAYS FROM NOW() - fdr.retention_expires_at) AS days_overdue
FROM financial_data_records fdr
WHERE 
    fdr.current_stage IN ('RETENTION_EXPIRED', 'DELETION_PENDING')
    AND fdr.retention_expires_at < NOW()
    AND (fdr.legal_hold = false OR (fdr.legal_hold = true AND fdr.legal_hold_expires_at < NOW()))
    AND fdr.deleted_at IS NULL
ORDER BY fdr.retention_expires_at ASC;