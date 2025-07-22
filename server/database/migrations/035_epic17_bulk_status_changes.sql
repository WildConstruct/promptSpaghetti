-- Epic 17 Bulk Status Changes Database Schema
-- Task: E17-1753114396944-CBFD7F - Create bulk status changes
-- 
-- Creates comprehensive bulk status change infrastructure for Epic 17 API Management System
-- including operation tracking, approval workflows, rollback capabilities, and audit trails.

-- Bulk status change operations tracking
CREATE TABLE IF NOT EXISTS epic17_bulk_status_operations (
    id SERIAL PRIMARY KEY,
    operation_id UUID UNIQUE NOT NULL,
    operation_type VARCHAR(20) NOT NULL, -- activate, suspend, revoke, archive, restore, expire, reset
    target_type VARCHAR(30) NOT NULL, -- api_keys, user_accounts, permissions, services, sessions, configurations
    status VARCHAR(20) DEFAULT 'pending', -- pending, validating, approved, running, paused, completed, failed, cancelled, rolled_back
    
    -- Operation scope
    total_count INTEGER NOT NULL,
    processed_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    
    -- Status change details
    from_status VARCHAR(50),
    to_status VARCHAR(50) NOT NULL,
    reason TEXT NOT NULL,
    change_metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Execution control
    batch_size INTEGER DEFAULT 100,
    current_batch INTEGER DEFAULT 0,
    total_batches INTEGER,
    execution_mode VARCHAR(20) DEFAULT 'immediate', -- immediate, scheduled, approval_pending
    
    -- Timing
    scheduled_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    estimated_completion TIMESTAMP WITH TIME ZONE,
    duration INTEGER, -- milliseconds
    
    -- Approval workflow
    requires_approval BOOLEAN DEFAULT FALSE,
    approved_by VARCHAR(255),
    approved_at TIMESTAMP WITH TIME ZONE,
    
    -- Safety and validation
    dry_run_completed BOOLEAN DEFAULT FALSE,
    impact_assessment JSONB DEFAULT '{}'::jsonb,
    safety_checks JSONB DEFAULT '[]'::jsonb,
    
    -- Results tracking
    results JSONB DEFAULT '[]'::jsonb, -- Array of individual results
    errors JSONB DEFAULT '[]'::jsonb, -- Array of errors
    warnings JSONB DEFAULT '[]'::jsonb, -- Array of warnings
    rollback_data JSONB DEFAULT '{}'::jsonb,
    
    -- Metadata
    initiated_by VARCHAR(255) NOT NULL,
    request_id UUID NOT NULL,
    tags JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    
    -- Monitoring
    progress_percentage INTEGER DEFAULT 0,
    average_processing_time DECIMAL(10, 2) DEFAULT 0, -- milliseconds
    error_rate DECIMAL(5, 2) DEFAULT 0, -- percentage
    throughput DECIMAL(10, 2) DEFAULT 0, -- items per minute
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_epic17_bulk_status_operation_id (operation_id),
    INDEX idx_epic17_bulk_status_type (operation_type),
    INDEX idx_epic17_bulk_status_target (target_type),
    INDEX idx_epic17_bulk_status_status (status),
    INDEX idx_epic17_bulk_status_initiated_by (initiated_by),
    INDEX idx_epic17_bulk_status_created_at (created_at),
    INDEX idx_epic17_bulk_status_requires_approval (requires_approval),
    INDEX idx_epic17_bulk_status_composite (target_type, status, created_at),
    INDEX idx_epic17_bulk_status_active (status, started_at) WHERE status IN ('running', 'pending', 'approved')
);

