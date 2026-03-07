import { repairPsgContent } from '../psgRepair';

describe('repairPsgContent', () => {
  it('rewrites a legacy-compatible fragment toward the weekend MVP contract', () => {
    const input = JSON.stringify({
      metadata: {
        name: 'Legacy Example',
        title: 'Legacy Title',
        type: 'ASSET_FRAGMENT'
      },
      type: 'asset-fragment',
      nodes: [
        {
          id: 'choice-1',
          type: 'weightedChoice',
          position: { x: 40, y: 80 },
          data: {
            options: [
              { text: 'alpha', weight: 2 },
              { text: 'beta', weight: 1 }
            ],
            nodeType: 'weightedChoice'
          }
        },
        {
          id: 'text-1',
          type: 'textBlock',
          position: { x: 260, y: 80 },
          data: {
            text: 'supporting detail',
            fragmentImported: true
          }
        },
        {
          id: 'join-1',
          type: 'concat',
          x: 520,
          y: 80,
          data: {
            separator: ', '
          }
        },
        {
          id: 'output-1',
          type: 'output',
          x: 760,
          y: 80,
          data: {
            value: '{{input}}'
          }
        }
      ],
      edges: [
        {
          id: 'edge-1',
          source: 'choice-1',
          target: 'join-1',
          sourceHandle: 'output',
          targetHandle: 'input'
        },
        {
          id: 'edge-2',
          source: 'text-1',
          target: 'join-1'
        },
        {
          id: 'edge-3',
          source: 'join-1',
          target: 'output-1',
          sourceHandle: 'source',
          targetHandle: 'input'
        }
      ],
      region: {
        id: 'legacy-region',
        type: 'region',
        x: 0,
        y: 0,
        width: 900,
        height: 240,
        data: {
          label: 'Legacy Region',
          color: '#22d3ee',
          description: 'legacy region wrapper example',
          collapsed: false
        },
        nodes: ['choice-1', 'text-1', 'join-1', 'output-1']
      }
    });

    const result = repairPsgContent(input);

    expect(result.status).toBe('rewritten');
    expect(result.changes).toEqual(
      expect.arrayContaining([
        'added top-level name from metadata fallback',
        'normalized region -> regions',
        'normalized node types',
        'normalized node positions to top-level x/y',
        'hoisted data.options to options',
        'hoisted TextBlock text to top-level value',
        'normalized Output payloads to top-level template',
        'normalized Concat payloads to top-level value',
        'normalized concat target handles',
        'removed stale handle ids',
        'normalized region fields to semantic shape'
      ])
    );

    expect(result.normalizedData).toMatchObject({
      version: '1.0.0',
      name: 'Legacy Example',
      nodes: [
        expect.objectContaining({
          id: 'choice-1',
          type: 'WeightedChoice',
          x: 40,
          y: 80,
          options: [
            expect.objectContaining({ text: 'alpha', weight: 2 }),
            expect.objectContaining({ text: 'beta', weight: 1 })
          ]
        }),
        expect.objectContaining({
          id: 'text-1',
          type: 'TextBlock',
          value: 'supporting detail'
        }),
        expect.objectContaining({
          id: 'join-1',
          type: 'Concat',
          value: ', '
        }),
        expect.objectContaining({
          id: 'output-1',
          type: 'Output',
          template: '{{input}}'
        })
      ],
      edges: [
        expect.objectContaining({
          id: 'edge-1',
          source: 'choice-1',
          target: 'join-1',
          targetHandle: 'input1'
        }),
        expect.objectContaining({
          id: 'edge-2',
          source: 'text-1',
          target: 'join-1',
          targetHandle: 'input2'
        }),
        expect.objectContaining({
          id: 'edge-3',
          source: 'join-1',
          target: 'output-1'
        })
      ],
      regions: [
        expect.objectContaining({
          id: 'legacy-region',
          name: 'Legacy Region',
          color: '#22d3ee',
          description: 'legacy region wrapper example',
          nodes: ['choice-1', 'text-1', 'join-1', 'output-1']
        })
      ]
    });

    expect(result.normalizedData?.nodes[0].position).toBeUndefined();
    expect(result.normalizedData?.nodes[1].data).toBeUndefined();
    expect(result.normalizedData?.edges?.[2].targetHandle).toBeUndefined();
  });

  it('marks wrapper-node fragments as unsafe instead of rewriting them', () => {
    const input = JSON.stringify({
      version: '1.0.0',
      name: 'Wrapper Source',
      nodes: [
        {
          id: 'wrapper-1',
          type: 'enhancedBoundingBox',
          data: { title: 'Wrapper' },
          x: 0,
          y: 0
        },
        {
          id: 'child-1',
          type: 'WeightedChoice',
          x: 100,
          y: 100,
          options: [{ text: 'alpha', weight: 1 }]
        }
      ],
      edges: []
    });

    const result = repairPsgContent(input);

    expect(result.status).toBe('unsafe');
    expect(result.reasons).toEqual([
      'node wrapper-1 uses editor wrapper type enhancedBoundingBox'
    ]);
  });
});
