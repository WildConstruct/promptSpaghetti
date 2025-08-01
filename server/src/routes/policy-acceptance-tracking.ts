// Policy Acceptance Tracking API Routes - Epic 19
// RESTful API for policy acceptance tracking and consent management

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { 
  PolicyAcceptanceTrackingService,
  PolicyType,
  AcceptanceType,
  AcceptanceMethod,
  LegalBasisType,
  WithdrawalType,
  WithdrawalScope
 from '../services/PolicyAcceptanceTrackingService';
import { z } from 'zod';

// Request schemas
const RecordAcceptanceSchema = z.object({
  policyId: z.string().min(1, 'Policy ID is required'),
  policyVersion: z.string().min(1, 'Policy version is required'),
  policyType: z.enum([
    'PRIVACY_POLICY', 'TERMS_OF_SERVICE', 'COOKIE_POLICY', 
    'DATA_PROCESSING', 'MARKETING_CONSENT', 'RESEARCH_CONSENT'
  ] as const),
  acceptanceType: z.enum(['INITIAL', 'RENEWAL', 'UPDATE', 'RECONFIRMATION'] as const).default('INITIAL'),
  acceptanceMethod: z.enum([
    'CLICK_THROUGH', 'ELECTRONIC_SIGNATURE', 'OPT_IN_CHECKBOX', 
    'DIGITAL_SIGNATURE', 'BIOMETRIC', 'TWO_FACTOR'
  ] as const),
  acceptanceContext: z.object({
    ipAddress: z.string().ip(),
    userAgent: z.string(),
    sessionId: z.string(),
    pageUrl: z.string().url(),
    referrer: z.string().url().optional(),
    geolocation: z.object({
      country: z.string(),
      region: z.string(),
      city: z.string(),
      coordinates: z.object({
        latitude: z.number(),
        longitude: z.number()
      }).optional(),
      timezone: z.string(),
      accuracy: z.number().optional()
    }).optional(),
    deviceFingerprint: z.string(),
    interactionMetrics: z.object({
      timeOnPage: z.number().min(0),
      scrollPercentage: z.number().min(0).max(100),
      clicksBeforeAcceptance: z.number().min(0),
      documentsViewed: z.array(z.string()).default([]),
      viewDuration: z.number().min(0),
      hesitationTime: z.number().min(0)

  }),
  consentData: z.object({
    consentId: z.string(),
    granularConsents: z.array(z.object({
      consentId: z.string(),
      purpose: z.string(),
      dataTypes: z.array(z.string()),
      required: z.boolean(),
      granted: z.boolean(),
      grantedAt: z.string().datetime().transform(val => new Date(val)).optional(),
      lastUpdated: z.string().datetime().transform(val => new Date(val)).default(new Date().toISOString()).transform(val => new Date(val))
    })).min(1, 'At least one granular consent is required'),
    legalBasis: z.array(z.object({
      basisType: z.enum(
        ['CONSENT',
          'CONTRACT',
          'LEGAL_OBLIGATION',
          'VITAL_INTERESTS',
          'PUBLIC_TASK',
          'LEGITIMATE_INTERESTS'] as const
      ),
      description: z.string(),
      regulation: z.string(),
      article: z.string().optional(),
      justification: z.string()
    })),
    processingPurposes: z.array(z.object({
      purposeId: z.string(),
      name: z.string(),
      description: z.string(),
      legalBasis: z.enum(
        ['CONSENT',
          'CONTRACT',
          'LEGAL_OBLIGATION',
          'VITAL_INTERESTS',
          'PUBLIC_TASK',
          'LEGITIMATE_INTERESTS'] as const
      ),
      dataTypes: z.array(z.string()),
      retentionPeriod: z.number().min(1),
      automated: z.boolean().default(false)
    })),
    dataCategories: z.array(z.string()),
    retentionPeriod: z.number().min(1).default(365),
    shareWithThirdParties: z.boolean().default(false),
    thirdParties: z.array(z.object({
      thirdPartyId: z.string(),
      name: z.string(),
      purpose: z.string(),
      dataShared: z.array(z.string()),
      location: z.string(),
      safeguards: z.array(z.string()),
      consented: z.boolean(),
      consentedAt: z.string().datetime().transform(val => new Date(val)).optional()
    })).default([]),
    marketingConsent: z.object({
      emailMarketing: z.boolean().default(false),
      smsMarketing: z.boolean().default(false),
      phoneMarketing: z.boolean().default(false),
      profileBuilding: z.boolean().default(false),
      behavioralTargeting: z.boolean().default(false),
      thirdPartySharing: z.boolean().default(false),
      lastUpdated: z.string().datetime().transform(val => new Date(val)).default(new Date().toISOString()).transform(val => new Date(val))
    }),
    cookieConsent: z.object({
      essential: z.boolean().default(true),
      functional: z.boolean().default(false),
      analytics: z.boolean().default(false),
      marketing: z.boolean().default(false),
      thirdParty: z.boolean().default(false),
      categories: z.array(z.object({
        categoryId: z.string(),
        name: z.string(),
        description: z.string(),
        cookies: z.array(z.object({
          name: z.string(),
          purpose: z.string(),
          duration: z.string(),
          domain: z.string(),
          thirdParty: z.boolean()
        })),
        consented: z.boolean(),
        required: z.boolean()
      })).default([]),
      lastUpdated: z.string().datetime().transform(val => new Date(val)).default(new Date().toISOString()).transform(val => new Date(val))
    }),
    dataTransfers: z.array(z.object({
      transferId: z.string(),
      recipientCountry: z.string(),
      adequacyDecision: z.boolean(),
      safeguards: z.array(z.string()),
      purposes: z.array(z.string()),
      consented: z.boolean(),
      consentedAt: z.string().datetime().transform(val => new Date(val)).optional()
    })).default([])
  }),
  digitalSignature: z.object({
    signatureId: z.string(),
    signatureMethod: z.enum(
      ['DIGITAL_CERTIFICATE',
        'ELECTRONIC_SIGNATURE',
        'BIOMETRIC_SIGNATURE',
        'CRYPTOGRAPHIC_HASH'] as const
    ),
    signatureData: z.string(),
    certificateId: z.string().optional(),
    timestampService: z.string().optional(),
    signedAt: z.string().datetime().transform(val => new Date(val)),
    verificationStatus: z.enum(['VERIFIED', 'PENDING_VERIFICATION', 'VERIFICATION_FAILED', 'EXPIRED'] as const)
  }).optional(),
  metadata: z.record(z.any()).default({})
});

const WithdrawConsentSchema = z.object({
  acceptanceId: z.string().min(1, 'Acceptance ID is required'),
  withdrawalType: z.enum(['PARTIAL', 'COMPLETE', 'GRANULAR'] as const),
  withdrawalScope: z.enum(['SINGLE_CONSENT', 'POLICY_CONSENT', 'ALL_CONSENTS', 'SPECIFIC_PURPOSES'] as const),
  reason: z.string().min(10, 'Withdrawal reason must be at least 10 characters'),
  dataActions: z.array(z.object({
    actionId: z.string(),
    actionType: z.enum(['DELETE', 'ANONYMIZE', 'PSEUDONYMIZE', 'EXPORT', 'RESTRICT_PROCESSING'] as const),
    targetData: z.array(z.string()),
    scheduledAt: z.string().datetime().transform(val => new Date(val)),
    status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'SKIPPED'] as const).default('SCHEDULED'),
    evidence: z.array(z.string()).default([])
  })).default([])
});

const ExportUserDataSchema = z.object({
  format: z.enum(['JSON', 'CSV', 'XML'] as const).default('JSON')
});

// Type definitions for requests
interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    id: string;
    email: string;
    roles: string[];
  };


