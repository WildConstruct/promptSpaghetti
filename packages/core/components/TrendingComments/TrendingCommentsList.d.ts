/**
 * Epic 16 Marketplace Trending Comments List Component
 *
 * Displays a ranked list of trending comments with engagement metrics.
 * Supports real-time updates, sorting, and interactive engagement.
 *
 * Task: E16-1753114247017-86B04D - Implement trending comments
 */
import React from 'react';
import { CommentSortOrder, TrendingPeriod, CommentableResourceType } from '../../types/TrendingCommentsTypes';

interface TrendingCommentsListProps {
    resourceId: string;
    resourceType: CommentableResourceType;
    initialPeriod?: TrendingPeriod;
    initialSortOrder?: CommentSortOrder;
    limit?: number;
    showFilters?: boolean;
    showAnalytics?: boolean;
    onCommentEngagement?: (commentId: string, engagementType: string) => void;

export declare const TrendingCommentsList: React.FC<TrendingCommentsListProps>;
export default TrendingCommentsList;
//# sourceMappingURL=TrendingCommentsList.d.ts.map