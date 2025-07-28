/**
 * OAuth Policy Service Tests
 * 
 * Comprehensive test suite for the OAuth policy management framework covering
 * policy creation, enforcement, compliance validation, and integration with
 * Epic 19 security platform components.
 * 
 * Task: T-1752989143998-507 - Create OAuth policies
 */

import { OAuthPolicyService, OAuthConfiguration, TokenConfiguration, OAuthPolicyType } from '../OAuthPolicyService';
import { AuditService } from '../AuditService';
import { DatabaseService } from '../../database/DatabaseService';
import { PolicyAuthoringService } from '../../../services/PolicyAuthoringService';
import { PolicyAcceptanceTrackingService } from '../../../services/PolicyAcceptanceTrackingService';
import { ComplianceReportingService } from '../../../services/ComplianceReportingService';
import { RuleEvaluationEngine } from '../../../services/RuleEvaluationEngine';
import { OAuthGuidanceService } from '../../../services/OAuthGuidanceService';

// Mock dependencies
jest.mock('../AuditService');
jest.mock('../../database/DatabaseService');
jest.mock('../../../services/PolicyAuthoringService');
jest.mock('../../../services/PolicyAcceptanceTrackingService');
jest.mock('../../../services/ComplianceReportingService');
jest.mock('../../../services/RuleEvaluationEngine');
jest.mock('../../../services/OAuthGuidanceService');

