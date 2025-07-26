/**
 * Analytics Authorization System - Story 1.5 Task 2
 *
 * Integrates with consolidated authentication system from Story 1.2
 * to provide secure event authorization and access control for analytics data.
 */
import { z } from 'zod';
import { UnifiedAnalyticsEvent, EventFilter } from './UnifiedEventBus';
export declare const AuthContextSchema: z.ZodObject<{
    userId: z.ZodString;
    organizationId: z.ZodOptional<z.ZodString>;
    roles: z.ZodArray<z.ZodString, "many">;
    permissions: z.ZodArray<z.ZodString, "many">;
    sessionId: z.ZodString;
    workspaceId: z.ZodOptional<z.ZodString>;
    environment: z.ZodDefault<z.ZodString>;
    tokenType: z.ZodEnum<["jwt", "api_key", "session"]>;
    expiresAt: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    sessionId: string;
    userId: string;
    environment: string;
    roles: string[];
    permissions: string[];
    tokenType: "jwt" | "api_key" | "session";
    organizationId?: string | undefined;
    workspaceId?: string | undefined;
    expiresAt?: number | undefined;
}, {
    sessionId: string;
    userId: string;
    roles: string[];
    permissions: string[];
    tokenType: "jwt" | "api_key" | "session";
    organizationId?: string | undefined;
    environment?: string | undefined;
    workspaceId?: string | undefined;
    expiresAt?: number | undefined;
}>;
export type AuthContext = z.infer<typeof AuthContextSchema>;
export declare enum AnalyticsPermission {
    PUBLISH_EVENTS = "analytics:publish_events",
    VIEW_EVENTS = "analytics:view_events",
    VIEW_ALL_EVENTS = "analytics:view_all_events",
    DELETE_EVENTS = "analytics:delete_events",
    VIEW_ANALYTICS = "analytics:view_analytics",
    VIEW_ORGANIZATION_ANALYTICS = "analytics:view_org_analytics",
    EXPORT_ANALYTICS = "analytics:export_analytics",
    VIEW_SENSITIVE_DATA = "analytics:view_sensitive_data",
    VIEW_DASHBOARD = "analytics:view_dashboard",
    VIEW_ADMIN_DASHBOARD = "analytics:view_admin_dashboard",
    MANAGE_DASHBOARDS = "analytics:manage_dashboards",
    MANAGE_ANALYTICS = "analytics:manage_analytics",
    VIEW_SYSTEM_METRICS = "analytics:view_system_metrics",
    CONFIGURE_RETENTION = "analytics:configure_retention",
    MANAGE_INTEGRATIONS = "analytics:manage_integrations",
    VIEW_INTEGRATION_ANALYTICS = "analytics:view_integration_analytics"
}
export interface AuthorizationPolicy {
    id: string;
    name: string;
    description: string;
    rules: AuthorizationRule[];
    priority: number;
    enabled: boolean;
}
export interface AuthorizationRule {
    id: string;
    condition: {
        eventTypes?: string[];
        categories?: string[];
        sources?: string[];
        severities?: string[];
        userMatch?: 'self' | 'organization' | 'any';
        organizationMatch?: 'self' | 'any';
        requiredPermissions: string[];
        requiredRoles?: string[];
    };
    action: 'allow' | 'deny';
    fields?: {
        allowed?: string[];
        denied?: string[];
        redacted?: string[];
    };
}
export interface AuthorizationResult {
    allowed: boolean;
    reason?: string;
    filteredEvent?: Partial<UnifiedAnalyticsEvent>;
    redactedFields?: string[];
    appliedRules?: string[];
}
/**
 * Analytics Authorization Service
 *
 * Provides comprehensive authorization for analytics events and data access
 * integrated with the consolidated authentication system from Story 1.2.
 */
export declare class AnalyticsAuthorizationService {
    private policies;
    private authService;
    constructor(authService?: any);
    /**
     * Initialize default authorization policies
     */
    private initializeDefaultPolicies;
    /**
     * Authorize event publication
     */
    authorizeEventPublication(
      event: Partial<UnifiedAnalyticsEvent>,
      authContext: AuthContext
    ): Promise<AuthorizationResult>;
    /**
     * Authorize event access/viewing
     */
    authorizeEventAccess(event: UnifiedAnalyticsEvent, authContext: AuthContext): Promise<AuthorizationResult>;
    /**
     * Authorize analytics query with filtering
     */
    authorizeAnalyticsQuery(filter: EventFilter, authContext: AuthContext): Promise<{
        allowed: boolean;
        filteredQuery?: EventFilter;
        reason?: string;
    }>;
    /**
     * Authorize dashboard access
     */
    authorizeDashboardAccess(
      dashboardType: 'user' | 'organization' | 'admin' | 'system',
      authContext: AuthContext
    ): Promise<AuthorizationResult>;
    /**
     * Apply authorization policies to event
     */
    private applyPolicies;
    /**
     * Check if rule matches event and context
     */
    private ruleMatches;
    /**
     * Check if user has permission
     */
    private hasPermission;
    /**
     * Redact sensitive field from event
     */
    private redactField;
    /**
     * Filter event fields
     */
    private filterFields;
    /**
     * Add authorization policy
     */
    addPolicy(policy: AuthorizationPolicy): void;
    /**
     * Remove authorization policy
     */
    removePolicy(policyId: string): boolean;
    /**
     * Get authorization policy
     */
    getPolicy(policyId: string): AuthorizationPolicy | undefined;
    /**
     * List all policies
     */
    listPolicies(): AuthorizationPolicy[];
    /**
     * Validate auth context
     */
    validateAuthContext(authContext: any): AuthContext | null;
    /**
     * Create auth context from authentication service
     */
    createAuthContextFromToken(token: string): Promise<AuthContext | null>;
    /**
     * Get authorization summary for user
     */
    getAuthorizationSummary(authContext: AuthContext): {
        userId: string;
        organizationId?: string;
        roles: string[];
        permissions: string[];
        capabilities: {
            canPublishEvents: boolean;
            canViewEvents: boolean;
            canViewAllEvents: boolean;
            canViewOrganizationAnalytics: boolean;
            canViewDashboard: boolean;
            canViewAdminDashboard: boolean;
            canManageAnalytics: boolean;
        };
    };
}
export default AnalyticsAuthorizationService;
//# sourceMappingURL=AnalyticsAuthorization.d.ts.map