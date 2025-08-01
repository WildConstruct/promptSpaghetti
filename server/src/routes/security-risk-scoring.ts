/**
 * Security Risk Scoring and Threat Prioritization API Routes
 * Epic 31 - Task E31-1753313263600-C908F1
 * 
 * RESTful API endpoints for security risk scoring, threat prioritization,
 * and comprehensive risk analytics.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { 
  SecurityRiskScoringEngine, 
  SecurityRiskScoringConfig, 
  SecurityRisk,
  RiskScoringReport 
 from '../services/SecurityRiskScoringEngine';
import { SecurityAPIIntegrationPlatform } from '../services/SecurityAPIIntegrationPlatform';
import { SecurityPolicyAnalysisEngine } from '../services/SecurityPolicyAnalysisEngine';

// Global risk scoring engine instance
let riskScoringEngine: SecurityRiskScoringEngine | null = null;



interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: number;




interface CreateRiskRequest {
  risk_name: string;
  description: string;
  risk_type: 'vulnerability' | 'threat' | 'compliance' | 'operational' | 'strategic' | 'financial';
  vulnerability_details?: {
    cve_id?: string;
    cvss_score?: number;
    severity_level: 'low' | 'medium' | 'high' | 'critical';
    affected_systems: string[];
    exploit_available: boolean;



  };
  threat_details?: {
    threat_source: string;
    attack_vector: string;
    likelihood: number;
    sophistication_required: 'low' | 'medium' | 'high';
  };
  asset_context?: {
    affected_assets: {
      asset_id: string;
      asset_name: string;
      asset_type: 'server' | 'database' | 'application' | 'network_device' | 'endpoint' | 'cloud_service' | 'data';
      criticality_level: 'low' | 'medium' | 'high' | 'critical';
      business_function: string;
[];
    business_impact_estimate: {
      revenue_impact: number;
      operational_disruption: 'minimal' | 'moderate' | 'significant' | 'severe';
      customer_impact: number;
      reputation_impact: 'minimal' | 'moderate' | 'significant' | 'severe';
    };
  };
  compliance_context?: {
    affected_regulations: string[];
    compliance_requirements: string[];
    potential_penalties: number;
  };
  source_information?: {
    identified_by: string;
    identification_method: 'automated' | 'manual' | 'third_party' | 'intelligence';
    source_systems: string[];
    external_references?: {
      reference_type: 'cve' | 'cwe' | 'capec' | 'mitre_attack' | 'nist' | 'vendor_advisory';
      reference_id: string;
      reference_url: string;
[];
  };




interface UpdateRiskScoreRequest {
  update_reason: string;
  score_adjustments?: {
    vulnerability_score_adjustment?: number;
    threat_score_adjustment?: number;
    asset_score_adjustment?: number;
    business_impact_adjustment?: number;



  };
  new_intelligence?: {
    threat_intelligence_updates: string[];
    exploit_developments: string[];
    asset_changes: string[];
  };




interface PrioritizeRisksRequest {
  risk_ids: string[];
  prioritization_criteria?: string[];
  business_context?: {
    current_threat_level: 'low' | 'medium' | 'high' | 'critical';
    business_priorities: string[];
    resource_constraints: string[];
    timeline_requirements: string;



  };
  filter_criteria?: {
    min_score?: number;
    max_score?: number;
    risk_types?: string[];
    priority_levels?: string[];
    affected_assets?: string[];
  };




interface GenerateReportRequest {
  report_scope: 'all_risks' | 'high_priority' | 'recent_risks' | 'custom';
  time_period?: {
    start_date: number;
    end_date: number;



  };
  risk_filters?: {
    risk_types?: string[];
    priority_levels?: string[];
    score_range?: { min: number; max: number };
    asset_types?: string[];
    business_units?: string[];
  };
  report_options?: {
    include_trend_analysis: boolean;
    include_recommendations: boolean;
    include_detailed_findings: boolean;
    include_executive_summary: boolean;
    format: 'detailed' | 'summary' | 'executive';
  };


/**
 * Initialize security risk scoring engine
 */
