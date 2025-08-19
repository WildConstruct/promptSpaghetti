import { convertPSGToPSGLib, parsePSG } from '../psg';

describe('PSG Fragment Handling', () => {
  describe('Fragment Container Creation', () => {
    it('should create FragmentContainer instead of enhancedBoundingBox for fragments', () => {
      const psgContent = {
        version: '1.0.0',
        name: 'Test Fragment',
        description: 'A test fragment',
        metadata: {
          type: 'ASSET_FRAGMENT',
          source: 'test.psg',
        },
        nodes: [
          { id: 'node1', type: 'WeightedChoice', x: 100, y: 100 },
          { id: 'node2', type: 'Concat', x: 200, y: 100 },
        ],
        edges: [],
        regions: [
          {
            id: 'region1',
            name: 'Test Region',
            nodes: ['node1', 'node2'],
          },
        ],
      };

      const result = convertPSGToPSGLib(psgContent);

      // Should have a fragment container as the first node
      expect(result.nodes).toHaveLength(3); // Container + 2 nodes
      expect(result.nodes[0].type).toBe('fragmentContainer');
      expect(result.nodes[0].id).toMatch(/^fragment-/);
      expect(result.nodes[0].data.title).toBe('Test Region');
      expect(result.nodes[0].data.isCollapsed).toBe(true);
      expect(result.nodes[0].data.nodeCount).toBe(2);
    });

    it('should NOT create enhancedBoundingBox for fragments', () => {
      const psgContent = {
        version: '1.0.0',
        name: 'Test Fragment',
        metadata: {
          type: 'MULTI-ASPECT',
        },
        nodes: [
          { id: 'node1', type: 'TextBlock', x: 100, y: 100 },
        ],
        edges: [],
        regions: [],
      };

      const result = convertPSGToPSGLib(psgContent);

      // Should not have any enhancedBoundingBox nodes
      const boundingBoxes = result.nodes.filter((n: any) => n.type === 'enhancedBoundingBox');
      expect(boundingBoxes).toHaveLength(0);

      // Should have a fragment container
      const fragmentContainers = result.nodes.filter((n: any) => n.type === 'fragmentContainer');
      expect(fragmentContainers).toHaveLength(1);
    });
  });

  describe('Output Node Filtering', () => {
    it('should filter out Output nodes from fragments', () => {
      const psgContent = {
        version: '1.0.0',
        name: 'Fragment with Output',
        metadata: {
          type: 'ASSET_FRAGMENT',
        },
        nodes: [
          { id: 'node1', type: 'WeightedChoice', x: 100, y: 100 },
          { id: 'output1', type: 'Output', x: 200, y: 100 },
          { id: 'node2', type: 'Concat', x: 300, y: 100 },
        ],
        edges: [],
      };

      const result = convertPSGToPSGLib(psgContent);

      // Should only have container + 2 nodes (Output filtered out)
      expect(result.nodes).toHaveLength(3); // Container + 2 nodes (no Output)
      
      const outputNodes = result.nodes.filter((n: any) => n.type === 'output');
      expect(outputNodes).toHaveLength(0);

      const nodeTypes = result.nodes.map((n: any) => n.type);
      expect(nodeTypes).toContain('fragmentContainer');
      expect(nodeTypes).toContain('weightedChoice');
      expect(nodeTypes).toContain('concat');
      expect(nodeTypes).not.toContain('output');
    });

    it('should NOT filter Output nodes from non-fragments', () => {
      const psgContent = {
        version: '1.0.0',
        name: 'Regular Graph',
        nodes: [
          { id: 'node1', type: 'WeightedChoice', x: 100, y: 100 },
          { id: 'output1', type: 'Output', x: 200, y: 100 },
        ],
        edges: [],
      };

      const result = convertPSGToPSGLib(psgContent);

      // Should have both nodes (no filtering for non-fragments)
      expect(result.nodes).toHaveLength(2);
      
      const outputNodes = result.nodes.filter((n: any) => n.type === 'output');
      expect(outputNodes).toHaveLength(1);
    });
  });

  describe('Parent-Child Relationships', () => {
    it('should set parentNode for all fragment nodes', () => {
      const psgContent = {
        version: '1.0.0',
        name: 'Fragment Test',
        metadata: {
          type: 'ASSET_FRAGMENT',
        },
        nodes: [
          { id: 'node1', type: 'WeightedChoice', x: 100, y: 100 },
          { id: 'node2', type: 'Concat', x: 200, y: 150 },
        ],
        edges: [],
      };

      const result = convertPSGToPSGLib(psgContent);

      const container = result.nodes.find((n: any) => n.type === 'fragmentContainer');
      const childNodes = result.nodes.filter((n: any) => n.type !== 'fragmentContainer');

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
          type: 'ASSET_FRAGMENT',
        },
        nodes: [
          { id: 'node1', type: 'WeightedChoice', x: 100, y: 100 },
          { id: 'node2', type: 'Concat', x: 200, y: 150 },
        ],
        edges: [],
      };

      const result = convertPSGToPSGLib(psgContent);

      const childNodes = result.nodes.filter((n: any) => n.type !== 'fragmentContainer');

      // Positions should be relative to the container
      childNodes.forEach((node: any) => {
        expect(node.position.x).toBeLessThan(200); // Relative position
        expect(node.position.y).toBeLessThan(200); // Relative position
      });
    });
  });

  describe('Fragment Detection', () => {
    it('should detect MULTI-ASPECT as fragment', () => {
      const psgContent = {
        version: '1.0.0',
        name: 'Multi-Aspect Fragment',
        metadata: {
          type: 'MULTI-ASPECT',
        },
        nodes: [
          { id: 'node1', type: 'TextBlock', x: 100, y: 100 },
        ],
        edges: [],
      };

      const result = convertPSGToPSGLib(psgContent);
      const container = result.nodes.find((n: any) => n.type === 'fragmentContainer');
      expect(container).toBeDefined();
    });

    it('should detect ASSET_FRAGMENT as fragment', () => {
      const psgContent = {
        version: '1.0.0',
        name: 'Asset Fragment',
        metadata: {
          type: 'ASSET_FRAGMENT',
        },
        nodes: [
          { id: 'node1', type: 'TextBlock', x: 100, y: 100 },
        ],
        edges: [],
      };

      const result = convertPSGToPSGLib(psgContent);
      const container = result.nodes.find((n: any) => n.type === 'fragmentContainer');
      expect(container).toBeDefined();
    });

    it('should detect regions as fragment indicator', () => {
      const psgContent = {
        version: '1.0.0',
        name: 'Region Fragment',
        nodes: [
          { id: 'node1', type: 'TextBlock', x: 100, y: 100 },
        ],
        edges: [],
        regions: [
          {
            id: 'region1',
            name: 'Test Region',
            nodes: ['node1'],
          },
        ],
      };

      const result = convertPSGToPSGLib(psgContent);
      const container = result.nodes.find((n: any) => n.type === 'fragmentContainer');
      expect(container).toBeDefined();
    });

    it('should NOT create container for non-fragments', () => {
      const psgContent = {
        version: '1.0.0',
        name: 'Regular Graph',
        nodes: [
          { id: 'node1', type: 'TextBlock', x: 100, y: 100 },
        ],
        edges: [],
      };

      const result = convertPSGToPSGLib(psgContent);
      const container = result.nodes.find((n: any) => n.type === 'fragmentContainer');
      expect(container).toBeUndefined();
    });
  });

  describe('Fragment Container Properties', () => {
    it('should set correct title from region or name', () => {
      const psgWithRegion = {
        version: '1.0.0',
        name: 'Fragment Name',
        metadata: { type: 'ASSET_FRAGMENT' },
        nodes: [{ id: 'node1', type: 'TextBlock', x: 100, y: 100 }],
        edges: [],
        regions: [{ id: 'r1', name: 'Region Name', nodes: ['node1'] }],
      };

      const result1 = convertPSGToPSGLib(psgWithRegion);
      const container1 = result1.nodes.find((n: any) => n.type === 'fragmentContainer');
      expect(container1.data.title).toBe('Region Name'); // Prefer region name

      const psgWithoutRegion = {
        version: '1.0.0',
        name: 'Fragment Name',
        metadata: { type: 'ASSET_FRAGMENT' },
        nodes: [{ id: 'node1', type: 'TextBlock', x: 100, y: 100 }],
        edges: [],
      };

      const result2 = convertPSGToPSGLib(psgWithoutRegion);
      const container2 = result2.nodes.find((n: any) => n.type === 'fragmentContainer');
      expect(container2.data.title).toBe('Fragment Name'); // Fall back to PSG name
    });

    it('should set fragment source from metadata', () => {
      const psgContent = {
        version: '1.0.0',
        name: 'Test Fragment',
        metadata: {
          type: 'ASSET_FRAGMENT',
          source: 'components/character.psg',
        },
        nodes: [{ id: 'node1', type: 'TextBlock', x: 100, y: 100 }],
        edges: [],
      };

      const result = convertPSGToPSGLib(psgContent);
      const container = result.nodes.find((n: any) => n.type === 'fragmentContainer');
      expect(container.data.fragmentSource).toBe('components/character.psg');
    });

    it('should start fragments collapsed', () => {
      const psgContent = {
        version: '1.0.0',
        name: 'Test Fragment',
        metadata: { type: 'ASSET_FRAGMENT' },
        nodes: [{ id: 'node1', type: 'TextBlock', x: 100, y: 100 }],
        edges: [],
      };

      const result = convertPSGToPSGLib(psgContent);
      const container = result.nodes.find((n: any) => n.type === 'fragmentContainer');
      expect(container.data.isCollapsed).toBe(true);
    });
  });
});