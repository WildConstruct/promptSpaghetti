// packages/core/runtime/types.ts
// Base types for runtime system to avoid circular dependencies

}
export interface ExecutionContext {
  variables: Record<string, any>;
  seed: string | number;
}
}
export abstract class RuntimeNode<TOutput = unknown> {
  constructor(public id: string) {}

  /**
   * Execute this node and return its output. May mutate context.
   */
  abstract run(ctx: ExecutionContext): Promise<TOutput> | TOutput;
