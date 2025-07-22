/**
 * Escalation Types - Epic 17 Implementation
 * Task: E17-1753114397261-63A60C - Implement escalation procedures
 * 
 * Comprehensive type definitions for the escalation system including
 * enums, interfaces, and validation schemas for all escalation-related
 * data structures and API contracts.
 */

import { z } from 'zod';

// =============================================================================
// Core Enums
// =============================================================================

export enum EscalationTriggerType {
  TIME_BASED = 'time_based',
  THRESHOLD_BASED = 'threshold_based', 
  MANUAL = 'manual',
  AUTOMATED = 'automated',
  CONDITIONAL = 'conditional',
  PRIORITY_BASED = 'priority_based'
}

export enum EscalationStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  ESCALATED = 'escalated',
  RESOLVED = 'resolved',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired'
}

export enum EscalationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
  CRITICAL = 'critical'
}

export enum EscalationCategory {
  FRAUD_DETECTION = 'fraud_detection',
  APPEAL_PROCESS = 'appeal_process',
  POLICY_VIOLATION = 'policy_violation',
  SYSTEM_INCIDENT = 'system_incident',
  COMPLIANCE_ISSUE = 'compliance_issue',
  SECURITY_ALERT = 'security_alert',
  CUSTOMER_COMPLAINT = 'customer_complaint',
  TECHNICAL_ISSUE = 'technical_issue',
  BUSINESS_CRITICAL = 'business_critical',
  REGULATORY = 'regulatory'
}

export enum NotificationType {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  SLACK = 'slack',
  TEAMS = 'teams',
  WEBHOOK = 'webhook',
  DASHBOARD = 'dashboard'
}

export enum EscalationActionType {
  NOTIFICATION = 'notification',
  ASSIGNMENT = 'assignment',
  STATUS_CHANGE = 'status_change',
  DATA_COLLECTION = 'data_collection',
  EXTERNAL_API = 'external_api',
  WORKFLOW = 'workflow',
  CUSTOM = 'custom'
}

export enum AssignmentType {
  INDIVIDUAL = 'individual',
  GROUP = 'group',
  ROLE = 'role',
  QUEUE = 'queue',
  AUTOMATIC = 'automatic'
}

// =============================================================================
// Validation Schemas
// =============================================================================

