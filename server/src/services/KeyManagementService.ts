// Key Management Service
// Comprehensive cryptographic key lifecycle management system
// Provides key generation, rotation, encryption, access control, and audit

import { DatabaseService } from '../auth/database/DatabaseService';
import { RedisService } from '../auth/database/RedisService';
import { AuditService } from '../auth/services/AuditService';
import { AccessControlManager, AccessContext, KeyOperation, AccessDecision } from './AccessControlManager';
import { EventEmitter } from 'events';
import * as crypto from 'crypto';

export interface KeyManagementConfig {
  // Key encryption
  keyEncryptionAlgorithm: 'aes-256-gcm' | 'chacha20-poly1305';
  masterKeyPath?: string; // Path to hardware security module or file
  
  // Rotation settings
  defaultRotationIntervalDays: number;
  rotationOverlapHours: number;
  autoRotationEnabled: boolean;
  
  // Access control
  enableAccessControl: boolean;
  requireApprovalForSensitiveOps: boolean;
  defaultSecurityLevel: 'standard' | 'high' | 'maximum' | 'ultra';
  
  // Performance
  cacheEnabled: boolean;
  cacheTtlSeconds: number;
  maxCachedKeys: number;
  
  // Backup and recovery
  backupEnabled: boolean;
  backupRetentionDays: number;
  backupEncryptionEnabled: boolean;
  
  // Compliance
  enableComplianceTracking: boolean;
  auditAllOperations: boolean;
  dataClassificationRequired: boolean;
}

export interface MasterKey {
  keyId: string;
  purpose: KeyPurpose;
  algorithm: string;
  keyLength: number;
  keyVersion: number;
  isActive: boolean;
  isPrimary: boolean;
  
  // Lifecycle
  createdAt: Date;
  activatedAt?: Date;
  expiresAt?: Date;
  rotatedAt?: Date;
  
  // Usage
  usageCount: number;
  maxUsageCount?: number;
  lastUsedAt?: Date;
  
  // Security
  securityLevel: string;
  accessControlList?: AccessControlEntry[];
  complianceTags?: { [key: string]: any };
}

export interface AccessControlEntry {
  userId?: string;
  serviceId?: string;
  role?: string;
  operations: string[];
  conditions?: { [key: string]: any };
  expiresAt?: Date;
}

export interface KeyRotationPolicy {
  policyName: string;
  keyPurpose: KeyPurpose;
  securityLevel?: string;
  
  // Rotation triggers
  rotationIntervalDays?: number;
  maxUsageCount?: number;
  rotationThresholdDate?: Date;
  
  // Behavior
  autoRotationEnabled: boolean;
  notificationDaysBefore: number;
  overlapPeriodHours: number;
  
  // Approval
  requiresApproval: boolean;
  approvalRoles?: string[];
}

export type KeyPurpose = 
  | 'data_encryption'
  | 'key_encryption'
  | 'token_signing'
  | 'api_signing'
  | 'session_encryption'
  | 'backup_encryption'
  | 'audit_signing';

export interface KeyGenerationRequest {
  purpose: KeyPurpose;
  algorithm?: string;
  keyLength?: number;
  securityLevel?: 'standard' | 'high' | 'maximum' | 'ultra';
  expiresAt?: Date;
  maxUsageCount?: number;
  accessControlList?: AccessControlEntry[];
  complianceTags?: { [key: string]: any };
  makePrimary?: boolean;
}

export interface KeyOperationContext {
  userId?: string;
  serviceId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  operationType: 'encrypt' | 'decrypt' | 'sign' | 'verify' | 'derive' | 'export' | 'import' | 'rotate' | 'destroy';
  dataClassification?: string;
  additionalContext?: { [key: string]: any };
}

export interface KeyBackup {
  backupId: string;
  keyId: string;
  backupType: 'full' | 'metadata_only' | 'differential';
  createdAt: Date;
  expiresAt?: Date;
  storageLocation?: string;
  verified: boolean;
}

