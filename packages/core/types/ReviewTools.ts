/**
 * Review Tools Types - Epic 17
 * 
 * Comprehensive type definitions for unified review tools system that orchestrates
 * all administrative review workflows including fraud monitoring, enforcement actions,
 * content moderation, template submissions, and user management reviews.
 * 
 * Task: E17-1753114397301-5C1461 - Develop review tools
 * Epic: 17 - Backstage Admin Controls
 */

import { TimeRange } from '../marketplace/analytics.types';
import { ActionSeverity } from './EnforcementTypes';

// =============================================================================
// Core Review System Types
// =============================================================================

export interface ReviewItem {
  reviewId: string;
  reviewType: ReviewType;
  sourceSystem: SourceSystem;
  sourceId: string;
  priority: ReviewPriority;
  status: ReviewStatus;
  // Content
  title: string;
  description: string;
  data: any; // The actual item being reviewed,
  metadata: ReviewMetadata;
  // Assignment
  assignedTo?: string;
  assignedAt?: Date;
  assignedBy?: string;
  // Review process
  reviewCriteria: ReviewCriteria;
  decisions: ReviewDecision;
  notes: ReviewNote;
  evidence: ReviewEvidence;
  // Timeline
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  completedAt?: Date;
  // Relationships
  parentReviewId?: string;
  childReviewIds: string;
  relatedReviewIds: string;
  dependencies: ReviewDependency;
  // Configuration
  requiresConsensus: boolean;
  minReviewers?: number;
  escalationThreshold?: number;
  autoEscalationEnabled: boolean;
}
export type ReviewType = 
  // Content Reviews
  | 'template_submission'
  | 'content_moderation'
  | 'policy_violation'
  | 'marketplace_listing'
  
  // User Management Reviews
  | 'access_request'
  | 'account_action'
  | 'identity_verification'
  | 'privilege_escalation'
  
  // System Reviews
  | 'feature_toggle'
  | 'configuration_change'
  | 'security_alert'
  | 'fraud_case'
  | 'enforcement_appeal'
  
  // Administrative Reviews
  | 'bulk_operation'
  | 'emergency_action'
  | 'compliance_audit';

export type SourceSystem = 
  | 'marketplace'
  | 'fraud_monitoring'
  | 'enforcement_actions'
  | 'identity_verification'
  | 'feature_management'
  | 'user_management'
  | 'security_monitoring'
  | 'content_management'
  | 'compliance_system';

export type ReviewPriority = 'low' | 'medium' | 'high' | 'urgent' | 'emergency';

export type ReviewStatus = 
  | 'pending'
  | 'assigned'
  | 'in_review'
  | 'pending_consensus'
  | 'escalated'
  | 'approved'
  | 'rejected'
  | 'returned'
  | 'expired'
  | 'cancelled';

export interface ReviewMetadata {
  sourceData: any;
  businessContext: string;
  riskLevel: ActionSeverity;
  confidenceScore?: number;
  automatedRecommendation?: string;
  tags: string;
  flagged: boolean;
  flagReason?: string;
  estimatedReviewTime: number; // minutes,
  complexity: ReviewComplexity;
}
export type ReviewComplexity = 'simple' | 'moderate' | 'complex' | 'expert_required';

export interface ReviewCriteria {
  criteriaId: string;
  name: string;
  description: string;
  category: CriteriaCategory;
  weight: number; // 0-1, contribution to overall score,
  required: boolean;
  type: CriteriaType;
  validOptions?: CriteriaOption;
  condition?: string; // Conditional criteria,
}
export type CriteriaCategory = 
  | 'quality'
  | 'safety'
  | 'compliance'
  | 'business_rules'
  | 'technical'
  | 'legal'
  | 'policy';

export type CriteriaType = 
  | 'binary' // yes/no
  | 'scale' // 1-5 rating
  | 'multiple_choice'
  | 'text'
  | 'checklist';

