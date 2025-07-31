/**
 * Enforcement Action Types - Epic 17
 * 
 * Comprehensive type definitions for marketplace enforcement actions,
 * violation management, and automated moderation systems.
 * 
 * Task: E17-1753114397379-11939C - Create enforcement actions
 * Epic: 17 - Backstage Admin Controls
 */

import { TimeRange } from '../marketplace/analytics.types';
import { TrustScore, RiskFactor } from './TrustTypes';

// =============================================================================
// Core Enforcement Action Interfaces
// =============================================================================

}
export interface EnforcementAction {
  actionId: string;
  actionType: EnforcementActionType;
  severity: ActionSeverity;
  status: ActionStatus;
  // Target information
  targetType: TargetType;
  targetId: string;
  targetDetails?: TargetDetails;
  // Action details
  reason: ViolationReason;
  description: string;
  evidence: Evidence;
  duration?: ActionDuration;
  // Execution information
  executionType: ExecutionType;
  executedBy: string; // user ID or 'system',
  executedAt: Date;
  effectiveFrom: Date;
  effectiveUntil?: Date;
  // Review and appeal
  reviewStatus: ReviewStatus;
  appealable: boolean;
  appealDeadline?: Date;
  // Metadata
  policyVersion: string;
  escalationLevel: number;
  relatedActions: string; // related action IDs,
  tags: string;
  // Audit trail
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy: string;
}
}
export type EnforcementActionType = 
  | 'warning'
  | 'content_flag'
  | 'content_removal'
  | 'content_quarantine'
  | 'account_warning'
  | 'account_restriction'
  | 'account_suspension'
  | 'account_termination'
  | 'transaction_block'
  | 'payment_hold'
  | 'verification_required'
  | 'feature_restriction'
  | 'marketplace_ban'
  | 'shadow_ban'
  | 'rate_limit'
  | 'manual_review_required';

export type ActionSeverity = 'low' | 'medium' | 'high' | 'critical';

export type ActionStatus = 
  | 'pending'
  | 'active'
  | 'expired'
  | 'reversed'
  | 'appealed'
  | 'under_review'
  | 'scheduled'
  | 'failed';

export type TargetType = 'user' | 'template' | 'transaction' | 'review' | 'comment' | 'message';

export type ExecutionType = 'automatic' | 'manual' | 'scheduled' | 'escalated';

export type ReviewStatus = 
  | 'not_reviewed'
  | 'under_review'
  | 'reviewed_upheld'
  | 'reviewed_modified'
  | 'reviewed_reversed'
  | 'appeal_pending'
  | 'appeal_denied'
  | 'appeal_approved';

}
export interface TargetDetails {
  title?: string;
  creator?: string;
  category?: string;
  currentStatus?: string;
  impactLevel?: 'user' | 'community' | 'marketplace'
}
  }
}
export interface ViolationReason {
  category: ViolationCategory;
  subcategory?: string;
  specificReason: string;
  policyReference: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  automatedDetection: boolean;
  communityReported: boolean;
}
}
export type ViolationCategory = 
  | 'content_policy'
  | 'quality_standards'
  | 'security_threat'
  | 'fraud_abuse'
  | 'intellectual_property'
  | 'privacy_violation'
  | 'spam_manipulation'
  | 'harassment_hate'
  | 'legal_compliance'
  | 'terms_of_service'
  | 'community_guidelines'
  | 'payment_issues'
  | 'technical_violation';

}
export interface Evidence {
  evidenceId: string;
  type: EvidenceType;
  source: EvidenceSource;
  description: string;
  data: any; // Flexible evidence data,
  confidence: number; // 0-100,
  verifiedBy?: string;
  verifiedAt?: Date;
  attachments?: EvidenceAttachment;
}
}
export type EvidenceType = 
  | 'user_report'
  | 'automated_detection'
  | 'system_log'
  | 'content_analysis'
  | 'behavioral_pattern'
  | 'security_scan'
  | 'fraud_signal'
  | 'trust_score_violation'
  | 'manual_investigation'
  | 'external_report';

