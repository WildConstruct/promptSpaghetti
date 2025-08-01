import { connectionValidator } from '../ConnectionValidator';
import { Node, Edge } from 'reactflow';
import type { EditableNodeData } from '../../nodes';

describe('ConnectionValidator', () => {
  const createNode = (id: string, type: string): Node<EditableNodeData> => ({
    id,
    type,
    position: { x: 0, y: 0 },
    data: { value: '', nodeType: type },
  });

  const createEdge = (source: string, target: string): Edge => ({
    id: `${source}-${target}`,
    source,
    target,
  });

  describe('Basic validation', () => {
    test('prevents self-connections', () => {
      const nodes = [createNode('1', 'textBlock')];
      const edges: Edge[] = [];
      
      const result = connectionValidator.validateConnection(
        { source: '1', target: '1' },
        nodes,
        edges
      );
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Cannot connect node to itself');
    });

    test('prevents output nodes from having outgoing connections', () => {
      const nodes = [
        createNode('1', 'output'),
        createNode('2', 'textBlock'),
      ];
      const edges: Edge[] = [];
      
      const result = connectionValidator.validateConnection(
        { source: '1', target: '2' },
        nodes,
        edges
      );
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Output nodes cannot have outgoing connections');
    });

    test('allows valid connections', () => {
      const nodes = [
        createNode('1', 'textBlock'),
        createNode('2', 'concat'),
      ];
      const edges: Edge[] = [];
      
      const result = connectionValidator.validateConnection(
        { source: '1', target: '2' },
        nodes,
        edges
      );
      
      expect(result.isValid).toBe(true);
    });
  });

  describe('Node type specific rules', () => {
    test('variable getters can only connect to specific nodes', () => {
      const nodes = [
        createNode('1', 'getVariable'),
        createNode('2', 'textBlock'),
        createNode('3', 'concat'),
      ];
      const edges: Edge[] = [];
      
      // Invalid connection
      const result1 = connectionValidator.validateConnection(
        { source: '1', target: '2' },
        nodes,
        edges
      );
      expect(result1.isValid).toBe(false);
      
      // Valid connection
      const result2 = connectionValidator.validateConnection(
        { source: '1', target: '3' },
        nodes,
        edges
      );
      expect(result2.isValid).toBe(true);
    });

    test('weighted choice accepts text inputs', () => {
      const nodes = [
        createNode('1', 'textBlock'),
        createNode('2', 'weightedChoice'),
        createNode('3', 'concat'),
      ];
      const edges: Edge[] = [];
      
      // Valid: text to weighted choice
      const result1 = connectionValidator.validateConnection(
        { source: '1', target: '2' },
        nodes,
        edges
      );
      expect(result1.isValid).toBe(true);
      
      // Invalid: concat to weighted choice
      const result2 = connectionValidator.validateConnection(
        { source: '3', target: '2' },
        nodes,
        edges
      );
      expect(result2.isValid).toBe(false);
    });
  });

  describe('Cycle detection', () => {
    test('prevents simple cycles', () => {
      const nodes = [
        createNode('1', 'textBlock'),
        createNode('2', 'concat'),
        createNode('3', 'concat'),
      ];
      const edges = [
        createEdge('1', '2'),
        createEdge('2', '3'),
      ];
      
      // Would create cycle: 3 -> 1 -> 2 -> 3
      const result = connectionValidator.validateConnection(
        { source: '3', target: '1' },
        nodes,
        edges
      );
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Connection would create a cycle');
    });

    test('allows non-cyclic connections', () => {
      const nodes = [
        createNode('1', 'textBlock'),
        createNode('2', 'concat'),
        createNode('3', 'concat'),
        createNode('4', 'output'),
      ];
      const edges = [
        createEdge('1', '2'),
        createEdge('2', '3'),
      ];
      
      // Valid: creates a linear flow
      const result = connectionValidator.validateConnection(
        { source: '3', target: '4' },
        nodes,
        edges
      );
      
      expect(result.isValid).toBe(true);
    });
  });

  describe('getValidTargets', () => {
    test('returns valid targets for text blocks', () => {
      const node = createNode('1', 'textBlock');
      const targets = connectionValidator.getValidTargets(node);
      
      expect(targets).toContain('concat');
      expect(targets).toContain('output');
      expect(targets).toContain('setVariable');
      expect(targets).toContain('weightedChoice');
    });

    test('returns empty array for output nodes', () => {
      const node = createNode('1', 'output');
      const targets = connectionValidator.getValidTargets(node);
      
      expect(targets).toEqual([]);
    });

    test('returns specific targets for getVariable', () => {
      const node = createNode('1', 'getVariable');
      const targets = connectionValidator.getValidTargets(node);
      
      expect(targets).toContain('concat');
      expect(targets).toContain('output');
      expect(targets).toContain('setVariable');
      expect(targets).toContain('weightedChoice');
    });
  });

  describe('canAcceptConnection', () => {
    test('output nodes cannot be sources', () => {
      const node = createNode('1', 'output');
      const canAccept = connectionValidator.canAcceptConnection(node, [], 'source');
      
      expect(canAccept).toBe(false);
    });

    test('most nodes can accept connections', () => {
      const node = createNode('1', 'concat');
      const canAcceptSource = connectionValidator.canAcceptConnection(node, [], 'source');
      const canAcceptTarget = connectionValidator.canAcceptConnection(node, [], 'target');
      
      expect(canAcceptSource).toBe(true);
      expect(canAcceptTarget).toBe(true);
    });
  });
});