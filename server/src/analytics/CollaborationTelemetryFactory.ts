/**
 * Collaboration Telemetry Factory for Epic 23
 * 
 * Factory class for setting up the complete collaboration telemetry system
 * with proper integration into existing PromptScape infrastructure.
 */

import { WebSocketServer } from '../websocket/WebSocketServer';
import { AnalyticsCollector } from './AnalyticsCollector';
import { AnalyticsWebSocketServer } from '../websocket/AnalyticsWebSocketServer';
import { CollaborationTelemetryService, CollaborationTelemetryServiceConfig } from './CollaborationTelemetryService';
import { getDatabase } from '../database/connection';
import { AnalyticsDAO } from '../database/analytics-dao';



export interface CollaborationTelemetrySetup {
  telemetryService: CollaborationTelemetryService;
  analyticsCollector: AnalyticsCollector;
  analyticsWebSocketServer: AnalyticsWebSocketServer;





export class CollaborationTelemetryFactory {
  
  /**
   * Initialize the complete collaboration telemetry system
   */
  static async initialize(
    wsServer: WebSocketServer,
    config: Partial<CollaborationTelemetryServiceConfig> = {}
  ): Promise<CollaborationTelemetrySetup> {

    console.log('🚀 Initializing Epic 23 collaboration telemetry system...');

    try {
      // Initialize database connection
      const db = getDatabase();
      
      // Create analytics DAO for storing telemetry data
      const analyticsDAO = new AnalyticsDAO(db);
      
      // Initialize main analytics collector
      const analyticsCollector = new AnalyticsCollector({
        enabled: process.env.COLLABORATION_ANALYTICS_ENABLED !== 'false',
        sampleRate: parseFloat(process.env.COLLABORATION_ANALYTICS_SAMPLE_RATE || '1.0'),
        privacyMode: process.env.ANALYTICS_PRIVACY_MODE === 'true'
      });

      // Set up event storage handler
      analyticsCollector.on('events_flushed', (events) => {
        events.forEach((event: any) => analyticsDAO.storeEvent(event));
      });

      // Initialize analytics WebSocket server for real-time dashboards
      const analyticsWebSocketServer = new AnalyticsWebSocketServer({
        port: parseInt(process.env.ANALYTICS_WS_PORT || '8001'),
        enableAuthentication: process.env.ANALYTICS_WS_AUTH_ENABLED === 'true',
        corsOrigins: process.env.ANALYTICS_WS_CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
        maxConnections: parseInt(process.env.ANALYTICS_WS_MAX_CONNECTIONS || '1000')
      });

      // Start analytics WebSocket server
      await analyticsWebSocketServer.start();
      
      // Create the collaboration telemetry service with enhanced config
      const telemetryConfig: Partial<CollaborationTelemetryServiceConfig> = {
        enabled: process.env.EPIC23_TELEMETRY_ENABLED !== 'false',
        enableLatencyMeasurement: process.env.EPIC23_LATENCY_MEASUREMENT === 'true',
        latencyMeasurementInterval: parseInt(process.env.EPIC23_LATENCY_INTERVAL || '5000'),
        sessionHeartbeatInterval: parseInt(process.env.EPIC23_HEARTBEAT_INTERVAL || '30000'),
        enablePerformanceTracking: process.env.EPIC23_PERFORMANCE_TRACKING === 'true',
        enableConflictTracking: process.env.EPIC23_CONFLICT_TRACKING === 'true',
        ...config
      };

      const telemetryService = new CollaborationTelemetryService(
        wsServer,
        analyticsCollector,
        analyticsWebSocketServer,
        telemetryConfig
      );

      console.log('✅ Epic 23 collaboration telemetry system initialized successfully');
      console.log('📊 Telemetry enabled:', telemetryConfig.enabled);
      console.log('⚡ Latency measurement:', telemetryConfig.enableLatencyMeasurement);
      console.log('🔄 Conflict tracking:', telemetryConfig.enableConflictTracking);
      console.log('📈 Performance tracking:', telemetryConfig.enablePerformanceTracking);

      return {
        telemetryService,
        analyticsCollector,
        analyticsWebSocketServer
      };
 catch (error) {
      console.error('❌ Failed to initialize collaboration telemetry system:', error);
      throw new Error(`Collaboration telemetry initialization failed: ${error instanceof Error ? error.message : String(error)}`);



  /**
   * Create telemetry routes for server integration
   */
  static createTelemetryRoutes(setup: CollaborationTelemetrySetup) {
    return {
      // Dashboard data endpoint
      '/api/collaboration/dashboard': async (request: any, reply: any) => {
        try {
          const dashboardData = await setup.telemetryService.getCollaborationDashboard();
          reply.send({
            success: true,
            data: dashboardData
          });
 catch (error) {
          reply.code(500).send({
            success: false,
            error: 'Failed to retrieve collaboration dashboard',
            details: error instanceof Error ? error.message : String(error)
          });


      // Epic 23 status endpoint
      '/api/collaboration/epic23/status': async (request: any, reply: any) => {
        try {
          const statusData = setup.telemetryService.getEpic23Status();
          reply.send({
            success: true,
            data: statusData
          });
 catch (error) {
          reply.code(500).send({
            success: false,
            error: 'Failed to retrieve Epic 23 status',
            details: error instanceof Error ? error.message : String(error)
          });


      // Health check for telemetry system
      '/api/collaboration/telemetry/health': async (request: any, reply: any) => {
        try {
          const health = {
            status: 'healthy',
            timestamp: new Date(),
            components: {
              telemetryService: setup.telemetryService ? 'active' : 'inactive',
              analyticsCollector: setup.analyticsCollector ? 'active' : 'inactive',
              analyticsWebSocket: setup.analyticsWebSocketServer ? 'active' : 'inactive'

            metrics: {
              // Add any health metrics here

          };

          reply.send({
            success: true,
            data: health
          });
 catch (error) {
          reply.code(500).send({
            success: false,
            error: 'Telemetry health check failed',
            details: error instanceof Error ? error.message : String(error)
          });


    };


  /**
   * Cleanup all telemetry resources
   */
  static async cleanup(setup: CollaborationTelemetrySetup): Promise<void> {

    console.log('🧹 Cleaning up collaboration telemetry system...');

    try {
      // Clean up telemetry service
      setup.telemetryService.destroy();

      // Clean up analytics WebSocket server
      await setup.analyticsWebSocketServer.stop();

      console.log('✅ Collaboration telemetry cleanup completed');
 catch (error) {
      console.error('❌ Error during telemetry cleanup:', error);



  /**
   * Create configuration from environment variables
   */
  static createConfigFromEnvironment(): Partial<CollaborationTelemetryServiceConfig> {
    return {
      enabled: process.env.EPIC23_TELEMETRY_ENABLED !== 'false',
      enableLatencyMeasurement: process.env.EPIC23_LATENCY_MEASUREMENT === 'true',
      latencyMeasurementInterval: parseInt(process.env.EPIC23_LATENCY_INTERVAL || '5000'),
      sessionHeartbeatInterval: parseInt(process.env.EPIC23_HEARTBEAT_INTERVAL || '30000'),
      enablePerformanceTracking: process.env.EPIC23_PERFORMANCE_TRACKING !== 'false',
      enableConflictTracking: process.env.EPIC23_CONFLICT_TRACKING !== 'false'
    };


  /**
   * Validate telemetry configuration
   */
  static validateConfig(config: Partial<CollaborationTelemetryServiceConfig>): boolean {
    if (config.latencyMeasurementInterval && config.latencyMeasurementInterval < 1000) {
      console.warn('⚠️ Latency measurement interval is too low, recommend >= 1000ms');
      return false;


    if (config.sessionHeartbeatInterval && config.sessionHeartbeatInterval < 5000) {
      console.warn('⚠️ Session heartbeat interval is too low, recommend >= 5000ms');
      return false;


    return true;


  /**
   * Log telemetry system information
   */
  static logSystemInfo(config: Partial<CollaborationTelemetryServiceConfig>): void {
    console.log('📋 Epic 23 Telemetry Configuration:');
    console.log('  Enabled:', config.enabled ?? true);
    console.log('  Latency Measurement:', config.enableLatencyMeasurement ?? true);
    console.log('  Latency Interval:', config.latencyMeasurementInterval ?? 5000, 'ms');
    console.log('  Heartbeat Interval:', config.sessionHeartbeatInterval ?? 30000, 'ms');
    console.log('  Performance Tracking:', config.enablePerformanceTracking ?? true);
    console.log('  Conflict Tracking:', config.enableConflictTracking ?? true);
    console.log('');



export default CollaborationTelemetryFactory;