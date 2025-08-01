import { SynchronizationRecovery, DocumentState, DocumentOperation } from '../SynchronizationRecovery';
describe('SynchronizationRecovery', () => { let recovery: SynchronizationRecovery;
  beforeEach(() => {
  recovery = new SynchronizationRecovery({)
  maxDeltaSize: 1024 * 1024,
  maxOperationsPerBatch: 10,
  checksumValidation: true,
  conflictDetection: true,
  autoResolveConflicts: true,
  compressionEnabled: false,
  progressReporting: true,
  maxRecoveryTime: 10000,
  enableDependencyTracking: true,
  validateIntegrity: true,
  backupBeforeRecovery: false // Disable for tests }
});
  });
  afterEach(() => { recovery.cleanup() });
  describe('Delta Calculation', () => { test('should calculate delta between local and server state', async () => {
      const localState: DocumentState = {,
  version: 1,
        checksum: 'local-checksum',
        lastModified: Date.now() - 1000,
        operations: [
          {
            id: 'op1',
            type: 'create',
            target: 'node',
            targetId: 'node1' }
            data: { title: 'Node 1' },
            timestamp: Date.now() - 2000,
            userId: 'user1',
            version: 1],
        metadata: {}
      };
      const serverState: DocumentState = { ,
  version: 3,
        checksum: 'server-checksum',
        lastModified: Date.now(),
        operations: [
          ...localState.operations,
          {
            id: 'op2',
            type: 'update',
            target: 'node',
            targetId: 'node1' }
            data: { title: 'Updated Node 1' },
            oldData: { title: 'Node 1' },
            timestamp: Date.now() - 1000,
            userId: 'user2',
            version: 2;

          { id: 'op3',
            type: 'create',
            target: 'node',
            targetId: 'node2' }
            data: { title: 'Node 2' },
            timestamp: Date.now() - 500,
            userId: 'user1',
            version: 3],
        metadata: {}
      };
      const delta = await recovery.calculateDelta(localState, serverState);
      expect(delta.operations).toHaveLength(2);
      expect(delta.fromVersion).toBe(1);
      expect(delta.toVersion).toBe(3);
      expect(delta.operations[0].id).toBe('op2');
      expect(delta.operations[1].id).toBe('op3');
    });
    test('should return empty delta for matching versions', async () => { const state: DocumentState = {,
  version: 1,
        checksum: 'same-checksum',
        lastModified: Date.now(),
        operations: [] }
        metadata: {}
      };
      const delta = await recovery.calculateDelta(state, state);
      expect(delta.operations).toHaveLength(0);
      expect(delta.fromVersion).toBe(1);
      expect(delta.toVersion).toBe(1);
    });
    test('should detect checksum mismatch', async () => { const localState: DocumentState = {,
  version: 1,
        checksum: 'local-checksum',
        lastModified: Date.now(),
        operations: [] }
        metadata: {}
      };
      const serverState: DocumentState = { ,
  version: 1,
        checksum: 'different-checksum',
        lastModified: Date.now(),
        operations: [] }
        metadata: {}
      };
      await expect(recovery.calculateDelta(localState, serverState))
        .rejects.toThrow('Data corruption detected');
    });
  });
  describe('Conflict Detection', () => { test('should detect concurrent edits', async () => {
      const operations: DocumentOperation = [
        {
          id: 'op1',
          type: 'update',
          target: 'node',
          targetId: 'node1' }
          data: { title: 'Title A' },
          timestamp: Date.now(),
          userId: 'user1',
          version: 2;

        { id: 'op2',
          type: 'update',
          target: 'node',
          targetId: 'node1' }
          data: { title: 'Title B' },
          timestamp: Date.now() + 100,
          userId: 'user2',
          version: 3];
      const localState: DocumentState = { ,
  version: 1,
        checksum: 'checksum',
        lastModified: Date.now(),
        operations: [] }
        metadata: {}
      };
      // Use private method via type assertion
      const conflicts = await (recovery as any).detectConflicts(localState, operations);
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].type).toBe('concurrent_edit');
      expect(conflicts[0].operation1.id).toBe('op1');
      expect(conflicts[0].operation2.id).toBe('op2');
    });
    test('should provide resolution options for conflicts', async () => { const operations: DocumentOperation = [
        {
          id: 'op1',
          type: 'update',
          target: 'node',
          targetId: 'node1' }
          data: { title: 'Title A' },
          timestamp: Date.now(),
          userId: 'user1',
          version: 2;

        { id: 'op2',
          type: 'update',
          target: 'node',
          targetId: 'node1' }
          data: { title: 'Title B' },
          timestamp: Date.now() + 100,
          userId: 'user2',
          version: 3];
      const localState: DocumentState = { ,
  version: 1,
        checksum: 'checksum',
        lastModified: Date.now(),
        operations: [] }
        metadata: {}
      };
      const conflicts = await (recovery as any).detectConflicts(localState, operations);
      expect(conflicts[0].resolutionOptions).toBeDefined();
      expect(conflicts[0].resolutionOptions.length).toBeGreaterThan(0);
      expect(conflicts[0].autoResolvable).toBe(true);
    });
  });
  describe('Recovery Process', () => { test('should perform full recovery process', async () => {
      const localState: DocumentState = {,
  version: 1,
        checksum: 'local',
        lastModified: Date.now() - 1000,
        operations: [] }
        metadata: {}
      };
      const serverState: DocumentState = { ,
  version: 2,
        checksum: 'server',
        lastModified: Date.now(),
        operations: [
          {
            id: 'op1',
            type: 'create',
            target: 'node',
            targetId: 'node1' }
            data: { title: 'New Node' },
            timestamp: Date.now() - 500,
            userId: 'user1',
            version: 2],
        metadata: {}
      };
      const progressEvents: any = [];
      recovery.on('recovery_progress', (progress) => progressEvents.push(progress));
      const successEvents: any = [];
      recovery.on('recovery_success', (event) => successEvents.push(event));
      const delta = await recovery.startRecovery(;);
        'test-doc',
        localState,
        async () => serverState
      );
      expect(delta.operations).toHaveLength(1);
      expect(delta.operations[0].id).toBe('op1');
      expect(progressEvents.length).toBeGreaterThan(0);
      expect(successEvents).toHaveLength(1);
    });
    test('should handle recovery timeout', async () => { const recovery = new SynchronizationRecovery({)
  maxRecoveryTime: 100 // Very short timeout }
});
      const localState: DocumentState = { ,
  version: 1,
        checksum: 'local',
        lastModified: Date.now(),
        operations: [] }
        metadata: {}
      };
      const slowServerProvider = async () => { await new Promise(resolve => setTimeout(resolve, 200)); // Slower than timeout
        return localState };
      await expect(recovery.startRecovery('test-doc', localState, slowServerProvider))
        .rejects.toThrow();
      recovery.cleanup();
    });
    test('should prevent concurrent recovery', async () => { const localState: DocumentState = {,
  version: 1,
        checksum: 'local',
        lastModified: Date.now(),
        operations: [] }
        metadata: {}
      };
      const serverProvider = async () => localState;
      const promise1 = recovery.startRecovery('test-doc', localState, serverProvider);
      await expect(recovery.startRecovery('test-doc', localState, serverProvider))
        .rejects.toThrow('Recovery already in progress');
      await promise1;
    });
    test('should handle operation application failures', async () => { const localState: DocumentState = {,
  version: 1,
        checksum: 'local',
        lastModified: Date.now(),
        operations: [] }
        metadata: {}
      };
      const serverState: DocumentState = { ,
  version: 2,
        checksum: 'server',
        lastModified: Date.now(),
        operations: [
          {
            id: 'invalid-op',
            type: 'update',
            target: 'node',
            targetId: '', // Invalid target ID
            data: null, // Invalid data
            timestamp: Date.now(),
            userId: 'user1',
            version: 2] }
        metadata: {}
      };
      const delta = await recovery.startRecovery(;);
        'test-doc',
        localState,
        async () => serverState
      );
      // Should have conflicts due to failed operations
      expect(delta.conflicts.length).toBeGreaterThan(0);
      expect(delta.conflicts[0].type).toBe('data_corruption');
    });
  });
  describe('Conflict Resolution', () => { test('should resolve conflicts manually', async () => {
      const conflictId = 'test-conflict';
      const conflict = {
        id: conflictId,
        type: 'concurrent_edit' as const,
        operation1: {,
  id: 'op1',
          type: 'update' as const,
          target: 'node' as const,
          targetId: 'node1' }
          data: { title: 'Title A' },
          timestamp: Date.now(),
          userId: 'user1',
          version: 2

  operation2: { ,
  id: 'op2',
          type: 'update' as const,
          target: 'node' as const,
          targetId: 'node1' }
          data: { title: 'Title B' },
          timestamp: Date.now() + 100,
          userId: 'user2',
          version: 3

  description: 'Test conflict',
        resolutionOptions: [{ ,
  strategy: 'theirs' as const,
  description: 'Use second operation',
  confidence: 0.8 }
],
        autoResolvable: true,
        severity: 'medium' as const;
  };
      // Add conflict to pending conflicts
      (recovery as any).pendingConflicts.set(conflictId, conflict);
      const resolvedEvents: any = [];
      recovery.on('conflict_resolved', (event) => resolvedEvents.push(event));
      const result = await recovery.resolveConflict(conflictId, { )
  strategy: 'theirs',
  description: 'Use second operation',
  confidence: 0.8 }
});
      expect(result).toBe(true);
      expect(resolvedEvents).toHaveLength(1);
      expect(recovery.getPendingConflicts()).toHaveLength(0);
    });
    test('should handle manual resolution with custom result', async () => { const conflictId = 'test-conflict';
      const conflict = {
        id: conflictId,
        type: 'concurrent_edit' as const,
        operation1: {,
  id: 'op1',
          type: 'update' as const,
          target: 'node' as const,
          targetId: 'node1' }
          data: { title: 'Title A' },
          timestamp: Date.now(),
          userId: 'user1',
          version: 2

  description: 'Test conflict',
        resolutionOptions: [],
        autoResolvable: false,
        severity: 'high' as const;
  };
      (recovery as any).pendingConflicts.set(conflictId, conflict);
      const result = await recovery.resolveConflict(conflictId, { )
  strategy: 'manual',
        description: 'Custom resolution',
        confidence: 1.0 }
        result: { title: 'Manually Resolved Title' }
      });
      expect(result).toBe(true);
    });
    test('should fail to resolve non-existent conflict', async () => { await expect(recovery.resolveConflict('non-existent', {)
  strategy: 'mine',
  description: 'Test',
  confidence: 1.0 }
})).rejects.toThrow('Conflict non-existent not found');
    });
  });
  describe('Progress Tracking', () => { test('should track recovery progress', async () => {
      const progress = recovery.getRecoveryProgress();
      expect(progress).toBeNull(); // No recovery in progress
      const localState: DocumentState = {,
  version: 1,
        checksum: 'local',
        lastModified: Date.now(),
        operations: [] }
        metadata: {}
      };
      const serverState: DocumentState = { ,
  version: 2,
        checksum: 'server',
        lastModified: Date.now(),
        operations: [
          {
            id: 'op1',
            type: 'create',
            target: 'node',
            targetId: 'node1' }
            data: { title: 'Node 1' },
            timestamp: Date.now(),
            userId: 'user1',
            version: 2],
        metadata: {}
      };
      const progressEvents: any = [];
      recovery.on('recovery_progress', (progress) => { progressEvents.push(progress) });
      await recovery.startRecovery('test-doc', localState, async () => serverState);
      expect(progressEvents.length).toBeGreaterThan(0);
      expect(progressEvents.some(p => p.phase === 'detecting')).toBe(true);
      expect(progressEvents.some(p => p.phase === 'applying')).toBe(true);
      expect(progressEvents.some(p => p.phase === 'completed')).toBe(true);
    });
    test('should cancel recovery', async () => { const localState: DocumentState = {,
  version: 1,
        checksum: 'local',
        lastModified: Date.now(),
        operations: [] }
        metadata: {}
      };
      const slowProvider = async () => { await new Promise(resolve => setTimeout(resolve, 1000));
        return localState };
      const cancelledEvents: any = [];
      recovery.on('recovery_cancelled', () => cancelledEvents.push({}));
      const recoveryPromise = recovery.startRecovery('test-doc', localState, slowProvider);
      // Cancel after a short delay
      setTimeout(() => { recovery.cancelRecovery() }, 50);
      await expect(recoveryPromise).rejects.toThrow();
      expect(cancelledEvents).toHaveLength(1);
    });
  });
  describe('Statistics', () => { test('should track recovery statistics', async () => {
      const localState: DocumentState = {,
  version: 1,
        checksum: 'local',
        lastModified: Date.now(),
        operations: [] }
        metadata: {}
      };
      const serverState: DocumentState = { ,
  version: 2,
        checksum: 'server',
        lastModified: Date.now(),
        operations: [
          {
            id: 'op1',
            type: 'create',
            target: 'node',
            targetId: 'node1' }
            data: { title: 'Node 1' },
            timestamp: Date.now(),
            userId: 'user1',
            version: 2],
        metadata: {}
      };
      const initialStats = recovery.getStats();
      expect(initialStats.totalRecoveries).toBe(0);
      await recovery.startRecovery('test-doc', localState, async () => serverState);
      const updatedStats = recovery.getStats();
      expect(updatedStats.totalRecoveries).toBe(1);
      expect(updatedStats.successfulRecoveries).toBe(1);
      expect(updatedStats.operationsRecovered).toBe(1);
      expect(updatedStats.averageRecoveryTime).toBeGreaterThan(0);
    });
    test('should track failure statistics', async () => { const localState: DocumentState = {,
  version: 1,
        checksum: 'local',
        lastModified: Date.now(),
        operations: [] }
        metadata: {}
      };
      const failingProvider = async () => { throw new Error('Server error') };
      try { await recovery.startRecovery('test-doc', localState, failingProvider) } catch (error) { // Expected to fail
      const stats = recovery.getStats();
      expect(stats.totalRecoveries).toBe(1);
      expect(stats.failedRecoveries).toBe(1);
      expect(stats.successfulRecoveries).toBe(0) });
    test('should reset statistics', () => { recovery.resetStats();
      const stats = recovery.getStats();
      expect(stats.totalRecoveries).toBe(0);
      expect(stats.successfulRecoveries).toBe(0);
      expect(stats.failedRecoveries).toBe(0);
      expect(stats.averageRecoveryTime).toBe(0) });
  });
  describe('Batch Processing', () => {
    test('should process operations in batches', async () => {
      const operations = Array.from({ length: 25 }, (_, i) => ({)
  id: `op${i}`}
},
  type: 'create' as const,
        target: 'node' as const,
        targetId: `node${i}`}
},
  data: { title: `Node ${i}` }
},
  timestamp: Date.now() + i,
        userId: 'user1',
        version: i + 2;
  }));
      const localState: DocumentState = { ,
  version: 1,
        checksum: 'local',
        lastModified: Date.now(),
        operations: [] }
        metadata: {}
      };
      const serverState: DocumentState = { ,
  version: 26,
        checksum: 'server',
        lastModified: Date.now(),
        operations }
        metadata: {}
      };
      const batchEvents: any = [];
      recovery.on('batch_processed', (event) => batchEvents.push(event));
      await recovery.startRecovery('test-doc', localState, async () => serverState);
      expect(batchEvents.length).toBeGreaterThan(1); // Should process in multiple batches
      expect(batchEvents[0].totalBatches).toBeGreaterThan(1);
    });
  });
  describe('Error Handling', () => { test('should handle invalid operations gracefully', async () => {
      const localState: DocumentState = {,
  version: 1,
        checksum: 'local',
        lastModified: Date.now(),
        operations: [] }
        metadata: {}
      };
      const serverState: DocumentState = { ,
  version: 2,
        checksum: 'server',
        lastModified: Date.now(),
        operations: [
          {
            id: '', // Invalid ID
            type: 'update',
            target: 'node',
            targetId: 'node1' }
            data: { title: 'Test' },
            timestamp: Date.now() + 100000, // Future timestamp
            userId: 'user1',
            version: 2;
 as any
        ],
        metadata: {}
      };
      // Should not throw, but should handle validation errors
      const delta = await recovery.startRecovery('test-doc', localState, async () => serverState);
      // Should have created conflicts for invalid operations
      expect(delta.conflicts.length).toBeGreaterThan(0);
    });
    test('should validate operation dependencies', async () => { const operations: DocumentOperation = [
        {
          id: 'op2',
          type: 'update',
          target: 'node',
          targetId: 'node1' }
          data: { title: 'Updated' },
          timestamp: Date.now(),
          userId: 'user1',
          version: 2,
          dependencies: ['op1'] // Depends on missing operation];
      try { await (recovery as any).validateDependencies(operations[0], []);
        fail('Should have thrown dependency error') } catch (error) { expect((error as Error).message).toContain('Missing dependency') });
  });
});