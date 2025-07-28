/**
 * Admin Dashboard State Container
 * REFACTOR-006: Advanced State Management & Data Flow Architecture
 * 
 * Domain-specific state management for admin dashboard functionality
 */
import { 
  BaseStateContainer,
  StateChange,
  ValidationResult,
  ValidationError
} from '../../../state/containers/BaseStateContainer';
import { DomainStateContainer, DomainStateChange } from '../../../state/orchestration/StateOrchestrator';

// Admin dashboard state interface
export interface AdminDashboardState {
  // Dashboard layout and configuration
  layout: {,
    widgets: DashboardWidget[];
    gridConfig: GridConfiguration;
    theme: 'light' | 'dark' | 'auto';
    collapsed: boolean;
  };
  // User management state
  users: {,
    list: UserRecord[];
    selected: string[];
    filters: UserFilters;
    pagination: PaginationState;
    bulkOperations: BulkOperation[];
  };
  // System metrics and monitoring
  metrics: {,
    realTime: RealTimeMetrics;
    historical: HistoricalMetrics;
    alerts: AlertRecord[];
    performance: PerformanceMetrics;
  };
  // Security monitoring
  security: {,
    threatLevel: 'low' | 'medium' | 'high' | 'critical';
    activeIncidents: SecurityIncident[];
    auditLogs: AuditLogEntry[];
    accessControl: AccessControlState;
  };
  // API management
  api: {,
    endpoints: ApiEndpoint[];
    rateLimits: RateLimitConfig[];
    usage: ApiUsageMetrics;
    errors: ApiError[];
  };
  // System configuration
  configuration: {,
    features: FeatureFlag[];
    settings: SystemSettings;
    maintenance: MaintenanceState;
    backup: BackupState;
  };
  // UI state
  ui: {,
    activeTab: string;
    modals: ModalState[];
    notifications: NotificationState[];
    loading: LoadingState;
  };
  // Real-time collaboration
  collaboration: {,
    activeAdmins: AdminUser[];
    sharedSessions: SharedSession[];
    conflicts: StateConflict[];
  };
}

// Supporting interfaces
export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'alert' | 'custom';
  title: string;
  config: WidgetConfiguration;
  position: { x: number; y: number; w: number; h: number };
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
  dateRange?: { start: number; end: number };
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
  maintenance: {,
    enabled: boolean;
    scheduledAt?: number;
    message?: string;
  };
  features: Record<string, boolean>;
  limits: {,
    maxUsers: number;
    maxSessions: number;
    maxFileSize: number;
    maxRequests: number;
  };
  security: {,
    passwordPolicy: PasswordPolicy;
    sessionTimeout: number;
    maxLoginAttempts: number;
    twoFactorRequired: boolean;
  };
  notifications: {,
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
    templates: Record<string, string>;
  };
}

// Admin operations
export type AdminOperation = 
  | { type: 'UPDATE_LAYOUT'; layout: Partial<AdminDashboardState['layout']> }
  | { type: 'ADD_WIDGET'; widget: DashboardWidget }
  | { type: 'UPDATE_WIDGET'; widgetId: string; updates: Partial<DashboardWidget> }
  | { type: 'REMOVE_WIDGET'; widgetId: string }
  | { type: 'CREATE_USER'; user: Omit<UserRecord, 'id' | 'createdAt'> }
  | { type: 'UPDATE_USER'; userId: string; updates: Partial<UserRecord> }
  | { type: 'DELETE_USER'; userId: string }
  | { type: 'BULK_USER_OPERATION'; operation: BulkOperation }
  | { type: 'UPDATE_FILTERS'; filters: Partial<UserFilters> }
  | { type: 'SET_PAGINATION'; pagination: Partial<PaginationState> }
  | { type: 'UPDATE_METRICS'; metrics: Partial<RealTimeMetrics> }
  | { type: 'ADD_ALERT'; alert: AlertRecord }
  | { type: 'ACKNOWLEDGE_ALERT'; alertId: string; userId: string }
  | { type: 'RESOLVE_ALERT'; alertId: string }
  | { type: 'UPDATE_SECURITY_STATE'; updates: Partial<AdminDashboardState['security']> }
  | { type: 'CREATE_INCIDENT'; incident: Omit<SecurityIncident, 'id' | 'createdAt' | 'updatedAt'> }
  | { type: 'UPDATE_INCIDENT'; incidentId: string; updates: Partial<SecurityIncident> }
  | { type: 'UPDATE_API_CONFIG'; updates: Partial<AdminDashboardState['api']> }
  | { type: 'UPDATE_SYSTEM_SETTINGS'; settings: Partial<SystemSettings> }
  | { type: 'SET_ACTIVE_TAB'; tab: string }
  | { type: 'SHOW_MODAL'; modal: ModalState }
  | { type: 'HIDE_MODAL'; modalId: string }
  | { type: 'ADD_NOTIFICATION'; notification: NotificationState }
  | { type: 'REMOVE_NOTIFICATION'; notificationId: string };

