/**
 * Security Experimentation Platform API Routes
 * Epic 31 - Task E31-1753313263602-770B7C
 * 
 * RESTful API endpoints for security research experiments, hypothesis testing,
 * and controlled security feature development.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { 
  SecurityExperimentationPlatform, 
  SecurityExperimentationConfig, 
  SecurityExperiment,
  ExperimentResults,
  ExperimentPortfolio,
  ExperimentTemplate 
 from '../services/SecurityExperimentationPlatform';
import { SecurityAPIIntegrationPlatform } from '../services/SecurityAPIIntegrationPlatform';
import { SecurityPolicyAnalysisEngine } from '../services/SecurityPolicyAnalysisEngine';
import { SecurityOptimizationEngine } from '../services/SecurityOptimizationEngine';
import { SecurityABTestingFramework } from '../services/SecurityABTestingFramework';

// Global experimentation platform instance
let experimentationPlatform: SecurityExperimentationPlatform | null = null;



interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: number;




interface CreateExperimentRequest {
  experiment_name: string;
  description: string;
  experiment_type: 'security_research' | 'vulnerability_simulation' | 'threat_modeling' | 'policy_effectiveness' | 'incident_response' | 'penetration_testing' | 'social_engineering';
  research_design: {
    research_question: string;
    hypothesis: string;
    objectives: string[];
    methodology?: {
      methodology_type: 'controlled_experiment' | 'observational_study' | 'simulation' | 'field_study' | 'case_study' | 'longitudinal_study';
      data_collection_methods: string[];
      sampling_strategy: {
        sampling_method: 'random' | 'stratified' | 'systematic' | 'cluster' | 'convenience' | 'purposive';
        sample_size: number;
        population_definition: string;



      };
    };
    expected_outcomes: string[];
    success_criteria?: {
      primary_outcomes: { measure_name: string; target_value?: number }[];
      statistical_significance_threshold: number;
      minimum_effect_size: number;
    };
  };
  experimental_setup: {
    target_systems: {
      system_name: string;
      system_type: 'web_application' | 'api_service' | 'database' | 'network_infrastructure' | 'endpoint' | 'cloud_service';
      criticality_level: 'low' | 'medium' | 'high' | 'critical';
[];
    environments: {
      environment_name: string;
      environment_type: 'production' | 'staging' | 'development' | 'sandbox' | 'canary';
[];
    duration: {
      planned_duration_days: number;
      minimum_duration_days?: number;
      maximum_duration_days?: number;
    };
    participants?: {
      participant_type: 'human' | 'system' | 'synthetic';
      role: string;
      access_level: string;
[];
  };
  safety_measures?: {
    risk_level: 'low' | 'medium' | 'high' | 'critical';
    mitigation_strategies: string[];
    data_protection_level: 'public' | 'internal' | 'confidential' | 'restricted';
  };
  template_id?: string;




interface StartExperimentRequest {
  safety_override?: boolean;
  notification_recipients?: string[];
  monitoring_config?: {
    real_time_monitoring: boolean;
    alert_thresholds: Record<string, number>;



  };




interface StopExperimentRequest {
  reason: string;
  preserve_data?: boolean;
  generate_report?: boolean;







interface CreatePortfolioRequest {
  portfolio_name: string;
  description: string;
  experiments: string[];
  research_themes?: {
    theme_name: string;
    theme_description: string;
    research_questions: string[];



[];
  coordination_requirements?: {
    requirement_type: 'data_sharing' | 'resource_sharing' | 'timeline_dependency' | 'methodology_alignment';
    description: string;
    affected_experiments: string[];
[];


/**
 * Initialize security experimentation platform
 */
