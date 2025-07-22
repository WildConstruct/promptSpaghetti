/**
 * Epic 17 Incident Playbooks Types - Epic 17
 * 
 * Comprehensive type definitions for incident playbooks specifically designed
 * for Epic 17 Backstage Admin Controls. Extends existing incident response
 * infrastructure with admin system-specific playbooks and automation.
 * 
 * Task: E17-1753114397260-08F809 - Create incident playbooks
 * Epic: 17 - Backstage Admin Controls
 */

import { TimeRange } from '../marketplace/analytics.types';
import { ActionSeverity } from './EnforcementTypes';

// =============================================================================
// Core Epic 17 Playbook Types
// =============================================================================

export interface Epic17IncidentPlaybook {
  id: string;
  name: string;
  description: string;
  version: string;
  category: PlaybookCategory;
  subcategory: string;
  enabled: boolean;
  
  // Epic 17 specific metadata
  epic17Context: Epic17Context;
  
  // Trigger conditions
  triggerConditions: PlaybookTriggerConditions;
  
  // Execution steps
  automatedSteps: PlaybookStep[];
  manualSteps: PlaybookStep[];
  
  // Response procedures
  escalationMatrix: EscalationRule[];
  recoveryProcedures: RecoveryProcedure[];
  rollbackProcedures: RollbackProcedure[];
  
  // Integration points
  integrations: Epic17Integration[];
  
  // Configuration
  configuration: PlaybookConfiguration;
  
  // Metadata
  metadata: PlaybookMetadata;
}

export type PlaybookCategory = 
  | 'feature_toggle_emergency'
  | 'admin_system_outage'
  | 'content_security_incident'
  | 'user_management_breach'
  | 'marketplace_fraud'
  | 'system_performance'
  | 'backup_recovery'
  | 'integration_failure'
  | 'configuration_error'
  | 'permission_escalation';

export interface Epic17Context {
  affectedSystems: Epic17System[];
  businessImpact: BusinessImpact;
  userImpact: UserImpact;
  dataImpact: DataImpact;
  complianceImplications: ComplianceImplication[];
  dependencies: SystemDependency[];
}

export type Epic17System = 
  | 'feature_management'
  | 'content_management'
  | 'user_permission_management'
  | 'monitoring_dashboard'
  | 'health_check_system'
  | 'backup_system'
  | 'integration_management'
  | 'review_tools'
  | 'fraud_monitoring'
  | 'enforcement_actions';

