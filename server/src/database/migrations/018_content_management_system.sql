-- Epic 17.2 - Content Management System Database Schema
-- This migration creates the comprehensive content management system for backstage admin controls

-- Content types enum
CREATE TYPE content_type AS ENUM (
    'template',
    'documentation', 
    'user_content',
    'system_content',
    'announcement',
    'tutorial'
);

-- Content status enum
CREATE TYPE content_status AS ENUM (
    'draft',
    'published',
    'archived',
    'under_review',
    'rejected',
    'featured'
);

-- Content visibility enum
CREATE TYPE content_visibility AS ENUM (
    'public',
    'private',
    'organization',
    'admin_only'
);

-- Main content items table
CREATE TABLE content_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    type content_type NOT NULL,
    status content_status NOT NULL DEFAULT 'draft',
    visibility content_visibility NOT NULL DEFAULT 'public',
    
    -- Content data stored as JSONB for flexibility
    content JSONB NOT NULL DEFAULT '{}',
    
    -- Metadata including tags, categories, versioning, etc.
    metadata JSONB NOT NULL DEFAULT '{}',
    
    -- Organization scoping (null = global content)
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Content hierarchy support
    parent_id UUID REFERENCES content_items(id) ON DELETE CASCADE,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    -- Search optimization
    search_vector tsvector
);

-- Content revisions table for version control
CREATE TABLE content_revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
    
    -- Revision details
    version INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    content JSONB NOT NULL,
    metadata JSONB NOT NULL,
    
    -- Author information
    author TEXT NOT NULL,
    author_id UUID REFERENCES users(id),
    
    -- Revision comment/note
    comment TEXT,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(content_id, version)
);

-- Content categories table for better organization
CREATE TABLE content_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES content_categories(id) ON DELETE CASCADE,
    type content_type NOT NULL,
    
    -- Display properties
    icon TEXT,
    color TEXT,
    sort_order INTEGER DEFAULT 0,
    
    -- Organization scoping
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(name, type, organization_id)
);

-- Content tags table for flexible tagging
CREATE TABLE content_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    type content_type,  -- NULL means applies to all types
    
    -- Tag properties
    color TEXT,
    usage_count INTEGER DEFAULT 0,
    
    -- Organization scoping
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(name, type, organization_id)
);

-- Content-tag mapping table
CREATE TABLE content_item_tags (
    content_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES content_tags(id) ON DELETE CASCADE,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (content_id, tag_id)
);

-- Content access logs for analytics
CREATE TABLE content_access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
    
    -- Access details
    user_id UUID REFERENCES users(id),
    session_id TEXT,
    ip_address INET,
    user_agent TEXT,
    
    -- Access type (view, download, share, etc.)
    access_type TEXT NOT NULL DEFAULT 'view',
    
    -- Context information
    referrer TEXT,
    search_query TEXT,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (created_at);

-- Create partitions for access logs (monthly partitions for performance)
CREATE TABLE content_access_logs_2025_01 PARTITION OF content_access_logs
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE content_access_logs_2025_02 PARTITION OF content_access_logs
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

-- Content workflows table for approval processes
CREATE TABLE content_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
    
    -- Workflow details
    workflow_type TEXT NOT NULL, -- 'review', 'approval', 'publication'
    current_step TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    
    -- Assignee information
    assigned_to UUID REFERENCES users(id),
    assigned_at TIMESTAMPTZ,
    
    -- Workflow data
    workflow_data JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ
);

-- Content workflow steps table
CREATE TABLE content_workflow_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES content_workflows(id) ON DELETE CASCADE,
    
    -- Step details
    step_name TEXT NOT NULL,
    step_order INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'rejected'
    
    -- Assignee information
    assigned_to UUID REFERENCES users(id),
    assigned_at TIMESTAMPTZ,
    
    -- Step completion
    completed_by UUID REFERENCES users(id),
    completed_at TIMESTAMPTZ,
    
    -- Comments and feedback
    comments TEXT,
    feedback JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance optimization
