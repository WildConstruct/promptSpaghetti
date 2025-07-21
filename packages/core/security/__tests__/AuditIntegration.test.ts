/**
 * @jest-environment jsdom
 * 
 * Integration tests for audit logging with classification enforcement
 * Epic 19 Task T-1752989143998-485: Implement audit logging for data access
 */

import { AuditLogger, AuditOperation, createAuditLogger } from '../AuditLogger';
import { AuditIntegration, createAuditIntegration } from '../AuditIntegration';
import { DataClassificationLevel, type OperationContext } from '../../types/DataClassification';

// Mock the dependencies to avoid complex setup
jest.mock('../DataClassifier', () => ({
  DataClassifier: jest.fn<unknown[], unknown>().mockImplementation(() => ({
    classifyData: jest.fn<unknown[], unknown>().mockResolvedValue({
      level: DataClassificationLevel.CONFIDENTIAL,
      confidence: 0.9,
      matchedPatterns: ['ssn'],
      fieldClassifications: { ssn: DataClassificationLevel.RESTRICTED }
    } as unknown),
    on: jest.fn<unknown[], unknown>()
  }))
}));

jest.mock('../ClassificationEnforcer', () => ({
  ClassificationEnforcer: jest.fn<unknown[], unknown>().mockImplementation(() => ({
    enforceClassification: jest.fn<unknown[], unknown>().mockResolvedValue({
      allowed: true,
      riskScore: 25,
      appliedControls: ['encryption'],
      missingControls: [],
      reason: 'Access granted'
    } as unknown),
    on: jest.fn<unknown[], unknown>()
  }))
}));

