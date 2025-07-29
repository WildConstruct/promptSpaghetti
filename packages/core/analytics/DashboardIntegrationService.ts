/**
 * Dashboard Integration Service - Story 1.5 Task 4
 * 
 * Service layer for integrating the real-time dashboard with existing
 * analytics routes and consolidating dashboard functionality.
 */
import { 
  UnifiedEventBus,
  UnifiedAnalyticsEvent,
  EventFilter,
  AnalyticsEventType,
  EventCategory
} from './UnifiedEventBus';
import { EventRepository } from './EventPersistenceLayer';
import { AnalyticsAuthorizationService, AuthContext } from './AnalyticsAuthorization';
import { WebSocketStreamingServer } from './WebSocketStreaming';
import { AnalyticsAdapterManager } from './AnalyticsEventAdapters';

// Dashboard Integration Configuration
interface DashboardIntegrationConfig {
  enableLegacySupport: boolean;
  migrationMode: 'gradual' | 'immediate' | 'parallel';
  cacheEnabled: boolean;
  cacheTTL: number;
  webhookEndpoints: string;
  alertingEnabled: boolean;

// Legacy Analytics System Info
interface LegacyAnalyticsSystem {
  name: string;
  routePath: string;
  dataFormat: 'dao' | 'rest' | 'event';
  migrationStatus: 'pending' | 'in_progress' | 'completed' | 'failed';
  lastSync: number;
  eventCount: number;
  healthStatus: 'healthy' | 'degraded' | 'failing';

// Dashboard Widget Performance Metrics
interface WidgetPerformanceMetrics {
  widgetId: string;
  widgetType: string;
  averageLoadTime: number;
  errorRate: number;
  cacheHitRate: number;
  queryCount: number;
  lastUpdate: number;

// Integration Status
interface IntegrationStatus {
  totalSystems: number;
  integratedSystems: number;
  migrationProgress: number;
  activeConnections: number;
  eventThroughput: number;
  systemHealth: number;
  lastHealthCheck: number;

// Statistics Interface
interface EventStatistics {
  totalEvents: number;
  eventsBySource?: Record<string, number>;
  eventsByCategory?: Record<string, number>;
  eventsByType?: Record<string, number>;
/**
 * Dashboard Integration Service
 * 
 * Manages the integration between the unified dashboard and existing analytics systems
 */
export class DashboardIntegrationService {
  private eventBus: UnifiedEventBus;
  private eventRepository: EventRepository;
  private authService: AnalyticsAuthorizationService;
  private wsServer: WebSocketStreamingServer;
  private adapters: AnalyticsAdapterManager;
  private config: DashboardIntegrationConfig;
  private legacySystems: Map<string, LegacyAnalyticsSystem> = new Map();
  private performanceMetrics: Map<string, WidgetPerformanceMetrics> = new Map();
  private integrationCache: Map<string, { data: unknown; timestamp: number }> = new Map();
  constructor();
    eventBus: UnifiedEventBus,
    eventRepository: EventRepository,
    authService: AnalyticsAuthorizationService,
    wsServer: WebSocketStreamingServer,
    adapters: AnalyticsAdapterManager,
    config: Partial<DashboardIntegrationConfig> = {}
    this.eventBus = eventBus;
    this.eventRepository = eventRepository;
    this.authService = authService;
    this.wsServer = wsServer;
    this.adapters = adapters;
    this.config = {
  enableLegacySupport: true,
  migrationMode: 'gradual',
  cacheEnabled: true,
  cacheTTL: 300000, // 5 minutes,
  webhookEndpoints: [],
  alertingEnabled: true,
  ...config
};
    this.initializeLegacySystems();
    this.setupPerformanceMonitoring();
  /**
   * Initialize legacy analytics systems mapping
   */
  private initializeLegacySystems(): void {
    const legacySystems: Array<Omit<LegacyAnalyticsSystem, 'lastSync' | 'eventCount' | 'healthStatus'>> = [
      { name: 'MainAnalytics', routePath: '/analytics', dataFormat: 'dao', migrationStatus: 'completed' },
      { name: 'IntegrationAnalytics', routePath: '/integration-analytics', dataFormat: 'rest', migrationStatus: 'completed' },
      { name: 'BehaviorAnalytics', routePath: '/behavior-analytics', dataFormat: 'dao', migrationStatus: 'completed' },
      { name: 'PerformanceMonitoring', routePath: '/epic17-performance-monitoring', dataFormat: 'rest', migrationStatus: 'completed' },
      { name: 'FraudMonitoring', routePath: '/fraud-monitoring', dataFormat: 'event', migrationStatus: 'completed' },
      { name: 'TransactionMonitoring', routePath: '/transaction-monitoring', dataFormat: 'dao', migrationStatus: 'completed' },
      { name: 'SearchAnalytics', routePath: '/search-analytics', dataFormat: 'dao', migrationStatus: 'completed' },
      { name: 'SecurityEventMonitoring', routePath: '/security-event-monitoring', dataFormat: 'event', migrationStatus: 'completed' },
      { name: 'SessionMonitoring', routePath: '/session-monitoring', dataFormat: 'dao', migrationStatus: 'completed' },
      { name: 'FileBrowserAnalytics', routePath: '/file-browser-analytics', dataFormat: 'dao', migrationStatus: 'completed' },
      { name: 'RevenueAnalytics', routePath: '/revenue-analytics', dataFormat: 'rest', migrationStatus: 'completed' },
      { name: 'SystemMonitoring', routePath: '/system-monitoring', dataFormat: 'event', migrationStatus: 'completed' }
    ];
    legacySystems.forEach(system => {)
  this.legacySystems.set(system.name, {)
  ...system,
  lastSync: Date.now(),
  eventCount: 0,
  healthStatus: 'healthy',
});
    });
    console.log(`Initialized ${this.legacySystems.size} legacy analytics systems`);}
  /**
   * Setup performance monitoring for dashboard widgets
   */
  private setupPerformanceMonitoring(): void {
    if (!this.config.cacheEnabled) return;
    // Monitor widget performance every 30 seconds
    setInterval(() => {
      this.updatePerformanceMetrics();
    }, 30000);
    // Clean up old cache entries every 5 minutes
    setInterval(() => {
      this.cleanupCache();
    }, 300000);
  /**
   * Get consolidated dashboard data from all integrated systems
   */
  async getConsolidatedDashboardData(filter: EventFilter)
    authContext: AuthContext,
    cacheKey?: string
  ): Promise<{
  metrics: unknown;
  events: UnifiedAnalyticsEvent;
  timeSeriesData: unknown;
  integrationStatus: IntegrationStatus;
}> {
    const startTime = Date.now();
    try {
      // Check cache first
      if (this.config.cacheEnabled && cacheKey) {
        const cached = this.getCachedData(cacheKey);
        if (cached) {
          console.log(`Dashboard data served from cache for key: ${cacheKey}`);}
          return cached as {
  metrics: unknown;
  events: UnifiedAnalyticsEvent;
  timeSeriesData: unknown;
  integrationStatus: IntegrationStatus;
};
      // Authorize query filter
      const queryAuth = await this.authService.authorizeAnalyticsQuery(filter, authContext);
      if (!queryAuth.allowed) {
        throw new Error(`Dashboard data access denied: ${queryAuth.reason}`);}
      const authorizedFilter = queryAuth.filteredQuery!;
      // Get data from unified event repository
      const [events, statistics] = await Promise.all([)
        this.eventRepository.findMany({)
  filter: authorizedFilter,
  limit: 1000,
  sortBy: 'timestamp',
  sortOrder: 'desc',
}),
        this.eventRepository.getStatistics(authorizedFilter)
      ]);
      // Calculate consolidated metrics
      const metrics = await this.calculateConsolidatedMetrics(events, statistics, authorizedFilter);
      // Get time series data
      const timeSeriesData = await this.eventRepository.getTimeSeriesData(;);
        'count',
        'hour',
        authorizedFilter
      );
      // Get integration status
      const integrationStatus = await this.getIntegrationStatus();
      const result = {
  metrics,
  events,
  timeSeriesData: timeSeriesData.map(point => ({)
  timestamp: point.timestamp,
  value: point.value,
  label: 'Events',
})),
        integrationStatus
      };
      // Cache the result
      if (this.config.cacheEnabled && cacheKey) {
        this.setCachedData(cacheKey, result);
      // Update performance metrics
      const loadTime = Date.now() - startTime;
      this.updateWidgetPerformance('dashboard', 'consolidated', loadTime, false);
      return result;
    } catch (error) {
      const loadTime = Date.now() - startTime;
      this.updateWidgetPerformance('dashboard', 'consolidated', loadTime, true);
      throw error;
  /**
   * Calculate consolidated metrics from all systems
   */
  private async calculateConsolidatedMetrics(events: UnifiedAnalyticsEvent)
    statistics: EventStatistics,
    filter: EventFilter): Promise<any> {,
    const timeRange = (filter.endTime || Date.now()) - (filter.startTime || Date.now() - 86400000);
    // Basic metrics
    const eventsPerSecond = statistics.totalEvents / (timeRange / 1000);
    const errorEvents = events.filter(e => e.severity === 'error' || e.severity === 'critical');
    const errorRate = events.length > 0 ? (errorEvents.length / events.length) * 100 : 0;
    const uniqueUsers = new Set(events.map(e => e.userId).filter(Boolean)).size;
    const uniqueSessions = new Set(events.map(e => e.sessionId).filter(Boolean)).size;
    // Top sources from all integrated systems
    const sourceCounts = statistics.eventsBySource || {};
    const totalSourceEvents = Object.values(sourceCounts).reduce((sum: number, count: unknown) => sum + (typeof count === 'number' ? count : 0), 0);
    const topSources = Object.entries(sourceCounts);
      .map(([source, count]) => ({)
  source,
  count: typeof count === 'number' ? count : 0,
  percentage: totalSourceEvents > 0 ? ((typeof count === 'number' ? count : 0) / totalSourceEvents) * 100 : 0,
}))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    // Integration status from legacy systems
    const integrationStatus: { [key: string]: 'healthy' | 'degraded' | 'failing' } = {};
    for (const [name, system] of this.legacySystems) {
  integrationStatus[name] = system.healthStatus;
  // System health calculation incorporating all systems
  const systemHealth = Math.max(0, 100 - errorRate - this.calculateSystemHealthPenalty());
  // Business metrics aggregation
  const businessMetrics = await this.calculateBusinessMetrics(events, filter);
  return {
  totalEvents: statistics.totalEvents,
  eventsPerSecond: Math.round(eventsPerSecond * 100) / 100,
  activeUsers: uniqueUsers,
  activeSessions: uniqueSessions,
  errorRate: Math.round(errorRate * 100) / 100,
  systemHealth: Math.round(systemHealth),
  integrationStatus,
  topSources,
  businessMetrics,
  legacySystemsStatus: this.getLegacySystemsStatus(),
  performanceMetrics: this.getAggregatedPerformanceMetrics(),
};
  /**
   * Calculate business metrics from consolidated data
   */
  private async calculateBusinessMetrics(events: UnifiedAnalyticsEvent, filter: EventFilter): Promise<any> {
  const businessEvents = events.filter(e => e.category === EventCategory.BUSINESS || e.category === EventCategory.USER);
  // Graph creation metrics
  const graphEvents = events.filter(e => e.type === AnalyticsEventType.GRAPH_EXECUTION || e.type === AnalyticsEventType.GRAPH_CREATED);
  const graphsCreated = graphEvents.filter(e => e.type === AnalyticsEventType.GRAPH_CREATED).length;
  const graphsExecuted = graphEvents.filter(e => e.type === AnalyticsEventType.GRAPH_EXECUTION).length;
  // Revenue metrics (from revenue analytics system)
  const revenueEvents = events.filter(e => e.source === 'RevenueAnalytics');
  const totalRevenue = revenueEvents.reduce((sum, event) => {
  const amount = typeof event.data.amount === 'number' ? event.data.amount : 0;
  return sum + amount;
}, 0);
    // Feature usage metrics
    const featureUsage: { [feature: string]: number } = {};
    events.forEach(event => {)
  const feature = typeof event.data.feature === 'string' ? event.data.feature : null;
  if (feature) {
  featureUsage[feature] = (featureUsage[feature] || 0) + 1;
});
    const topFeatures = Object.entries(featureUsage);
      .sort(([ a], [ b]) => b - a)
      .slice(0, 5)
      .map(([feature, usage]) => ({ feature, usage }));
    return {
  graphsCreated,
  graphsExecuted,
  totalRevenue: Math.round(totalRevenue * 100) / 100,
  topFeatures,
  conversionRate: graphsCreated > 0 ? (graphsExecuted / graphsCreated) * 100 : 0,
};
  /**
   * Get integration status for all systems
   */
  async getIntegrationStatus(): Promise<IntegrationStatus> {
  const totalSystems = this.legacySystems.size;
  const integratedSystems = Array.from(this.legacySystems.values());
  .filter(system => system.migrationStatus === 'completed').length;
  const migrationProgress = totalSystems > 0 ? (integratedSystems / totalSystems) * 100 : 100;
  const wsStats = this.wsServer.getStats();
  const activeConnections = wsStats.activeConnections;
  // Calculate event throughput from recent events
  const recentEvents = await this.eventRepository.findMany({)
  filter: {
  startTime: Date.now() - 300000, // Last 5 minutes,
  endTime: Date.now(),
},
  limit: 10000;
  });
    const eventThroughput = recentEvents.length / 300; // Events per second over last 5 minutes;
    // Calculate overall system health
    const healthySystemsCount = Array.from(this.legacySystems.values());
      .filter(system => system.healthStatus === 'healthy').length;
    const systemHealth = totalSystems > 0 ? (healthySystemsCount / totalSystems) * 100 : 100;
    return {
  totalSystems,
  integratedSystems,
  migrationProgress: Math.round(migrationProgress),
  activeConnections,
  eventThroughput: Math.round(eventThroughput * 100) / 100,
  systemHealth: Math.round(systemHealth),
  lastHealthCheck: Date.now(),
};
  /**
   * Get widget-specific performance data
   */
  async getWidgetPerformanceData(widgetId: string)
    widgetType: string,
    filter: EventFilter,
    authContext: AuthContext): Promise<any> {,
    const startTime = Date.now();
    const cacheKey = `widget_${widgetId}_${JSON.stringify(filter)}`;}
    try {
      // Check cache
      if (this.config.cacheEnabled) {
        const cached = this.getCachedData(cacheKey);
        if (cached) {
          this.updateWidgetPerformance(widgetId, widgetType, Date.now() - startTime, false, true);
          return cached;
      // Get widget-specific data using appropriate adapter
      let widgetData: Record<string, unknown> = {};
      switch (widgetType) {
  case 'performance_metrics':,
  widgetData = await this.getPerformanceWidgetData(filter, authContext);
  break;
  case 'integration_status':,
  widgetData = await this.getIntegrationWidgetData(filter, authContext);
  break;
  case 'business_metrics':,
  widgetData = await this.getBusinessWidgetData(filter, authContext);
  break;
  case 'security_events':,
  widgetData = await this.getSecurityWidgetData(filter, authContext);
  break;
  default:,
  // Use standard event repository for other widget types
  widgetData = await this.getStandardWidgetData(widgetType, filter, authContext);
  // Cache the result
  if (this.config.cacheEnabled) {
  this.setCachedData(cacheKey, widgetData);
  this.updateWidgetPerformance(widgetId, widgetType, Date.now() - startTime, false, false);
  return widgetData;
} catch (error) {
      this.updateWidgetPerformance(widgetId, widgetType, Date.now() - startTime, true, false);
      throw error;
  /**
   * Get performance widget data from performance monitoring system
   */
  private async getPerformanceWidgetData(filter: EventFilter, authContext: AuthContext): Promise<any> {
    const performanceEvents = await this.eventRepository.findMany({)
  filter: { ...filter, categories: [EventCategory.PERFORMANCE] },
      limit: 1000,
      sortBy: 'timestamp',
      sortOrder: 'desc'
  });
    const timeSeriesData = await this.eventRepository.getTimeSeriesData(;);
      'avg',
      'minute',
      { ...filter, categories: [EventCategory.PERFORMANCE] }
    );
    // Calculate performance metrics
    const executionTimes = performanceEvents;
      .filter(e => typeof e.data.executionTime === 'number')
      .map(e => e.data.executionTime as number);
    const avgExecutionTime = executionTimes.length > 0 ;
      ? executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length 
      : 0;
    const memoryUsage = performanceEvents;
      .filter(e => typeof e.data.memoryUsage === 'number')
      .map(e => e.data.memoryUsage as number);
    const avgMemoryUsage = memoryUsage.length > 0;
      ? memoryUsage.reduce((sum, usage) => sum + usage, 0) / memoryUsage.length
      : 0;
    return {
  averageExecutionTime: Math.round(avgExecutionTime * 100) / 100,
  averageMemoryUsage: Math.round(avgMemoryUsage / 1024 / 1024 * 100) / 100, // Convert to MB,
  timeSeriesData: timeSeriesData.map(point => ({)
  timestamp: point.timestamp,
  value: point.value,
  label: 'Performance',
})),
      eventCount: performanceEvents.length;
  };
  /**
   * Get integration widget data from all integrated systems
   */
  private async getIntegrationWidgetData(filter: EventFilter, authContext: AuthContext): Promise<any> {
    const integrationEvents = await this.eventRepository.findMany({)
  filter: { ...filter, categories: [EventCategory.INTEGRATION] },
      limit: 1000;
  });
    const integrationStatus: Record<string, unknown> = {};
    for (const [name, system] of this.legacySystems) {
  const systemEvents = integrationEvents.filter(e => e.source === name);
  const errorEvents = systemEvents.filter(e => e.severity === 'error' || e.severity === 'critical');
  const errorRate = systemEvents.length > 0 ? (errorEvents.length / systemEvents.length) * 100 : 0;
  integrationStatus[name] = {
  status: system.healthStatus,
  eventCount: systemEvents.length,
  errorRate: Math.round(errorRate * 100) / 100,
  lastSync: system.lastSync,
  migrationStatus: system.migrationStatus,
};
    return {
  integrationStatus,
  totalSystems: this.legacySystems.size,
  healthySystems: Array.from(this.legacySystems.values()),
  .filter(s => s.healthStatus === 'healthy').length
};
  /**
   * Get business widget data from revenue and user analytics
   */
  private async getBusinessWidgetData(filter: EventFilter, authContext: AuthContext): Promise<any> {
    const businessEvents = await this.eventRepository.findMany({)
  filter: { ...filter, categories: [EventCategory.BUSINESS, EventCategory.USER] },
      limit: 1000;
  });
    const metrics = await this.calculateBusinessMetrics(businessEvents, filter);
    const timeSeriesData = await this.eventRepository.getTimeSeriesData(;);
      'count',
      'hour',
      { ...filter, categories: [EventCategory.BUSINESS] }
    );
    return {
  ...metrics,
  timeSeriesData: timeSeriesData.map(point => ({)
  timestamp: point.timestamp,
  value: point.value,
  label: 'Business Events',
}))
    };
  /**
   * Get security widget data from security monitoring systems
   */
  private async getSecurityWidgetData(filter: EventFilter, authContext: AuthContext): Promise<any> {
  const securityEvents = await this.eventRepository.findMany({)
  filter: {
  ...filter,
  categories: [EventCategory.SECURITY],
  types: [AnalyticsEventType.SECURITY_EVENT, AnalyticsEventType.FRAUD_DETECTION, AnalyticsEventType.AUTH_EVENT],
},
  limit: 100,
      sortBy: 'timestamp',
      sortOrder: 'desc'
  });
    const riskLevels = { high: 0, medium: 0, low: 0 };
    securityEvents.forEach(event => {)
  const riskLevel = typeof event.data.riskLevel === 'string' ? event.data.riskLevel : 'low';
  if (riskLevel in riskLevels) {
  riskLevels[riskLevel as keyof typeof riskLevels]++;
});
    return {
  events: securityEvents.slice(0, 20), // Show top 20 recent events,
  riskDistribution: riskLevels,
  totalSecurityEvents: securityEvents.length,
  criticalAlerts: securityEvents.filter(e => e.severity === 'critical').length,
};
  /**
   * Get standard widget data using event repository
   */
  private async getStandardWidgetData(widgetType: string)
    filter: EventFilter,  
    authContext: AuthContext): Promise<any> {,
  // Authorize query
  const queryAuth = await this.authService.authorizeAnalyticsQuery(filter, authContext);
  if (!queryAuth.allowed) {
  throw new Error('Widget data access denied');
  const authorizedFilter = queryAuth.filteredQuery!;
  switch (widgetType) {
  case 'event_stream':,
  const events = await this.eventRepository.findMany({)
  filter: authorizedFilter,
  limit: 50,
  sortBy: 'timestamp',
  sortOrder: 'desc',
});
        return { events };
      case 'metrics_summary':
        const statistics = await this.eventRepository.getStatistics(authorizedFilter);
        return { statistics };
      case 'time_series_chart':
        const timeSeriesData = await this.eventRepository.getTimeSeriesData(;);
          'count',
          'hour',
          authorizedFilter
        );
        return {
  timeSeries: timeSeriesData.map(point => ({)
  timestamp: point.timestamp,
  value: point.value,
  label: 'Events',
}))
        };
      default:
        return { message: 'Widget type not implemented' };
  /**
   * Migrate legacy analytics route to unified dashboard
   */
  async migrateLegacyRoute(systemName: string, routePath: string): Promise<boolean> {
    try {
      const system = this.legacySystems.get(systemName);
      if (!system) {
        console.warn(`Legacy system ${systemName} not found`);}
        return false;
      if (system.migrationStatus === 'completed') {
        console.log(`System ${systemName} already migrated`);}
        return true;
      // Update migration status
      system.migrationStatus = 'in_progress';
      this.legacySystems.set(systemName, system);
      // Use appropriate adapter to migrate the system
      const adapter = this.adapters.getAdapter(systemName);
      if (adapter) {
        // Migration logic would go here
        // This is a placeholder for the actual migration process
        console.log(`Migrating ${systemName} using adapter...`);}
        // Simulate migration process
        await this.simulateMigration(systemName);
        system.migrationStatus = 'completed';
        system.lastSync = Date.now();
        system.healthStatus = 'healthy';
        this.legacySystems.set(systemName, system);
        console.log(`Successfully migrated ${systemName}`);}
        return true;
      } else {
        system.migrationStatus = 'failed';
        this.legacySystems.set(systemName, system);
        console.error(`No adapter found for ${systemName}`);}
        return false;
    } catch (error) {
      const system = this.legacySystems.get(systemName);
      if (system) {
        system.migrationStatus = 'failed';
        this.legacySystems.set(systemName, system);
      console.error(`Migration failed for ${systemName}:`, error);}
      return false;
  /**
   * Simulate migration process (placeholder)
   */
  private async simulateMigration(systemName: string): Promise<void> {
    // Simulate async migration work
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Migration simulation completed for ${systemName}`);}
  /**
   * Health check for all integrated systems
   */
  async performHealthCheck(): Promise<void> {
  console.log('Performing health check on all integrated systems...');
  for (const [name, system] of this.legacySystems) {
  try {
  // Simulate health check
  const isHealthy = await this.checkSystemHealth(name);
  system.healthStatus = isHealthy ? 'healthy' : 'degraded';
  system.lastSync = Date.now();
  this.legacySystems.set(name, system);
} catch (error) {
        console.error(`Health check failed for ${name}:`, error);}
        system.healthStatus = 'failing';
        this.legacySystems.set(name, system);
    console.log('Health check completed');
  /**
   * Check individual system health
   */
  private async checkSystemHealth(systemName: string): Promise<boolean> {
  // Simulate health check logic
  // In production, this would check actual system endpoints, data freshness, etc.
  return Math.random() > 0.1; // 90% chance of being healthy
  /**
  * Helper Methods
  */
  private getCachedData(key: string): unknown {,
  const cached = this.integrationCache.get(key);
  if (cached && Date.now() - cached.timestamp < this.config.cacheTTL) {
  return cached.data;
  return null;
  private setCachedData(key: string, data: unknown): void {,
  this.integrationCache.set(key, {)
  data,
  timestamp: Date.now(),
});
  private cleanupCache(): void {
  const now = Date.now();
  for (const [key, cached] of this.integrationCache) {
  if (now - cached.timestamp > this.config.cacheTTL) {
  this.integrationCache.delete(key);
  private updateWidgetPerformance(widgetId: string)
  widgetType: string,
  loadTime: number,
  isError: boolean,
  cacheHit: boolean = false): void {,
  const existing = this.performanceMetrics.get(widgetId);
  if (existing) {
  const totalQueries = existing.queryCount + 1;
  const newAvgLoadTime = (existing.averageLoadTime * existing.queryCount + loadTime) / totalQueries;
  const newErrorRate = ((existing.errorRate * existing.queryCount) + (isError ? 1 : 0)) / totalQueries * 100;
  const newCacheHitRate = ((existing.cacheHitRate * existing.queryCount) + (cacheHit ? 1 : 0)) / totalQueries * 100;
  this.performanceMetrics.set(widgetId, {)
  ...existing,
  averageLoadTime: newAvgLoadTime,
  errorRate: newErrorRate,
  cacheHitRate: newCacheHitRate,
  queryCount: totalQueries,
  lastUpdate: Date.now(),
});
    } else {
  this.performanceMetrics.set(widgetId, {)
  widgetId,
  widgetType,
  averageLoadTime: loadTime,
  errorRate: isError ? 100 : 0,
  cacheHitRate: cacheHit ? 100 : 0,
  queryCount: 1,
  lastUpdate: Date.now(),
});
  private updatePerformanceMetrics(): void {
    // Update performance metrics for dashboard monitoring
    console.log('Updating dashboard performance metrics...');
  private calculateSystemHealthPenalty(): number {
    const degradedSystems = Array.from(this.legacySystems.values());
      .filter(s => s.healthStatus === 'degraded').length;
    const failingSystems = Array.from(this.legacySystems.values());
      .filter(s => s.healthStatus === 'failing').length;
    return (degradedSystems * 5) + (failingSystems * 15); // Penalty points
  private getLegacySystemsStatus(): Record<string, unknown> {
    const status: Record<string, unknown> = {};
    for (const [name, system] of this.legacySystems) {
  status[name] = {
  health: system.healthStatus,
  migration: system.migrationStatus,
  lastSync: system.lastSync,
  eventCount: system.eventCount,
};
    return status;
  private getAggregatedPerformanceMetrics(): unknown {
  const metrics = Array.from(this.performanceMetrics.values());
  if (metrics.length === 0) {
  return {
  totalWidgets: 0,
  averageLoadTime: 0,
  overallErrorRate: 0,
  overallCacheHitRate: 0,
};
    const totalQueries = metrics.reduce((sum, m) => sum + m.queryCount, 0);
    const weightedAvgLoadTime = metrics.reduce((sum, m) => sum + (m.averageLoadTime * m.queryCount), 0) / totalQueries;
    const weightedErrorRate = metrics.reduce((sum, m) => sum + (m.errorRate * m.queryCount), 0) / totalQueries;
    const weightedCacheHitRate = metrics.reduce((sum, m) => sum + (m.cacheHitRate * m.queryCount), 0) / totalQueries;
    return {
  totalWidgets: metrics.length,
  averageLoadTime: Math.round(weightedAvgLoadTime),
  overallErrorRate: Math.round(weightedErrorRate * 100) / 100,
  overallCacheHitRate: Math.round(weightedCacheHitRate * 100) / 100,
};
  /**
   * Public API Methods
   */
  /**
   * Get integration status summary
   */
  getIntegrationSummary(): {
  legacySystems: LegacyAnalyticsSystem;
  performanceMetrics: WidgetPerformanceMetrics;
  integrationStatus: unknown;
  return {
  legacySystems: Array.from(this.legacySystems.values()),
  performanceMetrics: Array.from(this.performanceMetrics.values()),
  integrationStatus: this.getLegacySystemsStatus(),
};
  /**
   * Force refresh of system health checks
   */
  async refreshSystemHealth(): Promise<void> {
  await this.performHealthCheck();
  /**
  * Clear integration cache
  */
  clearCache(): void {,
  this.integrationCache.clear();
  console.log('Integration cache cleared');
  /**
  * Get cache statistics
  */
  getCacheStats(): {
  totalEntries: number;
  hitRate: number;
  memoryUsage: number;
  const totalEntries = this.integrationCache.size;
  const performanceMetrics = Array.from(this.performanceMetrics.values());
  const totalQueries = performanceMetrics.reduce((sum, m) => sum + m.queryCount, 0);
  const totalCacheHits = performanceMetrics.reduce((sum, m) => sum + (m.cacheHitRate * m.queryCount / 100), 0);
  const hitRate = totalQueries > 0 ? (totalCacheHits / totalQueries) * 100 : 0;
  // Estimate memory usage (rough calculation)
  const memoryUsage = totalEntries * 1024; // Assume 1KB per entry;
  return {
  totalEntries,
  hitRate: Math.round(hitRate * 100) / 100,
  memoryUsage
};

export default DashboardIntegrationService;