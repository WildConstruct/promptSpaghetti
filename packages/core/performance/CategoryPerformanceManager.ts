/**
 * Category Performance Manager
 * Epic 17 - Implement Category Performance (E17-1753114397436-B9E25A)
 * 
 * Advanced performance optimization system categorized by node types and operation patterns
 */
import { EventEmitter } from 'events';
import { PerformanceMonitor, PerformanceMetrics } from '../monitoring';

export interface CategoryPerformanceConfig {
  enableCategoryOptimization: boolean;,
  enableDynamicThresholds: boolean;
  enablePredictiveScaling: boolean;,
  categories: Record<string, CategoryConfig>;
  globalSettings: {,
  maxConcurrentOperations: number;,
  memoryThreshold: number;
  cpuThreshold: number;,
  responseTimeTarget: number;
};
}
export interface CategoryConfig {
  name: string;,
  priority: 'low' | 'medium' | 'high' | 'critical';
  optimizationStrategy: 'throughput' | 'latency' | 'memory' | 'balanced';,
  resourceLimits: {,
  maxMemoryMB: number;,
  maxExecutionTimeMs: number;
  maxConcurrentNodes: number;,
  queueLimit: number;
};
  cacheStrategy: {,
  enabled: boolean;
  ttlMs: number;,
  maxSize: number;
  evictionPolicy: 'lru' | 'lfu' | 'ttl';
};
  scalingRules: {,
  scaleUpThreshold: number;
  scaleDownThreshold: number;,
  cooldownMs: number;
  maxInstances: number;
};
}
export interface CategoryMetrics {
  categoryName: string;,
  totalNodes: number;
  activeNodes: number;,
  queuedNodes: number;
  // Performance Metrics
  averageExecutionTime: number;,
  p95ExecutionTime: number;
  throughput: number; // operations per second,
  errorRate: number;
  // Resource Utilization
  memoryUsage: number;,
  cpuUsage: number;
  cacheHitRate: number;
  // Optimization Status
  optimizationLevel: number; // 0-100,
  bottlenecks: string;,
  recommendations: string;
  lastUpdated: number;
}
export interface OptimizationAction {
  id: string;,
  category: string;
  action: 'scale_up' | 'scale_down' | 'cache_optimize' | 'throttle' | 'priority_boost';,
  reason: string;
  parameters: Record<string, any>;
  expectedImpact: {,
  performanceGain: number; // percentage,
  resourceCost: number; // percentage,
  confidence: number; // 0-1,
};
  timestamp: number;,
  applied: boolean;
/**
 * Category-based performance optimization manager
 */
}
export class CategoryPerformanceManager extends EventEmitter {
  private config: CategoryPerformanceConfig;
  private performanceMonitor: PerformanceMonitor;
  private categoryMetrics: Map<string, CategoryMetrics> = new Map();
  private nodeQueues: Map<string, Array<{ nodeId: string; priority: number; timestamp: number }>> = new Map();
  private executionPools: Map<string, Set<string>> = new Map();
  private optimizationActions: Map<string, OptimizationAction> = new Map();
  private caches: Map<string, Map<string, any>> = new Map();
  private metricsUpdateInterval?: NodeJS.Timeout;
  constructor(performanceMonitor: PerformanceMonitor, config: Partial<CategoryPerformanceConfig> = {}) {
  super();
  this.performanceMonitor = performanceMonitor;
  this.config = {
  enableCategoryOptimization: true,
  enableDynamicThresholds: true,
  enablePredictiveScaling: true,
  categories: this.getDefaultCategoryConfigs(),
  globalSettings: {,
  maxConcurrentOperations: 100,
  memoryThreshold: 1024 * 1024 * 1024, // 1GB,
  cpuThreshold: 80, // 80%,
  responseTimeTarget: 100 // ms,
}
      ...config
    };
    this.initialize();
  /**
   * Initialize category performance management
   */
  private initialize(): void {
    // Initialize categories
    Object.keys(this.config.categories).forEach(categoryName => {)
  this.categoryMetrics.set(categoryName, this.createEmptyMetrics(categoryName));
      this.nodeQueues.set(categoryName, []);
      this.executionPools.set(categoryName, new Set());
      this.caches.set(categoryName, new Map());
    });
    // Set up performance monitoring integration
    this.performanceMonitor.on('execution_completed', (data) => {
      this.handleExecutionCompleted(data);
    });
    this.performanceMonitor.on('execution_started', (data) => {
      this.handleExecutionStarted(data);
    });
    // Start metrics update loop
    if (this.config.enableCategoryOptimization) {
      this.metricsUpdateInterval = setInterval(() => {
        this.updateMetrics();
        this.optimizeCategories();
      }, 5000); // Update every 5 seconds
    this.emit('manager_initialized', {)
  categories: Object.keys(this.config.categories),
  globalSettings: this.config.globalSettings,
});
  /**
   * Register a node execution request with category-aware queuing
   */
  async registerExecution(nodeId: string, nodeType: string, priority: number = 0): Promise<string> {
    const category = this.getCategoryForNodeType(nodeType);
    const categoryConfig = this.config.categories[category];
    if (!categoryConfig) {
      throw new Error(`Unknown category: ${category} for node type: ${nodeType}`);}
    // Check if category can handle more executions
    const canExecute = await this.canExecuteInCategory(category);
    if (canExecute) {
      return this.executeImmediate(nodeId, nodeType, category);
    } else {
      return this.queueExecution(nodeId, nodeType, category, priority);
  /**
   * Get performance metrics for a specific category
   */
  getCategoryMetrics(categoryName: string): CategoryMetrics | null {
    return this.categoryMetrics.get(categoryName) || null;
  /**
   * Get all category metrics
   */
  getAllCategoryMetrics(): Record<string, CategoryMetrics> {
    const metrics: Record<string, CategoryMetrics> = {};
    for (const [category, categoryMetrics] of this.categoryMetrics) {
      metrics[category] = { ...categoryMetrics };
    return metrics;
  /**
   * Get optimization recommendations for all categories
   */
  getOptimizationRecommendations(): Array<{
  category: string;,
  recommendations: string;
  priority: 'low' | 'medium' | 'high' | 'critical';,
  estimatedImpact: number;
}> {
  const recommendations: Array<{,
  category: string;,
  recommendations: string;
  priority: 'low' | 'medium' | 'high' | 'critical';,
  estimatedImpact: number;
}> = [];
    for (const [category, metrics] of this.categoryMetrics) {
  const categoryConfig = this.config.categories[category];
  const recs = this.generateRecommendations(metrics, categoryConfig);
  if (recs.length > 0) {
  recommendations.push({)
  category,
  recommendations: recs,
  priority: this.calculateRecommendationPriority(metrics),
  estimatedImpact: this.estimateOptimizationImpact(metrics, categoryConfig),
});
    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  /**
   * Apply optimization action to a category
   */
  async applyOptimization(actionId: string): Promise<boolean> {
    const action = this.optimizationActions.get(actionId);
    if (!action) {
      throw new Error(`Optimization action not found: ${actionId}`);}
    try {
  const success = await this.executeOptimizationAction(action);
  if (success) {
  action.applied = true;
  this.emit('optimization_applied', {)
  actionId,
  category: action.category,
  action: action.action,
  expectedImpact: action.expectedImpact,
});
      return success;
    } catch (error) {
  this.emit('optimization_failed', {)
  actionId,
  category: action.category,
  error: error instanceof Error ? error.message : 'Unknown error',
});
      return false;
  /**
   * Get cache statistics for all categories
   */
  getCacheStatistics(): Record<string, {
  size: number;,
  maxSize: number;
  hitRate: number;,
  evictions: number;
}> {
  const stats: Record<string, {,
  size: number;,
  maxSize: number;
  hitRate: number;,
  evictions: number;
}> = {};
    for (const [category, cache] of this.caches) {
  const categoryConfig = this.config.categories[category];
  stats[category] = {
  size: cache.size,
  maxSize: categoryConfig.cacheStrategy.maxSize,
  hitRate: this.categoryMetrics.get(category)?.cacheHitRate || 0,
  evictions: 0 // Would need to track this,
};
    return stats;
  /**
   * Force optimization for a specific category
   */
  async forceOptimization(category: string): Promise<OptimizationAction> {
    const metrics = this.categoryMetrics.get(category);
    if (!metrics) {
      throw new Error(`Category not found: ${category}`);}
    return this.generateOptimizationActions(category, metrics);
  /**
   * Shutdown the performance manager
   */
  shutdown(): void {
  if (this.metricsUpdateInterval) {
  clearInterval(this.metricsUpdateInterval);
  // Clear all queues and caches
  this.nodeQueues.clear();
  this.executionPools.clear();
  this.caches.clear();
  this.optimizationActions.clear();
  this.emit('manager_shutdown');
  // Private helper methods
  private getDefaultCategoryConfigs(): Record<string, CategoryConfig> {,
  return {
  'basic': {,
  name: 'Basic Operations',
  priority: 'medium',
  optimizationStrategy: 'throughput',
  resourceLimits: {,
  maxMemoryMB: 100,
  maxExecutionTimeMs: 1000,
  maxConcurrentNodes: 50,
  queueLimit: 1000,
},
  cacheStrategy: {,
  enabled: true,
  ttlMs: 300000, // 5 minutes,
  maxSize: 1000,
  evictionPolicy: 'lru',
},
  scalingRules: {,
  scaleUpThreshold: 70,
  scaleDownThreshold: 30,
  cooldownMs: 30000,
  maxInstances: 10,
}
      'advanced': {
  name: 'Advanced Operations',
  priority: 'high',
  optimizationStrategy: 'balanced',
  resourceLimits: {,
  maxMemoryMB: 500,
  maxExecutionTimeMs: 5000,
  maxConcurrentNodes: 20,
  queueLimit: 200,
},
  cacheStrategy: {,
  enabled: true,
  ttlMs: 600000, // 10 minutes,
  maxSize: 500,
  evictionPolicy: 'lfu',
},
  scalingRules: {,
  scaleUpThreshold: 60,
  scaleDownThreshold: 20,
  cooldownMs: 60000,
  maxInstances: 5,
}
      'utility': {
  name: 'Utility Operations',
  priority: 'low',
  optimizationStrategy: 'memory',
  resourceLimits: {,
  maxMemoryMB: 50,
  maxExecutionTimeMs: 2000,
  maxConcurrentNodes: 100,
  queueLimit: 2000,
},
  cacheStrategy: {,
  enabled: true,
  ttlMs: 900000, // 15 minutes,
  maxSize: 2000,
  evictionPolicy: 'ttl',
},
  scalingRules: {,
  scaleUpThreshold: 80,
  scaleDownThreshold: 40,
  cooldownMs: 120000,
  maxInstances: 20,
}
      'integration': {
  name: 'Integration Operations',
  priority: 'critical',
  optimizationStrategy: 'latency',
  resourceLimits: {,
  maxMemoryMB: 200,
  maxExecutionTimeMs: 3000,
  maxConcurrentNodes: 10,
  queueLimit: 50,
},
  cacheStrategy: {,
  enabled: false, // Integration operations should not be cached,
  ttlMs: 0,
  maxSize: 0,
  evictionPolicy: 'lru',
},
  scalingRules: {,
  scaleUpThreshold: 50,
  scaleDownThreshold: 10,
  cooldownMs: 15000,
  maxInstances: 3,
};
  private getCategoryForNodeType(nodeType: string): string {
  // Categorization logic based on node type
  const categoryMappings: Record<string, string> = {,
  'WeightedChoice': 'basic',
  'Concat': 'basic',
  'Output': 'basic',
  'GetVariable': 'basic',
  'SetVariable': 'basic',
  'WeightedAdvanced': 'advanced',
  'Conditional': 'advanced',
  'Sequential': 'advanced',
  'Markov': 'advanced',
  'Include': 'utility',
  'Template': 'utility',
  'Debug': 'utility',
  'Comment': 'utility',
  'APICall': 'integration',
  'Database': 'integration',
  'WebHook': 'integration',
  'External': 'integration',
};
    return categoryMappings[nodeType] || 'basic';
  private createEmptyMetrics(categoryName: string): CategoryMetrics {
  return {
  categoryName,
  totalNodes: 0,
  activeNodes: 0,
  queuedNodes: 0,
  averageExecutionTime: 0,
  p95ExecutionTime: 0,
  throughput: 0,
  errorRate: 0,
  memoryUsage: 0,
  cpuUsage: 0,
  cacheHitRate: 0,
  optimizationLevel: 50, // Default neutral level,
  bottlenecks: [],
  recommendations: [],
  lastUpdated: Date.now(),
};
  private async canExecuteInCategory(category: string): Promise<boolean> {
    const categoryConfig = this.config.categories[category];
    const executionPool = this.executionPools.get(category);
    if (!categoryConfig || !executionPool) {
      return false;
    // Check concurrent execution limits
    if (executionPool.size >= categoryConfig.resourceLimits.maxConcurrentNodes) {
      return false;
    // Check global resource limits
    const totalActiveNodes = Array.from(this.executionPools.values());
      .reduce((total, pool) => total + pool.size, 0);
    if (totalActiveNodes >= this.config.globalSettings.maxConcurrentOperations) {
      return false;
    return true;
  private async executeImmediate(nodeId: string, nodeType: string, category: string): Promise<string> {
    const executionPool = this.executionPools.get(category);
    if (!executionPool) {
      throw new Error(`Category not found: ${category}`);}
    const executionId = `${category}-${nodeId}-${Date.now()}`;}
    executionPool.add(nodeId);
    this.emit('execution_started_immediate', {)
  executionId,
      nodeId,
      nodeType,
      category
    });
    return executionId;
  private queueExecution(nodeId: string, nodeType: string, category: string, priority: number): string {
    const queue = this.nodeQueues.get(category);
    if (!queue) {
      throw new Error(`Category not found: ${category}`);}
    const categoryConfig = this.config.categories[category];
    if (queue.length >= categoryConfig.resourceLimits.queueLimit) {
      throw new Error(`Queue limit exceeded for category: ${category}`);}
    const queueItem = {
  nodeId,
  priority,
  timestamp: Date.now(),
};
    // Insert based on priority (higher priority first)
    const insertIndex = queue.findIndex(item => item.priority < priority);
    if (insertIndex === -1) {
      queue.push(queueItem);
    } else {
      queue.splice(insertIndex, 0, queueItem);
    const executionId = `queued-${category}-${nodeId}-${Date.now()}`;}
    this.emit('execution_queued', {)
  executionId,
  nodeId,
  nodeType,
  category,
  queuePosition: insertIndex === -1 ? queue.length - 1 : insertIndex,
});
    return executionId;
  private handleExecutionStarted(data: any): void {
  // Update metrics when execution starts
  const category = this.getCategoryForNodeType(data.nodeType);
  const metrics = this.categoryMetrics.get(category);
  if (metrics) {
  metrics.activeNodes++;
  metrics.totalNodes++;
  private handleExecutionCompleted(data: any): void {,
  const category = this.getCategoryForNodeType(data.nodeType || 'Unknown');
  const metrics = this.categoryMetrics.get(category);
  const executionPool = this.executionPools.get(category);
  if (metrics && executionPool) {
  metrics.activeNodes = Math.max(0, metrics.activeNodes - 1);
  executionPool.delete(data.nodeId);
  // Update performance metrics
  if (data.metrics) {
  this.updateCategoryMetrics(category, data.metrics);
  // Process queue if there's capacity
  this.processQueue(category);
  private updateCategoryMetrics(category: string, performanceMetrics: PerformanceMetrics): void {,
  const metrics = this.categoryMetrics.get(category);
  if (!metrics) return;
  // Update timing metrics
  const alpha = 0.1; // Exponential moving average factor;
  metrics.averageExecutionTime = metrics.averageExecutionTime * (1 - alpha) +
  performanceMetrics.duration * alpha;
  // Update error rate
  if (performanceMetrics.errors.length > 0) {
  metrics.errorRate = metrics.errorRate * 0.9 + 0.1; // Increase error rate
} else {
  metrics.errorRate = metrics.errorRate * 0.95; // Slowly decrease error rate
  // Update cache hit rate (if applicable)
  if (performanceMetrics.cacheHit) {
  metrics.cacheHitRate = metrics.cacheHitRate * 0.9 + 0.1;
  metrics.lastUpdated = Date.now();
  private processQueue(category: string): void {,
  const queue = this.nodeQueues.get(category);
  const executionPool = this.executionPools.get(category);
  const categoryConfig = this.config.categories[category];
  if (!queue || !executionPool || !categoryConfig || queue.length === 0) {
  return;
  // Check if we can process more items
  const canProcess = executionPool.size < categoryConfig.resourceLimits.maxConcurrentNodes;
  if (canProcess) {
  const queueItem = queue.shift();
  if (queueItem) {
  // Move from queue to execution
  executionPool.add(queueItem.nodeId);
  this.emit('execution_dequeued', {)
  nodeId: queueItem.nodeId,
  category,
  waitTime: Date.now() - queueItem.timestamp,
});
  private updateMetrics(): void {
  for (const [category, metrics] of this.categoryMetrics) {
  const queue = this.nodeQueues.get(category);
  const executionPool = this.executionPools.get(category);
  if (queue && executionPool) {
  metrics.queuedNodes = queue.length;
  metrics.activeNodes = executionPool.size;
  // Calculate throughput (operations per second)
  // This is a simplified calculation - in practice you'd track completed operations
  const timeSinceLastUpdate = Date.now() - metrics.lastUpdated;
  if (timeSinceLastUpdate > 0) {
  metrics.throughput = (metrics.activeNodes * 1000) / timeSinceLastUpdate;
  metrics.lastUpdated = Date.now();
  private optimizeCategories(): void {,
  if (!this.config.enableCategoryOptimization) {
  return;
  for (const [category, metrics] of this.categoryMetrics) {
  const actions = this.generateOptimizationActions(category, metrics);
  // Store actions for potential application
  actions.forEach(action => {)
  this.optimizationActions.set(action.id, action);
});
      // Auto-apply low-risk optimizations
      const autoApplyActions = actions.filter(action => ;);
        action.expectedImpact.confidence > 0.8 && 
        action.expectedImpact.resourceCost < 0.2
      );
      autoApplyActions.forEach(action => {)
  this.applyOptimization(action.id);
      });
  private generateOptimizationActions(category: string, metrics: CategoryMetrics): OptimizationAction {
    const actions: OptimizationAction = [];
    const categoryConfig = this.config.categories[category];
    // Scale up if utilization is high
    const utilizationRate = metrics.activeNodes / categoryConfig.resourceLimits.maxConcurrentNodes;
    if (utilizationRate > categoryConfig.scalingRules.scaleUpThreshold / 100) {
      actions.push({)
  id: `scale-up-${category}-${Date.now()}`}
}
        category,
        action: 'scale_up',
        reason: `High utilization: ${Math.round(utilizationRate * 100)}%`}
},
  parameters: {,
  targetInstances: Math.min(),
  categoryConfig.resourceLimits.maxConcurrentNodes * 1.5,
  categoryConfig.scalingRules.maxInstances
},
  expectedImpact: {,
  performanceGain: 30,
  resourceCost: 40,
  confidence: 0.85,
},
  timestamp: Date.now(),
        applied: false;
  });
    // Cache optimization if hit rate is low
    if (categoryConfig.cacheStrategy.enabled && metrics.cacheHitRate < 0.5) {
      actions.push({)
  id: `cache-opt-${category}-${Date.now()}`}
}
        category,
        action: 'cache_optimize',
        reason: `Low cache hit rate: ${Math.round(metrics.cacheHitRate * 100)}%`}
},
  parameters: {,
  increaseCacheSize: true,
  optimizeTTL: true,
},
  expectedImpact: {,
  performanceGain: 25,
  resourceCost: 15,
  confidence: 0.75,
},
  timestamp: Date.now(),
        applied: false;
  });
    // Throttle if error rate is high
    if (metrics.errorRate > 0.1) { // 10% error rate
      actions.push({)
  id: `throttle-${category}-${Date.now()}`}
}
        category,
        action: 'throttle',
        reason: `High error rate: ${Math.round(metrics.errorRate * 100)}%`}
},
  parameters: {,
  reduceRate: 0.5,
},
  expectedImpact: {,
  performanceGain: -10, // Short-term performance loss,
  resourceCost: -20, // But reduced resource usage,
  confidence: 0.90,
},
  timestamp: Date.now(),
        applied: false;
  });
    return actions;
  private generateRecommendations(metrics: CategoryMetrics, config: CategoryConfig): string {
  const recommendations: string = [];
  // Performance recommendations
  if (metrics.averageExecutionTime > config.resourceLimits.maxExecutionTimeMs * 0.8) {
  recommendations.push('Consider optimizing node execution algorithms');
  // Resource recommendations
  if (metrics.queuedNodes > config.resourceLimits.queueLimit * 0.8) {
  recommendations.push('Queue is approaching capacity - consider scaling up');
  // Cache recommendations
  if (config.cacheStrategy.enabled && metrics.cacheHitRate < 0.6) {
  recommendations.push('Cache hit rate is low - review caching strategy');
  // Error rate recommendations
  if (metrics.errorRate > 0.05) {
  recommendations.push('Error rate is elevated - investigate common failure patterns');
  return recommendations;
  private calculateRecommendationPriority(metrics: CategoryMetrics): 'low' | 'medium' | 'high' | 'critical' {,
  if (metrics.errorRate > 0.2 || metrics.queuedNodes > 1000) {
  return 'critical';
} else if (metrics.errorRate > 0.1 || metrics.averageExecutionTime > 5000) {
      return 'high';
    } else if (metrics.cacheHitRate < 0.5 || metrics.queuedNodes > 100) {
      return 'medium';
    } else {
  return 'low';
  private estimateOptimizationImpact(metrics: CategoryMetrics, config: CategoryConfig): number {,
  // Simple heuristic for estimating optimization impact
  let impact = 0;
  if (metrics.errorRate > 0.05) impact += 30;
  if (metrics.averageExecutionTime > config.resourceLimits.maxExecutionTimeMs * 0.8) impact += 25;
  if (metrics.cacheHitRate < 0.6) impact += 20;
  if (metrics.queuedNodes > config.resourceLimits.queueLimit * 0.8) impact += 15;
  return Math.min(impact, 100);
  private async executeOptimizationAction(action: OptimizationAction): Promise<boolean> {,
  try {
  switch (action.action) {
  case 'scale_up':,
  return this.executeScaleUp(action);
  case 'scale_down':,
  return this.executeScaleDown(action);
  case 'cache_optimize':,
  return this.executeCacheOptimization(action);
  case 'throttle':,
  return this.executeThrottling(action);
  case 'priority_boost':,
  return this.executePriorityBoost(action);
  default:,
  return false;
} catch (error) {
  console.error('Failed to execute optimization action:', error);
  return false;
  private executeScaleUp(action: OptimizationAction): boolean {,
  const categoryConfig = this.config.categories[action.category];
  const targetInstances = action.parameters.targetInstances;
  // Increase concurrent node limit
  categoryConfig.resourceLimits.maxConcurrentNodes = Math.min()
  targetInstances,
  categoryConfig.scalingRules.maxInstances
  );
  return true;
  private executeScaleDown(action: OptimizationAction): boolean {,
  const categoryConfig = this.config.categories[action.category];
  const metrics = this.categoryMetrics.get(action.category);
  if (metrics && metrics.activeNodes < categoryConfig.resourceLimits.maxConcurrentNodes * 0.5) {
  categoryConfig.resourceLimits.maxConcurrentNodes = Math.max()
  Math.ceil(categoryConfig.resourceLimits.maxConcurrentNodes * 0.8),
  metrics.activeNodes + 2 // Keep some buffer
  );
  return true;
  return false;
  private executeCacheOptimization(action: OptimizationAction): boolean {,
  const categoryConfig = this.config.categories[action.category];
  if (action.parameters.increaseCacheSize) {
  categoryConfig.cacheStrategy.maxSize = Math.min()
  categoryConfig.cacheStrategy.maxSize * 1.5,
  10000 // Max cache size limit
  );
  if (action.parameters.optimizeTTL) {
  categoryConfig.cacheStrategy.ttlMs = Math.min()
  categoryConfig.cacheStrategy.ttlMs * 1.2,
  3600000 // 1 hour max
  );
  return true;
  private executeThrottling(action: OptimizationAction): boolean {,
  const categoryConfig = this.config.categories[action.category];
  const reductionRate = action.parameters.reduceRate || 0.5;
  // Temporarily reduce concurrent execution limit
  const originalLimit = categoryConfig.resourceLimits.maxConcurrentNodes;
  categoryConfig.resourceLimits.maxConcurrentNodes = Math.max()
  Math.ceil(originalLimit * reductionRate),
  1
  );
  // Schedule restoration after cooldown period
  setTimeout(() => {
  categoryConfig.resourceLimits.maxConcurrentNodes = originalLimit;
}, categoryConfig.scalingRules.cooldownMs);
    return true;
  private executePriorityBoost(action: OptimizationAction): boolean {
    const queue = this.nodeQueues.get(action.category);
    if (queue && queue.length > 0) {
      // Boost priority of queued items
      queue.forEach(item => {)
  item.priority = Math.min(item.priority + 10, 100);
      });
      // Re-sort queue by priority
      queue.sort((a, b) => b.priority - a.priority);
      return true;
    return false;

export default CategoryPerformanceManager;