import { z } from 'zod';

// Core Analytics Enums
export enum MetricType {
  VIEWS = 'views',
  DOWNLOADS = 'downloads',
  LIKES = 'likes',
  RATINGS = 'ratings',
  REVENUE = 'revenue',
  USAGE_TIME = 'usage_time',
  ERROR_RATE = 'error_rate',
  CONVERSION = 'conversion'
}

export enum TimeRange {
  LAST_24H = 'last_24h',
  LAST_7D = 'last_7d',
  LAST_30D = 'last_30d',
  LAST_90D = 'last_90d',
  LAST_YEAR = 'last_year',
  ALL_TIME = 'all_time',
  CUSTOM = 'custom'
}

export enum AggregationType {
  SUM = 'sum',
  AVERAGE = 'average',
  COUNT = 'count',
  UNIQUE = 'unique',
  MAX = 'max',
  MIN = 'min',
  MEDIAN = 'median'
}

export enum DashboardLayout {
  GRID = 'grid',
  LIST = 'list',
  CHARTS = 'charts',
  MIXED = 'mixed'
}

// Analytics Data Interfaces
export interface AnalyticsEvent {
  id: string;
  template_id: string;
  user_id?: string;
  event_type: MetricType;
  event_data: Record<string, any>;
  metadata: {
    user_agent?: string;
    ip_address?: string;
    referrer?: string;
    session_id?: string;
    device_type?: string;
    location?: {
      country?: string;
      region?: string;
      city?: string;
    };
  };
  timestamp: Date;
  created_at: Date;
}

export interface TemplateMetrics {
  template_id: string;
  period_start: Date;
  period_end: Date;
  metrics: {
    views: number;
    unique_views: number;
    downloads: number;
    likes: number;
    average_rating: number;
    total_ratings: number;
    revenue: number;
    usage_minutes: number;
    error_count: number;
    success_rate: number;
    conversion_rate: number;
  };
  demographics: {
    top_countries: Array<{ country: string; count: number; percentage: number }>;
    device_breakdown: Array<{ device: string; count: number; percentage: number }>;
    user_segments: Array<{ segment: string; count: number; percentage: number }>;
  };
  trends: {
    daily_metrics: Array<{
      date: Date;
      views: number;
      downloads: number;
      revenue: number;
    }>;
    growth_rates: {
      views_growth: number;
      downloads_growth: number;
      revenue_growth: number;
    };
  };
}

export interface CreatorDashboard {
  creator_id: string;
  period: TimeRange;
  period_start: Date;
  period_end: Date;
  overview: {
    total_templates: number;
    active_templates: number;
    total_views: number;
    total_downloads: number;
    total_revenue: number;
    average_rating: number;
    top_performing_template: {
      id: string;
      title: string;
      views: number;
      downloads: number;
      revenue: number;
    };
  };
  performance_summary: {
    views_trend: number;
    downloads_trend: number;
    revenue_trend: number;
    rating_trend: number;
    market_share: number;
    ranking_position: number;
  };
  traffic_metrics: {
    unique_visitors: number;
    returning_visitors: number;
    bounce_rate: number;
    average_session_duration: number;
    top_referrers: Array<{ source: string; visits: number; percentage: number }>;
  };
  financial_metrics: {
    gross_revenue: number;
    net_revenue: number;
    platform_fee: number;
    payout_amount: number;
    revenue_by_template: Array<{
      template_id: string;
      title: string;
      revenue: number;
      percentage: number;
    }>;
  };
}

export interface AnalyticsQuery {
  creator_id?: string;
  template_ids?: string[];
  metric_types: MetricType[];
  time_range: TimeRange;
  start_date?: Date;
  end_date?: Date;
  aggregation: AggregationType;
  group_by?: string[];
  filters?: {
    countries?: string[];
    device_types?: string[];
    user_segments?: string[];
    min_value?: number;
    max_value?: number;
  };
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  limit?: number;
  offset?: number;
}

export interface CustomReport {
  id: string;
  creator_id: string;
  name: string;
  description?: string;
  configuration: {
    query: AnalyticsQuery;
    visualization: {
      chart_type: 'line' | 'bar' | 'pie' | 'area' | 'table' | 'metric';
      layout: DashboardLayout;
      show_legend: boolean;
      show_grid: boolean;
      color_scheme: string;
    };
    refresh_interval?: number;
  };
  is_scheduled: boolean;
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    recipients: string[];
  };
  created_at: Date;
  updated_at: Date;
}

export interface AnalyticsInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'opportunity' | 'warning';
  title: string;
  description: string;
  data: {
    metric: MetricType;
    current_value: number;
    previous_value: number;
    change_percentage: number;
    confidence_score: number;
  };
  recommendations?: string[];
  created_at: Date;
}

// Zod Validation Schemas
export const AnalyticsEventSchema = z.object({
  template_id: z.string().uuid(),
  user_id: z.string().uuid().optional(),
  event_type: z.nativeEnum(MetricType),
  event_data: z.record(z.any()),
  metadata: z.object({
    user_agent: z.string().optional(),
    ip_address: z.string().ip().optional(),
    referrer: z.string().url().optional(),
    session_id: z.string().optional(),
    device_type: z.string().optional(),
    location: z.object({
      country: z.string().optional(),
      region: z.string().optional(),
      city: z.string().optional()
    }).optional()
  })
});

export const AnalyticsQuerySchema = z.object({
  creator_id: z.string().uuid().optional(),
  template_ids: z.array(z.string().uuid()).optional(),
  metric_types: z.array(z.nativeEnum(MetricType)).min(1),
  time_range: z.nativeEnum(TimeRange),
  start_date: z.coerce.date().optional(),
  end_date: z.coerce.date().optional(),
  aggregation: z.nativeEnum(AggregationType),
  group_by: z.array(z.string()).optional(),
  filters: z.object({
    countries: z.array(z.string()).optional(),
    device_types: z.array(z.string()).optional(),
    user_segments: z.array(z.string()).optional(),
    min_value: z.number().optional(),
    max_value: z.number().optional()
  }).optional(),
  sort: z.object({
    field: z.string(),
    direction: z.enum(['asc', 'desc'])
  }).optional(),
  limit: z.number().min(1).max(1000).default(100),
  offset: z.number().min(0).default(0)
});

export const CustomReportSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  configuration: z.object({
    query: AnalyticsQuerySchema,
    visualization: z.object({
      chart_type: z.enum(['line', 'bar', 'pie', 'area', 'table', 'metric']),
      layout: z.nativeEnum(DashboardLayout),
      show_legend: z.boolean().default(true),
      show_grid: z.boolean().default(true),
      color_scheme: z.string().default('default')
    }),
    refresh_interval: z.number().min(60).optional()
  }),
  is_scheduled: z.boolean().default(false),
  schedule: z.object({
    frequency: z.enum(['daily', 'weekly', 'monthly']),
    time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    recipients: z.array(z.string().email())
  }).optional()
});

// Export schema types
export type AnalyticsEventInput = z.infer<typeof AnalyticsEventSchema>;
export type AnalyticsQueryInput = z.infer<typeof AnalyticsQuerySchema>;
export type CustomReportInput = z.infer<typeof CustomReportSchema>;