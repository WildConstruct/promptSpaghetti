/**
 * Epic 23: Conflict Resolution Engine Test Suite
 * 
 * Comprehensive tests for the conflict resolution system, covering
 * conflict detection, resolution strategies, and rollback mechanisms.
 * 
 * Task: E23-1753115279513-6E9F4C - Implement conflict resolution & rollback logic
 */

import { ConflictResolutionEngine, ResolutionStrategy, ConflictType, ConflictSeverity } from '../ConflictResolutionEngine';
import { EditSession, CursorPosition, SelectionRange, ConflictMarker } from '../../database/epic23-workspace-models';

describe('ConflictResolutionEngine', () => {
  let engine: ConflictResolutionEngine;
  
  beforeEach(() => {
    engine = new ConflictResolutionEngine();
  });

  afterEach(() => {
    engine.clearHistory();
  });

  // =============================================================================
  // CONFLICT DETECTION TESTS
  // =============================================================================

  describe('Conflict Detection', () => {
    it('should detect no conflicts with single session', async () => {
      const sessions: EditSession[] = [{
        id: 'session1',
        resource_id: 'resource1',
        user_id: 'user1',
        workspace_id: 'workspace1',
        session_info: {
          started_at: new Date(),
          last_activity_at: new Date(),
          expires_at: new Date(Date.now() + 3600000),
          client_id: 'client1',
          user_agent: 'test-browser'

        editing_state: {
          editing_mode: 'edit',
          is_active: true,
          has_unsaved_changes: false

        collaboration_metadata: {
          priority_level: 1,
          edit_permissions: [],
          can_force_save: false,
          auto_save_interval: 5000

];

      const conflicts = await engine.detectConflicts('resource1', sessions);
      expect(conflicts).toHaveLength(0);
    });

    it('should detect cursor conflicts', async () => {
      const now = new Date();
      const cursorPosition: CursorPosition = {
        user_id: 'user1',
        resource_id: 'resource1',
        position: { node_id: 'node1', line: 1, column: 10 },
        timestamp: now,
        is_typing: true
      };

      const sessions: EditSession[] = [
        {
          id: 'session1',
          resource_id: 'resource1',
          user_id: 'user1',
          workspace_id: 'workspace1',
          session_info: {
            started_at: new Date(),
            last_activity_at: now,
            expires_at: new Date(Date.now() + 3600000),
            client_id: 'client1',
            user_agent: 'test-browser'

          editing_state: {
            current_cursor_position: cursorPosition,
            editing_mode: 'edit',
            is_active: true,
            has_unsaved_changes: false

          collaboration_metadata: {
            priority_level: 1,
            edit_permissions: [],
            can_force_save: false,
            auto_save_interval: 5000


        {
          id: 'session2',
          resource_id: 'resource1',
          user_id: 'user2',
          workspace_id: 'workspace1',
          session_info: {
            started_at: new Date(),
            last_activity_at: new Date(now.getTime() + 1000),
            expires_at: new Date(Date.now() + 3600000),
            client_id: 'client2',
            user_agent: 'test-browser'

          editing_state: {
            current_cursor_position: {
              ...cursorPosition,
              user_id: 'user2',
              timestamp: new Date(now.getTime() + 2000) // Same position, different timestamp

            editing_mode: 'edit',
            is_active: true,
            has_unsaved_changes: false

          collaboration_metadata: {
            priority_level: 1,
            edit_permissions: [],
            can_force_save: false,
            auto_save_interval: 5000


      ];

      const conflicts = await engine.detectConflicts('resource1', sessions);
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].conflict_type).toBe(ConflictType.CURSOR);
    });

    it('should detect selection conflicts', async () => {
      const selectionRange: SelectionRange = {
        user_id: 'user1',
        resource_id: 'resource1',
        start: { node_id: 'node1', line: 1, column: 5 },
        end: { node_id: 'node1', line: 1, column: 15 },
        selection_type: 'text',
        timestamp: new Date()
      };

      const sessions: EditSession[] = [
        {
          id: 'session1',
          resource_id: 'resource1',
          user_id: 'user1',
          workspace_id: 'workspace1',
          session_info: {
            started_at: new Date(),
            last_activity_at: new Date(),
            expires_at: new Date(Date.now() + 3600000),
            client_id: 'client1',
            user_agent: 'test-browser'

          editing_state: {
            current_selection: selectionRange,
            editing_mode: 'edit',
            is_active: true,
            has_unsaved_changes: false

          collaboration_metadata: {
            priority_level: 1,
            edit_permissions: [],
            can_force_save: false,
            auto_save_interval: 5000


        {
          id: 'session2',
          resource_id: 'resource1',
          user_id: 'user2',
          workspace_id: 'workspace1',
          session_info: {
            started_at: new Date(),
            last_activity_at: new Date(),
            expires_at: new Date(Date.now() + 3600000),
            client_id: 'client2',
            user_agent: 'test-browser'

          editing_state: {
            current_selection: {
              ...selectionRange,
              user_id: 'user2' // Overlapping selection

            editing_mode: 'edit',
            is_active: true,
            has_unsaved_changes: false

          collaboration_metadata: {
            priority_level: 1,
            edit_permissions: [],
            can_force_save: false,
            auto_save_interval: 5000


      ];

      const conflicts = await engine.detectConflicts('resource1', sessions);
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].conflict_type).toBe(ConflictType.SELECTION);
    });
  });

  // =============================================================================
  // RESOLUTION STRATEGY TESTS
  // =============================================================================

  describe('Resolution Strategies', () => {
    let mockConflictContext: any;

    beforeEach(() => {
      mockConflictContext = {
        resource_id: 'resource1',
        workspace_id: 'workspace1',
        conflicting_sessions: [
          {
            id: 'session1',
            user_id: 'user1',
            session_info: { last_activity_at: new Date(2023, 0, 1, 10, 0) }

          {
            id: 'session2',
            user_id: 'user2',
            session_info: { last_activity_at: new Date(2023, 0, 1, 10, 5) }

        ],
        base_version: { content: 'base content' },
        local_version: { content: 'local changes' },
        remote_version: { content: 'remote changes' },
        conflict_location: { path: 'root' },
        timestamp: new Date(),
        priority_levels: new Map([['user1', 1], ['user2', 1]])
      };

      // Mock the active conflicts
      (engine as any).activeConflicts.set('resource1', mockConflictContext);
    });

    it('should resolve with last writer wins strategy', async () => {
      const result = await engine.resolveConflicts('resource1', ResolutionStrategy.LAST_WRITER_WINS);

      expect(result.success).toBe(true);
      expect(result.resolution_strategy).toBe(ResolutionStrategy.LAST_WRITER_WINS);
      expect(result.metadata.confidence_score).toBe(0.8);
      expect(result.warnings).toContain('Resolved using last writer wins. Winner: user2');
    });

    it('should attempt operational transform resolution', async () => {
      const result = await engine.resolveConflicts('resource1', ResolutionStrategy.OPERATIONAL_TRANSFORM);

      expect(result.resolution_strategy).toBe(ResolutionStrategy.OPERATIONAL_TRANSFORM);
      // Result success depends on the complexity of the mock - for simple cases, it should succeed
      expect(result.metadata.resolution_time_ms).toBeGreaterThan(0);
    });

    it('should perform three-way merge', async () => {
      const result = await engine.resolveConflicts('resource1', ResolutionStrategy.THREE_WAY_MERGE);

      expect(result.resolution_strategy).toBe(ResolutionStrategy.THREE_WAY_MERGE);
      expect(result.metadata.resolved_by).toBe('system');
    });

    it('should fallback through auto-merge strategies', async () => {
      const result = await engine.resolveConflicts('resource1', ResolutionStrategy.AUTO_MERGE);

      expect(result.resolution_strategy).toBe(ResolutionStrategy.AUTO_MERGE);
      expect(result.success).toBe(true); // Should eventually succeed with fallback
    });

    it('should require manual resolution data', async () => {
      const result = await engine.resolveConflicts('resource1', ResolutionStrategy.MANUAL_RESOLUTION);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Manual resolution data required');
    });

    it('should accept manual resolution with data', async () => {
      const manualResolution = {
        resolved_content: { content: 'manually resolved content' }
      };

      const result = await engine.resolveConflicts(
        'resource1',
        ResolutionStrategy.MANUAL_RESOLUTION,
        manualResolution
      );

      expect(result.success).toBe(true);
      expect(result.metadata.confidence_score).toBe(1.0);
      expect(result.metadata.resolved_by).toBe('user');
    });

    it('should handle rollback strategy', async () => {
      // First create a rollback point
      const rollbackId = engine.createRollbackPoint('resource1', { content: 'rollback content' });

      const result = await engine.resolveConflicts('resource1', ResolutionStrategy.ROLLBACK);

      expect(result.success).toBe(true);
      expect(result.resolution_strategy).toBe(ResolutionStrategy.ROLLBACK);
      expect(result.rollback_point).toBe('latest');
    });

    it('should fail rollback without rollback points', async () => {
      const result = await engine.resolveConflicts('resource1', ResolutionStrategy.ROLLBACK);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('No rollback points available');
    });
  });

  // =============================================================================
  // OPERATIONAL TRANSFORM TESTS
  // =============================================================================

  describe('Operational Transform', () => {
    it('should transform insert operations correctly', async () => {
      const operations = [
        {
          id: 'op1',
          type: 'insert' as const,
          position: 10,
          content: 'hello',
          length: 5,
          user_id: 'user1',
          timestamp: new Date(2023, 0, 1, 10, 0),
          session_id: 'session1'

        {
          id: 'op2',
          type: 'insert' as const,
          position: 5,
          content: 'world',
          length: 5,
          user_id: 'user2',
          timestamp: new Date(2023, 0, 1, 10, 1),
          session_id: 'session2'

      ];

      const transform = await (engine as any).applyOperationalTransform(operations);

      expect(transform.operations).toHaveLength(2);
      expect(transform.transformed_operations).toHaveLength(2);
      expect(transform.transformed_operations[1].position).toBe(15); // Adjusted for first insert
    });

    it('should handle conflicting operations', async () => {
      const operations = [
        {
          id: 'op1',
          type: 'replace' as const,
          position: 10,
          content: 'change1',
          length: 7,
          user_id: 'user1',
          timestamp: new Date(2023, 0, 1, 10, 0),
          session_id: 'session1'

        {
          id: 'op2',
          type: 'replace' as const,
          position: 10, // Same position - conflict!
          content: 'change2',
          length: 7,
          user_id: 'user2',
          timestamp: new Date(2023, 0, 1, 10, 0, 500), // Very close timestamp
          session_id: 'session2'

      ];

      const transform = await (engine as any).applyOperationalTransform(operations);

      expect(transform.conflicts_detected).toHaveLength(1);
      expect(transform.conflicts_detected[0].conflict_type).toBe(ConflictType.CONTENT);
    });
  });

  // =============================================================================
  // ROLLBACK SYSTEM TESTS
  // =============================================================================

  describe('Rollback System', () => {
    it('should create rollback points', () => {
      const content = { data: 'test content', timestamp: new Date() };
      const rollbackId = engine.createRollbackPoint('resource1', content, 'Test checkpoint');

      expect(rollbackId).toBeTruthy();
      expect(rollbackId).toMatch(/^rollback_\d+_\w+$/);

      const rollbackPoints = engine.getRollbackPoints('resource1');
      expect(rollbackPoints).toHaveLength(1);
      expect(rollbackPoints[0].content).toEqual(content);
      expect(rollbackPoints[0].label).toBe('Test checkpoint');
    });

    it('should perform rollback to latest point', () => {
      const content1 = { data: 'content 1' };
      const content2 = { data: 'content 2' };

      engine.createRollbackPoint('resource1', content1);
      const rollbackId2 = engine.createRollbackPoint('resource1', content2);

      const rolledBackContent = engine.performRollback('resource1');

      expect(rolledBackContent).toEqual(content2);
    });

    it('should perform rollback to specific point', () => {
      const content1 = { data: 'content 1' };
      const content2 = { data: 'content 2' };

      const rollbackId1 = engine.createRollbackPoint('resource1', content1);
      engine.createRollbackPoint('resource1', content2);

      const rolledBackContent = engine.performRollback('resource1', rollbackId1);

      expect(rolledBackContent).toEqual(content1);
    });

    it('should limit rollback points to maximum', () => {
      // Create more than the maximum (10) rollback points
      for (let i = 1; i <= 15; i++) {
        engine.createRollbackPoint('resource1', { data: `content ${i}` });


      const rollbackPoints = engine.getRollbackPoints('resource1');
      expect(rollbackPoints).toHaveLength(10);
      
      // Should have the latest 10 points
      expect(rollbackPoints[rollbackPoints.length - 1].content.data).toBe('content 15');
      expect(rollbackPoints[0].content.data).toBe('content 6');
    });

    it('should return null for rollback without points', () => {
      const result = engine.performRollback('nonexistent_resource');
      expect(result).toBeNull();
    });
  });

  // =============================================================================
  // STATISTICS AND MONITORING TESTS
  // =============================================================================

  describe('Statistics and Monitoring', () => {
    it('should track conflict statistics', async () => {
      const mockConflictContext = {
        resource_id: 'resource1',
        workspace_id: 'workspace1',
        conflicting_sessions: [{
          id: 'session1',
          user_id: 'user1',
          session_info: { last_activity_at: new Date() }
],
        base_version: null,
        local_version: null,
        remote_version: null,
        conflict_location: { path: 'root' },
        timestamp: new Date(),
        priority_levels: new Map()
      };

      (engine as any).activeConflicts.set('resource1', mockConflictContext);

      // Resolve some conflicts
      await engine.resolveConflicts('resource1', ResolutionStrategy.LAST_WRITER_WINS);
      await engine.resolveConflicts('resource1', ResolutionStrategy.AUTO_MERGE);

      const stats = engine.getConflictStatistics('resource1');

      expect(stats.total_conflicts).toBeGreaterThan(0);
      expect(stats.resolved_conflicts).toBeGreaterThan(0);
      expect(stats.resolution_strategies[ResolutionStrategy.LAST_WRITER_WINS]).toBe(1);
    });

    it('should provide global statistics', async () => {
      // Add conflicts for multiple resources
      const contexts = ['resource1', 'resource2'].map(id => ({
        resource_id: id,
        workspace_id: 'workspace1',
        conflicting_sessions: [{ id: 'session1', user_id: 'user1', session_info: { last_activity_at: new Date() } }],
        base_version: null,
        local_version: null,
        remote_version: null,
        conflict_location: { path: 'root' },
        timestamp: new Date(),
        priority_levels: new Map()
      }));

      contexts.forEach(ctx => (engine as any).activeConflicts.set(ctx.resource_id, ctx));

      // Resolve conflicts
      await engine.resolveConflicts('resource1', ResolutionStrategy.OPERATIONAL_TRANSFORM);
      await engine.resolveConflicts('resource2', ResolutionStrategy.THREE_WAY_MERGE);

      const globalStats = engine.getConflictStatistics();

      expect(globalStats.total_conflicts).toBe(2);
      expect(globalStats.active_conflicts).toBe(0); // Should be resolved
      expect(globalStats.resolution_strategies[ResolutionStrategy.OPERATIONAL_TRANSFORM]).toBe(1);
      expect(globalStats.resolution_strategies[ResolutionStrategy.THREE_WAY_MERGE]).toBe(1);
    });

    it('should calculate average resolution time', async () => {
      const mockContext = {
        resource_id: 'resource1',
        workspace_id: 'workspace1',
        conflicting_sessions: [{ id: 'session1', user_id: 'user1', session_info: { last_activity_at: new Date() } }],
        base_version: null,
        local_version: null,
        remote_version: null,
        conflict_location: { path: 'root' },
        timestamp: new Date(),
        priority_levels: new Map()
      };

      (engine as any).activeConflicts.set('resource1', mockContext);

      const result = await engine.resolveConflicts('resource1', ResolutionStrategy.LAST_WRITER_WINS);
      expect(result.metadata.resolution_time_ms).toBeGreaterThan(0);

      const stats = engine.getConflictStatistics('resource1');
      expect(stats.average_resolution_time).toBeGreaterThan(0);
    });
  });

  // =============================================================================
  // ERROR HANDLING TESTS
  // =============================================================================

  describe('Error Handling', () => {
    it('should handle resolution without active conflicts', async () => {
      const result = await engine.resolveConflicts('nonexistent_resource', ResolutionStrategy.AUTO_MERGE);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('No active conflicts found for resource');
    });

    it('should handle unsupported resolution strategy', async () => {
      const mockContext = {
        resource_id: 'resource1',
        workspace_id: 'workspace1',
        conflicting_sessions: [],
        base_version: null,
        local_version: null,
        remote_version: null,
        conflict_location: { path: 'root' },
        timestamp: new Date(),
        priority_levels: new Map()
      };

      (engine as any).activeConflicts.set('resource1', mockContext);

      const result = await engine.resolveConflicts('resource1', 'INVALID_STRATEGY' as any);

      expect(result.success).toBe(false);
      expect(result.errors?.[0]).toContain('Unsupported resolution strategy');
    });

    it('should clean up resources properly', () => {
      // Add some test data
      engine.createRollbackPoint('resource1', { data: 'test' });
      (engine as any).activeConflicts.set('resource1', {});
      (engine as any).resolutionHistory.set('resource1', []);

      // Clear everything
      engine.clearHistory();

      expect(engine.getRollbackPoints('resource1')).toHaveLength(0);
      expect((engine as any).activeConflicts.size).toBe(0);
      expect((engine as any).resolutionHistory.size).toBe(0);
    });

    it('should clear specific resource history', () => {
      // Add data for multiple resources
      engine.createRollbackPoint('resource1', { data: 'test1' });
      engine.createRollbackPoint('resource2', { data: 'test2' });

      // Clear only resource1
      engine.clearHistory('resource1');

      expect(engine.getRollbackPoints('resource1')).toHaveLength(0);
      expect(engine.getRollbackPoints('resource2')).toHaveLength(1);
    });
  });

  // =============================================================================
  // INTEGRATION TESTS
  // =============================================================================

  describe('Integration Tests', () => {
    it('should handle complete conflict resolution workflow', async () => {
      const sessions: EditSession[] = [
        {
          id: 'session1',
          resource_id: 'resource1',
          user_id: 'user1',
          workspace_id: 'workspace1',
          session_info: {
            started_at: new Date(),
            last_activity_at: new Date(),
            expires_at: new Date(Date.now() + 3600000),
            client_id: 'client1',
            user_agent: 'test-browser'

          editing_state: {
            editing_mode: 'edit',
            is_active: true,
            has_unsaved_changes: true

          collaboration_metadata: {
            priority_level: 1,
            edit_permissions: [],
            can_force_save: false,
            auto_save_interval: 5000


        {
          id: 'session2',
          resource_id: 'resource1',
          user_id: 'user2',
          workspace_id: 'workspace1',
          session_info: {
            started_at: new Date(),
            last_activity_at: new Date(),
            expires_at: new Date(Date.now() + 3600000),
            client_id: 'client2',
            user_agent: 'test-browser'

          editing_state: {
            editing_mode: 'edit',
            is_active: true,
            has_unsaved_changes: true

          collaboration_metadata: {
            priority_level: 2, // Higher priority
            edit_permissions: [],
            can_force_save: false,
            auto_save_interval: 5000


      ];

      // 1. Create rollback point
      const rollbackId = engine.createRollbackPoint('resource1', { content: 'original content' });
      expect(rollbackId).toBeTruthy();

      // 2. Detect conflicts
      const conflicts = await engine.detectConflicts('resource1', sessions);

      // 3. If conflicts detected, resolve them
      if (conflicts.length > 0) {
        // Set up context for resolution
        const context = {
          resource_id: 'resource1',
          workspace_id: 'workspace1',
          conflicting_sessions: sessions,
          base_version: { content: 'base' },
          local_version: { content: 'local changes' },
          remote_version: { content: 'remote changes' },
          conflict_location: { path: 'root' },
          timestamp: new Date(),
          priority_levels: new Map([['user1', 1], ['user2', 2]])
        };

        (engine as any).activeConflicts.set('resource1', context);

        const resolution = await engine.resolveConflicts('resource1', ResolutionStrategy.AUTO_MERGE);
        expect(resolution.success).toBe(true);


      // 4. Verify statistics
      const stats = engine.getConflictStatistics('resource1');
      expect(stats.total_conflicts).toBeGreaterThanOrEqual(0);
      
      // 5. Verify rollback points are maintained
      const rollbackPoints = engine.getRollbackPoints('resource1');
      expect(rollbackPoints.length).toBeGreaterThan(0);
    });

    it('should emit events for conflict lifecycle', (done) => {
      let eventsReceived = 0;
      const expectedEvents = ['conflicts_detected', 'conflict_resolved'];

      const eventHandler = (eventName: string) => {
        expect(expectedEvents).toContain(eventName);
        eventsReceived++;
        
        if (eventsReceived === expectedEvents.length) {
          done();

      };

      engine.on('conflicts_detected', () => eventHandler('conflicts_detected'));
      engine.on('conflict_resolved', () => eventHandler('conflict_resolved'));

      // Simulate conflict detection and resolution
      const mockContext = {
        resource_id: 'resource1',
        workspace_id: 'workspace1',
        conflicting_sessions: [{ id: 'session1', user_id: 'user1', session_info: { last_activity_at: new Date() } }],
        base_version: null,
        local_version: null,
        remote_version: null,
        conflict_location: { path: 'root' },
        timestamp: new Date(),
        priority_levels: new Map()
      };

      // Trigger conflicts_detected event
      (engine as any).activeConflicts.set('resource1', mockContext);
      engine.emit('conflicts_detected', { resourceId: 'resource1', conflicts: [], context: mockContext });

      // Trigger conflict_resolved event
      engine.resolveConflicts('resource1', ResolutionStrategy.LAST_WRITER_WINS).then(() => {
        // Resolution should trigger the event internally
      });
    }, 10000);
  });

  // =============================================================================
  // PERFORMANCE TESTS
  // =============================================================================

  describe('Performance Tests', () => {
    it('should handle multiple concurrent conflicts efficiently', async () => {
      const startTime = Date.now();
      const promises = [];

      // Create multiple conflicts concurrently
      for (let i = 1; i <= 10; i++) {
        const context = {
          resource_id: `resource${i}`,
          workspace_id: 'workspace1',
          conflicting_sessions: [{ id: `session${i}`, user_id: `user${i}`, session_info: { last_activity_at: new Date() } }],
          base_version: null,
          local_version: null,
          remote_version: null,
          conflict_location: { path: 'root' },
          timestamp: new Date(),
          priority_levels: new Map()
        };

        (engine as any).activeConflicts.set(`resource${i}`, context);
        promises.push(engine.resolveConflicts(`resource${i}`, ResolutionStrategy.LAST_WRITER_WINS));


      const results = await Promise.all(promises);
      const endTime = Date.now();

      // All should succeed
      expect(results.every(r => r.success)).toBe(true);
      
      // Should complete reasonably quickly (less than 5 seconds for 10 conflicts)
      expect(endTime - startTime).toBeLessThan(5000);
    });

    it('should efficiently manage rollback point limits', () => {
      const startTime = Date.now();

      // Create many rollback points quickly
      for (let i = 1; i <= 100; i++) {
        engine.createRollbackPoint('resource1', { data: `content ${i}` });


      const endTime = Date.now();

      // Should maintain the limit
      const rollbackPoints = engine.getRollbackPoints('resource1');
      expect(rollbackPoints).toHaveLength(10);

      // Should be reasonably fast
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });
});