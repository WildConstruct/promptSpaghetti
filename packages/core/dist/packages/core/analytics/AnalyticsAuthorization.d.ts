/**
 * Analytics Authorization System - Story 1.5 Task 2
 *
 * Integrates with consolidated authentication system from Story 1.2
 * to provide secure event authorization and access control for analytics data.
 */
import { z } from 'zod';
import { UnifiedAnalyticsEvent } from './UnifiedEventBus';
export declare const AuthContextSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
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
    VIEW_INTEGRATION_ANALYTICS = "analytics:view_integration_analytics",
    export,
    interface,
    AuthorizationPolicy
}
export interface AuthorizationRule {
    id: string;
    condition: {
        eventTypes?: string;
        categories?: string;
        sources?: string;
        severities?: string;
        userMatch?: 'self' | 'organization' | 'any';
        organizationMatch?: 'self' | 'any';
        requiredPermissions: string;
        requiredRoles?: string;
    };
    action: 'allow' | 'deny';
    fields?: {
        allowed?: string;
        denied?: string;
        redacted?: string;
    };
}
export interface AuthorizationResult {
    allowed: boolean;
    reason?: string;
    filteredEvent?: Partial<UnifiedAnalyticsEvent>;
    redactedFields?: string;
    appliedRules?: string;
}
export declare class AnalyticsAuthorizationService {
    private policies;
    private authService;
    constructor(authService?: unknown);
    /**
    * Initialize default authorization policies
    */
    private initializeDefaultPolicies;
}
//# sourceMappingURL=AnalyticsAuthorization.d.ts.map