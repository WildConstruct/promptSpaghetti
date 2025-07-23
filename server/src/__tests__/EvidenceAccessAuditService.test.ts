/**
 * Evidence Access Audit Service Tests
 * 
 * Comprehensive test suite for evidence access audit trail functionality.
 * Tests all core features including logging, integrity, reporting, and security.
 * 
 * Task: T-1752989143998-782 - Add evidence access audit trail
 * Epic: 18 - Technical Debt & Refactoring
 */

import { 
  EvidenceAccessAuditService,
  EvidenceAccessAction,
  EvidenceAccessOutcome,
  EvidenceAccessAuditEntry
} from '../services/security/EvidenceAccessAuditService';
import { AccessControlFramework, AccessControlContext } from '../services/security/AccessControlFramework';
import { AuditService } from '../auth/services/AuditService';
import { EvidenceVersioningService } from '../services/EvidenceVersioningService';
import { DatabaseService } from '../auth/database/DatabaseService';
import { UserAccessTransparency } from '../../packages/core/security/UserAccessTransparency';

// Mock dependencies
jest.mock('../auth/services/AuditService');
jest.mock('../services/security/AccessControlFramework');
jest.mock('../services/EvidenceVersioningService');
jest.mock('../auth/database/DatabaseService');
jest.mock('../../packages/core/security/UserAccessTransparency');

