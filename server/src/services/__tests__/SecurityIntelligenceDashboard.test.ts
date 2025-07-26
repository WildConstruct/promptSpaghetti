/**
 * SecurityIntelligenceDashboard Test Suite
 * Epic 31.4.1.3 - Create security intelligence dashboard and analysis
 */

import { 
  SecurityIntelligenceDashboard,
  SecurityIntelligenceDashboardConfig,
  DashboardWidget,
  DashboardWidgetType,
  DashboardFilter,
  FilterType,
  FilterOperator
} from '../SecurityIntelligenceDashboard';
import { SecurityIntelligenceDataPipeline } from '../SecurityIntelligenceDataPipeline';
import { AnalyticsCollector } from '../../analytics/AnalyticsCollector';
import { AnalyticsDAO } from '../../database/analytics-dao';
import { PerformanceMonitoringService } from '../../analytics/PerformanceMonitoringService';
import { DiagnosticService } from '../../admin/DiagnosticService';
import { HealthCheckFramework } from '../../admin/HealthCheckFramework';

// Mock dependencies
jest.mock('../SecurityIntelligenceDataPipeline');
jest.mock('../../analytics/AnalyticsCollector');
jest.mock('../../database/analytics-dao');
jest.mock('../../analytics/PerformanceMonitoringService');
jest.mock('../../admin/DiagnosticService');
jest.mock('../../admin/HealthCheckFramework');

