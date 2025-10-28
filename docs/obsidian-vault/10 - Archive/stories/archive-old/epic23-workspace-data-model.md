# Epic 23: Enhanced Workspace Data Model Design

**Task**: E23-1753115279521-7A79DE - Design workspace data model (projects, resources, permissions)
**Epic**: Collaborative Workspaces & Real-time Co-editing
**Story**: 23.2

## Overview

This document outlines the enhanced workspace data model design for Epic 23, building upon the existing robust architecture while adding support for advanced collaborative features, real-time co-editing, and improved multi-tenancy capabilities.

## Current Architecture Assessment

### Existing Strengths

- ✅ **Mature Authentication System**: JWT + OAuth2 with MFA support
- ✅ **Sophisticated RBAC**: Bitmask permissions (21+ granular types)
- ✅ **Multi-tenant Architecture**: Workspace-based isolation
- ✅ **Type-Safe Design**: Zod + TypeScript throughout
- ✅ **Robust Data Layer**: PostgreSQL with UUID-based design
- ✅ **Audit & Activity Tracking**: Comprehensive logging system

### Enhancement Requirements for Epic 23

- 🎯 **Real-time Collaboration**: Live cursors, selections, collaborative editing
- 🎯 **Advanced Permissions**: Fine-grained resource-level permissions
- 🎯 **Resource Quotas**: Workspace limits and usage tracking
- 🎯 **Enhanced Context**: User presence and workspace state management
- 🎯 **Version Control**: Conflict resolution and merge capabilities

## 1. Enhanced Multi-Tenant Workspace Architecture

### 1.1 Workspace Enhancements

Building on the existing workspace model with collaborative features:

```typescript
export interface EnhancedWorkspace extends Workspace {
  // Existing fields from current model
  id: string;
  owner_id: string;
  name: string;
  description?: string;
  settings: Record<string, any>;
  created_at: Date;
  updated_at: Date;
  archived_at?: Date;

  // Epic 23 Enhancements
  collaboration_settings: {
    max_concurrent_editors: number; // Default: 10
    auto_save_interval: number; // Milliseconds, default: 5000
    conflict_resolution:
      | 'last_writer_wins'
      | 'operational_transform'
      | 'manual';
    real_time_cursors: boolean; // Show live cursors
    allow_anonymous_viewers: boolean; // Guest access
    session_timeout: number; // Minutes, default: 30
  };

  resource_quotas: {
    max_projects: number; // Default: 100
    max_resources_per_project: number; // Default: 1000
    max_storage_bytes: number; // Default: 1GB
    max_concurrent_sessions: number; // Default: 25
  };

  usage_stats: {
    current_projects: number;
    current_resources: number;
    current_storage_bytes: number;
    active_sessions: number;
    last_activity_at: Date;
  };

  // Collaborative state
  active_sessions: number; // Current active sessions
  last_collaborative_activity: Date; // Last real-time edit
  version: number; // Workspace version for optimistic locking
}
```

### 1.2 Workspace Isolation Strategy

```typescript
export enum IsolationLevel {
  STRICT = 'strict', // Complete isolation (default)
  SHARED_READ = 'shared_read', // Cross-workspace read access
  FEDERATED = 'federated' // Cross-workspace collaboration
}

export interface WorkspaceIsolation {
  workspace_id: string;
  isolation_level: IsolationLevel;
  shared_with: string[]; // Other workspace IDs
  federation_rules: {
    allow_resource_sharing: boolean;
    allow_user_discovery: boolean;
    allow_project_imports: boolean;
  };
}
```

## 2. Enhanced Role-Based Access Control (RBAC)

### 2.1 Extended Permission Model

Building on the existing 21+ permission types with collaborative permissions:

