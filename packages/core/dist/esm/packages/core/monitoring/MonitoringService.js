/**
 * Epic 1 Monitoring and Analytics Service
 * Provides comprehensive monitoring for system health and performance
 */
import { EventEmitter } from 'events';
/**
 * Core monitoring service for Epic 1
 */
export class MonitoringService extends EventEmitter {
    static instance;
    metrics = new Map();
    alerts = new Map();
    thresholds = new Map();
    healthChecks = new Map();
    static getInstance() {
        if (!this.instance) {
            this.instance = new MonitoringService();
        }
        return this.instance;
    }
    /**
     * Record a metric
     */
    recordMetric(name, value, tags) {
        const point = {
            name,
            value,
            timestamp: new Date(),
            tags,
        };
        if (!this.metrics.has(name)) {
            this.metrics.set(name, []);
        }
        const points = this.metrics.get(name);
        points.push(point);
        // Keep only last 1000 points
        if (points.length > 1000) {
            points.shift();
        }
        // Check thresholds
        this.checkThresholds(name, value);
        // Emit metric event
        this.emit('metric', point);
    }
    /**
     * Set alert thresholds for a metric
     */
    setThreshold(metric, warning, critical) {
        this.thresholds.set(metric, { warning, critical });
    }
    /**
     * Check if metric exceeds thresholds
     */
    checkThresholds(metric, value) {
        const threshold = this.thresholds.get(metric);
        if (!threshold)
            return;
        const alertId = `${metric}-threshold`;
        const existingAlert = this.alerts.get(alertId);
        if (value >= threshold.critical) {
            const alert = {
                id: alertId,
                level: 'critical',
                metric,
                condition: '>=',
                value,
                threshold: threshold.critical,
                timestamp: new Date(),
                resolved: false,
            };
            this.alerts.set(alertId, alert);
            this.emit('alert', alert);
        }
        else if (value >= threshold.warning) {
            const alert = {
                id: alertId,
                level: 'warning',
                metric,
                condition: '>=',
                value,
                threshold: threshold.warning,
                timestamp: new Date(),
                resolved: false,
            };
            this.alerts.set(alertId, alert);
            this.emit('alert', alert);
        }
        else if (existingAlert && !existingAlert.resolved) {
            // Resolve existing alert
            existingAlert.resolved = true;
            this.emit('alert-resolved', existingAlert);
        }
    }
    /**
     * Register a health check
     */
    registerHealthCheck(name, check) {
        this.healthChecks.set(name, check);
    }
    /**
     * Run all health checks
     */
    async checkHealth() {
        const checks = {};
        let overallStatus = 'healthy';
        for (const [name, check] of this.healthChecks) {
            const startTime = Date.now();
            try {
                const result = await check();
                const duration = Date.now() - startTime;
                checks[name] = {
                    status: result ? 'pass' : 'fail',
                    duration,
                };
                if (!result) {
                    overallStatus = overallStatus === 'healthy' ? 'degraded' : 'unhealthy';
                }
            }
            catch (error) {
                const duration = Date.now() - startTime;
                checks[name] = {
                    status: 'fail',
                    message: error.message,
                    duration,
                };
                overallStatus = 'unhealthy';
            }
        }
        const healthStatus = {
            status: overallStatus,
            checks,
            timestamp: new Date(),
        };
        this.emit('health-check', healthStatus);
        return healthStatus;
    }
    /**
     * Get current metrics
     */
    getMetrics(name) {
        if (name) {
            return { [name]: this.metrics.get(name) || [] };
        }
        const result = {};
        for (const [key, value] of this.metrics) {
            result[key] = value;
        }
        return result;
    }
    /**
     * Get active alerts
     */
    getActiveAlerts() {
        return Array.from(this.alerts.values()).filter(alert => !alert.resolved);
    }
    /**
     * Calculate metric statistics
     */
    getMetricStats(name, windowMinutes = 60) {
        const points = this.metrics.get(name);
        if (!points || points.length === 0)
            return null;
        const cutoff = new Date(Date.now() - windowMinutes * 60 * 1000);
        const recentPoints = points
            .filter(p => p.timestamp > cutoff)
            .map(p => p.value)
            .sort((a, b) => a - b);
        if (recentPoints.length === 0)
            return null;
        const sum = recentPoints.reduce((a, b) => a + b, 0);
        const avg = sum / recentPoints.length;
        const min = recentPoints[0];
        const max = recentPoints[recentPoints.length - 1];
        const percentile = (p) => {
            const index = Math.ceil(recentPoints.length * p) - 1;
            return recentPoints[Math.max(0, index)];
        };
        return {
            avg,
            min,
            max,
            p50: percentile(0.5),
            p95: percentile(0.95),
            p99: percentile(0.99),
        };
    }
}
/**
 * Performance tracking decorator
 */
