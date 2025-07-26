/**
 * Audit Management API Layer
 *
 * RESTful API interface for audit management operations, integrating with existing
 * PromptScape audit infrastructure and providing enhanced management capabilities.
 */
import { z } from 'zod';
import { AuditEvent, AuditEventType, AuditSeverity, ComplianceFramework, AuditStatus } from './AuditManagementSystem';
export declare const CreateAuditEventRequest: z.ZodObject<{
    event_type: z.ZodNativeEnum<typeof AuditEventType>;
    severity: z.ZodNativeEnum<typeof AuditSeverity>;
    title: z.ZodString;
    description: z.ZodString;
    category: z.ZodString;
    subcategory: z.ZodOptional<z.ZodString>;
    user_id: z.ZodOptional<z.ZodString>;
    session_id: z.ZodOptional<z.ZodString>;
    ip_address: z.ZodOptional<z.ZodString>;
    user_agent: z.ZodOptional<z.ZodString>;
    system_component: z.ZodString;
    endpoint: z.ZodOptional<z.ZodString>;
    http_method: z.ZodOptional<z.ZodEnum<["GET", "POST", "PUT", "DELETE", "PATCH"]>>;
    response_code: z.ZodOptional<z.ZodNumber>;
    risk_score: z.ZodNumber;
    risk_factors: z.ZodArray<z.ZodString, "many">;
    compliance_frameworks: z.ZodArray<z.ZodNativeEnum<typeof ComplianceFramework>, "many">;
    regulatory_impact: z.ZodDefault<z.ZodBoolean>;
    data_types: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    data_volume: z.ZodOptional<z.ZodNumber>;
    sensitive_data_involved: z.ZodDefault<z.ZodBoolean>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    description: string;
    category: string;
    tags: string[];
    title: string;
    severity: AuditSeverity;
    event_type: AuditEventType;
    compliance_frameworks: ComplianceFramework[];
    system_component: string;
    risk_score: number;
    risk_factors: string[];
    regulatory_impact: boolean;
    sensitive_data_involved: boolean;
    metadata?: Record<string, unknown> | undefined;
    endpoint?: string | undefined;
    user_id?: string | undefined;
    session_id?: string | undefined;
    user_agent?: string | undefined;
    ip_address?: string | undefined;
    subcategory?: string | undefined;
    http_method?: "POST" | "PUT" | "DELETE" | "GET" | "PATCH" | undefined;
    response_code?: number | undefined;
    data_types?: string[] | undefined;
    data_volume?: number | undefined;
}, {
    description: string;
    category: string;
    title: string;
    severity: AuditSeverity;
    event_type: AuditEventType;
    compliance_frameworks: ComplianceFramework[];
    system_component: string;
    risk_score: number;
    risk_factors: string[];
    tags?: string[] | undefined;
    metadata?: Record<string, unknown> | undefined;
    endpoint?: string | undefined;
    user_id?: string | undefined;
    session_id?: string | undefined;
    user_agent?: string | undefined;
    ip_address?: string | undefined;
    subcategory?: string | undefined;
    http_method?: "POST" | "PUT" | "DELETE" | "GET" | "PATCH" | undefined;
    response_code?: number | undefined;
    regulatory_impact?: boolean | undefined;
    data_types?: string[] | undefined;
    data_volume?: number | undefined;
    sensitive_data_involved?: boolean | undefined;
}>;
export declare const AuditQueryRequest: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sort_field: z.ZodDefault<z.ZodString>;
    sort_order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
    start_date: z.ZodOptional<z.ZodString>;
    end_date: z.ZodOptional<z.ZodString>;
    event_types: z.ZodOptional<z.ZodArray<z.ZodNativeEnum<typeof AuditEventType>, "many">>;
    severities: z.ZodOptional<z.ZodArray<z.ZodNativeEnum<typeof AuditSeverity>, "many">>;
    statuses: z.ZodOptional<z.ZodArray<z.ZodNativeEnum<typeof AuditStatus>, "many">>;
    compliance_frameworks: z.ZodOptional<z.ZodArray<z.ZodNativeEnum<typeof ComplianceFramework>, "many">>;
    search: z.ZodOptional<z.ZodString>;
    user_id: z.ZodOptional<z.ZodString>;
    ip_address: z.ZodOptional<z.ZodString>;
    min_risk_score: z.ZodOptional<z.ZodNumber>;
    max_risk_score: z.ZodOptional<z.ZodNumber>;
    has_metadata: z.ZodOptional<z.ZodBoolean>;
    sensitive_data_only: z.ZodOptional<z.ZodBoolean>;
    regulatory_impact_only: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    sort_field: string;
    sort_order: "asc" | "desc";
    search?: string | undefined;
    start_date?: string | undefined;
    end_date?: string | undefined;
    user_id?: string | undefined;
    severities?: AuditSeverity[] | undefined;
    ip_address?: string | undefined;
    compliance_frameworks?: ComplianceFramework[] | undefined;
    statuses?: AuditStatus[] | undefined;
    event_types?: AuditEventType[] | undefined;
    min_risk_score?: number | undefined;
    max_risk_score?: number | undefined;
    has_metadata?: boolean | undefined;
    sensitive_data_only?: boolean | undefined;
    regulatory_impact_only?: boolean | undefined;
}, {
    search?: string | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    start_date?: string | undefined;
    end_date?: string | undefined;
    user_id?: string | undefined;
    severities?: AuditSeverity[] | undefined;
    ip_address?: string | undefined;
    compliance_frameworks?: ComplianceFramework[] | undefined;
    statuses?: AuditStatus[] | undefined;
    event_types?: AuditEventType[] | undefined;
    min_risk_score?: number | undefined;
    max_risk_score?: number | undefined;
    sort_field?: string | undefined;
    sort_order?: "asc" | "desc" | undefined;
    has_metadata?: boolean | undefined;
    sensitive_data_only?: boolean | undefined;
    regulatory_impact_only?: boolean | undefined;
}>;
export declare const ComplianceReportRequest: z.ZodObject<{
    framework: z.ZodNativeEnum<typeof ComplianceFramework>;
    start_date: z.ZodString;
    end_date: z.ZodString;
    include_details: z.ZodDefault<z.ZodBoolean>;
    export_format: z.ZodDefault<z.ZodEnum<["json", "pdf", "csv"]>>;
}, "strip", z.ZodTypeAny, {
    start_date: string;
    end_date: string;
    framework: ComplianceFramework;
    include_details: boolean;
    export_format: "json" | "csv" | "pdf";
}, {
    start_date: string;
    end_date: string;
    framework: ComplianceFramework;
    include_details?: boolean | undefined;
    export_format?: "json" | "csv" | "pdf" | undefined;
}>;
export declare const AuditAnalyticsRequest: z.ZodObject<{
    timeframe: z.ZodEnum<["hour", "day", "week", "month", "year"]>;
    start_date: z.ZodOptional<z.ZodString>;
    end_date: z.ZodOptional<z.ZodString>;
    metrics: z.ZodArray<z.ZodEnum<["event_count", "unique_users", "risk_score_average", "severity_distribution", "compliance_violations", "geographic_distribution", "system_component_activity", "trend_analysis", "anomaly_detection"]>, "many">;
    group_by: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    filters: z.ZodOptional<z.ZodObject<{
        page: z.ZodDefault<z.ZodNumber>;
        limit: z.ZodDefault<z.ZodNumber>;
        sort_field: z.ZodDefault<z.ZodString>;
        sort_order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
        start_date: z.ZodOptional<z.ZodString>;
        end_date: z.ZodOptional<z.ZodString>;
        event_types: z.ZodOptional<z.ZodArray<z.ZodNativeEnum<typeof AuditEventType>, "many">>;
        severities: z.ZodOptional<z.ZodArray<z.ZodNativeEnum<typeof AuditSeverity>, "many">>;
        statuses: z.ZodOptional<z.ZodArray<z.ZodNativeEnum<typeof AuditStatus>, "many">>;
        compliance_frameworks: z.ZodOptional<z.ZodArray<z.ZodNativeEnum<typeof ComplianceFramework>, "many">>;
        search: z.ZodOptional<z.ZodString>;
        user_id: z.ZodOptional<z.ZodString>;
        ip_address: z.ZodOptional<z.ZodString>;
        min_risk_score: z.ZodOptional<z.ZodNumber>;
        max_risk_score: z.ZodOptional<z.ZodNumber>;
        has_metadata: z.ZodOptional<z.ZodBoolean>;
        sensitive_data_only: z.ZodOptional<z.ZodBoolean>;
        regulatory_impact_only: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        limit: number;
        page: number;
        sort_field: string;
        sort_order: "asc" | "desc";
        search?: string | undefined;
        start_date?: string | undefined;
        end_date?: string | undefined;
        user_id?: string | undefined;
        severities?: AuditSeverity[] | undefined;
        ip_address?: string | undefined;
        compliance_frameworks?: ComplianceFramework[] | undefined;
        statuses?: AuditStatus[] | undefined;
        event_types?: AuditEventType[] | undefined;
        min_risk_score?: number | undefined;
        max_risk_score?: number | undefined;
        has_metadata?: boolean | undefined;
        sensitive_data_only?: boolean | undefined;
        regulatory_impact_only?: boolean | undefined;
    }, {
        search?: string | undefined;
        limit?: number | undefined;
        page?: number | undefined;
        start_date?: string | undefined;
        end_date?: string | undefined;
        user_id?: string | undefined;
        severities?: AuditSeverity[] | undefined;
        ip_address?: string | undefined;
        compliance_frameworks?: ComplianceFramework[] | undefined;
        statuses?: AuditStatus[] | undefined;
        event_types?: AuditEventType[] | undefined;
        min_risk_score?: number | undefined;
        max_risk_score?: number | undefined;
        sort_field?: string | undefined;
        sort_order?: "asc" | "desc" | undefined;
        has_metadata?: boolean | undefined;
        sensitive_data_only?: boolean | undefined;
        regulatory_impact_only?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    metrics: ("anomaly_detection" | "trend_analysis" | "event_count" | "unique_users" | "risk_score_average" | "severity_distribution" | "compliance_violations" | "geographic_distribution" | "system_component_activity")[];
    timeframe: "month" | "week" | "year" | "day" | "hour";
    filters?: {
        limit: number;
        page: number;
        sort_field: string;
        sort_order: "asc" | "desc";
        search?: string | undefined;
        start_date?: string | undefined;
        end_date?: string | undefined;
        user_id?: string | undefined;
        severities?: AuditSeverity[] | undefined;
        ip_address?: string | undefined;
        compliance_frameworks?: ComplianceFramework[] | undefined;
        statuses?: AuditStatus[] | undefined;
        event_types?: AuditEventType[] | undefined;
        min_risk_score?: number | undefined;
        max_risk_score?: number | undefined;
        has_metadata?: boolean | undefined;
        sensitive_data_only?: boolean | undefined;
        regulatory_impact_only?: boolean | undefined;
    } | undefined;
    start_date?: string | undefined;
    end_date?: string | undefined;
    group_by?: string[] | undefined;
}, {
    metrics: ("anomaly_detection" | "trend_analysis" | "event_count" | "unique_users" | "risk_score_average" | "severity_distribution" | "compliance_violations" | "geographic_distribution" | "system_component_activity")[];
    timeframe: "month" | "week" | "year" | "day" | "hour";
    filters?: {
        search?: string | undefined;
        limit?: number | undefined;
        page?: number | undefined;
        start_date?: string | undefined;
        end_date?: string | undefined;
        user_id?: string | undefined;
        severities?: AuditSeverity[] | undefined;
        ip_address?: string | undefined;
        compliance_frameworks?: ComplianceFramework[] | undefined;
        statuses?: AuditStatus[] | undefined;
        event_types?: AuditEventType[] | undefined;
        min_risk_score?: number | undefined;
        max_risk_score?: number | undefined;
        sort_field?: string | undefined;
        sort_order?: "asc" | "desc" | undefined;
        has_metadata?: boolean | undefined;
        sensitive_data_only?: boolean | undefined;
        regulatory_impact_only?: boolean | undefined;
    } | undefined;
    start_date?: string | undefined;
    end_date?: string | undefined;
    group_by?: string[] | undefined;
}>;
export declare const UpdateAuditEventRequest: z.ZodObject<{
    status: z.ZodOptional<z.ZodNativeEnum<typeof AuditStatus>>;
    resolution_notes: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    status?: AuditStatus | undefined;
    tags?: string[] | undefined;
    metadata?: Record<string, unknown> | undefined;
    resolution_notes?: string | undefined;
}, {
    status?: AuditStatus | undefined;
    tags?: string[] | undefined;
    metadata?: Record<string, unknown> | undefined;
    resolution_notes?: string | undefined;
}>;
export export export type CreateAuditEventRequestType = z.infer<typeof CreateAuditEventRequest>;
export type AuditQueryRequestType = z.infer<typeof AuditQueryRequest>;
export type ComplianceReportRequestType = z.infer<typeof ComplianceReportRequest>;
export type AuditAnalyticsRequestType = z.infer<typeof AuditAnalyticsRequest>;
export type UpdateAuditEventRequestType = z.infer<typeof UpdateAuditEventRequest>;
/**
 * Audit Management API Service
 *
 * Provides RESTful API interface for audit management operations
 */
export declare class AuditManagementAPI {
    private auditSystem;
    /**
     * Create a new audit event
     * POST /api/audit/events
     */
    createAuditEvent(request: CreateAuditEventRequestType): Promise<{
        success: boolean;
        event?: AuditEvent;
        error?: string;
    }>;
    /**
     * Query audit events with filtering and pagination
     * GET /api/audit/events
     */
    queryAuditEvents(request: AuditQueryRequestType): Promise<{
        success: boolean;
        data?: unknown;
        error?: string;
    }>;
    /**
     * Get a specific audit event by ID
     * GET /api/audit/events/:id
     */
    getAuditEvent(eventId: string): Promise<{
        success: boolean;
        event?: AuditEvent;
        error?: string;
    }>;
    /**
     * Update an audit event
     * PUT /api/audit/events/:id
     */
    updateAuditEvent(eventId: string, request: UpdateAuditEventRequestType): Promise<{
        success: boolean;
        event?: AuditEvent;
        error?: string;
    }>;
    /**
     * Generate compliance report
     * POST /api/audit/compliance/report
     */
    generateComplianceReport(request: ComplianceReportRequestType): Promise<{
        success: boolean;
        report?: any;
        download_url?: string;
        error?: string;
    }>;
    /**
     * Generate audit analytics
     * POST /api/audit/analytics
     */
    generateAnalytics(request: AuditAnalyticsRequestType): Promise<{
        success: boolean;
        analytics?: any;
        error?: string;
    }>;
    /**
     * Detect anomalous patterns
     * GET /api/audit/anomalies
     */
    detectAnomalies(timeWindow?: number): Promise<{
        success: boolean;
        patterns?: any[];
        error?: string;
    }>;
    /**
     * Get audit system health status
     * GET /api/audit/health
     */
    getSystemHealth(): Promise<{
        success: boolean;
        health?: any;
        error?: string;
    }>;
    /**
     * Export audit data
     * POST /api/audit/export
     */
    exportAuditData(request: {
        format: 'csv' | 'json' | 'pdf';
        query?: AuditQueryRequestType;
        include_metadata?: boolean;
    }): Promise<{
        success: boolean;
        download_url?: string;
        error?: string;
    }>;
    private formatAuditEventForAPI;
    private calculateEscalationLevel;
    private getAppliedFilters;
    private generateReportFile;
    private summarizeReport;
    private generateTrendAnalysis;
}
export declare     event?: AuditEvent;
    error?: string;
}>;
export declare const queryAuditEvents: (request: AuditQueryRequestType) => Promise<{
    success: boolean;
    data?: unknown;
    error?: string;
}>;
export declare const generateComplianceReport: (request: ComplianceReportRequestType) => Promise<{
    success: boolean;
    report?: any;
    download_url?: string;
    error?: string;
}>;
export default AuditManagementAPI;
//# sourceMappingURL=AuditManagementAPI.d.ts.map