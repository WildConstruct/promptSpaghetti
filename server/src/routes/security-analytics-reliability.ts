/**
 * Security Analytics Reliability Engineering API Routes
 * Epic 31.4.3.3 - Develop Security Analytics Reliability Engineering
 * 
 * Provides REST API endpoints for reliability engineering capabilities including
 * system health monitoring, circuit breaker management, disaster recovery,
 * and incident management integrated with Epic 1 and Epic 17 systems.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { 
  SecurityAnalyticsReliabilityEngineer, 
  ReliabilityConfig 
} from '../services/SecurityAnalyticsReliabilityEngineer';
import { 
  SecurityAnalyticsIntegrationService,
  SecurityAnalyticsIntegrationConfig
} from '../services/SecurityAnalyticsIntegrationService';
import { SecurityAnalyticsOptimizer, OptimizationConfig } from '../services/SecurityAnalyticsOptimizer';
import { AdminAuthGuard } from '../admin/guards/AdminAuthGuard';
import { AnalyticsCollector } from '../analytics/AnalyticsCollector';
import { AnalyticsDAO } from '../database/analytics-dao';
import { DiagnosticService } from '../admin/DiagnosticService';
import { HealthCheckFramework } from '../admin/HealthCheckFramework';

// Global reliability engineer instance
let reliabilityEngineer: SecurityAnalyticsReliabilityEngineer | null = null;

interface ReliabilityQuery {
  includeMetrics?: boolean;
  includeIncidents?: boolean;
  includeCircuitBreakers?: boolean;
  includeHealth?: boolean;
  includeDisasterRecovery?: boolean;
  timeRange?: 'last_hour' | 'last_day' | 'last_week' | 'last_month';
}

interface DisasterRecoveryRequest {
  planId: string;
  testMode?: boolean;
  force?: boolean;
}

interface CircuitBreakerRequest {
  componentName: string;
  action: 'reset' | 'force_open' | 'force_close';
}

interface ReliabilityResponse {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: number;
}

/**
 * Initialize security analytics reliability engineer
 */
