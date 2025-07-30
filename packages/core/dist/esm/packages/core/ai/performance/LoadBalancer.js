/**
 * Intelligent Load Balancer for AI Models
 * Epic 35.1.6 - Performance Optimization
 *
 * Load balancing system with multiple strategies and health monitoring
 */
import { BaseAIModel } from '../BaseAIModel';
export class LoadBalancer {
    config;
    instances = new Map();
    requestQueue = [];
    currentIndex = 0; // For round robin
    healthCheckTimer;
    isProcessingQueue = false;
    constructor(config) {
        this.config = config;
        this.startHealthChecking();
        addModel(id, string, model, BaseAIModel, weight, number = 1);
        void {
            const: instance, ModelInstance = {
                id,
                model,
                weight,
                healthStatus: 'healthy',
                metrics: {
                    activeConnections: 0,
                    totalRequests: 0,
                    successfulRequests: 0,
                    failedRequests: 0,
                    averageResponseTime: 0,
                    lastResponseTime: 0,
                    errorRate: 0,
                    costPerRequest: 0,
                    lastHealthCheck: Date.now(),
                    consecutiveFailures: 0,
                },
                circuitBreaker: {
                    state: 'closed',
                    openedAt: 0,
                    nextRetryAt: 0,
                },
                this: .instances.set(id, instance),
                removeModel(id) {
                    return this.instances.delete(id);
                    async;
                    executeRequest(input, any);
                    options: any = {},
                        priority;
                    'low' | 'normal' | 'high';
                    'normal';
                    Promise < LoadBalancingResult < T >> {
                        const: request, LoadBalancingRequest = {
                            id: this.generateRequestId(),
                            input,
                            options,
                            priority,
                            timeout: options.timeout || this.config.timeoutMs,
                            retryCount: 0,
                            startTime: Date.now(),
                            metadata: options.metadata,
                        },
                        return: this.processRequest(request),
                        async processRequest(request) {
                            const selectedInstance = this.selectInstance(request);
                            if (!selectedInstance) {
                                throw new Error('No healthy model instances available');
                                try {
                                    selectedInstance.metrics.activeConnections++;
                                    selectedInstance.metrics.totalRequests++;
                                    const startTime = Date.now();
                                    const result = await this.executeWithTimeout();
                                    ;
                                    selectedInstance.model,
                                        request.input,
                                        request.options,
                                        request.timeout || this.config.timeoutMs;
                                    ;
                                    const responseTime = Date.now() - startTime;
                                    // Update metrics
                                    this.updateSuccessMetrics(selectedInstance, responseTime, result.cost || 0);
                                    return {
                                        result: result.result,
                                        modelId: selectedInstance.id,
                                        responseTime,
                                        retryCount: request.retryCount || 0,
                                        cached: result.cached || false,
                                        cost: result.cost || 0,
                                    };
                                }
                                catch (error) {
                                    selectedInstance.metrics.activeConnections = Math.max(0, selectedInstance.metrics.activeConnections - 1);
                                    this.updateFailureMetrics(selectedInstance, error instanceof Error ? error : new Error(String(error)));
                                    // Retry logic
                                    if ((request.retryCount || 0) < this.config.maxRetries) {
                                        request.retryCount = (request.retryCount || 0) + 1;
                                        // Wait before retry with exponential backoff
                                        await this.sleep(Math.pow(2, request.retryCount) * 1000);
                                        return this.processRequest(request);
                                        throw error;
                                    }
                                }
                            }
                        },
                        selectInstance(request) {
                            const healthyInstances = Array.from(this.instances.values()).filter();
                            ;
                            instance => this.isInstanceAvailable(instance);
                            ;
                            if (healthyInstances.length === 0) {
                                return null;
                                switch (this.config.strategy) {
                                    case 'round_robin':
                                        return this.selectRoundRobin(healthyInstances);
                                    case 'least_connections':
                                        return this.selectLeastConnections(healthyInstances);
                                    case 'response_time':
                                        return this.selectByResponseTime(healthyInstances);
                                    case 'cost_aware':
                                        return this.selectByCost(healthyInstances);
                                    case 'adaptive':
                                        return this.selectAdaptive(healthyInstances, request);
                                    default:
                                        return healthyInstances[0];
                                }
                            }
                        },
                        selectRoundRobin(instances) {
                            const selectedInstance = instances[this.currentIndex % instances.length];
                            this.currentIndex = (this.currentIndex + 1) % instances.length;
                            return selectedInstance;
                        },
                        selectLeastConnections(instances) {
                            return instances.reduce((min, current) => current.metrics.activeConnections < min.metrics.activeConnections ? current : min);
                        },
                        selectByResponseTime(instances) {
                            return instances.reduce((fastest, current) => {
                                const currentAvg = current.metrics.averageResponseTime || Infinity;
                                const fastestAvg = fastest.metrics.averageResponseTime || Infinity;
                                return currentAvg < fastestAvg ? current : fastest;
                            });
                        },
                        selectByCost(instances) {
                            return instances.reduce((cheapest, current) => current.metrics.costPerRequest < cheapest.metrics.costPerRequest ? current : cheapest);
                        },
                        selectAdaptive(instances, request) {
                            // Combine multiple factors for adaptive selection
                            const scored = instances.map(instance => ({}), instance, score, this.calculateAdaptiveScore(instance, request));
                        },
                        scored, : .sort((a, b) => b.score - a.score), // Higher score is better
                        return: scored[0].instance,
                        calculateAdaptiveScore(instance, request) {
                            const responseTimeScore = instance.metrics.averageResponseTime > 0;
                            1000 / instance.metrics.averageResponseTime;
                            1;
                            const connectionScore = Math.max(0, 10 - instance.metrics.activeConnections) / 10;
                            const reliabilityScore = instance.metrics.totalRequests > 0;
                            instance.metrics.successfulRequests / instance.metrics.totalRequests;
                            1;
                            const costScore = instance.metrics.costPerRequest > 0;
                            1 / instance.metrics.costPerRequest;
                            1;
                            const healthScore = this.getHealthScore(instance);
                            // Weight factors based on request priority
                            const weights = this.getAdaptiveWeights(request.priority);
                            return (responseTimeScore * weights.responseTime) +
                                (connectionScore * weights.connections) +
                                (reliabilityScore * weights.reliability) +
                                (costScore * weights.cost) +
                                (healthScore * weights.health);
                        },
                        getAdaptiveWeights(priority) {
                            switch (priority) {
                                case 'high':
                                    return { responseTime: 0.4, connections: 0.2, reliability: 0.3, cost: 0.05, health: 0.05 };
                                case 'low':
                                    return { responseTime: 0.2, connections: 0.1, reliability: 0.2, cost: 0.4, health: 0.1 };
                                default: // normal,
                                    return { responseTime: 0.3, connections: 0.2, reliability: 0.25, cost: 0.15, health: 0.1 };
                            }
                        },
                        getHealthScore(instance) {
                            switch (instance.healthStatus) {
                                case 'healthy': return 1.0;
                                case 'degraded': return 0.7;
                                case 'unhealthy': return 0.3;
                                case 'offline': return 0.0;
                                default: return 0.5;
                            }
                        },
                        isInstanceAvailable(instance) {
                            if (instance.healthStatus === 'offline') {
                                return false;
                                if (!this.config.circuitBreakerEnabled) {
                                    return instance.healthStatus !== 'unhealthy';
                                    // Circuit breaker logic
                                    switch (instance.circuitBreaker.state) {
                                        case 'open':
                                            return Date.now() >= instance.circuitBreaker.nextRetryAt;
                                        case 'half_open':
                                            return instance.metrics.activeConnections === 0; // Only allow one test request
                                        case 'closed':
                                            return true;
                                        default:
                                            return false;
                                    }
                                }
                            }
                        },
                        input: any,
                        options: any,
                        timeoutMs: number, Promise() { result: any; cost ?  : number; cached ?  : boolean; } } > {
                        return: new Promise(async (resolve, reject) => {
                            const timeoutId = setTimeout(() => {
                                reject(new Error(`Request timeout after ${timeoutMs}ms`));
                            });
                        }, timeoutMs),
                        try: {
                            const: result = await model.process(input, options),
                            // Extract cost information if available
                            const: cost = result.usage?.total_cost || result.cost || 0,
                            result,
                            cost,
                            cached: false // Would integrate with cache system,
                        }
                    };
                    try { }
                    catch (error) {
                        clearTimeout(timeoutId);
                        reject(error);
                    }
                    ;
                },
                updateSuccessMetrics(instance, responseTime, cost) {
                    instance.metrics.activeConnections = Math.max(0, instance.metrics.activeConnections - 1);
                    instance.metrics.successfulRequests++;
                    instance.metrics.lastResponseTime = responseTime;
                    instance.metrics.consecutiveFailures = 0;
                    // Update average response time
                    const totalSuccessful = instance.metrics.successfulRequests;
                    instance.metrics.averageResponseTime =
                        ((instance.metrics.averageResponseTime * (totalSuccessful - 1)) + responseTime) / totalSuccessful;
                    // Update cost per request
                    if (cost > 0) {
                        const totalRequests = instance.metrics.totalRequests;
                        instance.metrics.costPerRequest =
                            ((instance.metrics.costPerRequest * (totalRequests - 1)) + cost) / totalRequests;
                        // Update error rate
                        instance.metrics.errorRate =
                            instance.metrics.failedRequests / instance.metrics.totalRequests;
                        // Update health status based on performance
                        this.updateHealthStatus(instance);
                        // Update circuit breaker
                        if (this.config.circuitBreakerEnabled) {
                            this.updateCircuitBreaker(instance, true);
                        }
                    }
                },
                updateFailureMetrics(instance, error) {
                    instance.metrics.failedRequests++;
                    instance.metrics.consecutiveFailures++;
                    instance.metrics.errorRate =
                        instance.metrics.failedRequests / instance.metrics.totalRequests;
                    this.updateHealthStatus(instance);
                    if (this.config.circuitBreakerEnabled) {
                        this.updateCircuitBreaker(instance, false);
                    }
                },
                updateHealthStatus(instance) {
                    const errorRate = instance.metrics.errorRate;
                    const consecutiveFailures = instance.metrics.consecutiveFailures;
                    const avgResponseTime = instance.metrics.averageResponseTime;
                    if (consecutiveFailures >= this.config.failoverThreshold) {
                        instance.healthStatus = 'offline';
                    }
                    else if (errorRate > 0.5 || avgResponseTime > 30000) { // 30 second threshold
                        instance.healthStatus = 'unhealthy';
                    }
                    else if (errorRate > 0.2 || avgResponseTime > 10000) { // 10 second threshold
                        instance.healthStatus = 'degraded';
                    }
                    else {
                        instance.healthStatus = 'healthy';
                    }
                },
                updateCircuitBreaker(instance, success) {
                    const breaker = instance.circuitBreaker;
                    const now = Date.now();
                    switch (breaker.state) {
                        case 'closed':
                            if (!success && instance.metrics.consecutiveFailures >= this.config.failoverThreshold) {
                                breaker.state = 'open';
                                breaker.openedAt = now;
                                breaker.nextRetryAt = now + (30 * 1000); // 30 second timeout
                                break;
                            }
                        case 'open':
                            if (now >= breaker.nextRetryAt) {
                                breaker.state = 'half_open';
                                break;
                            }
                        case 'half_open':
                            if (success) {
                                breaker.state = 'closed';
                                instance.metrics.consecutiveFailures = 0;
                            }
                            else {
                                breaker.state = 'open';
                                breaker.openedAt = now;
                                breaker.nextRetryAt = now + (60 * 1000); // 60 second timeout after failed test
                                break;
                            }
                    }
                },
                startHealthChecking() {
                    if (this.config.healthCheckInterval > 0) {
                        this.healthCheckTimer = setInterval(() => {
                            this.performHealthChecks();
                        }, this.config.healthCheckInterval);
                    }
                },
                async performHealthChecks() {
                    const healthCheckPromises = Array.from(this.instances.values()).map(async (instance) => {
                        try {
                            // Perform a lightweight health check
                            await instance.model.health();
                            instance.metrics.lastHealthCheck = Date.now();
                            // If the instance was offline and health check passes, mark as degraded
                            if (instance.healthStatus === 'offline') {
                                instance.healthStatus = 'degraded';
                                instance.metrics.consecutiveFailures = 0;
                            }
                            try { }
                            catch (error) {
                                instance.metrics.consecutiveFailures++;
                                if (instance.metrics.consecutiveFailures >= this.config.failoverThreshold) {
                                    instance.healthStatus = 'offline';
                                }
                            }
                        }
                        finally { }
                    });
                    await Promise.allSettled(healthCheckPromises);
                    getInstanceMetrics();
                    Map < string, ModelInstance['metrics'] > {
                        const: metrics = new Map(),
                        : .instances.entries()
                    };
                    {
                        metrics.set(id, { ...instance.metrics });
                        return metrics;
                        getOverallMetrics();
                        {
                            totalInstances: number;
                            healthyInstances: number;
                            totalRequests: number;
                            averageResponseTime: number;
                            overallErrorRate: number;
                            totalCost: number;
                            const instances = Array.from(this.instances.values());
                            const healthyCount = instances.filter(i => i.healthStatus === 'healthy').length;
                            const totals = instances.reduce((acc, instance) => ({}), requests, acc.requests + instance.metrics.totalRequests, responseTime, acc.responseTime + (instance.metrics.averageResponseTime * instance.metrics.totalRequests), failures, acc.failures + instance.metrics.failedRequests, cost, acc.cost + (instance.metrics.costPerRequest * instance.metrics.totalRequests));
                        }
                        {
                            requests: 0, responseTime;
                            0, failures;
                            0, cost;
                            0;
                        }
                        ;
                        return {
                            totalInstances: instances.length,
                            healthyInstances: healthyCount,
                            totalRequests: totals.requests,
                            averageResponseTime: totals.requests > 0 ? totals.responseTime / totals.requests : 0,
                            overallErrorRate: totals.requests > 0 ? totals.failures / totals.requests : 0,
                            totalCost: totals.cost,
                        };
                    }
                },
                generateRequestId() {
                    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                },
                sleep(ms) {
                    return new Promise(resolve => setTimeout(resolve, ms));
                    destroy();
                    void {
                        : .healthCheckTimer
                    };
                    {
                        clearInterval(this.healthCheckTimer);
                        this.instances.clear();
                        this.requestQueue = [];
                        export default LoadBalancer;
                    }
                } } };
    }
}
