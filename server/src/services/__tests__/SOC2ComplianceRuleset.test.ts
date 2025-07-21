/**
 * SOC2 Compliance Ruleset Tests - Epic 19
 * 
 * Comprehensive test suite for SOC2 Trust Services Criteria (TSC) framework
 * covering all five trust service categories and compliance rule evaluation.
 */

import {
  SOC2ComplianceRuleset,
  SOC2TrustServiceCategory,
  SOC2TrustServiceCriteria,
  SOC2ControlActivity,
  SOC2EvidenceType,
  SOC2Evidence,
  SOC2Finding
} from '../SOC2ComplianceRuleset';
import {
  ComplianceRuleEngine,
  RuleEvaluationContext,
  RuleEngineConfiguration
} from '../ComplianceRuleEngine';
import { AuditService } from '../../auth/services/AuditService';

// Mock dependencies
jest.mock('../../auth/services/AuditService');

describe('SOC2ComplianceRuleset', () => {
  let soc2Ruleset: SOC2ComplianceRuleset;
  let mockRuleEngine: jest.Mocked<ComplianceRuleEngine>;
  let mockAuditService: jest.Mocked<AuditService>;

  const mockRuleEngineConfig: RuleEngineConfiguration = {
    engineId: 'test-engine',
    version: '1.0.0',
    environment: 'test',
    performance: {},
    security: {},
    monitoring: {},
    logging: {},
    caching: {},
    clustering: {},
    scaling: {},
    maintenance: {}
  };

  beforeEach(() => {
    // Create mock instances
    mockAuditService = new AuditService({} as any) as jest.Mocked<AuditService>;
    mockRuleEngine = new ComplianceRuleEngine(
      mockRuleEngineConfig,
      mockAuditService
    ) as jest.Mocked<ComplianceRuleEngine>;

    // Mock AuditService methods
    mockAuditService.logEvent = jest.fn<unknown[], unknown>().mockResolvedValue(undefined as unknown as unknown);

    // Mock ComplianceRuleEngine methods
    mockRuleEngine.registerRule = jest.fn<unknown[], unknown>().mockResolvedValue({ 
      registered: true, 
      ruleId: 'test-rule', 
      conflicts: [] 
    } as unknown as unknown);
    mockRuleEngine.evaluateRules = jest.fn<unknown[], unknown>().mockResolvedValue([] as unknown as unknown);

    // Create SOC2 ruleset instance
    soc2Ruleset = new SOC2ComplianceRuleset(mockRuleEngine, mockAuditService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    test('should initialize SOC2 rules for all trust service categories', async () => {
      // Wait for initialization to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verify audit logging for initialization
      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'SOC2_RULES_INITIALIZATION_STARTED',
          details: expect.objectContaining({
            framework: 'SOC2',
            trustServiceCategories: Object.values(SOC2TrustServiceCategory)
          })
        })
      );

      // Verify rules were registered
      expect(mockRuleEngine.registerRule).toHaveBeenCalledTimes(8); // 5 rules shown in implementation
    });

    test('should register Security trust service category rules', async () => {
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify Security rules were registered
      expect(mockRuleEngine.registerRule).toHaveBeenCalledWith(
        expect.objectContaining({
          ruleId: 'SOC2-SEC-CC1-001',
          name: 'Governance Structure and Risk Management Framework',
          framework: 'SOC_2',
          category: 'GOVERNANCE',
          subcategory: SOC2TrustServiceCriteria.CC1_CONTROL_ENVIRONMENT
        })
      );

      expect(mockRuleEngine.registerRule).toHaveBeenCalledWith(
        expect.objectContaining({
          ruleId: 'SOC2-SEC-CC6-001',
          name: 'Logical Access Controls Implementation',
          framework: 'SOC_2',
          category: 'ACCESS',
          subcategory: SOC2TrustServiceCriteria.CC6_LOGICAL_PHYSICAL_ACCESS
        })
      );

      expect(mockRuleEngine.registerRule).toHaveBeenCalledWith(
        expect.objectContaining({
          ruleId: 'SOC2-SEC-CC7-001',
          name: 'System Operations and Monitoring',
          framework: 'SOC_2',
          category: 'SECURITY',
          subcategory: SOC2TrustServiceCriteria.CC7_SYSTEM_OPERATIONS
        })
      );
    });

    test('should register Availability trust service category rules', async () => {
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockRuleEngine.registerRule).toHaveBeenCalledWith(
        expect.objectContaining({
          ruleId: 'SOC2-AVL-A1-001',
          name: 'System Availability Design Requirements',
          framework: 'SOC_2',
          subcategory: SOC2TrustServiceCriteria.A1_AVAILABILITY_DESIGN
        })
      );
    });

    test('should register Processing Integrity trust service category rules', async () => {
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockRuleEngine.registerRule).toHaveBeenCalledWith(
        expect.objectContaining({
          ruleId: 'SOC2-PI-PI1-001',
          name: 'Data Processing Completeness Validation',
          framework: 'SOC_2',
          subcategory: SOC2TrustServiceCriteria.PI1_PROCESSING_COMPLETENESS
        })
      );
    });

    test('should register Confidentiality trust service category rules', async () => {
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockRuleEngine.registerRule).toHaveBeenCalledWith(
        expect.objectContaining({
          ruleId: 'SOC2-CNF-C1-001',
          name: 'Confidential Information Access Controls',
          framework: 'SOC_2',
          subcategory: SOC2TrustServiceCriteria.C1_ACCESS_CONTROLS
        })
      );
    });

    test('should register Privacy trust service category rules', async () => {
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockRuleEngine.registerRule).toHaveBeenCalledWith(
        expect.objectContaining({
          ruleId: 'SOC2-PRV-P1-001',
          name: 'Privacy Notice and Communication Requirements',
          framework: 'SOC_2',
          subcategory: SOC2TrustServiceCriteria.P1_NOTICE_COMMUNICATION
        })
      );

      expect(mockRuleEngine.registerRule).toHaveBeenCalledWith(
        expect.objectContaining({
          ruleId: 'SOC2-PRV-P2-001',
          name: 'Privacy Choice and Consent Management',
          framework: 'SOC_2',
          subcategory: SOC2TrustServiceCriteria.P2_CHOICE_CONSENT
        })
      );
    });
  });

  describe('Trust Service Categories', () => {
    test('should support all five SOC2 trust service categories', () => {
      const categories = Object.values(SOC2TrustServiceCategory);
      expect(categories).toHaveLength(5);
      expect(categories).toContain(SOC2TrustServiceCategory.SECURITY);
      expect(categories).toContain(SOC2TrustServiceCategory.AVAILABILITY);
      expect(categories).toContain(SOC2TrustServiceCategory.PROCESSING_INTEGRITY);
      expect(categories).toContain(SOC2TrustServiceCategory.CONFIDENTIALITY);
      expect(categories).toContain(SOC2TrustServiceCategory.PRIVACY);
    });

    test('should define comprehensive trust service criteria', () => {
      const criteria = Object.values(SOC2TrustServiceCriteria);
      
      // Common Criteria (CC1-CC9)
      expect(criteria).toContain(SOC2TrustServiceCriteria.CC1_CONTROL_ENVIRONMENT);
      expect(criteria).toContain(SOC2TrustServiceCriteria.CC2_COMMUNICATION_INFORMATION);
      expect(criteria).toContain(SOC2TrustServiceCriteria.CC3_RISK_ASSESSMENT);
      expect(criteria).toContain(SOC2TrustServiceCriteria.CC4_MONITORING_ACTIVITIES);
      expect(criteria).toContain(SOC2TrustServiceCriteria.CC5_CONTROL_ACTIVITIES);
      expect(criteria).toContain(SOC2TrustServiceCriteria.CC6_LOGICAL_PHYSICAL_ACCESS);
      expect(criteria).toContain(SOC2TrustServiceCriteria.CC7_SYSTEM_OPERATIONS);
      expect(criteria).toContain(SOC2TrustServiceCriteria.CC8_CHANGE_MANAGEMENT);
      expect(criteria).toContain(SOC2TrustServiceCriteria.CC9_RISK_MITIGATION);

      // Availability-specific criteria
      expect(criteria).toContain(SOC2TrustServiceCriteria.A1_AVAILABILITY_DESIGN);
      expect(criteria).toContain(SOC2TrustServiceCriteria.A2_CAPACITY_MANAGEMENT);
      expect(criteria).toContain(SOC2TrustServiceCriteria.A3_SYSTEM_MONITORING);

      // Privacy-specific criteria
      expect(criteria).toContain(SOC2TrustServiceCriteria.P1_NOTICE_COMMUNICATION);
      expect(criteria).toContain(SOC2TrustServiceCriteria.P2_CHOICE_CONSENT);
      expect(criteria).toContain(SOC2TrustServiceCriteria.P3_COLLECTION);
      expect(criteria).toContain(SOC2TrustServiceCriteria.P4_USE_RETENTION_DISPOSAL);
      expect(criteria).toContain(SOC2TrustServiceCriteria.P5_ACCESS);
      expect(criteria).toContain(SOC2TrustServiceCriteria.P6_DISCLOSURE_NOTIFICATION);
      expect(criteria).toContain(SOC2TrustServiceCriteria.P7_QUALITY);
      expect(criteria).toContain(SOC2TrustServiceCriteria.P8_MONITORING_ENFORCEMENT);
    });

    test('should define SOC2 control activity types', () => {
      const activities = Object.values(SOC2ControlActivity);
      expect(activities).toHaveLength(5);
      expect(activities).toContain(SOC2ControlActivity.ENTITY_LEVEL_CONTROLS);
      expect(activities).toContain(SOC2ControlActivity.APPLICATION_CONTROLS);
      expect(activities).toContain(SOC2ControlActivity.GENERAL_IT_CONTROLS);
      expect(activities).toContain(SOC2ControlActivity.BUSINESS_PROCESS_CONTROLS);
      expect(activities).toContain(SOC2ControlActivity.COMPLEMENTARY_USER_ENTITY_CONTROLS);
    });

    test('should define SOC2 evidence types', () => {
      const evidenceTypes = Object.values(SOC2EvidenceType);
      expect(evidenceTypes.length).toBeGreaterThanOrEqual(9);
      expect(evidenceTypes).toContain(SOC2EvidenceType.POLICY_PROCEDURES);
      expect(evidenceTypes).toContain(SOC2EvidenceType.SYSTEM_CONFIGURATION);
      expect(evidenceTypes).toContain(SOC2EvidenceType.ACCESS_LOGS);
      expect(evidenceTypes).toContain(SOC2EvidenceType.MONITORING_REPORTS);
      expect(evidenceTypes).toContain(SOC2EvidenceType.INCIDENT_REPORTS);
      expect(evidenceTypes).toContain(SOC2EvidenceType.TRAINING_RECORDS);
      expect(evidenceTypes).toContain(SOC2EvidenceType.VENDOR_ASSESSMENTS);
      expect(evidenceTypes).toContain(SOC2EvidenceType.PENETRATION_TESTS);
      expect(evidenceTypes).toContain(SOC2EvidenceType.VULNERABILITY_SCANS);
    });
  });

  describe('Assessment Management', () => {
    test('should create SOC2 compliance assessment', async () => {
      const reportingPeriod = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31')
      };

      const assessment = await soc2Ruleset.createAssessment(
        SOC2TrustServiceCategory.SECURITY,
        reportingPeriod
      );

      expect(assessment).toBeDefined();
      expect(assessment.trustServiceCategory).toBe(SOC2TrustServiceCategory.SECURITY);
      expect(assessment.reportingPeriod).toEqual(reportingPeriod);
      expect(assessment.assessmentStatus).toBe('IN_PROGRESS');
      expect(assessment.criteria).toContain(SOC2TrustServiceCriteria.CC1_CONTROL_ENVIRONMENT);
      expect(assessment.controlActivities).toEqual(Object.values(SOC2ControlActivity));

      // Verify audit logging
      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'SOC2_ASSESSMENT_CREATED',
          details: expect.objectContaining({
            assessmentId: assessment.assessmentId,
            trustServiceCategory: SOC2TrustServiceCategory.SECURITY,
            reportingPeriod
          })
        })
      );
    });

    test('should retrieve created assessment', async () => {
      const assessment = await soc2Ruleset.createAssessment(
        SOC2TrustServiceCategory.AVAILABILITY,
        { startDate: new Date(), endDate: new Date() }
      );

      const retrieved = await soc2Ruleset.getAssessment(assessment.assessmentId);
      
      expect(retrieved).toEqual(assessment);
    });

    test('should list all assessments', async () => {
      const assessment1 = await soc2Ruleset.createAssessment(
        SOC2TrustServiceCategory.SECURITY,
        { startDate: new Date(), endDate: new Date() }
      );
      
      const assessment2 = await soc2Ruleset.createAssessment(
        SOC2TrustServiceCategory.PRIVACY,
        { startDate: new Date(), endDate: new Date() }
      );

      const assessments = await soc2Ruleset.listAssessments();
      
      expect(assessments).toHaveLength(2);
      expect(assessments).toContain(assessment1);
      expect(assessments).toContain(assessment2);
    });

    test('should return undefined for non-existent assessment', async () => {
      const assessment = await soc2Ruleset.getAssessment('non-existent-id');
      expect(assessment).toBeUndefined();
    });
  });

  describe('Evidence Management', () => {
    test('should add evidence to assessment', async () => {
      const assessment = await soc2Ruleset.createAssessment(
        SOC2TrustServiceCategory.SECURITY,
        { startDate: new Date(), endDate: new Date() }
      );

      const evidence: SOC2Evidence = {
        evidenceId: 'EVIDENCE-001',
        type: SOC2EvidenceType.ACCESS_LOGS,
        criteria: SOC2TrustServiceCriteria.CC6_LOGICAL_PHYSICAL_ACCESS,
        description: 'Access logs showing successful implementation of logical access controls',
        source: 'Security Information and Event Management (SIEM) System',
        collectionDate: new Date(),
        collectedBy: 'compliance-auditor',
        adequacy: 'ADEQUATE',
        operatingEffectiveness: 'EFFECTIVE',
        supportingDocuments: ['access-log-report-2024.pdf'],
        testingProcedures: ['Reviewed access logs for unauthorized access attempts'],
        testingResults: 'No unauthorized access attempts detected'
      };

      await soc2Ruleset.addEvidence(assessment.assessmentId, evidence);

      const updatedAssessment = await soc2Ruleset.getAssessment(assessment.assessmentId);
      expect(updatedAssessment?.evidenceCollected).toContain(evidence);

      // Verify audit logging
      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'SOC2_EVIDENCE_ADDED',
          details: expect.objectContaining({
            assessmentId: assessment.assessmentId,
            evidenceId: evidence.evidenceId,
            evidenceType: evidence.type,
            criteria: evidence.criteria
          })
        })
      );
    });

    test('should handle evidence for different criteria types', async () => {
      const assessment = await soc2Ruleset.createAssessment(
        SOC2TrustServiceCategory.PRIVACY,
        { startDate: new Date(), endDate: new Date() }
      );

      const privacyEvidence: SOC2Evidence = {
        evidenceId: 'EVIDENCE-PRIVACY-001',
        type: SOC2EvidenceType.POLICY_PROCEDURES,
        criteria: SOC2TrustServiceCriteria.P1_NOTICE_COMMUNICATION,
        description: 'Privacy notice and communication policies',
        source: 'Policy Management System',
        collectionDate: new Date(),
        collectedBy: 'privacy-officer',
        adequacy: 'ADEQUATE',
        operatingEffectiveness: 'EFFECTIVE',
        supportingDocuments: ['privacy-policy-2024.pdf', 'privacy-notice-template.pdf']
      };

      await soc2Ruleset.addEvidence(assessment.assessmentId, privacyEvidence);

      const updatedAssessment = await soc2Ruleset.getAssessment(assessment.assessmentId);
      expect(updatedAssessment?.evidenceCollected).toHaveLength(1);
      expect(updatedAssessment?.evidenceCollected[0]).toEqual(privacyEvidence);
    });
  });

  describe('Finding Management', () => {
    test('should add finding to assessment', async () => {
      const assessment = await soc2Ruleset.createAssessment(
        SOC2TrustServiceCategory.SECURITY,
        { startDate: new Date(), endDate: new Date() }
      );

      const finding: SOC2Finding = {
        findingId: 'FINDING-001',
        severity: 'SIGNIFICANT_DEFICIENCY',
        criteria: SOC2TrustServiceCriteria.CC6_LOGICAL_PHYSICAL_ACCESS,
        description: 'Multi-factor authentication is not consistently enforced for all privileged accounts',
        rootCause: 'Configuration gaps in identity management system',
        potentialImpact: 'Increased risk of unauthorized access to sensitive systems and data',
        recommendation: 'Implement consistent MFA enforcement for all privileged accounts',
        managementResponse: 'Management accepts the finding and will implement MFA enforcement',
        targetRemediationDate: new Date('2024-12-31'),
        status: 'OPEN'
      };

      await soc2Ruleset.addFinding(assessment.assessmentId, finding);

      const updatedAssessment = await soc2Ruleset.getAssessment(assessment.assessmentId);
      expect(updatedAssessment?.findings).toContain(finding);

      // Verify audit logging with appropriate risk level
      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'SOC2_FINDING_ADDED',
          details: expect.objectContaining({
            assessmentId: assessment.assessmentId,
            findingId: finding.findingId,
            severity: finding.severity,
            criteria: finding.criteria
          }),
          riskLevel: 'MEDIUM' // SIGNIFICANT_DEFICIENCY maps to MEDIUM risk
        })
      );
    });

    test('should assign HIGH risk level for material weakness findings', async () => {
      const assessment = await soc2Ruleset.createAssessment(
        SOC2TrustServiceCategory.SECURITY,
        { startDate: new Date(), endDate: new Date() }
      );

      const materialWeaknessFinding: SOC2Finding = {
        findingId: 'FINDING-MATERIAL-001',
        severity: 'MATERIAL_WEAKNESS',
        criteria: SOC2TrustServiceCriteria.CC1_CONTROL_ENVIRONMENT,
        description: 'Lack of adequate governance structure for information security',
        rootCause: 'No designated information security officer or committee',
        potentialImpact: 'Systemic security control deficiencies across the organization',
        recommendation: 'Establish formal information security governance structure',
        managementResponse: 'Management will establish security governance committee',
        targetRemediationDate: new Date('2024-12-31'),
        status: 'OPEN'
      };

      await soc2Ruleset.addFinding(assessment.assessmentId, materialWeaknessFinding);

      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          riskLevel: 'HIGH' // MATERIAL_WEAKNESS maps to HIGH risk
        })
      );
    });
  });

  describe('Compliance Evaluation', () => {
    test('should evaluate compliance for specific trust service category', async () => {
      const context: RuleEvaluationContext = {
        contextId: 'TEST-CONTEXT-001',
        timestamp: new Date(),
        environment: 'production',
        user: { userId: 'test-user', role: 'admin' } as any,
        data: { classification: 'CONFIDENTIAL' } as any
      };

      const mockResults = [
        {
          resultId: 'RESULT-001',
          ruleId: 'SOC2-SEC-CC1-001',
          context,
          outcome: { result: 'PASS', verdict: 'COMPLIANT' } as any,
          confidence: 0.95,
          evidence: [],
          performance: { duration: 100, memoryUsage: 1024, cpuUsage: 0.1 },
          errors: [],
          warnings: [],
          actions: [],
          audit: { evaluatedAt: new Date(), evaluatedBy: 'system', version: '1.0', environment: 'test' }
        }
      ];

      mockRuleEngine.evaluateRules.mockResolvedValue(mockResults as unknown as unknown);

      const results = await soc2Ruleset.evaluateCompliance(
        SOC2TrustServiceCategory.SECURITY,
        context
      );

      expect(results).toEqual(mockResults);
      
      // Verify rule engine was called with correct parameters
      expect(mockRuleEngine.evaluateRules).toHaveBeenCalledWith(
        context,
        ['SOC_2'],
        ['SECURITY', 'ACCESS', 'GOVERNANCE'] // Categories for Security trust service
      );

      // Verify audit logging
      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'SOC2_COMPLIANCE_EVALUATION_COMPLETED',
          details: expect.objectContaining({
            trustServiceCategory: SOC2TrustServiceCategory.SECURITY,
            rulesEvaluated: 1,
            compliantRules: 1,
            nonCompliantRules: 0
          })
        })
      );
    });

    test('should handle different trust service categories with appropriate rule categories', async () => {
      const context: RuleEvaluationContext = {
        contextId: 'TEST-CONTEXT-002',
        timestamp: new Date(),
        environment: 'test'
      };

      // Test Privacy trust service category
      await soc2Ruleset.evaluateCompliance(SOC2TrustServiceCategory.PRIVACY, context);
      
      expect(mockRuleEngine.evaluateRules).toHaveBeenCalledWith(
        context,
        ['SOC_2'],
        ['PRIVACY', 'CONSENT'] // Categories for Privacy trust service
      );

      // Test Availability trust service category
      await soc2Ruleset.evaluateCompliance(SOC2TrustServiceCategory.AVAILABILITY, context);
      
      expect(mockRuleEngine.evaluateRules).toHaveBeenCalledWith(
        context,
        ['SOC_2'],
        ['SECURITY'] // Categories for Availability trust service
      );
    });
  });

  describe('Compliance Reporting', () => {
    test('should generate comprehensive compliance report', async () => {
      const assessment = await soc2Ruleset.createAssessment(
        SOC2TrustServiceCategory.SECURITY,
        { startDate: new Date('2024-01-01'), endDate: new Date('2024-12-31') }
      );

      const report = await soc2Ruleset.generateComplianceReport(assessment.assessmentId);

      expect(report).toBeDefined();
      expect(report.assessment).toEqual(assessment);
      expect(report.overallRating).toBeOneOf(['EFFECTIVE', 'INEFFECTIVE', 'REQUIRES_IMPROVEMENT']);
      expect(report.trustServiceCriteriaResults).toBeInstanceOf(Map);
      expect(report.recommendations).toBeInstanceOf(Array);
      expect(report.recommendations.length).toBeGreaterThan(0);

      // Verify audit logging
      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'SOC2_COMPLIANCE_REPORT_GENERATED',
          details: expect.objectContaining({
            assessmentId: assessment.assessmentId,
            overallRating: report.overallRating
          })
        })
      );
    });

    test('should throw error for non-existent assessment', async () => {
      await expect(
        soc2Ruleset.generateComplianceReport('non-existent-assessment')
      ).rejects.toThrow('Assessment non-existent-assessment not found');
    });

    test('should include standard SOC2 recommendations', async () => {
      const assessment = await soc2Ruleset.createAssessment(
        SOC2TrustServiceCategory.SECURITY,
        { startDate: new Date(), endDate: new Date() }
      );

      const report = await soc2Ruleset.generateComplianceReport(assessment.assessmentId);

      expect(report.recommendations).toContain('Implement continuous monitoring for all trust service criteria');
      expect(report.recommendations).toContain('Conduct regular risk assessments and update control activities accordingly');
      expect(report.recommendations).toContain('Ensure comprehensive documentation of all control activities and evidence');
      expect(report.recommendations).toContain('Establish incident response procedures for security and availability incidents');
      expect(report.recommendations).toContain('Implement periodic testing of controls and remediate any deficiencies identified');
    });
  });

  describe('Integration with Existing Systems', () => {
    test('should integrate with ComplianceRuleEngine for rule evaluation', async () => {
      // Verify that SOC2 framework is registered in ComplianceRuleEngine
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check that rules are registered with SOC_2 framework
      const securityRuleCall = mockRuleEngine.registerRule.mock.calls.find(
        call => call[0].framework === 'SOC_2' && call[0].category === 'GOVERNANCE'
      );
      expect(securityRuleCall).toBeDefined();
    });

    test('should integrate with AuditService for compliance tracking', async () => {
      const assessment = await soc2Ruleset.createAssessment(
        SOC2TrustServiceCategory.SECURITY,
        { startDate: new Date(), endDate: new Date() }
      );

      // Verify that audit events are logged with SOC2 compliance framework
      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          compliance: expect.objectContaining({
            frameworks: ['SOC2'],
            requirements: expect.arrayContaining(['assessment_management']),
            evidenceLevel: 'ENHANCED'
          })
        })
      );
    });

    test('should support evidence mapping to audit trails', async () => {
      const assessment = await soc2Ruleset.createAssessment(
        SOC2TrustServiceCategory.CONFIDENTIALITY,
        { startDate: new Date(), endDate: new Date() }
      );

      const evidence: SOC2Evidence = {
        evidenceId: 'EVIDENCE-CONF-001',
        type: SOC2EvidenceType.SYSTEM_CONFIGURATION,
        criteria: SOC2TrustServiceCriteria.C1_ACCESS_CONTROLS,
        description: 'System configurations demonstrating access controls for confidential data',
        source: 'Configuration Management Database',
        collectionDate: new Date(),
        collectedBy: 'system-administrator',
        adequacy: 'ADEQUATE',
        operatingEffectiveness: 'EFFECTIVE',
        supportingDocuments: ['config-backup-2024.json']
      };

      await soc2Ruleset.addEvidence(assessment.assessmentId, evidence);

      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'SOC2_EVIDENCE_ADDED',
          compliance: expect.objectContaining({
            frameworks: ['SOC2'],
            requirements: expect.arrayContaining(['evidence_management'])
          })
        })
      );
    });
  });

  describe('Trust Service Categories Mapping', () => {
    test('should correctly map Security trust service category criteria', () => {
      // This would test the getCriteriaForCategory private method through public interfaces
      const assessment = soc2Ruleset.createAssessment(
        SOC2TrustServiceCategory.SECURITY,
        { startDate: new Date(), endDate: new Date() }
      );

      return assessment.then(result => {
        expect(result.criteria).toContain(SOC2TrustServiceCriteria.CC1_CONTROL_ENVIRONMENT);
        expect(result.criteria).toContain(SOC2TrustServiceCriteria.CC2_COMMUNICATION_INFORMATION);
        expect(result.criteria).toContain(SOC2TrustServiceCriteria.CC6_LOGICAL_PHYSICAL_ACCESS);
        expect(result.criteria).toContain(SOC2TrustServiceCriteria.CC7_SYSTEM_OPERATIONS);
      });
    });

    test('should correctly map Privacy trust service category criteria', () => {
      const assessment = soc2Ruleset.createAssessment(
        SOC2TrustServiceCategory.PRIVACY,
        { startDate: new Date(), endDate: new Date() }
      );

      return assessment.then(result => {
        // Should include all common criteria plus privacy-specific criteria
        expect(result.criteria).toContain(SOC2TrustServiceCriteria.CC1_CONTROL_ENVIRONMENT);
        expect(result.criteria).toContain(SOC2TrustServiceCriteria.P1_NOTICE_COMMUNICATION);
        expect(result.criteria).toContain(SOC2TrustServiceCriteria.P2_CHOICE_CONSENT);
        expect(result.criteria).toContain(SOC2TrustServiceCriteria.P3_COLLECTION);
        expect(result.criteria).toContain(SOC2TrustServiceCriteria.P4_USE_RETENTION_DISPOSAL);
        expect(result.criteria).toContain(SOC2TrustServiceCriteria.P5_ACCESS);
        expect(result.criteria).toContain(SOC2TrustServiceCriteria.P6_DISCLOSURE_NOTIFICATION);
        expect(result.criteria).toContain(SOC2TrustServiceCriteria.P7_QUALITY);
        expect(result.criteria).toContain(SOC2TrustServiceCriteria.P8_MONITORING_ENFORCEMENT);
      });
    });

    test('should correctly map Availability trust service category criteria', () => {
      const assessment = soc2Ruleset.createAssessment(
        SOC2TrustServiceCategory.AVAILABILITY,
        { startDate: new Date(), endDate: new Date() }
      );

      return assessment.then(result => {
        expect(result.criteria).toContain(SOC2TrustServiceCriteria.CC1_CONTROL_ENVIRONMENT);
        expect(result.criteria).toContain(SOC2TrustServiceCriteria.A1_AVAILABILITY_DESIGN);
        expect(result.criteria).toContain(SOC2TrustServiceCriteria.A2_CAPACITY_MANAGEMENT);
        expect(result.criteria).toContain(SOC2TrustServiceCriteria.A3_SYSTEM_MONITORING);
      });
    });
  });
});

// Custom Jest matcher for better test readability
expect.extend({
  toBeOneOf(received: unknown, validOptions: any[]) {
    const pass = validOptions.includes(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be one of ${validOptions.join(', ')}`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${received} to be one of ${validOptions.join(', ')}`,
        pass: false
      };
    }
  }
});

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeOneOf(validOptions: any[]): R;
    }
  }
}