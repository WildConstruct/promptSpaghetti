/**
 * Tests for Security Policy Analysis Engine
 * Epic 31 - Task E31-1753313263607-C43832
 */

import { 
  SecurityPolicyAnalysisEngine, 
  SecurityPolicyConfig, 
  SecurityPolicy, 
  PolicyImpactAnalysis 
} from '../SecurityPolicyAnalysisEngine';
import { SecurityAPIIntegrationPlatform } from '../SecurityAPIIntegrationPlatform';
import { SecurityOptimizationEngine } from '../SecurityOptimizationEngine';

// Mock dependencies
jest.mock('../SecurityAPIIntegrationPlatform');
jest.mock('../SecurityOptimizationEngine');

describe('SecurityPolicyAnalysisEngine', () => {
  let engine: SecurityPolicyAnalysisEngine;
  let mockPlatform: jest.Mocked<SecurityAPIIntegrationPlatform>;
  let mockOptimizationEngine: jest.Mocked<SecurityOptimizationEngine>;
  let config: SecurityPolicyConfig;
  let samplePolicy: SecurityPolicy;

  beforeEach(() => {
    // Setup mocks
    mockPlatform = {
      on: jest.fn<unknown[], unknown>(),
      getPlatformMetrics: jest.fn<unknown[], unknown>().mockResolvedValue({
        api_calls: { total_requests: 1000, successful_requests: 950 },
        security_analytics: { threats_detected: 10, detection_accuracy_percent: 95 }
      } as unknown)
    } as any;

    mockOptimizationEngine = {
      on: jest.fn<unknown[], unknown>()
    } as any;

    // Setup configuration
    config = {
      analysis_settings: {
        enabled: true,
        deep_analysis_enabled: true,
        impact_simulation_enabled: true,
        compliance_checking_enabled: true,
        historical_analysis_enabled: true
      },
      validation_framework: {
        enabled: true,
        automated_validation: true,
        validation_rules: ['no_wildcard_permissions', 'require_mfa_for_admin'],
        compliance_standards: ['SOX', 'PCI_DSS'],
        risk_assessment_enabled: true
      },
      policy_categories: {
        access_control: true,
        authentication: true,
        authorization: true,
        data_protection: true,
        network_security: true,
        compliance: true,
        incident_response: true
      },
      impact_assessment: {
        user_impact_analysis: true,
        system_impact_analysis: true,
        performance_impact_analysis: true,
        security_impact_analysis: true,
        compliance_impact_analysis: true,
        cost_impact_analysis: true
      },
      approval_workflow: {
        enabled: true,
        require_approval_for: ['high', 'critical'],
        approval_levels: 2,
        auto_approve_low_risk: true,
        notification_enabled: true
      }
    };

    // Setup sample policy
    samplePolicy = {
      id: 'test_policy_001',
      name: 'Test Authentication Policy',
      description: 'Test policy for unit testing',
      category: 'authentication',
      version: '1.0.0',
      policy_rules: [
        {
          rule_id: 'mfa_required',
          rule_type: 'deny',
          conditions: [
            { field: 'role', operator: 'equals', value: 'admin' },
            { field: 'mfa_enabled', operator: 'equals', value: false, logical_operator: 'and' }
          ],
          actions: [
            { action_type: 'deny', parameters: {}, notification_enabled: true }
          ],
          exceptions: []
        }
      ],
      metadata: {
        created_by: 'test_user',
        created_at: Date.now(),
        last_modified: Date.now(),
        status: 'draft',
        compliance_mappings: ['SOX', 'PCI_DSS'],
        risk_level: 'medium'
      },
      enforcement: {
        enforcement_mode: 'enforcing',
        enforcement_scope: ['admin_panel', 'api_access'],
        rollback_enabled: true,
        monitoring_enabled: true
      }
    };

    engine = new SecurityPolicyAnalysisEngine(config, mockPlatform, mockOptimizationEngine);
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
      // Mock a method to throw error during initialization
      jest.spyOn(engine as any, 'initializeValidationRules').mockRejectedValue(new Error('Init failed'));
      
      const errorSpy = jest.fn<unknown[], unknown>();
      engine.on('error', errorSpy);

      await expect(engine.initialize()).rejects.toThrow('Init failed');
      expect(errorSpy).toHaveBeenCalledWith({
        error: expect.any(Error),
        context: 'initialization'
      });
    });
  });

  describe('Policy Impact Analysis', () => {
    beforeEach(async () => {
      await engine.initialize();
    });

    it('should analyze policy impact successfully', async () => {
      const analysisCompletedSpy = jest.fn<unknown[], unknown>();
      engine.on('policy_analysis_completed', analysisCompletedSpy);

      const analysis = await engine.analyzePolicyImpact(samplePolicy, 'pre_deployment');

      expect(analysis).toBeDefined();
      expect(analysis.policy_id).toBe(samplePolicy.id);
      expect(analysis.analysis_type).toBe('pre_deployment');
      expect(analysis.impact_assessment).toBeDefined();
      expect(analysis.risk_analysis).toBeDefined();
      expect(analysis.validation_results).toBeDefined();

      expect(analysisCompletedSpy).toHaveBeenCalledWith({
        policyId: samplePolicy.id,
        analysisId: analysis.analysis_id,
        analysis: analysis
      });
    });

    it('should include all impact assessment categories', async () => {
      const analysis = await engine.analyzePolicyImpact(samplePolicy);

      expect(analysis.impact_assessment.user_impact).toBeDefined();
      expect(analysis.impact_assessment.system_impact).toBeDefined();
      expect(analysis.impact_assessment.performance_impact).toBeDefined();
      expect(analysis.impact_assessment.security_impact).toBeDefined();
      expect(analysis.impact_assessment.compliance_impact).toBeDefined();
      expect(analysis.impact_assessment.cost_impact).toBeDefined();

      // Check specific user impact fields
      expect(analysis.impact_assessment.user_impact.affected_users).toBeGreaterThan(0);
      expect(Array.isArray(analysis.impact_assessment.user_impact.access_changes)).toBe(true);
      expect(typeof analysis.impact_assessment.user_impact.user_experience_score).toBe('number');

      // Check performance impact fields
      expect(typeof analysis.impact_assessment.performance_impact.processing_overhead_percent).toBe('number');
      expect(typeof analysis.impact_assessment.performance_impact.performance_score).toBe('number');

      // Check security impact fields
      expect(typeof analysis.impact_assessment.security_impact.security_effectiveness_score).toBe('number');
      expect(Array.isArray(analysis.impact_assessment.security_impact.mitigated_risks)).toBe(true);
    });

    it('should include risk analysis', async () => {
      const analysis = await engine.analyzePolicyImpact(samplePolicy);

      expect(analysis.risk_analysis.overall_risk_score).toBeGreaterThanOrEqual(0);
      expect(analysis.risk_analysis.overall_risk_score).toBeLessThanOrEqual(100);
      expect(typeof analysis.risk_analysis.risk_categories).toBe('object');
      expect(Array.isArray(analysis.risk_analysis.mitigation_strategies)).toBe(true);
      expect(['low', 'medium', 'high'].includes(analysis.risk_analysis.rollback_complexity)).toBe(true);
      expect(['limited', 'moderate', 'extensive'].includes(analysis.risk_analysis.blast_radius)).toBe(true);
    });

    it('should include simulation results when enabled', async () => {
      // Enable simulation in config
      config.analysis_settings.impact_simulation_enabled = true;
      
      const analysis = await engine.analyzePolicyImpact(samplePolicy);

      expect(analysis.simulation_results).toBeDefined();
      expect(analysis.simulation_results?.simulation_run).toBe(true);
      expect(Array.isArray(analysis.simulation_results?.simulated_scenarios)).toBe(true);
      expect(typeof analysis.simulation_results?.confidence_level).toBe('number');
    });

    it('should handle different analysis types', async () => {
      const preDeployment = await engine.analyzePolicyImpact(samplePolicy, 'pre_deployment');
      const postDeployment = await engine.analyzePolicyImpact(samplePolicy, 'post_deployment');
      const periodicReview = await engine.analyzePolicyImpact(samplePolicy, 'periodic_review');

      expect(preDeployment.analysis_type).toBe('pre_deployment');
      expect(postDeployment.analysis_type).toBe('post_deployment');
      expect(periodicReview.analysis_type).toBe('periodic_review');
    });

    it('should emit error on analysis failure', async () => {
      const invalidPolicy = { ...samplePolicy, id: '' }; // Invalid policy
      
      const errorSpy = jest.fn<unknown[], unknown>();
      engine.on('policy_analysis_error', errorSpy);

      // This should still work, but let's mock an internal error
      jest.spyOn(engine as any, 'performImpactAssessment').mockRejectedValue(new Error('Analysis failed'));

      await expect(engine.analyzePolicyImpact(invalidPolicy)).rejects.toThrow();
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('Policy Validation', () => {
    beforeEach(async () => {
      await engine.initialize();
    });

    it('should validate policy successfully', async () => {
      const validationResult = await engine.validatePolicy(samplePolicy);

      expect(validationResult).toBeDefined();
      expect(typeof validationResult.validation_passed).toBe('boolean');
      expect(Array.isArray(validationResult.validation_errors)).toBe(true);
      expect(Array.isArray(validationResult.validation_warnings)).toBe(true);
      expect(Array.isArray(validationResult.compliance_violations)).toBe(true);
      expect(Array.isArray(validationResult.recommendations)).toBe(true);
    });

    it('should detect syntax errors', async () => {
      const invalidPolicy: SecurityPolicy = {
        ...samplePolicy,
        id: '', // Missing required field
        policy_rules: [
          {
            rule_id: '',
            rule_type: 'deny',
            conditions: [],
            actions: [],
            exceptions: []
          }
        ]
      };

      const validationResult = await engine.validatePolicy(invalidPolicy);

      expect(validationResult.validation_passed).toBe(false);
      expect(validationResult.validation_errors.length).toBeGreaterThan(0);
      
      const syntaxErrors = validationResult.validation_errors.filter(e => e.error_type === 'syntax');
      expect(syntaxErrors.length).toBeGreaterThan(0);
    });

    it('should detect security validation issues', async () => {
      const insecurePolicy: SecurityPolicy = {
        ...samplePolicy,
        policy_rules: [
          {
            rule_id: 'wildcard_rule',
            rule_type: 'allow',
            conditions: [
              { field: 'resource', operator: 'equals', value: '*' } // Wildcard permission
            ],
            actions: [
              { action_type: 'allow', parameters: {}, notification_enabled: false }
            ],
            exceptions: []
          }
        ]
      };

      const validationResult = await engine.validatePolicy(insecurePolicy);

      // Should detect wildcard permission issue
      const securityErrors = validationResult.validation_errors.filter(e => e.error_type === 'security');
      expect(securityErrors.length).toBeGreaterThan(0);
    });

    it('should validate compliance requirements', async () => {
      const policyWithCompliance: SecurityPolicy = {
        ...samplePolicy,
        category: 'data_protection',
        metadata: {
          ...samplePolicy.metadata,
          compliance_mappings: ['PCI_DSS']
        }
      };

      const validationResult = await engine.validatePolicy(policyWithCompliance);

      expect(validationResult.compliance_violations).toBeDefined();
      // Should have compliance violations since we don't have encryption enabled
      expect(validationResult.compliance_violations.length).toBeGreaterThan(0);
    });

    it('should provide helpful recommendations', async () => {
      const complexPolicy: SecurityPolicy = {
        ...samplePolicy,
        policy_rules: Array.from({ length: 60 }, (_, i) => ({
          rule_id: `rule_${i}`,
          rule_type: 'allow',
          conditions: [{ field: 'test', operator: 'equals', value: i }],
          actions: [{ action_type: 'allow', parameters: {}, notification_enabled: false }],
          exceptions: []
        }))
      };

      const validationResult = await engine.validatePolicy(complexPolicy);

      expect(validationResult.recommendations.length).toBeGreaterThan(0);
      expect(validationResult.recommendations.some(r => r.includes('performance'))).toBe(true);
    });
  });

  describe('Policy Comparison', () => {
    beforeEach(async () => {
      await engine.initialize();
    });

    it('should compare policy versions successfully', async () => {
      const newPolicy: SecurityPolicy = {
        ...samplePolicy,
        version: '1.1.0',
        policy_rules: [
          ...samplePolicy.policy_rules,
          {
            rule_id: 'new_rule',
            rule_type: 'monitor',
            conditions: [{ field: 'activity', operator: 'equals', value: 'login' }],
            actions: [{ action_type: 'log', parameters: {}, notification_enabled: true }],
            exceptions: []
          }
        ]
      };

      const comparison = await engine.comparePolicyVersions(samplePolicy, newPolicy);

      expect(comparison.changes_detected).toBe(true);
      expect(comparison.change_summary.length).toBeGreaterThan(0);
      expect(typeof comparison.impact_delta).toBe('object');
      expect(typeof comparison.risk_change).toBe('number');
      expect(Array.isArray(comparison.recommendations)).toBe(true);
    });

    it('should detect no changes when policies are identical', async () => {
      const identicalPolicy = { ...samplePolicy };

      const comparison = await engine.comparePolicyVersions(samplePolicy, identicalPolicy);

      expect(comparison.changes_detected).toBe(false);
      expect(comparison.change_summary.length).toBe(0);
    });

    it('should calculate impact deltas', async () => {
      const newPolicy: SecurityPolicy = {
        ...samplePolicy,
        enforcement: {
          ...samplePolicy.enforcement,
          enforcement_mode: 'permissive' // Changed from enforcing
        }
      };

      const comparison = await engine.comparePolicyVersions(samplePolicy, newPolicy);

      expect(comparison.impact_delta).toBeDefined();
      expect(typeof comparison.impact_delta.security_impact_delta).toBe('number');
      expect(typeof comparison.impact_delta.performance_impact_delta).toBe('number');
      expect(typeof comparison.impact_delta.compliance_impact_delta).toBe('number');
      expect(typeof comparison.impact_delta.cost_impact_delta).toBe('number');
    });
  });

  describe('Policy Analytics', () => {
    beforeEach(async () => {
      await engine.initialize();
      
      // Generate some analysis history
      await engine.analyzePolicyImpact(samplePolicy);
      
      const anotherPolicy = { ...samplePolicy, id: 'another_policy', category: 'access_control' as const };
      await engine.analyzePolicyImpact(anotherPolicy);
    });

    it('should provide comprehensive analytics', async () => {
      const analytics = engine.getPolicyAnalytics();

      expect(analytics.summary).toBeDefined();
      expect(analytics.summary.total_policies).toBeGreaterThan(0);
      expect(typeof analytics.summary.policies_by_category).toBe('object');
      expect(typeof analytics.summary.policies_by_risk_level).toBe('object');

      expect(analytics.validation_metrics).toBeDefined();
      expect(typeof analytics.validation_metrics.overall_validation_pass_rate).toBe('number');

      expect(analytics.impact_trends).toBeDefined();
      expect(typeof analytics.impact_trends.average_security_impact).toBe('number');
      expect(typeof analytics.impact_trends.average_performance_impact).toBe('number');

      expect(Array.isArray(analytics.recent_analyses)).toBe(true);
    });

    it('should track validation metrics correctly', async () => {
      const analytics = engine.getPolicyAnalytics();

      expect(analytics.validation_metrics.overall_validation_pass_rate).toBeGreaterThanOrEqual(0);
      expect(analytics.validation_metrics.overall_validation_pass_rate).toBeLessThanOrEqual(100);
      
      expect(typeof analytics.validation_metrics.common_validation_errors).toBe('object');
      expect(typeof analytics.validation_metrics.compliance_violation_trends).toBe('object');
    });

    it('should calculate impact trends', async () => {
      const analytics = engine.getPolicyAnalytics();

      expect(analytics.impact_trends.average_security_impact).toBeGreaterThanOrEqual(0);
      expect(analytics.impact_trends.average_security_impact).toBeLessThanOrEqual(100);
      
      expect(analytics.impact_trends.average_performance_impact).toBeGreaterThanOrEqual(0);
      expect(analytics.impact_trends.average_performance_impact).toBeLessThanOrEqual(100);
      
      expect(analytics.impact_trends.average_compliance_score).toBeGreaterThanOrEqual(0);
      expect(analytics.impact_trends.average_compliance_score).toBeLessThanOrEqual(100);
    });

    it('should provide recent analyses', async () => {
      const analytics = engine.getPolicyAnalytics();

      expect(analytics.recent_analyses.length).toBeGreaterThan(0);
      expect(analytics.recent_analyses.length).toBeLessThanOrEqual(10);

      for (const analysis of analytics.recent_analyses) {
        expect(analysis.policy_id).toBeDefined();
        expect(analysis.analysis_id).toBeDefined();
        expect(analysis.timestamp).toBeGreaterThan(0);
      }
    });
  });

  describe('Analysis History', () => {
    beforeEach(async () => {
      await engine.initialize();
    });

    it('should track policy analysis history', async () => {
      // Perform multiple analyses
      await engine.analyzePolicyImpact(samplePolicy, 'pre_deployment');
      await engine.analyzePolicyImpact(samplePolicy, 'post_deployment');
      await engine.analyzePolicyImpact(samplePolicy, 'periodic_review');

      const history = engine.getPolicyAnalysisHistory(samplePolicy.id);

      expect(history.length).toBe(3);
      expect(history[0].analysis_type).toBe('pre_deployment');
      expect(history[1].analysis_type).toBe('post_deployment');
      expect(history[2].analysis_type).toBe('periodic_review');
    });

    it('should limit history size', async () => {
      // Perform more than 10 analyses
      for (let i = 0; i < 15; i++) {
        await engine.analyzePolicyImpact(samplePolicy);
      }

      const history = engine.getPolicyAnalysisHistory(samplePolicy.id);

      expect(history.length).toBeLessThanOrEqual(10);
    });

    it('should return empty history for unknown policy', async () => {
      const history = engine.getPolicyAnalysisHistory('unknown_policy');

      expect(history).toEqual([]);
    });
  });

  describe('Event Handling', () => {
    beforeEach(async () => {
      await engine.initialize();
    });

    it('should handle platform events', async () => {
      // Simulate platform event
      const alertHandler = (mockPlatform.on as jest.Mock).mock.calls
        .find(call => call[0] === 'security_alert')?.[1];

      if (alertHandler) {
        await alertHandler({ severity: 'high', type: 'threat_detected' });
        // Should not throw
      }
    });

    it('should handle optimization engine events', async () => {
      // Simulate optimization engine event
      const optimizationHandler = (mockOptimizationEngine.on as jest.Mock).mock.calls
        .find(call => call[0] === 'recommendation_applied')?.[1];

      if (optimizationHandler) {
        await optimizationHandler({ recommendationId: 'test', result: { success: true } });
        // Should not throw
      }
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      await engine.initialize();
    });

    it('should handle validation errors gracefully', async () => {
      const errorSpy = jest.fn<unknown[], unknown>();
      engine.on('policy_validation_error', errorSpy);

      // Mock validation to throw error
      jest.spyOn(engine as any, 'validatePolicySyntax').mockRejectedValue(new Error('Validation failed'));

      await expect(engine.validatePolicy(samplePolicy)).rejects.toThrow();
      expect(errorSpy).toHaveBeenCalled();
    });

    it('should handle comparison errors gracefully', async () => {
      const errorSpy = jest.fn<unknown[], unknown>();
      engine.on('policy_comparison_error', errorSpy);

      const invalidPolicy = null as any;

      await expect(engine.comparePolicyVersions(samplePolicy, invalidPolicy)).rejects.toThrow();
    });

    it('should emit error events properly', async () => {
      const errorSpy = jest.fn<unknown[], unknown>();
      engine.on('error', errorSpy);

      // Force an error during initialization
      await engine.shutdown();
      
      jest.spyOn(engine as any, 'initializeValidationRules').mockRejectedValue(new Error('Forced error'));

      await expect(engine.initialize()).rejects.toThrow();
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('Configuration', () => {
    it('should respect configuration settings', async () => {
      // Test with simulation disabled
      const configWithoutSimulation: SecurityPolicyConfig = {
        ...config,
        analysis_settings: {
          ...config.analysis_settings,
          impact_simulation_enabled: false
        }
      };

      const engineWithoutSim = new SecurityPolicyAnalysisEngine(
        configWithoutSimulation, 
        mockPlatform, 
        mockOptimizationEngine
      );
      await engineWithoutSim.initialize();

      const analysis = await engineWithoutSim.analyzePolicyImpact(samplePolicy);
      expect(analysis.simulation_results).toBeUndefined();

      await engineWithoutSim.shutdown();
    });

    it('should handle different compliance standards', async () => {
      const configWithDifferentCompliance: SecurityPolicyConfig = {
        ...config,
        validation_framework: {
          ...config.validation_framework,
          compliance_standards: ['HIPAA', 'GDPR']
        }
      };

      const engineWithCompliance = new SecurityPolicyAnalysisEngine(
        configWithDifferentCompliance, 
        mockPlatform, 
        mockOptimizationEngine
      );
      await engineWithCompliance.initialize();

      const validationResult = await engineWithCompliance.validatePolicy(samplePolicy);
      expect(validationResult).toBeDefined();

      await engineWithCompliance.shutdown();
    });
  });

  describe('Shutdown', () => {
    it('should shutdown gracefully', async () => {
      await engine.initialize();

      const shutdownSpy = jest.fn<unknown[], unknown>();
      engine.on('shutdown', shutdownSpy);

      await engine.shutdown();

      expect(shutdownSpy).toHaveBeenCalledWith({
        timestamp: expect.any(Number)
      });
    });
  });
});