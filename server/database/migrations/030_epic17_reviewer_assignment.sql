-- Epic 17.5.1 Reviewer Assignment Migration
-- Creates database schema for marketplace reviewer assignment system

-- Create reviewer profiles table
CREATE TABLE IF NOT EXISTS reviewer_profiles (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(36) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL,
    specializations JSONB DEFAULT '[]',
    capacity_limit INTEGER DEFAULT 10,
    current_workload INTEGER DEFAULT 0,
    availability_status VARCHAR(20) DEFAULT 'available',
    skill_ratings JSONB DEFAULT '{}',
    performance_metrics JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create review assignments table
CREATE TABLE IF NOT EXISTS review_assignments (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    review_item_id VARCHAR(36) NOT NULL,
    review_type VARCHAR(50) NOT NULL,
    reviewer_id VARCHAR(36) NOT NULL REFERENCES reviewer_profiles(id),
    assignment_strategy VARCHAR(50) NOT NULL,
    assignment_reason TEXT,
    status VARCHAR(20) DEFAULT 'active',
    priority VARCHAR(20) DEFAULT 'medium',
    
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    assigned_by VARCHAR(36) NOT NULL,
    reassignment_count INTEGER DEFAULT 0,
    escalation_level INTEGER DEFAULT 0,
    
    estimated_duration_hours DECIMAL(5,2),
    actual_duration_hours DECIMAL(5,2),
    
    metadata JSONB DEFAULT '{}'
);

-- Create assignment rules table
CREATE TABLE IF NOT EXISTS assignment_rules (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    review_type VARCHAR(50) NOT NULL,
    conditions JSONB NOT NULL DEFAULT '[]',
    assignment_strategy VARCHAR(50) NOT NULL,
    priority_boost INTEGER DEFAULT 0,
    max_concurrent_assignments INTEGER DEFAULT 5,
    required_skills JSONB DEFAULT '[]',
    fallback_strategy VARCHAR(50) DEFAULT 'random',
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create assignment history for analytics
CREATE TABLE IF NOT EXISTS assignment_history (
    id BIGSERIAL PRIMARY KEY,
    assignment_id VARCHAR(36) NOT NULL REFERENCES review_assignments(id),
    action VARCHAR(50) NOT NULL,
    previous_status VARCHAR(20),
    new_status VARCHAR(20),
    previous_reviewer_id VARCHAR(36),
    new_reviewer_id VARCHAR(36),
    reason TEXT,
    performed_by VARCHAR(36) NOT NULL,
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Create reviewer performance snapshots for historical tracking
CREATE TABLE IF NOT EXISTS reviewer_performance_snapshots (
    id BIGSERIAL PRIMARY KEY,
    reviewer_id VARCHAR(36) NOT NULL REFERENCES reviewer_profiles(id),
    snapshot_date DATE NOT NULL,
    assignments_completed INTEGER DEFAULT 0,
    average_completion_time_hours DECIMAL(5,2),
    quality_rating DECIMAL(3,2),
    overdue_assignments INTEGER DEFAULT 0,
    escalations INTEGER DEFAULT 0,
    workload_efficiency DECIMAL(5,2), -- assignments/hour
    UNIQUE(reviewer_id, snapshot_date)
);

-- Create reviewer availability schedule
CREATE TABLE IF NOT EXISTS reviewer_availability_schedule (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    reviewer_id VARCHAR(36) NOT NULL REFERENCES reviewer_profiles(id),
    day_of_week INTEGER NOT NULL, -- 0=Sunday, 6=Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    timezone VARCHAR(50) DEFAULT 'UTC',
    is_active BOOLEAN DEFAULT TRUE,
    effective_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviewer skills taxonomy
CREATE TABLE IF NOT EXISTS reviewer_skills (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    required_for_review_types JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_reviewer_profiles_role ON reviewer_profiles(role);
CREATE INDEX IF NOT EXISTS idx_reviewer_profiles_availability ON reviewer_profiles(availability_status);
CREATE INDEX IF NOT EXISTS idx_reviewer_profiles_workload ON reviewer_profiles(current_workload);
CREATE INDEX IF NOT EXISTS idx_reviewer_profiles_user_id ON reviewer_profiles(user_id);

CREATE INDEX IF NOT EXISTS idx_review_assignments_reviewer ON review_assignments(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_review_assignments_status ON review_assignments(status);
CREATE INDEX IF NOT EXISTS idx_review_assignments_type ON review_assignments(review_type);
CREATE INDEX IF NOT EXISTS idx_review_assignments_due_date ON review_assignments(due_date);
CREATE INDEX IF NOT EXISTS idx_review_assignments_priority ON review_assignments(priority);
CREATE INDEX IF NOT EXISTS idx_review_assignments_item_type ON review_assignments(review_item_id, review_type);

CREATE INDEX IF NOT EXISTS idx_assignment_rules_type ON assignment_rules(review_type);
CREATE INDEX IF NOT EXISTS idx_assignment_rules_enabled ON assignment_rules(enabled);

CREATE INDEX IF NOT EXISTS idx_assignment_history_assignment ON assignment_history(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_history_performed_at ON assignment_history(performed_at);
CREATE INDEX IF NOT EXISTS idx_assignment_history_action ON assignment_history(action);

CREATE INDEX IF NOT EXISTS idx_reviewer_performance_reviewer_date ON reviewer_performance_snapshots(reviewer_id, snapshot_date);
CREATE INDEX IF NOT EXISTS idx_reviewer_performance_date ON reviewer_performance_snapshots(snapshot_date);

CREATE INDEX IF NOT EXISTS idx_reviewer_availability_reviewer ON reviewer_availability_schedule(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviewer_availability_day ON reviewer_availability_schedule(day_of_week);

-- Insert default reviewer skills
INSERT INTO reviewer_skills (skill_name, category, description, required_for_review_types) VALUES
('content_quality_assessment', 'content', 'Ability to assess content quality, originality, and technical standards', '["content_submission"]'),
('policy_compliance', 'compliance', 'Knowledge of marketplace policies and ability to assess violations', '["policy_violation", "content_submission"]'),
('technical_review', 'technical', 'Technical expertise for reviewing complex submissions', '["verification_request", "content_submission"]'),
('fraud_detection', 'security', 'Ability to identify fraudulent activities and suspicious patterns', '["transaction_dispute", "verification_request"]'),
('community_management', 'moderation', 'Experience in community moderation and user interaction', '["appeal_review"]'),
('legal_compliance', 'compliance', 'Knowledge of legal requirements and regulatory compliance', '["policy_violation", "verification_request"]'),
('financial_analysis', 'financial', 'Ability to analyze financial disputes and transactions', '["transaction_dispute"]'),
('escalation_handling', 'management', 'Experience handling escalated cases and complex decisions', '["appeal_review"]'),
('multimedia_assessment', 'content', 'Expertise in evaluating video, audio, and graphic content', '["content_submission", "featured_content"]'),
('user_verification', 'identity', 'Skills in identity verification and document validation', '["verification_request"]')
ON CONFLICT (skill_name) DO NOTHING;

-- Insert default assignment rules
INSERT INTO assignment_rules (review_type, assignment_strategy, conditions, required_skills, max_concurrent_assignments, priority_boost) VALUES
-- Content submission rules
('content_submission', 'skill_based', 
 '[{"field": "content_complexity", "operator": "equals", "value": "high", "weight": 1.0}]',
 '["content_quality_assessment", "technical_review"]',
 3, 0),

('content_submission', 'workload_based',
 '[{"field": "content_complexity", "operator": "equals", "value": "medium", "weight": 0.5}]',
 '["content_quality_assessment"]',
 5, 0),

-- Policy violation rules  
('policy_violation', 'skill_based',
 '[{"field": "violation_severity", "operator": "equals", "value": "high", "weight": 1.0}]',
 '["policy_compliance", "legal_compliance"]',
 2, 10),

('policy_violation', 'round_robin',
 '[{"field": "violation_severity", "operator": "in", "value": ["low", "medium"], "weight": 0.5}]',
 '["policy_compliance"]',
 4, 0),

-- Verification request rules
('verification_request', 'skill_based',
 '[{"field": "verification_type", "operator": "equals", "value": "identity", "weight": 1.0}]',
 '["user_verification", "fraud_detection"]',
 3, 5),

('verification_request', 'workload_based',
 '[{"field": "verification_type", "operator": "equals", "value": "document", "weight": 0.7}]',
 '["user_verification"]',
 4, 0),

-- Appeal review rules
('appeal_review', 'skill_based',
 '[{"field": "appeal_complexity", "operator": "equals", "value": "complex", "weight": 1.0}]',
 '["escalation_handling", "policy_compliance"]',
 2, 15),

-- Featured content rules
('featured_content', 'workload_based',
 '[{"field": "priority", "operator": "equals", "value": "high", "weight": 0.8}]',
 '["content_quality_assessment", "multimedia_assessment"]',
 3, 5),

-- Transaction dispute rules
('transaction_dispute', 'skill_based',
 '[{"field": "dispute_amount", "operator": "greater_than", "value": 1000, "weight": 1.0}]',
 '["financial_analysis", "fraud_detection"]',
 2, 8)
ON CONFLICT DO NOTHING;

-- Insert sample reviewer profiles for testing
INSERT INTO reviewer_profiles (user_id, role, specializations, capacity_limit, availability_status, skill_ratings, performance_metrics) VALUES
-- Senior content reviewers
('reviewer-001', 'content_reviewer', 
 '["content_quality_assessment", "multimedia_assessment", "technical_review"]',
 12, 'available',
 '{"content_quality_assessment": 9, "multimedia_assessment": 8, "technical_review": 7}',
 '{"total_reviews": 150, "completed_reviews": 148, "average_review_time_hours": 2.5, "quality_score": 9.2, "overturned_decisions": 3, "escalations_received": 1, "current_streak": 25, "last_review_date": "2024-01-15T10:00:00Z"}'),

('reviewer-002', 'policy_reviewer',
 '["policy_compliance", "legal_compliance", "community_management"]',
 10, 'available',
 '{"policy_compliance": 10, "legal_compliance": 9, "community_management": 8}',
 '{"total_reviews": 200, "completed_reviews": 195, "average_review_time_hours": 3.2, "quality_score": 9.5, "overturned_decisions": 2, "escalations_received": 0, "current_streak": 45, "last_review_date": "2024-01-15T14:30:00Z"}'),

-- Technical specialists
('reviewer-003', 'technical_reviewer',
 '["technical_review", "user_verification", "fraud_detection"]',
 8, 'busy',
 '{"technical_review": 9, "user_verification": 8, "fraud_detection": 9}',
 '{"total_reviews": 75, "completed_reviews": 73, "average_review_time_hours": 4.1, "quality_score": 8.8, "overturned_decisions": 1, "escalations_received": 2, "current_streak": 12, "last_review_date": "2024-01-15T09:15:00Z"}'),

-- Senior escalation reviewer
('reviewer-004', 'senior_reviewer',
 '["escalation_handling", "policy_compliance", "financial_analysis", "legal_compliance"]',
 6, 'available',
 '{"escalation_handling": 10, "policy_compliance": 9, "financial_analysis": 8, "legal_compliance": 9}',
 '{"total_reviews": 300, "completed_reviews": 295, "average_review_time_hours": 5.5, "quality_score": 9.8, "overturned_decisions": 0, "escalations_received": 0, "current_streak": 68, "last_review_date": "2024-01-15T16:45:00Z"}'),

-- Compliance specialist
('reviewer-005', 'compliance_reviewer',
 '["policy_compliance", "legal_compliance", "fraud_detection"]',
 10, 'available',
 '{"policy_compliance": 9, "legal_compliance": 10, "fraud_detection": 7}',
 '{"total_reviews": 120, "completed_reviews": 118, "average_review_time_hours": 3.8, "quality_score": 9.1, "overturned_decisions": 1, "escalations_received": 1, "current_streak": 18, "last_review_date": "2024-01-15T11:20:00Z"}')
ON CONFLICT (user_id) DO NOTHING;

-- Insert sample availability schedules
INSERT INTO reviewer_availability_schedule (reviewer_id, day_of_week, start_time, end_time, timezone) 
SELECT 
    rp.id,
    day_num,
    '09:00:00'::TIME,
    '17:00:00'::TIME,
    'UTC'
FROM reviewer_profiles rp
CROSS JOIN generate_series(1, 5) as day_num -- Monday to Friday
WHERE rp.user_id IN ('reviewer-001', 'reviewer-002', 'reviewer-003', 'reviewer-004', 'reviewer-005')
ON CONFLICT DO NOTHING;

-- Create view for reviewer dashboard
CREATE OR REPLACE VIEW reviewer_assignment_overview AS
SELECT 
    rp.id,
    rp.user_id,
    rp.role,
    rp.availability_status,
    rp.current_workload,
    rp.capacity_limit,
    ROUND((rp.current_workload::decimal / NULLIF(rp.capacity_limit, 0)) * 100, 1) as capacity_utilization,
    
    -- Active assignments
    COALESCE(active_assignments.count, 0) as active_assignments_count,
    COALESCE(overdue_assignments.count, 0) as overdue_assignments_count,
    
    -- Performance metrics
    (rp.performance_metrics->>'quality_score')::decimal as quality_score,
    (rp.performance_metrics->>'average_review_time_hours')::decimal as avg_review_time,
    (rp.performance_metrics->>'completed_reviews')::int as completed_reviews,
    
    -- Priority score for assignment algorithms
    (
        CASE rp.availability_status
            WHEN 'available' THEN 100
            WHEN 'busy' THEN 70
            WHEN 'away' THEN 30
            ELSE 0
        END +
        COALESCE((rp.performance_metrics->>'quality_score')::decimal * 10, 50) +
        (100 - LEAST(100, (rp.current_workload::decimal / NULLIF(rp.capacity_limit, 0)) * 100))
    ) as assignment_priority_score
    
FROM reviewer_profiles rp
LEFT JOIN (
    SELECT reviewer_id, COUNT(*) as count
    FROM review_assignments
    WHERE status = 'active'
    GROUP BY reviewer_id
) active_assignments ON rp.id = active_assignments.reviewer_id
LEFT JOIN (
    SELECT reviewer_id, COUNT(*) as count
    FROM review_assignments
    WHERE status = 'active' AND due_date < NOW()
    GROUP BY reviewer_id
) overdue_assignments ON rp.id = overdue_assignments.reviewer_id;

-- Create function for automatic reviewer selection
CREATE OR REPLACE FUNCTION select_best_reviewer(
    p_review_type VARCHAR(50),
    p_required_skills TEXT[] DEFAULT NULL,
    p_excluded_reviewers VARCHAR(36)[] DEFAULT NULL,
    p_strategy VARCHAR(50) DEFAULT 'workload_based'
) RETURNS TABLE(
    reviewer_id VARCHAR(36),
    assignment_reason TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rp.id,
        CONCAT('Auto-assigned using ', p_strategy, ' strategy') as reason
    FROM reviewer_profiles rp
    WHERE rp.availability_status IN ('available', 'busy')
        AND rp.current_workload < rp.capacity_limit
        AND (p_excluded_reviewers IS NULL OR rp.id != ALL(p_excluded_reviewers))
        AND (p_required_skills IS NULL OR rp.specializations ?| p_required_skills)
    ORDER BY 
        CASE 
            WHEN p_strategy = 'workload_based' THEN rp.current_workload
            WHEN p_strategy = 'skill_based' THEN -(
                SELECT AVG(COALESCE((rp.skill_ratings->>skill)::int, 0))
                FROM unnest(COALESCE(p_required_skills, ARRAY['general'])) as skill
            )
            WHEN p_strategy = 'round_robin' THEN EXTRACT(EPOCH FROM COALESCE((rp.performance_metrics->>'last_review_date')::timestamp, '1900-01-01'::timestamp))
            ELSE RANDOM()
        END
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_reviewer_profiles_updated_at
    BEFORE UPDATE ON reviewer_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_assignment_rules_updated_at
    BEFORE UPDATE ON assignment_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON reviewer_profiles TO policy_service;
GRANT SELECT, INSERT, UPDATE, DELETE ON review_assignments TO policy_service;
GRANT SELECT, INSERT, UPDATE, DELETE ON assignment_rules TO policy_service;
GRANT SELECT, INSERT, UPDATE, DELETE ON assignment_history TO policy_service;
GRANT SELECT, INSERT, UPDATE, DELETE ON reviewer_performance_snapshots TO policy_service;
GRANT SELECT, INSERT, UPDATE, DELETE ON reviewer_availability_schedule TO policy_service;
GRANT SELECT, INSERT, UPDATE, DELETE ON reviewer_skills TO policy_service;

GRANT SELECT ON reviewer_assignment_overview TO policy_service;
GRANT USAGE ON SEQUENCE assignment_history_id_seq TO policy_service;
GRANT USAGE ON SEQUENCE reviewer_performance_snapshots_id_seq TO policy_service;

-- Add comments for documentation
COMMENT ON TABLE reviewer_profiles IS 'Epic 17.5.1: Reviewer profiles with skills, capacity, and performance metrics';
COMMENT ON TABLE review_assignments IS 'Epic 17.5.1: Active and historical review assignments';
COMMENT ON TABLE assignment_rules IS 'Epic 17.5.1: Rules for automatic reviewer assignment';
COMMENT ON TABLE assignment_history IS 'Epic 17.5.1: Audit log for assignment changes';
COMMENT ON TABLE reviewer_performance_snapshots IS 'Epic 17.5.1: Historical performance tracking';
COMMENT ON TABLE reviewer_availability_schedule IS 'Epic 17.5.1: Reviewer working schedules';
COMMENT ON TABLE reviewer_skills IS 'Epic 17.5.1: Skill taxonomy for reviewer specializations';

COMMENT ON VIEW reviewer_assignment_overview IS 'Epic 17.5.1: Optimized view for reviewer assignment dashboard';
COMMENT ON FUNCTION select_best_reviewer IS 'Epic 17.5.1: Function for automatic reviewer selection';

-- Migration completion log
INSERT INTO schema_migrations (version, applied_at) VALUES ('030_epic17_reviewer_assignment', NOW())
ON CONFLICT (version) DO UPDATE SET applied_at = NOW();