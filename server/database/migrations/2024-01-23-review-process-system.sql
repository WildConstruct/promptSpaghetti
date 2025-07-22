-- Epic 17.5.1 - Review Process System Database Schema
-- Migration for comprehensive review workflow orchestration

-- Review process templates - Define reusable review workflows
CREATE TABLE IF NOT EXISTS review_process_templates (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    review_type VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Process configuration
    stages JSONB NOT NULL,
    requires_consensus BOOLEAN DEFAULT false,
    min_reviewers INTEGER DEFAULT 1,
    max_reviewers INTEGER DEFAULT 5,
    consensus_threshold INTEGER DEFAULT 60, -- percentage
    
    -- Timing
    default_duration INTEGER DEFAULT 60, -- minutes
    escalation_thresholds JSONB DEFAULT '[]',
    sla_hours INTEGER DEFAULT 24,
    
    -- Assignment
    preferred_assignment_strategy VARCHAR(100) DEFAULT 'skill_based',
    required_reviewer_roles JSONB DEFAULT '[]',
    excluded_reviewer_roles JSONB DEFAULT '[]',
    
    -- Business rules
    criteria JSONB DEFAULT '[]',
    auto_approval_rules JSONB DEFAULT '[]',
    escalation_rules JSONB DEFAULT '[]',
    
    -- Integration
    webhook_urls JSONB DEFAULT '[]',
    notification_settings JSONB NOT NULL DEFAULT '{}',
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by VARCHAR(255) NOT NULL,
    active BOOLEAN DEFAULT true,
    
    -- Constraints
    CONSTRAINT chk_consensus_threshold CHECK (consensus_threshold >= 0 AND consensus_threshold <= 100),
    CONSTRAINT chk_min_max_reviewers CHECK (min_reviewers <= max_reviewers),
    CONSTRAINT chk_sla_positive CHECK (sla_hours > 0)
);

-- Review processes - Active instances of review workflows
CREATE TABLE IF NOT EXISTS review_processes (
    id VARCHAR(255) PRIMARY KEY,
    review_id VARCHAR(255) NOT NULL,
    template_id VARCHAR(255) NOT NULL,
    current_stage VARCHAR(255),
    status VARCHAR(100) NOT NULL,
    
    -- Progress tracking
    completed_stages JSONB DEFAULT '[]',
    active_stages JSONB DEFAULT '[]',
    pending_stages JSONB DEFAULT '[]',
    
    -- Timeline
    started_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    due_date TIMESTAMP,
    
    -- Performance metrics
    total_reviewers INTEGER DEFAULT 0,
    decisions_made INTEGER DEFAULT 0,
    consensus_reached BOOLEAN DEFAULT false,
    escalation_count INTEGER DEFAULT 0,
    
    -- State data
    stage_data JSONB DEFAULT '{}',
    process_data JSONB DEFAULT '{}',
    
    -- Metadata
    created_by VARCHAR(255) NOT NULL,
    
    -- Foreign key
    CONSTRAINT fk_review_process_template 
        FOREIGN KEY (template_id) REFERENCES review_process_templates(id) ON DELETE RESTRICT,
    
    -- Constraints
    CONSTRAINT chk_process_status 
        CHECK (status IN ('pending', 'in_progress', 'pending_consensus', 'escalated', 
                         'approved', 'rejected', 'returned', 'expired', 'cancelled')),
    CONSTRAINT chk_escalation_count CHECK (escalation_count >= 0),
    CONSTRAINT chk_total_reviewers CHECK (total_reviewers >= 0),
    CONSTRAINT chk_decisions_made CHECK (decisions_made >= 0)
);

-- Review process results - Final outcomes of completed reviews
CREATE TABLE IF NOT EXISTS review_process_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id VARCHAR(255) NOT NULL,
    process_id VARCHAR(255) NOT NULL,
    final_decision VARCHAR(100) NOT NULL,
    confidence DECIMAL(5,4) DEFAULT 0,
    consensus BOOLEAN DEFAULT false,
    
    -- Execution metrics
    duration_minutes INTEGER NOT NULL,
    reviewers_involved INTEGER NOT NULL,
    stages_completed INTEGER NOT NULL,
    escalations_triggered INTEGER DEFAULT 0,
    
    -- Decision breakdown
    approve_votes INTEGER DEFAULT 0,
    reject_votes INTEGER DEFAULT 0,
    other_votes INTEGER DEFAULT 0,
    
    -- Summary
    summary TEXT,
    recommendations JSONB DEFAULT '[]',
    completed_at TIMESTAMP DEFAULT NOW(),
    
    -- Foreign keys
    CONSTRAINT fk_review_result_process 
        FOREIGN KEY (process_id) REFERENCES review_processes(id) ON DELETE CASCADE,
    
    -- Constraints
    CONSTRAINT chk_confidence_range CHECK (confidence >= 0 AND confidence <= 1),
    CONSTRAINT chk_positive_metrics CHECK (
        duration_minutes >= 0 AND reviewers_involved >= 0 AND 
        stages_completed >= 0 AND escalations_triggered >= 0
    ),
    CONSTRAINT chk_vote_counts CHECK (
        approve_votes >= 0 AND reject_votes >= 0 AND other_votes >= 0
    )
);

