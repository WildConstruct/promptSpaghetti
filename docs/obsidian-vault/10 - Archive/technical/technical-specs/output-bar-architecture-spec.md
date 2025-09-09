# Output Bar Architecture Technical Specification

## Overview

The Output Bar is a resizable, collapsible panel that displays graph execution results. It must be repositioned as a sibling to the canvas (not a child) to prevent z-index conflicts and event propagation issues.

## Current Architecture Issues

### Problem: DOM Hierarchy

```html
<!-- CURRENT (PROBLEMATIC) -->
<div class="canvas-container">
  <ReactFlowCanvas>
    <!-- Graph nodes and edges -->
    <OutputBar />
    <!-- CHILD of canvas - causes issues -->
  </ReactFlowCanvas>
</div>

<!-- REQUIRED -->
<div class="app-workspace">
  <div class="canvas-container">
    <ReactFlowCanvas>
      <!-- Graph nodes and edges -->
    </ReactFlowCanvas>
  </div>
  <OutputBar />
  <!-- SIBLING of canvas -->
</div>
```

## New Component Architecture

### File Structure

```
packages/core/components/OutputBar/
├── OutputBar.tsx                 # Main component
├── OutputBar.styles.ts           # Styled components
├── OutputBar.types.ts            # Type definitions
├── OutputBarHeader.tsx           # Header with controls
├── OutputBarContent.tsx          # Content display area
├── OutputBarResizer.tsx          # Resize handle component
├── hooks/
│   ├── useOutputBarState.ts     # State management
│   ├── useResizable.ts          # Resize logic
│   └── useAnimations.ts         # Animation hooks
└── __tests__/
    └── OutputBar.test.tsx
```

### Component Interface

```typescript
interface OutputBarProps {
  position?: 'bottom' | 'right' | 'floating';
  defaultHeight?: number;
  minHeight?: number;
  maxHeight?: number;
  defaultWidth?: number; // For right position
  minWidth?: number; // For right position
  maxWidth?: number; // For right position
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
  onResize?: (dimensions: Dimensions) => void;
  className?: string;
  persistState?: boolean; // Save to localStorage
  animationDuration?: number;
}

interface OutputBarState {
  isMinimized: boolean;
  isMaximized: boolean;
  isResizing: boolean;
  currentHeight: number;
  currentWidth: number;
  previousHeight: number;
  previousWidth: number;
  position: 'bottom' | 'right' | 'floating';
  floatingPosition?: { x: number; y: number };
  outputs: OutputEntry[];
  activeTab: string;
}

interface OutputEntry {
  id: string;
  timestamp: number;
  seed: number;
  result: string;
  executionTime: number;
  nodeCount: number;
  error?: string;
}
```

## State Management

### Zustand Store

```typescript
interface OutputBarStore {
  // State
  state: OutputBarState;

  // Actions
  minimize: () => void;
  maximize: () => void;
  restore: () => void;
  resize: (dimensions: Partial<Dimensions>) => void;
  setPosition: (position: Position) => void;
  addOutput: (output: OutputEntry) => void;
  clearOutputs: () => void;
  setActiveTab: (tabId: string) => void;

  // Persistence
  loadState: () => void;
  saveState: () => void;
}

const useOutputBarStore = create<OutputBarStore>(
  persist(
    (set, get) => ({
      state: defaultState,

      minimize: () => {
        const { currentHeight, currentWidth } = get().state;
        set(state => ({
          state: {
            ...state.state,
            isMinimized: true,
            isMaximized: false,
            previousHeight: currentHeight,
            previousWidth: currentWidth,
            currentHeight: MINIMIZED_HEIGHT
          }
        }));
      },

      maximize: () => {
        set(state => ({
          state: {
            ...state.state,
            isMinimized: false,
            isMaximized: true,
            currentHeight: calculateMaxHeight(),
            currentWidth: calculateMaxWidth()
          }
        }));
      },

      restore: () => {
        const { previousHeight, previousWidth } = get().state;
        set(state => ({
          state: {
            ...state.state,
            isMinimized: false,
            isMaximized: false,
            currentHeight: previousHeight || DEFAULT_HEIGHT,
            currentWidth: previousWidth || DEFAULT_WIDTH
          }
        }));
      }
    }),
    {
      name: 'output-bar-storage',
      partialize: state => ({
        position: state.state.position,
        previousHeight: state.state.previousHeight,
        previousWidth: state.state.previousWidth
      })
    }
  )
);
```

## Layout System

### CSS Grid Layout

```css
.app-workspace {
  display: grid;
  grid-template-areas:
    'canvas canvas'
    'output output';
  grid-template-rows: 1fr auto;
  height: 100vh;
  position: relative;
}

.app-workspace--output-right {
  grid-template-areas: 'canvas output';
  grid-template-columns: 1fr auto;
  grid-template-rows: 1fr;
}

.canvas-container {
  grid-area: canvas;
  position: relative;
  overflow: hidden;
}

.output-bar {
  grid-area: output;
  position: relative;
  z-index: 10; /* Above canvas but below modals */
}

.output-bar--floating {
  position: fixed;
  grid-area: unset;
  z-index: 100;
}
```

