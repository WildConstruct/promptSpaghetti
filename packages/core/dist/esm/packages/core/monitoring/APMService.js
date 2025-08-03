/**
 * Application Performance Monitoring (APM) Service
 * Enhanced monitoring capabilities for Epic 1
 */
import { monitoring } from './MonitoringService';
import { EventEmitter } from 'events';
/**
 * Enhanced APM service for comprehensive monitoring
 */
export class APMService extends EventEmitter {
    static instance;
    config;
    performanceBaselines = new Map();
    uptimeChecks = new Map();
    workflowMetrics = new Map();
    transactions = new Map();
    uptimeInterval;
    baselineInterval;
    sessionId;
    userId;
    static getInstance() {
        if (!this.instance) {
            this.instance = new APMService();
        }
        return this.instance;
    }
    constructor() {
        super();
        this.sessionId = this.generateSessionId();
        this.config = {
            serviceName: 'prompt-spaghetti',
            environment: process.env.NODE_ENV || 'development',
            sampleRate: 1.0,
            enableTracing: true,
            enableProfiling: true,
        };
        this.initializePerformanceBaselines();
        this.setupGlobalErrorHandling();
    }
    /**
     * Initialize performance baselines
     */
    initializePerformanceBaselines() {
        // Page load time baseline
        this.addPerformanceBaseline({
            metric: 'page.load.time',
            targetValue: 2000,
            acceptableDeviation: 500,
            measurementPeriod: 300,
            unit: 'ms',
        });
        // Graph execution baseline
        this.addPerformanceBaseline({
            metric: 'graph.execution.time',
            targetValue: 1000,
            acceptableDeviation: 200,
            measurementPeriod: 300,
            unit: 'ms',
        });
        // API response time baseline
        this.addPerformanceBaseline({
            metric: 'api.response.time',
            targetValue: 200,
            acceptableDeviation: 50,
            measurementPeriod: 300,
            unit: 'ms',
        });
        // Error rate baseline
        this.addPerformanceBaseline({
            metric: 'error.rate',
            targetValue: 0.1,
            acceptableDeviation: 0.05,
            measurementPeriod: 600,
            unit: 'percentage',
        });
        // Memory usage baseline
        this.addPerformanceBaseline({
            metric: 'memory.usage',
            targetValue: 512 * 1024 * 1024, // 512MB
            acceptableDeviation: 128 * 1024 * 1024, // 128MB
            measurementPeriod: 300,
            unit: 'bytes',
        });
        // Start baseline monitoring
        this.startBaselineMonitoring();
    }
    /**
     * Setup global error handling
     */
    setupGlobalErrorHandling() {
        if (typeof window !== 'undefined') {
            // Browser environment
            window.addEventListener('error', (event) => {
                this.trackError(new Error(event.message), {
                    filename: event.filename,
                    lineno: event.lineno,
                    colno: event.colno,
                    type: 'window.error',
                });
            });
            window.addEventListener('unhandledrejection', (event) => {
                this.trackError(new Error(String(event.reason)), {
                    type: 'unhandledRejection',
                    promise: event.promise,
                });
            });
        }
        else if (typeof process !== 'undefined') {
            // Node.js environment
            process.on('uncaughtException', (error) => {
                this.trackError(error, { type: 'uncaughtException' });
            });
            process.on('unhandledRejection', (reason, promise) => {
                this.trackError(new Error(String(reason)), {
                    type: 'unhandledRejection',
                    promise,
                });
            });
        }
    }
    /**
     * Generate session ID
     */
    generateSessionId() {
        return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Set user context
     */
    setUserContext(userId) {
        this.userId = userId;
    }
    /**
     * Create new session
     */
    createNewSession() {
        this.sessionId = this.generateSessionId();
    }
    /**
     * Start a transaction
     */
    startTransaction(name, type = 'custom') {
        const transaction = {
            id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name,
            type,
            startTime: performance.now(),
            spans: [],
            tags: {
                sessionId: this.sessionId,
                userId: this.userId || 'anonymous',
            },
        };
        this.transactions.set(transaction.id, transaction);
        return transaction;
    }
    /**
     * End a transaction
     */
    endTransaction(transactionId, status = 'success', error) {
        const transaction = this.transactions.get(transactionId);
        if (!transaction)
            return;
        transaction.endTime = performance.now();
        transaction.duration = transaction.endTime - transaction.startTime;
        transaction.status = status;
        transaction.error = error;
        // Record metrics
        monitoring.recordMetric(`transaction.${transaction.type}.duration`, transaction.duration, {
            name: transaction.name,
            status,
        });
        if (status === 'error') {
            monitoring.recordMetric(`transaction.${transaction.type}.error`, 1, {
                name: transaction.name,
            });
        }
        // Send to APM if configured
        if (this.config.apiKey) {
            this.sendTransactionToAPM(transaction);
        }
        // Clean up
        this.transactions.delete(transactionId);
    }
    /**
     * Add span to transaction
     */
    addSpan(transactionId, spanName) {
        const transaction = this.transactions.get(transactionId);
        if (!transaction) {
            throw new Error(`Transaction ${transactionId} not found`);
        }
        const span = {
            id: `span-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: spanName,
            startTime: performance.now(),
            tags: {},
        };
        transaction.spans.push(span);
        return span;
    }
    /**
     * End a span
     */
    endSpan(transactionId, spanId) {
        const transaction = this.transactions.get(transactionId);
        if (!transaction)
            return;
        const span = transaction.spans.find(s => s.id === spanId);
        if (!span)
            return;
        span.endTime = performance.now();
        span.duration = span.endTime - span.startTime;
    }
    /**
     * Track workflow metric
     */
    trackWorkflow(workflow) {
        const key = workflow.workflowId;
        if (!this.workflowMetrics.has(key)) {
            this.workflowMetrics.set(key, []);
        }
        workflow.sessionId = this.sessionId;
        workflow.userId = this.userId;
        this.workflowMetrics.get(key).push(workflow);
        // Record individual metrics
        monitoring.recordMetric(`workflow.${workflow.workflowName}.duration`, workflow.totalDuration, {
            success: workflow.success.toString(),
        });
        if (!workflow.success) {
            monitoring.recordMetric('workflow.failure', 1, {
                workflow: workflow.workflowName,
            });
        }
        // Calculate failure rate
        const recentWorkflows = this.workflowMetrics.get(key).slice(-100);
        const failureRate = (recentWorkflows.filter(w => !w.success).length / recentWorkflows.length) * 100;
        monitoring.recordMetric('workflow.failure.rate', failureRate, {
            workflow: workflow.workflowName,
        });
    }
    /**
     * Track error with context
     */
    trackError(error, context) {
        const errorEvent = {
            message: error.message,
            stack: error.stack,
            context,
            timestamp: new Date(),
            sessionId: this.sessionId,
            userId: this.userId,
        };
        // Record as metric
        monitoring.recordMetric('errors.total', 1, {
            type: error.name,
            ...(context || {}),
        });
        // Calculate error rate
        const recentRequests = monitoring.getMetricStats('requests.total', 5);
        const recentErrors = monitoring.getMetricStats('errors.total', 5);
        if (recentRequests && recentErrors) {
            const errorRate = (recentErrors.avg / recentRequests.avg) * 100;
            monitoring.recordMetric('error.rate', errorRate);
        }
        // Create alert for critical errors
        if (context?.severity === 'critical') {
            monitoring.recordMetric('alerts.critical', 1, {
                error: error.name,
            });
        }
        this.emit('error', errorEvent);
    }
    /**
     * Add performance baseline
     */
    addPerformanceBaseline(baseline) {
        this.performanceBaselines.set(baseline.metric, baseline);
    }
    /**
     * Start baseline monitoring
     */
    startBaselineMonitoring() {
        this.baselineInterval = setInterval(() => {
            this.performanceBaselines.forEach((baseline, metric) => {
                const stats = monitoring.getMetricStats(metric, baseline.measurementPeriod / 60);
                if (stats) {
                    this.checkBaseline(metric, stats.avg, baseline);
                }
            });
        }, 60000); // Check every minute
    }
    /**
     * Check performance baseline
     */
    checkBaseline(metric, value, baseline) {
        const deviation = Math.abs(value - baseline.targetValue);
        const deviationPercentage = (deviation / baseline.targetValue) * 100;
        if (deviation > baseline.acceptableDeviation) {
            monitoring.recordMetric(`baseline.deviation.${metric}`, deviationPercentage, {
                target: baseline.targetValue.toString(),
                actual: value.toString(),
            });
            // Set threshold for alerting
            if (deviationPercentage > 50) {
                monitoring.setThreshold(`baseline.${metric}.critical`, baseline.targetValue + baseline.acceptableDeviation, baseline.targetValue + (baseline.acceptableDeviation * 2));
            }
        }
    }
    /**
     * Add uptime check
     */
    addUptimeCheck(check) {
        check.consecutiveFailures = 0;
        this.uptimeChecks.set(check.id, check);
        // Start monitoring if not already running
        if (!this.uptimeInterval) {
            this.startUptimeMonitoring();
        }
    }
    /**
     * Start uptime monitoring
     */
    startUptimeMonitoring() {
        // Perform initial checks
        this.uptimeChecks.forEach(check => {
            this.performUptimeCheck(check);
        });
        // Schedule regular checks
        this.uptimeInterval = setInterval(() => {
            this.uptimeChecks.forEach(check => {
                // Check based on individual interval
                const lastCheck = check.lastCheck?.getTime() || 0;
                const now = Date.now();
                if (now - lastCheck >= check.interval * 1000) {
                    this.performUptimeCheck(check);
                }
            });
        }, 10000); // Check every 10 seconds
    }
    /**
     * Perform uptime check
     */
    async performUptimeCheck(check) {
        const startTime = Date.now();
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), check.timeout * 1000);
            const response = await fetch(check.url, {
                method: check.method,
                headers: check.headers,
                signal: controller.signal,
            });
            clearTimeout(timeout);
            const responseTime = Date.now() - startTime;
            const isUp = check.expectedStatus.includes(response.status);
            check.lastCheck = new Date();
            check.responseTime = responseTime;
            check.status = isUp ? 'up' : 'down';
            // Record metrics
            monitoring.recordMetric(`uptime.${check.id}.response_time`, responseTime);
            monitoring.recordMetric(`uptime.${check.id}.status`, isUp ? 1 : 0);
            if (!isUp) {
                check.consecutiveFailures = (check.consecutiveFailures || 0) + 1;
                monitoring.recordMetric('uptime.failure', 1, {
                    check: check.id,
                    status: response.status.toString(),
                    consecutive: check.consecutiveFailures.toString(),
                });
            }
            else {
                check.consecutiveFailures = 0;
            }
            this.emit('uptime-check', { check, isUp, responseTime });
        }
        catch (error) {
            check.lastCheck = new Date();
            check.status = 'down';
            check.consecutiveFailures = (check.consecutiveFailures || 0) + 1;
            monitoring.recordMetric('uptime.failure', 1, {
                check: check.id,
                error: error.message,
                consecutive: check.consecutiveFailures.toString(),
            });
            this.emit('uptime-check', { check, isUp: false, error });
        }
    }
    /**
     * Get performance report
     */
    getPerformanceReport() {
        const baselines = Array.from(this.performanceBaselines.entries()).map(([metric, baseline]) => {
            const stats = monitoring.getMetricStats(metric, baseline.measurementPeriod / 60);
            const current = stats?.avg || 0;
            const deviation = ((current - baseline.targetValue) / baseline.targetValue) * 100;
            let status = 'good';
            if (Math.abs(deviation) > 50)
                status = 'critical';
            else if (Math.abs(deviation) > 20)
                status = 'warning';
            return {
                metric,
                status,
                target: baseline.targetValue,
                current,
                deviation,
                unit: baseline.unit,
            };
        });
        const recommendations = [];
        // Generate recommendations based on current performance
        baselines.forEach(baseline => {
            if (baseline.status === 'critical') {
                if (baseline.metric === 'page.load.time') {
                    recommendations.push('Page load time is critically high. Consider optimizing bundle size and implementing code splitting.');
                }
                else if (baseline.metric === 'api.response.time') {
                    recommendations.push('API response time is too high. Check database queries and consider implementing caching.');
                }
                else if (baseline.metric === 'error.rate') {
                    recommendations.push('Error rate is above acceptable threshold. Review recent deployments and check error logs.');
                }
                else if (baseline.metric === 'memory.usage') {
                    recommendations.push('Memory usage is critically high. Check for memory leaks and optimize data structures.');
                }
            }
            else if (baseline.status === 'warning') {
                if (baseline.metric === 'graph.execution.time') {
                    recommendations.push('Graph execution time is elevated. Consider optimizing node processing and caching results.');
                }
            }
        });
        // Add uptime recommendations
        const downChecks = Array.from(this.uptimeChecks.values()).filter(c => c.status === 'down');
        if (downChecks.length > 0) {
            recommendations.push(`${downChecks.length} uptime check(s) are failing. Check service availability and network connectivity.`);
        }
        return { baselines, recommendations };
    }
    /**
     * Get uptime status
     */
    getUptimeStatus() {
        return Array.from(this.uptimeChecks.values()).map(check => {
            // Calculate uptime percentage (simplified - in production would use historical data)
            const uptime = check.status === 'up' ? 100 - (check.consecutiveFailures || 0) * 5 : 0;
            return {
                id: check.id,
                name: check.name,
                status: check.status || 'unknown',
                responseTime: check.responseTime,
                lastCheck: check.lastCheck,
                uptime: Math.max(0, Math.min(100, uptime)),
            };
        });
    }
    /**
     * Send transaction to APM service
     */
    sendTransactionToAPM(transaction) {
        // In production, this would send to actual APM service
        if (this.config.environment === 'development') {
            console.debug('[APM Transaction]', {
                name: transaction.name,
                duration: transaction.duration,
                status: transaction.status,
                spans: transaction.spans.length,
            });
        }
    }
    /**
     * Stop monitoring
     */
    stop() {
        if (this.uptimeInterval) {
            clearInterval(this.uptimeInterval);
            this.uptimeInterval = undefined;
        }
        if (this.baselineInterval) {
            clearInterval(this.baselineInterval);
            this.baselineInterval = undefined;
        }
    }
}
// Export singleton instance
export const apm = APMService.getInstance();
