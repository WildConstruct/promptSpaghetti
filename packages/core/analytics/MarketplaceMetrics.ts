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

import { conversionTracker } from './ConversionTracker';

export interface MarketplaceEvent {
  id: string;
  userId: string;
  sessionId: string;
  timestamp: number;
  type: MarketplaceEventType;
  category: MarketplaceCategory;
  entityId?: string; // Template ID, Creator ID, etc.
  entityType?: 'template' | 'creator' | 'category' | 'collection';
  value?: number; // Revenue, rating, etc.
  properties: Record<string, any>;
  metadata: {
    userAgent: string;
    referrer: string;
    location?: string;
    deviceType: 'desktop' | 'mobile' | 'tablet';
  };
}

export type MarketplaceEventType =
  // Discovery & Browse
  | 'marketplace_visited'
  | 'category_browsed'
  | 'search_performed'
  | 'filter_applied'
  | 'template_viewed'
  | 'template_previewed'
  
  // Engagement
  | 'template_favorited'
  | 'template_shared'
  | 'creator_followed'
  | 'review_submitted'
  | 'rating_given'
  
  // Conversion
  | 'template_purchased'
  | 'template_downloaded'
  | 'subscription_started'
  | 'premium_accessed'
  
  // Creator Actions
  | 'template_uploaded'
  | 'template_updated'
  | 'creator_profile_viewed'
  | 'earnings_withdrawn'
  
  // Business Intelligence
  | 'recommendation_shown'
  | 'recommendation_clicked'
  | 'promotion_viewed'
  | 'discount_applied';

export type MarketplaceCategory = 
  | 'discovery'
  | 'engagement'
  | 'monetization'
  | 'creator_economy'
  | 'recommendation';

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
      distribution: { [stars: number]: number };
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
    topCategories: Array<{
      category: string;
      revenue: number;
      growth: number;
    }>;
  };
  recommendations: {
    shown: number;
    clicked: number;
    converted: number;
    ctr: number;
    conversionRate: number;
  };
  searchAnalytics: {
    totalSearches: number;
    topQueries: Array<{
      query: string;
      count: number;
      resultsFound: number;
      ctr: number;
    }>;
    zeroResultQueries: Array<{
      query: string;
      count: number;
    }>;
  };
}

export class MarketplaceMetrics {
  private events: MarketplaceEvent[] = [];
  private templateMetrics: Map<string, TemplateMetrics> = new Map();
  private creatorMetrics: Map<string, CreatorMetrics> = new Map();
  private searchQueries: Map<string, { count: number; results: number; clicks: number }> = new Map();
  private recommendations: Array<{ shown: number; clicked: number; converted: number }> = [];
  
  constructor() {
    this.initializeSampleData();
  }