export function trackPerformance(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    const monitoring = MonitoringService.getInstance();
    descriptor.value = async function (...args) {
        const startTime = performance.now();
        try {
            const result = await originalMethod.apply(this, args);
            const duration = performance.now() - startTime;
            monitoring.recordMetric(`method.${propertyKey}.duration`, duration, {
                class: target.constructor.name,
            });
            monitoring.recordMetric(`method.${propertyKey}.success`, 1, {
                class: target.constructor.name,
            });
            return result;
        }
        catch (error) {
            const duration = performance.now() - startTime;
            monitoring.recordMetric(`method.${propertyKey}.duration`, duration, {
                class: target.constructor.name,
                error: 'true',
            });
            monitoring.recordMetric(`method.${propertyKey}.error`, 1, {
                class: target.constructor.name,
                errorType: error.constructor.name,
            });
            throw error;
        }
    };
    return descriptor;
}
/**
 * User analytics tracking
 */
export class AnalyticsService {
    static instance;
    events = [];
    static getInstance() {
        if (!this.instance) {
            this.instance = new AnalyticsService();
        }
        return this.instance;
    }
    /**
     * Track a user event
     */
    track(name, properties = {}, userId, sessionId) {
        const event = {
            name,
            properties,
            timestamp: new Date(),
            userId,
            sessionId,
        };
        this.events.push(event);
        // Keep only last 10000 events in memory
        if (this.events.length > 10000) {
            this.events.shift();
        }
        // Also record as metric
        const monitoring = MonitoringService.getInstance();
        monitoring.recordMetric(`analytics.event.${name}`, 1, properties);
    }
    /**
     * Track funnel progression
     */
    trackFunnel(funnelName, step, userId, properties = {}) {
        this.track(`funnel.${funnelName}.${step}`, {
            ...properties,
            funnelName,
            step,
        }, userId);
    }
    /**
     * Get funnel conversion rates
     */
    getFunnelConversion(funnelName, steps, windowHours = 24) {
        const cutoff = new Date(Date.now() - windowHours * 60 * 60 * 1000);
        const funnelEvents = this.events.filter(e => e.name.startsWith(`funnel.${funnelName}.`) && e.timestamp > cutoff);
        const stepCounts = {};
        steps.forEach(step => stepCounts[step] = new Set());
        funnelEvents.forEach(event => {
            const step = event.properties.step;
            if (step && stepCounts[step] && event.userId) {
                stepCounts[step].add(event.userId);
            }
        });
        const conversions = {};
        const firstStepCount = stepCounts[steps[0]]?.size || 0;
        steps.forEach((step, index) => {
            const count = stepCounts[step].size;
            conversions[step] = firstStepCount > 0 ? count / firstStepCount : 0;
            if (index > 0) {
                const prevCount = stepCounts[steps[index - 1]].size;
                conversions[`${steps[index - 1]}_to_${step}`] =
                    prevCount > 0 ? count / prevCount : 0;
            }
        });
        return conversions;
    }
}
/**
 * Error tracking service
 */
export class ErrorTracker {
    static instance;
    errors = [];
    static getInstance() {
        if (!this.instance) {
            this.instance = new ErrorTracker();
        }
        return this.instance;
    }
    /**
     * Track an error
     */
    trackError(error, context = {}, userId) {
        this.errors.push({
            error,
            context,
            timestamp: new Date(),
            userId,
        });
        // Keep only last 1000 errors
        if (this.errors.length > 1000) {
            this.errors.shift();
        }
        // Record in monitoring
        const monitoring = MonitoringService.getInstance();
        monitoring.recordMetric('errors.total', 1, {
            type: error.constructor.name,
            ...context,
        });
    }
    /**
     * Get error statistics
     */
    getErrorStats(windowHours = 24) {
        const cutoff = new Date(Date.now() - windowHours * 60 * 60 * 1000);
        const recentErrors = this.errors.filter(e => e.timestamp > cutoff);
        const byType = {};
        const byUser = {};
        const messageCount = {};
        recentErrors.forEach(({ error, userId }) => {
            const type = error.constructor.name;
            byType[type] = (byType[type] || 0) + 1;
            if (userId) {
                byUser[userId] = (byUser[userId] || 0) + 1;
            }
            const message = error.message;
            messageCount[message] = (messageCount[message] || 0) + 1;
        });
        const topErrors = Object.entries(messageCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([message, count]) => ({ message, count }));
        return {
            total: recentErrors.length,
            byType,
            byUser,
            topErrors,
        };
    }
}
// Export singleton instances
export const monitoring = MonitoringService.getInstance();
export const analytics = AnalyticsService.getInstance();
export const errorTracker = ErrorTracker.getInstance();
