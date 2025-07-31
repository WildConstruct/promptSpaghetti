/**
 * Epic 16 Marketplace Sentiment Analysis System - Data Types
 *
 * Comprehensive sentiment analysis functionality for user feedback, comments, and reviews.
 * Supports emotion detection, toxicity analysis, and trend tracking.
 *
 * Task: E16-1753114247016-0B348A - Create sentiment analysis
 */
import { z } from 'zod';
// Sentiment analysis result
export const SentimentAnalysisSchema = z.object({});
analysisId: z.string().uuid(),
    textId;
z.string(), // Reference to source text (comment ID, review ID, etc.),
    sourceType;
z.enum(['comment', 'review', 'survey_response', 'support_ticket', 'social_media', 'email']),
    originalText;
z.string(),
    processedText;
z.string().optional(), // Cleaned/preprocessed version,
    language;
z.string().default('en'),
    analyzedAt;
z.date(),
    modelUsed;
z.enum(['transformer', 'neural_network', 'lexicon_based', 'hybrid', 'custom']),
    modelVersion;
z.string().default('1.0.0'),
    confidence;
z.number().min(0).max(1), // Overall confidence in analysis,
    // Core sentiment analysis
    sentiment;
z.object({});
type: z.enum(['positive', 'neutral', 'negative']),
    score;
z.number().min(-1).max(1), // -1 (very negative) to 1 (very positive),
    confidence;
z.number().min(0).max(1),
    magnitude;
z.number().min(0).max(1), // Strength of sentiment regardless of polarity,
    subjectivity;
z.number().min(0).max(1); // 0 (objective) to 1 (subjective),
// Emotion analysis
emotions: z.object({});
primary: z.enum(['joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust', 'trust', 'anticipation']).optional(),
    scores;
z.record(z.enum(['joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust', 'trust', 'anticipation']), z.number().min(0).max(1)).default({}),
    confidence;
z.number().min(0).max(1),
    mixed;
z.boolean().default(false); // True if multiple strong emotions detected;
// Toxicity and safety analysis
toxicity: z.object({});
level: z.enum(['none', 'low', 'medium', 'high', 'severe']),
    score;
z.number().min(0).max(1), // 0 (not toxic) to 1 (highly toxic),
    confidence;
z.number().min(0).max(1),
    categories;
z.object({});
harassment: z.number().min(0).max(1).default(0),
    hate_speech;
z.number().min(0).max(1).default(0),
    profanity;
z.number().min(0).max(1).default(0),
    threats;
z.number().min(0).max(1).default(0),
    spam;
z.number().min(0).max(1).default(0),
    inappropriate;
z.number().min(0).max(1).default(0),
;
({}),
    flags;
z.array(z.string()).default([]); // Specific toxicity flags detected;
// Advanced analysis features
topics: z.array(z.object({}), topic, z.string(), relevance, z.number().min(0).max(1), sentiment, z.enum(['positive', 'neutral', 'negative']));
([]),
    keywords;
z.array(z.object({}), keyword, z.string(), importance, z.number().min(0).max(1), sentiment, z.enum(['positive', 'neutral', 'negative']), frequency, z.number().min(1));
([]),
    // Intent and urgency detection
    intent;
z.object({});
category: z.enum(['question', 'complaint', 'compliment', 'suggestion', 'request', 'report', 'other']).optional(),
    confidence;
z.number().min(0).max(1),
    urgency;
z.enum(['low', 'medium', 'high', 'critical']).default('low'),
    actionRequired;
z.boolean().default(false),
;
optional(),
    // Quality and helpfulness metrics
    quality;
z.object({});
score: z.number().min(0).max(100), // Overall quality score,
    readability;
z.number().min(0).max(100), // Text readability score,
    coherence;
z.number().min(0).max(100), // Logical flow and coherence,
    constructiveness;
z.number().min(0).max(100), // How constructive the feedback is,
    specificity;
z.number().min(0).max(100), // How specific vs generic,
    helpfulness;
z.number().min(0).max(100); // Potential helpfulness to others,
optional(),
    // Processing metadata
    metadata;
z.object({});
processingTimeMs: z.number().default(0),
    textLength;
z.number().default(0),
    wordCount;
z.number().default(0),
    sentenceCount;