interface RecordAcceptanceRequest extends AuthenticatedRequest {
  Body: z.infer<typeof RecordAcceptanceSchema>;


interface WithdrawConsentRequest extends AuthenticatedRequest {
  Body: z.infer<typeof WithdrawConsentSchema>;


interface ExportUserDataRequest extends AuthenticatedRequest {
  Params: { userId: string };
  Querystring: z.infer<typeof ExportUserDataSchema>;


interface UserConsentStatusRequest extends AuthenticatedRequest {
  Params: { userId: string };


export async function policyAcceptanceTrackingRoutes(fastify: FastifyInstance) {
  // Get the policy acceptance tracking service from the DI container
  const policyAcceptanceService = fastify.policyAcceptanceTrackingService as PolicyAcceptanceTrackingService;

  // Middleware to verify authentication
  const authenticate = async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return reply.code(401).send({
          error: 'Unauthorized',
          message: 'Valid authentication token required'
        });


      const token = authHeader.slice(7);
      const user = await fastify.jwt.verify(token) as any;
      
      if (!user?.id) {
        return reply.code(401).send({
          error: 'Unauthorized',
          message: 'Invalid authentication token'
        });


      request.user = user;
 catch (error) {
      return reply.code(401).send({
        error: 'Unauthorized',
        message: 'Authentication failed'
      });

  };

  // Rate limiting configuration
  const rateLimitConfig = {
    max: 100, // Maximum requests per window
    timeWindow: '1 hour'
  };

  /**
   * Record policy acceptance
   * POST /api/policy-acceptance-tracking/acceptances
   */
  fastify.post('/acceptances', {
    preHandler: [authenticate],
    config: { rateLimit: rateLimitConfig },
    schema: {
      body: {
        type: 'object',
        properties: {
          policyId: { type: 'string', minLength: 1 },
          policyVersion: { type: 'string', minLength: 1 },
          policyType: { 
            type: 'string',
            enum: ['PRIVACY_POLICY', 'TERMS_OF_SERVICE', 'COOKIE_POLICY', 'DATA_PROCESSING', 'MARKETING_CONSENT', 'RESEARCH_CONSENT']

          acceptanceType: { type: 'string', enum: ['INITIAL', 'RENEWAL', 'UPDATE', 'RECONFIRMATION'], default: 'INITIAL' },
          acceptanceMethod: { 
            type: 'string',
            enum: ['CLICK_THROUGH', 'ELECTRONIC_SIGNATURE', 'OPT_IN_CHECKBOX', 'DIGITAL_SIGNATURE', 'BIOMETRIC', 'TWO_FACTOR']

          acceptanceContext: {
            type: 'object',
            properties: {
              ipAddress: { type: 'string' },
              userAgent: { type: 'string' },
              sessionId: { type: 'string' },
              pageUrl: { type: 'string' },
              referrer: { type: 'string' },
              deviceFingerprint: { type: 'string' },
              interactionMetrics: {
                type: 'object',
                properties: {
                  timeOnPage: { type: 'number', minimum: 0 },
                  scrollPercentage: { type: 'number', minimum: 0, maximum: 100 },
                  clicksBeforeAcceptance: { type: 'number', minimum: 0 },
                  documentsViewed: { type: 'array', items: { type: 'string' }, default: [] },
                  viewDuration: { type: 'number', minimum: 0 },
                  hesitationTime: { type: 'number', minimum: 0 }

                required: ['timeOnPage', 'scrollPercentage', 'clicksBeforeAcceptance', 'viewDuration', 'hesitationTime']


            required: ['ipAddress', 'userAgent', 'sessionId', 'pageUrl', 'deviceFingerprint', 'interactionMetrics']

          consentData: {
            type: 'object',
            properties: {
              consentId: { type: 'string' },
              granularConsents: {
                type: 'array',
                minItems: 1,
                items: {
                  type: 'object',
                  properties: {
                    consentId: { type: 'string' },
                    purpose: { type: 'string' },
                    dataTypes: { type: 'array', items: { type: 'string' } },
                    required: { type: 'boolean' },
                    granted: { type: 'boolean' },
                    grantedAt: { type: 'string', format: 'date-time' }

                  required: ['consentId', 'purpose', 'dataTypes', 'required', 'granted']


              legalBasis: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    basisType: { type: 'string', enum: ['CONSENT', 'CONTRACT', 'LEGAL_OBLIGATION', 'VITAL_INTERESTS', 'PUBLIC_TASK', 'LEGITIMATE_INTERESTS'] },
                    description: { type: 'string' },
                    regulation: { type: 'string' },
                    article: { type: 'string' },
                    justification: { type: 'string' }

                  required: ['basisType', 'description', 'regulation', 'justification']


              processingPurposes: { type: 'array', items: { type: 'object' } },
              dataCategories: { type: 'array', items: { type: 'string' } },
              retentionPeriod: { type: 'number', minimum: 1, default: 365 },
              shareWithThirdParties: { type: 'boolean', default: false },
              thirdParties: { type: 'array', items: { type: 'object' }, default: [] },
              marketingConsent: { type: 'object' },
              cookieConsent: { type: 'object' },
              dataTransfers: { type: 'array', items: { type: 'object' }, default: [] }

            required: ['consentId', 'granularConsents', 'legalBasis', 'processingPurposes', 'dataCategories']

          metadata: { type: 'object', default: {} }

        required: ['policyId', 'policyVersion', 'policyType', 'acceptanceMethod', 'acceptanceContext', 'consentData']

      response: {
        200: {
          type: 'object',
          properties: {
            acceptanceId: { type: 'string' },
            message: { type: 'string' }




  }, async (request: RecordAcceptanceRequest, reply: FastifyReply) => {
    try {
      const validatedBody = RecordAcceptanceSchema.parse(request.body);

      // Add current timestamp to interaction metrics
      validatedBody.acceptanceContext.timestamp = new Date();

      const acceptance = {
        ...validatedBody,
        userId: request.user!.id,
        userEmail: request.user!.email
      };

      const result = await policyAcceptanceService.recordPolicyAcceptance(acceptance);
      
      reply.send({
        acceptanceId: result.acceptanceId,
        message: 'Policy acceptance recorded successfully'
      });
 catch (error) {
      if (error instanceof z.ZodError) {
        reply.code(400).send({
          error: 'Validation Error',
          message: 'Invalid request data',
          details: error.errors
        });
 else {
        fastify.log.error('Error recording policy acceptance:', error);
        reply.code(500).send({
          error: 'Internal Server Error',
          message: 'Failed to record policy acceptance'
        });


  });

  /**
   * Withdraw consent
   * POST /api/policy-acceptance-tracking/withdrawals
   */
  fastify.post('/withdrawals', {
    preHandler: [authenticate],
    config: { rateLimit: rateLimitConfig },
    schema: {
      body: {
        type: 'object',
        properties: {
          acceptanceId: { type: 'string', minLength: 1 },
          withdrawalType: { type: 'string', enum: ['PARTIAL', 'COMPLETE', 'GRANULAR'] },
          withdrawalScope: { type: 'string', enum: ['SINGLE_CONSENT', 'POLICY_CONSENT', 'ALL_CONSENTS', 'SPECIFIC_PURPOSES'] },
          reason: { type: 'string', minLength: 10 },
          dataActions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                actionId: { type: 'string' },
                actionType: { type: 'string', enum: ['DELETE', 'ANONYMIZE', 'PSEUDONYMIZE', 'EXPORT', 'RESTRICT_PROCESSING'] },
                targetData: { type: 'array', items: { type: 'string' } },
                scheduledAt: { type: 'string', format: 'date-time' },
                status: { type: 'string', enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'SKIPPED'], default: 'SCHEDULED' },
                evidence: { type: 'array', items: { type: 'string' }, default: [] }

              required: ['actionId', 'actionType', 'targetData', 'scheduledAt']

            default: []


        required: ['acceptanceId', 'withdrawalType', 'withdrawalScope', 'reason']

      response: {
        200: {
          type: 'object',
          properties: {
            withdrawalId: { type: 'string' },
            message: { type: 'string' }




  }, async (request: WithdrawConsentRequest, reply: FastifyReply) => {
    try {
      const validatedBody = WithdrawConsentSchema.parse(request.body);

      const withdrawal = {
        ...validatedBody,
        userId: request.user!.id
      };

      const result = await policyAcceptanceService.withdrawConsent(withdrawal);
      
      reply.send({
        withdrawalId: result.withdrawalId,
        message: 'Consent withdrawal processed successfully'
      });
 catch (error) {
      if (error instanceof z.ZodError) {
        reply.code(400).send({
          error: 'Validation Error',
          message: 'Invalid request data',
          details: error.errors
        });
 else {
        fastify.log.error('Error processing consent withdrawal:', error);
        reply.code(500).send({
          error: 'Internal Server Error',
          message: 'Failed to process consent withdrawal'
        });


  });

  /**
   * Get user's consent status
   * GET /api/policy-acceptance-tracking/users/:userId/consent-status
   */
  fastify.get('/users/:userId/consent-status', {
    preHandler: [authenticate],
    config: { rateLimit: { max: 200, timeWindow: '1 minute' } },
    schema: {
      params: {
        type: 'object',
        properties: {
          userId: { type: 'string' }

        required: ['userId']

      response: {
        200: {
          type: 'object',
          properties: {
            acceptances: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  acceptanceId: { type: 'string' },
                  policyId: { type: 'string' },
                  policyVersion: { type: 'string' },
                  policyType: { type: 'string' },
                  acceptanceType: { type: 'string' },
                  acceptedAt: { type: 'string', format: 'date-time' },
                  status: { type: 'string' }



            complianceFlags: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  flagId: { type: 'string' },
                  flagType: { type: 'string' },
                  severity: { type: 'string' },
                  description: { type: 'string' },
                  raisedAt: { type: 'string', format: 'date-time' }



            riskScore: { type: 'number' },
            renewalRequests: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  renewalId: { type: 'string' },
                  originalAcceptanceId: { type: 'string' },
                  scheduledDate: { type: 'string', format: 'date-time' },
                  renewalTrigger: { type: 'string' }







  }, async (request: UserConsentStatusRequest, reply: FastifyReply) => {
    try {
      const { userId } = request.params;

      // Validate user has permission to view this data
      if (request.user!.id !== userId && !request.user!.roles?.includes('admin')) {
        return reply.code(403).send({
          error: 'Forbidden',
          message: 'Insufficient permissions to view this user\'s consent status'
        });


      const consentStatus = await policyAcceptanceService.getUserConsentStatus(userId);
      
      reply.send({
        acceptances: consentStatus.acceptances.map(acceptance => ({
          acceptanceId: acceptance.acceptanceId,
          policyId: acceptance.policyId,
          policyVersion: acceptance.policyVersion,
          policyType: acceptance.policyType,
          acceptanceType: acceptance.acceptanceType,
          acceptedAt: acceptance.acceptedAt.toISOString(),
          status: acceptance.status
        })),
        complianceFlags: consentStatus.complianceFlags.map(flag => ({
          flagId: flag.flagId,
          flagType: flag.flagType,
          severity: flag.severity,
          description: flag.description,
          raisedAt: flag.raisedAt.toISOString()
        })),
        riskScore: consentStatus.riskScore,
        renewalRequests: consentStatus.renewalRequests.map(renewal => ({
          renewalId: renewal.renewalId,
          originalAcceptanceId: renewal.originalAcceptanceId,
          scheduledDate: renewal.scheduledDate.toISOString(),
          renewalTrigger: renewal.renewalTrigger
        }))
      });
 catch (error) {
      fastify.log.error('Error getting user consent status:', error);
      reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to get user consent status'
      });

  });

  /**
   * Export user data for GDPR compliance
   * GET /api/policy-acceptance-tracking/users/:userId/export
   */
  fastify.get('/users/:userId/export', {
    preHandler: [authenticate],
    config: { rateLimit: { max: 10, timeWindow: '1 hour' } },
    schema: {
      params: {
        type: 'object',
        properties: {
          userId: { type: 'string' }

        required: ['userId']

      querystring: {
        type: 'object',
        properties: {
          format: { type: 'string', enum: ['JSON', 'CSV', 'XML'], default: 'JSON' }


      response: {
        200: {
          type: 'object',
          properties: {
            userData: { type: 'object' },
            acceptances: { type: 'array' },
            consents: { type: 'array' },
            withdrawals: { type: 'array' }




  }, async (request: ExportUserDataRequest, reply: FastifyReply) => {
    try {
      const { userId } = request.params;
      const { format } = request.query;

      // Validate user has permission to export this data
      if (request.user!.id !== userId && !request.user!.roles?.includes('admin')) {
        return reply.code(403).send({
          error: 'Forbidden',
          message: 'Insufficient permissions to export this user\'s data'
        });


      const exportData = await policyAcceptanceService.exportUserData(userId, format);
      
      reply.send(exportData);
 catch (error) {
      fastify.log.error('Error exporting user data:', error);
      reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to export user data'
      });

  });

  /**
   * Process consent renewals (admin endpoint)
   * POST /api/policy-acceptance-tracking/admin/process-renewals
   */
  fastify.post('/admin/process-renewals', {
    preHandler: [authenticate],
    config: { rateLimit: { max: 10, timeWindow: '1 hour' } },
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            processedRenewals: { type: 'number' },
            notificationsSent: { type: 'number' },
            message: { type: 'string' }




  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      // Check if user has admin role
      if (!request.user?.roles?.includes('admin')) {
        return reply.code(403).send({
          error: 'Forbidden',
          message: 'Admin role required'
        });


      const result = await policyAcceptanceService.processConsentRenewals();
      
      reply.send({
        processedRenewals: result.processedRenewals,
        notificationsSent: result.notificationsSent,
        message: `Processed ${result.processedRenewals} renewals, sent ${result.notificationsSent} notifications`
      });
 catch (error) {
      fastify.log.error('Error processing consent renewals:', error);
      reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to process consent renewals'
      });

  });

  /**
   * Get compliance dashboard (admin endpoint)
   * GET /api/policy-acceptance-tracking/admin/compliance-dashboard
   */
  fastify.get('/admin/compliance-dashboard', {
    preHandler: [authenticate],
    config: { rateLimit: { max: 50, timeWindow: '1 minute' } },
    schema: {
      querystring: {
        type: 'object',
        properties: {
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          policyTypes: { type: 'array', items: { type: 'string' } },
          flagTypes: { type: 'array', items: { type: 'string' } }


      response: {
        200: {
          type: 'object',
          properties: {
            acceptanceStats: { type: 'object' },
            complianceMetrics: { type: 'object' },
            riskAnalysis: { type: 'object' },
            renewalMetrics: { type: 'object' }




  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      // Check if user has admin role
      if (!request.user?.roles?.includes('admin')) {
        return reply.code(403).send({
          error: 'Forbidden',
          message: 'Admin role required'
        });


      const filters = request.query as any;
      if (filters.startDate) filters.dateRange = { start: new Date(filters.startDate), end: new Date(filters.endDate || Date.now()) };

      const dashboard = await policyAcceptanceService.getComplianceDashboard(filters);
      
      reply.send(dashboard);
 catch (error) {
      fastify.log.error('Error getting compliance dashboard:', error);
      reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to get compliance dashboard'
      });

  });

  /**
   * Health check endpoint
   * GET /api/policy-acceptance-tracking/health
   */
  fastify.get('/health', {
    config: { rateLimit: { max: 200, timeWindow: '1 minute' } },
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' },
            version: { type: 'string' }




  }, async (request: FastifyRequest, reply: FastifyReply) => {
    reply.send({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  });


// Register the plugin
export default async function (fastify: FastifyInstance) {
  await fastify.register(policyAcceptanceTrackingRoutes, { prefix: '/api/policy-acceptance-tracking' });
