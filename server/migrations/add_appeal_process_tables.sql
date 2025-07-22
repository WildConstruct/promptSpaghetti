-- Migration: Add Appeal Process Tables
-- Epic 17 - Trust & Verification System - Appeal Process
-- Task: E17-1753114397383-FB5EA7

-- Main appeals table
CREATE TABLE IF NOT EXISTS appeals (
    appeal_id VARCHAR(255) PRIMARY KEY,
    appellant_id VARCHAR(255) NOT NULL,
    appellant_type VARCHAR(50) NOT NULL CHECK (appellant_type IN ('user', 'creator', 'buyer', 'admin')),
    
    -- Original decision being appealed
    original_decision_id VARCHAR(255) NOT NULL,
    original_decision_type VARCHAR(100) NOT NULL,
    original_decision_date TIMESTAMP WITH TIME ZONE,
    
    -- Appeal classification
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'enforcement_action', 'trust_score', 'policy_violation', 
        'verification_status', 'content_moderation', 'account_restriction',
        'transaction_block', 'marketplace_decision', 'other'
    )),
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    status VARCHAR(30) NOT NULL CHECK (status IN (
        'submitted', 'under_review', 'evidence_requested', 'investigation',
        'pending_decision', 'approved', 'partially_approved', 'denied', 
        'dismissed', 'expired'
    )) DEFAULT 'submitted',
    
    -- Appeal content
    subject VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    requested_outcome TEXT NOT NULL,
    impact_statement TEXT,
    
    -- Process tracking
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    target_resolution_date TIMESTAMP WITH TIME ZONE,
    actual_resolution_date TIMESTAMP WITH TIME ZONE,
    
    -- Assignment and review
    assigned_reviewer_id VARCHAR(255),
    reviewer_role VARCHAR(20) CHECK (reviewer_role IN ('tier1', 'tier2', 'specialist', 'senior', 'escalation')),
    escalation_level INTEGER DEFAULT 0,
    review_complexity VARCHAR(20) CHECK (review_complexity IN ('simple', 'standard', 'complex', 'critical')) DEFAULT 'standard',
    
    -- Decision and outcome
    decision VARCHAR(20) CHECK (decision IN ('approve', 'partially_approve', 'deny', 'dismiss')),
    decision_date TIMESTAMP WITH TIME ZONE,
    decision_rationale JSONB,
    reviewer_notes TEXT,
    
    -- Metrics
    resolution_time_hours DECIMAL(10,2),
    satisfaction_score INTEGER CHECK (satisfaction_score BETWEEN 1 AND 10),
    follow_up_required BOOLEAN DEFAULT false,
    
    -- Related appeals
    related_appeals JSONB DEFAULT '[]'::jsonb,
    precedent_appeals JSONB DEFAULT '[]'::jsonb,
    
    -- Resubmission settings
    allow_resubmission BOOLEAN DEFAULT true,
    resubmission_count INTEGER DEFAULT 0,
    max_resubmissions INTEGER DEFAULT 3,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appeal evidence table
CREATE TABLE IF NOT EXISTS appeal_evidence (
    evidence_id VARCHAR(255) PRIMARY KEY,
    appeal_id VARCHAR(255) NOT NULL REFERENCES appeals(appeal_id) ON DELETE CASCADE,
    evidence_type VARCHAR(50) NOT NULL CHECK (evidence_type IN (
        'document', 'screenshot', 'video', 'transaction_record',
        'communication_log', 'technical_data', 'witness_statement',
        'expert_opinion', 'other'
    )),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    file_url VARCHAR(1000),
    content TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    submitted_by VARCHAR(255) NOT NULL,
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN (
        'pending', 'verified', 'disputed', 'rejected'
    )),
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by VARCHAR(255),
    verification_notes TEXT
);