```typescript
export const COLLABORATIVE_PERMISSIONS = {
  // Existing permissions (1 << 0 through 1 << 20)
  ...PERMISSIONS,

  // Epic 23 Collaborative Permissions (1 << 21 onwards)
  REAL_TIME_EDIT: 1 << 21, // Can participate in real-time editing
  PRESENCE_VIEW: 1 << 22, // Can see other users' presence
  PRESENCE_BROADCAST: 1 << 23, // Can broadcast own presence
  CURSOR_VIEW: 1 << 24, // Can see live cursors
  CURSOR_BROADCAST: 1 << 25, // Can broadcast own cursor
  CONFLICT_RESOLVE: 1 << 26, // Can resolve merge conflicts
  SESSION_MANAGE: 1 << 27, // Can manage active sessions
  VERSION_CONTROL: 1 << 28, // Can access version history
  BRANCH_CREATE: 1 << 29, // Can create content branches
  MERGE_APPROVE: 1 << 30, // Can approve merge requests

  // Meta permissions
  ALL_COLLABORATIVE: (1 << 31) - (1 << 21) // All collaborative permissions
} as const;

export type Permission = keyof typeof COLLABORATIVE_PERMISSIONS;
```

### 2.2 Enhanced Role Definitions

```typescript
export interface CollaborativeRole extends Role {
  // Existing role fields
  id: string;
  workspace_id: string;
  name: string;
  permissions: bigint;
  is_system_role: boolean;

  // Epic 23 Enhancements
  collaboration_settings: {
    max_concurrent_edits: number; // How many resources can edit simultaneously
    priority_level: 'low' | 'normal' | 'high' | 'critical'; // Conflict resolution priority
    auto_save_enabled: boolean; // Can use auto-save
    session_duration_minutes: number; // Max session length
  };

  quota_overrides?: Partial<ResourceQuotas>; // Role-specific quota modifications
}

// Predefined collaborative roles
export const COLLABORATIVE_SYSTEM_ROLES = {
  COLLABORATIVE_ADMIN: {
    name: 'Collaborative Admin',
    permissions:
      PERMISSIONS.WORKSPACE_ADMIN | COLLABORATIVE_PERMISSIONS.ALL_COLLABORATIVE,
    collaboration_settings: {
      max_concurrent_edits: -1, // Unlimited
      priority_level: 'critical',
      auto_save_enabled: true,
      session_duration_minutes: 480 // 8 hours
    }
  },

  COLLABORATIVE_EDITOR: {
    name: 'Collaborative Editor',
    permissions:
      PERMISSIONS.RESOURCE_WRITE |
      COLLABORATIVE_PERMISSIONS.REAL_TIME_EDIT |
      COLLABORATIVE_PERMISSIONS.PRESENCE_VIEW |
      COLLABORATIVE_PERMISSIONS.CURSOR_VIEW,
    collaboration_settings: {
      max_concurrent_edits: 5,
      priority_level: 'normal',
      auto_save_enabled: true,
      session_duration_minutes: 240 // 4 hours
    }
  },

  COLLABORATIVE_REVIEWER: {
    name: 'Collaborative Reviewer',
    permissions:
      PERMISSIONS.RESOURCE_READ |
      COLLABORATIVE_PERMISSIONS.PRESENCE_VIEW |
      COLLABORATIVE_PERMISSIONS.CONFLICT_RESOLVE |
      COLLABORATIVE_PERMISSIONS.MERGE_APPROVE,
    collaboration_settings: {
      max_concurrent_edits: 0, // Read-only real-time access
      priority_level: 'high',
      auto_save_enabled: false,
      session_duration_minutes: 120 // 2 hours
    }
  }
} as const;
```

## 3. Enhanced Resource Management and Quotas

### 3.1 Resource Model Enhancements

