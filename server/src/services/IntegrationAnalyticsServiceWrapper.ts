/**
 * Integration Analytics Service Wrapper - Epic 17.4.3 Implementation
 * Task: E17-1753114397205-8ACF1D - Create integration analytics
 * 
 * Service wrapper that handles initialization, configuration, and integration
 * of the Integration Analytics Service with the main Fastify application.
 */

import { FastifyInstance } from 'fastify';
import { 
  IntegrationAnalyticsService,
  IntegrationAnalyticsConfig,
  IntegrationType,
  IntegrationEventType,
  IntegrationOperation
} from '../analytics/IntegrationAnalyticsService';
import { DatabaseService } from '../auth/database/DatabaseService';
import { RedisService } from '../auth/database/RedisService';
import { AuditService } from '../auth/services/AuditService';
import { AnalyticsCollector } from '../analytics/AnalyticsCollector';
import integrationAnalyticsRoutes from '../routes/integration-analytics';

export class IntegrationAnalyticsServiceWrapper {
  private analyticsService: IntegrationAnalyticsService | null = null;
  private isInitialized = false;
  
  constructor(
    private fastify: FastifyInstance,
    private dependencies: {
      databaseService: DatabaseService;
      redisService: RedisService;
      auditService: AuditService;
      analyticsCollector: AnalyticsCollector;
    }
  ) {}

  /**
   * Initialize Integration Analytics Service
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('⚠️ Integration Analytics Service already initialized');
      return;
    }

    try {
      console.log('🚀 Initializing Integration Analytics Service...');

      // Create service configuration
      const config = this.createAnalyticsConfig();

      // Create and initialize analytics service
      this.analyticsService = new IntegrationAnalyticsService(
        config,
        this.dependencies
      );

      // Initialize the service
      await this.analyticsService.initialize();

      // Register with Fastify instance for route access
      this.fastify.decorate('integrationAnalyticsService', this.analyticsService);

      // Register API routes
      await this.fastify.register(integrationAnalyticsRoutes, {
        prefix: '/api/v1'
      });

      // Set up automatic event tracking
      this.setupAutomaticEventTracking();

      // Set up integration monitoring hooks
      this.setupIntegrationMonitoringHooks();

      // Set up periodic health checks
      this.setupPeriodicHealthChecks();

      this.isInitialized = true;

      console.log('✅ Integration Analytics Service initialized successfully');

      // Log initialization event
      await this.dependencies.auditService.logEvent({
        eventType: 'INTEGRATION_ANALYTICS_SERVICE_INITIALIZED',
        userId: 'system',
        details: {
          timestamp: new Date(),
          config: {
            eventCollectionEnabled: config.eventCollection.enabled,
            metricAggregationEnabled: config.metricAggregation.enabled,
            monitoringEnabled: config.monitoring.healthCheckInterval > 0,
            costTrackingEnabled: config.costTracking.enabled
          }
        },
        riskLevel: 'LOW',
        compliance: {
          frameworks: ['SOC2'],
          requirements: ['integration_monitoring'],
          evidenceLevel: 'STANDARD'
        }
      });

    } catch (error) {
      console.error('❌ Failed to initialize Integration Analytics Service:', error);
      throw error;
    }
  }

  /**
   * Get analytics service instance
   */
  public getAnalyticsService(): IntegrationAnalyticsService | null {
    return this.analyticsService;
  }

  /**
   * Check if service is initialized
   */
  public isServiceInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Record integration event (convenience method)
   */
  public recordIntegrationEvent(eventData: {
    integrationId: string;
    integrationType: IntegrationType;
    integrationName: string;
    eventType: IntegrationEventType;
    operation: IntegrationOperation;
    responseTime: number;
    success: boolean;
    dataSize?: number;
    errorCode?: string;
    errorMessage?: string;
    costData?: {
      totalCost: number;
      currency?: string;
    };
    context?: {
      userId?: string;
      requestId?: string;
      environment?: string;
    };
  }): void {
    if (!this.analyticsService) {
      console.warn('⚠️ Integration Analytics Service not initialized - event not recorded');
      return;
    }

    this.analyticsService.recordEvent({
      integrationId: eventData.integrationId,
      integrationType: eventData.integrationType,
      integrationName: eventData.integrationName,
      eventType: eventData.eventType,
      operation: eventData.operation,
      responseTime: eventData.responseTime,
      success: eventData.success,
      dataSize: eventData.dataSize,
      errorCode: eventData.errorCode,
      errorMessage: eventData.errorMessage,
      costData: eventData.costData ? {
        baseCost: 0,
        variableCost: 0,
        totalCost: eventData.costData.totalCost,
        currency: eventData.costData.currency || 'USD',
        billingUnit: 'request'
      } : undefined,
      context: {
        environment: 'development',
        ...eventData.context
      }
    });
  }

