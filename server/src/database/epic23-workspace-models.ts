/**
 * Epic 23: Enhanced Workspace Data Models
 * 
 * Enhanced TypeScript interfaces for collaborative workspaces, extending
 * the existing workspace system with real-time collaboration features.
 * 
 * Task: E23-1753115279521-7A79DE - Design workspace data model
 */

import { Workspace, Project, Resource, User, Role, Permission } from './workspace-models';

// =============================================================================
// COLLABORATIVE PERMISSIONS SYSTEM
// =============================================================================

/**
 * Extended permission constants for Epic 23 collaborative features
 * Building on existing PERMISSIONS from workspace-models.ts
 */
export const COLLABORATIVE_PERMISSIONS = {
  // Real-time collaboration permissions
  REAL_TIME_EDIT: 1 << 21,           // Can participate in real-time editing
  PRESENCE_VIEW: 1 << 22,            // Can see other users' presence
  PRESENCE_BROADCAST: 1 << 23,       // Can broadcast own presence
  CURSOR_VIEW: 1 << 24,              // Can see live cursors
  CURSOR_BROADCAST: 1 << 25,         // Can broadcast own cursor
  CONFLICT_RESOLVE: 1 << 26,         // Can resolve merge conflicts
  SESSION_MANAGE: 1 << 27,           // Can manage active sessions
  VERSION_CONTROL: 1 << 28,          // Can access version history
  BRANCH_CREATE: 1 << 29,            // Can create content branches
  MERGE_APPROVE: 1 << 30,            // Can approve merge requests
  
  // Computed meta-permissions
  ALL_COLLABORATIVE: ((1 << 30) - (1 << 21)) + (1 << 30) // All collaborative permissions
 as const;

export type CollaborativePermission = keyof typeof COLLABORATIVE_PERMISSIONS;

// =============================================================================
// ENHANCED WORKSPACE MODEL
// =============================================================================

/**
 * Collaboration settings for workspaces
 */



export interface CollaborationSettings {
  max_concurrent_editors: number;        // Default: 10
  auto_save_interval: number;            // Milliseconds, default: 5000
  conflict_resolution: 'last_writer_wins' | 'operational_transform' | 'manual';
  real_time_cursors: boolean;            // Show live cursors
  allow_anonymous_viewers: boolean;      // Guest access
  session_timeout: number;               // Minutes, default: 30





/**
 * Resource quotas for workspace limits
 */



export interface ResourceQuotas {
  max_projects: number;                  // Default: 100
  max_resources_per_project: number;     // Default: 1000
  max_storage_bytes: number;             // Default: 1GB
  max_concurrent_sessions: number;       // Default: 25





/**
 * Current usage statistics
 */



export interface UsageStats {
  current_projects: number;
  current_resources: number;
  current_storage_bytes: number;
  active_sessions: number;
  last_activity_at: Date;





/**
 * Enhanced workspace interface extending base Workspace
 */



export interface EnhancedWorkspace extends Workspace {
  // Epic 23 collaborative enhancements
  collaboration_settings: CollaborationSettings;
  resource_quotas: ResourceQuotas;
  usage_stats: UsageStats;
  
  // Real-time collaborative state
  active_sessions: number;               // Current active sessions
  last_collaborative_activity?: Date;   // Last real-time edit
  version: number;                       // Workspace version for optimistic locking


/**
 * Workspace isolation levels for multi-tenant security
 */
export enum IsolationLevel {
  STRICT = 'strict',           // Complete isolation (default)
  SHARED_READ = 'shared_read', // Cross-workspace read access
  FEDERATED = 'federated'      // Cross-workspace collaboration


/**
 * Workspace isolation configuration
 */



export interface WorkspaceIsolation {
  workspace_id: string;
  isolation_level: IsolationLevel;
  shared_with: string[];       // Other workspace IDs
  federation_rules: {
    allow_resource_sharing: boolean;
    allow_user_discovery: boolean;
    allow_project_imports: boolean;



  };


// =============================================================================
// ENHANCED RBAC SYSTEM
// =============================================================================

/**
 * Collaboration-specific settings for roles
 */



export interface CollaborationRoleSettings {
  max_concurrent_edits: number;         // How many resources can edit simultaneously
  priority_level: 'low' | 'normal' | 'high' | 'critical'; // Conflict resolution priority
  auto_save_enabled: boolean;           // Can use auto-save
  session_duration_minutes: number;     // Max session length





/**
 * Enhanced role interface with collaborative features
 */



export interface CollaborativeRole extends Role {
  collaboration_settings: CollaborationRoleSettings;
  quota_overrides?: Partial<ResourceQuotas>; // Role-specific quota modifications


/**
 * Predefined collaborative system roles
 */

// =============================================================================
// ENHANCED RESOURCE MODEL
// =============================================================================

/**
 * Edit session information for real-time collaboration
 */



export interface EditSession {
  id: string;
  resource_id: string;
  user_id: string;
  workspace_id: string;
  
  session_info: {
    started_at: Date;
    last_activity_at: Date;
    expires_at: Date;
    client_id: string;              // Browser/device identifier
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
    priority_level: number;         // For conflict resolution
    edit_permissions: Permission[];
    can_force_save: boolean;
    auto_save_interval: number;
  };


/**
 * Cursor position for real-time cursor tracking
 */



export interface CursorPosition {
  user_id: string;
  resource_id: string;
  position: {
    node_id?: string;              // For graph editing
    field_path?: string;           // JSON path for structured data
    line?: number;                 // For text content
    column?: number;
    offset?: number;               // Character offset



  };
  timestamp: Date;
  is_typing: boolean;


/**
 * Selection range for collaborative editing
 */



export interface SelectionRange {
  user_id: string;
  resource_id: string;
  start: CursorPosition['position'];
  end: CursorPosition['position'];
  selection_type: 'text' | 'node' | 'component' | 'region';
  timestamp: Date;





/**
 * Conflict marker for version control
 */



export interface ConflictMarker {
  id: string;
  resource_id: string;
  conflict_type: 'content' | 'structure' | 'metadata' | 'cursor' | 'selection';
  location: CursorPosition['position'];
  local_version: unknown;
  remote_version: unknown;
  created_at: Date;
  resolved_at?: Date;
  resolved_by?: string;





/**
 * Pending merge information
 */



export interface PendingMerge {
  id: string;
  from_branch: string;
  to_branch: string;
  requested_by: string;
  requested_at: Date;
  approved_by?: string;
  approved_at?: Date;
  conflicts: ConflictMarker[];
  status: 'pending' | 'approved' | 'rejected' | 'merged';





/**
 * Collaborative state for resources
 */



export interface CollaborativeState {
  is_collaborative: boolean;        // Can be edited collaboratively
  active_editors: string[];         // Currently editing user IDs
  edit_sessions: EditSession[];     // Active editing sessions
  lock_status: 'unlocked' | 'soft_lock' | 'hard_lock';
  locked_by?: string;               // User ID who has the lock
  locked_at?: Date;
  lock_expires_at?: Date;





/**
 * Version control information
 */



export interface VersionControl {
  current_branch: string;           // Default: 'main'
  available_branches: string[];
  last_merge_at?: Date;
  merge_conflicts: ConflictMarker[];
  pending_merges: PendingMerge[];





/**
 * User presence data for resources
 */



export interface PresenceData {
  active_viewers: UserPresence[];   // Users currently viewing
  last_presence_update: Date;
  cursor_positions: CursorPosition[];
  selection_ranges: SelectionRange[];





/**
 * Performance optimization hints
 */



export interface OptimizationHints {
  is_large_resource: boolean;       // > 1MB or complex structure
  requires_chunking: boolean;       // For efficient real-time sync
  cache_strategy: 'aggressive' | 'normal' | 'minimal';
  priority: 'low' | 'normal' | 'high';





/**
 * Enhanced resource interface with collaborative features
 */



export interface CollaborativeResource extends Resource {
  collaborative_state: CollaborativeState;
  version_control: VersionControl;
  presence_data: PresenceData;
  optimization_hints: OptimizationHints;


// =============================================================================
// USER PRESENCE SYSTEM
// =============================================================================

/**
 * User presence status information
 */



export interface PresenceStatus {
  status: 'online' | 'idle' | 'away' | 'do_not_disturb' | 'offline';
  custom_message?: string;
  last_seen_at: Date;
  is_mobile: boolean;





/**
 * Current user context within workspace
 */



export interface UserCurrentContext {
  current_project_id?: string;
  current_resource_id?: string;
  current_view: 'dashboard' | 'project' | 'resource' | 'settings';
  cursor_position?: CursorPosition;
  selection_range?: SelectionRange;





/**
 * User's collaboration state
 */



export interface CollaborationState {
  is_editing: boolean;
  editing_resources: string[];      // Resource IDs currently editing
  can_be_interrupted: boolean;      // For conflict resolution
  collaboration_role: string;       // Current role in this context





/**
 * Session metadata for presence tracking
 */



export interface SessionMetadata {
  session_id: string;
  client_type: 'web' | 'desktop' | 'mobile';
  client_version: string;
  connection_quality: 'excellent' | 'good' | 'fair' | 'poor';
  latency_ms?: number;





/**
 * Complete user presence information
 */



export interface UserPresence {
  user_id: string;
  workspace_id: string;
  
  presence_status: PresenceStatus;
  current_context: UserCurrentContext;
  collaboration_state: CollaborationState;
  session_metadata: SessionMetadata;
  
  timestamp: Date;





// =============================================================================
// WORKSPACE CONTEXT MANAGEMENT
// =============================================================================

/**
 * Navigation state within workspace
 */



export interface NavigationState {
  current_view: 'dashboard' | 'projects' | 'resources' | 'settings' | 'collaboration';
  current_project_id?: string;
  current_resource_id?: string;
  breadcrumb_path: string[];
  recent_projects: string[];        // Recently accessed project IDs
  recent_resources: string[];       // Recently accessed resource IDs





/**
 * Collaboration context for user
 */



export interface CollaborationContext {
  active_sessions: EditSession[];
  visible_users: UserPresence[];
  notification_preferences: NotificationPreferences;
  collaboration_mode: 'individual' | 'paired' | 'team' | 'review';





/**
 * User workspace preferences
 */



export interface WorkspacePreferences {
  default_project_template?: string;
  auto_save_interval: number;
  real_time_updates: boolean;
  cursor_visibility: boolean;
  presence_visibility: boolean;
  conflict_resolution_preference: 'ask' | 'auto_merge' | 'manual';





/**
 * Cache state for performance optimization
 */



export interface CacheState {
  cached_projects: Map<string, Date>;     // Project ID -> Last cached
  cached_resources: Map<string, Date>;    // Resource ID -> Last cached
  cache_size_bytes: number;
  last_cache_cleanup: Date;





/**
 * Complete workspace context for a user
 */



export interface WorkspaceContext {
  workspace_id: string;
  user_id: string;
  
  navigation_state: NavigationState;
  collaboration_context: CollaborationContext;
  workspace_preferences: WorkspacePreferences;
  cache_state: CacheState;
  
  last_updated: Date;
  expires_at: Date;





/**
 * Notification preferences for workspace
 */



export interface NotificationPreferences {
  workspace_id: string;
  user_id: string;
  
  notifications: {
    new_collaborators: boolean;
    edit_conflicts: boolean;
    resource_changes: boolean;
    mentions: boolean;
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


// =============================================================================
// WORKSPACE SWITCHING
// =============================================================================

/**
 * Unsaved changes during workspace switch
 */



export interface UnsavedChange {
  resource_id: string;
  change_type: 'content' | 'metadata' | 'structure';
  change_data: Record<string, any>;
  timestamp: Date;
  auto_save_eligible: boolean;





/**
 * Context preservation during workspace switching
 */



export interface WorkspaceSwitchContext {
  user_id: string;
  from_workspace_id?: string;
  to_workspace_id: string;
  
  // Context preservation
  preserve_state: {
    open_projects: string[];
    open_resources: string[];
    unsaved_changes: UnsavedChange[];
    active_sessions: string[];      // Session IDs to maintain



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


// =============================================================================
// QUOTA MANAGEMENT SYSTEM
// =============================================================================

/**
 * Comprehensive quota tracking
 */



export interface DetailedResourceQuotas {
  workspace_id: string;
  
  // Storage quotas
  max_storage_bytes: number;
  current_storage_bytes: number;
  storage_warning_threshold: number;  // % of max (default: 80)
  
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
  enforce_hard_limits: boolean;       // Block vs warn on quota exceeded
  grace_period_hours: number;         // Allow brief overages
  quota_reset_schedule: 'daily' | 'weekly' | 'monthly';
  
  last_updated: Date;
  next_reset: Date;





/**
 * Quota usage event for tracking
 */



export interface QuotaUsageEvent {
  id: string;
  workspace_id: string;
  user_id: string;
  quota_type: keyof DetailedResourceQuotas;
  usage_delta: number;                // Change in usage
  timestamp: Date;
  context: {
    resource_id?: string;
    project_id?: string;
    session_id?: string;
    operation: string;



  };


// =============================================================================
// TYPE GUARDS AND UTILITIES
// =============================================================================

/**
 * Type guard for enhanced workspace
 */
export function isEnhancedWorkspace(workspace: Workspace | EnhancedWorkspace): workspace is EnhancedWorkspace {
  return 'collaboration_settings' in workspace && 
         'resource_quotas' in workspace && 
         'usage_stats' in workspace;


/**
 * Type guard for collaborative resource
 */
export function isCollaborativeResource(resource: Resource | CollaborativeResource): resource is CollaborativeResource {
  return 'collaborative_state' in resource && 
         'version_control' in resource && 
         'presence_data' in resource;


/**
 * Permission checking utility
 */
export function hasCollaborativePermission(
  userPermissions: number, 
  requiredPermission: number
): boolean {
  return (userPermissions & requiredPermission) === requiredPermission;


/**
 * Create default collaboration settings
 */
export function createDefaultCollaborationSettings(): CollaborationSettings {
  return {
    max_concurrent_editors: 10,
    auto_save_interval: 5000,
    conflict_resolution: 'last_writer_wins',
    real_time_cursors: true,
    allow_anonymous_viewers: false,
    session_timeout: 30
  };


/**
 * Create default resource quotas
 */
export function createDefaultResourceQuotas(): ResourceQuotas {
  return {
    max_projects: 100,
    max_resources_per_project: 1000,
    max_storage_bytes: 1073741824, // 1GB
    max_concurrent_sessions: 25
  };


/**
 * Create empty usage stats
 */
export function createEmptyUsageStats(): UsageStats {
  return {
    current_projects: 0,
    current_resources: 0,
    current_storage_bytes: 0,
    active_sessions: 0,
    last_activity_at: new Date()
  };


// =============================================================================
// CREATION INTERFACES
// =============================================================================

/**
 * Interface for creating enhanced workspaces
 */



export interface CreateEnhancedWorkspace {
  name: string;
  description?: string;
  collaboration_settings?: Partial<CollaborationSettings>;
  resource_quotas?: Partial<ResourceQuotas>;
  settings?: Record<string, any>;





/**
 * Interface for creating collaborative resources
 */



export interface CreateCollaborativeResource {
  name: string;
  type: Resource['type'];
  content_type?: string;
  content_data?: Record<string, any>;
  is_collaborative?: boolean;
  optimization_hints?: Partial<OptimizationHints>;





// =============================================================================
// EXPORT TYPES
// =============================================================================

export type {
  // Enhanced models
  EnhancedWorkspace,
  CollaborativeResource,
  CollaborativeRole,
  
  // Collaboration features
  EditSession,
  UserPresence,
  WorkspaceContext,
  WorkspaceSwitchContext,
  
  // Management systems
  DetailedResourceQuotas,
  QuotaUsageEvent,
  NotificationPreferences,
  
  // State interfaces
  CollaborativeState,
  VersionControl,
  PresenceData,
  OptimizationHints,
  
  // Position tracking
  CursorPosition,
  SelectionRange,
  ConflictMarker,
  PendingMerge
};