export interface CriteriaOption {
  value: string;
  label: string;
  score: number;
  impact: string;
}
export interface ReviewDecision {
  decisionId: string;
  reviewerId: string;
  decision: DecisionType;
  confidence: number; // 0-100,
  reasoning: string;
  criteriaEvaluations: CriteriaEvaluation;
  recommendedActions: string;
  timestamp: Date;
  overridden?: boolean;
  overriddenBy?: string;
  overrideReason?: string;
}
export type DecisionType = 
  | 'approve'
  | 'approve_with_conditions'
  | 'reject'
  | 'return_for_revision'
  | 'escalate'
  | 'defer'
  | 'request_more_info';

export interface CriteriaEvaluation {
  criteriaId: string;
  score: number;
  passed: boolean;
  notes?: string;
  evidence?: string;
}
export interface ReviewNote {
  noteId: string;
  reviewerId: string;
  noteType: NoteType;
  content: string;
  timestamp: Date;
  visibility: NoteVisibility;
  attachments?: string;
  replyTo?: string;
}
export type NoteType = 'observation' | 'question' | 'concern' | 'recommendation' | 'clarification';
export type NoteVisibility = 'reviewers_only' | 'internal' | 'public' | 'submitter_visible';

export interface ReviewEvidence {
  evidenceId: string;
  type: EvidenceType;
  source: string;
  description: string;
  data: any;
  confidence: number;
  verifiedBy?: string;
  verifiedAt?: Date;
  attachments?: string;
}
export type EvidenceType = 
  | 'automated_scan'
  | 'manual_verification'
  | 'external_check'
  | 'historical_data'
  | 'user_submission'
  | 'system_log'
  | 'audit_trail';

export interface ReviewDependency {
  dependencyId: string;
  type: DependencyType;
  targetReviewId: string;
  condition: string;
  blocking: boolean;
  resolvedAt?: Date;
}
export type DependencyType = 
  | 'prerequisite' // Must complete before this review
  | 'conditional' // Complete if condition met
  | 'parallel' // Can run in parallel but affects decision
  | 'sequential'; // Must complete in order

// =============================================================================
// Review Assignment and Workload Management
// =============================================================================

export interface ReviewAssignment {
  assignmentId: string;
  reviewId: string;
  reviewerId: string;
  assignedBy: string;
  assignedAt: Date;
  dueDate: Date;
  priority: ReviewPriority;
  estimatedTime: number; // minutes,
  status: AssignmentStatus;
  acceptedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  worklog: WorklogEntry;
}
export type AssignmentStatus = 
  | 'pending_acceptance'
  | 'accepted'
  | 'in_progress'
  | 'paused'
  | 'completed'
  | 'reassigned'
  | 'expired';

export interface WorklogEntry {
  entryId: string;
  timestamp: Date;
  action: WorklogAction;
  timeSpent: number; // minutes,
  description: string;
  status: string;
}
export type WorklogAction = 
  | 'started_review'
  | 'paused_review'
  | 'resumed_review'
  | 'added_note'
  | 'made_decision'
  | 'requested_info'
  | 'escalated'
  | 'completed_review';

export interface ReviewerProfile {
  reviewerId: string;
  name: string;
  email: string;
  role: ReviewerRole;
  specializations: ReviewSpecialization;
  permissions: ReviewPermission;
  // Performance metrics
  performance: ReviewerPerformance;
  // Workload management
  workload: ReviewerWorkload;
  // Availability
  availability: ReviewerAvailability;
  // Settings
  preferences: ReviewerPreferences;
}
export type ReviewerRole = 
  | 'junior_reviewer'
  | 'senior_reviewer'
  | 'specialist'
  | 'lead_reviewer'
  | 'compliance_officer'
  | 'legal_reviewer'
  | 'security_reviewer'
  | 'admin';

export interface ReviewSpecialization {
  area: SpecializationArea;
  level: ExpertiseLevel;
  certifiedAt?: Date;
  expiresAt?: Date;
}
export type SpecializationArea = 
  | 'content_safety'
  | 'fraud_detection'
  | 'legal_compliance'
  | 'technical_quality'
  | 'business_rules'
  | 'identity_verification'
  | 'financial_review'
  | 'policy_enforcement';

export type ExpertiseLevel = 'basic' | 'intermediate' | 'advanced' | 'expert';

