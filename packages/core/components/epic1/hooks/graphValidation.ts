import type { Edge, Node } from 'reactflow';

type EditorGraphPayload = {
  nodes: Node[];
  edges: Edge[];
};

export type EditorGraphValidationResult =
  | { ok: true; data: EditorGraphPayload }
  | { ok: false; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toFiniteNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

export function validateEditorGraphPayload(
  input: unknown
): EditorGraphValidationResult {
  if (!isRecord(input)) {
    return { ok: false, error: 'Graph payload must be an object' };
  }

  const rawNodes = input.nodes;
  const rawEdges = input.edges;
  if (!Array.isArray(rawNodes) || !Array.isArray(rawEdges)) {
    return {
      ok: false,
      error: 'Graph payload must include nodes and edges arrays'
    };
  }

  const seenNodeIds = new Set<string>();
  const nodes: Node[] = [];
  for (let index = 0; index < rawNodes.length; index += 1) {
    const rawNode = rawNodes[index];
    if (!isRecord(rawNode)) {
      return { ok: false, error: `Node ${index + 1} must be an object` };
    }

    const id = typeof rawNode.id === 'string' ? rawNode.id.trim() : '';
    if (!id) {
      return { ok: false, error: `Node ${index + 1} is missing a string id` };
    }
    if (seenNodeIds.has(id)) {
      return { ok: false, error: `Duplicate node id "${id}"` };
    }
    seenNodeIds.add(id);

    const rawPosition = isRecord(rawNode.position)
      ? rawNode.position
      : undefined;

    nodes.push({
      ...(rawNode as Node),
      id,
      position: {
        x: toFiniteNumber(rawPosition?.x, 0),
        y: toFiniteNumber(rawPosition?.y, 0)
      },
      data: isRecord(rawNode.data) ? rawNode.data : {}
    });
  }

  const edges: Edge[] = [];
  for (let index = 0; index < rawEdges.length; index += 1) {
    const rawEdge = rawEdges[index];
    if (!isRecord(rawEdge)) {
      return { ok: false, error: `Edge ${index + 1} must be an object` };
    }

    const source =
      typeof rawEdge.source === 'string' ? rawEdge.source.trim() : '';
    const target =
      typeof rawEdge.target === 'string' ? rawEdge.target.trim() : '';
    if (!source || !target) {
      return {
        ok: false,
        error: `Edge ${index + 1} must include string source and target`
      };
    }

    const id =
      typeof rawEdge.id === 'string' && rawEdge.id.trim().length > 0
        ? rawEdge.id
        : `${source}__${target}__${index}`;

    edges.push({
      ...(rawEdge as Edge),
      id,
      source,
      target
    });
  }

  return {
    ok: true,
    data: {
      nodes,
      edges
    }
  };
}
