import type { Edge, Node } from 'reactflow';
import {
  findNearestEdgeInsertionTarget
} from '../EdgeInsertionTargeting';
import {
  splicePresetIntoEdge,
  findFragmentBoundaryNodes,
  type EdgeSpliceTarget,
  type FlowNode,
  type FlowEdge
} from '../FragmentExecution';
import { findFragmentDropTarget } from '../FragmentDropTargeting';
import type { AgentFragmentRecord } from '@prompt/asset-browser';

// Minimal node/edge builders — the splice + targeting math only needs
// id/type/position/size and source/target, so we cast through unknown.
function node(
  id: string,
  x: number,
  y: number,
  opts: { type?: string; width?: number; height?: number } = {}
): FlowNode {
  return {
    id,
    type: opts.type ?? 'textBlock',
    position: { x, y },
    width: opts.width ?? 100,
    height: opts.height ?? 100,
    data: {}
  } as unknown as FlowNode;
}

function edge(
  id: string,
  source: string,
  target: string,
  extra: Partial<Edge> = {}
): FlowEdge {
  return { id, source, target, ...extra } as unknown as FlowEdge;
}

describe('findNearestEdgeInsertionTarget', () => {
  // A center (50,50), B center (450,50) -> edge midpoint (250,50)
  const A = node('A', 0, 0);
  const B = node('B', 400, 0);
  const nodes = [A, B];
  const edges = [edge('AB', 'A', 'B')];

  it('returns the edge when the pointer is on the midpoint', () => {
    const target = findNearestEdgeInsertionTarget({
      pointer: { x: 250, y: 50 },
      edges,
      nodes
    });
    expect(target).not.toBeNull();
    expect(target?.edgeId).toBe('AB');
    expect(target?.sourceId).toBe('A');
    expect(target?.targetId).toBe('B');
    expect(target?.distance).toBeCloseTo(0);
  });

  it('returns null when the pointer is beyond the 120px threshold', () => {
    const target = findNearestEdgeInsertionTarget({
      pointer: { x: 250, y: 200 }, // 150px from midpoint
      edges,
      nodes
    });
    expect(target).toBeNull();
  });

  it('returns the edge when within threshold', () => {
    const target = findNearestEdgeInsertionTarget({
      pointer: { x: 250, y: 140 }, // 90px from midpoint
      edges,
      nodes
    });
    expect(target?.edgeId).toBe('AB');
  });

  it('picks the nearest edge among several', () => {
    const C = node('C', 400, 400); // center (450,450)
    const twoEdges = [edge('AB', 'A', 'B'), edge('AC', 'A', 'C')];
    // AB midpoint (250,50); AC midpoint (250,225). Pointer closer to AB.
    const target = findNearestEdgeInsertionTarget({
      pointer: { x: 250, y: 70 },
      edges: twoEdges,
      nodes: [A, B, C]
    });
    expect(target?.edgeId).toBe('AB');
  });
});

describe('splicePresetIntoEdge — single node', () => {
  const target: EdgeSpliceTarget = {
    edgeId: 'AB',
    sourceId: 'A',
    targetId: 'B',
    sourceHandle: 'source',
    targetHandle: 'input1',
    edgeType: 'smoothstep'
  };

  it('removes the original edge and rewires source->new->target', () => {
    const existing = [edge('AB', 'A', 'B')];
    const inserted = node('N', 200, 0);
    const result = splicePresetIntoEdge(existing, [inserted], [], target);

    // Original edge gone
    expect(result.find(e => e.id === 'AB')).toBeUndefined();

    const aToN = result.find(e => e.source === 'A' && e.target === 'N');
    const nToB = result.find(e => e.source === 'N' && e.target === 'B');
    expect(aToN).toBeDefined();
    expect(nToB).toBeDefined();

    // Handles + edge type preserved on the spliced edges
    expect(aToN?.sourceHandle).toBe('source');
    expect(nToB?.targetHandle).toBe('input1');
    expect(aToN?.type).toBe('smoothstep');
    expect(nToB?.type).toBe('smoothstep');

    // Exactly the two new edges remain
    expect(result).toHaveLength(2);
  });

  it('appends (no splice) when metadata says free-place', () => {
    const existing = [edge('AB', 'A', 'B')];
    const inserted = node('N', 200, 0);
    const result = splicePresetIntoEdge(existing, [inserted], [], target, {
      preferredInsertion: 'free-place'
    });
    // Original edge retained, nothing spliced
    expect(result.find(e => e.id === 'AB')).toBeDefined();
    expect(result.some(e => e.source === 'A' && e.target === 'N')).toBe(false);
  });

  it('appends edgesToAdd unchanged when there is no splice target', () => {
    const existing = [edge('AB', 'A', 'B')];
    const extra = edge('X', 'P', 'Q');
    const result = splicePresetIntoEdge(existing, [], [extra], null);
    expect(result.find(e => e.id === 'AB')).toBeDefined();
    expect(result.find(e => e.id === 'X')).toBeDefined();
  });
});

