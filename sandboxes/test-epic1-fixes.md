# Epic1 Fixes Test Checklist

Historical note: this checklist documents a past Epic 1 fix pass. It should not
be read as architecture guidance or evidence that any alternate refactor became
the canonical editor implementation.

## Fixed Issues:

### 1. ✅ Green Output Dot Visibility
- **Fixed**: Output node's green handle now only shows when it has an incoming connection
- **Implementation**: Uses `useStore` to check for incoming edges and conditionally sets opacity
- **CSS**: Added `.hidden-handle` class handling with hover states

### 2. ✅ Main Output Handle Position
- **Fixed**: When branching is enabled, main output stays on right edge (not jumping to top)
- **Implementation**: Changed `Position.Top` to `Position.Right` with proper positioning
- **Style**: Set to `right: -8px, top: 10%` for consistent placement

### 3. ✅ Handle Position After Edit Mode
- **Fixed**: Handle positioning is now consistent between edit and display modes
- **Implementation**: Used same positioning styles in both modes
- **Note**: Main output handled by BaseEditableNode when no branching

### 4. ✅ Connection Replacement
- **Fixed**: Dragging to an already-connected node now replaces the existing connection
- **Implementation**: Added logic in `onConnect` to remove existing incoming edge before adding new one
- **Validation**: Removed error for existing connections, allowing replacement

### 5. ✅ Delete Key for Edges
- **Fixed**: Delete key now properly deletes selected edges
- **Implementation**: 
  - Enabled `deleteKeyCode={['Delete', 'Backspace']}` in ReactFlow
  - Enhanced KeyboardShortcuts to handle edge deletion
  - Added edge selection state tracking

### 6. ✅ Single Incoming Connection
- **Fixed**: Nodes now enforce single incoming connection (except concat nodes)
- **Implementation**: Connection replacement logic automatically handles this
- **Note**: Better UX than showing error - just replaces existing connection

## Testing Instructions:

1. **Output Node Green Dot**:
   - Create an Output node - green dot should NOT be visible
   - Connect something to it - green dot should appear
   - Hover over unconnected Output node - dot should show faintly

2. **Branching Main Output**:
   - Create Enhanced Branching node
   - Enable branching on an option - main output should stay on right edge
   - Exit edit mode - handle should remain on right edge

3. **Connection Replacement**:
   - Connect Node A to Node B
   - Now drag from Node C to Node B
   - The A→B connection should be replaced with C→B

4. **Edge Deletion**:
   - Click on an edge to select it (should highlight in cyan)
   - Press Delete or Backspace - edge should be deleted
   - Select multiple edges with Shift+click - all should delete

5. **Handle Visibility During Connection**:
   - Start dragging a connection
   - Output nodes should show their handles during dragging
   - Valid targets should glow green

## Code Changes Summary:

- `BaseEditableNode.tsx`: Added output node exception for handle display
- `EnhancedBranchingNode.tsx`: Fixed main output position to stay on right
- `OutputNode.tsx`: Already had connection detection logic
- `Epic1GraphEditor.tsx`: Added connection replacement and enabled delete keys
- `KeyboardShortcuts.tsx`: Added edge deletion handling
- `ConnectionValidator.ts`: Allows replacement instead of blocking
- CSS files: Enhanced handle visibility states
