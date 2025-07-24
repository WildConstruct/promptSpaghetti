/**
 * Epic 16 Marketplace Trending Comments Components - Index
 *
 * Central export file for all trending comments-related components.
 * Provides a clean API for importing trending comments functionality throughout the application.
 *
 * Task: E16-1753114247017-86B04D - Implement trending comments
 */
export { TrendingCommentsList } from './TrendingCommentsList.js';
export { TrendingCommentCard } from './TrendingCommentCard.js';
// Re-export service for convenience
export { TrendingCommentsService } from '../../services/TrendingCommentsService.js';
