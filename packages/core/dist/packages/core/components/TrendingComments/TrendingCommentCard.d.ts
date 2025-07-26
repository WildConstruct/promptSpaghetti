/**
 * Epic 16 Marketplace Trending Comment Card Component
 *
 * Individual comment card with engagement metrics, trending score, and interaction buttons.
 * Displays author info, content, and real-time engagement statistics.
 *
 * Task: E16-1753114247017-86B04D - Implement trending comments
 */
import React from 'react';
import { TrendingComment } from '../../types/TrendingCommentsTypes';
interface TrendingCommentCardProps {
    comment: TrendingComment;
    rank: number;
    onEngagement: (commentId: string, engagementType: string) => void;
    showReplies?: boolean;
    isReply?: boolean;
}
export declare const TrendingCommentCard: React.FC<TrendingCommentCardProps>;
export default TrendingCommentCard;
//# sourceMappingURL=TrendingCommentCard.d.ts.map