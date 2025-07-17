-- Workspace and Project Management Database Schema
-- Epic 9 Story 9.2.1 - Workspace Data Model Design

-- Enable UUID extension for PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Workspaces table
CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    settings JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL,
    is_active BOOLEAN DEFAULT true,
    
    CONSTRAINT workspaces_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 255)
);

-- Projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    settings JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT projects_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 255),
    CONSTRAINT projects_workspace_name_unique UNIQUE (workspace_id, name)
);

-- Resources table
CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('graph', 'template', 'asset', 'document')),
    content JSONB,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL,
    is_active BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1,
    
    CONSTRAINT resources_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 255),
    CONSTRAINT resources_project_name_unique UNIQUE (project_id, name),
    CONSTRAINT resources_version_positive CHECK (version > 0)
);

-- Workspace members table
CREATE TABLE workspace_members (
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'admin', 'collaborator', 'viewer')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    invited_by UUID NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    PRIMARY KEY (workspace_id, user_id)
);

-- Project members table
CREATE TABLE project_members (
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    invited_by UUID NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    PRIMARY KEY (project_id, user_id)
);

-- Activity events table
CREATE TABLE activity_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL,
    details JSONB NOT NULL DEFAULT '{}',
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT activity_type_valid CHECK (type ~ '^[a-z_]+\.[a-z_]+$')
);

-- Comments table
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    
    CONSTRAINT comments_content_length CHECK (char_length(content) >= 1 AND char_length(content) <= 10000)
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    
    CONSTRAINT notifications_title_length CHECK (char_length(title) >= 1 AND char_length(title) <= 255),
    CONSTRAINT notifications_message_length CHECK (char_length(message) >= 1 AND char_length(message) <= 2000)
);

-- Indexes for performance optimization

-- Workspaces indexes
CREATE INDEX idx_workspaces_created_by ON workspaces(created_by);
CREATE INDEX idx_workspaces_created_at ON workspaces(created_at);
CREATE INDEX idx_workspaces_active ON workspaces(is_active) WHERE is_active = true;

-- Projects indexes
CREATE INDEX idx_projects_workspace_id ON projects(workspace_id);
CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_projects_last_activity ON projects(last_activity_at);
CREATE INDEX idx_projects_active ON projects(is_active) WHERE is_active = true;

-- Resources indexes
CREATE INDEX idx_resources_project_id ON resources(project_id);
CREATE INDEX idx_resources_type ON resources(type);
CREATE INDEX idx_resources_created_by ON resources(created_by);
CREATE INDEX idx_resources_updated_at ON resources(updated_at);
CREATE INDEX idx_resources_active ON resources(is_active) WHERE is_active = true;

-- Workspace members indexes
CREATE INDEX idx_workspace_members_user_id ON workspace_members(user_id);
CREATE INDEX idx_workspace_members_role ON workspace_members(role);
CREATE INDEX idx_workspace_members_active ON workspace_members(is_active) WHERE is_active = true;
CREATE INDEX idx_workspace_members_last_activity ON workspace_members(last_activity_at);

-- Project members indexes
CREATE INDEX idx_project_members_user_id ON project_members(user_id);
CREATE INDEX idx_project_members_role ON project_members(role);
CREATE INDEX idx_project_members_active ON project_members(is_active) WHERE is_active = true;
CREATE INDEX idx_project_members_last_activity ON project_members(last_activity_at);

-- Activity events indexes
CREATE INDEX idx_activity_events_workspace_id ON activity_events(workspace_id);
CREATE INDEX idx_activity_events_project_id ON activity_events(project_id);
CREATE INDEX idx_activity_events_resource_id ON activity_events(resource_id);
CREATE INDEX idx_activity_events_user_id ON activity_events(user_id);
CREATE INDEX idx_activity_events_type ON activity_events(type);
CREATE INDEX idx_activity_events_created_at ON activity_events(created_at);

