type GraphLike = {
  nodes: unknown[];
  edges: unknown[];
  [key: string]: unknown;
};

type GraphWrapperLike = {
  version: string;
  kind: 'graph';
  graph: GraphLike;
  [key: string]: unknown;
};

export type GraphOpenValidationResult =
  | { ok: true; data: unknown }
  | { ok: false; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toFiniteNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function validateGraphLike(
  input: unknown,
  label: string
): { ok: true; data: GraphLike } | { ok: false; error: string } {
  try {
    if (!isRecord(input)) {
      return { ok: false, error: `${label} must be an object` };
    }

    const rawNodes = input.nodes;
    const rawEdges = input.edges;
    if (!Array.isArray(rawNodes) || !Array.isArray(rawEdges)) {
      return {
        ok: false,
        error: `${label} must include nodes and edges arrays`
      };
    }

    const seenNodeIds = new Set<string>();
    const nodes = rawNodes.map((rawNode, index) => {
      if (!isRecord(rawNode)) {
        throw new Error(`Node ${index + 1} must be an object`);
      }

      const id = typeof rawNode.id === 'string' ? rawNode.id.trim() : '';
      if (!id) {
        throw new Error(`Node ${index + 1} is missing a string id`);
      }
      if (seenNodeIds.has(id)) {
        throw new Error(`Duplicate node id "${id}"`);
      }
      seenNodeIds.add(id);

      const rawPosition = isRecord(rawNode.position)
        ? rawNode.position
        : undefined;

      return {
        ...rawNode,
        id,
        position: {
          x: toFiniteNumber(rawPosition?.x, 0),
          y: toFiniteNumber(rawPosition?.y, 0)
        },
        data: isRecord(rawNode.data) ? rawNode.data : {}
      };
    });

    const edges = rawEdges.map((rawEdge, index) => {
      if (!isRecord(rawEdge)) {
        throw new Error(`Edge ${index + 1} must be an object`);
      }

      const source =
        typeof rawEdge.source === 'string' ? rawEdge.source.trim() : '';
      const target =
        typeof rawEdge.target === 'string' ? rawEdge.target.trim() : '';
      if (!source || !target) {
        throw new Error(
          `Edge ${index + 1} must include string source and target`
        );
      }

      return {
        ...rawEdge,
        id:
          typeof rawEdge.id === 'string' && rawEdge.id.trim().length > 0
            ? rawEdge.id
            : `${source}__${target}__${index}`,
        source,
        target
      };
    });

    return {
      ok: true,
      data: {
        ...input,
        nodes,
        edges
      }
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : `Invalid ${label}`
    };
  }
}

export function validateOpenedGraphPayload(
  input: unknown
): GraphOpenValidationResult {
  if (!isRecord(input)) {
    return { ok: false, error: 'Graph payload must be an object' };
  }

  if (
    input.kind === 'graph' &&
    typeof input.version === 'string' &&
    'graph' in input
  ) {
    const validated = validateGraphLike(input.graph, 'Graph payload');
    if (!validated.ok) {
      return validated;
    }

    const wrapper: GraphWrapperLike = {
      ...(input as GraphWrapperLike),
      graph: validated.data
    };
    return { ok: true, data: wrapper };
  }

  const validated = validateGraphLike(input, 'Graph payload');
  if (!validated.ok) {
    return validated;
  }

  return { ok: true, data: validated.data };
}