export interface BusinessImpact {
  severity: ActionSeverity;
  affectedUsers: number;
  revenueImpact: number;
  reputationRisk: 'low' | 'medium' | 'high' | 'critical';
  complianceRisk: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

export interface UserImpact {
  adminUsers: UserImpactDetail;
  regularUsers: UserImpactDetail;
  externalUsers: UserImpactDetail;
  systemUsers: UserImpactDetail;
}

export interface UserImpactDetail {
  affected: boolean;
  count: number;
  impactType: 'service_unavailable' | 'degraded_performance' | 'limited_functionality' | 'security_concern' | 'data_loss_risk';
  severity: ActionSeverity;
  estimatedDuration: number; // minutes
}

export interface DataImpact {
  dataAtRisk: boolean;
  dataTypes: DataType[];
  severity: ActionSeverity;
  backupStatus: 'available' | 'partial' | 'unavailable' | 'unknown';
  recoveryComplexity: 'simple' | 'moderate' | 'complex' | 'critical';
}

export type DataType = 
  | 'user_profiles'
  | 'admin_configurations'
  | 'feature_toggles'
  | 'content_data'
  | 'transaction_data'
  | 'audit_logs'
  | 'security_credentials'
  | 'system_state';

export interface ComplianceImplication {
  regulation: string;
  requirement: string;
  violationRisk: 'low' | 'medium' | 'high' | 'critical';
  reportingRequired: boolean;
  timelineRequirement: number; // hours
  stakeholders: string[];
}

export interface SystemDependency {
  system: Epic17System;
  dependencyType: 'required' | 'optional' | 'fallback';
  impactIfUnavailable: ActionSeverity;
  failoverAvailable: boolean;
  estimatedRecoveryTime: number; // minutes
}

// =============================================================================
// Playbook Trigger Conditions
// =============================================================================

export interface PlaybookTriggerConditions {
  healthCheckFailures: HealthCheckTrigger[];
  alertTriggers: AlertTrigger[];
  metricThresholds: MetricThreshold[];
  manualTriggers: ManualTrigger[];
  cascadingFailures: CascadingFailureTrigger[];
  timeBasedTriggers: TimeBasedTrigger[];
}

export interface HealthCheckTrigger {
  healthCheckId: string;
  healthCheckName: string;
  system: Epic17System;
  failureType: 'timeout' | 'error_response' | 'invalid_data' | 'unavailable' | 'degraded';
  consecutiveFailures: number;
  timeWindow: number; // minutes
  severity: ActionSeverity;
}

export interface AlertTrigger {
  alertType: AlertType;
  source: Epic17System;
  severity: ActionSeverity;
  frequency: 'single' | 'burst' | 'sustained';
  pattern: string; // regex pattern for alert matching
  conditions: AlertCondition[];
}

export type AlertType = 
  | 'system_error'
  | 'performance_degradation'
  | 'security_breach'
  | 'data_corruption'
  | 'configuration_error'
  | 'integration_failure'
  | 'capacity_exceeded'
  | 'audit_failure';

export interface AlertCondition {
  field: string;
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'regex_match';
  value: any;
  required: boolean;
}

export interface MetricThreshold {
  metricName: string;
  system: Epic17System;
  operator: 'above' | 'below' | 'equal' | 'changed_by';
  threshold: number;
  duration: number; // minutes
  aggregation: 'average' | 'sum' | 'max' | 'min' | 'count';
}

export interface ManualTrigger {
  triggerName: string;
  description: string;
  requiredRole: string[];
  urgencyLevel: 'routine' | 'urgent' | 'emergency';
  confirmationRequired: boolean;
  reasonRequired: boolean;
}

export interface CascadingFailureTrigger {
  primarySystem: Epic17System;
  cascadePattern: CascadePattern[];
  timeWindow: number; // minutes
  minAffectedSystems: number;
}

export interface CascadePattern {
  system: Epic17System;
  delay: number; // minutes after primary failure
  probability: number; // 0-1
  impact: ActionSeverity;
}

export interface TimeBasedTrigger {
  schedule: CronSchedule;
  timezone: string;
  conditions: TimeCondition[];
  skipIfHealthy: boolean;
}

export interface CronSchedule {
  expression: string;
  description: string;
  enabled: boolean;
}

export interface TimeCondition {
  type: 'maintenance_window' | 'business_hours' | 'high_traffic_period' | 'backup_schedule';
  enabled: boolean;
  priority: number;
}

// =============================================================================
// Playbook Execution Steps
// =============================================================================

export interface PlaybookStep {
  stepId: string;
  name: string;
  description: string;
  type: StepType;
  order: number;
  parallel: boolean;
  required: boolean;
  
  // Execution details
  action: PlaybookAction;
  conditions: StepCondition[];
  timeout: number; // seconds
  retryPolicy: RetryPolicy;
  
  // Dependencies
  dependsOn: string[]; // stepIds
  prerequisites: Prerequisite[];
  
  // Validation
  validation: StepValidation;
  rollbackAction?: PlaybookAction;
  
  // Documentation
  instructions: string;
  expectedOutcome: string;
  troubleshooting: TroubleshootingGuide[];
}

export type StepType = 
  | 'automated_action'
  | 'manual_action'
  | 'validation_check'
  | 'notification'
  | 'data_collection'
  | 'system_restart'
  | 'configuration_change'
  | 'escalation'
  | 'rollback'
  | 'recovery';

export interface PlaybookAction {
  actionType: ActionType;
  targetSystem: Epic17System;
  parameters: ActionParameters;
  credentials: CredentialRequirement[];
  permissions: PermissionRequirement[];
}

export type ActionType = 
  // Feature Toggle Actions
  | 'toggle_feature_flag'
  | 'rollback_feature_toggle'
  | 'emergency_kill_switch'
  
  // System Control Actions
  | 'restart_service'
  | 'scale_resources'
  | 'drain_traffic'
  | 'redirect_traffic'
  
  // Security Actions
  | 'block_ip_address'
  | 'suspend_user_account'
  | 'revoke_permissions'
  | 'force_logout_sessions'
  | 'enable_rate_limiting'
  
