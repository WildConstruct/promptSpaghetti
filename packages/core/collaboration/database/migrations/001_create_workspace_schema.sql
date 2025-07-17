-- Migration: 001_create_workspace_schema
-- Description: Initial workspace and collaboration schema
-- Created: 2025-07-17
-- Epic: 9.2.1 - Workspace Data Model Design

-- Migration metadata
INSERT INTO schema_migrations (version, description, applied_at) 
VALUES ('001', 'Create workspace schema', NOW());

-- Enable UUID extension for PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create schema_migrations table if it doesn't exist
CREATE TABLE IF NOT EXISTS schema_migrations (
    version VARCHAR(20) PRIMARY KEY,
    description TEXT NOT NULL,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    rollback_sql TEXT
);

-- Workspaces table
CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    settings JSONB NOT NULL DEFAULT '{
        "visibility": "private",
        "features": {
            "real_time_collaboration": true,
            "version_history": true,
            "comments": true,
            "notifications": true,
            "integrations": false
        },
        "limits": {
            "max_projects": 100,
            "max_members": 50,
            "storage_quota_mb": 10240
        },
        "permissions": {
            "who_can_invite": "admins",
            "who_can_create_projects": "members",
            "default_project_visibility": "workspace"
        }
    }',
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
    settings JSONB NOT NULL DEFAULT '{
        "visibility": "workspace",
        "features": {
            "auto_save": true,
            "version_control": true,
            "real_time_sync": true,
            "notifications": true
        },
        "collaboration": {
            "max_concurrent_editors": 10,
            "conflict_resolution": "manual",
            "presence_timeout_ms": 30000
        }
    }',
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
    metadata JSONB NOT NULL DEFAULT '{
        "size_bytes": 0,
        "checksum": "",
        "tags": [],
        "custom_properties": {}
    }',
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
    metadata JSONB NOT NULL DEFAULT '{
        "mentions": [],
        "attachments": [],
        "reactions": {},
        "is_resolved": false
    }',
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

-- Create indexes
CREATE INDEX idx_workspaces_created_by ON workspaces(created_by);
CREATE INDEX idx_workspaces_created_at ON workspaces(created_at);
CREATE INDEX idx_workspaces_active ON workspaces(is_active) WHERE is_active = true;

CREATE INDEX idx_projects_workspace_id ON projects(workspace_id);
CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_projects_last_activity ON projects(last_activity_at);
CREATE INDEX idx_projects_active ON projects(is_active) WHERE is_active = true;
CREATE INDEX idx_projects_workspace_active ON projects(workspace_id, is_active) WHERE is_active = true;

CREATE INDEX idx_resources_project_id ON resources(project_id);
CREATE INDEX idx_resources_type ON resources(type);
CREATE INDEX idx_resources_created_by ON resources(created_by);
CREATE INDEX idx_resources_updated_at ON resources(updated_at);
CREATE INDEX idx_resources_active ON resources(is_active) WHERE is_active = true;
CREATE INDEX idx_resources_project_active ON resources(project_id, is_active) WHERE is_active = true;

CREATE INDEX idx_workspace_members_user_id ON workspace_members(user_id);
CREATE INDEX idx_workspace_members_role ON workspace_members(role);
CREATE INDEX idx_workspace_members_active ON workspace_members(is_active) WHERE is_active = true;
CREATE INDEX idx_workspace_members_last_activity ON workspace_members(last_activity_at);

CREATE INDEX idx_project_members_user_id ON project_members(user_id);
CREATE INDEX idx_project_members_role ON project_members(role);
CREATE INDEX idx_project_members_active ON project_members(is_active) WHERE is_active = true;
CREATE INDEX idx_project_members_last_activity ON project_members(last_activity_at);

CREATE INDEX idx_activity_events_workspace_id ON activity_events(workspace_id);
CREATE INDEX idx_activity_events_project_id ON activity_events(project_id);
CREATE INDEX idx_activity_events_resource_id ON activity_events(resource_id);
CREATE INDEX idx_activity_events_user_id ON activity_events(user_id);
CREATE INDEX idx_activity_events_type ON activity_events(type);
CREATE INDEX idx_activity_events_created_at ON activity_events(created_at);
CREATE INDEX idx_activity_workspace_created ON activity_events(workspace_id, created_at);

CREATE INDEX idx_comments_workspace_id ON comments(workspace_id);
CREATE INDEX idx_comments_project_id ON comments(project_id);
CREATE INDEX idx_comments_resource_id ON comments(resource_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_comment_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_created_at ON comments(created_at);
CREATE INDEX idx_comments_active ON comments(is_active) WHERE is_active = true;
CREATE INDEX idx_comments_resource_active ON comments(resource_id, is_active) WHERE is_active = true;

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_workspace_id ON notifications(workspace_id);
CREATE INDEX idx_notifications_project_id ON notifications(project_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_read_at ON notifications(read_at);
CREATE INDEX idx_notifications_unread ON notifications(user_id, created_at) WHERE read_at IS NULL AND is_active = true;

-- Create triggers and functions
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

CREATE TRIGGER update_member_activity_on_event
    AFTER INSERT ON activity_events
    FOR EACH ROW EXECUTE FUNCTION update_member_activity();

-- Create views
CREATE VIEW active_workspace_members AS
SELECT 
    wm.*,
    w.name as workspace_name
FROM workspace_members wm
JOIN workspaces w ON w.id = wm.workspace_id
WHERE wm.is_active = true AND w.is_active = true;

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

CREATE VIEW unread_notifications AS
SELECT *
FROM notifications
WHERE read_at IS NULL AND is_active = true
ORDER BY created_at DESC;

-- Store rollback SQL
UPDATE schema_migrations 
SET rollback_sql = '
-- Rollback for migration 001
DROP VIEW IF EXISTS unread_notifications;
DROP VIEW IF EXISTS recent_activity;
DROP VIEW IF EXISTS active_project_members;
DROP VIEW IF EXISTS active_workspace_members;

DROP TRIGGER IF EXISTS update_member_activity_on_event ON activity_events;
DROP TRIGGER IF EXISTS update_project_activity_on_comment ON comments;
DROP TRIGGER IF EXISTS update_project_activity_on_resource_change ON resources;
DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
DROP TRIGGER IF EXISTS update_resources_updated_at ON resources;
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
DROP TRIGGER IF EXISTS update_workspaces_updated_at ON workspaces;

DROP FUNCTION IF EXISTS update_member_activity();
DROP FUNCTION IF EXISTS update_project_activity();
DROP FUNCTION IF EXISTS update_updated_at_column();

DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS activity_events;
DROP TABLE IF EXISTS project_members;
DROP TABLE IF EXISTS workspace_members;
DROP TABLE IF EXISTS resources;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS workspaces;

DELETE FROM schema_migrations WHERE version = ''001'';
'
WHERE version = '001';