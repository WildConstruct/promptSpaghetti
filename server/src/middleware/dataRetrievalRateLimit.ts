/**
 * Data Retrieval Rate Limiting Middleware
 * 
 * Fastify middleware that integrates the data retrieval rate limiting system
 * with the existing data access routes and provides comprehensive rate limiting
 * for all data operations.
 * 
 * Part of Epic 19 - Data Protection & Privacy Controls
 * Task: T-1752989143998-95 - Add rate limiting for data retrieval
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import {
  DataRetrievalRateLimit,
  DataRequestDetails,
  DataRetrievalDecision
} from '../../../packages/core/security/DataRetrievalRateLimit';
import {
  DataRetrievalConfigurationFactory
} from '../../../packages/core/security/DataRetrievalConfiguration';
import { RateLimitingService } from '../../../packages/core/security/RateLimitingService';
import {
  SubjectAttributes,
  ObjectAttributes,
  DataOperation,
  DataClassificationLevel
} from '../../../packages/core/security/DataClassificationAccessControl';

interface DataRetrievalRateLimitOptions {
  environment: 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION';
  enableLogging?: boolean;
  enableMetrics?: boolean;
  customConfig?: Record<string, unknown>;
}

interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    id: string;
    email: string;
    roles: string[];
    clearanceLevel?: DataClassificationLevel;
    department?: string;
    riskScore?: number;
  };
}

declare module 'fastify' {
  interface FastifyInstance {
    dataRetrievalRateLimit: DataRetrievalRateLimit;
  }
}

/**
 * Extract subject attributes from authenticated request
 */
function extractSubjectAttributes(request: AuthenticatedRequest): SubjectAttributes {
  const user = request.user;
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Extract device information from headers
  const deviceInfo = {
    deviceId: request.headers['x-device-id'] as string || 'unknown',
    deviceType: getDeviceTypeFromUserAgent(request.headers['user-agent'] || ''),
    operatingSystem: getOSFromUserAgent(request.headers['user-agent'] || ''),
    browser: getBrowserFromUserAgent(request.headers['user-agent'] || ''),
    managed: request.headers['x-device-managed'] === 'true',
    encrypted: request.headers['x-device-encrypted'] === 'true',
    patchLevel: request.headers['x-device-patch-level'] as string || 'unknown',
    riskScore: parseInt(request.headers['x-device-risk-score'] as string) || 20,
    registered: request.headers['x-device-registered'] === 'true',
    lastSeen: new Date()
  };

  // Extract location information
  const location = {
    country: request.headers['x-user-country'] as string || 'US',
    region: request.headers['x-user-region'] as string || 'Unknown',
    city: request.headers['x-user-city'] as string || 'Unknown',
    timezone: request.headers['x-user-timezone'] as string || 'UTC',
    withinApprovedRegions: request.headers['x-approved-region'] !== 'false'
  };

  // Basic behavior profile
  const behaviorProfile = {
    normalAccessPatterns: [],
    anomalyScore: parseInt(request.headers['x-anomaly-score'] as string) || 0,
    typicalHours: [9, 10, 11, 12, 13, 14, 15, 16, 17], // Default business hours
    typicalLocations: [location.city],
    accessFrequency: 'MEDIUM' as const,
    dataAccessPatterns: {} as any
  };

  return {
    userId: user.id,
    roles: user.roles,
    clearanceLevel: user.clearanceLevel || 'INTERNAL',
    department: user.department || 'Unknown',
    jobTitle: request.headers['x-user-job-title'] as string || 'Unknown',
    location,
    device: deviceInfo,
    behaviorProfile,
    riskScore: user.riskScore || 20,
    certifications: [],
    lastActivity: new Date(),
    mfaVerified: request.headers['x-mfa-verified'] === 'true',
    trustLevel: calculateTrustLevel(deviceInfo, location, user.riskScore || 20)
  };
}

/**
 * Extract object attributes from request
 */
