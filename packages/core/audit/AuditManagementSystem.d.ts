/**
 * Comprehensive Audit Management System
 *
 * Enhanced audit management tools built on PromptScape's existing enterprise-grade audit infrastructure.
 * Provides advanced audit analytics, compliance management, and automated reporting capabilities.
 */
import { z } from 'zod';
export declare enum AuditEventType {
    USER_ACTION = "user_action",
    SYSTEM_EVENT = "system_event",
    SECURITY_INCIDENT = "security_incident",
    COMPLIANCE_CHECK = "compliance_check",
    DATA_ACCESS = "data_access",
    CONFIGURATION_CHANGE = "configuration_change",
    AUTHENTICATION = "authentication",
    AUTHORIZATION = "authorization",
    DATA_MODIFICATION = "data_modification",
    EXPORT_IMPORT = "export_import"
}
export declare enum AuditSeverity {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
export declare enum ComplianceFramework {
    GDPR = "gdpr",
    CCPA = "ccpa",
    SOX = "sox",
    ISO27001 = "iso27001",
    HIPAA = "hipaa",
    PCI_DSS = "pci_dss"
}
export declare enum AuditStatus {
    ACTIVE = "active",
    RESOLVED = "resolved",
    INVESTIGATING = "investigating",
    SUPPRESSED = "suppressed",
    ESCALATED = "escalated"
}
export declare const AuditEventSchema: z.ZodObject<{
    id: z.ZodString;
    timestamp: z.ZodDate;
    event_type: z.ZodNativeEnum<typeof AuditEventType>;
    severity: z.ZodNativeEnum<typeof AuditSeverity>;
    status: z.ZodNativeEnum<typeof AuditStatus>;
    title: z.ZodString;
    description: z.ZodString;
    category: z.ZodString;
    subcategory: z.ZodOptional<z.ZodString>;
    user_id: z.ZodOptional<z.ZodString>;
    session_id: z.ZodOptional<z.ZodString>;
    ip_address: z.ZodOptional<z.ZodString>;
    user_agent: z.ZodOptional<z.ZodString>;
    geo_location: z.ZodOptional<z.ZodObject<{
        country: z.ZodString;
        region: z.ZodString;
        city: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        region: string;
        country: string;
        city: string;
    }, {
        region: string;
        country: string;
        city: string;
    }>>;
    system_component: z.ZodString;
    endpoint: z.ZodOptional<z.ZodString>;
    http_method: z.ZodOptional<z.ZodString>;
    response_code: z.ZodOptional<z.ZodNumber>;
    risk_score: z.ZodNumber;
    risk_factors: z.ZodArray<z.ZodString, "many">;
    compliance_frameworks: z.ZodArray<z.ZodNativeEnum<typeof ComplianceFramework>, "many">;
    regulatory_impact: z.ZodBoolean;
    data_types: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    data_volume: z.ZodOptional<z.ZodNumber>;
    sensitive_data_involved: z.ZodBoolean;
    chain_hash: z.ZodString;
    previous_hash: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    tags: z.ZodArray<z.ZodString, "many">;
    resolution_notes: z.ZodOptional<z.ZodString>;
    resolved_by: z.ZodOptional<z.ZodString>;
    resolved_at: z.ZodOptional<z.ZodDate>;
    alert_triggered: z.ZodBoolean;
    notification_sent: z.ZodBoolean;
    escalation_level: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: string;
    description: string;
    status: AuditStatus;
    category: string;
    tags: string[];
    timestamp: Date;
    title: string;
    severity: AuditSeverity;
    compliance_frameworks: ComplianceFramework[];
    event_type: AuditEventType;
    system_component: string;
    risk_score: number;
    risk_factors: string[];
    regulatory_impact: boolean;
    sensitive_data_involved: boolean;
    chain_hash: string;
    alert_triggered: boolean;
    notification_sent: boolean;
    escalation_level: number;
    metadata?: Record<string, unknown> | undefined;
    endpoint?: string | undefined;
    user_id?: string | undefined;
    subcategory?: string | undefined;
    session_id?: string | undefined;
    ip_address?: string | undefined;
    user_agent?: string | undefined;
    geo_location?: {
        region: string;
        country: string;
        city: string;
    } | undefined;
    http_method?: string | undefined;
    response_code?: number | undefined;
    data_types?: string[] | undefined;
    data_volume?: number | undefined;
    previous_hash?: string | undefined;
    resolution_notes?: string | undefined;
    resolved_by?: string | undefined;
    resolved_at?: Date | undefined;
}, {
    id: string;
    description: string;
    status: AuditStatus;
    category: string;
    tags: string[];
    timestamp: Date;
    title: string;
    severity: AuditSeverity;
    compliance_frameworks: ComplianceFramework[];
    event_type: AuditEventType;
    system_component: string;
    risk_score: number;
    risk_factors: string[];
    regulatory_impact: boolean;
    sensitive_data_involved: boolean;
    chain_hash: string;
    alert_triggered: boolean;
    notification_sent: boolean;
    escalation_level: number;
    metadata?: Record<string, unknown> | undefined;
    endpoint?: string | undefined;
    user_id?: string | undefined;
    subcategory?: string | undefined;
    session_id?: string | undefined;
    ip_address?: string | undefined;
    user_agent?: string | undefined;
    geo_location?: {
        region: string;
        country: string;
        city: string;
    } | undefined;
    http_method?: string | undefined;
    response_code?: number | undefined;
    data_types?: string[] | undefined;
    data_volume?: number | undefined;
    previous_hash?: string | undefined;
    resolution_notes?: string | undefined;
    resolved_by?: string | undefined;
    resolved_at?: Date | undefined;
}>;
export type AuditEvent = z.infer<typeof AuditEventSchema>;
export declare const AuditQuerySchema: z.ZodObject<{
    start_date: z.ZodOptional<z.ZodDate>;
    end_date: z.ZodOptional<z.ZodDate>;
    event_types: z.ZodOptional<z.ZodArray<z.ZodNativeEnum<typeof AuditEventType>, "many">>;
    severities: z.ZodOptional<z.ZodArray<z.ZodNativeEnum<typeof AuditSeverity>, "many">>;
    statuses: z.ZodOptional<z.ZodArray<z.ZodNativeEnum<typeof AuditStatus>, "many">>;
    compliance_frameworks: z.ZodOptional<z.ZodArray<z.ZodNativeEnum<typeof ComplianceFramework>, "many">>;
    search_text: z.ZodOptional<z.ZodString>;
    user_id: z.ZodOptional<z.ZodString>;
    ip_address: z.ZodOptional<z.ZodString>;
    min_risk_score: z.ZodOptional<z.ZodNumber>;
    max_risk_score: z.ZodOptional<z.ZodNumber>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sort_field: z.ZodDefault<z.ZodString>;
    sort_order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    sort_order: "asc" | "desc";
    sort_field: string;
    start_date?: Date | undefined;
    end_date?: Date | undefined;
    user_id?: string | undefined;
    compliance_frameworks?: ComplianceFramework[] | undefined;
    statuses?: AuditStatus[] | undefined;
    ip_address?: string | undefined;
    event_types?: AuditEventType[] | undefined;
    severities?: AuditSeverity[] | undefined;
    search_text?: string | undefined;
    min_risk_score?: number | undefined;
    max_risk_score?: number | undefined;
}, {
    limit?: number | undefined;
    page?: number | undefined;
    start_date?: Date | undefined;
    end_date?: Date | undefined;
    user_id?: string | undefined;
    sort_order?: "asc" | "desc" | undefined;
    compliance_frameworks?: ComplianceFramework[] | undefined;
    statuses?: AuditStatus[] | undefined;
    ip_address?: string | undefined;
    event_types?: AuditEventType[] | undefined;
    severities?: AuditSeverity[] | undefined;
    search_text?: string | undefined;
    min_risk_score?: number | undefined;
    max_risk_score?: number | undefined;
    sort_field?: string | undefined;
}>;
export type AuditQuery = z.infer<typeof AuditQuerySchema>;
export declare const AuditAnalyticsSchema: z.ZodObject<{
    timeframe: z.ZodEnum<["hour", "day", "week", "month", "year"]>;
    metrics: z.ZodArray<z.ZodEnum<["event_count", "unique_users", "risk_score_average", "severity_distribution", "compliance_violations", "geographic_distribution", "system_component_activity"]>, "many">;
    group_by: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    filters: z.ZodOptional<z.ZodObject<{
        start_date: z.ZodOptional<z.ZodDate>;
        end_date: z.ZodOptional<z.ZodDate>;
        event_types: z.ZodOptional<z.ZodArray<z.ZodNativeEnum<typeof AuditEventType>, "many">>;
        severities: z.ZodOptional<z.ZodArray<z.ZodNativeEnum<typeof AuditSeverity>, "many">>;
        statuses: z.ZodOptional<z.ZodArray<z.ZodNativeEnum<typeof AuditStatus>, "many">>;
        compliance_frameworks: z.ZodOptional<z.ZodArray<z.ZodNativeEnum<typeof ComplianceFramework>, "many">>;
        search_text: z.ZodOptional<z.ZodString>;
        user_id: z.ZodOptional<z.ZodString>;
        ip_address: z.ZodOptional<z.ZodString>;
        min_risk_score: z.ZodOptional<z.ZodNumber>;
        max_risk_score: z.ZodOptional<z.ZodNumber>;
        page: z.ZodDefault<z.ZodNumber>;
        limit: z.ZodDefault<z.ZodNumber>;
        sort_field: z.ZodDefault<z.ZodString>;
        sort_order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
    }, "strip", z.ZodTypeAny, {
        limit: number;
        page: number;
        sort_order: "asc" | "desc";
        sort_field: string;
        start_date?: Date | undefined;
        end_date?: Date | undefined;
        user_id?: string | undefined;
        compliance_frameworks?: ComplianceFramework[] | undefined;
        statuses?: AuditStatus[] | undefined;
        ip_address?: string | undefined;
        event_types?: AuditEventType[] | undefined;
        severities?: AuditSeverity[] | undefined;
        search_text?: string | undefined;
        min_risk_score?: number | undefined;
        max_risk_score?: number | undefined;
    }, {
        limit?: number | undefined;
        page?: number | undefined;
        start_date?: Date | undefined;
        end_date?: Date | undefined;
        user_id?: string | undefined;
        sort_order?: "asc" | "desc" | undefined;
        compliance_frameworks?: ComplianceFramework[] | undefined;
        statuses?: AuditStatus[] | undefined;
        ip_address?: string | undefined;
        event_types?: AuditEventType[] | undefined;
        severities?: AuditSeverity[] | undefined;
        search_text?: string | undefined;
        min_risk_score?: number | undefined;
        max_risk_score?: number | undefined;
        sort_field?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    metrics: ("event_count" | "unique_users" | "risk_score_average" | "severity_distribution" | "compliance_violations" | "geographic_distribution" | "system_component_activity")[];
    timeframe: "month" | "week" | "year" | "day" | "hour";
    filters?: {
        limit: number;
        page: number;
        sort_order: "asc" | "desc";
        sort_field: string;
        start_date?: Date | undefined;
        end_date?: Date | undefined;
        user_id?: string | undefined;
        compliance_frameworks?: ComplianceFramework[] | undefined;
        statuses?: AuditStatus[] | undefined;
        ip_address?: string | undefined;
        event_types?: AuditEventType[] | undefined;
        severities?: AuditSeverity[] | undefined;
        search_text?: string | undefined;
        min_risk_score?: number | undefined;
        max_risk_score?: number | undefined;
    } | undefined;
    group_by?: string[] | undefined;
}, {
    metrics: ("event_count" | "unique_users" | "risk_score_average" | "severity_distribution" | "compliance_violations" | "geographic_distribution" | "system_component_activity")[];
    timeframe: "month" | "week" | "year" | "day" | "hour";
    filters?: {
        limit?: number | undefined;
        page?: number | undefined;
        start_date?: Date | undefined;
        end_date?: Date | undefined;
        user_id?: string | undefined;
        sort_order?: "asc" | "desc" | undefined;
        compliance_frameworks?: ComplianceFramework[] | undefined;
        statuses?: AuditStatus[] | undefined;
        ip_address?: string | undefined;
        event_types?: AuditEventType[] | undefined;
        severities?: AuditSeverity[] | undefined;
        search_text?: string | undefined;
        min_risk_score?: number | undefined;
        max_risk_score?: number | undefined;
        sort_field?: string | undefined;
    } | undefined;
    group_by?: string[] | undefined;
}>;
export type AuditAnalytics = z.infer<typeof AuditAnalyticsSchema>;
/**
 * Enhanced Audit Management System
 *
 * Builds upon existing EvidenceAccessAuditService with advanced management capabilities
 */
export declare class AuditManagementSystem {
    private events;
    private indexedData;
    constructor();
    /**
     * Create a new audit event with enhanced management capabilities
     */
    createAuditEvent(eventData: Omit<AuditEvent, 'id' | 'timestamp' | 'chain_hash'>): AuditEvent;
    /**
     * Advanced audit event query with filtering, pagination, and analytics
     */
    queryAuditEvents(query: AuditQuery): Promise<{
        events: AuditEvent[];
        totalCount: number;
        page: number;
        totalPages: number;
        analytics: any;
    }>;
    /**
     * Generate comprehensive audit analytics and insights
     */
    generateAuditAnalytics(request: AuditAnalytics): any;
    /**
     * Compliance-specific audit report generation
     */
    generateComplianceReport(framework: ComplianceFramework, dateRange: {
        start: Date;
        end: Date;
    }): any;
    /**
     * Real-time audit monitoring and alerting
     */
    setupRealTimeMonitoring(config: {
        alertThresholds: {
            criticalEventRate: number;
            highRiskEventRate: number;
            failedLoginRate: number;
            dataExportVolume: number;
        };
        notificationChannels: string[];
        escalationPolicies: any[];
    }): void;
    /**
     * Audit event correlation and pattern detection
     */
    detectAnomalousPatterns(timeWindow?: number): any[];
    /**
     * Audit retention and archival management
     */
    manageAuditRetention(policies: {
        defaultRetentionDays: number;
        complianceRetentionDays: {
            [framework in ComplianceFramework]?: number;
        };
        archivalStorage: string;
        legalHoldOverride: boolean;
    }): void;
    private storeEvent;
    private indexEvent;
    private generateChainHash;
    private processEventAlerts;
    private applyFilters;
    private applySorting;
    private generateAnalytics;
    private calculateEventCountMetrics;
    private calculateUniqueUsersMetrics;
    private calculateRiskScoreMetrics;
    private calculateSeverityDistribution;
    private calculateEventTypeDistribution;
    private calculateStatusDistribution;
    private calculateComplianceViolations;
    private calculateGeographicDistribution;
    private calculateSystemComponentActivity;
    private calculateComplianceFrameworkDistribution;
    private calculateRiskTrends;
    private generateFrameworkSpecificReport;
    private generateComplianceRecommendations;
    private deleteEvent;
    private archiveEvent;
}
export declare const auditManagementSystem: AuditManagementSystem;
export declare const createAuditEvent: (eventData: Omit<AuditEvent, "id" | "timestamp" | "chain_hash">) => {
    id: string;
    description: string;
    status: AuditStatus;
    category: string;
    tags: string[];
    timestamp: Date;
    title: string;
    severity: AuditSeverity;
    compliance_frameworks: ComplianceFramework[];
    event_type: AuditEventType;
    system_component: string;
    risk_score: number;
    risk_factors: string[];
    regulatory_impact: boolean;
    sensitive_data_involved: boolean;
    chain_hash: string;
    alert_triggered: boolean;
    notification_sent: boolean;
    escalation_level: number;
    metadata?: Record<string, unknown> | undefined;
    endpoint?: string | undefined;
    user_id?: string | undefined;
    subcategory?: string | undefined;
    session_id?: string | undefined;
    ip_address?: string | undefined;
    user_agent?: string | undefined;
    geo_location?: {
        region: string;
        country: string;
        city: string;
    } | undefined;
    http_method?: string | undefined;
    response_code?: number | undefined;
    data_types?: string[] | undefined;
    data_volume?: number | undefined;
    previous_hash?: string | undefined;
    resolution_notes?: string | undefined;
    resolved_by?: string | undefined;
    resolved_at?: Date | undefined;
};
export declare const queryAuditEvents: (query: AuditQuery) => Promise<{
    events: AuditEvent[];
    totalCount: number;
    page: number;
    totalPages: number;
    analytics: any;
}>;
export declare const generateAuditAnalytics: (request: AuditAnalytics) => any;
export default AuditManagementSystem;
//# sourceMappingURL=AuditManagementSystem.d.ts.map