export interface ReviewPermission {
  permission: PermissionType;
  scope: PermissionScope;
  grantedAt: Date;
  grantedBy: string;
  expiresAt?: Date;
}
export type PermissionType = 
  | 'review_content'
  | 'approve_submissions'
  | 'reject_items'
  | 'escalate_reviews'
  | 'override_decisions'
  | 'assign_reviewers'
  | 'modify_criteria'
  | 'access_sensitive_data'
  | 'bulk_operations';

export type PermissionScope = 
  | 'all_reviews'
  | 'own_assignments'
  | 'team_reviews'
  | 'specific_types'
  | 'emergency_only';

export interface ReviewerPerformance {
  totalReviews: number;
  accuracyScore: number; // 0-100,
  averageReviewTime: number; // minutes,
  throughput: number; // reviews per day,
  qualityScore: number; // 0-100,
  consistencyScore: number; // 0-100,
  overrideRate: number; // % of decisions overridden,
  appealSuccessRate: number; // % of appeals that succeeded,
  lastEvaluationDate: Date;
  performanceTrend: 'improving' | 'stable' | 'declining'
  }
export interface ReviewerWorkload {
  currentAssignments: number;
  maxConcurrentReviews: number;
  averageWorkingHours: number;
  capacityUtilization: number; // 0-100%,
  pendingReviews: number;
  overdueReviews: number;
  estimatedBacklog: number; // hours,
}
export interface ReviewerAvailability {
  status: AvailabilityStatus;
  workingHours: TimeSlot;
  timeZone: string;
  unavailableUntil?: Date;
  unavailableReason?: string;
  autoAssignment: boolean;
  maxDailyReviews?: number;
}
export type AvailabilityStatus = 'available' | 'busy' | 'unavailable' | 'on_break' | 'offline';

export interface TimeSlot {
  dayOfWeek: number; // 0-6 (Sunday-Saturday),
  startTime: string; // HH:mm format,
  endTime: string; // HH:mm format,
}
export interface ReviewerPreferences {
  preferredReviewTypes: ReviewType;
  maxReviewComplexity: ReviewComplexity;
  notificationSettings: NotificationSettings;
  autoAcceptAssignments: boolean;
  workloadPreferences: WorkloadPreferences;
}
export interface NotificationSettings {
  emailNotifications: boolean;
  slackNotifications: boolean;
  pushNotifications: boolean;
  urgentOnly: boolean;
  digestFrequency: 'real_time' | 'hourly' | 'daily' | 'weekly'
  }
export interface WorkloadPreferences {
  preferredBatchSize: number;
  breaksBetweenReviews: boolean;
  complexReviewsFirst: boolean;
  balanceByType: boolean;
  // =============================================================================
  // Review Workflow and Orchestration
  // =============================================================================
}
export interface ReviewWorkflow {
  workflowId: string;
  name: string;
  description: string;
  reviewType: ReviewType;
  version: string;
  enabled: boolean;
  // Workflow definition
  steps: WorkflowStep;
  conditions: WorkflowCondition;
  escalationRules: EscalationRule;
  // Configuration
  config: WorkflowConfig;
  // Metadata
  metadata: WorkflowMetadata;
}
export interface WorkflowStep {
  stepId: string;
  name: string;
  description: string;
  type: StepType;
  order: number;
  required: boolean;
  // Step configuration
  config: StepConfig;
  // Conditions
  enterConditions: string;
  exitConditions: string;
  // Assignment
  assignmentRules: AssignmentRule;
  // Time limits
  timeLimit?: number; // minutes,
  escalationTime?: number; // minutes,
}
export type StepType = 
  | 'initial_review'
  | 'specialist_review'
  | 'consensus_review'
  | 'approval_review'
  | 'quality_check'
  | 'compliance_check'
  | 'final_decision'
  | 'notification'
  | 'automated_action';

