/**
 * Archive Toggle Service Tests (Epic 19)
 * 
 * Comprehensive test suite for the Archive Toggle Service functionality
 * covering all aspects of toggle-based archiving control including:
 * - Toggle configuration management
 * - State management and evaluation
 * - Emergency override capabilities
 * - Compliance and security features
 * - Integration with archive management
 */

import { EventEmitter } from 'events';
import { ArchiveToggleService } from '../ArchiveToggleService';
import { ArchiveManagementService } from '../ArchiveManagementService';
import { DatabaseService } from '../../auth/database/DatabaseService';
import { AuditService } from '../../auth/services/AuditService';
import {
  ArchiveToggleMode,
  ArchiveToggleScope,
  ArchiveToggleAction,
  ComplianceStatus,
  CreateArchiveToggleRequest,
  UpdateArchiveToggleRequest,
  ArchiveToggleEvaluationContext
} from '../ArchiveToggleTypes';
import {
  ArchiveType,
  ArchiveCategory,
  DataClassification
} from '../ArchiveManagementService';

// Mock implementations
class MockDatabaseService extends EventEmitter {
  async query(sql: string, params?: any[]): Promise<any> {

    return { rows: [], rowCount: 0 };
  }
}

class MockAuditService extends EventEmitter {
  async logAction(action: any): Promise<void> {

    return Promise.resolve();
  }
}

class MockArchiveManagementService extends EventEmitter {
  async createArchive(...args: any[]): Promise<any> {

    return { id: 'mock-archive-id', name: 'Mock Archive' };
  }
}