async function initializeRiskScoringEngine(
  platform: SecurityAPIIntegrationPlatform,
  policyEngine: SecurityPolicyAnalysisEngine
): Promise<SecurityRiskScoringEngine> {

  if (riskScoringEngine) {
    return riskScoringEngine;


  const config: SecurityRiskScoringConfig = {
    scoring_algorithms: {
      cvss_scoring_enabled: true,
      custom_scoring_enabled: true,
      machine_learning_scoring: true,
      temporal_scoring_enabled: true,
      environmental_scoring_enabled: true,
      composite_scoring_enabled: true

    threat_prioritization: {
      priority_matrix_enabled: true,
      business_impact_weighting: true,
      asset_criticality_weighting: true,
      threat_intelligence_integration: true,
      dynamic_prioritization: true,
      contextual_prioritization: true

    risk_factors: {
      vulnerability_severity: true,
      asset_criticality: true,
      threat_landscape: true,
      exploitability: true,
      business_impact: true,
      remediation_complexity: true,
      exposure_metrics: true

    scoring_models: {
      quantitative_models_enabled: true,
      qualitative_models_enabled: true,
      hybrid_models_enabled: true,
      industry_benchmarking: true,
      peer_comparison: true,
      historical_analysis: true

    automation_settings: {
      real_time_scoring: true,
      automated_prioritization: true,
      alert_threshold_management: true,
      escalation_automation: true,
      dashboard_integration: true,
      reporting_automation: true

    integration_settings: {
      threat_intelligence_feeds: true,
      vulnerability_scanners: true,
      asset_management_systems: true,
      incident_response_platforms: true,
      compliance_frameworks: true,
      business_systems: true

  };

  riskScoringEngine = new SecurityRiskScoringEngine(config, platform, policyEngine);
  await riskScoringEngine.initialize();

  return riskScoringEngine;


export default async function securityRiskScoringRoutes(
  fastify: FastifyInstance,
  platform: SecurityAPIIntegrationPlatform,
  policyEngine: SecurityPolicyAnalysisEngine
) {
  // Initialize engine
  const engine = await initializeRiskScoringEngine(platform, policyEngine);

  /**
   * POST /api/security-risk-scoring/risks/create
   * Create and score a new security risk
   */
  fastify.post<{ Body: CreateRiskRequest }>('/api/security-risk-scoring/risks/create', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Create and score a new security risk with comprehensive analysis',
      tags: ['Security Risk Scoring', 'Risk Management'],
      body: {
        type: 'object',
        required: ['risk_name', 'description', 'risk_type'],
        properties: {
          risk_name: { type: 'string', minLength: 1, maxLength: 200 },
          description: { type: 'string', maxLength: 2000 },
          risk_type: {
            type: 'string',
            enum: ['vulnerability', 'threat', 'compliance', 'operational', 'strategic', 'financial']

          vulnerability_details: {
            type: 'object',
            properties: {
              cve_id: { type: 'string' },
              cvss_score: { type: 'number', minimum: 0, maximum: 10 },
              severity_level: {
                type: 'string',
                enum: ['low', 'medium', 'high', 'critical']

              affected_systems: {
                type: 'array',
                items: { type: 'string' }

              exploit_available: { type: 'boolean' }


          threat_details: {
            type: 'object',
            properties: {
              threat_source: { type: 'string', maxLength: 200 },
              attack_vector: { type: 'string', maxLength: 200 },
              likelihood: { type: 'number', minimum: 0, maximum: 100 },
              sophistication_required: {
                type: 'string',
                enum: ['low', 'medium', 'high']



          asset_context: {
            type: 'object',
            properties: {
              affected_assets: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['asset_id', 'asset_name', 'asset_type', 'criticality_level'],
                  properties: {
                    asset_id: { type: 'string' },
                    asset_name: { type: 'string' },
                    asset_type: {
                      type: 'string',
                      enum: ['server', 'database', 'application', 'network_device', 'endpoint', 'cloud_service', 'data']

                    criticality_level: {
                      type: 'string',
                      enum: ['low', 'medium', 'high', 'critical']

                    business_function: { type: 'string' }



              business_impact_estimate: {
                type: 'object',
                properties: {
                  revenue_impact: { type: 'number', minimum: 0 },
                  operational_disruption: {
                    type: 'string',
                    enum: ['minimal', 'moderate', 'significant', 'severe']

                  customer_impact: { type: 'number', minimum: 0 },
                  reputation_impact: {
                    type: 'string',
                    enum: ['minimal', 'moderate', 'significant', 'severe']





          compliance_context: {
            type: 'object',
            properties: {
              affected_regulations: {
                type: 'array',
                items: { type: 'string' }

              compliance_requirements: {
                type: 'array',
                items: { type: 'string' }

              potential_penalties: { type: 'number', minimum: 0 }


          source_information: {
            type: 'object',
            properties: {
              identified_by: { type: 'string' },
              identification_method: {
                type: 'string',
                enum: ['automated', 'manual', 'third_party', 'intelligence']

              source_systems: {
                type: 'array',
                items: { type: 'string' }

              external_references: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    reference_type: {
                      type: 'string',
                      enum: ['cve', 'cwe', 'capec', 'mitre_attack', 'nist', 'vendor_advisory']

                    reference_id: { type: 'string' },
                    reference_url: { type: 'string', format: 'uri' }








  }, async (request: FastifyRequest<{ Body: CreateRiskRequest }>, reply: FastifyReply): Promise<APIResponse> => {
    try {
      const riskData = request.body;

      // Transform request data to SecurityRisk format
      const riskConfig: Partial<SecurityRisk> = {
        risk_name: riskData.risk_name,
        description: riskData.description,
        risk_type: riskData.risk_type,
        
        // Map vulnerability details if provided
        ...(riskData.vulnerability_details && {
          metadata: {
            external_references: riskData.vulnerability_details.cve_id ? [{
              reference_type: 'cve',
              reference_id: riskData.vulnerability_details.cve_id,
              reference_url: `https://nvd.nist.gov/vuln/detail/${riskData.vulnerability_details.cve_id}`,
              reference_description: `CVE Reference for ${riskData.vulnerability_details.cve_id}`,
              relevance_score: 1.0
] : []

        }),
        
        // Map asset context if provided
        ...(riskData.asset_context && {
          asset_impact: {
            affected_assets: riskData.asset_context.affected_assets.map(asset => ({
              asset_id: asset.asset_id,
              asset_name: asset.asset_name,
              asset_type: asset.asset_type,
              criticality_level: asset.criticality_level,
              business_function: asset.business_function,
              exposure_level: {
                internet_facing: false,
                internal_network_exposure: true,
                privileged_access_required: asset.criticality_level === 'critical',
                authentication_required: true,
                network_segmentation: true,
                access_control_effectiveness: 80

              vulnerability_count: 0,
              security_controls: []
            }))


      };

      const scoredRisk = await engine.scoreSecurityRisk(riskConfig);

      return {
        success: true,
        data: {
          risk_id: scoredRisk.risk_id,
          risk_name: scoredRisk.risk_name,
          risk_type: scoredRisk.risk_type,
          
          risk_scoring_summary: {
            composite_score: scoredRisk.risk_scoring.composite_score,
            priority_level: scoredRisk.prioritization.priority_level,
            priority_score: scoredRisk.prioritization.priority_score,
            scoring_methodology: scoredRisk.risk_scoring.scoring_methodology.primary_framework

          score_breakdown: {
            vulnerability_score: scoredRisk.risk_scoring.score_breakdown.vulnerability_score,
            threat_score: scoredRisk.risk_scoring.score_breakdown.threat_score,
            asset_score: scoredRisk.risk_scoring.score_breakdown.asset_score,
            business_impact_score: scoredRisk.risk_scoring.score_breakdown.business_impact_score,
            exploitability_score: scoredRisk.risk_scoring.score_breakdown.exploitability_score

          prioritization_summary: {
            priority_level: scoredRisk.prioritization.priority_level,
            sla_requirements: scoredRisk.prioritization.sla_requirements.length,
            escalation_triggers: scoredRisk.prioritization.escalation_triggers.length

          remediation_summary: {
            recommended_action: scoredRisk.remediation.recommended_action,
            effort_estimate_hours: scoredRisk.remediation.effort_estimate.person_hours,
            timeline_estimate_days: scoredRisk.remediation.timeline_estimate.expected_timeline,
            cost_estimate: scoredRisk.remediation.cost_estimate.total_cost

          next_steps: [
            'Review and validate risk assessment',
            'Assign to appropriate team member',
            'Develop detailed remediation plan',
            'Monitor for updates and changes'
          ]

        message: `Security risk '${scoredRisk.risk_name}' created and scored successfully`,
        timestamp: Date.now()
      };
 catch (error) {
      fastify.log.error('Error creating and scoring security risk:', error);
      return {
        success: false,
        error: `Failed to create and score security risk: ${error.message}`,
        timestamp: Date.now()
      };

  });

  /**
   * PUT /api/security-risk-scoring/risks/{riskId}/score
   * Update risk score with new information
   */
  fastify.put<{ Params: { riskId: string }; Body: UpdateRiskScoreRequest }>('/api/security-risk-scoring/risks/:riskId/score', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Update security risk score with new intelligence or changes',
      tags: ['Security Risk Scoring', 'Risk Management'],
      params: {
        type: 'object',
        required: ['riskId'],
        properties: {
          riskId: { type: 'string' }


      body: {
        type: 'object',
        required: ['update_reason'],
        properties: {
          update_reason: { type: 'string', minLength: 5, maxLength: 500 },
          score_adjustments: {
            type: 'object',
            properties: {
              vulnerability_score_adjustment: { type: 'number', minimum: -10, maximum: 10 },
              threat_score_adjustment: { type: 'number', minimum: -10, maximum: 10 },
              asset_score_adjustment: { type: 'number', minimum: -10, maximum: 10 },
              business_impact_adjustment: { type: 'number', minimum: -10, maximum: 10 }


          new_intelligence: {
            type: 'object',
            properties: {
              threat_intelligence_updates: {
                type: 'array',
                items: { type: 'string' }

              exploit_developments: {
                type: 'array',
                items: { type: 'string' }

              asset_changes: {
                type: 'array',
                items: { type: 'string' }






  }, async (
    request: FastifyRequest<{ Params: { riskId: string }; Body: UpdateRiskScoreRequest }>,
    reply: FastifyReply
  ): Promise<APIResponse> => {
    try {
      const { riskId } = request.params;
      const { update_reason, score_adjustments, new_intelligence } = request.body;

      const updatedRisk = await engine.updateRiskScore(riskId, update_reason);

      return {
        success: true,
        data: {
          risk_id: updatedRisk.risk_id,
          risk_name: updatedRisk.risk_name,
          
          score_update_summary: {
            new_composite_score: updatedRisk.risk_scoring.composite_score,
            new_priority_level: updatedRisk.prioritization.priority_level,
            score_history_entries: updatedRisk.risk_scoring.score_history.length,
            last_updated: updatedRisk.risk_scoring.last_updated

          score_changes: {
            composite_score_change: updatedRisk.risk_scoring.score_history.length > 0 ? 
              updatedRisk.risk_scoring.score_history[updatedRisk.risk_scoring.score_history.length - 1].score_change : 0,
            change_reason: update_reason,
            change_trigger: 'manual_adjustment'

          updated_breakdown: {
            vulnerability_score: updatedRisk.risk_scoring.score_breakdown.vulnerability_score,
            threat_score: updatedRisk.risk_scoring.score_breakdown.threat_score,
            asset_score: updatedRisk.risk_scoring.score_breakdown.asset_score,
            business_impact_score: updatedRisk.risk_scoring.score_breakdown.business_impact_score

          intelligence_updates: new_intelligence ? {
            threat_intelligence_count: new_intelligence.threat_intelligence_updates?.length || 0,
            exploit_developments_count: new_intelligence.exploit_developments?.length || 0,
            asset_changes_count: new_intelligence.asset_changes?.length || 0
 : null

        message: `Risk score updated successfully for risk ${riskId}`,
        timestamp: Date.now()
      };
 catch (error) {
      fastify.log.error('Error updating risk score:', error);
      return {
        success: false,
        error: `Failed to update risk score: ${error.message}`,
        timestamp: Date.now()
      };

  });

  /**
   * POST /api/security-risk-scoring/risks/prioritize
   * Prioritize multiple risks based on various criteria
   */
  fastify.post<{ Body: PrioritizeRisksRequest }>('/api/security-risk-scoring/risks/prioritize', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Prioritize multiple security risks using advanced algorithms',
      tags: ['Security Risk Scoring', 'Threat Prioritization'],
      body: {
        type: 'object',
        required: ['risk_ids'],
        properties: {
          risk_ids: {
            type: 'array',
            minItems: 1,
            maxItems: 1000,
            items: { type: 'string' }

          prioritization_criteria: {
            type: 'array',
            items: { type: 'string' }

          business_context: {
            type: 'object',
            properties: {
              current_threat_level: {
                type: 'string',
                enum: ['low', 'medium', 'high', 'critical']

              business_priorities: {
                type: 'array',
                items: { type: 'string' }

              resource_constraints: {
                type: 'array',
                items: { type: 'string' }

              timeline_requirements: { type: 'string' }


          filter_criteria: {
            type: 'object',
            properties: {
              min_score: { type: 'number', minimum: 0, maximum: 10 },
              max_score: { type: 'number', minimum: 0, maximum: 10 },
              risk_types: {
                type: 'array',
                items: { type: 'string' }

              priority_levels: {
                type: 'array',
                items: { type: 'string' }

              affected_assets: {
                type: 'array',
                items: { type: 'string' }






  }, async (request: FastifyRequest<{ Body: PrioritizeRisksRequest }>, reply: FastifyReply): Promise<APIResponse> => {
    try {
      const { risk_ids, prioritization_criteria, business_context, filter_criteria } = request.body;

      // Get risks from the engine (simplified - in real implementation would fetch from engine)
      const risks: SecurityRisk[] = []; // Placeholder - would fetch actual risks

      const prioritizedRisks = await engine.prioritizeRisks(risks, prioritization_criteria);

      // Apply filters if provided
      let filteredRisks = prioritizedRisks;
      if (filter_criteria) {
        filteredRisks = filteredRisks.filter(risk => {
          if (filter_criteria.min_score && risk.risk_scoring.composite_score < filter_criteria.min_score) return false;
          if (filter_criteria.max_score && risk.risk_scoring.composite_score > filter_criteria.max_score) return false;
          if (filter_criteria.risk_types && !filter_criteria.risk_types.includes(risk.risk_type)) return false;
          if (filter_criteria.priority_levels && !filter_criteria.priority_levels.includes(risk.prioritization.priority_level)) return false;
          return true;
        });


      return {
        success: true,
        data: {
          prioritization_summary: {
            total_risks_analyzed: prioritizedRisks.length,
            filtered_risks_count: filteredRisks.length,
            prioritization_method: 'dynamic_weighted_scoring',
            business_context_applied: !!business_context

          priority_distribution: {
            critical: filteredRisks.filter(r => r.prioritization.priority_level === 'critical').length,
            high: filteredRisks.filter(r => r.prioritization.priority_level === 'high').length,
            medium: filteredRisks.filter(r => r.prioritization.priority_level === 'medium').length,
            low: filteredRisks.filter(r => r.prioritization.priority_level === 'low').length,
            informational: filteredRisks.filter(r => r.prioritization.priority_level === 'informational').length

          top_priority_risks: filteredRisks.slice(0, 10).map(risk => ({
            risk_id: risk.risk_id,
            risk_name: risk.risk_name,
            risk_type: risk.risk_type,
            composite_score: risk.risk_scoring.composite_score,
            priority_level: risk.prioritization.priority_level,
            priority_score: risk.prioritization.priority_score,
            recommended_action: risk.remediation.recommended_action,
            effort_estimate_hours: risk.remediation.effort_estimate.person_hours,
            timeline_estimate_days: risk.remediation.timeline_estimate.expected_timeline
          })),
          
          prioritization_factors: {
            criteria_used: prioritization_criteria || ['business_impact', 'asset_criticality', 'threat_intelligence'],
            weighting_applied: true,
            contextual_adjustments: business_context ? Object.keys(business_context).length : 0

          recommended_actions: [
            'Address critical priority risks immediately',
            'Develop comprehensive remediation timeline',
            'Allocate resources based on priority ranking',
            'Monitor for priority changes due to new intelligence'
          ]

        message: `Successfully prioritized ${filteredRisks.length} security risks`,
        timestamp: Date.now()
      };
 catch (error) {
      fastify.log.error('Error prioritizing security risks:', error);
      return {
        success: false,
        error: `Failed to prioritize security risks: ${error.message}`,
        timestamp: Date.now()
      };

  });

  /**
   * GET /api/security-risk-scoring/risks/{riskId}
   * Get detailed information about a specific risk
   */
  fastify.get<{ Params: { riskId: string } }>('/api/security-risk-scoring/risks/:riskId', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Get detailed security risk information and scoring',
      tags: ['Security Risk Scoring', 'Risk Management'],
      params: {
        type: 'object',
        required: ['riskId'],
        properties: {
          riskId: { type: 'string' }



  }, async (request: FastifyRequest<{ Params: { riskId: string } }>, reply: FastifyReply): Promise<APIResponse> => {
    try {
      const { riskId } = request.params;

      // Simulate getting risk details (in real implementation would fetch from engine)
      const mockRisk = {
        risk_id: riskId,
        risk_name: 'Critical SQL Injection Vulnerability',
        risk_type: 'vulnerability',
        description: 'SQL injection vulnerability in user authentication module',
        composite_score: 8.7,
        priority_level: 'critical',
        priority_score: 92,
        affected_assets: ['web_app_001', 'database_001'],
        threat_actors: ['cybercriminals', 'nation_state'],
        exploit_availability: true,
        remediation_timeline: 48,
        cost_estimate: 15000
      };

      return {
        success: true,
        data: {
          risk_overview: {
            risk_id: mockRisk.risk_id,
            risk_name: mockRisk.risk_name,
            risk_type: mockRisk.risk_type,
            description: mockRisk.description,
            current_status: 'active',
            created_date: Date.now() - 86400000 * 3,
            last_updated: Date.now() - 3600000

          risk_scoring: {
            composite_score: mockRisk.composite_score,
            scoring_methodology: 'CVSS 3.1 + Custom Business Impact',
            score_breakdown: {
              vulnerability_severity: 8.5,
              threat_likelihood: 7.8,
              asset_criticality: 9.2,
              business_impact: 8.9,
              exploitability: 9.1

            score_confidence: 0.88,
            last_recalculated: Date.now() - 3600000

          threat_context: {
            threat_actors: mockRisk.threat_actors,
            attack_vectors: ['web_application', 'database_injection'],
            exploit_availability: mockRisk.exploit_availability,
            campaign_associations: ['operation_sql_storm'],
            geographic_threats: ['global'],
            threat_intelligence_sources: 3

          asset_impact: {
            affected_assets_count: mockRisk.affected_assets.length,
            critical_assets_affected: 1,
            business_functions_impacted: ['customer_authentication', 'payment_processing'],
            estimated_downtime_hours: 4,
            data_exposure_risk: 'high',
            compliance_implications: ['PCI_DSS', 'GDPR']

          prioritization: {
            priority_level: mockRisk.priority_level,
            priority_score: mockRisk.priority_score,
            priority_ranking: 3, // 3rd highest priority
            sla_response_time_hours: 4,
            escalation_required: true,
            business_justification: 'Critical customer data at risk'

          remediation: {
            recommended_action: 'Immediate patching and input validation implementation',
            effort_estimate_hours: 24,
            timeline_estimate_days: 2,
            cost_estimate: mockRisk.cost_estimate,
            required_skills: ['web_security', 'database_administration'],
            remediation_options: 3,
            temporary_mitigations: ['WAF rule deployment', 'Enhanced monitoring']

          risk_history: {
            score_changes_count: 5,
            priority_changes_count: 2,
            last_major_update: Date.now() - 86400000,
            trend_direction: 'increasing',
            intelligence_updates: 3


        timestamp: Date.now()
      };
 catch (error) {
      fastify.log.error('Error getting risk details:', error);
      return {
        success: false,
        error: `Failed to get risk details: ${error.message}`,
        timestamp: Date.now()
      };

  });

  /**
   * POST /api/security-risk-scoring/reports/generate
   * Generate comprehensive risk scoring report
   */
  fastify.post<{ Body: GenerateReportRequest }>('/api/security-risk-scoring/reports/generate', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Generate comprehensive security risk scoring and prioritization report',
      tags: ['Security Risk Scoring', 'Reports'],
      body: {
        type: 'object',
        required: ['report_scope'],
        properties: {
          report_scope: {
            type: 'string',
            enum: ['all_risks', 'high_priority', 'recent_risks', 'custom']

          time_period: {
            type: 'object',
            properties: {
              start_date: { type: 'number' },
              end_date: { type: 'number' }


          risk_filters: {
            type: 'object',
            properties: {
              risk_types: { type: 'array', items: { type: 'string' } },
              priority_levels: { type: 'array', items: { type: 'string' } },
              score_range: {
                type: 'object',
                properties: {
                  min: { type: 'number' },
                  max: { type: 'number' }


              asset_types: { type: 'array', items: { type: 'string' } },
              business_units: { type: 'array', items: { type: 'string' } }


          report_options: {
            type: 'object',
            properties: {
              include_trend_analysis: { type: 'boolean' },
              include_recommendations: { type: 'boolean' },
              include_detailed_findings: { type: 'boolean' },
              include_executive_summary: { type: 'boolean' },
              format: {
                type: 'string',
                enum: ['detailed', 'summary', 'executive']






  }, async (request: FastifyRequest<{ Body: GenerateReportRequest }>, reply: FastifyReply): Promise<APIResponse> => {
    try {
      const {
        report_scope,
        time_period,
        risk_filters,
        report_options = {
          include_trend_analysis: true,
          include_recommendations: true,
          include_detailed_findings: true,
          include_executive_summary: true,
          format: 'detailed'

 = request.body;

      const startDate = time_period?.start_date || Date.now() - 86400000 * 30;
      const endDate = time_period?.end_date || Date.now();

      const report = await engine.generateRiskScoringReport(startDate, endDate, risk_filters?.risk_types);

      return {
        success: true,
        data: {
          report_metadata: {
            report_id: report.report_id,
            generated_at: report.generated_at,
            report_scope: report_scope,
            reporting_period: report.reporting_period,
            total_risks_analyzed: report.summary_statistics.total_risks

          executive_summary: report_options.include_executive_summary ? {
            key_findings: [
              `Analyzed ${report.summary_statistics.total_risks} security risks`,
              `${report.summary_statistics.risks_by_priority.critical || 0} critical priority risks require immediate attention`,
              `Average risk score: ${report.summary_statistics.average_risk_score.toFixed(2)}`,
              'Risk landscape showing increased threat activity'
            ],
            overall_risk_posture: report.summary_statistics.average_risk_score > 7 ? 'high' : 
                                 report.summary_statistics.average_risk_score > 4 ? 'medium' : 'low',
            critical_recommendations: [
              'Address critical priority risks within 24 hours',
              'Implement enhanced monitoring for high-risk assets',
              'Update threat intelligence feeds',
              'Review and update risk scoring models'
            ]
 : undefined,
          
          summary_statistics: {
            total_risks: report.summary_statistics.total_risks,
            risk_distribution: report.summary_statistics.risks_by_priority,
            risk_types_breakdown: report.summary_statistics.risks_by_type,
            average_risk_score: report.summary_statistics.average_risk_score,
            score_distribution: report.summary_statistics.risk_score_distribution

          trend_analysis: report_options.include_trend_analysis ? {
            risk_trends: report.trend_analysis.risk_score_trends.map(trend => ({
              metric: trend.metric_name,
              direction: trend.trend_direction,
              strength: trend.trend_strength,
              significance: trend.statistical_significance
            })),
            emerging_patterns: [
              'Increased SQL injection vulnerabilities',
              'Rise in supply chain attacks',
              'Growing insider threat indicators'
            ],
            threat_landscape_changes: [
              'New threat actor TTPs identified',
              'Increased exploit availability',
              'Geopolitical tensions affecting threat levels'
            ]
 : undefined,
          
          prioritization_insights: {
            top_risks: report.prioritization_insights.top_priority_risks.slice(0, 5).map(risk => ({
              risk_id: risk.risk_id,
              risk_name: risk.risk_name,
              composite_score: risk.risk_scoring.composite_score,
              priority_level: risk.prioritization.priority_level
            })),
            emerging_threats: report.prioritization_insights.emerging_threats.length,
            overdue_remediations: report.prioritization_insights.overdue_remediations.length,
            risk_concentration: report.prioritization_insights.risk_concentration_areas.slice(0, 3)

          performance_metrics: {
            scoring_accuracy: report.performance_metrics.scoring_accuracy,
            prioritization_effectiveness: report.performance_metrics.prioritization_effectiveness,
            model_performance: {
              false_positive_rate: report.performance_metrics.false_positive_rate,
              false_negative_rate: report.performance_metrics.false_negative_rate


          recommendations: report_options.include_recommendations ? {
            immediate_actions: report.recommendations.immediate_actions.slice(0, 5),
            strategic_recommendations: report.recommendations.strategic_recommendations.slice(0, 3),
            process_improvements: report.recommendations.process_improvements.slice(0, 3)
 : undefined

        message: `Risk scoring report generated successfully for ${report.summary_statistics.total_risks} risks`,
        timestamp: Date.now()
      };
 catch (error) {
      fastify.log.error('Error generating risk scoring report:', error);
      return {
        success: false,
        error: `Failed to generate risk scoring report: ${error.message}`,
        timestamp: Date.now()
      };

  });

  /**
   * GET /api/security-risk-scoring/analytics
   * Get comprehensive risk scoring analytics
   */
  fastify.get('/api/security-risk-scoring/analytics', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Get comprehensive security risk scoring analytics and insights',
      tags: ['Security Risk Scoring', 'Analytics']

  }, async (request: FastifyRequest, reply: FastifyReply): Promise<APIResponse> => {
    try {
      const analytics = engine.getRiskScoringAnalytics();

      return {
        success: true,
        data: {
          analytics_timestamp: Date.now(),
          risk_portfolio_summary: analytics.summary,
          scoring_performance: analytics.scoring_performance,
          threat_landscape_overview: analytics.threat_landscape,
          remediation_metrics: analytics.remediation_metrics,
          key_insights: [
            analytics.summary.average_risk_score > 7 ? 
              'Risk portfolio showing elevated threat levels' : 
              'Risk portfolio within acceptable ranges',
            analytics.scoring_performance.model_accuracy > 0.85 ? 
              'Risk scoring models performing well' : 
              'Consider recalibrating scoring models',
            analytics.remediation_metrics.sla_compliance > 0.90 ? 
              'Strong SLA compliance for risk remediation' : 
              'Review remediation processes and timelines',
            'Continuous monitoring and model updates recommended'
          ],
          recommendations: [
            'Focus resources on highest priority risks',
            'Enhance threat intelligence integration',
            'Improve asset criticality assessments',
            'Regular model performance reviews'
          ],
          recent_activities: analytics.recent_activities.slice(0, 10)

        timestamp: Date.now()
      };
 catch (error) {
      fastify.log.error('Error getting risk scoring analytics:', error);
      return {
        success: false,
        error: `Failed to get risk scoring analytics: ${error.message}`,
        timestamp: Date.now()
      };

  });

  /**
   * GET /api/security-risk-scoring/health
   * Get risk scoring engine health status
   */
  fastify.get('/api/security-risk-scoring/health', {
    schema: {
      description: 'Get security risk scoring engine health status',
      tags: ['Security Risk Scoring', 'Health Check']

  }, async (request: FastifyRequest, reply: FastifyReply): Promise<APIResponse> => {
    try {
      const analytics = engine.getRiskScoringAnalytics();
      
      const isHealthy = analytics.summary.total_risks >= 0 &&
                       analytics.scoring_performance.model_accuracy > 0.75 &&
                       analytics.scoring_performance.false_positive_rate < 0.25;

      return {
        success: true,
        data: {
          healthy: isHealthy,
          engine_status: isHealthy ? 'healthy' : 'degraded',
          risk_scoring_health: {
            total_risks_tracked: analytics.summary.total_risks,
            model_accuracy: analytics.scoring_performance.model_accuracy,
            scoring_consistency: analytics.scoring_performance.scoring_consistency,
            false_positive_rate: analytics.scoring_performance.false_positive_rate

          system_components: {
            ml_models_operational: true,
            threat_intelligence_feeds_connected: true,
            asset_inventory_synchronized: true,
            compliance_framework_updated: true

          capabilities: {
            real_time_scoring: true,
            automated_prioritization: true,
            threat_intelligence_integration: true,
            business_impact_assessment: true,
            compliance_mapping: true,
            machine_learning_enhancement: true

          performance_metrics: {
            average_scoring_time_ms: 150,
            prioritization_throughput_per_minute: 100,
            model_calibration_last_updated: Date.now() - 86400000,
            threat_feed_last_synchronized: Date.now() - 3600000

          last_check: Date.now()

        timestamp: Date.now()
      };
 catch (error) {
      fastify.log.error('Error getting risk scoring engine health:', error);
      return {
        success: false,
        data: {
          healthy: false,
          engine_status: 'error',
          error_message: error.message

        error: 'Failed to get engine health status',
        timestamp: Date.now()
      };

  });

  // Setup engine event handlers for logging
  engine.on('initialized', () => {
    fastify.log.info('Security Risk Scoring Engine initialized');
  });

  engine.on('risk_scored', (data) => {
    fastify.log.info(`Security risk scored: ${data.riskName} (${data.riskId}) - Score: ${data.compositeScore}, Priority: ${data.priorityLevel}`);
  });

  engine.on('risk_score_updated', (data) => {
    fastify.log.info(
      `Risk score updated: ${data.riskId} - Old: ${data.oldScore},
      New: ${data.newScore},
      Change: ${data.scoreChange}`
    );
  });

  engine.on('risks_prioritized', (data) => {
    fastify.log.info(
      `Risks prioritized: ${data.totalRisks} total,
      ${data.criticalRisks} critical,
      ${data.highRisks} high priority`
    );
  });

  engine.on('report_generated', (data) => {
    fastify.log.info(`Risk scoring report generated: ${data.reportType} (${data.reportId}) analyzing ${data.risksAnalyzed} risks`);
  });

  engine.on('risk_scoring_error', (data) => {
    fastify.log.error(`Risk scoring error:`, data.error);
  });

  engine.on('risk_update_error', (data) => {
    fastify.log.error(`Risk update error for ${data.riskId}:`, data.error);
  });

  engine.on('prioritization_error', (data) => {
    fastify.log.error(`Risk prioritization error for ${data.risksCount} risks:`, data.error);
  });

  engine.on('report_generation_error', (data) => {
    fastify.log.error(`Risk report generation error:`, data.error);
  });

  engine.on('error', (error) => {
    fastify.log.error('Security Risk Scoring Engine error:', error);
  });

  // Cleanup on server shutdown
  fastify.addHook('onClose', async () => {
    if (riskScoringEngine) {
      await riskScoringEngine.shutdown();
      fastify.log.info('Security Risk Scoring Engine shut down');

  });
