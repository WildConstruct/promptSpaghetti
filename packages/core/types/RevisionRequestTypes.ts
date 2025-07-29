/**
 * Revision Request Types - E17-1753114397311-674990
 * 
 * Comprehensive type definitions for revision request system
 * for Epic 17 - Backstage Admin Controls.
 * 
 * Following patterns from AppealProcessService and DocumentReviewInterface.
 */
import { TimeRange } from '../marketplace/analytics.types';

// Core revision request status enum
export enum RevisionRequestStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  ADDITIONAL_INFO_REQUESTED = 'additional_info_requested',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  IMPLEMENTED = 'implemented'
  // Priority levels for revision requests
  export enum RevisionRequestPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
  CRITICAL = 'critical'
  // Types of content that can have revision requests
  export enum RevisionContentType {
  TEMPLATE = 'template',
  GRAPH = 'graph',
  WORKFLOW = 'workflow',
  POLICY = 'policy',
  DOCUMENTATION = 'documentation',
  CONFIGURATION = 'configuration',
  USER_INTERFACE = 'user_interface'
  // Types of revision requests
  export enum RevisionRequestType {
  CONTENT_UPDATE = 'content_update',
  FEATURE_ENHANCEMENT = 'feature_enhancement',
  BUG_FIX = 'bug_fix',
  PERFORMANCE_IMPROVEMENT = 'performance_improvement',
  ACCESSIBILITY_IMPROVEMENT = 'accessibility_improvement',
  SECURITY_UPDATE = 'security_update',
  COMPLIANCE_UPDATE = 'compliance_update'
  // Evidence/attachment types
  export enum RevisionEvidenceType {
  SCREENSHOT = 'screenshot',
  DOCUMENT = 'document',
  VIDEO = 'video',
  CODE_SAMPLE = 'code_sample',
  MOCKUP = 'mockup',
  REQUIREMENTS_DOC = 'requirements_doc',
  SUPPORTING_DATA = 'supporting_data'
  // Timeline event types
  export enum RevisionTimelineEventType {
  REQUEST_CREATED = 'request_created',
  STATUS_CHANGED = 'status_changed',
  ASSIGNED_TO_REVIEWER = 'assigned_to_reviewer',
  REVIEWER_CHANGED = 'reviewer_changed',
  COMMENT_ADDED = 'comment_added',
  EVIDENCE_UPLOADED = 'evidence_uploaded',
  EVIDENCE_REMOVED = 'evidence_removed',
  APPROVAL_GIVEN = 'approval_given',
  REJECTION_GIVEN = 'rejection_given',
  ADDITIONAL_INFO_REQUESTED = 'additional_info_requested',
  IMPLEMENTATION_STARTED = 'implementation_started',
  IMPLEMENTATION_COMPLETED = 'implementation_completed',
  REQUEST_CANCELLED = 'request_cancelled'
  // Core revision request interface
  export interface RevisionRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  // Content being revised
  contentType: RevisionContentType;
  contentId: string;
  contentTitle: string;
  contentVersion?: string;
  // Request details
  title: string;
  description: string;
  requestedChanges: string;
  businessJustification: string;
  type: RevisionRequestType;
  priority: RevisionRequestPriority;
  // Workflow and assignment
  status: RevisionRequestStatus;
  reviewerId?: string;
  reviewerName?: string;
  assignedAt?: Date;
  // Timing
  dueDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  // Review details
  reviewNotes?: string;
  rejectionReason?: string;
  approvalNotes?: string;
  implementationNotes?: string;
  // Attachments and tracking
  evidence: RevisionEvidence;
  timeline: RevisionTimelineEvent;
  tags: string;
  // Metadata
  metadata: Record<string, any>;
  urgencyScore?: number;
  complexityScore?: number;
  impactScore?: number;
  // Evidence/attachment interface
}
export interface RevisionEvidence {
  id: string;
  revisionRequestId: string;
  evidenceType: RevisionEvidenceType;
  title: string;
  description?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  uploadedBy: string;
  uploadedAt: Date;
  annotations?: EvidenceAnnotation;
  metadata: Record<string, any>;
  // Annotation interface for evidence (following DocumentReviewInterface pattern)
}
export interface EvidenceAnnotation {
  id: string;
  evidenceId: string;
  annotationType: 'highlight' | 'question' | 'note' | 'suggestion' | 'issue';
  coordinates?: {
  x: number;
  y: number;
  width?: number;
  height?: number;
};
  content: string;
  createdBy: string;
  createdAt: Date;
  resolved?: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;

// Timeline event interface
}
export interface RevisionTimelineEvent {
  id: string;
  revisionRequestId: string;
  eventType: RevisionTimelineEventType;
  actorId: string;
  actorName: string;
  description: string;
  oldValue?: string;
  newValue?: string;
  timestamp: Date;
  metadata: Record<string, any>;
  // Comment interface for discussions
}
export interface RevisionComment {
  id: string;
  revisionRequestId: string;
  authorId: string;
  authorName: string;
  content: string;
  parentCommentId?: string; // For threaded discussions,
  isInternal: boolean; // Internal reviewer notes vs external communication,
  createdAt: Date;
  updatedAt?: Date;
  editedBy?: string;
  mentions: string; // User IDs mentioned in the comment,
  attachments: string; // File attachments,
  // Search and filtering interfaces
}
export interface RevisionRequestSearchQuery {
  // Basic filters
  status?: RevisionRequestStatus;
  priority?: RevisionRequestPriority;
  contentType?: RevisionContentType;
  type?: RevisionRequestType;
  // Assignment filters
  requesterId?: string;
  reviewerId?: string;
  unassigned?: boolean;
  // Date filters
  dateRange?: {
  start: Date;
  end: Date;
};
  dueDateRange?: {
  start: Date;
  end: Date;
};
  // Content filters
  contentId?: string;
  tags?: string;
  // Text search
  search?: string; // Search in title, description, requested changes
  // Complexity and urgency
  minUrgencyScore?: number;
  maxUrgencyScore?: number;
  minComplexityScore?: number;
  maxComplexityScore?: number;
  // Pagination and sorting
  page?: number;
  pageSize?: number;
  sortBy?: RevisionRequestSortField;
  sortOrder?: 'asc' | 'desc'
  }
export type RevisionRequestSortField = 
  | 'created_at'
  | 'updated_at'
  | 'due_date'
  | 'priority'
  | 'urgency_score'
  | 'complexity_score'
  | 'title'
  | 'requester_name'
  | 'status';

export interface RevisionRequestSearchResults {
  requests: RevisionRequest;
  pagination: {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};
  aggregations: RevisionRequestAggregations;
  filters: AppliedFilters;
}
export interface RevisionRequestAggregations {
  statusBreakdown: Record<RevisionRequestStatus, number>;
  priorityBreakdown: Record<RevisionRequestPriority, number>;
  typeBreakdown: Record<RevisionRequestType, number>;
  contentTypeBreakdown: Record<RevisionContentType, number>;
  assignmentStats: {
  assigned: number;
  unassigned: number;
  overdue: number;
  dueToday: number;
  dueThisWeek: number;
};
  averageCompletionTime: number; // in hours,
  topRequesters: Array<{;
  requesterId: string;
  requesterName: string;
  count: number;
}>;
  topReviewers: Array<{,
  reviewerId: string;
  reviewerName: string;
  count: number;
  averageResponseTime: number;
}>;
}
export interface AppliedFilters {
  count: number;
  filters: Array<{,
  field: string;
  operator: string;
  value: any;
  displayName: string;
}>;

// Analytics and reporting interfaces
}
export interface RevisionRequestAnalytics {
  period: AnalyticsPeriod;
  overview: RevisionRequestOverview;
  performance: RevisionRequestPerformance;
  trends: RevisionRequestTrends;
  insights: RevisionRequestInsight;
  recommendations: RevisionRequestRecommendation;
}
export interface AnalyticsPeriod {
  startDate: Date;
  endDate: Date;
  timeRange: TimeRange;
  comparisonPeriod?: AnalyticsPeriod;
}
export interface RevisionRequestOverview {
  totalRequests: number;
  completedRequests: number;
  pendingRequests: number;
  overdueRequests: number;
  averageCompletionTime: number;
  completionRate: number;
  satisfactionScore: number;
  // Growth metrics
  growthMetrics: {
  requestGrowth: number;
  completionGrowth: number;
  averageTimeImprovement: number;
};
}
export interface RevisionRequestPerformance {
  reviewerPerformance: Record<string, ReviewerPerformance>;
  contentTypePerformance: Record<RevisionContentType, ContentTypePerformance>;
  priorityPerformance: Record<RevisionRequestPriority, PriorityPerformance>;
  // SLA metrics
  slaMetrics: {
  onTimeCompletionRate: number;
  averageResponseTime: number;
  escalationRate: number;
};
}
export interface ReviewerPerformance {
  reviewerId: string;
  reviewerName: string;
  totalAssigned: number;
  totalCompleted: number;
  averageCompletionTime: number;
  onTimeRate: number;
  satisfactionRating: number;
  workloadBalance: number;
}
export interface ContentTypePerformance {
  totalRequests: number;
  averageCompletionTime: number;
  complexityScore: number;
  successRate: number;
}
export interface PriorityPerformance {
  totalRequests: number;
  averageResponseTime: number;
  slaCompliance: number;
  escalationRate: number;
}
export interface RevisionRequestTrends {
  requestVolume: Array<{,
  date: string;
  count: number;
  priority: Record<RevisionRequestPriority, number>;
}>;
  completionTrends: Array<{,
  date: string;
  completed: number;
  averageTime: number;
}>;
  contentTypeTrends: Array<{,
  contentType: RevisionContentType;
  trend: 'increasing' | 'decreasing' | 'stable';
  changePercent: number;
}>;
}
export interface RevisionRequestInsight {
  type: 'bottleneck' | 'opportunity' | 'risk' | 'trend';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  confidence: number;
  data: Record<string, any>;
  recommendedActions: string;
  relatedRequests?: string;
}
export interface RevisionRequestRecommendation {
  category: 'process_improvement' | 'resource_allocation' | 'automation' | 'training';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  expectedImpact: string;
  implementation: {
  complexity: 'low' | 'medium' | 'high';
  timeframe: string;
  requirements: string;
};
  metrics: string;

// Export request interface
}
export interface RevisionRequestExportRequest {
  format: 'csv' | 'json' | 'excel';
  query: RevisionRequestSearchQuery;
  fields?: string;
  includeEvidence?: boolean;
  includeTimeline?: boolean;
  includeComments?: boolean;
  // Configuration interface
}
export interface RevisionRequestConfig {
  // Workflow settings
  enableAutoAssignment: boolean;
  defaultReviewerAssignment: 'round_robin' | 'workload_based' | 'skill_based';
  autoEscalationDays: number;
  enableSLA: boolean;
  // SLA settings by priority
  slaHours: Record<RevisionRequestPriority, number>;
  // Approval settings
  requireApprovalFor: RevisionRequestType;
  multipleReviewersFor: RevisionRequestType;
  // Notification settings
  enableEmailNotifications: boolean;
  enableSlackNotifications: boolean;
  notificationSettings: {
  onAssignment: boolean;
  onStatusChange: boolean;
  onComment: boolean;
  onDueDate: boolean;
  onOverdue: boolean;
};
  // Evidence settings
  maxEvidenceFiles: number;
  maxFileSizeMB: number;
  allowedFileTypes: string;
  enableAnnotations: boolean;
  // Advanced features
  enableComplexityScoring: boolean;
  enableImpactScoring: boolean;
  enablePredictiveAnalytics: boolean;
  retentionDays: number;
}
export const DEFAULT_REVISION_REQUEST_CONFIG: RevisionRequestConfig = {,
  enableAutoAssignment: true,
  defaultReviewerAssignment: 'workload_based',
  autoEscalationDays: 3,
  enableSLA: true,
  slaHours: {
  [RevisionRequestPriority.LOW]: 168, // 7 days,
  [RevisionRequestPriority.MEDIUM]: 72, // 3 days,
  [RevisionRequestPriority.HIGH]: 24, // 1 day,
  [RevisionRequestPriority.URGENT]: 4, // 4 hours,
  [RevisionRequestPriority.CRITICAL]: 1 // 1 hour,
},
  requireApprovalFor: [,
    RevisionRequestType.SECURITY_UPDATE,
    RevisionRequestType.COMPLIANCE_UPDATE
  ],
  multipleReviewersFor: [,
    RevisionRequestType.SECURITY_UPDATE,
    RevisionRequestType.COMPLIANCE_UPDATE
  ],
  enableEmailNotifications: true,
  enableSlackNotifications: true,
  notificationSettings: {
  onAssignment: true,
  onStatusChange: true,
  onComment: true,
  onDueDate: true,
  onOverdue: true,
},
  maxEvidenceFiles: 10,
  maxFileSizeMB: 25,
  allowedFileTypes: [,
    'image/jpeg', 'image/png', 'image/gif',
    'application/pdf',
    'text/plain', 'text/markdown',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'video/mp4', 'video/quicktime'
  ],
  enableAnnotations: true,
  enableComplexityScoring: true,
  enableImpactScoring: true,
  enablePredictiveAnalytics: false,
  retentionDays: 2555 // ~7 years;
  };

// Utility types for forms and UI

export interface RevisionRequestFormData {
  title: string;
  description: string;
  requestedChanges: string;
  businessJustification: string;
  contentType: RevisionContentType;
  contentId: string;
  type: RevisionRequestType;
  priority: RevisionRequestPriority;
  dueDate?: Date;
  estimatedHours?: number;
  tags: string;
  evidence: File;
}
export interface RevisionRequestReviewFormData {
  decision: 'approve' | 'reject' | 'request_info';
  reviewNotes: string;
  rejectionReason?: string;
  approvalNotes?: string;
  estimatedImplementationHours?: number;
  implementationPlan?: string;
  additionalRequirements?: string;
  // Validation schemas would go here (using Zod)
  // Following the pattern from marketplace review.types.ts
}
export type RevisionRequestCreateSchema = {
  title: string;
  description: string;
  requestedChanges: string;
  businessJustification: string;
  contentType: RevisionContentType;
  contentId: string;
  type: RevisionRequestType;
  priority: RevisionRequestPriority;
  dueDate?: string;
  estimatedHours?: number;
  tags?: string;
};

export type RevisionRequestUpdateSchema = Partial<RevisionRequestCreateSchema> & {
  status?: RevisionRequestStatus;
  reviewerId?: string;
  reviewNotes?: string;
  rejectionReason?: string;
  approvalNotes?: string;
  implementationNotes?: string;
};

export type RevisionEvidenceCreateSchema = {
  evidenceType: RevisionEvidenceType;
  title: string;
  description?: string;
  file?: File;
};

export type RevisionCommentCreateSchema = {
  content: string;
  parentCommentId?: string;
  isInternal?: boolean;
  mentions?: string;
};