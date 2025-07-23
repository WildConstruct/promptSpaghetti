// Analytics types for the frontend
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

export interface AnalyticsEvent {
  id: string;
  template_id: string;
  user_id?: string;
  event_type: MetricType;
  event_data: Record<string, unknown>;
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

// Chart data interfaces
export interface ChartDataPoint {
  date: string;
  [key: string]: string | number;
}

export interface TrendData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    fill?: boolean;
  }>;
}

// UI Component Props
export interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: number;
  trendLabel?: string;
  icon: string;
  color: string;
  subtitle?: string;
}

export interface TimeRangeSelectorProps {
  value: TimeRange;
  startDate?: Date;
  endDate?: Date;
  onChange: (timeRange: TimeRange, startDate?: Date, endDate?: Date) => void;
}

// Service interfaces
export interface AnalyticsService {
  trackEvent(event: Partial<AnalyticsEvent>): Promise<void>;
  getCreatorDashboard(
    creatorId: string,
    timeRange: TimeRange,
    startDate?: Date,
    endDate?: Date
  ): Promise<CreatorDashboard>;
  getTemplateMetrics(
    templateId: string,
    timeRange: TimeRange,
    startDate?: Date,
    endDate?: Date
  ): Promise<TemplateMetrics>;
  queryAnalytics(query: AnalyticsQuery): Promise<any[]>;
  createCustomReport(report: Partial<CustomReport>): Promise<CustomReport>;
  getCustomReports(creatorId: string): Promise<CustomReport[]>;
  generateReport(reportId: string): Promise<unknown>;
  generateInsights(creatorId: string, templateIds?: string[]): Promise<AnalyticsInsight[]>;
}