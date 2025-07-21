-- =====================================================================================
-- Epic 23: Collaborative Workspaces & Real-time Co-editing Database Migration
-- 
-- Enhances existing workspace system with collaborative editing features,
-- real-time presence, session management, and advanced quota systems.
-- 
-- Task: E23-1753115279521-7A79DE - Design workspace data model
-- =====================================================================================

-- Enable UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================================================
-- ENHANCE EXISTING TABLES
-- =====================================================================================

-- Enhance workspaces table with collaborative features
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS collaboration_settings JSONB DEFAULT '{
  "max_concurrent_editors": 10,
  "auto_save_interval": 5000,
  "conflict_resolution": "last_writer_wins",
  "real_time_cursors": true,
  "allow_anonymous_viewers": false,
  "session_timeout": 30
}'::jsonb;

ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS resource_quotas JSONB DEFAULT '{
  "max_projects": 100,
  "max_resources_per_project": 1000,
  "max_storage_bytes": 1073741824,
  "max_concurrent_sessions": 25
}'::jsonb;

ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS usage_stats JSONB DEFAULT '{
  "current_projects": 0,
  "current_resources": 0,
  "current_storage_bytes": 0,
  "active_sessions": 0
}'::jsonb;

ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS active_sessions INTEGER DEFAULT 0;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS last_collaborative_activity TIMESTAMP WITH TIME ZONE;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

-- Update workspace settings constraint
ALTER TABLE workspaces 
  ADD CONSTRAINT chk_workspaces_active_sessions_non_negative 
  CHECK (active_sessions >= 0);

ALTER TABLE workspaces 
  ADD CONSTRAINT chk_workspaces_version_positive 
  CHECK (version > 0);

-- Enhance resources table with collaborative state
ALTER TABLE resources ADD COLUMN IF NOT EXISTS collaborative_state JSONB DEFAULT '{
  "is_collaborative": false,
  "active_editors": [],
  "edit_sessions": [],
  "lock_status": "unlocked"
}'::jsonb;

ALTER TABLE resources ADD COLUMN IF NOT EXISTS version_control JSONB DEFAULT '{
  "current_branch": "main",
  "available_branches": ["main"],
  "merge_conflicts": [],
  "pending_merges": []
}'::jsonb;

ALTER TABLE resources ADD COLUMN IF NOT EXISTS presence_data JSONB DEFAULT '{
  "active_viewers": [],
  "cursor_positions": [],
  "selection_ranges": []
}'::jsonb;

ALTER TABLE resources ADD COLUMN IF NOT EXISTS optimization_hints JSONB DEFAULT '{
  "is_large_resource": false,
  "requires_chunking": false,
  "cache_strategy": "normal",
  "priority": "normal"
}'::jsonb;

-- =====================================================================================
-- COLLABORATIVE FEATURES TABLES
-- =====================================================================================

-- Edit sessions for real-time collaboration tracking
CREATE TABLE IF NOT EXISTS edit_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_id UUID NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  workspace_id UUID NOT NULL,
  
  -- Session information
  session_info JSONB NOT NULL DEFAULT '{}'::jsonb,
  editing_state JSONB NOT NULL DEFAULT '{}'::jsonb,
  collaboration_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Constraints
  CONSTRAINT fk_edit_sessions_resource FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
  CONSTRAINT fk_edit_sessions_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  CONSTRAINT fk_edit_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT chk_edit_sessions_expires_future CHECK (expires_at > created_at)
);

-- User presence tracking for workspaces
CREATE TABLE IF NOT EXISTS user_presence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(255) NOT NULL,
  workspace_id UUID NOT NULL,
  
  -- Presence data
  presence_status JSONB NOT NULL DEFAULT '{}'::jsonb,
  current_context JSONB DEFAULT '{}'::jsonb,
  collaboration_state JSONB DEFAULT '{}'::jsonb,
  session_metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT fk_user_presence_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_presence_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  CONSTRAINT unique_user_workspace_presence UNIQUE (user_id, workspace_id)
);