-- Approval requests for bulk operations
CREATE TABLE IF NOT EXISTS epic17_bulk_approval_requests (
    id SERIAL PRIMARY KEY,
    request_id UUID UNIQUE NOT NULL,
    operation_id UUID NOT NULL,
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    requested_by VARCHAR(255) NOT NULL,
    
    -- Approval configuration
    approvers JSONB NOT NULL, -- Array of approver identifiers
    approval_required INTEGER NOT NULL DEFAULT 1, -- Number of approvals needed
    approvals_received INTEGER DEFAULT 0,
    
    -- Request details
    justification TEXT NOT NULL,
    risk_assessment TEXT,
    impact_summary TEXT,
    
    -- Status and timing
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, expired
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Resolution
    approved_by VARCHAR(255),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    
    -- Indexes
    INDEX idx_epic17_approval_requests_request_id (request_id),
    INDEX idx_epic17_approval_requests_operation_id (operation_id),
    INDEX idx_epic17_approval_requests_status (status),
    INDEX idx_epic17_approval_requests_requested_by (requested_by),
    INDEX idx_epic17_approval_requests_expires_at (expires_at),
    INDEX idx_epic17_approval_requests_pending (status, expires_at) WHERE status = 'pending',
    
    FOREIGN KEY (operation_id) REFERENCES epic17_bulk_status_operations(operation_id) ON DELETE CASCADE
);

-- Individual approvals within approval requests
CREATE TABLE IF NOT EXISTS epic17_bulk_approvals (
    id SERIAL PRIMARY KEY,
    approval_id UUID UNIQUE NOT NULL,
    request_id UUID NOT NULL,
    approved_by VARCHAR(255) NOT NULL,
    approved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    decision VARCHAR(10) NOT NULL, -- approve, reject
    comments TEXT,
    conditions JSONB DEFAULT '[]'::jsonb, -- Array of approval conditions
    
    -- Indexes
    INDEX idx_epic17_bulk_approvals_approval_id (approval_id),
    INDEX idx_epic17_bulk_approvals_request_id (request_id),
    INDEX idx_epic17_bulk_approvals_approved_by (approved_by),
    INDEX idx_epic17_bulk_approvals_decision (decision),
    
    FOREIGN KEY (request_id) REFERENCES epic17_bulk_approval_requests(request_id) ON DELETE CASCADE
);

-- Dry run results and impact analysis
CREATE TABLE IF NOT EXISTS epic17_bulk_dry_runs (
    id SERIAL PRIMARY KEY,
    dry_run_id UUID UNIQUE NOT NULL,
    operation_id UUID NOT NULL,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    executed_by VARCHAR(255) NOT NULL,
    
    -- Analysis results
    total_items_analyzed INTEGER NOT NULL,
    eligible_items INTEGER NOT NULL,
    ineligible_items INTEGER NOT NULL,
    potential_errors INTEGER NOT NULL,
    estimated_duration INTEGER, -- minutes
    
    -- Impact analysis
    impact_analysis JSONB NOT NULL,
    recommendations JSONB DEFAULT '[]'::jsonb,
    warnings JSONB DEFAULT '[]'::jsonb,
    
    -- Sample data analysis
    sample_size INTEGER,
    sample_results JSONB DEFAULT '[]'::jsonb,
    
    -- Indexes
    INDEX idx_epic17_dry_runs_dry_run_id (dry_run_id),
    INDEX idx_epic17_dry_runs_operation_id (operation_id),
    INDEX idx_epic17_dry_runs_executed_at (executed_at),
    INDEX idx_epic17_dry_runs_executed_by (executed_by),
    
    FOREIGN KEY (operation_id) REFERENCES epic17_bulk_status_operations(operation_id) ON DELETE CASCADE
);

