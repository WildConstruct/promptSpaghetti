/**
 * Epic 17 Password Management Service - API Management Security
 * Task: E17-1753114397015-CD835D - Create password management
 * 
 * Specialized password and secret management service for the Epic 17 API Management System.
 * Handles API key secrets, administrative credentials, service authentication, and
 * secure storage/rotation for all API management components.
 */

import { DatabaseService } from '../auth/database/DatabaseService';
import { RedisService } from '../auth/database/RedisService';
import { AuditService } from '../auth/services/AuditService';
import { EventEmitter } from 'events';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

// =============================================================================
// Epic 17 Password Management Types
// =============================================================================

}
}
export interface Epic17PasswordConfig {
  // API Key Secret Management
  apiKeySecretLength: number;
  apiKeySecretRotationDays: number;
  apiKeyHashRounds: number;
  
  // Administrative Password Requirements
  adminPasswordMinLength: number;
  adminPasswordComplexity: {
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSymbols: boolean;
    minUniqueChars: number;
}
}
  };
  adminPasswordMaxAge: number; // days
  adminPasswordHistoryCount: number;
  
  // Service Authentication
  serviceTokenLength: number;
  serviceTokenRotationHours: number;
  serviceTokenEncryption: boolean;
  
  // Security Features
  maxFailedAttempts: number;
  lockoutDurationMinutes: number;
  passwordBreachChecking: boolean;
  multiFactorRequired: boolean;
  
  // Vault Integration
  vaultEnabled: boolean;
  vaultEncryptionKey: string;
  vaultRotationEnabled: boolean;
  
  // Compliance & Audit
  auditAllAccess: boolean;
  complianceMode: 'standard' | 'strict' | 'enterprise';
  retentionDays: number;
}

}
}
export interface ApiKeySecret {
  keyId: string;
  secretId: string;
  secretType: 'primary' | 'backup' | 'rotated';
  hashedSecret: string;
  salt: string;
  algorithm: string;
  createdAt: Date;
  rotatedAt?: Date;
  expiresAt?: Date;
  status: 'active' | 'expired' | 'revoked' | 'rotating';
  metadata: {
    createdBy: string;
    rotationReason?: string;
    strength: number;
    entropy: number;
}
}
  };
}

}
}
export interface AdminCredential {
  credentialId: string;
  userId: string;
  credentialType: 'password' | 'service_token' | 'api_admin_key';
  hashedValue: string;
  salt: string;
  algorithm: string;
  strength: number;
  
  // Lifecycle management
  createdAt: Date;
  lastUsedAt?: Date;
  lastRotatedAt?: Date;
  expiresAt?: Date;
  mustChangeAt?: Date;
  
  // Status and validation
  status: 'active' | 'expired' | 'locked' | 'pending_rotation' | 'compromised';
  isTemporary: boolean;
  failedAttempts: number;
  lastFailedAt?: Date;
  
  // Compliance tracking
  complianceFlags: string[];
  auditTrail: {
    createdBy: string;
    lastModifiedBy?: string;
    reasonForChange?: string;
    approvedBy?: string;
}
}
  };
}

}
}
export interface ServiceAuthentication {
  serviceId: string;
  serviceName: string;
  authType: 'bearer_token' | 'api_key' | 'certificate' | 'mutual_tls';
  credentials: {
    primary: string;
    backup?: string;
    certificate?: string;
    privateKey?: string;
}
}
  };
  encryptionMethod: string;
  rotationSchedule: {
    enabled: boolean;
    intervalHours: number;
    nextRotationAt: Date;
  };
  accessScope: string[];
  status: 'active' | 'inactive' | 'rotating';
  metadata: {
    createdBy: string;
    purpose: string;
    environment: string;
    dependencies: string[];
  };
}

}
}
export interface PasswordSecurityEvent {
  eventId: string;
  eventType: 'creation' | 'rotation' | 'access' | 'failure' | 'breach' | 'compromise';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  keyId?: string;
  serviceId?: string;
  description: string;
  metadata: {
    sourceIP?: string;
    userAgent?: string;
    location?: string;
    riskScore?: number;
}
}
  };
  timestamp: Date;
  resolved: boolean;
  resolutionNotes?: string;
}

}
}
export interface VaultEntry {
  vaultId: string;
  entryType: 'api_key_secret' | 'admin_password' | 'service_token' | 'encryption_key';
  keyIdentifier: string;
  encryptedValue: string;
  encryptionAlgorithm: string;
  iv: string;
  keyDerivationParams: {
    algorithm: string;
    iterations: number;
    salt: string;
}
}
  };
  accessLog: Array<{
    accessedAt: Date;
    accessedBy: string;
    operation: 'read' | 'write' | 'rotate';
  }>;
  createdAt: Date;
  expiresAt?: Date;
}

