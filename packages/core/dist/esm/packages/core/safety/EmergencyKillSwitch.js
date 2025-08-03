/**
 * Emergency Kill Switch System
 * Provides instant feature disablement in case of critical issues
 */
import { EventEmitter } from 'events';
import { monitoring, errorTracker } from '../monitoring/MonitoringService';
import { featureFlags } from './SafetyFramework';
/**
 * Emergency Kill Switch Manager
 */
export class EmergencyKillSwitch extends EventEmitter {
    static instance;
    switches = new Map();
    activations = new Map();
    monitoring = new Map();
    static getInstance() {
        if (!this.instance) {
            this.instance = new EmergencyKillSwitch();
        }
        return this.instance;
    }
    /**
     * Register a kill switch for a feature
     */
    register(config) {
        this.switches.set(config.featureFlag, config);
        // Start monitoring
        this.startMonitoring(config);
        console.log(`Kill switch registered for ${config.featureFlag}`);
    }
    /**
     * Manually trigger a kill switch
     */
    trigger(featureFlag, reason) {
        const config = this.switches.get(featureFlag);
        if (!config) {
            console.error(`No kill switch found for ${featureFlag}`);
            return;
        }
        // Check cooldown
        const lastActivation = this.activations.get(featureFlag);
        if (lastActivation) {
            const cooldownMs = config.cooldownMinutes * 60 * 1000;
            if (Date.now() - lastActivation.getTime() < cooldownMs) {
                console.warn(`Kill switch for ${featureFlag} is in cooldown`);
                return;
            }
        }
        // Disable feature
        featureFlags.setFlag(featureFlag, false);
        this.activations.set(featureFlag, new Date());
        // Emit event
        const event = {
            featureFlag,
            triggered: true,
            reason,
            metrics: this.getCurrentMetrics(config),
            timestamp: new Date(),
        };
        this.emit('kill-switch-triggered', event);
        // Send notifications
        this.sendNotifications(config, event);
        // Log to monitoring
        monitoring.recordMetric('kill_switch.triggered', 1, {
            feature: featureFlag,
            reason,
        });
        console.error(`KILL SWITCH ACTIVATED: ${featureFlag} - ${reason}`);
    }
    /**
     * Start monitoring metrics for automatic triggering
     */
    startMonitoring(config) {
        // Check every 10 seconds
        const interval = setInterval(() => {
            this.checkThresholds(config);
        }, 10000);
        this.monitoring.set(config.featureFlag, interval);
    }
    /**
     * Check if any thresholds are exceeded
     */
    async checkThresholds(config) {
        const { thresholds, featureFlag } = config;
        // Skip if feature is already disabled
        if (!featureFlags.isEnabled(featureFlag)) {
            // Check for auto-recovery
            if (config.autoRecover) {
                await this.checkAutoRecovery(config);
            }
            return;
        }
        // Check error rate
        if (thresholds.errorRate !== undefined) {
            const errorStats = errorTracker.getErrorStats(1); // Last hour
            const totalRequests = monitoring.getMetricStats('requests.total', 60)?.avg || 1;
            const errorRate = (errorStats.total / totalRequests) * 100;
            if (errorRate > thresholds.errorRate) {
                this.trigger(featureFlag, `Error rate ${errorRate.toFixed(2)}% exceeds threshold ${thresholds.errorRate}%`);
                return;
            }
        }
        // Check error count
        if (thresholds.errorCount !== undefined) {
            const errorStats = errorTracker.getErrorStats(0.25); // Last 15 minutes
            if (errorStats.total > thresholds.errorCount) {
                this.trigger(featureFlag, `Error count ${errorStats.total} exceeds threshold ${thresholds.errorCount}`);
                return;
            }
        }
        // Check response time
        if (thresholds.responseTime !== undefined) {
            const responseStats = monitoring.getMetricStats('response_time', 5); // Last 5 minutes
            if (responseStats && responseStats.p95 > thresholds.responseTime) {
                this.trigger(featureFlag, `Response time p95 ${responseStats.p95.toFixed(0)}ms exceeds threshold ${thresholds.responseTime}ms`);
                return;
            }
        }
        // Check memory usage
        if (thresholds.memoryUsage !== undefined) {
            const memoryUsage = process.memoryUsage().heapUsed;
            if (memoryUsage > thresholds.memoryUsage) {
                this.trigger(featureFlag, `Memory usage ${(memoryUsage / 1024 / 1024).toFixed(0)}MB exceeds threshold ${(thresholds.memoryUsage / 1024 / 1024).toFixed(0)}MB`);
                return;
            }
        }
        // Check custom metric
        if (thresholds.customMetric) {
            const { name, operator, value } = thresholds.customMetric;
            const metricStats = monitoring.getMetricStats(name, 5);
            if (metricStats) {
                const currentValue = metricStats.avg;
                let shouldTrigger = false;
                switch (operator) {
                    case '>':
                        shouldTrigger = currentValue > value;
                        break;
                    case '<':
                        shouldTrigger = currentValue < value;
                        break;
                    case '>=':
                        shouldTrigger = currentValue >= value;
                        break;
                    case '<=':
                        shouldTrigger = currentValue <= value;
                        break;
                    case '==':
                        shouldTrigger = currentValue === value;
                        break;
                    case '!=':
                        shouldTrigger = currentValue !== value;
                        break;
                }
                if (shouldTrigger) {
                    this.trigger(featureFlag, `Custom metric ${name} ${operator} ${value} (current: ${currentValue.toFixed(2)})`);
                }
            }
        }
    }
    /**
     * Check if feature can be auto-recovered
     */
    async checkAutoRecovery(config) {
        const lastActivation = this.activations.get(config.featureFlag);
        if (!lastActivation)
            return;
        // Check if enough time has passed
        const cooldownMs = config.cooldownMinutes * 60 * 1000;
        if (Date.now() - lastActivation.getTime() < cooldownMs) {
            return;
        }
        // Check if metrics are healthy
        const metrics = this.getCurrentMetrics(config);
        const isHealthy = this.areMetricsHealthy(config, metrics);
        if (isHealthy) {
            // Re-enable feature
            featureFlags.setFlag(config.featureFlag, true);
            this.activations.delete(config.featureFlag);
            const event = {
                featureFlag: config.featureFlag,
                triggered: false,
                reason: 'Auto-recovery: metrics healthy',
                metrics,
                timestamp: new Date(),
            };
            this.emit('kill-switch-recovered', event);
            console.log(`Kill switch auto-recovered: ${config.featureFlag}`);
        }
    }
    /**
     * Get current metrics for a feature
     */
    getCurrentMetrics(config) {
        const metrics = {};
        // Get error rate
        const errorStats = errorTracker.getErrorStats(1);
        const totalRequests = monitoring.getMetricStats('requests.total', 60)?.avg || 1;
        metrics.errorRate = (errorStats.total / totalRequests) * 100;
        // Get response time
        const responseStats = monitoring.getMetricStats('response_time', 5);
        if (responseStats) {
            metrics.responseTimeP95 = responseStats.p95;
        }
        // Get memory usage
        metrics.memoryUsageMB = process.memoryUsage().heapUsed / 1024 / 1024;
        return metrics;
    }
    /**
     * Check if metrics are healthy for recovery
     */
    areMetricsHealthy(config, metrics) {
        const { thresholds } = config;
        // All metrics must be 20% better than thresholds for recovery
        const safetyMargin = 0.8;
        if (thresholds.errorRate !== undefined && metrics.errorRate > thresholds.errorRate * safetyMargin) {
            return false;
        }
        if (thresholds.responseTime !== undefined && metrics.responseTimeP95 > thresholds.responseTime * safetyMargin) {
            return false;
        }
        if (thresholds.memoryUsage !== undefined) {
            const memoryBytes = metrics.memoryUsageMB * 1024 * 1024;
            if (memoryBytes > thresholds.memoryUsage * safetyMargin) {
                return false;
            }
        }
        return true;
    }
    /**
     * Send notifications about kill switch activation
     */
    sendNotifications(config, event) {
        config.notificationChannels.forEach(channel => {
            switch (channel) {
                case 'console':
                    console.error('🚨 KILL SWITCH NOTIFICATION', event);
                    break;
                case 'slack':
                    // this.sendSlackNotification(event);
                    break;
                case 'pagerduty':
                    // this.sendPagerDutyAlert(event);
                    break;
                case 'email':
                    // this.sendEmailAlert(event);
                    break;
            }
        });
    }
    /**
     * Get status of all kill switches
     */
    getStatus() {
        const status = {};
        this.switches.forEach((config, featureFlag) => {
            status[featureFlag] = {
                config,
                isActive: !featureFlags.isEnabled(featureFlag),
                lastActivation: this.activations.get(featureFlag),
                currentMetrics: this.getCurrentMetrics(config),
            };
        });
        return status;
    }
    /**
     * Clean up monitoring
     */
    dispose() {
        this.monitoring.forEach(interval => clearInterval(interval));
        this.monitoring.clear();
        this.removeAllListeners();
    }
}
/**
 * Pre-configured Epic 1 kill switches
 */