function extractObjectAttributes(request: FastifyRequest): ObjectAttributes {
  const resourceId = (request.params as any)?.resourceId || 
                    (request.body as any)?.resourceId ||
                    'unknown';
  
  const resourceType = (request.query as any)?.resourceType ||
                      (request.body as any)?.resourceType ||
                      'document';

  // Try to get classification from headers or default to INTERNAL
  const classification = request.headers['x-data-classification'] as DataClassificationLevel || 'INTERNAL';

  return {
    dataId: resourceId,
    classification,
    dataOwner: request.headers['x-data-owner'] as string || 'unknown',
    createdAt: new Date(),
    lastModified: new Date(),
    retentionPeriod: 365,
    complianceFrameworks: ['GDPR'],
    tags: [],
    sensitivity: 'NORMAL',
    businessValue: 'MEDIUM',
    dataType: resourceType,
    sourceSystem: request.headers['x-source-system'] as string || 'api',
    encryptionStatus: 'ENCRYPTED'
  };
}

/**
 * Extract request details for rate limiting
 */
function extractRequestDetails(request: FastifyRequest, operation: DataOperation): DataRequestDetails {
  // Estimate bytes based on request type and headers
  const estimatedBytes = parseInt(request.headers['x-estimated-bytes'] as string) || 
                        estimateRequestSize(request, operation);
  
  const estimatedRecords = parseInt(request.headers['x-estimated-records'] as string) ||
                          estimateRecordCount(request, operation);

  return {
    operation,
    estimatedBytes,
    estimatedRecords,
    requestType: determineBatchType(request),
    context: {
      sessionId: request.headers['x-session-id'] as string,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
      purpose: request.headers['x-access-purpose'] as string || 'general',
      endpoint: request.url,
      method: request.method
    }
  };
}

/**
 * Determine operation from request path and method
 */
function determineOperation(request: FastifyRequest): DataOperation {
  const method = request.method.toUpperCase();
  const path = request.url.toLowerCase();

  // Map HTTP methods and paths to data operations
  if (path.includes('/export')) return 'EXPORT';
  if (path.includes('/share')) return 'SHARE';
  if (path.includes('/search')) return 'SEARCH';
  if (path.includes('/audit')) return 'AUDIT';
  if (path.includes('/backup')) return 'BACKUP';
  if (path.includes('/restore')) return 'RESTORE';
  if (path.includes('/archive')) return 'ARCHIVE';
  if (path.includes('/purge')) return 'PURGE';

  switch (method) {
  case 'GET':
    return 'read';
  case 'POST':
    return path.includes('/request') ? 'APPROVE' : 'WRITE';
  case 'PUT':
  case 'PATCH':
    return 'UPDATE';
  case 'DELETE':
    return 'DELETE';
  default:
    return 'read';
  }
}

/**
 * Create the data retrieval rate limiting middleware
 */
