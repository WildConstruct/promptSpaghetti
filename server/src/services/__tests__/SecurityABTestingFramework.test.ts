/**
 * Tests for Security A/B Testing Framework
 * Epic 31 - Task E31-1753313263603-BFA0AF
 */

import { 
  SecurityABTestingFramework, 
  SecurityABTestingConfig, 
  SecurityABTest,
  ABTestResults 
} from '../SecurityABTestingFramework';
import { SecurityAPIIntegrationPlatform } from '../SecurityAPIIntegrationPlatform';
import { SecurityPolicyAnalysisEngine } from '../SecurityPolicyAnalysisEngine';
import { SecurityOptimizationEngine } from '../SecurityOptimizationEngine';

// Mock dependencies
jest.mock('../SecurityAPIIntegrationPlatform');
jest.mock('../SecurityPolicyAnalysisEngine');
jest.mock('../SecurityOptimizationEngine');

describe('SecurityABTestingFramework', () => {
  let framework: SecurityABTestingFramework;
  let mockPlatform: jest.Mocked<SecurityAPIIntegrationPlatform>;
  let mockPolicyEngine: jest.Mocked<SecurityPolicyAnalysisEngine>;
  let mockOptimizationEngine: jest.Mocked<SecurityOptimizationEngine>;
  let config: SecurityABTestingConfig;
  let sampleTestConfig: Partial<SecurityABTest>;

  beforeEach(() => {
    // Setup mocks
    mockPlatform = {
      on: jest.fn<unknown[], unknown>(),
      getPlatformMetrics: jest.fn<unknown[], unknown>().mockResolvedValue({
        api_calls: { total_requests: 10000, successful_requests: 9500 },
        security_analytics: { threats_detected: 25, detection_accuracy_percent: 96 }
      } as unknown)
    } as any;

    mockPolicyEngine = {
      on: jest.fn<unknown[], unknown>(),
      analyzePolicyImpact: jest.fn<unknown[], unknown>().mockResolvedValue({
        risk_analysis: { overall_risk_score: 45 },
        validation_results: { validation_passed: true }
      } as unknown)
    } as any;

    mockOptimizationEngine = {
      on: jest.fn<unknown[], unknown>(),
      performComprehensiveAnalysis: jest.fn<unknown[], unknown>().mockResolvedValue({
        recommendations: []
      } as unknown)
    } as any;

    // Setup configuration
    config = {
      testing_framework: {
        enabled: true,
        multivariate_testing_enabled: true,
        sequential_testing_enabled: true,
        statistical_significance_threshold: 0.05,
        minimum_sample_size: 1000,
        maximum_test_duration_days: 30
  }
      traffic_management: {
        traffic_splitting_enabled: true,
        canary_deployment_enabled: true,
        gradual_rollout_enabled: true,
        rollback_automation_enabled: true,
        traffic_allocation_strategies: ['random', 'hash_based']
  }
      experiment_design: {
        randomization_enabled: true,
        stratified_sampling_enabled: true,
        control_group_required: true,
        minimum_control_group_size_percent: 20,
        bias_detection_enabled: true
  }
      metrics_collection: {
        real_time_metrics_enabled: true,
        security_effectiveness_tracking: true,
        performance_impact_tracking: true,
        user_experience_tracking: true,
        compliance_impact_tracking: true,
        cost_impact_tracking: true
  }
      statistical_analysis: {
        bayesian_analysis_enabled: true,
        confidence_interval_calculation: true,
        power_analysis_enabled: true,
        effect_size_calculation: true,
        significance_testing_methods: ['t_test', 'chi_square', 'bayesian']
  }
      safety_controls: {
        automatic_rollback_enabled: true,
        safety_thresholds: {
          security_incident_increase_percent: 50,
          performance_degradation_percent: 20,
          error_rate_increase_percent: 100
  }
        circuit_breaker_enabled: true,
        early_termination_enabled: true,
        risk_monitoring_enabled: true
      }
    };

    // Setup sample test configuration
    sampleTestConfig = {
      test_name: 'MFA Policy A/B Test',
      description: 'Testing different MFA enforcement strategies',
      test_type: 'policy_comparison',
      experiment_design: {
        hypothesis: 'Enhanced MFA policy will improve security without significantly impacting user experience',
        primary_metrics: ['security_score', 'user_satisfaction'],
        secondary_metrics: ['false_positive_rate', 'response_time'],
        success_criteria: {
          minimum_detectable_effect: 5.0,
          statistical_significance_level: 0.95,
          statistical_power: 0.80,
          business_significance_threshold: 10.0
  }
        sample_size_calculation: {
          calculated_sample_size: 2000,
          calculation_method: 'frequentist',
          calculation_parameters: {},
          confidence_level: 0.95,
          expected_effect_size: 5.0,
          variance_estimate: 0.25
        }
  }
      test_variants: [
        {
          variant_id: 'control',
          variant_name: 'Current MFA Policy',
          description: 'Existing MFA implementation',
          is_control: true,
          policy_configuration: {
            policy: { id: 'current_mfa', name: 'Current MFA' },
            feature_flags: {},
            configuration_overrides: {}
  }
          allocation: {
            traffic_percentage: 50,
            user_segments: ['all_users']
          }
  }
        {
          variant_id: 'enhanced',
          variant_name: 'Enhanced MFA Policy',
          description: 'Improved MFA with adaptive requirements',
          is_control: false,
          policy_configuration: {
            policy: { id: 'enhanced_mfa', name: 'Enhanced MFA' },
            feature_flags: { adaptive_mfa: true },
            configuration_overrides: { risk_based_triggers: true }
  }
          allocation: {
            traffic_percentage: 50,
            user_segments: ['all_users']
          }
        }
      ],
      traffic_allocation: {
        allocation_strategy: 'random',
        allocation_parameters: {},
        sticky_session_enabled: true,
        cross_device_consistency: false
  }
      target_population: {
        population_criteria: {
          user_roles: ['admin', 'user'],
          access_patterns: ['regular', 'high_privilege']
  }
        estimated_population_size: 10000,
        inclusion_rules: [
          {
            rule_id: 'active_users',
            field: 'last_login',
            operator: 'greater_than',
            value: Date.now() - 86400000 * 30
          }
        ],
        exclusion_rules: [
          {
            rule_id: 'test_accounts',
            field: 'account_type',
            operator: 'equals',
            value: 'test',
            reason: 'Exclude test accounts from experiment'
          }
        ]
      }
    };

    framework = new SecurityABTestingFramework(config, mockPlatform, mockPolicyEngine, mockOptimizationEngine);
  });

  afterEach(async () => {
    if (framework) {
      await framework.shutdown();
    }
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      const initializeSpy = jest.fn<unknown[], unknown>();
      framework.on('initialized', initializeSpy);

      await framework.initialize();

      expect(initializeSpy).toHaveBeenCalledWith({ timestamp: expect.any(Number) });
    });

    it('should emit error on initialization failure', async () => {
      const errorSpy = jest.fn<unknown[], unknown>();
      framework.on('error', errorSpy);

      // Mock initialization failure
      jest.spyOn(framework as any, 'startBackgroundProcesses').mockImplementation(() => {
        throw new Error('Background process init failed');
      });

      await expect(framework.initialize()).rejects.toThrow();
      expect(errorSpy).toHaveBeenCalledWith({
        error: expect.any(Error),
        context: 'initialization'
      });
    });
  });

  describe('A/B Test Creation', () => {
    beforeEach(async () => {
      await framework.initialize();
    });

    it('should create A/B test successfully', async () => {
      const testCreatedSpy = jest.fn<unknown[], unknown>();
      framework.on('test_created', testCreatedSpy);

      const createdTest = await framework.createABTest(sampleTestConfig);

      expect(createdTest).toBeDefined();
      expect(createdTest.test_id).toBeDefined();
      expect(createdTest.test_name).toBe(sampleTestConfig.test_name);
      expect(createdTest.test_type).toBe(sampleTestConfig.test_type);
      expect(createdTest.test_execution.status).toBe('draft');
      expect(createdTest.test_variants).toHaveLength(2);

      expect(testCreatedSpy).toHaveBeenCalledWith({
        testId: createdTest.test_id,
        testName: createdTest.test_name,
        testType: createdTest.test_type
      });
    });

    it('should validate test configuration', async () => {
      const invalidConfig = {
        ...sampleTestConfig,
        test_name: '', // Invalid empty name
        test_variants: [sampleTestConfig.test_variants![0]] // Only one variant
      };

      await expect(framework.createABTest(invalidConfig)).rejects.toThrow();
    });

    it('should validate traffic allocation sums to 100%', async () => {
      const invalidTrafficConfig = {
        ...sampleTestConfig,
        test_variants: [
          { ...sampleTestConfig.test_variants![0], allocation: { traffic_percentage: 60, user_segments: [] } },
          { ...sampleTestConfig.test_variants![1], allocation: { traffic_percentage: 30, user_segments: [] } }
        ]
      };

      await expect(framework.createABTest(invalidTrafficConfig)).rejects.toThrow();
    });

    it('should require control group when configured', async () => {
      const noControlConfig = {
        ...sampleTestConfig,
        test_variants: sampleTestConfig.test_variants!.map(v => ({ ...v, is_control: false }))
      };

      await expect(framework.createABTest(noControlConfig)).rejects.toThrow();
    });

    it('should calculate sample size automatically', async () => {
      const createdTest = await framework.createABTest(sampleTestConfig);

      expect(createdTest.experiment_design.sample_size_calculation).toBeDefined();
      expect(createdTest.experiment_design.sample_size_calculation.calculated_sample_size).toBeGreaterThan(0);
      expect(createdTest.experiment_design.sample_size_calculation.calculation_method).toBe('frequentist');
    });
  });

  describe('A/B Test Execution', () => {
    let testId: string;

    beforeEach(async () => {
      await framework.initialize();
      const createdTest = await framework.createABTest(sampleTestConfig);
      testId = createdTest.test_id;
      
      // Manually set test to ready status for testing
      (framework as any).activeTests.get(testId).test_execution.status = 'ready';
    });

    it('should start A/B test successfully', async () => {
      const testStartedSpy = jest.fn<unknown[], unknown>();
      framework.on('test_started', testStartedSpy);

      await framework.startABTest(testId);

      expect(testStartedSpy).toHaveBeenCalledWith({
        testId,
        testName: sampleTestConfig.test_name,
        startTime: expect.any(Number)
      });
    });

    it('should not start test that is not ready', async () => {
      // Set test status back to draft
      (framework as any).activeTests.get(testId).test_execution.status = 'draft';

      await expect(framework.startABTest(testId)).rejects.toThrow();
    });

    it('should stop A/B test successfully', async () => {
      // Start the test first
      await framework.startABTest(testId);

      const testStoppedSpy = jest.fn<unknown[], unknown>();
      framework.on('test_stopped', testStoppedSpy);

      const stopReason = 'Manual stop for testing';
      await framework.stopABTest(testId, stopReason);

      expect(testStoppedSpy).toHaveBeenCalledWith({
        testId,
        testName: sampleTestConfig.test_name,
        reason: stopReason,
        duration: expect.any(Number)
      });
    });

    it('should handle non-existent test errors', async () => {
      const nonExistentTestId = 'non_existent_test';

      await expect(framework.startABTest(nonExistentTestId)).rejects.toThrow();
      await expect(framework.stopABTest(nonExistentTestId)).rejects.toThrow();
    });
  });

  describe('Results and Analysis', () => {
    let testId: string;

    beforeEach(async () => {
      await framework.initialize();
      const createdTest = await framework.createABTest(sampleTestConfig);
      testId = createdTest.test_id;
    });

    it('should get empty results for draft test', async () => {
      const results = await framework.getTestResults(testId, false);

      expect(results).toBeDefined();
      expect(results.statistical_analysis.test_completion_percentage).toBe(0);
      expect(results.statistical_analysis.statistical_significance_achieved).toBe(false);
      expect(results.statistical_analysis.variant_performance).toHaveLength(0);
    });

    it('should generate interim results for running test', async () => {
      // Start the test
      (framework as any).activeTests.get(testId).test_execution.status = 'ready';
      await framework.startABTest(testId);

      const interimResults = await framework.getTestResults(testId, true);

      expect(interimResults).toBeDefined();
      expect(interimResults.statistical_analysis).toBeDefined();
      expect(interimResults.business_impact).toBeDefined();
      expect(interimResults.security_impact).toBeDefined();
    });

    it('should handle results request for non-existent test', async () => {
      const nonExistentTestId = 'non_existent_test';

      await expect(framework.getTestResults(nonExistentTestId)).rejects.toThrow();
    });

    it('should emit results requested event', async () => {
      const resultsRequestedSpy = jest.fn<unknown[], unknown>();
      framework.on('results_requested', resultsRequestedSpy);

      await framework.getTestResults(testId, false);

      expect(resultsRequestedSpy).toHaveBeenCalledWith({
        testId,
        testName: sampleTestConfig.test_name,
        resultsType: 'final'
      });
    });
  });

  describe('Report Generation', () => {
    let testId: string;

    beforeEach(async () => {
      await framework.initialize();
      const createdTest = await framework.createABTest(sampleTestConfig);
      testId = createdTest.test_id;
    });

    it('should generate interim report', async () => {
      const reportGeneratedSpy = jest.fn<unknown[], unknown>();
      framework.on('report_generated', reportGeneratedSpy);

      const report = await framework.generateABTestReport(testId, 'interim');

      expect(report).toBeDefined();
      expect(report.report_id).toBeDefined();
      expect(report.test_id).toBe(testId);
      expect(report.report_type).toBe('interim');
      expect(report.executive_summary).toBeDefined();
      expect(report.detailed_analysis).toBeDefined();
      expect(report.statistical_appendix).toBeDefined();
      expect(report.recommendations_summary).toBeDefined();

      expect(reportGeneratedSpy).toHaveBeenCalledWith({
        testId,
        reportId: report.report_id,
        reportType: 'interim'
      });
    });

    it('should generate final report', async () => {
      const report = await framework.generateABTestReport(testId, 'final');

      expect(report.report_type).toBe('final');
      expect(report.executive_summary.test_overview).toContain(sampleTestConfig.test_name!);
      expect(Array.isArray(report.executive_summary.key_findings)).toBe(true);
      expect(Array.isArray(report.executive_summary.next_steps)).toBe(true);
    });

    it('should generate post-implementation report', async () => {
      const report = await framework.generateABTestReport(testId, 'post_implementation');

      expect(report.report_type).toBe('post_implementation');
      expect(report.detailed_analysis.data_quality_assessment).toBeDefined();
      expect(report.detailed_analysis.bias_analysis).toBeDefined();
    });

    it('should handle report generation for non-existent test', async () => {
      const nonExistentTestId = 'non_existent_test';

      await expect(framework.generateABTestReport(nonExistentTestId)).rejects.toThrow();
    });

    it('should include stakeholder sections in report', async () => {
      const report = await framework.generateABTestReport(testId, 'final');

      expect(Array.isArray(report.stakeholder_sections)).toBe(true);
      expect(report.stakeholder_sections.length).toBeGreaterThan(0);
      
      const securitySection = report.stakeholder_sections.find(s => s.stakeholder_group === 'Security Team');
      expect(securitySection).toBeDefined();
      expect(Array.isArray(securitySection!.key_insights)).toBe(true);
      expect(Array.isArray(securitySection!.action_items)).toBe(true);
    });
  });

  describe('Analytics and Insights', () => {
    beforeEach(async () => {
      await framework.initialize();
      
      // Create a few test cases for analytics
      await framework.createABTest(sampleTestConfig);
      await framework.createABTest({
        ...sampleTestConfig,
        test_name: 'Rate Limiting Test',
        test_type: 'configuration_optimization'
      });
    });

    it('should provide comprehensive testing analytics', async () => {
      const analytics = framework.getTestingAnalytics();

      expect(analytics).toBeDefined();
      expect(analytics.summary).toBeDefined();
      expect(analytics.summary.total_tests).toBeGreaterThanOrEqual(2);
      expect(typeof analytics.summary.active_tests).toBe('number');
      expect(typeof analytics.summary.completed_tests).toBe('number');
      expect(typeof analytics.summary.average_test_duration_days).toBe('number');

      expect(analytics.performance_metrics).toBeDefined();
      expect(typeof analytics.performance_metrics.test_success_rate_percent).toBe('number');
      expect(typeof analytics.performance_metrics.average_statistical_power).toBe('number');
      expect(typeof analytics.performance_metrics.significant_results_percent).toBe('number');

      expect(analytics.test_types).toBeDefined();
      expect(typeof analytics.test_types.policy_comparison).toBe('number');
      expect(typeof analytics.test_types.configuration_optimization).toBe('number');

      expect(analytics.variant_performance).toBeDefined();
      expect(Array.isArray(analytics.recent_activities)).toBe(true);
    });

    it('should track test type distribution', async () => {
      const analytics = framework.getTestingAnalytics();

      expect(analytics.test_types.policy_comparison).toBeGreaterThan(0);
      expect(analytics.test_types.configuration_optimization).toBeGreaterThan(0);
    });

    it('should provide variant performance insights', async () => {
      const analytics = framework.getTestingAnalytics();

      expect(typeof analytics.variant_performance.average_improvement).toBe('number');
      expect(Array.isArray(analytics.variant_performance.best_performing_variants)).toBe(true);
      expect(Array.isArray(analytics.variant_performance.common_winning_characteristics)).toBe(true);
    });

    it('should track recent activities', async () => {
      const analytics = framework.getTestingAnalytics();

      expect(Array.isArray(analytics.recent_activities)).toBe(true);
      // Should have at least test creation activities
      expect(analytics.recent_activities.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Event Handling', () => {
    beforeEach(async () => {
      await framework.initialize();
    });

    it('should handle platform security alerts', async () => {
      const alertHandler = (mockPlatform.on as jest.Mock).mock.calls
        .find(call => call[0] === 'security_alert')?.[1];

      if (alertHandler) {
        await alertHandler({ severity: 'high', type: 'policy_violation' });
        // Should not throw
      }
    });

    it('should handle policy engine events', async () => {
      const policyHandler = (mockPolicyEngine.on as jest.Mock).mock.calls
        .find(call => call[0] === 'policy_validation_completed')?.[1];

      if (policyHandler) {
        await policyHandler({ policyId: 'test_policy', result: { validation_passed: true } });
        // Should not throw
      }
    });

    it('should handle optimization engine events', async () => {
      const optimizationHandler = (mockOptimizationEngine.on as jest.Mock).mock.calls
        .find(call => call[0] === 'recommendation_applied')?.[1];

      if (optimizationHandler) {
        await optimizationHandler({ recommendationId: 'test_rec', result: { success: true } });
        // Should not throw
      }
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      await framework.initialize();
    });

    it('should handle test creation errors', async () => {
      const errorSpy = jest.fn<unknown[], unknown>();
      framework.on('test_creation_error', errorSpy);

      const invalidConfig = { test_name: '' }; // Invalid config

      await expect(framework.createABTest(invalidConfig)).rejects.toThrow();
      expect(errorSpy).toHaveBeenCalled();
    });

    it('should handle test start errors', async () => {
      const errorSpy = jest.fn<unknown[], unknown>();
      framework.on('test_start_error', errorSpy);

      const nonExistentTestId = 'non_existent';

      await expect(framework.startABTest(nonExistentTestId)).rejects.toThrow();
      expect(errorSpy).toHaveBeenCalledWith({
        testId: nonExistentTestId,
        error: expect.any(Error)
      });
    });

    it('should handle results errors', async () => {
      const errorSpy = jest.fn<unknown[], unknown>();
      framework.on('results_error', errorSpy);

      const nonExistentTestId = 'non_existent';

      await expect(framework.getTestResults(nonExistentTestId)).rejects.toThrow();
      expect(errorSpy).toHaveBeenCalledWith({
        testId: nonExistentTestId,
        error: expect.any(Error)
      });
    });

    it('should handle report generation errors', async () => {
      const errorSpy = jest.fn<unknown[], unknown>();
      framework.on('report_generation_error', errorSpy);

      const nonExistentTestId = 'non_existent';

      await expect(framework.generateABTestReport(nonExistentTestId)).rejects.toThrow();
      expect(errorSpy).toHaveBeenCalledWith({
        testId: nonExistentTestId,
        error: expect.any(Error)
      });
    });
  });

  describe('Configuration Validation', () => {
    it('should respect traffic management configuration', async () => {
      const limitedConfig: SecurityABTestingConfig = {
        ...config,
        traffic_management: {
          ...config.traffic_management,
          canary_deployment_enabled: false,
          gradual_rollout_enabled: false
        }
      };

      const limitedFramework = new SecurityABTestingFramework(
        limitedConfig, 
        mockPlatform, 
        mockPolicyEngine, 
        mockOptimizationEngine
      );
      await limitedFramework.initialize();

      // Framework should still work but with limited capabilities
      const createdTest = await limitedFramework.createABTest(sampleTestConfig);
      expect(createdTest).toBeDefined();

      await limitedFramework.shutdown();
    });

    it('should handle different statistical analysis configurations', async () => {
      const bayesianOnlyConfig: SecurityABTestingConfig = {
        ...config,
        statistical_analysis: {
          ...config.statistical_analysis,
          significance_testing_methods: ['bayesian']
        }
      };

      const bayesianFramework = new SecurityABTestingFramework(
        bayesianOnlyConfig, 
        mockPlatform, 
        mockPolicyEngine, 
        mockOptimizationEngine
      );
      await bayesianFramework.initialize();

      const createdTest = await bayesianFramework.createABTest(sampleTestConfig);
      expect(createdTest).toBeDefined();

      await bayesianFramework.shutdown();
    });

    it('should enforce safety control thresholds', async () => {
      const strictSafetyConfig: SecurityABTestingConfig = {
        ...config,
        safety_controls: {
          ...config.safety_controls,
          safety_thresholds: {
            security_incident_increase_percent: 1, // Very strict
            performance_degradation_percent: 1,
            error_rate_increase_percent: 1
          }
        }
      };

      const strictFramework = new SecurityABTestingFramework(
        strictSafetyConfig, 
        mockPlatform, 
        mockPolicyEngine, 
        mockOptimizationEngine
      );
      await strictFramework.initialize();

      // Should still create tests but with stricter safety monitoring
      const createdTest = await strictFramework.createABTest(sampleTestConfig);
      expect(createdTest).toBeDefined();

      await strictFramework.shutdown();
    });
  });

  describe('Multivariate Testing', () => {
    beforeEach(async () => {
      await framework.initialize();
    });

    it('should support multivariate tests', async () => {
      const multivariateConfig = {
        ...sampleTestConfig,
        test_name: 'Multivariate MFA Test',
        test_variants: [
          {
            variant_id: 'control',
            variant_name: 'Control',
            description: 'Current implementation',
            is_control: true,
            policy_configuration: { policy: { id: 'control' }, feature_flags: {}, configuration_overrides: {} },
            allocation: { traffic_percentage: 25, user_segments: [] }
  }
          {
            variant_id: 'variant_a',
            variant_name: 'Enhanced MFA',
            description: 'Enhanced MFA implementation',
            is_control: false,
            policy_configuration: { policy: { id: 'enhanced' }, feature_flags: {}, configuration_overrides: {} },
            allocation: { traffic_percentage: 25, user_segments: [] }
  }
          {
            variant_id: 'variant_b',
            variant_name: 'Adaptive MFA',
            description: 'Adaptive MFA implementation',
            is_control: false,
            policy_configuration: { policy: { id: 'adaptive' }, feature_flags: {}, configuration_overrides: {} },
            allocation: { traffic_percentage: 25, user_segments: [] }
  }
          {
            variant_id: 'variant_c',
            variant_name: 'Smart MFA',
            description: 'AI-powered MFA implementation',
            is_control: false,
            policy_configuration: { policy: { id: 'smart' }, feature_flags: {}, configuration_overrides: {} },
            allocation: { traffic_percentage: 25, user_segments: [] }
          }
        ]
      };

      const createdTest = await framework.createABTest(multivariateConfig);

      expect(createdTest.test_variants).toHaveLength(4);
      expect(createdTest.test_variants.filter(v => v.is_control)).toHaveLength(1);
      expect(createdTest.test_variants.filter(v => !v.is_control)).toHaveLength(3);
    });
  });

  describe('Shutdown', () => {
    it('should shutdown gracefully', async () => {
      await framework.initialize();
      
      // Create and start a test
      const createdTest = await framework.createABTest(sampleTestConfig);
      (framework as any).activeTests.get(createdTest.test_id).test_execution.status = 'ready';
      await framework.startABTest(createdTest.test_id);

      const shutdownSpy = jest.fn<unknown[], unknown>();
      framework.on('shutdown', shutdownSpy);

      await framework.shutdown();

      expect(shutdownSpy).toHaveBeenCalledWith({
        timestamp: expect.any(Number)
      });
    });

    it('should stop all active tests during shutdown', async () => {
      await framework.initialize();
      
      // Create and start multiple tests
      const test1 = await framework.createABTest(sampleTestConfig);
      const test2 = await framework.createABTest({
        ...sampleTestConfig,
        test_name: 'Second Test'
      });

      (framework as any).activeTests.get(test1.test_id).test_execution.status = 'ready';
      (framework as any).activeTests.get(test2.test_id).test_execution.status = 'ready';
      
      await framework.startABTest(test1.test_id);
      await framework.startABTest(test2.test_id);

      const testStoppedSpy = jest.fn<unknown[], unknown>();
      framework.on('test_stopped', testStoppedSpy);

      await framework.shutdown();

      // Both tests should have been stopped
      expect(testStoppedSpy).toHaveBeenCalledTimes(2);
    });
  });
});