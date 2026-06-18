import type { Node } from 'reactflow';

const MINIMAP_NODE_COLORS: Record<string, string> = {
  textBlock: '#a3a5ff',
  weightedChoice: '#f6a723',
  concat: '#22c493',
  variable: '#9d70f7',
  setVariable: '#9d70f7',
  getVariable: '#9d70f7',
  output: '#22d3ee'
};

const MINIMAP_REGION_TYPES = new Set(['enhancedBoundingBox', 'boundingBox']);
const MINIMAP_REGION_STROKE_COLOR = '#4ecdc4';
const MINIMAP_NODE_STROKE_COLOR = '#1f2328';

export const MINIMAP_FALLBACK_NODE_COLOR = '#94a3b8';

export function getMinimapNodeColor(node: Pick<Node, 'type'>): string {
  if (node.type && MINIMAP_REGION_TYPES.has(node.type)) {
    return 'transparent';
  }
  return node.type
    ? MINIMAP_NODE_COLORS[node.type] ?? MINIMAP_FALLBACK_NODE_COLOR
    : MINIMAP_FALLBACK_NODE_COLOR;
}

export function getMinimapNodeStrokeColor(node: Pick<Node, 'type'>): string {
  return node.type && MINIMAP_REGION_TYPES.has(node.type)
    ? MINIMAP_REGION_STROKE_COLOR
    : MINIMAP_NODE_STROKE_COLOR;
}

export function getMinimapNodeStrokeWidth(node: Pick<Node, 'type'>): number {
  return node.type && MINIMAP_REGION_TYPES.has(node.type) ? 2 : 1;
}

export function getMinimapNodeBorderRadius(node: Pick<Node, 'type'>): number {
  return node.type && MINIMAP_REGION_TYPES.has(node.type) ? 3 : 2;
}

export const epic1MinimapProps = {
  nodeColor: getMinimapNodeColor,
  nodeStrokeColor: getMinimapNodeStrokeColor,
  nodeStrokeWidth: getMinimapNodeStrokeWidth,
  nodeBorderRadius: 3
} as const;