### Dimensions Configuration

```typescript
const DIMENSIONS = {
  MINIMIZED_HEIGHT: 40,
  DEFAULT_HEIGHT: 300,
  MAX_HEIGHT_RATIO: 0.7, // 70% of viewport
  MIN_HEIGHT: 100,

  DEFAULT_WIDTH: 400, // For right position
  MAX_WIDTH_RATIO: 0.5, // 50% of viewport
  MIN_WIDTH: 250,

  HEADER_HEIGHT: 40,
  RESIZE_HANDLE_SIZE: 6,

  ANIMATION_DURATION: 300,
  ANIMATION_EASING: 'cubic-bezier(0.4, 0, 0.2, 1)'
};
```

## Resize System

### Resize Hook

```typescript
function useResizable({
  onResize,
  minHeight,
  maxHeight,
  minWidth,
  maxWidth,
  snapToGrid = false,
  gridSize = 10
}: ResizableOptions) {
  const [isResizing, setIsResizing] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const startDimensions = useRef({ width: 0, height: 0 });
  const startPosition = useRef({ x: 0, y: 0 });

  const handleResizeStart = useCallback(
    (e: MouseEvent) => {
      setIsResizing(true);
      startDimensions.current = { ...dimensions };
      startPosition.current = { x: e.clientX, y: e.clientY };

      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      document.body.style.cursor = 'ns-resize';
      document.body.style.userSelect = 'none';
    },
    [dimensions]
  );

  const handleResizeMove = useCallback(
    (e: MouseEvent) => {
      const deltaY = startPosition.current.y - e.clientY;
      let newHeight = startDimensions.current.height + deltaY;

      // Apply constraints
      newHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));

      // Snap to grid
      if (snapToGrid) {
        newHeight = Math.round(newHeight / gridSize) * gridSize;
      }

      setDimensions(prev => ({ ...prev, height: newHeight }));
      onResize?.({ height: newHeight });
    },
    [minHeight, maxHeight, snapToGrid, gridSize, onResize]
  );

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, [handleResizeMove]);

  return {
    isResizing,
    dimensions,
    handleResizeStart,
    resizeRef: useRef<HTMLDivElement>(null)
  };
}
```

## Animation System

### CSS Transitions

```css
.output-bar {
  transition:
    height 300ms cubic-bezier(0.4, 0, 0.2, 1),
    width 300ms cubic-bezier(0.4, 0, 0.2, 1),
    transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.output-bar--minimizing {
  animation: minimize 300ms forwards;
}

.output-bar--maximizing {
  animation: maximize 300ms forwards;
}

.output-bar--restoring {
  animation: restore 300ms forwards;
}

@keyframes minimize {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0.95;
    transform: translateY(calc(100% - 40px));
  }
}

@keyframes maximize {
  from {
    transform: scale(1);
  }
  to {
    transform: scale(1);
    /* Height handled by JS */
  }
}
```

### Spring Animations (Optional)

```typescript
import { useSpring, animated } from '@react-spring/web';

function useOutputBarAnimation(state: OutputBarState) {
  const springs = useSpring({
    height: state.currentHeight,
    width: state.currentWidth,
    opacity: state.isMinimized ? 0.95 : 1,
    transform: state.isMinimized
      ? `translateY(${state.currentHeight - MINIMIZED_HEIGHT}px)`
      : 'translateY(0px)',
    config: {
      tension: 180,
      friction: 20,
      clamp: false
    }
  });

  return springs;
}
```

## Event Handling

### Preventing Event Propagation

```typescript
function OutputBar() {
  const handleMouseDown = (e: React.MouseEvent) => {
    // Prevent canvas interactions when clicking output bar
    e.stopPropagation();
  };

  const handleWheel = (e: React.WheelEvent) => {
    // Prevent canvas zoom when scrolling in output bar
    e.stopPropagation();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Prevent canvas shortcuts when typing in output bar
    if (e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement) {
      e.stopPropagation();
    }
  };

  return (
    <div
      className="output-bar"
      onMouseDown={handleMouseDown}
      onWheel={handleWheel}
      onKeyDown={handleKeyDown}
      style={{ pointerEvents: 'auto' }}
    >
      {/* Content */}
    </div>
  );
}
```

## Header Controls

### Control Buttons