-- Appeal timeline/activity log
CREATE TABLE IF NOT EXISTS appeal_timeline (
    event_id VARCHAR(255) PRIMARY KEY,
    appeal_id VARCHAR(255) NOT NULL REFERENCES appeals(appeal_id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    event_type VARCHAR(100) NOT NULL,
    actor_id VARCHAR(255) NOT NULL,
    actor_type VARCHAR(20) NOT NULL CHECK (actor_type IN ('user', 'reviewer', 'system')),
    description TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    public_visible BOOLEAN DEFAULT false
);

-- Appeal review criteria and scoring
CREATE TABLE IF NOT EXISTS appeal_review_criteria (
    review_id SERIAL PRIMARY KEY,
    appeal_id VARCHAR(255) NOT NULL REFERENCES appeals(appeal_id) ON DELETE CASCADE,
    reviewer_id VARCHAR(255),
    
    -- Review scoring (1-10 scale)
    policy_adherence INTEGER CHECK (policy_adherence BETWEEN 1 AND 10),
    evidence_quality INTEGER CHECK (evidence_quality BETWEEN 1 AND 10),
    procedural_fairness INTEGER CHECK (procedural_fairness BETWEEN 1 AND 10),
    proportionality INTEGER CHECK (proportionality BETWEEN 1 AND 10),
    precedent_consistency INTEGER CHECK (precedent_consistency BETWEEN 1 AND 10),
    risk_assessment INTEGER CHECK (risk_assessment BETWEEN 1 AND 10),
    
    -- Combined data for complex criteria
    criteria_data JSONB NOT NULL,
    
    -- Review metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    review_notes TEXT
);

-- Appeal escalations tracking
CREATE TABLE IF NOT EXISTS appeal_escalations (
    escalation_id VARCHAR(255) PRIMARY KEY,
    appeal_id VARCHAR(255) NOT NULL REFERENCES appeals(appeal_id) ON DELETE CASCADE,
    escalated_from VARCHAR(255), -- previous reviewer
    escalated_to VARCHAR(255) NOT NULL, -- new reviewer
    escalation_reason VARCHAR(100) NOT NULL CHECK (escalation_reason IN (
        'complexity', 'policy_ambiguity', 'precedent_needed', 'reviewer_conflict',
        'appellant_request', 'time_exceeded', 'quality_review', 'high_risk'
    )),
    escalation_level INTEGER NOT NULL,
    escalated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    escalated_by VARCHAR(255) NOT NULL,
    escalation_notes TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_outcome VARCHAR(100)
);

-- Appeal precedents for consistency
CREATE TABLE IF NOT EXISTS appeal_precedents (
    precedent_id VARCHAR(255) PRIMARY KEY,
    appeal_id VARCHAR(255) NOT NULL REFERENCES appeals(appeal_id) ON DELETE CASCADE,
    
    -- Precedent classification
    precedent_type VARCHAR(50) NOT NULL,
    category_scope VARCHAR(50) NOT NULL,
    similarity_score DECIMAL(5,2) CHECK (similarity_score BETWEEN 0 AND 100),
    
    -- Case details
    case_summary TEXT NOT NULL,
    key_facts JSONB NOT NULL,
    decision_reasoning TEXT NOT NULL,
    applicable_policies JSONB DEFAULT '[]'::jsonb,
    
    -- Usage tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255) NOT NULL,
    times_referenced INTEGER DEFAULT 0,
    last_referenced TIMESTAMP WITH TIME ZONE,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    superseded_by VARCHAR(255),
    review_date TIMESTAMP WITH TIME ZONE
);

-- Appeal notifications and communications
CREATE TABLE IF NOT EXISTS appeal_notifications (
    notification_id VARCHAR(255) PRIMARY KEY,
    appeal_id VARCHAR(255) NOT NULL REFERENCES appeals(appeal_id) ON DELETE CASCADE,
    recipient_id VARCHAR(255) NOT NULL,
    recipient_type VARCHAR(20) NOT NULL CHECK (recipient_type IN ('appellant', 'reviewer', 'admin')),
    
    -- Notification details
    notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN (
        'submitted', 'assigned', 'status_changed', 'evidence_requested',
        'decision_made', 'escalated', 'reminder', 'deadline_approaching'
    )),
    subject VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    
    -- Delivery tracking
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivery_method VARCHAR(20) NOT NULL CHECK (delivery_method IN ('email', 'in_app', 'sms', 'webhook')),
    delivery_status VARCHAR(20) DEFAULT 'pending' CHECK (delivery_status IN (
        'pending', 'sent', 'delivered', 'failed', 'bounced'
    )),
    delivery_attempts INTEGER DEFAULT 0,
    delivered_at TIMESTAMP WITH TIME ZONE,
    
    -- User interaction
    read_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    responded_at TIMESTAMP WITH TIME ZONE
);