  private initializeSampleData(): void {
    // Initialize with sample marketplace data for directors
    const sampleTemplates: TemplateMetrics[] = [
      {
        templateId: 'tpl-character-dev-001',
        name: 'Character Development Framework',
        creatorId: 'creator-johnsmith',
        category: 'Pre-Production',
        metrics: {
          views: 2847,
          previews: 892,
          downloads: 267,
          purchases: 184,
          favorites: 156,
          shares: 43,
          ratings: { average: 4.7, count: 89, distribution: { 5: 67, 4: 18, 3: 3, 2: 1, 1: 0 } },
          revenue: { total: 3680, monthly: 920, weekly: 230 },
          conversionRates: {
            viewToPreview: 31.3,
            previewToDownload: 29.9,
            viewToFavorite: 5.5
          }
        },
        trends: {
          viewsGrowth: 23.5,
          revenueGrowth: 18.2,
          ratingTrend: 'improving'
        }
      },
      {
        templateId: 'tpl-scene-breakdown-002',
        name: 'Scene Breakdown Template',
        creatorId: 'creator-maryjones',
        category: 'Production',
        metrics: {
          views: 1934,
          previews: 578,
          downloads: 201,
          purchases: 145,
          favorites: 132,
          shares: 28,
          ratings: { average: 4.5, count: 67, distribution: { 5: 45, 4: 18, 3: 3, 2: 1, 1: 0 } },
          revenue: { total: 2900, monthly: 725, weekly: 181 },
          conversionRates: {
            viewToPreview: 29.9,
            previewToDownload: 34.8,
            viewToFavorite: 6.8
          }
        },
        trends: {
          viewsGrowth: 15.8,
          revenueGrowth: 22.1,
          ratingTrend: 'stable'
        }
      },
      {
        templateId: 'tpl-story-structure-003',
        name: 'Three-Act Story Structure',
        creatorId: 'creator-davidbrown',
        category: 'Writing',
        metrics: {
          views: 3521,
          previews: 1247,
          downloads: 421,
          purchases: 298,
          favorites: 245,
          shares: 67,
          ratings: { average: 4.8, count: 134, distribution: { 5: 102, 4: 28, 3: 3, 2: 1, 1: 0 } },
          revenue: { total: 5960, monthly: 1490, weekly: 373 },
          conversionRates: {
            viewToPreview: 35.4,
            previewToDownload: 33.8,
            viewToFavorite: 7.0
          }
        },
        trends: {
          viewsGrowth: 31.2,
          revenueGrowth: 28.7,
          ratingTrend: 'improving'
        }
      }
    ];

    sampleTemplates.forEach(template => {
      this.templateMetrics.set(template.templateId, template);
    });

    // Initialize creator metrics
    const sampleCreators: CreatorMetrics[] = [
      {
        creatorId: 'creator-johnsmith',
        name: 'John Smith',
        metrics: {
          totalTemplates: 8,
          totalRevenue: 12450,
          totalDownloads: 1847,
          averageRating: 4.6,
          followers: 234,
          topPerformingTemplate: {
            id: 'tpl-character-dev-001',
            name: 'Character Development Framework',
            revenue: 3680
          },
          recentPerformance: {
            period: 'last 30 days',
            revenue: 920,
            downloads: 267,
            newFollowers: 23
          }
        },
        trends: {
          revenueGrowth: 18.2,
          followerGrowth: 15.4,
          templatePerformance: 'improving'
        }
      },
      {
        creatorId: 'creator-maryjones',
        name: 'Mary Jones',
        metrics: {
          totalTemplates: 12,
          totalRevenue: 18750,
          totalDownloads: 2934,
          averageRating: 4.5,
          followers: 378,
          topPerformingTemplate: {
            id: 'tpl-production-schedule',
            name: 'Production Schedule Template',
            revenue: 4250
          },
          recentPerformance: {
            period: 'last 30 days',
            revenue: 1340,
            downloads: 421,
            newFollowers: 31
          }
        },
        trends: {
          revenueGrowth: 22.1,
          followerGrowth: 12.8,
          templatePerformance: 'stable'
        }
      }
    ];

    sampleCreators.forEach(creator => {
      this.creatorMetrics.set(creator.creatorId, creator);
    });

    // Initialize search queries data
    const sampleQueries = [
      { query: 'character development', count: 234, results: 12, clicks: 89 },
      { query: 'story structure', count: 189, results: 8, clicks: 67 },
      { query: 'director template', count: 156, results: 15, clicks: 54 },
      { query: 'pre production', count: 134, results: 9, clicks: 45 },
      { query: 'scene breakdown', count: 98, results: 6, clicks: 32 }
    ];

    sampleQueries.forEach(query => {
      this.searchQueries.set(query.query, query);
    });
  }

  /**
   * Track marketplace event
   */
  public trackEvent(
    type: MarketplaceEventType,
    properties: Record<string, any> = {},
    entityId?: string,
    entityType?: 'template' | 'creator' | 'category' | 'collection',
    value?: number
  ): void {
    const event: MarketplaceEvent = {
      id: this.generateEventId(),
      userId: this.getCurrentUserId(),
      sessionId: this.getCurrentSessionId(),
      timestamp: Date.now(),
      type,
      category: this.getCategoryForEventType(type),
      entityId,
      entityType,
      value,
      properties,
      metadata: {
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
        referrer: typeof document !== 'undefined' ? document.referrer : '',
        location: properties.location,
        deviceType: this.getDeviceType()
      }
    };

    this.events.push(event);
    
    // Update relevant metrics based on event type
    this.updateMetricsFromEvent(event);
    
    // Integrate with conversion tracking
    this.integrateWithConversionTracking(event);
  }

