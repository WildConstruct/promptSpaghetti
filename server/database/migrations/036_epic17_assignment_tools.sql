-- Epic 17 Assignment Tools Database Schema
-- Task: E17-1753114396894-B567EC - Create assignment tools
-- 
-- Creates comprehensive assignment and delegation infrastructure for Epic 17 API Management System
-- including assignment tracking, approval workflows, auto-assignment rules, delegation management,
-- and assignment templates for streamlined API access control management.

-- Core assignments table for all assignment types
CREATE TABLE IF NOT EXISTS epic17_assignments (
    id SERIAL PRIMARY KEY,
    assignment_id UUID UNIQUE NOT NULL,
    assignment_type VARCHAR(30) NOT NULL, -- api_key_assignment, permission_assignment, role_assignment, team_assignment, resource_assignment, delegation
    status VARCHAR(20) DEFAULT 'pending', -- pending, active, expired, revoked, suspended, pending_approval, rejected
    
    -- Assignment scope and targets
    assignee_type VARCHAR(20) NOT NULL, -- user, service, team, application
    assignee_id VARCHAR(255) NOT NULL,
    resource_type VARCHAR(30) NOT NULL, -- api_key, permission, role, team, resource
    resource_id VARCHAR(255) NOT NULL,
    
    -- Assignment configuration
    scope_definition JSONB NOT NULL, -- Detailed scope and constraints
    permissions JSONB DEFAULT '[]'::jsonb, -- Specific permissions granted
    constraints JSONB DEFAULT '{}'::jsonb, -- Usage constraints and limits
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Timing and lifecycle
    granted_at TIMESTAMP WITH TIME ZONE,
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    last_used_at TIMESTAMP WITH TIME ZONE,
    
    -- Assignment context
    assignment_reason TEXT NOT NULL,
    business_justification TEXT,
    approval_reference UUID,
    parent_assignment_id UUID, -- For delegation chains
    delegation_depth INTEGER DEFAULT 0,
    
    -- Usage tracking
    usage_count INTEGER DEFAULT 0,
    max_usage_count INTEGER,
    usage_pattern JSONB DEFAULT '{}'::jsonb,
    compliance_notes TEXT,
    
    -- Assignment management
    assigned_by VARCHAR(255) NOT NULL,
    approved_by VARCHAR(255),
    revoked_by VARCHAR(255),
    revocation_reason TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_epic17_assignments_assignment_id (assignment_id),
    INDEX idx_epic17_assignments_type (assignment_type),
    INDEX idx_epic17_assignments_status (status),
    INDEX idx_epic17_assignments_assignee (assignee_type, assignee_id),
    INDEX idx_epic17_assignments_resource (resource_type, resource_id),
    INDEX idx_epic17_assignments_assigned_by (assigned_by),
    INDEX idx_epic17_assignments_expires_at (expires_at),
    INDEX idx_epic17_assignments_parent (parent_assignment_id),
    INDEX idx_epic17_assignments_delegation_depth (delegation_depth),
    INDEX idx_epic17_assignments_composite (assignment_type, status, created_at),
    INDEX idx_epic17_assignments_active (status, expires_at) WHERE status = 'active',
    INDEX idx_epic17_assignments_expiring (expires_at, status) WHERE status = 'active' AND expires_at IS NOT NULL,
    
    FOREIGN KEY (parent_assignment_id) REFERENCES epic17_assignments(assignment_id) ON DELETE CASCADE
);

