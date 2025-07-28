/**
 * Epic 16 Reaction Button Component
 * Task: E16-1753114247007-BB2261 - Add reaction system
 *
 * Emoji reaction system for marketplace content including templates, comments,
 * and reviews. Provides quick emotional feedback with real-time updates.
 */
import React from 'react';

export interface ReactionType {
    id: string;
    emoji: string;
    label: string;
    category: 'positive' | 'neutral' | 'negative';
    weight: number;
    description: string;

export interface ReactionData {
    reactionId: string;
    contentId: string;
    contentType: 'template' | 'comment' | 'review' | 'project' | 'user';
    userId: string;
    reactionType: string;
    timestamp: Date;
    metadata?: Record<string, unknown>;

export interface ReactionSummary {
    contentId: string;
    totalReactions: number;
    reactionCounts: Record<string, number>;
    userReaction?: string;
    topReactions: Array<{,
        type: string;
        emoji: string;
        count: number;
        percentage: number;
    }>;
    sentimentScore: number;
    engagementLevel: 'low' | 'medium' | 'high' | 'viral';

export interface ReactionButtonProps {
    contentId: string;
    contentType: 'template' | 'comment' | 'review' | 'project' | 'user';
    userId?: string;
    onReaction?: (reaction: ReactionData) => Promise<void>;
    onSummaryUpdate?: (summary: ReactionSummary) => void;
    variant?: 'compact' | 'full' | 'minimal' | 'picker';
    size?: 'small' | 'medium' | 'large';
    showCounts?: boolean;
    showLabels?: boolean;
    disabled?: boolean;
    maxReactions?: number;
    className?: string;

export declare const ReactionButton: React.FC<ReactionButtonProps>;
export default ReactionButton;
//# sourceMappingURL=ReactionButton.d.ts.map