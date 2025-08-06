// Epic 1 Custom React Flow Nodes - Fixed version with proper imports

// First, import the components
import { BaseEditableNode } from './BaseEditableNode';
import { TextBlockNode } from './TextBlockNode';
import { WeightedChoiceNode } from './WeightedChoiceNode';
import { ImprovedWeightedChoiceNode } from './ImprovedWeightedChoiceNode';
import { BranchingWeightedChoiceNode } from './BranchingWeightedChoiceNode';
import { EnhancedBranchingNode } from './EnhancedBranchingNode';
import { ConcatNode } from './ConcatNode';
import { VariableNode } from './VariableNode';
import { OutputNode } from './OutputNode';
import { NodeContextMenu } from './NodeContextMenu';

// Then export them
export { BaseEditableNode };
export type { BaseEditableNodeProps, EditableNodeData } from './BaseEditableNode';

export { TextBlockNode };
export type { TextBlockNodeData } from './TextBlockNode';

export { WeightedChoiceNode };
export { ImprovedWeightedChoiceNode };
export { BranchingWeightedChoiceNode };
export { EnhancedBranchingNode };
export type { WeightedChoiceNodeData, WeightedOption } from './WeightedChoiceNode';
export type { BranchingWeightedChoiceNodeData } from './BranchingWeightedChoiceNode';
export type { EnhancedBranchingNodeData } from './EnhancedBranchingNode';

export { ConcatNode };
export type { ConcatNodeData } from './ConcatNode';

export { VariableNode };
export type { VariableNodeData } from './VariableNode';

export { OutputNode };
export type { OutputNodeData } from './OutputNode';

export { NodeContextMenu };
export type { ContextMenuPosition } from './NodeContextMenu';

// Now we can safely create the node type mapping
export const epic1NodeTypes = {
  textBlock: TextBlockNode,
  weightedChoice: EnhancedBranchingNode, // Use enhanced version - we'll fix the handle position
  concat: ConcatNode,
  variable: VariableNode,
  setVariable: VariableNode,
  getVariable: VariableNode,
  output: OutputNode,
};

// Note: CSS imports removed to avoid bundling issues
// These should be imported in the component that uses them