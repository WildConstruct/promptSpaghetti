/**
 * Storage Management and Retention Policy Admin Test Suite - Epic 17
 * 
 * Comprehensive tests for storage lifecycle management and retention policy
 * administration within the backstage admin controls framework.
 * 
 * Tasks: 
 * - E17-1753114397274-7F58CB - Implement storage management
 * - E17-1753114397273-EF37D9 - Create retention policies
 * Epic: 17 - Backstage Admin Controls
 */

import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { Database } from '../../server/src/database';
import { AuditService } from '../../server/src/auth/services/AuditService';
import {
  StorageManagementService,
  StoragePool,
  StorageType,
  StorageTier,
  PerformanceClass,
  HealthStatus,
  OptimizationType
} from '../../server/src/admin/StorageManagementService';
import {
  RetentionPolicyAdminService,
  AdminRetentionPolicy,
  PolicyTemplate,
  RetentionException,
  ExceptionType
} from '../../server/src/admin/RetentionPolicyAdminService';
import { DataRetentionFrameworkService } from '../../server/src/services/DataRetentionFrameworkService';
import { DataCategory, Jurisdiction } from '../../server/src/types/DataRetentionPeriods';

// Mock dependencies
const mockDatabase = {
  query: jest.fn()
} as unknown as Database;

const mockAuditService = {
  logEvent: jest.fn()
} as unknown as AuditService;

const mockRetentionFramework = {
  createPolicy: jest.fn(),
  getAllPolicies: jest.fn(),
  getPolicy: jest.fn()
} as unknown as DataRetentionFrameworkService;