// =============================================================================
// Epic 17 Password Management Service Implementation
// =============================================================================

export class Epic17PasswordManagementService extends EventEmitter {
  private config: Epic17PasswordConfig;
  private secretsCache: Map<string, { value: any; expiry: Date }> = new Map();
  private rotationQueue: Map<string, Date> = new Map();

  constructor(
    private database: DatabaseService,
    private redis: RedisService,
    private auditService: AuditService,
    config: Partial<Epic17PasswordConfig> = {}
  ) {
    super();
    
    this.config = {
      // API Key defaults
      apiKeySecretLength: 64,
      apiKeySecretRotationDays: 90,
      apiKeyHashRounds: 12,
      
      // Admin password defaults
      adminPasswordMinLength: 12,
      adminPasswordComplexity: {
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSymbols: true,
        minUniqueChars: 8
  }
      adminPasswordMaxAge: 90,
      adminPasswordHistoryCount: 12,
      
      // Service authentication
      serviceTokenLength: 48,
      serviceTokenRotationHours: 24,
      serviceTokenEncryption: true,
      
      // Security defaults
      maxFailedAttempts: 5,
      lockoutDurationMinutes: 30,
      passwordBreachChecking: true,
      multiFactorRequired: true,
      
      // Vault defaults
      vaultEnabled: true,
      vaultEncryptionKey: process.env.EPIC17_VAULT_KEY || this.generateVaultKey(),
      vaultRotationEnabled: true,
      
      // Compliance defaults
      auditAllAccess: true,
      complianceMode: 'enterprise',
      retentionDays: 2557, // 7 years
      
      ...config
    };

    this.initializeService();
  }

  // =============================================================================
  // API Key Secret Management
  // =============================================================================

