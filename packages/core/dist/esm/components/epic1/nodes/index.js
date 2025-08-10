// Epic 1 Custom React Flow Nodes - Consolidated version
// Import the components
import { BaseEditableNode } from './BaseEditableNode';
import { TextBlockNode } from './TextBlockNode';
import { EnhancedBranchingNode } from './EnhancedBranchingNode';
import { ConcatNode } from './ConcatNode';
import { VariableNode } from './VariableNode';
import { OutputNode } from './OutputNode';
import { NodeContextMenu } from './NodeContextMenu';
// Export components and types
export { BaseEditableNode };
export { TextBlockNode };
export { EnhancedBranchingNode as WeightedChoiceNode };
export { ConcatNode };
export { VariableNode };
export { OutputNode };
export { NodeContextMenu };
// Now we can safely create the node type mapping
export const epic1NodeTypes = {
    textBlock: TextBlockNode,
    weightedChoice: EnhancedBranchingNode, // Use EnhancedBranchingNode with proper handle logic
    concat: ConcatNode,
    variable: VariableNode,
    setVariable: VariableNode,
    getVariable: VariableNode,
    output: OutputNode,
};
// Note: CSS imports removed to avoid bundling issues
// These should be imported in the component that uses them
