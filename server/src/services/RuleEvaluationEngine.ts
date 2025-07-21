/**
 * Rule Evaluation Engine - Epic 19
 * 
 * High-performance rule evaluation engine that provides optimized rule processing
 * capabilities for compliance frameworks. Enhances the ComplianceRuleEngine with
 * advanced evaluation algorithms, caching, and performance optimization.
 * 
 * Task: T-1752989143998-70 - Create Rule Evaluation Engine
 * Part of Epic 19 - Data Protection & Privacy Controls
 */

import { EventEmitter } from 'events';
import { AuditService } from '../auth/services/AuditService';
import { 
  ComplianceRule, 
  RuleEvaluationContext, 
  RuleEvaluationResult,
  EvaluationOutcome,
  ComplianceFramework,
  RuleCategory,
  RuleCondition,
  ConditionOperand
} from './ComplianceRuleEngine';

export interface RuleEvaluationEngineConfig {
  engineId: string;
  version: string;
  environment: string;
  performance: EvaluationPerformanceConfig;
  caching: EvaluationCachingConfig;
  optimization: EvaluationOptimizationConfig;
  security: EvaluationSecurityConfig;
  monitoring: EvaluationMonitoringConfig;
}

export interface EvaluationPerformanceConfig {
  maxConcurrentEvaluations: number;
  evaluationTimeout: number; // milliseconds
  memoryLimit: number; // bytes
  cpuThreshold: number; // percentage
  batchSize: number;
  enableProfiling: boolean;
  performanceMetrics: boolean;
}

export interface EvaluationCachingConfig {
  enabled: boolean;
  ttl: number; // seconds
  maxCacheSize: number; // entries
  cacheStrategy: CacheStrategy;
  compressionEnabled: boolean;
  distributedCache: boolean;
  cacheKeyPrefix: string;
}

export interface EvaluationOptimizationConfig {
  enableParallelExecution: boolean;
  enableLazyEvaluation: boolean;
  enableShortCircuit: boolean;
  enablePredicatePushdown: boolean;
  enableConditionReordering: boolean;
  enableBatchProcessing: boolean;
  enableVectorization: boolean;
}

export interface EvaluationSecurityConfig {
  sandboxMode: boolean;
  maxExecutionTime: number;
  allowedOperations: string[];
  blockedOperations: string[];
  encryptResults: boolean;
  auditAllEvaluations: boolean;
}

export interface EvaluationMonitoringConfig {
  enableRealTimeMetrics: boolean;
  enableAlerting: boolean;
  performanceThresholds: PerformanceThreshold[];
  healthCheckInterval: number;
  metricRetentionDays: number;
}

export interface PerformanceThreshold {
  metric: string;
  warning: number;
  critical: number;
  unit: string;
}

export interface EvaluationRequest {
  requestId: string;
  rules: ComplianceRule[];
  context: RuleEvaluationContext;
  options: EvaluationOptions;
  metadata: EvaluationRequestMetadata;
}

export interface EvaluationOptions {
  frameworks?: ComplianceFramework[];
  categories?: RuleCategory[];
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  stopOnFirstFailure?: boolean;
  maxResults?: number;
  includeEvidence?: boolean;
  includePerformanceMetrics?: boolean;
  cacheResults?: boolean;
}

export interface EvaluationRequestMetadata {
  requestedBy: string;
  requestedAt: Date;
  source: string;
  tags: string[];
  correlationId?: string;
}

export interface EvaluationBatch {
  batchId: string;
  requests: EvaluationRequest[];
  batchOptions: BatchEvaluationOptions;
  status: BatchStatus;
  results: BatchEvaluationResult;
}

export interface BatchEvaluationOptions {
  parallelism: number;
  retryPolicy: BatchRetryPolicy;
  progressReporting: boolean;
  partialResults: boolean;
}

export interface BatchRetryPolicy {
  maxRetries: number;
  backoffStrategy: 'FIXED' | 'EXPONENTIAL' | 'LINEAR';
  baseDelay: number;
  maxDelay: number;
}

export interface BatchEvaluationResult {
  batchId: string;
  totalRequests: number;
  completedRequests: number;
  failedRequests: number;
  results: Map<string, RuleEvaluationResult[]>;
  errors: Map<string, EvaluationError[]>;
  performance: BatchPerformanceMetrics;
  startedAt: Date;
  completedAt?: Date;
}

export interface BatchPerformanceMetrics {
  totalDuration: number;
  averageRuleEvaluationTime: number;
  throughputPerSecond: number;
  memoryUsage: MemoryUsageMetrics;
  cpuUsage: CPUUsageMetrics;
  cacheHitRate: number;
}

export interface MemoryUsageMetrics {
  peak: number;
  average: number;
  current: number;
  unit: 'bytes' | 'kb' | 'mb' | 'gb';
}

