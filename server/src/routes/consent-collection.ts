/**
 * Consent Collection Routes - Epic 19
 * 
 * REST API endpoints for consent collection, cookie banners, granular preferences,
 * just-in-time consent prompts, and comprehensive consent management.
 * 
 * Part of Epic 19 - Data Protection & Privacy Controls
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { jwtAuthMiddleware } from '../auth/routes';
import { 
  ConsentCollectionService,
  ConsentType,
  ConsentMethod,
  ConsentGranularity,
  LegalBasis,
  ConsentCategory,
  ComplianceFramework
 from '../services/ConsentCollectionService';

// Request/Response Schemas
const InitializeConsentCollectionRequestSchema = z.object({
  sessionId: z.string().min(1),
  context: z.object({
    contextId: z.string().optional(),
    ipAddress: z.string().ip(),
    userAgent: z.string(),
    geolocation: z.object({
      country: z.string(),
      region: z.string().optional(),
      city: z.string().optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      accuracy: z.number().optional(),
      source: z.enum(['IP', 'GPS', 'USER_PROVIDED']).default('IP')
    }).optional(),
    pageUrl: z.string().url(),
    referrer: z.string().url().optional(),
    consentFlow: z.object({
      flowType: z.enum(['BANNER', 'MODAL', 'INLINE', 'PROGRESSIVE', 'CONTEXTUAL', 'JUST_IN_TIME']).default('BANNER'),
      entryPoint: z.string(),
      stepsTaken: z.array(z.any()).default([])
    }).default({}),
    displayMethod: z.enum(['BANNER', 'MODAL', 'SIDEBAR', 'INLINE', 'OVERLAY', 'NOTIFICATION']).default('BANNER')
  }),
  userPreferences: z.object({
    language: z.string().default('en'),
    timezone: z.string().default('UTC'),
    accessibility: z.object({
      highContrast: z.boolean().default(false),
      largeText: z.boolean().default(false),
      screenReader: z.boolean().default(false),
      reducedMotion: z.boolean().default(false)
    }).default({})
  }).default({})
});

const CollectConsentRequestSchema = z.object({
  consentType: z.enum(['EXPLICIT', 'IMPLICIT', 'OPT_IN', 'OPT_OUT', 'GRANULAR', 'BLANKET', 'CONDITIONAL']),
  purpose: z.object({
    purposeId: z.string(),
    category: z.enum(
      ['ESSENTIAL',
        'FUNCTIONAL',
        'ANALYTICS',
        'MARKETING',
        'ADVERTISING',
        'SOCIAL_MEDIA',
        'PERSONALIZATION',
        'RESEARCH']
    ),
    name: z.string(),
    description: z.string(),
    essentialService: z.boolean().default(false),
    legalRequirement: z.boolean().default(false),
    businessCritical: z.boolean().default(false),
    userBenefit: z.string(),
    dataProcessing: z.object({
      collectsPersonalData: z.boolean(),
      collectsSensitiveData: z.boolean(),
      usesAutomatedDecisions: z.boolean(),
      shareWithThirdParties: z.boolean(),
      transfersInternational: z.boolean(),
      storesData: z.boolean(),
      processingMethods: z.array(z.string()),
      securityMeasures: z.array(z.string())
    }),
    retentionPeriod: z.number(),
    automatedDecisionMaking: z.boolean().default(false),
    profiling: z.boolean().default(false),
    specialCategoryData: z.boolean().default(false)
  }),
  granularity: z.enum(['GLOBAL', 'CATEGORY', 'PURPOSE', 'FEATURE', 'INDIVIDUAL']).default('CATEGORY'),
  method: z.enum(['WEB_FORM', 'MOBILE_APP', 'EMAIL', 'PHONE', 'IN_PERSON', 'API', 'BANNER', 'POPUP']),
  context: z.object({
    contextId: z.string(),
    sessionId: z.string(),
    ipAddress: z.string().ip(),
    userAgent: z.string(),
    timestamp: z.string().datetime(),
    pageUrl: z.string().url(),
    referrer: z.string().url().optional(),
    consentFlow: z.object({
      flowId: z.string(),
      flowType: z.enum(['BANNER', 'MODAL', 'INLINE', 'PROGRESSIVE', 'CONTEXTUAL', 'JUST_IN_TIME']),
      entryPoint: z.string(),
      stepsTaken: z.array(z.object({
        stepId: z.string(),
        stepType: z.string(),
        timestamp: z.string().datetime(),
        duration: z.number(),
        userAction: z.string(),
        stepData: z.record(z.any()).default({})
      })),
      completionRate: z.number().min(0).max(100),
      totalTimeSpent: z.number()
    }),
    displayMethod: z.enum(['BANNER', 'MODAL', 'SIDEBAR', 'INLINE', 'OVERLAY', 'NOTIFICATION']),
    interactionHistory: z.array(z.object({
      interactionId: z.string(),
      timestamp: z.string().datetime(),
      interactionType: z.enum(['VIEW', 'CLICK', 'SCROLL', 'HOVER', 'FOCUS', 'INPUT', 'SUBMIT', 'CANCEL']),
      elementId: z.string(),
      elementType: z.string(),
      details: z.record(z.any()).default({}),
      result: z.enum(['ACCEPT', 'REJECT', 'CUSTOMIZE', 'DEFER', 'IGNORE', 'TIMEOUT'])
    })).default([])
  }),
  legalBasis: z.enum(
    ['CONSENT',
      'CONTRACT',
      'LEGAL_OBLIGATION',
      'VITAL_INTERESTS',
      'PUBLIC_TASK',
      'LEGITIMATE_INTERESTS']
  ),
  jurisdiction: z.array(z.string()).default(['US']),
  dataCategories: z.array(z.object({
    categoryId: z.string(),
    name: z.string(),
    description: z.string(),
    sensitivity: z.enum(['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED', 'SPECIAL_CATEGORY']),
    examples: z.array(z.string()),
    specialHandling: z.boolean().default(false),
    encryptionRequired: z.boolean().default(false)
  })).default([]),
  processingActivities: z.array(z.object({
    activityId: z.string(),
    name: z.string(),
    description: z.string(),
    purpose: z.string(),
    legalBasis: z.enum(
      ['CONSENT',
        'CONTRACT',
        'LEGAL_OBLIGATION',
        'VITAL_INTERESTS',
        'PUBLIC_TASK',
        'LEGITIMATE_INTERESTS']
    ),
    dataCategories: z.array(z.string()),
    retentionPeriod: z.number(),
    automatedProcessing: z.boolean().default(false),
    profilingInvolved: z.boolean().default(false)
  })).default([]),
  thirdPartySharing: z.array(z.object({
    thirdPartyId: z.string(),
    thirdPartyName: z.string(),
    relationship: z.enum(['PROCESSOR', 'JOINT_CONTROLLER', 'VENDOR', 'PARTNER', 'SERVICE_PROVIDER']),
    purpose: z.string(),
    dataShared: z.array(z.string()),
    contractualBasis: z.string(),
    userVisibility: z.enum(['TRANSPARENT', 'DISCLOSED', 'HIDDEN', 'ON_REQUEST']),
    consentRequired: z.boolean(),
    optOutAvailable: z.boolean(),
    privacyPolicyUrl: z.string().url(),
    contactInfo: z.object({
      dpoEmail: z.string().email().optional(),
      privacyEmail: z.string().email().optional(),
      supportEmail: z.string().email().optional(),
      address: z.string().optional(),
      phone: z.string().optional()
    }).default({})
  })).default([]),
  preferences: z.object({
    communicationPreferences: z.array(z.object({
      channel: z.enum(['EMAIL', 'SMS', 'PUSH', 'IN_APP', 'PHONE', 'POST']),
      enabled: z.boolean(),
      frequency: z.enum(['IMMEDIATE', 'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY']),
      topics: z.array(z.string()),
      languagePreference: z.string().default('en')
    })).default([]),
    cookiePreferences: z.array(z.object({
      category: z.enum(['ESSENTIAL', 'FUNCTIONAL', 'ANALYTICS', 'MARKETING', 'ADVERTISING', 'SOCIAL_MEDIA']),
      enabled: z.boolean(),
      expiryPreference: z.number().default(365),
      sameSitePreference: z.enum(['Strict', 'Lax', 'None']).default('Lax')
    })).default([]),
    marketingPreferences: z.array(z.object({
      channel: z.enum(['EMAIL', 'SMS', 'SOCIAL', 'DISPLAY', 'SEARCH', 'DIRECT_MAIL']),
      enabled: z.boolean(),
      categories: z.array(z.string()),
      frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'EVENT_BASED']),
      personalization: z.boolean().default(false),
      thirdPartySharing: z.boolean().default(false)
    })).default([]),
    dataProcessingPreferences: z.array(z.object({
      processingType: z.enum(['ANALYTICS', 'PERSONALIZATION', 'MARKETING', 'RESEARCH', 'OPTIMIZATION']),
      enabled: z.boolean(),
      purpose: z.string(),
      automation: z.object({
        automatedDecisions: z.boolean().default(false),
        profiling: z.boolean().default(false),
        aiProcessing: z.boolean().default(false),
        humanReview: z.boolean().default(true)
      }).default({}),
      sharing: z.object({
        internalSharing: z.boolean().default(true),
        thirdPartySharing: z.boolean().default(false),
        internationalTransfers: z.boolean().default(false),
        partnerSharing: z.boolean().default(false),
        researchSharing: z.boolean().default(false)
      }).default({})
    })).default([])
  }).default({}),
  customFields: z.record(z.any()).default({}),
  tags: z.array(z.string()).default([])
});

const UpdateConsentPreferencesRequestSchema = z.object({
  consentId: z.string().min(1),
  preferences: z.object({
    communicationPreferences: z.array(z.object({
      channel: z.enum(['EMAIL', 'SMS', 'PUSH', 'IN_APP', 'PHONE', 'POST']),
      enabled: z.boolean(),
      frequency: z.enum(['IMMEDIATE', 'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY']),
      topics: z.array(z.string()),
      timePreferences: z.array(z.object({
        timezone: z.string(),
        preferredTime: z.string(),
        daysOfWeek: z.array(z.number().min(0).max(6)),
        frequency: z.enum(['IMMEDIATE', 'DAILY', 'WEEKLY', 'MONTHLY'])
      })).default([]),
      languagePreference: z.string()
    })).optional(),
    privacySettings: z.array(z.object({
      settingType: z.enum(['DATA_MINIMIZATION', 'PURPOSE_LIMITATION', 'ACCURACY', 'STORAGE_LIMITATION', 'SECURITY']),
      value: z.union([z.boolean(), z.string(), z.number()]),
      reason: z.string().optional(),
      userModifiable: z.boolean().default(true)
    })).optional(),
    cookiePreferences: z.array(z.object({
      category: z.enum(['ESSENTIAL', 'FUNCTIONAL', 'ANALYTICS', 'MARKETING', 'ADVERTISING', 'SOCIAL_MEDIA']),
      enabled: z.boolean(),
      specificCookies: z.array(z.object({
        cookieName: z.string(),
        vendor: z.string(),
        purpose: z.string(),
        enabled: z.boolean(),
        essential: z.boolean().default(false),
        duration: z.number()
      })).default([]),
      expiryPreference: z.number(),
      sameSitePreference: z.enum(['Strict', 'Lax', 'None'])
    })).optional(),
    marketingPreferences: z.array(z.object({
      channel: z.enum(['EMAIL', 'SMS', 'SOCIAL', 'DISPLAY', 'SEARCH', 'DIRECT_MAIL']),
      enabled: z.boolean(),
      categories: z.array(z.string()),
      frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'EVENT_BASED']),
      personalization: z.boolean(),
      thirdPartySharing: z.boolean()
    })).optional(),
    dataProcessingPreferences: z.array(z.object({
      processingType: z.enum(['ANALYTICS', 'PERSONALIZATION', 'MARKETING', 'RESEARCH', 'OPTIMIZATION']),
      enabled: z.boolean(),
      purpose: z.string(),
      automation: z.object({
        automatedDecisions: z.boolean(),
        profiling: z.boolean(),
        aiProcessing: z.boolean(),
        humanReview: z.boolean()
      }),
      sharing: z.object({
        internalSharing: z.boolean(),
        thirdPartySharing: z.boolean(),
        internationalTransfers: z.boolean(),
        partnerSharing: z.boolean(),
        researchSharing: z.boolean()
      }),
      retention: z.object({
        minimumRetention: z.boolean(),
        standardRetention: z.boolean(),
        extendedRetention: z.boolean(),
        customPeriod: z.number().optional(),
        automaticDeletion: z.boolean()

    })).optional(),
    notificationPreferences: z.array(z.object({
      notificationType: z.enum(['POLICY_UPDATE', 'CONSENT_EXPIRY', 'DATA_BREACH', 'RIGHTS_REQUEST', 'COMPLIANCE']),
      enabled: z.boolean(),
      urgencyLevels: z.array(z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])),
      deliveryMethods: z.array(z.enum(['EMAIL', 'SMS', 'PUSH', 'IN_APP', 'PHONE'])),
      quietHours: z.object({
        enabled: z.boolean(),
        startTime: z.string(),
        endTime: z.string(),
        timezone: z.string(),
        exceptions: z.array(z.string())

    })).optional(),
    accessibilityPreferences: z.array(z.object({
      highContrast: z.boolean(),
      largeText: z.boolean(),
      screenReader: z.boolean(),
      keyboardNavigation: z.boolean(),
      reducedMotion: z.boolean(),
      audioDescription: z.boolean(),
      simplifiedInterface: z.boolean()
    })).optional()

});

const GenerateJustInTimePromptRequestSchema = z.object({
  feature: z.string().min(1),
  context: z.object({
    contextId: z.string(),
    sessionId: z.string(),
    ipAddress: z.string().ip(),
    userAgent: z.string(),
    pageUrl: z.string().url(),
    referrer: z.string().url().optional(),
    timestamp: z.string().datetime(),
    consentFlow: z.object({
      flowId: z.string(),
      flowType: z.enum(['BANNER', 'MODAL', 'INLINE', 'PROGRESSIVE', 'CONTEXTUAL', 'JUST_IN_TIME']),
      entryPoint: z.string()
    }),
    displayMethod: z.enum(['BANNER', 'MODAL', 'SIDEBAR', 'INLINE', 'OVERLAY', 'NOTIFICATION'])
  }),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  deferrable: z.boolean().default(true),
  alternatives: z.array(z.string()).default([])
});

const ValidateComplianceRequestSchema = z.object({
  framework: z.enum(['GDPR', 'CCPA', 'PIPEDA', 'LGPD', 'PDPA', 'CUSTOM']),
  checkCategories: z.array(z.string()).default(['consent_validity', 'data_minimization', 'purpose_limitation', 'retention_compliance']),
  includeRecommendations: z.boolean().default(true),
  detailLevel: z.enum(['BASIC', 'STANDARD', 'COMPREHENSIVE']).default('STANDARD')
});

export async function consentCollectionRoutes(fastify: FastifyInstance) {
  // Add authentication middleware for protected routes
  await fastify.register(jwtAuthMiddleware);

  const consentCollectionService = fastify.consentCollectionService as ConsentCollectionService;

  /**
   * Initialize consent collection for session
   * POST /consent-collection/initialize
   */
  fastify.post<{
    Body: z.infer<typeof InitializeConsentCollectionRequestSchema>;
>('/initialize', {
    schema: {
      description: 'Initialize consent collection for a new user session',
      tags: ['Consent Collection'],
      body: InitializeConsentCollectionRequestSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                collectionId: { type: 'string' },
                requiredConsents: { type: 'array' },
                bannerConfig: { type: 'object' },
                jurisdiction: { type: 'string' },
                applicableFrameworks: { type: 'array', items: { type: 'string' } },
                sessionContext: { type: 'object' }






    handler: async (request, reply) => {
      try {
        const { sessionId, context, userPreferences } = request.body;

        const result = await consentCollectionService.initializeConsentCollection(sessionId, {
          contextId: context.contextId || `CTX-${Date.now()}`,
          sessionId,
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
          geolocation: context.geolocation,
          timestamp: new Date(),
          pageUrl: context.pageUrl,
          referrer: context.referrer,
          consentFlow: {
            flowId: `FLOW-${Date.now()}`,
            flowType: context.consentFlow.flowType,
            entryPoint: context.consentFlow.entryPoint,
            stepsTaken: context.consentFlow.stepsTaken,
            completionRate: 0,
            totalTimeSpent: 0

          displayMethod: context.displayMethod,
          interactionHistory: []
        });

        // Determine applicable frameworks based on geolocation
        const applicableFrameworks = [];
        if (context.geolocation?.country === 'US') {
          applicableFrameworks.push('CCPA');

        if (
          ['US',
            'GB',
            'DE',
            'FR',
            'IT',
            'ES',
            'NL',
            'BE',
            'AT',
            'SE',
            'DK',
            'FI',
            'IE',
            'PT',
            'LU'].includes(context.geolocation?.country || ''
          )) {
          applicableFrameworks.push('GDPR');


        reply.send({
          success: true,
          data: {
            collectionId: result.collectionId,
            requiredConsents: result.requiredConsents,
            bannerConfig: result.bannerConfig,
            jurisdiction: context.geolocation?.country || 'Unknown',
            applicableFrameworks,
            sessionContext: {
              sessionId,
              language: userPreferences?.language || 'en',
              timezone: userPreferences?.timezone || 'UTC',
              accessibility: userPreferences?.accessibility || {}


        });
 catch (error) {
        fastify.log.error('Error initializing consent collection:', error);
        reply.code(500).send({
          error: 'Failed to initialize consent collection',
          message: error instanceof Error ? error.message : 'Unknown error'
        });


  });

  /**
   * Collect user consent
   * POST /consent-collection/collect
   */
  fastify.post<{
    Body: z.infer<typeof CollectConsentRequestSchema>;
>('/collect', {
    schema: {
      description: 'Collect user consent with comprehensive audit trail',
      tags: ['Consent Collection'],
      security: [{ bearerAuth: [] }],
      body: CollectConsentRequestSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                consentId: { type: 'string' },
                status: { type: 'string' },
                expiresAt: { type: 'string' },
                effectiveDate: { type: 'string' },
                complianceStatus: { type: 'string' },
                auditReference: { type: 'string' },
                nextActions: { type: 'array', items: { type: 'string' } }






    preHandler: async (request: FastifyRequest, reply: FastifyReply) => {
      await fastify.authenticate(request, reply);

    handler: async (request, reply) => {
      try {
        const userId = request.user.userId;
        const consentData = request.body;

        const result = await consentCollectionService.collectConsent(userId, consentData as any);

        // Determine next actions based on consent type and jurisdiction
        const nextActions = [];
        if (consentData.purpose.category === 'MARKETING') {
          nextActions.push('Set up preference center access');
          nextActions.push('Configure communication frequency');

        if (consentData.thirdPartySharing.length > 0) {
          nextActions.push('Review third-party data sharing agreements');

        if (consentData.processingActivities.some(activity => activity.automatedProcessing)) {
          nextActions.push('Configure automated decision-making preferences');


        reply.send({
          success: true,
          data: {
            consentId: result.consentId,
            status: result.status,
            expiresAt: result.expiresAt?.toISOString(),
            effectiveDate: new Date().toISOString(),
            complianceStatus: 'COMPLIANT',
            auditReference: `AUD-${Date.now()}`,
            nextActions

        });
 catch (error) {
        fastify.log.error('Error collecting consent:', error);
        reply.code(500).send({
          error: 'Failed to collect consent',
          message: error instanceof Error ? error.message : 'Unknown error'
        });


  });

  /**
   * Update consent preferences
   * PUT /consent-collection/preferences
   */
  fastify.put<{
    Body: z.infer<typeof UpdateConsentPreferencesRequestSchema>;
>('/preferences', {
    schema: {
      description: 'Update user consent preferences and settings',
      tags: ['Consent Collection'],
      security: [{ bearerAuth: [] }],
      body: UpdateConsentPreferencesRequestSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                updated: { type: 'boolean' },
                effectiveDate: { type: 'string' },
                affectedSystems: { type: 'array', items: { type: 'string' } },
                propagationStatus: { type: 'string' }






    preHandler: async (request: FastifyRequest, reply: FastifyReply) => {
      await fastify.authenticate(request, reply);

    handler: async (request, reply) => {
      try {
        const userId = request.user.userId;
        const { consentId, preferences } = request.body;

        const result = await consentCollectionService.updateConsentPreferences(userId, consentId, preferences);

        // Determine affected systems based on preference changes
        const affectedSystems = [];
        if (preferences.marketingPreferences) {
          affectedSystems.push('marketing_automation');

        if (preferences.cookiePreferences) {
          affectedSystems.push('web_analytics', 'advertising_platform');

        if (preferences.dataProcessingPreferences) {
          affectedSystems.push('data_warehouse', 'analytics_engine');


        reply.send({
          success: true,
          data: {
            updated: result.updated,
            effectiveDate: result.effectiveDate.toISOString(),
            affectedSystems,
            propagationStatus: 'IN_PROGRESS'

        });
 catch (error) {
        fastify.log.error('Error updating consent preferences:', error);
        reply.code(500).send({
          error: 'Failed to update consent preferences',
          message: error instanceof Error ? error.message : 'Unknown error'
        });


  });

  /**
   * Get user consent status and preferences
   * GET /consent-collection/user-consents
   */
  fastify.get('/user-consents', {
    schema: {
      description: 'Get current user consent status and preferences',
      tags: ['Consent Collection'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                activeConsents: { type: 'array' },
                preferences: { type: 'object' },
                complianceStatus: { type: 'string' },
                expiringConsents: { type: 'array' },
                lastUpdated: { type: 'string' },
                jurisdiction: { type: 'string' },
                applicableFrameworks: { type: 'array', items: { type: 'string' } }






    preHandler: async (request: FastifyRequest, reply: FastifyReply) => {
      await fastify.authenticate(request, reply);

    handler: async (request, reply) => {
      try {
        const userId = request.user.userId;

        const result = await consentCollectionService.getUserConsents(userId);

        // Check for expiring consents (within 30 days)
        const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        const expiringConsents = result.activeConsents.filter(consent => 
          consent.expiresAt && consent.expiresAt <= thirtyDaysFromNow
        );

        reply.send({
          success: true,
          data: {
            activeConsents: result.activeConsents.map(consent => ({
              consentId: consent.consentId,
              purpose: consent.purpose.name,
              category: consent.purpose.category,
              status: consent.status,
              grantedAt: consent.grantedAt.toISOString(),
              expiresAt: consent.expiresAt?.toISOString(),
              method: consent.consentMethod,
              granularity: consent.granularity
            })),
            preferences: result.preferences,
            complianceStatus: result.complianceStatus,
            expiringConsents: expiringConsents.map(consent => ({
              consentId: consent.consentId,
              purpose: consent.purpose.name,
              expiresAt: consent.expiresAt?.toISOString(),
              daysRemaining: consent.expiresAt ? Math.ceil((consent.expiresAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000)) : null
            })),
            lastUpdated: new Date().toISOString(),
            jurisdiction: 'US', // Would be determined from user profile
            applicableFrameworks: ['CCPA', 'GDPR']

        });
 catch (error) {
        fastify.log.error('Error getting user consents:', error);
        reply.code(500).send({
          error: 'Failed to get user consents',
          message: error instanceof Error ? error.message : 'Unknown error'
        });


  });

  /**
   * Generate just-in-time consent prompt
   * POST /consent-collection/just-in-time-prompt
   */
  fastify.post<{
    Body: z.infer<typeof GenerateJustInTimePromptRequestSchema>;
>('/just-in-time-prompt', {
    schema: {
      description: 'Generate contextual just-in-time consent prompt for specific features',
      tags: ['Consent Collection'],
      security: [{ bearerAuth: [] }],
      body: GenerateJustInTimePromptRequestSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                promptId: { type: 'string' },
                promptConfig: { type: 'object' },
                required: { type: 'boolean' },
                displayConditions: { type: 'object' },
                fallbackOptions: { type: 'array', items: { type: 'string' } }






    preHandler: async (request: FastifyRequest, reply: FastifyReply) => {
      await fastify.authenticate(request, reply);

    handler: async (request, reply) => {
      try {
        const userId = request.user.userId;
        const { feature, context, urgency, deferrable, alternatives } = request.body;

        const result = await consentCollectionService.generateJustInTimePrompt(userId, feature, context as any);

        const displayConditions = {
          showImmediately: urgency === 'HIGH',
          allowDefer: deferrable,
          blockingUI: urgency === 'HIGH' && !deferrable,
          timeoutSeconds: urgency === 'LOW' ? 30 : urgency === 'MEDIUM' ? 60 : 120
        };

        reply.send({
          success: true,
          data: {
            promptId: result.promptId,
            promptConfig: result.promptConfig,
            required: result.required,
            displayConditions,
            fallbackOptions: alternatives.length > 0 ? alternatives : [`Continue without ${feature}`, 'Learn more']

        });
 catch (error) {
        fastify.log.error('Error generating just-in-time prompt:', error);
        reply.code(500).send({
          error: 'Failed to generate just-in-time prompt',
          message: error instanceof Error ? error.message : 'Unknown error'
        });


  });

  /**
   * Validate consent compliance
   * POST /consent-collection/validate-compliance
   */
  fastify.post<{
    Body: z.infer<typeof ValidateComplianceRequestSchema>;
>('/validate-compliance', {
    schema: {
      description: 'Validate user consent compliance against regulatory frameworks',
      tags: ['Consent Collection'],
      security: [{ bearerAuth: [] }],
      body: ValidateComplianceRequestSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                compliant: { type: 'boolean' },
                issues: { type: 'array' },
                recommendations: { type: 'array', items: { type: 'string' } },
                complianceScore: { type: 'number' },
                lastValidated: { type: 'string' },
                nextReview: { type: 'string' }






    preHandler: async (request: FastifyRequest, reply: FastifyReply) => {
      await fastify.authenticate(request, reply);
      
      if (!request.user.permissions.includes('consent:validate:compliance')) {
        reply.code(403).send({ error: 'Insufficient permissions' });
        return;


    handler: async (request, reply) => {
      try {
        const userId = request.user.userId;
        const { framework, checkCategories, includeRecommendations, detailLevel } = request.body;

        const result = await consentCollectionService.validateConsentCompliance(userId, framework);

        // Calculate compliance score based on issues
        const complianceScore = result.issues.length === 0 ? 100 : Math.max(0, 100 - (result.issues.length * 10));

        // Set next review date based on framework requirements
        const nextReview = new Date();
        if (framework === 'GDPR') {
          nextReview.setMonth(nextReview.getMonth() + 12); // Annual review
 else if (framework === 'CCPA') {
          nextReview.setMonth(nextReview.getMonth() + 6); // Semi-annual review
 else {
          nextReview.setMonth(nextReview.getMonth() + 12); // Default annual


        reply.send({
          success: true,
          data: {
            compliant: result.compliant,
            issues: result.issues,
            recommendations: includeRecommendations ? result.recommendations : [],
            complianceScore,
            lastValidated: new Date().toISOString(),
            nextReview: nextReview.toISOString()

        });
 catch (error) {
        fastify.log.error('Error validating consent compliance:', error);
        reply.code(500).send({
          error: 'Failed to validate consent compliance',
          message: error instanceof Error ? error.message : 'Unknown error'
        });


  });

  /**
   * Get consent banner configuration
   * GET /consent-collection/banner-config
   */
  fastify.get<{
    Querystring: {
      country?: string;
      language?: string;
      theme?: string;
      mobile?: boolean;
    };
>('/banner-config', {
    schema: {
      description: 'Get localized consent banner configuration',
      tags: ['Consent Collection'],
      querystring: {
        type: 'object',
        properties: {
          country: { type: 'string' },
          language: { type: 'string', default: 'en' },
          theme: { type: 'string', enum: ['light', 'dark', 'auto'], default: 'light' },
          mobile: { type: 'boolean', default: false }


      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                bannerConfig: { type: 'object' },
                applicableFrameworks: { type: 'array', items: { type: 'string' } },
                legalRequirements: { type: 'object' },
                translations: { type: 'object' }






    handler: async (request, reply) => {
      try {
        const { country = 'US', language = 'en', theme = 'light', mobile = false } = request.query;

        // Mock banner configuration based on jurisdiction
        const bannerConfig = {
          type: country === 'US' ? 'CCPA_COMPLIANT' : 'GDPR_COMPLIANT',
          position: mobile ? 'BOTTOM' : 'OVERLAY',
          dismissible: country !== 'FR', // France requires explicit consent
          showRejectButton: true,
          showCustomizeButton: true,
          language,
          theme,
          animation: mobile ? 'slide_up' : 'fade',
          autoHide: false,
          showOnce: false,
          respectDoNotTrack: true,
          buttons: {
            accept: { text: 'Accept All', style: 'primary' },
            reject: { text: 'Reject All', style: 'secondary' },
            customize: { text: 'Manage Preferences', style: 'outline' },
            close: { text: '×', style: 'minimal' }

          content: {
            title: 'We value your privacy',
            description: 'We and our partners use technologies like cookies to store and access device information.',
            privacyPolicyUrl: '/privacy-policy',
            cookiePolicyUrl: '/cookie-policy'

        };

        const applicableFrameworks = [];
        if (country === 'US') applicableFrameworks.push('CCPA');
        if (['US', 'GB', 'DE', 'FR', 'IT', 'ES'].includes(country)) applicableFrameworks.push('GDPR');

        const legalRequirements = {
          explicitConsent: ['FR', 'DE'].includes(country),
          granularChoices: true,
          withdrawalOption: true,
          ageVerification: country === 'US',
          dataProcessingInfo: applicableFrameworks.includes('GDPR')
        };

        reply.send({
          success: true,
          data: {
            bannerConfig,
            applicableFrameworks,
            legalRequirements,
            translations: {
              [language]: {
                accept: 'Accept',
                reject: 'Reject',
                customize: 'Customize',
                privacyPolicy: 'Privacy Policy',
                cookiePolicy: 'Cookie Policy'



        });
 catch (error) {
        fastify.log.error('Error getting banner configuration:', error);
        reply.code(500).send({
          error: 'Failed to get banner configuration',
          message: error instanceof Error ? error.message : 'Unknown error'
        });


  });