```typescript
export interface CollaborativeResource extends Resource {
  // Existing fields
  id: string;
  project_id: string;
  name: string;
  type: 'graph' | 'template' | 'file' | 'export';
  content_type?: string;
  json_meta: Record<string, any>;
  storage_path?: string;
  content_data?: Record<string, any>;
  size_bytes: number;
  checksum?: string;
  version: number;
  created_by: string;
  created_at: Date;
  updated_at: Date;

  // Epic 23 Collaborative Enhancements
  collaborative_state: {
    is_collaborative: boolean; // Can be edited collaboratively
    active_editors: string[]; // Currently editing user IDs
    edit_sessions: EditSession[]; // Active editing sessions
    lock_status: 'unlocked' | 'soft_lock' | 'hard_lock';
    locked_by?: string; // User ID who has the lock
    locked_at?: Date;
    lock_expires_at?: Date;
  };

  version_control: {
    current_branch: string; // Default: 'main'
    available_branches: string[];
    last_merge_at?: Date;
    merge_conflicts: ConflictMarker[];
    pending_merges: PendingMerge[];
  };

  presence_data: {
    active_viewers: UserPresence[]; // Users currently viewing
    last_presence_update: Date;
    cursor_positions: CursorPosition[];
    selection_ranges: SelectionRange[];
  };

  // Performance and optimization
  optimization_hints: {
    is_large_resource: boolean; // > 1MB or complex structure
    requires_chunking: boolean; // For efficient real-time sync
    cache_strategy: 'aggressive' | 'normal' | 'minimal';
    priority: 'low' | 'normal' | 'high';
  };
}
```

### 3.2 Quota Management System

```typescript
export interface ResourceQuotas {
  workspace_id: string;

  // Storage quotas
  max_storage_bytes: number;
  current_storage_bytes: number;
  storage_warning_threshold: number; // % of max (default: 80)

  // Resource count quotas
  max_projects: number;
  current_projects: number;
  max_resources_per_project: number;

  // Collaborative quotas
  max_concurrent_sessions: number;
  current_concurrent_sessions: number;
  max_concurrent_editors_per_resource: number;

  // Time-based quotas
  max_session_duration_minutes: number;
  max_monthly_edit_hours: number;
  current_monthly_edit_hours: number;

  // API quotas
  max_api_requests_per_hour: number;
  current_api_requests_per_hour: number;

  // Enforcement settings
  enforce_hard_limits: boolean; // Block vs warn on quota exceeded
  grace_period_hours: number; // Allow brief overages
  quota_reset_schedule: 'daily' | 'weekly' | 'monthly';

  last_updated: Date;
  next_reset: Date;
}

export interface QuotaUsageEvent {
  id: string;
  workspace_id: string;
  user_id: string;
  quota_type: keyof ResourceQuotas;
  usage_delta: number; // Change in usage
  timestamp: Date;
  context: {
    resource_id?: string;
    project_id?: string;
    session_id?: string;
    operation: string;
  };
}
```

## 4. Real-time Collaboration Data Models

### 4.1 Edit Session Management

```typescript
export interface EditSession {
  id: string;
  resource_id: string;
  user_id: string;
  workspace_id: string;

  session_info: {
    started_at: Date;
    last_activity_at: Date;
    expires_at: Date;
    client_id: string; // Browser/device identifier
    user_agent: string;
    ip_address?: string;
  };

  editing_state: {
    current_cursor_position?: CursorPosition;
    current_selection?: SelectionRange;
    editing_mode: 'read' | 'edit' | 'review' | 'conflict_resolution';
    is_active: boolean;
    has_unsaved_changes: boolean;
  };

  collaboration_metadata: {
    priority_level: number; // For conflict resolution
    edit_permissions: Permission[];
    can_force_save: boolean;
    auto_save_interval: number;
  };
}

export interface CursorPosition {
  user_id: string;
  resource_id: string;
  position: {
    node_id?: string; // For graph editing
    field_path?: string; // JSON path for structured data
    line?: number; // For text content
    column?: number;
    offset?: number; // Character offset
  };
  timestamp: Date;
  is_typing: boolean;
}

export interface SelectionRange {
  user_id: string;
  resource_id: string;
  start: CursorPosition['position'];
  end: CursorPosition['position'];
  selection_type: 'text' | 'node' | 'component' | 'region';
  timestamp: Date;
}
```

