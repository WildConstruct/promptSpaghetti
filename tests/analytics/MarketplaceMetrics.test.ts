/**
 * Marketplace Metrics Test Suite - E17-1753114397415-AFF06F
 *
 * Comprehensive tests for marketplace analytics functionality
 */

import { MarketplaceMetrics } from '../packages/core/analytics/MarketplaceMetrics';
import { conversionTracker } from '../packages/core/analytics/ConversionTracker';

// Mock browser APIs
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(() => 'test-user-123'),
    setItem: jest.fn<unknown[], unknown>(),
    removeItem: jest.fn<unknown[], unknown>()
  },
  writable: true
});

Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: jest.fn<unknown[], unknown>(),
    setItem: jest.fn<unknown[], unknown>()
  },
  writable: true
});

Object.defineProperty(navigator, 'userAgent', {
  value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  writable: true
});

Object.defineProperty(document, 'referrer', {
  value: 'https://example.com',
  writable: true
});

// Mock conversion tracker
jest.mock('../packages/core/analytics/ConversionTracker', () => ({
  conversionTracker: {
    trackEvent: jest.fn<unknown[], unknown>()
  }
}));

describe('MarketplaceMetrics', () => {
  let marketplaceMetrics: MarketplaceMetrics;

  beforeEach(() => {
    marketplaceMetrics = new MarketplaceMetrics();
    jest.clearAllMocks();
  });

  describe('Event Tracking', () => {
    test('tracks marketplace events correctly', () => {
      marketplaceMetrics.trackEvent(
        'template_viewed',
        { category: 'Pre-Production', user_role: 'director' },
        'template-123',
        'template'
      );

      expect(marketplaceMetrics['events']).toHaveLength(1);

      const event = marketplaceMetrics['events'][0];
      expect(event.type).toBe('template_viewed');
      expect(event.entityId).toBe('template-123');
      expect(event.entityType).toBe('template');
      expect(event.properties).toEqual({
        category: 'Pre-Production',
        user_role: 'director'
      });
    });

    test('tracks template purchase with revenue', () => {
      marketplaceMetrics.trackEvent(
        'template_purchased',
        { payment_method: 'credit_card' },
        'template-123',
        'template',
        19.99
      );

      const event = marketplaceMetrics['events'][0];
      expect(event.type).toBe('template_purchased');
      expect(event.value).toBe(19.99);
      expect(event.properties.payment_method).toBe('credit_card');
    });

    test('tracks search events', () => {
      marketplaceMetrics.trackEvent('search_performed', {
        query: 'character development',
        results_count: 12,
        user_role: 'director'
      });

      const event = marketplaceMetrics['events'][0];
      expect(event.type).toBe('search_performed');
      expect(event.properties.query).toBe('character development');
      expect(event.properties.results_count).toBe(12);
    });

    test('categorizes events correctly', () => {
      const testCases = [
        { type: 'marketplace_visited', expectedCategory: 'discovery' },
        { type: 'template_favorited', expectedCategory: 'engagement' },
        { type: 'template_purchased', expectedCategory: 'monetization' },
        { type: 'recommendation_shown', expectedCategory: 'recommendation' }
      ];

      testCases.forEach(({ type, expectedCategory }) => {
        marketplaceMetrics.trackEvent(type as any, {});
        const event = marketplaceMetrics['events'].slice(-1)[0];
        expect(event.category).toBe(expectedCategory);
      });
    });
  });

  describe('Template Metrics Updates', () => {
    test('updates template views correctly', () => {
      const templateId = 'tpl-character-dev-001';
      const initialTemplate =
        marketplaceMetrics.getTemplateAnalytics(templateId);
      const initialViews = initialTemplate?.metrics.views || 0;

      marketplaceMetrics.trackEvent(
        'template_viewed',
        {},
        templateId,
        'template'
      );

      const updatedTemplate =
        marketplaceMetrics.getTemplateAnalytics(templateId);
      expect(updatedTemplate?.metrics.views).toBe(initialViews + 1);
    });

    test('updates template revenue on purchase', () => {
      const templateId = 'tpl-character-dev-001';
      const initialTemplate =
        marketplaceMetrics.getTemplateAnalytics(templateId);
      const initialRevenue = initialTemplate?.metrics.revenue.total || 0;
      const purchaseAmount = 24.99;

      marketplaceMetrics.trackEvent(
        'template_purchased',
        {},
        templateId,
        'template',
        purchaseAmount
      );

      const updatedTemplate =
        marketplaceMetrics.getTemplateAnalytics(templateId);
      expect(updatedTemplate?.metrics.revenue.total).toBe(
        initialRevenue + purchaseAmount
      );
      expect(updatedTemplate?.metrics.purchases).toBeGreaterThan(0);
    });

    test('recalculates conversion rates after updates', () => {
      const templateId = 'tpl-character-dev-001';

      // Track views and previews
      marketplaceMetrics.trackEvent(
        'template_viewed',
        {},
        templateId,
        'template'
      );
      marketplaceMetrics.trackEvent(
        'template_viewed',
        {},
        templateId,
        'template'
      );
      marketplaceMetrics.trackEvent(
        'template_previewed',
        {},
        templateId,
        'template'
      );

      const template = marketplaceMetrics.getTemplateAnalytics(templateId);
      expect(template?.metrics.conversionRates.viewToPreview).toBeGreaterThan(
        0
      );
    });
  });

  describe('Dashboard Data Generation', () => {
    test('generates comprehensive dashboard data', () => {
      const dashboardData = marketplaceMetrics.getDashboardData();

      expect(dashboardData).toHaveProperty('overview');
      expect(dashboardData).toHaveProperty('trends');
      expect(dashboardData).toHaveProperty('recommendations');
      expect(dashboardData).toHaveProperty('searchAnalytics');

      // Check overview structure
      expect(dashboardData.overview).toHaveProperty('totalRevenue');
      expect(dashboardData.overview).toHaveProperty('totalTransactions');
      expect(dashboardData.overview).toHaveProperty('activeTemplates');
      expect(dashboardData.overview).toHaveProperty('conversionRate');

      // Check trends structure
      expect(dashboardData.trends).toHaveProperty('topCategories');
      expect(dashboardData.trends.topCategories).toBeInstanceOf(Array);
    });

    test('calculates overall conversion rate correctly', () => {
      const dashboardData = marketplaceMetrics.getDashboardData();
      expect(dashboardData.overview.conversionRate).toBeGreaterThanOrEqual(0);
      expect(dashboardData.overview.conversionRate).toBeLessThanOrEqual(100);
    });

    test('sorts top categories by revenue', () => {
      const dashboardData = marketplaceMetrics.getDashboardData();
      const categories = dashboardData.trends.topCategories;

      for (let i = 1; i < categories.length; i++) {
        expect(categories[i - 1].revenue).toBeGreaterThanOrEqual(
          categories[i].revenue
        );
      }
    });
  });

  describe('Template Analytics', () => {
    test('retrieves template analytics by ID', () => {
      const templateId = 'tpl-character-dev-001';
      const analytics = marketplaceMetrics.getTemplateAnalytics(templateId);

      expect(analytics).toBeTruthy();
      expect(analytics?.templateId).toBe(templateId);
      expect(analytics?.metrics).toHaveProperty('views');
      expect(analytics?.metrics).toHaveProperty('revenue');
      expect(analytics?.trends).toHaveProperty('viewsGrowth');
    });

    test('returns null for non-existent template', () => {
      const analytics = marketplaceMetrics.getTemplateAnalytics(
        'non-existent-template'
      );
      expect(analytics).toBeNull();
    });

    test('gets top performing templates by revenue', () => {
      const topTemplates = marketplaceMetrics.getTopPerformingTemplates(
        'revenue',
        5
      );

      expect(topTemplates).toHaveLength(3); // Based on sample data
      expect(topTemplates[0].metrics.revenue.total).toBeGreaterThanOrEqual(
        topTemplates[1].metrics.revenue.total
      );
    });

    test('gets top performing templates by downloads', () => {
      const topTemplates = marketplaceMetrics.getTopPerformingTemplates(
        'downloads',
        5
      );

      expect(topTemplates[0].metrics.downloads).toBeGreaterThanOrEqual(
        topTemplates[1].metrics.downloads
      );
    });

    test('gets top performing templates by rating', () => {
      const topTemplates = marketplaceMetrics.getTopPerformingTemplates(
        'rating',
        5
      );

      expect(topTemplates[0].metrics.ratings.average).toBeGreaterThanOrEqual(
        topTemplates[1].metrics.ratings.average
      );
    });
  });

  describe('Creator Analytics', () => {
    test('retrieves creator analytics by ID', () => {
      const creatorId = 'creator-johnsmith';
      const analytics = marketplaceMetrics.getCreatorAnalytics(creatorId);

      expect(analytics).toBeTruthy();
      expect(analytics?.creatorId).toBe(creatorId);
      expect(analytics?.metrics).toHaveProperty('totalTemplates');
      expect(analytics?.metrics).toHaveProperty('totalRevenue');
      expect(analytics?.trends).toHaveProperty('revenueGrowth');
    });

    test('returns null for non-existent creator', () => {
      const analytics = marketplaceMetrics.getCreatorAnalytics(
        'non-existent-creator'
      );
      expect(analytics).toBeNull();
    });
  });

  describe('Search Analytics', () => {
    test('retrieves search analytics data', () => {
      const searchAnalytics = marketplaceMetrics.getSearchAnalytics();

      expect(searchAnalytics).toHaveProperty('topQueries');
      expect(searchAnalytics).toHaveProperty('zeroResultQueries');
      expect(searchAnalytics).toHaveProperty('averageCTR');

      expect(searchAnalytics.topQueries).toBeInstanceOf(Array);
      expect(searchAnalytics.zeroResultQueries).toBeInstanceOf(Array);
      expect(typeof searchAnalytics.averageCTR).toBe('number');
    });

    test('sorts queries by search count', () => {
      const searchAnalytics = marketplaceMetrics.getSearchAnalytics();
      const queries = searchAnalytics.topQueries;

      for (let i = 1; i < queries.length; i++) {
        expect(queries[i - 1].count).toBeGreaterThanOrEqual(queries[i].count);
      }
    });

    test('calculates CTR correctly', () => {
      const searchAnalytics = marketplaceMetrics.getSearchAnalytics();

      searchAnalytics.topQueries.forEach(query => {
        expect(query.ctr).toBeGreaterThanOrEqual(0);
        expect(query.ctr).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('Marketplace Insights', () => {
    test('generates actionable insights', () => {
      const insights = marketplaceMetrics.generateMarketplaceInsights();

      expect(insights).toBeInstanceOf(Array);
      expect(insights.length).toBeGreaterThan(0);

      insights.forEach(insight => {
        expect(insight).toHaveProperty('type');
        expect(insight).toHaveProperty('title');
        expect(insight).toHaveProperty('description');
        expect(insight).toHaveProperty('impact');
        expect(insight).toHaveProperty('action');

        expect(['opportunity', 'trend', 'optimization']).toContain(
          insight.type
        );
        expect(['high', 'medium', 'low']).toContain(insight.impact);
      });
    });

    test('includes relevant metrics in insights', () => {
      const insights = marketplaceMetrics.generateMarketplaceInsights();

      const insightsWithMetrics = insights.filter(insight => insight.metrics);
      expect(insightsWithMetrics.length).toBeGreaterThan(0);

      insightsWithMetrics.forEach(insight => {
        expect(typeof insight.metrics).toBe('object');
      });
    });
  });

  describe('Conversion Tracking Integration', () => {
    test('integrates with conversion tracker for purchases', () => {
      marketplaceMetrics.trackEvent(
        'template_purchased',
        { user_role: 'director' },
        'template-123',
        'template',
        29.99
      );

      expect(conversionTracker.trackEvent).toHaveBeenCalledWith(
        'subscription_upgraded',
        expect.objectContaining({
          marketplace_event: true,
          original_event: 'template_purchased',
          entity_id: 'template-123',
          entity_type: 'template',
          user_role: 'director'
        }),
        29.99
      );
    });

    test('integrates with conversion tracker for downloads', () => {
      marketplaceMetrics.trackEvent(
        'template_downloaded',
        { user_role: 'director' },
        'template-123',
        'template'
      );

      expect(conversionTracker.trackEvent).toHaveBeenCalledWith(
        'first_project_created',
        expect.objectContaining({
          marketplace_event: true,
          original_event: 'template_downloaded'
        }),
        undefined
      );
    });
  });

  describe('Performance and Memory', () => {
    test('handles large number of events efficiently', () => {
      const startTime = performance.now();

      // Track 1000 events
      for (let i = 0; i < 1000; i++) {
        marketplaceMetrics.trackEvent(
          'template_viewed',
          { iteration: i },
          `template-${i % 10}`,
          'template'
        );
      }

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // Should complete within reasonable time (< 100ms)
      expect(executionTime).toBeLessThan(100);
      expect(marketplaceMetrics['events']).toHaveLength(1000);
    });

    test('dashboard data generation scales with data size', () => {
      // Generate events for multiple templates
      for (let i = 0; i < 100; i++) {
        marketplaceMetrics.trackEvent(
          'template_viewed',
          {},
          `template-${i}`,
          'template'
        );
        marketplaceMetrics.trackEvent(
          'template_purchased',
          {},
          `template-${i}`,
          'template',
          19.99
        );
      }

      const startTime = performance.now();
      const dashboardData = marketplaceMetrics.getDashboardData();
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(50); // Should be fast
      expect(dashboardData).toBeTruthy();
    });
  });

  describe('Data Validation', () => {
    test('validates event data structure', () => {
      marketplaceMetrics.trackEvent(
        'template_viewed',
        { test: 'data' },
        'template-123',
        'template'
      );

      const event = marketplaceMetrics['events'][0];

      expect(event).toHaveProperty('id');
      expect(event).toHaveProperty('userId');
      expect(event).toHaveProperty('sessionId');
      expect(event).toHaveProperty('timestamp');
      expect(event).toHaveProperty('type');
      expect(event).toHaveProperty('category');
      expect(event).toHaveProperty('metadata');

      expect(typeof event.id).toBe('string');
      expect(typeof event.timestamp).toBe('number');
      expect(event.metadata).toHaveProperty('userAgent');
    });

    test('handles edge cases gracefully', () => {
      // Test with undefined/null values
      expect(() => {
        marketplaceMetrics.trackEvent(
          'template_viewed',
          {},
          undefined,
          undefined,
          undefined
        );
      }).not.toThrow();

      // Test with empty properties
      expect(() => {
        marketplaceMetrics.trackEvent('search_performed', {});
      }).not.toThrow();
    });

    test('maintains data consistency across operations', () => {
      const templateId = 'consistency-test-template';

      // Perform multiple operations
      marketplaceMetrics.trackEvent(
        'template_viewed',
        {},
        templateId,
        'template'
      );
      marketplaceMetrics.trackEvent(
        'template_previewed',
        {},
        templateId,
        'template'
      );
      marketplaceMetrics.trackEvent(
        'template_purchased',
        {},
        templateId,
        'template',
        25.0
      );

      const template = marketplaceMetrics.getTemplateAnalytics(templateId);
      const dashboardData = marketplaceMetrics.getDashboardData();

      // Verify consistency
      expect(template).toBeTruthy();
      expect(dashboardData.overview.totalRevenue).toBeGreaterThan(0);
      expect(dashboardData.overview.totalTransactions).toBeGreaterThan(0);
    });
  });
});

// Integration tests with React hooks
describe('MarketplaceMetrics React Integration', () => {
  test('can be imported and used in React components', () => {
    // This test ensures the module structure is compatible with React
    expect(MarketplaceMetrics).toBeDefined();
    expect(marketplaceMetrics).toBeDefined();
    expect(typeof marketplaceMetrics.trackEvent).toBe('function');
    expect(typeof marketplaceMetrics.getDashboardData).toBe('function');
  });
});

describe('MarketplaceMetrics Business Logic', () => {
  test('correctly identifies high-performing templates', () => {
    const metrics = new MarketplaceMetrics();
    const topTemplates = metrics.getTopPerformingTemplates('revenue', 3);

    // Based on sample data, story structure should be top performer
    expect(topTemplates[0].name).toBe('Three-Act Story Structure');
    expect(topTemplates[0].metrics.revenue.total).toBe(5960);
  });

  test('provides meaningful insights based on data patterns', () => {
    const metrics = new MarketplaceMetrics();
    const insights = metrics.generateMarketplaceInsights();

    // Should identify content gaps
    const contentGapInsight = insights.find(i => i.type === 'opportunity');
    expect(contentGapInsight).toBeTruthy();
    expect(contentGapInsight?.title).toContain('Content Gap');

    // Should identify trends
    const trendInsight = insights.find(i => i.type === 'trend');
    expect(trendInsight).toBeTruthy();
    expect(trendInsight?.description).toContain('growth');
  });
});
