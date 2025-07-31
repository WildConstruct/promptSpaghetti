/**
 * Epic 9.2.1 - Workspace Data Models
 * TypeScript models for collaborative workspace functionality
 * Enhanced with Epic 9.2.2 - Authentication and Access Control
 */

import { z } from 'zod';

// Permission bitmask constants
export const PERMISSIONS = {
  // Workspace permissions
  WORKSPACE_READ: 1 << 0,
  WORKSPACE_WRITE: 1 << 1,
  WORKSPACE_ADMIN: 1 << 2,
  WORKSPACE_DELETE: 1 << 3,
  
  // Project permissions
  PROJECT_READ: 1 << 4,
  PROJECT_WRITE: 1 << 5,
  PROJECT_CREATE: 1 << 6,
  PROJECT_DELETE: 1 << 7,
  
  // Resource permissions
  RESOURCE_READ: 1 << 8,
  RESOURCE_WRITE: 1 << 9,
  RESOURCE_CREATE: 1 << 10,
  RESOURCE_DELETE: 1 << 11,
  
  // Comment permissions
  COMMENT_READ: 1 << 12,
  COMMENT_WRITE: 1 << 13,
  COMMENT_DELETE: 1 << 14,
  
  // User management permissions
  USER_INVITE: 1 << 15,
  USER_REMOVE: 1 << 16,
  USER_ASSIGN_ROLES: 1 << 17,
  
  // Advanced permissions
  ACTIVITY_READ: 1 << 18,
  NOTIFICATION_MANAGE: 1 << 19,
  EXPORT_DATA: 1 << 20
} as const;

// Pre-defined role permissions
export const ROLE_PERMISSIONS = {
  ADMIN: Object.values(PERMISSIONS).reduce((sum, perm) => sum | perm, 0), // All permissions
  EDITOR: PERMISSIONS.WORKSPACE_READ | PERMISSIONS.PROJECT_READ | PERMISSIONS.PROJECT_WRITE | 
          PERMISSIONS.PROJECT_CREATE | PERMISSIONS.RESOURCE_READ | PERMISSIONS.RESOURCE_WRITE | 
          PERMISSIONS.RESOURCE_CREATE | PERMISSIONS.COMMENT_READ | PERMISSIONS.COMMENT_WRITE | 
          PERMISSIONS.ACTIVITY_READ,
  VIEWER: PERMISSIONS.WORKSPACE_READ | PERMISSIONS.PROJECT_READ | PERMISSIONS.RESOURCE_READ | 
          PERMISSIONS.COMMENT_READ | PERMISSIONS.ACTIVITY_READ,
  COMMENTER: PERMISSIONS.WORKSPACE_READ | PERMISSIONS.PROJECT_READ | PERMISSIONS.RESOURCE_READ | 
             PERMISSIONS.COMMENT_READ | PERMISSIONS.COMMENT_WRITE | PERMISSIONS.ACTIVITY_READ
} as const;

// User authentication and profile schemas
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1).max(255),
  avatar: z.string().url().optional(),
  password_hash: z.string().optional(), // For local auth
  auth_provider: z.enum(['local', 'google', 'github', 'microsoft', 'okta', 'auth0']).default('local'),
  auth_provider_id: z.string().optional(), // External provider user ID
  email_verified: z.boolean().default(false),
  mfa_enabled: z.boolean().default(false),
  mfa_secret: z.string().optional(),
  backup_codes: z.array(z.string()).default([]),
  last_login_at: z.date().optional(),
  created_at: z.date(),
  updated_at: z.date(),
  deactivated_at: z.date().nullable()
});

export const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(255),
  avatar: z.string().url().optional(),
  password: z.string().min(8).optional(), // For local auth
  auth_provider: z.enum(['local', 'google', 'github', 'microsoft', 'okta', 'auth0']).default('local'),
  auth_provider_id: z.string().optional()
});

export const UpdateUserSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  avatar: z.string().url().optional(),
  email_verified: z.boolean().optional()
});

export const UserSessionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  session_token: z.string(),
  expires_at: z.date(),
  user_agent: z.string().optional(),
  ip_address: z.string().optional(),
  created_at: z.date(),
  last_active_at: z.date()
});

export const CreateUserSessionSchema = z.object({
  user_id: z.string().uuid(),
  session_token: z.string(),
  expires_at: z.date(),
  user_agent: z.string().optional(),
  ip_address: z.string().optional()
});

export const OAuthStateSchema = z.object({
  id: z.string().uuid(),
  state: z.string(),
  provider: z.enum(['google', 'github', 'microsoft', 'okta', 'auth0']),
  redirect_uri: z.string().url(),
  workspace_id: z.string().uuid().optional(),
  expires_at: z.date(),
  created_at: z.date()
});

