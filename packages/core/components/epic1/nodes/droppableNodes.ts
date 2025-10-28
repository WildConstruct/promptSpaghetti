/**
 * Droppable versions of Epic 1 nodes that accept preset drops
 */

import { withDroppableNode } from '../asset-library/DroppableNode';
import { TextBlockNode } from './TextBlockNode';
import { EnhancedBranchingNode } from './EnhancedBranchingNode';
import { ConcatNode } from './ConcatNode';
import { VariableNode } from './VariableNode';
import { OutputNode } from './OutputNode';
import { PostItNote } from './PostItNote';
import { BoundingBox } from './BoundingBox';
import { EnhancedBoundingBox } from './EnhancedBoundingBox';
import GroupNode from './GroupNode';
import { epic1NodeTypes } from './index';
import type { NodeTypes } from 'reactflow';

// Create droppable versions of all node types
export const DroppableTextBlockNode = withDroppableNode(TextBlockNode);
export const DroppableWeightedChoiceNode = withDroppableNode(
  EnhancedBranchingNode
);
export const DroppableConcatNode = withDroppableNode(ConcatNode);
export const DroppableVariableNode = withDroppableNode(VariableNode);
export const DroppableOutputNode = withDroppableNode(OutputNode);

// PostItNote and BoundingBox don't need droppable behavior but should be included
// so they work properly in the editor
export const DroppablePostItNote = PostItNote;
export const DroppableBoundingBox = BoundingBox;
export const DroppableEnhancedBoundingBox = EnhancedBoundingBox;
export const DroppableGroupNode = GroupNode;

// Export enhanced node types mapping
// Include ALL base node types, overriding only the ones that support droppable behavior
export const droppableEpic1NodeTypes: NodeTypes = {
  ...epic1NodeTypes,
  textBlock: DroppableTextBlockNode,
  weightedChoice: DroppableWeightedChoiceNode,
  concat: DroppableConcatNode,
  variable: DroppableVariableNode,
  setVariable: DroppableVariableNode,
  getVariable: DroppableVariableNode,
  output: DroppableOutputNode,
  postItNote: DroppablePostItNote,
  boundingBox: DroppableBoundingBox,
  enhancedBoundingBox: DroppableEnhancedBoundingBox,
  group: DroppableGroupNode
};