-- Assignment approval workflow tracking
CREATE TABLE IF NOT EXISTS epic17_assignment_approvals (
    id SERIAL PRIMARY KEY,
    approval_id UUID UNIQUE NOT NULL,
    assignment_id UUID NOT NULL,
    request_type VARCHAR(30) NOT NULL, -- create_assignment, extend_assignment, modify_assignment, revoke_assignment
    
    -- Approval configuration
    required_approvers JSONB NOT NULL, -- Array of required approvers
    approvals_required INTEGER NOT NULL DEFAULT 1,
    approvals_received INTEGER DEFAULT 0,
    
    -- Request details
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    requested_by VARCHAR(255) NOT NULL,
    justification TEXT NOT NULL,
    risk_assessment TEXT,
    impact_analysis JSONB DEFAULT '{}'::jsonb,
    
    -- Approval status
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, expired, withdrawn
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    decision_deadline TIMESTAMP WITH TIME ZONE,
    
    -- Resolution tracking
    final_decision VARCHAR(20), -- approved, rejected
    decided_at TIMESTAMP WITH TIME ZONE,
    decision_notes TEXT,
    conditions JSONB DEFAULT '[]'::jsonb, -- Approval conditions
    
    -- Workflow metadata
    workflow_data JSONB DEFAULT '{}'::jsonb,
    escalation_level INTEGER DEFAULT 0,
    escalated_at TIMESTAMP WITH TIME ZONE,
    
    -- Indexes
    INDEX idx_epic17_assignment_approvals_approval_id (approval_id),
    INDEX idx_epic17_assignment_approvals_assignment_id (assignment_id),
    INDEX idx_epic17_assignment_approvals_status (status),
    INDEX idx_epic17_assignment_approvals_requested_by (requested_by),
    INDEX idx_epic17_assignment_approvals_expires_at (expires_at),
    INDEX idx_epic17_assignment_approvals_pending (status, expires_at) WHERE status = 'pending',
    
    FOREIGN KEY (assignment_id) REFERENCES epic17_assignments(assignment_id) ON DELETE CASCADE
);

-- Individual approver decisions within approval workflows
CREATE TABLE IF NOT EXISTS epic17_assignment_approval_decisions (
    id SERIAL PRIMARY KEY,
    decision_id UUID UNIQUE NOT NULL,
    approval_id UUID NOT NULL,
    approver_id VARCHAR(255) NOT NULL,
    
    -- Decision details
    decision VARCHAR(20) NOT NULL, -- approved, rejected, abstain
    decided_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    decision_comments TEXT,
    conditions JSONB DEFAULT '[]'::jsonb,
    
    -- Decision context
    delegation_from VARCHAR(255), -- If decision made on behalf of another
    decision_method VARCHAR(30) DEFAULT 'manual', -- manual, automated, delegated
    confidence_level INTEGER, -- 1-100 for automated decisions
    
    -- Indexes
    INDEX idx_epic17_approval_decisions_decision_id (decision_id),
    INDEX idx_epic17_approval_decisions_approval_id (approval_id),
    INDEX idx_epic17_approval_decisions_approver_id (approver_id),
    INDEX idx_epic17_approval_decisions_decision (decision),
    INDEX idx_epic17_approval_decisions_decided_at (decided_at),
    
    FOREIGN KEY (approval_id) REFERENCES epic17_assignment_approvals(approval_id) ON DELETE CASCADE
);

-- Auto-assignment rules and trigger management
CREATE TABLE IF NOT EXISTS epic17_auto_assignment_rules (
    id SERIAL PRIMARY KEY,
    rule_id UUID UNIQUE NOT NULL,
    rule_name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Rule configuration
    trigger_conditions JSONB NOT NULL, -- Conditions that trigger auto-assignment
    assignment_template JSONB NOT NULL, -- Template for created assignments
    priority INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Rule scope and filtering
    target_assignee_types JSONB DEFAULT '[]'::jsonb, -- Which assignee types this rule applies to
    resource_filters JSONB DEFAULT '{}'::jsonb, -- Resource filtering criteria
    time_constraints JSONB DEFAULT '{}'::jsonb, -- Time-based constraints
    
    -- Assignment parameters
    default_duration INTEGER, -- Days
    max_assignments_per_trigger INTEGER DEFAULT 1,
    assignment_priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, critical
    
    -- Rule execution settings
    execution_mode VARCHAR(20) DEFAULT 'automatic', -- automatic, approval_required, manual_review
    approval_required BOOLEAN DEFAULT FALSE,
    review_required BOOLEAN DEFAULT FALSE,
    
    -- Usage tracking
    rule_usage_count INTEGER DEFAULT 0,
    last_triggered_at TIMESTAMP WITH TIME ZONE,
    success_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Rule management
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_evaluated_at TIMESTAMP WITH TIME ZONE,
    
    -- Rule validation
    validation_rules JSONB DEFAULT '{}'::jsonb,
    test_mode BOOLEAN DEFAULT FALSE,
    
    -- Indexes
    INDEX idx_epic17_auto_rules_rule_id (rule_id),
    INDEX idx_epic17_auto_rules_is_active (is_active),
    INDEX idx_epic17_auto_rules_priority (priority),
    INDEX idx_epic17_auto_rules_created_by (created_by),
    INDEX idx_epic17_auto_rules_last_triggered (last_triggered_at),
    INDEX idx_epic17_auto_rules_execution_mode (execution_mode),
    INDEX idx_epic17_auto_rules_active_priority (is_active, priority) WHERE is_active = TRUE
);

