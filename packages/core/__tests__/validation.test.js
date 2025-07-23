/**
 * Comprehensive Tests for Core Validation Logic
 *
 * Tests for graph connection validation including edge cases,
 * performance scenarios, and integration with the runtime engine.
 */
import { validateConnection } from '../validation';
describe('Core Validation - validateConnection', () => {
    // Helper function to create test nodes
    const createNode = (id, type = 'default') => ({
        id,
        type,
        position: { x: 0, y: 0 },
        data: { label: `Node ${id}` }
    });
    // Helper function to create test edges
    const createEdge = (id, source, target) => ({
        id,
        source,
        target
    });
    describe('Valid Graph Configurations', () => {
        it('should return no errors for empty graph', () => {
            const nodes = [];
            const edges = [];
            const result = validateConnection(edges, nodes);
            expect(result).toEqual([]);
        });
        it('should return no errors for single node with no edges', () => {
            const nodes = [createNode('1')];
            const edges = [];
            const result = validateConnection(edges, nodes);
            expect(result).toEqual([]);
        });
        it('should return no errors for valid linear chain', () => {
            const nodes = [
                createNode('1'),
                createNode('2'),
                createNode('3')
            ];
            const edges = [
                createEdge('e1', '1', '2'),
                createEdge('e2', '2', '3')
            ];
            const result = validateConnection(edges, nodes);
            expect(result).toEqual([]);
        });
        it('should return no errors for valid branching graph', () => {
            const nodes = [
                createNode('1'),
                createNode('2'),
                createNode('3'),
                createNode('4')
            ];
            const edges = [
                createEdge('e1', '1', '2'),
                createEdge('e2', '1', '3'),
                createEdge('e3', '2', '4'),
                createEdge('e4', '3', '4')
            ];
            const result = validateConnection(edges, nodes);
            expect(result).toEqual([]);
        });
        it('should return no errors for complex valid graph', () => {
            const nodes = Array.from({ length: 10 }, (_, i) => createNode(`node${i}`));
            const edges = [
                createEdge('e1', 'node0', 'node1'),
                createEdge('e2', 'node0', 'node2'),
                createEdge('e3', 'node1', 'node3'),
                createEdge('e4', 'node2', 'node4'),
                createEdge('e5', 'node3', 'node5'),
                createEdge('e6', 'node4', 'node5'),
                createEdge('e7', 'node5', 'node6'),
                createEdge('e8', 'node6', 'node7'),
                createEdge('e9', 'node7', 'node8'),
                createEdge('e10', 'node8', 'node9')
            ];
            const result = validateConnection(edges, nodes);
            expect(result).toEqual([]);
        });
    });
    describe('Self-Loop Detection', () => {
        it('should detect single self-loop', () => {
            const nodes = [createNode('1')];
            const edges = [createEdge('e1', '1', '1')];
            const result = validateConnection(edges, nodes);
            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({
                edgeId: 'e1',
                message: 'Edge is a self-loop'
            });
        });
        it('should detect multiple self-loops', () => {
            const nodes = [
                createNode('1'),
                createNode('2'),
                createNode('3')
            ];
            const edges = [
                createEdge('e1', '1', '1'),
                createEdge('e2', '2', '2'),
                createEdge('e3', '1', '3') // Valid edge
            ];
            const result = validateConnection(edges, nodes);
            expect(result).toHaveLength(2);
            expect(result).toContainEqual({
                edgeId: 'e1',
                message: 'Edge is a self-loop'
            });
            expect(result).toContainEqual({
                edgeId: 'e2',
                message: 'Edge is a self-loop'
            });
        });
        it('should detect self-loops in complex graphs', () => {
            const nodes = Array.from({ length: 5 }, (_, i) => createNode(`${i}`));
            const edges = [
                createEdge('e1', '0', '1'),
                createEdge('e2', '1', '2'),
                createEdge('e3', '2', '2'), // Self-loop
                createEdge('e4', '2', '3'),
                createEdge('e5', '3', '4'),
                createEdge('e6', '4', '4') // Self-loop
            ];
            const result = validateConnection(edges, nodes);
            expect(result).toHaveLength(2);
            expect(result.map(e => e.edgeId)).toContain('e3');
            expect(result.map(e => e.edgeId)).toContain('e6');
            expect(result.every(e => e.message === 'Edge is a self-loop')).toBe(true);
        });
    });
    describe('Duplicate Edge Detection', () => {
        it('should detect simple duplicate edges', () => {
            const nodes = [
                createNode('1'),
                createNode('2')
            ];
            const edges = [
                createEdge('e1', '1', '2'),
                createEdge('e2', '1', '2') // Duplicate
            ];
            const result = validateConnection(edges, nodes);
            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({
                edgeId: 'e2',
                message: 'Duplicate edge'
            });
        });
        it('should detect multiple duplicate edges', () => {
            const nodes = [
                createNode('1'),
                createNode('2'),
                createNode('3')
            ];
            const edges = [
                createEdge('e1', '1', '2'),
                createEdge('e2', '1', '2'), // Duplicate of e1
                createEdge('e3', '2', '3'),
                createEdge('e4', '2', '3'), // Duplicate of e3
                createEdge('e5', '1', '3') // Valid
            ];
            const result = validateConnection(edges, nodes);
            expect(result).toHaveLength(2);
            expect(result).toContainEqual({
                edgeId: 'e2',
                message: 'Duplicate edge'
            });
            expect(result).toContainEqual({
                edgeId: 'e4',
                message: 'Duplicate edge'
            });
        });
        it('should allow reverse edges (bidirectional)', () => {
            const nodes = [
                createNode('1'),
                createNode('2')
            ];
            const edges = [
                createEdge('e1', '1', '2'),
                createEdge('e2', '2', '1') // Reverse direction - should be valid
            ];
            const result = validateConnection(edges, nodes);
            expect(result).toEqual([]);
        });
        it('should detect duplicates with different edge IDs', () => {
            const nodes = [
                createNode('a'),
                createNode('b')
            ];
            const edges = [
                createEdge('first-edge', 'a', 'b'),
                createEdge('second-edge', 'a', 'b'), // Same source/target, different ID
                createEdge('third-edge', 'a', 'b') // Another duplicate
            ];
            const result = validateConnection(edges, nodes);
            expect(result).toHaveLength(2);
            expect(result[0].edgeId).toBe('second-edge');
            expect(result[1].edgeId).toBe('third-edge');
            expect(result.every(e => e.message === 'Duplicate edge')).toBe(true);
        });
    });
    describe('Combined Validation Errors', () => {
        it('should detect both self-loops and duplicates', () => {
            const nodes = [
                createNode('1'),
                createNode('2'),
                createNode('3')
            ];
            const edges = [
                createEdge('e1', '1', '2'),
                createEdge('e2', '1', '2'), // Duplicate
                createEdge('e3', '2', '2'), // Self-loop
                createEdge('e4', '2', '3'),
                createEdge('e5', '3', '3'), // Self-loop
                createEdge('e6', '2', '3') // Duplicate
            ];
            const result = validateConnection(edges, nodes);
            expect(result).toHaveLength(4);
            const selfLoops = result.filter(e => e.message === 'Edge is a self-loop');
            const duplicates = result.filter(e => e.message === 'Duplicate edge');
            expect(selfLoops).toHaveLength(2);
            expect(duplicates).toHaveLength(2);
            expect(selfLoops.map(e => e.edgeId)).toContain('e3');
            expect(selfLoops.map(e => e.edgeId)).toContain('e5');
            expect(duplicates.map(e => e.edgeId)).toContain('e2');
            expect(duplicates.map(e => e.edgeId)).toContain('e6');
        });
        it('should handle self-loop duplicates', () => {
            const nodes = [createNode('1')];
            const edges = [
                createEdge('e1', '1', '1'), // Self-loop
                createEdge('e2', '1', '1') // Duplicate self-loop
            ];
            const result = validateConnection(edges, nodes);
            expect(result).toHaveLength(3);
            expect(result.filter(e => e.message === 'Edge is a self-loop')).toHaveLength(2);
            expect(result.filter(e => e.message === 'Duplicate edge')).toHaveLength(1);
            expect(result.map(e => e.edgeId)).toContain('e1');
            expect(result.map(e => e.edgeId)).toContain('e2');
        });
    });
    describe('Edge Cases and Error Conditions', () => {
        it('should handle null/undefined nodes gracefully', () => {
            const edges = [createEdge('e1', '1', '2')];
            const nodes = [];
            const result = validateConnection(edges, nodes);
            // Should still validate edges regardless of node existence
            expect(result).toEqual([]);
        });
        it('should handle edges with special characters in IDs', () => {
            const nodes = [
                createNode('node-1'),
                createNode('node_2'),
                createNode('node@3'),
                createNode('node.4')
            ];
            const edges = [
                createEdge('edge-1', 'node-1', 'node_2'),
                createEdge('edge_2', 'node_2', 'node@3'),
                createEdge('edge@3', 'node@3', 'node.4'),
                createEdge('edge.4', 'node-1', 'node_2') // Duplicate
            ];
            const result = validateConnection(edges, nodes);
            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({
                edgeId: 'edge.4',
                message: 'Duplicate edge'
            });
        });
        it('should handle very long node IDs', () => {
            const longId1 = 'a'.repeat(100);
            const longId2 = 'b'.repeat(100);
            const nodes = [
                createNode(longId1),
                createNode(longId2)
            ];
            const edges = [
                createEdge('e1', longId1, longId2),
                createEdge('e2', longId1, longId2) // Duplicate
            ];
            const result = validateConnection(edges, nodes);
            expect(result).toHaveLength(1);
            expect(result[0].message).toBe('Duplicate edge');
        });
        it('should handle empty edge IDs', () => {
            const nodes = [createNode('1'), createNode('2')];
            const edges = [
                createEdge('', '1', '2'),
                createEdge('valid', '1', '2')
            ];
            const result = validateConnection(edges, nodes);
            expect(result).toHaveLength(1);
            expect(result[0].edgeId).toBe('valid');
            expect(result[0].message).toBe('Duplicate edge');
        });
    });
    describe('Performance and Scalability', () => {
        it('should handle large graphs efficiently', () => {
            const nodeCount = 1000;
            const edgeCount = 2000;
            const nodes = Array.from({ length: nodeCount }, (_, i) => createNode(`node${i}`));
            const edges = [];
            // Create valid edges
            for (let i = 0; i < edgeCount; i++) {
                const source = `node${Math.floor(Math.random() * nodeCount)}`;
                let target = `node${Math.floor(Math.random() * nodeCount)}`;
                // Avoid self-loops for this test
                while (target === source) {
                    target = `node${Math.floor(Math.random() * nodeCount)}`;
                }
                edges.push(createEdge(`edge${i}`, source, target));
            }
            const startTime = performance.now();
            const result = validateConnection(edges, nodes);
            const endTime = performance.now();
            // Should complete within reasonable time (< 100ms for 2000 edges)
            expect(endTime - startTime).toBeLessThan(100);
            // Should detect duplicates if any exist
            expect(Array.isArray(result)).toBe(true);
        });
        it('should handle worst-case scenario with many duplicates', () => {
            const nodes = [createNode('1'), createNode('2')];
            const edges = [];
            // Create 1000 duplicate edges
            for (let i = 0; i < 1000; i++) {
                edges.push(createEdge(`edge${i}`, '1', '2'));
            }
            const startTime = performance.now();
            const result = validateConnection(edges, nodes);
            const endTime = performance.now();
            // Should detect 999 duplicates (first one is valid)
            expect(result).toHaveLength(999);
            expect(result.every(e => e.message === 'Duplicate edge')).toBe(true);
            // Should complete within reasonable time
            expect(endTime - startTime).toBeLessThan(50);
        });
        it('should handle many self-loops efficiently', () => {
            const nodeCount = 100;
            const nodes = Array.from({ length: nodeCount }, (_, i) => createNode(`node${i}`));
            const edges = nodes.map((node, i) => createEdge(`edge${i}`, node.id, node.id));
            const startTime = performance.now();
            const result = validateConnection(edges, nodes);
            const endTime = performance.now();
            expect(result).toHaveLength(nodeCount);
            expect(result.every(e => e.message === 'Edge is a self-loop')).toBe(true);
            expect(endTime - startTime).toBeLessThan(25);
        });
    });
    describe('Validation Error Structure', () => {
        it('should return errors with correct structure', () => {
            const nodes = [createNode('1')];
            const edges = [createEdge('test-edge', '1', '1')];
            const result = validateConnection(edges, nodes);
            expect(result).toHaveLength(1);
            expect(result[0]).toHaveProperty('edgeId');
            expect(result[0]).toHaveProperty('message');
            expect(typeof result[0].edgeId).toBe('string');
            expect(typeof result[0].message).toBe('string');
        });
        it('should maintain error order based on edge order', () => {
            const nodes = [createNode('1'), createNode('2')];
            const edges = [
                createEdge('first', '1', '2'),
                createEdge('second', '1', '2'), // Duplicate
                createEdge('third', '1', '2'), // Duplicate
                createEdge('fourth', '1', '2') // Duplicate
            ];
            const result = validateConnection(edges, nodes);
            expect(result).toHaveLength(3);
            expect(result[0].edgeId).toBe('second');
            expect(result[1].edgeId).toBe('third');
            expect(result[2].edgeId).toBe('fourth');
        });
    });
    describe('Integration Scenarios', () => {
        it('should validate complex workflow graph', () => {
            // Simulate a typical workflow graph structure
            const nodes = [
                createNode('start', 'input'),
                createNode('process1', 'process'),
                createNode('decision', 'conditional'),
                createNode('process2a', 'process'),
                createNode('process2b', 'process'),
                createNode('merge', 'process'),
                createNode('output', 'output')
            ];
            const edges = [
                createEdge('e1', 'start', 'process1'),
                createEdge('e2', 'process1', 'decision'),
                createEdge('e3', 'decision', 'process2a'),
                createEdge('e4', 'decision', 'process2b'),
                createEdge('e5', 'process2a', 'merge'),
                createEdge('e6', 'process2b', 'merge'),
                createEdge('e7', 'merge', 'output')
            ];
            const result = validateConnection(edges, nodes);
            expect(result).toEqual([]);
        });
        it('should validate prompt engineering graph with variables', () => {
            const nodes = [
                createNode('var1', 'variable'),
                createNode('var2', 'variable'),
                createNode('template', 'template'),
                createNode('ai-process', 'ai'),
                createNode('output', 'output')
            ];
            const edges = [
                createEdge('e1', 'var1', 'template'),
                createEdge('e2', 'var2', 'template'),
                createEdge('e3', 'template', 'ai-process'),
                createEdge('e4', 'ai-process', 'output')
            ];
            const result = validateConnection(edges, nodes);
            expect(result).toEqual([]);
        });
    });
    describe('TypeScript Type Safety', () => {
        it('should handle ValidationError type correctly', () => {
            const nodes = [createNode('1')];
            const edges = [createEdge('e1', '1', '1')];
            const result = validateConnection(edges, nodes);
            expect(result[0].edgeId).toBe('e1');
            expect(result[0].message).toBe('Edge is a self-loop');
        });
        it('should work with different node and edge types', () => {
            // Test with different node data structures
            const customNode = {
                id: 'custom',
                type: 'custom',
                position: { x: 100, y: 200 },
                data: {
                    label: 'Custom Node',
                    customProperty: 'value',
                    config: { enabled: true }
                }
            };
            const customEdge = {
                id: 'custom-edge',
                source: 'custom',
                target: 'custom',
                type: 'custom',
                animated: true,
                style: { stroke: 'red' }
            };
            const result = validateConnection([customEdge], [customNode]);
            expect(result).toHaveLength(1);
            expect(result[0].message).toBe('Edge is a self-loop');
        });
    });
});
