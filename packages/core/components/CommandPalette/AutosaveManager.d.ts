/**
 * Professional Autosave System for Graph Editor
 * Phase 2: Critical Professional Features Implementation
 *
 * Cinema 4D-inspired autosave with conflict resolution and recovery
 */
import React from 'react';
import { Node, Edge } from 'reactflow';

}
export interface AutosaveState {
    nodes: Node[];
    edges: Edge[];
    timestamp: number;
    version: number;
    checksum: string;
    metadata: {
        nodeCount: number;
        edgeCount: number;
        lastModified: string;
        sessionId: string;
}
    };

}
export interface AutosaveManagerProps {
    nodes: Node[];
    edges: Edge[];
    interval?: number;
    maxVersions?: number;
    onRestore?: (state: AutosaveState) => void;
    onConflict?: (current: AutosaveState, saved: AutosaveState) => void;
    theme?: 'light' | 'dark' | 'cinema';
    disabled?: boolean;

export declare class AutosaveSystem {
    private sessionId;
    private storageKey;
    private maxVersions;
    private listeners;
    constructor(projectId?: string, maxVersions?: number);
    private generateChecksum;
    save(nodes: Node[], edges: Edge[]): AutosaveState;
    getStoredData(): AutosaveState[];
    getLatest(): AutosaveState | null;
    hasConflict(): boolean;
    restore(version?: number): AutosaveState | null;
    clear(): void;
    private getNextVersion;
    subscribe(callback: (status: AutosaveStatus) => void): () => void;
    private notifyListeners;
    validateChecksum(state: AutosaveState): boolean;

}
export interface AutosaveStatus {
    type: 'saved' | 'restored' | 'cleared' | 'error';
    timestamp?: number;
    version?: number;
    error?: string;

export declare const AutosaveManager: React.FC<AutosaveManagerProps>;
export default AutosaveManager;
//# sourceMappingURL=AutosaveManager.d.ts.map
}