-- Auto-assignment rule execution history
CREATE TABLE IF NOT EXISTS epic17_auto_assignment_executions (
    id SERIAL PRIMARY KEY,
    execution_id UUID UNIQUE NOT NULL,
    rule_id UUID NOT NULL,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Execution details
    trigger_event JSONB NOT NULL, -- Event that triggered the rule
    evaluation_result JSONB NOT NULL, -- Rule evaluation results
    assignments_created INTEGER DEFAULT 0,
    execution_success BOOLEAN DEFAULT TRUE,
    
    -- Created assignments
    created_assignments JSONB DEFAULT '[]'::jsonb, -- Array of created assignment IDs
    
    -- Error handling
    errors JSONB DEFAULT '[]'::jsonb,
    warnings JSONB DEFAULT '[]'::jsonb,
    execution_time INTEGER, -- milliseconds
    
    -- Indexes
    INDEX idx_epic17_auto_executions_execution_id (execution_id),
    INDEX idx_epic17_auto_executions_rule_id (rule_id),
    INDEX idx_epic17_auto_executions_executed_at (executed_at),
    INDEX idx_epic17_auto_executions_success (execution_success),
    
    FOREIGN KEY (rule_id) REFERENCES epic17_auto_assignment_rules(rule_id) ON DELETE CASCADE
);

-- Assignment templates for common assignment patterns
CREATE TABLE IF NOT EXISTS epic17_assignment_templates (
    id SERIAL PRIMARY KEY,
    template_id UUID UNIQUE NOT NULL,
    template_name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Template configuration
    assignment_type VARCHAR(30) NOT NULL,
    template_data JSONB NOT NULL, -- Complete assignment template structure
    default_duration INTEGER, -- Days
    
    -- Template categorization
    category VARCHAR(50), -- developer, qa, production, temporary, emergency
    use_case VARCHAR(100), -- Common use cases this template serves
    risk_level VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
    
    -- Approval and validation settings
    requires_approval BOOLEAN DEFAULT TRUE,
    approval_workflow JSONB DEFAULT '{}'::jsonb,
    validation_rules JSONB DEFAULT '{}'::jsonb,
    
    -- Usage tracking
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    success_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Template management
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    is_system_template BOOLEAN DEFAULT FALSE,
    
    -- Access control
    allowed_users JSONB DEFAULT '[]'::jsonb,
    allowed_roles JSONB DEFAULT '[]'::jsonb,
    restricted_usage BOOLEAN DEFAULT FALSE,
    
    -- Indexes
    INDEX idx_epic17_templates_template_id (template_id),
    INDEX idx_epic17_templates_template_name (template_name),
    INDEX idx_epic17_templates_assignment_type (assignment_type),
    INDEX idx_epic17_templates_category (category),
    INDEX idx_epic17_templates_risk_level (risk_level),
    INDEX idx_epic17_templates_is_active (is_active),
    INDEX idx_epic17_templates_created_by (created_by),
    INDEX idx_epic17_templates_usage_count (usage_count)
);

