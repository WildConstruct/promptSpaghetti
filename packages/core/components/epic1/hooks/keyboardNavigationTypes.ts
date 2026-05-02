import type { Node } from 'reactflow';

export interface KeyboardNavigationOptions<TNode extends Node = Node> {
  nodes: TNode[];
  selectedNodeId?: string | null;
  onNodeSelect: (nodeId: string) => void;
  onEscapePress?: () => void;
  onEditCancel?: (nodeId: string) => void;
  enabled?: boolean;
}
