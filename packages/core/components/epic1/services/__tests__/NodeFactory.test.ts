import { NodeFactory } from '../NodeFactory';

describe('NodeFactory', () => {
  it('creates annotation notes with documentation-only defaults', () => {
    const node = NodeFactory.createNode('postItNote', { x: 120, y: 240 });

    expect(node.type).toBe('postItNote');
    expect(node.position).toEqual({ x: 120, y: 240 });
    expect(node.data.nodeType).toBe('postItNote');
    expect(node.data.text).toBe('');
    expect(node.data.value).toBe('');
  });

  it('lists postItNote as an available node type', () => {
    expect(NodeFactory.getAvailableNodeTypes()).toContain('postItNote');
  });
});
