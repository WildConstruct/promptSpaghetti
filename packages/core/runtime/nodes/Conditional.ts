// packages/core/runtime/nodes/Conditional.ts
// Advanced conditional node with expression-based branching

import { 
  AdvancedRuntimeNode, 
  AdvancedExecutionContext, 
  AdvancedNodeConfig,
  AdvancedNodeData,
  ValidationResult,
  ValidationHelpers 
} from '../advanced';
import { 
  AdvancedIOHandler,
  IOSpecBuilder,
  TypedInputs 
} from '../io-system';

/**
 * A conditional branch with condition expression and output value
 */
export interface ConditionalBranch {
  /** JavaScript-like expression to evaluate (e.g., "variable > 5", "hasFlag('debug')") */
  condition: string;
  /** Output value when condition is true */
  output: string;
  /** Optional label for UI display */
  label?: string;
}

/**
 * Configuration for conditional evaluation
 */
export interface ConditionalConfig {
  /** Whether to allow access to execution context variables */
  allowVariableAccess?: boolean;
  /** Whether to enable strict mode (throws on undefined variables) */
  strictMode?: boolean;
  /** Custom functions available in expressions */
  customFunctions?: Record<string, (...args: any[]) => any>;
}

/**
 * Advanced conditional node with expression-based branching logic
 * Supports multiple conditions, variable access, and custom functions
 */
export class ConditionalNode extends AdvancedRuntimeNode<string> {
  private ioHandler: AdvancedIOHandler;
  private branches: ConditionalBranch[];
  private defaultOutput: string;
  private conditionalConfig: ConditionalConfig;

  constructor(
    id: string, 
    branches: ConditionalBranch[] = [],
    defaultOutput: string = '',
    config: ConditionalConfig = {}
  ) {
    // Configure as deterministic, non-cacheable (depends on variables), stateless
    const nodeConfig: AdvancedNodeConfig = {
      deterministic: true,
      cacheable: false, // Don't cache since output depends on variable state
      stateful: false,
      performanceHints: {
        expectedExecutionTime: 'fast',
        memoryUsage: 'low'
      }
    };

    super(id, nodeConfig);
    this.branches = branches;
    this.defaultOutput = defaultOutput;
    this.conditionalConfig = {
      allowVariableAccess: true,
      strictMode: false,
      customFunctions: {},
      ...config
    };
    
    // Set up I/O specification
    const ioSpec = new IOSpecBuilder()
      .addInput({
        id: 'conditions',
        label: 'Condition Expressions',
        dataType: 'array',
        required: false,
        defaultValue: [],
        description: 'Array of condition expressions to evaluate'
      })
      .addInput({
        id: 'outputs',
        label: 'Condition Outputs',
        dataType: 'stringArray',
        required: false,
        defaultValue: [],
        description: 'Array of outputs corresponding to conditions'
      })
      .addInput({
        id: 'default',
        label: 'Default Output',
        dataType: 'string',
        required: false,
        defaultValue: '',
        description: 'Default output when no conditions match'
      })
      .addTextOutput('result', 'Conditional Result')
      .build();

    this.ioHandler = new AdvancedIOHandler(ioSpec);
  }

  /**
   * Execute conditional logic by evaluating expressions in order
   */
  run(ctx: AdvancedExecutionContext): string {
    // Record this node's execution
    ctx.executionMeta.nodeExecutionOrder.push(this.id);
    
    // Use performance tracking for conditional evaluation
    return this.measureExecution(ctx, 'conditional-evaluation', () => {
      // Get effective branches (from constructor or dynamic inputs)
      const effectiveBranches = this.getEffectiveBranches(ctx);
      
      // Evaluate each condition in order
      for (const branch of effectiveBranches) {
        try {
          const conditionResult = this.evaluateCondition(branch.condition, ctx);
          if (conditionResult) {
            return branch.output;
          }
        } catch (error) {
          // Always re-throw security-related errors regardless of strict mode
          const errorMessage = error instanceof Error ? error.message : String(error);
          if (errorMessage.includes('Dangerous pattern detected')) {
            throw error;
          }
          
          // In non-strict mode, treat evaluation errors as false
          if (this.conditionalConfig.strictMode) {
            throw new Error(`Condition evaluation failed: ${branch.condition} - ${error}`);
          }
          // Continue to next condition
        }
      }
      
      // No conditions matched, return default
      return this.defaultOutput;
    });
  }

