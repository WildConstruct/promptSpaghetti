/**
 * Scheduled Compliance Scanner Registry & Integration
 * 
 * Handles initialization, registration, and lifecycle management of scheduled
 * compliance scanning services. Provides centralized configuration and
 * integration with existing compliance infrastructure.
 * 
 * Part of Epic 19 - Privacy & Compliance Framework
 * Task: T-1752989143998-545 - Build scheduled compliance scans
 */

import { ScheduledComplianceScanner } from './ScheduledComplianceScanner';
import { ComplianceReportingService } from './ComplianceReportingService';
import { ComplianceRuleEngine } from './ComplianceRuleEngine';
import { AuditService } from '../auth/services/AuditService';
import { PolicyNotificationService } from './PolicyNotificationService';
import { DatabaseService } from '../auth/database/DatabaseService';
import { RedisService } from '../auth/database/RedisService';
import { AnalyticsCollector } from '../analytics/AnalyticsCollector';

export class ScheduledComplianceScannerRegistry {
  private static instance: ScheduledComplianceScannerRegistry;
  private scanners: Map<string, ScheduledComplianceScanner> = new Map();
  private isInitialized = false;
  
  // Service Dependencies
  private reportingService: ComplianceReportingService;
  private ruleEngine: ComplianceRuleEngine;
  private auditService: AuditService;
  private notificationService: PolicyNotificationService;
  private databaseService: DatabaseService;
  private redisService: RedisService;
  private analyticsCollector: AnalyticsCollector;

  private constructor() {
    // Private constructor for singleton pattern
  }

  public static getInstance(): ScheduledComplianceScannerRegistry {
    if (!ScheduledComplianceScannerRegistry.instance) {
      ScheduledComplianceScannerRegistry.instance = new ScheduledComplianceScannerRegistry();
    }
    return ScheduledComplianceScannerRegistry.instance;
  }

  /**
   * Initialize the registry with required service dependencies
   */
  public async initialize(dependencies: {
    reportingService: ComplianceReportingService;
    ruleEngine: ComplianceRuleEngine;
    auditService: AuditService;
    notificationService: PolicyNotificationService;
    databaseService: DatabaseService;
    redisService: RedisService;
    analyticsCollector: AnalyticsCollector;
  }): Promise<void> {

    if (this.isInitialized) {
      throw new Error('ScheduledComplianceScannerRegistry is already initialized');
    }

    // Store service dependencies
    this.reportingService = dependencies.reportingService;
    this.ruleEngine = dependencies.ruleEngine;
    this.auditService = dependencies.auditService;
    this.notificationService = dependencies.notificationService;
    this.databaseService = dependencies.databaseService;
    this.redisService = dependencies.redisService;
    this.analyticsCollector = dependencies.analyticsCollector;

    // Create and register default scanners
    await this.createDefaultScanners();

    this.isInitialized = true;
    
    await this.auditService.logEvent({
      type: 'SYSTEM_INITIALIZATION',
      userId: 'system',
      details: {
        component: 'ScheduledComplianceScannerRegistry',
        scannerCount: this.scanners.size,
        timestamp: new Date()
      }
    });
  }

  /**
   * Create default scheduled scanners with predefined configurations
   */
  private async createDefaultScanners(): Promise<void> {

    const defaultConfigurations = [
      {
        scannerId: 'production-compliance-scanner',
        environment: 'production' as const,
        description: 'Production compliance monitoring with comprehensive scanning'
  }
      {
        scannerId: 'staging-compliance-scanner',
        environment: 'staging' as const,
        description: 'Staging environment compliance validation'
  }
      {
        scannerId: 'audit-preparation-scanner',
        environment: 'production' as const,
        description: 'Specialized scanner for audit preparation and evidence collection'
      }
    ];

    for (const config of defaultConfigurations) {
      const scanner = new ScheduledComplianceScanner({
        scannerId: config.scannerId,
        environment: config.environment,
        services: {
          reportingService: this.reportingService,
          ruleEngine: this.ruleEngine,
          auditService: this.auditService,
          notificationService: this.notificationService
        }
      });

      await scanner.initialize();
      this.scanners.set(config.scannerId, scanner);
    }
  }

  /**
   * Register a custom scheduled compliance scanner
   */
  public async registerScanner(
    scannerId: string,
    scanner: ScheduledComplianceScanner
  ): Promise<void> {

    if (!this.isInitialized) {
      throw new Error('Registry must be initialized before registering scanners');
    }

    if (this.scanners.has(scannerId)) {
      throw new Error(`Scanner with ID '${scannerId}' already exists`);
    }

    await scanner.initialize();
    this.scanners.set(scannerId, scanner);

    await this.auditService.logEvent({
      type: 'SCANNER_REGISTERED',
      userId: 'system',
      details: {
        scannerId,
        timestamp: new Date()
      }
    });
  }

