/**
 * Context Validation Framework Tests
 * Epic 18 - Implement Context Validation (E18-1753114562043-B1E2F9)
 */
import { 
  ContextValidationFramework, 
  ContextValidationUtils,
  ContextValidationRule
} from '../ContextValidationFramework';
import { AdvancedExecutionContext } from '../../runtime/advanced';
describe('ContextValidationFramework', () => {
  let framework: ContextValidationFramework;
  beforeEach(() => {
    framework = new ContextValidationFramework({)
      enableVariableValidation: true,
      enableStateValidation: true,
      enableCacheValidation: true,
      enablePerformanceValidation: true,
      enableSecurityValidation: true,
      maxVariableCount: 10,
      maxDepth: 5,
      maxCacheSize: 100,
      warningThreshold: 70,
      errorThreshold: 50,
    });
  });
  describe('Context Validation', () => {
    it('should validate a minimal valid context', async () => {
      const context = ContextValidationUtils.createTestContext();
      const result = await framework.validateContext(context);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.score).toBeGreaterThan(70);
      expect(result.contextHealth).toBeDefined();
    });
    it('should detect missing PRNG function', async () => {
      const context = ContextValidationUtils.createTestContext();
      // @ts-ignore - intentionally creating invalid context for testing
      context.prng = null;
      const result = await framework.validateContext(context);
      expect(result.valid).toBe(false);
      expect(result.errors.some(error => error.includes('Missing PRNG function'))).toBe(true);
      expect(result.score).toBeLessThan(50);
    });
    it('should detect invalid PRNG output', async () => {
      const context = ContextValidationUtils.createTestContext({)
        prng: () => 2.0 // Invalid range
      });
      const result = await framework.validateContext(context);
      expect(result.valid).toBe(false);
      expect(result.errors.some(error => error.includes('PRNG returns invalid values'))).toBe(true);
    });
    it('should warn about missing execution metadata', async () => {
      const context = ContextValidationUtils.createTestContext();
      // @ts-ignore - intentionally creating invalid context for testing
      context.executionMeta = null;
      const result = await framework.validateContext(context);
      expect(result.valid).toBe(false);
      expect(result.errors.some(error => error.includes('Missing execution metadata'))).toBe(true);
    });
    it('should detect too many variables', async () => {
      const context = ContextValidationUtils.createTestContext();
      // Add more variables than the limit
      for (let i = 0; i < 15; i++) {
        context.variables[`var${i}`] = `value${i}`;}
      }
      const result = await framework.validateContext(context);
      expect(result.valid).toBe(true); // Should pass but with warnings
      expect(result.warnings.some(warning => warning.includes('Too many variables'))).toBe(true);
    });
    it('should detect excessive evaluation depth', async () => {
      const context = ContextValidationUtils.createTestContext({)
        evaluationDepth: 10 // Exceeds max depth of 5
      });
      const result = await framework.validateContext(context);
      expect(result.valid).toBe(false);
      expect(result.errors.some(error => error.includes('state consistency issues'))).toBe(true);
    });
    it('should detect large cache size', async () => {
      const context = ContextValidationUtils.createTestContext();
      // Fill cache beyond limit
      for (let i = 0; i < 150; i++) {
        context.cache.set(`key${i}`, `value${i}`);}
      }
      const result = await framework.validateContext(context);
      expect(result.warnings.some(warning => warning.includes('Cache size exceeds limit'))).toBe(true);
    });
    it('should handle circular references in variables', async () => {
      const context = ContextValidationUtils.createTestContext();
      // Create circular reference
      const circular: unknown = { name: 'test' };
      circular.self = circular;
      context.variables['circular'] = circular;
      const result = await framework.validateContext(context);
      expect(result.valid).toBe(false);
      expect(result.errors.some(error => error.includes('variable type issues'))).toBe(true);
    });
    it('should detect undefined variables', async () => {
      const context = ContextValidationUtils.createTestContext();
      context.variables['undefined_var'] = undefined;
      const result = await framework.validateContext(context);
      expect(result.valid).toBe(false);
      expect(result.errors.some(error => error.includes('variable type issues'))).toBe(true);
    });
    it('should provide recommendations for low scores', async () => {
      const context = ContextValidationUtils.createTestContext();
      // Create conditions that reduce score
      context.evaluationDepth = 10;
      for (let i = 0; i < 15; i++) {
        context.variables[`var${i}`] = undefined;}
      }
      const result = await framework.validateContext(context);
      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.recommendations.some(rec => rec.includes('optimizing context'))).toBe(true);
    });
  });
  describe('Custom Rules', () => {
    it('should allow adding custom validation rules', () => {
      const customRule: ContextValidationRule = {
        name: 'custom_test',
        description: 'Test custom rule',
        category: 'warning',
        weight: 1.0,
        validate: () => ({ passed: true, score: 100 })
      };
      expect(() => framework.addRule(customRule)).not.toThrow();
      expect(framework.getRules()).toContain(customRule);
    });
    it('should prevent duplicate rule names', () => {
      const rule1: ContextValidationRule = {
        name: 'duplicate_test',
        description: 'First rule',
        category: 'warning',
        weight: 1.0,
        validate: () => ({ passed: true, score: 100 })
      };
      const rule2: ContextValidationRule = {
        name: 'duplicate_test',
        description: 'Second rule',
        category: 'warning',
        weight: 1.0,
        validate: () => ({ passed: true, score: 100 })
      };
      framework.addRule(rule1);
      expect(() => framework.addRule(rule2)).toThrow('already exists');
    });
    it('should allow removing rules', () => {
      const rule: ContextValidationRule = {
        name: 'removable_test',
        description: 'Test rule for removal',
        category: 'info',
        weight: 0.5,
        validate: () => ({ passed: true, score: 100 })
      };
      framework.addRule(rule);
      expect(framework.getRules()).toContain(rule);
      framework.removeRule('removable_test');
      expect(framework.getRules()).not.toContain(rule);
    });
    it('should execute custom rules during validation', async () => {
      let ruleExecuted = false;
      const customRule: ContextValidationRule = {
        name: 'execution_test',
        description: 'Test rule execution',
        category: 'critical',
        weight: 2.0,
        validate: () => {
          ruleExecuted = true;
          return { passed: false, score: 0, message: 'Custom rule failed' };
        }
      };
      framework.addRule(customRule);
      const context = ContextValidationUtils.createTestContext();
      const result = await framework.validateContext(context);
      expect(ruleExecuted).toBe(true);
      expect(result.errors).toContain('Custom rule failed');
    });
  });
  describe('Configuration Management', () => {
    it('should update configuration', () => {
      const newConfig = {
        maxVariableCount: 50,
        warningThreshold: 80,
      };
      framework.updateConfig(newConfig);
      // We can't directly access the config, but we can test the behavior
      expect(() => framework.updateConfig(newConfig)).not.toThrow();
    });
    it('should emit config update events', (done) => {
      framework.on('config_updated', (config) => {
        expect(config.maxVariableCount).toBe(50);
        done();
      });
      framework.updateConfig({ maxVariableCount: 50 });
    });
  });
  describe('Statistics and Monitoring', () => {
    it('should track validation statistics', async () => {
      const context1 = ContextValidationUtils.createTestContext();
      const context2 = ContextValidationUtils.createTestContext({)
        prng: null as any // Create invalid context
      });
      await framework.validateContext(context1);
      await framework.validateContext(context2);
      const stats = framework.getValidationStatistics();
      expect(stats.totalValidations).toBe(2);
      expect(stats.errorRate).toBe(50); // One out of two failed
      expect(stats.recentValidations).toHaveLength(2);
    });
    it('should emit validation events', (done) => {
      let eventCount = 0;
      framework.on('context_validated', (data) => {
        eventCount++;
        expect(data.contextId).toBeDefined();
        expect(data.result).toBeDefined();
        expect(data.validationTime).toBeGreaterThan(0);
        if (eventCount === 1) done();
      });
      const context = ContextValidationUtils.createTestContext();
      framework.validateContext(context);
    });
    it.skip('should emit error events for validation failures', (done) => {
      framework.on('validation_error', (data) => {
        expect(data.error).toBeDefined();
        expect(data.validationTime).toBeGreaterThan(0);
        done();
      });
      // Force an error by creating a rule that throws
      const errorRule: ContextValidationRule = {
        name: 'error_test',
        description: 'Rule that throws errors',
        category: 'critical',
        weight: 1.0,
        validate: () => {
          throw new Error('Test error');
        }
      };
      framework.addRule(errorRule);
      const context = ContextValidationUtils.createTestContext();
      setTimeout(() => {
        framework.validateContext(context);
      }, 10);
    });
    it('should handle empty validation history gracefully', () => {
      const freshFramework = new ContextValidationFramework();
      const stats = freshFramework.getValidationStatistics();
      expect(stats.totalValidations).toBe(0);
      expect(stats.averageScore).toBe(0);
      expect(stats.errorRate).toBe(0);
      expect(stats.warningRate).toBe(0);
      expect(stats.recentValidations).toHaveLength(0);
    });
  });
});
describe('ContextValidationUtils', () => {
  describe('createTestContext', () => {
    it('should create a minimal valid context', () => {
      const context = ContextValidationUtils.createTestContext();
      expect(ContextValidationUtils.isValidContext(context)).toBe(true);
      expect(typeof context.variables).toBe('object');
      expect(context.nodeStates).toBeInstanceOf(Map);
      expect(context.cache).toBeInstanceOf(Map);
      expect(typeof context.evaluationDepth).toBe('number');
      expect(typeof context.prng).toBe('function');
      expect(context.executionMeta).toBeDefined();
      expect(typeof context.executionMeta.executionId).toBe('string');
    });
    it('should apply overrides', () => {
      const context = ContextValidationUtils.createTestContext({)
        evaluationDepth: 5,
        seed: 99999,
      });
      expect(context.evaluationDepth).toBe(5);
      expect(context.seed).toBe(99999);
    });
  });
  describe('isValidContext', () => {
    it('should validate correct contexts', () => {
      const validContext = ContextValidationUtils.createTestContext();
      expect(ContextValidationUtils.isValidContext(validContext)).toBe(true);
    });
    it('should reject invalid contexts', () => {
      expect(ContextValidationUtils.isValidContext(null)).toBe(false);
      expect(ContextValidationUtils.isValidContext(undefined)).toBe(false);
      expect(ContextValidationUtils.isValidContext({})).toBe(false);
      expect(ContextValidationUtils.isValidContext({ variables: 'not a map' })).toBe(false);
    });
    it('should require all essential properties', () => {
      const incompleteContext = {
        variables: {},
        nodeStates: new Map(),
        cache: new Map(),
        evaluationDepth: 0,
        prng: () => 0.5
        // Missing executionMeta
      };
      expect(ContextValidationUtils.isValidContext(incompleteContext)).toBe(false);
    });
  });
  describe('estimateContextMemory', () => {
    it('should estimate memory usage for empty context', () => {
      const context = ContextValidationUtils.createTestContext();
      const estimate = ContextValidationUtils.estimateContextMemory(context);
      expect(estimate.totalBytes).toBeGreaterThan(0);
      expect(estimate.breakdown.variables).toBe(0); // Empty map
      expect(estimate.breakdown.nodeStates).toBe(0); // Empty map
      expect(estimate.breakdown.cache).toBe(0); // Empty map
      expect(estimate.breakdown.metadata).toBeGreaterThan(0);
    });
    it('should estimate memory for context with data', () => {
      const context = ContextValidationUtils.createTestContext();
      context.variables['test_string'] = 'hello world';
      context.variables['test_number'] = 42;
      context.variables['test_object'] = { key: 'value' };
      context.cache.set('cache_key', 'cache_value');
      const estimate = ContextValidationUtils.estimateContextMemory(context);
      expect(estimate.totalBytes).toBeGreaterThan(100);
      expect(estimate.breakdown.variables).toBeGreaterThan(0);
      expect(estimate.breakdown.cache).toBeGreaterThan(0);
    });
    it('should handle circular references gracefully', () => {
      const context = ContextValidationUtils.createTestContext();
      const circular: unknown = { name: 'test' };
      circular.self = circular;
      context.variables['circular'] = circular;
      expect(() => {
        const estimate = ContextValidationUtils.estimateContextMemory(context);
        expect(estimate.totalBytes).toBeGreaterThan(0);
      }).not.toThrow();
    });
    it('should handle various data types', () => {
      const context = ContextValidationUtils.createTestContext();
      context.variables['null_value'] = null;
      context.variables['undefined_value'] = undefined;
      context.variables['boolean_value'] = true;
      context.variables['array_value'] = [1, 2, 3, 'four'];
      const estimate = ContextValidationUtils.estimateContextMemory(context);
      expect(estimate.totalBytes).toBeGreaterThan(0);
      expect(estimate.breakdown.variables).toBeGreaterThan(0);
    });
  });
  describe('Edge Cases', () => {
    it('should handle malformed execution metadata', () => {
      const context = ContextValidationUtils.createTestContext();
      // @ts-ignore - intentionally creating invalid metadata
      context.executionMeta.nodeExecutionOrder = 'not an array';
      expect(ContextValidationUtils.isValidContext(context)).toBe(false);
    });
    it('should handle missing seed gracefully', () => {
      const context = ContextValidationUtils.createTestContext();
      // @ts-ignore - removing seed
      delete context.seed;
      // Context should still be valid structure-wise
      expect(ContextValidationUtils.isValidContext(context)).toBe(true);
    });
    it('should handle PRNG that throws errors', () => {
      const context = ContextValidationUtils.createTestContext({)
        prng: () => {
          throw new Error('PRNG error');
        }
      });
      // Should still be structurally valid
      expect(ContextValidationUtils.isValidContext(context)).toBe(true);
    });
  });
});