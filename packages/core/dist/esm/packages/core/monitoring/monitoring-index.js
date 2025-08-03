/**
 * Monitoring and Analytics Module
 * Central export point for all monitoring capabilities
 */
// Core services
export { monitoring, analytics, errorTracker } from './MonitoringService';
export { apm } from './APMService';
export { workflowMonitor } from './WorkflowMonitor';
// Components
export { MonitoringDashboard } from './MonitoringDashboard';
// Configuration
export { startMonitoring } from './uptime-config';
// Decorators
export { trackPerformance } from './MonitoringService';
export { monitorWorkflow } from './WorkflowMonitor';
// Browser Performance API Integration
export const browserMetrics = {
    /**
     * Track page load performance
     */
    trackPageLoad: () => {
        if (typeof window === 'undefined' || !window.performance)
            return;
        const { monitoring } = require('./MonitoringService');
        window.addEventListener('load', () => {
            const perfData = window.performance.timing;
            const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
            const domReadyTime = perfData.domContentLoadedEventEnd - perfData.navigationStart;
            const timeToFirstByte = perfData.responseStart - perfData.navigationStart;
            monitoring.recordMetric('page.load.time', pageLoadTime);
            monitoring.recordMetric('dom.ready.time', domReadyTime);
            monitoring.recordMetric('time.to.first.byte', timeToFirstByte);
            // Core Web Vitals
            if ('PerformanceObserver' in window) {
                // Largest Contentful Paint
                const lcpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    monitoring.recordMetric('web.vitals.lcp', lastEntry.startTime);
                });
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
                // First Input Delay
                const fidObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach((entry) => {
                        monitoring.recordMetric('web.vitals.fid', entry.processingStart - entry.startTime);
                    });
                });
                fidObserver.observe({ entryTypes: ['first-input'] });
                // Cumulative Layout Shift
                let clsValue = 0;
                const clsObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach((entry) => {
                        if (!entry.hadRecentInput) {
                            clsValue += entry.value;
                            monitoring.recordMetric('web.vitals.cls', clsValue);
                        }
                    });
                });
                clsObserver.observe({ entryTypes: ['layout-shift'] });
            }
        });
    },
    /**
     * Track user interactions
     */
    trackInteraction: (action, category, metadata) => {
        const { analytics } = require('./MonitoringService');
        analytics.track(`user.interaction.${action}`, {
            category,
            ...metadata,
        });
    },
    /**
     * Track navigation timing
     */
    trackNavigation: (from, to) => {
        const { analytics, monitoring } = require('./MonitoringService');
        const startTime = performance.now();
        analytics.track('navigation', {
            from,
            to,
            timestamp: startTime,
        });
        // Return a function to call when navigation completes
        return () => {
            const duration = performance.now() - startTime;
            monitoring.recordMetric('navigation.duration', duration, {
                from,
                to,
            });
        };
    },
};
// Utility functions
export const monitoringUtils = {
    /**
     * Format bytes for display
     */
    formatBytes: (bytes) => {
        if (bytes === 0)
            return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    /**
     * Format duration for display
     */
    formatDuration: (ms) => {
        if (ms < 1000)
            return `${ms.toFixed(0)}ms`;
        if (ms < 60000)
            return `${(ms / 1000).toFixed(1)}s`;
        return `${(ms / 60000).toFixed(1)}m`;
    },
    /**
     * Calculate percentile from array of numbers
     */
    percentile: (arr, p) => {
        if (arr.length === 0)
            return 0;
        const sorted = arr.slice().sort((a, b) => a - b);
        const index = Math.ceil(sorted.length * p) - 1;
        return sorted[Math.max(0, index)];
    },
    /**
     * Create rate limiter for metrics
     */
    createRateLimiter: (maxPerMinute) => {
        const calls = [];
        return () => {
            const now = Date.now();
            const oneMinuteAgo = now - 60000;
            // Remove old calls
            while (calls.length > 0 && calls[0] < oneMinuteAgo) {
                calls.shift();
            }
            if (calls.length >= maxPerMinute) {
                return false;
            }
            calls.push(now);
            return true;
        };
    },
};
// Epic 1 specific monitoring presets
export const epic1Monitoring = {
    /**
     * Track inline editing session
     */
    trackInlineEdit: (nodeId) => {
        const { workflowMonitor } = require('./WorkflowMonitor');
        const { analytics } = require('./MonitoringService');
        const timing = workflowMonitor.createTimingHelper('inline-edit');
        return {
            enterEditMode: () => {
                timing.startStep('enter-edit-mode');
                analytics.track('inline.edit.start', { nodeId });
            },
            updateContent: () => {
                timing.endStep('enter-edit-mode');
                timing.startStep('update-content');
            },
            updatePreview: () => {
                timing.endStep('update-content');
                timing.startStep('update-preview');
            },
            complete: (saved) => {
                timing.endStep('update-preview');
                const metric = timing.finish(saved);
                analytics.track('inline.edit.complete', {
                    nodeId,
                    saved,
                    duration: metric.totalDuration,
                });
            },
        };
    },
    /**
     * Track graph operations
     */
    trackGraphOperation: (operation) => {
        const { apm } = require('./APMService');
        const { analytics } = require('./MonitoringService');
        const transaction = apm.startTransaction(`graph.${operation}`, 'task');
        return {
            addNode: (nodeType) => {
                const span = apm.addSpan(transaction.id, 'add-node');
                analytics.track('graph.node.add', { nodeType });
                apm.endSpan(transaction.id, span.id);
            },
            removeNode: (nodeId) => {
                const span = apm.addSpan(transaction.id, 'remove-node');
                analytics.track('graph.node.remove', { nodeId });
                apm.endSpan(transaction.id, span.id);
            },
            updateConnection: () => {
                const span = apm.addSpan(transaction.id, 'update-connection');
                analytics.track('graph.connection.update');
                apm.endSpan(transaction.id, span.id);
            },
            complete: (success, error) => {
                apm.endTransaction(transaction.id, success ? 'success' : 'error', error);
                analytics.track(`graph.${operation}.complete`, {
                    success,
                    error: error?.message,
                });
            },
        };
    },
    /**
     * Track feature flag usage
     */
    trackFeatureFlag: (flagKey, enabled) => {
        const { monitoring, analytics } = require('./MonitoringService');
        monitoring.recordMetric('feature.flag.evaluation', 1, {
            flag: flagKey,
            enabled: enabled.toString(),
        });
        analytics.track('feature.flag.evaluated', {
            flag: flagKey,
            enabled,
        });
    },
};
// Auto-initialize in browser
if (typeof window !== 'undefined') {
    // Track page load
    browserMetrics.trackPageLoad();
    // Track visibility changes
    document.addEventListener('visibilitychange', () => {
        const { analytics } = require('./MonitoringService');
        analytics.track('visibility.change', {
            hidden: document.hidden,
        });
    });
    // Track unload
    window.addEventListener('beforeunload', () => {
        const { analytics } = require('./MonitoringService');
        analytics.track('page.unload', {
            duration: performance.now(),
        });
    });
}
