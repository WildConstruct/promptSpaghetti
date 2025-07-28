export interface WorkspaceId extends String {
  readonly __brand: 'WorkspaceId';
  export interface ProjectId extends String {
  readonly __brand: 'ProjectId';
  export interface UserId extends String {
  readonly __brand: 'UserId';
  export interface ResourceId extends String {
  readonly __brand: 'ResourceId';
  export enum WorkspaceRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  COLLABORATOR = 'collaborator',
  VIEWER = 'viewer'
  export enum ProjectRole {
  OWNER = 'owner',
  EDITOR = 'editor',
  VIEWER = 'viewer'
  export enum ResourceType {
  GRAPH = 'graph',
  TEMPLATE = 'template',
  ASSET = 'asset',
  DOCUMENT = 'document'
  export enum ActivityType {
  WORKSPACE_CREATE = 'workspace.create',
  WORKSPACE_UPDATE = 'workspace.update',
  WORKSPACE_DELETE = 'workspace.delete',
  PROJECT_CREATE = 'project.create',
  PROJECT_UPDATE = 'project.update',
  PROJECT_DELETE = 'project.delete',
  RESOURCE_CREATE = 'resource.create',
  RESOURCE_UPDATE = 'resource.update',
  RESOURCE_DELETE = 'resource.delete',
  USER_INVITE = 'user.invite',
  USER_JOIN = 'user.join',
  USER_LEAVE = 'user.leave',
  USER_ROLE_CHANGE = 'user.role_change'
  export interface Workspace {
  id: WorkspaceId;,
  name: string;
  description?: string;
  settings: WorkspaceSettings;,
  created_at: Date;
  updated_at: Date;,
  created_by: UserId;
  is_active: boolean;
}
export interface WorkspaceSettings {
  visibility: 'private' | 'internal' | 'public';,
  features: {,
  real_time_collaboration: boolean;,
  version_history: boolean;
  comments: boolean;,
  notifications: boolean;
  integrations: boolean;
};
  limits: {,
  max_projects: number;
  max_members: number;,
  storage_quota_mb: number;
};
  permissions: {,
  who_can_invite: 'owners' | 'admins' | 'members';
  who_can_create_projects: 'owners' | 'admins' | 'members';,
  default_project_visibility: 'private' | 'workspace' | 'public';
};
}
export interface Project {
  id: ProjectId;,
  workspace_id: WorkspaceId;
  name: string;
  description?: string;
  settings: ProjectSettings;,
  created_at: Date;
  updated_at: Date;,
  created_by: UserId;
  is_active: boolean;,
  last_activity_at: Date;
}
export interface ProjectSettings {
  visibility: 'private' | 'workspace' | 'public';,
  features: {,
  auto_save: boolean;,
  version_control: boolean;
  real_time_sync: boolean;,
  notifications: boolean;
};
  collaboration: {,
  max_concurrent_editors: number;
  conflict_resolution: 'manual' | 'automatic' | 'last_writer_wins';,
  presence_timeout_ms: number;
};
}
export interface Resource {
  id: ResourceId;,
  project_id: ProjectId;
  name: string;,
  type: ResourceType;
  content: any;,
  metadata: ResourceMetadata;
  created_at: Date;,
  updated_at: Date;
  created_by: UserId;,
  is_active: boolean;
  version: number;
}
export interface ResourceMetadata {
  size_bytes: number;
  mime_type?: string;
  checksum: string;,
  tags: string;
  custom_properties: Record<string, any>;
}
export interface WorkspaceMember {
  workspace_id: WorkspaceId;,
  user_id: UserId;
  role: WorkspaceRole;,
  joined_at: Date;
  invited_by: UserId;,
  is_active: boolean;
  last_activity_at: Date;
}
export interface ProjectMember {
  project_id: ProjectId;,
  user_id: UserId;
  role: ProjectRole;,
  joined_at: Date;
  invited_by: UserId;,
  is_active: boolean;
  last_activity_at: Date;
}
export interface ActivityEvent {
  id: string;,
  workspace_id: WorkspaceId;
  project_id?: ProjectId;
  resource_id?: ResourceId;
  user_id: UserId;,
  type: ActivityType;
  details: ActivityDetails;,
  metadata: ActivityMetadata;
  created_at: Date;
}
export interface ActivityDetails {
  action: string;,
  target_type: string;
  target_id: string;

  changes?: Record<string, { from: any; to: any }>;
  description?: string;
}
export interface ActivityMetadata {
  user_agent?: string;
  ip_address?: string;
  session_id?: string;
  request_id?: string;
}
export interface Comment {
  id: string;,
  workspace_id: WorkspaceId;
  project_id?: ProjectId;
  resource_id?: ResourceId;
  parent_comment_id?: string;
  user_id: UserId;,
  content: string;
  metadata: CommentMetadata;,
  created_at: Date;
  updated_at: Date;,
  is_active: boolean;
}
export interface CommentMetadata {
  mentions: UserId;,
  attachments: string;
  reactions: Record<string, UserId>;
  is_resolved: boolean;
  resolved_by?: UserId;
  resolved_at?: Date;
}
export interface Notification {
  id: string;,
  user_id: UserId;
  workspace_id: WorkspaceId;
  project_id?: ProjectId;
  type: NotificationType;,
  title: string;
  message: string;,
  data: NotificationData;
  created_at: Date;
  read_at?: Date;
  is_active: boolean;
}
export enum NotificationType {
  WORKSPACE_INVITE = 'workspace.invite',
  PROJECT_INVITE = 'project.invite',
  COMMENT_MENTION = 'comment.mention',
  COMMENT_REPLY = 'comment.reply',
  RESOURCE_SHARED = 'resource.shared',
  ROLE_CHANGED = 'role.changed',
  ACTIVITY_DIGEST = 'activity.digest'
  export interface NotificationData {
  action_url?: string;
  actor_user_id?: UserId;
  target_type?: string;
  target_id?: string;
  metadata?: Record<string, any>;
  // Workspace operations interface
}
export interface WorkspaceOperations {
  // Workspace management
  createWorkspace(data: Omit<Workspace, 'id' | 'created_at' | 'updated_at'>): Promise<Workspace>;
  getWorkspace(id: WorkspaceId): Promise<Workspace | null>;
  updateWorkspace(id: WorkspaceId, data: Partial<Workspace>): Promise<Workspace>;
  deleteWorkspace(id: WorkspaceId): Promise<void>;
  // Project management
  createProject(data: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'last_activity_at'>): Promise<Project>;
  getProject(id: ProjectId): Promise<Project | null>;
  updateProject(id: ProjectId, data: Partial<Project>): Promise<Project>;
  deleteProject(id: ProjectId): Promise<void>;
  // Resource management
  createResource(data: Omit<Resource, 'id' | 'created_at' | 'updated_at' | 'version'>): Promise<Resource>;
  getResource(id: ResourceId): Promise<Resource | null>;
  updateResource(id: ResourceId, data: Partial<Resource>): Promise<Resource>;
  deleteResource(id: ResourceId): Promise<void>;
  // Membership management
  addWorkspaceMember(workspaceId: WorkspaceId, userId: UserId, role: WorkspaceRole, invitedBy: UserId): Promise<WorkspaceMember>;
  removeWorkspaceMember(workspaceId: WorkspaceId, userId: UserId): Promise<void>;
  updateWorkspaceMemberRole(workspaceId: WorkspaceId, userId: UserId, role: WorkspaceRole): Promise<WorkspaceMember>;
  addProjectMember(projectId: ProjectId, userId: UserId, role: ProjectRole, invitedBy: UserId): Promise<ProjectMember>;
  removeProjectMember(projectId: ProjectId, userId: UserId): Promise<void>;
  updateProjectMemberRole(projectId: ProjectId, userId: UserId, role: ProjectRole): Promise<ProjectMember>;
  // Activity tracking
  logActivity(event: Omit<ActivityEvent, 'id' | 'created_at'>): Promise<ActivityEvent>;
  getWorkspaceActivity(workspaceId: WorkspaceId, limit?: number, offset?: number): Promise<ActivityEvent>;
  // Comments
  createComment(data: Omit<Comment, 'id' | 'created_at' | 'updated_at'>): Promise<Comment>;
  getComments(resourceId: ResourceId): Promise<Comment>;
  updateComment(id: string, content: string): Promise<Comment>;
  deleteComment(id: string): Promise<void>;
  // Notifications
  createNotification(data: Omit<Notification, 'id' | 'created_at'>): Promise<Notification>;
  getUserNotifications(userId: UserId, unreadOnly?: boolean): Promise<Notification>;
  markNotificationRead(id: string): Promise<void>;
}