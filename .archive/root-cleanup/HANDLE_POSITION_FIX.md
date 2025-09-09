# BranchingWeightedChoiceNode Handle Position Stabilization Fix

## Problem

The branch output handles on BranchingWeightedChoiceNode were jumping to different positions when the node state changed, making it difficult to maintain stable connections.

## Root Cause

1. Options were being assigned unstable IDs that changed when props updated
2. React was re-rendering options in different positions due to unstable keys
3. Handle IDs were changing, causing ReactFlow to recreate handles in new positions

## Solution Implemented

### 1. Stable ID Generation

- Changed from timestamp-based random IDs to deterministic IDs based on node ID and option index
- `option-${Date.now()}-${index}-${Math.random()}` → `${props.id}-option-${index}`

### 2. ID Preservation During Updates

- Enhanced the useEffect to preserve existing option IDs when props change
- First tries to match by index, then by content (text + weight)
- Only generates new IDs for truly new options

### 3. React Key Stability

- Changed from using array index as key to using the stable option ID
- `key={index}` → `key={option.id}`

### 4. CSS Height Consistency

- Fixed option row heights to ensure consistent handle positioning
- Edit mode: `height: 48px`
- Display mode: `height: 48px`
- Prevents layout shifts that could move handles

### 5. Handle Position Rules

- Added CSS rules to ensure branch handles always position at:
  - `top: 50%`
  - `right: -10px`
  - `transform: translateY(-50%)`

## Files Modified

1. `/packages/core/components/epic1/nodes/BranchingWeightedChoiceNode.tsx`
   - Stable ID generation
   - ID preservation logic
   - Key prop fixes

2. `/packages/core/components/epic1/nodes/BranchingWeightedChoice.css`
   - Fixed heights for option containers
   - Explicit handle positioning rules

## Testing

To verify the fix:

1. Create a BranchingWeightedChoiceNode
2. Add multiple options with branch outputs enabled
3. Connect edges to the branch handles
4. Edit the node (add/remove/reorder options)
5. Branch handles should remain in stable positions
6. Existing connections should be maintained

## Impact

- No breaking changes
- Handles maintain position through all node state changes
- Existing graphs will work without modification
- New graphs will have more stable handle behavior