export class KeyManagementService extends EventEmitter {
  private db: DatabaseService;
  private redis: RedisService;
  private auditService: AuditService;
  private accessControlManager: AccessControlManager;
  private config: KeyManagementConfig;
  private keyEncryptionKey: Buffer;

  constructor(
    db: DatabaseService,
    redis: RedisService,
    auditService: AuditService,
    accessControlManager: AccessControlManager,
    config: KeyManagementConfig
  ) {
    super();
    this.db = db;
    this.redis = redis;
    this.auditService = auditService;
    this.accessControlManager = accessControlManager;
    this.config = config;
    
    // Initialize key encryption key (KEK)
    this.initializeKeyEncryptionKey();
    
    // Start background processes
    this.startBackgroundProcesses();
  }

  async generateMasterKey(request: KeyGenerationRequest): Promise<MasterKey> {
    try {
      // Validate request
      this.validateKeyGenerationRequest(request);
      
      // Generate key ID
      const keyId = this.generateKeyId(request.purpose);
      
      // Determine algorithm and key length
      const algorithm = request.algorithm || this.getDefaultAlgorithm(request.purpose);
      const keyLength = request.keyLength || this.getDefaultKeyLength(algorithm);
      
      // Generate key material
      const keyMaterial = crypto.randomBytes(keyLength / 8);
      
      // Encrypt key material
      const encryptedKey = this.encryptKeyMaterial(keyMaterial, keyId);
      
      // Handle primary key logic
      if (request.makePrimary) {
        await this.deactivateOtherPrimaryKeys(request.purpose);
      }
      
      // Insert into database
      await this.db.query(`
        INSERT INTO master_keys (
          key_id, purpose, algorithm, encrypted_key_material,
          key_encryption_algorithm, initialization_vector, authentication_tag,
          key_length, is_active, is_primary, expires_at, max_usage_count,
          security_level, access_control_list, compliance_tags, created_by,
          approval_required
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      `, [
        keyId,
        request.purpose,
        algorithm,
        encryptedKey.encryptedData,
        this.config.keyEncryptionAlgorithm,
        encryptedKey.iv,
        encryptedKey.authTag,
        keyLength,
        true, // is_active
        request.makePrimary || false,
        request.expiresAt,
        request.maxUsageCount,
        request.securityLevel || this.config.defaultSecurityLevel,
        request.accessControlList ? JSON.stringify(request.accessControlList) : null,
        request.complianceTags ? JSON.stringify(request.complianceTags) : null,
        'KeyManagementService',
        this.config.requireApprovalForSensitiveOps && request.securityLevel === 'ultra'
      ]);
      
      // Create backup if enabled
      if (this.config.backupEnabled) {
        await this.createKeyBackup(keyId, 'full');
      }
      
      // Log key generation
      await this.logKeyOperation(keyId, 'generate', {
        purpose: request.purpose,
        algorithm,
        keyLength,
        securityLevel: request.securityLevel
      });
      
      const masterKey: MasterKey = {
        keyId,
        purpose: request.purpose,
        algorithm,
        keyLength,
        keyVersion: 1,
        isActive: true,
        isPrimary: request.makePrimary || false,
        createdAt: new Date(),
        usageCount: 0,
        maxUsageCount: request.maxUsageCount,
        securityLevel: request.securityLevel || this.config.defaultSecurityLevel,
        accessControlList: request.accessControlList,
        complianceTags: request.complianceTags
      };
      
      // Emit event
      this.emit('key_generated', masterKey);
      
      return masterKey;
    } catch (error) {
      console.error('Error generating master key:', error);
      throw new Error('Failed to generate master key');
    }
  }

