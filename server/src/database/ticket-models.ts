/**
 * Ticket Management Models
 * Extends the existing workflow system for ticket tracking
 * and GitHub automation
 */

import { z } from 'zod';

// Ticket status enum
export const TicketStatus = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  IN_REVIEW: 'in_review',
  APPROVED: 'approved',
  MERGED: 'merged',
  CLOSED: 'closed',
  BLOCKED: 'blocked',
} as const;

export type TicketStatusType = (typeof TicketStatus)[keyof typeof TicketStatus];

// Ticket priority enum
export const TicketPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export type TicketPriorityType = (typeof TicketPriority)[keyof typeof TicketPriority];

// Ticket schema
export const TicketSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  status: z.enum([
    TicketStatus.OPEN,
    TicketStatus.IN_PROGRESS,
    TicketStatus.IN_REVIEW,
    TicketStatus.APPROVED,
    TicketStatus.MERGED,
    TicketStatus.CLOSED,
    TicketStatus.BLOCKED,
  ]),
  priority: z.enum([TicketPriority.LOW, TicketPriority.MEDIUM, TicketPriority.HIGH, TicketPriority.CRITICAL]),
  epic_id: z.string().optional(),
  story_id: z.string().optional(),
  assigned_to: z.string().optional(),
  created_by: z.string(),
  pr_number: z.number().optional(),
  pr_url: z.string().url().optional(),
  branch_name: z.string().optional(),
  commit_count: z.number().default(0),
  last_commit_sha: z.string().optional(),
  files_changed: z.array(z.string()).default([]),
  labels: z.array(z.string()).default([]),
  created_at: z.string(),
  updated_at: z.string(),
  approved_at: z.string().optional(),
  approved_by: z.string().optional(),
  merged_at: z.string().optional(),
  closed_at: z.string().optional(),
});

export type Ticket = z.infer<typeof TicketSchema>;

// Ticket state transition rules
export const TICKET_TRANSITIONS: Record<TicketStatusType, TicketStatusType[]> = {
  [TicketStatus.OPEN]: [TicketStatus.IN_PROGRESS, TicketStatus.BLOCKED, TicketStatus.CLOSED],
  [TicketStatus.IN_PROGRESS]: [TicketStatus.IN_REVIEW, TicketStatus.BLOCKED, TicketStatus.CLOSED],
  [TicketStatus.IN_REVIEW]: [TicketStatus.APPROVED, TicketStatus.IN_PROGRESS, TicketStatus.BLOCKED],
  [TicketStatus.APPROVED]: [TicketStatus.MERGED, TicketStatus.IN_REVIEW],
  [TicketStatus.MERGED]: [TicketStatus.CLOSED],
  [TicketStatus.CLOSED]: [TicketStatus.OPEN], // Can reopen
  [TicketStatus.BLOCKED]: [TicketStatus.IN_PROGRESS, TicketStatus.CLOSED],
};

// GitHub automation configuration
export const GitHubAutomationConfigSchema = z.object({
  id: z.string(),
  enabled: z.boolean().default(true),
  auto_create_pr: z.boolean().default(true),
  auto_push_interval: z.number().default(10), // Push every N commits
  base_branch: z.string().default('main'),
  pr_template: z.string().optional(),
  pr_title_template: z.string().default('[{{ticket.id}}] {{ticket.title}}'),
  pr_body_template: z.string().optional(),
  commit_message_template: z.string().default('feat({{ticket.id}}): {{description}}'),
  labels_to_add: z.array(z.string()).default(['automated-pr']),
  reviewers: z.array(z.string()).default([]),
  draft_pr: z.boolean().default(false),
  created_at: z.string(),
  updated_at: z.string(),
});

export type GitHubAutomationConfig = z.infer<typeof GitHubAutomationConfigSchema>;

// Commit tracking for auto-push
export const CommitTrackingSchema = z.object({
  id: z.string(),
  ticket_id: z.string(),
  commit_sha: z.string(),
  commit_message: z.string(),
  files_changed: z.array(z.string()),
  lines_added: z.number(),
  lines_deleted: z.number(),
  author: z.string(),
  committed_at: z.string(),
  pushed: z.boolean().default(false),
  pushed_at: z.string().optional(),
  pr_number: z.number().optional(),
});

export type CommitTracking = z.infer<typeof CommitTrackingSchema>;

// Webhook event for ticket status changes
export const TicketWebhookEventSchema = z.object({
  event_type: z.literal('ticket_status_changed'),
  ticket_id: z.string(),
  old_status: z.string(),
  new_status: z.string(),
  changed_by: z.string(),
  timestamp: z.string(),
  metadata: z.record(z.any()).optional(),
});

export type TicketWebhookEvent = z.infer<typeof TicketWebhookEventSchema>;
