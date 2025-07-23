-- Epic 16 Feedback System Database Schema
-- Task: E16-1753114247084-CE7C08 - Create feedback system
-- 
-- Comprehensive feedback system supporting ratings, reviews, reports,
-- suggestions, bug reports, and moderation workflows.

-- =============================================================================
-- Core Feedback Tables
-- =============================================================================

-- Main feedback table
CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'rating', 'review', 'comment', 'report', 
        'suggestion', 'bug_report', 'feature_request'
    )),
    category VARCHAR(50) NOT NULL DEFAULT 'general' CHECK (category IN (
        'general', 'usability', 'performance', 'documentation',
        'pricing', 'support', 'technical', 'content_quality'
    )),
    
    -- Target information
    target_type VARCHAR(50) NOT NULL CHECK (target_type IN (
        'contribution', 'template', 'user', 'platform'
    )),
    target_id UUID NOT NULL,
    
    -- Author information
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_anonymous BOOLEAN DEFAULT FALSE,
    
    -- Content
    title VARCHAR(200),
    content TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    
    -- Status and visibility
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'approved', 'rejected', 'flagged', 'archived', 'resolved'
    )),
    visibility VARCHAR(20) NOT NULL DEFAULT 'public' CHECK (visibility IN (
        'public', 'private', 'moderated'
    )),
    
    -- Review-specific fields
    pros JSONB DEFAULT '[]'::jsonb,
    cons JSONB DEFAULT '[]'::jsonb,
    use_case TEXT,
    difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
    would_recommend BOOLEAN,
    verified_purchase BOOLEAN DEFAULT FALSE,
    purchase_date TIMESTAMP WITH TIME ZONE,
    
    -- Template usage metrics
    template_usage JSONB DEFAULT '{}'::jsonb,
    
    -- Report-specific fields
    reason VARCHAR(50) CHECK (reason IN (
        'inappropriate_content', 'spam', 'copyright_violation',
        'offensive_language', 'misleading_information', 'low_quality',
        'duplicate_content', 'terms_violation', 'other'
    )),
    severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    evidence JSONB DEFAULT '[]'::jsonb,
    
    -- Bug report fields
    priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    reproducible BOOLEAN DEFAULT FALSE,
    steps_to_reproduce JSONB DEFAULT '[]'::jsonb,
    expected_behavior TEXT,
    actual_behavior TEXT,
    environment JSONB DEFAULT '{}'::jsonb,
    
    -- Suggestion fields
    impact VARCHAR(20) CHECK (impact IN ('low', 'medium', 'high')),
    effort VARCHAR(20) CHECK (effort IN ('small', 'medium', 'large')),
    proposed_solution TEXT,
    benefits JSONB DEFAULT '[]'::jsonb,
    alternatives JSONB DEFAULT '[]'::jsonb,
    
    -- Implementation tracking
    implementation_status VARCHAR(20) DEFAULT 'pending' CHECK (implementation_status IN (
        'pending', 'in_progress', 'completed', 'rejected'
    )),
    implemented_by UUID REFERENCES users(id),
    implemented_at TIMESTAMP WITH TIME ZONE,
    implementation_notes TEXT,
    
    -- Assignment and investigation
    assigned_to UUID REFERENCES users(id),
    investigated_by UUID REFERENCES users(id),
    investigated_at TIMESTAMP WITH TIME ZONE,
    investigation_notes TEXT,
    action_taken TEXT,
    estimated_effort DECIMAL(10,2), -- hours
    fixed_at TIMESTAMP WITH TIME ZONE,
    fix_version VARCHAR(50),
    
    -- Moderation
    moderated_by UUID REFERENCES users(id),
    moderated_at TIMESTAMP WITH TIME ZONE,
    moderation_notes TEXT,
    rejection_reason TEXT,
    
    -- Engagement metrics (denormalized for performance)
    helpful_votes INTEGER DEFAULT 0,
    not_helpful_votes INTEGER DEFAULT 0,
    replies INTEGER DEFAULT 0,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Feedback attachments
CREATE TABLE IF NOT EXISTS feedback_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feedback_id UUID REFERENCES feedback(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('image', 'video', 'document', 'screenshot')),
    url TEXT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    size BIGINT NOT NULL,
    mime_type VARCHAR(100),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    uploaded_by UUID NOT NULL REFERENCES users(id)
);

