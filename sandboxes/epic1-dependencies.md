# Epic1GraphEditor Dependencies

## Direct Imports from Epic1GraphEditor.tsx:

### External Libraries
- [x] react (already have)
- [x] reactflow (already have)
- [x] react-dnd (installed in package.json)
- [x] react-dnd-html5-backend (installed in package.json)

### Internal Components (./nodes/)
- [ ] epic1NodeTypes - from './nodes'
- [ ] EditableNodeData - from './nodes'
- [ ] droppableEpic1NodeTypes - from './nodes/droppableNodes'
- [ ] nodeDataToRuntimeNode - from './nodes/nodeFactory'
- [ ] NodeContextMenu, ContextMenuPosition - from './nodes/NodeContextMenu'

### UI Components
- [ ] ConnectionFeedback, useConnectionValidation - from './ConnectionFeedback'
- [ ] ConnectionToast, useToast - from './ConnectionToast'
- [ ] KeyboardShortcuts - from './KeyboardShortcuts'
- [ ] PanZoomControls - from './PanZoomControls'

### Preview System
- [ ] PreviewEngine - from './preview/PreviewEngine'
- [ ] PreviewPanel - from './preview/PreviewPanel'

### Runtime Engine
- [ ] Epic1Graph - from '../../runtime/nodes/epic1/Epic1ExecutionEngine'

### Asset Library
- [ ] AssetLibrary, Preset - from './asset-library'
- [ ] SaveAsPresetDialog - from './asset-library/SaveAsPresetDialog'

### Interactions & Animations
- [ ] MagneticSnapHandler - from './interactions/MagneticSnapHandler'
- [ ] SelectionFeedback, useNodeInteractions - from './interactions/NodeInteractionEnhancer'
- [ ] MicroInteraction, useMicroInteractions - from './animations/MicroInteractions'

### CSS Files
- [ ] './Epic1GraphEditor.css'
- [ ] './KeyboardShortcuts.css'
- [ ] './PanZoomControls.css'

## Node Types Dependencies (from ./nodes/index.ts):
- [ ] BaseEditableNode
- [ ] TextBlockNode
- [ ] WeightedChoiceNode
- [ ] ConcatNode
- [ ] VariableNode
- [ ] OutputNode
- [ ] './BaseEditableNode.css'
- [ ] './WeightedChoiceNode.css'
- [ ] './NodeStyles.css'

## Strategy for Bringing Back Epic1GraphEditor:

1. Start with the core node components (TextBlockNode, WeightedChoiceNode, etc.)
2. Add the base editing functionality (BaseEditableNode)
3. Add the preview system (PreviewEngine, PreviewPanel)
4. Add the execution engine (Epic1ExecutionEngine)
5. Add UI enhancements (keyboard shortcuts, pan/zoom controls)
6. Add asset library functionality
7. Add animations and interactions last