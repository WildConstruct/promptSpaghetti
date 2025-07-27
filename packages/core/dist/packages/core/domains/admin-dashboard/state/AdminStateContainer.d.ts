/**
 * Admin Dashboard State Container
 * REFACTOR-006: Advanced State Management & Data Flow Architecture
 *
 * Domain-specific state management for admin dashboard functionality
 */
import { BaseStateContainer, ValidationResult } from '../../../state/containers/BaseStateContainer';
import { DomainStateContainer, DomainStateChange } from '../../../state/orchestration/StateOrchestrator';
export interface AdminDashboardState {
    layout: {
        widgets: DashboardWidget[];
        gridConfig: GridConfiguration;
        theme: 'light' | 'dark' | 'auto';
        collapsed: boolean;
    };
    users: {
        list: UserRecord[];
        selected: string[];
        filters: UserFilters;
        pagination: PaginationState;
        bulkOperations: BulkOperation[];
    };
    metrics: {
        realTime: RealTimeMetrics;
        historical: HistoricalMetrics;
        alerts: AlertRecord[];
        performance: PerformanceMetrics;
    };
    security: {
        threatLevel: 'low' | 'medium' | 'high' | 'critical';
        activeIncidents: SecurityIncident[];
        auditLogs: AuditLogEntry[];
        accessControl: AccessControlState;
    };
    api: {
        endpoints: ApiEndpoint[];
        rateLimits: RateLimitConfig[];
        usage: ApiUsageMetrics;
        errors: ApiError[];
    };
    configuration: {
        features: FeatureFlag[];
        settings: SystemSettings;
        maintenance: MaintenanceState;
        backup: BackupState;
    };
    ui: {
        activeTab: string;
        modals: ModalState[];
        notifications: NotificationState[];
        loading: LoadingState;
    };
    collaboration: {
        activeAdmins: AdminUser[];
        sharedSessions: SharedSession[];
        conflicts: StateConflict[];
    };
}
export interface DashboardWidget {
    id: string;
    type: 'metric' | 'chart' | 'table' | 'alert' | 'custom';
    title: string;
    config: WidgetConfiguration;
    position: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    data: any;
    isLoading: boolean;
    error?: string;
    lastUpdated: number;
    refreshInterval?: number;
    permissions: string[];
}
export interface GridConfiguration {
    cols: number;
    rowHeight: number;
    margin: [number, number];
    containerPadding: [number, number];
    breakpoints: Record<string, number>;
    layouts: Record<string, any[]>;
}
export interface UserRecord {
    id: string;
    username: string;
    email: string;
    role: UserRole;
    status: 'active' | 'inactive' | 'suspended' | 'banned';
    permissions: Permission[];
    profile: UserProfile;
    activity: UserActivity;
    createdAt: number;
    lastLogin: number;
    metadata: Record<string, any>;
}
export interface UserRole {
    id: string;
    name: string;
    permissions: string[];
    hierarchy: number;
    isSystem: boolean;
}
export interface Permission {
    resource: string;
    actions: string[];
    conditions?: Record<string, any>;
    grantedAt: number;
    expiresAt?: number;
}
export interface UserProfile {
    firstName: string;
    lastName: string;
    avatar?: string;
    phone?: string;
    department?: string;
    title?: string;
    preferences: UserPreferences;
}
export interface UserActivity {
    loginCount: number;
    lastActions: UserAction[];
    sessionsActive: number;
    ipAddresses: string[];
    devices: DeviceInfo[];
}
export interface UserFilters {
    role?: string;
    status?: string;
    department?: string;
    searchTerm?: string;
    dateRange?: {
        start: number;
        end: number;
    };
}
export interface PaginationState {
    page: number;
    pageSize: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
}
export interface BulkOperation {
    id: string;
    type: 'activate' | 'deactivate' | 'delete' | 'update_role' | 'reset_password';
    userIds: string[];
    status: 'pending' | 'running' | 'completed' | 'failed';
    progress: number;
    result?: BulkOperationResult;
    startedAt: number;
    completedAt?: number;
}
export interface RealTimeMetrics {
    activeUsers: number;
    systemLoad: number;
    memoryUsage: number;
    cpuUsage: number;
    networkTraffic: number;
    errorRate: number;
    responseTime: number;
    timestamp: number;
}
export interface HistoricalMetrics {
    timeRange: '1h' | '24h' | '7d' | '30d' | '90d';
    data: MetricDataPoint[];
    aggregation: 'avg' | 'sum' | 'max' | 'min';
}
export interface MetricDataPoint {
    timestamp: number;
    value: number;
    metadata?: Record<string, any>;
}
export interface AlertRecord {
    id: string;
    type: 'system' | 'security' | 'performance' | 'user' | 'api';
    severity: 'info' | 'warning' | 'error' | 'critical';
    title: string;
    message: string;
    source: string;
    timestamp: number;
    acknowledged: boolean;
    acknowledgedBy?: string;
    acknowledgedAt?: number;
    resolved: boolean;
    resolvedAt?: number;
    actions: AlertAction[];
    metadata: Record<string, any>;
}
export interface SecurityIncident {
    id: string;
    type: 'breach_attempt' | 'suspicious_activity' | 'policy_violation' | 'system_compromise';
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'active' | 'investigating' | 'resolved' | 'false_positive';
    description: string;
    affectedUsers: string[];
    affectedResources: string[];
    timeline: IncidentTimelineEntry[];
    response: IncidentResponse;
    createdAt: number;
    updatedAt: number;
}
export interface ApiEndpoint {
    id: string;
    path: string;
    method: string;
    version: string;
    status: 'active' | 'deprecated' | 'disabled';
    rateLimit: number;
    authentication: string[];
    permissions: string[];
    documentation: string;
    usage: EndpointUsageStats;
    healthStatus: 'healthy' | 'degraded' | 'error';
}
export interface SystemSettings {
    maintenance: {
        enabled: boolean;
        scheduledAt?: number;
        message?: string;
    };
    features: Record<string, boolean>;
    limits: {
        maxUsers: number;
        maxSessions: number;
        maxFileSize: number;
        maxRequests: number;
    };
    security: {
        passwordPolicy: PasswordPolicy;
        sessionTimeout: number;
        maxLoginAttempts: number;
        twoFactorRequired: boolean;
    };
    notifications: {
        emailEnabled: boolean;
        smsEnabled: boolean;
        pushEnabled: boolean;
        templates: Record<string, string>;
    };
}
export type AdminOperation = {
    type: 'UPDATE_LAYOUT';
    layout: Partial<AdminDashboardState['layout']>;
} | {
    type: 'ADD_WIDGET';
    widget: DashboardWidget;
} | {
    type: 'UPDATE_WIDGET';
    widgetId: string;
    updates: Partial<DashboardWidget>;
} | {
    type: 'REMOVE_WIDGET';
    widgetId: string;
} | {
    type: 'CREATE_USER';
    user: Omit<UserRecord, 'id' | 'createdAt'>;
} | {
    type: 'UPDATE_USER';
    userId: string;
    updates: Partial<UserRecord>;
} | {
    type: 'DELETE_USER';
    userId: string;
} | {
    type: 'BULK_USER_OPERATION';
    operation: BulkOperation;
} | {
    type: 'UPDATE_FILTERS';
    filters: Partial<UserFilters>;
} | {
    type: 'SET_PAGINATION';
    pagination: Partial<PaginationState>;
} | {
    type: 'UPDATE_METRICS';
    metrics: Partial<RealTimeMetrics>;
} | {
    type: 'ADD_ALERT';
    alert: AlertRecord;
} | {
    type: 'ACKNOWLEDGE_ALERT';
    alertId: string;
    userId: string;
} | {
    type: 'RESOLVE_ALERT';
    alertId: string;
} | {
    type: 'UPDATE_SECURITY_STATE';
    updates: Partial<AdminDashboardState['security']>;
} | {
    type: 'CREATE_INCIDENT';
    incident: Omit<SecurityIncident, 'id' | 'createdAt' | 'updatedAt'>;
} | {
    type: 'UPDATE_INCIDENT';
    incidentId: string;
    updates: Partial<SecurityIncident>;
} | {
    type: 'UPDATE_API_CONFIG';
    updates: Partial<AdminDashboardState['api']>;
} | {
    type: 'UPDATE_SYSTEM_SETTINGS';
    settings: Partial<SystemSettings>;
} | {
    type: 'SET_ACTIVE_TAB';
    tab: string;
} | {
    type: 'SHOW_MODAL';
    modal: ModalState;
} | {
    type: 'HIDE_MODAL';
    modalId: string;
} | {
    type: 'ADD_NOTIFICATION';
    notification: NotificationState;
} | {
    type: 'REMOVE_NOTIFICATION';
    notificationId: string;
};
export declare class AdminStateContainer extends BaseStateContainer<AdminDashboardState> implements DomainStateContainer {
    private widgetUpdateIntervals;
    private metricsUpdateInterval?;
    private alertPollingInterval?;
    constructor(initialState?: Partial<AdminDashboardState>);
    getInitialState(): AdminDashboardState;
    validateState(state: AdminDashboardState): ValidationResult;
    getDomainName(): string;
    applyOperation(operation: AdminOperation, userId?: string): Promise<void>;
    private applyOperationToState;
    applyExternalChange(change: DomainStateChange): Promise<void>;
    canAcceptChange(change: DomainStateChange): boolean;
    prepareForTransaction(transactionId: string): Promise<void>;
    commitTransaction(transactionId: string): Promise<void>;
    rollbackTransaction(transactionId: string): Promise<void>;
    getActiveAlerts(): AlertRecord[];
    getCriticalAlerts(): AlertRecord[];
    getSelectedUsers(): UserRecord[];
    getFilteredUsers(): UserRecord[];
    updateWidgetData(widgetId: string, data: any): Promise<void>;
    private setupPolling;
    private pollMetrics;
    private pollAlerts;
    private setupEventHandlers;
    private emitDomainEvents;
    private isValidEmail;
    private setNestedProperty;
    private generateId;
    private generateChangeId;
    destroy(): void;
}
interface WidgetConfiguration {
    dataSource?: string;
    refreshInterval?: number;
    chartType?: string;
    filters?: Record<string, any>;
    displayOptions?: Record<string, any>;
}
interface UserPreferences {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
    notifications: {
        email: boolean;
        push: boolean;
        sms: boolean;
    };
}
interface UserAction {
    type: string;
    resource: string;
    timestamp: number;
    metadata?: Record<string, any>;
}
interface DeviceInfo {
    id: string;
    type: 'desktop' | 'mobile' | 'tablet';
    os: string;
    browser: string;
    lastSeen: number;
}
interface BulkOperationResult {
    successful: number;
    failed: number;
    errors: string[];
}
interface PerformanceMetrics {
    uptime: number;
    throughput: number;
    latency: number;
    errorCount: number;
}
interface AccessControlState {
    policies: any[];
    roles: any[];
    violations: any[];
}
interface AuditLogEntry {
    id: string;
    userId: string;
    action: string;
    resource: string;
    timestamp: number;
    details: Record<string, any>;
}
interface AlertAction {
    type: string;
    label: string;
    callback: string;
}
interface IncidentTimelineEntry {
    timestamp: number;
    event: string;
    details: string;
    userId?: string;
}
interface IncidentResponse {
    actions: string[];
    assignee?: string;
    status: string;
    notes: string[];
}
interface EndpointUsageStats {
    requestCount: number;
    errorCount: number;
    avgResponseTime: number;
    lastAccessed: number;
}
interface RateLimitConfig {
    endpoint: string;
    limit: number;
    window: number;
    current: number;
}
interface ApiUsageMetrics {
    requestsPerMinute: number;
    errorRate: number;
    avgResponseTime: number;
    bandwidthUsage: number;
}
interface ApiError {
    id: string;
    endpoint: string;
    method: string;
    statusCode: number;
    message: string;
    timestamp: number;
    userId?: string;
}
interface FeatureFlag {
    name: string;
    enabled: boolean;
    description: string;
    rolloutPercentage: number;
}
interface MaintenanceState {
    inProgress: boolean;
    scheduled: boolean;
    lastRun: number;
    nextRun: number;
}
interface BackupState {
    lastBackup: number;
    nextBackup: number;
    status: 'idle' | 'running' | 'completed' | 'failed';
    size: number;
}
interface PasswordPolicy {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSymbols: boolean;
}
interface ModalState {
    id: string;
    type: string;
    title: string;
    content: any;
    isOpen: boolean;
    onClose?: () => void;
}
interface NotificationState {
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    timestamp: number;
    duration?: number;
    actions?: Array<{
        label: string;
        action: () => void;
    }>;
}
interface LoadingState {
    global: boolean;
    sections: Record<string, boolean>;
}
interface AdminUser {
    id: string;
    name: string;
    avatar?: string;
    isActive: boolean;
    lastSeen: number;
}
interface SharedSession {
    id: string;
    adminIds: string[];
    resource: string;
    startTime: number;
    activity: any[];
}
interface StateConflict {
    id: string;
    type: string;
    description: string;
    timestamp: number;
    resolved: boolean;
}
export {};
//# sourceMappingURL=AdminStateContainer.d.ts.map