// Admin state container implementation
export class AdminStateContainer extends BaseStateContainer<AdminDashboardState> implements DomainStateContainer {
  private widgetUpdateIntervals = new Map<string, NodeJS.Timeout>();
  private metricsUpdateInterval?: NodeJS.Timeout;
  private alertPollingInterval?: NodeJS.Timeout;
  constructor(initialState?: Partial<AdminDashboardState>) {
    super({)
      enableValidation: true,
      enableHistory: true,
      maxHistorySize: 150,
      enablePersistence: true,
      persistenceKey: 'admin-dashboard-state',
      enableDebug: true,
      enableDevTools: true,
      enableTimeTravel: true,
      enablePerformanceProfiling: true,
    });
    if (initialState) {
      this.state = { ...this.getInitialState(), ...initialState };
    }
    this.setupPolling();
    this.setupEventHandlers();
  }
  // Abstract method implementations
  getInitialState(): AdminDashboardState {
    return {
      layout: {,
        widgets: [],
        gridConfig: {,
          cols: 12,
          rowHeight: 60,
          margin: [10, 10],
          containerPadding: [20, 20],
          breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
          layouts: {}
        },
        theme: 'light',
        collapsed: false,
      },
      users: {,
        list: [],
        selected: [],
        filters: {},
        pagination: {,
          page: 1,
          pageSize: 25,
          total: 0,
          hasNext: false,
          hasPrev: false,
        },
        bulkOperations: [],
      },
      metrics: {,
        realTime: {,
          activeUsers: 0,
          systemLoad: 0,
          memoryUsage: 0,
          cpuUsage: 0,
          networkTraffic: 0,
          errorRate: 0,
          responseTime: 0,
          timestamp: Date.now(),
        },
        historical: {,
          timeRange: '24h',
          data: [],
          aggregation: 'avg',
        },
        alerts: [],
        performance: {,
          uptime: 0,
          throughput: 0,
          latency: 0,
          errorCount: 0,
        }
      },
      security: {,
        threatLevel: 'low',
        activeIncidents: [],
        auditLogs: [],
        accessControl: {,
          policies: [],
          roles: [],
          violations: [],
        }
      },
      api: {,
        endpoints: [],
        rateLimits: [],
        usage: {,
          requestsPerMinute: 0,
          errorRate: 0,
          avgResponseTime: 0,
          bandwidthUsage: 0,
        },
        errors: [],
      },
      configuration: {,
        features: [],
        settings: {,
          maintenance: { enabled: false },
          features: {},
          limits: {,
            maxUsers: 10000,
            maxSessions: 1000,
            maxFileSize: 100 * 1024 * 1024, // 100MB
            maxRequests: 1000,
          },
          security: {,
            passwordPolicy: {,
              minLength: 8,
              requireUppercase: true,
              requireLowercase: true,
              requireNumbers: true,
              requireSymbols: false,
            },
            sessionTimeout: 8 * 60 * 60 * 1000, // 8 hours
            maxLoginAttempts: 5,
            twoFactorRequired: false,
          },
          notifications: {,
            emailEnabled: true,
            smsEnabled: false,
            pushEnabled: true,
            templates: {}
          }
        },
        maintenance: {,
          inProgress: false,
          scheduled: false,
          lastRun: 0,
          nextRun: 0,
        },
        backup: {,
          lastBackup: 0,
          nextBackup: 0,
          status: 'idle',
          size: 0,
        }
      },
      ui: {,
        activeTab: 'overview',
        modals: [],
        notifications: [],
        loading: {,
          global: false,
          sections: {}
        }
      },
      collaboration: {,
        activeAdmins: [],
        sharedSessions: [],
        conflicts: [],
      }
    };
  }
  validateState(state: AdminDashboardState): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: any[] = [];
    // Validate widgets
    state.layout.widgets.forEach((widget, index) => {
      if (!widget.id || !widget.type || !widget.title) {
        errors.push({)
          field: `layout.widgets[${index}]`,}
          message: 'Widget must have id, type, and title',
          value: widget,
          code: 'INVALID_WIDGET',
        });
      }
      if (!widget.position || widget.position.w <= 0 || widget.position.h <= 0) {
        errors.push({)
          field: `layout.widgets[${index}].position`,}
          message: 'Widget must have valid position and dimensions',
          value: widget.position,
          code: 'INVALID_WIDGET_POSITION',
        });
      }
    });
    // Validate users
    state.users.list.forEach((user, index) => {
      if (!user.id || !user.username || !user.email) {
        errors.push({)
          field: `users.list[${index}]`,}
          message: 'User must have id, username, and email',
          value: user,
          code: 'INVALID_USER',
        });
      }
      if (user.email && !this.isValidEmail(user.email)) {
        errors.push({)
          field: `users.list[${index}].email`,}
          message: 'Invalid email format',
          value: user.email,
          code: 'INVALID_EMAIL',
        });
      }
    });
    // Validate pagination
    if (state.users.pagination.page < 1) {
      errors.push({)
        field: 'users.pagination.page',
        message: 'Page number must be greater than 0',
        value: state.users.pagination.page,
        code: 'INVALID_PAGINATION',
      });
    }
    if (state.users.pagination.pageSize < 1 || state.users.pagination.pageSize > 100) {
      warnings.push({)
        field: 'users.pagination.pageSize',
        message: 'Page size should be between 1 and 100',
        suggestion: 'Adjust page size for better performance',
      });
    }
    // Validate security incidents
    state.security.activeIncidents.forEach((incident, index) => {
      if (!incident.id || !incident.type || !incident.severity) {
        errors.push({)
          field: `security.activeIncidents[${index}]`,}
          message: 'Security incident must have id, type, and severity',
          value: incident,
          code: 'INVALID_INCIDENT',
        });
      }
    });
    // Performance validations
    const widgetCount = state.layout.widgets.length;
    if (widgetCount > 20) {
      warnings.push({)
        field: 'layout.widgets',
        message: `Large number of widgets (${widgetCount})`,}
        suggestion: 'Consider reducing widgets for better performance',
      });
    }
    const alertCount = state.metrics.alerts.length;
    if (alertCount > 100) {
      warnings.push({)
        field: 'metrics.alerts',
        message: `Large number of alerts (${alertCount})`,}
        suggestion: 'Consider archiving old alerts',
      });
    }
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
  getDomainName(): string {
    return 'admin-dashboard';
  }
  // Admin-specific operations
  async applyOperation(operation: AdminOperation, userId?: string): Promise<void> {
    const change: StateChange<AdminDashboardState> = {
      id: this.generateChangeId(),
      timestamp: Date.now(),
      type: operation.type,
      payload: operation,
      userId,
      source: 'local',
    };
    this.setState(prevState => this.applyOperationToState(prevState, operation), change);
  }
  private applyOperationToState(state: AdminDashboardState, operation: AdminOperation): AdminDashboardState {
    const newState = { ...state };
    switch (operation.type) {
      case 'UPDATE_LAYOUT':
        newState.layout = { ...state.layout, ...operation.layout };
        break;
      case 'ADD_WIDGET':
        newState.layout = {
          ...state.layout,
          widgets: [...state.layout.widgets, operation.widget]
        };
        break;
      case 'UPDATE_WIDGET':
        newState.layout = {
          ...state.layout,
          widgets: state.layout.widgets.map(widget =>),
            widget.id === operation.widgetId
              ? { ...widget, ...operation.updates }
              : widget
        };
        break;
      case 'REMOVE_WIDGET':
        newState.layout = {
          ...state.layout,
          widgets: state.layout.widgets.filter(widget => widget.id !== operation.widgetId),
        };
        break;
      case 'CREATE_USER':
        const newUser: UserRecord = {
          ...operation.user,
          id: this.generateId(),
          createdAt: Date.now(),
        } as UserRecord;
        newState.users = {
          ...state.users,
          list: [...state.users.list, newUser],
          pagination: {,
            ...state.users.pagination,
            total: state.users.pagination.total + 1,
          }
        };
        break;
      case 'UPDATE_USER':
        newState.users = {
          ...state.users,
          list: state.users.list.map(user =>),
            user.id === operation.userId
              ? { ...user, ...operation.updates }
              : user
        };
        break;
      case 'DELETE_USER':
        newState.users = {
          ...state.users,
          list: state.users.list.filter(user => user.id !== operation.userId),
          selected: state.users.selected.filter(id => id !== operation.userId),
          pagination: {,
            ...state.users.pagination,
            total: Math.max(0, state.users.pagination.total - 1)
          }
        };
        break;
      case 'UPDATE_FILTERS':
        newState.users = {
          ...state.users,
          filters: { ...state.users.filters, ...operation.filters },
          pagination: { ...state.users.pagination, page: 1 } // Reset to first page
        };
        break;
      case 'SET_PAGINATION':
        newState.users = {
          ...state.users,
          pagination: { ...state.users.pagination, ...operation.pagination }
        };
        break;
      case 'UPDATE_METRICS':
        newState.metrics = {
          ...state.metrics,
          realTime: { ...state.metrics.realTime, ...operation.metrics, timestamp: Date.now() }
        };
        break;
      case 'ADD_ALERT':
        newState.metrics = {
          ...state.metrics,
          alerts: [operation.alert, ...state.metrics.alerts].slice(0, 100) // Keep latest 100 alerts
        };
        break;
      case 'ACKNOWLEDGE_ALERT':
        newState.metrics = {
          ...state.metrics,
          alerts: state.metrics.alerts.map(alert =>),
            alert.id === operation.alertId
              ? {
                  ...alert,
                  acknowledged: true,
                  acknowledgedBy: operation.userId,
                  acknowledgedAt: Date.now(),
                }
              : alert
        };
        break;
      case 'RESOLVE_ALERT':
        newState.metrics = {
          ...state.metrics,
          alerts: state.metrics.alerts.map(alert =>),
            alert.id === operation.alertId
              ? { ...alert, resolved: true, resolvedAt: Date.now() }
              : alert
        };
        break;
      case 'UPDATE_SECURITY_STATE':
        newState.security = { ...state.security, ...operation.updates };
        break;
      case 'CREATE_INCIDENT':
        const newIncident: SecurityIncident = {
          ...operation.incident,
          id: this.generateId(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        } as SecurityIncident;
        newState.security = {
          ...state.security,
          activeIncidents: [...state.security.activeIncidents, newIncident]
        };
        break;
      case 'UPDATE_INCIDENT':
        newState.security = {
          ...state.security,
          activeIncidents: state.security.activeIncidents.map(incident =>),
            incident.id === operation.incidentId
              ? { ...incident, ...operation.updates, updatedAt: Date.now() }
              : incident
        };
        break;
      case 'UPDATE_SYSTEM_SETTINGS':
        newState.configuration = {
          ...state.configuration,
          settings: { ...state.configuration.settings, ...operation.settings }
        };
        break;
      case 'SET_ACTIVE_TAB':
        newState.ui = { ...state.ui, activeTab: operation.tab };
        break;
      case 'SHOW_MODAL':
        newState.ui = {
          ...state.ui,
          modals: [...state.ui.modals, operation.modal]
        };
        break;
      case 'HIDE_MODAL':
        newState.ui = {
          ...state.ui,
          modals: state.ui.modals.filter(modal => modal.id !== operation.modalId),
        };
        break;
      case 'ADD_NOTIFICATION':
        newState.ui = {
          ...state.ui,
          notifications: [...state.ui.notifications, operation.notification]
        };
        break;
      case 'REMOVE_NOTIFICATION':
        newState.ui = {
          ...state.ui,
          notifications: state.ui.notifications.filter(),
            notification => notification.id !== operation.notificationId
        };
        break;
    }
    return newState;
  }
  // DomainStateContainer interface implementation
  async applyExternalChange(change: DomainStateChange): Promise<void> {
    if (change.operation === 'update' && change.path) {
      this.setState(prevState => {)
        const newState = { ...prevState };
        this.setNestedProperty(newState, change.path, change.value);
        return newState;
      });
    }
  }
  canAcceptChange(change: DomainStateChange): boolean {
    return change.domain === this.getDomainName();
  }
  async prepareForTransaction(transactionId: string): Promise<void> {
    this.emit('transactionPrepared', { transactionId, domain: this.getDomainName() });
  }
  async commitTransaction(transactionId: string): Promise<void> {
    this.emit('transactionCommitted', { transactionId, domain: this.getDomainName() });
  }
  async rollbackTransaction(transactionId: string): Promise<void> {
    this.emit('transactionRolledBack', { transactionId, domain: this.getDomainName() });
  }
  // Query methods
  getActiveAlerts(): AlertRecord[] {
    return this.state.metrics.alerts.filter(alert => !alert.resolved);
  }
  getCriticalAlerts(): AlertRecord[] {
    return this.getActiveAlerts().filter(alert => alert.severity === 'critical');
  }
  getSelectedUsers(): UserRecord[] {
    return this.state.users.selected
      .map(id => this.state.users.list.find(user => user.id === id))
      .filter(Boolean) as UserRecord[];
  }
  getFilteredUsers(): UserRecord[] {
    let filtered = this.state.users.list;
    const filters = this.state.users.filters;
    if (filters.role) {
      filtered = filtered.filter(user => user.role.name === filters.role);
    }
    if (filters.status) {
      filtered = filtered.filter(user => user.status === filters.status);
    }
    if (filters.department) {
      filtered = filtered.filter(user => user.profile.department === filters.department);
    }
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(user =>)
        user.username.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        `${user.profile.firstName} ${user.profile.lastName}`.toLowerCase().includes(term)}
      );
    }
    return filtered;
  }
  // Widget management
  async updateWidgetData(widgetId: string, data: any): Promise<void> {
    await this.applyOperation({)
      type: 'UPDATE_WIDGET',
      widgetId,
      updates: { data, lastUpdated: Date.now(), isLoading: false }
    });
  }
  // Setup methods
  private setupPolling(): void {
    // Poll for real-time metrics every 5 seconds
    this.metricsUpdateInterval = setInterval(() => {
      this.pollMetrics();
    }, 5000);
    // Poll for new alerts every 10 seconds
    this.alertPollingInterval = setInterval(() => {
      this.pollAlerts();
    }, 10000);
  }
  private async pollMetrics(): Promise<void> {
    // In a real implementation, this would fetch from an API
    const mockMetrics: Partial<RealTimeMetrics> = {
      activeUsers: Math.floor(Math.random() * 1000),
      systemLoad: Math.random() * 100,
      memoryUsage: Math.random() * 100,
      cpuUsage: Math.random() * 100,
      networkTraffic: Math.random() * 1000,
      errorRate: Math.random() * 10,
      responseTime: Math.random() * 500,
    };
    await this.applyOperation({ type: 'UPDATE_METRICS', metrics: mockMetrics });
  }
  private async pollAlerts(): Promise<void> {
    // In a real implementation, this would fetch new alerts from an API
    // This is just a mock implementation
  }
  private setupEventHandlers(): void {
    this.on('stateChanged', (event) => {
      this.emitDomainEvents(event);
    });
  }
  private emitDomainEvents(event: any): void {
    const changeType = event.change?.type;
    if (changeType?.includes('ALERT')) {
      this.emit('alertsChanged', {)
        domain: this.getDomainName(),
        activeAlerts: this.getActiveAlerts().length,
        criticalAlerts: this.getCriticalAlerts().length,
      });
    }
    if (changeType?.includes('USER')) {
      this.emit('usersChanged', {)
        domain: this.getDomainName(),
        totalUsers: this.state.users.list.length,
        selectedUsers: this.state.users.selected.length,
      });
    }
    if (changeType?.includes('WIDGET')) {
      this.emit('dashboardChanged', {)
        domain: this.getDomainName(),
        widgetCount: this.state.layout.widgets.length,
      });
    }
  }
  // Utility methods
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  private setNestedProperty(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!(keys[i] in current)) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
  }
  private generateId(): string {
    return `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}
  }
  private generateChangeId(): string {
    return `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}
  }
  // Cleanup
  destroy(): void {
    if (this.metricsUpdateInterval) {
      clearInterval(this.metricsUpdateInterval);
    }
    if (this.alertPollingInterval) {
      clearInterval(this.alertPollingInterval);
    }
    this.widgetUpdateIntervals.forEach(interval => clearInterval(interval));
    this.widgetUpdateIntervals.clear();
  }
}

// Additional supporting types
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
  notifications: {,
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
  actions?: Array<{ label: string; action: () => void }>;
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