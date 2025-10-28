# Epic 1 Migration Guide

## Overview

Epic 1 introduces a fundamentally different approach to node editing in Prompt Spaghetti. This guide helps you understand the changes and how to work with the new system.

## Key Differences

### Before (Traditional Approach)

- Select node → Edit in inspector panel
- Separate UI for editing
- Modal dialogs for complex edits
- Mouse-heavy workflow

### After (Epic 1 Inline Editing)

- Edit directly on canvas
- Keyboard-first navigation
- Visual feedback during editing
- Faster, more intuitive workflow

## Using the New System

### 1. Creating Nodes from Prompts

```typescript
// Old way
const node1 = createNode('TextBlock');
const node2 = createNode('WeightedChoice');
// Manually connect and configure...

// New way
import { promptParser } from '@packages/core/runtime/nodes/epic1';
const analysis = promptParser.parse('Your prompt text here');
// Automatically generates appropriate nodes!
```

### 2. Keyboard Navigation

| Action         | Shortcut     | Description                |
| -------------- | ------------ | -------------------------- |
| Next Node      | `Tab`        | Move to next editable node |
| Previous Node  | `Shift+Tab`  | Move to previous node      |
| Confirm & Next | `Enter`      | Save current, move to next |
| Cancel All     | `Escape`     | Cancel all edits           |
| Confirm All    | Click canvas | Save all edits             |

### 3. Visual Indicators

The new system shows:

- Which text generated which nodes (color coding)
- Hover connections between text and nodes
- Edit mode indicators (green ring)
- Selection state (blue ring)

## Code Examples

### Using the New Editor

```tsx
import { KeyboardNavigableEditor } from '@packages/core/components/epic1';
import { promptParser } from '@packages/core/runtime/nodes/epic1';

function MyEditor() {
  const [prompt, setPrompt] = useState('');
  const analysis = promptParser.parse(prompt);

  return (
    <KeyboardNavigableEditor
      promptAnalysis={analysis}
      onCanvasClick={() => console.log('Edits confirmed')}
      showVisualIndicators={true}
    />
  );
}
```

### Direct Node Creation

```typescript
import {
  TextBlockNode,
  WeightedChoiceNode,
  Epic1ExecutionEngine
} from '@packages/core/runtime/nodes/epic1';

// Create nodes with inline editing support
const textNode = new TextBlockNode('1', 'Initial text');
textNode.setEditMode(true); // Enable inline editing

const choiceNode = new WeightedChoiceNode('2', [
  { text: 'option1', weight: 50 },
  { text: 'option2', weight: 50 }
]);
```

## Feature Comparison

| Feature         | Old System       | Epic 1 System          |
| --------------- | ---------------- | ---------------------- |
| Edit Location   | Inspector Panel  | Canvas                 |
| Navigation      | Mouse clicks     | Tab/Shift+Tab          |
| Bulk Edits      | Individual saves | Canvas click saves all |
| Visual Feedback | Limited          | Rich indicators        |
| Prompt Import   | Manual           | Automatic parsing      |
| Undo/Redo       | Per action       | Escape cancels all     |

## Migration Checklist

- [ ] Update imports to use Epic 1 nodes
- [ ] Replace inspector-based editing with inline
- [ ] Add keyboard navigation handlers
- [ ] Update save/cancel logic for bulk operations
- [ ] Test with keyboard-only workflow
- [ ] Add visual indicators for better UX

## Backwards Compatibility

The Epic 1 system is designed to coexist with the current system during migration:

1. New features are in `epic1/` directories
2. Existing code continues to work
3. Can be toggled with feature flags
4. Gradual migration path available

## Getting Help

- See `packages/core/runtime/nodes/epic1/README.md` for API docs
- Check `packages/core/components/epic1/examples/` for demos
- Run demos: `node demo-keyboard-navigation.js`

## Next Steps

1. Try the keyboard navigation demo
2. Experiment with prompt parsing
3. Build a simple flow using inline editing
4. Provide feedback on the new workflow