export type EvidenceSource = 
  | 'user_submission'
  | 'automated_system'
  | 'trust_score_service'
  | 'content_quality_service'
  | 'security_scanner'
  | 'fraud_detector'
  | 'admin_review'
  | 'community_moderator'
  | 'external_api';

}
export interface EvidenceAttachment {
  attachmentId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
  checksum: string;
  uploadedAt: Date;
}
}
}
export interface ActionDuration {
  type: 'temporary' | 'permanent' | 'conditional';
  duration?: number; // minutes for temporary actions,
  condition?: string; // condition for conditional actions,
  reviewPeriod?: number; // minutes until review,
  escalationPeriod?: number; // minutes until escalation,
  // =============================================================================
  // Enforcement Policy and Rules
  // =============================================================================
}
}
}
export interface EnforcementPolicy {
  policyId: string;
  name: string;
  version: string;
  description: string;
  // Policy scope
  scope: PolicyScope;
  applicableTargets: TargetType;
  // Violation rules
  violationRules: ViolationRule;
  // Action mapping
  actionMatrix: ActionMatrix;
  // Configuration
  enabled: boolean;
  priority: number;
  effectiveFrom: Date;
  effectiveUntil?: Date;
  // Metadata
  createdBy: string;
  approvedBy: string;
  lastModified: Date;
}
}
}
export interface PolicyScope {
  global: boolean;
  regions?: string;
  userTypes?: string;
  categories?: string;
  excludedEntities?: string;
}
}
}
export interface ViolationRule {
  ruleId: string;
  name: string;
  description: string;
  // Detection criteria
  triggers: RuleTrigger;
  conditions: RuleCondition;
  // Thresholds
  thresholds: RuleThreshold;
  // Actions
  actions: RuleAction;
  // Configuration
  enabled: boolean;
  severity: ActionSeverity;
  escalationPath: string;
}
}
}
export interface RuleTrigger {
  type: TriggerType;
  source: string;
  event: string;
  parameters: Record<string, any>;
}
}
export type TriggerType = 
  | 'trust_score_change'
  | 'violation_report'
  | 'automated_detection'
  | 'user_action'
  | 'system_event'
  | 'external_signal';

}
export interface RuleCondition {
  field: string;
  operator: ConditionOperator;
  value: any;
  weight: number;
}
}
export type ConditionOperator = 
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'less_than'
  | 'contains'
  | 'not_contains'
  | 'in'
  | 'not_in'
  | 'regex'
  | 'exists'
  | 'not_exists';

}
export interface RuleThreshold {
  metric: string;
  threshold: number;
  timeWindow: number; // minutes,
  aggregation: 'count' | 'sum' | 'average' | 'max' | 'min'
}
  }
}
export interface RuleAction {
  actionType: EnforcementActionType;
  severity: ActionSeverity;
  duration?: ActionDuration;
  escalationDelay?: number; // minutes,
  requiresManualReview: boolean;
  notificationRequired: boolean;
}
}
}
export interface ActionMatrix {
  firstOffense: EnforcementActionType;
  repeatOffense: EnforcementActionType;
  severeThreat: EnforcementActionType;
  communityHarm: EnforcementActionType;
  legalViolation: EnforcementActionType;
  // =============================================================================
  // Enforcement Workflow and Automation
  // =============================================================================
}
}
}
export interface EnforcementWorkflow {
  workflowId: string;
  name: string;
  description: string;
  // Workflow configuration
  trigger: WorkflowTrigger;
  steps: WorkflowStep;
  // Execution settings
  executionMode: 'automatic' | 'semi_automatic' | 'manual';
  parallelExecution: boolean;
  maxRetries: number;
  timeout: number; // minutes,
  // Approval requirements
  requiresApproval: boolean;
  approvalLevel: ApprovalLevel;
  approvers: string;
  // Status and metrics
  enabled: boolean;
  successRate: number;
  averageExecutionTime: number;
  totalExecutions: number;
  // Metadata
  createdAt: Date;
  lastModified: Date;
  version: string;
}
}
}
export interface WorkflowTrigger {
  type: 'violation_detected' | 'trust_score_threshold' | 'manual_request' | 'scheduled' | 'external_event';
  conditions: TriggerCondition;
  debounceTime?: number; // minutes to wait before retriggering,
}
}
}
export interface TriggerCondition {
  field: string;
  operator: ConditionOperator;
  value: any;
  required: boolean;
}
}
}
export interface WorkflowStep {
  stepId: string;
  name: string;
  type: StepType;
  // Step configuration
  action: StepAction;
  conditions?: StepCondition;
  // Flow control
  nextSteps: NextStep;
  retryPolicy?: RetryPolicy;
  timeout?: number; // minutes,
  // Execution tracking
  executionCount: number;
  successCount: number;
  failureCount: number;
  averageExecutionTime: number;
}
}
export type StepType = 
  | 'enforcement_action'
  | 'notification'
  | 'data_collection'
  | 'risk_assessment'
  | 'manual_review'
  | 'escalation'
  | 'approval'
  | 'rollback';

}
export interface StepAction {
  actionType: string;
  parameters: Record<string, any>;
  failureHandling: 'continue' | 'retry' | 'abort' | 'escalate'
}
  }
}
export interface StepCondition {
  field: string;
  operator: ConditionOperator;
  value: any;
  onMatch: 'continue' | 'skip' | 'branch';
  branchTo?: string; // step ID,
}
}
}
export interface NextStep {
  stepId: string;
  condition?: string;
  delay?: number; // minutes,
}
}
}
export interface RetryPolicy {
  maxRetries: number;
  retryDelay: number; // minutes,
  backoffMultiplier: number;
  retryConditions: string;
}
}
export type ApprovalLevel = 'admin' | 'senior_admin' | 'legal' | 'security_team' | 'multi_level';

