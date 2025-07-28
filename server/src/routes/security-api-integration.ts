/**
 * Security API Integration Platform Routes
 * Epic 31 - Task E31-1753313263610-BE14AC
 * 
 * RESTful API endpoints for the Security API Integration Platform,
 * providing comprehensive security analytics, external tool integration,
 * and real-time threat processing capabilities.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { 
  SecurityAPIIntegrationPlatform,
  SecurityAPIConfig,
  ExternalSecurityTool,
  SecurityEvent
} from '../services/SecurityAPIIntegrationPlatform';
import { 
  SecurityAnalyticsIntegrationService,
  SecurityAnalyticsIntegrationConfig
} from '../services/SecurityAnalyticsIntegrationService';
import { AdminAuthGuard } from '../admin/guards/AdminAuthGuard';
import { AnalyticsCollector } from '../analytics/AnalyticsCollector';
import { AnalyticsDAO } from '../database/analytics-dao';
import { HealthCheckFramework } from '../admin/HealthCheckFramework';
import { DiagnosticService } from '../admin/DiagnosticService';

// Global platform instance
let securityAPIPlatform: SecurityAPIIntegrationPlatform | null = null;

}
interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: number;
}

}
interface ExternalToolRegistrationRequest {
  name: string;
  type: 'siem' | 'vulnerability_scanner' | 'threat_intelligence' | 'endpoint_protection';
  api_endpoint: string;
  authentication: {
    type: 'api_key' | 'oauth2' | 'basic_auth' | 'certificate';
    credentials: Record<string, any>;
}
  };
  capabilities: string[];
  data_format: 'json' | 'xml' | 'csv' | 'syslog';
  configuration?: Record<string, any>;
}

}
interface SecurityEventRequest {
  type: 'threat_detected' | 'vulnerability_found' | 'compliance_violation' | 'security_incident';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  description: string;
  affected_resources: string[];
  metadata?: Record<string, any>;
}
}

}
interface PlatformQueryParams {
  include_metrics?: boolean;
  include_tools?: boolean;
  include_events?: boolean;
  time_range?: 'last_hour' | 'last_day' | 'last_week';
}
}

/**
 * Initialize the Security API Integration Platform
 */
async function initializeSecurityAPIPlatform(): Promise<SecurityAPIIntegrationPlatform> {

  if (securityAPIPlatform) {
    return securityAPIPlatform;
  }

  // Configure the underlying analytics service
  const analyticsConfig: SecurityAnalyticsIntegrationConfig = {
    epic1_analytics_integration: {
      enabled: true,
      analytics_collector: new AnalyticsCollector({ 
        batchSize: 200,
        flushIntervalMs: 3000 
      }),
      analytics_dao: new AnalyticsDAO(process.env.DATABASE_PATH || './analytics.db'),
      performance_event_forwarding: true,
      batch_size: 100,
      flush_interval_ms: 5000
  }
    epic17_admin_integration: {
      enabled: true,
      auth_guard: new AdminAuthGuard(),
      health_check_framework: new HealthCheckFramework(),
      diagnostic_service: new DiagnosticService(),
      admin_notification_enabled: true,
      security_alert_threshold: 5
  }
    performance_monitoring: {
      real_time_monitoring_enabled: true,
      performance_threshold_ms: 500,
      memory_threshold_mb: 1024,
      cpu_threshold_percent: 70,
      alert_on_degradation: true,
      auto_optimization_enabled: true
  }
    security_features: {
      threat_detection_enabled: true,
      anomaly_detection_sensitivity: 0.85,
      correlation_analysis_enabled: true,
      predictive_analytics_enabled: true,
      automated_response_enabled: true
    }
  };

  const analyticsService = new SecurityAnalyticsIntegrationService(analyticsConfig);
  await analyticsService.initialize();

  // Configure the API platform
  const apiConfig: SecurityAPIConfig = {
    api_version: '1.0.0',
    rate_limiting: {
      enabled: true,
      max_requests_per_minute: 1000,
      burst_limit: 200,
      window_size_ms: 60000
  }
    external_integrations: {
      siem_tools: {
        enabled: true,
        supported_platforms: ['splunk', 'elastic', 'qradar', 'sentinel'],
        webhook_endpoints: [],
        api_keys: {},
        data_format: 'json'
  }
      threat_intelligence: {
        enabled: true,
        providers: ['virustotal', 'threatcrowd', 'otx', 'misp'],
        update_interval_minutes: 30,
        confidence_threshold: 0.7
  }
      vulnerability_scanners: {
        enabled: true,
        supported_scanners: ['nessus', 'openvas', 'qualys', 'rapid7'],
        scan_schedules: {}
      }
  }
    real_time_processing: {
      enabled: true,
      stream_buffer_size: 1000,
      processing_threads: 4,
      batch_processing_interval_ms: 2000,
      priority_queue_enabled: true
  }
    data_streaming: {
      enabled: true,
      websocket_enabled: true,
      compression_enabled: true
  }
    microservices: {
      enabled: true,
      service_discovery_enabled: true,
      load_balancing_strategy: 'least_connections',
      health_check_interval_ms: 30000,
      circuit_breaker_enabled: true
    }
  };

  securityAPIPlatform = new SecurityAPIIntegrationPlatform(apiConfig, analyticsService);
  await securityAPIPlatform.initialize();

  return securityAPIPlatform;
}

