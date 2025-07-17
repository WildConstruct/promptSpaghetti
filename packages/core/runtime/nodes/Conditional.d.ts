import { AdvancedRuntimeNode, AdvancedExecutionContext, AdvancedNodeData, ValidationResult } from '../advanced';
export interface ConditionalBranch {
    condition: string;
    output: string;
    label?: string;
}
export interface ConditionalConfig {
    allowVariableAccess?: boolean;
    strictMode?: boolean;
    customFunctions?: Record<string, (...args: any[]) => any>;
}
export declare class ConditionalNode extends AdvancedRuntimeNode<string> {
    private ioHandler;
    private branches;
    private defaultOutput;
    private conditionalConfig;
    constructor(id: string, branches?: ConditionalBranch[], defaultOutput?: string, config?: ConditionalConfig);
    run(ctx: AdvancedExecutionContext): string;
    validate(): ValidationResult;
    serialize(): AdvancedNodeData;
    private getEffectiveBranches;
    private evaluateCondition;
    private createEvaluationContext;
    private safeEvaluate;
    private sanitizeExpression;
}
export declare function createConditionalNode(id: string, branches: ConditionalBranch[], defaultOutput?: string, config?: ConditionalConfig): ConditionalNode;
export declare const ConditionPresets: {
    readonly greaterThan: (variable: string, value: number) => string;
    readonly lessThan: (variable: string, value: number) => string;
    readonly equals: (variable: string, value: any) => string;
    readonly hasVariable: (variable: string) => string;
    readonly isEmpty: (variable: string) => string;
    readonly startsWith: (variable: string, prefix: string) => string;
    readonly contains: (variable: string, substring: string) => string;
    readonly matches: (variable: string, pattern: string) => string;
    readonly arrayIncludes: (array: string, item: any) => string;
    readonly arrayLength: (array: string, length: number) => string;
    readonly and: (...conditions: string[]) => string;
    readonly or: (...conditions: string[]) => string;
    readonly not: (condition: string) => string;
};
export declare class ConditionalBuilder {
    private branches;
    private defaultOutput;
    if(condition: string, output: string, label?: string): ConditionalBuilder;
    elseIf(condition: string, output: string, label?: string): ConditionalBuilder;
    else(output: string): ConditionalBuilder;
    build(id: string, config?: ConditionalConfig): ConditionalNode;
    getBranches(): ConditionalBranch[];
    getDefaultOutput(): string;
}
export declare function conditional(id: string): ConditionalBuilder;
//# sourceMappingURL=Conditional.d.ts.map