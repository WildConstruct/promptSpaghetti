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
export declare const SentimentAnalysisSchema: z.ZodObject<{
    analysisId: z.ZodString;
    textId: z.ZodString;
    sourceType: z.ZodEnum<["comment", "review", "survey_response", "support_ticket", "social_media", "email"]>;
    originalText: z.ZodString;
    processedText: z.ZodOptional<z.ZodString>;
    language: z.ZodDefault<z.ZodString>;
    analyzedAt: z.ZodDate;
    modelUsed: z.ZodEnum<["transformer", "neural_network", "lexicon_based", "hybrid", "custom"]>;
    modelVersion: z.ZodDefault<z.ZodString>;
    confidence: z.ZodNumber;
    sentiment: z.ZodObject<{
        type: z.ZodEnum<["positive", "neutral", "negative"]>;
        score: z.ZodNumber;
        confidence: z.ZodNumber;
        magnitude: z.ZodNumber;
        subjectivity: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        type?: "positive" | "neutral" | "negative";
        score?: number;
        confidence?: number;
        magnitude?: number;
        subjectivity?: number;
    }, {
        type?: "positive" | "neutral" | "negative";
        score?: number;
        confidence?: number;
        magnitude?: number;
        subjectivity?: number;
    }>;
    emotions: z.ZodObject<{
        primary: z.ZodOptional<z.ZodEnum<["joy", "sadness", "anger", "fear", "surprise", "disgust", "trust", "anticipation"]>>;
        scores: z.ZodDefault<z.ZodRecord<z.ZodEnum<["joy", "sadness", "anger", "fear", "surprise", "disgust", "trust", "anticipation"]>, z.ZodNumber>>;
        confidence: z.ZodNumber;
        mixed: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        mixed?: boolean;
        primary?: "fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation";
        confidence?: number;
        scores?: Partial<Record<"fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation", number>>;
    }, {
        mixed?: boolean;
        primary?: "fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation";
        confidence?: number;
        scores?: Partial<Record<"fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation", number>>;
    }>;
    toxicity: z.ZodObject<{
        level: z.ZodEnum<["none", "low", "medium", "high", "severe"]>;
        score: z.ZodNumber;
        confidence: z.ZodNumber;
        categories: z.ZodDefault<z.ZodObject<{
            harassment: z.ZodDefault<z.ZodNumber>;
            hate_speech: z.ZodDefault<z.ZodNumber>;
            profanity: z.ZodDefault<z.ZodNumber>;
            threats: z.ZodDefault<z.ZodNumber>;
            spam: z.ZodDefault<z.ZodNumber>;
            inappropriate: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            spam?: number;
            inappropriate?: number;
            threats?: number;
            harassment?: number;
            hate_speech?: number;
            profanity?: number;
        }, {
            spam?: number;
            inappropriate?: number;
            threats?: number;
            harassment?: number;
            hate_speech?: number;
            profanity?: number;
        }>>;
        flags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        level?: "low" | "medium" | "high" | "none" | "severe";
        score?: number;
        categories?: {
            spam?: number;
            inappropriate?: number;
            threats?: number;
            harassment?: number;
            hate_speech?: number;
            profanity?: number;
        };
        confidence?: number;
        flags?: string[];
    }, {
        level?: "low" | "medium" | "high" | "none" | "severe";
        score?: number;
        categories?: {
            spam?: number;
            inappropriate?: number;
            threats?: number;
            harassment?: number;
            hate_speech?: number;
            profanity?: number;
        };
        confidence?: number;
        flags?: string[];
    }>;
    topics: z.ZodDefault<z.ZodArray<z.ZodObject<{
        topic: z.ZodString;
        relevance: z.ZodNumber;
        sentiment: z.ZodEnum<["positive", "neutral", "negative"]>;
    }, "strip", z.ZodTypeAny, {
        relevance?: number;
        sentiment?: "positive" | "neutral" | "negative";
        topic?: string;
    }, {
        relevance?: number;
        sentiment?: "positive" | "neutral" | "negative";
        topic?: string;
    }>, "many">>;
    keywords: z.ZodDefault<z.ZodArray<z.ZodObject<{
        keyword: z.ZodString;
        importance: z.ZodNumber;
        sentiment: z.ZodEnum<["positive", "neutral", "negative"]>;
        frequency: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        sentiment?: "positive" | "neutral" | "negative";
        frequency?: number;
        keyword?: string;
        importance?: number;
    }, {
        sentiment?: "positive" | "neutral" | "negative";
        frequency?: number;
        keyword?: string;
        importance?: number;
    }>, "many">>;
    intent: z.ZodOptional<z.ZodObject<{
        category: z.ZodOptional<z.ZodEnum<["question", "complaint", "compliment", "suggestion", "request", "report", "other"]>>;
        confidence: z.ZodNumber;
        urgency: z.ZodDefault<z.ZodEnum<["low", "medium", "high", "critical"]>>;
        actionRequired: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        category?: "other" | "suggestion" | "request" | "report" | "question" | "complaint" | "compliment";
        confidence?: number;
        urgency?: "low" | "medium" | "high" | "critical";
        actionRequired?: boolean;
    }, {
        category?: "other" | "suggestion" | "request" | "report" | "question" | "complaint" | "compliment";
        confidence?: number;
        urgency?: "low" | "medium" | "high" | "critical";
        actionRequired?: boolean;
    }>>;
    quality: z.ZodOptional<z.ZodObject<{
        score: z.ZodNumber;
        readability: z.ZodNumber;
        coherence: z.ZodNumber;
        constructiveness: z.ZodNumber;
        specificity: z.ZodNumber;
        helpfulness: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        score?: number;
        readability?: number;
        specificity?: number;
        coherence?: number;
        constructiveness?: number;
        helpfulness?: number;
    }, {
        score?: number;
        readability?: number;
        specificity?: number;
        coherence?: number;
        constructiveness?: number;
        helpfulness?: number;
    }>>;
    metadata: z.ZodObject<{
        processingTimeMs: z.ZodDefault<z.ZodNumber>;
        textLength: z.ZodDefault<z.ZodNumber>;
        wordCount: z.ZodDefault<z.ZodNumber>;
        sentenceCount: z.ZodDefault<z.ZodNumber>;
        languageDetected: z.ZodOptional<z.ZodString>;
        languageConfidence: z.ZodOptional<z.ZodNumber>;
        preprocessingSteps: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        features: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        sentenceCount?: number;
        wordCount?: number;
        textLength?: number;
        processingTimeMs?: number;
        languageDetected?: string;
        languageConfidence?: number;
        preprocessingSteps?: string[];
        features?: Record<string, unknown>;
    }, {
        sentenceCount?: number;
        wordCount?: number;
        textLength?: number;
        processingTimeMs?: number;
        languageDetected?: string;
        languageConfidence?: number;
        preprocessingSteps?: string[];
        features?: Record<string, unknown>;
    }>;
}, "strip", z.ZodTypeAny, {
    metadata?: {
        sentenceCount?: number;
        wordCount?: number;
        textLength?: number;
        processingTimeMs?: number;
        languageDetected?: string;
        languageConfidence?: number;
        preprocessingSteps?: string[];
        features?: Record<string, unknown>;
    };
    quality?: {
        score?: number;
        readability?: number;
        specificity?: number;
        coherence?: number;
        constructiveness?: number;
        helpfulness?: number;
    };
    confidence?: number;
    keywords?: {
        sentiment?: "positive" | "neutral" | "negative";
        frequency?: number;
        keyword?: string;
        importance?: number;
    }[];
    topics?: {
        relevance?: number;
        sentiment?: "positive" | "neutral" | "negative";
        topic?: string;
    }[];
    language?: string;
    sourceType?: "comment" | "email" | "review" | "social_media" | "survey_response" | "support_ticket";
    emotions?: {
        mixed?: boolean;
        primary?: "fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation";
        confidence?: number;
        scores?: Partial<Record<"fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation", number>>;
    };
    sentiment?: {
        type?: "positive" | "neutral" | "negative";
        score?: number;
        confidence?: number;
        magnitude?: number;
        subjectivity?: number;
    };
    intent?: {
        category?: "other" | "suggestion" | "request" | "report" | "question" | "complaint" | "compliment";
        confidence?: number;
        urgency?: "low" | "medium" | "high" | "critical";
        actionRequired?: boolean;
    };
    analysisId?: string;
    textId?: string;
    originalText?: string;
    processedText?: string;
    analyzedAt?: Date;
    modelUsed?: "custom" | "hybrid" | "transformer" | "neural_network" | "lexicon_based";
    modelVersion?: string;
    toxicity?: {
        level?: "low" | "medium" | "high" | "none" | "severe";
        score?: number;
        categories?: {
            spam?: number;
            inappropriate?: number;
            threats?: number;
            harassment?: number;
            hate_speech?: number;
            profanity?: number;
        };
        confidence?: number;
        flags?: string[];
    };
}, {
    metadata?: {
        sentenceCount?: number;
        wordCount?: number;
        textLength?: number;
        processingTimeMs?: number;
        languageDetected?: string;
        languageConfidence?: number;
        preprocessingSteps?: string[];
        features?: Record<string, unknown>;
    };
    quality?: {
        score?: number;
        readability?: number;
        specificity?: number;
        coherence?: number;
        constructiveness?: number;
        helpfulness?: number;
    };
    confidence?: number;
    keywords?: {
        sentiment?: "positive" | "neutral" | "negative";
        frequency?: number;
        keyword?: string;
        importance?: number;
    }[];
    topics?: {
        relevance?: number;
        sentiment?: "positive" | "neutral" | "negative";
        topic?: string;
    }[];
    language?: string;
    sourceType?: "comment" | "email" | "review" | "social_media" | "survey_response" | "support_ticket";
    emotions?: {
        mixed?: boolean;
        primary?: "fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation";
        confidence?: number;
        scores?: Partial<Record<"fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation", number>>;
    };
    sentiment?: {
        type?: "positive" | "neutral" | "negative";
        score?: number;
        confidence?: number;
        magnitude?: number;
        subjectivity?: number;
    };
    intent?: {
        category?: "other" | "suggestion" | "request" | "report" | "question" | "complaint" | "compliment";
        confidence?: number;
        urgency?: "low" | "medium" | "high" | "critical";
        actionRequired?: boolean;
    };
    analysisId?: string;
    textId?: string;
    originalText?: string;
    processedText?: string;
    analyzedAt?: Date;
    modelUsed?: "custom" | "hybrid" | "transformer" | "neural_network" | "lexicon_based";
    modelVersion?: string;
    toxicity?: {
        level?: "low" | "medium" | "high" | "none" | "severe";
        score?: number;
        categories?: {
            spam?: number;
            inappropriate?: number;
            threats?: number;
            harassment?: number;
            hate_speech?: number;
            profanity?: number;
        };
        confidence?: number;
        flags?: string[];
    };
}>;
export type SentimentAnalysis = z.infer<typeof SentimentAnalysisSchema>;
export declare const SentimentAnalyticsSchema: z.ZodObject<{
    resourceId: z.ZodString;
    resourceType: z.ZodString;
    timeRange: z.ZodObject<{
        start: z.ZodDate;
        end: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        start?: Date;
        end?: Date;
    }, {
        start?: Date;
        end?: Date;
    }>;
    totalAnalyses: z.ZodDefault<z.ZodNumber>;
    sentimentDistribution: z.ZodObject<{
        positive: z.ZodObject<{
            count: z.ZodDefault<z.ZodNumber>;
            percentage: z.ZodDefault<z.ZodNumber>;
            averageScore: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            count?: number;
            percentage?: number;
            averageScore?: number;
        }, {
            count?: number;
            percentage?: number;
            averageScore?: number;
        }>;
        neutral: z.ZodObject<{
            count: z.ZodDefault<z.ZodNumber>;
            percentage: z.ZodDefault<z.ZodNumber>;
            averageScore: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            count?: number;
            percentage?: number;
            averageScore?: number;
        }, {
            count?: number;
            percentage?: number;
            averageScore?: number;
        }>;
        negative: z.ZodObject<{
            count: z.ZodDefault<z.ZodNumber>;
            percentage: z.ZodDefault<z.ZodNumber>;
            averageScore: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            count?: number;
            percentage?: number;
            averageScore?: number;
        }, {
            count?: number;
            percentage?: number;
            averageScore?: number;
        }>;
    }, "strip", z.ZodTypeAny, {
        positive?: {
            count?: number;
            percentage?: number;
            averageScore?: number;
        };
        neutral?: {
            count?: number;
            percentage?: number;
            averageScore?: number;
        };
        negative?: {
            count?: number;
            percentage?: number;
            averageScore?: number;
        };
    }, {
        positive?: {
            count?: number;
            percentage?: number;
            averageScore?: number;
        };
        neutral?: {
            count?: number;
            percentage?: number;
            averageScore?: number;
        };
        negative?: {
            count?: number;
            percentage?: number;
            averageScore?: number;
        };
    }>;
    emotionAnalytics: z.ZodObject<{
        dominant: z.ZodOptional<z.ZodEnum<["joy", "sadness", "anger", "fear", "surprise", "disgust", "trust", "anticipation"]>>;
        distribution: z.ZodDefault<z.ZodRecord<z.ZodEnum<["joy", "sadness", "anger", "fear", "surprise", "disgust", "trust", "anticipation"]>, z.ZodNumber>>;
        averageScores: z.ZodDefault<z.ZodRecord<z.ZodEnum<["joy", "sadness", "anger", "fear", "surprise", "disgust", "trust", "anticipation"]>, z.ZodNumber>>;
        mixedEmotionRate: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        distribution?: Partial<Record<"fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation", number>>;
        dominant?: "fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation";
        averageScores?: Partial<Record<"fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation", number>>;
        mixedEmotionRate?: number;
    }, {
        distribution?: Partial<Record<"fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation", number>>;
        dominant?: "fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation";
        averageScores?: Partial<Record<"fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation", number>>;
        mixedEmotionRate?: number;
    }>;
    toxicityAnalytics: z.ZodObject<{
        overallLevel: z.ZodEnum<["none", "low", "medium", "high", "severe"]>;
        distribution: z.ZodObject<{
            none: z.ZodDefault<z.ZodNumber>;
            low: z.ZodDefault<z.ZodNumber>;
            medium: z.ZodDefault<z.ZodNumber>;
            high: z.ZodDefault<z.ZodNumber>;
            severe: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            low?: number;
            medium?: number;
            high?: number;
            none?: number;
            severe?: number;
        }, {
            low?: number;
            medium?: number;
            high?: number;
            none?: number;
            severe?: number;
        }>;
        categories: z.ZodObject<{
            harassment: z.ZodDefault<z.ZodNumber>;
            hate_speech: z.ZodDefault<z.ZodNumber>;
            profanity: z.ZodDefault<z.ZodNumber>;
            threats: z.ZodDefault<z.ZodNumber>;
            spam: z.ZodDefault<z.ZodNumber>;
            inappropriate: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            spam?: number;
            inappropriate?: number;
            threats?: number;
            harassment?: number;
            hate_speech?: number;
            profanity?: number;
        }, {
            spam?: number;
            inappropriate?: number;
            threats?: number;
            harassment?: number;
            hate_speech?: number;
            profanity?: number;
        }>;
        actionRequired: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        categories?: {
            spam?: number;
            inappropriate?: number;
            threats?: number;
            harassment?: number;
            hate_speech?: number;
            profanity?: number;
        };
        distribution?: {
            low?: number;
            medium?: number;
            high?: number;
            none?: number;
            severe?: number;
        };
        actionRequired?: number;
        overallLevel?: "low" | "medium" | "high" | "none" | "severe";
    }, {
        categories?: {
            spam?: number;
            inappropriate?: number;
            threats?: number;
            harassment?: number;
            hate_speech?: number;
            profanity?: number;
        };
        distribution?: {
            low?: number;
            medium?: number;
            high?: number;
            none?: number;
            severe?: number;
        };
        actionRequired?: number;
        overallLevel?: "low" | "medium" | "high" | "none" | "severe";
    }>;
    trends: z.ZodObject<{
        sentimentTrend: z.ZodDefault<z.ZodEnum<["improving", "stable", "declining"]>>;
        sentimentOverTime: z.ZodDefault<z.ZodArray<z.ZodObject<{
            timestamp: z.ZodDate;
            positive: z.ZodNumber;
            neutral: z.ZodNumber;
            negative: z.ZodNumber;
            averageScore: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            timestamp?: Date;
            positive?: number;
            neutral?: number;
            negative?: number;
            averageScore?: number;
        }, {
            timestamp?: Date;
            positive?: number;
            neutral?: number;
            negative?: number;
            averageScore?: number;
        }>, "many">>;
        emotionTrends: z.ZodDefault<z.ZodArray<z.ZodObject<{
            timestamp: z.ZodDate;
            dominantEmotion: z.ZodOptional<z.ZodEnum<["joy", "sadness", "anger", "fear", "surprise", "disgust", "trust", "anticipation"]>>;
            emotionScores: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodNumber>>;
        }, "strip", z.ZodTypeAny, {
            timestamp?: Date;
            dominantEmotion?: "fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation";
            emotionScores?: Record<string, number>;
        }, {
            timestamp?: Date;
            dominantEmotion?: "fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation";
            emotionScores?: Record<string, number>;
        }>, "many">>;
        toxicityTrend: z.ZodDefault<z.ZodEnum<["improving", "stable", "worsening"]>>;
        qualityTrend: z.ZodDefault<z.ZodEnum<["improving", "stable", "declining"]>>;
    }, "strip", z.ZodTypeAny, {
        sentimentTrend?: "stable" | "improving" | "declining";
        sentimentOverTime?: {
            timestamp?: Date;
            positive?: number;
            neutral?: number;
            negative?: number;
            averageScore?: number;
        }[];
        emotionTrends?: {
            timestamp?: Date;
            dominantEmotion?: "fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation";
            emotionScores?: Record<string, number>;
        }[];
        toxicityTrend?: "stable" | "improving" | "worsening";
        qualityTrend?: "stable" | "improving" | "declining";
    }, {
        sentimentTrend?: "stable" | "improving" | "declining";
        sentimentOverTime?: {
            timestamp?: Date;
            positive?: number;
            neutral?: number;
            negative?: number;
            averageScore?: number;
        }[];
        emotionTrends?: {
            timestamp?: Date;
            dominantEmotion?: "fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation";
            emotionScores?: Record<string, number>;
        }[];
        toxicityTrend?: "stable" | "improving" | "worsening";
        qualityTrend?: "stable" | "improving" | "declining";
    }>;
    insights: z.ZodObject<{
        topPositiveKeywords: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        topNegativeKeywords: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        emergingTopics: z.ZodDefault<z.ZodArray<z.ZodObject<{
            topic: z.ZodString;
            sentiment: z.ZodEnum<["positive", "neutral", "negative"]>;
            growth: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            sentiment?: "positive" | "neutral" | "negative";
            topic?: string;
            growth?: number;
        }, {
            sentiment?: "positive" | "neutral" | "negative";
            topic?: string;
            growth?: number;
        }>, "many">>;
        qualityMetrics: z.ZodObject<{
            averageReadability: z.ZodDefault<z.ZodNumber>;
            averageConstructiveness: z.ZodDefault<z.ZodNumber>;
            averageHelpfulness: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            averageReadability?: number;
            averageConstructiveness?: number;
            averageHelpfulness?: number;
        }, {
            averageReadability?: number;
            averageConstructiveness?: number;
            averageHelpfulness?: number;
        }>;
        recommendations: z.ZodDefault<z.ZodArray<z.ZodObject<{
            type: z.ZodEnum<["improve_sentiment", "address_concerns", "enhance_moderation", "boost_engagement", "quality_improvement"]>;
            priority: z.ZodEnum<["low", "medium", "high", "critical"]>;
            description: z.ZodString;
            expectedImpact: z.ZodEnum<["low", "medium", "high"]>;
        }, "strip", z.ZodTypeAny, {
            description?: string;
            priority?: "low" | "medium" | "high" | "critical";
            type?: "quality_improvement" | "improve_sentiment" | "address_concerns" | "enhance_moderation" | "boost_engagement";
            expectedImpact?: "low" | "medium" | "high";
        }, {
            description?: string;
            priority?: "low" | "medium" | "high" | "critical";
            type?: "quality_improvement" | "improve_sentiment" | "address_concerns" | "enhance_moderation" | "boost_engagement";
            expectedImpact?: "low" | "medium" | "high";
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        recommendations?: {
            description?: string;
            priority?: "low" | "medium" | "high" | "critical";
            type?: "quality_improvement" | "improve_sentiment" | "address_concerns" | "enhance_moderation" | "boost_engagement";
            expectedImpact?: "low" | "medium" | "high";
        }[];
        qualityMetrics?: {
            averageReadability?: number;
            averageConstructiveness?: number;
            averageHelpfulness?: number;
        };
        topPositiveKeywords?: string[];
        topNegativeKeywords?: string[];
        emergingTopics?: {
            sentiment?: "positive" | "neutral" | "negative";
            topic?: string;
            growth?: number;
        }[];
    }, {
        recommendations?: {
            description?: string;
            priority?: "low" | "medium" | "high" | "critical";
            type?: "quality_improvement" | "improve_sentiment" | "address_concerns" | "enhance_moderation" | "boost_engagement";
            expectedImpact?: "low" | "medium" | "high";
        }[];
        qualityMetrics?: {
            averageReadability?: number;
            averageConstructiveness?: number;
            averageHelpfulness?: number;
        };
        topPositiveKeywords?: string[];
        topNegativeKeywords?: string[];
        emergingTopics?: {
            sentiment?: "positive" | "neutral" | "negative";
            topic?: string;
            growth?: number;
        }[];
    }>;
}, "strip", z.ZodTypeAny, {
    trends?: {
        sentimentTrend?: "stable" | "improving" | "declining";
        sentimentOverTime?: {
            timestamp?: Date;
            positive?: number;
            neutral?: number;
            negative?: number;
            averageScore?: number;
        }[];
        emotionTrends?: {
            timestamp?: Date;
            dominantEmotion?: "fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation";
            emotionScores?: Record<string, number>;
        }[];
        toxicityTrend?: "stable" | "improving" | "worsening";
        qualityTrend?: "stable" | "improving" | "declining";
    };
    insights?: {
        recommendations?: {
            description?: string;
            priority?: "low" | "medium" | "high" | "critical";
            type?: "quality_improvement" | "improve_sentiment" | "address_concerns" | "enhance_moderation" | "boost_engagement";
            expectedImpact?: "low" | "medium" | "high";
        }[];
        qualityMetrics?: {
            averageReadability?: number;
            averageConstructiveness?: number;
            averageHelpfulness?: number;
        };
        topPositiveKeywords?: string[];
        topNegativeKeywords?: string[];
        emergingTopics?: {
            sentiment?: "positive" | "neutral" | "negative";
            topic?: string;
            growth?: number;
        }[];
    };
    resourceId?: string;
    resourceType?: string;
    timeRange?: {
        start?: Date;
        end?: Date;
    };
    totalAnalyses?: number;
    sentimentDistribution?: {
        positive?: {
            count?: number;
            percentage?: number;
            averageScore?: number;
        };
        neutral?: {
            count?: number;
            percentage?: number;
            averageScore?: number;
        };
        negative?: {
            count?: number;
            percentage?: number;
            averageScore?: number;
        };
    };
    emotionAnalytics?: {
        distribution?: Partial<Record<"fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation", number>>;
        dominant?: "fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation";
        averageScores?: Partial<Record<"fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation", number>>;
        mixedEmotionRate?: number;
    };
    toxicityAnalytics?: {
        categories?: {
            spam?: number;
            inappropriate?: number;
            threats?: number;
            harassment?: number;
            hate_speech?: number;
            profanity?: number;
        };
        distribution?: {
            low?: number;
            medium?: number;
            high?: number;
            none?: number;
            severe?: number;
        };
        actionRequired?: number;
        overallLevel?: "low" | "medium" | "high" | "none" | "severe";
    };
}, {
    trends?: {
        sentimentTrend?: "stable" | "improving" | "declining";
        sentimentOverTime?: {
            timestamp?: Date;
            positive?: number;
            neutral?: number;
            negative?: number;
            averageScore?: number;
        }[];
        emotionTrends?: {
            timestamp?: Date;
            dominantEmotion?: "fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation";
            emotionScores?: Record<string, number>;
        }[];
        toxicityTrend?: "stable" | "improving" | "worsening";
        qualityTrend?: "stable" | "improving" | "declining";
    };
    insights?: {
        recommendations?: {
            description?: string;
            priority?: "low" | "medium" | "high" | "critical";
            type?: "quality_improvement" | "improve_sentiment" | "address_concerns" | "enhance_moderation" | "boost_engagement";
            expectedImpact?: "low" | "medium" | "high";
        }[];
        qualityMetrics?: {
            averageReadability?: number;
            averageConstructiveness?: number;
            averageHelpfulness?: number;
        };
        topPositiveKeywords?: string[];
        topNegativeKeywords?: string[];
        emergingTopics?: {
            sentiment?: "positive" | "neutral" | "negative";
            topic?: string;
            growth?: number;
        }[];
    };
    resourceId?: string;
    resourceType?: string;
    timeRange?: {
        start?: Date;
        end?: Date;
    };
    totalAnalyses?: number;
    sentimentDistribution?: {
        positive?: {
            count?: number;
            percentage?: number;
            averageScore?: number;
        };
        neutral?: {
            count?: number;
            percentage?: number;
            averageScore?: number;
        };
        negative?: {
            count?: number;
            percentage?: number;
            averageScore?: number;
        };
    };
    emotionAnalytics?: {
        distribution?: Partial<Record<"fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation", number>>;
        dominant?: "fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation";
        averageScores?: Partial<Record<"fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation", number>>;
        mixedEmotionRate?: number;
    };
    toxicityAnalytics?: {
        categories?: {
            spam?: number;
            inappropriate?: number;
            threats?: number;
            harassment?: number;
            hate_speech?: number;
            profanity?: number;
        };
        distribution?: {
            low?: number;
            medium?: number;
            high?: number;
            none?: number;
            severe?: number;
        };
        actionRequired?: number;
        overallLevel?: "low" | "medium" | "high" | "none" | "severe";
    };
}>;
export type SentimentAnalytics = z.infer<typeof SentimentAnalyticsSchema>;
export declare const SentimentAnalysisConfigSchema: z.ZodObject<{
    configId: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    enabled: z.ZodDefault<z.ZodBoolean>;
    models: z.ZodObject<{
        primary: z.ZodEnum<["transformer", "neural_network", "lexicon_based", "hybrid", "custom"]>;
        fallback: z.ZodOptional<z.ZodEnum<["transformer", "neural_network", "lexicon_based", "hybrid", "custom"]>>;
        customEndpoint: z.ZodOptional<z.ZodString>;
        apiKey: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        primary?: "custom" | "hybrid" | "transformer" | "neural_network" | "lexicon_based";
        fallback?: "custom" | "hybrid" | "transformer" | "neural_network" | "lexicon_based";
        apiKey?: string;
        customEndpoint?: string;
    }, {
        primary?: "custom" | "hybrid" | "transformer" | "neural_network" | "lexicon_based";
        fallback?: "custom" | "hybrid" | "transformer" | "neural_network" | "lexicon_based";
        apiKey?: string;
        customEndpoint?: string;
    }>;
    analysis: z.ZodObject<{
        enableEmotionDetection: z.ZodDefault<z.ZodBoolean>;
        enableToxicityDetection: z.ZodDefault<z.ZodBoolean>;
        enableTopicExtraction: z.ZodDefault<z.ZodBoolean>;
        enableIntentDetection: z.ZodDefault<z.ZodBoolean>;
        enableQualityScoring: z.ZodDefault<z.ZodBoolean>;
        minTextLength: z.ZodDefault<z.ZodNumber>;
        maxTextLength: z.ZodDefault<z.ZodNumber>;
        supportedLanguages: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        enableEmotionDetection?: boolean;
        enableToxicityDetection?: boolean;
        enableTopicExtraction?: boolean;
        enableIntentDetection?: boolean;
        enableQualityScoring?: boolean;
        minTextLength?: number;
        maxTextLength?: number;
        supportedLanguages?: string[];
    }, {
        enableEmotionDetection?: boolean;
        enableToxicityDetection?: boolean;
        enableTopicExtraction?: boolean;
        enableIntentDetection?: boolean;
        enableQualityScoring?: boolean;
        minTextLength?: number;
        maxTextLength?: number;
        supportedLanguages?: string[];
    }>;
    processing: z.ZodObject<{
        enablePreprocessing: z.ZodDefault<z.ZodBoolean>;
        removePersonalInfo: z.ZodDefault<z.ZodBoolean>;
        normalizeText: z.ZodDefault<z.ZodBoolean>;
        filterSpam: z.ZodDefault<z.ZodBoolean>;
        batchSize: z.ZodDefault<z.ZodNumber>;
        timeoutMs: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        batchSize?: number;
        timeoutMs?: number;
        enablePreprocessing?: boolean;
        removePersonalInfo?: boolean;
        normalizeText?: boolean;
        filterSpam?: boolean;
    }, {
        batchSize?: number;
        timeoutMs?: number;
        enablePreprocessing?: boolean;
        removePersonalInfo?: boolean;
        normalizeText?: boolean;
        filterSpam?: boolean;
    }>;
    thresholds: z.ZodObject<{
        toxicity: z.ZodObject<{
            low: z.ZodDefault<z.ZodNumber>;
            medium: z.ZodDefault<z.ZodNumber>;
            high: z.ZodDefault<z.ZodNumber>;
            severe: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            low?: number;
            medium?: number;
            high?: number;
            severe?: number;
        }, {
            low?: number;
            medium?: number;
            high?: number;
            severe?: number;
        }>;
        confidence: z.ZodObject<{
            minimum: z.ZodDefault<z.ZodNumber>;
            high: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            minimum?: number;
            high?: number;
        }, {
            minimum?: number;
            high?: number;
        }>;
        quality: z.ZodObject<{
            minimum: z.ZodDefault<z.ZodNumber>;
            good: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            minimum?: number;
            good?: number;
        }, {
            minimum?: number;
            good?: number;
        }>;
    }, "strip", z.ZodTypeAny, {
        quality?: {
            minimum?: number;
            good?: number;
        };
        confidence?: {
            minimum?: number;
            high?: number;
        };
        toxicity?: {
            low?: number;
            medium?: number;
            high?: number;
            severe?: number;
        };
    }, {
        quality?: {
            minimum?: number;
            good?: number;
        };
        confidence?: {
            minimum?: number;
            high?: number;
        };
        toxicity?: {
            low?: number;
            medium?: number;
            high?: number;
            severe?: number;
        };
    }>;
    realTime: z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        webhookUrl: z.ZodOptional<z.ZodString>;
        alertThresholds: z.ZodObject<{
            severeToxicity: z.ZodDefault<z.ZodBoolean>;
            criticalIntent: z.ZodDefault<z.ZodBoolean>;
            negativeSpike: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            severeToxicity?: boolean;
            criticalIntent?: boolean;
            negativeSpike?: boolean;
        }, {
            severeToxicity?: boolean;
            criticalIntent?: boolean;
            negativeSpike?: boolean;
        }>;
    }, "strip", z.ZodTypeAny, {
        enabled?: boolean;
        alertThresholds?: {
            severeToxicity?: boolean;
            criticalIntent?: boolean;
            negativeSpike?: boolean;
        };
        webhookUrl?: string;
    }, {
        enabled?: boolean;
        alertThresholds?: {
            severeToxicity?: boolean;
            criticalIntent?: boolean;
            negativeSpike?: boolean;
        };
        webhookUrl?: string;
    }>;
}, "strip", z.ZodTypeAny, {
    name?: string;
    description?: string;
    enabled?: boolean;
    processing?: {
        batchSize?: number;
        timeoutMs?: number;
        enablePreprocessing?: boolean;
        removePersonalInfo?: boolean;
        normalizeText?: boolean;
        filterSpam?: boolean;
    };
    analysis?: {
        enableEmotionDetection?: boolean;
        enableToxicityDetection?: boolean;
        enableTopicExtraction?: boolean;
        enableIntentDetection?: boolean;
        enableQualityScoring?: boolean;
        minTextLength?: number;
        maxTextLength?: number;
        supportedLanguages?: string[];
    };
    thresholds?: {
        quality?: {
            minimum?: number;
            good?: number;
        };
        confidence?: {
            minimum?: number;
            high?: number;
        };
        toxicity?: {
            low?: number;
            medium?: number;
            high?: number;
            severe?: number;
        };
    };
    models?: {
        primary?: "custom" | "hybrid" | "transformer" | "neural_network" | "lexicon_based";
        fallback?: "custom" | "hybrid" | "transformer" | "neural_network" | "lexicon_based";
        apiKey?: string;
        customEndpoint?: string;
    };
    configId?: string;
    realTime?: {
        enabled?: boolean;
        alertThresholds?: {
            severeToxicity?: boolean;
            criticalIntent?: boolean;
            negativeSpike?: boolean;
        };
        webhookUrl?: string;
    };
}, {
    name?: string;
    description?: string;
    enabled?: boolean;
    processing?: {
        batchSize?: number;
        timeoutMs?: number;
        enablePreprocessing?: boolean;
        removePersonalInfo?: boolean;
        normalizeText?: boolean;
        filterSpam?: boolean;
    };
    analysis?: {
        enableEmotionDetection?: boolean;
        enableToxicityDetection?: boolean;
        enableTopicExtraction?: boolean;
        enableIntentDetection?: boolean;
        enableQualityScoring?: boolean;
        minTextLength?: number;
        maxTextLength?: number;
        supportedLanguages?: string[];
    };
    thresholds?: {
        quality?: {
            minimum?: number;
            good?: number;
        };
        confidence?: {
            minimum?: number;
            high?: number;
        };
        toxicity?: {
            low?: number;
            medium?: number;
            high?: number;
            severe?: number;
        };
    };
    models?: {
        primary?: "custom" | "hybrid" | "transformer" | "neural_network" | "lexicon_based";
        fallback?: "custom" | "hybrid" | "transformer" | "neural_network" | "lexicon_based";
        apiKey?: string;
        customEndpoint?: string;
    };
    configId?: string;
    realTime?: {
        enabled?: boolean;
        alertThresholds?: {
            severeToxicity?: boolean;
            criticalIntent?: boolean;
            negativeSpike?: boolean;
        };
        webhookUrl?: string;
    };
}>;
export type SentimentAnalysisConfig = z.infer<typeof SentimentAnalysisConfigSchema>;
export declare const AnalyzeSentimentRequestSchema: z.ZodObject<{
    texts: z.ZodArray<z.ZodObject<{
        textId: z.ZodString;
        content: z.ZodString;
        sourceType: z.ZodEnum<["comment", "review", "survey_response", "support_ticket", "social_media", "email"]>;
        language: z.ZodOptional<z.ZodString>;
        metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        content?: string;
        metadata?: Record<string, unknown>;
        language?: string;
        sourceType?: "comment" | "email" | "review" | "social_media" | "survey_response" | "support_ticket";
        textId?: string;
    }, {
        content?: string;
        metadata?: Record<string, unknown>;
        language?: string;
        sourceType?: "comment" | "email" | "review" | "social_media" | "survey_response" | "support_ticket";
        textId?: string;
    }>, "many">;
    options: z.ZodDefault<z.ZodObject<{
        includeEmotions: z.ZodDefault<z.ZodBoolean>;
        includeToxicity: z.ZodDefault<z.ZodBoolean>;
        includeTopics: z.ZodDefault<z.ZodBoolean>;
        includeQuality: z.ZodDefault<z.ZodBoolean>;
        modelType: z.ZodOptional<z.ZodEnum<["transformer", "neural_network", "lexicon_based", "hybrid", "custom"]>>;
        realTime: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        modelType?: "custom" | "hybrid" | "transformer" | "neural_network" | "lexicon_based";
        realTime?: boolean;
        includeEmotions?: boolean;
        includeToxicity?: boolean;
        includeTopics?: boolean;
        includeQuality?: boolean;
    }, {
        modelType?: "custom" | "hybrid" | "transformer" | "neural_network" | "lexicon_based";
        realTime?: boolean;
        includeEmotions?: boolean;
        includeToxicity?: boolean;
        includeTopics?: boolean;
        includeQuality?: boolean;
    }>>;
}, "strip", z.ZodTypeAny, {
    options?: {
        modelType?: "custom" | "hybrid" | "transformer" | "neural_network" | "lexicon_based";
        realTime?: boolean;
        includeEmotions?: boolean;
        includeToxicity?: boolean;
        includeTopics?: boolean;
        includeQuality?: boolean;
    };
    texts?: {
        content?: string;
        metadata?: Record<string, unknown>;
        language?: string;
        sourceType?: "comment" | "email" | "review" | "social_media" | "survey_response" | "support_ticket";
        textId?: string;
    }[];
}, {
    options?: {
        modelType?: "custom" | "hybrid" | "transformer" | "neural_network" | "lexicon_based";
        realTime?: boolean;
        includeEmotions?: boolean;
        includeToxicity?: boolean;
        includeTopics?: boolean;
        includeQuality?: boolean;
    };
    texts?: {
        content?: string;
        metadata?: Record<string, unknown>;
        language?: string;
        sourceType?: "comment" | "email" | "review" | "social_media" | "survey_response" | "support_ticket";
        textId?: string;
    }[];
}>;
export declare const SentimentAnalysisResponseSchema: z.ZodObject<{
    analyses: z.ZodArray<z.ZodObject<{
        analysisId: z.ZodString;
        textId: z.ZodString;
        sourceType: z.ZodEnum<["comment", "review", "survey_response", "support_ticket", "social_media", "email"]>;
        originalText: z.ZodString;
        processedText: z.ZodOptional<z.ZodString>;
        language: z.ZodDefault<z.ZodString>;
        analyzedAt: z.ZodDate;
        modelUsed: z.ZodEnum<["transformer", "neural_network", "lexicon_based", "hybrid", "custom"]>;
        modelVersion: z.ZodDefault<z.ZodString>;
        confidence: z.ZodNumber;
        sentiment: z.ZodObject<{
            type: z.ZodEnum<["positive", "neutral", "negative"]>;
            score: z.ZodNumber;
            confidence: z.ZodNumber;
            magnitude: z.ZodNumber;
            subjectivity: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            type?: "positive" | "neutral" | "negative";
            score?: number;
            confidence?: number;
            magnitude?: number;
            subjectivity?: number;
        }, {
            type?: "positive" | "neutral" | "negative";
            score?: number;
            confidence?: number;
            magnitude?: number;
            subjectivity?: number;
        }>;
        emotions: z.ZodObject<{
            primary: z.ZodOptional<z.ZodEnum<["joy", "sadness", "anger", "fear", "surprise", "disgust", "trust", "anticipation"]>>;
            scores: z.ZodDefault<z.ZodRecord<z.ZodEnum<["joy", "sadness", "anger", "fear", "surprise", "disgust", "trust", "anticipation"]>, z.ZodNumber>>;
            confidence: z.ZodNumber;
            mixed: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            mixed?: boolean;
            primary?: "fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation";
            confidence?: number;
            scores?: Partial<Record<"fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation", number>>;
        }, {
            mixed?: boolean;
            primary?: "fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation";
            confidence?: number;
            scores?: Partial<Record<"fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation", number>>;
        }>;
        toxicity: z.ZodObject<{
            level: z.ZodEnum<["none", "low", "medium", "high", "severe"]>;
            score: z.ZodNumber;
            confidence: z.ZodNumber;
            categories: z.ZodDefault<z.ZodObject<{
                harassment: z.ZodDefault<z.ZodNumber>;
                hate_speech: z.ZodDefault<z.ZodNumber>;
                profanity: z.ZodDefault<z.ZodNumber>;
                threats: z.ZodDefault<z.ZodNumber>;
                spam: z.ZodDefault<z.ZodNumber>;
                inappropriate: z.ZodDefault<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                spam?: number;
                inappropriate?: number;
                threats?: number;
                harassment?: number;
                hate_speech?: number;
                profanity?: number;
            }, {
                spam?: number;
                inappropriate?: number;
                threats?: number;
                harassment?: number;
                hate_speech?: number;
                profanity?: number;
            }>>;
            flags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            level?: "low" | "medium" | "high" | "none" | "severe";
            score?: number;
            categories?: {
                spam?: number;
                inappropriate?: number;
                threats?: number;
                harassment?: number;
                hate_speech?: number;
                profanity?: number;
            };
            confidence?: number;
            flags?: string[];
        }, {
            level?: "low" | "medium" | "high" | "none" | "severe";
            score?: number;
            categories?: {
                spam?: number;
                inappropriate?: number;
                threats?: number;
                harassment?: number;
                hate_speech?: number;
                profanity?: number;
            };
            confidence?: number;
            flags?: string[];
        }>;
        topics: z.ZodDefault<z.ZodArray<z.ZodObject<{
            topic: z.ZodString;
            relevance: z.ZodNumber;
            sentiment: z.ZodEnum<["positive", "neutral", "negative"]>;
        }, "strip", z.ZodTypeAny, {
            relevance?: number;
            sentiment?: "positive" | "neutral" | "negative";
            topic?: string;
        }, {
            relevance?: number;
            sentiment?: "positive" | "neutral" | "negative";
            topic?: string;
        }>, "many">>;
        keywords: z.ZodDefault<z.ZodArray<z.ZodObject<{
            keyword: z.ZodString;
            importance: z.ZodNumber;
            sentiment: z.ZodEnum<["positive", "neutral", "negative"]>;
            frequency: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            sentiment?: "positive" | "neutral" | "negative";
            frequency?: number;
            keyword?: string;
            importance?: number;
        }, {
            sentiment?: "positive" | "neutral" | "negative";
            frequency?: number;
            keyword?: string;
            importance?: number;
        }>, "many">>;
        intent: z.ZodOptional<z.ZodObject<{
            category: z.ZodOptional<z.ZodEnum<["question", "complaint", "compliment", "suggestion", "request", "report", "other"]>>;
            confidence: z.ZodNumber;
            urgency: z.ZodDefault<z.ZodEnum<["low", "medium", "high", "critical"]>>;
            actionRequired: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            category?: "other" | "suggestion" | "request" | "report" | "question" | "complaint" | "compliment";
            confidence?: number;
            urgency?: "low" | "medium" | "high" | "critical";
            actionRequired?: boolean;
        }, {
            category?: "other" | "suggestion" | "request" | "report" | "question" | "complaint" | "compliment";
            confidence?: number;
            urgency?: "low" | "medium" | "high" | "critical";
            actionRequired?: boolean;
        }>>;
        quality: z.ZodOptional<z.ZodObject<{
            score: z.ZodNumber;
            readability: z.ZodNumber;
            coherence: z.ZodNumber;
            constructiveness: z.ZodNumber;
            specificity: z.ZodNumber;
            helpfulness: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            score?: number;
            readability?: number;
            specificity?: number;
            coherence?: number;
            constructiveness?: number;
            helpfulness?: number;
        }, {
            score?: number;
            readability?: number;
            specificity?: number;
            coherence?: number;
            constructiveness?: number;
            helpfulness?: number;
        }>>;
        metadata: z.ZodObject<{
            processingTimeMs: z.ZodDefault<z.ZodNumber>;
            textLength: z.ZodDefault<z.ZodNumber>;
            wordCount: z.ZodDefault<z.ZodNumber>;
            sentenceCount: z.ZodDefault<z.ZodNumber>;
            languageDetected: z.ZodOptional<z.ZodString>;
            languageConfidence: z.ZodOptional<z.ZodNumber>;
            preprocessingSteps: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            features: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, "strip", z.ZodTypeAny, {
            sentenceCount?: number;
            wordCount?: number;
            textLength?: number;
            processingTimeMs?: number;
            languageDetected?: string;
            languageConfidence?: number;
            preprocessingSteps?: string[];
            features?: Record<string, unknown>;
        }, {
            sentenceCount?: number;
            wordCount?: number;
            textLength?: number;
            processingTimeMs?: number;
            languageDetected?: string;
            languageConfidence?: number;
            preprocessingSteps?: string[];
            features?: Record<string, unknown>;
        }>;
    }, "strip", z.ZodTypeAny, {
        metadata?: {
            sentenceCount?: number;
            wordCount?: number;
            textLength?: number;
            processingTimeMs?: number;
            languageDetected?: string;
            languageConfidence?: number;
            preprocessingSteps?: string[];
            features?: Record<string, unknown>;
        };
        quality?: {
            score?: number;
            readability?: number;
            specificity?: number;
            coherence?: number;
            constructiveness?: number;
            helpfulness?: number;
        };
        confidence?: number;
        keywords?: {
            sentiment?: "positive" | "neutral" | "negative";
            frequency?: number;
            keyword?: string;
            importance?: number;
        }[];
        topics?: {
            relevance?: number;
            sentiment?: "positive" | "neutral" | "negative";
            topic?: string;
        }[];
        language?: string;
        sourceType?: "comment" | "email" | "review" | "social_media" | "survey_response" | "support_ticket";
        emotions?: {
            mixed?: boolean;
            primary?: "fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation";
            confidence?: number;
            scores?: Partial<Record<"fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation", number>>;
        };
        sentiment?: {
            type?: "positive" | "neutral" | "negative";
            score?: number;
            confidence?: number;
            magnitude?: number;
            subjectivity?: number;
        };
        intent?: {
            category?: "other" | "suggestion" | "request" | "report" | "question" | "complaint" | "compliment";
            confidence?: number;
            urgency?: "low" | "medium" | "high" | "critical";
            actionRequired?: boolean;
        };
        analysisId?: string;
        textId?: string;
        originalText?: string;
        processedText?: string;
        analyzedAt?: Date;
        modelUsed?: "custom" | "hybrid" | "transformer" | "neural_network" | "lexicon_based";
        modelVersion?: string;
        toxicity?: {
            level?: "low" | "medium" | "high" | "none" | "severe";
            score?: number;
            categories?: {
                spam?: number;
                inappropriate?: number;
                threats?: number;
                harassment?: number;
                hate_speech?: number;
                profanity?: number;
            };
            confidence?: number;
            flags?: string[];
        };
    }, {
        metadata?: {
            sentenceCount?: number;
            wordCount?: number;
            textLength?: number;
            processingTimeMs?: number;
            languageDetected?: string;
            languageConfidence?: number;
            preprocessingSteps?: string[];
            features?: Record<string, unknown>;
        };
        quality?: {
            score?: number;
            readability?: number;
            specificity?: number;
            coherence?: number;
            constructiveness?: number;
            helpfulness?: number;
        };
        confidence?: number;
        keywords?: {
            sentiment?: "positive" | "neutral" | "negative";
            frequency?: number;
            keyword?: string;
            importance?: number;
        }[];
        topics?: {
            relevance?: number;
            sentiment?: "positive" | "neutral" | "negative";
            topic?: string;
        }[];
        language?: string;
        sourceType?: "comment" | "email" | "review" | "social_media" | "survey_response" | "support_ticket";
        emotions?: {
            mixed?: boolean;
            primary?: "fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation";
            confidence?: number;
            scores?: Partial<Record<"fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation", number>>;
        };
        sentiment?: {
            type?: "positive" | "neutral" | "negative";
            score?: number;
            confidence?: number;
            magnitude?: number;
            subjectivity?: number;
        };
        intent?: {
            category?: "other" | "suggestion" | "request" | "report" | "question" | "complaint" | "compliment";
            confidence?: number;
            urgency?: "low" | "medium" | "high" | "critical";
            actionRequired?: boolean;
        };
        analysisId?: string;
        textId?: string;
        originalText?: string;
        processedText?: string;
        analyzedAt?: Date;
        modelUsed?: "custom" | "hybrid" | "transformer" | "neural_network" | "lexicon_based";
        modelVersion?: string;
        toxicity?: {
            level?: "low" | "medium" | "high" | "none" | "severe";
            score?: number;
            categories?: {
                spam?: number;
                inappropriate?: number;
                threats?: number;
                harassment?: number;
                hate_speech?: number;
                profanity?: number;
            };
            confidence?: number;
            flags?: string[];
        };
    }>, "many">;
    summary: z.ZodObject<{
        totalProcessed: z.ZodNumber;
        totalErrors: z.ZodNumber;
        averageConfidence: z.ZodNumber;
        processingTimeMs: z.ZodNumber;
        overallSentiment: z.ZodOptional<z.ZodEnum<["positive", "neutral", "negative"]>>;
    }, "strip", z.ZodTypeAny, {
        processingTimeMs?: number;
        averageConfidence?: number;
        totalProcessed?: number;
        totalErrors?: number;
        overallSentiment?: "positive" | "neutral" | "negative";
    }, {
        processingTimeMs?: number;
        averageConfidence?: number;
        totalProcessed?: number;
        totalErrors?: number;
        overallSentiment?: "positive" | "neutral" | "negative";
    }>;
    meta: z.ZodObject<{
        requestId: z.ZodString;
        modelUsed: z.ZodString;
        batchId: z.ZodOptional<z.ZodString>;
        apiVersion: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        requestId?: string;
        modelUsed?: string;
        batchId?: string;
        apiVersion?: string;
    }, {
        requestId?: string;
        modelUsed?: string;
        batchId?: string;
        apiVersion?: string;
    }>;
}, "strip", z.ZodTypeAny, {
    meta?: {
        requestId?: string;
        modelUsed?: string;
        batchId?: string;
        apiVersion?: string;
    };
    summary?: {
        processingTimeMs?: number;
        averageConfidence?: number;
        totalProcessed?: number;
        totalErrors?: number;
        overallSentiment?: "positive" | "neutral" | "negative";
    };
    analyses?: {
        metadata?: {
            sentenceCount?: number;
            wordCount?: number;
            textLength?: number;
            processingTimeMs?: number;
            languageDetected?: string;
            languageConfidence?: number;
            preprocessingSteps?: string[];
            features?: Record<string, unknown>;
        };
        quality?: {
            score?: number;
            readability?: number;
            specificity?: number;
            coherence?: number;
            constructiveness?: number;
            helpfulness?: number;
        };
        confidence?: number;
        keywords?: {
            sentiment?: "positive" | "neutral" | "negative";
            frequency?: number;
            keyword?: string;
            importance?: number;
        }[];
        topics?: {
            relevance?: number;
            sentiment?: "positive" | "neutral" | "negative";
            topic?: string;
        }[];
        language?: string;
        sourceType?: "comment" | "email" | "review" | "social_media" | "survey_response" | "support_ticket";
        emotions?: {
            mixed?: boolean;
            primary?: "fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation";
            confidence?: number;
            scores?: Partial<Record<"fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation", number>>;
        };
        sentiment?: {
            type?: "positive" | "neutral" | "negative";
            score?: number;
            confidence?: number;
            magnitude?: number;
            subjectivity?: number;
        };
        intent?: {
            category?: "other" | "suggestion" | "request" | "report" | "question" | "complaint" | "compliment";
            confidence?: number;
            urgency?: "low" | "medium" | "high" | "critical";
            actionRequired?: boolean;
        };
        analysisId?: string;
        textId?: string;
        originalText?: string;
        processedText?: string;
        analyzedAt?: Date;
        modelUsed?: "custom" | "hybrid" | "transformer" | "neural_network" | "lexicon_based";
        modelVersion?: string;
        toxicity?: {
            level?: "low" | "medium" | "high" | "none" | "severe";
            score?: number;
            categories?: {
                spam?: number;
                inappropriate?: number;
                threats?: number;
                harassment?: number;
                hate_speech?: number;
                profanity?: number;
            };
            confidence?: number;
            flags?: string[];
        };
    }[];
}, {
    meta?: {
        requestId?: string;
        modelUsed?: string;
        batchId?: string;
        apiVersion?: string;
    };
    summary?: {
        processingTimeMs?: number;
        averageConfidence?: number;
        totalProcessed?: number;
        totalErrors?: number;
        overallSentiment?: "positive" | "neutral" | "negative";
    };
    analyses?: {
        metadata?: {
            sentenceCount?: number;
            wordCount?: number;
            textLength?: number;
            processingTimeMs?: number;
            languageDetected?: string;
            languageConfidence?: number;
            preprocessingSteps?: string[];
            features?: Record<string, unknown>;
        };
        quality?: {
            score?: number;
            readability?: number;
            specificity?: number;
            coherence?: number;
            constructiveness?: number;
            helpfulness?: number;
        };
        confidence?: number;
        keywords?: {
            sentiment?: "positive" | "neutral" | "negative";
            frequency?: number;
            keyword?: string;
            importance?: number;
        }[];
        topics?: {
            relevance?: number;
            sentiment?: "positive" | "neutral" | "negative";
            topic?: string;
        }[];
        language?: string;
        sourceType?: "comment" | "email" | "review" | "social_media" | "survey_response" | "support_ticket";
        emotions?: {
            mixed?: boolean;
            primary?: "fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation";
            confidence?: number;
            scores?: Partial<Record<"fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation", number>>;
        };
        sentiment?: {
            type?: "positive" | "neutral" | "negative";
            score?: number;
            confidence?: number;
            magnitude?: number;
            subjectivity?: number;
        };
        intent?: {
            category?: "other" | "suggestion" | "request" | "report" | "question" | "complaint" | "compliment";
            confidence?: number;
            urgency?: "low" | "medium" | "high" | "critical";
            actionRequired?: boolean;
        };
        analysisId?: string;
        textId?: string;
        originalText?: string;
        processedText?: string;
        analyzedAt?: Date;
        modelUsed?: "custom" | "hybrid" | "transformer" | "neural_network" | "lexicon_based";
        modelVersion?: string;
        toxicity?: {
            level?: "low" | "medium" | "high" | "none" | "severe";
            score?: number;
            categories?: {
                spam?: number;
                inappropriate?: number;
                threats?: number;
                harassment?: number;
                hate_speech?: number;
                profanity?: number;
            };
            confidence?: number;
            flags?: string[];
        };
    }[];
}>;
export type AnalyzeSentimentRequest = z.infer<typeof AnalyzeSentimentRequestSchema>;
export type SentimentAnalysisResponse = z.infer<typeof SentimentAnalysisResponseSchema>;
export declare export declare export declare export interface SentimentSystemConfig {
    enabledModels: AnalysisModelType[];
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