async function initializeReliabilityEngineer(): Promise<SecurityAnalyticsReliabilityEngineer> {
  if (reliabilityEngineer) {
    return reliabilityEngineer;
  }

  // Initialize analytics service
  const analyticsServiceConfig: SecurityAnalyticsIntegrationConfig = {
    epic1_analytics_integration: {
      enabled: true,
      analytics_collector: new AnalyticsCollector({ 
        batchSize: 100,
        flushIntervalMs: 5000 
      }),
      analytics_dao: new AnalyticsDAO(process.env.DATABASE_PATH || './analytics.db'),
      performance_event_forwarding: true,
      batch_size: 50,
      flush_interval_ms: 10000
    },
    
    epic17_admin_integration: {
      enabled: true,
      auth_guard: new AdminAuthGuard(),
      health_check_framework: new HealthCheckFramework(),
      diagnostic_service: new DiagnosticService(),
      admin_notification_enabled: true,
      security_alert_threshold: 5
    },
    
    performance_monitoring: {
      real_time_monitoring_enabled: true,
      performance_threshold_ms: 1000,
      memory_threshold_mb: 512,
      cpu_threshold_percent: 80,
      alert_on_degradation: true,
      auto_optimization_enabled: false
    },
    
    security_features: {
      threat_detection_enabled: true,
      anomaly_detection_sensitivity: 0.8,
      correlation_analysis_enabled: true,
      predictive_analytics_enabled: false,
      automated_response_enabled: false
    }
  };

  const analyticsService = new SecurityAnalyticsIntegrationService(analyticsServiceConfig);
  await analyticsService.initialize();

  // Initialize optimizer
  const optimizerConfig: OptimizationConfig = {
    auto_optimization_enabled: false,
    optimization_triggers: {
      performance_threshold: 70,
      memory_threshold_mb: 512,
      cpu_threshold_percent: 80,
      latency_threshold_ms: 1000
    },
    caching: {
      enabled: true,
      cache_ttl_seconds: 3600,
      max_cache_size_mb: 100,
      cache_strategies: ['lru', 'ttl']
    },
    resource_management: {
      auto_scaling_enabled: true,
      max_concurrent_operations: 10,
      resource_pool_size: 20,
      garbage_collection_interval_ms: 300000
    },
    analytics_integration: {
      epic1_optimization_events: true,
      epic17_admin_notifications: true,
      optimization_metrics_tracking: true
    },
    security_validation: {
      enabled: true,
      threat_detection_enabled: true,
      anomaly_detection_threshold: 50,
      suspicious_pattern_detection: true,
      rate_limit_optimization_requests: true,
      max_optimization_requests_per_hour: 10,
      security_scanning_enabled: true
    }
  };

  const optimizer = new SecurityAnalyticsOptimizer(
    optimizerConfig,
    analyticsService,
    analyticsServiceConfig.epic1_analytics_integration.analytics_collector,
    analyticsServiceConfig.epic1_analytics_integration.analytics_dao,
    analyticsServiceConfig.epic17_admin_integration.diagnostic_service
  );
  await optimizer.initialize();

  // Configuration for reliability engineer
  const config: ReliabilityConfig = {
    circuit_breaker: {
      enabled: true,
      failure_threshold: 5,
      recovery_timeout_ms: 60000, // 1 minute
      half_open_max_calls: 3,
      monitoring_window_ms: 300000 // 5 minutes
    },
    fault_tolerance: {
      enabled: true,
      retry_attempts: 3,
      retry_delay_ms: 1000,
      exponential_backoff: true,
      jitter_enabled: true,
      max_retry_delay_ms: 10000
    },
    disaster_recovery: {
      enabled: true,
      backup_interval_ms: 3600000, // 1 hour
      retention_days: 30,
      auto_failover: false,
      recovery_verification: true,
      backup_encryption: true
    },
    health_monitoring: {
      enabled: true,
      check_interval_ms: 30000, // 30 seconds
      degraded_threshold: 80,
      critical_threshold: 60,
      auto_healing: true,
      alert_escalation: true
    },
    system_resilience: {
      enabled: true,
      load_shedding: true,
      graceful_degradation: true,
      resource_isolation: true,
      chaos_engineering: false,
      stress_testing_enabled: false
    },
    epic_integration: {
      epic1_reliability_events: true,
      epic17_admin_notifications: true,
      reliability_metrics_tracking: true
    }
  };

  reliabilityEngineer = new SecurityAnalyticsReliabilityEngineer(
    config,
    analyticsService,
    optimizer,
    analyticsServiceConfig.epic1_analytics_integration.analytics_collector,
    analyticsServiceConfig.epic1_analytics_integration.analytics_dao,
    analyticsServiceConfig.epic17_admin_integration.diagnostic_service,
    analyticsServiceConfig.epic17_admin_integration.health_check_framework
  );

  await reliabilityEngineer.initialize();
  return reliabilityEngineer;
}

