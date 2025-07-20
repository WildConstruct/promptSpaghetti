/**
 * TOTP Secret Manager - Epic 19 Implementation
 * Secure generation, encryption, and storage of TOTP secrets with key rotation and audit trails
 */

import crypto from 'crypto';
import { promisify } from 'util';
import base32 from 'base32';

export interface EncryptedSecret {
  id: string;
  userId: string;
  encryptedSecret: string;
  keyVersion: number;
  algorithm: string;
  iv: string;
  tag: string; // For authenticated encryption
  createdAt: Date;
  lastRotated?: Date;
  metadata: {
    purpose: 'totp' | 'backup' | 'recovery';
    associatedConfigId?: string;
    entropy: number;
    hashFingerprint: string;
  };
}

export interface SecretGenerationOptions {
  length?: number; // In bytes
  purpose: 'totp' | 'backup' | 'recovery';
  associatedConfigId?: string;
  customEntropy?: Buffer;
}

export interface KeyRotationResult {
  success: boolean;
  rotatedSecrets: number;
  failedSecrets: string[];
  newKeyVersion: number;
  message: string;
}

export interface SecretAuditEntry {
  id: string;
  secretId: string;
  userId: string;
  action: 'created' | 'accessed' | 'rotated' | 'deleted' | 'decrypted';
  timestamp: Date;
  sourceIP: string;
  userAgent?: string;
  success: boolean;
  metadata: Record<string, any>;
  riskLevel: 'low' | 'medium' | 'high';
}

export class TOTPSecretManager {
  private readonly encryptionAlgorithm = 'aes-256-gcm';
  private readonly keyDerivationIterations = 100000; // PBKDF2 iterations
  private readonly secretMinLength = 20; // 160 bits minimum for security
  private readonly secretMaxLength = 64; // 512 bits maximum
  
  private encryptionKeys: Map<number, Buffer> = new Map();
  private currentKeyVersion = 1;
  private auditLog: SecretAuditEntry[] = [];
  private secretStore: Map<string, EncryptedSecret> = new Map();

  constructor(private masterKey: string) {
    this.initializeEncryptionKeys();
  }

  /**
   * Initialize encryption keys for secret storage
   */
  private initializeEncryptionKeys(): void {
    // In production, these would be loaded from secure key management system
    const derivedKey = this.deriveKey(this.masterKey, 'totp-secrets-v1');
    this.encryptionKeys.set(1, derivedKey);
    this.currentKeyVersion = 1;
  }

  /**
   * Generate a cryptographically secure TOTP secret
   */
  async generateTOTPSecret(
    userId: string,
    options: SecretGenerationOptions,
    sourceIP: string = '127.0.0.1'
  ): Promise<{ secretId: string; secret: string; base32Secret: string }> {
    const length = Math.max(
      Math.min(options.length || 32, this.secretMaxLength),
      this.secretMinLength
    );

    // Generate high-entropy secret
    let secretBytes: Buffer;
    
    if (options.customEntropy) {
      // Use custom entropy if provided (for testing/special cases)
      secretBytes = crypto.scryptSync(options.customEntropy, 'totp-salt', length);
    } else {
      // Generate cryptographically secure random bytes
      secretBytes = await this.generateSecureRandomBytes(length);
    }

    // Encode secret as base32 for authenticator compatibility  
    const base32Secret = base32.encode(secretBytes).replace(/=/g, ''); // Remove padding
    const hexSecret = secretBytes.toString('hex');

    // Encrypt secret for storage
    const encryptedSecret = await this.encryptSecret(secretBytes, userId, options);

    // Store encrypted secret
    await this.storeEncryptedSecret(encryptedSecret);

    // Audit log
    await this.logSecretAccess({
      secretId: encryptedSecret.id,
      userId,
      action: 'created',
      sourceIP,
      success: true,
      metadata: {
        purpose: options.purpose,
        length,
        entropy: this.calculateEntropy(secretBytes),
        associatedConfigId: options.associatedConfigId
      },
      riskLevel: 'low'
    });

    return {
      secretId: encryptedSecret.id,
      secret: hexSecret,
      base32Secret
    };
  }