-- Workspace context management for user sessions
CREATE TABLE IF NOT EXISTS workspace_contexts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  
  -- Context data
  navigation_state JSONB NOT NULL DEFAULT '{}'::jsonb,
  collaboration_context JSONB DEFAULT '{}'::jsonb,
  workspace_preferences JSONB DEFAULT '{}'::jsonb,
  cache_state JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps and expiration
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  
  -- Constraints
  CONSTRAINT fk_workspace_contexts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_workspace_contexts_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  CONSTRAINT unique_user_workspace_context UNIQUE (user_id, workspace_id),
  CONSTRAINT chk_workspace_contexts_expires_future CHECK (expires_at > created_at)
);

-- Detailed resource quotas management
CREATE TABLE IF NOT EXISTS resource_quotas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL,
  
  -- Storage quotas
  max_storage_bytes BIGINT NOT NULL DEFAULT 1073741824, -- 1GB
  current_storage_bytes BIGINT NOT NULL DEFAULT 0,
  storage_warning_threshold INTEGER NOT NULL DEFAULT 80,
  
  -- Resource count quotas
  max_projects INTEGER NOT NULL DEFAULT 100,
  current_projects INTEGER NOT NULL DEFAULT 0,
  max_resources_per_project INTEGER NOT NULL DEFAULT 1000,
  
  -- Collaborative quotas
  max_concurrent_sessions INTEGER NOT NULL DEFAULT 25,
  current_concurrent_sessions INTEGER NOT NULL DEFAULT 0,
  max_concurrent_editors_per_resource INTEGER NOT NULL DEFAULT 10,
  
  -- Time-based quotas
  max_session_duration_minutes INTEGER NOT NULL DEFAULT 480, -- 8 hours
  max_monthly_edit_hours INTEGER NOT NULL DEFAULT 200,
  current_monthly_edit_hours INTEGER NOT NULL DEFAULT 0,
  
  -- API quotas
  max_api_requests_per_hour INTEGER NOT NULL DEFAULT 10000,
  current_api_requests_per_hour INTEGER NOT NULL DEFAULT 0,
  
  -- Enforcement settings
  enforce_hard_limits BOOLEAN NOT NULL DEFAULT TRUE,
  grace_period_hours INTEGER NOT NULL DEFAULT 24,
  quota_reset_schedule VARCHAR(20) NOT NULL DEFAULT 'monthly',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  next_reset TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (DATE_TRUNC('month', NOW()) + INTERVAL '1 month'),
  
  -- Constraints
  CONSTRAINT fk_resource_quotas_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  CONSTRAINT unique_workspace_quota UNIQUE (workspace_id),
  CONSTRAINT chk_quotas_non_negative CHECK (
    max_storage_bytes >= 0 AND current_storage_bytes >= 0 AND
    max_projects >= 0 AND current_projects >= 0 AND
    max_concurrent_sessions >= 0 AND current_concurrent_sessions >= 0 AND
    storage_warning_threshold >= 0 AND storage_warning_threshold <= 100
  ),
  CONSTRAINT chk_quotas_current_le_max CHECK (
    current_storage_bytes <= max_storage_bytes + (max_storage_bytes * grace_period_hours / 100) AND
    current_projects <= max_projects AND
    current_concurrent_sessions <= max_concurrent_sessions
  ),
  CONSTRAINT chk_quota_reset_schedule CHECK (quota_reset_schedule IN ('daily', 'weekly', 'monthly'))
);

-- Quota usage events for tracking and analytics
CREATE TABLE IF NOT EXISTS quota_usage_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  quota_type VARCHAR(50) NOT NULL,
  usage_delta INTEGER NOT NULL,
  context JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT fk_quota_usage_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  CONSTRAINT fk_quota_usage_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT chk_quota_type_valid CHECK (quota_type IN (
    'storage_bytes', 'projects', 'resources_per_project', 'concurrent_sessions',
    'concurrent_editors_per_resource', 'session_duration_minutes', 'monthly_edit_hours',
    'api_requests_per_hour'
  ))
);

