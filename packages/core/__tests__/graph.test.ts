import { Graph } from '../index';
describe('Graph type', () => {
  it('should contain nodes, edges, and meta fields', () => {
  const graph: Graph = {,
  nodes: [],
  edges: [],
  meta: {
  version: '0.0.1',
};
    expect(graph.nodes).toBeDefined();
    expect(graph.edges).toBeDefined();
    expect(graph.meta.version).toBe('0.0.1');
  });
});