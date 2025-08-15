// Epic 1 Custom React Flow Nodes - Consolidated version

// Import the components
import { BaseEditableNode } from './BaseEditableNode';
import { TextBlockNode } from './TextBlockNode';
import { EnhancedBranchingNode } from './EnhancedBranchingNode';
import { ConcatNode } from './ConcatNode';
import { VariableNode } from './VariableNode';
import { OutputNode } from './OutputNode';
import { NodeContextMenu } from './NodeContextMenu';
import { PostItNote } from './PostItNote';
import { BoundingBox } from './BoundingBox';
import { EnhancedBoundingBox } from './EnhancedBoundingBox';
import GroupNode from './GroupNode';

// Export components and types
export { BaseEditableNode };
export type {
  BaseEditableNodeProps,
  EditableNodeData
} from './BaseEditableNode';

export { TextBlockNode };
export type { TextBlockNodeData } from './TextBlockNode';

export { EnhancedBranchingNode as WeightedChoiceNode };
export type {
  EnhancedBranchingNodeData as WeightedChoiceNodeData,
  WeightedOption
} from './EnhancedBranchingNode';

export { ConcatNode };
export type { ConcatNodeData } from './ConcatNode';

export { VariableNode };
export type { VariableNodeData } from './VariableNode';

export { OutputNode };
export type { OutputNodeData } from './OutputNode';

export { NodeContextMenu };
export type { ContextMenuPosition } from './NodeContextMenu';

export { PostItNote };
export type { PostItNoteData } from './PostItNote';

export { BoundingBox };
export type { BoundingBoxData } from './BoundingBox';

export { EnhancedBoundingBox };
export type { EnhancedBoundingBoxData } from './EnhancedBoundingBox';

export { GroupNode };

// Now we can safely create the node type mapping
export const epic1NodeTypes = {
  textBlock: TextBlockNode,
  weightedChoice: EnhancedBranchingNode, // Use EnhancedBranchingNode with proper handle logic
  concat: ConcatNode,
  variable: VariableNode,
  setVariable: VariableNode,
  getVariable: VariableNode,
  output: OutputNode,
  postItNote: PostItNote,
  boundingBox: BoundingBox,
  enhancedBoundingBox: EnhancedBoundingBox, // Enhanced version with collapse/expand
  group: GroupNode
};

// Note: CSS imports removed to avoid bundling issues
// These should be imported in the component that uses them
