/**
 * Automated Enforcement Service Tests - Epic 17
 * 
 * Comprehensive test suite for the automated enforcement system,
 * validating policy evaluation, action application, and enforcement workflows.
 * 
 * Task: E17-1753114397380-E8827E - Implement automated enforcement
 * Epic: 17 - Backstage Admin Controls
 */

import { AutomatedEnforcementService } from '../AutomatedEnforcementService';
import { TrustScoreService } from '../TrustScoreService';
import { Database } from '../../../database';
import { AuditService } from '../../auth/services/AuditService';
import {
  UserTrustScore,
  TemplateTrustScore,
  TransactionTrustScore,
  RiskFactor,
  FraudIndicator
} from '../../../../packages/core/types/TrustTypes';

// Mock dependencies
jest.mock('../../../database');
jest.mock('../TrustScoreService');
jest.mock('../../auth/services/AuditService');

describe('AutomatedEnforcementService', () => {
  let enforcementService: AutomatedEnforcementService;
  let mockDatabase: jest.Mocked<Database>;
  let mockTrustScoreService: jest.Mocked<TrustScoreService>;
  let mockAuditService: jest.Mocked<AuditService>;
  let mockClient: unknown;

  beforeEach(() => {
    // Setup mocks
    mockClient = {
      query: jest.fn<unknown[], unknown>(),
      release: jest.fn<unknown[], unknown>()
    };

    mockDatabase = {
      getClient: jest.fn<unknown[], unknown>().mockResolvedValue(mockClient as unknown as unknown as unknown as unknown),
      query: jest.fn<unknown[], unknown>()
    } as any;

    mockTrustScoreService = {
      calculateUserTrustScore: jest.fn<unknown[], unknown>(),
      calculateTemplateTrustScore: jest.fn<unknown[], unknown>(),
      getUserVerificationStatus: jest.fn<unknown[], unknown>()
    } as any;

    mockAuditService = {
      logEvent: jest.fn<unknown[], unknown>()
    } as any;

    // Create service instance
    enforcementService = new AutomatedEnforcementService(
      mockDatabase,
      mockTrustScoreService,
      mockAuditService
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('User Trust Score Enforcement', () => {
    it('should suspend user with critical trust score', async () => {
      // Arrange
      const userTrustScore: UserTrustScore = {
        userId: 'user-123',
        userType: 'creator',
        score: 20, // Below suspension threshold (25)
        grade: 'F',
        status: 'critical',
        lastUpdated: new Date(),
        version: '1.0.0',
        confidence: 85,
        dimensions: {} as any,
        history: [],
        trends: {} as any,
        riskFactors: [],
        verificationStatus: { isVerified: false, verificationType: [] },
        dataQuality: { completeness: 80, accuracy: 85, freshness: 90, consistency: 88, overallQuality: 85 },
        calculationMethod: 'comprehensive'
      };

      mockClient.query
        .mockResolvedValueOnce({ rows: [] }) // BEGIN
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // UPDATE user_verification_status
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // UPDATE user_sessions
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // INSERT enforcement_actions
        .mockResolvedValueOnce({ rows: [] }); // COMMIT

      // Act
      const actions = await enforcementService.enforceUserTrustPolicies(userTrustScore);

      // Assert
      expect(actions).toHaveLength(1);
      expect(actions[0].actionType).toBe('suspend');
      expect(actions[0].severity).toBe('critical');
      expect(actions[0].entityType).toBe('user');
      expect(actions[0].entityId).toBe('user-123');
      expect(actions[0].autoApplied).toBe(true);
      expect(actions[0].actionTaken).toBe(true);

      // Verify database calls
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE user_verification_status'),
        expect.arrayContaining([expect.stringContaining('Trust score'), expect.any(Date), 'user-123'])
      );
    });

    it('should restrict user with medium trust score', async () => {
      // Arrange
      const userTrustScore: UserTrustScore = {
        userId: 'user-456',
        userType: 'buyer',
        score: 35, // Between restrict (40) and suspend (25) thresholds
        grade: 'D',
        status: 'warning',
        lastUpdated: new Date(),
        version: '1.0.0',
        confidence: 75,
        dimensions: {} as any,
        history: [],
        trends: {} as any,
        riskFactors: [],
        verificationStatus: { isVerified: false, verificationType: [] },
        dataQuality: { completeness: 70, accuracy: 80, freshness: 85, consistency: 75, overallQuality: 77 },
        calculationMethod: 'comprehensive'
      };

      mockClient.query
        .mockResolvedValueOnce({ rows: [] }) // BEGIN
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // INSERT user_restrictions
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // INSERT enforcement_actions
        .mockResolvedValueOnce({ rows: [] }); // COMMIT

      // Act
      const actions = await enforcementService.enforceUserTrustPolicies(userTrustScore);

      // Assert
      expect(actions).toHaveLength(1);
      expect(actions[0].actionType).toBe('restrict');
      expect(actions[0].severity).toBe('high');
      expect(actions[0].entityType).toBe('user');
      expect(actions[0].autoApplied).toBe(true);
    });

    it('should handle multiple risk factors appropriately', async () => {
      // Arrange
      const riskFactors: RiskFactor[] = [
        {
          factor: 'security_incident',
          severity: 'critical',
          probability: 85,
          impact: 20,
          description: 'Recent security breach',
          mitigation: ['Security review']
        },
        {
          factor: 'suspicious_activity',
          severity: 'high',
          probability: 70,
          impact: 15,
          description: 'Unusual login patterns',
          mitigation: ['Activity monitoring']
        }
      ];

      const userTrustScore: UserTrustScore = {
        userId: 'user-789',
        userType: 'creator',
        score: 65, // Above thresholds but has critical risk
        grade: 'C',
        status: 'warning',
        lastUpdated: new Date(),
        version: '1.0.0',
        confidence: 80,
        dimensions: {} as any,
        history: [],
        trends: {} as any,
        riskFactors,
        verificationStatus: { isVerified: false, verificationType: [] },
        dataQuality: { completeness: 85, accuracy: 90, freshness: 88, consistency: 87, overallQuality: 87 },
        calculationMethod: 'comprehensive'
      };

      mockClient.query
        .mockResolvedValueOnce({ rows: [] }) // BEGIN
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // Suspension action
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // INSERT enforcement_actions
        .mockResolvedValueOnce({ rows: [] }); // COMMIT

      // Act
      const actions = await enforcementService.enforceUserTrustPolicies(userTrustScore);

      // Assert
      expect(actions).toHaveLength(1);
      expect(actions[0].actionType).toBe('suspend');
      expect(actions[0].reason).toContain('1 critical risk factors detected');
      expect(actions[0].triggerDetails).toEqual({
        criticalRisks: ['security_incident']
      });
    });

    it('should exempt high-trust verified users from enforcement', async () => {
      // Arrange
      const userTrustScore: UserTrustScore = {
        userId: 'user-vip',
        userType: 'creator',
        score: 35, // Would normally be restricted
        grade: 'D',
        status: 'warning',
        lastUpdated: new Date(),
        version: '1.0.0',
        confidence: 85,
        dimensions: {} as any,
        history: [],
        trends: {} as any,
        riskFactors: [],
        verificationStatus: { isVerified: false, verificationType: [] },
        dataQuality: { completeness: 80, accuracy: 85, freshness: 90, consistency: 88, overallQuality: 85 },
        calculationMethod: 'comprehensive'
      };

      // Mock high trust score for exemption check
      mockTrustScoreService.calculateUserTrustScore.mockResolvedValue({
        ...userTrustScore,
        score: 95 // High trust user
      } as unknown as unknown as unknown as unknown);

      // Act
      const actions = await enforcementService.enforceUserTrustPolicies(userTrustScore);

      // Assert
      expect(actions).toHaveLength(0); // Should be exempt
    });
  });

  describe('Template Trust Score Enforcement', () => {
    it('should quarantine template with critical warnings', async () => {
      // Arrange
      const templateTrustScore: TemplateTrustScore = {
        templateId: 'template-123',
        creatorId: 'creator-456',
        score: 75,
        grade: 'B',
        status: 'good',
        lastUpdated: new Date(),
        version: '1.0.0',
        confidence: 85,
        dimensions: {} as any,
        qualityAssessment: {} as any,
        safetyAssessment: {} as any,
        communityValidation: {} as any,
        performanceMetrics: {} as any,
        trustIndicators: [],
        warnings: [
          {
            warningId: 'security-001',
            severity: 'critical',
            type: 'security',
            title: 'Critical Security Vulnerability',
            description: 'Remote code execution vulnerability detected',
            recommendedAction: 'Immediate patching required',
            reportedDate: new Date(),
            status: 'active'
          }
        ]
      };

      mockClient.query
        .mockResolvedValueOnce({ rows: [] }) // BEGIN
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // UPDATE templates
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // INSERT enforcement_actions
        .mockResolvedValueOnce({ rows: [] }); // COMMIT

      // Act
      const actions = await enforcementService.enforceTemplateTrustPolicies(templateTrustScore);

      // Assert
      expect(actions).toHaveLength(1);
      expect(actions[0].actionType).toBe('quarantine_template');
      expect(actions[0].severity).toBe('critical');
      expect(actions[0].reason).toContain('1 critical warnings');
    });

    it('should flag template with security warnings', async () => {
      // Arrange
      const templateTrustScore: TemplateTrustScore = {
        templateId: 'template-456',
        creatorId: 'creator-789',
        score: 80,
        grade: 'B+',
        status: 'good',
        lastUpdated: new Date(),
        version: '1.0.0',
        confidence: 88,
        dimensions: {} as any,
        qualityAssessment: {} as any,
        safetyAssessment: {} as any,
        communityValidation: {} as any,
        performanceMetrics: {} as any,
        trustIndicators: [],
        warnings: [
          {
            warningId: 'security-002',
            severity: 'medium',
            type: 'security',
            title: 'Potential Security Issue',
            description: 'Unvalidated input detected',
            recommendedAction: 'Add input validation',
            reportedDate: new Date(),
            status: 'active'
          }
        ]
      };

      mockClient.query
        .mockResolvedValueOnce({ rows: [] }) // BEGIN
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // INSERT entity_flags
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // INSERT enforcement_actions
        .mockResolvedValueOnce({ rows: [] }); // COMMIT

      // Act
      const actions = await enforcementService.enforceTemplateTrustPolicies(templateTrustScore);

      // Assert
      expect(actions).toHaveLength(1);
      expect(actions[0].actionType).toBe('flag');
      expect(actions[0].severity).toBe('high');
      expect(actions[0].reason).toContain('1 security warnings');
    });
  });

  describe('Transaction Enforcement', () => {
    it('should block transaction with high fraud score', async () => {
      // Arrange
      const fraudIndicators: FraudIndicator[] = [
        {
          indicator: 'vpn_usage',
          type: 'technical',
          severity: 'medium',
          confidence: 80,
          description: 'Transaction initiated through VPN',
          detectedDate: new Date()
        },
        {
          indicator: 'suspicious_velocity',
          type: 'behavioral',
          severity: 'high',
          confidence: 95,
          description: 'Unusual transaction velocity',
          detectedDate: new Date()
        }
      ];

      const transactionTrustScore: TransactionTrustScore = {
        transactionId: 'txn-123',
        buyerId: 'buyer-456',
        sellerId: 'seller-789',
        templateId: 'template-321',
        score: 45,
        grade: 'D',
        status: 'warning',
        lastUpdated: new Date(),
        version: '1.0.0',
        confidence: 75,
        factors: {} as any,
        riskAssessment: {
          riskLevel: 'high',
          riskScore: 75,
          riskFactors: [],
          mitigationStrategies: [],
          recommendedActions: []
        },
        fraudScore: 85, // Above threshold (80)
        fraudIndicators,
        transactionContext: {} as any
      };

      mockClient.query
        .mockResolvedValueOnce({ rows: [] }) // BEGIN
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // UPDATE transactions
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // INSERT enforcement_actions
        .mockResolvedValueOnce({ rows: [] }); // COMMIT

      // Act
      const actions = await enforcementService.enforceTransactionPolicies(transactionTrustScore);

      // Assert
      expect(actions).toHaveLength(1);
      expect(actions[0].actionType).toBe('block_transaction');
      expect(actions[0].severity).toBe('critical');
      expect(actions[0].reason).toContain('Fraud score (85) exceeds threshold (80)');
    });

    it('should require verification for suspicious indicators', async () => {
      // Arrange
      const fraudIndicators: FraudIndicator[] = [
        { indicator: 'new_device', type: 'technical', severity: 'medium', confidence: 70, description: 'New device', detectedDate: new Date() },
        { indicator: 'location_change', type: 'technical', severity: 'medium', confidence: 80, description: 'Location change', detectedDate: new Date() },
        { indicator: 'velocity_check', type: 'behavioral', severity: 'medium', confidence: 75, description: 'High velocity', detectedDate: new Date() }
      ];

      const transactionTrustScore: TransactionTrustScore = {
        transactionId: 'txn-456',
        buyerId: 'buyer-123',
        sellerId: 'seller-456',
        templateId: 'template-789',
        score: 65,
        grade: 'C',
        status: 'fair',
        lastUpdated: new Date(),
        version: '1.0.0',
        confidence: 80,
        factors: {} as any,
        riskAssessment: {
          riskLevel: 'medium',
          riskScore: 50,
          riskFactors: [],
          mitigationStrategies: [],
          recommendedActions: []
        },
        fraudScore: 60, // Below fraud threshold but multiple indicators
        fraudIndicators, // 3 indicators (at threshold)
        transactionContext: {} as any
      };

      mockClient.query
        .mockResolvedValueOnce({ rows: [] }) // BEGIN
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // UPDATE user_verification_status
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // INSERT enforcement_actions
        .mockResolvedValueOnce({ rows: [] }); // COMMIT

      // Act
      const actions = await enforcementService.enforceTransactionPolicies(transactionTrustScore);

      // Assert
      expect(actions).toHaveLength(1);
      expect(actions[0].actionType).toBe('require_verification');
      expect(actions[0].severity).toBe('high');
      expect(actions[0].reason).toContain('3 suspicious indicators detected');
    });
  });

  describe('Suspicious Activity Processing', () => {
    it('should suspend user for critical fraud report', async () => {
      // Arrange
      const report = {
        type: 'fraud' as const,
        severity: 'critical' as const,
        description: 'Multiple fraudulent transactions detected',
        evidence: ['Transaction pattern analysis', 'IP address correlation'],
        user_id: 'user-fraud-123'
      };

      mockClient.query
        .mockResolvedValueOnce({ rows: [] }) // BEGIN
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // UPDATE user_verification_status
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // UPDATE user_sessions
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // INSERT enforcement_actions
        .mockResolvedValueOnce({ rows: [] }); // COMMIT

      // Act
      const actions = await enforcementService.processSuspiciousActivity(report);

      // Assert
      expect(actions).toHaveLength(1);
      expect(actions[0].actionType).toBe('suspend');
      expect(actions[0].severity).toBe('critical');
      expect(actions[0].reason).toContain('Suspicious activity detected');
      expect(actions[0].autoApplied).toBe(true);
    });

    it('should quarantine template for security violation', async () => {
      // Arrange
      const report = {
        type: 'security' as const,
        severity: 'high' as const,
        description: 'Template contains malicious code',
        evidence: ['Code analysis report', 'Virus scan results'],
        template_id: 'template-malicious-456'
      };

      mockClient.query
        .mockResolvedValueOnce({ rows: [] }) // BEGIN
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // UPDATE templates
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // INSERT enforcement_actions
        .mockResolvedValueOnce({ rows: [] }); // COMMIT

      // Act
      const actions = await enforcementService.processSuspiciousActivity(report);

      // Assert
      expect(actions).toHaveLength(1);
      expect(actions[0].actionType).toBe('quarantine_template');
      expect(actions[0].severity).toBe('high');
      expect(actions[0].entityType).toBe('template');
      expect(actions[0].entityId).toBe('template-malicious-456');
    });
  });

  describe('Manual Enforcement Evaluation', () => {
    it('should trigger user trust evaluation manually', async () => {
      // Arrange
      const userId = 'user-manual-123';
      const userTrustScore: UserTrustScore = {
        userId,
        userType: 'creator',
        score: 30, // Low score
        grade: 'D',
        status: 'warning',
        lastUpdated: new Date(),
        version: '1.0.0',
        confidence: 70,
        dimensions: {} as any,
        history: [],
        trends: {} as any,
        riskFactors: [],
        verificationStatus: { isVerified: false, verificationType: [] },
        dataQuality: { completeness: 60, accuracy: 70, freshness: 80, consistency: 65, overallQuality: 68 },
        calculationMethod: 'comprehensive'
      };

      mockTrustScoreService.calculateUserTrustScore.mockResolvedValue(userTrustScore as unknown as unknown as unknown as unknown);
      
      mockClient.query
        .mockResolvedValueOnce({ rows: [] }) // BEGIN
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // INSERT user_restrictions
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // INSERT enforcement_actions
        .mockResolvedValueOnce({ rows: [] }); // COMMIT

      // Act
      const actions = await enforcementService.triggerEnforcementEvaluation('user', userId);

      // Assert
      expect(actions).toHaveLength(1);
      expect(actions[0].actionType).toBe('restrict');
      expect(mockTrustScoreService.calculateUserTrustScore).toHaveBeenCalledWith(userId, true);
    });

    it('should trigger template trust evaluation manually', async () => {
      // Arrange
      const templateId = 'template-manual-456';
      const templateTrustScore: TemplateTrustScore = {
        templateId,
        creatorId: 'creator-123',
        score: 55, // Below flag threshold
        grade: 'C',
        status: 'fair',
        lastUpdated: new Date(),
        version: '1.0.0',
        confidence: 75,
        dimensions: {} as any,
        qualityAssessment: {} as any,
        safetyAssessment: {} as any,
        communityValidation: {} as any,
        performanceMetrics: {} as any,
        trustIndicators: [],
        warnings: []
      };

      mockTrustScoreService.calculateTemplateTrustScore.mockResolvedValue(templateTrustScore as unknown as unknown as unknown as unknown);
      
      mockClient.query
        .mockResolvedValueOnce({ rows: [] }) // BEGIN
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // INSERT entity_flags
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // INSERT enforcement_actions
        .mockResolvedValueOnce({ rows: [] }); // COMMIT

      // Act
      const actions = await enforcementService.triggerEnforcementEvaluation('template', templateId);

      // Assert
      expect(actions).toHaveLength(1);
      expect(actions[0].actionType).toBe('flag');
      expect(mockTrustScoreService.calculateTemplateTrustScore).toHaveBeenCalledWith(templateId, true);
    });
  });

  describe('Configuration and Policies', () => {
    it('should return empty actions when enforcement is disabled', async () => {
      // Arrange
      const disabledConfig = {
        enabled: false,
        policies: [],
        notificationSettings: {
          adminAlerts: false,
          userNotifications: false
        },
        reviewSettings: {
          autoReviewEnabled: false,
          appealProcessEnabled: false,
          adminOverrideRequired: false
        }
      };

      const disabledService = new AutomatedEnforcementService(
        mockDatabase,
        mockTrustScoreService,
        mockAuditService,
        disabledConfig
      );

      const userTrustScore: UserTrustScore = {
        userId: 'user-disabled',
        userType: 'creator',
        score: 10, // Very low score
        grade: 'F',
        status: 'critical',
        lastUpdated: new Date(),
        version: '1.0.0',
        confidence: 50,
        dimensions: {} as any,
        history: [],
        trends: {} as any,
        riskFactors: [],
        verificationStatus: { isVerified: false, verificationType: [] },
        dataQuality: { completeness: 40, accuracy: 50, freshness: 60, consistency: 45, overallQuality: 48 },
        calculationMethod: 'comprehensive'
      };

      // Act
      const actions = await disabledService.enforceUserTrustPolicies(userTrustScore);

      // Assert
      expect(actions).toHaveLength(0);
    });

    it('should respect policy-specific exemptions', async () => {
      // Arrange
      const userTrustScore: UserTrustScore = {
        userId: 'user-whitelisted',
        userType: 'creator',
        score: 20, // Below suspension threshold
        grade: 'F',
        status: 'critical',
        lastUpdated: new Date(),
        version: '1.0.0',
        confidence: 60,
        dimensions: {} as any,
        history: [],
        trends: {} as any,
        riskFactors: [],
        verificationStatus: { isVerified: false, verificationType: [] },
        dataQuality: { completeness: 50, accuracy: 60, freshness: 70, consistency: 55, overallQuality: 58 },
        calculationMethod: 'comprehensive'
      };

      const exemptConfig = {
        enabled: true,
        policies: [{
          policyId: 'test-policy',
          name: 'Test Policy',
          description: 'Test policy with exemptions',
          enabled: true,
          triggers: {
            trustScoreThresholds: { suspend: 25, restrict: 40, flag: 60 }
          },
          actions: {
            autoSuspension: true,
            autoRestriction: true,
            autoFlagging: true,
            requireManualReview: false,
            notifyAdmins: false
          },
          exemptions: {
            highTrustUsers: false,
            verifiedUsers: false,
            whitelistedEntities: ['user-whitelisted'] // This user is exempt
          }
        }],
        notificationSettings: {
          adminAlerts: false,
          userNotifications: false
        },
        reviewSettings: {
          autoReviewEnabled: false,
          appealProcessEnabled: false,
          adminOverrideRequired: false
        }
      };

      const exemptService = new AutomatedEnforcementService(
        mockDatabase,
        mockTrustScoreService,
        mockAuditService,
        exemptConfig
      );

      // Act
      const actions = await exemptService.enforceUserTrustPolicies(userTrustScore);

      // Assert
      expect(actions).toHaveLength(0); // Should be exempt
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully during action execution', async () => {
      // Arrange
      const userTrustScore: UserTrustScore = {
        userId: 'user-error',
        userType: 'creator',
        score: 20,
        grade: 'F',
        status: 'critical',
        lastUpdated: new Date(),
        version: '1.0.0',
        confidence: 70,
        dimensions: {} as any,
        history: [],
        trends: {} as any,
        riskFactors: [],
        verificationStatus: { isVerified: false, verificationType: [] },
        dataQuality: { completeness: 60, accuracy: 70, freshness: 80, consistency: 65, overallQuality: 68 },
        calculationMethod: 'comprehensive'
      };

      mockClient.query
        .mockResolvedValueOnce({ rows: [] }) // BEGIN
        .mockRejectedValueOnce(new Error('Database connection failed')); // UPDATE fails

      // Act
      const actions = await enforcementService.enforceUserTrustPolicies(userTrustScore);

      // Assert
      expect(actions).toHaveLength(1);
      expect(actions[0].actionTaken).toBe(false); // Action was not successfully applied
      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'enforcement_action_failed'
        })
      );
    });

    it('should rollback transactions on execution errors', async () => {
      // Arrange
      const userTrustScore: UserTrustScore = {
        userId: 'user-rollback',
        userType: 'creator',
        score: 20,
        grade: 'F',
        status: 'critical',
        lastUpdated: new Date(),
        version: '1.0.0',
        confidence: 75,
        dimensions: {} as any,
        history: [],
        trends: {} as any,
        riskFactors: [],
        verificationStatus: { isVerified: false, verificationType: [] },
        dataQuality: { completeness: 70, accuracy: 75, freshness: 80, consistency: 72, overallQuality: 74 },
        calculationMethod: 'comprehensive'
      };

      mockClient.query
        .mockResolvedValueOnce({ rows: [] }) // BEGIN
        .mockRejectedValueOnce(new Error('Constraint violation')); // First UPDATE fails

      // Act
      const actions = await enforcementService.enforceUserTrustPolicies(userTrustScore);

      // Assert
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });
});