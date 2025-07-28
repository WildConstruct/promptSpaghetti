/**
 * Optimized Graph Storage System
 * Implements hybrid Map-based storage for O(1) node lookups with React-Flow compatibility
 */
import { Edge, Node } from 'reactflow';
import { NodeType } from '../types/NodeTypes';
/**
 * Compressed storage format for large graphs
 */
interface CompressedGraphData {
    format_version: '2.0.0';
    compressed: true;
    node_data: Uint8Array;
    edge_data: Uint8Array;
    metadata: {,
        node_count: number;
        edge_count: number;
        compression_ratio: number;
        original_size: number;
    };
}
/**
 * Optimized graph storage with hybrid Map/Array architecture
 */
export declare class OptimizedGraphStorage {
    private nodeMap;
    private edgeMap;
    private indexes;
    private dirty;
    private version;
    private cachedNodes;
    private cachedEdges;
    private cacheVersion;
    constructor(initialNodes?: Node[], initialEdges?: Edge[]);
    /**
     * Get nodes array (React-Flow compatible) - lazily computed and cached
     */
    get nodes(): Node[];
    /**
     * Get edges array (React-Flow compatible) - lazily computed and cached
     */
    get edges(): Edge[];
    /**
     * O(1) node lookup
     */
    getNode(nodeId: string): Node | undefined;
    /**
     * O(1) edge lookup
     */
    getEdge(edgeId: string): Edge | undefined;
    /**
     * Add node with automatic indexing
     */
    addNode(node: Node): void;
    /**
     * Add edge with automatic indexing
     */
    addEdge(edge: Edge): void;
    /**
     * Update node with partial data
     */
    updateNode(nodeId: string, updates: Partial<Node>): boolean;
    /**
     * Remove node and all connected edges
     */
    removeNode(nodeId: string): boolean;
    /**
     * Remove edge
     */
    removeEdge(edgeId: string): boolean;
    /**
     * Get nodes by type - O(1) lookup
     */
    getNodesByType(type: NodeType): Node[];
    /**
     * Get incoming edges for a node - O(1) lookup
     */
    getIncomingEdges(nodeId: string): Edge[];
    /**
     * Get outgoing edges for a node - O(1) lookup
     */
    getOutgoingEdges(nodeId: string): Edge[];
    /**
     * Get graph statistics
     */
    getStats(): {
        nodeCount: number;
        edgeCount: number;
        nodeTypes: Record<string, number>;
        connectivityStats: {,
            leafNodes: number;
            rootNodes: number;
            isolatedNodes: number;
            averageConnections: number;
        };
        memoryUsage: {,
            estimatedBytes: number;
            cacheHitRatio?: number;
        };
    };
    /**
     * Serialize to compressed format for storage
     */
    toCompressedFormat(): CompressedGraphData | {
        nodes: Node[];
        edges: Edge[];
    };
    /**
     * Load from regular or compressed format
     */
    static fromStorageFormat(data: any): OptimizedGraphStorage;
    /**
     * Load from compressed format
     */
    static fromCompressed(compressed: CompressedGraphData): OptimizedGraphStorage;
    /**
     * Get dirty nodes for incremental saves
     */
    getDirtyNodes(): Node[];
    /**
     * Mark all nodes as clean (after successful save)
     */
    markClean(): void;
    private createEmptyIndexes;
    private loadData;
    private updateNodeIndexes;
    private updateEdgeIndexes;
    private updateConnectivityIndexes;
    private addToSetMap;
    private removeFromSetMap;
    private addToArrayMap;
    private removeFromArrayMap;
    private markDirty;
    private invalidateCache;
    private estimateMemoryUsage;
    private compressNodes;
    private compressEdges;
    private static decompressNodes;
    private static decompressEdges;
}
export {};
//# sourceMappingURL=OptimizedGraphStorage.d.ts.map