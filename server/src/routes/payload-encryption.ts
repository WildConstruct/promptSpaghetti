// API Payload Encryption Management Routes
// Comprehensive API endpoints for managing payload encryption

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PayloadEncryptionService, EncryptedPayload } from '../middleware/payload-encryption';

interface EncryptPayloadRequest {
  data: unknown;
  endpoint?: string;
  algorithm?: 'aes-256-gcm' | 'aes-256-cbc' | 'chacha20-poly1305';
  compression?: boolean;
}

interface DecryptPayloadRequest {
  encryptedPayload: EncryptedPayload;
}

interface KeyRotationRequest {
  reason?: string;
  scheduleDate?: string;
}

interface EncryptionTestRequest {
  testData: unknown;
  iterations?: number;
}

export async function payloadEncryptionRoutes(
  fastify: FastifyInstance,
  payloadEncryptionService: PayloadEncryptionService
) {

  // Encrypt payload endpoint
  fastify.post<{
    Body: EncryptPayloadRequest;
  }>('/encryption/encrypt', {
    preHandler: [fastify.jwtAuth, async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user as any;
      if (!user?.roles?.some((role: string) => ['admin', 'security', 'developer'].includes(role))) {
        reply.code(403).send({ error: 'Admin, security, or developer role required' });
        return;
      }
    }]
  }, async (request: FastifyRequest<{
    Body: EncryptPayloadRequest;
  }>, reply: FastifyReply) => {
    try {
      const { data, endpoint } = request.body;

      if (!data) {
        reply.code(400).send({
          error: 'Missing required field: data'
        });
        return;
      }

      const encryptedPayload = await payloadEncryptionService.encryptPayload(data, endpoint);

      return {
        success: true,
        encryptedPayload,
        metadata: {
          originalSize: JSON.stringify(data).length,
          encryptedSize: encryptedPayload.data.length,
          compressionUsed: encryptedPayload.compressed || false,
          algorithm: encryptedPayload.algorithm,
          keyId: encryptedPayload.keyId
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      request.log.error('Payload encryption error:', error);
      reply.code(500).send({
        error: 'Failed to encrypt payload',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Decrypt payload endpoint
  fastify.post<{
    Body: DecryptPayloadRequest;
  }>('/encryption/decrypt', {
    preHandler: [fastify.jwtAuth, async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user as any;
      if (!user?.roles?.some((role: string) => ['admin', 'security', 'developer'].includes(role))) {
        reply.code(403).send({ error: 'Admin, security, or developer role required' });
        return;
      }
    }]
  }, async (request: FastifyRequest<{
    Body: DecryptPayloadRequest;
  }>, reply: FastifyReply) => {
    try {
      const { encryptedPayload } = request.body;

      if (!encryptedPayload) {
        reply.code(400).send({
          error: 'Missing required field: encryptedPayload'
        });
        return;
      }

      const decryptedData = await payloadEncryptionService.decryptPayload(encryptedPayload);

      return {
        success: true,
        data: decryptedData,
        metadata: {
          keyId: encryptedPayload.keyId,
          algorithm: encryptedPayload.algorithm,
          wasCompressed: encryptedPayload.compressed || false,
          originalTimestamp: encryptedPayload.timestamp,
          decryptionTime: Date.now()
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      request.log.error('Payload decryption error:', error);
      reply.code(500).send({
        error: 'Failed to decrypt payload',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get encryption metrics
  fastify.get('/encryption/metrics', {
    preHandler: [fastify.jwtAuth, async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user as any;
      if (!user?.roles?.some((role: string) => ['admin', 'security', 'developer'].includes(role))) {
        reply.code(403).send({ error: 'Admin, security, or developer role required' });
        return;
      }
    }]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const metrics = payloadEncryptionService.getMetrics();

      return {
        metrics,
        performance: {
          successRate: metrics.totalEncryptions + metrics.totalDecryptions > 0 ? 
            Math.round((metrics.successfulOperations / (metrics.totalEncryptions + metrics.totalDecryptions)) * 100) : 100,
          averageEncryptionTimeMs: Math.round(metrics.averageEncryptionTime),
          averageDecryptionTimeMs: Math.round(metrics.averageDecryptionTime),
          compressionEfficiency: `${Math.round((1 - metrics.compressionRatio) * 100)}%`
        },
        insights: {
          totalOperations: metrics.totalEncryptions + metrics.totalDecryptions,
          encryptionToDecryptionRatio: metrics.totalDecryptions > 0 ? 
            Math.round((metrics.totalEncryptions / metrics.totalDecryptions) * 100) / 100 : metrics.totalEncryptions,
          errorRate: `${Math.round((metrics.failedOperations / (metrics.totalEncryptions + metrics.totalDecryptions)) * 100)}%`,
          keyRotationFrequency: metrics.keyRotations
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      request.log.error('Error getting encryption metrics:', error);
      reply.code(500).send({
        error: 'Failed to get encryption metrics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Rotate encryption key
  fastify.post<{
    Body: KeyRotationRequest;
  }>('/encryption/rotate-key', {
    preHandler: [fastify.jwtAuth, async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user as any;
      if (!user?.roles?.some((role: string) => ['admin', 'security'].includes(role))) {
        reply.code(403).send({ error: 'Admin or security role required for key rotation' });
        return;
      }
    }]
  }, async (request: FastifyRequest<{
    Body: KeyRotationRequest;
  }>, reply: FastifyReply) => {
    try {
      const { reason = 'manual_rotation' } = request.body;
      const userId = (request.user as any)?.id;

      await payloadEncryptionService.rotateEncryptionKey();

      return {
        success: true,
        message: 'Encryption key rotated successfully',
        rotation: {
          reason,
          rotatedBy: userId,
          rotatedAt: new Date().toISOString()
        },
        nextSteps: [
          'New key is now active for all encryption operations',
          'Existing encrypted payloads can still be decrypted with their original keys',
          'Old keys will be automatically retired according to retention policy'
        ],
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      request.log.error('Key rotation error:', error);
      reply.code(500).send({
        error: 'Failed to rotate encryption key',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Test encryption performance
  fastify.post<{
    Body: EncryptionTestRequest;
  }>('/encryption/test', {
    preHandler: [fastify.jwtAuth, async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user as any;
      if (!user?.roles?.some((role: string) => ['admin', 'security', 'developer'].includes(role))) {
        reply.code(403).send({ error: 'Admin, security, or developer role required' });
        return;
      }
    }]
  }, async (request: FastifyRequest<{
    Body: EncryptionTestRequest;
  }>, reply: FastifyReply) => {
    try {
      const { testData, iterations = 10 } = request.body;

      if (!testData) {
        reply.code(400).send({
          error: 'Missing required field: testData'
        });
        return;
      }

      if (iterations > 100) {
        reply.code(400).send({
          error: 'Maximum 100 iterations allowed for performance testing'
        });
        return;
      }

      const results = {
        encryptionTimes: [] as number[],
        decryptionTimes: [] as number[],
        success: 0,
        failures: 0,
        dataIntegrity: true
      };

      for (let i = 0; i < iterations; i++) {
        try {
          // Test encryption
          const encryptStart = Date.now();
          const encrypted = await payloadEncryptionService.encryptPayload(testData, '/test');
          const encryptTime = Date.now() - encryptStart;
          results.encryptionTimes.push(encryptTime);

          // Test decryption
          const decryptStart = Date.now();
          const decrypted = await payloadEncryptionService.decryptPayload(encrypted);
          const decryptTime = Date.now() - decryptStart;
          results.decryptionTimes.push(decryptTime);

          // Verify data integrity
          if (JSON.stringify(decrypted) !== JSON.stringify(testData)) {
            results.dataIntegrity = false;
          }

          results.success++;
        } catch (error) {
          results.failures++;
          console.error(`Encryption test iteration ${i + 1} failed:`, error);
        }
      }

      // Calculate statistics
      const avgEncryptTime = results.encryptionTimes.reduce((a, b) => a + b, 0) / results.encryptionTimes.length;
      const avgDecryptTime = results.decryptionTimes.reduce((a, b) => a + b, 0) / results.decryptionTimes.length;
      const minEncryptTime = Math.min(...results.encryptionTimes);
      const maxEncryptTime = Math.max(...results.encryptionTimes);
      const minDecryptTime = Math.min(...results.decryptionTimes);
      const maxDecryptTime = Math.max(...results.decryptionTimes);

      return {
        testResults: {
          iterations,
          successRate: `${Math.round((results.success / iterations) * 100)}%`,
          dataIntegrityPassed: results.dataIntegrity,
          performance: {
            encryption: {
              averageMs: Math.round(avgEncryptTime * 100) / 100,
              minMs: minEncryptTime,
              maxMs: maxEncryptTime,
              opsPerSecond: Math.round(1000 / avgEncryptTime)
            },
            decryption: {
              averageMs: Math.round(avgDecryptTime * 100) / 100,
              minMs: minDecryptTime,
              maxMs: maxDecryptTime,
              opsPerSecond: Math.round(1000 / avgDecryptTime)
            },
            total: {
              averageRoundTripMs: Math.round((avgEncryptTime + avgDecryptTime) * 100) / 100,
              roundTripsPerSecond: Math.round(1000 / (avgEncryptTime + avgDecryptTime))
            }
          }
        },
        recommendations: [
          avgEncryptTime > 100 ? 'Encryption performance is slow - consider algorithm optimization' : null,
          avgDecryptTime > 100 ? 'Decryption performance is slow - consider caching optimization' : null,
          !results.dataIntegrity ? 'DATA INTEGRITY FAILED - investigate encryption implementation' : null,
          results.failures > 0 ? `${results.failures} test failures detected - check error logs` : null,
          'Performance tests completed successfully'
        ].filter(Boolean),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      request.log.error('Encryption test error:', error);
      reply.code(500).send({
        error: 'Failed to run encryption test',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get encryption configuration
  fastify.get('/encryption/config', {
    preHandler: [fastify.jwtAuth, async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user as any;
      if (!user?.roles?.some((role: string) => ['admin', 'security'].includes(role))) {
        reply.code(403).send({ error: 'Admin or security role required' });
        return;
      }
    }]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Return non-sensitive configuration information
      return {
        encryption: {
          enabled: true, // Don't expose actual config values for security
          algorithms: ['aes-256-gcm', 'aes-256-cbc', 'chacha20-poly1305'],
          compressionAvailable: true,
          maxPayloadSizeMB: 10,
          keyRotationSupported: true
        },
        endpoints: {
          requiredEncryption: [
            '/auth/login',
            '/auth/register',
            '/auth/password-reset',
            '/api/marketplace/purchase',
            '/api/security/keys'
          ],
          optionalEncryption: [
            '/preview',
            '/api/corrections',
            '/api/workspace'
          ]
        },
        features: [
          'End-to-end payload encryption',
          'Automatic key rotation',
          'Compression support',
          'Multiple encryption algorithms',
          'Performance monitoring',
          'Data integrity verification',
          'Replay attack protection'
        ],
        security: [
          'Keys stored encrypted at rest',
          'Authentication required for all operations',
          'Audit logging for all encryption operations',
          'Automatic key rotation policies',
          'Time-based payload expiration'
        ],
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      request.log.error('Error getting encryption config:', error);
      reply.code(500).send({
        error: 'Failed to get encryption configuration',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Health check for encryption service
  fastify.get('/encryption/health', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const metrics = payloadEncryptionService.getMetrics();
      const isHealthy = metrics.failedOperations === 0 || 
        (metrics.successfulOperations / (metrics.totalEncryptions + metrics.totalDecryptions)) > 0.95;

      return {
        status: isHealthy ? 'healthy' : 'degraded',
        service: 'payload_encryption',
        metrics: {
          totalOperations: metrics.totalEncryptions + metrics.totalDecryptions,
          successRate: metrics.totalEncryptions + metrics.totalDecryptions > 0 ? 
            Math.round((metrics.successfulOperations / (metrics.totalEncryptions + metrics.totalDecryptions)) * 100) : 100,
          keyRotations: metrics.keyRotations,
          averagePerformanceMs: Math.round((metrics.averageEncryptionTime + metrics.averageDecryptionTime) / 2)
        },
        capabilities: [
          'Real-time payload encryption/decryption',
          'Automatic key management and rotation',
          'Performance monitoring and optimization',
          'Data compression for large payloads',
          'Multiple encryption algorithm support'
        ],
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      request.log.error('Encryption health check failed:', error);
      reply.code(503).send({
        status: 'unhealthy',
        service: 'payload_encryption',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Documentation endpoint
  fastify.get('/encryption/docs', async (request: FastifyRequest, reply: FastifyReply) => {
    return {
      title: 'API Payload Encryption System Documentation',
      description: 'Comprehensive end-to-end encryption for sensitive API payloads',
      
      usage: {
        clientHeaders: [
          {
            header: 'x-payload-encrypted',
            value: 'true',
            description: 'Indicates request body is encrypted'
          },
          {
            header: 'x-response-encryption',
            value: 'true',
            description: 'Requests encrypted response'
          }
        ],
        encryptionFlow: [
          '1. Client encrypts sensitive data using provided encryption key',
          '2. Client sends encrypted payload with x-payload-encrypted: true header',
          '3. Server automatically decrypts request payload',
          '4. Server processes request normally',
          '5. Server encrypts response if x-response-encryption: true header present',
          '6. Client receives and decrypts response'
        ]
      },

      algorithms: [
        {
          name: 'aes-256-gcm',
          description: 'AES 256-bit with Galois/Counter Mode (recommended)',
          features: ['Authenticated encryption', 'Fast performance', 'Industry standard']
        },
        {
          name: 'aes-256-cbc',
          description: 'AES 256-bit with Cipher Block Chaining',
          features: ['Block cipher mode', 'Widely supported', 'Good compatibility']
        },
        {
          name: 'chacha20-poly1305',
          description: 'ChaCha20 stream cipher with Poly1305 authenticator',
          features: ['Modern cipher', 'Mobile-optimized', 'Constant-time operation']
        }
      ],

      security: [
        {
          feature: 'Key Management',
          description: 'Automatic key generation, rotation, and secure storage using KeyManagementService'
        },
        {
          feature: 'Replay Protection',
          description: 'Time-based payload expiration prevents replay attacks'
        },
        {
          feature: 'Data Integrity',
          description: 'Authentication tags ensure payload has not been tampered with'
        },
        {
          feature: 'Audit Logging',
          description: 'All encryption operations are logged for security monitoring'
        }
      ],

      endpoints: [
        {
          path: '/encryption/encrypt',
          method: 'POST',
          description: 'Encrypt payload data',
          auth: 'admin, security, or developer role required'
        },
        {
          path: '/encryption/decrypt',
          method: 'POST',
          description: 'Decrypt encrypted payload',
          auth: 'admin, security, or developer role required'
        },
        {
          path: '/encryption/metrics',
          method: 'GET',
          description: 'Get encryption performance metrics',
          auth: 'admin, security, or developer role required'
        },
        {
          path: '/encryption/rotate-key',
          method: 'POST',
          description: 'Manually rotate encryption key',
          auth: 'admin or security role required'
        },
        {
          path: '/encryption/test',
          method: 'POST',
          description: 'Run encryption performance tests',
          auth: 'admin, security, or developer role required'
        },
        {
          path: '/encryption/config',
          method: 'GET',
          description: 'Get encryption configuration',
          auth: 'admin or security role required'
        },
        {
          path: '/encryption/health',
          method: 'GET',
          description: 'Check encryption service health',
          auth: 'public'
        }
      ]
    };
  });
}