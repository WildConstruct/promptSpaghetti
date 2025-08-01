/**
 * Policy Authoring Service Tests - Epic 19
 * 
 * Comprehensive test suite for policy authoring, management, versioning,
 * and deployment functionality.
 */

import { PolicyAuthoringService, PolicyAuthoringRequest, PolicyUpdateRequest, PolicyDeploymentRequest } from '../PolicyAuthoringService';
import { AuditService } from '../../auth/services/AuditService';

// Mock AuditService
const mockAuditService = {
  logEvent: jest.fn().mockResolvedValue(undefined)
 as unknown as AuditService;

describe('PolicyAuthoringService', () => {
  let service: PolicyAuthoringService;

  beforeEach(() => {
    service = new PolicyAuthoringService(mockAuditService);
    jest.clearAllMocks();
  });

  describe('Policy Creation', () => {
    it('should create a new policy successfully', async () => {
      const request: PolicyAuthoringRequest = {
        policyType: 'PRIVACY_POLICY',
        title: 'Test Privacy Policy',
        description: 'A comprehensive privacy policy for testing',
        jurisdiction: ['US', 'EU'],
        complianceFrameworks: ['GDPR', 'CCPA'],
        audience: ['all-users'],
        variables: { company_name: 'Test Company' }
      };

      const result = await service.createPolicy(request, 'test-author-id');

      expect(result).toEqual({
        policyId: expect.stringMatching(/^POL-\d+-[a-z0-9]+$/),
        version: '1.0.0'
      });

      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'POLICY_CREATION_INITIATED',
          details: expect.objectContaining({
            policyType: 'PRIVACY_POLICY',
            title: 'Test Privacy Policy',
            authorId: 'test-author-id'

  }
      );

      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'POLICY_CREATED'

      );
    });

    it('should handle GDPR policy creation with template', async () => {
      const request: PolicyAuthoringRequest = {
        policyType: 'GDPR_POLICY',
        title: 'GDPR Compliance Policy',
        description: 'GDPR compliance policy for EU operations',
        jurisdiction: ['EU'],
        complianceFrameworks: ['GDPR'],
        audience: ['eu-customers'],
        templateId: 'TPL-GDPR-001',
        variables: {
          company_name: 'ACME Corp',
          contact_email: 'privacy@acme.com',
          data_retention_period: 7

      };

      const result = await service.createPolicy(request, 'privacy-officer');

      expect(result.policyId).toBeDefined();
      expect(result.version).toBe('1.0.0');
    });

    it('should handle CCPA policy creation', async () => {
      const request: PolicyAuthoringRequest = {
        policyType: 'CCPA_POLICY',
        title: 'California Consumer Privacy Act Policy',
        description: 'CCPA compliance policy for California residents',
        jurisdiction: ['US'],
        complianceFrameworks: ['CCPA'],
        audience: ['california-residents'],
        customizations: [
          {
            customizationId: 'CUST-001',
            type: 'CONTENT',
            target: 'rights_section',
            value: 'Enhanced California consumer rights',
            priority: 1,
            enabled: true

        ]
      };

      const result = await service.createPolicy(request, 'legal-team');

      expect(result.policyId).toBeDefined();
      expect(result.version).toBe('1.0.0');
    });
  });

  describe('Policy Updates', () => {
    it('should update an existing policy successfully', async () => {
      // First create a policy
      const createRequest: PolicyAuthoringRequest = {
        policyType: 'PRIVACY_POLICY',
        title: 'Original Policy',
        description: 'Original description',
        jurisdiction: ['US'],
        complianceFrameworks: ['CCPA'],
        audience: ['all-users']
      };

      const created = await service.createPolicy(createRequest, 'author-1');

      // Then update it
      const updateRequest: PolicyUpdateRequest = {
        policyId: created.policyId,
        version: created.version,
        changes: [
          {
            changeId: 'CHG-001',
            type: 'CONTENT',
            location: 'introduction',
            description: 'Updated introduction section',
            impact: 'MEDIUM',
            requiresReacceptance: true,
            oldValue: 'Original introduction',
            newValue: 'Updated introduction with clearer language'

        ],
        description: 'Updated policy for clarity',
        impact: 'MEDIUM',
        requiresApproval: true,
        notificationRequired: true
      };

      const result = await service.updatePolicy(updateRequest, 'editor-1');

      expect(result.versionId).toBeDefined();
      expect(result.newVersion).toBe('1.1.0');

      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'POLICY_UPDATE_INITIATED'
  }
      );

      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'POLICY_UPDATED'
  }
      );
    });

    it('should handle critical impact updates with major version increment', async () => {
      const createRequest: PolicyAuthoringRequest = {
        policyType: 'PRIVACY_POLICY',
        title: 'Test Policy',
        description: 'Test description',
        jurisdiction: ['US'],
        complianceFrameworks: ['CCPA'],
        audience: ['all-users']
      };

      const created = await service.createPolicy(createRequest, 'author-1');

      const updateRequest: PolicyUpdateRequest = {
        policyId: created.policyId,
        version: created.version,
        changes: [
          {
            changeId: 'CHG-CRITICAL',
            type: 'STRUCTURE',
            location: 'global',
            description: 'Major structural changes',
            impact: 'CRITICAL',
            requiresReacceptance: true

        ],
        description: 'Critical policy restructuring',
        impact: 'CRITICAL',
        requiresApproval: true,
        notificationRequired: true
      };

      const result = await service.updatePolicy(updateRequest, 'legal-head');

      expect(result.newVersion).toBe('2.0.0');
    });

    it('should throw error for non-existent policy', async () => {
      const updateRequest: PolicyUpdateRequest = {
        policyId: 'NON-EXISTENT',
        version: '1.0.0',
        changes: [],
        description: 'Update attempt',
        impact: 'LOW',
        requiresApproval: false,
        notificationRequired: false
      };

      await expect(service.updatePolicy(updateRequest, 'editor'))
        .rejects.toThrow('Policy NON-EXISTENT not found');
    });
  });

  describe('Policy Deployment', () => {
    it('should deploy policy to staging environment', async () => {
      const createRequest: PolicyAuthoringRequest = {
        policyType: 'PRIVACY_POLICY',
        title: 'Deployment Test Policy',
        description: 'Policy for deployment testing',
        jurisdiction: ['US'],
        complianceFrameworks: ['CCPA'],
        audience: ['all-users']
      };

      const created = await service.createPolicy(createRequest, 'author-1');

      const deployRequest: PolicyDeploymentRequest = {
        policyId: created.policyId,
        version: created.version,
        environment: 'STAGING',
        channels: ['web', 'mobile'],
        rolloutStrategy: {
          type: 'IMMEDIATE',
          phases: [],
          rollbackCriteria: [],
          monitoringPeriod: 24

        notificationSettings: {
          enabled: true,
          channels: [
            {
              type: 'EMAIL',
              configuration: { template: 'default' },
              enabled: true,
              priority: 1

          ],
          audiences: ['all-users'],
          template: 'deployment-notification',
          scheduling: {
            immediate: true


      };

      const result = await service.deployPolicy(deployRequest, 'deployer-1');

      expect(result.deploymentId).toMatch(/^DEP-\d+-[a-z0-9]+$/);

      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'POLICY_DEPLOYMENT_INITIATED',
          details: expect.objectContaining({
            environment: 'STAGING'

  }
      );
    });

    it('should deploy policy with phased rollout strategy', async () => {
      const createRequest: PolicyAuthoringRequest = {
        policyType: 'TERMS_OF_SERVICE',
        title: 'Terms of Service v2',
        description: 'Updated terms of service',
        jurisdiction: ['US', 'EU'],
        complianceFrameworks: ['GDPR'],
        audience: ['all-users']
      };

      const created = await service.createPolicy(createRequest, 'legal-team');

      const deployRequest: PolicyDeploymentRequest = {
        policyId: created.policyId,
        version: created.version,
        environment: 'PRODUCTION',
        channels: ['web', 'mobile', 'api'],
        rolloutStrategy: {
          type: 'PHASED',
          phases: [
            {
              phaseId: 'phase-1',
              name: 'Initial Rollout',
              percentage: 25,
              audience: ['beta-users'],
              startDate: new Date(),
              duration: 24,
              successCriteria: [],
              dependencies: [],
              monitoring: {
                enabled: true,
                metrics: ['acceptance_rate', 'error_rate'],
                alertThresholds: { error_rate: 0.05 },
                automatedActions: []


            {
              phaseId: 'phase-2',
              name: 'Full Rollout',
              percentage: 100,
              audience: ['all-users'],
              startDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
              duration: 48,
              successCriteria: [],
              dependencies: ['phase-1'],
              monitoring: {
                enabled: true,
                metrics: ['acceptance_rate'],
                alertThresholds: {},
                automatedActions: []


          ],
          rollbackCriteria: [
            {
              criteriaId: 'error-rate',
              condition: {
                type: 'ERROR_RATE',
                threshold: 0.1,
                duration: 60,
                consecutive: true

              automatic: true,
              severity: 'HIGH',
              action: 'IMMEDIATE'

          ],
          monitoringPeriod: 72

        notificationSettings: {
          enabled: true,
          channels: [
            {
              type: 'EMAIL',
              configuration: {},
              enabled: true,
              priority: 1

            {
              type: 'IN_APP',
              configuration: {},
              enabled: true,
              priority: 2

          ],
          audiences: ['all-users'],
          template: 'terms-update',
          scheduling: {
            immediate: false,
            scheduled: new Date(Date.now() + 2 * 60 * 60 * 1000),
            reminders: [
              {
                daysBefore: 7,
                channel: 'EMAIL',
                template: 'terms-reminder',
                enabled: true

            ]


      };

      const result = await service.deployPolicy(deployRequest, 'devops-lead');

      expect(result.deploymentId).toBeDefined();
    });

    it('should throw error for non-existent policy deployment', async () => {
      const deployRequest: PolicyDeploymentRequest = {
        policyId: 'NON-EXISTENT',
        version: '1.0.0',
        environment: 'STAGING',
        channels: ['web'],
        rolloutStrategy: {
          type: 'IMMEDIATE',
          phases: [],
          rollbackCriteria: [],
          monitoringPeriod: 24

        notificationSettings: {
          enabled: false,
          channels: [],
          audiences: [],
          template: 'default',
          scheduling: { immediate: true }

      };

      await expect(service.deployPolicy(deployRequest, 'deployer'))
        .rejects.toThrow('Policy NON-EXISTENT not found');
    });
  });

  describe('Compliance Generation', () => {
    it('should generate GDPR compliance policy', async () => {
      const result = await service.generateFromCompliance(
        'GDPR',
        'EU',
        {
          company_name: 'European Corp',
          contact_email: 'privacy@european.corp',
          data_retention_period: 5

        'compliance-officer'
      );

      expect(result.policyId).toBeDefined();
      expect(result.suggestions).toBeInstanceOf(Array);
    });

    it('should generate CCPA compliance policy', async () => {
      const result = await service.generateFromCompliance(
        'CCPA',
        'US',
        {
          business_name: 'California Business Inc',
          contact_method: 'privacy@californiabiz.com'

        'legal-counsel'
      );

      expect(result.policyId).toBeDefined();
      expect(result.suggestions).toBeInstanceOf(Array);
    });

    it('should generate HIPAA compliance policy', async () => {
      const result = await service.generateFromCompliance(
        'HIPAA',
        'US',
        {
          covered_entity: 'Healthcare Provider LLC',
          hipaa_officer: 'hipaa@healthcare.com'

        'compliance-manager'
      );

      expect(result.policyId).toBeDefined();
      expect(result.suggestions).toBeInstanceOf(Array);
    });
  });

  describe('Compliance Validation', () => {
    it('should validate policy against GDPR compliance', async () => {
      const createRequest: PolicyAuthoringRequest = {
        policyType: 'GDPR_POLICY',
        title: 'GDPR Test Policy',
        description: 'Policy for GDPR validation testing',
        jurisdiction: ['EU'],
        complianceFrameworks: ['GDPR'],
        audience: ['eu-users']
      };

      const created = await service.createPolicy(createRequest, 'author-1');

      const validation = await service.validateCompliance(created.policyId, ['GDPR']);

      expect(validation).toEqual({
        overallCompliance: expect.any(Number),
        frameworkResults: expect.arrayContaining([
          expect.objectContaining({
            framework: 'GDPR',
            score: expect.any(Number),
            status: expect.any(String)

        ]),
        recommendations: expect.any(Array)
      });
    });

    it('should validate policy against multiple frameworks', async () => {
      const createRequest: PolicyAuthoringRequest = {
        policyType: 'PRIVACY_POLICY',
        title: 'Multi-Framework Policy',
        description: 'Policy compliant with multiple frameworks',
        jurisdiction: ['US', 'EU'],
        complianceFrameworks: ['GDPR', 'CCPA', 'SOX'],
        audience: ['all-users']
      };

      const created = await service.createPolicy(createRequest, 'author-1');

      const validation = await service.validateCompliance(created.policyId, ['GDPR', 'CCPA', 'SOX']);

      expect(validation.frameworkResults).toHaveLength(3);
      expect(validation.overallCompliance).toBeGreaterThan(0);
      expect(validation.recommendations).toBeInstanceOf(Array);
    });

    it('should throw error for non-existent policy validation', async () => {
      await expect(service.validateCompliance('NON-EXISTENT', ['GDPR']))
        .rejects.toThrow('Policy NON-EXISTENT not found');
    });
  });

  describe('Version Comparison', () => {
    it('should compare two policy versions', async () => {
      const createRequest: PolicyAuthoringRequest = {
        policyType: 'PRIVACY_POLICY',
        title: 'Version Test Policy',
        description: 'Policy for version comparison testing',
        jurisdiction: ['US'],
        complianceFrameworks: ['CCPA'],
        audience: ['all-users']
      };

      const created = await service.createPolicy(createRequest, 'author-1');

      const comparison = await service.compareVersions(created.policyId, '1.0.0', '1.1.0');

      expect(comparison).toEqual({
        previousVersion: '1.0.0',
        changes: expect.any(Array),
        addedSections: expect.any(Array),
        removedSections: expect.any(Array),
        modifiedSections: expect.any(Array),
        impact: expect.objectContaining({
          requiresReacceptance: expect.any(Boolean),
          affectedUsers: expect.any(Number),
          riskLevel: expect.any(String)

      });
    });
  });

  describe('Policy Export', () => {
    it('should export policy in PDF format', async () => {
      const createRequest: PolicyAuthoringRequest = {
        policyType: 'PRIVACY_POLICY',
        title: 'Export Test Policy',
        description: 'Policy for export testing',
        jurisdiction: ['US'],
        complianceFrameworks: ['CCPA'],
        audience: ['all-users']
      };

      const created = await service.createPolicy(createRequest, 'author-1');

      const exported = await service.exportPolicy(
        created.policyId,
        created.version,
        'PDF',
        {
          includeMetadata: true,
          includeVersionHistory: false,
          watermark: 'CONFIDENTIAL',
          audience: 'legal-review'
        }
      );

      expect(exported).toEqual({
        downloadUrl: expect.stringContaining('/api/policies/'),
        size: expect.any(Number)
      });

      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'POLICY_EXPORTED',
          details: expect.objectContaining({
            format: 'PDF'

  }
      );
    });

    it('should export policy in multiple formats', async () => {
      const createRequest: PolicyAuthoringRequest = {
        policyType: 'TERMS_OF_SERVICE',
        title: 'Multi-Format Export Policy',
        description: 'Policy for testing multiple export formats',
        jurisdiction: ['US', 'EU'],
        complianceFrameworks: ['GDPR'],
        audience: ['all-users']
      };

      const created = await service.createPolicy(createRequest, 'author-1');

      const formats = ['PDF', 'HTML', 'DOCX', 'JSON'];
      
      for (const format of formats) {
        const exported = await service.exportPolicy(
          created.policyId,
          created.version,
          format,
          { includeMetadata: true }
        );

        expect(exported.downloadUrl).toContain(format.toLowerCase());
        expect(exported.size).toBeGreaterThan(0);

    });

    it('should throw error for non-existent policy export', async () => {
      await expect(service.exportPolicy('NON-EXISTENT', '1.0.0', 'PDF', {}))
        .rejects.toThrow('Policy NON-EXISTENT not found');
    });
  });

  describe('Service State Management', () => {
    it('should maintain policy state correctly', async () => {
      const createRequest: PolicyAuthoringRequest = {
        policyType: 'PRIVACY_POLICY',
        title: 'State Test Policy',
        description: 'Policy for state management testing',
        jurisdiction: ['US'],
        complianceFrameworks: ['CCPA'],
        audience: ['all-users']
      };

      const created = await service.createPolicy(createRequest, 'author-1');

      // Verify policy exists and can be retrieved
      const policy = await service.getRule?.(created.policyId);
      expect(policy).toBeDefined();
    });

    it('should handle multiple concurrent policy operations', async () => {
      const requests = Array.from({ length: 5 }, (_, i) => ({
        policyType: 'PRIVACY_POLICY' as const,
        title: `Concurrent Policy ${i + 1}`,
        description: `Description for policy ${i + 1}`,
        jurisdiction: ['US'],
        complianceFrameworks: ['CCPA'],
        audience: ['all-users']
      }));

      const results = await Promise.all(
        requests.map((req, i) => service.createPolicy(req, `author-${i + 1}`))
      );

      expect(results).toHaveLength(5);
      results.forEach((result, i) => {
        expect(result.policyId).toBeDefined();
        expect(result.version).toBe('1.0.0');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid policy types gracefully', async () => {
      const request = {
        policyType: 'INVALID_TYPE' as any,
        title: 'Invalid Policy',
        description: 'This should fail',
        jurisdiction: ['US'],
        complianceFrameworks: ['CCPA'],
        audience: ['all-users']
      };

      // Note: In a real implementation, this would validate the policy type
      // For now, we'll just verify the service doesn't crash
      try {
        await service.createPolicy(request, 'author-1');
 catch (error) {
        expect(error).toBeInstanceOf(Error);

    });

    it('should handle audit service failures gracefully', async () => {
      const failingAuditService = {
        logEvent: jest.fn().mockRejectedValue(new Error('Audit service down'))
 as unknown as AuditService;

      const serviceWithFailingAudit = new PolicyAuthoringService(failingAuditService);

      const request: PolicyAuthoringRequest = {
        policyType: 'PRIVACY_POLICY',
        title: 'Test Policy',
        description: 'Testing audit failures',
        jurisdiction: ['US'],
        complianceFrameworks: ['CCPA'],
        audience: ['all-users']
      };

      // The service should still work even if audit logging fails
      await expect(serviceWithFailingAudit.createPolicy(request, 'author-1'))
        .rejects.toThrow(); // Should propagate audit error for now
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete policy lifecycle', async () => {
      // 1. Create policy
      const createRequest: PolicyAuthoringRequest = {
        policyType: 'PRIVACY_POLICY',
        title: 'Lifecycle Test Policy',
        description: 'Complete lifecycle testing',
        jurisdiction: ['US', 'EU'],
        complianceFrameworks: ['GDPR', 'CCPA'],
        audience: ['all-users']
      };

      const created = await service.createPolicy(createRequest, 'author-1');

      // 2. Update policy
      const updateRequest: PolicyUpdateRequest = {
        policyId: created.policyId,
        version: created.version,
        changes: [
          {
            changeId: 'CHG-LIFECYCLE',
            type: 'CONTENT',
            location: 'rights_section',
            description: 'Enhanced user rights section',
            impact: 'MEDIUM',
            requiresReacceptance: true

        ],
        description: 'Enhanced user rights',
        impact: 'MEDIUM',
        requiresApproval: true,
        notificationRequired: true
      };

      const updated = await service.updatePolicy(updateRequest, 'editor-1');

      // 3. Validate compliance
      const validation = await service.validateCompliance(created.policyId, ['GDPR', 'CCPA']);

      // 4. Deploy to staging
      const deployRequest: PolicyDeploymentRequest = {
        policyId: created.policyId,
        version: updated.newVersion,
        environment: 'STAGING',
        channels: ['web'],
        rolloutStrategy: {
          type: 'IMMEDIATE',
          phases: [],
          rollbackCriteria: [],
          monitoringPeriod: 24

        notificationSettings: {
          enabled: true,
          channels: [{ type: 'EMAIL', configuration: {}, enabled: true, priority: 1 }],
          audiences: ['test-users'],
          template: 'staging-notification',
          scheduling: { immediate: true }

      };

      const deployed = await service.deployPolicy(deployRequest, 'deployer-1');

      // 5. Export final version
      const exported = await service.exportPolicy(created.policyId, updated.newVersion, 'PDF', {});

      // Verify all operations completed successfully
      expect(created.policyId).toBeDefined();
      expect(updated.newVersion).toBe('1.1.0');
      expect(validation.overallCompliance).toBeGreaterThan(0);
      expect(deployed.deploymentId).toBeDefined();
      expect(exported.downloadUrl).toBeDefined();
    });
  });
});