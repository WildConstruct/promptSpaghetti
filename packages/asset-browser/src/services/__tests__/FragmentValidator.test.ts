/**
 * Tests for FragmentValidator service
 */

import { FragmentValidator } from '../FragmentValidator';

describe('FragmentValidator', () => {
  describe('validate', () => {
    it('should validate a valid PSG fragment', async () => {
      const validPSG = JSON.stringify({
        version: '1.0.0',
        name: 'Test Fragment',
        nodes: [
          { id: 'node1', type: 'WeightedChoice', x: 100, y: 100 },
          { id: 'node2', type: 'TextBlock', x: 200, y: 200 },
        ],
        edges: [
          { id: 'edge1', source: 'node1', target: 'node2' },
        ],
      });
      
      const result = await FragmentValidator.validate(validPSG);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.format).toBe('psg');
      expect(result.nodeCount).toBe(2);
    });
    
    it('should validate a valid PSGLib fragment', async () => {
      const validPSGLib = JSON.stringify({
        fileType: 'psglib',
        formatVersion: '1.0.0',
        metadata: {
          id: 'test-fragment',
          name: 'Test Fragment',
          version: '1.0.0',
          nodeTypes: ['weightedChoice', 'textBlock'],
          isFragment: true,
        },
        graph: {
          nodes: [
            { id: 'node1', type: 'weightedChoice', position: { x: 100, y: 100 } },
            { id: 'node2', type: 'textBlock', position: { x: 200, y: 200 } },
          ],
          edges: [
            { id: 'edge1', source: 'node1', target: 'node2' },
          ],
        },
      });
      
      const result = await FragmentValidator.validate(validPSGLib);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.format).toBe('psglib');
      expect(result.nodeCount).toBe(2);
    });
    
    it('should reject invalid JSON', async () => {
      const invalidJSON = 'not valid json {';
      
      const result = await FragmentValidator.validate(invalidJSON);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Invalid JSON');
    });
    
    it('should detect duplicate node IDs', async () => {
      const duplicateNodes = JSON.stringify({
        version: '1.0.0',
        nodes: [
          { id: 'node1', type: 'WeightedChoice', x: 100, y: 100 },
          { id: 'node1', type: 'TextBlock', x: 200, y: 200 }, // Duplicate ID
        ],
        edges: [],
      });
      
      const result = await FragmentValidator.validate(duplicateNodes);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual('Duplicate node ID: node1');
    });
    
    it('should warn about Output nodes in fragments', async () => {
      const withOutput = JSON.stringify({
        version: '1.0.0',
        nodes: [
          { id: 'node1', type: 'Output', x: 100, y: 100 },
        ],
        edges: [],
      });
      
      const result = await FragmentValidator.validate(withOutput);
      
      expect(result.warnings).toContainEqual('Fragment contains Output nodes (will be filtered out)');
      expect(result.hasOutputNodes).toBe(true);
    });
    
    it('should detect edges with invalid references', async () => {
      const invalidEdges = JSON.stringify({
        version: '1.0.0',
        nodes: [
          { id: 'node1', type: 'WeightedChoice', x: 100, y: 100 },
        ],
        edges: [
          { id: 'edge1', source: 'node1', target: 'nonexistent' },
        ],
      });
      
      const result = await FragmentValidator.validate(invalidEdges);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual('Edge references non-existent target: nonexistent');
    });
    
    it('should warn about disconnected nodes', async () => {
      const disconnected = JSON.stringify({
        version: '1.0.0',
        nodes: [
          { id: 'node1', type: 'WeightedChoice', x: 100, y: 100 },
          { id: 'node2', type: 'TextBlock', x: 200, y: 200 },
          { id: 'node3', type: 'Variable', x: 300, y: 300 }, // Disconnected
        ],
        edges: [
          { id: 'edge1', source: 'node1', target: 'node2' },
        ],
      });
      
      const result = await FragmentValidator.validate(disconnected);
      
      expect(result.valid).toBe(true); // Still valid, just a warning
      expect(result.warnings).toContainEqual('1 disconnected node(s)');
    });
    
    it('should reject unknown format', async () => {
      const unknownFormat = JSON.stringify({
        someField: 'value',
      });
      
      const result = await FragmentValidator.validate(unknownFormat);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual('Unknown fragment format - not PSG or PSGLib');
    });
  });
  
  describe('canParse', () => {
    it('should return true for valid PSG', () => {
      const validPSG = JSON.stringify({
        version: '1.0.0',
        nodes: [],
        edges: [],
      });
      
      expect(FragmentValidator.canParse(validPSG)).toBe(true);
    });
    
    it('should return true for valid PSGLib', () => {
      const validPSGLib = JSON.stringify({
        fileType: 'psglib',
        formatVersion: '1.0.0',
        metadata: { id: 'test', name: 'Test' },
        graph: { nodes: [], edges: [] },
      });
      
      expect(FragmentValidator.canParse(validPSGLib)).toBe(true);
    });
    
    it('should return false for invalid JSON', () => {
      expect(FragmentValidator.canParse('not json')).toBe(false);
    });
    
    it('should return false for unknown format', () => {
      const unknownFormat = JSON.stringify({ someField: 'value' });
      expect(FragmentValidator.canParse(unknownFormat)).toBe(false);
    });
  });
});