// Visual Diff API Routes
// Story 9.3.2 - Visual Diff Tool

import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { VisualDiffService } from '../services/visual-diff-service.js';
import { ComparisonDAO } from '../database/comparison-dao.js';
import { VersionHistoryDAO } from '../database/version-dao.js';
import {
  CompareVersionsRequestSchema,
  CreateDiffSessionRequestSchema,
  UpdateDiffSessionRequestSchema,
  ComparisonSchemas
 from '../database/comparison-models.js';

// Query schemas
const GetComparisonQuerySchema = z.object({
  include_details: z.string().transform(val => val === 'true').default('true')
});

const GetComparisonHistoryQuerySchema = z.object({
  page: z.string().transform(val => parseInt(val)).default('1'),
  limit: z.string().transform(val => parseInt(val)).default('50')
});

const GetStatisticsQuerySchema = z.object({
  graph_id: z.string().uuid().optional()
});

// Parameter schemas
const ComparisonParamsSchema = z.object({
  comparisonId: z.string().uuid()
});

const SessionParamsSchema = z.object({
  sessionId: z.string().uuid()
});

const GraphParamsSchema = z.object({
  graphId: z.string().uuid()
});

const visualDiffRoutes: FastifyPluginAsync = async (fastify) => {
  // Initialize services
  const comparisonDAO = new ComparisonDAO(fastify.db);
  const versionDAO = new VersionHistoryDAO(fastify.db);
  const visualDiffService = new VisualDiffService(comparisonDAO, versionDAO);

  // Middleware for authentication
  const requireAuth = async (request: any, reply: any) => {
    if (!request.user?.id) {
      return reply.code(401).send({ error: 'Authentication required' });

  };

  // Compare two graph versions
  fastify.post<{
    Body: z.infer<typeof CompareVersionsRequestSchema>;
>('/compare', {
    preHandler: requireAuth,
    schema: {
      body: CompareVersionsRequestSchema,
      response: {
        200: z.object({
          success: z.boolean(),
          data: z.record(z.unknown()),
          metadata: z.object({
            comparison_id: z.string().uuid(),
            duration_ms: z.number(),
            similarity_score: z.number(),
            changes_count: z.number()




  }, async (request, reply) => {
    try {
      const comparison = await visualDiffService.compareVersions(
        request.body,
        request.user.id
      );

      return {
        success: true,
        data: comparison,
        metadata: {
          comparison_id: comparison.id,
          duration_ms: comparison.comparison_duration_ms || 0,
          similarity_score: comparison.similarity_score,
          changes_count: comparison.changes_summary.total_changes

      };
 catch (error) {
      fastify.log.error('Comparison failed:', error);
      return reply.code(500).send({
        success: false,
        error: 'Comparison failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  // Get existing comparison
  fastify.get<{
    Params: z.infer<typeof ComparisonParamsSchema>;
    Querystring: z.infer<typeof GetComparisonQuerySchema>;
>('/comparisons/:comparisonId', {
    preHandler: requireAuth,
    schema: {
      params: ComparisonParamsSchema,
      querystring: GetComparisonQuerySchema

  }, async (request, reply) => {
    try {
      const comparison = await comparisonDAO.getComparison(request.params.comparisonId);
      if (!comparison) {
        return reply.code(404).send({ error: 'Comparison not found' });


      return {
        success: true,
        data: comparison
      };
 catch (error) {
      fastify.log.error('Failed to get comparison:', error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to get comparison'
      });

  });

  // Create diff session
  fastify.post<{
    Body: z.infer<typeof CreateDiffSessionRequestSchema>;
>('/sessions', {
    preHandler: requireAuth,
    schema: {
      body: CreateDiffSessionRequestSchema,
      response: {
        201: z.object({
          success: z.boolean(),
          data: z.record(z.unknown()),
          session_id: z.string().uuid()



  }, async (request, reply) => {
    try {
      const session = await visualDiffService.createDiffSession(
        request.body,
        request.user.id
      );

      return reply.code(201).send({
        success: true,
        data: session,
        session_id: session.id
      });
 catch (error) {
      fastify.log.error('Failed to create diff session:', error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to create diff session',
        message: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  // Get diff session
  fastify.get<{
    Params: z.infer<typeof SessionParamsSchema>;
>('/sessions/:sessionId', {
    preHandler: requireAuth,
    schema: {
      params: SessionParamsSchema

  }, async (request, reply) => {
    try {
      const result = await visualDiffService.getDiffSession(
        request.params.sessionId,
        request.user.id
      );

      if (!result) {
        return reply.code(404).send({ error: 'Session not found or access denied' });


      return {
        success: true,
        data: {
          session: result.session,
          comparison: result.comparison

      };
 catch (error) {
      fastify.log.error('Failed to get diff session:', error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to get diff session'
      });

  });

  // Update diff session
  fastify.patch<{
    Params: z.infer<typeof SessionParamsSchema>;
    Body: z.infer<typeof UpdateDiffSessionRequestSchema>;
>('/sessions/:sessionId', {
    preHandler: requireAuth,
    schema: {
      params: SessionParamsSchema,
      body: UpdateDiffSessionRequestSchema

  }, async (request, reply) => {
    try {
      const session = await visualDiffService.updateDiffSession(
        request.params.sessionId,
        request.body,
        request.user.id
      );

      if (!session) {
        return reply.code(404).send({ error: 'Session not found or access denied' });


      return {
        success: true,
        data: session
      };
 catch (error) {
      fastify.log.error('Failed to update diff session:', error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to update diff session'
      });

  });

  // Delete diff session
  fastify.delete<{
    Params: z.infer<typeof SessionParamsSchema>;
>('/sessions/:sessionId', {
    preHandler: requireAuth,
    schema: {
      params: SessionParamsSchema

  }, async (request, reply) => {
    try {
      const success = await visualDiffService.deleteDiffSession(
        request.params.sessionId,
        request.user.id
      );

      if (!success) {
        return reply.code(404).send({ error: 'Session not found or access denied' });


      return {
        success: true,
        message: 'Session deleted successfully'
      };
 catch (error) {
      fastify.log.error('Failed to delete diff session:', error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to delete diff session'
      });

  });

  // Get user's diff sessions
  fastify.get('/sessions', {
    preHandler: requireAuth
  }, async (request, reply) => {
    try {
      const sessions = await visualDiffService.getUserDiffSessions(request.user.id);

      return {
        success: true,
        data: sessions,
        count: sessions.length
      };
 catch (error) {
      fastify.log.error('Failed to get user sessions:', error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to get user sessions'
      });

  });

  // Get comparison history for a graph
  fastify.get<{
    Params: z.infer<typeof GraphParamsSchema>;
    Querystring: z.infer<typeof GetComparisonHistoryQuerySchema>;
>('/graphs/:graphId/comparisons', {
    preHandler: requireAuth,
    schema: {
      params: GraphParamsSchema,
      querystring: GetComparisonHistoryQuerySchema

  }, async (request, reply) => {
    try {
      const history = await visualDiffService.getComparisonHistory(
        request.params.graphId,
        request.query.page,
        request.query.limit
      );

      return {
        success: true,
        data: history.comparisons,
        pagination: {
          page: history.page,
          total: history.total,
          total_pages: history.total_pages,
          limit: request.query.limit

      };
 catch (error) {
      fastify.log.error('Failed to get comparison history:', error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to get comparison history'
      });

  });

  // Get comparison statistics
  fastify.get<{
    Querystring: z.infer<typeof GetStatisticsQuerySchema>;
>('/statistics', {
    preHandler: requireAuth,
    schema: {
      querystring: GetStatisticsQuerySchema

  }, async (request, reply) => {
    try {
      const stats = await visualDiffService.getComparisonStatistics(request.query.graph_id);

      return {
        success: true,
        data: stats
      };
 catch (error) {
      fastify.log.error('Failed to get statistics:', error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to get statistics'
      });

  });

  // Quick compare endpoint for UI
  fastify.post<{
    Body: {
      graph_id: string;
      source_version_id: string;
      target_version_id: string;
      comparison_type?: 'structural' | 'semantic' | 'visual';
    };
>('/quick-compare', {
    preHandler: requireAuth,
    schema: {
      body: z.object({
        graph_id: z.string().uuid(),
        source_version_id: z.string().uuid(),
        target_version_id: z.string().uuid(),
        comparison_type: z.enum(['structural', 'semantic', 'visual']).optional().default('structural')


  }, async (request, reply) => {
    try {
      // Quick comparison without creating a session
      const comparison = await visualDiffService.compareVersions({
        source_version_id: request.body.source_version_id,
        target_version_id: request.body.target_version_id,
        comparison_type: request.body.comparison_type,
        include_details: false
      }, request.user.id);

      return {
        success: true,
        data: {
          similarity_score: comparison.similarity_score,
          changes_summary: comparison.changes_summary,
          comparison_id: comparison.id,
          duration_ms: comparison.comparison_duration_ms

      };
 catch (error) {
      fastify.log.error('Quick comparison failed:', error);
      return reply.code(500).send({
        success: false,
        error: 'Quick comparison failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  // Batch compare endpoint for comparing multiple version pairs
  fastify.post<{
    Body: {
      comparisons: Array<{
        source_version_id: string;
        target_version_id: string;
        comparison_type?: 'structural' | 'semantic' | 'visual';
>;
    };
>('/batch-compare', {
    preHandler: requireAuth,
    schema: {
      body: z.object({
        comparisons: z.array(z.object({
          source_version_id: z.string().uuid(),
          target_version_id: z.string().uuid(),
          comparison_type: z.enum(['structural', 'semantic', 'visual']).optional().default('structural')
        })).max(10) // Limit batch size


  }, async (request, reply) => {
    try {
      const results = await Promise.allSettled(
        request.body.comparisons.map(comp =>
          visualDiffService.compareVersions({
            source_version_id: comp.source_version_id,
            target_version_id: comp.target_version_id,
            comparison_type: comp.comparison_type,
            include_details: false
          }, request.user.id)

      );

      const successful = results
        .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
        .map(result => ({
          similarity_score: result.value.similarity_score,
          changes_summary: result.value.changes_summary,
          comparison_id: result.value.id,
          source_version_id: result.value.source_version_id,
          target_version_id: result.value.target_version_id
        }));

      const failed = results
        .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
        .map(result => ({
          error: result.reason.message || 'Unknown error'
        }));

      return {
        success: true,
        data: {
          successful,
          failed,
          total_requested: request.body.comparisons.length,
          successful_count: successful.length,
          failed_count: failed.length

      };
 catch (error) {
      fastify.log.error('Batch comparison failed:', error);
      return reply.code(500).send({
        success: false,
        error: 'Batch comparison failed'
      });

  });

  // Admin endpoint for cleanup
  fastify.post('/admin/cleanup', {
    preHandler: [requireAuth, async (request: any, reply: any) => {
      // Add admin check here
      if (!request.user?.role || request.user.role !== 'admin') {
        return reply.code(403).send({ error: 'Admin access required' });

]
  }, async (request, reply) => {
    try {
      const result = await visualDiffService.cleanup();

      return {
        success: true,
        data: result,
        message: `Cleaned up ${result.expired_sessions_removed} sessions and ${result.old_comparisons_removed} comparisons`
      };
 catch (error) {
      fastify.log.error('Cleanup failed:', error);
      return reply.code(500).send({
        success: false,
        error: 'Cleanup failed'
      });

  });

  // Health check for visual diff service
  fastify.get('/health', async (request, reply) => {
    try {
      const stats = await visualDiffService.getComparisonStatistics();
      
      return {
        success: true,
        status: 'healthy',
        data: {
          total_comparisons: stats.total_comparisons,
          service_uptime: process.uptime(),
          memory_usage: process.memoryUsage(),
          timestamp: new Date().toISOString()

      };
 catch (error) {
      fastify.log.error('Health check failed:', error);
      return reply.code(503).send({
        success: false,
        status: 'unhealthy',
        error: 'Service unavailable'
      });

  });
};

export default visualDiffRoutes;