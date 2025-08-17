/**
 * Asset Validator Tests
 */

import { validateAsset, formatValidationResult, ValidationErrorCode, ValidationWarningCode } from '../../validation/assetValidator';

describe('AssetValidator', () => {
  describe('PSG Format Validation', () => {
    it('should validate a valid PSG fragment', async () => {
      const validPSG = JSON.stringify({
        version: '1.0.0',
        name: 'Test Fragment',
        description: 'A test fragment',
        metadata: {
          type: 'MULTI-ASPECT',
          author: 'Test Author'
        },
        nodes: [
          {
            id: 'node-1',
            type: 'WeightedChoice',
            name: 'Test Node',
            x: 100,
            y: 200,
            options: [
              { text: 'Option 1', weight: 1 },
              { text: 'Option 2', weight: 2 }
            ]
          }
        ],
        edges: [],
        regions: [
          {
            id: 'region-1',
            name: 'Test Region',
            nodes: ['node-1']
          }
        ]
      });
      
      const result = await validateAsset(validPSG);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.metadata?.format).toBe('psg');
      expect(result.metadata?.nodeCount).toBe(1);
    });
    
    it('should detect Output nodes in fragments', async () => {
      const fragmentWithOutput = JSON.stringify({
        version: '1.0.0',
        name: 'Invalid Fragment',
        metadata: { type: 'MULTI-ASPECT' },
        nodes: [
          {
            id: 'output-1',
            type: 'Output',
            x: 100,
            y: 100
          }
        ],
        edges: []
      });
      
      const result = await validateAsset(fragmentWithOutput);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: ValidationErrorCode.OUTPUT_IN_FRAGMENT,
          message: expect.stringContaining('Output nodes')
        })
      );
    });
    
    it('should detect duplicate node IDs', async () => {
      const duplicateNodes = JSON.stringify({
        version: '1.0.0',
        name: 'Duplicate Test',
        nodes: [
          { id: 'node-1', type: 'TextBlock', x: 0, y: 0 },
          { id: 'node-1', type: 'TextBlock', x: 100, y: 100 }
        ],
        edges: []
      });
      
      const result = await validateAsset(duplicateNodes);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: ValidationErrorCode.DUPLICATE_NODE_ID
        })
      );
    });
    
    it('should detect invalid edge references', async () => {
      const invalidEdges = JSON.stringify({
        version: '1.0.0',
        name: 'Invalid Edges',
        nodes: [
          { id: 'node-1', type: 'TextBlock', x: 0, y: 0 }
        ],
        edges: [
          { id: 'edge-1', source: 'node-1', target: 'non-existent' }
        ]
      });
      
      const result = await validateAsset(invalidEdges);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: ValidationErrorCode.INVALID_EDGE_TARGET
        })
      );
    });
    
    it('should warn about disconnected nodes', async () => {
      const disconnectedNode = JSON.stringify({
        version: '1.0.0',
        name: 'Disconnected Test',
        nodes: [
          { id: 'node-1', type: 'TextBlock', x: 0, y: 0 },
          { id: 'node-2', type: 'TextBlock', x: 100, y: 100 }
        ],
        edges: []
      });
      
      const result = await validateAsset(disconnectedNode);
      
      expect(result.valid).toBe(true); // Warnings don't make it invalid
      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          code: ValidationWarningCode.DISCONNECTED_NODE
        })
      );
    });
  });
  
  describe('PSGLib Format Validation', () => {
    it('should validate a valid PSGLib preset', async () => {
      const validPSGLib = JSON.stringify({
        fileType: 'psglib',
        formatVersion: '1.0.0',
        metadata: {
          id: 'preset-1',
          name: 'Test Preset',
          description: 'A test preset',
          author: 'Test Author',
          version: '1.0.0',
          tags: ['test'],
          nodeTypes: ['weightedChoice'],
          lastModified: new Date().toISOString(),
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
              id: 'node-1',
              type: 'weightedChoice',
              position: { x: 100, y: 200 },
              data: {
                options: [
                  { id: 'opt-1', text: 'Option 1', weight: 1 }
                ]
              }
            }
          ],
          edges: []
        }
      });
      
      const result = await validateAsset(validPSGLib);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.metadata?.format).toBe('psglib');
    });
    
    it('should validate version compatibility', async () => {
      const futureVersion = JSON.stringify({
        fileType: 'psglib',
        formatVersion: '2.0.0', // Future major version
        metadata: {
          id: 'preset-1',
          name: 'Future Preset',
          description: 'From the future',
          author: 'Future Author',
          version: '1.0.0',
          tags: [],
          nodeTypes: [],
          lastModified: new Date().toISOString(),
          license: 'MIT',
          usageStats: { timesUsed: 0, lastUsed: null, popularity: 0 }
        },
        graph: { nodes: [], edges: [] }
      });
      
      const result = await validateAsset(futureVersion);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: ValidationErrorCode.VERSION_TOO_NEW
        })
      );
    });
    
    it('should warn about missing author', async () => {
      const noAuthor = JSON.stringify({
        fileType: 'psglib',
        formatVersion: '1.0.0',
        metadata: {
          id: 'preset-1',
          name: 'No Author Preset',
          description: 'Missing author',
          author: 'Unknown',
          version: '1.0.0',
          tags: [],
          nodeTypes: [],
          lastModified: new Date().toISOString(),
          license: 'MIT',
          usageStats: { timesUsed: 0, lastUsed: null, popularity: 0 }
        },
        graph: { nodes: [], edges: [] }
      });
      
      const result = await validateAsset(noAuthor);
      
      expect(result.valid).toBe(true);
      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          code: ValidationWarningCode.MISSING_AUTHOR
        })
      );
    });
  });
  
  describe('Format Detection', () => {
    it('should detect PSG format', async () => {
      const psgFile = JSON.stringify({
        version: '1.0.0',
        name: 'PSG File',
        nodes: [],
        edges: []
      });
      
      const result = await validateAsset(psgFile);
      expect(result.metadata?.format).toBe('psg');
    });
    
    it('should detect PSGLib format', async () => {
      const psgLibFile = JSON.stringify({
        fileType: 'psglib',
        formatVersion: '1.0.0',
        metadata: {
          id: 'test',
          name: 'Test',
          description: '',
          author: 'Test',
          version: '1.0.0',
          tags: [],
          nodeTypes: [],
          lastModified: new Date().toISOString(),
          license: 'MIT',
          usageStats: { timesUsed: 0, lastUsed: null, popularity: 0 }
        },
        graph: { nodes: [], edges: [] }
      });
      
      const result = await validateAsset(psgLibFile);
      expect(result.metadata?.format).toBe('psglib');
    });
    
    it('should reject unknown formats', async () => {
      const unknownFormat = JSON.stringify({
        someField: 'value'
      });
      
      const result = await validateAsset(unknownFormat);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: ValidationErrorCode.INVALID_SCHEMA,
          message: expect.stringContaining('Unknown file format')
        })
      );
    });
  });
  
  describe('Error Formatting', () => {
    it('should format validation results nicely', async () => {
      const invalidFile = JSON.stringify({
        version: '1.0.0',
        name: 'Test',
        nodes: [
          { id: 'node-1', type: 'UnknownType', x: 0, y: 0 }
        ],
        edges: [
          { id: 'edge-1', source: 'node-1', target: 'missing' }
        ]
      });
      
      const result = await validateAsset(invalidFile);
      const formatted = formatValidationResult(result);
      
      expect(formatted).toContain('❌ Asset validation failed');
      expect(formatted).toContain('🚫 Errors:');
      expect(formatted).toContain('⚠️  Warnings:');
    });
    
    it('should show success message for valid files', async () => {
      const validFile = JSON.stringify({
        version: '1.0.0',
        name: 'Valid',
        nodes: [],
        edges: []
      });
      
      const result = await validateAsset(validFile);
      const formatted = formatValidationResult(result);
      
      expect(formatted).toContain('✅ Asset validation passed');
    });
  });
  
  describe('Circular Dependency Detection', () => {
    it('should detect simple cycles', async () => {
      const cyclicGraph = JSON.stringify({
        version: '1.0.0',
        name: 'Cyclic',
        nodes: [
          { id: 'A', type: 'TextBlock', x: 0, y: 0 },
          { id: 'B', type: 'TextBlock', x: 100, y: 0 },
          { id: 'C', type: 'TextBlock', x: 200, y: 0 }
        ],
        edges: [
          { id: 'e1', source: 'A', target: 'B' },
          { id: 'e2', source: 'B', target: 'C' },
          { id: 'e3', source: 'C', target: 'A' } // Creates cycle
        ]
      });
      
      const result = await validateAsset(cyclicGraph);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: ValidationErrorCode.CIRCULAR_DEPENDENCY
        })
      );
    });
  });
  
  describe('Region Validation', () => {
    it('should validate region node references', async () => {
      const invalidRegion = JSON.stringify({
        version: '1.0.0',
        name: 'Invalid Region',
        nodes: [
          { id: 'node-1', type: 'TextBlock', x: 0, y: 0 }
        ],
        edges: [],
        regions: [
          {
            id: 'region-1',
            name: 'Test Region',
            nodes: ['node-1', 'non-existent'] // Invalid reference
          }
        ]
      });
      
      const result = await validateAsset(invalidRegion);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: ValidationErrorCode.INVALID_REGION_NODES
        })
      );
    });
    
    it('should validate port definitions', async () => {
      const invalidPorts = JSON.stringify({
        version: '1.0.0',
        name: 'Invalid Ports',
        nodes: [],
        edges: [],
        regions: [
          {
            id: 'region-1',
            name: 'Test Region',
            nodes: [],
            ports: [
              { id: 'port-1', label: 'Port 1', direction: 'invalid' } // Invalid direction
            ]
          }
        ]
      });
      
      const result = await validateAsset(invalidPorts);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: ValidationErrorCode.INVALID_PORT_DIRECTION
        })
      );
    });
  });
});