import { EventEmitter } from 'events';
import * as Y from 'yjs';
import { WorkspaceId, ProjectId, UserId, ResourceId } from '../types/workspace';
import { WorkspaceDAO } from '../dao/workspace-dao';
export interface YGraph extends Y.Map<unknown> {
}
export interface WorkspaceSyncState {
    workspaceId: WorkspaceId;
    projectId?: ProjectId;
    resourceId?: ResourceId;
    participants: Set<UserId>;
    lastSyncTime: number;
    conflictCount: number;
    isConnected: boolean;
}
export interface SyncEvent {
    type: 'state_change' | 'participant_join' | 'participant_leave' | 'conflict_detected' | 'sync_complete';
    workspaceId: WorkspaceId;
    userId?: UserId;
    data?: unknown;
    timestamp: number;
}
export interface ConflictResolution {
    strategy: 'manual' | 'automatic' | 'last_writer_wins';
    resolver?: (conflicts: Conflict) => Resolution;
}
export interface Conflict {
    id: string;
    type: 'content' | 'metadata' | 'structure';
    resourceId: ResourceId;
    conflictingChanges: Change;
    timestamp: number;
}
export interface Change {
    userId: UserId;
    operation: Y.YEvent;
    timestamp: number;
    clientId: number;
}
export interface Resolution {
    conflictId: string;
    selectedChange: Change;
    reason: string;
}
export declare class WorkspaceStateSync extends EventEmitter {
    private dao;
    private syncStates;
    private ydocs;
    private conflictResolvers;
    constructor(dao: WorkspaceDAO);
    private setupEventHandlers;
}
//# sourceMappingURL=workspace-sync.d.ts.map