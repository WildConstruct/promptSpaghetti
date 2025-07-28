/**
 * AI Model Manager - Intelligent Loading and Caching System
 * Epic 35.1.1 - Multi-Model Infrastructure
 * 
 * Advanced model lifecycle management with lazy loading, caching, and resource optimization
 */
import { BaseAIModel, AIRequest, AIResponse, AIModelStatus, HealthStatus, CostEstimate } from './BaseAIModel';
import AIModelFactory, { ModelRegistration, FactoryConfig } from './AIModelFactory';

export interface CacheConfig {
  maxSize: number;
  ttl: number; // Time to live in milliseconds
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
  sampleRequests: unknown[];
  timeout: number;
}

export class ModelCache {
  private cache: Map<string, { model: BaseAIModel; lastUsed: Date; accessCount: number }>;
  private config: CacheConfig;
  private evictionTimer?: NodeJS.Timeout;
  constructor(config: CacheConfig) {
    this.cache = new Map();
    this.config = config;
    this._startEvictionTimer();
  }
  get(modelId: string): BaseAIModel | null {
    const entry = this.cache.get(modelId);
    if (entry) {
      entry.lastUsed = new Date();
      entry.accessCount++;
      return entry.model;
    }
    return null;
  }
  set(modelId: string, model: BaseAIModel): void {
    // Check cache size and evict if necessary
    if (this.cache.size >= this.config.maxSize) {
      this._evictModel();
    }
    this.cache.set(modelId, {)
      model,
      lastUsed: new Date(),
      accessCount: 1,
    });
  }
  delete(modelId: string): boolean {
    const entry = this.cache.get(modelId);
    if (entry) {
      // Cleanup model instance
      entry.model.cleanup();
      return this.cache.delete(modelId);
    }
    return false;
  }
  clear(): void {
    // Cleanup all models
    for (const [, entry] of this.cache) {
      entry.model.cleanup();
    }
    this.cache.clear();
  }
  size(): number {
    return this.cache.size;
  }
  getStats(): unknown {
    const stats = {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: 0,
      models: [] as Array<{ id: string; lastUsed: Date; accessCount: number; status: unknown }>
    };
    for (const [modelId, entry] of this.cache) {
      stats.models.push({)
        id: modelId,
        lastUsed: entry.lastUsed,
        accessCount: entry.accessCount,
        status: entry.model.status,
      });
    }
    return stats;
  }
  private _evictModel(): void {
    if (this.cache.size === 0) return;
    let victimKey: string | null = null;
    switch (this.config.evictionPolicy) {
      case 'lru':
        victimKey = this._findLRUVictim();
        break;
      case 'lfu':
        victimKey = this._findLFUVictim();
        break;
      case 'ttl':
        victimKey = this._findTTLVictim();
        break;
      case 'hybrid':
        victimKey = this._findHybridVictim();
        break;
    }
    if (victimKey) {
      this.delete(victimKey);
    }
  }
  private _findLRUVictim(): string | null {
    let oldestTime = Date.now();
    let victim: string | null = null;
    for (const [modelId, entry] of this.cache) {
      if (entry.lastUsed.getTime() < oldestTime) {
        oldestTime = entry.lastUsed.getTime();
        victim = modelId;
      }
    }
    return victim;
  }
  private _findLFUVictim(): string | null {
    let minAccess = Infinity;
    let victim: string | null = null;
    for (const [modelId, entry] of this.cache) {
      if (entry.accessCount < minAccess) {
        minAccess = entry.accessCount;
        victim = modelId;
      }
    }
    return victim;
  }
  private _findTTLVictim(): string | null {
    const now = Date.now();
    for (const [modelId, entry] of this.cache) {
      if (now - entry.lastUsed.getTime() > this.config.ttl) {
        return modelId;
      }
    }
    return this._findLRUVictim(); // Fallback to LRU
  }
  private _findHybridVictim(): string | null {
    const now = Date.now();
    let bestScore = -1;
    let victim: string | null = null;
    for (const [modelId, entry] of this.cache) {
      const timeSinceUse = now - entry.lastUsed.getTime();
      const frequency = entry.accessCount;
      // Hybrid score: prioritize recent and frequent usage
      const score = frequency / (1 + timeSinceUse / this.config.ttl);
      if (score > bestScore) {
        bestScore = score;
        victim = modelId;
      }
    }
    return victim;
  }
  private _startEvictionTimer(): void {
    if (this.evictionTimer) {
      clearInterval(this.evictionTimer);
    }
    // Run cleanup every minute
    this.evictionTimer = setInterval(() => {
      this._cleanupExpiredEntries();
    }, 60000);
  }
  private _cleanupExpiredEntries(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];
    for (const [modelId, entry] of this.cache) {
      if (now - entry.lastUsed.getTime() > this.config.ttl) {
        expiredKeys.push(modelId);
      }
    }
    expiredKeys.forEach(key => this.delete(key));
  }
  destroy(): void {
    if (this.evictionTimer) {
      clearInterval(this.evictionTimer);
    }
    this.clear();
  }
}