  // Data Actions
  | 'backup_data'
  | 'restore_from_backup'
  | 'quarantine_content'
  | 'purge_cache'
  
  // Communication Actions
  | 'send_notification'
  | 'update_status_page'
  | 'alert_stakeholders'
  | 'log_incident'
  
  // Configuration Actions
  | 'update_configuration'
  | 'reset_to_defaults'
  | 'apply_emergency_config'
  
  // Monitoring Actions
  | 'increase_monitoring'
  | 'collect_diagnostics'
  | 'generate_report';

export interface ActionParameters {
  [key: string]: any;
  // Common parameters
  reason?: string;
  duration?: number;
  severity?: ActionSeverity;
  notificationTargets?: string[];
  rollbackConfig?: any;
}

export interface CredentialRequirement {
  type: 'api_key' | 'oauth_token' | 'service_account' | 'admin_password' | 'certificate';
  scope: string;
  required: boolean;
  fallbackOptions: string[];
}

export interface PermissionRequirement {
  permission: string;
  system: Epic17System;
  required: boolean;
  justification: string;
}

export interface StepCondition {
  type: 'prerequisite' | 'guard' | 'success_criteria' | 'failure_criteria';
  expression: string;
  description: string;
  required: boolean;
}

export interface RetryPolicy {
  maxRetries: number;
  retryDelay: number; // seconds
  backoffStrategy: 'linear' | 'exponential' | 'fixed';
  retryConditions: RetryCondition[];
}

export interface RetryCondition {
  errorType: string;
  shouldRetry: boolean;
  maxRetriesOverride?: number;
}

export interface Prerequisite {
  type: 'system_healthy' | 'service_available' | 'data_consistent' | 'permissions_valid' | 'resources_available';
  description: string;
  validationMethod: string;
  required: boolean;
}

export interface StepValidation {
  validationType: 'automated' | 'manual' | 'hybrid';
  successCriteria: SuccessCriteria[];
  failureCriteria: FailureCriteria[];
  timeoutBehavior: 'fail' | 'continue' | 'escalate';
}

export interface SuccessCriteria {
  metric: string;
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains';
  expectedValue: any;
  tolerance?: number;
  description: string;
}

export interface FailureCriteria {
  condition: string;
  severity: ActionSeverity;
  action: 'stop' | 'continue' | 'escalate' | 'rollback';
  description: string;
}

export interface TroubleshootingGuide {
  issue: string;
  symptoms: string[];
  possibleCauses: string[];
  solutions: TroubleshootingSolution[];
  escalationPath: string;
}

export interface TroubleshootingSolution {
  solution: string;
  complexity: 'simple' | 'moderate' | 'complex';
  estimatedTime: number; // minutes
  requirements: string[];
  risks: string[];
}

// =============================================================================
// Recovery and Rollback Procedures
// =============================================================================

export interface RecoveryProcedure {
  procedureId: string;
  name: string;
  description: string;
  scenario: RecoveryScenario;
  steps: RecoveryStep[];
  estimatedTime: number; // minutes
  successRate: number; // 0-1
  dependencies: string[];
  fallbackProcedures: string[];
}

export type RecoveryScenario = 
  | 'complete_system_failure'
  | 'partial_degradation'
  | 'data_corruption'
  | 'configuration_error'
  | 'security_breach'
  | 'performance_crisis'
  | 'integration_failure';

export interface RecoveryStep {
  stepId: string;
  name: string;
  description: string;
  type: RecoveryStepType;
  order: number;
  automated: boolean;
  critical: boolean;
  action: PlaybookAction;
  validation: StepValidation;
  rollbackAction?: PlaybookAction;
  estimatedTime: number; // minutes
}

export type RecoveryStepType = 
  | 'system_restart'
  | 'data_restore'
  | 'configuration_reset'
  | 'traffic_reroute'
  | 'cache_rebuild'
  | 'service_failover'
  | 'manual_intervention'
  | 'validation_check';

export interface RollbackProcedure {
  procedureId: string;
  name: string;
  description: string;
  triggerConditions: RollbackTrigger[];
  steps: RollbackStep[];
  safetyChecks: SafetyCheck[];
  estimatedTime: number; // minutes
  dataLossRisk: 'none' | 'minimal' | 'moderate' | 'significant';
  automaticExecution: boolean;
}

export interface RollbackTrigger {
  condition: string;
  severity: ActionSeverity;
  timeThreshold?: number; // minutes
  automatic: boolean;
  confirmationRequired: boolean;
}

export interface RollbackStep {
  stepId: string;
  name: string;
  description: string;
  order: number;
  action: PlaybookAction;
  safetyCheck?: SafetyCheck;
  pointOfNoReturn: boolean;
  estimatedTime: number; // minutes
}

export interface SafetyCheck {
  checkId: string;
  name: string;
  description: string;
  type: 'data_integrity' | 'system_health' | 'user_impact' | 'business_continuity';
  automated: boolean;
  passRequired: boolean;
  failureAction: 'stop' | 'escalate' | 'continue_with_approval';
}

// =============================================================================
// Epic 17 Integration and Configuration
// =============================================================================

export interface Epic17Integration {
  integrationId: string;
  system: Epic17System;
  type: IntegrationType;
  endpoint: string;
  authentication: AuthenticationConfig;
  configuration: IntegrationConfig;
  healthCheck: IntegrationHealthCheck;
  fallbackOptions: FallbackOption[];
}

export type IntegrationType = 
  | 'rest_api'
  | 'message_queue'
  | 'webhook'
  | 'database'
  | 'file_system'
  | 'monitoring_system'
  | 'notification_service';

export interface AuthenticationConfig {
  type: 'api_key' | 'oauth2' | 'basic_auth' | 'certificate' | 'service_account';
  credentials: CredentialReference;
  refreshPolicy: RefreshPolicy;
}

export interface CredentialReference {
  source: 'environment' | 'secret_manager' | 'config_file' | 'vault';
  key: string;
  fallbackKeys: string[];
}

export interface RefreshPolicy {
  enabled: boolean;
  refreshInterval: number; // hours
  expiryBuffer: number; // minutes
  retryAttempts: number;
}

export interface IntegrationConfig {
  timeout: number; // seconds
  retryPolicy: RetryPolicy;
  rateLimiting: RateLimitConfig;
  circuitBreaker: CircuitBreakerConfig;
}

export interface RateLimitConfig {
  enabled: boolean;
  requestsPerSecond: number;
  burstSize: number;
  backoffStrategy: 'linear' | 'exponential';
}

export interface CircuitBreakerConfig {
  enabled: boolean;
  failureThreshold: number;
  timeoutThreshold: number; // seconds
  recoveryTime: number; // seconds
}

export interface IntegrationHealthCheck {
  enabled: boolean;
  interval: number; // seconds
  endpoint: string;
  expectedResponse: any;
  timeout: number; // seconds
}

export interface FallbackOption {
  type: 'secondary_endpoint' | 'cached_data' | 'manual_process' | 'degraded_mode';
  description: string;
  configuration: any;
  automaticActivation: boolean;
}

export interface PlaybookConfiguration {
  execution: ExecutionConfig;
  notification: NotificationConfig;
  logging: LoggingConfig;
  security: SecurityConfig;
  performance: PerformanceConfig;
}

export interface ExecutionConfig {
  maxConcurrentPlaybooks: number;
  timeoutBehavior: 'fail' | 'continue' | 'escalate';
  defaultTimeout: number; // minutes
  parallelExecution: boolean;
  automaticRetry: boolean;
  rollbackOnFailure: boolean;
}

export interface NotificationConfig {
  enabled: boolean;
  channels: NotificationChannel[];
  escalationSchedule: EscalationSchedule[];
  templates: NotificationTemplate[];
}

export interface NotificationChannel {
  type: 'email' | 'slack' | 'sms' | 'webhook' | 'dashboard';
  configuration: any;
  enabled: boolean;
  priority: number;
}

export interface EscalationSchedule {
  level: number;
  delay: number; // minutes
  recipients: string[];
  channels: string[];
  requiredAcknowledgment: boolean;
}

export interface NotificationTemplate {
  templateId: string;
  name: string;
  channel: string;
  template: string;
  variables: TemplateVariable[];
}

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'date' | 'object';
  required: boolean;
  defaultValue?: any;
}

