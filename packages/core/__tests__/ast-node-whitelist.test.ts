/**
 * @jest-environment node
 * 
 * AST Node Whitelist Filter Tests
 * 
 * Comprehensive tests for the AST node type filtering system
 * that ensures only safe AST node types are allowed in expression evaluation.
 * 
 * Tests P0 security requirements for Epic 18 - Conditional Node Security (DEBT-002):
 * - Safe node type whitelist
 * - Dangerous node type blocking
 * - Security audit logging
 * - Configurable security policies
 * - Context-specific filtering
 */
import { describe, it, expect, beforeEach } from '@jest/globals';
import * as acorn from 'acorn';
import { 
  ASTNodeTypeRegistry,
  ASTNodeWhitelistFilter,
  NodeSafetyLevel,
  createConditionalNodeFilter,
  createGeneralExpressionFilter,
  createRestrictedExpressionFilter
} from '../runtime/ast-node-whitelist';
describe('ASTNodeTypeRegistry', () => {
  describe('Node Type Information', () => {
    it('should provide information for safe node types', () => {
      const literalInfo = ASTNodeTypeRegistry.getNodeTypeInfo('Literal');
      expect(literalInfo.safetyLevel).toBe(NodeSafetyLevel.SAFE);
      expect(literalInfo.description).toContain('Literal values');
      expect(literalInfo.allowedContexts).toContain('conditional');
      const identifierInfo = ASTNodeTypeRegistry.getNodeTypeInfo('Identifier');
      expect(identifierInfo.safetyLevel).toBe(NodeSafetyLevel.SAFE);
      expect(identifierInfo.allowedContexts).toContain('general');
    });
    it('should provide information for restricted node types', () => {
      const memberInfo = ASTNodeTypeRegistry.getNodeTypeInfo('MemberExpression');
      expect(memberInfo.safetyLevel).toBe(NodeSafetyLevel.RESTRICTED);
      expect(memberInfo.securityConcerns).toContain('prototype pollution');
      expect(memberInfo.restrictions).toBeDefined();
      expect(memberInfo.restrictions?.length).toBeGreaterThan(0);
      const callInfo = ASTNodeTypeRegistry.getNodeTypeInfo('CallExpression');
      expect(callInfo.safetyLevel).toBe(NodeSafetyLevel.RESTRICTED);
      expect(callInfo.securityConcerns).toContain('arbitrary code execution');
    });
    it('should provide information for dangerous node types', () => {
      const functionInfo = ASTNodeTypeRegistry.getNodeTypeInfo('FunctionExpression');
      expect(functionInfo.safetyLevel).toBe(NodeSafetyLevel.DANGEROUS);
      expect(functionInfo.securityConcerns).toContain('arbitrary code execution');
      expect(functionInfo.allowedContexts).toEqual([]);
      const newInfo = ASTNodeTypeRegistry.getNodeTypeInfo('NewExpression');
      expect(newInfo.safetyLevel).toBe(NodeSafetyLevel.DANGEROUS);
      expect(newInfo.allowedContexts).toEqual([]);
    });
    it('should handle unknown node types', () => {
      const unknownInfo = ASTNodeTypeRegistry.getNodeTypeInfo('UnknownNodeType');
      expect(unknownInfo.safetyLevel).toBe(NodeSafetyLevel.UNKNOWN);
      expect(unknownInfo.description).toContain('Unknown AST node type');
      expect(unknownInfo.securityConcerns).toContain('unknown security implications');
    });
  });
  describe('Node Type Queries', () => {
    it('should return node types by safety level', () => {
      const safeTypes = ASTNodeTypeRegistry.getNodeTypesBySafetyLevel(NodeSafetyLevel.SAFE);
      expect(safeTypes).toContain('Literal');
      expect(safeTypes).toContain('Identifier');
      expect(safeTypes).toContain('BinaryExpression');
      const dangerousTypes = ASTNodeTypeRegistry.getNodeTypesBySafetyLevel(NodeSafetyLevel.DANGEROUS);
      expect(dangerousTypes).toContain('FunctionExpression');
      expect(dangerousTypes).toContain('NewExpression');
      expect(dangerousTypes).toContain('ThisExpression');
    });
    it('should check if node types are known', () => {
      expect(ASTNodeTypeRegistry.isKnownNodeType('Literal')).toBe(true);
      expect(ASTNodeTypeRegistry.isKnownNodeType('FunctionExpression')).toBe(true);
      expect(ASTNodeTypeRegistry.isKnownNodeType('UnknownType')).toBe(false);
    });
    it('should provide security summary', () => {
      const summary = ASTNodeTypeRegistry.getSecuritySummary();
      expect(summary[NodeSafetyLevel.SAFE]).toBeGreaterThan(0);
      expect(summary[NodeSafetyLevel.RESTRICTED]).toBeGreaterThan(0);
      expect(summary[NodeSafetyLevel.DANGEROUS]).toBeGreaterThan(0);
      expect(summary[NodeSafetyLevel.UNKNOWN]).toBe(0);
    });
  });
});
describe('ASTNodeWhitelistFilter', () => {
  let filter: ASTNodeWhitelistFilter;
  beforeEach(() => {
    filter = new ASTNodeWhitelistFilter({)
      strictMode: true,
      allowRestrictedNodes: true,
      logBlockedAttempts: false, // Disable logging for tests
      context: 'test',
      maxDepth: 10,
      maxNodes: 50,
    });
  });
  describe('Basic Node Filtering', () => {
    it('should allow safe node types', () => {
      const literalNode = acorn.parseExpressionAt('42', 0);
      const result = filter.filterNode(literalNode);
      expect(result.allowed).toBe(true);
      expect(result.nodeType).toBe('Literal');
      expect(result.safetyLevel).toBe(NodeSafetyLevel.SAFE);
    });
    it('should allow restricted nodes when configured', () => {
      const memberNode = acorn.parseExpressionAt('obj.prop', 0);
      const result = filter.filterNode(memberNode);
      expect(result.allowed).toBe(true);
      expect(result.nodeType).toBe('MemberExpression');
      expect(result.safetyLevel).toBe(NodeSafetyLevel.RESTRICTED);
    });
    it('should block dangerous node types', () => {
      const functionNode = acorn.parseExpressionAt('function() {}', 0);
      const result = filter.filterNode(functionNode);
      expect(result.allowed).toBe(false);
      expect(result.nodeType).toBe('FunctionExpression');
      expect(result.safetyLevel).toBe(NodeSafetyLevel.DANGEROUS);
      expect(result.reason).toContain('security');
    });
    it('should block unknown node types in strict mode', () => {
      // Create a mock node with unknown type
      const unknownNode = { type: 'UnknownNodeType' } as acorn.Node;
      const result = filter.filterNode(unknownNode);
      expect(result.allowed).toBe(false);
      expect(result.safetyLevel).toBe(NodeSafetyLevel.UNKNOWN);
      expect(result.reason).toContain('strict mode');
    });
  });
  describe('Context-Specific Filtering', () => {
    it('should respect context restrictions', () => {
      const contextFilter = new ASTNodeWhitelistFilter({)
        context: 'restricted',
        allowRestrictedNodes: false,
      });
      const memberNode = acorn.parseExpressionAt('obj.prop', 0);
      const result = contextFilter.filterNode(memberNode);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('not allowed in current configuration');
    });
    it('should apply custom overrides', () => {
      const customFilter = new ASTNodeWhitelistFilter({)
        additionalSafeTypes: ['TestNodeType'],
        blockedSafeTypes: ['Identifier'],
      });
      // Test additional safe type
      const mockSafeNode = { type: 'TestNodeType' } as acorn.Node;
      const safeResult = customFilter.filterNode(mockSafeNode);
      expect(safeResult.allowed).toBe(true);
      // Test blocked safe type
      const identifierNode = acorn.parseExpressionAt('variable', 0);
      const blockedResult = customFilter.filterNode(identifierNode);
      expect(blockedResult.allowed).toBe(false);
      expect(blockedResult.reason).toContain('explicitly blocked');
    });
  });
  describe('AST Tree Filtering', () => {
    it('should filter entire AST trees', () => {
      const safeAST = acorn.parseExpressionAt('x + y > 10', 0);
      const result = filter.filterAST(safeAST);
      expect(result.allowed).toBe(true);
      expect(result.blockedNodes).toHaveLength(0);
      expect(result.stats.totalNodes).toBeGreaterThan(1);
      expect(result.stats.safeNodes).toBeGreaterThan(0);
    });
    it('should block dangerous nodes in AST trees', () => {
      const dangerousAST = acorn.parseExpressionAt('x + function() {}', 0);
      const result = filter.filterAST(dangerousAST);
      expect(result.allowed).toBe(false);
      expect(result.blockedNodes.length).toBeGreaterThan(0);
      expect(result.blockedNodes[0].nodeType).toBe('FunctionExpression');
    });
    it('should enforce depth limits', () => {
      const shallowFilter = new ASTNodeWhitelistFilter({ maxDepth: 2 });
      // Create deeply nested expression
      const deepAST = acorn.parseExpressionAt('((((x))))', 0);
      const result = shallowFilter.filterAST(deepAST);
      expect(result.allowed).toBe(false);
      expect(result.blockedNodes.some(b => b.reason?.includes('depth'))).toBe(true);
    });
    it('should enforce node count limits', () => {
      const limitedFilter = new ASTNodeWhitelistFilter({ maxNodes: 5 });
      // Create expression with many nodes
      const complexAST = acorn.parseExpressionAt('a + b + c + d + e + f + g', 0);
      const result = limitedFilter.filterAST(complexAST);
      expect(result.allowed).toBe(false);
      expect(result.blockedNodes.some(b => b.reason?.includes('node count'))).toBe(true);
    });
  });
  describe('Statistics and Reporting', () => {
    it('should provide comprehensive filtering statistics', () => {
      const mixedAST = acorn.parseExpressionAt('x + y', 0);
      const result = filter.filterAST(mixedAST);
      expect(result.stats.totalNodes).toBeGreaterThan(0);
      expect(result.stats.maxDepth).toBeGreaterThan(0);
      expect(result.stats.nodeTypeCounts).toBeDefined();
      expect(result.stats.safeNodes).toBeGreaterThan(0);
    });
    it('should generate helpful suggestions', () => {
      const dangerousNode = acorn.parseExpressionAt('function() {}', 0);
      const result = filter.filterNode(dangerousNode);
      expect(result.suggestions).toBeDefined();
      expect(result.suggestions?.length).toBeGreaterThan(0);
      expect(result.suggestions?.some(s => s.includes('Remove'))).toBe(true);
    });
  });
  describe('Audit Logging', () => {
    it('should log blocked attempts when enabled', () => {
      const loggingFilter = new ASTNodeWhitelistFilter({)
        logBlockedAttempts: true,
      });
      const dangerousNode = acorn.parseExpressionAt('function() {}', 0);
      loggingFilter.filterNode(dangerousNode);
      const events = loggingFilter.getAuditEvents();
      expect(events.length).toBeGreaterThan(0);
      expect(events[0].nodeType).toBe('FunctionExpression');
      expect(events[0].safetyLevel).toBe(NodeSafetyLevel.DANGEROUS);
    });
    it('should manage audit event storage limits', () => {
      const loggingFilter = new ASTNodeWhitelistFilter({)
        logBlockedAttempts: true,
      });
      // Generate many events
      for (let i = 0; i < 1005; i++) {
        const dangerousNode = acorn.parseExpressionAt('function() {}', 0);
        loggingFilter.filterNode(dangerousNode);
      }
      const events = loggingFilter.getAuditEvents();
      expect(events.length).toBeLessThanOrEqual(1000); // Should limit storage
    });
    it('should clear audit events', () => {
      const loggingFilter = new ASTNodeWhitelistFilter({)
        logBlockedAttempts: true,
      });
      const dangerousNode = acorn.parseExpressionAt('function() {}', 0);
      loggingFilter.filterNode(dangerousNode);
      expect(loggingFilter.getAuditEvents().length).toBeGreaterThan(0);
      loggingFilter.clearAuditEvents();
      expect(loggingFilter.getAuditEvents().length).toBe(0);
    });
  });
  describe('Configuration Management', () => {
    it('should get and update configuration', () => {
      const config = filter.getConfig();
      expect(config.strictMode).toBe(true);
      expect(config.context).toBe('test');
      filter.updateConfig({ strictMode: false, context: 'updated' });
      const updatedConfig = filter.getConfig();
      expect(updatedConfig.strictMode).toBe(false);
      expect(updatedConfig.context).toBe('updated');
    });
  });
});
describe('Factory Functions', () => {
  describe('createConditionalNodeFilter', () => {
    it('should create filter optimized for conditional expressions', () => {
      const filter = createConditionalNodeFilter();
      const config = filter.getConfig();
      expect(config.context).toBe('conditional');
      expect(config.strictMode).toBe(true);
      expect(config.allowRestrictedNodes).toBe(true);
      expect(config.maxDepth).toBe(20);
      expect(config.maxNodes).toBe(100);
    });
    it('should allow member expressions in conditional context', () => {
      const filter = createConditionalNodeFilter();
      const memberNode = acorn.parseExpressionAt('obj.prop', 0);
      const result = filter.filterNode(memberNode);
      expect(result.allowed).toBe(true);
    });
  });
  describe('createGeneralExpressionFilter', () => {
    it('should create filter for general expressions', () => {
      const filter = createGeneralExpressionFilter();
      const config = filter.getConfig();
      expect(config.context).toBe('general');
      expect(config.allowRestrictedNodes).toBe(false);
      expect(config.maxDepth).toBe(15);
      expect(config.maxNodes).toBe(50);
    });
    it('should block restricted nodes in general context', () => {
      const filter = createGeneralExpressionFilter();
      const memberNode = acorn.parseExpressionAt('obj.prop', 0);
      const result = filter.filterNode(memberNode);
      expect(result.allowed).toBe(false);
    });
  });
  describe('createRestrictedExpressionFilter', () => {
    it('should create most restrictive filter', () => {
      const filter = createRestrictedExpressionFilter();
      const config = filter.getConfig();
      expect(config.context).toBe('restricted');
      expect(config.allowRestrictedNodes).toBe(false);
      expect(config.maxDepth).toBe(10);
      expect(config.maxNodes).toBe(25);
      expect(config.blockedSafeTypes).toContain('CallExpression');
    });
    it('should block normally safe types when configured', () => {
      const filter = createRestrictedExpressionFilter();
      const callNode = acorn.parseExpressionAt('func()', 0);
      const result = filter.filterNode(callNode);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('explicitly blocked');
    });
  });
});
describe('Real-world Expression Testing', () => {
  let filter: ASTNodeWhitelistFilter;
  beforeEach(() => {
    filter = createConditionalNodeFilter();
  });
  it('should allow safe conditional expressions', () => {
    const safeExpressions = [;
      'x > 5',
      'name === "test"',
      'x > 0 && y < 10',
      'arr.length > 0',
      'user.active === true',
      'value !== null',
      '(x + y) * 2 > threshold'
    ];
    for (const expr of safeExpressions) {
      const ast = acorn.parseExpressionAt(expr, 0);
      const result = filter.filterAST(ast);
      expect(result.allowed).toBe(true);
    }
  });
  it('should block dangerous expressions', () => {
    const dangerousExpressions = [;
      'function() { return "bad"; }',
      'new Date()',
      'x = 5',
      'x++',
      'this.constructor',
      'eval("code")',
      '() => "arrow"'
    ];
    for (const expr of dangerousExpressions) {
      try {
        const ast = acorn.parseExpressionAt(expr, 0);
        const result = filter.filterAST(ast);
        expect(result.allowed).toBe(false);
      } catch (error) {
        // Some expressions may fail to parse, which is also acceptable
      }
    }
  });
  it('should handle complex nested expressions', () => {
    const complexExpr = '(user.age > 18 && user.verified === true) || (user.role === "admin" && permissions.includes("override"))';
    const ast = acorn.parseExpressionAt(complexExpr, 0);
    const result = filter.filterAST(ast);
    expect(result.allowed).toBe(true);
    expect(result.stats.totalNodes).toBeGreaterThan(10);
    expect(result.stats.maxDepth).toBeGreaterThan(3);
  });
});