// =============================================================================
// Violation Detection and Reporting
// =============================================================================

}
export interface ViolationReport {
  reportId: string;
  reportType: ReportType;
  // Target information
  targetType: TargetType;
  targetId: string;
  targetSnapshot?: any; // snapshot of target at time of report,
  // Violation details
  violationType: ViolationCategory;
  description: string;
  severity: ActionSeverity;
  confidence: number; // 0-100,
  // Reporter information
  reportedBy: ReporterInfo;
  reportedAt: Date;
  // Detection details
  detectionMethod: DetectionMethod;
  evidence: Evidence;
  relatedReports: string;
  // Processing status
  status: ReportStatus;
  assignedTo?: string;
  investigationNotes?: InvestigationNote;
  resolution?: ReportResolution;
  // Metadata
  priority: 'low' | 'medium' | 'high' | 'critical';
  tags: string;
  externalReferences: string;
}
}
export type ReportType = 
  | 'community_report'
  | 'automated_detection'
  | 'security_alert'
  | 'trust_score_violation'
  | 'quality_violation'
  | 'fraud_detection'
  | 'admin_investigation';

}
export interface ReporterInfo {
  reporterId: string;
  reporterType: 'user' | 'moderator' | 'admin' | 'system' | 'external';
  credibility: number; // 0-100,
  previousReports: number;
  reportAccuracyRate: number; // 0-100,
  isVerified: boolean;
}
}
}
export interface DetectionMethod {
  method: 'manual_report' | 'automated_scan' | 'pattern_analysis' | 'ml_detection' | 'rule_engine';
  algorithm?: string;
  modelVersion?: string;
  confidence: number; // 0-100,
  falsePositiveRate?: number; // 0-100,
}
}
export type ReportStatus = 
  | 'submitted'
  | 'under_review'
  | 'escalated'
  | 'resolved'
  | 'dismissed'
  | 'duplicate'
  | 'insufficient_evidence';

}
export interface InvestigationNote {
  noteId: string;
  investigatorId: string;
  note: string;
  timestamp: Date;
  visibility: 'internal' | 'public' | 'legal';
  attachments?: EvidenceAttachment;
}
}
}
export interface ReportResolution {
  outcome: ResolutionOutcome;
  actions: string; // enforcement action IDs,
  reasonCode: string;
  explanation: string;
  resolvedBy: string;
  resolvedAt: Date;
  appealable: boolean;
  appealDeadline?: Date;
}
}
export type ResolutionOutcome = 
  | 'violation_confirmed'
  | 'violation_not_found'
  | 'insufficient_evidence'
  | 'policy_clarification_needed'
  | 'duplicate_report'
  | 'malicious_report';

