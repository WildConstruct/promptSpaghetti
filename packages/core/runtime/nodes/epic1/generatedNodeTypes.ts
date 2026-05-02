import type { BaseInlineEditableNode } from './BaseInlineEditableNode';

export interface GeneratedNode {
  node: BaseInlineEditableNode;
  sourceSegments: number[];
  position?: { x: number; y: number };
}
