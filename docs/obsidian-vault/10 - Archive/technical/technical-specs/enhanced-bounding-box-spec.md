# Enhanced Bounding Box Component Technical Specification

## Overview

The EnhancedBoundingBox is a React Flow custom node that provides visual grouping, collapse/expand functionality, and port management for contained nodes. It acts as both a visual container and a logical grouping mechanism.

## Component Architecture

### File Structure

```
packages/core/components/epic1/nodes/
├── EnhancedBoundingBox.tsx      # Main component
├── BoundingBox.css               # Styles
├── EnhancedBoundingBox.types.ts # Type definitions
└── __tests__/
    └── EnhancedBoundingBox.test.tsx
```

### Component Props Interface

```typescript
interface EnhancedBoundingBoxProps extends NodeProps {
  data: EnhancedBoundingBoxData;
  selected: boolean;
  id: string;
  xPos: number;
  yPos: number;
  draggable?: boolean;
  measured?: NodeDimensionUpdate;
}

interface EnhancedBoundingBoxData {
  // Visual Properties
  title: string;
  description?: string;
  backgroundColor: string; // Hex color
  opacity: number; // 0-1
  borderColor: string; // Hex color
  borderStyle: 'solid' | 'dashed' | 'dotted';
  borderWidth: number; // pixels
  borderRadius?: number; // pixels

  // Functional Properties
  locked: boolean; // Prevent editing
  width?: number; // Initial/current width
  height?: number; // Initial/current height
  isCollapsed?: boolean; // Collapse state
  autoLayout?: boolean; // Auto-arrange contained nodes

  // Port System
  ports?: Port[]; // Explicit connection points
  autoDetectPorts?: boolean; // Auto-detect from edges

  // Metadata
  category?: string; // For theming
  tags?: string[]; // For filtering
  zIndex?: number; // Layer ordering
}

interface Port {
  id: string;
  label: string;
  type: 'string' | 'number' | 'choice' | 'any';
  direction: 'input' | 'output';
  position: Position; // Top, Right, Bottom, Left
  nodeId?: string; // Connected internal node
  color?: string; // Visual indicator
  required?: boolean; // Validation
}
```

## State Management

### Internal State

```typescript
const [isEditingTitle, setIsEditingTitle] = useState(false);
const [title, setTitle] = useState(data.title);
const [isEditingDescription, setIsEditingDescription] = useState(false);
const [description, setDescription] = useState(data.description);
const [isResizing, setIsResizing] = useState(false);
const [isCollapsed, setIsCollapsed] = useState(data.isCollapsed);
const [isAnimating, setIsAnimating] = useState(false);
const [size, setSize] = useState({ width, height });
const [ports, setPorts] = useState<Port[]>(data.ports || []);

// Refs for performance
const sizeRef = useRef(size);
const expandedHeightRef = useRef(height);
const boxRef = useRef<HTMLDivElement>(null);
```

### React Flow Integration

```typescript
const { setNodes, getNodes, getEdges } = useReactFlow();

// Update node data in React Flow store
const updateNodeData = (updates: Partial<EnhancedBoundingBoxData>) => {
  setNodes(nodes =>
    nodes.map(node =>
      node.id === id ? { ...node, data: { ...node.data, ...updates } } : node
    )
  );
};
```

## Layout System

### Collapse/Expand Behavior

```typescript
// Collapsed dimensions
const COLLAPSED_HEIGHT = 80;
const COLLAPSED_PADDING = 10;

// Expanded dimensions
const MIN_EXPANDED_HEIGHT = 200;
const MIN_EXPANDED_WIDTH = 400;
const DEFAULT_PADDING = 20;
const HEADER_HEIGHT = 40;

// Animation timing
const ANIMATION_DURATION = 300; // ms
const ANIMATION_EASING = 'ease-in-out';
```

### Auto-Layout Algorithm

