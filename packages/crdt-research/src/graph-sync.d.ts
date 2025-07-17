import * as Y from 'yjs';
import { YGraph } from './y-graph';
import { SyncState, SyncMessage, UserPresence } from './types';
export declare class GraphSyncHandler {
    private doc;
    private graph;
    private awareness;
    private syncState;
    private onUpdate?;
    private onAwarenessUpdate?;
    constructor(documentId: string, userId: string);
    getGraph(): YGraph;
    getDoc(): Y.Doc;
    applyUpdate(update: Uint8Array, origin?: any): void;
    getStateAsUpdate(): Uint8Array;
    getStateVector(): Uint8Array;
    getDiffUpdate(stateVector: Uint8Array): Uint8Array;
    createSyncMessage(type: 'sync' | 'update' | 'awareness', data?: any): SyncMessage;
    handleSyncMessage(message: SyncMessage): SyncMessage | null;
    updateAwareness(userId: string, presence: UserPresence): void;
    getAwareness(): Map<string, UserPresence>;
    setLocalPresence(presence: Partial<UserPresence>): void;
    onDocumentUpdate(callback: (update: Uint8Array, origin: any) => void): void;
    onAwarenessChange(callback: (awareness: Map<string, UserPresence>) => void): void;
    getSyncState(): SyncState;
    createSnapshot(): Uint8Array;
    restoreFromSnapshot(snapshot: Uint8Array): void;
    getHistory(limit?: number): any[];
    getDocumentSize(): number;
    garbageCollect(): void;
    destroy(): void;
}
//# sourceMappingURL=graph-sync.d.ts.map