export interface ExecutionContext {
    variables: Record<string, any>;
    seed: string | number;

export declare abstract class RuntimeNode<TOutput = unknown> {
    id: string;
    constructor(id: string);
    /**
     * Execute this node and return its output. May mutate context.
     */
    abstract run(ctx: ExecutionContext): Promise<TOutput> | TOutput;

//# sourceMappingURL=types.d.ts.map
}
}
}