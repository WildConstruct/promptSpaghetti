# Epic 1 Node Implementation Guide

## Overview

Epic 1 introduces a new set of base node classes with comprehensive inline editing support. These nodes form the foundation of the Prompt Spaghetti MVP, enabling users to create and edit prompt generation graphs with a smooth, intuitive experience.

## Architecture

### Base Class: BaseInlineEditableNode

All Epic 1 nodes extend from `BaseInlineEditableNode`, which provides:

- **Edit State Management**: Track editing status, validation errors, and dirty state
- **Validation Framework**: Async validation with detailed error reporting
- **Serialization**: Full state persistence for the PSG v2 format
- **Lock/Unlock**: Control editability with reasons
- **Preview Modes**: Auto, manual, or live preview updates

### Node Types

#### 1. TextBlockNode
Simple text content with variable substitution support.

**Features:**
- Multi-line text support
- Character/word counting
- Variable substitution using `{{variableName}}` syntax
- XSS prevention
- Length constraints

**Usage:**
```typescript
const textNode = new TextBlockNode('node-1', 'Hello {{name}}!', {
  maxLength: 500,
  multiline: true,
  placeholder: 'Enter your text...'
});

// Start editing
textNode.startEdit();
textNode.updateEditBuffer('Updated text with {{variable}}');
await textNode.commitEdit();
```

#### 2. WeightedChoiceNode
Random selection from weighted options with visual weight distribution.

**Features:**
- Add/remove options dynamically
- Weight normalization
- Percentage calculations
- Color coding for options
- Deterministic execution with seeds

**Usage:**
```typescript
const weightedNode = new WeightedChoiceNode('node-2', [
  { id: 'opt-1', text: 'Happy', weight: 60 },
  { id: 'opt-2', text: 'Sad', weight: 40 }
]);

// Add new option
const newId = weightedNode.addOption('Excited', 50);

// Update weights
weightedNode.updateOptionWeight('opt-1', 70);

// Get percentages
const percentages = weightedNode.getWeightPercentages();
```

#### 3. ConcatNode
Concatenates multiple inputs with configurable separator.

**Features:**
- Custom separators with presets
- Input trimming option
- Preview with sample inputs
- Empty input filtering

**Usage:**
```typescript
const concatNode = new ConcatNode('node-3', {
  separator: ' ',
  trimInputs: true
});

// Configure
concatNode.setSeparator(', ');
concatNode.setTrimInputs(false);

// Preview
const preview = concatNode.preview(['Hello', 'World']);
```

#### 4. VariableNode
Store and retrieve variables with type safety.

**Features:**
- Set/Get/Both modes
- Type validation (string, number, boolean, array, object)
- Scope control (local/global)
- Security validation
- Default values

**Usage:**
```typescript
const varNode = new VariableNode('node-4', {
  name: 'userName',
  defaultValue: 'Guest'
}, {
  variableType: 'string',
  mode: 'both'
});

// Update configuration
varNode.setVariableName('currentUser');
varNode.setDefaultValue('Anonymous');
```

#### 5. OutputNode
Display execution results (typically locked).

**Features:**
- Read-only by default
- Format detection (JSON, Markdown, Code)
- Statistics (word count, line count)
- Preview generation

**Usage:**
```typescript
const outputNode = new OutputNode('node-5');

// Set result (usually done by execution engine)
outputNode.setInput('Generated output text');

// Get statistics
const stats = outputNode.getStats();
// { isEmpty: false, length: 20, wordCount: 3, lineCount: 1 }
```

## Inline Editing Workflow

### 1. Start Editing
```typescript
if (!node.isLocked()) {
  node.startEdit();
}
```

### 2. Update Values
```typescript
// For TextBlock
textNode.updateEditBuffer('New text content');

// For WeightedChoice
weightedNode.updateOptionText('opt-1', 'Updated option');

// For Variable
varNode.setVariableName('newName');
```

### 3. Validation
```typescript
const errors = node.getValidationErrors();
if (errors.length > 0) {
  console.error('Validation errors:', errors);
}
```

### 4. Commit or Cancel
```typescript
try {
  await node.commitEdit(); // Save changes
} catch (error) {
  node.cancelEdit(); // Discard changes
}
```

## Validation System

### Node-Level Validation
Each node type implements specific validation rules:

```typescript
import { validateNode } from './validation';

const result = await validateNode(node, {
  nodes: allNodesMap,
  edges: graphEdges,
  deep: true
});

if (!result.valid) {
  console.error('Errors:', result.errors);
  console.warn('Warnings:', result.warnings);
}
```