### 4.2 User Presence System

```typescript
export interface UserPresence {
  user_id: string;
  workspace_id: string;

  presence_status: {
    status: 'online' | 'idle' | 'away' | 'do_not_disturb' | 'offline';
    custom_message?: string;
    last_seen_at: Date;
    is_mobile: boolean;
  };

  current_context: {
    current_project_id?: string;
    current_resource_id?: string;
    current_view: 'dashboard' | 'project' | 'resource' | 'settings';
    cursor_position?: CursorPosition;
    selection_range?: SelectionRange;
  };

  collaboration_state: {
    is_editing: boolean;
    editing_resources: string[]; // Resource IDs currently editing
    can_be_interrupted: boolean; // For conflict resolution
    collaboration_role: string; // Current role in this context
  };

  session_metadata: {
    session_id: string;
    client_type: 'web' | 'desktop' | 'mobile';
    client_version: string;
    connection_quality: 'excellent' | 'good' | 'fair' | 'poor';
    latency_ms?: number;
  };

  timestamp: Date;
}
```

## 5. Workspace Context and State Management

### 5.1 Workspace Context Model

```typescript
export interface WorkspaceContext {
  workspace_id: string;
  user_id: string;

  // User's current context within the workspace
  navigation_state: {
    current_view: 'dashboard' | 'projects' | 'resources' | 'settings' | 'collaboration';
    current_project_id?: string;
    current_resource_id?: string;
    breadcrumb_path: string[];
    recent_projects: string[];      // Recently accessed project IDs
    recent_resources: string[];     // Recently accessed resource IDs
  };

  // Collaboration state
  collaboration_context: {
    active_sessions: EditSession[];
    visible_users: UserPresence[];
    notification_preferences: NotificationPreferences;
    collaboration_mode: 'individual' | 'paired' | 'team' | 'review';
  };

  // Workspace-specific preferences
  workspace_preferences: {
    default_project_template?: string;
    auto_save_interval: number;
    real_time_updates: boolean;
    cursor_visibility: boolean;
    presence_visibility: boolean;
    conflict_resolution_preference: 'ask' | 'auto_merge' | 'manual';
  };

  // Performance and caching
  cache_state: {
    cached_projects: Map<string, Date>;     // Project ID -> Last cached
    cached_resources: Map<string, Date>;    // Resource ID -> Last cached
    cache_size_bytes: number;
    last_cache_cleanup: Date;
  };

  last_updated: Date;
  expires_at: Date;
}

export interface NotificationPreferences {
  workspace_id: string;
  user_id: string;

  notifications: {
    new_collaborators: boolean;
    edit_conflicts: boolean;
    resource_changes: boolean;
    @mentions: boolean;
    system_announcements: boolean;
    quota_warnings: boolean;
  };

  delivery_methods: {
    in_app: boolean;
    email: boolean;
    push: boolean;
    slack?: string;                 // Webhook URL
    teams?: string;                 // Webhook URL
  };

  quiet_hours: {
    enabled: boolean;
    start_time: string;             // HH:MM format
    end_time: string;
    timezone: string;
  };
}
```

### 5.2 Workspace Switching and Context Preservation

```typescript
export interface WorkspaceSwitchContext {
  user_id: string;
  from_workspace_id?: string;
  to_workspace_id: string;

  // Context preservation
  preserve_state: {
    open_projects: string[];
    open_resources: string[];
    unsaved_changes: UnsavedChange[];
    active_sessions: string[]; // Session IDs to maintain
  };

  // Security context
  security_context: {
    requires_reauthentication: boolean;
    permission_level_change: boolean;
    mfa_required: boolean;
    session_elevation_needed: boolean;
  };

  switch_metadata: {
    switch_reason: 'user_action' | 'invitation' | 'redirect' | 'system';
    initiated_at: Date;
    completed_at?: Date;
    failed_at?: Date;
    error_message?: string;
  };
}

export interface UnsavedChange {
  resource_id: string;
  change_type: 'content' | 'metadata' | 'structure';
  change_data: Record<string, any>;
  timestamp: Date;
  auto_save_eligible: boolean;
}
```

