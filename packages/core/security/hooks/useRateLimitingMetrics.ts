/**
 * React Hook for Rate Limiting Performance Metrics
 * Task: E31-1753313263525-EEFACB - Build API rate limiting performance metrics visualization
 * Epic 31: Security Intelligence Platform
 * 
 * Custom React hook for managing rate limiting performance metrics,
 * providing real-time data updates and dashboard state management.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  RateLimitingPerformanceMetrics,
  PerformanceMetrics,
  MetricsVisualizationData,
  AlertCondition,
  DashboardWidget
} from '../RateLimitingPerformanceMetrics';
import { RateLimitingService } from '../RateLimitingService';
import { AdaptiveThrottlingRulesEngine } from '../AdaptiveThrottlingRules';

// ========================================
// Hook Types and Interfaces
// ========================================

export interface UseRateLimitingMetricsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // seconds,
  timeRange?: string;
  enableAlerts?: boolean;
  retainHistoryHours?: number;
}
export interface MetricsHookReturn {
  // Data
  currentMetrics: PerformanceMetrics | null;
  visualizationData: MetricsVisualizationData | null;
  activeAlerts: AlertCondition;
  widgets: DashboardWidget;
  // Status
  isLoading: boolean;
  isConnected: boolean;
  lastUpdate: Date | null;
  systemStatus: 'healthy' | 'warning' | 'critical';
  // Actions
  refreshMetrics: () => Promise<void>;
  exportMetrics: (format: 'json' | 'csv') => string;
  acknowledgeAlert: (alertId: string) => void;
  addWidget: (widget: DashboardWidget) => void;
  removeWidget: (widgetId: string) => void;
  updateTimeRange: (range: string) => void;
  // Control
  startMonitoring: () => void;
  stopMonitoring: () => void;
  // Error handling
  error: string | null;
  clearError: () => void;
}
export interface MetricsServiceConfig {
  rateLimitingService: RateLimitingService;
  throttlingEngine?: AdaptiveThrottlingRulesEngine;
  options?: UseRateLimitingMetricsOptions;
  // ========================================
  // Custom Hook Implementation
  // ========================================
}
export const useRateLimitingMetrics = ({)
  rateLimitingService,
  throttlingEngine,
  options = {}
}: MetricsServiceConfig): MetricsHookReturn => {
  // Default options
  const {
    autoRefresh = true,
    refreshInterval = 5,
    timeRange = '1h',
    enableAlerts = true,
    retainHistoryHours = 72
  } = options;
  // Refs for cleanup and persistence
  const metricsServiceRef = useRef<RateLimitingPerformanceMetrics | null>(null);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef<boolean>(true);
  // State management
  const [currentMetrics, setCurrentMetrics] = useState<PerformanceMetrics | null>(null);
  const [visualizationData, setVisualizationData] = useState<MetricsVisualizationData | null>(null);
  const [activeAlerts, setActiveAlerts] = useState<AlertCondition>([]);
  const [widgets, setWidgets] = useState<DashboardWidget>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>(timeRange);
  const [error, setError] = useState<string | null>(null);
  // ========================================
  // Metrics Service Initialization
  // ========================================
  const initializeMetricsService = useCallback(() => {
  try {
  if (metricsServiceRef.current) {
  metricsServiceRef.current.destroy();
  metricsServiceRef.current = new RateLimitingPerformanceMetrics()
  rateLimitingService,
  throttlingEngine,
  {
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
  highBlockRate: 25);
  setIsConnected(true);
  setWidgets(metricsServiceRef.current.getWidgets());
  setError(null);
  return metricsServiceRef.current;
} catch (err) {
  const errorMessage = err instanceof Error ? err.message : 'Failed to initialize metrics service';
  setError(errorMessage);
  setIsConnected(false);
  return null;
}, [rateLimitingService, throttlingEngine, autoRefresh, refreshInterval, enableAlerts, retainHistoryHours]);
  // ========================================
  // Data Loading Functions
  // ========================================
  const loadMetricsData = useCallback(async () => {
    if (!metricsServiceRef.current || !mountedRef.current) return;
    try {
      setIsLoading(true);
      setError(null);
      // Get system status and current metrics
      const systemStatus = metricsServiceRef.current.getSystemStatus();
      if (mountedRef.current) {
        setCurrentMetrics(systemStatus.metrics);
        setActiveAlerts(systemStatus.alerts);
      // Get visualization data
      const vizData = metricsServiceRef.current.getVisualizationData(selectedTimeRange);
      if (mountedRef.current) {
        setVisualizationData(vizData);
        setLastUpdate(new Date());
    } catch (err) {
  const errorMessage = err instanceof Error ? err.message : 'Failed to load metrics data';
  if (mountedRef.current) {
  setError(errorMessage);
} finally {
      if (mountedRef.current) {
        setIsLoading(false);
  }, [selectedTimeRange]);
  const refreshMetrics = useCallback(async () => {
    await loadMetricsData();
  }, [loadMetricsData]);
  // ========================================
  // Auto-refresh Management
  // ========================================
  const startMonitoring = useCallback(() => {
    if (!metricsServiceRef.current) return;
    // Start metrics collection in the service
    metricsServiceRef.current.startMetricsCollection();
    // Set up refresh timer
    loadMetricsData();
    if (autoRefresh && refreshInterval > 0) {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = setInterval(() => {
        if (mountedRef.current) {
          loadMetricsData();
      }, refreshInterval * 1000);
    setIsConnected(true);
  }, [loadMetricsData, autoRefresh, refreshInterval]);
  const stopMonitoring = useCallback(() => {
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
    if (metricsServiceRef.current) {
      metricsServiceRef.current.stopMetricsCollection();
    setIsConnected(false);
  }, []);
  // ========================================
  // Event Handlers
  // ========================================
  const setupEventListeners = useCallback((service: RateLimitingPerformanceMetrics) => {
    const handleMetricsUpdate = () => {
      if (mountedRef.current) {
        loadMetricsData();
    };
    const handleAlertCreated = (alert: AlertCondition) => {
      if (mountedRef.current) {
        setActiveAlerts(prev => [...prev, alert]);
    };
    const handleAlertAcknowledged = (data: { alertId: string }) => {
      if (mountedRef.current) {
        setActiveAlerts(prev => prev.filter(alert => alert.alertId !== data.alertId));
    };
    const handleWidgetAdded = () => {
      if (mountedRef.current && metricsServiceRef.current) {
        setWidgets(metricsServiceRef.current.getWidgets());
    };
    const handleWidgetRemoved = () => {
      if (mountedRef.current && metricsServiceRef.current) {
        setWidgets(metricsServiceRef.current.getWidgets());
    };
    const handleError = (errorData: { error: any }) => {
  if (mountedRef.current) {
  const errorMessage = errorData.error instanceof Error ? ;
  errorData.error.message : 'Metrics collection error';
  setError(errorMessage);
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
  const addWidget = useCallback((widget: DashboardWidget) => {
    if (metricsServiceRef.current) {
      metricsServiceRef.current.addWidget(widget);
      setWidgets(metricsServiceRef.current.getWidgets());
  }, []);
  const removeWidget = useCallback((widgetId: string) => {
    if (metricsServiceRef.current) {
      metricsServiceRef.current.removeWidget(widgetId);
      setWidgets(metricsServiceRef.current.getWidgets());
  }, []);
  // ========================================
  // Alert Management
  // ========================================
  const acknowledgeAlert = useCallback((alertId: string) => {
    if (metricsServiceRef.current) {
      metricsServiceRef.current.acknowledgeAlert(alertId);
      setActiveAlerts(prev => prev.filter(alert => alert.alertId !== alertId));
  }, []);
  // ========================================
  // Data Export
  // ========================================
  const exportMetrics = useCallback((format: 'json' | 'csv'): string => {
    if (!metricsServiceRef.current) {
      throw new Error('Metrics service not initialized');
    return metricsServiceRef.current.exportMetrics(format);
  }, []);
  // ========================================
  // Time Range Management
  // ========================================
  const updateTimeRange = useCallback((range: string) => {
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
  const systemStatus = useCallback((): 'healthy' | 'warning' | 'critical' => {
    if (!isConnected || error) return 'critical';
    if (activeAlerts.length === 0) return 'healthy';
    if (activeAlerts.length < 3) return 'warning';
    return 'critical'
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
  }, [initializeMetricsService, setupEventListeners, startMonitoring, stopMonitoring]);
  // Handle time range changes
  useEffect(() => {
    if (isConnected) {
      loadMetricsData();
  }, [selectedTimeRange, loadMetricsData, isConnected]);
  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      if (metricsServiceRef.current) {
        metricsServiceRef.current.destroy();
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

export function useRateLimitingMetricsWidget(widgetId: string, metricsHook: unknown) {
  const [widgetData, setWidgetData] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  useEffect(() => {
  const widget = (metricsHook as any).widgets.find(w => w.widgetId === widgetId);
  if (!widget) {
  setWidgetData(null);
  setIsLoading(false);
  return;
  setIsLoading(true);
  // Simulate async data loading
  const loadWidgetData = () => {
  try {
  let data = null;
  switch (widget.dataSource) {
  case 'timeseries':,
  data = metricsHook.visualizationData?.timeSeriesData;
  break;
  case 'heatmap':,
  data = metricsHook.visualizationData?.heatmapData;
  break;
  case 'geospatial':,
  data = metricsHook.visualizationData?.geospatialData;
  break;
  case 'distribution':,
  data = metricsHook.visualizationData?.distributionData;
  break;
  case 'current':,
  data = metricsHook.currentMetrics;
  break;
  default:,
  data = null;
  setWidgetData(data);
} catch (error) {
  console.error('Error loading widget data:', error);
  setWidgetData(null);
} finally {
        setIsLoading(false);
    };
    loadWidgetData();
  }, [metricsHook.visualizationData, metricsHook.currentMetrics, widgetId, metricsHook.widgets]);
  return { data: widgetData, isLoading };
};

export default useRateLimitingMetrics;