-- Feedback votes (helpfulness)
CREATE TABLE IF NOT EXISTS feedback_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feedback_id UUID NOT NULL REFERENCES feedback(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vote_type VARCHAR(20) NOT NULL CHECK (vote_type IN ('helpful', 'not_helpful')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(feedback_id, user_id)
);

-- Feedback replies
CREATE TABLE IF NOT EXISTS feedback_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feedback_id UUID NOT NULL REFERENCES feedback(id) ON DELETE CASCADE,
    parent_reply_id UUID REFERENCES feedback_replies(id) ON DELETE CASCADE,
    
    -- Author information
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    author_type VARCHAR(20) DEFAULT 'user' CHECK (author_type IN (
        'user', 'creator', 'moderator', 'admin'
    )),
    
    -- Content
    content TEXT NOT NULL,
    
    -- Status
    status VARCHAR(20) DEFAULT 'visible' CHECK (status IN (
        'visible', 'hidden', 'deleted'
    )),
    
    -- Engagement
    likes INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    edited_at TIMESTAMP WITH TIME ZONE
);

-- Feedback reply attachments
CREATE TABLE IF NOT EXISTS feedback_reply_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reply_id UUID NOT NULL REFERENCES feedback_replies(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('image', 'document')),
    url TEXT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    size BIGINT NOT NULL,
    mime_type VARCHAR(100),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- Aggregation and Summary Tables
-- =============================================================================

-- Feedback summaries (cached aggregations)
CREATE TABLE IF NOT EXISTS feedback_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_id UUID NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    
    -- Rating summary
    average_rating DECIMAL(3,2) DEFAULT 0,
    total_ratings INTEGER DEFAULT 0,
    rating_distribution JSONB DEFAULT '{
        "1": 0, "2": 0, "3": 0, "4": 0, "5": 0
    }'::jsonb,
    
    -- Review summary
    total_reviews INTEGER DEFAULT 0,
    verified_reviews INTEGER DEFAULT 0,
    average_difficulty DECIMAL(3,2) DEFAULT 0,
    recommendation_rate DECIMAL(5,2) DEFAULT 0,
    
    -- General feedback counts
    total_feedback INTEGER DEFAULT 0,
    feedback_by_type JSONB DEFAULT '{}'::jsonb,
    feedback_by_category JSONB DEFAULT '{}'::jsonb,
    
    -- Engagement metrics
    total_helpful_votes INTEGER DEFAULT 0,
    total_replies INTEGER DEFAULT 0,
    
    -- Quality indicators
    quality_score INTEGER DEFAULT 0,
    moderation_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Summary data (full JSON for flexibility)
    summary_data JSONB NOT NULL,
    
    -- Timestamps
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(target_id)
);

-- =============================================================================
-- Activity and Audit Tables
-- =============================================================================

-- Feedback activity log
CREATE TABLE IF NOT EXISTS feedback_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feedback_id UUID NOT NULL REFERENCES feedback(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    user_id UUID REFERENCES users(id),
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Moderation queue
CREATE TABLE IF NOT EXISTS feedback_moderation_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feedback_id UUID NOT NULL REFERENCES feedback(id) ON DELETE CASCADE,
    priority INTEGER DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),
    assigned_to UUID REFERENCES users(id),
    queue_type VARCHAR(50) DEFAULT 'general',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    assigned_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(feedback_id)
);

-- =============================================================================
-- Indexes for Performance
-- =============================================================================