export const EscalationConditionSchema = z.object({
  conditionId: z.string(),
  type: z.enum(['value', 'time', 'count', 'percentage', 'custom']),
  field: z.string(),
  operator: z.enum(['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'contains', 'regex']),
  value: z.union([z.string(), z.number(), z.boolean()]),
  logicalOperator: z.enum(['AND', 'OR']).optional()
});

export const NotificationMethodSchema = z.object({
  type: z.nativeEnum(NotificationType),
  address: z.string(),
  priority: z.nativeEnum(EscalationPriority),
  immediateDelivery: z.boolean(),
  retryCount: z.number().min(0).max(10).optional(),
  retryInterval: z.number().min(1).optional()
});

export const EscalationActionSchema = z.object({
  actionId: z.string(),
  type: z.nativeEnum(EscalationActionType),
  configuration: z.record(z.any()),
  executeImmediately: z.boolean(),
  rollbackable: z.boolean()
});

export const EscalationLevelSchema = z.object({
  levelId: z.string(),
  level: z.number().min(0),
  name: z.string().min(1).max(100),
  description: z.string().max(500),
  assignmentType: z.nativeEnum(AssignmentType),
  assignmentTarget: z.string(),
  notificationMethods: z.array(NotificationMethodSchema),
  notificationTemplate: z.string().optional(),
  responseTimeLimit: z.number().min(1),
  resolutionTimeLimit: z.number().min(1),
  automaticActions: z.array(EscalationActionSchema).optional(),
  requiredActions: z.array(z.string()).optional(),
  escalationCriteria: z.array(EscalationConditionSchema).optional()
});

export const EscalationRuleSchema = z.object({
  ruleId: z.string(),
  name: z.string().min(1).max(255),
  description: z.string().max(1000),
  category: z.nativeEnum(EscalationCategory),
  enabled: z.boolean(),
  triggerType: z.nativeEnum(EscalationTriggerType),
  conditions: z.array(EscalationConditionSchema),
  escalationPath: z.array(EscalationLevelSchema).min(1),
  initialDelay: z.number().min(1).optional(),
  escalationInterval: z.number().min(1).optional(),
  maxEscalationTime: z.number().min(1).optional(),
  businessHoursOnly: z.boolean().optional(),
  allowWeekends: z.boolean().optional(),
  timeZone: z.string().optional(),
  createdBy: z.string(),
  createdAt: z.date(),
  lastModified: z.date(),
  version: z.number().min(1)
});

// =============================================================================
// Core Interfaces
// =============================================================================

export interface EscalationCondition {
  conditionId: string;
  type: 'value' | 'time' | 'count' | 'percentage' | 'custom';
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'regex';
  value: string | number | boolean;
  logicalOperator?: 'AND' | 'OR';
}

export interface NotificationMethod {
  type: NotificationType;
  address: string;
  priority: EscalationPriority;
  immediateDelivery: boolean;
  retryCount?: number;
  retryInterval?: number; // minutes
}

export interface EscalationAction {
  actionId: string;
  type: EscalationActionType;
  configuration: Record<string, any>;
  executeImmediately: boolean;
  rollbackable: boolean;
}

export interface EscalationLevel {
  levelId: string;
  level: number;
  name: string;
  description: string;
  assignmentType: AssignmentType;
  assignmentTarget: string;
  notificationMethods: NotificationMethod[];
  notificationTemplate?: string;
  responseTimeLimit: number; // minutes
  resolutionTimeLimit: number; // minutes
  automaticActions?: EscalationAction[];
  requiredActions?: string[];
  escalationCriteria?: EscalationCondition[];
}

export interface EscalationRule {
  ruleId: string;
  name: string;
  description: string;
  category: EscalationCategory;
  enabled: boolean;
  triggerType: EscalationTriggerType;
  conditions: EscalationCondition[];
  escalationPath: EscalationLevel[];
  initialDelay?: number; // minutes
  escalationInterval?: number; // minutes between levels
  maxEscalationTime?: number; // maximum time before auto-resolution
  businessHoursOnly?: boolean;
  allowWeekends?: boolean;
  timeZone?: string;
  createdBy: string;
  createdAt: Date;
  lastModified: Date;
  version: number;
}

// =============================================================================
// Case and Workflow Interfaces
// =============================================================================

export interface EscalationPathStep {
  stepId: string;
  level: number;
  levelName: string;
  assignedTo: string;
  assignedAt: Date;
  acknowledgedAt?: Date;
  respondedAt?: Date;
  completedAt?: Date;
  escalatedAt?: Date;
  escalationReason?: string;
  notes?: string;
  timeSpent?: number; // minutes
}

export interface EscalationNotification {
  notificationId: string;
  method: string;
  recipient: string;
  sentAt: Date;
  deliveredAt?: Date;
  readAt?: Date;
  failureReason?: string;
  retryCount: number;
  priority: EscalationPriority;
}

export interface EscalationActionLog {
  actionId: string;
  actionType: string;
  executedAt: Date;
  executedBy: string;
  success: boolean;
  result?: Record<string, any>;
  error?: string;
  rollbackable: boolean;
  rolledBackAt?: Date;
}

export interface EscalationResolution {
  resolutionType: 'resolved' | 'cancelled' | 'transferred' | 'merged' | 'expired';
  resolutionLevel: number;
  resolvedBy: string;
  resolutionTime: number; // minutes from creation
  satisfactionRating?: number; // 1-5
  lessonsLearned?: string[];
  improvementSuggestions?: string[];
}

export interface EscalationCase {
  caseId: string;
  ruleId: string;
  category: EscalationCategory;
  priority: EscalationPriority;
  status: EscalationStatus;
  
  // Source information
  sourceType: string;
  sourceId: string;
  sourceData: Record<string, any>;
  
  // Current escalation state
  currentLevel: number;
  currentAssignee?: string;
  currentAssigneeType?: 'user' | 'group' | 'role';
  
  // Timing
  createdAt: Date;
  updatedAt: Date;
  escalatedAt?: Date;
  responseDeadline?: Date;
  resolutionDeadline?: Date;
  resolvedAt?: Date;
  
  // Tracking
  escalationPath: EscalationPathStep[];
  notifications: EscalationNotification[];
  actions: EscalationActionLog[];
  
  // Resolution
  resolution?: EscalationResolution;
  resolutionNotes?: string;
  followUpRequired?: boolean;
  
  // Metadata
  tags: string[];
  metadata: Record<string, any>;
}

// =============================================================================
// Metrics and Analytics Interfaces
// =============================================================================

export interface EscalationCategoryMetrics {
  category: EscalationCategory;
  totalCases: number;
  averageResolutionTime: number;
  escalationRate: number;
  satisfactionScore: number;
  topIssues: string[];
}

export interface EscalationLevelMetrics {
  level: number;
  totalCases: number;
  resolutionRate: number; // percentage resolved at this level
  averageResponseTime: number;
  averageResolutionTime: number;
  escalationRate: number; // percentage escalated to next level
  workloadDistribution: Map<string, number>; // assignee -> case count
}

export interface EscalationTrend {
  period: string; // 'hourly', 'daily', 'weekly', 'monthly'
  timestamp: Date;
  totalCases: number;
  escalationRate: number;
  resolutionTime: number;
  satisfactionScore: number;
}

export interface EscalationMetrics {
  totalCases: number;
  activeCases: number;
  resolvedCases: number;
  escalatedCases: number;
  expiredCases: number;
  averageResolutionTime: number; // hours
  averageEscalationLevels: number;
  firstLevelResolutionRate: number; // percentage
  slaComplianceRate: number; // percentage
  categoryMetrics: Map<EscalationCategory, EscalationCategoryMetrics>;
  levelMetrics: Map<number, EscalationLevelMetrics>;
  trends: EscalationTrend[];
  satisfactionScore: number; // 1-5 average
  ruleEffectivenessScore: number; // 0-100
}

// =============================================================================
// Dashboard Interfaces
// =============================================================================

export interface EscalationAlert {
  alertId: string;
  type: 'sla_breach' | 'high_volume' | 'system_issue' | 'quality_concern' | 'capacity_limit';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  affectedCases: string[];
  recommendedActions: string[];
  createdAt: Date;
}

export interface EscalationRecommendation {
  recommendationId: string;
  type: 'process_improvement' | 'resource_allocation' | 'rule_optimization' | 'training_need';
  title: string;
  description: string;
  expectedImpact: string;
  implementationEffort: 'low' | 'medium' | 'high';
  priority: EscalationPriority;
  category?: EscalationCategory;
}

export interface WorkloadAssignment {
  assignee: string;
  activeCases: number;
  overdueItems: number;
  utilizationRate: number;
}

export interface CategoryBreakdown {
  category: EscalationCategory;
  count: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
}

export interface EscalationDashboard {
  overview: {
    activeCases: number;
    criticalCases: number;
    overdueResponses: number;
    overdueResolutions: number;
    averageWaitTime: number;
  };
  
  recentEscalations: EscalationCase[];
  urgentCases: EscalationCase[];
  
  performance: {
    slaCompliance: number;
    firstCallResolution: number;
    customerSatisfaction: number;
    averageHandleTime: number;
  };
  
  workloadDistribution: WorkloadAssignment[];
  categoryBreakdown: CategoryBreakdown[];
  alerts: EscalationAlert[];
  recommendations: EscalationRecommendation[];
}

// =============================================================================
// API Request/Response Types
// =============================================================================

export interface CreateEscalationRuleRequest {
  name: string;
  description?: string;
  category: EscalationCategory;
  enabled?: boolean;
  triggerType: EscalationTriggerType;
  conditions: EscalationCondition[];
  escalationPath: Omit<EscalationLevel, 'levelId'>[];
  initialDelay?: number;
  escalationInterval?: number;
  maxEscalationTime?: number;
  businessHoursOnly?: boolean;
  allowWeekends?: boolean;
  timeZone?: string;
}

export interface UpdateEscalationRuleRequest {
  name?: string;
  description?: string;
  category?: EscalationCategory;
  enabled?: boolean;
  conditions?: EscalationCondition[];
  escalationPath?: EscalationLevel[];
  initialDelay?: number;
  escalationInterval?: number;
  maxEscalationTime?: number;
  businessHoursOnly?: boolean;
  allowWeekends?: boolean;
  timeZone?: string;
}

export interface CreateEscalationCaseRequest {
  sourceType: string;
  sourceId: string;
  sourceData: Record<string, any>;
  ruleId?: string;
  priority?: EscalationPriority;
}

export interface EscalateCaseRequest {
  reason?: string;
}

export interface ResolveCaseRequest {
  resolutionType: 'resolved' | 'cancelled' | 'transferred' | 'merged';
  resolutionNotes?: string;
  satisfactionRating?: number;
  lessonsLearned?: string[];
  improvementSuggestions?: string[];
}

export interface GetEscalationCasesQuery {
  status?: EscalationStatus;
  priority?: EscalationPriority;
  category?: EscalationCategory;
  assignee?: string;
  sourceType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface GetEscalationRulesQuery {
  category?: EscalationCategory;
  enabled?: boolean;
  triggerType?: EscalationTriggerType;
  page?: number;
  limit?: number;
}

export interface GetEscalationMetricsQuery {
  period?: 'hourly' | 'daily' | 'weekly' | 'monthly';
  startDate?: Date;
  endDate?: Date;
  category?: EscalationCategory;
}

export interface GetEscalationAnalyticsQuery {
  period?: 'week' | 'month' | 'quarter' | 'year';
  groupBy?: 'category' | 'priority' | 'assignee' | 'level';
}

// =============================================================================
// Response Types
// =============================================================================

export interface EscalationAPIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface EscalationRuleTestResult {
  ruleId: string;
  testData: Record<string, any>;
  wouldTrigger: boolean;
  matchedConditions: string[];
  suggestedLevel: number;
  estimatedEscalationPath: {
    level: number;
    assignee: string;
    estimatedTime: number;
  }[];
  warnings: string[];
}

export interface AssigneePerformance {
  assignee: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
  casesHandled: number;
  averageResolutionTime: number;
  firstCallResolutionRate: number;
  escalationRate: number;
  satisfactionScore: number;
  workloadUtilization: number;
  specializations: EscalationCategory[];
}

// =============================================================================
// Integration Types
// =============================================================================

export interface EscalationIntegration {
  integrationId: string;
  name: string;
  type: 'webhook' | 'api' | 'email' | 'slack' | 'teams' | 'custom';
  configuration: Record<string, any>;
  enabled: boolean;
  events: EscalationEventType[];
  credentials?: Record<string, string>;
  rateLimits?: {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
  };
}

export enum EscalationEventType {
  CASE_CREATED = 'case_created',
  CASE_ESCALATED = 'case_escalated',
  CASE_RESOLVED = 'case_resolved',
  LEVEL_TIMEOUT = 'level_timeout',
  SLA_BREACH = 'sla_breach',
  ASSIGNMENT_CHANGED = 'assignment_changed',
  NOTIFICATION_SENT = 'notification_sent',
  ACTION_EXECUTED = 'action_executed'
}

export interface EscalationEvent {
  eventId: string;
  type: EscalationEventType;
  caseId: string;
  timestamp: Date;
  data: Record<string, any>;
  triggeredBy: string;
  integrations?: string[]; // Integration IDs that should receive this event
}

// =============================================================================
// Configuration Types
// =============================================================================

export interface EscalationServiceConfig {
  defaultTimezone: string;
  businessHours: {
    startTime: string; // HH:MM format
    endTime: string;   // HH:MM format
    daysOfWeek: number[]; // 0-6, Sunday = 0
  };
  notifications: {
    retryAttempts: number;
    retryInterval: number; // minutes
    enableBatching: boolean;
    batchSize: number;
    batchInterval: number; // minutes
  };
  performance: {
    metricsRetentionDays: number;
    autoCleanupExpiredCases: boolean;
    maxConcurrentEscalations: number;
  };
  integrations: {
    enableWebhooks: boolean;
    webhookTimeout: number; // seconds
    enableSlackNotifications: boolean;
    enableTeamsNotifications: boolean;
  };
}

export default {
  // Export all enums and interfaces
  EscalationTriggerType,
  EscalationStatus,
  EscalationPriority,
  EscalationCategory,
  NotificationType,
  EscalationActionType,
  AssignmentType,
  EscalationEventType,
  
  // Export all schemas
  EscalationConditionSchema,
  NotificationMethodSchema,
  EscalationActionSchema,
  EscalationLevelSchema,
  EscalationRuleSchema
};