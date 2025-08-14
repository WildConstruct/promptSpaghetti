// Epic 1 Custom React Flow Nodes - without CSS imports
export { BaseEditableNode } from './BaseEditableNode';
export { TextBlockNode } from './TextBlockNode';
export { WeightedChoiceNode } from './WeightedChoiceNode';
export { ConcatNode } from './ConcatNode';
export { VariableNode } from './VariableNode';
export { OutputNode } from './OutputNode';
export { NodeContextMenu } from './NodeContextMenu';
// Import the actual node components
import { TextBlockNode } from './TextBlockNode';
import { WeightedChoiceNode } from './WeightedChoiceNode';
import { ConcatNode } from './ConcatNode';
import { VariableNode } from './VariableNode';
import { OutputNode } from './OutputNode';
// Node type mapping for React Flow
export const epic1NodeTypes = {
    textBlock: TextBlockNode,
    weightedChoice: WeightedChoiceNode,
    concat: ConcatNode,
    variable: VariableNode,
    setVariable: VariableNode,
    getVariable: VariableNode,
    output: OutputNode
};
