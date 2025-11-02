import { simplePromptParser } from '../simplePromptParser';

describe('simplePromptParser', () => {
  it('creates individual nodes for comma-delimited descriptors', () => {
    const prompt =
      'a black grandmother and her granddaughter, laughing, minimalist green background, facing each other, connection, like a fashion photoshoot';

    const analysis = simplePromptParser.parse(prompt);

    // Expect one node per descriptor plus the auto-appended output node.
    expect(analysis.nodes).toHaveLength(7);
    expect(analysis.nodes.slice(0, -1).map(node => node.node.getPreviewText?.())).toEqual([
      'a black grandmother and her granddaughter',
      'laughing',
      'minimalist green background',
      'facing each other',
      'connection',
      'like a fashion photoshoot'
    ]);

    expect(analysis.edges).toHaveLength(6);
  });
});
