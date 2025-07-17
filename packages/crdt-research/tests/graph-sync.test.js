/**
 * GraphSyncHandler Tests - Synchronization and Presence
 * Epic 9.1.1 - Testing collaborative synchronization scenarios
 */
import { GraphSyncHandler } from '../src/graph-sync';
describe('GraphSyncHandler', () => {
    let sync1;
    let sync2;
    beforeEach(() => {
        sync1 = new GraphSyncHandler('doc1', 'user1');
        sync2 = new GraphSyncHandler('doc1', 'user2');
    });
    afterEach(() => {
        sync1.destroy();
        sync2.destroy();
    });
    describe('Document Synchronization', () => {
        test('should create and handle sync messages', () => {
            // User 1 adds a node
            const graph1 = sync1.getGraph();
            graph1.addNode({
                id: 'node1',
                type: 'WeightedChoice',
                position: { x: 100, y: 100 },
                data: {},
                metadata: {}
            });
            // Create sync message from user 1
            const syncMsg = sync1.createSyncMessage('sync');
            expect(syncMsg.type).toBe('sync');
            expect(syncMsg.stateVector).toBeDefined();
            // User 2 handles sync message and responds with update
            const response = sync2.handleSyncMessage(syncMsg);
            expect(response).toBeTruthy();
            expect(response?.type).toBe('update');
            // User 1 applies the update
            if (response) {
                sync1.handleSyncMessage(response);
            }
            // Now create update from user 1
            const state1 = sync1.getStateAsUpdate();
            const updateMsg = sync1.createSyncMessage('update', state1);
            // User 2 applies the update
            sync2.handleSyncMessage(updateMsg);
            // Both should have the same node
            const graph2 = sync2.getGraph();
            expect(graph2.getNode('node1')).toBeTruthy();
            expect(graph2.getNode('node1')?.position).toEqual({ x: 100, y: 100 });
        });
        test('should sync bidirectional changes', () => {
            const graph1 = sync1.getGraph();
            const graph2 = sync2.getGraph();
            // User 1 adds node1
            graph1.addNode({
                id: 'node1',
                type: 'WeightedChoice',
                position: { x: 100, y: 100 },
                data: {},
                metadata: {}
            });
            // User 2 adds node2
            graph2.addNode({
                id: 'node2',
                type: 'Output',
                position: { x: 200, y: 200 },
                data: {},
                metadata: {}
            });
            // Exchange updates
            const update1 = sync1.getStateAsUpdate();
            const update2 = sync2.getStateAsUpdate();
            sync1.applyUpdate(update2);
            sync2.applyUpdate(update1);
            // Both should have both nodes
            expect(graph1.getNodes()).toHaveLength(2);
            expect(graph2.getNodes()).toHaveLength(2);
            expect(graph1.getNode('node1')).toBeTruthy();
            expect(graph1.getNode('node2')).toBeTruthy();
            expect(graph2.getNode('node1')).toBeTruthy();
            expect(graph2.getNode('node2')).toBeTruthy();
        });
        test('should handle incremental updates', () => {
            const graph1 = sync1.getGraph();
            // Get initial state vector from user 2
            const initialVector = sync2.getStateVector();
            // User 1 makes multiple changes
            graph1.addNode({
                id: 'node1',
                type: 'WeightedChoice',
                position: { x: 100, y: 100 },
                data: {},
                metadata: {}
            });
            graph1.addNode({
                id: 'node2',
                type: 'Output',
                position: { x: 200, y: 200 },
                data: {},
                metadata: {}
            });
            graph1.addEdge({
                id: 'edge1',
                source: 'node1',
                target: 'node2',
                sourceHandle: 'output',
                targetHandle: 'input',
                metadata: {}
            });
            // Get diff update from initial state
            const diffUpdate = sync1.getDiffUpdate(initialVector);
            // Apply to user 2
            sync2.applyUpdate(diffUpdate);
            // User 2 should have all changes
            const graph2 = sync2.getGraph();
            expect(graph2.getNodes()).toHaveLength(2);
            expect(graph2.getEdges()).toHaveLength(1);
        });
    });
    describe('User Presence and Awareness', () => {
        test('should track user presence', () => {
            const presence1 = {
                userId: 'user1',
                cursor: { nodeId: 'node1', position: { x: 100, y: 100 } },
                selection: ['node1'],
                color: '#ff0000',
                name: 'User 1',
                timestamp: Date.now()
            };
            sync1.setLocalPresence(presence1);
            const awareness = sync1.getAwareness();
            expect(awareness.size).toBe(1);
            expect(awareness.get('user1')).toBeTruthy();
            expect(awareness.get('user1')?.name).toBe('User 1');
        });
        test('should update remote presence', () => {
            const presence2 = {
                userId: 'user2',
                cursor: { nodeId: 'node2', position: { x: 200, y: 200 } },
                selection: ['node2'],
                color: '#00ff00',
                name: 'User 2',
                timestamp: Date.now()
            };
            sync1.updateAwareness('user2', presence2);
            const awareness = sync1.getAwareness();
            expect(awareness.size).toBe(1);
            expect(awareness.get('user2')?.name).toBe('User 2');
        });
        test('should clean up stale presence', (done) => {
            const oldPresence = {
                userId: 'user3',
                cursor: undefined,
                selection: [],
                color: '#0000ff',
                name: 'User 3',
                timestamp: Date.now() - 35000 // 35 seconds ago
            };
            const currentPresence = {
                userId: 'user2',
                cursor: undefined,
                selection: [],
                color: '#00ff00',
                name: 'User 2',
                timestamp: Date.now()
            };
            sync1.updateAwareness('user3', oldPresence);
            sync1.updateAwareness('user2', currentPresence);
            // Should have cleaned up the old presence
            const awareness = sync1.getAwareness();
            expect(awareness.size).toBe(1);
            expect(awareness.has('user3')).toBe(false);
            expect(awareness.has('user2')).toBe(true);
            done();
        });
        test('should notify awareness changes', (done) => {
            sync1.onAwarenessChange((awareness) => {
                expect(awareness.size).toBe(1);
                expect(awareness.get('user2')).toBeTruthy();
                done();
            });
            const presence = {
                userId: 'user2',
                cursor: undefined,
                selection: [],
                color: '#00ff00',
                name: 'User 2',
                timestamp: Date.now()
            };
            sync1.updateAwareness('user2', presence);
        });
    });
    describe('Snapshots', () => {
        test('should create and restore from snapshot', () => {
            const graph1 = sync1.getGraph();
            // Add some content
            graph1.addNode({
                id: 'node1',
                type: 'WeightedChoice',
                position: { x: 100, y: 100 },
                data: { choices: ['A', 'B', 'C'] },
                metadata: {}
            });
            graph1.addNode({
                id: 'node2',
                type: 'Output',
                position: { x: 200, y: 200 },
                data: {},
                metadata: {}
            });
            // Create snapshot
            const snapshot = sync1.createSnapshot();
            expect(snapshot).toBeDefined();
            expect(snapshot.length).toBeGreaterThan(0);
            // Create new sync handler and restore
            const sync3 = new GraphSyncHandler('doc1', 'user3');
            sync3.restoreFromSnapshot(snapshot);
            const graph3 = sync3.getGraph();
            expect(graph3.getNodes()).toHaveLength(2);
            expect(graph3.getNode('node1')?.data.choices).toEqual(['A', 'B', 'C']);
            sync3.destroy();
        });
    });
    describe('Document Metadata', () => {
        test('should track sync state', () => {
            const state = sync1.getSyncState();
            expect(state.documentId).toBe('doc1');
            expect(state.userId).toBe('user1');
            expect(state.lastSync).toBeDefined();
            expect(state.pendingOps).toBe(0);
        });
        test('should calculate document size', () => {
            const graph1 = sync1.getGraph();
            // Empty document should have minimal size
            const initialSize = sync1.getDocumentSize();
            expect(initialSize).toBeGreaterThan(0);
            // Add content
            for (let i = 0; i < 10; i++) {
                graph1.addNode({
                    id: `node${i}`,
                    type: 'WeightedChoice',
                    position: { x: i * 100, y: i * 100 },
                    data: { choices: ['Option A', 'Option B', 'Option C'] },
                    metadata: { description: 'This is a test node with some metadata' }
                });
            }
            // Size should increase
            const newSize = sync1.getDocumentSize();
            expect(newSize).toBeGreaterThan(initialSize);
        });
    });
    describe('Update Notifications', () => {
        test('should notify on document updates', (done) => {
            let updateCount = 0;
            sync1.onDocumentUpdate((update, origin) => {
                updateCount++;
                expect(update).toBeDefined();
                expect(update.length).toBeGreaterThan(0);
                if (updateCount === 2) {
                    done();
                }
            });
            const graph1 = sync1.getGraph();
            graph1.addNode({
                id: 'node1',
                type: 'WeightedChoice',
                position: { x: 100, y: 100 },
                data: {},
                metadata: {}
            });
            graph1.updateNode('node1', { position: { x: 200, y: 200 } });
        });
    });
});