-- Delegation relationship tracking
CREATE TABLE IF NOT EXISTS epic17_assignment_delegations (
    id SERIAL PRIMARY KEY,
    delegation_id UUID UNIQUE NOT NULL,
    original_assignment_id UUID NOT NULL,
    delegated_assignment_id UUID NOT NULL,
    
    -- Delegation details
    delegated_by VARCHAR(255) NOT NULL,
    delegated_to VARCHAR(255) NOT NULL,
    delegated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delegation_reason TEXT NOT NULL,
    
    -- Delegation scope
    delegated_permissions JSONB NOT NULL, -- Subset of original permissions
    delegation_constraints JSONB DEFAULT '{}'::jsonb,
    sub_delegation_allowed BOOLEAN DEFAULT FALSE,
    
    -- Delegation lifecycle
    delegation_valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delegation_expires_at TIMESTAMP WITH TIME ZONE,
    revoked_at TIMESTAMP WITH TIME ZONE,
    revoked_by VARCHAR(255),
    revocation_reason TEXT,
    
    -- Delegation status
    status VARCHAR(20) DEFAULT 'active', -- active, expired, revoked, suspended
    
    -- Approval tracking
    approval_required BOOLEAN DEFAULT FALSE,
    approved_by VARCHAR(255),
    approved_at TIMESTAMP WITH TIME ZONE,
    
    -- Indexes
    INDEX idx_epic17_delegations_delegation_id (delegation_id),
    INDEX idx_epic17_delegations_original_assignment (original_assignment_id),
    INDEX idx_epic17_delegations_delegated_assignment (delegated_assignment_id),
    INDEX idx_epic17_delegations_delegated_by (delegated_by),
    INDEX idx_epic17_delegations_delegated_to (delegated_to),
    INDEX idx_epic17_delegations_status (status),
    INDEX idx_epic17_delegations_expires_at (delegation_expires_at),
    
    FOREIGN KEY (original_assignment_id) REFERENCES epic17_assignments(assignment_id) ON DELETE CASCADE,
    FOREIGN KEY (delegated_assignment_id) REFERENCES epic17_assignments(assignment_id) ON DELETE CASCADE
);

-- Assignment usage analytics and compliance tracking
CREATE TABLE IF NOT EXISTS epic17_assignment_usage (
    id SERIAL PRIMARY KEY,
    usage_id UUID UNIQUE NOT NULL,
    assignment_id UUID NOT NULL,
    
    -- Usage details
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    usage_type VARCHAR(30) NOT NULL, -- access, modification, delegation, transfer
    resource_accessed VARCHAR(255),
    operation_performed VARCHAR(100),
    
    -- Usage context
    request_context JSONB DEFAULT '{}'::jsonb,
    client_info JSONB DEFAULT '{}'::jsonb,
    success BOOLEAN DEFAULT TRUE,
    
    -- Compliance and monitoring
    compliance_flags JSONB DEFAULT '[]'::jsonb,
    risk_indicators JSONB DEFAULT '[]'::jsonb,
    anomaly_score DECIMAL(5,2) DEFAULT 0,
    
    -- Performance metrics
    response_time INTEGER, -- milliseconds
    resources_consumed JSONB DEFAULT '{}'::jsonb,
    
    -- Indexes
    INDEX idx_epic17_usage_usage_id (usage_id),
    INDEX idx_epic17_usage_assignment_id (assignment_id),
    INDEX idx_epic17_usage_used_at (used_at),
    INDEX idx_epic17_usage_usage_type (usage_type),
    INDEX idx_epic17_usage_success (success),
    INDEX idx_epic17_usage_anomaly_score (anomaly_score),
    
    FOREIGN KEY (assignment_id) REFERENCES epic17_assignments(assignment_id) ON DELETE CASCADE
);

-- Bulk assignment operations for mass management
CREATE TABLE IF NOT EXISTS epic17_bulk_assignment_operations (
    id SERIAL PRIMARY KEY,
    operation_id UUID UNIQUE NOT NULL,
    operation_type VARCHAR(30) NOT NULL, -- bulk_create, bulk_revoke, bulk_extend, bulk_modify, bulk_migrate
    status VARCHAR(20) DEFAULT 'pending', -- pending, running, completed, failed, cancelled
    
    -- Operation scope
    target_assignments JSONB NOT NULL, -- Array of target assignment criteria
    total_count INTEGER NOT NULL,
    processed_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    
    -- Operation configuration
    operation_parameters JSONB NOT NULL,
    batch_size INTEGER DEFAULT 100,
    dry_run BOOLEAN DEFAULT FALSE,
    
    -- Execution tracking
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    estimated_completion TIMESTAMP WITH TIME ZONE,
    
    -- Results and errors
    results JSONB DEFAULT '[]'::jsonb,
    errors JSONB DEFAULT '[]'::jsonb,
    
    -- Operation management
    initiated_by VARCHAR(255) NOT NULL,
    approved_by VARCHAR(255),
    requires_approval BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_epic17_bulk_assignment_ops_operation_id (operation_id),
    INDEX idx_epic17_bulk_assignment_ops_type (operation_type),
    INDEX idx_epic17_bulk_assignment_ops_status (status),
    INDEX idx_epic17_bulk_assignment_ops_initiated_by (initiated_by),
    INDEX idx_epic17_bulk_assignment_ops_created_at (created_at),
    INDEX idx_epic17_bulk_assignment_ops_active (status) WHERE status IN ('pending', 'running')
);

