import type { Node } from 'reactflow';
import type { EditableNodeData } from '../nodes';

export interface FlowNode extends Node<EditableNodeData> {
  measured?: {
    width?: number;
    height?: number;
  };
}

export const CONTAINER_TYPES = new Set([
  'fragmentContainer',
  'enhancedBoundingBox'
]);

const DEFAULT_CONTAINER_PADDING = 12;
const DEFAULT_CONTAINER_WIDTH = 400;
const DEFAULT_CONTAINER_HEIGHT = 300;

const parseDimension = (value: unknown, fallback: number): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  return fallback;
};

const readNodeWidth = (node: FlowNode): number => {
  const data = node.data as Record<string, unknown> | undefined;
  const candidates = [
    node.width,
    node?.measured && typeof node.measured === 'object'
      ? (node.measured as { width?: number }).width
      : undefined,
    node.style?.width,
    data?.width
  ];
  for (const candidate of candidates) {
    const value = parseDimension(candidate, Number.NaN);
    if (!Number.isNaN(value)) {
      return value;
    }
  }
  return DEFAULT_CONTAINER_WIDTH;
};

const readNodeHeight = (node: FlowNode): number => {
  const data = node.data as Record<string, unknown> | undefined;
  const candidates = [
    node.height,
    node?.measured && typeof node.measured === 'object'
      ? (node.measured as { height?: number }).height
      : undefined,
    node.style?.height,
    data?.height
  ];
  for (const candidate of candidates) {
    const value = parseDimension(candidate, Number.NaN);
    if (!Number.isNaN(value)) {
      return value;
    }
  }
  return DEFAULT_CONTAINER_HEIGHT;
};

export const getContainerPadding = (node: FlowNode): number => {
  // Bounding boxes don't have internal padding - nodes can be positioned at edges
  if (node.type === 'enhancedBoundingBox') {
    return 0;
  }
  const data = node.data as Record<string, unknown> | undefined;
  const candidates = [data?.padding, data?.innerPadding, node.style?.padding];
  for (const candidate of candidates) {
    const value = parseDimension(candidate, Number.NaN);
    if (!Number.isNaN(value)) {
      return value;
    }
  }
  return DEFAULT_CONTAINER_PADDING;
};

const computeDepth = (
  node: FlowNode,
  nodeMap: Map<string, FlowNode>
): number => {
  let depth = 0;
  let current: FlowNode | undefined = node;
  const visited = new Set<string>();
  while (current?.parentNode) {
    if (visited.has(current.parentNode)) {
      break;
    }
    visited.add(current.parentNode);
    const parent = nodeMap.get(current.parentNode);
    if (!parent) {
      break;
    }
    depth += 1;
    current = parent;
  }
  return depth;
};

export const findContainerAtPosition = (
  nodes: FlowNode[],
  position: { x: number; y: number }
): FlowNode | null => {
  if (!nodes.length) {
    return null;
  }
  const nodeMap = new Map(nodes.map(node => [node.id, node]));
  const candidates: Array<{
    node: FlowNode;
    depth: number;
    area: number;
    zIndex: number;
  }> = [];

  nodes.forEach(node => {
    if (!CONTAINER_TYPES.has(node.type ?? '') || node.hidden) {
      return;
    }

    const origin = node.positionAbsolute ?? node.position ?? { x: 0, y: 0 };
    const width = readNodeWidth(node);
    const height = readNodeHeight(node);
    const padding = getContainerPadding(node);

    const withinX =
      position.x >= origin.x + padding &&
      position.x <= origin.x + width - padding;
    const withinY =
      position.y >= origin.y + padding &&
      position.y <= origin.y + height - padding;

    if (!withinX || !withinY) {
      return;
    }

    const depth = computeDepth(node, nodeMap);
    const area = width * height;
    const zIndex = typeof node.zIndex === 'number' ? node.zIndex : depth;

    candidates.push({ node, depth, area, zIndex });
  });

  if (!candidates.length) {
    return null;
  }

  candidates.sort((a, b) => {
    if (a.depth !== b.depth) {
      return b.depth - a.depth;
    }
    if (a.zIndex !== b.zIndex) {
      return b.zIndex - a.zIndex;
    }
    return a.area - b.area;
  });

  return candidates[0].node;
};

export const attachNodesToContainerNodes = (
  nodes: FlowNode[],
  container: FlowNode
): FlowNode[] => {
  if (!nodes.length) {
    return nodes;
  }

  const base = container.positionAbsolute ??
    container.position ?? { x: 0, y: 0 };
  const padding = getContainerPadding(container);
  const isCollapsed =
    (container.data as { isCollapsed?: boolean } | undefined)?.isCollapsed ===
    true;

  return nodes.map(node => {
    if (
      node.parentNode ||
      CONTAINER_TYPES.has(node.type ?? '') ||
      !node.position
    ) {
      return node;
    }

    const relative = {
      x: Math.max(node.position.x - (base.x + padding), 0),
      y: Math.max(node.position.y - (base.y + padding), 0)
    };

    const next: FlowNode = {
      ...node,
      parentNode: container.id,
      extent: 'parent',
      position: relative
    };

    if (container.type === 'enhancedBoundingBox') {
      (next as FlowNode & { expandParent?: boolean }).expandParent = true;
    }

    if (isCollapsed) {
      next.hidden = true;
    }

    return next;
  });
};
