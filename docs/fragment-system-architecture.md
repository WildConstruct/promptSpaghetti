# Fragment System Architecture

## Overview

The application uses a **hybrid grouping system** with clear separation between two distinct containment mechanisms:

1. **Fragment Containers** - For PSG fragments (reusable components)
2. **Region Boxes** - For manual grouping by users

This architecture resolves the previous conflict where both systems were trying to manage node containment simultaneously.

## System Separation

### Fragment Containers (Component-based)

- **Node Type**: `fragmentContainer`
- **Visual Style**: Purple rounded containers (📦)
- **Containment Method**: React Flow's native `parentNode` relationships
- **Position System**: Relative to parent container
- **Movement**: Children automatically move with parent
- **Purpose**: Pre-built reusable component groups from `.psg` files

```typescript
// Fragment container structure
{
  id: 'fragment-xyz-123',
  type: 'fragmentContainer',
  data: {
    title: 'Character Generator',
    description: 'Generates character descriptions',
    isCollapsed: true,
    fragmentSource: 'characters.psg',
    nodeCount: 5
  }
}

// Child node with parent relationship
{
  id: 'node-1',
  type: 'weightedChoice',
  parentNode: 'fragment-xyz-123',  // React Flow parent-child
  position: { x: 10, y: 10 },       // Relative to parent
  extent: 'parent'                  // Constrained to parent bounds
}
```

### Region Boxes (Position-based)

- **Node Type**: `enhancedBoundingBox`
- **Visual Style**: Teal dashed borders
- **Containment Method**: Position-based detection
- **Position System**: Absolute in canvas space
- **Movement**: Manual via lock button
- **Purpose**: User-created visual grouping

```typescript
// Region box structure
{
  id: 'region-1',
  type: 'enhancedBoundingBox',
  data: {
    title: 'Story Elements',
    borderColor: '#22d3ee',
    borderStyle: 'dashed',
    locked: false
  }
}

// Nodes are contained by position, not parent relationship
```

## Key Principles

### 1. No Mixed Systems

A node is **EITHER**:
- In a fragment (has `parentNode`) **OR**
- In a region box (position-based) **OR**
- Free-standing

Never both. This prevents double movement and conflicting behaviors.

### 2. Clear Visual Distinction

Users can immediately identify:
- **Purple rounded** = Fragment Container (component)
- **Teal dashed** = Region Box (manual group)

### 3. Independent Operation

- Fragment containers handle their own collapse/expand
- Region boxes handle their own lock/move
- No cross-system interference

## Implementation Details

### PSG Parser Changes

The PSG parser (`packages/core/fileFormats/psg.ts`) now:

1. Creates `fragmentContainer` instead of `enhancedBoundingBox` for fragments
2. Filters out Output nodes from fragments
3. Sets all fragment nodes with `parentNode` relationship
4. Uses relative positioning for children

### EnhancedBoundingBox Changes

The EnhancedBoundingBox (`packages/core/components/epic1/nodes/EnhancedBoundingBox.tsx`) now:

1. **Excludes** nodes with `parentNode` from containment
2. Only uses position-based detection
3. Only moves position-contained nodes when locked
4. Ignores `fragmentContainer` nodes

### New FragmentContainer Component

The FragmentContainer (`packages/core/components/epic1/nodes/FragmentContainer.tsx`):

1. Uses React Flow's native parent-child system
2. Handles collapse/expand of children
3. Provides clear purple visual styling
4. Shows fragment metadata (source, node count)

## Migration Strategy

### Automatic Detection

The migration script detects graphs needing migration by checking for:
- `enhancedBoundingBox` nodes with children (`parentNode`)
- Nodes with both `parentNode` and region membership
- Mixed system patterns

### Migration Process

1. **Identify** fragment boxes (enhancedBoundingBox with children)
2. **Convert** to FragmentContainer type
3. **Clean** node relationships (remove dual membership)
4. **Validate** edges remain valid
5. **Add** migration metadata

### Rollback Support

- Feature flag: `USE_LEGACY_FRAGMENT_SYSTEM`
- Backup creation: `--backup` flag
- Dry run mode: `--dry-run` flag

## Usage Examples

### Dropping a Fragment

```javascript
// When a .psg fragment is dropped:
1. Create FragmentContainer at drop location
2. Add all fragment nodes as children (parentNode)
3. Set relative positions
4. Start in collapsed state
```

### Creating a Region Box

```javascript
// When user creates a region box:
1. Create EnhancedBoundingBox
2. No parent-child relationships
3. Use position detection for containment
4. Lock button enables group movement
```

## Benefits

### Performance

- **Single movement cycle**: No double movement from dual systems
- **Clear ownership**: Each node has one container at most
- **Optimized rendering**: No conflicting z-index issues

### User Experience

- **Visual clarity**: Purple vs Teal distinction
- **Predictable behavior**: No jumping or teleporting nodes
- **Clean interactions**: Collapse/expand vs lock/move

### Maintainability

- **Clear separation**: Two independent systems
- **Easier debugging**: No mixed state issues
- **Future-proof**: Can enhance each system independently

## Testing

### Fragment Container Tests

- Collapse/expand functionality
- Parent-child relationships
- Purple visual styling
- Metadata display

### Region Box Tests

- Position-based containment only
- Exclusion of nodes with parentNode
- Lock and movement behavior
- Teal visual styling

### Integration Tests

- Fragments and regions coexist
- No interference between systems
- Migration of old graphs
- Performance benchmarks

## Monitoring

Key metrics to track:

- Fragment load time (P50, P95, P99)
- Render performance during expand/collapse
- Error rates (parent not found, etc.)
- User preference (fragments vs regions)

## Future Enhancements

### Potential Improvements

1. **Fragment Library UI**: Better browsing and preview
2. **Smart Grouping**: AI-suggested region creation
3. **Nested Fragments**: Fragments containing fragments
4. **Template System**: Convert regions to reusable fragments

### Compatibility

The new system maintains backward compatibility through:
- Migration script for existing graphs
- Feature flag for gradual rollout
- Automatic detection of old patterns

## Conclusion

The hybrid fragment system provides clear separation between reusable components (fragments) and manual grouping (regions), eliminating the previous dual-system conflicts while maintaining both features for different use cases.