  async getMasterKey(keyId: string, context?: KeyOperationContext): Promise<MasterKey | null> {
    try {
      // Check cache first
      if (this.config.cacheEnabled) {
        const cached = await this.redis.get(`master_key:${keyId}`);
        if (cached) {
          const key = JSON.parse(cached);
          if (context) {
            await this.logKeyAccess(keyId, 'view_metadata', context, 'success');
          }
          return key;
        }
      }
      
      // Get from database
      const result = await this.db.query(`
        SELECT 
          key_id, purpose, algorithm, key_length, key_version,
          is_active, is_primary, created_at, activated_at, expires_at,
          rotated_at, usage_count, max_usage_count, last_used_at,
          security_level, access_control_list, compliance_tags
        FROM master_keys
        WHERE key_id = $1
      `, [keyId]);
      
      if (result.rows.length === 0) {
        if (context) {
          await this.logKeyAccess(keyId, 'view_metadata', context, 'failure');
        }
        return null;
      }
      
      const row = result.rows[0];
      const masterKey: MasterKey = {
        keyId: row.key_id,
        purpose: row.purpose,
        algorithm: row.algorithm,
        keyLength: row.key_length,
        keyVersion: row.key_version,
        isActive: row.is_active,
        isPrimary: row.is_primary,
        createdAt: row.created_at,
        activatedAt: row.activated_at,
        expiresAt: row.expires_at,
        rotatedAt: row.rotated_at,
        usageCount: parseInt(row.usage_count),
        maxUsageCount: row.max_usage_count ? parseInt(row.max_usage_count) : undefined,
        lastUsedAt: row.last_used_at,
        securityLevel: row.security_level,
        accessControlList: row.access_control_list ? JSON.parse(row.access_control_list) : undefined,
        complianceTags: row.compliance_tags ? JSON.parse(row.compliance_tags) : undefined
      };
      
      // Cache for future use
      if (this.config.cacheEnabled) {
        await this.redis.setex(`master_key:${keyId}`, this.config.cacheTtlSeconds, JSON.stringify(masterKey));
      }
      
      if (context) {
        await this.logKeyAccess(keyId, 'view_metadata', context, 'success');
      }
      
      return masterKey;
    } catch (error) {
      console.error('Error getting master key:', error);
      if (context) {
        await this.logKeyAccess(keyId, 'view_metadata', context, 'failure');
      }
      return null;
    }
  }

  async getKeyMaterial(keyId: string, context: KeyOperationContext): Promise<Buffer | null> {
    try {
      // Enhanced access control evaluation
      const accessContext: AccessContext = {
        userId: context.userId || 'anonymous',
        sessionId: context.sessionId,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        timestamp: new Date(),
        additionalContext: context.additionalContext
      };
      
      const accessDecision = await this.accessControlManager.evaluateAccess(
        keyId,
        context.operationType as KeyOperation,
        accessContext
      );
      
      if (!accessDecision.allowed) {
        await this.logKeyAccess(keyId, context.operationType, context, 'unauthorized');
        throw new Error(`Access denied: ${accessDecision.reason}`);
      }
      
      // Check for conditional access requirements
      if (accessDecision.conditionalAccess && accessDecision.conditionalAccess.length > 0) {
        for (const requirement of accessDecision.conditionalAccess) {
          if (requirement.type === 'mfa' && !accessContext.mfaVerified) {
            throw new Error('Multi-factor authentication required for this operation');
          }
        }
      }
      
      // Check for required approvals
      if (accessDecision.requiredApprovals && accessDecision.requiredApprovals.length > 0) {
        // Check if user has pending or approved access request
        const hasApproval = await this.checkAccessApproval(
          keyId,
          context.userId || 'anonymous',
          context.operationType
        );
        
        if (!hasApproval) {
          throw new Error(`Approval required: ${accessDecision.requiredApprovals.join(', ')}`);
        }
      }
      
      // Get encrypted key material
      const result = await this.db.query(`
        SELECT 
          encrypted_key_material, initialization_vector, 
          authentication_tag, is_active, expires_at
        FROM master_keys
        WHERE key_id = $1
      `, [keyId]);
      
      if (result.rows.length === 0) {
        await this.logKeyAccess(keyId, context.operationType, context, 'failure');
        return null;
      }
      
      const row = result.rows[0];
      
      // Check if key is active
      if (!row.is_active) {
        await this.logKeyAccess(keyId, context.operationType, context, 'expired');
        throw new Error('Key is not active');
      }
      
      // Check if key is expired
      if (row.expires_at && new Date(row.expires_at) < new Date()) {
        await this.logKeyAccess(keyId, context.operationType, context, 'expired');
        throw new Error('Key has expired');
      }
      
      // Decrypt key material
      const keyMaterial = this.decryptKeyMaterial({
        encryptedData: row.encrypted_key_material,
        iv: row.initialization_vector,
        authTag: row.authentication_tag
      }, keyId);
      
      // Log successful access with risk level
      await this.logKeyAccess(keyId, context.operationType, context, 'success', {
        riskLevel: accessDecision.riskLevel,
        monitoringRequired: accessDecision.monitoringRequired
      });
      
      return keyMaterial;
    } catch (error) {
      console.error('Error getting key material:', error);
      await this.logKeyAccess(keyId, context.operationType, context, 'failure');
      throw error;
    }
  }