export class LoadBalancer {
  private strategy: LoadBalancingConfig['strategy'];
  private models: BaseAIModel[];
  private metrics: Map<string, ModelPerformanceMetrics>;
  private roundRobinIndex: number = 0;
  constructor(strategy: LoadBalancingConfig['strategy']) {
    this.strategy = strategy;
    this.models = [];
    this.metrics = new Map();
  }
  addModel(model: BaseAIModel): void {
    this.models.push(model);
    this.metrics.set(model.id, {)
      modelId: model.id,
      averageLatency: 0,
      throughput: 0,
      errorRate: 0,
      concurrentRequests: 0,
      totalRequests: 0,
      costPerRequest: 0,
      lastUpdated: new Date()
    });
  }
  removeModel(modelId: string): void {
    this.models = this.models.filter(m => m.id !== modelId);
    this.metrics.delete(modelId);
  }
  async selectModel(request: AIRequest): Promise<BaseAIModel | null> {
    const availableModels = this.models.filter(m => m.status === AIModelStatus.READY);
    if (availableModels.length === 0) {
      return null;
    }
    switch (this.strategy) {
      case 'round-robin':
        return this._selectRoundRobin(availableModels);
      case 'least-connections':
        return this._selectLeastConnections(availableModels);
      case 'response-time':
        return this._selectByResponseTime(availableModels);
      case 'cost-aware':
        return this._selectByCost(availableModels, request);
      case 'capability-based':
        return this._selectByCapability(availableModels, request);
      default:
        return availableModels[0];
    }
  }
  updateMetrics(modelId: string, latency: number, cost: number, error?: boolean): void {
    const metrics = this.metrics.get(modelId);
    if (metrics) {
      metrics.totalRequests++;
      metrics.averageLatency = (metrics.averageLatency * (metrics.totalRequests - 1) + latency) / metrics.totalRequests;
      metrics.costPerRequest = (metrics.costPerRequest * (metrics.totalRequests - 1) + cost) / metrics.totalRequests;
      if (error) {
        metrics.errorRate = (metrics.errorRate * (metrics.totalRequests - 1) + 1) / metrics.totalRequests;
      } else {
        metrics.errorRate = (metrics.errorRate * (metrics.totalRequests - 1)) / metrics.totalRequests;
      }
      metrics.lastUpdated = new Date();
    }
  }
  getMetrics(): ModelPerformanceMetrics[] {
    return Array.from(this.metrics.values());
  }
  private _selectRoundRobin(models: BaseAIModel[]): BaseAIModel {
    const model = models[this.roundRobinIndex % models.length];
    this.roundRobinIndex++;
    return model;
  }
  private _selectLeastConnections(models: BaseAIModel[]): BaseAIModel {
    return models.reduce((best, current) => {
      const bestMetrics = this.metrics.get(best.id);
      const currentMetrics = this.metrics.get(current.id);
      const bestConnections = bestMetrics?.concurrentRequests || 0;
      const currentConnections = currentMetrics?.concurrentRequests || 0;
      return currentConnections < bestConnections ? current : best;
    });
  }
  private _selectByResponseTime(models: BaseAIModel[]): BaseAIModel {
    return models.reduce((best, current) => {
      const bestMetrics = this.metrics.get(best.id);
      const currentMetrics = this.metrics.get(current.id);
      const bestLatency = bestMetrics?.averageLatency || Infinity;
      const currentLatency = currentMetrics?.averageLatency || Infinity;
      return currentLatency < bestLatency ? current : best;
    });
  }
  private _selectByCost(models: BaseAIModel[], request: AIRequest): BaseAIModel {
    return models.reduce((best, current) => {
      const bestMetrics = this.metrics.get(best.id);
      const currentMetrics = this.metrics.get(current.id);
      const bestCost = bestMetrics?.costPerRequest || Infinity;
      const currentCost = currentMetrics?.costPerRequest || Infinity;
      return currentCost < bestCost ? current : best;
    });
  }
  private _selectByCapability(models: BaseAIModel[], request: AIRequest): BaseAIModel {
    // Score models based on capability match
    let bestModel = models[0];
    let bestScore = 0;
    for (const model of models) {
      let score = 0;
      // Add scoring logic based on model capabilities vs request requirements
      const capabilities = model.capabilities;
      // Example scoring criteria
      if (capabilities.supportsStreaming && request.options?.stream) {
        score += 10;
      }
      if (capabilities.maxInputSize && request.input) {
        const inputSize = JSON.stringify(request.input).length;
        if (inputSize <= capabilities.maxInputSize) {
          score += 5;
        }
      }
      // Consider error rate
      const metrics = this.metrics.get(model.id);
      if (metrics) {
        score += (1 - metrics.errorRate) * 20;
      }
      if (score > bestScore) {
        bestScore = score;
        bestModel = model;
      }
    }
    return bestModel;
  }
}