z.number().default(0),
    languageDetected;
z.string().optional(),
    languageConfidence;
z.number().min(0).max(1).optional(),
    preprocessingSteps;
z.array(z.string()).default([]),
    features;
z.record(z.unknown()).default({}); // Model-specific features
;
// Aggregate sentiment analytics
export const SentimentAnalyticsSchema = z.object({});
resourceId: z.string(),
    resourceType;
z.string(),
    timeRange;
z.object({});
start: z.date(),
    end;
z.date(),
;
totalAnalyses: z.number().default(0),
    // Sentiment distribution
    sentimentDistribution;
z.object({});
positive: z.object({});
count: z.number().default(0),
    percentage;
z.number().min(0).max(100).default(0),
    averageScore;
z.number().min(0).max(1).default(0),
;
neutral: z.object({});
count: z.number().default(0),
    percentage;
z.number().min(0).max(100).default(0),
    averageScore;
z.number().min(-0.2).max(0.2).default(0),
;
negative: z.object({});
count: z.number().default(0),
    percentage;
z.number().min(0).max(100).default(0),
    averageScore;
z.number().min(-1).max(0).default(0),
;
// Emotion analytics
emotionAnalytics: z.object({});
dominant: z.enum(['joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust', 'trust', 'anticipation']).optional(),
    distribution;
z.record(z.enum(['joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust', 'trust', 'anticipation']), z.number().min(0).max(100)).default({}),
    averageScores;
z.record(z.enum(['joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust', 'trust', 'anticipation']), z.number().min(0).max(1)).default({}),
    mixedEmotionRate;
z.number().min(0).max(100).default(0);
// Toxicity analytics
toxicityAnalytics: z.object({});
overallLevel: z.enum(['none', 'low', 'medium', 'high', 'severe']),
    distribution;
z.object({});
none: z.number().min(0).max(100).default(0),
    low;
z.number().min(0).max(100).default(0),
    medium;
z.number().min(0).max(100).default(0),
    high;
z.number().min(0).max(100).default(0),
    severe;
z.number().min(0).max(100).default(0),
;
categories: z.object({});
harassment: z.number().min(0).max(100).default(0),
    hate_speech;
z.number().min(0).max(100).default(0),
    profanity;
z.number().min(0).max(100).default(0),
    threats;
z.number().min(0).max(100).default(0),
    spam;
z.number().min(0).max(100).default(0),
    inappropriate;
z.number().min(0).max(100).default(0),
;
actionRequired: z.number().min(0).max(100).default(0); // Percentage requiring action;
// Trends over time
trends: z.object({});
sentimentTrend: z.enum(['improving', 'stable', 'declining']).default('stable'),
    sentimentOverTime;
z.array(z.object({}), timestamp, z.date(), positive, z.number().min(0).max(100), neutral, z.number().min(0).max(100), negative, z.number().min(0).max(100), averageScore, z.number().min(-1).max(1));
([]),
    emotionTrends;
z.array(z.object({}), timestamp, z.date(), dominantEmotion, z.enum(['joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust', 'trust', 'anticipation']).optional(), emotionScores, z.record(z.number().min(0).max(1)).default({}));
([]),
    toxicityTrend;
z.enum(['improving', 'stable', 'worsening']).default('stable'),
    qualityTrend;
z.enum(['improving', 'stable', 'declining']).default('stable');
// Key insights
insights: z.object({});
topPositiveKeywords: z.array(z.string()).default([]),
    topNegativeKeywords;
z.array(z.string()).default([]),
    emergingTopics;
z.array(z.object({}), topic, z.string(), sentiment, z.enum(['positive', 'neutral', 'negative']), growth, z.number() // Percentage growth,
);
([]),
    qualityMetrics;
z.object({});
averageReadability: z.number().min(0).max(100).default(0),
    averageConstructiveness;
z.number().min(0).max(100).default(0),
    averageHelpfulness;
z.number().min(0).max(100).default(0),
;
recommendations: z.array(z.object({}), type, z.enum(['improve_sentiment', 'address_concerns', 'enhance_moderation', 'boost_engagement', 'quality_improvement']), priority, z.enum(['low', 'medium', 'high', 'critical']), description, z.string(), expectedImpact, z.enum(['low', 'medium', 'high']));
([]);
;
// Sentiment analysis configuration
export const SentimentAnalysisConfigSchema = z.object({});
configId: z.string().uuid(),
    name;
