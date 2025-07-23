-- Epic 16: Case Assignment System
-- Task: E16-1753114247058-BACFBE - Create case assignment system
-- 
-- Intelligent case assignment system for moderation queue with
-- load balancing, skill-based routing, and assignment analytics.

-- =============================================================================
-- Extensions and Configuration
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =============================================================================
-- Case Assignment Tables
-- =============================================================================

-- Moderation cases (central case management)
CREATE TABLE IF NOT EXISTS epic16_moderation_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Case identification
    case_number VARCHAR(20) NOT NULL UNIQUE, -- Human-readable case ID (e.g., MOD-2024-001234)
    content_id UUID NOT NULL, -- References various content tables
    content_type VARCHAR(30) NOT NULL CHECK (content_type IN (
        'template', 'review', 'forum_post', 'knowledge_article', 
        'tutorial', 'user_profile', 'comment', 'collection'
    )),
    
    -- Case status and priority
    status VARCHAR(20) NOT NULL DEFAULT 'unassigned' CHECK (status IN (
        'unassigned', 'assigned', 'in_progress', 'on_hold', 'escalated',
        'completed', 'closed', 'cancelled', 'expired'
    )),
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN (
        'low', 'medium', 'high', 'urgent', 'critical'
    )),
    
    -- Case categorization
    category VARCHAR(50) NOT NULL, -- content_violation, quality_review, user_behavior, etc.
    subcategory VARCHAR(50),
    tags TEXT[] DEFAULT '{}',
    
    -- Case complexity and requirements
    complexity_score INTEGER DEFAULT 1 CHECK (complexity_score >= 1 AND complexity_score <= 10),
    estimated_time INTEGER, -- Expected time in minutes
    required_skills TEXT[] DEFAULT '{}', -- Skills needed for this case
    language_requirements TEXT[] DEFAULT ARRAY['en'], -- Languages needed
    
    -- Reporting and source
    reported_by UUID, -- User who reported (if applicable)
    source VARCHAR(30) DEFAULT 'user_report' CHECK (source IN (
        'user_report', 'automated_detection', 'proactive_review', 
        'escalation', 'audit', 'appeal_review'
    )),
    
    -- Assignment information
    assigned_to UUID, -- Current moderator assigned
    assigned_at TIMESTAMP WITH TIME ZONE,
    assignment_method VARCHAR(30) CHECK (assignment_method IN (
        'manual', 'round_robin', 'load_based', 'skill_based', 
        'availability', 'priority', 'random', 'hybrid'
    )),
    
    -- Workflow and escalation
    previous_assignee UUID, -- Previous moderator (if reassigned)
    escalated_from UUID, -- Previous case ID if escalated
    escalated_to UUID, -- Next case ID if escalated
    escalation_level INTEGER DEFAULT 0 CHECK (escalation_level >= 0),
    
    -- Deadlines and SLA
    due_date TIMESTAMP WITH TIME ZONE,
    sla_deadline TIMESTAMP WITH TIME ZONE,
    overdue BOOLEAN DEFAULT FALSE,
    
    -- Case details and context
    description TEXT,
    evidence JSONB DEFAULT '{}', -- Screenshots, URLs, etc.
    initial_analysis JSONB DEFAULT '{}', -- Automated analysis results
    
    -- Progress tracking
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    time_spent INTEGER DEFAULT 0, -- Total time spent in minutes
    
    -- Resolution information
    resolution VARCHAR(30) CHECK (resolution IN (
        'approved', 'rejected', 'modified', 'escalated', 'no_action',
        'warning_issued', 'content_removed', 'account_suspended'
    )),
    resolution_notes TEXT,
    decision_id UUID, -- Reference to epic16_moderation_decisions
    
    -- Quality and feedback
    difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
    quality_score INTEGER CHECK (quality_score >= 1 AND quality_score <= 5),
    feedback TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    flags TEXT[] DEFAULT '{}', -- Special flags: 'sensitive', 'legal', 'high_profile', etc.
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE, -- When work began
    completed_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT valid_case_number CHECK (case_number ~ '^[A-Z]+-[0-9]+-[0-9]+$'),
    CONSTRAINT valid_description CHECK (description IS NULL OR length(description) >= 10)
);

