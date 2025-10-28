# Inline Editing Architecture Specification

## Overview

This document defines the technical architecture for Prompt Spaghetti's inline node editing system - a key differentiator that allows users to edit node content directly on the canvas without using side panels or inspectors.

## Core Principles

1. **Zero Context Switch**: Users never leave the canvas to edit
2. **Immediate Feedback**: Changes visible as you type
3. **Keyboard-First**: Full keyboard navigation support
4. **Performance**: Smooth editing even with 100+ nodes
5. **Progressive Enhancement**: Simple nodes → complex editors

## Architecture Components

### 1. Node State Management

```typescript
// Base editable node interface
interface EditableNodeData {
  // Core data
  id: string;
  type: NodeType;
  value: any;

  // Edit state
  editState: {
    isEditing: boolean;
    editBuffer: any; // Temporary edit value
    originalValue: any; // For cancellation
    validationErrors: string[];
    cursorPosition?: number;
    selection?: [number, number];
  };

  // Display state
  displayState: {
    isHovered: boolean;
    isSelected: boolean;
    isAnimating: boolean;
    previewHash?: string; // For preview caching
  };
}

// Node-specific data extends base
interface WeightedChoiceData extends EditableNodeData {
  value: {
    options: Array<{
      weight: number;
      text: string;
      id: string;
    }>;
  };
}
```

### 2. Edit Mode State Machine

```typescript
enum EditMode {
  IDLE = 'idle',
  HOVER = 'hover',
  EDITING = 'editing',
  VALIDATING = 'validating',
  SAVING = 'saving',
  ERROR = 'error'
}

// State transitions
const editStateTransitions = {
  [EditMode.IDLE]: {
    mouseEnter: EditMode.HOVER,
    click: EditMode.EDITING,
    keyboardFocus: EditMode.EDITING
  },
  [EditMode.HOVER]: {
    mouseLeave: EditMode.IDLE,
    click: EditMode.EDITING
  },
  [EditMode.EDITING]: {
    escape: EditMode.IDLE,
    enter: EditMode.VALIDATING,
    blur: EditMode.VALIDATING,
    tab: EditMode.VALIDATING // then focus next
  },
  [EditMode.VALIDATING]: {
    valid: EditMode.SAVING,
    invalid: EditMode.ERROR
  },
  [EditMode.SAVING]: {
    success: EditMode.IDLE,
    error: EditMode.ERROR
  },
  [EditMode.ERROR]: {
    retry: EditMode.EDITING,
    escape: EditMode.IDLE
  }
};
```

### 3. React Flow Custom Node Architecture

```typescript
// Base editable node component
const EditableNode: FC<NodeProps> = ({ data, selected, id }) => {
  const { editState, displayState } = data;
  const [localEdit, setLocalEdit] = useState(editState.editBuffer);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on edit mode
  useEffect(() => {
    if (editState.isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editState.isEditing]);

  // Handle edit lifecycle
  const handleEdit = useCallback((value: any) => {
    setLocalEdit(value);
    debouncedPreview(value); // 300ms debounce
  }, []);

  const handleCommit = useCallback(() => {
    if (validate(localEdit)) {
      updateNodeData(id, { value: localEdit });
      exitEditMode(id);
    }
  }, [localEdit, id]);

  // Render edit UI inline
  return (
    <NodeContainer
      editing={editState.isEditing}
      hasErrors={editState.validationErrors.length > 0}
    >
      {editState.isEditing ? (
        <InlineEditor
          ref={inputRef}
          value={localEdit}
          onChange={handleEdit}
          onCommit={handleCommit}
          onCancel={() => exitEditMode(id)}
          errors={editState.validationErrors}
        />
      ) : (
        <NodeDisplay
          value={data.value}
          onClick={() => enterEditMode(id)}
        />
      )}
      <Handle type="source" position={Position.Right} />
      <Handle type="target" position={Position.Left} />
    </NodeContainer>
  );
};
```

### 4. Node-Specific Inline Editors

```typescript
// Text node inline editor
const TextNodeEditor: FC<InlineEditorProps> = ({
  value,
  onChange,
  onCommit,
  onCancel
}) => (
  <AutosizeInput
    value={value}
    onChange={(e) => onChange(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === 'Enter') onCommit();
      if (e.key === 'Escape') onCancel();
    }}
    placeholder="Enter text..."
    minWidth={100}
    maxWidth={400}
  />
);

// Weighted choice inline editor
const WeightedChoiceEditor: FC<InlineEditorProps> = ({
  value,
  onChange
}) => (
  <div className="weighted-choice-editor">
    {value.options.map((option, index) => (
      <div key={option.id} className="option-row">
        <MiniSlider
          value={option.weight}
          onChange={(weight) => updateOption(index, { weight })}
          min={0}
          max={1}
          step={0.1}
          width={60}
        />
        <InlineText
          value={option.text}
          onChange={(text) => updateOption(index, { text })}
          onDelete={() => removeOption(index)}
        />
      </div>
    ))}
    <AddButton onClick={addOption}>+</AddButton>
  </div>
);
```

### 5. Keyboard Navigation System