describe('EvidenceAccessAuditService', () => {
  let auditService: EvidenceAccessAuditService;
  let mockAuditService: jest.Mocked<AuditService>;
  let mockAccessControlFramework: jest.Mocked<AccessControlFramework>;
  let mockEvidenceVersioningService: jest.Mocked<EvidenceVersioningService>;
  let mockDatabaseService: jest.Mocked<DatabaseService>;
  let mockUserAccessTransparency: jest.Mocked<UserAccessTransparency>;
  let mockConnection: any;

  beforeEach(() => {
    // Setup mocks
    mockAuditService = new AuditService({} as any) as jest.Mocked<AuditService>;
    mockAccessControlFramework = new AccessControlFramework() as jest.Mocked<AccessControlFramework>;
    mockEvidenceVersioningService = new EvidenceVersioningService() as jest.Mocked<EvidenceVersioningService>;
    mockDatabaseService = new DatabaseService({} as any) as jest.Mocked<DatabaseService>;
    mockUserAccessTransparency = new UserAccessTransparency() as jest.Mocked<UserAccessTransparency>;

    // Setup database connection mock
    mockConnection = {
      query: jest.fn().mockResolvedValue({ rows: [] }),
      release: jest.fn()
    };
    mockDatabaseService.getConnection.mockResolvedValue(mockConnection);

    // Setup audit service mock
    mockAuditService.log = jest.fn().mockResolvedValue(undefined);

    // Setup user access transparency mock
    mockUserAccessTransparency.recordDataAccess = jest.fn().mockResolvedValue(undefined);

    // Create service instance
    auditService = new EvidenceAccessAuditService(
      mockAuditService,
      mockAccessControlFramework,
      mockEvidenceVersioningService,
      mockDatabaseService,
      mockUserAccessTransparency
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('recordEvidenceAccess', () => {
    const createTestContext = (): AccessControlContext => ({
      subject: {
        id: 'user123',
        type: 'user',
        sessionId: 'session456',
        roles: ['analyst'],
        permissions: ['evidence:read']
      },
      resource: {
        id: 'evidence789',
        type: 'evidence',
        attributes: {}
      },
      action: {
        operation: 'read',
        intent: 'investigation'
      },
      environment: {
        timestamp: new Date(),
        sourceIP: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        applicationContext: 'web',
        networkZone: 'internal',
        deviceType: 'desktop',
        securityLevel: 'standard'
      }
    });

    it('should successfully record evidence access with all metadata', async () => {
      const context = createTestContext();
      const evidenceId = 'evidence789';
      const action = EvidenceAccessAction.READ;
      const outcome = EvidenceAccessOutcome.SUCCESS;

      const result = await auditService.recordEvidenceAccess(
        context,
        evidenceId,
        action,
        outcome,
        { requestId: 'req123' }
      );

      expect(result).toBeDefined();
      expect(result.evidenceId).toBe(evidenceId);
      expect(result.action.type).toBe(action);
      expect(result.outcome).toBe(outcome);
      expect(result.subject.userId).toBe('user123');
      expect(result.correlationId).toBeDefined();
      expect(result.contentHash).toBeDefined();
      expect(result.processingTime).toBeGreaterThanOrEqual(0);

      // Verify database insertion
      expect(mockConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO evidence_access_audit'),
        expect.arrayContaining([
          result.id,
          result.timestamp,
          evidenceId,
          expect.any(String), // evidence version
          'user123'
        ])
      );

      // Verify audit service logging
      expect(mockAuditService.log).toHaveBeenCalledWith({
        userId: 'user123',
        action: 'evidence_read',
        resource: evidenceId,
        outcome: 'success',
        metadata: expect.objectContaining({
          riskLevel: expect.any(String),
          correlationId: result.correlationId
        })
      });

      // Verify user access transparency update
      expect(mockUserAccessTransparency.recordDataAccess).toHaveBeenCalledWith(
        'user123',
        evidenceId,
        action,
        result.timestamp
      );
    });

    it('should calculate risk score based on context and evidence metadata', async () => {
      const context = createTestContext();
      // Set external IP for higher risk
      context.environment.sourceIP = '203.0.113.1';
      
      const result = await auditService.recordEvidenceAccess(
        context,
        'evidence789',
        EvidenceAccessAction.EXPORT,
        EvidenceAccessOutcome.SUCCESS
      );

      expect(result.risk.score).toBeGreaterThan(0);
      expect(result.risk.level).toMatch(/LOW|MEDIUM|HIGH|CRITICAL/);
      expect(result.risk.factors).toBeInstanceOf(Array);
    });

    it('should handle high-risk access scenarios', async () => {
      const context = createTestContext();
      context.environment.sourceIP = '203.0.113.1'; // External IP
      
      // Mock current time to be outside business hours
      const mockDate = new Date('2023-12-25T03:00:00Z'); // Christmas at 3 AM
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);
      jest.spyOn(Date, 'now').mockReturnValue(mockDate.getTime());

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = await auditService.recordEvidenceAccess(
        context,
        'evidence789',
        EvidenceAccessAction.DELETE,
        EvidenceAccessOutcome.SUCCESS
      );

      expect(result.risk.level).toMatch(/HIGH|CRITICAL/);
      expect(result.risk.factors).toContain('external_access');
      expect(result.risk.factors).toContain('outside_business_hours');

      // Should trigger security alert for high risk
      expect(consoleSpy).toHaveBeenCalledWith(
        'High-risk evidence access detected:',
        expect.objectContaining({
          evidenceId: 'evidence789',
          userId: 'user123',
          riskLevel: result.risk.level
        })
      );

      consoleSpy.mockRestore();
      jest.restoreAllMocks();
    });

    it('should create proper chain hash for integrity verification', async () => {
      const context = createTestContext();
      
      // Record first access
      const firstEntry = await auditService.recordEvidenceAccess(
        context,
        'evidence789',
        EvidenceAccessAction.READ,
        EvidenceAccessOutcome.SUCCESS
      );

      expect(firstEntry.chainHash).toBeDefined();
      expect(firstEntry.contentHash).toBeDefined();
      expect(firstEntry.contentHash).toHaveLength(64); // SHA-256 hex
    });

    it('should handle audit failures gracefully', async () => {
      const context = createTestContext();
      mockConnection.query.mockRejectedValueOnce(new Error('Database error'));

      await expect(
        auditService.recordEvidenceAccess(
          context,
          'evidence789',
          EvidenceAccessAction.READ,
          EvidenceAccessOutcome.SUCCESS
        )
      ).rejects.toThrow('Database error');

      // Should log the audit failure
      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'audit_failure',
          outcome: 'error'
        })
      );
    });

    it('should set appropriate retention periods based on classification', async () => {
      const context = createTestContext();
      
      const result = await auditService.recordEvidenceAccess(
        context,
        'evidence789',
        EvidenceAccessAction.READ,
        EvidenceAccessOutcome.SUCCESS
      );

      expect(result.retentionPeriod).toBeGreaterThan(0);
      expect(typeof result.retentionPeriod).toBe('number');
    });
  });

  describe('getAuditTrail', () => {
    it('should retrieve audit trail with filters', async () => {
      const mockRows = [
        {
          id: 'audit1',
          timestamp: new Date(),
          evidence_id: 'evidence789',
          subject_user_id: 'user123',
          action_type: 'READ',
          outcome: 'SUCCESS',
          risk_level: 'LOW',
          risk_score: 25,
          content_hash: 'hash1',
          chain_hash: 'chain1',
          correlation_id: 'corr1',
          subject_session_id: 'session1',
          subject_roles: JSON.stringify(['analyst']),
          subject_permissions: JSON.stringify(['evidence:read']),
          subject_ip_address: '192.168.1.100',
          subject_user_agent: 'Mozilla/5.0',
          resource_evidence_type: 'document',
          resource_classification_level: 'confidential',
          resource_sensitivity_score: 0.7,
          resource_data_location: 'primary_storage',
          resource_compliance_frameworks: JSON.stringify(['GDPR']),
          action_operation: 'read',
          action_intent: 'investigation',
          action_parameters: JSON.stringify({}),
          action_result_size: null,
          environment_application_context: 'web',
          environment_network_zone: 'internal',
          environment_device_type: 'desktop',
          environment_security_level: 'standard',
          environment_geo_location: null,
          risk_factors: JSON.stringify([]),
          risk_mitigations: JSON.stringify([]),
          retention_period: 365,
          compliance_flags: JSON.stringify(['GDPR_TRACKED']),
          legal_hold: false,
          processing_time: 150,
          error_details: null,
          metadata: JSON.stringify({})
        }
      ];
      
      mockConnection.query.mockResolvedValue({ rows: mockRows });

      const result = await auditService.getAuditTrail({
        evidenceId: 'evidence789',
        limit: 10
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'audit1',
        evidenceId: 'evidence789',
        subject: {
          userId: 'user123',
          roles: ['analyst'],
          permissions: ['evidence:read']
        },
        action: {
          type: EvidenceAccessAction.READ,
          operation: 'read'
        },
        outcome: EvidenceAccessOutcome.SUCCESS
      });

      expect(mockConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE 1=1 AND evidence_id = $1'),
        expect.arrayContaining(['evidence789', 10, 0])
      );
    });

    it('should apply multiple filters correctly', async () => {
      mockConnection.query.mockResolvedValue({ rows: [] });

      await auditService.getAuditTrail({
        evidenceId: 'evidence789',
        userId: 'user123',
        action: EvidenceAccessAction.READ,
        outcome: EvidenceAccessOutcome.SUCCESS,
        riskLevel: 'HIGH',
        dateFrom: new Date('2023-01-01'),
        dateTo: new Date('2023-12-31'),
        limit: 50,
        offset: 10
      });

      expect(mockConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('evidence_id = $1'),
        expect.arrayContaining(['evidence789', 'user123', 'READ', 'SUCCESS', 'HIGH'])
      );
    });
  });

  describe('generateAuditReport', () => {
    it('should generate comprehensive audit report with analytics', async () => {
      const mockEntries: Partial<EvidenceAccessAuditEntry>[] = [
        {
          id: 'audit1',
          timestamp: new Date('2023-06-01T10:00:00Z'),
          evidenceId: 'evidence1',
          subject: { userId: 'user1' } as any,
          action: { type: EvidenceAccessAction.READ } as any,
          outcome: EvidenceAccessOutcome.SUCCESS,
          risk: { level: 'LOW', score: 20 } as any,
          processingTime: 100
        },
        {
          id: 'audit2',
          timestamp: new Date('2023-06-01T11:00:00Z'),
          evidenceId: 'evidence2',
          subject: { userId: 'user2' } as any,
          action: { type: EvidenceAccessAction.WRITE } as any,
          outcome: EvidenceAccessOutcome.DENIED,
          risk: { level: 'HIGH', score: 80 } as any,
          processingTime: 150
        }
      ];

      jest.spyOn(auditService, 'getAuditTrail').mockResolvedValue(mockEntries as EvidenceAccessAuditEntry[]);

      const report = await auditService.generateAuditReport({
        dateFrom: new Date('2023-06-01'),
        dateTo: new Date('2023-06-01')
      });

      expect(report.summary.totalAccesses).toBe(2);
      expect(report.summary.uniqueUsers).toBe(2);
      expect(report.summary.riskDistribution).toEqual({
        'LOW': 1,
        'HIGH': 1
      });
      expect(report.summary.actionDistribution).toEqual({
        'READ': 1,
        'WRITE': 1
      });
      expect(report.summary.outcomeDistribution).toEqual({
        'SUCCESS': 1,
        'DENIED': 1
      });
      expect(report.entries).toHaveLength(2);
      expect(report.insights).toBeDefined();
      expect(report.exportTimestamp).toBeInstanceOf(Date);
    });

    it('should identify suspicious patterns in audit data', async () => {
      // Create mock entries with high-risk pattern
      const mockEntries: Partial<EvidenceAccessAuditEntry>[] = Array.from({ length: 10 }, (_, i) => ({
        id: `audit${i}`,
        timestamp: new Date(),
        evidenceId: 'evidence1',
        subject: { userId: 'user1' } as any,
        action: { type: EvidenceAccessAction.READ } as any,
        outcome: EvidenceAccessOutcome.SUCCESS,
        risk: { level: 'HIGH', score: 85 } as any,
        processingTime: 100
      }));

      jest.spyOn(auditService, 'getAuditTrail').mockResolvedValue(mockEntries as EvidenceAccessAuditEntry[]);

      const report = await auditService.generateAuditReport({});

      expect(report.insights.suspiciousPatterns).toContain(
        expect.stringContaining('High risk access pattern detected')
      );
    });

    it('should identify performance issues in audit data', async () => {
      const mockEntries: Partial<EvidenceAccessAuditEntry>[] = [
        {
          id: 'audit1',
          timestamp: new Date(),
          evidenceId: 'evidence1',
          subject: { userId: 'user1' } as any,
          action: { type: EvidenceAccessAction.READ } as any,
          outcome: EvidenceAccessOutcome.SUCCESS,
          risk: { level: 'LOW', score: 20 } as any,
          processingTime: 6000 // Slow operation (>5s)
        }
      ];

      jest.spyOn(auditService, 'getAuditTrail').mockResolvedValue(mockEntries as EvidenceAccessAuditEntry[]);

      const report = await auditService.generateAuditReport({});

      expect(report.insights.performanceAlerts).toContain(
        expect.stringContaining('slow audit operations')
      );
    });
  });

  describe('verifyAuditIntegrity', () => {
    it('should verify audit trail integrity successfully', async () => {
      const mockEntries: Partial<EvidenceAccessAuditEntry>[] = [
        {
          id: 'audit1',
          timestamp: new Date('2023-06-01T10:00:00Z'),
          contentHash: 'content1',
          chainHash: 'chain1'
        },
        {
          id: 'audit2', 
          timestamp: new Date('2023-06-01T11:00:00Z'),
          contentHash: 'content2',
          chainHash: 'chain2'
        }
      ];

      jest.spyOn(auditService, 'getAuditTrail').mockResolvedValue(mockEntries as EvidenceAccessAuditEntry[]);

      // Mock hash calculation to return expected values
      const originalCalculateChainHash = (auditService as any).calculateChainHash;
      (auditService as any).calculateChainHash = jest.fn()
        .mockResolvedValueOnce('chain1')
        .mockResolvedValueOnce('chain2');

      const result = await auditService.verifyAuditIntegrity('evidence789');

      expect(result.isValid).toBe(true);
      expect(result.brokenChains).toHaveLength(0);
      expect(result.verificationReport).toMatchObject({
        totalEntries: 2,
        verifiedEntries: 2,
        integrityScore: 100
      });

      // Restore original method
      (auditService as any).calculateChainHash = originalCalculateChainHash;
    });

    it('should detect broken chain integrity', async () => {
      const mockEntries: Partial<EvidenceAccessAuditEntry>[] = [
        {
          id: 'audit1',
          timestamp: new Date('2023-06-01T10:00:00Z'),
          contentHash: 'content1',
          chainHash: 'chain1'
        },
        {
          id: 'audit2',
          timestamp: new Date('2023-06-01T11:00:00Z'),
          contentHash: 'content2',
          chainHash: 'wrong_chain_hash' // Broken chain
        }
      ];

      jest.spyOn(auditService, 'getAuditTrail').mockResolvedValue(mockEntries as EvidenceAccessAuditEntry[]);

      // Mock hash calculation
      (auditService as any).calculateChainHash = jest.fn()
        .mockResolvedValueOnce('chain1')
        .mockResolvedValueOnce('expected_chain2');

      const result = await auditService.verifyAuditIntegrity('evidence789');

      expect(result.isValid).toBe(false);
      expect(result.brokenChains).toContain('audit2');
      expect(result.verificationReport.integrityScore).toBe(50); // 1 out of 2 verified
    });
  });

  describe('Security and Edge Cases', () => {
    it('should handle null or undefined values gracefully', async () => {
      const context = {
        subject: { id: 'user123', type: 'user' },
        resource: { id: 'evidence789', type: 'evidence', attributes: {} },
        action: { operation: 'read' },
        environment: { timestamp: new Date() }
      } as AccessControlContext;

      const result = await auditService.recordEvidenceAccess(
        context,
        'evidence789',
        EvidenceAccessAction.READ,
        EvidenceAccessOutcome.SUCCESS
      );

      expect(result).toBeDefined();
      expect(result.subject.roles).toEqual([]);
      expect(result.subject.permissions).toEqual([]);
    });

    it('should prevent SQL injection in audit queries', async () => {
      mockConnection.query.mockResolvedValue({ rows: [] });

      await auditService.getAuditTrail({
        evidenceId: 'evidence\'; DROP TABLE evidence_access_audit; --',
        userId: 'user\'; DELETE FROM users; --'
      });

      // Verify parameterized queries are used
      expect(mockConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('evidence_id = $'),
        expect.arrayContaining([
          'evidence\'; DROP TABLE evidence_access_audit; --',
          'user\'; DELETE FROM users; --'
        ])
      );
    });

    it('should handle concurrent audit operations', async () => {
      const context = {
        subject: { id: 'user123', type: 'user' },
        resource: { id: 'evidence789', type: 'evidence', attributes: {} },
        action: { operation: 'read' },
        environment: { timestamp: new Date() }
      } as AccessControlContext;

      // Simulate concurrent audit operations
      const promises = Array.from({ length: 10 }, () =>
        auditService.recordEvidenceAccess(
          context,
          'evidence789',
          EvidenceAccessAction.READ,
          EvidenceAccessOutcome.SUCCESS
        )
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result.correlationId).toBeDefined();
        expect(result.id).toBeDefined();
      });

      // Verify all operations were recorded
      expect(mockConnection.query).toHaveBeenCalledTimes(10);
    });

    it('should handle large metadata objects', async () => {
      const context = {
        subject: { id: 'user123', type: 'user' },
        resource: { id: 'evidence789', type: 'evidence', attributes: {} },
        action: { operation: 'read' },
        environment: { timestamp: new Date() }
      } as AccessControlContext;

      const largeMetadata = {
        largeArray: Array.from({ length: 1000 }, (_, i) => `item${i}`),
        nestedObject: {
          level1: {
            level2: {
              level3: 'deep nested value'
            }
          }
        },
        binaryData: Buffer.from('binary data').toString('base64')
      };

      const result = await auditService.recordEvidenceAccess(
        context,
        'evidence789',
        EvidenceAccessAction.READ,
        EvidenceAccessOutcome.SUCCESS,
        largeMetadata
      );

      expect(result.metadata).toMatchObject(largeMetadata);
    });
  });

  describe('Performance Tests', () => {
    it('should complete audit recording within performance threshold', async () => {
      const context = {
        subject: { id: 'user123', type: 'user' },
        resource: { id: 'evidence789', type: 'evidence', attributes: {} },
        action: { operation: 'read' },
        environment: { timestamp: new Date() }
      } as AccessControlContext;

      const startTime = Date.now();
      
      await auditService.recordEvidenceAccess(
        context,
        'evidence789',
        EvidenceAccessAction.READ,
        EvidenceAccessOutcome.SUCCESS
      );

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle batch audit operations efficiently', async () => {
      const context = {
        subject: { id: 'user123', type: 'user' },
        resource: { id: 'evidence789', type: 'evidence', attributes: {} },
        action: { operation: 'read' },
        environment: { timestamp: new Date() }
      } as AccessControlContext;

      const batchSize = 100;
      const startTime = Date.now();

      // Simulate batch operations
      const promises = Array.from({ length: batchSize }, (_, i) =>
        auditService.recordEvidenceAccess(
          context,
          `evidence${i}`,
          EvidenceAccessAction.READ,
          EvidenceAccessOutcome.SUCCESS
        )
      );

      await Promise.all(promises);

      const duration = Date.now() - startTime;
      const avgTimePerOperation = duration / batchSize;
      
      expect(avgTimePerOperation).toBeLessThan(100); // Less than 100ms per operation
    });
  });
});