-- Appeal SLA tracking
CREATE TABLE IF NOT EXISTS appeal_sla_tracking (
    sla_id SERIAL PRIMARY KEY,
    appeal_id VARCHAR(255) NOT NULL REFERENCES appeals(appeal_id) ON DELETE CASCADE,
    
    -- SLA definitions
    target_resolution_hours INTEGER NOT NULL,
    warning_threshold_hours INTEGER, -- When to send warnings
    escalation_threshold_hours INTEGER, -- When to auto-escalate
    
    -- Status tracking
    sla_status VARCHAR(20) DEFAULT 'on_track' CHECK (sla_status IN (
        'on_track', 'at_risk', 'breached', 'paused', 'completed'
    )),
    breach_reason VARCHAR(200),
    pause_reason VARCHAR(200),
    paused_duration_hours INTEGER DEFAULT 0,
    
    -- Timeline tracking
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    warning_sent_at TIMESTAMP WITH TIME ZONE,
    escalated_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Performance metrics
    actual_resolution_hours DECIMAL(10,2),
    performance_rating VARCHAR(20) CHECK (performance_rating IN ('excellent', 'good', 'fair', 'poor'))
);

-- Appeal metrics aggregation
CREATE TABLE IF NOT EXISTS appeal_metrics (
    id SERIAL PRIMARY KEY,
    metric_date DATE NOT NULL,
    metric_hour INTEGER CHECK (metric_hour BETWEEN 0 AND 23),
    
    -- Volume metrics
    total_submissions INTEGER DEFAULT 0,
    total_resolutions INTEGER DEFAULT 0,
    pending_appeals INTEGER DEFAULT 0,
    
    -- Category breakdown
    by_category JSONB DEFAULT '{}'::jsonb,
    by_priority JSONB DEFAULT '{}'::jsonb,
    by_status JSONB DEFAULT '{}'::jsonb,
    
    -- Performance metrics
    avg_resolution_time_hours DECIMAL(10,2) DEFAULT 0,
    median_resolution_time_hours DECIMAL(10,2) DEFAULT 0,
    sla_compliance_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Outcome metrics
    approval_rate DECIMAL(5,2) DEFAULT 0,
    denial_rate DECIMAL(5,2) DEFAULT 0,
    dismissal_rate DECIMAL(5,2) DEFAULT 0,
    escalation_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Quality metrics
    avg_satisfaction_score DECIMAL(3,2) DEFAULT 0,
    resubmission_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Workload metrics
    reviewer_workload JSONB DEFAULT '{}'::jsonb,
    avg_caseload INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(metric_date, metric_hour)
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_appeals_status ON appeals(status);
CREATE INDEX IF NOT EXISTS idx_appeals_category ON appeals(category);
CREATE INDEX IF NOT EXISTS idx_appeals_priority ON appeals(priority);
CREATE INDEX IF NOT EXISTS idx_appeals_appellant ON appeals(appellant_id);
CREATE INDEX IF NOT EXISTS idx_appeals_reviewer ON appeals(assigned_reviewer_id);
CREATE INDEX IF NOT EXISTS idx_appeals_submitted_date ON appeals(submitted_at);
CREATE INDEX IF NOT EXISTS idx_appeals_target_resolution ON appeals(target_resolution_date);
CREATE INDEX IF NOT EXISTS idx_appeals_original_decision ON appeals(original_decision_id);

CREATE INDEX IF NOT EXISTS idx_appeal_evidence_appeal_id ON appeal_evidence(appeal_id);
CREATE INDEX IF NOT EXISTS idx_appeal_evidence_type ON appeal_evidence(evidence_type);
CREATE INDEX IF NOT EXISTS idx_appeal_evidence_status ON appeal_evidence(verification_status);

CREATE INDEX IF NOT EXISTS idx_appeal_timeline_appeal_id ON appeal_timeline(appeal_id);
CREATE INDEX IF NOT EXISTS idx_appeal_timeline_timestamp ON appeal_timeline(timestamp);
CREATE INDEX IF NOT EXISTS idx_appeal_timeline_event_type ON appeal_timeline(event_type);
CREATE INDEX IF NOT EXISTS idx_appeal_timeline_public ON appeal_timeline(public_visible) WHERE public_visible = true;

CREATE INDEX IF NOT EXISTS idx_appeal_escalations_appeal_id ON appeal_escalations(appeal_id);
CREATE INDEX IF NOT EXISTS idx_appeal_escalations_level ON appeal_escalations(escalation_level);
CREATE INDEX IF NOT EXISTS idx_appeal_escalations_reason ON appeal_escalations(escalation_reason);

CREATE INDEX IF NOT EXISTS idx_appeal_notifications_recipient ON appeal_notifications(recipient_id, recipient_type);
CREATE INDEX IF NOT EXISTS idx_appeal_notifications_appeal ON appeal_notifications(appeal_id);
CREATE INDEX IF NOT EXISTS idx_appeal_notifications_status ON appeal_notifications(delivery_status);

CREATE INDEX IF NOT EXISTS idx_appeal_sla_status ON appeal_sla_tracking(sla_status);
CREATE INDEX IF NOT EXISTS idx_appeal_sla_breach ON appeal_sla_tracking(sla_status) WHERE sla_status = 'breached';

CREATE INDEX IF NOT EXISTS idx_appeal_metrics_date ON appeal_metrics(metric_date);
CREATE INDEX IF NOT EXISTS idx_appeal_metrics_date_hour ON appeal_metrics(metric_date, metric_hour);

-- Triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_appeal_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_appeals_updated_at 
    BEFORE UPDATE ON appeals 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_appeal_updated_at_column();

-- Trigger for SLA tracking when appeal is submitted
CREATE OR REPLACE FUNCTION create_appeal_sla_tracking()
RETURNS TRIGGER AS $$
DECLARE
    target_hours INTEGER;
BEGIN
    -- Calculate target hours based on priority and complexity
    target_hours := CASE 
        WHEN NEW.priority = 'urgent' AND NEW.review_complexity = 'simple' THEN 4
        WHEN NEW.priority = 'urgent' AND NEW.review_complexity = 'standard' THEN 8
        WHEN NEW.priority = 'urgent' AND NEW.review_complexity = 'complex' THEN 24
        WHEN NEW.priority = 'urgent' AND NEW.review_complexity = 'critical' THEN 2
        WHEN NEW.priority = 'high' AND NEW.review_complexity = 'simple' THEN 8
        WHEN NEW.priority = 'high' AND NEW.review_complexity = 'standard' THEN 24
        WHEN NEW.priority = 'high' AND NEW.review_complexity = 'complex' THEN 72
        WHEN NEW.priority = 'high' AND NEW.review_complexity = 'critical' THEN 12
        WHEN NEW.priority = 'medium' AND NEW.review_complexity = 'simple' THEN 24
        WHEN NEW.priority = 'medium' AND NEW.review_complexity = 'standard' THEN 72
        WHEN NEW.priority = 'medium' AND NEW.review_complexity = 'complex' THEN 168
        WHEN NEW.priority = 'medium' AND NEW.review_complexity = 'critical' THEN 48
        ELSE 72 -- Default for low priority
    END;
    
    -- Create SLA tracking record
    INSERT INTO appeal_sla_tracking (
        appeal_id, 
        target_resolution_hours,
        warning_threshold_hours,
        escalation_threshold_hours
    ) VALUES (
        NEW.appeal_id,
        target_hours,
        target_hours * 0.8, -- Warning at 80% of target
        target_hours * 1.2  -- Escalate at 120% of target
    );
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER create_appeal_sla_tracking_trigger
    AFTER INSERT ON appeals
    FOR EACH ROW
    EXECUTE PROCEDURE create_appeal_sla_tracking();

-- Trigger to update SLA when appeal is resolved
CREATE OR REPLACE FUNCTION update_appeal_sla_completion()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status != NEW.status AND NEW.status IN ('approved', 'denied', 'dismissed', 'partially_approved') THEN
        UPDATE appeal_sla_tracking
        SET 
            completed_at = NOW(),
            sla_status = 'completed',
            actual_resolution_hours = EXTRACT(EPOCH FROM (NOW() - NEW.submitted_at)) / 3600,
            performance_rating = CASE
                WHEN EXTRACT(EPOCH FROM (NOW() - NEW.submitted_at)) / 3600 <= target_resolution_hours * 0.8 THEN 'excellent'
                WHEN EXTRACT(EPOCH FROM (NOW() - NEW.submitted_at)) / 3600 <= target_resolution_hours THEN 'good'
                WHEN EXTRACT(EPOCH FROM (NOW() - NEW.submitted_at)) / 3600 <= target_resolution_hours * 1.2 THEN 'fair'
                ELSE 'poor'
            END
        WHERE appeal_id = NEW.appeal_id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_appeal_sla_completion_trigger
    AFTER UPDATE ON appeals
    FOR EACH ROW
    EXECUTE PROCEDURE update_appeal_sla_completion();

-- Views for common queries
CREATE OR REPLACE VIEW active_appeals AS
SELECT a.*, 
       COUNT(ae.evidence_id) as evidence_count,
       COUNT(at.event_id) as timeline_events,
       ast.sla_status,
       ast.target_resolution_hours,
       ast.actual_resolution_hours,
       EXTRACT(EPOCH FROM (NOW() - a.submitted_at)) / 3600 as hours_since_submission
FROM appeals a
LEFT JOIN appeal_evidence ae ON a.appeal_id = ae.appeal_id
LEFT JOIN appeal_timeline at ON a.appeal_id = at.appeal_id
LEFT JOIN appeal_sla_tracking ast ON a.appeal_id = ast.appeal_id
WHERE a.status NOT IN ('approved', 'denied', 'dismissed', 'partially_approved')
GROUP BY a.appeal_id, ast.sla_status, ast.target_resolution_hours, ast.actual_resolution_hours;

CREATE OR REPLACE VIEW appeal_performance_summary AS
SELECT 
    DATE(a.submitted_at) as date,
    a.category,
    a.priority,
    COUNT(*) as total_appeals,
    COUNT(*) FILTER (WHERE a.status IN ('approved', 'partially_approved')) as approved_count,
    COUNT(*) FILTER (WHERE a.status = 'denied') as denied_count,
    COUNT(*) FILTER (WHERE a.status = 'dismissed') as dismissed_count,
    AVG(a.resolution_time_hours) as avg_resolution_hours,
    AVG(ast.actual_resolution_hours) as avg_actual_resolution_hours,
    COUNT(*) FILTER (WHERE ast.performance_rating = 'excellent') as excellent_performance,
    COUNT(*) FILTER (WHERE ast.performance_rating = 'poor') as poor_performance
FROM appeals a
LEFT JOIN appeal_sla_tracking ast ON a.appeal_id = ast.appeal_id
WHERE a.actual_resolution_date IS NOT NULL
GROUP BY DATE(a.submitted_at), a.category, a.priority;

-- Insert sample data for testing
INSERT INTO appeals (
    appeal_id, appellant_id, appellant_type, original_decision_id, original_decision_type,
    category, priority, subject, description, requested_outcome,
    review_complexity
) VALUES (
    'appeal-sample-001',
    'user-12345',
    'user',
    'enforcement-action-001',
    'automated_enforcement',
    'enforcement_action',
    'medium',
    'Appeal of Trust Score Restriction',
    'I believe my account was incorrectly restricted due to a false positive in the trust scoring system. The restriction was applied after a successful transaction that should have improved my score.',
    'Please review and lift the account restriction, and adjust my trust score to reflect accurate transaction history.',
    'standard'
);

-- Comments for documentation
COMMENT ON TABLE appeals IS 'Main appeal records for challenging trust and enforcement decisions';
COMMENT ON TABLE appeal_evidence IS 'Evidence submitted by appellants to support their case';
COMMENT ON TABLE appeal_timeline IS 'Complete activity log for appeal processing';
COMMENT ON TABLE appeal_review_criteria IS 'Structured review scoring and criteria evaluation';
COMMENT ON TABLE appeal_escalations IS 'Escalation tracking for complex or disputed appeals';
COMMENT ON TABLE appeal_precedents IS 'Precedent cases for consistent decision-making';
COMMENT ON TABLE appeal_notifications IS 'Communication log with appellants and reviewers';
COMMENT ON TABLE appeal_sla_tracking IS 'SLA monitoring and performance tracking';
COMMENT ON TABLE appeal_metrics IS 'Aggregated metrics for reporting and analysis';

COMMENT ON VIEW active_appeals IS 'Currently active appeals with key metrics';
COMMENT ON VIEW appeal_performance_summary IS 'Daily performance summary for appeals processing';