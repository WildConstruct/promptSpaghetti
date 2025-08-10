// Epic 1 Custom React Flow Nodes
export { BaseEditableNode } from './BaseEditableNode';
export type {
  BaseEditableNodeProps,
  EditableNodeData
} from './BaseEditableNode';

export { TextBlockNode } from './TextBlockNode';
export type { TextBlockNodeData } from './TextBlockNode';

export { WeightedChoiceNode } from './WeightedChoiceNode';
export type {
  WeightedChoiceNodeData,
  WeightedOption
} from './WeightedChoiceNode';

export { ConcatNode } from './ConcatNode';
export type { ConcatNodeData } from './ConcatNode';

export { VariableNode } from './VariableNode';
export type { VariableNodeData } from './VariableNode';

export { OutputNode } from './OutputNode';
export type { OutputNodeData } from './OutputNode';

export { NodeContextMenu } from './NodeContextMenu';
export type { ContextMenuPosition } from './NodeContextMenu';

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
