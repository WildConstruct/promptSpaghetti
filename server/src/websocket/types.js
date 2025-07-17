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
    'auth_response'
]);
// Base message schema
export const WSMessageSchema = z.object({
    type: WSMessageTypeSchema,
    payload: z.any(),
    timestamp: z.number(),
    messageId: z.string().optional(),
    documentId: z.string().optional(),
    userId: z.string().optional()
});
// Graph update payload
export const GraphUpdatePayloadSchema = z.object({
    operations: z.array(z.object({
        type: z.enum(['node_add', 'node_remove', 'node_update', 'edge_add', 'edge_remove', 'edge_update']),
        nodeId: z.string().optional(),
        edgeId: z.string().optional(),
        data: z.any(),
        timestamp: z.number()
    })),
    version: z.number(),
    author: z.string()
});
// User presence payload
export const PresenceUpdatePayloadSchema = z.object({
    userId: z.string(),
    userName: z.string().optional(),
    cursor: z.object({
        x: z.number(),
        y: z.number(),
        nodeId: z.string().optional()
    }).optional(),
    selection: z.array(z.string()).optional(),
    lastSeen: z.number(),
    status: z.enum(['online', 'idle', 'offline'])
});
// Authentication payload
export const AuthPayloadSchema = z.object({
    token: z.string(),
    documentId: z.string(),
    permissions: z.array(z.string()).optional(),
    userName: z.string().optional(),
    userAvatar: z.string().optional(),
    platform: z.string().optional()
});
