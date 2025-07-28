/**
 * Resource Optimizer for AI Models
 * Epic 35.1.6 - Performance Optimization
 *
 * Intelligent resource management and optimization for AI model operations
 */
export interface ResourceUsage {
    memory: {
        used: number;
        available: number;
        percentage: number;
        peak: number;
    };
    cpu: {
        usage: number;
        cores: number;
        load: number;
    };
    network: {
        bytesIn: number;
        bytesOut: number;
        latency: number;
        bandwidth: number;
    };
    disk: {
        used: number;
        available: number;
        ioOperations: number;
        throughput: number;
    };
    gpu?: {
        usage: number;
        memory: number;
        temperature: number;
    };
}
export interface OptimizationStrategy {
    name: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    category: 'memory' | 'cpu' | 'network' | 'disk' | 'model' | 'caching';
    estimatedSavings: {
        memory?: number;
        cpu?: number;
        cost?: number;
        responseTime?: number;
    };
    implementation: () => Promise<void>;
    rollback: () => Promise<void>;
}
export interface ResourceOptimizationConfig {
    enabled: boolean;
    monitoringInterval: number;
    optimizationThresholds: {
        memoryUsage: number;
        cpuUsage: number;
        diskUsage: number;
        responseTime: number;
    };
    strategies: {
        memoryOptimization: boolean;
        modelPooling: boolean;
        requestBatching: boolean;
        dynamicScaling: boolean;
        intelligentCaching: boolean;
        resourcePreemption: boolean;
    };
    limits: {
        maxMemoryUsage: number;
        maxConcurrentRequests: number;
        maxModelInstances: number;
        maxCacheSize: number;
    };
}
export interface ModelResourceProfile {
    modelId: string;
    resourceRequirements: {
        memory: number;
        cpu: number;
        gpu?: number;
        disk: number;
    };
    utilizationHistory: Array<{}, timestamp>;
    number: any;
    usage: ResourceUsage;
}
export declare class ResourceOptimizer {
    private config;
    private currentUsage;
    private modelProfiles;
    private activeOptimizations;
    private monitoringTimer?;
    private isRunning;
    private requestQueue;
    private modelPool;
    constructor(config: ResourceOptimizationConfig);
    private evaluateOptimizations;
    private processRequestQueue;
    private getCurrentMemoryUsage;
    private getCurrentCPUUsage;
    private getCurrentNetworkUsage;
    private getCurrentDiskUsage;
    private clearUnusedModelInstances;
    private optimizeCacheSizes;
    private optimizeModelPooling;
    private calculateOptimalPoolSize;
    private enableRequestBatching;
    private optimizeModelLoading;
    private implementDynamicScaling;
    private enableResponseCompression;
    private enableRequestDeduplication;
    private optimizeDataFormats;
    private getModelMetrics;
    private isModelCold;
    private warmUpModel;
    private optimizeModelParameters;
    private enableModelCaching;
    private implementRequestPrioritization;
    private calculateResourceSavings;
    private determineImplementationOrder;
    private measureCurrentState;
    private calculateImpact;
}
//# sourceMappingURL=ResourceOptimizer.d.ts.map