async function dataRetrievalRateLimitMiddleware(
  fastify: FastifyInstance,
  options: DataRetrievalRateLimitOptions
) {
  // Initialize the rate limiting service and configuration
  const rateLimitingService = new RateLimitingService({
    strategy: 'SLIDING_WINDOW',
    windowSize: 60,
    maxRequests: 100,
    backoffStrategy: 'EXPONENTIAL',
    exemptionsEnabled: true,
    adaptiveEnabled: true,
    threatDetectionEnabled: true
  });

  const config = DataRetrievalConfigurationFactory.createConfiguration(
    options.environment,
    options.customConfig
  );

  const dataRetrievalRateLimit = new DataRetrievalRateLimit(
    rateLimitingService,
    config
  );

  // Register the service with Fastify
  fastify.decorate('dataRetrievalRateLimit', dataRetrievalRateLimit);

  // Add event listeners for monitoring
  if (options.enableLogging) {
    dataRetrievalRateLimit.on('anomalyDetected', (event) => {
      fastify.log.warn('Data access anomaly detected', {
        userId: event.userId,
        anomaly: event.anomaly,
        timestamp: event.timestamp
      });
    });

    dataRetrievalRateLimit.on('quotaExceeded', (event) => {
      fastify.log.warn('User quota exceeded', event);
    });

    dataRetrievalRateLimit.on('exemptionUsed', (event) => {
      fastify.log.info('Rate limit exemption used', event);
    });
  }

  // Create the middleware hook
  fastify.addHook('preHandler', async (request: AuthenticatedRequest, reply: FastifyReply) => {
    // Skip rate limiting for health checks and non-data endpoints
    if (isExcludedPath(request.url)) {
      return;
    }

    // Skip if user is not authenticated (let auth middleware handle it)
    if (!request.user) {
      return;
    }

    try {
      const startTime = Date.now();
      
      // Extract request information
      const subject = extractSubjectAttributes(request);
      const object = extractObjectAttributes(request);
      const operation = determineOperation(request);
      const requestDetails = extractRequestDetails(request, operation);

      // Check rate limits
      const decision = await dataRetrievalRateLimit.checkDataRetrievalLimit(
        subject,
        object,
        operation,
        requestDetails
      );

      const processingTime = Date.now() - startTime;

      // Add timing headers for monitoring
      reply.header('X-Rate-Limit-Processing-Time', processingTime.toString());
      
      if (decision.decision === 'DENY') {
        // Add rate limiting headers
        reply.header('X-Rate-Limit-Remaining', '0');
        reply.header('X-Rate-Limit-Reset', decision.retryAfter?.toString() || '60');
        
        // Log the rate limit violation
        fastify.log.warn('Data access rate limited', {
          userId: subject.userId,
          operation,
          reason: decision.reason,
          retryAfter: decision.retryAfter
        });

        // Return rate limit error
        return reply.code(429).send({
          error: 'Rate Limit Exceeded',
          message: decision.reason,
          retryAfter: decision.retryAfter,
          quotaRemaining: decision.quotaRemaining
        });
      } else {
        // Add success headers
        if (decision.quotaRemaining) {
          reply.header('X-Rate-Limit-Remaining-Bytes', decision.quotaRemaining.bytes.toString());
          reply.header('X-Rate-Limit-Remaining-Records', decision.quotaRemaining.records.toString());
          reply.header('X-Rate-Limit-Remaining-Requests', decision.quotaRemaining.requests.toString());
        }

        // Add warnings if present
        if (decision.warnings && decision.warnings.length > 0) {
          reply.header('X-Rate-Limit-Warnings', decision.warnings.join('; '));
        }

        // Log successful access with metrics
        if (options.enableLogging) {
          fastify.log.debug('Data access allowed', {
            userId: subject.userId,
            operation,
            classification: object.classification,
            processingTime,
            quotaUsed: {
              bytes: requestDetails.estimatedBytes,
              records: requestDetails.estimatedRecords
            }
          });
        }
      }

    } catch (error) {
      fastify.log.error('Error in data retrieval rate limiting middleware', {
        error: error.message,
        stack: error.stack,
        url: request.url,
        method: request.method,
        userId: request.user?.id
      });

      // Fail closed - deny access on error
      return reply.code(503).send({
        error: 'Service Unavailable',
        message: 'Rate limiting service temporarily unavailable'
      });
    }
  });

  // Add metrics endpoint if enabled
  if (options.enableMetrics) {
    fastify.get('/metrics/data-retrieval-rate-limit', {
      schema: {
        response: {
          200: {
            type: 'object',
            properties: {
              totalRequests: { type: 'number' },
              totalBytesTransferred: { type: 'number' },
              totalRecordsAccessed: { type: 'number' },
              rateLimitedRequests: { type: 'number' },
              averageRequestSize: { type: 'number' },
              classificationBreakdown: {
                type: 'object',
                properties: {
                  PUBLIC: { type: 'number' },
                  INTERNAL: { type: 'number' },
                  CONFIDENTIAL: { type: 'number' },
                  RESTRICTED: { type: 'number' }
                }
              }
            }
          }
        }
      }
    }, async (request, reply) => {
      const metrics = dataRetrievalRateLimit.getMetrics();
      reply.send(metrics);
    });
  }
}

// Helper functions
function isExcludedPath(url: string): boolean {
  const excludedPaths = [
    '/health',
    '/metrics',
    '/ping',
    '/status',
    '/favicon.ico'
  ];
  
  return excludedPaths.some(path => url.startsWith(path));
}