export default async function securityAPIIntegrationRoutes(fastify: FastifyInstance) {
  // Initialize platform
  const platform = await initializeSecurityAPIPlatform();

  /**
   * GET /api/security-integration/platform/status
   * Get comprehensive platform status
   */
  fastify.get<{ Querystring: PlatformQueryParams }>('/api/security-integration/platform/status', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Get security API integration platform status',
      tags: ['Security Integration'],
      querystring: {
        type: 'object',
        properties: {
          include_metrics: { type: 'boolean' },
          include_tools: { type: 'boolean' },
          include_events: { type: 'boolean' },
          time_range: { 
            type: 'string',
            enum: ['last_hour', 'last_day', 'last_week']
          }
        }
      }
    }
  }, async (
    request: FastifyRequest<{ Querystring: PlatformQueryParams }>,
    reply: FastifyReply
  ): Promise<APIResponse> => {
    try {
      const { include_metrics = true, include_tools = true, include_events = false } = request.query;
      
      const responseData: any = {
        platform_status: 'active',
        api_version: '1.0.0'
      };

      if (include_metrics) {
        responseData.metrics = await platform.getPlatformMetrics();
      }

      if (include_tools) {
        responseData.external_tools = platform.getExternalToolsStatus();
      }

      if (include_events) {
        // Would include recent events data
        responseData.recent_events = [];
      }

      return {
        success: true,
        data: responseData,
        timestamp: Date.now()
      };
    } catch (error) {
      fastify.log.error('Error getting platform status:', error);
      return {
        success: false,
        error: 'Failed to get platform status',
        timestamp: Date.now()
      };
    }
  });

  /**
   * POST /api/security-integration/tools/register
   * Register a new external security tool
   */
  fastify.post<{ Body: ExternalToolRegistrationRequest }>('/api/security-integration/tools/register', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Register a new external security tool',
      tags: ['Security Integration', 'External Tools'],
      body: {
        type: 'object',
        required: ['name', 'type', 'api_endpoint', 'authentication', 'capabilities', 'data_format'],
        properties: {
          name: { type: 'string' },
          type: { 
            type: 'string',
            enum: ['siem', 'vulnerability_scanner', 'threat_intelligence', 'endpoint_protection']
  }
          api_endpoint: { type: 'string', format: 'uri' },
          authentication: {
            type: 'object',
            required: ['type', 'credentials'],
            properties: {
              type: { 
                type: 'string',
                enum: ['api_key', 'oauth2', 'basic_auth', 'certificate']
  }
              credentials: { type: 'object' }
            }
  }
          capabilities: {
            type: 'array',
            items: { type: 'string' }
  }
          data_format: {
            type: 'string',
            enum: ['json', 'xml', 'csv', 'syslog']
  }
          configuration: { type: 'object' }
        }
      }
    }
  }, async (
    request: FastifyRequest<{ Body: ExternalToolRegistrationRequest }>,
    reply: FastifyReply
  ): Promise<APIResponse> => {
    try {
      const toolData = request.body;
      
      const externalTool: ExternalSecurityTool = {
        id: `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: toolData.name,
        type: toolData.type,
        api_endpoint: toolData.api_endpoint,
        authentication: toolData.authentication,
        capabilities: toolData.capabilities,
        data_format: toolData.data_format,
        status: 'inactive',
        last_sync: 0,
        configuration: toolData.configuration || {}
      };

      await platform.registerExternalTool(externalTool);

      return {
        success: true,
        data: {
          tool_id: externalTool.id,
          status: 'registered',
          name: externalTool.name,
          type: externalTool.type
  }
        message: `External tool '${externalTool.name}' registered successfully`,
        timestamp: Date.now()
      };
    } catch (error) {
      fastify.log.error('Error registering external tool:', error);
      return {
        success: false,
        error: `Failed to register external tool: ${error.message}`,
        timestamp: Date.now()
      };
    }
  });

  /**
   * GET /api/security-integration/tools
   * List all registered external tools
   */
  fastify.get('/api/security-integration/tools', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'List all registered external security tools',
      tags: ['Security Integration', 'External Tools']
    }
  }, async (request: FastifyRequest, reply: FastifyReply): Promise<APIResponse> => {
    try {
      const toolsStatus = platform.getExternalToolsStatus();
      
      return {
        success: true,
        data: {
          tools: toolsStatus,
          total_count: Object.keys(toolsStatus).length,
          active_count: Object.values(toolsStatus).filter((tool: any) => tool.status === 'active').length
  }
        timestamp: Date.now()
      };
    } catch (error) {
      fastify.log.error('Error listing external tools:', error);
      return {
        success: false,
        error: 'Failed to list external tools',
        timestamp: Date.now()
      };
    }
  });

  /**
   * POST /api/security-integration/events/process
   * Process a security event through the platform
   */
  fastify.post<{ Body: SecurityEventRequest }>('/api/security-integration/events/process', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Process a security event through the integration platform',
      tags: ['Security Integration', 'Event Processing'],
      body: {
        type: 'object',
        required: ['type', 'severity', 'source', 'description', 'affected_resources'],
        properties: {
          type: {
            type: 'string',
            enum: ['threat_detected', 'vulnerability_found', 'compliance_violation', 'security_incident']
  }
          severity: {
            type: 'string',
            enum: ['low', 'medium', 'high', 'critical']
  }
          source: { type: 'string' },
          description: { type: 'string' },
          affected_resources: {
            type: 'array',
            items: { type: 'string' }
  }
          metadata: { type: 'object' }
        }
      }
    }
  }, async (request: FastifyRequest<{ Body: SecurityEventRequest }>, reply: FastifyReply): Promise<APIResponse> => {
    try {
      const eventData = request.body;
      
      const securityEvent: SecurityEvent = {
        id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        type: eventData.type,
        severity: eventData.severity,
        source: eventData.source,
        description: eventData.description,
        affected_resources: eventData.affected_resources,
        metadata: eventData.metadata || {},
        mitigation_status: 'pending'
      };

      await platform.processSecurityEvent(securityEvent);

      return {
        success: true,
        data: {
          event_id: securityEvent.id,
          processing_status: 'accepted',
          timestamp: securityEvent.timestamp
  }
        message: 'Security event accepted for processing',
        timestamp: Date.now()
      };
    } catch (error) {
      fastify.log.error('Error processing security event:', error);
      return {
        success: false,
        error: `Failed to process security event: ${error.message}`,
        timestamp: Date.now()
      };
    }
  });

  /**
   * GET /api/security-integration/metrics
   * Get detailed platform metrics
   */
  fastify.get('/api/security-integration/metrics', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Get detailed security integration platform metrics',
      tags: ['Security Integration', 'Metrics']
    }
  }, async (request: FastifyRequest, reply: FastifyReply): Promise<APIResponse> => {
    try {
      const metrics = await platform.getPlatformMetrics();
      
      return {
        success: true,
        data: {
          platform_metrics: metrics,
          collection_timestamp: Date.now()
  }
        timestamp: Date.now()
      };
    } catch (error) {
      fastify.log.error('Error getting platform metrics:', error);
      return {
        success: false,
        error: 'Failed to get platform metrics',
        timestamp: Date.now()
      };
    }
  });

  /**
   * POST /api/security-integration/platform/optimize
   * Trigger platform optimization
   */
  fastify.post('/api/security-integration/platform/optimize', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Trigger security integration platform optimization',
      tags: ['Security Integration', 'Admin']
    }
  }, async (request: FastifyRequest, reply: FastifyReply): Promise<APIResponse> => {
    try {
      await platform.optimizePlatform();
      
      return {
        success: true,
        data: {
          optimization_status: 'completed',
          optimized_at: Date.now()
  }
        message: 'Platform optimization completed successfully',
        timestamp: Date.now()
      };
    } catch (error) {
      fastify.log.error('Error optimizing platform:', error);
      return {
        success: false,
        error: `Failed to optimize platform: ${error.message}`,
        timestamp: Date.now()
      };
    }
  });

  /**
   * GET /api/security-integration/health
   * Get platform health status
   */
  fastify.get('/api/security-integration/health', {
    schema: {
      description: 'Get security integration platform health status',
      tags: ['Security Integration', 'Health Check']
    }
  }, async (request: FastifyRequest, reply: FastifyReply): Promise<APIResponse> => {
    try {
      const metrics = await platform.getPlatformMetrics();
      const toolsStatus = platform.getExternalToolsStatus();
      
      const healthyTools = Object.values(toolsStatus).filter((tool: any) => tool.status === 'active').length;
      const totalTools = Object.keys(toolsStatus).length;
      
      const isHealthy = metrics.real_time_processing.events_processed_per_second > 0 &&
                       metrics.real_time_processing.processing_latency_ms < 1000 &&
                       healthyTools >= totalTools * 0.8; // At least 80% tools healthy
      
      return {
        success: true,
        data: {
          healthy: isHealthy,
          platform_status: isHealthy ? 'healthy' : 'degraded',
          processing_health: {
            events_per_second: metrics.real_time_processing.events_processed_per_second,
            latency_ms: metrics.real_time_processing.processing_latency_ms,
            queue_depth: metrics.real_time_processing.queue_depth
  }
          integration_health: {
            healthy_tools: healthyTools,
            total_tools: totalTools,
            health_percentage: totalTools > 0 ? (healthyTools / totalTools) * 100 : 100
  }
          last_check: Date.now()
  }
        timestamp: Date.now()
      };
    } catch (error) {
      fastify.log.error('Error getting platform health:', error);
      return {
        success: false,
        data: {
          healthy: false,
          platform_status: 'error',
          error_message: error.message
  }
        error: 'Failed to get platform health',
        timestamp: Date.now()
      };
    }
  });

  /**
   * WebSocket endpoint for real-time security event streaming
   */
  fastify.get('/api/security-integration/stream', { websocket: true }, (connection, request) => {
    fastify.log.info('Security integration WebSocket connection established');
    
    // Send initial status
    connection.socket.send(JSON.stringify({
      type: 'status',
      data: { connected: true, timestamp: Date.now() }
    }));
    
    // Setup event listeners for real-time updates
    const handleSecurityEvent = (event: any) => {
      connection.socket.send(JSON.stringify({
        type: 'security_event',
        data: event,
        timestamp: Date.now()
      }));
    };
    
    const handleMetricsUpdate = (metrics: any) => {
      connection.socket.send(JSON.stringify({
        type: 'metrics_update',
        data: metrics,
        timestamp: Date.now()
      }));
    };
    
    const handleToolStatusUpdate = (status: any) => {
      connection.socket.send(JSON.stringify({
        type: 'tool_status_update',
        data: status,
        timestamp: Date.now()
      }));
    };
    
    // Register event listeners
    platform.on('event_processed', handleSecurityEvent);
    platform.on('metrics_collected', handleMetricsUpdate);
    platform.on('tool_registered', handleToolStatusUpdate);
    
    // Handle connection close
    connection.socket.on('close', () => {
      platform.removeListener('event_processed', handleSecurityEvent);
      platform.removeListener('metrics_collected', handleMetricsUpdate);
      platform.removeListener('tool_registered', handleToolStatusUpdate);
      fastify.log.info('Security integration WebSocket connection closed');
    });
  });

  // Setup platform event handlers for logging
  platform.on('initialized', () => {
    fastify.log.info('Security API Integration Platform initialized');
  });

  platform.on('tool_registered', (data) => {
    fastify.log.info(`External security tool registered: ${data.tool_name} (${data.tool_id})`);
  });

  platform.on('event_processed', (data) => {
    fastify.log.debug(`Security event processed: ${data.event_id} with ${data.correlations} correlations`);
  });

  platform.on('platform_optimized', () => {
    fastify.log.info('Security API Integration Platform optimized');
  });

  platform.on('error', (error) => {
    fastify.log.error('Security API Integration Platform error:', error);
  });

  // Cleanup on server shutdown
  fastify.addHook('onClose', async () => {
    if (securityAPIPlatform) {
      await securityAPIPlatform.shutdown();
      fastify.log.info('Security API Integration Platform shut down');
    }
  });
}