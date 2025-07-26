/**
 * React Hook for Rate Limiting Performance Metrics
 * Task: E31-1753313263525-EEFACB - Build API rate limiting performance metrics visualization
 * Epic 31: Security Intelligence Platform
 *
 * Custom React hook for managing rate limiting performance metrics,
 * providing real-time data updates and dashboard state management.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { RateLimitingPerformanceMetrics } from '../RateLimitingPerformanceMetrics';
// ========================================
// Custom Hook Implementation
// ========================================
export const useRateLimitingMetrics = ({ rateLimitingService, throttlingEngine, options = {} }) => {
    // Default options
    const { autoRefresh = true, refreshInterval = 5, timeRange = '1h', enableAlerts = true, retainHistoryHours = 72 } = options;
    // Refs for cleanup and persistence
    const metricsServiceRef = useRef(null);
    const refreshTimerRef = useRef(null);
    const mountedRef = useRef(true);
    // State management
    const [currentMetrics, setCurrentMetrics] = useState(null);
    const [visualizationData, setVisualizationData] = useState(null);
    const [activeAlerts, setActiveAlerts] = useState([]);
    const [widgets, setWidgets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isConnected, setIsConnected] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
    const [error, setError] = useState(null);
    // ========================================
    // Metrics Service Initialization
    // ========================================
    const initializeMetricsService = useCallback(() => {
        try {
            if (metricsServiceRef.current) {
                metricsServiceRef.current.destroy();
            }
            metricsServiceRef.current = new RateLimitingPerformanceMetrics(rateLimitingService, throttlingEngine, {
                enableRealTimeMetrics: autoRefresh,
                metricsRetentionPeriod: retainHistoryHours,
                visualizationOptions: {
                    enableCharts: true,
                    enableHeatmaps: true,
                    enableTimeseries: true,
                    enableGeospatialMaps: true,
                    refreshInterval
                },
                alerting: {
                    enableAlerts,
                    alertThresholds: {
                        highResponseTime: 200,
                        lowThroughput: 100,
                        highErrorRate: 10,
                        highBlockRate: 25
                    }
                }
            });
            setIsConnected(true);
            setWidgets(metricsServiceRef.current.getWidgets());
            setError(null);
            return metricsServiceRef.current;
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to initialize metrics service';
            setError(errorMessage);
            setIsConnected(false);
            return null;
        }
    }, [rateLimitingService, throttlingEngine, autoRefresh, refreshInterval, enableAlerts, retainHistoryHours]);
    // ========================================
    // Data Loading Functions
    // ========================================
    const loadMetricsData = useCallback(async () => {
        if (!metricsServiceRef.current || !mountedRef.current)
            return;
        try {
            setIsLoading(true);
            setError(null);
            // Get system status and current metrics
            const systemStatus = metricsServiceRef.current.getSystemStatus();
            if (mountedRef.current) {
                setCurrentMetrics(systemStatus.metrics);
                setActiveAlerts(systemStatus.alerts);
            }
            // Get visualization data
            const vizData = metricsServiceRef.current.getVisualizationData(selectedTimeRange);
            if (mountedRef.current) {
                setVisualizationData(vizData);
                setLastUpdate(new Date());
            }
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load metrics data';
            if (mountedRef.current) {
                setError(errorMessage);
            }
        }
        finally {
            if (mountedRef.current) {
                setIsLoading(false);
            }
        }
    }, [selectedTimeRange]);
    const refreshMetrics = useCallback(async () => {
        await loadMetricsData();
    }, [loadMetricsData]);
    // ========================================
    // Auto-refresh Management
    // ========================================
    const startMonitoring = useCallback(() => {
        if (!metricsServiceRef.current)
            return;
        // Start metrics collection in the service
        metricsServiceRef.current.startMetricsCollection();
        // Set up refresh timer
        loadMetricsData();
        if (autoRefresh && refreshInterval > 0) {
            if (refreshTimerRef.current) {
                clearInterval(refreshTimerRef.current);
            }
            refreshTimerRef.current = setInterval(() => {
                if (mountedRef.current) {
                    loadMetricsData();
                }
            }, refreshInterval * 1000);
        }
        setIsConnected(true);
    }, [loadMetricsData, autoRefresh, refreshInterval]);
    const stopMonitoring = useCallback(() => {
        if (refreshTimerRef.current) {
            clearInterval(refreshTimerRef.current);
            refreshTimerRef.current = null;
        }
        if (metricsServiceRef.current) {
            metricsServiceRef.current.stopMetricsCollection();
        }
        setIsConnected(false);
    }, []);
    // ========================================
    // Event Handlers
    // ========================================
    const setupEventListeners = useCallback((service) => {
        const handleMetricsUpdate = () => {
            if (mountedRef.current) {
                loadMetricsData();
            }
        };
        const handleAlertCreated = (alert) => {
            if (mountedRef.current) {
                setActiveAlerts(prev => [...prev, alert]);
            }
        };
        const handleAlertAcknowledged = (data) => {
            if (mountedRef.current) {
                setActiveAlerts(prev => prev.filter(alert => alert.alertId !== data.alertId));
            }
        };
        const handleWidgetAdded = () => {
            if (mountedRef.current && metricsServiceRef.current) {
                setWidgets(metricsServiceRef.current.getWidgets());
            }
        };
        const handleWidgetRemoved = () => {
            if (mountedRef.current && metricsServiceRef.current) {
                setWidgets(metricsServiceRef.current.getWidgets());
            }
        };
        const handleError = (errorData) => {
            if (mountedRef.current) {
                const errorMessage = errorData.error instanceof Error ?
                    errorData.error.message : 'Metrics collection error';
                setError(errorMessage);
            }
        };
        // Attach event listeners
        service.on('metricsUpdated', handleMetricsUpdate);
        service.on('alertCreated', handleAlertCreated);
        service.on('alertAcknowledged', handleAlertAcknowledged);
        service.on('widgetAdded', handleWidgetAdded);
        service.on('widgetRemoved', handleWidgetRemoved);
        service.on('metricsCollectionError', handleError);
        // Return cleanup function
        return () => {
            service.off('metricsUpdated', handleMetricsUpdate);
            service.off('alertCreated', handleAlertCreated);
            service.off('alertAcknowledged', handleAlertAcknowledged);
            service.off('widgetAdded', handleWidgetAdded);
            service.off('widgetRemoved', handleWidgetRemoved);
            service.off('metricsCollectionError', handleError);
        };
    }, [loadMetricsData]);
    // ========================================
    // Widget Management
    // ========================================
    const addWidget = useCallback((widget) => {
        if (metricsServiceRef.current) {
            metricsServiceRef.current.addWidget(widget);
            setWidgets(metricsServiceRef.current.getWidgets());
        }
    }, []);
    const removeWidget = useCallback((widgetId) => {
        if (metricsServiceRef.current) {
            metricsServiceRef.current.removeWidget(widgetId);
            setWidgets(metricsServiceRef.current.getWidgets());
        }
    }, []);
    // ========================================
    // Alert Management
    // ========================================
    const acknowledgeAlert = useCallback((alertId) => {
        if (metricsServiceRef.current) {
            metricsServiceRef.current.acknowledgeAlert(alertId);
            setActiveAlerts(prev => prev.filter(alert => alert.alertId !== alertId));
        }
    }, []);
    // ========================================
    // Data Export
    // ========================================
    const exportMetrics = useCallback((format) => {
        if (!metricsServiceRef.current) {
            throw new Error('Metrics service not initialized');
        }
        return metricsServiceRef.current.exportMetrics(format);
    }, []);
    // ========================================
    // Time Range Management
    // ========================================
    const updateTimeRange = useCallback((range) => {
        setSelectedTimeRange(range);
    }, []);
    // ========================================
    // Error Handling
    // ========================================
    const clearError = useCallback(() => {
        setError(null);
    }, []);
    // ========================================
    // Computed Values
    // ========================================
    const systemStatus = useCallback(() => {
        if (!isConnected || error)
            return 'critical';
        if (activeAlerts.length === 0)
            return 'healthy';
        if (activeAlerts.length < 3)
            return 'warning';
        return 'critical';
    }, [isConnected, error, activeAlerts.length])();
    // ========================================
    // Effects
    // ========================================
    // Initialize metrics service
    useEffect(() => {
        const service = initializeMetricsService();
        if (service) {
            const cleanup = setupEventListeners(service);
            startMonitoring();
            return () => {
                cleanup();
                stopMonitoring();
            };
        }
    }, [initializeMetricsService, setupEventListeners, startMonitoring, stopMonitoring]);
    // Handle time range changes
    useEffect(() => {
        if (isConnected) {
            loadMetricsData();
        }
    }, [selectedTimeRange, loadMetricsData, isConnected]);
    // Cleanup on unmount
    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
            if (refreshTimerRef.current) {
                clearInterval(refreshTimerRef.current);
            }
            if (metricsServiceRef.current) {
                metricsServiceRef.current.destroy();
            }
        };
    }, []);
    // ========================================
    // Return Hook Interface
    // ========================================
    return {
        // Data
        currentMetrics,
        visualizationData,
        activeAlerts,
        widgets,
        // Status
        isLoading,
        isConnected,
        lastUpdate,
        systemStatus,
        // Actions
        refreshMetrics,
        exportMetrics,
        acknowledgeAlert,
        addWidget,
        removeWidget,
        updateTimeRange,
        // Control
        startMonitoring,
        stopMonitoring,
        // Error handling
        error,
        clearError
    };
};
// ========================================
// Utility Hook for Widget Data
// ========================================
export const [isLoading, setIsLoading] = useState(true);
useEffect(() => {
    const widget = metricsHook.widgets.find(w => w.widgetId === widgetId);
    if (!widget) {
        setWidgetData(null);
        setIsLoading(false);
        return;
    }
    setIsLoading(true);
    // Simulate async data loading
    const loadWidgetData = () => {
        try {
            let data = null;
            switch (widget.dataSource) {
                case 'timeseries':
                    data = metricsHook.visualizationData?.timeSeriesData;
                    break;
                case 'heatmap':
                    data = metricsHook.visualizationData?.heatmapData;
                    break;
                case 'geospatial':
                    data = metricsHook.visualizationData?.geospatialData;
                    break;
                case 'distribution':
                    data = metricsHook.visualizationData?.distributionData;
                    break;
                case 'current':
                    data = metricsHook.currentMetrics;
                    break;
                default:
                    data = null;
            }
            setWidgetData(data);
        }
        catch (error) {
            console.error('Error loading widget data:', error);
            setWidgetData(null);
        }
        finally {
            setIsLoading(false);
        }
    };
    loadWidgetData();
}, [metricsHook.visualizationData, metricsHook.currentMetrics, widgetId, metricsHook.widgets]);
return { data: widgetData, isLoading };
;
export default useRateLimitingMetrics;
