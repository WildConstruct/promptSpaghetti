/**
 * KPI Monitoring Service for Epic 18
 * Real-time monitoring and alerting system for performance KPIs
 */
import { EventEmitter } from 'events';
import { corePerformanceKPIs, generateKPIRecommendations } from './PerformanceKPIs.js';
import { PerformanceBaseline } from './PerformanceBaseline.js';
import { PerformanceMonitoringDashboard } from './PerformanceMonitoringDashboard.js';
/**
 * KPI Monitoring Service
 * Provides real-time monitoring, alerting, and trend analysis for performance KPIs
 */
export class KPIMonitoringService extends EventEmitter {
    config;
    baseline;
    dashboard;
    alerts = [];
    kpiHistory = new Map();
    isMonitoring = false;
    monitoringInterval;
    baselineInterval;
    reportingInterval;
    constructor(config = {}) {
        super();
        this.config = {
            monitoringInterval: 30000, // 30 seconds
            alertingEnabled: true,
            alertThresholds: {
                critical: 3, // Alert after 3 critical violations
                consecutive: 2, // Alert after 2 consecutive violations
                degradationThreshold: 20 // Alert on 20% degradation
            },
            kpiFilters: {
                categories: [], // Monitor all categories
                priorities: ['critical', 'high'], // Monitor critical and high priority
                enabled: [] // Monitor all KPIs
            },
            baseline: {
                autoCapture: true,
                captureInterval: 3600000, // 1 hour
                retentionPeriod: 2592000000 // 30 days
            },
            reporting: {
                enabled: false,
                interval: 86400000, // 24 hours
                includeRecommendations: true,
                emailRecipients: []
            },
            ...config
        };
        this.baseline = new PerformanceBaseline();
        this.dashboard = new PerformanceMonitoringDashboard();
        this.setupEventHandlers();
    }
    /**
     * Start KPI monitoring
     */
    async startMonitoring() {
        if (this.isMonitoring) {
            console.log('🔍 KPI monitoring is already running');
            return;
        }
        console.log('🚀 Starting KPI monitoring service...');
        this.isMonitoring = true;
        // Capture initial baseline
        if (this.config.baseline.autoCapture) {
            try {
                await this.baseline.captureBaseline();
                console.log('📊 Initial baseline captured');
            }
            catch (error) {
                console.error('❌ Failed to capture initial baseline:', error);
            }
        }
        // Start monitoring interval
        this.monitoringInterval = setInterval(() => {
            this.performMonitoringCycle();
        }, this.config.monitoringInterval);
        // Start baseline capture interval
        if (this.config.baseline.autoCapture) {
            this.baselineInterval = setInterval(() => {
                this.captureScheduledBaseline();
            }, this.config.baseline.captureInterval);
        }
        // Start reporting interval
        if (this.config.reporting.enabled) {
            this.reportingInterval = setInterval(() => {
                this.generateScheduledReport();
            }, this.config.reporting.interval);
        }
        this.emit('monitoring-started');
        console.log('✅ KPI monitoring started successfully');
    }
    /**
     * Stop KPI monitoring
     */
    stopMonitoring() {
        if (!this.isMonitoring)
            return;
        console.log('⏹️ Stopping KPI monitoring service...');
        this.isMonitoring = false;
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = undefined;
        }
        if (this.baselineInterval) {
            clearInterval(this.baselineInterval);
            this.baselineInterval = undefined;
        }
        if (this.reportingInterval) {
            clearInterval(this.reportingInterval);
            this.reportingInterval = undefined;
        }
        this.emit('monitoring-stopped');
        console.log('✅ KPI monitoring stopped');
    }
    /**
     * Perform a monitoring cycle
     */
    async performMonitoringCycle() {
        try {
            console.log('🔍 Performing KPI monitoring cycle...');
            // Get KPIs to monitor based on filters
            const kpisToMonitor = this.getFilteredKPIs();
            // Capture current baseline to get KPI snapshots
            const currentBaseline = await this.baseline.captureBaseline();
            // Process each KPI snapshot
            for (const snapshot of currentBaseline.kpiSnapshots) {
                if (kpisToMonitor.some(kpi => kpi.id === snapshot.kpiId)) {
                    await this.processKPISnapshot(snapshot);
                }
            }
            // Clean up old data
            this.cleanupOldData();
            this.emit('monitoring-cycle-complete', {
                timestamp: Date.now(),
                kpisMonitored: kpisToMonitor.length,
                alertsGenerated: this.alerts.filter(a => !a.acknowledged).length
            });
        }
        catch (error) {
            console.error('❌ Error in monitoring cycle:', error);
            this.emit('monitoring-error', error);
        }
    }
    /**
     * Process a KPI snapshot and generate alerts if needed
     */
    async processKPISnapshot(snapshot) {
        // Add to history
        if (!this.kpiHistory.has(snapshot.kpiId)) {
            this.kpiHistory.set(snapshot.kpiId, []);
        }
        const history = this.kpiHistory.get(snapshot.kpiId);
        history.push(snapshot);
        // Keep only recent history (last 100 snapshots)
        if (history.length > 100) {
            this.kpiHistory.set(snapshot.kpiId, history.slice(-100));
        }
        // Check for alerting conditions
        if (this.config.alertingEnabled) {
            await this.checkAlertingConditions(snapshot);
        }
        this.emit('kpi-snapshot-processed', snapshot);
    }
    /**
     * Check alerting conditions for a KPI snapshot
     */
    async checkAlertingConditions(snapshot) {
        const kpi = corePerformanceKPIs.find(k => k.id === snapshot.kpiId);
        if (!kpi)
            return;
        // Check for critical/warning status
        if (snapshot.status === 'critical' || snapshot.status === 'warning') {
            await this.createKPIAlert(snapshot, kpi, 'status_violation');
        }
        // Check for degrading trend
        if (snapshot.trend === 'degrading') {
            const history = this.kpiHistory.get(snapshot.kpiId) || [];
            const trendAnalysis = this.analyzeTrend(history);
            if (trendAnalysis.significance === 'major') {
                await this.createKPIAlert(snapshot, kpi, 'trend_degradation');
            }
        }
        // Check for consecutive violations
        const recentSnapshots = (this.kpiHistory.get(snapshot.kpiId) || []).slice(-this.config.alertThresholds.consecutive);
        const consecutiveViolations = recentSnapshots.every(s => s.status === 'critical' || s.status === 'warning');
        if (consecutiveViolations && recentSnapshots.length >= this.config.alertThresholds.consecutive) {
            await this.createKPIAlert(snapshot, kpi, 'consecutive_violations');
        }
    }
    /**
     * Create a KPI alert
     */
    async createKPIAlert(snapshot, kpi, type) {
        // Check if similar alert already exists and is unacknowledged
        const existingAlert = this.alerts.find(alert => alert.kpiId === snapshot.kpiId &&
            !alert.acknowledged &&
            Date.now() - alert.timestamp < 3600000 // Within last hour
        );
        if (existingAlert) {
            console.log(`⚠️ Skipping duplicate alert for KPI ${kpi.name}`);
            return;
        }
        let severity;
        let message;
        switch (type) {
            case 'status_violation':
                severity = snapshot.status === 'critical' ? 'critical' : 'high';
                message = `${kpi.name} is ${snapshot.status}: ${snapshot.value}${kpi.unit} (target: ${kpi.target}${kpi.unit})`;
                break;
            case 'trend_degradation':
                severity = 'medium';
                message = `${kpi.name} shows degrading trend: ${snapshot.value}${kpi.unit}`;
                break;
            case 'consecutive_violations':
                severity = 'high';
                message = `${kpi.name} has consecutive violations: ${snapshot.value}${kpi.unit}`;
                break;
        }
        const alert = {
            id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            kpiId: snapshot.kpiId,
            kpiName: kpi.name,
            severity,
            status: snapshot.status,
            value: snapshot.value,
            target: kpi.target,
            threshold: snapshot.status === 'critical' ? kpi.critical : kpi.warning,
            trend: snapshot.trend,
            message,
            recommendations: generateKPIRecommendations(kpi.id, snapshot.value, snapshot.status),
            timestamp: Date.now(),
            acknowledged: false
        };
        this.alerts.push(alert);
        // Limit alert history
        if (this.alerts.length > 500) {
            this.alerts = this.alerts.slice(-500);
        }
        console.log(`🚨 KPI Alert: ${message}`);
        this.emit('kpi-alert-created', alert);
    }
    /**
     * Analyze trend for a KPI
     */
    analyzeTrend(history) {
        if (history.length < 5) {
            return {
                kpiId: history[0]?.kpiId || '',
                trend: 'stable',
                changePercent: 0,
                periodDays: 0,
                significance: 'minor',
                projection: { nextWeek: 0, nextMonth: 0, confidence: 0 }
            };
        }
        const recent = history.slice(-10); // Last 10 snapshots
        const values = recent.map(s => s.value);
        const timeSpan = recent[recent.length - 1].timestamp - recent[0].timestamp;
        const periodDays = timeSpan / (1000 * 60 * 60 * 24);
        // Calculate linear regression
        const n = values.length;
        const sumX = values.reduce((sum, _, i) => sum + i, 0);
        const sumY = values.reduce((sum, val) => sum + val, 0);
        const sumXY = values.reduce((sum, val, i) => sum + i * val, 0);
        const sumXX = values.reduce((sum, _, i) => sum + i * i, 0);
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const baseValue = values[0];
        const changePercent = Math.abs(slope * n / baseValue * 100);
        // Determine trend direction and significance
        let trend = 'stable';
        let significance = 'minor';
        if (Math.abs(slope) > baseValue * 0.01) { // 1% change threshold
            trend = slope > 0 ? 'degrading' : 'improving'; // Assuming lower is better for most KPIs
            if (changePercent > 20)
                significance = 'major';
            else if (changePercent > 10)
                significance = 'moderate';
        }
        // Simple projection (linear extrapolation)
        const projectedWeekly = values[values.length - 1] + slope * 7;
        const projectedMonthly = values[values.length - 1] + slope * 30;
        const confidence = Math.max(0, Math.min(1, 1 - (changePercent / 100)));
        return {
            kpiId: history[0].kpiId,
            trend,
            changePercent,
            periodDays,
            significance,
            projection: {
                nextWeek: projectedWeekly,
                nextMonth: projectedMonthly,
                confidence
            }
        };
    }
    /**
     * Get filtered KPIs based on configuration
     */
    getFilteredKPIs() {
        let filtered = [...corePerformanceKPIs];
        // Filter by categories
        if (this.config.kpiFilters.categories.length > 0) {
            filtered = filtered.filter(kpi => this.config.kpiFilters.categories.includes(kpi.category));
        }
        // Filter by priorities
        if (this.config.kpiFilters.priorities.length > 0) {
            filtered = filtered.filter(kpi => this.config.kpiFilters.priorities.includes(kpi.priority));
        }
        // Filter by enabled KPIs
        if (this.config.kpiFilters.enabled.length > 0) {
            filtered = filtered.filter(kpi => this.config.kpiFilters.enabled.includes(kpi.id));
        }
        return filtered;
    }
    /**
     * Clean up old data
     */
    cleanupOldData() {
        const cutoff = Date.now() - this.config.baseline.retentionPeriod;
        // Clean up old alerts
        this.alerts = this.alerts.filter(alert => alert.timestamp > cutoff);
        // Clean up old KPI history
        for (const [kpiId, history] of this.kpiHistory.entries()) {
            const filtered = history.filter(snapshot => snapshot.timestamp > cutoff);
            this.kpiHistory.set(kpiId, filtered);
        }
    }
    /**
     * Capture scheduled baseline
     */
    async captureScheduledBaseline() {
        try {
            console.log('📊 Capturing scheduled baseline...');
            await this.baseline.captureBaseline();
            this.emit('baseline-captured');
        }
        catch (error) {
            console.error('❌ Failed to capture scheduled baseline:', error);
        }
    }
    /**
     * Generate scheduled report
     */
    async generateScheduledReport() {
        try {
            console.log('📈 Generating scheduled KPI report...');
            const report = this.generateKPIReport();
            this.emit('report-generated', report);
        }
        catch (error) {
            console.error('❌ Failed to generate scheduled report:', error);
        }
    }
    /**
     * Generate comprehensive KPI report
     */
    generateKPIReport() {
        const monitoredKPIs = this.getFilteredKPIs();
        const activeAlerts = this.alerts.filter(a => !a.acknowledged);
        // Calculate average score
        const latestBaseline = this.baseline.getLatestBaseline();
        const averageScore = latestBaseline ?
            this.calculateAverageKPIScore(latestBaseline.kpiSnapshots) : 0;
        // Get KPI status
        const kpiStatus = monitoredKPIs.map(kpi => {
            const history = this.kpiHistory.get(kpi.id) || [];
            const latest = history[history.length - 1];
            return {
                kpiId: kpi.id,
                name: kpi.name,
                category: kpi.category,
                status: latest?.status || 'unknown',
                value: latest?.value || 0,
                target: kpi.target,
                trend: latest?.trend || 'stable'
            };
        });
        // Generate trend analyses
        const trends = monitoredKPIs
            .map(kpi => this.analyzeTrend(this.kpiHistory.get(kpi.id) || []))
            .filter(trend => trend.significance !== 'minor');
        // Generate recommendations
        const recommendations = this.generateSystemRecommendations(activeAlerts, trends);
        return {
            timestamp: Date.now(),
            summary: {
                totalKPIs: corePerformanceKPIs.length,
                monitoredKPIs: monitoredKPIs.length,
                alertsActive: activeAlerts.length,
                averageScore
            },
            kpiStatus,
            alerts: activeAlerts,
            trends,
            recommendations
        };
    }
    calculateAverageKPIScore(snapshots) {
        if (snapshots.length === 0)
            return 0;
        const scores = snapshots.map(snapshot => {
            switch (snapshot.status) {
                case 'excellent': return 100;
                case 'good': return 80;
                case 'warning': return 60;
                case 'critical': return 30;
                default: return 70;
            }
        });
        return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
    }
    generateSystemRecommendations(alerts, trends) {
        const recommendations = new Set();
        // Critical alerts
        const criticalAlerts = alerts.filter(a => a.severity === 'critical');
        if (criticalAlerts.length > 0) {
            recommendations.add('🚨 Address critical performance issues immediately');
            recommendations.add(`Critical KPIs: ${criticalAlerts.map(a => a.kpiName).join(', ')}`);
        }
        // Degrading trends
        const majorTrends = trends.filter(t => t.significance === 'major' && t.trend === 'degrading');
        if (majorTrends.length > 0) {
            recommendations.add('📉 Monitor KPIs with major degrading trends');
            recommendations.add(`Degrading: ${majorTrends.map(t => t.kpiId).join(', ')}`);
        }
        // Category-specific recommendations
        const runtimeAlerts = alerts.filter(a => a.kpiId.startsWith('runtime_'));
        if (runtimeAlerts.length > 0) {
            recommendations.add('⚡ Consider frontend performance optimizations');
        }
        const apiAlerts = alerts.filter(a => a.kpiId.startsWith('api_'));
        if (apiAlerts.length > 0) {
            recommendations.add('🔧 Review API performance and caching strategies');
        }
        return Array.from(recommendations);
    }
    setupEventHandlers() {
        this.baseline.on('baseline-captured', (baseline) => {
            console.log(`📊 Baseline captured: ${baseline.kpiSnapshots.length} KPIs measured`);
        });
        this.on('kpi-alert-created', (alert) => {
            if (alert.severity === 'critical') {
                console.error(`🚨 CRITICAL KPI ALERT: ${alert.message}`);
            }
        });
    }
    // === Public API Methods ===
    /**
     * Get current KPI status
     */
    getCurrentKPIStatus() {
        return this.getFilteredKPIs().map(kpi => {
            const history = this.kpiHistory.get(kpi.id) || [];
            const latest = history[history.length - 1];
            return {
                kpiId: kpi.id,
                status: latest?.status || 'unknown',
                value: latest?.value || 0,
                trend: latest?.trend || 'stable'
            };
        });
    }
    /**
     * Get active alerts
     */
    getActiveAlerts() {
        return this.alerts.filter(alert => !alert.acknowledged);
    }
    /**
     * Acknowledge an alert
     */
    acknowledgeAlert(alertId) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.acknowledged = true;
            this.emit('alert-acknowledged', alert);
            return true;
        }
        return false;
    }
    /**
     * Get KPI history
     */
    getKPIHistory(kpiId, limit) {
        const history = this.kpiHistory.get(kpiId) || [];
        return limit ? history.slice(-limit) : history;
    }
    /**
     * Get trend analysis for a KPI
     */
    getKPITrend(kpiId) {
        const history = this.kpiHistory.get(kpiId) || [];
        return this.analyzeTrend(history);
    }
    /**
     * Update monitoring configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.emit('config-updated', this.config);
    }
    /**
     * Get current configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Force immediate monitoring cycle
     */
    async triggerMonitoringCycle() {
        if (!this.isMonitoring) {
            throw new Error('Monitoring is not running');
        }
        await this.performMonitoringCycle();
    }
    /**
     * Export monitoring data
     */
    exportData() {
        return {
            config: this.config,
            alerts: this.alerts,
            kpiHistory: Object.fromEntries(this.kpiHistory),
            baselines: this.baseline.getBaselineHistory()
        };
    }
    /**
     * Get monitoring status
     */
    getMonitoringStatus() {
        return {
            isRunning: this.isMonitoring,
            uptime: this.isMonitoring ? Date.now() - this.monitoringInterval?._idleStart || 0 : 0,
            kpisMonitored: this.getFilteredKPIs().length,
            activeAlerts: this.getActiveAlerts().length,
            lastCycle: this.baseline.getLatestBaseline()?.timestamp
        };
    }
}
export default KPIMonitoringService;
