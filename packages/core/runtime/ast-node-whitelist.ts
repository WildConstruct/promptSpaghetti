// packages/core/runtime/ast-node-whitelist.ts
// AST node whitelist filter for secure expression evaluation
import * as acorn from 'acorn';
import { securityAudit, SecuritySeverity, SecurityEventCategory } from './security-audit-logger';
/**
 * Safety levels for AST nodes
 */
export enum NodeSafetyLevel {
  SAFE = 'SAFE',
  RESTRICTED = 'RESTRICTED', 
  DANGEROUS = 'DANGEROUS'
}
/**
 * Interface for blocked node information
 */
export interface BlockedNodeInfo {
  nodeType: string;
  safetyLevel: NodeSafetyLevel;
  reason: string;
  position?: acorn.Position;
}
/**
 * Filter result interface
 */
export interface FilterResult {
  allowed: boolean;
  blockedNodes: BlockedNodeInfo[];
}
/**
 * AST node whitelist filter configuration
 */
export interface ASTNodeWhitelistConfig {
  allowedNodeTypes: Set<string>;
  restrictedNodeTypes: Set<string>;
  dangerousNodeTypes: Set<string>;
  maxDepth?: number;
  maxNodes?: number;
}
/**
 * AST node whitelist filter for security validation
 */
