import { parseInitialEditorSeed } from '../initialEditorSeed';

describe('parseInitialEditorSeed', () => {
  it('returns undefined for empty or invalid values', () => {
    expect(parseInitialEditorSeed(null)).toBeUndefined();
    expect(parseInitialEditorSeed('')).toBeUndefined();
    expect(parseInitialEditorSeed('{invalid')).toBeUndefined();
    expect(parseInitialEditorSeed(JSON.stringify({ nodes: [] }))).toBeUndefined();
  });

  it('returns a graph seed when nodes and edges are present', () => {
    expect(
      parseInitialEditorSeed(
        JSON.stringify({
          nodes: [
            {
              id: 'bootstrap-box-1',
              type: 'enhancedBoundingBox',
              position: { x: 100, y: 80 },
              selected: true,
              data: {
                bootstrapInserted: true,
                bootstrapGroupId: 'bootstrap-group-1'
              }
            }
          ],
          edges: []
        })
      )
    ).toEqual({
      nodes: [
        expect.objectContaining({
          id: 'bootstrap-box-1'
        })
      ],
      edges: []
    });
  });
});