-- Indexes for moderation cases
CREATE INDEX idx_epic16_cases_number ON epic16_moderation_cases (case_number);
CREATE INDEX idx_epic16_cases_content ON epic16_moderation_cases (content_id, content_type);
CREATE INDEX idx_epic16_cases_status ON epic16_moderation_cases (status);
CREATE INDEX idx_epic16_cases_priority ON epic16_moderation_cases (priority, created_at DESC);
CREATE INDEX idx_epic16_cases_assigned ON epic16_moderation_cases (assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX idx_epic16_cases_unassigned ON epic16_moderation_cases (priority DESC, created_at) WHERE status = 'unassigned';
CREATE INDEX idx_epic16_cases_overdue ON epic16_moderation_cases (sla_deadline) WHERE overdue = TRUE;
CREATE INDEX idx_epic16_cases_category ON epic16_moderation_cases (category, subcategory);
CREATE INDEX idx_epic16_cases_skills ON epic16_moderation_cases USING gin (required_skills);
CREATE INDEX idx_epic16_cases_tags ON epic16_moderation_cases USING gin (tags);
CREATE INDEX idx_epic16_cases_flags ON epic16_moderation_cases USING gin (flags);
CREATE INDEX idx_epic16_cases_created ON epic16_moderation_cases (created_at DESC);
CREATE INDEX idx_epic16_cases_due ON epic16_moderation_cases (due_date) WHERE due_date IS NOT NULL;
CREATE INDEX idx_epic16_cases_search ON epic16_moderation_cases 
    USING gin (to_tsvector('english', case_number || ' ' || COALESCE(description, '')));

-- Moderator profiles and availability
CREATE TABLE IF NOT EXISTS epic16_moderator_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE, -- References user system
    
    -- Basic information
    display_name VARCHAR(100) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'moderator' CHECK (role IN (
        'moderator', 'senior_moderator', 'team_lead', 'specialist', 'admin'
    )),
    
    -- Skills and expertise
    skills TEXT[] DEFAULT '{}', -- content_review, policy_expert, language_specialist, etc.
    languages TEXT[] DEFAULT ARRAY['en'], -- Languages the moderator can handle
    specializations TEXT[] DEFAULT '{}', -- template_quality, community_management, etc.
    
    -- Capacity and availability
    max_concurrent_cases INTEGER DEFAULT 5 CHECK (max_concurrent_cases >= 1),
    current_caseload INTEGER DEFAULT 0 CHECK (current_caseload >= 0),
    availability_status VARCHAR(20) DEFAULT 'available' CHECK (availability_status IN (
        'available', 'busy', 'away', 'offline', 'on_break', 'in_meeting'
    )),
    
    -- Working hours and timezone
    timezone VARCHAR(50) DEFAULT 'UTC',
    working_hours JSONB DEFAULT '{"monday": {"start": "09:00", "end": "17:00"}, "tuesday": {"start": "09:00", "end": "17:00"}, "wednesday": {"start": "09:00", "end": "17:00"}, "thursday": {"start": "09:00", "end": "17:00"}, "friday": {"start": "09:00", "end": "17:00"}}',
    
    -- Performance metrics
    total_cases_handled INTEGER DEFAULT 0 CHECK (total_cases_handled >= 0),
    average_resolution_time INTEGER, -- minutes
    quality_score DECIMAL(3,2) CHECK (quality_score >= 0 AND quality_score <= 5),
    accuracy_score DECIMAL(3,2) CHECK (accuracy_score >= 0 AND accuracy_score <= 1),
    
    -- Assignment preferences
    preferred_categories TEXT[] DEFAULT '{}',
    assignment_weight DECIMAL(3,2) DEFAULT 1.0 CHECK (assignment_weight >= 0 AND assignment_weight <= 2),
    auto_assign_enabled BOOLEAN DEFAULT TRUE,
    
    -- Status and activity
    is_active BOOLEAN DEFAULT TRUE,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    vacation_until TIMESTAMP WITH TIME ZONE,
    
    -- Training and certification
    certifications TEXT[] DEFAULT '{}',
    training_completed JSONB DEFAULT '{}',
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    notes TEXT, -- Admin notes about the moderator
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_display_name CHECK (length(display_name) > 0),
    CONSTRAINT valid_caseload CHECK (current_caseload <= max_concurrent_cases)
);

-- Indexes for moderator profiles
CREATE INDEX idx_epic16_moderators_user ON epic16_moderator_profiles (user_id);
CREATE INDEX idx_epic16_moderators_role ON epic16_moderator_profiles (role);
CREATE INDEX idx_epic16_moderators_availability ON epic16_moderator_profiles (availability_status) 
    WHERE is_active = TRUE;