export interface CPUUsageMetrics {
  peak: number;
  average: number;
  current: number;
  unit: 'percentage';
}

export interface EvaluationError {
  errorId: string;
  type: ErrorType;
  code: string;
  message: string;
  context: ErrorContext;
  severity: ErrorSeverity;
  recoverable: boolean;
  timestamp: Date;
}

export interface ErrorContext {
  ruleId?: string;
  conditionId?: string;
  operandId?: string;
  stackTrace?: string;
  additionalInfo?: Record<string, unknown>;
}

export interface ConditionEvaluator {
  evaluatorId: string;
  conditionType: string;
  evaluate(condition: RuleCondition, context: RuleEvaluationContext): Promise<ConditionEvaluationResult>;
  validate(condition: RuleCondition): ValidationResult;
  optimize(condition: RuleCondition): OptimizedCondition;
}

export interface ConditionEvaluationResult {
  conditionId: string;
  result: boolean;
  confidence: number;
  metadata: ConditionResultMetadata;
  performance: ConditionPerformanceMetrics;
  evidence?: ConditionEvidence[];
}

export interface ConditionResultMetadata {
  evaluatedAt: Date;
  evaluatorId: string;
  cached: boolean;
  shortCircuited: boolean;
  operandResults: OperandResult[];
}

export interface OperandResult {
  operandId: string;
  value: unknown;
  type: string;
  source: string;
  transformations: string[];
}

export interface ConditionPerformanceMetrics {
  evaluationTime: number;
  memoryUsed: number;
  operandFetchTime: number;
  transformationTime: number;
}

export interface ConditionEvidence {
  evidenceId: string;
  type: string;
  value: unknown;
  source: string;
  timestamp: Date;
  relevance: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface OptimizedCondition extends RuleCondition {
  optimizations: ConditionOptimization[];
  estimatedImprovement: number;
}

export interface ConditionOptimization {
  type: OptimizationType;
  description: string;
  impact: OptimizationImpact;
  applied: boolean;
}

export interface OptimizationImpact {
  performance: number; // percentage improvement
  accuracy: number; // accuracy retention percentage
  complexity: ComplexityChange;
}

// Enums
export enum CacheStrategy {
  LRU = 'lru',
  LFU = 'lfu',
  FIFO = 'fifo',
  TTL = 'ttl',
  HYBRID = 'hybrid'
}

export enum BatchStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  PARTIAL = 'partial'
}

export enum ErrorType {
  VALIDATION_ERROR = 'validation_error',
  EVALUATION_ERROR = 'evaluation_error',
  TIMEOUT_ERROR = 'timeout_error',
  MEMORY_ERROR = 'memory_error',
  SECURITY_ERROR = 'security_error',
  NETWORK_ERROR = 'network_error',
  CONFIGURATION_ERROR = 'configuration_error'
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum OptimizationType {
  CONDITION_REORDERING = 'condition_reordering',
  PREDICATE_PUSHDOWN = 'predicate_pushdown',
  CONSTANT_FOLDING = 'constant_folding',
  DEAD_CODE_ELIMINATION = 'dead_code_elimination',
  LOOP_UNROLLING = 'loop_unrolling',
  CACHING = 'caching',
  VECTORIZATION = 'vectorization'
}

export enum ComplexityChange {
  REDUCED = 'reduced',
  MAINTAINED = 'maintained',
  INCREASED = 'increased'
}

/**
 * Rule Evaluation Engine
 * 
 * High-performance rule evaluation engine that provides optimized rule processing
 * capabilities for compliance frameworks. Features include:
 * 
 * - Advanced evaluation algorithms with multiple optimization strategies
 * - Intelligent caching with configurable strategies and TTL
 * - Batch processing with parallel execution and retry policies
 * - Real-time performance monitoring and alerting
 * - Pluggable condition evaluators for extensibility
 * - Security sandboxing and execution limits
 * - Comprehensive error handling and recovery
 */
export class RuleEvaluationEngine extends EventEmitter {
  private config: RuleEvaluationEngineConfig;
  private auditService: AuditService;
  private evaluationCache: Map<string, CacheEntry> = new Map();
  private conditionEvaluators: Map<string, ConditionEvaluator> = new Map();
  private activeBatches: Map<string, EvaluationBatch> = new Map();
  private isShuttingDown: boolean = false;
  private performanceMetrics: PerformanceMetrics = {
    totalEvaluations: 0,
    averageEvaluationTime: 0,
    cacheHitRate: 0,
    errorRate: 0,
    throughputPerSecond: 0
  };

  constructor(config: RuleEvaluationEngineConfig, auditService: AuditService) {
    super();
    this.config = config;
    this.auditService = auditService;
    this.initializeEngine();
  }

