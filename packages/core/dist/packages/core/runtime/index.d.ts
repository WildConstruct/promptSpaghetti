import { RuntimeNode } from './types.js';
export { ExecutionContext, RuntimeNode } from './types.js';
export { AdvancedRuntimeNode, AdvancedExecutionContext, AdvancedNodeConfig } from './advanced.js';
export declare class WeightedChoiceNode extends RuntimeNode<string> {
    private choices;
    constructor(id: string, choices: Array<{
        value: string;
        weight: number;
    }>);
}
//# sourceMappingURL=index.d.ts.map