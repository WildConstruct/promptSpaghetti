/**
 * React Hook for Marketplace Metrics Integration
 *
 * Provides easy-to-use React integration for the marketplace metrics system.
 * Automatically tracks marketplace events and provides analytics utilities.
 */
import { MarketplaceEventType, TemplateMetrics, CreatorMetrics } from '../analytics/MarketplaceMetrics';

}
export interface MarketplaceMetricsConfig {
    enableAutoTracking?: boolean;
    trackPageViews?: boolean;
    trackUserInteractions?: boolean;
    userId?: string;
    userRole?: 'director' | 'producer' | 'creator' | 'admin';

export declare const useMarketplaceMetrics: (config?: MarketplaceMetricsConfig) => {
    dashboardData: any;
    insights: any[];
    isLoading: boolean;
    trackTemplatePreview: (templateId: string, templateData?: any) => void;
    trackTemplatePurchase: (templateId: string, price: number, paymentMethod?: string) => void;
    trackTemplateDownload: (templateId: string, downloadType?: "free" | "premium") => void;
    trackTemplateFavorite: (templateId: string, isFavorited: boolean) => void;
    trackTemplateShare: (templateId: string, shareMethod: "link" | "social" | "email") => void;
    trackSearch: (query: string, resultsCount: number, filters?: Record<string, any>) => void;
    trackCategoryBrowse: (category: string, resultCount?: number) => void;
    trackFilterApplied: (filters: Record<string, any>) => void;
    trackCreatorFollow: (creatorId: string) => void;
    trackRatingSubmit: (templateId: string, rating: number, reviewText?: string) => void;
    trackPremiumAccess: (feature: string, context?: string) => void;
    trackSubscriptionStart: (planType: string, planPrice: number) => void;
    trackRecommendationShown: (templateIds: string[], algorithm: string, context: string) => void;
    trackRecommendationClicked: (templateId: string, position: number, algorithm: string) => void;
    getTemplateAnalytics: (templateId: string) => TemplateMetrics | null;
    getCreatorAnalytics: (creatorId: string) => CreatorMetrics | null;
    getTopPerformingTemplates: (metric?: "revenue" | "downloads" | "rating", limit?: number) => TemplateMetrics[];
    getSearchAnalytics: () => {,
        topQueries: Array<{
            query: string;
            count: number;
            ctr: number;
}
        }>;
        zeroResultQueries: Array<{
            query: string;
            count: number;
        }>;
        averageCTR: number;
    };
    refreshData: () => Promise<void>;
    trackCustomEvent: (),
      eventType: MarketplaceEventType,
      properties?: Record<string,
      any>,
      entityId?: string,
      entityType?: "template" | "creator" | "category" | "collection",
      value?: number
    ) => void;
    marketplaceMetrics: import("../analytics/MarketplaceMetrics").MarketplaceMetrics;
};
export default useMarketplaceMetrics;
//# sourceMappingURL=useMarketplaceMetrics.d.ts.map