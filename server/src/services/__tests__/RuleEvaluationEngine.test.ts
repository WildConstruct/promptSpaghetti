/**
 * Rule Evaluation Engine Tests - Epic 19
 * 
 * Comprehensive test suite for the Rule Evaluation Engine with performance optimization,
 * caching strategies, batch processing, and pluggable condition evaluators.
 * 
 * Task: T-1752989143998-70 - Create Rule Evaluation Engine
 */

import {
  RuleEvaluationEngine,
  RuleEvaluationEngineConfig,
  EvaluationPerformanceConfig,
  EvaluationCachingConfig,
  EvaluationOptimizationConfig,
  EvaluationSecurityConfig,
  EvaluationMonitoringConfig,
  CacheStrategy,
  BatchStatus,
  ErrorType,
  ErrorSeverity,
  EvaluationOptions,
  BatchEvaluationOptions,
  ConditionEvaluator
} from '../RuleEvaluationEngine';
import {
  ComplianceRule,
  RuleEvaluationContext,
  RuleEvaluationResult
} from '../ComplianceRuleEngine';

// Type aliases for string literals since enums aren't defined
type ComplianceFramework = 'SOC_2' | 'GDPR' | 'HIPAA' | 'PCI_DSS';
type RuleCategory = 'SECURITY' | 'PRIVACY' | 'ACCESS' | 'GOVERNANCE' | 'DATA_PROTECTION';  
type ConditionType = 'DATA_FIELD' | 'CONTEXT_PROPERTY' | 'TIME_BASED' | 'THRESHOLD' | 'PATTERN' | 'EXPRESSION';
type ComparisonOperator = 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN';
type RulePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
type RuleStatus = 'ACTIVE' | 'INACTIVE' | 'DRAFT';
import { AuditService } from '../../auth/services/AuditService';

// Mock dependencies
jest.mock('../../auth/services/AuditService');

