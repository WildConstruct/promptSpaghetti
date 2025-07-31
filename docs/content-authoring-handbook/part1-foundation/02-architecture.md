# Chapter 2: Architecture & Core Concepts

Understanding the architecture of Prompt Spaghetti is crucial for creating effective generators. This chapter explores the system's design, execution model, and core concepts that power content generation.

## System Architecture Overview

Prompt Spaghetti follows a modular, layered architecture:

```
┌─────────────────────────────────────────────────────┐
│                   User Interface                     │
│         (Visual Editor / Inspector Panel)            │
├─────────────────────────────────────────────────────┤
│                  Graph System                        │
│          (React Flow / Node Management)              │
├─────────────────────────────────────────────────────┤
│                 Execution Engine                     │
│        (Runtime Nodes / Context Management)          │
├─────────────────────────────────────────────────────┤
│                   Core Layer                         │
│      (Schemas / Validation / Serialization)          │
├─────────────────────────────────────────────────────┤
│                Storage & Export                      │
│        (JSON / Database / Bundle Export)             │
└─────────────────────────────────────────────────────┘
```

### Key Components

#### 1. Visual Editor

- **React Flow Canvas**: Drag-and-drop node interface
- **Inspector Panel**: Node configuration and properties
- **Preview System**: Real-time generation preview
- **Palette**: Available node types

#### 2. Runtime Engine

- **Node Execution**: Processes the graph structure
- **Context Management**: Maintains variables and state
- **Deterministic RNG**: Seeded random number generation
- **Performance Optimization**: Caching and efficiency

#### 3. Schema Layer

- **Zod Validation**: Type-safe data structures
- **Graph Validation**: Connection rules and constraints
- **Serialization**: Save/load functionality

## The Generator Engine

The heart of Prompt Spaghetti is its generator engine, which transforms node graphs into generated content.

### Execution Model

1. **Graph Traversal**

   ```typescript
   // Simplified execution flow
   function execute(nodeId: string, context: ExecutionContext) {
     const node = getNode(nodeId);
     const inputs = resolveInputs(node, context);
     const output = node.execute(inputs, context);
     return output;
   }
   ```

2. **Depth-First Processing**
   - Starts from Output nodes
   - Recursively resolves dependencies
   - Builds result bottom-up

3. **Lazy Evaluation**
   - Nodes execute only when needed
   - Results cached within execution
   - Efficient for complex graphs

### Deterministic Execution

Prompt Spaghetti ensures reproducible results through deterministic execution:

```javascript
// Every execution with same seed produces identical output
const seed = 'abc123';
const result1 = generator.execute(seed);
const result2 = generator.execute(seed);
console.log(result1 === result2); // true
```

Key principles:

- **Seeded RNG**: Uses seedrandom for predictable randomness
- **Sub-seed Generation**: `hash(nodeId + parentSeed)` for node isolation
- **No External State**: Pure functions throughout
- **Consistent Ordering**: Stable array iterations

## Node-Based Graph System

Content generation uses a directed acyclic graph (DAG) of nodes:

### Node Types

#### Core Nodes

1. **WeightedChoice**: Probabilistic selection

   ```json
   {
     "type": "WeightedChoice",
     "choices": [
       { "weight": 70, "value": "common" },
       { "weight": 30, "value": "rare" }
     ]
   }
   ```

2. **Concat**: String concatenation

   ```json
   {
     "type": "Concat",
     "inputs": ["Hello, ", { "$ref": "nameNode" }, "!"]
   }
   ```

3. **Output**: Final result production
   ```json
   {
     "type": "Output",
     "template": "Generated: {input}"
   }
   ```

#### Variable Nodes

1. **SetVariable**: Store values

   ```json
   {
     "type": "SetVariable",
     "variableName": "character_name",
     "value": { "$ref": "nameGenerator" }
   }
   ```

2. **GetVariable**: Retrieve values
   ```json
   {
     "type": "GetVariable",
     "variableName": "character_name",
     "defaultValue": "Unknown"
   }
   ```

#### Advanced Nodes (Epic 7)

1. **Conditional**: Logic branching
2. **Sequential**: Ordered processing
3. **Markov**: State transitions
4. **WeightedAdvanced**: Complex distributions

### Node Connections

Nodes connect through edges that define data flow:

```typescript
interface Edge {
  id: string;
  source: string; // Source node ID
  target: string; // Target node ID
  sourceHandle: string; // Output port
  targetHandle: string; // Input port
}
```

Connection rules:

- No cycles allowed (DAG constraint)
- Type compatibility enforced
- Multiple inputs supported
- Single output per port

