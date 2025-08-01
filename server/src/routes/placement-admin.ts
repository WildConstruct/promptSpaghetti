/**
 * Placement Admin Routes - Epic 17.5.2
 * 
 * Route configuration for placement management admin endpoints.
 * Integrates PlacementAdminController with the main Fastify server.
 * 
 * Task: E17-1753114397326-68B279 - Develop placement management
 * Epic: 17 - Backstage Admin Controls
 */

import { FastifyInstance, FastifyPluginOptions, FastifyPluginAsync } from 'fastify';
import { Database } from '../database';
import { PlacementManagementService } from '../services/placement/PlacementManagementService';
import { PlacementAdminController } from '../admin/PlacementAdminController';
import { AuditService } from '../auth/services/AuditService';

declare module 'fastify' {
  interface FastifyInstance {
    placementAdmin?: PlacementAdminController;








interface PlacementAdminOptions {
  prefix?: string;
  database: Database;
  auditService: AuditService;
  config?: {
    maxSlotsPerArea?: number;
    maxPlacementsPerSlot?: number;
    previewCacheTTL?: number;
    bulkOperationLimit?: number;
    analyticsRetentionDays?: number;



  };


const placementAdminPlugin: FastifyPluginAsync<PlacementAdminOptions> = async (
  fastify: FastifyInstance,
  options: PlacementAdminOptions
) => {
  // Initialize services
  const placementService = new PlacementManagementService(
    options.database,
    options.auditService
  );

  const placementAdminController = new PlacementAdminController(
    options.database,
    placementService,
    options.auditService,
    options.config
  );

  // Register controller with fastify instance for external access
  fastify.decorate('placementAdmin', placementAdminController);

  // Add authentication hook for all admin routes
  fastify.addHook('onRequest', async (request, reply) => {
    // Skip auth for health check
    if (request.url === '/admin/placement-system-status') {
      return;


    // TODO: Implement proper authentication
    // For now, just add a placeholder user context
    (request as any).user = {
      id: 'admin-user',
      role: 'admin',
      permissions: ['placement:read', 'placement:write', 'placement:delete']
    };
  });

  // Add request logging
  fastify.addHook('onRequest', async (request, reply) => {
    console.log(`📍 Placement Admin API: ${request.method} ${request.url}`);
  });

  // Add error handling
  fastify.addHook('onError', async (request, reply, error) => {
    console.error(`❌ Placement Admin API Error: ${error.message}`);
    
    // Log error to audit service
    if (options.auditService && (request as any).user) {
      await options.auditService.logEvent({
        userId: (request as any).user.id,
        action: 'placement_api_error',
        details: {
          method: request.method,
          url: request.url,
          error: error.message,
          stack: error.stack

        severity: 'error'
      });

  });

  // Register all placement admin routes
  await placementAdminController.registerRoutes(fastify);

  // Health check endpoint (no auth required)
  fastify.get('/health', async (request, reply) => {
    return {
      service: 'placement-admin',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
  });

  // API documentation endpoint
  fastify.get('/admin/placement-docs', async (request, reply) => {
    const docs = {
      service: 'Placement Management API',
      version: '1.0.0',
      description: 'Admin API for marketplace content placement management',
      endpoints: {
        slots: {
          'GET /admin/placement-slots': 'List placement slots with filtering',
          'POST /admin/placement-slots': 'Create new placement slot',
          'GET /admin/placement-slots/:slotId': 'Get placement slot details',
          'PUT /admin/placement-slots/:slotId': 'Update placement slot',
          'DELETE /admin/placement-slots/:slotId': 'Delete placement slot'

        placements: {
          'GET /admin/content-placements': 'Search content placements',
          'POST /admin/content-placements': 'Create content placement',
          'GET /admin/content-placements/:placementId': 'Get placement details',
          'PUT /admin/content-placements/:placementId': 'Update content placement',
          'DELETE /admin/content-placements/:placementId': 'Delete content placement'

        preview: {
          'POST /admin/placement-preview/:slotId': 'Generate placement preview',
          'GET /admin/placement-preview/:previewId': 'Get cached preview'

        analytics: {
          'GET /admin/placement-analytics': 'Get analytics dashboard data',
          'GET /admin/placement-metrics/:slotId': 'Get slot-specific metrics',
          'GET /admin/placement-performance': 'Get performance report'

        system: {
          'GET /admin/placement-system-status': 'Get system status',
          'POST /admin/placement-system-maintenance': 'Perform maintenance tasks',
          'GET /admin/placement-audit-log': 'Get audit log entries'

        bulk: {
          'POST /admin/placement-bulk-operations': 'Create bulk operation',
          'GET /admin/placement-bulk-operations/:operationId': 'Get operation status'


      schemas: {
        PlacementSlot: 'Defines placement slot configuration and properties',
        ContentPlacement: 'Defines content placement with scheduling and targeting',
        PlacementAnalytics: 'Analytics data structure for performance tracking',
        BulkPlacementOperation: 'Bulk operation tracking and status'

    };

    return docs;
  });

  console.log('📍 Placement Admin API plugin registered successfully');
};

export default placementAdminPlugin;
export { PlacementAdminOptions };