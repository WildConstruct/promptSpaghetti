-- Epic 16: Moderation Decision Recording System
-- Task: E16-1753114247059-819734 - Implement decision recording
-- 
-- Comprehensive decision recording system for moderation actions with
-- audit trails, appeal support, and analytics for content governance.

-- =============================================================================
-- Extensions and Configuration
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =============================================================================
-- Decision Recording Tables
-- =============================================================================

-- Main moderation decisions table
CREATE TABLE IF NOT EXISTS epic16_moderation_decisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Decision context
    case_id VARCHAR(50) NOT NULL, -- Unique case identifier
    content_id UUID NOT NULL, -- References various content tables
    content_type VARCHAR(30) NOT NULL CHECK (content_type IN (
        'template', 'review', 'forum_post', 'knowledge_article', 
        'tutorial', 'user_profile', 'comment', 'collection'
    )),
    
    -- Decision details
    decision_type VARCHAR(30) NOT NULL CHECK (decision_type IN (
        'approve', 'reject', 'flag', 'remove', 'warning', 'suspend',
        'escalate', 'require_changes', 'archive', 'restrict'
    )),
    decision_status VARCHAR(20) NOT NULL DEFAULT 'final' CHECK (decision_status IN (
        'draft', 'final', 'appealed', 'overturned', 'upheld'
    )),
    
    -- Decision reasoning
    primary_reason VARCHAR(50) NOT NULL,
    secondary_reasons TEXT[] DEFAULT '{}',
    detailed_reasoning TEXT NOT NULL,
    confidence_level INTEGER CHECK (confidence_level >= 1 AND confidence_level <= 5),
    
    -- Evidence and context
    evidence JSONB DEFAULT '{}', -- URLs, screenshots, quotes, etc.
    policy_references TEXT[] DEFAULT '{}', -- Specific policy sections cited
    precedent_cases UUID[] DEFAULT '{}', -- References to similar past decisions
    
    -- Decision maker information
    moderator_id UUID NOT NULL, -- Who made the decision
    moderator_type VARCHAR(20) DEFAULT 'human' CHECK (moderator_type IN ('human', 'ai', 'hybrid')),
    review_level VARCHAR(20) DEFAULT 'standard' CHECK (review_level IN ('automated', 'standard', 'senior', 'panel')),
    
    -- Timing and workflow
    decision_duration INTEGER, -- Time taken to decide (milliseconds)
    escalated_from UUID, -- Previous decision ID if escalated
    escalated_to UUID, -- Next decision ID if escalated
    
    -- Actions taken
    actions_taken JSONB DEFAULT '[]', -- Array of action objects
    automated_actions JSONB DEFAULT '[]', -- System-triggered actions
    notification_sent BOOLEAN DEFAULT FALSE,
    
    -- Appeal information
    is_appealable BOOLEAN DEFAULT TRUE,
    appeal_deadline TIMESTAMP WITH TIME ZONE,
    appeal_id UUID, -- Reference to appeal record
    
    -- Quality and feedback
    accuracy_rating INTEGER CHECK (accuracy_rating >= 1 AND accuracy_rating <= 5),
    feedback_received TEXT,
    training_case BOOLEAN DEFAULT FALSE, -- Used for moderator training
    
    -- Metadata
    metadata JSONB DEFAULT '{}', -- Additional context, tags, etc.
    internal_notes TEXT, -- Private moderator notes
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    effective_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT valid_reasoning CHECK (length(detailed_reasoning) >= 10),
    CONSTRAINT valid_case_id CHECK (length(case_id) >= 5)
);

-- Indexes for moderation decisions
CREATE INDEX idx_epic16_decisions_case ON epic16_moderation_decisions (case_id);
CREATE INDEX idx_epic16_decisions_content ON epic16_moderation_decisions (content_id, content_type);
CREATE INDEX idx_epic16_decisions_type ON epic16_moderation_decisions (decision_type);
CREATE INDEX idx_epic16_decisions_status ON epic16_moderation_decisions (decision_status);
CREATE INDEX idx_epic16_decisions_moderator ON epic16_moderation_decisions (moderator_id);
CREATE INDEX idx_epic16_decisions_created ON epic16_moderation_decisions (created_at DESC);
CREATE INDEX idx_epic16_decisions_effective ON epic16_moderation_decisions (effective_at DESC);
CREATE INDEX idx_epic16_decisions_appealable ON epic16_moderation_decisions (is_appealable, appeal_deadline) 
    WHERE is_appealable = TRUE;
CREATE INDEX idx_epic16_decisions_escalated ON epic16_moderation_decisions (escalated_from) 
    WHERE escalated_from IS NOT NULL;