## Variable Context and Scoping

Variables provide dynamic behavior within generators:

### Context Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ SetVariable │────▶│   Process   │────▶│ GetVariable │
│  name=Alice │     │   Context   │     │  name=?     │
└─────────────┘     └─────────────┘     └─────────────┘
```

### Scoping Rules

1. **Global Scope**: Variables persist across entire execution
2. **Node Isolation**: Each node gets context copy
3. **Immutable Updates**: Context never mutated directly
4. **Default Values**: Fallbacks for missing variables

Example context flow:

```javascript
// Initial context
{ seed: "123", variables: {} }

// After SetVariable
{ seed: "123", variables: { name: "Alice" } }

// After nested execution
{ seed: "123-sub", variables: { name: "Alice", age: 25 } }
```

## Execution Flow and Rule Resolution

Understanding how rules resolve is key to effective generator design:

### Rule Types

1. **String Rules**

   ```json
   "rule": "Simple text output"
   ```

2. **Array Rules** (random selection)

   ```json
   "rule": ["option1", "option2", "option3"]
   ```

3. **Weighted Rules**

   ```json
   "rule": [
     {"w": 60, "v": "common"},
     {"w": 30, "v": "uncommon"},
     {"w": 10, "v": "rare"}
   ]
   ```

4. **Reference Rules**
   ```json
   "rule": "[adjective] [noun]"
   ```

### Resolution Process

1. **Tokenization**: Parse rule for references `[ruleName]`
2. **Reference Resolution**: Replace with sub-rule results
3. **Modifier Application**: Apply any text transformations
4. **Variable Interpolation**: Replace `{varName}` with values
5. **Final Assembly**: Combine all pieces

Example resolution:

```
Input:  "The [size] [color] [animal]"
Step 1: "The " + resolve([size]) + " " + resolve([color]) + " " + resolve([animal])
Step 2: "The " + "large" + " " + "blue" + " " + "elephant"
Result: "The large blue elephant"
```

## Performance Considerations

Efficient execution is crucial for responsive generation:

### Optimization Strategies

1. **Result Caching**
   - Cache within single execution
   - Invalidate between executions
   - Memory-time tradeoff

2. **Lazy Evaluation**
   - Don't compute unused branches
   - Defer expensive operations
   - Stream large outputs

3. **Sub-seed Optimization**
   - Pre-compute common seeds
   - Use efficient hashing
   - Minimize seed generation

### Performance Patterns

```javascript
// Good: Reference reuse
{
  "character": "[name]",
  "greeting": "Hello, [name]!"  // Reuses same result
}

// Better: Variable storage
{
  "character": {"$set": "name", "value": "[names]"},
  "greeting": "Hello, {name}!"  // Even more efficient
}
```

## Security and Sandboxing

Prompt Spaghetti implements multiple security layers:

### Input Validation

- Schema validation on all inputs
- Size limits on generated content
- Recursive depth limits

### Safe Execution

- No eval() or code execution
- Sandboxed expression evaluation
- Pattern detection for malicious content

### Resource Limits

- Maximum execution time
- Memory usage caps
- Recursion depth limits

## Integration Points

The architecture provides multiple integration options:

### API Integration

```javascript
// JavaScript API
import { Generator } from '@prompt-spaghetti/core';
const gen = new Generator(config);
const result = gen.execute(seed);

// REST API
POST /api/generate
{
  "generator": "character",
  "seed": "12345"
}
```

### Extension System

- Custom node types
- Modifier plugins
- Storage adapters
- UI components

### Export Formats

- Native JSON format
- Generator bundles
- Compiled executables
- Web embeds

## Best Practices

When working with the architecture:

1. **Design for Determinism**
   - Avoid external dependencies
   - Use provided RNG only
   - Test with multiple seeds

2. **Optimize Graph Structure**
   - Minimize node count
   - Reuse common patterns
   - Leverage variables

3. **Plan for Scale**
   - Modularize large generators
   - Use includes wisely
   - Profile performance

4. **Ensure Compatibility**
   - Version your generators
   - Document requirements
   - Test across platforms

## Summary

The Prompt Spaghetti architecture provides a robust foundation for content generation:

- **Visual Editing**: Intuitive node-based interface
- **Deterministic Engine**: Reproducible results
- **Flexible System**: Extensible and integrable
- **Performance Focus**: Optimized execution
- **Security First**: Safe content generation

Understanding these architectural principles enables you to create more effective, efficient, and maintainable generators.

---

**Next Chapter**: [Generator JSON Schema Reference](03-schema-reference.md) →
