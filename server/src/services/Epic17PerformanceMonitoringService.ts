/**
 * Epic 17 Performance Monitoring Service Integration
 * Task: E17-1753114397209-9BCDD6 - Implement performance monitoring
 * 
 * Service integration layer for Epic 17 performance monitoring that handles
 * initialization, configuration, and integration with the main server application.
 */

import { FastifyInstance } from 'fastify';
import { 
  Epic17PerformanceMonitor, 
  Epic17MonitorConfig 
} from '../monitoring/Epic17PerformanceMonitor';
import { 
  PerformanceMonitorConfig 
} from '../monitoring/PerformanceMonitor';
import { DatabaseService } from '../auth/database/DatabaseService';
import { RedisService } from '../auth/database/RedisService';
import { AuditService } from '../auth/services/AuditService';
import epic17PerformanceMonitoringRoutes from '../routes/epic17-performance-monitoring';

export class Epic17PerformanceMonitoringService {
  private performanceMonitor: Epic17PerformanceMonitor | null = null;
  private isInitialized = false;
  
  constructor(
    private fastify: FastifyInstance,
    private dependencies: {
      databaseService: DatabaseService;
      redisService: RedisService;
      auditService: AuditService;
    }
  ) {}

  /**
   * Initialize Epic 17 Performance Monitoring Service
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('⚠️ Epic 17 Performance Monitoring Service already initialized');
      return;
    }

    try {
      console.log('🚀 Initializing Epic 17 Performance Monitoring Service...');

      // Create configuration
      const baseConfig = this.createBasePerformanceConfig();
      const epic17Config = this.createEpic17Config();

      // Create and initialize performance monitor
      this.performanceMonitor = new Epic17PerformanceMonitor(
        baseConfig,
        epic17Config,
        this.dependencies
      );

      // Initialize the monitor
      await this.performanceMonitor.initialize();

      // Register with Fastify instance for route access
      this.fastify.decorate('epic17PerformanceMonitor', this.performanceMonitor);

      // Register API routes
      await this.fastify.register(epic17PerformanceMonitoringRoutes, {
        prefix: '/api/v1'
      });

      // Set up performance tracking hooks
      this.setupPerformanceHooks();

      // Set up admin operation tracking
      this.setupAdminOperationTracking();

      this.isInitialized = true;

      console.log('✅ Epic 17 Performance Monitoring Service initialized successfully');

      // Log initialization event
      await this.dependencies.auditService.logEvent({
        eventType: 'EPIC17_PERFORMANCE_SERVICE_INITIALIZED',
        userId: 'system',
        details: {
          timestamp: new Date(),
          config: {
            baseConfig: baseConfig,
            epic17Config: epic17Config
          }
        },
        riskLevel: 'LOW',
        compliance: {
          frameworks: ['SOC2'],
          requirements: ['system_monitoring'],
          evidenceLevel: 'STANDARD'
        }
      });

    } catch (error) {
      console.error('❌ Failed to initialize Epic 17 Performance Monitoring Service:', error);
      throw error;
    }
  }

  /**
   * Get performance monitor instance
   */
  public getPerformanceMonitor(): Epic17PerformanceMonitor | null {
    return this.performanceMonitor;
  }

  /**
   * Check if service is initialized
   */
  public isServiceInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Shutdown the performance monitoring service
   */
  public async shutdown(): Promise<void> {
    if (!this.isInitialized || !this.performanceMonitor) {
      return;
    }

    try {
      console.log('⏹️ Shutting down Epic 17 Performance Monitoring Service...');

      // Stop monitoring
      if (typeof (this.performanceMonitor as any).stop === 'function') {
        await (this.performanceMonitor as any).stop();
      }

      // Log shutdown event
      await this.dependencies.auditService.logEvent({
        eventType: 'EPIC17_PERFORMANCE_SERVICE_SHUTDOWN',
        userId: 'system',
        details: {
          timestamp: new Date()
        },
        riskLevel: 'LOW',
        compliance: {
          frameworks: ['SOC2'],
          requirements: ['system_monitoring'],
          evidenceLevel: 'STANDARD'
        }
      });

      this.performanceMonitor = null;
      this.isInitialized = false;

      console.log('✅ Epic 17 Performance Monitoring Service shutdown completed');
    } catch (error) {
      console.error('❌ Error during Epic 17 Performance Monitoring Service shutdown:', error);
      throw error;
    }
  }