  async rotateKey(keyId: string, context: KeyOperationContext): Promise<MasterKey> {
    try {
      // Get current key
      const currentKey = await this.getMasterKey(keyId);
      if (!currentKey) {
        throw new Error('Key not found');
      }
      
      // Validate access
      if (!await this.validateKeyAccess(keyId, context)) {
        throw new Error('Access denied for key rotation');
      }
      
      // Generate new key with same properties
      const newKeyRequest: KeyGenerationRequest = {
        purpose: currentKey.purpose,
        algorithm: currentKey.algorithm,
        keyLength: currentKey.keyLength,
        securityLevel: currentKey.securityLevel,
        expiresAt: currentKey.expiresAt,
        maxUsageCount: currentKey.maxUsageCount,
        accessControlList: currentKey.accessControlList,
        complianceTags: currentKey.complianceTags,
        makePrimary: currentKey.isPrimary
      };
      
      const newKey = await this.generateMasterKey(newKeyRequest);
      
      // Mark old key as rotated
      await this.db.query(`
        UPDATE master_keys 
        SET is_primary = false, rotated_at = NOW(), is_active = false
        WHERE key_id = $1
      `, [keyId]);
      
      // Overlap period: keep old key active for configured time
      if (this.config.rotationOverlapHours > 0) {
        setTimeout(async () => {
          await this.db.query(`
            UPDATE master_keys 
            SET is_active = false
            WHERE key_id = $1
          `, [keyId]);
        }, this.config.rotationOverlapHours * 60 * 60 * 1000);
      }
      
      // Log rotation
      await this.logKeyOperation(keyId, 'rotate', {
        oldKeyId: keyId,
        newKeyId: newKey.keyId,
        rotationReason: 'manual'
      }, context);
      
      // Emit events
      this.emit('key_rotated', { oldKey: currentKey, newKey });
      
      return newKey;
    } catch (error) {
      console.error('Error rotating key:', error);
      throw new Error('Failed to rotate key');
    }
  }

  async destroyKey(keyId: string, context: KeyOperationContext, reason: string): Promise<boolean> {
    try {
      // Validate access (requires elevated permissions)
      if (!await this.validateKeyAccess(keyId, { ...context, operationType: 'destroy' })) {
        throw new Error('Access denied for key destruction');
      }
      
      // Create final backup before destruction
      if (this.config.backupEnabled) {
        await this.createKeyBackup(keyId, 'full');
      }
      
      // Mark key as destroyed (don't actually delete for audit purposes)
      await this.db.query(`
        UPDATE master_keys 
        SET is_active = false, destroyed_at = NOW()
        WHERE key_id = $1
      `, [keyId]);
      
      // Clear from cache
      if (this.config.cacheEnabled) {
        await this.redis.del(`master_key:${keyId}`);
      }
      
      // Log destruction
      await this.logKeyOperation(keyId, 'destroy', {
        reason,
        destroyedBy: context.userId
      }, context);
      
      // Emit event
      this.emit('key_destroyed', { keyId, reason });
      
      return true;
    } catch (error) {
      console.error('Error destroying key:', error);
      throw new Error('Failed to destroy key');
    }
  }

