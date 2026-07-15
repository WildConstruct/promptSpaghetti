/**
 * Expand fragment-swap placeholders (from applySlotSelections) into real
 * PSG graphs loaded from the library path.
 */
import type { Edge, Node } from 'reactflow';
import {
  parsePSG,
  convertPSGToPSGLib
} from '@promptscape/core/fileFormats/psg';
import { findFragmentBoundaryNodes } from '@promptscape/core/components/epic1/services/FragmentExecution';

type FlowNode = Node<Record<string, unknown>>;
type FlowEdge = Edge;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** Resolve a library path for fetch (browser public assets). */
export function resolveFragmentFetchUrl(fragmentPath: string): string {
  if (fragmentPath.startsWith('http://') || fragmentPath.startsWith('https://')) {
    return fragmentPath;
  }
  if (fragmentPath.startsWith('/')) {
    return fragmentPath;
  }
  return `/assets/library/${fragmentPath.replace(/^\.\//, '')}`;
}

/**
 * Load a .psg fragment and convert it to React Flow nodes/edges.
 * Returns null when fetch/parse fails (caller keeps text placeholder).
 */
export async function loadFragmentAsFlowGraph(
  fragmentPath: string
): Promise<{ nodes: FlowNode[]; edges: FlowEdge[] } | null> {
  const url = resolveFragmentFetchUrl(fragmentPath);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }
    const text = await response.text();
    const psg = parsePSG(text);
    const lib = convertPSGToPSGLib(psg);
    const graph = lib?.graph;
    if (!graph || !Array.isArray(graph.nodes)) {
      return null;
    }
    const nodes = (graph.nodes as FlowNode[]).map(node => ({
      ...node,
      data: isRecord(node.data) ? { ...node.data } : { ...(node.data as object) }
    }));
    const edges = Array.isArray(graph.edges)
      ? (graph.edges as FlowEdge[]).map(edge => ({ ...edge }))
      : [];
    return { nodes, edges };
  } catch {
    return null;
  }
}

function rebaseFragmentGraph(
  fragmentNodes: FlowNode[],
  fragmentEdges: FlowEdge[],
  placeholder: FlowNode,
  idPrefix: string
): { nodes: FlowNode[]; edges: FlowEdge[] } {
  const idMap = new Map<string, string>();
  for (const node of fragmentNodes) {
    idMap.set(node.id, `${idPrefix}${node.id}`);
  }

  const minX = Math.min(
    ...fragmentNodes.map(n => n.position?.x ?? 0),
    placeholder.position?.x ?? 0
  );
  const minY = Math.min(
    ...fragmentNodes.map(n => n.position?.y ?? 0),
    placeholder.position?.y ?? 0
  );
  const anchorX = placeholder.position?.x ?? 0;
  const anchorY = placeholder.position?.y ?? 0;

  const nodes: FlowNode[] = fragmentNodes.map(node => {
    const px = node.position?.x ?? 0;
    const py = node.position?.y ?? 0;
    return {
      ...node,
      id: idMap.get(node.id) || `${idPrefix}${node.id}`,
      position: {
        x: anchorX + (px - minX),
        y: anchorY + (py - minY)
      },
      data: {
        ...(isRecord(node.data) ? node.data : {}),
        fragmentExpanded: true,
        fragmentSourcePath:
          typeof placeholder.data?.fragmentPath === 'string'
            ? placeholder.data.fragmentPath
            : undefined
      },
      parentNode: undefined,
      extent: undefined
    };
  });

  const edges: FlowEdge[] = fragmentEdges
    .map(edge => {
      const source = idMap.get(edge.source);
      const target = idMap.get(edge.target);
      if (!source || !target) {
        return null;
      }
      return {
        ...edge,
        id: `${idPrefix}${edge.id}`,
        source,
        target
      };
    })
    .filter((e): e is FlowEdge => e !== null);

  return { nodes, edges };
}

/**
 * Replace each fragmentSwap placeholder node with its loaded PSG graph,
 * rewiring external edges to fragment entry/exit nodes.
 */
export function spliceLoadedFragments(
  baseNodes: FlowNode[],
  baseEdges: FlowEdge[],
  expansions: Array<{
    placeholderId: string;
    fragmentNodes: FlowNode[];
    fragmentEdges: FlowEdge[];
  }>
): { nodes: FlowNode[]; edges: FlowEdge[] } {
  let nodes = [...baseNodes];
  let edges = [...baseEdges];

  for (const expansion of expansions) {
    const placeholder = nodes.find(n => n.id === expansion.placeholderId);
    if (!placeholder) {
      continue;
    }

    const idPrefix = `fx-${expansion.placeholderId}-`;
    const rebased = rebaseFragmentGraph(
      expansion.fragmentNodes,
      expansion.fragmentEdges,
      placeholder,
      idPrefix
    );

    const { entryNode, exitNode } = findFragmentBoundaryNodes(
      rebased.nodes as never,
      rebased.edges as never
    );
    const entryId = entryNode?.id ?? rebased.nodes[0]?.id;
    const exitId =
      exitNode?.id ?? rebased.nodes[rebased.nodes.length - 1]?.id;

    if (!entryId || !exitId) {
      continue;
    }

    const phId = expansion.placeholderId;
    edges = edges
      .map(edge => {
        if (edge.target === phId) {
          return { ...edge, id: `${edge.id}->${entryId}`, target: entryId };
        }
        if (edge.source === phId) {
          return { ...edge, id: `${exitId}->${edge.id}`, source: exitId };
        }
        return edge;
      })
      .concat(rebased.edges);

    nodes = nodes
      .filter(n => n.id !== phId)
      .concat(rebased.nodes);
  }

  // Deduplicate edge ids
  const seen = new Set<string>();
  edges = edges.filter(edge => {
    if (seen.has(edge.id)) {
      return false;
    }
    seen.add(edge.id);
    return true;
  });

  return { nodes, edges };
}

/**
 * Expand all fragmentSwap placeholders in a wizard graph.
 * Failed loads leave the text placeholder node in place.
 */
export async function expandFragmentSwapsInGraph(
  nodes: FlowNode[],
  edges: FlowEdge[]
): Promise<{ nodes: FlowNode[]; edges: FlowEdge[]; expandedCount: number; failedPaths: string[] }> {
  const placeholders = nodes.filter(node => {
    const data = isRecord(node.data) ? node.data : {};
    return data.fragmentSwap === true && typeof data.fragmentPath === 'string';
  });

  if (placeholders.length === 0) {
    return { nodes, edges, expandedCount: 0, failedPaths: [] };
  }

  const expansions: Array<{
    placeholderId: string;
    fragmentNodes: FlowNode[];
    fragmentEdges: FlowEdge[];
  }> = [];
  const failedPaths: string[] = [];

  await Promise.all(
    placeholders.map(async placeholder => {
      const path = String(
        isRecord(placeholder.data) ? placeholder.data.fragmentPath : ''
      );
      const loaded = await loadFragmentAsFlowGraph(path);
      if (!loaded || loaded.nodes.length === 0) {
        failedPaths.push(path);
        return;
      }
      expansions.push({
        placeholderId: placeholder.id,
        fragmentNodes: loaded.nodes,
        fragmentEdges: loaded.edges
      });
    })
  );

  if (expansions.length === 0) {
    return { nodes, edges, expandedCount: 0, failedPaths };
  }

  const spliced = spliceLoadedFragments(nodes, edges, expansions);
  return {
    nodes: spliced.nodes,
    edges: spliced.edges,
    expandedCount: expansions.length,
    failedPaths
  };
}