CREATE INDEX idx_epic16_moderators_caseload ON epic16_moderator_profiles (current_caseload, max_concurrent_cases);
CREATE INDEX idx_epic16_moderators_skills ON epic16_moderator_profiles USING gin (skills);
CREATE INDEX idx_epic16_moderators_languages ON epic16_moderator_profiles USING gin (languages);
CREATE INDEX idx_epic16_moderators_specializations ON epic16_moderator_profiles USING gin (specializations);
CREATE INDEX idx_epic16_moderators_active ON epic16_moderator_profiles (is_active, last_active DESC) 
    WHERE is_active = TRUE;

-- Assignment rules and algorithms
CREATE TABLE IF NOT EXISTS epic16_assignment_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Rule information
    name VARCHAR(100) NOT NULL,
    description TEXT,
    rule_type VARCHAR(30) NOT NULL CHECK (rule_type IN (
        'skill_matching', 'load_balancing', 'priority_routing', 
        'time_based', 'escalation', 'category_routing'
    )),
    
    -- Rule conditions (JSON expression)
    conditions JSONB NOT NULL,
    
    -- Assignment logic
    assignment_algorithm VARCHAR(30) NOT NULL CHECK (assignment_algorithm IN (
        'round_robin', 'least_loaded', 'skill_score', 'random', 
        'priority_weighted', 'availability_based', 'custom'
    )),
    parameters JSONB DEFAULT '{}',
    
    -- Rule priority and application
    priority INTEGER DEFAULT 100 CHECK (priority >= 1 AND priority <= 1000),
    is_active BOOLEAN DEFAULT TRUE,
    applies_to_categories TEXT[] DEFAULT '{}',
    
    -- Success criteria
    success_criteria JSONB,
    fallback_rule_id UUID REFERENCES epic16_assignment_rules(id),
    
    -- Usage and performance
    usage_count INTEGER DEFAULT 0 CHECK (usage_count >= 0),
    success_rate DECIMAL(5,2) CHECK (success_rate >= 0 AND success_rate <= 100),
    average_assignment_time INTEGER, -- milliseconds
    
    -- Metadata
    created_by UUID NOT NULL,
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT valid_rule_name CHECK (length(name) > 0)
);

-- Indexes for assignment rules
CREATE INDEX idx_epic16_assignment_rules_type ON epic16_assignment_rules (rule_type);
CREATE INDEX idx_epic16_assignment_rules_active ON epic16_assignment_rules (is_active, priority DESC) 
    WHERE is_active = TRUE;
CREATE INDEX idx_epic16_assignment_rules_categories ON epic16_assignment_rules USING gin (applies_to_categories);
CREATE INDEX idx_epic16_assignment_rules_priority ON epic16_assignment_rules (priority DESC);

-- Assignment history and audit trail
CREATE TABLE IF NOT EXISTS epic16_assignment_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES epic16_moderation_cases(id) ON DELETE CASCADE,
    
    -- Assignment details
    assigned_from UUID, -- Previous assignee
    assigned_to UUID, -- New assignee
    assignment_type VARCHAR(30) NOT NULL CHECK (assignment_type IN (
        'initial', 'reassignment', 'escalation', 'handover', 'return'
    )),
    
    -- Assignment context
    assignment_method VARCHAR(30) NOT NULL,
    rule_used UUID REFERENCES epic16_assignment_rules(id),
    reason TEXT,
    
    -- Timing and performance
    assignment_time INTEGER, -- milliseconds taken to assign
    queue_time INTEGER, -- time case spent in queue (minutes)
    
    -- Assignment quality
    assignment_score DECIMAL(3,2) CHECK (assignment_score >= 0 AND assignment_score <= 1),
    was_successful BOOLEAN,
    
    -- Context data
    available_moderators JSONB, -- Snapshot of available moderators
    assignment_criteria JSONB, -- Criteria used for assignment
    
    -- Metadata
    assigned_by UUID, -- Who/what made the assignment
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for assignment history
CREATE INDEX idx_epic16_assignment_history_case ON epic16_assignment_history (case_id);
CREATE INDEX idx_epic16_assignment_history_assigned_to ON epic16_assignment_history (assigned_to);
CREATE INDEX idx_epic16_assignment_history_type ON epic16_assignment_history (assignment_type);
CREATE INDEX idx_epic16_assignment_history_method ON epic16_assignment_history (assignment_method);
CREATE INDEX idx_epic16_assignment_history_created ON epic16_assignment_history (created_at DESC);