  async createKeyBackup(keyId: string, backupType: 'full' | 'metadata_only' | 'differential'): Promise<KeyBackup> {
    try {
      const backupId = this.generateBackupId(keyId);
      
      let backupData: any = {};
      
      if (backupType === 'full') {
        // Include encrypted key material
        const result = await this.db.query(`
          SELECT * FROM master_keys WHERE key_id = $1
        `, [keyId]);
        
        if (result.rows.length === 0) {
          throw new Error('Key not found');
        }
        
        backupData = result.rows[0];
      } else if (backupType === 'metadata_only') {
        // Include only metadata, no key material
        const result = await this.db.query(`
          SELECT 
            key_id, purpose, algorithm, key_length, key_version,
            is_active, is_primary, created_at, expires_at, security_level
          FROM master_keys WHERE key_id = $1
        `, [keyId]);
        
        backupData = result.rows[0];
      }
      
      // Encrypt backup data
      const encryptedBackup = this.encryptBackupData(JSON.stringify(backupData));
      
      // Calculate checksum
      const checksum = crypto.createHash('sha256')
        .update(JSON.stringify(backupData))
        .digest('hex');
      
      // Store backup
      await this.db.query(`
        INSERT INTO key_backups (
          key_id, backup_id, encrypted_backup_data, backup_checksum,
          backup_type, expires_at, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        keyId,
        backupId,
        encryptedBackup.encryptedData,
        checksum,
        backupType,
        new Date(Date.now() + this.config.backupRetentionDays * 24 * 60 * 60 * 1000),
        'KeyManagementService'
      ]);
      
      const backup: KeyBackup = {
        backupId,
        keyId,
        backupType,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + this.config.backupRetentionDays * 24 * 60 * 60 * 1000),
        verified: false
      };
      
      // Log backup creation
      await this.logKeyOperation(keyId, 'backup', { backupId, backupType });
      
      return backup;
    } catch (error) {
      console.error('Error creating key backup:', error);
      throw new Error('Failed to create key backup');
    }
  }

  async checkRotationRequirements(): Promise<Array<{ keyId: string; reason: string }>> {
    try {
      const result = await this.db.query(`
        SELECT * FROM check_key_rotation_requirements()
      `);
      
      return result.rows.map(row => ({
        keyId: row.key_id,
        reason: row.reason
      }));
    } catch (error) {
      console.error('Error checking rotation requirements:', error);
      return [];
    }
  }

  async listKeys(options: {
    purpose?: KeyPurpose;
    isActive?: boolean;
    securityLevel?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<MasterKey[]> {
    try {
      let query = `
        SELECT 
          key_id, purpose, algorithm, key_length, key_version,
          is_active, is_primary, created_at, expires_at, usage_count,
          security_level
        FROM master_keys
        WHERE 1=1
      `;
      
      const params: any[] = [];
      let paramIndex = 1;
      
      if (options.purpose) {
        query += ` AND purpose = $${paramIndex}`;
        params.push(options.purpose);
        paramIndex++;
      }
      
      if (options.isActive !== undefined) {
        query += ` AND is_active = $${paramIndex}`;
        params.push(options.isActive);
        paramIndex++;
      }
      
      if (options.securityLevel) {
        query += ` AND security_level = $${paramIndex}`;
        params.push(options.securityLevel);
        paramIndex++;
      }
      
      query += ` ORDER BY created_at DESC`;
      
      if (options.limit) {
        query += ` LIMIT $${paramIndex}`;
        params.push(options.limit);
        paramIndex++;
      }
      
      if (options.offset) {
        query += ` OFFSET $${paramIndex}`;
        params.push(options.offset);
      }
      
      const result = await this.db.query(query, params);
      
      return result.rows.map(row => ({
        keyId: row.key_id,
        purpose: row.purpose,
        algorithm: row.algorithm,
        keyLength: row.key_length,
        keyVersion: row.key_version,
        isActive: row.is_active,
        isPrimary: row.is_primary,
        createdAt: row.created_at,
        expiresAt: row.expires_at,
        usageCount: parseInt(row.usage_count),
        securityLevel: row.security_level
      }));
    } catch (error) {
      console.error('Error listing keys:', error);
      return [];
    }
  }

  // Private helper methods

  private initializeKeyEncryptionKey(): void {
    // In production, this would come from a secure source like HSM
    // For now, derive from a stable source
    this.keyEncryptionKey = crypto.scryptSync('key-management-kek', 'salt', 32);
  }

  private validateKeyGenerationRequest(request: KeyGenerationRequest): void {
    if (!request.purpose) {
      throw new Error('Key purpose is required');
    }
    
    const validPurposes: KeyPurpose[] = [
      'data_encryption', 'key_encryption', 'token_signing',
      'api_signing', 'session_encryption', 'backup_encryption', 'audit_signing'
    ];
    
    if (!validPurposes.includes(request.purpose)) {
      throw new Error(`Invalid key purpose: ${request.purpose}`);
    }
    
    if (request.keyLength && ![128, 192, 256, 512].includes(request.keyLength)) {
      throw new Error(`Invalid key length: ${request.keyLength}`);
    }
  }

  private generateKeyId(purpose: KeyPurpose): string {
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    return `${purpose}_${timestamp}_${random}`;
  }

  private generateBackupId(keyId: string): string {
    const timestamp = Date.now();
    const random = crypto.randomBytes(6).toString('hex');
    return `backup_${keyId.substring(0, 12)}_${timestamp}_${random}`;
  }

  private getDefaultAlgorithm(purpose: KeyPurpose): string {
    switch (purpose) {
      case 'data_encryption':
      case 'session_encryption':
      case 'backup_encryption':
        return 'aes-256-gcm';
      case 'key_encryption':
        return 'aes-256-gcm';
      case 'token_signing':
      case 'api_signing':
      case 'audit_signing':
        return 'hmac-sha256';
      default:
        return 'aes-256-gcm';
    }
  }

  private getDefaultKeyLength(algorithm: string): number {
    switch (algorithm) {
      case 'aes-128-gcm':
      case 'aes-128-cbc':
        return 128;
      case 'aes-256-gcm':
      case 'aes-256-cbc':
      case 'chacha20-poly1305':
        return 256;
      case 'hmac-sha256':
        return 256;
      default:
        return 256;
    }
  }

  private encryptKeyMaterial(keyMaterial: Buffer, keyId: string): {
    encryptedData: Buffer;
    iv: Buffer;
    authTag: Buffer;
  } {
    const iv = crypto.randomBytes(12); // 96-bit IV for GCM
    const cipher = crypto.createCipher('aes-256-gcm', this.keyEncryptionKey);
    cipher.setAAD(Buffer.from(keyId)); // Use keyId as additional authenticated data
    
    let encrypted = cipher.update(keyMaterial);
    cipher.final();
    const authTag = cipher.getAuthTag();
    
    return {
      encryptedData: encrypted,
      iv,
      authTag
    };
  }

  private decryptKeyMaterial(
    encryptedKey: { encryptedData: Buffer; iv: Buffer; authTag: Buffer },
    keyId: string
  ): Buffer {
    const decipher = crypto.createDecipher('aes-256-gcm', this.keyEncryptionKey);
    decipher.setAuthTag(encryptedKey.authTag);
    decipher.setAAD(Buffer.from(keyId));
    
    let decrypted = decipher.update(encryptedKey.encryptedData);
    decipher.final();
    
    return decrypted;
  }

  private encryptBackupData(data: string): { encryptedData: Buffer; iv: Buffer } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-cbc', this.keyEncryptionKey);
    
    let encrypted = cipher.update(data, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    return {
      encryptedData: encrypted,
      iv
    };
  }

  private async deactivateOtherPrimaryKeys(purpose: KeyPurpose): Promise<void> {
    await this.db.query(`
      UPDATE master_keys 
      SET is_primary = false 
      WHERE purpose = $1 AND is_primary = true
    `, [purpose]);
  }

  private async validateKeyAccess(keyId: string, context: KeyOperationContext): Promise<boolean> {
    if (!this.config.enableAccessControl) {
      return true;
    }
    
    try {
      const result = await this.db.query(`
        SELECT validate_key_access($1, $2, $3, $4) as access_allowed
      `, [
        keyId,
        context.userId,
        context.operationType,
        JSON.stringify(context.additionalContext || {})
      ]);
      
      return result.rows[0]?.access_allowed || false;
    } catch (error) {
      console.error('Error validating key access:', error);
      return false;
    }
  }

  private async checkAccessApproval(
    keyId: string,
    userId: string,
    operation: string
  ): Promise<boolean> {
    try {
      const result = await this.db.query(`
        SELECT COUNT(*) as count FROM temporary_access_grants tag
        WHERE tag.user_id = $1 
          AND tag.key_id = $2 
          AND tag.operation = $3
          AND tag.is_active = true
          AND tag.expires_at > NOW()
      `, [userId, keyId, operation]);
      
      return parseInt(result.rows[0].count) > 0;
    } catch (error) {
      console.error('Error checking access approval:', error);
      return false;
    }
  }

  private async logKeyAccess(
    keyId: string,
    accessType: string,
    context: KeyOperationContext,
    result: 'success' | 'failure' | 'unauthorized' | 'expired' | 'revoked',
    additionalInfo?: { riskLevel?: string; monitoringRequired?: boolean }
  ): Promise<void> {
    try {
      await this.db.query(`
        INSERT INTO key_access_log (
          key_id, access_type, access_result, user_id, service_name,
          operation_context, ip_address, user_agent, session_id, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        keyId,
        accessType,
        result,
        context.userId,
        context.serviceId,
        JSON.stringify(context.additionalContext || {}),
        context.ipAddress,
        context.userAgent,
        context.sessionId,
        JSON.stringify(additionalInfo || {})
      ]);
    } catch (error) {
      console.error('Error logging key access:', error);
    }
  }

