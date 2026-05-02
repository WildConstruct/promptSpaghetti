import type { Edge, Node } from 'reactflow';
import { deriveLocalSandboxRequestFromGraph } from '../localSandboxPromptDerivation';

describe('deriveLocalSandboxRequestFromGraph', () => {
  it('derives the canonical tree sandbox request from a family graph', () => {
    const nodes: Node[] = [
      {
        id: 'tree-dna',
        type: 'textBlock',
        position: { x: 80, y: 120 },
        data: {
          nodeType: 'textBlock',
          label: 'Tree DNA',
          value:
            'oak tree archetype, shared trunk DNA, documentary still, natural light'
        }
      },
      {
        id: 'tree-silhouette',
        type: 'weightedChoice',
        position: { x: 420, y: 40 },
        data: {
          nodeType: 'weightedChoice',
          label: 'Silhouette Variation',
          options: [
            {
              id: 'silhouette-1',
              text: 'broad rounded canopy with asymmetrical reach',
              weight: 40
            },
            {
              id: 'silhouette-2',
              text: 'taller narrow silhouette with wind-shaped crown',
              weight: 35
            }
          ]
        }
      },
      {
        id: 'tree-detail',
        type: 'weightedChoice',
        position: { x: 420, y: 250 },
        data: {
          nodeType: 'weightedChoice',
          label: 'Surface Detail',
          options: [
            {
              id: 'detail-1',
              text: 'deep bark ridges and moss pockets',
              weight: 40
            },
            {
              id: 'detail-2',
              text: 'sunlit spring leaves with lighter tips',
              weight: 35
            }
          ]
        }
      },
      {
        id: 'tree-join',
        type: 'concat',
        position: { x: 820, y: 145 },
        data: {
          nodeType: 'concat',
          label: 'Resolve Tree Prompt',
          separator: ', ',
          value: ', '
        }
      },
      {
        id: 'tree-output',
        type: 'output',
        position: { x: 1100, y: 145 },
        data: {
          nodeType: 'output',
          label: 'Output',
          value: '{prompt}'
        }
      }
    ];
    const edges: Edge[] = [
      {
        id: 'tree-e1',
        source: 'tree-dna',
        target: 'tree-join',
        targetHandle: 'input1'
      },
      {
        id: 'tree-e2',
        source: 'tree-silhouette',
        target: 'tree-join',
        targetHandle: 'input2'
      },
      {
        id: 'tree-e3',
        source: 'tree-detail',
        target: 'tree-output'
      },
      {
        id: 'tree-e4',
        source: 'tree-join',
        target: 'tree-output'
      }
    ];

    const result = deriveLocalSandboxRequestFromGraph({ nodes, edges });

    expect(result.status).toBe('ready');
    expect(result.isCanonicalTreeFlow).toBe(true);
    expect(result.count).toBe(20);
    expect(result.startSeed).toBe(1200);
    expect(result.labelPrefix).toBe('tree-family-demo');
    expect(result.prompt).toContain('oak tree archetype');
    expect(result.prompt).toContain('bounded silhouette');
    expect(result.variationSummaries).toEqual([
      expect.stringContaining('silhouette'),
      expect.stringContaining('surface detail')
    ]);
  });

  it('falls back cleanly when the graph does not expose prompt DNA', () => {
    const result = deriveLocalSandboxRequestFromGraph({
      nodes: [],
      edges: []
    });

    expect(result.status).toBe('manual');
    expect(result.basePrompt).toBeNull();
    expect(result.missingReasons).toContain(
      'No active graph nodes are available yet.'
    );
    expect(result.prompt).toContain('oak tree archetype');
  });
});