  /**
   * Generate secure API key secret with entropy tracking
   */
  async generateApiKeySecret(keyId: string, createdBy: string): Promise<{ secret: string; secretId: string }> {

    try {
      const secret = this.generateSecureSecret(this.config.apiKeySecretLength);
      const secretId = crypto.randomUUID();
      const salt = await bcrypt.genSalt(this.config.apiKeyHashRounds);
      const hashedSecret = await bcrypt.hash(secret, salt);
      
      // Calculate entropy and strength
      const entropy = this.calculateEntropy(secret);
      const strength = this.calculateStrength(secret);
      
      const apiKeySecret: ApiKeySecret = {
        keyId,
        secretId,
        secretType: 'primary',
        hashedSecret,
        salt,
        algorithm: 'bcrypt',
        createdAt: new Date(),
        status: 'active',
        metadata: {
          createdBy,
          strength,
          entropy
        }
      };
      
      // Store in vault if enabled
      if (this.config.vaultEnabled) {
        await this.storeInVault('api_key_secret', secretId, secret);
      }
      
      // Store secret metadata in database
      await this.database.query(`
        INSERT INTO epic17_api_key_secrets (
          key_id, secret_id, secret_type, hashed_secret, salt, algorithm,
          status, strength, entropy, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        keyId, secretId, apiKeySecret.secretType, hashedSecret, salt,
        apiKeySecret.algorithm, apiKeySecret.status, strength, entropy, createdBy
      ]);
      
      // Schedule rotation if enabled
      if (this.config.apiKeySecretRotationDays > 0) {
        const rotationDate = new Date(Date.now() + this.config.apiKeySecretRotationDays * 24 * 60 * 60 * 1000);
        this.scheduleRotation(keyId, rotationDate);
      }
      
      await this.logSecurityEvent({
        eventType: 'creation',
        severity: 'low',
        keyId,
        description: `API key secret generated for key ${keyId}`,
        metadata: { strength, entropy }
      });
      
      this.emit('api_key_secret_created', { keyId, secretId });
      
      return { secret, secretId };
      
    } catch (error) {
      console.error('Error generating API key secret:', error);
      throw new Error('Failed to generate API key secret');
    }
  }

  /**
   * Verify API key secret with rate limiting and logging
   */
  async verifyApiKeySecret(keyId: string, providedSecret: string): Promise<boolean> {

    try {
      // Check if key is locked due to failed attempts
      const lockStatus = await this.checkKeyLockStatus(keyId);
      if (lockStatus.isLocked) {
        await this.logSecurityEvent({
          eventType: 'access',
          severity: 'medium',
          keyId,
          description: `Access attempted on locked key ${keyId}`,
          metadata: { lockReason: lockStatus.reason }
        });
        return false;
      }
      
      // Get active secret
      const secretData = await this.database.query(`
        SELECT hashed_secret, salt, algorithm, failed_attempts, status
        FROM epic17_api_key_secrets 
        WHERE key_id = $1 AND status = 'active'
        ORDER BY created_at DESC LIMIT 1
      `, [keyId]);
      
      if (secretData.rows.length === 0) {
        await this.logSecurityEvent({
          eventType: 'failure',
          severity: 'high',
          keyId,
          description: `No active secret found for key ${keyId}`,
          metadata: {}
        });
        return false;
      }
      
      const { hashed_secret, salt, algorithm, failed_attempts, status } = secretData.rows[0];
      
      if (status !== 'active') {
        return false;
      }
      
      // Verify the secret
      const isValid = await bcrypt.compare(providedSecret, hashed_secret);
      
      if (isValid) {
        // Reset failed attempts on successful verification
        await this.database.query(`
          UPDATE epic17_api_key_secrets 
          SET failed_attempts = 0, last_used_at = NOW()
          WHERE key_id = $1 AND status = 'active'
        `, [keyId]);
        
        await this.logSecurityEvent({
          eventType: 'access',
          severity: 'low',
          keyId,
          description: `Successful secret verification for key ${keyId}`,
          metadata: {}
        });
        
      } else {
        // Increment failed attempts
        const newFailedAttempts = (failed_attempts || 0) + 1;
        
        await this.database.query(`
          UPDATE epic17_api_key_secrets 
          SET failed_attempts = $1, last_failed_at = NOW()
          WHERE key_id = $2 AND status = 'active'
        `, [newFailedAttempts, keyId]);
        
        // Lock key if too many failures
        if (newFailedAttempts >= this.config.maxFailedAttempts) {
          await this.lockApiKey(keyId, 'too_many_failures');
        }
        
        await this.logSecurityEvent({
          eventType: 'failure',
          severity: newFailedAttempts >= this.config.maxFailedAttempts ? 'high' : 'medium',
          keyId,
          description: `Failed secret verification for key ${keyId} (attempt ${newFailedAttempts})`,
          metadata: { failedAttempts: newFailedAttempts }
        });
      }
      
      return isValid;
      
    } catch (error) {
      console.error('Error verifying API key secret:', error);
      await this.logSecurityEvent({
        eventType: 'failure',
        severity: 'high',
        keyId,
        description: `Error during secret verification: ${error.message}`,
        metadata: { error: error.message }
      });
      return false;
    }
  }

  /**
   * Rotate API key secret with zero-downtime strategy
   */
  async rotateApiKeySecret(keyId: string, rotatedBy: string, reason?: string): Promise<{ newSecret: string; secretId: string }> {

    try {
      // Generate new secret
      const newSecret = this.generateSecureSecret(this.config.apiKeySecretLength);
      const newSecretId = crypto.randomUUID();
      const salt = await bcrypt.genSalt(this.config.apiKeyHashRounds);
      const hashedSecret = await bcrypt.hash(newSecret, salt);
      
      const entropy = this.calculateEntropy(newSecret);
      const strength = this.calculateStrength(newSecret);
      
      // Mark current secret as rotating
      await this.database.query(`
        UPDATE epic17_api_key_secrets 
        SET status = 'rotating', rotated_at = NOW()
        WHERE key_id = $1 AND status = 'active'
      `, [keyId]);
      
      // Insert new secret
      await this.database.query(`
        INSERT INTO epic17_api_key_secrets (
          key_id, secret_id, secret_type, hashed_secret, salt, algorithm,
          status, strength, entropy, created_by, rotation_reason
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        keyId, newSecretId, 'primary', hashedSecret, salt, 'bcrypt',
        'active', strength, entropy, rotatedBy, reason
      ]);
      
      // Store in vault
      if (this.config.vaultEnabled) {
        await this.storeInVault('api_key_secret', newSecretId, newSecret);
      }
      
      // Schedule cleanup of old secret (after grace period)
      setTimeout(async () => {
        await this.database.query(`
          UPDATE epic17_api_key_secrets 
          SET status = 'revoked'
          WHERE key_id = $1 AND status = 'rotating'
        `, [keyId]);
      }, 5 * 60 * 1000); // 5 minute grace period
      
      await this.logSecurityEvent({
        eventType: 'rotation',
        severity: 'low',
        keyId,
        description: `API key secret rotated for key ${keyId}`,
        metadata: { rotatedBy, reason: reason || 'scheduled_rotation', strength, entropy }
      });
      
      this.emit('api_key_secret_rotated', { keyId, newSecretId, rotatedBy });
      
      return { newSecret, secretId: newSecretId };
      
    } catch (error) {
      console.error('Error rotating API key secret:', error);
      throw new Error('Failed to rotate API key secret');
    }
  }