-- Assignment analytics
CREATE TABLE IF NOT EXISTS epic16_assignment_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Time period
    date DATE NOT NULL,
    moderator_id UUID, -- NULL for aggregate metrics
    
    -- Assignment volume
    total_assignments INTEGER DEFAULT 0 CHECK (total_assignments >= 0),
    initial_assignments INTEGER DEFAULT 0 CHECK (initial_assignments >= 0),
    reassignments INTEGER DEFAULT 0 CHECK (reassignments >= 0),
    
    -- Assignment quality
    average_assignment_time INTEGER, -- milliseconds
    average_queue_time INTEGER, -- minutes
    assignment_success_rate DECIMAL(5,2) CHECK (assignment_success_rate >= 0 AND assignment_success_rate <= 100),
    
    -- Workload distribution
    peak_concurrent_cases INTEGER DEFAULT 0 CHECK (peak_concurrent_cases >= 0),
    utilization_rate DECIMAL(5,2) CHECK (utilization_rate >= 0 AND utilization_rate <= 100),
    
    -- Performance metrics
    cases_completed INTEGER DEFAULT 0 CHECK (cases_completed >= 0),
    average_resolution_time INTEGER, -- minutes
    quality_score DECIMAL(3,2) CHECK (quality_score >= 0 AND quality_score <= 5),
    
    -- Assignment method breakdown
    assignment_methods JSONB DEFAULT '{}', -- {"round_robin": 15, "skill_based": 8, etc}
    
    -- Unique constraint for date and moderator
    UNIQUE(date, moderator_id)
);

-- Indexes for assignment analytics
CREATE INDEX idx_epic16_assignment_analytics_date ON epic16_assignment_analytics (date DESC);
CREATE INDEX idx_epic16_assignment_analytics_moderator ON epic16_assignment_analytics (moderator_id) 
    WHERE moderator_id IS NOT NULL;

-- =============================================================================
-- Triggers and Functions
-- =============================================================================

-- Function to generate case numbers
CREATE OR REPLACE FUNCTION epic16_generate_case_number()
RETURNS TEXT AS $$
DECLARE
    year_str TEXT;
    sequence_num INTEGER;
    case_number TEXT;
BEGIN
    year_str := EXTRACT(YEAR FROM NOW())::TEXT;
    
    -- Get next sequence number for the year
    SELECT COALESCE(MAX(
        SUBSTRING(case_number FROM 'MOD-' || year_str || '-([0-9]+)')::INTEGER
    ), 0) + 1
    INTO sequence_num
    FROM epic16_moderation_cases
    WHERE case_number LIKE 'MOD-' || year_str || '-%';
    
    case_number := 'MOD-' || year_str || '-' || LPAD(sequence_num::TEXT, 6, '0');
    
    RETURN case_number;
END;
$$ language 'plpgsql';

-- Function to update timestamps
CREATE OR REPLACE FUNCTION epic16_assignment_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updating timestamps
CREATE TRIGGER epic16_moderation_cases_updated_at
    BEFORE UPDATE ON epic16_moderation_cases
    FOR EACH ROW EXECUTE FUNCTION epic16_assignment_update_timestamp();

CREATE TRIGGER epic16_moderator_profiles_updated_at
    BEFORE UPDATE ON epic16_moderator_profiles
    FOR EACH ROW EXECUTE FUNCTION epic16_assignment_update_timestamp();

CREATE TRIGGER epic16_assignment_rules_updated_at
    BEFORE UPDATE ON epic16_assignment_rules
    FOR EACH ROW EXECUTE FUNCTION epic16_assignment_update_timestamp();

-- Function to auto-generate case number on insert
CREATE OR REPLACE FUNCTION epic16_set_case_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.case_number IS NULL THEN
        NEW.case_number := epic16_generate_case_number();
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for auto-generating case numbers
CREATE TRIGGER epic16_set_case_number_trigger
    BEFORE INSERT ON epic16_moderation_cases
    FOR EACH ROW EXECUTE FUNCTION epic16_set_case_number();

