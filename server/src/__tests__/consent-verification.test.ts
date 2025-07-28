// Consent Verification Tests - Epic 19
// Comprehensive testing for consent verification functionality
// Task: T-1752989143998-282

import { ConsentBasedDataFilterService, FilterRequest, DataOperation } from '../services/ConsentBasedDataFilterService';
import { DatabaseService } from '../database/DatabaseService';
import { AuditService } from '../auth/services/AuditService';

describe('ConsentBasedDataFilterService', () => {
  let service: ConsentBasedDataFilterService;
  let mockDb: jest.Mocked<DatabaseService>;
  let mockAudit: jest.Mocked<AuditService>;

  beforeEach(() => {
    mockDb = {
      query: jest.fn()
    } as any;

    mockAudit = {
      logEvent: jest.fn().mockResolvedValue('audit-id-123')
    } as any;

    service = new ConsentBasedDataFilterService(mockDb, mockAudit);
  });

  describe('filterDataAccess', () => {
    const baseRequest: FilterRequest = {
      userId: 'user-123',
      dataType: 'personal_data',
      operation: DataOperation.READ,
      purpose: 'service_delivery',
      context: {
        requestId: 'req-123',
        sessionId: 'session-123',
        ipAddress: '192.168.1.1',
        userAgent: 'test-agent',
        timestamp: new Date()
      }
    };

    it('should allow access when valid consent exists', async () => {
      mockDb.query.mockResolvedValue({
        rows: [{
          consent_data: {
            granularConsents: [{
              purpose: 'service_delivery',
              dataTypes: ['personal_data'],
              required: true,
              granted: true,
              grantedAt: new Date(),
              expiresAt: new Date(Date.now() + 86400000) // 1 day from now
            }]
          }
        }]
      });

      const result = await service.filterDataAccess(baseRequest);

      expect(result.allowed).toBe(true);
      expect(result.reason).toBe('Access granted based on valid consent');
      expect(result.auditEventId).toBe('audit-id-123');
    });

    it('should deny access when required consent not granted', async () => {
      mockDb.query.mockResolvedValue({
        rows: [{
          consent_data: {
            granularConsents: [{
              purpose: 'service_delivery',
              dataTypes: ['personal_data'],
              required: true,
              granted: false,
              grantedAt: null,
              expiresAt: null
            }]
          }
        }]
      });

      const result = await service.filterDataAccess(baseRequest);

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Required consent not granted');
      expect(result.consentRequired).toBe(true);
    });

    it('should deny access when consent is expired', async () => {
      mockDb.query.mockResolvedValue({
        rows: [{
          consent_data: {
            granularConsents: [{
              purpose: 'service_delivery',
              dataTypes: ['personal_data'],
              required: true,
              granted: true,
              grantedAt: new Date(Date.now() - 172800000), // 2 days ago
              expiresAt: new Date(Date.now() - 86400000) // 1 day ago (expired)
            }]
          }
        }]
      });

      const result = await service.filterDataAccess(baseRequest);

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Consent expired');
      expect(result.consentRequired).toBe(true);
    });

    it('should deny access when no consent found', async () => {
      mockDb.query.mockResolvedValue({
        rows: []
      });

      const result = await service.filterDataAccess(baseRequest);

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('No valid consent found for requested operation');
      expect(result.consentRequired).toBe(true);
    });

    it('should handle different data operations correctly', async () => {
      mockDb.query.mockResolvedValue({
        rows: [{
          consent_data: {
            granularConsents: [{
              purpose: 'analytics',
              dataTypes: ['usage_data'],
              required: true,
              granted: true,
              grantedAt: new Date(),
              expiresAt: new Date(Date.now() + 86400000)
            }]
          }
        }]
      });

      const analyticsRequest = {
        ...baseRequest,
        dataType: 'usage_data',
        operation: DataOperation.ANALYZE,
        purpose: 'analytics'
      };

      const result = await service.filterDataAccess(analyticsRequest);

      expect(result.allowed).toBe(true);
      expect(mockAudit.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'CONSENT_FILTER_DECISION',
          userId: 'user-123'
  }
      );
    });
  });

  describe('getUserConsents', () => {
    it('should retrieve and transform user consents correctly', async () => {
      const mockConsentData = {
        granularConsents: [
          {
            purpose: 'service_delivery',
            dataTypes: ['personal_data', 'contact_info'],
            required: true,
            granted: true,
            grantedAt: new Date(),
            expiresAt: null
  }
          {
            purpose: 'marketing',
            dataTypes: ['email', 'preferences'],
            required: false,
            granted: false,
            grantedAt: null,
            expiresAt: null
          }
        ]
      };

      mockDb.query.mockResolvedValue({
        rows: [{ consent_data: mockConsentData }]
      });

      const consents = await service.getUserConsents('user-123');

      expect(consents).toHaveLength(2);
      expect(consents[0]).toEqual(expect.objectContaining({
        purpose: 'service_delivery',
        dataTypes: ['personal_data', 'contact_info'],
        granted: true
      }));
      expect(consents[1]).toEqual(expect.objectContaining({
        purpose: 'marketing',
        dataTypes: ['email', 'preferences'],
        granted: false
      }));
    });

    it('should filter out withdrawn or inactive consents', async () => {
      mockDb.query.mockResolvedValue({
        rows: []
      });

      const consents = await service.getUserConsents('user-123');

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('status = \'ACTIVE\''),
        ['user-123']
      );
      expect(consents).toHaveLength(0);
    });
  });

  describe('getFilterableFields', () => {
    it('should return appropriate fields based on granted consents', async () => {
      mockDb.query.mockResolvedValue({
        rows: [{
          consent_data: {
            granularConsents: [
              {
                purpose: 'service_delivery',
                dataTypes: ['user_profile'],
                granted: true
  }
              {
                purpose: 'analytics',
                dataTypes: ['user_profile'],
                granted: true
              }
            ]
          }
        }]
      });

      const fields = await service.getFilterableFields('user-123', 'user_profile');

      expect(fields).toContain('id');
      expect(fields).toContain('name');
      expect(fields).toContain('usage_data');
      expect(fields.length).toBeGreaterThan(0);
    });

    it('should return empty array when no consents granted', async () => {
      mockDb.query.mockResolvedValue({
        rows: [{
          consent_data: {
            granularConsents: [{
              purpose: 'marketing',
              dataTypes: ['user_profile'],
              granted: false
            }]
          }
        }]
      });

      const fields = await service.getFilterableFields('user-123', 'user_profile');

      expect(fields).toHaveLength(0);
    });
  });

  describe('error handling', () => {
    it('should handle database errors gracefully', async () => {
      mockDb.query.mockRejectedValue(new Error('Database connection failed'));

      await expect(service.filterDataAccess(baseRequest)).rejects.toThrow('Database connection failed');
    });

    it('should handle malformed consent data', async () => {
      mockDb.query.mockResolvedValue({
        rows: [{
          consent_data: null
        }]
      });

      await expect(service.filterDataAccess(baseRequest)).rejects.toThrow();
    });
  });

  describe('audit logging', () => {
    it('should log all filter decisions', async () => {
      mockDb.query.mockResolvedValue({ rows: [] });

      await service.filterDataAccess(baseRequest);

      expect(mockAudit.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'CONSENT_FILTER_DECISION',
          userId: 'user-123',
          details: expect.objectContaining({
            dataType: 'personal_data',
            operation: 'read',
            purpose: 'service_delivery'
  }
  }
      );
    });

    it('should include context information in audit logs', async () => {
      mockDb.query.mockResolvedValue({ rows: [] });

      await service.filterDataAccess(baseRequest);

      expect(mockAudit.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          ipAddress: '192.168.1.1',
          userAgent: 'test-agent',
          sessionId: 'session-123'
  }
      );
    });
  });
});