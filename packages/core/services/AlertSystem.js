/**
 * Enhanced Alert System - Epic 17
 *
 * Comprehensive alerting service that provides real-time notifications,
 * configurable alert rules, and integration with the existing UI components.
 *
 * Features:
 * - Real-time alert processing
 * - Configurable alert rules and thresholds
 * - Alert escalation and acknowledgment
 * - Integration with existing notification system
 * - Persistent alert history
 * - Alert filtering and prioritization
 */
/**
 * Enhanced Alert System Service
 */
export class AlertSystem {
    static instance: AlertSystem;
    alerts: Map<string, any> = new Map();
    rules: Map<string, any> = new Map();
    listeners: Map<string, any> = new Map();
    suppressionRules: Map<string, any> = new Map();
    escalationTimers: Map<string, any> = new Map();
    constructor() {
        this.initializeDefaultRules();
        this.startBackgroundProcessing();
    }
    static getInstance(): AlertSystem {
        if (!AlertSystem.instance) {
            AlertSystem.instance = new AlertSystem();
        }
        return AlertSystem.instance;
    }
    /**
     * Register an alert rule
     */
    registerRule(rule: any): void {
        this.validateRule(rule);
        this.rules.set(rule.id, {
            ...rule,
            updatedAt: new Date()
        });
        // Emit rule registered event
        this.emitSystemEvent('rule_registered', { ruleId: rule.id, ruleName: rule.name });
    }
    /**
     * Trigger an alert based on conditions
     */
    async triggerAlert(ruleId: string, context: any, overrides?: any): Promise<void> {
        const rule = this.rules.get(ruleId);
        if (!rule || !rule.enabled) {
            return null;
        }
        // Check if alert is suppressed by cooldown
        if (this.isAlertSuppressed(rule, context)) {
            return null;
        }
        // Evaluate conditions
        if (!this.evaluateConditions(rule.conditions, context)) {
            return null;
        }
        // Create or update alert
        const existingAlertId = this.findExistingAlert(rule, context);
        let alert;
        if (existingAlertId) {
            alert = this.updateExistingAlert(existingAlertId, context);
        }
        else {
            alert = this.createNewAlert(rule, context, overrides);
        }
        // Store alert
        this.alerts.set(alert.id, alert);
        // Execute immediate actions
        await this.executeActions(rule.actions, alert);
        // Set up escalation if configured
        if (rule.escalation?.enabled) {
            this.scheduleEscalation(alert, rule.escalation);
        }
        // Notify listeners
        this.notifyListeners(alert);
        // Set suppression period
        this.setSuppression(rule, context);
        return alert;
    }
    /**
     * Acknowledge an alert
     */
    acknowledgeAlert(alertId, acknowledgedBy, note) {
        const alert = this.alerts.get(alertId);
        if (!alert || alert.status !== 'active') {
            return false;
        }
        const updatedAlert = {
            ...alert,
            status: 'acknowledged',
            acknowledgedAt: new Date(),
            acknowledgedBy,
            metadata: {
                ...alert.metadata,
                acknowledgmentNote: note
            }
        };
        this.alerts.set(alertId, updatedAlert);
        this.cancelEscalation(alertId);
        this.notifyListeners(updatedAlert);
        this.emitSystemEvent('alert_acknowledged', {
            alertId,
            acknowledgedBy,
            severity: alert.severity
        });
        return true;
    }
    /**
     * Resolve an alert
     */
    resolveAlert(alertId, resolvedBy, resolution) {
        const alert = this.alerts.get(alertId);
        if (!alert || alert.status === 'resolved') {
            return false;
        }
        const updatedAlert = {
            ...alert,
            status: 'resolved',
            resolvedAt: new Date(),
            resolvedBy,
            metadata: {
                ...alert.metadata,
                resolution
            }
        };
        this.alerts.set(alertId, updatedAlert);
        this.cancelEscalation(alertId);
        this.notifyListeners(updatedAlert);
        this.emitSystemEvent('alert_resolved', {
            alertId,
            resolvedBy,
            severity: alert.severity,
            resolutionTime: this.calculateResolutionTime(alert)
        });
        return true;
    }
    /**
     * Suppress an alert temporarily
     */
    suppressAlert(alertId, suppressedBy, durationMinutes, reason) {
        const alert = this.alerts.get(alertId);
        if (!alert) {
            return false;
        }
        const suppressedUntil = new Date();
        suppressedUntil.setMinutes(suppressedUntil.getMinutes() + durationMinutes);
        const updatedAlert = {
            ...alert,
            status: 'suppressed',
            suppressedUntil,
            metadata: {
                ...alert.metadata,
                suppressedBy,
                suppressionReason: reason
            }
        };
        this.alerts.set(alertId, updatedAlert);
        this.cancelEscalation(alertId);
        this.notifyListeners(updatedAlert);
        // Schedule reactivation
        setTimeout(() => {
            this.reactivateAlert(alertId);
        }, durationMinutes * 60 * 1000);
        return true;
    }
    /**
     * Get alerts with optional filtering
     */
    getAlerts(filter) {
        let alerts = Array.from(this.alerts.values());
        if (!filter) {
            return alerts.sort((a, b) => b.triggeredAt.getTime() - a.triggeredAt.getTime());
        }
        // Apply filters
        if (filter.types?.length) {
            alerts = alerts.filter(alert => filter.types.includes(alert.type));
        }
        if (filter.categories?.length) {
            alerts = alerts.filter(alert => filter.categories.includes(alert.category));
        }
        if (filter.severities?.length) {
            alerts = alerts.filter(alert => filter.severities.includes(alert.severity));
        }
        if (filter.statuses?.length) {
            alerts = alerts.filter(alert => filter.statuses.includes(alert.status));
        }
        if (filter.sources?.length) {
            alerts = alerts.filter(alert => filter.sources.includes(alert.source));
        }
        if (filter.tags?.length) {
            alerts = alerts.filter(alert => filter.tags.some(tag => alert.tags.includes(tag)));
        }
        if (filter.dateRange) {
            alerts = alerts.filter(alert => alert.triggeredAt >= filter.dateRange.start &&
                alert.triggeredAt <= filter.dateRange.end);
        }
        if (filter.searchQuery) {
            const query = filter.searchQuery.toLowerCase();
            alerts = alerts.filter(alert => alert.title.toLowerCase().includes(query) ||
                alert.message.toLowerCase().includes(query) ||
                alert.description?.toLowerCase().includes(query) ||
                alert.source.toLowerCase().includes(query));
        }
        return alerts.sort((a, b) => b.triggeredAt.getTime() - a.triggeredAt.getTime());
    }
    /**
     * Get alert statistics
     */
    getAlertStats() {
        const alerts = Array.from(this.alerts.values());
        const now = new Date();
        // Calculate resolution times for resolved alerts
        const resolvedAlerts = alerts.filter(a => a.status === 'resolved' && a.resolvedAt);
        const resolutionTimes = resolvedAlerts.map(a => ((a.resolvedAt.getTime() - a.triggeredAt.getTime()) / (1000 * 60)) // minutes
        );
        const averageResolutionTime = resolutionTimes.length > 0
            ? resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length
            : 0;
        // Calculate escalation rate
        const escalatedAlerts = alerts.filter(a => a.escalatedAt);
        const escalationRate = alerts.length > 0 ? (escalatedAlerts.length / alerts.length) * 100 : 0;
        // Calculate acknowledgment rate
        const acknowledgedAlerts = alerts.filter(a => a.acknowledgedAt);
        const acknowledmentRate = alerts.length > 0 ? (acknowledgedAlerts.length / alerts.length) * 100 : 0;
        return {
            total: alerts.length,
            active: alerts.filter(a => a.status === 'active').length,
            acknowledged: alerts.filter(a => a.status === 'acknowledged').length,
            resolved: alerts.filter(a => a.status === 'resolved').length,
            suppressed: alerts.filter(a => a.status === 'suppressed').length,
            byType: this.groupByField(alerts, 'type'),
            bySeverity: this.groupByField(alerts, 'severity'),
            byCategory: this.groupByField(alerts, 'category'),
            averageResolutionTime,
            escalationRate,
            acknowledmentRate
        };
    }
    /**
     * Subscribe to alert events
     */
    subscribe(listenerId, callback) {
        this.listeners.set(listenerId, callback);
    }
    /**
     * Unsubscribe from alert events
     */
    unsubscribe(listenerId) {
        this.listeners.delete(listenerId);
    }
    // Private methods
    validateRule(rule) {
        if (!rule.id || !rule.name || !rule.type) {
            throw new Error('Alert rule must have id, name, and type');
        }
        if (!rule.conditions || rule.conditions.length === 0) {
            throw new Error('Alert rule must have at least one condition');
        }
        if (!rule.actions || rule.actions.length === 0) {
            throw new Error('Alert rule must have at least one action');
        }
    }
    isAlertSuppressed(rule, context) {
        if (!rule.cooldownPeriod)
            return false;
        const suppressionKey = this.generateSuppressionKey(rule, context);
        const suppressedUntil = this.suppressionRules.get(suppressionKey);
        if (suppressedUntil && suppressedUntil > new Date()) {
            return true;
        }
        return false;
    }
    evaluateConditions(conditions, context) {
        // For now, all conditions must be true (AND logic)
        // Could be enhanced to support OR logic and condition groups
        return conditions.every(condition => this.evaluateCondition(condition, context));
    }
    evaluateCondition(condition, context) {
        const fieldValue = this.getNestedValue(context, condition.field);
        if (fieldValue === undefined || fieldValue === null) {
            return false;
        }
        switch (condition.operator) {
            case 'eq': return fieldValue === condition.value;
            case 'ne': return fieldValue !== condition.value;
            case 'gt': return Number(fieldValue) > Number(condition.value);
            case 'gte': return Number(fieldValue) >= Number(condition.value);
            case 'lt': return Number(fieldValue) < Number(condition.value);
            case 'lte': return Number(fieldValue) <= Number(condition.value);
            case 'contains': return String(fieldValue).includes(String(condition.value));
            case 'regex':
                try {
                    return new RegExp(String(condition.value)).test(String(fieldValue));
                }
                catch {
                    return false;
                }
            default: return false;
        }
    }
    findExistingAlert(rule, context) {
        const alertKey = this.generateAlertKey(rule, context);
        for (const [alertId, alert] of this.alerts.entries()) {
            if (alert.ruleId === rule.id && alert.status === 'active') {
                // Check if this is the same logical alert
                const existingKey = this.generateAlertKey(rule, alert.metadata);
                if (existingKey === alertKey) {
                    return alertId;
                }
            }
        }
        return null;
    }
    updateExistingAlert(alertId, context) {
        const alert = this.alerts.get(alertId);
        return {
            ...alert,
            occurrenceCount: alert.occurrenceCount + 1,
            lastOccurrence: new Date(),
            metadata: {
                ...alert.metadata,
                ...context,
                occurrenceHistory: [
                    ...(alert.metadata.occurrenceHistory || []),
                    { timestamp: new Date(), context }
                ].slice(-10) // Keep last 10 occurrences
            }
        };
    }
    createNewAlert(rule, context, overrides) {
        const now = new Date();
        const alertId = this.generateAlertId();
        return {
            id: alertId,
            ruleId: rule.id,
            ruleName: rule.name,
            type: rule.type,
            category: rule.category,
            severity: rule.severity,
            title: this.generateAlertTitle(rule, context),
            message: this.generateAlertMessage(rule, context),
            description: this.generateAlertDescription(rule, context),
            source: context.source || 'system',
            sourceId: context.sourceId,
            metadata: { ...context },
            status: 'active',
            triggeredAt: now,
            occurrenceCount: 1,
            firstOccurrence: now,
            lastOccurrence: now,
            priority: this.mapSeverityToPriority(rule.severity),
            tags: rule.tags || [],
            ...overrides
        };
    }
    async executeActions(actions, alert) {
        for (const action of actions.filter(a => a.enabled)) {
            try {
                await this.executeAction(action, alert);
            }
            catch (error) {
                console.error(`Failed to execute alert action ${action.id}:`, error);
                // Could implement action retry logic here
            }
        }
    }
    async executeAction(action, alert) {
        switch (action.type) {
            case 'notification':
                await this.sendNotification(alert, action.configuration);
                break;
            case 'email':
                await this.sendEmail(alert, action.configuration);
                break;
            case 'webhook':
                await this.callWebhook(alert, action.configuration);
                break;
            case 'script':
                await this.executeScript(alert, action.configuration);
                break;
            case 'create_task':
                await this.createTask(alert, action.configuration);
                break;
            default:
                console.warn(`Unknown action type: ${action.type}`);
        }
    }
    scheduleEscalation(alert, escalation) {
        escalation.stages.forEach((stage, index) => {
            const timer = setTimeout(async () => {
                const currentAlert = this.alerts.get(alert.id);
                if (!currentAlert || currentAlert.status !== 'active') {
                    return;
                }
                // Check escalation condition
                if (this.shouldEscalate(currentAlert, stage)) {
                    const escalatedAlert = {
                        ...currentAlert,
                        severity: stage.severity,
                        escalatedAt: new Date(),
                        metadata: {
                            ...currentAlert.metadata,
                            escalationStage: index + 1,
                            escalationReason: `Escalated to ${stage.severity} after ${stage.delayMinutes} minutes`
                        }
                    };
                    this.alerts.set(alert.id, escalatedAlert);
                    await this.executeActions(stage.actions, escalatedAlert);
                    this.notifyListeners(escalatedAlert);
                }
            }, stage.delayMinutes * 60 * 1000);
            this.escalationTimers.set(`${alert.id}_${index}`, timer);
        });
    }
    shouldEscalate(alert, stage) {
        switch (stage.condition) {
            case 'unacknowledged':
                return !alert.acknowledgedAt;
            case 'unresolved':
                return alert.status !== 'resolved';
            case 'recurring':
                return alert.occurrenceCount > 1;
            default:
                return true;
        }
    }
    cancelEscalation(alertId) {
        const timersToCancel = Array.from(this.escalationTimers.keys())
            .filter(key => key.startsWith(`${alertId}_`));
        timersToCancel.forEach(key => {
            const timer = this.escalationTimers.get(key);
            if (timer) {
                clearTimeout(timer);
                this.escalationTimers.delete(key);
            }
        });
    }
    reactivateAlert(alertId) {
        const alert = this.alerts.get(alertId);
        if (alert && alert.status === 'suppressed') {
            const reactivatedAlert = {
                ...alert,
                status: 'active',
                suppressedUntil: undefined
            };
            this.alerts.set(alertId, reactivatedAlert);
            this.notifyListeners(reactivatedAlert);
        }
    }
    notifyListeners(alert) {
        this.listeners.forEach(callback => {
            try {
                callback(alert);
            }
            catch (error) {
                console.error('Error in alert listener:', error);
            }
        });
    }
    setSuppression(rule, context) {
        if (!rule.cooldownPeriod)
            return;
        const suppressionKey = this.generateSuppressionKey(rule, context);
        const suppressedUntil = new Date();
        suppressedUntil.setMinutes(suppressedUntil.getMinutes() + rule.cooldownPeriod);
        this.suppressionRules.set(suppressionKey, suppressedUntil);
    }
    emitSystemEvent(eventType, data) {
        // Integration point with activity tracking system
        // This would emit events that get picked up by the activity timeline
        const event = {
            type: eventType,
            timestamp: new Date(),
            source: 'alert_system',
            data
        };
        // Could emit to event bus or activity system here
        console.debug('Alert system event:', event);
    }
    // Utility methods
    generateAlertId() {
        return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    generateSuppressionKey(rule, context) {
        const contextKey = rule.type === 'system' ? 'global' : context.sourceId || context.source || 'unknown';
        return `${rule.id}_${contextKey}`;
    }
    generateAlertKey(rule, context) {
        return this.generateSuppressionKey(rule, context);
    }
    generateAlertTitle(rule, context) {
        // Could implement template-based title generation
        const source = context.source ? ` in ${context.source}` : '';
        return `${rule.name}${source}`;
    }
    generateAlertMessage(rule, context) {
        // Could implement template-based message generation
        return rule.description || `Alert triggered for rule: ${rule.name}`;
    }
    generateAlertDescription(rule, context) {
        const contextDetails = Object.entries(context)
            .filter(([key, value]) => key !== 'source' && value !== undefined)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
        return contextDetails ? `Context: ${contextDetails}` : undefined;
    }
    mapSeverityToPriority(severity) {
        switch (severity) {
            case 'critical': return 'urgent';
            case 'high': return 'high';
            case 'medium': return 'normal';
            case 'low': return 'low';
            case 'info': return 'low';
            default: return 'normal';
        }
    }
    calculateResolutionTime(alert) {
        if (!alert.resolvedAt)
            return 0;
        return (alert.resolvedAt.getTime() - alert.triggeredAt.getTime()) / (1000 * 60); // minutes
    }
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }
    groupByField(items, field) {
        const grouped = {};
        items.forEach(item => {
            const key = String(item[field]);
            grouped[key] = (grouped[key] || 0) + 1;
        });
        return grouped;
    }
    initializeDefaultRules() {
        // Add some default alert rules
        const defaultRules = [
            {
                id: 'execution_timeout',
                name: 'Graph Execution Timeout',
                description: 'Alert when graph execution takes longer than expected',
                type: 'performance',
                category: 'execution',
                severity: 'medium',
                enabled: true,
                conditions: [
                    {
                        id: 'timeout_condition',
                        field: 'execution_time',
                        operator: 'gt',
                        value: 10000 // 10 seconds
                    }
                ],
                actions: [
                    {
                        id: 'notify_timeout',
                        type: 'notification',
                        enabled: true,
                        configuration: {
                            type: 'warning',
                            title: 'Execution Timeout',
                            autoHide: false
                        }
                    }
                ],
                cooldownPeriod: 5,
                tags: ['performance', 'execution'],
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: 'system'
            },
            {
                id: 'high_error_rate',
                name: 'High Error Rate',
                description: 'Alert when error rate exceeds threshold',
                type: 'error',
                category: 'system',
                severity: 'high',
                enabled: true,
                conditions: [
                    {
                        id: 'error_rate_condition',
                        field: 'error_rate',
                        operator: 'gt',
                        value: 0.1 // 10% error rate
                    }
                ],
                actions: [
                    {
                        id: 'notify_errors',
                        type: 'notification',
                        enabled: true,
                        configuration: {
                            type: 'error',
                            title: 'High Error Rate Detected',
                            autoHide: false
                        }
                    }
                ],
                escalation: {
                    enabled: true,
                    stages: [
                        {
                            id: 'escalate_to_critical',
                            delayMinutes: 15,
                            severity: 'critical',
                            condition: 'unacknowledged',
                            actions: [
                                {
                                    id: 'critical_notification',
                                    type: 'notification',
                                    enabled: true,
                                    configuration: {
                                        type: 'error',
                                        title: 'CRITICAL: High Error Rate Unresolved',
                                        autoHide: false
                                    }
                                }
                            ]
                        }
                    ]
                },
                cooldownPeriod: 10,
                tags: ['error', 'system'],
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: 'system'
            }
        ];
        defaultRules.forEach(rule => {
            this.rules.set(rule.id, rule);
        });
    }
    startBackgroundProcessing() {
        // Clean up expired alerts every 5 minutes
        setInterval(() => {
            this.cleanupExpiredAlerts();
        }, 5 * 60 * 1000);
        // Clean up old suppression rules every hour
        setInterval(() => {
            this.cleanupSuppressionRules();
        }, 60 * 60 * 1000);
    }
    cleanupExpiredAlerts() {
        const now = new Date();
        const expiredAlerts = [];
        this.alerts.forEach((alert, alertId) => {
            if (alert.expiresAt && alert.expiresAt < now) {
                expiredAlerts.push(alertId);
            }
        });
        expiredAlerts.forEach(alertId => {
            const alert = this.alerts.get(alertId);
            if (alert) {
                const expiredAlert = { ...alert, status: 'expired' };
                this.alerts.set(alertId, expiredAlert);
                this.notifyListeners(expiredAlert);
            }
        });
    }
    cleanupSuppressionRules() {
        const now = new Date();
        const expiredKeys = [];
        this.suppressionRules.forEach((expiryDate, key) => {
            if (expiryDate < now) {
                expiredKeys.push(key);
            }
        });
        expiredKeys.forEach(key => {
            this.suppressionRules.delete(key);
        });
    }
    // Action implementations
    async sendNotification(alert, config) {
        // Integration with existing notification system
        const notification = {
            type: config.type || 'info',
            title: config.title || alert.title,
            message: alert.message,
            autoHide: config.autoHide !== false,
            duration: config.duration || 5000,
            metadata: {
                alertId: alert.id,
                severity: alert.severity,
                source: 'alert_system'
            }
        };
        // This would integrate with the existing NotificationSystem
        console.debug('Sending notification:', notification);
    }
    async sendEmail(alert, config) {
        // Email sending implementation
        console.debug('Sending email alert:', { alert: alert.id, config });
    }
    async callWebhook(alert, config) {
        // Webhook calling implementation
        if (!config.url)
            return;
        try {
            const response = await fetch(config.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(config.headers || {})
                },
                body: JSON.stringify({
                    alert,
                    timestamp: new Date().toISOString()
                })
            });
            if (!response.ok) {
                throw new Error(`Webhook failed: ${response.status}`);
            }
        }
        catch (error) {
            console.error('Webhook error:', error);
            throw error;
        }
    }
    async executeScript(alert, config) {
        // Script execution implementation (would need proper sandboxing)
        console.debug('Executing script for alert:', { alert: alert.id, config });
    }
    async createTask(alert, config) {
        // Task creation implementation
        console.debug('Creating task for alert:', { alert: alert.id, config });
    }
}
// Export singleton instance
export const alertSystem = AlertSystem.getInstance();
// Convenience functions
export const triggerAlert = (ruleId, context, overrides) => alertSystem.triggerAlert(ruleId, context, overrides);
export const acknowledgeAlert = (alertId, acknowledgedBy, note) => alertSystem.acknowledgeAlert(alertId, acknowledgedBy, note);
export const resolveAlert = (alertId, resolvedBy, resolution) => alertSystem.resolveAlert(alertId, resolvedBy, resolution);
export const getAlerts = (filter) => alertSystem.getAlerts(filter);
export const getAlertStats = () => alertSystem.getAlertStats();
export const subscribeToAlerts = (listenerId, callback) => alertSystem.subscribe(listenerId, callback);