  /**
   * Get integration health summary
   */
  public getIntegrationHealthSummary(): any {
    if (!this.analyticsService) {
      return { error: 'Service not initialized' };
    }

    const dashboard = this.analyticsService.getAnalyticsDashboard();
    return {
      totalIntegrations: dashboard.overview.totalIntegrations,
      healthyIntegrations: dashboard.overview.healthyIntegrations,
      degradedIntegrations: dashboard.overview.degradedIntegrations,
      failedIntegrations: dashboard.overview.failedIntegrations,
      overallSuccessRate: dashboard.overview.overallSuccessRate,
      totalCost: dashboard.overview.totalCost,
      healthSummary: dashboard.healthSummary.slice(0, 5), // Top 5
      timestamp: dashboard.timestamp
    };
  }

  /**
   * Shutdown the analytics service
   */
  public async shutdown(): Promise<void> {
    if (!this.isInitialized || !this.analyticsService) {
      return;
    }

    try {
      console.log('⏹️ Shutting down Integration Analytics Service...');

      // Stop the analytics service
      await this.analyticsService.stop();

      // Log shutdown event
      await this.dependencies.auditService.logEvent({
        eventType: 'INTEGRATION_ANALYTICS_SERVICE_SHUTDOWN',
        userId: 'system',
        details: {
          timestamp: new Date()
        },
        riskLevel: 'LOW',
        compliance: {
          frameworks: ['SOC2'],
          requirements: ['integration_monitoring'],
          evidenceLevel: 'STANDARD'
        }
      });

      this.analyticsService = null;
      this.isInitialized = false;

      console.log('✅ Integration Analytics Service shutdown completed');
    } catch (error) {
      console.error('❌ Error during Integration Analytics Service shutdown:', error);
      throw error;
    }
  }

  /**
   * Create analytics service configuration
   */
  private createAnalyticsConfig(): IntegrationAnalyticsConfig {
    return {
      eventCollection: {
        enabled: true,
        interval: 5000, // 5 seconds
        maxEventsInMemory: 10000,
        persistenceBatchSize: 100
      },
      metricAggregation: {
        enabled: true,
        interval: 60000, // 1 minute
        aggregationWindows: [5, 15, 60, 1440] // 5min, 15min, 1hr, 1day
      },
      monitoring: {
        healthCheckInterval: 30000, // 30 seconds
        alertThresholds: {
          errorRate: 5.0, // 5%
          responseTime: 5000, // 5 seconds
          availability: 95.0 // 95%
        }
      },
      costTracking: {
        enabled: true,
        defaultCurrency: 'USD',
        costOptimizationThreshold: 100.0 // $100
      },
      reporting: {
        retentionPeriod: 90, // 90 days
        maxReportSize: 50 * 1024 * 1024, // 50MB
        scheduledReports: true
      }
    };
  }

  /**
   * Set up automatic event tracking for common integrations
   */
  private setupAutomaticEventTracking(): void {
    if (!this.analyticsService) return;

    // Track database operations
    this.fastify.addHook('preHandler', async (request, reply) => {
      (request as any).integrationStartTime = Date.now();
    });

    // Track API responses and integration calls
    this.fastify.addHook('onResponse', async (request, reply) => {
      if (!this.analyticsService) return;

      const startTime = (request as any).integrationStartTime;
      if (!startTime) return;

      const responseTime = Date.now() - startTime;
      const route = request.routerPath || request.url;
      const success = reply.statusCode < 400;

      // Track different types of integrations based on route patterns
      this.trackIntegrationByRoute(route, responseTime, success, request, reply);
    });
  }