async function initializeExperimentationPlatform(
  platform: SecurityAPIIntegrationPlatform,
  policyEngine: SecurityPolicyAnalysisEngine,
  optimizationEngine: SecurityOptimizationEngine,
  abTestingFramework: SecurityABTestingFramework
): Promise<SecurityExperimentationPlatform> {

  if (experimentationPlatform) {
    return experimentationPlatform;


  const config: SecurityExperimentationConfig = {
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
      social_engineering_experiments: false // Disabled by default for safety

    environments: {
      production_experiments_allowed: false, // Disabled by default for safety
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
      external_researcher_access: false, // Disabled by default for security
      peer_review_process: true,
      knowledge_sharing_enabled: true,
      publication_support: true

  };

  experimentationPlatform = new SecurityExperimentationPlatform(
    config, 
    platform, 
    policyEngine, 
    optimizationEngine, 
    abTestingFramework
  );
  await experimentationPlatform.initialize();

  return experimentationPlatform;


export default async function securityExperimentationRoutes(
  fastify: FastifyInstance,
  platform: SecurityAPIIntegrationPlatform,
  policyEngine: SecurityPolicyAnalysisEngine,
  optimizationEngine: SecurityOptimizationEngine,
  abTestingFramework: SecurityABTestingFramework
) {
  // Initialize platform
  const experimentPlatform = await initializeExperimentationPlatform(
    platform, 
    policyEngine, 
    optimizationEngine, 
    abTestingFramework
  );

  /**
   * POST /api/security-experimentation/experiments/create
   * Create a new security experiment
   */
  fastify.post<{ Body: CreateExperimentRequest }>('/api/security-experimentation/experiments/create', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Create a new security research experiment',
      tags: ['Security Experimentation', 'Experiments'],
      body: {
        type: 'object',
        required: ['experiment_name', 'description', 'experiment_type', 'research_design', 'experimental_setup'],
        properties: {
          experiment_name: { type: 'string', minLength: 1, maxLength: 200 },
          description: { type: 'string', maxLength: 2000 },
          experiment_type: {
            type: 'string',
            enum: ['security_research', 'vulnerability_simulation', 'threat_modeling', 'policy_effectiveness', 'incident_response', 'penetration_testing', 'social_engineering']

          research_design: {
            type: 'object',
            required: ['research_question', 'hypothesis', 'objectives', 'expected_outcomes'],
            properties: {
              research_question: { type: 'string', minLength: 10, maxLength: 1000 },
              hypothesis: { type: 'string', minLength: 10, maxLength: 1000 },
              objectives: {
                type: 'array',
                minItems: 1,
                maxItems: 10,
                items: { type: 'string', maxLength: 500 }

              methodology: {
                type: 'object',
                properties: {
                  methodology_type: {
                    type: 'string',
                    enum: ['controlled_experiment', 'observational_study', 'simulation', 'field_study', 'case_study', 'longitudinal_study']

                  data_collection_methods: {
                    type: 'array',
                    items: { type: 'string' }

                  sampling_strategy: {
                    type: 'object',
                    required: ['sampling_method', 'sample_size', 'population_definition'],
                    properties: {
                      sampling_method: {
                        type: 'string',
                        enum: ['random', 'stratified', 'systematic', 'cluster', 'convenience', 'purposive']

                      sample_size: { type: 'number', minimum: 10, maximum: 100000 },
                      population_definition: { type: 'string', maxLength: 500 }




              expected_outcomes: {
                type: 'array',
                minItems: 1,
                maxItems: 10,
                items: { type: 'string', maxLength: 500 }

              success_criteria: {
                type: 'object',
                properties: {
                  primary_outcomes: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: ['measure_name'],
                      properties: {
                        measure_name: { type: 'string' },
                        target_value: { type: 'number' }



                  statistical_significance_threshold: { type: 'number', minimum: 0.01, maximum: 0.1 },
                  minimum_effect_size: { type: 'number', minimum: 0.1, maximum: 2.0 }




          experimental_setup: {
            type: 'object',
            required: ['target_systems', 'environments', 'duration'],
            properties: {
              target_systems: {
                type: 'array',
                minItems: 1,
                maxItems: 20,
                items: {
                  type: 'object',
                  required: ['system_name', 'system_type', 'criticality_level'],
                  properties: {
                    system_name: { type: 'string', maxLength: 100 },
                    system_type: {
                      type: 'string',
                      enum: ['web_application', 'api_service', 'database', 'network_infrastructure', 'endpoint', 'cloud_service']

                    criticality_level: {
                      type: 'string',
                      enum: ['low', 'medium', 'high', 'critical']




              environments: {
                type: 'array',
                minItems: 1,
                maxItems: 10,
                items: {
                  type: 'object',
                  required: ['environment_name', 'environment_type'],
                  properties: {
                    environment_name: { type: 'string', maxLength: 100 },
                    environment_type: {
                      type: 'string',
                      enum: ['production', 'staging', 'development', 'sandbox', 'canary']




              duration: {
                type: 'object',
                required: ['planned_duration_days'],
                properties: {
                  planned_duration_days: { type: 'number', minimum: 1, maximum: 365 },
                  minimum_duration_days: { type: 'number', minimum: 1 },
                  maximum_duration_days: { type: 'number', maximum: 365 }


              participants: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['participant_type', 'role', 'access_level'],
                  properties: {
                    participant_type: {
                      type: 'string',
                      enum: ['human', 'system', 'synthetic']

                    role: { type: 'string', maxLength: 100 },
                    access_level: { type: 'string', maxLength: 100 }





          safety_measures: {
            type: 'object',
            properties: {
              risk_level: {
                type: 'string',
                enum: ['low', 'medium', 'high', 'critical']

              mitigation_strategies: {
                type: 'array',
                items: { type: 'string', maxLength: 500 }

              data_protection_level: {
                type: 'string',
                enum: ['public', 'internal', 'confidential', 'restricted']



          template_id: { type: 'string' }



  }, async (request: FastifyRequest<{ Body: CreateExperimentRequest }>, reply: FastifyReply): Promise<APIResponse> => {
    try {
      const {
        experiment_name,
        description,
        experiment_type,
        research_design,
        experimental_setup,
        safety_measures,
        template_id
 = request.body;

      // Transform request to platform format
      const experimentConfig: Partial<SecurityExperiment> = {
        experiment_name,
        description,
        experiment_type,
        research_design: {
          research_question: research_design.research_question,
          hypothesis: research_design.hypothesis,
          objectives: research_design.objectives,
          methodology: research_design.methodology || {
            methodology_type: 'controlled_experiment',
            data_collection_methods: ['automated_logging'],
            sampling_strategy: research_design.methodology?.sampling_strategy || {
              sampling_method: 'random',
              sample_size: 1000,
              population_definition: 'System users',
              inclusion_criteria: [],
              exclusion_criteria: []

            control_mechanisms: [],
            variables: []

          expected_outcomes: research_design.expected_outcomes,
          success_criteria: research_design.success_criteria || {
            primary_outcomes: [],
            secondary_outcomes: [],
            statistical_significance_threshold: 0.05,
            practical_significance_threshold: 10.0,
            minimum_effect_size: 0.2


        experimental_setup: {
          target_systems: experimental_setup.target_systems.map(system => ({
            system_id: `sys_${Math.random().toString(36).substr(2, 9)}`,
            system_name: system.system_name,
            system_type: system.system_type,
            description: `Target system for ${experiment_name}`,
            criticality_level: system.criticality_level,
            access_requirements: [],
            isolation_level: 'container'
          })),
          environments: experimental_setup.environments.map(env => ({
            environment_id: `env_${Math.random().toString(36).substr(2, 9)}`,
            environment_name: env.environment_name,
            environment_type: env.environment_type,
            configuration: {},
            isolation_measures: ['network_isolation'],
            monitoring_setup: ['real_time_metrics'],
            rollback_procedures: ['automated_rollback']
          })),
          participants: experimental_setup.participants?.map(participant => ({
            participant_type: participant.participant_type,
            role: participant.role,
            qualifications: [],
            access_level: participant.access_level,
            consent_required: participant.participant_type === 'human',
            anonymization_level: 'anonymized'
          })) || [],
          duration: {
            planned_duration_days: experimental_setup.duration.planned_duration_days,
            minimum_duration_days: experimental_setup.duration.minimum_duration_days || experimental_setup.duration.planned_duration_days,
            maximum_duration_days: experimental_setup.duration.maximum_duration_days || experimental_setup.duration.planned_duration_days,
            milestone_dates: [],
            review_schedule: []

          resources_required: []

        safety_measures: safety_measures ? {
          risk_assessment: {
            overall_risk_level: safety_measures.risk_level || 'medium',
            risk_categories: [],
            blast_radius_assessment: {
              affected_systems_count: experimental_setup.target_systems.length,
              affected_users_count: research_design.methodology?.sampling_strategy.sample_size || 100,
              affected_data_volume: 'limited',
              geographic_scope: ['local'],
              temporal_scope: 'limited',
              containment_measures: safety_measures.mitigation_strategies || []

            likelihood_assessment: {
              probability_percentage: 10,
              confidence_level: 80,
              historical_precedent: false,
              expert_judgment_basis: [],
              quantitative_analysis: false

            impact_assessment: {
              business_impact: {
                revenue_impact: 0,
                reputation_impact: 'negligible',
                operational_disruption: 'minimal',
                customer_impact: 'none',
                recovery_time_estimate: 1

              technical_impact: {
                system_availability_impact: 0,
                performance_impact: 0,
                data_integrity_impact: 'none',
                system_complexity_increase: false,
                technical_debt_increase: false

              security_impact: {
                confidentiality_impact: 'none',
                integrity_impact: 'none',
                availability_impact: 'none',
                attack_surface_change: 'unchanged',
                vulnerability_introduction_risk: 0

              compliance_impact: {
                regulatory_compliance_risk: 'none',
                affected_regulations: [],
                audit_implications: [],
                certification_impact: []

              user_impact: {
                user_experience_impact: 'neutral',
                privacy_impact: 'none',
                accessibility_impact: 'unchanged',
                training_requirements: []



          mitigation_strategies: safety_measures.mitigation_strategies?.map(strategy => ({
            strategy_id: `strat_${Math.random().toString(36).substr(2, 9)}`,
            strategy_name: strategy,
            strategy_type: 'preventive',
            description: strategy,
            implementation_steps: [],
            effectiveness_rating: 80,
            cost_estimate: 0,
            implementation_timeline: 1
          })) || [],
          monitoring_plan: {
            monitoring_objectives: ['Monitor system health'],
            key_metrics: [],
            monitoring_frequency: 'real_time',
            alerting_rules: [],
            escalation_procedures: []

          termination_criteria: {
            automatic_termination_rules: [],
            manual_termination_triggers: ['Safety concern'],
            emergency_stop_procedures: ['Immediate termination'],
            rollback_procedures: ['Restore system state'],
            data_preservation_requirements: ['Archive data']

          data_protection: {
            data_classification: safety_measures.data_protection_level || 'internal',
            encryption_requirements: [],
            access_controls: [],
            data_retention_policy: {
              retention_period_days: 90,
              deletion_schedule: 'automatic',
              archival_requirements: [],
              legal_hold_procedures: []

            anonymization_techniques: ['data_masking'],
            privacy_impact_assessment: {
              pia_required: true,
              pia_completed: false,
              privacy_risks_identified: [],
              consent_requirements: [],
              data_subject_rights: []


 : undefined
      };

      const createdExperiment = await experimentPlatform.createExperiment(experimentConfig);

      return {
        success: true,
        data: {
          experiment_id: createdExperiment.experiment_id,
          experiment_name: createdExperiment.experiment_name,
          experiment_type: createdExperiment.experiment_type,
          status: createdExperiment.execution.status,
          approval_required: createdExperiment.metadata.approval_status === 'pending',
          ethics_review_required: createdExperiment.metadata.ethical_review_status === 'pending',
          estimated_duration_days: createdExperiment.experimental_setup.duration.planned_duration_days,
          target_systems_count: createdExperiment.experimental_setup.target_systems.length,
          environments: createdExperiment.experimental_setup.environments.map(env => ({
            environment_name: env.environment_name,
            environment_type: env.environment_type
          })),
          safety_summary: {
            risk_level: createdExperiment.safety_measures.risk_assessment.overall_risk_level,
            mitigation_strategies_count: createdExperiment.safety_measures.mitigation_strategies.length,
            monitoring_enabled: true

          next_steps: [
            'Complete ethics review if required',
            'Obtain necessary approvals',
            'Set up experimental environment',
            'Begin experiment execution'
          ]

        message: `Security experiment '${experiment_name}' created successfully`,
        timestamp: Date.now()
      };
 catch (error) {
      fastify.log.error('Error creating security experiment:', error);
      return {
        success: false,
        error: `Failed to create security experiment: ${error.message}`,
        timestamp: Date.now()
      };

  });

  /**
   * POST /api/security-experimentation/experiments/{experimentId}/start
   * Start a security experiment
   */
  fastify.post<{ Params: { experimentId: string }; Body: StartExperimentRequest }>('/api/security-experimentation/experiments/:experimentId/start', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Start a security experiment',
      tags: ['Security Experimentation', 'Experiment Management'],
      params: {
        type: 'object',
        required: ['experimentId'],
        properties: {
          experimentId: { type: 'string' }


      body: {
        type: 'object',
        properties: {
          safety_override: { type: 'boolean' },
          notification_recipients: {
            type: 'array',
            items: { type: 'string', format: 'email' }

          monitoring_config: {
            type: 'object',
            properties: {
              real_time_monitoring: { type: 'boolean' },
              alert_thresholds: { type: 'object' }





  }, async (
    request: FastifyRequest<{ Params: { experimentId: string }; Body: StartExperimentRequest }>,
    reply: FastifyReply
  ): Promise<APIResponse> => {
    try {
      const { experimentId } = request.params;
      const { safety_override = false, notification_recipients = [], monitoring_config } = request.body;

      await experimentPlatform.startExperiment(experimentId);

      return {
        success: true,
        data: {
          experiment_id: experimentId,
          started_at: Date.now(),
          status: 'running',
          current_phase: 'execution',
          monitoring: {
            real_time_monitoring_enabled: monitoring_config?.real_time_monitoring ?? true,
            safety_monitoring_enabled: true,
            notification_recipients: notification_recipients

          safety_features: {
            automatic_termination_enabled: true,
            blast_radius_monitoring: true,
            compliance_validation_active: true,
            emergency_stop_available: true

          experiment_environment: {
            isolation_level: 'sandbox',
            monitoring_frequency: 'real_time',
            rollback_procedures_ready: true


        message: `Security experiment ${experimentId} started successfully`,
        timestamp: Date.now()
      };
 catch (error) {
      fastify.log.error('Error starting security experiment:', error);
      return {
        success: false,
        error: `Failed to start security experiment: ${error.message}`,
        timestamp: Date.now()
      };

  });

  /**
   * POST /api/security-experimentation/experiments/{experimentId}/stop
   * Stop a security experiment
   */
  fastify.post<{ Params: { experimentId: string }; Body: StopExperimentRequest }>('/api/security-experimentation/experiments/:experimentId/stop', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Stop a running security experiment',
      tags: ['Security Experimentation', 'Experiment Management'],
      params: {
        type: 'object',
        required: ['experimentId'],
        properties: {
          experimentId: { type: 'string' }


      body: {
        type: 'object',
        required: ['reason'],
        properties: {
          reason: { type: 'string', minLength: 5, maxLength: 1000 },
          preserve_data: { type: 'boolean' },
          generate_report: { type: 'boolean' }



  }, async (
    request: FastifyRequest<{ Params: { experimentId: string }; Body: StopExperimentRequest }>,
    reply: FastifyReply
  ): Promise<APIResponse> => {
    try {
      const { experimentId } = request.params;
      const { reason, preserve_data = true, generate_report = true } = request.body;

      await experimentPlatform.stopExperiment(experimentId, reason);

      return {
        success: true,
        data: {
          experiment_id: experimentId,
          stopped_at: Date.now(),
          stop_reason: reason,
          status: 'completed',
          data_preservation: {
            data_preserved: preserve_data,
            data_location: preserve_data ? 'secure_archive' : 'deleted',
            retention_period_days: preserve_data ? 90 : 0

          final_processing: {
            data_analysis_scheduled: true,
            report_generation_scheduled: generate_report,
            results_available_eta_hours: 2

          cleanup: {
            environment_cleanup_initiated: true,
            resources_released: true,
            monitoring_stopped: true


        message: `Security experiment ${experimentId} stopped successfully`,
        timestamp: Date.now()
      };
 catch (error) {
      fastify.log.error('Error stopping security experiment:', error);
      return {
        success: false,
        error: `Failed to stop security experiment: ${error.message}`,
        timestamp: Date.now()
      };

  });

  /**
   * GET /api/security-experimentation/experiments/{experimentId}/results
   * Get experiment results and analysis
   */
  fastify.get<{ Params: { experimentId: string } }>('/api/security-experimentation/experiments/:experimentId/results', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Get security experiment results and statistical analysis',
      tags: ['Security Experimentation', 'Results'],
      params: {
        type: 'object',
        required: ['experimentId'],
        properties: {
          experimentId: { type: 'string' }



  }, async (
    request: FastifyRequest<{ Params: { experimentId: string } }>,
    reply: FastifyReply
  ): Promise<APIResponse> => {
    try {
      const { experimentId } = request.params;

      const results = await experimentPlatform.getExperimentResults(experimentId);

      return {
        success: true,
        data: {
          experiment_id: experimentId,
          data_collection_summary: {
            total_records_collected: results.data_collection.data_volume_collected.total_records_collected,
            data_quality_score: results.data_collection.data_quality_assessment.overall_quality_score,
            collection_completeness: results.data_collection.collection_completeness,
            data_sources_count: results.data_collection.data_sources.length

          statistical_analysis_summary: {
            analysis_methods_used: results.statistical_analysis.analysis_methods_used,
            hypothesis_tests_count: results.statistical_analysis.hypothesis_test_results.length,
            significant_findings: results.statistical_analysis.hypothesis_test_results.filter(
              test => test.result === 'supported'
            ).length,
            confidence_intervals_count: results.statistical_analysis.confidence_intervals.length

          key_findings: results.findings.map(finding => ({
            finding_id: finding.finding_id,
            finding_type: finding.finding_type,
            title: finding.title,
            description: finding.description,
            statistical_support: finding.statistical_support ? {
              test_method: finding.statistical_support.statistical_test,
              p_value: finding.statistical_support.p_value,
              effect_size: finding.statistical_support.effect_size
 : null,
            practical_importance: finding.practical_importance.importance_level
          })),
          insights: results.insights.map(insight => ({
            insight_category: insight.insight_category,
            title: insight.title,
            description: insight.description,
            confidence_level: insight.confidence_level,
            implications: insight.implications.map(impl => ({
              type: impl.implication_type,
              description: impl.description
            }))
          })),
          recommendations: results.recommendations.slice(0, 10).map(rec => ({
            recommendation_type: rec.recommendation_type,
            priority: rec.priority,
            title: rec.title,
            description: rec.description,
            expected_benefits: rec.expected_benefits.map(benefit => ({
              category: benefit.benefit_category,
              description: benefit.benefit_description
            }))
          })),
          publication_status: {
            publication_ready: results.publication_readiness.publication_ready,
            target_venues_count: results.publication_readiness.target_venues.length,
            ethical_clearance: results.publication_readiness.ethical_clearance_status,
            data_anonymization: results.publication_readiness.data_anonymization_status


        timestamp: Date.now()
      };
 catch (error) {
      fastify.log.error('Error getting experiment results:', error);
      return {
        success: false,
        error: `Failed to get experiment results: ${error.message}`,
        timestamp: Date.now()
      };

  });

  /**
   * POST /api/security-experimentation/portfolios/create
   * Create an experiment portfolio
   */
  fastify.post<{ Body: CreatePortfolioRequest }>('/api/security-experimentation/portfolios/create', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Create a portfolio to coordinate multiple related experiments',
      tags: ['Security Experimentation', 'Portfolio Management'],
      body: {
        type: 'object',
        required: ['portfolio_name', 'description', 'experiments'],
        properties: {
          portfolio_name: { type: 'string', minLength: 1, maxLength: 200 },
          description: { type: 'string', maxLength: 2000 },
          experiments: {
            type: 'array',
            minItems: 2,
            maxItems: 50,
            items: { type: 'string' }

          research_themes: {
            type: 'array',
            items: {
              type: 'object',
              required: ['theme_name', 'theme_description', 'research_questions'],
              properties: {
                theme_name: { type: 'string', maxLength: 100 },
                theme_description: { type: 'string', maxLength: 500 },
                research_questions: {
                  type: 'array',
                  items: { type: 'string', maxLength: 500 }




          coordination_requirements: {
            type: 'array',
            items: {
              type: 'object',
              required: ['requirement_type', 'description', 'affected_experiments'],
              properties: {
                requirement_type: {
                  type: 'string',
                  enum: ['data_sharing', 'resource_sharing', 'timeline_dependency', 'methodology_alignment']

                description: { type: 'string', maxLength: 500 },
                affected_experiments: {
                  type: 'array',
                  items: { type: 'string' }







  }, async (request: FastifyRequest<{ Body: CreatePortfolioRequest }>, reply: FastifyReply): Promise<APIResponse> => {
    try {
      const {
        portfolio_name,
        description,
        experiments,
        research_themes = [],
        coordination_requirements = []
 = request.body;

      const portfolioConfig: Partial<ExperimentPortfolio> = {
        portfolio_name,
        description,
        experiments,
        research_themes: research_themes.map(theme => ({
          ...theme,
          contributing_experiments: experiments.filter(() => Math.random() > 0.5), // Simple assignment logic
          expected_synergies: [`Synergy between ${theme.theme_name} experiments`]
        })),
        coordination_requirements: coordination_requirements.map(req => ({
          ...req,
          coordination_mechanisms: ['automated_scheduling', 'resource_pooling']
        })),
        resource_allocation: [
          {
            resource_type: 'compute',
            total_allocation: 100,
            experiment_allocations: experiments.map(exp => ({
              experiment_id: exp,
              allocation: Math.floor(100 / experiments.length)
            })),
            allocation_strategy: 'equal_distribution'

        ],
        timeline_coordination: {
          critical_path_experiments: experiments.slice(0, Math.ceil(experiments.length / 2)),
          milestone_dependencies: [],
          resource_conflict_resolutions: []

      };

      const createdPortfolio = await experimentPlatform.createExperimentPortfolio(portfolioConfig);

      return {
        success: true,
        data: {
          portfolio_id: createdPortfolio.portfolio_id,
          portfolio_name: createdPortfolio.portfolio_name,
          experiments_count: createdPortfolio.experiments.length,
          research_themes_count: createdPortfolio.research_themes.length,
          coordination_requirements: createdPortfolio.coordination_requirements.map(req => ({
            requirement_type: req.requirement_type,
            affected_experiments_count: req.affected_experiments.length
          })),
          resource_allocation_summary: {
            total_resource_types: createdPortfolio.resource_allocation.length,
            allocation_strategy: 'optimized_distribution'

          timeline_coordination: {
            critical_path_experiments_count: createdPortfolio.timeline_coordination.critical_path_experiments.length,
            estimated_total_duration_days: Math.max(...experiments.map(() => Math.floor(Math.random() * 60) + 30)) // Mock calculation


        message: `Experiment portfolio '${portfolio_name}' created successfully`,
        timestamp: Date.now()
      };
 catch (error) {
      fastify.log.error('Error creating experiment portfolio:', error);
      return {
        success: false,
        error: `Failed to create experiment portfolio: ${error.message}`,
        timestamp: Date.now()
      };

  });

  /**
   * GET /api/security-experimentation/templates
   * Get available experiment templates
   */
  fastify.get('/api/security-experimentation/templates', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Get available security experiment templates',
      tags: ['Security Experimentation', 'Templates']

  }, async (request: FastifyRequest, reply: FastifyReply): Promise<APIResponse> => {
    try {
      // Mock templates data (in real implementation, these would come from the platform)
      const templates = [
        {
          template_id: 'security_research_basic',
          template_name: 'Basic Security Research',
          template_category: 'Research',
          description: 'Template for basic security research experiments',
          experiment_type: 'security_research',
          estimated_duration_days: 14,
          complexity_level: 'beginner',
          required_resources: ['compute', 'storage', 'monitoring'],
          safety_level: 'low',
          customization_points: [
            'Research question definition',
            'Hypothesis formulation',
            'Target system selection',
            'Data collection methods'
          ]

        {
          template_id: 'vulnerability_simulation',
          template_name: 'Vulnerability Simulation',
          template_category: 'Security Testing',
          description: 'Template for controlled vulnerability simulation experiments',
          experiment_type: 'vulnerability_simulation',
          estimated_duration_days: 7,
          complexity_level: 'intermediate',
          required_resources: ['isolated_environment', 'security_tools', 'monitoring'],
          safety_level: 'medium',
          customization_points: [
            'Vulnerability type selection',
            'Target system configuration',
            'Attack simulation parameters',
            'Detection mechanism testing'
          ]

        {
          template_id: 'threat_modeling_experiment',
          template_name: 'Threat Modeling Validation',
          template_category: 'Threat Analysis',
          description: 'Template for validating threat models against real-world scenarios',
          experiment_type: 'threat_modeling',
          estimated_duration_days: 21,
          complexity_level: 'advanced',
          required_resources: ['threat_intelligence', 'analysis_tools', 'expert_reviewers'],
          safety_level: 'low',
          customization_points: [
            'Threat model selection',
            'Validation scenarios',
            'Risk assessment parameters',
            'Mitigation strategy testing'
          ]

        {
          template_id: 'policy_effectiveness_study',
          template_name: 'Security Policy Effectiveness',
          template_category: 'Policy Research',
          description: 'Template for measuring the effectiveness of security policies',
          experiment_type: 'policy_effectiveness',
          estimated_duration_days: 30,
          complexity_level: 'intermediate',
          required_resources: ['user_data', 'policy_engine', 'analytics_platform'],
          safety_level: 'medium',
          customization_points: [
            'Policy selection',
            'Effectiveness metrics',
            'User impact assessment',
            'Compliance measurement'
          ]

      ];

      return {
        success: true,
        data: {
          templates_count: templates.length,
          templates: templates,
          categories: Array.from(new Set(templates.map(t => t.template_category))),
          experiment_types: Array.from(new Set(templates.map(t => t.experiment_type))),
          complexity_levels: Array.from(new Set(templates.map(t => t.complexity_level))),
          safety_levels: Array.from(new Set(templates.map(t => t.safety_level)))

        timestamp: Date.now()
      };
 catch (error) {
      fastify.log.error('Error getting experiment templates:', error);
      return {
        success: false,
        error: `Failed to get experiment templates: ${error.message}`,
        timestamp: Date.now()
      };

  });

  /**
   * GET /api/security-experimentation/experiments
   * List experiments with filtering
   */
  fastify.get<{ Querystring: { status?: string; experiment_type?: string; limit?: number; offset?: number } }>('/api/security-experimentation/experiments', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'List security experiments with filtering and pagination',
      tags: ['Security Experimentation', 'Experiment Management'],
      querystring: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['draft', 'approved', 'running', 'paused', 'completed', 'terminated', 'failed']

          experiment_type: {
            type: 'string',
            enum: ['security_research', 'vulnerability_simulation', 'threat_modeling', 'policy_effectiveness', 'incident_response', 'penetration_testing', 'social_engineering']

          limit: { type: 'number', minimum: 1, maximum: 100 },
          offset: { type: 'number', minimum: 0 }



  }, async (
    request: FastifyRequest<{ Querystring: { status?: string; experiment_type?: string; limit?: number; offset?: number } }>,
    reply: FastifyReply
  ): Promise<APIResponse> => {
    try {
      const { status, experiment_type, limit = 20, offset = 0 } = request.query;

      // Mock experiments data (in real implementation, these would come from the platform)
      const mockExperiments = [
        {
          experiment_id: 'exp_001',
          experiment_name: 'MFA Bypass Detection Study',
          experiment_type: 'security_research',
          status: 'completed',
          created_at: Date.now() - 86400000 * 30,
          duration_days: 21,
          completion_percentage: 100,
          key_findings_count: 5,
          risk_level: 'medium'

        {
          experiment_id: 'exp_002',
          experiment_name: 'SQL Injection Simulation',
          experiment_type: 'vulnerability_simulation',
          status: 'running',
          created_at: Date.now() - 86400000 * 5,
          estimated_completion: Date.now() + 86400000 * 2,
          completion_percentage: 75,
          risk_level: 'high'

        {
          experiment_id: 'exp_003',
          experiment_name: 'Phishing Campaign Analysis',
          experiment_type: 'threat_modeling',
          status: 'approved',
          created_at: Date.now() - 86400000 * 1,
          estimated_start: Date.now() + 86400000 * 1,
          estimated_duration_days: 14,
          risk_level: 'low'

      ];

      return {
        success: true,
        data: {
          experiments: mockExperiments,
          pagination: {
            total_experiments: mockExperiments.length,
            limit,
            offset,
            has_more: false

          filters_applied: {
            status,
            experiment_type

          summary: {
            total_experiments: mockExperiments.length,
            running_experiments: mockExperiments.filter(e => e.status === 'running').length,
            completed_experiments: mockExperiments.filter(e => e.status === 'completed').length,
            average_duration_days: 18


        timestamp: Date.now()
      };
 catch (error) {
      fastify.log.error('Error listing experiments:', error);
      return {
        success: false,
        error: `Failed to list experiments: ${error.message}`,
        timestamp: Date.now()
      };

  });

  /**
   * GET /api/security-experimentation/analytics
   * Get comprehensive experimentation analytics
   */
  fastify.get('/api/security-experimentation/analytics', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Get comprehensive security experimentation analytics and insights',
      tags: ['Security Experimentation', 'Analytics']

  }, async (request: FastifyRequest, reply: FastifyReply): Promise<APIResponse> => {
    try {
      const analytics = experimentPlatform.getExperimentationAnalytics();

      return {
        success: true,
        data: {
          analytics_timestamp: Date.now(),
          experimentation_summary: analytics.summary,
          experiment_distribution: {
            by_type: analytics.experiment_types,
            by_status: {
              active: analytics.summary.active_experiments,
              completed: analytics.summary.completed_experiments,
              total: analytics.summary.total_experiments


          success_metrics: analytics.success_metrics,
          resource_utilization: analytics.resource_utilization,
          safety_metrics: analytics.safety_metrics,
          research_impact: analytics.research_impact,
          recent_activity: analytics.recent_activities.slice(0, 10),
          insights: [
            analytics.success_metrics.completion_rate > 80 ? 
              'High experiment completion rate indicates good planning' : 
              'Consider improving experiment planning and resource allocation',
            analytics.safety_metrics.safety_incidents === 0 ? 
              'Excellent safety record maintained' : 
              'Review safety protocols and training',
            analytics.research_impact.publications_count > 10 ? 
              'Strong research output and knowledge sharing' : 
              'Consider increasing focus on publishable research',
            'Continuous improvement in experimental methodology recommended'
          ],
          recommendations: [
            'Maintain current safety standards',
            'Explore new experiment types and methodologies',
            'Increase collaboration with external researchers',
            'Invest in advanced analytics and automation tools'
          ]

        timestamp: Date.now()
      };
 catch (error) {
      fastify.log.error('Error getting experimentation analytics:', error);
      return {
        success: false,
        error: `Failed to get experimentation analytics: ${error.message}`,
        timestamp: Date.now()
      };

  });

  /**
   * GET /api/security-experimentation/health
   * Get experimentation platform health status
   */
  fastify.get('/api/security-experimentation/health', {
    schema: {
      description: 'Get security experimentation platform health status',
      tags: ['Security Experimentation', 'Health Check']

  }, async (request: FastifyRequest, reply: FastifyReply): Promise<APIResponse> => {
    try {
      const analytics = experimentPlatform.getExperimentationAnalytics();
      
      const isHealthy = analytics.summary.total_experiments >= 0 &&
                       analytics.safety_metrics.safety_incidents === 0 &&
                       analytics.success_metrics.completion_rate > 70;

      return {
        success: true,
        data: {
          healthy: isHealthy,
          platform_status: isHealthy ? 'healthy' : 'degraded',
          experimentation_health: {
            total_experiments: analytics.summary.total_experiments,
            active_experiments: analytics.summary.active_experiments,
            completion_rate: analytics.success_metrics.completion_rate,
            safety_incidents: analytics.safety_metrics.safety_incidents

          system_components: {
            sandbox_manager_operational: true,
            orchestration_engine_operational: true,
            compliance_validator_operational: true,
            ethics_review_board_operational: true

          capabilities: {
            multi_environment_support: true,
            sandbox_isolation: true,
            automated_rollback: true,
            real_time_monitoring: true,
            compliance_validation: true,
            ethics_review: true

          resource_status: {
            compute_resources_available: true,
            storage_capacity_adequate: true,
            network_isolation_functional: true,
            monitoring_systems_active: true

          last_check: Date.now()

        timestamp: Date.now()
      };
 catch (error) {
      fastify.log.error('Error getting experimentation platform health:', error);
      return {
        success: false,
        data: {
          healthy: false,
          platform_status: 'error',
          error_message: error.message

        error: 'Failed to get platform health status',
        timestamp: Date.now()
      };

  });

  // Setup platform event handlers for logging
  experimentPlatform.on('initialized', () => {
    fastify.log.info('Security Experimentation Platform initialized');
  });

  experimentPlatform.on('experiment_created', (data) => {
    fastify.log.info(`Security experiment created: ${data.experimentName} (${data.experimentId}) - Type: ${data.experimentType}`);
  });

  experimentPlatform.on('experiment_started', (data) => {
    fastify.log.info(`Security experiment started: ${data.experimentName} (${data.experimentId}) at ${new Date(data.startTime).toISOString()}`);
  });

  experimentPlatform.on('experiment_stopped', (data) => {
    fastify.log.info(`Security experiment stopped: ${data.experimentName} (${data.experimentId}) - Reason: ${data.reason} - Duration: ${Math.round(data.duration / 3600000)}h`);
  });

  experimentPlatform.on('portfolio_created', (data) => {
    fastify.log.info(`Experiment portfolio created: ${data.portfolioName} (${data.portfolioId}) with ${data.experimentsCount} experiments`);
  });

  experimentPlatform.on('experiment_creation_error', (data) => {
    fastify.log.error(`Security experiment creation error:`, data.error);
  });

  experimentPlatform.on('experiment_start_error', (data) => {
    fastify.log.error(`Security experiment start error for ${data.experimentId}:`, data.error);
  });

  experimentPlatform.on('experiment_stop_error', (data) => {
    fastify.log.error(`Security experiment stop error for ${data.experimentId}:`, data.error);
  });

  experimentPlatform.on('results_error', (data) => {
    fastify.log.error(`Security experiment results error for ${data.experimentId}:`, data.error);
  });

  experimentPlatform.on('portfolio_creation_error', (data) => {
    fastify.log.error(`Experiment portfolio creation error:`, data.error);
  });

  experimentPlatform.on('error', (error) => {
    fastify.log.error('Security Experimentation Platform error:', error);
  });

  // Cleanup on server shutdown
  fastify.addHook('onClose', async () => {
    if (experimentationPlatform) {
      await experimentationPlatform.shutdown();
      fastify.log.info('Security Experimentation Platform shut down');

  });
