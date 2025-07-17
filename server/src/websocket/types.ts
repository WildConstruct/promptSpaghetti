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

export type WSMessageType = z.infer<typeof WSMessageTypeSchema>;

// Base message schema
export const WSMessageSchema = z.object({
  type: WSMessageTypeSchema,
  payload: z.any(),
  timestamp: z.number(),
  messageId: z.string().optional(),
  documentId: z.string().optional(),
  userId: z.string().optional()
});

export type WSMessage = z.infer<typeof WSMessageSchema>;

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

export type GraphUpdatePayload = z.infer<typeof GraphUpdatePayloadSchema>;

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

export type PresenceUpdatePayload = z.infer<typeof PresenceUpdatePayloadSchema>;

// Authentication payload
export const AuthPayloadSchema = z.object({
  token: z.string(),
  documentId: z.string(),
  permissions: z.array(z.string()).optional(),
  userName: z.string().optional(),
  userAvatar: z.string().optional(),
  platform: z.string().optional()
});

export type AuthPayload = z.infer<typeof AuthPayloadSchema>;

// Connection metadata
export interface ConnectionInfo {
  id: string;
  userId: string;
  documentId: string;
  permissions: string[];
  lastSeen: number;
  authenticated: boolean;
  userAgent?: string;
  ipAddress?: string;
}

// Document session info
export interface DocumentSession {
  documentId: string;
  connections: Map<string, ConnectionInfo>;
  lastActivity: number;
  version: number;
}

// WebSocket server configuration
export interface WSServerConfig {
  port: number;
  heartbeatInterval: number;
  connectionTimeout: number;
  maxConnections: number;
  enableAuthentication: boolean;
  jwtSecret?: string;
  corsOrigins: string[];
}

// Health check data
export interface HealthMetrics {
  totalConnections: number;
  activeDocuments: number;
  messagesPerSecond: number;
  uptime: number;
  memoryUsage: number;
  lastUpdated: number;
}