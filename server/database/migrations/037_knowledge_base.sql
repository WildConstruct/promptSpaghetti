-- Epic 16 Story 16.4 - Knowledge Base & Learning Resources Database Schema
-- Comprehensive knowledge base with articles, tutorials, case studies, and learning paths

-- Knowledge Articles table
CREATE TABLE IF NOT EXISTS knowledge_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    slug VARCHAR(600) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    tags JSONB,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    difficulty_level VARCHAR(20) NOT NULL DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    estimated_read_time INTEGER NOT NULL DEFAULT 5,
    views_count INTEGER NOT NULL DEFAULT 0,
    likes_count INTEGER NOT NULL DEFAULT 0,
    helpful_count INTEGER NOT NULL DEFAULT 0,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_community_contributed BOOLEAN NOT NULL DEFAULT false,
    related_articles JSONB,
    attachments JSONB,
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Knowledge Tutorials table
CREATE TABLE IF NOT EXISTS knowledge_tutorials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    slug VARCHAR(600) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    tags JSONB,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    difficulty_level VARCHAR(20) NOT NULL DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    estimated_duration INTEGER NOT NULL, -- total minutes
    prerequisites JSONB,
    learning_objectives JSONB NOT NULL,
    completion_count INTEGER NOT NULL DEFAULT 0,
    rating DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    review_count INTEGER NOT NULL DEFAULT 0,
    is_interactive BOOLEAN NOT NULL DEFAULT false,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tutorial Steps table
CREATE TABLE IF NOT EXISTS tutorial_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tutorial_id UUID NOT NULL REFERENCES knowledge_tutorials(id) ON DELETE CASCADE,
    order_number INTEGER NOT NULL,
    title VARCHAR(300) NOT NULL,
    content TEXT NOT NULL,
    step_type VARCHAR(20) NOT NULL DEFAULT 'instruction' CHECK (step_type IN ('instruction', 'example', 'exercise', 'quiz', 'checkpoint')),
    media JSONB,
    interactive_elements JSONB,
    estimated_duration INTEGER NOT NULL DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tutorial_id, order_number)
);

-- Knowledge Case Studies table
CREATE TABLE IF NOT EXISTS knowledge_case_studies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    slug VARCHAR(600) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    tags JSONB,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    industry VARCHAR(100) NOT NULL,
    use_case VARCHAR(200) NOT NULL,
    challenge TEXT NOT NULL,
    solution TEXT NOT NULL,
    results TEXT NOT NULL,
    metrics JSONB,
    templates_used JSONB,
    screenshots JSONB,
    views_count INTEGER NOT NULL DEFAULT 0,
    likes_count INTEGER NOT NULL DEFAULT 0,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learning Paths table
CREATE TABLE IF NOT EXISTS knowledge_learning_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    slug VARCHAR(600) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    difficulty_level VARCHAR(20) NOT NULL DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    estimated_duration INTEGER NOT NULL, -- total minutes
    prerequisites JSONB,
    learning_objectives JSONB NOT NULL,
    completion_count INTEGER NOT NULL DEFAULT 0,
    rating DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learning Path Steps table
CREATE TABLE IF NOT EXISTS learning_path_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learning_path_id UUID NOT NULL REFERENCES knowledge_learning_paths(id) ON DELETE CASCADE,
    step_type VARCHAR(20) NOT NULL CHECK (step_type IN ('article', 'tutorial', 'case_study')),
    resource_id UUID NOT NULL,
    order_number INTEGER NOT NULL,
    is_required BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(learning_path_id, order_number)
);

-- Knowledge Views tracking table
CREATE TABLE IF NOT EXISTS knowledge_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('article', 'tutorial', 'case_study', 'learning_path')),
    content_id UUID NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Knowledge Ratings/Feedback table
CREATE TABLE IF NOT EXISTS knowledge_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('article', 'tutorial', 'case_study', 'learning_path')),
    content_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_helpful BOOLEAN NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(content_type, content_id, user_id)
);

-- Tutorial Progress tracking
CREATE TABLE IF NOT EXISTS tutorial_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tutorial_id UUID NOT NULL REFERENCES knowledge_tutorials(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    current_step_id UUID REFERENCES tutorial_steps(id) ON DELETE SET NULL,
    completed_steps JSONB NOT NULL DEFAULT '[]',
    progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    time_spent INTEGER NOT NULL DEFAULT 0, -- minutes
    is_completed BOOLEAN NOT NULL DEFAULT false,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(tutorial_id, user_id)
);

