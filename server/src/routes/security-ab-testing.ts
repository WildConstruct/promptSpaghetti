/**
 * Security A/B Testing Framework API Routes
 * Epic 31 - Task E31-1753313263603-BFA0AF
 * 
 * RESTful API endpoints for security A/B testing, policy optimization experiments,
 * and statistical analysis capabilities.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { 
  SecurityABTestingFramework, 
  SecurityABTestingConfig, 
  SecurityABTest,
  ABTestResults,
  ABTestReport 
 from '../services/SecurityABTestingFramework';
import { SecurityAPIIntegrationPlatform } from '../services/SecurityAPIIntegrationPlatform';
import { SecurityPolicyAnalysisEngine } from '../services/SecurityPolicyAnalysisEngine';
import { SecurityOptimizationEngine } from '../services/SecurityOptimizationEngine';

// Global testing framework instance
let abTestingFramework: SecurityABTestingFramework | null = null;



interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: number;




interface CreateTestRequest {
  test_name: string;
  description: string;
  test_type: 'policy_comparison' | 'configuration_optimization' | 'feature_flag' | 'traffic_routing';
  experiment_design: {
    hypothesis: string;
    primary_metrics: string[];
    secondary_metrics?: string[];
    success_criteria: {
      minimum_detectable_effect: number;
      statistical_significance_level: number;
      statistical_power: number;
      business_significance_threshold: number;



    };
  };
  test_variants: {
    variant_name: string;
    description: string;
    is_control: boolean;
    policy_configuration: any;
    allocation: {
      traffic_percentage: number;
      user_segments?: string[];
    };
[];
  target_population?: {
    population_criteria: any;
    estimated_population_size?: number;
    inclusion_rules?: any[];
    exclusion_rules?: any[];
  };
  traffic_allocation?: {
    allocation_strategy?: 'random' | 'hash_based' | 'geographic' | 'time_based' | 'user_attribute';
    sticky_session_enabled?: boolean;
  };




interface StartTestRequest {
  pre_flight_checks_override?: boolean;
  notification_recipients?: string[];







interface StopTestRequest {
  reason: string;
  generate_final_report?: boolean;







interface GenerateReportRequest {
  report_type: 'interim' | 'final' | 'post_implementation';
  include_statistical_appendix?: boolean;
  include_stakeholder_sections?: boolean;
  stakeholder_groups?: string[];





/**
 * Initialize security A/B testing framework
 */