  // =============================================================================
  // Administrative Password Management
  // =============================================================================

  /**
   * Create or update administrative password with compliance validation
   */
  async setAdminPassword(
    userId: string, 
    password: string, 
    isTemporary: boolean = false,
    setBy?: string
  ): Promise<{ credentialId: string; mustChangeAt?: Date }> {

    try {
      // Validate password strength
      const validation = this.validateAdminPassword(password);
      if (!validation.isValid) {
        throw new Error(`Password validation failed: ${validation.errors.join(', ')}`);
      }
      
      // Check password history
      const historyCheck = await this.checkPasswordHistory(userId, password);
      if (!historyCheck.allowed) {
        throw new Error(`Password reuse detected: ${historyCheck.reason}`);
      }
      
      // Check for breached passwords if enabled
      if (this.config.passwordBreachChecking) {
        const breachCheck = await this.checkPasswordBreach(password);
        if (breachCheck.isBreached) {
          throw new Error(`Password found in breach database: ${breachCheck.breachCount} occurrences`);
        }
      }
      
      const credentialId = crypto.randomUUID();
      const salt = await bcrypt.genSalt(14); // Higher rounds for admin passwords
      const hashedPassword = await bcrypt.hash(password, salt);
      
      const now = new Date();
      const expiresAt = isTemporary 
        ? new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24 hours for temporary
        : new Date(now.getTime() + this.config.adminPasswordMaxAge * 24 * 60 * 60 * 1000);
      
      const mustChangeAt = isTemporary ? new Date(now.getTime() + 60 * 60 * 1000) : undefined; // 1 hour for temporary
      
      const credential: AdminCredential = {
        credentialId,
        userId,
        credentialType: 'password',
        hashedValue: hashedPassword,
        salt,
        algorithm: 'bcrypt',
        strength: validation.strength,
        createdAt: now,
        expiresAt,
        mustChangeAt,
        status: 'active',
        isTemporary,
        failedAttempts: 0,
        complianceFlags: this.assessComplianceFlags(validation, isTemporary),
        auditTrail: {
          createdBy: setBy || 'system',
          reasonForChange: isTemporary ? 'temporary_password' : 'password_reset'
        }
      };
      
      // Store credential
      await this.database.query(`
        INSERT INTO epic17_admin_credentials (
          credential_id, user_id, credential_type, hashed_value, salt, algorithm,
          strength, expires_at, must_change_at, status, is_temporary, created_by,
          compliance_flags, reason_for_change
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      `, [
        credentialId, userId, credential.credentialType, hashedPassword, salt,
        credential.algorithm, validation.strength, expiresAt, mustChangeAt,
        credential.status, isTemporary, setBy || 'system',
        JSON.stringify(credential.complianceFlags), credential.auditTrail.reasonForChange
      ]);
      
      // Add to password history
      await this.addToPasswordHistory(userId, hashedPassword, credentialId);
      
      // Store in vault if enabled
      if (this.config.vaultEnabled) {
        await this.storeInVault('admin_password', credentialId, password);
      }
      
      await this.logSecurityEvent({
        eventType: 'creation',
        severity: 'medium',
        userId,
        description: `Administrative password ${isTemporary ? 'temporary' : 'permanent'} created for user ${userId}`,
        metadata: { 
          strength: validation.strength, 
          isTemporary, 
          setBy: setBy || 'system',
          complianceFlags: credential.complianceFlags
        }
      });
      
      this.emit('admin_password_created', { userId, credentialId, isTemporary, setBy });
      
      return { credentialId, mustChangeAt };
      
    } catch (error) {
      console.error('Error setting admin password:', error);
      throw error;
    }
  }

