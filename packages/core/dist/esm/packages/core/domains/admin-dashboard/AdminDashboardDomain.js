;
// React Hooks
hooks: {
    useAdminDashboard: () => {
        state: AdminDashboardState;
        loadLayout: (layoutId) => Promise;
        saveLayout: (layout) => Promise;
        addWidget: (widgetType, position) => void ;
        removeWidget: (widgetId) => void ;
        updateWidget: (widgetId, updates) => void ;
        toggleEditMode: () => void ;
    };
    useAdminUsers: () => {
        users: AdminUser;
        loading: boolean;
        error: string | null;
        createUser: (userData) => Promise;
        updateUser: (userId, updates) => Promise;
        deleteUser: (userId) => Promise;
        suspendUser: (userId, reason) => Promise;
    };
    useSecurity: () => {
        alerts: SecurityAlert;
        metrics: any;
        loading: boolean;
        acknowledgeAlert: (alertId) => Promise;
        performScan: () => Promise;
        generateReport: () => Promise;
    };
    useApiManagement: () => {
        apiKeys: ApiKey;
        loading: boolean;
        error: string | null;
        createApiKey: (keyData) => Promise;
        revokeApiKey: (keyId) => Promise;
        updateRateLimit: (keyId, rateLimit) => Promise;
    };
    useSystemMonitoring: () => {
        metrics: SystemMetrics | null;
        health: any;
        loading: boolean;
        refreshMetrics: () => Promise;
        restartService: (serviceName) => Promise;
    };
}
;
// Domain Services
services: {
    users: IAdminUserService;
    security: ISecurityService;
    apiManagement: IApiManagementService;
    systemMonitoring: ISystemMonitoringService;
    dashboardConfig: IDashboardConfigService;
    widgetRegistry: IWidgetRegistry;
}
;
// Event System
events: AdminDomainEvents & {
    subscribe: (event, callback) => () => void ,
    emit: (event, ...args) => void 
};
// Configuration
config: {
    getConfig: () => AdminDashboardConfig;
    updateConfig: (config) => void ;
    resetConfig: () => void ;
}
;
// Utilities
utils: {
    validatePermission: (userPermissions, requiredPermission) => boolean;
    formatUserRole: (role) => string;
    calculateSecurityScore: (metrics) => number;
    exportDashboardConfig: (layout) => string;
    importDashboardConfig: (configString) => DashboardLayout;
    generateApiKey: () => string;
    hashApiKey: (key) => string;
}
;
export const ADMIN_DOMAIN_EVENTS = {
    DASHBOARD_LOADED: 'admin:dashboard:loaded',
    LAYOUT_CHANGED: 'admin:layout:changed',
    WIDGET_ADDED: 'admin:widget:added',
    WIDGET_REMOVED: 'admin:widget:removed',
    WIDGET_UPDATED: 'admin:widget:updated',
    USER_CREATED: 'admin:user:created',
    USER_UPDATED: 'admin:user:updated',
    USER_DELETED: 'admin:user:deleted',
    USER_SUSPENDED: 'admin:user:suspended',
    PERMISSION_CHANGED: 'admin:permission:changed',
    SECURITY_ALERT: 'admin:security:alert',
    SECURITY_SCAN_COMPLETED: 'admin:security:scan:completed',
    API_KEY_CREATED: 'admin:api:key:created',
    API_KEY_REVOKED: 'admin:api:key:revoked',
    SYSTEM_HEALTH_CHANGED: 'admin:system:health:changed',
    CONFIG_UPDATED: 'admin:config:updated',
};
