-- Epic 9.4.2 - Enhanced Approval System Migration
-- Advanced approval workflows with criteria, rules, and reviewer assignment

-- Create approval_criteria table for defining approval criteria
CREATE TABLE IF NOT EXISTS approval_criteria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    conditions JSONB DEFAULT '{}',
    weight INTEGER DEFAULT 1,
    is_required BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT criteria_name_not_empty CHECK (length(trim(name)) > 0),
    CONSTRAINT criteria_weight_positive CHECK (weight > 0),
    UNIQUE(workspace_id, name)
);

-- Create approval_rules table for defining approval workflows
CREATE TABLE IF NOT EXISTS approval_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    transition_id UUID NOT NULL REFERENCES workflow_transitions(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Reviewer assignment configuration
    reviewer_assignment_type VARCHAR(50) DEFAULT 'manual' CHECK (
        reviewer_assignment_type IN ('manual', 'automatic', 'role_based', 'round_robin')
    ),
    required_reviewers INTEGER DEFAULT 1,
    minimum_approvals INTEGER DEFAULT 1,
    allow_self_approval BOOLEAN DEFAULT FALSE,
    
    -- Criteria configuration
    criteria_ids JSONB DEFAULT '[]',
    require_all_criteria BOOLEAN DEFAULT TRUE,
    
    -- Timeout and escalation configuration
    approval_timeout_hours INTEGER DEFAULT 72,
    escalation_enabled BOOLEAN DEFAULT FALSE,
    escalation_after_hours INTEGER DEFAULT 24,
    escalation_reviewers JSONB DEFAULT '[]',
    
    -- Auto-approval configuration
    auto_approval_enabled BOOLEAN DEFAULT FALSE,
    auto_approval_conditions JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT rule_name_not_empty CHECK (length(trim(name)) > 0),
    CONSTRAINT required_reviewers_positive CHECK (required_reviewers > 0),
    CONSTRAINT minimum_approvals_positive CHECK (minimum_approvals > 0),
    CONSTRAINT minimum_approvals_le_required CHECK (minimum_approvals <= required_reviewers),
    CONSTRAINT timeout_positive CHECK (approval_timeout_hours > 0),
    CONSTRAINT escalation_timeout_positive CHECK (escalation_after_hours > 0),
    UNIQUE(workspace_id, transition_id, name)
);

-- Create approval_requests table for tracking approval requests
CREATE TABLE IF NOT EXISTS approval_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    rule_id UUID NOT NULL REFERENCES approval_rules(id) ON DELETE CASCADE,
    transition_id UUID NOT NULL REFERENCES workflow_transitions(id) ON DELETE CASCADE,
    requester_id VARCHAR(255) NOT NULL,
    
    -- Request details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    urgency VARCHAR(20) DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
    business_justification TEXT,
    
    -- Status and timeline
    status VARCHAR(20) DEFAULT 'pending' CHECK (
        status IN ('pending', 'in_review', 'approved', 'rejected', 'cancelled', 'expired')
    ),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Approval metadata
    current_approvals INTEGER DEFAULT 0,
    required_approvals INTEGER NOT NULL,
    approval_percentage DECIMAL(5,2) DEFAULT 0.0,
    
    -- Escalation tracking
    escalated_at TIMESTAMP WITH TIME ZONE,
    escalation_reason TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT request_title_not_empty CHECK (length(trim(title)) > 0),
    CONSTRAINT required_approvals_positive CHECK (required_approvals > 0),
    CONSTRAINT current_approvals_non_negative CHECK (current_approvals >= 0),
    CONSTRAINT approval_percentage_valid CHECK (approval_percentage >= 0 AND approval_percentage <= 100)
);

-- Create reviewer_assignments table for tracking reviewer assignments
CREATE TABLE IF NOT EXISTS reviewer_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    approval_request_id UUID NOT NULL REFERENCES approval_requests(id) ON DELETE CASCADE,
    reviewer_id VARCHAR(255) NOT NULL,
    assignment_type VARCHAR(20) DEFAULT 'primary' CHECK (
        assignment_type IN ('primary', 'secondary', 'escalated')
    ),
    assignment_reason TEXT,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notified_at TIMESTAMP WITH TIME ZONE,
    
    -- Review details
    status VARCHAR(20) DEFAULT 'pending' CHECK (
        status IN ('pending', 'reviewing', 'approved', 'rejected', 'abstained')
    ),
    review_started_at TIMESTAMP WITH TIME ZONE,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_comment TEXT,
    
    -- Criteria evaluation
    criteria_evaluations JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE(approval_request_id, reviewer_id)
);