-- Detailed results for individual items within bulk operations
CREATE TABLE IF NOT EXISTS epic17_bulk_operation_results (
    id SERIAL PRIMARY KEY,
    result_id UUID UNIQUE NOT NULL,
    operation_id UUID NOT NULL,
    target_id VARCHAR(255) NOT NULL,
    batch_number INTEGER NOT NULL,
    
    -- Result details
    success BOOLEAN NOT NULL,
    previous_status VARCHAR(50),
    new_status VARCHAR(50),
    message TEXT NOT NULL,
    processing_time INTEGER, -- milliseconds
    retry_count INTEGER DEFAULT 0,
    
    -- Timing
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Additional details
    details JSONB DEFAULT '{}'::jsonb,
    rollback_info JSONB DEFAULT '{}'::jsonb,
    
    -- Error information (for failed operations)
    error_type VARCHAR(30), -- validation, permission, constraint, system, timeout
    error_code VARCHAR(50),
    error_details JSONB DEFAULT '{}'::jsonb,
    
    -- Indexes
    INDEX idx_epic17_results_result_id (result_id),
    INDEX idx_epic17_results_operation_id (operation_id),
    INDEX idx_epic17_results_target_id (target_id),
    INDEX idx_epic17_results_success (success),
    INDEX idx_epic17_results_batch_number (batch_number),
    INDEX idx_epic17_results_processed_at (processed_at),
    INDEX idx_epic17_results_error_type (error_type),
    INDEX idx_epic17_results_composite (operation_id, batch_number, success),
    INDEX idx_epic17_results_failed (operation_id, success, error_type) WHERE success = FALSE,
    
    FOREIGN KEY (operation_id) REFERENCES epic17_bulk_status_operations(operation_id) ON DELETE CASCADE
);

-- Rollback operations for bulk status changes
CREATE TABLE IF NOT EXISTS epic17_bulk_rollback_operations (
    id SERIAL PRIMARY KEY,
    rollback_id UUID UNIQUE NOT NULL,
    original_operation_id UUID NOT NULL,
    initiated_by VARCHAR(255) NOT NULL,
    initiated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Rollback configuration
    rollback_type VARCHAR(20) NOT NULL, -- full, partial, selective
    rollback_scope JSONB NOT NULL, -- Which items/results to rollback
    rollback_reason TEXT NOT NULL,
    
    -- Status and progress
    status VARCHAR(20) DEFAULT 'pending', -- pending, running, completed, failed, cancelled
    total_items INTEGER NOT NULL,
    processed_items INTEGER DEFAULT 0,
    successful_rollbacks INTEGER DEFAULT 0,
    failed_rollbacks INTEGER DEFAULT 0,
    
    -- Timing
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    estimated_completion TIMESTAMP WITH TIME ZONE,
    
    -- Results
    rollback_results JSONB DEFAULT '[]'::jsonb,
    rollback_errors JSONB DEFAULT '[]'::jsonb,
    
    -- Risk and validation
    risk_assessment TEXT,
    pre_rollback_validation JSONB DEFAULT '{}'::jsonb,
    post_rollback_validation JSONB DEFAULT '{}'::jsonb,
    
    -- Indexes
    INDEX idx_epic17_rollbacks_rollback_id (rollback_id),
    INDEX idx_epic17_rollbacks_original_operation (original_operation_id),
    INDEX idx_epic17_rollbacks_status (status),
    INDEX idx_epic17_rollbacks_initiated_by (initiated_by),
    INDEX idx_epic17_rollbacks_initiated_at (initiated_at),
    
    FOREIGN KEY (original_operation_id) REFERENCES epic17_bulk_status_operations(operation_id) ON DELETE CASCADE
);

