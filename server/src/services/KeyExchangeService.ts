// Secure Key Exchange Service
// Implements ECDH (Elliptic Curve Diffie-Hellman) key exchange protocol
// Provides secure key derivation, session management, and audit logging

import { DatabaseService } from '../auth/database/DatabaseService';
import { RedisService } from '../auth/database/RedisService';
import { AuditService } from '../auth/services/AuditService';
import { EventEmitter } from 'events';
import * as crypto from 'crypto';

export interface KeyExchangeConfig {
  // Algorithm configuration
  algorithm: 'secp256r1' | 'secp384r1' | 'secp521r1';
  keyDerivationFunction: 'pbkdf2' | 'argon2' | 'scrypt';
  iterations: number;
  
  // Security settings
  defaultSecurityLevel: 'standard' | 'high' | 'maximum';
  sessionTimeout: number; // minutes
  maxConcurrentSessions: number;
  
  // Key management
  keyRotationInterval: number; // hours
  maxKeyUsage: number;
  enableKeyRevocation: boolean;
  
  // Audit and monitoring
  auditAllOperations: boolean;
  enableSecurityAlerts: boolean;
  riskThreshold: number; // 0-100
}

export interface KeyExchangeSession {
  id: string;
  sessionId: string;
  userId?: string;
  clientId?: string;
  state: 'initiated' | 'server_ready' | 'completed' | 'expired' | 'failed';
  
  // Cryptographic data
  serverPublicKey: string;
  clientPublicKey?: string;
  algorithm: string;
  securityLevel: string;
  
  // Metadata
  createdAt: Date;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface DerivedKey {
  keyId: string;
  purpose: 'encryption' | 'authentication' | 'signing' | 'session' | 'api_access';
  keyLength: number;
  derivedAt: Date;
  expiresAt?: Date;
  usageCount: number;
  maxUsageCount?: number;
}

export interface KeyExchangeResult {
  sessionId: string;
  serverPublicKey: string;
  algorithm: string;
  securityLevel: string;
  expiresAt: Date;
  derivationParameters: {
    kdf: string;
    iterations: number;
    saltLength: number;
  };
}

export interface SharedSecretResult {
  sessionId: string;
  success: boolean;
  derivedKeys?: {
    [purpose: string]: {
      keyId: string;
      expiresAt?: Date;
    };
  };
  securityWarnings?: string[];
}

export class KeyExchangeService extends EventEmitter {
  private db: DatabaseService;
  private redis: RedisService;
  private auditService: AuditService;
  private config: KeyExchangeConfig;
  private activeKeys: Map<string, crypto.KeyObject> = new Map();

  constructor(
    db: DatabaseService,
    redis: RedisService,
    auditService: AuditService,
    config: KeyExchangeConfig
  ) {
    super();
    this.db = db;
    this.redis = redis;
    this.auditService = auditService;
    this.config = config;
    
    // Start background cleanup
    this.startCleanupInterval();
  }

