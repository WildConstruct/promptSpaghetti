import { z } from 'zod';
export declare const WSMessageTypeSchema: z.ZodEnum<["connect", "disconnect", "graph_update", "cursor_update", "presence_update", "user_join", "user_leave", "ping", "pong", "error", "auth_request", "auth_response", "collaboration_create_session", "collaboration_session_created", "collaboration_join_session", "collaboration_session_joined", "collaboration_leave_session", "collaboration_session_left", "collaboration_lock_element", "collaboration_element_locked", "collaboration_unlock_element", "collaboration_element_unlocked", "collaboration_create_snapshot", "collaboration_snapshot_created", "collaboration_restore_snapshot", "collaboration_snapshot_restored", "collaboration_get_session", "collaboration_session_info", "collaboration_get_analytics", "collaboration_analytics", "collaboration_update_settings", "collaboration_settings_updated", "collaboration_end_session", "collaboration_session_ended", "collaboration_user_joined", "collaboration_user_left", "collaboration_conflict_detected", "collaboration_conflict_resolved"]>;
export type WSMessageType = z.infer<typeof WSMessageTypeSchema>;
export declare const WSMessageSchema: z.ZodObject<{
    type: z.ZodEnum<["connect", "disconnect", "graph_update", "cursor_update", "presence_update", "user_join", "user_leave", "ping", "pong", "error", "auth_request", "auth_response", "collaboration_create_session", "collaboration_session_created", "collaboration_join_session", "collaboration_session_joined", "collaboration_leave_session", "collaboration_session_left", "collaboration_lock_element", "collaboration_element_locked", "collaboration_unlock_element", "collaboration_element_unlocked", "collaboration_create_snapshot", "collaboration_snapshot_created", "collaboration_restore_snapshot", "collaboration_snapshot_restored", "collaboration_get_session", "collaboration_session_info", "collaboration_get_analytics", "collaboration_analytics", "collaboration_update_settings", "collaboration_settings_updated", "collaboration_end_session", "collaboration_session_ended", "collaboration_user_joined", "collaboration_user_left", "collaboration_conflict_detected", "collaboration_conflict_resolved"]>;
    payload: z.ZodAny;
    timestamp: z.ZodNumber;
    messageId: z.ZodOptional<z.ZodString>;
    documentId: z.ZodOptional<z.ZodString>;
    userId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "connect" | "error" | "disconnect" | "graph_update" | "cursor_update" | "presence_update" | "user_join" | "user_leave" | "ping" | "pong" | "auth_request" | "auth_response" | "collaboration_create_session" | "collaboration_session_created" | "collaboration_join_session" | "collaboration_session_joined" | "collaboration_leave_session" | "collaboration_session_left" | "collaboration_lock_element" | "collaboration_element_locked" | "collaboration_unlock_element" | "collaboration_element_unlocked" | "collaboration_create_snapshot" | "collaboration_snapshot_created" | "collaboration_restore_snapshot" | "collaboration_snapshot_restored" | "collaboration_get_session" | "collaboration_session_info" | "collaboration_get_analytics" | "collaboration_analytics" | "collaboration_update_settings" | "collaboration_settings_updated" | "collaboration_end_session" | "collaboration_session_ended" | "collaboration_user_joined" | "collaboration_user_left" | "collaboration_conflict_detected" | "collaboration_conflict_resolved";
    timestamp: number;
    userId?: string | undefined;
    payload?: any;
    messageId?: string | undefined;
    documentId?: string | undefined;
}, {
    type: "connect" | "error" | "disconnect" | "graph_update" | "cursor_update" | "presence_update" | "user_join" | "user_leave" | "ping" | "pong" | "auth_request" | "auth_response" | "collaboration_create_session" | "collaboration_session_created" | "collaboration_join_session" | "collaboration_session_joined" | "collaboration_leave_session" | "collaboration_session_left" | "collaboration_lock_element" | "collaboration_element_locked" | "collaboration_unlock_element" | "collaboration_element_unlocked" | "collaboration_create_snapshot" | "collaboration_snapshot_created" | "collaboration_restore_snapshot" | "collaboration_snapshot_restored" | "collaboration_get_session" | "collaboration_session_info" | "collaboration_get_analytics" | "collaboration_analytics" | "collaboration_update_settings" | "collaboration_settings_updated" | "collaboration_end_session" | "collaboration_session_ended" | "collaboration_user_joined" | "collaboration_user_left" | "collaboration_conflict_detected" | "collaboration_conflict_resolved";
    timestamp: number;
    userId?: string | undefined;
    payload?: any;
    messageId?: string | undefined;
    documentId?: string | undefined;
}>;
export type WSMessage = z.infer<typeof WSMessageSchema>;
export declare const GraphUpdatePayloadSchema: z.ZodObject<{
    operations: z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["node_add", "node_remove", "node_update", "edge_add", "edge_remove", "edge_update"]>;
        nodeId: z.ZodOptional<z.ZodString>;
        edgeId: z.ZodOptional<z.ZodString>;
        data: z.ZodAny;
        timestamp: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        type: "node_add" | "node_remove" | "node_update" | "edge_add" | "edge_remove" | "edge_update";
        timestamp: number;
        data?: any;
        nodeId?: string | undefined;
        edgeId?: string | undefined;
    }, {
        type: "node_add" | "node_remove" | "node_update" | "edge_add" | "edge_remove" | "edge_update";
        timestamp: number;
        data?: any;
        nodeId?: string | undefined;
        edgeId?: string | undefined;
    }>, "many">;
    version: z.ZodNumber;
    author: z.ZodString;
}, "strip", z.ZodTypeAny, {
    version: number;
    author: string;
    operations: {
        type: "node_add" | "node_remove" | "node_update" | "edge_add" | "edge_remove" | "edge_update";
        timestamp: number;
        data?: any;
        nodeId?: string | undefined;
        edgeId?: string | undefined;
    }[];
}, {
    version: number;
    author: string;
    operations: {
        type: "node_add" | "node_remove" | "node_update" | "edge_add" | "edge_remove" | "edge_update";
        timestamp: number;
        data?: any;
        nodeId?: string | undefined;
        edgeId?: string | undefined;
    }[];
}>;
export type GraphUpdatePayload = z.infer<typeof GraphUpdatePayloadSchema>;
export declare const PresenceUpdatePayloadSchema: z.ZodObject<{
    userId: z.ZodString;
    userName: z.ZodOptional<z.ZodString>;
    cursor: z.ZodOptional<z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
        nodeId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        y: number;
        x: number;
        nodeId?: string | undefined;
    }, {
        y: number;
        x: number;
        nodeId?: string | undefined;
    }>>;
    selection: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    lastSeen: z.ZodNumber;
    status: z.ZodEnum<["online", "idle", "offline"]>;
}, "strip", z.ZodTypeAny, {
    status: "online" | "idle" | "offline";
    userId: string;
    lastSeen: number;
    cursor?: {
        y: number;
        x: number;
        nodeId?: string | undefined;
    } | undefined;
    userName?: string | undefined;
    selection?: string[] | undefined;
}, {
    status: "online" | "idle" | "offline";
    userId: string;
    lastSeen: number;
    cursor?: {
        y: number;
        x: number;
        nodeId?: string | undefined;
    } | undefined;
    userName?: string | undefined;
    selection?: string[] | undefined;
}>;
export type PresenceUpdatePayload = z.infer<typeof PresenceUpdatePayloadSchema>;
export declare const AuthPayloadSchema: z.ZodObject<{
    token: z.ZodString;
    documentId: z.ZodString;
    permissions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    userName: z.ZodOptional<z.ZodString>;
    userAvatar: z.ZodOptional<z.ZodString>;
    platform: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    documentId: string;
    token: string;
    userName?: string | undefined;
    permissions?: string[] | undefined;
    userAvatar?: string | undefined;
    platform?: string | undefined;
}, {
    documentId: string;
    token: string;
    userName?: string | undefined;
    permissions?: string[] | undefined;
    userAvatar?: string | undefined;
    platform?: string | undefined;
}>;
export type AuthPayload = z.infer<typeof AuthPayloadSchema>;
export declare const CollaborationSessionPayloadSchema: z.ZodObject<{
    documentId: z.ZodString;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    settings: z.ZodOptional<z.ZodObject<{
        enableRealTimeSync: z.ZodOptional<z.ZodBoolean>;
        enableConflictResolution: z.ZodOptional<z.ZodBoolean>;
        enableVersionControl: z.ZodOptional<z.ZodBoolean>;
        enableComments: z.ZodOptional<z.ZodBoolean>;
        enableLocking: z.ZodOptional<z.ZodBoolean>;
        enablePresenceIndicators: z.ZodOptional<z.ZodBoolean>;
        autoSaveInterval: z.ZodOptional<z.ZodNumber>;
        maxParticipants: z.ZodOptional<z.ZodNumber>;
        allowAnonymousUsers: z.ZodOptional<z.ZodBoolean>;
        requireAuthentication: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        enableRealTimeSync?: boolean | undefined;
        enableConflictResolution?: boolean | undefined;
        enableVersionControl?: boolean | undefined;
        enableComments?: boolean | undefined;
        enableLocking?: boolean | undefined;
        enablePresenceIndicators?: boolean | undefined;
        autoSaveInterval?: number | undefined;
        maxParticipants?: number | undefined;
        allowAnonymousUsers?: boolean | undefined;
        requireAuthentication?: boolean | undefined;
    }, {
        enableRealTimeSync?: boolean | undefined;
        enableConflictResolution?: boolean | undefined;
        enableVersionControl?: boolean | undefined;
        enableComments?: boolean | undefined;
        enableLocking?: boolean | undefined;
        enablePresenceIndicators?: boolean | undefined;
        autoSaveInterval?: number | undefined;
        maxParticipants?: number | undefined;
        allowAnonymousUsers?: boolean | undefined;
        requireAuthentication?: boolean | undefined;
    }>>;
    permissions: z.ZodOptional<z.ZodObject<{
        canEdit: z.ZodOptional<z.ZodBoolean>;
        canComment: z.ZodOptional<z.ZodBoolean>;
        canInvite: z.ZodOptional<z.ZodBoolean>;
        canExport: z.ZodOptional<z.ZodBoolean>;
        canModifyPermissions: z.ZodOptional<z.ZodBoolean>;
        canDeleteSession: z.ZodOptional<z.ZodBoolean>;
        canLockElements: z.ZodOptional<z.ZodBoolean>;
        canResolveConflicts: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        canEdit?: boolean | undefined;
        canComment?: boolean | undefined;
        canInvite?: boolean | undefined;
        canExport?: boolean | undefined;
        canModifyPermissions?: boolean | undefined;
        canDeleteSession?: boolean | undefined;
        canLockElements?: boolean | undefined;
        canResolveConflicts?: boolean | undefined;
    }, {
        canEdit?: boolean | undefined;
        canComment?: boolean | undefined;
        canInvite?: boolean | undefined;
        canExport?: boolean | undefined;
        canModifyPermissions?: boolean | undefined;
        canDeleteSession?: boolean | undefined;
        canLockElements?: boolean | undefined;
        canResolveConflicts?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    title: string;
    documentId: string;
    description?: string | undefined;
    settings?: {
        enableRealTimeSync?: boolean | undefined;
        enableConflictResolution?: boolean | undefined;
        enableVersionControl?: boolean | undefined;
        enableComments?: boolean | undefined;
        enableLocking?: boolean | undefined;
        enablePresenceIndicators?: boolean | undefined;
        autoSaveInterval?: number | undefined;
        maxParticipants?: number | undefined;
        allowAnonymousUsers?: boolean | undefined;
        requireAuthentication?: boolean | undefined;
    } | undefined;
    permissions?: {
        canEdit?: boolean | undefined;
        canComment?: boolean | undefined;
        canInvite?: boolean | undefined;
        canExport?: boolean | undefined;
        canModifyPermissions?: boolean | undefined;
        canDeleteSession?: boolean | undefined;
        canLockElements?: boolean | undefined;
        canResolveConflicts?: boolean | undefined;
    } | undefined;
}, {
    title: string;
    documentId: string;
    description?: string | undefined;
    settings?: {
        enableRealTimeSync?: boolean | undefined;
        enableConflictResolution?: boolean | undefined;
        enableVersionControl?: boolean | undefined;
        enableComments?: boolean | undefined;
        enableLocking?: boolean | undefined;
        enablePresenceIndicators?: boolean | undefined;
        autoSaveInterval?: number | undefined;
        maxParticipants?: number | undefined;
        allowAnonymousUsers?: boolean | undefined;
        requireAuthentication?: boolean | undefined;
    } | undefined;
    permissions?: {
        canEdit?: boolean | undefined;
        canComment?: boolean | undefined;
        canInvite?: boolean | undefined;
        canExport?: boolean | undefined;
        canModifyPermissions?: boolean | undefined;
        canDeleteSession?: boolean | undefined;
        canLockElements?: boolean | undefined;
        canResolveConflicts?: boolean | undefined;
    } | undefined;
}>;
export type CollaborationSessionPayload = z.infer<typeof CollaborationSessionPayloadSchema>;
export declare const JoinSessionPayloadSchema: z.ZodObject<{
    sessionId: z.ZodString;
    userName: z.ZodOptional<z.ZodString>;
    userAvatar: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodEnum<["owner", "editor", "viewer", "reviewer"]>>;
}, "strip", z.ZodTypeAny, {
    sessionId: string;
    role?: "owner" | "editor" | "viewer" | "reviewer" | undefined;
    userName?: string | undefined;
    userAvatar?: string | undefined;
}, {
    sessionId: string;
    role?: "owner" | "editor" | "viewer" | "reviewer" | undefined;
    userName?: string | undefined;
    userAvatar?: string | undefined;
}>;
export type JoinSessionPayload = z.infer<typeof JoinSessionPayloadSchema>;
export declare const LockElementPayloadSchema: z.ZodObject<{
    sessionId: z.ZodString;
    targetId: z.ZodString;
    type: z.ZodEnum<["node", "edge", "document", "selection"]>;
    reason: z.ZodOptional<z.ZodString>;
    expiresAt: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type: "document" | "node" | "selection" | "edge";
    sessionId: string;
    targetId: string;
    reason?: string | undefined;
    expiresAt?: number | undefined;
}, {
    type: "document" | "node" | "selection" | "edge";
    sessionId: string;
    targetId: string;
    reason?: string | undefined;
    expiresAt?: number | undefined;
}>;
export type LockElementPayload = z.infer<typeof LockElementPayloadSchema>;
export declare const SnapshotPayloadSchema: z.ZodObject<{
    sessionId: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    name: string;
    sessionId: string;
    description?: string | undefined;
    tags?: string[] | undefined;
}, {
    name: string;
    sessionId: string;
    description?: string | undefined;
    tags?: string[] | undefined;
}>;
export type SnapshotPayload = z.infer<typeof SnapshotPayloadSchema>;
export declare const RestoreSnapshotPayloadSchema: z.ZodObject<{
    sessionId: z.ZodString;
    snapshotId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    sessionId: string;
    snapshotId: string;
}, {
    sessionId: string;
    snapshotId: string;
}>;
export type RestoreSnapshotPayload = z.infer<typeof RestoreSnapshotPayloadSchema>;
export interface ConnectionInfo {
    id: string;
    userId: string;
    documentId: string;
    permissions: string[];
    lastSeen: number;
    authenticated: boolean;
    userAgent?: string;
    ipAddress?: string;
    userName?: string;
    userAvatar?: string;
    collaborationSessionId?: string;
    role?: 'owner' | 'editor' | 'viewer' | 'reviewer';
}
export interface DocumentSession {
    documentId: string;
    connections: Map<string, ConnectionInfo>;
    lastActivity: number;
    version: number;
}
export interface WSServerConfig {
    port: number;
    heartbeatInterval: number;
    connectionTimeout: number;
    maxConnections: number;
    enableAuthentication: boolean;
    jwtSecret?: string;
    corsOrigins: string[];
}
export interface HealthMetrics {
    totalConnections: number;
    activeDocuments: number;
    messagesPerSecond: number;
    uptime: number;
    memoryUsage: number;
    lastUpdated: number;
}
//# sourceMappingURL=types.d.ts.map