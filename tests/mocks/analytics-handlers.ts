/**
 * MSW Analytics API Handlers
 * 
 * Mock handlers for analytics and metrics endpoints including usage statistics,
 * performance metrics, user behavior tracking, and reporting.
 */

import { rest } from 'msw';
import { faker } from '@faker-js/faker';

// Mock analytics data storage
const mockAnalytics = {
  dailyStats: new Map<string, unknown>(),
  userActivity: new Map<number, unknown[]>(),
  templateMetrics: new Map<number, unknown>(),
  systemMetrics: new Map<string, unknown>()
};

// Generate sample analytics data
function generateSampleData() {
  // Generate daily stats for last 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    
    mockAnalytics.dailyStats.set(dateKey, {
      date: dateKey,
      activeUsers: faker.number.int({ min: 50, max: 500 }),
      newUsers: faker.number.int({ min: 5, max: 50 }),
      templateViews: faker.number.int({ min: 100, max: 2000 }),
      templateDownloads: faker.number.int({ min: 20, max: 300 }),
      templatesCreated: faker.number.int({ min: 1, max: 20 }),
      searchQueries: faker.number.int({ min: 200, max: 1500 }),
      avgSessionDuration: faker.number.int({ min: 180, max: 1200 }), // seconds
      bounceRate: faker.number.float({ min: 0.2, max: 0.6, fractionDigits: 2 }),
      conversionRate: faker.number.float({ min: 0.05, max: 0.25, fractionDigits: 3 })
    });
  }

  // Generate user activity data
  for (let userId = 1; userId <= 100; userId++) {
    const activities = [];
    const activityCount = faker.number.int({ min: 5, max: 50 });
    
    for (let i = 0; i < activityCount; i++) {
      activities.push({
        timestamp: faker.date.recent({ days: 30 }),
        action: faker.helpers.arrayElement(['view', 'download', 'create', 'update', 'delete', 'share', 'like']),
        resourceType: faker.helpers.arrayElement(['template', 'category', 'user', 'search']),
        resourceId: faker.number.int({ min: 1, max: 1000 }),
        metadata: {
          userAgent: faker.internet.userAgent(),
          ip: faker.internet.ip(),
          referrer: faker.internet.url(),
          duration: faker.number.int({ min: 10, max: 600 })
        }
      });
    }
    
    mockAnalytics.userActivity.set(userId, activities);
  }

  // Generate template metrics
  for (let templateId = 1; templateId <= 500; templateId++) {
    mockAnalytics.templateMetrics.set(templateId, {
      templateId,
      views: faker.number.int({ min: 10, max: 5000 }),
      downloads: faker.number.int({ min: 1, max: 1000 }),
      likes: faker.number.int({ min: 0, max: 200 }),
      shares: faker.number.int({ min: 0, max: 50 }),
      rating: faker.number.float({ min: 1, max: 5, fractionDigits: 1 }),
      ratingCount: faker.number.int({ min: 0, max: 100 }),
      avgSessionTime: faker.number.int({ min: 30, max: 600 }),
      bounceRate: faker.number.float({ min: 0.1, max: 0.8, fractionDigits: 2 }),
      conversionRate: faker.number.float({ min: 0.01, max: 0.3, fractionDigits: 3 }),
      popularityScore: faker.number.float({ min: 0, max: 100, fractionDigits: 1 }),
      lastViewed: faker.date.recent({ days: 7 })
    });
  }

  // Generate system metrics
  const systemMetricTypes = ['cpu', 'memory', 'disk', 'network', 'database', 'api'];
  systemMetricTypes.forEach(metricType => {
    const dataPoints = [];
    for (let i = 0; i < 24; i++) { // Last 24 hours
      const timestamp = new Date();
      timestamp.setHours(timestamp.getHours() - i);
      
      dataPoints.push({
        timestamp,
        value: faker.number.float({ min: 0, max: 100, fractionDigits: 2 }),
        threshold: 80,
        status: faker.helpers.arrayElement(['healthy', 'warning', 'critical'])
      });
    }
    
    mockAnalytics.systemMetrics.set(metricType, {
      type: metricType,
      current: dataPoints[0],
      history: dataPoints.reverse(),
      avg24h: faker.number.float({ min: 20, max: 80, fractionDigits: 2 }),
      max24h: faker.number.float({ min: 70, max: 100, fractionDigits: 2 }),
      min24h: faker.number.float({ min: 0, max: 30, fractionDigits: 2 })
    });
  });
}

// Initialize sample data
generateSampleData();

