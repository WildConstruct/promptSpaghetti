/**
 * Epic 9.2.1 - Workspace Types
 * TypeScript types for workspace functionality (client-side)
 */

export interface Workspace {
    id: string;
    owner_id: string;
    name: string;
    description?: string;
    settings: Record<string, any>;
    created_at: Date;
    updated_at: Date;
    archived_at?: Date | null;


export interface CreateWorkspace {
    name: string;
    description?: string;
    settings?: Record<string, any>;


export interface UpdateWorkspace {
    name?: string;
    description?: string;
    settings?: Record<string, any>;


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


export interface CreateProject {
    workspace_id: string;
    name: string;
    description?: string;
    metadata?: Record<string, any>;


export interface UpdateProject {
    name?: string;
    description?: string;
    status?: Project['status'];
    metadata?: Record<string, any>;


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


export interface ACLRole {
    id: string;
    workspace_id: string;
    name: string;
    description?: string;
    permissions: number;
    is_system_role: boolean;
    created_at: Date;
    updated_at: Date;


export interface UserMembership {
    id: string;
    user_id: string;
    workspace_id: string;
    status: 'pending' | 'active' | 'suspended' | 'left';
    invited_by?: string;
    joined_at: Date;
    last_active_at: Date;


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


export interface CreateComment {
    resource_id: string;
    parent_id?: string;
    author_id: string;
    content_markdown: string;
    target_type?: Comment['target_type'];
    target_data?: Record<string, any>;


export interface UpdateComment {
    content_markdown?: string;
    status?: Comment['status'];


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


export interface WorkspaceWithMembership extends Workspace {
    membership?: UserMembership;
    role_permissions?: number;

export interface ProjectWithStats extends Project {
    resource_count?: number;
    comment_count?: number;
    last_activity?: Date;

export interface CommentWithReplies extends Comment {
    replies?: CommentWithReplies[];
    author_name?: string;
    author_avatar?: string;

export interface ActivityEventWithActorInfo extends ActivityEvent {
    actor_name?: string;
    actor_avatar?: string;

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;


export interface PaginatedResponse<T> {
    data: T[];
    pagination: PaginationMeta;

export interface WorkspaceFilter {
    search?: string;
    archived?: boolean;


export interface ProjectFilter {
    search?: string;
    status?: Project['status'][];
    created_by?: string;


export interface ActivityEventFilter {
    project_id?: string;
    actor_id?: string;
    event_types?: string[];
    from_date?: Date;
    to_date?: Date;


export interface CommentFilter {
    resource_id?: string;
    author_id?: string;
    status?: Comment['status'][];
    target_type?: Comment['target_type'];

export declare const PERMISSIONS: {
    readonly WORKSPACE_READ: number;
    readonly WORKSPACE_WRITE: number;
    readonly WORKSPACE_ADMIN: number;
    readonly WORKSPACE_DELETE: number;
    readonly PROJECT_READ: number;
    readonly PROJECT_WRITE: number;
    readonly PROJECT_CREATE: number;
    readonly PROJECT_DELETE: number;
    readonly RESOURCE_READ: number;
    readonly RESOURCE_WRITE: number;
    readonly RESOURCE_CREATE: number;
    readonly RESOURCE_DELETE: number;
    readonly COMMENT_READ: number;
    readonly COMMENT_WRITE: number;
    readonly COMMENT_DELETE: number;
    readonly USER_INVITE: number;
    readonly USER_REMOVE: number;
    readonly USER_ASSIGN_ROLES: number;
    readonly ACTIVITY_READ: number;
    readonly NOTIFICATION_MANAGE: number;
    readonly EXPORT_DATA: number;
};
export declare function hasPermission(userPermissions: number, requiredPermission: number): boolean;
export declare function getRoleName(permissions: number): string;
//# sourceMappingURL=workspace.d.ts.map