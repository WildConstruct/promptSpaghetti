/**
 * Consent-Aware Feature Toggle API Routes
 * 
 * REST API endpoints for evaluating feature toggles with consent awareness.
 * Part of Epic 19 - Data Protection & Privacy Controls (substory 19.2.5)
 */

import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import ConsentFeatureToggleService, { ConsentAwareContext, FeatureConsentMapping } from '../services/ConsentFeatureToggleService';
import { FeatureToggleDAO } from '../database/feature-toggle-dao';



interface EvaluateToggleParams {
  key: string;







interface EvaluateToggleQuery {
  userId?: string;
  sessionId?: string;
  orgId?: string;
  includeConsentData?: boolean;







interface BatchEvaluateBody {
  keys: string[];
  context?: ConsentAwareContext;
  includeConsentData?: boolean;







interface RegisterMappingBody {
  mappings: FeatureConsentMapping[];







interface ConsentStatusBody {
  consents: Record<string, string>;
  userId?: string;
  sessionId?: string;





// Initialize the consent-aware toggle service
let consentToggleService: ConsentFeatureToggleService;

/**
 * Register consent-aware toggle routes
 */
export default async function consentToggleRoutes(fastify: FastifyInstance) {
  // Initialize service
  const dao = new FeatureToggleDAO(); // This would use your DB connection
  consentToggleService = new ConsentFeatureToggleService(dao, {
    enableConsentChecking: true,
    strictMode: process.env.NODE_ENV === 'production',
    auditConsentUsage: true
  });

  /**
   * GET /consent-toggles/:key
   * Evaluate a single feature toggle with consent awareness
   */
  fastify.get<{
    Params: EvaluateToggleParams;
    Querystring: EvaluateToggleQuery;
>('/consent-toggles/:key', {
    schema: {
      params: {
        type: 'object',
        properties: {
          key: { type: 'string' }

        required: ['key']

      querystring: {
        type: 'object',
        properties: {
          userId: { type: 'string' },
          sessionId: { type: 'string' },
          orgId: { type: 'string' },
          includeConsentData: { type: 'boolean' }


      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            result: {
              type: 'object',
              properties: {
                enabled: { type: 'boolean' },
                value: {},
                reason: { type: 'string' },
                variantKey: { type: 'string' },
                ruleMatched: { type: 'string' },
                metadata: { type: 'object' }

              required: ['enabled', 'value', 'reason']

            consentInfo: { type: 'object' }

          required: ['success', 'result']



  }, async (request, reply) => {
    try {
      const { key } = request.params;
      const { userId, sessionId, orgId, includeConsentData } = request.query;

      const context: ConsentAwareContext = {
        userId,
        sessionId,
        orgId,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent']
      };

      const result = await consentToggleService.evaluateToggle(key, context);

      const response: any = {
        success: true,
        result
      };

      // Optionally include consent information
      if (includeConsentData) {
        response.consentInfo = {
          isConsentRequired: consentToggleService.isConsentRequired(key),
          requiredConsents: consentToggleService.getConsentRequirements(key),
          consentChecked: result.metadata?.consentChecked || false,
          consentGranted: result.metadata?.consentGranted || false
        };


      return response;
 catch (error) {
      fastify.log.error('Consent toggle evaluation error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  /**
   * POST /consent-toggles/batch
   * Evaluate multiple feature toggles with consent awareness
   */
  fastify.post<{
    Body: BatchEvaluateBody;
>('/consent-toggles/batch', {
    schema: {
      body: {
        type: 'object',
        properties: {
          keys: {
            type: 'array',
            items: { type: 'string' },
            minItems: 1,
            maxItems: 50

          context: {
            type: 'object',
            properties: {
              userId: { type: 'string' },
              sessionId: { type: 'string' },
              orgId: { type: 'string' },
              consents: { type: 'object' }


          includeConsentData: { type: 'boolean' }

        required: ['keys']

      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            results: { type: 'object' },
            consentInfo: { type: 'object' }

          required: ['success', 'results']



  }, async (request, reply) => {
    try {
      const { keys, context = {}, includeConsentData } = request.body;

      const evaluationContext: ConsentAwareContext = {
        ...context,
        ipAddress: context.ipAddress || request.ip,
        userAgent: context.userAgent || request.headers['user-agent']
      };

      const results = await consentToggleService.evaluateToggles(keys, evaluationContext);

      const response: any = {
        success: true,
        results
      };

      // Optionally include consent information for all features
      if (includeConsentData) {
        const consentInfo: any = {};
        
        for (const key of keys) {
          consentInfo[key] = {
            isConsentRequired: consentToggleService.isConsentRequired(key),
            requiredConsents: consentToggleService.getConsentRequirements(key),
            consentChecked: results[key]?.metadata?.consentChecked || false,
            consentGranted: results[key]?.metadata?.consentGranted || false
          };

        
        response.consentInfo = consentInfo;


      return response;
 catch (error) {
      fastify.log.error('Batch consent toggle evaluation error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  /**
   * GET /consent-toggles/mappings
   * Get all registered consent mappings
   */
  fastify.get('/consent-toggles/mappings', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            mappings: { type: 'object' }

          required: ['success', 'mappings']



  }, async (request, reply) => {
    try {
      const mappings = consentToggleService.getConsentMappings();
      
      return {
        success: true,
        mappings
      };
 catch (error) {
      fastify.log.error('Get consent mappings error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  /**
   * POST /consent-toggles/mappings
   * Register new feature-to-consent mappings
   */
  fastify.post<{
    Body: RegisterMappingBody;
>('/consent-toggles/mappings', {
    schema: {
      body: {
        type: 'object',
        properties: {
          mappings: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                featureKey: { type: 'string' },
                requiredConsents: {
                  type: 'array',
                  items: { type: 'string' }

                requiredConsentLogic: {
                  type: 'string',
                  enum: ['AND', 'OR']

                fallbackBehavior: {
                  type: 'string',
                  enum: ['disable', 'default', 'minimal']

                consentExplanation: { type: 'string' }

              required: ['featureKey', 'requiredConsents', 'requiredConsentLogic', 'fallbackBehavior']



        required: ['mappings']

      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            registeredCount: { type: 'number' }

          required: ['success']



  }, async (request, reply) => {
    try {
      const { mappings } = request.body;

      consentToggleService.registerConsentMappings(mappings);

      return {
        success: true,
        message: 'Consent mappings registered successfully',
        registeredCount: mappings.length
      };
 catch (error) {
      fastify.log.error('Register consent mappings error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  /**
   * GET /consent-toggles/:key/requirements
   * Get consent requirements for a specific feature
   */
  fastify.get<{
    Params: EvaluateToggleParams;
>('/consent-toggles/:key/requirements', {
    schema: {
      params: {
        type: 'object',
        properties: {
          key: { type: 'string' }

        required: ['key']

      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            featureKey: { type: 'string' },
            isConsentRequired: { type: 'boolean' },
            requiredConsents: {
              type: 'array',
              items: { type: 'string' }

            mapping: { type: 'object' }

          required: ['success', 'featureKey', 'isConsentRequired']



  }, async (request, reply) => {
    try {
      const { key } = request.params;

      const isConsentRequired = consentToggleService.isConsentRequired(key);
      const requiredConsents = consentToggleService.getConsentRequirements(key);
      const mappings = consentToggleService.getConsentMappings();
      const mapping = mappings[key];

      return {
        success: true,
        featureKey: key,
        isConsentRequired,
        requiredConsents,
        mapping: mapping || null
      };
 catch (error) {
      fastify.log.error('Get consent requirements error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  /**
   * POST /consent-toggles/invalidate-cache
   * Invalidate consent cache for a user/session
   */
  fastify.post<{
    Body: ConsentStatusBody;
>('/consent-toggles/invalidate-cache', {
    schema: {
      body: {
        type: 'object',
        properties: {
          userId: { type: 'string' },
          sessionId: { type: 'string' }


      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }

          required: ['success']



  }, async (request, reply) => {
    try {
      const { userId, sessionId } = request.body;

      await consentToggleService.invalidateConsentCache(userId, sessionId);

      return {
        success: true,
        message: 'Consent cache invalidated successfully'
      };
 catch (error) {
      fastify.log.error('Invalidate consent cache error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  /**
   * GET /consent-toggles/health
   * Health check endpoint for consent-aware toggles
   */
  fastify.get('/consent-toggles/health', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            status: { type: 'string' },
            mappingsCount: { type: 'number' },
            consentCheckingEnabled: { type: 'boolean' }

          required: ['success', 'status']



  }, async (request, reply) => {
    try {
      const mappings = consentToggleService.getConsentMappings();
      
      return {
        success: true,
        status: 'healthy',
        mappingsCount: Object.keys(mappings).length,
        consentCheckingEnabled: true
      };
 catch (error) {
      fastify.log.error('Consent toggles health check error:', error);
      return reply.status(500).send({
        success: false,
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error'
      });

  });


export { consentToggleService };