describe('OAuthPolicyService', () => {
  let oauthPolicyService: OAuthPolicyService;
  let mockAuditService: jest.Mocked<AuditService>;
  let mockDbService: jest.Mocked<DatabaseService>;
  let mockPolicyAuthoringService: jest.Mocked<PolicyAuthoringService>;
  let mockPolicyAcceptanceService: jest.Mocked<PolicyAcceptanceTrackingService>;
  let mockComplianceReportingService: jest.Mocked<ComplianceReportingService>;
  let mockRuleEvaluationEngine: jest.Mocked<RuleEvaluationEngine>;
  let mockOAuthGuidanceService: jest.Mocked<OAuthGuidanceService>;

  beforeEach(() => {
    // Create mocked services
    mockAuditService = new AuditService({} as any, {} as any) as jest.Mocked<AuditService>;
    mockDbService = new DatabaseService({} as any) as jest.Mocked<DatabaseService>;
    mockPolicyAuthoringService = new PolicyAuthoringService(
      {} as any,
      {} as any
    ) as jest.Mocked<PolicyAuthoringService>;
    mockPolicyAcceptanceService = new PolicyAcceptanceTrackingService(
      {} as any,
      {} as any
    ) as jest.Mocked<PolicyAcceptanceTrackingService>;
    mockComplianceReportingService = new ComplianceReportingService(
      {} as any,
      {} as any,
      {} as any
    ) as jest.Mocked<ComplianceReportingService>;
    mockRuleEvaluationEngine = new RuleEvaluationEngine({} as any, {} as any) as jest.Mocked<RuleEvaluationEngine>;
    mockOAuthGuidanceService = new OAuthGuidanceService(
      {} as any,
      {} as any,
      {} as any
    ) as jest.Mocked<OAuthGuidanceService>;

    // Mock service methods
    mockAuditService.logEvent = jest.fn<unknown[], unknown>().mockResolvedValue(undefined as unknown as unknown as unknown as unknown as unknown as unknown);
    mockDbService.query = jest.fn<unknown[], unknown>().mockResolvedValue({ rows: [] } as unknown as unknown as unknown as unknown as unknown as unknown);
    mockPolicyAuthoringService.createPolicy = jest.fn<unknown[], unknown>().mockResolvedValue('policy-123' as unknown as unknown as unknown as unknown as unknown as unknown);
    mockPolicyAuthoringService.getPolicyByType = jest.fn<unknown[], unknown>().mockResolvedValue({
      policyId: 'oauth-token-policy-123',
      policyType: 'OAUTH_TOKEN_LIFECYCLE',
      title: 'OAuth Token Lifecycle Policy',
      version: '1.0'
    } as unknown as unknown as unknown as unknown as unknown as unknown);
    mockPolicyAcceptanceService.recordPolicyAcceptance = jest.fn<unknown[], unknown>().mockResolvedValue('consent-123' as unknown as unknown as unknown as unknown as unknown as unknown);
    mockComplianceReportingService.generateReport = jest.fn<unknown[], unknown>().mockResolvedValue('report-123' as unknown as unknown as unknown as unknown as unknown as unknown);
    mockRuleEvaluationEngine.evaluateRules = jest.fn<unknown[], unknown>().mockResolvedValue({
      passed: true,
      evaluationId: 'eval-123',
      policyId: 'policy-123'
    } as unknown as unknown as unknown as unknown as unknown as unknown);
    mockRuleEvaluationEngine.loadRulesByCategory = jest.fn<unknown[], unknown>().mockResolvedValue([
      { ruleId: 'oauth-rule-001', expression: 'clientType === "CONFIDENTIAL"' }
    ] as unknown as unknown as unknown as unknown as unknown as unknown);

    // Create OAuth Policy Service
    oauthPolicyService = new OAuthPolicyService(
      mockAuditService,
      mockDbService,
      mockPolicyAuthoringService,
      mockPolicyAcceptanceService,
      mockComplianceReportingService,
      mockRuleEvaluationEngine,
      mockOAuthGuidanceService
    );

    jest.clearAllMocks();
  });

  describe('Policy Creation', () => {
    test('should create OAuth policy from template successfully', async () => {
      const templateId = 'OAUTH-CLIENT-WEB-001';
      const customizations = { 
        environment: 'PRODUCTION',
        securityLevel: 'HIGH_SECURITY' 
      };
      const userId = 'user-123';

      // Mock getOAuthPolicyTemplate to return a valid template
      jest.spyOn(oauthPolicyService as any, 'getOAuthPolicyTemplate').mockResolvedValue({
        templateId,
        policyType: 'OAUTH_CLIENT_REGISTRATION',
        title: 'Web Application OAuth Client Registration Policy',
        description: 'Policy for web app client registration',
        frameworks: ['OAuth2.1', 'GDPR'],
        template: { approvalRequired: false }
      } as unknown as unknown as unknown as unknown as unknown as unknown);

      const policyId = await oauthPolicyService.createOAuthPolicyFromTemplate(
        templateId,
        customizations,
        userId
      );

      expect(policyId).toBe('policy-123');

      expect(mockPolicyAuthoringService.createPolicy).toHaveBeenCalledWith({
        policyType: 'OAUTH_CLIENT_REGISTRATION',
        title: 'Web Application OAuth Client Registration Policy',
        description: 'Policy for web app client registration',
        templateId,
        customizations,
        complianceFrameworks: ['OAuth2.1', 'GDPR'],
        authorId: userId,
        version: '1.0',
        approvalRequired: false
      });

      expect(mockAuditService.logEvent).toHaveBeenCalledWith({
        eventType: 'OAUTH_POLICY_CREATED',
        details: {
          policyId: 'policy-123',
          templateId,
          policyType: 'OAUTH_CLIENT_REGISTRATION',
          frameworks: ['OAuth2.1', 'GDPR'],
          customizations: ['environment', 'securityLevel']
  }
        userId,
        severity: 'MEDIUM'
      });
    });

    test('should handle policy creation failure gracefully', async () => {
      const templateId = 'INVALID-TEMPLATE';
      const userId = 'user-123';

      jest.spyOn(oauthPolicyService as any, 'getOAuthPolicyTemplate')
        .mockRejectedValue(new Error('Template not found'));

      await expect(
        oauthPolicyService.createOAuthPolicyFromTemplate(templateId, {}, userId)
      ).rejects.toThrow('Failed to create OAuth policy from template INVALID-TEMPLATE: Template not found');

      expect(mockAuditService.logEvent).toHaveBeenCalledWith({
        eventType: 'OAUTH_POLICY_CREATION_FAILED',
        details: {
          templateId,
          error: 'Template not found',
          customizations: []
  }
        userId,
        severity: 'HIGH'
      });
    });
  });

  describe('Client Registration Policy Enforcement', () => {
    test('should enforce client registration policy successfully', async () => {
      const oauthConfig: OAuthConfiguration = {
        clientId: 'client-123',
        clientType: 'CONFIDENTIAL',
        scopes: ['openid', 'profile', 'email'],
        redirectUris: ['https://example.com/callback'],
        environment: 'PRODUCTION',
        securityLevel: 'STANDARD_SECURITY',
        complianceRequirements: ['OAuth2.1', 'GDPR'],
        customAttributes: {}
      };
      const userId = 'user-123';

      mockRuleEvaluationEngine.evaluateRules.mockResolvedValue({
        passed: true,
        evaluationId: 'eval-123',
        policyId: 'client-reg-policy-123'
      } as unknown as unknown as unknown as unknown as unknown as unknown);

      jest.spyOn(
        oauthPolicyService as any,
        'mapViolations'
      ).mockReturnValue([] as unknown as unknown as unknown as unknown as unknown as unknown);
      jest.spyOn(
        oauthPolicyService as any,
        'generateRecommendations'
      ).mockReturnValue([] as unknown as unknown as unknown as unknown as unknown as unknown);
      jest.spyOn(
        oauthPolicyService as any,
        'generateEnforcementActions'
      ).mockReturnValue([] as unknown as unknown as unknown as unknown as unknown as unknown);
      jest.spyOn(
        oauthPolicyService as any,
        'calculateNextEvaluation'
      ).mockReturnValue(new Date( as unknown as unknown));

      const result = await oauthPolicyService.enforceClientRegistrationPolicy(oauthConfig, userId);

      expect(result.compliant).toBe(true);
      expect(result.policyId).toBe('client-reg-policy-123');
      expect(result.evaluationId).toBe('eval-123');

      expect(mockRuleEvaluationEngine.loadRulesByCategory).toHaveBeenCalledWith('oauth_client_registration');
      expect(mockRuleEvaluationEngine.evaluateRules).toHaveBeenCalled();

      expect(mockAuditService.logEvent).toHaveBeenCalledWith({
        eventType: 'OAUTH_POLICY_ENFORCED',
        details: {
          clientId: oauthConfig.clientId,
          policyType: 'CLIENT_REGISTRATION',
          compliant: true,
          violationCount: 0,
          enforcementActions: 0
  }
        userId,
        severity: 'LOW'
      });
    });

    test('should handle policy violations in client registration', async () => {
      const oauthConfig: OAuthConfiguration = {
        clientId: 'client-456',
        clientType: 'PUBLIC',
        scopes: ['openid', 'profile'],
        redirectUris: ['http://localhost/callback'], // HTTP violation
        environment: 'PRODUCTION',
        securityLevel: 'HIGH_SECURITY',
        complianceRequirements: ['OAuth2.1'],
        customAttributes: { pkceRequired: false } // PKCE violation
      };
      const userId = 'user-123';

      mockRuleEvaluationEngine.evaluateRules.mockResolvedValue({
        passed: false,
        evaluationId: 'eval-456',
        policyId: 'client-reg-policy-123',
        failures: [
          {
            ruleId: 'HTTPS-REQUIRED',
            title: 'HTTPS Required for Production',
            description: 'Production redirect URIs must use HTTPS',
            severity: 'HIGH',
            field: 'redirectUris',
            actualValue: ['http://localhost/callback'],
            expectedValue: ['https://...'],
            remediationSuggestion: 'Update redirect URIs to use HTTPS'
  }
          {
            ruleId: 'PKCE-REQUIRED-PUBLIC',
            title: 'PKCE Required for Public Clients',
            description: 'Public clients must enable PKCE',
            severity: 'HIGH',
            field: 'pkceRequired',
            actualValue: false,
            expectedValue: true,
            remediationSuggestion: 'Enable PKCE for public client'
          }
        ]
      } as unknown as unknown as unknown as unknown as unknown as unknown);

      const result = await oauthPolicyService.enforceClientRegistrationPolicy(oauthConfig, userId);

      expect(result.compliant).toBe(false);
      expect(result.violations).toHaveLength(2);

      expect(mockAuditService.logEvent).toHaveBeenCalledWith({
        eventType: 'OAUTH_POLICY_ENFORCED',
        details: {
          clientId: oauthConfig.clientId,
          policyType: 'CLIENT_REGISTRATION',
          compliant: false,
          violationCount: 2,
          enforcementActions: expect.any(Number)
  }
        userId,
        severity: 'HIGH'
      });
    });

    test('should handle client registration policy enforcement errors', async () => {
      const oauthConfig: OAuthConfiguration = {
        clientId: 'client-error',
        clientType: 'CONFIDENTIAL',
        scopes: ['openid'],
        redirectUris: ['https://example.com/callback'],
        environment: 'PRODUCTION',
        securityLevel: 'STANDARD_SECURITY',
        complianceRequirements: ['OAuth2.1'],
        customAttributes: {}
      };
      const userId = 'user-123';

      mockRuleEvaluationEngine.loadRulesByCategory.mockRejectedValue(
        new Error('Failed to load rules')
      );

      await expect(
        oauthPolicyService.enforceClientRegistrationPolicy(oauthConfig, userId)
      ).rejects.toThrow('OAuth client registration policy enforcement failed: Failed to load rules');

      expect(mockAuditService.logEvent).toHaveBeenCalledWith({
        eventType: 'OAUTH_POLICY_ENFORCEMENT_ERROR',
        details: {
          clientId: oauthConfig.clientId,
          policyType: 'CLIENT_REGISTRATION',
          error: 'Failed to load rules'
  }
        userId,
        severity: 'HIGH'
      });
    });
  });

  describe('Token Lifecycle Policy Enforcement', () => {
    test('should enforce token lifecycle policy successfully', async () => {
      const tokenConfig: TokenConfiguration = {
        accessTokenTtl: 3600, // 1 hour
        refreshTokenTtl: 86400, // 24 hours
        rotationRequired: true,
        bindingRequired: false,
        encryptionRequired: false,
        audience: ['api1', 'api2'],
        scopes: ['read', 'write']
      };
      const clientId = 'client-123';
      const userId = 'user-123';

      jest.spyOn(oauthPolicyService as any, 'validateTokenCompliance').mockResolvedValue({
        isCompliant: true,
        violations: [],
        recommendations: []
      } as unknown as unknown as unknown as unknown as unknown as unknown);

      jest.spyOn(
        oauthPolicyService as any,
        'generateEnforcementActions'
      ).mockReturnValue([] as unknown as unknown as unknown as unknown as unknown as unknown);
      jest.spyOn(
        oauthPolicyService as any,
        'calculateNextEvaluation'
      ).mockReturnValue(new Date( as unknown as unknown));

      const result = await oauthPolicyService.enforceTokenLifecyclePolicy(tokenConfig, clientId, userId);

      expect(result.compliant).toBe(true);
      expect(result.policyId).toBe('oauth-token-policy-123');

      expect(mockPolicyAuthoringService.getPolicyByType).toHaveBeenCalledWith('OAUTH_TOKEN_LIFECYCLE');
      expect(mockAuditService.logEvent).toHaveBeenCalledWith({
        eventType: 'OAUTH_TOKEN_POLICY_ENFORCED',
        details: {
          clientId,
          policyType: 'TOKEN_LIFECYCLE',
          compliant: true,
          tokenTtl: tokenConfig.accessTokenTtl,
          rotationRequired: tokenConfig.rotationRequired
  }
        userId,
        severity: 'LOW'
      });
    });

    test('should detect token lifecycle policy violations', async () => {
      const tokenConfig: TokenConfiguration = {
        accessTokenTtl: 7200, // 2 hours (too long)
        refreshTokenTtl: 604800, // 7 days
        rotationRequired: false, // Should be true
        bindingRequired: false,
        encryptionRequired: false,
        audience: ['api1'],
        scopes: ['read']
      };
      const clientId = 'client-456';
      const userId = 'user-123';

      jest.spyOn(oauthPolicyService as any, 'validateTokenCompliance').mockResolvedValue({
        isCompliant: false,
        violations: [
          {
            violationId: 'token-ttl-violation',
            ruleId: 'TOKEN-TTL-MAX',
            severity: 'MEDIUM',
            title: 'Access Token TTL Exceeds Limit',
            description: 'Access token lifetime is too long',
            field: 'accessTokenTtl',
            actualValue: 7200,
            expectedValue: 3600,
            remediationSuggestion: 'Reduce access token TTL to maximum 1 hour'
          }
        ],
        recommendations: [
          {
            recommendationId: 'enable-rotation',
            title: 'Enable Token Rotation',
            description: 'Token rotation improves security',
            priority: 'MEDIUM',
            category: 'SECURITY',
            implementationGuide: 'Enable refresh token rotation',
            estimatedEffort: '1 hour'
          }
        ]
      } as unknown as unknown as unknown as unknown as unknown as unknown);

      const result = await oauthPolicyService.enforceTokenLifecyclePolicy(tokenConfig, clientId, userId);

      expect(result.compliant).toBe(false);
      expect(result.violations).toHaveLength(1);
      expect(result.recommendations).toHaveLength(1);

      expect(mockAuditService.logEvent).toHaveBeenCalledWith({
        eventType: 'OAUTH_TOKEN_POLICY_ENFORCED',
        details: {
          clientId,
          policyType: 'TOKEN_LIFECYCLE',
          compliant: false,
          tokenTtl: tokenConfig.accessTokenTtl,
          rotationRequired: tokenConfig.rotationRequired
  }
        userId,
        severity: 'MEDIUM'
      });
    });
  });

  describe('OAuth Consent Management', () => {
    test('should track OAuth consent acceptance successfully', async () => {
      const userId = 'user-123';
      const clientId = 'client-456';
      const scopes = ['openid', 'profile', 'email'];
      const consentMetadata = { 
        userAgent: 'Mozilla/5.0',
        ipAddress: '192.168.1.1' 
      };

      jest.spyOn(oauthPolicyService as any, 'mapScopeToDataTypes').mockImplementation((scope) => {
        const mapping = {
          'openid': ['user_id', 'authentication_time'],
          'profile': ['name', 'picture'],
          'email': ['email', 'email_verified']
        };
        return mapping[scope] || [scope];
      });

      jest.spyOn(oauthPolicyService as any, 'isScopeRequired').mockImplementation((scope) => {
        return scope === 'openid';
      });

      const consentId = await oauthPolicyService.trackOAuthConsentAcceptance(
        userId,
        clientId,
        scopes,
        consentMetadata
      );

      expect(consentId).toBe('consent-123');

      expect(mockPolicyAcceptanceService.recordPolicyAcceptance).toHaveBeenCalledWith({
        userId,
        policyType: 'OAUTH_CONSENT',
        acceptanceMethod: 'OAUTH_AUTHORIZATION_FLOW',
        consentData: {
          granularConsents: [
            {
              consentId: 'oauth-openid',
              purpose: 'openid',
              dataTypes: ['user_id', 'authentication_time'],
              required: true,
              granted: true,
              timestamp: expect.any(Date)
  }
            {
              consentId: 'oauth-profile',
              purpose: 'profile',
              dataTypes: ['name', 'picture'],
              required: false,
              granted: true,
              timestamp: expect.any(Date)
  }
            {
              consentId: 'oauth-email',
              purpose: 'email',
              dataTypes: ['email', 'email_verified'],
              required: false,
              granted: true,
              timestamp: expect.any(Date)
            }
          ]
  }
        acceptanceContext: {
          clientId,
          grantType: 'authorization_code',
          scopes,
          timestamp: expect.any(Date),
          metadata: consentMetadata
        }
      });

      expect(mockAuditService.logEvent).toHaveBeenCalledWith({
        eventType: 'OAUTH_CONSENT_RECORDED',
        details: {
          consentId: 'consent-123',
          userId,
          clientId,
          scopes,
          acceptanceMethod: 'OAUTH_FLOW'
  }
        userId,
        severity: 'LOW'
      });
    });

    test('should handle consent tracking errors', async () => {
      const userId = 'user-123';
      const clientId = 'client-456';
      const scopes = ['openid'];

      mockPolicyAcceptanceService.recordPolicyAcceptance.mockRejectedValue(
        new Error('Database connection failed')
      );

      await expect(
        oauthPolicyService.trackOAuthConsentAcceptance(userId, clientId, scopes)
      ).rejects.toThrow('Failed to track OAuth consent acceptance: Database connection failed');
    });
  });

  describe('OAuth Compliance Reporting', () => {
    test('should generate OAuth compliance report successfully', async () => {
      const framework = 'GDPR';
      const scope = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        clientIds: ['client-123', 'client-456'],
        includePolicies: ['OAUTH_CLIENT_REGISTRATION', 'OAUTH_CONSENT_MANAGEMENT'] as OAuthPolicyType[]
      };
      const userId = 'user-123';

      const reportId = await oauthPolicyService.generateOAuthComplianceReport(
        framework,
        scope,
        userId
      );

      expect(reportId).toBe('report-123');

      expect(mockComplianceReportingService.generateReport).toHaveBeenCalledWith({
        reportType: 'OAUTH_COMPLIANCE_ASSESSMENT',
        framework,
        scope: {
          startDate: scope.startDate,
          endDate: scope.endDate,
          includedSystems: ['oauth_service', 'oauth_guidance_service', 'oauth_policy_service'],
          includedPolicies: scope.includePolicies,
          additionalFilters: { clientIds: scope.clientIds }
  }
        recipients: [`${userId}@company.com`],
        format: 'PDF',
        includeExecutiveSummary: true,
        includeRecommendations: true,
        includeEvidence: true
      });

      expect(mockAuditService.logEvent).toHaveBeenCalledWith({
        eventType: 'OAUTH_COMPLIANCE_REPORT_GENERATED',
        details: {
          reportId: 'report-123',
          framework,
          scope: {
            dateRange: '2024-01-01T00:00:00.000Z - 2024-12-31T00:00:00.000Z',
            clientCount: 2,
            policyTypes: 2
          }
  }
        userId,
        severity: 'LOW'
      });
    });

    test('should handle compliance reporting errors', async () => {
      const framework = 'OAuth2.1';
      const scope = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31')
      };
      const userId = 'user-123';

      mockComplianceReportingService.generateReport.mockRejectedValue(
        new Error('Report generation failed')
      );

      await expect(
        oauthPolicyService.generateOAuthComplianceReport(framework, scope, userId)
      ).rejects.toThrow('Failed to generate OAuth compliance report: Report generation failed');
    });
  });

  describe('OAuth Governance Framework', () => {
    test('should create OAuth governance framework successfully', async () => {
      const title = 'Enterprise OAuth Governance Framework';
      const description = 'Comprehensive OAuth governance for enterprise environments';
      const complianceFrameworks = ['OAuth2.1', 'GDPR', 'SOX'] as any[];
      const userId = 'admin-123';

      jest.spyOn(oauthPolicyService as any, 'getDefaultOAuthPolicyTemplates').mockResolvedValue([
        { templateId: 'template-1', policyType: 'OAUTH_CLIENT_REGISTRATION' }
      ] as unknown as unknown as unknown as unknown as unknown as unknown);
      jest.spyOn(oauthPolicyService as any, 'getDefaultEnforcementMechanisms').mockReturnValue([
        { mechanismId: 'mechanism-1', name: 'Client Validation' }
      ] as unknown as unknown as unknown as unknown as unknown as unknown);
      jest.spyOn(oauthPolicyService as any, 'getDefaultReportingSchedule').mockReturnValue({
        monthly: ['OAuth Security Assessment']
      } as unknown as unknown as unknown as unknown as unknown as unknown);
      jest.spyOn(oauthPolicyService as any, 'getComplianceRequirements').mockReturnValue([
        { frameworkId: 'OAuth2.1', requirementId: 'OAUTH-REQ-001' }
      ] as unknown as unknown as unknown as unknown as unknown as unknown);
      jest.spyOn(oauthPolicyService as any, 'getDefaultApprovalWorkflows').mockReturnValue([
        { workflowId: 'workflow-1', name: 'Client Approval' }
      ] as unknown as unknown as unknown as unknown as unknown as unknown);

      const framework = await oauthPolicyService.createOAuthGovernanceFramework(
        title,
        description,
        complianceFrameworks,
        userId
      );

      expect(framework.title).toBe(title);
      expect(framework.description).toBe(description);
      expect(framework.policies).toHaveLength(1);
      expect(framework.enforcementMechanisms).toHaveLength(1);

      expect(mockDbService.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO oauth_governance_frameworks'),
        expect.arrayContaining([
          expect.any(String), // frameworkId
          title,
          '1.0',
          description,
          expect.any(String), // JSON configuration
          expect.any(String), // JSON compliance frameworks
          userId
        ])
      );

      expect(mockAuditService.logEvent).toHaveBeenCalledWith({
        eventType: 'OAUTH_GOVERNANCE_FRAMEWORK_CREATED',
        details: {
          frameworkId: expect.any(String),
          title,
          complianceFrameworks,
          policyCount: 1,
          enforcementMechanismCount: 1
  }
        userId,
        severity: 'MEDIUM'
      });
    });

    test('should handle governance framework creation errors', async () => {
      const title = 'Test Framework';
      const description = 'Test Description';
      const complianceFrameworks = ['OAuth2.1'] as any[];
      const userId = 'admin-123';

      mockDbService.query.mockRejectedValue(new Error('Database error'));

      await expect(
        oauthPolicyService.createOAuthGovernanceFramework(
          title,
          description,
          complianceFrameworks,
          userId

      ).rejects.toThrow('Failed to create OAuth governance framework: Database error');
    });
  });

  describe('Helper Methods', () => {
    test('should map scopes to data types correctly', () => {
      const mapScopeToDataTypes = (oauthPolicyService as any).mapScopeToDataTypes;

      expect(mapScopeToDataTypes('profile')).toEqual(['name', 'email', 'picture']);
      expect(mapScopeToDataTypes('email')).toEqual(['email', 'email_verified']);
      expect(mapScopeToDataTypes('openid')).toEqual(['user_id', 'authentication_time']);
      expect(mapScopeToDataTypes('custom_scope')).toEqual(['custom_scope']);
    });

    test('should identify required scopes correctly', () => {
      const isScopeRequired = (oauthPolicyService as any).isScopeRequired;

      expect(isScopeRequired('openid')).toBe(true);
      expect(isScopeRequired('profile')).toBe(false);
      expect(isScopeRequired('email')).toBe(false);
      expect(isScopeRequired('custom')).toBe(false);
    });

    test('should calculate next evaluation date correctly', () => {
      const calculateNextEvaluation = (oauthPolicyService as any).calculateNextEvaluation;
      const now = Date.now();

      const nextClientEval = calculateNextEvaluation('CLIENT_REGISTRATION');
      const nextTokenEval = calculateNextEvaluation('TOKEN_LIFECYCLE');
      const nextProviderEval = calculateNextEvaluation('PROVIDER_MANAGEMENT');
      const nextDefaultEval = calculateNextEvaluation('UNKNOWN');

      expect(nextClientEval.getTime()).toBeGreaterThan(now + 23 * 60 * 60 * 1000); // > 23 hours
      expect(nextTokenEval.getTime()).toBeGreaterThan(now + 30 * 60 * 1000); // > 30 minutes
      expect(nextProviderEval.getTime()).toBeGreaterThan(now + 6 * 24 * 60 * 60 * 1000); // > 6 days
      expect(nextDefaultEval.getTime()).toBeGreaterThan(now + 23 * 60 * 60 * 1000); // > 23 hours
    });
  });
});