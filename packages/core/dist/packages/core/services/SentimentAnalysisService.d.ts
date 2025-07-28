/**
 * Epic 16 Marketplace Sentiment Analysis Service
 *
 * Core service for analyzing sentiment, emotion, and toxicity in user feedback.
 * Provides comprehensive text analysis with machine learning models and analytics.
 *
 * Task: E16-1753114247016-0B348A - Create sentiment analysis
 */
import { SentimentAnalysisConfig } from '../types/SentimentAnalysisTypes';
export declare class SentimentAnalysisService {
    private baseUrl;
    private config;
    private modelCache;
    private analysisCache;
    private analyticsCache;
    constructor(serviceConfig: {});
    baseUrl: string;
    config?: SentimentAnalysisConfig;
    cacheEnabled?: boolean;
    cacheTTL?: number;
}
//# sourceMappingURL=SentimentAnalysisService.d.ts.map