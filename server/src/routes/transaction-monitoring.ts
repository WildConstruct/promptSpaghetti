// Epic 17.5.3 - Transaction Monitoring API Routes
import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { TransactionMonitoringService } from '../services/TransactionMonitoringService.js';
import { AnomalyDetectionService } from '../services/TransactionAnomalyDetectionService.js';

// Request Schemas
const TransactionSearchSchema = z.object({
  userId: z.string().uuid().optional(),
  status: z.string().optional(),
  transactionType: z.enum(['purchase', 'refund', 'partial_refund', 'subscription', 'subscription_renewal']).optional(),
  provider: z.enum(['stripe', 'paypal', 'apple_pay', 'google_pay']).optional(),
  minAmount: z.number().int().min(0).optional(),
  maxAmount: z.number().int().min(0).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  riskScore: z.object({
    min: z.number().min(0).max(100).optional(),
    max: z.number().min(0).max(100).optional()
  }).optional(),
  hasFlags: z.boolean().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(50),
  sortBy: z.string().default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

const TransactionUpdateSchema = z.object({
  status: z.enum(['pending', 'processing', 'succeeded', 'failed', 'disputed', 'refunded']),
  reason: z.string().min(10).max(500).optional()
});

const TransactionNoteSchema = z.object({
  note: z.string().min(1).max(2000)
});

const TransactionFlagSchema = z.object({
  flagType: z.enum(['fraud_suspicion', 'policy_violation', 'technical_issue', 'customer_complaint']),
  reason: z.string().min(10).max(500)
});

const ReportGenerationSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  reportType: z.enum(['summary', 'detailed', 'fraud_analysis']),
  format: z.enum(['json', 'csv']).default('json')
});

