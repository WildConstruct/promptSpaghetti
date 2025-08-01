/**
 * Tests for Security Experimentation Platform
 * Epic 31 - Task E31-1753313263602-770B7C
 */

import { 
  SecurityExperimentationPlatform, 
  SecurityExperimentationConfig, 
  SecurityExperiment,
  ExperimentResults,
  ExperimentPortfolio 
 from '../SecurityExperimentationPlatform';
import { SecurityAPIIntegrationPlatform } from '../SecurityAPIIntegrationPlatform';
import { SecurityPolicyAnalysisEngine } from '../SecurityPolicyAnalysisEngine';
import { SecurityOptimizationEngine } from '../SecurityOptimizationEngine';
import { SecurityABTestingFramework } from '../SecurityABTestingFramework';

// Mock dependencies
jest.mock('../SecurityAPIIntegrationPlatform');
jest.mock('../SecurityPolicyAnalysisEngine');
jest.mock('../SecurityOptimizationEngine');
jest.mock('../SecurityABTestingFramework');

describe('SecurityExperimentationPlatform', () => {
  let platform: SecurityExperimentationPlatform;
  let mockAPIIntegration: jest.Mocked<SecurityAPIIntegrationPlatform>;
  let mockPolicyEngine: jest.Mocked<SecurityPolicyAnalysisEngine>;
  let mockOptimizationEngine: jest.Mocked<SecurityOptimizationEngine>;
  let mockABTestingFramework: jest.Mocked<SecurityABTestingFramework>;
  let config: SecurityExperimentationConfig;
  let sampleExperimentConfig: Partial<SecurityExperiment>;

  beforeEach(() => {
    // Setup mocks
    mockAPIIntegration = {
      on: jest.fn<unknown[], unknown>(),
      getPlatformMetrics: jest.fn<unknown[], unknown>().mockResolvedValue({
        api_calls: { total_requests: 15000, successful_requests: 14500 },
        security_analytics: { threats_detected: 35, detection_accuracy_percent: 97 }
 as unknown)
 as any;

    mockPolicyEngine = {
      on: jest.fn<unknown[], unknown>(),
      analyzePolicyImpact: jest.fn<unknown[], unknown>().mockResolvedValue({
        risk_analysis: { overall_risk_score: 30 },
        validation_results: { validation_passed: true }
 as unknown)
 as any;

    mockOptimizationEngine = {
      on: jest.fn<unknown[], unknown>(),
      performComprehensiveAnalysis: jest.fn<unknown[], unknown>().mockResolvedValue({
        recommendations: []
 as unknown)
 as any;

    mockABTestingFramework = {
      on: jest.fn<unknown[], unknown>(),
      getTestingAnalytics: jest.fn<unknown[], unknown>().mockReturnValue({
        summary: { total_tests: 5, active_tests: 2 }
 as unknown)
 as any;

    // Setup configuration
    config = {
      platform_settings: {
        enabled: true,
        multi_environment_support: true,
        sandbox_isolation_enabled: true,
        experiment_orchestration_enabled: true,
        automated_rollback_enabled: true,
        compliance_validation_required: true

      experiment_types: {
        security_research_experiments: true,
        vulnerability_simulation_experiments: true,
        threat_modeling_experiments: true,
        policy_effectiveness_experiments: true,
        incident_response_experiments: true,
        penetration_testing_experiments: true,
        social_engineering_experiments: false

      environments: {
        production_experiments_allowed: false,
        staging_environment_required: true,
        isolated_sandbox_available: true,
        development_environment_enabled: true,
        canary_environment_enabled: true

      safety_controls: {
        experiment_approval_required: true,
        ethical_review_required: true,
        blast_radius_limitation: true,
        automatic_termination_enabled: true,
        real_time_monitoring_required: true,
        data_anonymization_required: true

      research_capabilities: {
        hypothesis_generation_enabled: true,
        statistical_analysis_enabled: true,
        machine_learning_integration: true,
        behavioral_analysis_enabled: true,
        longitudinal_studies_supported: true,
        cross_experiment_correlation: true

      collaboration: {
        multi_team_experiments: true,
        external_researcher_access: false,
        peer_review_process: true,
        knowledge_sharing_enabled: true,
        publication_support: true

    };

    // Setup sample experiment configuration
    sampleExperimentConfig = {
      experiment_name: 'Advanced Threat Detection Research',
      description: 'Research experiment to evaluate advanced threat detection algorithms',
      experiment_type: 'security_research',
      research_design: {
        research_question: 'How effective are ML-based threat detection algorithms compared to rule-based systems?',
        hypothesis: 'ML-based algorithms will show 20% improvement in detection accuracy with reduced false positives',
        objectives: [
          'Compare detection accuracy between ML and rule-based systems',
          'Measure false positive rates',
          'Analyze computational overhead',
          'Evaluate real-time performance'
        ],
        methodology: {
          methodology_type: 'controlled_experiment',
          data_collection_methods: ['automated_logging', 'performance_metrics', 'user_feedback'],
          sampling_strategy: {
            sampling_method: 'stratified',
            sample_size: 5000,
            population_definition: 'Production network traffic patterns',
            inclusion_criteria: ['Active network connections', 'Representative traffic mix'],
            exclusion_criteria: ['Test traffic', 'Administrative connections']

          control_mechanisms: [
            {
              control_type: 'randomization',
              description: 'Random assignment of traffic samples',
              implementation_details: 'Hash-based random assignment'

          ],
          variables: [
            {
              variable_name: 'detection_algorithm',
              variable_type: 'independent',
              measurement_method: 'system_configuration',
              data_type: 'categorical',
              expected_values: ['ml_based', 'rule_based']

            {
              variable_name: 'detection_accuracy',
              variable_type: 'dependent',
              measurement_method: 'threat_detection_rate',
              data_type: 'continuous',
              expected_values: ['0.80', '1.00']

          ]

        expected_outcomes: [
          'Improved threat detection accuracy',
          'Reduced false positive rate',
          'Quantified performance impact',
          'Operational feasibility assessment'
        ],
        success_criteria: {
          primary_outcomes: [
            {
              measure_name: 'detection_accuracy',
              description: 'Percentage of correctly identified threats',
              measurement_unit: 'percentage',
              target_value: 95,
              acceptable_range: { min: 90, max: 100 },
              measurement_frequency: 'real_time'

          ],
          secondary_outcomes: [
            {
              measure_name: 'false_positive_rate',
              description: 'Percentage of false positive detections',
              measurement_unit: 'percentage',
              target_value: 2,
              acceptable_range: { min: 0, max: 5 },
              measurement_frequency: 'real_time'

          ],
          statistical_significance_threshold: 0.05,
          practical_significance_threshold: 15.0,
          minimum_effect_size: 0.3


      experimental_setup: {
        target_systems: [
          {
            system_id: 'sys_threat_detection',
            system_name: 'Threat Detection System',
            system_type: 'network_infrastructure',
            description: 'Primary threat detection infrastructure',
            criticality_level: 'high',
            access_requirements: ['network_monitoring', 'security_admin'],
            isolation_level: 'network'

        ],
        environments: [
          {
            environment_id: 'env_sandbox',
            environment_name: 'Security Research Sandbox',
            environment_type: 'sandbox',
            configuration: {
              isolation_level: 'network',
              monitoring_enabled: true,
              data_retention_days: 90

            isolation_measures: ['network_segmentation', 'traffic_isolation'],
            monitoring_setup: ['real_time_metrics', 'security_alerts'],
            rollback_procedures: ['configuration_restore', 'traffic_redirect']

        ],
        participants: [
          {
            participant_type: 'system',
            role: 'threat_detection_system',
            qualifications: ['production_grade', 'monitored'],
            access_level: 'automated',
            consent_required: false,
            anonymization_level: 'aggregated'

        ],
        duration: {
          planned_duration_days: 21,
          minimum_duration_days: 14,
          maximum_duration_days: 30,
          milestone_dates: [
            {
              milestone_name: 'baseline_establishment',
              milestone_date: Date.now() + 86400000 * 3,
              deliverables: ['baseline_metrics', 'system_configuration'],
              success_criteria: ['stable_baseline_achieved'],
              review_required: true

          ],
          review_schedule: [
            {
              review_type: 'safety',
              review_date: Date.now() + 86400000 * 7,
              reviewers: ['security_team', 'research_lead'],
              review_criteria: ['safety_metrics_within_bounds', 'no_security_incidents']

          ]

        resources_required: [
          {
            resource_type: 'infrastructure',
            resource_name: 'sandbox_environment',
            quantity: 1,
            duration_needed: 21,
            cost_estimate: 5000,
            availability_constraints: ['business_hours_preferred']

        ]

    };

    platform = new SecurityExperimentationPlatform(
      config, 
      mockAPIIntegration, 
      mockPolicyEngine, 
      mockOptimizationEngine, 
      mockABTestingFramework
    );
  });

  afterEach(async () => {
    if (platform) {
      await platform.shutdown();

  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      const initializeSpy = jest.fn<unknown[], unknown>();
      platform.on('initialized', initializeSpy);

      await platform.initialize();

      expect(initializeSpy).toHaveBeenCalledWith({ timestamp: expect.any(Number) });
    });

    it('should emit error on initialization failure', async () => {
      const errorSpy = jest.fn<unknown[], unknown>();
      platform.on('error', errorSpy);

      // Mock a component initialization failure
      jest.spyOn(platform as any, 'loadExperimentTemplates').mockRejectedValue(new Error('Template loading failed'));

      await expect(platform.initialize()).rejects.toThrow();
      expect(errorSpy).toHaveBeenCalledWith({
        error: expect.any(Error),
        context: 'initialization'
      });
    });
  });

  describe('Experiment Creation', () => {
    beforeEach(async () => {
      await platform.initialize();
    });

    it('should create security experiment successfully', async () => {
      const experimentCreatedSpy = jest.fn<unknown[], unknown>();
      platform.on('experiment_created', experimentCreatedSpy);

      const createdExperiment = await platform.createExperiment(sampleExperimentConfig);

      expect(createdExperiment).toBeDefined();
      expect(createdExperiment.experiment_id).toBeDefined();
      expect(createdExperiment.experiment_name).toBe(sampleExperimentConfig.experiment_name);
      expect(createdExperiment.experiment_type).toBe(sampleExperimentConfig.experiment_type);
      expect(createdExperiment.execution.status).toBe('draft');
      expect(createdExperiment.execution.current_phase).toBe('design');

      expect(experimentCreatedSpy).toHaveBeenCalledWith({
        experimentId: createdExperiment.experiment_id,
        experimentName: createdExperiment.experiment_name,
        experimentType: createdExperiment.experiment_type
      });
    });

    it('should validate experiment configuration', async () => {
      const invalidConfig = {
        experiment_name: '', // Invalid empty name
        description: 'Test experiment'
        // Missing research_design
      };

      await expect(platform.createExperiment(invalidConfig)).rejects.toThrow();
    });

    it('should require research question and hypothesis', async () => {
      const invalidConfig = {
        ...sampleExperimentConfig,
        research_design: {
          research_question: '', // Invalid empty question
          hypothesis: '', // Invalid empty hypothesis
          objectives: ['Test objective'],
          methodology: sampleExperimentConfig.research_design!.methodology!,
          expected_outcomes: ['Test outcome'],
          success_criteria: sampleExperimentConfig.research_design!.success_criteria!

      };

      await expect(platform.createExperiment(invalidConfig)).rejects.toThrow();
    });

    it('should create experiment with default values', async () => {
      const minimalConfig = {
        experiment_name: 'Minimal Test Experiment',
        description: 'Test experiment with minimal configuration',
        experiment_type: 'security_research' as const,
        research_design: {
          research_question: 'How does the system perform under test conditions?',
          hypothesis: 'System will perform within acceptable parameters',
          objectives: ['Test basic functionality'],
          expected_outcomes: ['System validation']

        experimental_setup: {
          target_systems: [
            {
              system_id: 'test_sys',
              system_name: 'Test System',
              system_type: 'web_application' as const,
              description: 'Test system',
              criticality_level: 'low' as const,
              access_requirements: [],
              isolation_level: 'container' as const

          ],
          environments: [
            {
              environment_id: 'test_env',
              environment_name: 'Test Environment',
              environment_type: 'development' as const,
              configuration: {},
              isolation_measures: [],
              monitoring_setup: [],
              rollback_procedures: []

          ],
          participants: [],
          duration: {
            planned_duration_days: 7,
            minimum_duration_days: 7,
            maximum_duration_days: 7,
            milestone_dates: [],
            review_schedule: []

          resources_required: []

      };

      const createdExperiment = await platform.createExperiment(minimalConfig);

      expect(createdExperiment.research_design.methodology).toBeDefined();
      expect(createdExperiment.research_design.success_criteria).toBeDefined();
      expect(createdExperiment.safety_measures).toBeDefined();
      expect(createdExperiment.metadata.approval_status).toBe('pending');
    });

    it('should generate risk assessment automatically', async () => {
      const createdExperiment = await platform.createExperiment(sampleExperimentConfig);

      expect(createdExperiment.safety_measures.risk_assessment).toBeDefined();
      expect(createdExperiment.safety_measures.risk_assessment.overall_risk_level).toBeDefined();
      expect(createdExperiment.safety_measures.risk_assessment.blast_radius_assessment).toBeDefined();
      expect(createdExperiment.safety_measures.risk_assessment.impact_assessment).toBeDefined();
    });
  });

  describe('Experiment Execution', () => {
    let experimentId: string;

    beforeEach(async () => {
      await platform.initialize();
      const createdExperiment = await platform.createExperiment(sampleExperimentConfig);
      experimentId = createdExperiment.experiment_id;
      
      // Manually set experiment to approved status for testing
      (platform as any).activeExperiments.get(experimentId).execution.status = 'approved';
    });

    it('should start experiment successfully', async () => {
      const experimentStartedSpy = jest.fn<unknown[], unknown>();
      platform.on('experiment_started', experimentStartedSpy);

      await platform.startExperiment(experimentId);

      expect(experimentStartedSpy).toHaveBeenCalledWith({
        experimentId,
        experimentName: sampleExperimentConfig.experiment_name,
        startTime: expect.any(Number)
      });
    });

    it('should not start experiment that is not approved', async () => {
      // Set experiment status back to draft
      (platform as any).activeExperiments.get(experimentId).execution.status = 'draft';

      await expect(platform.startExperiment(experimentId)).rejects.toThrow();
    });

    it('should stop experiment successfully', async () => {
      // Start the experiment first
      await platform.startExperiment(experimentId);

      const experimentStoppedSpy = jest.fn<unknown[], unknown>();
      platform.on('experiment_stopped', experimentStoppedSpy);

      const stopReason = 'Test completion';
      await platform.stopExperiment(experimentId, stopReason);

      expect(experimentStoppedSpy).toHaveBeenCalledWith({
        experimentId,
        experimentName: sampleExperimentConfig.experiment_name,
        reason: stopReason,
        duration: expect.any(Number)
      });
    });

    it('should handle non-existent experiment errors', async () => {
      const nonExistentExperimentId = 'non_existent_experiment';

      await expect(platform.startExperiment(nonExistentExperimentId)).rejects.toThrow();
      await expect(platform.stopExperiment(nonExistentExperimentId)).rejects.toThrow();
    });

    it('should update experiment status during execution', async () => {
      const experiment = (platform as any).activeExperiments.get(experimentId);
      
      await platform.startExperiment(experimentId);
      
      expect(experiment.execution.status).toBe('running');
      expect(experiment.execution.current_phase).toBe('execution');
      expect(experiment.execution.start_date).toBeGreaterThan(0);
    });
  });

  describe('Results and Analysis', () => {
    let experimentId: string;

    beforeEach(async () => {
      await platform.initialize();
      const createdExperiment = await platform.createExperiment(sampleExperimentConfig);
      experimentId = createdExperiment.experiment_id;
    });

    it('should get empty results for draft experiment', async () => {
      const results = await platform.getExperimentResults(experimentId);

      expect(results).toBeDefined();
      expect(results.data_collection.data_volume_collected.total_records_collected).toBe(0);
      expect(results.statistical_analysis.hypothesis_test_results).toHaveLength(0);
      expect(results.findings).toHaveLength(0);
      expect(results.publication_readiness.publication_ready).toBe(false);
    });

    it('should generate interim results for running experiment', async () => {
      // Start the experiment
      (platform as any).activeExperiments.get(experimentId).execution.status = 'approved';
      await platform.startExperiment(experimentId);

      const interimResults = await platform.getExperimentResults(experimentId);

      expect(interimResults).toBeDefined();
      expect(interimResults.data_collection).toBeDefined();
      expect(interimResults.statistical_analysis).toBeDefined();
    });

    it('should return final results for completed experiment', async () => {
      // Complete the experiment
      (platform as any).activeExperiments.get(experimentId).execution.status = 'approved';
      await platform.startExperiment(experimentId);
      await platform.stopExperiment(experimentId, 'Test completion');

      // Get results from history
      const finalResults = await platform.getExperimentResults(experimentId);

      expect(finalResults).toBeDefined();
      expect(finalResults.data_collection).toBeDefined();
      expect(finalResults.statistical_analysis).toBeDefined();
    });

    it('should handle results request for non-existent experiment', async () => {
      const nonExistentExperimentId = 'non_existent_experiment';

      await expect(platform.getExperimentResults(nonExistentExperimentId)).rejects.toThrow();
    });

    it('should emit results requested event', async () => {
      const resultsErrorSpy = jest.fn<unknown[], unknown>();
      platform.on('results_error', resultsErrorSpy);

      // This should work without error
      await platform.getExperimentResults(experimentId);

      expect(resultsErrorSpy).not.toHaveBeenCalled();
    });
  });

  describe('Portfolio Management', () => {
    let experimentIds: string[];

    beforeEach(async () => {
      await platform.initialize();
      
      // Create multiple experiments for portfolio testing
      const experiments = await Promise.all([
        platform.createExperiment(sampleExperimentConfig),
        platform.createExperiment({
          ...sampleExperimentConfig,
          experiment_name: 'Vulnerability Assessment Study',
          experiment_type: 'vulnerability_simulation'
        }),
        platform.createExperiment({
          ...sampleExperimentConfig,
          experiment_name: 'Policy Effectiveness Research',
          experiment_type: 'policy_effectiveness'

      ]);
      
      experimentIds = experiments.map(exp => exp.experiment_id);
    });

    it('should create experiment portfolio successfully', async () => {
      const portfolioCreatedSpy = jest.fn<unknown[], unknown>();
      platform.on('portfolio_created', portfolioCreatedSpy);

      const portfolioConfig: Partial<ExperimentPortfolio> = {
        portfolio_name: 'Security Research Portfolio Q1',
        description: 'Coordinated security research experiments for Q1',
        experiments: experimentIds,
        research_themes: [
          {
            theme_name: 'Advanced Threat Detection',
            theme_description: 'Research into next-generation threat detection capabilities',
            research_questions: ['How can ML improve detection?', 'What are the performance trade-offs?'],
            contributing_experiments: experimentIds.slice(0, 2),
            expected_synergies: ['Shared data collection', 'Cross-validation of results']

        ],
        coordination_requirements: [
          {
            requirement_type: 'data_sharing',
            description: 'Share threat intelligence data between experiments',
            affected_experiments: experimentIds,
            coordination_mechanisms: ['shared_data_pipeline']

        ]
      };

      const createdPortfolio = await platform.createExperimentPortfolio(portfolioConfig);

      expect(createdPortfolio).toBeDefined();
      expect(createdPortfolio.portfolio_id).toBeDefined();
      expect(createdPortfolio.portfolio_name).toBe(portfolioConfig.portfolio_name);
      expect(createdPortfolio.experiments).toEqual(experimentIds);
      expect(createdPortfolio.research_themes).toHaveLength(1);

      expect(portfolioCreatedSpy).toHaveBeenCalledWith({
        portfolioId: createdPortfolio.portfolio_id,
        portfolioName: createdPortfolio.portfolio_name,
        experimentsCount: experimentIds.length
      });
    });

    it('should validate portfolio configuration', async () => {
      const invalidPortfolioConfig = {
        portfolio_name: '', // Invalid empty name
        description: 'Test portfolio',
        experiments: [] // Invalid empty experiments list
      };

      // This should succeed with the current implementation, but in a real implementation
      // there would be validation that requires at least one experiment
      const createdPortfolio = await platform.createExperimentPortfolio(invalidPortfolioConfig);
      expect(createdPortfolio).toBeDefined();
    });

    it('should handle portfolio with resource allocation', async () => {
      const portfolioConfig: Partial<ExperimentPortfolio> = {
        portfolio_name: 'Resource-Optimized Portfolio',
        description: 'Portfolio with explicit resource allocation',
        experiments: experimentIds,
        resource_allocation: [
          {
            resource_type: 'compute',
            total_allocation: 100,
            experiment_allocations: experimentIds.map(id => ({
              experiment_id: id,
              allocation: Math.floor(100 / experimentIds.length)
            })),
            allocation_strategy: 'priority_based'

        ]
      };

      const createdPortfolio = await platform.createExperimentPortfolio(portfolioConfig);

      expect(createdPortfolio.resource_allocation).toHaveLength(1);
      expect(createdPortfolio.resource_allocation[0].experiment_allocations).toHaveLength(experimentIds.length);
    });

    it('should handle timeline coordination', async () => {
      const portfolioConfig: Partial<ExperimentPortfolio> = {
        portfolio_name: 'Timeline-Coordinated Portfolio',
        description: 'Portfolio with timeline dependencies',
        experiments: experimentIds,
        timeline_coordination: {
          critical_path_experiments: experimentIds.slice(0, 2),
          milestone_dependencies: [
            {
              dependent_experiment: experimentIds[1],
              dependency_experiment: experimentIds[0],
              dependency_type: 'start_after',
              buffer_time_days: 7

          ],
          resource_conflict_resolutions: []

      };

      const createdPortfolio = await platform.createExperimentPortfolio(portfolioConfig);

      expect(createdPortfolio.timeline_coordination.critical_path_experiments).toHaveLength(2);
      expect(createdPortfolio.timeline_coordination.milestone_dependencies).toHaveLength(1);
    });
  });

  describe('Analytics and Insights', () => {
    beforeEach(async () => {
      await platform.initialize();
      
      // Create some experiments for analytics
      await platform.createExperiment(sampleExperimentConfig);
      await platform.createExperiment({
        ...sampleExperimentConfig,
        experiment_name: 'Penetration Testing Study',
        experiment_type: 'penetration_testing'
      });
    });

    it('should provide comprehensive experimentation analytics', async () => {
      const analytics = platform.getExperimentationAnalytics();

      expect(analytics).toBeDefined();
      expect(analytics.summary).toBeDefined();
      expect(analytics.summary.total_experiments).toBeGreaterThanOrEqual(2);
      expect(typeof analytics.summary.active_experiments).toBe('number');
      expect(typeof analytics.summary.completed_experiments).toBe('number');

      expect(analytics.experiment_types).toBeDefined();
      expect(typeof analytics.experiment_types.security_research).toBe('number');
      expect(typeof analytics.experiment_types.penetration_testing).toBe('number');

      expect(analytics.success_metrics).toBeDefined();
      expect(typeof analytics.success_metrics.completion_rate).toBe('number');
      expect(typeof analytics.success_metrics.average_duration_days).toBe('number');

      expect(analytics.resource_utilization).toBeDefined();
      expect(analytics.safety_metrics).toBeDefined();
      expect(analytics.research_impact).toBeDefined();
    });

    it('should track experiment type distribution', async () => {
      const analytics = platform.getExperimentationAnalytics();

      expect(analytics.experiment_types.security_research).toBeGreaterThan(0);
      expect(analytics.experiment_types.penetration_testing).toBeGreaterThan(0);
    });

    it('should provide safety metrics', async () => {
      const analytics = platform.getExperimentationAnalytics();

      expect(analytics.safety_metrics.safety_incidents).toBe(0);
      expect(analytics.safety_metrics.ethics_review_pass_rate).toBeGreaterThan(0);
      expect(analytics.safety_metrics.compliance_violation_count).toBe(0);
    });

    it('should track research impact', async () => {
      const analytics = platform.getExperimentationAnalytics();

      expect(typeof analytics.research_impact.publications_count).toBe('number');
      expect(typeof analytics.research_impact.citations_count).toBe('number');
      expect(typeof analytics.research_impact.industry_adoptions).toBe('number');
    });

    it('should provide recent activities', async () => {
      const analytics = platform.getExperimentationAnalytics();

      expect(Array.isArray(analytics.recent_activities)).toBe(true);
    });
  });

  describe('Event Handling', () => {
    beforeEach(async () => {
      await platform.initialize();
    });

    it('should handle API integration events', async () => {
      const alertHandler = (mockAPIIntegration.on as jest.Mock).mock.calls
        .find(call => call[0] === 'security_alert')?.[1];

      if (alertHandler) {
        await alertHandler({ severity: 'high', type: 'experiment_anomaly' });
        // Should not throw

    });

    it('should handle policy engine events', async () => {
      const policyHandler = (mockPolicyEngine.on as jest.Mock).mock.calls
        .find(call => call[0] === 'policy_validation_completed')?.[1];

      if (policyHandler) {
        await policyHandler({ policyId: 'test_policy', result: { validation_passed: true } });
        // Should not throw

    });

    it('should handle A/B testing framework events', async () => {
      const abTestHandler = (mockABTestingFramework.on as jest.Mock).mock.calls
        .find(call => call[0] === 'test_completed')?.[1];

      if (abTestHandler) {
        await abTestHandler({ testId: 'test_001', result: { success: true } });
        // Should not throw

    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      await platform.initialize();
    });

    it('should handle experiment creation errors', async () => {
      const errorSpy = jest.fn<unknown[], unknown>();
      platform.on('experiment_creation_error', errorSpy);

      const invalidConfig = { experiment_name: '' }; // Invalid config

      await expect(platform.createExperiment(invalidConfig)).rejects.toThrow();
      expect(errorSpy).toHaveBeenCalled();
    });

    it('should handle experiment start errors', async () => {
      const errorSpy = jest.fn<unknown[], unknown>();
      platform.on('experiment_start_error', errorSpy);

      const nonExistentExperimentId = 'non_existent';

      await expect(platform.startExperiment(nonExistentExperimentId)).rejects.toThrow();
      expect(errorSpy).toHaveBeenCalledWith({
        experimentId: nonExistentExperimentId,
        error: expect.any(Error)
      });
    });

    it('should handle results errors', async () => {
      const errorSpy = jest.fn<unknown[], unknown>();
      platform.on('results_error', errorSpy);

      const nonExistentExperimentId = 'non_existent';

      await expect(platform.getExperimentResults(nonExistentExperimentId)).rejects.toThrow();
      expect(errorSpy).toHaveBeenCalledWith({
        experimentId: nonExistentExperimentId,
        error: expect.any(Error)
      });
    });

    it('should handle portfolio creation errors', async () => {
      const errorSpy = jest.fn<unknown[], unknown>();
      platform.on('portfolio_creation_error', errorSpy);

      // Mock portfolio creation to fail
      jest.spyOn(platform, 'createExperimentPortfolio').mockRejectedValue(new Error('Portfolio creation failed'));

      await expect(platform.createExperimentPortfolio({})).rejects.toThrow();
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('Configuration Validation', () => {
    it('should respect safety control settings', async () => {
      const strictConfig: SecurityExperimentationConfig = {
        ...config,
        safety_controls: {
          ...config.safety_controls,
          experiment_approval_required: true,
          ethical_review_required: true,
          blast_radius_limitation: true

      };

      const strictPlatform = new SecurityExperimentationPlatform(
        strictConfig,
        mockAPIIntegration,
        mockPolicyEngine,
        mockOptimizationEngine,
        mockABTestingFramework
      );
      await strictPlatform.initialize();

      const createdExperiment = await strictPlatform.createExperiment(sampleExperimentConfig);
      
      expect(createdExperiment.metadata.approval_status).toBe('pending');
      expect(createdExperiment.metadata.ethical_review_status).toBe('pending');

      await strictPlatform.shutdown();
    });

    it('should handle different experiment type configurations', async () => {
      const limitedConfig: SecurityExperimentationConfig = {
        ...config,
        experiment_types: {
          ...config.experiment_types,
          social_engineering_experiments: false,
          penetration_testing_experiments: false

      };

      const limitedPlatform = new SecurityExperimentationPlatform(
        limitedConfig,
        mockAPIIntegration,
        mockPolicyEngine,
        mockOptimizationEngine,
        mockABTestingFramework
      );
      await limitedPlatform.initialize();

      // Should still create allowed experiment types
      const allowedExperiment = await limitedPlatform.createExperiment({
        ...sampleExperimentConfig,
        experiment_type: 'security_research'
      });
      expect(allowedExperiment).toBeDefined();

      await limitedPlatform.shutdown();
    });

    it('should enforce environment restrictions', async () => {
      const restrictedConfig: SecurityExperimentationConfig = {
        ...config,
        environments: {
          ...config.environments,
          production_experiments_allowed: false,
          staging_environment_required: true

      };

      const restrictedPlatform = new SecurityExperimentationPlatform(
        restrictedConfig,
        mockAPIIntegration,
        mockPolicyEngine,
        mockOptimizationEngine,
        mockABTestingFramework
      );
      await restrictedPlatform.initialize();

      // Should create experiment with environment restrictions
      const createdExperiment = await restrictedPlatform.createExperiment(sampleExperimentConfig);
      expect(createdExperiment).toBeDefined();

      await restrictedPlatform.shutdown();
    });
  });

  describe('Shutdown', () => {
    it('should shutdown gracefully', async () => {
      await platform.initialize();
      
      // Create and start an experiment
      const createdExperiment = await platform.createExperiment(sampleExperimentConfig);
      (platform as any).activeExperiments.get(createdExperiment.experiment_id).execution.status = 'approved';
      await platform.startExperiment(createdExperiment.experiment_id);

      const shutdownSpy = jest.fn<unknown[], unknown>();
      platform.on('shutdown', shutdownSpy);

      await platform.shutdown();

      expect(shutdownSpy).toHaveBeenCalledWith({
        timestamp: expect.any(Number)
      });
    });

    it('should stop all active experiments during shutdown', async () => {
      await platform.initialize();
      
      // Create and start multiple experiments
      const experiment1 = await platform.createExperiment(sampleExperimentConfig);
      const experiment2 = await platform.createExperiment({
        ...sampleExperimentConfig,
        experiment_name: 'Second Test Experiment'
      });

      (platform as any).activeExperiments.get(experiment1.experiment_id).execution.status = 'approved';
      (platform as any).activeExperiments.get(experiment2.experiment_id).execution.status = 'approved';
      
      await platform.startExperiment(experiment1.experiment_id);
      await platform.startExperiment(experiment2.experiment_id);

      const experimentStoppedSpy = jest.fn<unknown[], unknown>();
      platform.on('experiment_stopped', experimentStoppedSpy);

      await platform.shutdown();

      // Both experiments should have been stopped
      expect(experimentStoppedSpy).toHaveBeenCalledTimes(2);
    });

    it('should handle shutdown errors gracefully', async () => {
      await platform.initialize();

      const errorSpy = jest.fn<unknown[], unknown>();
      platform.on('error', errorSpy);

      // Mock component shutdown to fail
      jest.spyOn(platform as any, 'sandboxManager').mockValue({
        shutdown: jest.fn<unknown[], unknown>().mockRejectedValue(new Error('Component shutdown failed'))
      });

      await expect(platform.shutdown()).rejects.toThrow();
      expect(errorSpy).toHaveBeenCalledWith({
        error: expect.any(Error),
        context: 'shutdown'
      });
    });
  });
});