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
    'PythonTransform'
]);
// Base node schema for cross-platform compatibility
export const BaseNodeSchema = z.object({
    id: z.string(),
    type: NodeTypeEnum,
    inputs: z.array(z.string()).optional() // ids of upstream nodes (ordered)
});
// Abstract base for runtime nodes
export class RuntimeNode {
    id;
    constructor(id) {
        this.id = id;
    }
}
//# sourceMappingURL=types.js.map