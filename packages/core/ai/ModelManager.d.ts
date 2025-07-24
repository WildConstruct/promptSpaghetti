/**
 * AI Model Manager - Intelligent Loading and Caching System
 * Epic 35.1.1 - Multi-Model Infrastructure
 *
 * Advanced model lifecycle management with lazy loading, caching, and resource optimization
 */
import { BaseAIModel, AIRequest, AIResponse, HealthStatus, CostEstimate } from './BaseAIModel';
import { ModelRegistration, FactoryConfig } from './AIModelFactory';
export interface CacheConfig {
    maxSize: number;
    ttl: number;
    evictionPolicy: 'lru' | 'lfu' | 'ttl' | 'hybrid';
    enablePersistence?: boolean;
    persistencePath?: string;
}
export interface LoadBalancingConfig {
    strategy: 'round-robin' | 'least-connections' | 'response-time' | 'cost-aware' | 'capability-based';
    healthCheckInterval: number;
    maxConcurrentRequests: number;
    enableFailover: boolean;
    failoverThreshold: number;
}
export interface ModelPool {
    id: string;
    models: BaseAIModel[];
    loadBalancer: LoadBalancer;
    healthMonitor: HealthMonitor;
    currentLoad: number;
    lastUsed: Date;
}
export interface ModelPerformanceMetrics {
    modelId: string;
    averageLatency: number;
    throughput: number;
    errorRate: number;
    concurrentRequests: number;
    totalRequests: number;
    costPerRequest: number;
    lastUpdated: Date;
}
export interface WarmupStrategy {
    enabled: boolean;
    concurrency: number;
    sampleRequests: any[];
    timeout: number;
}
export declare class ModelCache {
    private cache;
    private config;
    private evictionTimer?;
    constructor(config: CacheConfig);
    get(modelId: string): BaseAIModel | null;
    set(modelId: string, model: BaseAIModel): void;
    delete(modelId: string): boolean;
    clear(): void;
    size(): number;
    getStats(): any;
    private _evictModel;
    private _findLRUVictim;
    private _findLFUVictim;
    private _findTTLVictim;
    private _findHybridVictim;
    private _startEvictionTimer;
    private _cleanupExpiredEntries;
    destroy(): void;
}
export declare class LoadBalancer {
    private strategy;
    private models;
    private metrics;
    private roundRobinIndex;
    constructor(strategy: LoadBalancingConfig['strategy']);
    addModel(model: BaseAIModel): void;
    removeModel(modelId: string): void;
    selectModel(request: AIRequest): Promise<BaseAIModel | null>;
    updateMetrics(modelId: string, latency: number, cost: number, error?: boolean): void;
    getMetrics(): ModelPerformanceMetrics[];
    private _selectRoundRobin;
    private _selectLeastConnections;
    private _selectByResponseTime;
    private _selectByCost;
    private _selectByCapability;
}
export declare class HealthMonitor {
    private healthChecks;
    private checkInterval;
    private intervalId?;
    constructor(checkInterval?: number);
    start(): void;
    stop(): void;
    addModel(model: BaseAIModel): void;
    removeModel(modelId: string): void;
    getHealth(modelId: string): HealthStatus | null;
    getAllHealth(): Map<string, HealthStatus>;
    private _performHealthChecks;
}
export declare class ModelManager {
    private factory;
    private cache;
    private pools;
    private loadBalancingConfig;
    private warmupStrategy;
    constructor(factoryConfig?: FactoryConfig, cacheConfig?: CacheConfig, loadBalancingConfig?: LoadBalancingConfig, warmupStrategy?: WarmupStrategy);
    createModelPool(poolId: string, registrations: ModelRegistration[]): Promise<ModelPool>;
    processRequest(poolId: string, request: AIRequest): Promise<AIResponse>;
    estimateRequest(poolId: string, request: AIRequest): Promise<CostEstimate>;
    getPoolStats(poolId: string): any;
    getAllStats(): any;
    destroyPool(poolId: string): Promise<void>;
    destroy(): Promise<void>;
    private _warmupModels;
}
export default ModelManager;
//# sourceMappingURL=ModelManager.d.ts.map