/**
 * Test Data Generators - Centralized Export
 *
 * Provides a unified interface for all test data generation utilities
 * including graphs, authentication data, analytics data, and API payloads.
 *
 * Task: E18-1753114562159-0BC5A0
 */

// Core generators
export {
  default as AdvancedGraphGenerator,
  GraphBatchGenerator
} from './AdvancedGraphGenerator';
export { default as AuthenticationDataGenerator } from './AuthenticationDataGenerator';
export { default as AnalyticsDataGenerator } from './AnalyticsDataGenerator';
export { default as APIPayloadGenerator } from './APIPayloadGenerator';

// Legacy generator for compatibility
export { testDataGenerator } from '../utils/TestDataGenerator';

// Type exports
export type {
  GraphGenerationOptions,
  GraphScenario
} from './AdvancedGraphGenerator';

export type {
  UserRole,
  Permission,
  TestUser,
  SessionData,
  AuthenticationScenario
} from './AuthenticationDataGenerator';

export type {
  MetricData,
  EventData,
  PerformanceMetric,
  UserBehaviorData,
  TimeSeriesData,
  RuleUsageAnalytics
} from './AnalyticsDataGenerator';

export type {
  APITestPayload,
  AuthenticationPayload,
  GraphOperationPayload,
  RuleManagementPayload
} from './APIPayloadGenerator';

/**
 * Factory class for creating test data generators with consistent configuration
 */
export class TestDataGeneratorFactory {
  private static readonly DEFAULT_SEED = 12345;

  /**
   * Create a graph generator with optional seed
   */
  static createGraphGenerator(seed?: number) {
    return new AdvancedGraphGenerator(seed || this.DEFAULT_SEED);
  }

  /**
   * Create a batch graph generator for regression testing
   */
  static createBatchGraphGenerator(seed?: number) {
    return new GraphBatchGenerator(seed || this.DEFAULT_SEED);
  }

  /**
   * Create an authentication data generator
   */
  static createAuthGenerator(seed?: number) {
    return new AuthenticationDataGenerator(seed || this.DEFAULT_SEED);
  }

  /**
   * Create an analytics data generator
   */
  static createAnalyticsGenerator(seed?: number) {
    return new AnalyticsDataGenerator(seed || this.DEFAULT_SEED);
  }

  /**
   * Create an API payload generator
   */
  static createAPIPayloadGenerator(seed?: number) {
    return new APIPayloadGenerator(seed || this.DEFAULT_SEED);
  }

  /**
   * Create a complete test data generation suite
   */
  static createCompleteSuite(seed?: number) {
    const baseSeed = seed || this.DEFAULT_SEED;

    return {
      graphGenerator: new AdvancedGraphGenerator(baseSeed),
      batchGraphGenerator: new GraphBatchGenerator(baseSeed + 1),
      authGenerator: new AuthenticationDataGenerator(baseSeed + 2),
      analyticsGenerator: new AnalyticsDataGenerator(baseSeed + 3),
      apiPayloadGenerator: new APIPayloadGenerator(baseSeed + 4)
    };
  }

  /**
   * Generate a complete test dataset for integration testing
   */
  static generateIntegrationTestDataset(
    options: {
      userCount?: number;
      graphCount?: number;
      ruleCount?: number;
      days?: number;
      seed?: number;
    } = {}
  ) {
    const {
      userCount = 50,
      graphCount = 20,
      ruleCount = 100,
      days = 30,
      seed = this.DEFAULT_SEED
    } = options;

    const suite = this.createCompleteSuite(seed);

    // Generate comprehensive test data
    const users = suite.authGenerator.generateTestUsers(userCount);
    const sessions = suite.authGenerator.generateSessions(users);
    const authScenarios = suite.authGenerator.generateAuthenticationScenarios();

    const graphScenarios = [];
    for (let i = 0; i < graphCount; i++) {
      graphScenarios.push(
        suite.graphGenerator.generateComplexScenario({
          nodeCount: 5 + i * 2,
          complexity: [
            'simple',
            'validation',
            'performance',
            'security',
            'edge-case'
          ][i % 5] as any,
          seed: seed + i,
          includeAdvancedNodes: i > 10
        })
      );
    }

    const analyticsData = suite.analyticsGenerator.generateAnalyticsTestSuite({
      userCount,
      ruleCount,
      days
    });

    const apiPayloads = suite.apiPayloadGenerator.generateAPITestSuite();

    return {
      // Authentication data
      users,
      sessions,
      authScenarios,

      // Graph data
      graphScenarios,

      // Analytics data
      analyticsData,

      // API test data
      apiPayloads,

      // Metadata
      metadata: {
        generatedAt: new Date(),
        seed,
        userCount,
        graphCount,
        ruleCount,
        days,
        totalDataPoints: {
          users: users.length,
          sessions: sessions.length,
          authScenarios: authScenarios.length,
          graphScenarios: graphScenarios.length,
          systemMetrics: analyticsData.systemMetrics.length,
          userEvents: analyticsData.userEvents.length,
          performanceMetrics: analyticsData.performanceMetrics.length,
          apiTestCases: Object.values(apiPayloads).flat().length
        }
      }
    };
  }
}

/**
 * Utility functions for common test data generation patterns
 */
export class TestDataUtils {
  /**
   * Generate deterministic test IDs
   */
  static generateTestId(
    prefix: string,
    index: number,
    seed: number = 12345
  ): string {
    return `${prefix}-${seed}-${index.toString().padStart(6, '0')}`;
  }

  /**
   * Generate realistic timestamps within a date range
   */
  static generateTimestamps(
    count: number,
    startDate: Date,
    endDate: Date,
    seed: number = 12345
  ): Date[] {
    const rng = require('seedrandom')(seed.toString());
    const timeRange = endDate.getTime() - startDate.getTime();

    return Array.from({ length: count }, (_, i) => {
      const randomOffset = rng() * timeRange;
      return new Date(startDate.getTime() + randomOffset);
    }).sort((a, b) => a.getTime() - b.getTime());
  }

  /**
   * Generate test data file paths
   */
  static getTestDataPaths() {
    return {
      graphs: 'tests/data/graphs',
      analytics: 'tests/data/analytics',
      authentication: 'tests/data/auth',
      apiPayloads: 'tests/data/api',
      exports: 'tests/data/exports',
      snapshots: 'tests/data/snapshots'
    };
  }

  /**
   * Validate generated test data integrity
   */
  static validateTestData(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for required fields
    if (!data.metadata?.generatedAt) {
      errors.push('Missing generation metadata');
    }

    // Check data consistency
    if (data.users && data.sessions) {
      const userIds = new Set(data.users.map((u: any) => u.id));
      const sessionUserIds = data.sessions.map((s: any) => s.userId);
      const orphanedSessions = sessionUserIds.filter(
        (id: string) => !userIds.has(id)
      );

      if (orphanedSessions.length > 0) {
        errors.push(
          `Found ${orphanedSessions.length} sessions with invalid user IDs`
        );
      }
    }

    // Check graph data integrity
    if (data.graphScenarios) {
      data.graphScenarios.forEach((scenario: any, index: number) => {
        if (!scenario.graph?.nodes || !scenario.graph?.edges) {
          errors.push(`Graph scenario ${index} missing nodes or edges`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Default export for convenience
export default TestDataGeneratorFactory;