-- Filter criteria and target selection for bulk operations
CREATE TABLE IF NOT EXISTS epic17_bulk_operation_filters (
    id SERIAL PRIMARY KEY,
    filter_id UUID UNIQUE NOT NULL,
    operation_id UUID NOT NULL,
    
    -- Date filters
    created_after TIMESTAMP WITH TIME ZONE,
    created_before TIMESTAMP WITH TIME ZONE,
    last_used_after TIMESTAMP WITH TIME ZONE,
    last_used_before TIMESTAMP WITH TIME ZONE,
    expires_after TIMESTAMP WITH TIME ZONE,
    expires_before TIMESTAMP WITH TIME ZONE,
    
    -- Status filters
    current_status JSONB DEFAULT '[]'::jsonb, -- Array of statuses to include
    exclude_status JSONB DEFAULT '[]'::jsonb, -- Array of statuses to exclude
    
    -- Metadata filters
    tags JSONB DEFAULT '[]'::jsonb,
    categories JSONB DEFAULT '[]'::jsonb,
    environments JSONB DEFAULT '[]'::jsonb,
    
    -- Relationship filters
    owned_by JSONB DEFAULT '[]'::jsonb,
    assigned_to JSONB DEFAULT '[]'::jsonb,
    organization_id JSONB DEFAULT '[]'::jsonb,
    
    -- Custom criteria
    custom_criteria JSONB DEFAULT '{}'::jsonb,
    sql_where TEXT, -- Custom SQL WHERE clause
    
    -- Filter metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255) NOT NULL,
    
    -- Indexes
    INDEX idx_epic17_filters_filter_id (filter_id),
    INDEX idx_epic17_filters_operation_id (operation_id),
    INDEX idx_epic17_filters_created_at (created_at),
    
    FOREIGN KEY (operation_id) REFERENCES epic17_bulk_status_operations(operation_id) ON DELETE CASCADE
);

-- Bulk operation templates for common operations
CREATE TABLE IF NOT EXISTS epic17_bulk_operation_templates (
    id SERIAL PRIMARY KEY,
    template_id UUID UNIQUE NOT NULL,
    template_name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Template configuration
    operation_type VARCHAR(20) NOT NULL,
    target_type VARCHAR(30) NOT NULL,
    default_batch_size INTEGER DEFAULT 100,
    
    -- Pre-configured filters and criteria
    default_filters JSONB DEFAULT '{}'::jsonb,
    safety_checks JSONB DEFAULT '[]'::jsonb,
    approval_settings JSONB DEFAULT '{}'::jsonb,
    
    -- Template metadata
    category VARCHAR(50), -- maintenance, security, compliance, emergency
    risk_level VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    
    -- Creation and ownership
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    is_system_template BOOLEAN DEFAULT FALSE,
    
    -- Access control
    allowed_roles JSONB DEFAULT '[]'::jsonb,
    allowed_users JSONB DEFAULT '[]'::jsonb,
    
    -- Indexes
    INDEX idx_epic17_templates_template_id (template_id),
    INDEX idx_epic17_templates_name (template_name),
    INDEX idx_epic17_templates_category (category),
    INDEX idx_epic17_templates_operation_type (operation_type),
    INDEX idx_epic17_templates_target_type (target_type),
    INDEX idx_epic17_templates_risk_level (risk_level),
    INDEX idx_epic17_templates_is_active (is_active),
    INDEX idx_epic17_templates_created_by (created_by),
    INDEX idx_epic17_templates_usage (usage_count, last_used_at)
);

-- Create functions for bulk operation management