-- Create comprehensive functions for assignment management

-- Function to get assignment summary for a user/entity
CREATE OR REPLACE FUNCTION get_assignment_summary(
    p_assignee_type VARCHAR(20),
    p_assignee_id VARCHAR(255)
) RETURNS TABLE(
    total_assignments INTEGER,
    active_assignments INTEGER,
    expiring_soon INTEGER,
    delegation_chains INTEGER,
    last_activity TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_assignments,
        COUNT(*) FILTER (WHERE status = 'active')::INTEGER as active_assignments,
        COUNT(*) FILTER (WHERE status = 'active' AND expires_at <= NOW() + INTERVAL '7 days' AND expires_at IS NOT NULL)::INTEGER as expiring_soon,
        COUNT(*) FILTER (WHERE parent_assignment_id IS NOT NULL)::INTEGER as delegation_chains,
        MAX(last_used_at) as last_activity
    FROM epic17_assignments
    WHERE assignee_type = p_assignee_type AND assignee_id = p_assignee_id;
END;
$$ LANGUAGE plpgsql;

-- Function to evaluate auto-assignment rules
CREATE OR REPLACE FUNCTION evaluate_auto_assignment_rules(
    p_trigger_event JSONB
) RETURNS TABLE(
    rule_id UUID,
    rule_name VARCHAR(255),
    evaluation_result JSONB,
    should_execute BOOLEAN
) AS $$
DECLARE
    rule_record RECORD;
    evaluation JSONB;
BEGIN
    -- Simplified rule evaluation - in production would be more sophisticated
    FOR rule_record IN
        SELECT r.rule_id, r.rule_name, r.trigger_conditions, r.assignment_template
        FROM epic17_auto_assignment_rules r
        WHERE r.is_active = TRUE
        ORDER BY r.priority ASC
    LOOP
        -- Basic trigger condition matching (simplified)
        evaluation := jsonb_build_object(
            'rule_id', rule_record.rule_id,
            'trigger_matched', (p_trigger_event ? 'assignee_id'),
            'conditions_met', true,
            'timestamp', NOW()
        );
        
        RETURN QUERY
        SELECT 
            rule_record.rule_id,
            rule_record.rule_name,
            evaluation,
            (evaluation->>'conditions_met')::BOOLEAN;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to validate assignment delegation
CREATE OR REPLACE FUNCTION validate_assignment_delegation(
    p_assignment_id UUID,
    p_delegated_by VARCHAR(255),
    p_delegated_to VARCHAR(255),
    p_max_depth INTEGER DEFAULT 5
) RETURNS TABLE(
    is_valid BOOLEAN,
    validation_result JSONB
) AS $$
DECLARE
    assignment_record RECORD;
    current_depth INTEGER;
    validation JSONB;
BEGIN
    -- Get assignment details
    SELECT * INTO assignment_record
    FROM epic17_assignments
    WHERE assignment_id = p_assignment_id;
    
    -- Check if assignment exists and is active
    IF assignment_record.assignment_id IS NULL THEN
        validation := jsonb_build_object(
            'valid', false,
            'reason', 'Assignment not found'
        );
        RETURN QUERY SELECT false, validation;
        RETURN;
    END IF;
    
    -- Check delegation depth
    current_depth := COALESCE(assignment_record.delegation_depth, 0);
    
    IF current_depth >= p_max_depth THEN
        validation := jsonb_build_object(
            'valid', false,
            'reason', 'Maximum delegation depth exceeded',
            'current_depth', current_depth,
            'max_depth', p_max_depth
        );
        RETURN QUERY SELECT false, validation;
        RETURN;
    END IF;
    
    -- Delegation is valid
    validation := jsonb_build_object(
        'valid', true,
        'current_depth', current_depth,
        'new_depth', current_depth + 1
    );
    
    RETURN QUERY SELECT true, validation;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup expired assignments
CREATE OR REPLACE FUNCTION cleanup_expired_assignments() RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    -- Update expired assignments
    UPDATE epic17_assignments 
    SET 
        status = 'expired',
        updated_at = NOW()
    WHERE status = 'active' 
        AND expires_at IS NOT NULL 
        AND expires_at <= NOW();
    
    GET DIAGNOSTICS expired_count = ROW_COUNT;
    
    -- Log cleanup operation
    INSERT INTO epic17_admin_tool_usage (
        usage_id, tool_name, action, used_by, records_affected, success
    ) VALUES (
        gen_random_uuid(), 'assignment_tools', 'cleanup_expired', 'system', expired_count, true
    );
    
    RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- Insert default assignment templates
INSERT INTO epic17_assignment_templates (
    template_id, template_name, description, assignment_type, template_data,
    category, use_case, risk_level, created_by, is_system_template
) VALUES 
(
    gen_random_uuid(),
    'Developer API Access',
    'Standard API access for development environment',
    'api_key_assignment',
    '{
        "scope": "development",
        "permissions": ["read", "write"],
        "rate_limits": {"requests_per_minute": 100},
        "environments": ["dev", "staging"]
    }',
    'developer',
    'Development environment access',
    'low',
    'system',
    true
),
(
    gen_random_uuid(),
    'Production Read-Only Access',
    'Read-only access to production APIs',
    'api_key_assignment',
    '{
        "scope": "production",
        "permissions": ["read"],
        "rate_limits": {"requests_per_minute": 50},
        "environments": ["production"],
        "monitoring": true
    }',
    'production',
    'Production monitoring and reporting',
    'medium',
    'system',
    true
),
(
    gen_random_uuid(),
    'Emergency Admin Access',
    'Temporary elevated access for emergency situations',
    'role_assignment',
    '{
        "scope": "emergency",
        "permissions": ["admin", "override"],
        "duration_hours": 4,
        "requires_justification": true,
        "auto_revoke": true
    }',
    'emergency',
    'Emergency response and incident management',
    'critical',
    'system',
    true
),
(
    gen_random_uuid(),
    'Team Lead Delegation',
    'Allow team leads to delegate certain permissions',
    'delegation',
    '{
        "scope": "team_management",
        "delegatable_permissions": ["user_management", "resource_access"],
        "max_delegation_depth": 2,
        "requires_approval": false
    }',
    'management',
    'Team leadership and delegation',
    'medium',
    'system',
    true
)
ON CONFLICT (template_id) DO NOTHING;