```typescript
interface OutputBarControls {
  onMinimize: () => void;
  onMaximize: () => void;
  onRestore: () => void;
  onClear: () => void;
  onCopy: () => void;
  onExport: () => void;
  onSettings: () => void;
}

function OutputBarHeader({ state, controls }: HeaderProps) {
  return (
    <div className="output-bar__header">
      <div className="output-bar__title">
        Output ({state.outputs.length})
      </div>

      <div className="output-bar__controls">
        <button
          onClick={state.isMinimized ? controls.onRestore : controls.onMinimize}
          aria-label={state.isMinimized ? 'Restore' : 'Minimize'}
        >
          {state.isMinimized ? '⬆' : '⬇'}
        </button>

        <button
          onClick={state.isMaximized ? controls.onRestore : controls.onMaximize}
          aria-label={state.isMaximized ? 'Restore' : 'Maximize'}
        >
          {state.isMaximized ? '⬇' : '⬆'}
        </button>

        <button onClick={controls.onClear} aria-label="Clear outputs">
          🗑️
        </button>

        <button onClick={controls.onCopy} aria-label="Copy output">
          📋
        </button>

        <button onClick={controls.onExport} aria-label="Export outputs">
          💾
        </button>
      </div>
    </div>
  );
}
```

## Content Display

### Tab System

```typescript
interface OutputTab {
  id: string;
  label: string;
  icon?: string;
  content: React.ReactNode;
  badge?: number;
}

function OutputBarContent({ outputs, activeTab }: ContentProps) {
  const tabs: OutputTab[] = [
    {
      id: 'results',
      label: 'Results',
      content: <ResultsList outputs={outputs} />,
      badge: outputs.length
    },
    {
      id: 'console',
      label: 'Console',
      content: <ConsoleOutput />,
      badge: consoleMessages.length
    },
    {
      id: 'performance',
      label: 'Performance',
      content: <PerformanceMetrics />
    }
  ];

  return (
    <div className="output-bar__content">
      <TabBar tabs={tabs} activeTab={activeTab} />
      <TabContent tabs={tabs} activeTab={activeTab} />
    </div>
  );
}
```

## Accessibility

### ARIA Attributes

```typescript
<div
  role="region"
  aria-label="Output panel"
  aria-expanded={!state.isMinimized}
  aria-live="polite"
  tabIndex={0}
>
  <div role="tablist" aria-label="Output tabs">
    {tabs.map(tab => (
      <button
        key={tab.id}
        role="tab"
        aria-selected={tab.id === activeTab}
        aria-controls={`tabpanel-${tab.id}`}
      >
        {tab.label}
      </button>
    ))}
  </div>

  <div
    role="tabpanel"
    id={`tabpanel-${activeTab}`}
    aria-labelledby={`tab-${activeTab}`}
  >
    {content}
  </div>
</div>
```

### Keyboard Shortcuts

```typescript
const KEYBOARD_SHORTCUTS = {
  'Ctrl+`': 'Toggle output bar',
  'Ctrl+Shift+C': 'Clear outputs',
  'Ctrl+Shift+M': 'Toggle maximize',
  Escape: 'Minimize output bar',
  Tab: 'Navigate between tabs',
  'Ctrl+Tab': 'Next tab',
  'Ctrl+Shift+Tab': 'Previous tab'
};

function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === '`') {
        toggleOutputBar();
      }
      // ... other shortcuts
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
}
```

## Performance Optimizations

### Virtual Scrolling

```typescript
import { FixedSizeList } from 'react-window';

function ResultsList({ outputs }: { outputs: OutputEntry[] }) {
  return (
    <FixedSizeList
      height={300}
      itemCount={outputs.length}
      itemSize={50}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <OutputItem output={outputs[index]} />
        </div>
      )}
    </FixedSizeList>
  );
}
```

### Memoization

```typescript
const OutputItem = React.memo(({ output }: { output: OutputEntry }) => {
  return (
    <div className="output-item">
      <span className="seed">Seed: {output.seed}</span>
      <span className="result">{output.result}</span>
      <span className="time">{output.executionTime}ms</span>
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.output.id === nextProps.output.id;
});
```

## Testing Strategy

### Unit Tests

```typescript
describe('OutputBar', () => {
  it('should render as sibling of canvas');
  it('should minimize to correct height');
  it('should restore to previous height');
  it('should maximize to calculated height');
  it('should handle single click maximize correctly');
  it('should prevent event propagation');
  it('should persist state to localStorage');
  it('should handle keyboard shortcuts');
  it('should resize within constraints');
});
```

### Integration Tests

```typescript
describe('OutputBar Integration', () => {
  it('should not interfere with canvas interactions');
  it('should maintain correct z-index hierarchy');
  it('should animate smoothly between states');
  it('should handle rapid state changes');
  it('should work with different viewport sizes');
});
```

## Migration Plan

### Phase 1: Restructure DOM

1. Move OutputBar out of ReactFlowCanvas
2. Create new workspace container
3. Update CSS grid layout

### Phase 2: Fix State Management

1. Implement proper minimize/restore logic
2. Fix maximize single-click behavior
3. Add state persistence

### Phase 3: Polish UX

1. Add smooth animations
2. Implement resize functionality
3. Add keyboard shortcuts
4. Improve accessibility