-- Learning Path Progress tracking
CREATE TABLE IF NOT EXISTS learning_path_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learning_path_id UUID NOT NULL REFERENCES knowledge_learning_paths(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    completed_steps JSONB NOT NULL DEFAULT '[]',
    progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    time_spent INTEGER NOT NULL DEFAULT 0, -- minutes
    is_completed BOOLEAN NOT NULL DEFAULT false,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(learning_path_id, user_id)
);

-- Knowledge Bookmarks table
CREATE TABLE IF NOT EXISTS knowledge_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('article', 'tutorial', 'case_study', 'learning_path')),
    content_id UUID NOT NULL,
    folder_name VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, content_type, content_id)
);

-- Knowledge Comments table (for community discussions on content)
CREATE TABLE IF NOT EXISTS knowledge_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('article', 'tutorial', 'case_study', 'learning_path')),
    content_id UUID NOT NULL,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_comment_id UUID REFERENCES knowledge_comments(id) ON DELETE CASCADE,
    likes_count INTEGER NOT NULL DEFAULT 0,
    is_solution BOOLEAN NOT NULL DEFAULT false,
    is_moderated BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Knowledge Content Suggestions table (for improvement suggestions)
CREATE TABLE IF NOT EXISTS knowledge_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('article', 'tutorial', 'case_study', 'learning_path')),
    content_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    suggestion_type VARCHAR(20) NOT NULL CHECK (suggestion_type IN ('correction', 'improvement', 'addition', 'outdated')),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'implemented', 'rejected')),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_category ON knowledge_articles(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_difficulty ON knowledge_articles(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_author ON knowledge_articles(author_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_featured ON knowledge_articles(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_community ON knowledge_articles(is_community_contributed) WHERE is_community_contributed = true;
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_created ON knowledge_articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_slug ON knowledge_articles(slug);

CREATE INDEX IF NOT EXISTS idx_knowledge_tutorials_category ON knowledge_tutorials(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_tutorials_difficulty ON knowledge_tutorials(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_knowledge_tutorials_author ON knowledge_tutorials(author_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_tutorials_featured ON knowledge_tutorials(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_knowledge_tutorials_rating ON knowledge_tutorials(rating DESC);
CREATE INDEX IF NOT EXISTS idx_knowledge_tutorials_slug ON knowledge_tutorials(slug);

CREATE INDEX IF NOT EXISTS idx_tutorial_steps_tutorial ON tutorial_steps(tutorial_id, order_number);

CREATE INDEX IF NOT EXISTS idx_knowledge_case_studies_category ON knowledge_case_studies(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_case_studies_industry ON knowledge_case_studies(industry);
CREATE INDEX IF NOT EXISTS idx_knowledge_case_studies_author ON knowledge_case_studies(author_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_case_studies_featured ON knowledge_case_studies(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_knowledge_case_studies_views ON knowledge_case_studies(views_count DESC);
CREATE INDEX IF NOT EXISTS idx_knowledge_case_studies_slug ON knowledge_case_studies(slug);

CREATE INDEX IF NOT EXISTS idx_learning_paths_category ON knowledge_learning_paths(category);
CREATE INDEX IF NOT EXISTS idx_learning_paths_difficulty ON knowledge_learning_paths(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_learning_paths_rating ON knowledge_learning_paths(rating DESC);
CREATE INDEX IF NOT EXISTS idx_learning_paths_slug ON knowledge_learning_paths(slug);

CREATE INDEX IF NOT EXISTS idx_learning_path_steps_path ON learning_path_steps(learning_path_id, order_number);
CREATE INDEX IF NOT EXISTS idx_learning_path_steps_resource ON learning_path_steps(step_type, resource_id);

CREATE INDEX IF NOT EXISTS idx_knowledge_views_content ON knowledge_views(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_views_user ON knowledge_views(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_knowledge_views_created ON knowledge_views(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_knowledge_ratings_content ON knowledge_ratings(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_ratings_user ON knowledge_ratings(user_id);

CREATE INDEX IF NOT EXISTS idx_tutorial_progress_user ON tutorial_progress(user_id, last_accessed_at DESC);
CREATE INDEX IF NOT EXISTS idx_tutorial_progress_tutorial ON tutorial_progress(tutorial_id);

CREATE INDEX IF NOT EXISTS idx_learning_path_progress_user ON learning_path_progress(user_id, last_accessed_at DESC);
CREATE INDEX IF NOT EXISTS idx_learning_path_progress_path ON learning_path_progress(learning_path_id);

CREATE INDEX IF NOT EXISTS idx_knowledge_bookmarks_user ON knowledge_bookmarks(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_knowledge_bookmarks_content ON knowledge_bookmarks(content_type, content_id);

CREATE INDEX IF NOT EXISTS idx_knowledge_comments_content ON knowledge_comments(content_type, content_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_knowledge_comments_author ON knowledge_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_comments_parent ON knowledge_comments(parent_comment_id) WHERE parent_comment_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_knowledge_suggestions_content ON knowledge_suggestions(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_suggestions_user ON knowledge_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_suggestions_status ON knowledge_suggestions(status, created_at DESC);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_fts ON knowledge_articles USING gin(to_tsvector('english', title || ' ' || content || ' ' || COALESCE(summary, '')));
CREATE INDEX IF NOT EXISTS idx_knowledge_tutorials_fts ON knowledge_tutorials USING gin(to_tsvector('english', title || ' ' || description));
CREATE INDEX IF NOT EXISTS idx_knowledge_case_studies_fts ON knowledge_case_studies USING gin(to_tsvector('english', title || ' ' || description || ' ' || challenge || ' ' || solution));
CREATE INDEX IF NOT EXISTS idx_learning_paths_fts ON knowledge_learning_paths USING gin(to_tsvector('english', title || ' ' || description));

-- Triggers for maintaining counts and updating timestamps

-- Update tutorial completion count when progress is marked complete
CREATE OR REPLACE FUNCTION update_tutorial_completion_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.is_completed = true THEN
        UPDATE knowledge_tutorials SET completion_count = completion_count + 1 WHERE id = NEW.tutorial_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.is_completed = false AND NEW.is_completed = true THEN
        UPDATE knowledge_tutorials SET completion_count = completion_count + 1 WHERE id = NEW.tutorial_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.is_completed = true AND NEW.is_completed = false THEN
        UPDATE knowledge_tutorials SET completion_count = completion_count - 1 WHERE id = NEW.tutorial_id;
    ELSIF TG_OP = 'DELETE' AND OLD.is_completed = true THEN
        UPDATE knowledge_tutorials SET completion_count = completion_count - 1 WHERE id = OLD.tutorial_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_tutorial_completion_count ON tutorial_progress;
CREATE TRIGGER trigger_tutorial_completion_count
    AFTER INSERT OR UPDATE OR DELETE ON tutorial_progress
    FOR EACH ROW EXECUTE FUNCTION update_tutorial_completion_count();

-- Update learning path completion count
CREATE OR REPLACE FUNCTION update_learning_path_completion_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.is_completed = true THEN
        UPDATE knowledge_learning_paths SET completion_count = completion_count + 1 WHERE id = NEW.learning_path_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.is_completed = false AND NEW.is_completed = true THEN
        UPDATE knowledge_learning_paths SET completion_count = completion_count + 1 WHERE id = NEW.learning_path_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.is_completed = true AND NEW.is_completed = false THEN
        UPDATE knowledge_learning_paths SET completion_count = completion_count - 1 WHERE id = NEW.learning_path_id;
    ELSIF TG_OP = 'DELETE' AND OLD.is_completed = true THEN
        UPDATE knowledge_learning_paths SET completion_count = completion_count - 1 WHERE id = OLD.learning_path_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_learning_path_completion_count ON learning_path_progress;
CREATE TRIGGER trigger_learning_path_completion_count
    AFTER INSERT OR UPDATE OR DELETE ON learning_path_progress
    FOR EACH ROW EXECUTE FUNCTION update_learning_path_completion_count();

-- Update comment counts
CREATE OR REPLACE FUNCTION update_knowledge_comment_count()
RETURNS TRIGGER AS $$
DECLARE
    table_name TEXT;
BEGIN
    -- Determine table name based on content type
    CASE COALESCE(NEW.content_type, OLD.content_type)
        WHEN 'article' THEN table_name := 'knowledge_articles';
        WHEN 'tutorial' THEN table_name := 'knowledge_tutorials';
        WHEN 'case_study' THEN table_name := 'knowledge_case_studies';
        WHEN 'learning_path' THEN table_name := 'knowledge_learning_paths';
        ELSE RETURN COALESCE(NEW, OLD);
    END CASE;

    IF TG_OP = 'INSERT' THEN
        EXECUTE format('UPDATE %I SET comments_count = COALESCE(comments_count, 0) + 1 WHERE id = $1', table_name) 
        USING NEW.content_id;
    ELSIF TG_OP = 'DELETE' THEN
        EXECUTE format('UPDATE %I SET comments_count = GREATEST(COALESCE(comments_count, 0) - 1, 0) WHERE id = $1', table_name) 
        USING OLD.content_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Add comments_count column to content tables
ALTER TABLE knowledge_articles ADD COLUMN IF NOT EXISTS comments_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE knowledge_tutorials ADD COLUMN IF NOT EXISTS comments_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE knowledge_case_studies ADD COLUMN IF NOT EXISTS comments_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE knowledge_learning_paths ADD COLUMN IF NOT EXISTS comments_count INTEGER NOT NULL DEFAULT 0;

DROP TRIGGER IF EXISTS trigger_knowledge_comment_count ON knowledge_comments;
CREATE TRIGGER trigger_knowledge_comment_count
    AFTER INSERT OR DELETE ON knowledge_comments
    FOR EACH ROW EXECUTE FUNCTION update_knowledge_comment_count();

-- Update last_updated_at for articles when content changes
CREATE OR REPLACE FUNCTION update_article_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_article_timestamp ON knowledge_articles;
CREATE TRIGGER trigger_update_article_timestamp
    BEFORE UPDATE ON knowledge_articles
    FOR EACH ROW EXECUTE FUNCTION update_article_timestamp();

-- Views for analytics and reporting

-- Knowledge Base Analytics View
CREATE OR REPLACE VIEW knowledge_analytics AS
SELECT 
    'articles' as content_type,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as last_30d,
    COUNT(*) FILTER (WHERE is_featured = true) as featured_count,
    COUNT(*) FILTER (WHERE is_community_contributed = true) as community_count,
    AVG(views_count) as avg_views,
    SUM(views_count) as total_views
FROM knowledge_articles

UNION ALL

SELECT 
    'tutorials' as content_type,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as last_30d,
    COUNT(*) FILTER (WHERE is_featured = true) as featured_count,
    0 as community_count,
    AVG(completion_count) as avg_views,
    SUM(completion_count) as total_views
FROM knowledge_tutorials

UNION ALL

SELECT 
    'case_studies' as content_type,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as last_30d,
    COUNT(*) FILTER (WHERE is_featured = true) as featured_count,
    0 as community_count,
    AVG(views_count) as avg_views,
    SUM(views_count) as total_views
FROM knowledge_case_studies;

-- Popular Content View
CREATE OR REPLACE VIEW knowledge_popular_content AS
SELECT 
    'article' as content_type,
    a.id,
    a.title,
    a.slug,
    a.category,
    a.views_count as engagement_score,
    a.created_at,
    u.display_name as author_name
FROM knowledge_articles a
JOIN users u ON a.author_id = u.id
WHERE a.views_count > 0

UNION ALL

SELECT 
    'tutorial' as content_type,
    t.id,
    t.title,
    t.slug,
    t.category,
    t.completion_count as engagement_score,
    t.created_at,
    u.display_name as author_name
FROM knowledge_tutorials t
JOIN users u ON t.author_id = u.id
WHERE t.completion_count > 0

UNION ALL

SELECT 
    'case_study' as content_type,
    cs.id,
    cs.title,
    cs.slug,
    cs.category,
    cs.views_count as engagement_score,
    cs.created_at,
    u.display_name as author_name
FROM knowledge_case_studies cs
JOIN users u ON cs.author_id = u.id
WHERE cs.views_count > 0

ORDER BY engagement_score DESC;

-- User Learning Progress Summary View
CREATE OR REPLACE VIEW user_learning_progress AS
SELECT 
    u.id as user_id,
    u.display_name,
    COUNT(DISTINCT tp.tutorial_id) as tutorials_started,
    COUNT(DISTINCT tp.tutorial_id) FILTER (WHERE tp.is_completed = true) as tutorials_completed,
    COUNT(DISTINCT lpp.learning_path_id) as paths_started,
    COUNT(DISTINCT lpp.learning_path_id) FILTER (WHERE lpp.is_completed = true) as paths_completed,
    COUNT(DISTINCT kb.id) as bookmarks_count,
    COALESCE(SUM(tp.time_spent), 0) + COALESCE(SUM(lpp.time_spent), 0) as total_time_spent
FROM users u
LEFT JOIN tutorial_progress tp ON u.id = tp.user_id
LEFT JOIN learning_path_progress lpp ON u.id = lpp.user_id
LEFT JOIN knowledge_bookmarks kb ON u.id = kb.user_id
GROUP BY u.id, u.display_name;