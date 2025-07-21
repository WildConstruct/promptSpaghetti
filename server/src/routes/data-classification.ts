// Data Classification API Routes
// REST API endpoints for data classification and transfer control system
// Epic 19-2: Data governance routes with classification-based policies

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { 
  DataClassificationService, 
  DataTransferRequest, 
  ClassificationRule, 
  TransferPolicy,
  DataClassification,
  TransferType
} from '../services/DataClassificationService';

export async function dataClassificationRoutes(
  fastify: FastifyInstance,
  dataClassificationService: DataClassificationService
) {
  // Classify data endpoint
  fastify.post<{
    Body: {
      dataId: string;
      content: string;
      metadata?: Record<string, any>;
      filename?: string;
    };
  }>('/classification/classify', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { dataId, content, metadata = {}, filename } = request.body as any;

      if (!dataId || !content) {
        return reply.status(400).send({
          success: false,
          error: 'dataId and content are required'
        });
      }

      const result = await dataClassificationService.classifyData(
        dataId,
        content,
        metadata,
        filename
      );

      return reply.send({
        success: true,
        classification: result
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to classify data'
      });
    }
  });

  // Evaluate transfer request endpoint
  fastify.post<{
    Body: DataTransferRequest;
  }>('/classification/evaluate-transfer', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const transferRequest = request.body as DataTransferRequest;

      // Validate required fields
      if (!transferRequest.dataId || !transferRequest.sourceClassification || !transferRequest.transferType) {
        return reply.status(400).send({
          success: false,
          error: 'dataId, sourceClassification, and transferType are required'
        });
      }

      const decision = await dataClassificationService.evaluateTransferRequest(transferRequest);

      return reply.send({
        success: true,
        decision
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to evaluate transfer request'
      });
    }
  });

  // Get classification history endpoint
  fastify.get<{
    Params: { dataId: string };
  }>('/classification/history/:dataId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { dataId } = request.params as { dataId: string };

      const history = await dataClassificationService.getClassificationHistory(dataId);

      return reply.send({
        success: true,
        history
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to get classification history'
      });
    }
  });

  // Get transfer audit log endpoint
  fastify.get<{
    Querystring: {
      dataId?: string;
      userId?: string;
      classification?: DataClassification;
      startDate?: string;
      endDate?: string;
      limit?: string;
    };
  }>('/classification/audit-log', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { dataId, userId, classification, startDate, endDate, limit } = request.query as any;

      const filters: any = {};
      if (dataId) filters.dataId = dataId;
      if (userId) filters.userId = userId;
      if (classification) filters.classification = classification;
      if (startDate) filters.startDate = new Date(startDate);
      if (endDate) filters.endDate = new Date(endDate);
      if (limit) filters.limit = parseInt(limit);

      const auditLog = await dataClassificationService.getTransferAuditLog(filters);

      return reply.send({
        success: true,
        auditLog
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to get transfer audit log'
      });
    }
  });

  // Create classification rule endpoint
  fastify.post<{
    Body: Omit<ClassificationRule, 'id' | 'createdAt' | 'updatedAt'>;
  }>('/classification/rules', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const ruleData = request.body as any;

      // Validate required fields
      if (!ruleData.name || !ruleData.classification || !ruleData.conditions) {
        return reply.status(400).send({
          success: false,
          error: 'name, classification, and conditions are required'
        });
      }

      // Validate classification value
      const validClassifications: DataClassification[] = ['public', 'internal', 'confidential', 'restricted'];
      if (!validClassifications.includes(ruleData.classification)) {
        return reply.status(400).send({
          success: false,
          error: `Invalid classification. Must be one of: ${validClassifications.join(', ')}`
        });
      }

      const rule = await dataClassificationService.createClassificationRule(ruleData);

      return reply.status(201).send({
        success: true,
        rule
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to create classification rule'
      });
    }
  });

  // Create transfer policy endpoint
  fastify.post<{
    Body: Omit<TransferPolicy, 'id' | 'createdAt' | 'updatedAt'>;
  }>('/classification/policies', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const policyData = request.body as any;

      // Validate required fields
      if (!policyData.name || !policyData.sourceClassification || !policyData.transferType || !policyData.action) {
        return reply.status(400).send({
          success: false,
          error: 'name, sourceClassification, transferType, and action are required'
        });
      }

      // Validate enum values
      const validClassifications: DataClassification[] = ['public', 'internal', 'confidential', 'restricted'];
      const validTransferTypes: TransferType[] = ['api_export', 'file_download', 'data_sync', 'backup', 'migration', 'sharing'];
      const validActions = ['allow', 'deny', 'require_approval', 'encrypt_only'];

      if (!validClassifications.includes(policyData.sourceClassification)) {
        return reply.status(400).send({
          success: false,
          error: `Invalid sourceClassification. Must be one of: ${validClassifications.join(', ')}`
        });
      }

      if (!validTransferTypes.includes(policyData.transferType)) {
        return reply.status(400).send({
          success: false,
          error: `Invalid transferType. Must be one of: ${validTransferTypes.join(', ')}`
        });
      }

      if (!validActions.includes(policyData.action)) {
        return reply.status(400).send({
          success: false,
          error: `Invalid action. Must be one of: ${validActions.join(', ')}`
        });
      }

      const policy = await dataClassificationService.createTransferPolicy(policyData);

      return reply.status(201).send({
        success: true,
        policy
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to create transfer policy'
      });
    }
  });

  // Bulk classification endpoint
  fastify.post<{
    Body: {
      items: Array<{
        dataId: string;
        content: string;
        metadata?: Record<string, any>;
        filename?: string;
      }>;
    };
  }>('/classification/bulk-classify', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { items } = request.body as any;

      if (!Array.isArray(items) || items.length === 0) {
        return reply.status(400).send({
          success: false,
          error: 'items array is required and must not be empty'
        });
      }

      if (items.length > 100) {
        return reply.status(400).send({
          success: false,
          error: 'Maximum 100 items allowed per bulk request'
        });
      }

      const results = [];
      const errors = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        try {
          const result = await dataClassificationService.classifyData(
            item.dataId,
            item.content,
            item.metadata || {},
            item.filename
          );
          results.push(result);
        } catch (error) {
          errors.push({
            index: i,
            dataId: item.dataId,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      return reply.send({
        success: true,
        results,
        errors,
        totalProcessed: items.length,
        successCount: results.length,
        errorCount: errors.length
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to process bulk classification'
      });
    }
  });

  // Bulk transfer evaluation endpoint
  fastify.post<{
    Body: {
      requests: DataTransferRequest[];
    };
  }>('/classification/bulk-evaluate-transfer', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { requests } = request.body as any;

      if (!Array.isArray(requests) || requests.length === 0) {
        return reply.status(400).send({
          success: false,
          error: 'requests array is required and must not be empty'
        });
      }

      if (requests.length > 50) {
        return reply.status(400).send({
          success: false,
          error: 'Maximum 50 requests allowed per bulk evaluation'
        });
      }

      const decisions = [];
      const errors = [];

      for (let i = 0; i < requests.length; i++) {
        const transferRequest = requests[i];
        try {
          const decision = await dataClassificationService.evaluateTransferRequest(transferRequest);
          decisions.push(decision);
        } catch (error) {
          errors.push({
            index: i,
            requestId: transferRequest.id,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      return reply.send({
        success: true,
        decisions,
        errors,
        totalProcessed: requests.length,
        successCount: decisions.length,
        errorCount: errors.length
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to process bulk transfer evaluation'
      });
    }
  });

  // Get classification statistics endpoint
  fastify.get('/classification/statistics', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // This would typically query the database for statistics
      // For now, return basic stats structure
      return reply.send({
        success: true,
        statistics: {
          totalClassifications: 0,
          classificationBreakdown: {
            public: 0,
            internal: 0,
            confidential: 0,
            restricted: 0
          },
          totalTransferRequests: 0,
          transferDecisions: {
            allowed: 0,
            denied: 0,
            pending_approval: 0
          },
          rulesCount: 0,
          policiesCount: 0
        }
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to get classification statistics'
      });
    }
  });

  // Validate classification rule endpoint
  fastify.post<{
    Body: {
      rule: Omit<ClassificationRule, 'id' | 'createdAt' | 'updatedAt'>;
      testData: {
        content: string;
        metadata?: Record<string, any>;
        filename?: string;
      };
    };
  }>('/classification/validate-rule', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { rule, testData } = request.body as any;

      if (!rule || !testData) {
        return reply.status(400).send({
          success: false,
          error: 'rule and testData are required'
        });
      }

      // This would typically validate the rule against test data
      // For now, return validation structure
      return reply.send({
        success: true,
        validation: {
          isValid: true,
          matchesTestData: false,
          conditionResults: [],
          recommendations: []
        }
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to validate classification rule'
      });
    }
  });

  // Health check endpoint for data classification service
  fastify.get('/classification/health', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      return reply.send({
        success: true,
        status: 'healthy',
        service: 'DataClassificationService',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Service health check failed'
      });
    }
  });
}