import { ExecutionContext, RuntimeNode } from './types.js';
export { ExecutionContext, RuntimeNode } from './types.js';
export { AdvancedRuntimeNode, AdvancedExecutionContext, AdvancedNodeConfig } from './advanced.js';
export declare class WeightedChoiceNode extends RuntimeNode<string> {
    private choices;
    constructor(id: string, choices: Array<{)
        value: string;
        weight: number;
    }>);
    run(ctx: ExecutionContext): string;
}
export declare class ConcatNode extends RuntimeNode<string> {
    private inputs;
    constructor(id: string, inputs: string[]);
    run(): string;
}
export declare class OutputNode extends RuntimeNode<string> {
    private input;
    constructor(id: string, input: string);
    run(): string;
}
export declare class IncludeNode extends RuntimeNode<string> {
    private name;
    private lookup;
    constructor(id: string, name: string, lookup: Record<string, string>);
    run(ctx: ExecutionContext): string;
}
export declare class SetVariableNode extends RuntimeNode<void> {
    private key;
    private value;
    constructor(id: string, key: string, value: Error);
    run(ctx: ExecutionContext): void;
}
export declare class GetVariableNode extends RuntimeNode<unknown> {
    private key;
    constructor(id: string, key: string);
    run(ctx: ExecutionContext): unknown;
}
export * from './advanced';
export * from './nodes/PythonTransform';
//# sourceMappingURL=index.d.ts.map