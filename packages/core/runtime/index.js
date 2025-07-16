// packages/core/runtime/index.ts
// Runtime node classes for deterministic graph execution.
// Each class exposes an async `run` method that takes input/context
// and returns output plus possibly mutated context.
// These are thin stubs for now; they will be fully implemented in later tasks.
export class RuntimeNode {
    id;
    constructor(id) {
        this.id = id;
    }
}
/* ------------------------- Core node runtimes ------------------------- */
export class WeightedChoiceNode extends RuntimeNode {
    choices;
    constructor(id, choices) {
        super(id);
        this.choices = choices;
    }
    run(ctx) {
        const total = this.choices.reduce((sum, c) => sum + c.weight, 0);
        let r = seededRandom(ctx.seed) * total;
        for (const c of this.choices) {
            if (r < c.weight)
                return c.value;
            r -= c.weight;
        }
        return this.choices[this.choices.length - 1].value;
    }
}
export class ConcatNode extends RuntimeNode {
    inputs;
    constructor(id, inputs) {
        super(id);
        this.inputs = inputs;
    }
    run() {
        return this.inputs.join('');
    }
}
export class OutputNode extends RuntimeNode {
    input;
    constructor(id, input) {
        super(id);
        this.input = input;
    }
    run() {
        return this.input;
    }
}
export class IncludeNode extends RuntimeNode {
    name;
    lookup;
    constructor(id, name, lookup) {
        super(id);
        this.name = name;
        this.lookup = lookup;
    }
    run() {
        return this.lookup[this.name];
    }
}
export class SetVariableNode extends RuntimeNode {
    key;
    value;
    constructor(id, key, value) {
        super(id);
        this.key = key;
        this.value = value;
    }
    run(ctx) {
        ctx.variables[this.key] = this.value;
    }
}
export class GetVariableNode extends RuntimeNode {
    key;
    constructor(id, key) {
        super(id);
        this.key = key;
    }
    run(ctx) {
        return ctx.variables[this.key];
    }
}
/* ----------------------------- Utilities ------------------------------ */
import seedrandom from 'seedrandom';
function seededRandom(seed) {
    return seedrandom(String(seed))();
}
/* ----------------------------- Advanced Nodes (Epic 7) ------------------------------ */
// Re-export all advanced node capabilities
export * from './advanced';
/* ----------------------------- Python Integration (Epic 8) ------------------------------ */
// Re-export Python integration capabilities
export * from './nodes/PythonTransform';
