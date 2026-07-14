import { buildNestedDocumentStarter } from '../nestedDocumentStarter';

describe('buildNestedDocumentStarter', () => {
  it('returns a minimal Text → Output graph', () => {
    const { nodes, edges } = buildNestedDocumentStarter('Forge Wares');
    expect(nodes).toHaveLength(2);
    expect(nodes.map(n => n.type).sort()).toEqual(['output', 'textBlock']);
    expect(edges).toHaveLength(1);
    expect(edges[0].source).toBe(nodes.find(n => n.type === 'textBlock')!.id);
    expect(edges[0].target).toBe(nodes.find(n => n.type === 'output')!.id);
    const text = nodes.find(n => n.type === 'textBlock')!;
    expect(String(text.data.value)).toContain('Forge Wares');
  });
});
