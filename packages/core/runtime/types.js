// packages/core/runtime/types.ts
// Base types for runtime system to avoid circular dependencies

// ExecutionContext interface (interfaces don't exist in compiled JS but we need the export for imports)
export const ExecutionContext = null; // Placeholder for interface

export class RuntimeNode {
    id;
    constructor(id) {
        this.id = id;
    }
}