CREATE INDEX idx_content_items_type ON content_items(type);
CREATE INDEX idx_content_items_status ON content_items(status);
CREATE INDEX idx_content_items_visibility ON content_items(visibility);
CREATE INDEX idx_content_items_organization ON content_items(organization_id);
CREATE INDEX idx_content_items_parent ON content_items(parent_id);
CREATE INDEX idx_content_items_created_at ON content_items(created_at DESC);
CREATE INDEX idx_content_items_updated_at ON content_items(updated_at DESC);

-- GIN indexes for JSONB fields
CREATE INDEX idx_content_items_metadata ON content_items USING GIN(metadata);
CREATE INDEX idx_content_items_content ON content_items USING GIN(content);

-- Full-text search index
CREATE INDEX idx_content_items_search ON content_items USING GIN(search_vector);

-- Revision indexes
CREATE INDEX idx_content_revisions_content_id ON content_revisions(content_id);
CREATE INDEX idx_content_revisions_created_at ON content_revisions(created_at DESC);

-- Category indexes
CREATE INDEX idx_content_categories_type ON content_categories(type);
CREATE INDEX idx_content_categories_parent ON content_categories(parent_id);
CREATE INDEX idx_content_categories_organization ON content_categories(organization_id);

-- Tag indexes
CREATE INDEX idx_content_tags_type ON content_tags(type);
CREATE INDEX idx_content_tags_organization ON content_tags(organization_id);
CREATE INDEX idx_content_tags_usage ON content_tags(usage_count DESC);

-- Access log indexes
CREATE INDEX idx_content_access_logs_content_id ON content_access_logs(content_id);
CREATE INDEX idx_content_access_logs_user_id ON content_access_logs(user_id);
CREATE INDEX idx_content_access_logs_created_at ON content_access_logs(created_at DESC);

