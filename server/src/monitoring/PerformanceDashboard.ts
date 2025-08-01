/**
 * Performance Dashboard Service
 * 
 * Real-time performance dashboard providing visualization and insights
 * for system performance metrics, benchmarks, and alerts during
 * Epic 18 technical debt refactoring.
 * 
 * Part of Epic 18 - Technical Debt & Refactoring
 * Task: E18-1753114561914-F036F8 - Set up performance monitoring
 */

import { EventEmitter } from 'events';
import WebSocket from 'ws';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { PerformanceMonitor, PerformanceDashboard as DashboardData, PerformanceMetric, PerformanceBenchmark } from './PerformanceMonitor';
import { DatabaseService } from '../auth/database/DatabaseService';
import { RedisService } from '../auth/database/RedisService';



export interface DashboardConfig {
  enableWebSocket: boolean;
  websocketPort?: number;
  updateInterval: number; // milliseconds
  maxHistoryPoints: number;
  enableRealTimeAlerts: boolean;







export interface DashboardClient {
  clientId: string;
  websocket?: WebSocket;
  userId?: string;
  subscriptions: DashboardSubscription[];
  lastActivity: Date;
  isActive: boolean;







export interface DashboardSubscription {
  type: 'metrics' | 'benchmarks' | 'alerts' | 'system_health';
  filters: {
    metricNames?: string[];
    categories?: string[];
    severities?: string[];



  };
  realTime: boolean;




export interface DashboardWidget {
  widgetId: string;
  type: WidgetType;
  title: string;
  config: WidgetConfig;
  data: any;
  lastUpdated: Date;







export interface WidgetConfig {
  timeRange: TimeRange;
  refreshInterval: number; // milliseconds
  visualization: VisualizationType;
  metrics: string[];



  thresholds?: { warning: number; critical: number };
  chartOptions?: Record<string, any>;




export interface TimeRange {
  type: 'realtime' | 'last_hour' | 'last_24h' | 'last_7d' | 'custom';
  customStart?: Date;
  customEnd?: Date;





export type WidgetType = 
  | 'metric_chart'
  | 'benchmark_summary'
  | 'alert_list'
  | 'system_health'
  | 'performance_heatmap'
  | 'trend_analysis'
  | 'comparison_chart';

export type VisualizationType =
  | 'line_chart'
  | 'area_chart'
  | 'bar_chart'
  | 'gauge'
  | 'table'
  | 'heatmap'
  | 'trend_indicator';

export class PerformanceDashboard extends EventEmitter {
  private config: DashboardConfig;
  private performanceMonitor: PerformanceMonitor;
  private databaseService: DatabaseService;
  private redisService: RedisService;
  
  // Dashboard State
  private clients: Map<string, DashboardClient> = new Map();
  private widgets: Map<string, DashboardWidget> = new Map();
  private wsServer?: WebSocket.Server;
  
  // Update Management
  private updateInterval?: NodeJS.Timeout;
  private dashboardData?: DashboardData;
  private lastUpdate: Date = new Date();
  
  // Historical Data Cache
  private metricsHistory: Map<string, { timestamp: Date; value: number }[]> = new Map();
  private benchmarksHistory: Map<string, { timestamp: Date; value: number; improvement: number }[]> = new Map();

