// API Payload Encryption Middleware
// Comprehensive end-to-end encryption for sensitive API payloads
// Integrates with KeyManagementService for secure key handling

import { FastifyRequest, FastifyReply } from 'fastify';
import * as crypto from 'crypto';
import { KeyManagementService } from '../services/KeyManagementService';
import { DatabaseService } from '../auth/database/DatabaseService';
import { RedisService } from '../auth/database/RedisService';
import { AuditService } from '../auth/services/AuditService';

}
export interface PayloadEncryptionConfig {
  enabled: boolean;
  algorithm: 'aes-256-gcm' | 'aes-256-cbc' | 'chacha20-poly1305';
  keyRotationDays: number;
  requiredForEndpoints: string[];
  optionalForEndpoints: string[];
  maxPayloadSize: number;
  compressionEnabled: boolean;
  keyDerivationIterations: number;
  enableMetrics: boolean;
  auditAllOperations: boolean;
}
}

}
export interface EncryptedPayload {
  data: string; // Base64 encoded encrypted data
  iv: string; // Base64 encoded initialization vector
  authTag?: string; // Base64 encoded authentication tag (for GCM mode)
  keyId: string; // ID of the encryption key used
  algorithm: string;
  timestamp: number;
  compressed?: boolean;
}
}

}
export interface PayloadEncryptionMetrics {
  totalEncryptions: number;
  totalDecryptions: number;
  successfulOperations: number;
  failedOperations: number;
  averageEncryptionTime: number;
  averageDecryptionTime: number;
  keyRotations: number;
  compressionRatio: number;
}
}

export class PayloadEncryptionService {
  private keyManagementService: KeyManagementService;
  private config: PayloadEncryptionConfig;
  private metrics: PayloadEncryptionMetrics;
  private currentKeyId?: string;

  constructor(
    keyManagementService: KeyManagementService,
    config: PayloadEncryptionConfig
  ) {
    this.keyManagementService = keyManagementService;
    this.config = config;
    this.metrics = {
      totalEncryptions: 0,
      totalDecryptions: 0,
      successfulOperations: 0,
      failedOperations: 0,
      averageEncryptionTime: 0,
      averageDecryptionTime: 0,
      keyRotations: 0,
      compressionRatio: 1.0
    };
  }

  async initialize(): Promise<void> {

    if (!this.config.enabled) return;

    try {
      // Get or create encryption key for payload encryption
      await this.ensureEncryptionKey();
      console.log('Payload encryption service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize payload encryption service:', error);
      throw error;
    }
  }

