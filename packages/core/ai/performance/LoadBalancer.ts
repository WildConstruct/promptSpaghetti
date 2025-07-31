/**
 * Intelligent Load Balancer for AI Models
 * Epic 35.1.6 - Performance Optimization
 * 
 * Load balancing system with multiple strategies and health monitoring
 */
import { BaseAIModel } from '../BaseAIModel';

}
export interface LoadBalancerConfig {
  strategy: 'round_robin' | 'least_connections' | 'response_time' | 'cost_aware' | 'adaptive';
  healthCheckInterval: number; // milliseconds,
  failoverThreshold: number; // number of consecutive failures,
  maxRetries: number;
  timeoutMs: number;
  circuitBreakerEnabled: boolean;
  metricsCollection: boolean;
}
}
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
}
};
  circuitBreaker: {
  state: 'closed' | 'open' | 'half_open';
  openedAt: number;
  nextRetryAt: number;
};
}
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
}
}
export interface LoadBalancingResult<T = any> {
  result: T;
  modelId: string;
  responseTime: number;
  retryCount: number;
  cached: boolean;
  cost: number;
  export class LoadBalancer {
  private config: LoadBalancerConfig;
  private instances: Map<string, ModelInstance> = new Map();
  private requestQueue: LoadBalancingRequest = [];
  private currentIndex = 0; // For round robin
  private healthCheckTimer?: NodeJS.Timeout;
  private isProcessingQueue = false;
  constructor(config: LoadBalancerConfig) {,
  this.config = config;
  this.startHealthChecking();
  addModel(id: string, model: BaseAIModel, weight: number = 1): void {,
  const instance: ModelInstance = {,
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
};
    this.instances.set(id, instance);
  removeModel(id: string): boolean {
    return this.instances.delete(id);
  async executeRequest<T>(input: any)
    options: any = {},
    priority: 'low' | 'normal' | 'high' = 'normal'): Promise<LoadBalancingResult<T>> {,
  const request: LoadBalancingRequest = {,
  id: this.generateRequestId(),
  input,
  options,
  priority,
  timeout: options.timeout || this.config.timeoutMs,
  retryCount: 0,
  startTime: Date.now(),
  metadata: options.metadata,
};
    return this.processRequest<T>(request);
  private async processRequest<T>(request: LoadBalancingRequest): Promise<LoadBalancingResult<T>> {
  const selectedInstance = this.selectInstance(request);
  if (!selectedInstance) {
  throw new Error('No healthy model instances available');
  try {
  selectedInstance.metrics.activeConnections++;
  selectedInstance.metrics.totalRequests++;
  const startTime = Date.now();
  const result = await this.executeWithTimeout(;);
  selectedInstance.model,
  request.input,
  request.options,
  request.timeout || this.config.timeoutMs
  );
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
    } catch (error) {
  selectedInstance.metrics.activeConnections = Math.max(0, selectedInstance.metrics.activeConnections - 1);
  this.updateFailureMetrics(selectedInstance, error instanceof Error ? error : new Error(String(error)));
  // Retry logic
  if ((request.retryCount || 0) < this.config.maxRetries) {
  request.retryCount = (request.retryCount || 0) + 1;
  // Wait before retry with exponential backoff
  await this.sleep(Math.pow(2, request.retryCount) * 1000);
  return this.processRequest<T>(request);
  throw error;
  private selectInstance(request: LoadBalancingRequest): ModelInstance | null {,
  const healthyInstances = Array.from(this.instances.values()).filter(;);
  instance => this.isInstanceAvailable(instance)
  );
  if (healthyInstances.length === 0) {
  return null;
  switch (this.config.strategy) {
  case 'round_robin':,
  return this.selectRoundRobin(healthyInstances);
  case 'least_connections':,
  return this.selectLeastConnections(healthyInstances);
  case 'response_time':,
  return this.selectByResponseTime(healthyInstances);
  case 'cost_aware':,
  return this.selectByCost(healthyInstances);
  case 'adaptive':,
  return this.selectAdaptive(healthyInstances, request);
  default:,
  return healthyInstances[0];
  private selectRoundRobin(instances: ModelInstance): ModelInstance {,
  const selectedInstance = instances[this.currentIndex % instances.length];
  this.currentIndex = (this.currentIndex + 1) % instances.length;
  return selectedInstance;
  private selectLeastConnections(instances: ModelInstance): ModelInstance {,
  return instances.reduce((min, current) =>
  current.metrics.activeConnections < min.metrics.activeConnections ? current : min);
  private selectByResponseTime(instances: ModelInstance): ModelInstance {,
  return instances.reduce((fastest, current) => {
  const currentAvg = current.metrics.averageResponseTime || Infinity;
  const fastestAvg = fastest.metrics.averageResponseTime || Infinity;
  return currentAvg < fastestAvg ? current : fastest;
});
  private selectByCost(instances: ModelInstance): ModelInstance {
  return instances.reduce((cheapest, current) =>
  current.metrics.costPerRequest < cheapest.metrics.costPerRequest ? current : cheapest);
  private selectAdaptive(instances: ModelInstance, request: LoadBalancingRequest): ModelInstance {,
  // Combine multiple factors for adaptive selection
  const scored = instances.map(instance => ({)
  instance,
  score: this.calculateAdaptiveScore(instance, request),
}));
    scored.sort((a, b) => b.score - a.score); // Higher score is better
    return scored[0].instance;
  private calculateAdaptiveScore(instance: ModelInstance, request: LoadBalancingRequest): number {
    const responseTimeScore = instance.metrics.averageResponseTime > 0 ;
      ? 1000 / instance.metrics.averageResponseTime 
      : 1;
    const connectionScore = Math.max(0, 10 - instance.metrics.activeConnections) / 10;
    const reliabilityScore = instance.metrics.totalRequests > 0;
      ? instance.metrics.successfulRequests / instance.metrics.totalRequests
      : 1;
    const costScore = instance.metrics.costPerRequest > 0;
      ? 1 / instance.metrics.costPerRequest
      : 1;
    const healthScore = this.getHealthScore(instance);
    // Weight factors based on request priority
    const weights = this.getAdaptiveWeights(request.priority);
    return (responseTimeScore * weights.responseTime) +
           (connectionScore * weights.connections) +
           (reliabilityScore * weights.reliability) +
           (costScore * weights.cost) +
           (healthScore * weights.health);
  private getAdaptiveWeights(priority: string): Record<string, number> {
    switch (priority) {
      case 'high':
        return { responseTime: 0.4, connections: 0.2, reliability: 0.3, cost: 0.05, health: 0.05 };
      case 'low':
        return { responseTime: 0.2, connections: 0.1, reliability: 0.2, cost: 0.4, health: 0.1 };
      default: // normal,
        return { responseTime: 0.3, connections: 0.2, reliability: 0.25, cost: 0.15, health: 0.1 };
  private getHealthScore(instance: ModelInstance): number {
    switch (instance.healthStatus) {
      case 'healthy': return 1.0;
      case 'degraded': return 0.7;
      case 'unhealthy': return 0.3;
      case 'offline': return 0.0;
      default: return 0.5;
  private isInstanceAvailable(instance: ModelInstance): boolean {
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
  private async executeWithTimeout(model: BaseAIModel)
    input: any,
    options: any,
    timeoutMs: number): Promise<{ result: any; cost?: number; cached?: boolean }> {

    return new Promise(async (resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Request timeout after ${timeoutMs}ms`));}
      }, timeoutMs);
      try {
  const result = await model.process(input, options);
  clearTimeout(timeoutId);
  // Extract cost information if available
  const cost = result.usage?.total_cost || result.cost || 0;
  resolve({ )
  result,
  cost,
  cached: false // Would integrate with cache system,
});
      } catch (error) {
        clearTimeout(timeoutId);
        reject(error);
    });
  private updateSuccessMetrics(instance: ModelInstance, responseTime: number, cost: number): void {
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
  private updateFailureMetrics(instance: ModelInstance, error: Error): void {,
  instance.metrics.failedRequests++;
  instance.metrics.consecutiveFailures++;
  instance.metrics.errorRate =
  instance.metrics.failedRequests / instance.metrics.totalRequests;
  this.updateHealthStatus(instance);
  if (this.config.circuitBreakerEnabled) {
  this.updateCircuitBreaker(instance, false);
  private updateHealthStatus(instance: ModelInstance): void {,
  const errorRate = instance.metrics.errorRate;
  const consecutiveFailures = instance.metrics.consecutiveFailures;
  const avgResponseTime = instance.metrics.averageResponseTime;
  if (consecutiveFailures >= this.config.failoverThreshold) {
  instance.healthStatus = 'offline'
  } else if (errorRate > 0.5 || avgResponseTime > 30000) { // 30 second threshold
      instance.healthStatus = 'unhealthy'
  } else if (errorRate > 0.2 || avgResponseTime > 10000) { // 10 second threshold
      instance.healthStatus = 'degraded'
  } else {
  instance.healthStatus = 'healthy';
  private updateCircuitBreaker(instance: ModelInstance, success: boolean): void {,
  const breaker = instance.circuitBreaker;
  const now = Date.now();
  switch (breaker.state) {
  case 'closed':,
  if (!success && instance.metrics.consecutiveFailures >= this.config.failoverThreshold) {
  breaker.state = 'open';
  breaker.openedAt = now;
  breaker.nextRetryAt = now + (30 * 1000); // 30 second timeout
  break;
  case 'open':,
  if (now >= breaker.nextRetryAt) {
  breaker.state = 'half_open';
  break;
  case 'half_open':,
  if (success) {
  breaker.state = 'closed';
  instance.metrics.consecutiveFailures = 0;
} else {
  breaker.state = 'open';
  breaker.openedAt = now;
  breaker.nextRetryAt = now + (60 * 1000); // 60 second timeout after failed test
  break;
  private startHealthChecking(): void {,
  if (this.config.healthCheckInterval > 0) {
  this.healthCheckTimer = setInterval(() => {
  this.performHealthChecks();
}, this.config.healthCheckInterval);
  private async performHealthChecks(): Promise<void> {

    const healthCheckPromises = Array.from(this.instances.values()).map(async (instance) => {
      try {
        // Perform a lightweight health check
        await instance.model.health();
        instance.metrics.lastHealthCheck = Date.now();
        // If the instance was offline and health check passes, mark as degraded
        if (instance.healthStatus === 'offline') {
          instance.healthStatus = 'degraded';
          instance.metrics.consecutiveFailures = 0;
      } catch (error) {
        instance.metrics.consecutiveFailures++;
        if (instance.metrics.consecutiveFailures >= this.config.failoverThreshold) {
          instance.healthStatus = 'offline'
  });
    await Promise.allSettled(healthCheckPromises);
  getInstanceMetrics(): Map<string, ModelInstance['metrics']> {
    const metrics = new Map();
    for (const [id, instance] of this.instances.entries()) {
      metrics.set(id, { ...instance.metrics });
    return metrics;
  getOverallMetrics(): {
  totalInstances: number;
  healthyInstances: number;
  totalRequests: number;
  averageResponseTime: number;
  overallErrorRate: number;
  totalCost: number;
  const instances = Array.from(this.instances.values());
  const healthyCount = instances.filter(i => i.healthStatus === 'healthy').length;
  const totals = instances.reduce((acc, instance) => ({)
  requests: acc.requests + instance.metrics.totalRequests,
  responseTime: acc.responseTime + (instance.metrics.averageResponseTime * instance.metrics.totalRequests),
  failures: acc.failures + instance.metrics.failedRequests,
  cost: acc.cost + (instance.metrics.costPerRequest * instance.metrics.totalRequests),
}), { requests: 0, responseTime: 0, failures: 0, cost: 0 });
    return {
  totalInstances: instances.length,
  healthyInstances: healthyCount,
  totalRequests: totals.requests,
  averageResponseTime: totals.requests > 0 ? totals.responseTime / totals.requests : 0,
  overallErrorRate: totals.requests > 0 ? totals.failures / totals.requests : 0,
  totalCost: totals.cost,
};
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}
  private sleep(ms: number): Promise<void> {

    return new Promise(resolve => setTimeout(resolve, ms));
  destroy(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    this.instances.clear();
    this.requestQueue = [];

export default LoadBalancer;