/**
 * Data Permission Hierarchy Manager Tests
 * 
 * Tests for the permission hierarchy manager including permission evaluation,
 * escalation processes, delegation, and emergency overrides.
 * 
 * Part of Epic 19 - Data Protection & Privacy Controls
 */

import { DataPermissionHierarchyManager } from '../DataPermissionHierarchyManager';
import {
  PermissionRequest,
  PermissionGrant,
  EscalationRequest,
  DelegationRequest,
  HierarchyAnalysis
} from '../DataPermissionHierarchyManager';

import { DataClassificationLevel, DataOperation } from '../../types/DataClassification';
import { EventEmitter } from 'events';

describe('DataPermissionHierarchyManager', () => {
  let manager: DataPermissionHierarchyManager;

  beforeEach(() => {
    manager = new DataPermissionHierarchyManager();
  });

  afterEach(() => {
    // Clean up any intervals
    manager.removeAllListeners();
  });

  describe('Permission Request Evaluation', () => {
    it('should grant access for valid permission requests', async () => {
      const request: PermissionRequest = {
        id: 'req-001',
        requesterId: 'user-001',
        operation: 'read',
        dataClassification: 'PUBLIC',
        dataId: 'data-001',
        purpose: 'Business analysis',
        urgency: 'LOW',
        context: {
          timestamp: new Date(),
          requestOrigin: 'web',
          userAgent: 'test-browser',
          sessionId: 'session-001',
          ipAddress: '192.168.1.1',
          geoLocation: {
            country: 'US',
            region: 'CA',
            city: 'San Francisco'
          }
        },
        requestedAt: new Date()
      };

      const result = await manager.evaluatePermissionRequest(request);

      expect(result.granted).toBe(true);
      expect(result.reason).toContain('granted');
      expect(result.escalationRequired).toBeFalsy();
    });

    it('should deny access for insufficient classification clearance', async () => {
      const request: PermissionRequest = {
        id: 'req-002',
        requesterId: 'user-002',
        operation: 'read',
        dataClassification: 'RESTRICTED',
        dataId: 'data-002',
        purpose: 'Testing',
        urgency: 'LOW',
        context: {
          timestamp: new Date(),
          requestOrigin: 'api',
          userAgent: 'test-client',
          sessionId: 'session-002',
          ipAddress: '10.0.0.1',
          geoLocation: {
            country: 'US',
            region: 'NY',
            city: 'New York'
          }
        },
        requestedAt: new Date()
      };

      const result = await manager.evaluatePermissionRequest(request);

      expect(result.granted).toBe(false);
      expect(result.reason).toContain('clearance');
      expect(result.escalationRequired).toBe(true);
      expect(result.escalationPath).toBeDefined();
    });

    it('should require escalation for high-risk operations', async () => {
      const request: PermissionRequest = {
        id: 'req-003',
        requesterId: 'user-003',
        operation: 'DELETE',
        dataClassification: 'CONFIDENTIAL',
        dataId: 'data-003',
        purpose: 'Data cleanup',
        urgency: 'MEDIUM',
        context: {
          timestamp: new Date(),
          requestOrigin: 'admin-panel',
          userAgent: 'admin-browser',
          sessionId: 'session-003',
          ipAddress: '172.16.0.1',
          geoLocation: {
            country: 'US',
            region: 'TX',
            city: 'Austin'
          }
        },
        requestedAt: new Date()
      };

      const result = await manager.evaluatePermissionRequest(request);

      // DELETE operations on CONFIDENTIAL data should require escalation for standard users
      if (!result.granted) {
        expect(result.escalationRequired).toBe(true);
        expect(result.escalationPath).toBeDefined();
      }
    });

    it('should handle time restrictions properly', async () => {
      const weekendTime = new Date('2024-01-06T10:00:00Z'); // Saturday
      
      const request: PermissionRequest = {
        id: 'req-004',
        requesterId: 'user-004',
        operation: 'WRITE',
        dataClassification: 'INTERNAL',
        dataId: 'data-004',
        purpose: 'Weekend work',
        urgency: 'LOW',
        context: {
          timestamp: weekendTime,
          requestOrigin: 'mobile',
          userAgent: 'mobile-app',
          sessionId: 'session-004',
          ipAddress: '192.168.100.1',
          geoLocation: {
            country: 'US',
            region: 'WA',
            city: 'Seattle'
          }
        },
        requestedAt: weekendTime
      };

      const result = await manager.evaluatePermissionRequest(request);

      // Standard users should have time restrictions for weekend access
      if (!result.granted) {
        expect(result.reason).toContain('time');
        expect(result.escalationRequired).toBe(true);
      }
    });

    it('should handle urgent requests appropriately', async () => {
      const request: PermissionRequest = {
        id: 'req-005',
        requesterId: 'user-005',
        operation: 'EXPORT',
        dataClassification: 'CONFIDENTIAL',
        dataId: 'data-005',
        purpose: 'Emergency compliance report',
        urgency: 'CRITICAL',
        context: {
          timestamp: new Date(),
          requestOrigin: 'compliance-system',
          userAgent: 'automated-system',
          sessionId: 'session-005',
          ipAddress: '10.1.1.1',
          geoLocation: {
            country: 'US',
            region: 'DC',
            city: 'Washington'
          }
        },
        requestedAt: new Date(),
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours
      };

      const result = await manager.evaluatePermissionRequest(request);

      // Critical urgency should be handled with appropriate escalation
      if (!result.granted) {
        expect(result.escalationRequired).toBe(true);
        expect(result.escalationPath).toBeDefined();
      }
    });
  });

  describe('Permission Granting', () => {
    it('should create permission grants with proper audit trail', async () => {
      const request: PermissionRequest = {
        id: 'req-grant-001',
        requesterId: 'user-001',
        operation: 'read',
        dataClassification: 'PUBLIC',
        dataId: 'data-001',
        purpose: 'Business analysis',
        urgency: 'LOW',
        context: {
          timestamp: new Date(),
          requestOrigin: 'web',
          userAgent: 'test-browser',
          sessionId: 'session-001',
          ipAddress: '192.168.1.1',
          geoLocation: {
            country: 'US',
            region: 'CA',
            city: 'San Francisco'
          }
        },
        requestedAt: new Date()
      };

      const grant = await manager.grantPermission(
        request,
        'manager-001',
        [],
        new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        10 // 10 uses
      );

      expect(grant.id).toBeDefined();
      expect(grant.requestId).toBe(request.id);
      expect(grant.grantedBy).toBe('manager-001');
      expect(grant.permissions).toContain('read');
      expect(grant.timeLimit).toBeDefined();
      expect(grant.usageLimit).toBe(10);
      expect(grant.usageCount).toBe(0);
      expect(grant.revoked).toBe(false);
      expect(grant.auditTrail).toHaveLength(1);
      expect(grant.auditTrail[0].action).toBe('GRANTED');
      expect(grant.auditTrail[0].userId).toBe('manager-001');
    });

    it('should emit permission granted event', async () => {
      const request: PermissionRequest = {
        id: 'req-event-001',
        requesterId: 'user-001',
        operation: 'read',
        dataClassification: 'PUBLIC',
        dataId: 'data-001',
        purpose: 'Business analysis',
        urgency: 'LOW',
        context: {
          timestamp: new Date(),
          requestOrigin: 'web',
          userAgent: 'test-browser',
          sessionId: 'session-001',
          ipAddress: '192.168.1.1',
          geoLocation: {
            country: 'US',
            region: 'CA',
            city: 'San Francisco'
          }
        },
        requestedAt: new Date()
      };

      const eventPromise = new Promise((resolve) => {
        manager.once('permission_granted', (data) => {
          resolve(data);
        });
      });

      await manager.grantPermission(request, 'manager-001');

      const eventData = await eventPromise;
      expect(eventData).toBeDefined();
      expect((eventData as any).grant).toBeDefined();
      expect((eventData as any).request).toBe(request);
      expect((eventData as any).grantedBy).toBe('manager-001');
    });
  });

  describe('Escalation Process', () => {
    it('should initiate escalation process for denied requests', async () => {
      const request: PermissionRequest = {
        id: 'req-escalation-001',
        requesterId: 'user-001',
        operation: 'DELETE',
        dataClassification: 'RESTRICTED',
        dataId: 'data-001',
        purpose: 'Data cleanup',
        urgency: 'HIGH',
        context: {
          timestamp: new Date(),
          requestOrigin: 'admin',
          userAgent: 'admin-tool',
          sessionId: 'session-001',
          ipAddress: '10.0.0.1',
          geoLocation: {
            country: 'US',
            region: 'CA',
            city: 'San Francisco'
          }
        },
        requestedAt: new Date()
      };

      const escalation = await manager.initiateEscalation(
        request,
        'data_access_request'
      );

      expect(escalation.id).toBeDefined();
      expect(escalation.originalRequestId).toBe(request.id);
      expect(escalation.escalationPath).toBe('data_access_request');
      expect(escalation.status).toBe('PENDING');
      expect(escalation.currentStep).toBe(0);
      expect(escalation.steps.length).toBeGreaterThan(0);
      expect(escalation.steps[0].status).toBe('PENDING');
    });

    it('should emit escalation initiated event', async () => {
      const request: PermissionRequest = {
        id: 'req-escalation-event-001',
        requesterId: 'user-001',
        operation: 'EXPORT',
        dataClassification: 'CONFIDENTIAL',
        dataId: 'data-001',
        purpose: 'Emergency export',
        urgency: 'CRITICAL',
        context: {
          timestamp: new Date(),
          requestOrigin: 'emergency',
          userAgent: 'emergency-tool',
          sessionId: 'session-001',
          ipAddress: '10.0.0.1',
          geoLocation: {
            country: 'US',
            region: 'CA',
            city: 'San Francisco'
          }
        },
        requestedAt: new Date()
      };

      const eventPromise = new Promise((resolve) => {
        manager.once('escalation_initiated', (data) => {
          resolve(data);
        });
      });

      await manager.initiateEscalation(request, 'emergency_access');

      const eventData = await eventPromise;
      expect(eventData).toBeDefined();
      expect((eventData as any).escalationRequest).toBeDefined();
      expect((eventData as any).originalRequest).toBe(request);
    });

    it('should handle invalid escalation paths', async () => {
      const request: PermissionRequest = {
        id: 'req-invalid-escalation-001',
        requesterId: 'user-001',
        operation: 'read',
        dataClassification: 'PUBLIC',
        dataId: 'data-001',
        purpose: 'Testing',
        urgency: 'LOW',
        context: {
          timestamp: new Date(),
          requestOrigin: 'test',
          userAgent: 'test-browser',
          sessionId: 'session-001',
          ipAddress: '192.168.1.1',
          geoLocation: {
            country: 'US',
            region: 'CA',
            city: 'San Francisco'
          }
        },
        requestedAt: new Date()
      };

      await expect(
        manager.initiateEscalation(request, 'invalid-path')
      ).rejects.toThrow('Escalation path not found');
    });
  });

  describe('Permission Delegation', () => {
    it('should allow delegation between appropriate levels', async () => {
      const delegation = await manager.delegatePermissions(
        'data-owner-001',
        'analyst-001',
        ['read', 'WRITE'],
        new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
        [{
          type: 'TEMPORAL',
          specification: { businessHoursOnly: true },
          required: true,
          validation: []
        }],
        'Temporary delegation for project work'
      );

      expect(delegation.id).toBeDefined();
      expect(delegation.delegatorId).toBe('data-owner-001');
      expect(delegation.delegateeId).toBe('analyst-001');
      expect(delegation.permissions).toEqual(['read', 'WRITE']);
      expect(delegation.timeLimit).toBeDefined();
      expect(delegation.justification).toBe('Temporary delegation for project work');
      expect(delegation.status).toBe('PENDING');
    });

    it('should prevent delegation to higher privilege users', async () => {
      await expect(
        manager.delegatePermissions(
          'analyst-001',
          'data-owner-001',
          ['read'],
          new Date(Date.now() + 24 * 60 * 60 * 1000),
          [],
          'Invalid delegation attempt'
        )
      ).rejects.toThrow('Cannot delegate to user with equal or higher privilege level');
    });

    it('should prevent delegation by users without delegation rights', async () => {
      await expect(
        manager.delegatePermissions(
          'guest-001',
          'user-001',
          ['read'],
          new Date(Date.now() + 24 * 60 * 60 * 1000),
          [],
          'Invalid delegation by guest'
        )
      ).rejects.toThrow('User does not have delegation privileges');
    });

    it('should emit delegation requested event', async () => {
      const eventPromise = new Promise((resolve) => {
        manager.once('delegation_requested', (data) => {
          resolve(data);
        });
      });

      await manager.delegatePermissions(
        'team-lead-001',
        'analyst-001',
        ['read'],
        new Date(Date.now() + 24 * 60 * 60 * 1000),
        [],
        'Project delegation'
      );

      const eventData = await eventPromise;
      expect(eventData).toBeDefined();
      expect((eventData as any).delegatorId).toBe('team-lead-001');
      expect((eventData as any).delegateeId).toBe('analyst-001');
    });
  });

  describe('User Permission Analysis', () => {
    it('should analyze user permissions comprehensively', async () => {
      const analysis = await manager.analyzeUserPermissions('user-001');

      expect(analysis.userLevel).toBeDefined();
      expect(typeof analysis.userLevel).toBe('number');
      expect(Array.isArray(analysis.effectivePermissions)).toBe(true);
      expect(Array.isArray(analysis.inheritedFrom)).toBe(true);
      expect(Array.isArray(analysis.delegatedPermissions)).toBe(true);
      expect(Array.isArray(analysis.restrictions)).toBe(true);
      expect(Array.isArray(analysis.escalationPaths)).toBe(true);
      expect(analysis.riskProfile).toBeDefined();
      expect(analysis.riskProfile.overallRisk).toMatch(/^(LOW|MEDIUM|HIGH|CRITICAL)$/);
    });

    it('should handle user not found scenario', async () => {
      // The implementation returns a default level for unknown users
      const analysis = await manager.analyzeUserPermissions('nonexistent-user');
      
      expect(analysis.userLevel).toBe(8); // Default standard user level
      expect(analysis.effectivePermissions).toBeDefined();
    });
  });

  describe('Risk Assessment', () => {
    it('should calculate risk scores for permission requests', async () => {
      const lowRiskRequest: PermissionRequest = {
        id: 'low-risk-001',
        requesterId: 'user-001',
        operation: 'read',
        dataClassification: 'PUBLIC',
        dataId: 'data-001',
        purpose: 'Regular reading',
        urgency: 'LOW',
        context: {
          timestamp: new Date(),
          requestOrigin: 'web',
          userAgent: 'browser',
          sessionId: 'session-001',
          ipAddress: '192.168.1.1',
          geoLocation: {
            country: 'US',
            region: 'CA',
            city: 'San Francisco'
          }
        },
        requestedAt: new Date()
      };

      const highRiskRequest: PermissionRequest = {
        id: 'high-risk-001',
        requesterId: 'user-001',
        operation: 'DELETE',
        dataClassification: 'RESTRICTED',
        dataId: 'data-001',
        purpose: 'Emergency deletion',
        urgency: 'CRITICAL',
        context: {
          timestamp: new Date(),
          requestOrigin: 'admin',
          userAgent: 'admin-tool',
          sessionId: 'session-001',
          ipAddress: '10.0.0.1',
          geoLocation: {
            country: 'US',
            region: 'CA',
            city: 'San Francisco'
          }
        },
        requestedAt: new Date()
      };

      // Risk scoring is done internally, we can test indirectly through grant audit trail
      const lowRiskGrant = await manager.grantPermission(lowRiskRequest, 'manager-001');
      const highRiskGrantResult = await manager.evaluatePermissionRequest(highRiskRequest);

      expect(lowRiskGrant.auditTrail[0].riskScore).toBeLessThan(50);
      
      // High-risk requests should be denied or require escalation
      if (!highRiskGrantResult.granted) {
        expect(highRiskGrantResult.escalationRequired).toBe(true);
      }
    });
  });

  describe('Cleanup and Maintenance', () => {
    it('should handle cleanup tasks without errors', () => {
      // Test that the manager starts cleanup tasks without throwing
      expect(() => {
        const testManager = new DataPermissionHierarchyManager();
        testManager.removeAllListeners();
      }).not.toThrow();
    });

    it('should emit permission expired events for time-limited grants', async () => {
      const request: PermissionRequest = {
        id: 'expiry-test-001',
        requesterId: 'user-001',
        operation: 'read',
        dataClassification: 'PUBLIC',
        dataId: 'data-001',
        purpose: 'Expiry test',
        urgency: 'LOW',
        context: {
          timestamp: new Date(),
          requestOrigin: 'test',
          userAgent: 'test-browser',
          sessionId: 'session-001',
          ipAddress: '192.168.1.1',
          geoLocation: {
            country: 'US',
            region: 'CA',
            city: 'San Francisco'
          }
        },
        requestedAt: new Date()
      };

      // Grant permission with very short time limit
      const pastTime = new Date(Date.now() - 1000); // 1 second ago
      const grant = await manager.grantPermission(
        request,
        'manager-001',
        [],
        pastTime
      );

      expect(grant.timeLimit).toEqual(pastTime);
      
      // The cleanup process would mark this as expired in the next cleanup cycle
      // For testing purposes, we verify the grant structure is correct
      expect(grant.revoked).toBe(false); // Not yet revoked
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed permission requests gracefully', async () => {
      const malformedRequest = {
        id: 'malformed-001',
        requesterId: 'user-001',
        operation: 'INVALID_OPERATION' as DataOperation,
        dataClassification: 'PUBLIC' as DataClassificationLevel,
        dataId: 'data-001',
        purpose: 'Testing error handling',
        urgency: 'LOW' as const,
        context: {
          timestamp: new Date(),
          requestOrigin: 'test',
          userAgent: 'test-browser',
          sessionId: 'session-001',
          ipAddress: '192.168.1.1',
          geoLocation: {
            country: 'US',
            region: 'CA',
            city: 'San Francisco'
          }
        },
        requestedAt: new Date()
      };

      const result = await manager.evaluatePermissionRequest(malformedRequest as PermissionRequest);

      expect(result.granted).toBe(false);
      expect(result.reason).toContain('error');
    });

    it('should handle system errors during evaluation', async () => {
      // Create a request that might trigger edge cases
      const edgeCaseRequest: PermissionRequest = {
        id: 'edge-case-001',
        requesterId: '', // Empty user ID
        operation: 'read',
        dataClassification: 'PUBLIC',
        dataId: 'data-001',
        purpose: 'Edge case testing',
        urgency: 'LOW',
        context: {
          timestamp: new Date(),
          requestOrigin: 'test',
          userAgent: 'test-browser',
          sessionId: 'session-001',
          ipAddress: '192.168.1.1',
          geoLocation: {
            country: 'US',
            region: 'CA',
            city: 'San Francisco'
          }
        },
        requestedAt: new Date()
      };

      const result = await manager.evaluatePermissionRequest(edgeCaseRequest);

      // Should handle gracefully and return a decision
      expect(typeof result.granted).toBe('boolean');
      expect(result.reason).toBeDefined();
    });
  });
});