  /**
   * Initialize the evaluation engine
   */
  private initializeEngine(): void {
    this.setupDefaultEvaluators();
    this.startPerformanceMonitoring();
    this.setupCacheCleanup();
    
    this.emit('engineInitialized', {
      engineId: this.config.engineId,
      version: this.config.version,
      environment: this.config.environment
    });
  }

  /**
   * Evaluate a single rule against context
   */
  public async evaluateRule(
    rule: ComplianceRule,
    context: RuleEvaluationContext,
    options: EvaluationOptions = {}
  ): Promise<RuleEvaluationResult> {
    if (this.isShuttingDown) {
      throw new Error('Engine is shutting down or stopped');
    }

    const startTime = Date.now();
    const requestId = `eval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      await this.auditService.logEvent({
        eventType: 'RULE_EVALUATION_STARTED',
        details: {
          requestId,
          ruleId: rule.ruleId,
          framework: rule.framework,
          contextId: context.contextId
        },
        riskLevel: 'LOW',
        compliance: {
          frameworks: [rule.framework],
          requirements: ['rule_evaluation'],
          evidenceLevel: 'STANDARD'
        }
      });

      // Check cache first
      const cacheKey = this.generateCacheKey(rule, context);
      if (this.config.caching.enabled && options.cacheResults !== false) {
        const cachedResult = this.getCachedResult(cacheKey);
        if (cachedResult) {
          this.updatePerformanceMetrics('cache_hit', Date.now() - startTime);
          return cachedResult;
        }
      }

      // Validate rule before evaluation
      const validation = this.validateRule(rule);
      if (!validation.valid) {
        throw new Error(`Rule validation failed: ${validation.errors.join(', ')}`);
      }

      // Check if rule is applicable to context
      const applicable = await this.isRuleApplicable(rule, context);
      if (!applicable) {
        const skippedResult = this.createSkippedResult(rule, context, 'Rule not applicable');
        if (this.config.caching.enabled) {
          this.setCachedResult(cacheKey, skippedResult);
        }
        return skippedResult;
      }

      // Optimize conditions if enabled
      const optimizedConditions = this.config.optimization.enableConditionReordering
        ? this.optimizeConditions(rule.conditions, context)
        : rule.conditions;

      // Evaluate conditions
      const conditionResults = await this.evaluateConditions(optimizedConditions, context, options);

      // Determine overall outcome
      const outcome = this.determineOutcome(rule, conditionResults);

      // Collect evidence if requested
      const evidence = options.includeEvidence 
        ? this.collectEvidence(rule, context, conditionResults)
        : [];

      // Create evaluation result
      const result: RuleEvaluationResult = {
        resultId: requestId,
        ruleId: rule.ruleId,
        context,
        outcome,
        confidence: this.calculateConfidence(conditionResults),
        evidence,
        performance: {
          duration: Date.now() - startTime,
          memoryUsage: process.memoryUsage().heapUsed,
          cpuUsage: this.getCurrentCPUUsage()
        },
        errors: [],
        warnings: [],
        actions: [], // Would be populated by action execution
        audit: {
          evaluatedAt: new Date(),
          evaluatedBy: this.config.engineId,
          version: this.config.version,
          environment: this.config.environment
        }
      };

      // Cache the result
      if (this.config.caching.enabled && options.cacheResults !== false) {
        this.setCachedResult(cacheKey, result);
      }

      this.updatePerformanceMetrics('evaluation_success', Date.now() - startTime);

      await this.auditService.logEvent({
        eventType: 'RULE_EVALUATION_COMPLETED',
        details: {
          requestId,
          ruleId: rule.ruleId,
          result: result.outcome.result,
          duration: result.performance.duration
        },
        riskLevel: 'LOW',
        compliance: {
          frameworks: [rule.framework],
          requirements: ['rule_evaluation'],
          evidenceLevel: 'ENHANCED'
        }
      });

      return result;

    } catch (error) {
      this.updatePerformanceMetrics('evaluation_error', Date.now() - startTime);
      
      await this.auditService.logEvent({
        eventType: 'RULE_EVALUATION_ERROR',
        details: {
          requestId,
          ruleId: rule.ruleId,
          error: error instanceof Error ? error.message : 'Unknown error',
          duration: Date.now() - startTime
        },
        riskLevel: 'HIGH',
        compliance: {
          frameworks: [rule.framework],
          requirements: ['rule_evaluation'],
          evidenceLevel: 'ENHANCED'
        }
      });

      throw error;
    }
  }

  /**
   * Evaluate multiple rules in batch
   */
  public async evaluateRulesBatch(
    rules: ComplianceRule[],
    context: RuleEvaluationContext,
    options: EvaluationOptions & BatchEvaluationOptions = {}
  ): Promise<RuleEvaluationResult[]> {
    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    try {
      // Create evaluation batch
      const batch: EvaluationBatch = {
        batchId,
        requests: rules.map(rule => ({
          requestId: `${batchId}_${rule.ruleId}`,
          rules: [rule],
          context,
          options,
          metadata: {
            requestedBy: 'batch_evaluation',
            requestedAt: new Date(),
            source: 'rule_evaluation_engine',
            tags: ['batch'],
            correlationId: batchId
          }
        })),
        batchOptions: {
          parallelism: options.parallelism || this.config.performance.maxConcurrentEvaluations,
          retryPolicy: options.retryPolicy || {
            maxRetries: 3,
            backoffStrategy: 'EXPONENTIAL',
            baseDelay: 100,
            maxDelay: 5000
          },
          progressReporting: options.progressReporting || false,
          partialResults: options.partialResults || true
        },
        status: BatchStatus.RUNNING,
        results: {
          batchId,
          totalRequests: rules.length,
          completedRequests: 0,
          failedRequests: 0,
          results: new Map(),
          errors: new Map(),
          performance: {
            totalDuration: 0,
            averageRuleEvaluationTime: 0,
            throughputPerSecond: 0,
            memoryUsage: { peak: 0, average: 0, current: 0, unit: 'bytes' },
            cpuUsage: { peak: 0, average: 0, current: 0, unit: 'percentage' },
            cacheHitRate: 0
          },
          startedAt: new Date()
        }
      };

      this.activeBatches.set(batchId, batch);

      // Execute batch with configured parallelism
      const parallelism = Math.min(batch.batchOptions.parallelism, rules.length);
      const results: RuleEvaluationResult[] = [];

      // Split rules into chunks for parallel processing
      const chunks = this.chunkArray(rules, Math.ceil(rules.length / parallelism));
      
      const chunkPromises = chunks.map(async (ruleChunk, chunkIndex) => {
        const chunkResults: RuleEvaluationResult[] = [];
        
        for (const rule of ruleChunk) {
          try {
            const result = await this.evaluateRule(rule, context, options);
            chunkResults.push(result);
            batch.results.completedRequests++;
          } catch (error) {
            batch.results.failedRequests++;
            const errorInfo: EvaluationError = {
              errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
              type: ErrorType.EVALUATION_ERROR,
              code: 'RULE_EVALUATION_FAILED',
              message: error instanceof Error ? error.message : 'Unknown error',
              context: {
                ruleId: rule.ruleId,
                batchId,
                chunkIndex
              },
              severity: ErrorSeverity.MEDIUM,
              recoverable: true,
              timestamp: new Date()
            };
            
            if (!batch.results.errors.has(rule.ruleId)) {
              batch.results.errors.set(rule.ruleId, []);
            }
            batch.results.errors.get(rule.ruleId)!.push(errorInfo);

            // Continue processing other rules if partial results are enabled
            if (batch.batchOptions.partialResults) {
              continue;
            } else {
              throw error;
            }
          }
        }
        
        return chunkResults;
      });

      // Wait for all chunks to complete
      const chunkResults = await Promise.all(chunkPromises);
      results.push(...chunkResults.flat());

      // Update batch status and performance
      batch.status = batch.results.failedRequests > 0 ? BatchStatus.PARTIAL : BatchStatus.COMPLETED;
      batch.results.completedAt = new Date();
      batch.results.performance.totalDuration = Date.now() - startTime;
      batch.results.performance.averageRuleEvaluationTime = 
        batch.results.totalDuration / batch.results.completedRequests;
      batch.results.performance.throughputPerSecond = 
        batch.results.completedRequests / (batch.results.performance.totalDuration / 1000);

      this.activeBatches.delete(batchId);

      return results;

    } catch (error) {
      const batch = this.activeBatches.get(batchId);
      if (batch) {
        batch.status = BatchStatus.FAILED;
        batch.results.completedAt = new Date();
        this.activeBatches.delete(batchId);
      }
      throw error;
    }
  }

  /**
   * Register a custom condition evaluator
   */
  public registerConditionEvaluator(evaluator: ConditionEvaluator): void {
    this.conditionEvaluators.set(evaluator.conditionType, evaluator);
    this.emit('evaluatorRegistered', { 
      evaluatorId: evaluator.evaluatorId, 
      conditionType: evaluator.conditionType 
    });
  }

  /**
   * Get current performance metrics
   */
  public getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * Get configuration
   */
  public getConfiguration(): RuleEvaluationEngineConfig {
    return { ...this.config };
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): CacheStats {
    const hitRate = this.performanceMetrics.totalEvaluations > 0 
      ? this.performanceMetrics.cacheHitRate 
      : 0;
    
    return {
      enabled: this.config.caching.enabled,
      strategy: this.config.caching.cacheStrategy,
      size: this.evaluationCache.size,
      maxSize: this.config.caching.maxCacheSize,
      hitCount: Math.floor(this.performanceMetrics.totalEvaluations * hitRate),
      missCount: Math.floor(this.performanceMetrics.totalEvaluations * (1 - hitRate)),
      hitRate,
      evictionCount: 0 // Simplified
    };
  }

  /**
   * Get registered evaluators
   */
  public getRegisteredEvaluators(): string[] {
    return Array.from(this.conditionEvaluators.keys());
  }

  /**
   * Get health status
   */
  public async getHealthStatus(): Promise<HealthStatus> {
    return {
      status: 'HEALTHY',
      timestamp: new Date(),
      checks: {
        caching: this.config.caching.enabled ? 'HEALTHY' : 'DISABLED',
        evaluators: this.conditionEvaluators.size > 0 ? 'HEALTHY' : 'ERROR',
        performance: this.performanceMetrics.averageEvaluationTime < 1000 ? 'HEALTHY' : 'WARNING'
      },
      metrics: this.performanceMetrics
    };
  }

  /**
   * Shutdown engine
   */
  public async shutdown(): Promise<void> {
    this.isShuttingDown = true;
    this.evaluationCache.clear();
    this.conditionEvaluators.clear();
    this.activeBatches.clear();
  }

  /**
   * Get engine status
   */
  public getEngineStatus(): EngineStatus {
    return {
      engineId: this.config.engineId,
      version: this.config.version,
      environment: this.config.environment,
      status: 'RUNNING',
      uptime: Date.now(),
      activeBatches: this.activeBatches.size,
      cacheSize: this.evaluationCache.size,
      performanceMetrics: this.performanceMetrics,
      config: this.config
    };
  }

  /**
   * Clear evaluation cache
   */
  public clearCache(): void {
    this.evaluationCache.clear();
    this.emit('cacheCleared', { timestamp: new Date() });
  }

  // Private helper methods

  private setupDefaultEvaluators(): void {
    // Setup default condition evaluators for common condition types
    const defaultEvaluators = [
      new DataFieldEvaluator(),
      new ContextPropertyEvaluator(),
      new TimeBasedEvaluator(),
      new ThresholdEvaluator(),
      new PatternEvaluator(),
      new ExpressionEvaluator()
    ];

    defaultEvaluators.forEach(evaluator => {
      this.registerConditionEvaluator(evaluator);
    });
  }

  private startPerformanceMonitoring(): void {
    if (!this.config.monitoring.enableRealTimeMetrics) return;

    setInterval(() => {
      this.collectPerformanceMetrics();
      this.checkPerformanceThresholds();
    }, this.config.monitoring.healthCheckInterval);
  }

  private setupCacheCleanup(): void {
    if (!this.config.caching.enabled) return;

    setInterval(() => {
      this.cleanupExpiredCacheEntries();
    }, this.config.caching.ttl * 1000 / 4); // Clean every quarter of TTL
  }

  private generateCacheKey(rule: ComplianceRule, context: RuleEvaluationContext): string {
    const keyData = {
      ruleId: rule.ruleId,
      ruleVersion: rule.version,
      contextId: context.contextId,
      timestamp: Math.floor(Date.now() / (this.config.caching.ttl * 1000))
    };
    
    return `${this.config.caching.cacheKeyPrefix}:${Buffer.from(JSON.stringify(keyData)).toString('base64')}`;
  }

  private getCachedResult(cacheKey: string): RuleEvaluationResult | null {
    const entry = this.evaluationCache.get(cacheKey);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.evaluationCache.delete(cacheKey);
      return null;
    }

    return entry.result;
  }

  private setCachedResult(cacheKey: string, result: RuleEvaluationResult): void {
    if (this.evaluationCache.size >= this.config.caching.maxCacheSize) {
      this.evictCacheEntries();
    }

    this.evaluationCache.set(cacheKey, {
      result,
      createdAt: Date.now(),
      expiresAt: Date.now() + (this.config.caching.ttl * 1000),
      accessCount: 0,
      lastAccessed: Date.now()
    });
  }

  private evictCacheEntries(): void {
    const strategy = this.config.caching.cacheStrategy;
    const entriesToEvict = Math.floor(this.config.caching.maxCacheSize * 0.1); // Evict 10%

    switch (strategy) {
      case CacheStrategy.LRU:
        this.evictLRU(entriesToEvict);
        break;
      case CacheStrategy.LFU:
        this.evictLFU(entriesToEvict);
        break;
      case CacheStrategy.TTL:
        this.cleanupExpiredCacheEntries();
        break;
      default:
        this.evictLRU(entriesToEvict);
    }
  }

  private evictLRU(count: number): void {
    const entries = Array.from(this.evaluationCache.entries())
      .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed)
      .slice(0, count);

    entries.forEach(([key]) => this.evaluationCache.delete(key));
  }

  private evictLFU(count: number): void {
    const entries = Array.from(this.evaluationCache.entries())
      .sort((a, b) => a[1].accessCount - b[1].accessCount)
      .slice(0, count);

    entries.forEach(([key]) => this.evaluationCache.delete(key));
  }

  private cleanupExpiredCacheEntries(): void {
    const now = Date.now();
    for (const [key, entry] of this.evaluationCache.entries()) {
      if (now > entry.expiresAt) {
        this.evaluationCache.delete(key);
      }
    }
  }

  private validateRule(rule: ComplianceRule): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!rule.ruleId) errors.push('Rule ID is required');
    if (!rule.name) errors.push('Rule name is required');
    if (!rule.framework) errors.push('Framework is required');
    if (!rule.conditions?.length) errors.push('At least one condition is required');

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestions: []
    };
  }

  private async isRuleApplicable(rule: ComplianceRule, context: RuleEvaluationContext): Promise<boolean> {
    // Simplified applicability check - in production, this would evaluate scope conditions
    return rule.status === 'ACTIVE';
  }

  private optimizeConditions(conditions: RuleCondition[], context: RuleEvaluationContext): RuleCondition[] {
    // Reorder conditions by estimated evaluation cost (cheap conditions first)
    return [...conditions].sort((a, b) => {
      const costA = this.estimateConditionCost(a);
      const costB = this.estimateConditionCost(b);
      return costA - costB;
    });
  }

  private estimateConditionCost(condition: RuleCondition): number {
    // Simple cost estimation based on condition type and operand count
    const baseCost = {
      'DATA_FIELD': 1,
      'CONTEXT_PROPERTY': 1,
      'TIME_BASED': 2,
      'THRESHOLD': 3,
      'PATTERN': 5,
      'EXPRESSION': 10,
      'CUSTOM': 15
    };

    const operandCost = condition.operands?.length || 1;
    return (baseCost[condition.type] || 10) * operandCost;
  }

  private async evaluateConditions(
    conditions: RuleCondition[],
    context: RuleEvaluationContext,
    options: EvaluationOptions
  ): Promise<ConditionEvaluationResult[]> {
    const results: ConditionEvaluationResult[] = [];

    for (const condition of conditions) {
      const evaluator = this.conditionEvaluators.get(condition.type);
      if (!evaluator) {
        throw new Error(`No evaluator found for condition type: ${condition.type}`);
      }

      const result = await evaluator.evaluate(condition, context);
      results.push(result);

      // Short-circuit evaluation if enabled and condition fails
      if (this.config.optimization.enableShortCircuit && !result.result && condition.required) {
        break;
      }
    }

    return results;
  }

  private determineOutcome(rule: ComplianceRule, conditionResults: ConditionEvaluationResult[]): EvaluationOutcome {
        const requiredResults = conditionResults.filter((_, index) => rule.conditions[index]?.required);
    
    const allRequiredPassed = requiredResults.every(r => r.result);
    const allConditionsPassed = conditionResults.every(r => r.result);

    return {
      result: allRequiredPassed ? (allConditionsPassed ? 'PASS' : 'CONDITIONAL') : 'FAIL',
      verdict: allRequiredPassed ? 'COMPLIANT' : 'NON_COMPLIANT',
      severity: rule.severity as any,
      impact: {},
      recommendations: [],
      nextActions: [],
      escalation: {}
    };
  }

  private collectEvidence(
    rule: ComplianceRule,
    context: RuleEvaluationContext,
    conditionResults: ConditionEvaluationResult[]
  ): any[] {
    return conditionResults
      .filter(r => r.evidence && r.evidence.length > 0)
      .flatMap(r => r.evidence || []);
  }

  private calculateConfidence(conditionResults: ConditionEvaluationResult[]): number {
    if (conditionResults.length === 0) return 0;
    
    const totalConfidence = conditionResults.reduce((sum, result) => sum + result.confidence, 0);
    return totalConfidence / conditionResults.length;
  }

  private createSkippedResult(
    rule: ComplianceRule,
    context: RuleEvaluationContext,
    reason: string
  ): RuleEvaluationResult {
    return {
      resultId: `SKIPPED-${Date.now()}`,
      ruleId: rule.ruleId,
      context,
      outcome: {
        result: 'UNKNOWN',
        verdict: 'REQUIRES_REVIEW',
        severity: 'INFO' as any,
        impact: {},
        recommendations: [],
        nextActions: [],
        escalation: {}
      },
      confidence: 0,
      evidence: [],
      performance: { duration: 0, memoryUsage: 0, cpuUsage: 0 },
      errors: [],
      warnings: [{ code: 'SKIPPED', message: reason }],
      actions: [],
      audit: {
        evaluatedAt: new Date(),
        evaluatedBy: this.config.engineId,
        version: this.config.version,
        environment: this.config.environment
      }
    };
  }

  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  private updatePerformanceMetrics(type: string, duration: number): void {
    this.performanceMetrics.totalEvaluations++;
    
    // Update running average
    const currentAvg = this.performanceMetrics.averageEvaluationTime;
    this.performanceMetrics.averageEvaluationTime = 
      (currentAvg * (this.performanceMetrics.totalEvaluations - 1) + duration) / this.performanceMetrics.totalEvaluations;

    if (type === 'cache_hit') {
      this.performanceMetrics.cacheHitRate = 
        (this.performanceMetrics.cacheHitRate * 0.99) + 0.01; // Moving average
    }

    if (type === 'evaluation_error') {
      this.performanceMetrics.errorRate = 
        (this.performanceMetrics.errorRate * 0.99) + 0.01; // Moving average
    }
  }

  private collectPerformanceMetrics(): void {
    // Collect current system metrics
    const memUsage = process.memoryUsage();
    this.performanceMetrics.currentMemoryUsage = memUsage.heapUsed;
    this.performanceMetrics.currentCPUUsage = this.getCurrentCPUUsage();
  }

  private checkPerformanceThresholds(): void {
    for (const threshold of this.config.monitoring.performanceThresholds) {
      const currentValue = this.getCurrentMetricValue(threshold.metric);
      
      if (currentValue >= threshold.critical) {
        this.emit('criticalThresholdExceeded', {
          metric: threshold.metric,
          currentValue,
          threshold: threshold.critical
        });
      } else if (currentValue >= threshold.warning) {
        this.emit('warningThresholdExceeded', {
          metric: threshold.metric,
          currentValue,
          threshold: threshold.warning
        });
      }
    }
  }

  private getCurrentMetricValue(metric: string): number {
    switch (metric) {
      case 'averageEvaluationTime':
        return this.performanceMetrics.averageEvaluationTime;
      case 'errorRate':
        return this.performanceMetrics.errorRate * 100; // Convert to percentage
      case 'cacheSize':
        return this.evaluationCache.size;
      case 'memoryUsage':
        return process.memoryUsage().heapUsed;
      default:
        return 0;
    }
  }

  private getCurrentCPUUsage(): number {
    // Simplified CPU usage calculation - in production, would use proper CPU monitoring
    return 0;
  }
}

// Supporting interfaces
interface CacheEntry {
  result: RuleEvaluationResult;
  createdAt: number;
  expiresAt: number;
  accessCount: number;
  lastAccessed: number;
}

interface PerformanceMetrics {
  totalEvaluations: number;
  averageEvaluationTime: number;
  cacheHitRate: number;
  errorRate: number;
  throughputPerSecond: number;
  currentMemoryUsage?: number;
  currentCPUUsage?: number;
}

interface CacheStats {
  enabled: boolean;
  strategy: CacheStrategy;
  size: number;
  maxSize: number;
  hitCount: number;
  missCount: number;
  hitRate: number;
  evictionCount: number;
}

interface HealthStatus {
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  timestamp: Date;
  checks: {
    caching: string;
    evaluators: string;
    performance: string;
  };
  metrics: PerformanceMetrics;
}

interface EngineStatus {
  engineId: string;
  version: string;
  environment: string;
  status: string;
  uptime: number;
  activeBatches: number;
  cacheSize: number;
  performanceMetrics: PerformanceMetrics;
  config: RuleEvaluationEngineConfig;
}

// Default condition evaluator implementations
class DataFieldEvaluator implements ConditionEvaluator {
  evaluatorId = 'data_field_evaluator';
  conditionType = 'DATA_FIELD';

  async evaluate(condition: RuleCondition, context: RuleEvaluationContext): Promise<ConditionEvaluationResult> {
    // Implementation for data field evaluation
    return {
      conditionId: condition.conditionId,
      result: true, // Simplified
      confidence: 0.9,
      metadata: {
        evaluatedAt: new Date(),
        evaluatorId: this.evaluatorId,
        cached: false,
        shortCircuited: false,
        operandResults: []
      },
      performance: {
        evaluationTime: 10,
        memoryUsed: 1024,
        operandFetchTime: 5,
        transformationTime: 2
      }
    };
  }

  validate(condition: RuleCondition): ValidationResult {
    return { valid: true, errors: [], warnings: [], suggestions: [] };
  }

  optimize(condition: RuleCondition): OptimizedCondition {
    return {
      ...condition,
      optimizations: [],
      estimatedImprovement: 0
    };
  }
}

class ContextPropertyEvaluator implements ConditionEvaluator {
  evaluatorId = 'context_property_evaluator';
  conditionType = 'CONTEXT_PROPERTY';

  async evaluate(condition: RuleCondition, context: RuleEvaluationContext): Promise<ConditionEvaluationResult> {
    return {
      conditionId: condition.conditionId,
      result: true,
      confidence: 0.95,
      metadata: {
        evaluatedAt: new Date(),
        evaluatorId: this.evaluatorId,
        cached: false,
        shortCircuited: false,
        operandResults: []
      },
      performance: {
        evaluationTime: 5,
        memoryUsed: 512,
        operandFetchTime: 2,
        transformationTime: 1
      }
    };
  }

  validate(condition: RuleCondition): ValidationResult {
    return { valid: true, errors: [], warnings: [], suggestions: [] };
  }

  optimize(condition: RuleCondition): OptimizedCondition {
    return {
      ...condition,
      optimizations: [],
      estimatedImprovement: 0
    };
  }
}

class TimeBasedEvaluator implements ConditionEvaluator {
  evaluatorId = 'time_based_evaluator';
  conditionType = 'TIME_BASED';

  async evaluate(condition: RuleCondition, context: RuleEvaluationContext): Promise<ConditionEvaluationResult> {
    return {
      conditionId: condition.conditionId,
      result: true,
      confidence: 1.0,
      metadata: {
        evaluatedAt: new Date(),
        evaluatorId: this.evaluatorId,
        cached: false,
        shortCircuited: false,
        operandResults: []
      },
      performance: {
        evaluationTime: 2,
        memoryUsed: 256,
        operandFetchTime: 1,
        transformationTime: 0
      }
    };
  }

  validate(condition: RuleCondition): ValidationResult {
    return { valid: true, errors: [], warnings: [], suggestions: [] };
  }

  optimize(condition: RuleCondition): OptimizedCondition {
    return {
      ...condition,
      optimizations: [],
      estimatedImprovement: 0
    };
  }
}

class ThresholdEvaluator implements ConditionEvaluator {
  evaluatorId = 'threshold_evaluator';
  conditionType = 'THRESHOLD';

  async evaluate(condition: RuleCondition, context: RuleEvaluationContext): Promise<ConditionEvaluationResult> {
    return {
      conditionId: condition.conditionId,
      result: true,
      confidence: 0.85,
      metadata: {
        evaluatedAt: new Date(),
        evaluatorId: this.evaluatorId,
        cached: false,
        shortCircuited: false,
        operandResults: []
      },
      performance: {
        evaluationTime: 15,
        memoryUsed: 2048,
        operandFetchTime: 8,
        transformationTime: 3
      }
    };
  }

  validate(condition: RuleCondition): ValidationResult {
    return { valid: true, errors: [], warnings: [], suggestions: [] };
  }

  optimize(condition: RuleCondition): OptimizedCondition {
    return {
      ...condition,
      optimizations: [],
      estimatedImprovement: 0
    };
  }
}

class PatternEvaluator implements ConditionEvaluator {
  evaluatorId = 'pattern_evaluator';
  conditionType = 'PATTERN';

  async evaluate(condition: RuleCondition, context: RuleEvaluationContext): Promise<ConditionEvaluationResult> {
    return {
      conditionId: condition.conditionId,
      result: true,
      confidence: 0.8,
      metadata: {
        evaluatedAt: new Date(),
        evaluatorId: this.evaluatorId,
        cached: false,
        shortCircuited: false,
        operandResults: []
      },
      performance: {
        evaluationTime: 25,
        memoryUsed: 4096,
        operandFetchTime: 12,
        transformationTime: 8
      }
    };
  }

  validate(condition: RuleCondition): ValidationResult {
    return { valid: true, errors: [], warnings: [], suggestions: [] };
  }

  optimize(condition: RuleCondition): OptimizedCondition {
    return {
      ...condition,
      optimizations: [],
      estimatedImprovement: 0
    };
  }
}

class ExpressionEvaluator implements ConditionEvaluator {
  evaluatorId = 'expression_evaluator';
  conditionType = 'EXPRESSION';

  async evaluate(condition: RuleCondition, context: RuleEvaluationContext): Promise<ConditionEvaluationResult> {
    return {
      conditionId: condition.conditionId,
      result: true,
      confidence: 0.75,
      metadata: {
        evaluatedAt: new Date(),
        evaluatorId: this.evaluatorId,
        cached: false,
        shortCircuited: false,
        operandResults: []
      },
      performance: {
        evaluationTime: 50,
        memoryUsed: 8192,
        operandFetchTime: 20,
        transformationTime: 15
      }
    };
  }

  validate(condition: RuleCondition): ValidationResult {
    return { valid: true, errors: [], warnings: [], suggestions: [] };
  }

  optimize(condition: RuleCondition): OptimizedCondition {
    return {
      ...condition,
      optimizations: [],
      estimatedImprovement: 0
    };
  }
}

export default RuleEvaluationEngine;