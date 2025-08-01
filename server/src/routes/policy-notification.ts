/**
 * Policy Notification Routes - Epic 19
 * 
 * REST API endpoints for policy notification management, delivery tracking,
 * user preferences, and compliance-driven notification requirements.
 * 
 * Part of Epic 19 - Data Protection & Privacy Controls
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { jwtAuthMiddleware } from '../auth/routes';
import { 
  PolicyNotificationService,
  NotificationType,
  PolicyEventType,
  NotificationSeverity,
  AudienceTargetType,
  NotificationStatus
 from '../services/PolicyNotificationService';

// Request/Response Schemas
const SendNotificationRequestSchema = z.object({
  policyId: z.string().min(1),
  policyVersion: z.string().min(1),
  notificationType: z.enum(['POLICY_CREATED', 'POLICY_UPDATED', 'POLICY_PUBLISHED', 'POLICY_ARCHIVED', 'POLICY_REMINDER', 'COMPLIANCE_ALERT', 'AUDIT_NOTIFICATION', 'CUSTOM']),
  eventType: z.enum(['CREATION', 'UPDATE', 'PUBLICATION', 'RETIREMENT', 'APPROVAL', 'REJECTION', 'REVIEW_DUE', 'COMPLIANCE_CHANGE', 'BREACH_NOTIFICATION']),
  severity: z.enum(['INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'URGENT']),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  detailedMessage: z.string().optional(),
  audience: z.object({
    audienceId: z.string(),
    targetType: z.enum(['INDIVIDUAL', 'GROUP', 'ROLE', 'DEPARTMENT', 'ALL_USERS', 'AFFECTED_USERS', 'COMPLIANCE_TEAM', 'CUSTOM']),
    targets: z.array(z.object({
      targetId: z.string(),
      type: z.enum(['USER', 'GROUP', 'ROLE', 'DEPARTMENT', 'JURISDICTION', 'SERVICE', 'ALL']),
      identifier: z.string(),
      displayName: z.string(),
      metadata: z.record(z.any()).default({}),
      preferences: z.object({
        enabled: z.boolean().default(true),
        channels: z.array(z.object({
          channel: z.string(),
          enabled: z.boolean(),
          priority: z.number().min(1).max(10),
          conditions: z.array(z.any()).default([]),
          customSettings: z.record(z.any()).default({})
        })).default([]),
        frequency: z.object({
          immediate: z.boolean().default(true),
          digest: z.object({
            enabled: z.boolean().default(false),
            frequency: z.enum(['HOURLY', 'DAILY', 'WEEKLY']).default('DAILY'),
            time: z.string().optional()
          }).default({})
        }).default({}),
        quietHours: z.object({
          enabled: z.boolean().default(false),
          startTime: z.string().optional(),
          endTime: z.string().optional(),
          timezone: z.string().optional()
        }).default({}),
        contentPreferences: z.object({
          language: z.string().default('en'),
          format: z.enum(['TEXT', 'HTML', 'MARKDOWN']).default('HTML'),
          includeDetails: z.boolean().default(true),
          includeLinks: z.boolean().default(true)
        }).default({}),
        complianceOverrides: z.array(z.object({
          framework: z.string(),
          overrideType: z.enum(['MANDATORY', 'OPTIONAL', 'DISABLED']),
          reason: z.string(),
          expiresAt: z.string().datetime().optional()
        })).default([]),
        subscriptions: z.array(z.object({
          subscriptionId: z.string(),
          type: z.string(),
          enabled: z.boolean(),
          criteria: z.record(z.any()).default({})
        })).default([])
      }).default({}),
      contactInfo: z.object({
        email: z.string().email().optional(),
        phone: z.string().optional(),
        pushTokens: z.array(z.string()).default([]),
        slackUserId: z.string().optional(),
        teamsUserId: z.string().optional(),
        webhookUrl: z.string().optional(),
        alternativeContacts: z.array(z.object({
          type: z.enum(['EMAIL', 'PHONE', 'WEBHOOK']),
          value: z.string(),
          verified: z.boolean().default(false),
          priority: z.number().min(1).max(10),
          purpose: z.enum(['PRIMARY', 'BACKUP', 'EMERGENCY'])
        })).default([])
      }).default({}),
      timezone: z.string().default('UTC'),
      language: z.string().default('en'),
      lastNotified: z.string().datetime().optional()
    })),
    filters: z.array(z.object({
      filterId: z.string(),
      type: z.enum(['INCLUDE', 'EXCLUDE']),
      criteria: z.object({
        attribute: z.string(),
        operator: z.enum(['EQUALS', 'NOT_EQUALS', 'CONTAINS', 'NOT_CONTAINS', 'IN', 'NOT_IN']),
        value: z.any()
      }),
      conditions: z.array(z.any()).default([])
    })).default([]),
    segmentation: z.object({
      enabled: z.boolean().default(false),
      strategy: z.enum(['DEMOGRAPHIC', 'BEHAVIORAL', 'GEOGRAPHIC', 'COMPLIANCE_BASED', 'CUSTOM']).default('COMPLIANCE_BASED'),
      segments: z.array(z.object({
        segmentId: z.string(),
        name: z.string(),
        criteria: z.record(z.any()),
        priority: z.number().min(1).max(10),
        customization: z.record(z.any()).default({})
      })).default([])
    }).default({}),
    exclusions: z.array(z.object({
      exclusionId: z.string(),
      type: z.enum(['USER', 'GROUP', 'ROLE', 'TEMPORARY']),
      identifier: z.string(),
      reason: z.string(),
      expiresAt: z.string().datetime().optional(),
      overridable: z.boolean().default(false)
    })).default([]),
    priorityUsers: z.array(z.string()).default([]),
    estimatedReach: z.number().min(0).default(0),
    actualReach: z.number().min(0).optional()
  }),
  channels: z.array(z.enum(['EMAIL', 'SMS', 'IN_APP', 'PUSH', 'SLACK', 'TEAMS', 'WEBHOOK', 'CUSTOM'])),
  scheduling: z.object({
    immediate: z.boolean().default(true),
    scheduledAt: z.string().datetime().optional(),
    timezone: z.string().default('UTC'),
    recurring: z.object({
      enabled: z.boolean().default(false),
      frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']).optional(),
      interval: z.number().min(1).optional(),
      endDate: z.string().datetime().optional(),
      occurrences: z.number().min(1).optional()
    }).default({}),
    reminders: z.array(z.object({
      reminderId: z.string(),
      daysBefore: z.number().min(0),
      channel: z.string(),
      template: z.string(),
      enabled: z.boolean().default(true)
    })).default([])
  }).default({}),
  personalization: z.object({
    enabled: z.boolean().default(true),
    variables: z.record(z.any()).default({}),
    templates: z.record(z.string()).default({}),
    localization: z.object({
      enabled: z.boolean().default(false),
      languages: z.array(z.string()).default(['en']),
      autoTranslate: z.boolean().default(false)
    }).default({})
  }).default({}),
  compliance: z.object({
    frameworks: z.array(z.string()).default([]),
    requirements: z.array(z.object({
      requirementId: z.string(),
      framework: z.string(),
      category: z.string(),
      mandatory: z.boolean(),
      deadline: z.string().datetime().optional(),
      evidence: z.array(z.string()).default([])
    })).default([]),
    retentionPeriod: z.number().min(0).default(2555), // 7 years in days
    auditTrail: z.boolean().default(true),
    encryptionRequired: z.boolean().default(false),
    approvalRequired: z.boolean().default(false),
    evidenceCollection: z.object({
      enabled: z.boolean().default(true),
      types: z.array(z.enum(['DELIVERY_RECEIPT', 'READ_RECEIPT', 'RESPONSE', 'ATTACHMENT', 'AUDIT_LOG'])).default(['DELIVERY_RECEIPT']),
      retentionPeriod: z.number().min(0).default(2555)
    }).default({})
  }).default({})
});

const UpdatePreferencesRequestSchema = z.object({
  userId: z.string().min(1),
  preferences: z.object({
    enabled: z.boolean(),
    channels: z.array(z.object({
      channel: z.string(),
      enabled: z.boolean(),
      priority: z.number().min(1).max(10),
      conditions: z.array(z.any()).default([]),
      customSettings: z.record(z.any()).default({})
    })),
    frequency: z.object({
      immediate: z.boolean(),
      digest: z.object({
        enabled: z.boolean(),
        frequency: z.enum(['HOURLY', 'DAILY', 'WEEKLY']),
        time: z.string().optional()

    }),
    quietHours: z.object({
      enabled: z.boolean(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
      timezone: z.string().optional()
    }),
    contentPreferences: z.object({
      language: z.string(),
      format: z.enum(['TEXT', 'HTML', 'MARKDOWN']),
      includeDetails: z.boolean(),
      includeLinks: z.boolean()
    }),
    complianceOverrides: z.array(z.object({
      framework: z.string(),
      overrideType: z.enum(['MANDATORY', 'OPTIONAL', 'DISABLED']),
      reason: z.string(),
      expiresAt: z.string().datetime().optional()
    })),
    subscriptions: z.array(z.object({
      subscriptionId: z.string(),
      type: z.string(),
      enabled: z.boolean(),
      criteria: z.record(z.any())
    }))

});

export async function policyNotificationRoutes(fastify: FastifyInstance) {
  // Add authentication middleware
  await fastify.register(jwtAuthMiddleware);

  const policyNotificationService = fastify.policyNotificationService as PolicyNotificationService;

  /**
   * Send notification
   * POST /policy-notification/send
   */
  fastify.post<{
    Body: z.infer<typeof SendNotificationRequestSchema>;
>('/send', {
    schema: {
      description: 'Send policy notification to specified audience',
      tags: ['Policy Notifications'],
      security: [{ bearerAuth: [] }],
      body: SendNotificationRequestSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                notificationId: { type: 'string' },
                status: { type: 'string' },
                estimatedDelivery: { type: 'string' }






    preHandler: async (request: FastifyRequest, reply: FastifyReply) => {
      await fastify.authenticate(request, reply);
      
      if (!request.user.permissions.includes('notification:send')) {
        reply.code(403).send({ error: 'Insufficient permissions' });
        return;


    handler: async (request, reply) => {
      try {
        const notification = {
          ...request.body,
          notificationType: request.body.notificationType as NotificationType,
          eventType: request.body.eventType as PolicyEventType,
          severity: request.body.severity as NotificationSeverity
        };

        const result = await policyNotificationService.sendNotification(notification);

        reply.send({
          success: true,
          data: {
            notificationId: result.notificationId,
            status: 'SENT',
            estimatedDelivery: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes

        });
 catch (error) {
        fastify.log.error('Error sending notification:', error);
        reply.code(500).send({
          error: 'Failed to send notification',
          message: error instanceof Error ? error.message : 'Unknown error'
        });


  });

  /**
   * Update user preferences
   * PUT /policy-notification/preferences
   */
  fastify.put<{
    Body: z.infer<typeof UpdatePreferencesRequestSchema>;
>('/preferences', {
    schema: {
      description: 'Update user notification preferences',
      tags: ['Policy Notifications'],
      security: [{ bearerAuth: [] }],
      body: UpdatePreferencesRequestSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                updated: { type: 'boolean' },
                effectiveDate: { type: 'string' }






    preHandler: async (request: FastifyRequest, reply: FastifyReply) => {
      await fastify.authenticate(request, reply);

    handler: async (request, reply) => {
      try {
        const { userId, preferences } = request.body;
        
        const result = await policyNotificationService.updateUserPreferences(userId, preferences);

        reply.send({
          success: true,
          data: {
            updated: result.updated,
            effectiveDate: new Date().toISOString()

        });
 catch (error) {
        fastify.log.error('Error updating preferences:', error);
        reply.code(500).send({
          error: 'Failed to update preferences',
          message: error instanceof Error ? error.message : 'Unknown error'
        });


  });

  /**
   * Get notification status
   * GET /policy-notification/:notificationId
   */
  fastify.get<{
    Params: { notificationId: string };
>('/:notificationId', {
    schema: {
      description: 'Get notification delivery status and details',
      tags: ['Policy Notifications'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          notificationId: { type: 'string' }

        required: ['notificationId']

      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' }




    preHandler: async (request: FastifyRequest, reply: FastifyReply) => {
      await fastify.authenticate(request, reply);

    handler: async (request, reply) => {
      try {
        const { notificationId } = request.params;
        
        const notification = await policyNotificationService.getNotificationStatus(notificationId);

        reply.send({
          success: true,
          data: notification
        });
 catch (error) {
        fastify.log.error('Error getting notification status:', error);
        reply.code(500).send({
          error: 'Failed to get notification status',
          message: error instanceof Error ? error.message : 'Unknown error'
        });


  });

  /**
   * Get delivery analytics
   * GET /policy-notification/analytics
   */
  fastify.get<{
    Querystring: {
      timeRange?: string;
      policyId?: string;
      channel?: string;
      framework?: string;
    };
>('/analytics', {
    schema: {
      description: 'Get notification delivery analytics and insights',
      tags: ['Policy Notifications'],
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          timeRange: { type: 'string', enum: ['7D', '30D', '90D', '1Y'], default: '30D' },
          policyId: { type: 'string' },
          channel: { type: 'string' },
          framework: { type: 'string' }


      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                summary: { type: 'object' },
                trends: { type: 'array' },
                channels: { type: 'object' },
                compliance: { type: 'object' }






    preHandler: async (request: FastifyRequest, reply: FastifyReply) => {
      await fastify.authenticate(request, reply);
      
      if (!request.user.permissions.includes('notification:analytics:view')) {
        reply.code(403).send({ error: 'Insufficient permissions' });
        return;


    handler: async (request, reply) => {
      try {
        const filters = request.query;
        
        const analytics = await policyNotificationService.getDeliveryAnalytics(filters);

        reply.send({
          success: true,
          data: analytics
        });
 catch (error) {
        fastify.log.error('Error getting delivery analytics:', error);
        reply.code(500).send({
          error: 'Failed to get delivery analytics',
          message: error instanceof Error ? error.message : 'Unknown error'
        });


  });
