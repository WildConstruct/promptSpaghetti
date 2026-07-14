import type { Edge, Node } from 'reactflow';
import { exportGraphToPSG, type PSGFile } from '../../../fileFormats/psg';

type RegionBoxFragmentOptions = {
  regionNodeId: string;
  nodes: Node[];
  edges: Edge[];
  name?: string;
  description?: string;
};

const REGION_NODE_TYPES = new Set([
  'enhancedBoundingBox',
  'boundingBox',
  'fragmentContainer'
]);
const ANNOTATION_NODE_TYPES = new Set(['postItNote']);

const toNumber = (value: unknown, fallback = 0): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

const getNodeWidth = (node: Node): number =>
  toNumber(
    node.width ??
      (node.data as { width?: unknown } | undefined)?.width ??
      (node.style as { width?: unknown } | undefined)?.width,
    0
  );

const getNodeHeight = (node: Node): number =>
  toNumber(
    node.height ??
      (node.data as { height?: unknown } | undefined)?.height ??
      (node.style as { height?: unknown } | undefined)?.height,
    0
  );

const getNodeTitle = (node: Node): string | undefined => {
  const data = node.data as
    | { title?: unknown; label?: unknown; description?: unknown }
    | undefined;
  const title =
    typeof data?.title === 'string' && data.title.trim().length > 0
      ? data.title.trim()
      : typeof data?.label === 'string' && data.label.trim().length > 0
        ? data.label.trim()
        : undefined;
  return title;
};

const getNodeDescription = (node: Node): string | undefined => {
  const description = (node.data as { description?: unknown } | undefined)
    ?.description;
  return typeof description === 'string' && description.trim().length > 0
    ? description.trim()
    : undefined;
};

const isRegionNode = (node: Node): boolean =>
  typeof node.type === 'string' && REGION_NODE_TYPES.has(node.type);

const isInsideRegionBounds = (node: Node, region: Node): boolean => {
  const nodeX = toNumber(node.position?.x, 0);
  const nodeY = toNumber(node.position?.y, 0);
  const regionX = toNumber(region.position?.x, 0);
  const regionY = toNumber(region.position?.y, 0);
  const regionWidth = getNodeWidth(region);
  const regionHeight = getNodeHeight(region);
  const nodeWidth = getNodeWidth(node);
  const nodeHeight = getNodeHeight(node);

  return (
    nodeX >= regionX - 1 &&
    nodeY >= regionY - 1 &&
    nodeX + nodeWidth <= regionX + regionWidth + 1 &&
    nodeY + nodeHeight <= regionY + regionHeight + 1
  );
};

const normalizeContainedNodeForExport = (
  node: Node,
  region: Node
): Node => {
  if ((node as { parentNode?: string }).parentNode === region.id) {
    return node;
  }

  return {
    ...node,
    parentNode: region.id,
    position: {
      x: toNumber(node.position?.x, 0) - toNumber(region.position?.x, 0),
      y: toNumber(node.position?.y, 0) - toNumber(region.position?.y, 0)
    }
  };
};

const toExportNode = (node: Node) => ({
  ...node,
  width: node.width ?? undefined,
  height: node.height ?? undefined
});

const toExportEdge = (edge: Edge) => ({
  ...edge,
  sourceHandle: edge.sourceHandle ?? undefined,
  targetHandle: edge.targetHandle ?? undefined
});

export function createRegionFragmentFilename(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/\.psg$/i, '');

  return `${base || 'region-fragment'}.psg`;
}

export function getContainedNodesForRegionBox(
  region: Node,
  nodes: Node[]
): Node[] {
  return nodes.filter(node => {
    if (
      node.id === region.id ||
      isRegionNode(node) ||
      (typeof node.type === 'string' && ANNOTATION_NODE_TYPES.has(node.type))
    ) {
      return false;
    }

    if ((node as { parentNode?: string }).parentNode === region.id) {
      return true;
    }

    const dataParent = (node.data as { parentNode?: string } | undefined)
      ?.parentNode;
    if (dataParent) {
      return dataParent === region.id;
    }

    return isInsideRegionBounds(node, region);
  });
}

export function buildRegionBoxFragment({
  regionNodeId,
  nodes,
  edges,
  name,
  description
}: RegionBoxFragmentOptions): PSGFile {
  const region = nodes.find(node => node.id === regionNodeId);

  if (!region || region.type !== 'enhancedBoundingBox') {
    throw new Error('Select a Region Box before saving a fragment');
  }

  const containedNodes = getContainedNodesForRegionBox(region, nodes);
  if (containedNodes.length === 0) {
    throw new Error('Region Box does not contain any nodes');
  }

  const containedNodeIds = new Set(containedNodes.map(node => node.id));
  const internalEdges = edges.filter(
    edge => containedNodeIds.has(edge.source) && containedNodeIds.has(edge.target)
  );
  const normalizedNodes = containedNodes.map(node =>
    normalizeContainedNodeForExport(node, region)
  );
  const fragmentName = name?.trim() || getNodeTitle(region) || 'Region Fragment';
  const fragmentDescription = description?.trim() || getNodeDescription(region);
  const wrapperRegion: Node = {
    ...region,
    data: {
      ...(region.data as Record<string, unknown> | undefined),
      fragmentImported: true
    }
  };

  return exportGraphToPSG(
    [wrapperRegion, ...normalizedNodes].map(toExportNode),
    internalEdges.map(toExportEdge),
    {
      name: fragmentName,
      description: fragmentDescription,
      metadata: {
        kind: 'user-fragment',
        sourceRegionId: region.id
      }
    }
  );
}
