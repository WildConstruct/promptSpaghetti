/**
 * Epic 16 Marketplace Sentiment Analysis Components - Index
 *
 * Central export file for all sentiment analysis-related components.
 * Provides a clean API for importing sentiment analysis functionality throughout the application.
 *
 * Task: E16-1753114247016-0B348A - Create sentiment analysis
 */

export { SentimentDashboard } from './SentimentDashboard';

// Re-export types for convenience
export type { SentimentAnalysis,
  SentimentAnalytics,
  SentimentAnalysisConfig,
  AnalyzeSentimentRequest,
  SentimentAnalysisResponse,
  SentimentType,
  EmotionType,
  ToxicityLevel,
  FeedbackSourceType,
  AnalysisModelType }
 from '../../types/SentimentAnalysisTypes';

// Re-export service for convenience
export { SentimentAnalysisService } from '../../services/SentimentAnalysisService';
