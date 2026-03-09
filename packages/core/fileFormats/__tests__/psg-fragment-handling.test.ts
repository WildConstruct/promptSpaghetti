import {
  convertCanonicalPSGToPSGLib,
  convertPSGToPSGLib,
  parseCanonicalPsg,
  parsePSG
} from '../psg';

describe('PSG Fragment Handling', () => {
  describe('Fragment Container Creation', () => {
    it('should create a single enhancedBoundingBox wrapper for fragments', () => {
      const psgContent = {
        version: '1.0.0',
        name: 'Test Fragment',
        description: 'A test fragment',
        metadata: {
          type: 'ASSET_FRAGMENT',
          source: 'test.psg'
        },
        nodes: [
          { id: 'node1', type: 'WeightedChoice', x: 100, y: 100 },
          { id: 'node2', type: 'Concat', x: 200, y: 100 }
        ],
        edges: [],
        regions: [
          {
            id: 'region1',
            name: 'Test Region',
            nodes: ['node1', 'node2']
          }
        ]
      };

      const result = convertPSGToPSGLib(psgContent);

      // Should have an enhanced bounding box wrapper as the first node
      expect(result.graph.nodes).toHaveLength(3); // Container + 2 nodes
      expect(result.graph.nodes[0].type).toBe('enhancedBoundingBox');
      expect(result.graph.nodes[0].id).toMatch(/^fragment-/);
      expect(result.graph.nodes[0].data.title).toBe('Test Region');
      expect(result.graph.nodes[0].data.isCollapsed).toBe(false);
      expect(result.graph.nodes[0].data.nodeCount).toBe(2);
    });

    it('should create exactly one enhancedBoundingBox for fragments', () => {
      const psgContent = {
        version: '1.0.0',
        name: 'Test Fragment',
        metadata: {
          type: 'MULTI-ASPECT'
        },
        nodes: [{ id: 'node1', type: 'TextBlock', x: 100, y: 100 }],
        edges: [],
        regions: []
      };

      const result = convertPSGToPSGLib(psgContent);

      // Should have exactly one wrapper box
      const boundingBoxes = result.graph.nodes.filter(
        (n: any) => n.type === 'enhancedBoundingBox'
      );
      expect(boundingBoxes).toHaveLength(1);
    });
  });

  describe('Output Nodes', () => {
    it('should preserve Output nodes inside fragments', () => {
      const psgContent = {
        version: '1.0.0',
        name: 'Fragment with Output',
        metadata: {
          type: 'ASSET_FRAGMENT'
        },
        nodes: [
          { id: 'node1', type: 'WeightedChoice', x: 100, y: 100 },
          { id: 'output1', type: 'Output', x: 200, y: 100 },
          { id: 'node2', type: 'Concat', x: 300, y: 100 }
        ],
        edges: []
      };

      const result = convertPSGToPSGLib(psgContent);

      expect(result.graph.nodes).toHaveLength(4); // Container + 3 nodes

      const outputNodes = result.graph.nodes.filter((n: any) => n.type === 'output');
      expect(outputNodes).toHaveLength(1);

      const nodeTypes = result.graph.nodes.map((n: any) => n.type);
      expect(nodeTypes).toContain('enhancedBoundingBox');
      expect(nodeTypes).toContain('weightedChoice');
      expect(nodeTypes).toContain('concat');
      expect(nodeTypes).toContain('output');
    });

    it('should NOT filter Output nodes from non-fragments', () => {
      const psgContent = {
        version: '1.0.0',
        name: 'Regular Graph',
        nodes: [
          { id: 'node1', type: 'WeightedChoice', x: 100, y: 100 },
          { id: 'output1', type: 'Output', x: 200, y: 100 }
        ],
        edges: []
      };

      const result = convertPSGToPSGLib(psgContent);

      // Should have both nodes (no filtering for non-fragments)
      expect(result.graph.nodes).toHaveLength(2);

      const outputNodes = result.graph.nodes.filter((n: any) => n.type === 'output');
      expect(outputNodes).toHaveLength(1);
    });

    it('should normalize imported fragment edge handles to valid live node handles', () => {
      const psgContent = {
        version: '1.0.0',
        name: 'Fragment Handle Test',
        metadata: {
          type: 'ASSET_FRAGMENT'
        },
        nodes: [
          {
            id: 'choice1',
            type: 'WeightedChoice',
            x: 100,
            y: 100,
            options: [
              { text: 'Option A', weight: 1 },
              { text: 'Option B', weight: 1 }
            ]
          },
          { id: 'text1', type: 'TextBlock', x: 220, y: 80, value: 'hello' },
          { id: 'text2', type: 'TextBlock', x: 220, y: 220, value: 'branch' },
          { id: 'concat1', type: 'Concat', x: 340, y: 100 },
          { id: 'output1', type: 'Output', x: 460, y: 100 }
        ],
        edges: [
          {
            id: 'edge-choice-main',
            source: 'choice1',
            target: 'concat1',
            sourceHandle: 'output',
            targetHandle: 'target'
          },
          {
            id: 'edge-choice-branch',
            source: 'choice1',
            target: 'text2',
            sourceHandle: 'branch-0'
          },
          {
            id: 'edge-text-concat',
            source: 'text1',
            target: 'concat1'
          },
          {
            id: 'edge-concat-output',
            source: 'concat1',
            target: 'output1',
            sourceHandle: 'output',
            targetHandle: 'target'
          }
        ]
      };

      const result = convertPSGToPSGLib(psgContent);
      const findEdge = (id: string) =>
        result.graph.edges.find((edge: any) => edge.id === id);

      expect(findEdge('edge-choice-main')).toMatchObject({
        sourceHandle: 'main',
        targetHandle: 'input1'
      });
      expect(findEdge('edge-choice-branch')).toMatchObject({
        sourceHandle: 'branch-0',
        targetHandle: 'target'
      });
      expect(findEdge('edge-text-concat')?.sourceHandle).toBe('source');
      expect(findEdge('edge-choice-main')?.targetHandle).toBe('input1');
      expect(findEdge('edge-choice-branch')?.targetHandle).toBe('target');
      expect(findEdge('edge-text-concat')).toMatchObject({
        sourceHandle: 'source',
        targetHandle: 'input2'
      });
      expect(findEdge('edge-concat-output')?.sourceHandle).toBe('source');
      expect(findEdge('edge-concat-output')?.targetHandle).toBeUndefined();
    });

    it('should preserve canonical fragment edge handles through the canonical converter', () => {
      const rawContent = JSON.stringify({
        version: '1.0.0',
        name: 'Canonical Edge Fragment',
        metadata: {
          type: 'ASSET_FRAGMENT'
        },
        nodes: [
          {
            id: 'choice1',
            type: 'WeightedChoice',
            x: 100,
            y: 100,
            options: [{ text: 'Option A', weight: 1 }]
          },
          {
            id: 'choice2',
            type: 'WeightedChoice',
            x: 100,
            y: 240,
            options: [{ text: 'Option B', weight: 1 }]
          },
          { id: 'concat1', type: 'Concat', x: 320, y: 160 },
          { id: 'output1', type: 'Output', x: 520, y: 160, template: '{value}' }
        ],
        edges: [
          {
            id: 'edge-choice-1',
            source: 'choice1',
            target: 'concat1',
            sourceHandle: 'source',
            targetHandle: 'input1'
          },
          {
            id: 'edge-choice-2',
            source: 'choice2',
            target: 'concat1',
            sourceHandle: 'source',
            targetHandle: 'input2'
          },
          {
            id: 'edge-concat-output',
            source: 'concat1',
            target: 'output1',
            sourceHandle: 'source'
          }
        ],
        regions: [
          {
            id: 'region1',
            name: 'Canonical Region',
            nodes: ['choice1', 'choice2', 'concat1', 'output1']
          }
        ]
      });

      const parsed = parseCanonicalPsg(rawContent);
      const result = convertCanonicalPSGToPSGLib(parsed);
      const findEdge = (id: string) =>
        result.graph.edges.find((edge: any) => edge.id === id);

      expect(findEdge('edge-choice-1')).toMatchObject({
        sourceHandle: 'source',
        targetHandle: 'input1'
      });
      expect(findEdge('edge-choice-2')).toMatchObject({
        sourceHandle: 'source',
        targetHandle: 'input2'
      });
      expect(findEdge('edge-concat-output')).toMatchObject({
        sourceHandle: 'source',
        targetHandle: undefined
      });
    });
  });

  describe('Parent-Child Relationships', () => {
    it('should set parentNode for all fragment nodes', () => {
      const psgContent = {
        version: '1.0.0',
        name: 'Fragment Test',
        metadata: {
          type: 'ASSET_FRAGMENT'
        },
        nodes: [
          { id: 'node1', type: 'WeightedChoice', x: 100, y: 100 },
          { id: 'node2', type: 'Concat', x: 200, y: 150 }
        ],
        edges: []
      };

      const result = convertPSGToPSGLib(psgContent);

      const container = result.graph.nodes.find(
        (n: any) => n.type === 'enhancedBoundingBox'
      );
      const childNodes = result.graph.nodes.filter(
        (n: any) => n.type !== 'enhancedBoundingBox'
      );

      // All non-container nodes should have the container as parent
      childNodes.forEach((node: any) => {
        expect(node.parentNode).toBe(container.id);
        expect(node.extent).toBe('parent');
      });
    });

    it('should use relative positioning for fragment children', () => {
      const psgContent = {
        version: '1.0.0',
        name: 'Fragment Position Test',
        metadata: {
          type: 'ASSET_FRAGMENT'
        },
        nodes: [
          { id: 'node1', type: 'WeightedChoice', x: 100, y: 100 },
          { id: 'node2', type: 'Concat', x: 200, y: 150 }
        ],
        edges: []
      };

      const result = convertPSGToPSGLib(psgContent);

      const container = result.graph.nodes.find(
        (n: any) => n.type === 'enhancedBoundingBox'
      );
      const childNodes = result.graph.nodes.filter(
        (n: any) => n.type !== 'enhancedBoundingBox'
      );

      expect(container).toBeDefined();

      // Positions should be relative to the container and remain inside it.
      childNodes.forEach((node: any) => {
        expect(node.parentNode).toBe(container.id);
        expect(node.position.x).toBeGreaterThanOrEqual(0);
        expect(node.position.y).toBeGreaterThanOrEqual(0);
        expect(node.position.x).toBeLessThan(container.data.width);
        expect(node.position.y).toBeLessThan(container.data.height);
      });
    });
  });

  describe('Fragment Detection', () => {
    it('should detect MULTI-ASPECT as fragment', () => {
      const psgContent = {
        version: '1.0.0',
        name: 'Multi-Aspect Fragment',
        metadata: {
          type: 'MULTI-ASPECT'
        },
        nodes: [{ id: 'node1', type: 'TextBlock', x: 100, y: 100 }],
        edges: []
      };

      const result = convertPSGToPSGLib(psgContent);
      const container = result.graph.nodes.find(
        (n: any) => n.type === 'enhancedBoundingBox'
      );
      expect(container).toBeDefined();
    });

    it('should detect ASSET_FRAGMENT as fragment', () => {
      const psgContent = {
        version: '1.0.0',
        name: 'Asset Fragment',
        metadata: {
          type: 'ASSET_FRAGMENT'
        },
        nodes: [{ id: 'node1', type: 'TextBlock', x: 100, y: 100 }],
        edges: []
      };

      const result = convertPSGToPSGLib(psgContent);
      const container = result.graph.nodes.find(
        (n: any) => n.type === 'enhancedBoundingBox'
      );
      expect(container).toBeDefined();
    });

    it('should detect regions as fragment indicator', () => {
      const psgContent = {
        version: '1.0.0',
        name: 'Region Fragment',
        nodes: [{ id: 'node1', type: 'TextBlock', x: 100, y: 100 }],
        edges: [],
        regions: [
          {
            id: 'region1',
            name: 'Test Region',
            nodes: ['node1']
          }
        ]
      };

      const result = convertPSGToPSGLib(psgContent);
      const container = result.graph.nodes.find(
        (n: any) => n.type === 'enhancedBoundingBox'
      );
      expect(container).toBeDefined();
    });

    it('should NOT create container for non-fragments', () => {
      const psgContent = {
        version: '1.0.0',
        name: 'Regular Graph',
        nodes: [{ id: 'node1', type: 'TextBlock', x: 100, y: 100 }],
        edges: []
      };

      const result = convertPSGToPSGLib(psgContent);
      const container = result.graph.nodes.find(
        (n: any) => n.type === 'enhancedBoundingBox'
      );
      expect(container).toBeUndefined();
    });
  });

  describe('Fragment Wrapper Properties', () => {
    it('sizes single-node weighted-choice fragments using data.options', () => {
      const psgContent = {
        version: '1.0.0',
        name: 'Architectural Styles',
        metadata: { type: 'ASSET_FRAGMENT' },
        nodes: [
          {
            id: 'choice1',
            type: 'WeightedChoice',
            data: {
              label: 'Architectural Styles',
              options: [
                { text: 'Option 1', weight: 1 },
                { text: 'Option 2', weight: 1 },
                { text: 'Option 3', weight: 1 },
                { text: 'Option 4', weight: 1 },
                { text: 'Option 5', weight: 1 },
                { text: 'Option 6', weight: 1 },
                { text: 'Option 7', weight: 1 },
                { text: 'Option 8', weight: 1 },
                { text: 'Option 9', weight: 1 },
                { text: 'Option 10', weight: 1 },
                { text: 'Option 11', weight: 1 },
                { text: 'Option 12', weight: 1 }
              ]
            }
          }
        ],
        edges: [],
        groups: [
          {
            id: 'region-architectural-styles',
            label: 'Architectural Styles',
            nodeIds: ['choice1']
          }
        ]
      };

      const parsed = parsePSG(JSON.stringify(psgContent));
      const result = convertPSGToPSGLib(parsed);
      const container = result.graph.nodes.find(
        (n: any) => n.type === 'enhancedBoundingBox'
      );
      const child = result.graph.nodes.find((n: any) => n.id === 'choice1');

      expect(container).toBeDefined();
      expect(container.data.title).toBe('Architectural Styles');
      expect(container.data.nodeCount).toBe(1);
      expect(child).toBeDefined();
      expect(child.parentNode).toMatch(/^fragment-/);
      expect(child.data.options).toHaveLength(12);
    });

    it('should set correct title from region or name', () => {
      const psgWithRegion = {
        version: '1.0.0',
        name: 'Fragment Name',
        metadata: { type: 'ASSET_FRAGMENT' },
        nodes: [{ id: 'node1', type: 'TextBlock', x: 100, y: 100 }],
        edges: [],
        regions: [{ id: 'r1', name: 'Region Name', nodes: ['node1'] }]
      };

      const result1 = convertPSGToPSGLib(psgWithRegion);
      const container1 = result1.graph.nodes.find(
        (n: any) => n.type === 'enhancedBoundingBox'
      );
      expect(container1.data.title).toBe('Region Name');

      const psgWithoutRegion = {
        version: '1.0.0',
        name: 'Fragment Name',
        metadata: { type: 'ASSET_FRAGMENT' },
        nodes: [{ id: 'node1', type: 'TextBlock', x: 100, y: 100 }],
        edges: []
      };

      const result2 = convertPSGToPSGLib(psgWithoutRegion);
      const container2 = result2.graph.nodes.find(
        (n: any) => n.type === 'enhancedBoundingBox'
      );
      expect(container2.data.title).toBe('Fragment Name');
    });

    it('should preserve visible text content for single-node text fragments', () => {
      const psgContent = {
        version: '1.0.0',
        name: 'Architectural Styles',
        metadata: { type: 'ASSET_FRAGMENT' },
        nodes: [
          {
            id: 'text-1',
            type: 'TextBlock',
            x: 100,
            y: 100,
            value: 'Art Deco'
          }
        ],
        edges: [],
        groups: [
          {
            id: 'region-architectural-styles-text',
            label: 'Architectural Styles',
            nodeIds: ['text-1']
          }
        ]
      };

      const parsed = parsePSG(JSON.stringify(psgContent));
      const result = convertPSGToPSGLib(parsed);
      const child = result.graph.nodes.find((n: any) => n.id === 'text-1');
      expect(child.parentNode).toMatch(/^fragment-/);
      expect(child.type).toBe('textBlock');
      expect(child.data.value).toBe('Art Deco');
      expect(child.data.text).toBe('Art Deco');
    });

    it('should fall back to metadata.name when top-level name is missing', () => {
      const rawContent = JSON.stringify({
        version: '1.0.0',
        metadata: {
          type: 'ASSET_FRAGMENT',
          name: 'Metadata Fragment Name'
        },
        nodes: [{ id: 'node1', type: 'TextBlock', x: 100, y: 100 }],
        edges: []
      });

      const parsed = parsePSG(rawContent);
      expect(parsed.name).toBe('Metadata Fragment Name');

      const result = convertPSGToPSGLib(parsed);
      const container = result.graph.nodes.find(
        (n: any) => n.type === 'enhancedBoundingBox'
      );
      expect(container.data.title).toBe('Metadata Fragment Name');
    });

    it('should set fragment source from metadata', () => {
      const psgContent = {
        version: '1.0.0',
        name: 'Test Fragment',
        metadata: {
          type: 'ASSET_FRAGMENT',
          source: 'components/character.psg'
        },
        nodes: [{ id: 'node1', type: 'TextBlock', x: 100, y: 100 }],
        edges: []
      };

      const result = convertPSGToPSGLib(psgContent);
      const container = result.graph.nodes.find(
        (n: any) => n.type === 'enhancedBoundingBox'
      );
      expect(container.data.fragmentSource).toBe('components/character.psg');
    });

    it('should preserve fragment region metadata on the wrapper', () => {
      const psgContent = {
        version: '1.0.0',
        name: 'Test Fragment',
        metadata: { type: 'ASSET_FRAGMENT' },
        nodes: [{ id: 'node1', type: 'TextBlock', x: 100, y: 100 }],
        edges: [],
        regions: [{ id: 'region-1', name: 'Primary', nodes: ['node1'] }]
      };

      const result = convertPSGToPSGLib(psgContent);
      const container = result.graph.nodes.find(
        (n: any) => n.type === 'enhancedBoundingBox'
      );
      expect(container.data.isCollapsed).toBe(false);
      expect(container.data.fragmentImported).toBe(true);
      expect(container.data.fragmentRegions).toHaveLength(1);
    });
  });
});