-- Comments indexes
CREATE INDEX idx_comments_workspace_id ON comments(workspace_id);
CREATE INDEX idx_comments_project_id ON comments(project_id);
CREATE INDEX idx_comments_resource_id ON comments(resource_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_comment_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_created_at ON comments(created_at);
CREATE INDEX idx_comments_active ON comments(is_active) WHERE is_active = true;

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_workspace_id ON notifications(workspace_id);
CREATE INDEX idx_notifications_project_id ON notifications(project_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_read_at ON notifications(read_at);
CREATE INDEX idx_notifications_unread ON notifications(user_id, created_at) WHERE read_at IS NULL AND is_active = true;

-- Composite indexes for common queries
CREATE INDEX idx_projects_workspace_active ON projects(workspace_id, is_active) WHERE is_active = true;
CREATE INDEX idx_resources_project_active ON resources(project_id, is_active) WHERE is_active = true;
CREATE INDEX idx_activity_workspace_created ON activity_events(workspace_id, created_at);
CREATE INDEX idx_comments_resource_active ON comments(resource_id, is_active) WHERE is_active = true;

-- Triggers for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON workspaces
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON resources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update last_activity_at for projects
CREATE OR REPLACE FUNCTION update_project_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE projects 
        SET last_activity_at = NOW() 
        WHERE id = NEW.project_id;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Triggers to update project activity
CREATE TRIGGER update_project_activity_on_resource_change
    AFTER INSERT OR UPDATE ON resources
    FOR EACH ROW EXECUTE FUNCTION update_project_activity();

CREATE TRIGGER update_project_activity_on_comment
    AFTER INSERT OR UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_project_activity();

-- Function to update member last_activity_at
CREATE OR REPLACE FUNCTION update_member_activity()
RETURNS TRIGGER AS $$
BEGIN
    -- Update workspace member activity
    UPDATE workspace_members 
    SET last_activity_at = NOW() 
    WHERE workspace_id = NEW.workspace_id AND user_id = NEW.user_id;
    
    -- Update project member activity if project_id is present
    IF NEW.project_id IS NOT NULL THEN
        UPDATE project_members 
        SET last_activity_at = NOW() 
        WHERE project_id = NEW.project_id AND user_id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update member activity on activity events
CREATE TRIGGER update_member_activity_on_event
    AFTER INSERT ON activity_events
    FOR EACH ROW EXECUTE FUNCTION update_member_activity();

-- RLS (Row Level Security) policies
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (to be customized based on authentication system)
-- Note: These assume a current_user_id() function exists in your auth system

CREATE POLICY workspace_member_access ON workspaces
    FOR ALL TO authenticated
    USING (
        id IN (
            SELECT workspace_id 
            FROM workspace_members 
            WHERE user_id = current_user_id() AND is_active = true
        )
    );

CREATE POLICY project_member_access ON projects
    FOR ALL TO authenticated
    USING (
        workspace_id IN (
            SELECT workspace_id 
            FROM workspace_members 
            WHERE user_id = current_user_id() AND is_active = true
        )
        OR id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = current_user_id() AND is_active = true
        )
    );

-- Views for common queries

-- Active workspace members with user info
CREATE VIEW active_workspace_members AS
SELECT 
    wm.*,
    w.name as workspace_name
FROM workspace_members wm
JOIN workspaces w ON w.id = wm.workspace_id
WHERE wm.is_active = true AND w.is_active = true;

-- Active project members with project and workspace info
CREATE VIEW active_project_members AS
SELECT 
    pm.*,
    p.name as project_name,
    p.workspace_id,
    w.name as workspace_name
FROM project_members pm
JOIN projects p ON p.id = pm.project_id
JOIN workspaces w ON w.id = p.workspace_id
WHERE pm.is_active = true AND p.is_active = true AND w.is_active = true;

-- Recent activity events with context
CREATE VIEW recent_activity AS
SELECT 
    ae.*,
    w.name as workspace_name,
    p.name as project_name,
    r.name as resource_name
FROM activity_events ae
JOIN workspaces w ON w.id = ae.workspace_id
LEFT JOIN projects p ON p.id = ae.project_id
LEFT JOIN resources r ON r.id = ae.resource_id
ORDER BY ae.created_at DESC;

-- Unread notifications
CREATE VIEW unread_notifications AS
SELECT *
FROM notifications
WHERE read_at IS NULL AND is_active = true
ORDER BY created_at DESC;