```typescript
interface LayoutOptions {
  strategy: 'grid' | 'flow' | 'tree' | 'force';
  spacing: { x: number; y: number };
  padding: { top: number; right: number; bottom: number; left: number };
  animate: boolean;
}

function autoLayoutNodes(
  containedNodes: Node[],
  boundingBox: BoundingBoxBounds,
  options: LayoutOptions
): NodePosition[] {
  switch (options.strategy) {
    case 'grid':
      return calculateGridLayout(containedNodes, boundingBox, options);
    case 'flow':
      return calculateFlowLayout(containedNodes, boundingBox, options);
    case 'tree':
      return calculateTreeLayout(containedNodes, boundingBox, options);
    case 'force':
      return calculateForceLayout(containedNodes, boundingBox, options);
  }
}
```

## Resize System

### Resize Handle Positions

```typescript
enum ResizeHandle {
  TopLeft = 'tl',
  Top = 't',
  TopRight = 'tr',
  Right = 'r',
  BottomRight = 'br',
  Bottom = 'b',
  BottomLeft = 'bl',
  Left = 'l'
}

interface ResizeState {
  isResizing: boolean;
  activeHandle: ResizeHandle | null;
  startSize: { width: number; height: number };
  startPosition: { x: number; y: number };
  minSize: { width: number; height: number };
  maxSize: { width: number; height: number };
}
```

### Resize Constraints

```typescript
const RESIZE_CONSTRAINTS = {
  minWidth: 200,
  minHeight: 100,
  maxWidth: 2000,
  maxHeight: 2000,
  snapToGrid: true,
  gridSize: 10,
  maintainAspectRatio: false,
  constrainToCanvas: true
};
```

## Port Management

### Port Detection Algorithm

```typescript
function detectPorts(containedNodes: Node[], edges: Edge[]): Port[] {
  const detectedPorts: Port[] = [];
  const containedIds = new Set(containedNodes.map(n => n.id));

  edges.forEach(edge => {
    const sourceInside = containedIds.has(edge.source);
    const targetInside = containedIds.has(edge.target);

    // Edge crosses boundary
    if (sourceInside !== targetInside) {
      if (sourceInside) {
        // Create output port
        detectedPorts.push(createOutputPort(edge, containedNodes));
      } else {
        // Create input port
        detectedPorts.push(createInputPort(edge, containedNodes));
      }
    }
  });

  return mergeDuplicatePorts(detectedPorts);
}
```

### Port Rendering

```typescript
function renderPort(port: Port, index: number): JSX.Element {
  const position = calculatePortPosition(port, index);

  return (
    <Handle
      key={port.id}
      id={port.id}
      type={port.direction === 'input' ? 'target' : 'source'}
      position={port.position}
      style={{
        ...position,
        background: port.color || getDefaultPortColor(port.type),
        width: '12px',
        height: '12px',
        border: '2px solid white',
        zIndex: 1000
      }}
      isConnectable={!isCollapsed}
    >
      <div className="port-label">
        {port.label}
        {port.required && <span className="required">*</span>}
      </div>
    </Handle>
  );
}
```

## CSS Architecture

### BEM Naming Convention

```css
.enhanced-bounding-box {
  /* Block */
}
.enhanced-bounding-box__header {
  /* Element */
}
.enhanced-bounding-box--collapsed {
  /* Modifier */
}
.enhanced-bounding-box--selected {
  /* Modifier */
}

/* Component structure */
.enhanced-bounding-box {
  position: relative;
  border-radius: 8px;
  transition: all 300ms ease-in-out;
}

.enhanced-bounding-box__background {
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: inherit;
}

.enhanced-bounding-box__header {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  gap: 8px;
}

.enhanced-bounding-box__collapse-toggle {
  width: 20px;
  height: 20px;
  cursor: pointer;
  transition: transform 200ms;
}

.enhanced-bounding-box--collapsed .enhanced-bounding-box__collapse-toggle {
  transform: rotate(-90deg);
}

.enhanced-bounding-box__resize-handle {
  position: absolute;
  width: 10px;
  height: 10px;
  background: white;
  border: 2px solid #22d3ee;
  border-radius: 2px;
  cursor: nwse-resize;
  opacity: 0;
  transition: opacity 200ms;
}

.enhanced-bounding-box--selected .enhanced-bounding-box__resize-handle {
  opacity: 1;
}

.enhanced-bounding-box__port {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 4px;
}

.enhanced-bounding-box__port-label {
  font-size: 10px;
  white-space: nowrap;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 2px 4px;
  border-radius: 3px;
  opacity: 0;
  transition: opacity 200ms;
}

.enhanced-bounding-box__port:hover .enhanced-bounding-box__port-label {
  opacity: 1;
}
```

