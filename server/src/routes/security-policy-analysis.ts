/**
 * Security Policy Analysis and Validation API Routes
 * Epic 31 - Task E31-1753313263607-C43832
 * 
 * RESTful API endpoints for security policy impact analysis, validation,
 * and compliance assessment capabilities.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { 
  SecurityPolicyAnalysisEngine, 
  SecurityPolicyConfig, 
  SecurityPolicy, 
  PolicyImpactAnalysis 
 from '../services/SecurityPolicyAnalysisEngine';
import { SecurityAPIIntegrationPlatform } from '../services/SecurityAPIIntegrationPlatform';
import { SecurityOptimizationEngine } from '../services/SecurityOptimizationEngine';

// Global engine instance
let policyAnalysisEngine: SecurityPolicyAnalysisEngine | null = null;



interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: number;




interface PolicyAnalysisRequest {
  policy: SecurityPolicy;
  analysis_type?: 'pre_deployment' | 'post_deployment' | 'periodic_review';
  include_simulation?: boolean;







interface PolicyValidationRequest {
  policy: SecurityPolicy;
  validation_level?: 'basic' | 'comprehensive';
  compliance_standards?: string[];







interface PolicyComparisonRequest {
  current_policy: SecurityPolicy;
  new_policy: SecurityPolicy;
  include_detailed_analysis?: boolean;





/**
 * Initialize security policy analysis engine
 */
