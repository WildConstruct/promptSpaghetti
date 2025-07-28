/**
 * Rule Testing Environment Test Suite
 * 
 * Comprehensive tests for the RuleTestingEnvironment class
 */

import RuleTestingEnvironment, { TestEnvironmentConfig, ComplianceFramework } from '../services/RuleTestingEnvironment';

// Mock dependencies
jest.mock('../services/ComplianceRuleEngine', () => ({
  ComplianceRuleEngine: jest.fn<unknown[], unknown>().mockImplementation(() => ({
    detectConflicts: jest.fn<unknown[], unknown>().mockResolvedValue([] as unknown as unknown as unknown as unknown as unknown as unknown as unknown),
    resolveConflicts: jest.fn<unknown[], unknown>().mockResolvedValue([] as unknown as unknown as unknown as unknown as unknown as unknown as unknown),
    evaluateRules: jest.fn<unknown[], unknown>().mockResolvedValue([] as unknown as unknown as unknown as unknown as unknown as unknown as unknown)
  }))
}));

jest.mock('../services/RuleTestingFramework', () => ({
  RuleTestingFramework: jest.fn<unknown[], unknown>().mockImplementation(() => ({
    generateTests: jest.fn<unknown[], unknown>().mockResolvedValue([] as unknown as unknown as unknown as unknown as unknown as unknown as unknown),
    executeTestSuite: jest.fn<unknown[], unknown>().mockResolvedValue({} as unknown as unknown as unknown as unknown as unknown as unknown as unknown),
    generateReport: jest.fn<unknown[], unknown>().mockResolvedValue({
      id: 'test-report',
      testSuite: { id: 'test-suite', name: 'Test Suite' },
      summary: { total: 10, passed: 8, failed: 2, skipped: 0, duration: 1000 },
      results: [],
      metrics: { coverage: 80, performance: { avgExecutionTime: 100, rulesPerSecond: 10 } },
      recommendations: [],
      attachments: [],
      generated: new Date( as unknown as unknown).toISOString()
  }
  }))
}));

// Mock ValidationRulesEngine - create a simple mock since the real one might not exist

describe('RuleTestingEnvironment', () => {
  let testEnvironment: RuleTestingEnvironment;
  let mockConfig: TestEnvironmentConfig;

  beforeEach(() => {
    mockConfig = {
      name: 'Test Environment',
      description: 'Test configuration for unit tests',
      frameworks: ['GDPR', 'CCPA'] as ComplianceFramework[],
      testTypes: ['UNIT', 'INTEGRATION'] as any[],
      performance: {
        maxExecutionTime: 10000,
        maxRuleCount: 100,
        maxConcurrency: 5
  }
      data: {
        generateSyntheticData: true,
        datasetSize: 'small',
        includeEdgeCases: true
  }
      reporting: {
        enableRealTimeReporting: true,
        generateDetailedReports: true,
        exportResults: true
      }
    };

    testEnvironment = new RuleTestingEnvironment(mockConfig);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    test('should initialize with provided configuration', () => {
      expect(testEnvironment.getConfig()).toEqual(mockConfig);
    });

    test('should initialize metrics with zero values', () => {
      const metrics = testEnvironment.getMetrics();
      expect(metrics.totalTests).toBe(0);
      expect(metrics.passedTests).toBe(0);
      expect(metrics.failedTests).toBe(0);
      expect(metrics.skippedTests).toBe(0);
      expect(metrics.executionTime).toBe(0);
    });
  });

  describe('Environment Setup', () => {
    test('should setup environment successfully', async () => {
      const setup = await testEnvironment.setupEnvironment();
      
      expect(setup).toHaveProperty('databases');
      expect(setup).toHaveProperty('services');
      expect(setup).toHaveProperty('testData');
      
      // Verify expected setup completion
      expect(setup.databases.test).toBe(true);
      expect(setup.services.ruleEngine).toBe(true);
      expect(setup.services.validation).toBe(true);
      expect(setup.testData.syntheticData).toBe(true);
    });

    test('should handle setup errors gracefully', async () => {
      // Mock a setup failure
      const setupSpy = jest.spyOn(
        testEnvironment as any,
        'setupTestDatabases'
      ).mockRejectedValue(new Error('Database setup failed'));
      
      await expect(testEnvironment.setupEnvironment()).rejects.toThrow('Database setup failed');
      
      setupSpy.mockRestore();
    });

    test('should not allow test execution without setup', async () => {
      await expect(testEnvironment.executeTestSuite()).rejects.toThrow('Testing environment must be setup before executing tests');
    });
  });

  describe('Test Execution', () => {
    beforeEach(async () => {
      await testEnvironment.setupEnvironment();
    });

    afterEach(async () => {
      await testEnvironment.teardownEnvironment();
    });

    test('should execute comprehensive test suite', async () => {
      const reports = await testEnvironment.executeTestSuite();
      
      expect(Array.isArray(reports)).toBe(true);
      expect(reports.length).toBeGreaterThan(0);
      
      // Verify report structure
      reports.forEach(report => {
        expect(report).toHaveProperty('id');
        expect(report).toHaveProperty('testSuite');
        expect(report).toHaveProperty('summary');
        expect(report).toHaveProperty('results');
        expect(report).toHaveProperty('metrics');
        expect(report.summary).toHaveProperty('total');
        expect(report.summary).toHaveProperty('passed');
        expect(report.summary).toHaveProperty('failed');
        expect(report.summary).toHaveProperty('skipped');
      });
    });

    test('should test specific framework', async () => {
      const report = await testEnvironment.testFramework('GDPR');
      
      expect(report).toHaveProperty('id');
      expect(report).toHaveProperty('testSuite');
      expect(report.testSuite.name).toContain('GDPR');
    });

    test('should execute integration tests', async () => {
      const report = await testEnvironment.executeIntegrationTests();
      
      expect(report).toHaveProperty('id');
      expect(report.testSuite.name).toBe('Integration Testing Suite');
    });

    test('should execute performance benchmarks', async () => {
      const report = await testEnvironment.executePerformanceBenchmarks();
      
      expect(report).toHaveProperty('id');
      expect(report.testSuite.name).toBe('Performance Benchmark Suite');
      expect(report.results).toBeInstanceOf(Array);
      
      // Verify performance-specific properties
      report.results.forEach(result => {
        expect(result).toHaveProperty('duration');
        if (result.metrics) {
          expect(result.metrics).toHaveProperty('rulesPerSecond');
        }
      });
    });

    test('should test conflict resolution', async () => {
      const report = await testEnvironment.testConflictResolution();
      
      expect(report).toHaveProperty('id');
      expect(report.testSuite.name).toBe('Conflict Resolution Test Suite');
      
      // Verify conflict-specific test results
      report.results.forEach(result => {
        expect(result.id).toContain('conflict-');
        if (result.results && result.status === 'PASSED') {
          expect(result.results).toHaveProperty('detected');
          expect(result.results).toHaveProperty('resolved');
        }
      });
    });

    test('should update metrics after test execution', async () => {
      const initialMetrics = testEnvironment.getMetrics();
      expect(initialMetrics.totalTests).toBe(0);
      
      await testEnvironment.executeTestSuite();
      
      const updatedMetrics = testEnvironment.getMetrics();
      expect(updatedMetrics.totalTests).toBeGreaterThan(0);
      expect(updatedMetrics.executionTime).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      await testEnvironment.setupEnvironment();
    });

    afterEach(async () => {
      await testEnvironment.teardownEnvironment();
    });

    test('should handle framework testing errors', async () => {
      // Mock ComplianceRuleEngine to throw error
      const mockEngine = testEnvironment['complianceEngine'];
      jest.spyOn(mockEngine, 'detectConflicts').mockRejectedValue(new Error('Engine error'));
      
      await expect(testEnvironment.testFramework('GDPR')).rejects.toThrow();
    });

    test('should handle performance benchmark errors gracefully', async () => {
      // Mock a benchmark failure
      const benchmarkSpy = jest.spyOn(testEnvironment as any, 'executeBenchmark')
        .mockRejectedValue(new Error('Benchmark failed'));
      
      const report = await testEnvironment.executePerformanceBenchmarks();
      
      // Should still return a report with failed results
      expect(report).toHaveProperty('results');
      expect(report.results.some(r => r.status === 'FAILED')).toBe(true);
      
      benchmarkSpy.mockRestore();
    });
  });

  describe('Configuration Management', () => {
    test('should return immutable configuration copy', () => {
      const config1 = testEnvironment.getConfig();
      const config2 = testEnvironment.getConfig();
      
      expect(config1).toEqual(config2);
      expect(config1).not.toBe(config2); // Different objects
      
      // Modifying returned config should not affect internal state
      config1.name = 'Modified';
      const config3 = testEnvironment.getConfig();
      expect(config3.name).toBe('Test Environment');
    });

    test('should return immutable metrics copy', () => {
      const metrics1 = testEnvironment.getMetrics();
      const metrics2 = testEnvironment.getMetrics();
      
      expect(metrics1).toEqual(metrics2);
      expect(metrics1).not.toBe(metrics2); // Different objects
    });
  });

  describe('Environment Teardown', () => {
    test('should teardown environment successfully', async () => {
      await testEnvironment.setupEnvironment();
      
      // Verify environment is setup
      const initialMetrics = testEnvironment.getMetrics();
      
      await testEnvironment.teardownEnvironment();
      
      // Verify metrics are reset
      const finalMetrics = testEnvironment.getMetrics();
      expect(finalMetrics.totalTests).toBe(0);
      expect(finalMetrics.executionTime).toBe(0);
    });

    test('should handle teardown errors gracefully', async () => {
      await testEnvironment.setupEnvironment();
      
      // Mock teardown error
      const teardownSpy = jest.spyOn(testEnvironment as any, 'clearTestData')
        .mockRejectedValue(new Error('Cleanup failed'));
      
      await expect(testEnvironment.teardownEnvironment()).rejects.toThrow('Cleanup failed');
      
      teardownSpy.mockRestore();
    });

    test('should allow execution after teardown and re-setup', async () => {
      await testEnvironment.setupEnvironment();
      await testEnvironment.teardownEnvironment();
      await testEnvironment.setupEnvironment();
      
      // Should be able to execute tests again
      await expect(testEnvironment.executeTestSuite()).resolves.toBeDefined();
    });
  });

  describe('Data Generation', () => {
    test('should respect data generation configuration', async () => {
      const configWithoutData = {
        ...mockConfig,
        data: {
          generateSyntheticData: false,
          datasetSize: 'small' as const,
          includeEdgeCases: false
        }
      };
      
      const envWithoutData = new RuleTestingEnvironment(configWithoutData);
      const setup = await envWithoutData.setupEnvironment();
      
      expect(setup.testData.syntheticData).toBe(false);
      expect(setup.testData.edgeCases).toBe(false);
      expect(setup.testData.performanceData).toBe(true); // Always generated
      
      await envWithoutData.teardownEnvironment();
    });
  });

  describe('Framework Coverage', () => {
    test('should test all configured frameworks', async () => {
      const multiFrameworkConfig = {
        ...mockConfig,
        frameworks: ['GDPR', 'CCPA', 'HIPAA', 'SOX'] as ComplianceFramework[]
      };
      
      const multiFrameworkEnv = new RuleTestingEnvironment(multiFrameworkConfig);
      await multiFrameworkEnv.setupEnvironment();
      
      const reports = await multiFrameworkEnv.executeTestSuite();
      
      // Should have reports for all frameworks plus integration and performance
      expect(reports.length).toBeGreaterThanOrEqual(4); // 4 frameworks + integration + performance + conflicts
      
      await multiFrameworkEnv.teardownEnvironment();
    });
  });

  describe('Performance Constraints', () => {
    test('should respect performance configuration limits', () => {
      const config = testEnvironment.getConfig();
      
      expect(config.performance.maxExecutionTime).toBe(10000);
      expect(config.performance.maxRuleCount).toBe(100);
      expect(config.performance.maxConcurrency).toBe(5);
    });

    test('should handle large rule counts appropriately', async () => {
      const highPerformanceConfig = {
        ...mockConfig,
        performance: {
          maxExecutionTime: 60000,
          maxRuleCount: 10000,
          maxConcurrency: 20
        }
      };
      
      const highPerfEnv = new RuleTestingEnvironment(highPerformanceConfig);
      await highPerfEnv.setupEnvironment();
      
      // Should not throw error with high performance requirements
      await expect(highPerfEnv.executePerformanceBenchmarks()).resolves.toBeDefined();
      
      await highPerfEnv.teardownEnvironment();
    });
  });

  describe('Reporting Features', () => {
    beforeEach(async () => {
      await testEnvironment.setupEnvironment();
    });

    afterEach(async () => {
      await testEnvironment.teardownEnvironment();
    });

    test('should generate comprehensive test reports', async () => {
      const reports = await testEnvironment.executeTestSuite();
      
      reports.forEach(report => {
        expect(report).toHaveProperty('id');
        expect(report).toHaveProperty('testSuite');
        expect(report).toHaveProperty('summary');
        expect(report).toHaveProperty('results');
        expect(report).toHaveProperty('metrics');
        expect(report).toHaveProperty('generated');
        
        // Verify summary structure
        expect(report.summary).toHaveProperty('total');
        expect(report.summary).toHaveProperty('passed');
        expect(report.summary).toHaveProperty('failed');
        expect(report.summary).toHaveProperty('skipped');
        expect(report.summary).toHaveProperty('duration');
        
        // Verify metrics structure
        expect(report.metrics).toHaveProperty('coverage');
        expect(report.metrics).toHaveProperty('performance');
      });
    });

    test('should include recommendations in performance reports', async () => {
      const report = await testEnvironment.executePerformanceBenchmarks();
      
      expect(report).toHaveProperty('recommendations');
      expect(Array.isArray(report.recommendations)).toBe(true);
    });
  });
});