-- Workflow indexes
CREATE INDEX idx_content_workflows_content_id ON content_workflows(content_id);
CREATE INDEX idx_content_workflows_assigned_to ON content_workflows(assigned_to);
CREATE INDEX idx_content_workflows_status ON content_workflows(status);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_content_timestamp()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update search vector
CREATE OR REPLACE FUNCTION update_content_search_vector()
RETURNS trigger AS $$
BEGIN
    NEW.search_vector := to_tsvector('english', 
        COALESCE(NEW.title, '') || ' ' || 
        COALESCE(NEW.description, '') || ' ' ||
        COALESCE(NEW.content::text, '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update tag usage count
CREATE OR REPLACE FUNCTION update_tag_usage_count()
RETURNS trigger AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE content_tags 
        SET usage_count = usage_count + 1 
        WHERE id = NEW.tag_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE content_tags 
        SET usage_count = GREATEST(usage_count - 1, 0) 
        WHERE id = OLD.tag_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-create access log partitions
CREATE OR REPLACE FUNCTION create_content_access_partition()
RETURNS trigger AS $$
DECLARE
    partition_date TEXT;
    partition_name TEXT;
    start_date TEXT;
    end_date TEXT;
BEGIN
    partition_date := to_char(NEW.created_at, 'YYYY_MM');
    partition_name := 'content_access_logs_' || partition_date;
    start_date := to_char(date_trunc('month', NEW.created_at), 'YYYY-MM-DD');
    end_date := to_char(date_trunc('month', NEW.created_at) + interval '1 month', 'YYYY-MM-DD');
    
    -- Check if partition already exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_class WHERE relname = partition_name
    ) THEN
        EXECUTE format('CREATE TABLE %I PARTITION OF content_access_logs FOR VALUES FROM (%L) TO (%L)',
                      partition_name, start_date, end_date);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_content_items_timestamp
    BEFORE UPDATE ON content_items
    FOR EACH ROW EXECUTE FUNCTION update_content_timestamp();

CREATE TRIGGER update_content_categories_timestamp
    BEFORE UPDATE ON content_categories
    FOR EACH ROW EXECUTE FUNCTION update_content_timestamp();

CREATE TRIGGER update_content_workflows_timestamp
    BEFORE UPDATE ON content_workflows
    FOR EACH ROW EXECUTE FUNCTION update_content_timestamp();

CREATE TRIGGER update_content_workflow_steps_timestamp
    BEFORE UPDATE ON content_workflow_steps
    FOR EACH ROW EXECUTE FUNCTION update_content_timestamp();

CREATE TRIGGER update_content_search_vector_trigger
    BEFORE INSERT OR UPDATE ON content_items
    FOR EACH ROW EXECUTE FUNCTION update_content_search_vector();

CREATE TRIGGER update_tag_usage_trigger
    AFTER INSERT OR DELETE ON content_item_tags
    FOR EACH ROW EXECUTE FUNCTION update_tag_usage_count();

CREATE TRIGGER content_access_partition_trigger
    BEFORE INSERT ON content_access_logs 
    FOR EACH ROW EXECUTE FUNCTION create_content_access_partition();

-- Insert initial content categories
INSERT INTO content_categories (name, description, type, icon, color, sort_order) VALUES
('General', 'General purpose templates', 'template', '📄', '#6B7280', 1),
('Business', 'Business and professional templates', 'template', '💼', '#3B82F6', 2),
('Creative', 'Creative and artistic templates', 'template', '🎨', '#8B5CF6', 3),
('Technical', 'Technical and development templates', 'template', '⚙️', '#10B981', 4),
('Marketing', 'Marketing and promotional templates', 'template', '📈', '#F59E0B', 5),

('User Guides', 'User documentation and guides', 'documentation', '📖', '#3B82F6', 1),
('API Documentation', 'API reference and guides', 'documentation', '🔗', '#10B981', 2),
('Tutorials', 'Step-by-step tutorials', 'documentation', '🎓', '#8B5CF6', 3),
('FAQ', 'Frequently asked questions', 'documentation', '❓', '#F59E0B', 4),

('Product Updates', 'Product announcements and updates', 'announcement', '📢', '#3B82F6', 1),
('System Maintenance', 'System maintenance notifications', 'announcement', '🔧', '#F59E0B', 2),
('Security Alerts', 'Security-related announcements', 'announcement', '🔒', '#EF4444', 3),

('Getting Started', 'Beginner tutorials and onboarding', 'tutorial', '🚀', '#10B981', 1),
('Advanced Features', 'Advanced feature tutorials', 'tutorial', '⚡', '#8B5CF6', 2),
('Best Practices', 'Best practices and tips', 'tutorial', '💡', '#F59E0B', 3);

-- Insert initial content tags
INSERT INTO content_tags (name, description, type, color) VALUES
('featured', 'Featured content', NULL, '#EF4444'),
('trending', 'Trending content', NULL, '#F59E0B'),
('new', 'New content', NULL, '#10B981'),
('updated', 'Recently updated content', NULL, '#3B82F6'),
('popular', 'Popular content', NULL, '#8B5CF6'),
('beginner', 'Beginner-friendly content', NULL, '#6B7280'),
('advanced', 'Advanced content', NULL, '#374151'),
('draft', 'Draft content', NULL, '#9CA3AF'),
('archived', 'Archived content', NULL, '#6B7280');

-- Sample content items for demonstration
INSERT INTO content_items (title, description, type, status, visibility, content, metadata) VALUES
('Welcome to the Platform', 'Getting started guide for new users', 'documentation', 'published', 'public', 
 '{"sections": [{"title": "Introduction", "content": "Welcome to our platform..."}]}',
 '{"tags": ["new", "beginner"], "category": "User Guides", "version": 1, "author": "System", "authorId": "system", "featured": true, "priority": 100}'
),
('System Maintenance Notice', 'Scheduled maintenance notification', 'announcement', 'published', 'public',
 '{"message": "We will be performing scheduled maintenance on...", "scheduled_time": "2025-01-30T02:00:00Z"}',
 '{"tags": ["system"], "category": "System Maintenance", "version": 1, "author": "System", "authorId": "system", "featured": false, "priority": 90}'
),
('Basic Template Creation', 'Learn how to create your first template', 'tutorial', 'published', 'public',
 '{"steps": [{"title": "Step 1", "content": "Open the template editor..."}, {"title": "Step 2", "content": "Add your content..."}]}',
 '{"tags": ["beginner", "tutorial"], "category": "Getting Started", "version": 1, "author": "System", "authorId": "system", "featured": true, "priority": 95}'
);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON content_items TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON content_revisions TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON content_categories TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON content_tags TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON content_item_tags TO app_user;
GRANT SELECT, INSERT ON content_access_logs TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON content_workflows TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON content_workflow_steps TO app_user;

-- Grant sequence permissions (if needed)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO app_user;