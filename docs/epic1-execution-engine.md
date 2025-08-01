# Epic 1 Execution Engine Documentation

## Overview

The Epic 1 Execution Engine provides deterministic graph execution for Prompt Spaghetti nodes. It ensures that given the same seed value, a graph will always produce identical outputs, making prompt generation reproducible and testable.

## Key Features

- **Deterministic Execution**: Same seed = same output, every time
- **Variable Management**: Built-in variable storage and substitution
- **Topological Sorting**: Automatic dependency resolution
- **Error Handling**: Graceful failure with detailed error reporting
- **Performance Tracking**: Execution time and statistics
- **Node Isolation**: Each node gets its own deterministic sub-seed

## Architecture

### Core Components

#### 1. Epic1ExecutionContext
Manages execution state including:
- Seeded random number generation (PRNG)
- Variable storage and retrieval
- Execution statistics and error tracking
- Depth tracking for cycle detection

```typescript
const context = new Epic1ExecutionContext('my-seed-123');
context.setVariable('userName', 'Alice');
const value = context.getVariable('userName');
```

#### 2. Epic1ExecutionEngine
Orchestrates graph execution:
- Validates graph structure
- Builds execution order (topological sort)
- Executes nodes in dependency order
- Collects and returns results

```typescript
const engine = new Epic1ExecutionEngine(graph, 'seed-123');
const result = await engine.execute();
```

#### 3. Execution Utilities
Helper functions for common tasks:
- GraphBuilder for programmatic graph construction
- Multi-seed execution for testing
- Determinism validation
- Result comparison and formatting

## Usage Examples

### Basic Graph Execution

```typescript
import { 
  GraphBuilder, 
  TextBlockNode, 
  OutputNode,
  Epic1ExecutionEngine 
} from '@promptgraph/core/runtime/nodes/epic1';

// Build a simple graph
const builder = new GraphBuilder();
const text = new TextBlockNode('text1', 'Hello, world!');
const output = new OutputNode('output1');
output.lock();

const graph = builder
  .addNode(text)
  .addNode(output)
  .connect('text1', 'output1')
  .build();

// Execute with a seed
const engine = new Epic1ExecutionEngine(graph, 'my-seed');
const result = await engine.execute();

console.log(result.output); // "Hello, world!"
```

### Using Variables

```typescript
// Create nodes that use variables
const setName = new VariableNode('setName', 
  { name: 'userName', defaultValue: 'Guest' },
  { mode: 'set' }
);

const greeting = new TextBlockNode('greeting', 
  'Welcome, {{userName}}!'
);

const graph = builder
  .addNode(setName)
  .addNode(greeting)
  .addNode(output)
  .connect('greeting', 'output')
  .build();

const result = await engine.execute();
// Output: "Welcome, Guest!"
```

### Weighted Choices

```typescript
const choices = new WeightedChoiceNode('mood', [
  { id: 'happy', text: 'feeling great', weight: 70 },
  { id: 'ok', text: 'doing alright', weight: 20 },
  { id: 'tired', text: 'a bit tired', weight: 10 }
]);

// With seed "test-123", this will always select the same option
const engine = new Epic1ExecutionEngine(graph, 'test-123');
```

### Complex Graphs

```typescript
// Build a dynamic greeting generator
const timeOfDay = new WeightedChoiceNode('time', [
  { id: 'morning', text: 'Good morning', weight: 33 },
  { id: 'afternoon', text: 'Good afternoon', weight: 33 },
  { id: 'evening', text: 'Good evening', weight: 34 }
]);

const punctuation = new WeightedChoiceNode('punct', [
  { id: 'exclaim', text: '!', weight: 30 },
  { id: 'period', text: '.', weight: 70 }
]);

const concat = new ConcatNode('concat', { separator: '' });

// Connect: timeOfDay + ", " + userName + punctuation
```

## Determinism Guarantees

### Seed Hierarchy

1. **Main Seed**: Provided to the engine constructor
2. **Node Seeds**: Derived from `mainSeed + nodeId`
3. **Isolation**: Each node's randomness is independent

### Testing Determinism

```typescript
import { validateDeterminism } from '@promptgraph/core/runtime/nodes/epic1';

// Run the same graph 10 times with the same seed
const result = await validateDeterminism(graph, 'test-seed', 10);

console.log(result.isDeterministic); // true
console.log(result.variations); // ['Same output every time']
```

### Multi-Seed Preview

