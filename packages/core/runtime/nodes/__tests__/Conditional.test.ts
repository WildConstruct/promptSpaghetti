// packages/core/runtime/nodes/__tests__/Conditional.test.ts
// Comprehensive tests for Conditional node
import {
  ConditionalNode,
  ConditionalBranch,
  ConditionalConfig,
  createConditionalNode,
  ConditionPresets,
  ConditionalBuilder,
  conditional
} from '../Conditional';
import { AdvancedExecutionUtils } from '../../advanced';
describe('Conditional Node', () => {
  let node: ConditionalNode;
  let context: unknown;
  beforeEach(() => {
    const branches: ConditionalBranch = [
      { condition: 'score > 90', output: 'excellent', label: 'High Score' },
      { condition: 'score > 70', output: 'good', label: 'Medium Score' },
      { condition: 'score > 50', output: 'average', label: 'Low Score' }
    ];
    node = new ConditionalNode('test-conditional', branches, 'poor');
    context = AdvancedExecutionUtils.enhanceContext({)
  variables: { score: 85 },
      seed: 12345;
  });
  });
  describe('Basic Functionality', () => {
    test('should execute and return matching condition result', () => {
      const result = node.run(context);
      expect(result).toBe('good'); // score 85 matches 'score > 70'
    });
    test('should return first matching condition (priority order)', () => {
      context.variables.score = 95;
      const result = node.run(context);
      expect(result).toBe('excellent'); // First match wins
    });
    test('should return default when no conditions match', () => {
      context.variables.score = 30;
      const result = node.run(context);
      expect(result).toBe('poor');
    });
    test('should handle empty conditions gracefully', () => {
      const emptyNode = new ConditionalNode('empty', [], 'default');
      const result = emptyNode.run(context);
      expect(result).toBe('default');
    });
    test('should be deterministic with same context', () => {
      const result1 = node.run(context);
      const result2 = node.run(context);
      expect(result1).toBe(result2);
    });
  });
  describe('Expression Evaluation', () => {
    test('should evaluate numeric comparisons', () => {
      const branches: ConditionalBranch = [
        { condition: 'value >= 100', output: 'high' },
        { condition: 'value >= 50', output: 'medium' },
        { condition: 'value >= 0', output: 'low' }
      ];
      const numericNode = new ConditionalNode('numeric', branches, 'negative');
      // Test high
      context.variables.value = 150;
      expect(numericNode.run(context)).toBe('high');
      // Test medium
      context.variables.value = 75;
      expect(numericNode.run(context)).toBe('medium');
      // Test low
      context.variables.value = 25;
      expect(numericNode.run(context)).toBe('low');
      // Test negative
      context.variables.value = -10;
      expect(numericNode.run(context)).toBe('negative');
    });
    test('should evaluate string comparisons', () => {
      const branches: ConditionalBranch = [
        { condition: 'status === "active"', output: 'running' },
        { condition: 'status === "inactive"', output: 'stopped' },
        { condition: 'status === "pending"', output: 'waiting' }
      ];
      const stringNode = new ConditionalNode('string', branches, 'unknown');
      context.variables.status = 'active';
      expect(stringNode.run(context)).toBe('running');
      context.variables.status = 'inactive';
      expect(stringNode.run(context)).toBe('stopped');
      context.variables.status = 'other';
      expect(stringNode.run(context)).toBe('unknown');
    });
    test('should evaluate boolean expressions', () => {
      const branches: ConditionalBranch = [
        { condition: 'isActive && isValid', output: 'ready' },
        { condition: 'isActive || isValid', output: 'partial' },
        { condition: '!isActive', output: 'inactive' }
      ];
      const booleanNode = new ConditionalNode('boolean', branches, 'error');
      // Both true
      context.variables = { isActive: true, isValid: true };
      expect(booleanNode.run(context)).toBe('ready');
      // One true
      context.variables = { isActive: true, isValid: false };
      expect(booleanNode.run(context)).toBe('partial');
      // Active false
      context.variables = { isActive: false, isValid: false };
      expect(booleanNode.run(context)).toBe('inactive');
    });
    test('should handle undefined variables gracefully', () => {
      const branches: ConditionalBranch = [
        { condition: 'undefinedVar > 10', output: 'never' }
      ];
      const undefinedNode = new ConditionalNode('undefined-test', branches, 'default');
      const result = undefinedNode.run(context);
      expect(result).toBe('default'); // Should not throw in non-strict mode
    });
    test('should throw on undefined variables in strict mode', () => {
      const branches: ConditionalBranch = [
        { condition: 'undefinedVar > 10', output: 'never' }
      ];
      const strictNode = new ConditionalNode('strict', branches, 'default', { strictMode: true });
      expect(() => strictNode.run(context)).toThrow();
    });
  });
  describe('Utility Functions', () => {
    test('should support hasVariable function', () => {
      const branches: ConditionalBranch = [
        { condition: 'hasVariable("score")', output: 'has-score' },
        { condition: 'hasVariable("missing")', output: 'has-missing' }
      ];
      const utilNode = new ConditionalNode('util', branches, 'no-variables');
      const result = utilNode.run(context);
      expect(result).toBe('has-score');
    });
    test('should support getVariable function with defaults', () => {
      const branches: ConditionalBranch = [
        { condition: 'getVariable("missing", 30) > 80', output: 'default-high' },
        { condition: 'getVariable("score", 0) > 80', output: 'score-high' }
      ];
      const getVarNode = new ConditionalNode('getvar', branches, 'low');
      const result = getVarNode.run(context);
      expect(result).toBe('score-high'); // score 85 > 80, missing=30 so 30 > 80 is false
    });
    test('should support string utility functions', () => {
      const branches: ConditionalBranch = [
        { condition: 'startsWith(name, "Mr")', output: 'male-title' },
        { condition: 'endsWith(name, "Jr")', output: 'junior' },
        { condition: 'includes(name, "Smith")', output: 'smith-family' }
      ];
      const stringUtilNode = new ConditionalNode('string-util', branches, 'other');
      // Test startsWith
      context.variables.name = 'Mr. Johnson';
      expect(stringUtilNode.run(context)).toBe('male-title');
      // Test endsWith
      context.variables.name = 'John Jr';
      expect(stringUtilNode.run(context)).toBe('junior');
      // Test includes
      context.variables.name = 'Alice Smith';
      expect(stringUtilNode.run(context)).toBe('smith-family');
    });
    test('should support array utility functions', () => {
      const branches: ConditionalBranch = [
        { condition: 'length(items) > 5', output: 'many-items' },
        { condition: 'includes(items, "apple")', output: 'has-apple' },
        { condition: 'isEmpty(items)', output: 'no-items' }
      ];
      const arrayUtilNode = new ConditionalNode('array-util', branches, 'some-items');
      // Test length
      context.variables.items = [1, 2, 3, 4, 5, 6];
      expect(arrayUtilNode.run(context)).toBe('many-items');
      // Test includes
      context.variables.items = ['apple', 'banana'];
      expect(arrayUtilNode.run(context)).toBe('has-apple');
      // Test isEmpty
      context.variables.items = [];
      expect(arrayUtilNode.run(context)).toBe('no-items');
    });
    test('should support pattern matching', () => {
      const branches: ConditionalBranch = [
        { condition: 'matches(email, ".*@gmail\\.com$")', output: 'gmail' },
        { condition: 'matches(email, ".*@.*\\.edu$")', output: 'education' }
      ];
      const patternNode = new ConditionalNode('pattern', branches, 'other-email');
      context.variables.email = 'user@gmail.com';
      expect(patternNode.run(context)).toBe('gmail');
      context.variables.email = 'student@university.edu';
      expect(patternNode.run(context)).toBe('education');
      context.variables.email = 'user@company.com';
      expect(patternNode.run(context)).toBe('other-email');
    });
  });
  describe('Custom Functions', () => {
  test('should support custom functions in configuration', () => {
  const customConfig: ConditionalConfig = {,
  customFunctions: {,
  isEven: (n: number) => n % 2 === 0,
  capitalize: (str: string) => str.charAt(0).toUpperCase() + str.slice(1),
};
      const branches: ConditionalBranch = [
        { condition: 'isEven(number)', output: 'even' },
        { condition: '!isEven(number)', output: 'odd' }
      ];
      const customNode = new ConditionalNode('custom', branches, 'error', customConfig);
      context.variables.number = 4;
      expect(customNode.run(context)).toBe('even');
      context.variables.number = 7;
      expect(customNode.run(context)).toBe('odd');
    });
    test('should support custom functions with multiple parameters', () => {
  const customConfig: ConditionalConfig = {,
  customFunctions: {,
  between: (value: number, min: number, max: number) => value >= min && value <= max,
  distance: (x1: number, y1: number, x2: number, y2: number) =>,
  Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
};
      const branches: ConditionalBranch = [
        { condition: 'between(score, 80, 100)', output: 'A-grade' },
        { condition: 'between(score, 70, 79)', output: 'B-grade' },
        { condition: 'distance(x, y, 0, 0) < 5', output: 'near-origin' }
      ];
      const multiParamNode = new ConditionalNode('multi-param', branches, 'other', customConfig);
      context.variables = { score: 85, x: 3, y: 4 };
      expect(multiParamNode.run(context)).toBe('A-grade');
      context.variables = { score: 65, x: 3, y: 4 }; // distance = 5, not < 5
      expect(multiParamNode.run(context)).toBe('other');
      context.variables = { score: 65, x: 2, y: 2 }; // distance ≈ 2.83 < 5
      expect(multiParamNode.run(context)).toBe('near-origin');
    });
  });
  describe('Validation', () => {
    test('should validate basic configuration', () => {
      const validation = node.validate();
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
    test('should warn about empty conditions', () => {
      const emptyNode = new ConditionalNode('empty', [], 'default');
      const validation = emptyNode.validate();
      expect(validation.valid).toBe(true);
      expect(validation.warnings).toContain('No conditional branches configured - will always return default output');
    });
    test('should validate empty condition expressions', () => {
      const invalidBranches: ConditionalBranch = [
        { condition: '', output: 'invalid' },
        { condition: '   ', output: 'also-invalid' }
      ];
      const invalidNode = new ConditionalNode('invalid', invalidBranches, 'default');
      const validation = invalidNode.validate();
      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('empty condition'))).toBe(true);
    });
    test('should detect dangerous expressions', () => {
      const dangerousBranches: ConditionalBranch = [
        { condition: 'eval("malicious code")', output: 'danger' },
        { condition: 'Function("return process")()', output: 'also-danger' }
      ];
      const dangerousNode = new ConditionalNode('dangerous', dangerousBranches, 'default');
      const validation = dangerousNode.validate();
      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('Dangerous expression detected'))).toBe(true);
    });
    test('should warn about undefined outputs', () => {
      const undefinedBranches: ConditionalBranch = [
        { condition: 'true', output: undefined as any }
      ];
      const undefinedNode = new ConditionalNode('undefined-output', undefinedBranches, 'default');
      const validation = undefinedNode.validate();
      expect(validation.valid).toBe(true);
      expect(validation.warnings.some(w => w.includes('undefined output'))).toBe(true);
    });
    test('should warn about equality operators', () => {
      const equalityBranches: ConditionalBranch = [
        { condition: 'value == 5', output: 'loose-equality' }
      ];
      const equalityNode = new ConditionalNode('equality', equalityBranches, 'default');
      const validation = equalityNode.validate();
      expect(validation.valid).toBe(true);
      expect(validation.warnings.some(w => w.includes('Consider using'))).toBe(true);
    });
  });
  describe('Security', () => {
    test('should block dangerous eval expressions', () => {
      const dangerousBranches: ConditionalBranch = [
        { condition: 'eval("alert(1)")', output: 'evil' }
      ];
      const dangerousNode = new ConditionalNode('evil', dangerousBranches, 'safe');
      expect(() => dangerousNode.run(context)).toThrow('Dangerous pattern detected');
    });
    test('should block constructor access', () => {
      const constructorBranches: ConditionalBranch = [
        { condition: 'constructor.constructor("return process")()', output: 'evil' }
      ];
      const constructorNode = new ConditionalNode('constructor-evil', constructorBranches, 'safe');
      expect(() => constructorNode.run(context)).toThrow('Dangerous pattern detected');
    });
    test('should block prototype pollution attempts', () => {
      const prototypeBranches: ConditionalBranch = [
        { condition: '__proto__.polluted = true', output: 'evil' }
      ];
      const prototypeNode = new ConditionalNode('prototype-evil', prototypeBranches, 'safe');
      expect(() => prototypeNode.run(context)).toThrow('Dangerous pattern detected');
    });
    test('should block global access attempts', () => {
      const globalBranches: ConditionalBranch = [
        { condition: 'global.process.exit(1)', output: 'evil' },
        { condition: 'window.location = "evil"', output: 'also-evil' }
      ];
      const globalNode = new ConditionalNode('global-evil', globalBranches, 'safe');
      expect(() => globalNode.run(context)).toThrow('Dangerous pattern detected');
    });
  });
  describe('Serialization', () => {
    test('should serialize node data', () => {
      const serialized = node.serialize();
      expect(serialized.id).toBe('test-conditional');
      expect(serialized.type).toBe('Conditional');
      expect(serialized.config).toBeDefined();
      expect(serialized.data.branches).toHaveLength(3);
      expect(serialized.data.defaultOutput).toBe('poor');
      expect(serialized.metadata?.version).toBe('1.0.0');
    });
    test('should include conditional config in serialization', () => {
  const customConfig: ConditionalConfig = {,
  allowVariableAccess: false,
  strictMode: true,
};
      const configNode = new ConditionalNode('config', [], 'default', customConfig);
      const serialized = configNode.serialize();
      expect(serialized.data.conditionalConfig).toEqual(expect.objectContaining(customConfig));
    });
  });
  describe('Performance and Tracking', () => {
    test('should track performance metrics', () => {
      const freshContext = AdvancedExecutionUtils.enhanceContext({)
  variables: { score: 85 },
        seed: 12345;
  });
      node.run(freshContext);
      const metricKey = 'test-conditional-conditional-evaluation_duration_ms';
      expect(freshContext.executionMeta.performanceMetrics.has(metricKey)).toBe(true);
      expect(freshContext.executionMeta.nodeExecutionOrder).toContain('test-conditional');
    });
    test('should handle complex expressions efficiently', () => {
      const complexBranches: ConditionalBranch = [];
      for (let i = 0; i < 50; i++) {
        complexBranches.push({)
  condition: `value === ${i}`}
},
  output: `result-${i}`}
        });
      const complexNode = new ConditionalNode('complex', complexBranches, 'no-match');
      const startTime = performance.now();
      context.variables.value = 25;
      const result = complexNode.run(context);
      const endTime = performance.now();
      expect(result).toBe('result-25');
      expect(endTime - startTime).toBeLessThan(50); // Should be reasonably fast
    });
  });
  describe('Factory Functions', () => {
    test('should create node via factory function', () => {
      const branches: ConditionalBranch = [{ condition: 'true', output: 'factory' }];
      const factoryNode = createConditionalNode('factory-test', branches, 'default');
      expect(factoryNode).toBeInstanceOf(ConditionalNode);
      expect(factoryNode.id).toBe('factory-test');
    });
  });
  describe.skip('Condition Presets', () => {
    test('should provide preset condition builders', () => {
      expect(ConditionPresets.greaterThan('score', 90)).toBe('score > 90');
      expect(ConditionPresets.equals('status', 'active')).toBe('status === "active"');
      expect(ConditionPresets.hasVariable('user')).toBe('hasVariable(\'user\')');
      expect(ConditionPresets.startsWith('name', 'Mr')).toBe('startsWith(name, \'Mr\')');
      expect(ConditionPresets.and('a > 5', 'b < 10')).toBe('(a > 5) && (b < 10)');
    });
    test('should work with preset conditions', () => {
      const presetBranches: ConditionalBranch = [
        { condition: ConditionPresets.greaterThan('score', 90), output: 'excellent' },
        { condition: ConditionPresets.hasVariable('bonus'), output: 'has-bonus' },
        { condition: ConditionPresets.equals('status', 'vip'), output: 'vip-user' }
      ];
      const presetNode = new ConditionalNode('preset', presetBranches, 'standard');
      context.variables = { score: 95, bonus: 100, status: 'vip' };
      expect(presetNode.run(context)).toBe('excellent');
      context.variables = { score: 80, bonus: 50 };
      expect(presetNode.run(context)).toBe('has-bonus');
    });
  });
  describe('Fluent Builder API', () => {
    test('should support fluent conditional builder', () => {
      const builder = new ConditionalBuilder();
      const branches = builder;
        .if('score > 90', 'A')
        .elseIf('score > 80', 'B')
        .elseIf('score > 70', 'C')
        .else('F')
        .getBranches();
      expect(branches).toHaveLength(3);
      expect(branches[0]).toEqual({ condition: 'score > 90', output: 'A' });
      expect(builder.getDefaultOutput()).toBe('F');
    });
    test('should build functional conditional node', () => {
      const builtNode = conditional('grades');
        .if('score >= 90', 'A')
        .elseIf('score >= 80', 'B')
        .elseIf('score >= 70', 'C')
        .elseIf('score >= 60', 'D')
        .else('F')
        .build('grade-node');
      context.variables.score = 85;
      expect(builtNode.run(context)).toBe('B');
      context.variables.score = 55;
      expect(builtNode.run(context)).toBe('F');
    });
  });
});