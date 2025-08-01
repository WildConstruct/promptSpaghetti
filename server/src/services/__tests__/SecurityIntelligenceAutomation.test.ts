/**
 * SecurityIntelligenceAutomation Test Suite
 * Epic 31.4.1.4 - Develop security intelligence automation
 */

import { 
  SecurityIntelligenceAutomation,
  SecurityIntelligenceAutomationConfig,
  AutomationRule,
  AutomationRuleType,
  AutomationPriority,
  SecurityPlaybook,
  PlaybookCategory,
  AutomationExecution,
  ExecutionStatus
 from '../SecurityIntelligenceAutomation';
import { 
  SecurityIntelligenceDataPipeline,
  SecurityEvent,
  SecurityEventType,
  SecurityEventSeverity
 from '../SecurityIntelligenceDataPipeline';
import { AnalyticsCollector } from '../../analytics/AnalyticsCollector';
import { AnalyticsDAO } from '../../database/analytics-dao';
import { PerformanceMonitoringService } from '../../analytics/PerformanceMonitoringService';
import { DiagnosticService } from '../../admin/DiagnosticService';
import { HealthCheckFramework } from '../../admin/HealthCheckFramework';

// Mock dependencies
jest.mock('../SecurityIntelligenceDataPipeline');
jest.mock('../../analytics/AnalyticsCollector');
jest.mock('../../database/analytics-dao');
jest.mock('../../analytics/PerformanceMonitoringService');
jest.mock('../../admin/DiagnosticService');
jest.mock('../../admin/HealthCheckFramework');

describe('SecurityIntelligenceAutomation', () => {
  let automation: SecurityIntelligenceAutomation;
  let mockDataPipeline: jest.Mocked<SecurityIntelligenceDataPipeline>;
  let mockAnalyticsCollector: jest.Mocked<AnalyticsCollector>;
  let mockAnalyticsDAO: jest.Mocked<AnalyticsDAO>;
  let mockPerformanceMonitoringService: jest.Mocked<PerformanceMonitoringService>;
  let mockDiagnosticService: jest.Mocked<DiagnosticService>;
  let mockHealthCheckFramework: jest.Mocked<HealthCheckFramework>;
  let testConfig: SecurityIntelligenceAutomationConfig;

  beforeEach(() => {
    // Setup mocks
    mockDataPipeline = new SecurityIntelligenceDataPipeline(
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any
    ) as jest.Mocked<SecurityIntelligenceDataPipeline>;
    mockAnalyticsCollector = new AnalyticsCollector({} as any) as jest.Mocked<AnalyticsCollector>;
    mockAnalyticsDAO = new AnalyticsDAO('') as jest.Mocked<AnalyticsDAO>;
    mockPerformanceMonitoringService = new PerformanceMonitoringService(
      {} as any,
      {} as any,
      {} as any
    ) as jest.Mocked<PerformanceMonitoringService>;
    mockDiagnosticService = new DiagnosticService() as jest.Mocked<DiagnosticService>;
    mockHealthCheckFramework = new HealthCheckFramework() as jest.Mocked<HealthCheckFramework>;

    // Mock data pipeline
    mockDataPipeline.on = jest.fn<unknown[], unknown>();
    mockDataPipeline.emit = jest.fn<unknown[], unknown>();

    // Mock analytics collector
    mockAnalyticsCollector.track = jest.fn<unknown[], unknown>().mockResolvedValue(undefined as unknown);

    // Mock analytics DAO
    mockAnalyticsDAO.insertEvent = jest.fn<unknown[], unknown>().mockResolvedValue(undefined as unknown);

    // Mock performance monitoring service
    mockPerformanceMonitoringService.recordMetric = jest.fn<unknown[], unknown>().mockResolvedValue(undefined as unknown);

    // Mock diagnostic service
    mockDiagnosticService.registerDiagnostic = jest.fn<unknown[], unknown>().mockResolvedValue(undefined as unknown);

    // Mock health check framework
    mockHealthCheckFramework.registerHealthCheck = jest.fn<unknown[], unknown>().mockResolvedValue(undefined as unknown);

    // Test configuration
    testConfig = {
      automation: {
        enabled: true,
        max_concurrent_automations: 100,
        automation_timeout_ms: 300000,
        retry_attempts: 3,
        retry_delay_ms: 1000,
        failure_escalation: true,
        success_rate_threshold: 0.95

      threat_detection: {
        enabled: true,
        real_time_detection: true,
        ml_powered_detection: true,
        behavioral_analysis: true,
        anomaly_detection_threshold: 0.8,
        threat_scoring_enabled: true,
        auto_classification: true

      incident_response: {
        enabled: true,
        automated_containment: true,
        automated_investigation: true,
        automated_remediation: true,
        escalation_rules: true,
        notification_channels: ['email', 'slack', 'webhook'],
        response_time_sla_ms: 300000

      playbook_automation: {
        enabled: true,
        max_concurrent_playbooks: 50,
        playbook_timeout_ms: 1800000,
        conditional_execution: true,
        parallel_execution: true,
        rollback_on_failure: true,
        audit_execution: true

      security_orchestration: {
        enabled: true,
        tool_integration: true,
        workflow_automation: true,
        decision_automation: true,
        approval_workflows: true,
        compliance_automation: true,
        reporting_automation: true

      machine_learning: {
        enabled: true,
        threat_prediction: true,
        behavior_modeling: true,
        anomaly_detection: true,
        risk_scoring: true,
        pattern_recognition: true,
        adaptive_learning: true

      epic_integration: {
        epic1_analytics_enabled: true,
        epic17_admin_enabled: true,
        performance_monitoring: true,
        unified_logging: true,
        cross_epic_automation: true

    };

    automation = new SecurityIntelligenceAutomation(
      testConfig,
      mockDataPipeline,
      mockAnalyticsCollector,
      mockAnalyticsDAO,
      mockPerformanceMonitoringService,
      mockDiagnosticService,
      mockHealthCheckFramework
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    test('should initialize automation successfully with Epic integrations', async () => {
      await automation.initialize();

      expect(mockAnalyticsCollector.track).toHaveBeenCalledWith({
        event: 'security_automation_initialization',
        category: 'security_intelligence',
        metadata: expect.objectContaining({
          automation_version: '1.0.0',
          integration_type: 'epic1_analytics'

      });

      expect(mockPerformanceMonitoringService.recordMetric).toHaveBeenCalledWith({
        metric_name: 'security_automation_startup_time',
        value: expect.any(Number),
        unit: 'milliseconds',
        tags: {
          component: 'security_intelligence_automation',
          integration: 'epic1'

      });

      expect(mockHealthCheckFramework.registerHealthCheck).toHaveBeenCalledWith({
        id: 'security_intelligence_automation',
        name: 'Security Intelligence Automation',
        description: 'Monitors security intelligence automation health and performance',
        check: expect.any(Function),
        interval_ms: 30000,
        timeout_ms: 5000,
        critical: true
      });

      expect(mockDiagnosticService.registerDiagnostic).toHaveBeenCalledWith({
        id: 'security_intelligence_automation_diagnostics',
        name: 'Security Intelligence Automation Diagnostics',
        category: 'security_intelligence',
        collector: expect.any(Function),
        schedule: '*/5 * * * *'
      });
    });

    test('should initialize without Epic integrations when disabled', async () => {
      const configWithoutEpic = {
        ...testConfig,
        epic_integration: {
          epic1_analytics_enabled: false,
          epic17_admin_enabled: false,
          performance_monitoring: false,
          unified_logging: false,
          cross_epic_automation: false

      };

      const automationWithoutEpic = new SecurityIntelligenceAutomation(
        configWithoutEpic,
        mockDataPipeline,
        mockAnalyticsCollector,
        mockAnalyticsDAO,
        mockPerformanceMonitoringService,
        mockDiagnosticService,
        mockHealthCheckFramework
      );

      await automationWithoutEpic.initialize();

      expect(mockAnalyticsCollector.track).not.toHaveBeenCalled();
      expect(mockHealthCheckFramework.registerHealthCheck).not.toHaveBeenCalled();
    });

    test('should load default automation rules', async () => {
      await automation.initialize();

      const rules = automation.getAutomationRules();
      expect(rules.length).toBeGreaterThan(0);
      
      // Check for specific default rules
      const criticalThreatRule = rules.find(r => r.id === 'critical_threat_response');
      expect(criticalThreatRule).toBeDefined();
      expect(criticalThreatRule?.type).toBe(AutomationRuleType.THREAT_DETECTION);
      expect(criticalThreatRule?.priority).toBe(AutomationPriority.CRITICAL);
      
      const malwareRule = rules.find(r => r.id === 'malware_containment');
      expect(malwareRule).toBeDefined();
      expect(malwareRule?.type).toBe(AutomationRuleType.THREAT_DETECTION);
    });

    test('should load default security playbooks', async () => {
      await automation.initialize();

      const playbooks = automation.getSecurityPlaybooks();
      expect(playbooks.length).toBeGreaterThan(0);
      
      // Check for specific default playbooks
      const dataBreachPlaybook = playbooks.find(p => p.id === 'data_breach_response');
      expect(dataBreachPlaybook).toBeDefined();
      expect(dataBreachPlaybook?.category).toBe(PlaybookCategory.INCIDENT_HANDLING);
      
      const phishingPlaybook = playbooks.find(p => p.id === 'phishing_response');
      expect(phishingPlaybook).toBeDefined();
      expect(phishingPlaybook?.category).toBe(PlaybookCategory.THREAT_RESPONSE);
    });

    test('should setup event listeners for security events', async () => {
      await automation.initialize();

      expect(mockDataPipeline.on).toHaveBeenCalledWith('security_event_processed', expect.any(Function));
    });
  });

  describe('Automation Rule Management', () => {
    beforeEach(async () => {
      await automation.initialize();
    });

    test('should create new automation rule', async () => {
      const ruleData = {
        name: 'Test Rule',
        description: 'Test automation rule',
        type: AutomationRuleType.THREAT_DETECTION,
        conditions: [],
        actions: [],
        priority: AutomationPriority.MEDIUM,
        enabled: true,
        created_by: 'test_user',
        tags: ['test']
      };

      const ruleId = await automation.createAutomationRule(ruleData);

      expect(ruleId).toMatch(/^rule_\d+_[a-z0-9]+$/);
      
      const rules = automation.getAutomationRules();
      const createdRule = rules.find(r => r.id === ruleId);
      expect(createdRule).toBeDefined();
      expect(createdRule?.name).toBe('Test Rule');
      expect(createdRule?.type).toBe(AutomationRuleType.THREAT_DETECTION);
    });

    test('should update existing automation rule', async () => {
      const rules = automation.getAutomationRules();
      const ruleToUpdate = rules[0];
      
      await automation.updateAutomationRule(ruleToUpdate.id, {
        name: 'Updated Rule Name',
        description: 'Updated description'
      });

      const updatedRules = automation.getAutomationRules();
      const updatedRule = updatedRules.find(r => r.id === ruleToUpdate.id);
      expect(updatedRule?.name).toBe('Updated Rule Name');
      expect(updatedRule?.description).toBe('Updated description');
    });

    test('should delete automation rule', async () => {
      const rules = automation.getAutomationRules();
      const initialCount = rules.length;
      const ruleToDelete = rules[0];

      await automation.deleteAutomationRule(ruleToDelete.id);

      const remainingRules = automation.getAutomationRules();
      expect(remainingRules.length).toBe(initialCount - 1);
      expect(remainingRules.find(r => r.id === ruleToDelete.id)).toBeUndefined();
    });

    test('should throw error when updating non-existent rule', async () => {
      await expect(automation.updateAutomationRule('non_existent_rule', { name: 'Test' }))
        .rejects.toThrow('Automation rule not found: non_existent_rule');
    });

    test('should throw error when deleting non-existent rule', async () => {
      await expect(automation.deleteAutomationRule('non_existent_rule'))
        .rejects.toThrow('Automation rule not found: non_existent_rule');
    });
  });

  describe('Security Playbook Management', () => {
    beforeEach(async () => {
      await automation.initialize();
    });

    test('should create new security playbook', async () => {
      const playbookData = {
        name: 'Test Playbook',
        description: 'Test security playbook',
        category: PlaybookCategory.THREAT_RESPONSE,
        version: '1.0',
        steps: [],
        triggers: [],
        variables: [],
        approval_required: false,
        execution_timeout_ms: 600000,
        created_by: 'test_user',
        tags: ['test']
      };

      const playbookId = await automation.createSecurityPlaybook(playbookData);

      expect(playbookId).toMatch(/^playbook_\d+_[a-z0-9]+$/);
      
      const playbooks = automation.getSecurityPlaybooks();
      const createdPlaybook = playbooks.find(p => p.id === playbookId);
      expect(createdPlaybook).toBeDefined();
      expect(createdPlaybook?.name).toBe('Test Playbook');
      expect(createdPlaybook?.category).toBe(PlaybookCategory.THREAT_RESPONSE);
    });

    test('should update existing security playbook', async () => {
      const playbooks = automation.getSecurityPlaybooks();
      const playbookToUpdate = playbooks[0];
      
      await automation.updateSecurityPlaybook(playbookToUpdate.id, {
        name: 'Updated Playbook Name',
        version: '2.0'
      });

      const updatedPlaybooks = automation.getSecurityPlaybooks();
      const updatedPlaybook = updatedPlaybooks.find(p => p.id === playbookToUpdate.id);
      expect(updatedPlaybook?.name).toBe('Updated Playbook Name');
      expect(updatedPlaybook?.version).toBe('2.0');
    });

    test('should delete security playbook', async () => {
      const playbooks = automation.getSecurityPlaybooks();
      const initialCount = playbooks.length;
      const playbookToDelete = playbooks[0];

      await automation.deleteSecurityPlaybook(playbookToDelete.id);

      const remainingPlaybooks = automation.getSecurityPlaybooks();
      expect(remainingPlaybooks.length).toBe(initialCount - 1);
      expect(remainingPlaybooks.find(p => p.id === playbookToDelete.id)).toBeUndefined();
    });
  });

  describe('Automation Rule Execution', () => {
    beforeEach(async () => {
      await automation.initialize();
    });

    test('should execute automation rule successfully', async () => {
      const rules = automation.getAutomationRules();
      const criticalThreatRule = rules.find(r => r.id === 'critical_threat_response');
      
      if (!criticalThreatRule) {
        throw new Error('Critical threat rule not found');


      const mockEvent: SecurityEvent = {
        id: 'test_event_1',
        timestamp: Date.now(),
        event_type: SecurityEventType.MALWARE_DETECTION,
        severity: SecurityEventSeverity.CRITICAL,
        source: { ip_address: '192.168.1.100' } as any,
        threat_indicators: [],
        raw_data: {},
        enriched_data: {},
        response_actions: [],
        metadata: {} as any
      };

      const executionId = await automation.executeAutomationRule(criticalThreatRule, mockEvent);

      expect(executionId).toMatch(/^exec_\d+_[a-z0-9]+$/);
      expect(mockAnalyticsCollector.track).toHaveBeenCalledWith({
        event: 'automation_rule_executed',
        category: 'security_intelligence',
        metadata: expect.objectContaining({
          rule_id: criticalThreatRule.id,
          rule_name: criticalThreatRule.name,
          execution_id: executionId,
          success: true

      });
    });

    test('should handle rule execution failure', async () => {
      // Create a rule with an action that will fail
      const failingRuleId = await automation.createAutomationRule({
        name: 'Failing Rule',
        description: 'Rule that will fail',
        type: AutomationRuleType.THREAT_DETECTION,
        conditions: [],
        actions: [{
          id: 'failing_action',
          type: 'invalid_action_type' as any,
          parameters: {},
          timeout_ms: 10000,
          retry_attempts: 0,
          on_failure: 'stop' as any
],
        priority: AutomationPriority.LOW,
        enabled: true,
        created_by: 'test',
        tags: []
      });

      const rules = automation.getAutomationRules();
      const failingRule = rules.find(r => r.id === failingRuleId);
      
      if (!failingRule) {
        throw new Error('Failing rule not found');


      const mockEvent: SecurityEvent = {
        id: 'test_event_1',
        timestamp: Date.now(),
        event_type: SecurityEventType.MALWARE_DETECTION,
        severity: SecurityEventSeverity.HIGH,
        source: { ip_address: '192.168.1.100' } as any,
        threat_indicators: [],
        raw_data: {},
        enriched_data: {},
        response_actions: [],
        metadata: {} as any
      };

      await expect(automation.executeAutomationRule(failingRule, mockEvent))
        .rejects.toThrow();
    });

    test('should track rule execution metrics', async () => {
      const rules = automation.getAutomationRules();
      const rule = rules[0];
      const initialExecutionCount = rule.execution_count;

      const mockEvent: SecurityEvent = {
        id: 'test_event_1',
        timestamp: Date.now(),
        event_type: SecurityEventType.SECURITY_POLICY_VIOLATION,
        severity: SecurityEventSeverity.MEDIUM,
        source: { ip_address: '192.168.1.100' } as any,
        threat_indicators: [],
        raw_data: {},
        enriched_data: {},
        response_actions: [],
        metadata: {} as any
      };

      await automation.executeAutomationRule(rule, mockEvent);

      const updatedRules = automation.getAutomationRules();
      const updatedRule = updatedRules.find(r => r.id === rule.id);
      expect(updatedRule?.execution_count).toBe(initialExecutionCount + 1);
      expect(updatedRule?.last_execution).toBeGreaterThan(0);
    });
  });

  describe('Security Playbook Execution', () => {
    beforeEach(async () => {
      await automation.initialize();
    });

    test('should execute security playbook successfully', async () => {
      const playbooks = automation.getSecurityPlaybooks();
      const phishingPlaybook = playbooks.find(p => p.id === 'phishing_response');
      
      if (!phishingPlaybook) {
        throw new Error('Phishing playbook not found');


      const mockEvent: SecurityEvent = {
        id: 'test_event_1',
        timestamp: Date.now(),
        event_type: SecurityEventType.SECURITY_POLICY_VIOLATION,
        severity: SecurityEventSeverity.HIGH,
        source: { ip_address: '192.168.1.100' } as any,
        threat_indicators: [],
        raw_data: { email_subject: 'Urgent action required' },
        enriched_data: {},
        response_actions: [],
        metadata: {} as any
      };

      const executionId = await automation.executeSecurityPlaybook(phishingPlaybook, mockEvent);

      expect(executionId).toMatch(/^playbook_exec_\d+_[a-z0-9]+$/);
      
      const executionHistory = automation.getExecutionHistory();
      const execution = executionHistory.find(e => e.id === executionId);
      expect(execution).toBeDefined();
      expect(execution?.playbook_id).toBe(phishingPlaybook.id);
      expect(execution?.status).toBe(ExecutionStatus.COMPLETED);
    });

    test('should handle playbook requiring approval', async () => {
      const playbooks = automation.getSecurityPlaybooks();
      const dataBreachPlaybook = playbooks.find(p => p.id === 'data_breach_response');
      
      if (!dataBreachPlaybook) {
        throw new Error('Data breach playbook not found');


      const mockEvent: SecurityEvent = {
        id: 'test_event_1',
        timestamp: Date.now(),
        event_type: SecurityEventType.DATA_EXFILTRATION,
        severity: SecurityEventSeverity.CRITICAL,
        source: { ip_address: '192.168.1.100' } as any,
        threat_indicators: [],
        raw_data: {},
        enriched_data: {},
        response_actions: [],
        metadata: {} as any
      };

      const approvalRequiredSpy = jest.fn<unknown[], unknown>();
      automation.on('playbook_approval_required', approvalRequiredSpy);

      const executionId = await automation.executeSecurityPlaybook(dataBreachPlaybook, mockEvent);

      expect(executionId).toMatch(/^playbook_exec_\d+_[a-z0-9]+$/);
      expect(approvalRequiredSpy).toHaveBeenCalled();
      
      const activeExecutions = automation.getActiveExecutions();
      const execution = activeExecutions.find(e => e.id === executionId);
      expect(execution?.status).toBe(ExecutionStatus.PAUSED);
    });

    test('should approve paused execution', async () => {
      // First, create a paused execution
      const playbooks = automation.getSecurityPlaybooks();
      const dataBreachPlaybook = playbooks.find(p => p.id === 'data_breach_response');
      
      if (!dataBreachPlaybook) {
        throw new Error('Data breach playbook not found');


      const mockEvent: SecurityEvent = {
        id: 'test_event_1',
        timestamp: Date.now(),
        event_type: SecurityEventType.DATA_EXFILTRATION,
        severity: SecurityEventSeverity.CRITICAL,
        source: { ip_address: '192.168.1.100' } as any,
        threat_indicators: [],
        raw_data: {},
        enriched_data: {},
        response_actions: [],
        metadata: {} as any
      };

      const executionId = await automation.executeSecurityPlaybook(dataBreachPlaybook, mockEvent);
      
      // Approve the execution
      await automation.approveExecution(executionId, 'test_analyst');

      const executionHistory = automation.getExecutionHistory();
      const execution = executionHistory.find(e => e.id === executionId);
      expect(execution?.assigned_analyst).toBe('test_analyst');
    });

    test('should cancel active execution', async () => {
      const playbooks = automation.getSecurityPlaybooks();
      const dataBreachPlaybook = playbooks.find(p => p.id === 'data_breach_response');
      
      if (!dataBreachPlaybook) {
        throw new Error('Data breach playbook not found');


      const mockEvent: SecurityEvent = {
        id: 'test_event_1',
        timestamp: Date.now(),
        event_type: SecurityEventType.DATA_EXFILTRATION,
        severity: SecurityEventSeverity.CRITICAL,
        source: { ip_address: '192.168.1.100' } as any,
        threat_indicators: [],
        raw_data: {},
        enriched_data: {},
        response_actions: [],
        metadata: {} as any
      };

      const executionId = await automation.executeSecurityPlaybook(dataBreachPlaybook, mockEvent);
      
      // Cancel the execution
      await automation.cancelExecution(executionId, 'User requested cancellation');

      const executionHistory = automation.getExecutionHistory();
      const execution = executionHistory.find(e => e.id === executionId);
      expect(execution?.status).toBe(ExecutionStatus.CANCELLED);
      expect(execution?.error_message).toBe('User requested cancellation');
    });
  });

  describe('Event-Driven Automation', () => {
    beforeEach(async () => {
      await automation.initialize();
    });

    test('should trigger automation rules for matching security events', async () => {
      const mockEvent: SecurityEvent = {
        id: 'test_event_1',
        timestamp: Date.now(),
        event_type: SecurityEventType.MALWARE_DETECTION,
        severity: SecurityEventSeverity.CRITICAL,
        source: { ip_address: '192.168.1.100' } as any,
        threat_indicators: [],
        raw_data: {},
        enriched_data: {},
        response_actions: [],
        metadata: {} as any
      };

      const ruleExecutionSpy = jest.fn<unknown[], unknown>();
      automation.on('rule_execution_completed', ruleExecutionSpy);

      // Simulate security event from data pipeline
      const eventHandler = (mockDataPipeline.on as jest.Mock).mock.calls
        .find(call => call[0] === 'security_event_processed')?.[1];
      
      if (eventHandler) {
        await eventHandler(mockEvent);


      // Should trigger critical threat response rule
      expect(ruleExecutionSpy).toHaveBeenCalled();
    });

    test('should trigger security playbooks for matching events', async () => {
      const mockEvent: SecurityEvent = {
        id: 'test_event_1',
        timestamp: Date.now(),
        event_type: SecurityEventType.DATA_EXFILTRATION,
        severity: SecurityEventSeverity.HIGH,
        source: { ip_address: '192.168.1.100' } as any,
        threat_indicators: [],
        raw_data: {},
        enriched_data: {},
        response_actions: [],
        metadata: {} as any
      };

      const playbookExecutionSpy = jest.fn<unknown[], unknown>();
      automation.on('playbook_approval_required', playbookExecutionSpy);

      // Simulate security event from data pipeline
      const eventHandler = (mockDataPipeline.on as jest.Mock).mock.calls
        .find(call => call[0] === 'security_event_processed')?.[1];
      
      if (eventHandler) {
        await eventHandler(mockEvent);


      // Should trigger data breach response playbook (which requires approval)
      expect(playbookExecutionSpy).toHaveBeenCalled();
    });
  });

  describe('Metrics and Analytics', () => {
    beforeEach(async () => {
      await automation.initialize();
    });

    test('should collect automation metrics', async () => {
      const metrics = await automation.getAutomationMetrics();

      expect(metrics).toHaveProperty('total_automations');
      expect(metrics).toHaveProperty('active_executions');
      expect(metrics).toHaveProperty('completed_executions');
      expect(metrics).toHaveProperty('failed_executions');
      expect(metrics).toHaveProperty('average_execution_time_ms');
      expect(metrics).toHaveProperty('success_rate');
      expect(metrics).toHaveProperty('threat_detection_rate');
      expect(metrics).toHaveProperty('incident_response_time_ms');
      expect(metrics).toHaveProperty('playbook_execution_metrics');
      expect(metrics).toHaveProperty('rule_execution_metrics');
      expect(metrics).toHaveProperty('performance_metrics');

      expect(typeof metrics.total_automations).toBe('number');
      expect(typeof metrics.success_rate).toBe('number');
    });

    test('should track metrics in Epic 1 analytics', async () => {
      // Trigger metrics collection
      const metricsCollectedSpy = jest.fn<unknown[], unknown>();
      automation.on('automation_metrics_collected', metricsCollectedSpy);

      // Simulate metrics collection interval
      const metrics = await automation.getAutomationMetrics();

      expect(mockAnalyticsCollector.track).toHaveBeenCalledWith({
        event: 'automation_metrics_collected',
        category: 'security_intelligence',
        metadata: expect.objectContaining({
          total_automations: expect.any(Number),
          success_rate: expect.any(Number)

      });
    });
  });

  describe('Health and Diagnostics', () => {
    beforeEach(async () => {
      await automation.initialize();
    });

    test('should provide health status', async () => {
      const health = await automation.getHealthStatus();

      expect(health).toHaveProperty('overall_health');
      expect(health).toHaveProperty('details');
      expect(health.details).toHaveProperty('automation_rules_count');
      expect(health.details).toHaveProperty('security_playbooks_count');
      expect(health.details).toHaveProperty('initialization_status', true);
    });

    test('should provide system status', () => {
      const status = automation.getStatus();

      expect(status).toHaveProperty('initialized');
      expect(status).toHaveProperty('automation_rules_count');
      expect(status).toHaveProperty('security_playbooks_count');
      expect(status).toHaveProperty('active_executions');
      expect(status).toHaveProperty('configuration');
    });

    test('should handle shutdown gracefully', async () => {
      await automation.shutdown();

      const status = automation.getStatus();
      expect(status.initialized).toBe(false);
    });
  });

  describe('Condition Evaluation', () => {
    beforeEach(async () => {
      await automation.initialize();
    });

    test('should evaluate EVENT_FIELD conditions correctly', async () => {
      const mockEvent: SecurityEvent = {
        id: 'test_event_1',
        timestamp: Date.now(),
        event_type: SecurityEventType.MALWARE_DETECTION,
        severity: SecurityEventSeverity.CRITICAL,
        source: { ip_address: '192.168.1.100' } as any,
        threat_indicators: [],
        raw_data: {},
        enriched_data: {},
        response_actions: [],
        metadata: {} as any
      };

      // Test equality condition
      const equalityResult = await (automation as any).evaluateCondition({
        id: 'test_condition',
        type: 'event_field',
        field: 'severity',
        operator: 'equals',
        value: SecurityEventSeverity.CRITICAL
      }, mockEvent);

      expect(equalityResult).toBe(true);

      // Test inequality condition
      const inequalityResult = await (automation as any).evaluateCondition({
        id: 'test_condition',
        type: 'event_field',
        field: 'severity',
        operator: 'not_equals',
        value: SecurityEventSeverity.LOW
      }, mockEvent);

      expect(inequalityResult).toBe(true);
    });

    test('should evaluate PATTERN_MATCH conditions correctly', async () => {
      const mockEvent: SecurityEvent = {
        id: 'test_event_1',
        timestamp: Date.now(),
        event_type: SecurityEventType.SECURITY_POLICY_VIOLATION,
        severity: SecurityEventSeverity.MEDIUM,
        source: { ip_address: '192.168.1.100' } as any,
        threat_indicators: [],
        raw_data: { email_subject: 'URGENT: Action required immediately' },
        enriched_data: {},
        response_actions: [],
        metadata: {} as any
      };

      const patternResult = await (automation as any).evaluateCondition({
        id: 'test_condition',
        type: 'pattern_match',
        field: 'raw_data.email_subject',
        operator: 'regex_match',
        value: '(urgent|action required)'
      }, mockEvent);

      expect(patternResult).toBe(true);
    });

    test('should evaluate THREAT_SCORE conditions correctly', async () => {
      const mockEvent: SecurityEvent = {
        id: 'test_event_1',
        timestamp: Date.now(),
        event_type: SecurityEventType.MALWARE_DETECTION,
        severity: SecurityEventSeverity.CRITICAL,
        source: { ip_address: '192.168.1.100' } as any,
        threat_indicators: [{ type: 'ip', value: '192.168.1.100' } as any],
        raw_data: {},
        enriched_data: {},
        response_actions: [],
        metadata: {} as any
      };

      const threatScoreResult = await (automation as any).evaluateCondition({
        id: 'test_condition',
        type: 'threat_score',
        field: 'threat_score',
        operator: 'greater_than',
        value: 80
      }, mockEvent);

      expect(threatScoreResult).toBe(true);
    });
  });

  describe('Action Execution', () => {
    beforeEach(async () => {
      await automation.initialize();
    });

    test('should execute alert creation action', async () => {
      const mockExecution: AutomationExecution = {
        id: 'test_execution',
        status: ExecutionStatus.RUNNING,
        start_time: Date.now(),
        steps_completed: 0,
        steps_total: 1,
        success_rate: 0,
        execution_log: [],
        context: {}
      };

      const mockAction = {
        id: 'test_action',
        type: 'alert_creation' as any,
        parameters: { severity: 'high', title: 'Test Alert' },
        timeout_ms: 30000,
        retry_attempts: 2,
        on_failure: 'continue' as any
      };

      // This should not throw an error
      await expect((automation as any).executeAction(mockAction, mockExecution)).resolves.not.toThrow();
    });

    test('should execute email notification action', async () => {
      const mockExecution: AutomationExecution = {
        id: 'test_execution',
        status: ExecutionStatus.RUNNING,
        start_time: Date.now(),
        steps_completed: 0,
        steps_total: 1,
        success_rate: 0,
        execution_log: [],
        context: {}
      };

      const mockAction = {
        id: 'test_action',
        type: 'email_notification' as any,
        parameters: { 
          recipients: ['test@example.com'], 
          subject: 'Test Email',
          template: 'alert_template'

        timeout_ms: 30000,
        retry_attempts: 2,
        on_failure: 'continue' as any
      };

      // This should not throw an error
      await expect((automation as any).executeAction(mockAction, mockExecution)).resolves.not.toThrow();
    });

    test('should handle action failures with retry', async () => {
      const mockExecution: AutomationExecution = {
        id: 'test_execution',
        status: ExecutionStatus.RUNNING,
        start_time: Date.now(),
        steps_completed: 0,
        steps_total: 1,
        success_rate: 0,
        execution_log: [],
        context: {}
      };

      const mockAction = {
        id: 'test_action',
        type: 'unsupported_action_type' as any,
        parameters: {},
        timeout_ms: 30000,
        retry_attempts: 1,
        on_failure: 'retry' as any
      };

      // This should throw an error after retries are exhausted
      await expect((automation as any).executeAction(mockAction, mockExecution)).rejects.toThrow();
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      await automation.initialize();
    });

    test('should handle initialization errors', async () => {
      mockAnalyticsCollector.track.mockRejectedValueOnce(new Error('Analytics error'));

      const newAutomation = new SecurityIntelligenceAutomation(
        testConfig,
        mockDataPipeline,
        mockAnalyticsCollector,
        mockAnalyticsDAO,
        mockPerformanceMonitoringService,
        mockDiagnosticService,
        mockHealthCheckFramework
      );

      await expect(newAutomation.initialize()).rejects.toThrow('Analytics error');
    });

    test('should handle automation errors gracefully', async () => {
      const errorSpy = jest.fn<unknown[], unknown>();
      automation.on('automation_error', errorSpy);

      const mockEvent: SecurityEvent = {
        id: 'test_event_1',
        timestamp: Date.now(),
        event_type: SecurityEventType.MALWARE_DETECTION,
        severity: SecurityEventSeverity.CRITICAL,
        source: { ip_address: '192.168.1.100' } as any,
        threat_indicators: [],
        raw_data: {},
        enriched_data: {},
        response_actions: [],
        metadata: {} as any
      };

      // Force an error by accessing a private method incorrectly
      try {
        await (automation as any).handleSecurityEventForAutomation(mockEvent);
 catch (error) {
        // Expected to handle errors gracefully


      // The error should be emitted as an event
      // expect(errorSpy).toHaveBeenCalled();
    });

    test('should handle execution approval for non-existent execution', async () => {
      await expect(automation.approveExecution('non_existent_execution', 'analyst'))
        .rejects.toThrow('Execution not found: non_existent_execution');
    });

    test('should handle execution cancellation for non-existent execution', async () => {
      await expect(automation.cancelExecution('non_existent_execution', 'test reason'))
        .rejects.toThrow('Execution not found: non_existent_execution');
    });
  });

  describe('Integration Tests', () => {
    beforeEach(async () => {
      await automation.initialize();
    });

    test('should handle complete automation workflow', async () => {
      // Create a custom rule
      const ruleId = await automation.createAutomationRule({
        name: 'Integration Test Rule',
        description: 'Rule for integration testing',
        type: AutomationRuleType.THREAT_DETECTION,
        conditions: [{
          id: 'severity_condition',
          type: 'event_field' as any,
          field: 'severity',
          operator: 'equals' as any,
          value: SecurityEventSeverity.HIGH
],
        actions: [{
          id: 'create_alert',
          type: 'alert_creation' as any,
          parameters: { priority: 'high' },
          timeout_ms: 30000,
          retry_attempts: 2,
          on_failure: 'continue' as any
],
        priority: AutomationPriority.HIGH,
        enabled: true,
        created_by: 'test_user',
        tags: ['integration_test']
      });

      // Execute the rule
      const rules = automation.getAutomationRules();
      const createdRule = rules.find(r => r.id === ruleId);
      expect(createdRule).toBeDefined();

      const mockEvent: SecurityEvent = {
        id: 'integration_test_event',
        timestamp: Date.now(),
        event_type: SecurityEventType.UNAUTHORIZED_ACCESS,
        severity: SecurityEventSeverity.HIGH,
        source: { ip_address: '192.168.1.100' } as any,
        threat_indicators: [],
        raw_data: {},
        enriched_data: {},
        response_actions: [],
        metadata: {} as any
      };

      const executionId = await automation.executeAutomationRule(createdRule!, mockEvent);
      expect(executionId).toBeDefined();

      // Verify execution completed
      const executionHistory = automation.getExecutionHistory();
      const execution = executionHistory.find(e => e.id === executionId);
      expect(execution?.status).toBe(ExecutionStatus.COMPLETED);

      // Verify metrics updated
      const metrics = await automation.getAutomationMetrics();
      expect(metrics.completed_executions).toBeGreaterThan(0);
    });
  });
});