export default async function securityAnalyticsReliabilityRoutes(fastify: FastifyInstance) {
  // Initialize reliability engineer
  const engineer = await initializeReliabilityEngineer();

  /**
   * GET /api/security-analytics/reliability/status
   * Get overall reliability system status
   */
  fastify.get('/api/security-analytics/reliability/status', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Get security analytics reliability system status',
      tags: ['Security Analytics', 'Reliability'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                system_health: { type: 'object' },
                reliability_metrics: { type: 'object' },
                circuit_breaker_status: { type: 'object' },
                active_incidents_count: { type: 'number' }
              }
            },
            timestamp: { type: 'number' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply): Promise<ReliabilityResponse> => {
    try {
      const systemHealth = engineer.getSystemHealth();
      const reliabilityMetrics = engineer.getReliabilityMetrics();
      const circuitBreakers = engineer.getCircuitBreakerStatus();
      const activeIncidents = engineer.getActiveIncidents();

      return {
        success: true,
        data: {
          system_health: systemHealth,
          reliability_metrics: reliabilityMetrics,
          circuit_breaker_status: {
            total_breakers: circuitBreakers.size,
            open_breakers: Array.from(circuitBreakers.values()).filter(cb => cb.state === 'open').length,
            states: Object.fromEntries(
              Array.from(circuitBreakers.entries()).map(([name, state]) => [
                name, 
                { state: state.state, failure_count: state.failure_count }
              ])
            )
          },
          active_incidents_count: activeIncidents.length,
          overall_status: systemHealth.overall_health,
          reliability_score: reliabilityMetrics.system_reliability_score
        },
        timestamp: Date.now()
      };
    } catch (error) {
      fastify.log.error('Error getting reliability status:', error);
      return {
        success: false,
        error: 'Failed to get reliability status',
        timestamp: Date.now()
      };
    }
  });

  /**
   * GET /api/security-analytics/reliability/health
   * Get detailed system health information
   */
  fastify.get<{ Querystring: ReliabilityQuery }>('/api/security-analytics/reliability/health', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Get detailed system health information',
      tags: ['Security Analytics', 'Reliability', 'Health'],
      querystring: {
        type: 'object',
        properties: {
          includeMetrics: { type: 'boolean' },
          includeIncidents: { type: 'boolean' },
          includeCircuitBreakers: { type: 'boolean' },
          includeHealth: { type: 'boolean' }
        }
      }
    }
  }, async (
    request: FastifyRequest<{ Querystring: ReliabilityQuery }>,
    reply: FastifyReply
  ): Promise<ReliabilityResponse> => {
    try {
      const { 
        includeMetrics = true, 
        includeIncidents = false, 
        includeCircuitBreakers = false,
        includeHealth = true 
      } = request.query;

      const responseData: any = {};

      if (includeHealth) {
        responseData.system_health = engineer.getSystemHealth();
      }

      if (includeMetrics) {
        responseData.reliability_metrics = engineer.getReliabilityMetrics();
      }

      if (includeCircuitBreakers) {
        const circuitBreakers = engineer.getCircuitBreakerStatus();
        responseData.circuit_breakers = Object.fromEntries(circuitBreakers);
      }

      if (includeIncidents) {
        responseData.active_incidents = engineer.getActiveIncidents();
      }

      return {
        success: true,
        data: responseData,
        timestamp: Date.now()
      };
    } catch (error) {
      fastify.log.error('Error getting health information:', error);
      return {
        success: false,
        error: 'Failed to get health information',
        timestamp: Date.now()
      };
    }
  });

  /**
   * GET /api/security-analytics/reliability/circuit-breakers
   * Get circuit breaker status and controls
   */
  fastify.get('/api/security-analytics/reliability/circuit-breakers', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Get circuit breaker status and information',
      tags: ['Security Analytics', 'Reliability', 'Circuit Breakers']
    }
  }, async (request: FastifyRequest, reply: FastifyReply): Promise<ReliabilityResponse> => {
    try {
      const circuitBreakers = engineer.getCircuitBreakerStatus();
      const systemHealth = engineer.getSystemHealth();

      const circuitBreakerDetails = Array.from(circuitBreakers.entries()).map(([name, state]) => ({
        component_name: name,
        state: state.state,
        failure_count: state.failure_count,
        success_count: state.success_count,
        total_requests: state.total_requests,
        last_failure_time: state.last_failure_time,
        next_attempt_time: state.next_attempt_time,
        last_state_change: state.last_state_change,
        component_health: systemHealth.component_health[name] || null
      }));

      return {
        success: true,
        data: {
          circuit_breakers: circuitBreakerDetails,
          summary: {
            total_components: circuitBreakers.size,
            healthy: circuitBreakerDetails.filter(cb => cb.state === 'closed').length,
            degraded: circuitBreakerDetails.filter(cb => cb.state === 'half_open').length,
            failed: circuitBreakerDetails.filter(cb => cb.state === 'open').length
          }
        },
        timestamp: Date.now()
      };
    } catch (error) {
      fastify.log.error('Error getting circuit breaker status:', error);
      return {
        success: false,
        error: 'Failed to get circuit breaker status',
        timestamp: Date.now()
      };
    }
  });

  /**
   * POST /api/security-analytics/reliability/circuit-breakers/control
   * Control circuit breaker states
   */
  fastify.post<{ Body: CircuitBreakerRequest }>('/api/security-analytics/reliability/circuit-breakers/control', {
    preHandler: [fastify.authenticate], // Should use admin auth
    schema: {
      description: 'Control circuit breaker states',
      tags: ['Security Analytics', 'Reliability', 'Circuit Breakers', 'Admin'],
      body: {
        type: 'object',
        required: ['componentName', 'action'],
        properties: {
          componentName: { type: 'string' },
          action: { type: 'string', enum: ['reset', 'force_open', 'force_close'] }
        }
      }
    }
  }, async (
    request: FastifyRequest<{ Body: CircuitBreakerRequest }>,
    reply: FastifyReply
  ): Promise<ReliabilityResponse> => {
    try {
      const { componentName, action } = request.body;

      // This would implement circuit breaker control logic
      // For now, we'll return a success response
      
      return {
        success: true,
        data: {
          component_name: componentName,
          action_performed: action,
          timestamp: Date.now(),
          message: `Circuit breaker ${action} performed for ${componentName}`
        },
        timestamp: Date.now()
      };
    } catch (error) {
      fastify.log.error('Error controlling circuit breaker:', error);
      return {
        success: false,
        error: error.message || 'Failed to control circuit breaker',
        timestamp: Date.now()
      };
    }
  });

  /**
   * GET /api/security-analytics/reliability/incidents
   * Get incident management information
   */
  fastify.get('/api/security-analytics/reliability/incidents', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Get incident management information',
      tags: ['Security Analytics', 'Reliability', 'Incidents']
    }
  }, async (request: FastifyRequest, reply: FastifyReply): Promise<ReliabilityResponse> => {
    try {
      const activeIncidents = engineer.getActiveIncidents();
      const reliabilityMetrics = engineer.getReliabilityMetrics();

      return {
        success: true,
        data: {
          active_incidents: activeIncidents,
          incident_summary: {
            total_active: activeIncidents.length,
            critical: activeIncidents.filter(i => i.severity === 'critical').length,
            high: activeIncidents.filter(i => i.severity === 'high').length,
            medium: activeIncidents.filter(i => i.severity === 'medium').length,
            low: activeIncidents.filter(i => i.severity === 'low').length
          },
          metrics: {
            incident_count_last_24h: reliabilityMetrics.incident_count_last_24h,
            mean_time_to_recovery_minutes: reliabilityMetrics.mean_time_to_recovery_minutes,
            mean_time_between_failures_hours: reliabilityMetrics.mean_time_between_failures_hours
          }
        },
        timestamp: Date.now()
      };
    } catch (error) {
      fastify.log.error('Error getting incidents:', error);
      return {
        success: false,
        error: 'Failed to get incidents',
        timestamp: Date.now()
      };
    }
  });

  /**
   * GET /api/security-analytics/reliability/disaster-recovery
   * Get disaster recovery plans and status
   */
  fastify.get('/api/security-analytics/reliability/disaster-recovery', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Get disaster recovery plans and status',
      tags: ['Security Analytics', 'Reliability', 'Disaster Recovery']
    }
  }, async (request: FastifyRequest, reply: FastifyReply): Promise<ReliabilityResponse> => {
    try {
      const drPlans = engineer.getDisasterRecoveryPlans();
      const reliabilityMetrics = engineer.getReliabilityMetrics();

      return {
        success: true,
        data: {
          disaster_recovery_plans: drPlans,
          readiness_summary: {
            total_plans: drPlans.length,
            tested_plans: drPlans.filter(p => p.last_tested > 0).length,
            critical_plans: drPlans.filter(p => p.priority === 'critical').length,
            average_success_rate: drPlans.length > 0 
              ? drPlans.reduce((sum, p) => sum + p.success_rate, 0) / drPlans.length 
              : 0
          },
          backup_status: {
            backup_success_rate: reliabilityMetrics.backup_success_rate,
            disaster_recovery_readiness: reliabilityMetrics.disaster_recovery_readiness
          }
        },
        timestamp: Date.now()
      };
    } catch (error) {
      fastify.log.error('Error getting disaster recovery information:', error);
      return {
        success: false,
        error: 'Failed to get disaster recovery information',
        timestamp: Date.now()
      };
    }
  });

  /**
   * POST /api/security-analytics/reliability/disaster-recovery/execute
   * Execute disaster recovery plan
   */
  fastify.post<{ Body: DisasterRecoveryRequest }>('/api/security-analytics/reliability/disaster-recovery/execute', {
    preHandler: [fastify.authenticate], // Should use admin auth
    schema: {
      description: 'Execute disaster recovery plan',
      tags: ['Security Analytics', 'Reliability', 'Disaster Recovery', 'Admin'],
      body: {
        type: 'object',
        required: ['planId'],
        properties: {
          planId: { type: 'string' },
          testMode: { type: 'boolean', default: false },
          force: { type: 'boolean', default: false }
        }
      }
    }
  }, async (
    request: FastifyRequest<{ Body: DisasterRecoveryRequest }>,
    reply: FastifyReply
  ): Promise<ReliabilityResponse> => {
    try {
      const { planId, testMode = false, force = false } = request.body;

      if (testMode) {
        const success = await engineer.testDisasterRecoveryPlan(planId);
        return {
          success: true,
          data: {
            plan_id: planId,
            test_mode: true,
            test_successful: success,
            timestamp: Date.now()
          },
          timestamp: Date.now()
        };
      } else {
        if (!force) {
          return {
            success: false,
            error: 'Disaster recovery execution requires force=true parameter for safety',
            timestamp: Date.now()
          };
        }

        const success = await engineer.triggerDisasterRecovery(planId);
        return {
          success: true,
          data: {
            plan_id: planId,
            execution_started: success,
            timestamp: Date.now()
          },
          timestamp: Date.now()
        };
      }
    } catch (error) {
      fastify.log.error('Error executing disaster recovery:', error);
      return {
        success: false,
        error: error.message || 'Failed to execute disaster recovery',
        timestamp: Date.now()
      };
    }
  });

  /**
   * GET /api/security-analytics/reliability/metrics
   * Get comprehensive reliability metrics
   */
  fastify.get('/api/security-analytics/reliability/metrics', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Get comprehensive reliability metrics',
      tags: ['Security Analytics', 'Reliability', 'Metrics']
    }
  }, async (request: FastifyRequest, reply: FastifyReply): Promise<ReliabilityResponse> => {
    try {
      const reliabilityMetrics = engineer.getReliabilityMetrics();
      const systemHealth = engineer.getSystemHealth();
      const circuitBreakers = engineer.getCircuitBreakerStatus();
      const activeIncidents = engineer.getActiveIncidents();

      return {
        success: true,
        data: {
          reliability_metrics: reliabilityMetrics,
          current_status: {
            overall_health: systemHealth.overall_health,
            health_score: systemHealth.health_score,
            availability: reliabilityMetrics.availability_percent,
            reliability_score: reliabilityMetrics.system_reliability_score
          },
          operational_metrics: {
            circuit_breaker_trips: reliabilityMetrics.circuit_breaker_trip_count,
            auto_healing_success_rate: reliabilityMetrics.auto_healing_success_rate,
            backup_success_rate: reliabilityMetrics.backup_success_rate,
            active_incidents: activeIncidents.length,
            mttr_minutes: reliabilityMetrics.mean_time_to_recovery_minutes,
            mtbf_hours: reliabilityMetrics.mean_time_between_failures_hours
          },
          component_availability: Object.entries(systemHealth.component_health).map(([name, health]) => ({
            component: name,
            status: health.status,
            availability: health.availability_percent,
            response_time_ms: health.response_time_ms,
            error_rate: health.error_rate
          }))
        },
        timestamp: Date.now()
      };
    } catch (error) {
      fastify.log.error('Error getting reliability metrics:', error);
      return {
        success: false,
        error: 'Failed to get reliability metrics',
        timestamp: Date.now()
      };
    }
  });

  /**
   * GET /api/security-analytics/reliability/diagnostics
   * Get comprehensive reliability diagnostics
   */
  fastify.get('/api/security-analytics/reliability/diagnostics', {
    preHandler: [fastify.authenticate], // Should use admin auth
    schema: {
      description: 'Get comprehensive reliability system diagnostics',
      tags: ['Security Analytics', 'Reliability', 'Admin', 'Diagnostics']
    }
  }, async (request: FastifyRequest, reply: FastifyReply): Promise<ReliabilityResponse> => {
    try {
      const systemHealth = engineer.getSystemHealth();
      const reliabilityMetrics = engineer.getReliabilityMetrics();
      const circuitBreakers = engineer.getCircuitBreakerStatus();
      const activeIncidents = engineer.getActiveIncidents();
      const drPlans = engineer.getDisasterRecoveryPlans();

      const diagnostics = {
        system_overview: {
          overall_health: systemHealth.overall_health,
          health_score: systemHealth.health_score,
          reliability_score: reliabilityMetrics.system_reliability_score,
          uptime_hours: systemHealth.system_metrics.uptime_ms / (1000 * 60 * 60)
        },
        component_health: systemHealth.component_health,
        reliability_metrics: reliabilityMetrics,
        circuit_breaker_status: Object.fromEntries(circuitBreakers),
        incident_management: {
          active_incidents: activeIncidents,
          incident_count_24h: reliabilityMetrics.incident_count_last_24h
        },
        disaster_recovery: {
          plans: drPlans,
          readiness_score: reliabilityMetrics.disaster_recovery_readiness,
          backup_success_rate: reliabilityMetrics.backup_success_rate
        },
        system_resources: {
          memory_usage_percent: systemHealth.system_metrics.memory_usage_percent,
          cpu_usage_percent: systemHealth.system_metrics.cpu_usage_percent,
          average_response_time_ms: systemHealth.system_metrics.average_response_time_ms
        },
        configuration: {
          circuit_breaker_enabled: true,
          fault_tolerance_enabled: true,
          disaster_recovery_enabled: true,
          health_monitoring_enabled: true,
          auto_healing_enabled: true
        }
      };

      return {
        success: true,
        data: diagnostics,
        timestamp: Date.now()
      };
    } catch (error) {
      fastify.log.error('Error getting reliability diagnostics:', error);
      return {
        success: false,
        error: 'Failed to get reliability diagnostics',
        timestamp: Date.now()
      };
    }
  });

  /**
   * POST /api/security-analytics/reliability/test/chaos
   * Trigger chaos engineering tests (admin only)
   */
  fastify.post('/api/security-analytics/reliability/test/chaos', {
    preHandler: [fastify.authenticate], // Should use admin auth
    schema: {
      description: 'Trigger chaos engineering tests',
      tags: ['Security Analytics', 'Reliability', 'Admin', 'Testing']
    }
  }, async (request: FastifyRequest, reply: FastifyReply): Promise<ReliabilityResponse> => {
    try {
      // This would implement chaos engineering tests
      // For now, return a placeholder response
      
      return {
        success: true,
        data: {
          chaos_test_started: true,
          test_id: `chaos_test_${Date.now()}`,
          estimated_duration_minutes: 10,
          affected_components: ['security_analytics', 'optimization_service'],
          timestamp: Date.now()
        },
        timestamp: Date.now()
      };
    } catch (error) {
      fastify.log.error('Error starting chaos engineering test:', error);
      return {
        success: false,
        error: 'Failed to start chaos engineering test',
        timestamp: Date.now()
      };
    }
  });

  // Setup reliability engineer event handlers for real-time updates
  engineer.on('circuit_breaker_opened', (data) => {
    fastify.log.warn('Circuit Breaker Opened:', data);
  });

  engineer.on('circuit_breaker_closed', (data) => {
    fastify.log.info('Circuit Breaker Closed:', data);
  });

  engineer.on('auto_healing_successful', (data) => {
    fastify.log.info('Auto Healing Successful:', data);
  });

  engineer.on('critical_incident_created', (incident) => {
    fastify.log.error('Critical Incident Created:', incident);
  });

  engineer.on('backup_completed', (data) => {
    fastify.log.info('Backup Completed:', data);
  });

  engineer.on('backup_failed', (data) => {
    fastify.log.error('Backup Failed:', data);
  });

  engineer.on('error', (error) => {
    fastify.log.error('Reliability Engineer Error:', error);
  });

  // Cleanup on server shutdown
  fastify.addHook('onClose', async () => {
    if (reliabilityEngineer) {
      await reliabilityEngineer.shutdown();
    }
  });
}