-- Primary lookup indexes
CREATE INDEX IF NOT EXISTS idx_feedback_target ON feedback(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_feedback_author ON feedback(author_id);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_type ON feedback(type);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON feedback(rating) WHERE rating IS NOT NULL;

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_feedback_target_status ON feedback(target_id, status);
CREATE INDEX IF NOT EXISTS idx_feedback_target_type_status ON feedback(target_type, target_id, status);
CREATE INDEX IF NOT EXISTS idx_feedback_author_status ON feedback(author_id, status);
CREATE INDEX IF NOT EXISTS idx_feedback_type_status ON feedback(type, status);

-- Moderation indexes
CREATE INDEX IF NOT EXISTS idx_feedback_moderation ON feedback(status, created_at) 
    WHERE status IN ('pending', 'flagged');
CREATE INDEX IF NOT EXISTS idx_feedback_moderated_by ON feedback(moderated_by, moderated_at);

-- Engagement indexes
CREATE INDEX IF NOT EXISTS idx_feedback_votes_feedback ON feedback_votes(feedback_id);
CREATE INDEX IF NOT EXISTS idx_feedback_votes_user ON feedback_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_replies_feedback ON feedback_replies(feedback_id);
CREATE INDEX IF NOT EXISTS idx_feedback_replies_author ON feedback_replies(author_id);

-- Attachment indexes
CREATE INDEX IF NOT EXISTS idx_feedback_attachments_feedback ON feedback_attachments(feedback_id);
CREATE INDEX IF NOT EXISTS idx_reply_attachments_reply ON feedback_reply_attachments(reply_id);

-- Summary indexes
CREATE INDEX IF NOT EXISTS idx_feedback_summaries_target ON feedback_summaries(target_id);
CREATE INDEX IF NOT EXISTS idx_feedback_summaries_updated ON feedback_summaries(last_updated DESC);

-- Activity log indexes
CREATE INDEX IF NOT EXISTS idx_feedback_activity_feedback ON feedback_activity_log(feedback_id);
CREATE INDEX IF NOT EXISTS idx_feedback_activity_user ON feedback_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_activity_created ON feedback_activity_log(created_at DESC);

-- Moderation queue indexes
CREATE INDEX IF NOT EXISTS idx_moderation_queue_priority ON feedback_moderation_queue(priority, created_at);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_assigned ON feedback_moderation_queue(assigned_to, assigned_at);

-- =============================================================================
-- Search Indexes (GIN for text search)
-- =============================================================================

-- Full-text search on feedback content
CREATE INDEX IF NOT EXISTS idx_feedback_content_search ON feedback 
    USING gin(to_tsvector('english', coalesce(title, '') || ' ' || content));

-- Search on user names (for filtering by author)
CREATE INDEX IF NOT EXISTS idx_feedback_author_name_search ON feedback 
    USING gin(to_tsvector('english', 
        (SELECT name FROM users WHERE users.id = feedback.author_id)
    ));

-- =============================================================================
-- Triggers for Automatic Updates
-- =============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_feedback_updated_at
    BEFORE UPDATE ON feedback
    FOR EACH ROW
    EXECUTE FUNCTION update_feedback_updated_at();

CREATE TRIGGER trigger_feedback_replies_updated_at
    BEFORE UPDATE ON feedback_replies
    FOR EACH ROW
    EXECUTE FUNCTION update_feedback_updated_at();

-- Auto-update feedback summary when feedback changes
CREATE OR REPLACE FUNCTION invalidate_feedback_summary()
RETURNS TRIGGER AS $$
BEGIN
    -- Delete cached summary to force regeneration
    DELETE FROM feedback_summaries 
    WHERE target_id = COALESCE(NEW.target_id, OLD.target_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_invalidate_feedback_summary
    AFTER INSERT OR UPDATE OR DELETE ON feedback
    FOR EACH ROW
    EXECUTE FUNCTION invalidate_feedback_summary();

-- Auto-update vote counts
CREATE OR REPLACE FUNCTION update_feedback_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.vote_type = 'helpful' THEN
            UPDATE feedback SET helpful_votes = helpful_votes + 1 WHERE id = NEW.feedback_id;
        ELSE
            UPDATE feedback SET not_helpful_votes = not_helpful_votes + 1 WHERE id = NEW.feedback_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.vote_type = 'helpful' THEN
            UPDATE feedback SET helpful_votes = helpful_votes - 1 WHERE id = OLD.feedback_id;
        ELSE
            UPDATE feedback SET not_helpful_votes = not_helpful_votes - 1 WHERE id = OLD.feedback_id;
        END IF;
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Handle vote type change
        IF OLD.vote_type = 'helpful' AND NEW.vote_type = 'not_helpful' THEN
            UPDATE feedback SET 
                helpful_votes = helpful_votes - 1,
                not_helpful_votes = not_helpful_votes + 1 
            WHERE id = NEW.feedback_id;
        ELSIF OLD.vote_type = 'not_helpful' AND NEW.vote_type = 'helpful' THEN
            UPDATE feedback SET 
                helpful_votes = helpful_votes + 1,
                not_helpful_votes = not_helpful_votes - 1 
            WHERE id = NEW.feedback_id;
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_feedback_vote_counts
    AFTER INSERT OR UPDATE OR DELETE ON feedback_votes
    FOR EACH ROW
    EXECUTE FUNCTION update_feedback_vote_counts();

-- Auto-update reply counts
CREATE OR REPLACE FUNCTION update_feedback_reply_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE feedback SET replies = replies + 1 WHERE id = NEW.feedback_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE feedback SET replies = replies - 1 WHERE id = OLD.feedback_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_feedback_reply_counts
    AFTER INSERT OR DELETE ON feedback_replies
    FOR EACH ROW
    EXECUTE FUNCTION update_feedback_reply_counts();

-- =============================================================================
-- Row Level Security (RLS)
-- =============================================================================

-- Enable RLS on sensitive tables
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_replies ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see public feedback and their own feedback
CREATE POLICY feedback_visibility_policy ON feedback
    FOR SELECT
    USING (
        visibility = 'public' AND status IN ('approved', 'pending')
        OR author_id = current_setting('app.current_user_id')::uuid
        OR current_setting('app.user_role') IN ('admin', 'moderator')
    );

-- Policy: Users can insert their own feedback
CREATE POLICY feedback_insert_policy ON feedback
    FOR INSERT
    WITH CHECK (author_id = current_setting('app.current_user_id')::uuid);

-- Policy: Users can update their own feedback (before moderation)
CREATE POLICY feedback_update_policy ON feedback
    FOR UPDATE
    USING (
        author_id = current_setting('app.current_user_id')::uuid
        AND status IN ('pending', 'approved')
        AND moderated_at IS NULL
    );

-- Policy: Users can delete their own feedback
CREATE POLICY feedback_delete_policy ON feedback
    FOR DELETE
    USING (
        author_id = current_setting('app.current_user_id')::uuid
        OR current_setting('app.user_role') IN ('admin', 'moderator')
    );

-- =============================================================================
-- Initial Data and Configuration
-- =============================================================================

-- Insert default moderation queue types
INSERT INTO feedback_moderation_queue (id, feedback_id, queue_type, priority, created_at)
SELECT 
    gen_random_uuid(),
    id,
    CASE 
        WHEN type = 'report' THEN 'reports'
        WHEN type = 'bug_report' THEN 'bugs'
        WHEN severity = 'critical' THEN 'urgent'
        ELSE 'general'
    END,
    CASE 
        WHEN severity = 'critical' THEN 1
        WHEN severity = 'high' THEN 2
        WHEN type = 'report' THEN 2
        ELSE 3
    END,
    created_at
FROM feedback 
WHERE status = 'pending'
ON CONFLICT (feedback_id) DO NOTHING;

-- Create indexes for frequently used JSONB queries
CREATE INDEX IF NOT EXISTS idx_feedback_pros_gin ON feedback USING gin(pros);
CREATE INDEX IF NOT EXISTS idx_feedback_cons_gin ON feedback USING gin(cons);
CREATE INDEX IF NOT EXISTS idx_feedback_evidence_gin ON feedback USING gin(evidence);
CREATE INDEX IF NOT EXISTS idx_feedback_steps_gin ON feedback USING gin(steps_to_reproduce);
CREATE INDEX IF NOT EXISTS idx_feedback_benefits_gin ON feedback USING gin(benefits);
CREATE INDEX IF NOT EXISTS idx_feedback_metadata_gin ON feedback USING gin(metadata);

-- Performance monitoring view
CREATE OR REPLACE VIEW feedback_performance_stats AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    type,
    COUNT(*) as total_feedback,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
    COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_count,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
    AVG(rating) FILTER (WHERE rating IS NOT NULL) as avg_rating,
    AVG(helpful_votes) as avg_helpful_votes
FROM feedback
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at), type
ORDER BY date DESC, type;

-- Moderation workload view
CREATE OR REPLACE VIEW moderation_workload AS
SELECT 
    queue_type,
    priority,
    COUNT(*) as pending_items,
    AVG(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - created_at))/3600) as avg_wait_hours,
    MIN(created_at) as oldest_item
FROM feedback_moderation_queue
WHERE completed_at IS NULL
GROUP BY queue_type, priority
ORDER BY priority, avg_wait_hours DESC;

-- Comments
COMMENT ON TABLE feedback IS 'Comprehensive feedback system supporting ratings, reviews, reports, suggestions, and bug reports';
COMMENT ON TABLE feedback_summaries IS 'Cached aggregations of feedback metrics for performance';
COMMENT ON TABLE feedback_votes IS 'User votes on feedback helpfulness';
COMMENT ON TABLE feedback_replies IS 'Threaded replies to feedback items';
COMMENT ON TABLE feedback_moderation_queue IS 'Queue for moderating feedback items';
COMMENT ON TABLE feedback_activity_log IS 'Audit log of all feedback-related activities';