describe('splicePresetIntoEdge — multi-node fragment', () => {
  it('wires source->entry and exit->target using boundary detection', () => {
    const target: EdgeSpliceTarget = {
      edgeId: 'AB',
      sourceId: 'A',
      targetId: 'B',
      sourceHandle: 'source',
      targetHandle: 'input1'
    };
    const existing = [edge('AB', 'A', 'B')];
    // Fragment E -> X (E is entry, X is exit)
    const nodesToAdd = [node('E', 200, 0), node('X', 300, 0)];
    const edgesToAdd = [edge('EX', 'E', 'X')];

    const result = splicePresetIntoEdge(
      existing,
      nodesToAdd,
      edgesToAdd,
      target
    );

    expect(result.find(e => e.id === 'AB')).toBeUndefined();
    expect(result.find(e => e.id === 'EX')).toBeDefined(); // internal edge kept
    expect(result.some(e => e.source === 'A' && e.target === 'E')).toBe(true);
    expect(result.some(e => e.source === 'X' && e.target === 'B')).toBe(true);
  });
});

describe('findFragmentBoundaryNodes', () => {
  it('detects a single entry and exit in a linear fragment', () => {
    const { entryNode, exitNode } = findFragmentBoundaryNodes(
      [node('E', 0, 0), node('M', 1, 0), node('X', 2, 0)],
      [edge('e1', 'E', 'M'), edge('e2', 'M', 'X')]
    );
    expect(entryNode?.id).toBe('E');
    expect(exitNode?.id).toBe('X');
  });

  it('returns null entry when ambiguous (two roots)', () => {
    const { entryNode } = findFragmentBoundaryNodes(
      [node('E1', 0, 0), node('E2', 0, 1), node('X', 2, 0)],
      [edge('e1', 'E1', 'X'), edge('e2', 'E2', 'X')]
    );
    expect(entryNode).toBeNull();
  });
});

describe('findFragmentDropTarget precedence', () => {
  const fragment = {
    nodeTypes: []
  } as unknown as AgentFragmentRecord;

  const A = node('A', 0, 0);
  const B = node('B', 400, 0);
  const nodes = [A, B];
  const edges = [edge('AB', 'A', 'B')];

  it('returns insert-edge when the pointer is near an edge but not over a node', () => {
    const t = findFragmentDropTarget({
      pointer: { x: 250, y: 50 },
      fragment,
      nodes,
      edges
    });
    expect(t.kind).toBe('insert-edge');
    if (t.kind === 'insert-edge') {
      expect(t.edgeId).toBe('AB');
    }
  });

  it('prefers replace-node when the pointer is over a compatible node', () => {
    const t = findFragmentDropTarget({
      pointer: { x: 50, y: 50 }, // inside A (0..100)
      fragment,
      nodes,
      edges
    });
    expect(t.kind).toBe('replace-node');
  });

  it('falls back to free-place when nothing is near', () => {
    const t = findFragmentDropTarget({
      pointer: { x: 250, y: 1000 },
      fragment,
      nodes,
      edges
    });
    expect(t.kind).toBe('free-place');
  });
});
