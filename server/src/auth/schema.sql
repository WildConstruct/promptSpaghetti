-- Epic 11 Authentication Database Schema
-- PostgreSQL schema for authentication and user management

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table - core user accounts
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    hashed_password VARCHAR(255), -- NULL for OAuth-only accounts
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    failed_login_attempts INTEGER DEFAULT 0,
    account_locked BOOLEAN DEFAULT FALSE,
    locked_until TIMESTAMP WITH TIME ZONE,
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP WITH TIME ZONE,
    email_verification_token VARCHAR(255),
    email_verification_expires TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- User profiles - extended user information
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    display_name VARCHAR(100),
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    bio TEXT,
    avatar_url VARCHAR(500),
    timezone VARCHAR(50) DEFAULT 'UTC',
    locale VARCHAR(10) DEFAULT 'en-US',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User preferences - notification and UI preferences
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL, -- 'notifications', 'ui', 'privacy', etc.
    settings JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, category)
);

-- OAuth accounts - OAuth provider connections
CREATE TABLE IF NOT EXISTS oauth_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL CHECK (provider IN ('google', 'github', 'microsoft')),
    oauth_id VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    picture TEXT,
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(provider, oauth_id)
);

-- OAuth states - for CSRF protection during OAuth flow
CREATE TABLE IF NOT EXISTS oauth_states (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    state VARCHAR(255) UNIQUE NOT NULL,
    data JSONB NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API tokens - long-lived tokens for API access
CREATE TABLE IF NOT EXISTS api_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255),
    scopes JSONB NOT NULL DEFAULT '[]',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE,
    revoked BOOLEAN DEFAULT FALSE,
    revoked_at TIMESTAMP WITH TIME ZONE
);

-- User uploads - file uploads (avatars, documents, etc.)
CREATE TABLE IF NOT EXISTS user_uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size INTEGER NOT NULL,
    upload_type VARCHAR(50) NOT NULL, -- 'avatar', 'document', etc.
    url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Sessions - active user sessions
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255) UNIQUE,
    device_info JSONB, -- browser, OS, IP, etc.
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    revoked BOOLEAN DEFAULT FALSE,
    revoked_at TIMESTAMP WITH TIME ZONE
);

-- Roles - system and organization roles
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    scope VARCHAR(20) DEFAULT 'global' CHECK (scope IN ('global', 'organization', 'team')),
    organization_id UUID, -- NULL for global roles
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Permissions - granular permission definitions
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    resource VARCHAR(100) NOT NULL, -- 'graphs', 'teams', 'organizations', etc.
    action VARCHAR(50) NOT NULL, -- 'create', 'read', 'update', 'delete', 'execute'
    scope VARCHAR(20) DEFAULT 'global' CHECK (scope IN ('global', 'organization', 'team', 'own')),
    conditions JSONB, -- Additional conditions for permission
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User roles - role assignments to users
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    granted_by UUID REFERENCES users(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    scope_context JSONB, -- organization_id, team_id, etc.
    UNIQUE(user_id, role_id)
);

-- Organizations - tenant organizations
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    website VARCHAR(500),
    logo_url VARCHAR(500),
    branding JSONB, -- colors, themes, etc.
    settings JSONB DEFAULT '{}',
    plan VARCHAR(50) DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
    max_users INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Teams - sub-groups within organizations
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    parent_team_id UUID REFERENCES teams(id),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Team members - user membership in teams
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    invited_by UUID REFERENCES users(id),
    UNIQUE(team_id, user_id)
);

-- User invitations - pending user invitations
CREATE TABLE IF NOT EXISTS user_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    role_id UUID REFERENCES roles(id),
    organization_id UUID REFERENCES organizations(id),
    team_id UUID REFERENCES teams(id),
    invited_by UUID NOT NULL REFERENCES users(id),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    accepted_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB -- additional invitation context
);

-- Password reset tokens - secure password reset management
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hashed_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    fingerprint VARCHAR(255),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    revoked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit logs - security and compliance audit trail
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL, -- 'login', 'logout', 'password_change', etc.
    resource_type VARCHAR(50), -- 'user', 'role', 'organization', etc.
    resource_id UUID,
    details JSONB, -- event-specific details
    ip_address INET,
    user_agent TEXT,
    session_id UUID,
    severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_category ON user_preferences(category);
CREATE INDEX IF NOT EXISTS idx_user_preferences_settings ON user_preferences USING GIN(settings);

CREATE INDEX IF NOT EXISTS idx_oauth_accounts_user_id ON oauth_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_accounts_provider ON oauth_accounts(provider);
CREATE INDEX IF NOT EXISTS idx_oauth_accounts_oauth_id ON oauth_accounts(oauth_id);
CREATE INDEX IF NOT EXISTS idx_oauth_accounts_email ON oauth_accounts(email);

CREATE INDEX IF NOT EXISTS idx_oauth_states_state ON oauth_states(state);
CREATE INDEX IF NOT EXISTS idx_oauth_states_expires_at ON oauth_states(expires_at);

