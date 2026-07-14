/**
 * @jest-environment node
 */
import type { Node } from 'reactflow';
import { nodeDataToRuntimeNode } from '../nodeFactory';
import type { EditableNodeData } from '../BaseEditableNode';

describe('nodeFactory Include handling (B4 format-only)', () => {
  it('skips include nodes instead of creating a runtime node', () => {
    const flowNode = {
      id: 'inc-1',
      type: 'include',
      position: { x: 0, y: 0 },
      data: {
        nodeType: 'include',
        value: 'fragment-name',
        name: 'fragment-name'
      }
    } as Node<EditableNodeData>;

    expect(nodeDataToRuntimeNode(flowNode)).toBeNull();
  });

  it('still converts executable product types', () => {
    const text = {
      id: 't1',
      type: 'textBlock',
      position: { x: 0, y: 0 },
      data: { nodeType: 'textBlock', value: 'hello', text: 'hello' }
    } as Node<EditableNodeData>;

    const runtime = nodeDataToRuntimeNode(text);
    expect(runtime).not.toBeNull();
    expect(runtime?.getNodeType()).toBe('TextBlock');
  });
});
