import type { Node } from 'reactflow';
import {
  attachNodesToContainerNodes,
  findContainerAtPosition
} from '../dragDropContainerUtils';
import {
  ALLOWED_PRESET_SOURCE_ROOTS,
  getInlinePresetDocument,
  isSafePresetSourcePath
} from '../presetSourcePolicy';
import {
  findFragmentBoundaryNodes,
  replacePresetAtNode,
  splicePresetIntoEdge
} from '../../services/FragmentExecution';
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

const createEdge = (
  id: string,
  source: string,
  target: string,
  overrides: Record<string, unknown> = {}
) => ({
  id,
  source,
  target,
  ...overrides
});

describe('useDragDropHandlers helpers', () => {
  it('accepts only first-party preset roots for fetched sources', () => {
    expect(ALLOWED_PRESET_SOURCE_ROOTS).toEqual([
      '/assets/library/',
      '/presets/',
      '/asset-browser/presets/'
    ]);
    expect(isSafePresetSourcePath('/assets/library/characters/hero.psg')).toBe(
      true
    );
    expect(isSafePresetSourcePath('/presets/character-name-basic.psglib')).toBe(
      true
    );
    expect(
      isSafePresetSourcePath(
        '/asset-browser/presets/character-name-basic.psglib'
      )
    ).toBe(true);
  });

  it('rejects external and traversal-based preset sources', () => {
    expect(isSafePresetSourcePath('https://example.com/preset.psg')).toBe(
      false
    );
    expect(isSafePresetSourcePath('//example.com/preset.psg')).toBe(false);
    expect(isSafePresetSourcePath('/presets/../../secret.psg')).toBe(false);
    expect(isSafePresetSourcePath('/tmp/local.psg')).toBe(false);
  });

  it('only accepts inline content when it looks like a full preset document', () => {
    expect(
      getInlinePresetDocument({
        content: JSON.stringify({
          fileType: 'psglib',
          version: '1.0',
          nodes: [],
          edges: []
        })
      })
    ).toContain('"fileType":"psglib"');
    expect(
      getInlinePresetDocument({
        content: JSON.stringify({ metadata: { file: '/presets/test.psg' } })
      })
    ).toBeNull();
  });

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

    const result = findContainerAtPosition([outer, inner], { x: 180, y: 180 });

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

    const result = findContainerAtPosition([outer, inner], { x: 40, y: 40 });

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

  it('finds a single entry and exit node for a simple fragment', () => {
    const nodes = [
      createChildNode('a'),
      createChildNode('b'),
      createChildNode('c')
    ];
    const edges = [createEdge('ab', 'a', 'b'), createEdge('bc', 'b', 'c')];

    const result = findFragmentBoundaryNodes(nodes, edges);

    expect(result.entryNode?.id).toBe('a');
    expect(result.exitNode?.id).toBe('c');
  });

  it('splices a single-node fragment into an existing edge', () => {
    const existingEdges = [
      createEdge('edge-1', 'source', 'target', {
        type: 'smoothstep',
        className: 'edge-class',
        sourceHandle: 'out-1',
        targetHandle: 'in-1'
      })
    ];
    const nodesToAdd = [createChildNode('inserted')];

    const result = splicePresetIntoEdge(existingEdges, nodesToAdd, [], {
      edgeId: 'edge-1',
      sourceId: 'source',
      targetId: 'target',
      edgeType: 'smoothstep',
      edgeClassName: 'edge-class',
      sourceHandle: 'out-1',
      targetHandle: 'in-1'
    });

    expect(result).toHaveLength(2);
    expect(result.find(edge => edge.source === 'source' && edge.target === 'inserted')).toBeTruthy();
    expect(result.find(edge => edge.source === 'inserted' && edge.target === 'target')).toBeTruthy();
    expect(result.find(edge => edge.id === 'edge-1')).toBeFalsy();
  });

  it('splices a simple multi-node fragment into an existing edge', () => {
    const existingEdges = [createEdge('edge-1', 'source', 'target')];
    const nodesToAdd = [
      createChildNode('entry'),
      createChildNode('middle'),
      createChildNode('exit')
    ];
    const edgesToAdd = [
      createEdge('entry-middle', 'entry', 'middle'),
      createEdge('middle-exit', 'middle', 'exit')
    ];

    const result = splicePresetIntoEdge(existingEdges, nodesToAdd, edgesToAdd, {
      edgeId: 'edge-1',
      sourceId: 'source',
      targetId: 'target'
    });

    expect(result).toHaveLength(4);
    expect(result.find(edge => edge.source === 'source' && edge.target === 'entry')).toBeTruthy();
    expect(result.find(edge => edge.source === 'exit' && edge.target === 'target')).toBeTruthy();
    expect(result.find(edge => edge.id === 'entry-middle')).toBeTruthy();
    expect(result.find(edge => edge.id === 'middle-exit')).toBeTruthy();
  });

  it('falls back to normal insertion when fragment boundaries are ambiguous', () => {
    const existingEdges = [createEdge('edge-1', 'source', 'target')];
    const nodesToAdd = [
      createChildNode('a'),
      createChildNode('b'),
      createChildNode('c'),
      createChildNode('d')
    ];
    const edgesToAdd = [
      createEdge('ac', 'a', 'c'),
      createEdge('bd', 'b', 'd')
    ];

    const result = splicePresetIntoEdge(existingEdges, nodesToAdd, edgesToAdd, {
      edgeId: 'edge-1',
      sourceId: 'source',
      targetId: 'target'
    });

    expect(result).toHaveLength(3);
    expect(result.find(edge => edge.id === 'edge-1')).toBeTruthy();
    expect(result.find(edge => edge.id === 'ac')).toBeTruthy();
    expect(result.find(edge => edge.id === 'bd')).toBeTruthy();
  });

  it('skips edge splice when metadata prefers free placement', () => {
    const existingEdges = [createEdge('edge-1', 'source', 'target')];
    const nodesToAdd = [createChildNode('inserted')];

    const result = splicePresetIntoEdge(
      existingEdges,
      nodesToAdd,
      [],
      {
        edgeId: 'edge-1',
        sourceId: 'source',
        targetId: 'target'
      },
      {
        preferredInsertion: 'free-place',
        entryStrategy: 'single-node',
        exitStrategy: 'single-node'
      }
    );

    expect(result).toHaveLength(1);
    expect(result.find(edge => edge.id === 'edge-1')).toBeTruthy();
  });

  it('skips auto splice when metadata requires manual boundaries', () => {
    const existingEdges = [createEdge('edge-1', 'source', 'target')];
    const nodesToAdd = [
      createChildNode('entry'),
      createChildNode('middle'),
      createChildNode('exit')
    ];
    const edgesToAdd = [
      createEdge('entry-middle', 'entry', 'middle'),
      createEdge('middle-exit', 'middle', 'exit')
    ];

    const result = splicePresetIntoEdge(
      existingEdges,
      nodesToAdd,
      edgesToAdd,
      {
        edgeId: 'edge-1',
        sourceId: 'source',
        targetId: 'target'
      },
      {
        preferredInsertion: 'insert-edge',
        entryStrategy: 'manual',
        exitStrategy: 'manual'
      }
    );

    expect(result).toHaveLength(3);
    expect(result.find(edge => edge.id === 'edge-1')).toBeTruthy();
    expect(result.find(edge => edge.id === 'entry-middle')).toBeTruthy();
    expect(result.find(edge => edge.id === 'middle-exit')).toBeTruthy();
  });

  it('replaces a single node with a single-node fragment and rewires edges', () => {
    const existingNodes = [
      createChildNode('source'),
      createChildNode('target'),
      createChildNode('after')
    ];
    const existingEdges = [
      createEdge('source-target', 'source', 'target'),
      createEdge('target-after', 'target', 'after')
    ];
    const nodesToAdd = [createChildNode('inserted')];

    const result = replacePresetAtNode(
      existingNodes,
      existingEdges,
      nodesToAdd,
      [],
      { nodeId: 'target' },
      {
        preferredInsertion: 'replace-node',
        entryStrategy: 'single-node',
        exitStrategy: 'single-node'
      }
    );

    expect(result.replaced).toBe(true);
    expect(result.nodes.find(node => node.id === 'target')).toBeFalsy();
    expect(result.nodes.find(node => node.id === 'inserted')).toBeTruthy();
    expect(result.edges.find(edge => edge.source === 'source' && edge.target === 'inserted')).toBeTruthy();
    expect(result.edges.find(edge => edge.source === 'inserted' && edge.target === 'after')).toBeTruthy();
    expect(result.edges.find(edge => edge.id === 'source-target')).toBeFalsy();
    expect(result.edges.find(edge => edge.id === 'target-after')).toBeFalsy();
  });

  it('replaces a node with a simple multi-node fragment and rewires through boundaries', () => {
    const existingNodes = [
      createChildNode('source'),
      createChildNode('target'),
      createChildNode('after')
    ];
    const existingEdges = [
      createEdge('source-target', 'source', 'target'),
      createEdge('target-after', 'target', 'after')
    ];
    const nodesToAdd = [
      createChildNode('entry'),
      createChildNode('middle'),
      createChildNode('exit')
    ];
    const edgesToAdd = [
      createEdge('entry-middle', 'entry', 'middle'),
      createEdge('middle-exit', 'middle', 'exit')
    ];

    const result = replacePresetAtNode(
      existingNodes,
      existingEdges,
      nodesToAdd,
      edgesToAdd,
      { nodeId: 'target' },
      {
        preferredInsertion: 'replace-node',
        entryStrategy: 'auto-boundary',
        exitStrategy: 'auto-boundary'
      }
    );

    expect(result.replaced).toBe(true);
    expect(result.nodes.find(node => node.id === 'target')).toBeFalsy();
    expect(result.edges.find(edge => edge.source === 'source' && edge.target === 'entry')).toBeTruthy();
    expect(result.edges.find(edge => edge.source === 'exit' && edge.target === 'after')).toBeTruthy();
    expect(result.edges.find(edge => edge.id === 'entry-middle')).toBeTruthy();
    expect(result.edges.find(edge => edge.id === 'middle-exit')).toBeTruthy();
  });

  it('falls back to append-only insertion when replacement boundaries are ambiguous', () => {
    const existingNodes = [
      createChildNode('source'),
      createChildNode('target'),
      createChildNode('after')
    ];
    const existingEdges = [
      createEdge('source-target', 'source', 'target'),
      createEdge('target-after', 'target', 'after')
    ];
    const nodesToAdd = [
      createChildNode('a'),
      createChildNode('b'),
      createChildNode('c'),
      createChildNode('d')
    ];
    const edgesToAdd = [
      createEdge('ac', 'a', 'c'),
      createEdge('bd', 'b', 'd')
    ];

    const result = replacePresetAtNode(
      existingNodes,
      existingEdges,
      nodesToAdd,
      edgesToAdd,
      { nodeId: 'target' },
      {
        preferredInsertion: 'replace-node',
        entryStrategy: 'auto-boundary',
        exitStrategy: 'auto-boundary'
      }
    );

    expect(result.replaced).toBe(false);
    expect(result.nodes.find(node => node.id === 'target')).toBeTruthy();
    expect(result.nodes.find(node => node.id === 'a')).toBeTruthy();
    expect(result.edges.find(edge => edge.id === 'source-target')).toBeTruthy();
    expect(result.edges.find(edge => edge.id === 'target-after')).toBeTruthy();
    expect(result.edges.find(edge => edge.id === 'ac')).toBeTruthy();
    expect(result.edges.find(edge => edge.id === 'bd')).toBeTruthy();
  });
});