CREATE INDEX idx_epic16_decisions_search ON epic16_moderation_decisions 
    USING gin (to_tsvector('english', detailed_reasoning || ' ' || COALESCE(feedback_received, '')));

-- Decision templates for consistency
CREATE TABLE IF NOT EXISTS epic16_decision_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Template information
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    
    -- Template content
    decision_type VARCHAR(30) NOT NULL,
    reason_code VARCHAR(50) NOT NULL,
    reason_template TEXT NOT NULL, -- Template with placeholders
    
    -- Usage settings
    is_active BOOLEAN DEFAULT TRUE,
    requires_customization BOOLEAN DEFAULT FALSE,
    minimum_evidence_required INTEGER DEFAULT 1,
    
    -- Policy context
    policy_sections TEXT[] DEFAULT '{}',
    severity_level VARCHAR(20) DEFAULT 'medium' CHECK (severity_level IN ('low', 'medium', 'high', 'critical')),
    
    -- Automated settings
    auto_apply_conditions JSONB, -- Conditions for automatic application
    suggested_actions JSONB DEFAULT '[]',
    
    -- Usage statistics
    usage_count INTEGER DEFAULT 0 CHECK (usage_count >= 0),
    effectiveness_score DECIMAL(3,2) CHECK (effectiveness_score >= 0 AND effectiveness_score <= 1),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT valid_template_name CHECK (length(name) > 0),
    CONSTRAINT valid_reason_template CHECK (length(reason_template) >= 10),
    UNIQUE(category, reason_code)
);

-- Indexes for decision templates
CREATE INDEX idx_epic16_decision_templates_category ON epic16_decision_templates (category);
CREATE INDEX idx_epic16_decision_templates_type ON epic16_decision_templates (decision_type);
CREATE INDEX idx_epic16_decision_templates_active ON epic16_decision_templates (is_active, category) 
    WHERE is_active = TRUE;
CREATE INDEX idx_epic16_decision_templates_usage ON epic16_decision_templates (usage_count DESC);

-- Decision history and changes
CREATE TABLE IF NOT EXISTS epic16_decision_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    decision_id UUID NOT NULL REFERENCES epic16_moderation_decisions(id) ON DELETE CASCADE,
    
    -- Change information
    change_type VARCHAR(30) NOT NULL CHECK (change_type IN (
        'created', 'updated', 'appealed', 'overturned', 'upheld', 
        'escalated', 'expired', 'revoked'
    )),
    
    -- Change details
    previous_data JSONB, -- Snapshot of previous state
    new_data JSONB, -- Snapshot of new state
    change_reason TEXT,
    
    -- Change context
    changed_by UUID NOT NULL, -- User who made the change
    change_source VARCHAR(20) DEFAULT 'manual' CHECK (change_source IN ('manual', 'automated', 'appeal', 'review')),
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for decision history
CREATE INDEX idx_epic16_decision_history_decision ON epic16_decision_history (decision_id);
CREATE INDEX idx_epic16_decision_history_type ON epic16_decision_history (change_type);
CREATE INDEX idx_epic16_decision_history_changed_by ON epic16_decision_history (changed_by);
CREATE INDEX idx_epic16_decision_history_created ON epic16_decision_history (created_at DESC);

-- Decision analytics and metrics
CREATE TABLE IF NOT EXISTS epic16_decision_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Time period
    date DATE NOT NULL,
    moderator_id UUID, -- NULL for aggregate metrics
    
    -- Decision volume metrics
    total_decisions INTEGER DEFAULT 0 CHECK (total_decisions >= 0),
    decisions_by_type JSONB DEFAULT '{}', -- {approve: 10, reject: 5, etc}
    decisions_by_reason JSONB DEFAULT '{}', -- {spam: 8, inappropriate: 7, etc}
    
    -- Quality metrics
    average_confidence DECIMAL(3,2) CHECK (average_confidence >= 1 AND average_confidence <= 5),
    average_decision_time INTEGER, -- milliseconds
    appeal_rate DECIMAL(5,2) CHECK (appeal_rate >= 0 AND appeal_rate <= 100),
    overturn_rate DECIMAL(5,2) CHECK (overturn_rate >= 0 AND overturn_rate <= 100),
    
    -- Efficiency metrics
    automated_decisions INTEGER DEFAULT 0 CHECK (automated_decisions >= 0),
    escalated_decisions INTEGER DEFAULT 0 CHECK (escalated_decisions >= 0),
    template_usage_rate DECIMAL(5,2) CHECK (template_usage_rate >= 0 AND template_usage_rate <= 100),
    
    -- Accuracy metrics
    accuracy_score DECIMAL(3,2) CHECK (accuracy_score >= 0 AND accuracy_score <= 1),
    consistency_score DECIMAL(3,2) CHECK (consistency_score >= 0 AND consistency_score <= 1),
    
    -- Content type breakdown
    content_type_breakdown JSONB DEFAULT '{}',
    
    -- Unique constraint for date and moderator
    UNIQUE(date, moderator_id)
);

