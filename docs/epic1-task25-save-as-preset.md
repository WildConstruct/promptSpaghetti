# Epic 1 - Task 25: Save as Preset Functionality

## Overview

Task 25 implements the ability for users to save any node configuration as a reusable preset. This feature completes the asset library system by allowing users to build their own preset collections from existing nodes.

## Implementation Details

### 1. Context Menu System

Added right-click context menu support to all nodes:

```typescript
// BaseEditableNode.tsx
export interface EditableNodeData {
  // ...existing fields
  onContextMenu?: (event: React.MouseEvent) => void;
}

// Context menu handler
const handleContextMenu = (e: React.MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
  data.onContextMenu?.(e);
};
```

The context menu provides options for:
- **Save as Preset** - Save current node configuration
- **Duplicate** (optional) - Clone the node
- **Delete** (optional) - Remove the node

### 2. Save As Preset Dialog

Created a comprehensive dialog for saving presets:

```typescript
interface SaveAsPresetDialogProps {
  isOpen: boolean;
  nodeData: EditableNodeData | null;
  nodeType: string;
  onClose: () => void;
  onSave: (preset: Preset) => void;
}
```

Features:
- **Name** (required) - Preset identifier
- **Category** - Organize presets by type
- **Tags** - Comma-separated keywords for search
- **Description** - Optional details about the preset
- **Preview** - Shows current node configuration

### 3. Preset Creation Utility

The `createPresetFromNode` function converts node data into preset format:

```typescript
export function createPresetFromNode(
  nodeData: EditableNodeData,
  nodeType: string,
  name: string,
  category: string,
  tags: string[] = []
): Preset
```

Handles all node types:
- TextBlock → `{ text: value }`
- WeightedChoice → `{ options: [...] }`
- Concat → `{ separator: value }`
- Variable → `{ variableName, operation, value }`
- Output → `{ label: value }`

### 4. Integration with Epic1GraphEditor

Added state management and handlers:

```typescript
// Context menu and save-as-preset state
const [contextMenuPosition, setContextMenuPosition] = useState<ContextMenuPosition | null>(null);
const [contextMenuNodeId, setContextMenuNodeId] = useState<string | null>(null);
const [saveAsPresetNodeId, setSaveAsPresetNodeId] = useState<string | null>(null);
const [customPresets, setCustomPresets] = useState<Preset[]>([]);
```

## User Workflow

1. **Right-click any node** to open context menu
2. **Select "Save as Preset"** from the menu
3. **Fill in preset details**:
   - Give it a meaningful name
   - Choose appropriate category
   - Add search tags
   - Optionally add description
4. **Click "Save Preset"** to add to library
5. **Success toast** confirms preset saved

## Technical Architecture

### Component Structure
```
Epic1GraphEditor
├── Nodes (with onContextMenu handlers)
├── NodeContextMenu (right-click menu)
├── SaveAsPresetDialog (preset form)
└── AssetLibrary (displays saved presets)
```

### Data Flow
1. Node right-click → triggers `onContextMenu`
2. Context menu appears at cursor position
3. "Save as Preset" → opens dialog
4. Form submission → creates preset object
5. Preset added to `customPresets` state
6. Asset library updates to show new preset

## Key Features

### 1. Smart Preset Generation
- Automatically extracts relevant data from nodes
- Preserves node type compatibility
- Generates unique IDs with timestamps

### 2. Category System
- Predefined categories for organization
- Custom category option for flexibility
- Categories match existing asset library structure

### 3. Search Integration
- Tags enable findability
- Description provides context
- Integrates with asset library search

### 4. Visual Feedback
- Context menu at cursor position
- Preview shows exact node data
- Success toast on save
- Form validation for required fields

## Test Coverage

### SaveAsPresetDialog Tests
- Form rendering and validation
- Preset creation with all fields
- Tag parsing and formatting
- Different node type handling
- Unique ID generation

### NodeContextMenu Tests
- Menu positioning and visibility
- Action handlers (save, duplicate, delete)
- Outside click dismissal
- Escape key handling
- Viewport boundary detection

## Benefits

1. **User Empowerment** - Build custom preset libraries
2. **Workflow Efficiency** - Reuse complex configurations
3. **Knowledge Sharing** - Export/share preset collections
4. **Discoverability** - Tagged presets are searchable
5. **Consistency** - Standardize common patterns

## Files Created/Modified

### Created
- `/packages/core/components/epic1/asset-library/SaveAsPresetDialog.tsx`
- `/packages/core/components/epic1/asset-library/SaveAsPresetDialog.css`
- `/packages/core/components/epic1/nodes/NodeContextMenu.tsx`
- `/packages/core/components/epic1/nodes/NodeContextMenu.css`
- `/packages/core/components/epic1/examples/SaveAsPresetDemo.tsx`
- `/packages/core/components/epic1/asset-library/__tests__/SaveAsPresetDialog.test.tsx`
- `/packages/core/components/epic1/nodes/__tests__/NodeContextMenu.test.tsx`

### Modified
- `/packages/core/components/epic1/nodes/BaseEditableNode.tsx` - Added context menu support
- `/packages/core/components/epic1/Epic1GraphEditor.tsx` - Integrated save-as-preset flow
- `/packages/core/components/epic1/asset-library/index.ts` - Exported new components
- `/packages/core/components/epic1/nodes/index.ts` - Exported context menu

## Future Enhancements

1. **Preset Management**
   - Edit existing presets
   - Delete custom presets
   - Bulk operations

2. **Export/Import**
   - Save preset collections to file
   - Share preset packs
   - Version control for presets

3. **Advanced Features**
   - Preset thumbnails
   - Usage statistics
   - Preset recommendations
   - Collaborative preset libraries

## Demo

Run the demo to see save-as-preset in action:
```typescript
import { SaveAsPresetDemo } from '@core/components/epic1/examples/SaveAsPresetDemo';
```

The demo shows:
- Right-click context menu
- Save dialog workflow
- Custom preset creation
- Integration with asset library

## Summary

Task 25 completes the asset library system by enabling users to create their own presets from any node configuration. This bidirectional flow (drag presets to create nodes, save nodes as presets) creates a powerful system for rapid graph development and knowledge sharing.