-- Migration: Add Appeal Review Tables
-- Epic 17 - Trust & Verification System - Appeal Review System
-- Task: E17-1753114397385-5112BF

-- Appeal review workflows table
CREATE TABLE IF NOT EXISTS appeal_review_workflows (
    review_id VARCHAR(255) PRIMARY KEY,
    appeal_id VARCHAR(255) NOT NULL REFERENCES appeals(appeal_id) ON DELETE CASCADE,
    reviewer_id VARCHAR(255) NOT NULL,
    reviewer_expertise JSONB DEFAULT '[]'::jsonb,
    
    -- Workflow status and priority
    status VARCHAR(30) NOT NULL CHECK (status IN (
        'assigned', 'in_progress', 'peer_review', 'quality_check', 'completed', 'returned'
    )) DEFAULT 'assigned',
    priority VARCHAR(20) NOT NULL CHECK (priority IN (
        'routine', 'expedited', 'urgent', 'critical'
    )) DEFAULT 'routine',
    complexity VARCHAR(20) NOT NULL CHECK (complexity IN (
        'routine', 'standard', 'complex', 'exceptional'
    )) DEFAULT 'standard',
    
    -- Time tracking
    estimated_hours DECIMAL(5,2) NOT NULL,
    actual_hours DECIMAL(5,2),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Review phase tracking
    initial_assessment_completed BOOLEAN DEFAULT FALSE,
    evidence_review_completed BOOLEAN DEFAULT FALSE,
    precedent_analysis_completed BOOLEAN DEFAULT FALSE,
    decision_drafted BOOLEAN DEFAULT FALSE,
    peer_review_completed BOOLEAN DEFAULT FALSE,
    quality_assurance_completed BOOLEAN DEFAULT FALSE,
    
    -- Review content (stored as JSONB for flexibility)
    criteria JSONB DEFAULT '{}'::jsonb,
    recommendation JSONB DEFAULT '{}'::jsonb,
    draft_decision VARCHAR(30) CHECK (draft_decision IN (
        'approve', 'deny', 'partially_approve', 'dismiss', 'escalate', 'request_more_info'
    )),
    final_decision VARCHAR(30) CHECK (final_decision IN (
        'approve', 'deny', 'partially_approve', 'dismiss', 'escalate', 'request_more_info'
    )),
    
    -- Quality assurance
    quality_score INTEGER CHECK (quality_score BETWEEN 1 AND 100),
    quality_notes TEXT,
    requires_senior_review BOOLEAN DEFAULT FALSE,
    escalation_reason TEXT,
    
    -- Collaboration
    peer_reviewers JSONB DEFAULT '[]'::jsonb,
    senior_reviewer VARCHAR(255),
    quality_assessor VARCHAR(255),
    
    -- Documentation
    review_notes TEXT DEFAULT '',
    internal_comments TEXT DEFAULT '',
    public_summary TEXT DEFAULT '',
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Review templates for standardization
CREATE TABLE IF NOT EXISTS review_templates (
    template_id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(500) NOT NULL,
    description TEXT,
    appeal_categories JSONB DEFAULT '[]'::jsonb,
    reviewer_expertise_required JSONB DEFAULT '[]'::jsonb,
    
    -- Template structure
    criteria_weights JSONB NOT NULL,
    required_sections JSONB DEFAULT '[]'::jsonb,
    optional_sections JSONB DEFAULT '[]'::jsonb,
    
    -- Quality thresholds
    minimum_evidence_score INTEGER DEFAULT 70,
    minimum_policy_compliance_score INTEGER DEFAULT 75,
    required_precedent_review_count INTEGER DEFAULT 3,
    
    -- Workflow configuration
    requires_peer_review BOOLEAN DEFAULT FALSE,
    requires_senior_approval BOOLEAN DEFAULT FALSE,
    max_review_hours INTEGER DEFAULT 8,
    
    -- Usage tracking
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255) NOT NULL,
    last_updated_by VARCHAR(255)
);

