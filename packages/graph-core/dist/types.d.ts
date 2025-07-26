/**
 * Core types for graph-core package
 * Extracted from existing packages/core for Epic 15 cross-platform support
 */
import { z } from 'zod';
export declare const NodeTypeEnum: z.ZodEnum<["WeightedChoice", "Concat", "Output", "Include", "SetVariable", "GetVariable", "WeightedAdvanced", "Conditional", "Sequential", "Markov", "PythonTransform"]>;
export type NodeType = z.infer<typeof NodeTypeEnum>;
export declare     constructor(id: string);
    /**
     * Execute this node and return its output. May mutate context.
     */
    abstract run(ctx: ExecutionContext): Promise<TOutput> | TOutput;
}
export interface WeightedChoice {
    value: string;
    weight: number;
}
//# sourceMappingURL=types.d.ts.map