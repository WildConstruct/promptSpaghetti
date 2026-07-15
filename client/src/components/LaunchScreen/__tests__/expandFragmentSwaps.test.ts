import {
  resolveFragmentFetchUrl,
  spliceLoadedFragments
} from '../expandFragmentSwaps';
import type { Edge, Node } from 'reactflow';

type FlowNode = Node<Record<string, unknown>>;

describe('expandFragmentSwaps', () => {
  it('resolves library paths for fetch', () => {
    expect(resolveFragmentFetchUrl('/assets/library/foo.psg')).toBe(
      '/assets/library/foo.psg'
    );
    expect(resolveFragmentFetchUrl('setting-environment/lighting-moods.psg')).toBe(
      '/assets/library/setting-environment/lighting-moods.psg'
    );
  });

  it('splices a loaded fragment in place of a placeholder', () => {
    const baseNodes: FlowNode[] = [
      {
        id: 'a',
        type: 'textBlock',
        position: { x: 0, y: 0 },
        data: { text: 'before' }
      },
      {
        id: 'swap',
        type: 'textBlock',
        position: { x: 300, y: 0 },
        data: {
          fragmentSwap: true,
          fragmentPath: '/assets/library/x.psg',
          text: 'Lighting Moods'
        }
      },
      {
        id: 'out',
        type: 'output',
        position: { x: 600, y: 0 },
        data: { label: 'Output' }
      }
    ];
    const baseEdges: Edge[] = [
      { id: 'e1', source: 'a', target: 'swap' },
      { id: 'e2', source: 'swap', target: 'out' }
    ];

    const fragNodes: FlowNode[] = [
      {
        id: 'wc',
        type: 'weightedChoice',
        position: { x: 100, y: 100 },
        data: { options: [] }
      },
      {
        id: 'fo',
        type: 'output',
        position: { x: 400, y: 100 },
        data: { label: 'Output' }
      }
    ];
    const fragEdges: Edge[] = [
      { id: 'fe', source: 'wc', target: 'fo' }
    ];

    const result = spliceLoadedFragments(baseNodes, baseEdges, [
      {
        placeholderId: 'swap',
        fragmentNodes: fragNodes,
        fragmentEdges: fragEdges
      }
    ]);

    expect(result.nodes.find(n => n.id === 'swap')).toBeUndefined();
    expect(result.nodes.some(n => n.id.startsWith('fx-swap-'))).toBe(true);
    expect(result.edges.some(e => e.source === 'a')).toBe(true);
    expect(result.edges.some(e => e.target === 'out')).toBe(true);
    // Internal fragment edge preserved (rebased)
    expect(result.edges.some(e => e.id.includes('fe'))).toBe(true);
  });
});
