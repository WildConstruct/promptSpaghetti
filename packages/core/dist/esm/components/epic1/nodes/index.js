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
import GroupNode from './GroupNode';
// Export components and types
export { BaseEditableNode };
export { TextBlockNode };
export { EnhancedBranchingNode as WeightedChoiceNode };
export { ConcatNode };
export { VariableNode };
export { OutputNode };
export { NodeContextMenu };
export { PostItNote };
export { BoundingBox };
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
    group: GroupNode
};
// Note: CSS imports removed to avoid bundling issues
// These should be imported in the component that uses them
