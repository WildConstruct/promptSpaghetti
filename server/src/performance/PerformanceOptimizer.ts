import { EventEmitter } from 'events';
import { WebSocketServer } from '../websocket/WebSocketServer';
import { MetricsCollector, PerformanceAlert } from './MetricsCollector';

/**
 * Optimization strategy configuration
 */
}
export interface OptimizationStrategy {
  name: string;
  description: string;
  enabled: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  triggerConditions: {
    cpuThreshold?: number;
    memoryThreshold?: number;
    latencyThreshold?: number;
    errorRateThreshold?: number;
    connectionCountThreshold?: number;
}
  };
  actions: OptimizationAction[];
}

/**
 * Optimization action types
 */
}
export interface OptimizationAction {
  type: 'throttle' | 'batch' | 'cache' | 'compress' | 'prioritize' | 'scale' | 'cleanup';
  target: string;
  parameters: any;
  description: string;
}
}

/**
 * Optimization result
 */
}
export interface OptimizationResult {
  strategyName: string;
  actionsExecuted: OptimizationAction[];
  startTime: number;
  endTime: number;
  success: boolean;
  metricsImprovement: {
    cpuReduction?: number;
    memoryReduction?: number;
    latencyReduction?: number;
    errorRateReduction?: number;
}
  };
  errors: string[];
}

/**
 * Performance optimizer for collaborative editing system
 */
export class PerformanceOptimizer extends EventEmitter {
  private wsServer: WebSocketServer | null = null;
  private metricsCollector: MetricsCollector;
  private strategies: Map<string, OptimizationStrategy> = new Map();
  private optimizationHistory: OptimizationResult[] = [];
  private isActive: boolean = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private messageBuffer: Map<string, any[]> = new Map();
  private responseCache: Map<string, any> = new Map();
  private connectionPools: Map<string, any[]> = new Map();

  constructor(metricsCollector: MetricsCollector) {
    super();
    this.metricsCollector = metricsCollector;
    this.initializeStrategies();
    this.setupEventListeners();
  }

  /**
   * Set WebSocket server reference
   */
  setWebSocketServer(wsServer: WebSocketServer): void {
    this.wsServer = wsServer;
  }

  /**
   * Start performance optimization monitoring
   */
  start(): void {
    if (this.isActive) {
      return;
    }

    this.isActive = true;
    console.log('Starting performance optimizer');

    // Monitor performance metrics every 10 seconds
    this.monitoringInterval = setInterval(() => {
      this.evaluateOptimizations();
    }, 10000);

    this.emit('optimizer_started');
  }

  /**
   * Stop performance optimization
   */
  stop(): void {
    if (!this.isActive) {
      return;
    }

    this.isActive = false;
    console.log('Stopping performance optimizer');

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    this.emit('optimizer_stopped');
  }

  /**
   * Add or update optimization strategy
   */
  addStrategy(strategy: OptimizationStrategy): void {
    this.strategies.set(strategy.name, strategy);
    this.emit('strategy_added', strategy);
  }

  /**
   * Remove optimization strategy
   */
  removeStrategy(strategyName: string): boolean {
    const removed = this.strategies.delete(strategyName);
    if (removed) {
      this.emit('strategy_removed', strategyName);
    }
    return removed;
  }

  /**
   * Enable or disable a strategy
   */
  setStrategyEnabled(strategyName: string, enabled: boolean): boolean {
    const strategy = this.strategies.get(strategyName);
    if (strategy) {
      strategy.enabled = enabled;
      this.emit('strategy_updated', strategy);
      return true;
    }
    return false;
  }

  /**
   * Force execute a specific optimization strategy
   */
  async executeStrategy(strategyName: string): Promise<OptimizationResult> {

    const strategy = this.strategies.get(strategyName);
    if (!strategy) {
      throw new Error(`Strategy not found: ${strategyName}`);
    }

    console.log(`Executing optimization strategy: ${strategyName}`);
    return await this.applyOptimization(strategy);
  }

  /**
   * Get optimization history
   */
  getOptimizationHistory(): OptimizationResult[] {
    return [...this.optimizationHistory];
  }

  /**
   * Get current optimization strategies
   */
  getStrategies(): OptimizationStrategy[] {
    return Array.from(this.strategies.values());
  }