  /**
   * Create base performance monitor configuration
   */
  private createBasePerformanceConfig(): PerformanceMonitorConfig {
    return {
      systemMonitoring: {
        enabled: true,
        interval: 30000 // 30 seconds
      },
      bufferFlushInterval: 10000, // 10 seconds
      maxBufferSize: 1000,
      defaultTags: {
        service: 'epic17-admin-controls',
        environment: process.env.NODE_ENV || 'development',
        version: process.env.BUILD_VERSION || '1.0.0'
      },
      startTime: new Date(),
      alerting: {
        enabled: true,
        webhookUrl: process.env.PERFORMANCE_WEBHOOK_URL,
        emailRecipients: (process.env.PERFORMANCE_ALERT_EMAILS || '').split(',').filter(Boolean)
      }
    };
  }

  /**
   * Create Epic 17-specific configuration
   */
  private createEpic17Config(): Epic17MonitorConfig {
    return {
      adminMonitoring: {
        enabled: true,
        interval: 15000 // 15 seconds for more frequent admin monitoring
      },
      integrationMonitoring: {
        enabled: true,
        interval: 60000 // 1 minute for integration health checks
      },
      complianceMonitoring: {
        enabled: true,
        interval: 300000 // 5 minutes for compliance checks
      },
      defaultTags: {
        epic: 'epic17',
        component: 'backstage-admin-controls',
        monitoring_level: 'comprehensive'
      },
      alerting: {
        enabled: true,
        webhookUrl: process.env.EPIC17_ALERT_WEBHOOK_URL,
        emailRecipients: (process.env.EPIC17_ALERT_EMAILS || '').split(',').filter(Boolean),
        slackChannel: process.env.EPIC17_SLACK_CHANNEL || '#epic17-alerts'
      }
    };
  }

  /**
   * Set up performance tracking hooks for all requests
   */
  private setupPerformanceHooks(): void {
    if (!this.performanceMonitor) return;

    // Pre-request hook to start timing
    this.fastify.addHook('preHandler', async (request, reply) => {
      // Start timing for admin routes
      if (request.url.startsWith('/api/v1/epic17/') || 
          request.url.includes('/admin/') ||
          request.url.includes('/auth/')) {
        
        const startTime = Date.now();
        (request as any).performanceStartTime = startTime;
      }
    });

    // Post-response hook to record metrics
    this.fastify.addHook('onResponse', async (request, reply) => {
      if (!this.performanceMonitor) return;
      
      const startTime = (request as any).performanceStartTime;
      if (!startTime) return;

      const duration = Date.now() - startTime;
      const route = request.routerPath || request.url;
      const method = request.method;
      const statusCode = reply.statusCode;

      // Record general API performance
      this.performanceMonitor.recordAdminMetric(
        this.mapRouteToAdminOperation(route, method),
        this.mapRouteToAdminCategory(route),
        duration,
        {
          adminUserId: (request as any).user?.id,
          adminRole: (request as any).user?.role,
          backstageComponent: this.mapRouteToBackstageComponent(route),
          configurationArea: this.mapRouteToConfigurationArea(route),
          systemIntegration: this.mapRouteToSystemIntegration(route),
          impactScope: this.determineImpactScope(route, statusCode),
          complianceLevel: this.determineComplianceLevel(route),
          performanceImpact: this.determinePerformanceImpact(duration)
        }
      );
    });
  }

  /**
   * Set up specific admin operation tracking
   */
  private setupAdminOperationTracking(): void {
    if (!this.performanceMonitor) return;

    // Listen for specific admin events and track performance
    this.fastify.addHook('preHandler', async (request, reply) => {
      // Add request ID for tracking
      (request as any).requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    });
  }

  /**
   * Map route to admin operation
   */
  private mapRouteToAdminOperation(route: string, method: string): any {
    const routeMap: Record<string, any> = {
      '/api/v1/auth/login': 'user_management',
      '/api/v1/auth/register': 'user_management',
      '/api/v1/auth/roles': 'role_assignment',
      '/api/v1/auth/permissions': 'permission_update',
      '/api/v1/epic17/performance': 'performance_analysis',
      '/api/v1/admin/users': 'user_management',
      '/api/v1/admin/config': 'system_configuration',
      '/api/v1/admin/backup': 'backup_restore',
      '/api/v1/admin/audit': 'audit_review',
      '/api/v1/admin/compliance': 'compliance_check',
      '/api/v1/admin/integrations': 'integration_management',
      '/api/v1/admin/monitoring': 'monitoring_dashboard',
      '/api/v1/admin/alerts': 'alert_management'
    };

    // Find matching route pattern
    for (const [pattern, operation] of Object.entries(routeMap)) {
      if (route.includes(pattern)) {
        return operation;
      }
    }

    return 'system_configuration'; // Default
  }

