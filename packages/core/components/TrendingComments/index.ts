/**
 * Epic 16 Marketplace Trending Comments Components - Index
 * 
 * Central export file for all trending comments-related components.
 * Provides a clean API for importing trending comments functionality throughout the application.
 * 
 * Task: E16-1753114247017-86B04D - Implement trending comments
 */

export { TrendingCommentsList } from './TrendingCommentsList';
export { TrendingCommentCard } from './TrendingCommentCard';

// Re-export types for convenience
export type {
  TrendingComment,
  CommentScore,
  CommentEngagement,
  TrendingResults,
  CommentAnalytics,
  TrendingAlgorithmConfig,
  GetTrendingCommentsRequest,
  TrendingCommentsResponse,
  CommentableResourceType,
  CommentSortOrder,
  CommentEngagementType,
  TrendingPeriod
} from '../../types/TrendingCommentsTypes';

// Re-export service for convenience
export { TrendingCommentsService } from '../../services/TrendingCommentsService';