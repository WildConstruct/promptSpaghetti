# GeneratorBundle Import

This document describes the GeneratorBundle import functionality for the PromptScape Graph project.

## Overview

The `bundleToGraph` function in `server/src/exporter.ts` provides bidirectional conversion between the GeneratorBundle format used by the Randomizer Engine and the Graph format used by the PromptScape Graph editor. This allows users to import legacy bundles into the new graph-based editor.

## Usage

```typescript
import { bundleToGraph } from '../server/src/exporter';

// Parse bundle from JSON
const bundleJson = JSON.parse(fs.readFileSync('legacy-bundle.json', 'utf8'));

// Convert to Graph format
const graph = bundleToGraph(bundleJson);
```

## Capabilities

The importer can convert the following GeneratorBundle elements to Graph nodes:

| GeneratorBundle Element | Graph Node Type      |
| ----------------------- | -------------------- |
| Variables               | SetVariable nodes    |
| Weighted array rules    | WeightedChoice nodes |
| Sequential rules        | Concat nodes         |
| Include rules           | Include nodes        |
| Entry points            | Output nodes         |

## Known Limitations

The current implementation has several limitations when importing complex bundles:

1. **Conditional Rules**:
   - Conditional rules are converted to WeightedChoice nodes with equal weights
   - The actual conditions are not preserved or evaluated
   - Complex conditional logic is simplified

2. **Modifier Chains**:
   - Modifier chains are simplified to Concat nodes
   - Actual modifiers like uppercase/lowercase are not implemented

3. **Complex References**:
   - Variable references inside strings (e.g., `"Hello ${name}"`) are not fully parsed
   - They will need manual adjustment after import

4. **Nested Structures**:
   - Deeply nested rule structures might not be perfectly preserved
   - Round-trip conversion works best with simpler structures

5. **Specialized Rule Types**:
   - Some specialized rule types in complex bundles may be approximated
   - The graph editor currently supports a subset of the full GeneratorBundle capabilities

## Round-Trip Conversion

The implementation ensures that simple graphs can be round-tripped (graph → bundle → graph) without losing structure or connectivity. However, complex features not directly supported by the graph editor's node types may be simplified during the import process.

## Error Handling

- Invalid bundles are rejected with clear error messages
- Missing entry points are handled by creating default output nodes
- The importer will try to establish connections even if the structure doesn't perfectly match
