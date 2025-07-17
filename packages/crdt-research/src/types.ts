/**
 * Core types for CRDT research
 */

import { NodeData, Edge } from '@promptgraph/core';

/**
 * Unique identifier for a peer in the collaborative session
 */
export type PeerId = string;

/**
 * Logical timestamp for operation ordering
 */
export interface LogicalTimestamp {
  counter: number;
  peerId: PeerId;
}

/**
 * Base interface for all CRDT operations
 */
export interface CRDTOperation {
  id: string;
  timestamp: LogicalTimestamp | number;
  peerId: PeerId;
  type: string;
}

/**
 * Graph-specific CRDT operations
 */
export interface GraphOperation extends CRDTOperation {
  type: 'node' | 'edge' | 'addNode' | 'removeNode' | 'updateNode' | 'addEdge' | 'removeEdge';
  payload: unknown;
  action?: 'create' | 'update' | 'delete';
  targetId?: string;
  data?: any;
  userId?: string;
}

/**
 * CRDT-enhanced graph structure
 */
export interface CRDTGraph {
  nodes: Map<string, CRDTNode>;
  edges: Map<string, CRDTEdge>;
  tombstones: Set<string>; // Track deleted elements
  version: LogicalTimestamp;
}

/**
 * CRDT-enhanced node with metadata
 */
export interface CRDTNode {
  id: string;
  type: 'WeightedChoice' | 'Concat' | 'Output' | 'SetVariable' | 'GetVariable' | 'Include' | string;
  position: { x: number; y: number };
  data: any;
  metadata: Record<string, any>;
  createdBy?: PeerId;
  createdAt?: LogicalTimestamp;
  lastModified?: LogicalTimestamp;
  deleted?: boolean;
}

/**
 * CRDT-enhanced edge with metadata
 */
export interface CRDTEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  metadata: Record<string, any>;
  createdBy?: PeerId;
  createdAt?: LogicalTimestamp;
  deleted?: boolean;
}

/**
 * Synchronization message between peers
 */
export interface SyncMessage {
  type: 'operation' | 'state' | 'request';
  peerId: PeerId;
  timestamp: LogicalTimestamp;
  payload: unknown;
}

/**
 * Conflict resolution strategy
 */
export type ConflictResolutionStrategy = 
  | 'lastWriteWins'
  | 'multiValue'
  | 'custom';

/**
 * CRDT implementation configuration
 */
export interface CRDTConfig {
  peerId: PeerId;
  conflictResolution: ConflictResolutionStrategy;
  gcInterval?: number; // Garbage collection interval in ms
  maxHistorySize?: number; // Maximum operation history to maintain
}

/**
 * User presence information for awareness
 */
export interface UserPresence {
  userId: string;
  cursor?: {
    nodeId?: string;
    position?: { x: number; y: number };
  };
  selection?: string[];
  color: string;
  name: string;
  timestamp: number;
}

/**
 * Sync state tracking
 */
export interface SyncState {
  documentId: string;
  userId: string;
  lastSync: number;
  pendingOps: number;
}

/**
 * Enhanced sync message with more types
 */
export interface SyncMessage {
  type: 'sync' | 'update' | 'awareness' | 'operation' | 'state' | 'request';
  documentId: string;
  userId: string;
  timestamp: number;
  stateVector?: Uint8Array;
  update?: Uint8Array;
  awareness?: UserPresence;
  peerId?: PeerId;
  payload?: unknown;
}

/**
 * Node operation types
 */
export interface NodeOperation extends GraphOperation {
  type: 'node';
  action: 'create' | 'update' | 'delete';
  targetId: string;
  data?: Partial<CRDTNode>;
}

/**
 * Edge operation types
 */
export interface EdgeOperation extends GraphOperation {
  type: 'edge';
  action: 'create' | 'update' | 'delete';
  targetId: string;
  data?: Partial<CRDTEdge>;
}