```typescript
import { generatePreview } from '@promptgraph/core/runtime/nodes/epic1';

// Generate outputs with 5 different seeds
const preview = await generatePreview(graph, 5);

preview.outputs.forEach((output, i) => {
  console.log(`Seed ${preview.seeds[i]}: ${output}`);
});
```

## Error Handling

The engine provides comprehensive error information:

```typescript
const result = await engine.execute();

if (!result.success) {
  // Check errors
  result.stats.errors.forEach(error => {
    console.error(`Node ${error.nodeId}: ${error.error.message}`);
  });

  // Check warnings
  result.stats.warnings.forEach(warning => {
    console.warn(`Node ${warning.nodeId}: ${warning.message}`);
  });
}
```

### Common Errors

1. **Validation Errors**
   - Graph contains cycles
   - No output node
   - Invalid node configurations

2. **Execution Errors**
   - Variable not found (handled gracefully)
   - Maximum depth exceeded (cycle detection)
   - Node execution failures

3. **Connection Errors**
   - Missing required inputs
   - Type mismatches

## Performance Considerations

### Execution Statistics

```typescript
const result = await engine.execute();

console.log(`Total duration: ${result.stats.totalDuration}ms`);
console.log(`Nodes executed: ${result.stats.nodesExecuted}`);

// Per-node timing
result.results.forEach((nodeResult, nodeId) => {
  console.log(`${nodeId}: ${nodeResult.duration}ms`);
});
```

### Optimization Tips

1. **Minimize Graph Depth**: Shallow graphs execute faster
2. **Reuse Contexts**: Clone contexts for similar executions
3. **Cache Results**: Store outputs for expensive operations
4. **Batch Execution**: Use `executeWithSeeds` for multiple runs

## Integration with PSG Format

The engine seamlessly works with PSG v2.0.0 files:

```typescript
import { createGraphFromPSG } from '@promptgraph/core/runtime/nodes/epic1';

// Load from PSG file
const psgData = JSON.parse(fs.readFileSync('my-graph.psg.json', 'utf8'));
const graph = createGraphFromPSG(psgData);

// Execute normally
const engine = new Epic1ExecutionEngine(graph, 'seed');
const result = await engine.execute();
```

## Advanced Features

### Custom Node Seeds

```typescript
const context = engine.getContext();

// Get the deterministic seed for a specific node
const nodeSeed = context.getNodeSeed('myNodeId');

// Get a PRNG for a specific node
const nodePRNG = context.getNodePRNG('myNodeId');
```

### Context Cloning

```typescript
// Clone context for isolated execution
const clonedContext = context.clone();

// Useful for preview or what-if scenarios
```

### Execution Order Inspection

```typescript
const order = engine.getExecutionOrder();
console.log('Nodes will execute in this order:', order);
```

## Best Practices

1. **Always Lock Output Nodes**: Prevents accidental editing
   ```typescript
   outputNode.lock('Output nodes are read-only');
   ```

2. **Use Meaningful Seeds**: Helps with debugging
   ```typescript
   const seed = `${userId}-${Date.now()}`;
   ```

3. **Validate Before Execution**: Catch issues early
   ```typescript
   const validation = await validateGraph(nodes, edges);
   if (!validation.valid) {
     // Handle validation errors
   }
   ```

4. **Handle Missing Variables**: Provide defaults
   ```typescript
   const varNode = new VariableNode('var', {
     name: 'myVar',
     defaultValue: 'fallback value'
   });
   ```

5. **Test Determinism**: Ensure reproducibility
   ```typescript
   const isDeterministic = await validateDeterminism(graph, seed);
   ```

## Migration from Legacy Execution

If migrating from the existing runtime:

1. Convert nodes to Epic 1 format
2. Update edge definitions
3. Replace execution calls
4. Update seed handling

```typescript
// Legacy
const executor = new GraphExecutor(oldGraph);
const result = executor.execute(seed);

// Epic 1
const engine = new Epic1ExecutionEngine(newGraph, seed);
const result = await engine.execute();
```

## Troubleshooting

### Graph Won't Execute
- Check for validation errors
- Ensure output node exists
- Verify all nodes are connected

### Non-Deterministic Results
- Verify same seed is used
- Check for external dependencies
- Ensure no time-based logic

### Performance Issues
- Profile with execution stats
- Check for deep recursion
- Optimize graph structure

## API Reference

See the TypeScript definitions in:
- `Epic1ExecutionContext.ts`
- `Epic1ExecutionEngine.ts`
- `executionUtils.ts`

For complete API documentation, refer to the generated TypeDoc output.