-- Notification preferences for workspace users
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  
  -- Notification settings
  notifications JSONB NOT NULL DEFAULT '{
    "new_collaborators": true,
    "edit_conflicts": true,
    "resource_changes": true,
    "mentions": true,
    "system_announcements": true,
    "quota_warnings": true
  }'::jsonb,
  
  delivery_methods JSONB NOT NULL DEFAULT '{
    "in_app": true,
    "email": true,
    "push": false
  }'::jsonb,
  
  quiet_hours JSONB DEFAULT '{
    "enabled": false,
    "start_time": "22:00",
    "end_time": "08:00",
    "timezone": "UTC"
  }'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT fk_notification_prefs_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  CONSTRAINT fk_notification_prefs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT unique_user_workspace_notifications UNIQUE (user_id, workspace_id)
);

-- Workspace isolation configuration
CREATE TABLE IF NOT EXISTS workspace_isolation (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL,
  isolation_level VARCHAR(20) NOT NULL DEFAULT 'strict',
  shared_with TEXT[] DEFAULT '{}',
  federation_rules JSONB DEFAULT '{
    "allow_resource_sharing": false,
    "allow_user_discovery": false,
    "allow_project_imports": false
  }'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT fk_workspace_isolation_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  CONSTRAINT unique_workspace_isolation UNIQUE (workspace_id),
  CONSTRAINT chk_isolation_level_valid CHECK (isolation_level IN ('strict', 'shared_read', 'federated'))
);

-- =====================================================================================
-- PERFORMANCE INDEXES
-- =====================================================================================

-- Edit sessions indexes for fast collaborative queries
CREATE INDEX IF NOT EXISTS idx_edit_sessions_resource_active 
  ON edit_sessions(resource_id, expires_at) 
  WHERE expires_at > NOW();

CREATE INDEX IF NOT EXISTS idx_edit_sessions_user_workspace 
  ON edit_sessions(user_id, workspace_id, expires_at);

CREATE INDEX IF NOT EXISTS idx_edit_sessions_workspace_active 
  ON edit_sessions(workspace_id, updated_at) 
  WHERE expires_at > NOW();

-- User presence indexes for real-time features
CREATE INDEX IF NOT EXISTS idx_user_presence_workspace_active 
  ON user_presence(workspace_id, updated_at) 
  WHERE updated_at > NOW() - INTERVAL '5 minutes';

CREATE INDEX IF NOT EXISTS idx_user_presence_user_updated 
  ON user_presence(user_id, updated_at);

-- Workspace context indexes for session management
CREATE INDEX IF NOT EXISTS idx_workspace_contexts_user_expires 
  ON workspace_contexts(user_id, expires_at) 
  WHERE expires_at > NOW();

CREATE INDEX IF NOT EXISTS idx_workspace_contexts_workspace_updated 
  ON workspace_contexts(workspace_id, updated_at);