## Z-Index Hierarchy

```typescript
const Z_INDEX = {
  BACKGROUND: -1, // Bounding box background
  CONTAINED_NODES: 0, // Normal nodes inside
  BOUNDING_BOX: 1, // Box border and header
  PORTS: 10, // Connection ports
  RESIZE_HANDLES: 11, // Resize handles
  TOOLTIPS: 100 // Tooltips and labels
};
```

## Performance Optimizations

### Memoization

```typescript
const containedNodes = useMemo(
  () => getContainedNodes(),
  [id, size.width, size.height, getNodes]
);

const detectedPorts = useMemo(
  () => detectPorts(containedNodes, getEdges()),
  [containedNodes, getEdges]
);

const backgroundStyle = useMemo(
  () => ({
    backgroundColor: getBackgroundWithOpacity(
      data.backgroundColor,
      data.opacity
    ),
    borderColor: data.borderColor,
    borderStyle: data.borderStyle,
    borderWidth: `${data.borderWidth}px`
  }),
  [
    data.backgroundColor,
    data.opacity,
    data.borderColor,
    data.borderStyle,
    data.borderWidth
  ]
);
```

### Debouncing

```typescript
const debouncedResize = useMemo(
  () =>
    debounce((newSize: Size) => {
      updateNodeData({ width: newSize.width, height: newSize.height });
    }, 100),
  [id]
);

const debouncedAutoLayout = useMemo(
  () =>
    debounce(() => {
      autoLayoutNodes();
    }, 300),
  []
);
```

## Accessibility

### ARIA Attributes

```tsx
<div
  role="group"
  aria-label={`${title} bounding box`}
  aria-expanded={!isCollapsed}
  tabIndex={0}
  onKeyDown={handleKeyDown}
>
  <button
    aria-label={isCollapsed ? 'Expand' : 'Collapse'}
    onClick={handleCollapseToggle}
  />

  <input
    aria-label="Bounding box title"
    value={title}
    onChange={handleTitleChange}
  />
</div>
```

### Keyboard Navigation

```typescript
const handleKeyDown = (e: React.KeyboardEvent) => {
  switch (e.key) {
    case 'Enter':
      if (e.ctrlKey) toggleCollapse();
      break;
    case 'F2':
      startEditingTitle();
      break;
    case 'Delete':
      if (e.shiftKey) deleteBox();
      break;
    case 'l':
      if (e.ctrlKey) toggleLock();
      break;
  }
};
```

## Testing Requirements

### Unit Tests

```typescript
describe('EnhancedBoundingBox', () => {
  it('should render with default props');
  it('should collapse and expand correctly');
  it('should hide contained nodes when collapsed');
  it('should detect and render ports');
  it('should handle resize correctly');
  it('should auto-layout nodes');
  it('should persist state changes');
  it('should handle keyboard navigation');
});
```

### Integration Tests

```typescript
describe('EnhancedBoundingBox Integration', () => {
  it('should work with React Flow');
  it('should handle edge connections');
  it('should support nested bounding boxes');
  it('should maintain z-index hierarchy');
  it('should animate smoothly');
});
```

## Migration Path

### From Legacy BoundingBox

```typescript
function migrateLegacyBoundingBox(legacyData: any): EnhancedBoundingBoxData {
  return {
    title: legacyData.label || 'Untitled',
    description: legacyData.description || '',
    backgroundColor: legacyData.bgColor || '#1a202c',
    opacity: legacyData.opacity || 0.1,
    borderColor: legacyData.borderColor || '#22d3ee',
    borderStyle: 'solid',
    borderWidth: 2,
    locked: false,
    width: legacyData.width,
    height: legacyData.height,
    isCollapsed: false,
    ports: []
  };
}
```
