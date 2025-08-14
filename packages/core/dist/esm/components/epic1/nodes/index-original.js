// Epic 1 Custom React Flow Nodes
export { BaseEditableNode } from './BaseEditableNode';
export { TextBlockNode } from './TextBlockNode';
export { WeightedChoiceNode } from './WeightedChoiceNode';
export { ConcatNode } from './ConcatNode';
export { VariableNode } from './VariableNode';
export { OutputNode } from './OutputNode';
export { NodeContextMenu } from './NodeContextMenu';
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
// CSS imports
import './BaseEditableNode.css';
import './WeightedChoiceNode.css';
import './NodeStyles.css';
