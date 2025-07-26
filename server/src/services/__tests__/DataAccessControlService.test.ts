// DataAccessControlService Tests - Epic 19.4
// Comprehensive test suite for data access control and RBAC functionality

import { DataAccessControlService, DataAccessRequest, DataOperation } from '../DataAccessControlService';
import { AuditService } from '../../auth/services/AuditService';

// Mock dependencies
jest.mock('../../auth/services/AuditService');

// Mock database
const mockDb = {
  query: jest.fn<unknown[], unknown>(),
  getClient: jest.fn<unknown[], unknown>()
};

describe('DataAccessControlService', () => {
  let dataAccessService: DataAccessControlService;
  let mockAuditService: jest.Mocked<AuditService>;

  const mockUser = {
    id: 'user-123',
    email: 'user@example.com',
    roles: ['data_viewer', 'employee']
  };

  const mockResource = {
    id: 'resource-456',
    type: 'customer_data',
    classification: 'CONFIDENTIAL',
    ownerId: 'owner-789'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockAuditService = new AuditService({} as any, {} as any) as jest.Mocked<AuditService>;
    mockAuditService.logSecurityEvent = jest.fn<unknown[], unknown>().mockResolvedValue(undefined as unknown as unknown);
    
    dataAccessService = new DataAccessControlService(mockDb as any, mockAuditService);
    
    // Setup default mock implementations
    mockDb.query = jest.fn<unknown[], unknown>();
  });

  describe('checkAccess', () => {
    const validRequest: DataAccessRequest = {
      userId: mockUser.id,
      resourceId: mockResource.id,
      resourceType: mockResource.type,
      operation: 'READ' as DataOperation,
      context: {
        sessionId: 'session-123',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0'
      }
    };

    it('should allow access for authorized user with sufficient permissions', async () => {
      // Mock database responses
      mockDb.query
        .mockResolvedValueOnce({ 
          rows: [{ 
            classification: 'CONFIDENTIAL',
            owner_id: 'owner-789',
            metadata: '{"tags":["sensitive"]}'
          }] 
        }) // get resource classification
        .mockResolvedValueOnce({ 
          rows: [{ 
            user_id: mockUser.id,
            roles: '["data_viewer","employee"]',
            permissions: '["READ_CONFIDENTIAL","READ_INTERNAL"]'
          }] 
        }) // get user roles and permissions
        .mockResolvedValueOnce({ rowCount: 1 }); // log access attempt

      const result = await dataAccessService.checkAccess(validRequest);

      expect(result.allowed).toBe(true);
      expect(result.classification).toBe('CONFIDENTIAL');
      expect(result.accessLevel).toBe('GRANTED');
      expect(result.auditId).toBeDefined();
      expect(mockAuditService.logSecurityEvent).toHaveBeenCalledWith({
        type: 'DATA_ACCESS_GRANTED',
        userId: mockUser.id,
        resourceId: mockResource.id,
        ipAddress: validRequest.context?.ipAddress,
        userAgent: validRequest.context?.userAgent,
        success: true,
        metadata: expect.objectContaining({
          operation: 'READ',
          classification: 'CONFIDENTIAL',
          riskScore: expect.any(Number)
        })
      });
    });

    it('should deny access for user without sufficient permissions', async () => {
      // Mock database responses - user without READ_CONFIDENTIAL permission
      mockDb.query
        .mockResolvedValueOnce({ 
          rows: [{ 
            classification: 'CONFIDENTIAL',
            owner_id: 'owner-789',
            metadata: '{"tags":["sensitive"]}'
          }] 
        })
        .mockResolvedValueOnce({ 
          rows: [{ 
            user_id: mockUser.id,
            roles: '["basic_user"]',
            permissions: '["READ_PUBLIC","READ_INTERNAL"]'
          }] 
        })
        .mockResolvedValueOnce({ rowCount: 1 });

      const result = await dataAccessService.checkAccess(validRequest);

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Insufficient permissions');
      expect(result.accessLevel).toBe('DENIED');
      expect(mockAuditService.logSecurityEvent).toHaveBeenCalledWith({
        type: 'DATA_ACCESS_DENIED',
        userId: mockUser.id,
        resourceId: mockResource.id,
        ipAddress: validRequest.context?.ipAddress,
        userAgent: validRequest.context?.userAgent,
        success: false,
        metadata: expect.objectContaining({
          reason: expect.stringContaining('Insufficient permissions'),
          requiredPermission: 'READ_CONFIDENTIAL'
        })
      });
    });

    it('should deny access for non-existent resource', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] }); // resource not found

      const result = await dataAccessService.checkAccess(validRequest);

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('Resource not found');
      expect(result.accessLevel).toBe('DENIED');
    });

    it('should apply time-based restrictions', async () => {
      const restrictedRequest = {
        ...validRequest,
        context: {
          ...validRequest.context,
          requestTime: new Date('2023-12-25T02:00:00Z') // Outside business hours
        }
      };

      mockDb.query
        .mockResolvedValueOnce({ 
          rows: [{ 
            classification: 'RESTRICTED',
            owner_id: 'owner-789',
            metadata: '{"restrictions":{"timeWindows":[{"start":"09:00","end":"17:00","days":["MON","TUE","WED","THU","FRI"]}]}}'
          }] 
        })
        .mockResolvedValueOnce({ 
          rows: [{ 
            user_id: mockUser.id,
            roles: '["data_admin"]',
            permissions: '["READ_RESTRICTED","WRITE_RESTRICTED"]'
          }] 
        })
        .mockResolvedValueOnce({ rowCount: 1 });

      const result = await dataAccessService.checkAccess(restrictedRequest);

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('outside allowed time window');
      expect(result.restrictions).toContainEqual({
        type: 'TIME_WINDOW',
        value: 'Business hours only',
        description: 'Access restricted to business hours (09:00-17:00, Mon-Fri)'
      });
    });

    it('should calculate risk scores based on context', async () => {
      const suspiciousRequest = {
        ...validRequest,
        context: {
          sessionId: 'session-suspicious',
          ipAddress: '1.2.3.4', // Different from usual
          userAgent: 'Suspicious Bot 1.0',
          purpose: 'data_export'
        }
      };

      mockDb.query
        .mockResolvedValueOnce({ 
          rows: [{ 
            classification: 'CONFIDENTIAL',
            owner_id: 'owner-789',
            metadata: '{}'
          }] 
        })
        .mockResolvedValueOnce({ 
          rows: [{ 
            user_id: mockUser.id,
            roles: '["data_viewer"]',
            permissions: '["READ_CONFIDENTIAL"]'
          }] 
        })
        .mockResolvedValueOnce({ rowCount: 1 });

      const result = await dataAccessService.checkAccess(suspiciousRequest);

      expect(result.riskScore).toBeGreaterThan(50); // Should be higher due to suspicious indicators
      expect(mockAuditService.logSecurityEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            riskScore: expect.any(Number),
            riskFactors: expect.arrayContaining([
              expect.stringContaining('Suspicious user agent')
            ])
          })
        })
      );
    });

    it('should handle database errors gracefully', async () => {
      mockDb.query.mockRejectedValueOnce(new Error('Database connection failed'));

      await expect(dataAccessService.checkAccess(validRequest))
        .rejects.toThrow('Database connection failed');

      expect(mockAuditService.logSecurityEvent).toHaveBeenCalledWith({
        type: 'DATA_ACCESS_ERROR',
        userId: mockUser.id,
        resourceId: mockResource.id,
        ipAddress: validRequest.context?.ipAddress,
        userAgent: validRequest.context?.userAgent,
        success: false,
        metadata: { error: 'Database connection failed' }
      });
    });
  });

  describe('requestAccess', () => {
    const accessRequest: DataAccessRequest = {
      userId: mockUser.id,
      resourceId: mockResource.id,
      resourceType: mockResource.type,
      operation: 'WRITE' as DataOperation,
      reason: 'Need to update customer information for compliance audit',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      context: {
        sessionId: 'session-123',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        purpose: 'compliance_audit'
      }
    };

    it('should approve automatic access request for eligible users', async () => {
      mockDb.query
        .mockResolvedValueOnce({ 
          rows: [{ 
            classification: 'INTERNAL',
            owner_id: mockUser.id, // User is the owner
            metadata: '{}'
          }] 
        })
        .mockResolvedValueOnce({ 
          rows: [{ 
            user_id: mockUser.id,
            roles: '["data_owner","employee"]',
            permissions: '["WRITE_INTERNAL","READ_INTERNAL"]'
          }] 
        })
        .mockResolvedValueOnce({ 
          rows: [{ request_id: 'req-auto-123' }] 
        }); // store request

      const result = await dataAccessService.requestAccess(accessRequest);

      expect(result.status).toBe('approved');
      expect(result.requestId).toBe('req-auto-123');
      expect(result.message).toContain('automatically approved');
    });

    it('should require manual approval for high-risk requests', async () => {
      const highRiskRequest = {
        ...accessRequest,
        operation: 'DELETE' as DataOperation,
        context: {
          ...accessRequest.context,
          ipAddress: '1.2.3.4' // Suspicious IP
        }
      };

      mockDb.query
        .mockResolvedValueOnce({ 
          rows: [{ 
            classification: 'RESTRICTED',
            owner_id: 'different-owner',
            metadata: '{"sensitive": true}'
          }] 
        })
        .mockResolvedValueOnce({ 
          rows: [{ 
            user_id: mockUser.id,
            roles: '["data_viewer"]',
            permissions: '["READ_RESTRICTED"]'
          }] 
        })
        .mockResolvedValueOnce({ 
          rows: [{ request_id: 'req-manual-456' }] 
        });

      const result = await dataAccessService.requestAccess(highRiskRequest);

      expect(result.status).toBe('pending');
      expect(result.requestId).toBe('req-manual-456');
      expect(result.message).toContain('manual approval required');
    });

    it('should validate request data before processing', async () => {
      const invalidRequest = {
        ...accessRequest,
        reason: 'short' // Too short
      };

      await expect(dataAccessService.requestAccess(invalidRequest))
        .rejects.toThrow('Reason must be at least 10 characters');
    });
  });

  describe('getUserAccessHistory', () => {
    it('should return paginated access history for user', async () => {
      const mockHistory = [
        {
          id: 'audit-1',
          user_id: mockUser.id,
          resource_id: 'res-1',
          operation: 'READ',
          allowed: true,
          reason: 'Access granted',
          classification: 'INTERNAL',
          access_level: 'GRANTED',
          timestamp: new Date(),
          risk_score: 25
        },
        {
          id: 'audit-2',
          user_id: mockUser.id,
          resource_id: 'res-2',
          operation: 'WRITE',
          allowed: false,
          reason: 'Insufficient permissions',
          classification: 'CONFIDENTIAL',
          access_level: 'DENIED',
          timestamp: new Date(),
          risk_score: 75
        }
      ];

      mockDb.query.mockResolvedValueOnce({ rows: mockHistory });

      const result = await dataAccessService.getUserAccessHistory(mockUser.id, 10, 0);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 'audit-1',
        userId: mockUser.id,
        resourceId: 'res-1',
        operation: 'READ',
        allowed: true,
        reason: 'Access granted',
        classification: 'INTERNAL',
        accessLevel: 'GRANTED',
        timestamp: expect.any(Date),
        riskScore: 25
      });
    });
  });

  describe('getUserAccessGrants', () => {
    it('should return active access grants for user', async () => {
      const mockGrants = [
        {
          id: 'grant-1',
          resource_id: 'res-1',
          resource_type: 'customer_data',
          operations: '["READ","WRITE"]',
          classification: 'CONFIDENTIAL',
          granted_by: 'admin-1',
          granted_at: new Date(),
          expires_at: new Date(Date.now() + 86400000),
          reason: 'Temporary access for audit',
          restrictions: '[]'
        }
      ];

      mockDb.query.mockResolvedValueOnce({ rows: mockGrants });

      const result = await dataAccessService.getUserAccessGrants(mockUser.id);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'grant-1',
        resourceId: 'res-1',
        resourceType: 'customer_data',
        operations: ['READ', 'WRITE'],
        classification: 'CONFIDENTIAL',
        grantedBy: 'admin-1',
        grantedAt: expect.any(Date),
        expiresAt: expect.any(Date),
        reason: 'Temporary access for audit',
        restrictions: []
      });
    });
  });

  describe('revokeAccess', () => {
    it('should successfully revoke existing access grant', async () => {
      mockDb.query.mockResolvedValueOnce({ rowCount: 1 });

      const result = await dataAccessService.revokeAccess('grant-123', 'admin-456', 'No longer needed');

      expect(result).toBe(true);
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE data_access_grants'),
        expect.arrayContaining(['grant-123', 'admin-456', 'No longer needed'])
      );
    });

    it('should return false for non-existent grant', async () => {
      mockDb.query.mockResolvedValueOnce({ rowCount: 0 });

      const result = await dataAccessService.revokeAccess('nonexistent-grant', 'admin-456', 'Test');

      expect(result).toBe(false);
    });
  });

  describe('Private helper methods', () => {
    describe('calculateRiskScore', () => {
      it('should calculate higher risk for suspicious indicators', () => {
        const suspiciousContext = {
          sessionId: 'session-123',
          ipAddress: '1.2.3.4',
          userAgent: 'Suspicious Bot',
          purpose: 'data_export'
        };

        const riskScore = (dataAccessService as any).calculateRiskScore(
          mockUser.id,
          'CONFIDENTIAL',
          'EXPORT',
          suspiciousContext
        );

        expect(riskScore).toBeGreaterThan(50);
      });

      it('should calculate lower risk for normal access patterns', () => {
        const normalContext = {
          sessionId: 'session-123',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          purpose: 'normal_work'
        };

        const riskScore = (dataAccessService as any).calculateRiskScore(
          mockUser.id,
          'INTERNAL',
          'READ',
          normalContext
        );

        expect(riskScore).toBeLessThan(50);
      });
    });

    describe('getRequiredPermission', () => {
      it('should return correct permission for operation and classification', () => {
        const permission = (dataAccessService as any).getRequiredPermission('READ', 'CONFIDENTIAL');
        expect(permission).toBe('READ_CONFIDENTIAL');

        const writePermission = (dataAccessService as any).getRequiredPermission('write', 'RESTRICTED');
        expect(writePermission).toBe('WRITE_RESTRICTED');
      });
    });

    describe('shouldAutoApprove', () => {
      it('should auto-approve for data owners with sufficient permissions', () => {
        const shouldApprove = (dataAccessService as any).shouldAutoApprove(
          mockUser.id,
          'owner-123', // Different owner
          'INTERNAL',
          'READ',
          25, // Low risk
          ['READ_INTERNAL']
        );

        expect(shouldApprove).toBe(false);

        const shouldApproveOwner = (dataAccessService as any).shouldAutoApprove(
          mockUser.id,
          mockUser.id, // Same user is owner
          'INTERNAL',
          'READ',
          25,
          ['READ_INTERNAL']
        );

        expect(shouldApproveOwner).toBe(true);
      });

      it('should not auto-approve high-risk requests', () => {
        const shouldApprove = (dataAccessService as any).shouldAutoApprove(
          mockUser.id,
          mockUser.id,
          'RESTRICTED',
          'DELETE',
          85, // High risk
          ['DELETE_RESTRICTED']
        );

        expect(shouldApprove).toBe(false);
      });
    });
  });

  describe('Error handling', () => {
    it('should handle malformed JSON in database fields', async () => {
      mockDb.query
        .mockResolvedValueOnce({ 
          rows: [{ 
            classification: 'INTERNAL',
            owner_id: 'owner-123',
            metadata: 'invalid-json'
          }] 
        });

      // Should not throw but handle gracefully
      const result = await dataAccessService.checkAccess({
        userId: mockUser.id,
        resourceId: mockResource.id,
        resourceType: mockResource.type,
        operation: 'READ'
      });

      expect(result.allowed).toBeDefined();
    });

    it('should handle missing context gracefully', async () => {
      const requestWithoutContext: DataAccessRequest = {
        userId: mockUser.id,
        resourceId: mockResource.id,
        resourceType: mockResource.type,
        operation: 'READ'
      };

      mockDb.query
        .mockResolvedValueOnce({ 
          rows: [{ 
            classification: 'PUBLIC',
            owner_id: 'owner-123',
            metadata: '{}'
          }] 
        })
        .mockResolvedValueOnce({ 
          rows: [{ 
            user_id: mockUser.id,
            roles: '["employee"]',
            permissions: '["READ_PUBLIC"]'
          }] 
        })
        .mockResolvedValueOnce({ rowCount: 1 });

      const result = await dataAccessService.checkAccess(requestWithoutContext);

      expect(result.allowed).toBe(true);
      expect(result.auditId).toBeDefined();
    });
  });
});