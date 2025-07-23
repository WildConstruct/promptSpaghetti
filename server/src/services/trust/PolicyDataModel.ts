/**
 * Policy Data Model - Epic 17
 * 
 * Comprehensive data model for policy management in the trust and verification
 * system. Supports various policy types including enforcement, compliance,
 * content moderation, and operational policies with hierarchical organization.
 * 
 * Task: E17-1753114397365-A62FA8 - Create policy data model
 * Epic: 17 - Backstage Admin Controls
 */

import { Database } from '../../database';

// =============================================================================
// Core Policy Types
// =============================================================================

export type PolicyType = 
  | 'enforcement'           // Trust score and risk factor enforcement
  | 'content_moderation'    // Content quality and safety policies
  | 'compliance'            // Regulatory and legal compliance
  | 'security'              // Security and fraud prevention
  | 'operational'           // Platform operational rules
  | 'community'             // Community standards and behavior
  | 'commerce'              // Transaction and marketplace policies
  | 'verification'          // Identity and document verification
  | 'privacy'               // Data privacy and protection
  | 'accessibility';        // Accessibility and inclusion

export type PolicyStatus = 'draft' | 'active' | 'inactive' | 'deprecated' | 'archived';

export type PolicySeverity = 'low' | 'medium' | 'high' | 'critical';

export type PolicyScope = 'global' | 'regional' | 'user_type' | 'template_category' | 'custom';

export type ConditionOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'not_in' | 'contains' | 'regex' | 'between';

export type ActionType = 
  | 'suspend' | 'restrict' | 'flag' | 'warn' | 'require_verification'
  | 'block_transaction' | 'quarantine_template' | 'limit_access'
  | 'send_notification' | 'log_event' | 'escalate' | 'custom';

// =============================================================================
// Policy Structure Interfaces
// =============================================================================

export interface PolicyMetadata {
  id: string;
  name: string;
  description: string;
  type: PolicyType;
  status: PolicyStatus;
  version: string;
  created_at: Date;
  updated_at: Date;
  created_by: string;
  updated_by: string;
  effective_date: Date;
  expiration_date?: Date;
  tags: string[];
  category?: string;
  subcategory?: string;
}

export interface PolicyScope {
  scope_type: PolicyScope;
  scope_criteria: {
    regions?: string[];
    user_types?: string[];
    template_categories?: string[];
    verification_levels?: string[];
    trust_score_ranges?: {
      min?: number;
      max?: number;
    };
    custom_filters?: Array<{
      field: string;
      operator: ConditionOperator;
      value: any;
    }>;
  };
  exceptions?: {
    entity_ids?: string[];
    conditions?: PolicyCondition[];
  };
}

export interface PolicyCondition {
  id: string;
  name: string;
  description?: string;
  field: string;
  operator: ConditionOperator;
  value: any;
  data_type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'date';
  required: boolean;
  group?: string;
  logical_operator?: 'AND' | 'OR';
  weight?: number;
}

export interface PolicyAction {
  id: string;
  type: ActionType;
  name: string;
  description?: string;
  severity: PolicySeverity;
  auto_execute: boolean;
  parameters: Record<string, any>;
  conditions?: PolicyCondition[];
  delay?: number; // seconds
  expiration?: number; // seconds
  retry_policy?: {
    max_attempts: number;
    retry_delay: number;
    backoff_factor: number;
  };
  notifications?: {
    admin: boolean;
    user: boolean;
    webhook?: string;
    email_template?: string;
  };
}

export interface PolicyRule {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  priority: number;
  conditions: PolicyCondition[];
  actions: PolicyAction[];
  condition_logic: 'ALL' | 'ANY' | 'CUSTOM';
  custom_logic?: string; // JavaScript expression
  rate_limiting?: {
    max_triggers: number;
    time_window: number; // seconds
    cooldown_period: number; // seconds
  };
  audit_settings: {
    log_evaluations: boolean;
    log_actions: boolean;
    include_context: boolean;
  };
}

export interface PolicyConfiguration {
  global_settings: {
    default_severity: PolicySeverity;
    auto_execution_enabled: boolean;
    audit_enabled: boolean;
    notification_enabled: boolean;
  };
  thresholds: Record<string, {
    warning: number;
    critical: number;
    severe: number;
  }>;
  timeouts: {
    evaluation_timeout: number;
    action_timeout: number;
    retry_timeout: number;
  };
  rate_limits: {
    evaluations_per_second: number;
    actions_per_minute: number;
    notifications_per_hour: number;
  };
  feature_flags: Record<string, boolean>;
}