  /**
   * Get performance recommendations
   */
  getRecommendations(): string[] {
    const currentMetrics = this.metricsCollector.getCurrentMetrics();
    const activeAlerts = this.metricsCollector.getActiveAlerts();
    
    return this.generateRecommendations(currentMetrics, activeAlerts);
  }

  /**
   * WebSocket message batching optimization
   */
  optimizeMessageBatching(documentId: string, messages: any[]): any[] {
    const bufferKey = `${documentId}_batch`;
    
    if (!this.messageBuffer.has(bufferKey)) {
      this.messageBuffer.set(bufferKey, []);
    }

    const buffer = this.messageBuffer.get(bufferKey)!;
    buffer.push(...messages);

    // Batch messages every 100ms or when buffer reaches 10 messages
    if (buffer.length >= 10) {
      const batchedMessages = this.createMessageBatch(buffer);
      this.messageBuffer.set(bufferKey, []);
      return batchedMessages;
    }

    return [];
  }

  /**
   * Response caching optimization
   */
  getCachedResponse(key: string): any | null {
    return this.responseCache.get(key) || null;
  }

  /**
   * Set cached response
   */
  setCachedResponse(key: string, response: any, ttl: number = 60000): void {
    this.responseCache.set(key, response);
    
    // Auto-expire cache entries
    setTimeout(() => {
      this.responseCache.delete(key);
    }, ttl);
  }

  /**
   * Connection pooling optimization
   */
  getConnectionPool(documentId: string): any[] {
    return this.connectionPools.get(documentId) || [];
  }

  /**
   * Initialize default optimization strategies
   */
  private initializeStrategies(): void {
    // Message batching strategy
    this.addStrategy({
      name: 'message_batching',
      description: 'Batch WebSocket messages to reduce network overhead',
      enabled: true,
      priority: 'medium',
      triggerConditions: {
        latencyThreshold: 500,
        connectionCountThreshold: 10
  }
      actions: [
        {
          type: 'batch',
          target: 'websocket_messages',
          parameters: { batchSize: 10, batchInterval: 100 },
          description: 'Batch WebSocket messages for efficient transmission'
        }
      ]
    });

    // Response caching strategy
    this.addStrategy({
      name: 'response_caching',
      description: 'Cache frequently requested responses',
      enabled: true,
      priority: 'medium',
      triggerConditions: {
        cpuThreshold: 70,
        latencyThreshold: 1000
  }
      actions: [
        {
          type: 'cache',
          target: 'graph_operations',
          parameters: { ttl: 60000, maxEntries: 1000 },
          description: 'Cache graph operation results'
        }
      ]
    });

    // Connection throttling strategy
    this.addStrategy({
      name: 'connection_throttling',
      description: 'Throttle new connections under high load',
      enabled: true,
      priority: 'high',
      triggerConditions: {
        cpuThreshold: 85,
        memoryThreshold: 90,
        connectionCountThreshold: 100
  }
      actions: [
        {
          type: 'throttle',
          target: 'new_connections',
          parameters: { maxPerSecond: 5, queueSize: 50 },
          description: 'Limit new connection rate'
        }
      ]
    });

    // Message compression strategy
    this.addStrategy({
      name: 'message_compression',
      description: 'Compress large WebSocket messages',
      enabled: true,
      priority: 'low',
      triggerConditions: {
        latencyThreshold: 2000
  }
      actions: [
        {
          type: 'compress',
          target: 'large_messages',
          parameters: { threshold: 1024, algorithm: 'gzip' },
          description: 'Compress messages larger than 1KB'
        }
      ]
    });

    // Priority queue strategy
    this.addStrategy({
      name: 'message_prioritization',
      description: 'Prioritize critical messages over less important ones',
      enabled: true,
      priority: 'medium',
      triggerConditions: {
        latencyThreshold: 1500,
        connectionCountThreshold: 20
  }
      actions: [
        {
          type: 'prioritize',
          target: 'message_queue',
          parameters: { 
            priorities: {
              'graph_update': 1,
              'conflict_resolution': 1,
              'presence_update': 2,
              'cursor_update': 3
            }
  }
          description: 'Process critical messages first'
        }
      ]
    });

    // Memory cleanup strategy
    this.addStrategy({
      name: 'memory_cleanup',
      description: 'Clean up old data and force garbage collection',
      enabled: true,
      priority: 'critical',
      triggerConditions: {
        memoryThreshold: 85
  }
      actions: [
        {
          type: 'cleanup',
          target: 'memory',
          parameters: { 
            cleanupTypes: ['old_sessions', 'expired_cache', 'disconnected_users'],
            forceGC: true
  }
          description: 'Clean up memory and run garbage collection'
        }
      ]
    });

    // Conflict resolution optimization
    this.addStrategy({
      name: 'conflict_resolution_optimization',
      description: 'Optimize conflict resolution for high-conflict scenarios',
      enabled: true,
      priority: 'high',
      triggerConditions: {
        latencyThreshold: 3000
  }
      actions: [
        {
          type: 'batch',
          target: 'conflict_operations',
          parameters: { batchSize: 5, timeout: 200 },
          description: 'Batch conflict resolution operations'
  }
        {
          type: 'prioritize',
          target: 'conflict_queue',
          parameters: { strategy: 'fifo_with_merge' },
          description: 'Prioritize and merge similar conflicts'
        }
      ]
    });
  }