describe('AuditIntegration', () => {
  let auditLogger: AuditLogger;
  let auditIntegration: AuditIntegration;
  let mockDate: Date;
  
  beforeEach(() => {
    mockDate = new Date('2025-01-21T12:00:00.000Z');
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);
    
    auditLogger = createAuditLogger({
      bufferSize: 1, // Force immediate writing
      asyncLogging: false
    });
    
    auditIntegration = createAuditIntegration({
      auditLogger,
      logAllOperations: true,
      enrichWithClassification: true
    });
  });
  
  afterEach(() => {
    auditLogger.destroy();
    jest.clearAllTimers();
    jest.useRealTimers();
  });
  
  describe('Data Access Logging', () => {
    it('should log data access with context enrichment', async () => {
      const context: OperationContext = {
        userId: 'analyst123',
        userRole: 'data_analyst',
        purpose: 'customer_analysis',
        ipAddress: '10.0.0.100',
        sessionId: 'session_abc123',
        requestedAt: new Date()
      };
      
      const testData = {
        name: 'John Doe',
        ssn: '123-45-6789',
        email: 'john@example.com'
      };
      
      await auditIntegration.logDataAccess(
        context,
        'customer_profile',
        'cust_456',
        testData,
        { purpose: 'compliance_check' }
      );
      
      const logs = await auditLogger.query({});
      expect(logs).toHaveLength(1);
      
      const log = logs[0];
      expect(log.userId).toBe('analyst123');
      expect(log.userRole).toBe('data_analyst');
      expect(log.resourceType).toBe('customer_profile');
      expect(log.resourceId).toBe('cust_456');
      expect(log.operation).toBe(AuditOperation.READ);
      expect(log.ipAddress).toBe('10.0.0.100');
      expect(log.sessionId).toBe('session_abc123');
      expect(log.success).toBe(true);
      expect(log.authorized).toBe(true);
    });
    
    it('should handle access denial logging', async () => {
      // Mock enforcer to deny access
      const { ClassificationEnforcer } = require('../ClassificationEnforcer');
      const mockEnforcer = new ClassificationEnforcer();
      mockEnforcer.enforceClassification.mockResolvedValue({
        allowed: false,
        riskScore: 85,
        appliedControls: [],
        missingControls: ['multi_factor_auth'],
        reason: 'Insufficient authentication'
      } as unknown);
      
      const denialIntegration = createAuditIntegration({
        auditLogger,
        classificationEnforcer: mockEnforcer,
        logDeniedAccess: true
      });
      
      const context: OperationContext = {
        userId: 'unauthorized_user',
        userRole: 'guest',
        purpose: 'unauthorized_access',
        ipAddress: '203.0.113.1',
        requestedAt: new Date()
      };
      
      await denialIntegration.logDataAccess(
        context,
        'sensitive_data',
        'secret_123',
        null,
        { attemptedAccess: true }
      );
      
      const logs = await auditLogger.query({});
      expect(logs.length).toBeGreaterThanOrEqual(1);
      
      // Should have both the access attempt and the security event
      const deniedLogs = logs.filter(log => !log.authorized);
      expect(deniedLogs.length).toBeGreaterThan(0);
    });
  });
  
  describe('Administrative Operations', () => {
    it('should log admin operations correctly', async () => {
      const adminContext: OperationContext = {
        userId: 'admin001',
        userRole: 'security_admin',
        purpose: 'access_management',
        ipAddress: '10.0.0.5',
        requestedAt: new Date()
      };
      
      await auditIntegration.logAdminOperation(
        'GRANT_ACCESS',
        adminContext,
        {
          userId: 'analyst456',
          resourceType: 'financial_data',
          resourceId: 'Q4_2024',
          classification: DataClassificationLevel.CONFIDENTIAL
        },
        {
          reason: 'Quarterly analysis approval',
          expiresIn: '30 days'
        }
      );
      
      const logs = await auditLogger.query({});
      expect(logs).toHaveLength(1);
      
      const log = logs[0];
      expect(log.userId).toBe('admin001');
      expect(log.operation).toBe(AuditOperation.GRANT_ACCESS);
      expect(log.resourceType).toBe('financial_data');
      expect(log.dataClassification).toBe(DataClassificationLevel.CONFIDENTIAL);
      expect(log.metadata?.targetUserId).toBe('analyst456');
    });
  });
  
  describe('Batch Operations', () => {
    it('should log batch operations with highest classification', async () => {
      const context: OperationContext = {
        userId: 'batch_user',
        userRole: 'system',
        purpose: 'batch_export',
        requestedAt: new Date()
      };
      
      const resources = [
        { type: 'customer', id: 'cust_001', classification: DataClassificationLevel.INTERNAL },
        { type: 'customer', id: 'cust_002', classification: DataClassificationLevel.CONFIDENTIAL },
        { type: 'customer', id: 'cust_003', classification: DataClassificationLevel.RESTRICTED }
      ];
      
      await auditIntegration.logBatchOperation(
        context,
        AuditOperation.EXPORT,
        resources,
        true,
        { exportFormat: 'JSON' }
      );
      
      const logs = await auditLogger.query({});
      expect(logs).toHaveLength(1);
      
      const log = logs[0];
      expect(log.operation).toBe(AuditOperation.BATCH_OPERATION);
      expect(log.dataClassification).toBe(DataClassificationLevel.RESTRICTED); // Highest
      expect(log.recordCount).toBe(3);
      expect(log.metadata?.batchOperation).toBe(AuditOperation.EXPORT);
      expect(log.metadata?.resourceCount).toBe(3);
    });
  });
  
  describe('Security Events', () => {
    it('should log security events', async () => {
      const context: OperationContext = {
        userId: 'suspicious_user',
        userRole: 'contractor',
        purpose: 'data_mining',
        ipAddress: '203.0.113.50',
        requestedAt: new Date()
      };
      
      await auditIntegration.logSecurityEvent(
        'ANOMALOUS_ACCESS_PATTERN',
        context,
        {
          pattern: 'rapid_sequential_access',
          accessCount: 100,
          timeWindow: '2 minutes',
          riskScore: 95
        }
      );
      
      const logs = await auditLogger.query({});
      expect(logs).toHaveLength(1);
      
      const log = logs[0];
      expect(log.operation).toBe(AuditOperation.AUTHORIZATION);
      expect(log.resourceType).toBe('security_event');
      expect(log.resourceId).toBe('ANOMALOUS_ACCESS_PATTERN');
      expect(log.authorized).toBe(false);
      expect(log.anomalyDetected).toBe(true);
      expect(log.metadata?.eventType).toBe('ANOMALOUS_ACCESS_PATTERN');
    });
  });
  
  describe('Audit Trails', () => {
    it('should create workflow audit trails', async () => {
      const context: OperationContext = {
        userId: 'ml_engineer',
        userRole: 'data_scientist',
        purpose: 'model_training',
        systemId: 'ml_pipeline',
        requestedAt: new Date()
      };
      
      const correlationId = await auditIntegration.startAuditTrail(
        'training_workflow_001',
        context,
        { modelType: 'classification' }
      );
      
      expect(correlationId).toMatch(/^workflow_training_workflow_001_/);
      
      const logs = await auditLogger.query({});
      expect(logs).toHaveLength(1);
      
      const log = logs[0];
      expect(log.correlationId).toBe(correlationId);
      expect(log.resourceType).toBe('workflow');
      expect(log.resourceId).toBe('training_workflow_001');
      expect(log.metadata?.workflowStart).toBe(true);
    });
  });
  
  describe('Compliance Reporting', () => {
    beforeEach(async () => {
      // Add test data for compliance report
      const testLogs = [
        {
          userId: 'user1',
          operation: AuditOperation.READ,
          resourceType: 'customer_data',
          resourceId: 'data1',
          dataClassification: DataClassificationLevel.CONFIDENTIAL,
          success: true,
          sensitiveAccess: true
        },
        {
          userId: 'user1',
          operation: AuditOperation.READ,
          resourceType: 'public_data',
          resourceId: 'data2',
          dataClassification: DataClassificationLevel.PUBLIC,
          success: true,
          sensitiveAccess: false
        },
        {
          userId: 'user2',
          operation: AuditOperation.WRITE,
          resourceType: 'restricted_data',
          resourceId: 'data3',
          dataClassification: DataClassificationLevel.RESTRICTED,
          success: false,
          authorized: false,
          sensitiveAccess: true,
          anomalyDetected: true,
          riskScore: 85
        }
      ];
      
      for (const logData of testLogs) {
        await auditLogger.log(logData);
      }
    });
    
    it('should generate compliance reports', async () => {
      const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const endDate = new Date();
      
      const report = await auditIntegration.generateComplianceReport(
        startDate,
        endDate,
        { includeDetails: false }
      );
      
      expect(report.totalAccess).toBe(3);
      expect(report.sensitiveAccess).toBe(2);
      expect(report.deniedAccess).toBe(1);
      expect(report.uniqueUsers).toBe(2);
      expect(report.anomalies).toBe(1);
      expect(report.riskMetrics.averageRiskScore).toBe(85);
      expect(report.riskMetrics.highRiskOperations).toBe(1);
      
      expect(report.classificationBreakdown[DataClassificationLevel.CONFIDENTIAL]).toBe(1);
      expect(report.classificationBreakdown[DataClassificationLevel.PUBLIC]).toBe(1);
      expect(report.classificationBreakdown[DataClassificationLevel.RESTRICTED]).toBe(1);
      
      expect(report.operationBreakdown[AuditOperation.READ]).toBe(2);
      expect(report.operationBreakdown[AuditOperation.WRITE]).toBe(1);
    });
    
    it('should include details when requested', async () => {
      const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const endDate = new Date();
      
      const report = await auditIntegration.generateComplianceReport(
        startDate,
        endDate,
        { includeDetails: true }
      );
      
      expect(report.details).toBeDefined();
      expect(report.details).toHaveLength(3);
    });
  });
  
  describe('Error Handling', () => {
    it('should handle missing optional components gracefully', async () => {
      const minimalIntegration = createAuditIntegration({
        auditLogger,
        enrichWithClassification: false
      });
      
      const context: OperationContext = {
        userId: 'test_user',
        purpose: 'test',
        requestedAt: new Date()
      };
      
      await expect(
        minimalIntegration.logDataAccess(
          context,
          'test_resource',
          'test_123',
          { some: 'data' }
        )
      ).resolves.not.toThrow();
      
      const logs = await auditLogger.query({});
      expect(logs).toHaveLength(1);
    });
  });
});

describe('Factory Functions', () => {
  it('should create audit integration with factory', () => {
    const logger = createAuditLogger();
    const integration = createAuditIntegration({
      auditLogger: logger,
      logAllOperations: true
    });
    
    expect(integration).toBeInstanceOf(AuditIntegration);
    logger.destroy();
  });
});