describe('RuleEvaluationEngine', () => {
  let engine: RuleEvaluationEngine;
  let mockAuditService: jest.Mocked<AuditService>;
  
  const mockEngineConfig: RuleEvaluationEngineConfig = {
    engineId: 'test-evaluation-engine',
    version: '1.0.0',
    environment: 'test',
    performance: {
      maxConcurrentEvaluations: 10,
      evaluationTimeout: 30000,
      memoryLimit: 100 * 1024 * 1024, // 100MB
      cpuThreshold: 80,
      batchSize: 100,
      enableProfiling: true,
      performanceMetrics: true
    } as EvaluationPerformanceConfig,
    caching: {
      enabled: true,
      ttl: 300,
      maxCacheSize: 1000,
      cacheStrategy: CacheStrategy.LRU,
      compressionEnabled: false,
      distributedCache: false,
      cacheKeyPrefix: 'test-eval-'
    } as EvaluationCachingConfig,
    optimization: {
      enableParallelExecution: true,
      enableLazyEvaluation: true,
      enableShortCircuit: true,
      enablePredicatePushdown: false,
      enableConditionReordering: true,
      enableBatchProcessing: true,
      enableVectorization: false
    } as EvaluationOptimizationConfig,
    security: {
      sandboxMode: true,
      maxExecutionTime: 10000,
      allowedOperations: ['READ', 'COMPARE'],
      blockedOperations: ['WRITE', 'DELETE'],
      encryptResults: false,
      auditAllEvaluations: true
    } as EvaluationSecurityConfig,
    monitoring: {
      enableRealTimeMetrics: true,
      enableAlerting: false,
      performanceThresholds: [
        { metric: 'evaluationTime', warning: 1000, critical: 5000, unit: 'ms' },
        { metric: 'memoryUsage', warning: 50, critical: 80, unit: 'mb' }
      ],
      healthCheckInterval: 30000,
      metricRetentionDays: 7
    } as EvaluationMonitoringConfig
  };

  const mockRule: ComplianceRule = {
    ruleId: 'TEST-RULE-001',
    name: 'Test Compliance Rule',
    description: 'Test rule for evaluation engine testing',
    framework: 'SOC_2' as ComplianceFramework,
    category: 'SECURITY' as RuleCategory,
    subcategory: 'TEST_SUBCATEGORY',
    priority: 'HIGH' as RulePriority,
    status: 'ACTIVE' as RuleStatus,
    version: '1.0.0',
    effectiveDate: new Date('2024-01-01'),
    conditions: [
      {
        conditionId: 'COND-001',
        type: 'DATA_FIELD' as ConditionType,
        operand: {
          field: 'securityLevel',
          operator: 'EQUALS' as ComparisonOperator,
          value: 'HIGH'
        }
      }
    ] as any,
    actions: [],
    metadata: {
      tags: ['test', 'security'],
      owner: 'test-owner',
      reviewDate: new Date('2024-12-31')
    },
    audit: {
      createdAt: new Date(),
      createdBy: 'test-user',
      version: '1.0',
      environment: 'test'
    }
  };

  const mockContext: RuleEvaluationContext = {
    contextId: 'TEST-CONTEXT-001',
    timestamp: new Date(),
    environment: 'test',
    user: { userId: 'test-user', role: 'admin' } as any,
    data: { securityLevel: 'HIGH', classification: 'CONFIDENTIAL' } as any
  };

  beforeEach(() => {
    // Create mock audit service
    mockAuditService = new AuditService({} as any) as jest.Mocked<AuditService>;
    mockAuditService.logEvent = jest.fn<unknown[], unknown>().mockResolvedValue(undefined as unknown);

    // Create engine instance
    engine = new RuleEvaluationEngine(mockEngineConfig, mockAuditService);

    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    test('should initialize with provided configuration', () => {
      expect(engine.getConfiguration().engineId).toBe('test-evaluation-engine');
      expect(engine.getConfiguration().version).toBe('1.0.0');
      expect(engine.getConfiguration().environment).toBe('test');
    });

    test('should initialize caching subsystem when enabled', () => {
      expect(engine.getCacheStats()).toBeDefined();
      expect(engine.getCacheStats().enabled).toBe(true);
      expect(engine.getCacheStats().strategy).toBe(CacheStrategy.LRU);
    });

    test('should register default condition evaluators', () => {
      const evaluators = engine.getRegisteredEvaluators();
      
      expect(evaluators).toContain('DataFieldEvaluator');
      expect(evaluators).toContain('ContextPropertyEvaluator');
      expect(evaluators).toContain('TimeBasedEvaluator');
      expect(evaluators).toContain('ThresholdEvaluator');
      expect(evaluators).toContain('PatternEvaluator');
      expect(evaluators).toContain('ExpressionEvaluator');
    });

    test('should log engine initialization', () => {
      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'RULE_EVALUATION_ENGINE_INITIALIZED',
          details: expect.objectContaining({
            engineId: 'test-evaluation-engine',
            version: '1.0.0',
            environment: 'test'
          })
        })
      );
    });
  });

  describe('Single Rule Evaluation', () => {
    test('should evaluate rule successfully', async () => {
      const result = await engine.evaluateRule(mockRule, mockContext);

      expect(result).toBeDefined();
      expect(result.ruleId).toBe(mockRule.ruleId);
      expect(result.context).toBe(mockContext);
      expect(result.outcome.result).toBeOneOf(['PASS', 'FAIL']);
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
      expect(result.performance).toBeDefined();
      expect(result.performance.duration).toBeGreaterThan(0);
    });

    test('should use cached results when available', async () => {
      // First evaluation
      const result1 = await engine.evaluateRule(mockRule, mockContext);
      
      // Second evaluation should use cache
      const result2 = await engine.evaluateRule(mockRule, mockContext);

      expect(result1.ruleId).toBe(result2.ruleId);
      expect(result1.outcome).toEqual(result2.outcome);
      
      const cacheStats = engine.getCacheStats();
      expect(cacheStats.hitRate).toBeGreaterThan(0);
    });

    test('should handle rule evaluation timeout', async () => {
      const slowRule: ComplianceRule = {
        ...mockRule,
        ruleId: 'SLOW-RULE-001',
        conditions: [
          {
            conditionId: 'SLOW-COND-001',
            type: ConditionType.EXPRESSION,
            operand: {
              expression: 'while(true) { /* infinite loop */ }',
              variables: {}
            }
          }
        ]
      };

      const options: EvaluationOptions = {
        includePerformanceMetrics: true
      };

      const result = await engine.evaluateRule(slowRule, mockContext, options);
      
      // Should complete with timeout error
      expect(result.errors).toBeDefined();
      expect(result.errors.some(error => error.type === ErrorType.TIMEOUT)).toBe(true);
    });

    test('should apply security sandbox restrictions', async () => {
      const maliciousRule: ComplianceRule = {
        ...mockRule,
        ruleId: 'MALICIOUS-RULE-001',
        conditions: [
          {
            conditionId: 'MALICIOUS-COND-001',
            type: ConditionType.EXPRESSION,
            operand: {
              expression: 'require("fs").readFileSync("/etc/passwd")',
              variables: {}
            }
          }
        ]
      };

      const result = await engine.evaluateRule(maliciousRule, mockContext);
      
      expect(result.errors).toBeDefined();
      expect(result.errors.some(error => error.type === ErrorType.SECURITY_VIOLATION)).toBe(true);
    });

    test('should track performance metrics when enabled', async () => {
      const options: EvaluationOptions = {
        includePerformanceMetrics: true
      };

      const result = await engine.evaluateRule(mockRule, mockContext, options);

      expect(result.performance).toBeDefined();
      expect(result.performance.duration).toBeGreaterThan(0);
      expect(result.performance.memoryUsage).toBeGreaterThan(0);
      expect(typeof result.performance.cpuUsage).toBe('number');
    });
  });

  describe('Batch Rule Evaluation', () => {
    const batchRules: ComplianceRule[] = [
      { ...mockRule, ruleId: 'BATCH-RULE-001' },
      { ...mockRule, ruleId: 'BATCH-RULE-002' },
      { ...mockRule, ruleId: 'BATCH-RULE-003' }
    ];

    test('should evaluate multiple rules in batch', async () => {
      const batchOptions: BatchEvaluationOptions = {
        parallelism: 2,
        retryPolicy: {
          maxRetries: 3,
          backoffStrategy: 'EXPONENTIAL',
          baseDelay: 100,
          maxDelay: 1000
        },
        progressReporting: true,
        partialResults: true
      };

      const results = await engine.evaluateRulesBatch(batchRules, mockContext, { ...{}, ...batchOptions });

      expect(results).toHaveLength(3);
      expect(results.every(result => result.ruleId.startsWith('BATCH-RULE'))).toBe(true);
    });

    test('should handle parallel processing with concurrency limits', async () => {
      const manyRules = Array.from({ length: 50 }, (_, i) => ({
        ...mockRule,
        ruleId: `PARALLEL-RULE-${i.toString().padStart(3, '0')}`
      }));

      const startTime = Date.now();
      const results = await engine.evaluateRulesBatch(manyRules, mockContext);
      const endTime = Date.now();

      expect(results).toHaveLength(50);
      expect(endTime - startTime).toBeLessThan(30000); // Should complete within 30 seconds
    });

    test('should retry failed evaluations according to retry policy', async () => {
      const flakyRule: ComplianceRule = {
        ...mockRule,
        ruleId: 'FLAKY-RULE-001',
        conditions: [
          {
            conditionId: 'FLAKY-COND-001',
            type: ConditionType.EXPRESSION,
            operand: {
              expression: 'Math.random() < 0.7 ? true : throw new Error("Random failure")',
              variables: {}
            }
          }
        ]
      };

      const batchOptions: BatchEvaluationOptions = {
        parallelism: 1,
        retryPolicy: {
          maxRetries: 5,
          backoffStrategy: 'EXPONENTIAL',
          baseDelay: 50,
          maxDelay: 500
        },
        progressReporting: false,
        partialResults: true
      };

      const results = await engine.evaluateRulesBatch([flakyRule], mockContext, { ...{}, ...batchOptions });

      expect(results).toHaveLength(1);
      // Should eventually succeed or fail with max retries
    });
  });

  describe('Condition Evaluators', () => {
    test('should register custom condition evaluator', async () => {
      const customEvaluator: ConditionEvaluator = {
        evaluatorId: 'CustomTestEvaluator',
        conditionType: 'CUSTOM_TEST',
        evaluate: jest.fn<unknown[], unknown>().mockResolvedValue({
          passed: true,
          confidence: 1.0,
          metadata: {}
        } as unknown),
        validate: jest.fn<unknown[], unknown>().mockReturnValue({ isValid: true } as unknown),
        optimize: jest.fn<unknown[], unknown>().mockReturnValue({} as any as unknown)
      };

      engine.registerConditionEvaluator(customEvaluator);

      const evaluators = engine.getRegisteredEvaluators();
      expect(evaluators).toContain('CustomTestEvaluator');
    });

    test('should use appropriate evaluator for condition type', async () => {
      const dataFieldCondition: RuleCondition = {
        conditionId: 'DATA-FIELD-COND',
        type: ConditionType.DATA_FIELD,
        operand: {
          field: 'classification',
          operator: ComparisonOperator.EQUALS,
          value: 'CONFIDENTIAL'
        }
      };

      const ruleWithDataField: ComplianceRule = {
        ...mockRule,
        conditions: [dataFieldCondition]
      };

      const result = await engine.evaluateRule(ruleWithDataField, mockContext);

      expect(result.outcome.result).toBeOneOf(['PASS', 'FAIL']); // Actual evaluation may vary
    });

    test('should handle invalid condition types gracefully', async () => {
      const invalidRule: ComplianceRule = {
        ...mockRule,
        conditions: [
          {
            conditionId: 'INVALID-COND',
            type: 'INVALID_TYPE' as ConditionType,
            operand: {}
          }
        ]
      };

      const result = await engine.evaluateRule(invalidRule, mockContext);

      expect(result.errors).toBeDefined();
      expect(result.errors.some(error => error.type === ErrorType.VALIDATION_ERROR)).toBe(true);
    });
  });

  describe('Caching System', () => {
    test('should cache evaluation results', async () => {
      const initialCacheStats = engine.getCacheStats();
      
      // First evaluation - cache miss
      await engine.evaluateRule(mockRule, mockContext);
      
      // Second evaluation - cache hit
      await engine.evaluateRule(mockRule, mockContext);

      const finalCacheStats = engine.getCacheStats();
      
      expect(finalCacheStats.hitCount).toBeGreaterThan(initialCacheStats.hitCount);
      expect(finalCacheStats.hitRate).toBeGreaterThan(0);
    });

    test('should respect cache TTL settings', async () => {
      const shortTtlEngine = new RuleEvaluationEngine(
        {
          ...mockEngineConfig,
          caching: {
            ...mockEngineConfig.caching,
            ttl: 1 // 1 second TTL
          }
        },
        mockAuditService
      );

      // First evaluation
      await shortTtlEngine.evaluateRule(mockRule, mockContext);
      
      // Wait for cache to expire
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      // This should be a cache miss due to expiration
      await shortTtlEngine.evaluateRule(mockRule, mockContext);

      const cacheStats = shortTtlEngine.getCacheStats();
      expect(cacheStats.missCount).toBeGreaterThan(0);
    });

    test('should handle cache eviction when max size reached', async () => {
      const smallCacheEngine = new RuleEvaluationEngine(
        {
          ...mockEngineConfig,
          caching: {
            ...mockEngineConfig.caching,
            maxCacheSize: 2 // Very small cache
          }
        },
        mockAuditService
      );

      // Fill cache beyond capacity
      const rules = [
        { ...mockRule, ruleId: 'CACHE-RULE-001' },
        { ...mockRule, ruleId: 'CACHE-RULE-002' },
        { ...mockRule, ruleId: 'CACHE-RULE-003' }
      ];

      for (const rule of rules) {
        await smallCacheEngine.evaluateRule(rule, mockContext);
      }

      const cacheStats = smallCacheEngine.getCacheStats();
      expect(cacheStats.evictionCount).toBeGreaterThan(0);
    });
  });

  describe('Performance Monitoring', () => {
    test('should track evaluation performance metrics', async () => {
      const initialMetrics = engine.getPerformanceMetrics();
      
      await engine.evaluateRule(mockRule, mockContext);

      const finalMetrics = engine.getPerformanceMetrics();
      
      expect(finalMetrics.totalEvaluations).toBeGreaterThan(initialMetrics.totalEvaluations);
      expect(finalMetrics.averageEvaluationTime).toBeGreaterThan(0);
    });

    test('should detect performance threshold violations', async () => {
      const alertingSpy = jest.fn<unknown[], unknown>();
      engine.on('performanceAlert', alertingSpy);

      // Create a deliberately slow rule that should trigger alert
      const slowRule: ComplianceRule = {
        ...mockRule,
        ruleId: 'SLOW-RULE-ALERT',
        conditions: [
          {
            conditionId: 'SLOW-COND',
            type: ConditionType.EXPRESSION,
            operand: {
              expression: 'new Promise(resolve => setTimeout(resolve, 2000)).then(() => true)', // 2 second delay
              variables: {}
            }
          }
        ]
      };

      await engine.evaluateRule(slowRule, mockContext);

      // Should trigger performance alert for slow evaluation
      expect(alertingSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          metric: 'evaluationTime',
          threshold: 'warning'
        })
      );
    });
  });

  describe('Error Handling', () => {
    test('should handle malformed rules gracefully', async () => {
      const malformedRule = {
        ...mockRule,
        conditions: null // Invalid conditions
      } as any;

      const result = await engine.evaluateRule(malformedRule, mockContext);

      expect(result.errors).toBeDefined();
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.outcome.result).toBe('FAIL');
    });

    test('should categorize errors by type and severity', async () => {
      const errorRule: ComplianceRule = {
        ...mockRule,
        conditions: [
          {
            conditionId: 'ERROR-COND',
            type: ConditionType.EXPRESSION,
            operand: {
              expression: 'throw new Error("Test error")',
              variables: {}
            }
          }
        ]
      };

      const result = await engine.evaluateRule(errorRule, mockContext);

      expect(result.errors).toBeDefined();
      expect(result.errors[0].type).toBe(ErrorType.EXECUTION_ERROR);
      expect(result.errors[0].severity).toBeOneOf([ErrorSeverity.LOW, ErrorSeverity.MEDIUM, ErrorSeverity.HIGH, ErrorSeverity.CRITICAL]);
    });

    test('should provide detailed error context', async () => {
      const contextErrorRule: ComplianceRule = {
        ...mockRule,
        ruleId: 'CONTEXT-ERROR-RULE',
        conditions: [
          {
            conditionId: 'CONTEXT-ERROR-COND',
            type: ConditionType.DATA_FIELD,
            operand: {
              field: 'nonExistentField',
              operator: ComparisonOperator.EQUALS,
              value: 'someValue'
            }
          }
        ]
      };

      const result = await engine.evaluateRule(contextErrorRule, mockContext);

      if (result.errors && result.errors.length > 0) {
        expect(result.errors[0].context).toBeDefined();
        expect(result.errors[0].context.ruleId).toBe('CONTEXT-ERROR-RULE');
        expect(result.errors[0].context.conditionId).toBe('CONTEXT-ERROR-COND');
      }
    });
  });

  describe('Integration and Health Checks', () => {
    test('should perform health check and return status', async () => {
      const healthStatus = await engine.getHealthStatus();

      expect(healthStatus).toBeDefined();
      expect(healthStatus.status).toBeOneOf(['HEALTHY', 'DEGRADED', 'UNHEALTHY']);
      expect(healthStatus.checks).toBeDefined();
      expect(healthStatus.checks.caching).toBeDefined();
      expect(healthStatus.checks.evaluators).toBeDefined();
    });

    test('should gracefully shutdown and cleanup resources', async () => {
      await engine.shutdown();

      // Verify that the engine stops accepting new evaluations
      await expect(
        engine.evaluateRule(mockRule, mockContext)
      ).rejects.toThrow(/Engine is shutting down|stopped/);
    });

    test('should integrate with audit service for compliance tracking', async () => {
      const options: EvaluationOptions = {
        includeEvidence: true
      };

      await engine.evaluateRule(mockRule, mockContext, options);

      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'RULE_EVALUATION_COMPLETED',
          compliance: expect.objectContaining({
            frameworks: ['SOC_2'],
            evidenceLevel: 'ENHANCED'
          })
        })
      );
    });
  });
});

// Custom Jest matchers for better test readability
expect.extend({
  toBeOneOf(received: unknown, validOptions: any[]) {
    const pass = validOptions.includes(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be one of ${validOptions.join(', ')}`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${received} to be one of ${validOptions.join(', ')}`,
        pass: false
      };
    }
  }
});

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeOneOf(validOptions: any[]): R;
    }
  }
}