  /**
   * Securely retrieve and decrypt a TOTP secret
   */
  async retrieveTOTPSecret(
    secretId: string,
    userId: string,
    sourceIP: string = '127.0.0.1',
    userAgent?: string
  ): Promise<{ secret: string; base32Secret: string } | null> {
    const encryptedSecret = await this.getEncryptedSecret(secretId);
    
    if (!encryptedSecret) {
      await this.logSecretAccess({
        secretId,
        userId,
        action: 'accessed',
        sourceIP,
        userAgent,
        success: false,
        metadata: { reason: 'secret_not_found' },
        riskLevel: 'medium'
      });
      return null;
    }

    // Verify ownership
    if (encryptedSecret.userId !== userId) {
      await this.logSecretAccess({
        secretId,
        userId,
        action: 'accessed',
        sourceIP,
        userAgent,
        success: false,
        metadata: { reason: 'unauthorized_access_attempt', actualUserId: encryptedSecret.userId },
        riskLevel: 'high'
      });
      throw new Error('Unauthorized access to secret');
    }

    try {
      // Decrypt secret
      const secretBytes = await this.decryptSecret(encryptedSecret);
      const hexSecret = secretBytes.toString('hex');
      const base32Secret = base32.encode(secretBytes).replace(/=/g, '');

      // Audit successful access
      await this.logSecretAccess({
        secretId,
        userId,
        action: 'decrypted',
        sourceIP,
        userAgent,
        success: true,
        metadata: { keyVersion: encryptedSecret.keyVersion },
        riskLevel: 'low'
      });

      return { secret: hexSecret, base32Secret };
    } catch (error) {
      // Audit failed decryption
      await this.logSecretAccess({
        secretId,
        userId,
        action: 'decrypted',
        sourceIP,
        userAgent,
        success: false,
        metadata: { error: error.message, keyVersion: encryptedSecret.keyVersion },
        riskLevel: 'high'
      });
      throw error;
    }
  }

  /**
   * Rotate encryption keys and re-encrypt all secrets
   */
  async rotateEncryptionKeys(reason: string = 'scheduled_rotation'): Promise<KeyRotationResult> {
    const newKeyVersion = this.currentKeyVersion + 1;
    const newKey = this.deriveKey(this.masterKey, `totp-secrets-v${newKeyVersion}`);
    
    this.encryptionKeys.set(newKeyVersion, newKey);
    
    const allSecrets = await this.getAllEncryptedSecrets();
    const rotatedSecrets: string[] = [];
    const failedSecrets: string[] = [];

    for (const secret of allSecrets) {
      try {
        // Decrypt with old key
        const decryptedBytes = await this.decryptSecret(secret);
        
        // Re-encrypt with new key
        const newEncryptedSecret = await this.encryptSecret(
          decryptedBytes,
          secret.userId,
          {
            purpose: secret.metadata.purpose as any,
            associatedConfigId: secret.metadata.associatedConfigId
          },
          newKeyVersion
        );

        // Update stored secret
        newEncryptedSecret.id = secret.id; // Keep same ID
        newEncryptedSecret.lastRotated = new Date();
        await this.updateEncryptedSecret(newEncryptedSecret);
        
        rotatedSecrets.push(secret.id);
      } catch (error) {
        failedSecrets.push(secret.id);
        console.error(`Failed to rotate secret ${secret.id}:`, error.message);
      }
    }

    // Update current key version
    this.currentKeyVersion = newKeyVersion;

    // Clean up old keys (keep last 2 versions for graceful transition)
    if (newKeyVersion > 2) {
      this.encryptionKeys.delete(newKeyVersion - 2);
    }

    // Log rotation event
    console.log(`Key rotation completed: ${rotatedSecrets.length} rotated, ${failedSecrets.length} failed`);

    return {
      success: failedSecrets.length === 0,
      rotatedSecrets: rotatedSecrets.length,
      failedSecrets,
      newKeyVersion,
      message: `Rotated ${rotatedSecrets.length} secrets to key version ${newKeyVersion}`
    };
  }

  /**
   * Securely delete a TOTP secret
   */
  async deleteTOTPSecret(
    secretId: string,
    userId: string,
    reason: string,
    sourceIP: string = '127.0.0.1'
  ): Promise<boolean> {
    const encryptedSecret = await this.getEncryptedSecret(secretId);
    
    if (!encryptedSecret) {
      return false;
    }

    // Verify ownership
    if (encryptedSecret.userId !== userId) {
      await this.logSecretAccess({
        secretId,
        userId,
        action: 'deleted',
        sourceIP,
        success: false,
        metadata: { reason: 'unauthorized_deletion_attempt' },
        riskLevel: 'high'
      });
      throw new Error('Unauthorized deletion attempt');
    }

    // Securely overwrite the encrypted data before deletion
    await this.secureOverwrite(encryptedSecret);
    
    // Remove from storage
    await this.removeEncryptedSecret(secretId);

    // Audit deletion
    await this.logSecretAccess({
      secretId,
      userId,
      action: 'deleted',
      sourceIP,
      success: true,
      metadata: { reason, keyVersion: encryptedSecret.keyVersion },
      riskLevel: 'medium'
    });

    return true;
  }