export class HealthMonitor {
  private healthChecks: Map<string, HealthStatus> = new Map();
  private checkInterval: number;
  private intervalId?: NodeJS.Timeout;
  constructor(checkInterval: number = 30000) {
    this.checkInterval = checkInterval;
  }
  start(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.intervalId = setInterval(() => {
      this._performHealthChecks();
    }, this.checkInterval);
  }
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }
  addModel(model: BaseAIModel): void {
    this.healthChecks.set(model.id, {)
      status: model.status,
      uptime: 0,
      lastCheck: new Date(),
      issues: [],
    });
  }
  removeModel(modelId: string): void {
    this.healthChecks.delete(modelId);
  }
  getHealth(modelId: string): HealthStatus | null {
    return this.healthChecks.get(modelId) || null;
  }
  getAllHealth(): Map<string, HealthStatus> {
    return new Map(this.healthChecks);
  }
  private async _performHealthChecks(): Promise<void> {
    const checkPromises = Array.from(this.healthChecks.keys()).map(async (modelId) => {
      // In a real implementation, we would get the model instance and call its health method
      // For now, we'll just update the timestamp
      const health = this.healthChecks.get(modelId);
      if (health) {
        health.lastCheck = new Date();
        health.uptime += this.checkInterval;
      }
    });
    await Promise.allSettled(checkPromises);
  }
}