-- Review process events - Audit log for process state changes
CREATE TABLE IF NOT EXISTS review_process_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    process_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB DEFAULT '{}',
    triggered_by VARCHAR(255),
    triggered_at TIMESTAMP DEFAULT NOW(),
    
    -- Foreign key
    CONSTRAINT fk_review_event_process 
        FOREIGN KEY (process_id) REFERENCES review_processes(id) ON DELETE CASCADE
);

-- Review stage assignments - Track reviewer assignments per stage
CREATE TABLE IF NOT EXISTS review_stage_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    process_id VARCHAR(255) NOT NULL,
    stage_id VARCHAR(255) NOT NULL,
    reviewer_id VARCHAR(255) NOT NULL,
    assignment_strategy VARCHAR(100),
    
    -- Status
    status VARCHAR(50) DEFAULT 'assigned',
    assigned_at TIMESTAMP DEFAULT NOW(),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    
    -- Decision
    decision VARCHAR(100),
    confidence DECIMAL(5,4),
    reasoning TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Foreign keys
    CONSTRAINT fk_stage_assignment_process 
        FOREIGN KEY (process_id) REFERENCES review_processes(id) ON DELETE CASCADE,
    
    -- Constraints
    CONSTRAINT chk_assignment_status 
        CHECK (status IN ('assigned', 'in_progress', 'completed', 'reassigned', 'cancelled')),
    CONSTRAINT chk_assignment_confidence 
        CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1))
);

-- Review consensus tracking - Track consensus building across reviewers
CREATE TABLE IF NOT EXISTS review_consensus_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    process_id VARCHAR(255) NOT NULL,
    stage_id VARCHAR(255) NOT NULL,
    
    -- Consensus metrics
    total_reviewers INTEGER NOT NULL,
    decisions_received INTEGER DEFAULT 0,
    consensus_threshold DECIMAL(5,4) NOT NULL,
    consensus_reached BOOLEAN DEFAULT false,
    
    -- Decision breakdown
    approve_count INTEGER DEFAULT 0,
    reject_count INTEGER DEFAULT 0,
    escalate_count INTEGER DEFAULT 0,
    other_count INTEGER DEFAULT 0,
    
    -- Confidence metrics
    avg_confidence DECIMAL(5,4),
    min_confidence DECIMAL(5,4),
    max_confidence DECIMAL(5,4),
    
    -- Timeline
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    consensus_reached_at TIMESTAMP,
    
    -- Foreign key
    CONSTRAINT fk_consensus_process 
        FOREIGN KEY (process_id) REFERENCES review_processes(id) ON DELETE CASCADE,
    
    -- Constraints
    CONSTRAINT chk_consensus_threshold_range 
        CHECK (consensus_threshold >= 0 AND consensus_threshold <= 1),
    CONSTRAINT chk_consensus_counts CHECK (
        approve_count >= 0 AND reject_count >= 0 AND 
        escalate_count >= 0 AND other_count >= 0 AND
        decisions_received = approve_count + reject_count + escalate_count + other_count
    )
);

-- Review escalation history - Track escalations and their resolutions
CREATE TABLE IF NOT EXISTS review_escalation_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    process_id VARCHAR(255) NOT NULL,
    escalation_level INTEGER NOT NULL,
    reason VARCHAR(500) NOT NULL,
    
    -- Escalation details
    escalated_by VARCHAR(255) NOT NULL,
    escalated_to VARCHAR(255),
    escalation_type VARCHAR(100) NOT NULL,
    escalation_action VARCHAR(100),
    
    -- Resolution
    resolved BOOLEAN DEFAULT false,
    resolved_by VARCHAR(255),
    resolved_at TIMESTAMP,
    resolution_notes TEXT,
    
    -- Timeline
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Foreign key
    CONSTRAINT fk_escalation_process 
        FOREIGN KEY (process_id) REFERENCES review_processes(id) ON DELETE CASCADE,
    
    -- Constraints
    CONSTRAINT chk_escalation_level CHECK (escalation_level > 0)
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_review_process_templates_review_type ON review_process_templates(review_type);
CREATE INDEX IF NOT EXISTS idx_review_process_templates_active ON review_process_templates(active);
CREATE INDEX IF NOT EXISTS idx_review_process_templates_created_at ON review_process_templates(created_at);

