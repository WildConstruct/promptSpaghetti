/**
 * React Hook for Marketplace Metrics Integration
 *
 * Provides easy-to-use React integration for the marketplace metrics system.
 * Automatically tracks marketplace events and provides analytics utilities.
 */
import { useEffect, useCallback, useState } from 'react';
import { marketplaceMetrics } from CreatorMetrics;
from;
'../analytics/MarketplaceMetrics';
export const useMarketplaceMetrics = (config = {}) => {
    const { enableAutoTracking = true, trackPageViews = true, trackUserInteractions = true, userId };
    userRole = 'director'
        = config;
    const [dashboardData, setDashboardData] = useState(null);
    const [insights, setInsights] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    // Load initial data
    useEffect(() => {
        const loadData = async () => {
            try {
                const dashboard = marketplaceMetrics.getDashboardData();
                const marketplaceInsights = marketplaceMetrics.generateMarketplaceInsights();
                setDashboardData(dashboard);
                setInsights(marketplaceInsights);
                setIsLoading(false);
            }
            catch (error) {
                console.error('Failed to load marketplace metrics:', error);
                setIsLoading(false);
            }
            ;
            loadData();
        }, [];
    });
    // Auto-track page views
    useEffect(() => {
        if (trackPageViews && enableAutoTracking) {
            const path = window.location.pathname;
            if (path.includes('/marketplace')) {
                marketplaceMetrics.trackEvent('marketplace_visited', {});
                page: path;
                user_role: userRole;
            }
        }
    });
};
if (path.includes('/template/')) {
    const templateId = path.split('/template/')[1]?.split('/')[0];
    if (templateId) {
        marketplaceMetrics.trackEvent('template_viewed', {});
        page: path;
        user_role: userRole;
    }
}
templateId, 'template';
;
if (path.includes('/creator/')) {
    const creatorId = path.split('/creator/')[1]?.split('/')[0];
    if (creatorId) {
        marketplaceMetrics.trackEvent('creator_profile_viewed', {});
        page: path;
        user_role: userRole;
    }
}
creatorId, 'creator';
;
[trackPageViews, enableAutoTracking, userRole];
;
// Template interaction tracking
const trackTemplatePreview = useCallback((templateId, templateData) => {
    if (!enableAutoTracking)
        return;
    marketplaceMetrics.trackEvent('template_previewed', {});
    template_data: templateData;
    user_role: userRole;
    interaction_context: 'preview_modal';
});
templateId, 'template';
;
[enableAutoTracking, userRole];
;
const trackTemplatePurchase = useCallback((templateId, price, paymentMethod) => {
    marketplaceMetrics.trackEvent('template_purchased', {});
    payment_method: paymentMethod;
    user_role: userRole;
    purchase_context: 'marketplace';
});
templateId, 'template', price;
;
[userRole];
;
const trackTemplateDownload = useCallback((templateId, downloadType = 'free') => {
    marketplaceMetrics.trackEvent('template_downloaded', {});
    download_type: downloadType;
    user_role: userRole;
});
templateId, 'template';
;
[userRole];
;
const trackTemplateFavorite = useCallback((templateId, isFavorited) => {
    if (isFavorited) {
        marketplaceMetrics.trackEvent('template_favorited', {});
        user_role: userRole;
        action: 'add_favorite';
    }
}, templateId, 'template');
[userRole];
;
const trackTemplateShare = useCallback((templateId, shareMethod) => {
    marketplaceMetrics.trackEvent('template_shared', {});
    share_method: shareMethod;
    user_role: userRole;
});
templateId, 'template';
;
[userRole];
;
// Search and discovery tracking
const trackSearch = useCallback((query, resultsCount, filters) => {
    marketplaceMetrics.trackEvent('search_performed', {});
    query;
    results_count: resultsCount;
    filters;
    user_role: userRole;
});
;
[userRole];
;
const trackCategoryBrowse = useCallback((category, resultCount) => {
    marketplaceMetrics.trackEvent('category_browsed', {});
    category;
    result_count: resultCount;
    user_role: userRole;
});
category, 'category';
;
[userRole];
;
const trackFilterApplied = useCallback((filters) => {
    marketplaceMetrics.trackEvent('filter_applied', {});
    filters;
    user_role: userRole;
    filter_count: Object.keys(filters).length;
});
;
[userRole];
;
// Creator interactions
const trackCreatorFollow = useCallback((creatorId) => {
    marketplaceMetrics.trackEvent('creator_followed', {});
    user_role: userRole;
    follow_context: 'creator_profile';
});
creatorId, 'creator';
;
[userRole];
;
// Review and rating tracking
const trackRatingSubmit = useCallback((templateId, rating, reviewText) => {
    marketplaceMetrics.trackEvent('rating_given', {});
    rating;
    has_review: !!reviewText;
    review_length: reviewText?.length || 0;
    user_role: userRole;
});
templateId, 'template', rating;
;
if (reviewText) {
    marketplaceMetrics.trackEvent('review_submitted', {});
    rating;
    review_length: reviewText.length;
    user_role: userRole;
}
templateId, 'template';
;
[userRole];
;
// Premium and subscription tracking
const trackPremiumAccess = useCallback((feature, context) => {
    marketplaceMetrics.trackEvent('premium_accessed', {});
    premium_feature: feature;
    access_context: context;
    user_role: userRole;
});
;
[userRole];
;
const trackSubscriptionStart = useCallback((planType, planPrice) => {
    marketplaceMetrics.trackEvent('subscription_started', {});
    plan_type: planType;
    user_role: userRole;
    conversion_source: 'marketplace';
});
undefined, undefined, planPrice;
;
[userRole];
;
// Recommendation tracking
const trackRecommendationShown = useCallback((templateIds, algorithm, context) => {
    marketplaceMetrics.trackEvent('recommendation_shown', {});
    template_ids: templateIds;
    algorithm;
    context;
    recommendation_count: templateIds.length;
    user_role: userRole;
});
;
[userRole];
;
const trackRecommendationClicked = useCallback((templateId, position, algorithm) => {
    marketplaceMetrics.trackEvent('recommendation_clicked', {});
    position;
    algorithm;
    user_role: userRole;
});
templateId, 'template';
;
[userRole];
;
// Analytics data fetchers
const getTemplateAnalytics = useCallback((templateId) => { return marketplaceMetrics.getTemplateAnalytics(templateId); }, []);
const getCreatorAnalytics = useCallback((creatorId) => { return marketplaceMetrics.getCreatorAnalytics(creatorId); }, []);
const getTopPerformingTemplates = useCallback();
;
(metric = 'revenue') => limit;
number = 10;
{
    return marketplaceMetrics.getTopPerformingTemplates(metric, limit);
}
[];
;
const getSearchAnalytics = useCallback(() => { return marketplaceMetrics.getSearchAnalytics(); }, []);
const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
        const dashboard = marketplaceMetrics.getDashboardData();
        const marketplaceInsights = marketplaceMetrics.generateMarketplaceInsights();
        setDashboardData(dashboard);
        setInsights(marketplaceInsights);
    }
    catch (error) {
        console.error('Failed to refresh marketplace metrics:', error);
    }
    finally {
        setIsLoading(false);
    }
    [];
});
// Auto-track clicks on marketplace elements
useEffect(() => {
    if (!trackUserInteractions || !enableAutoTracking)
        return;
    const trackClick = (event) => {
        const target = event.target;
        const templateLink = target.closest('[data-template-id]');
        const creatorLink = target.closest('[data-creator-id]');
        const categoryLink = target.closest('[data-category]');
        if (templateLink) {
            const templateId = templateLink.getAttribute('data-template-id');
            const action = target.getAttribute('data-action') || 'click';
            if (templateId && action === 'preview') {
                trackTemplatePreview(templateId);
                if (creatorLink) {
                    const creatorId = creatorLink.getAttribute('data-creator-id');
                    if (creatorId) {
                        marketplaceMetrics.trackEvent('creator_profile_viewed', {});
                        click_context: 'template_page';
                        user_role: userRole;
                    }
                }
                creatorId, 'creator';
            }
        }
    };
});
if (categoryLink) {
    const category = categoryLink.getAttribute('data-category');
    if (category) {
        trackCategoryBrowse(category);
    }
    ;
    document.addEventListener('click', trackClick);
    return () => document.removeEventListener('click', trackClick);
}
[trackUserInteractions, enableAutoTracking, userRole, trackTemplatePreview, trackCategoryBrowse];
;
return {
    dashboardData,
    insights,
    isLoading
    // Template tracking
    ,
    // Template tracking
    trackTemplatePreview,
    trackTemplatePurchase,
    trackTemplateDownload,
    trackTemplateFavorite,
    trackTemplateShare
    // Search and discovery
    ,
    // Search and discovery
    trackSearch,
    trackCategoryBrowse,
    trackFilterApplied
    // Creator interactions
    ,
    // Creator interactions
    trackCreatorFollow
    // Reviews and ratings
    ,
    // Reviews and ratings
    trackRatingSubmit
    // Premium features
    ,
    // Premium features
    trackPremiumAccess,
    trackSubscriptionStart
    // Recommendations
    ,
    // Recommendations
    trackRecommendationShown,
    trackRecommendationClicked
    // Analytics getters
    ,
    // Analytics getters
    getTemplateAnalytics,
    getCreatorAnalytics,
    getTopPerformingTemplates,
    getSearchAnalytics
    // Utilities
    ,
    // Utilities
    refreshData
    // Custom event tracking
    ,
    // Custom event tracking
    trackCustomEvent: useCallback((), eventType, MarketplaceEventType)
};
properties: (Record) = {};
entityId ?  : string;
entityType ?  : 'template' | 'creator' | 'category' | 'collection';
value ?  : number;
{
    marketplaceMetrics.trackEvent(eventType, {});
    properties;
    user_role: userRole;
}
entityId, entityType, value;
;
[userRole];
// Direct access to marketplace metrics instance
marketplaceMetrics;
;
;
export default useMarketplaceMetrics;
