import { validateEditorGraphPayload } from '../graphValidation';

describe('epic1 graphValidation', () => {
  it('normalizes valid graph payloads', () => {
    const result = validateEditorGraphPayload({
      nodes: [
        {
          id: 'node-1',
          type: 'textBlock',
          position: { x: 12, y: 24 }
        }
      ],
      edges: [{ source: 'node-1', target: 'node-1' }]
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error(result.error);
    }

    expect(result.data.edges[0]?.id).toBe('node-1__node-1__0');
  });

  it('rejects malformed node payloads', () => {
    expect(
      validateEditorGraphPayload({
        nodes: [{ type: 'textBlock', position: { x: 0, y: 0 } }],
        edges: []
      })
    ).toEqual({
      ok: false,
      error: 'Node 1 is missing a string id'
    });
  });
});