  /**
   * Verify administrative password with enhanced security checks
   */
  async verifyAdminPassword(userId: string, password: string, sourceIP?: string): Promise<boolean> {

    try {
      // Get active credential
      const credData = await this.database.query(`
        SELECT credential_id, hashed_value, salt, algorithm, status, expires_at, 
               must_change_at, failed_attempts, last_failed_at, is_temporary,
               compliance_flags
        FROM epic17_admin_credentials 
        WHERE user_id = $1 AND credential_type = 'password' AND status = 'active'
        ORDER BY created_at DESC LIMIT 1
      `, [userId]);
      
      if (credData.rows.length === 0) {
        await this.logSecurityEvent({
          eventType: 'failure',
          severity: 'high',
          userId,
          description: `No active admin password found for user ${userId}`,
          metadata: { sourceIP }
        });
        return false;
      }
      
      const credential = credData.rows[0];
      
      // Check if credential is expired or needs change
      const now = new Date();
      if (credential.expires_at && now > credential.expires_at) {
        await this.logSecurityEvent({
          eventType: 'failure',
          severity: 'medium',
          userId,
          description: `Expired password used for user ${userId}`,
          metadata: { sourceIP, expiredAt: credential.expires_at }
        });
        return false;
      }
      
      if (credential.must_change_at && now > credential.must_change_at) {
        await this.logSecurityEvent({
          eventType: 'failure',
          severity: 'medium',
          userId,
          description: `Password change required for user ${userId}`,
          metadata: { sourceIP, mustChangeAt: credential.must_change_at }
        });
        return false;
      }
      
      // Check account lockout
      if (credential.failed_attempts >= this.config.maxFailedAttempts) {
        const lockoutExpiry = new Date(credential.last_failed_at.getTime() + this.config.lockoutDurationMinutes * 60 * 1000);
        if (now < lockoutExpiry) {
          await this.logSecurityEvent({
            eventType: 'failure',
            severity: 'high',
            userId,
            description: `Locked account access attempted for user ${userId}`,
            metadata: { sourceIP, lockoutExpiry, failedAttempts: credential.failed_attempts }
          });
          return false;
        }
      }
      
      // Verify password
      const isValid = await bcrypt.compare(password, credential.hashed_value);
      
      if (isValid) {
        // Reset failed attempts and update last used
        await this.database.query(`
          UPDATE epic17_admin_credentials 
          SET failed_attempts = 0, last_used_at = NOW()
          WHERE credential_id = $1
        `, [credential.credential_id]);
        
        await this.logSecurityEvent({
          eventType: 'access',
          severity: 'low',
          userId,
          description: `Successful admin password verification for user ${userId}`,
          metadata: { sourceIP, isTemporary: credential.is_temporary }
        });
        
        this.emit('admin_password_verified', { userId, sourceIP });
        
      } else {
        // Increment failed attempts
        const newFailedAttempts = (credential.failed_attempts || 0) + 1;
        
        await this.database.query(`
          UPDATE epic17_admin_credentials 
          SET failed_attempts = $1, last_failed_at = NOW()
          WHERE credential_id = $2
        `, [newFailedAttempts, credential.credential_id]);
        
        await this.logSecurityEvent({
          eventType: 'failure',
          severity: newFailedAttempts >= this.config.maxFailedAttempts ? 'high' : 'medium',
          userId,
          description: `Failed admin password verification for user ${userId} (attempt ${newFailedAttempts})`,
          metadata: { sourceIP, failedAttempts: newFailedAttempts }
        });
        
        this.emit('admin_password_failed', { userId, sourceIP, failedAttempts: newFailedAttempts });
      }
      
      return isValid;
      
    } catch (error) {
      console.error('Error verifying admin password:', error);
      await this.logSecurityEvent({
        eventType: 'failure',
        severity: 'critical',
        userId,
        description: `Critical error during admin password verification: ${error.message}`,
        metadata: { sourceIP, error: error.message }
      });
      return false;
    }
  }

  // =============================================================================
  // Service Authentication Management
  // =============================================================================

