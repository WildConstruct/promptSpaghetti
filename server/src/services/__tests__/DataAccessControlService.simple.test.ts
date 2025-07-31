// Simple DataAccessControlService Tests - Epic 19.4
// Basic functionality tests for data access control

import { DataAccessControlService, DataAccessRequest, DataOperation } from '../DataAccessControlService';
import { AuditService } from '../../auth/services/AuditService';

// Mock dependencies
jest.mock('../../auth/services/AuditService');

// Mock database with successful responses
const mockDb = {
  query: jest.fn<unknown[], unknown>().mockResolvedValue({
    rows: [
      {
        classification: 'INTERNAL',
        owner_id: 'owner-123',
        metadata: '{}',
      },
    ],
  } as unknown as unknown),
};

describe('DataAccessControlService - Basic Tests', () => {
  let dataAccessService: DataAccessControlService;
  let mockAuditService: jest.Mocked<AuditService>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockAuditService = {
      logSecurityEvent: jest.fn<unknown[], unknown>().mockResolvedValue(undefined as unknown as unknown),
    } as any;

    dataAccessService = new DataAccessControlService(mockDb as any, mockAuditService);
  });

  describe('Service Initialization', () => {
    it('should initialize with required dependencies', () => {
      expect(dataAccessService).toBeInstanceOf(DataAccessControlService);
    });
  });

  describe('Basic Access Check', () => {
    it('should handle simple access request', async () => {
      const request: DataAccessRequest = {
        userId: 'user-123',
        resourceId: 'resource-456',
        resourceType: 'customer_data',
        operation: 'READ' as DataOperation,
      };

      // This test just verifies the method doesn't throw an error
      const result = await dataAccessService.checkAccess(request);

      expect(result).toBeDefined();
      expect(result.allowed).toBeDefined();
      expect(result.reason).toBeDefined();
    });
  });

  describe('User Access History', () => {
    it('should return user access history', async () => {
      const mockHistory = [
        {
          id: 'audit-1',
          user_id: 'user-123',
          resource_id: 'res-1',
          operation: 'READ',
          allowed: true,
          reason: 'Access granted',
          classification: 'INTERNAL',
          access_level: 'GRANTED',
          timestamp: new Date(),
          risk_score: 25,
        },
      ];

      mockDb.query.mockResolvedValueOnce({ rows: mockHistory });

      const result = await dataAccessService.getUserAccessHistory('user-123', 10, 0);

      expect(result).toHaveLength(1);
      expect(result[0].userId).toBe('user-123');
    });
  });

  describe('User Access Grants', () => {
    it('should return user access grants', async () => {
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
          reason: 'Temporary access',
          restrictions: '[]',
        },
      ];

      mockDb.query.mockResolvedValueOnce({ rows: mockGrants });

      const result = await dataAccessService.getUserAccessGrants('user-123');

      expect(result).toHaveLength(1);
      expect(result[0].resourceId).toBe('res-1');
    });
  });

  describe('Access Revocation', () => {
    it('should revoke access grant', async () => {
      mockDb.query.mockResolvedValueOnce({
        rows: [
          {
            user_id: 'user-123',
            resource_id: 'res-1',
          },
        ],
      }); // Find grant
      mockDb.query.mockResolvedValueOnce({ rowCount: 1 }); // Update grant

      const result = await dataAccessService.revokeAccess('grant-123', 'admin-456', 'No longer needed');

      expect(result).toBe(true);
    });

    it('should handle non-existent grant', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] }); // Grant not found

      const result = await dataAccessService.revokeAccess('nonexistent', 'admin-456', 'Test');

      expect(result).toBe(false);
    });
  });
});
