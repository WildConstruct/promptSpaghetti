/**
 * Admin Dashboard State Container
 * REFACTOR-006: Advanced State Management & Data Flow Architecture
 *
 * Domain-specific state management for admin dashboard functionality
 */
import { BaseStateContainer } from '../../../state/containers/BaseStateContainer';
// Admin state container implementation
export class AdminStateContainer extends BaseStateContainer {
    widgetUpdateIntervals = new Map();
    metricsUpdateInterval;
    alertPollingInterval;
    constructor(initialState) {
        super({
            enableValidation: true,
            enableHistory: true,
            maxHistorySize: 150,
            enablePersistence: true,
            persistenceKey: 'admin-dashboard-state',
            enableDebug: true,
            enableDevTools: true,
            enableTimeTravel: true,
            enablePerformanceProfiling: true
        });
        if (initialState) {
            this.state = { ...this.getInitialState(), ...initialState };
        }
        this.setupPolling();
        this.setupEventHandlers();
    }
    // Abstract method implementations
    getInitialState() {
        return {
            layout: {
                widgets: [],
                gridConfig: {
                    cols: 12,
                    rowHeight: 60,
                    margin: [10, 10],
                    containerPadding: [20, 20],
                    breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
                    layouts: {}
                },
                theme: 'light',
                collapsed: false
            },
            users: {
                list: [],
                selected: [],
                filters: {},
                pagination: {
                    page: 1,
                    pageSize: 25,
                    total: 0,
                    hasNext: false,
                    hasPrev: false
                },
                bulkOperations: []
            },
            metrics: {
                realTime: {
                    activeUsers: 0,
                    systemLoad: 0,
                    memoryUsage: 0,
                    cpuUsage: 0,
                    networkTraffic: 0,
                    errorRate: 0,
                    responseTime: 0,
                    timestamp: Date.now()
                },
                historical: {
                    timeRange: '24h',
                    data: [],
                    aggregation: 'avg'
                },
                alerts: [],
                performance: {
                    uptime: 0,
                    throughput: 0,
                    latency: 0,
                    errorCount: 0
                }
            },
            security: {
                threatLevel: 'low',
                activeIncidents: [],
                auditLogs: [],
                accessControl: {
                    policies: [],
                    roles: [],
                    violations: []
                }
            },
            api: {
                endpoints: [],
                rateLimits: [],
                usage: {
                    requestsPerMinute: 0,
                    errorRate: 0,
                    avgResponseTime: 0,
                    bandwidthUsage: 0
                },
                errors: []
            },
            configuration: {
                features: [],
                settings: {
                    maintenance: { enabled: false },
                    features: {},
                    limits: {
                        maxUsers: 10000,
                        maxSessions: 1000,
                        maxFileSize: 100 * 1024 * 1024, // 100MB
                        maxRequests: 1000
                    },
                    security: {
                        passwordPolicy: {
                            minLength: 8,
                            requireUppercase: true,
                            requireLowercase: true,
                            requireNumbers: true,
                            requireSymbols: false
                        },
                        sessionTimeout: 8 * 60 * 60 * 1000, // 8 hours
                        maxLoginAttempts: 5,
                        twoFactorRequired: false
                    },
                    notifications: {
                        emailEnabled: true,
                        smsEnabled: false,
                        pushEnabled: true,
                        templates: {}
                    }
                },
                maintenance: {
                    inProgress: false,
                    scheduled: false,
                    lastRun: 0,
                    nextRun: 0
                },
                backup: {
                    lastBackup: 0,
                    nextBackup: 0,
                    status: 'idle',
                    size: 0
                }
            },
            ui: {
                activeTab: 'overview',
                modals: [],
                notifications: [],
                loading: {
                    global: false,
                    sections: {}
                }
            },
            collaboration: {
                activeAdmins: [],
                sharedSessions: [],
                conflicts: []
            }
        };
    }
    validateState(state) {
        const errors = [];
        const warnings = [];
        // Validate widgets
        state.layout.widgets.forEach((widget, index) => {
            if (!widget.id || !widget.type || !widget.title) {
                errors.push({
                    field: `layout.widgets[${index}]`,
                    message: 'Widget must have id, type, and title',
                    value: widget,
                    code: 'INVALID_WIDGET'
                });
            }
            if (!widget.position || widget.position.w <= 0 || widget.position.h <= 0) {
                errors.push({
                    field: `layout.widgets[${index}].position`,
                    message: 'Widget must have valid position and dimensions',
                    value: widget.position,
                    code: 'INVALID_WIDGET_POSITION'
                });
            }
        });
        // Validate users
        state.users.list.forEach((user, index) => {
            if (!user.id || !user.username || !user.email) {
                errors.push({
                    field: `users.list[${index}]`,
                    message: 'User must have id, username, and email',
                    value: user,
                    code: 'INVALID_USER'
                });
            }
            if (user.email && !this.isValidEmail(user.email)) {
                errors.push({
                    field: `users.list[${index}].email`,
                    message: 'Invalid email format',
                    value: user.email,
                    code: 'INVALID_EMAIL'
                });
            }
        });
        // Validate pagination
        if (state.users.pagination.page < 1) {
            errors.push({
                field: 'users.pagination.page',
                message: 'Page number must be greater than 0',
                value: state.users.pagination.page,
                code: 'INVALID_PAGINATION'
            });
        }
        if (state.users.pagination.pageSize < 1 || state.users.pagination.pageSize > 100) {
            warnings.push({
                field: 'users.pagination.pageSize',
                message: 'Page size should be between 1 and 100',
                suggestion: 'Adjust page size for better performance'
            });
        }
        // Validate security incidents
        state.security.activeIncidents.forEach((incident, index) => {
            if (!incident.id || !incident.type || !incident.severity) {
                errors.push({
                    field: `security.activeIncidents[${index}]`,
                    message: 'Security incident must have id, type, and severity',
                    value: incident,
                    code: 'INVALID_INCIDENT'
                });
            }
        });
        // Performance validations
        const widgetCount = state.layout.widgets.length;
        if (widgetCount > 20) {
            warnings.push({
                field: 'layout.widgets',
                message: `Large number of widgets (${widgetCount})`,
                suggestion: 'Consider reducing widgets for better performance'
            });
        }
        const alertCount = state.metrics.alerts.length;
        if (alertCount > 100) {
            warnings.push({
                field: 'metrics.alerts',
                message: `Large number of alerts (${alertCount})`,
                suggestion: 'Consider archiving old alerts'
            });
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
    getDomainName() {
        return 'admin-dashboard';
    }
    // Admin-specific operations
    async applyOperation(operation, userId) {
        const change = {
            id: this.generateChangeId(),
            timestamp: Date.now(),
            type: operation.type,
            payload: operation,
            userId,
            source: 'local'
        };
        this.setState(prevState => this.applyOperationToState(prevState, operation), change);
    }
    applyOperationToState(state, operation) {
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
                    widgets: state.layout.widgets.map(widget => widget.id === operation.widgetId
                        ? { ...widget, ...operation.updates }
                        : widget)
                };
                break;
            case 'REMOVE_WIDGET':
                newState.layout = {
                    ...state.layout,
                    widgets: state.layout.widgets.filter(widget => widget.id !== operation.widgetId)
                };
                break;
            case 'CREATE_USER':
                const newUser = {
                    ...operation.user,
                    id: this.generateId(),
                    createdAt: Date.now()
                };
                newState.users = {
                    ...state.users,
                    list: [...state.users.list, newUser],
                    pagination: {
                        ...state.users.pagination,
                        total: state.users.pagination.total + 1
                    }
                };
                break;
            case 'UPDATE_USER':
                newState.users = {
                    ...state.users,
                    list: state.users.list.map(user => user.id === operation.userId
                        ? { ...user, ...operation.updates }
                        : user)
                };
                break;
            case 'DELETE_USER':
                newState.users = {
                    ...state.users,
                    list: state.users.list.filter(user => user.id !== operation.userId),
                    selected: state.users.selected.filter(id => id !== operation.userId),
                    pagination: {
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
                    alerts: state.metrics.alerts.map(alert => alert.id === operation.alertId
                        ? {
                            ...alert,
                            acknowledged: true,
                            acknowledgedBy: operation.userId,
                            acknowledgedAt: Date.now()
                        }
                        : alert)
                };
                break;
            case 'RESOLVE_ALERT':
                newState.metrics = {
                    ...state.metrics,
                    alerts: state.metrics.alerts.map(alert => alert.id === operation.alertId
                        ? { ...alert, resolved: true, resolvedAt: Date.now() }
                        : alert)
                };
                break;
            case 'UPDATE_SECURITY_STATE':
                newState.security = { ...state.security, ...operation.updates };
                break;
            case 'CREATE_INCIDENT':
                const newIncident = {
                    ...operation.incident,
                    id: this.generateId(),
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                };
                newState.security = {
                    ...state.security,
                    activeIncidents: [...state.security.activeIncidents, newIncident]
                };
                break;
            case 'UPDATE_INCIDENT':
                newState.security = {
                    ...state.security,
                    activeIncidents: state.security.activeIncidents.map(incident => incident.id === operation.incidentId
                        ? { ...incident, ...operation.updates, updatedAt: Date.now() }
                        : incident)
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
                    modals: state.ui.modals.filter(modal => modal.id !== operation.modalId)
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
                    notifications: state.ui.notifications.filter(notification => notification.id !== operation.notificationId)
                };
                break;
        }
        return newState;
    }
    // DomainStateContainer interface implementation
    async applyExternalChange(change) {
        if (change.operation === 'update' && change.path) {
            this.setState(prevState => {
                const newState = { ...prevState };
                this.setNestedProperty(newState, change.path, change.value);
                return newState;
            });
        }
    }
    canAcceptChange(change) {
        return change.domain === this.getDomainName();
    }
    async prepareForTransaction(transactionId) {
        this.emit('transactionPrepared', { transactionId, domain: this.getDomainName() });
    }
    async commitTransaction(transactionId) {
        this.emit('transactionCommitted', { transactionId, domain: this.getDomainName() });
    }
    async rollbackTransaction(transactionId) {
        this.emit('transactionRolledBack', { transactionId, domain: this.getDomainName() });
    }
    // Query methods
    getActiveAlerts() {
        return this.state.metrics.alerts.filter(alert => !alert.resolved);
    }
    getCriticalAlerts() {
        return this.getActiveAlerts().filter(alert => alert.severity === 'critical');
    }
    getSelectedUsers() {
        return this.state.users.selected
            .map(id => this.state.users.list.find(user => user.id === id))
            .filter(Boolean);
    }
    getFilteredUsers() {
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
            filtered = filtered.filter(user => user.username.toLowerCase().includes(term) ||
                user.email.toLowerCase().includes(term) ||
                `${user.profile.firstName} ${user.profile.lastName}`.toLowerCase().includes(term));
        }
        return filtered;
    }
    // Widget management
    async updateWidgetData(widgetId, data) {
        await this.applyOperation({
            type: 'UPDATE_WIDGET',
            widgetId,
            updates: { data, lastUpdated: Date.now(), isLoading: false }
        });
    }
    // Setup methods
    setupPolling() {
        // Poll for real-time metrics every 5 seconds
        this.metricsUpdateInterval = setInterval(() => {
            this.pollMetrics();
        }, 5000);
        // Poll for new alerts every 10 seconds
        this.alertPollingInterval = setInterval(() => {
            this.pollAlerts();
        }, 10000);
    }
    async pollMetrics() {
        // In a real implementation, this would fetch from an API
        const mockMetrics = {
            activeUsers: Math.floor(Math.random() * 1000),
            systemLoad: Math.random() * 100,
            memoryUsage: Math.random() * 100,
            cpuUsage: Math.random() * 100,
            networkTraffic: Math.random() * 1000,
            errorRate: Math.random() * 10,
            responseTime: Math.random() * 500
        };
        await this.applyOperation({ type: 'UPDATE_METRICS', metrics: mockMetrics });
    }
    async pollAlerts() {
        // In a real implementation, this would fetch new alerts from an API
        // This is just a mock implementation
    }
    setupEventHandlers() {
        this.on('stateChanged', (event) => {
            this.emitDomainEvents(event);
        });
    }
    emitDomainEvents(event) {
        const changeType = event.change?.type;
        if (changeType?.includes('ALERT')) {
            this.emit('alertsChanged', {
                domain: this.getDomainName(),
                activeAlerts: this.getActiveAlerts().length,
                criticalAlerts: this.getCriticalAlerts().length
            });
        }
        if (changeType?.includes('USER')) {
            this.emit('usersChanged', {
                domain: this.getDomainName(),
                totalUsers: this.state.users.list.length,
                selectedUsers: this.state.users.selected.length
            });
        }
        if (changeType?.includes('WIDGET')) {
            this.emit('dashboardChanged', {
                domain: this.getDomainName(),
                widgetCount: this.state.layout.widgets.length
            });
        }
    }
    // Utility methods
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    setNestedProperty(obj, path, value) {
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
    generateId() {
        return `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    generateChangeId() {
        return `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    // Cleanup
    destroy() {
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