CREATE INDEX IF NOT EXISTS idx_api_tokens_user_id ON api_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_api_tokens_expires_at ON api_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_api_tokens_revoked ON api_tokens(revoked);

CREATE INDEX IF NOT EXISTS idx_user_uploads_user_id ON user_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_user_uploads_upload_type ON user_uploads(upload_type);
CREATE INDEX IF NOT EXISTS idx_user_uploads_created_at ON user_uploads(created_at);
CREATE INDEX IF NOT EXISTS idx_user_uploads_deleted_at ON user_uploads(deleted_at);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);

CREATE INDEX IF NOT EXISTS idx_permissions_role_id ON permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_permissions_resource_action ON permissions(resource, action);

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_created_at ON organizations(created_at);

CREATE INDEX IF NOT EXISTS idx_teams_organization_id ON teams(organization_id);
CREATE INDEX IF NOT EXISTS idx_teams_parent_team_id ON teams(parent_team_id);

CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);

CREATE INDEX IF NOT EXISTS idx_user_invitations_email ON user_invitations(email);
CREATE INDEX IF NOT EXISTS idx_user_invitations_token ON user_invitations(token);
CREATE INDEX IF NOT EXISTS idx_user_invitations_expires_at ON user_invitations(expires_at);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_hashed_token ON password_reset_tokens(hashed_token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON audit_logs(severity);

-- GIN indexes for JSONB columns
CREATE INDEX IF NOT EXISTS idx_user_preferences_settings_gin ON user_preferences USING GIN(settings);
CREATE INDEX IF NOT EXISTS idx_organizations_branding_gin ON organizations USING GIN(branding);
CREATE INDEX IF NOT EXISTS idx_audit_logs_details_gin ON audit_logs USING GIN(details);

-- Insert default system roles
INSERT INTO roles (name, description, scope) VALUES
    ('super_admin', 'Super administrator with full system access', 'global'),
    ('admin', 'Administrator with organization management access', 'global'),
    ('user', 'Standard user with basic access', 'global'),
    ('viewer', 'Read-only access user', 'global')
ON CONFLICT (name) DO NOTHING;

-- Insert default permissions for super_admin role
INSERT INTO permissions (role_id, resource, action, scope)
SELECT r.id, resource, action, 'global'
FROM roles r
CROSS JOIN (
    VALUES 
        ('users', 'create'), ('users', 'read'), ('users', 'update'), ('users', 'delete'),
        ('organizations', 'create'), ('organizations', 'read'), ('organizations', 'update'), ('organizations', 'delete'),
        ('teams', 'create'), ('teams', 'read'), ('teams', 'update'), ('teams', 'delete'),
        ('roles', 'create'), ('roles', 'read'), ('roles', 'update'), ('roles', 'delete'),
        ('graphs', 'create'), ('graphs', 'read'), ('graphs', 'update'), ('graphs', 'delete'), ('graphs', 'execute'),
        ('system', 'admin')
) AS perms(resource, action)
WHERE r.name = 'super_admin'
ON CONFLICT DO NOTHING;

-- Insert default permissions for admin role
INSERT INTO permissions (role_id, resource, action, scope)
SELECT r.id, resource, action, scope
FROM roles r
CROSS JOIN (
    VALUES 
        ('users', 'read', 'organization'), ('users', 'update', 'organization'),
        ('organizations', 'read', 'own'), ('organizations', 'update', 'own'),
        ('teams', 'create', 'organization'), ('teams', 'read', 'organization'), ('teams', 'update', 'organization'), ('teams', 'delete', 'organization'),
        ('graphs', 'create', 'organization'), ('graphs', 'read', 'organization'), ('graphs', 'update', 'organization'), ('graphs', 'execute', 'organization')
) AS perms(resource, action, scope)
WHERE r.name = 'admin'
ON CONFLICT DO NOTHING;

-- Insert default permissions for user role
INSERT INTO permissions (role_id, resource, action, scope)
SELECT r.id, resource, action, scope
FROM roles r
CROSS JOIN (
    VALUES 
        ('graphs', 'create', 'own'), ('graphs', 'read', 'own'), ('graphs', 'update', 'own'), ('graphs', 'delete', 'own'), ('graphs', 'execute', 'own'),
        ('teams', 'read', 'team'), 
        ('users', 'read', 'own'), ('users', 'update', 'own')
) AS perms(resource, action, scope)
WHERE r.name = 'user'
ON CONFLICT DO NOTHING;

-- Insert default permissions for viewer role
INSERT INTO permissions (role_id, resource, action, scope)
SELECT r.id, resource, action, scope
FROM roles r
CROSS JOIN (
    VALUES 
        ('graphs', 'read', 'team'), ('graphs', 'execute', 'team'),
        ('teams', 'read', 'team'),
        ('users', 'read', 'own')
) AS perms(resource, action, scope)
WHERE r.name = 'viewer'
ON CONFLICT DO NOTHING;