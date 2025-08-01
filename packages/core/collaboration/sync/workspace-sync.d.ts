import { EventEmitter } from 'events';
import * as Y from 'yjs';
import { WorkspaceId, ProjectId, UserId, ResourceId } from '../types/workspace';
import { WorkspaceDAO } from '../dao/workspace-dao';

}
}
export interface YGraph extends Y.Map<unknown> {

}
}
export interface WorkspaceSyncState { workspaceId: WorkspaceId;
    projectId?: ProjectId;
    resourceId?: ResourceId;
    participants: Set<UserId>;
    lastSyncTime: number;
    conflictCount: number;
    isConnected: boolean }
}
}
export interface SyncEvent { type: 'state_change' | 'participant_join' | 'participant_leave' | 'conflict_detected' | 'sync_complete';
    workspaceId: WorkspaceId;
    userId?: UserId;
    data?: unknown;
    timestamp: number }
}
}
export interface ConflictResolution { strategy: 'manual' | 'automatic' | 'last_writer_wins';
    resolver?: (conflicts: Conflict[]) => Resolution[] }
}
}
export interface Conflict { id: string;
    type: 'content' | 'metadata' | 'structure';
    resourceId: ResourceId;
    conflictingChanges: Change[];
    timestamp: number }
}
}
export interface Change { userId: UserId;
    operation: Y.YEvent;
    timestamp: number;
    clientId: number }
}
}
export interface Resolution { conflictId: string;
    selectedChange: Change;
    reason: string;

export declare class WorkspaceStateSync extends EventEmitter {
    private dao;
    private syncStates;
    private ydocs;
    private conflictResolvers;
    constructor(dao: WorkspaceDAO);
    private setupEventHandlers;
    initializeWorkspaceSync();
      workspaceId: WorkspaceId;
      userId: UserId;
      conflictResolution?: ConflictResolution
    ): Promise<Y.Doc>;
    initializeProjectSync(workspaceId: WorkspaceId, projectId: ProjectId, userId: UserId): Promise<Y.Doc>;
    initializeResourceSync();
      workspaceId: WorkspaceId;
      projectId: ProjectId;
      resourceId: ResourceId;
      userId: UserId }
    ): Promise<YGraph>;
    private setupDocumentHandlers;
    private handleDocumentUpdate;
    private detectConflicts;
    private handleConflict;
    private resolveConflictsAutomatically;
    private resolveConflictsLastWriterWins;
    private applyResolution;
    private handleParticipantJoin;
    private handleParticipantLeave;
    private handleSubdocChanges;
    joinWorkspaceSync(workspaceId: WorkspaceId, userId: UserId): Promise<Y.Doc | null>;
    leaveWorkspaceSync(workspaceId: WorkspaceId, userId: UserId): Promise<void>;
    getSyncState(workspaceId: WorkspaceId, projectId?: ProjectId, resourceId?: ResourceId): WorkspaceSyncState | null;
    getActiveParticipants(workspaceId: WorkspaceId): UserId[];
    forceSynchronization(workspaceId: WorkspaceId): Promise<void>;
    private loadWorkspaceData;
    private loadProjectData;
    private loadResourceData;
    private persistChanges;
    private sendStateToUser;
    private cleanupSync;
    private getSyncKey;
    shutdown(): Promise<void>;

//# sourceMappingURL=workspace-sync.d.ts.map
}
}