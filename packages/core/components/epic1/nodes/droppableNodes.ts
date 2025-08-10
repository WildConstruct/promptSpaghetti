/**
 * Droppable versions of Epic 1 nodes that accept preset drops
 */

import { withDroppableNode } from '../asset-library/DroppableNode';
import { TextBlockNode } from './TextBlockNode';
import { EnhancedBranchingNode } from './EnhancedBranchingNode';
import { ConcatNode } from './ConcatNode';
import { VariableNode } from './VariableNode';
import { OutputNode } from './OutputNode';

// Create droppable versions of all node types
export const DroppableTextBlockNode = withDroppableNode(TextBlockNode);
export const DroppableWeightedChoiceNode = withDroppableNode(
  EnhancedBranchingNode
);
export const DroppableConcatNode = withDroppableNode(ConcatNode);
export const DroppableVariableNode = withDroppableNode(VariableNode);
export const DroppableOutputNode = withDroppableNode(OutputNode);

// Export enhanced node types mapping
export const droppableEpic1NodeTypes = {
  textBlock: DroppableTextBlockNode,
  weightedChoice: DroppableWeightedChoiceNode,
  concat: DroppableConcatNode,
  variable: DroppableVariableNode,
  setVariable: DroppableVariableNode,
  getVariable: DroppableVariableNode,
  output: DroppableOutputNode
};
