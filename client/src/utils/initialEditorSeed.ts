import type { Edge, Node } from 'reactflow';

type EditorGraphSeed = {
  nodes: Node[];
  edges: Edge[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

export function parseInitialEditorSeed(
  raw: string | null | undefined
): EditorGraphSeed | undefined {
  if (!raw) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed)) {
      return undefined;
    }

    const nodes = Array.isArray(parsed.nodes) ? (parsed.nodes as Node[]) : null;
    const edges = Array.isArray(parsed.edges) ? (parsed.edges as Edge[]) : null;

    if (!nodes || !edges) {
      return undefined;
    }

    return { nodes, edges };
  } catch {
    return undefined;
  }
}

export function readInitialEditorSeedFromStorage(
  storage: Pick<Storage, 'getItem'>
): EditorGraphSeed | undefined {
  return parseInitialEditorSeed(storage.getItem('psg:test-initial-graph'));
}
