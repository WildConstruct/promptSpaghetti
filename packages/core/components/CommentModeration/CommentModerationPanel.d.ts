/**
 * Epic 16 Comment Moderation Panel
 * Task: E16-1753114247008-F23213 - Develop comment moderation
 *
 * Specialized moderation interface for comments that integrates with existing
 * moderation infrastructure. Provides comment-specific actions, bulk operations,
 * and real-time moderation capabilities.
 */
import React from 'react';

export interface CommentModerationConfig {
    enableBulkActions: boolean;
    enableAutoModeration: boolean;
    enableThreadModeration: boolean;
    enableSentimentFiltering: boolean;
    autoHideThreshold: number;
    requireApprovalThreshold: number;
    enableRealtimeUpdates: boolean;
    moderatorId: string;
    permissions: string[];


export interface CommentModerationFilters {
    status?: 'pending' | 'approved' | 'rejected' | 'flagged' | 'auto_hidden';
    sentiment?: 'positive' | 'neutral' | 'negative' | 'very_negative';
    toxicity?: 'low' | 'medium' | 'high' | 'critical';
    reports?: 'none' | 'few' | 'many' | 'critical';
    author?: 'all' | 'new' | 'verified' | 'banned';
    dateRange?: {
        start: Date;
        end: Date;

    };
    resourceId?: string;
    resourceType?: string;
    sortBy?: 'newest' | 'oldest' | 'most_reported' | 'lowest_quality' | 'highest_toxicity';
    keywords?: string;

export interface CommentModerationAction {
    type: 'approve' | 'reject' | 'flag' | 'hide' | 'delete' | 'ban_author' | 'require_edit' | 'escalate';
    commentIds: string[];
    reason?: string;
    duration?: number;
    notifyAuthor?: boolean;
    escalateTo?: string;
    metadata?: Record<string, unknown>;


export interface CommentModerationStats {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    flagged: number;
    autoHidden: number;
    totalReports: number;
    avgToxicity: number;
    avgQuality: number;
    lastProcessed?: Date;


interface CommentModerationPanelProps {
    config: CommentModerationConfig;
    onAction?: (action: CommentModerationAction) => Promise<void>;
    onFiltersChange?: (filters: CommentModerationFilters) => void;
    onStatsUpdate?: (stats: CommentModerationStats) => void;
    className?: string;

export declare const CommentModerationPanel: React.FC<CommentModerationPanelProps>;
export default CommentModerationPanel;
//# sourceMappingURL=CommentModerationPanel.d.ts.map