## 6. Database Schema Design

### 6.1 Enhanced Schema Tables

Building on existing tables with Epic 23 enhancements:

```sql
-- Enhanced workspaces table (extends existing)
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS collaboration_settings JSONB DEFAULT '{
  "max_concurrent_editors": 10,
  "auto_save_interval": 5000,
  "conflict_resolution": "last_writer_wins",
  "real_time_cursors": true,
  "allow_anonymous_viewers": false,
  "session_timeout": 30
}';

ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS resource_quotas JSONB DEFAULT '{
  "max_projects": 100,
  "max_resources_per_project": 1000,
  "max_storage_bytes": 1073741824,
  "max_concurrent_sessions": 25
}';

ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS usage_stats JSONB DEFAULT '{
  "current_projects": 0,
  "current_resources": 0,
  "current_storage_bytes": 0,
  "active_sessions": 0
}';

ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS active_sessions INTEGER DEFAULT 0;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS last_collaborative_activity TIMESTAMP WITH TIME ZONE;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

-- Enhanced resources table (extends existing)
ALTER TABLE resources ADD COLUMN IF NOT EXISTS collaborative_state JSONB DEFAULT '{
  "is_collaborative": false,
  "active_editors": [],
  "edit_sessions": [],
  "lock_status": "unlocked"
}';

ALTER TABLE resources ADD COLUMN IF NOT EXISTS version_control JSONB DEFAULT '{
  "current_branch": "main",
  "available_branches": ["main"],
  "merge_conflicts": [],
  "pending_merges": []
}';

ALTER TABLE resources ADD COLUMN IF NOT EXISTS presence_data JSONB DEFAULT '{
  "active_viewers": [],
  "cursor_positions": [],
  "selection_ranges": []
}';

ALTER TABLE resources ADD COLUMN IF NOT EXISTS optimization_hints JSONB DEFAULT '{
  "is_large_resource": false,
  "requires_chunking": false,
  "cache_strategy": "normal",
  "priority": "normal"
}';

-- New collaborative tables
CREATE TABLE IF NOT EXISTS edit_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,

  session_info JSONB NOT NULL,
  editing_state JSONB NOT NULL,
  collaboration_metadata JSONB NOT NULL,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,

  CONSTRAINT fk_edit_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_presence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,

  presence_status JSONB NOT NULL,
  current_context JSONB,
  collaboration_state JSONB,
  session_metadata JSONB,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT fk_user_presence_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT unique_user_workspace_presence UNIQUE (user_id, workspace_id)
);

CREATE TABLE IF NOT EXISTS workspace_contexts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL,

  navigation_state JSONB NOT NULL,
  collaboration_context JSONB,
  workspace_preferences JSONB,
  cache_state JSONB,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,

  CONSTRAINT fk_workspace_contexts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT unique_user_workspace_context UNIQUE (user_id, workspace_id)
);

CREATE TABLE IF NOT EXISTS resource_quotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,

  max_storage_bytes BIGINT NOT NULL DEFAULT 1073741824,
  current_storage_bytes BIGINT NOT NULL DEFAULT 0,
  storage_warning_threshold INTEGER NOT NULL DEFAULT 80,

  max_projects INTEGER NOT NULL DEFAULT 100,
  current_projects INTEGER NOT NULL DEFAULT 0,
  max_resources_per_project INTEGER NOT NULL DEFAULT 1000,

  max_concurrent_sessions INTEGER NOT NULL DEFAULT 25,
  current_concurrent_sessions INTEGER NOT NULL DEFAULT 0,
  max_concurrent_editors_per_resource INTEGER NOT NULL DEFAULT 10,

  max_session_duration_minutes INTEGER NOT NULL DEFAULT 480,
  max_monthly_edit_hours INTEGER NOT NULL DEFAULT 200,
  current_monthly_edit_hours INTEGER NOT NULL DEFAULT 0,

  max_api_requests_per_hour INTEGER NOT NULL DEFAULT 10000,
  current_api_requests_per_hour INTEGER NOT NULL DEFAULT 0,

  enforce_hard_limits BOOLEAN NOT NULL DEFAULT TRUE,
  grace_period_hours INTEGER NOT NULL DEFAULT 24,
  quota_reset_schedule VARCHAR(20) NOT NULL DEFAULT 'monthly',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  next_reset TIMESTAMP WITH TIME ZONE NOT NULL,

  CONSTRAINT unique_workspace_quota UNIQUE (workspace_id)
);

CREATE TABLE IF NOT EXISTS quota_usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL,
  quota_type VARCHAR(50) NOT NULL,
  usage_delta INTEGER NOT NULL,
  context JSONB,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT fk_quota_usage_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 6.2 Performance Indexes

```sql
-- Performance indexes for collaborative features
CREATE INDEX IF NOT EXISTS idx_edit_sessions_resource_active
  ON edit_sessions(resource_id, expires_at)
  WHERE expires_at > NOW();