-- Quality assessments for completed reviews
CREATE TABLE IF NOT EXISTS review_quality_assessments (
    assessment_id SERIAL PRIMARY KEY,
    review_id VARCHAR(255) NOT NULL REFERENCES appeal_review_workflows(review_id) ON DELETE CASCADE,
    assessor_id VARCHAR(255) NOT NULL,
    
    -- Quality scoring
    quality_score INTEGER NOT NULL CHECK (quality_score BETWEEN 1 AND 100),
    quality_notes TEXT,
    improvement_suggestions JSONB DEFAULT '[]'::jsonb,
    
    -- Detailed assessment criteria
    completeness_score INTEGER CHECK (completeness_score BETWEEN 1 AND 100),
    evidence_analysis_score INTEGER CHECK (evidence_analysis_score BETWEEN 1 AND 100),
    policy_compliance_score INTEGER CHECK (policy_compliance_score BETWEEN 1 AND 100),
    precedent_analysis_score INTEGER CHECK (precedent_analysis_score BETWEEN 1 AND 100),
    reasoning_clarity_score INTEGER CHECK (reasoning_clarity_score BETWEEN 1 AND 100),
    decision_consistency_score INTEGER CHECK (decision_consistency_score BETWEEN 1 AND 100),
    
    -- Assessment metadata
    assessment_type VARCHAR(20) CHECK (assessment_type IN (
        'routine', 'spot_check', 'complaint_driven', 'training'
    )) DEFAULT 'routine',
    assessment_duration_minutes INTEGER,
    
    -- Audit fields
    assessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviewer expertise and certification tracking
CREATE TABLE IF NOT EXISTS reviewer_expertise (
    expertise_id SERIAL PRIMARY KEY,
    reviewer_id VARCHAR(255) NOT NULL,
    expertise_area VARCHAR(50) NOT NULL CHECK (expertise_area IN (
        'trust_scoring', 'policy_enforcement', 'fraud_detection',
        'content_moderation', 'transaction_disputes', 'verification_issues',
        'technical_analysis', 'legal_compliance'
    )),
    
    -- Certification levels
    certification_level VARCHAR(20) CHECK (certification_level IN (
        'training', 'provisional', 'certified', 'senior', 'expert'
    )) DEFAULT 'training',
    certification_date TIMESTAMP WITH TIME ZONE,
    certification_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Performance tracking
    cases_handled INTEGER DEFAULT 0,
    avg_quality_score DECIMAL(5,2) DEFAULT 0,
    avg_completion_time_hours DECIMAL(5,2) DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Training and development
    training_completed JSONB DEFAULT '[]'::jsonb,
    training_required JSONB DEFAULT '[]'::jsonb,
    last_training_date TIMESTAMP WITH TIME ZONE,
    next_review_date TIMESTAMP WITH TIME ZONE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(reviewer_id, expertise_area)
);

-- Precedent case matching and analysis
CREATE TABLE IF NOT EXISTS precedent_matches (
    match_id SERIAL PRIMARY KEY,
    review_id VARCHAR(255) NOT NULL REFERENCES appeal_review_workflows(review_id) ON DELETE CASCADE,
    precedent_id VARCHAR(255) NOT NULL REFERENCES appeal_precedents(precedent_id),
    
    -- Similarity analysis
    similarity_score INTEGER NOT NULL CHECK (similarity_score BETWEEN 0 AND 100),
    matching_factors JSONB DEFAULT '[]'::jsonb,
    key_differences JSONB DEFAULT '[]'::jsonb,
    
    -- Precedent applicability
    binding_precedent BOOLEAN DEFAULT FALSE,
    jurisdiction_match BOOLEAN DEFAULT TRUE,
    policy_version_match BOOLEAN DEFAULT FALSE,
    
    -- Reviewer analysis
    relevance_rating INTEGER CHECK (relevance_rating BETWEEN 1 AND 10),
    reviewer_notes TEXT,
    applied_in_decision BOOLEAN DEFAULT FALSE,
    deviation_justification TEXT,
    
    -- Analysis metadata
    identified_by VARCHAR(20) CHECK (identified_by IN ('system', 'reviewer', 'peer_review')) DEFAULT 'system',
    analysis_confidence INTEGER CHECK (analysis_confidence BETWEEN 1 AND 100),
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    analyzed_at TIMESTAMP WITH TIME ZONE,
    analyzed_by VARCHAR(255)
);

-- Review collaboration and peer review tracking
CREATE TABLE IF NOT EXISTS review_collaboration (
    collaboration_id SERIAL PRIMARY KEY,
    review_id VARCHAR(255) NOT NULL REFERENCES appeal_review_workflows(review_id) ON DELETE CASCADE,
    collaborator_id VARCHAR(255) NOT NULL,
    
    -- Collaboration type
    collaboration_type VARCHAR(20) NOT NULL CHECK (collaboration_type IN (
        'peer_review', 'senior_review', 'quality_check', 'consultation', 'escalation'
    )),
    collaboration_status VARCHAR(20) DEFAULT 'requested' CHECK (collaboration_status IN (
        'requested', 'accepted', 'in_progress', 'completed', 'declined'
    )),
    
    -- Collaboration content
    request_reason TEXT,
    feedback JSONB DEFAULT '{}'::jsonb,
    recommendations JSONB DEFAULT '[]'::jsonb,
    approval_status VARCHAR(20) CHECK (approval_status IN (
        'approved', 'approved_with_conditions', 'rejected', 'needs_revision'
    )),
    
    -- Time tracking
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    estimated_hours DECIMAL(5,2),
    actual_hours DECIMAL(5,2),
    
    -- Quality assessment
    collaboration_quality_score INTEGER CHECK (collaboration_quality_score BETWEEN 1 AND 10),
    value_added_assessment TEXT,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Review decision templates and consistency tracking
CREATE TABLE IF NOT EXISTS decision_templates (
    template_id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(500) NOT NULL,
    decision_type VARCHAR(30) NOT NULL CHECK (decision_type IN (
        'approve', 'deny', 'partially_approve', 'dismiss', 'escalate'
    )),
    
    -- Template categories
    appeal_category VARCHAR(50) NOT NULL,
    violation_type VARCHAR(100),
    circumstances JSONB DEFAULT '{}'::jsonb,
    
    -- Decision framework
    decision_criteria JSONB NOT NULL,
    standard_reasoning JSONB NOT NULL,
    required_evidence JSONB DEFAULT '[]'::jsonb,
    mitigating_factors JSONB DEFAULT '[]'::jsonb,
    aggravating_factors JSONB DEFAULT '[]'::jsonb,
    
    -- Implementation guidance
    standard_actions JSONB DEFAULT '[]'::jsonb,
    follow_up_requirements JSONB DEFAULT '[]'::jsonb,
    appeal_period_days INTEGER DEFAULT 30,
    monitoring_requirements JSONB DEFAULT '[]'::jsonb,
    
    -- Usage and effectiveness tracking
    usage_count INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0,
    consistency_score DECIMAL(5,2) DEFAULT 0,
    last_review_date TIMESTAMP WITH TIME ZONE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    approval_required BOOLEAN DEFAULT FALSE,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255) NOT NULL,
    approved_by VARCHAR(255)
);

-- Appeal review metrics aggregation
CREATE TABLE IF NOT EXISTS review_performance_metrics (
    id SERIAL PRIMARY KEY,
    metric_date DATE NOT NULL,
    metric_hour INTEGER CHECK (metric_hour BETWEEN 0 AND 23),
    reviewer_id VARCHAR(255),
    
    -- Volume metrics
    reviews_assigned INTEGER DEFAULT 0,
    reviews_completed INTEGER DEFAULT 0,
    reviews_in_progress INTEGER DEFAULT 0,
    reviews_overdue INTEGER DEFAULT 0,
    
    -- Quality metrics
    avg_quality_score DECIMAL(5,2) DEFAULT 0,
    quality_assessments_count INTEGER DEFAULT 0,
    peer_reviews_requested INTEGER DEFAULT 0,
    peer_reviews_completed INTEGER DEFAULT 0,
    
    -- Efficiency metrics
    avg_completion_time_hours DECIMAL(5,2) DEFAULT 0,
    median_completion_time_hours DECIMAL(5,2) DEFAULT 0,
    on_time_completion_rate DECIMAL(5,2) DEFAULT 0,
    sla_compliance_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Decision metrics
    decisions_by_type JSONB DEFAULT '{}'::jsonb,
    decision_consistency_score DECIMAL(5,2) DEFAULT 0,
    precedent_usage_rate DECIMAL(5,2) DEFAULT 0,
    escalation_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Collaboration metrics
    peer_review_participation_rate DECIMAL(5,2) DEFAULT 0,
    avg_collaboration_quality_score DECIMAL(5,2) DEFAULT 0,
    
    -- Training and development
    training_hours_completed DECIMAL(5,2) DEFAULT 0,
    certification_updates INTEGER DEFAULT 0,
    improvement_areas JSONB DEFAULT '[]'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(metric_date, metric_hour, reviewer_id)
);

-- Indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_review_workflows_appeal_id ON appeal_review_workflows(appeal_id);
CREATE INDEX IF NOT EXISTS idx_review_workflows_reviewer ON appeal_review_workflows(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_review_workflows_status ON appeal_review_workflows(status);
CREATE INDEX IF NOT EXISTS idx_review_workflows_priority ON appeal_review_workflows(priority);
CREATE INDEX IF NOT EXISTS idx_review_workflows_complexity ON appeal_review_workflows(complexity);
CREATE INDEX IF NOT EXISTS idx_review_workflows_deadline ON appeal_review_workflows(deadline);
CREATE INDEX IF NOT EXISTS idx_review_workflows_assigned_at ON appeal_review_workflows(assigned_at);

CREATE INDEX IF NOT EXISTS idx_review_templates_categories ON review_templates USING GIN(appeal_categories);
CREATE INDEX IF NOT EXISTS idx_review_templates_expertise ON review_templates USING GIN(reviewer_expertise_required);
CREATE INDEX IF NOT EXISTS idx_review_templates_active ON review_templates(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_quality_assessments_review ON review_quality_assessments(review_id);
CREATE INDEX IF NOT EXISTS idx_quality_assessments_assessor ON review_quality_assessments(assessor_id);
CREATE INDEX IF NOT EXISTS idx_quality_assessments_score ON review_quality_assessments(quality_score);
CREATE INDEX IF NOT EXISTS idx_quality_assessments_date ON review_quality_assessments(assessed_at);

CREATE INDEX IF NOT EXISTS idx_reviewer_expertise_reviewer ON reviewer_expertise(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviewer_expertise_area ON reviewer_expertise(expertise_area);
CREATE INDEX IF NOT EXISTS idx_reviewer_expertise_level ON reviewer_expertise(certification_level);
CREATE INDEX IF NOT EXISTS idx_reviewer_expertise_active ON reviewer_expertise(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_precedent_matches_review ON precedent_matches(review_id);
CREATE INDEX IF NOT EXISTS idx_precedent_matches_precedent ON precedent_matches(precedent_id);
CREATE INDEX IF NOT EXISTS idx_precedent_matches_similarity ON precedent_matches(similarity_score);
CREATE INDEX IF NOT EXISTS idx_precedent_matches_binding ON precedent_matches(binding_precedent) WHERE binding_precedent = true;

CREATE INDEX IF NOT EXISTS idx_review_collaboration_review ON review_collaboration(review_id);
CREATE INDEX IF NOT EXISTS idx_review_collaboration_collaborator ON review_collaboration(collaborator_id);
CREATE INDEX IF NOT EXISTS idx_review_collaboration_type ON review_collaboration(collaboration_type);
CREATE INDEX IF NOT EXISTS idx_review_collaboration_status ON review_collaboration(collaboration_status);

CREATE INDEX IF NOT EXISTS idx_decision_templates_category ON decision_templates(appeal_category);
CREATE INDEX IF NOT EXISTS idx_decision_templates_decision_type ON decision_templates(decision_type);
CREATE INDEX IF NOT EXISTS idx_decision_templates_active ON decision_templates(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_review_metrics_date ON review_performance_metrics(metric_date);
CREATE INDEX IF NOT EXISTS idx_review_metrics_reviewer ON review_performance_metrics(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_review_metrics_date_reviewer ON review_performance_metrics(metric_date, reviewer_id);

-- Triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_review_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_review_workflows_updated_at 
    BEFORE UPDATE ON appeal_review_workflows 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_review_updated_at_column();

CREATE TRIGGER update_review_templates_updated_at 
    BEFORE UPDATE ON review_templates 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_review_updated_at_column();

CREATE TRIGGER update_reviewer_expertise_updated_at 
    BEFORE UPDATE ON reviewer_expertise 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_review_updated_at_column();

CREATE TRIGGER update_review_collaboration_updated_at 
    BEFORE UPDATE ON review_collaboration 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_review_updated_at_column();

CREATE TRIGGER update_decision_templates_updated_at 
    BEFORE UPDATE ON decision_templates 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_review_updated_at_column();

-- Trigger to update template usage count
CREATE OR REPLACE FUNCTION increment_template_usage()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE review_templates 
    SET usage_count = usage_count + 1 
    WHERE template_id = NEW.template_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update reviewer expertise metrics
CREATE OR REPLACE FUNCTION update_reviewer_metrics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update reviewer expertise when review is completed
    IF OLD.status != 'completed' AND NEW.status = 'completed' THEN
        UPDATE reviewer_expertise 
        SET 
            cases_handled = cases_handled + 1,
            avg_quality_score = (
                (avg_quality_score * cases_handled + COALESCE(NEW.quality_score, 0)) 
                / (cases_handled + 1)
            ),
            avg_completion_time_hours = (
                (avg_completion_time_hours * cases_handled + COALESCE(NEW.actual_hours, 0))
                / (cases_handled + 1)
            )
        WHERE reviewer_id = NEW.reviewer_id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_reviewer_metrics_trigger
    AFTER UPDATE ON appeal_review_workflows
    FOR EACH ROW
    EXECUTE PROCEDURE update_reviewer_metrics();

-- Views for common queries and dashboards
CREATE OR REPLACE VIEW active_reviews AS
SELECT 
    rw.*,
    a.category as appeal_category,
    a.priority as appeal_priority,
    a.appellant_id,
    a.subject as appeal_subject,
    EXTRACT(EPOCH FROM (NOW() - rw.assigned_at)) / 3600 as hours_since_assigned,
    EXTRACT(EPOCH FROM (rw.deadline - NOW())) / 3600 as hours_until_deadline,
    CASE 
        WHEN rw.deadline < NOW() THEN 'overdue'
        WHEN rw.deadline < NOW() + INTERVAL '24 hours' THEN 'due_soon'
        ELSE 'on_track'
    END as deadline_status
FROM appeal_review_workflows rw
JOIN appeals a ON rw.appeal_id = a.appeal_id
WHERE rw.status IN ('assigned', 'in_progress', 'peer_review', 'quality_check');

CREATE OR REPLACE VIEW reviewer_performance_summary AS
SELECT 
    rw.reviewer_id,
    COUNT(*) as total_reviews,
    COUNT(*) FILTER (WHERE rw.status = 'completed') as completed_reviews,
    COUNT(*) FILTER (WHERE rw.completed_at <= rw.deadline) as on_time_reviews,
    COUNT(*) FILTER (WHERE rw.completed_at > rw.deadline) as overdue_reviews,
    AVG(rw.actual_hours) as avg_completion_hours,
    AVG(rw.quality_score) as avg_quality_score,
    COUNT(*) FILTER (WHERE rw.requires_senior_review = true) as escalated_reviews,
    AVG(CASE WHEN rw.status = 'completed' 
        THEN EXTRACT(EPOCH FROM (rw.completed_at - rw.assigned_at)) / 3600 
        ELSE NULL END) as avg_turnaround_hours
FROM appeal_review_workflows rw
WHERE rw.assigned_at >= NOW() - INTERVAL '30 days'
GROUP BY rw.reviewer_id;

CREATE OR REPLACE VIEW review_quality_trends AS
SELECT 
    DATE_TRUNC('week', qa.assessed_at) as week_start,
    qa.assessor_id,
    COUNT(*) as assessments_count,
    AVG(qa.quality_score) as avg_quality_score,
    AVG(qa.completeness_score) as avg_completeness,
    AVG(qa.evidence_analysis_score) as avg_evidence_analysis,
    AVG(qa.reasoning_clarity_score) as avg_reasoning_clarity,
    STDDEV(qa.quality_score) as quality_score_variance
FROM review_quality_assessments qa
WHERE qa.assessed_at >= NOW() - INTERVAL '12 weeks'
GROUP BY DATE_TRUNC('week', qa.assessed_at), qa.assessor_id
ORDER BY week_start DESC, qa.assessor_id;

-- Insert default review templates
INSERT INTO review_templates (
    template_id, name, description, appeal_categories, reviewer_expertise_required,
    criteria_weights, required_sections, minimum_evidence_score, requires_peer_review, created_by
) VALUES (
    'tmpl-enforcement-standard',
    'Standard Enforcement Appeal Review',
    'Standard template for reviewing enforcement action appeals',
    '["enforcement_action"]'::jsonb,
    '["trust_scoring", "policy_enforcement"]'::jsonb,
    '{
        "factual_accuracy": 20,
        "policy_compliance": 25,
        "procedural_fairness": 20,
        "evidence_quality": 15,
        "proportionality": 15,
        "precedent_analysis": 5
    }'::jsonb,
    '["initial_assessment", "evidence_review", "policy_analysis", "decision_draft"]'::jsonb,
    75,
    false,
    'system'
), (
    'tmpl-trust-score-complex',
    'Complex Trust Score Appeal Review',
    'Template for complex trust score calculation appeals',
    '["trust_score"]'::jsonb,
    '["trust_scoring", "technical_analysis"]'::jsonb,
    '{
        "factual_accuracy": 25,
        "policy_compliance": 20,
        "procedural_fairness": 15,
        "evidence_quality": 20,
        "proportionality": 10,
        "precedent_analysis": 10
    }'::jsonb,
    '["initial_assessment", "technical_analysis", "evidence_review", "precedent_review", "decision_draft"]'::jsonb,
    80,
    true,
    'system'
);

-- Insert default decision templates
INSERT INTO decision_templates (
    template_id, name, decision_type, appeal_category, decision_criteria,
    standard_reasoning, standard_actions, created_by
) VALUES (
    'decision-approve-enforcement',
    'Approve Enforcement Action Appeal',
    'approve',
    'enforcement_action',
    '{
        "evidence_sufficiency": "strong",
        "policy_compliance": "violated",
        "procedural_errors": "none",
        "proportionality": "appropriate"
    }'::jsonb,
    '{
        "key_factors": ["Original decision was procedurally correct", "Evidence supports overturning", "Policy was misapplied"],
        "supporting_evidence": "Appellant provided compelling documentation",
        "precedent_consistency": "Decision aligns with similar cases"
    }'::jsonb,
    '[
        {"action": "reverse_enforcement", "immediate": true},
        {"action": "restore_account_status", "immediate": true},
        {"action": "update_trust_score", "immediate": false},
        {"action": "notify_appellant", "immediate": true}
    ]'::jsonb,
    'system'
), (
    'decision-deny-trust-score',
    'Deny Trust Score Appeal',
    'deny',
    'trust_score',
    '{
        "evidence_sufficiency": "insufficient",
        "calculation_accuracy": "correct",
        "procedural_compliance": "followed",
        "alternative_explanation": "none"
    }'::jsonb,
    '{
        "key_factors": ["Trust score calculation was accurate", "No procedural errors identified", "Appellant evidence insufficient"],
        "supporting_evidence": "System logs confirm proper calculation methodology",
        "risk_factors": "No indication of system error or bias"
    }'::jsonb,
    '[
        {"action": "maintain_current_score", "immediate": true},
        {"action": "notify_appellant_with_explanation", "immediate": true},
        {"action": "document_precedent", "immediate": false}
    ]'::jsonb,
    'system'
);

-- Comments for documentation
COMMENT ON TABLE appeal_review_workflows IS 'Structured workflows for reviewing appeals with quality tracking';
COMMENT ON TABLE review_templates IS 'Standardized templates for consistent appeal review processes';
COMMENT ON TABLE review_quality_assessments IS 'Quality assessments of completed reviews for improvement';
COMMENT ON TABLE reviewer_expertise IS 'Reviewer certification and expertise area tracking';
COMMENT ON TABLE precedent_matches IS 'Analysis of similar precedent cases for consistency';
COMMENT ON TABLE review_collaboration IS 'Peer review and collaboration tracking';
COMMENT ON TABLE decision_templates IS 'Standardized decision templates for consistency';
COMMENT ON TABLE review_performance_metrics IS 'Aggregated performance metrics for reviewers and process';

COMMENT ON VIEW active_reviews IS 'Currently active reviews with deadline tracking';
COMMENT ON VIEW reviewer_performance_summary IS 'Reviewer performance metrics over rolling 30-day period';
COMMENT ON VIEW review_quality_trends IS 'Quality trend analysis over 12-week rolling window';