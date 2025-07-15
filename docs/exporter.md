# Graph to GeneratorBundle Exporter

This document describes the Graph to GeneratorBundle exporter implementation in the PromptScape Graph project.

## Overview

The exporter (`server/src/exporter.ts`) transforms the internal graph representation used by the editor into the GeneratorBundle format required by the Randomizer Engine. This enables interoperability between the new graph-based editor and the existing Randomizer Engine.

## Architecture

### Schema Definition

The implementation defines a comprehensive Zod schema for the GeneratorBundle format:

```typescript
export const GeneratorBundleSchema = z.object({
  metadata: z.object({
    name: z.string(),
    version: z.string(), // semver
    author: z.string(),
    created: z.string(), // ISO-8601 date
    debug: z.object({...}).optional(),
  }),
  variables: z.record(z.string(), z.unknown()),
  grammar: z.record(z.string(), z.union([
    // Various rule types...
  ])),
  entry_points: z.object({
    default: z.string(),
    alternatives: z.array(z.string()).optional(),
  }),
  // ...
});
```

### Conversion Process

The `graphToBundle` function is the main entry point:

```typescript
export function graphToBundle(
  graph: Graph, 
  options: {
    name: string;
    version?: string;
    author?: string;
  }
): GeneratorBundle {
  // ...
}
```

The conversion process follows these steps:

1. **Initialize Bundle with Metadata**: Creates the metadata section with user-provided or default values
2. **Extract Variables and Map Nodes**: Builds a map of all nodes and extracts variable definitions
3. **Create Grammar Rules**: Converts each node to its corresponding rule format in the grammar
4. **Set Entry Points**: Determines entry points based on output nodes

### Node Type Mappings

Each node type has a specific conversion pattern:

| Graph Node Type | GeneratorBundle Rule Type | Notes |
|----------------|---------------------------|-------|
| WeightedChoice | Weighted Array Rule | Maps choices to array items with weights |
| Concat | Sequential Rule | Creates a rule with references to inputs |
| Output | Simple Array Rule | References input node as content |
| Include | Include Rule | Creates `$include` reference |
| SetVariable | (Side effect) | Captured in variables section |
| GetVariable | Variable Reference | Creates reference to variable |

### Validation

A `validateGeneratorBundle` function is provided to verify bundle validity against the schema:

```typescript
export function validateGeneratorBundle(bundle: any): boolean {
  try {
    GeneratorBundleSchema.parse(bundle);
    return true;
  } catch (error) {
    return false;
  }
}
```

## Usage Examples

### Basic Usage

```typescript
import { graphToBundle } from '../server/src/exporter';

const graph = {
  seed: 123,
  nodes: [
    // Node definitions...
  ]
};

const bundle = graphToBundle(graph, {
  name: 'My Generated Bundle',
  version: '1.0.0',
  author: 'PromptScape User'
});
```

### Validation

```typescript
import { validateGeneratorBundle } from '../server/src/exporter';

const isValid = validateGeneratorBundle(myBundle);
if (!isValid) {
  console.error('Bundle validation failed');
}
```

## Design Decisions

1. **ID Preservation**: Node IDs are maintained as grammar rule keys for traceability
2. **Default Values**: Sensible defaults provided for optional metadata fields
3. **Output Priority**: First output node becomes the default entry point
4. **Variable Handling**: Variables extracted and stored in a dedicated section
5. **Defensive Coding**: Edge cases handled gracefully with empty strings as fallbacks

## Testing

The exporter has comprehensive tests covering:

1. **Standard Conversion**: Complete graph with all node types
2. **Validation**: Handling of invalid bundle structures
3. **Edge Cases**: Graphs with empty nodes or missing inputs

Tests are located in `server/src/__tests__/exporter.test.ts` and can be run with:

```bash
npm test -- server/src/__tests__/exporter.test.ts
```

## Limitations

- Variable references are currently implemented as string tokens (`$variableName`) rather than using dynamic template syntax
- Complex conditional rules require manual post-processing
- Multi-level includes might require additional handling in complex scenarios
