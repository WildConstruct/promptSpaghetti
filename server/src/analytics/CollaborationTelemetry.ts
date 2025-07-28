/**
 * Collaboration Telemetry Events for Epic 23
 * 
 * Comprehensive telemetry event definitions for real-time collaboration
 * activities, workspace management, and team productivity analytics.
 * 
 * Integrates with existing AnalyticsCollector while providing specialized
 * collaboration-specific event tracking and metrics.
 */

import { z } from 'zod';

// Collaboration-specific event types extending existing analytics
export enum CollaborationEventType {
  // Real-time Session Events
  COLLABORATIVE_SESSION_START = 'collaborative_session_start',
  COLLABORATIVE_SESSION_END = 'collaborative_session_end',
  COLLABORATIVE_SESSION_HEARTBEAT = 'collaborative_session_heartbeat',
  USER_PRESENCE_UPDATE = 'user_presence_update',
  CONCURRENT_EDITORS_PEAK = 'concurrent_editors_peak',
  
  // Real-time Editing Events  
  SIMULTANEOUS_EDIT_DETECTED = 'simultaneous_edit_detected',
  CONFLICT_RESOLUTION_TRIGGERED = 'conflict_resolution_triggered',
  CONFLICT_RESOLUTION_COMPLETED = 'conflict_resolution_completed',
  MERGE_OPERATION_PERFORMED = 'merge_operation_performed',
  OPERATIONAL_TRANSFORM_APPLIED = 'operational_transform_applied',
  SYNC_STATE_MISMATCH = 'sync_state_mismatch',
  
  // Communication & Collaboration
  COMMENT_CREATED = 'comment_created',
  COMMENT_REPLIED = 'comment_replied',
  COMMENT_THREAD_RESOLVED = 'comment_thread_resolved',
  COMMENT_THREAD_REOPENED = 'comment_thread_reopened',
  MENTION_NOTIFICATION_SENT = 'mention_notification_sent',
  MENTION_NOTIFICATION_READ = 'mention_notification_read',
  
  // Review & Approval Workflows
  REVIEW_REQUEST_CREATED = 'review_request_created',
  REVIEW_REQUEST_ASSIGNED = 'review_request_assigned',
  REVIEW_SUBMITTED = 'review_submitted',
  REVIEW_APPROVED = 'review_approved',
  REVIEW_REJECTED = 'review_rejected',
  APPROVAL_WORKFLOW_TRIGGERED = 'approval_workflow_triggered',
  APPROVAL_WORKFLOW_COMPLETED = 'approval_workflow_completed',
  
  // Workspace & Team Management
  WORKSPACE_CREATED = 'workspace_created',
  WORKSPACE_MEMBER_INVITED = 'workspace_member_invited',
  WORKSPACE_MEMBER_JOINED = 'workspace_member_joined',
  WORKSPACE_MEMBER_REMOVED = 'workspace_member_removed',
  WORKSPACE_ROLE_CHANGED = 'workspace_role_changed',
  PROJECT_CREATED = 'project_created',
  PROJECT_SHARED = 'project_shared',
  PROJECT_ACCESS_GRANTED = 'project_access_granted',
  PROJECT_ACCESS_REVOKED = 'project_access_revoked',
  
  // Activity & Engagement
  ACTIVITY_FEED_VIEWED = 'activity_feed_viewed',
  NOTIFICATION_CLICKED = 'notification_clicked',
  COLLABORATIVE_FEATURE_DISCOVERED = 'collaborative_feature_discovered',
  ONBOARDING_STEP_COMPLETED = 'onboarding_step_completed',
  HELP_DOCUMENTATION_ACCESSED = 'help_documentation_accessed',
  
  // Performance & Quality Metrics
  COLLABORATION_LATENCY_MEASURED = 'collaboration_latency_measured',
  WEBSOCKET_CONNECTION_QUALITY = 'websocket_connection_quality',
  SYNC_PERFORMANCE_MEASURED = 'sync_performance_measured',
  USER_EXPERIENCE_RATING = 'user_experience_rating',
  PERFORMANCE_ISSUE_DETECTED = 'performance_issue_detected'
}