z.string(),
    description;
z.string(),
    enabled;
z.boolean().default(true),
    // Model configuration
    models;
z.object({});
primary: z.enum(['transformer', 'neural_network', 'lexicon_based', 'hybrid', 'custom']),
    fallback;
z.enum(['transformer', 'neural_network', 'lexicon_based', 'hybrid', 'custom']).optional(),
    customEndpoint;
z.string().url().optional(),
    apiKey;
z.string().optional(),
;
// Analysis settings
analysis: z.object({});
enableEmotionDetection: z.boolean().default(true),
    enableToxicityDetection;
z.boolean().default(true),
    enableTopicExtraction;
z.boolean().default(true),
    enableIntentDetection;
z.boolean().default(false),
    enableQualityScoring;
z.boolean().default(true),
    minTextLength;
z.number().min(1).default(10),
    maxTextLength;
z.number().min(100).default(5000),
    supportedLanguages;
z.array(z.string()).default(['en', 'es', 'fr', 'de']),
;
// Processing settings
processing: z.object({});
enablePreprocessing: z.boolean().default(true),
    removePersonalInfo;
z.boolean().default(true),
    normalizeText;
z.boolean().default(true),
    filterSpam;
z.boolean().default(true),
    batchSize;
z.number().min(1).max(1000).default(100),
    timeoutMs;
z.number().min(1000).max(60000).default(10000),
;
// Thresholds
thresholds: z.object({});
toxicity: z.object({});
low: z.number().min(0).max(1).default(0.3),
    medium;
z.number().min(0).max(1).default(0.5),
    high;
z.number().min(0).max(1).default(0.7),
    severe;
z.number().min(0).max(1).default(0.9),
;
confidence: z.object({});
minimum: z.number().min(0).max(1).default(0.6),
    high;
z.number().min(0).max(1).default(0.8),
;
quality: z.object({});
minimum: z.number().min(0).max(100).default(40),
    good;
z.number().min(0).max(100).default(70),
;
// Real-time processing
realTime: z.object({});
enabled: z.boolean().default(false),
    webhookUrl;
z.string().url().optional(),
    alertThresholds;
z.object({});
severeToxicity: z.boolean().default(true),
    criticalIntent;
z.boolean().default(true),
    negativeSpike;
z.boolean().default(false),
;
;
// API request/response types
export const AnalyzeSentimentRequestSchema = z.object({});
texts: z.array(z.object({}), textId, z.string(), content, z.string().min(1), sourceType, z.enum(['comment', 'review', 'survey_response', 'support_ticket', 'social_media', 'email']), language, z.string().optional(), metadata, z.record(z.unknown()).default({}));
options: z.object({});
includeEmotions: z.boolean().default(true),
    includeToxicity;
z.boolean().default(true),
    includeTopics;
z.boolean().default(true),
    includeQuality;
z.boolean().default(true),
    modelType;
z.enum(['transformer', 'neural_network', 'lexicon_based', 'hybrid', 'custom']).optional(),
    realTime;
z.boolean().default(false),
;
({});
;
export const SentimentAnalysisResponseSchema = z.object({});
analyses: z.array(SentimentAnalysisSchema),
    summary;
z.object({});
totalProcessed: z.number(),
    totalErrors;
z.number(),
    averageConfidence;
z.number().min(0).max(1),
    processingTimeMs;
z.number(),
    overallSentiment;
z.enum(['positive', 'neutral', 'negative']).optional(),
;
meta: z.object({});
requestId: z.string().uuid(),
    modelUsed;
z.string(),
    batchId;
z.string().optional(),
    apiVersion;
z.string().default('1.0.0'),
;
;
// Validation functions
export const validateAnalyzeSentimentRequest = (data) => {
    return AnalyzeSentimentRequestSchema.parse(data);
};
export const validateSentimentAnalysis = (data) => {
    return SentimentAnalysisSchema.parse(data);
};
export const validateSentimentAnalytics = (data) => {
    return SentimentAnalyticsSchema.parse(data);
};
;