  async encryptPayload(data: unknown, endpoint?: string): Promise<EncryptedPayload> {

    const startTime = Date.now();
    
    try {
      if (!this.config.enabled) {
        throw new Error('Payload encryption is disabled');
      }

      // Check if encryption is required for this endpoint
      if (endpoint && !this.shouldEncryptEndpoint(endpoint)) {
        throw new Error(`Encryption not required for endpoint: ${endpoint}`);
      }

      // Serialize payload
      let serializedData = JSON.stringify(data);
      const originalSize = Buffer.byteLength(serializedData, 'utf8');

      // Validate payload size
      if (originalSize > this.config.maxPayloadSize) {
        throw new Error(`Payload size ${originalSize} exceeds maximum ${this.config.maxPayloadSize}`);
      }

      let compressed = false;
      // Compress if enabled and beneficial
      if (this.config.compressionEnabled && originalSize > 1024) {
        const zlib = await import('zlib');
        const compressedBuffer = zlib.gzipSync(Buffer.from(serializedData));
        if (compressedBuffer.length < originalSize * 0.9) { // Only use if 10%+ compression
          serializedData = compressedBuffer.toString('base64');
          compressed = true;
          
          // Update compression metrics
          const compressionRatio = compressedBuffer.length / originalSize;
          this.metrics.compressionRatio = (this.metrics.compressionRatio + compressionRatio) / 2;
        }
      }

      // Ensure we have a current encryption key
      if (!this.currentKeyId) {
        await this.ensureEncryptionKey();
      }

      // Get encryption key material
      const keyMaterial = await this.keyManagementService.getKeyMaterial(
        this.currentKeyId!,
        {
          userId: 'payload_encryption_service',
          operationType: 'encrypt',
          additionalContext: { endpoint, dataSize: originalSize }
        }
      );

      // Generate IV
      const iv = crypto.randomBytes(this.getIVLength());
      
      // Encrypt the data
      const cipher = crypto.createCipher(this.config.algorithm, keyMaterial);
      cipher.setIVLength && cipher.setIVLength(iv.length);
      
      let encrypted = cipher.update(serializedData, 'utf8', 'base64');
      encrypted += cipher.final('base64');

      // Get authentication tag for GCM mode
      let authTag: string | undefined;
      if (this.config.algorithm.includes('gcm')) {
        authTag = (cipher as any).getAuthTag().toString('base64');
      }

      const result: EncryptedPayload = {
        data: encrypted,
        iv: iv.toString('base64'),
        authTag,
        keyId: this.currentKeyId!,
        algorithm: this.config.algorithm,
        timestamp: Date.now(),
        compressed
      };

      // Update metrics
      this.metrics.totalEncryptions++;
      this.metrics.successfulOperations++;
      const encryptionTime = Date.now() - startTime;
      this.metrics.averageEncryptionTime = 
        (this.metrics.averageEncryptionTime + encryptionTime) / 2;

      return result;
    } catch (error) {
      this.metrics.totalEncryptions++;
      this.metrics.failedOperations++;
      console.error('Payload encryption failed:', error);
      throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async decryptPayload(encryptedPayload: EncryptedPayload): Promise<any> {

    const startTime = Date.now();
    
    try {
      if (!this.config.enabled) {
        throw new Error('Payload encryption is disabled');
      }

      // Validate payload structure
      this.validateEncryptedPayload(encryptedPayload);

      // Check timestamp for replay attack protection
      const payloadAge = Date.now() - encryptedPayload.timestamp;
      const maxAge = 5 * 60 * 1000; // 5 minutes
      if (payloadAge > maxAge) {
        throw new Error('Encrypted payload has expired');
      }

      // Get decryption key material
      const keyMaterial = await this.keyManagementService.getKeyMaterial(
        encryptedPayload.keyId,
        {
          userId: 'payload_encryption_service',
          operationType: 'decrypt',
          additionalContext: { 
            algorithm: encryptedPayload.algorithm,
            timestamp: encryptedPayload.timestamp
          }
        }
      );

      // Decrypt the data
      const decipher = crypto.createDecipher(encryptedPayload.algorithm, keyMaterial);
      const iv = Buffer.from(encryptedPayload.iv, 'base64');
      decipher.setIVLength && decipher.setIVLength(iv.length);

      // Set authentication tag for GCM mode
      if (encryptedPayload.authTag && encryptedPayload.algorithm.includes('gcm')) {
        const authTag = Buffer.from(encryptedPayload.authTag, 'base64');
        (decipher as any).setAuthTag(authTag);
      }

      let decrypted = decipher.update(encryptedPayload.data, 'base64', 'utf8');
      decrypted += decipher.final('utf8');

      // Decompress if needed
      if (encryptedPayload.compressed) {
        const zlib = await import('zlib');
        const compressedBuffer = Buffer.from(decrypted, 'base64');
        decrypted = zlib.gunzipSync(compressedBuffer).toString('utf8');
      }

      // Parse JSON
      const result = JSON.parse(decrypted);

      // Update metrics
      this.metrics.totalDecryptions++;
      this.metrics.successfulOperations++;
      const decryptionTime = Date.now() - startTime;
      this.metrics.averageDecryptionTime = 
        (this.metrics.averageDecryptionTime + decryptionTime) / 2;

      return result;
    } catch (error) {
      this.metrics.totalDecryptions++;
      this.metrics.failedOperations++;
      console.error('Payload decryption failed:', error);
      throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async rotateEncryptionKey(): Promise<void> {

    try {
      if (!this.currentKeyId) {
        throw new Error('No current encryption key to rotate');
      }

      // Rotate the current key
      const newKey = await this.keyManagementService.rotateKey(
        this.currentKeyId,
        {
          userId: 'payload_encryption_service',
          operationType: 'rotate',
          additionalContext: { reason: 'scheduled_rotation' }
        }
      );

      this.currentKeyId = newKey.keyId;
      this.metrics.keyRotations++;

      console.log(`Payload encryption key rotated: ${this.currentKeyId}`);
    } catch (error) {
      console.error('Failed to rotate payload encryption key:', error);
      throw error;
    }
  }

  getMetrics(): PayloadEncryptionMetrics {
    return { ...this.metrics };
  }

  private async ensureEncryptionKey(): Promise<void> {

    try {
      // Try to get existing payload encryption key
      const existingKeys = await this.keyManagementService.listKeys({
        purpose: 'payload_encryption',
        isActive: true,
        isPrimary: true,
        limit: 1
      });

      if (existingKeys.length > 0) {
        this.currentKeyId = existingKeys[0].keyId;
        console.log(`Using existing payload encryption key: ${this.currentKeyId}`);
        return;
      }

      // Create new encryption key
      const newKey = await this.keyManagementService.generateMasterKey({
        purpose: 'payload_encryption',
        algorithm: this.config.algorithm,
        keyLength: this.getKeyLength(),
        makePrimary: true,
        securityLevel: 'high',
        maxUsageCount: 1000000, // 1M operations before rotation
        complianceTags: {
          purpose: 'api_payload_encryption',
          classification: 'internal',
          gdpr: true,
          encryption: true
        }
      });

      this.currentKeyId = newKey.keyId;
      console.log(`Created new payload encryption key: ${this.currentKeyId}`);
    } catch (error) {
      console.error('Failed to ensure encryption key:', error);
      throw error;
    }
  }

  private shouldEncryptEndpoint(endpoint: string): boolean {
    // Check required endpoints
    for (const required of this.config.requiredForEndpoints) {
      if (endpoint.includes(required) || endpoint.match(new RegExp(required))) {
        return true;
      }
    }

    // Check optional endpoints
    for (const optional of this.config.optionalForEndpoints) {
      if (endpoint.includes(optional) || endpoint.match(new RegExp(optional))) {
        return true;
      }
    }

    return false;
  }

  private validateEncryptedPayload(payload: EncryptedPayload): void {
    if (!payload.data || !payload.iv || !payload.keyId || !payload.algorithm || !payload.timestamp) {
      throw new Error('Invalid encrypted payload structure');
    }

    if (!['aes-256-gcm', 'aes-256-cbc', 'chacha20-poly1305'].includes(payload.algorithm)) {
      throw new Error(`Unsupported encryption algorithm: ${payload.algorithm}`);
    }

    if (payload.algorithm.includes('gcm') && !payload.authTag) {
      throw new Error('Authentication tag required for GCM mode');
    }
  }

  private getKeyLength(): number {
    switch (this.config.algorithm) {
    case 'aes-256-gcm':
    case 'aes-256-cbc':
      return 256;
    case 'chacha20-poly1305':
      return 256;
    default:
      return 256;
    }
  }

  private getIVLength(): number {
    switch (this.config.algorithm) {
    case 'aes-256-gcm':
      return 12; // 96 bits recommended for GCM
    case 'aes-256-cbc':
      return 16; // 128 bits for CBC
    case 'chacha20-poly1305':
      return 12; // 96 bits for ChaCha20
    default:
      return 16;
    }
  }
}

// Default configuration
export const defaultPayloadEncryptionConfig: PayloadEncryptionConfig = {
  enabled: process.env.PAYLOAD_ENCRYPTION_ENABLED !== 'false',
  algorithm: (process.env.PAYLOAD_ENCRYPTION_ALGORITHM as any) || 'aes-256-gcm',
  keyRotationDays: parseInt(process.env.PAYLOAD_KEY_ROTATION_DAYS || '90'),
  maxPayloadSize: parseInt(process.env.PAYLOAD_MAX_SIZE || '10485760'), // 10MB
  compressionEnabled: process.env.PAYLOAD_COMPRESSION_ENABLED !== 'false',
  keyDerivationIterations: parseInt(process.env.PAYLOAD_KDF_ITERATIONS || '100000'),
  enableMetrics: process.env.PAYLOAD_ENCRYPTION_METRICS !== 'false',
  auditAllOperations: process.env.PAYLOAD_ENCRYPTION_AUDIT !== 'false',
  requiredForEndpoints: [
    '/auth/login',
    '/auth/register',
    '/auth/password-reset',
    '/api/marketplace/purchase',
    '/api/marketplace/payment',
    '/api/auth/verification',
    '/api/auth/totp',
    '/api/security/keys',
    '/api/security/rotation'
  ],
  optionalForEndpoints: [
    '/preview',
    '/api/corrections',
    '/api/workspace',
    '/api/analytics'
  ]
};

// Request encryption middleware
export function requestEncryptionMiddleware(
  payloadEncryptionService: PayloadEncryptionService
) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Skip if encryption is disabled
      if (!defaultPayloadEncryptionConfig.enabled) {
        return;
      }

      // Check if this endpoint requires encryption
      const endpoint = request.url;
      const requiresEncryption = defaultPayloadEncryptionConfig.requiredForEndpoints.some(
        pattern => endpoint.includes(pattern) || endpoint.match(new RegExp(pattern))
      );

      if (!requiresEncryption) {
        return;
      }

      // Check for encrypted payload header
      const isEncrypted = request.headers['x-payload-encrypted'] === 'true';
      
      if (isEncrypted && request.body) {
        try {
          // Decrypt the payload
          const encryptedPayload = request.body as EncryptedPayload;
          const decryptedPayload = await payloadEncryptionService.decryptPayload(encryptedPayload);
          
          // Replace the request body with decrypted data
          request.body = decryptedPayload;
          
          // Add decryption metadata to request
          (request as any).payloadDecrypted = true;
          (request as any).originalKeyId = encryptedPayload.keyId;
        } catch (error) {
          console.error('Request decryption failed:', error);
          reply.code(400).send({
            error: 'Invalid encrypted payload',
            message: 'Failed to decrypt request payload'
          });
          return;
        }
      } else if (requiresEncryption) {
        // Endpoint requires encryption but payload is not encrypted
        reply.code(400).send({
          error: 'Encryption required',
          message: 'This endpoint requires encrypted payloads',
          encryptionInfo: {
            algorithm: defaultPayloadEncryptionConfig.algorithm,
            compressionSupported: defaultPayloadEncryptionConfig.compressionEnabled
          }
        });
        return;
      }
    } catch (error) {
      console.error('Request encryption middleware error:', error);
      reply.code(500).send({
        error: 'Encryption middleware error',
        message: 'Failed to process request encryption'
      });
    }
  };
}

// Response encryption middleware
export function responseEncryptionMiddleware(
  payloadEncryptionService: PayloadEncryptionService
) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Skip if encryption is disabled
      if (!defaultPayloadEncryptionConfig.enabled) {
        return;
      }