// =============================================================================
// Complete Policy Definition
// =============================================================================

export interface Policy {
  metadata: PolicyMetadata;
  scope: PolicyScope;
  rules: PolicyRule[];
  configuration: PolicyConfiguration;
  dependencies?: {
    required_policies?: string[];
    conflicting_policies?: string[];
    prerequisite_conditions?: PolicyCondition[];
  };
  compliance?: {
    regulatory_framework: string[];
    audit_requirements: string[];
    retention_period: number; // days
    data_classification: 'public' | 'internal' | 'confidential' | 'restricted';
  };
  testing?: {
    test_cases: PolicyTestCase[];
    simulation_data: any[];
    performance_benchmarks: {
      max_evaluation_time: number;
      max_memory_usage: number;
      throughput_requirements: number;
    };
  };
}

export interface PolicyTestCase {
  id: string;
  name: string;
  description: string;
  input_data: any;
  expected_conditions: Array<{
    condition_id: string;
    expected_result: boolean;
  }>;
  expected_actions: Array<{
    action_id: string;
    should_trigger: boolean;
  }>;
  test_type: 'unit' | 'integration' | 'performance' | 'security';
}

// =============================================================================
// Policy Evaluation Context
// =============================================================================

export interface PolicyEvaluationContext {
  timestamp: Date;
  entity_type: 'user' | 'template' | 'transaction' | 'system';
  entity_id: string;
  entity_data: any;
  trigger_event: string;
  session_info?: {
    user_id?: string;
    session_id?: string;
    ip_address?: string;
    user_agent?: string;
  };
  environment: {
    region: string;
    platform: string;
    version: string;
  };
  context_data: Record<string, any>;
  parent_evaluation_id?: string;
}

export interface PolicyEvaluationResult {
  evaluation_id: string;
  policy_id: string;
  rule_id: string;
  timestamp: Date;
  context: PolicyEvaluationContext;
  conditions_met: Array<{
    condition_id: string;
    met: boolean;
    value: any;
    evaluation_time: number;
  }>;
  actions_triggered: Array<{
    action_id: string;
    triggered: boolean;
    executed: boolean;
    execution_time?: number;
    result?: any;
    error?: string;
  }>;
  overall_result: 'pass' | 'fail' | 'partial' | 'error';
  execution_time: number;
  memory_usage?: number;
  debug_info?: any;
}

// =============================================================================
// Policy Template System
// =============================================================================

export interface PolicyTemplate {
  template_id: string;
  name: string;
  description: string;
  category: string;
  type: PolicyType;
  version: string;
  template_data: Partial<Policy>;
  parameters: Array<{
    name: string;
    description: string;
    type: string;
    required: boolean;
    default_value?: any;
    validation?: {
      min?: number;
      max?: number;
      pattern?: string;
      options?: any[];
    };
  }>;
  examples: Array<{
    name: string;
    description: string;
    parameter_values: Record<string, any>;
  }>;
  documentation: {
    usage_guide: string;
    best_practices: string[];
    common_pitfalls: string[];
    related_templates: string[];
  };
}

// =============================================================================
// Policy Management Interfaces
// =============================================================================

export interface PolicyVersion {
  version_id: string;
  policy_id: string;
  version_number: string;
  created_at: Date;
  created_by: string;
  changes: Array<{
    field: string;
    old_value: any;
    new_value: any;
    change_type: 'create' | 'update' | 'delete';
  }>;
  change_summary: string;
  rollback_available: boolean;
  deployment_status: 'draft' | 'staged' | 'deployed' | 'rolled_back';
}

export interface PolicyDeployment {
  deployment_id: string;
  policy_id: string;
  version_id: string;
  environment: 'development' | 'staging' | 'production';
  deployed_at: Date;
  deployed_by: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'rolled_back';
  rollout_strategy: {
    type: 'immediate' | 'gradual' | 'canary' | 'blue_green';
    percentage?: number;
    criteria?: PolicyCondition[];
    stages?: Array<{
      name: string;
      percentage: number;
      duration: number;
      success_criteria: PolicyCondition[];
    }>;
  };
  health_checks: Array<{
    name: string;
    status: 'passing' | 'failing' | 'unknown';
    last_check: Date;
    error_message?: string;
  }>;
  metrics: {
    evaluations_per_second: number;
    success_rate: number;
    error_rate: number;
    average_execution_time: number;
  };
}

