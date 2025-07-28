import { Node, Edge } from 'reactflow';
export interface AutosaveState {
    nodes: Node;
    edges: Edge;
    timestamp: number;
    version: number;
    checksum: string;
    metadata: {
        nodeCount: number;
        edgeCount: number;
        lastModified: string;
        sessionId: string;
    };
}
export interface AutosaveManagerProps {
    nodes: Node;
    edges: Edge;
    interval?: number;
    maxVersions?: number;
    onRestore?: (state: AutosaveState) => void;
    onConflict?: (current: AutosaveState, saved: AutosaveState) => void;
    theme?: 'light' | 'dark' | 'cinema';
    disabled?: boolean;
}
export declare class AutosaveSystem {
    private sessionId;
    private storageKey;
    private maxVersions;
    private listeners;
    constructor(projectId?: string, maxVersions?: number);
}
export default AutosaveManager;
//# sourceMappingURL=AutosaveManager.d.ts.map