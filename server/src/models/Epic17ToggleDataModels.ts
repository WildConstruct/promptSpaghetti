/**
 * Epic 17 Enhanced Toggle Data Models
 * Task: E17-1753114396711-F70433 - Design toggle data model
 * 
 * Enhanced TypeScript interfaces and Zod validation schemas for Epic 17
 * admin dashboard, advanced analytics, and comprehensive toggle management.
 * 
 * Builds on existing feature-toggle-models.ts with additional Epic 17 requirements.
 */

import { z } from 'zod';
import {
  FeatureToggle,
  ToggleType,
  ClaudeImpact,
  ToggleAuditAction,
  ToggleEvaluationContext,
  ToggleEvaluationResult,
  ToggleMetrics,
  ToggleHealthStatus
 from '../database/feature-toggle-models';

// ====================================
// Epic 17 Enhanced Toggle Models
// ====================================

// Enhanced feature toggle with Epic 17 admin dashboard capabilities



export interface Epic17FeatureToggle extends FeatureToggle {
  // Epic 17 Dashboard Analytics
  analytics: {
    evaluationCount24h: number;
    evaluationCount7d: number;
    evaluationCount30d: number;
    successRate: number;
    errorRate: number;
    avgResponseTime: number;
    lastEvaluatedAt?: Date;
    popularityScore: number; // 0-100 based on usage
  };

  // Epic 17 Performance Tracking
  performance: {
    cacheHitRate: number;
    avgCacheTime: number;
    slowQueryCount: number;
    evaluationLatencyP50: number;
    evaluationLatencyP95: number;
    evaluationLatencyP99: number;
  };

  // Epic 17 Status and Health
  health: {
    status: 'healthy' | 'degraded' | 'error' | 'disabled';
    healthScore: number; // 0-100
    lastHealthCheck: Date;
    issues: ToggleIssue[];
    dependencyStatus: 'ok' | 'warning' | 'blocked';
  };

  // Epic 17 Admin Dashboard Metadata
  dashboard: {
    category: string;
    tags: string[];
    owner: string;
    reviewedBy?: string;
    reviewedAt?: Date;
    approvalRequired: boolean;
    lastModifiedBySystem: boolean;
  };

  // Epic 17 Security and Compliance
  security: {
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    requiresApproval: boolean;
    hasOverrides: boolean;
    lastOverrideAt?: Date;
    emergencyKillSwitch: boolean;
    complianceFlags: string[];
  };

  // Epic 17 Rollout Management
  rollout?: {
    strategy: 'immediate' | 'gradual' | 'canary' | 'blue_green';
    currentStage: string;
    targetPercentage: number;
    currentPercentage: number;
    rolloutSpeed: 'slow' | 'medium' | 'fast';
    rollbackConditions: RollbackCondition[];
    scheduledAt?: Date;
  };


// Toggle issue tracking for health monitoring



export interface ToggleIssue {
  id: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  category: 'performance' | 'dependency' | 'evaluation' | 'config' | 'security';
  message: string;
  details?: string;
  affectedUsers?: number;
  detectedAt: Date;
  resolvedAt?: Date;
  autoResolve: boolean;





// Rollback conditions for automated rollout management



export interface RollbackCondition {
  metric: 'error_rate' | 'latency' | 'user_complaints' | 'dependency_failure';
  threshold: number;
  timeWindow: number; // minutes
  enabled: boolean;





// ====================================
// Epic 17 Dashboard Query Models
// ====================================

// Enhanced toggle filter for admin dashboard



export interface Epic17ToggleFilter {
  // Basic filters
  search?: string;
  enabled?: boolean;
  type?: ToggleType | ToggleType[];
  claudeImpact?: ClaudeImpact | ClaudeImpact[];
  
  // Epic 17 Enhanced filters
  healthStatus?: ('healthy' | 'degraded' | 'error' | 'disabled')[];
  riskLevel?: ('low' | 'medium' | 'high' | 'critical')[];
  category?: string[];
  tags?: string[];
  owner?: string;
  hasOverrides?: boolean;
  requiresApproval?: boolean;
  
  // Time-based filters
  createdAfter?: Date;
  createdBefore?: Date;
  lastModifiedAfter?: Date;
  lastModifiedBefore?: Date;
  evaluatedAfter?: Date;
  
  // Performance filters
  minEvaluationCount?: number;
  maxEvaluationCount?: number;
  minSuccessRate?: number;
  maxErrorRate?: number;
  minHealthScore?: number;
  maxResponseTime?: number;
  
  // Rollout filters
  rolloutStrategy?: ('immediate' | 'gradual' | 'canary' | 'blue_green')[];
  rolloutStage?: string[];





// Enhanced sorting for admin dashboard



export interface Epic17ToggleSort {
  field: 'name' | 'key' | 'created_at' | 'updated_at' | 'last_evaluated' |
         'evaluation_count' | 'success_rate' | 'error_rate' | 'health_score' |
         'popularity_score' | 'response_time';
  direction: 'asc' | 'desc';
  secondary?: {
    field: Epic17ToggleSort['field'];
    direction: 'asc' | 'desc';



  };


// Paginated query for dashboard



export interface Epic17ToggleQuery {
  filters?: Epic17ToggleFilter;
  sort?: Epic17ToggleSort;
  pagination: {
    offset: number;
    limit: number;
    cursor?: string; // For cursor-based pagination



  };
  includeAnalytics?: boolean;
  includeHealth?: boolean;
  includeDependencies?: boolean;


// Query response with metadata



export interface Epic17ToggleQueryResponse {
  toggles: Epic17FeatureToggle[];
  pagination: {
    total: number;
    offset: number;
    limit: number;
    hasMore: boolean;
    nextCursor?: string;



  };
  aggregations: {
    totalToggles: number;
    enabledToggles: number;
    disabledToggles: number;
    unhealthyToggles: number;
    highRiskToggles: number;
    avgHealthScore: number;
    avgSuccessRate: number;
  };
  facets: {
    types: Array<{ type: ToggleType; count: number }>;
    claudeImpacts: Array<{ impact: ClaudeImpact; count: number }>;
    categories: Array<{ category: string; count: number }>;
    owners: Array<{ owner: string; count: number }>;
  };


// ====================================
// Epic 17 Dashboard Summary Models
// ====================================

// Dashboard summary statistics



export interface Epic17DashboardSummary {
  overview: {
    totalToggles: number;
    activeToggles: number;
    healthyToggles: number;
    unhealthyToggles: number;
    avgHealthScore: number;
    systemHealth: 'healthy' | 'degraded' | 'critical';



  };

  usage: {
    evaluationsLast24h: number;
    evaluationsLast7d: number;
    topEvaluatedToggles: Array<{
      id: string;
      key: string;
      name: string;
      evaluations: number;
>;
    avgResponseTime: number;
    cacheHitRate: number;
  };

  claudeImpact: {
    none: number;
    promptCost: number;
    modelVersion: number;
    outputQuality: number;
    hallucinationRisk: number;
    totalImpactingToggles: number;
  };

  health: {
    healthyCount: number;
    degradedCount: number;
    errorCount: number;
    disabledCount: number;
    recentIssues: ToggleIssue[];
    criticalIssues: number;
  };

  security: {
    highRiskToggles: number;
    activeOverrides: number;
    approvalsRequired: number;
    emergencyKillSwitches: number;
    complianceViolations: number;
  };

  trends: {
    toggleCreationTrend: Array<{ date: string; count: number }>;
    evaluationTrend: Array<{ date: string; count: number }>;
    errorRateTrend: Array<{ date: string; rate: number }>;
    healthScoreTrend: Array<{ date: string; score: number }>;
  };


// Real-time dashboard updates



export interface Epic17DashboardUpdate {
  timestamp: Date;
  updateType: 'toggle_created' | 'toggle_updated' | 'toggle_evaluated' | 'health_changed' | 'alert_triggered';
  toggleId: string;
  data: {
    summary?: Partial<Epic17DashboardSummary>;
    toggle?: Partial<Epic17FeatureToggle>;
    alert?: ToggleAlert;



  };


// Alert system for dashboard notifications



export interface ToggleAlert {
  id: string;
  toggleId: string;
  type: 'performance' | 'health' | 'security' | 'rollout' | 'dependency';
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  details?: Record<string, any>;
  triggeredAt: Date;
  resolvedAt?: Date;
  autoResolve: boolean;
  actions?: AlertAction[];







export interface AlertAction {
  type: 'disable_toggle' | 'rollback' | 'notify_owner' | 'create_ticket';
  label: string;
  url?: string;
  confirm?: boolean;





// ====================================
// Epic 17 Zod Validation Schemas
// ====================================

// Toggle issue schema
export const ToggleIssueSchema = z.object({
  id: z.string().uuid(),
  severity: z.enum(['info', 'warning', 'error', 'critical']),
  category: z.enum(['performance', 'dependency', 'evaluation', 'config', 'security']),
  message: z.string().min(1).max(500),
  details: z.string().optional(),
  affectedUsers: z.number().int().min(0).optional(),
  detectedAt: z.date(),
  resolvedAt: z.date().optional(),
  autoResolve: z.boolean()
});

// Rollback condition schema
export const RollbackConditionSchema = z.object({
  metric: z.enum(['error_rate', 'latency', 'user_complaints', 'dependency_failure']),
  threshold: z.number().min(0),
  timeWindow: z.number().int().min(1).max(1440), // 1 minute to 24 hours
  enabled: z.boolean()
});

// Epic 17 Enhanced Toggle Schema
export const Epic17FeatureToggleSchema = z.object({
  // Base toggle fields (extending existing schema)
  id: z.string().uuid(),
  key: z.string().regex(/^[a-z0-9_.-]+$/).min(1).max(100),
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  type: z.nativeEnum(ToggleType),
  value: z.record(z.any()),
  orgId: z.string().uuid().optional(),
  claudeCompat: z.array(z.string()),
  claudeImpact: z.nativeEnum(ClaudeImpact),
  enabled: z.boolean(),
  archived: z.boolean(),
  createdBy: z.string().uuid().optional(),
  updatedBy: z.string().uuid().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  version: z.number().int().min(1),

  // Epic 17 Analytics
  analytics: z.object({
    evaluationCount24h: z.number().int().min(0),
    evaluationCount7d: z.number().int().min(0),
    evaluationCount30d: z.number().int().min(0),
    successRate: z.number().min(0).max(100),
    errorRate: z.number().min(0).max(100),
    avgResponseTime: z.number().min(0),
    lastEvaluatedAt: z.date().optional(),
    popularityScore: z.number().min(0).max(100)
  }),

  // Epic 17 Performance
  performance: z.object({
    cacheHitRate: z.number().min(0).max(100),
    avgCacheTime: z.number().min(0),
    slowQueryCount: z.number().int().min(0),
    evaluationLatencyP50: z.number().min(0),
    evaluationLatencyP95: z.number().min(0),
    evaluationLatencyP99: z.number().min(0)
  }),

  // Epic 17 Health
  health: z.object({
    status: z.enum(['healthy', 'degraded', 'error', 'disabled']),
    healthScore: z.number().min(0).max(100),
    lastHealthCheck: z.date(),
    issues: z.array(ToggleIssueSchema),
    dependencyStatus: z.enum(['ok', 'warning', 'blocked'])
  }),

  // Epic 17 Dashboard
  dashboard: z.object({
    category: z.string().min(1).max(50),
    tags: z.array(z.string().min(1).max(30)).max(10),
    owner: z.string().min(1).max(100),
    reviewedBy: z.string().optional(),
    reviewedAt: z.date().optional(),
    approvalRequired: z.boolean(),
    lastModifiedBySystem: z.boolean()
  }),

  // Epic 17 Security
  security: z.object({
    riskLevel: z.enum(['low', 'medium', 'high', 'critical']),
    requiresApproval: z.boolean(),
    hasOverrides: z.boolean(),
    lastOverrideAt: z.date().optional(),
    emergencyKillSwitch: z.boolean(),
    complianceFlags: z.array(z.string()).max(10)
  }),

  // Epic 17 Rollout
  rollout: z.object({
    strategy: z.enum(['immediate', 'gradual', 'canary', 'blue_green']),
    currentStage: z.string().min(1).max(50),
    targetPercentage: z.number().min(0).max(100),
    currentPercentage: z.number().min(0).max(100),
    rolloutSpeed: z.enum(['slow', 'medium', 'fast']),
    rollbackConditions: z.array(RollbackConditionSchema),
    scheduledAt: z.date().optional()
  }).optional()
});

// Epic 17 Toggle Filter Schema
export const Epic17ToggleFilterSchema = z.object({
  search: z.string().max(100).optional(),
  enabled: z.boolean().optional(),
  type: z.union([z.nativeEnum(ToggleType), z.array(z.nativeEnum(ToggleType))]).optional(),
  claudeImpact: z.union([z.nativeEnum(ClaudeImpact), z.array(z.nativeEnum(ClaudeImpact))]).optional(),
  
  healthStatus: z.array(z.enum(['healthy', 'degraded', 'error', 'disabled'])).optional(),
  riskLevel: z.array(z.enum(['low', 'medium', 'high', 'critical'])).optional(),
  category: z.array(z.string().min(1).max(50)).optional(),
  tags: z.array(z.string().min(1).max(30)).optional(),
  owner: z.string().max(100).optional(),
  hasOverrides: z.boolean().optional(),
  requiresApproval: z.boolean().optional(),
  
  createdAfter: z.date().optional(),
  createdBefore: z.date().optional(),
  lastModifiedAfter: z.date().optional(),
  lastModifiedBefore: z.date().optional(),
  evaluatedAfter: z.date().optional(),
  
  minEvaluationCount: z.number().int().min(0).optional(),
  maxEvaluationCount: z.number().int().min(0).optional(),
  minSuccessRate: z.number().min(0).max(100).optional(),
  maxErrorRate: z.number().min(0).max(100).optional(),
  minHealthScore: z.number().min(0).max(100).optional(),
  maxResponseTime: z.number().min(0).optional(),
  
  rolloutStrategy: z.array(z.enum(['immediate', 'gradual', 'canary', 'blue_green'])).optional(),
  rolloutStage: z.array(z.string()).optional()
}).strict();

// Epic 17 Toggle Sort Schema
export const Epic17ToggleSortSchema = z.object({
  field: z.enum([
    'name', 'key', 'created_at', 'updated_at', 'last_evaluated',
    'evaluation_count', 'success_rate', 'error_rate', 'health_score',
    'popularity_score', 'response_time'
  ]),
  direction: z.enum(['asc', 'desc']),
  secondary: z.object({
    field: z.enum([
      'name', 'key', 'created_at', 'updated_at', 'last_evaluated',
      'evaluation_count', 'success_rate', 'error_rate', 'health_score',
      'popularity_score', 'response_time'
    ]),
    direction: z.enum(['asc', 'desc'])
  }).optional()
}).strict();

// Epic 17 Toggle Query Schema
export const Epic17ToggleQuerySchema = z.object({
  filters: Epic17ToggleFilterSchema.optional(),
  sort: Epic17ToggleSortSchema.optional(),
  pagination: z.object({
    offset: z.number().int().min(0),
    limit: z.number().int().min(1).max(1000),
    cursor: z.string().optional()
  }),
  includeAnalytics: z.boolean().optional(),
  includeHealth: z.boolean().optional(),
  includeDependencies: z.boolean().optional()
}).strict();

// Toggle Alert Schema
export const ToggleAlertSchema = z.object({
  id: z.string().uuid(),
  toggleId: z.string().uuid(),
  type: z.enum(['performance', 'health', 'security', 'rollout', 'dependency']),
  severity: z.enum(['info', 'warning', 'error', 'critical']),
  title: z.string().min(1).max(100),
  message: z.string().min(1).max(500),
  details: z.record(z.any()).optional(),
  triggeredAt: z.date(),
  resolvedAt: z.date().optional(),
  autoResolve: z.boolean(),
  actions: z.array(z.object({
    type: z.enum(['disable_toggle', 'rollback', 'notify_owner', 'create_ticket']),
    label: z.string().min(1).max(50),
    url: z.string().url().optional(),
    confirm: z.boolean().optional()
  })).optional()
});

// ====================================
// Epic 17 Dashboard API Request/Response Models
// ====================================

// Dashboard summary request
export const DashboardSummaryRequestSchema = z.object({
  timeRange: z.enum(['24h', '7d', '30d', '90d']).default('24h'),
  includeDetails: z.boolean().default(false),
  orgId: z.string().uuid().optional()
}).strict();

// Dashboard update subscription request
export const DashboardSubscriptionRequestSchema = z.object({
  toggleIds: z.array(z.string().uuid()).max(100).optional(),
  alertTypes: z.array(z.enum(['performance', 'health', 'security', 'rollout', 'dependency'])).optional(),
  severityFilter: z.array(z.enum(['info', 'warning', 'error', 'critical'])).optional(),
  realTimeUpdates: z.boolean().default(true)
}).strict();

// Batch toggle operation request
export const BatchToggleOperationSchema = z.object({
  operation: z.enum(['enable', 'disable', 'archive', 'update_category', 'update_tags']),
  toggleIds: z.array(z.string().uuid()).min(1).max(100),
  parameters: z.record(z.any()).optional(),
  reason: z.string().min(1).max(200),
  bypassApproval: z.boolean().default(false)
}).strict();

// ====================================
// Type exports for external use
// ====================================

// Request types
export type Epic17ToggleFilterInput = z.input<typeof Epic17ToggleFilterSchema>;
export type Epic17ToggleSortInput = z.input<typeof Epic17ToggleSortSchema>;
export type Epic17ToggleQueryInput = z.input<typeof Epic17ToggleQuerySchema>;
export type ToggleAlertInput = z.input<typeof ToggleAlertSchema>;
export type DashboardSummaryRequestInput = z.input<typeof DashboardSummaryRequestSchema>;
export type DashboardSubscriptionRequestInput = z.input<typeof DashboardSubscriptionRequestSchema>;
export type BatchToggleOperationInput = z.input<typeof BatchToggleOperationSchema>;

// Output types (validated)
export type Epic17ToggleFilterOutput = z.output<typeof Epic17ToggleFilterSchema>;
export type Epic17ToggleSortOutput = z.output<typeof Epic17ToggleSortSchema>;
export type Epic17ToggleQueryOutput = z.output<typeof Epic17ToggleQuerySchema>;
export type ToggleAlertOutput = z.output<typeof ToggleAlertSchema>;
export type DashboardSummaryRequestOutput = z.output<typeof DashboardSummaryRequestSchema>;
export type DashboardSubscriptionRequestOutput = z.output<typeof DashboardSubscriptionRequestSchema>;
export type BatchToggleOperationOutput = z.output<typeof BatchToggleOperationSchema>;

// Utility type for database operations
export type Epic17ToggleCreateData = Omit<Epic17FeatureToggle, 'id' | 'createdAt' | 'updatedAt' | 'version'>;



export type Epic17ToggleUpdateData = Partial<Omit<Epic17FeatureToggle, 'id' | 'key' | 'createdAt' | 'createdBy'>> & {
  updatedBy: string;
  reason?: string;
};

export default {
  // Schemas
  Epic17FeatureToggleSchema,
  Epic17ToggleFilterSchema,
  Epic17ToggleSortSchema,
  Epic17ToggleQuerySchema,
  ToggleAlertSchema,
  DashboardSummaryRequestSchema,
  DashboardSubscriptionRequestSchema,
  BatchToggleOperationSchema,
  
  // Individual component schemas
  ToggleIssueSchema,
  RollbackConditionSchema
};