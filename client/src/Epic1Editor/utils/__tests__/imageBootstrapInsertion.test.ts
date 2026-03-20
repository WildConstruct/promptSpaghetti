import type { Edge, Node } from 'reactflow';
import {
  mergeDraftIntoGraph,
  replaceBootstrapGroupInGraph
} from '../imageBootstrapInsertion';

describe('mergeDraftIntoGraph', () => {
  it('preserves the existing graph and inserts the draft with remapped ids', () => {
    const currentNodes: Node[] = [
      {
        id: 'existing-1',
        type: 'textBlock',
        position: { x: 200, y: 80 },
        data: { label: 'Existing' }
      }
    ];
    const currentEdges: Edge[] = [
      {
        id: 'existing-edge-1',
        source: 'existing-1',
        target: 'existing-1'
      }
    ];
    const draftNodes: Node[] = [
      {
        id: 'draft-1',
        type: 'textBlock',
        position: { x: 420, y: 240 },
        data: { label: 'Draft 1' }
      },
      {
        id: 'draft-2',
        type: 'output',
        position: { x: 560, y: 240 },
        data: { label: 'Draft 2' }
      }
    ];
    const draftEdges: Edge[] = [
      {
        id: 'draft-edge-1',
        source: 'draft-1',
        target: 'draft-2'
      }
    ];

    const result = mergeDraftIntoGraph(
      currentNodes,
      currentEdges,
      draftNodes,
      draftEdges,
      123
    );

    expect(result.nodes).toHaveLength(4);
    expect(result.edges).toHaveLength(2);
    expect(result.nodes[0]?.id).toBe('existing-1');
    expect(result.nodes[0]?.selected).toBe(false);
    expect(result.edges[0]?.id).toBe('existing-edge-1');
    expect(result.edges[0]?.selected).toBe(false);
    expect(result.nodes[1]).toMatchObject({
      id: 'bootstrap-box-123',
      type: 'enhancedBoundingBox',
      position: { x: 488, y: -68 },
      data: {
        bootstrapGroupId: 'bootstrap-group-123',
        bootstrapInserted: true,
        title: 'Image Bootstrap',
        nodeCount: 2,
        fragmentImported: true,
        fragmentSource: 'image-bootstrap'
      },
      selected: true
    });
    expect(result.nodes[2]).toMatchObject({
      id: 'bootstrap-123-1-draft-1',
      parentNode: 'bootstrap-box-123',
      position: { x: 32, y: 68 },
      data: {
        bootstrapGroupId: 'bootstrap-group-123',
        bootstrapInserted: true
      },
      selected: true
    });
    expect(result.nodes[3]).toMatchObject({
      id: 'bootstrap-123-2-draft-2',
      parentNode: 'bootstrap-box-123',
      position: { x: 172, y: 68 },
      data: {
        bootstrapGroupId: 'bootstrap-group-123',
        bootstrapInserted: true
      },
      selected: true
    });
    expect(result.edges[1]).toMatchObject({
      id: 'bootstrap-edge-123-1-draft-edge-1',
      source: 'bootstrap-123-1-draft-1',
      target: 'bootstrap-123-2-draft-2',
      data: {
        bootstrapGroupId: 'bootstrap-group-123',
        bootstrapInserted: true
      },
      selected: true
    });
  });

  it('normalizes draft coordinates before insertion so large source offsets do not create gaps', () => {
    const result = mergeDraftIntoGraph(
      [
        {
          id: 'existing-1',
          type: 'textBlock',
          position: { x: 100, y: 100 },
          data: { label: 'Existing' }
        }
      ],
      [],
      [
        {
          id: 'draft-a',
          type: 'textBlock',
          position: { x: 1000, y: 800 },
          data: { label: 'Draft A' }
        },
        {
          id: 'draft-b',
          type: 'output',
          position: { x: 1180, y: 860 },
          data: { label: 'Draft B' }
        }
      ],
      [],
      456
    );

    expect(result.nodes[1]).toMatchObject({
      id: 'bootstrap-box-456',
      type: 'enhancedBoundingBox',
      position: { x: 388, y: -68 }
    });
    expect(result.nodes[2]).toMatchObject({
      id: 'bootstrap-456-1-draft-a',
      parentNode: 'bootstrap-box-456',
      position: { x: 32, y: 68 },
      selected: true
    });
    expect(result.nodes[3]).toMatchObject({
      id: 'bootstrap-456-2-draft-b',
      parentNode: 'bootstrap-box-456',
      position: { x: 212, y: 128 },
      selected: true
    });
  });

  it('returns the original graph unchanged when no draft nodes exist', () => {
    const currentNodes: Node[] = [
      {
        id: 'existing-1',
        type: 'textBlock',
        position: { x: 0, y: 0 },
        data: { label: 'Existing' }
      }
    ];
    const currentEdges: Edge[] = [];

    const result = mergeDraftIntoGraph(currentNodes, currentEdges, [], [], 999);

    expect(result).toEqual({
      nodes: currentNodes,
      edges: currentEdges
    });
  });

  it('uses the provided anchor when one is supplied', () => {
    const result = mergeDraftIntoGraph(
      [
        {
          id: 'existing-1',
          type: 'textBlock',
          position: { x: 100, y: 100 },
          data: { label: 'Existing' }
        }
      ],
      [],
      [
        {
          id: 'draft-a',
          type: 'textBlock',
          position: { x: 50, y: 60 },
          data: { label: 'Draft A' }
        },
        {
          id: 'draft-b',
          type: 'output',
          position: { x: 130, y: 120 },
          data: { label: 'Draft B' }
        }
      ],
      [],
      321,
      { anchor: { x: 900, y: 300 } }
    );

    expect(result.nodes[1]).toMatchObject({
      id: 'bootstrap-box-321',
      type: 'enhancedBoundingBox',
      position: { x: 868, y: 232 },
      selected: true
    });
    expect(result.nodes[2]).toMatchObject({
      id: 'bootstrap-321-1-draft-a',
      parentNode: 'bootstrap-box-321',
      position: { x: 32, y: 68 },
      selected: true
    });
    expect(result.nodes[3]).toMatchObject({
      id: 'bootstrap-321-2-draft-b',
      parentNode: 'bootstrap-box-321',
      position: { x: 112, y: 128 },
      selected: true
    });
  });

  it('preserves an imported enhancedBoundingBox instead of creating a duplicate wrapper', () => {
    const result = mergeDraftIntoGraph(
      [],
      [],
      [
        {
          id: 'box-1',
          type: 'enhancedBoundingBox',
          position: { x: 300, y: 200 },
          width: 400,
          height: 280,
          data: { title: 'Existing Wrapper' }
        },
        {
          id: 'draft-a',
          type: 'textBlock',
          position: { x: 340, y: 260 },
          parentNode: 'box-1',
          data: { label: 'Draft A' }
        }
      ],
      [],
      654
    );

    const boxes = result.nodes.filter(node => node.type === 'enhancedBoundingBox');

    expect(boxes).toHaveLength(1);
    expect(boxes[0]).toMatchObject({
      id: 'bootstrap-654-1-box-1',
      data: {
        title: 'Existing Wrapper',
        bootstrapGroupId: 'bootstrap-group-654',
        bootstrapInserted: true
      },
      selected: true
    });
    expect(result.nodes[1]).toMatchObject({
      id: 'bootstrap-654-2-draft-a',
      parentNode: 'bootstrap-654-1-box-1',
      position: { x: 40, y: 60 },
      data: {
        bootstrapGroupId: 'bootstrap-group-654',
        bootstrapInserted: true
      },
      selected: true
    });
  });

  it('parents a newly wrapped bootstrap draft inside a selected region container', () => {
    const result = mergeDraftIntoGraph(
      [
        {
          id: 'region-1',
          type: 'enhancedBoundingBox',
          position: { x: 200, y: 100 },
          width: 600,
          height: 400,
          data: { title: 'Target Region' }
        }
      ],
      [],
      [
        {
          id: 'draft-a',
          type: 'textBlock',
          position: { x: 30, y: 40 },
          data: { label: 'Draft A' }
        },
        {
          id: 'draft-b',
          type: 'output',
          position: { x: 150, y: 90 },
          data: { label: 'Draft B' }
        }
      ],
      [],
      777,
      {
        container: {
          id: 'region-1',
          type: 'enhancedBoundingBox',
          position: { x: 200, y: 100 }
        }
      }
    );

    expect(result.nodes[1]).toMatchObject({
      id: 'bootstrap-box-777',
      parentNode: 'region-1',
      position: { x: 8, y: -8 },
      selected: true
    });
    expect(result.nodes[2]).toMatchObject({
      id: 'bootstrap-777-1-draft-a',
      parentNode: 'bootstrap-box-777',
      position: { x: 32, y: 68 }
    });
  });

  it('parents an imported wrapper inside a selected region container without changing child parenting', () => {
    const result = mergeDraftIntoGraph(
      [
        {
          id: 'region-1',
          type: 'enhancedBoundingBox',
          position: { x: 300, y: 120 },
          width: 700,
          height: 420,
          data: { title: 'Target Region' }
        }
      ],
      [],
      [
        {
          id: 'box-1',
          type: 'enhancedBoundingBox',
          position: { x: 50, y: 60 },
          width: 400,
          height: 260,
          data: { title: 'Imported Wrapper' }
        },
        {
          id: 'draft-a',
          type: 'textBlock',
          position: { x: 90, y: 120 },
          parentNode: 'box-1',
          data: { label: 'Draft A' }
        }
      ],
      [],
      888,
      {
        container: {
          id: 'region-1',
          type: 'enhancedBoundingBox',
          position: { x: 300, y: 120 }
        }
      }
    );

    expect(result.nodes[1]).toMatchObject({
      id: 'bootstrap-888-1-box-1',
      parentNode: 'region-1',
      position: { x: 40, y: 60 },
      selected: true
    });
    expect(result.nodes[2]).toMatchObject({
      id: 'bootstrap-888-2-draft-a',
      parentNode: 'bootstrap-888-1-box-1',
      position: { x: 80, y: 120 }
    });
  });

  it('replaces an existing bootstrap group in place instead of appending a second copy', () => {
    const currentNodes: Node[] = [
      {
        id: 'existing-1',
        type: 'textBlock',
        position: { x: 40, y: 40 },
        data: { label: 'Existing' }
      },
      {
        id: 'old-box',
        type: 'enhancedBoundingBox',
        position: { x: 500, y: 100 },
        data: {
          bootstrapInserted: true,
          bootstrapGroupId: 'bootstrap-group-old',
          title: 'Old Bootstrap'
        }
      },
      {
        id: 'old-node',
        type: 'textBlock',
        parentNode: 'old-box',
        position: { x: 32, y: 68 },
        data: {
          bootstrapInserted: true,
          bootstrapGroupId: 'bootstrap-group-old',
          label: 'Old Node'
        }
      }
    ];
    const currentEdges: Edge[] = [
      {
        id: 'old-edge',
        source: 'old-node',
        target: 'old-node',
        data: {
          bootstrapInserted: true,
          bootstrapGroupId: 'bootstrap-group-old'
        }
      }
    ];

    const result = replaceBootstrapGroupInGraph(
      currentNodes,
      currentEdges,
      [
        {
          id: 'draft-a',
          type: 'textBlock',
          position: { x: 50, y: 60 },
          data: { label: 'Draft A' }
        },
        {
          id: 'draft-b',
          type: 'output',
          position: { x: 130, y: 120 },
          data: { label: 'Draft B' }
        }
      ],
      [
        {
          id: 'draft-edge-1',
          source: 'draft-a',
          target: 'draft-b'
        }
      ],
      'bootstrap-group-old',
      991
    );

    expect(result.nodes).toHaveLength(4);
    expect(result.nodes.find(node => node.id === 'existing-1')).toBeTruthy();
    expect(result.nodes.find(node => node.id === 'old-box')).toBeUndefined();
    expect(result.nodes.find(node => node.id === 'old-node')).toBeUndefined();
    expect(result.nodes.find(node => node.id === 'bootstrap-box-991')).toMatchObject({
      position: { x: 468, y: 32 },
      selected: true
    });
    expect(result.edges).toEqual([
      expect.objectContaining({
        id: 'bootstrap-edge-991-1-draft-edge-1',
        selected: true
      })
    ]);
  });

  it('replaces a bootstrap group inside the same parent region container', () => {
    const result = replaceBootstrapGroupInGraph(
      [
        {
          id: 'region-1',
          type: 'enhancedBoundingBox',
          position: { x: 200, y: 100 },
          data: { title: 'Region' }
        },
        {
          id: 'old-box',
          type: 'enhancedBoundingBox',
          parentNode: 'region-1',
          position: { x: 20, y: 40 },
          data: {
            bootstrapInserted: true,
            bootstrapGroupId: 'bootstrap-group-old'
          }
        },
        {
          id: 'old-node',
          type: 'textBlock',
          parentNode: 'old-box',
          position: { x: 32, y: 68 },
          data: {
            bootstrapInserted: true,
            bootstrapGroupId: 'bootstrap-group-old'
          }
        }
      ],
      [],
      [
        {
          id: 'draft-a',
          type: 'textBlock',
          position: { x: 20, y: 20 },
          data: { label: 'Draft A' }
        },
        {
          id: 'draft-b',
          type: 'output',
          position: { x: 120, y: 80 },
          data: { label: 'Draft B' }
        }
      ],
      [],
      'bootstrap-group-old',
      992
    );

    expect(result.nodes.find(node => node.id === 'bootstrap-box-992')).toMatchObject({
      parentNode: 'region-1',
      selected: true
    });
    expect(result.nodes.find(node => node.id === 'bootstrap-992-1-draft-a')).toMatchObject({
      parentNode: 'bootstrap-box-992',
      selected: true
    });
    expect(result.nodes.find(node => node.id === 'old-box')).toBeUndefined();
  });

  it('reattaches incoming and outgoing graph edges when replacing a bootstrap group', () => {
    const result = replaceBootstrapGroupInGraph(
      [
        {
          id: 'upstream',
          type: 'textBlock',
          position: { x: 40, y: 120 },
          data: { label: 'Upstream' }
        },
        {
          id: 'downstream',
          type: 'output',
          position: { x: 980, y: 120 },
          data: { label: 'Downstream' }
        },
        {
          id: 'old-box',
          type: 'enhancedBoundingBox',
          position: { x: 400, y: 60 },
          data: {
            bootstrapInserted: true,
            bootstrapGroupId: 'bootstrap-group-old'
          }
        },
        {
          id: 'old-entry',
          type: 'textBlock',
          parentNode: 'old-box',
          position: { x: 32, y: 68 },
          data: {
            bootstrapInserted: true,
            bootstrapGroupId: 'bootstrap-group-old'
          }
        },
        {
          id: 'old-exit',
          type: 'output',
          parentNode: 'old-box',
          position: { x: 220, y: 68 },
          data: {
            bootstrapInserted: true,
            bootstrapGroupId: 'bootstrap-group-old'
          }
        }
      ],
      [
        {
          id: 'incoming-old',
          source: 'upstream',
          target: 'old-entry',
          sourceHandle: 'source',
          targetHandle: 'target'
        },
        {
          id: 'outgoing-old',
          source: 'old-exit',
          target: 'downstream',
          sourceHandle: 'source'
        }
      ],
      [
        {
          id: 'draft-entry',
          type: 'textBlock',
          position: { x: 10, y: 20 },
          data: { label: 'Draft Entry' }
        },
        {
          id: 'draft-exit',
          type: 'output',
          position: { x: 210, y: 20 },
          data: { label: 'Draft Exit' }
        }
      ],
      [
        {
          id: 'draft-link',
          source: 'draft-entry',
          target: 'draft-exit'
        }
      ],
      'bootstrap-group-old',
      993
    );

    expect(result.edges).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'bootstrap-reattach-in-993-1-incoming-old',
          source: 'upstream',
          target: 'bootstrap-993-1-draft-entry',
          sourceHandle: 'source',
          targetHandle: 'target',
          selected: true
        }),
        expect.objectContaining({
          id: 'bootstrap-reattach-out-993-2-outgoing-old',
          source: 'bootstrap-993-2-draft-exit',
          target: 'downstream',
          sourceHandle: 'source',
          selected: true
        })
      ])
    );
  });
});