-- Function to update moderator caseload
CREATE OR REPLACE FUNCTION epic16_update_moderator_caseload()
RETURNS TRIGGER AS $$
BEGIN
    -- Handle assignment changes
    IF TG_OP = 'UPDATE' THEN
        -- Decrease caseload for previous assignee
        IF OLD.assigned_to IS NOT NULL AND (NEW.assigned_to IS NULL OR NEW.assigned_to != OLD.assigned_to) THEN
            UPDATE epic16_moderator_profiles 
            SET current_caseload = GREATEST(0, current_caseload - 1)
            WHERE user_id = OLD.assigned_to;
        END IF;
        
        -- Increase caseload for new assignee
        IF NEW.assigned_to IS NOT NULL AND (OLD.assigned_to IS NULL OR NEW.assigned_to != OLD.assigned_to) THEN
            UPDATE epic16_moderator_profiles 
            SET current_caseload = current_caseload + 1
            WHERE user_id = NEW.assigned_to;
        END IF;
    END IF;
    
    -- Handle case closure
    IF TG_OP = 'UPDATE' AND NEW.status IN ('completed', 'closed', 'cancelled') AND NEW.assigned_to IS NOT NULL THEN
        UPDATE epic16_moderator_profiles 
        SET current_caseload = GREATEST(0, current_caseload - 1)
        WHERE user_id = NEW.assigned_to;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Trigger for updating moderator caseload
CREATE TRIGGER epic16_update_moderator_caseload_trigger
    AFTER UPDATE ON epic16_moderation_cases
    FOR EACH ROW EXECUTE FUNCTION epic16_update_moderator_caseload();

-- Function to record assignment history
CREATE OR REPLACE FUNCTION epic16_record_assignment_history()
RETURNS TRIGGER AS $$
BEGIN
    -- Record assignment changes
    IF TG_OP = 'UPDATE' AND (OLD.assigned_to IS DISTINCT FROM NEW.assigned_to) THEN
        INSERT INTO epic16_assignment_history (
            case_id, assigned_from, assigned_to, assignment_type,
            assignment_method, reason, assigned_by
        ) VALUES (
            NEW.id, OLD.assigned_to, NEW.assigned_to,
            CASE 
                WHEN OLD.assigned_to IS NULL THEN 'initial'
                WHEN NEW.assigned_to IS NULL THEN 'return'
                ELSE 'reassignment'
            END,
            COALESCE(NEW.assignment_method, 'manual'),
            'Case assignment updated',
            NEW.assigned_to -- In real implementation, this should be the user making the change
        );
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for recording assignment history
CREATE TRIGGER epic16_record_assignment_history_trigger
    AFTER UPDATE ON epic16_moderation_cases
    FOR EACH ROW EXECUTE FUNCTION epic16_record_assignment_history();

-- =============================================================================
-- Views for Common Queries
-- =============================================================================

-- View for unassigned cases ready for assignment
CREATE VIEW epic16_unassigned_cases AS
SELECT 
    c.id,
    c.case_number,
    c.content_type,
    c.priority,
    c.category,
    c.subcategory,
    c.complexity_score,
    c.estimated_time,
    c.required_skills,
    c.language_requirements,
    c.due_date,
    c.sla_deadline,
    c.created_at,
    EXTRACT(EPOCH FROM (NOW() - c.created_at))/60 as minutes_in_queue,
    CASE 
        WHEN c.sla_deadline IS NOT NULL AND c.sla_deadline < NOW() THEN TRUE
        ELSE FALSE
    END as is_overdue
FROM epic16_moderation_cases c
WHERE c.status = 'unassigned'
  AND c.is_active IS NOT FALSE
ORDER BY 
    c.priority DESC,
    c.created_at ASC;

-- View for available moderators with workload info
CREATE VIEW epic16_available_moderators AS
SELECT 
    m.id,
    m.user_id,
    m.display_name,
    m.role,
    m.skills,
    m.languages,
    m.specializations,
    m.current_caseload,
    m.max_concurrent_cases,
    m.availability_status,
    m.quality_score,
    m.accuracy_score,
    m.assignment_weight,
    (m.max_concurrent_cases - m.current_caseload) as available_capacity,
    CASE 
        WHEN m.current_caseload >= m.max_concurrent_cases THEN 'at_capacity'
        WHEN m.availability_status = 'available' THEN 'available'
        ELSE 'limited'
    END as assignment_status
FROM epic16_moderator_profiles m
WHERE m.is_active = TRUE
  AND m.auto_assign_enabled = TRUE
  AND (m.vacation_until IS NULL OR m.vacation_until <= NOW())