export async function transactionMonitoringRoutes(fastify: FastifyInstance) {
  const transactionMonitoringService = new TransactionMonitoringService(fastify);
  const anomalyDetectionService = new AnomalyDetectionService(fastify);

  // Admin authentication middleware
  const requireAdmin = async (request: any, reply: any) => {
    await fastify.authenticate(request, reply);
    
    if (!request.user.roles?.includes('admin') && !request.user.roles?.includes('transaction_admin')) {
      reply.code(403).send({ 
        error: 'Access denied. Admin role required.' 
      });
      return;
    }
  };

  // =============================================
  // Transaction Search & Filtering
  // =============================================

  // Search transactions with advanced filtering
  fastify.get('/admin/transactions/search', {
    preHandler: [requireAdmin],
    schema: {
      querystring: TransactionSearchSchema,
      response: {
        200: z.object({
          transactions: z.array(z.any()),
          total: z.number(),
          page: z.number(),
          limit: z.number(),
          hasMore: z.boolean()
        })
      }
    }
  }, async (request, reply) => {
    try {
      const filters = {
        ...request.query,
        startDate: request.query.startDate ? new Date(request.query.startDate) : undefined,
        endDate: request.query.endDate ? new Date(request.query.endDate) : undefined
      };

      const result = await transactionMonitoringService.searchTransactions(filters);
      reply.send(result);
    } catch (error) {
      fastify.log.error('Transaction search error:', error);
      reply.code(500).send({ error: 'Failed to search transactions' });
    }
  });

  // Get detailed transaction information
  fastify.get('/admin/transactions/:transactionId', {
    preHandler: [requireAdmin],
    schema: {
      params: z.object({
        transactionId: z.string().uuid()
      }),
      response: {
        200: z.object({
          transaction: z.any(),
          notes: z.array(z.any()),
          flags: z.array(z.any()),
          anomalies: z.array(z.any()),
          riskAnalysis: z.any()
        })
      }
    }
  }, async (request, reply) => {
    try {
      const { transactionId } = request.params;

      const [transaction, notes, flags, anomalies, riskAnalysis] = await Promise.all([
        transactionMonitoringService.getTransactionDetails(transactionId),
        transactionMonitoringService.getTransactionNotes(transactionId),
        transactionMonitoringService.getTransactionFlags(transactionId),
        anomalyDetectionService.getAnomaliesByTransaction(transactionId),
        transactionMonitoringService.analyzeTransactionRisk(transactionId)
      ]);

      if (!transaction) {
        reply.code(404).send({ error: 'Transaction not found' });
        return;
      }

      reply.send({
        transaction,
        notes,
        flags,
        anomalies,
        riskAnalysis
      });
    } catch (error) {
      fastify.log.error('Transaction details error:', error);
      reply.code(500).send({ error: 'Failed to get transaction details' });
    }
  });

  // =============================================
  // Transaction Management Actions
  // =============================================

  // Update transaction status
  fastify.put('/admin/transactions/:transactionId/status', {
    preHandler: [requireAdmin],
    schema: {
      params: z.object({
        transactionId: z.string().uuid()
      }),
      body: TransactionUpdateSchema,
      response: {
        200: z.object({
          success: z.boolean(),
          message: z.string()
        })
      }
    }
  }, async (request, reply) => {
    try {
      const { transactionId } = request.params;
      const { status, reason } = request.body;

      await transactionMonitoringService.updateTransactionStatus(
        transactionId,
        status,
        request.user.id,
        reason
      );

      reply.send({
        success: true,
        message: `Transaction status updated to ${status}`
      });
    } catch (error) {
      fastify.log.error('Transaction status update error:', error);
      
      if (error.message.includes('not found')) {
        reply.code(404).send({ error: error.message });
      } else {
        reply.code(500).send({ error: 'Failed to update transaction status' });
      }
    }
  });

  // Add transaction note
  fastify.post('/admin/transactions/:transactionId/notes', {
    preHandler: [requireAdmin],
    schema: {
      params: z.object({
        transactionId: z.string().uuid()
      }),
      body: TransactionNoteSchema,
      response: {
        200: z.object({
          success: z.boolean(),
          message: z.string()
        })
      }
    }
  }, async (request, reply) => {
    try {
      const { transactionId } = request.params;
      const { note } = request.body;

      await transactionMonitoringService.addTransactionNote(
        transactionId,
        request.user.id,
        note
      );

      reply.send({
        success: true,
        message: 'Note added successfully'
      });
    } catch (error) {
      fastify.log.error('Add transaction note error:', error);
      reply.code(500).send({ error: 'Failed to add transaction note' });
    }
  });

  // Flag transaction for review
  fastify.post('/admin/transactions/:transactionId/flag', {
    preHandler: [requireAdmin],
    schema: {
      params: z.object({
        transactionId: z.string().uuid()
      }),
      body: TransactionFlagSchema,
      response: {
        200: z.object({
          success: z.boolean(),
          message: z.string()
        })
      }
    }
  }, async (request, reply) => {
    try {
      const { transactionId } = request.params;
      const { flagType, reason } = request.body;

      await transactionMonitoringService.flagTransactionForReview(
        transactionId,
        request.user.id,
        flagType,
        reason
      );

      reply.send({
        success: true,
        message: 'Transaction flagged for review'
      });
    } catch (error) {
      fastify.log.error('Flag transaction error:', error);
      reply.code(500).send({ error: 'Failed to flag transaction' });
    }
  });

  // =============================================
  // Analytics & Reporting
  // =============================================

  // Get transaction summary analytics
  fastify.get('/admin/transactions/analytics/summary', {
    preHandler: [requireAdmin],
    schema: {
      querystring: z.object({
        startDate: z.string().datetime(),
        endDate: z.string().datetime(),
        userId: z.string().uuid().optional(),
        provider: z.enum(['stripe', 'paypal', 'apple_pay', 'google_pay']).optional()
      }),
      response: {
        200: z.object({
          summary: z.any()
        })
      }
    }
  }, async (request, reply) => {
    try {
      const { startDate, endDate, userId, provider } = request.query;

      const summary = await transactionMonitoringService.getTransactionSummary(
        new Date(startDate),
        new Date(endDate),
        { userId, provider }
      );

      reply.send({ summary });
    } catch (error) {
      fastify.log.error('Transaction analytics error:', error);
      reply.code(500).send({ error: 'Failed to get transaction analytics' });
    }
  });

  // Generate transaction reports
  fastify.post('/admin/transactions/reports/generate', {
    preHandler: [requireAdmin],
    schema: {
      body: ReportGenerationSchema,
      response: {
        200: z.object({
          report: z.any(),
          downloadUrl: z.string().optional()
        })
      }
    }
  }, async (request, reply) => {
    try {
      const { startDate, endDate, reportType, format } = request.body;

      const report = await transactionMonitoringService.generateTransactionReport(
        new Date(startDate),
        new Date(endDate),
        reportType
      );

      if (format === 'csv') {
        const csvData = await transactionMonitoringService.exportTransactions(
          {
            startDate: new Date(startDate),
            endDate: new Date(endDate)
          },
          'csv'
        );

        // In production, save to file storage and return download URL
        reply.header('Content-Type', 'text/csv');
        reply.header('Content-Disposition', `attachment; filename="transactions_${reportType}_${Date.now()}.csv"`);
        reply.send(csvData);
      } else {
        reply.send({ report });
      }
    } catch (error) {
      fastify.log.error('Report generation error:', error);
      reply.code(500).send({ error: 'Failed to generate report' });
    }
  });

  // Export transactions
  fastify.get('/admin/transactions/export', {
    preHandler: [requireAdmin],
    schema: {
      querystring: z.object({
        ...TransactionSearchSchema.shape,
        format: z.enum(['csv', 'json']).default('csv')
      })
    }
  }, async (request, reply) => {
    try {
      const { format, ...filters } = request.query;

      const processedFilters = {
        ...filters,
        startDate: filters.startDate ? new Date(filters.startDate) : undefined,
        endDate: filters.endDate ? new Date(filters.endDate) : undefined
      };

      const exportData = await transactionMonitoringService.exportTransactions(
        processedFilters,
        format
      );

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `transactions_export_${timestamp}.${format}`;

      if (format === 'csv') {
        reply.header('Content-Type', 'text/csv');
      } else {
        reply.header('Content-Type', 'application/json');
      }

      reply.header('Content-Disposition', `attachment; filename="${filename}"`);
      reply.send(exportData);
    } catch (error) {
      fastify.log.error('Transaction export error:', error);
      reply.code(500).send({ error: 'Failed to export transactions' });
    }
  });

  // =============================================
  // Anomaly Detection & Monitoring
  // =============================================

  // Get active anomalies
  fastify.get('/admin/transactions/anomalies', {
    preHandler: [requireAdmin],
    schema: {
      querystring: z.object({
        severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
        status: z.enum(['new', 'investigating', 'resolved', 'false_positive']).optional(),
        limit: z.number().int().min(1).max(200).default(100)
      }),
      response: {
        200: z.object({
          anomalies: z.array(z.any())
        })
      }
    }
  }, async (request, reply) => {
    try {
      const anomalies = await anomalyDetectionService.getActiveAnomalies(request.query.limit);
      reply.send({ anomalies });
    } catch (error) {
      fastify.log.error('Get anomalies error:', error);
      reply.code(500).send({ error: 'Failed to get anomalies' });
    }
  });

  // Update anomaly status
  fastify.put('/admin/transactions/anomalies/:anomalyId/status', {
    preHandler: [requireAdmin],
    schema: {
      params: z.object({
        anomalyId: z.string().uuid()
      }),
      body: z.object({
        status: z.enum(['new', 'investigating', 'resolved', 'false_positive']),
        resolution: z.string().max(1000).optional()
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          message: z.string()
        })
      }
    }
  }, async (request, reply) => {
    try {
      const { anomalyId } = request.params;
      const { status, resolution } = request.body;

      await anomalyDetectionService.updateAnomalyStatus(
        anomalyId,
        status,
        request.user.id,
        resolution
      );

      reply.send({
        success: true,
        message: `Anomaly status updated to ${status}`
      });
    } catch (error) {
      fastify.log.error('Update anomaly status error:', error);
      reply.code(500).send({ error: 'Failed to update anomaly status' });
    }
  });

  // Detect fraud rings
  fastify.get('/admin/transactions/fraud-rings', {
    preHandler: [requireAdmin],
    schema: {
      response: {
        200: z.object({
          fraudRings: z.array(z.any())
        })
      }
    }
  }, async (request, reply) => {
    try {
      const fraudRings = await anomalyDetectionService.detectFraudRings();
      reply.send({ fraudRings });
    } catch (error) {
      fastify.log.error('Fraud ring detection error:', error);
      reply.code(500).send({ error: 'Failed to detect fraud rings' });
    }
  });

  // Trigger anomaly detection for specific transaction
  fastify.post('/admin/transactions/:transactionId/analyze-anomalies', {
    preHandler: [requireAdmin],
    schema: {
      params: z.object({
        transactionId: z.string().uuid()
      }),
      response: {
        200: z.object({
          anomalies: z.array(z.any()),
          riskAnalysis: z.any()
        })
      }
    }
  }, async (request, reply) => {
    try {
      const { transactionId } = request.params;

      const [anomalies, riskAnalysis] = await Promise.all([
        anomalyDetectionService.detectAnomaliesForTransaction(transactionId),
        transactionMonitoringService.analyzeTransactionRisk(transactionId)
      ]);

      reply.send({ anomalies, riskAnalysis });
    } catch (error) {
      fastify.log.error('Anomaly analysis error:', error);
      reply.code(500).send({ error: 'Failed to analyze transaction anomalies' });
    }
  });

  // =============================================
  // Dashboard & Metrics
  // =============================================

  // Get transaction monitoring dashboard data
  fastify.get('/admin/transactions/dashboard', {
    preHandler: [requireAdmin],
    schema: {
      querystring: z.object({
        period: z.enum(['24h', '7d', '30d']).default('24h')
      }),
      response: {
        200: z.object({
          dashboard: z.any()
        })
      }
    }
  }, async (request, reply) => {
    try {
      const { period } = request.query;

      // Calculate date range
      const periodHours = {
        '24h': 24,
        '7d': 24 * 7,
        '30d': 24 * 30
      };

      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - periodHours[period] * 60 * 60 * 1000);

      const [summary, activeAnomalies, fraudRings] = await Promise.all([
        transactionMonitoringService.getTransactionSummary(startDate, endDate),
        anomalyDetectionService.getActiveAnomalies(10),
        anomalyDetectionService.detectFraudRings()
      ]);

      const dashboard = {
        summary,
        activeAnomalies: activeAnomalies.length,
        criticalAnomalies: activeAnomalies.filter(a => a.severity === 'critical').length,
        suspectedFraudRings: fraudRings.filter(r => r.status === 'suspected').length,
        period,
        lastUpdated: new Date()
      };

      reply.send({ dashboard });
    } catch (error) {
      fastify.log.error('Dashboard data error:', error);
      reply.code(500).send({ error: 'Failed to get dashboard data' });
    }
  });
}