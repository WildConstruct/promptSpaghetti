/**
 * User Access Transparency API Routes
 * 
 * RESTful API endpoints for user access transparency features including
 * data inventory, activity monitoring, DSAR processing, and privacy controls.
 * 
 * Part of Epic 19 - Data Protection & Privacy Controls
 * Task: T-1752989143998-872 - Create user access transparency tools
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import {
  UserAccessTransparencyService,
  TransparencyConfig,
  DataSubjectAccessRequest,
  TransparencySettings
 from '../../../packages/core/security/UserAccessTransparency';

// Request schemas
const InventoryRequestSchema = z.object({
  refresh: z.boolean().optional().default(false),
  categories: z.array(z.string()).optional(),
  includeExpired: z.boolean().optional().default(false)
});

const ActivityRequestSchema = z.object({
  range: z.enum(['1d', '7d', '30d', '90d']).optional().default('7d'),
  type: z.enum(['all', 'USER', 'SYSTEM', 'THIRD_PARTY', 'ADMIN']).optional().default('all'),
  search: z.string().optional(),
  limit: z.coerce.number().min(1).max(1000).optional().default(50),
  offset: z.coerce.number().min(0).optional().default(0)
});

const DSARRequestSchema = z.object({
  requestType: z.enum(['ACCESS', 'RECTIFICATION', 'ERASURE', 'PORTABILITY', 'RESTRICTION', 'OBJECTION']),
  dataCategories: z.array(z.string()).optional(),
  timeRange: z.object({
    start: z.string().datetime(),
    end: z.string().datetime()
  }).optional(),
  specificData: z.array(z.string()).optional(),
  reason: z.string().optional(),
  urgency: z.enum(['STANDARD', 'URGENT', 'EMERGENCY']).optional().default('STANDARD'),
  preferredFormat: z.enum(['JSON', 'XML', 'CSV', 'PDF', 'HUMAN_READABLE']).optional().default('JSON')
});

const SettingsUpdateSchema = z.object({
  notificationPreferences: z.object({
    realTimeNotifications: z.boolean().optional(),
    emailNotifications: z.boolean().optional(),
    pushNotifications: z.boolean().optional(),
    frequency: z.enum(['IMMEDIATE', 'HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY']).optional(),
    eventTypes: z.array(z.string()).optional(),
    quietHours: z.object({
      enabled: z.boolean(),
      start: z.string(),
      end: z.string(),
      timezone: z.string()
    }).optional()
  }).optional(),
  privacySettings: z.object({
    dataMinimizationEnabled: z.boolean().optional(),
    automaticDataDeletion: z.boolean().optional(),
    thirdPartyDataSharingOptOut: z.boolean().optional(),
    marketingOptOut: z.boolean().optional(),
    analyticsOptOut: z.boolean().optional(),
    personalizationOptOut: z.boolean().optional(),
    dataPortabilityEnabled: z.boolean().optional(),
    privacyScoreVisible: z.boolean().optional()
  }).optional(),
  consentPreferences: z.object({
    granularConsent: z.boolean().optional(),
    automaticConsentRenewal: z.boolean().optional(),
    consentReminders: z.boolean().optional(),
    explicitConsentRequired: z.boolean().optional(),
    purposeLimitationStrict: z.boolean().optional(),
    consentWithdrawalEasy: z.boolean().optional()
  }).optional(),
  dataRetentionPreferences: z.object({
    minimumRetention: z.boolean().optional(),
    automaticDeletionReminders: z.boolean().optional(),
    dataArchivingPreference: z.enum(['DELETE', 'ARCHIVE', 'USER_CHOICE']).optional(),
    retentionExtensionNotifications: z.boolean().optional()
  }).optional(),
  accessControlPreferences: z.object({
    requireExplicitApproval: z.boolean().optional(),
    restrictedDataAccess: z.enum(['NEVER', 'WITH_APPROVAL', 'EMERGENCY_ONLY']).optional(),
    thirdPartyAccessRestrictions: z.boolean().optional(),
    accessTimeRestrictions: z.boolean().optional(),
    locationRestrictions: z.boolean().optional(),
    deviceRestrictions: z.boolean().optional()
  }).optional()
});

const ExportRequestSchema = z.object({
  format: z.enum(['JSON', 'XML', 'CSV', 'PDF']).optional().default('JSON'),
  categories: z.array(z.string()).optional(),
  includeMetadata: z.boolean().optional().default(true),
  includeHistory: z.boolean().optional().default(false)
});

const DeleteRequestSchema = z.object({
  categoryId: z.string().min(1),
  reason: z.string().min(10),
  confirmationToken: z.string().min(1)
});

// Type definitions for requests
interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    id: string;
    email: string;
    roles: string[];
  };


interface InventoryRequest extends AuthenticatedRequest {
  Querystring: z.infer<typeof InventoryRequestSchema>;


interface ActivityRequest extends AuthenticatedRequest {
  Querystring: z.infer<typeof ActivityRequestSchema>;


interface DSARCreateRequest extends AuthenticatedRequest {
  Body: z.infer<typeof DSARRequestSchema>;


interface SettingsRequest extends AuthenticatedRequest {
  Body: z.infer<typeof SettingsUpdateSchema>;


interface ExportRequest extends AuthenticatedRequest {
  Querystring: z.infer<typeof ExportRequestSchema>;


interface DeleteRequest extends AuthenticatedRequest {
  Body: z.infer<typeof DeleteRequestSchema>;
  Params: { categoryId: string };


interface DSARStatusRequest extends AuthenticatedRequest {
  Params: { requestId: string };


export async function transparencyRoutes(fastify: FastifyInstance) {
  // Initialize transparency service
  const transparencyConfig: TransparencyConfig = {
    enableRealTimeNotifications: true,
    enableDataUsageTracking: true,
    enableThirdPartyDisclosures: true,
    enablePrivacyScoring: true,
    enableAutoDataInventory: true,
    retentionPolicyVisibility: true,
    consentManagementEnabled: true,
    dsarAutomationEnabled: true,
    dataPortabilityEnabled: true,
    notificationChannels: []
  };

  const transparencyService = new UserAccessTransparencyService(transparencyConfig);

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

  /**
   * Get user's data inventory
   * GET /api/transparency/inventory
   */
  fastify.get('/inventory', {
    preHandler: [authenticate],
    config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
    schema: {
      querystring: {
        type: 'object',
        properties: {
          refresh: { type: 'boolean', default: false },
          categories: { type: 'array', items: { type: 'string' } },
          includeExpired: { type: 'boolean', default: false }


      response: {
        200: {
          type: 'object',
          properties: {
            userId: { type: 'string' },
            generatedAt: { type: 'string', format: 'date-time' },
            totalDataPoints: { type: 'number' },
            sensitiveDataCount: { type: 'number' },
            dataCategories: { type: 'array', items: { type: 'object' } },
            retentionSummary: { type: 'object' },
            thirdPartySharing: { type: 'array', items: { type: 'object' } },
            complianceStatus: { type: 'object' },
            privacyScore: { type: 'object' }




  }, async (request: InventoryRequest, reply: FastifyReply) => {
    try {
      const queryParams = InventoryRequestSchema.parse(request.query);
      const userId = request.user!.id;

      let inventory;
      if (queryParams.refresh) {
        inventory = await transparencyService.generateUserDataInventory(userId);
 else {
        // Try to get cached inventory first, generate if not available
        try {
          inventory = await transparencyService.getUserDataInventory(userId);
 catch {
          inventory = await transparencyService.generateUserDataInventory(userId);



      // Filter by categories if specified
      if (queryParams.categories && queryParams.categories.length > 0) {
        inventory.dataCategories = inventory.dataCategories.filter(
          category => queryParams.categories!.includes(category.category)
        );


      reply.send(inventory);
 catch (error) {
      fastify.log.error('Error fetching data inventory:', error);
      reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to fetch data inventory'
      });

  });

  /**
   * Get user's access activity
   * GET /api/transparency/activities
   */
  fastify.get('/activities', {
    preHandler: [authenticate],
    config: { rateLimit: { max: 30, timeWindow: '1 minute' } },
    schema: {
      querystring: {
        type: 'object',
        properties: {
          range: { type: 'string', enum: ['1d', '7d', '30d', '90d'], default: '7d' },
          type: { type: 'string', enum: ['all', 'USER', 'SYSTEM', 'THIRD_PARTY', 'ADMIN'], default: 'all' },
          search: { type: 'string' },
          limit: { type: 'integer', minimum: 1, maximum: 1000, default: 50 },
          offset: { type: 'integer', minimum: 0, default: 0 }


      response: {
        200: {
          type: 'object',
          properties: {
            activities: { type: 'array', items: { type: 'object' } },
            pagination: {
              type: 'object',
              properties: {
                limit: { type: 'integer' },
                offset: { type: 'integer' },
                total: { type: 'integer' }






  }, async (request: ActivityRequest, reply: FastifyReply) => {
    try {
      const queryParams = ActivityRequestSchema.parse(request.query);
      const userId = request.user!.id;

      // Calculate time range
      const now = new Date();
      const rangeMap = {
        '1d': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000,
        '90d': 90 * 24 * 60 * 60 * 1000
      };
      
      const timeRange = {
        start: new Date(now.getTime() - rangeMap[queryParams.range]),
        end: now
      };

      const activities = await transparencyService.getUserAccessActivity(
        userId,
        timeRange,
        queryParams.limit
      );

      // Filter by actor type if specified
      let filteredActivities = activities;
      if (queryParams.type !== 'all') {
        filteredActivities = activities.filter(
          activity => activity.actor.type === queryParams.type
        );


      // Apply search filter if specified
      if (queryParams.search) {
        const searchTerm = queryParams.search.toLowerCase();
        filteredActivities = filteredActivities.filter(activity =>
          activity.actor.name.toLowerCase().includes(searchTerm) ||
          activity.purpose.toLowerCase().includes(searchTerm) ||
          activity.dataAccessed.some(data => 
            data.dataType.toLowerCase().includes(searchTerm)

        );


      // Apply pagination
      const paginatedActivities = filteredActivities.slice(
        queryParams.offset,
        queryParams.offset + queryParams.limit
      );

      reply.send({
        activities: paginatedActivities,
        pagination: {
          limit: queryParams.limit,
          offset: queryParams.offset,
          total: filteredActivities.length

      });
 catch (error) {
      fastify.log.error('Error fetching access activities:', error);
      reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to fetch access activities'
      });

  });

  /**
   * Submit Data Subject Access Request (DSAR)
   * POST /api/transparency/dsar
   */
  fastify.post('/dsar', {
    preHandler: [authenticate],
    config: { rateLimit: { max: 5, timeWindow: '1 hour' } },
    schema: {
      body: {
        type: 'object',
        properties: {
          requestType: { 
            type: 'string', 
            enum: ['ACCESS', 'RECTIFICATION', 'ERASURE', 'PORTABILITY', 'RESTRICTION', 'OBJECTION']

          dataCategories: { type: 'array', items: { type: 'string' } },
          timeRange: {
            type: 'object',
            properties: {
              start: { type: 'string', format: 'date-time' },
              end: { type: 'string', format: 'date-time' }


          specificData: { type: 'array', items: { type: 'string' } },
          reason: { type: 'string' },
          urgency: { type: 'string', enum: ['STANDARD', 'URGENT', 'EMERGENCY'], default: 'STANDARD' },
          preferredFormat: { type: 'string', enum: ['JSON', 'XML', 'CSV', 'PDF', 'HUMAN_READABLE'], default: 'JSON' }

        required: ['requestType']

      response: {
        200: {
          type: 'object',
          properties: {
            requestId: { type: 'string' },
            status: { type: 'string' },
            completionDeadline: { type: 'string', format: 'date-time' },
            message: { type: 'string' }




  }, async (request: DSARCreateRequest, reply: FastifyReply) => {
    try {
      const requestData = DSARRequestSchema.parse(request.body);
      const userId = request.user!.id;

      const dsarRequest = await transparencyService.submitDSAR(
        userId,
        requestData.requestType,
        {
          dataCategories: requestData.dataCategories,
          timeRange: requestData.timeRange ? {
            start: new Date(requestData.timeRange.start),
            end: new Date(requestData.timeRange.end)
 : undefined,
          specificData: requestData.specificData,
          reason: requestData.reason,
          identityVerified: true, // Assume verified through authentication
          urgency: requestData.urgency,
          preferredFormat: requestData.preferredFormat

      );

      reply.send({
        requestId: dsarRequest.requestId,
        status: dsarRequest.status,
        completionDeadline: dsarRequest.completionDeadline.toISOString(),
        message: `Your ${requestData.requestType.toLowerCase()} request has been submitted and will be processed within the required timeframe.`
      });
 catch (error) {
      fastify.log.error('Error submitting DSAR:', error);
      reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to submit data subject access request'
      });

  });

  /**
   * Get DSAR status
   * GET /api/transparency/dsar/:requestId
   */
  fastify.get('/dsar/:requestId', {
    preHandler: [authenticate],
    config: { rateLimit: { max: 20, timeWindow: '1 minute' } },
    schema: {
      params: {
        type: 'object',
        properties: {
          requestId: { type: 'string' }

        required: ['requestId']

      response: {
        200: {
          type: 'object',
          properties: {
            requestId: { type: 'string' },
            requestType: { type: 'string' },
            status: { type: 'string' },
            requestedAt: { type: 'string', format: 'date-time' },
            completionDeadline: { type: 'string', format: 'date-time' },
            processingHistory: { type: 'array', items: { type: 'object' } },
            response: { type: 'object' }




  }, async (request: DSARStatusRequest, reply: FastifyReply) => {
    try {
      const { requestId } = request.params;
      const userId = request.user!.id;

      const dsarRequest = await transparencyService.getDSARStatus(requestId, userId);
      
      if (!dsarRequest) {
        return reply.code(404).send({
          error: 'Not Found',
          message: 'DSAR request not found'
        });


      reply.send(dsarRequest);
 catch (error) {
      fastify.log.error('Error fetching DSAR status:', error);
      reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to fetch DSAR status'
      });

  });

  /**
   * Export user data
   * GET /api/transparency/export
   */
  fastify.get('/export', {
    preHandler: [authenticate],
    config: { rateLimit: { max: 3, timeWindow: '1 hour' } },
    schema: {
      querystring: {
        type: 'object',
        properties: {
          format: { type: 'string', enum: ['JSON', 'XML', 'CSV', 'PDF'], default: 'JSON' },
          categories: { type: 'array', items: { type: 'string' } },
          includeMetadata: { type: 'boolean', default: true },
          includeHistory: { type: 'boolean', default: false }



  }, async (request: ExportRequest, reply: FastifyReply) => {
    try {
      const queryParams = ExportRequestSchema.parse(request.query);
      const userId = request.user!.id;

      const exportResponse = await transparencyService.exportUserData(
        userId,
        queryParams.format,
        queryParams.categories
      );

      if (exportResponse.downloadUrl) {
        // Redirect to download URL
        reply.redirect(exportResponse.downloadUrl);
 else {
        // Return file directly
        reply
          .header('Content-Disposition', `attachment; filename="user-data.${queryParams.format.toLowerCase()}"`)
          .header('Content-Type', this.getContentType(queryParams.format))
          .send(exportResponse);

 catch (error) {
      fastify.log.error('Error exporting user data:', error);
      reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to export user data'
      });

  });

  /**
   * Update transparency settings
   * PUT /api/transparency/settings
   */
  fastify.put('/settings', {
    preHandler: [authenticate],
    config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
    schema: {
      body: {
        type: 'object',
        properties: {
          notificationPreferences: { type: 'object' },
          privacySettings: { type: 'object' },
          consentPreferences: { type: 'object' },
          dataRetentionPreferences: { type: 'object' },
          accessControlPreferences: { type: 'object' }


      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            settings: { type: 'object' }




  }, async (request: SettingsRequest, reply: FastifyReply) => {
    try {
      const settingsUpdate = SettingsUpdateSchema.parse(request.body);
      const userId = request.user!.id;

      const updatedSettings = await transparencyService.updateTransparencySettings(
        userId,
        settingsUpdate
      );

      reply.send({
        message: 'Transparency settings updated successfully',
        settings: updatedSettings
      });
 catch (error) {
      if (error instanceof z.ZodError) {
        reply.code(400).send({
          error: 'Validation Error',
          message: 'Invalid settings data',
          details: error.errors
        });
 else {
        fastify.log.error('Error updating transparency settings:', error);
        reply.code(500).send({
          error: 'Internal Server Error',
          message: 'Failed to update transparency settings'
        });


  });

  /**
   * Delete data category
   * DELETE /api/transparency/delete/:categoryId
   */
  fastify.delete('/delete/:categoryId', {
    preHandler: [authenticate],
    config: { rateLimit: { max: 5, timeWindow: '1 hour' } },
    schema: {
      params: {
        type: 'object',
        properties: {
          categoryId: { type: 'string' }

        required: ['categoryId']

      body: {
        type: 'object',
        properties: {
          reason: { type: 'string', minLength: 10 },
          confirmationToken: { type: 'string', minLength: 1 }

        required: ['reason', 'confirmationToken']

      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            deletionId: { type: 'string' }




  }, async (request: DeleteRequest, reply: FastifyReply) => {
    try {
      const { categoryId } = request.params;
      const deleteData = DeleteRequestSchema.parse(request.body);
      const userId = request.user!.id;

      // Verify confirmation token (implement your own token verification)
      if (!this.verifyDeletionToken(deleteData.confirmationToken, userId, categoryId)) {
        return reply.code(400).send({
          error: 'Invalid Confirmation',
          message: 'Invalid confirmation token for data deletion'
        });


      const deletionResult = await transparencyService.deleteDataCategory(
        userId,
        categoryId,
        deleteData.reason
      );

      reply.send({
        message: 'Data deletion request submitted successfully',
        deletionId: deletionResult.deletionId
      });
 catch (error) {
      fastify.log.error('Error deleting data category:', error);
      reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to process data deletion request'
      });

  });

  /**
   * Get privacy score
   * GET /api/transparency/privacy-score
   */
  fastify.get('/privacy-score', {
    preHandler: [authenticate],
    config: { rateLimit: { max: 20, timeWindow: '1 minute' } },
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            overall: { type: 'number' },
            categories: { type: 'object' },
            trends: { type: 'array', items: { type: 'object' } },
            recommendations: { type: 'array', items: { type: 'object' } },
            lastCalculated: { type: 'string', format: 'date-time' }




  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const userId = request.user!.id;
      const privacyScore = await transparencyService.getPrivacyScore(userId);
      reply.send(privacyScore);
 catch (error) {
      fastify.log.error('Error fetching privacy score:', error);
      reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to fetch privacy score'
      });

  });

  // Helper methods
  function getContentType(format: string): string {
    switch (format) {
    case 'JSON': return 'application/json';
    case 'XML': return 'application/xml';
    case 'CSV': return 'text/csv';
    case 'PDF': return 'application/pdf';
    default: return 'application/octet-stream';



  function verifyDeletionToken(token: string, userId: string, categoryId: string): boolean {
    // Implement your own token verification logic
    // This could check against a database of issued tokens
    return token === `delete_${userId}_${categoryId}_${Date.now()}`;



// Register the plugin
export default async function (fastify: FastifyInstance) {
  await fastify.register(transparencyRoutes, { prefix: '/api/transparency' });