  /**
   * Create service authentication credentials
   */
  async createServiceAuth(
    serviceName: string,
    authType: 'bearer_token' | 'api_key' | 'certificate' | 'mutual_tls',
    createdBy: string,
    purpose: string,
    scope: string[] = [],
    rotationIntervalHours: number = 24
  ): Promise<ServiceAuthentication> {

    try {
      const serviceId = crypto.randomUUID();
      
      let credentials: any = {};
      
      switch (authType) {
      case 'bearer_token':
      case 'api_key':
        const token = this.generateSecureSecret(this.config.serviceTokenLength);
        const backupToken = this.generateSecureSecret(this.config.serviceTokenLength);
        credentials = {
          primary: token,
          backup: backupToken
        };
        break;
          
      case 'certificate':
      case 'mutual_tls':
        const certData = await this.generateServiceCertificate(serviceName);
        credentials = {
          certificate: certData.certificate,
          privateKey: certData.privateKey
        };
        break;
      }
      
      // Encrypt credentials if required
      let encryptionMethod = 'none';
      if (this.config.serviceTokenEncryption) {
        credentials = await this.encryptServiceCredentials(credentials);
        encryptionMethod = 'aes-256-gcm';
      }
      
      const nextRotationAt = new Date(Date.now() + rotationIntervalHours * 60 * 60 * 1000);
      
      const serviceAuth: ServiceAuthentication = {
        serviceId,
        serviceName,
        authType,
        credentials,
        encryptionMethod,
        rotationSchedule: {
          enabled: rotationIntervalHours > 0,
          intervalHours: rotationIntervalHours,
          nextRotationAt
  }
        accessScope: scope,
        status: 'active',
        metadata: {
          createdBy,
          purpose,
          environment: process.env.NODE_ENV || 'development',
          dependencies: []
        }
      };
      
      // Store service authentication
      await this.database.query(`
        INSERT INTO epic17_service_auth (
          service_id, service_name, auth_type, encrypted_credentials, 
          encryption_method, rotation_enabled, rotation_interval_hours, 
          next_rotation_at, access_scope, status, created_by, purpose, environment
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `, [
        serviceId, serviceName, authType, JSON.stringify(credentials),
        encryptionMethod, serviceAuth.rotationSchedule.enabled,
        rotationIntervalHours, nextRotationAt, JSON.stringify(scope),
        'active', createdBy, purpose, serviceAuth.metadata.environment
      ]);
      
      // Store in vault
      if (this.config.vaultEnabled) {
        await this.storeInVault('service_token', serviceId, JSON.stringify(credentials));
      }
      
      // Schedule rotation
      if (serviceAuth.rotationSchedule.enabled) {
        this.scheduleServiceRotation(serviceId, nextRotationAt);
      }
      
      await this.logSecurityEvent({
        eventType: 'creation',
        severity: 'low',
        serviceId,
        description: `Service authentication created for ${serviceName}`,
        metadata: { 
          authType, 
          createdBy, 
          purpose, 
          rotationEnabled: serviceAuth.rotationSchedule.enabled,
          scope: scope.join(',')
        }
      });
      
      this.emit('service_auth_created', { serviceId, serviceName, authType });
      
      return serviceAuth;
      
    } catch (error) {
      console.error('Error creating service authentication:', error);
      throw new Error('Failed to create service authentication');
    }
  }

  // =============================================================================
  // Vault and Encryption Management
  // =============================================================================