  async initiateKeyExchange(
    userId?: string,
    clientId?: string,
    securityLevel?: 'standard' | 'high' | 'maximum',
    ipAddress?: string,
    userAgent?: string
  ): Promise<KeyExchangeResult> {
    try {
      // Generate session ID
      const sessionId = this.generateSecureSessionId();
      
      // Determine security level
      const effectiveSecurityLevel = securityLevel || this.config.defaultSecurityLevel;
      
      // Check concurrent session limits
      await this.enforceConcurrentSessionLimits(userId);
      
      // Generate server key pair
      const algorithm = this.getAlgorithmForSecurityLevel(effectiveSecurityLevel);
      const keyPair = this.generateKeyPair(algorithm);
      
      // Encrypt private key for storage
      const encryptedPrivateKey = this.encryptPrivateKey(keyPair.privateKey, sessionId);
      
      // Calculate expiry
      const expiresAt = new Date(Date.now() + this.config.sessionTimeout * 60 * 1000);
      
      // Store session in database
      await this.db.query(`
        INSERT INTO key_exchange_sessions (
          session_id, user_id, client_id, state, server_private_key, 
          server_public_key, algorithm, security_level, ip_address, 
          user_agent, expires_at, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `, [
        sessionId,
        userId,
        clientId,
        'initiated',
        encryptedPrivateKey,
        this.exportPublicKey(keyPair.publicKey),
        algorithm,
        effectiveSecurityLevel,
        ipAddress,
        userAgent,
        expiresAt,
        'KeyExchangeService'
      ]);
      
      // Cache session data in Redis
      await this.cacheSessionData(sessionId, {
        userId,
        algorithm,
        securityLevel: effectiveSecurityLevel,
        createdAt: new Date(),
        expiresAt
      });
      
      // Log initiation
      await this.auditKeyExchangeEvent(sessionId, 'session_initiated', {
        userId,
        clientId,
        algorithm,
        securityLevel: effectiveSecurityLevel,
        ipAddress,
        userAgent
      });
      
      // Emit event
      this.emit('key_exchange_initiated', {
        sessionId,
        userId,
        securityLevel: effectiveSecurityLevel
      });
      
      return {
        sessionId,
        serverPublicKey: this.exportPublicKey(keyPair.publicKey),
        algorithm,
        securityLevel: effectiveSecurityLevel,
        expiresAt,
        derivationParameters: {
          kdf: this.config.keyDerivationFunction,
          iterations: this.getIterationsForSecurityLevel(effectiveSecurityLevel),
          saltLength: 32
        }
      };
    } catch (error) {
      console.error('Error initiating key exchange:', error);
      throw new Error('Failed to initiate key exchange');
    }
  }

  async completeKeyExchange(
    sessionId: string,
    clientPublicKey: string,
    requestedKeys: Array<{
      purpose: 'encryption' | 'authentication' | 'signing' | 'session' | 'api_access';
      keyLength: number;
      expiryHours?: number;
      maxUsage?: number;
    }> = []
  ): Promise<SharedSecretResult> {
    try {
      // Get session
      const session = await this.getSession(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }
      
      if (session.state !== 'initiated') {
        throw new Error(`Invalid session state: ${session.state}`);
      }
      
      if (new Date() > session.expiresAt) {
        await this.expireSession(sessionId);
        throw new Error('Session expired');
      }
      
      // Validate client public key
      this.validatePublicKey(clientPublicKey, session.algorithm);
      
      // Get server private key
      const serverPrivateKey = await this.getDecryptedPrivateKey(sessionId);
      const serverKeyObject = this.importPrivateKey(serverPrivateKey, session.algorithm);
      const clientKeyObject = this.importPublicKey(clientPublicKey, session.algorithm);
      
      // Derive shared secret
      const sharedSecret = this.deriveSharedSecret(serverKeyObject, clientKeyObject);
      
      // Generate salt for key derivation
      const salt = crypto.randomBytes(32);
      
      // Update session
      await this.db.query(`
        UPDATE key_exchange_sessions 
        SET state = $1, client_public_key = $2, shared_secret_hash = $3, 
            key_derivation_salt = $4, completed_at = $5, last_activity = $5,
            completion_method = $6
        WHERE session_id = $7
      `, [
        'completed',
        clientPublicKey,
        this.hashSharedSecret(sharedSecret),
        salt,
        new Date(),
        'standard_ecdh',
        sessionId
      ]);
      
      // Derive requested keys
      const derivedKeys: { [purpose: string]: { keyId: string; expiresAt?: Date } } = {};
      const securityWarnings: string[] = [];
      
      for (const keyRequest of requestedKeys) {
        try {
          const derivedKey = await this.deriveKey(
            sessionId,
            sharedSecret,
            salt,
            keyRequest.purpose,
            keyRequest.keyLength,
            keyRequest.expiryHours,
            keyRequest.maxUsage
          );
          
          derivedKeys[keyRequest.purpose] = {
            keyId: derivedKey.keyId,
            expiresAt: derivedKey.expiresAt
          };
          
          // Check for security concerns
          if (keyRequest.keyLength < 32 && keyRequest.purpose === 'encryption') {
            securityWarnings.push(`Encryption key length ${keyRequest.keyLength} may be insufficient`);
          }
          
        } catch (error) {
          console.error(`Error deriving key for purpose ${keyRequest.purpose}:`, error);
          securityWarnings.push(`Failed to derive key for ${keyRequest.purpose}`);
        }
      }
      
      // Clear sensitive data from memory
      this.clearSensitiveData(sessionId);
      
      // Log completion
      await this.auditKeyExchangeEvent(sessionId, 'session_completed', {
        clientPublicKey: clientPublicKey.substring(0, 20) + '...',
        derivedKeysCount: Object.keys(derivedKeys).length,
        securityWarnings: securityWarnings.length
      });
      
      // Emit completion event
      this.emit('key_exchange_completed', {
        sessionId,
        derivedKeysCount: Object.keys(derivedKeys).length
      });
      
      return {
        sessionId,
        success: true,
        derivedKeys,
        securityWarnings: securityWarnings.length > 0 ? securityWarnings : undefined
      };
      
    } catch (error) {
      console.error('Error completing key exchange:', error);
      
      // Mark session as failed
      await this.failSession(sessionId, error.message);
      
      return {
        sessionId,
        success: false,
        securityWarnings: [error.message]
      };
    }
  }