// =============================================================================
// Appeal and Review System
// =============================================================================

}
export interface EnforcementAppeal {
  appealId: string;
  // Appeal target
  enforcementActionId: string;
  enforcementAction: EnforcementAction;
  // Appellant information
  appellantId: string;
  appellantType: 'target' | 'affected_party' | 'third_party';
  // Appeal details
  appealReason: AppealReason;
  description: string;
  evidence: Evidence;
  requestedOutcome: RequestedOutcome;
  // Processing information
  status: AppealStatus;
  submittedAt: Date;
  reviewDeadline: Date;
  // Review details
  assignedReviewer?: string;
  reviewPanel?: string;
  reviewNotes?: ReviewNote;
  // Resolution
  decision?: AppealDecision;
  decisionReason?: string;
  decidedBy?: string;
  decidedAt?: Date;
  // Follow-up
  followUpActions?: string;
  compensationAwarded?: Compensation;
  // Metadata
  priority: 'normal' | 'expedited' | 'urgent';
  publicVisibility: boolean;
  legalImplications: boolean;
}
}
}
export interface AppealReason {
  category: AppealCategory;
  specificReason: string;
  claimsInnocence: boolean;
  claimsError: boolean;
  claimsDisproportion: boolean;
  claimsBias: boolean;
  newEvidence: boolean;
}
}
export type AppealCategory = 
  | 'factual_error'
  | 'procedural_error'
  | 'disproportionate_action'
  | 'policy_misinterpretation'
  | 'technical_error'
  | 'bias_discrimination'
  | 'new_evidence'
  | 'changed_circumstances';

}
export interface RequestedOutcome {
  action: 'complete_reversal' | 'partial_reversal' | 'action_modification' | 'compensation' | 'policy_clarification';
  specificRequest: string;
  justification: string;
}
}
export type AppealStatus = 
  | 'submitted'
  | 'under_review'
  | 'additional_info_requested'
  | 'panel_review'
  | 'decision_pending'
  | 'approved'
  | 'denied'
  | 'partially_approved'
  | 'withdrawn';

}
export interface ReviewNote {
  reviewerId: string;
  note: string;
  timestamp: Date;
  category: 'procedural' | 'factual' | 'legal' | 'policy' | 'recommendation';
  confidential: boolean;
}
}
}
export interface AppealDecision {
  outcome: 'approved' | 'denied' | 'partially_approved' | 'remanded';
  reasoning: string;
  evidenceConsidered: string;
  policyReferences: string;
  precedentCases?: string;
  // Modifications if partially approved
  modifiedActions?: Partial<EnforcementAction>[];
  // Implementation timeline
  implementationDeadline?: Date;
  monitoringRequired?: boolean;
}
}
}
export interface Compensation {
  type: 'monetary' | 'service_credit' | 'fee_waiver' | 'priority_review' | 'public_apology';
  amount?: number;
  currency?: string;
  description: string;
  processingTime: number; // days,
  // =============================================================================
  // Enforcement Analytics and Reporting
  // =============================================================================
}
}
}
export interface EnforcementAnalytics {
  period: AnalyticsPeriod;
  generatedAt: Date;
  // Overall metrics
  overallMetrics: EnforcementOverallMetrics;
  // Action breakdown
  actionBreakdown: ActionBreakdown;
  violationBreakdown: ViolationBreakdown;
  // Effectiveness metrics
  effectivenessMetrics: EffectivenessMetrics;
  // Trends and patterns
  trends: EnforcementTrends;
  patterns: ViolationPattern;
  // Appeal metrics
  appealMetrics: AppealMetrics;
  // Insights and recommendations
  insights: EnforcementInsight;
  recommendations: EnforcementRecommendation;
}
}
}
export interface AnalyticsPeriod {
  startDate: Date;
  endDate: Date;
  timeRange: TimeRange;
}
}
}
export interface EnforcementOverallMetrics {
  totalActions: number;
  totalViolations: number;
  totalAppeals: number;
  // Action distribution
  automaticActions: number;
  manualActions: number;
  // Resolution metrics
  averageResolutionTime: number; // hours,
  appealSuccessRate: number; // percentage,
  // Community impact
  affectedUsers: number;
  affectedTemplates: number;
  communityTrustImpact: number; // -100 to 100,
}
}
}
export interface ActionBreakdown {
  byType: ActionTypeMetrics;
  bySeverity: ActionSeverityMetrics;
  byStatus: ActionStatusMetrics;
  byExecutionType: ExecutionTypeMetrics;
}
}
}
export interface ActionTypeMetrics {
  actionType: EnforcementActionType;
  count: number;
  percentage: number;
  averageDuration: number; // hours,
  successRate: number; // percentage,
  appealRate: number; // percentage,
}
}
}
export interface ActionSeverityMetrics {
  severity: ActionSeverity;
  count: number;
  percentage: number;
  averageResolutionTime: number; // hours,
  escalationRate: number; // percentage,
}
}
}
export interface ActionStatusMetrics {
  status: ActionStatus;
  count: number;
  percentage: number;
  averageTimeInStatus: number; // hours,
}
}
}
export interface ExecutionTypeMetrics {
  executionType: ExecutionType;
  count: number;
  percentage: number;
  accuracyRate: number; // percentage,
  overrideRate: number; // percentage,
}
}
}
export interface ViolationBreakdown {
  byCategory: ViolationCategoryMetrics;
  bySource: ViolationSourceMetrics;
  byConfidence: ConfidenceMetrics;
}
}
}
export interface ViolationCategoryMetrics {
  category: ViolationCategory;
  count: number;
  percentage: number;
  averageSeverity: ActionSeverity;
  resolutionRate: number; // percentage,
  falsePositiveRate: number; // percentage,
}
}
}
export interface ViolationSourceMetrics {
  source: EvidenceSource;
  count: number;
  percentage: number;
  accuracy: number; // percentage,
  averageConfidence: number; // 0-100,
}
}
}
export interface ConfidenceMetrics {
  confidenceRange: string; // e.g., "80-90%",
  count: number;
  accuracyRate: number; // percentage,
  falsePositiveRate: number; // percentage,
}
}
}
export interface EffectivenessMetrics {
  deterrentEffect: number; // percentage reduction in violations,
  recidivismRate: number; // percentage of repeat offenders,
  communityHealthImprovement: number; // percentage,
  falsePositiveRate: number; // percentage,
  falseNegativeRate: number; // percentage,
  // Time metrics
  averageDetectionTime: number; // hours from violation to detection,
  averageActionTime: number; // hours from detection to action,
  averageResolutionTime: number; // hours from action to resolution,
}
}
}
export interface EnforcementTrends {
  violationTrend: 'increasing' | 'stable' | 'decreasing';
  actionTrend: 'increasing' | 'stable' | 'decreasing';
  appealTrend: 'increasing' | 'stable' | 'decreasing';
  // Trend data
  monthlyViolations: number;
  monthlyActions: number;
  monthlyAppeals: number;
  // Seasonal patterns
  seasonalPatterns: SeasonalPattern;
  // Prediction
  predictedViolations: number;
  predictionConfidence: number; // 0-100,
}
}
}
export interface ViolationPattern {
  patternId: string;
  description: string;
  frequency: number;
  severity: ActionSeverity;
  affectedUsers: number;
  detectionAccuracy: number; // percentage,
  preventionStrategy: string;
}
}
}
export interface SeasonalPattern {
  period: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  pattern: number;
  strength: number; // 0-100,
  description: string;
}
}
}
export interface AppealMetrics {
  totalAppeals: number;
  appealRate: number; // percentage of actions appealed,
  // Outcome distribution
  appealsApproved: number;
  appealsDenied: number;
  appealsPartiallyApproved: number;
  // Time metrics
  averageAppealTime: number; // hours,
  averageReviewTime: number; // hours,
  // Quality metrics
  appealAccuracy: number; // percentage of correct decisions,
  overturnRate: number; // percentage of actions overturned,
}
}
}
export interface EnforcementInsight {
  insightId: string;
  type: 'trend' | 'anomaly' | 'pattern' | 'risk' | 'opportunity';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-100,
  actionable: boolean;
  recommendedActions: string;
  generatedAt: Date;
}
}
}
export interface EnforcementRecommendation {
  recommendationId: string;
  category: 'policy' | 'automation' | 'process' | 'training' | 'technology';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  expectedImpact: string;
  implementationEffort: 'low' | 'medium' | 'high';
  timeline: string;
  successMetrics: string;
  generatedAt: Date;
}
}