  private updateMetricsFromEvent(event: MarketplaceEvent): void {
    if (event.entityType === 'template' && event.entityId) {
      const template = this.templateMetrics.get(event.entityId);
      if (template) {
        switch (event.type) {
        case 'template_viewed':
          template.metrics.views++;
          break;
        case 'template_previewed':
          template.metrics.previews++;
          break;
        case 'template_downloaded':
          template.metrics.downloads++;
          break;
        case 'template_purchased':
          template.metrics.purchases++;
          if (event.value) {
            template.metrics.revenue.total += event.value;
          }
          break;
        case 'template_favorited':
          template.metrics.favorites++;
          break;
        case 'template_shared':
          template.metrics.shares++;
          break;
        }
        
        // Recalculate conversion rates
        this.updateTemplateConversionRates(template);
      }
    }
  }

  private updateTemplateConversionRates(template: TemplateMetrics): void {
    const { views, previews, downloads, favorites } = template.metrics;
    
    template.metrics.conversionRates = {
      viewToPreview: views > 0 ? (previews / views) * 100 : 0,
      previewToDownload: previews > 0 ? (downloads / previews) * 100 : 0,
      viewToFavorite: views > 0 ? (favorites / views) * 100 : 0
    };
  }

  private integrateWithConversionTracking(event: MarketplaceEvent): void {
    // Map marketplace events to conversion tracking events
    const conversionEventMap: Record<string, any> = {
      'template_purchased': 'subscription_upgraded',
      'template_downloaded': 'first_project_created',
      'premium_accessed': 'advanced_feature_used',
      'creator_followed': 'collaboration_invited'
    };

    const conversionEventType = conversionEventMap[event.type];
    if (conversionEventType) {
      conversionTracker.trackEvent(conversionEventType, {
        marketplace_event: true,
        original_event: event.type,
        entity_id: event.entityId,
        entity_type: event.entityType,
        ...event.properties
      }, event.value);
    }
  }