CREATE INDEX IF NOT EXISTS idx_edit_sessions_user_workspace
  ON edit_sessions(user_id, workspace_id, expires_at);

CREATE INDEX IF NOT EXISTS idx_user_presence_workspace_active
  ON user_presence(workspace_id, updated_at)
  WHERE updated_at > NOW() - INTERVAL '5 minutes';

CREATE INDEX IF NOT EXISTS idx_workspace_contexts_user_expires
  ON workspace_contexts(user_id, expires_at)
  WHERE expires_at > NOW();

CREATE INDEX IF NOT EXISTS idx_quota_usage_workspace_time
  ON quota_usage_events(workspace_id, created_at);

CREATE INDEX IF NOT EXISTS idx_quota_usage_type_time
  ON quota_usage_events(quota_type, created_at);

-- JSONB indexes for collaborative state queries
CREATE INDEX IF NOT EXISTS idx_resources_collaborative_state
  ON resources USING GIN (collaborative_state);

CREATE INDEX IF NOT EXISTS idx_resources_presence_data
  ON resources USING GIN (presence_data);

CREATE INDEX IF NOT EXISTS idx_workspaces_collaboration_settings
  ON workspaces USING GIN (collaboration_settings);
```

## 7. API Integration Points

### 7.1 Enhanced DAO Pattern

```typescript
export class CollaborativeWorkspaceDAO extends WorkspaceDAO {
  async createCollaborativeWorkspace(
    data: CreateCollaborativeWorkspace,
    userId: string
  ): Promise<EnhancedWorkspace> {
    const workspace = await this.createWorkspace(data, userId);

    // Initialize collaborative features
    await this.initializeCollaborativeFeatures(workspace.id);

    // Set up default quotas
    await this.createDefaultQuotas(workspace.id);

    return this.getEnhancedWorkspace(workspace.id);
  }

  async updateWorkspaceCollaborationSettings(
    workspaceId: string,
    settings: Partial<EnhancedWorkspace['collaboration_settings']>
  ): Promise<void> {
    const stmt = this.db.prepare(`
      UPDATE workspaces 
      SET collaboration_settings = json_patch(collaboration_settings, ?),
          updated_at = CURRENT_TIMESTAMP,
          version = version + 1
      WHERE id = ?
    `);

    await stmt.run(JSON.stringify(settings), workspaceId);
  }

  async getActiveEditSessions(workspaceId: string): Promise<EditSession[]> {
    const stmt = this.db.prepare(`
      SELECT * FROM edit_sessions 
      WHERE workspace_id = ? 
        AND expires_at > CURRENT_TIMESTAMP
      ORDER BY updated_at DESC
    `);

    return stmt.all(workspaceId).map(row => ({
      ...row,
      session_info: JSON.parse(row.session_info),
      editing_state: JSON.parse(row.editing_state),
      collaboration_metadata: JSON.parse(row.collaboration_metadata)
    }));
  }

