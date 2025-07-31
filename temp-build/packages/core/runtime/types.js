// packages/core/runtime/types.ts
// Base types for runtime system to avoid circular dependencies
export class RuntimeNode {
  constructor(id) {
    this.id = id;
  }
}
