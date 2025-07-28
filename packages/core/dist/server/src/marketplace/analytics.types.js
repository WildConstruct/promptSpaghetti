import { z } from 'zod';
// Core Analytics Enums
export var MetricType;
(function (MetricType) {
    MetricType["VIEWS"] = "views";
    MetricType["DOWNLOADS"] = "downloads";
    MetricType["LIKES"] = "likes";
    MetricType["RATINGS"] = "ratings";
    MetricType["REVENUE"] = "revenue";
    MetricType["USAGE_TIME"] = "usage_time";
    MetricType["ERROR_RATE"] = "error_rate";
    MetricType["CONVERSION"] = "conversion";
})(MetricType || (MetricType = {}));
export var TimeRange;
(function (TimeRange) {
    TimeRange["LAST_24H"] = "last_24h";
    TimeRange["LAST_7D"] = "last_7d";
    TimeRange["LAST_30D"] = "last_30d";
    TimeRange["LAST_90D"] = "last_90d";
    TimeRange["LAST_YEAR"] = "last_year";
    TimeRange["ALL_TIME"] = "all_time";
    TimeRange["CUSTOM"] = "custom";
})(TimeRange || (TimeRange = {}));
export var AggregationType;
(function (AggregationType) {
    AggregationType["SUM"] = "sum";
    AggregationType["AVERAGE"] = "average";
    AggregationType["COUNT"] = "count";
    AggregationType["UNIQUE"] = "unique";
    AggregationType["MAX"] = "max";
    AggregationType["MIN"] = "min";
    AggregationType["MEDIAN"] = "median";
})(AggregationType || (AggregationType = {}));
export var DashboardLayout;
(function (DashboardLayout) {
    DashboardLayout["GRID"] = "grid";
    DashboardLayout["LIST"] = "list";
    DashboardLayout["CHARTS"] = "charts";
    DashboardLayout["MIXED"] = "mixed";
})(DashboardLayout || (DashboardLayout = {}));
;
timestamp: Date;
created_at: Date;
;
demographics: {
    top_countries: Array;
    device_breakdown: Array;
    user_segments: Array;
}
;
trends: {
    daily_metrics: Array;
    growth_rates: {
        views_growth: number;
        downloads_growth: number;
        revenue_growth: number;
    }
    ;
}
;
;
performance_summary: {
    views_trend: number;
    downloads_trend: number;
    revenue_trend: number;
    rating_trend: number;
    market_share: number;
    ranking_position: number;
}
;
traffic_metrics: {
    unique_visitors: number;
    returning_visitors: number;
    bounce_rate: number;
    average_session_duration: number;
    top_referrers: Array;
}
;
financial_metrics: {
    gross_revenue: number;
    net_revenue: number;
    platform_fee: number;
    payout_amount: number;
    revenue_by_template: Array;
}
;
;
sort ?  : {
    field: string,
    direction: 'asc' | 'desc'
};
limit ?  : number;
offset ?  : number;
;
is_scheduled: boolean;
schedule ?  : {
    frequency: 'daily' | 'weekly' | 'monthly',
    time: string,
    recipients: string[]
};
created_at: Date;
updated_at: Date;
;
recommendations ?  : string[];
created_at: Date;
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