  /**
   * Generate cryptographically secure random bytes
   */
  private async generateSecureRandomBytes(length: number): Promise<Buffer> {
    const randomBytes = promisify(crypto.randomBytes);
    
    // Use multiple entropy sources for extra security
    const systemRandom = await randomBytes(length);
    const timeEntropy = Buffer.from(Date.now().toString() + process.hrtime.bigint().toString());
    const processEntropy = Buffer.from(process.pid.toString() + Math.random().toString());
    
    // Combine entropy sources using HKDF
    const combinedEntropy = Buffer.concat([systemRandom, timeEntropy, processEntropy]);
    
    return crypto.hkdfSync('sha256', combinedEntropy, '', 'totp-secret-generation', length);
  }

  /**
   * Encrypt secret using AES-256-GCM
   */
  private async encryptSecret(
    secretBytes: Buffer,
    userId: string,
    options: SecretGenerationOptions,
    keyVersion?: number
  ): Promise<EncryptedSecret> {
    const useKeyVersion = keyVersion || this.currentKeyVersion;
    const encryptionKey = this.encryptionKeys.get(useKeyVersion);
    
    if (!encryptionKey) {
      throw new Error(`Encryption key version ${useKeyVersion} not found`);
    }

    // Generate random IV for each encryption
    const iv = crypto.randomBytes(12); // 96-bit IV for GCM
    
    // Create cipher
    const cipher = crypto.createCipher(this.encryptionAlgorithm, encryptionKey);
    cipher.setAAD(Buffer.from(userId)); // Use userId as additional authenticated data
    
    // Encrypt the secret
    const encrypted = Buffer.concat([
      cipher.update(secretBytes),
      cipher.final()
    ]);
    
    const tag = cipher.getAuthTag();

    // Calculate fingerprint for integrity verification
    const hashFingerprint = crypto
      .createHash('sha256')
      .update(secretBytes)
      .digest('hex')
      .substring(0, 16);

    return {
      id: this.generateSecretId(),
      userId,
      encryptedSecret: encrypted.toString('base64'),
      keyVersion: useKeyVersion,
      algorithm: this.encryptionAlgorithm,
      iv: iv.toString('base64'),
      tag: tag.toString('base64'),
      createdAt: new Date(),
      metadata: {
        purpose: options.purpose,
        associatedConfigId: options.associatedConfigId,
        entropy: this.calculateEntropy(secretBytes),
        hashFingerprint
      }
    };
  }

  /**
   * Decrypt secret using stored encryption parameters
   */
  private async decryptSecret(encryptedSecret: EncryptedSecret): Promise<Buffer> {
    const encryptionKey = this.encryptionKeys.get(encryptedSecret.keyVersion);
    
    if (!encryptionKey) {
      throw new Error(`Encryption key version ${encryptedSecret.keyVersion} not available`);
    }

    // Parse stored encryption parameters
    const encrypted = Buffer.from(encryptedSecret.encryptedSecret, 'base64');
    const iv = Buffer.from(encryptedSecret.iv, 'base64');
    const tag = Buffer.from(encryptedSecret.tag, 'base64');

    // Create decipher
    const decipher = crypto.createDecipher(encryptedSecret.algorithm, encryptionKey);
    decipher.setAuthTag(tag);
    decipher.setAAD(Buffer.from(encryptedSecret.userId));

    try {
      // Decrypt the secret
      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final()
      ]);

      // Verify integrity using stored fingerprint
      const calculatedFingerprint = crypto
        .createHash('sha256')
        .update(decrypted)
        .digest('hex')
        .substring(0, 16);

      if (calculatedFingerprint !== encryptedSecret.metadata.hashFingerprint) {
        throw new Error('Secret integrity verification failed');
      }

