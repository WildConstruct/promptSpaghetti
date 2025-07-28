/**
 * Epic 16 Flagging Button Component
 * Task: E16-1753114247010-121CC7 - Create flagging functionality
 *
 * User-facing flagging button that integrates with existing ML flagging
 * infrastructure. Provides easy content reporting with reason selection
 * and tracks flagging status.
 */
import React from 'react';
export interface FlaggingReason {
    id: string;
    label: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: 'content' | 'security' | 'legal' | 'spam' | 'harassment' | 'other';
    requiresDetails?: boolean;
}
export interface FlagSubmission {
    contentId: string;
    contentType: 'template' | 'comment' | 'review' | 'user' | 'project';
    reasonId: string;
    details?: string;
    reporterId: string;
    metadata?: Record<string, unknown>;
}
export interface FlaggingButtonProps {
    contentId: string;
    contentType: 'template' | 'comment' | 'review' | 'user' | 'project';
    userId: string;
    onFlag?: (submission: FlagSubmission) => Promise<void>;
    onStatusChange?: (status: FlaggingStatus) => void;
    disabled?: boolean;
    showLabel?: boolean;
    size?: 'small' | 'medium' | 'large';
    variant?: 'button' | 'icon' | 'link';
    className?: string;
}
export interface FlaggingStatus {
    contentId: string;
    canFlag: boolean;
    alreadyFlagged: boolean;
    flagCount: number;
    userHasFlagged: boolean;
    status: 'none' | 'pending' | 'reviewed' | 'resolved' | 'dismissed';
    resolvedAt?: Date;
    moderatorNote?: string;
    const: any;
    DEFAULT_FLAGGING_REASONS: FlaggingReason;
}
export declare const FlaggingButton: React.FC<FlaggingButtonProps>;
export default FlaggingButton;
//# sourceMappingURL=FlaggingButton.d.ts.map