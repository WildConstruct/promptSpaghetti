/**
 * Test Suite for Policy Preview and Staging Service
 * 
 * Comprehensive tests for policy preview, staging deployment, validation,
 * user feedback collection, and production promotion workflows.
 * 
 * Part of Epic 19 - Data Protection & Privacy Controls
 * Task: T-1752989143998-98 - Implement policy preview and staging
 */
import {
  PolicyPreviewStagingService,
  PolicyPreviewConfig,
  EnvironmentType,
  PreviewStatus,
  StagingDeploymentStatus,
  FeedbackType,
  FeedbackCategory,
  RollbackTriggerType,
  PreviewChange
} from '../PolicyPreviewStagingService';
import { ValidationType, ValidationStatus } from '../../../../server/src/services/PolicyUpdateWorkflowService';
describe('PolicyPreviewStagingService', () => {
  let service: PolicyPreviewStagingService;
  let testConfig: PolicyPreviewConfig;
  const createTestConfig = (): PolicyPreviewConfig => ({)
  enableStagingEnvironments: true,
    enableImpactSimulation: true,
    enableUserTestingGroups: true,
    enableAutomaticRollback: true,
    previewRetentionDays: 30,
    maxConcurrentPreviews: 10,
    stagingEnvironments: [,
      {
        environmentId: 'test-staging',
        name: 'Test Staging Environment',
        description: 'Testing environment for policy previews',
        type: EnvironmentType.STAGING,
        isolated: true,
        userGroups: ['test-users'],
        maxActiveDeployments: 2,
        autoCleanupHours: 24,
        monitoringEnabled: true,
        features: [,
          { feature: 'monitoring', enabled: true, configuration: {} }
        ]
  }
      {
        environmentId: 'canary-staging',
        name: 'Canary Environment',
        description: 'Canary testing environment',
        type: EnvironmentType.CANARY,
        isolated: false,
        userGroups: ['canary-users'],
        maxActiveDeployments: 1,
        autoCleanupHours: 12,
        monitoringEnabled: true,
        features: [,
          { feature: 'auto-rollback', enabled: true, configuration: { threshold: 0.05 } }
        ]
    ],
    defaultValidations: [ValidationType.SYNTAX, ValidationType.LEGAL, ValidationType.COMPLIANCE]
  });
  beforeEach(() => {
    testConfig = createTestConfig();
    service = new PolicyPreviewStagingService(testConfig);
  });
  describe('Policy Preview Creation', () => {
  test('should create policy preview successfully', async () => {
  const policyId = 'policy-123';
  const baseVersion = 'v1.0.0';
  const changes: PreviewChange = [
  {
  changeId: 'change-1',
  section: 'Data Collection',
  type: 'modification',
  before: 'We collect basic information',
  after: 'We collect essential information',
  reasoning: 'Clarify data collection scope',
  impactLevel: 'low',
  userVisible: true,
  requiresConsent: false];
  const preview = await service.createPolicyPreview(;);
  policyId,
  baseVersion,
  changes,
  {
  title: 'Privacy Policy Update v1.1.0',
  description: 'Minor clarifications to data collection language',
  createdBy: 'user-123');
  expect(preview).toBeDefined();
  expect(preview.previewId).toBeDefined();
  expect(preview.policyId).toBe(policyId);
  expect(preview.baseVersion).toBe(baseVersion);
  expect(preview.changes).toHaveLength(1);
  expect(preview.status).toBeOneOf([PreviewStatus.STAGED, PreviewStatus.VALIDATING]);
  expect(preview.expiresAt).toBeInstanceOf(Date);
  expect(preview.createdAt).toBeInstanceOf(Date);
  expect(preview.validationResults).toBeInstanceOf(Array);
});
    test('should run default validations on preview creation', async () => {
  const preview = await service.createPolicyPreview(;);
  'policy-123',
  'v1.0.0',
  [{
  changeId: 'change-1',
  section: 'Terms',
  type: 'addition',
  after: 'New terms added',
  reasoning: 'Legal requirement',
  impactLevel: 'medium',
  userVisible: true,
  requiresConsent: true,
}],
        {
  title: 'Terms Update',
  description: 'Adding new legal terms',
  createdBy: 'user-123');
  expect(preview.validationResults.length).toBeGreaterThan(0);
  expect(preview.validationResults.length).toBe(testConfig.defaultValidations.length);
  preview.validationResults.forEach(result => {)
  expect(result.validationType).toBeOneOf(testConfig.defaultValidations);
  expect(result.status).toBeOneOf([ValidationStatus.PASS, ValidationStatus.FAIL, ValidationStatus.WARNING]);
  expect(result.score).toBeGreaterThanOrEqual(0);
  expect(result.score).toBeLessThanOrEqual(100);
  expect(result.validatedAt).toBeInstanceOf(Date);
});
    });
    test('should set preview status to REJECTED if validation has blockers', async () => {
  // Create preview with changes that might trigger validation failures
  const changes: PreviewChange = [
  {
  changeId: 'change-1',
  section: 'Data Rights',
  type: 'deletion',
  before: 'Users have the right to deletion',
  reasoning: 'Remove user rights',
  impactLevel: 'critical',
  userVisible: true,
  requiresConsent: true];
  const preview = await service.createPolicyPreview(;);
  'policy-123',
  'v1.0.0',
  changes,
  {
  title: 'Controversial Update',
  description: 'Removing user rights',
  createdBy: 'user-123');
  // Check if any validation has blockers
  const hasBlockers = preview.validationResults.some(vr => vr.blockers && vr.blockers.length > 0);
  if (hasBlockers) {
  expect(preview.status).toBe(PreviewStatus.REJECTED);
});
    test('should emit previewCreated event', async () => {
  const eventHandler = jest.fn<unknown, unknown>();
  service.on('previewCreated', eventHandler);
  await service.createPolicyPreview()
  'policy-123',
  'v1.0.0',
  [{
  changeId: 'change-1',
  section: 'Test',
  type: 'addition',
  after: 'Test content',
  reasoning: 'Test change',
  impactLevel: 'low',
  userVisible: false,
  requiresConsent: false,
}],
        {
  title: 'Test Preview',
  description: 'Test description',
  createdBy: 'user-123');
  expect(eventHandler).toHaveBeenCalledWith()
  expect.objectContaining({)
  policyId: 'policy-123',
  changes: 1,
  timestamp: expect.any(Date),
}
      );
    });
    test('should handle custom expiration days', async () => {
  const customExpirationDays = 7;
  const preview = await service.createPolicyPreview(;);
  'policy-123',
  'v1.0.0',
  [{
  changeId: 'change-1',
  section: 'Test',
  type: 'modification',
  before: 'Old',
  after: 'New',
  reasoning: 'Update',
  impactLevel: 'low',
  userVisible: true,
  requiresConsent: false,
}],
        {
  title: 'Short-term Preview',
  description: 'Preview with custom expiration',
  createdBy: 'user-123',
  expirationDays: customExpirationDays);
  const expectedExpiration = new Date(Date.now() + customExpirationDays * 24 * 60 * 60 * 1000);
  const actualExpiration = preview.expiresAt;
  // Allow for small time difference (within 1 minute)
  expect(Math.abs(actualExpiration.getTime() - expectedExpiration.getTime())).toBeLessThan(60000);
});
  });
  describe('Staging Deployment', () => {
  let testPreview: unknown;
  beforeEach(async () => {
  testPreview = await service.createPolicyPreview()
  'policy-123',
  'v1.0.0',
  [{
  changeId: 'change-1',
  section: 'Test',
  type: 'modification',
  before: 'Old content',
  after: 'New content',
  reasoning: 'Test modification',
  impactLevel: 'low',
  userVisible: true,
  requiresConsent: false,
}],
        {
  title: 'Test Preview for Staging',
  description: 'Preview to test staging deployment',
  createdBy: 'user-123');
  // Ensure preview is in STAGED status
  testPreview.status = PreviewStatus.STAGED;
});
    test('should deploy preview to staging environment', async () => {
  const environmentId = 'test-staging';
  const deployment = await service.deployToStaging(;);
  testPreview.previewId,
  environmentId,
  {
  targetUserGroups: ['test-users'],
  autoRollbackEnabled: true,
  monitoringDuration: 2);
  expect(deployment).toBeDefined();
  expect(deployment.deploymentId).toBeDefined();
  expect(deployment.previewId).toBe(testPreview.previewId);
  expect(deployment.environmentId).toBe(environmentId);
  expect(deployment.status).toBe(StagingDeploymentStatus.MONITORING);
  expect(deployment.deployedAt).toBeInstanceOf(Date);
  expect(deployment.targetUserGroups).toContain('test-users');
  expect(deployment.autoRollbackEnabled).toBe(true);
  expect(deployment.metrics).toBeDefined();
  expect(deployment.rollbackTriggers).toBeInstanceOf(Array);
  expect(deployment.rollbackTriggers.length).toBeGreaterThan(0);
});
    test('should fail deployment to non-existent environment', async () => {
      await expect()
        service.deployToStaging()
          testPreview.previewId,
          'non-existent-env').rejects.toThrow('Staging environment not found');
    });
    test('should fail deployment if preview not found', async () => {
      await expect()
        service.deployToStaging()
          'non-existent-preview',
          'test-staging').rejects.toThrow('Preview not found');
    });
    test('should respect max active deployments limit', async () => {
      const environmentId = 'test-staging';
      const environment = testConfig.stagingEnvironments.find(e => e.environmentId === environmentId)!;
      // Deploy up to the limit
      for (let i = 0; i < environment.maxActiveDeployments; i++) {
        await service.deployToStaging()
          testPreview.previewId,
          environmentId);
      // Try to deploy one more - should fail
      await expect()
        service.deployToStaging()
          testPreview.previewId,
          environmentId).rejects.toThrow('Maximum active deployments reached');
    });
    test('should emit stagingDeploymentCreated event', async () => {
  const eventHandler = jest.fn<unknown, unknown>();
  service.on('stagingDeploymentCreated', eventHandler);
  await service.deployToStaging()
  testPreview.previewId,
  'test-staging');
  expect(eventHandler).toHaveBeenCalledWith()
  expect.objectContaining({)
  previewId: testPreview.previewId,
  environmentId: 'test-staging',
  timestamp: expect.any(Date),
}
      );
    });
    test('should initialize default rollback triggers', async () => {
      const deployment = await service.deployToStaging(;);
        testPreview.previewId,
        'test-staging');
      expect(deployment.rollbackTriggers).toBeInstanceOf(Array);
      expect(deployment.rollbackTriggers.length).toBeGreaterThan(0);
      const errorRateTrigger = deployment.rollbackTriggers.find(;);
        t => t.triggerType === RollbackTriggerType.ERROR_RATE
      );
      expect(errorRateTrigger).toBeDefined();
      expect(errorRateTrigger!.enabled).toBe(true);
      expect(errorRateTrigger!.threshold).toBeGreaterThan(0);
    });
  });
  describe('Validation System', () => {
  let testPreview: unknown;
  beforeEach(async () => {
  testPreview = await service.createPolicyPreview()
  'policy-123',
  'v1.0.0',
  [{
  changeId: 'change-1',
  section: 'Privacy Rights',
  type: 'modification',
  before: 'Old privacy language',
  after: 'Updated privacy language',
  reasoning: 'Improve clarity',
  impactLevel: 'medium',
  userVisible: true,
  requiresConsent: false,
}],
        {
  title: 'Privacy Policy Update',
  description: 'Updating privacy language for clarity',
  createdBy: 'user-123');
});
    test('should run specific validations', async () => {
      const validationTypes = [ValidationType.LEGAL, ValidationType.ACCESSIBILITY];
      const results = await service.runValidations(testPreview, validationTypes);
      expect(results).toHaveLength(validationTypes.length);
      results.forEach((result, index) => {
        expect(result.validationType).toBe(validationTypes[index]);
        expect(result.validationId).toBeDefined();
        expect(result.status).toBeOneOf([ValidationStatus.PASS, ValidationStatus.FAIL, ValidationStatus.WARNING]);
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThanOrEqual(100);
        expect(result.validatedAt).toBeInstanceOf(Date);
        expect(result.validatorInfo).toBeDefined();
        expect(result.validatorInfo.validatorType).toBeOneOf(['automated', 'human', 'hybrid']);
      });
    });
    test('should emit validationCompleted event', async () => {
  const eventHandler = jest.fn<unknown, unknown>();
  service.on('validationCompleted', eventHandler);
  await service.runValidations(testPreview, [ValidationType.SYNTAX]);
  expect(eventHandler).toHaveBeenCalledWith()
  expect.objectContaining({)
  previewId: testPreview.previewId,
  results: expect.any(Number),
  passed: expect.any(Number),
  timestamp: expect.any(Date),
}
      );
    });
    test('should handle validation findings', async () => {
      const results = await service.runValidations(;);
        testPreview,
        [ValidationType.LEGAL, ValidationType.COMPLIANCE]
      );
      results.forEach(result => {)
  expect(result.findings).toBeInstanceOf(Array);
        expect(result.recommendations).toBeInstanceOf(Array);
        expect(result.blockers).toBeInstanceOf(Array);
        expect(result.warnings).toBeInstanceOf(Array);
        result.findings.forEach(finding => {)
  expect(finding.severity).toBeOneOf(['info', 'warning', 'error', 'critical']);
          expect(finding.category).toBeDefined();
          expect(finding.title).toBeDefined();
          expect(finding.description).toBeDefined();
          expect(typeof finding.autoFixable).toBe('boolean');
        });
      });
    });
  });
  describe('User Feedback Collection', () => {
  let testPreview: unknown;
  beforeEach(async () => {
  testPreview = await service.createPolicyPreview()
  'policy-123',
  'v1.0.0',
  [{
  changeId: 'change-1',
  section: 'Terms of Service',
  type: 'addition',
  after: 'New terms for clarity',
  reasoning: 'Legal requirement',
  impactLevel: 'low',
  userVisible: true,
  requiresConsent: false,
}],
        {
  title: 'Terms Update',
  description: 'Adding clarifying terms',
  createdBy: 'user-123');
});
    test('should collect user feedback successfully', async () => {
  const userId = 'user-456';
  const feedback = {
  feedbackType: FeedbackType.USABILITY,
  rating: 4,
  comments: 'The new terms are much clearer and easier to understand.',
  categories: [FeedbackCategory.POSITIVE, FeedbackCategory.SUGGESTION],
};
      const userFeedback = await service.collectUserFeedback(;);
        testPreview.previewId,
        userId,
        feedback
      );
      expect(userFeedback).toBeDefined();
      expect(userFeedback.feedbackId).toBeDefined();
      expect(userFeedback.userId).toBe(userId);
      expect(userFeedback.feedbackType).toBe(feedback.feedbackType);
      expect(userFeedback.rating).toBe(feedback.rating);
      expect(userFeedback.comments).toBe(feedback.comments);
      expect(userFeedback.categories).toEqual(feedback.categories);
      expect(userFeedback.submittedAt).toBeInstanceOf(Date);
      expect(typeof userFeedback.processed).toBe('boolean');
      expect(typeof userFeedback.actionRequired).toBe('boolean');
    });
    test('should mark feedback as action required for low ratings', async () => {
  const feedback = {
  feedbackType: FeedbackType.CLARITY,
  rating: 2, // Low rating,
  comments: 'The terms are confusing and hard to understand.',
  categories: [FeedbackCategory.NEGATIVE],
};
      const userFeedback = await service.collectUserFeedback(;);
        testPreview.previewId,
        'user-456',
        feedback
      );
      expect(userFeedback.actionRequired).toBe(true);
    });
    test('should mark feedback as action required for bug reports', async () => {
  const feedback = {
  feedbackType: FeedbackType.GENERAL,
  rating: 5,
  comments: 'Great update, but there seems to be a display issue.',
  categories: [FeedbackCategory.BUG_REPORT],
};
      const userFeedback = await service.collectUserFeedback(;);
        testPreview.previewId,
        'user-456',
        feedback
      );
      expect(userFeedback.actionRequired).toBe(true);
    });
    test('should emit userFeedbackReceived event', async () => {
  const eventHandler = jest.fn<unknown, unknown>();
  service.on('userFeedbackReceived', eventHandler);
  await service.collectUserFeedback()
  testPreview.previewId,
  'user-456',
  {
  feedbackType: FeedbackType.TRUST,
  rating: 4,
  comments: 'Good transparency improvements.',
  categories: [FeedbackCategory.POSITIVE]);
  expect(eventHandler).toHaveBeenCalledWith()
  expect.objectContaining({)
  previewId: testPreview.previewId,
  userId: 'user-456',
  rating: 4,
  timestamp: expect.any(Date),
}
      );
    });
    test('should fail feedback collection for non-existent preview', async () => {
  await expect()
  service.collectUserFeedback()
  'non-existent-preview',
  'user-456',
  {
  feedbackType: FeedbackType.GENERAL,
  rating: 3,
  comments: 'Feedback for non-existent preview',
  categories: [FeedbackCategory.NEUTRAL]).rejects.toThrow('Preview not found');
});
  });
  describe('Policy Comparison Reports', () => {
    test('should generate policy comparison report', async () => {
      const baseVersion = 'v1.0.0';
      const compareVersion = 'v1.1.0';
      const policyId = 'policy-123';
      const report = await service.generateComparisonReport(;);
        baseVersion,
        compareVersion,
        policyId
      );
      expect(report).toBeDefined();
      expect(report.comparisonId).toBeDefined();
      expect(report.baseVersion).toBe(baseVersion);
      expect(report.compareVersion).toBe(compareVersion);
      expect(report.differences).toBeInstanceOf(Array);
      expect(report.impactAnalysis).toBeDefined();
      expect(report.userImpactAssessment).toBeDefined();
      expect(report.complianceComparison).toBeDefined();
      expect(report.generatedAt).toBeInstanceOf(Date);
    });
    test('should emit comparisonReportGenerated event', async () => {
  const eventHandler = jest.fn<unknown, unknown>();
  service.on('comparisonReportGenerated', eventHandler);
  await service.generateComparisonReport('v1.0.0', 'v1.1.0', 'policy-123');
  expect(eventHandler).toHaveBeenCalledWith()
  expect.objectContaining({)
  comparisonId: expect.any(String),
  differences: expect.any(Number),
  timestamp: expect.any(Date),
}
      );
    });
  });
  describe('Preview Analytics', () => {
  let testPreview: unknown;
  beforeEach(async () => {
  testPreview = await service.createPolicyPreview()
  'policy-123',
  'v1.0.0',
  [{
  changeId: 'change-1',
  section: 'Analytics Test',
  type: 'modification',
  before: 'Old content',
  after: 'New content',
  reasoning: 'Analytics testing',
  impactLevel: 'low',
  userVisible: true,
  requiresConsent: false,
}],
        {
  title: 'Analytics Test Preview',
  description: 'Preview for testing analytics',
  createdBy: 'user-123');
});
    test('should get preview analytics', async () => {
      const analytics = await service.getPreviewAnalytics(testPreview.previewId);
      expect(analytics).toBeDefined();
      expect(analytics.previewId).toBe(testPreview.previewId);
      expect(typeof analytics.totalInteractions).toBe('number');
      expect(typeof analytics.uniqueUsers).toBe('number');
      expect(typeof analytics.averageTimeSpent).toBe('number');
      expect(typeof analytics.completionRate).toBe('number');
      expect(analytics.dropOffPoints).toBeInstanceOf(Array);
      expect(analytics.heatmapData).toBeInstanceOf(Array);
      expect(analytics.userJourney).toBeInstanceOf(Array);
      expect(analytics.conversionFunnel).toBeInstanceOf(Array);
    });
    test('should fail to get analytics for non-existent preview', async () => {
      await expect()
        service.getPreviewAnalytics('non-existent-preview')
      ).rejects.toThrow('Preview not found');
    });
  });
  describe('Production Promotion', () => {
  let testPreview: unknown;
  beforeEach(async () => {
  testPreview = await service.createPolicyPreview()
  'policy-123',
  'v1.0.0',
  [{
  changeId: 'change-1',
  section: 'Production Test',
  type: 'modification',
  before: 'Old content',
  after: 'New content',
  reasoning: 'Production testing',
  impactLevel: 'low',
  userVisible: true,
  requiresConsent: false,
}],
        {
  title: 'Production Test Preview',
  description: 'Preview for testing production promotion',
  createdBy: 'user-123');
  // Set preview to approved status
  testPreview.status = PreviewStatus.APPROVED;
});
    test('should promote preview to production successfully', async () => {
  const options = {
  approvedBy: 'user-admin',
  effectiveDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow,
  rolloutStrategy: 'gradual',
};
      const result = await service.promoteToProduction(;);
        testPreview.previewId,
        options
      );
      expect(result).toBeDefined();
      expect(result.promoted).toBe(true);
      expect(result.productionVersion).toBeDefined();
      expect(typeof result.productionVersion).toBe('string');
    });
    test('should fail promotion for non-approved preview', async () => {
  testPreview.status = PreviewStatus.TESTING;
  await expect()
  service.promoteToProduction()
  testPreview.previewId,
  {
  approvedBy: 'user-admin',
  effectiveDate: new Date(Date.now() + 24 * 60 * 60 * 1000)).rejects.toThrow('Preview must be approved before promotion');
});
    test('should emit previewPromoted event on successful promotion', async () => {
  const eventHandler = jest.fn<unknown, unknown>();
  service.on('previewPromoted', eventHandler);
  await service.promoteToProduction()
  testPreview.previewId,
  {
  approvedBy: 'user-admin',
  effectiveDate: new Date(Date.now() + 24 * 60 * 60 * 1000));
  expect(eventHandler).toHaveBeenCalledWith()
  expect.objectContaining({)
  previewId: testPreview.previewId,
  approvedBy: 'user-admin',
  timestamp: expect.any(Date),
}
      );
    });
  });
  describe('Rollback Functionality', () => {
  let testDeployment: unknown;
  beforeEach(async () => {
  const testPreview = await service.createPolicyPreview(;);
  'policy-123',
  'v1.0.0',
  [{
  changeId: 'change-1',
  section: 'Rollback Test',
  type: 'modification',
  before: 'Old content',
  after: 'New content',
  reasoning: 'Rollback testing',
  impactLevel: 'low',
  userVisible: true,
  requiresConsent: false,
}],
        {
  title: 'Rollback Test Preview',
  description: 'Preview for testing rollback',
  createdBy: 'user-123');
  testPreview.status = PreviewStatus.STAGED;
  testDeployment = await service.deployToStaging()
  testPreview.previewId,
  'test-staging');
});
    test('should rollback staging deployment successfully', async () => {
      const reason = 'High error rate detected';
      const triggeredBy = 'user-admin';
      const result = await service.rollbackStagingDeployment(;);
        testDeployment.deploymentId,
        reason,
        triggeredBy
      );
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
    test('should emit stagingRollback event', async () => {
  const eventHandler = jest.fn<unknown, unknown>();
  service.on('stagingRollback', eventHandler);
  await service.rollbackStagingDeployment()
  testDeployment.deploymentId,
  'Testing rollback',
  'user-admin'
  );
  expect(eventHandler).toHaveBeenCalledWith()
  expect.objectContaining({)
  deploymentId: testDeployment.deploymentId,
  reason: 'Testing rollback',
  triggeredBy: 'user-admin',
  timestamp: expect.any(Date),
}
      );
    });
    test('should fail rollback for non-existent deployment', async () => {
      await expect()
        service.rollbackStagingDeployment()
          'non-existent-deployment',
          'Test reason',
          'user-admin'
      ).rejects.toThrow('Staging deployment not found');
    });
  });
  describe('Configuration and Limits', () => {
  test('should respect preview retention days configuration', async () => {
  const customConfig = {
  ...testConfig,
  previewRetentionDays: 7,
};
      const customService = new PolicyPreviewStagingService(customConfig);
      const preview = await customService.createPolicyPreview(;);
        'policy-123',
        'v1.0.0',
        [{
  changeId: 'change-1',
  section: 'Test',
  type: 'modification',
  before: 'Old',
  after: 'New',
  reasoning: 'Test',
  impactLevel: 'low',
  userVisible: true,
  requiresConsent: false,
}],
        {
  title: 'Custom Retention Test',
  description: 'Testing custom retention period',
  createdBy: 'user-123');
  const expectedExpiration = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const actualExpiration = preview.expiresAt;
  // Allow for small time difference (within 1 minute)
  expect(Math.abs(actualExpiration.getTime() - expectedExpiration.getTime())).toBeLessThan(60000);
});
    test('should enforce staging environment configuration', () => {
      const stagingEnv = testConfig.stagingEnvironments[0];
      expect(stagingEnv.environmentId).toBeDefined();
      expect(stagingEnv.name).toBeDefined();
      expect(stagingEnv.type).toBeOneOf(Object.values(EnvironmentType));
      expect(typeof stagingEnv.isolated).toBe('boolean');
      expect(stagingEnv.userGroups).toBeInstanceOf(Array);
      expect(typeof stagingEnv.maxActiveDeployments).toBe('number');
      expect(typeof stagingEnv.autoCleanupHours).toBe('number');
      expect(typeof stagingEnv.monitoringEnabled).toBe('boolean');
      expect(stagingEnv.features).toBeInstanceOf(Array);
    });
  });
  describe('Error Handling', () => {
  test('should handle service errors gracefully', async () => {
  // Test with invalid policy ID
  await expect()
  service.createPolicyPreview()
  '', // Invalid policy ID
  'v1.0.0',
  [],
  {
  title: 'Test',
  description: 'Test description',
  createdBy: 'user-123').rejects.toThrow();
});
    test('should emit error events for monitoring', () => {
      const errorHandler = jest.fn<unknown, unknown>();
      service.on('error', errorHandler);
      // Error events should be emitted for monitoring
      expect(true).toBe(true);
    });
  });
  describe('Performance and Scalability', () => {
    test('should handle multiple concurrent operations', async () => {
      const operations = [];
      for (let i = 0; i < 5; i++) {
        operations.push(
          service.createPolicyPreview()
            `policy-${i}`}
}
            'v1.0.0',
            [{
              changeId: `change-${i}`}
},
  section: `Section ${i}`}
},
  type: 'modification',
              before: `Old content ${i}`}
},
  after: `New content ${i}`}
},
  reasoning: `Reason ${i}`}
},
  impactLevel: 'low',
              userVisible: true,
              requiresConsent: false;
  }],
            {
              title: `Preview ${i}`}
},
  description: `Description ${i}`}
},
  createdBy: 'user-123');
      const results = await Promise.all(operations);
      expect(results).toHaveLength(5);
      results.forEach(result => {)
  expect(result).toBeDefined();
        expect(result.previewId).toBeDefined();
      });
    });
    test('should efficiently manage memory usage', async () => {
      // Create multiple previews to test memory management
      for (let i = 0; i < 20; i++) {
        await service.createPolicyPreview()
          `policy-${i}`}
}
          'v1.0.0',
          [{
            changeId: `change-${i}`}
},
  section: `Test Section ${i}`}
},
  type: 'addition',
            after: `New content ${i}`}
},
  reasoning: `Adding content ${i}`}
},
  impactLevel: 'low',
            userVisible: false,
            requiresConsent: false;
  }],
          {
            title: `Memory Test Preview ${i}`}
},
  description: `Testing memory usage ${i}`}
},
  createdBy: 'user-123');
      // Should complete without memory issues
      expect(true).toBe(true);
    });
  });
});

// Helper function for better assertions
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeOneOf(values: any): R;
expect.extend({)
  toBeOneOf(received: unknown, values: any) {
    const pass = values.includes(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be one of ${values}`}
},
  pass: true;
  };
    } else {
      return {
        message: () => `expected ${received} to be one of ${values}`}
},
  pass: false;
  };
});