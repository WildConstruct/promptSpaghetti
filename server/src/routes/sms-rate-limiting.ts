/**
 * SMS Rate Limiting API Routes
 * 
 * REST API endpoints for SMS rate limiting service management and monitoring.
 * Part of Epic 19 - Data Protection & Privacy Controls
 */

import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import SMSRateLimitingService, { 
  SMSMessage, 
  SMSMessageType, 
  RateLimitConfig,
  RateLimitScope,
  RateLimitAlgorithm
} from '../services/SMSRateLimitingService';

}
interface SendSMSBody {
  to: string;
  message: string;
  type: SMSMessageType;
  from?: string;
  userId?: string;
  tenantId?: string;
  priority?: number;
  scheduledAt?: string;
  metadata?: Record<string, any>;
}
}

}
interface BatchSendSMSBody {
  messages: SendSMSBody[];
  queueImmediate?: boolean;
}
}

}
interface UpdateConfigBody {
  configs: Array<{
    configId: string;
    config: Partial<RateLimitConfig>;
}
  }>;
}

}
interface RateLimitCheckParams {
  scope: RateLimitScope;
  identifier: string;
}
}

// Initialize the SMS rate limiting service
let smsService: SMSRateLimitingService;

/**
 * Register SMS rate limiting routes
 */