export interface PolicyAuditLog {
  audit_id: string;
  policy_id: string;
  event_type: 'created' | 'updated' | 'deleted' | 'deployed' | 'evaluated' | 'action_taken';
  timestamp: Date;
  actor: {
    type: 'user' | 'system' | 'api';
    id: string;
    name?: string;
  };
  details: {
    event_data: any;
    context: any;
    result?: any;
    error?: string;
  };
  impact: {
    entities_affected: number;
    risk_level: PolicySeverity;
    reversible: boolean;
  };
  compliance: {
    regulations: string[];
    retention_required: boolean;
    classification: string;
  };
}

// =============================================================================
// Policy Analytics and Reporting
// =============================================================================

export interface PolicyMetrics {
  policy_id: string;
  time_period: {
    start_date: Date;
    end_date: Date;
  };
  evaluation_metrics: {
    total_evaluations: number;
    successful_evaluations: number;
    failed_evaluations: number;
    average_execution_time: number;
    max_execution_time: number;
    evaluations_per_hour: number;
  };
  action_metrics: {
    total_actions: number;
    successful_actions: number;
    failed_actions: number;
    actions_by_type: Record<ActionType, number>;
    false_positive_rate: number;
    false_negative_rate?: number;
  };
  performance_metrics: {
    throughput: number;
    latency_p50: number;
    latency_p95: number;
    latency_p99: number;
    memory_usage: number;
    error_rate: number;
  };
  business_impact: {
    entities_protected: number;
    violations_prevented: number;
    compliance_score: number;
    cost_savings?: number;
    user_satisfaction_impact?: number;
  };
}

export interface PolicyRecommendation {
  recommendation_id: string;
  policy_id: string;
  type: 'optimization' | 'security' | 'compliance' | 'performance' | 'cost';
  priority: PolicySeverity;
  title: string;
  description: string;
  rationale: string;
  suggested_changes: Array<{
    field: string;
    current_value: any;
    suggested_value: any;
    impact: string;
  }>;
  expected_benefits: string[];
  implementation_effort: 'low' | 'medium' | 'high';
  risk_assessment: {
    risk_level: PolicySeverity;
    potential_issues: string[];
    mitigation_strategies: string[];
  };
  generated_at: Date;
  expires_at?: Date;
}

// =============================================================================
// Policy Data Access Layer
// =============================================================================

export class PolicyDataService {
  private db: Database;

  constructor(database: Database) {
    this.db = database;
  }

