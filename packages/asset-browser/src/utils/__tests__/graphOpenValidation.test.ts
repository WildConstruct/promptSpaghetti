import { validateOpenedGraphPayload } from '../graphOpenValidation';

describe('graphOpenValidation', () => {
  it('validates flat graph payloads and normalizes missing edge ids', () => {
    const result = validateOpenedGraphPayload({
      version: '1.0.0',
      nodes: [
        {
          id: 'node-1',
          type: 'textBlock',
          position: { x: 10, y: 20 },
          data: { value: 'hello' }
        }
      ],
      edges: [{ source: 'node-1', target: 'node-1' }]
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error(result.error);
    }

    const graph = result.data as { edges: Array<{ id: string }> };
    expect(graph.edges[0]?.id).toBe('node-1__node-1__0');
  });

  it('validates legacy graph wrappers through the nested graph field', () => {
    const result = validateOpenedGraphPayload({
      version: '1.0',
      kind: 'graph',
      graph: {
        nodes: [
          {
            id: 'node-1',
            type: 'textBlock',
            position: { x: 5, y: 6 }
          }
        ],
        edges: [{ id: 'edge-1', source: 'node-1', target: 'node-1' }]
      }
    });

    expect(result.ok).toBe(true);
  });

  it('rejects malformed graph payloads before they are opened', () => {
    const result = validateOpenedGraphPayload({
      version: '1.0.0',
      nodes: [{ type: 'textBlock', position: { x: 0, y: 0 } }],
      edges: []
    });

    expect(result).toEqual({
      ok: false,
      error: 'Node 1 is missing a string id'
    });
  });
});
