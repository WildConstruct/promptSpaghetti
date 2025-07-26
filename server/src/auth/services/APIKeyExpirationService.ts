/**
 * API Key Expiration and Rotation Management Service - Epic 17.4.4
 * 
 * Handles automatic expiration detection, rotation policies, and lifecycle management
 * for API keys as part of Epic 17 Backstage Admin Controls.
 * 
 * Features:
 * - Automatic expiration detection and handling
 * - Configurable rotation policies
 * - Cleanup of expired keys
 * - Notification system for expiring keys
 * - Audit trail for all lifecycle events
 * 
 * Task: E17-1753114397219-575289 - Implement key management
 */

import { DatabaseService } from '../database/DatabaseService';
import { AuditService } from './AuditService';
import { ApiKey } from './ApiKeyManagementService';

// Export enums for test compatibility
export enum APIKeyType {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TESTING = 'testing',
  API_ACCESS = 'api_access'
}

export enum ExpirationPolicyEnum {
  FIXED_DURATION = 'fixed_duration',
  USAGE_BASED = 'usage_based', 
  SLIDING_WINDOW = 'sliding_window',
  NEVER = 'never'
}

export enum APIKeyStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
  PENDING = 'pending'
}

// Keep interface for backward compatibility
export interface ExpirationPolicy {
  warningDays: number; // Days before expiration to send warning
  gracePerioddDays: number; // Days after expiration before cleanup
  autoCleanup: boolean; // Whether to automatically clean up expired keys
  notifyUsers: boolean; // Whether to notify users of expiring keys
}

export interface RotationPolicy {
  maxAgedays: number; // Maximum age before rotation is recommended
  autoRotate: boolean; // Whether to automatically rotate keys
  rotationWarningDays: number; // Days before recommended rotation
  criticalAgedays: number; // Age at which rotation becomes critical
}

export interface ExpirationCheck {
  keyId: string;
  userId: string;
  name: string;
  status: 'active' | 'warning' | 'expired' | 'critical';
  daysUntilExpiration?: number;
  daysSinceExpiration?: number;
  recommendedAction: 'none' | 'warn_user' | 'rotate' | 'cleanup';
}

export interface RotationCheck {
  keyId: string;
  userId: string;
  name: string;
  ageInDays: number;
  status: 'fresh' | 'aging' | 'rotation_recommended' | 'rotation_critical';
  rotationCount: number;
  recommendedAction: 'none' | 'schedule_rotation' | 'force_rotation';
}

export class ApiKeyExpirationService {
  private expirationPolicy: ExpirationPolicy;
  private rotationPolicy: RotationPolicy;
  private processingInterval: NodeJS.Timeout | null = null;

  constructor(
    private databaseService: DatabaseService,
    private auditService: AuditService,
    expirationPolicy: Partial<ExpirationPolicy> = {},
    rotationPolicy: Partial<RotationPolicy> = {}
  ) {
    // Default expiration policy
    this.expirationPolicy = {
      warningDays: expirationPolicy.warningDays || 30,
      gracePerioddDays: expirationPolicy.gracePerioddDays || 7,
      autoCleanup: expirationPolicy.autoCleanup ?? true,
      notifyUsers: expirationPolicy.notifyUsers ?? true
    };

    // Default rotation policy  
    this.rotationPolicy = {
      maxAgedays: rotationPolicy.maxAgedays || 365,
      autoRotate: rotationPolicy.autoRotate ?? false,
      rotationWarningDays: rotationPolicy.rotationWarningDays || 30,
      criticalAgedays: rotationPolicy.criticalAgedays || 730 // 2 years
    };
  }