export interface StepConfig {
  requiredCriteria: string;
  optionalCriteria: string;
  minScore?: number;
  consensusThreshold?: number;
  autoAdvance: boolean;
  allowSkip: boolean;
  requireEvidence: boolean;
}
export interface WorkflowCondition {
  conditionId: string;
  expression: string;
  description: string;
  type: ConditionType;
  priority: number;
}
export type ConditionType = 
  | 'pre_condition'
  | 'step_condition'
  | 'escalation_condition'
  | 'completion_condition';

export interface EscalationRule {
  ruleId: string;
  name: string;
  description: string;
  triggers: EscalationTrigger;
  actions: EscalationAction;
  delay: number; // minutes,
  enabled: boolean;
}
export interface EscalationTrigger {
  type: TriggerType;
  condition: string;
  threshold?: number;
  timeWindow?: number; // minutes,
}
export type TriggerType = 
  | 'time_exceeded'
  | 'score_threshold'
  | 'reviewer_request'
  | 'quality_concern'
  | 'external_flag'
  | 'system_alert';

export interface EscalationAction {
  action: ActionType;
  parameters: Record<string, any>;
  delay: number; // minutes,
  notify: boolean;
}
export type ActionType = 
  | 'reassign_reviewer'
  | 'add_specialist'
  | 'notify_manager'
  | 'escalate_to_senior'
  | 'require_consensus'
  | 'auto_approve'
  | 'auto_reject'
  | 'pause_review';

export interface WorkflowConfig {
  maxReviewers: number;
  consensusThreshold: number; // % agreement required,
  qualityGate: number; // minimum quality score,
  timeoutBehavior: TimeoutBehavior;
  retryPolicy: RetryPolicy;
  notificationSchedule: NotificationSchedule;
}
export type TimeoutBehavior = 'escalate' | 'auto_approve' | 'auto_reject' | 'reassign' | 'extend';

export interface RetryPolicy {
  maxRetries: number;
  retryDelay: number; // minutes,
  backoffStrategy: 'linear' | 'exponential' | 'fixed'
  }
export interface NotificationSchedule {
  recipient: NotificationRecipient;
  timing: NotificationTiming;
  method: NotificationMethod;
  template: string;
}
export type NotificationRecipient = 'reviewer' | 'manager' | 'submitter' | 'admin' | 'stakeholder';
export type NotificationTiming = 'immediate' | 'delayed' | 'daily_digest' | 'escalation_only';
export type NotificationMethod = 'email' | 'slack' | 'sms' | 'push' | 'dashboard';

export interface WorkflowMetadata {
  createdBy: string;
  createdAt: Date;
  lastModified: Date;
  modifiedBy: string;
  version: string;
  deployedAt?: Date;
  statistics: WorkflowStatistics;
}
export interface WorkflowStatistics {
  totalExecutions: number;
  averageCompletionTime: number; // minutes,
  successRate: number; // %,
  escalationRate: number; // %,
  qualityScore: number; // 0-100,
  lastUpdated: Date;
}
export interface AssignmentRule {
  ruleId: string;
  name: string;
  type: AssignmentType;
  conditions: AssignmentCondition;
  weightings: AssignmentWeighting;
  fallbackStrategy: FallbackStrategy;
  enabled: boolean;
}
export type AssignmentType = 
  | 'automatic'
  | 'round_robin'
  | 'load_balanced'
  | 'expertise_based'
  | 'random'
  | 'manual_only';

export interface AssignmentCondition {
  field: string;
  operator: string;
  value: any;
  weight: number;
}
export interface AssignmentWeighting {
  factor: WeightingFactor;
  weight: number; // 0-1,
  direction: 'prefer' | 'avoid'
  }
export type WeightingFactor = 
  | 'workload'
  | 'expertise'
  | 'performance'
  | 'availability'
  | 'specialization'
  | 'historical_success';

export type FallbackStrategy = 
  | 'assign_to_manager'
  | 'queue_for_manual'
  | 'escalate_immediately'
  | 'use_backup_pool'
  | 'defer_review';

// =============================================================================
// Review Analytics and Reporting
// =============================================================================