CREATE INDEX IF NOT EXISTS idx_review_processes_review_id ON review_processes(review_id);
CREATE INDEX IF NOT EXISTS idx_review_processes_template_id ON review_processes(template_id);
CREATE INDEX IF NOT EXISTS idx_review_processes_status ON review_processes(status);
CREATE INDEX IF NOT EXISTS idx_review_processes_due_date ON review_processes(due_date);
CREATE INDEX IF NOT EXISTS idx_review_processes_created_by ON review_processes(created_by);
CREATE INDEX IF NOT EXISTS idx_review_processes_started_at ON review_processes(started_at);

CREATE INDEX IF NOT EXISTS idx_review_process_results_review_id ON review_process_results(review_id);
CREATE INDEX IF NOT EXISTS idx_review_process_results_process_id ON review_process_results(process_id);
CREATE INDEX IF NOT EXISTS idx_review_process_results_final_decision ON review_process_results(final_decision);
CREATE INDEX IF NOT EXISTS idx_review_process_results_completed_at ON review_process_results(completed_at);

CREATE INDEX IF NOT EXISTS idx_review_process_events_process_id ON review_process_events(process_id);
CREATE INDEX IF NOT EXISTS idx_review_process_events_event_type ON review_process_events(event_type);
CREATE INDEX IF NOT EXISTS idx_review_process_events_triggered_at ON review_process_events(triggered_at);

