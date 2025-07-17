import { useGraphStore } from '../graphStore';
import { act } from '@testing-library/react';
import '@testing-library/jest-dom';
// Reset store between tests
beforeEach(() => {
    const store = useGraphStore.getState();
    act(() => {
        store.setNodes([]);
        store.setEdges([]);
    });
});
describe('Graph Store', () => {
    describe('Initial state', () => {
        it('should initialize with empty nodes and edges arrays', () => {
            const state = useGraphStore.getState();
            expect(state.nodes).toEqual([]);
            expect(state.edges).toEqual([]);
        });
    });
    describe('setNodes', () => {
        it('should replace the nodes array with a new array', () => {
            const mockNodes = [
                {
                    id: 'n1',
                    type: 'default',
                    position: { x: 100, y: 100 },
                    data: { label: 'Node 1' }
                },
                {
                    id: 'n2',
                    type: 'default',
                    position: { x: 200, y: 200 },
                    data: { label: 'Node 2' }
                }
            ];
            const store = useGraphStore.getState();
            act(() => {
                store.setNodes(mockNodes);
            });
            expect(useGraphStore.getState().nodes).toHaveLength(2);
            expect(useGraphStore.getState().nodes).toEqual(mockNodes);
        });
    });
    describe('setEdges', () => {
        it('should replace the edges array with a new array', () => {
            const mockEdges = [
                {
                    id: 'e1',
                    source: 'n1',
                    target: 'n2',
                },
                {
                    id: 'e2',
                    source: 'n2',
                    target: 'n3',
                }
            ];
            const store = useGraphStore.getState();
            act(() => {
                store.setEdges(mockEdges);
            });
            expect(useGraphStore.getState().edges).toHaveLength(2);
            expect(useGraphStore.getState().edges).toEqual(mockEdges);
        });
    });
    describe('addNode', () => {
        it('should add a new node to the nodes array', () => {
            const mockNode = {
                id: 'n1',
                type: 'default',
                position: { x: 100, y: 100 },
                data: { label: 'New Node' }
            };
            const store = useGraphStore.getState();
            act(() => {
                store.addNode(mockNode);
            });
            expect(useGraphStore.getState().nodes).toHaveLength(1);
            expect(useGraphStore.getState().nodes[0]).toEqual(mockNode);
            // Add a second node and check both exist
            const secondNode = {
                id: 'n2',
                type: 'output',
                position: { x: 200, y: 200 },
                data: { label: 'Another Node' }
            };
            act(() => {
                store.addNode(secondNode);
            });
            expect(useGraphStore.getState().nodes).toHaveLength(2);
            expect(useGraphStore.getState().nodes[1]).toEqual(secondNode);
        });
    });
    describe('addEdge', () => {
        it('should add a new edge to the edges array', () => {
            const mockEdge = {
                id: 'e1',
                source: 'n1',
                target: 'n2',
            };
            const store = useGraphStore.getState();
            act(() => {
                store.addEdge(mockEdge);
            });
            expect(useGraphStore.getState().edges).toHaveLength(1);
            expect(useGraphStore.getState().edges[0]).toEqual(mockEdge);
            // Add a second edge and check both exist
            const secondEdge = {
                id: 'e2',
                source: 'n2',
                target: 'n3',
            };
            act(() => {
                store.addEdge(secondEdge);
            });
            expect(useGraphStore.getState().edges).toHaveLength(2);
            expect(useGraphStore.getState().edges[1]).toEqual(secondEdge);
        });
    });
    describe('updateNode', () => {
        it('should update a node with the provided partial data', () => {
            // Setup initial nodes
            const mockNodes = [
                {
                    id: 'n1',
                    type: 'default',
                    position: { x: 100, y: 100 },
                    data: { label: 'Node 1', value: 'old' }
                },
                {
                    id: 'n2',
                    type: 'default',
                    position: { x: 200, y: 200 },
                    data: { label: 'Node 2', value: 'test' }
                }
            ];
            const store = useGraphStore.getState();
            act(() => {
                store.setNodes(mockNodes);
            });
            // Update node n1
            act(() => {
                store.updateNode('n1', { value: 'new', extra: 'data' });
            });
            const updatedNodes = useGraphStore.getState().nodes;
            // Check node n1 was updated
            const updatedNode = updatedNodes.find(node => node.id === 'n1');
            expect(updatedNode).toBeDefined();
            expect(updatedNode?.data.value).toBe('new');
            expect(updatedNode?.data.extra).toBe('data');
            expect(updatedNode?.data.label).toBe('Node 1'); // Original data preserved
            // Check node n2 was not affected
            const untouchedNode = updatedNodes.find(node => node.id === 'n2');
            expect(untouchedNode?.data).toEqual({ label: 'Node 2', value: 'test' });
        });
        it('should not modify any nodes if the nodeId is not found', () => {
            // Setup initial nodes
            const mockNodes = [
                {
                    id: 'n1',
                    type: 'default',
                    position: { x: 100, y: 100 },
                    data: { label: 'Node 1' }
                }
            ];
            const store = useGraphStore.getState();
            act(() => {
                store.setNodes(mockNodes);
            });
            // Attempt to update non-existent node
            act(() => {
                store.updateNode('non-existent', { value: 'new' });
            });
            // Verify original nodes are unchanged
            expect(useGraphStore.getState().nodes).toEqual(mockNodes);
        });
    });
});