  /**
   * Map route to admin category
   */
  private mapRouteToAdminCategory(route: string): any {
    if (route.includes('/auth/')) return 'authentication';
    if (route.includes('/roles') || route.includes('/permissions')) return 'authorization';
    if (route.includes('/users')) return 'user_lifecycle';
    if (route.includes('/audit')) return 'audit';
    if (route.includes('/compliance')) return 'compliance';
    if (route.includes('/config')) return 'configuration';
    if (route.includes('/integrations')) return 'integration';
    if (route.includes('/monitoring')) return 'system_health';
    
    return 'system_health'; // Default
  }

  /**
   * Map route to backstage component
   */
  private mapRouteToBackstageComponent(route: string): any {
    if (route.includes('/auth/')) return 'admin_portal';
    if (route.includes('/users')) return 'user_management';
    if (route.includes('/roles')) return 'role_management';
    if (route.includes('/audit')) return 'audit_system';
    if (route.includes('/monitoring')) return 'monitoring_system';
    if (route.includes('/integrations')) return 'integration_hub';
    if (route.includes('/config')) return 'configuration_manager';
    if (route.includes('/alerts')) return 'alert_manager';
    
    return 'admin_portal'; // Default
  }

  /**
   * Map route to configuration area
   */
  private mapRouteToConfigurationArea(route: string): any {
    if (route.includes('/auth/')) return 'authentication';
    if (route.includes('/roles') || route.includes('/permissions')) return 'authorization';
    if (route.includes('/audit')) return 'logging';
    if (route.includes('/monitoring')) return 'monitoring';
    if (route.includes('/integrations')) return 'integrations';
    if (route.includes('/backup')) return 'backup';
    if (route.includes('/security')) return 'security';
    
    return 'authentication'; // Default
  }

  /**
   * Map route to system integration
   */
  private mapRouteToSystemIntegration(route: string): any {
    if (route.includes('/ldap') || route.includes('/ad')) return 'ldap_active_directory';
    if (route.includes('/saml')) return 'saml_sso';
    if (route.includes('/oauth')) return 'oauth_provider';
    if (route.includes('/database')) return 'database_cluster';
    if (route.includes('/cache')) return 'cache_layer';
    if (route.includes('/queue')) return 'message_queue';
    if (route.includes('/storage')) return 'file_storage';
    if (route.includes('/monitoring')) return 'monitoring_tools';
    if (route.includes('/backup')) return 'backup_systems';
    
    return 'database_cluster'; // Default
  }

  /**
   * Determine impact scope based on route and status
   */
  private determineImpactScope(route: string, statusCode: number): any {
    if (statusCode >= 500) return 'system_wide';
    if (route.includes('/admin/')) return 'organization';
    if (route.includes('/users/')) return 'user_group';
    
    return 'single_user'; // Default
  }

  /**
   * Determine compliance level
   */
  private determineComplianceLevel(route: string): any {
    if (route.includes('/auth/') || route.includes('/security/')) return 'critical';
    if (route.includes('/audit/') || route.includes('/compliance/')) return 'high';
    if (route.includes('/admin/')) return 'standard';
    
    return 'basic'; // Default
  }

  /**
   * Determine performance impact level
   */
  private determinePerformanceImpact(duration: number): any {
    if (duration > 5000) return 'critical';
    if (duration > 2000) return 'high';
    if (duration > 1000) return 'moderate';
    if (duration > 500) return 'low';
    
    return 'minimal';
  }

  /**
   * Get service health status
   */
  public getHealthStatus(): {
    status: string;
    initialized: boolean;
    monitoring: boolean;
    timestamp: Date;
  } {
    return {
      status: this.isInitialized ? 'healthy' : 'not_initialized',
      initialized: this.isInitialized,
      monitoring: this.performanceMonitor !== null,
      timestamp: new Date()
    };
  }

  /**
   * Get service statistics
   */
  public getServiceStatistics() {
    if (!this.performanceMonitor || !this.isInitialized) {
      return {
        error: 'Service not initialized'
      };
    }

    // Get basic statistics from the dashboard
    const dashboard = this.performanceMonitor.getAdminPerformanceDashboard();
    
    return {
      adminOperations: dashboard.adminSystemOverview.totalAdminOperations,
      activeSessions: dashboard.adminSystemOverview.activeAdminSessions,
      integrationHealthScore: dashboard.adminSystemOverview.integrationHealthScore,
      complianceViolations: dashboard.adminSystemOverview.complianceViolations,
      activeAlerts: dashboard.criticalAdminAlerts.length,
      resourceUtilization: dashboard.resourceUtilization,
      timestamp: dashboard.timestamp
    };
  }
}

export default Epic17PerformanceMonitoringService;