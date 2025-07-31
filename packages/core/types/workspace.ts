/**
 * Epic 9.2.1 - Workspace Types
 * TypeScript types for workspace functionality (client-side)
 */

// Core workspace types

}
export interface Workspace {
  id: string;
  owner_id: string;
  name: string;
  description?: string;
  settings: Record<string, any>;
  created_at: Date;
  updated_at: Date;
  archived_at?: Date | null;
}
}
}
export interface CreateWorkspace {
  name: string;
  description?: string;
  settings?: Record<string, any>;
}
}
}
export interface UpdateWorkspace {
  name?: string;
  description?: string;
  settings?: Record<string, any>;
  // Project types
}
}
}
export interface Project {
  id: string;
  workspace_id: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'archived' | 'deleted';
  metadata: Record<string, any>;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}
}
}
export interface CreateProject {
  workspace_id: string;
  name: string;
  description?: string;
  metadata?: Record<string, any>;
}
}
}
export interface UpdateProject {
  name?: string;
  description?: string;
  status?: Project['status'];
  metadata?: Record<string, any>;
  // Resource types
}
}
}
export interface Resource {
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
}
}
}
export interface CreateResource {
  project_id: string;
  name: string;
  type: Resource['type'];
  content_type?: string;
  json_meta?: Record<string, any>;
  storage_path?: string;
  content_data?: Record<string, any>;
  size_bytes?: number;
  checksum?: string;
  // Permission and role types
}
}
}
export interface ACLRole {
  id: string;
  workspace_id: string;
  name: string;
  description?: string;
  permissions: number;
  is_system_role: boolean;
  created_at: Date;
  updated_at: Date;
}
}
}
export interface UserMembership {
  id: string;
  user_id: string;
  workspace_id: string;
  status: 'pending' | 'active' | 'suspended' | 'left';
  invited_by?: string;
  joined_at: Date;
  last_active_at: Date;
  // Activity and notifications
}
}
}
export interface ActivityEvent {
  id: string;
  workspace_id: string;
  project_id?: string;
  resource_id?: string;
  actor_id: string;
  event_type: string;
  event_data: Record<string, any>;
  aggregation_key?: string;
  created_at: Date;
}
}
}
export interface Comment {
  id: string;
  resource_id: string;
  parent_id?: string;
  author_id: string;
  content_markdown: string;
  content_html?: string;
  target_type?: 'resource' | 'node' | 'region';
  target_data: Record<string, any>;
  status: 'active' | 'edited' | 'deleted' | 'resolved';
  edited_at?: Date;
  resolved_by?: string;
  resolved_at?: Date;
  created_at: Date;
  updated_at: Date;
}
}
}
export interface CreateComment {
  resource_id: string;
  parent_id?: string;
  author_id: string;
  content_markdown: string;
  target_type?: Comment['target_type'];
  target_data?: Record<string, any>;
}
}
}
export interface UpdateComment {
  content_markdown?: string;
  status?: Comment['status'];
}
}
}
export interface Notification {
  id: string;
  user_id: string;
  workspace_id: string;
  event_id?: string;
  notification_type: string;
  title: string;
  message?: string;
  action_url?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  delivery_channel: 'in_app' | 'email' | 'push';
  read_at?: Date;
  delivered_at: Date;
  // Extended types with additional data
}
}
}
export interface WorkspaceWithMembership extends Workspace {
  membership?: UserMembership;
  role_permissions?: number;
  export interface ProjectWithStats extends Project {
  resource_count?: number;
  comment_count?: number;
  last_activity?: Date;
  export interface CommentWithReplies extends Comment {
  replies?: CommentWithReplies;
  author_name?: string;
  author_avatar?: string;
  export interface ActivityEventWithActorInfo extends ActivityEvent {
  actor_name?: string;
  actor_avatar?: string;
  // API response types
  export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}
}
}
export interface PaginatedResponse<T> {
  data: T;
  pagination: PaginationMeta;
  // Filter and query types
  export interface WorkspaceFilter {
  search?: string;
  archived?: boolean;
}
}
}
export interface ProjectFilter {
  search?: string;
  status?: Project['status'][];
  created_by?: string;
}
}
}
export interface ActivityEventFilter {
  project_id?: string;
  actor_id?: string;
  event_types?: string;
  from_date?: Date;
  to_date?: Date;
}
}
}
export interface CommentFilter {
  resource_id?: string;
  author_id?: string;
  status?: Comment['status'][];
  target_type?: Comment['target_type'];
  // Permission constants
}
}
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
  EXPORT_DATA: 1 << 20,
} as const;

// Utility functions
export function hasPermission(userPermissions: number, requiredPermission: number): boolean {
  return (userPermissions & requiredPermission) !== 0;

export function getRoleName(permissions: number): string {
  // Check for admin (has all key permissions)
  if (hasPermission(permissions, PERMISSIONS.WORKSPACE_ADMIN)) {
    return 'Admin';

  // Check for editor (can create/edit content)
  if (hasPermission(permissions, PERMISSIONS.PROJECT_CREATE) && 
      hasPermission(permissions, PERMISSIONS.RESOURCE_CREATE)) {
    return 'Editor';

  // Check for commenter (can view and comment)
  if (hasPermission(permissions, PERMISSIONS.COMMENT_WRITE)) {
    return 'Commenter';

  // Default to viewer
  return 'Viewer';