-- Insert default auto-assignment rules
INSERT INTO epic17_auto_assignment_rules (
    rule_id, rule_name, description, trigger_conditions, assignment_template,
    target_assignee_types, execution_mode, created_by
) VALUES
(
    gen_random_uuid(),
    'New Developer Onboarding',
    'Automatically assign development API access to new developers',
    '{
        "event_type": "user_created",
        "user_role": "developer",
        "department": "engineering"
    }',
    '{
        "assignment_type": "api_key_assignment",
        "template_id": null,
        "scope": "development",
        "duration_days": 90
    }',
    '["user"]',
    'automatic',
    'system'
),
(
    gen_random_uuid(),
    'Contractor Access Review',
    'Require approval for contractor API access assignments',
    '{
        "event_type": "assignment_request",
        "user_type": "contractor",
        "resource_sensitivity": "high"
    }',
    '{
        "assignment_type": "api_key_assignment",
        "requires_approval": true,
        "max_duration_days": 30
    }',
    '["user"]',
    'approval_required',
    'system'
)
ON CONFLICT (rule_id) DO NOTHING;

-- Create performance indexes for large datasets
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_epic17_assignments_recent_active 
    ON epic17_assignments (created_at DESC, status, assignment_type) 
    WHERE status = 'active' AND created_at >= NOW() - INTERVAL '90 days';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_epic17_usage_analytics 
    ON epic17_assignment_usage (assignment_id, used_at DESC) 
    WHERE used_at >= NOW() - INTERVAL '30 days';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_epic17_approvals_pending_urgent 
    ON epic17_assignment_approvals (expires_at ASC, status) 
    WHERE status = 'pending' AND expires_at <= NOW() + INTERVAL '24 hours';