export interface ReviewAnalytics {
  period: AnalyticsPeriod;
  generatedAt: Date;
  // Overview metrics
  overallMetrics: ReviewOverallMetrics;
  // Performance metrics
  performanceMetrics: ReviewPerformanceMetrics;
  // Quality metrics
  qualityMetrics: ReviewQualityMetrics;
  // Workflow metrics
  workflowMetrics: ReviewWorkflowMetrics;
  // Reviewer metrics
  reviewerMetrics: ReviewerMetrics;
  // Trends and insights
  trends: ReviewTrends;
  insights: ReviewInsight;
  recommendations: ReviewRecommendation;
}
export interface AnalyticsPeriod {
  startDate: Date;
  endDate: Date;
  timeRange: TimeRange;
}
export interface ReviewOverallMetrics {
  totalReviews: number;
  completedReviews: number;
  approvedReviews: number;
  rejectedReviews: number;
  escalatedReviews: number;
  overdueReviews: number;
  averageCompletionTime: number; // hours,
  completionRate: number; // %,
  throughput: number; // reviews per day,
}
export interface ReviewPerformanceMetrics {
  byType: TypePerformanceMetrics;
  byPriority: PriorityPerformanceMetrics;
  byComplexity: ComplexityPerformanceMetrics;
  bottlenecks: PerformanceBottleneck;
}
export interface TypePerformanceMetrics {
  reviewType: ReviewType;
  count: number;
  averageTime: number; // hours,
  completionRate: number; // %,
  qualityScore: number; // 0-100,
}
export interface PriorityPerformanceMetrics {
  priority: ReviewPriority;
  count: number;
  averageTime: number; // hours,
  slaCompliance: number; // %,
  escalationRate: number; // %,
}
export interface ComplexityPerformanceMetrics {
  complexity: ReviewComplexity;
  count: number;
  averageTime: number; // hours,
  accuracyRate: number; // %,
  reviewerSatisfaction: number; // 0-100,
}
export interface PerformanceBottleneck {
  type: BottleneckType;
  location: string;
  impact: string;
  severity: ActionSeverity;
  recommendation: string;
}
export type BottleneckType = 
  | 'reviewer_capacity'
  | 'workflow_step'
  | 'decision_consensus'
  | 'information_gathering'
  | 'external_dependency';

export interface ReviewQualityMetrics {
  overallQualityScore: number; // 0-100,
  consistencyScore: number; // 0-100,
  accuracyRate: number; // %,
  falsePositiveRate: number; // %,
  falseNegativeRate: number; // %,
  appealRate: number; // %,
  appealSuccessRate: number; // %,
  qualityTrends: QualityTrend;
}
export interface QualityTrend {
  date: Date;
  qualityScore: number;
  consistencyScore: number;
  volume: number;
}
export interface ReviewWorkflowMetrics {
  byWorkflow: WorkflowMetrics;
  stepPerformance: StepPerformance;
  escalationAnalysis: EscalationAnalysis;
}
export interface WorkflowMetrics {
  workflowId: string;
  name: string;
  executionCount: number;
  averageCompletionTime: number; // hours,
  successRate: number; // %,
  escalationRate: number; // %,
  efficiency: number; // 0-100,
}
export interface StepPerformance {
  stepId: string;
  stepName: string;
  averageTime: number; // minutes,
  timeoutRate: number; // %,
  skipRate: number; // %,
  bottleneckScore: number; // 0-100,
}
export interface EscalationAnalysis {
  totalEscalations: number;
  escalationRate: number; // %,
  byTrigger: EscalationByTrigger;
  resolutionTime: number; // hours,
  preventableEscalations: number;
}
export interface EscalationByTrigger {
  trigger: TriggerType;
  count: number;
  percentage: number;
  averageResolutionTime: number; // hours,
}
export interface ReviewerMetrics {
  activeReviewers: number;
  reviewerPerformance: ReviewerPerformanceMetrics;
  workloadDistribution: WorkloadDistribution;
  trainingNeeds: TrainingNeed;
}
export interface ReviewerPerformanceMetrics {
  reviewerId: string;
  reviewerName: string;
  totalReviews: number;
  averageTime: number; // hours,
  qualityScore: number; // 0-100,
  throughput: number; // reviews per day,
  specializations: string;
  trend: 'improving' | 'stable' | 'declining'
  }