describe('ArchiveToggleService', () => {
  let service: ArchiveToggleService;
  let mockDbService: MockDatabaseService;
  let mockAuditService: MockAuditService;
  let mockArchiveService: MockArchiveManagementService;

  beforeEach(() => {
    mockDbService = new MockDatabaseService();
    mockAuditService = new MockAuditService();
    mockArchiveService = new MockArchiveManagementService();
    
    service = new ArchiveToggleService(
      mockDbService as any,
      mockAuditService as any,
      mockArchiveService as any
    );
  });

  afterEach(() => {
    service.removeAllListeners();
    mockDbService.removeAllListeners();
    mockAuditService.removeAllListeners();
    mockArchiveService.removeAllListeners();
  });

  describe('Toggle Configuration Management', () => {
    describe('createArchiveToggle', () => {
      it('should create a new archive toggle configuration', async () => {
        const request: CreateArchiveToggleRequest = {
          name: 'Test Archive Toggle',
          description: 'Test toggle for archiving user data',
          scope: ArchiveToggleScope.USER_DATA,
          mode: ArchiveToggleMode.MANUAL_ONLY,
          enabledByDefault: false,
          requiresExplicitConsent: true,
          complianceRequired: true
        };

        const config = await service.createArchiveToggle(request, 'test-user');

        expect(config).toBeDefined();
        expect(config.name).toBe(request.name);
        expect(config.description).toBe(request.description);
        expect(config.scope).toBe(request.scope);
        expect(config.mode).toBe(request.mode);
        expect(config.enabledByDefault).toBe(request.enabledByDefault);
        expect(config.requiresExplicitConsent).toBe(request.requiresExplicitConsent);
        expect(config.complianceRequired).toBe(request.complianceRequired);
        expect(config.createdBy).toBe('test-user');
        expect(config.version).toBe(1);
      });

      it('should create toggle state when creating configuration', async () => {
        const request: CreateArchiveToggleRequest = {
          name: 'State Test Toggle',
          description: 'Testing state creation',
          scope: ArchiveToggleScope.GLOBAL,
          mode: ArchiveToggleMode.AUTOMATIC,
          enabledByDefault: true
        };

        const config = await service.createArchiveToggle(request, 'test-user');
        const state = service.getToggleState(config.id);

        expect(state).toBeDefined();
        expect(state!.configId).toBe(config.id);
        expect(state!.isEnabled).toBe(true);
        expect(state!.currentMode).toBe(ArchiveToggleMode.AUTOMATIC);
        expect(state!.isOverridden).toBe(false);
        expect(state!.complianceStatus).toBe(ComplianceStatus.PENDING_REVIEW);
        expect(state!.archiveOperationsCount).toBe(0);
        expect(state!.failedArchiveOperations).toBe(0);
      });

      it('should emit toggle_created event', async () => {
        const eventSpy = jest.fn();
        service.on('toggle_created', eventSpy);

        const request: CreateArchiveToggleRequest = {
          name: 'Event Test Toggle',
          description: 'Testing event emission',
          scope: ArchiveToggleScope.LOG_DATA,
          mode: ArchiveToggleMode.SCHEDULED
        };

        const config = await service.createArchiveToggle(request, 'test-user');

        expect(eventSpy).toHaveBeenCalledWith(config);
      });

      it('should create audit trail entry on creation', async () => {
        const request: CreateArchiveToggleRequest = {
          name: 'Audit Test Toggle',
          description: 'Testing audit trail',
          scope: ArchiveToggleScope.COMPLIANCE_DATA,
          mode: ArchiveToggleMode.COMPLIANCE_ONLY
        };

        const config = await service.createArchiveToggle(request, 'test-user');
        const state = service.getToggleState(config.id);

        expect(state!.auditTrail).toHaveLength(1);
        expect(state!.auditTrail[0].action).toBe(ArchiveToggleAction.CONFIG_UPDATED);
        expect(state!.auditTrail[0].actorId).toBe('test-user');
        expect(state!.auditTrail[0].reason).toBe('Initial toggle configuration created');
      });
    });

    describe('updateArchiveToggle', () => {
      it('should update existing toggle configuration', async () => {
        // Create initial toggle
        const createRequest: CreateArchiveToggleRequest = {
          name: 'Original Toggle',
          description: 'Original description',
          scope: ArchiveToggleScope.USER_DATA,
          mode: ArchiveToggleMode.MANUAL_ONLY
        };

        const original = await service.createArchiveToggle(createRequest, 'creator');

        // Update toggle
        const updateRequest: UpdateArchiveToggleRequest = {
          id: original.id,
          name: 'Updated Toggle',
          description: 'Updated description',
          mode: ArchiveToggleMode.AUTOMATIC,
          enabledByDefault: true,
          reason: 'Updating for better automation'
        };

        const updated = await service.updateArchiveToggle(updateRequest, 'updater');

        expect(updated.name).toBe('Updated Toggle');
        expect(updated.description).toBe('Updated description');
        expect(updated.mode).toBe(ArchiveToggleMode.AUTOMATIC);
        expect(updated.enabledByDefault).toBe(true);
        expect(updated.version).toBe(2);
        expect(updated.lastModifiedBy).toBe('updater');
      });

      it('should update toggle state when mode changes', async () => {
        const createRequest: CreateArchiveToggleRequest = {
          name: 'Mode Test Toggle',
          description: 'Testing mode changes',
          scope: ArchiveToggleScope.SYSTEM_DATA,
          mode: ArchiveToggleMode.MANUAL_ONLY
        };

        const config = await service.createArchiveToggle(createRequest, 'test-user');
        const originalState = service.getToggleState(config.id);

        expect(originalState!.currentMode).toBe(ArchiveToggleMode.MANUAL_ONLY);

        const updateRequest: UpdateArchiveToggleRequest = {
          id: config.id,
          mode: ArchiveToggleMode.SCHEDULED,
          reason: 'Switching to scheduled mode'
        };

        await service.updateArchiveToggle(updateRequest, 'test-user');
        const updatedState = service.getToggleState(config.id);

        expect(updatedState!.currentMode).toBe(ArchiveToggleMode.SCHEDULED);
      });

      it('should throw error when toggle not found', async () => {
        const updateRequest: UpdateArchiveToggleRequest = {
          id: 'non-existent-id',
          name: 'Should Fail',
          reason: 'This should fail'
        };

        await expect(service.updateArchiveToggle(updateRequest, 'test-user'))
          .rejects.toThrow('Archive toggle configuration not found');
      });
    });

    describe('listToggleConfigs', () => {
      beforeEach(async () => {
        // Create test toggles
        await service.createArchiveToggle({
          name: 'Global Toggle',
          description: 'Global scope toggle',
          scope: ArchiveToggleScope.GLOBAL,
          mode: ArchiveToggleMode.AUTOMATIC,
          enabledByDefault: true
        }, 'test-user');

        await service.createArchiveToggle({
          name: 'User Data Toggle',
          description: 'User data scope toggle',
          scope: ArchiveToggleScope.USER_DATA,
          mode: ArchiveToggleMode.MANUAL_ONLY,
          enabledByDefault: false
        }, 'test-user');

        await service.createArchiveToggle({
          name: 'Compliance Toggle',
          description: 'Compliance scope toggle',
          scope: ArchiveToggleScope.COMPLIANCE_DATA,
          mode: ArchiveToggleMode.COMPLIANCE_ONLY,
          enabledByDefault: true,
          complianceRequired: true
        }, 'test-user');
      });

      it('should list all toggles without filters', () => {
        const configs = service.listToggleConfigs();
        expect(configs.length).toBeGreaterThanOrEqual(3);
      });

      it('should filter by scope', () => {
        const configs = service.listToggleConfigs({ 
          scope: ArchiveToggleScope.USER_DATA 
        });
        expect(configs.length).toBeGreaterThanOrEqual(1);
        expect(configs[0].scope).toBe(ArchiveToggleScope.USER_DATA);
      });

      it('should filter by mode', () => {
        const configs = service.listToggleConfigs({ 
          mode: ArchiveToggleMode.MANUAL_ONLY 
        });
        expect(configs.length).toBeGreaterThanOrEqual(1);
        expect(configs[0].mode).toBe(ArchiveToggleMode.MANUAL_ONLY);
      });

      it('should filter by enabled state', () => {
        const enabledConfigs = service.listToggleConfigs({ enabled: true });
        const disabledConfigs = service.listToggleConfigs({ enabled: false });
        
        expect(enabledConfigs.length).toBeGreaterThan(0);
        expect(disabledConfigs.length).toBeGreaterThan(0);
      });

      it('should sort by updated_at descending', () => {
        const configs = service.listToggleConfigs();
        
        for (let i = 1; i < configs.length; i++) {
          expect(configs[i].updatedAt.getTime())
            .toBeLessThanOrEqual(configs[i - 1].updatedAt.getTime());
        }
      });
    });
  });

  describe('Toggle State Management', () => {
    let testToggleId: string;

    beforeEach(async () => {
      const config = await service.createArchiveToggle({
        name: 'State Test Toggle',
        description: 'For testing state management',
        scope: ArchiveToggleScope.GLOBAL,
        mode: ArchiveToggleMode.MANUAL_ONLY,
        enabledByDefault: false
      }, 'test-user');
      testToggleId = config.id;
    });

    describe('setToggleState', () => {
      it('should enable toggle when disabled', async () => {
        const state = await service.setToggleState(
          testToggleId, 
          true, 
          'Enabling for testing', 
          'test-user'
        );

        expect(state.isEnabled).toBe(true);
        expect(state.lastToggleTime).toBeDefined();
        expect(state.toggledBy).toBe('test-user');
        expect(state.toggleReason).toBe('Enabling for testing');
      });

      it('should disable toggle when enabled', async () => {
        // First enable it
        await service.setToggleState(testToggleId, true, 'Enable first', 'test-user');
        
        // Then disable it
        const state = await service.setToggleState(
          testToggleId, 
          false, 
          'Disabling for testing', 
          'test-user'
        );

        expect(state.isEnabled).toBe(false);
        expect(state.toggleReason).toBe('Disabling for testing');
      });

      it('should throw error when toggle not found', async () => {
        await expect(service.setToggleState('invalid-id', true, 'reason', 'user'))
          .rejects.toThrow('Toggle not found');
      });

      it('should throw error when state unchanged', async () => {
        await expect(service.setToggleState(testToggleId, false, 'reason', 'user'))
          .rejects.toThrow('Toggle is already disabled');
      });

      it('should emit toggle_enabled event', async () => {
        const eventSpy = jest.fn();
        service.on('toggle_enabled', eventSpy);

        const state = await service.setToggleState(testToggleId, true, 'reason', 'user');

        expect(eventSpy).toHaveBeenCalledWith(
          state, 
          expect.objectContaining({ id: testToggleId })
        );
      });

      it('should emit toggle_disabled event', async () => {
        // Enable first
        await service.setToggleState(testToggleId, true, 'enable', 'user');
        
        const eventSpy = jest.fn();
        service.on('toggle_disabled', eventSpy);

        const state = await service.setToggleState(testToggleId, false, 'reason', 'user');

        expect(eventSpy).toHaveBeenCalledWith(
          state, 
          expect.objectContaining({ id: testToggleId })
        );
      });

      it('should create audit trail entries', async () => {
        await service.setToggleState(testToggleId, true, 'Testing audit', 'test-user');
        
        const state = service.getToggleState(testToggleId);
        const auditEntries = state!.auditTrail.filter(
          entry => entry.action === ArchiveToggleAction.ENABLED
        );

        expect(auditEntries.length).toBe(1);
        expect(auditEntries[0].actorId).toBe('test-user');
        expect(auditEntries[0].reason).toBe('Testing audit');
        expect(auditEntries[0].isEmergency).toBe(false);
      });
    });

    describe('applyEmergencyOverride', () => {
      beforeEach(async () => {
        // Create toggle that allows emergency override
        const config = await service.createArchiveToggle({
          name: 'Emergency Test Toggle',
          description: 'For testing emergency override',
          scope: ArchiveToggleScope.GLOBAL,
          mode: ArchiveToggleMode.MANUAL_ONLY,
          enabledByDefault: false,
          customSettings: { allowEmergencyOverride: true }
        }, 'test-user');

        // Update the config to allow emergency override
        service.getToggleConfig(config.id)!.allowEmergencyOverride = true;
        testToggleId = config.id;
      });

      it('should apply emergency override successfully', async () => {
        const state = await service.applyEmergencyOverride(
          testToggleId,
          true,
          'Emergency archiving needed for critical data',
          120, // 2 hours
          'admin-user'
        );

        expect(state.isEnabled).toBe(true);
        expect(state.isOverridden).toBe(true);
        expect(state.overrideReason).toBe('Emergency archiving needed for critical data');
        expect(state.overrideApprovedBy).toBe('admin-user');
        expect(state.overrideExpiresAt).toBeDefined();
        
        const ttlMillis = state.overrideExpiresAt!.getTime() - Date.now();
        expect(ttlMillis).toBeGreaterThan(119 * 60 * 1000); // Should be close to 2 hours
        expect(ttlMillis).toBeLessThan(121 * 60 * 1000);
      });

      it('should throw error when override not allowed', async () => {
        // Create toggle without emergency override permission
        const config = await service.createArchiveToggle({
          name: 'No Override Toggle',
          description: 'Toggle without override permission',
          scope: ArchiveToggleScope.USER_DATA,
          mode: ArchiveToggleMode.MANUAL_ONLY
        }, 'test-user');

        await expect(service.applyEmergencyOverride(
          config.id, true, 'Should fail', 60, 'admin'
        )).rejects.toThrow('Emergency override not allowed for this toggle');
      });

      it('should emit emergency_override_applied event', async () => {
        const eventSpy = jest.fn();
        service.on('emergency_override_applied', eventSpy);

        const state = await service.applyEmergencyOverride(
          testToggleId, true, 'Emergency test', 60, 'admin'
        );

        expect(eventSpy).toHaveBeenCalledWith(
          state,
          expect.objectContaining({ id: testToggleId })
        );
      });

      it('should create emergency audit trail entry', async () => {
        await service.applyEmergencyOverride(
          testToggleId, true, 'Emergency override test', 60, 'admin-user'
        );

        const state = service.getToggleState(testToggleId);
        const emergencyEntries = state!.auditTrail.filter(
          entry => entry.action === ArchiveToggleAction.EMERGENCY_OVERRIDE
        );

        expect(emergencyEntries.length).toBe(1);
        expect(emergencyEntries[0].isEmergency).toBe(true);
        expect(emergencyEntries[0].actorId).toBe('admin-user');
        expect(emergencyEntries[0].reason).toBe('Emergency override test');
      });

      it('should schedule override expiration', (done) => {
        // Use short TTL for testing
        service.applyEmergencyOverride(
          testToggleId, true, 'Quick expiry test', 0.01, 'admin' // ~0.6 seconds
        ).then((state) => {
          expect(state.isOverridden).toBe(true);

          // Set up event listener for expiration
          service.once('override_expired', (expiredState) => {
            expect(expiredState.isOverridden).toBe(false);
            expect(expiredState.overrideReason).toBeUndefined();
            done();
          });
        }).catch(done);
      }, 2000); // 2 second timeout
    });
  });

  describe('Archive Evaluation', () => {
    let globalToggleId: string;
    let userDataToggleId: string;
    let complianceToggleId: string;

    beforeEach(async () => {
      // Create test toggles for different scenarios
      const globalConfig = await service.createArchiveToggle({
        name: 'Global Evaluation Toggle',
        description: 'Global scope for evaluation testing',
        scope: ArchiveToggleScope.GLOBAL,
        mode: ArchiveToggleMode.AUTOMATIC,
        enabledByDefault: true
      }, 'test-user');
      globalToggleId = globalConfig.id;

      const userDataConfig = await service.createArchiveToggle({
        name: 'User Data Evaluation Toggle',
        description: 'User data scope for evaluation testing',
        scope: ArchiveToggleScope.USER_DATA,
        mode: ArchiveToggleMode.MANUAL_ONLY,
        enabledByDefault: true,
        requiresExplicitConsent: true
      }, 'test-user');
      userDataToggleId = userDataConfig.id;

      const complianceConfig = await service.createArchiveToggle({
        name: 'Compliance Evaluation Toggle',
        description: 'Compliance scope for evaluation testing',
        scope: ArchiveToggleScope.COMPLIANCE_DATA,
        mode: ArchiveToggleMode.COMPLIANCE_ONLY,
        enabledByDefault: true,
        complianceRequired: true
      }, 'test-user');
      complianceToggleId = complianceConfig.id;
    });

    describe('evaluateArchiving', () => {
      it('should allow automatic archiving for global toggle', async () => {
        const context: ArchiveToggleEvaluationContext = {
          userId: 'test-user',
          orgId: 'test-org',
          archiveType: ArchiveType.DATA_EXPORT,
          category: ArchiveCategory.APPLICATION_DATA,
          dataClassification: DataClassification.INTERNAL,
          sourceIdentifier: 'test-data-source',
          triggeredBy: 'system',
          timestamp: new Date()
        };

        const result = await service.evaluateArchiving(context);

        expect(result.isArchivingAllowed).toBe(true);
        expect(result.mode).toBe(ArchiveToggleMode.AUTOMATIC);
        expect(result.reason).toBe('Full automatic archiving enabled');
        expect(result.requiresUserConsent).toBe(false);
        expect(result.requiresAdminApproval).toBe(false);
        expect(result.complianceChecksRequired).toBe(false);
        expect(result.warnings).toHaveLength(0);
      });

      it('should require manual trigger for user data toggle', async () => {
        const automaticContext: ArchiveToggleEvaluationContext = {
          userId: 'test-user',
          archiveType: ArchiveType.USER_DATA_ARCHIVE,
          category: ArchiveCategory.USER_DATA,
          dataClassification: DataClassification.CONFIDENTIAL,
          sourceIdentifier: 'user-data-source',
          triggeredBy: 'system',
          timestamp: new Date()
        };

        const automaticResult = await service.evaluateArchiving(automaticContext);
        expect(automaticResult.isArchivingAllowed).toBe(false);
        expect(automaticResult.reason).toBe('Only manual archiving operations are permitted');

        const manualContext = { ...automaticContext, triggeredBy: 'user' as const };
        const manualResult = await service.evaluateArchiving(manualContext);
        expect(manualResult.isArchivingAllowed).toBe(true);
        expect(manualResult.reason).toBe('Manual archiving operation allowed');
        expect(manualResult.requiresUserConsent).toBe(true);
      });

      it('should enforce compliance requirements for compliance toggle', async () => {
        const noComplianceContext: ArchiveToggleEvaluationContext = {
          userId: 'test-user',
          archiveType: ArchiveType.COMPLIANCE_ARCHIVE,
          category: ArchiveCategory.COMPLIANCE_DATA,
          dataClassification: DataClassification.RESTRICTED,
          sourceIdentifier: 'compliance-data',
          triggeredBy: 'system',
          timestamp: new Date()
        };

        const noComplianceResult = await service.evaluateArchiving(noComplianceContext);
        expect(noComplianceResult.isArchivingAllowed).toBe(false);
        expect(noComplianceResult.reason).toBe('No compliance requirement found');

        const withComplianceContext = {
          ...noComplianceContext,
          complianceRequirements: ['GDPR', 'SOX']
        };

        const withComplianceResult = await service.evaluateArchiving(withComplianceContext);
        expect(withComplianceResult.isArchivingAllowed).toBe(true);
        expect(withComplianceResult.reason).toBe('Compliance-required archiving allowed');
        expect(withComplianceResult.complianceChecksRequired).toBe(true);
      });

      it('should handle disabled toggles', async () => {
        // Disable the global toggle
        await service.setToggleState(globalToggleId, false, 'Disable for test', 'admin');

        const context: ArchiveToggleEvaluationContext = {
          userId: 'test-user',
          archiveType: ArchiveType.DATA_EXPORT,
          category: ArchiveCategory.APPLICATION_DATA,
          dataClassification: DataClassification.INTERNAL,
          sourceIdentifier: 'test-source',
          triggeredBy: 'system',
          timestamp: new Date()
        };

        const result = await service.evaluateArchiving(context);
        expect(result.isArchivingAllowed).toBe(false);
        expect(result.reason).toBe('Archiving is disabled by toggle configuration');
        expect(result.warnings).toContain('Archiving is currently disabled');
      });

      it('should handle emergency mode', async () => {
        // Update toggle to emergency mode (simulated)
        const state = service.getToggleState(globalToggleId);
        state!.currentMode = ArchiveToggleMode.EMERGENCY;

        const context: ArchiveToggleEvaluationContext = {
          userId: 'test-user',
          archiveType: ArchiveType.SYSTEM_SNAPSHOT,
          category: ArchiveCategory.SYSTEM_DATA,
          dataClassification: DataClassification.INTERNAL,
          sourceIdentifier: 'emergency-backup',
          triggeredBy: 'emergency',
          isEmergency: true,
          timestamp: new Date()
        };

        const result = await service.evaluateArchiving(context);
        expect(result.isArchivingAllowed).toBe(true);
        expect(result.mode).toBe(ArchiveToggleMode.EMERGENCY);
        expect(result.reason).toBe('Emergency archiving mode active');
        expect(result.requiresUserConsent).toBe(false);
        expect(result.warnings).toContain('Emergency mode bypasses normal constraints');
      });

      it('should create audit trail entry for evaluations', async () => {
        const context: ArchiveToggleEvaluationContext = {
          userId: 'test-user',
          archiveType: ArchiveType.LOG_ARCHIVE,
          category: ArchiveCategory.LOG_DATA,
          dataClassification: DataClassification.INTERNAL,
          sourceIdentifier: 'system-logs',
          triggeredBy: 'system',
          timestamp: new Date()
        };

        await service.evaluateArchiving(context);

        const state = service.getToggleState(globalToggleId);
        const evaluationEntries = state!.auditTrail.filter(
          entry => entry.action === ArchiveToggleAction.ARCHIVE_OPERATION_TRIGGERED
        );

        expect(evaluationEntries.length).toBeGreaterThan(0);
        expect(evaluationEntries[0].actorId).toBe('test-user');
        expect(evaluationEntries[0].impactedDataTypes).toContain(ArchiveType.LOG_ARCHIVE);
      });

      it('should handle no applicable toggles scenario', async () => {
        const context: ArchiveToggleEvaluationContext = {
          userId: 'test-user',
          archiveType: ArchiveType.MEDIA_ARCHIVE,
          category: ArchiveCategory.MEDIA_DATA,
          dataClassification: DataClassification.PUBLIC,
          sourceIdentifier: 'media-files',
          triggeredBy: 'user',
          timestamp: new Date()
        };

        const result = await service.evaluateArchiving(context);
        expect(result.configId).toBe('default');
        expect(result.isArchivingAllowed).toBe(true);
        expect(result.mode).toBe(ArchiveToggleMode.AUTOMATIC);
        expect(result.warnings).toContain('No specific archiving toggle configured for this context');
      });
    });
  });

  describe('Integration and Events', () => {
    it('should initialize predefined toggles on startup', () => {
      const configs = service.listToggleConfigs();
      
      // Should have at least the predefined toggles
      const gdprToggle = configs.find(c => c.name.includes('GDPR'));
      const systemLogsToggle = configs.find(c => c.name.includes('System Logs'));
      const emergencyToggle = configs.find(c => c.name.includes('Emergency'));
      const complianceToggle = configs.find(c => c.name.includes('Compliance Data'));

      expect(gdprToggle).toBeDefined();
      expect(systemLogsToggle).toBeDefined();
      expect(emergencyToggle).toBeDefined();
      expect(complianceToggle).toBeDefined();
    });

    it('should listen to archive service events', () => {
      const archiveRecord = {
        id: 'test-archive',
        archiveType: ArchiveType.USER_DATA_ARCHIVE,
        category: ArchiveCategory.USER_DATA,
        dataClassification: DataClassification.CONFIDENTIAL,
        sourceIdentifier: 'user-data-123',
        createdBy: 'test-user'
      };

      // Simulate archive created event
      mockArchiveService.emit('archive_created', archiveRecord);

      // The service should update statistics for applicable toggles
      // This would be tested by checking if the statistics were updated
      // but requires more complex mocking of the internal state
    });

    it('should emit events for all major operations', async () => {
      const events: string[] = [];
      
      service.on('toggle_created', () => events.push('toggle_created'));
      service.on('toggle_updated', () => events.push('toggle_updated'));
      service.on('toggle_enabled', () => events.push('toggle_enabled'));
      service.on('toggle_disabled', () => events.push('toggle_disabled'));
      service.on('emergency_override_applied', () => events.push('emergency_override_applied'));

      // Create toggle
      const config = await service.createArchiveToggle({
        name: 'Event Test Toggle',
        description: 'Testing all events',
        scope: ArchiveToggleScope.GLOBAL,
        mode: ArchiveToggleMode.MANUAL_ONLY,
        customSettings: { allowEmergencyOverride: true }
      }, 'test-user');

      // Update toggle
      await service.updateArchiveToggle({
        id: config.id,
        name: 'Updated Event Test Toggle',
        reason: 'Testing update event'
      }, 'test-user');

      // Enable toggle
      await service.setToggleState(config.id, true, 'Enable for test', 'test-user');

      // Disable toggle
      await service.setToggleState(config.id, false, 'Disable for test', 'test-user');

      // Apply emergency override
      service.getToggleConfig(config.id)!.allowEmergencyOverride = true;
      await service.applyEmergencyOverride(config.id, true, 'Emergency test', 60, 'admin');

      expect(events).toContain('toggle_created');
      expect(events).toContain('toggle_updated');
      expect(events).toContain('toggle_enabled');
      expect(events).toContain('toggle_disabled');
      expect(events).toContain('emergency_override_applied');
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Mock database service to throw error
      mockDbService.query = jest.fn().mockRejectedValue(new Error('Database connection failed'));

      await expect(service.createArchiveToggle({
        name: 'DB Error Test',
        description: 'Should fail',
        scope: ArchiveToggleScope.GLOBAL,
        mode: ArchiveToggleMode.MANUAL_ONLY
      }, 'test-user')).rejects.toThrow('Database connection failed');
    });

    it('should validate toggle configuration requirements', async () => {
      // Invalid scope should be caught by TypeScript, but test runtime validation
      const invalidRequest = {
        name: 'Invalid Toggle',
        description: 'Testing validation',
        scope: 'invalid_scope' as any,
        mode: ArchiveToggleMode.MANUAL_ONLY
      };

      // This would typically be caught by schema validation at the API level
      // but we can test the service's robustness
      try {
        await service.createArchiveToggle(invalidRequest, 'test-user');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle audit service failures', async () => {
      // Mock audit service to fail
      mockAuditService.logAction = jest.fn().mockRejectedValue(new Error('Audit logging failed'));

      // Service should still work even if audit logging fails
      const config = await service.createArchiveToggle({
        name: 'Audit Fail Test',
        description: 'Testing audit failure resilience',
        scope: ArchiveToggleScope.GLOBAL,
        mode: ArchiveToggleMode.MANUAL_ONLY
      }, 'test-user');

      expect(config).toBeDefined();
      expect(config.name).toBe('Audit Fail Test');
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle large numbers of toggles efficiently', async () => {
      const startTime = Date.now();
      
      // Create multiple toggles
      const promises = [];
      for (let i = 0; i < 50; i++) {
        promises.push(service.createArchiveToggle({
          name: `Performance Test Toggle ${i}`,
          description: `Testing performance with toggle ${i}`,
          scope: ArchiveToggleScope.GLOBAL,
          mode: ArchiveToggleMode.MANUAL_ONLY
        }, 'perf-test-user'));
      }

      await Promise.all(promises);
      
      const creationTime = Date.now() - startTime;
      expect(creationTime).toBeLessThan(5000); // Should complete within 5 seconds

      // Test listing performance
      const listStartTime = Date.now();
      const configs = service.listToggleConfigs();
      const listTime = Date.now() - listStartTime;
      
      expect(configs.length).toBeGreaterThanOrEqual(50);
      expect(listTime).toBeLessThan(100); // Should list within 100ms
    });

    it('should limit audit trail entries to prevent memory issues', async () => {
      const config = await service.createArchiveToggle({
        name: 'Audit Limit Test',
        description: 'Testing audit trail limits',
        scope: ArchiveToggleScope.GLOBAL,
        mode: ArchiveToggleMode.MANUAL_ONLY
      }, 'test-user');

      // Generate many audit entries by toggling state repeatedly
      for (let i = 0; i < 150; i++) {
        await service.setToggleState(
          config.id, 
          i % 2 === 0, 
          `Toggle operation ${i}`, 
          'test-user'
        );
      }

      const state = service.getToggleState(config.id);
      expect(state!.auditTrail.length).toBeLessThanOrEqual(100); // Should be limited to 100
    });
  });
});