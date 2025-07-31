/**
 * Recommendation Engine Admin - E17-1753114397324-2FB112
 *
 * Administrative interface for configuring and monitoring the recommendation engine
 * Part of Epic 17.5.2 - Featured Content Tools (Backstage Admin Controls)
 */
import React from 'react';

}
export interface RecommendationAlgorithm {
    id: string;
    name: string;
    type: 'collaborative_filtering' | 'content_based' | 'hybrid' | 'deep_learning' | 'performance_based';
    description: string;
    enabled: boolean;
    weight: number;
    parameters: Record<string, any>;
    performance_metrics: {
        precision: number;
        recall: number;
        ndcg: number;
        click_through_rate: number;
        conversion_rate: number;
}
    };
    last_trained?: Date;
    training_status: 'idle' | 'training' | 'failed' | 'completed';

}
export interface FeaturedContentConfig {
    algorithm_weights: {
        trending_boost: number;
        quality_boost: number;
        diversity_boost: number;
        recency_boost: number;
        creator_tier_boost: number;
}
    };
    content_filters: {
        min_quality_score: number;
        exclude_categories: string[];
        featured_categories_boost: Record<string, number>;
        creator_tier_weights: Record<string, number>;
    };
    rotation_settings: {
        rotation_frequency: number;
        max_consecutive_shows: number;
        cooldown_period: number;
        randomization_factor: number;
    };
    ab_testing: {
        enabled: boolean;
        variants: ABTestVariant[];
        traffic_allocation: number;
    };

}
export interface ABTestVariant {
    id: string;
    name: string;
    config_override: Partial<FeaturedContentConfig>;
    allocation_percentage: number;
    performance_metrics?: {
        ctr: number;
        conversion_rate: number;
        engagement_score: number;
        revenue_per_view: number;
}
    };

}
export interface RecommendationMetrics {
    overall_performance: {
        total_recommendations_served: number;
        click_through_rate: number;
        conversion_rate: number;
        avg_engagement_time: number;
        revenue_impact: number;
}
    };
    algorithm_performance: Record<string, {
        precision: number;
        recall: number;
        f1_score: number;
        latency_ms: number;
        cache_hit_rate: number;
    }>;
    featured_content_performance: {
        impressions: number;
        clicks: number;
        conversions: number;
        revenue: number;
        top_performing_content: Array<{
            id: string;
            title: string;
            performance_score: number;
        }>;
    };
    real_time_stats: {
        current_recommendations_per_minute: number;
        active_users: number;
        cache_utilization: number;
        model_accuracy: number;
    };

}
export interface RecommendationEngineAdminProps {
    className?: string;

export declare const RecommendationEngineAdmin: React.FC<RecommendationEngineAdminProps>;
export default RecommendationEngineAdmin;
//# sourceMappingURL=RecommendationEngineAdmin.d.ts.map
}