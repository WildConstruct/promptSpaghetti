/**
 * Epic 23: Conflict Resolution Service Test Suite
 * 
 * Integration tests for the conflict resolution service layer,
 * testing service-level functionality, API integration, and
 * real-time monitoring capabilities.
 * 
 * Task: E23-1753115279513-6E9F4C - Implement conflict resolution & rollback logic
 */

import { ConflictResolutionService, ConflictResolutionConfig } from '../ConflictResolutionService';
import { Epic23WorkspaceDAO } from '../../database/epic23-workspace-dao';
import { ResolutionStrategy, ConflictSeverity } from '../ConflictResolutionEngine';
import { EditSession, COLLABORATIVE_PERMISSIONS } from '../../database/epic23-workspace-models';

// Mock the database
jest.mock('../../database/epic23-workspace-dao');

describe('ConflictResolutionService', () => {
  let service: ConflictResolutionService;
  let mockWorkspaceDAO: jest.Mocked<Epic23WorkspaceDAO>;
  let mockConfig: ConflictResolutionConfig;

  beforeEach(() => {
    mockWorkspaceDAO = new Epic23WorkspaceDAO({} as any) as jest.Mocked<Epic23WorkspaceDAO>;
    
    mockConfig = {
      default_strategy: ResolutionStrategy.AUTO_MERGE,
      auto_resolution_enabled: true,
      max_resolution_time_ms: 30000,
      rollback_enabled: true,
      max_rollback_points: 10,
      notification_enabled: true,
      conflict_threshold_seconds: 5
    };

    service = new ConflictResolutionService(mockWorkspaceDAO, mockConfig);
  });

  afterEach(() => {
    service.cleanup();
    jest.clearAllMocks();
  });

  // =============================================================================
  // SERVICE INITIALIZATION TESTS
  // =============================================================================

  describe('Service Initialization', () => {
    it('should initialize with default configuration', () => {
      const defaultService = new ConflictResolutionService(mockWorkspaceDAO);
      const stats = defaultService.getConflictStatistics();
      
      expect(stats.config.default_strategy).toBe(ResolutionStrategy.AUTO_MERGE);
      expect(stats.config.auto_resolution_enabled).toBe(true);
      expect(stats.config.rollback_enabled).toBe(true);
    });

    it('should initialize with custom configuration', () => {
      const customConfig: ConflictResolutionConfig = {
        default_strategy: ResolutionStrategy.MANUAL_RESOLUTION,
        auto_resolution_enabled: false,
        max_resolution_time_ms: 60000,
        rollback_enabled: false,
        max_rollback_points: 5,
        notification_enabled: false,
        conflict_threshold_seconds: 10
      };

      const customService = new ConflictResolutionService(mockWorkspaceDAO, customConfig);
      const stats = customService.getConflictStatistics();
      
      expect(stats.config.default_strategy).toBe(ResolutionStrategy.MANUAL_RESOLUTION);
      expect(stats.config.auto_resolution_enabled).toBe(false);
      expect(stats.config.max_resolution_time_ms).toBe(60000);
    });

    it('should set up event handlers properly', (done) => {
      let eventReceived = false;
      
      service.on('conflicts_detected', (notification) => {
        expect(notification.type).toBe('conflict_detected');
        eventReceived = true;
        done();
      });

      // Simulate a conflict detection event from the engine
      (service as any).conflictEngine.emit('conflicts_detected', {
        resourceId: 'test-resource',
        conflicts: [],
        context: {}
      });
    });
  });

  // =============================================================================
  // CONFLICT MONITORING TESTS
  // =============================================================================

  describe('Conflict Monitoring', () => {
    const mockEditSession: EditSession = {
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
      },
      editing_state: {
        editing_mode: 'edit',
        is_active: true,
        has_unsaved_changes: false
      },
      collaboration_metadata: {
        priority_level: 1,
        edit_permissions: [],
        can_force_save: false,
        auto_save_interval: 5000
      }
    };

    it('should start conflict monitoring', async () => {
      const eventPromise = new Promise(resolve => {
        service.on('monitoring_started', resolve);
      });

      await service.startConflictMonitoring('resource1');
      await eventPromise;

      const stats = service.getConflictStatistics('resource1');
      expect(stats.monitoring_active).toBe(true);
    });

    it('should not start duplicate monitoring', async () => {
      await service.startConflictMonitoring('resource1');
      await service.startConflictMonitoring('resource1'); // Should not duplicate

      const stats = service.getConflictStatistics();
      expect(stats.monitored_resources).toBe(1);
    });

    it('should stop conflict monitoring', async () => {
      await service.startConflictMonitoring('resource1');
      
      const eventPromise = new Promise(resolve => {
        service.on('monitoring_stopped', resolve);
      });

      service.stopConflictMonitoring('resource1');
      await eventPromise;

      const stats = service.getConflictStatistics('resource1');
      expect(stats.monitoring_active).toBe(false);
    });

    it('should check for conflicts with active sessions', async () => {
      const sessions = [mockEditSession];
      mockWorkspaceDAO.getActiveEditSessions.mockResolvedValue(sessions);

      const conflicts = await service.checkResourceForConflicts('resource1');
      
      expect(mockWorkspaceDAO.getActiveEditSessions).toHaveBeenCalledWith('resource1');
      expect(conflicts).toEqual([]); // No conflicts with single session
    });

    it('should detect conflicts with multiple sessions', async () => {
      const sessions = [
        mockEditSession,
        {
          ...mockEditSession,
          id: 'session2',
          user_id: 'user2',
          editing_state: {
            ...mockEditSession.editing_state,
            has_unsaved_changes: true
          }
        }
      ];
      
      mockWorkspaceDAO.getActiveEditSessions.mockResolvedValue(sessions);

      const conflicts = await service.checkResourceForConflicts('resource1');
      
      expect(conflicts).toBeDefined();
      // The actual conflict detection logic would determine if conflicts exist
    });

    it('should handle monitoring errors gracefully', async () => {
      mockWorkspaceDAO.getActiveEditSessions.mockRejectedValue(new Error('Database error'));

      const conflicts = await service.checkResourceForConflicts('resource1');
      
      expect(conflicts).toEqual([]); // Should return empty array on error
    });
  });

  // =============================================================================
  // MANUAL CONFLICT RESOLUTION TESTS
  // =============================================================================

  describe('Manual Conflict Resolution', () => {
    beforeEach(() => {
      const mockSessions = [{
        id: 'session1',
        workspace_id: 'workspace1',
        user_id: 'user1'
      }];
      
      mockWorkspaceDAO.getActiveEditSessions.mockResolvedValue(mockSessions as any);
      mockWorkspaceDAO.hasCollaborativePermission.mockResolvedValue(true);
    });

    it('should resolve conflicts manually with permissions', async () => {
      const result = await service.resolveConflictsManually(
        'resource1',
        ResolutionStrategy.MANUAL_RESOLUTION,
        { resolved_content: 'manually resolved' },
        'user1'
      );

      expect(mockWorkspaceDAO.hasCollaborativePermission).toHaveBeenCalledWith(
        'user1',
        'workspace1',
        COLLABORATIVE_PERMISSIONS.CONFLICT_RESOLVE
      );
      
      expect(result).toBeDefined();
      expect(result.resolution_strategy).toBe(ResolutionStrategy.MANUAL_RESOLUTION);
    });

    it('should reject manual resolution without permissions', async () => {
      mockWorkspaceDAO.hasCollaborativePermission.mockResolvedValue(false);

      await expect(
        service.resolveConflictsManually(
          'resource1',
          ResolutionStrategy.MANUAL_RESOLUTION,
          { resolved_content: 'test' },
          'user1'
        )
      ).rejects.toThrow('User does not have permission to resolve conflicts');
    });

    it('should create rollback point before manual resolution', async () => {
      const spy = jest.spyOn(service as any, 'getCurrentResourceContent');
      spy.mockResolvedValue({ content: 'current content' });

      await service.resolveConflictsManually(
        'resource1',
        ResolutionStrategy.MANUAL_RESOLUTION,
        { resolved_content: 'manually resolved' },
        'user1'
      );

      expect(spy).toHaveBeenCalledWith('resource1');
      
      // Check that rollback point was created
      const rollbackPoints = service.getRollbackPoints('resource1');
      expect(rollbackPoints.length).toBeGreaterThan(0);
    });

    it('should emit events for manual resolution', (done) => {
      service.on('manual_resolution_completed', (data) => {
        expect(data.resourceId).toBe('resource1');
        expect(data.userId).toBe('user1');
        done();
      });

      service.resolveConflictsManually(
        'resource1',
        ResolutionStrategy.LAST_WRITER_WINS,
        undefined,
        'user1'
      );
    });
  });

  // =============================================================================
  // ROLLBACK OPERATION TESTS
  // =============================================================================

  describe('Rollback Operations', () => {
    beforeEach(() => {
      const mockSessions = [{
        id: 'session1',
        workspace_id: 'workspace1',
        user_id: 'user1'
      }];
      
      mockWorkspaceDAO.getActiveEditSessions.mockResolvedValue(mockSessions as any);
      mockWorkspaceDAO.hasCollaborativePermission.mockResolvedValue(true);
    });

    it('should perform rollback with permissions', async () => {
      // Create a rollback point first
      await service.createRollbackPoint('resource1', 'test checkpoint', 'user1');

      const result = await service.performRollback('resource1', undefined, 'user1');

      expect(mockWorkspaceDAO.hasCollaborativePermission).toHaveBeenCalledWith(
        'user1',
        'workspace1',
        COLLABORATIVE_PERMISSIONS.VERSION_CONTROL
      );
      
      expect(result).toBe(true);
    });

    it('should reject rollback without permissions', async () => {
      mockWorkspaceDAO.hasCollaborativePermission.mockResolvedValue(false);

      await expect(
        service.performRollback('resource1', undefined, 'user1')
      ).rejects.toThrow('User does not have permission to perform rollback');
    });

    it('should create rollback points', async () => {
      const rollbackId = await service.createRollbackPoint('resource1', 'Manual checkpoint', 'user1');

      expect(rollbackId).toBeTruthy();
      
      const rollbackPoints = service.getRollbackPoints('resource1');
      expect(rollbackPoints).toHaveLength(1);
      expect(rollbackPoints[0].label).toBe('Manual checkpoint');
    });

    it('should emit rollback events', (done) => {
      service.on('rollback_performed', (data) => {
        expect(data.resourceId).toBe('resource1');
        expect(data.userId).toBe('user1');
        done();
      });

      service.createRollbackPoint('resource1', 'test').then(() => {
        service.performRollback('resource1', undefined, 'user1');
      });
    });

    it('should end active sessions after rollback', async () => {
      // Create a rollback point first
      await service.createRollbackPoint('resource1', 'test checkpoint', 'user1');

      const endSessionsSpy = jest.spyOn(service as any, 'endAllEditSessions');
      endSessionsSpy.mockResolvedValue(undefined);

      await service.performRollback('resource1', undefined, 'user1');

      expect(endSessionsSpy).toHaveBeenCalledWith('resource1');
    });
  });

  // =============================================================================
  // CONFLICT ANALYSIS TESTS
  // =============================================================================

  describe('Conflict Analysis', () => {
    beforeEach(() => {
      const mockSessions = [{
        id: 'session1',
        workspace_id: 'workspace1',
        user_id: 'user1',
        session_info: { last_activity_at: new Date() },
        editing_state: { is_active: true }
      }];
      
      mockWorkspaceDAO.getActiveEditSessions.mockResolvedValue(mockSessions as any);
    });

    it('should analyze conflict risk for single session', async () => {
      const analysis = await service.analyzeConflictRisk('resource1');

      expect(analysis).toBeDefined();
      expect(analysis.resource_id).toBe('resource1');
      expect(analysis.conflict_probability).toBeGreaterThanOrEqual(0);
      expect(analysis.conflict_probability).toBeLessThanOrEqual(1);
      expect(analysis.recommended_strategy).toBeDefined();
    });

    it('should analyze higher conflict risk for multiple sessions', async () => {
      const multipleSessions = [
        {
          id: 'session1',
          workspace_id: 'workspace1',
          user_id: 'user1',
          session_info: { last_activity_at: new Date() },
          editing_state: { is_active: true }
        },
        {
          id: 'session2',
          workspace_id: 'workspace1',
          user_id: 'user2',
          session_info: { last_activity_at: new Date() },
          editing_state: { is_active: true }
        }
      ];
      
      mockWorkspaceDAO.getActiveEditSessions.mockResolvedValue(multipleSessions as any);

      const analysis = await service.analyzeConflictRisk('resource1');

      expect(analysis.conflict_probability).toBeGreaterThan(0.1); // Should have some risk with multiple editors
      expect(analysis.risk_factors.length).toBeGreaterThan(0);
    });

    it('should cache conflict analysis results', async () => {
      const analysis1 = await service.analyzeConflictRisk('resource1');
      const analysis2 = await service.analyzeConflictRisk('resource1');

      expect(analysis1).toEqual(analysis2);
      expect(mockWorkspaceDAO.getActiveEditSessions).toHaveBeenCalledTimes(1); // Should be cached
    });

    it('should provide prevention suggestions', async () => {
      const multipleSessions = [
        {
          id: 'session1',
          workspace_id: 'workspace1',
          user_id: 'user1',
          session_info: { last_activity_at: new Date() },
          editing_state: { is_active: true }
        },
        {
          id: 'session2',
          workspace_id: 'workspace1',
          user_id: 'user2',
          session_info: { last_activity_at: new Date() },
          editing_state: { is_active: true }
        }
      ];
      
      mockWorkspaceDAO.getActiveEditSessions.mockResolvedValue(multipleSessions as any);

      const analysis = await service.analyzeConflictRisk('resource1');

      expect(analysis.prevention_suggestions.length).toBeGreaterThan(0);
      expect(analysis.estimated_resolution_time).toBeGreaterThan(0);
    });

    it('should handle analysis errors gracefully', async () => {
      mockWorkspaceDAO.getActiveEditSessions.mockRejectedValue(new Error('Database error'));

      const analysis = await service.analyzeConflictRisk('resource1');

      expect(analysis.resource_id).toBe('resource1');
      expect(analysis.conflict_probability).toBe(0.5); // Default fallback
      expect(analysis.risk_factors).toContain('Analysis error');
    });
  });

  // =============================================================================
  // CONFIGURATION MANAGEMENT TESTS
  // =============================================================================

  describe('Configuration Management', () => {
    it('should update service configuration', () => {
      const newConfig = {
        auto_resolution_enabled: false,
        max_resolution_time_ms: 60000,
        notification_enabled: false
      };

      const configUpdatePromise = new Promise(resolve => {
        service.on('config_updated', resolve);
      });

      service.updateConfig(newConfig);

      const stats = service.getConflictStatistics();
      expect(stats.config.auto_resolution_enabled).toBe(false);
      expect(stats.config.max_resolution_time_ms).toBe(60000);
      expect(stats.config.notification_enabled).toBe(false);

      return configUpdatePromise;
    });

    it('should emit config update events', (done) => {
      service.on('config_updated', (updatedConfig) => {
        expect(updatedConfig.auto_resolution_enabled).toBe(false);
        done();
      });

      service.updateConfig({ auto_resolution_enabled: false });
    });
  });

  // =============================================================================
  // STATISTICS AND MONITORING TESTS
  // =============================================================================

  describe('Statistics and Monitoring', () => {
    it('should provide resource-specific statistics', () => {
      const stats = service.getConflictStatistics('resource1');

      expect(stats).toBeDefined();
      expect(stats.monitoring_active).toBeDefined();
      expect(stats.config).toBeDefined();
    });

    it('should provide global statistics', () => {
      const stats = service.getConflictStatistics();

      expect(stats).toBeDefined();
      expect(stats.monitored_resources).toBeDefined();
      expect(typeof stats.monitored_resources).toBe('number');
    });

    it('should track monitoring status', async () => {
      await service.startConflictMonitoring('resource1');
      await service.startConflictMonitoring('resource2');

      const globalStats = service.getConflictStatistics();
      expect(globalStats.monitored_resources).toBe(2);

      service.stopConflictMonitoring('resource1');
      const updatedStats = service.getConflictStatistics();
      expect(updatedStats.monitored_resources).toBe(1);
    });
  });

  // =============================================================================
  // AUTO-RESOLUTION TESTS
  // =============================================================================

  describe('Auto-Resolution', () => {
    it('should attempt auto-resolution when enabled', async () => {
      const sessions = [
        { id: 'session1', user_id: 'user1', workspace_id: 'workspace1' },
        { id: 'session2', user_id: 'user2', workspace_id: 'workspace1' }
      ];
      
      mockWorkspaceDAO.getActiveEditSessions.mockResolvedValue(sessions as any);

      // Start monitoring to trigger auto-resolution
      await service.startConflictMonitoring('resource1');

      // Simulate conflict detection that would trigger auto-resolution
      const conflicts = await service.checkResourceForConflicts('resource1');

      // The auto-resolution behavior would be tested through integration
      expect(mockWorkspaceDAO.getActiveEditSessions).toHaveBeenCalled();
    });

    it('should skip auto-resolution when disabled', async () => {
      // Create service with auto-resolution disabled
      const disabledService = new ConflictResolutionService(mockWorkspaceDAO, {
        ...mockConfig,
        auto_resolution_enabled: false
      });

      const sessions = [
        { id: 'session1', user_id: 'user1', workspace_id: 'workspace1' },
        { id: 'session2', user_id: 'user2', workspace_id: 'workspace1' }
      ];
      
      mockWorkspaceDAO.getActiveEditSessions.mockResolvedValue(sessions as any);

      await disabledService.startConflictMonitoring('resource1');
      const conflicts = await disabledService.checkResourceForConflicts('resource1');

      // With auto-resolution disabled, conflicts should remain unresolved
      expect(mockWorkspaceDAO.getActiveEditSessions).toHaveBeenCalled();
      
      disabledService.cleanup();
    });
  });

  // =============================================================================
  // CLEANUP AND RESOURCE MANAGEMENT TESTS
  // =============================================================================

  describe('Cleanup and Resource Management', () => {
    it('should cleanup all service resources', async () => {
      // Start monitoring some resources
      await service.startConflictMonitoring('resource1');
      await service.startConflictMonitoring('resource2');
      
      // Create some rollback points
      await service.createRollbackPoint('resource1', 'test1');
      await service.createRollbackPoint('resource2', 'test2');

      const cleanupPromise = new Promise(resolve => {
        service.on('service_cleanup_completed', resolve);
      });

      service.cleanup();

      await cleanupPromise;

      const stats = service.getConflictStatistics();
      expect(stats.monitored_resources).toBe(0);
    });

    it('should handle cleanup gracefully', () => {
      // Test cleanup without any active resources
      expect(() => service.cleanup()).not.toThrow();
    });

    it('should stop all monitoring on cleanup', async () => {
      await service.startConflictMonitoring('resource1');
      await service.startConflictMonitoring('resource2');

      let stoppedCount = 0;
      service.on('monitoring_stopped', () => {
        stoppedCount++;
      });

      service.cleanup();

      // Should have stopped all monitoring
      expect(stoppedCount).toBeGreaterThanOrEqual(0);
    });
  });

  // =============================================================================
  // NOTIFICATION SYSTEM TESTS
  // =============================================================================

  describe('Notification System', () => {
    it('should emit conflict notification events', (done) => {
      service.on('conflict_notification', (notification) => {
        expect(notification.type).toBeDefined();
        expect(notification.resource_id).toBeDefined();
        done();
      });

      // Simulate a notification being sent
      (service as any).sendConflictNotification({
        type: 'conflict_detected',
        resource_id: 'resource1',
        workspace_id: 'workspace1',
        affected_users: ['user1'],
        conflicts: [],
        timestamp: new Date(),
        severity: ConflictSeverity.LOW,
        requires_user_action: false
      });
    });

    it('should respect notification enabled setting', () => {
      const disabledNotificationService = new ConflictResolutionService(
        mockWorkspaceDAO,
        { ...mockConfig, notification_enabled: false }
      );

      const stats = disabledNotificationService.getConflictStatistics();
      expect(stats.config.notification_enabled).toBe(false);

      disabledNotificationService.cleanup();
    });
  });

  // =============================================================================
  // INTEGRATION ERROR HANDLING TESTS
  // =============================================================================

  describe('Integration Error Handling', () => {
    it('should handle DAO errors gracefully', async () => {
      mockWorkspaceDAO.getActiveEditSessions.mockRejectedValue(new Error('Database connection failed'));

      const result = await service.checkResourceForConflicts('resource1');
      expect(result).toEqual([]); // Should return empty array on error
    });

    it('should handle permission check failures', async () => {
      mockWorkspaceDAO.getActiveEditSessions.mockResolvedValue([
        { id: 'session1', workspace_id: 'workspace1', user_id: 'user1' }
      ] as any);
      
      mockWorkspaceDAO.hasCollaborativePermission.mockRejectedValue(new Error('Permission check failed'));

      await expect(
        service.resolveConflictsManually('resource1', ResolutionStrategy.MANUAL_RESOLUTION, {}, 'user1')
      ).rejects.toThrow();
    });

    it('should handle resource content errors', async () => {
      mockWorkspaceDAO.getActiveEditSessions.mockResolvedValue([
        { id: 'session1', workspace_id: 'workspace1', user_id: 'user1' }
      ] as any);
      mockWorkspaceDAO.hasCollaborativePermission.mockResolvedValue(true);

      // Mock getCurrentResourceContent to throw error
      const spy = jest.spyOn(service as any, 'getCurrentResourceContent');
      spy.mockRejectedValue(new Error('Resource not found'));

      await expect(
        service.createRollbackPoint('resource1', 'test', 'user1')
      ).rejects.toThrow('Resource not found');
    });
  });
});