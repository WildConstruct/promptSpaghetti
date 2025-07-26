/**
 * Tests for Security Control Effectiveness Testing and Optimization Engine
 * Epic 31 - Task E31-1753313263605-D24FB9
 */

import { 
  SecurityControlTestingEngine, 
  SecurityControlTestingConfig, 
  SecurityControl, 
  SecurityControlTest,
  EffectivenessReport 
} from '../SecurityControlTestingEngine';
import { SecurityAPIIntegrationPlatform } from '../SecurityAPIIntegrationPlatform';
import { SecurityPolicyAnalysisEngine } from '../SecurityPolicyAnalysisEngine';
import { SecurityOptimizationEngine } from '../SecurityOptimizationEngine';

// Mock dependencies
jest.mock('../SecurityAPIIntegrationPlatform');
jest.mock('../SecurityPolicyAnalysisEngine');
jest.mock('../SecurityOptimizationEngine');

describe('SecurityControlTestingEngine', () => {
  let engine: SecurityControlTestingEngine;
  let mockPlatform: jest.Mocked<SecurityAPIIntegrationPlatform>;
  let mockPolicyEngine: jest.Mocked<SecurityPolicyAnalysisEngine>;
  let mockOptimizationEngine: jest.Mocked<SecurityOptimizationEngine>;
  let config: SecurityControlTestingConfig;
  let sampleControl: SecurityControl;

  beforeEach(() => {
    // Setup mocks
    mockPlatform = {
      on: jest.fn<unknown[], unknown>(),
      getPlatformMetrics: jest.fn<unknown[], unknown>().mockResolvedValue({
        api_calls: { total_requests: 1000, successful_requests: 950 },
        security_analytics: { threats_detected: 15, detection_accuracy_percent: 94 }
      } as unknown)
    } as any;

    mockPolicyEngine = {
      on: jest.fn<unknown[], unknown>(),
      validatePolicy: jest.fn<unknown[], unknown>().mockResolvedValue({
        validation_passed: true,
        validation_errors: [],
        validation_warnings: []
      } as unknown)
    } as any;

    mockOptimizationEngine = {
      on: jest.fn<unknown[], unknown>(),
      performComprehensiveAnalysis: jest.fn<unknown[], unknown>().mockResolvedValue({
        recommendations: [],
        optimization_opportunities: 3
      } as unknown)
    } as any;

    // Setup configuration
    config = {
      testing_framework: {
        enabled: true,
        automated_testing_enabled: true,
        continuous_testing_enabled: true,
        regression_testing_enabled: true,
        performance_testing_enabled: true,
        security_testing_enabled: true
      },
      effectiveness_measurement: {
        enabled: true,
        real_time_monitoring: true,
        baseline_establishment: true,
        comparative_analysis: true,
        trend_analysis: true,
        statistical_significance_testing: true
      },
      optimization_settings: {
        enabled: true,
        automatic_optimization: false,
        ml_based_optimization: true,
        feedback_loop_enabled: true,
        optimization_frequency_hours: 24,
        optimization_thresholds: {
          effectiveness_threshold: 80,
          performance_threshold: 500,
          reliability_threshold: 99
        }
      },
      test_categories: {
        authentication_controls: true,
        authorization_controls: true,
        data_protection_controls: true,
        network_security_controls: true,
        incident_response_controls: true,
        compliance_controls: true,
        monitoring_controls: true
      },
      reporting_settings: {
        detailed_reports_enabled: true,
        executive_summaries_enabled: true,
        trend_reports_enabled: true,
        compliance_reports_enabled: true,
        real_time_dashboards_enabled: true
      }
    };

    // Setup sample security control
    sampleControl = {
      id: 'auth_control_001',
      name: 'Multi-Factor Authentication Control',
      description: 'Enforces MFA for admin users',
      category: 'authentication',
      type: 'preventive',
      implementation: {
        technology_stack: ['OAuth2', 'SAML', 'TOTP'],
        configuration: {
          mfa_required_roles: ['admin', 'security_officer'],
          backup_codes_enabled: true,
          session_timeout_minutes: 30
        },
        dependencies: ['identity_provider', 'token_service'],
        deployment_scope: ['admin_panel', 'api_gateway', 'database_access']
      },
      testing_parameters: {
        test_frequency_hours: 12,
        test_scenarios: [
          'admin_login_without_mfa',
          'admin_login_with_mfa',
          'mfa_bypass_attempt',
          'session_timeout_validation'
        ],
        success_criteria: {
          detection_rate_minimum: 95,
          false_positive_rate_maximum: 5,
          response_time_maximum_ms: 500
        },
        performance_thresholds: {
          max_response_time_ms: 500,
          min_availability_percent: 99.5,
          max_cpu_usage_percent: 15
        },
        failure_conditions: [
          'mfa_bypass_successful',
          'detection_rate_below_threshold',
          'excessive_false_positives'
        ]
      },
      effectiveness_metrics: {
        detection_rate: 97.5,
        false_positive_rate: 2.1,
        false_negative_rate: 2.5,
        response_time_ms: 245,
        throughput_capacity: 1000,
        reliability_score: 99.2
      },
      metadata: {
        created_by: 'security_team',
        created_at: Date.now() - 86400000,
        last_tested: Date.now() - 43200000,
        last_optimized: Date.now() - 172800000,
        status: 'active',
        version: '2.1.0'
      }
    };

    engine = new SecurityControlTestingEngine(config, mockPlatform, mockPolicyEngine, mockOptimizationEngine);
  });

  afterEach(async () => {
    if (engine) {
      await engine.shutdown();
    }
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      const initializeSpy = jest.fn<unknown[], unknown>();
      engine.on('initialized', initializeSpy);

      await engine.initialize();

      expect(initializeSpy).toHaveBeenCalledWith({ timestamp: expect.any(Number) });
    });

    it('should emit error on initialization failure', async () => {
      jest.spyOn(engine as any, 'initializeTestingFramework').mockRejectedValue(new Error('Init failed'));
      
      const errorSpy = jest.fn<unknown[], unknown>();
      engine.on('error', errorSpy);

      await expect(engine.initialize()).rejects.toThrow('Init failed');
      expect(errorSpy).toHaveBeenCalledWith({
        error: expect.any(Error),
        context: 'initialization'
      });
    });
  });

  describe('Security Control Registration', () => {
    beforeEach(async () => {
      await engine.initialize();
    });

    it('should register security control successfully', async () => {
      const registrationSpy = jest.fn<unknown[], unknown>();
      engine.on('control_registered', registrationSpy);

      await engine.registerSecurityControl(sampleControl);

      expect(registrationSpy).toHaveBeenCalledWith({
        controlId: sampleControl.id,
        controlName: sampleControl.name,
        category: sampleControl.category
      });
    });

    it('should establish baseline after registration', async () => {
      const baselineSpy = jest.fn<unknown[], unknown>();
      engine.on('baseline_established', baselineSpy);

      await engine.registerSecurityControl(sampleControl);

      expect(baselineSpy).toHaveBeenCalledWith({
        controlId: sampleControl.id
      });
    });

    it('should reject duplicate control registration', async () => {
      await engine.registerSecurityControl(sampleControl);

      const errorSpy = jest.fn<unknown[], unknown>();
      engine.on('error', errorSpy);

      await expect(engine.registerSecurityControl(sampleControl)).rejects.toThrow();
    });

    it('should validate control configuration during registration', async () => {
      const invalidControl = {
        ...sampleControl,
        id: '', // Invalid empty ID
        testing_parameters: {
          ...sampleControl.testing_parameters,
          test_frequency_hours: -1 // Invalid negative frequency
        }
      };

      await expect(engine.registerSecurityControl(invalidControl)).rejects.toThrow();
    });
  });

  describe('Security Control Testing', () => {
    beforeEach(async () => {
      await engine.initialize();
      await engine.registerSecurityControl(sampleControl);
    });

    it('should execute functional testing successfully', async () => {
      const testingSpy = jest.fn<unknown[], unknown>();
      engine.on('control_testing_completed', testingSpy);

      const testResults = await engine.testSecurityControl(sampleControl.id, ['functional'], 'testing');

      expect(testResults).toHaveLength(1);
      expect(testResults[0].test_type).toBe('functional');
      expect(testResults[0].test_results.overall_result).toMatch(/pass|fail|warning/);
      expect(testResults[0].control_id).toBe(sampleControl.id);

      expect(testingSpy).toHaveBeenCalledWith({
        controlId: sampleControl.id,
        testCount: 1,
        overallResult: expect.any(String)
      });
    });

    it('should execute multiple test types', async () => {
      const testTypes: SecurityControlTest['test_type'][] = ['functional', 'performance', 'security'];
      const testResults = await engine.testSecurityControl(sampleControl.id, testTypes, 'testing');

      expect(testResults).toHaveLength(3);
      expect(testResults.map(r => r.test_type)).toEqual(expect.arrayContaining(testTypes));

      // Verify each test has required properties
      testResults.forEach(result => {
        expect(result.test_id).toBeDefined();
        expect(result.control_id).toBe(sampleControl.id);
        expect(result.test_execution.started_at).toBeGreaterThan(0);
        expect(result.test_results.overall_result).toMatch(/pass|fail|warning/);
        expect(typeof result.test_results.success_rate_percent).toBe('number');
        expect(Array.isArray(result.test_results.detected_issues)).toBe(true);
        expect(Array.isArray(result.test_results.recommendations)).toBe(true);
      });
    });

    it('should handle different test environments', async () => {
      const environments = ['production', 'staging', 'testing', 'development'] as const;

      for (const environment of environments) {
        const testResults = await engine.testSecurityControl(sampleControl.id, ['functional'], environment);
        expect(testResults[0].test_execution.environment).toBe(environment);
      }
    });

    it('should detect security issues during testing', async () => {
      const testResults = await engine.testSecurityControl(sampleControl.id, ['security'], 'testing');

      expect(testResults[0].test_results.detected_issues).toBeDefined();
      expect(Array.isArray(testResults[0].test_results.detected_issues)).toBe(true);

      // Verify issue structure if any issues are found
      testResults[0].test_results.detected_issues.forEach(issue => {
        expect(issue.issue_id).toBeDefined();
        expect(issue.severity).toMatch(/low|medium|high|critical/);
        expect(issue.issue_type).toBeDefined();
        expect(issue.description).toBeDefined();
      });
    });

    it('should provide performance metrics', async () => {
      const testResults = await engine.testSecurityControl(sampleControl.id, ['performance'], 'testing');

      expect(testResults[0].test_results.performance_metrics).toBeDefined();
      expect(typeof testResults[0].test_results.performance_metrics.response_time_ms).toBe('number');
      expect(typeof testResults[0].test_results.performance_metrics.throughput_requests_per_second).toBe('number');
      expect(typeof testResults[0].test_results.performance_metrics.resource_utilization_percent).toBe('number');
      expect(typeof testResults[0].test_results.performance_metrics.availability_percent).toBe('number');
    });

    it('should handle testing failures gracefully', async () => {
      const nonExistentControlId = 'non_existent_control';

      await expect(engine.testSecurityControl(nonExistentControlId, ['functional'], 'testing'))
        .rejects.toThrow();
    });

    it('should support load testing', async () => {
      const testResults = await engine.testSecurityControl(sampleControl.id, ['load'], 'testing');

      expect(testResults[0].test_type).toBe('load');
      expect(testResults[0].test_results.performance_metrics.load_test_results).toBeDefined();
      expect(typeof testResults[0].test_results.performance_metrics.load_test_results.concurrent_users).toBe('number');
      expect(typeof testResults[0].test_results.performance_metrics.load_test_results.requests_per_second).toBe('number');
      expect(typeof testResults[0].test_results.performance_metrics.load_test_results.average_response_time).toBe('number');
    });
  });

  describe('Control Optimization', () => {
    beforeEach(async () => {
      await engine.initialize();
      await engine.registerSecurityControl(sampleControl);
      // Run some tests to generate data for optimization
      await engine.testSecurityControl(sampleControl.id, ['functional', 'performance'], 'testing');
    });

    it('should optimize security control successfully', async () => {
      const optimizationSpy = jest.fn<unknown[], unknown>();
      engine.on('control_optimized', optimizationSpy);

      const optimizationResult = await engine.optimizeSecurityControl(
        sampleControl.id,
        ['effectiveness',
        'performance']
      );

      expect(optimizationResult.optimization_id).toBeDefined();
      expect(optimizationResult.control_id).toBe(sampleControl.id);
      expect(Array.isArray(optimizationResult.applied_optimizations)).toBe(true);
      expect(optimizationResult.expected_improvements).toBeDefined();
      expect(optimizationResult.monitoring_plan).toBeDefined();

      expect(optimizationSpy).toHaveBeenCalledWith({
        controlId: sampleControl.id,
        optimizationId: optimizationResult.optimization_id,
        appliedCount: optimizationResult.applied_optimizations.length
      });
    });

    it('should validate optimization effectiveness', async () => {
      const optimizationResult = await engine.optimizeSecurityControl(sampleControl.id, ['effectiveness']);

      const validationSpy = jest.fn<unknown[], unknown>();
      engine.on('optimization_validated', validationSpy);

      // Simulate validation after a delay
      setTimeout(async () => {
        expect(validationSpy).toHaveBeenCalledWith({
          controlId: sampleControl.id,
          optimizationId: optimizationResult.optimization_id,
          success: expect.any(Boolean)
        });
      }, 100);
    });

    it('should handle different optimization targets', async () => {
      const targets = [
        ['effectiveness'],
        ['performance'],
        ['reliability'],
        ['effectiveness', 'performance'],
        ['performance', 'reliability'],
        ['effectiveness', 'performance', 'reliability']
      ];

      for (const targetSet of targets) {
        const result = await engine.optimizeSecurityControl(sampleControl.id, targetSet);
        expect(result.optimization_targets).toEqual(expect.arrayContaining(targetSet));
      }
    });

    it('should provide rollback capabilities', async () => {
      const optimizationResult = await engine.optimizeSecurityControl(sampleControl.id, ['effectiveness']);

      expect(optimizationResult.rollback_plan).toBeDefined();
      expect(optimizationResult.rollback_plan.rollback_available).toBe(true);
      expect(Array.isArray(optimizationResult.rollback_plan.rollback_steps)).toBe(true);
      expect(typeof optimizationResult.rollback_plan.estimated_rollback_time_minutes).toBe('number');
    });
  });

  describe('Effectiveness Reporting', () => {
    beforeEach(async () => {
      await engine.initialize();
      await engine.registerSecurityControl(sampleControl);
      await engine.testSecurityControl(sampleControl.id, ['functional', 'performance', 'security'], 'testing');
    });

    it('should generate individual control report', async () => {
      const reportSpy = jest.fn<unknown[], unknown>();
      engine.on('report_generated', reportSpy);

      const report = await engine.generateEffectivenessReport(
        'individual_control',
        undefined,
        undefined,
        [sampleControl.id]
      );

      expect(report.report_type).toBe('individual_control');
      expect(report.report_id).toBeDefined();
      expect(report.generated_at).toBeGreaterThan(0);
      expect(report.executive_summary).toBeDefined();
      expect(report.detailed_findings).toBeDefined();
      expect(report.compliance_status).toBeDefined();
      expect(report.recommendations).toBeDefined();

      expect(reportSpy).toHaveBeenCalledWith({
        reportType: 'individual_control',
        reportId: report.report_id,
        controlCount: 1
      });
    });

    it('should generate comprehensive report', async () => {
      const report = await engine.generateEffectivenessReport('comprehensive');

      expect(report.report_type).toBe('comprehensive');
      expect(report.executive_summary.total_controls_tested).toBeGreaterThanOrEqual(1);
      expect(typeof report.executive_summary.overall_effectiveness_score).toBe('number');
      expect(typeof report.executive_summary.passed_controls).toBe('number');
      expect(typeof report.executive_summary.failed_controls).toBe('number');
      expect(typeof report.executive_summary.critical_issues).toBe('number');
    });

    it('should include trend analysis in reports', async () => {
      // Generate some test history
      await engine.testSecurityControl(sampleControl.id, ['functional'], 'testing');
      await engine.testSecurityControl(sampleControl.id, ['performance'], 'testing');

      const report = await engine.generateEffectivenessReport('trend_analysis');

      expect(report.trend_analysis).toBeDefined();
      expect(report.trend_analysis.effectiveness_trends).toBeDefined();
      expect(report.trend_analysis.performance_trends).toBeDefined();
      expect(report.trend_analysis.issue_detection_trends).toBeDefined();
    });

    it('should filter reports by date range', async () => {
      const startDate = Date.now() - 86400000; // 24 hours ago
      const endDate = Date.now();

      const report = await engine.generateEffectivenessReport('comprehensive', startDate, endDate);

      expect(report.reporting_period.start_date).toBe(startDate);
      expect(report.reporting_period.end_date).toBe(endDate);
      expect(report.reporting_period.duration_days).toBe(1);
    });

    it('should include compliance assessment', async () => {
      const report = await engine.generateEffectivenessReport('comprehensive');

      expect(report.compliance_status).toBeDefined();
      expect(Array.isArray(report.compliance_status.compliance_frameworks)).toBe(true);
      expect(Array.isArray(report.compliance_status.compliance_gaps)).toBe(true);
      expect(typeof report.compliance_status.overall_compliance_score).toBe('number');
    });
  });

  describe('Analytics and Insights', () => {
    beforeEach(async () => {
      await engine.initialize();
      await engine.registerSecurityControl(sampleControl);
      await engine.testSecurityControl(sampleControl.id, ['functional', 'performance', 'security'], 'testing');
    });

    it('should provide comprehensive testing analytics', async () => {
      const analytics = engine.getTestingAnalytics();

      expect(analytics.summary).toBeDefined();
      expect(analytics.summary.total_controls).toBeGreaterThanOrEqual(1);
      expect(typeof analytics.summary.active_tests).toBe('number');
      expect(typeof analytics.summary.completed_tests_24h).toBe('number');
      expect(typeof analytics.summary.average_effectiveness_score).toBe('number');

      expect(analytics.performance_metrics).toBeDefined();
      expect(typeof analytics.performance_metrics.test_success_rate_percent).toBe('number');
      expect(typeof analytics.performance_metrics.average_test_duration_seconds).toBe('number');
      expect(typeof analytics.performance_metrics.critical_issues_found).toBe('number');

      expect(analytics.trends).toBeDefined();
      expect(analytics.category_breakdown).toBeDefined();
      expect(Array.isArray(analytics.recent_activities)).toBe(true);
    });

    it('should track category-specific metrics', async () => {
      const analytics = engine.getTestingAnalytics();

      expect(analytics.category_breakdown).toBeDefined();
      expect(analytics.category_breakdown.authentication).toBeDefined();
      expect(typeof analytics.category_breakdown.authentication.control_count).toBe('number');
      expect(typeof analytics.category_breakdown.authentication.average_effectiveness).toBe('number');
      expect(typeof analytics.category_breakdown.authentication.critical_issues).toBe('number');
    });

    it('should provide trend analysis', async () => {
      // Add more test data for trends
      await engine.testSecurityControl(sampleControl.id, ['functional'], 'testing');
      await engine.testSecurityControl(sampleControl.id, ['performance'], 'testing');

      const analytics = engine.getTestingAnalytics();

      expect(analytics.trends.effectiveness_trend_7days).toMatch(/improving|stable|declining/);
      expect(analytics.trends.performance_trend_7days).toMatch(/improving|stable|declining/);
      expect(analytics.trends.issue_detection_trend).toMatch(/increasing|stable|decreasing/);
    });

    it('should track recent activities', async () => {
      const analytics = engine.getTestingAnalytics();

      expect(analytics.recent_activities.length).toBeGreaterThan(0);
      analytics.recent_activities.forEach(activity => {
        expect(activity.timestamp).toBeGreaterThan(0);
        expect(activity.activity_type).toMatch(/control_registered|test_completed|optimization_applied|report_generated/);
        expect(activity.control_id).toBeDefined();
        expect(activity.description).toBeDefined();
      });
    });
  });

  describe('Event Handling', () => {
    beforeEach(async () => {
      await engine.initialize();
    });

    it('should handle platform events', async () => {
      const alertHandler = (mockPlatform.on as jest.Mock).mock.calls
        .find(call => call[0] === 'security_alert')?.[1];

      if (alertHandler) {
        await alertHandler({ severity: 'high', type: 'threat_detected', controlId: sampleControl.id });
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
        await optimizationHandler({ recommendationId: 'test', controlId: sampleControl.id });
        // Should not throw
      }
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      await engine.initialize();
    });

    it('should handle testing errors gracefully', async () => {
      const errorSpy = jest.fn<unknown[], unknown>();
      engine.on('error', errorSpy);

      // Mock test execution to fail
      jest.spyOn(engine as any, 'executeControlTest').mockRejectedValue(new Error('Test execution failed'));

      await engine.registerSecurityControl(sampleControl);
      await expect(engine.testSecurityControl(sampleControl.id, ['functional'], 'testing')).rejects.toThrow();
      expect(errorSpy).toHaveBeenCalled();
    });

    it('should handle optimization errors gracefully', async () => {
      await engine.registerSecurityControl(sampleControl);

      const errorSpy = jest.fn<unknown[], unknown>();
      engine.on('error', errorSpy);

      // Mock optimization to fail
      jest.spyOn(engine as any, 'applyOptimizations').mockRejectedValue(new Error('Optimization failed'));

      await expect(engine.optimizeSecurityControl(sampleControl.id, ['effectiveness'])).rejects.toThrow();
      expect(errorSpy).toHaveBeenCalled();
    });

    it('should handle report generation errors gracefully', async () => {
      const errorSpy = jest.fn<unknown[], unknown>();
      engine.on('error', errorSpy);

      // Mock report generation to fail
      jest.spyOn(engine as any, 'generateExecutiveSummary').mockRejectedValue(new Error('Report generation failed'));

      await expect(engine.generateEffectivenessReport('comprehensive')).rejects.toThrow();
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('Configuration', () => {
    it('should respect configuration settings', async () => {
      const configWithoutOptimization: SecurityControlTestingConfig = {
        ...config,
        optimization_settings: {
          ...config.optimization_settings,
          enabled: false
        }
      };

      const engineWithoutOptimization = new SecurityControlTestingEngine(
        configWithoutOptimization, 
        mockPlatform, 
        mockPolicyEngine, 
        mockOptimizationEngine
      );
      await engineWithoutOptimization.initialize();

      await engineWithoutOptimization.registerSecurityControl(sampleControl);

      // Should not be able to optimize when disabled
      await expect(engineWithoutOptimization.optimizeSecurityControl(sampleControl.id, ['effectiveness']))
        .rejects.toThrow();

      await engineWithoutOptimization.shutdown();
    });

    it('should handle different test categories', async () => {
      const configWithLimitedCategories: SecurityControlTestingConfig = {
        ...config,
        test_categories: {
          authentication_controls: true,
          authorization_controls: false,
          data_protection_controls: false,
          network_security_controls: false,
          incident_response_controls: false,
          compliance_controls: false,
          monitoring_controls: false
        }
      };

      const engineWithLimitedCategories = new SecurityControlTestingEngine(
        configWithLimitedCategories, 
        mockPlatform, 
        mockPolicyEngine, 
        mockOptimizationEngine
      );
      await engineWithLimitedCategories.initialize();

      // Should accept authentication controls
      await engineWithLimitedCategories.registerSecurityControl(sampleControl);

      // Should reject authorization controls
      const authzControl = { ...sampleControl, id: 'authz_001', category: 'authorization' as const };
      await expect(engineWithLimitedCategories.registerSecurityControl(authzControl))
        .rejects.toThrow();

      await engineWithLimitedCategories.shutdown();
    });
  });

  describe('Shutdown', () => {
    it('should shutdown gracefully', async () => {
      await engine.initialize();
      await engine.registerSecurityControl(sampleControl);

      const shutdownSpy = jest.fn<unknown[], unknown>();
      engine.on('shutdown', shutdownSpy);

      await engine.shutdown();

      expect(shutdownSpy).toHaveBeenCalledWith({
        timestamp: expect.any(Number)
      });
    });

    it('should cleanup resources during shutdown', async () => {
      await engine.initialize();
      await engine.registerSecurityControl(sampleControl);
      
      // Start some long-running operations
      const testPromise = engine.testSecurityControl(sampleControl.id, ['functional'], 'testing');
      
      // Shutdown should cleanup gracefully
      await engine.shutdown();
      
      // Test should complete or be cancelled
      await expect(testPromise).resolves.toBeDefined();
    });
  });
});