  /**
   * Get marketplace dashboard data
   */
  public getDashboardData(timeRange?: { startTime: number; endTime: number }): MarketplaceDashboardData {
    const templates = Array.from(this.templateMetrics.values());
    const creators = Array.from(this.creatorMetrics.values());
    
    const overview = {
      totalRevenue: templates.reduce((sum, t) => sum + t.metrics.revenue.total, 0),
      totalTransactions: templates.reduce((sum, t) => sum + t.metrics.purchases, 0),
      activeTemplates: templates.length,
      activeCreators: creators.length,
      averageRating: templates.reduce((sum, t) => sum + t.metrics.ratings.average, 0) / templates.length,
      conversionRate: this.calculateOverallConversionRate(templates)
    };

    const trends = {
      revenueGrowth: 24.3,
      transactionGrowth: 18.7,
      userGrowth: 15.2,
      topCategories: this.calculateTopCategories(templates)
    };

    const recommendations = {
      shown: 1847,
      clicked: 234,
      converted: 67,
      ctr: 12.7,
      conversionRate: 28.6
    };

    const searchAnalytics = {
      totalSearches: Array.from(this.searchQueries.values()).reduce((sum, q) => sum + q.count, 0),
      topQueries: Array.from(this.searchQueries.entries())
        .map(([query, data]) => ({
          query,
          count: data.count,
          resultsFound: data.results,
          ctr: data.results > 0 ? (data.clicks / data.count) * 100 : 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      zeroResultQueries: [
        { query: 'director ai assistant', count: 23 },
        { query: 'budget planning template', count: 18 },
        { query: 'casting workflow', count: 15 }
      ]
    };

    return {
      overview,
      trends,
      recommendations,
      searchAnalytics
    };
  }

  private calculateOverallConversionRate(templates: TemplateMetrics[]): number {
    const totalViews = templates.reduce((sum, t) => sum + t.metrics.views, 0);
    const totalPurchases = templates.reduce((sum, t) => sum + t.metrics.purchases, 0);
    return totalViews > 0 ? (totalPurchases / totalViews) * 100 : 0;
  }

  private calculateTopCategories(templates: TemplateMetrics[]): Array<{ category: string; revenue: number; growth: number }> {
    const categoryData = new Map<string, { revenue: number; growth: number }>();
    
    templates.forEach(template => {
      const existing = categoryData.get(template.category) || { revenue: 0, growth: 0 };
      categoryData.set(template.category, {
        revenue: existing.revenue + template.metrics.revenue.total,
        growth: (existing.growth + template.trends.revenueGrowth) / 2
      });
    });

    return Array.from(categoryData.entries())
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.revenue - a.revenue);
  }

  /**
   * Get template analytics
   */
  public getTemplateAnalytics(templateId: string): TemplateMetrics | null {
    return this.templateMetrics.get(templateId) || null;
  }

  /**
   * Get creator analytics
   */
  public getCreatorAnalytics(creatorId: string): CreatorMetrics | null {
    return this.creatorMetrics.get(creatorId) || null;
  }

  /**
   * Get top performing templates
   */
  public getTopPerformingTemplates(
    metric: 'revenue' | 'downloads' | 'rating' = 'revenue',
    limit: number = 10
  ): TemplateMetrics[] {
    const templates = Array.from(this.templateMetrics.values());
    
    return templates
      .sort((a, b) => {
        switch (metric) {
        case 'revenue':
          return b.metrics.revenue.total - a.metrics.revenue.total;
        case 'downloads':
          return b.metrics.downloads - a.metrics.downloads;
        case 'rating':
          return b.metrics.ratings.average - a.metrics.ratings.average;
        default:
          return 0;
        }
      })
      .slice(0, limit);
  }

  /**
   * Get search analytics
   */
  public getSearchAnalytics(): {
    topQueries: Array<{ query: string; count: number; ctr: number }>;
    zeroResultQueries: Array<{ query: string; count: number }>;
    averageCTR: number;
    } {
    const queries = Array.from(this.searchQueries.entries());
    const topQueries = queries
      .map(([query, data]) => ({
        query,
        count: data.count,
        ctr: data.count > 0 ? (data.clicks / data.count) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count);

    const averageCTR = topQueries.length > 0 
      ? topQueries.reduce((sum, q) => sum + q.ctr, 0) / topQueries.length 
      : 0;

    return {
      topQueries: topQueries.slice(0, 20),
      zeroResultQueries: [
        { query: 'director ai assistant', count: 23 },
        { query: 'budget planning template', count: 18 }
      ],
      averageCTR
    };
  }

  /**
   * Generate marketplace insights
   */
  public generateMarketplaceInsights(): Array<{
    type: 'opportunity' | 'trend' | 'optimization';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    action: string;
    metrics?: Record<string, number>;
  }> {
    return [
      {
        type: 'opportunity',
        title: 'High-Demand Content Gap',
        description: 'Director AI assistant searches have no results but high demand',
        impact: 'high',
        action: 'Create AI-powered director assistance templates',
        metrics: { searches: 23, potential_revenue: 1150 }
      },
      {
        type: 'trend',
        title: 'Story Structure Templates Trending',
        description: 'Story structure category showing 28.7% revenue growth',
        impact: 'medium',
        action: 'Expand story structure template collection',
        metrics: { growth_rate: 28.7, current_revenue: 5960 }
      },
      {
        type: 'optimization',
        title: 'Conversion Rate Opportunity',
        description: 'Template previews have low conversion to purchase (29.9%)',
        impact: 'medium',
        action: 'Improve preview experience and add purchase CTAs',
        metrics: { current_rate: 29.9, potential_increase: 15.0 }
      }
    ];
  }

  // Helper methods
  private generateEventId(): string {
    return `mkt_evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCurrentUserId(): string {
    return localStorage.getItem('userId') || 'anonymous';
  }

  private getCurrentSessionId(): string {
    return localStorage.getItem('sessionId') || 'session_' + Date.now();
  }

  private getCategoryForEventType(type: MarketplaceEventType): MarketplaceCategory {
    const categoryMap: Record<string, MarketplaceCategory> = {
      'marketplace_visited': 'discovery',
      'template_viewed': 'discovery',
      'template_favorited': 'engagement',
      'template_purchased': 'monetization',
      'creator_followed': 'engagement',
      'recommendation_shown': 'recommendation'
    };
    
    return categoryMap[type] || 'engagement';
  }

  private getDeviceType(): 'desktop' | 'mobile' | 'tablet' {
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'server';
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      return 'tablet';
    }
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
      return 'mobile';
    }
    return 'desktop';
  }
}

// Global instance
export const marketplaceMetrics = new MarketplaceMetrics();

export default marketplaceMetrics;