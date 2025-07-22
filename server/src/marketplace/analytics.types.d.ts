import { z } from 'zod';
export declare enum MetricType {
    VIEWS = "views",
    DOWNLOADS = "downloads",
    LIKES = "likes",
    RATINGS = "ratings",
    REVENUE = "revenue",
    USAGE_TIME = "usage_time",
    ERROR_RATE = "error_rate",
    CONVERSION = "conversion"
}
export declare enum TimeRange {
    LAST_24H = "last_24h",
    LAST_7D = "last_7d",
    LAST_30D = "last_30d",
    LAST_90D = "last_90d",
    LAST_YEAR = "last_year",
    ALL_TIME = "all_time",
    CUSTOM = "custom"
}
export declare enum AggregationType {
    SUM = "sum",
    AVERAGE = "average",
    COUNT = "count",
    UNIQUE = "unique",
    MAX = "max",
    MIN = "min",
    MEDIAN = "median"
}
export declare enum DashboardLayout {
    GRID = "grid",
    LIST = "list",
    CHARTS = "charts",
    MIXED = "mixed"
}
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
        top_countries: Array<{
            country: string;
            count: number;
            percentage: number;
        }>;
        device_breakdown: Array<{
            device: string;
            count: number;
            percentage: number;
        }>;
        user_segments: Array<{
            segment: string;
            count: number;
            percentage: number;
        }>;
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
        top_referrers: Array<{
            source: string;
            visits: number;
            percentage: number;
        }>;
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
export declare const AnalyticsEventSchema: z.ZodObject<{
    template_id: z.ZodString;
    user_id: z.ZodOptional<z.ZodString>;
    event_type: z.ZodNativeEnum<typeof MetricType>;
    event_data: z.ZodRecord<z.ZodString, z.ZodAny>;
    metadata: z.ZodObject<{
        user_agent: z.ZodOptional<z.ZodString>;
        ip_address: z.ZodOptional<z.ZodString>;
        referrer: z.ZodOptional<z.ZodString>;
        session_id: z.ZodOptional<z.ZodString>;
        device_type: z.ZodOptional<z.ZodString>;
        location: z.ZodOptional<z.ZodObject<{
            country: z.ZodOptional<z.ZodString>;
            region: z.ZodOptional<z.ZodString>;
            city: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            region?: string | undefined;
            country?: string | undefined;
            city?: string | undefined;
        }, {
            region?: string | undefined;
            country?: string | undefined;
            city?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        location?: {
            region?: string | undefined;
            country?: string | undefined;
            city?: string | undefined;
        } | undefined;
        referrer?: string | undefined;
        session_id?: string | undefined;
        ip_address?: string | undefined;
        user_agent?: string | undefined;
        device_type?: string | undefined;
    }, {
        location?: {
            region?: string | undefined;
            country?: string | undefined;
            city?: string | undefined;
        } | undefined;
        referrer?: string | undefined;
        session_id?: string | undefined;
        ip_address?: string | undefined;
        user_agent?: string | undefined;
        device_type?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    metadata: {
        location?: {
            region?: string | undefined;
            country?: string | undefined;
            city?: string | undefined;
        } | undefined;
        referrer?: string | undefined;
        session_id?: string | undefined;
        ip_address?: string | undefined;
        user_agent?: string | undefined;
        device_type?: string | undefined;
    };
    event_type: MetricType;
    template_id: string;
    event_data: Record<string, any>;
    user_id?: string | undefined;
}, {
    metadata: {
        location?: {
            region?: string | undefined;
            country?: string | undefined;
            city?: string | undefined;
        } | undefined;
        referrer?: string | undefined;
        session_id?: string | undefined;
        ip_address?: string | undefined;
        user_agent?: string | undefined;
        device_type?: string | undefined;
    };
    event_type: MetricType;
    template_id: string;
    event_data: Record<string, any>;
    user_id?: string | undefined;
}>;
export declare const AnalyticsQuerySchema: z.ZodObject<{
    creator_id: z.ZodOptional<z.ZodString>;
    template_ids: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    metric_types: z.ZodArray<z.ZodNativeEnum<typeof MetricType>, "many">;
    time_range: z.ZodNativeEnum<typeof TimeRange>;
    start_date: z.ZodOptional<z.ZodDate>;
    end_date: z.ZodOptional<z.ZodDate>;
    aggregation: z.ZodNativeEnum<typeof AggregationType>;
    group_by: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    filters: z.ZodOptional<z.ZodObject<{
        countries: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        device_types: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        user_segments: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        min_value: z.ZodOptional<z.ZodNumber>;
        max_value: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        countries?: string[] | undefined;
        device_types?: string[] | undefined;
        user_segments?: string[] | undefined;
        min_value?: number | undefined;
        max_value?: number | undefined;
    }, {
        countries?: string[] | undefined;
        device_types?: string[] | undefined;
        user_segments?: string[] | undefined;
        min_value?: number | undefined;
        max_value?: number | undefined;
    }>>;
    sort: z.ZodOptional<z.ZodObject<{
        field: z.ZodString;
        direction: z.ZodEnum<["asc", "desc"]>;
    }, "strip", z.ZodTypeAny, {
        field: string;
        direction: "asc" | "desc";
    }, {
        field: string;
        direction: "asc" | "desc";
    }>>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    offset: number;
    metric_types: MetricType[];
    time_range: TimeRange;
    aggregation: AggregationType;
    sort?: {
        field: string;
        direction: "asc" | "desc";
    } | undefined;
    filters?: {
        countries?: string[] | undefined;
        device_types?: string[] | undefined;
        user_segments?: string[] | undefined;
        min_value?: number | undefined;
        max_value?: number | undefined;
    } | undefined;
    start_date?: Date | undefined;
    end_date?: Date | undefined;
    group_by?: string[] | undefined;
    template_ids?: string[] | undefined;
    creator_id?: string | undefined;
}, {
    metric_types: MetricType[];
    time_range: TimeRange;
    aggregation: AggregationType;
    sort?: {
        field: string;
        direction: "asc" | "desc";
    } | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
    filters?: {
        countries?: string[] | undefined;
        device_types?: string[] | undefined;
        user_segments?: string[] | undefined;
        min_value?: number | undefined;
        max_value?: number | undefined;
    } | undefined;
    start_date?: Date | undefined;
    end_date?: Date | undefined;
    group_by?: string[] | undefined;
    template_ids?: string[] | undefined;
    creator_id?: string | undefined;
}>;
export declare const CustomReportSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    configuration: z.ZodObject<{
        query: z.ZodObject<{
            creator_id: z.ZodOptional<z.ZodString>;
            template_ids: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            metric_types: z.ZodArray<z.ZodNativeEnum<typeof MetricType>, "many">;
            time_range: z.ZodNativeEnum<typeof TimeRange>;
            start_date: z.ZodOptional<z.ZodDate>;
            end_date: z.ZodOptional<z.ZodDate>;
            aggregation: z.ZodNativeEnum<typeof AggregationType>;
            group_by: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            filters: z.ZodOptional<z.ZodObject<{
                countries: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                device_types: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                user_segments: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                min_value: z.ZodOptional<z.ZodNumber>;
                max_value: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                countries?: string[] | undefined;
                device_types?: string[] | undefined;
                user_segments?: string[] | undefined;
                min_value?: number | undefined;
                max_value?: number | undefined;
            }, {
                countries?: string[] | undefined;
                device_types?: string[] | undefined;
                user_segments?: string[] | undefined;
                min_value?: number | undefined;
                max_value?: number | undefined;
            }>>;
            sort: z.ZodOptional<z.ZodObject<{
                field: z.ZodString;
                direction: z.ZodEnum<["asc", "desc"]>;
            }, "strip", z.ZodTypeAny, {
                field: string;
                direction: "asc" | "desc";
            }, {
                field: string;
                direction: "asc" | "desc";
            }>>;
            limit: z.ZodDefault<z.ZodNumber>;
            offset: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            limit: number;
            offset: number;
            metric_types: MetricType[];
            time_range: TimeRange;
            aggregation: AggregationType;
            sort?: {
                field: string;
                direction: "asc" | "desc";
            } | undefined;
            filters?: {
                countries?: string[] | undefined;
                device_types?: string[] | undefined;
                user_segments?: string[] | undefined;
                min_value?: number | undefined;
                max_value?: number | undefined;
            } | undefined;
            start_date?: Date | undefined;
            end_date?: Date | undefined;
            group_by?: string[] | undefined;
            template_ids?: string[] | undefined;
            creator_id?: string | undefined;
        }, {
            metric_types: MetricType[];
            time_range: TimeRange;
            aggregation: AggregationType;
            sort?: {
                field: string;
                direction: "asc" | "desc";
            } | undefined;
            limit?: number | undefined;
            offset?: number | undefined;
            filters?: {
                countries?: string[] | undefined;
                device_types?: string[] | undefined;
                user_segments?: string[] | undefined;
                min_value?: number | undefined;
                max_value?: number | undefined;
            } | undefined;
            start_date?: Date | undefined;
            end_date?: Date | undefined;
            group_by?: string[] | undefined;
            template_ids?: string[] | undefined;
            creator_id?: string | undefined;
        }>;
        visualization: z.ZodObject<{
            chart_type: z.ZodEnum<["line", "bar", "pie", "area", "table", "metric"]>;
            layout: z.ZodNativeEnum<typeof DashboardLayout>;
            show_legend: z.ZodDefault<z.ZodBoolean>;
            show_grid: z.ZodDefault<z.ZodBoolean>;
            color_scheme: z.ZodDefault<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            layout: DashboardLayout;
            chart_type: "area" | "table" | "line" | "pie" | "bar" | "metric";
            show_legend: boolean;
            show_grid: boolean;
            color_scheme: string;
        }, {
            layout: DashboardLayout;
            chart_type: "area" | "table" | "line" | "pie" | "bar" | "metric";
            show_legend?: boolean | undefined;
            show_grid?: boolean | undefined;
            color_scheme?: string | undefined;
        }>;
        refresh_interval: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        visualization: {
            layout: DashboardLayout;
            chart_type: "area" | "table" | "line" | "pie" | "bar" | "metric";
            show_legend: boolean;
            show_grid: boolean;
            color_scheme: string;
        };
        query: {
            limit: number;
            offset: number;
            metric_types: MetricType[];
            time_range: TimeRange;
            aggregation: AggregationType;
            sort?: {
                field: string;
                direction: "asc" | "desc";
            } | undefined;
            filters?: {
                countries?: string[] | undefined;
                device_types?: string[] | undefined;
                user_segments?: string[] | undefined;
                min_value?: number | undefined;
                max_value?: number | undefined;
            } | undefined;
            start_date?: Date | undefined;
            end_date?: Date | undefined;
            group_by?: string[] | undefined;
            template_ids?: string[] | undefined;
            creator_id?: string | undefined;
        };
        refresh_interval?: number | undefined;
    }, {
        visualization: {
            layout: DashboardLayout;
            chart_type: "area" | "table" | "line" | "pie" | "bar" | "metric";
            show_legend?: boolean | undefined;
            show_grid?: boolean | undefined;
            color_scheme?: string | undefined;
        };
        query: {
            metric_types: MetricType[];
            time_range: TimeRange;
            aggregation: AggregationType;
            sort?: {
                field: string;
                direction: "asc" | "desc";
            } | undefined;
            limit?: number | undefined;
            offset?: number | undefined;
            filters?: {
                countries?: string[] | undefined;
                device_types?: string[] | undefined;
                user_segments?: string[] | undefined;
                min_value?: number | undefined;
                max_value?: number | undefined;
            } | undefined;
            start_date?: Date | undefined;
            end_date?: Date | undefined;
            group_by?: string[] | undefined;
            template_ids?: string[] | undefined;
            creator_id?: string | undefined;
        };
        refresh_interval?: number | undefined;
    }>;
    is_scheduled: z.ZodDefault<z.ZodBoolean>;
    schedule: z.ZodOptional<z.ZodObject<{
        frequency: z.ZodEnum<["daily", "weekly", "monthly"]>;
        time: z.ZodString;
        recipients: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        time: string;
        recipients: string[];
        frequency: "monthly" | "daily" | "weekly";
    }, {
        time: string;
        recipients: string[];
        frequency: "monthly" | "daily" | "weekly";
    }>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    configuration: {
        visualization: {
            layout: DashboardLayout;
            chart_type: "area" | "table" | "line" | "pie" | "bar" | "metric";
            show_legend: boolean;
            show_grid: boolean;
            color_scheme: string;
        };
        query: {
            limit: number;
            offset: number;
            metric_types: MetricType[];
            time_range: TimeRange;
            aggregation: AggregationType;
            sort?: {
                field: string;
                direction: "asc" | "desc";
            } | undefined;
            filters?: {
                countries?: string[] | undefined;
                device_types?: string[] | undefined;
                user_segments?: string[] | undefined;
                min_value?: number | undefined;
                max_value?: number | undefined;
            } | undefined;
            start_date?: Date | undefined;
            end_date?: Date | undefined;
            group_by?: string[] | undefined;
            template_ids?: string[] | undefined;
            creator_id?: string | undefined;
        };
        refresh_interval?: number | undefined;
    };
    is_scheduled: boolean;
    description?: string | undefined;
    schedule?: {
        time: string;
        recipients: string[];
        frequency: "monthly" | "daily" | "weekly";
    } | undefined;
}, {
    name: string;
    configuration: {
        visualization: {
            layout: DashboardLayout;
            chart_type: "area" | "table" | "line" | "pie" | "bar" | "metric";
            show_legend?: boolean | undefined;
            show_grid?: boolean | undefined;
            color_scheme?: string | undefined;
        };
        query: {
            metric_types: MetricType[];
            time_range: TimeRange;
            aggregation: AggregationType;
            sort?: {
                field: string;
                direction: "asc" | "desc";
            } | undefined;
            limit?: number | undefined;
            offset?: number | undefined;
            filters?: {
                countries?: string[] | undefined;
                device_types?: string[] | undefined;
                user_segments?: string[] | undefined;
                min_value?: number | undefined;
                max_value?: number | undefined;
            } | undefined;
            start_date?: Date | undefined;
            end_date?: Date | undefined;
            group_by?: string[] | undefined;
            template_ids?: string[] | undefined;
            creator_id?: string | undefined;
        };
        refresh_interval?: number | undefined;
    };
    description?: string | undefined;
    schedule?: {
        time: string;
        recipients: string[];
        frequency: "monthly" | "daily" | "weekly";
    } | undefined;
    is_scheduled?: boolean | undefined;
}>;
export type AnalyticsEventInput = z.infer<typeof AnalyticsEventSchema>;
export type AnalyticsQueryInput = z.infer<typeof AnalyticsQuerySchema>;
export type CustomReportInput = z.infer<typeof CustomReportSchema>;
//# sourceMappingURL=analytics.types.d.ts.map