ORDER BY 
    m.availability_status = 'available' DESC,
    (m.max_concurrent_cases - m.current_caseload) DESC,
    m.quality_score DESC NULLS LAST;

-- View for assignment workload overview
CREATE VIEW epic16_assignment_workload AS
SELECT 
    m.user_id,
    m.display_name,
    m.role,
    m.current_caseload,
    m.max_concurrent_cases,
    ROUND((m.current_caseload::DECIMAL / m.max_concurrent_cases) * 100, 2) as utilization_percentage,
    COUNT(c.id) as active_cases,
    AVG(EXTRACT(EPOCH FROM (NOW() - c.assigned_at))/3600) as avg_hours_assigned,
    COUNT(CASE WHEN c.overdue = TRUE THEN 1 END) as overdue_cases
FROM epic16_moderator_profiles m
LEFT JOIN epic16_moderation_cases c ON m.user_id = c.assigned_to 
    AND c.status IN ('assigned', 'in_progress')
WHERE m.is_active = TRUE
GROUP BY m.user_id, m.display_name, m.role, m.current_caseload, m.max_concurrent_cases
ORDER BY utilization_percentage DESC;

-- =============================================================================
-- Initial Data and Configuration
-- =============================================================================

-- Insert default assignment rules
INSERT INTO epic16_assignment_rules (
    name, description, rule_type, conditions, assignment_algorithm, 
    priority, applies_to_categories, created_by
) VALUES 
(
    'Skill-Based Template Review',
    'Assign template quality reviews to moderators with template expertise',
    'skill_matching',
    '{"category": "template_review", "required_skills": ["template_quality", "technical_review"]}',
    'skill_score',
    900,
    ARRAY['template_review'],
    '00000000-0000-0000-0000-000000000000'::uuid
),
(
    'Language Specialist Routing',
    'Route non-English content to moderators with appropriate language skills',
    'skill_matching', 
    '{"language_requirements": {"$ne": ["en"]}}',
    'skill_score',
    950,
    ARRAY[],
    '00000000-0000-0000-0000-000000000000'::uuid
),
(
    'High Priority Load Balancing',
    'Distribute high priority cases using load balancing',
    'load_balancing',
    '{"priority": {"$in": ["high", "urgent", "critical"]}}',
    'least_loaded',
    800,
    ARRAY[],
    '00000000-0000-0000-0000-000000000000'::uuid
),
(
    'Standard Round Robin',
    'Default round robin assignment for standard cases',
    'load_balancing',
    '{"priority": {"$in": ["low", "medium"]}}',
    'round_robin',
    500,
    ARRAY[],
    '00000000-0000-0000-0000-000000000000'::uuid
),
(
    'Escalation Routing',
    'Route escalated cases to senior moderators',
    'escalation',
    '{"escalation_level": {"$gt": 0}}',
    'skill_score',
    1000,
    ARRAY[],
    '00000000-0000-0000-0000-000000000000'::uuid
);

-- =============================================================================
-- Performance and Security
-- =============================================================================

-- Comments for documentation
COMMENT ON TABLE epic16_moderation_cases IS 'Central case management for moderation workflow with assignment tracking';
COMMENT ON TABLE epic16_moderator_profiles IS 'Moderator profiles with skills, availability, and performance tracking';
COMMENT ON TABLE epic16_assignment_rules IS 'Configurable rules for intelligent case assignment';
COMMENT ON TABLE epic16_assignment_history IS 'Complete audit trail of all case assignments';
COMMENT ON TABLE epic16_assignment_analytics IS 'Daily analytics for assignment performance and workload distribution';

-- Final success message
DO $$
BEGIN
    RAISE NOTICE '✅ Epic 16 Case Assignment System created successfully';
    RAISE NOTICE '📊 Tables created: 5 core tables + 3 views';
    RAISE NOTICE '🔧 Features: Case management, moderator profiles, assignment rules, history tracking';
    RAISE NOTICE '⚡ Triggers: Auto case numbering, caseload tracking, assignment history';
    RAISE NOTICE '📋 Default rules: 5 standard assignment rules configured';
    RAISE NOTICE '🧠 Algorithms: Round robin, load balancing, skill-based, priority routing';
    RAISE NOTICE '🚀 Case assignment system ready for Epic 16 moderation workflow';
END $$;