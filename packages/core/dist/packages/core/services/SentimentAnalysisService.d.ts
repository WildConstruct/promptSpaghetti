/**
 * Epic 16 Marketplace Sentiment Analysis Service
 *
 * Core service for analyzing sentiment, emotion, and toxicity in user feedback.
 * Provides comprehensive text analysis with machine learning models and analytics.
 *
 * Task: E16-1753114247016-0B348A - Create sentiment analysis
 */
import { SentimentAnalysis, SentimentAnalytics, SentimentAnalysisConfig, AnalyzeSentimentRequest, SentimentAnalysisResponse, FeedbackSourceType } from '../types/SentimentAnalysisTypes';
export declare class SentimentAnalysisService {
    private baseUrl;
    private config;
    private modelCache;
    private analysisCache;
    private analyticsCache;
    constructor(serviceConfig: {
        baseUrl: string;
        config?: SentimentAnalysisConfig;
        cacheEnabled?: boolean;
        cacheTTL?: number;
    });
    /**
     * Analyze sentiment for multiple texts
     */
    analyzeSentiment(request: AnalyzeSentimentRequest): Promise<SentimentAnalysisResponse>;
    /**
     * Get sentiment analytics for a resource
     */
    getSentimentAnalytics(resourceId: string, resourceType: string, timeRange: {
        start: Date;
        end: Date;
    }): Promise<SentimentAnalytics>;
    /**
     * Analyze single text for real-time processing
     */
    analyzeText(textId: string, content: string, sourceType: FeedbackSourceType, options?: {
        includeEmotions?: boolean;
        includeToxicity?: boolean;
        includeTopics?: boolean;
        language?: string;
    }): Promise<SentimentAnalysis>;
    /**
     * Update sentiment analysis configuration
     */
    updateConfig(newConfig: Partial<SentimentAnalysisConfig>): void;
    /**
     * Get current configuration
     */
    getConfig(): SentimentAnalysisConfig;
    private performSentimentAnalysis;
    private preprocessText;
    private removePersonalInfo;
    private normalizeText;
    private detectLanguage;
    private analyzeSentimentCore;
    private analyzeEmotions;
    private analyzeToxicity;
    private extractTopics;
    private getTopicSentiment;
    private extractKeywords;
    private detectIntent;
    private scoreQuality;
    private getEmptyEmotionAnalysis;
    private getEmptyToxicityAnalysis;
    private calculateOverallConfidence;
    private calculateOverallSentiment;
    private calculateSentimentAnalytics;
    private calculateOverallToxicityLevel;
    private generateCacheKey;
    private simpleHash;
    private getCachedAnalysis;
    private cacheAnalysis;
    private getCachedAnalytics;
    private cacheAnalytics;
    private clearAllCaches;
    private generateMockAnalyses;
    private generateMockFeedback;
    private generateMockSentiment;
    private generateMockEmotions;
    private generateMockToxicity;
    private getDefaultConfig;
}
//# sourceMappingURL=SentimentAnalysisService.d.ts.map