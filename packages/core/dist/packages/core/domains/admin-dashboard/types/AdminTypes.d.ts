/**
 * Admin Dashboard Domain Types
 * REFACTOR-005: Domain-Driven Architecture
 *
 * Type definitions for the admin dashboard domain
 */
import React from 'react';
export interface AdminDashboardConfig {
    layout: {
        columns: number;
        gaps: 'small' | 'medium' | 'large';
        responsive: boolean;
    };
    widgets: {
        autoRefresh: boolean;
        refreshInterval: number;
        showHeaders: boolean;
        collapsible: boolean;
    };
    permissions: {
        canEdit: boolean;
        canExport: boolean;
        canViewSensitive: boolean;
    };
    theme: {
        variant: 'light' | 'dark' | 'auto';
        density: 'compact' | 'comfortable' | 'spacious';
    };
}
export interface WidgetDefinition {
    id: string;
    type: string;
    title: string;
    description?: string;
    component: React.ComponentType<WidgetProps>;
    config: WidgetConfig;
    permissions?: string;
    category: 'security' | 'analytics' | 'users' | 'system' | 'custom';
}
export interface WidgetConfig {
    refreshInterval?: number;
    autoRefresh?: boolean;
    height?: number;
    colspan?: number;
    collapsible?: boolean;
    exportable?: boolean;
    [key: string]: any;
}
export interface WidgetProps {
    id: string;
    config: WidgetConfig;
    onConfigChange?: (config: WidgetConfig) => void;
    onError?: (error: Error) => void;
    onDataUpdate?: (data: any) => void;
    className?: string;
}
export interface DashboardLayout {
    id: string;
    name: string;
    description?: string;
    widgets: DashboardWidgetInstance;
    config: AdminDashboardConfig;
    permissions: string;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface DashboardWidgetInstance {
    id: string;
    widgetType: string;
    position: {
        row: number;
        col: number;
    };
    size: {
        width: number;
        height: number;
    };
    config: WidgetConfig;
    title?: string;
    visible: boolean;
}
export interface AdminDashboardState {
    layout: DashboardLayout | null;
    widgets: Record<string, WidgetDefinition>;
    loading: boolean;
    error: string | null;
    config: AdminDashboardConfig;
    editMode: boolean;
    selectedWidgetId: string | null;
}
export interface AdminUser {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    permissions: Permission;
    status: 'active' | 'inactive' | 'suspended';
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface UserRole {
    id: string;
    name: string;
    description: string;
    permissions: Permission;
    isSystemRole: boolean;
}
export interface Permission {
    id: string;
    name: string;
    description: string;
    resource: string;
    action: 'read' | 'write' | 'delete' | 'admin';
}
export interface SecurityAlert {
    id: string;
    type: 'warning' | 'error' | 'info';
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    message: string;
    source: string;
    timestamp: Date;
    userId?: string;
    acknowledged: boolean;
    acknowledgedBy?: string;
    acknowledgedAt?: Date;
}
export interface SecurityMetrics {
    activeUsers: number;
    failedLogins: number;
    suspiciousActivity: number;
    dataBreaches: number;
    vulnerabilities: {
        critical: number;
        high: number;
        medium: number;
        low: number;
    };
    complianceScore: number;
}
export interface ApiKey {
    id: string;
    name: string;
    key: string;
    userId: string;
    permissions: string;
    rateLimit: {
        requests: number;
        period: 'minute' | 'hour' | 'day';
    };
    usage: {
        totalRequests: number;
        lastUsed?: Date;
    };
    status: 'active' | 'inactive' | 'revoked';
    expiresAt?: Date;
    createdAt: Date;
}
export interface ApiEndpoint {
    id: string;
    path: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    description: string;
    permissions: string;
    rateLimit?: {
        requests: number;
        period: 'minute' | 'hour' | 'day';
    };
    usage: {
        totalRequests: number;
        averageResponseTime: number;
        errorRate: number;
    };
    status: 'active' | 'deprecated' | 'disabled';
}
export interface SystemMetrics {
    performance: {
        cpu: number;
        memory: number;
        disk: number;
        network: number;
    };
    health: {
        database: 'healthy' | 'warning' | 'error';
        cache: 'healthy' | 'warning' | 'error';
        api: 'healthy' | 'warning' | 'error';
        storage: 'healthy' | 'warning' | 'error';
    };
    uptime: number;
    version: string;
    environment: 'development' | 'staging' | 'production';
}
export interface AdminDomainEvents {
    onDashboardLoaded: (layout: DashboardLayout) => void;
    onWidgetAdded: (widget: DashboardWidgetInstance) => void;
    onWidgetRemoved: (widgetId: string) => void;
    onWidgetConfigChanged: (widgetId: string, config: WidgetConfig) => void;
    onLayoutChanged: (layout: DashboardLayout) => void;
    onUserUpdated: (user: AdminUser) => void;
    onSecurityAlert: (alert: SecurityAlert) => void;
    onPermissionChanged: (userId: string, permissions: Permission) => void;
    onApiKeyCreated: (apiKey: ApiKey) => void;
    onApiKeyRevoked: (apiKeyId: string) => void;
}
export interface AdminDashboardProps {
    userId: string;
    permissions: Permission;
    config?: Partial<AdminDashboardConfig>;
    onConfigChange?: (config: AdminDashboardConfig) => void;
    onError?: (error: Error) => void;
    className?: string;
}
export interface WidgetGridProps {
    layout: DashboardLayout;
    editMode: boolean;
    onWidgetMove: (widgetId: string, position: {
        row: number;
        col: number;
    }) => void;
    onWidgetResize: (widgetId: string, size: {
        width: number;
        height: number;
    }) => void;
    onWidgetRemove: (widgetId: string) => void;
    className?: string;
}
export interface WidgetLibraryProps {
    availableWidgets: WidgetDefinition;
    onWidgetAdd: (widgetType: string, position: {
        row: number;
        col: number;
    }) => void;
    userPermissions: Permission;
    className?: string;
}
//# sourceMappingURL=AdminTypes.d.ts.map