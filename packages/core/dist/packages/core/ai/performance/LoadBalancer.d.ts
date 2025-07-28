/**
 * Intelligent Load Balancer for AI Models
 * Epic 35.1.6 - Performance Optimization
 *
 * Load balancing system with multiple strategies and health monitoring
 */
import { BaseAIModel } from '../BaseAIModel';
export interface LoadBalancerConfig {
    strategy: 'round_robin' | 'least_connections' | 'response_time' | 'cost_aware' | 'adaptive';
    healthCheckInterval: number;
    failoverThreshold: number;
    maxRetries: number;
    timeoutMs: number;
    circuitBreakerEnabled: boolean;
    metricsCollection: boolean;
}
export interface ModelInstance {
    id: string;
    model: BaseAIModel;
    weight: number;
    healthStatus: 'healthy' | 'degraded' | 'unhealthy' | 'offline';
    metrics: {
        activeConnections: number;
        totalRequests: number;
        successfulRequests: number;
        failedRequests: number;
        averageResponseTime: number;
        lastResponseTime: number;
        errorRate: number;
        costPerRequest: number;
        lastHealthCheck: number;
        consecutiveFailures: number;
    };
    circuitBreaker: {
        state: 'closed' | 'open' | 'half_open';
        openedAt: number;
        nextRetryAt: number;
    };
}
export interface LoadBalancingRequest {
    id: string;
    input: any;
    options?: any;
    priority: 'low' | 'normal' | 'high';
    timeout?: number;
    retryCount?: number;
    startTime: number;
    metadata?: Record<string, any>;
}
export interface LoadBalancingResult<T = any> {
    result: T;
    modelId: string;
    responseTime: number;
    retryCount: number;
    cached: boolean;
    cost: number;
}
export declare class LoadBalancer {
    private config;
    private instances;
    private requestQueue;
    private currentIndex;
    private healthCheckTimer?;
    private isProcessingQueue;
    constructor(config: LoadBalancerConfig);
}
//# sourceMappingURL=LoadBalancer.d.ts.map