export interface WorkloadDistribution {
  reviewerId: string;
  currentWorkload: number;
  capacity: number;
  utilizationRate: number; // %,
  backlogHours: number;
}
export interface TrainingNeed {
  reviewerId: string;
  area: SpecializationArea;
  priority: 'low' | 'medium' | 'high';
  reason: string;
  suggestedTraining: string;
}
export interface ReviewTrends {
  volumeTrend: 'increasing' | 'stable' | 'decreasing';
  qualityTrend: 'improving' | 'stable' | 'declining';
  efficiencyTrend: 'improving' | 'stable' | 'declining';
  // Time series data
  dailyVolumes: number;
  dailyQualityScores: number;
  dailyCompletionTimes: number;
  // Seasonal patterns
  seasonalPatterns: SeasonalPattern;
}
export interface SeasonalPattern {
  period: 'hourly' | 'daily' | 'weekly' | 'monthly';
  pattern: number;
  confidence: number;
  description: string;
}
export interface ReviewInsight {
  insightId: string;
  type: InsightType;
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  actionable: boolean;
  relatedData: any;
  generatedAt: Date;
}
export type InsightType = 
  | 'performance_decline'
  | 'quality_improvement'
  | 'bottleneck_identified'
  | 'capacity_issue'
  | 'training_opportunity'
  | 'process_optimization';

export interface ReviewRecommendation {
  recommendationId: string;
  category: RecommendationCategory;
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  expectedImpact: string;
  implementation: ImplementationGuide;
  successMetrics: string;
  generatedAt: Date;
}
export type RecommendationCategory = 
  | 'workflow_optimization'
  | 'reviewer_training'
  | 'capacity_planning'
  | 'quality_improvement'
  | 'automation_opportunity'
  | 'process_standardization';

export interface ImplementationGuide {
  effort: 'low' | 'medium' | 'high';
  timeline: string;
  resources: string;
  prerequisites: string;
  risks: string;
  // =============================================================================
  // System Configuration and Settings
  // =============================================================================
}
export interface ReviewSystemConfig {
  enabled: boolean;
  globalSettings: GlobalReviewSettings;
  workflowSettings: WorkflowSettings;
  assignmentSettings: AssignmentSettings;
  qualitySettings: QualitySettings;
  performanceSettings: PerformanceSettings;
  integrationSettings: IntegrationSettings;
}
export interface GlobalReviewSettings {
  defaultReviewTimeout: number; // hours,
  maxConcurrentReviews: number;
  enableAutoAssignment: boolean;
  enableEscalation: boolean;
  enableQualityGates: boolean;
  auditRetentionDays: number;
}
export interface WorkflowSettings {
  enableVersionControl: boolean;
  requireApprovalForChanges: boolean;
  enableWorkflowTesting: boolean;
  maxWorkflowComplexity: number;
  enableConditionalLogic: boolean;
}
export interface AssignmentSettings {
  defaultAssignmentStrategy: AssignmentType;
  enableLoadBalancing: boolean;
  enableExpertiseMatching: boolean;
  enableAvailabilityChecking: boolean;
  maxAssignmentRetries: number;
}
export interface QualitySettings {
  enableQualityGates: boolean;
  minQualityScore: number;
  enableConsistencyChecking: boolean;
  enableBiasDetection: boolean;
  qualityReviewFrequency: number; // days,
}
export interface PerformanceSettings {
  enablePerformanceTracking: boolean;
  performanceReviewCycle: number; // days,
  enableRealTimeMetrics: boolean;
  alertThresholds: PerformanceAlertThresholds;
}
export interface PerformanceAlertThresholds {
  overdueReviewsThreshold: number;
  qualityScoreThreshold: number;
  throughputDeclineThreshold: number; // %,
  escalationRateThreshold: number; // %,
}
export interface IntegrationSettings {
  enableSlackNotifications: boolean;
  enableEmailNotifications: boolean;
  enableWebhooks: boolean;
  enableApiAccess: boolean;
  enableSSOIntegration: boolean;
  enableAuditLogging: boolean;
}