  /**
   * Comprehensive validation of conditional configuration
   */
  validate(): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate branches
    if (this.branches.length === 0) {
      warnings.push('No conditional branches configured - will always return default output');
    }

    // Validate individual branches
    this.branches.forEach((branch, index) => {
      if (!branch.condition || branch.condition.trim() === '') {
        errors.push(`Branch ${index} has empty condition`);
      }
      
      if (branch.output === undefined || branch.output === null) {
        warnings.push(`Branch ${index} has undefined output`);
      }

      // Basic syntax validation for common patterns
      const condition = branch.condition.trim();
      if (condition.includes('==')) {
        warnings.push(`Branch ${index}: Consider using '===' instead of '==' for strict equality`);
      }

      // Check for potentially dangerous expressions
      if (condition.includes('eval(') || condition.includes('Function(')) {
        errors.push(`Branch ${index}: Dangerous expression detected - eval/Function not allowed`);
      }
    });

    // Validate default output
    if (this.defaultOutput === undefined || this.defaultOutput === null) {
      warnings.push('Default output is undefined - consider providing a fallback value');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Serialize node data for persistence
   */
  serialize(): AdvancedNodeData {
    return {
      id: this.id,
      type: 'Conditional',
      config: this.getConfig(),
      data: {
        branches: this.branches,
        defaultOutput: this.defaultOutput,
        conditionalConfig: this.conditionalConfig
      },
      metadata: {
        version: '1.0.0',
        created: new Date().toISOString()
      }
    };
  }

  /**
   * Get effective branches from constructor data or dynamic inputs
   */
  private getEffectiveBranches(ctx: AdvancedExecutionContext): ConditionalBranch[] {
    // For now, use constructor branches
    // In full implementation, would merge with dynamic inputs from I/O system
    return this.branches;
  }

  /**
   * Evaluate a condition expression against the execution context
   */
  private evaluateCondition(expression: string, ctx: AdvancedExecutionContext): boolean {
    try {
      // Create a safe evaluation context
      const evalContext = this.createEvaluationContext(ctx);
      
      // Parse and evaluate the expression
      const result = this.safeEvaluate(expression, evalContext);
      
      // Convert result to boolean
      return Boolean(result);
    } catch (error) {
      // Always re-throw security-related errors regardless of strict mode
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('Dangerous pattern detected') || errorMessage.includes('Expression evaluation failed')) {
        throw error;
      }
      
      if (this.conditionalConfig.strictMode) {
        throw error;
      }
      // In non-strict mode, log the error for debugging but return false
      return false;
    }
  }

  /**
   * Create a safe evaluation context with variables and functions
   */
  private createEvaluationContext(ctx: AdvancedExecutionContext): Record<string, any> {
    const evalContext: Record<string, any> = {};

    // Add variables if allowed
    if (this.conditionalConfig.allowVariableAccess) {
      // Add all variables from execution context
      Object.assign(evalContext, ctx.variables);
      
      // Add convenience functions
      evalContext.hasVariable = (name: string) => name in ctx.variables;
      evalContext.getVariable = (name: string, defaultValue?: any) => 
        ctx.variables[name] !== undefined ? ctx.variables[name] : defaultValue;
    }

    // Add custom functions
    Object.assign(evalContext, this.conditionalConfig.customFunctions);

    // Add safe utility functions (avoid reserved keywords)
    evalContext.getType = (value: any) => typeof value; // 'typeof' is reserved
    const lengthFn = (value: any) => value?.length ?? 0;
    evalContext.len = lengthFn; // short name to avoid 'length' property conflict  
    evalContext.length = lengthFn; // backward compatibility
    evalContext.isEmpty = (value: any) => !value || value.length === 0;
    evalContext.includes = (value: any, item: any) => {
      if (typeof value === 'string') {
        return String(value).includes(String(item));
      } else if (Array.isArray(value)) {
        return value.includes(item);
      }
      return false;
    };
    evalContext.startsWith = (str: string, prefix: string) => String(str).startsWith(String(prefix));
    evalContext.endsWith = (str: string, suffix: string) => String(str).endsWith(String(suffix));
    evalContext.matches = (str: string, pattern: string) => new RegExp(pattern).test(String(str));

    return evalContext;
  }

