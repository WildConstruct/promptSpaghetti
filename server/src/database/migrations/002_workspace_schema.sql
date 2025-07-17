-- Epic 9.2.1 - Workspace Schema Migration
-- Migration to add collaborative workspace tables

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Workspaces table - Logical container for projects and ACL roots
CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    archived_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT workspace_name_not_empty CHECK (length(trim(name)) > 0)
);

-- Projects table - Graph/document grouping inside a workspace
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived', 'deleted')),
    metadata JSONB DEFAULT '{}',
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT project_name_not_empty CHECK (length(trim(name)) > 0)
);

-- Resources table - Generic table for artifacts (graphs, files, templates)
CREATE TABLE IF NOT EXISTS resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL CHECK (type IN ('graph', 'template', 'file', 'export')),
    content_type VARCHAR(100),
    json_meta JSONB DEFAULT '{}',
    storage_path TEXT, -- S3/file path for large content
    content_data JSONB, -- Inline content for small resources
    size_bytes BIGINT DEFAULT 0,
    checksum VARCHAR(64),
    version INTEGER DEFAULT 1,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT resource_name_not_empty CHECK (length(trim(name)) > 0),
    CONSTRAINT resource_size_positive CHECK (size_bytes >= 0)
);

-- ACL Roles table - Custom RBAC roles per workspace
CREATE TABLE IF NOT EXISTS acl_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    permissions BIGINT NOT NULL DEFAULT 0, -- Bitmask for permissions
    is_system_role BOOLEAN DEFAULT FALSE, -- Built-in vs custom roles
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE(workspace_id, name),
    CONSTRAINT role_name_not_empty CHECK (length(trim(name)) > 0)
);

-- ACL Assignments table - Many-to-many: users → roles (workspace / project scope)
CREATE TABLE IF NOT EXISTS acl_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    role_id UUID NOT NULL REFERENCES acl_roles(id) ON DELETE CASCADE,
    scope_type VARCHAR(50) NOT NULL CHECK (scope_type IN ('workspace', 'project')),
    scope_id UUID NOT NULL,
    granted_by VARCHAR(255) NOT NULL,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    UNIQUE(user_id, role_id, scope_type, scope_id)
);

-- User Memberships table - Invitation & membership tracking
CREATE TABLE IF NOT EXISTS user_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'left')),
    invited_by VARCHAR(255),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE(user_id, workspace_id)
);

-- Activity Events table - Feed items (commented, edited, etc.)
CREATE TABLE IF NOT EXISTS activity_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    resource_id UUID REFERENCES resources(id) ON DELETE SET NULL,
    actor_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB DEFAULT '{}',
    aggregation_key VARCHAR(255), -- For grouping similar events
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Comments table - Threaded comments
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    author_id VARCHAR(255) NOT NULL,
    content_markdown TEXT NOT NULL,
    content_html TEXT, -- Rendered HTML
    target_type VARCHAR(50) CHECK (target_type IN ('resource', 'node', 'region')),
    target_data JSONB DEFAULT '{}', -- Node ID, coordinates, etc.
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'edited', 'deleted', 'resolved')),
    edited_at TIMESTAMP WITH TIME ZONE,
    resolved_by VARCHAR(255),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT comment_content_not_empty CHECK (length(trim(content_markdown)) > 0)
);

-- Notifications table - Delivery of activity events
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    event_id UUID REFERENCES activity_events(id) ON DELETE CASCADE,
    notification_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    action_url TEXT,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    delivery_channel VARCHAR(50) DEFAULT 'in_app' CHECK (delivery_channel IN ('in_app', 'email', 'push')),
    read_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_workspaces_owner ON workspaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_workspace ON projects(workspace_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status) WHERE status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_resources_project ON resources(project_id);
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(type);
CREATE INDEX IF NOT EXISTS idx_acl_assignments_user ON acl_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_acl_assignments_scope ON acl_assignments(scope_type, scope_id);
CREATE INDEX IF NOT EXISTS idx_user_memberships_workspace ON user_memberships(workspace_id);
CREATE INDEX IF NOT EXISTS idx_user_memberships_user ON user_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_resource ON comments(resource_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_activity_workspace_time ON activity_events(workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_project_time ON activity_events(project_id, created_at DESC) WHERE project_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_activity_aggregation ON activity_events(aggregation_key, created_at DESC) WHERE aggregation_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, read_at) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_user_time ON notifications(user_id, delivered_at DESC);

-- GIN indexes for JSONB columns
CREATE INDEX IF NOT EXISTS idx_workspace_settings_gin ON workspaces USING GIN (settings);
CREATE INDEX IF NOT EXISTS idx_project_metadata_gin ON projects USING GIN (metadata);
CREATE INDEX IF NOT EXISTS idx_resource_json_meta_gin ON resources USING GIN (json_meta);
CREATE INDEX IF NOT EXISTS idx_activity_event_data_gin ON activity_events USING GIN (event_data);
CREATE INDEX IF NOT EXISTS idx_comment_target_data_gin ON comments USING GIN (target_data);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers only if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_workspaces_updated_at') THEN
        CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON workspaces
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_projects_updated_at') THEN
        CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_resources_updated_at') THEN
        CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON resources
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_acl_roles_updated_at') THEN
        CREATE TRIGGER update_acl_roles_updated_at BEFORE UPDATE ON acl_roles
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_comments_updated_at') THEN
        CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;