describe('SecurityIntelligenceDashboard', () => {
  let dashboard: SecurityIntelligenceDashboard;
  let mockDataPipeline: jest.Mocked<SecurityIntelligenceDataPipeline>;
  let mockAnalyticsCollector: jest.Mocked<AnalyticsCollector>;
  let mockAnalyticsDAO: jest.Mocked<AnalyticsDAO>;
  let mockPerformanceMonitoringService: jest.Mocked<PerformanceMonitoringService>;
  let mockDiagnosticService: jest.Mocked<DiagnosticService>;
  let mockHealthCheckFramework: jest.Mocked<HealthCheckFramework>;
  let testConfig: SecurityIntelligenceDashboardConfig;

  beforeEach(() => {
    // Setup mocks
    mockDataPipeline = new SecurityIntelligenceDataPipeline(
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any
    ) as jest.Mocked<SecurityIntelligenceDataPipeline>;
    mockAnalyticsCollector = new AnalyticsCollector({} as any) as jest.Mocked<AnalyticsCollector>;
    mockAnalyticsDAO = new AnalyticsDAO('') as jest.Mocked<AnalyticsDAO>;
    mockPerformanceMonitoringService = new PerformanceMonitoringService(
      {} as any,
      {} as any,
      {} as any
    ) as jest.Mocked<PerformanceMonitoringService>;
    mockDiagnosticService = new DiagnosticService() as jest.Mocked<DiagnosticService>;
    mockHealthCheckFramework = new HealthCheckFramework() as jest.Mocked<HealthCheckFramework>;

    // Mock data pipeline
    mockDataPipeline.on = jest.fn<unknown[], unknown>();
    mockDataPipeline.emit = jest.fn<unknown[], unknown>();

    // Mock analytics collector
    mockAnalyticsCollector.track = jest.fn<unknown[], unknown>().mockResolvedValue(undefined as unknown);

    // Mock analytics DAO
    mockAnalyticsDAO.insertEvent = jest.fn<unknown[], unknown>().mockResolvedValue(undefined as unknown);

    // Mock performance monitoring service
    mockPerformanceMonitoringService.recordMetric = jest.fn<unknown[], unknown>().mockResolvedValue(undefined as unknown);

    // Mock diagnostic service
    mockDiagnosticService.registerDiagnostic = jest.fn<unknown[], unknown>().mockResolvedValue(undefined as unknown);

    // Mock health check framework
    mockHealthCheckFramework.registerHealthCheck = jest.fn<unknown[], unknown>().mockResolvedValue(undefined as unknown);

    // Test configuration
    testConfig = {
      dashboard: {
        enabled: true,
        refresh_interval_ms: 30000,
        max_dashboard_widgets: 20,
        real_time_updates: true,
        historical_data_retention_days: 90,
        cache_ttl_seconds: 300,
        max_concurrent_dashboards: 100
      },
      analytics: {
        enabled: true,
        aggregation_intervals: [300, 3600, 86400],
        trend_analysis_enabled: true,
        anomaly_detection_enabled: true,
        predictive_analytics_enabled: true,
        correlation_analysis_enabled: true,
        risk_scoring_enabled: true
      },
      visualization: {
        enabled: true,
        chart_types: ['line', 'bar', 'pie', 'heatmap', 'geo'],
        color_schemes: ['default', 'dark', 'high_contrast'],
        interactive_features: true,
        export_formats: ['png', 'pdf', 'csv', 'json'],
        real_time_charts: true,
        geo_mapping_enabled: true
      },
      alerts: {
        enabled: true,
        threshold_based_alerts: true,
        anomaly_based_alerts: true,
        predictive_alerts: true,
        alert_channels: ['email', 'sms', 'webhook'],
        escalation_rules: true,
        auto_acknowledgment: false
      },
      performance: {
        query_timeout_ms: 30000,
        max_data_points: 10000,
        pagination_size: 100,
        cache_optimization: true,
        lazy_loading: true,
        compression_enabled: true
      },
      epic_integration: {
        epic1_analytics_enabled: true,
        epic17_admin_enabled: true,
        cross_epic_dashboards: true,
        unified_navigation: true,
        shared_authentication: true
      }
    };

    dashboard = new SecurityIntelligenceDashboard(
      testConfig,
      mockDataPipeline,
      mockAnalyticsCollector,
      mockAnalyticsDAO,
      mockPerformanceMonitoringService,
      mockDiagnosticService,
      mockHealthCheckFramework
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    test('should initialize dashboard successfully with Epic integrations', async () => {
      await dashboard.initialize();

      expect(mockAnalyticsCollector.track).toHaveBeenCalledWith({
        event: 'security_dashboard_initialization',
        category: 'security_intelligence',
        metadata: expect.objectContaining({
          dashboard_version: '1.0.0',
          integration_type: 'epic1_analytics'
        })
      });

      expect(mockPerformanceMonitoringService.recordMetric).toHaveBeenCalledWith({
        metric_name: 'security_dashboard_startup_time',
        value: expect.any(Number),
        unit: 'milliseconds',
        tags: {
          component: 'security_intelligence_dashboard',
          integration: 'epic1'
        }
      });

      expect(mockHealthCheckFramework.registerHealthCheck).toHaveBeenCalledWith({
        id: 'security_intelligence_dashboard',
        name: 'Security Intelligence Dashboard',
        description: 'Monitors security intelligence dashboard health and performance',
        check: expect.any(Function),
        interval_ms: 30000,
        timeout_ms: 5000,
        critical: true
      });

      expect(mockDiagnosticService.registerDiagnostic).toHaveBeenCalledWith({
        id: 'security_intelligence_dashboard_diagnostics',
        name: 'Security Intelligence Dashboard Diagnostics',
        category: 'security_intelligence',
        collector: expect.any(Function),
        schedule: '*/5 * * * *'
      });
    });

    test('should initialize without Epic integrations when disabled', async () => {
      const configWithoutEpic = {
        ...testConfig,
        epic_integration: {
          epic1_analytics_enabled: false,
          epic17_admin_enabled: false,
          cross_epic_dashboards: false,
          unified_navigation: false,
          shared_authentication: false
        }
      };

      const dashboardWithoutEpic = new SecurityIntelligenceDashboard(
        configWithoutEpic,
        mockDataPipeline,
        mockAnalyticsCollector,
        mockAnalyticsDAO,
        mockPerformanceMonitoringService,
        mockDiagnosticService,
        mockHealthCheckFramework
      );

      await dashboardWithoutEpic.initialize();

      expect(mockAnalyticsCollector.track).not.toHaveBeenCalled();
      expect(mockHealthCheckFramework.registerHealthCheck).not.toHaveBeenCalled();
    });

    test('should setup real-time subscriptions when enabled', async () => {
      await dashboard.initialize();

      expect(mockDataPipeline.on).toHaveBeenCalledWith('security_event_processed', expect.any(Function));
      expect(mockDataPipeline.on).toHaveBeenCalledWith('threat_intelligence_updated', expect.any(Function));
    });
  });

  describe('Dashboard Management', () => {
    beforeEach(async () => {
      await dashboard.initialize();
    });

    test('should create dashboard with valid widgets', async () => {
      const widgets: DashboardWidget[] = [
        {
          id: 'widget_1',
          type: DashboardWidgetType.THREAT_OVERVIEW,
          title: 'Threat Overview',
          description: 'Overview of current threats',
          position: { x: 0, y: 0, z_index: 1 },
          size: { width: 400, height: 300, min_width: 200, min_height: 150, max_width: 800, max_height: 600 },
          data_source: 'security_events',
          query_params: {},
          visualization_config: {
            chart_type: 'line_chart' as any,
            color_scheme: 'default',
            animation_enabled: true,
            interactive_features: [],
            axis_configuration: {
              x_axis: { label: 'Time', scale_type: 'time' as any, format: 'datetime', grid_lines: true },
              y_axis: { label: 'Count', scale_type: 'linear' as any, format: 'number', grid_lines: true }
            },
            legend_configuration: { enabled: true, position: 'right' as any, orientation: 'vertical' as any, max_items: 10 },
            tooltip_configuration: { enabled: true, format: 'default', fields: ['timestamp', 'count'], delay_ms: 500 }
          },
          refresh_rate_ms: 30000,
          filters: [],
          permissions: ['read'],
          created_at: Date.now(),
          updated_at: Date.now()
        }
      ];

      const dashboardId = await dashboard.createDashboard('user_1', 'Test Dashboard', widgets);

      expect(dashboardId).toMatch(/^dashboard_\d+_[a-z0-9]+$/);
      expect(mockAnalyticsCollector.track).toHaveBeenCalledWith({
        event: 'dashboard_created',
        user_id: 'user_1',
        category: 'security_intelligence',
        metadata: {
          dashboard_id: dashboardId,
          dashboard_name: 'Test Dashboard',
          widget_count: 1,
          timestamp: expect.any(Number)
        }
      });
    });

    test('should retrieve dashboard by ID', async () => {
      const widgets: DashboardWidget[] = [
        {
          id: 'widget_1',
          type: DashboardWidgetType.SECURITY_EVENTS_TIMELINE,
          title: 'Security Events Timeline',
          description: 'Timeline of security events',
          position: { x: 0, y: 0, z_index: 1 },
          size: { width: 600, height: 400, min_width: 300, min_height: 200, max_width: 1200, max_height: 800 },
          data_source: 'security_events',
          query_params: {},
          visualization_config: {
            chart_type: 'line_chart' as any,
            color_scheme: 'default',
            animation_enabled: true,
            interactive_features: [],
            axis_configuration: {
              x_axis: { label: 'Time', scale_type: 'time' as any, format: 'datetime', grid_lines: true },
              y_axis: { label: 'Events', scale_type: 'linear' as any, format: 'number', grid_lines: true }
            },
            legend_configuration: { enabled: true, position: 'bottom' as any, orientation: 'horizontal' as any, max_items: 5 },
            tooltip_configuration: { enabled: true, format: 'default', fields: ['timestamp', 'event_count'], delay_ms: 300 }
          },
          refresh_rate_ms: 15000,
          filters: [],
          permissions: ['read', 'write'],
          created_at: Date.now(),
          updated_at: Date.now()
        }
      ];

      const dashboardId = await dashboard.createDashboard('user_1', 'Timeline Dashboard', widgets);
      const retrievedWidgets = await dashboard.getDashboard(dashboardId);

      expect(retrievedWidgets).toEqual(widgets);
    });

    test('should update dashboard widgets', async () => {
      const initialWidgets: DashboardWidget[] = [
        {
          id: 'widget_1',
          type: DashboardWidgetType.THREAT_OVERVIEW,
          title: 'Initial Widget',
          description: 'Initial description',
          position: { x: 0, y: 0, z_index: 1 },
          size: { width: 400, height: 300, min_width: 200, min_height: 150, max_width: 800, max_height: 600 },
          data_source: 'threats',
          query_params: {},
          visualization_config: {
            chart_type: 'pie_chart' as any,
            color_scheme: 'default',
            animation_enabled: false,
            interactive_features: [],
            axis_configuration: {
              x_axis: { label: 'Category', scale_type: 'categorical' as any, format: 'string', grid_lines: false },
              y_axis: { label: 'Count', scale_type: 'linear' as any, format: 'number', grid_lines: true }
            },
            legend_configuration: { enabled: true, position: 'right' as any, orientation: 'vertical' as any, max_items: 10 },
            tooltip_configuration: { enabled: true, format: 'percentage', fields: ['category', 'percentage'], delay_ms: 200 }
          },
          refresh_rate_ms: 60000,
          filters: [],
          permissions: ['read'],
          created_at: Date.now(),
          updated_at: Date.now()
        }
      ];

      const updatedWidgets: DashboardWidget[] = [
        {
          ...initialWidgets[0],
          title: 'Updated Widget',
          description: 'Updated description'
        }
      ];

      const dashboardId = await dashboard.createDashboard('user_1', 'Test Dashboard', initialWidgets);
      await dashboard.updateDashboard(dashboardId, updatedWidgets);

      const retrievedWidgets = await dashboard.getDashboard(dashboardId);
      expect(retrievedWidgets[0].title).toBe('Updated Widget');
      expect(retrievedWidgets[0].description).toBe('Updated description');
    });

    test('should delete dashboard', async () => {
      const widgets: DashboardWidget[] = [];
      const dashboardId = await dashboard.createDashboard('user_1', 'Test Dashboard', widgets);

      await dashboard.deleteDashboard(dashboardId);

      await expect(dashboard.getDashboard(dashboardId)).rejects.toThrow('Dashboard not found');
    });

    test('should validate widget configuration on creation', async () => {
      const invalidWidget: DashboardWidget = {
        id: '',
        type: DashboardWidgetType.THREAT_OVERVIEW,
        title: '',
        description: 'Invalid widget',
        position: { x: -1, y: -1, z_index: 1 },
        size: { width: 0, height: 0, min_width: 200, min_height: 150, max_width: 800, max_height: 600 },
        data_source: 'threats',
        query_params: {},
        visualization_config: {
          chart_type: 'line_chart' as any,
          color_scheme: 'default',
          animation_enabled: true,
          interactive_features: [],
          axis_configuration: {
            x_axis: { label: 'Time', scale_type: 'time' as any, format: 'datetime', grid_lines: true },
            y_axis: { label: 'Count', scale_type: 'linear' as any, format: 'number', grid_lines: true }
          },
          legend_configuration: { enabled: true, position: 'right' as any, orientation: 'vertical' as any, max_items: 10 },
          tooltip_configuration: { enabled: true, format: 'default', fields: ['timestamp', 'count'], delay_ms: 500 }
        },
        refresh_rate_ms: 30000,
        filters: [],
        permissions: ['read'],
        created_at: Date.now(),
        updated_at: Date.now()
      };

      await expect(dashboard.createDashboard('user_1', 'Invalid Dashboard', [invalidWidget]))
        .rejects.toThrow('Widget must have id, type, and title');
    });
  });

  describe('Widget Data Retrieval', () => {
    beforeEach(async () => {
      await dashboard.initialize();
    });

    test('should retrieve threat overview data', async () => {
      const widget: DashboardWidget = {
        id: 'threat_widget',
        type: DashboardWidgetType.THREAT_OVERVIEW,
        title: 'Threat Overview',
        description: 'Overview of threats',
        position: { x: 0, y: 0, z_index: 1 },
        size: { width: 400, height: 300, min_width: 200, min_height: 150, max_width: 800, max_height: 600 },
        data_source: 'threats',
        query_params: {},
        visualization_config: {
          chart_type: 'bar_chart' as any,
          color_scheme: 'default',
          animation_enabled: true,
          interactive_features: [],
          axis_configuration: {
            x_axis: { label: 'Threat Type', scale_type: 'categorical' as any, format: 'string', grid_lines: false },
            y_axis: { label: 'Count', scale_type: 'linear' as any, format: 'number', grid_lines: true }
          },
          legend_configuration: { enabled: false, position: 'top' as any, orientation: 'horizontal' as any, max_items: 0 },
          tooltip_configuration: { enabled: true, format: 'default', fields: ['threat_type', 'count'], delay_ms: 400 }
        },
        refresh_rate_ms: 30000,
        filters: [],
        permissions: ['read'],
        created_at: Date.now(),
        updated_at: Date.now()
      };

      const data = await dashboard.getWidgetData('threat_widget', widget);

      expect(data).toHaveProperty('total_threats_detected');
      expect(data).toHaveProperty('threats_by_severity');
      expect(data).toHaveProperty('threats_by_type');
      expect(data).toHaveProperty('threat_trends');
      expect(data).toHaveProperty('top_threat_sources');
    });

    test('should retrieve security events timeline data', async () => {
      const widget: DashboardWidget = {
        id: 'timeline_widget',
        type: DashboardWidgetType.SECURITY_EVENTS_TIMELINE,
        title: 'Events Timeline',
        description: 'Timeline of security events',
        position: { x: 0, y: 0, z_index: 1 },
        size: { width: 800, height: 400, min_width: 400, min_height: 200, max_width: 1600, max_height: 800 },
        data_source: 'events',
        query_params: {},
        visualization_config: {
          chart_type: 'line_chart' as any,
          color_scheme: 'dark',
          animation_enabled: true,
          interactive_features: [],
          axis_configuration: {
            x_axis: { label: 'Time', scale_type: 'time' as any, format: 'datetime', grid_lines: true },
            y_axis: { label: 'Event Count', scale_type: 'linear' as any, format: 'number', grid_lines: true }
          },
          legend_configuration: { enabled: true, position: 'bottom' as any, orientation: 'horizontal' as any, max_items: 8 },
          tooltip_configuration: { enabled: true, format: 'datetime_count', fields: ['timestamp', 'event_count'], delay_ms: 250 }
        },
        refresh_rate_ms: 15000,
        filters: [],
        permissions: ['read'],
        created_at: Date.now(),
        updated_at: Date.now()
      };

      const data = await dashboard.getWidgetData('timeline_widget', widget);

      expect(Array.isArray(data)).toBe(true);
      expect((data as any[]).length).toBeGreaterThan(0);
      expect((data as any[])[0]).toHaveProperty('timestamp');
      expect((data as any[])[0]).toHaveProperty('event_count');
    });

    test('should cache widget data and respect cache TTL', async () => {
      const widget: DashboardWidget = {
        id: 'cached_widget',
        type: DashboardWidgetType.THREAT_OVERVIEW,
        title: 'Cached Widget',
        description: 'Widget with caching',
        position: { x: 0, y: 0, z_index: 1 },
        size: { width: 400, height: 300, min_width: 200, min_height: 150, max_width: 800, max_height: 600 },
        data_source: 'threats',
        query_params: {},
        visualization_config: {
          chart_type: 'pie_chart' as any,
          color_scheme: 'high_contrast',
          animation_enabled: false,
          interactive_features: [],
          axis_configuration: {
            x_axis: { label: 'Category', scale_type: 'categorical' as any, format: 'string', grid_lines: false },
            y_axis: { label: 'Value', scale_type: 'linear' as any, format: 'number', grid_lines: false }
          },
          legend_configuration: { enabled: true, position: 'left' as any, orientation: 'vertical' as any, max_items: 12 },
          tooltip_configuration: { enabled: true, format: 'percentage', fields: ['category', 'value', 'percentage'], delay_ms: 150 }
        },
        refresh_rate_ms: 60000,
        filters: [],
        permissions: ['read'],
        created_at: Date.now(),
        updated_at: Date.now()
      };

      // First call - should fetch data
      const data1 = await dashboard.getWidgetData('cached_widget', widget);
      
      // Second call - should use cached data
      const data2 = await dashboard.getWidgetData('cached_widget', widget);

      expect(data1).toEqual(data2);
    });

    test('should apply filters to widget data queries', async () => {
      const widget: DashboardWidget = {
        id: 'filtered_widget',
        type: DashboardWidgetType.SECURITY_EVENTS_TIMELINE,
        title: 'Filtered Widget',
        description: 'Widget with filters',
        position: { x: 0, y: 0, z_index: 1 },
        size: { width: 600, height: 350, min_width: 300, min_height: 175, max_width: 1200, max_height: 700 },
        data_source: 'events',
        query_params: {},
        visualization_config: {
          chart_type: 'scatter_plot' as any,
          color_scheme: 'default',
          animation_enabled: true,
          interactive_features: [],
          axis_configuration: {
            x_axis: { label: 'Time', scale_type: 'time' as any, format: 'datetime', grid_lines: true },
            y_axis: { label: 'Severity', scale_type: 'categorical' as any, format: 'string', grid_lines: true }
          },
          legend_configuration: { enabled: true, position: 'top' as any, orientation: 'horizontal' as any, max_items: 6 },
          tooltip_configuration: { enabled: true, format: 'custom', fields: ['timestamp', 'severity', 'event_type'], delay_ms: 350 }
        },
        refresh_rate_ms: 30000,
        filters: [],
        permissions: ['read'],
        created_at: Date.now(),
        updated_at: Date.now()
      };

      const filters: DashboardFilter[] = [
        {
          id: 'severity_filter',
          name: 'Severity Filter',
          type: FilterType.DROPDOWN,
          field: 'severity',
          operator: FilterOperator.IN,
          value: ['high', 'critical'],
          enabled: true
        }
      ];

      const data = await dashboard.getWidgetData('filtered_widget', widget, filters);
      expect(data).toBeDefined();
    });

    test('should record performance metrics for widget queries', async () => {
      const widget: DashboardWidget = {
        id: 'perf_widget',
        type: DashboardWidgetType.PERFORMANCE_METRICS,
        title: 'Performance Widget',
        description: 'Widget for performance monitoring',
        position: { x: 0, y: 0, z_index: 1 },
        size: { width: 500, height: 300, min_width: 250, min_height: 150, max_width: 1000, max_height: 600 },
        data_source: 'performance',
        query_params: {},
        visualization_config: {
          chart_type: 'heat_map' as any,
          color_scheme: 'default',
          animation_enabled: false,
          interactive_features: [],
          axis_configuration: {
            x_axis: { label: 'Time', scale_type: 'time' as any, format: 'datetime', grid_lines: true },
            y_axis: { label: 'Metric', scale_type: 'categorical' as any, format: 'string', grid_lines: false }
          },
          legend_configuration: { enabled: true, position: 'right' as any, orientation: 'vertical' as any, max_items: 15 },
          tooltip_configuration: { enabled: true, format: 'metric_value', fields: ['metric', 'value', 'unit'], delay_ms: 100 }
        },
        refresh_rate_ms: 10000,
        filters: [],
        permissions: ['read'],
        created_at: Date.now(),
        updated_at: Date.now()
      };

      await dashboard.getWidgetData('perf_widget', widget);

      expect(mockPerformanceMonitoringService.recordMetric).toHaveBeenCalledWith({
        metric_name: 'dashboard_widget_query_time',
        value: expect.any(Number),
        unit: 'milliseconds',
        tags: {
          widget_type: DashboardWidgetType.PERFORMANCE_METRICS,
          widget_id: 'perf_widget'
        }
      });
    });

    test('should handle unsupported widget types', async () => {
      const widget: DashboardWidget = {
        id: 'unsupported_widget',
        type: 'unsupported_type' as any,
        title: 'Unsupported Widget',
        description: 'Unsupported widget type',
        position: { x: 0, y: 0, z_index: 1 },
        size: { width: 400, height: 300, min_width: 200, min_height: 150, max_width: 800, max_height: 600 },
        data_source: 'unknown',
        query_params: {},
        visualization_config: {
          chart_type: 'line_chart' as any,
          color_scheme: 'default',
          animation_enabled: true,
          interactive_features: [],
          axis_configuration: {
            x_axis: { label: 'X', scale_type: 'linear' as any, format: 'number', grid_lines: true },
            y_axis: { label: 'Y', scale_type: 'linear' as any, format: 'number', grid_lines: true }
          },
          legend_configuration: { enabled: false, position: 'bottom' as any, orientation: 'horizontal' as any, max_items: 0 },
          tooltip_configuration: { enabled: false, format: 'default', fields: [], delay_ms: 0 }
        },
        refresh_rate_ms: 30000,
        filters: [],
        permissions: ['read'],
        created_at: Date.now(),
        updated_at: Date.now()
      };

      await expect(dashboard.getWidgetData('unsupported_widget', widget))
        .rejects.toThrow('Unsupported widget type: unsupported_type');
    });
  });

  describe('Security Analytics', () => {
    beforeEach(async () => {
      await dashboard.initialize();
    });

    test('should retrieve comprehensive security analytics', async () => {
      const timeRange = { start: Date.now() - 86400000, end: Date.now() };
      const analytics = await dashboard.getSecurityAnalytics(timeRange);

      expect(analytics).toHaveProperty('threat_metrics');
      expect(analytics).toHaveProperty('security_metrics');
      expect(analytics).toHaveProperty('performance_metrics');
      expect(analytics).toHaveProperty('compliance_metrics');
      expect(analytics).toHaveProperty('risk_metrics');
      expect(analytics).toHaveProperty('operational_metrics');

      expect(analytics.threat_metrics).toHaveProperty('total_threats_detected');
      expect(analytics.security_metrics).toHaveProperty('security_events_per_hour');
      expect(analytics.performance_metrics).toHaveProperty('query_performance');
    });

    test('should get dashboard metrics', async () => {
      const metrics = await dashboard.getDashboardMetrics();

      expect(metrics).toHaveProperty('active_dashboards');
      expect(metrics).toHaveProperty('total_widgets');
      expect(metrics).toHaveProperty('query_performance');
      expect(metrics).toHaveProperty('user_engagement');
      expect(metrics).toHaveProperty('system_resource_usage');

      expect(typeof metrics.active_dashboards).toBe('number');
      expect(typeof metrics.total_widgets).toBe('number');
    });
  });

  describe('Export Functionality', () => {
    beforeEach(async () => {
      await dashboard.initialize();
    });

    test('should export dashboard to JSON format', async () => {
      const widgets: DashboardWidget[] = [
        {
          id: 'export_widget',
          type: DashboardWidgetType.THREAT_OVERVIEW,
          title: 'Export Test Widget',
          description: 'Widget for export testing',
          position: { x: 0, y: 0, z_index: 1 },
          size: { width: 400, height: 300, min_width: 200, min_height: 150, max_width: 800, max_height: 600 },
          data_source: 'threats',
          query_params: {},
          visualization_config: {
            chart_type: 'treemap' as any,
            color_scheme: 'default',
            animation_enabled: true,
            interactive_features: [],
            axis_configuration: {
              x_axis: { label: 'Category', scale_type: 'categorical' as any, format: 'string', grid_lines: false },
              y_axis: { label: 'Size', scale_type: 'linear' as any, format: 'number', grid_lines: false }
            },
            legend_configuration: { enabled: true, position: 'bottom' as any, orientation: 'horizontal' as any, max_items: 20 },
            tooltip_configuration: { enabled: true, format: 'size_percentage', fields: ['category', 'size', 'percentage'], delay_ms: 300 }
          },
          refresh_rate_ms: 45000,
          filters: [],
          permissions: ['read', 'export'],
          created_at: Date.now(),
          updated_at: Date.now()
        }
      ];

      const dashboardId = await dashboard.createDashboard('user_1', 'Export Test', widgets);
      const exportData = await dashboard.exportDashboard(dashboardId, 'json');

      const parsed = JSON.parse(exportData);
      expect(parsed).toHaveProperty('dashboardId', dashboardId);
      expect(parsed).toHaveProperty('widgets');
      expect(parsed).toHaveProperty('exportedAt');
      expect(parsed.widgets).toHaveLength(1);
    });

    test('should export dashboard to CSV format', async () => {
      const widgets: DashboardWidget[] = [
        {
          id: 'csv_widget',
          type: DashboardWidgetType.SECURITY_EVENTS_TIMELINE,
          title: 'CSV Export Widget',
          description: 'Widget for CSV export testing',
          position: { x: 100, y: 200, z_index: 2 },
          size: { width: 600, height: 400, min_width: 300, min_height: 200, max_width: 1200, max_height: 800 },
          data_source: 'events',
          query_params: {},
          visualization_config: {
            chart_type: 'radar_chart' as any,
            color_scheme: 'dark',
            animation_enabled: false,
            interactive_features: [],
            axis_configuration: {
              x_axis: { label: 'Dimension', scale_type: 'categorical' as any, format: 'string', grid_lines: true },
              y_axis: { label: 'Value', scale_type: 'linear' as any, format: 'number', grid_lines: true }
            },
            legend_configuration: { enabled: true, position: 'left' as any, orientation: 'vertical' as any, max_items: 10 },
            tooltip_configuration: { enabled: true, format: 'dimension_value', fields: ['dimension', 'value'], delay_ms: 200 }
          },
          refresh_rate_ms: 20000,
          filters: [],
          permissions: ['read', 'export'],
          created_at: 1234567890000,
          updated_at: 1234567890000
        }
      ];

      const dashboardId = await dashboard.createDashboard('user_1', 'CSV Test', widgets);
      const csvData = await dashboard.exportDashboard(dashboardId, 'csv');

      expect(csvData).toContain('Widget ID,Type,Title,Position X,Position Y,Width,Height,Created At');
      expect(csvData).toContain('csv_widget,security_events_timeline,CSV Export Widget,100,200,600,400');
    });

    test('should handle unsupported export formats', async () => {
      const widgets: DashboardWidget[] = [];
      const dashboardId = await dashboard.createDashboard('user_1', 'Test', widgets);

      await expect(dashboard.exportDashboard(dashboardId, 'pdf'))
        .rejects.toThrow('Unsupported export format: pdf');
    });
  });

  describe('Health and Diagnostics', () => {
    beforeEach(async () => {
      await dashboard.initialize();
    });

    test('should provide health status', async () => {
      const health = await dashboard.getHealthStatus();

      expect(health).toHaveProperty('overall_health');
      expect(health).toHaveProperty('details');
      expect(health.details).toHaveProperty('dashboard_cache_size');
      expect(health.details).toHaveProperty('initialization_status');
    });

    test('should provide dashboard status', () => {
      const status = dashboard.getStatus();

      expect(status).toHaveProperty('initialized');
      expect(status).toHaveProperty('dashboard_count');
      expect(status).toHaveProperty('cache_size');
      expect(status).toHaveProperty('configuration');
    });

    test('should handle shutdown gracefully', async () => {
      await dashboard.shutdown();

      const status = dashboard.getStatus();
      expect(status.initialized).toBe(false);
    });
  });

  describe('Real-time Updates', () => {
    beforeEach(async () => {
      await dashboard.initialize();
    });

    test('should handle real-time security events', () => {
      const mockEvent = {
        id: 'evt_123',
        event_type: 'network_intrusion',
        severity: 'high',
        timestamp: Date.now(),
        source: { ip_address: '192.168.1.100' }
      };

      const eventSpy = jest.fn<unknown[], unknown>();
      dashboard.on('real_time_security_event', eventSpy);

      // Simulate security event from data pipeline
      (dashboard as any).handleRealTimeSecurityEvent(mockEvent);

      expect(eventSpy).toHaveBeenCalledWith({
        event_id: 'evt_123',
        event_type: 'network_intrusion',
        severity: 'high',
        timestamp: expect.any(Number),
        source: { ip_address: '192.168.1.100' }
      });
    });

    test('should handle threat intelligence updates', () => {
      const mockIntelligence = { threat_id: 'thr_456', actor: 'apt_group' };

      const updateSpy = jest.fn<unknown[], unknown>();
      dashboard.on('threat_intelligence_update', updateSpy);

      // Simulate threat intelligence update
      (dashboard as any).handleThreatIntelligenceUpdate(mockIntelligence);

      expect(updateSpy).toHaveBeenCalledWith(mockIntelligence);
    });
  });

  describe('Cache Management', () => {
    beforeEach(async () => {
      await dashboard.initialize();
    });

    test('should invalidate cache for specific widget types', () => {
      // Add some cache entries
      (dashboard as any).queryCache.set('threat_overview_key', { data: {}, timestamp: Date.now() });
      (dashboard as any).queryCache.set('timeline_key', { data: {}, timestamp: Date.now() });
      (dashboard as any).queryCache.set('alert_management_key', { data: {}, timestamp: Date.now() });

      // Invalidate specific types
      (dashboard as any).invalidateCache(['threat_overview']);

      expect((dashboard as any).queryCache.has('threat_overview_key')).toBe(false);
      expect((dashboard as any).queryCache.has('timeline_key')).toBe(true);
      expect((dashboard as any).queryCache.has('alert_management_key')).toBe(true);
    });

    test('should cleanup expired cache entries', () => {
      const now = Date.now();
      const ttl = testConfig.dashboard.cache_ttl_seconds * 1000;

      // Add expired and valid cache entries
      (dashboard as any).queryCache.set('expired_key', { data: {}, timestamp: now - ttl - 1000 });
      (dashboard as any).queryCache.set('valid_key', { data: {}, timestamp: now });

      // Trigger cache cleanup
      (dashboard as any).cleanupCache();

      expect((dashboard as any).queryCache.has('expired_key')).toBe(false);
      expect((dashboard as any).queryCache.has('valid_key')).toBe(true);
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      await dashboard.initialize();
    });

    test('should handle initialization errors', async () => {
      mockAnalyticsCollector.track.mockRejectedValueOnce(new Error('Analytics error'));

      const newDashboard = new SecurityIntelligenceDashboard(
        testConfig,
        mockDataPipeline,
        mockAnalyticsCollector,
        mockAnalyticsDAO,
        mockPerformanceMonitoringService,
        mockDiagnosticService,
        mockHealthCheckFramework
      );

      await expect(newDashboard.initialize()).rejects.toThrow('Analytics error');
    });

    test('should handle widget validation errors', async () => {
      const invalidWidgets: DashboardWidget[] = [
        {
          id: 'valid_id',
          type: 'invalid_type' as any,
          title: 'Valid Title',
          description: 'Valid description',
          position: { x: 0, y: 0, z_index: 1 },
          size: { width: 400, height: 300, min_width: 200, min_height: 150, max_width: 800, max_height: 600 },
          data_source: 'valid_source',
          query_params: {},
          visualization_config: {
            chart_type: 'line_chart' as any,
            color_scheme: 'default',
            animation_enabled: true,
            interactive_features: [],
            axis_configuration: {
              x_axis: { label: 'X', scale_type: 'linear' as any, format: 'number', grid_lines: true },
              y_axis: { label: 'Y', scale_type: 'linear' as any, format: 'number', grid_lines: true }
            },
            legend_configuration: { enabled: false, position: 'bottom' as any, orientation: 'horizontal' as any, max_items: 0 },
            tooltip_configuration: { enabled: false, format: 'default', fields: [], delay_ms: 0 }
          },
          refresh_rate_ms: 30000,
          filters: [],
          permissions: ['read'],
          created_at: Date.now(),
          updated_at: Date.now()
        }
      ];

      await expect(dashboard.createDashboard('user_1', 'Invalid Dashboard', invalidWidgets))
        .rejects.toThrow('Invalid widget type: invalid_type');
    });
  });
});