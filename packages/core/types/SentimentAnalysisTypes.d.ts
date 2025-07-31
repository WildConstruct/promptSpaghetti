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
    sentiment: z.ZodObject<{,
        type: z.ZodEnum<["positive", "neutral", "negative"]>;
        score: z.ZodNumber;
        confidence: z.ZodNumber;
        magnitude: z.ZodNumber;
        subjectivity: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        type: "positive" | "neutral" | "negative";
        score: number;
        confidence: number;
        magnitude: number;
        subjectivity: number;
    }, {
        type: "positive" | "neutral" | "negative";
        score: number;
        confidence: number;
        magnitude: number;
        subjectivity: number;
    }>;
    emotions: z.ZodObject<{,
        primary: z.ZodOptional<z.ZodEnum<["joy", "sadness", "anger", "fear", "surprise", "disgust", "trust", "anticipation"]>>;
        scores: z.ZodDefault<z.ZodRecord<z.ZodEnum<["joy", "sadness", "anger", "fear", "surprise", "disgust", "trust", "anticipation"]>, z.ZodNumber>>;
        confidence: z.ZodNumber;
        mixed: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        mixed: boolean;
        confidence: number;
        scores: Partial<Record<"fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation", number>>;
        primary?: "fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation" | undefined;
    }, {
        confidence: number;
        mixed?: boolean | undefined;
        primary?: "fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation" | undefined;
        scores?: Partial<Record<"fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation", number>> | undefined;
    }>;
    toxicity: z.ZodObject<{,
        level: z.ZodEnum<["none", "low", "medium", "high", "severe"]>;
        score: z.ZodNumber;
        confidence: z.ZodNumber;
        categories: z.ZodDefault<z.ZodObject<{,
            harassment: z.ZodDefault<z.ZodNumber>;
            hate_speech: z.ZodDefault<z.ZodNumber>;
            profanity: z.ZodDefault<z.ZodNumber>;
            threats: z.ZodDefault<z.ZodNumber>;
            spam: z.ZodDefault<z.ZodNumber>;
            inappropriate: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            spam: number;
            inappropriate: number;
            threats: number;
            harassment: number;
            hate_speech: number;
            profanity: number;
        }, {
            spam?: number | undefined;
            inappropriate?: number | undefined;
            threats?: number | undefined;
            harassment?: number | undefined;
            hate_speech?: number | undefined;
            profanity?: number | undefined;
        }>>;
        flags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        level: "low" | "medium" | "high" | "none" | "severe";
        score: number;
        categories: {
            spam: number;
            inappropriate: number;
            threats: number;
            harassment: number;
            hate_speech: number;
            profanity: number;
        };
        confidence: number;
        flags: string[];
    }, {
        level: "low" | "medium" | "high" | "none" | "severe";
        score: number;
        confidence: number;
        categories?: {
            spam?: number | undefined;
            inappropriate?: number | undefined;
            threats?: number | undefined;
            harassment?: number | undefined;
            hate_speech?: number | undefined;
            profanity?: number | undefined;
        } | undefined;
        flags?: string[] | undefined;
    }>;
    topics: z.ZodDefault<z.ZodArray<z.ZodObject<{,
        topic: z.ZodString;
        relevance: z.ZodNumber;
        sentiment: z.ZodEnum<["positive", "neutral", "negative"]>;
    }, "strip", z.ZodTypeAny, {
        relevance: number;
        sentiment: "positive" | "neutral" | "negative";
        topic: string;
    }, {
        relevance: number;
        sentiment: "positive" | "neutral" | "negative";
        topic: string;
    }>, "many">>;
    keywords: z.ZodDefault<z.ZodArray<z.ZodObject<{,
        keyword: z.ZodString;
        importance: z.ZodNumber;
        sentiment: z.ZodEnum<["positive", "neutral", "negative"]>;
        frequency: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        frequency: number;
        sentiment: "positive" | "neutral" | "negative";
        keyword: string;
        importance: number;
    }, {
        frequency: number;
        sentiment: "positive" | "neutral" | "negative";
        keyword: string;
        importance: number;
    }>, "many">>;
    intent: z.ZodOptional<z.ZodObject<{,
        category: z.ZodOptional<z.ZodEnum<["question", "complaint", "compliment", "suggestion", "request", "report", "other"]>>;
        confidence: z.ZodNumber;
        urgency: z.ZodDefault<z.ZodEnum<["low", "medium", "high", "critical"]>>;
        actionRequired: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        confidence: number;
        urgency: "low" | "medium" | "high" | "critical";
        actionRequired: boolean;
        category?: "other" | "suggestion" | "request" | "report" | "question" | "complaint" | "compliment" | undefined;
    }, {
        confidence: number;
        category?: "other" | "suggestion" | "request" | "report" | "question" | "complaint" | "compliment" | undefined;
        urgency?: "low" | "medium" | "high" | "critical" | undefined;
        actionRequired?: boolean | undefined;
    }>>;
    quality: z.ZodOptional<z.ZodObject<{,
        score: z.ZodNumber;
        readability: z.ZodNumber;
        coherence: z.ZodNumber;
        constructiveness: z.ZodNumber;
        specificity: z.ZodNumber;
        helpfulness: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        score: number;
        readability: number;
        specificity: number;
        coherence: number;
        constructiveness: number;
        helpfulness: number;
    }, {
        score: number;
        readability: number;
        specificity: number;
        coherence: number;
        constructiveness: number;
        helpfulness: number;
    }>>;
    metadata: z.ZodObject<{,
        processingTimeMs: z.ZodDefault<z.ZodNumber>;
        textLength: z.ZodDefault<z.ZodNumber>;
        wordCount: z.ZodDefault<z.ZodNumber>;
        sentenceCount: z.ZodDefault<z.ZodNumber>;
        languageDetected: z.ZodOptional<z.ZodString>;
        languageConfidence: z.ZodOptional<z.ZodNumber>;
        preprocessingSteps: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        features: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        wordCount: number;
        textLength: number;
        processingTimeMs: number;
        sentenceCount: number;
        preprocessingSteps: string[];
        features: Record<string, unknown>;
        languageDetected?: string | undefined;
        languageConfidence?: number | undefined;
    }, {
        wordCount?: number | undefined;
        textLength?: number | undefined;
        processingTimeMs?: number | undefined;
        sentenceCount?: number | undefined;
        languageDetected?: string | undefined;
        languageConfidence?: number | undefined;
        preprocessingSteps?: string[] | undefined;
        features?: Record<string, unknown> | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    metadata: {
        wordCount: number;
        textLength: number;
        processingTimeMs: number;
        sentenceCount: number;
        preprocessingSteps: string[];
        features: Record<string, unknown>;
        languageDetected?: string | undefined;
        languageConfidence?: number | undefined;
    };
    keywords: {
        frequency: number;
        sentiment: "positive" | "neutral" | "negative";
        keyword: string;
        importance: number;
    }[];
    confidence: number;
    language: string;
    sourceType: "comment" | "email" | "review" | "social_media" | "survey_response" | "support_ticket";
    emotions: {
        mixed: boolean;
        confidence: number;
        scores: Partial<Record<"fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation", number>>;
        primary?: "fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation" | undefined;
    };
    sentiment: {
        type: "positive" | "neutral" | "negative";
        score: number;
        confidence: number;
        magnitude: number;
        subjectivity: number;
    };
    topics: {
        relevance: number;
        sentiment: "positive" | "neutral" | "negative";
        topic: string;
    }[];
    analysisId: string;
    textId: string;
    originalText: string;
    analyzedAt: Date;
    modelUsed: "custom" | "hybrid" | "transformer" | "neural_network" | "lexicon_based";
    modelVersion: string;
    toxicity: {
        level: "low" | "medium" | "high" | "none" | "severe";
        score: number;
        categories: {
            spam: number;
            inappropriate: number;
            threats: number;
            harassment: number;
            hate_speech: number;
            profanity: number;
        };
        confidence: number;
        flags: string[];
    };
    quality?: {
        score: number;
        readability: number;
        specificity: number;
        coherence: number;
        constructiveness: number;
        helpfulness: number;
    } | undefined;
    intent?: {
        confidence: number;
        urgency: "low" | "medium" | "high" | "critical";
        actionRequired: boolean;
        category?: "other" | "suggestion" | "request" | "report" | "question" | "complaint" | "compliment" | undefined;
    } | undefined;
    processedText?: string | undefined;
}, {
    metadata: {
        wordCount?: number | undefined;
        textLength?: number | undefined;
        processingTimeMs?: number | undefined;
        sentenceCount?: number | undefined;
        languageDetected?: string | undefined;
        languageConfidence?: number | undefined;
        preprocessingSteps?: string[] | undefined;
        features?: Record<string, unknown> | undefined;
    };
    confidence: number;
    sourceType: "comment" | "email" | "review" | "social_media" | "survey_response" | "support_ticket";
    emotions: {
        confidence: number;
        mixed?: boolean | undefined;
        primary?: "fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation" | undefined;
        scores?: Partial<Record<"fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation", number>> | undefined;
    };
    sentiment: {
        type: "positive" | "neutral" | "negative";
        score: number;
        confidence: number;
        magnitude: number;
        subjectivity: number;
    };
    analysisId: string;
    textId: string;
    originalText: string;
    analyzedAt: Date;
    modelUsed: "custom" | "hybrid" | "transformer" | "neural_network" | "lexicon_based";
    toxicity: {
        level: "low" | "medium" | "high" | "none" | "severe";
        score: number;
        confidence: number;
        categories?: {
            spam?: number | undefined;
            inappropriate?: number | undefined;
            threats?: number | undefined;
            harassment?: number | undefined;
            hate_speech?: number | undefined;
            profanity?: number | undefined;
        } | undefined;
        flags?: string[] | undefined;
    };
    quality?: {
        score: number;
        readability: number;
        specificity: number;
        coherence: number;
        constructiveness: number;
        helpfulness: number;
    } | undefined;
    keywords?: {
        frequency: number;
        sentiment: "positive" | "neutral" | "negative";
        keyword: string;
        importance: number;
    }[] | undefined;
    language?: string | undefined;
    topics?: {
        relevance: number;
        sentiment: "positive" | "neutral" | "negative";
        topic: string;
    }[] | undefined;
    intent?: {
        confidence: number;
        category?: "other" | "suggestion" | "request" | "report" | "question" | "complaint" | "compliment" | undefined;
        urgency?: "low" | "medium" | "high" | "critical" | undefined;
        actionRequired?: boolean | undefined;
    } | undefined;
    processedText?: string | undefined;
    modelVersion?: string | undefined;
}>;
export type SentimentAnalysis = z.infer<typeof SentimentAnalysisSchema>;
export declare const SentimentAnalyticsSchema: z.ZodObject<{
    resourceId: z.ZodString;
    resourceType: z.ZodString;
    timeRange: z.ZodObject<{,
        start: z.ZodDate;
        end: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        start: Date;
        end: Date;
    }, {
        start: Date;
        end: Date;
    }>;
    totalAnalyses: z.ZodDefault<z.ZodNumber>;
    sentimentDistribution: z.ZodObject<{,
        positive: z.ZodObject<{,
            count: z.ZodDefault<z.ZodNumber>;
            percentage: z.ZodDefault<z.ZodNumber>;
            averageScore: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            count: number;
            percentage: number;
            averageScore: number;
        }, {
            count?: number | undefined;
            percentage?: number | undefined;
            averageScore?: number | undefined;
        }>;
        neutral: z.ZodObject<{,
            count: z.ZodDefault<z.ZodNumber>;
            percentage: z.ZodDefault<z.ZodNumber>;
            averageScore: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            count: number;
            percentage: number;
            averageScore: number;
        }, {
            count?: number | undefined;
            percentage?: number | undefined;
            averageScore?: number | undefined;
        }>;
        negative: z.ZodObject<{,
            count: z.ZodDefault<z.ZodNumber>;
            percentage: z.ZodDefault<z.ZodNumber>;
            averageScore: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            count: number;
            percentage: number;
            averageScore: number;
        }, {
            count?: number | undefined;
            percentage?: number | undefined;
            averageScore?: number | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        positive: {
            count: number;
            percentage: number;
            averageScore: number;
        };
        neutral: {
            count: number;
            percentage: number;
            averageScore: number;
        };
        negative: {
            count: number;
            percentage: number;
            averageScore: number;
        };
    }, {
        positive: {
            count?: number | undefined;
            percentage?: number | undefined;
            averageScore?: number | undefined;
        };
        neutral: {
            count?: number | undefined;
            percentage?: number | undefined;
            averageScore?: number | undefined;
        };
        negative: {
            count?: number | undefined;
            percentage?: number | undefined;
            averageScore?: number | undefined;
        };
    }>;
    emotionAnalytics: z.ZodObject<{,
        dominant: z.ZodOptional<z.ZodEnum<["joy", "sadness", "anger", "fear", "surprise", "disgust", "trust", "anticipation"]>>;
        distribution: z.ZodDefault<z.ZodRecord<z.ZodEnum<["joy", "sadness", "anger", "fear", "surprise", "disgust", "trust", "anticipation"]>, z.ZodNumber>>;
        averageScores: z.ZodDefault<z.ZodRecord<z.ZodEnum<["joy", "sadness", "anger", "fear", "surprise", "disgust", "trust", "anticipation"]>, z.ZodNumber>>;
        mixedEmotionRate: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        distribution: Partial<Record<"fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation", number>>;
        averageScores: Partial<Record<"fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation", number>>;
        mixedEmotionRate: number;
        dominant?: "fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation" | undefined;
    }, {
        distribution?: Partial<Record<"fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation", number>> | undefined;
        dominant?: "fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation" | undefined;
        averageScores?: Partial<Record<"fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation", number>> | undefined;
        mixedEmotionRate?: number | undefined;
    }>;
    toxicityAnalytics: z.ZodObject<{,
        overallLevel: z.ZodEnum<["none", "low", "medium", "high", "severe"]>;
        distribution: z.ZodObject<{,
            none: z.ZodDefault<z.ZodNumber>;
            low: z.ZodDefault<z.ZodNumber>;
            medium: z.ZodDefault<z.ZodNumber>;
            high: z.ZodDefault<z.ZodNumber>;
            severe: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            low: number;
            medium: number;
            high: number;
            none: number;
            severe: number;
        }, {
            low?: number | undefined;
            medium?: number | undefined;
            high?: number | undefined;
            none?: number | undefined;
            severe?: number | undefined;
        }>;
        categories: z.ZodObject<{,
            harassment: z.ZodDefault<z.ZodNumber>;
            hate_speech: z.ZodDefault<z.ZodNumber>;
            profanity: z.ZodDefault<z.ZodNumber>;
            threats: z.ZodDefault<z.ZodNumber>;
            spam: z.ZodDefault<z.ZodNumber>;
            inappropriate: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            spam: number;
            inappropriate: number;
            threats: number;
            harassment: number;
            hate_speech: number;
            profanity: number;
        }, {
            spam?: number | undefined;
            inappropriate?: number | undefined;
            threats?: number | undefined;
            harassment?: number | undefined;
            hate_speech?: number | undefined;
            profanity?: number | undefined;
        }>;
        actionRequired: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        categories: {
            spam: number;
            inappropriate: number;
            threats: number;
            harassment: number;
            hate_speech: number;
            profanity: number;
        };
        distribution: {
            low: number;
            medium: number;
            high: number;
            none: number;
            severe: number;
        };
        actionRequired: number;
        overallLevel: "low" | "medium" | "high" | "none" | "severe"
  }, {
        categories: {
            spam?: number | undefined;
            inappropriate?: number | undefined;
            threats?: number | undefined;
            harassment?: number | undefined;
            hate_speech?: number | undefined;
            profanity?: number | undefined;
        };
        distribution: {
            low?: number | undefined;
            medium?: number | undefined;
            high?: number | undefined;
            none?: number | undefined;
            severe?: number | undefined;
        };
        overallLevel: "low" | "medium" | "high" | "none" | "severe";
        actionRequired?: number | undefined;
    }>;
    trends: z.ZodObject<{,
        sentimentTrend: z.ZodDefault<z.ZodEnum<["improving", "stable", "declining"]>>;
        sentimentOverTime: z.ZodDefault<z.ZodArray<z.ZodObject<{,
            timestamp: z.ZodDate;
            positive: z.ZodNumber;
            neutral: z.ZodNumber;
            negative: z.ZodNumber;
            averageScore: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            timestamp: Date;
            positive: number;
            neutral: number;
            negative: number;
            averageScore: number;
        }, {
            timestamp: Date;
            positive: number;
            neutral: number;
            negative: number;
            averageScore: number;
        }>, "many">>;
        emotionTrends: z.ZodDefault<z.ZodArray<z.ZodObject<{,
            timestamp: z.ZodDate;
            dominantEmotion: z.ZodOptional<z.ZodEnum<["joy", "sadness", "anger", "fear", "surprise", "disgust", "trust", "anticipation"]>>;
            emotionScores: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodNumber>>;
        }, "strip", z.ZodTypeAny, {
            timestamp: Date;
            emotionScores: Record<string, number>;
            dominantEmotion?: "fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation" | undefined;
        }, {
            timestamp: Date;
            dominantEmotion?: "fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation" | undefined;
            emotionScores?: Record<string, number> | undefined;
        }>, "many">>;
        toxicityTrend: z.ZodDefault<z.ZodEnum<["improving", "stable", "worsening"]>>;
        qualityTrend: z.ZodDefault<z.ZodEnum<["improving", "stable", "declining"]>>;
    }, "strip", z.ZodTypeAny, {
        sentimentTrend: "stable" | "improving" | "declining";
        sentimentOverTime: {
            timestamp: Date;
            positive: number;
            neutral: number;
            negative: number;
            averageScore: number;
        }[];
        emotionTrends: {
            timestamp: Date;
            emotionScores: Record<string, number>;
            dominantEmotion?: "fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation" | undefined;
        }[];
        toxicityTrend: "stable" | "improving" | "worsening";
        qualityTrend: "stable" | "improving" | "declining"
  }, {
        sentimentTrend?: "stable" | "improving" | "declining" | undefined;
        sentimentOverTime?: {
            timestamp: Date;
            positive: number;
            neutral: number;
            negative: number;
            averageScore: number;
        }[] | undefined;
        emotionTrends?: {
            timestamp: Date;
            dominantEmotion?: "fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation" | undefined;
            emotionScores?: Record<string, number> | undefined;
        }[] | undefined;
        toxicityTrend?: "stable" | "improving" | "worsening" | undefined;
        qualityTrend?: "stable" | "improving" | "declining" | undefined;
    }>;
    insights: z.ZodObject<{,
        topPositiveKeywords: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        topNegativeKeywords: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        emergingTopics: z.ZodDefault<z.ZodArray<z.ZodObject<{,
            topic: z.ZodString;
            sentiment: z.ZodEnum<["positive", "neutral", "negative"]>;
            growth: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            sentiment: "positive" | "neutral" | "negative";
            topic: string;
            growth: number;
        }, {
            sentiment: "positive" | "neutral" | "negative";
            topic: string;
            growth: number;
        }>, "many">>;
        qualityMetrics: z.ZodObject<{,
            averageReadability: z.ZodDefault<z.ZodNumber>;
            averageConstructiveness: z.ZodDefault<z.ZodNumber>;
            averageHelpfulness: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            averageReadability: number;
            averageConstructiveness: number;
            averageHelpfulness: number;
        }, {
            averageReadability?: number | undefined;
            averageConstructiveness?: number | undefined;
            averageHelpfulness?: number | undefined;
        }>;
        recommendations: z.ZodDefault<z.ZodArray<z.ZodObject<{,
            type: z.ZodEnum<["improve_sentiment", "address_concerns", "enhance_moderation", "boost_engagement", "quality_improvement"]>;
            priority: z.ZodEnum<["low", "medium", "high", "critical"]>;
            description: z.ZodString;
            expectedImpact: z.ZodEnum<["low", "medium", "high"]>;
        }, "strip", z.ZodTypeAny, {
            description: string;
            priority: "low" | "medium" | "high" | "critical";
            type: "quality_improvement" | "improve_sentiment" | "address_concerns" | "enhance_moderation" | "boost_engagement";
            expectedImpact: "low" | "medium" | "high"
  }, {
            description: string;
            priority: "low" | "medium" | "high" | "critical";
            type: "quality_improvement" | "improve_sentiment" | "address_concerns" | "enhance_moderation" | "boost_engagement";
            expectedImpact: "low" | "medium" | "high"
  }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        recommendations: {
            description: string;
            priority: "low" | "medium" | "high" | "critical";
            type: "quality_improvement" | "improve_sentiment" | "address_concerns" | "enhance_moderation" | "boost_engagement";
            expectedImpact: "low" | "medium" | "high"
  }[];
        qualityMetrics: {
            averageReadability: number;
            averageConstructiveness: number;
            averageHelpfulness: number;
        };
        topPositiveKeywords: string[];
        topNegativeKeywords: string[];
        emergingTopics: {
            sentiment: "positive" | "neutral" | "negative";
            topic: string;
            growth: number;
        }[];
    }, {
        qualityMetrics: {
            averageReadability?: number | undefined;
            averageConstructiveness?: number | undefined;
            averageHelpfulness?: number | undefined;
        };
        recommendations?: {
            description: string;
            priority: "low" | "medium" | "high" | "critical";
            type: "quality_improvement" | "improve_sentiment" | "address_concerns" | "enhance_moderation" | "boost_engagement";
            expectedImpact: "low" | "medium" | "high"
  }[] | undefined;
        topPositiveKeywords?: string[] | undefined;
        topNegativeKeywords?: string[] | undefined;
        emergingTopics?: {
            sentiment: "positive" | "neutral" | "negative";
            topic: string;
            growth: number;
        }[] | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    trends: {
        sentimentTrend: "stable" | "improving" | "declining";
        sentimentOverTime: {
            timestamp: Date;
            positive: number;
            neutral: number;
            negative: number;
            averageScore: number;
        }[];
        emotionTrends: {
            timestamp: Date;
            emotionScores: Record<string, number>;
            dominantEmotion?: "fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation" | undefined;
        }[];
        toxicityTrend: "stable" | "improving" | "worsening";
        qualityTrend: "stable" | "improving" | "declining"
  };
    insights: {
        recommendations: {
            description: string;
            priority: "low" | "medium" | "high" | "critical";
            type: "quality_improvement" | "improve_sentiment" | "address_concerns" | "enhance_moderation" | "boost_engagement";
            expectedImpact: "low" | "medium" | "high"
  }[];
        qualityMetrics: {
            averageReadability: number;
            averageConstructiveness: number;
            averageHelpfulness: number;
        };
        topPositiveKeywords: string[];
        topNegativeKeywords: string[];
        emergingTopics: {
            sentiment: "positive" | "neutral" | "negative";
            topic: string;
            growth: number;
        }[];
    };
    resourceId: string;
    resourceType: string;
    timeRange: {
        start: Date;
        end: Date;
    };
    totalAnalyses: number;
    sentimentDistribution: {
        positive: {
            count: number;
            percentage: number;
            averageScore: number;
        };
        neutral: {
            count: number;
            percentage: number;
            averageScore: number;
        };
        negative: {
            count: number;
            percentage: number;
            averageScore: number;
        };
    };
    emotionAnalytics: {
        distribution: Partial<Record<"fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation", number>>;
        averageScores: Partial<Record<"fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation", number>>;
        mixedEmotionRate: number;
        dominant?: "fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation" | undefined;
    };
    toxicityAnalytics: {
        categories: {
            spam: number;
            inappropriate: number;
            threats: number;
            harassment: number;
            hate_speech: number;
            profanity: number;
        };
        distribution: {
            low: number;
            medium: number;
            high: number;
            none: number;
            severe: number;
        };
        actionRequired: number;
        overallLevel: "low" | "medium" | "high" | "none" | "severe"
  };
}, {
    trends: {
        sentimentTrend?: "stable" | "improving" | "declining" | undefined;
        sentimentOverTime?: {
            timestamp: Date;
            positive: number;
            neutral: number;
            negative: number;
            averageScore: number;
        }[] | undefined;
        emotionTrends?: {
            timestamp: Date;
            dominantEmotion?: "fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation" | undefined;
            emotionScores?: Record<string, number> | undefined;
        }[] | undefined;
        toxicityTrend?: "stable" | "improving" | "worsening" | undefined;
        qualityTrend?: "stable" | "improving" | "declining" | undefined;
    };
    insights: {
        qualityMetrics: {
            averageReadability?: number | undefined;
            averageConstructiveness?: number | undefined;
            averageHelpfulness?: number | undefined;
        };
        recommendations?: {
            description: string;
            priority: "low" | "medium" | "high" | "critical";
            type: "quality_improvement" | "improve_sentiment" | "address_concerns" | "enhance_moderation" | "boost_engagement";
            expectedImpact: "low" | "medium" | "high"
  }[] | undefined;
        topPositiveKeywords?: string[] | undefined;
        topNegativeKeywords?: string[] | undefined;
        emergingTopics?: {
            sentiment: "positive" | "neutral" | "negative";
            topic: string;
            growth: number;
        }[] | undefined;
    };
    resourceId: string;
    resourceType: string;
    timeRange: {
        start: Date;
        end: Date;
    };
    sentimentDistribution: {
        positive: {
            count?: number | undefined;
            percentage?: number | undefined;
            averageScore?: number | undefined;
        };
        neutral: {
            count?: number | undefined;
            percentage?: number | undefined;
            averageScore?: number | undefined;
        };
        negative: {
            count?: number | undefined;
            percentage?: number | undefined;
            averageScore?: number | undefined;
        };
    };
    emotionAnalytics: {
        distribution?: Partial<Record<"fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation", number>> | undefined;
        dominant?: "fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation" | undefined;
        averageScores?: Partial<Record<"fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation", number>> | undefined;
        mixedEmotionRate?: number | undefined;
    };
    toxicityAnalytics: {
        categories: {
            spam?: number | undefined;
            inappropriate?: number | undefined;
            threats?: number | undefined;
            harassment?: number | undefined;
            hate_speech?: number | undefined;
            profanity?: number | undefined;
        };
        distribution: {
            low?: number | undefined;
            medium?: number | undefined;
            high?: number | undefined;
            none?: number | undefined;
            severe?: number | undefined;
        };
        overallLevel: "low" | "medium" | "high" | "none" | "severe";
        actionRequired?: number | undefined;
    };
    totalAnalyses?: number | undefined;
}>;
export type SentimentAnalytics = z.infer<typeof SentimentAnalyticsSchema>;
export declare const SentimentAnalysisConfigSchema: z.ZodObject<{
    configId: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    enabled: z.ZodDefault<z.ZodBoolean>;
    models: z.ZodObject<{,
        primary: z.ZodEnum<["transformer", "neural_network", "lexicon_based", "hybrid", "custom"]>;
        fallback: z.ZodOptional<z.ZodEnum<["transformer", "neural_network", "lexicon_based", "hybrid", "custom"]>>;
        customEndpoint: z.ZodOptional<z.ZodString>;
        apiKey: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        primary: "custom" | "hybrid" | "transformer" | "neural_network" | "lexicon_based";
        fallback?: "custom" | "hybrid" | "transformer" | "neural_network" | "lexicon_based" | undefined;
        apiKey?: string | undefined;
        customEndpoint?: string | undefined;
    }, {
        primary: "custom" | "hybrid" | "transformer" | "neural_network" | "lexicon_based";
        fallback?: "custom" | "hybrid" | "transformer" | "neural_network" | "lexicon_based" | undefined;
        apiKey?: string | undefined;
        customEndpoint?: string | undefined;
    }>;
    analysis: z.ZodObject<{,
        enableEmotionDetection: z.ZodDefault<z.ZodBoolean>;
        enableToxicityDetection: z.ZodDefault<z.ZodBoolean>;
        enableTopicExtraction: z.ZodDefault<z.ZodBoolean>;
        enableIntentDetection: z.ZodDefault<z.ZodBoolean>;
        enableQualityScoring: z.ZodDefault<z.ZodBoolean>;
        minTextLength: z.ZodDefault<z.ZodNumber>;
        maxTextLength: z.ZodDefault<z.ZodNumber>;
        supportedLanguages: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        enableEmotionDetection: boolean;
        enableToxicityDetection: boolean;
        enableTopicExtraction: boolean;
        enableIntentDetection: boolean;
        enableQualityScoring: boolean;
        minTextLength: number;
        maxTextLength: number;
        supportedLanguages: string[];
    }, {
        enableEmotionDetection?: boolean | undefined;
        enableToxicityDetection?: boolean | undefined;
        enableTopicExtraction?: boolean | undefined;
        enableIntentDetection?: boolean | undefined;
        enableQualityScoring?: boolean | undefined;
        minTextLength?: number | undefined;
        maxTextLength?: number | undefined;
        supportedLanguages?: string[] | undefined;
    }>;
    processing: z.ZodObject<{,
        enablePreprocessing: z.ZodDefault<z.ZodBoolean>;
        removePersonalInfo: z.ZodDefault<z.ZodBoolean>;
        normalizeText: z.ZodDefault<z.ZodBoolean>;
        filterSpam: z.ZodDefault<z.ZodBoolean>;
        batchSize: z.ZodDefault<z.ZodNumber>;
        timeoutMs: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        batchSize: number;
        timeoutMs: number;
        enablePreprocessing: boolean;
        removePersonalInfo: boolean;
        normalizeText: boolean;
        filterSpam: boolean;
    }, {
        batchSize?: number | undefined;
        timeoutMs?: number | undefined;
        enablePreprocessing?: boolean | undefined;
        removePersonalInfo?: boolean | undefined;
        normalizeText?: boolean | undefined;
        filterSpam?: boolean | undefined;
    }>;
    thresholds: z.ZodObject<{,
        toxicity: z.ZodObject<{,
            low: z.ZodDefault<z.ZodNumber>;
            medium: z.ZodDefault<z.ZodNumber>;
            high: z.ZodDefault<z.ZodNumber>;
            severe: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            low: number;
            medium: number;
            high: number;
            severe: number;
        }, {
            low?: number | undefined;
            medium?: number | undefined;
            high?: number | undefined;
            severe?: number | undefined;
        }>;
        confidence: z.ZodObject<{,
            minimum: z.ZodDefault<z.ZodNumber>;
            high: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            minimum: number;
            high: number;
        }, {
            minimum?: number | undefined;
            high?: number | undefined;
        }>;
        quality: z.ZodObject<{,
            minimum: z.ZodDefault<z.ZodNumber>;
            good: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            minimum: number;
            good: number;
        }, {
            minimum?: number | undefined;
            good?: number | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        quality: {
            minimum: number;
            good: number;
        };
        confidence: {
            minimum: number;
            high: number;
        };
        toxicity: {
            low: number;
            medium: number;
            high: number;
            severe: number;
        };
    }, {
        quality: {
            minimum?: number | undefined;
            good?: number | undefined;
        };
        confidence: {
            minimum?: number | undefined;
            high?: number | undefined;
        };
        toxicity: {
            low?: number | undefined;
            medium?: number | undefined;
            high?: number | undefined;
            severe?: number | undefined;
        };
    }>;
    realTime: z.ZodObject<{,
        enabled: z.ZodDefault<z.ZodBoolean>;
        webhookUrl: z.ZodOptional<z.ZodString>;
        alertThresholds: z.ZodObject<{,
            severeToxicity: z.ZodDefault<z.ZodBoolean>;
            criticalIntent: z.ZodDefault<z.ZodBoolean>;
            negativeSpike: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            severeToxicity: boolean;
            criticalIntent: boolean;
            negativeSpike: boolean;
        }, {
            severeToxicity?: boolean | undefined;
            criticalIntent?: boolean | undefined;
            negativeSpike?: boolean | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        alertThresholds: {
            severeToxicity: boolean;
            criticalIntent: boolean;
            negativeSpike: boolean;
        };
        webhookUrl?: string | undefined;
    }, {
        alertThresholds: {
            severeToxicity?: boolean | undefined;
            criticalIntent?: boolean | undefined;
            negativeSpike?: boolean | undefined;
        };
        enabled?: boolean | undefined;
        webhookUrl?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    name: string;
    description: string;
    enabled: boolean;
    processing: {
        batchSize: number;
        timeoutMs: number;
        enablePreprocessing: boolean;
        removePersonalInfo: boolean;
        normalizeText: boolean;
        filterSpam: boolean;
    };
    analysis: {
        enableEmotionDetection: boolean;
        enableToxicityDetection: boolean;
        enableTopicExtraction: boolean;
        enableIntentDetection: boolean;
        enableQualityScoring: boolean;
        minTextLength: number;
        maxTextLength: number;
        supportedLanguages: string[];
    };
    thresholds: {
        quality: {
            minimum: number;
            good: number;
        };
        confidence: {
            minimum: number;
            high: number;
        };
        toxicity: {
            low: number;
            medium: number;
            high: number;
            severe: number;
        };
    };
    models: {
        primary: "custom" | "hybrid" | "transformer" | "neural_network" | "lexicon_based";
        fallback?: "custom" | "hybrid" | "transformer" | "neural_network" | "lexicon_based" | undefined;
        apiKey?: string | undefined;
        customEndpoint?: string | undefined;
    };
    configId: string;
    realTime: {
        enabled: boolean;
        alertThresholds: {
            severeToxicity: boolean;
            criticalIntent: boolean;
            negativeSpike: boolean;
        };
        webhookUrl?: string | undefined;
    };
}, {
    name: string;
    description: string;
    processing: {
        batchSize?: number | undefined;
        timeoutMs?: number | undefined;
        enablePreprocessing?: boolean | undefined;
        removePersonalInfo?: boolean | undefined;
        normalizeText?: boolean | undefined;
        filterSpam?: boolean | undefined;
    };
    analysis: {
        enableEmotionDetection?: boolean | undefined;
        enableToxicityDetection?: boolean | undefined;
        enableTopicExtraction?: boolean | undefined;
        enableIntentDetection?: boolean | undefined;
        enableQualityScoring?: boolean | undefined;
        minTextLength?: number | undefined;
        maxTextLength?: number | undefined;
        supportedLanguages?: string[] | undefined;
    };
    thresholds: {
        quality: {
            minimum?: number | undefined;
            good?: number | undefined;
        };
        confidence: {
            minimum?: number | undefined;
            high?: number | undefined;
        };
        toxicity: {
            low?: number | undefined;
            medium?: number | undefined;
            high?: number | undefined;
            severe?: number | undefined;
        };
    };
    models: {
        primary: "custom" | "hybrid" | "transformer" | "neural_network" | "lexicon_based";
        fallback?: "custom" | "hybrid" | "transformer" | "neural_network" | "lexicon_based" | undefined;
        apiKey?: string | undefined;
        customEndpoint?: string | undefined;
    };
    configId: string;
    realTime: {
        alertThresholds: {
            severeToxicity?: boolean | undefined;
            criticalIntent?: boolean | undefined;
            negativeSpike?: boolean | undefined;
        };
        enabled?: boolean | undefined;
        webhookUrl?: string | undefined;
    };
    enabled?: boolean | undefined;
}>;
export type SentimentAnalysisConfig = z.infer<typeof SentimentAnalysisConfigSchema>;
export declare const AnalyzeSentimentRequestSchema: z.ZodObject<{
    texts: z.ZodArray<z.ZodObject<{,
        textId: z.ZodString;
        content: z.ZodString;
        sourceType: z.ZodEnum<["comment", "review", "survey_response", "support_ticket", "social_media", "email"]>;
        language: z.ZodOptional<z.ZodString>;
        metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        content: string;
        metadata: Record<string, unknown>;
        sourceType: "comment" | "email" | "review" | "social_media" | "survey_response" | "support_ticket";
        textId: string;
        language?: string | undefined;
    }, {
        content: string;
        sourceType: "comment" | "email" | "review" | "social_media" | "survey_response" | "support_ticket";
        textId: string;
        metadata?: Record<string, unknown> | undefined;
        language?: string | undefined;
    }>, "many">;
    options: z.ZodDefault<z.ZodObject<{,
        includeEmotions: z.ZodDefault<z.ZodBoolean>;
        includeToxicity: z.ZodDefault<z.ZodBoolean>;
        includeTopics: z.ZodDefault<z.ZodBoolean>;
        includeQuality: z.ZodDefault<z.ZodBoolean>;
        modelType: z.ZodOptional<z.ZodEnum<["transformer", "neural_network", "lexicon_based", "hybrid", "custom"]>>;
        realTime: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        realTime: boolean;
        includeEmotions: boolean;
        includeToxicity: boolean;
        includeTopics: boolean;
        includeQuality: boolean;
        modelType?: "custom" | "hybrid" | "transformer" | "neural_network" | "lexicon_based" | undefined;
    }, {
        modelType?: "custom" | "hybrid" | "transformer" | "neural_network" | "lexicon_based" | undefined;
        realTime?: boolean | undefined;
        includeEmotions?: boolean | undefined;
        includeToxicity?: boolean | undefined;
        includeTopics?: boolean | undefined;
        includeQuality?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    options: {
        realTime: boolean;
        includeEmotions: boolean;
        includeToxicity: boolean;
        includeTopics: boolean;
        includeQuality: boolean;
        modelType?: "custom" | "hybrid" | "transformer" | "neural_network" | "lexicon_based" | undefined;
    };
    texts: {
        content: string;
        metadata: Record<string, unknown>;
        sourceType: "comment" | "email" | "review" | "social_media" | "survey_response" | "support_ticket";
        textId: string;
        language?: string | undefined;
    }[];
}, {
    texts: {
        content: string;
        sourceType: "comment" | "email" | "review" | "social_media" | "survey_response" | "support_ticket";
        textId: string;
        metadata?: Record<string, unknown> | undefined;
        language?: string | undefined;
    }[];
    options?: {
        modelType?: "custom" | "hybrid" | "transformer" | "neural_network" | "lexicon_based" | undefined;
        realTime?: boolean | undefined;
        includeEmotions?: boolean | undefined;
        includeToxicity?: boolean | undefined;
        includeTopics?: boolean | undefined;
        includeQuality?: boolean | undefined;
    } | undefined;
}>;
export declare const SentimentAnalysisResponseSchema: z.ZodObject<{
    analyses: z.ZodArray<z.ZodObject<{,
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
        sentiment: z.ZodObject<{,
            type: z.ZodEnum<["positive", "neutral", "negative"]>;
            score: z.ZodNumber;
            confidence: z.ZodNumber;
            magnitude: z.ZodNumber;
            subjectivity: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            type: "positive" | "neutral" | "negative";
            score: number;
            confidence: number;
            magnitude: number;
            subjectivity: number;
        }, {
            type: "positive" | "neutral" | "negative";
            score: number;
            confidence: number;
            magnitude: number;
            subjectivity: number;
        }>;
        emotions: z.ZodObject<{,
            primary: z.ZodOptional<z.ZodEnum<["joy", "sadness", "anger", "fear", "surprise", "disgust", "trust", "anticipation"]>>;
            scores: z.ZodDefault<z.ZodRecord<z.ZodEnum<["joy", "sadness", "anger", "fear", "surprise", "disgust", "trust", "anticipation"]>, z.ZodNumber>>;
            confidence: z.ZodNumber;
            mixed: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            mixed: boolean;
            confidence: number;
            scores: Partial<Record<"fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation", number>>;
            primary?: "fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation" | undefined;
        }, {
            confidence: number;
            mixed?: boolean | undefined;
            primary?: "fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation" | undefined;
            scores?: Partial<Record<"fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation", number>> | undefined;
        }>;
        toxicity: z.ZodObject<{,
            level: z.ZodEnum<["none", "low", "medium", "high", "severe"]>;
            score: z.ZodNumber;
            confidence: z.ZodNumber;
            categories: z.ZodDefault<z.ZodObject<{,
                harassment: z.ZodDefault<z.ZodNumber>;
                hate_speech: z.ZodDefault<z.ZodNumber>;
                profanity: z.ZodDefault<z.ZodNumber>;
                threats: z.ZodDefault<z.ZodNumber>;
                spam: z.ZodDefault<z.ZodNumber>;
                inappropriate: z.ZodDefault<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                spam: number;
                inappropriate: number;
                threats: number;
                harassment: number;
                hate_speech: number;
                profanity: number;
            }, {
                spam?: number | undefined;
                inappropriate?: number | undefined;
                threats?: number | undefined;
                harassment?: number | undefined;
                hate_speech?: number | undefined;
                profanity?: number | undefined;
            }>>;
            flags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            level: "low" | "medium" | "high" | "none" | "severe";
            score: number;
            categories: {
                spam: number;
                inappropriate: number;
                threats: number;
                harassment: number;
                hate_speech: number;
                profanity: number;
            };
            confidence: number;
            flags: string[];
        }, {
            level: "low" | "medium" | "high" | "none" | "severe";
            score: number;
            confidence: number;
            categories?: {
                spam?: number | undefined;
                inappropriate?: number | undefined;
                threats?: number | undefined;
                harassment?: number | undefined;
                hate_speech?: number | undefined;
                profanity?: number | undefined;
            } | undefined;
            flags?: string[] | undefined;
        }>;
        topics: z.ZodDefault<z.ZodArray<z.ZodObject<{,
            topic: z.ZodString;
            relevance: z.ZodNumber;
            sentiment: z.ZodEnum<["positive", "neutral", "negative"]>;
        }, "strip", z.ZodTypeAny, {
            relevance: number;
            sentiment: "positive" | "neutral" | "negative";
            topic: string;
        }, {
            relevance: number;
            sentiment: "positive" | "neutral" | "negative";
            topic: string;
        }>, "many">>;
        keywords: z.ZodDefault<z.ZodArray<z.ZodObject<{,
            keyword: z.ZodString;
            importance: z.ZodNumber;
            sentiment: z.ZodEnum<["positive", "neutral", "negative"]>;
            frequency: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            frequency: number;
            sentiment: "positive" | "neutral" | "negative";
            keyword: string;
            importance: number;
        }, {
            frequency: number;
            sentiment: "positive" | "neutral" | "negative";
            keyword: string;
            importance: number;
        }>, "many">>;
        intent: z.ZodOptional<z.ZodObject<{,
            category: z.ZodOptional<z.ZodEnum<["question", "complaint", "compliment", "suggestion", "request", "report", "other"]>>;
            confidence: z.ZodNumber;
            urgency: z.ZodDefault<z.ZodEnum<["low", "medium", "high", "critical"]>>;
            actionRequired: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            confidence: number;
            urgency: "low" | "medium" | "high" | "critical";
            actionRequired: boolean;
            category?: "other" | "suggestion" | "request" | "report" | "question" | "complaint" | "compliment" | undefined;
        }, {
            confidence: number;
            category?: "other" | "suggestion" | "request" | "report" | "question" | "complaint" | "compliment" | undefined;
            urgency?: "low" | "medium" | "high" | "critical" | undefined;
            actionRequired?: boolean | undefined;
        }>>;
        quality: z.ZodOptional<z.ZodObject<{,
            score: z.ZodNumber;
            readability: z.ZodNumber;
            coherence: z.ZodNumber;
            constructiveness: z.ZodNumber;
            specificity: z.ZodNumber;
            helpfulness: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            score: number;
            readability: number;
            specificity: number;
            coherence: number;
            constructiveness: number;
            helpfulness: number;
        }, {
            score: number;
            readability: number;
            specificity: number;
            coherence: number;
            constructiveness: number;
            helpfulness: number;
        }>>;
        metadata: z.ZodObject<{,
            processingTimeMs: z.ZodDefault<z.ZodNumber>;
            textLength: z.ZodDefault<z.ZodNumber>;
            wordCount: z.ZodDefault<z.ZodNumber>;
            sentenceCount: z.ZodDefault<z.ZodNumber>;
            languageDetected: z.ZodOptional<z.ZodString>;
            languageConfidence: z.ZodOptional<z.ZodNumber>;
            preprocessingSteps: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            features: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, "strip", z.ZodTypeAny, {
            wordCount: number;
            textLength: number;
            processingTimeMs: number;
            sentenceCount: number;
            preprocessingSteps: string[];
            features: Record<string, unknown>;
            languageDetected?: string | undefined;
            languageConfidence?: number | undefined;
        }, {
            wordCount?: number | undefined;
            textLength?: number | undefined;
            processingTimeMs?: number | undefined;
            sentenceCount?: number | undefined;
            languageDetected?: string | undefined;
            languageConfidence?: number | undefined;
            preprocessingSteps?: string[] | undefined;
            features?: Record<string, unknown> | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        metadata: {
            wordCount: number;
            textLength: number;
            processingTimeMs: number;
            sentenceCount: number;
            preprocessingSteps: string[];
            features: Record<string, unknown>;
            languageDetected?: string | undefined;
            languageConfidence?: number | undefined;
        };
        keywords: {
            frequency: number;
            sentiment: "positive" | "neutral" | "negative";
            keyword: string;
            importance: number;
        }[];
        confidence: number;
        language: string;
        sourceType: "comment" | "email" | "review" | "social_media" | "survey_response" | "support_ticket";
        emotions: {
            mixed: boolean;
            confidence: number;
            scores: Partial<Record<"fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation", number>>;
            primary?: "fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation" | undefined;
        };
        sentiment: {
            type: "positive" | "neutral" | "negative";
            score: number;
            confidence: number;
            magnitude: number;
            subjectivity: number;
        };
        topics: {
            relevance: number;
            sentiment: "positive" | "neutral" | "negative";
            topic: string;
        }[];
        analysisId: string;
        textId: string;
        originalText: string;
        analyzedAt: Date;
        modelUsed: "custom" | "hybrid" | "transformer" | "neural_network" | "lexicon_based";
        modelVersion: string;
        toxicity: {
            level: "low" | "medium" | "high" | "none" | "severe";
            score: number;
            categories: {
                spam: number;
                inappropriate: number;
                threats: number;
                harassment: number;
                hate_speech: number;
                profanity: number;
            };
            confidence: number;
            flags: string[];
        };
        quality?: {
            score: number;
            readability: number;
            specificity: number;
            coherence: number;
            constructiveness: number;
            helpfulness: number;
        } | undefined;
        intent?: {
            confidence: number;
            urgency: "low" | "medium" | "high" | "critical";
            actionRequired: boolean;
            category?: "other" | "suggestion" | "request" | "report" | "question" | "complaint" | "compliment" | undefined;
        } | undefined;
        processedText?: string | undefined;
    }, {
        metadata: {
            wordCount?: number | undefined;
            textLength?: number | undefined;
            processingTimeMs?: number | undefined;
            sentenceCount?: number | undefined;
            languageDetected?: string | undefined;
            languageConfidence?: number | undefined;
            preprocessingSteps?: string[] | undefined;
            features?: Record<string, unknown> | undefined;
        };
        confidence: number;
        sourceType: "comment" | "email" | "review" | "social_media" | "survey_response" | "support_ticket";
        emotions: {
            confidence: number;
            mixed?: boolean | undefined;
            primary?: "fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation" | undefined;
            scores?: Partial<Record<"fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation", number>> | undefined;
        };
        sentiment: {
            type: "positive" | "neutral" | "negative";
            score: number;
            confidence: number;
            magnitude: number;
            subjectivity: number;
        };
        analysisId: string;
        textId: string;
        originalText: string;
        analyzedAt: Date;
        modelUsed: "custom" | "hybrid" | "transformer" | "neural_network" | "lexicon_based";
        toxicity: {
            level: "low" | "medium" | "high" | "none" | "severe";
            score: number;
            confidence: number;
            categories?: {
                spam?: number | undefined;
                inappropriate?: number | undefined;
                threats?: number | undefined;
                harassment?: number | undefined;
                hate_speech?: number | undefined;
                profanity?: number | undefined;
            } | undefined;
            flags?: string[] | undefined;
        };
        quality?: {
            score: number;
            readability: number;
            specificity: number;
            coherence: number;
            constructiveness: number;
            helpfulness: number;
        } | undefined;
        keywords?: {
            frequency: number;
            sentiment: "positive" | "neutral" | "negative";
            keyword: string;
            importance: number;
        }[] | undefined;
        language?: string | undefined;
        topics?: {
            relevance: number;
            sentiment: "positive" | "neutral" | "negative";
            topic: string;
        }[] | undefined;
        intent?: {
            confidence: number;
            category?: "other" | "suggestion" | "request" | "report" | "question" | "complaint" | "compliment" | undefined;
            urgency?: "low" | "medium" | "high" | "critical" | undefined;
            actionRequired?: boolean | undefined;
        } | undefined;
        processedText?: string | undefined;
        modelVersion?: string | undefined;
    }>, "many">;
    summary: z.ZodObject<{,
        totalProcessed: z.ZodNumber;
        totalErrors: z.ZodNumber;
        averageConfidence: z.ZodNumber;
        processingTimeMs: z.ZodNumber;
        overallSentiment: z.ZodOptional<z.ZodEnum<["positive", "neutral", "negative"]>>;
    }, "strip", z.ZodTypeAny, {
        processingTimeMs: number;
        averageConfidence: number;
        totalProcessed: number;
        totalErrors: number;
        overallSentiment?: "positive" | "neutral" | "negative" | undefined;
    }, {
        processingTimeMs: number;
        averageConfidence: number;
        totalProcessed: number;
        totalErrors: number;
        overallSentiment?: "positive" | "neutral" | "negative" | undefined;
    }>;
    meta: z.ZodObject<{,
        requestId: z.ZodString;
        modelUsed: z.ZodString;
        batchId: z.ZodOptional<z.ZodString>;
        apiVersion: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        requestId: string;
        modelUsed: string;
        apiVersion: string;
        batchId?: string | undefined;
    }, {
        requestId: string;
        modelUsed: string;
        batchId?: string | undefined;
        apiVersion?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    meta: {
        requestId: string;
        modelUsed: string;
        apiVersion: string;
        batchId?: string | undefined;
    };
    summary: {
        processingTimeMs: number;
        averageConfidence: number;
        totalProcessed: number;
        totalErrors: number;
        overallSentiment?: "positive" | "neutral" | "negative" | undefined;
    };
    analyses: {
        metadata: {
            wordCount: number;
            textLength: number;
            processingTimeMs: number;
            sentenceCount: number;
            preprocessingSteps: string[];
            features: Record<string, unknown>;
            languageDetected?: string | undefined;
            languageConfidence?: number | undefined;
        };
        keywords: {
            frequency: number;
            sentiment: "positive" | "neutral" | "negative";
            keyword: string;
            importance: number;
        }[];
        confidence: number;
        language: string;
        sourceType: "comment" | "email" | "review" | "social_media" | "survey_response" | "support_ticket";
        emotions: {
            mixed: boolean;
            confidence: number;
            scores: Partial<Record<"fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation", number>>;
            primary?: "fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation" | undefined;
        };
        sentiment: {
            type: "positive" | "neutral" | "negative";
            score: number;
            confidence: number;
            magnitude: number;
            subjectivity: number;
        };
        topics: {
            relevance: number;
            sentiment: "positive" | "neutral" | "negative";
            topic: string;
        }[];
        analysisId: string;
        textId: string;
        originalText: string;
        analyzedAt: Date;
        modelUsed: "custom" | "hybrid" | "transformer" | "neural_network" | "lexicon_based";
        modelVersion: string;
        toxicity: {
            level: "low" | "medium" | "high" | "none" | "severe";
            score: number;
            categories: {
                spam: number;
                inappropriate: number;
                threats: number;
                harassment: number;
                hate_speech: number;
                profanity: number;
            };
            confidence: number;
            flags: string[];
        };
        quality?: {
            score: number;
            readability: number;
            specificity: number;
            coherence: number;
            constructiveness: number;
            helpfulness: number;
        } | undefined;
        intent?: {
            confidence: number;
            urgency: "low" | "medium" | "high" | "critical";
            actionRequired: boolean;
            category?: "other" | "suggestion" | "request" | "report" | "question" | "complaint" | "compliment" | undefined;
        } | undefined;
        processedText?: string | undefined;
    }[];
}, {
    meta: {
        requestId: string;
        modelUsed: string;
        batchId?: string | undefined;
        apiVersion?: string | undefined;
    };
    summary: {
        processingTimeMs: number;
        averageConfidence: number;
        totalProcessed: number;
        totalErrors: number;
        overallSentiment?: "positive" | "neutral" | "negative" | undefined;
    };
    analyses: {
        metadata: {
            wordCount?: number | undefined;
            textLength?: number | undefined;
            processingTimeMs?: number | undefined;
            sentenceCount?: number | undefined;
            languageDetected?: string | undefined;
            languageConfidence?: number | undefined;
            preprocessingSteps?: string[] | undefined;
            features?: Record<string, unknown> | undefined;
        };
        confidence: number;
        sourceType: "comment" | "email" | "review" | "social_media" | "survey_response" | "support_ticket";
        emotions: {
            confidence: number;
            mixed?: boolean | undefined;
            primary?: "fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation" | undefined;
            scores?: Partial<Record<"fear" | "joy" | "sadness" | "anger" | "surprise" | "disgust" | "trust" | "anticipation", number>> | undefined;
        };
        sentiment: {
            type: "positive" | "neutral" | "negative";
            score: number;
            confidence: number;
            magnitude: number;
            subjectivity: number;
        };
        analysisId: string;
        textId: string;
        originalText: string;
        analyzedAt: Date;
        modelUsed: "custom" | "hybrid" | "transformer" | "neural_network" | "lexicon_based";
        toxicity: {
            level: "low" | "medium" | "high" | "none" | "severe";
            score: number;
            confidence: number;
            categories?: {
                spam?: number | undefined;
                inappropriate?: number | undefined;
                threats?: number | undefined;
                harassment?: number | undefined;
                hate_speech?: number | undefined;
                profanity?: number | undefined;
            } | undefined;
            flags?: string[] | undefined;
        };
        quality?: {
            score: number;
            readability: number;
            specificity: number;
            coherence: number;
            constructiveness: number;
            helpfulness: number;
        } | undefined;
        keywords?: {
            frequency: number;
            sentiment: "positive" | "neutral" | "negative";
            keyword: string;
            importance: number;
        }[] | undefined;
        language?: string | undefined;
        topics?: {
            relevance: number;
            sentiment: "positive" | "neutral" | "negative";
            topic: string;
        }[] | undefined;
        intent?: {
            confidence: number;
            category?: "other" | "suggestion" | "request" | "report" | "question" | "complaint" | "compliment" | undefined;
            urgency?: "low" | "medium" | "high" | "critical" | undefined;
            actionRequired?: boolean | undefined;
        } | undefined;
        processedText?: string | undefined;
        modelVersion?: string | undefined;
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
}
    };

export { SentimentAnalysisSchema, SentimentAnalyticsSchema, SentimentAnalysisConfigSchema, AnalyzeSentimentRequestSchema, SentimentAnalysisResponseSchema };
//# sourceMappingURL=SentimentAnalysisTypes.d.ts.map