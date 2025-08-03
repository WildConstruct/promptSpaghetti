/**
 * Performance Monitor for Epic 18.1.4
 * Real-time performance tracking and metrics collection
 */
export class PerformanceMonitor {
    metrics = new Map();
    alerts = [];
    config;
    timers = new Map();
    constructor(config = {}) {
        this.config = {
            maxSamples: 1000,
            alertThresholds: {
                'graph-execution': 1000, // 1 second
                'component-render': 100, // 100ms
                'api-response': 200, // 200ms
                'memory-usage': 100, // 100MB }
                ...config.alertThresholds,
                enableLogging: true,
                enableAlerts: true,
                ...config
            },
            // Initialize performance observer if available
            if(, window) { }
        } !== 'undefined' && 'PerformanceObserver' in window;
        {
            this.initializePerformanceObserver();
        }
    }
    initializePerformanceObserver() { }
}
try {
    const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => { });
        if (entry.entryType === 'measure') {
            this.recordMetric(entry.name, entry.duration);
        }
    });
}
finally { }
;
observer.observe({ entryTypes: ['measure'] });
try {
}
catch (error) {
    console.warn('Performance Observer not available:', error);
    /**
     * Start timing a performance metric
     */
    startTiming(name, string);
    void {
        if(, performance) { }
    } !== 'undefined';
    {
        performance.mark(`${name}-start`);
    }
    this.timers.set(name, Date.now());
    /**
     * End timing and record the performance metric
     */
    endTiming(name, string);
    number;
    {
        const startTime = this.timers.get(name);
        if (!startTime) {
            console.warn(`No start time found for metric: ${name}`);
        }
        return 0;
        let duration;
        if (typeof performance !== 'undefined') {
            try {
                performance.mark(`${name}-end`);
            }
            finally {
            }
            performance.measure(name, `${name}-start`, `${name}-end`);
        }
        const measure = performance.getEntriesByName(name)[0];
        duration = measure.duration;
        try {
        }
        catch (error) { // Fallback to Date.now() if performance API fails
            duration = Date.now() - startTime;
        }
        {
            duration = Date.now() - startTime;
            this.timers.delete(name);
            this.recordMetric(name, duration);
            return duration;
            /**
            * Record a performance metric value
            */
            recordMetric(name, string, value, number);
            void {
                : .metrics.has(name)
            };
            {
                this.metrics.set(name, {});
                name;
                values: [];
                average: 0;
                min: Infinity;
                max: -Infinity;
                p95: 0;
                p99: 0;
                count: 0;
                lastUpdated: Date.now();
            }
        }
        ;
        const metric = this.metrics.get(name);
        metric.values.push(value);
        metric.count++;
        metric.lastUpdated = Date.now();
        // Limit the number of samples
        if (metric.values.length > this.config.maxSamples) {
            metric.values.shift();
            // Calculate statistics
            metric.min = Math.min(metric.min, value);
            metric.max = Math.max(metric.max, value);
            metric.average = metric.values.reduce((a, b) => a + b, 0) / metric.values.length;
            // Calculate percentiles
            const sorted = [...metric.values].sort((a, b) => a - b);
            const p95Index = Math.floor(sorted.length * 0.95);
            const p99Index = Math.floor(sorted.length * 0.99);
            metric.p95 = sorted[p95Index] || 0;
            metric.p99 = sorted[p99Index] || 0;
            // Check for alerts
            this.checkAlerts(name, value);
            // Log if enabled
            if (this.config.enableLogging) {
                console.debug(`Performance: ${name} = ${value.toFixed(2)}ms (avg: ${metric.average.toFixed(2)}ms)`);
            }
            checkAlerts(metricName, string, value, number);
            void { : .config.enableAlerts, return: ,
                const: threshold = this.config.alertThresholds[metricName],
                if(, threshold) { }, return: ,
                if(value) { } } > threshold;
            {
                const severity = this.calculateSeverity(value, threshold);
                const alert = {
                    metric: metricName,
                    threshold,
                    currentValue: value,
                    severity,
                    timestamp: Date.now()
                };
            }
            ;
            this.alerts.push(alert);
            // Keep only recent alerts (last 100)
            if (this.alerts.length > 100) {
                this.alerts.shift();
                // Log critical alerts
                if (severity === 'critical') {
                    console.error(`🚨 Critical performance alert: ${metricName} = ${value.toFixed(2)}ms (threshold: ${threshold}ms)`);
                }
                calculateSeverity(value, number, threshold, number);
                'low' | 'medium' | 'high' | 'critical';
                {
                    const ratio = value / threshold;
                    if (ratio > 3)
                        return 'critical';
                    if (ratio > 2)
                        return 'high';
                    if (ratio > 1.5)
                        return 'medium';
                    return 'low';
                    /**
                    * Get all performance metrics
                    */
                    getMetrics();
                    PerformanceMetric;
                    {
                        return Array.from(this.metrics.values());
                        /**
                        * Get a specific performance metric
                        */
                        getMetric(name, string);
                        PerformanceMetric | undefined;
                        {
                            return this.metrics.get(name);
                            /**
                            * Get recent performance alerts
                            */
                            getAlerts(limit, number = 10);
                            PerformanceAlert;
                            {
                                return this.alerts.slice(-limit);
                                /**
                                * Clear all metrics and alerts
                                */
                                clear();
                                void {
                                    this: .metrics.clear(),
                                    this: .alerts.length = 0,
                                    this: .timers.clear(),
                                    /**
                                    * Get performance summary
                                    */
                                    getSummary() {
                                        const metrics = this.getMetrics();
                                        const recentAlerts = this.getAlerts(5);
                                        return {
                                            totalMetrics: metrics.length,
                                            totalSamples: metrics.reduce((sum, m) => sum + m.count, 0),
                                            averagePerformance: metrics.reduce((sum, m) => sum + m.average, 0) / metrics.length || 0,
                                            recentAlerts: recentAlerts.length,
                                            criticalAlerts: recentAlerts.filter(a => a.severity === 'critical').length,
                                            lastUpdated: Math.max(...metrics.map(m => m.lastUpdated), 0)
                                        };
                                    },
                                    /**
                                     * Export metrics to JSON
                                     */
                                    exportMetrics() {
                                        return JSON.stringify({});
                                        timestamp: Date.now();
                                        config: this.config;
                                        metrics: this.getMetrics();
                                        alerts: this.getAlerts(50);
                                        summary: this.getSummary();
                                    }
                                }, null, 2;
                                ;
                                /**
                                 * Measure memory usage
                                 */
                                measureMemory(name, string);
                                void {
                                    if(, performance) { }
                                } !== 'undefined' && 'memory' in performance;
                                {
                                    const memory = performance.memory;
                                    const memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB;
                                    this.recordMetric(`${name}-memory`, memoryUsage);
                                }
                                if (typeof process !== 'undefined' && process.memoryUsage) {
                                    const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024; // MB;
                                    this.recordMetric(`${name}-memory`, memoryUsage);
                                }
                                /**
                                 * Measure function execution time
                                 */
                                measure(name, string, fn, () => T);
                                T;
                                {
                                    this.startTiming(name);
                                    try {
                                        const result = fn();
                                        this.endTiming(name);
                                        return result;
                                    }
                                    catch (error) {
                                        this.endTiming(name);
                                        throw error;
                                        /**
                                        * Measure async function execution time
                                        */
                                        async;
                                        measureAsync(name, string, fn, () => Promise);
                                        Promise < T > {};
                                        this.startTiming(name);
                                        try {
                                            const result = await fn();
                                            this.endTiming(name);
                                            return result;
                                        }
                                        catch (error) {
                                            this.endTiming(name);
                                            throw error;
                                            /**
                                            * Create a performance decorator
                                            */
                                            createDecorator(metricName, string);
                                            {
                                                return (target, propertyKey, descriptor) => {
                                                    const originalMethod = descriptor.value;
                                                    descriptor.value = async function (...args) { };
                                                    const monitor = this.performanceMonitor || new PerformanceMonitor();
                                                    return await monitor.measureAsync(metricName, () => originalMethod.apply(this, args));
                                                };
                                            }
                                            ;
                                            // Global performance monitor instance
                                            export const performanceMonitor = new PerformanceMonitor();
                                            // Performance decorator
                                            export function Performance(metricName) {
                                                return performanceMonitor.createDecorator(metricName);
                                                // Helper function to measure execution time
                                                export function measurePerformance(name, fn) {
                                                    return performanceMonitor.measure(name, fn);
                                                    // Helper function to measure async execution time
                                                    export function measurePerformanceAsync(name, fn) {
                                                        return performanceMonitor.measureAsync(name, fn);
                                                        // React hook for performance monitoring
                                                        export function usePerformanceMonitor() {
                                                            return {
                                                                startTiming: (name) => performanceMonitor.startTiming(name),
                                                                endTiming: (name) => performanceMonitor.endTiming(name),
                                                                recordMetric: (name, value) => performanceMonitor.recordMetric(name, value),
                                                                getMetrics: () => performanceMonitor.getMetrics(),
                                                                getSummary: () => performanceMonitor.getSummary(),
                                                                measureMemory: (name) => performanceMonitor.measureMemory(name)
                                                            };
                                                        }
                                                        ;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