  async deriveKey(
    sessionId: string,
    sharedSecret: Buffer,
    salt: Buffer,
    purpose: 'encryption' | 'authentication' | 'signing' | 'session' | 'api_access',
    keyLength: number,
    expiryHours?: number,
    maxUsage?: number
  ): Promise<DerivedKey> {
    // Validate key length
    if (![16, 24, 32, 48, 64].includes(keyLength)) {
      throw new Error(`Invalid key length: ${keyLength}`);
    }
    
    // Generate unique key ID
    const keyId = this.generateKeyId(sessionId, purpose);
    
    // Create derivation info for HKDF
    const info = Buffer.from(`${purpose}:${keyLength}:${sessionId}`, 'utf8');
    
    // Derive key using HKDF
    const derivedKeyBuffer = this.deriveKeyHKDF(sharedSecret, salt, info, keyLength);
    
    // Calculate expiry
    const expiresAt = expiryHours ? 
      new Date(Date.now() + expiryHours * 60 * 60 * 1000) : 
      undefined;
    
    // Store derived key metadata
    await this.db.query(`
      INSERT INTO derived_keys (
        session_id, key_id, key_purpose, derivation_info, key_length,
        expires_at, max_usage_count, security_context
      ) 
      SELECT id, $1, $2, $3, $4, $5, $6, $7
      FROM key_exchange_sessions 
      WHERE session_id = $8
    `, [
      keyId,
      purpose,
      info.toString('base64'),
      keyLength,
      expiresAt,
      maxUsage,
      JSON.stringify({ algorithm: 'hkdf-sha256', keyLength }),
      sessionId
    ]);
    
    // Cache derived key (temporarily for immediate use)
    await this.cacheDerivedKey(keyId, derivedKeyBuffer, 3600); // 1 hour cache
    
    // Log key derivation
    await this.auditKeyExchangeEvent(sessionId, 'key_derived', {
      keyId,
      purpose,
      keyLength,
      expiresAt,
      maxUsage
    });
    
    return {
      keyId,
      purpose,
      keyLength,
      derivedAt: new Date(),
      expiresAt,
      usageCount: 0,
      maxUsageCount: maxUsage
    };
  }

