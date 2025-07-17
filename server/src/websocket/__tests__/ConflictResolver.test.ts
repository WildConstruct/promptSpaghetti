import { ConflictResolver, ConflictResolverConfig, ConflictOperation, ConflictType, ResolutionStrategy } from '../ConflictResolver';

describe('ConflictResolver', () => {
  let resolver: ConflictResolver;
  let config: ConflictResolverConfig;

  beforeEach(() => {
    config = {
      defaultStrategy: ResolutionStrategy.LAST_WRITER_WINS,
      autoResolveThreshold: 1000, // 1 second for testing
      maxConflictAge: 5000, // 5 seconds for testing
      positionConflictThreshold: 50, // 50 pixels
      enableSemanticMerge: false,
      preserveConflictHistory: true,
      conflictHistoryRetention: 10000 // 10 seconds for testing
    };
    
    resolver = new ConflictResolver(config);
  });

  afterEach(() => {
    resolver.cleanup();
  });

  describe('conflict detection', () => {
    it('should not detect conflict for single operation', () => {
      const operation: ConflictOperation = {
        id: 'op1',
        type: ConflictType.NODE_POSITION,
        nodeId: 'node1',
        oldValue: { x: 0, y: 0 },
        newValue: { x: 100, y: 100 },
        userId: 'user1',
        timestamp: Date.now(),
        documentId: 'doc1'
      };

      const result = resolver.processOperation(operation);
      expect(result).toBeNull();
    });

    it('should detect position conflict', () => {
      const operation1: ConflictOperation = {
        id: 'op1',
        type: ConflictType.NODE_POSITION,
        nodeId: 'node1',
        oldValue: { x: 0, y: 0 },
        newValue: { x: 100, y: 100 },
        userId: 'user1',
        timestamp: Date.now(),
        documentId: 'doc1'
      };

      const operation2: ConflictOperation = {
        id: 'op2',
        type: ConflictType.NODE_POSITION,
        nodeId: 'node1',
        oldValue: { x: 0, y: 0 },
        newValue: { x: 120, y: 120 }, // Close position
        userId: 'user2',
        timestamp: Date.now() + 500, // Within threshold
        documentId: 'doc1'
      };

      resolver.processOperation(operation1);
      const result = resolver.processOperation(operation2);

      expect(result).toBeDefined();
      expect(result?.conflict.type).toBe(ConflictType.NODE_POSITION);
      expect(result?.conflict.operations).toHaveLength(2);
    });

    it('should detect property conflict', () => {
      const operation1: ConflictOperation = {
        id: 'op1',
        type: ConflictType.NODE_PROPERTIES,
        nodeId: 'node1',
        property: 'name',
        oldValue: 'Old Name',
        newValue: 'New Name 1',
        userId: 'user1',
        timestamp: Date.now(),
        documentId: 'doc1'
      };

      const operation2: ConflictOperation = {
        id: 'op2',
        type: ConflictType.NODE_PROPERTIES,
        nodeId: 'node1',
        property: 'name',
        oldValue: 'Old Name',
        newValue: 'New Name 2',
        userId: 'user2',
        timestamp: Date.now() + 500,
        documentId: 'doc1'
      };

      resolver.processOperation(operation1);
      const result = resolver.processOperation(operation2);

      expect(result).toBeDefined();
      expect(result?.conflict.type).toBe(ConflictType.NODE_PROPERTIES);
    });

    it('should not detect conflict for different nodes', () => {
      const operation1: ConflictOperation = {
        id: 'op1',
        type: ConflictType.NODE_POSITION,
        nodeId: 'node1',
        oldValue: { x: 0, y: 0 },
        newValue: { x: 100, y: 100 },
        userId: 'user1',
        timestamp: Date.now(),
        documentId: 'doc1'
      };

      const operation2: ConflictOperation = {
        id: 'op2',
        type: ConflictType.NODE_POSITION,
        nodeId: 'node2', // Different node
        oldValue: { x: 0, y: 0 },
        newValue: { x: 100, y: 100 },
        userId: 'user2',
        timestamp: Date.now() + 500,
        documentId: 'doc1'
      };

      resolver.processOperation(operation1);
      const result = resolver.processOperation(operation2);

      expect(result).toBeNull();
    });

    it('should not detect conflict for same user', () => {
      const operation1: ConflictOperation = {
        id: 'op1',
        type: ConflictType.NODE_POSITION,
        nodeId: 'node1',
        oldValue: { x: 0, y: 0 },
        newValue: { x: 100, y: 100 },
        userId: 'user1',
        timestamp: Date.now(),
        documentId: 'doc1'
      };

      const operation2: ConflictOperation = {
        id: 'op2',
        type: ConflictType.NODE_POSITION,
        nodeId: 'node1',
        oldValue: { x: 100, y: 100 },
        newValue: { x: 200, y: 200 },
        userId: 'user1', // Same user
        timestamp: Date.now() + 500,
        documentId: 'doc1'
      };

      resolver.processOperation(operation1);
      const result = resolver.processOperation(operation2);

      expect(result).toBeNull();
    });
  });

  describe('automatic resolution', () => {
    it('should auto-resolve with last writer wins', () => {
      const operation1: ConflictOperation = {
        id: 'op1',
        type: ConflictType.NODE_PROPERTIES,
        nodeId: 'node1',
        property: 'name',
        oldValue: 'Old',
        newValue: 'First',
        userId: 'user1',
        timestamp: Date.now(),
        documentId: 'doc1'
      };

      const operation2: ConflictOperation = {
        id: 'op2',
        type: ConflictType.NODE_PROPERTIES,
        nodeId: 'node1',
        property: 'name',
        oldValue: 'Old',
        newValue: 'Second',
        userId: 'user2',
        timestamp: Date.now() + 500, // Later timestamp
        documentId: 'doc1'
      };

      resolver.processOperation(operation1);
      const result = resolver.processOperation(operation2);

      expect(result).toBeDefined();
      expect(result?.requiresUserInput).toBe(false);
      expect(result?.resolvedValue).toBe('Second'); // Later operation wins
    });

    it('should auto-resolve position conflicts with offset', () => {
      // Change default strategy to positional offset
      const offsetConfig = { ...config, defaultStrategy: ResolutionStrategy.POSITIONAL_OFFSET };
      const offsetResolver = new ConflictResolver(offsetConfig);

      const operation1: ConflictOperation = {
        id: 'op1',
        type: ConflictType.NODE_POSITION,
        nodeId: 'node1',
        oldValue: { x: 0, y: 0 },
        newValue: { x: 100, y: 100 },
        userId: 'user1',
        timestamp: Date.now(),
        documentId: 'doc1'
      };

      const operation2: ConflictOperation = {
        id: 'op2',
        type: ConflictType.NODE_POSITION,
        nodeId: 'node1',
        oldValue: { x: 0, y: 0 },
        newValue: { x: 110, y: 110 },
        userId: 'user2',
        timestamp: Date.now() + 500,
        documentId: 'doc1'
      };

      offsetResolver.processOperation(operation1);
      const result = offsetResolver.processOperation(operation2);

      expect(result).toBeDefined();
      expect(result?.requiresUserInput).toBe(false);
      expect(result?.operations).toHaveLength(2); // Base + offset operations

      offsetResolver.cleanup();
    });
  });

  describe('manual conflict resolution', () => {
    it('should resolve conflict manually', () => {
      const operation1: ConflictOperation = {
        id: 'op1',
        type: ConflictType.NODE_PROPERTIES,
        nodeId: 'node1',
        property: 'name',
        oldValue: 'Old',
        newValue: 'First',
        userId: 'user1',
        timestamp: Date.now(),
        documentId: 'doc1'
      };

      const operation2: ConflictOperation = {
        id: 'op2',
        type: ConflictType.NODE_PROPERTIES,
        nodeId: 'node1',
        property: 'name',
        oldValue: 'Old',
        newValue: 'Second',
        userId: 'user2',
        timestamp: Date.now() + 500,
        documentId: 'doc1'
      };

      resolver.processOperation(operation1);
      const conflictResult = resolver.processOperation(operation2);
      
      expect(conflictResult).toBeDefined();
      const conflictId = conflictResult!.conflict.id;

      // Manually resolve with first writer wins
      const resolution = resolver.resolveConflict(
        conflictId,
        ResolutionStrategy.FIRST_WRITER_WINS,
        undefined,
        'resolver-user'
      );

      expect(resolution).toBeDefined();
      expect(resolution?.resolvedValue).toBe('First'); // Earlier operation wins
      expect(resolution?.conflict.status).toBe('resolved');
      expect(resolution?.conflict.resolvedBy).toBe('resolver-user');
    });

    it('should resolve conflict with user selection', () => {
      const operation1: ConflictOperation = {
        id: 'op1',
        type: ConflictType.NODE_PROPERTIES,
        nodeId: 'node1',
        property: 'name',
        oldValue: 'Old',
        newValue: 'First',
        userId: 'user1',
        timestamp: Date.now(),
        documentId: 'doc1'
      };

      const operation2: ConflictOperation = {
        id: 'op2',
        type: ConflictType.NODE_PROPERTIES,
        nodeId: 'node1',
        property: 'name',
        oldValue: 'Old',
        newValue: 'Second',
        userId: 'user2',
        timestamp: Date.now() + 500,
        documentId: 'doc1'
      };

      resolver.processOperation(operation1);
      const conflictResult = resolver.processOperation(operation2);
      
      const conflictId = conflictResult!.conflict.id;
      const userSelection = {
        operationId: 'op1',
        value: 'User Custom Value'
      };

      const resolution = resolver.resolveConflict(
        conflictId,
        ResolutionStrategy.USER_RESOLUTION,
        userSelection,
        'resolver-user'
      );

      expect(resolution).toBeDefined();
      expect(resolution?.resolvedValue).toBe('User Custom Value');
    });
  });

  describe('conflict management', () => {
    it('should get pending conflicts for document', () => {
      const operation1: ConflictOperation = {
        id: 'op1',
        type: ConflictType.NODE_PROPERTIES,
        nodeId: 'node1',
        property: 'name',
        oldValue: 'Old',
        newValue: 'First',
        userId: 'user1',
        timestamp: Date.now(),
        documentId: 'doc1'
      };

      const operation2: ConflictOperation = {
        id: 'op2',
        type: ConflictType.NODE_PROPERTIES,
        nodeId: 'node1',
        property: 'name',
        oldValue: 'Old',
        newValue: 'Second',
        userId: 'user2',
        timestamp: Date.now() + 500,
        documentId: 'doc1'
      };

      resolver.processOperation(operation1);
      resolver.processOperation(operation2);

      const conflicts = resolver.getPendingConflicts('doc1');
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].status).toBe('pending');
    });

    it('should clear document conflicts', () => {
      const operation1: ConflictOperation = {
        id: 'op1',
        type: ConflictType.NODE_PROPERTIES,
        nodeId: 'node1',
        property: 'name',
        oldValue: 'Old',
        newValue: 'First',
        userId: 'user1',
        timestamp: Date.now(),
        documentId: 'doc1'
      };

      const operation2: ConflictOperation = {
        id: 'op2',
        type: ConflictType.NODE_PROPERTIES,
        nodeId: 'node1',
        property: 'name',
        oldValue: 'Old',
        newValue: 'Second',
        userId: 'user2',
        timestamp: Date.now() + 500,
        documentId: 'doc1'
      };

      resolver.processOperation(operation1);
      resolver.processOperation(operation2);

      let conflicts = resolver.getPendingConflicts('doc1');
      expect(conflicts).toHaveLength(1);

      resolver.clearDocumentConflicts('doc1');
      conflicts = resolver.getPendingConflicts('doc1');
      expect(conflicts).toHaveLength(0);
    });

    it('should provide conflict statistics', () => {
      const operation1: ConflictOperation = {
        id: 'op1',
        type: ConflictType.NODE_PROPERTIES,
        nodeId: 'node1',
        property: 'name',
        oldValue: 'Old',
        newValue: 'First',
        userId: 'user1',
        timestamp: Date.now(),
        documentId: 'doc1'
      };

      const operation2: ConflictOperation = {
        id: 'op2',
        type: ConflictType.NODE_PROPERTIES,
        nodeId: 'node1',
        property: 'name',
        oldValue: 'Old',
        newValue: 'Second',
        userId: 'user2',
        timestamp: Date.now() + 500,
        documentId: 'doc1'
      };

      resolver.processOperation(operation1);
      const conflictResult = resolver.processOperation(operation2);

      const stats = resolver.getConflictStats('doc1');
      expect(stats.total).toBe(1);
      expect(stats.pending).toBe(1);
      expect(stats.resolved).toBe(0);

      // Resolve the conflict
      resolver.resolveConflict(
        conflictResult!.conflict.id,
        ResolutionStrategy.LAST_WRITER_WINS,
        undefined,
        'user1'
      );

      const updatedStats = resolver.getConflictStats('doc1');
      expect(updatedStats.resolved).toBe(1);
      expect(updatedStats.pending).toBe(0);
    });
  });

  describe('property merging', () => {
    it('should merge object properties', () => {
      const operation1: ConflictOperation = {
        id: 'op1',
        type: ConflictType.NODE_PROPERTIES,
        nodeId: 'node1',
        property: 'data',
        oldValue: { a: 1 },
        newValue: { a: 2, b: 2 },
        userId: 'user1',
        timestamp: Date.now(),
        documentId: 'doc1'
      };

      const operation2: ConflictOperation = {
        id: 'op2',
        type: ConflictType.NODE_PROPERTIES,
        nodeId: 'node1',
        property: 'data',
        oldValue: { a: 1 },
        newValue: { a: 3, c: 3 },
        userId: 'user2',
        timestamp: Date.now() + 500,
        documentId: 'doc1'
      };

      resolver.processOperation(operation1);
      const conflictResult = resolver.processOperation(operation2);

      const resolution = resolver.resolveConflict(
        conflictResult!.conflict.id,
        ResolutionStrategy.MERGE_PROPERTIES,
        undefined,
        'user1'
      );

      expect(resolution?.resolvedValue).toEqual({ a: 3, b: 2, c: 3 });
    });
  });

  describe('event emissions', () => {
    it('should emit conflict detected event', (done) => {
      resolver.on('conflict_detected', (conflict) => {
        expect(conflict.type).toBe(ConflictType.NODE_PROPERTIES);
        expect(conflict.operations).toHaveLength(2);
        done();
      });

      const operation1: ConflictOperation = {
        id: 'op1',
        type: ConflictType.NODE_PROPERTIES,
        nodeId: 'node1',
        property: 'name',
        oldValue: 'Old',
        newValue: 'First',
        userId: 'user1',
        timestamp: Date.now(),
        documentId: 'doc1'
      };

      const operation2: ConflictOperation = {
        id: 'op2',
        type: ConflictType.NODE_PROPERTIES,
        nodeId: 'node1',
        property: 'name',
        oldValue: 'Old',
        newValue: 'Second',
        userId: 'user2',
        timestamp: Date.now() + 500,
        documentId: 'doc1'
      };

      resolver.processOperation(operation1);
      resolver.processOperation(operation2);
    });

    it('should emit conflict auto-resolved event', (done) => {
      resolver.on('conflict_auto_resolved', (resolution) => {
        expect(resolution.resolvedValue).toBe('Second');
        expect(resolution.requiresUserInput).toBe(false);
        done();
      });

      const operation1: ConflictOperation = {
        id: 'op1',
        type: ConflictType.NODE_PROPERTIES,
        nodeId: 'node1',
        property: 'name',
        oldValue: 'Old',
        newValue: 'First',
        userId: 'user1',
        timestamp: Date.now(),
        documentId: 'doc1'
      };

      const operation2: ConflictOperation = {
        id: 'op2',
        type: ConflictType.NODE_PROPERTIES,
        nodeId: 'node1',
        property: 'name',
        oldValue: 'Old',
        newValue: 'Second',
        userId: 'user2',
        timestamp: Date.now() + 500,
        documentId: 'doc1'
      };

      resolver.processOperation(operation1);
      resolver.processOperation(operation2);
    });
  });
});