-- Create approval_notifications table for tracking notifications
CREATE TABLE IF NOT EXISTS approval_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    approval_request_id UUID NOT NULL REFERENCES approval_requests(id) ON DELETE CASCADE,
    reviewer_id VARCHAR(255) NOT NULL,
    notification_type VARCHAR(50) NOT NULL CHECK (
        notification_type IN ('assignment', 'reminder', 'escalation', 'completion')
    ),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP WITH TIME ZONE,
    action_taken VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT notification_title_not_empty CHECK (length(trim(title)) > 0),
    CONSTRAINT notification_message_not_empty CHECK (length(trim(message)) > 0)
);

-- Create approval_templates table for reusable approval configurations
CREATE TABLE IF NOT EXISTS approval_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    
    -- Template configuration
    template_config JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    usage_count INTEGER DEFAULT 0,
    
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT template_name_not_empty CHECK (length(trim(name)) > 0),
    CONSTRAINT usage_count_non_negative CHECK (usage_count >= 0),
    UNIQUE(workspace_id, name)
);

-- Create approval_metrics table for tracking approval performance
CREATE TABLE IF NOT EXISTS approval_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    approval_request_id UUID NOT NULL REFERENCES approval_requests(id) ON DELETE CASCADE,
    
    -- Timing metrics
    time_to_first_review_hours DECIMAL(10,2),
    time_to_completion_hours DECIMAL(10,2),
    total_review_time_hours DECIMAL(10,2),
    
    -- Review metrics
    total_reviewers INTEGER,
    reviews_completed INTEGER,
    reviews_approved INTEGER,
    reviews_rejected INTEGER,
    reviews_abstained INTEGER,
    
    -- Efficiency metrics
    escalation_count INTEGER DEFAULT 0,
    revision_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    
    -- Quality metrics
    criteria_pass_rate DECIMAL(5,2),
    reviewer_satisfaction_score DECIMAL(3,2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT metrics_positive_values CHECK (
        time_to_first_review_hours >= 0 AND
        time_to_completion_hours >= 0 AND
        total_review_time_hours >= 0 AND
        total_reviewers >= 0 AND
        reviews_completed >= 0 AND
        escalation_count >= 0 AND
        revision_count >= 0 AND
        comment_count >= 0
    ),
    CONSTRAINT satisfaction_score_valid CHECK (
        reviewer_satisfaction_score >= 0 AND reviewer_satisfaction_score <= 5
    ),
    CONSTRAINT pass_rate_valid CHECK (
        criteria_pass_rate >= 0 AND criteria_pass_rate <= 100
    )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_approval_criteria_workspace ON approval_criteria(workspace_id, weight DESC);
CREATE INDEX IF NOT EXISTS idx_approval_rules_workspace ON approval_rules(workspace_id, transition_id);
CREATE INDEX IF NOT EXISTS idx_approval_requests_workspace ON approval_requests(workspace_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_approval_requests_status ON approval_requests(status, due_date);
CREATE INDEX IF NOT EXISTS idx_approval_requests_requester ON approval_requests(requester_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_approval_requests_resource ON approval_requests(resource_id);
CREATE INDEX IF NOT EXISTS idx_reviewer_assignments_request ON reviewer_assignments(approval_request_id, status);
CREATE INDEX IF NOT EXISTS idx_reviewer_assignments_reviewer ON reviewer_assignments(reviewer_id, status, assigned_at DESC);
CREATE INDEX IF NOT EXISTS idx_approval_notifications_reviewer ON approval_notifications(reviewer_id, read_at);
CREATE INDEX IF NOT EXISTS idx_approval_notifications_request ON approval_notifications(approval_request_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_approval_templates_workspace ON approval_templates(workspace_id, is_active);
CREATE INDEX IF NOT EXISTS idx_approval_metrics_workspace ON approval_metrics(workspace_id, created_at DESC);

-- GIN indexes for JSONB columns
CREATE INDEX IF NOT EXISTS idx_approval_criteria_conditions_gin ON approval_criteria USING GIN (conditions);
CREATE INDEX IF NOT EXISTS idx_approval_rules_criteria_gin ON approval_rules USING GIN (criteria_ids);
CREATE INDEX IF NOT EXISTS idx_approval_rules_escalation_gin ON approval_rules USING GIN (escalation_reviewers);
CREATE INDEX IF NOT EXISTS idx_approval_rules_auto_conditions_gin ON approval_rules USING GIN (auto_approval_conditions);
CREATE INDEX IF NOT EXISTS idx_reviewer_assignments_evaluations_gin ON reviewer_assignments USING GIN (criteria_evaluations);
CREATE INDEX IF NOT EXISTS idx_approval_templates_config_gin ON approval_templates USING GIN (template_config);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_approval_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables with updated_at
DO $$
BEGIN
    -- Approval criteria
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_approval_criteria_updated_at') THEN
        CREATE TRIGGER update_approval_criteria_updated_at BEFORE UPDATE ON approval_criteria
            FOR EACH ROW EXECUTE FUNCTION update_approval_updated_at();
    END IF;
    
    -- Approval rules
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_approval_rules_updated_at') THEN
        CREATE TRIGGER update_approval_rules_updated_at BEFORE UPDATE ON approval_rules
            FOR EACH ROW EXECUTE FUNCTION update_approval_updated_at();
    END IF;
    
    -- Approval requests
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_approval_requests_updated_at') THEN
        CREATE TRIGGER update_approval_requests_updated_at BEFORE UPDATE ON approval_requests
            FOR EACH ROW EXECUTE FUNCTION update_approval_updated_at();
    END IF;
    
    -- Reviewer assignments
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_reviewer_assignments_updated_at') THEN
        CREATE TRIGGER update_reviewer_assignments_updated_at BEFORE UPDATE ON reviewer_assignments
            FOR EACH ROW EXECUTE FUNCTION update_approval_updated_at();
    END IF;
    
    -- Approval templates
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_approval_templates_updated_at') THEN
        CREATE TRIGGER update_approval_templates_updated_at BEFORE UPDATE ON approval_templates
            FOR EACH ROW EXECUTE FUNCTION update_approval_updated_at();
    END IF;
END $$;

-- Create function to automatically update approval percentages
CREATE OR REPLACE FUNCTION update_approval_percentage()
RETURNS TRIGGER AS $$
BEGIN
    -- Update approval percentage when reviewer status changes
    UPDATE approval_requests 
    SET 
        current_approvals = (
            SELECT COUNT(*) 
            FROM reviewer_assignments 
            WHERE approval_request_id = NEW.approval_request_id 
            AND status = 'approved'
        ),
        approval_percentage = (
            SELECT 
                CASE 
                    WHEN ar.required_approvals = 0 THEN 0
                    ELSE (COUNT(CASE WHEN ra.status = 'approved' THEN 1 END) * 100.0 / ar.required_approvals)
                END
            FROM approval_requests ar
            LEFT JOIN reviewer_assignments ra ON ar.id = ra.approval_request_id
            WHERE ar.id = NEW.approval_request_id
            GROUP BY ar.id, ar.required_approvals
        )
    WHERE id = NEW.approval_request_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for approval percentage updates
CREATE TRIGGER update_approval_percentage_trigger
    AFTER UPDATE ON reviewer_assignments
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION update_approval_percentage();

-- Create function to handle approval completion
CREATE OR REPLACE FUNCTION check_approval_completion()
RETURNS TRIGGER AS $$
DECLARE
    approval_record approval_requests%ROWTYPE;
    approved_count INTEGER;
    rejected_count INTEGER;
BEGIN
    -- Get the approval request details
    SELECT * INTO approval_record
    FROM approval_requests
    WHERE id = NEW.approval_request_id;
    
    -- Count approvals and rejections
    SELECT 
        COUNT(CASE WHEN status = 'approved' THEN 1 END),
        COUNT(CASE WHEN status = 'rejected' THEN 1 END)
    INTO approved_count, rejected_count
    FROM reviewer_assignments
    WHERE approval_request_id = NEW.approval_request_id;
    
    -- Check if approval is complete
    IF approved_count >= approval_record.required_approvals THEN
        UPDATE approval_requests
        SET status = 'approved', completed_at = CURRENT_TIMESTAMP
        WHERE id = NEW.approval_request_id;
    ELSIF rejected_count > 0 THEN
        UPDATE approval_requests
        SET status = 'rejected', completed_at = CURRENT_TIMESTAMP
        WHERE id = NEW.approval_request_id;
    ELSIF approved_count > 0 OR rejected_count > 0 THEN
        UPDATE approval_requests
        SET status = 'in_review'
        WHERE id = NEW.approval_request_id AND status = 'pending';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for approval completion
CREATE TRIGGER check_approval_completion_trigger
    AFTER UPDATE ON reviewer_assignments
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status AND NEW.status IN ('approved', 'rejected'))
    EXECUTE FUNCTION check_approval_completion();

-- Create function to expire overdue approvals
CREATE OR REPLACE FUNCTION expire_overdue_approvals()
RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    UPDATE approval_requests
    SET status = 'expired'
    WHERE status IN ('pending', 'in_review')
    AND due_date < CURRENT_TIMESTAMP;
    
    GET DIAGNOSTICS expired_count = ROW_COUNT;
    RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- Insert default approval criteria for existing workspaces
INSERT INTO approval_criteria (workspace_id, name, description, conditions, weight, is_required)
SELECT 
    w.id as workspace_id,
    criteria_name,
    criteria_description,
    criteria_conditions::jsonb,
    criteria_weight,
    criteria_required
FROM workspaces w
CROSS JOIN (
    VALUES 
        ('Code Quality', 'Ensure code meets quality standards', '{"min_test_coverage": 80, "max_complexity": 10}', 3, true),
        ('Security Review', 'Verify security best practices', '{"security_scan_passed": true, "no_secrets_exposed": true}', 5, true),
        ('Performance Impact', 'Assess performance implications', '{"performance_regression": false, "memory_usage_acceptable": true}', 2, false),
        ('Documentation', 'Verify documentation is complete', '{"documentation_updated": true, "examples_provided": true}', 1, false),
        ('Business Impact', 'Evaluate business impact', '{"stakeholder_approval": true, "business_case_valid": true}', 4, false)
) AS criteria(criteria_name, criteria_description, criteria_conditions, criteria_weight, criteria_required);

-- Insert default approval rules for existing transitions
INSERT INTO approval_rules (
    workspace_id, transition_id, name, description,
    reviewer_assignment_type, required_reviewers, minimum_approvals, allow_self_approval
)
SELECT 
    wt.workspace_id,
    wt.id as transition_id,
    'Standard Approval for ' || wt.name,
    'Standard approval workflow for ' || wt.name || ' transition',
    'role_based',
    2,
    1,
    false
FROM workflow_transitions wt
WHERE wt.requires_approval = true;

-- Create sample approval templates
INSERT INTO approval_templates (workspace_id, name, description, category, template_config, created_by)
SELECT 
    w.id as workspace_id,
    template_name,
    template_description,
    template_category,
    template_config::jsonb,
    'system'
FROM workspaces w
CROSS JOIN (
    VALUES 
        ('Simple Approval', 'Basic approval workflow with single reviewer', 'Basic', '{"required_reviewers": 1, "minimum_approvals": 1, "timeout_hours": 24}'),
        ('Peer Review', 'Peer review workflow for collaborative approval', 'Collaborative', '{"required_reviewers": 2, "minimum_approvals": 2, "timeout_hours": 48}'),
        ('Manager Approval', 'Manager approval for sensitive changes', 'Hierarchical', '{"required_reviewers": 1, "minimum_approvals": 1, "timeout_hours": 72, "escalation_enabled": true}'),
        ('Critical Change', 'Multi-stage approval for critical changes', 'Critical', '{"required_reviewers": 3, "minimum_approvals": 3, "timeout_hours": 96, "escalation_enabled": true}')
) AS templates(template_name, template_description, template_category, template_config);