export interface LoggingConfig {
  enabled: boolean;
  level: 'debug' | 'info' | 'warning' | 'error';
  destination: LogDestination[];
  retention: RetentionPolicy;
  sensitiveDataHandling: SensitiveDataPolicy;
}

export interface LogDestination {
  type: 'file' | 'database' | 'elasticsearch' | 'cloudwatch' | 'syslog';
  configuration: any;
  enabled: boolean;
}

export interface RetentionPolicy {
  defaultRetention: number; // days
  highSeverityRetention: number; // days
  auditRetention: number; // days
  compressionEnabled: boolean;
}

export interface SensitiveDataPolicy {
  maskingEnabled: boolean;
  fieldMasks: FieldMask[];
  encryptionRequired: boolean;
  accessRestrictions: AccessRestriction[];
}

export interface FieldMask {
  fieldName: string;
  maskingType: 'full' | 'partial' | 'hash' | 'encrypt';
  preserveLength: boolean;
}

export interface AccessRestriction {
  role: string;
  permissions: string[];
  approvalRequired: boolean;
}

export interface SecurityConfig {
  authenticationRequired: boolean;
  authorizationRequired: boolean;
  auditingEnabled: boolean;
  encryptionRequired: boolean;
  accessControls: AccessControl[];
}

export interface AccessControl {
  resource: string;
  permissions: Permission[];
  conditions: AccessCondition[];
}

