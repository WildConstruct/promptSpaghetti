/**
 * Compliance Scanner Integration Module
 * 
 * Handles the integration of scheduled compliance scanning with the main
 * application server, including startup initialization, health checks,
 * and graceful shutdown procedures.
 * 
 * Part of Epic 19 - Privacy & Compliance Framework
 * Task: T-1752989143998-545 - Build scheduled compliance scans
 */

import { FastifyInstance } from 'fastify';
import { getScheduledComplianceScannerRegistry } from '../services/ScheduledComplianceScannerRegistry';
import { ComplianceReportingService } from '../services/ComplianceReportingService';
import { ComplianceRuleEngine } from '../services/ComplianceRuleEngine';
import { AuditService } from '../auth/services/AuditService';
import { PolicyNotificationService } from '../services/PolicyNotificationService';
import { DatabaseService } from '../auth/database/DatabaseService';
import { RedisService } from '../auth/database/RedisService';
import { AnalyticsCollector } from '../analytics/AnalyticsCollector';

}
export interface ComplianceScannerIntegrationConfig {
  enabledEnvironments: ('development' | 'staging' | 'production')[];
  autoStart: boolean;
  healthCheckInterval: number; // milliseconds
  gracefulShutdownTimeout: number; // milliseconds
  enableMetrics: boolean;
  enableDashboard: boolean;
}
}

export class ComplianceScannerIntegration {
  private registry = getScheduledComplianceScannerRegistry();
  private healthCheckInterval?: NodeJS.Timeout;
  private isIntegrated = false;
  private config: ComplianceScannerIntegrationConfig;
  
  constructor(config: ComplianceScannerIntegrationConfig) {
    this.config = config;
  }

  /**
   * Initialize and integrate compliance scanning with the Fastify server
   */
  public async integrateWithServer(
    server: FastifyInstance,
    services: {
      reportingService: ComplianceReportingService;
      ruleEngine: ComplianceRuleEngine;
      auditService: AuditService;
      notificationService: PolicyNotificationService;
      databaseService: DatabaseService;
      redisService: RedisService;
      analyticsCollector: AnalyticsCollector;
    }
  ): Promise<void> {

    if (this.isIntegrated) {
      throw new Error('Compliance scanner integration already active');
    }

    // Initialize the registry with service dependencies
    await this.registry.initialize(services);

    // Register API routes
    await this.registerApiRoutes(server);

    // Register server lifecycle hooks
    this.registerLifecycleHooks(server);

    // Start health monitoring if enabled
    if (this.config.healthCheckInterval > 0) {
      this.startHealthMonitoring();
    }

    // Auto-start scanners if configured
    if (this.config.autoStart) {
      await this.registry.startAllScanners();
    }

    this.isIntegrated = true;
    
    console.log('Compliance Scanner Integration: Successfully integrated with server');
  }