  /**
   * Safely evaluate an expression with limited scope
   */
  private safeEvaluate(expression: string, context: Record<string, any>): any {
    // Sanitize the expression
    const sanitizedExpression = this.sanitizeExpression(expression);
    
    // Create a function with the context variables as parameters
    const paramNames = Object.keys(context);
    const paramValues = paramNames.map(name => context[name]);
    
    try {
      // Use Function constructor with controlled scope
      const func = new Function(...paramNames, `return (${sanitizedExpression});`);
      return func(...paramValues);
    } catch (error) {
      throw new Error(`Expression evaluation failed: ${expression} - ${error}`);
    }
  }

  /**
   * Sanitize expression to prevent dangerous operations
   */
  private sanitizeExpression(expression: string): string {
    // Remove dangerous patterns
    const dangerous = [
      /eval\s*\(/gi,
      /Function\s*\(/gi,
      /constructor/gi,
      /prototype/gi,
      /__proto__/gi,
      /import\s*\(/gi,
      /require\s*\(/gi,
      /process\./gi,
      /global\./gi,
      /window\./gi,
      /document\./gi
    ];

    let sanitized = expression;
    for (const pattern of dangerous) {
      if (pattern.test(sanitized)) {
        throw new Error(`Dangerous pattern detected in expression: ${expression}`);
      }
    }
    return sanitized;
  }
}

/**
 * Factory function for creating Conditional nodes
 */
export function createConditionalNode(
  id: string,
  branches: ConditionalBranch[],
  defaultOutput?: string,
  config?: ConditionalConfig
): ConditionalNode {
  return new ConditionalNode(id, branches, defaultOutput, config);
}

/**
 * Common condition patterns for easy setup
 */
export const ConditionPresets = {
  /** Simple variable comparison */
  greaterThan: (variable: string, value: number) => `${variable} > ${value}`,
  lessThan: (variable: string, value: number) => `${variable} < ${value}`,
  equals: (variable: string, value: any) => `${variable} === ${JSON.stringify(value)}`,
  
  /** Variable existence checks */
  hasVariable: (variable: string) => `hasVariable('${variable}')`,
  isEmpty: (variable: string) => `isEmpty(${variable})`,
  
  /** String operations */
  startsWith: (variable: string, prefix: string) => `startsWith(${variable}, '${prefix}')`,
  contains: (variable: string, substring: string) => `${variable}.includes('${substring}')`,
  matches: (variable: string, pattern: string) => `matches(${variable}, '${pattern}')`,
  
  /** Array operations */
  arrayIncludes: (array: string, item: any) => `includes(${array}, ${JSON.stringify(item)})`,
  arrayLength: (array: string, length: number) => `length(${array}) === ${length}`,
  
  /** Logical combinations */
  and: (...conditions: string[]) => `(${conditions.join(') && (')})`,
  or: (...conditions: string[]) => `(${conditions.join(') || (')})`,
  not: (condition: string) => `!(${condition})`
} as const;

/**
 * Utility for building complex conditional branches
 */
export class ConditionalBuilder {
  private branches: ConditionalBranch[] = [];
  private defaultOutput: string = '';

  if(condition: string, output: string, label?: string): ConditionalBuilder {
    this.branches.push({ condition, output, label });
    return this;
  }

  elseIf(condition: string, output: string, label?: string): ConditionalBuilder {
    return this.if(condition, output, label);
  }

  else(output: string): ConditionalBuilder {
    this.defaultOutput = output;
    return this;
  }

  build(id: string, config?: ConditionalConfig): ConditionalNode {
    return new ConditionalNode(id, this.branches, this.defaultOutput, config);
  }

  getBranches(): ConditionalBranch[] {
    return this.branches;
  }

  getDefaultOutput(): string {
    return this.defaultOutput;
  }
}

/**
 * Fluent API for building conditional nodes
 */
export function conditional(id: string): ConditionalBuilder {
  return new ConditionalBuilder();
}