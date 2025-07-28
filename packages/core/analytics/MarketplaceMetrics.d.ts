/**
 * Marketplace Metrics System - E17-1753114397415-AFF06F
 *
 * Comprehensive marketplace analytics for Wild Construct platform
 * tracking template performance, user engagement, revenue metrics, and business intelligence.
 *
 * Features:
 * - Template performance analytics
 * - Revenue tracking and attribution
 * - User engagement patterns
 * - Marketplace trends analysis
 * - Creator performance metrics
 * - A/B testing for marketplace features
 */

export interface MarketplaceEvent {
    id: string;
    userId: string;
    sessionId: string;
    timestamp: number;
    type: MarketplaceEventType;
    category: MarketplaceCategory;
    entityId?: string;
    entityType?: 'template' | 'creator' | 'category' | 'collection';
    value?: number;
    properties: Record<string, any>;
    metadata: {,
        userAgent: string;
        referrer: string;
        location?: string;
        deviceType: 'desktop' | 'mobile' | 'tablet';
    };

export type MarketplaceEventType = 'marketplace_visited' | 'category_browsed' | 'search_performed' | 'filter_applied' | 'template_viewed' | 'template_previewed' | 'template_favorited' | 'template_shared' | 'creator_followed' | 'review_submitted' | 'rating_given' | 'template_purchased' | 'template_downloaded' | 'subscription_started' | 'premium_accessed' | 'template_uploaded' | 'template_updated' | 'creator_profile_viewed' | 'earnings_withdrawn' | 'recommendation_shown' | 'recommendation_clicked' | 'promotion_viewed' | 'discount_applied';
export type MarketplaceCategory = 'discovery' | 'engagement' | 'monetization' | 'creator_economy' | 'recommendation';

export interface TemplateMetrics {
    templateId: string;
    name: string;
    creatorId: string;
    category: string;
    metrics: {,
        views: number;
        previews: number;
        downloads: number;
        purchases: number;
        favorites: number;
        shares: number;
        ratings: {,
            average: number;
            count: number;
            distribution: {,
                [stars: number]: number;
            };
        };
        revenue: {,
            total: number;
            monthly: number;
            weekly: number;
        };
        conversionRates: {,
            viewToPreview: number;
            previewToDownload: number;
            viewToFavorite: number;
        };
    };
    trends: {,
        viewsGrowth: number;
        revenueGrowth: number;
        ratingTrend: 'improving' | 'stable' | 'declining';
    };

export interface CreatorMetrics {
    creatorId: string;
    name: string;
    metrics: {,
        totalTemplates: number;
        totalRevenue: number;
        totalDownloads: number;
        averageRating: number;
        followers: number;
        topPerformingTemplate: {,
            id: string;
            name: string;
            revenue: number;
        };
        recentPerformance: {,
            period: string;
            revenue: number;
            downloads: number;
            newFollowers: number;
        };
    };
    trends: {,
        revenueGrowth: number;
        followerGrowth: number;
        templatePerformance: 'improving' | 'stable' | 'declining';
    };

export interface MarketplaceDashboardData {
    overview: {,
        totalRevenue: number;
        totalTransactions: number;
        activeTemplates: number;
        activeCreators: number;
        averageRating: number;
        conversionRate: number;
    };
    trends: {,
        revenueGrowth: number;
        transactionGrowth: number;
        userGrowth: number;
        topCategories: Array<{,
            category: string;
            revenue: number;
            growth: number;
        }>;
    };
    recommendations: {,
        shown: number;
        clicked: number;
        converted: number;
        ctr: number;
        conversionRate: number;
    };
    searchAnalytics: {,
        totalSearches: number;
        topQueries: Array<{,
            query: string;
            count: number;
            resultsFound: number;
            ctr: number;
        }>;
        zeroResultQueries: Array<{,
            query: string;
            count: number;
        }>;
    };

export declare class MarketplaceMetrics {
    private events;
    private templateMetrics;
    private creatorMetrics;
    private searchQueries;
    private recommendations;
    constructor();
    private initializeSampleData;
    /**
     * Track marketplace event
     */
    trackEvent();
      type: MarketplaceEventType,
      properties?: Record<string,
      any>,
      entityId?: string,
      entityType?: 'template' | 'creator' | 'category' | 'collection',
      value?: number
    ): void;
    private updateMetricsFromEvent;
    private updateTemplateConversionRates;
    private integrateWithConversionTracking;
    /**
     * Get marketplace dashboard data
     */
    getDashboardData(timeRange?: {)
        startTime: number;
        endTime: number;
    }): MarketplaceDashboardData;
    private calculateOverallConversionRate;
    private calculateTopCategories;
    /**
     * Get template analytics
     */
    getTemplateAnalytics(templateId: string): TemplateMetrics | null;
    /**
     * Get creator analytics
     */
    getCreatorAnalytics(creatorId: string): CreatorMetrics | null;
    /**
     * Get top performing templates
     */
    getTopPerformingTemplates(metric?: 'revenue' | 'downloads' | 'rating', limit?: number): TemplateMetrics[];
    /**
     * Get search analytics
     */
    getSearchAnalytics(): {
        topQueries: Array<{,
            query: string;
            count: number;
            ctr: number;
        }>;
        zeroResultQueries: Array<{,
            query: string;
            count: number;
        }>;
        averageCTR: number;
    };
    /**
     * Generate marketplace insights
     */
    generateMarketplaceInsights(): Array<{
        type: 'opportunity' | 'trend' | 'optimization';
        title: string;
        description: string;
        impact: 'high' | 'medium' | 'low';
        action: string;
        metrics?: Record<string, number>;
    }>;
    private generateEventId;
    private getCurrentUserId;
    private getCurrentSessionId;
    private getCategoryForEventType;
    private getDeviceType;

export declare const marketplaceMetrics: MarketplaceMetrics;
export default marketplaceMetrics;
//# sourceMappingURL=MarketplaceMetrics.d.ts.map