export interface Permission {
  action: string;
  granted: boolean;
  restrictions: string[];
}

export interface AccessCondition {
  type: 'time_based' | 'location_based' | 'role_based' | 'approval_based';
  condition: string;
  required: boolean;
}

export interface PerformanceConfig {
  enableMetrics: boolean;
  metricCollection: MetricCollectionConfig;
  optimizations: OptimizationConfig;
  resourceLimits: ResourceLimitConfig;
}

export interface MetricCollectionConfig {
  enabled: boolean;
  interval: number; // seconds
  metrics: string[];
  aggregation: AggregationConfig;
}

export interface AggregationConfig {
  windowSize: number; // seconds
  functions: string[];
  retentionPeriod: number; // hours
}

export interface OptimizationConfig {
  caching: CachingConfig;
  parallelization: ParallelizationConfig;
  resourcePooling: ResourcePoolingConfig;
}

export interface CachingConfig {
  enabled: boolean;
  ttl: number; // seconds
  maxSize: number; // MB
  strategy: 'lru' | 'lfu' | 'ttl';
}

export interface ParallelizationConfig {
  enabled: boolean;
  maxWorkers: number;
  queueSize: number;
  loadBalancing: 'round_robin' | 'least_loaded' | 'weighted';
}

export interface ResourcePoolingConfig {
  enabled: boolean;
  poolSize: number;
  connectionTimeout: number; // seconds
  idleTimeout: number; // seconds
}

export interface ResourceLimitConfig {
  maxMemoryUsage: number; // MB
  maxCpuUsage: number; // percentage
  maxExecutionTime: number; // minutes
  maxConcurrentOperations: number;
}

// =============================================================================
// Playbook Metadata and Analytics
// =============================================================================

export interface PlaybookMetadata {
  createdBy: string;
  createdAt: Date;
  lastModified: Date;
  modifiedBy: string;
  version: string;
  status: PlaybookStatus;
  testing: TestingMetadata;
  usage: UsageMetadata;
  performance: PerformanceMetadata;
}

export type PlaybookStatus = 
  | 'draft'
  | 'testing'
  | 'approved'
  | 'active'
  | 'deprecated'
  | 'archived';

export interface TestingMetadata {
  lastTested: Date;
  testResults: TestResult[];
  testCoverage: number; // percentage
  simulationResults: SimulationResult[];
}

export interface TestResult {
  testId: string;
  name: string;
  type: 'unit' | 'integration' | 'end_to_end' | 'chaos';
  passed: boolean;
  executionTime: number; // seconds
  issues: TestIssue[];
  timestamp: Date;
}

export interface TestIssue {
  severity: ActionSeverity;
  description: string;
  step: string;
  recommendation: string;
}

export interface SimulationResult {
  simulationId: string;
  scenario: string;
  success: boolean;
  duration: number; // minutes
  resourcesUsed: ResourceUsage;
  feedback: SimulationFeedback[];
}

