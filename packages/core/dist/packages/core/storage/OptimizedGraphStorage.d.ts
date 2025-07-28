/**
 * Optimized Graph Storage System
 * Implements hybrid Map-based storage for O(1) node lookups with React-Flow compatibility
 */
import { Edge, Node } from 'reactflow';
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
    constructor(initialNodes?: Node, initialEdges?: Edge);
}
//# sourceMappingURL=OptimizedGraphStorage.d.ts.map