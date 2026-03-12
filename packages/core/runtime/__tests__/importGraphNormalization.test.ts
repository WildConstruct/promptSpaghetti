import {
  annotateLibraryWeightedChoiceBranchUsage,
  normalizeImportedEdges,
  normalizeLegacyFlatPsgShape,
  normalizeLibraryImportEdges,
  normalizePsgLikeData,
  repairLegacyImportEdgeHandles,
  getImportedFragmentWrapperPolicy,
  prepareImportedGraphBatch
} from '../importGraphNormalization';

type TestImportedNode = {
  id: string;
  type: string;
  position: { x: number; y: number };
  width?: number;
  height?: number;
  parentNode?: string;
  extent?: string;
  expandParent?: boolean;
  data: Record<string, any>;
};

type TestImportedEdge = {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
};

describe('importGraphNormalization', () => {
  it('exposes normalizeLegacyFlatPsgShape with the same legacy flat-PSG repair behavior as the wrapper', () => {
    const input = {
      metadata: {
        version: '2.3.4',
        title: 'Legacy Title'
      },
      description: 'Legacy description',
      region: {
        label: 'Legacy Region',
        nodeIds: ['node-1']
      },
      nodes: [
        {
          id: 'node-1',
          type: 'TextBlock',
          position: { x: 12, y: 34 }
        }
      ],
      type: 'psg'
    };

    expect(normalizeLegacyFlatPsgShape(input)).toEqual(
      normalizePsgLikeData(input)
    );
  });

  it('normalizes singular region flat PSG inputs into canonical regions and top-level positions', () => {
    const normalized = normalizePsgLikeData({
      metadata: {
        version: '2.3.4',
        title: 'Legacy Title'
      },
      description: 'Legacy description',
      region: {
        label: 'Legacy Region',
        nodeIds: ['node-1']
      },
      nodes: [
        {
          id: 'node-1',
          type: 'TextBlock',
          position: { x: 12, y: 34 }
        }
      ],
      type: 'psg'
    });

    expect(normalized.version).toBe('2.3.4');
    expect(normalized.name).toBe('Legacy Title');
    expect(normalized.region).toBeUndefined();
    expect(normalized.type).toBeUndefined();
    expect(normalized.edges).toEqual([]);
    expect(normalized.nodes).toEqual([
      expect.objectContaining({
        id: 'node-1',
        x: 12,
        y: 34
      })
    ]);
    expect(normalized.regions).toEqual([
      expect.objectContaining({
        id: 'region-1',
        name: 'Legacy Region',
        nodes: ['node-1']
      })
    ]);
  });

  it('normalizes groups into regions and repairs region label and nodeIds fields', () => {
    const normalized = normalizePsgLikeData({
      name: '',
      description: 'Grouped fragment',
      groups: [
        {
          label: 'Group Label',
          nodeIds: ['node-a'],
          description: 'Group description',
          metadata: { source: 'legacy-group' }
        }
      ],
      regions: [
        {
          label: 'Region Label',
          nodeIds: ['node-b']
        }
      ],
      nodes: [
        {
          id: 'node-a',
          x: 1,
          y: 2
        },
        {
          id: 'node-b',
          x: 3,
          y: 4
        }
      ],
      edges: []
    });

    expect(normalized.name).toBe('Grouped fragment');
    expect(normalized.groups).toEqual([
      expect.objectContaining({
        label: 'Group Label',
        nodeIds: ['node-a']
      })
    ]);
    expect(normalized.regions).toEqual([
      expect.objectContaining({
        id: 'region-1',
        name: 'Region Label',
        nodes: ['node-b']
      })
    ]);
  });

  it('annotates weighted-choice option hasBranch state from branch handle edges', () => {
    const nodes: TestImportedNode[] = [
      {
        id: 'weighted-1',
        type: 'WeightedChoice',
        position: { x: 0, y: 0 },
        data: {
          options: [{ text: 'A' }, { text: 'B' }, { text: 'C' }]
        }
      },
      {
        id: 'text-1',
        type: 'TextBlock',
        position: { x: 0, y: 0 },
        data: {}
      }
    ];

    annotateLibraryWeightedChoiceBranchUsage<
      TestImportedNode,
      TestImportedEdge
    >(
      [
        {
          id: 'edge-branch-0',
          source: 'weighted-1',
          target: 'text-1',
          sourceHandle: 'branch-0'
        },
        {
          id: 'edge-branch-2',
          source: 'weighted-1',
          target: 'text-1',
          sourceHandle: 'branch-2'
        },
        {
          id: 'edge-non-branch',
          source: 'weighted-1',
          target: 'text-1',
          sourceHandle: 'source'
        }
      ],
      nodes
    );

    expect(nodes[0].data.options).toEqual([
      expect.objectContaining({ hasBranch: true }),
      expect.objectContaining({ hasBranch: false }),
      expect.objectContaining({ hasBranch: true })
    ]);
  });

  it('repairs legacy edge aliases without assigning concat slots', () => {
    const nodes: TestImportedNode[] = [
      {
        id: 'text-1',
        type: 'TextBlock',
        position: { x: 0, y: 0 },
        data: {}
      },
      {
        id: 'concat-1',
        type: 'Concat',
        position: { x: 0, y: 0 },
        data: {}
      },
      {
        id: 'weighted-target',
        type: 'WeightedChoice',
        position: { x: 0, y: 0 },
        data: {
          options: [{ text: 'Choice' }]
        }
      }
    ];

    const repairedEdges = repairLegacyImportEdgeHandles<
      TestImportedNode,
      TestImportedEdge
    >(
      [
        {
          id: 'edge-output-alias',
          source: 'text-1',
          target: 'concat-1',
          sourceHandle: 'output'
        },
        {
          id: 'edge-main-output-alias',
          source: 'text-1',
          target: 'weighted-target',
          sourceHandle: 'main-output',
          targetHandle: 'input'
        }
      ],
      nodes
    );

    expect(repairedEdges).toEqual([
      expect.objectContaining({
        id: 'edge-output-alias',
        sourceHandle: 'source',
        targetHandle: undefined
      }),
      expect.objectContaining({
        id: 'edge-main-output-alias',
        sourceHandle: 'source',
        targetHandle: 'target'
      })
    ]);
  });

  it('normalizes library import edges for main-vs-source, concat slots, output clearing, and default targets', () => {
    const nodes: TestImportedNode[] = [
      {
        id: 'weighted-branching',
        type: 'WeightedChoice',
        position: { x: 0, y: 0 },
        data: {
          options: [
            { text: 'A', hasBranch: false },
            { text: 'B', hasBranch: true }
          ]
        }
      },
      {
        id: 'weighted-plain',
        type: 'WeightedChoice',
        position: { x: 0, y: 0 },
        data: {
          options: [{ text: 'Only', hasBranch: false }]
        }
      },
      {
        id: 'text-1',
        type: 'TextBlock',
        position: { x: 0, y: 0 },
        data: {}
      },
      {
        id: 'text-2',
        type: 'TextBlock',
        position: { x: 0, y: 0 },
        data: {}
      },
      {
        id: 'concat-1',
        type: 'Concat',
        position: { x: 0, y: 0 },
        data: {}
      },
      {
        id: 'output-1',
        type: 'Output',
        position: { x: 0, y: 0 },
        data: {}
      }
    ];

    const normalizedEdges = normalizeLibraryImportEdges<
      TestImportedNode,
      TestImportedEdge
    >(
      [
        {
          id: 'edge-branch',
          source: 'weighted-branching',
          target: 'text-1',
          sourceHandle: 'branch-1'
        },
        {
          id: 'edge-main',
          source: 'weighted-branching',
          target: 'output-1'
        },
        {
          id: 'edge-source',
          source: 'weighted-plain',
          target: 'text-1'
        },
        {
          id: 'edge-concat-1',
          source: 'text-1',
          target: 'concat-1'
        },
        {
          id: 'edge-concat-2',
          source: 'text-2',
          target: 'concat-1'
        },
        {
          id: 'edge-concat-output',
          source: 'concat-1',
          target: 'output-1',
          sourceHandle: 'ignored',
          targetHandle: 'ignored'
        }
      ],
      nodes
    );

    expect(normalizedEdges).toEqual([
      expect.objectContaining({
        id: 'edge-branch',
        sourceHandle: 'branch-1',
        targetHandle: 'target'
      }),
      expect.objectContaining({
        id: 'edge-main',
        sourceHandle: 'main',
        targetHandle: undefined
      }),
      expect.objectContaining({
        id: 'edge-source',
        sourceHandle: 'source',
        targetHandle: 'target'
      }),
      expect.objectContaining({
        id: 'edge-concat-1',
        sourceHandle: 'source',
        targetHandle: 'input1'
      }),
      expect.objectContaining({
        id: 'edge-concat-2',
        sourceHandle: 'source',
        targetHandle: 'input2'
      }),
      expect.objectContaining({
        id: 'edge-concat-output',
        sourceHandle: 'source',
        targetHandle: undefined
      })
    ]);
  });

  it('maps weighted-choice branch usage and preserves main-vs-source defaults', () => {
    const nodes: TestImportedNode[] = [
      {
        id: 'weighted-branching',
        type: 'WeightedChoice',
        position: { x: 0, y: 0 },
        data: {
          options: [{ text: 'A' }, { text: 'B' }]
        }
      },
      {
        id: 'weighted-plain',
        type: 'WeightedChoice',
        position: { x: 0, y: 0 },
        data: {
          options: [{ text: 'Only' }]
        }
      },
      {
        id: 'text-1',
        type: 'TextBlock',
        position: { x: 0, y: 0 },
        data: {}
      },
      {
        id: 'output-1',
        type: 'Output',
        position: { x: 0, y: 0 },
        data: {}
      }
    ];

    const normalizedEdges = normalizeImportedEdges<
      TestImportedNode,
      TestImportedEdge
    >(
      [
        {
          id: 'edge-branch',
          source: 'weighted-branching',
          target: 'text-1',
          sourceHandle: 'branch-1'
        },
        {
          id: 'edge-main',
          source: 'weighted-branching',
          target: 'output-1'
        },
        {
          id: 'edge-source',
          source: 'weighted-plain',
          target: 'text-1'
        }
      ],
      nodes
    );

    expect(nodes[0].data.options).toEqual([
      expect.objectContaining({ hasBranch: false }),
      expect.objectContaining({ hasBranch: true })
    ]);
    expect(normalizedEdges).toEqual([
      expect.objectContaining({
        id: 'edge-branch',
        sourceHandle: 'branch-1',
        targetHandle: 'target'
      }),
      expect.objectContaining({
        id: 'edge-main',
        sourceHandle: 'main',
        targetHandle: undefined
      }),
      expect.objectContaining({
        id: 'edge-source',
        sourceHandle: 'source',
        targetHandle: 'target'
      })
    ]);
  });

  it('repairs legacy edge handle aliases and assigns concat targets deterministically', () => {
    const nodes: TestImportedNode[] = [
      {
        id: 'text-1',
        type: 'TextBlock',
        position: { x: 0, y: 0 },
        data: {}
      },
      {
        id: 'text-2',
        type: 'TextBlock',
        position: { x: 0, y: 0 },
        data: {}
      },
      {
        id: 'concat-1',
        type: 'Concat',
        position: { x: 0, y: 0 },
        data: {}
      },
      {
        id: 'output-1',
        type: 'Output',
        position: { x: 0, y: 0 },
        data: {}
      },
      {
        id: 'weighted-target',
        type: 'WeightedChoice',
        position: { x: 0, y: 0 },
        data: {
          options: [{ text: 'Choice' }]
        }
      }
    ];

    const normalizedEdges = normalizeImportedEdges<
      TestImportedNode,
      TestImportedEdge
    >(
      [
        {
          id: 'edge-output-alias',
          source: 'text-1',
          target: 'concat-1',
          sourceHandle: 'output'
        },
        {
          id: 'edge-main-alias',
          source: 'text-2',
          target: 'concat-1',
          sourceHandle: 'main'
        },
        {
          id: 'edge-main-output-alias',
          source: 'text-1',
          target: 'weighted-target',
          sourceHandle: 'main-output',
          targetHandle: 'input'
        },
        {
          id: 'edge-concat-output',
          source: 'concat-1',
          target: 'output-1',
          sourceHandle: 'ignored',
          targetHandle: 'ignored'
        }
      ],
      nodes
    );

    expect(normalizedEdges).toEqual([
      expect.objectContaining({
        id: 'edge-output-alias',
        sourceHandle: 'source',
        targetHandle: 'input1'
      }),
      expect.objectContaining({
        id: 'edge-main-alias',
        sourceHandle: 'source',
        targetHandle: 'input2'
      }),
      expect.objectContaining({
        id: 'edge-main-output-alias',
        sourceHandle: 'source',
        targetHandle: 'target'
      }),
      expect.objectContaining({
        id: 'edge-concat-output',
        sourceHandle: 'source',
        targetHandle: undefined
      })
    ]);
  });

  it('trusts already-parented imported fragment wrappers and skips auto-layout and parent repair', () => {
    const presetData = {
      graph: {
        nodes: [
          {
            id: 'fragment-1',
            type: 'enhancedBoundingBox',
            data: { fragmentImported: true }
          }
        ]
      }
    };

    const nodes = [
      {
        id: 'fragment-1',
        type: 'enhancedBoundingBox',
        data: { fragmentImported: true }
      },
      {
        id: 'child-1',
        type: 'weightedChoice',
        parentNode: 'fragment-1',
        data: { nodeType: 'weightedChoice' }
      },
      {
        id: 'child-2',
        type: 'textBlock',
        parentNode: 'fragment-1',
        data: { nodeType: 'textBlock' }
      }
    ];

    const policy = getImportedFragmentWrapperPolicy({
      presetData,
      nodes
    });

    expect(policy.shouldPreservePositions).toBe(true);
    expect(policy.hasImportedFragmentLayout).toBe(true);
    expect(policy.shouldSkipAutoLayout).toBe(true);
    expect(policy.shouldSkipParentRepair).toBe(true);
  });

  it('requires repair when imported fragment children are not already parented to the wrapper', () => {
    const presetData = {
      regions: [{ id: 'region-1', name: 'Region 1', nodes: ['child-1'] }]
    };

    const nodes = [
      {
        id: 'fragment-1',
        type: 'enhancedBoundingBox',
        data: { fragmentImported: true }
      },
      {
        id: 'child-1',
        type: 'weightedChoice',
        data: { nodeType: 'weightedChoice' }
      }
    ];

    const policy = getImportedFragmentWrapperPolicy({
      presetData,
      nodes
    });

    expect(policy.shouldPreservePositions).toBe(true);
    expect(policy.hasImportedFragmentLayout).toBe(false);
    expect(policy.shouldSkipAutoLayout).toBe(true);
    expect(policy.shouldSkipParentRepair).toBe(false);
  });

  it('prepares the final imported graph batch by skipping layout, repairing wrapper parenting, and retargeting inserted outputs', () => {
    const presetData = {
      regions: [
        { id: 'region-1', name: 'Region 1', nodes: ['child-1', 'output-1'] }
      ]
    };

    let layoutCallCount = 0;
    const layoutNodes = (nodes: TestImportedNode[]) => {
      layoutCallCount += 1;
      return nodes;
    };

    const nodes: TestImportedNode[] = [
      {
        id: 'fragment-1',
        type: 'enhancedBoundingBox',
        position: { x: 100, y: 200 },
        width: 320,
        height: 220,
        data: { fragmentImported: true, width: 320, height: 220 }
      },
      {
        id: 'child-1',
        type: 'weightedChoice',
        position: { x: 150, y: 260 },
        width: 180,
        height: 120,
        data: { nodeType: 'weightedChoice' }
      },
      {
        id: 'output-1',
        type: 'output',
        position: { x: 360, y: 260 },
        width: 120,
        height: 60,
        data: { nodeType: 'output' }
      }
    ];

    const edges: TestImportedEdge[] = [
      {
        id: 'edge-1',
        source: 'child-1',
        target: 'output-1',
        sourceHandle: 'source'
      }
    ];

    const existingNodes: TestImportedNode[] = [
      {
        id: 'existing-output',
        type: 'output',
        position: { x: 800, y: 400 },
        width: 120,
        height: 60,
        data: { nodeType: 'output' }
      }
    ];

    const batch = prepareImportedGraphBatch<TestImportedNode, TestImportedEdge>(
      {
        presetData,
        nodes,
        edges,
        existingNodes,
        getNodeWidth: node => node.width ?? node.data?.width ?? 120,
        getNodeHeight: node => node.height ?? node.data?.height ?? 60,
        layoutNodes
      }
    );

    expect(layoutCallCount).toBe(0);
    expect(batch.policy.shouldSkipAutoLayout).toBe(true);
    expect(batch.policy.shouldSkipParentRepair).toBe(false);

    expect(batch.nodes.some(node => node.id === 'output-1')).toBe(false);

    const repairedChild = batch.nodes.find(node => node.id === 'child-1');
    expect(repairedChild).toBeDefined();
    expect(repairedChild?.parentNode).toBe('fragment-1');
    expect(repairedChild?.extent).toBe('parent');
    expect(repairedChild?.expandParent).toBe(true);
    expect(repairedChild?.position).toEqual({ x: 50, y: 60 });

    expect(batch.edges).toEqual([
      expect.objectContaining({
        id: 'edge-1',
        source: 'child-1',
        target: 'existing-output',
        targetHandle: undefined
      })
    ]);
  });
});