  async getSessionStatus(sessionId: string): Promise<KeyExchangeSession | null> {
    try {
      const result = await this.db.query(`
        SELECT 
          id, session_id, user_id, client_id, state, server_public_key,
          client_public_key, algorithm, security_level, created_at,
          expires_at, ip_address, user_agent
        FROM key_exchange_sessions
        WHERE session_id = $1
      `, [sessionId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const row = result.rows[0];
      return {
        id: row.id,
        sessionId: row.session_id,
        userId: row.user_id,
        clientId: row.client_id,
        state: row.state,
        serverPublicKey: row.server_public_key,
        clientPublicKey: row.client_public_key,
        algorithm: row.algorithm,
        securityLevel: row.security_level,
        createdAt: row.created_at,
        expiresAt: row.expires_at,
        ipAddress: row.ip_address,
        userAgent: row.user_agent
      };
    } catch (error) {
      console.error('Error getting session status:', error);
      return null;
    }
  }

  async revokeDerivedKey(keyId: string, reason: string): Promise<boolean> {
    try {
      const result = await this.db.query(`
        UPDATE derived_keys 
        SET revoked_at = NOW(), revocation_reason = $1
        WHERE key_id = $2 AND revoked_at IS NULL
        RETURNING session_id
      `, [reason, keyId]);
      
      if (result.rows.length === 0) {
        return false;
      }
      
      const sessionId = result.rows[0].session_id;
      
      // Remove from cache
      await this.redis.del(`derived_key:${keyId}`);
      
      // Log revocation
      await this.auditKeyExchangeEvent(sessionId, 'key_revoked', {
        keyId,
        reason
      });
      
      return true;
    } catch (error) {
      console.error('Error revoking derived key:', error);
      return false;
    }
  }

  async getActiveSessions(userId?: string): Promise<KeyExchangeSession[]> {
    try {
      const query = userId ? 
        `SELECT * FROM key_exchange_sessions WHERE user_id = $1 AND state IN (
          'initiated',
          'server_ready',
          'completed'
        ) ORDER BY created_at DESC` :
        `SELECT * FROM key_exchange_sessions WHERE state IN (
          'initiated',
          'server_ready',
          'completed'
        ) ORDER BY created_at DESC LIMIT 100`;
      
      const params = userId ? [userId] : [];
      const result = await this.db.query(query, params);
      
      return result.rows.map(row => ({
        id: row.id,
        sessionId: row.session_id,
        userId: row.user_id,
        clientId: row.client_id,
        state: row.state,
        serverPublicKey: row.server_public_key,
        clientPublicKey: row.client_public_key,
        algorithm: row.algorithm,
        securityLevel: row.security_level,
        createdAt: row.created_at,
        expiresAt: row.expires_at,
        ipAddress: row.ip_address,
        userAgent: row.user_agent
      }));
    } catch (error) {
      console.error('Error getting active sessions:', error);
      return [];
    }
  }

  // Private helper methods

  private generateSecureSessionId(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private generateKeyId(sessionId: string, purpose: string): string {
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    return `${purpose}_${sessionId.substring(0, 8)}_${timestamp}_${random}`;
  }

  private getAlgorithmForSecurityLevel(level: string): 'secp256r1' | 'secp384r1' | 'secp521r1' {
    switch (level) {
    case 'maximum': return 'secp521r1';
    case 'high': return 'secp384r1';
    default: return 'secp256r1';
    }
  }

  private getIterationsForSecurityLevel(level: string): number {
    switch (level) {
    case 'maximum': return 500000;
    case 'high': return 250000;
    default: return 100000;
    }
  }

  private generateKeyPair(algorithm: string): crypto.KeyPairSyncResult<string, string> {
    return crypto.generateKeyPairSync('ec', {
      namedCurve: algorithm,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
  }

  private exportPublicKey(publicKey: crypto.KeyObject): string {
    return publicKey.export({ type: 'spki', format: 'pem' }) as string;
  }

  private importPublicKey(publicKeyPem: string, algorithm: string): crypto.KeyObject {
    return crypto.createPublicKey({
      key: publicKeyPem,
      format: 'pem',
      type: 'spki'
    });
  }

  private importPrivateKey(privateKeyPem: string, algorithm: string): crypto.KeyObject {
    return crypto.createPrivateKey({
      key: privateKeyPem,
      format: 'pem',
      type: 'pkcs8'
    });
  }

  private validatePublicKey(publicKeyPem: string, algorithm: string): void {
    try {
      const keyObject = this.importPublicKey(publicKeyPem, algorithm);
      const keyDetails = keyObject.asymmetricKeyDetails;
      
      if (!keyDetails || keyDetails.namedCurve !== algorithm) {
        throw new Error('Invalid public key algorithm');
      }
    } catch (error) {
      throw new Error(`Invalid public key: ${error.message}`);
    }
  }

  private deriveSharedSecret(privateKey: crypto.KeyObject, publicKey: crypto.KeyObject): Buffer {
    return crypto.diffieHellman({
      privateKey,
      publicKey
    });
  }

  private hashSharedSecret(sharedSecret: Buffer): string {
    return crypto.createHash('sha256').update(sharedSecret).digest('hex');
  }

  private deriveKeyHKDF(
    sharedSecret: Buffer,
    salt: Buffer,
    info: Buffer,
    keyLength: number
  ): Buffer {
    return crypto.hkdfSync('sha256', sharedSecret, salt, info, keyLength);
  }

  private encryptPrivateKey(privateKey: crypto.KeyObject, sessionId: string): string {
    const key = crypto.scryptSync(sessionId, 'key-exchange-salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-gcm', key);
    cipher.setAAD(Buffer.from(sessionId));
    
    const privatePem = privateKey.export({ type: 'pkcs8', format: 'pem' }) as string;
    let encrypted = cipher.update(privatePem, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    
    return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
  }

  private async getDecryptedPrivateKey(sessionId: string): Promise<string> {
    const result = await this.db.query(
      'SELECT server_private_key FROM key_exchange_sessions WHERE session_id = $1',
      [sessionId]
    );
    
    if (result.rows.length === 0) {
      throw new Error('Session not found');
    }
    
    const encryptedKey = result.rows[0].server_private_key;
    const [ivHex, encrypted, authTagHex] = encryptedKey.split(':');
    
    const key = crypto.scryptSync(sessionId, 'key-exchange-salt', 32);
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipher('aes-256-gcm', key);
    decipher.setAuthTag(authTag);
    decipher.setAAD(Buffer.from(sessionId));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  private async getSession(sessionId: string): Promise<KeyExchangeSession | null> {
    // Try cache first
    const cached = await this.redis.get(`session:${sessionId}`);
    if (cached) {
      return JSON.parse(cached);
    }
    
    // Fallback to database
    return this.getSessionStatus(sessionId);
  }

  private async cacheSessionData(sessionId: string, data: any): Promise<void> {
    await this.redis.setex(`session:${sessionId}`, 900, JSON.stringify(data)); // 15 minutes
  }

  private async cacheDerivedKey(keyId: string, keyBuffer: Buffer, ttl: number): Promise<void> {
    await this.redis.setex(`derived_key:${keyId}`, ttl, keyBuffer.toString('base64'));
  }

  private async enforceConcurrentSessionLimits(userId?: string): Promise<void> {
    if (!userId) return;
    
    const activeCount = await this.db.query(`
      SELECT COUNT(*) as count
      FROM key_exchange_sessions
      WHERE user_id = $1 AND state IN ('initiated', 'server_ready')
    `, [userId]);
    
    if (parseInt(activeCount.rows[0].count) >= this.config.maxConcurrentSessions) {
      throw new Error('Too many concurrent key exchange sessions');
    }
  }

  private async expireSession(sessionId: string): Promise<void> {
    await this.db.query(`
      UPDATE key_exchange_sessions 
      SET state = 'expired', last_activity = NOW()
      WHERE session_id = $1
    `, [sessionId]);
  }

  private async failSession(sessionId: string, reason: string): Promise<void> {
    await this.db.query(`
      UPDATE key_exchange_sessions 
      SET state = 'failed', failure_reason = $1, last_activity = NOW()
      WHERE session_id = $2
    `, [reason, sessionId]);
  }

  private clearSensitiveData(sessionId: string): void {
    this.activeKeys.delete(sessionId);
  }

  private async auditKeyExchangeEvent(
    sessionId: string,
    eventType: string,
    eventData: any
  ): Promise<void> {
    if (!this.config.auditAllOperations) return;
    
    try {
      await this.auditService.logEvent({
        userId: eventData.userId,
        action: `key_exchange_${eventType}`,
        details: {
          sessionId,
          ...eventData
        },
        severity: eventType.includes('failed') || eventType.includes('security') ? 'error' : 'info'
      });
    } catch (error) {
      console.error('Error logging key exchange audit event:', error);
    }
  }

  private startCleanupInterval(): void {
    setInterval(async () => {
      try {
        await this.db.query('SELECT cleanup_expired_key_exchange_sessions()');
      } catch (error) {
        console.error('Error in key exchange cleanup:', error);
      }
    }, 60 * 1000); // Run every minute
  }
}