// Epic 11 Analytics Routes
// API endpoints for registration and form analytics

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { AnalyticsService } from '../services/AnalyticsService';

// Analytics request schemas
const FieldInteractionSchema = z.object({
  sessionId: z.string(),
  fieldName: z.string(),
  eventType: z.enum(['focus', 'blur', 'change', 'error']),
  fieldValueLength: z.number().optional(),
  errorMessage: z.string().optional(),
  timeSpentMs: z.number().optional()
});

const FormStepSchema = z.object({
  sessionId: z.string(),
  stepNumber: z.number().int().min(1),
  formType: z.string(),
  durationMs: z.number().optional()
});

const FormCompletionSchema = z.object({
  sessionId: z.string(),
  success: z.boolean(),
  formType: z.string(),
  totalTime: z.number(),
  fieldInteractions: z.record(z.any()).optional(),
  stepTimes: z.record(z.number()).optional()
});

const FormAbandonmentSchema = z.object({
  sessionId: z.string(),
  currentStep: z.number().int().min(1),
  formType: z.string(),
  timeOnForm: z.number(),
  reason: z.string().optional(),
  fieldInteractions: z.record(z.any()).optional()
});

export async function analyticsRoutes(fastify: FastifyInstance) {
  const analyticsService = new AnalyticsService(fastify.authConfig, fastify.dbService);

  // Track field interactions
  fastify.post('/field-interaction', {
    schema: {
      body: FieldInteractionSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' }
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ Body: z.infer<typeof FieldInteractionSchema> }>, reply: FastifyReply) => {
    try {
      await analyticsService.trackFormFieldInteraction(
        request.body.sessionId,
        request.body.fieldName,
        request.body.eventType,
        {
          fieldValueLength: request.body.fieldValueLength,
          errorMessage: request.body.errorMessage,
          timeSpentMs: request.body.timeSpentMs
        }
      );

      reply.send({ success: true });
    } catch (error) {
      reply.code(500).send({ success: false, error: error.message });
    }
  });

  // Track form steps
  fastify.post('/form-step', {
    schema: {
      body: FormStepSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' }
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ Body: z.infer<typeof FormStepSchema> }>, reply: FastifyReply) => {
    try {
      await analyticsService.trackRegistrationFunnel(
        request.body.sessionId,
        `form_step_${request.body.stepNumber}`,
        {
          stepData: {
            formType: request.body.formType,
            stepNumber: request.body.stepNumber
  }
          durationMs: request.body.durationMs
        }
      );

      reply.send({ success: true });
    } catch (error) {
      reply.code(500).send({ success: false, error: error.message });
    }
  });

  // Track form completion
  fastify.post('/form-completion', {
    schema: {
      body: FormCompletionSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' }
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ Body: z.infer<typeof FormCompletionSchema> }>, reply: FastifyReply) => {
    try {
      const eventType = request.body.success ? 'completed' : 'failed';
      
      await analyticsService.trackRegistrationEvent(eventType, {
        source: 'form',
        additionalData: {
          formType: request.body.formType,
          totalTime: request.body.totalTime,
          fieldInteractions: request.body.fieldInteractions,
          stepTimes: request.body.stepTimes
        }
      });

      reply.send({ success: true });
    } catch (error) {
      reply.code(500).send({ success: false, error: error.message });
    }
  });

  // Track form abandonment
  fastify.post('/form-abandonment', {
    schema: {
      body: FormAbandonmentSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' }
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ Body: z.infer<typeof FormAbandonmentSchema> }>, reply: FastifyReply) => {
    try {
      await analyticsService.trackRegistrationEvent('abandoned', {
        source: 'form',
        additionalData: {
          formType: request.body.formType,
          currentStep: request.body.currentStep,
          timeOnForm: request.body.timeOnForm,
          reason: request.body.reason,
          fieldInteractions: request.body.fieldInteractions
        }
      });

      reply.send({ success: true });
    } catch (error) {
      reply.code(500).send({ success: false, error: error.message });
    }
  });

  // Get registration metrics (admin only)
  fastify.get('/registration-metrics', {
    preHandler: async (request, reply) => {
      // TODO: Add admin authentication check
      // For now, just check if it's a development environment
      if (process.env.NODE_ENV === 'production') {
        reply.code(403).send({ error: 'Access denied' });
        return;
      }
  }
    schema: {
      querystring: {
        type: 'object',
        properties: {
          timeframe: { type: 'string', enum: ['day', 'week', 'month'] }
        }
  }
      response: {
        200: {
          type: 'object',
          properties: {
            dailyRegistrations: { type: 'number' },
            weeklyRegistrations: { type: 'number' },
            monthlyRegistrations: { type: 'number' },
            conversionRate: { type: 'number' },
            averageCompletionTime: { type: 'number' },
            dropOffPoints: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  step: { type: 'string' },
                  count: { type: 'number' },
                  percentage: { type: 'number' }
                }
              }
  }
            sourceBreakdown: { type: 'object' }
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ Querystring: { timeframe?: 'day' | 'week' | 'month' } }>, reply: FastifyReply) => {
    try {
      const timeframe = request.query.timeframe || 'week';
      const metrics = await analyticsService.getRegistrationMetrics(timeframe);
      reply.send(metrics);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Get form analytics (admin only)
  fastify.get('/form-analytics', {
    preHandler: async (request, reply) => {
      // TODO: Add admin authentication check
      if (process.env.NODE_ENV === 'production') {
        reply.code(403).send({ error: 'Access denied' });
        return;
      }
  }
    schema: {
      querystring: {
        type: 'object',
        properties: {
          timeframe: { type: 'string', enum: ['day', 'week', 'month'] }
        }
  }
      response: {
        200: {
          type: 'object',
          properties: {
            fieldInteractionTime: { type: 'object' },
            fieldErrorRate: { type: 'object' },
            mostProblematicFields: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  errorRate: { type: 'number' },
                  averageTime: { type: 'number' }
                }
              }
  }
            stepCompletionRates: { type: 'object' }
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ Querystring: { timeframe?: 'day' | 'week' | 'month' } }>, reply: FastifyReply) => {
    try {
      const timeframe = request.query.timeframe || 'week';
      const analytics = await analyticsService.getFormAnalytics(timeframe);
      reply.send(analytics);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Get A/B test results (admin only)
  fastify.get('/ab-test/:experimentName', {
    preHandler: async (request, reply) => {
      // TODO: Add admin authentication check
      if (process.env.NODE_ENV === 'production') {
        reply.code(403).send({ error: 'Access denied' });
        return;
      }
  }
    schema: {
      params: {
        type: 'object',
        properties: {
          experimentName: { type: 'string' }
  }
        required: ['experimentName']
  }
      response: {
        200: {
          type: 'object',
          properties: {
            variants: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  variant: { type: 'string' },
                  participants: { type: 'number' },
                  conversions: { type: 'number' },
                  conversionRate: { type: 'number' }
                }
              }
  }
            winner: { type: 'string' },
            confidence: { type: 'number' }
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ Params: { experimentName: string } }>, reply: FastifyReply) => {
    try {
      const results = await analyticsService.getABTestResults(request.params.experimentName);
      reply.send(results);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Get email delivery stats (admin only)
  fastify.get('/email-stats', {
    preHandler: async (request, reply) => {
      // TODO: Add admin authentication check
      if (process.env.NODE_ENV === 'production') {
        reply.code(403).send({ error: 'Access denied' });
        return;
      }
  }
    schema: {
      querystring: {
        type: 'object',
        properties: {
          timeframe: { type: 'string', enum: ['day', 'week', 'month'] }
        }
  }
      response: {
        200: {
          type: 'object',
          properties: {
            deliveryRates: { type: 'object' },
            openRates: { type: 'object' },
            clickRates: { type: 'object' },
            bounceRates: { type: 'object' }
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ Querystring: { timeframe?: 'day' | 'week' | 'month' } }>, reply: FastifyReply) => {
    try {
      const timeframe = request.query.timeframe || 'week';
      const stats = await analyticsService.getEmailDeliveryStats(timeframe);
      reply.send(stats);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Track custom events
  fastify.post('/custom-event', {
    schema: {
      body: {
        type: 'object',
        properties: {
          eventName: { type: 'string' },
          eventData: { type: 'object' },
          sessionId: { type: 'string' }
  }
        required: ['eventName']
  }
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' }
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ Body: { eventName: string; eventData?: any; sessionId?: string } }>, reply: FastifyReply) => {
    try {
      await analyticsService.trackRegistrationEvent(request.body.eventName, {
        additionalData: request.body.eventData
      });

      reply.send({ success: true });
    } catch (error) {
      reply.code(500).send({ success: false, error: error.message });
    }
  });

  // Store analytics service reference
  fastify.decorate('analyticsService', analyticsService);
}