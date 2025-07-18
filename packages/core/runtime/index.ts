// packages/core/runtime/index.ts
// Runtime node classes for deterministic graph execution.
// Each class exposes an async `run` method that takes input/context
// and returns output plus possibly mutated context.
// These are thin stubs for now; they will be fully implemented in later tasks.

export interface ExecutionContext {
  variables: Record<string, any>;
  seed: string | number;
}

export abstract class RuntimeNode<TOutput = unknown> {
  constructor(public id: string) {}

  /**
   * Execute this node and return its output. May mutate context.
   */
  abstract run(ctx: ExecutionContext): Promise<TOutput> | TOutput;
}

/* ------------------------- Core node runtimes ------------------------- */

export class WeightedChoiceNode extends RuntimeNode<string> {
  constructor(id: string, private choices: Array<{ value: string; weight: number }>) {
    super(id);
  }

  run(ctx: ExecutionContext): string {
    const total = this.choices.reduce((sum, c) => sum + c.weight, 0);
    let r = seededRandom(ctx.seed) * total;
    for (const c of this.choices) {
      if (r < c.weight) return c.value;
      r -= c.weight;
    }
    return this.choices[this.choices.length - 1].value;
  }
}

export class ConcatNode extends RuntimeNode<string> {
  constructor(id: string, private inputs: string[]) {
    super(id);
  }

  run(): string {
    return this.inputs.join('');
  }
}

export class OutputNode extends RuntimeNode<string> {
  constructor(id: string, private input: string) {
    super(id);
  }

  run(): string {
    return this.input;
  }
}

export class IncludeNode extends RuntimeNode<string> {
  constructor(id: string, private name: string, private lookup: Record<string, string>) {
    super(id);
  }

  run(ctx: ExecutionContext): string {
    // Security: Validate lookup object and key
    if (!this.lookup || typeof this.lookup !== 'object') {
      return ctx.variables['defaultText'] || '';
    }
    
    // Security: Prevent prototype pollution and dangerous property access
    if (this.name.includes('__proto__') || 
        this.name.includes('constructor') || 
        this.name.includes('prototype') ||
        !Object.prototype.hasOwnProperty.call(this.lookup, this.name)) {
      return ctx.variables['defaultText'] || '';
    }
    
    const result = this.lookup[this.name];
    
    // Security: Ensure result is a safe string
    if (typeof result !== 'string') {
      return ctx.variables['defaultText'] || '';
    }
    
    return result;
  }
}

export class SetVariableNode extends RuntimeNode<void> {
  constructor(id: string, private key: string, private value: any) {
    super(id);
  }

  run(ctx: ExecutionContext): void {
    // Security: Validate key for dangerous patterns
    if (this.key.includes('__proto__') || 
        this.key.includes('constructor') || 
        this.key.includes('prototype') ||
        typeof this.key !== 'string' ||
        this.key.length === 0) {
      return; // Silently ignore dangerous keys
    }
    
    // Security: Validate value is safe
    if (this.value === null || this.value === undefined) {
      ctx.variables[this.key] = this.value;
      return;
    }
    
    // Only allow safe primitive types and simple objects/arrays
    const valueType = typeof this.value;
    if (valueType === 'string' || valueType === 'number' || valueType === 'boolean') {
      ctx.variables[this.key] = this.value;
    } else if (Array.isArray(this.value)) {
      // Deep clone to prevent reference pollution
      ctx.variables[this.key] = JSON.parse(JSON.stringify(this.value));
    } else if (valueType === 'object') {
      // Deep clone to prevent reference pollution
      ctx.variables[this.key] = JSON.parse(JSON.stringify(this.value));
    } else {
      // Reject functions and other dangerous types
      return;
    }
  }
}

export class GetVariableNode extends RuntimeNode<any> {
  constructor(id: string, private key: string) {
    super(id);
  }

  run(ctx: ExecutionContext): any {
    // Security: Validate key for dangerous patterns
    if (this.key.includes('__proto__') || 
        this.key.includes('constructor') || 
        this.key.includes('prototype') ||
        typeof this.key !== 'string' ||
        this.key.length === 0) {
      return undefined; // Return undefined for dangerous keys
    }
    
    // Security: Only return value if it exists as own property
    if (!Object.prototype.hasOwnProperty.call(ctx.variables, this.key)) {
      return undefined;
    }
    
    return ctx.variables[this.key];
  }
}

/* ----------------------------- Utilities ------------------------------ */

import seedrandom from 'seedrandom';

function seededRandom(seed: string | number): number {
  return seedrandom(String(seed))();
}

/* ----------------------------- Advanced Nodes (Epic 7) ------------------------------ */

// Re-export all advanced node capabilities
export * from './advanced';

/* ----------------------------- Python Integration (Epic 8) ------------------------------ */

// Re-export Python integration capabilities
export * from './nodes/PythonTransform';
