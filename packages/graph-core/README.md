# @prompt-spaghetti/graph-core

Cross-platform graph execution engine with CRDT synchronization for Epic 15 - Cross-Platform Support.

## Overview

The `graph-core` package provides a pure TypeScript implementation of the graph execution engine, extracted and refactored from the server-side engine for cross-platform use. It includes CRDT (Conflict-free Replicated Data Type) integration using Yjs for real-time synchronization capabilities.

## Features

- **Cross-platform execution engine** - Pure TypeScript with no platform dependencies
- **CRDT synchronization** - Real-time collaboration using Yjs
- **Comprehensive validation** - Graph structure, cycle detection, and performance analysis
- **Deterministic execution** - Reproducible results with seeded random number generation
- **Template substitution** - Dynamic content generation with variable references
- **Serialization support** - Binary and JSON serialization for storage and transmission

## Installation

```bash
pnpm add @prompt-spaghetti/graph-core
```

## Core Components

### GraphEngine

The main execution engine for graph processing.

```typescript
import { GraphEngine } from '@prompt-spaghetti/graph-core';

const engine = new GraphEngine();

// Execute a graph with deterministic results
const result = await engine.execute(graph, 'seed-123');
console.log(result.outputs); // Generated text outputs

// Validate graph structure
const validation = engine.validate(graph);
if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
}

// Serialize for storage
const serialized = engine.serialize(graph);
const restored = engine.deserialize(serialized);
```

### GraphCRDT

CRDT-based graph synchronization for real-time collaboration.

```typescript
import { createGraphCRDT } from '@prompt-spaghetti/graph-core';

// Create CRDT instance
const crdt = createGraphCRDT();

// Add nodes and edges
crdt.addNode({
  id: 'node1',
  type: 'WeightedChoice',
  data: { choices: [{ value: 'Hello', weight: 1 }] }
});

crdt.addEdge({
  id: 'edge1',
  source: 'node1',
  target: 'node2'
});

// Convert to GraphDocument for execution
const graph = crdt.toGraphDocument();

// Synchronize between instances
const update = crdt.exportUpdate();
otherCrdt.applyUpdate(update);

// Clean up when done
crdt.destroy();
```

### GraphValidator

Comprehensive graph validation with detailed error reporting.

```typescript
import { GraphValidator } from '@prompt-spaghetti/graph-core';

const validator = new GraphValidator();
const result = validator.validate(graph);

if (!result.valid) {
  // Handle validation errors
  result.errors.forEach(error => {
    console.error(`${error.type}: ${error.message}`);
  });
}

// Check performance warnings
result.warnings.forEach(warning => {
  console.warn(`${warning.type}: ${warning.message}`);
  if (warning.suggestion) {
    console.info(`Suggestion: ${warning.suggestion}`);
  }
});
```

## Supported Node Types

### Basic Nodes

- **WeightedChoice** - Probabilistic selection from weighted options
- **Concat** - Template-based text concatenation
- **Output** - Final result generation with template substitution
- **Include** - Reference external content by name
- **SetVariable** - Store values in execution context
- **GetVariable** - Retrieve values from execution context

### Template Syntax

Use `{{nodeId}}` syntax in templates to reference other node outputs:

```typescript
{
  id: 'output1',
  type: 'Output',
  data: { text: 'Hello {{choice1}}, welcome to {{location}}!' }
}
```

## Graph Structure

```typescript
interface GraphDocument {
  id: string;
  nodes: Map<string, GraphNode>;
  edges: Map<string, GraphEdge>;
  metadata: GraphMetadata;
  seed?: string | number;
}

interface GraphNode {
  id: string;
  type: NodeType;
  data: Record<string, any>;
  position?: { x: number; y: number };
  inputs?: string[];
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}
```

## Validation Features

### Structure Validation
- Required field presence
- Type consistency
- Node and edge relationships

### Cycle Detection
- Detects circular dependencies
- Provides detailed cycle paths
- Prevents infinite execution loops

### Performance Analysis
- Large graph warnings (>100 nodes)
- High edge-to-node ratio alerts
- Deep execution chain detection

### Connectivity Analysis
- Disconnected node detection
- Missing output node warnings
- Input/output relationship validation

## Examples

### Complete Workflow

```typescript
import { 
  GraphEngine, 
  createGraphCRDT, 
  GraphValidator 
} from '@prompt-spaghetti/graph-core';

// 1. Create graph using CRDT
const crdt = createGraphCRDT();

crdt.addNode({
  id: 'greeting',
  type: 'WeightedChoice',
  data: {
    choices: [
      { value: 'Hello', weight: 0.7 },
      { value: 'Hi', weight: 0.3 }
    ]
  }
});

crdt.addNode({
  id: 'output',
  type: 'Output',
  data: { text: '{{greeting}} World!' }
});

crdt.addEdge({
  id: 'edge1',
  source: 'greeting',
  target: 'output'
});

// 2. Validate graph
const validator = new GraphValidator();
const graph = crdt.toGraphDocument();
const validation = validator.validate(graph);

if (validation.valid) {
  // 3. Execute graph
  const engine = new GraphEngine();
  const result = await engine.execute(graph, 'deterministic-seed');
  
  console.log(result.outputs); // ["Hello World!"] or ["Hi World!"]
  
  // 4. Same seed produces same result
  const result2 = await engine.execute(graph, 'deterministic-seed');
  console.log(result.outputs === result2.outputs); // true
}

crdt.destroy();
```

### Real-time Synchronization

```typescript
const crdt1 = createGraphCRDT();
const crdt2 = createGraphCRDT();

// Set up change listeners
crdt1.onChange((events) => {
  console.log('CRDT1 changed:', events.length, 'events');
});

// Make changes to first instance
crdt1.addNode({
  id: 'shared-node',
  type: 'Output',
  data: { text: 'Shared content' }
});

// Sync to second instance
const update = crdt1.exportUpdate();
crdt2.applyUpdate(update);

// Both instances now have the same content
const graph1 = crdt1.toGraphDocument();
const graph2 = crdt2.toGraphDocument();

console.log(graph1.nodes.size === graph2.nodes.size); // true
```

## Testing

The package includes comprehensive tests covering:

- Graph execution with all node types
- CRDT synchronization and merging
- Validation with error conditions
- Performance characteristics
- Integration workflows

```bash
pnpm test
```

## Architecture

### Cross-Platform Design

- Pure TypeScript with no Node.js/browser-specific APIs
- Deterministic execution suitable for server and client
- Modular architecture for selective import
- CRDT integration for real-time collaboration

### Performance Considerations

- Efficient depth-first graph traversal
- Result caching to avoid redundant computation
- Seeded random number generation for determinism
- Memory-efficient serialization

### Epic 15 Integration

This package is the foundation for Epic 15 cross-platform support:

- **Web Platform**: Direct integration with existing React components
- **Mobile Platforms**: React Native and native mobile app integration
- **Desktop Platforms**: Electron and native desktop app integration
- **Real-time Sync**: CRDT-based synchronization across all platforms

## License

See the main project LICENSE file.