  /**
   * Track integration events based on route patterns
   */
  private trackIntegrationByRoute(
    route: string, 
    responseTime: number, 
    success: boolean, 
    request: any, 
    reply: any
  ): void {
    if (!this.analyticsService) return;

    // Database operations
    if (route.includes('/api/') && (request.method === 'GET' || request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE')) {
      this.analyticsService.recordEvent({
        integrationId: 'postgres-main-db',
        integrationType: IntegrationType.DATABASE,
        integrationName: 'PostgreSQL Main Database',
        eventType: success ? IntegrationEventType.RESPONSE_RECEIVED : IntegrationEventType.ERROR_OCCURRED,
        operation: this.mapHttpMethodToIntegrationOperation(request.method),
        responseTime,
        success,
        errorCode: success ? undefined : reply.statusCode.toString(),
        errorMessage: success ? undefined : 'HTTP Error',
        context: {
          userId: request.user?.id,
          requestId: request.id,
          environment: process.env.NODE_ENV || 'development'
        }
      });
    }

    // Authentication operations
    if (route.includes('/auth/')) {
      this.analyticsService.recordEvent({
        integrationId: 'auth0-sso',
        integrationType: IntegrationType.AUTHENTICATION,
        integrationName: 'Auth0 Authentication',
        eventType: success ? IntegrationEventType.RESPONSE_RECEIVED : IntegrationEventType.ERROR_OCCURRED,
        operation: IntegrationOperation.AUTHENTICATE,
        responseTime,
        success,
        errorCode: success ? undefined : reply.statusCode.toString(),
        context: {
          userId: request.user?.id,
          requestId: request.id,
          environment: process.env.NODE_ENV || 'development'
        }
      });
    }

    // Cache operations (if Redis is involved)
    if (route.includes('/api/') && responseTime < 50) { // Likely cache hit
      this.analyticsService.recordEvent({
        integrationId: 'redis-cache',
        integrationType: IntegrationType.CACHE_LAYER,
        integrationName: 'Redis Cache Layer',
        eventType: IntegrationEventType.RESPONSE_RECEIVED,
        operation: IntegrationOperation.READ,
        responseTime,
        success: true,
        context: {
          userId: request.user?.id,
          requestId: request.id,
          environment: process.env.NODE_ENV || 'development'
        }
      });
    }
  }

  /**
   * Map HTTP method to integration operation
   */
  private mapHttpMethodToIntegrationOperation(method: string): IntegrationOperation {
    switch (method.toLowerCase()) {
      case 'get': return IntegrationOperation.READ;
      case 'post': return IntegrationOperation.WRITE;
      case 'put': return IntegrationOperation.UPDATE;
      case 'patch': return IntegrationOperation.UPDATE;
      case 'delete': return IntegrationOperation.DELETE;
      default: return IntegrationOperation.QUERY;
    }
  }

  /**
   * Set up integration monitoring hooks
   */
  private setupIntegrationMonitoringHooks(): void {
    if (!this.analyticsService) return;

    // Listen for analytics service events
    this.analyticsService.on('integration_event', (event) => {
      // Could trigger alerts, notifications, etc.
      if (!event.success && event.errorCategory) {
        console.warn(`🔍 Integration Error Detected: ${event.integrationName} - ${event.errorMessage}`);
      }
    });
  }

  /**
   * Set up periodic health checks for integrations
   */
  private setupPeriodicHealthChecks(): void {
    if (!this.analyticsService) return;

    // Periodic health check for database
    setInterval(async () => {
      try {
        const startTime = Date.now();
        await this.dependencies.databaseService.query('SELECT 1');
        const responseTime = Date.now() - startTime;

        this.analyticsService!.recordEvent({
          integrationId: 'postgres-main-db',
          integrationType: IntegrationType.DATABASE,
          integrationName: 'PostgreSQL Main Database',
          eventType: IntegrationEventType.HEALTH_CHECK,
          operation: IntegrationOperation.HEALTH_CHECK,
          responseTime,
          success: true,
          context: {
            environment: process.env.NODE_ENV || 'development'
          }
        });
      } catch (error) {
        this.analyticsService!.recordEvent({
          integrationId: 'postgres-main-db',
          integrationType: IntegrationType.DATABASE,
          integrationName: 'PostgreSQL Main Database',
          eventType: IntegrationEventType.ERROR_OCCURRED,
          operation: IntegrationOperation.HEALTH_CHECK,
          responseTime: 0,
          success: false,
          errorMessage: error instanceof Error ? error.message : 'Database health check failed',
          context: {
            environment: process.env.NODE_ENV || 'development'
          }
        });
      }
    }, 60000); // Every minute

    // Periodic health check for Redis
    setInterval(async () => {
      try {
        const startTime = Date.now();
        await this.dependencies.redisService.get('health_check');
        const responseTime = Date.now() - startTime;

        this.analyticsService!.recordEvent({
          integrationId: 'redis-cache',
          integrationType: IntegrationType.CACHE_LAYER,
          integrationName: 'Redis Cache Layer',
          eventType: IntegrationEventType.HEALTH_CHECK,
          operation: IntegrationOperation.HEALTH_CHECK,
          responseTime,
          success: true,
          context: {
            environment: process.env.NODE_ENV || 'development'
          }
        });
      } catch (error) {
        this.analyticsService!.recordEvent({
          integrationId: 'redis-cache',
          integrationType: IntegrationType.CACHE_LAYER,
          integrationName: 'Redis Cache Layer',
          eventType: IntegrationEventType.ERROR_OCCURRED,
          operation: IntegrationOperation.HEALTH_CHECK,
          responseTime: 0,
          success: false,
          errorMessage: error instanceof Error ? error.message : 'Redis health check failed',
          context: {
            environment: process.env.NODE_ENV || 'development'
          }
        });
      }
    }, 60000); // Every minute
  }

  /**
   * Get service health status
   */
  public getHealthStatus(): {
    status: string;
    initialized: boolean;
    collecting: boolean;
    timestamp: Date;
  } {
    return {
      status: this.isInitialized ? 'healthy' : 'not_initialized',
      initialized: this.isInitialized,
      collecting: this.analyticsService !== null,
      timestamp: new Date()
    };
  }

  /**
   * Get service statistics
   */
  public getServiceStatistics() {
    if (!this.analyticsService || !this.isInitialized) {
      return {
        error: 'Service not initialized'
      };
    }

    try {
      const dashboard = this.analyticsService.getAnalyticsDashboard();
      
      return {
        overview: dashboard.overview,
        healthSummary: {
          total: dashboard.healthSummary.length,
          healthy: dashboard.healthSummary.filter(i => i.status === 'healthy').length,
          degraded: dashboard.healthSummary.filter(i => i.status === 'degraded').length,
          failing: dashboard.healthSummary.filter(i => i.status === 'failing').length
        },
        performanceMetrics: {
          averageResponseTime: dashboard.performanceAnalysis.averageResponseTime,
          totalThroughput: dashboard.performanceAnalysis.throughputAnalysis.totalThroughput
        },
        errorMetrics: {
          totalErrors: dashboard.errorAnalysis.totalErrors,
          criticalErrors: dashboard.errorAnalysis.criticalErrors.length
        },
        costMetrics: {
          totalCost: dashboard.costAnalysis.totalCost,
          projectedMonthlyCost: dashboard.costAnalysis.projectedMonthlyCost,
          potentialSavings: dashboard.costAnalysis.potentialSavings
        },
        timestamp: dashboard.timestamp
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Failed to get statistics'
      };
    }
  }

  /**
   * Record custom integration event (public API for other services)
   */
  public recordCustomEvent(eventData: {
    integrationId: string;
    integrationName: string;
    integrationType: string;
    operation: string;
    responseTime: number;
    success: boolean;
    dataSize?: number;
    errorDetails?: {
      code: string;
      message: string;
      category?: string;
    };
    costData?: {
      totalCost: number;
      currency?: string;
    };
    context?: Record<string, any>;
  }): void {
    if (!this.analyticsService) {
      console.warn('⚠️ Integration Analytics Service not initialized - custom event not recorded');
      return;
    }

    // Map string types to enums (with fallbacks)
    const integrationType = Object.values(IntegrationType).find(t => 
      t === eventData.integrationType
    ) || IntegrationType.API_SERVICE;

    const eventType = eventData.success ? 
      IntegrationEventType.RESPONSE_RECEIVED : 
      IntegrationEventType.ERROR_OCCURRED;

    const operation = Object.values(IntegrationOperation).find(o => 
      o === eventData.operation
    ) || IntegrationOperation.EXECUTE;

    this.analyticsService.recordEvent({
      integrationId: eventData.integrationId,
      integrationType,
      integrationName: eventData.integrationName,
      eventType,
      operation,
      responseTime: eventData.responseTime,
      success: eventData.success,
      dataSize: eventData.dataSize,
      errorCode: eventData.errorDetails?.code,
      errorMessage: eventData.errorDetails?.message,
      costData: eventData.costData ? {
        baseCost: 0,
        variableCost: 0,
        totalCost: eventData.costData.totalCost,
        currency: eventData.costData.currency || 'USD',
        billingUnit: 'request'
      } : undefined,
      context: {
        environment: process.env.NODE_ENV || 'development',
        ...eventData.context
      },
      metadata: eventData.context || {}
    });
  }
}

export default IntegrationAnalyticsServiceWrapper;