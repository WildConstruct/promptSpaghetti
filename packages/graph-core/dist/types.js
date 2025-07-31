/**
 * Core types for graph-core package
 * Extracted from existing packages/core for Epic 15 cross-platform support
 */
import { z } from 'zod';
// Re-export node type definitions from existing schema
export const NodeTypeEnum = z.enum([
  'WeightedChoice',
  'Concat',
  'Output',
  'Include',
  'SetVariable',
  'GetVariable',
  // Epic 7 Advanced Node Types
  'WeightedAdvanced',
  'Conditional',
  'Sequential',
  'Markov',
  // Epic 8 Python Integration
  'PythonTransform',
]);
// Abstract base for runtime nodes
export class RuntimeNode {
  id;
  constructor(id) {
    this.id = id;
  }
}
//# sourceMappingURL=types.js.map