export class ASTNodeWhitelistFilter {
  private config: ASTNodeWhitelistConfig;
  private nodeCount: number = 0;
  private currentDepth: number = 0;
  constructor(config: ASTNodeWhitelistConfig) {
    this.config = config;
  }
  /**
   * Filter an AST and return validation result
   */
  filterAST(ast: acorn.Node): FilterResult {
    this.nodeCount = 0;
    this.currentDepth = 0;
    const blockedNodes: BlockedNodeInfo[] = [];
    this.validateNode(ast, blockedNodes);
    return {
      allowed: blockedNodes.length === 0,
      blockedNodes
    };
  }
  /**
   * Recursively validate AST nodes
   */
  private validateNode(node: acorn.Node, blockedNodes: BlockedNodeInfo[]): void {
    if (!node || typeof node !== 'object') {
      return;
    }
    this.nodeCount++;
    this.currentDepth++;
    // Check node count limit
    if (this.config.maxNodes && this.nodeCount > this.config.maxNodes) {
      blockedNodes.push({)
        nodeType: node.type,
        safetyLevel: NodeSafetyLevel.DANGEROUS,
        reason: `Exceeded maximum node count of ${this.config.maxNodes}`,}
        position: node.loc?.start,
      });
      return;
    }
    // Check depth limit
    if (this.config.maxDepth && this.currentDepth > this.config.maxDepth) {
      blockedNodes.push({)
        nodeType: node.type,
        safetyLevel: NodeSafetyLevel.DANGEROUS,
        reason: `Exceeded maximum depth of ${this.config.maxDepth}`,}
        position: node.loc?.start,
      });
      return;
    }
    // Check node type safety
    if (this.config.dangerousNodeTypes.has(node.type)) {
      blockedNodes.push({)
        nodeType: node.type,
        safetyLevel: NodeSafetyLevel.DANGEROUS,
        reason: `Node type '${node.type}' is marked as dangerous`,}
        position: node.loc?.start,
      });
      // Log to security audit
      securityAudit.logASTNodeBlocked(node.type, 'Dangerous node type', {)
        astDepth: this.currentDepth,
        nodeCount: this.nodeCount,
      });
      return;
    }
    if (this.config.restrictedNodeTypes.has(node.type)) {
      blockedNodes.push({)
        nodeType: node.type,
        safetyLevel: NodeSafetyLevel.RESTRICTED,
        reason: `Node type '${node.type}' is restricted in this context`,}
        position: node.loc?.start,
      });
      return;
    }
    if (!this.config.allowedNodeTypes.has(node.type)) {
      blockedNodes.push({)
        nodeType: node.type,
        safetyLevel: NodeSafetyLevel.DANGEROUS,
        reason: `Node type '${node.type}' is not in the whitelist`,}
        position: node.loc?.start,
      });
      return;
    }
    // Special validation for specific node types
    this.validateSpecificNodeType(node, blockedNodes);
    // Recursively validate child nodes
    this.validateChildNodes(node, blockedNodes);
    this.currentDepth--;
  }
  /**
   * Validate specific node types with custom rules
   */
  private validateSpecificNodeType(node: acorn.Node, blockedNodes: BlockedNodeInfo[]): void {
    switch (node.type) {
    case 'Identifier':
      this.validateIdentifier(node as any, blockedNodes);
      break;
    case 'MemberExpression':
      this.validateMemberExpression(node as any, blockedNodes);
      break;
    case 'CallExpression':
      this.validateCallExpression(node as any, blockedNodes);
      break;
    case 'Literal':
      this.validateLiteral(node as any, blockedNodes);
      break;
    }
  }
  /**
   * Validate identifier nodes for dangerous names
   */
  private validateIdentifier(node: acorn.Node & { name: string }, blockedNodes: BlockedNodeInfo[]): void {
    const dangerousIdentifiers = [;
      'eval', 'Function', 'constructor', 'prototype', '__proto__',
      '__defineGetter__', '__defineSetter__', '__lookupGetter__', '__lookupSetter__',
      'window', 'global', 'globalThis', 'self', 'document', 'process',
      'require', 'import', 'export', 'arguments', 'caller', 'callee'
    ];
    if (dangerousIdentifiers.includes(node.name)) {
      blockedNodes.push({)
        nodeType: node.type,
        safetyLevel: NodeSafetyLevel.DANGEROUS,
        reason: `Dangerous identifier '${node.name}' is not allowed`,}
        position: node.loc?.start,
      });
    }
  }
  /**
   * Validate member expression for dangerous property access
   */
  private validateMemberExpression(node: acorn.Node & { )
    object: acorn.Node, 
    property: acorn.Node, 
    computed: boolean ,
  }, blockedNodes: BlockedNodeInfo[]): void {
    // Check for dangerous property names
    if (!node.computed && (node.property as any).type === 'Identifier') {
      const propertyName = (node.property as any).name;
      const dangerousProperties = [;
        'constructor', 'prototype', '__proto__', '__defineGetter__', '__defineSetter__',
        '__lookupGetter__', '__lookupSetter__', 'valueOf', 'toString'
      ];
      if (dangerousProperties.includes(propertyName)) {
        blockedNodes.push({)
          nodeType: node.type,
          safetyLevel: NodeSafetyLevel.DANGEROUS,
          reason: `Access to dangerous property '${propertyName}' is not allowed`,}
          position: node.loc?.start,
        });
      }
    }
  }
  /**
   * Validate call expressions
   */
  private validateCallExpression(node: acorn.Node & {)
    callee: acorn.Node,
    arguments: acorn.Node[],
  }, blockedNodes: BlockedNodeInfo[]): void {
    // Only allow calls to whitelisted functions in the evaluation context
    // The actual function validation happens during evaluation
    // Check for immediately dangerous call patterns
    if ((node.callee as any).type === 'Identifier') {
      const functionName = (node.callee as any).name;
      const dangerousFunctions = ['eval', 'Function', 'setTimeout', 'setInterval'];
      if (dangerousFunctions.includes(functionName)) {
        blockedNodes.push({)
          nodeType: node.type,
          safetyLevel: NodeSafetyLevel.DANGEROUS,
          reason: `Call to dangerous function '${functionName}' is not allowed`,}
          position: node.loc?.start,
        });
      }
    }
  }
  /**
   * Validate literal values
   */
  private validateLiteral(node: acorn.Node & { value: Error, raw?: string }, blockedNodes: BlockedNodeInfo[]): void {
    // Check for dangerous string literals that might be used for code injection
    if (typeof node.value === 'string') {
      const dangerousPatterns = [;
        /eval\s*\(/,)
        /Function\s*\(/,)
        /constructor/,
        /__proto__/,
        /\<script/i,
        /javascript:/i
      ];
      for (const pattern of dangerousPatterns) {
        if (pattern.test(node.value)) {
          blockedNodes.push({)
            nodeType: node.type,
            safetyLevel: NodeSafetyLevel.DANGEROUS,
            reason: `String literal contains dangerous pattern: ${pattern.source}`,}
            position: node.loc?.start,
          });
          break;
        }
      }
    }
  }
  /**
   * Recursively validate child nodes
   */
  private validateChildNodes(node: acorn.Node, blockedNodes: BlockedNodeInfo[]): void {
    // Walk through all properties that might contain child nodes
    for (const key in node) {
      if (key === 'type' || key === 'start' || key === 'end' || key === 'loc' || key === 'range') {
        continue;
      }
      const value = (node as any)[key];
      if (Array.isArray(value)) {
        for (const item of value) {
          if (item && typeof item === 'object' && item.type) {
            this.validateNode(item, blockedNodes);
          }
        }
      } else if (value && typeof value === 'object' && value.type) {
        this.validateNode(value, blockedNodes);
      }
    }
  }
}
/**
 * Create a filter configuration specifically for Conditional nodes
 */
