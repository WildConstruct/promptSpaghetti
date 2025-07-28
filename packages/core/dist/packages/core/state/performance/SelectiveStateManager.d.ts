/**
 * Selective State Manager
 * REFACTOR-006: Advanced State Management & Data Flow Architecture
 * Phase 3: Performance-Optimized State
 *
 * Granular state updates with selective component re-rendering
 */
import { EventEmitter } from 'events';
export interface StateSelector<T, R> {
    (state: T): R;
    dependencies?: (keyof T)[];
    memoize?: boolean;
    name?: string;
}
export interface ComponentDependency {
    componentId: string;
    path: string;
    selector?: StateSelector<any, any>;
    lastValue?: any;
    priority: 'low' | 'normal' | 'high' | 'critical';
}
export interface StateUpdateBatch {
    id: string;
    updates: StatePathUpdate;
    priority: 'low' | 'normal' | 'high' | 'critical';
    timestamp: number;
    affectedComponents: Set<string>;
    scheduledTime?: number;
    executed?: boolean;
}
export interface StatePathUpdate {
    path: string;
    value: any;
    operation: 'set' | 'merge' | 'delete' | 'append' | 'remove';
    metadata?: Record<string, any>;
}
export interface StateGraph {
    nodes: Map<string, StateGraphNode>;
    edges: Map<string, StateGraphEdge>;
    rootPaths: Set<string>;
    dependencyMap: Map<string, Set<string>>;
}
export interface StateGraphNode {
    path: string;
    value: any;
    dependencies: Set<string>;
    dependents: Set<string>;
    lastModified: number;
    accessCount: number;
    subscriptions: Set<string>;
}
export interface StateGraphEdge {
    from: string;
    to: string;
    type: 'dependency' | 'derivation' | 'subscription';
    weight: number;
}
export interface PerformanceMetrics {
    updateLatency: number;
    renderCount: number;
    skipCount: number;
    batchCount: number;
    memoryUsage: number;
    cacheHitRate: number;
    selectorExecutionTime: Map<string, number>;
    componentUpdateTime: Map<string, number>;
}
export interface SelectorCache<T> {
    key: string;
    value: T;
    dependencies: any;
    timestamp: number;
    hitCount: number;
    lastAccess: number;
}
export interface UpdateScheduler {
    schedule(batch: StateUpdateBatch): void;
    flush(): Promise<void>;
    clear(): void;
    getQueueSize(): number;
    getScheduledUpdates(): StateUpdateBatch;
}
export declare class SelectiveStateManager extends EventEmitter {
    private stateGraph;
    private componentDependencies;
    private selectorCache;
    private performanceMetrics;
    private scheduler;
    private batchQueue;
    private isProcessing;
    private maxCacheSize;
    private cacheTimeout;
    constructor();
}
//# sourceMappingURL=SelectiveStateManager.d.ts.map