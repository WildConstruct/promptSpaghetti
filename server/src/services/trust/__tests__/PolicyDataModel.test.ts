/**
 * Policy Data Model Tests - Epic 17
 * 
 * Comprehensive test suite for the policy data model, covering
 * policy creation, evaluation, versioning, and analytics.
 * 
 * Task: E17-1753114397365-A62FA8 - Create policy data model
 * Epic: 17 - Backstage Admin Controls
 */

import { 
  PolicyDataService,
  PolicyBuilder,
  Policy,
  PolicyType,
  PolicyEvaluationContext,
  PolicyEvaluationResult
 from '../PolicyDataModel';
import { Database } from '../../../database';

// Mock dependencies
jest.mock('../../../database/connection');

describe('PolicyDataModel', () => {
  let policyService: PolicyDataService;
  let mockDatabase: jest.Mocked<Database>;
  let mockClient: unknown;

  beforeEach(() => {
    // Setup mocks
    mockClient = {
      query: jest.fn<unknown[], unknown>(),
      release: jest.fn<unknown[], unknown>()
    };

    mockDatabase = {
      getClient: jest.fn<unknown[], unknown>().mockResolvedValue(mockClient as unknown as unknown as unknown as unknown as unknown),
      query: jest.fn<unknown[], unknown>()
 as any;

    // Create service instance
    policyService = new PolicyDataService(mockDatabase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Policy CRUD Operations', () => {
    it('should create a new policy successfully', async () => {
      // Arrange
      const policy: Policy = {
        metadata: {
          id: 'test-policy-001',
          name: 'Test Enforcement Policy',
          description: 'Test policy for enforcement',
          type: 'enforcement',
          status: 'draft',
          version: '1.0.0',
          created_at: new Date(),
          updated_at: new Date(),
          created_by: 'test-user',
          updated_by: 'test-user',
          effective_date: new Date(),
          tags: ['test', 'enforcement']

        scope: {
          scope_type: 'global',
          scope_criteria: {}

        rules: [{
          id: 'rule-001',
          name: 'Trust Score Rule',
          description: 'Check trust score threshold',
          enabled: true,
          priority: 1,
          conditions: [{
            id: 'trust-condition',
            name: 'Trust Score Below 60',
            field: 'entity_data.trust_score',
            operator: 'lt',
            value: 60,
            data_type: 'number',
            required: true
],
          actions: [{
            id: 'restrict-action',
            type: 'restrict',
            name: 'Restrict Access',
            severity: 'medium',
            auto_execute: true,
            parameters: { duration: 86400 }
],
          condition_logic: 'ALL',
          audit_settings: {
            log_evaluations: true,
            log_actions: true,
            include_context: true

],
        configuration: {
          global_settings: {
            default_severity: 'medium',
            auto_execution_enabled: true,
            audit_enabled: true,
            notification_enabled: true

          thresholds: {
            trust_score: {
              warning: 70,
              critical: 40,
              severe: 25


          timeouts: {
            evaluation_timeout: 5000,
            action_timeout: 10000,
            retry_timeout: 30000

          rate_limits: {
            evaluations_per_second: 100,
            actions_per_minute: 50,
            notifications_per_hour: 20

          feature_flags: {
            advanced_evaluation: true,
            real_time_monitoring: true


      };

      mockClient.query
        .mockResolvedValueOnce({ rows: [] }) // BEGIN
        .mockResolvedValueOnce({ rows: [{ id: policy.metadata.id }] }) // INSERT policies
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // INSERT policy_data
        .mockResolvedValueOnce({ rows: [] }); // COMMIT

      // Act
      const result = await policyService.createPolicy(policy);

      // Assert
      expect(result).toBe('test-policy-001');
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO policies'),
        expect.arrayContaining([
          policy.metadata.id,
          policy.metadata.name,
          policy.metadata.description,
          policy.metadata.type,
          policy.metadata.status,
          policy.metadata.version,
          policy.metadata.created_by
        ])
      );
    });

    it('should retrieve a policy by ID', async () => {
      // Arrange
      const policyId = 'test-policy-001';
      const mockRow = {
        id: policyId,
        name: 'Test Policy',
        description: 'Test policy description',
        type: 'enforcement',
        status: 'active',
        version: '1.0.0',
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 'test-user',
        updated_by: 'test-user',
        effective_date: new Date(),
        expiration_date: null,
        tags: '["test"]',
        category: 'enforcement',
        subcategory: null,
        scope_data: '{"scope_type": "global", "scope_criteria": {}}',
        rules_data: '[{"id": "rule-001", "name": "Test Rule", "enabled": true}]',
        configuration_data: '{"global_settings": {"default_severity": "medium"}}',
        dependencies: '{}',
        compliance: '{}',
        testing: '{}'
      };

      mockDatabase.query.mockResolvedValue({ rows: [mockRow] } as unknown as unknown as unknown as unknown as unknown);

      // Act
      const result = await policyService.getPolicy(policyId);

      // Assert
      expect(result).toBeDefined();
      expect(result!.metadata.id).toBe(policyId);
      expect(result!.metadata.name).toBe('Test Policy');
      expect(result!.metadata.type).toBe('enforcement');
      expect(result!.scope.scope_type).toBe('global');
      expect(mockDatabase.query).toHaveBeenCalledWith(
        expect.stringContaining('FROM policies p'),
        [policyId]
      );
    });

    it('should return null for non-existent policy', async () => {
      // Arrange
      mockDatabase.query.mockResolvedValue({ rows: [] } as unknown as unknown as unknown as unknown as unknown);

      // Act
      const result = await policyService.getPolicy('non-existent');

      // Assert
      expect(result).toBeNull();
    });

    it('should update policy successfully', async () => {
      // Arrange
      const policyId = 'test-policy-001';
      const updates = {
        metadata: {
          name: 'Updated Policy Name',
          description: 'Updated description'

        configuration: {
          global_settings: {
            default_severity: 'high',
            auto_execution_enabled: false,
            audit_enabled: true,
            notification_enabled: true

          thresholds: {},
          timeouts: {
            evaluation_timeout: 10000,
            action_timeout: 20000,
            retry_timeout: 60000

          rate_limits: {
            evaluations_per_second: 50,
            actions_per_minute: 25,
            notifications_per_hour: 10

          feature_flags: {}

      };
      const updatedBy = 'admin-user';

      // Mock existing policy
      const existingPolicy = {
        metadata: { id: policyId, name: 'Old Name' },
        scope: { scope_type: 'global', scope_criteria: {} },
        rules: [],
        configuration: { global_settings: { default_severity: 'medium' } }
 as Policy;

      jest.spyOn(
        policyService,
        'getPolicy'
      ).mockResolvedValue(existingPolicy as unknown as unknown as unknown as unknown as unknown);

      mockClient.query
        .mockResolvedValueOnce({ rows: [] }) // BEGIN
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // UPDATE policies
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // UPDATE policy_data
        .mockResolvedValueOnce({ rows: [] }); // COMMIT

      // Act
      await policyService.updatePolicy(policyId, updates, updatedBy);

      // Assert
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE policies'),
        expect.arrayContaining(['Updated Policy Name', 'Updated description', updatedBy, policyId])
      );
    });

    it('should delete policy successfully', async () => {
      // Arrange
      const policyId = 'test-policy-001';
      mockDatabase.query.mockResolvedValue({ rows: [{ id: policyId }] } as unknown as unknown as unknown as unknown as unknown);

      // Act
      await policyService.deletePolicy(policyId);

      // Assert
      expect(mockDatabase.query).toHaveBeenCalledWith(
        'DELETE FROM policies WHERE id = $1',
        [policyId]
      );
    });

    it('should list policies with filters', async () => {
      // Arrange
      const filters = {
        type: 'enforcement' as PolicyType,
        status: 'active' as any,
        category: 'security',
        limit: 10,
        offset: 0
      };

      const mockRows = [
        {
          id: 'policy-001',
          name: 'Policy 1',
          type: 'enforcement',
          status: 'active',
          total_count: '2',
          scope_data: '{}',
          rules_data: '[]',
          configuration_data: '{}',
          dependencies: '{}',
          compliance: '{}',
          testing: '{}'

        {
          id: 'policy-002',
          name: 'Policy 2',
          type: 'enforcement',
          status: 'active',
          total_count: '2',
          scope_data: '{}',
          rules_data: '[]',
          configuration_data: '{}',
          dependencies: '{}',
          compliance: '{}',
          testing: '{}'

      ];

      mockDatabase.query.mockResolvedValue({ rows: mockRows } as unknown as unknown as unknown as unknown as unknown);

      // Act
      const result = await policyService.listPolicies(filters);

      // Assert
      expect(result.policies).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.policies[0].metadata.id).toBe('policy-001');
      expect(mockDatabase.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE p.type = $1 AND p.status = $2 AND p.category = $3'),
        ['enforcement', 'active', 'security', 10, 0]
      );
    });
  });

  describe('Policy Evaluation', () => {
    it('should evaluate policy and return results', async () => {
      // Arrange
      const policyId = 'test-policy-001';
      const context: PolicyEvaluationContext = {
        timestamp: new Date(),
        entity_type: 'user',
        entity_id: 'user-123',
        entity_data: { trust_score: 45 },
        trigger_event: 'trust_score_update',
        environment: {
          region: 'us-east-1',
          platform: 'web',
          version: '1.0.0'

        context_data: {}
      };

      const mockPolicy: Policy = {
        metadata: {
          id: policyId,
          name: 'Test Policy',
          description: 'Test policy',
          type: 'enforcement',
          status: 'active',
          version: '1.0.0',
          created_at: new Date(),
          updated_at: new Date(),
          created_by: 'test-user',
          updated_by: 'test-user',
          effective_date: new Date(),
          tags: []

        scope: {
          scope_type: 'global',
          scope_criteria: {}

        rules: [{
          id: 'rule-001',
          name: 'Trust Score Rule',
          description: 'Check trust score',
          enabled: true,
          priority: 1,
          conditions: [{
            id: 'trust-condition',
            name: 'Trust Score Below 50',
            field: 'entity_data.trust_score',
            operator: 'lt',
            value: 50,
            data_type: 'number',
            required: true
],
          actions: [{
            id: 'restrict-action',
            type: 'restrict',
            name: 'Restrict Access',
            severity: 'medium',
            auto_execute: true,
            parameters: {}
],
          condition_logic: 'ALL',
          audit_settings: {
            log_evaluations: true,
            log_actions: true,
            include_context: true

],
        configuration: {
          global_settings: {
            default_severity: 'medium',
            auto_execution_enabled: true,
            audit_enabled: true,
            notification_enabled: true

          thresholds: {},
          timeouts: {
            evaluation_timeout: 5000,
            action_timeout: 10000,
            retry_timeout: 30000

          rate_limits: {
            evaluations_per_second: 100,
            actions_per_minute: 50,
            notifications_per_hour: 20

          feature_flags: {}

      };

      jest.spyOn(policyService, 'getPolicy').mockResolvedValue(mockPolicy as unknown as unknown as unknown as unknown as unknown);
      
      // Mock the logPolicyEvaluation method
      const logSpy = jest.spyOn(
        policyService as any,
        'logPolicyEvaluation'
      ).mockResolvedValue(undefined as unknown as unknown as unknown as unknown as unknown);

      // Act
      const result = await policyService.evaluatePolicy(policyId, context);

      // Assert
      expect(result).toBeDefined();
      expect(result.policy_id).toBe(policyId);
      expect(result.overall_result).toBe('fail'); // Since 45 < 50
      expect(result.conditions_met).toHaveLength(1);
      expect(result.conditions_met[0].met).toBe(true);
      expect(result.actions_triggered).toHaveLength(1);
      expect(result.execution_time).toBeGreaterThan(0);
      expect(logSpy).toHaveBeenCalled();
    });

    it('should handle policy evaluation errors', async () => {
      // Arrange
      const policyId = 'non-existent-policy';
      const context: PolicyEvaluationContext = {
        timestamp: new Date(),
        entity_type: 'user',
        entity_id: 'user-123',
        entity_data: {},
        trigger_event: 'test',
        environment: {
          region: 'us-east-1',
          platform: 'web',
          version: '1.0.0'

        context_data: {}
      };

      jest.spyOn(policyService, 'getPolicy').mockResolvedValue(null as unknown as unknown as unknown as unknown as unknown);

      // Act & Assert
      await expect(policyService.evaluatePolicy(policyId, context))
        .rejects.toThrow('Policy not found: non-existent-policy');
    });
  });

  describe('Policy Builder', () => {
    it('should build a complete policy using the builder', () => {
      // Arrange & Act
      const policy = new PolicyBuilder()
        .setMetadata({
          id: 'builder-test-001',
          name: 'Builder Test Policy',
          description: 'Policy created using builder',
          type: 'enforcement',
          status: 'draft',
          version: '1.0.0',
          created_by: 'test-user',
          created_at: new Date(),
          updated_at: new Date(),
          effective_date: new Date(),
          tags: ['builder', 'test']

        .setScope({
          scope_type: 'user_type',
          scope_criteria: {
            user_types: ['creator', 'buyer']


        .addRule({
          id: 'builder-rule-001',
          name: 'Builder Rule',
          description: 'Rule added via builder',
          enabled: true,
          priority: 1,
          conditions: [{
            id: 'builder-condition',
            name: 'Builder Condition',
            field: 'test_field',
            operator: 'eq',
            value: 'test_value',
            data_type: 'string',
            required: true
],
          actions: [{
            id: 'builder-action',
            type: 'flag',
            name: 'Builder Action',
            severity: 'low',
            auto_execute: false,
            parameters: {}
],
          condition_logic: 'ALL',
          audit_settings: {
            log_evaluations: true,
            log_actions: true,
            include_context: true


        .setConfiguration({
          global_settings: {
            default_severity: 'low',
            auto_execution_enabled: false,
            audit_enabled: true,
            notification_enabled: false

          thresholds: {},
          timeouts: {
            evaluation_timeout: 3000,
            action_timeout: 5000,
            retry_timeout: 15000

          rate_limits: {
            evaluations_per_second: 50,
            actions_per_minute: 10,
            notifications_per_hour: 5

          feature_flags: {}

        .build();

      // Assert
      expect(policy.metadata.id).toBe('builder-test-001');
      expect(policy.metadata.name).toBe('Builder Test Policy');
      expect(policy.scope.scope_type).toBe('user_type');
      expect(policy.rules).toHaveLength(1);
      expect(policy.rules[0].id).toBe('builder-rule-001');
      expect(policy.configuration.global_settings.default_severity).toBe('low');
    });

    it('should create enforcement policy using static method', () => {
      // Arrange & Act
      const policy = PolicyBuilder
        .createEnforcementPolicy('Test Enforcement', 70)
        .build();

      // Assert
      expect(policy.metadata.name).toBe('Test Enforcement');
      expect(policy.metadata.type).toBe('enforcement');
      expect(policy.rules).toHaveLength(1);
      expect(policy.rules[0].conditions[0].value).toBe(70);
      expect(policy.rules[0].actions[0].type).toBe('restrict');
    });

    it('should throw error when building incomplete policy', () => {
      // Arrange
      const builder = new PolicyBuilder();

      // Act & Assert
      expect(() => builder.build())
        .toThrow('Policy must have metadata with id and name');
    });
  });

  describe('Policy Metrics', () => {
    it('should return policy metrics for time range', async () => {
      // Arrange
      const policyId = 'test-policy-001';
      const timeRange = {
        start: new Date('2023-01-01'),
        end: new Date('2023-01-31')
      };

      const mockMetricsData = {
        total_evaluations: '150',
        successful_evaluations: '140',
        failed_evaluations: '10',
        avg_execution_time: '25.5',
        max_execution_time: '100'
      };

      mockDatabase.query.mockResolvedValue({ rows: [mockMetricsData] } as unknown as unknown as unknown as unknown as unknown);

      // Act
      const result = await policyService.getPolicyMetrics(policyId, timeRange);

      // Assert
      expect(result.policy_id).toBe(policyId);
      expect(result.time_period).toEqual(timeRange);
      expect(result.evaluation_metrics.total_evaluations).toBe(150);
      expect(result.evaluation_metrics.successful_evaluations).toBe(140);
      expect(result.evaluation_metrics.failed_evaluations).toBe(10);
      expect(result.evaluation_metrics.average_execution_time).toBe(25.5);
      expect(result.evaluation_metrics.max_execution_time).toBe(100);
      
      expect(mockDatabase.query).toHaveBeenCalledWith(
        expect.stringContaining('FROM policy_evaluations'),
        [policyId, timeRange.start, timeRange.end]
      );
    });

    it('should handle empty metrics gracefully', async () => {
      // Arrange
      const policyId = 'empty-policy';
      const timeRange = {
        start: new Date('2023-01-01'),
        end: new Date('2023-01-31')
      };

      mockDatabase.query.mockResolvedValue({ 
        rows: [{
          total_evaluations: '0',
          successful_evaluations: '0',
          failed_evaluations: '0',
          avg_execution_time: null,
          max_execution_time: null
]
 as unknown as unknown as unknown as unknown as unknown);

      // Act
      const result = await policyService.getPolicyMetrics(policyId, timeRange);

      // Assert
      expect(result.evaluation_metrics.total_evaluations).toBe(0);
      expect(result.evaluation_metrics.average_execution_time).toBe(0);
      expect(result.evaluation_metrics.max_execution_time).toBe(0);
    });
  });

  describe('Condition Evaluation', () => {
    let policyService: unknown; // Access private methods for testing

    beforeEach(() => {
      policyService = new PolicyDataService(mockDatabase);
    });

    it('should evaluate equality condition correctly', () => {
      // Arrange
      const condition = {
        id: 'test-condition',
        name: 'Test Condition',
        field: 'entity_data.status',
        operator: 'eq' as const,
        value: 'active',
        data_type: 'string' as const,
        required: true
      };

      const context: PolicyEvaluationContext = {
        timestamp: new Date(),
        entity_type: 'user',
        entity_id: 'user-123',
        entity_data: { status: 'active' },
        trigger_event: 'test',
        environment: { region: 'us-east-1', platform: 'web', version: '1.0.0' },
        context_data: {}
      };

      // Act
      const result = policyService.evaluateCondition(condition, context);

      // Assert
      expect(result).toBe(true);
    });

    it('should evaluate numeric comparison conditions', () => {
      const testCases = [
        { operator: 'gt' as const, fieldValue: 75, conditionValue: 50, expected: true },
        { operator: 'gte' as const, fieldValue: 50, conditionValue: 50, expected: true },
        { operator: 'lt' as const, fieldValue: 25, conditionValue: 50, expected: true },
        { operator: 'lte' as const, fieldValue: 50, conditionValue: 50, expected: true },
        { operator: 'between' as const, fieldValue: 75, conditionValue: [50, 100], expected: true }
      ];

      testCases.forEach(({ operator, fieldValue, conditionValue, expected }) => {
        // Arrange
        const condition = {
          id: 'numeric-test',
          name: 'Numeric Test',
          field: 'entity_data.score',
          operator,
          value: conditionValue,
          data_type: 'number' as const,
          required: true
        };

        const context: PolicyEvaluationContext = {
          timestamp: new Date(),
          entity_type: 'user',
          entity_id: 'user-123',
          entity_data: { score: fieldValue },
          trigger_event: 'test',
          environment: { region: 'us-east-1', platform: 'web', version: '1.0.0' },
          context_data: {}
        };

        // Act
        const result = policyService.evaluateCondition(condition, context);

        // Assert
        expect(result).toBe(expected);
      });
    });

    it('should evaluate array conditions', () => {
      const testCases = [
        { operator: 'in' as const, fieldValue: 'admin', conditionValue: ['admin', 'moderator'], expected: true },
        { operator: 'not_in' as const, fieldValue: 'user', conditionValue: ['admin', 'moderator'], expected: true }
      ];

      testCases.forEach(({ operator, fieldValue, conditionValue, expected }) => {
        // Arrange
        const condition = {
          id: 'array-test',
          name: 'Array Test',
          field: 'entity_data.role',
          operator,
          value: conditionValue,
          data_type: 'string' as const,
          required: true
        };

        const context: PolicyEvaluationContext = {
          timestamp: new Date(),
          entity_type: 'user',
          entity_id: 'user-123',
          entity_data: { role: fieldValue },
          trigger_event: 'test',
          environment: { region: 'us-east-1', platform: 'web', version: '1.0.0' },
          context_data: {}
        };

        // Act
        const result = policyService.evaluateCondition(condition, context);

        // Assert
        expect(result).toBe(expected);
      });
    });

    it('should evaluate string pattern conditions', () => {
      const testCases = [
        { operator: 'contains' as const, fieldValue: 'hello world', conditionValue: 'world', expected: true },
        { operator: 'regex' as const, fieldValue: 'test@example.com', conditionValue: '^[^@]+@[^@]+\\.[^@]+$', expected: true }
      ];

      testCases.forEach(({ operator, fieldValue, conditionValue, expected }) => {
        // Arrange
        const condition = {
          id: 'string-test',
          name: 'String Test',
          field: 'entity_data.text',
          operator,
          value: conditionValue,
          data_type: 'string' as const,
          required: true
        };

        const context: PolicyEvaluationContext = {
          timestamp: new Date(),
          entity_type: 'user',
          entity_id: 'user-123',
          entity_data: { text: fieldValue },
          trigger_event: 'test',
          environment: { region: 'us-east-1', platform: 'web', version: '1.0.0' },
          context_data: {}
        };

        // Act
        const result = policyService.evaluateCondition(condition, context);

        // Assert
        expect(result).toBe(expected);
      });
    });

    it('should handle nested field paths', () => {
      // Arrange
      const condition = {
        id: 'nested-test',
        name: 'Nested Field Test',
        field: 'entity_data.profile.settings.notification',
        operator: 'eq' as const,
        value: true,
        data_type: 'boolean' as const,
        required: true
      };

      const context: PolicyEvaluationContext = {
        timestamp: new Date(),
        entity_type: 'user',
        entity_id: 'user-123',
        entity_data: {
          profile: {
            settings: {
              notification: true



        trigger_event: 'test',
        environment: { region: 'us-east-1', platform: 'web', version: '1.0.0' },
        context_data: {}
      };

      // Act
      const result = policyService.evaluateCondition(condition, context);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for undefined field values', () => {
      // Arrange
      const condition = {
        id: 'undefined-test',
        name: 'Undefined Test',
        field: 'entity_data.nonexistent',
        operator: 'eq' as const,
        value: 'anything',
        data_type: 'string' as const,
        required: true
      };

      const context: PolicyEvaluationContext = {
        timestamp: new Date(),
        entity_type: 'user',
        entity_id: 'user-123',
        entity_data: {},
        trigger_event: 'test',
        environment: { region: 'us-east-1', platform: 'web', version: '1.0.0' },
        context_data: {}
      };

      // Act
      const result = policyService.evaluateCondition(condition, context);

      // Assert
      expect(result).toBe(false);
    });
  });
});