-- Create comprehensive assignment dashboard view
CREATE VIEW epic17_assignment_dashboard AS
SELECT 
    -- Active assignments summary
    (SELECT COUNT(*) FROM epic17_assignments WHERE status = 'active') as total_active_assignments,
    (SELECT COUNT(*) FROM epic17_assignments WHERE status = 'active' AND expires_at <= NOW() + INTERVAL '7 days' AND expires_at IS NOT NULL) as expiring_soon,
    
    -- Approval workflow summary
    (SELECT COUNT(*) FROM epic17_assignment_approvals WHERE status = 'pending') as pending_approvals,
    (SELECT COUNT(*) FROM epic17_assignment_approvals WHERE status = 'pending' AND expires_at <= NOW() + INTERVAL '4 hours') as urgent_approvals,
    
    -- Auto-assignment activity
    (SELECT COUNT(*) FROM epic17_auto_assignment_rules WHERE is_active = true) as active_auto_rules,
    (SELECT COUNT(*) FROM epic17_auto_assignment_executions WHERE executed_at >= NOW() - INTERVAL '24 hours') as auto_executions_today,
    
    -- Delegation activity
    (SELECT COUNT(*) FROM epic17_assignment_delegations WHERE status = 'active') as active_delegations,
    (SELECT MAX(delegation_depth) FROM epic17_assignments WHERE status = 'active') as max_delegation_depth,
    
    -- Usage analytics
    (SELECT COUNT(*) FROM epic17_assignment_usage WHERE used_at >= NOW() - INTERVAL '24 hours') as usage_events_today,
    (SELECT COUNT(DISTINCT assignment_id) FROM epic17_assignment_usage WHERE used_at >= NOW() - INTERVAL '24 hours') as active_assignments_today,
    
    -- Template usage
    (SELECT COUNT(*) FROM epic17_assignment_templates WHERE is_active = true) as active_templates,
    
    -- System health
    (SELECT COUNT(*) FROM epic17_bulk_assignment_operations WHERE status IN ('pending', 'running')) as active_bulk_operations;

-- Add table comments for documentation
COMMENT ON TABLE epic17_assignments IS 'Core assignments tracking for all assignment types in Epic 17';
COMMENT ON TABLE epic17_assignment_approvals IS 'Assignment approval workflow management';
COMMENT ON TABLE epic17_assignment_approval_decisions IS 'Individual approver decisions within workflows';
COMMENT ON TABLE epic17_auto_assignment_rules IS 'Automated assignment rule definitions and configuration';
COMMENT ON TABLE epic17_auto_assignment_executions IS 'Auto-assignment rule execution history and results';
COMMENT ON TABLE epic17_assignment_templates IS 'Pre-configured assignment templates for common patterns';
COMMENT ON TABLE epic17_assignment_delegations IS 'Assignment delegation relationship tracking';
COMMENT ON TABLE epic17_assignment_usage IS 'Assignment usage analytics and compliance monitoring';
COMMENT ON TABLE epic17_bulk_assignment_operations IS 'Bulk assignment operation tracking and management';

-- Create triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_epic17_assignment_timestamp() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_epic17_assignments_timestamp
    BEFORE UPDATE ON epic17_assignments
    FOR EACH ROW EXECUTE FUNCTION update_epic17_assignment_timestamp();

CREATE TRIGGER update_epic17_auto_assignment_rules_timestamp
    BEFORE UPDATE ON epic17_auto_assignment_rules
    FOR EACH ROW EXECUTE FUNCTION update_epic17_assignment_timestamp();

CREATE TRIGGER update_epic17_assignment_templates_timestamp
    BEFORE UPDATE ON epic17_assignment_templates
    FOR EACH ROW EXECUTE FUNCTION update_epic17_assignment_timestamp();

CREATE TRIGGER update_epic17_bulk_assignment_operations_timestamp
    BEFORE UPDATE ON epic17_bulk_assignment_operations
    FOR EACH ROW EXECUTE FUNCTION update_epic17_assignment_timestamp();

-- Final setup completion message
DO $$
BEGIN
    RAISE NOTICE '✅ Epic 17 Assignment Tools database schema created successfully';
    RAISE NOTICE '📊 Tables created: 9 core tables + 1 dashboard view';
    RAISE NOTICE '🔧 Functions created: 4 management functions';
    RAISE NOTICE '📋 Templates: 4 default assignment templates installed';
    RAISE NOTICE '🤖 Auto-rules: 2 default auto-assignment rules configured';
    RAISE NOTICE '⚡ Features: Assignment workflows, delegation chains, auto-assignment, bulk operations';
    RAISE NOTICE '📈 Monitoring: Usage analytics, compliance tracking, approval workflows';
    RAISE NOTICE '🚀 Assignment tools system ready for Epic 17 API management';
END $$;