      // Check if client requested encrypted response
      const wantsEncryption = request.headers['x-response-encryption'] === 'true';
      const endpoint = request.url;
      
      const supportsEncryption = [
        ...defaultPayloadEncryptionConfig.requiredForEndpoints,
        ...defaultPayloadEncryptionConfig.optionalForEndpoints
      ].some(pattern => endpoint.includes(pattern) || endpoint.match(new RegExp(pattern)));

      if (wantsEncryption && supportsEncryption) {
        // Hook into the response to encrypt it
        const originalSend = reply.send.bind(reply);
        
        reply.send = function(payload: unknown) {
          // Only encrypt non-error responses
          if (reply.statusCode >= 200 && reply.statusCode < 300 && payload) {
            payloadEncryptionService.encryptPayload(payload, endpoint)
              .then(encryptedPayload => {
                reply.header('x-payload-encrypted', 'true');
                reply.header('x-encryption-algorithm', encryptedPayload.algorithm);
                reply.header('x-encryption-key-id', encryptedPayload.keyId);
                originalSend(encryptedPayload);
  }
              .catch(error => {
                console.error('Response encryption failed:', error);
                // Fall back to unencrypted response
                originalSend(payload);
              });
          } else {
            originalSend(payload);
          }
        };
      }
    } catch (error) {
      console.error('Response encryption middleware error:', error);
      // Don't fail the request for response encryption errors
    }
  };
}

// Encryption status middleware - adds encryption capabilities to responses
export function encryptionStatusMiddleware() {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (defaultPayloadEncryptionConfig.enabled) {
      reply.header('x-encryption-available', 'true');
      reply.header('x-encryption-algorithms', 'aes-256-gcm,aes-256-cbc,chacha20-poly1305');
      reply.header('x-compression-available', defaultPayloadEncryptionConfig.compressionEnabled.toString());
    }
  };
}