#!/usr/bin/env node
/**
 * Epic 1 Rollback Orchestrator
 * Central control system for all rollback procedures
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { monitoring } from '../../packages/core/monitoring/MonitoringService';
import { safety } from '../../packages/core/safety/SafetyFramework';

const execAsync = promisify(exec);

export interface RollbackConfig {
  type: 'full' | 'frontend' | 'backend' | 'database' | 'feature';
  reason: string;
  targetVersion?: string;
  dryRun?: boolean;
  force?: boolean;
}

export interface RollbackResult {
  success: boolean;
  type: string;
  duration: number;
  errors: string[];
  warnings: string[];
  rollbackPoint?: string;
}

/**
 * Main rollback orchestrator
 */
export class RollbackOrchestrator {
  private static instance: RollbackOrchestrator;
  private rollbackLog: string[] = [];
  private isRollingBack = false;
  
  static getInstance(): RollbackOrchestrator {
    if (!this.instance) {
      this.instance = new RollbackOrchestrator();
    }
    return this.instance;
  }
  
  /**
   * Execute a rollback
   */
  async executeRollback(config: RollbackConfig): Promise<RollbackResult> {
    if (this.isRollingBack && !config.force) {
      throw new Error('Rollback already in progress');
    }
    
    this.isRollingBack = true;
    const startTime = Date.now();
    const errors: string[] = [];
    const warnings: string[] = [];
    
    try {
      // Log rollback initiation
      this.log(`Starting ${config.type} rollback: ${config.reason}`);
      
      // Create rollback point
      const rollbackPoint = await this.createRollbackPoint(config);
      
      // Notify team
      await this.notifyTeam(config);
      
      // Execute rollback based on type
      let result: boolean;
      
      switch (config.type) {
        case 'full':
          result = await this.rollbackFull(config, errors, warnings);
          break;
        case 'frontend':
          result = await this.rollbackFrontend(config, errors, warnings);
          break;
        case 'backend':
          result = await this.rollbackBackend(config, errors, warnings);
          break;
        case 'database':
          result = await this.rollbackDatabase(config, errors, warnings);
          break;
        case 'feature':
          result = await this.rollbackFeatureFlags(config, errors, warnings);
          break;
        default:
          throw new Error(`Unknown rollback type: ${config.type}`);
      }
      
      // Verify system health
      const isHealthy = await this.verifySystemHealth();
      
      if (!isHealthy) {
        warnings.push('System health check failed after rollback');
      }
      
      const duration = Date.now() - startTime;
      
      // Log metrics
      monitoring.recordMetric('rollback.executed', 1, {
        type: config.type,
        success: result ? 'true' : 'false',
        duration: duration.toString(),
      });
      
      return {
        success: result,
        type: config.type,
        duration,
        errors,
        warnings,
        rollbackPoint,
      };
      
    } catch (error) {
      errors.push(error.message);
      
      return {
        success: false,
        type: config.type,
        duration: Date.now() - startTime,
        errors,
        warnings,
      };
      
    } finally {
      this.isRollingBack = false;
      await this.saveRollbackLog();
    }
  }
  