describe('Storage Management and Retention Policy Admin Systems', () => {
  let storageService: StorageManagementService;
  let retentionService: RetentionPolicyAdminService;

  beforeEach(() => {
    jest.clearAllMocks();
    
    storageService = new StorageManagementService(
      mockDatabase,
      mockAuditService,
      mockRetentionFramework
    );
    
    retentionService = new RetentionPolicyAdminService(
      mockDatabase,
      mockAuditService,
      mockRetentionFramework
    );
  });

  describe('StorageManagementService', () => {
    describe('Storage Pool Management', () => {
      test('should create storage pool with comprehensive configuration', async () => {
        (mockDatabase.query as jest.Mock).mockResolvedValue({ rows: [] });

        const poolData = {
          name: 'production_hot_storage',
          description: 'High-performance storage for active data',
          storageType: StorageType.HOT,
          tier: StorageTier.PREMIUM,
          capacity: 1000, // GB
          used: 250,
          available: 750,
          compressionEnabled: true,
          encryptionEnabled: true,
          replicationFactor: 3,
          performanceClass: PerformanceClass.HIGH,
          costPerGB: 0.12,
          location: 'us-east-1',
          isActive: true,
          tags: ['production', 'high-performance', 'encrypted']
        };

        const result = await storageService.createStoragePool(poolData, 'admin');

        expect(result).toBeDefined();
        expect(result.poolId).toBeTruthy();
        expect(result.name).toBe('production_hot_storage');
        expect(result.storageType).toBe(StorageType.HOT);
        expect(result.tier).toBe(StorageTier.PREMIUM);
        expect(result.healthStatus).toBe(HealthStatus.HEALTHY);
        expect(mockAuditService.logEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            action: 'storage_pool_created',
            userId: 'admin'
          })
        );
      });

      test('should retrieve storage pools with filtering', async () => {
        (mockDatabase.query as jest.Mock).mockResolvedValue({
          rows: [
            {
              pool_id: 'pool-1',
              name: 'hot_storage',
              storage_type: 'hot',
              tier: 'premium',
              capacity: 1000,
              used: 300,
              available: 700,
              compression_enabled: true,
              encryption_enabled: true,
              replication_factor: 3,
              performance_class: 'high',
              cost_per_gb: 0.12,
              location: 'us-east-1',
              is_active: true,
              created_at: new Date(),
              health_status: 'healthy',
              tags: '["production", "hot"]'
            }
          ]
        });

        const result = await storageService.getStoragePools({
          storageType: StorageType.HOT,
          tier: StorageTier.PREMIUM,
          isActive: true
        });

        expect(result).toHaveLength(1);
        expect(result[0].storageType).toBe(StorageType.HOT);
        expect(result[0].tier).toBe(StorageTier.PREMIUM);
        expect(result[0].tags).toEqual(['production', 'hot']);
      });

      test('should update storage pool configuration', async () => {
        // Create complete mock pool row data
        const mockPoolRow = {
          pool_id: 'pool-1',
          name: 'test_pool',
          description: 'Test pool',
          storage_type: 'hot',
          tier: 'premium',
          capacity: 1000,
          used: 250,
          available: 750,
          compression_enabled: false,
          encryption_enabled: false,
          replication_factor: 3,
          performance_class: 'high',
          cost_per_gb: 0.12,
          location: 'us-east-1',
          is_active: true,
          created_at: new Date(),
          last_optimized: null,
          health_status: 'healthy',
          tags: '["test"]'
        };

        const updatedPoolRow = {
          ...mockPoolRow,
          name: 'updated_test_pool',
          compression_enabled: true,
          encryption_enabled: true,
          updated_at: new Date()
        };

        // Mock database calls
        (mockDatabase.query as jest.Mock)
          .mockResolvedValueOnce({ rows: [mockPoolRow] }) // Initial retrieval
          .mockResolvedValueOnce({ rows: [] }) // Update query
          .mockResolvedValueOnce({ rows: [updatedPoolRow] }); // Final retrieval

        const updates = {
          name: 'updated_test_pool',
          compressionEnabled: true,
          encryptionEnabled: true
        };

        const result = await storageService.updateStoragePool('pool-1', updates, 'admin');

        expect(result.name).toBe('updated_test_pool');
        expect(result.compressionEnabled).toBe(true);
        expect(result.encryptionEnabled).toBe(true);
        expect(mockAuditService.logEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            action: 'storage_pool_updated'
          })
        );
      });
    });

    describe('Storage Quota Management', () => {
      test('should create and enforce storage quotas', async () => {
        (mockDatabase.query as jest.Mock).mockResolvedValue({ rows: [] });

        const quotaData = {
          resourceType: 'user' as const,
          resourceId: 'user-123',
          category: DataCategory.PERSONAL_IDENTIFIABLE,
          maxStorage: 100, // GB
          currentUsage: 75,
          warningThreshold: 80, // percentage
          criticalThreshold: 95,
          autoCleanup: true,
          notificationEnabled: true
        };

        const result = await storageService.createStorageQuota(quotaData, 'admin');

        expect(result).toBeDefined();
        expect(result.quotaId).toBeTruthy();
        expect(result.maxStorage).toBe(100);
        expect(result.quotaExceeded).toBe(false); // 75 < 100
        expect(mockAuditService.logEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            action: 'storage_quota_created'
          })
        );
      });

      test('should detect and handle quota violations', async () => {
        const quotaData = {
          resourceType: 'user' as const,
          resourceId: 'user-123',
          category: DataCategory.PERSONAL_IDENTIFIABLE,
          maxStorage: 100,
          currentUsage: 110, // Exceeds quota
          warningThreshold: 80,
          criticalThreshold: 95,
          autoCleanup: true,
          notificationEnabled: true
        };

        const result = await storageService.createStorageQuota(quotaData, 'admin');

        expect(result.quotaExceeded).toBe(true);
      });
    });

    describe('Storage Optimization', () => {
      test('should schedule storage optimization tasks', async () => {
        const target = {
          targetType: 'category' as const,
          dataCategories: [DataCategory.BEHAVIORAL],
          storageTypes: [StorageType.WARM],
          ageThreshold: 90
        };

        const parameters = {
          compressionAlgorithm: 'zstd' as const,
          compressionLevel: 3,
          deduplicationScope: 'pool' as const,
          cleanupDryRun: false,
          notifyUsers: true
        };

        const result = await storageService.scheduleOptimization(
          OptimizationType.COMPRESSION,
          target,
          parameters,
          'admin'
        );

        expect(result).toBeDefined();
        expect(result.optimizationId).toBeTruthy();
        expect(result.type).toBe(OptimizationType.COMPRESSION);
        expect(result.status).toBe('scheduled');
        expect(result.estimatedSavings).toBeGreaterThan(0);
        expect(mockAuditService.logEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            action: 'storage_optimization_scheduled'
          })
        );
      });

      test('should execute optimization and return results', async () => {
        // Mock database calls for optimization storage and retrieval
        (mockDatabase.query as jest.Mock)
          .mockResolvedValueOnce({ rows: [] }) // Store optimization
          .mockResolvedValueOnce({ // Get optimization for execution
            rows: [{
              optimization_id: 'opt-test-123',
              optimization_type: 'DEDUPLICATION',
              target: '{"targetType":"global","dataCategories":["TECHNICAL"],"storageTypes":["HOT","WARM"]}',
              status: 'scheduled',
              scheduled_at: new Date(),
              estimated_savings: 100,
              actual_savings: null,
              config: '{"deduplicationScope":"global","cleanupDryRun":false}',
              results: null,
              created_at: new Date(),
              completed_at: null,
              error: null
            }]
          })
          .mockResolvedValueOnce({ rows: [] }); // Update optimization

        // Create optimization first
        const optimization = await storageService.scheduleOptimization(
          OptimizationType.DEDUPLICATION,
          {
            targetType: 'global' as const,
            dataCategories: [DataCategory.TECHNICAL],
            storageTypes: [StorageType.HOT, StorageType.WARM]
          },
          {
            deduplicationScope: 'global' as const,
            cleanupDryRun: false
          },
          'admin'
        );

        // Execute the optimization
        const result = await storageService.executeOptimization(optimization.optimizationId);

        expect(result.status).toBe('completed');
        expect(result.results).toBeDefined();
        expect(result.results!.filesProcessed).toBeGreaterThan(0);
        expect(result.results!.storageFreed).toBeGreaterThan(0);
        expect(result.actualSavings).toBe(result.results!.storageFreed);
        expect(result.costSavings).toBeGreaterThan(0);
      });

      test('should generate optimization recommendations', async () => {
        // Mock storage metrics to ensure valid calculations
        const mockMetrics = {
          timestamp: new Date(),
          totalCapacity: 1000,
          totalUsed: 600,
          totalAvailable: 400,
          utilizationRate: 60,
          growthRate: 5,
          compressionRatio: 0.5, // Low compression ratio to trigger recommendation
          deduplicationRatio: 0.8,
          iopsUtilization: 70,
          throughputUtilization: 65,
          costPerGB: 0.12,
          healthScore: 85,
          criticalIssues: 0,
          recommendationCount: 3
        };
        
        // Mock the internal methods that getOptimizationRecommendations relies on
        jest.spyOn(storageService as any, 'getCurrentStorageMetrics').mockResolvedValue(mockMetrics);
        jest.spyOn(storageService as any, 'findOldData').mockResolvedValue({ size: 150 });
        jest.spyOn(storageService as any, 'findDuplicateData').mockResolvedValue({ size: 25 });

        const recommendations = await storageService.getOptimizationRecommendations();

        expect(recommendations).toBeInstanceOf(Array);
        expect(recommendations.length).toBeGreaterThan(0);
        
        for (const recommendation of recommendations) {
          expect(recommendation.type).toBeDefined();
          expect(recommendation.estimatedSavings).toBeGreaterThan(0);
          expect(recommendation.priority).toMatch(/^(high|medium|low)$/);
          expect(recommendation.description).toBeTruthy();
          expect(recommendation.impact).toBeTruthy();
        }
      });
    });

    describe('Storage Monitoring and Metrics', () => {
      test('should calculate comprehensive storage metrics', async () => {
        // Mock getStoragePools to return mock pools for metrics calculation
        const mockPools = [
          {
            poolId: 'pool-1',
            name: 'Test Pool',
            capacity: 1000,
            used: 300,
            available: 700,
            isActive: true
          }
        ];
        
        jest.spyOn(storageService as any, 'getStoragePools').mockResolvedValue(mockPools);
        jest.spyOn(storageService as any, 'calculatePoolMetrics').mockResolvedValue({
          healthScore: 85,
          performance: 90,
          efficiency: 75
        });
        jest.spyOn(storageService as any, 'calculateGrowthRate').mockResolvedValue(5);
        jest.spyOn(storageService as any, 'calculateCompressionRatio').mockResolvedValue(0.8);
        jest.spyOn(storageService as any, 'calculateDeduplicationRatio').mockResolvedValue(0.9);
        jest.spyOn(storageService as any, 'calculateIOPSUtilization').mockResolvedValue(70);
        jest.spyOn(storageService as any, 'calculateThroughputUtilization').mockResolvedValue(65);
        jest.spyOn(storageService as any, 'calculateCostPerGB').mockResolvedValue(0.12);

        const metrics = await storageService.getCurrentStorageMetrics();

        expect(metrics).toBeDefined();
        expect(metrics.timestamp).toBeInstanceOf(Date);
        expect(metrics.totalCapacity).toBeGreaterThan(0);
        expect(metrics.totalUsed).toBeGreaterThanOrEqual(0);
        expect(metrics.totalAvailable).toBeGreaterThanOrEqual(0);
        expect(metrics.utilizationRate).toBeGreaterThanOrEqual(0);
        expect(metrics.utilizationRate).toBeLessThanOrEqual(100);
        expect(metrics.healthScore).toBeGreaterThanOrEqual(0);
        expect(metrics.healthScore).toBeLessThanOrEqual(100);
      });

      test('should generate storage reports with multiple types', async () => {
        const period = {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31'),
          granularity: 'day' as const
        };

        const report = await storageService.generateStorageReport(
          'usage',
          period,
          'admin'
        );

        expect(report).toBeDefined();
        expect(report.reportId).toBeTruthy();
        expect(report.reportType).toBe('usage');
        expect(report.period).toEqual(period);
        expect(report.generatedBy).toBe('admin');
        expect(report.summary).toBeDefined();
        expect(report.recommendations).toBeInstanceOf(Array);
        expect(report.nextActions).toBeInstanceOf(Array);
        expect(mockAuditService.logEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            action: 'storage_report_generated'
          })
        );
      });
    });
  });

  describe('RetentionPolicyAdminService', () => {
    beforeEach(() => {
      const mockPolicyData = {
        policyId: 'policy-123',
        name: 'Test Policy',
        description: 'Test Description',
        categories: [DataCategory.PERSONAL_IDENTIFIABLE],
        jurisdiction: [Jurisdiction.GDPR],
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        rules: []
      };
      
      (mockRetentionFramework.createPolicy as jest.Mock).mockResolvedValue(mockPolicyData);
      (mockRetentionFramework.getPolicy as jest.Mock).mockResolvedValue(mockPolicyData);
    });

    describe('Admin Policy Management', () => {
      test('should create admin retention policy with enhanced controls', async () => {
        const policyData = {
          name: 'GDPR Personal Data Policy',
          description: 'Comprehensive retention policy for personal data under GDPR',
          categories: [DataCategory.PERSONAL_IDENTIFIABLE],
          jurisdiction: [Jurisdiction.GDPR],
          enabled: true,
          rules: []
        };

        const adminSettings = {
          autoEnforcement: true,
          requireApproval: false,
          notificationEnabled: true,
          escalationLevel: 'dpo' as const,
          reviewFrequency: 'quarterly' as const,
          exemptionLimit: 5,
          auditRequired: true,
          riskAssessment: 'high' as const,
          businessJustification: 'Legal compliance requirement for GDPR'
        };

        const result = await retentionService.createAdminRetentionPolicy(
          policyData,
          adminSettings,
          'admin'
        );

        expect(result).toBeDefined();
        expect(result.policyId).toBeTruthy();
        expect(result.name).toBe('GDPR Personal Data Policy');
        expect(result.adminSettings).toEqual(adminSettings);
        expect(result.statistics).toBeDefined();
        expect(result.compliance).toBeDefined();
        expect(result.compliance.isCompliant).toBe(true);
        expect(mockAuditService.logEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            action: 'admin_retention_policy_created'
          })
        );
      });

      test('should retrieve admin policies with filtering', async () => {
        (mockRetentionFramework.getAllPolicies as jest.Mock).mockResolvedValue([
          {
            policyId: 'policy-1',
            name: 'GDPR Policy',
            categories: [DataCategory.PERSONAL_IDENTIFIABLE],
            jurisdiction: [Jurisdiction.GDPR],
            enabled: true
          },
          {
            policyId: 'policy-2',
            name: 'CCPA Policy',
            categories: [DataCategory.PERSONAL_IDENTIFIABLE],
            jurisdiction: [Jurisdiction.CCPA],
            enabled: true
          }
        ]);

        const filters = {
          category: [DataCategory.PERSONAL_IDENTIFIABLE],
          jurisdiction: [Jurisdiction.GDPR],
          isActive: true
        };

        const result = await retentionService.getAdminRetentionPolicies(filters);

        expect(result).toBeInstanceOf(Array);
        expect(result.length).toBeGreaterThan(0);
        
        for (const policy of result) {
          expect(policy.adminSettings).toBeDefined();
          expect(policy.statistics).toBeDefined();
          expect(policy.compliance).toBeDefined();
          expect(policy.categories).toContain(DataCategory.PERSONAL_IDENTIFIABLE);
        }
      });

      test('should update admin policy settings', async () => {
        const settings = {
          autoEnforcement: false,
          escalationLevel: 'legal' as const,
          reviewFrequency: 'monthly' as const,
          riskAssessment: 'critical' as const
        };

        const result = await retentionService.updateAdminPolicySettings(
          'policy-123',
          settings,
          'admin'
        );

        expect(result.adminSettings.autoEnforcement).toBe(false);
        expect(result.adminSettings.escalationLevel).toBe('legal');
        expect(result.adminSettings.reviewFrequency).toBe('monthly');
        expect(result.adminSettings.riskAssessment).toBe('critical');
        expect(mockAuditService.logEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            action: 'admin_policy_settings_updated'
          })
        );
      });
    });

    describe('Policy Templates', () => {
      test('should create reusable policy template', async () => {
        const templateData = {
          name: 'GDPR Standard Template',
          description: 'Standard GDPR compliance template for personal data',
          category: 'personal_data' as const,
          jurisdiction: [Jurisdiction.GDPR],
          baseRetentionPeriod: 2555, // 7 years in days
          defaultSettings: {
            autoEnforcement: true,
            requireApproval: true,
            notificationEnabled: true,
            escalationLevel: 'dpo' as const,
            reviewFrequency: 'quarterly' as const,
            exemptionLimit: 3,
            auditRequired: true,
            riskAssessment: 'high' as const
          },
          applicableDataTypes: [DataCategory.PERSONAL_IDENTIFIABLE, DataCategory.BEHAVIORAL],
          isPublic: true
        };

        const result = await retentionService.createPolicyTemplate(templateData, 'admin');

        expect(result).toBeDefined();
        expect(result.templateId).toBeTruthy();
        expect(result.name).toBe('GDPR Standard Template');
        expect(result.category).toBe('personal_data');
        expect(result.isPublic).toBe(true);
        expect(result.usageCount).toBe(0);
        expect(mockAuditService.logEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            action: 'policy_template_created'
          })
        );
      });

      test('should create policy from template with overrides', async () => {
        const overrides = {
          name: 'Custom GDPR Policy for Marketing Data',
          description: 'Customized policy for marketing data retention',
          adminSettings: {
            reviewFrequency: 'monthly' as const,
            exemptionLimit: 2
          }
        };

        const result = await retentionService.createPolicyFromTemplate(
          'template-123',
          overrides,
          'admin'
        );

        expect(result).toBeDefined();
        expect(result.name).toBe('Custom GDPR Policy for Marketing Data');
        expect(result.adminSettings.reviewFrequency).toBe('monthly');
        expect(result.adminSettings.exemptionLimit).toBe(2);
      });
    });

    describe('Exception Management', () => {
      test('should create retention exception with approval workflow', async () => {
        const exceptionData = {
          policyId: 'policy-123',
          recordId: 'record-456',
          type: ExceptionType.LEGAL_HOLD,
          reason: 'Ongoing litigation requires data preservation',
          businessJustification: 'Legal department has requested hold for case #2024-001',
          riskAssessment: 'Medium risk - litigation exposure if deleted',
          conditions: [
            'Review monthly',
            'Release when litigation concluded',
            'Notify legal team of any access'
          ],
          reviewRequired: true
        };

        const result = await retentionService.createRetentionException(
          exceptionData,
          'legal-admin'
        );

        expect(result).toBeDefined();
        expect(result.exceptionId).toBeTruthy();
        expect(result.type).toBe(ExceptionType.LEGAL_HOLD);
        expect(result.status).toBe('requested');
        expect(result.requestedBy).toBe('legal-admin');
        expect(result.conditions).toHaveLength(3);
        expect(mockAuditService.logEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            action: 'retention_exception_requested'
          })
        );
      });

      test('should process exception approval workflow', async () => {
        const result = await retentionService.processRetentionException(
          'exception-789',
          'approve',
          'dpo',
          'Approved for ongoing investigation requirements'
        );

        expect(result.status).toBe('approved');
        expect(result.approvedBy).toBe('dpo');
        expect(result.approvedAt).toBeInstanceOf(Date);
        expect(mockAuditService.logEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            action: 'retention_exception_approved'
          })
        );
      });

      test('should handle exception denial', async () => {
        const result = await retentionService.processRetentionException(
          'exception-790',
          'deny',
          'compliance-officer',
          'Insufficient business justification provided'
        );

        expect(result.status).toBe('denied');
        expect(result.approvedBy).toBe('compliance-officer');
        expect(mockAuditService.logEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            action: 'retention_exception_denied'
          })
        );
      });
    });

    describe('Compliance Monitoring', () => {
      test('should perform comprehensive compliance assessment', async () => {
        const scope = {
          policies: ['policy-1', 'policy-2'],
          dataCategories: [DataCategory.PERSONAL_IDENTIFIABLE, DataCategory.FINANCIAL],
          jurisdictions: [Jurisdiction.GDPR, Jurisdiction.CCPA],
          departments: ['marketing', 'sales'],
          includeExceptions: true,
          includeArchived: false
        };

        const result = await retentionService.performComplianceAssessment(scope, 'compliance-admin');

        expect(result).toBeDefined();
        expect(result.overallScore).toBeGreaterThanOrEqual(0);
        expect(result.overallScore).toBeLessThanOrEqual(100);
        expect(result.policyCompliance).toBeGreaterThanOrEqual(0);
        expect(result.jurisdictionalCompliance).toBeGreaterThanOrEqual(0);
        expect(result.auditReadiness).toBeGreaterThanOrEqual(0);
        expect(result.riskMitigation).toBeGreaterThanOrEqual(0);
        expect(result.dataGovernance).toBeGreaterThanOrEqual(0);
        expect(result.certificationStatus).toBeInstanceOf(Array);
        expect(result.keyIndicators).toBeInstanceOf(Array);
        expect(mockAuditService.logEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            action: 'compliance_assessment_performed'
          })
        );
      });

      test('should generate comprehensive retention report', async () => {
        const scope = {
          policies: ['policy-1', 'policy-2'],
          dataCategories: [DataCategory.PERSONAL_IDENTIFIABLE],
          jurisdictions: [Jurisdiction.GDPR],
          departments: ['all'],
          includeExceptions: true,
          includeArchived: true
        };

        const period = {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-03-31'),
          granularity: 'month' as const
        };

        const result = await retentionService.generateRetentionReport(
          'compliance_audit',
          scope,
          period,
          'audit-admin'
        );

        expect(result).toBeDefined();
        expect(result.reportId).toBeTruthy();
        expect(result.reportType).toBe('compliance_audit');
        expect(result.scope).toEqual(scope);
        expect(result.period).toEqual(period);
        expect(result.summary).toBeDefined();
        expect(result.summary.totalRecords).toBeGreaterThan(0);
        expect(result.summary.complianceRate).toBeGreaterThanOrEqual(0);
        expect(result.findings).toBeInstanceOf(Array);
        expect(result.recommendations).toBeInstanceOf(Array);
        expect(result.compliance).toBeDefined();
        expect(result.exportFormats).toContain('pdf');
        expect(result.distributionList).toBeInstanceOf(Array);
        expect(mockAuditService.logEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            action: 'retention_report_generated'
          })
        );
      });
    });

    describe('Bulk Operations', () => {
      test('should execute bulk policy operations', async () => {
        const scope = {
          policyIds: ['policy-1', 'policy-2'],
          dataCategories: [DataCategory.BEHAVIORAL],
          ageThreshold: 365
        };

        const parameters = {
          dryRun: false,
          batchSize: 100,
          delayMs: 1000,
          requireApproval: false,
          notifyAffected: true,
          reason: 'Quarterly cleanup of old behavioral data'
        };

        const result = await retentionService.executeBulkOperation(
          'bulk_archive',
          scope,
          parameters,
          'admin'
        );

        expect(result).toBeDefined();
        expect(result.operationId).toBeTruthy();
        expect(result.type).toBe('bulk_archive');
        expect(result.scope).toEqual(scope);
        expect(result.parameters).toEqual(parameters);
        expect(result.status).toBe('queued');
        expect(result.progress).toBe(0);
        expect(result.initiatedBy).toBe('admin');
        expect(mockAuditService.logEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            action: 'bulk_operation_initiated'
          })
        );
      });

      test('should handle bulk operation with dry run', async () => {
        const scope = {
          dataCategories: [DataCategory.TECHNICAL],
          ageThreshold: 30
        };

        const parameters = {
          dryRun: true,
          batchSize: 50,
          reason: 'Test cleanup impact before execution'
        };

        const result = await retentionService.executeBulkOperation(
          'bulk_delete',
          scope,
          parameters,
          'admin'
        );

        expect(result.parameters.dryRun).toBe(true);
        expect(result.type).toBe('bulk_delete');
      });
    });
  });

  describe('Integration Workflows', () => {
    test('should integrate storage optimization with retention policies', async () => {
      // Create retention policy for old data
      const policyData = {
        name: 'Storage Optimization Policy',
        description: 'Automatically manage storage lifecycle for cost optimization',
        categories: [DataCategory.BEHAVIORAL, DataCategory.TECHNICAL],
        jurisdiction: [Jurisdiction.GDPR],
        enabled: true,
        rules: []
      };

      const adminSettings = {
        autoEnforcement: true,
        requireApproval: false,
        notificationEnabled: true,
        escalationLevel: 'manager' as const,
        reviewFrequency: 'quarterly' as const,
        exemptionLimit: 10,
        auditRequired: false,
        riskAssessment: 'low' as const
      };

      const retentionPolicy = await retentionService.createAdminRetentionPolicy(
        policyData,
        adminSettings,
        'system'
      );

      // Schedule storage optimization
      const optimization = await storageService.scheduleOptimization(
        OptimizationType.ARCHIVAL,
        {
          targetType: 'category',
          dataCategories: [DataCategory.BEHAVIORAL, DataCategory.TECHNICAL],
          storageTypes: [StorageType.HOT, StorageType.WARM],
          ageThreshold: 90
        },
        {
          archivalTier: StorageTier.ARCHIVE,
          preserveAccess: true,
          notifyUsers: false
        },
        'system'
      );

      // Verify both components work together
      expect(retentionPolicy.policyId).toBeTruthy();
      expect(optimization.optimizationId).toBeTruthy();
      expect(retentionPolicy.categories).toEqual([DataCategory.BEHAVIORAL, DataCategory.TECHNICAL]);
      expect(optimization.target.dataCategories).toEqual([DataCategory.BEHAVIORAL, DataCategory.TECHNICAL]);
      
      // Verify audit trail
      expect(mockAuditService.logEvent).toHaveBeenCalledTimes(2);
    });

    test('should handle storage quota violations with retention enforcement', async () => {
      // Create storage quota
      const quota = await storageService.createStorageQuota({
        resourceType: 'user',
        resourceId: 'user-heavy-usage',
        category: DataCategory.PERSONAL_IDENTIFIABLE,
        maxStorage: 50, // GB
        currentUsage: 45,
        warningThreshold: 80,
        criticalThreshold: 90,
        autoCleanup: true,
        notificationEnabled: true
      }, 'admin');

      // Create retention exception for critical data
      const exception = await retentionService.createRetentionException({
        policyId: 'policy-personal-data',
        recordId: 'critical-user-data',
        type: ExceptionType.BUSINESS_NEED,
        reason: 'User has active premium subscription',
        businessJustification: 'Premium users get extended data retention',
        riskAssessment: 'Low risk - user consent exists',
        conditions: ['Review when subscription expires'],
        reviewRequired: true
      }, 'customer-success');

      expect(quota.quotaId).toBeTruthy();
      expect(exception.exceptionId).toBeTruthy();
      expect(quota.autoCleanup).toBe(true);
      expect(exception.type).toBe(ExceptionType.BUSINESS_NEED);
    });

    test('should generate combined storage and retention compliance report', async () => {
      // Generate storage report
      const storageReport = await storageService.generateStorageReport(
        'compliance',
        {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-03-31'),
          granularity: 'month'
        },
        'compliance-officer'
      );

      // Generate retention report
      const retentionReport = await retentionService.generateRetentionReport(
        'compliance_audit',
        {
          policies: ['policy-1'],
          dataCategories: [DataCategory.PERSONAL_IDENTIFIABLE],
          jurisdictions: [Jurisdiction.GDPR],
          departments: ['all'],
          includeExceptions: true,
          includeArchived: true
        },
        {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-03-31'),
          granularity: 'month'
        },
        'compliance-officer'
      );

      // Verify both reports provide comprehensive compliance view
      expect(storageReport.reportType).toBe('compliance');
      expect(retentionReport.reportType).toBe('compliance_audit');
      expect(storageReport.summary).toBeDefined();
      expect(retentionReport.summary).toBeDefined();
      expect(retentionReport.compliance.overallScore).toBeGreaterThan(0);
      
      // Both reports should have recommendations
      expect(storageReport.recommendations.length).toBeGreaterThan(0);
      expect(retentionReport.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle storage pool capacity exceeded', async () => {
      const poolData = {
        name: 'test_pool',
        description: 'Test pool',
        storageType: StorageType.HOT,
        tier: StorageTier.STANDARD,
        capacity: 100,
        used: 120, // Exceeds capacity
        available: -20,
        compressionEnabled: false,
        encryptionEnabled: false,
        replicationFactor: 1,
        performanceClass: PerformanceClass.MEDIUM,
        costPerGB: 0.08,
        location: 'test',
        isActive: true,
        tags: []
      };

      // Should still create but with warning health status
      const result = await storageService.createStoragePool(poolData, 'admin');
      expect(result).toBeDefined();
      // Health monitoring would detect and alert on this
    });

    test('should handle invalid retention exception approval', async () => {
      // Try to approve non-existent exception
      await expect(
        retentionService.processRetentionException(
          'non-existent-exception',
          'approve',
          'admin'
        )
      ).rejects.toThrow('Exception not found');
    });

    test('should handle bulk operation with no matching records', async () => {
      const scope = {
        dataCategories: [DataCategory.HEALTH], // Assume no health data exists
        ageThreshold: 1000
      };

      const parameters = {
        dryRun: true,
        batchSize: 100
      };

      const result = await retentionService.executeBulkOperation(
        'bulk_delete',
        scope,
        parameters,
        'admin'
      );

      expect(result).toBeDefined();
      expect(result.status).toBe('queued');
      // Background processing would complete with 0 records processed
    });
  });

  afterEach(() => {
    // Clear any background timers
    jest.clearAllTimers();
  });
});