-- Indexes for decision analytics
CREATE INDEX idx_epic16_decision_analytics_date ON epic16_decision_analytics (date DESC);
CREATE INDEX idx_epic16_decision_analytics_moderator ON epic16_decision_analytics (moderator_id) 
    WHERE moderator_id IS NOT NULL;
CREATE INDEX idx_epic16_decision_analytics_recent ON epic16_decision_analytics (date DESC, moderator_id) 
    WHERE date >= CURRENT_DATE - INTERVAL '30 days';

-- =============================================================================
-- Triggers and Functions
-- =============================================================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION epic16_decision_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updating timestamps
CREATE TRIGGER epic16_decision_templates_updated_at
    BEFORE UPDATE ON epic16_decision_templates
    FOR EACH ROW EXECUTE FUNCTION epic16_decision_update_timestamp();

CREATE TRIGGER epic16_moderation_decisions_updated_at
    BEFORE UPDATE ON epic16_moderation_decisions
    FOR EACH ROW EXECUTE FUNCTION epic16_decision_update_timestamp();

-- Function to record decision history
CREATE OR REPLACE FUNCTION epic16_record_decision_history()
RETURNS TRIGGER AS $$
BEGIN
    -- Record creation
    IF TG_OP = 'INSERT' THEN
        INSERT INTO epic16_decision_history (
            decision_id, change_type, new_data, changed_by, change_source
        ) VALUES (
            NEW.id, 'created', to_jsonb(NEW), NEW.moderator_id, 'manual'
        );
        RETURN NEW;
    END IF;
    
    -- Record updates
    IF TG_OP = 'UPDATE' THEN
        INSERT INTO epic16_decision_history (
            decision_id, change_type, previous_data, new_data, 
            changed_by, change_source, change_reason
        ) VALUES (
            NEW.id, 'updated', to_jsonb(OLD), to_jsonb(NEW),
            NEW.moderator_id, 'manual', 
            CASE 
                WHEN OLD.decision_status != NEW.decision_status 
                THEN 'Status changed: ' || OLD.decision_status || ' → ' || NEW.decision_status
                ELSE 'Decision updated'
            END
        );
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Trigger for recording decision history
CREATE TRIGGER epic16_record_decision_history_trigger
    AFTER INSERT OR UPDATE ON epic16_moderation_decisions
    FOR EACH ROW EXECUTE FUNCTION epic16_record_decision_history();

-- Function to update template usage statistics
CREATE OR REPLACE FUNCTION epic16_update_template_usage()
RETURNS TRIGGER AS $$
BEGIN
    -- Update usage count when template is used
    UPDATE epic16_decision_templates 
    SET 
        usage_count = usage_count + 1,
        last_used = NOW()
    WHERE reason_code = NEW.primary_reason;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for updating template usage
CREATE TRIGGER epic16_update_template_usage_trigger
    AFTER INSERT ON epic16_moderation_decisions
    FOR EACH ROW EXECUTE FUNCTION epic16_update_template_usage();

-- =============================================================================
-- Views for Common Queries
-- =============================================================================

-- View for recent decisions with moderator information
CREATE VIEW epic16_recent_decisions AS
SELECT 
    d.id,
    d.case_id,
    d.content_type,
    d.decision_type,
    d.decision_status,
    d.primary_reason,
    d.detailed_reasoning,
    d.moderator_id,
    d.confidence_level,
    d.is_appealable,
    d.created_at,
    d.effective_at,
    -- Calculate days since decision
    EXTRACT(DAY FROM NOW() - d.created_at) as days_ago,
    -- Appeal status
    CASE 
        WHEN d.appeal_deadline IS NOT NULL AND d.appeal_deadline > NOW() THEN 'appealable'
        WHEN d.appeal_id IS NOT NULL THEN 'appealed'
        ELSE 'final'
    END as appeal_status
FROM epic16_moderation_decisions d
WHERE d.created_at >= NOW() - INTERVAL '30 days'
ORDER BY d.created_at DESC;

