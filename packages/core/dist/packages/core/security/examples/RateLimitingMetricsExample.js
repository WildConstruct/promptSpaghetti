import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Rate Limiting Performance Metrics Example
 * Task: E31-1753313263525-EEFACB - Build API rate limiting performance metrics visualization
 * Epic 31: Security Intelligence Platform
 *
 * Comprehensive example demonstrating the rate limiting performance metrics
 * system including dashboard integration, real-time monitoring, and alerts.
 */
import { useState, useEffect } from 'react';
import { RateLimitingService } from '../RateLimitingService';
import { AdaptiveThrottlingRulesEngine } from '../AdaptiveThrottlingRules';
import { RateLimitingPerformanceMetrics } from '../RateLimitingPerformanceMetrics';
import { RateLimitingMetricsDashboard } from '../components/RateLimitingMetricsDashboard';
import { useRateLimitingMetrics } from '../hooks/useRateLimitingMetrics';
// ========================================
// Example 1: Basic Performance Metrics Setup
// ========================================
export function BasicMetricsExample() {
    console.log('=== Basic Rate Limiting Performance Metrics Example ===');
    // Create rate limiting service
    const rateLimitingService = new RateLimitingService();
    // Create adaptive throttling engine
    const throttlingEngine = new AdaptiveThrottlingRulesEngine(rateLimitingService, true, // Enable default rules
    { enableAnalytics: true });
    // Create performance metrics service
    const metricsService = new RateLimitingPerformanceMetrics(rateLimitingService, throttlingEngine, {
        enableRealTimeMetrics: true,
        metricsRetentionPeriod: 24, // 24 hours
        visualizationOptions: {
            enableCharts: true,
            enableHeatmaps: true,
            enableTimeseries: true,
            enableGeospatialMaps: true,
            refreshInterval: 5 // 5 seconds
        },
        alerting: {
            enableAlerts: true,
            alertThresholds: {
                highResponseTime: 150,
                lowThroughput: 50,
                highErrorRate: 8,
                highBlockRate: 20
            }
        }
    });
    // Start monitoring
    metricsService.startMetricsCollection();
    // Listen for events
    metricsService.on('metricsUpdated', (data) => {
        console.log('📊 Metrics updated:', {
            responseTime: data.metrics.responseTime.average.toFixed(2) + 'ms',
            throughput: data.metrics.throughput.requestsPerSecond.toFixed(1) + ' rps',
            blockRate: data.metrics.errorRates.blockRate.toFixed(1) + '%',
            collectionTime: data.collectionTime + 'ms'
        });
    });
    metricsService.on('alertCreated', (alert) => {
        console.log('🚨 Alert created:', {
            condition: alert.condition,
            severity: alert.severity,
            currentValue: alert.currentValue,
            threshold: alert.threshold
        });
    });
    // Simulate some traffic
    setTimeout(() => {
        console.log('Simulating traffic...');
        simulateTraffic(rateLimitingService);
    }, 2000);
    return metricsService;
}
// ========================================
// Example 2: React Dashboard Integration
// ========================================
export function RateLimitingDashboardExample() {
    // Rate limiting service instance
    const [rateLimitingService] = useState(() => new RateLimitingService());
    // Throttling engine with analytics enabled
    const [throttlingEngine] = useState(() => new AdaptiveThrottlingRulesEngine(rateLimitingService, true, { enableAnalytics: true }));
    // Use the custom hook for metrics management
    const metricsHook = useRateLimitingMetrics({
        rateLimitingService,
        throttlingEngine,
        options: {
            autoRefresh: true,
            refreshInterval: 3,
            timeRange: '1h',
            enableAlerts: true,
            retainHistoryHours: 48
        }
    });
    // Simulate traffic on component mount
    useEffect(() => {
        const trafficTimer = setInterval(() => {
            simulateTraffic(rateLimitingService);
        }, 1000);
        return () => clearInterval(trafficTimer);
    }, [rateLimitingService]);
    if (metricsHook.error) {
        return (_jsxs("div", { className: "p-8 bg-red-50 dark:bg-red-900/20 rounded-lg", children: [_jsx("h2", { className: "text-lg font-semibold text-red-800 dark:text-red-200 mb-2", children: "Metrics Error" }), _jsx("p", { className: "text-red-700 dark:text-red-300", children: metricsHook.error }), _jsx("button", { onClick: metricsHook.clearError, className: "mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm", children: "Clear Error" })] }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-gray-50 dark:bg-gray-900", children: [_jsx("div", { className: "bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700", children: _jsx("div", { className: "max-w-7xl mx-auto px-6 py-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: "Security Analytics Platform" }), _jsx("p", { className: "text-gray-600 dark:text-gray-400", children: "Rate Limiting Performance Monitoring" })] }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("div", { className: `inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${metricsHook.systemStatus === 'healthy' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                                            metricsHook.systemStatus === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                                                'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'}`, children: [_jsx("div", { className: `w-2 h-2 rounded-full mr-2 ${metricsHook.systemStatus === 'healthy' ? 'bg-green-500' :
                                                    metricsHook.systemStatus === 'warning' ? 'bg-yellow-500' :
                                                        'bg-red-500'}` }), metricsHook.systemStatus.charAt(0).toUpperCase() + metricsHook.systemStatus.slice(1)] }), metricsHook.isConnected && (_jsx("div", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Connected" }))] })] }) }) }), _jsx(RateLimitingMetricsDashboard, { metricsService: new RateLimitingPerformanceMetrics(rateLimitingService, throttlingEngine), theme: "light", autoRefresh: true, refreshInterval: 3 })] }));
}
;
// ========================================
// Example 3: Advanced Visualization Features
// ========================================
export function AdvancedVisualizationExample() {
    console.log('=== Advanced Visualization Features Example ===');
    const rateLimitingService = new RateLimitingService();
    const throttlingEngine = new AdaptiveThrottlingRulesEngine(rateLimitingService, true, { enableAnalytics: true });
    const metricsService = new RateLimitingPerformanceMetrics(rateLimitingService, throttlingEngine, {
        enableRealTimeMetrics: true,
        visualizationOptions: {
            enableCharts: true,
            enableHeatmaps: true,
            enableTimeseries: true,
            enableGeospatialMaps: true,
            refreshInterval: 2
        }
    });
    // Start metrics collection
    metricsService.startMetricsCollection();
    // Demonstrate visualization data generation
    console.log('Generating visualization data...');
    setTimeout(() => {
        // Get time series data
        const timeSeriesData = metricsService.generateTimeSeriesData('1h');
        console.log('📈 Time Series Data:', {
            dataPoints: timeSeriesData.timestamps.length,
            avgResponseTime: timeSeriesData.responseTime.reduce((a, b) => a + b, 0) / timeSeriesData.responseTime.length,
            avgThroughput: timeSeriesData.throughput.reduce((a, b) => a + b, 0) / timeSeriesData.throughput.length
        });
        // Get heatmap data
        const heatmapData = metricsService.generateHeatmapData();
        console.log('🔥 Heatmap Data:', {
            endpoints: heatmapData.endpoints.length,
            timeSlots: heatmapData.timeSlots.length,
            totalDataPoints: heatmapData.activityMatrix.length * heatmapData.activityMatrix[0].length
        });
        // Get geospatial data
        const geoData = metricsService.generateGeospatialData();
        console.log('🌍 Geospatial Data:', {
            locations: geoData.locations.length,
            totalRequests: geoData.locations.reduce((sum, loc) => sum + loc.requestCount, 0),
            totalBlocks: geoData.locations.reduce((sum, loc) => sum + loc.blockCount, 0)
        });
        // Get distribution data
        const distributionData = metricsService.generateDistributionData();
        console.log('📊 Distribution Data:', {
            endpoints: Object.keys(distributionData.endpointDistribution).length,
            threatLevels: Object.keys(distributionData.threatLevelDistribution).length,
            responseTimeRanges: distributionData.responseTimeDistribution.length,
            userAgents: Object.keys(distributionData.userAgentDistribution).length
        });
        // Get complete visualization data
        console.log('🎯 Complete Visualization Data Generated');
    }, 3000);
    return metricsService;
}
// ========================================
// Example 4: Custom Widget Creation
// ========================================
export function CustomWidgetExample() {
    console.log('=== Custom Widget Creation Example ===');
    const rateLimitingService = new RateLimitingService();
    const metricsService = new RateLimitingPerformanceMetrics(rateLimitingService);
    // Create custom widgets
    const customWidgets = [
        {
            widgetId: 'security-overview',
            widgetType: 'chart',
            title: 'Security Overview',
            description: 'Real-time security metrics overview',
            dataSource: 'current',
            refreshInterval: 1,
            config: {
                chartType: 'gauge',
                metrics: ['threatLevel', 'blockRate']
            },
            position: { x: 0, y: 0, width: 4, height: 4 }
        },
        {
            widgetId: 'endpoint-performance',
            widgetType: 'table',
            title: 'Endpoint Performance',
            description: 'Performance metrics by endpoint',
            dataSource: 'distribution',
            refreshInterval: 10,
            config: {
                metrics: ['endpointDistribution'],
                dimensions: ['endpoint', 'requests', 'responseTime']
            },
            position: { x: 4, y: 0, width: 8, height: 6 }
        },
        {
            widgetId: 'threat-timeline',
            widgetType: 'chart',
            title: 'Threat Activity Timeline',
            description: 'Historical threat activity over time',
            dataSource: 'timeseries',
            refreshInterval: 30,
            config: {
                chartType: 'area',
                timeRange: '24h',
                metrics: ['blockRate', 'errorRate']
            },
            position: { x: 0, y: 4, width: 12, height: 6 }
        }
    ];
    // Add custom widgets
    customWidgets.forEach(widget => {
        metricsService.addWidget(widget);
        console.log(`✅ Added custom widget: ${widget.title}`);
    });
    // List all widgets
    const allWidgets = metricsService.getWidgets();
    console.log('📋 Total widgets configured:', allWidgets.length);
    // Get widget data
    setTimeout(() => {
        customWidgets.forEach(widget => {
            const widgetData = metricsService.getWidgetData(widget.widgetId);
            console.log(`📊 Widget "${widget.title}" data:`, widgetData ? 'Available' : 'No data');
        });
    }, 2000);
    return metricsService;
}
// ========================================
// Example 5: Alert Management System
// ========================================
export function AlertManagementExample() {
    console.log('=== Alert Management System Example ===');
    const rateLimitingService = new RateLimitingService();
    const metricsService = new RateLimitingPerformanceMetrics(rateLimitingService, undefined, {
        alerting: {
            enableAlerts: true,
            alertThresholds: {
                highResponseTime: 100, // Low threshold for demo
                lowThroughput: 10,
                highErrorRate: 5,
                highBlockRate: 15
            }
        }
    });
    // Set up alert event listeners
    metricsService.on('alertCreated', (alert) => {
        console.log('🚨 ALERT CREATED:', {
            id: alert.alertId,
            type: alert.alertType,
            severity: alert.severity,
            condition: alert.condition,
            current: alert.currentValue,
            threshold: alert.threshold,
            recommendations: alert.recommendedActions
        });
    });
    metricsService.on('alertAcknowledged', (data) => {
        console.log('✅ Alert acknowledged:', data.alertId);
    });
    // Start monitoring
    metricsService.startMetricsCollection();
    // Simulate high load to trigger alerts
    setTimeout(() => {
        console.log('Simulating high load to trigger alerts...');
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                simulateTraffic(rateLimitingService, true); // High volume
            }, i * 100);
        }
        // Check alerts after simulation
        setTimeout(() => {
            const activeAlerts = metricsService.getActiveAlerts();
            console.log(`📊 Active alerts: ${activeAlerts.length}`);
            activeAlerts.forEach((alert, index) => {
                console.log(`Alert ${index + 1}:`, {
                    condition: alert.condition,
                    severity: alert.severity,
                    timestamp: alert.timestamp.toLocaleString()
                });
                // Acknowledge alert after 5 seconds
                setTimeout(() => {
                    metricsService.acknowledgeAlert(alert.alertId);
                }, 5000 + (index * 1000));
            });
        }, 3000);
    }, 2000);
    return metricsService;
}
// ========================================
// Example 6: Data Export and Analysis
// ========================================
export function DataExportExample() {
    console.log('=== Data Export and Analysis Example ===');
    const rateLimitingService = new RateLimitingService();
    const metricsService = new RateLimitingPerformanceMetrics(rateLimitingService);
    // Start metrics collection
    metricsService.startMetricsCollection();
    // Generate some data first
    for (let i = 0; i < 10; i++) {
        setTimeout(() => {
            simulateTraffic(rateLimitingService);
        }, i * 200);
    }
    // Export data after collection
    setTimeout(() => {
        console.log('Exporting metrics data...');
        // Export as JSON
        const jsonExport = metricsService.exportMetrics('json');
        const jsonData = JSON.parse(jsonExport);
        console.log('📄 JSON Export:', {
            metricsCount: jsonData.metricsCount,
            timeRange: jsonData.timeRange,
            alertsCount: jsonData.alerts.length,
            configurationKeys: Object.keys(jsonData.configuration)
        });
        // Export as CSV
        const csvExport = metricsService.exportMetrics('csv');
        const csvLines = csvExport.split('\n');
        console.log('📊 CSV Export:', {
            headers: csvLines[0],
            dataRows: csvLines.length - 1,
            sampleRow: csvLines[1]
        });
        // Get system status
        const systemStatus = metricsService.getSystemStatus();
        console.log('🔍 System Status:', {
            status: systemStatus.status,
            uptime: `${Math.round(systemStatus.uptime / 1000)}s`,
            metricsCollected: systemStatus.systemInfo.metricsCollected,
            activeAlerts: systemStatus.alerts.length
        });
    }, 3000);
    return metricsService;
}
// ========================================
// Traffic Simulation Utility
// ========================================
function simulateTraffic(rateLimitingService, highVolume = false) {
    const endpoints = ['/auth/login', '/auth/register', '/auth/mfa/verify', '/api/users', '/api/data'];
    const userAgents = ['Chrome', 'Firefox', 'Safari', 'Bot'];
    const ips = ['192.168.1.100', '10.0.0.50', '203.0.113.1', '198.51.100.1'];
    const requestCount = highVolume ? 50 : 10;
    for (let i = 0; i < requestCount; i++) {
        const ip = ips[Math.floor(Math.random() * ips.length)];
        const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
        const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
        const success = Math.random() > (highVolume ? 0.3 : 0.1); // Higher failure rate for high volume
        // Check rate limit
        rateLimitingService.checkRateLimit(ip, endpoint, {
            userAgent,
            userId: success ? `user_${Math.floor(Math.random() * 1000)}` : undefined
        });
        // Record attempt
        rateLimitingService.recordAttempt(ip, endpoint, success, {
            userAgent,
            userId: success ? `user_${Math.floor(Math.random() * 1000)}` : undefined
        });
    }
}
// ========================================
// Example Usage Functions
// ========================================
export function runAllExamples() {
    console.log('🚀 Running all Rate Limiting Performance Metrics examples...\n');
    // Run examples with delays to avoid interference
    const examples = [
        { name: 'Basic Metrics', fn: BasicMetricsExample, delay: 0 },
        { name: 'Advanced Visualization', fn: AdvancedVisualizationExample, delay: 5000 },
        { name: 'Custom Widgets', fn: CustomWidgetExample, delay: 10000 },
        { name: 'Alert Management', fn: AlertManagementExample, delay: 15000 },
        { name: 'Data Export', fn: DataExportExample, delay: 20000 }
    ];
    const services = [];
    examples.forEach(({ name, fn, delay }) => {
        setTimeout(() => {
            console.log(`\n--- Starting ${name} Example ---`);
            try {
                const service = fn();
                if (service) {
                    services.push(service);
                }
            }
            catch (error) {
                console.error(`Error in ${name} example:`, error);
            }
        }, delay);
    });
    // Cleanup after all examples
    setTimeout(() => {
        console.log('\n🧹 Cleaning up examples...');
        services.forEach(service => {
            try {
                service.destroy();
            }
            catch (error) {
                console.error('Error during cleanup:', error);
            }
        });
        console.log('✅ All examples completed and cleaned up');
    }, 30000);
}
// Export all examples for individual use
export { simulateTraffic };
// Run examples if this file is executed directly
if (typeof window === 'undefined' && require.main === module) {
    runAllExamples();
}