-- Quota management indexes
CREATE INDEX IF NOT EXISTS idx_quota_usage_workspace_time 
  ON quota_usage_events(workspace_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_quota_usage_type_time 
  ON quota_usage_events(quota_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_quota_usage_user_time 
  ON quota_usage_events(user_id, created_at DESC);

-- Resource quotas indexes
CREATE INDEX IF NOT EXISTS idx_resource_quotas_next_reset 
  ON resource_quotas(next_reset) 
  WHERE next_reset <= NOW();

-- JSONB indexes for collaborative state queries
CREATE INDEX IF NOT EXISTS idx_resources_collaborative_state 
  ON resources USING GIN (collaborative_state);

CREATE INDEX IF NOT EXISTS idx_resources_presence_data 
  ON resources USING GIN (presence_data);

CREATE INDEX IF NOT EXISTS idx_resources_version_control 
  ON resources USING GIN (version_control);

CREATE INDEX IF NOT EXISTS idx_workspaces_collaboration_settings 
  ON workspaces USING GIN (collaboration_settings);

CREATE INDEX IF NOT EXISTS idx_workspaces_usage_stats 
  ON workspaces USING GIN (usage_stats);

-- Notification preferences indexes
CREATE INDEX IF NOT EXISTS idx_notification_prefs_workspace 
  ON notification_preferences(workspace_id);

-- =====================================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for timestamp updates
CREATE TRIGGER update_edit_sessions_updated_at 
  BEFORE UPDATE ON edit_sessions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_presence_updated_at 
  BEFORE UPDATE ON user_presence 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workspace_contexts_updated_at 
  BEFORE UPDATE ON workspace_contexts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resource_quotas_updated_at 
  BEFORE UPDATE ON resource_quotas 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at 
  BEFORE UPDATE ON notification_preferences 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workspace_isolation_updated_at 
  BEFORE UPDATE ON workspace_isolation 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update workspace version on changes
CREATE OR REPLACE FUNCTION increment_workspace_version()
RETURNS TRIGGER AS $$
BEGIN
  NEW.version = OLD.version + 1;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-increment workspace version
CREATE TRIGGER increment_workspace_version_trigger
  BEFORE UPDATE ON workspaces
  FOR EACH ROW 
  WHEN (OLD.collaboration_settings IS DISTINCT FROM NEW.collaboration_settings OR 
        OLD.resource_quotas IS DISTINCT FROM NEW.resource_quotas OR
        OLD.usage_stats IS DISTINCT FROM NEW.usage_stats)
  EXECUTE FUNCTION increment_workspace_version();

-- =====================================================================================
-- CLEANUP FUNCTIONS
-- =====================================================================================

-- Function to cleanup expired sessions and contexts
CREATE OR REPLACE FUNCTION cleanup_expired_collaborative_data()
RETURNS INTEGER AS $$
DECLARE
  cleanup_count INTEGER := 0;
BEGIN
  -- Clean up expired edit sessions
  DELETE FROM edit_sessions WHERE expires_at <= NOW();
  GET DIAGNOSTICS cleanup_count = ROW_COUNT;
  
  -- Clean up expired workspace contexts
  DELETE FROM workspace_contexts WHERE expires_at <= NOW();
  
  -- Clean up stale user presence (older than 10 minutes)
  DELETE FROM user_presence WHERE updated_at <= NOW() - INTERVAL '10 minutes';
  
  -- Clean up old quota usage events (older than 1 year)
  DELETE FROM quota_usage_events WHERE created_at <= NOW() - INTERVAL '1 year';
  
  RETURN cleanup_count;
END;
$$ language 'plpgsql';

-- =====================================================================================
-- DEFAULT DATA INSERTION
-- =====================================================================================

-- Insert default resource quotas for existing workspaces
INSERT INTO resource_quotas (workspace_id)
SELECT id FROM workspaces 
WHERE id NOT IN (SELECT workspace_id FROM resource_quotas)
ON CONFLICT (workspace_id) DO NOTHING;

-- Insert default workspace isolation settings for existing workspaces
INSERT INTO workspace_isolation (workspace_id)
SELECT id FROM workspaces 
WHERE id NOT IN (SELECT workspace_id FROM workspace_isolation)
ON CONFLICT (workspace_id) DO NOTHING;

-- =====================================================================================
-- GRANTS AND PERMISSIONS
-- =====================================================================================

-- Grant permissions to application user (adjust role name as needed)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;
-- GRANT EXECUTE ON FUNCTION cleanup_expired_collaborative_data() TO app_user;

-- =====================================================================================
-- MIGRATION COMPLETION
-- =====================================================================================

-- Log migration completion
INSERT INTO schema_migrations (version, applied_at) 
VALUES ('010_epic23_collaborative_workspaces', NOW())
ON CONFLICT (version) DO UPDATE SET applied_at = NOW();

COMMENT ON TABLE edit_sessions IS 'Epic 23: Active editing sessions for real-time collaboration';
COMMENT ON TABLE user_presence IS 'Epic 23: User presence tracking within workspaces';
COMMENT ON TABLE workspace_contexts IS 'Epic 23: User context and preferences per workspace';
COMMENT ON TABLE resource_quotas IS 'Epic 23: Detailed resource quotas and usage tracking';
COMMENT ON TABLE quota_usage_events IS 'Epic 23: Audit trail for quota usage and analytics';
COMMENT ON TABLE notification_preferences IS 'Epic 23: User notification preferences per workspace';
COMMENT ON TABLE workspace_isolation IS 'Epic 23: Workspace isolation and federation settings';