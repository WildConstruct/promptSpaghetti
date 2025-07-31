/**
 * User Targeting API Routes
 * Epic 17.1.4 - User Targeting System
 * Routes for user segmentation and segment testing services
 */

import { FastifyPluginAsync } from 'fastify';
import {
  UserSegmentationService,
  CreateSegmentRequest,
  UpdateSegmentRequest,
  SegmentQuery,
  BatchEvaluationRequest,
} from '../services/UserSegmentationService';
import { SegmentTestingService, TestType, BatchTestRequest } from '../services/SegmentTestingService';
import { CohortAnalyzer } from '../analytics/CohortAnalyzer';
import { AnalyticsDAO } from '../database/analytics-dao';

// Initialize services
const analyticsDAO = new AnalyticsDAO();
const cohortAnalyzer = new CohortAnalyzer(analyticsDAO);
const segmentationService = new UserSegmentationService(cohortAnalyzer, analyticsDAO);
const segmentTestingService = new SegmentTestingService(segmentationService, cohortAnalyzer, analyticsDAO);

const userTargetingRoutes: FastifyPluginAsync = async fastify => {
  // User Segmentation Routes

  // Create a new user segment
  fastify.post<{
    Body: CreateSegmentRequest;
  }>('/segments', async (request, reply) => {
    try {
      const segmentRequest = {
        ...request.body,
        createdBy: request.user?.id || 'system',
      };

      const segment = await segmentationService.createSegment(segmentRequest);

      reply.code(201).send({
        success: true,
        data: segment,
      });
    } catch (error) {
      fastify.log.error('Failed to create segment:', error);
      reply.code(400).send({
        success: false,
        error: {
          code: 'SEGMENT_CREATION_FAILED',
          message: error instanceof Error ? error.message : 'Failed to create segment',
        },
      });
    }
  });

  // Get a specific segment
  fastify.get<{
    Params: { segmentId: string };
  }>('/segments/:segmentId', async (request, reply) => {
    try {
      const { segmentId } = request.params;
      const segment = await segmentationService.getSegment(segmentId);

      if (!segment) {
        return reply.code(404).send({
          success: false,
          error: { code: 'SEGMENT_NOT_FOUND', message: 'Segment not found' },
        });
      }

      reply.code(200).send({
        success: true,
        data: segment,
      });
    } catch (error) {
      fastify.log.error('Failed to get segment:', error);
      reply.code(400).send({
        success: false,
        error: {
          code: 'SEGMENT_FETCH_FAILED',
          message: error instanceof Error ? error.message : 'Failed to get segment',
        },
      });
    }
  });

  // Query segments with filters
  fastify.get<{
    Querystring: {
      search?: string;
      isActive?: boolean;
      category?: string;
      tags?: string;
      createdBy?: string;
      usedByToggle?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      limit?: number;
      offset?: number;
    };
  }>('/segments', async (request, reply) => {
    try {
      const query: SegmentQuery = {
        search: request.query.search,
        isActive: request.query.isActive,
        category: request.query.category,
        tags: request.query.tags ? request.query.tags.split(',') : undefined,
        createdBy: request.query.createdBy,
        usedByToggle: request.query.usedByToggle,
        sortBy: request.query.sortBy as any,
        sortOrder: request.query.sortOrder || 'desc',
        limit: request.query.limit || 50,
        offset: request.query.offset || 0,
      };

      const result = await segmentationService.querySegments(query);

      reply.code(200).send({
        success: true,
        data: result,
      });
    } catch (error) {
      fastify.log.error('Failed to query segments:', error);
      reply.code(400).send({
        success: false,
        error: {
          code: 'SEGMENT_QUERY_FAILED',
          message: error instanceof Error ? error.message : 'Failed to query segments',
        },
      });
    }
  });

  // Update a segment
  fastify.put<{
    Body: Omit<UpdateSegmentRequest, 'id' | 'updatedBy'>;
  }>('/segments/:segmentId', async (request, reply) => {
    try {
      const { segmentId } = request.params as { segmentId: string };
      const updateRequest = {
        ...request.body,
        id: segmentId,
        updatedBy: request.user?.id || 'system',
      };

      const updatedSegment = await segmentationService.updateSegment(updateRequest);

      if (!updatedSegment) {
        return reply.code(404).send({
          success: false,
          error: { code: 'SEGMENT_NOT_FOUND', message: 'Segment not found' },
        });
      }

      reply.code(200).send({
        success: true,
        data: updatedSegment,
      });
    } catch (error) {
      fastify.log.error('Failed to update segment:', error);
      reply.code(400).send({
        success: false,
        error: {
          code: 'SEGMENT_UPDATE_FAILED',
          message: error instanceof Error ? error.message : 'Failed to update segment',
        },
      });
    }
  });

  // Delete a segment
  fastify.delete<{
    Params: { segmentId: string };
  }>('/segments/:segmentId', async (request, reply) => {
    try {
      const { segmentId } = request.params;
      const deleted = await segmentationService.deleteSegment(segmentId, request.user?.id || 'system');

      if (!deleted) {
        return reply.code(404).send({
          success: false,
          error: { code: 'SEGMENT_NOT_FOUND', message: 'Segment not found' },
        });
      }

      reply.code(200).send({
        success: true,
        data: { deleted: true },
      });
    } catch (error) {
      fastify.log.error('Failed to delete segment:', error);
      reply.code(400).send({
        success: false,
        error: {
          code: 'SEGMENT_DELETE_FAILED',
          message: error instanceof Error ? error.message : 'Failed to delete segment',
        },
      });
    }
  });

  // Evaluate user for segment
  fastify.post<{
    Body: { userId: string };
  }>('/segments/:segmentId/evaluate', async (request, reply) => {
    try {
      const { segmentId } = request.params as { segmentId: string };
      const { userId } = request.body;

      const result = await segmentationService.evaluateUserForSegment(userId, segmentId);

      reply.code(200).send({
        success: true,
        data: result,
      });
    } catch (error) {
      fastify.log.error('Failed to evaluate user for segment:', error);
      reply.code(400).send({
        success: false,
        error: {
          code: 'EVALUATION_FAILED',
          message: error instanceof Error ? error.message : 'Failed to evaluate user for segment',
        },
      });
    }
  });

  // Batch evaluate segments
  fastify.post<{
    Body: BatchEvaluationRequest;
  }>('/segments/batch-evaluate', async (request, reply) => {
    try {
      const result = await segmentationService.batchEvaluateSegments(request.body);

      reply.code(200).send({
        success: true,
        data: result,
      });
    } catch (error) {
      fastify.log.error('Failed to batch evaluate segments:', error);
      reply.code(400).send({
        success: false,
        error: {
          code: 'BATCH_EVALUATION_FAILED',
          message: error instanceof Error ? error.message : 'Failed to batch evaluate segments',
        },
      });
    }
  });

  // Get segment metrics
  fastify.get<{
    Params: { segmentId: string };
    Querystring: { start?: string; end?: string };
  }>('/segments/:segmentId/metrics', async (request, reply) => {
    try {
      const { segmentId } = request.params;
      const timeWindow =
        request.query.start && request.query.end ? { start: request.query.start, end: request.query.end } : undefined;

      const metrics = await segmentationService.getSegmentMetrics(segmentId, timeWindow);

      reply.code(200).send({
        success: true,
        data: metrics,
      });
    } catch (error) {
      fastify.log.error('Failed to get segment metrics:', error);
      reply.code(400).send({
        success: false,
        error: {
          code: 'METRICS_FETCH_FAILED',
          message: error instanceof Error ? error.message : 'Failed to get segment metrics',
        },
      });
    }
  });

  // Segment Testing Routes

  // Create a segment test
  fastify.post<{
    Body: {
      name: string;
      description?: string;
      testType: TestType;
      segmentId: string;
      config?: any;
      expectations?: Array<{
        description: string;
        metric: string;
        operator: string;
        expectedValue: number | [number, number];
        severity: string;
      }>;
    };
  }>('/segments/:segmentId/tests', async (request, reply) => {
    try {
      const { segmentId } = request.params as { segmentId: string };
      const testRequest = {
        ...request.body,
        segmentId,
        createdBy: request.user?.id || 'system',
      };

      const test = await segmentTestingService.createTest(testRequest);

      reply.code(201).send({
        success: true,
        data: test,
      });
    } catch (error) {
      fastify.log.error('Failed to create segment test:', error);
      reply.code(400).send({
        success: false,
        error: {
          code: 'TEST_CREATION_FAILED',
          message: error instanceof Error ? error.message : 'Failed to create segment test',
        },
      });
    }
  });

  // Run a segment test
  fastify.post<{
    Params: { testId: string };
  }>('/tests/:testId/run', async (request, reply) => {
    try {
      const { testId } = request.params;
      const result = await segmentTestingService.runTest(testId);

      reply.code(200).send({
        success: true,
        data: result,
      });
    } catch (error) {
      fastify.log.error('Failed to run segment test:', error);
      reply.code(400).send({
        success: false,
        error: {
          code: 'TEST_EXECUTION_FAILED',
          message: error instanceof Error ? error.message : 'Failed to run segment test',
        },
      });
    }
  });

  // Cancel a running test
  fastify.post<{
    Params: { testId: string };
  }>('/tests/:testId/cancel', async (request, reply) => {
    try {
      const { testId } = request.params;
      const cancelled = await segmentTestingService.cancelTest(testId);

      reply.code(200).send({
        success: true,
        data: { cancelled },
      });
    } catch (error) {
      fastify.log.error('Failed to cancel segment test:', error);
      reply.code(400).send({
        success: false,
        error: {
          code: 'TEST_CANCELLATION_FAILED',
          message: error instanceof Error ? error.message : 'Failed to cancel segment test',
        },
      });
    }
  });

  // Get test details
  fastify.get<{
    Params: { testId: string };
  }>('/tests/:testId', async (request, reply) => {
    try {
      const { testId } = request.params;
      const test = await segmentTestingService.getTest(testId);

      if (!test) {
        return reply.code(404).send({
          success: false,
          error: { code: 'TEST_NOT_FOUND', message: 'Test not found' },
        });
      }

      reply.code(200).send({
        success: true,
        data: test,
      });
    } catch (error) {
      fastify.log.error('Failed to get segment test:', error);
      reply.code(400).send({
        success: false,
        error: {
          code: 'TEST_FETCH_FAILED',
          message: error instanceof Error ? error.message : 'Failed to get segment test',
        },
      });
    }
  });

  // Get test history for a segment
  fastify.get<{
    Params: { segmentId: string };
  }>('/segments/:segmentId/test-history', async (request, reply) => {
    try {
      const { segmentId } = request.params;
      const tests = await segmentTestingService.getTestHistory(segmentId);

      reply.code(200).send({
        success: true,
        data: { tests, total: tests.length },
      });
    } catch (error) {
      fastify.log.error('Failed to get test history:', error);
      reply.code(400).send({
        success: false,
        error: {
          code: 'TEST_HISTORY_FETCH_FAILED',
          message: error instanceof Error ? error.message : 'Failed to get test history',
        },
      });
    }
  });

  // Run batch tests
  fastify.post<{
    Body: BatchTestRequest;
  }>('/tests/batch', async (request, reply) => {
    try {
      const batchRequest = {
        ...request.body,
        createdBy: request.user?.id || 'system',
      };

      const result = await segmentTestingService.runBatchTests(batchRequest);

      reply.code(200).send({
        success: true,
        data: result,
      });
    } catch (error) {
      fastify.log.error('Failed to run batch tests:', error);
      reply.code(400).send({
        success: false,
        error: {
          code: 'BATCH_TEST_FAILED',
          message: error instanceof Error ? error.message : 'Failed to run batch tests',
        },
      });
    }
  });

  // Generate test report
  fastify.get<{
    Params: { segmentId: string };
    Querystring: { reportType?: 'summary' | 'detailed' | 'comparison' };
  }>('/segments/:segmentId/test-report', async (request, reply) => {
    try {
      const { segmentId } = request.params;
      const reportType = request.query.reportType || 'summary';

      const report = await segmentTestingService.generateTestReport(segmentId, reportType);

      reply.code(200).send({
        success: true,
        data: report,
      });
    } catch (error) {
      fastify.log.error('Failed to generate test report:', error);
      reply.code(400).send({
        success: false,
        error: {
          code: 'REPORT_GENERATION_FAILED',
          message: error instanceof Error ? error.message : 'Failed to generate test report',
        },
      });
    }
  });

  // Utility Routes

  // Get available test types
  fastify.get('/test-types', async (request, reply) => {
    reply.code(200).send({
      success: true,
      data: [
        { value: 'validation', label: 'Validation Test', description: 'Validate rule logic and syntax' },
        { value: 'performance', label: 'Performance Test', description: 'Test query performance at scale' },
        { value: 'accuracy', label: 'Accuracy Test', description: 'Test segment accuracy against known data' },
        { value: 'overlap', label: 'Overlap Test', description: 'Test segment overlap analysis' },
        { value: 'stability', label: 'Stability Test', description: 'Test segment stability over time' },
        { value: 'integration', label: 'Integration Test', description: 'Test integration with feature toggles' },
        { value: 'load', label: 'Load Test', description: 'Load testing with high user volume' },
        { value: 'regression', label: 'Regression Test', description: 'Regression testing after changes' },
      ],
    });
  });

  // Get available rule operators
  fastify.get('/rule-operators', async (request, reply) => {
    reply.code(200).send({
      success: true,
      data: [
        { value: 'equals', label: 'Equals', description: 'Exact match' },
        { value: 'not_equals', label: 'Not Equals', description: 'Does not match' },
        { value: 'contains', label: 'Contains', description: 'Contains substring' },
        { value: 'not_contains', label: 'Not Contains', description: 'Does not contain substring' },
        { value: 'starts_with', label: 'Starts With', description: 'Starts with prefix' },
        { value: 'ends_with', label: 'Ends With', description: 'Ends with suffix' },
        { value: 'matches', label: 'Matches Regex', description: 'Matches regular expression' },
        { value: 'not_matches', label: 'Not Matches Regex', description: 'Does not match regex' },
        { value: 'greater_than', label: 'Greater Than', description: 'Numeric greater than' },
        { value: 'less_than', label: 'Less Than', description: 'Numeric less than' },
        { value: 'greater_equal', label: 'Greater or Equal', description: 'Numeric greater than or equal' },
        { value: 'less_equal', label: 'Less or Equal', description: 'Numeric less than or equal' },
        { value: 'in', label: 'In List', description: 'Value in provided list' },
        { value: 'not_in', label: 'Not In List', description: 'Value not in provided list' },
        { value: 'exists', label: 'Exists', description: 'Field has any value' },
        { value: 'not_exists', label: 'Not Exists', description: 'Field is null or undefined' },
        { value: 'between', label: 'Between', description: 'Numeric value between range' },
        { value: 'within_days', label: 'Within Days', description: 'Date within specified days' },
        { value: 'older_than_days', label: 'Older Than Days', description: 'Date older than specified days' },
      ],
    });
  });

  // Get available user attributes for targeting
  fastify.get('/user-attributes', async (request, reply) => {
    reply.code(200).send({
      success: true,
      data: [
        { attribute: 'email', type: 'string', label: 'Email Address' },
        { attribute: 'registrationDate', type: 'date', label: 'Registration Date' },
        { attribute: 'lastLoginDate', type: 'date', label: 'Last Login Date' },
        { attribute: 'country', type: 'string', label: 'Country' },
        {
          attribute: 'subscriptionType',
          type: 'string',
          label: 'Subscription Type',
          values: ['free', 'basic', 'premium'],
        },
        { attribute: 'totalSessions', type: 'number', label: 'Total Sessions' },
        { attribute: 'deviceType', type: 'string', label: 'Device Type', values: ['desktop', 'mobile', 'tablet'] },
        { attribute: 'age', type: 'number', label: 'Age' },
        { attribute: 'plan', type: 'string', label: 'Plan Type' },
        { attribute: 'role', type: 'string', label: 'User Role' },
      ],
    });
  });

  // Quick segment evaluation (for UI preview)
  fastify.post<{
    Body: {
      rules: Array<{
        attribute: string;
        operator: string;
        value: any;
        logicalOperator?: 'AND' | 'OR';
      }>;
      sampleSize?: number;
    };
  }>('/segments/preview', async (request, reply) => {
    try {
      const { rules, sampleSize = 100 } = request.body;

      // Create a temporary segment for preview
      const tempSegment = await segmentationService.createSegment({
        name: `Preview_${Date.now()}`,
        rules,
        isActive: false,
        createdBy: 'preview',
      });

      // Get a quick evaluation
      const batchResult = await segmentationService.batchEvaluateSegments({
        segmentIds: [tempSegment.id],
        userQuery: {},
        includeDetails: true,
      });

      // Clean up temporary segment
      await segmentationService.deleteSegment(tempSegment.id, 'preview');

      reply.code(200).send({
        success: true,
        data: {
          estimatedUsers: tempSegment.estimatedUsers,
          matchingUsers: batchResult.segmentResults[0]?.userCount || 0,
          matchRate: batchResult.segmentResults[0]?.matchRate || 0,
          sampleResults: batchResult.segmentResults[0]?.sampleResults?.slice(0, 10) || [],
        },
      });
    } catch (error) {
      fastify.log.error('Failed to preview segment:', error);
      reply.code(400).send({
        success: false,
        error: {
          code: 'PREVIEW_FAILED',
          message: error instanceof Error ? error.message : 'Failed to preview segment',
        },
      });
    }
  });
};

export default userTargetingRoutes;