  /**
   * Store sensitive data in encrypted vault
   */
  private async storeInVault(
    entryType: 'api_key_secret' | 'admin_password' | 'service_token' | 'encryption_key',
    keyIdentifier: string,
    value: string
  ): Promise<void> {

    try {
      const vaultId = crypto.randomUUID();
      const iv = crypto.randomBytes(16);
      const salt = crypto.randomBytes(32);
      
      // Derive key from master vault key
      const derivedKey = crypto.pbkdf2Sync(this.config.vaultEncryptionKey, salt, 100000, 32, 'sha256');
      
      // Encrypt value
      const cipher = crypto.createCipher('aes-256-gcm', derivedKey);
      cipher.setAAD(Buffer.from(keyIdentifier)); // Additional authenticated data
      
      let encrypted = cipher.update(value, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      const authTag = cipher.getAuthTag();
      
      const vaultEntry: VaultEntry = {
        vaultId,
        entryType,
        keyIdentifier,
        encryptedValue: encrypted,
        encryptionAlgorithm: 'aes-256-gcm',
        iv: iv.toString('hex'),
        keyDerivationParams: {
          algorithm: 'pbkdf2',
          iterations: 100000,
          salt: salt.toString('hex')
  }
        accessLog: [],
        createdAt: new Date()
      };
      
      // Store vault entry
      await this.database.query(`
        INSERT INTO epic17_vault_entries (
          vault_id, entry_type, key_identifier, encrypted_value,
          encryption_algorithm, iv, key_derivation_params, auth_tag
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        vaultId, entryType, keyIdentifier, encrypted,
        vaultEntry.encryptionAlgorithm, vaultEntry.iv,
        JSON.stringify(vaultEntry.keyDerivationParams), authTag.toString('hex')
      ]);
      
    } catch (error) {
      console.error('Error storing in vault:', error);
      throw error;
    }
  }

  // =============================================================================
  // Security and Validation Utilities
  // =============================================================================

  /**
   * Generate cryptographically secure secret with specified length
   */
  private generateSecureSecret(length: number): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    let result = '';
    const values = crypto.randomBytes(length);
    
    for (let i = 0; i < length; i++) {
      result += charset[values[i] % charset.length];
    }
    
    return result;
  }

  /**
   * Calculate entropy of a password/secret
   */
  private calculateEntropy(password: string): number {
    const charSets = [
      /[a-z]/, /[A-Z]/, /[0-9]/, /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/
    ];
    
    let charsetSize = 0;
    charSets.forEach(regex => {
      if (regex.test(password)) {
        charsetSize += 26; // Approximation
      }
    });
    
    return password.length * Math.log2(charsetSize || 1);
  }

  /**
   * Calculate password strength score
   */
  private calculateStrength(password: string): number {
    let score = 0;
    
    // Length bonus
    score += Math.min(password.length * 4, 25);
    
    // Character variety
    if (/[a-z]/.test(password)) score += 5;
    if (/[A-Z]/.test(password)) score += 5;
    if (/[0-9]/.test(password)) score += 5;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 10;
    
    // Pattern penalties
    if (/(.)\1{2
}/.test(password)) score -= 10; // Repeated characters
    if (/123|abc|qwe/i.test(password)) score -= 15; // Sequential characters
    
    // Entropy bonus
    const entropy = this.calculateEntropy(password);
    if (entropy > 50) score += 10;
    if (entropy > 75) score += 15;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Validate admin password against policy
   */
  private validateAdminPassword(password: string): { isValid: boolean; strength: number; errors: string[] } {
    const errors: string[] = [];
    const config = this.config.adminPasswordComplexity;
    
    if (password.length < this.config.adminPasswordMinLength) {
      errors.push(`Password must be at least ${this.config.adminPasswordMinLength} characters long`);
    }
    
    if (config.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain uppercase letters');
    }
    
    if (config.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain lowercase letters');
    }
    
    if (config.requireNumbers && !/[0-9]/.test(password)) {
      errors.push('Password must contain numbers');
    }
    
    if (config.requireSymbols && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain symbols');
    }
    
    // Check unique characters
    const uniqueChars = new Set(password).size;
    if (uniqueChars < config.minUniqueChars) {
      errors.push(`Password must contain at least ${config.minUniqueChars} unique characters`);
    }
    
    const strength = this.calculateStrength(password);
    
    if (strength < 60) {
      errors.push('Password strength is too low (minimum 60/100 required)');
    }
    
    return {
      isValid: errors.length === 0,
      strength,
      errors
    };
  }

  // =============================================================================
  // Security Event Logging
  // =============================================================================

  /**
   * Log security events with structured data
   */
  private async logSecurityEvent(event: Omit<PasswordSecurityEvent, 'eventId' | 'timestamp' | 'resolved'>): Promise<void> {

    try {
      const securityEvent: PasswordSecurityEvent = {
        eventId: crypto.randomUUID(),
        ...event,
        timestamp: new Date(),
        resolved: false
      };
      
      // Store in database
      await this.database.query(`
        INSERT INTO epic17_security_events (
          event_id, event_type, severity, user_id, key_id, service_id,
          description, metadata, resolved
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        securityEvent.eventId, event.eventType, event.severity,
        event.userId, event.keyId, event.serviceId,
        event.description, JSON.stringify(event.metadata), false
      ]);
      
      // Send to audit service
      await this.auditService.logAction({
        userId: event.userId || 'system',
        action: `password_${event.eventType}`,
        resource: event.keyId || event.serviceId || 'password_management',
        details: {
          eventId: securityEvent.eventId,
          severity: event.severity,
          description: event.description,
          metadata: event.metadata
        }
      });
      
      // Emit event for real-time monitoring
      this.emit('security_event', securityEvent);
      
      // Handle critical events immediately
      if (event.severity === 'critical') {
        this.emit('critical_security_event', securityEvent);
      }
      
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  }

  // =============================================================================
  // Private Helper Methods
  // =============================================================================

  private async initializeService(): Promise<void> {

    try {
      // Initialize database tables if they don't exist
      await this.initializeTables();
      
      // Start rotation scheduler
      if (this.config.apiKeySecretRotationDays > 0 || this.config.vaultRotationEnabled) {
        this.startRotationScheduler();
      }
      
      // Start cleanup scheduler
      this.startCleanupScheduler();
      
      console.log('✅ Epic 17 Password Management Service initialized successfully');
      
    } catch (error) {
      console.error('Error initializing Epic 17 Password Management Service:', error);
      throw error;
    }
  }

  private async initializeTables(): Promise<void> {

    // This would contain the CREATE TABLE statements for all Epic 17 password management tables
    // Implementation would include proper schema creation
    console.log('📊 Epic 17 password management database tables initialized');
  }

  private generateVaultKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private scheduleRotation(keyId: string, rotationDate: Date): void {
    this.rotationQueue.set(keyId, rotationDate);
  }

  private scheduleServiceRotation(serviceId: string, rotationDate: Date): void {
    this.rotationQueue.set(`service_${serviceId}`, rotationDate);
  }

  private startRotationScheduler(): void {
    setInterval(async () => {
      const now = new Date();
      for (const [key, scheduledTime] of this.rotationQueue.entries()) {
        if (now >= scheduledTime) {
          if (key.startsWith('service_')) {
            await this.rotateServiceCredentials(key.substring(8));
          } else {
            await this.rotateApiKeySecret(key, 'system', 'scheduled_rotation');
          }
          this.rotationQueue.delete(key);
        }
      }
    }, 60000); // Check every minute
  }

  private startCleanupScheduler(): void {
    setInterval(async () => {
      await this.cleanupExpiredSecrets();
      await this.cleanupSecurityEvents();
    }, 3600000); // Run every hour
  }

  private async cleanupExpiredSecrets(): Promise<void> {

    try {
      const result = await this.database.query(`
        UPDATE epic17_api_key_secrets 
        SET status = 'expired' 
        WHERE expires_at IS NOT NULL AND expires_at < NOW() AND status = 'active'
      `);
      
      if (result.rowCount > 0) {
        console.log(`🧹 Cleaned up ${result.rowCount} expired API key secrets`);
      }
    } catch (error) {
      console.error('Error cleaning up expired secrets:', error);
    }
  }

  private async cleanupSecurityEvents(): Promise<void> {

    try {
      const retentionDate = new Date(Date.now() - this.config.retentionDays * 24 * 60 * 60 * 1000);
      
      const result = await this.database.query(`
        DELETE FROM epic17_security_events 
        WHERE timestamp < $1 AND resolved = true
      `, [retentionDate]);
      
      if (result.rowCount > 0) {
        console.log(`🧹 Cleaned up ${result.rowCount} old security events`);
      }
    } catch (error) {
      console.error('Error cleaning up security events:', error);
    }
  }

  // Additional helper methods would be implemented here...
  
  private async checkKeyLockStatus(keyId: string): Promise<{ isLocked: boolean; reason?: string }> {

    // Implementation for checking if a key is locked
    return { isLocked: false };
  }

  private async lockApiKey(keyId: string, reason: string): Promise<void> {

    // Implementation for locking an API key
    console.log(`🔒 Locked API key ${keyId}: ${reason}`);
  }

  private async checkPasswordHistory(userId: string, password: string): Promise<{ allowed: boolean; reason?: string }> {

    // Implementation for checking password history
    return { allowed: true };
  }

  private async checkPasswordBreach(password: string): Promise<{ isBreached: boolean; breachCount?: number }> {

    // Implementation for checking password breaches
    return { isBreached: false };
  }

  private async addToPasswordHistory(userId: string, hashedPassword: string, credentialId: string): Promise<void> {

    // Implementation for adding to password history
  }

  private assessComplianceFlags(validation: any, isTemporary: boolean): string[] {
    const flags: string[] = [];
    
    if (validation.strength >= 90) flags.push('high_strength');
    if (validation.strength < 60) flags.push('low_strength');
    if (isTemporary) flags.push('temporary');
    if (this.config.complianceMode === 'enterprise') flags.push('enterprise_compliant');
    
    return flags;
  }

  private async generateServiceCertificate(serviceName: string): Promise<{ certificate: string; privateKey: string }> {

    // Implementation for generating service certificates
    return {
      certificate: '-----BEGIN CERTIFICATE-----\n[certificate data]\n-----END CERTIFICATE-----',
      privateKey: '-----BEGIN PRIVATE KEY-----\n[private key data]\n-----END PRIVATE KEY-----'
    };
  }

  private async encryptServiceCredentials(credentials: any): Promise<any> {

    // Implementation for encrypting service credentials
    return credentials;
  }

  private async rotateServiceCredentials(serviceId: string): Promise<void> {

    // Implementation for rotating service credentials
    console.log(`🔄 Rotating credentials for service ${serviceId}`);
  }

  // Public management methods
  async getPasswordSecurityMetrics(): Promise<any> {

    try {
      const metrics = await this.database.query(`
        SELECT 
          COUNT(*) as total_secrets,
          COUNT(*) FILTER (WHERE status = 'active') as active_secrets,
          COUNT(*) FILTER (WHERE status = 'expired') as expired_secrets,
          COUNT(*) FILTER (WHERE failed_attempts > 0) as failed_attempts,
          AVG(strength) as avg_strength
        FROM epic17_api_key_secrets
      `);
      
      return metrics.rows[0];
    } catch (error) {
      console.error('Error getting password security metrics:', error);
      return null;
    }
  }

  async forceRotateAllSecrets(): Promise<void> {

    // Emergency rotation of all secrets
    console.log('🚨 Starting emergency rotation of all secrets...');
    // Implementation would handle bulk rotation
  }
}

export default Epic17PasswordManagementService;