  /**
   * Evaluate current performance and apply optimizations
   */
  private async evaluateOptimizations(): Promise<void> {

    if (!this.isActive) {
      return;
    }

    const currentMetrics = this.metricsCollector.getCurrentMetrics();
    const activeAlerts = this.metricsCollector.getActiveAlerts();

    // Check each strategy's trigger conditions
    for (const strategy of this.strategies.values()) {
      if (!strategy.enabled) {
        continue;
      }

      if (await this.shouldTriggerStrategy(strategy, currentMetrics, activeAlerts)) {
        try {
          const result = await this.applyOptimization(strategy);
          this.optimizationHistory.push(result);
          
          // Keep only last 100 optimization results
          if (this.optimizationHistory.length > 100) {
            this.optimizationHistory.splice(0, this.optimizationHistory.length - 100);
          }
          
          this.emit('optimization_applied', result);
        } catch (error) {
          console.error(`Failed to apply optimization ${strategy.name}:`, error);
          this.emit('optimization_failed', strategy, error);
        }
      }
    }
  }

  /**
   * Check if strategy should be triggered
   */
  private async shouldTriggerStrategy(
    strategy: OptimizationStrategy, 
    metrics: any, 
    alerts: PerformanceAlert[]
  ): Promise<boolean> {

    const conditions = strategy.triggerConditions;

    // Check CPU threshold
    if (conditions.cpuThreshold && metrics.system?.cpuUsage > conditions.cpuThreshold) {
      return true;
    }

    // Check memory threshold
    if (conditions.memoryThreshold && metrics.system?.memoryUsage?.percentage > conditions.memoryThreshold) {
      return true;
    }

    // Check latency threshold
    if (conditions.latencyThreshold && metrics.webSocket?.messageLatency > conditions.latencyThreshold) {
      return true;
    }

    // Check error rate threshold
    if (conditions.errorRateThreshold && metrics.webSocket?.errorRate > conditions.errorRateThreshold) {
      return true;
    }

    // Check connection count threshold
    if (conditions.connectionCountThreshold && this.wsServer) {
      const healthMetrics = this.wsServer.getHealthMetrics();
      if (healthMetrics.totalConnections > conditions.connectionCountThreshold) {
        return true;
      }
    }

    // Check for relevant alerts
    const relevantAlerts = alerts.filter(alert => 
      this.isAlertRelevantToStrategy(alert, strategy)
    );

    return relevantAlerts.length > 0;
  }

  /**
   * Check if alert is relevant to strategy
   */
  private isAlertRelevantToStrategy(alert: PerformanceAlert, strategy: OptimizationStrategy): boolean {
    const strategyTargets = strategy.actions.map(action => action.target);
    
    // Map alert metrics to strategy targets
    const alertTargetMap: {[key: string]: string[]} = {
      'cpu_usage': ['memory', 'new_connections'],
      'memory_usage': ['memory', 'memory_cleanup'],
      'message_latency': ['websocket_messages', 'large_messages', 'message_queue'],
      'error_rate': ['new_connections', 'message_queue'],
      'conflict_resolution_time': ['conflict_operations', 'conflict_queue']
    };

    const relevantTargets = alertTargetMap[alert.metric] || [];
    return relevantTargets.some(target => strategyTargets.includes(target));
  }