  /**
   * Get a registered scanner by ID
   */
  public getScanner(scannerId: string): ScheduledComplianceScanner | undefined {
    return this.scanners.get(scannerId);
  }

  /**
   * Get all registered scanners
   */
  public getAllScanners(): Map<string, ScheduledComplianceScanner> {
    return new Map(this.scanners);
  }

  /**
   * Start all registered scanners
   */
  public async startAllScanners(): Promise<void> {

    if (!this.isInitialized) {
      throw new Error('Registry must be initialized before starting scanners');
    }

    const startPromises = Array.from(this.scanners.values()).map(async (scanner) => {
      try {
        await scanner.startScheduledScanning();
        return { success: true, scanner: scanner.getScannerId() };
      } catch (error) {
        return { 
          success: false, 
          scanner: scanner.getScannerId(), 
          error: error.message 
        };
      }
    });

    const results = await Promise.allSettled(startPromises);
    const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const totalCount = this.scanners.size;

    await this.auditService.logEvent({
      type: 'SCANNERS_STARTED',
      userId: 'system',
      details: {
        total: totalCount,
        successful: successCount,
        failed: totalCount - successCount,
        timestamp: new Date()
      }
    });

    // Track analytics
    await this.analyticsCollector.trackEvent('compliance_scanners_started', {
      totalScanners: totalCount,
      successfulStarts: successCount,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Stop all registered scanners
   */
  public async stopAllScanners(): Promise<void> {

    const stopPromises = Array.from(this.scanners.values()).map(async (scanner) => {
      try {
        await scanner.stopScheduledScanning();
        return { success: true, scanner: scanner.getScannerId() };
      } catch (error) {
        return { 
          success: false, 
          scanner: scanner.getScannerId(), 
          error: error.message 
        };
      }
    });

    const results = await Promise.allSettled(stopPromises);
    const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;

    await this.auditService.logEvent({
      type: 'SCANNERS_STOPPED',
      userId: 'system',
      details: {
        total: this.scanners.size,
        successful: successCount,
        timestamp: new Date()
      }
    });
  }

  /**
   * Remove a scanner from the registry
   */
  public async unregisterScanner(scannerId: string): Promise<boolean> {

    const scanner = this.scanners.get(scannerId);
    if (!scanner) {
      return false;
    }

    try {
      await scanner.stopScheduledScanning();
    } catch (error) {
      console.warn(`Warning: Failed to stop scanner '${scannerId}' during unregistration:`, error);
    }

    this.scanners.delete(scannerId);

    await this.auditService.logEvent({
      type: 'SCANNER_UNREGISTERED',
      userId: 'system',
      details: {
        scannerId,
        timestamp: new Date()
      }
    });

    return true;
  }

  /**
   * Get registry status and health information
   */
  public async getRegistryStatus(): Promise<{
    initialized: boolean;
    scannerCount: number;
    activeScanners: number;
    scannerDetails: Array<{
      id: string;
      active: boolean;
      scheduleCount: number;
      lastExecution?: Date;
      nextExecution?: Date;
    }>;
  }> {
    const scannerDetails = await Promise.all(
      Array.from(this.scanners.entries()).map(async ([id, scanner]) => {
        const status = await scanner.getScannerStatus();
        return {
          id,
          active: status.active,
          scheduleCount: status.scheduleCount,
          lastExecution: status.lastExecution,
          nextExecution: status.nextExecution
        };
  }
    );

    return {
      initialized: this.isInitialized,
      scannerCount: this.scanners.size,
      activeScanners: scannerDetails.filter(s => s.active).length,
      scannerDetails
    };
  }

  /**
   * Health check for all registered scanners
   */
  public async performHealthCheck(): Promise<{
    healthy: boolean;
    issues: Array<{
      scannerId: string;
      issue: string;
      severity: 'warning' | 'error';
    }>;
  }> {
    const issues: Array<{ scannerId: string; issue: string; severity: 'warning' | 'error' }> = [];

    for (const [scannerId, scanner] of this.scanners.entries()) {
      try {
        const health = await scanner.performHealthCheck();
        if (!health.healthy) {
          issues.push(...health.issues.map(issue => ({
            scannerId,
            issue,
            severity: health.critical ? 'error' as const : 'warning' as const
          })));
        }
      } catch (error) {
        issues.push({
          scannerId,
          issue: `Health check failed: ${error.message}`,
          severity: 'error'
        });
      }
    }

    return {
      healthy: issues.length === 0,
      issues
    };
  }

  /**
   * Cleanup registry resources
   */
  public async cleanup(): Promise<void> {

    await this.stopAllScanners();
    this.scanners.clear();
    this.isInitialized = false;

    await this.auditService.logEvent({
      type: 'REGISTRY_CLEANUP',
      userId: 'system',
      details: {
        timestamp: new Date()
      }
    });
  }
}

// Export singleton instance getter for convenience
export const getScheduledComplianceScannerRegistry = () => ScheduledComplianceScannerRegistry.getInstance();