  // Policy CRUD Operations
  async createPolicy(policy: Policy): Promise<string> {
    const client = await this.db.getClient();
    try {
      await client.query('BEGIN');
      
      // Insert policy metadata
      const policyResult = await client.query(`
        INSERT INTO policies (
          id, name, description, type, status, version, created_by, 
          effective_date, expiration_date, tags, category, subcategory
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id
      `, [
        policy.metadata.id,
        policy.metadata.name,
        policy.metadata.description,
        policy.metadata.type,
        policy.metadata.status,
        policy.metadata.version,
        policy.metadata.created_by,
        policy.metadata.effective_date,
        policy.metadata.expiration_date,
        JSON.stringify(policy.metadata.tags),
        policy.metadata.category,
        policy.metadata.subcategory
      ]);

      const policyId = policyResult.rows[0].id;

      // Insert policy data (scope, rules, configuration)
      await client.query(`
        INSERT INTO policy_data (
          policy_id,
          scope_data,
          rules_data,
          configuration_data,
          dependencies,
          compliance,
          testing
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        policyId,
        JSON.stringify(policy.scope),
        JSON.stringify(policy.rules),
        JSON.stringify(policy.configuration),
        JSON.stringify(policy.dependencies || {}),
        JSON.stringify(policy.compliance || {}),
        JSON.stringify(policy.testing || {})
      ]);

      await client.query('COMMIT');
      return policyId;
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getPolicy(policyId: string): Promise<Policy | null> {
    const result = await this.db.query(`
      SELECT p.*, pd.scope_data, pd.rules_data, pd.configuration_data, 
             pd.dependencies, pd.compliance, pd.testing
      FROM policies p
      JOIN policy_data pd ON p.id = pd.policy_id
      WHERE p.id = $1
    `, [policyId]);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return this.mapRowToPolicy(row);
  }

  async updatePolicy(policyId: string, updates: Partial<Policy>, updatedBy: string): Promise<void> {
    const client = await this.db.getClient();
    try {
      await client.query('BEGIN');

      // Update metadata if provided
      if (updates.metadata) {
        const setClause = [];
        const params = [];
        
        Object.entries(updates.metadata).forEach(([key, value]) => {
          if (value !== undefined && key !== 'id' && key !== 'created_at' && key !== 'created_by') {
            params.push(value);
            setClause.push(`${key} = $${params.length}`);
          }
        });
        
        if (setClause.length > 0) {
          params.push(updatedBy);
          setClause.push(`updated_by = $${params.length}`);
          setClause.push('updated_at = NOW()');
          params.push(policyId);
          
          await client.query(`
            UPDATE policies 
            SET ${setClause.join(', ')}
            WHERE id = $${params.length}
          `, params);
        }
      }

      // Update policy data if provided
      if (updates.scope || updates.rules || updates.configuration || updates.dependencies || updates.compliance || updates.testing) {
        const existing = await this.getPolicy(policyId);
        if (existing) {
          await client.query(`
            UPDATE policy_data 
            SET scope_data = $1, rules_data = $2, configuration_data = $3,
                dependencies = $4, compliance = $5, testing = $6, updated_at = NOW()
            WHERE policy_id = $7
          `, [
            JSON.stringify(updates.scope || existing.scope),
            JSON.stringify(updates.rules || existing.rules),
            JSON.stringify(updates.configuration || existing.configuration),
            JSON.stringify(updates.dependencies || existing.dependencies || {}),
            JSON.stringify(updates.compliance || existing.compliance || {}),
            JSON.stringify(updates.testing || existing.testing || {}),
            policyId
          ]);
        }
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async deletePolicy(policyId: string): Promise<void> {
    await this.db.query('DELETE FROM policies WHERE id = $1', [policyId]);
  }

  async listPolicies(filters: {
    type?: PolicyType;
    status?: PolicyStatus;
    category?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ policies: Policy[]; total: number }> {
    let whereClause = '';
    const params: any[] = [];
    const conditions: string[] = [];

    if (filters.type) {
      conditions.push(`p.type = $${params.length + 1}`);
      params.push(filters.type);
    }

    if (filters.status) {
      conditions.push(`p.status = $${params.length + 1}`);
      params.push(filters.status);
    }

    if (filters.category) {
      conditions.push(`p.category = $${params.length + 1}`);
      params.push(filters.category);
    }

    if (conditions.length > 0) {
      whereClause = `WHERE ${conditions.join(' AND ')}`;
    }

    const result = await this.db.query(`
      SELECT p.*, pd.scope_data, pd.rules_data, pd.configuration_data,
             pd.dependencies, pd.compliance, pd.testing,
             COUNT(*) OVER() AS total_count
      FROM policies p
      JOIN policy_data pd ON p.id = pd.policy_id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `, [...params, filters.limit || 50, filters.offset || 0]);

    const policies = result.rows.map(row => this.mapRowToPolicy(row));
    const total = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;

    return { policies, total };
  }

  // Policy Evaluation
  async evaluatePolicy(policyId: string, context: PolicyEvaluationContext): Promise<PolicyEvaluationResult> {
    const policy = await this.getPolicy(policyId);
    if (!policy) {
      throw new Error(`Policy not found: ${policyId}`);
    }

    const evaluationId = `eval-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    const result: PolicyEvaluationResult = {
      evaluation_id: evaluationId,
      policy_id: policyId,
      rule_id: '', // Will be set per rule
      timestamp: new Date(),
      context,
      conditions_met: [],
      actions_triggered: [],
      overall_result: 'pass',
      execution_time: 0
    };

    try {
      // Evaluate each rule
      for (const rule of policy.rules) {
        if (!rule.enabled) continue;

        result.rule_id = rule.id;
        const ruleResult = await this.evaluateRule(rule, context);
        
        result.conditions_met.push(...ruleResult.conditions_met);
        result.actions_triggered.push(...ruleResult.actions_triggered);

        if (ruleResult.overall_result === 'fail') {
          result.overall_result = 'fail';
        } else if (ruleResult.overall_result === 'partial' && result.overall_result === 'pass') {
          result.overall_result = 'partial';
        }
      }

      result.execution_time = Date.now() - startTime;

      // Log the evaluation
      await this.logPolicyEvaluation(result);

      return result;

    } catch (error) {
      result.overall_result = 'error';
      result.execution_time = Date.now() - startTime;
      throw error;
    }
  }

  // Analytics and Metrics
  async getPolicyMetrics(policyId: string, timeRange: { start: Date; end: Date }): Promise<PolicyMetrics> {
    const result = await this.db.query(`
      SELECT 
        COUNT(*) as total_evaluations,
        COUNT(*) FILTER (WHERE result = 'pass') as successful_evaluations,
        COUNT(*) FILTER (WHERE result = 'fail' OR result = 'error') as failed_evaluations,
        AVG(execution_time) as avg_execution_time,
        MAX(execution_time) as max_execution_time
      FROM policy_evaluations 
      WHERE policy_id = $1 AND timestamp BETWEEN $2 AND $3
    `, [policyId, timeRange.start, timeRange.end]);

    const row = result.rows[0];
    
    return {
      policy_id: policyId,
      time_period: timeRange,
      evaluation_metrics: {
        total_evaluations: parseInt(row.total_evaluations) || 0,
        successful_evaluations: parseInt(row.successful_evaluations) || 0,
        failed_evaluations: parseInt(row.failed_evaluations) || 0,
        average_execution_time: parseFloat(row.avg_execution_time) || 0,
        max_execution_time: parseFloat(row.max_execution_time) || 0,
        evaluations_per_hour: 0 // Calculate based on time range
      },
      action_metrics: {
        total_actions: 0,
        successful_actions: 0,
        failed_actions: 0,
        actions_by_type: {} as Record<ActionType, number>,
        false_positive_rate: 0
      },
      performance_metrics: {
        throughput: 0,
        latency_p50: 0,
        latency_p95: 0,
        latency_p99: 0,
        memory_usage: 0,
        error_rate: 0
      },
      business_impact: {
        entities_protected: 0,
        violations_prevented: 0,
        compliance_score: 0
      }
    };
  }

  // Private helper methods
  private mapRowToPolicy(row: any): Policy {
    return {
      metadata: {
        id: row.id,
        name: row.name,
        description: row.description,
        type: row.type,
        status: row.status,
        version: row.version,
        created_at: row.created_at,
        updated_at: row.updated_at,
        created_by: row.created_by,
        updated_by: row.updated_by,
        effective_date: row.effective_date,
        expiration_date: row.expiration_date,
        tags: JSON.parse(row.tags || '[]'),
        category: row.category,
        subcategory: row.subcategory
      },
      scope: JSON.parse(row.scope_data || '{}'),
      rules: JSON.parse(row.rules_data || '[]'),
      configuration: JSON.parse(row.configuration_data || '{}'),
      dependencies: JSON.parse(row.dependencies || '{}'),
      compliance: JSON.parse(row.compliance || '{}'),
      testing: JSON.parse(row.testing || '{}')
    };
  }

  private async evaluateRule(
    rule: PolicyRule,
    context: PolicyEvaluationContext
  ): Promise<Partial<PolicyEvaluationResult>> {
    // Implementation of rule evaluation logic
    const conditionsMetResults = [];
    const actionsTriggeredResults = [];

    // Evaluate conditions
    for (const condition of rule.conditions) {
      const startTime = Date.now();
      const met = this.evaluateCondition(condition, context);
      
      conditionsMetResults.push({
        condition_id: condition.id,
        met,
        value: context.context_data[condition.field],
        evaluation_time
      });
    }

    // Determine if rule should trigger based on condition_logic
    let ruleShouldTrigger = false;
    if (rule.condition_logic === 'ALL') {
      ruleShouldTrigger = conditionsMetResults.every(c => c.met);
    } else if (rule.condition_logic === 'ANY') {
      ruleShouldTrigger = conditionsMetResults.some(c => c.met);
    }

    // Execute actions if rule triggers
    if (ruleShouldTrigger) {
      for (const action of rule.actions) {
        const startTime = Date.now();
        try {
          // Execute action (placeholder - actual implementation would depend on action type)
          const result = await this.executeAction(action, context);
          actionsTriggeredResults.push({
            action_id: action.id,
            triggered: true,
            executed: true,
            execution_time: Date.now() - startTime,
            result
          });
        } catch (error) {
          actionsTriggeredResults.push({
            action_id: action.id,
            triggered: true,
            executed: false,
            execution_time: Date.now() - startTime,
            error: error.message
          });
        }
      }
    }

    return {
      conditions_met: conditionsMetResults,
      actions_triggered: actionsTriggeredResults,
      overall_result: ruleShouldTrigger ? 'fail' : 'pass'
    };
  }

  private evaluateCondition(condition: PolicyCondition, context: PolicyEvaluationContext): boolean {
    const fieldValue = this.getFieldValue(condition.field, context);
    const conditionValue = condition.value;

    switch (condition.operator) {
    case 'eq': return fieldValue === conditionValue;
    case 'ne': return fieldValue !== conditionValue;
    case 'gt': return fieldValue > conditionValue;
    case 'gte': return fieldValue >= conditionValue;
    case 'lt': return fieldValue < conditionValue;
    case 'lte': return fieldValue <= conditionValue;
    case 'in': return Array.isArray(conditionValue) && conditionValue.includes(fieldValue);
    case 'not_in': return Array.isArray(conditionValue) && !conditionValue.includes(fieldValue);
    case 'contains': return String(fieldValue).includes(String(conditionValue));
    case 'regex': return new RegExp(conditionValue).test(String(fieldValue));
    case 'between': 
      return Array.isArray(conditionValue) && conditionValue.length === 2 
          && fieldValue >= conditionValue[0] && fieldValue <= conditionValue[1];
    default: return false;
    }
  }

  private getFieldValue(field: string, context: PolicyEvaluationContext): any {
    const parts = field.split('.');
    let value: any = context;
    
    for (const part of parts) {
      value = value?.[part];
      if (value === undefined) break;
    }
    
    return value;
  }

  private async executeAction(action: PolicyAction, context: PolicyEvaluationContext): Promise<any> {
    // Placeholder for action execution
    console.log(`Executing action: ${action.type}`, { action, context });
    return { success: true, timestamp: new Date() };
  }

  private async logPolicyEvaluation(result: PolicyEvaluationResult): Promise<void> {
    await this.db.query(`
      INSERT INTO policy_evaluations 
      (
       evaluation_id,
       policy_id,
       rule_id,
       timestamp,
       context_data,
       result,
       execution_time,
       conditions_met,
       actions_triggered
     )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      result.evaluation_id,
      result.policy_id,
      result.rule_id,
      result.timestamp,
      JSON.stringify(result.context),
      result.overall_result,
      result.execution_time,
      JSON.stringify(result.conditions_met),
      JSON.stringify(result.actions_triggered)
    ]);
  }
}

// =============================================================================
// Policy Builder Utilities
// =============================================================================

export class PolicyBuilder {
  private policy: Partial<Policy>;

  constructor() {
    this.policy = {
      metadata: {} as PolicyMetadata,
      scope: {} as PolicyScope,
      rules: [],
      configuration: {} as PolicyConfiguration
    };
  }

  setMetadata(metadata: Partial<PolicyMetadata>): PolicyBuilder {
    this.policy.metadata = { ...this.policy.metadata!, ...metadata };
    return this;
  }

  setScope(scope: PolicyScope): PolicyBuilder {
    this.policy.scope = scope;
    return this;
  }

  addRule(rule: PolicyRule): PolicyBuilder {
    this.policy.rules!.push(rule);
    return this;
  }

  setConfiguration(config: PolicyConfiguration): PolicyBuilder {
    this.policy.configuration = config;
    return this;
  }

  build(): Policy {
    if (!this.policy.metadata?.id || !this.policy.metadata?.name) {
      throw new Error('Policy must have metadata with id and name');
    }
    return this.policy as Policy;
  }

  // Convenience methods for common policy patterns
  static createEnforcementPolicy(name: string, trustThreshold: number): PolicyBuilder {
    return new PolicyBuilder()
      .setMetadata({
        id: `enforcement-${Date.now()}`,
        name,
        description: `Enforcement policy with trust score threshold: ${trustThreshold}`,
        type: 'enforcement',
        status: 'draft',
        version: '1.0.0',
        created_by: 'system',
        created_at: new Date(),
        updated_at: new Date(),
        effective_date: new Date(),
        tags: ['enforcement', 'trust-score']
      })
      .addRule({
        id: 'trust-threshold-rule',
        name: 'Trust Score Threshold',
        description: `Trigger when trust score falls below ${trustThreshold}`,
        enabled: true,
        priority: 1,
        conditions: [{
          id: 'trust-score-condition',
          name: 'Trust Score Below Threshold',
          field: 'entity_data.trust_score',
          operator: 'lt',
          value: trustThreshold,
          data_type: 'number',
          required: true
        }],
        actions: [{
          id: 'restrict-action',
          type: 'restrict',
          name: 'Restrict Access',
          severity: 'medium',
          auto_execute: true,
          parameters: {
            restriction_type: 'limited_access',
            duration: 86400 // 24 hours
          }
        }],
        condition_logic: 'ALL',
        audit_settings: {
          log_evaluations: true,
          log_actions: true,
          include_context: true
        }
      });
  }
}