  private async logKeyOperation(
    keyId: string,
    operation: string,
    details: any,
    context?: KeyOperationContext
  ): Promise<void> {
    if (!this.config.auditAllOperations) return;
    
    try {
      await this.auditService.logEvent({
        userId: context?.userId,
        action: `key_management_${operation}`,
        details: {
          keyId,
          operation,
          ...details
        },
        severity: ['destroy', 'export'].includes(operation) ? 'warning' : 'info',
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent
      });
    } catch (error) {
      console.error('Error logging key operation:', error);
    }
  }

  private startBackgroundProcesses(): void {
    // Cleanup expired cached keys every 5 minutes
    setInterval(async () => {
      try {
        await this.db.query('SELECT cleanup_expired_cached_keys()');
      } catch (error) {
        console.error('Error in cache cleanup:', error);
      }
    }, 5 * 60 * 1000);
    
    // Check rotation requirements every hour
    if (this.config.autoRotationEnabled) {
      setInterval(async () => {
        try {
          const rotationNeeded = await this.checkRotationRequirements();
          for (const { keyId, reason } of rotationNeeded) {
            this.emit('rotation_required', { keyId, reason });
          }
        } catch (error) {
          console.error('Error checking rotation requirements:', error);
        }
      }, 60 * 60 * 1000);
    }
  }
}