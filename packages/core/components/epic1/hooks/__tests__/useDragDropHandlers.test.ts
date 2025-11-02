import type { Node } from 'reactflow';
import {
  attachNodesToContainerNodes,
  findContainerAtPosition
} from '../dragDropContainerUtils';
import type { EditableNodeData } from '../../nodes';

type FlowNode = Node<EditableNodeData>;

type NodeOverrides = Partial<Omit<FlowNode, 'id' | 'data'>> & {
  data?: Partial<EditableNodeData>;
};

const createContainerNode = (
  id: string,
  overrides: NodeOverrides = {}
): FlowNode => {
  const { data: dataOverrides, ...rest } = overrides;
  return {
    id,
    type: 'fragmentContainer',
    position: { x: 0, y: 0 },
    positionAbsolute: { x: 0, y: 0 },
    width: 400,
    height: 300,
    data: {
      value: '',
      nodeType: 'fragmentContainer',
      width: 400,
      height: 300,
      ...(dataOverrides ?? {})
    },
    ...rest
  };
};

const createChildNode = (
  id: string,
  overrides: NodeOverrides = {}
): FlowNode => {
  const { data: dataOverrides, ...rest } = overrides;
  return {
    id,
    type: 'textBlock',
    position: { x: 0, y: 0 },
    data: {
      value: '',
      nodeType: 'textBlock',
      ...(dataOverrides ?? {})
    },
    ...rest
  };
};

describe('useDragDropHandlers helpers', () => {
  it('prefers the deepest visible container when positions overlap', () => {
    const outer = createContainerNode('outer', {
      position: { x: 0, y: 0 },
      positionAbsolute: { x: 0, y: 0 },
      width: 600,
      height: 600,
      data: { width: 600, height: 600 }
    });
    const inner = createContainerNode('inner', {
      parentNode: 'outer',
      position: { x: 120, y: 120 },
      positionAbsolute: { x: 120, y: 120 },
      width: 240,
      height: 240,
      data: { width: 240, height: 240 }
    });

    const result = findContainerAtPosition(
      [outer, inner],
      { x: 180, y: 180 }
    );

    expect(result?.id).toBe('inner');
  });

  it('falls back to outer container when point lies outside inner bounds', () => {
    const outer = createContainerNode('outer', {
      position: { x: 0, y: 0 },
      positionAbsolute: { x: 0, y: 0 },
      width: 600,
      height: 600,
      data: { width: 600, height: 600 }
    });
    const inner = createContainerNode('inner', {
      parentNode: 'outer',
      position: { x: 120, y: 120 },
      positionAbsolute: { x: 120, y: 120 },
      width: 240,
      height: 240,
      data: { width: 240, height: 240 }
    });

    const result = findContainerAtPosition(
      [outer, inner],
      { x: 40, y: 40 }
    );

    expect(result?.id).toBe('outer');
  });

  it('attaches nodes to collapsed containers while keeping them hidden', () => {
    const container = createContainerNode('container', {
      positionAbsolute: { x: 50, y: 50 },
      data: { isCollapsed: true, width: 320, height: 220 }
    });
    const child = createChildNode('child', {
      position: { x: 140, y: 140 }
    });

    const [attached] = attachNodesToContainerNodes([child], container);

    expect(attached).not.toBe(child);
    expect(attached.parentNode).toBe('container');
    expect(attached.hidden).toBe(true);
    expect(attached.extent).toBe('parent');
    expect(attached.position.x).toBeGreaterThanOrEqual(0);
    expect(attached.position.y).toBeGreaterThanOrEqual(0);
  });

  it('clamps attached node positions when they fall outside the container padding', () => {
    const container = createContainerNode('container', {
      positionAbsolute: { x: 100, y: 100 },
      data: { width: 320, height: 220 }
    });
    const child = createChildNode('child', {
      position: { x: 80, y: 80 }
    });

    const [attached] = attachNodesToContainerNodes([child], container);

    expect(attached.position.x).toBe(0);
    expect(attached.position.y).toBe(0);
  });
});