export class ModelManager {
  private factory: AIModelFactory;
  private cache: ModelCache;
  private pools: Map<string, ModelPool> = new Map();
  private loadBalancingConfig: LoadBalancingConfig;
  private warmupStrategy: WarmupStrategy;
  constructor()
    factoryConfig: FactoryConfig = {},
    cacheConfig: CacheConfig = {
      maxSize: 10,
      ttl: 3600000, // 1 hour
      evictionPolicy: 'hybrid',
    },
    loadBalancingConfig: LoadBalancingConfig = {
      strategy: 'capability-based',
      healthCheckInterval: 30000,
      maxConcurrentRequests: 100,
      enableFailover: true,
      failoverThreshold: 0.1,
    },
    warmupStrategy: WarmupStrategy = {
      enabled: true,
      concurrency: 3,
      sampleRequests: [{ role: 'user', content: 'Hello' }],
      timeout: 10000,
    }
  ) {
    this.factory = new AIModelFactory(factoryConfig);
    this.cache = new ModelCache(cacheConfig);
    this.loadBalancingConfig = loadBalancingConfig;
    this.warmupStrategy = warmupStrategy;
  }
  async createModelPool(poolId: string, registrations: ModelRegistration[]): Promise<ModelPool> {
    const models: BaseAIModel[] = [];
    const loadBalancer = new LoadBalancer(this.loadBalancingConfig.strategy);
    const healthMonitor = new HealthMonitor(this.loadBalancingConfig.healthCheckInterval);
    // Register models with factory
    registrations.forEach(reg => this.factory.registerModel(reg));
    // Create model instances
    for (const registration of registrations) {
      try {
        const model = await this.factory.getModel(registration.id);
        if (model) {
          models.push(model);
          loadBalancer.addModel(model);
          healthMonitor.addModel(model);
          this.cache.set(registration.id, model);
        }
      } catch (error) {
        console.warn(`Failed to create model ${registration.id}:`, error);}
      }
    }
    // Warm up models if enabled
    if (this.warmupStrategy.enabled) {
      await this._warmupModels(models);
    }
    const pool: ModelPool = {
      id: poolId,
      models,
      loadBalancer,
      healthMonitor,
      currentLoad: 0,
      lastUsed: new Date()
    };
    this.pools.set(poolId, pool);
    healthMonitor.start();
    return pool;
  }
  async processRequest(poolId: string, request: AIRequest): Promise<AIResponse> {
    const pool = this.pools.get(poolId);
    if (!pool) {
      throw new Error(`Model pool not found: ${poolId}`);}
    }
    // Select best model using load balancer
    const model = await pool.loadBalancer.selectModel(request);
    if (!model) {
      throw new Error('No available models in pool');
    }
    const startTime = Date.now();
    let error = false;
    let cost = 0;
    try {
      // Execute request
      const response = await model.executeRequest(request);
      // Calculate metrics
      const latency = Date.now() - startTime;
      cost = response.metadata?.cost?.estimatedCost || 0;
      // Update load balancer metrics
      pool.loadBalancer.updateMetrics(model.id, latency, cost, false);
      pool.currentLoad++;
      pool.lastUsed = new Date();
      return response;
    } catch (err) {
      error = true;
      const latency = Date.now() - startTime;
      pool.loadBalancer.updateMetrics(model.id, latency, cost, true);
      throw err;
    }
  }
  async estimateRequest(poolId: string, request: AIRequest): Promise<CostEstimate> {
    const pool = this.pools.get(poolId);
    if (!pool) {
      throw new Error(`Model pool not found: ${poolId}`);}
    }
    const model = await pool.loadBalancer.selectModel(request);
    if (!model) {
      throw new Error('No available models in pool');
    }
    return model.estimate(request.input, request.options);
  }
  getPoolStats(poolId: string): unknown {
    const pool = this.pools.get(poolId);
    if (!pool) {
      return null;
    }
    return {
      id: pool.id,
      modelCount: pool.models.length,
      currentLoad: pool.currentLoad,
      lastUsed: pool.lastUsed,
      loadBalancerMetrics: pool.loadBalancer.getMetrics(),
      healthStatus: pool.healthMonitor.getAllHealth(),
    };
  }
  getAllStats(): unknown {
    return {
      totalPools: this.pools.size,
      cacheStats: this.cache.getStats(),
      factoryStats: this.factory.getStatistics(),
      pools: Array.from(this.pools.keys()).map(id => this.getPoolStats(id))
    };
  }
  async destroyPool(poolId: string): Promise<void> {
    const pool = this.pools.get(poolId);
    if (pool) {
      // Stop health monitoring
      pool.healthMonitor.stop();
      // Cleanup models
      for (const model of pool.models) {
        await model.cleanup();
        this.cache.delete(model.id);
      }
      this.pools.delete(poolId);
    }
  }
  async destroy(): Promise<void> {
    // Destroy all pools
    const destroyPromises = Array.from(this.pools.keys()).map(id => this.destroyPool(id));
    await Promise.all(destroyPromises);
    // Cleanup cache and factory
    this.cache.destroy();
    await this.factory.destroyAllModels();
  }
  private async _warmupModels(models: BaseAIModel[]): Promise<void> {
    if (!this.warmupStrategy.enabled || this.warmupStrategy.sampleRequests.length === 0) {
      return;
    }
    const warmupPromises = models.map(async (model) => {
      try {
        for (const sampleInput of this.warmupStrategy.sampleRequests) {
          const request: AIRequest = {
            id: `warmup-${model.id}-${Date.now()}`,}
            input: sampleInput,
            options: { max_tokens: 1 },
            createdAt: new Date()
          };
          await Promise.race([)
            model.executeRequest(request),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Warmup timeout')), this.warmupStrategy.timeout)
            )
          ]);
        }
      } catch (error) {
        console.warn(`Warmup failed for model ${model.id}:`, error);}
      }
    });
    // Process warmups with limited concurrency
    const chunks = [];
    for (let i = 0; i < warmupPromises.length; i += this.warmupStrategy.concurrency) {
      chunks.push(warmupPromises.slice(i, i + this.warmupStrategy.concurrency));
    }
    for (const chunk of chunks) {
      await Promise.allSettled(chunk);
    }
  }
}

export default ModelManager;