CREATE INDEX IF NOT EXISTS idx_review_stage_assignments_process_id ON review_stage_assignments(process_id);
CREATE INDEX IF NOT EXISTS idx_review_stage_assignments_reviewer_id ON review_stage_assignments(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_review_stage_assignments_status ON review_stage_assignments(status);

CREATE INDEX IF NOT EXISTS idx_review_consensus_tracking_process_id ON review_consensus_tracking(process_id);
CREATE INDEX IF NOT EXISTS idx_review_consensus_tracking_consensus_reached ON review_consensus_tracking(consensus_reached);

CREATE INDEX IF NOT EXISTS idx_review_escalation_history_process_id ON review_escalation_history(process_id);
CREATE INDEX IF NOT EXISTS idx_review_escalation_history_resolved ON review_escalation_history(resolved);

-- GIN indexes for JSONB columns
CREATE INDEX IF NOT EXISTS idx_review_process_templates_stages_gin ON review_process_templates USING GIN(stages);
CREATE INDEX IF NOT EXISTS idx_review_process_templates_criteria_gin ON review_process_templates USING GIN(criteria);
CREATE INDEX IF NOT EXISTS idx_review_processes_stage_data_gin ON review_processes USING GIN(stage_data);
CREATE INDEX IF NOT EXISTS idx_review_processes_process_data_gin ON review_processes USING GIN(process_data);
CREATE INDEX IF NOT EXISTS idx_review_process_events_event_data_gin ON review_process_events USING GIN(event_data);

-- Insert default review process templates
INSERT INTO review_process_templates (
    id, name, review_type, description, stages, requires_consensus,
    min_reviewers, max_reviewers, consensus_threshold, default_duration,
    sla_hours, preferred_assignment_strategy, required_reviewer_roles,
    criteria, notification_settings, created_by
) VALUES 
(
    'template_marketplace_content',
    'Marketplace Content Review',
    'content_submission',
    'Standard review process for marketplace content submissions',
    '[
        {
            "id": "initial_review",
            "name": "Initial Content Review",
            "description": "Basic content quality and policy compliance check",
            "order": 1,
            "required": true,
            "parallelStage": false,
            "minReviewers": 1,
            "requiredRoles": ["content_reviewer"],
            "timeoutMinutes": 240,
            "escalateOnTimeout": true,
            "dependencies": [],
            "allowedDecisions": ["approve", "reject", "return_for_revision", "escalate"]
        },
        {
            "id": "technical_review",
            "name": "Technical Review",
            "description": "Technical compliance and quality assessment",
            "order": 2,
            "required": false,
            "parallelStage": true,
            "minReviewers": 1,
            "requiredRoles": ["technical_reviewer"],
            "timeoutMinutes": 480,
            "escalateOnTimeout": false,
            "dependencies": ["initial_review"],
            "allowedDecisions": ["approve", "reject", "escalate"]
        },
        {
            "id": "final_approval",
            "name": "Final Approval",
            "description": "Final approval by senior reviewer",
            "order": 3,
            "required": true,
            "parallelStage": false,
            "minReviewers": 1,
            "requiredRoles": ["senior_reviewer"],
            "timeoutMinutes": 120,
            "escalateOnTimeout": true,
            "dependencies": ["initial_review"],
            "allowedDecisions": ["approve", "reject", "return_for_revision"]
        }
    ]',
    false,
    2,
    3,
    60,
    180,
    24,
    'skill_based',
    '["content_reviewer", "technical_reviewer"]',
    '[
        {
            "criteriaId": "content_quality",
            "name": "Content Quality",
            "description": "Overall quality of submitted content",
            "category": "quality",
            "weight": 0.4,
            "required": true,
            "type": "scale"
        },
        {
            "criteriaId": "policy_compliance",
            "name": "Policy Compliance",
            "description": "Adherence to marketplace policies",
            "category": "policy",
            "weight": 0.3,
            "required": true,
            "type": "binary"
        },
        {
            "criteriaId": "technical_standards",
            "name": "Technical Standards",
            "description": "Meets technical requirements",
            "category": "technical",
            "weight": 0.3,
            "required": true,
            "type": "checklist"
        }
    ]',
    '{
        "email": true,
        "slack": true,
        "webhook": false,
        "sms": false,
        "immediate": true,
        "daily_digest": false,
        "escalation_only": false,
        "reviewers": true,
        "admins": true,
        "stakeholders": []
    }',
    'system'
),
(
    'template_policy_violation',
    'Policy Violation Review',
    'policy_violation',
    'Review process for policy violations and enforcement actions',
    '[
        {
            "id": "violation_assessment",
            "name": "Violation Assessment",
            "description": "Assess the severity and validity of the reported violation",
            "order": 1,
            "required": true,
            "parallelStage": false,
            "minReviewers": 1,
            "requiredRoles": ["policy_reviewer"],
            "timeoutMinutes": 120,
            "escalateOnTimeout": true,
            "dependencies": [],
            "allowedDecisions": ["approve", "reject", "escalate", "request_more_info"]
        },
        {
            "id": "enforcement_decision",
            "name": "Enforcement Decision",
            "description": "Determine appropriate enforcement action",
            "order": 2,
            "required": true,
            "parallelStage": false,
            "minReviewers": 1,
            "requiredRoles": ["senior_reviewer"],
            "timeoutMinutes": 180,
            "escalateOnTimeout": true,
            "dependencies": ["violation_assessment"],
            "allowedDecisions": ["approve", "escalate", "return_for_revision"]
        }
    ]',
    true,
    2,
    3,
    75,
    120,
    12,
    'workload_based',
    '["policy_reviewer", "senior_reviewer"]',
    '[
        {
            "criteriaId": "violation_severity",
            "name": "Violation Severity",
            "description": "Severity level of the policy violation",
            "category": "policy",
            "weight": 0.5,
            "required": true,
            "type": "multiple_choice"
        },
        {
            "criteriaId": "evidence_quality",
            "name": "Evidence Quality",
            "description": "Quality and sufficiency of evidence",
            "category": "compliance",
            "weight": 0.3,
            "required": true,
            "type": "scale"
        },
        {
            "criteriaId": "repeat_offender",
            "name": "Repeat Offender",
            "description": "Is this a repeat violation by the same user",
            "category": "business_rules",
            "weight": 0.2,
            "required": false,
            "type": "binary"
        }
    ]',
    '{
        "email": true,
        "slack": true,
        "webhook": true,
        "sms": true,
        "immediate": true,
        "daily_digest": false,
        "escalation_only": false,
        "reviewers": true,
        "admins": true,
        "stakeholders": ["legal", "compliance"]
    }',
    'system'
),
(
    'template_urgent_review',
    'Urgent Review Process',
    'security_alert',
    'Expedited review process for urgent security alerts and critical issues',
    '[
        {
            "id": "immediate_triage",
            "name": "Immediate Triage",
            "description": "Immediate assessment and triage of urgent issue",
            "order": 1,
            "required": true,
            "parallelStage": false,
            "minReviewers": 1,
            "requiredRoles": ["escalation_reviewer"],
            "timeoutMinutes": 30,
            "escalateOnTimeout": true,
            "dependencies": [],
            "allowedDecisions": ["approve", "escalate", "defer"]
        },
        {
            "id": "expert_review",
            "name": "Expert Review",
            "description": "Review by subject matter expert",
            "order": 2,
            "required": true,
            "parallelStage": false,
            "minReviewers": 1,
            "requiredRoles": ["senior_reviewer"],
            "timeoutMinutes": 60,
            "escalateOnTimeout": true,
            "dependencies": ["immediate_triage"],
            "allowedDecisions": ["approve", "reject", "escalate"]
        }
    ]',
    false,
    1,
    2,
    100,
    30,
    4,
    'manual',
    '["escalation_reviewer", "senior_reviewer"]',
    '[
        {
            "criteriaId": "urgency_level",
            "name": "Urgency Level",
            "description": "Level of urgency for this issue",
            "category": "business_rules",
            "weight": 0.4,
            "required": true,
            "type": "multiple_choice"
        },
        {
            "criteriaId": "risk_assessment",
            "name": "Risk Assessment",
            "description": "Security and business risk assessment",
            "category": "safety",
            "weight": 0.6,
            "required": true,
            "type": "scale"
        }
    ]',
    '{
        "email": true,
        "slack": true,
        "webhook": true,
        "sms": true,
        "immediate": true,
        "daily_digest": false,
        "escalation_only": true,
        "reviewers": true,
        "admins": true,
        "stakeholders": ["security", "ops", "management"]
    }',
    'system'
)
ON CONFLICT (id) DO NOTHING;