  async enforceResourceQuotas(
    workspaceId: string,
    quotaType: keyof ResourceQuotas,
    requestedUsage: number
  ): Promise<{
    allowed: boolean;
    reason?: string;
    current: number;
    limit: number;
  }> {
    const quotas = await this.getResourceQuotas(workspaceId);
    const currentKey = `current_${quotaType}` as keyof ResourceQuotas;
    const maxKey = `max_${quotaType}` as keyof ResourceQuotas;

    const current = quotas[currentKey] as number;
    const max = quotas[maxKey] as number;

    if (current + requestedUsage > max) {
      return {
        allowed: false,
        reason: `Would exceed ${quotaType} quota: ${current + requestedUsage} > ${max}`,
        current,
        limit: max
      };
    }

    return { allowed: true, current, limit: max };
  }
}
```

## 8. Implementation Priorities and Acceptance Criteria

### 8.1 Acceptance Criteria Mapping

✅ **Workspace management supports multi-tenant isolation**

- Enhanced workspace model with isolation levels
- Workspace-specific quotas and resource limits
- Cross-workspace sharing controls with federation rules

✅ **Role-based access control enforces permissions correctly**

- Extended RBAC with 10+ new collaborative permissions
- Role-specific collaboration settings and quotas
- Fine-grained resource-level permission enforcement

✅ **Workspace switching maintains user context**

- Comprehensive workspace context preservation
- Unsaved changes tracking and restoration
- Security context validation during switches

✅ **Resource quotas prevent workspace abuse**

- Multi-dimensional quota system (storage, API, sessions)
- Real-time quota enforcement with grace periods
- Usage tracking and analytics for optimization

### 8.2 Implementation Roadmap

**Phase 1: Core Data Models** (2 hours)

- Implement enhanced TypeScript interfaces
- Create database migration scripts
- Add basic DAO layer extensions

**Phase 2: Collaboration Infrastructure** (2 hours)

- Edit session management system
- User presence tracking
- Real-time cursor and selection models

**Phase 3: Quota and Context Systems** (1.5 hours)

- Resource quota enforcement
- Workspace context management
- Performance optimization hints

**Phase 4: Integration and Testing** (0.5 hours)

- API endpoint integration
- Unit and integration tests
- Documentation and examples

## 9. Security and Performance Considerations

### 9.1 Security Enhancements

- **Session Security**: Encrypted session tokens with rotation
- **Permission Validation**: Real-time permission checking for all operations
- **Audit Logging**: Comprehensive tracking of all collaborative actions
- **Rate Limiting**: Per-user and per-workspace API rate limits
- **Data Isolation**: Strict workspace boundary enforcement

### 9.2 Performance Optimizations

- **Efficient Indexing**: Specialized indexes for collaborative queries
- **Caching Strategy**: Multi-layer caching for presence and context data
- **Connection Pooling**: Optimized database connections for real-time features
- **Batch Operations**: Efficient bulk operations for quota management
- **Lazy Loading**: On-demand loading of collaborative state data

## 10. Migration and Backward Compatibility

### 10.1 Migration Strategy

- **Incremental Migration**: Existing workspaces automatically upgraded
- **Default Settings**: Conservative defaults for all new collaborative features
- **Rollback Support**: Schema versioning for safe rollbacks
- **Data Preservation**: All existing data preserved during migration

### 10.2 Backward Compatibility

- **API Compatibility**: Existing APIs continue to function unchanged
- **Client Support**: Enhanced features optional for older clients
- **Grace Period**: Gradual rollout of quota enforcement
- **Feature Flags**: Toggle collaborative features per workspace

This enhanced workspace data model provides a robust foundation for Epic 23's collaborative editing features while building upon the existing proven architecture patterns.
