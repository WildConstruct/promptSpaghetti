import { z } from 'zod';
// WebSocket message types
export const WSMessageTypeSchema = z.enum([
  'connect',
  'disconnect',
  'graph_update',
  'cursor_update',
  'presence_update',
  'user_join',
  'user_leave',
  'ping',
  'pong',
  'error',
  'auth_request',
  'auth_response',
  // Enhanced collaboration message types
  'collaboration_create_session',
  'collaboration_session_created',
  'collaboration_join_session',
  'collaboration_session_joined',
  'collaboration_leave_session',
  'collaboration_session_left',
  'collaboration_lock_element',
  'collaboration_element_locked',
  'collaboration_unlock_element',
  'collaboration_element_unlocked',
  'collaboration_create_snapshot',
  'collaboration_snapshot_created',
  'collaboration_restore_snapshot',
  'collaboration_snapshot_restored',
  'collaboration_get_session',
  'collaboration_session_info',
  'collaboration_get_analytics',
  'collaboration_analytics',
  'collaboration_update_settings',
  'collaboration_settings_updated',
  'collaboration_end_session',
  'collaboration_session_ended',
  'collaboration_user_joined',
  'collaboration_user_left',
  'collaboration_conflict_detected',
  'collaboration_conflict_resolved',
]);
// Base message schema
export const WSMessageSchema = z.object({
  type: WSMessageTypeSchema,
  payload: z.any(),
  timestamp: z.number(),
  messageId: z.string().optional(),
  documentId: z.string().optional(),
  userId: z.string().optional(),
});
// Graph update payload
export const GraphUpdatePayloadSchema = z.object({
  operations: z.array(
    z.object({
      type: z.enum(['node_add', 'node_remove', 'node_update', 'edge_add', 'edge_remove', 'edge_update']),
      nodeId: z.string().optional(),
      edgeId: z.string().optional(),
      data: z.any(),
      timestamp: z.number(),
    })
  ),
  version: z.number(),
  author: z.string(),
});
// User presence payload
export const PresenceUpdatePayloadSchema = z.object({
  userId: z.string(),
  userName: z.string().optional(),
  cursor: z
    .object({
      x: z.number(),
      y: z.number(),
      nodeId: z.string().optional(),
    })
    .optional(),
  selection: z.array(z.string()).optional(),
  lastSeen: z.number(),
  status: z.enum(['online', 'idle', 'offline']),
});
// Authentication payload
export const AuthPayloadSchema = z.object({
  token: z.string(),
  documentId: z.string(),
  permissions: z.array(z.string()).optional(),
  userName: z.string().optional(),
  userAvatar: z.string().optional(),
  platform: z.string().optional(),
});
// Enhanced collaboration payloads
export const CollaborationSessionPayloadSchema = z.object({
  documentId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  settings: z
    .object({
      enableRealTimeSync: z.boolean().optional(),
      enableConflictResolution: z.boolean().optional(),
      enableVersionControl: z.boolean().optional(),
      enableComments: z.boolean().optional(),
      enableLocking: z.boolean().optional(),
      enablePresenceIndicators: z.boolean().optional(),
      autoSaveInterval: z.number().optional(),
      maxParticipants: z.number().optional(),
      allowAnonymousUsers: z.boolean().optional(),
      requireAuthentication: z.boolean().optional(),
    })
    .optional(),
  permissions: z
    .object({
      canEdit: z.boolean().optional(),
      canComment: z.boolean().optional(),
      canInvite: z.boolean().optional(),
      canExport: z.boolean().optional(),
      canModifyPermissions: z.boolean().optional(),
      canDeleteSession: z.boolean().optional(),
      canLockElements: z.boolean().optional(),
      canResolveConflicts: z.boolean().optional(),
    })
    .optional(),
});
export const JoinSessionPayloadSchema = z.object({
  sessionId: z.string(),
  userName: z.string().optional(),
  userAvatar: z.string().optional(),
  role: z.enum(['owner', 'editor', 'viewer', 'reviewer']).optional(),
});
export const LockElementPayloadSchema = z.object({
  sessionId: z.string(),
  targetId: z.string(),
  type: z.enum(['node', 'edge', 'document', 'selection']),
  reason: z.string().optional(),
  expiresAt: z.number().optional(),
});
export const SnapshotPayloadSchema = z.object({
  sessionId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
});
export const RestoreSnapshotPayloadSchema = z.object({
  sessionId: z.string(),
  snapshotId: z.string(),
});