-- View for decision quality metrics
CREATE VIEW epic16_decision_quality_metrics AS
SELECT 
    moderator_id,
    COUNT(*) as total_decisions,
    AVG(confidence_level) as avg_confidence,
    AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) * 1000) as avg_decision_time_ms,
    COUNT(CASE WHEN decision_status = 'appealed' THEN 1 END) as appeals_received,
    COUNT(CASE WHEN decision_status = 'overturned' THEN 1 END) as decisions_overturned,
    COUNT(CASE WHEN decision_status = 'upheld' THEN 1 END) as decisions_upheld,
    CASE 
        WHEN COUNT(CASE WHEN decision_status IN ('appealed', 'overturned', 'upheld') THEN 1 END) > 0
        THEN (COUNT(CASE WHEN decision_status = 'upheld' THEN 1 END)::DECIMAL / 
              COUNT(CASE WHEN decision_status IN ('appealed', 'overturned', 'upheld') THEN 1 END)) * 100
        ELSE NULL
    END as appeal_success_rate
FROM epic16_moderation_decisions
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY moderator_id;

-- =============================================================================
-- Initial Data and Templates
-- =============================================================================

-- Insert default decision templates
INSERT INTO epic16_decision_templates (
    name, description, category, decision_type, reason_code, reason_template,
    policy_sections, severity_level, suggested_actions
) VALUES 
-- Content violation templates
(
    'Inappropriate Content Removal',
    'Template for removing content that violates community guidelines',
    'content_violation',
    'remove',
    'inappropriate_content',
    'This content has been removed for violating our community guidelines regarding {violation_type}. Specifically: {specific_violation}. Please review our content policy at {policy_link}.',
    ARRAY['community_guidelines', 'content_policy'],
    'medium',
    '[{"type": "remove_content", "immediate": true}, {"type": "notify_user", "template": "content_removed"}]'::jsonb
),
(
    'Spam Content Warning',
    'Template for warning users about spam content',
    'content_violation', 
    'warning',
    'spam_content',
    'Your content appears to be spam or promotional in nature. {details}. Please ensure your contributions add value to the community.',
    ARRAY['spam_policy'],
    'low',
    '[{"type": "flag_content"}, {"type": "notify_user", "template": "spam_warning"}]'::jsonb
),
-- Template quality templates
(
    'Template Approval',
    'Standard template approval with quality confirmation',
    'template_review',
    'approve',
    'quality_approved',
    'Template approved for marketplace listing. Quality score: {quality_score}/10. {additional_notes}',
    ARRAY['template_quality_standards'],
    'low',
    '[{"type": "publish_template"}, {"type": "notify_creator", "template": "approved"}]'::jsonb
),
(
    'Template Requires Changes',
    'Template needs modifications before approval',
    'template_review',
    'require_changes',
    'needs_improvement',
    'Template requires the following changes before approval: {required_changes}. Please address these issues and resubmit.',
    ARRAY['template_quality_standards'],
    'medium',
    '[{"type": "set_draft_status"}, {"type": "notify_creator", "template": "changes_required"}]'::jsonb
),
-- User behavior templates
(
    'Account Suspension',
    'Template for temporary account suspension',
    'user_action',
    'suspend',
    'policy_violation',
    'Account suspended for {duration} due to: {violation_details}. This action is effective immediately.',
    ARRAY['user_conduct_policy'],
    'high',
    '[{"type": "suspend_account", "duration": "{duration}"}, {"type": "notify_user", "template": "suspension"}]'::jsonb
);

-- =============================================================================
-- Performance and Security
-- =============================================================================

-- Row Level Security (if needed)
-- ALTER TABLE epic16_moderation_decisions ENABLE ROW LEVEL SECURITY;

-- Grant permissions (adjust based on your user roles)
-- GRANT SELECT, INSERT, UPDATE ON epic16_moderation_decisions TO moderation_team;
-- GRANT SELECT ON epic16_decision_analytics TO analytics_team;

-- Comments for documentation
COMMENT ON TABLE epic16_moderation_decisions IS 'Comprehensive moderation decision records with audit trails and appeal support';
COMMENT ON TABLE epic16_decision_templates IS 'Standardized templates for consistent moderation decisions';
COMMENT ON TABLE epic16_decision_history IS 'Complete history of all changes to moderation decisions';
COMMENT ON TABLE epic16_decision_analytics IS 'Daily analytics and metrics for moderation decision quality and efficiency';

-- Final success message
DO $$
BEGIN
    RAISE NOTICE '✅ Epic 16 Moderation Decision Recording System created successfully';
    RAISE NOTICE '📊 Tables created: 4 core tables + 2 views';
    RAISE NOTICE '🔧 Features: Decision recording, templates, history tracking, analytics';
    RAISE NOTICE '⚡ Triggers: Automatic history recording, template usage tracking';
    RAISE NOTICE '📋 Default templates: 5 standard decision templates inserted';
    RAISE NOTICE '🚀 Decision recording system ready for Epic 16 moderation workflow';
END $$;