      return decrypted;
    } catch (error) {
      throw new Error(`Failed to decrypt secret: ${error.message}`);
    }
  }

  /**
   * Derive encryption key from master key
   */
  private deriveKey(masterKey: string, salt: string): Buffer {
    return crypto.pbkdf2Sync(
      masterKey,
      salt,
      this.keyDerivationIterations,
      32, // 256-bit key
      'sha256'
    );
  }

  /**
   * Calculate entropy of a buffer
   */
  private calculateEntropy(data: Buffer): number {
    const frequency: Map<number, number> = new Map();
    
    // Count byte frequencies
    for (const byte of data) {
      frequency.set(byte, (frequency.get(byte) || 0) + 1);
    }

    // Calculate Shannon entropy
    let entropy = 0;
    const length = data.length;
    
    for (const count of frequency.values()) {
      const probability = count / length;
      entropy -= probability * Math.log2(probability);
    }

    return Math.round(entropy * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Securely overwrite encrypted data
   */
  private async secureOverwrite(encryptedSecret: EncryptedSecret): Promise<void> {
    // Overwrite sensitive fields with random data multiple times
    for (let i = 0; i < 3; i++) {
      encryptedSecret.encryptedSecret = crypto.randomBytes(
        Buffer.from(encryptedSecret.encryptedSecret, 'base64').length
      ).toString('base64');
      
      encryptedSecret.iv = crypto.randomBytes(12).toString('base64');
      encryptedSecret.tag = crypto.randomBytes(16).toString('base64');
    }
  }

  private generateSecretId(): string {
    return `TS-${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
  }

  private generateAuditId(): string {
    return `SA-${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
  }

  // Storage methods (would be implemented with actual database)

  private async storeEncryptedSecret(secret: EncryptedSecret): Promise<void> {
    this.secretStore.set(secret.id, secret);
  }

  private async getEncryptedSecret(secretId: string): Promise<EncryptedSecret | null> {
    return this.secretStore.get(secretId) || null;
  }

  private async updateEncryptedSecret(secret: EncryptedSecret): Promise<void> {
    this.secretStore.set(secret.id, secret);
  }

  private async removeEncryptedSecret(secretId: string): Promise<void> {
    this.secretStore.delete(secretId);
  }

  private async getAllEncryptedSecrets(): Promise<EncryptedSecret[]> {
    return Array.from(this.secretStore.values());
  }

  private async logSecretAccess(entry: Omit<SecretAuditEntry, 'id' | 'timestamp'>): Promise<void> {
    const auditEntry: SecretAuditEntry = {
      ...entry,
      id: this.generateAuditId(),
      timestamp: new Date()
    };
    
    this.auditLog.push(auditEntry);
    
    // Keep only recent audit entries (last 10000)
    if (this.auditLog.length > 10000) {
      this.auditLog.splice(0, this.auditLog.length - 10000);
    }

    // Log high-risk events immediately
    if (entry.riskLevel === 'high') {
      console.warn(`🚨 HIGH RISK SECRET ACCESS: ${entry.action} by ${entry.userId} from ${entry.sourceIP}`);
    }
  }

  // Public utility methods

  /**
   * Get secret access audit log for a user
   */
  async getSecretAuditLog(
    userId: string, 
    hours: number = 24
  ): Promise<SecretAuditEntry[]> {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    return this.auditLog.filter(entry => 
      entry.userId === userId && entry.timestamp >= cutoff
    );
  }

  /**
   * Get secret statistics
   */
  async getSecretStatistics(): Promise<{
    totalSecrets: number;
    secretsByPurpose: Record<string, number>;
    averageEntropy: number;
    keyVersionDistribution: Record<number, number>;
    recentAuditEvents: number;
  }> {
    const allSecrets = await this.getAllEncryptedSecrets();
    
    const secretsByPurpose: Record<string, number> = {};
    const keyVersionDistribution: Record<number, number> = {};
    let totalEntropy = 0;

    for (const secret of allSecrets) {
      secretsByPurpose[secret.metadata.purpose] = 
        (secretsByPurpose[secret.metadata.purpose] || 0) + 1;
      
      keyVersionDistribution[secret.keyVersion] = 
        (keyVersionDistribution[secret.keyVersion] || 0) + 1;
      
      totalEntropy += secret.metadata.entropy;
    }

    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentAuditEvents = this.auditLog.filter(e => e.timestamp >= last24Hours).length;

    return {
      totalSecrets: allSecrets.length,
      secretsByPurpose,
      averageEntropy: allSecrets.length > 0 ? totalEntropy / allSecrets.length : 0,
      keyVersionDistribution,
      recentAuditEvents
    };
  }

  /**
   * Validate secret format and security
   */
  validateSecret(secret: string): { 
    valid: boolean; 
    entropy: number; 
    recommendations: string[] 
  } {
    const secretBytes = Buffer.from(secret, 'hex');
    const entropy = this.calculateEntropy(secretBytes);
    const recommendations: string[] = [];

    if (secretBytes.length < this.secretMinLength) {
      recommendations.push(`Secret should be at least ${this.secretMinLength} bytes`);
    }

    if (entropy < 7.0) {
      recommendations.push('Secret has low entropy, consider regenerating');
    }

    return {
      valid: secretBytes.length >= this.secretMinLength && entropy >= 6.0,
      entropy,
      recommendations
    };
  }
}