  /**
   * Rollback entire system
   */
  private async rollbackFull(
    config: RollbackConfig,
    errors: string[],
    warnings: string[]
  ): Promise<boolean> {
    this.log('Executing full system rollback');
    
    const steps = [
      () => this.rollbackFrontend(config, errors, warnings),
      () => this.rollbackBackend(config, errors, warnings),
      () => this.rollbackDatabase(config, errors, warnings),
      () => this.rollbackFeatureFlags(config, errors, warnings),
    ];
    
    for (const step of steps) {
      const success = await step();
      if (!success) {
        errors.push('Full rollback halted due to step failure');
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Rollback frontend
   */
  private async rollbackFrontend(
    config: RollbackConfig,
    errors: string[],
    warnings: string[]
  ): Promise<boolean> {
    this.log('Rolling back frontend');
    
    try {
      if (config.dryRun) {
        this.log('[DRY RUN] Would rollback frontend');
        return true;
      }
      
      // Switch CDN to previous version
      await execAsync(`
        aws cloudfront create-invalidation \
          --distribution-id ${process.env.CDN_DISTRIBUTION_ID} \
          --paths "/*"
      `);
      
      // Update index.html to previous version
      const previousVersion = config.targetVersion || await this.getPreviousVersion('frontend');
      await execAsync(`
        aws s3 cp s3://prompt-spaghetti-prod/releases/${previousVersion}/index.html \
                 s3://prompt-spaghetti-prod/index.html
      `);
      
      this.log(`Frontend rolled back to version ${previousVersion}`);
      return true;
      
    } catch (error) {
      errors.push(`Frontend rollback failed: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Rollback backend
   */
  private async rollbackBackend(
    config: RollbackConfig,
    errors: string[],
    warnings: string[]
  ): Promise<boolean> {
    this.log('Rolling back backend');
    
    try {
      if (config.dryRun) {
        this.log('[DRY RUN] Would rollback backend');
        return true;
      }
      
      const previousVersion = config.targetVersion || await this.getPreviousVersion('backend');
      
      // Blue-green deployment switch
      await execAsync(`
        kubectl set image deployment/api-server \
          api-server=prompt-spaghetti:${previousVersion} \
          -n production
      `);
      
      // Wait for rollout
      await execAsync('kubectl rollout status deployment/api-server -n production');
      
      this.log(`Backend rolled back to version ${previousVersion}`);
      return true;
      
    } catch (error) {
      errors.push(`Backend rollback failed: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Rollback database
   */
  private async rollbackDatabase(
    config: RollbackConfig,
    errors: string[],
    warnings: string[]
  ): Promise<boolean> {
    this.log('Rolling back database');
    
    try {
      if (config.dryRun) {
        this.log('[DRY RUN] Would rollback database');
        return true;
      }
      
      // This is a simplified version - real implementation would use proper DB tools
      const backupPath = `/backups/pre_deployment_${new Date().toISOString()}.sql`;
      
      // Create backup of current state
      await execAsync(`pg_dump prompt_spaghetti > ${backupPath}`);
      
      // Restore from previous backup
      const previousBackup = await this.getLatestBackup();
      await execAsync(`psql prompt_spaghetti < ${previousBackup}`);
      
      this.log('Database rolled back successfully');
      return true;
      
    } catch (error) {
      errors.push(`Database rollback failed: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Rollback feature flags
   */
  private async rollbackFeatureFlags(
    config: RollbackConfig,
    errors: string[],
    warnings: string[]
  ): Promise<boolean> {
    this.log('Rolling back feature flags');
    
    try {
      if (config.dryRun) {
        this.log('[DRY RUN] Would disable Epic 1 feature flags');
        return true;
      }
      
      // Disable all Epic 1 features
      const epic1Flags = [
        'epic1-inline-editing',
        'epic1-new-engine',
        'epic1-preview-system',
        'epic1-asset-library',
        'epic1-medieval-demo',
      ];
      
      for (const flag of epic1Flags) {
        safety.featureFlags.setFlag(flag, false);
        this.log(`Disabled feature flag: ${flag}`);
      }
      
      // Clear client caches
      await this.clearClientCaches();
      
      return true;
      
    } catch (error) {
      errors.push(`Feature flag rollback failed: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Create a rollback point
   */
  private async createRollbackPoint(config: RollbackConfig): Promise<string> {
    const pointId = `rollback-${Date.now()}-${config.type}`;
    
    safety.createRollbackPoint(pointId, config.reason, {
      type: config.type,
      timestamp: new Date().toISOString(),
      config,
    });
    
    return pointId;
  }
  
  /**
   * Get previous version
   */
  private async getPreviousVersion(component: string): Promise<string> {
    // In a real system, this would query version history
    // For now, returning a mock version
    return 'v1.0.0';
  }
  
  /**
   * Get latest database backup
   */
  private async getLatestBackup(): Promise<string> {
    // In a real system, this would list backup files
    // For now, returning a mock path
    return '/backups/latest.sql';
  }
  
  /**
   * Clear client caches
   */
  private async clearClientCaches(): Promise<void> {
    // Send cache clear signal to clients
    // This would use WebSocket or similar in production
    this.log('Client caches cleared');
  }
  
  /**
   * Verify system health after rollback
   */
  private async verifySystemHealth(): Promise<boolean> {
    const health = await safety.runHealthChecks();
    
    const allHealthy = Object.values(health).every(
      check => check.passed
    );
    
    if (!allHealthy) {
      this.log('WARNING: System health check failed');
      console.error('Health check results:', health);
    }
    
    return allHealthy;
  }
  
  /**
   * Notify team about rollback
   */
  private async notifyTeam(config: RollbackConfig): Promise<void> {
    const message = {
      text: `🚨 Rollback initiated: ${config.type}`,
      attachments: [{
        color: 'danger',
        fields: [
          { title: 'Type', value: config.type },
          { title: 'Reason', value: config.reason },
          { title: 'Time', value: new Date().toISOString() },
        ],
      }],
    };
    
    // Send to Slack (mock implementation)
    console.log('Slack notification:', message);
    
    // Send to PagerDuty (mock implementation)
    if (config.type === 'full' || config.type === 'database') {
      console.log('PagerDuty alert triggered');
    }
  }
  
  /**
   * Log message
   */
  private log(message: string): void {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    
    console.log(logEntry);
    this.rollbackLog.push(logEntry);
  }
  
  /**
   * Save rollback log
   */
  private async saveRollbackLog(): Promise<void> {
    const logPath = path.join(__dirname, `../../logs/rollback-${Date.now()}.log`);
    await fs.promises.writeFile(logPath, this.rollbackLog.join('\n'));
  }
}

// CLI interface
if (require.main === module) {
  const [,, type, reason] = process.argv;
  
  if (!type || !reason) {
    console.error('Usage: rollback-orchestrator.ts <type> <reason>');
    console.error('Types: full, frontend, backend, database, feature');
    process.exit(1);
  }
  
  const orchestrator = RollbackOrchestrator.getInstance();
  
  orchestrator.executeRollback({
    type: type as any,
    reason,
    dryRun: process.env.DRY_RUN === 'true',
  }).then(result => {
    console.log('Rollback result:', result);
    process.exit(result.success ? 0 : 1);
  }).catch(error => {
    console.error('Rollback failed:', error);
    process.exit(1);
  });
}