  constructor(
    config: DashboardConfig,
    performanceMonitor: PerformanceMonitor,
    dependencies: {
      databaseService: DatabaseService;
      redisService: RedisService;
    }
  ) {
    super();
    this.config = config;
    this.performanceMonitor = performanceMonitor;
    this.databaseService = dependencies.databaseService;
    this.redisService = dependencies.redisService;


  /**
   * Initialize performance dashboard
   */
  public async initialize(): Promise<void> {

    console.log('📊 Initializing Performance Dashboard...');
    
    // Initialize WebSocket server if enabled
    if (this.config.enableWebSocket) {
      await this.initializeWebSocketServer();

    
    // Initialize default widgets
    await this.initializeDefaultWidgets();
    
    // Start periodic updates
    this.startPeriodicUpdates();
    
    // Listen for performance monitor events
    this.setupPerformanceMonitorListeners();
    
    // Load historical data
    await this.loadHistoricalData();
    
    console.log('✅ Performance Dashboard initialized successfully');


  /**
   * Initialize WebSocket server for real-time updates
   */
  private async initializeWebSocketServer(): Promise<void> {

    const port = this.config.websocketPort || 8081;
    
    this.wsServer = new WebSocket.Server({
      port,
      verifyClient: (info) => {
        // Add authentication if needed
        return true;

    });

    this.wsServer.on('connection', (ws, req) => {
      this.handleWebSocketConnection(ws, req);
    });

    this.wsServer.on('error', (error) => {
      console.error('Performance Dashboard WebSocket error:', error);
    });

    console.log(`🔌 Performance Dashboard WebSocket server started on port ${port}`);


  /**
   * Handle new WebSocket connection
   */
  private handleWebSocketConnection(ws: WebSocket, req: any): void {
    const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const client: DashboardClient = {
      clientId,
      websocket: ws,
      subscriptions: [],
      lastActivity: new Date(),
      isActive: true
    };
    
    this.clients.set(clientId, client);
    
    ws.on('message', (data) => {
      this.handleWebSocketMessage(clientId, data.toString());
    });
    
    ws.on('close', () => {
      this.handleWebSocketDisconnection(clientId);
    });
    
    ws.on('error', (error) => {
      console.error(`WebSocket client error (${clientId}):`, error);
      this.handleWebSocketDisconnection(clientId);
    });
    
    // Send initial dashboard data
    this.sendDashboardData(clientId);
    
    console.log(`📱 Dashboard client connected: ${clientId}`);


  /**
   * Handle WebSocket message from client
   */
  private handleWebSocketMessage(clientId: string, message: string): void {
    const client = this.clients.get(clientId);
    if (!client) return;
    
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
      case 'subscribe':
        this.handleSubscription(clientId, data.subscription);
        break;
      case 'unsubscribe':
        this.handleUnsubscription(clientId, data.subscriptionType);
        break;
      case 'get_widget_data':
        this.handleWidgetDataRequest(clientId, data.widgetId);
        break;
      case 'ping':
        this.handlePing(clientId);
        break;
      default:
        console.warn(`Unknown message type from client ${clientId}:`, data.type);

      
      client.lastActivity = new Date();
 catch (error) {
      console.error(`Error processing message from client ${clientId}:`, error);



  /**
   * Handle client subscription
   */
  private handleSubscription(clientId: string, subscription: DashboardSubscription): void {
    const client = this.clients.get(clientId);
    if (!client) return;
    
    // Remove existing subscription of same type
    client.subscriptions = client.subscriptions.filter(s => s.type !== subscription.type);
    
    // Add new subscription
    client.subscriptions.push(subscription);
    
    // Send initial data for subscription
    this.sendSubscriptionData(clientId, subscription);
    
    if (client.websocket) {
      client.websocket.send(JSON.stringify({
        type: 'subscription_confirmed',
        subscriptionType: subscription.type,
        timestamp: new Date()
      }));



  /**
   * Handle client unsubscription
   */
  private handleUnsubscription(clientId: string, subscriptionType: string): void {
    const client = this.clients.get(clientId);
    if (!client) return;
    
    client.subscriptions = client.subscriptions.filter(s => s.type !== subscriptionType);
    
    if (client.websocket) {
      client.websocket.send(JSON.stringify({
        type: 'unsubscription_confirmed',
        subscriptionType,
        timestamp: new Date()
      }));



  /**
   * Handle widget data request
   */
  private handleWidgetDataRequest(clientId: string, widgetId: string): void {
    const client = this.clients.get(clientId);
    const widget = this.widgets.get(widgetId);
    
    if (!client || !widget) return;
    
    if (client.websocket) {
      client.websocket.send(JSON.stringify({
        type: 'widget_data',
        widgetId,
        data: widget.data,
        lastUpdated: widget.lastUpdated
      }));



  /**
   * Handle ping message
   */
  private handlePing(clientId: string): void {
    const client = this.clients.get(clientId);
    if (!client) return;
    
    if (client.websocket) {
      client.websocket.send(JSON.stringify({
        type: 'pong',
        timestamp: new Date()
      }));



  /**
   * Handle WebSocket disconnection
   */
  private handleWebSocketDisconnection(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      client.isActive = false;
      this.clients.delete(clientId);
      console.log(`📱 Dashboard client disconnected: ${clientId}`);



  /**
   * Initialize default dashboard widgets
   */
  private async initializeDefaultWidgets(): Promise<void> {

    const defaultWidgets: Array<{
      id: string;
      type: WidgetType;
      title: string;
      config: Partial<WidgetConfig>;
> = [
      {
        id: 'system_health_gauge',
        type: 'system_health',
        title: 'System Health',
        config: {
          timeRange: { type: 'realtime' },
          refreshInterval: 5000,
          visualization: 'gauge',
          metrics: ['system_health_score']


      {
        id: 'api_response_times',
        type: 'metric_chart',
        title: 'API Response Times',
        config: {
          timeRange: { type: 'last_hour' },
          refreshInterval: 30000,
          visualization: 'line_chart',
          metrics: ['api_response_time'],
          thresholds: { warning: 200, critical: 1000 }


      {
        id: 'memory_usage_trend',
        type: 'metric_chart',
        title: 'Memory Usage',
        config: {
          timeRange: { type: 'last_24h' },
          refreshInterval: 60000,
          visualization: 'area_chart',
          metrics: ['system_memory_heap_used', 'system_memory_heap_total']


      {
        id: 'performance_benchmarks',
        type: 'benchmark_summary',
        title: 'Performance Benchmarks',
        config: {
          timeRange: { type: 'last_7d' },
          refreshInterval: 300000,
          visualization: 'table',
          metrics: []


      {
        id: 'active_alerts',
        type: 'alert_list',
        title: 'Active Alerts',
        config: {
          timeRange: { type: 'realtime' },
          refreshInterval: 10000,
          visualization: 'table',
          metrics: []


      {
        id: 'cpu_usage_gauge',
        type: 'metric_chart',
        title: 'CPU Usage',
        config: {
          timeRange: { type: 'last_hour' },
          refreshInterval: 30000,
          visualization: 'gauge',
          metrics: ['system_cpu_user', 'system_cpu_system']


    ];
    
    for (const widgetDef of defaultWidgets) {
      const widget: DashboardWidget = {
        widgetId: widgetDef.id,
        type: widgetDef.type,
        title: widgetDef.title,
        config: {
          timeRange: { type: 'realtime' },
          refreshInterval: 30000,
          visualization: 'line_chart',
          metrics: [],
          ...widgetDef.config
 as WidgetConfig,
        data: null,
        lastUpdated: new Date()
      };
      
      this.widgets.set(widget.widgetId, widget);

    
    console.log(`📊 Initialized ${defaultWidgets.length} default dashboard widgets`);


  /**
   * Start periodic dashboard updates
   */
  private startPeriodicUpdates(): void {
    this.updateInterval = setInterval(async () => {
      await this.updateDashboardData();
      this.broadcastUpdates();
    }, this.config.updateInterval);


  /**
   * Update dashboard data
   */
  private async updateDashboardData(): Promise<void> {

    try {
      // Get latest dashboard data from performance monitor
      this.dashboardData = this.performanceMonitor.getPerformanceDashboard();
      this.lastUpdate = new Date();
      
      // Update individual widgets
      await this.updateAllWidgets();
      
      // Update historical data
      this.updateHistoricalData();
 catch (error) {
      console.error('Error updating dashboard data:', error);



  /**
   * Update all widgets
   */
  private async updateAllWidgets(): Promise<void> {

    for (const [widgetId, widget] of this.widgets.entries()) {
      try {
        const widgetData = await this.generateWidgetData(widget);
        widget.data = widgetData;
        widget.lastUpdated = new Date();
 catch (error) {
        console.error(`Error updating widget ${widgetId}:`, error);




  /**
   * Generate data for a specific widget
   */
  private async generateWidgetData(widget: DashboardWidget): Promise<any> {

    switch (widget.type) {
    case 'system_health':
      return this.generateSystemHealthData(widget);
      
    case 'metric_chart':
      return this.generateMetricChartData(widget);
      
    case 'benchmark_summary':
      return this.generateBenchmarkSummaryData(widget);
      
    case 'alert_list':
      return this.generateAlertListData(widget);
      
    case 'performance_heatmap':
      return this.generatePerformanceHeatmapData(widget);
      
    case 'trend_analysis':
      return this.generateTrendAnalysisData(widget);
      
    default:
      return null;



  /**
   * Generate system health widget data
   */
  private generateSystemHealthData(widget: DashboardWidget): any {
    if (!this.dashboardData) return null;
    
    return {
      healthScore: this.dashboardData.systemHealth.score,
      status: this.dashboardData.systemHealth.status,
      activeAlerts: this.dashboardData.systemHealth.activeAlerts,
      criticalAlerts: this.dashboardData.systemHealth.criticalAlerts,
      uptime: this.dashboardData.systemOverview.monitoringUptime,
      lastUpdated: this.dashboardData.systemHealth.timestamp
    };


  /**
   * Generate metric chart widget data
   */
  private async generateMetricChartData(widget: DashboardWidget): Promise<any> {

    const timeRange = this.getTimeRangeForWidget(widget);
    const chartData: any = {
      labels: [],
      datasets: []
    };
    
    for (const metricName of widget.config.metrics) {
      const history = this.metricsHistory.get(metricName) || [];
      const relevantData = history.filter(point => 
        point.timestamp >= timeRange.start && point.timestamp <= timeRange.end
      );
      
      if (relevantData.length > 0) {
        // Create time labels if not already created
        if (chartData.labels.length === 0) {
          chartData.labels = relevantData.map(point => point.timestamp);

        
        chartData.datasets.push({
          label: metricName,
          data: relevantData.map(point => point.value),
          timestamps: relevantData.map(point => point.timestamp),
          thresholds: widget.config.thresholds
        });


    
    return chartData;


  /**
   * Generate benchmark summary widget data
   */
  private generateBenchmarkSummaryData(widget: DashboardWidget): any {
    if (!this.dashboardData) return null;
    
    return {
      benchmarks: this.dashboardData.benchmarkSummary.map(benchmark => ({
        ...benchmark,
        history: this.benchmarksHistory.get(benchmark.id) || []
      })),
      summary: {
        total: this.dashboardData.benchmarkSummary.length,
        onTrack: this.dashboardData.benchmarkSummary.filter(b => b.status === 'on_track').length,
        needsAttention: this.dashboardData.benchmarkSummary.filter(b => b.status === 'needs_attention').length,
        critical: this.dashboardData.benchmarkSummary.filter(b => b.status === 'critical').length

    };


  /**
   * Generate alert list widget data
   */
  private generateAlertListData(widget: DashboardWidget): any {
    if (!this.dashboardData) return null;
    
    return {
      alerts: this.dashboardData.activeAlerts.map(alert => ({
        ...alert,
        timeAgo: this.calculateTimeAgo(alert.triggeredAt)
      })),
      summary: {
        total: this.dashboardData.activeAlerts.length,
        critical: this.dashboardData.activeAlerts.filter(a => a.severity === 'critical').length,
        warning: this.dashboardData.activeAlerts.filter(a => a.severity === 'warning').length

    };


  /**
   * Generate performance heatmap widget data
   */
  private generatePerformanceHeatmapData(widget: DashboardWidget): any {
    // Implementation would generate heatmap data based on performance metrics
    return {
      heatmapData: [],
      colorScale: ['#00ff00', '#ffff00', '#ff0000'], // Green to red
      categories: ['API', 'Database', 'UI', 'System'],
      timeSlots: []
    };


  /**
   * Generate trend analysis widget data
   */
  private generateTrendAnalysisData(widget: DashboardWidget): any {
    if (!this.dashboardData) return null;
    
    return {
      trends: this.dashboardData.recentMetrics.map(metric => ({
        name: metric.name,
        trend: metric.trend,
        value: metric.latest,
        change: metric.average - metric.latest
      })),
      overallTrend: this.calculateOverallTrend(};


  /**
   * Setup listeners for performance monitor events
   */
  private setupPerformanceMonitorListeners(): void {
    this.performanceMonitor.on('metric_recorded', (metric: PerformanceMetric) => {
      this.handleMetricRecorded(metric);
    });
    
    this.performanceMonitor.on('benchmark_recorded', (benchmark: PerformanceBenchmark) => {
      this.handleBenchmarkRecorded(benchmark);
    });
    
    this.performanceMonitor.on('alert_triggered', (alert: any) => {
      this.handleAlertTriggered(alert);
    });


  /**
   * Handle metric recorded event
   */
  private handleMetricRecorded(metric: PerformanceMetric): void {
    // Update metrics history
    if (!this.metricsHistory.has(metric.name)) {
      this.metricsHistory.set(metric.name, []);

    
    const history = this.metricsHistory.get(metric.name)!;
    history.push({
      timestamp: metric.timestamp,
      value: metric.value
    });
    
    // Limit history size
    if (history.length > this.config.maxHistoryPoints) {
      history.splice(0, history.length - this.config.maxHistoryPoints);

    
    // Broadcast real-time update to subscribed clients
    this.broadcastMetricUpdate(metric);


  /**
   * Handle benchmark recorded event
   */
  private handleBenchmarkRecorded(benchmark: PerformanceBenchmark): void {
    // Update benchmark history
    if (!this.benchmarksHistory.has(benchmark.benchmarkId)) {
      this.benchmarksHistory.set(benchmark.benchmarkId, []);

    
    const history = this.benchmarksHistory.get(benchmark.benchmarkId)!;
    history.push({
      timestamp: benchmark.current.timestamp,
      value: benchmark.current.value,
      improvement: benchmark.improvement.percentage
    });
    
    // Limit history size
    if (history.length > this.config.maxHistoryPoints) {
      history.splice(0, history.length - this.config.maxHistoryPoints);

    
    // Broadcast update to subscribed clients
    this.broadcastBenchmarkUpdate(benchmark);


  /**
   * Handle alert triggered event
   */
  private handleAlertTriggered(alert: any): void {
    if (this.config.enableRealTimeAlerts) {
      this.broadcastAlertUpdate(alert);



  /**
   * Broadcast metric update to subscribed clients
   */
  private broadcastMetricUpdate(metric: PerformanceMetric): void {
    const message = {
      type: 'metric_update',
      metric: {
        name: metric.name,
        value: metric.value,
        timestamp: metric.timestamp,
        status: metric.status

    };
    
    this.broadcastToSubscribers('metrics', message, (subscription) => 
      !subscription.filters.metricNames || subscription.filters.metricNames.includes(metric.name)
    );


  /**
   * Broadcast benchmark update to subscribed clients
   */
  private broadcastBenchmarkUpdate(benchmark: PerformanceBenchmark): void {
    const message = {
      type: 'benchmark_update',
      benchmark: {
        id: benchmark.benchmarkId,
        name: benchmark.name,
        value: benchmark.current.value,
        improvement: benchmark.improvement,
        timestamp: benchmark.current.timestamp

    };
    
    this.broadcastToSubscribers('benchmarks', message, (subscription) => 
      !subscription.filters.categories || subscription.filters.categories.includes(benchmark.category)
    );


  /**
   * Broadcast alert update to subscribed clients
   */
  private broadcastAlertUpdate(alert: any): void {
    const message = {
      type: 'alert_update',
      alert: {
        id: alert.alertId,
        title: alert.title,
        severity: alert.severity,
        description: alert.description,
        timestamp: alert.triggeredAt

    };
    
    this.broadcastToSubscribers('alerts', message, (subscription) => 
      !subscription.filters.severities || subscription.filters.severities.includes(alert.severity)
    );


  /**
   * Broadcast message to subscribers with optional filter
   */
  private broadcastToSubscribers(
    subscriptionType: string,
    message: any,
    filter?: (subscription: DashboardSubscription) => boolean
  ): void {
    for (const client of this.clients.values()) {
      if (!client.isActive || !client.websocket) continue;
      
      const relevantSubscriptions = client.subscriptions.filter(sub => 
        sub.type === subscriptionType && 
        sub.realTime &&
        (!filter || filter(sub))
      );
      
      if (relevantSubscriptions.length > 0) {
        try {
          client.websocket.send(JSON.stringify(message));
 catch (error) {
          console.error(`Error sending message to client ${client.clientId}:`, error);
          this.handleWebSocketDisconnection(client.clientId);





  /**
   * Broadcast general dashboard updates
   */
  private broadcastUpdates(): void {
    if (!this.dashboardData) return;
    
    const updateMessage = {
      type: 'dashboard_update',
      data: this.dashboardData,
      timestamp: this.lastUpdate
    };
    
    for (const client of this.clients.values()) {
      if (client.isActive && client.websocket) {
        try {
          client.websocket.send(JSON.stringify(updateMessage));
 catch (error) {
          console.error(`Error broadcasting to client ${client.clientId}:`, error);
          this.handleWebSocketDisconnection(client.clientId);





  /**
   * Send dashboard data to specific client
   */
  private sendDashboardData(clientId: string): void {
    const client = this.clients.get(clientId);
    if (!client || !client.websocket || !this.dashboardData) return;
    
    const message = {
      type: 'initial_dashboard_data',
      data: this.dashboardData,
      widgets: Array.from(this.widgets.values()),
      timestamp: this.lastUpdate
    };
    
    try {
      client.websocket.send(JSON.stringify(message));
 catch (error) {
      console.error(`Error sending dashboard data to client ${clientId}:`, error);



  /**
   * Send subscription data to client
   */
  private sendSubscriptionData(clientId: string, subscription: DashboardSubscription): void {
    const client = this.clients.get(clientId);
    if (!client || !client.websocket) return;
    
    let data: any = null;
    
    switch (subscription.type) {
    case 'metrics':
      data = this.dashboardData?.recentMetrics;
      break;
    case 'benchmarks':
      data = this.dashboardData?.benchmarkSummary;
      break;
    case 'alerts':
      data = this.dashboardData?.activeAlerts;
      break;
    case 'system_health':
      data = this.dashboardData?.systemHealth;
      break;

    
    if (data) {
      const message = {
        type: 'subscription_data',
        subscriptionType: subscription.type,
        data,
        timestamp: new Date()
      };
      
      try {
        client.websocket.send(JSON.stringify(message));
 catch (error) {
        console.error(`Error sending subscription data to client ${clientId}:`, error);




  /**
   * Register dashboard routes with Fastify server
   */
  public registerRoutes(server: FastifyInstance): void {
    // Dashboard data endpoint
    server.get('/api/dashboard/data', async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const data = this.performanceMonitor.getPerformanceDashboard();
        return reply.code(200).send({
          success: true,
          data,
          widgets: Array.from(this.widgets.values()),
          timestamp: new Date()
        });
 catch (error) {
        return reply.code(500).send({
          success: false,
          error: error.message
        });

    });
    
    // Widget data endpoint
    server.get('/api/dashboard/widget/:widgetId', async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { widgetId } = request.params as { widgetId: string };
        const widget = this.widgets.get(widgetId);
        
        if (!widget) {
          return reply.code(404).send({
            success: false,
            error: 'Widget not found'
          });

        
        return reply.code(200).send({
          success: true,
          widget,
          data: widget.data
        });
 catch (error) {
        return reply.code(500).send({
          success: false,
          error: error.message
        });

    });
    
    // Performance report endpoint
    server.post('/api/dashboard/report', async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { startDate, endDate, categories } = request.body as {
          startDate: string;
          endDate: string;
          categories?: string[];
        };
        
        const report = await this.performanceMonitor.generatePerformanceReport(
          new Date(startDate),
          new Date(endDate),
          categories as any[]
        );
        
        return reply.code(200).send({
          success: true,
          report
        });
 catch (error) {
        return reply.code(500).send({
          success: false,
          error: error.message
        });

    });
    
    // Dashboard configuration endpoint
    server.get('/api/dashboard/config', async (request: FastifyRequest, reply: FastifyReply) => {
      return reply.code(200).send({
        success: true,
        config: {
          enableWebSocket: this.config.enableWebSocket,
          websocketPort: this.config.websocketPort,
          updateInterval: this.config.updateInterval,
          enableRealTimeAlerts: this.config.enableRealTimeAlerts

      });
    });


  /**
   * Get time range for widget
   */
  private getTimeRangeForWidget(widget: DashboardWidget): { start: Date; end: Date } {
    const now = new Date();
    
    switch (widget.config.timeRange.type) {
    case 'last_hour':
      return {
        start: new Date(now.getTime() - 60 * 60 * 1000),
        end: now
      };
    case 'last_24h':
      return {
        start: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        end: now
      };
    case 'last_7d':
      return {
        start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        end: now
      };
    case 'custom':
      return {
        start: widget.config.timeRange.customStart || new Date(now.getTime() - 60 * 60 * 1000),
        end: widget.config.timeRange.customEnd || now
      };
    case 'realtime':
    default:
      return {
        start: new Date(now.getTime() - 5 * 60 * 1000), // Last 5 minutes
        end: now
      };



  /**
   * Calculate time ago string
   */
  private calculateTimeAgo(timestamp: Date): string {
    const now = Date.now();
    const diff = now - timestamp.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    return `${Math.floor(diff / 86400000)} days ago`;


  /**
   * Calculate overall trend
   */
  private calculateOverallTrend(): 'improving' | 'stable' | 'degrading' {
    if (!this.dashboardData) return 'stable';
    
    const improvingCount = this.dashboardData.recentMetrics.filter(m => m.trend === 'improving').length;
    const degradingCount = this.dashboardData.recentMetrics.filter(m => m.trend === 'degrading').length;
    
    if (improvingCount > degradingCount) return 'improving';
    if (degradingCount > improvingCount) return 'degrading';
    return 'stable';


  /**
   * Load historical performance data
   */
  private async loadHistoricalData(): Promise<void> {

    try {
      // Load recent metrics history from database
      const recentMetrics = await this.databaseService.query(`
        SELECT name, value, timestamp 
        FROM performance_metrics 
        WHERE timestamp > datetime('now', '-24 hours')
        ORDER BY timestamp ASC
      `);
      
      // Organize metrics by name
      for (const row of recentMetrics) {
        if (!this.metricsHistory.has(row.name)) {
          this.metricsHistory.set(row.name, []);

        
        this.metricsHistory.get(row.name)!.push({
          timestamp: new Date(row.timestamp),
          value: row.value
        });

      
      console.log(`📊 Loaded historical data for ${this.metricsHistory.size} metrics`);
 catch (error) {
      console.warn('Could not load historical dashboard data:', error);



  /**
   * Update historical data with latest metrics
   */
  private updateHistoricalData(): void {
    // This is called periodically to maintain history
    // Current implementation updates through event listeners
    // but this could also pull latest data from database


  /**
   * Get dashboard status
   */
  public getDashboardStatus(): {
    active: boolean;
    connectedClients: number;
    widgetCount: number;
    lastUpdate: Date;
 {
    return {
      active: this.updateInterval !== undefined,
      connectedClients: Array.from(this.clients.values()).filter(c => c.isActive).length,
      widgetCount: this.widgets.size,
      lastUpdate: this.lastUpdate
    };


  /**
   * Stop performance dashboard
   */
  public async stop(): Promise<void> {

    console.log('⏹️ Stopping Performance Dashboard...');
    
    // Stop periodic updates
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = undefined;

    
    // Close WebSocket server
    if (this.wsServer) {
      this.wsServer.close();

    
    // Disconnect all clients
    for (const client of this.clients.values()) {
      if (client.websocket) {
        client.websocket.close();


    this.clients.clear();
    
    console.log('✅ Performance Dashboard stopped successfully');