export function createConditionalNodeFilter(): ASTNodeWhitelistFilter {
  const config: ASTNodeWhitelistConfig = {
    allowedNodeTypes: new Set([)
      // Basic expression types
      'Literal',
      'Identifier',
      'BinaryExpression',
      'UnaryExpression',
      'LogicalExpression',
      'ConditionalExpression',
      'MemberExpression',
      'CallExpression',
      // Allow basic program structure (needed for parsing)
      'Program',
      'ExpressionStatement'
    ]),
    restrictedNodeTypes: new Set([)
      // These could be allowed with additional validation
      'ArrayExpression',
      'ObjectExpression',
      'Property'
    ]),
    dangerousNodeTypes: new Set([)
      // Definitely not allowed
      'FunctionExpression',
      'ArrowFunctionExpression',
      'FunctionDeclaration',
      'VariableDeclaration',
      'AssignmentExpression',
      'UpdateExpression',
      'NewExpression',
      'ThisExpression',
      'Super',
      'MetaProperty',
      'AwaitExpression',
      'YieldExpression',
      'ClassExpression',
      'ClassDeclaration',
      'MethodDefinition',
      'ImportDeclaration',
      'ExportDeclaration',
      'ForStatement',
      'WhileStatement',
      'DoWhileStatement',
      'IfStatement',
      'SwitchStatement',
      'TryStatement',
      'ThrowStatement',
      'ReturnStatement',
      'BreakStatement',
      'ContinueStatement',
      'WithStatement',
      'LabeledStatement',
      'BlockStatement',
      'EmptyStatement',
      'DebuggerStatement'
    ]),
    maxDepth: 20,
    maxNodes: 100,
  };
  return new ASTNodeWhitelistFilter(config);
}
/**
 * Create a more permissive filter for general expression evaluation
 */
export function createGeneralExpressionFilter(): ASTNodeWhitelistFilter {
  const config: ASTNodeWhitelistConfig = {
    allowedNodeTypes: new Set([)
      'Literal',
      'Identifier', 
      'BinaryExpression',
      'UnaryExpression',
      'LogicalExpression',
      'ConditionalExpression',
      'MemberExpression',
      'CallExpression',
      'ArrayExpression',
      'ObjectExpression',
      'Property',
      'Program',
      'ExpressionStatement'
    ]),
    restrictedNodeTypes: new Set([]),
    dangerousNodeTypes: new Set([)
      'FunctionExpression',
      'ArrowFunctionExpression', 
      'FunctionDeclaration',
      'VariableDeclaration',
      'AssignmentExpression',
      'UpdateExpression',
      'NewExpression',
      'ThisExpression'
    ]),
    maxDepth: 30,
    maxNodes: 200,
  };
  return new ASTNodeWhitelistFilter(config);
}