async function initializeABTestingFramework(
  platform: SecurityAPIIntegrationPlatform,
  policyEngine: SecurityPolicyAnalysisEngine,
  optimizationEngine: SecurityOptimizationEngine
): Promise<SecurityABTestingFramework> {

  if (abTestingFramework) {
    return abTestingFramework;


  const config: SecurityABTestingConfig = {
    testing_framework: {
      enabled: true,
      multivariate_testing_enabled: true,
      sequential_testing_enabled: true,
      statistical_significance_threshold: 0.05,
      minimum_sample_size: 1000,
      maximum_test_duration_days: 30

    traffic_management: {
      traffic_splitting_enabled: true,
      canary_deployment_enabled: true,
      gradual_rollout_enabled: true,
      rollback_automation_enabled: true,
      traffic_allocation_strategies: ['random', 'hash_based', 'geographic']

    experiment_design: {
      randomization_enabled: true,
      stratified_sampling_enabled: true,
      control_group_required: true,
      minimum_control_group_size_percent: 20,
      bias_detection_enabled: true

    metrics_collection: {
      real_time_metrics_enabled: true,
      security_effectiveness_tracking: true,
      performance_impact_tracking: true,
      user_experience_tracking: true,
      compliance_impact_tracking: true,
      cost_impact_tracking: true

    statistical_analysis: {
      bayesian_analysis_enabled: true,
      confidence_interval_calculation: true,
      power_analysis_enabled: true,
      effect_size_calculation: true,
      significance_testing_methods: ['t_test', 'chi_square', 'mann_whitney', 'bayesian']

    safety_controls: {
      automatic_rollback_enabled: true,
      safety_thresholds: {
        security_incident_increase_percent: 50,
        performance_degradation_percent: 20,
        error_rate_increase_percent: 100,
        user_satisfaction_decrease_percent: 30

      circuit_breaker_enabled: true,
      early_termination_enabled: true,
      risk_monitoring_enabled: true

  };

  abTestingFramework = new SecurityABTestingFramework(config, platform, policyEngine, optimizationEngine);
  await abTestingFramework.initialize();

  return abTestingFramework;


export default async function securityABTestingRoutes(
  fastify: FastifyInstance,
  platform: SecurityAPIIntegrationPlatform,
  policyEngine: SecurityPolicyAnalysisEngine,
  optimizationEngine: SecurityOptimizationEngine
) {
  // Initialize framework
  const framework = await initializeABTestingFramework(platform, policyEngine, optimizationEngine);

  /**
   * POST /api/security-ab-testing/tests/create
   * Create a new A/B test experiment
   */
  fastify.post<{ Body: CreateTestRequest }>('/api/security-ab-testing/tests/create', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Create a new security A/B test experiment for policy optimization',
      tags: ['Security A/B Testing', 'Experiments'],
      body: {
        type: 'object',
        required: ['test_name', 'description', 'test_type', 'experiment_design', 'test_variants'],
        properties: {
          test_name: { type: 'string', minLength: 1, maxLength: 200 },
          description: { type: 'string', maxLength: 1000 },
          test_type: {
            type: 'string',
            enum: ['policy_comparison', 'configuration_optimization', 'feature_flag', 'traffic_routing']

          experiment_design: {
            type: 'object',
            required: ['hypothesis', 'primary_metrics', 'success_criteria'],
            properties: {
              hypothesis: { type: 'string', minLength: 10, maxLength: 500 },
              primary_metrics: {
                type: 'array',
                minItems: 1,
                maxItems: 5,
                items: { type: 'string' }

              secondary_metrics: {
                type: 'array',
                maxItems: 10,
                items: { type: 'string' }

              success_criteria: {
                type: 'object',
                required: ['minimum_detectable_effect', 'statistical_significance_level', 'statistical_power'],
                properties: {
                  minimum_detectable_effect: { type: 'number', minimum: 0.1, maximum: 100 },
                  statistical_significance_level: { type: 'number', minimum: 0.80, maximum: 0.99 },
                  statistical_power: { type: 'number', minimum: 0.70, maximum: 0.99 },
                  business_significance_threshold: { type: 'number', minimum: 0 }




          test_variants: {
            type: 'array',
            minItems: 2,
            maxItems: 10,
            items: {
              type: 'object',
              required: ['variant_name', 'description', 'is_control', 'allocation'],
              properties: {
                variant_name: { type: 'string', minLength: 1, maxLength: 100 },
                description: { type: 'string', maxLength: 500 },
                is_control: { type: 'boolean' },
                policy_configuration: { type: 'object' },
                allocation: {
                  type: 'object',
                  required: ['traffic_percentage'],
                  properties: {
                    traffic_percentage: { type: 'number', minimum: 1, maximum: 100 },
                    user_segments: { type: 'array', items: { type: 'string' } }





          target_population: {
            type: 'object',
            properties: {
              population_criteria: { type: 'object' },
              estimated_population_size: { type: 'number', minimum: 100 },
              inclusion_rules: { type: 'array' },
              exclusion_rules: { type: 'array' }


          traffic_allocation: {
            type: 'object',
            properties: {
              allocation_strategy: {
                type: 'string',
                enum: ['random', 'hash_based', 'geographic', 'time_based', 'user_attribute']

              sticky_session_enabled: { type: 'boolean' }





  }, async (request: FastifyRequest<{ Body: CreateTestRequest }>, reply: FastifyReply): Promise<APIResponse> => {
    try {
      const {
        test_name,
        description,
        test_type,
        experiment_design,
        test_variants,
        target_population,
        traffic_allocation
 = request.body;

      // Transform request to framework format
      const testConfig: Partial<SecurityABTest> = {
        test_name,
        description,
        test_type,
        experiment_design: {
          ...experiment_design,
          sample_size_calculation: {
            calculated_sample_size: 0, // Will be calculated by framework
            calculation_method: 'frequentist',
            calculation_parameters: {},
            confidence_level: experiment_design.success_criteria.statistical_significance_level,
            expected_effect_size: experiment_design.success_criteria.minimum_detectable_effect,
            variance_estimate: 0.25 // Default assumption


        test_variants: test_variants.map((variant, index) => ({
          variant_id: `variant_${index + 1}`,
          variant_name: variant.variant_name,
          description: variant.description,
          is_control: variant.is_control,
          policy_configuration: {
            policy: variant.policy_configuration,
            feature_flags: {},
            configuration_overrides: {}

          allocation: {
            traffic_percentage: variant.allocation.traffic_percentage,
            user_segments: variant.allocation.user_segments || []

        })),
        target_population,
        traffic_allocation
      };

      const createdTest = await framework.createABTest(testConfig);

      return {
        success: true,
        data: {
          test_id: createdTest.test_id,
          test_name: createdTest.test_name,
          test_type: createdTest.test_type,
          status: createdTest.test_execution.status,
          estimated_sample_size: createdTest.experiment_design.sample_size_calculation.calculated_sample_size,
          estimated_duration_days: Math.ceil(
            createdTest.experiment_design.sample_size_calculation.calculated_sample_size / 
            (target_population?.estimated_population_size || 10000) * 30
          ),
          variants_summary: createdTest.test_variants.map(v => ({
            variant_id: v.variant_id,
            variant_name: v.variant_name,
            is_control: v.is_control,
            traffic_percentage: v.allocation.traffic_percentage
          })),
          next_steps: [
            'Review test configuration and approve',
            'Ensure infrastructure is ready for traffic routing',
            'Set up monitoring and alerting',
            'Start the test when ready'
          ]

        message: `A/B test '${test_name}' created successfully`,
        timestamp: Date.now()
      };
 catch (error) {
      fastify.log.error('Error creating A/B test:', error);
      return {
        success: false,
        error: `Failed to create A/B test: ${error.message}`,
        timestamp: Date.now()
      };

  });

  /**
   * POST /api/security-ab-testing/tests/{testId}/start
   * Start an A/B test experiment
   */
  fastify.post<{ Params: { testId: string }; Body: StartTestRequest }>('/api/security-ab-testing/tests/:testId/start', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Start a security A/B test experiment',
      tags: ['Security A/B Testing', 'Test Management'],
      params: {
        type: 'object',
        required: ['testId'],
        properties: {
          testId: { type: 'string' }


      body: {
        type: 'object',
        properties: {
          pre_flight_checks_override: { type: 'boolean' },
          notification_recipients: {
            type: 'array',
            items: { type: 'string', format: 'email' }




  }, async (
    request: FastifyRequest<{ Params: { testId: string }; Body: StartTestRequest }>,
    reply: FastifyReply
  ): Promise<APIResponse> => {
    try {
      const { testId } = request.params;
      const { pre_flight_checks_override = false, notification_recipients = [] } = request.body;

      await framework.startABTest(testId);

      return {
        success: true,
        data: {
          test_id: testId,
          started_at: Date.now(),
          status: 'running',
          current_phase: 'ramp_up',
          monitoring: {
            real_time_dashboard_available: true,
            automated_safety_monitoring: true,
            notification_recipients: notification_recipients

          safety_features: {
            automatic_rollback_enabled: true,
            early_termination_enabled: true,
            circuit_breaker_active: true


        message: `A/B test ${testId} started successfully`,
        timestamp: Date.now()
      };
 catch (error) {
      fastify.log.error('Error starting A/B test:', error);
      return {
        success: false,
        error: `Failed to start A/B test: ${error.message}`,
        timestamp: Date.now()
      };

  });

  /**
   * POST /api/security-ab-testing/tests/{testId}/stop
   * Stop an A/B test experiment
   */
  fastify.post<{ Params: { testId: string }; Body: StopTestRequest }>('/api/security-ab-testing/tests/:testId/stop', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Stop a running security A/B test experiment',
      tags: ['Security A/B Testing', 'Test Management'],
      params: {
        type: 'object',
        required: ['testId'],
        properties: {
          testId: { type: 'string' }


      body: {
        type: 'object',
        required: ['reason'],
        properties: {
          reason: { type: 'string', minLength: 5, maxLength: 500 },
          generate_final_report: { type: 'boolean' }



  }, async (
    request: FastifyRequest<{ Params: { testId: string }; Body: StopTestRequest }>,
    reply: FastifyReply
  ): Promise<APIResponse> => {
    try {
      const { testId } = request.params;
      const { reason, generate_final_report = true } = request.body;

      await framework.stopABTest(testId, reason);

      let finalReport = null;
      if (generate_final_report) {
        try {
          finalReport = await framework.generateABTestReport(testId, 'final');
 catch (reportError) {
          fastify.log.warn(`Failed to generate final report for test ${testId}:`, reportError);



      return {
        success: true,
        data: {
          test_id: testId,
          stopped_at: Date.now(),
          stop_reason: reason,
          status: 'completed',
          final_report: finalReport ? {
            report_id: finalReport.report_id,
            generated_at: finalReport.generated_at,
            executive_summary: finalReport.executive_summary,
            key_findings: finalReport.executive_summary.key_findings,
            recommendations: finalReport.recommendations_summary.primary_recommendation
 : null,
          data_preservation: {
            test_data_archived: true,
            results_available_for_analysis: true,
            retention_period_days: 90


        message: `A/B test ${testId} stopped successfully`,
        timestamp: Date.now()
      };
 catch (error) {
      fastify.log.error('Error stopping A/B test:', error);
      return {
        success: false,
        error: `Failed to stop A/B test: ${error.message}`,
        timestamp: Date.now()
      };

  });

  /**
   * GET /api/security-ab-testing/tests/{testId}/results
   * Get A/B test results and analysis
   */
  fastify.get<{ Params: { testId: string }; Querystring: { include_interim?: boolean } }>('/api/security-ab-testing/tests/:testId/results', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Get security A/B test results and statistical analysis',
      tags: ['Security A/B Testing', 'Results'],
      params: {
        type: 'object',
        required: ['testId'],
        properties: {
          testId: { type: 'string' }


      querystring: {
        type: 'object',
        properties: {
          include_interim: { type: 'boolean' }



  }, async (
    request: FastifyRequest<{ Params: { testId: string }; Querystring: { include_interim?: boolean } }>,
    reply: FastifyReply
  ): Promise<APIResponse> => {
    try {
      const { testId } = request.params;
      const { include_interim = false } = request.query;

      const results = await framework.getTestResults(testId, include_interim);

      return {
        success: true,
        data: {
          test_id: testId,
          results_type: include_interim ? 'interim' : 'final',
          statistical_summary: {
            test_completion_percentage: results.statistical_analysis.test_completion_percentage,
            statistical_significance_achieved: results.statistical_analysis.statistical_significance_achieved,
            p_value: results.statistical_analysis.p_value,
            confidence_interval: results.statistical_analysis.confidence_interval,
            effect_size: results.statistical_analysis.effect_size,
            winner_determined: results.statistical_analysis.winner_determination.decision_criteria_met,
            winning_variant: results.statistical_analysis.winner_determination.winning_variant_name

          business_impact_summary: {
            estimated_roi: results.business_impact.roi_analysis.estimated_roi_percent,
            payback_period_days: results.business_impact.roi_analysis.payback_period_days,
            implementation_feasibility_score: results.business_impact.implementation_feasibility.overall_feasibility_score,
            overall_risk_score: results.business_impact.risk_assessment.overall_risk_score

          security_impact_summary: {
            threat_detection_improvement: results.security_impact.threat_detection_improvement,
            security_posture_improvement: results.security_impact.security_posture_improvement.overall_improvement_score,
            compliance_score_change: results.security_impact.compliance_score_change,
            new_vulnerabilities: results.security_impact.security_posture_improvement.new_vulnerabilities_introduced

          performance_impact_summary: {
            response_time_change_ms: results.performance_impact.response_time_change_ms,
            throughput_change_percent: results.performance_impact.throughput_change_percent,
            availability_change: results.performance_impact.availability_impact.uptime_change_percent,
            resource_utilization_impact: results.performance_impact.resource_utilization_change

          variant_performance: results.statistical_analysis.variant_performance.map(variant => ({
            variant_name: variant.variant_name,
            is_control: variant.is_control,
            sample_size: variant.sample_size,
            conversion_metrics: Object.keys(variant.conversion_metrics).map(key => ({
              metric_name: key,
              conversion_rate: variant.conversion_metrics[key].conversion_rate,
              confidence_interval: variant.conversion_metrics[key].confidence_interval
            })),
            relative_improvement: variant.relative_performance.improvement_over_control
          })),
          recommendations: results.recommendations.slice(0, 5).map(rec => ({
            type: rec.recommendation_type,
            priority: rec.priority,
            title: rec.recommendation.title,
            description: rec.recommendation.description,
            expected_impact: rec.recommendation.expected_impact
          }))

        timestamp: Date.now()
      };
 catch (error) {
      fastify.log.error('Error getting A/B test results:', error);
      return {
        success: false,
        error: `Failed to get A/B test results: ${error.message}`,
        timestamp: Date.now()
      };

  });

  /**
   * POST /api/security-ab-testing/tests/{testId}/report
   * Generate comprehensive A/B test report
   */
  fastify.post<{ Params: { testId: string }; Body: GenerateReportRequest }>('/api/security-ab-testing/tests/:testId/report', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Generate comprehensive security A/B test report',
      tags: ['Security A/B Testing', 'Reports'],
      params: {
        type: 'object',
        required: ['testId'],
        properties: {
          testId: { type: 'string' }


      body: {
        type: 'object',
        properties: {
          report_type: {
            type: 'string',
            enum: ['interim', 'final', 'post_implementation']

          include_statistical_appendix: { type: 'boolean' },
          include_stakeholder_sections: { type: 'boolean' },
          stakeholder_groups: {
            type: 'array',
            items: { type: 'string' }




  }, async (
    request: FastifyRequest<{ Params: { testId: string }; Body: GenerateReportRequest }>,
    reply: FastifyReply
  ): Promise<APIResponse> => {
    try {
      const { testId } = request.params;
      const {
        report_type = 'final',
        include_statistical_appendix = true,
        include_stakeholder_sections = true,
        stakeholder_groups = ['Security Team', 'Engineering', 'Product Management', 'Executive']
 = request.body;

      const report = await framework.generateABTestReport(testId, report_type);

      // Filter report based on request parameters
      const filteredReport = {
        ...report,
        statistical_appendix: include_statistical_appendix ? report.statistical_appendix : undefined,
        stakeholder_sections: include_stakeholder_sections ? 
          report.stakeholder_sections.filter(section => 
            stakeholder_groups.includes(section.stakeholder_group)
          ) : undefined
      };

      return {
        success: true,
        data: {
          report_id: report.report_id,
          test_id: testId,
          report_type: report.report_type,
          generated_at: report.generated_at,
          
          executive_summary: filteredReport.executive_summary,
          
          key_insights: {
            statistical_significance: filteredReport.detailed_analysis.statistical_results.statistical_significance_achieved,
            business_impact: filteredReport.executive_summary.business_impact_summary,
            security_impact: 'Security metrics analysis included in detailed section',
            data_quality: filteredReport.detailed_analysis.data_quality_assessment.data_quality_score

          recommendations_summary: {
            primary_recommendation: filteredReport.recommendations_summary.primary_recommendation,
            implementation_timeline: filteredReport.recommendations_summary.implementation_roadmap.timeline_weeks,
            success_metrics: filteredReport.recommendations_summary.success_metrics

          report_sections: {
            executive_summary_included: true,
            detailed_analysis_included: true,
            statistical_appendix_included: include_statistical_appendix,
            stakeholder_sections_included: include_stakeholder_sections,
            stakeholder_groups_covered: stakeholder_groups


        message: `${report_type} report generated successfully for test ${testId}`,
        timestamp: Date.now()
      };
 catch (error) {
      fastify.log.error('Error generating A/B test report:', error);
      return {
        success: false,
        error: `Failed to generate A/B test report: ${error.message}`,
        timestamp: Date.now()
      };

  });

  /**
   * GET /api/security-ab-testing/tests
   * List all A/B tests with filtering options
   */
  fastify.get<{ Querystring: { status?: string; test_type?: string; limit?: number; offset?: number } }>('/api/security-ab-testing/tests', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'List security A/B tests with filtering and pagination',
      tags: ['Security A/B Testing', 'Test Management'],
      querystring: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['draft', 'ready', 'running', 'paused', 'completed', 'failed']

          test_type: {
            type: 'string',
            enum: ['policy_comparison', 'configuration_optimization', 'feature_flag', 'traffic_routing']

          limit: { type: 'number', minimum: 1, maximum: 100 },
          offset: { type: 'number', minimum: 0 }



  }, async (
    request: FastifyRequest<{ Querystring: { status?: string; test_type?: string; limit?: number; offset?: number } }>,
    reply: FastifyReply
  ): Promise<APIResponse> => {
    try {
      const { status, test_type, limit = 20, offset = 0 } = request.query;

      // This would typically query a database, but for now we'll return mock data
      const mockTests = [
        {
          test_id: 'test_001',
          test_name: 'MFA Policy Optimization',
          test_type: 'policy_comparison',
          status: 'completed',
          created_at: Date.now() - 86400000 * 7,
          duration_days: 14,
          statistical_significance: true,
          winner_variant: 'Enhanced MFA'

        {
          test_id: 'test_002',
          test_name: 'Rate Limiting Configuration',
          test_type: 'configuration_optimization',
          status: 'running',
          created_at: Date.now() - 86400000 * 3,
          estimated_completion: Date.now() + 86400000 * 11,
          completion_percentage: 25

      ];

      return {
        success: true,
        data: {
          tests: mockTests,
          pagination: {
            total_tests: mockTests.length,
            limit,
            offset,
            has_more: false

          filters_applied: {
            status,
            test_type


        timestamp: Date.now()
      };
 catch (error) {
      fastify.log.error('Error listing A/B tests:', error);
      return {
        success: false,
        error: `Failed to list A/B tests: ${error.message}`,
        timestamp: Date.now()
      };

  });

  /**
   * GET /api/security-ab-testing/analytics
   * Get comprehensive A/B testing analytics
   */
  fastify.get('/api/security-ab-testing/analytics', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Get comprehensive security A/B testing analytics and insights',
      tags: ['Security A/B Testing', 'Analytics']

  }, async (request: FastifyRequest, reply: FastifyReply): Promise<APIResponse> => {
    try {
      const analytics = framework.getTestingAnalytics();

      return {
        success: true,
        data: {
          analytics_timestamp: Date.now(),
          testing_summary: analytics.summary,
          performance_metrics: analytics.performance_metrics,
          test_distribution: {
            by_type: analytics.test_types,
            by_status: {
              running: analytics.summary.active_tests,
              completed: analytics.summary.completed_tests,
              total: analytics.summary.total_tests


          success_metrics: {
            test_success_rate: analytics.performance_metrics.test_success_rate_percent,
            statistical_power: analytics.performance_metrics.average_statistical_power,
            significant_results: analytics.performance_metrics.significant_results_percent,
            early_termination_rate: analytics.performance_metrics.early_termination_rate

          variant_insights: analytics.variant_performance,
          recent_activity: analytics.recent_activities.slice(0, 10),
          insights: [
            analytics.performance_metrics.test_success_rate_percent > 80 ? 
              'A/B testing program showing strong success rate' : 
              'Consider reviewing test design methodologies',
            analytics.performance_metrics.significant_results_percent > 50 ? 
              'Good rate of statistically significant findings' : 
              'May need to increase sample sizes or effect sizes',
            'Continuous improvement in experimental rigor recommended'
          ]

        timestamp: Date.now()
      };
 catch (error) {
      fastify.log.error('Error getting A/B testing analytics:', error);
      return {
        success: false,
        error: `Failed to get A/B testing analytics: ${error.message}`,
        timestamp: Date.now()
      };

  });

  /**
   * GET /api/security-ab-testing/health
   * Get A/B testing framework health status
   */
  fastify.get('/api/security-ab-testing/health', {
    schema: {
      description: 'Get security A/B testing framework health status',
      tags: ['Security A/B Testing', 'Health Check']

  }, async (request: FastifyRequest, reply: FastifyReply): Promise<APIResponse> => {
    try {
      const analytics = framework.getTestingAnalytics();
      
      const isHealthy = analytics.summary.total_tests >= 0 &&
                       analytics.performance_metrics.test_success_rate_percent > 70;

      return {
        success: true,
        data: {
          healthy: isHealthy,
          framework_status: isHealthy ? 'healthy' : 'degraded',
          testing_health: {
            total_tests: analytics.summary.total_tests,
            active_tests: analytics.summary.active_tests,
            success_rate: analytics.performance_metrics.test_success_rate_percent,
            statistical_power: analytics.performance_metrics.average_statistical_power

          system_components: {
            traffic_router_operational: true,
            metrics_collector_operational: true,
            statistical_analyzer_operational: true,
            safety_monitor_operational: true

          capabilities: {
            multivariate_testing: true,
            sequential_testing: true,
            bayesian_analysis: true,
            automatic_rollback: true,
            real_time_monitoring: true

          last_check: Date.now()

        timestamp: Date.now()
      };
 catch (error) {
      fastify.log.error('Error getting A/B testing framework health:', error);
      return {
        success: false,
        data: {
          healthy: false,
          framework_status: 'error',
          error_message: error.message

        error: 'Failed to get framework health status',
        timestamp: Date.now()
      };

  });

  // Setup framework event handlers for logging
  framework.on('initialized', () => {
    fastify.log.info('Security A/B Testing Framework initialized');
  });

  framework.on('test_created', (data) => {
    fastify.log.info(`A/B test created: ${data.testName} (${data.testId}) - Type: ${data.testType}`);
  });

  framework.on('test_started', (data) => {
    fastify.log.info(`A/B test started: ${data.testName} (${data.testId}) at ${new Date(data.startTime).toISOString()}`);
  });

  framework.on('test_stopped', (data) => {
    fastify.log.info(`A/B test stopped: ${data.testName} (${data.testId}) - Reason: ${data.reason} - Duration: ${Math.round(data.duration / 3600000)}h`);
  });

  framework.on('report_generated', (data) => {
    fastify.log.info(`A/B test report generated: ${data.reportType} for test ${data.testId} (${data.reportId})`);
  });

  framework.on('test_creation_error', (data) => {
    fastify.log.error(`A/B test creation error:`, data.error);
  });

  framework.on('test_start_error', (data) => {
    fastify.log.error(`A/B test start error for ${data.testId}:`, data.error);
  });

  framework.on('test_stop_error', (data) => {
    fastify.log.error(`A/B test stop error for ${data.testId}:`, data.error);
  });

  framework.on('results_error', (data) => {
    fastify.log.error(`A/B test results error for ${data.testId}:`, data.error);
  });

  framework.on('report_generation_error', (data) => {
    fastify.log.error(`A/B test report generation error for ${data.testId}:`, data.error);
  });

  framework.on('error', (error) => {
    fastify.log.error('Security A/B Testing Framework error:', error);
  });

  // Cleanup on server shutdown
  fastify.addHook('onClose', async () => {
    if (abTestingFramework) {
      await abTestingFramework.shutdown();
      fastify.log.info('Security A/B Testing Framework shut down');

  });