  /**
   * Start the expiration and rotation monitoring service
   */
  startMonitoring(intervalHours: number = 24): void {
    if (this.processingInterval) {
      this.stopMonitoring();
    }

    const intervalMs = intervalHours * 60 * 60 * 1000;
    this.processingInterval = setInterval(async () => {
      try {
        await this.processExpirationChecks();
        await this.processRotationChecks();
      } catch (error) {
        console.error('Expiration service monitoring error:', error);
        await this.auditService.logEvent({
          eventType: 'EXPIRATION_SERVICE_ERROR',
          details: {
            error: error instanceof Error ? error.message : 'Unknown error'
          },
          riskLevel: 'MEDIUM',
          compliance: {
            frameworks: ['SOC2'],
            requirements: ['key_management'],
            evidenceLevel: 'STANDARD'
          }
        });
      }
    }, intervalMs);

    console.log(`API Key expiration monitoring started (interval: ${intervalHours} hours)`);
  }

  /**
   * Stop the monitoring service
   */
  stopMonitoring(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
      console.log('API Key expiration monitoring stopped');
    }
  }

  /**
   * Check for expiring and expired API keys
   */
  async checkExpirations(): Promise<ExpirationCheck[]> {
    const query = `
      SELECT key_id, user_id, name, expires_at, status, created_at
      FROM api_keys
      WHERE status = 'active' 
      AND expires_at IS NOT NULL
      ORDER BY expires_at ASC
    `;

    const result = await this.databaseService.query(query);
    const now = new Date();
    const checks: ExpirationCheck[] = [];

    for (const row of result.rows) {
      const expiresAt = new Date(row.expires_at);
      const daysUntilExpiration = Math.ceil((expiresAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
      
      let status: ExpirationCheck['status'];
      let recommendedAction: ExpirationCheck['recommendedAction'];

      if (daysUntilExpiration < 0) {
        // Already expired
        const daysSinceExpiration = Math.abs(daysUntilExpiration);
        if (daysSinceExpiration > this.expirationPolicy.gracePerioddDays) {
          status = 'critical';
          recommendedAction = 'cleanup';
        } else {
          status = 'expired';
          recommendedAction = 'rotate';
        }
        
        checks.push({
          keyId: row.key_id,
          userId: row.user_id,
          name: row.name,
          status,
          daysSinceExpiration,
          recommendedAction
        });
      } else if (daysUntilExpiration <= this.expirationPolicy.warningDays) {
        // Expiring soon
        status = 'warning';
        recommendedAction = 'warn_user';
        
        checks.push({
          keyId: row.key_id,
          userId: row.user_id,
          name: row.name,
          status,
          daysUntilExpiration,
          recommendedAction
        });
      } else {
        // Still active
        checks.push({
          keyId: row.key_id,
          userId: row.user_id,
          name: row.name,
          status: 'active',
          daysUntilExpiration,
          recommendedAction: 'none'
        });
      }
    }

    return checks;
  }

  /**
   * Check for keys that need rotation based on age
   */
  async checkRotations(): Promise<RotationCheck[]> {
    const query = `
      SELECT key_id, user_id, name, created_at, metadata
      FROM api_keys
      WHERE status = 'active'
      ORDER BY created_at ASC
    `;

    const result = await this.databaseService.query(query);
    const now = new Date();
    const checks: RotationCheck[] = [];

    for (const row of result.rows) {
      const createdAt = new Date(row.created_at);
      const ageInDays = Math.floor((now.getTime() - createdAt.getTime()) / (24 * 60 * 60 * 1000));
      const metadata = typeof row.metadata === 'object' ? row.metadata : JSON.parse(row.metadata || '{}');
      const rotationCount = metadata.rotationCount || 0;

      let status: RotationCheck['status'];
      let recommendedAction: RotationCheck['recommendedAction'];

      if (ageInDays >= this.rotationPolicy.criticalAgedays) {
        status = 'rotation_critical';
        recommendedAction = 'force_rotation';
      } else if (ageInDays >= this.rotationPolicy.maxAgedays) {
        status = 'rotation_recommended';
        recommendedAction = 'schedule_rotation';
      } else if (ageInDays >= (this.rotationPolicy.maxAgedays - this.rotationPolicy.rotationWarningDays)) {
        status = 'aging';
        recommendedAction = 'none';
      } else {
        status = 'fresh';
        recommendedAction = 'none';
      }

      checks.push({
        keyId: row.key_id,
        userId: row.user_id,
        name: row.name,
        ageInDays,
        status,
        rotationCount,
        recommendedAction
      });
    }

    return checks;
  }

  /**
   * Process expiration checks and take appropriate actions
   */
  async processExpirationChecks(): Promise<void> {
    const checks = await this.checkExpirations();
    let processedCount = 0;

    for (const check of checks) {
      switch (check.recommendedAction) {
      case 'cleanup':
        if (this.expirationPolicy.autoCleanup) {
          await this.cleanupExpiredKey(check);
          processedCount++;
        }
        break;
          
      case 'warn_user':
        if (this.expirationPolicy.notifyUsers) {
          await this.notifyUserOfExpiration(check);
          processedCount++;
        }
        break;
          
      case 'rotate':
        // Mark as expired but don't auto-rotate (user decision)
        await this.markAsExpired(check);
        processedCount++;
        break;
      }
    }

    await this.auditService.logEvent({
      eventType: 'EXPIRATION_CHECK_COMPLETED',
      details: {
        totalChecked: checks.length,
        processed: processedCount,
        summary: {
          active: checks.filter(c => c.status === 'active').length,
          warning: checks.filter(c => c.status === 'warning').length,
          expired: checks.filter(c => c.status === 'expired').length,
          critical: checks.filter(c => c.status === 'critical').length
        }
      },
      riskLevel: 'LOW',
      compliance: {
        frameworks: ['SOC2'],
        requirements: ['key_management'],
        evidenceLevel: 'STANDARD'
      }
    });
  }

  /**
   * Process rotation checks and take appropriate actions
   */
  async processRotationChecks(): Promise<void> {
    const checks = await this.checkRotations();
    let processedCount = 0;

    for (const check of checks) {
      if (check.recommendedAction === 'force_rotation' && this.rotationPolicy.autoRotate) {
        await this.notifyForceRotation(check);
        processedCount++;
      } else if (check.recommendedAction === 'schedule_rotation') {
        await this.notifyScheduleRotation(check);
        processedCount++;
      }
    }

    await this.auditService.logEvent({
      eventType: 'ROTATION_CHECK_COMPLETED',
      details: {
        totalChecked: checks.length,
        processed: processedCount,
        summary: {
          fresh: checks.filter(c => c.status === 'fresh').length,
          aging: checks.filter(c => c.status === 'aging').length,
          rotationRecommended: checks.filter(c => c.status === 'rotation_recommended').length,
          rotationCritical: checks.filter(c => c.status === 'rotation_critical').length
        }
      },
      riskLevel: 'LOW',
      compliance: {
        frameworks: ['SOC2'],
        requirements: ['key_management'],
        evidenceLevel: 'STANDARD'
      }
    });
  }

  /**
   * Clean up expired API key
   */
  private async cleanupExpiredKey(check: ExpirationCheck): Promise<void> {
    const query = `
      UPDATE api_keys 
      SET status = 'expired', updated_at = NOW()
      WHERE key_id = $1 AND status = 'active'
    `;
    
    await this.databaseService.query(query, [check.keyId]);

    await this.auditService.logEvent({
      eventType: 'API_KEY_AUTO_EXPIRED',
      userId: check.userId,
      details: {
        keyId: check.keyId,
        name: check.name,
        daysSinceExpiration: check.daysSinceExpiration,
        reason: 'Automatic cleanup after grace period'
      },
      riskLevel: 'MEDIUM',
      compliance: {
        frameworks: ['SOC2'],
        requirements: ['key_management'],
        evidenceLevel: 'ENHANCED'
      }
    });
  }

  /**
   * Mark key as expired
   */
  private async markAsExpired(check: ExpirationCheck): Promise<void> {
    const query = `
      UPDATE api_keys 
      SET status = 'expired', updated_at = NOW()
      WHERE key_id = $1 AND status = 'active'
    `;
    
    await this.databaseService.query(query, [check.keyId]);

    await this.auditService.logEvent({
      eventType: 'API_KEY_EXPIRED',
      userId: check.userId,
      details: {
        keyId: check.keyId,
        name: check.name,
        daysSinceExpiration: check.daysSinceExpiration
      },
      riskLevel: 'MEDIUM',
      compliance: {
        frameworks: ['SOC2'],
        requirements: ['key_management'],
        evidenceLevel: 'STANDARD'
      }
    });
  }

  /**
   * Notify user of expiring key
   */
  private async notifyUserOfExpiration(check: ExpirationCheck): Promise<void> {
    // In full implementation, would send email/notification
    await this.auditService.logEvent({
      eventType: 'API_KEY_EXPIRATION_WARNING',
      userId: check.userId,
      details: {
        keyId: check.keyId,
        name: check.name,
        daysUntilExpiration: check.daysUntilExpiration,
        notificationType: 'expiration_warning'
      },
      riskLevel: 'LOW',
      compliance: {
        frameworks: ['SOC2'],
        requirements: ['key_management'],
        evidenceLevel: 'STANDARD'
      }
    });
  }

  /**
   * Notify user of force rotation requirement
   */
  private async notifyForceRotation(check: RotationCheck): Promise<void> {
    await this.auditService.logEvent({
      eventType: 'API_KEY_ROTATION_CRITICAL',
      userId: check.userId,
      details: {
        keyId: check.keyId,
        name: check.name,
        ageInDays: check.ageInDays,
        rotationCount: check.rotationCount,
        notificationType: 'force_rotation'
      },
      riskLevel: 'HIGH',
      compliance: {
        frameworks: ['SOC2'],
        requirements: ['key_management'],
        evidenceLevel: 'ENHANCED'
      }
    });
  }

  /**
   * Notify user of recommended rotation
   */
  private async notifyScheduleRotation(check: RotationCheck): Promise<void> {
    await this.auditService.logEvent({
      eventType: 'API_KEY_ROTATION_RECOMMENDED',
      userId: check.userId,
      details: {
        keyId: check.keyId,
        name: check.name,
        ageInDays: check.ageInDays,
        rotationCount: check.rotationCount,
        notificationType: 'schedule_rotation'
      },
      riskLevel: 'MEDIUM',
      compliance: {
        frameworks: ['SOC2'],
        requirements: ['key_management'],
        evidenceLevel: 'STANDARD'
      }
    });
  }

  /**
   * Get expiration and rotation summary
   */
  async getSummary(): Promise<{
    expirations: {
      active: number;
      warning: number;
      expired: number;
      critical: number;
    };
    rotations: {
      fresh: number;
      aging: number;
      recommended: number;
      critical: number;
    };
    policies: {
      expiration: ExpirationPolicy;
      rotation: RotationPolicy;
    };
  }> {
    const [expirationChecks, rotationChecks] = await Promise.all([
      this.checkExpirations(),
      this.checkRotations()
    ]);

    return {
      expirations: {
        active: expirationChecks.filter(c => c.status === 'active').length,
        warning: expirationChecks.filter(c => c.status === 'warning').length,
        expired: expirationChecks.filter(c => c.status === 'expired').length,
        critical: expirationChecks.filter(c => c.status === 'critical').length
      },
      rotations: {
        fresh: rotationChecks.filter(c => c.status === 'fresh').length,
        aging: rotationChecks.filter(c => c.status === 'aging').length,
        recommended: rotationChecks.filter(c => c.status === 'rotation_recommended').length,
        critical: rotationChecks.filter(c => c.status === 'rotation_critical').length
      },
      policies: {
        expiration: this.expirationPolicy,
        rotation: this.rotationPolicy
      }
    };
  }

  /**
   * Update expiration policy
   */
  updateExpirationPolicy(policy: Partial<ExpirationPolicy>): void {
    this.expirationPolicy = { ...this.expirationPolicy, ...policy };
  }

  /**
   * Update rotation policy
   */
  updateRotationPolicy(policy: Partial<RotationPolicy>): void {
    this.rotationPolicy = { ...this.rotationPolicy, ...policy };
  }

  /**
   * Cleanup service resources
   */
  destroy(): void {
    this.stopMonitoring();
  }
}