export     const timeRange = url.searchParams.get('range') || '7d';
    
    let days;
    switch (timeRange) {
    case '1d': days = 1; break;
    case '7d': days = 7; break;
    case '30d': days = 30; break;
    default: days = 7;
    }

    // Calculate totals from daily stats
    const recentStats = Array.from(mockAnalytics.dailyStats.values())
      .slice(0, days);

    const totals = recentStats.reduce((acc, stat) => ({
      activeUsers: acc.activeUsers + stat.activeUsers,
      newUsers: acc.newUsers + stat.newUsers,
      templateViews: acc.templateViews + stat.templateViews,
      templateDownloads: acc.templateDownloads + stat.templateDownloads,
      templatesCreated: acc.templatesCreated + stat.templatesCreated,
      searchQueries: acc.searchQueries + stat.searchQueries
    }), {
      activeUsers: 0,
      newUsers: 0,
      templateViews: 0,
      templateDownloads: 0,
      templatesCreated: 0,
      searchQueries: 0
    });

    const averages = {
      avgSessionDuration: recentStats.reduce((sum, stat) => sum + stat.avgSessionDuration, 0) / recentStats.length,
      bounceRate: recentStats.reduce((sum, stat) => sum + stat.bounceRate, 0) / recentStats.length,
      conversionRate: recentStats.reduce((sum, stat) => sum + stat.conversionRate, 0) / recentStats.length
    };

    return res(
      ctx.status(200),
      ctx.json({
        timeRange,
        overview: {
          ...totals,
          ...averages,
          totalUsers: faker.number.int({ min: 1000, max: 10000 }),
          totalTemplates: faker.number.int({ min: 500, max: 5000 }),
          totalCategories: faker.number.int({ min: 20, max: 100 })
        },
        trends: recentStats.reverse(),
        topTemplates: Array.from(mockAnalytics.templateMetrics.values())
          .sort((a, b) => b.views - a.views)
          .slice(0, 10),
        recentActivity: Array.from(mockAnalytics.userActivity.values())
          .flat()
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 20)
      })
    );
  }),

  // GET /api/analytics/users - Get user analytics
  rest.get('/api/analytics/users', (req, res, ctx) => {
    const url = new URL(req.url);
    const timeRange = url.searchParams.get('range') || '30d';
    // const segment = url.searchParams.get('segment'); // new, returning, active - unused for now

    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 1;
    const recentStats = Array.from(mockAnalytics.dailyStats.values()).slice(0, days);

    // User acquisition data
    const acquisitionData = recentStats.map(stat => ({
      date: stat.date,
      newUsers: stat.newUsers,
      returningUsers: stat.activeUsers - stat.newUsers
    }));

    // User behavior segments
    const segments = {
      new: faker.number.int({ min: 100, max: 500 }),
      active: faker.number.int({ min: 300, max: 1000 }),
      returning: faker.number.int({ min: 200, max: 800 }),
      churned: faker.number.int({ min: 50, max: 200 })
    };

    // Demographics (mock data)
    const demographics = {
      countries: [
        { country: 'United States', users: faker.number.int({ min: 200, max: 500 }), percentage: 35 },
        { country: 'United Kingdom', users: faker.number.int({ min: 100, max: 300 }), percentage: 18 },
        { country: 'Canada', users: faker.number.int({ min: 50, max: 200 }), percentage: 12 },
        { country: 'Germany', users: faker.number.int({ min: 80, max: 250 }), percentage: 15 },
        { country: 'Australia', users: faker.number.int({ min: 40, max: 150 }), percentage: 10 },
        { country: 'Others', users: faker.number.int({ min: 100, max: 300 }), percentage: 10 }
      ],
      devices: [
        { device: 'Desktop', users: faker.number.int({ min: 400, max: 800 }), percentage: 65 },
        { device: 'Mobile', users: faker.number.int({ min: 150, max: 350 }), percentage: 25 },
        { device: 'Tablet', users: faker.number.int({ min: 50, max: 150 }), percentage: 10 }
      ]
    };

    return res(
      ctx.status(200),
      ctx.json({
        timeRange,
        acquisitionData,
        segments,
        demographics,
        totalUsers: segments.new + segments.active + segments.returning
      })
    );
  }),

  // GET /api/analytics/templates - Get template analytics
  rest.get('/api/analytics/templates', (req, res, ctx) => {
    const url = new URL(req.url);
    const sortBy = url.searchParams.get('sortBy') || 'views';
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const categoryId = url.searchParams.get('categoryId');

    let templates = Array.from(mockAnalytics.templateMetrics.values());

    // Filter by category if provided
    if (categoryId) {
      // Mock filter - in real app would join with template data
      templates = templates.filter(() => Math.random() > 0.5);
    }

    // Sort templates
    templates.sort((a, b) => {
      switch (sortBy) {
      case 'downloads': return b.downloads - a.downloads;
      case 'likes': return b.likes - a.likes;
      case 'rating': return b.rating - a.rating;
      case 'popularity': return b.popularityScore - a.popularityScore;
      default: return b.views - a.views;
      }
    });

    templates = templates.slice(0, limit);

    // Calculate summary stats
    const summary = {
      totalTemplates: mockAnalytics.templateMetrics.size,
      totalViews: Array.from(mockAnalytics.templateMetrics.values()).reduce((sum, t) => sum + t.views, 0),
      totalDownloads: Array.from(mockAnalytics.templateMetrics.values()).reduce((sum, t) => sum + t.downloads, 0),
      avgRating: Array.from(mockAnalytics.templateMetrics.values())
        .reduce((sum, t) => sum + (t as { rating: number }).rating, 0) / mockAnalytics.templateMetrics.size,
      topPerformer: templates[0]
    };

    return res(
      ctx.status(200),
      ctx.json({
        templates,
        summary,
        sortBy,
        total: mockAnalytics.templateMetrics.size
      })
    );
  }),

  // GET /api/analytics/performance - Get system performance metrics
  rest.get('/api/analytics/performance', (req, res, ctx) => {
    const url = new URL(req.url);
    const metric = url.searchParams.get('metric') || 'all';
    const timeRange = url.searchParams.get('range') || '24h';

    if (metric !== 'all') {
      const metricData = mockAnalytics.systemMetrics.get(metric);
      if (!metricData) {
        return res(
          ctx.status(404),
          ctx.json({
            error: 'Not Found',
            message: 'Metric not found'
          })
        );
      }

      return res(
        ctx.status(200),
        ctx.json({ metric: metricData })
      );
    }

    // Return all metrics
    const allMetrics = {};
    mockAnalytics.systemMetrics.forEach((value, key) => {
      allMetrics[key] = value;
    });

    // Calculate system health score
    const healthScore = Array.from(mockAnalytics.systemMetrics.values())
      .reduce((sum, metric) => sum + (100 - metric.current.value), 0) / mockAnalytics.systemMetrics.size;

    return res(
      ctx.status(200),
      ctx.json({
        metrics: allMetrics,
        healthScore: Math.max(0, healthScore),
        status: healthScore > 80 ? 'healthy' : healthScore > 60 ? 'warning' : 'critical',
        timeRange
      })
    );
  }),

  // GET /api/analytics/search - Get search analytics
  rest.get('/api/analytics/search', (req, res, ctx) => {
    const url = new URL(req.url);
    const timeRange = url.searchParams.get('range') || '7d';

    // Generate mock search data
    const topSearches = [
      { query: 'business proposal', count: faker.number.int({ min: 100, max: 500 }), trend: 'up' },
      { query: 'marketing email', count: faker.number.int({ min: 80, max: 400 }), trend: 'down' },
      { query: 'project plan', count: faker.number.int({ min: 90, max: 350 }), trend: 'up' },
      { query: 'user story', count: faker.number.int({ min: 70, max: 300 }), trend: 'stable' },
      { query: 'api documentation', count: faker.number.int({ min: 60, max: 250 }), trend: 'up' },
      { query: 'meeting notes', count: faker.number.int({ min: 50, max: 200 }), trend: 'down' },
      { query: 'sales pitch', count: faker.number.int({ min: 45, max: 180 }), trend: 'stable' },
      { query: 'technical spec', count: faker.number.int({ min: 40, max: 160 }), trend: 'up' },
      { query: 'blog post', count: faker.number.int({ min: 35, max: 140 }), trend: 'down' },
      { query: 'code review', count: faker.number.int({ min: 30, max: 120 }), trend: 'stable' }
    ];

    const searchStats = {
      totalQueries: topSearches.reduce((sum, search) => sum + search.count, 0),
      uniqueQueries: faker.number.int({ min: 500, max: 2000 }),
      avgResultsShown: faker.number.float({ min: 8.5, max: 15.2, fractionDigits: 1 }),
      avgClickThrough: faker.number.float({ min: 0.15, max: 0.35, fractionDigits: 3 }),
      noResultsRate: faker.number.float({ min: 0.05, max: 0.15, fractionDigits: 3 })
    };

    return res(
      ctx.status(200),
      ctx.json({
        timeRange,
        topSearches,
        stats: searchStats,
        trends: {
          searchVolume: faker.helpers.arrayElement(['increasing', 'decreasing', 'stable']),
          clickThroughRate: faker.helpers.arrayElement(['improving', 'declining', 'stable']),
          resultRelevance: faker.helpers.arrayElement(['high', 'medium', 'low'])
        }
      })
    );
  }),

  // GET /api/analytics/revenue - Get revenue analytics (mock for premium features)
  rest.get('/api/analytics/revenue', (req, res, ctx) => {
    const url = new URL(req.url);
    const timeRange = url.searchParams.get('range') || '30d';

    const revenueData = {
      totalRevenue: faker.number.float({ min: 10000, max: 50000, fractionDigits: 2 }),
      monthlyRecurring: faker.number.float({ min: 5000, max: 25000, fractionDigits: 2 }),
      averageRevenuePerUser: faker.number.float({ min: 15, max: 45, fractionDigits: 2 }),
      churnRate: faker.number.float({ min: 0.05, max: 0.15, fractionDigits: 3 }),
      subscriptions: {
        free: faker.number.int({ min: 800, max: 2000 }),
        basic: faker.number.int({ min: 200, max: 600 }),
        pro: faker.number.int({ min: 50, max: 200 }),
        enterprise: faker.number.int({ min: 10, max: 50 })
      }
    };

    // Daily revenue trend
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 1;
    const dailyRevenue = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dailyRevenue.push({
        date: date.toISOString().split('T')[0],
        revenue: faker.number.float({ min: 200, max: 2000, fractionDigits: 2 }),
        subscriptions: faker.number.int({ min: 5, max: 50 }),
        cancellations: faker.number.int({ min: 0, max: 10 })
      });
    }

    return res(
      ctx.status(200),
      ctx.json({
        timeRange,
        ...revenueData,
        dailyTrend: dailyRevenue.reverse()
      })
    );
  }),

  // POST /api/analytics/events - Track custom events
  rest.post('/api/analytics/events', async (req, res, ctx) => {
    try {
      const eventData = await req.json();

      if (!eventData.event || !eventData.userId) {
        return res(
          ctx.status(400),
          ctx.json({
            error: 'Validation Error',
            message: 'Event name and userId are required'
          })
        );
      }

      // Store event (in real app would persist to database/analytics service)
      const event = {
        id: faker.string.uuid(),
        event: eventData.event,
        userId: eventData.userId,
        properties: eventData.properties || {},
        timestamp: new Date(),
        sessionId: eventData.sessionId,
        userAgent: eventData.userAgent,
        ip: faker.internet.ip()
      };

      return res(
        ctx.status(201),
        ctx.json({
          eventId: event.id,
          message: 'Event tracked successfully'
        })
      );

    } catch {
      return res(
        ctx.status(500),
        ctx.json({
          error: 'Internal Server Error',
          message: 'Event tracking failed'
        })
      );
    }
  }),

  // GET /api/analytics/reports/:reportId - Get specific report
  rest.get('/api/analytics/reports/:reportId', (req, res, ctx) => {
    const { reportId } = req.params;
    
    const reportTypes = {
      'user-engagement': {
        name: 'User Engagement Report',
        description: 'Detailed analysis of user engagement metrics',
        data: {
          dailyActiveUsers: faker.number.int({ min: 200, max: 800 }),
          weeklyActiveUsers: faker.number.int({ min: 1000, max: 3000 }),
          monthlyActiveUsers: faker.number.int({ min: 3000, max: 8000 }),
          sessionDuration: faker.number.int({ min: 300, max: 1200 }),
          pagesPerSession: faker.number.float({ min: 2.5, max: 8.5, fractionDigits: 1 }),
          engagementRate: faker.number.float({ min: 0.45, max: 0.85, fractionDigits: 3 })
        }
      },
      'content-performance': {
        name: 'Content Performance Report',
        description: 'Analysis of template and content performance',
        data: {
          topPerformingTemplates: Array.from(mockAnalytics.templateMetrics.values())
            .sort((a, b) => b.views - a.views)
            .slice(0, 20),
          contentCategories: {
            business: { views: faker.number.int({ min: 5000, max: 15000 }), engagement: 0.65 },
            development: { views: faker.number.int({ min: 4000, max: 12000 }), engagement: 0.72 },
            marketing: { views: faker.number.int({ min: 3500, max: 10000 }), engagement: 0.58 },
            education: { views: faker.number.int({ min: 2000, max: 8000 }), engagement: 0.45 }
          }
        }
      }
    };

    const report = reportTypes[reportId];
    
    if (!report) {
      return res(
        ctx.status(404),
        ctx.json({
          error: 'Not Found',
          message: 'Report not found'
        })
      );
    }

    return res(
      ctx.status(200),
      ctx.json({
        reportId,
        ...report,
        generatedAt: new Date(),
        period: '30 days'
      })
    );
  })
];

// Export function to reset mock data for tests
export function resetAnalyticsData() {
  mockAnalytics.dailyStats.clear();
  mockAnalytics.userActivity.clear();
  mockAnalytics.templateMetrics.clear();
  mockAnalytics.systemMetrics.clear();
  
  generateSampleData();
}