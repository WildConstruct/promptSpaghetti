/**
 * Epic 16 Marketplace Sentiment Analysis System - Data Types
 *
 * Comprehensive sentiment analysis functionality for user feedback, comments, and reviews.
 * Supports emotion detection, toxicity analysis, and trend tracking.
 *
 * Task: E16-1753114247016-0B348A - Create sentiment analysis
 */
import { z } from 'zod';
export type SentimentType = 'positive' | 'neutral' | 'negative';
export type EmotionType = 'joy' | 'sadness' | 'anger' | 'fear' | 'surprise' | 'disgust' | 'trust' | 'anticipation';
export type ToxicityLevel = 'none' | 'low' | 'medium' | 'high' | 'severe';
export type FeedbackSourceType = 'comment' | 'review' | 'survey_response' | 'support_ticket' | 'social_media' | 'email';
export type AnalysisModelType = 'transformer' | 'neural_network' | 'lexicon_based' | 'hybrid' | 'custom';
export declare const SentimentAnalysisSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type SentimentAnalysis = z.infer<typeof SentimentAnalysisSchema>;
export declare const SentimentAnalyticsSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type SentimentAnalytics = z.infer<typeof SentimentAnalyticsSchema>;
export declare const SentimentAnalysisConfigSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type SentimentAnalysisConfig = z.infer<typeof SentimentAnalysisConfigSchema>;
export declare const AnalyzeSentimentRequestSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const SentimentAnalysisResponseSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type AnalyzeSentimentRequest = z.infer<typeof AnalyzeSentimentRequestSchema>;
export type SentimentAnalysisResponse = z.infer<typeof SentimentAnalysisResponseSchema>;
export declare const validateAnalyzeSentimentRequest: (data: unknown) => AnalyzeSentimentRequest;
export declare const validateSentimentAnalysis: (data: unknown) => SentimentAnalysis;
export declare const validateSentimentAnalytics: (data: unknown) => SentimentAnalytics;
export interface SentimentSystemConfig {
    enabledModels: AnalysisModelType;
    defaultModel: AnalysisModelType;
    cachingEnabled: boolean;
    realtimeProcessing: boolean;
    moderationIntegration: boolean;
    analyticsRetentionDays: number;
    batchProcessingSettings: {
        maxBatchSize: number;
        processingIntervalMs: number;
        retryAttempts: number;
    };
}
export { SentimentAnalysisSchema, SentimentAnalyticsSchema, SentimentAnalysisConfigSchema, AnalyzeSentimentRequestSchema, SentimentAnalysisResponseSchema };
//# sourceMappingURL=SentimentAnalysisTypes.d.ts.map