async function initializePolicyAnalysisEngine(
  platform: SecurityAPIIntegrationPlatform,
  optimizationEngine: SecurityOptimizationEngine
): Promise<SecurityPolicyAnalysisEngine> {

  if (policyAnalysisEngine) {
    return policyAnalysisEngine;


  const config: SecurityPolicyConfig = {
    analysis_settings: {
      enabled: true,
      deep_analysis_enabled: true,
      impact_simulation_enabled: true,
      compliance_checking_enabled: true,
      historical_analysis_enabled: true

    validation_framework: {
      enabled: true,
      automated_validation: true,
      validation_rules: [
        'no_wildcard_permissions',
        'require_mfa_for_admin',
        'encryption_at_rest',
        'audit_logging_required',
        'least_privilege_principle'
      ],
      compliance_standards: ['SOX', 'PCI_DSS', 'HIPAA', 'GDPR', 'SOC2'],
      risk_assessment_enabled: true

    policy_categories: {
      access_control: true,
      authentication: true,
      authorization: true,
      data_protection: true,
      network_security: true,
      compliance: true,
      incident_response: true

    impact_assessment: {
      user_impact_analysis: true,
      system_impact_analysis: true,
      performance_impact_analysis: true,
      security_impact_analysis: true,
      compliance_impact_analysis: true,
      cost_impact_analysis: true

    approval_workflow: {
      enabled: true,
      require_approval_for: ['high', 'critical'],
      approval_levels: 2,
      auto_approve_low_risk: true,
      notification_enabled: true

  };

  policyAnalysisEngine = new SecurityPolicyAnalysisEngine(config, platform, optimizationEngine);
  await policyAnalysisEngine.initialize();

  return policyAnalysisEngine;


export default async function securityPolicyAnalysisRoutes(
  fastify: FastifyInstance,
  platform: SecurityAPIIntegrationPlatform,
  optimizationEngine: SecurityOptimizationEngine
) {
  // Initialize engine
  const engine = await initializePolicyAnalysisEngine(platform, optimizationEngine);

  /**
   * POST /api/security-policy/analyze
   * Analyze the impact of a security policy
   */
  fastify.post<{ Body: PolicyAnalysisRequest }>('/api/security-policy/analyze', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Analyze security policy impact and generate comprehensive assessment',
      tags: ['Security Policy', 'Analysis'],
      body: {
        type: 'object',
        required: ['policy'],
        properties: {
          policy: {
            type: 'object',
            required: ['id', 'name', 'category', 'policy_rules'],
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              description: { type: 'string' },
              category: {
                type: 'string',
                enum: ['access_control', 'authentication', 'authorization', 'data_protection', 'network_security', 'compliance', 'incident_response']

              version: { type: 'string' },
              policy_rules: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['rule_id', 'rule_type', 'conditions', 'actions'],
                  properties: {
                    rule_id: { type: 'string' },
                    rule_type: { type: 'string', enum: ['allow', 'deny', 'monitor', 'alert'] },
                    conditions: { type: 'array' },
                    actions: { type: 'array' },
                    exceptions: { type: 'array' }



              metadata: {
                type: 'object',
                properties: {
                  created_by: { type: 'string' },
                  created_at: { type: 'number' },
                  last_modified: { type: 'number' },
                  status: { type: 'string', enum: ['draft', 'active', 'deprecated', 'archived'] },
                  compliance_mappings: { type: 'array', items: { type: 'string' } },
                  risk_level: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] }


              enforcement: {
                type: 'object',
                properties: {
                  enforcement_mode: { type: 'string', enum: ['enforcing', 'permissive', 'disabled'] },
                  enforcement_scope: { type: 'array', items: { type: 'string' } },
                  rollback_enabled: { type: 'boolean' },
                  monitoring_enabled: { type: 'boolean' }




          analysis_type: {
            type: 'string',
            enum: ['pre_deployment', 'post_deployment', 'periodic_review']

          include_simulation: { type: 'boolean' }



  }, async (request: FastifyRequest<{ Body: PolicyAnalysisRequest }>, reply: FastifyReply): Promise<APIResponse> => {
    try {
      const { policy, analysis_type = 'pre_deployment', include_simulation = false } = request.body;

      // Temporarily set simulation config based on request
      if (include_simulation) {
        (engine as any).config.analysis_settings.impact_simulation_enabled = true;


      const analysis = await engine.analyzePolicyImpact(policy, analysis_type);

      return {
        success: true,
        data: {
          analysis_id: analysis.analysis_id,
          policy_id: analysis.policy_id,
          analysis_type: analysis.analysis_type,
          timestamp: analysis.timestamp,
          impact_assessment: analysis.impact_assessment,
          risk_analysis: analysis.risk_analysis,
          validation_results: analysis.validation_results,
          simulation_results: analysis.simulation_results,
          summary: {
            overall_risk_score: analysis.risk_analysis.overall_risk_score,
            validation_passed: analysis.validation_results.validation_passed,
            critical_issues: analysis.validation_results.validation_errors.filter(e => e.severity === 'critical').length,
            compliance_violations: analysis.validation_results.compliance_violations.length,
            estimated_affected_users: analysis.impact_assessment.user_impact.affected_users,
            estimated_cost_impact: analysis.impact_assessment.cost_impact.total_cost_impact


        message: 'Policy analysis completed successfully',
        timestamp: Date.now()
      };
 catch (error) {
      fastify.log.error('Error analyzing security policy:', error);
      return {
        success: false,
        error: `Failed to analyze security policy: ${error.message}`,
        timestamp: Date.now()
      };

  });

  /**
   * POST /api/security-policy/validate
   * Validate a security policy
   */
  fastify.post<{ Body: PolicyValidationRequest }>('/api/security-policy/validate', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Validate security policy against rules and compliance standards',
      tags: ['Security Policy', 'Validation'],
      body: {
        type: 'object',
        required: ['policy'],
        properties: {
          policy: { type: 'object' }, // Same as above policy schema
          validation_level: {
            type: 'string',
            enum: ['basic', 'comprehensive']

          compliance_standards: {
            type: 'array',
            items: { type: 'string' }




  }, async (request: FastifyRequest<{ Body: PolicyValidationRequest }>, reply: FastifyReply): Promise<APIResponse> => {
    try {
      const { policy, validation_level = 'comprehensive', compliance_standards } = request.body;

      const validationResults = await engine.validatePolicy(policy);

      // Filter results based on validation level
      let filteredErrors = validationResults.validation_errors;
      let filteredWarnings = validationResults.validation_warnings;
      let filteredViolations = validationResults.compliance_violations;

      if (validation_level === 'basic') {
        filteredErrors = filteredErrors.filter(e => e.severity === 'high' || e.severity === 'critical');
        filteredWarnings = filteredWarnings.filter(w => w.warning_type === 'security');


      if (compliance_standards && compliance_standards.length > 0) {
        filteredViolations = filteredViolations.filter(v => 
          compliance_standards.includes(v.compliance_framework)
        );


      return {
        success: true,
        data: {
          policy_id: policy.id,
          validation_passed: filteredErrors.length === 0,
          validation_summary: {
            total_errors: filteredErrors.length,
            critical_errors: filteredErrors.filter(e => e.severity === 'critical').length,
            high_errors: filteredErrors.filter(e => e.severity === 'high').length,
            total_warnings: filteredWarnings.length,
            compliance_violations: filteredViolations.length

          validation_errors: filteredErrors,
          validation_warnings: filteredWarnings,
          compliance_violations: filteredViolations,
          recommendations: validationResults.recommendations,
          validation_score: Math.max(0, 100 - (filteredErrors.length * 10) - (filteredWarnings.length * 2))

        message: validationResults.validation_passed ? 'Policy validation passed' : 'Policy validation found issues',
        timestamp: Date.now()
      };
 catch (error) {
      fastify.log.error('Error validating security policy:', error);
      return {
        success: false,
        error: `Failed to validate security policy: ${error.message}`,
        timestamp: Date.now()
      };

  });

  /**
   * POST /api/security-policy/compare
   * Compare two policy versions and analyze differences
   */
  fastify.post<{ Body: PolicyComparisonRequest }>('/api/security-policy/compare', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Compare two security policy versions and analyze impact differences',
      tags: ['Security Policy', 'Comparison'],
      body: {
        type: 'object',
        required: ['current_policy', 'new_policy'],
        properties: {
          current_policy: { type: 'object' },
          new_policy: { type: 'object' },
          include_detailed_analysis: { type: 'boolean' }



  }, async (request: FastifyRequest<{ Body: PolicyComparisonRequest }>, reply: FastifyReply): Promise<APIResponse> => {
    try {
      const { current_policy, new_policy, include_detailed_analysis = false } = request.body;

      const comparison = await engine.comparePolicyVersions(current_policy, new_policy);

      let detailedAnalysis = {};
      if (include_detailed_analysis) {
        const currentAnalysis = await engine.analyzePolicyImpact(current_policy, 'pre_deployment');
        const newAnalysis = await engine.analyzePolicyImpact(new_policy, 'pre_deployment');
        
        detailedAnalysis = {
          current_analysis: currentAnalysis,
          new_analysis: newAnalysis
        };


      return {
        success: true,
        data: {
          comparison_id: `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          current_policy_id: current_policy.id,
          new_policy_id: new_policy.id,
          changes_detected: comparison.changes_detected,
          change_summary: comparison.change_summary,
          impact_delta: comparison.impact_delta,
          risk_change: comparison.risk_change,
          risk_change_classification: this.classifyRiskChange(comparison.risk_change),
          recommendations: comparison.recommendations,
          approval_required: this.determineApprovalRequired(comparison),
          ...detailedAnalysis

        message: comparison.changes_detected ? 'Policy changes detected and analyzed' : 'No significant changes detected',
        timestamp: Date.now()
      };
 catch (error) {
      fastify.log.error('Error comparing security policies:', error);
      return {
        success: false,
        error: `Failed to compare security policies: ${error.message}`,
        timestamp: Date.now()
      };

  });

  /**
   * GET /api/security-policy/{policyId}/history
   * Get policy analysis history
   */
  fastify.get<{ Params: { policyId: string } }>('/api/security-policy/:policyId/history', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Get analysis history for a specific security policy',
      tags: ['Security Policy', 'History'],
      params: {
        type: 'object',
        required: ['policyId'],
        properties: {
          policyId: { type: 'string' }



  }, async (request: FastifyRequest<{ Params: { policyId: string } }>, reply: FastifyReply): Promise<APIResponse> => {
    try {
      const { policyId } = request.params;

      const history = engine.getPolicyAnalysisHistory(policyId);

      return {
        success: true,
        data: {
          policy_id: policyId,
          total_analyses: history.length,
          analysis_history: history.map(analysis => ({
            analysis_id: analysis.analysis_id,
            timestamp: analysis.timestamp,
            analysis_type: analysis.analysis_type,
            overall_risk_score: analysis.risk_analysis.overall_risk_score,
            validation_passed: analysis.validation_results.validation_passed,
            security_effectiveness_score: analysis.impact_assessment.security_impact.security_effectiveness_score,
            compliance_score: analysis.impact_assessment.compliance_impact.compliance_score,
            performance_score: analysis.impact_assessment.performance_impact.performance_score,
            estimated_cost_impact: analysis.impact_assessment.cost_impact.total_cost_impact
          })),
          trends: this.calculatePolicyTrends(history)

        timestamp: Date.now()
      };
 catch (error) {
      fastify.log.error('Error getting policy analysis history:', error);
      return {
        success: false,
        error: `Failed to get policy analysis history: ${error.message}`,
        timestamp: Date.now()
      };

  });

  /**
   * GET /api/security-policy/analytics
   * Get comprehensive policy analytics
   */
  fastify.get('/api/security-policy/analytics', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Get comprehensive security policy analytics and insights',
      tags: ['Security Policy', 'Analytics']

  }, async (request: FastifyRequest, reply: FastifyReply): Promise<APIResponse> => {
    try {
      const analytics = engine.getPolicyAnalytics();

      return {
        success: true,
        data: {
          analytics_timestamp: Date.now(),
          policy_summary: analytics.summary,
          validation_metrics: analytics.validation_metrics,
          impact_trends: analytics.impact_trends,
          recent_analyses: analytics.recent_analyses.map(analysis => ({
            policy_id: analysis.policy_id,
            analysis_id: analysis.analysis_id,
            timestamp: analysis.timestamp,
            analysis_type: analysis.analysis_type,
            overall_risk_score: analysis.risk_analysis.overall_risk_score,
            validation_passed: analysis.validation_results.validation_passed
          })),
          insights: this.generatePolicyInsights(analytics)

        timestamp: Date.now()
      };
 catch (error) {
      fastify.log.error('Error getting policy analytics:', error);
      return {
        success: false,
        error: `Failed to get policy analytics: ${error.message}`,
        timestamp: Date.now()
      };

  });

  /**
   * GET /api/security-policy/health
   * Get policy analysis engine health status
   */
  fastify.get('/api/security-policy/health', {
    schema: {
      description: 'Get security policy analysis engine health status',
      tags: ['Security Policy', 'Health Check']

  }, async (request: FastifyRequest, reply: FastifyReply): Promise<APIResponse> => {
    try {
      const analytics = engine.getPolicyAnalytics();
      
      const isHealthy = analytics.validation_metrics.overall_validation_pass_rate > 80 &&
                       analytics.summary.total_policies > 0;

      return {
        success: true,
        data: {
          healthy: isHealthy,
          engine_status: isHealthy ? 'healthy' : 'degraded',
          policy_health: {
            total_policies: analytics.summary.total_policies,
            validation_pass_rate: analytics.validation_metrics.overall_validation_pass_rate,
            average_security_score: analytics.impact_trends.average_security_impact,
            average_compliance_score: analytics.impact_trends.average_compliance_score

          system_metrics: {
            analysis_engine_initialized: true,
            validation_rules_loaded: true,
            compliance_frameworks_loaded: true,
            recent_analysis_count: analytics.recent_analyses.length

          last_check: Date.now()

        timestamp: Date.now()
      };
 catch (error) {
      fastify.log.error('Error getting policy analysis engine health:', error);
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

  // Helper methods
  const classifyRiskChange = (riskChange: number): string => {
    if (riskChange > 20) return 'significant_increase';
    if (riskChange > 5) return 'moderate_increase';
    if (riskChange > -5) return 'minimal_change';
    if (riskChange > -20) return 'moderate_decrease';
    return 'significant_decrease';
  };

  const determineApprovalRequired = (comparison: Record<string, unknown>): boolean => {
    return comparison.risk_change > 10 || 
           Math.abs(comparison.impact_delta.security_impact_delta) > 20 ||
           comparison.impact_delta.cost_impact_delta > 5000;
  };

  const calculatePolicyTrends = (history: PolicyImpactAnalysis[]): Record<string, unknown> => {
    if (history.length < 2) {
      return {
        risk_trend: 'insufficient_data',
        security_trend: 'insufficient_data',
        compliance_trend: 'insufficient_data'
      };


    const recent = history.slice(-5);
    const riskTrend = this.calculateTrend(recent.map(h => h.risk_analysis.overall_risk_score));
    const securityTrend = this.calculateTrend(recent.map(h => h.impact_assessment.security_impact.security_effectiveness_score));
    const complianceTrend = this.calculateTrend(recent.map(h => h.impact_assessment.compliance_impact.compliance_score));

    return {
      risk_trend: riskTrend,
      security_trend: securityTrend,
      compliance_trend: complianceTrend,
      trend_period_analyses: recent.length
    };
  };

  const calculateTrend = (values: number[]): string => {
    if (values.length < 2) return 'insufficient_data';
    
    const first = values[0];
    const last = values[values.length - 1];
    const change = ((last - first) / first) * 100;
    
    if (change > 5) return 'improving';
    if (change < -5) return 'declining';
    return 'stable';
  };

  const generatePolicyInsights = (analytics: Record<string, unknown>): string[] => {
    const insights: string[] = [];
    
    if (analytics.validation_metrics.overall_validation_pass_rate < 80) {
      insights.push('Policy validation pass rate is below recommended threshold (80%)');

    
    if (analytics.impact_trends.average_security_impact < 70) {
      insights.push('Average security effectiveness score indicates room for improvement');

    
    if (analytics.impact_trends.average_compliance_score < 85) {
      insights.push('Compliance scores suggest need for policy reviews');

    
    const highRiskPolicies = analytics.impact_trends.risk_score_distribution.high + 
                           analytics.impact_trends.risk_score_distribution.critical;
    const totalPolicies = Object.values(analytics.impact_trends.risk_score_distribution).reduce((sum: number, count: number) => sum + count, 0);
    
    if (totalPolicies > 0 && (highRiskPolicies / totalPolicies) > 0.2) {
      insights.push('High percentage of policies classified as high or critical risk');

    
    if (insights.length === 0) {
      insights.push('Policy portfolio appears to be in good health');

    
    return insights;
  };

  // Setup engine event handlers for logging
  engine.on('initialized', () => {
    fastify.log.info('Security Policy Analysis Engine initialized');
  });

  engine.on('policy_analysis_completed', (data) => {
    fastify.log.info(`Policy analysis completed: ${data.policyId} (${data.analysisId})`);
  });

  engine.on('policy_analysis_error', (data) => {
    fastify.log.error(`Policy analysis error for ${data.policyId}:`, data.error);
  });

  engine.on('policy_validation_error', (data) => {
    fastify.log.error(`Policy validation error for ${data.policyId}:`, data.error);
  });

  engine.on('policy_comparison_error', (data) => {
    fastify.log.error(`Policy comparison error between ${data.currentPolicyId} and ${data.newPolicyId}:`, data.error);
  });

  engine.on('error', (error) => {
    fastify.log.error('Security Policy Analysis Engine error:', error);
  });

  // Cleanup on server shutdown
  fastify.addHook('onClose', async () => {
    if (policyAnalysisEngine) {
      await policyAnalysisEngine.shutdown();
      fastify.log.info('Security Policy Analysis Engine shut down');

  });
