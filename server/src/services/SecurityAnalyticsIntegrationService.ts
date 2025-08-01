/**
 * Security Analytics Integration Service
 * Epic 31.4.3.1 - Security Analytics Performance Monitoring Integration
 * 
 * Integrates SecurityAnalyticsPerformanceMonitor with Epic 1 Analytics Foundation
 * and Epic 17 Admin/Auth Systems for comprehensive security monitoring.
 */

import { EventEmitter } from 'events';
import { 
  SecurityAnalyticsPerformanceMonitor,
  AnalyticsPerformanceProfile
 from '../../../packages/core/security/SecurityAnalyticsPerformanceMonitor';
import { AnalyticsCollector, AnalyticsEvent, PerformanceMetricEvent } from '../analytics/AnalyticsCollector';
import { AnalyticsDAO } from '../database/analytics-dao';
import { AdminAuthGuard } from '../admin/guards/AdminAuthGuard';
import { HealthCheckFramework } from '../admin/HealthCheckFramework';
import { DiagnosticService } from '../admin/DiagnosticService';



export interface SecurityAnalyticsIntegrationConfig {
  epic1_analytics_integration: {
    enabled: boolean;
    analytics_collector: AnalyticsCollector;
    analytics_dao: AnalyticsDAO;
    performance_event_forwarding: boolean;
    batch_size: number;
    flush_interval_ms: number;



  };
  
  epic17_admin_integration: {
    enabled: boolean;
    auth_guard: AdminAuthGuard;
    health_check_framework: HealthCheckFramework;
    diagnostic_service: DiagnosticService;
    admin_notification_enabled: boolean;
    security_alert_threshold: number;
  };
  
  performance_monitoring: {
    real_time_monitoring_enabled: boolean;
    performance_threshold_ms: number;
    memory_threshold_mb: number;
    cpu_threshold_percent: number;
    alert_on_degradation: boolean;
    auto_optimization_enabled: boolean;
  };
  
  security_features: {
    threat_detection_enabled: boolean;
    anomaly_detection_sensitivity: number;
    correlation_analysis_enabled: boolean;
    predictive_analytics_enabled: boolean;
    automated_response_enabled: boolean;
  };




export interface SecurityPerformanceMetrics {
  timestamp: number;
  performance_score: number;
  throughput_events_per_second: number;
  latency_p95_ms: number;
  memory_usage_mb: number;
  cpu_usage_percent: number;
  active_threats_detected: number;
  security_events_processed: number;
  compliance_violations: number;
  system_availability_percent: number;







export interface SecurityAnalyticsAlert {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'performance_degradation' | 'security_threat' | 'compliance_violation' | 'system_failure';
  title: string;
  description: string;
  metrics: SecurityPerformanceMetrics;
  affected_components: string[];
  recommended_actions: string[];
  created_at: number;
  resolved_at?: number;
  resolved_by?: string;





export class SecurityAnalyticsIntegrationService extends EventEmitter {
  private performanceMonitor: SecurityAnalyticsPerformanceMonitor;
  private config: SecurityAnalyticsIntegrationConfig;
  private metricsBuffer: SecurityPerformanceMetrics[] = [];
  private alertsBuffer: SecurityAnalyticsAlert[] = [];
  private isMonitoring = false;
  private monitoringInterval?: NodeJS.Timeout;

  constructor(config: SecurityAnalyticsIntegrationConfig) {
    super();
    this.config = config;
    this.performanceMonitor = new SecurityAnalyticsPerformanceMonitor({
      sampling_rate: 0.1, // 10% sampling for production performance
      real_time_enabled: config.performance_monitoring.real_time_monitoring_enabled,
      persistence_enabled: true,
      alert_thresholds: {
        performance_degradation: config.performance_monitoring.performance_threshold_ms,
        memory_usage: config.performance_monitoring.memory_threshold_mb,
        cpu_usage: config.performance_monitoring.cpu_threshold_percent

    });

    this.setupEventHandlers();


  /**
   * Initialize the integration service with Epic 1 and Epic 17 systems
   */
  async initialize(): Promise<void> {

    try {
      // Initialize performance monitoring
      await this.performanceMonitor.initialize();

      // Register with Epic 1 Analytics Foundation
      if (this.config.epic1_analytics_integration.enabled) {
        await this.initializeEpic1Integration();


      // Register with Epic 17 Admin/Auth Systems
      if (this.config.epic17_admin_integration.enabled) {
        await this.initializeEpic17Integration();


      // Start monitoring if configured
      if (this.config.performance_monitoring.real_time_monitoring_enabled) {
        this.startRealTimeMonitoring();


      this.emit('initialized', { timestamp: Date.now() });
 catch (error) {
      this.emit('error', { error, context: 'initialization' });
      throw error;



  /**
   * Epic 1 Analytics Foundation Integration
   */
  private async initializeEpic1Integration(): Promise<void> {

    const { analytics_collector, analytics_dao } = this.config.epic1_analytics_integration;

    // Register performance event handler
    this.performanceMonitor.on('performance_metrics', (metrics: unknown) => {
      const performanceEvent: PerformanceMetricEvent = {
        type: 'performance_metric',
        timestamp: Date.now(),
        sessionId: 'security_analytics_' + Date.now(),
        executionId: metrics.execution_id || 'unknown',
        operation: 'security_analytics_monitoring',
        duration: metrics.operation_duration_ms || 0,
        memoryUsage: metrics.memory_usage_mb || 0,
        cpuUsage: metrics.cpu_usage_percent || 0,
        metadata: {
          security_events_processed: metrics.events_processed,
          threat_detection_accuracy: metrics.threat_detection_accuracy,
          compliance_score: metrics.compliance_score

      };

      // Forward to Epic 1 analytics system
      if (this.config.epic1_analytics_integration.performance_event_forwarding) {
        analytics_collector.track(performanceEvent);


      // Store in analytics database
      this.storeSecurityMetrics(metrics);
    });

    // Register security event correlation
    this.performanceMonitor.on('security_event', (event: unknown) => {
      const analyticsEvent: AnalyticsEvent = {
        type: 'user_interaction', // Map to existing Epic 1 event type
        timestamp: Date.now(),
        sessionId: 'security_' + Date.now(),
        userId: event.user_id,
        action: 'security_event_detected',
        target: event.threat_type || 'unknown',
        metadata: {
          severity: event.severity,
          threat_type: event.threat_type,
          affected_resources: event.affected_resources,
          mitigation_applied: event.mitigation_applied

      };

      analytics_collector.track(analyticsEvent);
    });


  /**
   * Epic 17 Admin/Auth Systems Integration
   */
  private async initializeEpic17Integration(): Promise<void> {

    const { health_check_framework, diagnostic_service } = this.config.epic17_admin_integration;

    // Register security health checks
    await health_check_framework.registerHealthCheck({
      id: 'security_analytics_performance',
      name: 'Security Analytics Performance Monitor',
      description: 'Monitors security analytics system performance and health',
      check: async () => {
        const metrics = await this.getCurrentPerformanceMetrics();
        const isHealthy = metrics.performance_score > 80 && 
                         metrics.system_availability_percent > 99.0;
        
        return {
          healthy: isHealthy,
          metrics: metrics,
          details: {
            performance_score: metrics.performance_score,
            availability: metrics.system_availability_percent,
            active_threats: metrics.active_threats_detected

        };

      interval_ms: 30000, // Check every 30 seconds
      timeout_ms: 5000
    });

    // Register diagnostic capabilities
    diagnostic_service.registerDiagnostic({
      id: 'security_analytics_deep_diagnostics',
      name: 'Security Analytics Deep Diagnostics',
      description: 'Comprehensive security analytics system diagnostics',
      execute: async () => {
        return await this.performDeepDiagnostics();

    });

    // Security alert integration
    this.on('security_alert', async (alert: SecurityAnalyticsAlert) => {
      if (alert.severity === 'critical' || alert.severity === 'high') {
        await this.notifyAdminSystems(alert);

    });


  /**
   * Start real-time monitoring
   */
  private startRealTimeMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(async () => {
      try {
        const metrics = await this.collectCurrentMetrics();
        this.metricsBuffer.push(metrics);

        // Analyze for anomalies and alerts
        const alerts = await this.analyzeMetricsForAlerts(metrics);
        alerts.forEach(alert => {
          this.alertsBuffer.push(alert);
          this.emit('security_alert', alert);
        });

        // Flush buffers if needed
        if (this.metricsBuffer.length >= this.config.epic1_analytics_integration.batch_size) {
          await this.flushMetricsBuffer();


        this.emit('metrics_collected', metrics);
 catch (error) {
        this.emit('error', { error, context: 'real_time_monitoring' });

    }, this.config.epic1_analytics_integration.flush_interval_ms);


  /**
   * Collect current security analytics performance metrics
   */
  private async collectCurrentMetrics(): Promise<SecurityPerformanceMetrics> {

    const performanceProfile = await this.performanceMonitor.getCurrentPerformanceProfile();
    const systemMetrics = await this.performanceMonitor.getSystemMetrics();
    const securityMetrics = await this.performanceMonitor.getSecurityMetrics();

    return {
      timestamp: Date.now(),
      performance_score: performanceProfile?.current_state.overall_performance_score || 0,
      throughput_events_per_second: systemMetrics.throughput_events_per_second || 0,
      latency_p95_ms: systemMetrics.latency_p95_ms || 0,
      memory_usage_mb: systemMetrics.memory_usage_mb || 0,
      cpu_usage_percent: systemMetrics.cpu_usage_percent || 0,
      active_threats_detected: securityMetrics.active_threats || 0,
      security_events_processed: securityMetrics.events_processed || 0,
      compliance_violations: securityMetrics.compliance_violations || 0,
      system_availability_percent: systemMetrics.availability_percent || 100
    };


  /**
   * Analyze metrics for potential alerts
   */
  private async analyzeMetricsForAlerts(metrics: SecurityPerformanceMetrics): Promise<SecurityAnalyticsAlert[]> {

    const alerts: SecurityAnalyticsAlert[] = [];

    // Performance degradation alert
    if (metrics.performance_score < 70) {
      alerts.push({
        id: `perf_degradation_${Date.now()}`,
        severity: metrics.performance_score < 50 ? 'critical' : 'high',
        type: 'performance_degradation',
        title: 'Security Analytics Performance Degradation',
        description: `System performance score dropped to ${metrics.performance_score}%`,
        metrics,
        affected_components: ['security_analytics', 'threat_detection'],
        recommended_actions: [
          'Check system resources',
          'Review active security profiles',
          'Consider scaling resources'
        ],
        created_at: Date.now()
      });


    // High threat detection alert
    if (metrics.active_threats_detected > this.config.epic17_admin_integration.security_alert_threshold) {
      alerts.push({
        id: `high_threats_${Date.now()}`,
        severity: 'critical',
        type: 'security_threat',
        title: 'High Number of Active Threats Detected',
        description: `${metrics.active_threats_detected} active threats currently detected`,
        metrics,
        affected_components: ['threat_detection', 'security_monitoring'],
        recommended_actions: [
          'Review threat details',
          'Apply additional security measures',
          'Consider incident response procedures'
        ],
        created_at: Date.now()
      });


    // System availability alert
    if (metrics.system_availability_percent < 99.0) {
      alerts.push({
        id: `availability_${Date.now()}`,
        severity: metrics.system_availability_percent < 95.0 ? 'critical' : 'high',
        type: 'system_failure',
        title: 'Security Analytics System Availability Issue',
        description: `System availability at ${metrics.system_availability_percent}%`,
        metrics,
        affected_components: ['security_analytics', 'monitoring_infrastructure'],
        recommended_actions: [
          'Check system health',
          'Review error logs',
          'Verify infrastructure status'
        ],
        created_at: Date.now()
      });


    return alerts;


  /**
   * Store security metrics in Epic 1 analytics database
   */
  private async storeSecurityMetrics(metrics: SecurityPerformanceMetrics): Promise<void> {

    if (!this.config.epic1_analytics_integration.enabled) return;

    try {
      const { analytics_dao } = this.config.epic1_analytics_integration;
      
      // Store as custom analytics event
      await analytics_dao.insertEvent({
        type: 'security_performance_metric',
        timestamp: metrics.timestamp,
        sessionId: `security_monitoring_${Date.now()}`,
        data: JSON.stringify(metrics),
        metadata: {
          performance_score: metrics.performance_score,
          threats_detected: metrics.active_threats_detected,
          system_availability: metrics.system_availability_percent

      });
 catch (error) {
      this.emit('error', { error, context: 'store_security_metrics' });



  /**
   * Notify Epic 17 admin systems of security alerts
   */
  private async notifyAdminSystems(alert: SecurityAnalyticsAlert): Promise<void> {

    if (!this.config.epic17_admin_integration.admin_notification_enabled) return;

    try {
      const { diagnostic_service } = this.config.epic17_admin_integration;
      
      // Create admin notification
      await diagnostic_service.createAlert({
        id: alert.id,
        severity: alert.severity,
        title: alert.title,
        description: alert.description,
        source: 'security_analytics_integration',
        metadata: {
          affected_components: alert.affected_components,
          recommended_actions: alert.recommended_actions,
          performance_metrics: alert.metrics

        created_at: alert.created_at
      });
 catch (error) {
      this.emit('error', { error, context: 'notify_admin_systems' });



  /**
   * Perform deep diagnostics for Epic 17 integration
   */
  private async performDeepDiagnostics(): Promise<unknown> {

    const diagnostics = {
      timestamp: Date.now(),
      integration_status: {
        epic1_analytics: this.config.epic1_analytics_integration.enabled,
        epic17_admin: this.config.epic17_admin_integration.enabled,
        real_time_monitoring: this.isMonitoring

      current_metrics: await this.getCurrentPerformanceMetrics(),
      performance_history: this.metricsBuffer.slice(-10), // Last 10 metrics
      recent_alerts: this.alertsBuffer.slice(-5), // Last 5 alerts
      system_health: {
        buffer_sizes: {
          metrics: this.metricsBuffer.length,
          alerts: this.alertsBuffer.length

        monitoring_active: this.isMonitoring,
        last_flush: this.getLastFlushTime(}
    };

    return diagnostics;


  /**
   * Get current performance metrics
   */
  private async getCurrentPerformanceMetrics(): Promise<SecurityPerformanceMetrics> {

    return await this.collectCurrentMetrics();


  /**
   * Flush metrics buffer to Epic 1 analytics
   */
  private async flushMetricsBuffer(): Promise<void> {

    if (this.metricsBuffer.length === 0) return;

    try {
      const metricsToFlush = [...this.metricsBuffer];
      this.metricsBuffer = [];

      // Batch store metrics
      for (const metrics of metricsToFlush) {
        await this.storeSecurityMetrics(metrics);


      this.emit('metrics_flushed', { count: metricsToFlush.length });
 catch (error) {
      this.emit('error', { error, context: 'flush_metrics_buffer' });



  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    // Handle performance monitor events
    this.performanceMonitor.on('error', (error) => {
      this.emit('error', { error, context: 'performance_monitor' });
    });

    this.performanceMonitor.on('performance_degradation', (data) => {
      this.emit('performance_degradation', data);
    });

    this.performanceMonitor.on('security_anomaly', (data) => {
      this.emit('security_anomaly', data);
    });


  /**
   * Get last flush time
   */
  private getLastFlushTime(): number {
    // Implementation would track actual flush times
    return Date.now();


  /**
   * Stop monitoring and cleanup
   */
  async shutdown(): Promise<void> {

    this.isMonitoring = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);


    // Flush remaining metrics
    await this.flushMetricsBuffer();

    // Shutdown performance monitor
    await this.performanceMonitor.shutdown();

    this.emit('shutdown', { timestamp: Date.now() });


  /**
   * Get integration status
   */
  getIntegrationStatus(): unknown {
    return {
      epic1_integration: this.config.epic1_analytics_integration.enabled,
      epic17_integration: this.config.epic17_admin_integration.enabled,
      monitoring_active: this.isMonitoring,
      metrics_buffer_size: this.metricsBuffer.length,
      alerts_buffer_size: this.alertsBuffer.length
    };