### Graph-Level Validation
Validate entire graphs for cycles, orphaned nodes, and structural issues:

```typescript
import { validateGraph } from './validation';

const graphResult = await validateGraph(nodesMap, edges);
```

### Common Validation Rules

1. **TextBlock**: 
   - No incomplete variable syntax
   - Length constraints
   - XSS prevention

2. **WeightedChoice**:
   - At least 2 options (configurable)
   - At least one non-zero weight
   - Unique option IDs

3. **Variable**:
   - Valid variable names (alphanumeric + underscore, max 64 chars)
   - No reserved names
   - Type consistency

4. **Concat**:
   - Valid separator type
   - Input connection warnings

5. **Output**:
   - Single input connection
   - Should be locked

## Serialization

All nodes support full serialization for the PSG v2 format:

```typescript
// Serialize a node
const serialized = node.serialize();
// {
//   id: 'node-1',
//   type: 'TextBlock',
//   data: { value: '...', editState: {...}, ... },
//   metadata: { ... }
// }

// Restore from serialized data
import { createNodeFromData } from './index';
const restoredNode = createNodeFromData(serialized);
```

## Integration with React Flow

The nodes are designed to work seamlessly with React Flow:

```typescript
// Convert to React Flow node
const reactFlowNode = {
  id: node.serialize().id,
  type: node.getNodeType(),
  position: { x: 100, y: 100 },
  data: {
    nodeInstance: node,
    value: node.getCurrentValue(),
    isEditing: node.isEditing(),
    isLocked: node.getData().isLocked
  }
};
```

## Best Practices

1. **Always validate before committing edits**
   ```typescript
   if (node.getValidationErrors().length === 0) {
     await node.commitEdit();
   }
   ```

2. **Use type guards for node-specific operations**
   ```typescript
   import { isWeightedChoiceNode } from './index';
   
   if (isWeightedChoiceNode(node)) {
     node.normalizeWeights();
   }
   ```

3. **Handle edit states in UI**
   ```typescript
   const isEditing = node.isEditing();
   const isDirty = node.isDirty();
   const errors = node.getValidationErrors();
   ```

4. **Lock critical nodes**
   ```typescript
   outputNode.lock('Output nodes are read-only');
   ```

5. **Use preview modes appropriately**
   - `auto`: Update preview on every change
   - `manual`: Update only on request
   - `live`: Real-time updates (for output nodes)

## Error Handling

All nodes provide comprehensive error information:

```typescript
try {
  await node.commitEdit();
} catch (error) {
  // Check validation errors
  const validationErrors = node.getValidationErrors();
  
  // Check node state
  const nodeData = node.getData();
  if (!nodeData.isValid) {
    console.error(nodeData.validationMessage);
  }
}
```

## Performance Considerations

1. **Debounce validation** for auto-preview mode
2. **Use manual preview** for expensive operations
3. **Cache validation results** when possible
4. **Batch node updates** in graph operations

## Testing

Example test setup:

```typescript
import { TextBlockNode } from './TextBlockNode';

describe('TextBlockNode', () => {
  it('should handle inline editing', async () => {
    const node = new TextBlockNode('test-1', 'Initial text');
    
    node.startEdit();
    expect(node.isEditing()).toBe(true);
    
    node.updateEditBuffer('Updated text');
    expect(node.isDirty()).toBe(true);
    
    await node.commitEdit();
    expect(node.getCurrentValue()).toBe('Updated text');
    expect(node.isEditing()).toBe(false);
  });
});
```

## Migration from Legacy Nodes

To migrate from the existing runtime nodes:

1. Map node types to Epic 1 equivalents
2. Extract configuration and value data
3. Create new node instances
4. Restore edit states if needed

```typescript
// Legacy WeightedChoiceNode
const legacyNode = new WeightedChoiceNode('id', choices);

// Epic 1 WeightedChoiceNode
const epic1Node = new Epic1WeightedChoiceNode('id', 
  choices.map((c, i) => ({
    id: `opt-${i}`,
    text: c.value,
    weight: c.weight
  }))
);
```

## Future Enhancements

The Epic 1 node system is designed for extensibility:

1. **Custom node types** - Extend BaseInlineEditableNode
2. **Advanced validation** - Add async validators
3. **Collaborative editing** - Track user edits
4. **Undo/redo support** - Store edit history
5. **Performance monitoring** - Track validation times