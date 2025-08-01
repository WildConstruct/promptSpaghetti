/**
 * Escalation Procedures Test Suite - Epic 17 Implementation
 * Task: E17-1753114397261-63A60C - Implement escalation procedures
 * 
 * Comprehensive test suite for the escalation system including
 * rule management, case workflows, notifications, and dashboard functionality.
 */

import { EscalationProcedureService, EscalationRule, EscalationCase, EscalationTriggerType, EscalationCategory, EscalationPriority, EscalationStatus } from '../services/escalation/EscalationProcedureService';
import { Database } from '../database';
import { AuditService } from '../auth/services/AuditService';

// Mock dependencies
jest.mock('../database');
jest.mock('../auth/services/AuditService');

describe('Escalation Procedures System', () => {
  let escalationService: EscalationProcedureService;
  let mockDatabase: jest.Mocked<Database>;
  let mockAuditService: jest.Mocked<AuditService>;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create mock instances
    mockDatabase = new Database() as jest.Mocked<Database>;
    mockAuditService = new AuditService(mockDatabase) as jest.Mocked<AuditService>;
    
    // Setup mock implementations
    mockDatabase.query = jest.fn().mockResolvedValue([]);
    mockAuditService.logActivity = jest.fn().mockResolvedValue(undefined);
    
    // Create service instance
    escalationService = new EscalationProcedureService(mockDatabase, mockAuditService);
  });

  describe('Service Initialization', () => {
    test('should initialize successfully', async () => {
      // Mock database schema creation
      mockDatabase.query.mockResolvedValue([]);
      
      await escalationService.initialize();
      
      // Verify database initialization
      expect(mockDatabase.query).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS escalation_rules')
      );
      expect(mockDatabase.query).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS escalation_cases')
      );
      expect(mockDatabase.query).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS escalation_metrics')
      );
    });
    
    test('should load existing rules and cases', async () => {
      // Mock data loading
      const mockRules = [{
        rule_id: 'rule_123',
        name: 'Test Rule',
        description: 'Test description',
        category: EscalationCategory.FRAUD_DETECTION,
        enabled: true,
        trigger_type: EscalationTriggerType.TIME_BASED,
        conditions: '[]',
        escalation_path: '[{"levelId":"level1","level":0,"name":"Level 1","description":"First level","assignmentType":"individual","assignmentTarget":"user1","notificationMethods":[],"responseTimeLimit":60,"resolutionTimeLimit":120}]',
        timing_config: '{"initialDelay":30,"escalationInterval":60}',
        business_rules: '{"businessHoursOnly":false,"allowWeekends":true}',
        created_by: 'system',
        created_at: new Date().toISOString(),
        last_modified: new Date().toISOString(),
        version: 1
];
      
      mockDatabase.query
        .mockResolvedValueOnce([]) // Schema creation
        .mockResolvedValueOnce([]) // Schema creation
        .mockResolvedValueOnce([]) // Schema creation
        .mockResolvedValueOnce(mockRules) // Load rules
        .mockResolvedValueOnce([]); // Load cases
      
      await escalationService.initialize();
      
      // Verify rules were loaded
      expect(mockDatabase.query).toHaveBeenCalledWith(
        'SELECT * FROM escalation_rules WHERE enabled = true ORDER BY created_at DESC'
      );
    });
  });

  describe('Rule Management', () => {
    beforeEach(async () => {
      // Initialize service
      mockDatabase.query.mockResolvedValue([]);
      await escalationService.initialize();
    });
    
    test('should create escalation rule', async () => {
      const ruleData = {
        name: 'Fraud Alert Rule',
        description: 'Escalates fraud detection alerts',
        category: EscalationCategory.FRAUD_DETECTION,
        triggerType: EscalationTriggerType.THRESHOLD_BASED,
        conditions: [
          {
            conditionId: 'cond1',
            type: 'value' as const,
            field: 'fraudScore',
            operator: 'gt' as const,
            value: 0.8

        ],
        escalationPath: [
          {
            levelId: 'level1',
            level: 0,
            name: 'Fraud Analyst',
            description: 'Initial fraud review',
            assignmentType: 'role' as const,
            assignmentTarget: 'fraud_analyst',
            notificationMethods: [
              {
                type: 'email' as const,
                address: 'fraud-team@company.com',
                priority: EscalationPriority.HIGH,
                immediateDelivery: true

            ],
            responseTimeLimit: 30,
            resolutionTimeLimit: 120

        ]
      };
      
      const rule = await escalationService.createEscalationRule(ruleData, 'test-user');
      
      expect(rule).toBeDefined();
      expect(rule.name).toBe('Fraud Alert Rule');
      expect(rule.category).toBe(EscalationCategory.FRAUD_DETECTION);
      expect(rule.enabled).toBe(true);
      expect(rule.escalationPath).toHaveLength(1);
      
      // Verify database save was called
      expect(mockDatabase.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT OR REPLACE INTO escalation_rules'),
        expect.arrayContaining([
          expect.stringMatching(/^rule_/),
          'Fraud Alert Rule',
          expect.any(String)
        ])
      );
      
      // Verify audit logging
      expect(mockAuditService.logActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'create_escalation_rule',
          details: expect.objectContaining({
            ruleId: rule.ruleId,
            name: 'Fraud Alert Rule',
            category: EscalationCategory.FRAUD_DETECTION

  }
      );
    });
    
    test('should validate rule data', async () => {
      const invalidRuleData = {
        name: '', // Empty name should fail validation
        category: EscalationCategory.FRAUD_DETECTION,
        triggerType: EscalationTriggerType.TIME_BASED,
        conditions: [],
        escalationPath: [] // Empty path should fail
      };
      
      await expect(
        escalationService.createEscalationRule(invalidRuleData, 'test-user')
      ).rejects.toThrow('Escalation rule name is required');
    });
    
    test('should update escalation rule', async () => {
      // First create a rule
      const initialRuleData = {
        name: 'Initial Rule',
        category: EscalationCategory.TECHNICAL_ISSUE,
        triggerType: EscalationTriggerType.TIME_BASED,
        conditions: [],
        escalationPath: [
          {
            levelId: 'level1',
            level: 0,
            name: 'Level 1',
            description: 'First level',
            assignmentType: 'individual' as const,
            assignmentTarget: 'user1',
            notificationMethods: [],
            responseTimeLimit: 60,
            resolutionTimeLimit: 120

        ]
      };
      
      const rule = await escalationService.createEscalationRule(initialRuleData, 'test-user');
      
      // Update the rule
      const updates = {
        name: 'Updated Rule',
        description: 'Updated description',
        enabled: false
      };
      
      const updatedRule = await escalationService.updateEscalationRule(rule.ruleId, updates, 'test-user');
      
      expect(updatedRule.name).toBe('Updated Rule');
      expect(updatedRule.description).toBe('Updated description');
      expect(updatedRule.enabled).toBe(false);
      expect(updatedRule.version).toBe(2);
      
      // Verify audit logging
      expect(mockAuditService.logActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'update_escalation_rule',
          details: expect.objectContaining({
            ruleId: rule.ruleId,
            changes: updates,
            version: 2

  }
      );
    });
  });

  describe('Case Management', () => {
    let testRule: EscalationRule;
    
    beforeEach(async () => {
      // Initialize service
      mockDatabase.query.mockResolvedValue([]);
      await escalationService.initialize();
      
      // Create a test rule
      testRule = await escalationService.createEscalationRule({
        name: 'Test Rule',
        category: EscalationCategory.FRAUD_DETECTION,
        triggerType: EscalationTriggerType.MANUAL,
        conditions: [],
        escalationPath: [
          {
            levelId: 'level1',
            level: 0,
            name: 'Level 1',
            description: 'First level',
            assignmentType: 'individual' as const,
            assignmentTarget: 'analyst1',
            notificationMethods: [],
            responseTimeLimit: 60,
            resolutionTimeLimit: 240

          {
            levelId: 'level2',
            level: 1,
            name: 'Level 2',
            description: 'Second level',
            assignmentType: 'individual' as const,
            assignmentTarget: 'senior_analyst',
            notificationMethods: [],
            responseTimeLimit: 30,
            resolutionTimeLimit: 120

        ]
      }, 'test-user');
    });
    
    test('should create escalation case', async () => {
      const sourceData = {
        fraudScore: 0.95,
        transactionId: 'txn_123',
        userId: 'user_456',
        amount: 1000
      };
      
      const escalationCase = await escalationService.createEscalationCase(
        'fraud_detection',
        'fraud_123',
        sourceData,
        testRule.ruleId,
        EscalationPriority.HIGH
      );
      
      expect(escalationCase).toBeDefined();
      expect(escalationCase.sourceType).toBe('fraud_detection');
      expect(escalationCase.sourceId).toBe('fraud_123');
      expect(escalationCase.sourceData).toEqual(sourceData);
      expect(escalationCase.ruleId).toBe(testRule.ruleId);
      expect(escalationCase.priority).toBe(EscalationPriority.HIGH);
      expect(escalationCase.status).toBe(EscalationStatus.PENDING);
      expect(escalationCase.currentLevel).toBe(0);
      
      // Verify database save
      expect(mockDatabase.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT OR REPLACE INTO escalation_cases'),
        expect.arrayContaining([
          expect.stringMatching(/^case_/),
          testRule.ruleId,
          EscalationCategory.FRAUD_DETECTION,
          EscalationPriority.HIGH,
          EscalationStatus.PENDING
        ])
      );
      
      // Verify audit logging
      expect(mockAuditService.logActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'create_escalation_case',
          details: expect.objectContaining({
            caseId: escalationCase.caseId,
            sourceType: 'fraud_detection',
            sourceId: 'fraud_123',
            ruleId: testRule.ruleId

  }
      );
    });
    
    test('should escalate case to next level', async () => {
      // Create a case
      const escalationCase = await escalationService.createEscalationCase(
        'fraud_detection',
        'fraud_123',
        { fraudScore: 0.95 },
        testRule.ruleId
      );
      
      // Escalate to next level
      const escalatedCase = await escalationService.escalateCase(
        escalationCase.caseId,
        'Automatic escalation due to timeout'
      );
      
      expect(escalatedCase.currentLevel).toBe(1);
      expect(escalatedCase.status).toBe(EscalationStatus.ESCALATED);
      expect(escalatedCase.escalationPath).toHaveLength(2);
      expect(escalatedCase.escalationPath[1].level).toBe(1);
      expect(escalatedCase.escalationPath[1].assignedTo).toBe('senior_analyst');
      expect(escalatedCase.escalationPath[1].escalationReason).toBe('Automatic escalation due to timeout');
      
      // Verify audit logging
      expect(mockAuditService.logActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'escalate_case',
          details: expect.objectContaining({
            caseId: escalationCase.caseId,
            fromLevel: 0,
            toLevel: 1,
            reason: 'Automatic escalation due to timeout'

  }
      );
    });
    
    test('should resolve escalation case', async () => {
      // Create and escalate a case
      const escalationCase = await escalationService.createEscalationCase(
        'fraud_detection',
        'fraud_123',
        { fraudScore: 0.95 },
        testRule.ruleId
      );
      
      await escalationService.escalateCase(escalationCase.caseId);
      
      // Resolve the case
      const resolvedCase = await escalationService.resolveCase(
        escalationCase.caseId,
        'analyst1',
        'resolved',
        'False positive - legitimate transaction'
      );
      
      expect(resolvedCase.status).toBe(EscalationStatus.RESOLVED);
      expect(resolvedCase.resolvedAt).toBeDefined();
      expect(resolvedCase.resolution).toBeDefined();
      expect(resolvedCase.resolution?.resolutionType).toBe('resolved');
      expect(resolvedCase.resolution?.resolvedBy).toBe('analyst1');
      expect(resolvedCase.resolution?.resolutionLevel).toBe(1);
      expect(resolvedCase.resolutionNotes).toBe('False positive - legitimate transaction');
      
      // Verify the last step was completed
      const lastStep = resolvedCase.escalationPath[resolvedCase.escalationPath.length - 1];
      expect(lastStep.completedAt).toBeDefined();
      expect(lastStep.timeSpent).toBeGreaterThan(0);
      
      // Verify audit logging
      expect(mockAuditService.logActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'resolve_escalation_case',
          details: expect.objectContaining({
            caseId: escalationCase.caseId,
            resolutionType: 'resolved',
            level: 1

  }
      );
    });
    
    test('should handle maximum escalation level', async () => {
      // Create a case
      const escalationCase = await escalationService.createEscalationCase(
        'fraud_detection',
        'fraud_123',
        { fraudScore: 0.95 },
        testRule.ruleId
      );
      
      // Escalate to max level
      await escalationService.escalateCase(escalationCase.caseId);
      
      // Try to escalate beyond max level
      await expect(
        escalationService.escalateCase(escalationCase.caseId)
      ).rejects.toThrow('Case ' + escalationCase.caseId + ' is already at maximum escalation level');
    });
  });

  describe('Dashboard and Metrics', () => {
    test('should generate escalation dashboard', async () => {
      // Initialize service
      mockDatabase.query.mockResolvedValue([]);
      await escalationService.initialize();
      
      const dashboard = await escalationService.getEscalationDashboard();
      
      expect(dashboard).toBeDefined();
      expect(dashboard).toHaveProperty('overview');
      expect(dashboard).toHaveProperty('recentEscalations');
      expect(dashboard).toHaveProperty('urgentCases');
      expect(dashboard).toHaveProperty('performance');
      expect(dashboard).toHaveProperty('workloadDistribution');
      expect(dashboard).toHaveProperty('categoryBreakdown');
      expect(dashboard).toHaveProperty('alerts');
      expect(dashboard).toHaveProperty('recommendations');
      
      expect(dashboard.overview).toHaveProperty('activeCases');
      expect(dashboard.overview).toHaveProperty('criticalCases');
      expect(dashboard.overview).toHaveProperty('overdueResponses');
      expect(dashboard.overview).toHaveProperty('overdueResolutions');
      expect(dashboard.overview).toHaveProperty('averageWaitTime');
    });
    
    test('should return escalation metrics', async () => {
      // Initialize service
      mockDatabase.query.mockResolvedValue([]);
      await escalationService.initialize();
      
      const metrics = escalationService.getEscalationMetrics();
      
      expect(metrics).toBeDefined();
      expect(metrics).toHaveProperty('totalCases');
      expect(metrics).toHaveProperty('activeCases');
      expect(metrics).toHaveProperty('resolvedCases');
      expect(metrics).toHaveProperty('escalatedCases');
      expect(metrics).toHaveProperty('averageResolutionTime');
      expect(metrics).toHaveProperty('firstLevelResolutionRate');
      expect(metrics).toHaveProperty('slaComplianceRate');
      expect(metrics).toHaveProperty('satisfactionScore');
      expect(metrics).toHaveProperty('categoryMetrics');
      expect(metrics).toHaveProperty('levelMetrics');
      expect(metrics).toHaveProperty('trends');
    });
  });

  describe('Error Handling', () => {
    test('should handle database errors gracefully', async () => {
      // Mock database error
      mockDatabase.query.mockRejectedValue(new Error('Database connection failed'));
      
      await expect(
        escalationService.initialize()
      ).rejects.toThrow('Database connection failed');
    });
    
    test('should handle invalid rule ID', async () => {
      // Initialize service
      mockDatabase.query.mockResolvedValue([]);
      await escalationService.initialize();
      
      await expect(
        escalationService.updateEscalationRule('invalid-rule-id', { name: 'Updated' }, 'test-user')
      ).rejects.toThrow('Escalation rule invalid-rule-id not found');
    });
    
    test('should handle invalid case ID', async () => {
      // Initialize service
      mockDatabase.query.mockResolvedValue([]);
      await escalationService.initialize();
      
      await expect(
        escalationService.escalateCase('invalid-case-id')
      ).rejects.toThrow('Escalation case invalid-case-id not found');
    });
  });

  describe('Integration with External Systems', () => {
    beforeEach(async () => {
      // Initialize service
      mockDatabase.query.mockResolvedValue([]);
      await escalationService.initialize();
    });
    
    test('should trigger escalation for fraud cases', async () => {
      const fraudEventData = {
        caseId: 'fraud_123',
        fraudScore: 0.95,
        transactionId: 'txn_456',
        riskFactors: ['high_velocity', 'new_device']
      };
      
      // Mock that service listens for fraud events
      const createCaseSpy = jest.spyOn(escalationService, 'createEscalationCase');
      
      // Emit fraud case event
      escalationService.emit('fraud_case_created', fraudEventData);
      
      // Wait for event processing
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(createCaseSpy).toHaveBeenCalledWith(
        'fraud_case',
        'fraud_123',
        fraudEventData,
        undefined,
        EscalationPriority.HIGH
      );
    });
    
    test('should trigger escalation for appeal submissions', async () => {
      const appealEventData = {
        appealId: 'appeal_789',
        appealType: 'policy_violation',
        userId: 'user_123',
        severity: 'high'
      };
      
      const createCaseSpy = jest.spyOn(escalationService, 'createEscalationCase');
      
      // Emit appeal event
      escalationService.emit('appeal_submitted', appealEventData);
      
      // Wait for event processing
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(createCaseSpy).toHaveBeenCalledWith(
        'appeal',
        'appeal_789',
        appealEventData,
        undefined,
        EscalationPriority.MEDIUM
      );
    });
    
    test('should handle policy violations', async () => {
      const policyViolationData = {
        violationId: 'violation_101',
        policyId: 'policy_security',
        userId: 'user_456',
        violationType: 'data_breach',
        severity: 'critical'
      };
      
      const createCaseSpy = jest.spyOn(escalationService, 'createEscalationCase');
      
      // Emit policy violation event
      escalationService.emit('policy_violation_detected', policyViolationData);
      
      // Wait for event processing
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(createCaseSpy).toHaveBeenCalledWith(
        'policy_violation',
        'violation_101',
        policyViolationData,
        undefined,
        EscalationPriority.HIGH
      );
    });
    
    test('should handle system incidents', async () => {
      const incidentData = {
        incidentId: 'incident_202',
        type: 'service_outage',
        service: 'payment_processing',
        severity: 'critical',
        affectedUsers: 1500
      };
      
      const createCaseSpy = jest.spyOn(escalationService, 'createEscalationCase');
      
      // Emit system incident event
      escalationService.emit('system_incident_reported', incidentData);
      
      // Wait for event processing
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(createCaseSpy).toHaveBeenCalledWith(
        'system_incident',
        'incident_202',
        incidentData,
        undefined,
        EscalationPriority.CRITICAL
      );
    });
  });

  describe('Performance and Scalability', () => {
    test('should handle multiple concurrent escalations', async () => {
      // Initialize service
      mockDatabase.query.mockResolvedValue([]);
      await escalationService.initialize();
      
      // Create a test rule
      const testRule = await escalationService.createEscalationRule({
        name: 'Concurrent Test Rule',
        category: EscalationCategory.TECHNICAL_ISSUE,
        triggerType: EscalationTriggerType.MANUAL,
        conditions: [],
        escalationPath: [
          {
            levelId: 'level1',
            level: 0,
            name: 'Level 1',
            description: 'First level',
            assignmentType: 'individual' as const,
            assignmentTarget: 'analyst1',
            notificationMethods: [],
            responseTimeLimit: 60,
            resolutionTimeLimit: 240

        ]
      }, 'test-user');
      
      // Create multiple cases concurrently
      const casePromises = Array.from({ length: 10 }, (_, i) =>
        escalationService.createEscalationCase(
          'test_source',
          `test_${i}`,
          { testData: i },
          testRule.ruleId,
          EscalationPriority.MEDIUM

      );
      
      const cases = await Promise.all(casePromises);
      
      expect(cases).toHaveLength(10);
      cases.forEach((escalationCase, index) => {
        expect(escalationCase.sourceId).toBe(`test_${index}`);
        expect(escalationCase.status).toBe(EscalationStatus.PENDING);
      });
    });
    
    test('should maintain performance with large datasets', async () => {
      // Initialize service
      mockDatabase.query.mockResolvedValue([]);
      await escalationService.initialize();
      
      const startTime = Date.now();
      
      // Simulate dashboard generation with large dataset
      const dashboard = await escalationService.getEscalationDashboard();
      
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      
      // Dashboard generation should complete within reasonable time (< 1 second for empty dataset)
      expect(executionTime).toBeLessThan(1000);
      expect(dashboard).toBeDefined();
    });
  });
});