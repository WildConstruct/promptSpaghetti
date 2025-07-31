import { AdvancedRuntimeNode, AdvancedExecutionContext, AdvancedNodeData, ValidationResult } from '../advanced';
/**
 * A conditional branch with condition expression and output value
 */

}
export interface ConditionalBranch {
    /** JavaScript-like expression to evaluate (e.g., "variable > 5", "hasFlag('debug')") */
    condition: string;
    /** Output value when condition is true */
    output: string;
    /** Optional label for UI display */
    label?: string;


/**
 * Configuration for conditional evaluation
 */

}
export interface ConditionalConfig {
    /** Whether to allow access to execution context variables */
    allowVariableAccess?: boolean;
    /** Whether to enable strict mode (throws on undefined variables) */
    strictMode?: boolean;
    /** Custom functions available in expressions */
    customFunctions?: Record<string, (...args: unknown[]) => any>;


/**
 * Advanced conditional node with expression-based branching logic
 * Supports multiple conditions, variable access, and custom functions
 */
export declare class ConditionalNode extends AdvancedRuntimeNode<string> {
    private ioHandler;
    private branches;
    private defaultOutput;
    private conditionalConfig;
    constructor(id: string, branches?: ConditionalBranch[], defaultOutput?: string, config?: ConditionalConfig);
    /**
     * Execute conditional logic by evaluating expressions in order
     */
    run(ctx: AdvancedExecutionContext): string;
    /**
     * Comprehensive validation of conditional configuration
     */
    validate(): ValidationResult;
    /**
     * Serialize node data for persistence
     */
    serialize(): AdvancedNodeData;
    /**
     * Get effective branches from constructor data or dynamic inputs
     */
    private getEffectiveBranches;
    /**
     * Evaluate a condition expression against the execution context
     */
    private evaluateCondition;
    /**
     * Create a safe evaluation context with variables and functions
     */
    private createEvaluationContext;
    /**
     * Safely evaluate an expression with limited scope
     */
    private safeEvaluate;
    /**
     * Sanitize expression to prevent dangerous operations
     */
    private sanitizeExpression;

/**
 * Factory function for creating Conditional nodes
 */
export declare function createConditionalNode(id: string, branches: ConditionalBranch[], defaultOutput?: string, config?: ConditionalConfig): ConditionalNode;
/**
 * Common condition patterns for easy setup
 */
/**
 * Utility for building complex conditional branches
 */
export declare class ConditionalBuilder {
    private branches;
    private defaultOutput;
    if(condition: string, output: string, label?: string): ConditionalBuilder;
    elseIf(condition: string, output: string, label?: string): ConditionalBuilder;
    else(output: string): ConditionalBuilder;
    build(id: string, config?: ConditionalConfig): ConditionalNode;
    getBranches(): ConditionalBranch[];
    getDefaultOutput(): string;

/**
 * Fluent API for building conditional nodes
 */
export declare function conditional(_______id: string): ConditionalBuilder;
//# sourceMappingURL=Conditional.d.ts.map
}