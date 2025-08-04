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
export { TextBlockNode };
export { WeightedChoiceNode };
export { ImprovedWeightedChoiceNode };
export { BranchingWeightedChoiceNode };
export { EnhancedBranchingNode };
export { ConcatNode };
export { VariableNode };
export { OutputNode };
export { NodeContextMenu };
// Now we can safely create the node type mapping
export const epic1NodeTypes = {
    textBlock: TextBlockNode,
    weightedChoice: EnhancedBranchingNode, // Use enhanced version with radio dials and all fixes
    concat: ConcatNode,
    variable: VariableNode,
    setVariable: VariableNode,
    getVariable: VariableNode,
    output: OutputNode,
};
// Note: CSS imports removed to avoid bundling issues
// These should be imported in the component that uses them