  /**
   * Register API routes for compliance scanner management
   */
  private async registerApiRoutes(server: FastifyInstance): Promise<void> {

    // Scanner status endpoint
    server.get('/api/compliance/scanners/status', async (request, reply) => {
      try {
        const status = await this.registry.getRegistryStatus();
        return reply.code(200).send({
          success: true,
          data: status
        });
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error: error.message
        });
      }
    });

    // Health check endpoint
    server.get('/api/compliance/scanners/health', async (request, reply) => {
      try {
        const health = await this.registry.performHealthCheck();
        const statusCode = health.healthy ? 200 : 503;
        
        return reply.code(statusCode).send({
          success: health.healthy,
          data: health
        });
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error: error.message
        });
      }
    });

    // Start all scanners endpoint
    server.post('/api/compliance/scanners/start', async (request, reply) => {
      try {
        await this.registry.startAllScanners();
        return reply.code(200).send({
          success: true,
          message: 'All scanners started successfully'
        });
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error: error.message
        });
      }
    });

    // Stop all scanners endpoint
    server.post('/api/compliance/scanners/stop', async (request, reply) => {
      try {
        await this.registry.stopAllScanners();
        return reply.code(200).send({
          success: true,
          message: 'All scanners stopped successfully'
        });
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error: error.message
        });
      }
    });

    // Get specific scanner details
    server.get('/api/compliance/scanners/:scannerId', async (request, reply) => {
      try {
        const { scannerId } = request.params as { scannerId: string };
        const scanner = this.registry.getScanner(scannerId);
        
        if (!scanner) {
          return reply.code(404).send({
            success: false,
            error: `Scanner '${scannerId}' not found`
          });
        }

        const status = await scanner.getScannerStatus();
        const metrics = await scanner.getScannerMetrics();
        
        return reply.code(200).send({
          success: true,
          data: {
            scannerId,
            status,
            metrics
          }
        });
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error: error.message
        });
      }
    });

    // Trigger manual scan
    server.post('/api/compliance/scanners/:scannerId/scan', async (request, reply) => {
      try {
        const { scannerId } = request.params as { scannerId: string };
        const { scheduleId } = request.body as { scheduleId?: string };
        
        const scanner = this.registry.getScanner(scannerId);
        if (!scanner) {
          return reply.code(404).send({
            success: false,
            error: `Scanner '${scannerId}' not found`
          });
        }

        // Use default schedule if none specified
        const targetScheduleId = scheduleId || 'manual-full-compliance-scan';
        const execution = await scanner.executeScan(targetScheduleId);
        
        return reply.code(200).send({
          success: true,
          data: {
            executionId: execution.executionId,
            scheduleId: targetScheduleId,
            status: execution.status
          }
        });
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error: error.message
        });
      }
    });

    console.log('Compliance Scanner Integration: API routes registered');
  }

  /**
   * Register server lifecycle hooks for graceful startup/shutdown
   */
  private registerLifecycleHooks(server: FastifyInstance): void {
    // Graceful shutdown
    server.addHook('onClose', async () => {
      console.log('Compliance Scanner Integration: Initiating graceful shutdown...');
      
      // Stop health monitoring
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
        this.healthCheckInterval = undefined;
      }

      // Stop all scanners with timeout
      const shutdownPromise = this.registry.stopAllScanners();
      const timeoutPromise = new Promise<void>((resolve) => {
        setTimeout(() => {
          console.warn('Compliance Scanner Integration: Shutdown timeout reached, forcing cleanup');
          resolve();
        }, this.config.gracefulShutdownTimeout);
      });

      await Promise.race([shutdownPromise, timeoutPromise]);
      await this.registry.cleanup();
      
      console.log('Compliance Scanner Integration: Shutdown complete');
    });

    // Server ready hook
    server.addHook('onReady', async () => {
      console.log('Compliance Scanner Integration: Server ready, compliance scanners active');
    });
  }

  /**
   * Start periodic health monitoring
   */
  private startHealthMonitoring(): void {
    this.healthCheckInterval = setInterval(async () => {
      try {
        const health = await this.registry.performHealthCheck();
        if (!health.healthy) {
          console.warn('Compliance Scanner Integration: Health issues detected:', health.issues);
          
          // Could implement automatic remediation here
          // For now, just log the issues for manual intervention
        }
      } catch (error) {
        console.error('Compliance Scanner Integration: Health check failed:', error);
      }
    }, this.config.healthCheckInterval);
  }

  /**
   * Get integration status
   */
  public getIntegrationStatus(): {
    integrated: boolean;
    config: ComplianceScannerIntegrationConfig;
    healthMonitoring: boolean;
    } {
    return {
      integrated: this.isIntegrated,
      config: this.config,
      healthMonitoring: this.healthCheckInterval !== undefined
    };
  }

  /**
   * Manually trigger health check
   */
  public async performHealthCheck(): Promise<{
    healthy: boolean;
    issues: Array<{
      scannerId: string;
      issue: string;
      severity: 'warning' | 'error';
    }>;
  }> {
    return await this.registry.performHealthCheck();
  }
}

/**
 * Factory function to create compliance scanner integration with default configuration
 */
export function createComplianceScannerIntegration(
  overrides: Partial<ComplianceScannerIntegrationConfig> = {}
): ComplianceScannerIntegration {
  const defaultConfig: ComplianceScannerIntegrationConfig = {
    enabledEnvironments: ['production', 'staging'],
    autoStart: true,
    healthCheckInterval: 5 * 60 * 1000, // 5 minutes
    gracefulShutdownTimeout: 30 * 1000, // 30 seconds
    enableMetrics: true,
    enableDashboard: true
  };

  const config = { ...defaultConfig, ...overrides };
  return new ComplianceScannerIntegration(config);
}