-- Function to get bulk operation summary
CREATE OR REPLACE FUNCTION get_bulk_operation_summary(p_operation_id UUID) 
RETURNS TABLE(
    operation_id UUID,
    operation_type VARCHAR(20),
    target_type VARCHAR(30),
    status VARCHAR(20),
    total_count INTEGER,
    processed_count INTEGER,
    success_rate DECIMAL(5,2),
    progress_percentage INTEGER,
    estimated_completion TIMESTAMP WITH TIME ZONE,
    initiated_by VARCHAR(255),
    duration_minutes INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.operation_id,
        o.operation_type,
        o.target_type,
        o.status,
        o.total_count,
        o.processed_count,
        CASE WHEN o.processed_count > 0 
            THEN (o.success_count::DECIMAL / o.processed_count * 100)::DECIMAL(5,2)
            ELSE 0::DECIMAL(5,2)
        END as success_rate,
        o.progress_percentage,
        o.estimated_completion,
        o.initiated_by,
        CASE WHEN o.completed_at IS NOT NULL AND o.started_at IS NOT NULL 
            THEN EXTRACT(EPOCH FROM (o.completed_at - o.started_at)) / 60
            ELSE NULL
        END::INTEGER as duration_minutes
    FROM epic17_bulk_status_operations o
    WHERE o.operation_id = p_operation_id;
END;
$$ LANGUAGE plpgsql;

-- Function to validate bulk operation eligibility
CREATE OR REPLACE FUNCTION validate_bulk_operation_eligibility(
    p_target_type VARCHAR(30),
    p_target_ids TEXT[],
    p_operation_type VARCHAR(20),
    p_to_status VARCHAR(50)
) RETURNS TABLE(
    target_id TEXT,
    eligible BOOLEAN,
    current_status VARCHAR(50),
    reason TEXT
) AS $$
BEGIN
    -- This is a simplified example - in production would be more comprehensive
    CASE 
        WHEN p_target_type = 'api_keys' THEN
            RETURN QUERY
            SELECT 
                k.key_id::TEXT as target_id,
                CASE 
                    WHEN k.key_id IS NULL THEN FALSE
                    WHEN k.status = 'revoked' AND p_operation_type != 'archive' THEN FALSE
                    WHEN k.status = p_to_status THEN FALSE
                    ELSE TRUE
                END as eligible,
                COALESCE(k.status, 'not_found') as current_status,
                CASE 
                    WHEN k.key_id IS NULL THEN 'API key not found'
                    WHEN k.status = 'revoked' AND p_operation_type != 'archive' THEN 'Cannot modify revoked keys'
                    WHEN k.status = p_to_status THEN 'Already in target status'
                    ELSE 'Eligible for operation'
                END as reason
            FROM unnest(p_target_ids) AS requested_id
            LEFT JOIN api_keys k ON k.key_id::TEXT = requested_id;
        
        ELSE
            -- Default case for other target types
            RETURN QUERY
            SELECT 
                requested_id::TEXT as target_id,
                TRUE as eligible,
                'unknown'::VARCHAR(50) as current_status,
                'Default eligibility check'::TEXT as reason
            FROM unnest(p_target_ids) AS requested_id;
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Function to get active bulk operations summary
CREATE OR REPLACE FUNCTION get_active_bulk_operations_summary() 
RETURNS TABLE(
    total_active INTEGER,
    pending_operations INTEGER,
    running_operations INTEGER,
    operations_requiring_approval INTEGER,
    avg_progress DECIMAL(5,2),
    total_items_processing INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_active,
        COUNT(*) FILTER (WHERE status = 'pending')::INTEGER as pending_operations,
        COUNT(*) FILTER (WHERE status = 'running')::INTEGER as running_operations,
        COUNT(*) FILTER (WHERE requires_approval = true AND status = 'pending')::INTEGER as operations_requiring_approval,
        COALESCE(AVG(progress_percentage), 0)::DECIMAL(5,2) as avg_progress,
        COALESCE(SUM(total_count) FILTER (WHERE status IN ('running', 'pending')), 0)::INTEGER as total_items_processing
    FROM epic17_bulk_status_operations
    WHERE status IN ('pending', 'running', 'approved', 'validating');
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup completed bulk operations (for maintenance)
CREATE OR REPLACE FUNCTION cleanup_old_bulk_operations(p_retention_days INTEGER DEFAULT 90) 
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete old completed operations and their related data
    DELETE FROM epic17_bulk_status_operations 
    WHERE status IN ('completed', 'failed', 'cancelled')
        AND completed_at < NOW() - (p_retention_days || ' days')::INTERVAL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log cleanup operation
    INSERT INTO epic17_admin_tool_usage (
        usage_id, tool_name, action, used_by, records_affected, success
    ) VALUES (
        gen_random_uuid(), 'bulk_operations', 'cleanup_old_operations', 'system', deleted_count, true
    );
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-approve low-risk operations
CREATE OR REPLACE FUNCTION auto_approve_low_risk_operations() RETURNS INTEGER AS $$
DECLARE
    approved_count INTEGER := 0;
    operation_record RECORD;
BEGIN
    -- Find operations that qualify for auto-approval
    FOR operation_record IN
        SELECT o.operation_id, o.total_count, o.operation_type, o.target_type
        FROM epic17_bulk_status_operations o
        JOIN epic17_bulk_approval_requests ar ON ar.operation_id = o.operation_id
        WHERE o.status = 'pending' 
            AND o.requires_approval = true
            AND ar.status = 'pending'
            AND o.total_count <= 100  -- Small operations
            AND o.operation_type IN ('suspend', 'activate')  -- Low-risk operations
            AND o.target_type = 'api_keys'
    LOOP
        -- Auto-approve the operation
        UPDATE epic17_bulk_approval_requests 
        SET 
            status = 'approved',
            approved_by = 'system_auto_approval',
            approved_at = NOW(),
            approvals_received = approval_required
        WHERE operation_id = operation_record.operation_id;
        
        -- Update operation status
        UPDATE epic17_bulk_status_operations
        SET 
            status = 'approved',
            approved_by = 'system_auto_approval',
            approved_at = NOW()
        WHERE operation_id = operation_record.operation_id;
        
        approved_count := approved_count + 1;
    END LOOP;
    
    RETURN approved_count;
END;
$$ LANGUAGE plpgsql;

-- Insert some default bulk operation templates
INSERT INTO epic17_bulk_operation_templates (
    template_id, template_name, description, operation_type, target_type,
    default_batch_size, category, risk_level, created_by, is_system_template,
    default_filters, safety_checks, approval_settings
) VALUES 
(
    gen_random_uuid(),
    'Suspend Inactive API Keys',
    'Suspend API keys that have not been used in the last 90 days',
    'suspend',
    'api_keys',
    100,
    'maintenance',
    'low',
    'system',
    true,
    '{"last_used_before": "90_days_ago", "current_status": ["active"]}',
    '[{"checkName": "usage_validation", "enabled": true}]',
    '{"requireApproval": false, "autoApproveThreshold": 1000}'
),
(
    gen_random_uuid(),
    'Revoke Compromised API Keys',
    'Emergency revocation of potentially compromised API keys',
    'revoke',
    'api_keys',
    50,
    'security',
    'high',
    'system',
    true,
    '{"tags": ["compromised", "security_incident"]}',
    '[{"checkName": "security_validation", "enabled": true}]',
    '{"requireApproval": true, "approvalRequired": 2}'
),
(
    gen_random_uuid(),
    'Archive Expired API Keys',
    'Archive API keys that have passed their expiration date',
    'archive',
    'api_keys',
    200,
    'maintenance',
    'low',
    'system',
    true,
    '{"current_status": ["expired"], "expires_before": "now"}',
    '[{"checkName": "expiration_validation", "enabled": true}]',
    '{"requireApproval": false, "autoApproveThreshold": 5000}'
),
(
    gen_random_uuid(),
    'Activate Pending User Accounts',
    'Batch activation of user accounts pending approval',
    'activate',
    'user_accounts',
    75,
    'user_management',
    'medium',
    'system',
    true,
    '{"current_status": ["pending_activation"]}',
    '[{"checkName": "user_validation", "enabled": true}]',
    '{"requireApproval": true, "approvalRequired": 1}'
)
ON CONFLICT (template_id) DO NOTHING;

-- Create indexes for better performance on large datasets
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_epic17_bulk_ops_recent_active 
    ON epic17_bulk_status_operations (created_at DESC, status) 
    WHERE status IN ('pending', 'running', 'approved') AND created_at >= NOW() - INTERVAL '7 days';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_epic17_results_recent_errors 
    ON epic17_bulk_operation_results (processed_at DESC, operation_id, error_type) 
    WHERE success = FALSE AND processed_at >= NOW() - INTERVAL '24 hours';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_epic17_approvals_pending_urgent 
    ON epic17_bulk_approval_requests (expires_at ASC, status) 
    WHERE status = 'pending' AND expires_at <= NOW() + INTERVAL '4 hours';

-- Create a comprehensive bulk operations dashboard view
CREATE VIEW epic17_bulk_operations_dashboard AS
SELECT 
    -- Current active operations
    (SELECT COUNT(*) FROM epic17_bulk_status_operations WHERE status IN ('pending', 'running', 'approved')) as active_operations,
    
    -- Operations needing attention
    (SELECT COUNT(*) FROM epic17_bulk_status_operations 
     WHERE requires_approval = true AND status = 'pending') as pending_approvals,
    
    -- Today's activity
    (SELECT COUNT(*) FROM epic17_bulk_status_operations 
     WHERE created_at >= CURRENT_DATE) as operations_today,
    
    -- Success metrics
    (SELECT COALESCE(AVG(CASE WHEN processed_count > 0 THEN (success_count::DECIMAL / processed_count * 100) ELSE 0 END), 0)
     FROM epic17_bulk_status_operations 
     WHERE completed_at >= NOW() - INTERVAL '24 hours' AND status = 'completed') as avg_success_rate_24h,
    
    -- Performance metrics
    (SELECT COALESCE(AVG(throughput), 0) 
     FROM epic17_bulk_status_operations 
     WHERE status = 'running' AND throughput > 0) as avg_current_throughput,
    
    -- Error analysis
    (SELECT COUNT(*) FROM epic17_bulk_operation_results 
     WHERE processed_at >= NOW() - INTERVAL '24 hours' AND success = FALSE) as errors_24h,
    
    -- Template usage
    (SELECT COUNT(*) FROM epic17_bulk_operation_templates WHERE is_active = true) as active_templates,
    
    -- Rollback activity
    (SELECT COUNT(*) FROM epic17_bulk_rollback_operations 
     WHERE initiated_at >= NOW() - INTERVAL '7 days') as rollbacks_this_week;

-- Add table comments for documentation
COMMENT ON TABLE epic17_bulk_status_operations IS 'Main tracking table for bulk status change operations';
COMMENT ON TABLE epic17_bulk_approval_requests IS 'Approval workflow management for bulk operations';
COMMENT ON TABLE epic17_bulk_approvals IS 'Individual approvals within approval requests';
COMMENT ON TABLE epic17_bulk_dry_runs IS 'Dry run results and impact analysis for bulk operations';
COMMENT ON TABLE epic17_bulk_operation_results IS 'Detailed results for individual items within bulk operations';
COMMENT ON TABLE epic17_bulk_rollback_operations IS 'Rollback operations for bulk status changes';
COMMENT ON TABLE epic17_bulk_operation_filters IS 'Filter criteria and target selection for bulk operations';
COMMENT ON TABLE epic17_bulk_operation_templates IS 'Pre-configured templates for common bulk operations';

-- Create triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_epic17_bulk_timestamp() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_epic17_bulk_status_operations_timestamp
    BEFORE UPDATE ON epic17_bulk_status_operations
    FOR EACH ROW EXECUTE FUNCTION update_epic17_bulk_timestamp();

CREATE TRIGGER update_epic17_bulk_operation_templates_timestamp
    BEFORE UPDATE ON epic17_bulk_operation_templates
    FOR EACH ROW EXECUTE FUNCTION update_epic17_bulk_timestamp();

-- Grant appropriate permissions
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO epic17_bulk_service;
-- GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO epic17_bulk_service;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO epic17_bulk_service;

-- Final setup completion message
DO $$
BEGIN
    RAISE NOTICE '✅ Epic 17 Bulk Status Changes database schema created successfully';
    RAISE NOTICE '📊 Tables created: 8 core tables + 1 dashboard view';
    RAISE NOTICE '🔧 Functions created: 4 management functions';
    RAISE NOTICE '📋 Templates: 4 default operation templates installed';
    RAISE NOTICE '⚡ Features: Approval workflows, rollback support, dry runs, impact analysis';
    RAISE NOTICE '📈 Monitoring: Comprehensive progress tracking and performance metrics';
    RAISE NOTICE '🚀 Bulk operations system ready for Epic 17 API management';
END $$;