/**
 * Admin Dashboard Domain Interface
 * REFACTOR-005: Domain-Driven Architecture
 * 
 * Main interface and export for the admin dashboard domain
 */
import React from 'react';
import {
  AdminDashboardState,
  AdminDashboardConfig,
  DashboardLayout,
  WidgetDefinition,
  DashboardWidgetInstance,
  AdminUser,
  SecurityAlert,
  ApiKey,
  SystemMetrics,
  AdminDomainEvents,
  AdminDashboardProps,
  WidgetGridProps,
  WidgetLibraryProps
} from './types/AdminTypes';

// Domain service interfaces

export interface IAdminUserService {
  getUsers(): Promise<AdminUser>;
  getUser(userId: string): Promise<AdminUser>;
  createUser(userData: Partial<AdminUser>): Promise<AdminUser>;
  updateUser(userId: string, updates: Partial<AdminUser>): Promise<AdminUser>;
  deleteUser(userId: string): Promise<void>;
  updateUserPermissions(userId: string, permissions: string): Promise<void>;
  suspendUser(userId: string, reason: string): Promise<void>;
  activateUser(userId: string): Promise<void>;
}
export interface ISecurityService {
  getSecurityAlerts(): Promise<SecurityAlert>;
  acknowledgeAlert(alertId: string): Promise<void>;
  getSecurityMetrics(): Promise<any>;
  performSecurityScan(): Promise<any>;
  updateSecurityPolicy(policy: any): Promise<void>;
  generateSecurityReport(): Promise<any>;
}
export interface IApiManagementService {
  getApiKeys(): Promise<ApiKey>;
  createApiKey(keyData: Partial<ApiKey>): Promise<ApiKey>;
  updateApiKey(keyId: string, updates: Partial<ApiKey>): Promise<ApiKey>;
  revokeApiKey(keyId: string): Promise<void>;
  getApiUsage(keyId: string, period: string): Promise<any>;
  updateRateLimit(keyId: string, rateLimit: any): Promise<void>;
}
export interface ISystemMonitoringService {
  getSystemMetrics(): Promise<SystemMetrics>;
  getSystemHealth(): Promise<any>;
  getPerformanceMetrics(period: string): Promise<any>;
  restartService(serviceName: string): Promise<void>;
  updateSystemConfig(config: any): Promise<void>;
}
export interface IDashboardConfigService {
  getLayouts(): Promise<DashboardLayout>;
  getLayout(layoutId: string): Promise<DashboardLayout>;
  saveLayout(layout: DashboardLayout): Promise<DashboardLayout>;
  deleteLayout(layoutId: string): Promise<void>;
  cloneLayout(layoutId: string, newName: string): Promise<DashboardLayout>;
  getDefaultLayout(): Promise<DashboardLayout>;
  setDefaultLayout(layoutId: string): Promise<void>;
}
export interface IWidgetRegistry {
  getWidgets(): WidgetDefinition;
  getWidget(widgetType: string): WidgetDefinition | undefined;
  registerWidget(widget: WidgetDefinition): void;
  unregisterWidget(widgetType: string): void;
  getWidgetsByCategory(category: string): WidgetDefinition;
  getAvailableWidgets(permissions: string): WidgetDefinition;
  // Main domain interface
}
export interface IAdminDashboardDomain {
  // React Components
  components: {
  AdminDashboard: React.ComponentType<AdminDashboardProps>;
  WidgetGrid: React.ComponentType<WidgetGridProps>;
  WidgetLibrary: React.ComponentType<WidgetLibraryProps>;
  // Specific widgets
  SecurityWidget: React.ComponentType<any>;
  UserManagementWidget: React.ComponentType<any>;
  ApiManagementWidget: React.ComponentType<any>;
  SystemMetricsWidget: React.ComponentType<any>;
  AlertIndicatorsWidget: React.ComponentType<any>;
};
  // React Hooks
  hooks: {
  useAdminDashboard: () => {,
  state: AdminDashboardState;
  loadLayout: (layoutId: string) => Promise<void>;
  saveLayout: (layout: DashboardLayout) => Promise<void>;
  addWidget: (widgetType: string, position: any) => void;
  removeWidget: (widgetId: string) => void;
  updateWidget: (widgetId: string, updates: any) => void;
  toggleEditMode: () => void;
};
    useAdminUsers: () => {,
  users: AdminUser;
  loading: boolean;
  error: string | null;
  createUser: (userData: Partial<AdminUser>) => Promise<void>;
  updateUser: (userId: string, updates: Partial<AdminUser>) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  suspendUser: (userId: string, reason: string) => Promise<void>;
};
    useSecurity: () => {,
  alerts: SecurityAlert;
  metrics: any;
  loading: boolean;
  acknowledgeAlert: (alertId: string) => Promise<void>;
  performScan: () => Promise<void>;
  generateReport: () => Promise<any>;
};
    useApiManagement: () => {,
  apiKeys: ApiKey;
  loading: boolean;
  error: string | null;
  createApiKey: (keyData: Partial<ApiKey>) => Promise<void>;
  revokeApiKey: (keyId: string) => Promise<void>;
  updateRateLimit: (keyId: string, rateLimit: any) => Promise<void>;
};
    useSystemMonitoring: () => {,
  metrics: SystemMetrics | null;
  health: any;
  loading: boolean;
  refreshMetrics: () => Promise<void>;
  restartService: (serviceName: string) => Promise<void>;
};
  };
  // Domain Services
  services: {
  users: IAdminUserService;
  security: ISecurityService;
  apiManagement: IApiManagementService;
  systemMonitoring: ISystemMonitoringService;
  dashboardConfig: IDashboardConfigService;
  widgetRegistry: IWidgetRegistry;
};
  // Event System
  events: AdminDomainEvents & {,
  subscribe: (event: keyof AdminDomainEvents, callback: Function) => () => void;
  emit: (event: keyof AdminDomainEvents, ...args: any) => void;
};
  // Configuration
  config: {
  getConfig: () => AdminDashboardConfig;
  updateConfig: (config: Partial<AdminDashboardConfig>) => void;
  resetConfig: () => void;
};
  // Utilities
  utils: {
  validatePermission: (userPermissions: string, requiredPermission: string) => boolean;
  formatUserRole: (role: string) => string;
  calculateSecurityScore: (metrics: any) => number;
  exportDashboardConfig: (layout: DashboardLayout) => string;
  importDashboardConfig: (configString: string) => DashboardLayout;
  generateApiKey: () => string;
  hashApiKey: (key: string) => string;
};

// Domain factory function
}
export interface AdminDashboardDomainFactory {
  create(config?: Partial<AdminDashboardConfig>): IAdminDashboardDomain;
  // Event constants for cross-domain communication
}
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
} as const;

export type AdminDomainEventType = typeof ADMIN_DOMAIN_EVENTS[keyof typeof ADMIN_DOMAIN_EVENTS];