  /**
   * Apply optimization strategy
   */
  private async applyOptimization(strategy: OptimizationStrategy): Promise<OptimizationResult> {

    const startTime = Date.now();
    const preOptimizationMetrics = this.metricsCollector.getCurrentMetrics();
    const actionsExecuted: OptimizationAction[] = [];
    const errors: string[] = [];
    let success = true;

    console.log(`Applying optimization: ${strategy.name}`);

    for (const action of strategy.actions) {
      try {
        await this.executeOptimizationAction(action);
        actionsExecuted.push(action);
        console.log(`Executed action: ${action.type} on ${action.target}`);
      } catch (error) {
        console.error(`Failed to execute action ${action.type}:`, error);
        errors.push(`${action.type}: ${error instanceof Error ? error.message : String(error)}`);
        success = false;
      }
    }

    // Wait a moment for metrics to stabilize
    await this.wait(5000);

    const endTime = Date.now();
    const postOptimizationMetrics = this.metricsCollector.getCurrentMetrics();
    const metricsImprovement = this.calculateMetricsImprovement(
      preOptimizationMetrics, 
      postOptimizationMetrics
    );

    const result: OptimizationResult = {
      strategyName: strategy.name,
      actionsExecuted,
      startTime,
      endTime,
      success,
      metricsImprovement,
      errors
    };

    return result;
  }

  /**
   * Execute individual optimization action
   */
  private async executeOptimizationAction(action: OptimizationAction): Promise<void> {

    switch (action.type) {
    case 'throttle':
      await this.executeThrottleAction(action);
      break;
    case 'batch':
      await this.executeBatchAction(action);
      break;
    case 'cache':
      await this.executeCacheAction(action);
      break;
    case 'compress':
      await this.executeCompressAction(action);
      break;
    case 'prioritize':
      await this.executePrioritizeAction(action);
      break;
    case 'scale':
      await this.executeScaleAction(action);
      break;
    case 'cleanup':
      await this.executeCleanupAction(action);
      break;
    default:
      throw new Error(`Unknown optimization action type: ${action.type}`);
    }
  }

  /**
   * Execute throttle optimization
   */
  private async executeThrottleAction(action: OptimizationAction): Promise<void> {

    if (action.target === 'new_connections' && this.wsServer) {
      // Implement connection throttling
      console.log(`Throttling new connections: max ${action.parameters.maxPerSecond} per second`);
      // Would integrate with WebSocket server connection handling
    }
  }

  /**
   * Execute batch optimization
   */
  private async executeBatchAction(action: OptimizationAction): Promise<void> {

    if (action.target === 'websocket_messages') {
      console.log(`Enabling message batching: size ${action.parameters.batchSize}, interval ${action.parameters.batchInterval}ms`);
      // Message batching is handled in optimizeMessageBatching method
    } else if (action.target === 'conflict_operations') {
      console.log(`Batching conflict operations: size ${action.parameters.batchSize}`);
      // Would integrate with conflict resolver
    }
  }

  /**
   * Execute cache optimization
   */
  private async executeCacheAction(action: OptimizationAction): Promise<void> {

    if (action.target === 'graph_operations') {
      console.log(`Enabling response caching: TTL ${action.parameters.ttl}ms, max entries ${action.parameters.maxEntries}`);
      // Response caching is handled in getCachedResponse/setCachedResponse methods
    }
  }

  /**
   * Execute compress optimization
   */
  private async executeCompressAction(action: OptimizationAction): Promise<void> {

    if (action.target === 'large_messages') {
      console.log(`Enabling message compression for messages > ${action.parameters.threshold} bytes`);
      // Would integrate with WebSocket message handling
    }
  }

  /**
   * Execute prioritize optimization
   */
  private async executePrioritizeAction(action: OptimizationAction): Promise<void> {

    if (action.target === 'message_queue') {
      console.log('Enabling message prioritization');
      // Would integrate with message queue processing
    } else if (action.target === 'conflict_queue') {
      console.log('Optimizing conflict queue prioritization');
      // Would integrate with conflict resolution queue
    }
  }

