import { validateConnection } from '../packages/core/validation';
import { Edge } from 'reactflow';

const nodeIds = ['A', 'B', 'C'];

function mkEdge(id: string, source: string, target: string): Edge {
  return {
    id,
    source,
    target,
    sourceHandle: null,
    targetHandle: null,
    type: 'default',
  } as unknown as Edge;
}

describe('validateConnection', () => {
  it('returns empty array for valid edges', () => {
    const edges = [mkEdge('e1','A','B'), mkEdge('e2','B','C')];
    const errs = validateConnection(edges, []);
    expect(errs).toHaveLength(0);
  });

  it('detects self-loop edge', () => {
    const edges = [mkEdge('e1','A','A')];
    const errs = validateConnection(edges, []);
    expect(errs).toHaveLength(1);
    expect(errs[0].message).toMatch(/self-loop/i);
  });

  it('detects duplicate edge', () => {
    const edges = [mkEdge('e1','A','B'), mkEdge('e2','A','B')];
    const errs = validateConnection(edges, []);
    expect(errs).toHaveLength(1);
    expect(errs[0].message).toMatch(/duplicate/i);
  });
});