export default async function smsRateLimitingRoutes(fastify: FastifyInstance) {
  // Initialize service
  smsService = new SMSRateLimitingService();

  /**
   * POST /sms/send
   * Send a single SMS message
   */
  fastify.post<{
    Body: SendSMSBody;
  }>('/sms/send', {
    schema: {
      body: {
        type: 'object',
        properties: {
          to: { type: 'string', pattern: '^\\+?[1-9]\\d{1,14}$' }, // E.164 format
          message: { type: 'string', minLength: 1, maxLength: 1600 },
          type: {
            type: 'string',
            enum: Object.values(SMSMessageType)
  }
          from: { type: 'string' },
          userId: { type: 'string' },
          tenantId: { type: 'string' },
          priority: { type: 'number', minimum: 1, maximum: 10 },
          scheduledAt: { type: 'string', format: 'date-time' },
          metadata: { type: 'object' }
  }
        required: ['to', 'message', 'type']
  }
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            messageId: { type: 'string' },
            queuePosition: { type: 'number' },
            estimatedDeliveryTime: { type: 'string', format: 'date-time' }
  }
          required: ['success']
  }
        429: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
            rateLimitInfo: {
              type: 'object',
              properties: {
                scope: { type: 'string' },
                remainingRequests: { type: 'number' },
                resetTime: { type: 'string', format: 'date-time' },
                retryAfter: { type: 'number' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { to, message, type, from, userId, tenantId, priority, scheduledAt, metadata } = request.body;

      const smsMessage = {
        to,
        message,
        type,
        from,
        userId,
        tenantId,
        ipAddress: request.ip,
        priority,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        metadata,
        maxRetries: 3
      };

      const messageId = await smsService.queueSMS(smsMessage);
      const queueStatus = smsService.getQueueStatus();

      return {
        success: true,
        messageId,
        queuePosition: queueStatus.pending,
        estimatedDeliveryTime: new Date(Date.now() + (queueStatus.averageProcessingTime * queueStatus.pending)).toISOString()
      };

    } catch (error) {
      fastify.log.error('SMS send error:', error);
      
      if (error instanceof Error && error.message.includes('Rate limit exceeded')) {
        return reply.status(429).send({
          success: false,
          error: error.message,
          rateLimitInfo: {
            scope: 'unknown',
            remainingRequests: 0,
            resetTime: new Date(Date.now() + 60000).toISOString(),
            retryAfter: 60
          }
        });
      }

      return reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * POST /sms/send/batch
   * Send multiple SMS messages
   */
  fastify.post<{
    Body: BatchSendSMSBody;
  }>('/sms/send/batch', {
    schema: {
      body: {
        type: 'object',
        properties: {
          messages: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                to: { type: 'string', pattern: '^\\+?[1-9]\\d{1,14}$' },
                message: { type: 'string', minLength: 1, maxLength: 1600 },
                type: { type: 'string', enum: Object.values(SMSMessageType) },
                from: { type: 'string' },
                userId: { type: 'string' },
                tenantId: { type: 'string' },
                priority: { type: 'number', minimum: 1, maximum: 10 },
                scheduledAt: { type: 'string', format: 'date-time' },
                metadata: { type: 'object' }
  }
              required: ['to', 'message', 'type']
  }
            minItems: 1,
            maxItems: 100
  }
          queueImmediate: { type: 'boolean' }
  }
        required: ['messages']
  }
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            results: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  messageId: { type: 'string' },
                  success: { type: 'boolean' },
                  error: { type: 'string' }
                }
              }
  }
            summary: {
              type: 'object',
              properties: {
                total: { type: 'number' },
                queued: { type: 'number' },
                failed: { type: 'number' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { messages } = request.body;
      const results: Array<{ messageId?: string; success: boolean; error?: string }> = [];
      let queued = 0;
      let failed = 0;

      for (const msgData of messages) {
        try {
          const smsMessage = {
            ...msgData,
            ipAddress: request.ip,
            scheduledAt: msgData.scheduledAt ? new Date(msgData.scheduledAt) : undefined,
            maxRetries: 3
          };

          const messageId = await smsService.queueSMS(smsMessage);
          results.push({ messageId, success: true });
          queued++;

        } catch (error) {
          results.push({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          failed++;
        }
      }

      return {
        success: true,
        results,
        summary: {
          total: messages.length,
          queued,
          failed
        }
      };

    } catch (error) {
      fastify.log.error('Batch SMS send error:', error);
      return reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * POST /sms/send/immediate
   * Send SMS immediately (bypass queue) - for critical messages only
   */
  fastify.post<{
    Body: SendSMSBody;
  }>('/sms/send/immediate', {
    schema: {
      body: {
        type: 'object',
        properties: {
          to: { type: 'string', pattern: '^\\+?[1-9]\\d{1,14}$' },
          message: { type: 'string', minLength: 1, maxLength: 1600 },
          type: {
            type: 'string',
            enum: [SMSMessageType.SECURITY_ALERT, SMSMessageType.SYSTEM_ALERT]
  }
          from: { type: 'string' },
          userId: { type: 'string' },
          tenantId: { type: 'string' },
          metadata: { type: 'object' }
  }
        required: ['to', 'message', 'type']
      }
    }
  }, async (request, reply) => {
    try {
      const { to, message, type, from, userId, tenantId, metadata } = request.body;

      const smsMessage = {
        to,
        message,
        type,
        from,
        userId,
        tenantId,
        ipAddress: request.ip,
        metadata,
        maxRetries: 1
      };

      const success = await smsService.sendSMSImmediate(smsMessage);

      return {
        success,
        message: success ? 'SMS sent immediately' : 'Failed to send SMS'
      };

    } catch (error) {
      fastify.log.error('Immediate SMS send error:', error);
      return reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * GET /sms/queue/status
   * Get current queue status and health metrics
   */
  fastify.get('/sms/queue/status', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            status: {
              type: 'object',
              properties: {
                pending: { type: 'number' },
                processing: { type: 'number' },
                failed: { type: 'number' },
                completed: { type: 'number' },
                averageProcessingTime: { type: 'number' },
                oldestPendingAge: { type: 'number' },
                queueHealthScore: { type: 'number' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const status = smsService.getQueueStatus();
      
      return {
        success: true,
        status
      };
    } catch (error) {
      fastify.log.error('Queue status error:', error);
      return reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * GET /sms/rate-limits/stats
   * Get rate limiting statistics
   */
  fastify.get<{
    Querystring: { scope?: RateLimitScope };
  }>('/sms/rate-limits/stats', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          scope: {
            type: 'string',
            enum: Object.values(RateLimitScope)
          }
        }
  }
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            stats: { type: 'object' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { scope } = request.query;
      const stats = await smsService.getRateLimitStats(scope);
      
      return {
        success: true,
        stats
      };
    } catch (error) {
      fastify.log.error('Rate limit stats error:', error);
      return reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * PUT /sms/rate-limits/config
   * Update rate limiting configurations
   */
  fastify.put<{
    Body: UpdateConfigBody;
  }>('/sms/rate-limits/config', {
    schema: {
      body: {
        type: 'object',
        properties: {
          configs: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                configId: { type: 'string' },
                config: {
                  type: 'object',
                  properties: {
                    algorithm: { type: 'string', enum: Object.values(RateLimitAlgorithm) },
                    scope: { type: 'string', enum: Object.values(RateLimitScope) },
                    windowSizeMs: { type: 'number', minimum: 1000 },
                    maxRequests: { type: 'number', minimum: 1 },
                    burstCapacity: { type: 'number', minimum: 1 },
                    refillRate: { type: 'number', minimum: 0.1 },
                    priority: { type: 'number', minimum: 1, maximum: 10 },
                    enabled: { type: 'boolean' }
                  }
                }
  }
              required: ['configId', 'config']
            }
          }
  }
        required: ['configs']
      }
    }
  }, async (request, reply) => {
    try {
      const { configs } = request.body;
      const results: Array<{ configId: string; success: boolean; error?: string }> = [];

      for (const { configId, config } of configs) {
        try {
          smsService.updateRateLimitConfig(configId, config);
          results.push({ configId, success: true });
        } catch (error) {
          results.push({
            configId,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      return {
        success: true,
        results
      };

    } catch (error) {
      fastify.log.error('Config update error:', error);
      return reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * POST /sms/rate-limits/check
   * Check if a request would be rate limited
   */
  fastify.post<{
    Body: {
      to: string;
      type: SMSMessageType;
      userId?: string;
      tenantId?: string;
    };
  }>('/sms/rate-limits/check', {
    schema: {
      body: {
        type: 'object',
        properties: {
          to: { type: 'string' },
          type: { type: 'string', enum: Object.values(SMSMessageType) },
          userId: { type: 'string' },
          tenantId: { type: 'string' }
  }
        required: ['to', 'type']
  }
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            allowed: { type: 'boolean' },
            rateLimitResult: {
              type: 'object',
              properties: {
                allowed: { type: 'boolean' },
                reason: { type: 'string' },
                remainingRequests: { type: 'number' },
                resetTime: { type: 'string', format: 'date-time' },
                retryAfter: { type: 'number' },
                currentUsage: { type: 'number' },
                limit: { type: 'number' },
                scope: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { to, type, userId, tenantId } = request.body;

      // Create a test message for rate limit checking
      const testMessage = {
        id: 'test',
        to,
        message: 'test',
        type,
        userId,
        tenantId,
        ipAddress: request.ip,
        priority: 5,
        retryCount: 0,
        maxRetries: 1,
        createdAt: new Date()
      };

      const rateLimitResult = await smsService.checkRateLimit(testMessage);

      return {
        success: true,
        allowed: rateLimitResult.allowed,
        rateLimitResult: {
          ...rateLimitResult,
          resetTime: rateLimitResult.resetTime.toISOString()
        }
      };

    } catch (error) {
      fastify.log.error('Rate limit check error:', error);
      return reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * GET /sms/health
   * Health check endpoint for SMS service
   */
  fastify.get('/sms/health', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            status: { type: 'string' },
            uptime: { type: 'number' },
            queueHealth: { type: 'number' },
            rateLimitingActive: { type: 'boolean' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const queueStatus = smsService.getQueueStatus();
      
      return {
        success: true,
        status: 'healthy',
        uptime: process.uptime(),
        queueHealth: queueStatus.queueHealthScore,
        rateLimitingActive: true
      };
    } catch (error) {
      fastify.log.error('SMS health check error:', error);
      return reply.status(503).send({
        success: false,
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Event listeners for monitoring
  smsService.on('rate_limit_exceeded', (data) => {
    fastify.log.warn('Rate limit exceeded:', data);
  });

  smsService.on('message_failed', (data) => {
    fastify.log.error('Message failed:', data);
  });

  smsService.on('processing_error', (data) => {
    fastify.log.error('Processing error:', data);
  });
}

export { smsService };