```typescript
class KeyboardNavigationManager {
  private nodeOrder: string[] = [];
  private currentIndex: number = -1;

  constructor(private reactFlowInstance: ReactFlowInstance) {
    this.setupKeyboardHandlers();
  }

  private setupKeyboardHandlers() {
    document.addEventListener('keydown', e => {
      // Global shortcuts
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 'Enter':
            this.commitAllEdits();
            break;
          case 'k':
            this.quickAddNode();
            break;
          case 'z':
            this.undo();
            break;
        }
        return;
      }

      // Navigation
      switch (e.key) {
        case 'Tab':
          e.preventDefault();
          this.navigateToNext(e.shiftKey);
          break;
        case 'Enter':
          if (!this.isEditing()) {
            this.enterEditMode(this.currentNode);
          }
          break;
        case 'Escape':
          if (this.isEditing()) {
            this.cancelEdit(this.currentNode);
          } else {
            this.deselectAll();
          }
          break;
      }
    });
  }

  private navigateToNext(reverse: boolean = false) {
    const nodes = this.reactFlowInstance.getNodes();
    this.nodeOrder = this.calculateNodeOrder(nodes);

    if (reverse) {
      this.currentIndex = Math.max(0, this.currentIndex - 1);
    } else {
      this.currentIndex = Math.min(
        this.nodeOrder.length - 1,
        this.currentIndex + 1
      );
    }

    this.focusNode(this.nodeOrder[this.currentIndex]);
  }

  private calculateNodeOrder(nodes: Node[]): string[] {
    // Sort by reading order: top-to-bottom, left-to-right
    return nodes
      .sort((a, b) => {
        const yDiff = a.position.y - b.position.y;
        if (Math.abs(yDiff) > 50) return yDiff;
        return a.position.x - b.position.x;
      })
      .map(n => n.id);
  }
}
```

### 6. Performance Optimizations

```typescript
// Virtual editing for large graphs
const VirtualEditingSystem = {
  // Only create edit UI for visible nodes
  visibleNodes: new Set<string>(),

  updateVisibleNodes(viewport: Viewport, nodes: Node[]) {
    this.visibleNodes.clear();
    nodes.forEach(node => {
      if (this.isInViewport(node, viewport)) {
        this.visibleNodes.add(node.id);
      }
    });
  },

  shouldRenderEditor(nodeId: string): boolean {
    return this.visibleNodes.has(nodeId);
  }
};

// Preview debouncing and caching
const PreviewSystem = {
  cache: new Map<string, PreviewResult>(),
  pending: new Map<string, TimeoutID>(),

  requestPreview(graphHash: string, callback: (result) => void) {
    // Check cache first
    if (this.cache.has(graphHash)) {
      callback(this.cache.get(graphHash));
      return;
    }

    // Debounce requests
    if (this.pending.has(graphHash)) {
      clearTimeout(this.pending.get(graphHash));
    }

    this.pending.set(
      graphHash,
      setTimeout(() => {
        this.generatePreview(graphHash).then(result => {
          this.cache.set(graphHash, result);
          callback(result);
        });
      }, 300)
    );
  }
};
```

### 7. Edit Interaction Animations

```css
/* Smooth edit mode transitions */
.node-container {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: center;
}

.node-container.editing {
  transform: scale(1.05);
  box-shadow:
    0 0 0 2px var(--primary-color),
    0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

/* Input field animations */
.inline-input {
  animation: slideIn 0.15s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Validation feedback */
.node-container.has-error {
  animation: shake 0.3s ease-in-out;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-4px);
  }
  75% {
    transform: translateX(4px);
  }
}
```

### 8. Undo/Redo System Integration

```typescript
interface EditAction {
  type: 'EDIT_NODE';
  nodeId: string;
  oldValue: any;
  newValue: any;
  timestamp: number;
}

class InlineEditHistory {
  private history: EditAction[] = [];
  private currentIndex: number = -1;

  recordEdit(nodeId: string, oldValue: any, newValue: any) {
    // Remove any actions after current index (branching)
    this.history = this.history.slice(0, this.currentIndex + 1);

    // Add new action
    this.history.push({
      type: 'EDIT_NODE',
      nodeId,
      oldValue,
      newValue,
      timestamp: Date.now()
    });

    this.currentIndex++;

    // Limit history size
    if (this.history.length > 100) {
      this.history.shift();
      this.currentIndex--;
    }
  }

  undo(): EditAction | null {
    if (this.currentIndex < 0) return null;
    const action = this.history[this.currentIndex];
    this.currentIndex--;
    return action;
  }

  redo(): EditAction | null {
    if (this.currentIndex >= this.history.length - 1) return null;
    this.currentIndex++;
    return this.history[this.currentIndex];
  }
}
```

## Implementation Phases

### Phase 1: Basic Text Editing (Week 1)

- Simple text nodes with inline input
- Enter/Escape/Tab navigation
- Basic validation

### Phase 2: Complex Editors (Week 2)

- Weighted choice with sliders
- Multi-field nodes
- Validation with error display

### Phase 3: Performance & Polish (Week 3)

- Virtual editing for large graphs
- Smooth animations
- Keyboard navigation refinements

### Phase 4: Advanced Features (Week 4)

- Undo/redo integration
- Copy/paste between nodes
- Bulk editing operations

## Testing Strategy

1. **Unit Tests**: Each editor component in isolation
2. **Integration Tests**: Edit flow with React Flow
3. **Performance Tests**: 100+ node graphs
4. **Accessibility Tests**: Keyboard-only operation
5. **User Tests**: Time-to-edit metrics

## Success Criteria

- Edit latency: <50ms to enter edit mode
- Preview update: <300ms debounced
- Keyboard navigation: 100% feature coverage
- Memory usage: <100MB for 200 nodes
- Accessibility: WCAG 2.1 AA compliant

---

_Technical specification by Sarah (PO) for developer reference_
