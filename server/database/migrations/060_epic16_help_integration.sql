-- Epic 16 Help Integration Database Schema
-- Task: E16-1753114247189-025428 - Create integration architecture
-- 
-- Database schema for Epic 16 Help Integration system supporting
-- contextual help, cross-system transitions, support escalation,
-- and comprehensive analytics tracking.

-- =============================================================================
-- Help System Core Tables
-- =============================================================================

-- Help content management table
CREATE TABLE IF NOT EXISTS help_content (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('getting-started', 'node-creation', 'connection-flow', 'weight-adjustment', 'preview-generation', 'professional-workflow', 'troubleshooting', 'advanced-features')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    film_terminology TEXT,
    action_items JSONB,
    related_features TEXT[],
    level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced', 'professional')),
    context JSONB NOT NULL DEFAULT '{}',
    priority INTEGER DEFAULT 0,
    estimated_time_seconds INTEGER DEFAULT 0,
    interaction_tracking JSONB DEFAULT '{"viewRequired": false, "completionTracking": false, "feedbackEnabled": true}',
    system_scope TEXT NOT NULL CHECK (system_scope IN ('graph-editor', 'marketplace', 'both')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Create indexes for help content
CREATE INDEX IF NOT EXISTS idx_help_content_type ON help_content(type);
CREATE INDEX IF NOT EXISTS idx_help_content_level ON help_content(level);
CREATE INDEX IF NOT EXISTS idx_help_content_system_scope ON help_content(system_scope);
CREATE INDEX IF NOT EXISTS idx_help_content_context ON help_content USING gin(context);

-- Help sessions tracking table
CREATE TABLE IF NOT EXISTS help_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL, 
    session_type TEXT NOT NULL CHECK (session_type IN ('onboarding', 'feature-discovery', 'troubleshooting', 'purchase-assistance', 'template-creation', 'marketplace-navigation')),
    current_step INTEGER DEFAULT 0,
    total_steps INTEGER DEFAULT 0,
    system_context JSONB NOT NULL DEFAULT '{}',
    marketplace_context JSONB,
    graph_context JSONB,
    start_time TIMESTAMPTZ DEFAULT NOW(),
    last_activity TIMESTAMPTZ DEFAULT NOW(),
    end_time TIMESTAMPTZ,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned', 'escalated')),
    completed_actions TEXT[] DEFAULT '{}',
    skipped_content TEXT[] DEFAULT '{}',
    helpfulness_ratings JSONB DEFAULT '{}',
    escalation_level INTEGER DEFAULT 0,
    support_ticket_id TEXT,
    requires_human_assistance BOOLEAN DEFAULT false,
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for help sessions
CREATE INDEX IF NOT EXISTS idx_help_sessions_user_id ON help_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_help_sessions_status ON help_sessions(status);
CREATE INDEX IF NOT EXISTS idx_help_sessions_session_type ON help_sessions(session_type);
CREATE INDEX IF NOT EXISTS idx_help_sessions_start_time ON help_sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_help_sessions_support_ticket ON help_sessions(support_ticket_id);

-- =============================================================================
-- System Transition Tables
-- =============================================================================

-- System transitions tracking table
CREATE TABLE IF NOT EXISTS help_system_transitions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    from_system TEXT NOT NULL CHECK (from_system IN ('graph-editor', 'marketplace')),
    to_system TEXT NOT NULL CHECK (to_system IN ('graph-editor', 'marketplace')),
    preserve_help BOOLEAN DEFAULT true,
    transition_data JSONB,
    help_session_id TEXT,
    bridge_content_provided BOOLEAN DEFAULT false,
    transition_reason TEXT,
    successful BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for system transitions
CREATE INDEX IF NOT EXISTS idx_transitions_user_id ON help_system_transitions(user_id);
CREATE INDEX IF NOT EXISTS idx_transitions_systems ON help_system_transitions(from_system, to_system);
CREATE INDEX IF NOT EXISTS idx_transitions_created_at ON help_system_transitions(created_at);
CREATE INDEX IF NOT EXISTS idx_transitions_session_id ON help_system_transitions(help_session_id);

-- =============================================================================
-- User Profile and Preferences Tables
-- =============================================================================

-- User help profiles table
CREATE TABLE IF NOT EXISTS help_user_profiles (
    user_id TEXT PRIMARY KEY,
    level TEXT DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced', 'professional')),
    viewed_content TEXT[] DEFAULT '{}',
    completed_tours TEXT[] DEFAULT '{}',
    preferences JSONB DEFAULT '{
        "showFilmTerminology": true,
        "autoTriggerHelp": true,
        "preferredComplexity": "detailed",
        "filmIndustryRole": null
    }',
    progress JSONB DEFAULT '{
        "nodesCreated": 0,
        "connectionsBuilt": 0,
        "previewsGenerated": 0,
        "projectsCompleted": 0,
        "advancedFeaturesUsed": []
    }',
    first_help_session TIMESTAMPTZ,
    last_activity TIMESTAMPTZ DEFAULT NOW(),
    total_help_sessions INTEGER DEFAULT 0,
    total_escalations INTEGER DEFAULT 0,
    average_session_duration INTERVAL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for user profiles
CREATE INDEX IF NOT EXISTS idx_help_profiles_level ON help_user_profiles(level);
CREATE INDEX IF NOT EXISTS idx_help_profiles_last_activity ON help_user_profiles(last_activity);
CREATE INDEX IF NOT EXISTS idx_help_profiles_preferences ON help_user_profiles USING gin(preferences);

-- =============================================================================
-- Analytics and Tracking Tables
-- =============================================================================

-- Help system analytics table
CREATE TABLE IF NOT EXISTS help_system_analytics (
    id BIGSERIAL PRIMARY KEY,
    event_type TEXT NOT NULL,
    event_data JSONB NOT NULL,
    user_id TEXT,
    session_id TEXT,
    system_context TEXT CHECK (system_context IN ('graph-editor', 'marketplace', 'transition')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for analytics
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON help_system_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON help_system_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_session_id ON help_system_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON help_system_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_event_data ON help_system_analytics USING gin(event_data);

-- Content engagement tracking table
CREATE TABLE IF NOT EXISTS help_content_engagement (
    id BIGSERIAL PRIMARY KEY,
    content_id TEXT NOT NULL REFERENCES help_content(id),
    user_id TEXT NOT NULL,
    session_id TEXT REFERENCES help_sessions(id),
    engagement_type TEXT NOT NULL CHECK (engagement_type IN ('viewed', 'completed', 'skipped', 'rated', 'shared')),
    engagement_data JSONB DEFAULT '{}',
    time_spent_seconds INTEGER DEFAULT 0,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback_text TEXT,
    helpful BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for content engagement
CREATE INDEX IF NOT EXISTS idx_engagement_content_id ON help_content_engagement(content_id);
CREATE INDEX IF NOT EXISTS idx_engagement_user_id ON help_content_engagement(user_id);
CREATE INDEX IF NOT EXISTS idx_engagement_session_id ON help_content_engagement(session_id);
CREATE INDEX IF NOT EXISTS idx_engagement_type ON help_content_engagement(engagement_type);
CREATE INDEX IF NOT EXISTS idx_engagement_created_at ON help_content_engagement(created_at);

-- =============================================================================
-- Support Escalation Integration Tables
-- =============================================================================

-- Help escalation tracking table
CREATE TABLE IF NOT EXISTS help_escalations (
    id TEXT PRIMARY KEY,
    help_session_id TEXT NOT NULL REFERENCES help_sessions(id),
    user_id TEXT NOT NULL,
    escalation_reason TEXT NOT NULL,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    support_ticket_id TEXT,
    escalation_level INTEGER DEFAULT 1,
    user_description TEXT,
    system_state JSONB,
    additional_context JSONB,
    resolved BOOLEAN DEFAULT false,
    resolution_time INTERVAL,
    resolution_feedback JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for escalations
CREATE INDEX IF NOT EXISTS idx_escalations_session_id ON help_escalations(help_session_id);
CREATE INDEX IF NOT EXISTS idx_escalations_user_id ON help_escalations(user_id);
CREATE INDEX IF NOT EXISTS idx_escalations_ticket_id ON help_escalations(support_ticket_id);
CREATE INDEX IF NOT EXISTS idx_escalations_priority ON help_escalations(priority);
CREATE INDEX IF NOT EXISTS idx_escalations_resolved ON help_escalations(resolved);
CREATE INDEX IF NOT EXISTS idx_escalations_created_at ON help_escalations(created_at);

-- =============================================================================
-- Learning Paths and Progression Tables
-- =============================================================================

-- Learning paths definition table
CREATE TABLE IF NOT EXISTS help_learning_paths (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    target_role TEXT,
    target_level TEXT CHECK (target_level IN ('beginner', 'intermediate', 'advanced', 'professional')),
    system_scope TEXT CHECK (system_scope IN ('graph-editor', 'marketplace', 'both')),
    steps JSONB NOT NULL DEFAULT '[]',
    estimated_duration_minutes INTEGER DEFAULT 0,
    prerequisites TEXT[] DEFAULT '{}',
    created_by TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User learning path progress table
CREATE TABLE IF NOT EXISTS help_learning_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    learning_path_id TEXT NOT NULL REFERENCES help_learning_paths(id),
    current_step INTEGER DEFAULT 0,
    completed_steps INTEGER[] DEFAULT '{}',
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    last_activity TIMESTAMPTZ DEFAULT NOW(),
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    time_spent_minutes INTEGER DEFAULT 0,
    status TEXT DEFAULT 'in_progress' CHECK (status IN ('not_started', 'in_progress', 'completed', 'abandoned')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, learning_path_id)
);

-- Create indexes for learning paths
CREATE INDEX IF NOT EXISTS idx_learning_paths_target_level ON help_learning_paths(target_level);
CREATE INDEX IF NOT EXISTS idx_learning_paths_system_scope ON help_learning_paths(system_scope);
CREATE INDEX IF NOT EXISTS idx_learning_progress_user_id ON help_learning_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_progress_path_id ON help_learning_progress(learning_path_id);
CREATE INDEX IF NOT EXISTS idx_learning_progress_status ON help_learning_progress(status);

-- =============================================================================
-- Integration Points Configuration Table
-- =============================================================================

-- Integration points configuration table
CREATE TABLE IF NOT EXISTS help_integration_points (
    id TEXT PRIMARY KEY,
    from_system TEXT NOT NULL CHECK (from_system IN ('graph-editor', 'marketplace')),
    to_system TEXT NOT NULL CHECK (to_system IN ('graph-editor', 'marketplace')),
    trigger_condition TEXT NOT NULL,
    help_content_id TEXT REFERENCES help_content(id),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    configuration JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    success_metrics JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for integration points
CREATE INDEX IF NOT EXISTS idx_integration_points_systems ON help_integration_points(from_system, to_system);
CREATE INDEX IF NOT EXISTS idx_integration_points_trigger ON help_integration_points(trigger_condition);
CREATE INDEX IF NOT EXISTS idx_integration_points_active ON help_integration_points(is_active);

-- =============================================================================
-- Initial Data Population
-- =============================================================================

-- Insert default help content for marketplace
INSERT INTO help_content (id, type, title, content, level, system_scope, context, priority, estimated_time_seconds) 
VALUES 
    ('marketplace-getting-started', 'getting-started', 'Welcome to the Prompt Template Marketplace', 'Discover professional AI prompt templates created by the community. Learn how to search, preview, and purchase templates to enhance your creative workflow.', 'beginner', 'marketplace', '{"triggerElements": ["marketplace-home"], "actions": ["first-visit"]}', 10, 180),
    
    ('template-search-help', 'professional-workflow', 'Finding the Perfect Template', 'Use advanced search filters and categories to find templates that match your specific creative needs. Filter by industry, complexity, pricing, and user ratings.', 'intermediate', 'marketplace', '{"triggerElements": ["search-input", "filter-panel"], "actions": ["search-initiated"]}', 8, 120),
    
    ('purchase-workflow', 'professional-workflow', 'Template Purchase & Import', 'Complete your purchase and seamlessly import templates into your workflow. Review previews, check licensing, and integrate purchased content.', 'intermediate', 'marketplace', '{"triggerElements": ["purchase-button", "checkout-form"], "actions": ["purchase-initiated"]}', 9, 150),
    
    ('template-publishing', 'advanced-features', 'Share Your Templates', 'Publish your created templates to help the community and earn revenue. Set pricing, add descriptions, and manage your seller profile.', 'advanced', 'marketplace', '{"triggerElements": ["publish-template"], "actions": ["export-to-marketplace"]}', 7, 300),
    
    ('cross-system-transition', 'professional-workflow', 'Moving Between Editor and Marketplace', 'Seamlessly transition between graph editing and marketplace browsing while preserving your workflow context.', 'intermediate', 'both', '{"triggerElements": ["transition-button"], "actions": ["system-transition"]}', 9, 90)
ON CONFLICT (id) DO NOTHING;

-- Insert default learning paths
INSERT INTO help_learning_paths (id, name, description, target_level, system_scope, steps, estimated_duration_minutes)
VALUES 
    ('marketplace-onboarding', 'Marketplace Onboarding', 'Complete introduction to the template marketplace for new users', 'beginner', 'marketplace', '[{"contentId": "marketplace-getting-started", "requiredProgress": {}}, {"contentId": "template-search-help", "requiredProgress": {}}]', 15),
    
    ('advanced-marketplace', 'Advanced Marketplace Features', 'Master advanced marketplace features including publishing and analytics', 'advanced', 'marketplace', '[{"contentId": "template-publishing", "requiredProgress": {"projectsCompleted": 3}}, {"contentId": "cross-system-transition", "requiredProgress": {}}]', 30)
ON CONFLICT (id) DO NOTHING;

-- Insert default integration points
INSERT INTO help_integration_points (id, from_system, to_system, trigger_condition, help_content_id, priority)
VALUES 
    ('template-import-help', 'marketplace', 'graph-editor', 'template-purchase-completed', 'cross-system-transition', 'high'),
    ('template-creation-help', 'graph-editor', 'marketplace', 'graph-export-initiated', 'template-publishing', 'high'),
    ('search-to-creation', 'marketplace', 'graph-editor', 'no-search-results-found', 'cross-system-transition', 'medium')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- Functions and Triggers
-- =============================================================================

-- Function to update help user profile activity
CREATE OR REPLACE FUNCTION update_help_user_activity()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO help_user_profiles (user_id, last_activity, total_help_sessions)
    VALUES (NEW.user_id, NOW(), 1)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        last_activity = NOW(),
        total_help_sessions = help_user_profiles.total_help_sessions + 1,
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update user activity on new help session
DROP TRIGGER IF EXISTS trigger_update_help_user_activity ON help_sessions;
CREATE TRIGGER trigger_update_help_user_activity
    AFTER INSERT ON help_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_help_user_activity();

-- Function to calculate session duration on completion
CREATE OR REPLACE FUNCTION calculate_session_duration()
RETURNS TRIGGER AS $$
BEGIN
    -- Update session end time and calculate duration
    IF NEW.status IN ('completed', 'abandoned', 'escalated') AND OLD.status = 'active' THEN
        NEW.end_time = NOW();
        
        -- Update user profile with average session duration
        UPDATE help_user_profiles 
        SET average_session_duration = (
            SELECT AVG(end_time - start_time) 
            FROM help_sessions 
            WHERE user_id = NEW.user_id AND end_time IS NOT NULL
        ),
        updated_at = NOW()
        WHERE user_id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to calculate session duration
DROP TRIGGER IF EXISTS trigger_calculate_session_duration ON help_sessions;
CREATE TRIGGER trigger_calculate_session_duration
    BEFORE UPDATE ON help_sessions
    FOR EACH ROW
    EXECUTE FUNCTION calculate_session_duration();

-- =============================================================================
-- Views for Analytics and Reporting
-- =============================================================================

-- View for help system overview metrics
CREATE OR REPLACE VIEW help_system_metrics AS
SELECT 
    COUNT(DISTINCT hs.user_id) AS total_users,
    COUNT(hs.id) AS total_sessions,
    COUNT(CASE WHEN hs.status = 'completed' THEN 1 END) AS completed_sessions,
    COUNT(CASE WHEN hs.status = 'escalated' THEN 1 END) AS escalated_sessions,
    AVG(EXTRACT(EPOCH FROM (COALESCE(hs.end_time, NOW()) - hs.start_time))) AS avg_session_duration_seconds,
    COUNT(DISTINCT hst.id) AS total_transitions,
    COUNT(CASE WHEN hst.preserve_help = true THEN 1 END) AS transitions_with_help
FROM help_sessions hs
LEFT JOIN help_system_transitions hst ON hst.help_session_id = hs.id
WHERE hs.created_at >= NOW() - INTERVAL '30 days';

-- View for content engagement metrics
CREATE OR REPLACE VIEW help_content_metrics AS
SELECT 
    hc.id,
    hc.title,
    hc.type,
    hc.level,
    hc.system_scope,
    COUNT(hce.id) AS total_engagements,
    COUNT(CASE WHEN hce.engagement_type = 'completed' THEN 1 END) AS completions,
    COUNT(CASE WHEN hce.engagement_type = 'skipped' THEN 1 END) AS skips,
    AVG(hce.time_spent_seconds) AS avg_time_spent,
    AVG(hce.rating) AS avg_rating,
    COUNT(CASE WHEN hce.helpful = true THEN 1 END) AS helpful_votes
FROM help_content hc
LEFT JOIN help_content_engagement hce ON hce.content_id = hc.id
WHERE hc.is_active = true
GROUP BY hc.id, hc.title, hc.type, hc.level, hc.system_scope;

-- =============================================================================
-- Security and Permissions
-- =============================================================================

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_help_sessions_user_activity ON help_sessions(user_id, last_activity);
CREATE INDEX IF NOT EXISTS idx_analytics_user_session ON help_system_analytics(user_id, session_id);
CREATE INDEX IF NOT EXISTS idx_engagement_content_user ON help_content_engagement(content_id, user_id);

-- Grant appropriate permissions (adjust as needed for your security model)
-- GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO help_integration_service;
-- GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO help_integration_service;

COMMIT;