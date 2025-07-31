// Epic 4: Inline Node Editing System - Complete Implementation

// Story 4.1: Double-Click Inline Editing
export { InlineNodeEditor } from './InlineNodeEditor';
export type { InlineNodeEditorProps } from './InlineNodeEditor';

export {
  InlineEditorManager,
  InlineEditorProvider,
  useInlineEditor,
  useInlineEditorContext,
} from './InlineEditorManager';
export type { InlineEditorManagerProps } from './InlineEditorManager';

export { InlineEditableNode, withInlineEditing } from './InlineEditableNode';
export type { InlineEditableNodeProps } from './InlineEditableNode';

export {
  GraphEditorWithInlineEditing,
  useGraphWithInlineEditing,
  createInlineEditingGraph,
} from './GraphEditorIntegration';
export type { GraphEditorWithInlineEditingProps } from './GraphEditorIntegration';

// Story 4.2: Rich Text Editor Integration
export { RichTextEditor, NodeSpecificRichEditor } from './RichTextEditor';
export {
  WeightedChoiceEditor,
  ConcatEditor,
  VariableEditor,
  ConditionalEditor,
  OutputEditor,
} from './NodeSpecificEditors';

// Story 4.3: Multi-Node Batch Editing
export { BatchNodeEditor } from './BatchNodeEditor';

// Professional inline editing system that provides:
// - Double-click activation for direct node editing (Story 4.1)
// - Progressive disclosure of properties with specialized interfaces (Story 4.2)
// - Rich text editing with syntax highlighting and templates (Story 4.2)
// - Multi-node batch editing with conflict resolution (Story 4.3)
// - Real-time validation with inline feedback
// - Smooth transitions between view and edit modes
// - Keyboard navigation (Tab, Enter, Escape)
// - Auto-save integration with existing state management
// - Professional Cinema 4D/Figma-inspired UX
// - Support for all node types with node-specific editing interfaces
