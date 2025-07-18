/**
 * Core types for graph-core package
 * Extracted from existing packages/core for Epic 15 cross-platform support
 */
import { z } from 'zod';
export declare const NodeTypeEnum: z.ZodEnum<["WeightedChoice", "Concat", "Output", "Include", "SetVariable", "GetVariable", "WeightedAdvanced", "Conditional", "Sequential", "Markov", "PythonTransform"]>;
export type NodeType = z.infer<typeof NodeTypeEnum>;
export declare const BaseNodeSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodEnum<["WeightedChoice", "Concat", "Output", "Include", "SetVariable", "GetVariable", "WeightedAdvanced", "Conditional", "Sequential", "Markov", "PythonTransform"]>;
    inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: "WeightedChoice" | "Concat" | "Output" | "Include" | "SetVariable" | "GetVariable" | "WeightedAdvanced" | "Conditional" | "Sequential" | "Markov" | "PythonTransform";
    inputs?: string[] | undefined;
}, {
    id: string;
    type: "WeightedChoice" | "Concat" | "Output" | "Include" | "SetVariable" | "GetVariable" | "WeightedAdvanced" | "Conditional" | "Sequential" | "Markov" | "PythonTransform";
    inputs?: string[] | undefined;
}>;
export interface ExecutionContext {
    variables: Record<string, any>;
    seed: string | number;
    [key: string]: any;
}
export interface AdvancedExecutionContext extends ExecutionContext {
    nodeStates: Map<string, any>;
    evaluationDepth: number;
    performanceCache: Map<string, any>;
    executionTrace: string[];
}
export interface GraphDocument {
    id: string;
    nodes: Map<string, GraphNode>;
    edges: Map<string, GraphEdge>;
    metadata: GraphMetadata;
    seed?: string | number;
}
export interface GraphNode {
    id: string;
    type: NodeType;
    position?: {
        x: number;
        y: number;
    };
    data: Record<string, any>;
    inputs?: string[];
}
export interface GraphEdge {
    id: string;
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
}
export interface GraphMetadata {
    version: string;
    created: Date;
    modified: Date;
    author?: string;
    platform?: 'web' | 'mobile' | 'desktop';
}
export interface ExecutionResult {
    success: boolean;
    outputs: string[];
    error?: string;
    metadata: {
        executionTime: number;
        seed?: number | string;
        nodeCount: number;
        executionId: string;
    };
}
export declare abstract class RuntimeNode<TOutput = unknown> {
    id: string;
    constructor(id: string);
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