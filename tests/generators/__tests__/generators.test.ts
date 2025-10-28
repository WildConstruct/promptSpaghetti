/**
 * Test Data Generators Test Suite
 *
 * Comprehensive tests for all test data generators to ensure they produce
 * valid, consistent, and deterministic test data.
 *
 * Task: E18-1753114562159-0BC5A0
 */

import AdvancedGraphGenerator, {
  GraphBatchGenerator
} from '../AdvancedGraphGenerator';
import AuthenticationDataGenerator from '../AuthenticationDataGenerator';
import AnalyticsDataGenerator from '../AnalyticsDataGenerator';
import APIPayloadGenerator from '../APIPayloadGenerator';
import { TestDataGeneratorFactory, TestDataUtils } from '../index';

describe('Test Data Generators', () => {
  describe('AdvancedGraphGenerator', () => {
    let generator: AdvancedGraphGenerator;

    beforeEach(() => {
      generator = new AdvancedGraphGenerator(12345);
    });

    it('should generate deterministic graphs with same seed', () => {
      const graph1 = generator.generateComplexScenario({
        nodeCount: 5,
        complexity: 'simple',
        seed: 123
      });

      const generator2 = new AdvancedGraphGenerator(12345);
      const graph2 = generator2.generateComplexScenario({
        nodeCount: 5,
        complexity: 'simple',
        seed: 123
      });

      expect(graph1.graph.nodes).toHaveLength(graph2.graph.nodes.length);
      expect(graph1.graph.edges).toHaveLength(graph2.graph.edges.length);
      expect(graph1.name).toBe(graph2.name);
    });

    it('should generate simple scenarios correctly', () => {
      const scenario = generator.generateComplexScenario({
        nodeCount: 5,
        complexity: 'simple'
      });

      expect(scenario.expectedBehavior).toBe('success');
      expect(scenario.graph.nodes).toHaveLength(5);
      expect(scenario.performanceThresholds).toBeDefined();
      expect(scenario.performanceThresholds!.maxExecutionTimeMs).toBeLessThan(
        200
      );
    });

    it('should generate validation scenarios with errors', () => {
      const scenario = generator.generateComplexScenario({
        nodeCount: 3,
        complexity: 'validation'
      });

      expect(scenario.expectedBehavior).toBe('error');
      expect(
        [
          'self-loop',
          'disconnected',
          'circular-dependency',
          'missing-input',
          'duplicate-edges'
        ].some(type => scenario.name.includes(type))
      ).toBe(true);
    });

    it('should generate performance scenarios with large node counts', () => {
      const scenario = generator.generateComplexScenario({
        nodeCount: 100,
        complexity: 'performance',
        includeAdvancedNodes: true
      });

      expect(scenario.expectedBehavior).toBe('performance');
      expect(scenario.graph.nodes.length).toBeGreaterThanOrEqual(100);
      expect(
        scenario.performanceThresholds!.maxExecutionTimeMs
      ).toBeGreaterThan(500);
    });

    it('should generate security scenarios with malicious patterns', () => {
      const scenario = generator.generateComplexScenario({
        nodeCount: 5,
        complexity: 'security'
      });

      expect(scenario.expectedBehavior).toBe('error');
      expect(
        [
          'malicious-expression',
          'prototype-pollution',
          'code-injection',
          'resource-exhaustion'
        ].some(type => scenario.name.includes(type))
      ).toBe(true);
    });

    it('should generate edge case scenarios', () => {
      const scenario = generator.generateComplexScenario({
        nodeCount: 1,
        complexity: 'edge-case',
        maxDepth: 50
      });

      expect(
        [
          'empty',
          'single-node',
          'large-weights',
          'zero-weights',
          'deep-nesting'
        ].some(type => scenario.name.includes(type))
      ).toBe(true);
    });

    it('should generate comprehensive test suite', () => {
      const testSuite = generator.generateTestSuite();

      expect(testSuite).toHaveLength(7);
      expect(
        testSuite.some(scenario => scenario.expectedBehavior === 'success')
      ).toBe(true);
      expect(
        testSuite.some(scenario => scenario.expectedBehavior === 'performance')
      ).toBe(true);
      expect(
        testSuite.some(scenario => scenario.expectedBehavior === 'error')
      ).toBe(true);
    });
  });

  describe('GraphBatchGenerator', () => {
    let batchGenerator: GraphBatchGenerator;

    beforeEach(() => {
      batchGenerator = new GraphBatchGenerator(12345);
    });

    it('should generate regression matrix with multiple scenarios', () => {
      const scenarios = batchGenerator.generateRegressionMatrix();

      expect(scenarios.length).toBeGreaterThan(30); // 7 node counts × 5 complexities

      // Verify we have different complexities
      const complexities = scenarios.map(s => s.name.split('-')[1]);
      expect(new Set(complexities).size).toBeGreaterThan(1);
    });

    it('should generate performance benchmarks', () => {
      const benchmarks = batchGenerator.generatePerformanceBenchmarks();

      expect(benchmarks).toHaveLength(5);
      expect(benchmarks.some(b => b.graph.nodes.length >= 1000)).toBe(true);
      expect(benchmarks.some(b => b.expectedBehavior === 'performance')).toBe(
        true
      );
    });

    it('should generate security test matrix', () => {
      const securityTests = batchGenerator.generateSecurityTestMatrix();

      expect(securityTests).toHaveLength(10);
      expect(
        securityTests.every(test => test.expectedBehavior === 'error')
      ).toBe(true);
    });
  });

  describe('AuthenticationDataGenerator', () => {
    let authGenerator: AuthenticationDataGenerator;

    beforeEach(() => {
      authGenerator = new AuthenticationDataGenerator(12345);
    });

    it('should generate standard roles with correct hierarchy', () => {
      const roles = authGenerator.generateStandardRoles();

      expect(roles).toHaveLength(5);
      expect(roles.find(r => r.id === 'admin')?.hierarchy).toBe(100);
      expect(roles.find(r => r.id === 'guest')?.hierarchy).toBe(0);

      // Verify permissions inheritance
      const adminRole = roles.find(r => r.id === 'admin');
      const viewerRole = roles.find(r => r.id === 'viewer');
      expect(adminRole?.permissions.length).toBeGreaterThan(
        viewerRole?.permissions.length || 0
      );
    });

    it('should generate comprehensive permissions', () => {
      const permissions = authGenerator.generatePermissions();

      expect(permissions.length).toBeGreaterThan(40); // Multiple resources × actions
      expect(permissions.some(p => p.id.includes('*'))).toBe(true); // Wildcard permissions
      expect(permissions.some(p => p.conditions !== undefined)).toBe(true); // Conditional permissions
    });

    it('should generate test users with realistic distribution', () => {
      const users = authGenerator.generateTestUsers(100);

      expect(users).toHaveLength(100);

      // Check distribution (most should be active, verified, etc.)
      const activeUsers = users.filter(u => u.isActive);
      const verifiedUsers = users.filter(u => u.isVerified);
      const mfaUsers = users.filter(u => u.mfaEnabled);

      expect(activeUsers.length).toBeGreaterThan(80); // ~90% active
      expect(verifiedUsers.length).toBeGreaterThan(70); // ~80% verified
      expect(mfaUsers.length).toBeGreaterThan(30); // ~40% MFA
    });

    it('should generate sessions for active users', () => {
      const users = authGenerator.generateTestUsers(20);
      const sessions = authGenerator.generateSessions(users);

      expect(sessions.length).toBeGreaterThan(0);

      // All sessions should have valid user IDs
      const userIds = new Set(users.map(u => u.id));
      expect(sessions.every(s => userIds.has(s.userId))).toBe(true);

      // Sessions should have valid tokens and timestamps
      expect(sessions.every(s => s.accessToken.startsWith('acc_'))).toBe(true);
      expect(sessions.every(s => s.refreshToken.startsWith('ref_'))).toBe(true);
      expect(sessions.every(s => s.expiresAt > s.createdAt)).toBe(true);
    });

    it('should generate authentication scenarios', () => {
      const scenarios = authGenerator.generateAuthenticationScenarios();

      expect(scenarios.length).toBeGreaterThan(5);

      // Verify different scenario types
      expect(scenarios.some(s => s.expectedBehavior === 'success')).toBe(true);
      expect(scenarios.some(s => s.expectedBehavior === 'failure')).toBe(true);
      expect(scenarios.some(s => s.expectedBehavior === 'conditional')).toBe(
        true
      );

      // Verify test actions are defined
      expect(scenarios.every(s => s.testActions.length > 0)).toBe(true);
    });

    it('should generate edge case scenarios', () => {
      const edgeCases = authGenerator.generateEdgeCaseScenarios();

      expect(edgeCases.length).toBeGreaterThan(2);
      expect(edgeCases.some(e => e.name.includes('expired'))).toBe(true);
      expect(edgeCases.some(e => e.name.includes('malformed'))).toBe(true);
    });
  });

  describe('AnalyticsDataGenerator', () => {
    let analyticsGenerator: AnalyticsDataGenerator;

    beforeEach(() => {
      analyticsGenerator = new AnalyticsDataGenerator(12345);
    });

    it('should generate system metrics for specified days', () => {
      const metrics = analyticsGenerator.generateSystemMetrics(7);

      expect(metrics.length).toBeGreaterThan(1000); // 7 days × 24 hours × multiple metrics

      // Verify metric structure
      expect(
        metrics.every(m => m.id && m.name && typeof m.value === 'number')
      ).toBe(true);
      expect(metrics.every(m => m.timestamp instanceof Date)).toBe(true);
      expect(metrics.every(m => m.tags && m.tags.component)).toBe(true);
    });

    it('should generate user events with proper structure', () => {
      const users = ['user1', 'user2', 'user3'];
      const events = analyticsGenerator.generateUserEvents(users, 3);

      expect(events.length).toBeGreaterThan(30); // 3 users × 3 days × ~5-30 events

      // Verify events are sorted by timestamp
      const timestamps = events.map(e => e.timestamp.getTime());
      expect(timestamps).toEqual([...timestamps].sort((a, b) => a - b));

      // Verify event structure
      expect(events.every(e => e.id && e.type && e.category && e.action)).toBe(
        true
      );
      expect(events.every(e => users.includes(e.userId!))).toBe(true);
    });

    it('should generate performance metrics', () => {
      const metrics = analyticsGenerator.generatePerformanceMetrics(2);

      expect(metrics.length).toBeGreaterThan(1000); // 2 days × 96 intervals × multiple components

      // Verify metric types
      const metricTypes = new Set(metrics.map(m => m.metricType));
      expect(metricTypes.has('execution_time')).toBe(true);
      expect(metricTypes.has('memory_usage')).toBe(true);
      expect(metricTypes.has('throughput')).toBe(true);

      // Verify units are appropriate
      const executionTimeMetrics = metrics.filter(
        m => m.metricType === 'execution_time'
      );
      expect(executionTimeMetrics.every(m => m.unit === 'ms')).toBe(true);
    });

    it('should generate user behavior data', () => {
      const users = ['user1', 'user2'];
      const behaviorData = analyticsGenerator.generateUserBehavior(users, 5);

      expect(behaviorData.length).toBeGreaterThan(0);

      // Verify session structure
      expect(
        behaviorData.every(b => b.userId && b.sessionId && b.actions.length > 0)
      ).toBe(true);
      expect(behaviorData.every(b => b.sessionStart instanceof Date)).toBe(
        true
      );
      expect(behaviorData.every(b => b.deviceInfo && b.geolocation)).toBe(true);

      // Verify actions are sorted by timestamp
      behaviorData.forEach(session => {
        const actionTimestamps = session.actions.map(a =>
          a.timestamp.getTime()
        );
        expect(actionTimestamps).toEqual(
          [...actionTimestamps].sort((a, b) => a - b)
        );
      });
    });

    it('should generate time series data', () => {
      const timeSeries = analyticsGenerator.generateTimeSeriesData(
        'cpu_usage',
        30
      );

      expect(timeSeries.metric).toBe('cpu_usage');
      expect(timeSeries.dataPoints.length).toBeGreaterThan(0);
      expect(
        ['sum', 'avg', 'min', 'max', 'count'].includes(timeSeries.aggregation)
      ).toBe(true);
      expect(
        ['minute', 'hour', 'day', 'week', 'month'].includes(timeSeries.interval)
      ).toBe(true);

      // Verify data points are sorted by timestamp
      const timestamps = timeSeries.dataPoints.map(dp =>
        dp.timestamp.getTime()
      );
      expect(timestamps).toEqual([...timestamps].sort((a, b) => a - b));
    });

    it('should generate rule usage analytics', () => {
      const ruleIds = ['rule1', 'rule2', 'rule3'];
      const analytics = analyticsGenerator.generateRuleUsageAnalytics(
        ruleIds,
        14
      );

      expect(analytics).toHaveLength(3);

      // Verify analytics structure
      expect(analytics.every(a => a.ruleId && a.ruleName)).toBe(true);
      expect(
        analytics.every(a => a.successRate >= 0 && a.successRate <= 1)
      ).toBe(true);
      expect(analytics.every(a => a.trendData.length === 14)).toBe(true); // 14 days
      expect(analytics.every(a => a.userRatings.length > 0)).toBe(true);
    });

    it('should generate comprehensive analytics test suite', () => {
      const suite = analyticsGenerator.generateAnalyticsTestSuite({
        userCount: 10,
        ruleCount: 5,
        days: 7
      });

      expect(suite.systemMetrics.length).toBeGreaterThan(0);
      expect(suite.userEvents.length).toBeGreaterThan(0);
      expect(suite.performanceMetrics.length).toBeGreaterThan(0);
      expect(suite.userBehavior.length).toBeGreaterThan(0);
      expect(suite.timeSeriesData).toHaveLength(7); // 7 different metrics
      expect(suite.ruleAnalytics).toHaveLength(5); // 5 rules
    });
  });

  describe('APIPayloadGenerator', () => {
    let apiGenerator: APIPayloadGenerator;

    beforeEach(() => {
      apiGenerator = new APIPayloadGenerator(12345);
    });

    it('should generate valid API payloads', () => {
      const payloads = apiGenerator.generateValidPayloads();

      expect(payloads.length).toBeGreaterThan(3);
      expect(payloads.every(p => p.testCategory === 'valid')).toBe(true);
      expect(payloads.every(p => p.expectedBehavior === 'success')).toBe(true);
      expect(
        payloads.every(p => p.expectedStatus >= 200 && p.expectedStatus < 300)
      ).toBe(true);
    });

    it('should generate invalid API payloads', () => {
      const payloads = apiGenerator.generateInvalidPayloads();

      expect(payloads.length).toBeGreaterThan(3);
      expect(payloads.every(p => p.testCategory === 'invalid')).toBe(true);
      expect(payloads.every(p => p.expectedBehavior === 'error')).toBe(true);
      expect(payloads.every(p => p.expectedStatus >= 400)).toBe(true);
    });

    it('should generate security test payloads', () => {
      const payloads = apiGenerator.generateSecurityPayloads();

      expect(payloads.length).toBeGreaterThan(3);
      expect(payloads.every(p => p.testCategory === 'security')).toBe(true);
      expect(payloads.every(p => p.expectedBehavior === 'error')).toBe(true);

      // Verify security patterns
      const payloadBodies = payloads.map(p => JSON.stringify(p.body));
      expect(payloadBodies.some(body => body.includes('DROP TABLE'))).toBe(
        true
      ); // SQL injection
      expect(payloadBodies.some(body => body.includes('<script>'))).toBe(true); // XSS
    });

    it('should generate performance test payloads', () => {
      const payloads = apiGenerator.generatePerformancePayloads();

      expect(payloads.length).toBeGreaterThan(2);
      expect(payloads.every(p => p.testCategory === 'performance')).toBe(true);
      expect(payloads.some(p => p.timeout && p.timeout > 10000)).toBe(true); // Long timeouts
    });

    it('should generate edge case payloads', () => {
      const payloads = apiGenerator.generateEdgeCasePayloads();

      expect(payloads.length).toBeGreaterThan(3);
      expect(payloads.every(p => p.testCategory === 'edge_case')).toBe(true);

      // Verify edge cases
      expect(payloads.some(p => p.name.includes('empty'))).toBe(true);
      expect(payloads.some(p => p.name.includes('unicode'))).toBe(true);
      expect(payloads.some(p => p.name.includes('max'))).toBe(true);
    });

    it('should generate authentication payloads', () => {
      const payloads = apiGenerator.generateAuthenticationPayloads();

      expect(payloads.length).toBeGreaterThan(5);

      // Verify different auth types
      const types = new Set(payloads.map(p => p.type));
      expect(types.has('login')).toBe(true);
      expect(types.has('register')).toBe(true);
      expect(types.has('refresh')).toBe(true);

      // Verify different outcomes
      const outcomes = new Set(payloads.map(p => p.expectedOutcome));
      expect(outcomes.has('success')).toBe(true);
      expect(outcomes.has('failure')).toBe(true);
    });

    it('should generate comprehensive API test suite', () => {
      const suite = apiGenerator.generateAPITestSuite();

      expect(suite.validPayloads.length).toBeGreaterThan(0);
      expect(suite.invalidPayloads.length).toBeGreaterThan(0);
      expect(suite.securityPayloads.length).toBeGreaterThan(0);
      expect(suite.performancePayloads.length).toBeGreaterThan(0);
      expect(suite.edgeCasePayloads.length).toBeGreaterThan(0);
      expect(suite.authenticationPayloads.length).toBeGreaterThan(0);
    });
  });

  describe('TestDataGeneratorFactory', () => {
    it('should create generators with consistent seed', () => {
      const suite1 = TestDataGeneratorFactory.createCompleteSuite(12345);
      const suite2 = TestDataGeneratorFactory.createCompleteSuite(12345);

      // Test deterministic behavior
      const graph1 = suite1.graphGenerator.generateComplexScenario({
        nodeCount: 5,
        complexity: 'simple',
        seed: 123
      });

      const graph2 = suite2.graphGenerator.generateComplexScenario({
        nodeCount: 5,
        complexity: 'simple',
        seed: 123
      });

      expect(graph1.graph.nodes.length).toBe(graph2.graph.nodes.length);
    });

    it('should generate comprehensive integration test dataset', () => {
      const dataset = TestDataGeneratorFactory.generateIntegrationTestDataset({
        userCount: 10,
        graphCount: 5,
        ruleCount: 20,
        days: 7,
        seed: 12345
      });

      expect(dataset.users).toHaveLength(10);
      expect(dataset.graphScenarios).toHaveLength(5);
      expect(dataset.analyticsData.ruleAnalytics).toHaveLength(20);
      expect(dataset.metadata.totalDataPoints.users).toBe(10);

      // Verify data consistency
      const userIds = new Set(dataset.users.map(u => u.id));
      const sessionUserIds = dataset.sessions.map(s => s.userId);
      expect(sessionUserIds.every(id => userIds.has(id))).toBe(true);
    });
  });

  describe('TestDataUtils', () => {
    it('should generate deterministic test IDs', () => {
      const id1 = TestDataUtils.generateTestId('test', 1, 12345);
      const id2 = TestDataUtils.generateTestId('test', 1, 12345);
      const id3 = TestDataUtils.generateTestId('test', 2, 12345);

      expect(id1).toBe(id2); // Same parameters = same ID
      expect(id1).not.toBe(id3); // Different index = different ID
      expect(id1).toMatch(/^test-12345-000001$/);
    });

    it('should generate sorted timestamps within range', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      const timestamps = TestDataUtils.generateTimestamps(
        10,
        startDate,
        endDate,
        12345
      );

      expect(timestamps).toHaveLength(10);
      expect(timestamps.every(ts => ts >= startDate && ts <= endDate)).toBe(
        true
      );

      // Verify sorting
      const timestampMs = timestamps.map(ts => ts.getTime());
      expect(timestampMs).toEqual([...timestampMs].sort((a, b) => a - b));
    });

    it('should validate test data integrity', () => {
      const validData = {
        metadata: { generatedAt: new Date() },
        users: [{ id: 'user1' }, { id: 'user2' }],
        sessions: [{ userId: 'user1' }, { userId: 'user2' }],
        graphScenarios: [{ graph: { nodes: [], edges: [] } }]
      };

      const result = TestDataUtils.validateTestData(validData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);

      // Test invalid data
      const invalidData = {
        users: [{ id: 'user1' }],
        sessions: [{ userId: 'nonexistent' }],
        graphScenarios: [{ graph: {} }] // Missing nodes/edges
      };

      const invalidResult = TestDataUtils.validateTestData(invalidData);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors.length).toBeGreaterThan(0);
    });
  });
});