-- Create triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_review_process_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_review_process_templates_updated_at
    BEFORE UPDATE ON review_process_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_review_process_templates_updated_at();

CREATE OR REPLACE FUNCTION update_review_processes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_review_processes_updated_at
    BEFORE UPDATE ON review_processes
    FOR EACH ROW
    EXECUTE FUNCTION update_review_processes_updated_at();

-- Create views for common queries
CREATE OR REPLACE VIEW review_process_dashboard AS
SELECT 
    rp.id as process_id,
    rp.review_id,
    rpt.name as template_name,
    rpt.review_type,
    rp.status,
    rp.current_stage,
    rp.started_at,
    rp.due_date,
    rp.total_reviewers,
    rp.decisions_made,
    rp.escalation_count,
    CASE 
        WHEN rp.completed_at IS NOT NULL THEN rp.completed_at - rp.started_at
        ELSE NOW() - rp.started_at
    END as duration,
    CASE 
        WHEN rp.due_date < NOW() AND rp.completed_at IS NULL THEN true
        ELSE false
    END as overdue
FROM review_processes rp
JOIN review_process_templates rpt ON rp.template_id = rpt.id
WHERE rp.status NOT IN ('completed', 'cancelled');

CREATE OR REPLACE VIEW reviewer_workload_summary AS
SELECT 
    rsa.reviewer_id,
    COUNT(*) as total_assignments,
    COUNT(*) FILTER (WHERE rsa.status = 'assigned') as pending_assignments,
    COUNT(*) FILTER (WHERE rsa.status = 'in_progress') as active_assignments,
    COUNT(*) FILTER (WHERE rsa.status = 'completed') as completed_assignments,
    AVG(EXTRACT(EPOCH FROM (rsa.completed_at - rsa.started_at))/60) as avg_review_time_minutes
FROM review_stage_assignments rsa
WHERE rsa.assigned_at >= NOW() - INTERVAL '30 days'
GROUP BY rsa.reviewer_id;

-- Add comments for documentation
COMMENT ON TABLE review_process_templates IS 'Defines reusable review workflow templates for different types of administrative reviews';
COMMENT ON TABLE review_processes IS 'Active instances of review workflows with state tracking and progress monitoring';
COMMENT ON TABLE review_process_results IS 'Final outcomes and metrics for completed review processes';
COMMENT ON TABLE review_process_events IS 'Audit log for all review process state changes and events';
COMMENT ON TABLE review_stage_assignments IS 'Tracks reviewer assignments for each stage of the review process';
COMMENT ON TABLE review_consensus_tracking IS 'Monitors consensus building progress across multiple reviewers';
COMMENT ON TABLE review_escalation_history IS 'Records escalation events and their resolutions';

COMMENT ON VIEW review_process_dashboard IS 'Dashboard view showing active review processes with key metrics';
COMMENT ON VIEW reviewer_workload_summary IS 'Summary of reviewer workload and performance metrics';