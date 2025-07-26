/**
 * Review Dashboard - Epic 17
 *
 * Central dashboard for managing all review workflows across the platform.
 * Provides unified interface for review assignment, monitoring, and analytics.
 *
 * Task: E17-1753114397301-5C1461 - Develop review tools
 * Epic: 17 - Backstage Admin Controls
 */
import React from 'react';
import { ReviewItem } from '../../types/ReviewTools';
interface ReviewDashboardProps {
    onReviewSelect?: (review: ReviewItem) => void;
    onAssignmentAction?: (action: AssignmentAction) => void;
    className?: string;
}
interface AssignmentAction {
    type: 'assign' | 'reassign' | 'escalate' | 'approve' | 'reject';
    reviewId: string;
    reviewerId?: string;
    data?: unknown;
}
export declare const ReviewDashboard: React.FC<ReviewDashboardProps>;
export default ReviewDashboard;
//# sourceMappingURL=ReviewDashboard.d.ts.map