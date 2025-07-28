import { AdvancedRuntimeNode, AdvancedNodeConfig } from '../advanced';
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
export interface ConditionalConfig {
    /** Whether to allow access to execution context variables */
    allowVariableAccess?: boolean;
    /** Whether to enable strict mode (throws on undefined variables) */
    strictMode?: boolean;
    /** Custom functions available in expressions */
    customFunctions?: Record<string, (...args: unknown) => any>;
}
export declare class ConditionalNode extends AdvancedRuntimeNode<string> {
    private ioHandler;
    private branches;
    private defaultOutput;
    private conditionalConfig;
    constructor();
    id: string;
    branches: ConditionalBranch;
    defaultOutput: string;
    config: ConditionalConfig;
    const nodeConfig: AdvancedNodeConfig;
    id: 'outputs';
    label: 'Condition Outputs';
    dataType: 'stringArray';
    required: false;
    defaultValue: [];
    description: 'Array of outputs corresponding to conditions';
}
//# sourceMappingURL=Conditional.d.ts.map