// Zod schemas for validation
export const WorkspaceSchema = z.object({
  id: z.string().uuid(),
  owner_id: z.string(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  settings: z.record(z.unknown()).default({}),
  created_at: z.date(),
  updated_at: z.date(),
  archived_at: z.date().nullable()
});

export const CreateWorkspaceSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  settings: z.record(z.unknown()).optional().default({})
});

export const UpdateWorkspaceSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  settings: z.record(z.unknown()).optional()
});

export const ProjectSchema = z.object({
  id: z.string().uuid(),
  workspace_id: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  status: z.enum(['draft', 'active', 'archived', 'deleted']),
  metadata: z.record(z.unknown()).default({}),
  created_by: z.string(),
  created_at: z.date(),
  updated_at: z.date()
});

export const CreateProjectSchema = z.object({
  workspace_id: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  metadata: z.record(z.unknown()).optional().default({})
});

export const UpdateProjectSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  status: z.enum(['draft', 'active', 'archived', 'deleted']).optional(),
  metadata: z.record(z.unknown()).optional()
});

export const ResourceSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  name: z.string().min(1).max(255),
  type: z.enum(['graph', 'template', 'file', 'export']),
  content_type: z.string().optional(),
  json_meta: z.record(z.unknown()).default({}),
  storage_path: z.string().optional(),
  content_data: z.record(z.unknown()).optional(),
  size_bytes: z.number().int().min(0),
  checksum: z.string().optional(),
  version: z.number().int().min(1),
  created_by: z.string(),
  created_at: z.date(),
  updated_at: z.date()
});

export const CreateResourceSchema = z.object({
  project_id: z.string().uuid(),
  name: z.string().min(1).max(255),
  type: z.enum(['graph', 'template', 'file', 'export']),
  content_type: z.string().optional(),
  json_meta: z.record(z.unknown()).optional().default({}),
  storage_path: z.string().optional(),
  content_data: z.record(z.unknown()).optional(),
  size_bytes: z.number().int().min(0).optional().default(0),
  checksum: z.string().optional()
});

export const ACLRoleSchema = z.object({
  id: z.string().uuid(),
  workspace_id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  permissions: z.number().int(),
  is_system_role: z.boolean(),
  created_at: z.date(),
  updated_at: z.date()
});

export const CreateACLRoleSchema = z.object({
  workspace_id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  permissions: z.number().int()
});

export const ACLAssignmentSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string(),
  role_id: z.string().uuid(),
  scope_type: z.enum(['workspace', 'project']),
  scope_id: z.string().uuid(),
  granted_by: z.string(),
  granted_at: z.date(),
  expires_at: z.date().optional()
});

export const CreateACLAssignmentSchema = z.object({
  user_id: z.string(),
  role_id: z.string().uuid(),
  scope_type: z.enum(['workspace', 'project']),
  scope_id: z.string().uuid(),
  expires_at: z.date().optional()
});

export const UserMembershipSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string(),
  workspace_id: z.string().uuid(),
  status: z.enum(['pending', 'active', 'suspended', 'left']),
  invited_by: z.string().optional(),
  joined_at: z.date(),
  last_active_at: z.date()
});

export const CreateUserMembershipSchema = z.object({
  user_id: z.string(),
  workspace_id: z.string().uuid(),
  invited_by: z.string().optional()
});

export const ActivityEventSchema = z.object({
  id: z.string().uuid(),
  workspace_id: z.string().uuid(),
  project_id: z.string().uuid().optional(),
  resource_id: z.string().uuid().optional(),
  actor_id: z.string(),
  event_type: z.string(),
  event_data: z.record(z.unknown()).default({}),
  aggregation_key: z.string().optional(),
  created_at: z.date()
});

export const CreateActivityEventSchema = z.object({
  workspace_id: z.string().uuid(),
  project_id: z.string().uuid().optional(),
  resource_id: z.string().uuid().optional(),
  actor_id: z.string(),
  event_type: z.string(),
  event_data: z.record(z.unknown()).optional().default({}),
  aggregation_key: z.string().optional()
});

export const CommentSchema = z.object({
  id: z.string().uuid(),
  resource_id: z.string().uuid(),
  parent_id: z.string().uuid().optional(),
  author_id: z.string(),
  content_markdown: z.string().min(1),
  content_html: z.string().optional(),
  target_type: z.enum(['resource', 'node', 'region']).optional(),
  target_data: z.record(z.unknown()).default({}),
  status: z.enum(['active', 'edited', 'deleted', 'resolved']),
  edited_at: z.date().optional(),
  resolved_by: z.string().optional(),
  resolved_at: z.date().optional(),
  created_at: z.date(),
  updated_at: z.date()
});

