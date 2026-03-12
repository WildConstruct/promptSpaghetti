import { rest } from 'msw';
import type { RestContext, RestRequest, ResponseComposition } from 'msw';
import { faker } from '@faker-js/faker';

type TimeRange = '1d' | '7d' | '30d';

interface DailyStat {
  date: string;
  activeUsers: number;
  newUsers: number;
  templateViews: number;
  templateDownloads: number;
  templatesCreated: number;
  searchQueries: number;
  avgSessionDuration: number;
  bounceRate: number;
  conversionRate: number;
}

interface TemplateMetric {
  id: number;
  name: string;
  views: number;
  downloads: number;
  likes: number;
  rating: number;
  ratingCount: number;
}

interface SystemMetric {
  type: string;
  current: number;
  threshold: number;
  status: 'healthy' | 'warning' | 'critical';
  history: Array<{ timestamp: string; value: number }>; 
}

const createDailyStats = (days: number): DailyStat[] => {
  const result: DailyStat[] = [];
  for (let index = 0; index < days; index++) {
    const date = new Date();
    date.setDate(date.getDate() - index);
    result.push({
      date: date.toISOString().split('T')[0],
      activeUsers: faker.number.int({ min: 100, max: 800 }),
      newUsers: faker.number.int({ min: 10, max: 120 }),
      templateViews: faker.number.int({ min: 500, max: 5000 }),
      templateDownloads: faker.number.int({ min: 100, max: 1200 }),
      templatesCreated: faker.number.int({ min: 5, max: 80 }),
      searchQueries: faker.number.int({ min: 400, max: 4000 }),
      avgSessionDuration: faker.number.int({ min: 180, max: 1200 }),
      bounceRate: Number(faker.number.float({ min: 0.15, max: 0.5, fractionDigits: 2 })),
      conversionRate: Number(faker.number.float({ min: 0.04, max: 0.2, fractionDigits: 3 }))
    });
  }
  return result;
};

const createTemplateMetric = (id: number): TemplateMetric => ({
  id,
  name: `Template ${id}`,
  views: faker.number.int({ min: 50, max: 8000 }),
  downloads: faker.number.int({ min: 10, max: 1500 }),
  likes: faker.number.int({ min: 0, max: 500 }),
  rating: Number(faker.number.float({ min: 2, max: 5, fractionDigits: 1 })),
  ratingCount: faker.number.int({ min: 0, max: 250 })
});

const createSystemMetric = (type: string): SystemMetric => {
  const history: Array<{ timestamp: string; value: number }> = [];
  for (let index = 0; index < 24; index++) {
    const timestamp = new Date();
    timestamp.setHours(timestamp.getHours() - index);
    history.push({
      timestamp: timestamp.toISOString(),
      value: Number(faker.number.float({ min: 5, max: 95, fractionDigits: 2 }))
    });
  }

  const latest = history[0]?.value ?? 0;
  return {
    type,
    current: latest,
    threshold: 80,
    status: latest > 90 ? 'critical' : latest > 75 ? 'warning' : 'healthy',
    history: history.reverse()
  };
};

const dailyStats = createDailyStats(30);
const templateMetrics: TemplateMetric[] = [];
for (let index = 0; index < 25; index++) {
  templateMetrics.push(createTemplateMetric(index + 1));
}
const systemMetrics = ['cpu', 'memory', 'disk', 'network', 'api'].map(type =>
  createSystemMetric(type)
);

const getRangeDays = (range: string | null): number => {
  switch (range as TimeRange) {
    case '1d':
      return 1;
    case '30d':
      return 30;
    case '7d':
    default:
      return 7;
  }
};

const analyticsHandlers = [
  rest.get(
    '/api/analytics/overview',
    (req: RestRequest, res: ResponseComposition, ctx: RestContext) => {
      const rangeParam = req.url.searchParams.get('range');
      const days = getRangeDays(rangeParam);
      const recentStats = dailyStats.slice(0, days);

      const totals = recentStats.reduce(
        (acc, stat) => ({
          activeUsers: acc.activeUsers + stat.activeUsers,
          newUsers: acc.newUsers + stat.newUsers,
          templateViews: acc.templateViews + stat.templateViews,
          templateDownloads: acc.templateDownloads + stat.templateDownloads,
          templatesCreated: acc.templatesCreated + stat.templatesCreated,
          searchQueries: acc.searchQueries + stat.searchQueries
        }),
        {
          activeUsers: 0,
          newUsers: 0,
          templateViews: 0,
          templateDownloads: 0,
          templatesCreated: 0,
          searchQueries: 0
        }
      );

      const averages = {
        avgSessionDuration:
          recentStats.reduce((sum, stat) => sum + stat.avgSessionDuration, 0) /
          days,
        bounceRate:
          recentStats.reduce((sum, stat) => sum + stat.bounceRate, 0) / days,
        conversionRate:
          recentStats.reduce((sum, stat) => sum + stat.conversionRate, 0) / days
      };

      return res(
        ctx.status(200),
        ctx.json({
          timeRange: rangeParam ?? '7d',
          overview: {
            ...totals,
            ...averages,
            totalUsers: faker.number.int({ min: 5000, max: 15000 }),
            totalTemplates: faker.number.int({ min: 800, max: 6000 }),
            totalCategories: faker.number.int({ min: 20, max: 120 })
          },
          trends: recentStats,
          topTemplates: templateMetrics.slice(0, 10)
        })
      );
    }
  ),

  rest.get(
    '/api/analytics/users',
    (req: RestRequest, res: ResponseComposition, ctx: RestContext) => {
      const rangeParam = req.url.searchParams.get('range');
      const days = getRangeDays(rangeParam);
      const recentStats = dailyStats.slice(0, days);

      const acquisition = recentStats.map(stat => ({
        date: stat.date,
        newUsers: stat.newUsers,
        returningUsers: Math.max(stat.activeUsers - stat.newUsers, 0)
      }));

      return res(
        ctx.status(200),
        ctx.json({
          timeRange: rangeParam ?? '7d',
          acquisition,
          segments: {
            new: faker.number.int({ min: 200, max: 800 }),
            active: faker.number.int({ min: 600, max: 2000 }),
            returning: faker.number.int({ min: 250, max: 1000 }),
            churned: faker.number.int({ min: 80, max: 250 })
          },
          demographics: {
            countries: ['United States', 'United Kingdom', 'Canada', 'Germany'].map(
              country => ({
                country,
                users: faker.number.int({ min: 80, max: 500 })
              })
            ),
            industries: ['Marketing', 'Product', 'Engineering', 'Operations'].map(
              industry => ({
                industry,
                users: faker.number.int({ min: 60, max: 300 })
              })
            )
          }
        })
      );
    }
  ),

  rest.get(
    '/api/analytics/templates',
    (_req: RestRequest, res: ResponseComposition, ctx: RestContext) => {
      const ranked = [...templateMetrics].sort((a, b) => b.views - a.views);

      return res(
        ctx.status(200),
        ctx.json({
          topTemplates: ranked.slice(0, 15),
          mostDownloaded: [...templateMetrics]
            .sort((a, b) => b.downloads - a.downloads)
            .slice(0, 10),
          highestRated: [...templateMetrics]
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 10)
        })
      );
    }
  ),

  rest.get(
    '/api/analytics/system',
    (_req: RestRequest, res: ResponseComposition, ctx: RestContext) => {
      return res(
        ctx.status(200),
        ctx.json({
          metrics: systemMetrics,
          timestamp: new Date().toISOString()
        })
      );
    }
  )
];

export default analyticsHandlers;
