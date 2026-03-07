import { insertPreset, validatePreset } from '../presetInsertion';

describe('presetInsertion', () => {
  it('preserves all three edges for the Character Name Generator PSGLib shape', async () => {
    const preset = {
      fileType: 'psglib',
      formatVersion: '1.0.0',
      metadata: {
        id: 'preset-character-name-basic-1736536800000',
        name: 'Character Name Generator',
        description:
          'Generates diverse character names with first and last name combinations',
        author: 'PromptScape Team',
        version: '1.0.0',
        tags: ['character', 'names', 'basic', 'rpg'],
        nodeTypes: ['WeightedChoice', 'Concat', 'Output'],
        lastModified: '2025-01-10T20:00:00.000Z',
        license: 'MIT',
        usageStats: {
          timesUsed: 0,
          lastUsed: null,
          popularity: 0
        }
      },
      graph: {
        nodes: [
          {
            id: 'first-name-1736536800000',
            type: 'WeightedChoice',
            position: { x: 100, y: 100 },
            data: {
              choices: [
                { text: 'Aria', weight: 1 },
                { text: 'Marcus', weight: 1 }
              ]
            },
            label: 'First Name'
          },
          {
            id: 'last-name-1736536800000',
            type: 'WeightedChoice',
            position: { x: 100, y: 250 },
            data: {
              choices: [
                { text: 'Blackwood', weight: 1 },
                { text: 'Silverstone', weight: 1 }
              ]
            },
            label: 'Last Name'
          },
          {
            id: 'concat-1736536800000',
            type: 'Concat',
            position: { x: 350, y: 175 },
            data: {
              separator: ' '
            },
            label: 'Full Name'
          },
          {
            id: 'output-1736536800000',
            type: 'Output',
            position: { x: 550, y: 175 },
            data: {
              template: '{fullName}'
            },
            label: 'Character Name'
          }
        ],
        edges: [
          {
            id: 'edge-1736536800000-1',
            source: 'first-name-1736536800000',
            target: 'concat-1736536800000',
            sourceHandle: 'output',
            targetHandle: 'input0'
          },
          {
            id: 'edge-1736536800000-2',
            source: 'last-name-1736536800000',
            target: 'concat-1736536800000',
            sourceHandle: 'output',
            targetHandle: 'input1'
          },
          {
            id: 'edge-1736536800000-3',
            source: 'concat-1736536800000',
            target: 'output-1736536800000',
            sourceHandle: 'output',
            targetHandle: 'fullName'
          }
        ],
        settings: {}
      }
    };

    const result = await insertPreset(JSON.stringify(preset), {
      position: { x: 100, y: 100 },
      preservePositions: true,
      snapToGrid: false,
      selectAfterInsert: false
    });

    expect(result.edges).toHaveLength(3);

    const concatNode = result.nodes.find(node => node.type === 'concat');
    const outputNode = result.nodes.find(node => node.type === 'output');

    expect(concatNode).toBeDefined();
    expect(outputNode).toBeDefined();

    const concatToOutputEdge = result.edges.find(
      edge => edge.source === concatNode.id && edge.target === outputNode.id
    );

    expect(concatToOutputEdge).toBeDefined();
    expect(concatToOutputEdge.sourceHandle).toBe('source');
    expect(concatToOutputEdge.targetHandle).toBeUndefined();

    const incomingConcatEdges = result.edges.filter(
      edge => edge.target === concatNode.id
    );
    expect(incomingConcatEdges).toHaveLength(2);
    expect(incomingConcatEdges.map(edge => edge.targetHandle).sort()).toEqual([
      'input1',
      'input2'
    ]);
    expect(incomingConcatEdges.map(edge => edge.sourceHandle)).toEqual([
      'source',
      'source'
    ]);
  });

  it('normalizes raw PSG WeightedChoice targets from input to target for Multi-Aspect Eye System style fragments', async () => {
    const fragment = {
      version: '1.0.0',
      name: 'Multi-Aspect Eye Description System',
      description:
        'Comprehensive eye descriptor system with shape, color/features, and positioning aspects',
      metadata: {
        created: '2025-01-15',
        author: 'Aspen',
        category: 'facial-features',
        type: 'MULTI-ASPECT',
        tags: [
          'eyes',
          'facial-features',
          'descriptors',
          'multi-aspect',
          'modular'
        ],
        collapsible: true
      },
      nodes: [
        {
          id: 'eye-shape',
          type: 'WeightedChoice',
          name: 'Eye Shape',
          x: 100,
          y: 100,
          options: [{ text: 'almond-shaped', weight: 12 }]
        },
        {
          id: 'eye-color-feature',
          type: 'WeightedChoice',
          name: 'Eye Color/Features',
          x: 100,
          y: 250,
          options: [{ text: 'heterochromatic', weight: 5 }]
        },
        {
          id: 'eye-size-position',
          type: 'WeightedChoice',
          name: 'Eye Size/Position',
          x: 100,
          y: 400,
          options: [{ text: 'wide-set', weight: 15 }]
        }
      ],
      edges: [
        {
          id: 'edge-shape-to-color',
          source: 'eye-shape',
          target: 'eye-color-feature',
          sourceHandle: 'source',
          targetHandle: 'input'
        },
        {
          id: 'edge-color-to-position',
          source: 'eye-color-feature',
          target: 'eye-size-position',
          sourceHandle: 'source',
          targetHandle: 'input'
        }
      ],
      regions: [
        {
          id: 'eye-descriptor-system',
          name: 'Eye Descriptor Asset Fragment',
          nodes: ['eye-shape', 'eye-color-feature', 'eye-size-position']
        }
      ]
    };

    const result = await insertPreset(JSON.stringify(fragment), {
      position: { x: 100, y: 100 },
      preservePositions: true,
      snapToGrid: false,
      selectAfterInsert: false
    });

    expect(result.edges).toHaveLength(2);

    const weightedChoiceNodes = result.nodes.filter(
      node => node.type === 'weightedChoice'
    );
    expect(weightedChoiceNodes).toHaveLength(3);

    const incomingWeightedEdges = result.edges.filter(edge => {
      const targetNode = result.nodes.find(node => node.id === edge.target);
      return targetNode?.type === 'weightedChoice';
    });

    expect(incomingWeightedEdges).toHaveLength(2);
    expect(incomingWeightedEdges.map(edge => edge.targetHandle)).toEqual([
      'target',
      'target'
    ]);
    expect(incomingWeightedEdges.map(edge => edge.sourceHandle)).toEqual([
      'source',
      'source'
    ]);
  });

  it('preserves canonical PSG fragment edge handles through the canonical-first insertion path', async () => {
    const fragment = {
      version: '1.0.0',
      name: 'Canonical Handle Fragment',
      description: 'Canonical fragment with library-shaped edge handles',
      metadata: {
        category: 'test-fragments',
        type: 'ASSET_FRAGMENT'
      },
      nodes: [
        {
          id: 'choice-1',
          type: 'WeightedChoice',
          name: 'Choice 1',
          x: 100,
          y: 100,
          options: [{ text: 'A', weight: 1 }]
        },
        {
          id: 'choice-2',
          type: 'WeightedChoice',
          name: 'Choice 2',
          x: 100,
          y: 260,
          options: [{ text: 'B', weight: 1 }]
        },
        {
          id: 'concat-1',
          type: 'Concat',
          name: 'Concat',
          x: 360,
          y: 180
        },
        {
          id: 'output-1',
          type: 'Output',
          name: 'Output',
          x: 620,
          y: 180,
          template: '{value}'
        }
      ],
      edges: [
        {
          id: 'edge-choice-1',
          source: 'choice-1',
          target: 'concat-1',
          sourceHandle: 'source',
          targetHandle: 'input1'
        },
        {
          id: 'edge-choice-2',
          source: 'choice-2',
          target: 'concat-1',
          sourceHandle: 'source',
          targetHandle: 'input2'
        },
        {
          id: 'edge-concat-output',
          source: 'concat-1',
          target: 'output-1',
          sourceHandle: 'source'
        }
      ],
      regions: [
        {
          id: 'canonical-fragment',
          name: 'Canonical Fragment',
          nodes: ['choice-1', 'choice-2', 'concat-1', 'output-1']
        }
      ]
    };

    const result = await insertPreset(JSON.stringify(fragment), {
      position: { x: 100, y: 100 },
      preservePositions: true,
      snapToGrid: false,
      selectAfterInsert: false
    });

    expect(result.edges).toHaveLength(3);

    const concatNode = result.nodes.find(node => node.type === 'concat');
    const outputNode = result.nodes.find(node => node.type === 'output');

    expect(concatNode).toBeDefined();
    expect(outputNode).toBeDefined();

    const incomingConcatEdges = result.edges
      .filter(edge => edge.target === concatNode?.id)
      .sort((a, b) => a.id.localeCompare(b.id));

    expect(incomingConcatEdges).toEqual([
      expect.objectContaining({
        id: expect.any(String),
        sourceHandle: 'source',
        targetHandle: 'input1'
      }),
      expect.objectContaining({
        id: expect.any(String),
        sourceHandle: 'source',
        targetHandle: 'input2'
      })
    ]);

    expect(
      result.edges.find(
        edge => edge.source === concatNode?.id && edge.target === outputNode?.id
      )
    ).toEqual(
      expect.objectContaining({
        sourceHandle: 'source',
        targetHandle: undefined
      })
    );
  });

  it('validates repaired asset-library PSG fragments through the canonical-first path', () => {
    const fragment = {
      version: '1.0.0',
      name: 'Architectural Styles',
      description: 'Weighted architectural style fragment',
      metadata: {
        category: 'setting-environment',
        collapsible: true
      },
      nodes: [
        {
          id: 'architectural-style',
          type: 'WeightedChoice',
          x: 120,
          y: 100,
          options: [
            { text: 'brutalist concrete', weight: 1, id: 'opt-1' },
            { text: 'ornate art deco', weight: 1, id: 'opt-2' }
          ],
          data: {
            label: 'Architectural Style'
          }
        }
      ],
      edges: [],
      regions: [
        {
          id: 'architecture-fragment',
          name: 'Architecture Fragment',
          nodes: ['architectural-style'],
          metadata: {
            collapsible: true
          }
        }
      ]
    };

    const result = validatePreset(JSON.stringify(fragment), {
      preferCanonicalPsg: true
    });

    expect(result).toEqual({
      valid: true,
      nodeCount: 2,
      edgeCount: 0
    });
  });
});