export const CreateCommentSchema = z.object({
  resource_id: z.string().uuid(),
  parent_id: z.string().uuid().optional(),
  author_id: z.string(),
  content_markdown: z.string().min(1),
  target_type: z.enum(['resource', 'node', 'region']).optional(),
  target_data: z.record(z.unknown()).optional().default({})
});

export const UpdateCommentSchema = z.object({
  content_markdown: z.string().min(1).optional(),
  status: z.enum(['active', 'edited', 'deleted', 'resolved']).optional()
});

export const NotificationSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string(),
  workspace_id: z.string().uuid(),
  event_id: z.string().uuid().optional(),
  notification_type: z.string(),
  title: z.string(),
  message: z.string().optional(),
  action_url: z.string().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']),
  delivery_channel: z.enum(['in_app', 'email', 'push']),
  read_at: z.date().optional(),
  delivered_at: z.date()
});

export const CreateNotificationSchema = z.object({
  user_id: z.string(),
  workspace_id: z.string().uuid(),
  event_id: z.string().uuid().optional(),
  notification_type: z.string(),
  title: z.string(),
  message: z.string().optional(),
  action_url: z.string().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional().default('normal'),
  delivery_channel: z.enum(['in_app', 'email', 'push']).optional().default('in_app')
});

// TypeScript types inferred from schemas
export type Workspace = z.infer<typeof WorkspaceSchema>;
export type CreateWorkspace = z.infer<typeof CreateWorkspaceSchema>;
export type UpdateWorkspace = z.infer<typeof UpdateWorkspaceSchema>;

export type Project = z.infer<typeof ProjectSchema>;
export type CreateProject = z.infer<typeof CreateProjectSchema>;
export type UpdateProject = z.infer<typeof UpdateProjectSchema>;

export type Resource = z.infer<typeof ResourceSchema>;
export type CreateResource = z.infer<typeof CreateResourceSchema>;

export type ACLRole = z.infer<typeof ACLRoleSchema>;
export type CreateACLRole = z.infer<typeof CreateACLRoleSchema>;

export type ACLAssignment = z.infer<typeof ACLAssignmentSchema>;
export type CreateACLAssignment = z.infer<typeof CreateACLAssignmentSchema>;

export type UserMembership = z.infer<typeof UserMembershipSchema>;
export type CreateUserMembership = z.infer<typeof CreateUserMembershipSchema>;

export type ActivityEvent = z.infer<typeof ActivityEventSchema>;
export type CreateActivityEvent = z.infer<typeof CreateActivityEventSchema>;

export type Comment = z.infer<typeof CommentSchema>;
export type CreateComment = z.infer<typeof CreateCommentSchema>;
export type UpdateComment = z.infer<typeof UpdateCommentSchema>;

export type Notification = z.infer<typeof NotificationSchema>;
export type CreateNotification = z.infer<typeof CreateNotificationSchema>;

// User and authentication type exports
export type User = z.infer<typeof UserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;

export type UserSession = z.infer<typeof UserSessionSchema>;
export type CreateUserSession = z.infer<typeof CreateUserSessionSchema>;

export type OAuthState = z.infer<typeof OAuthStateSchema>;

// Helper types
}
}
export interface WorkspaceWithMembership extends Workspace {
  membership?: UserMembership;
  role_permissions?: number;
}

}
}
export interface ProjectWithStats extends Project {
  resource_count?: number;
  comment_count?: number;
  last_activity?: Date;
}

}
}
export interface UserWithRoles {
  user_id: string;
  membership: UserMembership;
}
}
  roles: Array<ACLRole & { scope_type: string; scope_id: string }>;
}

}
}
export interface ActivityEventWithActorInfo extends ActivityEvent {
  actor_name?: string;
  actor_avatar?: string;
}

}
}
export interface CommentWithReplies extends Comment {
  replies?: CommentWithReplies[];
  author_name?: string;
  author_avatar?: string;
}

// Pagination types
}
}
export interface PaginationOptions {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}
}
}

}
}
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

// Filter types
}
}
export interface WorkspaceFilter {
  owner_id?: string;
  archived?: boolean;
  search?: string;
}
}
}

}
}
export interface ProjectFilter {
  workspace_id?: string;
  status?: Project['status'][];
  created_by?: string;
  search?: string;
}
}
}

}
}
export interface ActivityEventFilter {
  workspace_id?: string;
  project_id?: string;
  actor_id?: string;
  event_types?: string[];
  from_date?: Date;
  to_date?: Date;
}
}
}

}
}
export interface CommentFilter {
  resource_id?: string;
  author_id?: string;
  status?: Comment['status'][];
  target_type?: Comment['target_type'];
}
}
}