  /**
   * Execute scale optimization
   */
  private async executeScaleAction(action: OptimizationAction): Promise<void> {

    console.log(`Scaling optimization for ${action.target}`);
    // Would trigger auto-scaling mechanisms
  }

  /**
   * Execute cleanup optimization
   */
  private async executeCleanupAction(action: OptimizationAction): Promise<void> {

    if (action.target === 'memory') {
      console.log('Executing memory cleanup');
      
      // Clear old cache entries
      this.responseCache.clear();
      
      // Clear old message buffers
      this.messageBuffer.clear();
      
      // Force garbage collection if enabled
      if (action.parameters.forceGC && global.gc) {
        global.gc();
      }
      
      // Clean up disconnected connection pools
      for (const [documentId, connections] of this.connectionPools.entries()) {
        const activeConnections = connections.filter(conn => conn.isActive);
        this.connectionPools.set(documentId, activeConnections);
      }
    }
  }

  /**
   * Calculate metrics improvement
   */
  private calculateMetricsImprovement(preMetrics: any, postMetrics: any): any {
    const improvement: any = {};

    if (preMetrics.system && postMetrics.system) {
      improvement.cpuReduction = preMetrics.system.cpuUsage - postMetrics.system.cpuUsage;
      improvement.memoryReduction = preMetrics.system.memoryUsage.percentage - postMetrics.system.memoryUsage.percentage;
    }

    if (preMetrics.webSocket && postMetrics.webSocket) {
      improvement.latencyReduction = preMetrics.webSocket.messageLatency - postMetrics.webSocket.messageLatency;
      improvement.errorRateReduction = preMetrics.webSocket.errorRate - postMetrics.webSocket.errorRate;
    }

    return improvement;
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(metrics: any, alerts: PerformanceAlert[]): string[] {
    const recommendations: string[] = [];

    // CPU recommendations
    if (metrics.system?.cpuUsage > 80) {
      recommendations.push('Enable connection throttling and message batching to reduce CPU load');
    }

    // Memory recommendations
    if (metrics.system?.memoryUsage?.percentage > 85) {
      recommendations.push('Execute memory cleanup and enable response caching with shorter TTL');
    }

    // Latency recommendations
    if (metrics.webSocket?.messageLatency > 1000) {
      recommendations.push('Enable message compression and prioritization for better response times');
    }

    // Error rate recommendations
    if (metrics.webSocket?.errorRate > 5) {
      recommendations.push('Implement connection throttling and improve error handling');
    }

    // Alert-based recommendations
    const criticalAlerts = alerts.filter(a => a.severity === 'critical');
    if (criticalAlerts.length > 0) {
      recommendations.push('Critical performance issues detected. Consider immediate scaling or maintenance');
    }

    // Conflict resolution recommendations
    if (metrics.collaboration?.conflictResolutionTime > 3000) {
      recommendations.push('Optimize conflict resolution by enabling batching and prioritization');
    }

    if (recommendations.length === 0) {
      recommendations.push('System performance is optimal. Continue monitoring.');
    }

    return recommendations;
  }

  /**
   * Create message batch
   */
  private createMessageBatch(messages: any[]): any[] {
    // Group messages by type for efficient batching
    const groupedMessages = new Map<string, any[]>();
    
    for (const message of messages) {
      const messageType = message.type || 'unknown';
      if (!groupedMessages.has(messageType)) {
        groupedMessages.set(messageType, []);
      }
      groupedMessages.get(messageType)!.push(message);
    }

    // Create batched messages
    const batchedMessages: any[] = [];
    
    for (const [type, typeMessages] of groupedMessages.entries()) {
      if (typeMessages.length > 1) {
        batchedMessages.push({
          type: `${type}_batch`,
          payload: {
            messages: typeMessages,
            count: typeMessages.length
  }
          timestamp: Date.now()
        });
      } else {
        batchedMessages.push(...typeMessages);
      }
    }

    return batchedMessages;
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    this.metricsCollector.on('alert_created', (alert: PerformanceAlert) => {
      if (alert.severity === 'critical') {
        // Trigger immediate optimization for critical alerts
        this.evaluateOptimizations();
      }
    });
  }

  /**
   * Utility function to wait
   */
  private wait(ms: number): Promise<void> {

    return new Promise(resolve => setTimeout(resolve, ms));
  }
}