export const EPIC1_KILL_SWITCHES = [
    {
        featureFlag: 'epic1-inline-editing',
        thresholds: {
            errorRate: 1, // 1% error rate
            responseTime: 5000, // 5 seconds
        },
        cooldownMinutes: 30,
        notificationChannels: ['console', 'slack'],
        autoRecover: true,
    },
    {
        featureFlag: 'epic1-new-engine',
        thresholds: {
            errorRate: 0.5, // 0.5% error rate (more critical)
            errorCount: 100, // 100 errors in 15 minutes
            memoryUsage: 1024 * 1024 * 1024, // 1GB
        },
        cooldownMinutes: 60,
        notificationChannels: ['console', 'slack', 'pagerduty'],
        autoRecover: false, // Manual recovery required
    },
    {
        featureFlag: 'epic1-preview-system',
        thresholds: {
            responseTime: 10000, // 10 seconds
            customMetric: {
                name: 'preview.generation.time',
                operator: '>',
                value: 5000, // 5 seconds
            },
        },
        cooldownMinutes: 15,
        notificationChannels: ['console'],
        autoRecover: true,
    },
];
// Export singleton instance
export const killSwitch = EmergencyKillSwitch.getInstance();
// Register Epic 1 kill switches
EPIC1_KILL_SWITCHES.forEach(config => {
    killSwitch.register(config);
});
