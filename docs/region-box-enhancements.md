# Region Box Enhancement Specification

## Priority 1: Collapse/Expand Functionality

### Collapsed State

```typescript
interface CollapsedRegion {
  id: string;
  label: string;
  color: string;
  isCollapsed: true;
  dimensions: { width: 200; height: 80 }; // Compact size
  ports: {
    inputs: Port[]; // External input connections
    outputs: Port[]; // External output connections
  };
}
```

### Visual Behavior

- **Collapsed**: Shows as colored header bar with label + connection ports
- **Expanded**: Full region box with all internal nodes visible
- **Toggle**: Double-click header or click expand/collapse icon
- **Animation**: Smooth transition between states (200ms)

## Priority 2: Named Input/Output Ports

### Port Definition

```typescript
interface Port {
  id: string;
  label: string; // "Expression", "Intensity", etc.
  type: 'string' | 'number' | 'choice' | 'any';
  color: string; // Type-based color coding
  direction: 'input' | 'output';
  nodeId: string; // Internal node this connects to
  position: 'left' | 'right' | 'top' | 'bottom';
}
```

### Port Mapping Rules

1. **Automatic Detection**:
   - Scan internal nodes for external connections
   - Create ports for any edges crossing region boundary
   - Auto-label based on connected node labels

2. **Manual Override**:
   - User can rename ports for clarity
   - Reorder ports for better layout
   - Hide internal-only connections

### Example: Micro-Expression Region

```
┌─── Micro-Expressions [COLLAPSED] ───┐
│ ◉ character_in                      │
│                          intensity ◉ │
│                          expression ◉│
│                          context ◉   │
└──────────────────────────────────────┘
```

When expanded:

```
┌─── Micro-Expressions [EXPANDED] ─────────────┐
│ ◉ character_in → [WeightedChoice: Expression]│
│                   [WeightedChoice: Intensity] │
│                   [WeightedChoice: Context]   │
│                   [Output: Combined] ────────◉│
└───────────────────────────────────────────────┘
```

## Priority 3: Auto-Layout Fix

### Current Issue

- Nodes overlap when placed in region
- Text nodes get hidden behind larger nodes

### Solution

```typescript
function autoLayoutRegion(region: Region) {
  const PADDING = 20;
  const NODE_SPACING = 50;

  // Sort nodes by connection order
  const sorted = topologicalSort(region.nodes);

  // Arrange in grid with proper spacing
  let x = region.x + PADDING;
  let y = region.y + PADDING;
  let rowHeight = 0;

  sorted.forEach(node => {
    if (x + node.width > region.x + region.width - PADDING) {
      // New row
      x = region.x + PADDING;
      y += rowHeight + NODE_SPACING;
      rowHeight = 0;
    }

    node.position = { x, y };
    x += node.width + NODE_SPACING;
    rowHeight = Math.max(rowHeight, node.height);
  });
}
```

## Implementation Approach

### Phase 1: Basic Collapse (Week 1)

- Add isCollapsed state to region schema
- Implement toggle interaction
- Hide internal nodes when collapsed
- Show region label and color

### Phase 2: Port System (Week 2)

- Detect external connections
- Generate port list
- Render ports on collapsed region
- Maintain connection integrity

### Phase 3: Polish (Week 3)

- Smooth animations
- Port labeling UI
- Auto-layout algorithm
- Color-coded type system

## Benefits

1. **Reduced Complexity**: Collapsed regions simplify large graphs
2. **Modular Reuse**: Regions become reusable components
3. **Better Organization**: Named ports clarify data flow
4. **Professional Feel**: Matches tools like Houdini, Nuke, TouchDesigner

## Technical Considerations

### State Management

```typescript
interface RegionState {
  id: string;
  isCollapsed: boolean;
  cachedPorts?: Port[]; // Cache for performance
  internalLayout?: Layout; // Preserve layout when collapsed
  externalConnections: Edge[]; // Edges crossing boundary
}
```

### Performance

- Don't render internal nodes when collapsed (virtual DOM optimization)
- Cache port calculations
- Debounce collapse animations
- Use CSS transforms for smooth transitions

## Similar Prior Art

- **Softimage ICE**: Compound nodes with labeled ports
- **Houdini**: Network boxes with dive-in/dive-out
- **Unreal Blueprints**: Collapsed graphs with pin connections
- **TouchDesigner**: Container components

## User Stories

1. "As a user, I want to collapse complex regions to focus on high-level flow"
2. "As a user, I want to see what data flows in/out of a region without expanding it"
3. "As a user, I want regions to behave like reusable components I can copy/paste"
