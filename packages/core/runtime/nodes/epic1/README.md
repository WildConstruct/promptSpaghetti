# Epic 1: Inline Editing Node System

This directory contains the reimagined node system for Prompt Spaghetti with inline editing as the core feature.

## Overview

Epic 1 represents a fundamental shift from traditional node editors. Instead of using a separate inspector panel, all editing happens directly on the canvas, similar to modern design tools like Figma.

## Key Features

1. **Inline Editing**: Double-click or press Enter to edit nodes directly on canvas
2. **Smart Prompt Parsing**: Paste text and get intelligent node generation
3. **Visual Range Indicators**: See which parts of your prompt map to which nodes
4. **Keyboard Navigation**: Tab between nodes, Escape to cancel edits
5. **Deterministic Execution**: Reproducible results with seeded randomization

## Node Types

### TextBlockNode

Simple text content that can be edited inline.

```typescript
const node = new TextBlockNode('node-1', 'Your text here');
```

### WeightedChoiceNode

Multiple options with probability weights.

```typescript
const node = new WeightedChoiceNode('node-2', [
  { text: 'option1', weight: 50 },
  { text: 'option2', weight: 50 }
]);
```

### ConcatNode

Combines multiple inputs into a single output.

```typescript
const node = new ConcatNode('node-3', ' '); // space separator
```

### VariableNode

Get or set variables in the execution context.

```typescript
const setNode = new VariableNode('node-4', 'varName', 'value', 'set');
const getNode = new VariableNode('node-5', 'varName', null, 'get');
```

### OutputNode

Terminal node that collects the final result.

```typescript
const node = new OutputNode('node-6');
```

## Usage

### Basic Execution

```typescript
import { Epic1ExecutionEngine } from './Epic1ExecutionEngine';
import { TextBlockNode, OutputNode } from './index';

// Create nodes
const text = new TextBlockNode('1', 'Hello World');
const output = new OutputNode('2');

// Create graph
const nodes = [text, output];
const edges = [{ source: '1', target: '2' }];

// Execute
const engine = new Epic1ExecutionEngine();
const result = await engine.execute({ nodes, edges }, { seed: 12345 });
console.log(result); // "Hello World"
```

### Prompt Parsing

```typescript
import { promptParser } from './PromptParser';

const prompt = 'A merchant carrying scrolls or books or potions';
const analysis = promptParser.parse(prompt);

// Creates:
// - TextBlock: "A merchant carrying"
// - WeightedChoice: ["scrolls", "books", "potions"]
```

## Architecture

- **BaseInlineEditableNode**: Abstract base class with editing capabilities
- **Epic1ExecutionContext**: Manages variables and deterministic RNG
- **Epic1ExecutionEngine**: Handles graph traversal and execution
- **PromptParser**: Intelligent text-to-node conversion
- **validation**: Runtime validation for node data

## Testing

Run tests:

```bash
npm test packages/core/runtime/nodes/epic1
```

## Integration

See `/packages/core/components/epic1/` for React components that integrate with this node system.