export interface ResourceUsage {
  cpuUsage: number; // percentage
  memoryUsage: number; // MB
  networkUsage: number; // Mbps
  storageUsage: number; // MB
}

export interface SimulationFeedback {
  category: 'performance' | 'accuracy' | 'user_experience' | 'resource_efficiency';
  rating: number; // 1-5
  comments: string;
  improvements: string[];
}

export interface UsageMetadata {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number; // minutes
  lastExecution: Date;
  frequencyPattern: FrequencyPattern;
}

export interface FrequencyPattern {
  hourlyDistribution: number[];
  dailyDistribution: number[];
  monthlyDistribution: number[];
  seasonalTrends: SeasonalTrend[];
}

export interface SeasonalTrend {
  season: 'spring' | 'summer' | 'fall' | 'winter';
  frequency: number;
  averageSeverity: ActionSeverity;
  commonTriggers: string[];
}

export interface PerformanceMetadata {
  averageResolutionTime: number; // minutes
  successRate: number; // percentage
  escalationRate: number; // percentage
  userSatisfactionScore: number; // 1-5
  costEffectiveness: CostEffectiveness;
  trends: PerformanceTrend[];
}

export interface CostEffectiveness {
  automationSavings: number; // dollars per incident
  manualEffortReduction: number; // hours per incident
  mttrImprovement: number; // percentage improvement
  businessImpactReduction: number; // percentage
}

export interface PerformanceTrend {
  metric: string;
  trend: 'improving' | 'stable' | 'declining';
  changeRate: number; // percentage change per period
  period: 'daily' | 'weekly' | 'monthly';
  lastUpdated: Date;
}

// =============================================================================
// Escalation and Communication
// =============================================================================

export interface EscalationRule {
  ruleId: string;
  name: string;
  description: string;
  triggers: EscalationTrigger[];
  actions: EscalationAction[];
  schedule: EscalationSchedule;
  approvals: ApprovalRequirement[];
  notifications: EscalationNotification[];
}

export interface EscalationTrigger {
  type: TriggerType;
  condition: string;
  threshold?: number;
  timeWindow?: number; // minutes
  priority: number;
}

export type TriggerType = 
  | 'time_exceeded'
  | 'failure_rate_exceeded'
  | 'manual_request'
  | 'severity_threshold'
  | 'resource_exhausted'
  | 'cascading_failures'
  | 'business_impact_exceeded';

export interface EscalationAction {
  actionType: EscalationActionType;
  parameters: ActionParameters;
  delay: number; // minutes
  condition?: string;
  reversible: boolean;
}

export type EscalationActionType = 
  | 'notify_manager'
  | 'engage_specialist'
  | 'activate_crisis_team'
  | 'escalate_to_vendor'
  | 'invoke_business_continuity'
  | 'activate_disaster_recovery'
  | 'notify_executives'
  | 'engage_external_support';

export interface ApprovalRequirement {
  level: number;
  approverRole: string;
  requiredApprovals: number;
  timeLimit: number; // minutes
  escalateIfNoResponse: boolean;
  delegationAllowed: boolean;
}

export interface EscalationNotification {
  recipient: NotificationRecipient;
  channel: NotificationChannel;
  template: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  acknowledgmentRequired: boolean;
}

export interface NotificationRecipient {
  type: 'individual' | 'role' | 'team' | 'external';
  identifier: string;
  contactMethods: ContactMethod[];
  availability: AvailabilitySchedule;
}

export interface ContactMethod {
  type: 'email' | 'phone' | 'sms' | 'slack' | 'teams' | 'pager';
  address: string;
  priority: number;
  availability: AvailabilityWindow[];
}

export interface AvailabilityWindow {
  start: string; // HH:mm format
  end: string; // HH:mm format
  daysOfWeek: number[]; // 0-6 (Sunday-Saturday)
  timezone: string;
}

export interface AvailabilitySchedule {
  businessHours: AvailabilityWindow[];
  onCallSchedule: OnCallSchedule[];
  vacationSchedule: VacationPeriod[];
}

export interface OnCallSchedule {
  start: Date;
  end: Date;
  primary: boolean;
  escalationDelay: number; // minutes
}

export interface VacationPeriod {
  start: Date;
  end: Date;
  backup: string; // identifier of backup person
}