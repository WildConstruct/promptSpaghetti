/**
 * Transaction Tracking API Routes - E17-1753114397345-58AA8D
 * 
 * RESTful API endpoints for comprehensive transaction tracking, monitoring,
 * analytics, and admin management capabilities for Epic 17 - Backstage Admin Controls.
 * 
 * Task: E17-1753114397345-58AA8D - Implement transaction tracking
 * Epic: 17 - Backstage Admin Controls
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { 
  TransactionTrackingService,
  TrackedTransaction,
  TransactionSearchQuery,
  TransactionExportRequest,
  RealTimeTransactionUpdate,
  TransactionAlert
} from '../services/TransactionTrackingService';
import { Database } from '../database/connection';
import { 
  TransactionStatus, 
  TransactionType, 
  PaymentProvider 
} from '../../packages/core/types/TransactionTrackingTypes';

// Request type definitions
interface GetTransactionRequest {
  Params: {
    transactionId: string;
  };
}

interface SearchTransactionsRequest {
  Querystring: {
    // Basic filters
    status?: TransactionStatus[];
    type?: TransactionType[];
    provider?: PaymentProvider[];
    
    // Amount filters
    minAmount?: number;
    maxAmount?: number;
    currency?: string;
    
    // Date filters
    startDate?: string;
    endDate?: string;
    
    // Party filters
    buyerId?: string;
    sellerId?: string;
    templateId?: string;
    
    // Risk and fraud filters
    riskLevel?: ('low' | 'medium' | 'high' | 'critical')[];
    hasFraudFlags?: boolean;
    requiresReview?: boolean;
    
    // Text search
    search?: string;
    
    // Admin filters
    hasAdminNotes?: boolean;
    hasFlags?: boolean;
    flagType?: string[];
    
    // Pagination and sorting
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  };
}

interface TransactionAnalyticsRequest {
  Querystring: {
    startDate: string;
    endDate: string;
    includePatterns?: boolean;
    includeForecasting?: boolean;
    includeRecommendations?: boolean;
  };
}

interface AddAdminNoteRequest {
  Params: {
    transactionId: string;
  };
  Body: {
    note: string;
    category: string;
    isPrivate?: boolean;
  };
}

interface AddAdminFlagRequest {
  Params: {
    transactionId: string;
  };
  Body: {
    type: string;
    priority: string;
    reason: string;
  };
}

interface ExportTransactionsRequest {
  Body: {
    query: TransactionSearchQuery;
    format: 'csv' | 'json' | 'excel';
    fields?: string[];
    includeNotes?: boolean;
    includeLifecycle?: boolean;
  };
}

export async function transactionTrackingRoutes(fastify: FastifyInstance) {
  // Initialize service (in production, this would be properly dependency-injected)
  const database = new Database();
  const transactionTrackingService = new TransactionTrackingService(database);

  /**
   * Get a specific transaction with full tracking details
   */
  fastify.get<GetTransactionRequest>(
    '/transaction-tracking/:transactionId',
    {
      schema: {
        tags: ['Transaction Tracking'],
        summary: 'Get detailed transaction information',
        params: {
          type: 'object',
          required: ['transactionId'],
          properties: {
            transactionId: { type: 'string', description: 'Transaction ID' }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              transaction: { type: 'object' },
              message: { type: 'string' }
            }
          }
        }
      }
    },
    async (request: FastifyRequest<GetTransactionRequest>, reply: FastifyReply) => {
      try {
        const { transactionId } = request.params;

        console.log(`🔍 Getting transaction details for: ${transactionId}`);

        const transaction = await transactionTrackingService.getTransaction(transactionId);
        
        if (!transaction) {
          return reply.code(404).send({
            success: false,
            error: 'Transaction not found',
            message: `Transaction ${transactionId} was not found`
          });
        }

        reply.code(200).send({
          success: true,
          transaction,
          message: 'Transaction details retrieved successfully'
        });

      } catch (error) {
        console.error('Get transaction failed:', error);
        reply.code(500).send({
          success: false,
          error: 'Failed to retrieve transaction',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  );

  /**
   * Search and filter transactions with advanced capabilities
   */
  fastify.get<SearchTransactionsRequest>(
    '/transaction-tracking/search',
    {
      schema: {
        tags: ['Transaction Tracking'],
        summary: 'Search and filter transactions with advanced capabilities',
        querystring: {
          type: 'object',
          properties: {
            // Basic filters
            status: { 
              type: 'array',
              items: { type: 'string' },
              description: 'Filter by transaction status'
            },
            type: { 
              type: 'array',
              items: { type: 'string' },
              description: 'Filter by transaction type'
            },
            provider: { 
              type: 'array',
              items: { type: 'string' },
              description: 'Filter by payment provider'
            },
            
            // Amount filters
            minAmount: { 
              type: 'number',
              minimum: 0,
              description: 'Minimum transaction amount'
            },
            maxAmount: { 
              type: 'number',
              minimum: 0,
              description: 'Maximum transaction amount'
            },
            currency: { 
              type: 'string',
              description: 'Filter by currency code'
            },
            
            // Date filters
            startDate: { 
              type: 'string',
              format: 'date-time',
              description: 'Filter transactions after this date'
            },
            endDate: { 
              type: 'string',
              format: 'date-time',
              description: 'Filter transactions before this date'
            },
            
            // Party filters
            buyerId: { type: 'string', description: 'Filter by buyer ID' },
            sellerId: { type: 'string', description: 'Filter by seller ID' },
            templateId: { type: 'string', description: 'Filter by template ID' },
            
            // Text search
            search: { 
              type: 'string',
              description: 'Search in transaction ID, buyer/seller names, template titles'
            },
            
            // Pagination and sorting
            page: { 
              type: 'number',
              minimum: 1,
              default: 1,
              description: 'Page number'
            },
            pageSize: { 
              type: 'number',
              minimum: 1,
              maximum: 100,
              default: 50,
              description: 'Number of items per page'
            },
            sortBy: { 
              type: 'string',
              enum: ['created_at', 'amount', 'risk_score', 'status'],
              default: 'created_at',
              description: 'Field to sort by'
            },
            sortOrder: { 
              type: 'string',
              enum: ['asc', 'desc'],
              default: 'desc',
              description: 'Sort order'
            }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              results: { type: 'object' },
              searchMetadata: { type: 'object' },
              message: { type: 'string' }
            }
          }
        }
      }
    },
    async (request: FastifyRequest<SearchTransactionsRequest>, reply: FastifyReply) => {
      try {
        const queryParams = request.query;

        console.log('🔍 Searching transactions with filters:', Object.keys(queryParams));
        const startTime = Date.now();

        // Build search query
        const searchQuery: TransactionSearchQuery = {
          page: queryParams.page || 1,
          pageSize: queryParams.pageSize || 50,
          sortBy: queryParams.sortBy || 'created_at',
          sortOrder: queryParams.sortOrder || 'desc'
        };

        // Apply filters
        if (queryParams.status) {
          searchQuery.status = Array.isArray(queryParams.status) 
            ? queryParams.status 
            : [queryParams.status];
        }

        if (queryParams.type) {
          searchQuery.type = Array.isArray(queryParams.type)
            ? queryParams.type
            : [queryParams.type];
        }

        if (queryParams.provider) {
          searchQuery.provider = Array.isArray(queryParams.provider)
            ? queryParams.provider
            : [queryParams.provider];
        }

        if (queryParams.minAmount !== undefined) {
          searchQuery.minAmount = queryParams.minAmount;
        }

        if (queryParams.maxAmount !== undefined) {
          searchQuery.maxAmount = queryParams.maxAmount;
        }

        if (queryParams.startDate && queryParams.endDate) {
          searchQuery.dateRange = {
            start: new Date(queryParams.startDate),
            end: new Date(queryParams.endDate)
          };
        }

        if (queryParams.buyerId) {
          searchQuery.buyerId = queryParams.buyerId;
        }

        if (queryParams.sellerId) {
          searchQuery.sellerId = queryParams.sellerId;
        }

        if (queryParams.templateId) {
          searchQuery.templateId = queryParams.templateId;
        }

        if (queryParams.search) {
          searchQuery.search = queryParams.search;
        }

        const results = await transactionTrackingService.searchTransactions(searchQuery);

        const searchTime = Date.now() - startTime;
        const searchMetadata = {
          searchTime,
          appliedFilters: results.filters.count,
          totalResults: results.pagination.total,
          resultPages: results.pagination.totalPages,
          searchQuery: Object.keys(queryParams)
        };

        reply.code(200).send({
          success: true,
          results,
          searchMetadata,
          message: `Found ${results.pagination.total} transactions (${searchTime}ms)`
        });

      } catch (error) {
        console.error('Transaction search failed:', error);
        reply.code(500).send({
          success: false,
          error: 'Transaction search failed',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  );

  /**
   * Get transaction analytics for a specific time period
   */
  fastify.get<TransactionAnalyticsRequest>(
    '/transaction-tracking/analytics',
    {
      schema: {
        tags: ['Transaction Tracking'],
        summary: 'Get comprehensive transaction analytics',
        querystring: {
          type: 'object',
          required: ['startDate', 'endDate'],
          properties: {
            startDate: { 
              type: 'string',
              format: 'date-time',
              description: 'Analytics start date'
            },
            endDate: { 
              type: 'string',
              format: 'date-time',
              description: 'Analytics end date'
            },
            includePatterns: { 
              type: 'boolean',
              default: true,
              description: 'Include transaction patterns analysis'
            },
            includeForecasting: { 
              type: 'boolean',
              default: true,
              description: 'Include transaction forecasting'
            },
            includeRecommendations: { 
              type: 'boolean',
              default: true,
              description: 'Include optimization recommendations'
            }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              analytics: { type: 'object' },
              analyticsMetadata: { type: 'object' },
              message: { type: 'string' }
            }
          }
        }
      }
    },
    async (request: FastifyRequest<TransactionAnalyticsRequest>, reply: FastifyReply) => {
      try {
        const { startDate, endDate, includePatterns = true, includeForecasting = true, includeRecommendations = true } = request.query;

        console.log(`📊 Generating transaction analytics from ${startDate} to ${endDate}`);
        const startTime = Date.now();

        const analytics = await transactionTrackingService.getTransactionAnalytics(
          new Date(startDate),
          new Date(endDate)
        );

        const analyticsTime = Date.now() - startTime;
        const analyticsMetadata = {
          generationTime: analyticsTime,
          period: { startDate, endDate },
          totalTransactions: analytics.overview.totalTransactions,
          includePatterns,
          includeForecasting,
          includeRecommendations,
          dataPoints: analytics.performance.providerPerformance ? Object.keys(analytics.performance.providerPerformance).length : 0
        };

        reply.code(200).send({
          success: true,
          analytics,
          analyticsMetadata,
          message: `Transaction analytics generated successfully (${analyticsTime}ms)`
        });

      } catch (error) {
        console.error('Transaction analytics failed:', error);
        reply.code(500).send({
          success: false,
          error: 'Transaction analytics generation failed',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  );

  /**
   * Add admin note to a transaction
   */
  fastify.post<AddAdminNoteRequest>(
    '/transaction-tracking/:transactionId/notes',
    {
      schema: {
        tags: ['Transaction Tracking'],
        summary: 'Add admin note to transaction',
        params: {
          type: 'object',
          required: ['transactionId'],
          properties: {
            transactionId: { type: 'string', description: 'Transaction ID' }
          }
        },
        body: {
          type: 'object',
          required: ['note', 'category'],
          properties: {
            note: { 
              type: 'string',
              minLength: 1,
              maxLength: 5000,
              description: 'Admin note content'
            },
            category: { 
              type: 'string',
              enum: ['general', 'risk', 'fraud', 'dispute', 'refund', 'investigation'],
              description: 'Note category'
            },
            isPrivate: { 
              type: 'boolean',
              default: false,
              description: 'Whether note is private'
            }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              note: { type: 'object' },
              message: { type: 'string' }
            }
          }
        }
      }
    },
    async (request: FastifyRequest<AddAdminNoteRequest>, reply: FastifyReply) => {
      try {
        const { transactionId } = request.params;
        const { note, category, isPrivate = false } = request.body;

        console.log(`📝 Adding admin note to transaction: ${transactionId}`);

        // In production, get admin ID from authentication context
        const adminId = 'admin-user-id'; // TODO: Get from auth context

        const adminNote = await transactionTrackingService.addAdminNote(
          transactionId,
          note,
          category,
          adminId,
          isPrivate
        );

        reply.code(200).send({
          success: true,
          note: adminNote,
          message: `Admin note added successfully to transaction ${transactionId}`
        });

      } catch (error) {
        console.error('Add admin note failed:', error);
        reply.code(500).send({
          success: false,
          error: 'Failed to add admin note',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  );

  /**
   * Add admin flag to a transaction
   */
  fastify.post<AddAdminFlagRequest>(
    '/transaction-tracking/:transactionId/flags',
    {
      schema: {
        tags: ['Transaction Tracking'],
        summary: 'Add admin flag to transaction',
        params: {
          type: 'object',
          required: ['transactionId'],
          properties: {
            transactionId: { type: 'string', description: 'Transaction ID' }
          }
        },
        body: {
          type: 'object',
          required: ['type', 'priority', 'reason'],
          properties: {
            type: { 
              type: 'string',
              enum: ['review_required', 'high_risk', 'fraud_suspected', 'dispute_likely', 'manual_approval'],
              description: 'Flag type'
            },
            priority: { 
              type: 'string',
              enum: ['low', 'medium', 'high', 'urgent'],
              description: 'Flag priority'
            },
            reason: { 
              type: 'string',
              minLength: 10,
              maxLength: 1000,
              description: 'Reason for flagging'
            }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              flag: { type: 'object' },
              message: { type: 'string' }
            }
          }
        }
      }
    },
    async (request: FastifyRequest<AddAdminFlagRequest>, reply: FastifyReply) => {
      try {
        const { transactionId } = request.params;
        const { type, priority, reason } = request.body;

        console.log(`🚩 Adding admin flag to transaction: ${transactionId}`);

        // In production, get admin ID from authentication context
        const adminId = 'admin-user-id'; // TODO: Get from auth context

        const adminFlag = await transactionTrackingService.addAdminFlag(
          transactionId,
          type,
          priority,
          reason,
          adminId
        );

        reply.code(200).send({
          success: true,
          flag: adminFlag,
          message: `Admin flag added successfully to transaction ${transactionId}`
        });

      } catch (error) {
        console.error('Add admin flag failed:', error);
        reply.code(500).send({
          success: false,
          error: 'Failed to add admin flag',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  );

  /**
   * Export transactions with specified format and filters
   */
  fastify.post<ExportTransactionsRequest>(
    '/transaction-tracking/export',
    {
      schema: {
        tags: ['Transaction Tracking'],
        summary: 'Export transactions with specified format and filters',
        body: {
          type: 'object',
          required: ['format'],
          properties: {
            query: { 
              type: 'object',
              description: 'Transaction search query for filtering'
            },
            format: { 
              type: 'string',
              enum: ['csv', 'json', 'excel'],
              description: 'Export format'
            },
            fields: { 
              type: 'array',
              items: { type: 'string' },
              description: 'Specific fields to include in export'
            },
            includeNotes: { 
              type: 'boolean',
              default: false,
              description: 'Include admin notes in export'
            },
            includeLifecycle: { 
              type: 'boolean',
              default: false,
              description: 'Include transaction lifecycle events'
            }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              exportData: { type: 'string' },
              exportMetadata: { type: 'object' },
              message: { type: 'string' }
            }
          }
        }
      }
    },
    async (request: FastifyRequest<ExportTransactionsRequest>, reply: FastifyReply) => {
      try {
        const { query = {}, format, fields, includeNotes = false, includeLifecycle = false } = request.body;

        console.log(`📤 Exporting transactions in ${format} format`);
        const startTime = Date.now();

        const exportRequest: TransactionExportRequest = {
          query,
          format,
          fields,
          includeNotes,
          includeLifecycle
        };

        const exportData = await transactionTrackingService.exportTransactions(exportRequest);

        const exportTime = Date.now() - startTime;
        const exportMetadata = {
          exportTime,
          format,
          recordCount: exportData.split('\n').length - 1, // Rough estimate for CSV
          fileSizeBytes: Buffer.byteLength(exportData, 'utf8'),
          includeNotes,
          includeLifecycle,
          generatedAt: new Date().toISOString()
        };

        reply.code(200).send({
          success: true,
          exportData,
          exportMetadata,
          message: `Transaction export completed successfully (${exportTime}ms)`
        });

      } catch (error) {
        console.error('Transaction export failed:', error);
        reply.code(500).send({
          success: false,
          error: 'Transaction export failed',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  );

  /**
   * Get recent transactions for real-time monitoring
   */
  fastify.get(
    '/transaction-tracking/recent',
    {
      schema: {
        tags: ['Transaction Tracking'],
        summary: 'Get recent transactions for real-time monitoring',
        querystring: {
          type: 'object',
          properties: {
            limit: { 
              type: 'number',
              minimum: 1,
              maximum: 500,
              default: 100,
              description: 'Number of recent transactions to retrieve'
            },
            includeProcessing: { 
              type: 'boolean',
              default: true,
              description: 'Include processing transactions'
            }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              transactions: { type: 'array' },
              monitoringData: { type: 'object' },
              message: { type: 'string' }
            }
          }
        }
      }
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { limit = 100, includeProcessing = true } = request.query as any;

        console.log(`⚡ Getting ${limit} recent transactions for monitoring`);

        const transactions = await transactionTrackingService.getRecentTransactions(limit);

        // Add real-time monitoring data
        const monitoringData = {
          totalTransactions: transactions.length,
          processingTransactions: transactions.filter(t => t.status === 'processing').length,
          succeededTransactions: transactions.filter(t => t.status === 'succeeded').length,
          failedTransactions: transactions.filter(t => t.status === 'failed').length,
          highRiskTransactions: transactions.filter(t => t.riskAssessment.level === 'high' || t.riskAssessment.level === 'critical').length,
          averageAmount: transactions.length > 0 
            ? transactions.reduce((sum, t) => sum + t.amount.gross, 0) / transactions.length 
            : 0,
          lastUpdateTime: new Date().toISOString()
        };

        reply.code(200).send({
          success: true,
          transactions: includeProcessing ? transactions : transactions.filter(t => t.status !== 'processing'),
          monitoringData,
          message: `Retrieved ${transactions.length} recent transactions`
        });

      } catch (error) {
        console.error('Get recent transactions failed:', error);
        reply.code(500).send({
          success: false,
          error: 'Failed to retrieve recent transactions',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  );

  /**
   * Start real-time monitoring (webhook endpoint for real-time updates)
   */
  fastify.post(
    '/transaction-tracking/monitoring/start',
    {
      schema: {
        tags: ['Transaction Tracking'],
        summary: 'Start real-time transaction monitoring',
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              monitoringStatus: { type: 'object' },
              message: { type: 'string' }
            }
          }
        }
      }
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        console.log('🚀 Starting real-time transaction monitoring');

        await transactionTrackingService.startRealTimeMonitoring();

        const monitoringStatus = {
          enabled: true,
          startTime: new Date().toISOString(),
          alertListeners: 0, // Would track actual listener count
          bufferSize: 0, // Would track buffer size
          configuration: {
            updateInterval: 5000, // 5 seconds
            alertThresholds: {
              highVolume: 100,
              largeTransaction: 10000,
              failureRate: 0.05
            }
          }
        };

        reply.code(200).send({
          success: true,
          monitoringStatus,
          message: 'Real-time transaction monitoring started successfully'
        });

      } catch (error) {
        console.error('Start monitoring failed:', error);
        reply.code(500).send({
          success: false,
          error: 'Failed to start monitoring',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  );
}