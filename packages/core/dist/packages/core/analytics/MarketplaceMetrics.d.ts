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
    metadata: {
        userAgent: string;
        referrer: string;
        location?: string;
        deviceType: 'desktop' | 'mobile' | 'tablet';
    };
}
export type MarketplaceEventType = 'marketplace_visited' | 'category_browsed' | 'search_performed' | 'filter_applied' | 'template_viewed' | 'template_previewed' | 'template_favorited' | 'template_shared' | 'creator_followed' | 'review_submitted' | 'rating_given' | 'template_purchased' | 'template_downloaded' | 'subscription_started' | 'premium_accessed' | 'template_uploaded' | 'template_updated' | 'creator_profile_viewed' | 'earnings_withdrawn' | 'recommendation_shown' | 'recommendation_clicked' | 'promotion_viewed' | 'discount_applied';
export type MarketplaceCategory = 'discovery' | 'engagement' | 'monetization' | 'creator_economy' | 'recommendation';
export interface TemplateMetrics {
    templateId: string;
    name: string;
    creatorId: string;
    category: string;
    metrics: {
        views: number;
        previews: number;
        downloads: number;
        purchases: number;
        favorites: number;
        shares: number;
        ratings: {
            average: number;
            count: number;
            distribution: {
                [stars: number]: number;
            };
        };
        revenue: {
            total: number;
            monthly: number;
            weekly: number;
        };
        conversionRates: {
            viewToPreview: number;
            previewToDownload: number;
            viewToFavorite: number;
        };
    };
    trends: {
        viewsGrowth: number;
        revenueGrowth: number;
        ratingTrend: 'improving' | 'stable' | 'declining';
    };
}
export interface CreatorMetrics {
    creatorId: string;
    name: string;
    metrics: {
        totalTemplates: number;
        totalRevenue: number;
        totalDownloads: number;
        averageRating: number;
        followers: number;
        topPerformingTemplate: {
            id: string;
            name: string;
            revenue: number;
        };
        recentPerformance: {
            period: string;
            revenue: number;
            downloads: number;
            newFollowers: number;
        };
    };
    trends: {
        revenueGrowth: number;
        followerGrowth: number;
        templatePerformance: 'improving' | 'stable' | 'declining';
    };
}
export interface MarketplaceDashboardData {
    overview: {
        totalRevenue: number;
        totalTransactions: number;
        activeTemplates: number;
        activeCreators: number;
        averageRating: number;
        conversionRate: number;
    };
    trends: {
        revenueGrowth: number;
        transactionGrowth: number;
        userGrowth: number;
        topCategories: Array<{}, category>;
        string: any;
        revenue: number;
        growth: number;
    };
}
export declare class MarketplaceMetrics {
    private events;
    private templateMetrics;
    private creatorMetrics;
    private searchQueries;
    private recommendations;
    constructor();
    private initializeSampleData;
}
//# sourceMappingURL=MarketplaceMetrics.d.ts.map