function getDeviceTypeFromUserAgent(userAgent: string): 'DESKTOP' | 'LAPTOP' | 'MOBILE' | 'TABLET' | 'SERVER' {
  const ua = userAgent.toLowerCase();
  if (ua.includes('mobile')) return 'MOBILE';
  if (ua.includes('tablet') || ua.includes('ipad')) return 'TABLET';
  if (ua.includes('server')) return 'SERVER';
  return 'DESKTOP'; // Default assumption
}

function getOSFromUserAgent(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  if (ua.includes('windows')) return 'Windows';
  if (ua.includes('mac') || ua.includes('osx')) return 'macOS';
  if (ua.includes('linux')) return 'Linux';
  if (ua.includes('android')) return 'Android';
  if (ua.includes('ios')) return 'iOS';
  return 'Unknown';
}

function getBrowserFromUserAgent(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  if (ua.includes('chrome')) return 'Chrome';
  if (ua.includes('firefox')) return 'Firefox';
  if (ua.includes('safari') && !ua.includes('chrome')) return 'Safari';
  if (ua.includes('edge')) return 'Edge';
  return 'Unknown';
}

function calculateTrustLevel(
  device: Record<string, unknown>,
  location: Record<string, unknown>,
  riskScore: number
): 'LOW' | 'MEDIUM' | 'HIGH' | 'MAXIMUM' {
  let score = 100;
  
  if (!device.managed) score -= 30;
  if (!device.encrypted) score -= 20;
  if (device.riskScore > 50) score -= 25;
  if (!location.withinApprovedRegions) score -= 20;
  if (riskScore > 50) score -= (riskScore - 50);

  if (score >= 80) return 'MAXIMUM';
  if (score >= 60) return 'HIGH';
  if (score >= 40) return 'MEDIUM';
  return 'LOW';
}

function estimateRequestSize(request: FastifyRequest, operation: DataOperation): number {
  // Base estimates in bytes
  const baseEstimates = {
    'read': 1024,
    'WRITE': 2048,
    'UPDATE': 1536,
    'DELETE': 512,
    'EXPORT': 10485760, // 10MB
    'SHARE': 5242880,   // 5MB
    'SEARCH': 4096,
    'AUDIT': 2048,
    'BACKUP': 52428800, // 50MB
    'RESTORE': 52428800, // 50MB
    'ARCHIVE': 20971520, // 20MB
    'PURGE': 1024
  } as const;

  const baseSize = baseEstimates[operation] || 1024;
  
  // Adjust based on request body size if available
  const bodySize = request.headers['content-length'] ? 
    parseInt(request.headers['content-length']) : 0;
  
  return Math.max(baseSize, bodySize);
}

function estimateRecordCount(request: FastifyRequest, operation: DataOperation): number {
  // Base estimates for record counts
  const baseEstimates = {
    'read': 1,
    'WRITE': 1,
    'UPDATE': 1,
    'DELETE': 1,
    'EXPORT': 100,
    'SHARE': 50,
    'SEARCH': 20,
    'AUDIT': 10,
    'BACKUP': 1000,
    'RESTORE': 1000,
    'ARCHIVE': 500,
    'PURGE': 1
  } as const;

  // Check for hints in query parameters or headers
  const limit = (request.query as any)?.limit;
  if (limit && !isNaN(parseInt(limit))) {
    return Math.min(parseInt(limit), 1000); // Cap at 1000
  }

  return baseEstimates[operation] || 1;
}

function determineBatchType(request: FastifyRequest): 'SINGLE' | 'BATCH' | 'STREAM' {
  const query = request.query as any;
  const headers = request.headers;
  
  if (headers['x-request-type'] === 'stream') return 'STREAM';
  if (query?.batch === 'true' || headers['x-batch-request'] === 'true') return 'BATCH';
  
  // Check if request appears to be for multiple items
  const limit = query?.limit ? parseInt(query.limit) : 1;
  if (limit > 1) return 'BATCH';
  
  return 'SINGLE';
}

// Export as Fastify plugin
export default fp(dataRetrievalRateLimitMiddleware, {
  name: 'data-retrieval-rate-limit',
  fastify: '4.x'
});