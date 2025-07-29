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
    };
    refresh_interval?: number;
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
            region?: string;
            country?: string;
            city?: string;
        }, {
            region?: string;
            country?: string;
            city?: string;
        }>>;
    }, "strip", z.ZodTypeAny, {
        location?: {
            region?: string;
            country?: string;
            city?: string;
        };
        referrer?: string;
        session_id?: string;
        device_type?: string;
        user_agent?: string;
        ip_address?: string;
    }, {
        location?: {
            region?: string;
            country?: string;
            city?: string;
        };
        referrer?: string;
        session_id?: string;
        device_type?: string;
        user_agent?: string;
        ip_address?: string;
    }>;
}, "strip", z.ZodTypeAny, {
    metadata?: {
        location?: {
            region?: string;
            country?: string;
            city?: string;
        };
        referrer?: string;
        session_id?: string;
        device_type?: string;
        user_agent?: string;
        ip_address?: string;
    };
    user_id?: string;
    template_id?: string;
    event_type?: MetricType;
    event_data?: Record<string, any>;
}, {
    metadata?: {
        location?: {
            region?: string;
            country?: string;
            city?: string;
        };
        referrer?: string;
        session_id?: string;
        device_type?: string;
        user_agent?: string;
        ip_address?: string;
    };
    user_id?: string;
    template_id?: string;
    event_type?: MetricType;
    event_data?: Record<string, any>;
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
        countries?: string[];
        device_types?: string[];
        user_segments?: string[];
        min_value?: number;
        max_value?: number;
    }, {
        countries?: string[];
        device_types?: string[];
        user_segments?: string[];
        min_value?: number;
        max_value?: number;
    }>>;
    sort: z.ZodOptional<z.ZodObject<{
        field: z.ZodString;
        direction: z.ZodEnum<["asc", "desc"]>;
    }, "strip", z.ZodTypeAny, {
        field?: string;
        direction?: "asc" | "desc";
    }, {
        field?: string;
        direction?: "asc" | "desc";
    }>>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    sort?: {
        field?: string;
        direction?: "asc" | "desc";
    };
    limit?: number;
    offset?: number;
    aggregation?: AggregationType;
    filters?: {
        countries?: string[];
        device_types?: string[];
        user_segments?: string[];
        min_value?: number;
        max_value?: number;
    };
    creator_id?: string;
    template_ids?: string[];
    metric_types?: MetricType[];
    time_range?: TimeRange;
    start_date?: Date;
    end_date?: Date;
    group_by?: string[];
}, {
    sort?: {
        field?: string;
        direction?: "asc" | "desc";
    };
    limit?: number;
    offset?: number;
    aggregation?: AggregationType;
    filters?: {
        countries?: string[];
        device_types?: string[];
        user_segments?: string[];
        min_value?: number;
        max_value?: number;
    };
    creator_id?: string;
    template_ids?: string[];
    metric_types?: MetricType[];
    time_range?: TimeRange;
    start_date?: Date;
    end_date?: Date;
    group_by?: string[];
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
                countries?: string[];
                device_types?: string[];
                user_segments?: string[];
                min_value?: number;
                max_value?: number;
            }, {
                countries?: string[];
                device_types?: string[];
                user_segments?: string[];
                min_value?: number;
                max_value?: number;
            }>>;
            sort: z.ZodOptional<z.ZodObject<{
                field: z.ZodString;
                direction: z.ZodEnum<["asc", "desc"]>;
            }, "strip", z.ZodTypeAny, {
                field?: string;
                direction?: "asc" | "desc";
            }, {
                field?: string;
                direction?: "asc" | "desc";
            }>>;
            limit: z.ZodDefault<z.ZodNumber>;
            offset: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            sort?: {
                field?: string;
                direction?: "asc" | "desc";
            };
            limit?: number;
            offset?: number;
            aggregation?: AggregationType;
            filters?: {
                countries?: string[];
                device_types?: string[];
                user_segments?: string[];
                min_value?: number;
                max_value?: number;
            };
            creator_id?: string;
            template_ids?: string[];
            metric_types?: MetricType[];
            time_range?: TimeRange;
            start_date?: Date;
            end_date?: Date;
            group_by?: string[];
        }, {
            sort?: {
                field?: string;
                direction?: "asc" | "desc";
            };
            limit?: number;
            offset?: number;
            aggregation?: AggregationType;
            filters?: {
                countries?: string[];
                device_types?: string[];
                user_segments?: string[];
                min_value?: number;
                max_value?: number;
            };
            creator_id?: string;
            template_ids?: string[];
            metric_types?: MetricType[];
            time_range?: TimeRange;
            start_date?: Date;
            end_date?: Date;
            group_by?: string[];
        }>;
        visualization: z.ZodObject<{
            chart_type: z.ZodEnum<["line", "bar", "pie", "area", "table", "metric"]>;
            layout: z.ZodNativeEnum<typeof DashboardLayout>;
            show_legend: z.ZodDefault<z.ZodBoolean>;
            show_grid: z.ZodDefault<z.ZodBoolean>;
            color_scheme: z.ZodDefault<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            layout?: DashboardLayout;
            chart_type?: "area" | "table" | "line" | "pie" | "bar" | "metric";
            show_legend?: boolean;
            show_grid?: boolean;
            color_scheme?: string;
        }, {
            layout?: DashboardLayout;
            chart_type?: "area" | "table" | "line" | "pie" | "bar" | "metric";
            show_legend?: boolean;
            show_grid?: boolean;
            color_scheme?: string;
        }>;
        refresh_interval: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        visualization?: {
            layout?: DashboardLayout;
            chart_type?: "area" | "table" | "line" | "pie" | "bar" | "metric";
            show_legend?: boolean;
            show_grid?: boolean;
            color_scheme?: string;
        };
        query?: {
            sort?: {
                field?: string;
                direction?: "asc" | "desc";
            };
            limit?: number;
            offset?: number;
            aggregation?: AggregationType;
            filters?: {
                countries?: string[];
                device_types?: string[];
                user_segments?: string[];
                min_value?: number;
                max_value?: number;
            };
            creator_id?: string;
            template_ids?: string[];
            metric_types?: MetricType[];
            time_range?: TimeRange;
            start_date?: Date;
            end_date?: Date;
            group_by?: string[];
        };
        refresh_interval?: number;
    }, {
        visualization?: {
            layout?: DashboardLayout;
            chart_type?: "area" | "table" | "line" | "pie" | "bar" | "metric";
            show_legend?: boolean;
            show_grid?: boolean;
            color_scheme?: string;
        };
        query?: {
            sort?: {
                field?: string;
                direction?: "asc" | "desc";
            };
            limit?: number;
            offset?: number;
            aggregation?: AggregationType;
            filters?: {
                countries?: string[];
                device_types?: string[];
                user_segments?: string[];
                min_value?: number;
                max_value?: number;
            };
            creator_id?: string;
            template_ids?: string[];
            metric_types?: MetricType[];
            time_range?: TimeRange;
            start_date?: Date;
            end_date?: Date;
            group_by?: string[];
        };
        refresh_interval?: number;
    }>;
    is_scheduled: z.ZodDefault<z.ZodBoolean>;
    schedule: z.ZodOptional<z.ZodObject<{
        frequency: z.ZodEnum<["daily", "weekly", "monthly"]>;
        time: z.ZodString;
        recipients: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        time?: string;
        frequency?: "monthly" | "daily" | "weekly";
        recipients?: string[];
    }, {
        time?: string;
        frequency?: "monthly" | "daily" | "weekly";
        recipients?: string[];
    }>>;
}, "strip", z.ZodTypeAny, {
    name?: string;
    description?: string;
    configuration?: {
        visualization?: {
            layout?: DashboardLayout;
            chart_type?: "area" | "table" | "line" | "pie" | "bar" | "metric";
            show_legend?: boolean;
            show_grid?: boolean;
            color_scheme?: string;
        };
        query?: {
            sort?: {
                field?: string;
                direction?: "asc" | "desc";
            };
            limit?: number;
            offset?: number;
            aggregation?: AggregationType;
            filters?: {
                countries?: string[];
                device_types?: string[];
                user_segments?: string[];
                min_value?: number;
                max_value?: number;
            };
            creator_id?: string;
            template_ids?: string[];
            metric_types?: MetricType[];
            time_range?: TimeRange;
            start_date?: Date;
            end_date?: Date;
            group_by?: string[];
        };
        refresh_interval?: number;
    };
    schedule?: {
        time?: string;
        frequency?: "monthly" | "daily" | "weekly";
        recipients?: string[];
    };
    is_scheduled?: boolean;
}, {
    name?: string;
    description?: string;
    configuration?: {
        visualization?: {
            layout?: DashboardLayout;
            chart_type?: "area" | "table" | "line" | "pie" | "bar" | "metric";
            show_legend?: boolean;
            show_grid?: boolean;
            color_scheme?: string;
        };
        query?: {
            sort?: {
                field?: string;
                direction?: "asc" | "desc";
            };
            limit?: number;
            offset?: number;
            aggregation?: AggregationType;
            filters?: {
                countries?: string[];
                device_types?: string[];
                user_segments?: string[];
                min_value?: number;
                max_value?: number;
            };
            creator_id?: string;
            template_ids?: string[];
            metric_types?: MetricType[];
            time_range?: TimeRange;
            start_date?: Date;
            end_date?: Date;
            group_by?: string[];
        };
        refresh_interval?: number;
    };
    schedule?: {
        time?: string;
        frequency?: "monthly" | "daily" | "weekly";
        recipients?: string[];
    };
    is_scheduled?: boolean;
}>;
export type AnalyticsEventInput = z.infer<typeof AnalyticsEventSchema>;
export type AnalyticsQueryInput = z.infer<typeof AnalyticsQuerySchema>;
export type CustomReportInput = z.infer<typeof CustomReportSchema>;
//# sourceMappingURL=analytics.types.d.ts.map