// Common collaboration context schema
export const CollaborationContextSchema = z.object({
  workspaceId: z.string(),
  projectId: z.string().optional(),
  resourceId: z.string().optional(),
  sessionId: z.string(),
  userId: z.string(),
  userRole: z.enum(['owner', 'admin', 'collaborator', 'viewer']),
  timestamp: z.date(),
  userAgent: z.string().optional(),
  clientVersion: z.string().optional()
});

export type CollaborationContext = z.infer<typeof CollaborationContextSchema>;

// Session and Presence Events
export const CollaborativeSessionStartEventSchema = z.object({
  eventType: z.literal(CollaborationEventType.COLLABORATIVE_SESSION_START),
  context: CollaborationContextSchema,
  data: z.object({
    sessionDuration: z.number().optional(), // Expected session duration
    collaboratorCount: z.number(),          // Number of existing collaborators
    resourceType: z.enum(['graph', 'template', 'document']),
    accessMethod: z.enum(['direct', 'invitation', 'shared_link']),
    deviceType: z.enum(['desktop', 'tablet', 'mobile']),
    connectionQuality: z.enum(['excellent', 'good', 'poor', 'unknown']),
    previousSessionExists: z.boolean()
  }
});

export const UserPresenceUpdateEventSchema = z.object({
  eventType: z.literal(CollaborationEventType.USER_PRESENCE_UPDATE),
  context: CollaborationContextSchema,
  data: z.object({
    presenceStatus: z.enum(['active', 'idle', 'away', 'offline']),
    cursorPosition: z.object({
      x: z.number(),
      y: z.number(),
      viewportId: z.string().optional()
    }).optional(),
    selectedElements: z.array(z.string()).optional(), // IDs of selected nodes/edges
    lastActivity: z.date(),
    presenceDuration: z.number(), // Time in this presence state
    activityType: z.enum(['editing', 'viewing', 'commenting', 'navigating']).optional()
  }
});

// Conflict Resolution Events
export const ConflictResolutionEventSchema = z.object({
  eventType: z.union([
    z.literal(CollaborationEventType.CONFLICT_RESOLUTION_TRIGGERED),
    z.literal(CollaborationEventType.CONFLICT_RESOLUTION_COMPLETED)
  ]),
  context: CollaborationContextSchema,
  data: z.object({
    conflictId: z.string(),
    conflictType: z.enum(['node_edit', 'edge_edit', 'property_change', 'deletion', 'creation']),
    involvedUsers: z.array(z.string()),
    resolutionStrategy: z.enum(['last_writer_wins', 'operational_transform', 'manual_merge', 'auto_merge']),
    resolutionTimeMs: z.number().optional(), // Only for completed events
    conflictComplexity: z.enum(['simple', 'moderate', 'complex']),
    automatedResolution: z.boolean(),
    userInterventionRequired: z.boolean(),
    dataIntegrityMaintained: z.boolean()
  }
});

// Communication Events
export const CommentEventSchema = z.object({
  eventType: z.union([
    z.literal(CollaborationEventType.COMMENT_CREATED),
    z.literal(CollaborationEventType.COMMENT_REPLIED),
    z.literal(CollaborationEventType.COMMENT_THREAD_RESOLVED)
  ]),
  context: CollaborationContextSchema,
  data: z.object({
    commentId: z.string(),
    threadId: z.string(),
    parentCommentId: z.string().optional(),
    targetElementId: z.string().optional(), // Node/edge being commented on
    commentLength: z.number(),
    mentionedUsers: z.array(z.string()).optional(),
    attachmentCount: z.number().default(0),
    isReply: z.boolean(),
    threadDepth: z.number(), // Depth of conversation
    resolutionMethod: z.enum(['auto', 'manual', 'timeout']).optional()
  }
});

// Review and Approval Events
export const ReviewEventSchema = z.object({
  eventType: z.union([
    z.literal(CollaborationEventType.REVIEW_REQUEST_CREATED),
    z.literal(CollaborationEventType.REVIEW_SUBMITTED),
    z.literal(CollaborationEventType.REVIEW_APPROVED),
    z.literal(CollaborationEventType.REVIEW_REJECTED)
  ]),
  context: CollaborationContextSchema,
  data: z.object({
    reviewId: z.string(),
    revieweeId: z.string(),
    reviewerIds: z.array(z.string()),
    reviewType: z.enum(['peer_review', 'approval_workflow', 'quality_check']),
    changeSummary: z.object({
      nodesAdded: z.number(),
      nodesModified: z.number(),
      nodesDeleted: z.number(),
      edgesAdded: z.number(),
      edgesDeleted: z.number()
    }),
    reviewCriteria: z.array(z.string()),
    urgencyLevel: z.enum(['low', 'medium', 'high', 'critical']),
    estimatedReviewTime: z.number().optional(),
    actualReviewTime: z.number().optional(),
    feedbackProvided: z.boolean().optional(),
    revisionsRequired: z.boolean().optional()
  }
});

// Workspace Management Events
export const WorkspaceEventSchema = z.object({
  eventType: z.union([
    z.literal(CollaborationEventType.WORKSPACE_CREATED),
    z.literal(CollaborationEventType.WORKSPACE_MEMBER_INVITED),
    z.literal(CollaborationEventType.PROJECT_SHARED)
  ]),
  context: CollaborationContextSchema,
  data: z.object({
    targetUserId: z.string().optional(), // For invitations
    inviteMethod: z.enum(['email', 'link', 'direct']).optional(),
    permissionLevel: z.enum(['view', 'comment', 'edit', 'admin']).optional(),
    workspaceSize: z.number(), // Number of members
    projectCount: z.number(),   // Number of projects in workspace
    resourceCount: z.number(),  // Total resources
    workspaceTemplate: z.string().optional(), // If created from template
    onboardingCompleted: z.boolean().optional(),
    billingTier: z.enum(['free', 'pro', 'enterprise']).optional()
  }
});

// Performance and Quality Metrics
export const CollaborationMetricsEventSchema = z.object({
  eventType: z.union([
    z.literal(CollaborationEventType.COLLABORATION_LATENCY_MEASURED),
    z.literal(CollaborationEventType.WEBSOCKET_CONNECTION_QUALITY),
    z.literal(CollaborationEventType.SYNC_PERFORMANCE_MEASURED)
  ]),
  context: CollaborationContextSchema,
  data: z.object({
    metricType: z.enum(['latency', 'throughput', 'reliability', 'quality']),
    value: z.number(),
    unit: z.enum(['ms', 'mbps', 'percentage', 'count']),
    threshold: z.object({
      warning: z.number(),
      critical: z.number()
    }),
    performanceTier: z.enum(['excellent', 'good', 'acceptable', 'poor']),
    networkConditions: z.object({
      connectionType: z.enum(['wifi', 'cellular', 'ethernet', 'unknown']),
      bandwidth: z.number().optional(),
      latency: z.number().optional(),
      packetLoss: z.number().optional()
    }).optional(),
    geographicRegion: z.string().optional(),
    serverRegion: z.string().optional()
  }
});

// Activity and Engagement Metrics
export const ActivityEngagementEventSchema = z.object({
  eventType: z.union([
    z.literal(CollaborationEventType.ACTIVITY_FEED_VIEWED),
    z.literal(CollaborationEventType.COLLABORATIVE_FEATURE_DISCOVERED),
    z.literal(CollaborationEventType.USER_EXPERIENCE_RATING)
  ]),
  context: CollaborationContextSchema,
  data: z.object({
    featureName: z.string().optional(),
    discoveryMethod: z.enum(['tooltip', 'tutorial', 'exploration', 'documentation']).optional(),
    activityFeedItems: z.number().optional(),
    timeSpentViewing: z.number().optional(), // Seconds
    interactionType: z.enum(['click', 'hover', 'scroll', 'focus']).optional(),
    userSatisfactionRating: z.number().min(1).max(5).optional(),
    feedbackCategory: z.enum(['performance', 'usability', 'features', 'reliability']).optional(),
    improvementSuggestion: z.string().optional()
  }
});

// Union type for all collaboration events
export type CollaborationTelemetryEvent = 
  | z.infer<typeof CollaborativeSessionStartEventSchema>
  | z.infer<typeof UserPresenceUpdateEventSchema>
  | z.infer<typeof ConflictResolutionEventSchema>
  | z.infer<typeof CommentEventSchema>
  | z.infer<typeof ReviewEventSchema>
  | z.infer<typeof WorkspaceEventSchema>
  | z.infer<typeof CollaborationMetricsEventSchema>
  | z.infer<typeof ActivityEngagementEventSchema>;

// Epic 23 Success Metrics Configuration
export const EPIC_23_SUCCESS_CRITERIA = {
  REAL_TIME_LATENCY_TARGET: 150, // ms
  CONFLICT_RESOLUTION_SUCCESS_RATE: 0.99, // 99%
  WORKSPACE_ADOPTION_RATE: 0.8, // 80% of teams
  REVIEW_WORKFLOW_COMPLETION_RATE: 0.95, // 95%
  USER_SATISFACTION_TARGET: 4.0, // out of 5
  CONCURRENT_COLLABORATOR_TARGET: 50, // users per workspace
  SESSION_RELIABILITY_TARGET: 0.999 // 99.9% uptime
} as const;

// Telemetry event validation schemas
export const CollaborationTelemetrySchemas = {
  [CollaborationEventType.COLLABORATIVE_SESSION_START]: CollaborativeSessionStartEventSchema,
  [CollaborationEventType.USER_PRESENCE_UPDATE]: UserPresenceUpdateEventSchema,
  [CollaborationEventType.CONFLICT_RESOLUTION_TRIGGERED]: ConflictResolutionEventSchema,
  [CollaborationEventType.CONFLICT_RESOLUTION_COMPLETED]: ConflictResolutionEventSchema,
  [CollaborationEventType.COMMENT_CREATED]: CommentEventSchema,
  [CollaborationEventType.COMMENT_REPLIED]: CommentEventSchema,
  [CollaborationEventType.COMMENT_THREAD_RESOLVED]: CommentEventSchema,
  [CollaborationEventType.REVIEW_REQUEST_CREATED]: ReviewEventSchema,
  [CollaborationEventType.REVIEW_SUBMITTED]: ReviewEventSchema,
  [CollaborationEventType.REVIEW_APPROVED]: ReviewEventSchema,
  [CollaborationEventType.REVIEW_REJECTED]: ReviewEventSchema,
  [CollaborationEventType.WORKSPACE_CREATED]: WorkspaceEventSchema,
  [CollaborationEventType.WORKSPACE_MEMBER_INVITED]: WorkspaceEventSchema,
  [CollaborationEventType.PROJECT_SHARED]: WorkspaceEventSchema,
  [CollaborationEventType.COLLABORATION_LATENCY_MEASURED]: CollaborationMetricsEventSchema,
  [CollaborationEventType.WEBSOCKET_CONNECTION_QUALITY]: CollaborationMetricsEventSchema,
  [CollaborationEventType.SYNC_PERFORMANCE_MEASURED]: CollaborationMetricsEventSchema,
  [CollaborationEventType.ACTIVITY_FEED_VIEWED]: ActivityEngagementEventSchema,
  [CollaborationEventType.COLLABORATIVE_FEATURE_DISCOVERED]: ActivityEngagementEventSchema,
  [CollaborationEventType.USER_EXPERIENCE_RATING]: ActivityEngagementEventSchema
};

// Export types for use across the application
export type {
  CollaborationContext,
  CollaborationTelemetryEvent
};

export {
  CollaborationTelemetrySchemas,
  EPIC_23_SUCCESS_CRITERIA
};