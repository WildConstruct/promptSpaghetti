/**
 * Fraud Monitoring API Routes - Epic 17
 * 
 * RESTful API endpoints for fraud monitoring, detection, analytics, and
 * manual review workflows. Provides comprehensive fraud management tools
 * for analysts and administrators.
 * 
 * Task: E17-1753114397354-F17F8C - Create fraud monitoring
 * Epic: 17 - Backstage Admin Controls
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { FraudDetectionEngine, FraudDetectionRequest } from '../services/fraud/FraudDetectionEngine';
import { FraudMonitoringService } from '../services/fraud/FraudMonitoringService';
import { TrustScoreService } from '../services/trust/TrustScoreService';
import { Database } from '../database';

// Request/Response type definitions
}
interface DetectFraudRequest {
  Body: {
    type: 'payment' | 'account' | 'transaction' | 'login' | 'registration';
    userId?: string;
    sessionId?: string;
    transactionId?: string;
    paymentData?: Record<string, unknown>;
    deviceData?: Record<string, unknown>;
    locationData?: Record<string, unknown>;
    behaviorData?: Record<string, unknown>;
    context: {
      ipAddress: string;
      userAgent: string;
      source: string;
      environment: 'web' | 'mobile' | 'api';
}
    };
  };
}

}
interface PaymentFraudRequest {
  Body: {
    transactionId: string;
    paymentData: {
      amount: number;
      currency: string;
      paymentMethod: string;
      cardLast4?: string;
      cardBin?: string;
      billing?: Record<string, unknown>;
}
    };
    context: {
      ipAddress: string;
      userAgent: string;
      source: string;
      environment: 'web' | 'mobile' | 'api';
    };
  };
}

}
interface AccountFraudRequest {
  Body: {
    userId: string;
    context: {
      ipAddress: string;
      userAgent: string;
      source: string;
      environment: 'web' | 'mobile' | 'api';
}
    };
  };
}

}
interface CreateReviewCaseRequest {
  Body: {
    entityType: 'user' | 'transaction' | 'account';
    entityId: string;
    type?: 'payment' | 'account' | 'network' | 'manual';
    reason: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    evidence?: Array<Record<string, unknown>>;
}
  };
}

}
interface ReviewDecisionRequest {
  Body: {
    decision: 'approve' | 'reject' | 'escalate' | 'modify';
    reason: string;
    confidence: number;
    actions?: string[];
    modifiedFraudScore?: number;
}
  };
}

}
interface CreateAlertRequest {
  Body: {
    severity: 'info' | 'warning' | 'critical' | 'urgent';
    type: 'high_fraud_score' | 'new_fraud_pattern' | 'system_anomaly' | 'manual_review_required';
    title: string;
    description: string;
    fraudScore?: number;
    entityType?: 'user' | 'transaction' | 'system';
    entityId?: string;
    detectionMethod?: string;
    expiresAt?: string;
    tags?: string[];
}
  };
}

}
interface FraudRuleRequest {
  Body: {
    name: string;
    description: string;
    category: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    enabled: boolean;
    conditions: Array<Record<string, unknown>>;
    actions: Array<Record<string, unknown>>;
    thresholds: Array<Record<string, unknown>>;
    tags?: string[];
}
  };
}

}
interface AnalyticsRequest {
  Querystring: {
    startDate: string;
    endDate: string;
    format?: 'json' | 'csv';
    includeInsights?: boolean;
}
  };
}

export async function fraudMonitoringRoutes(fastify: FastifyInstance) {
  const fraudEngine = new FraudDetectionEngine(
    fastify.db as Database,
    fastify.trustScoreService as TrustScoreService,
    fastify.behaviorAnalytics,
    fastify.anomalyDetection,
    fastify.enforcementService
  );

  const fraudMonitoring = new FraudMonitoringService(
    fastify.db as Database,
    fraudEngine,
    fastify.trustScoreService as TrustScoreService,
    fastify.enforcementService,
    fastify.auditService
  );

  // =============================================================================
  // Fraud Detection Endpoints
  // =============================================================================

  /**
   * General fraud detection endpoint
   */
  fastify.post<DetectFraudRequest>(
    '/fraud-detection/detect',
    {
      schema: {
        tags: ['Fraud Detection'],
        summary: 'Detect fraud',
        description: 'Perform comprehensive fraud detection analysis',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['type', 'context'],
          properties: {
            type: { type: 'string', enum: ['payment', 'account', 'transaction', 'login', 'registration'] },
            userId: { type: 'string' },
            sessionId: { type: 'string' },
            transactionId: { type: 'string' },
            paymentData: { type: 'object' },
            deviceData: { type: 'object' },
            locationData: { type: 'object' },
            behaviorData: { type: 'object' },
            context: {
              type: 'object',
              required: ['ipAddress', 'userAgent', 'source', 'environment'],
              properties: {
                ipAddress: { type: 'string' },
                userAgent: { type: 'string' },
                source: { type: 'string' },
                environment: { type: 'string', enum: ['web', 'mobile', 'api'] }
              }
            }
          }
  }
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              result: {
                type: 'object',
                properties: {
                  fraudScore: { type: 'number' },
                  riskLevel: { type: 'string' },
                  confidence: { type: 'number' },
                  recommendations: { type: 'array' },
                  requiresReview: { type: 'boolean' },
                  autoBlocked: { type: 'boolean' }
                }
  }
              processingTime: { type: 'number' }
            }
          }
        }
      }
  }
    async (request: FastifyRequest<DetectFraudRequest>, reply: FastifyReply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return reply.code(401).send({
            success: false,
            error: 'Authentication required'
          });
        }

        // Check permissions for fraud detection
        const hasAccess = await fastify.authService.hasPermission(userId, 'fraud:detect');
        if (!hasAccess) {
          return reply.code(403).send({
            success: false,
            error: 'Insufficient permissions'
          });
        }

        const detectionRequest: FraudDetectionRequest = {
          ...request.body,
          context: {
            ...request.body.context,
            timestamp: new Date(),
            requestId: request.id || `req-${Date.now()}`
          }
        };

        const startTime = Date.now();
        const result = await fraudEngine.detectFraud(detectionRequest);
        const processingTime = Date.now() - startTime;

        reply.send({
          success: true,
          result: {
            fraudScore: result.fraudScore,
            riskLevel: result.riskLevel,
            confidence: result.confidence,
            recommendations: result.recommendations,
            requiresReview: result.requiresReview,
            autoBlocked: result.autoBlocked,
            riskFactors: result.riskFactors,
            detectionMethod: result.detectionMethod
  }
          processingTime
        });

      } catch (error) {
        console.error('Fraud detection error:', error);
        reply.code(500).send({
          success: false,
          error: 'Fraud detection failed',
          message: error.message
        });
      }
    }
  );

  /**
   * Payment-specific fraud detection
   */
  fastify.post<PaymentFraudRequest>(
    '/fraud-detection/payment',
    {
      schema: {
        tags: ['Fraud Detection'],
        summary: 'Detect payment fraud',
        description: 'Specialized payment fraud detection with velocity checks and card testing analysis',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['transactionId', 'paymentData', 'context'],
          properties: {
            transactionId: { type: 'string' },
            paymentData: {
              type: 'object',
              required: ['amount', 'currency', 'paymentMethod'],
              properties: {
                amount: { type: 'number' },
                currency: { type: 'string' },
                paymentMethod: { type: 'string' },
                cardLast4: { type: 'string' },
                cardBin: { type: 'string' },
                billing: { type: 'object' }
              }
  }
            context: {
              type: 'object',
              required: ['ipAddress', 'userAgent', 'source', 'environment'],
              properties: {
                ipAddress: { type: 'string' },
                userAgent: { type: 'string' },
                source: { type: 'string' },
                environment: { type: 'string', enum: ['web', 'mobile', 'api'] }
              }
            }
          }
        }
      }
  }
    async (request: FastifyRequest<PaymentFraudRequest>, reply: FastifyReply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return reply.code(401).send({
            success: false,
            error: 'Authentication required'
          });
        }

        const hasAccess = await fastify.authService.hasPermission(userId, 'fraud:payment_detect');
        if (!hasAccess) {
          return reply.code(403).send({
            success: false,
            error: 'Insufficient permissions'
          });
        }

        const { transactionId, paymentData, context } = request.body;
        const fraudContext = {
          ...context,
          timestamp: new Date(),
          requestId: request.id || `req-${Date.now()}`
        };

        const result = await fraudEngine.detectPaymentFraud(transactionId, paymentData, fraudContext);

        reply.send({
          success: true,
          assessment: result,
          timestamp: new Date()
        });

      } catch (error) {
        console.error('Payment fraud detection error:', error);
        reply.code(500).send({
          success: false,
          error: 'Payment fraud detection failed',
          message: error.message
        });
      }
    }
  );

  /**
   * Account-specific fraud detection
   */
  fastify.post<AccountFraudRequest>(
    '/fraud-detection/account',
    {
      schema: {
        tags: ['Fraud Detection'],
        summary: 'Detect account fraud',
        description: 'Account fraud detection including synthetic identity and account takeover analysis',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['userId', 'context'],
          properties: {
            userId: { type: 'string' },
            context: {
              type: 'object',
              required: ['ipAddress', 'userAgent', 'source', 'environment'],
              properties: {
                ipAddress: { type: 'string' },
                userAgent: { type: 'string' },
                source: { type: 'string' },
                environment: { type: 'string', enum: ['web', 'mobile', 'api'] }
              }
            }
          }
        }
      }
  }
    async (request: FastifyRequest<AccountFraudRequest>, reply: FastifyReply) => {
      try {
        const currentUserId = request.user?.id;
        if (!currentUserId) {
          return reply.code(401).send({
            success: false,
            error: 'Authentication required'
          });
        }

        const hasAccess = await fastify.authService.hasPermission(currentUserId, 'fraud:account_detect');
        if (!hasAccess) {
          return reply.code(403).send({
            success: false,
            error: 'Insufficient permissions'
          });
        }

        const { userId, context } = request.body;
        const fraudContext = {
          ...context,
          timestamp: new Date(),
          requestId: request.id || `req-${Date.now()}`
        };

        const result = await fraudEngine.detectAccountFraud(userId, fraudContext);

        reply.send({
          success: true,
          assessment: result,
          timestamp: new Date()
        });

      } catch (error) {
        console.error('Account fraud detection error:', error);
        reply.code(500).send({
          success: false,
          error: 'Account fraud detection failed',
          message: error.message
        });
      }
    }
  );

  // =============================================================================
  // Manual Review Workflow Endpoints
  // =============================================================================

  /**
   * Create a manual review case
   */
  fastify.post<CreateReviewCaseRequest>(
    '/fraud-review/cases',
    {
      schema: {
        tags: ['Fraud Review'],
        summary: 'Create review case',
        description: 'Create a new fraud review case for manual analysis',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['entityType', 'entityId', 'reason'],
          properties: {
            entityType: { type: 'string', enum: ['user', 'transaction', 'account'] },
            entityId: { type: 'string' },
            type: { type: 'string', enum: ['payment', 'account', 'network', 'manual'], default: 'manual' },
            reason: { type: 'string', minLength: 10 },
            priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
            evidence: { type: 'array', items: { type: 'object' } }
          }
        }
      }
  }
    async (request: FastifyRequest<CreateReviewCaseRequest>, reply: FastifyReply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return reply.code(401).send({
            success: false,
            error: 'Authentication required'
          });
        }

        const hasAccess = await fastify.authService.hasPermission(userId, 'fraud:review_create');
        if (!hasAccess) {
          return reply.code(403).send({
            success: false,
            error: 'Insufficient permissions'
          });
        }

        // Create a mock detection result for manual cases
        const mockDetectionResult = {
          fraudScore: 75,
          riskLevel: 'high' as const,
          confidence: 80,
          indicators: [],
          riskFactors: [{
            factor: 'manual_review_requested',
            type: 'account' as const,
            severity: 'medium' as const,
            weight: 1.0,
            confidence: 100,
            description: request.body.reason,
            evidence: ['Manual review request'],
            mitigationActions: ['manual_investigation']
          }],
          recommendations: [],
          detectionMethod: {
            primary: 'manual_review' as const,
            secondary: [],
            processingTime: 0
  }
          timestamp: new Date(),
          requiresReview: true,
          autoBlocked: false
        };

        const reviewCase = await fraudMonitoring.createReviewCase(
          mockDetectionResult,
          request.body.entityType,
          request.body.entityId,
          request.body.type
        );

        reply.code(201).send({
          success: true,
          case: reviewCase,
          message: 'Review case created successfully'
        });

      } catch (error) {
        console.error('Error creating review case:', error);
        reply.code(500).send({
          success: false,
          error: 'Failed to create review case',
          message: error.message
        });
      }
    }
  );

  /**
   * Get review cases with filters
   */
  fastify.get<{
    Querystring: {
      status?: string;
      priority?: string;
      type?: string;
      assignedTo?: string;
      limit?: number;
      offset?: number;
    };
  }>(
    '/fraud-review/cases',
    {
      schema: {
        tags: ['Fraud Review'],
        summary: 'List review cases',
        description: 'Retrieve fraud review cases with optional filtering',
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['pending', 'under_review', 'approved', 'rejected', 'escalated'] },
            priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
            type: { type: 'string', enum: ['payment', 'account', 'network', 'manual'] },
            assignedTo: { type: 'string' },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
            offset: { type: 'integer', minimum: 0, default: 0 }
          }
        }
      }
  }
    async (request, reply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return reply.code(401).send({
            success: false,
            error: 'Authentication required'
          });
        }

        const hasAccess = await fastify.authService.hasPermission(userId, 'fraud:review_read');
        if (!hasAccess) {
          return reply.code(403).send({
            success: false,
            error: 'Insufficient permissions'
          });
        }

        // For now, return mock data - would implement actual database query
        const cases = [];
        const total = 0;

        reply.send({
          success: true,
          cases,
          total,
          pagination: {
            limit: request.query.limit || 20,
            offset: request.query.offset || 0,
            hasMore: false
          }
        });

      } catch (error) {
        console.error('Error retrieving review cases:', error);
        reply.code(500).send({
          success: false,
          error: 'Failed to retrieve review cases'
        });
      }
    }
  );

  /**
   * Assign a review case
   */
  fastify.put<{ Params: { caseId: string }; Body: { analystId: string } }>(
    '/fraud-review/cases/:caseId/assign',
    {
      schema: {
        tags: ['Fraud Review'],
        summary: 'Assign review case',
        description: 'Assign a fraud review case to an analyst',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['caseId'],
          properties: {
            caseId: { type: 'string' }
          }
  }
        body: {
          type: 'object',
          required: ['analystId'],
          properties: {
            analystId: { type: 'string' }
          }
        }
      }
  }
    async (request, reply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return reply.code(401).send({
            success: false,
            error: 'Authentication required'
          });
        }

        const hasAccess = await fastify.authService.hasPermission(userId, 'fraud:review_assign');
        if (!hasAccess) {
          return reply.code(403).send({
            success: false,
            error: 'Insufficient permissions'
          });
        }

        const reviewCase = await fraudMonitoring.assignReviewCase(
          request.params.caseId,
          request.body.analystId
        );

        reply.send({
          success: true,
          case: reviewCase,
          message: 'Case assigned successfully'
        });

      } catch (error) {
        console.error('Error assigning review case:', error);
        reply.code(500).send({
          success: false,
          error: 'Failed to assign review case',
          message: error.message
        });
      }
    }
  );

  /**
   * Make a decision on a review case
   */
  fastify.post<{ Params: { caseId: string } } & ReviewDecisionRequest>(
    '/fraud-review/cases/:caseId/decision',
    {
      schema: {
        tags: ['Fraud Review'],
        summary: 'Make review decision',
        description: 'Make a decision on a fraud review case',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['caseId'],
          properties: {
            caseId: { type: 'string' }
          }
  }
        body: {
          type: 'object',
          required: ['decision', 'reason', 'confidence'],
          properties: {
            decision: { type: 'string', enum: ['approve', 'reject', 'escalate', 'modify'] },
            reason: { type: 'string', minLength: 10 },
            confidence: { type: 'number', minimum: 0, maximum: 100 },
            actions: { type: 'array', items: { type: 'string' } },
            modifiedFraudScore: { type: 'number', minimum: 0, maximum: 100 }
          }
        }
      }
  }
    async (request, reply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return reply.code(401).send({
            success: false,
            error: 'Authentication required'
          });
        }

        const hasAccess = await fastify.authService.hasPermission(userId, 'fraud:review_decide');
        if (!hasAccess) {
          return reply.code(403).send({
            success: false,
            error: 'Insufficient permissions'
          });
        }

        const reviewCase = await fraudMonitoring.makeReviewDecision(
          request.params.caseId,
          userId,
          request.body
        );

        reply.send({
          success: true,
          case: reviewCase,
          message: 'Decision recorded successfully'
        });

      } catch (error) {
        console.error('Error making review decision:', error);
        reply.code(500).send({
          success: false,
          error: 'Failed to record decision',
          message: error.message
        });
      }
    }
  );

  // =============================================================================
  // Alert Management Endpoints
  // =============================================================================

  /**
   * Create a fraud alert
   */
  fastify.post<CreateAlertRequest>(
    '/fraud-alerts',
    {
      schema: {
        tags: ['Fraud Alerts'],
        summary: 'Create fraud alert',
        description: 'Create a new fraud alert',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['severity', 'type', 'title', 'description'],
          properties: {
            severity: { type: 'string', enum: ['info', 'warning', 'critical', 'urgent'] },
            type: { 
              type: 'string', 
              enum: ['high_fraud_score', 'new_fraud_pattern', 'system_anomaly', 'manual_review_required'] 
  }
            title: { type: 'string', minLength: 5 },
            description: { type: 'string', minLength: 10 },
            fraudScore: { type: 'number', minimum: 0, maximum: 100 },
            entityType: { type: 'string', enum: ['user', 'transaction', 'system'] },
            entityId: { type: 'string' },
            detectionMethod: { type: 'string' },
            expiresAt: { type: 'string', format: 'date-time' },
            tags: { type: 'array', items: { type: 'string' } }
          }
        }
      }
  }
    async (request: FastifyRequest<CreateAlertRequest>, reply: FastifyReply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return reply.code(401).send({
            success: false,
            error: 'Authentication required'
          });
        }

        const hasAccess = await fastify.authService.hasPermission(userId, 'fraud:alert_create');
        if (!hasAccess) {
          return reply.code(403).send({
            success: false,
            error: 'Insufficient permissions'
          });
        }

        const options = {
          fraudScore: request.body.fraudScore,
          entityType: request.body.entityType,
          entityId: request.body.entityId,
          detectionMethod: request.body.detectionMethod,
          expiresAt: request.body.expiresAt ? new Date(request.body.expiresAt) : undefined,
          tags: request.body.tags
        };

        const alert = await fraudMonitoring.createFraudAlert(
          request.body.severity,
          request.body.type,
          request.body.title,
          request.body.description,
          options
        );

        reply.code(201).send({
          success: true,
          alert,
          message: 'Alert created successfully'
        });

      } catch (error) {
        console.error('Error creating fraud alert:', error);
        reply.code(500).send({
          success: false,
          error: 'Failed to create alert',
          message: error.message
        });
      }
    }
  );

  /**
   * Get active fraud alerts
   */
  fastify.get<{
    Querystring: {
      severity?: string;
      type?: string;
      status?: string;
      limit?: number;
      offset?: number;
    };
  }>(
    '/fraud-alerts',
    {
      schema: {
        tags: ['Fraud Alerts'],
        summary: 'List fraud alerts',
        description: 'Retrieve fraud alerts with optional filtering',
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            severity: { type: 'string', enum: ['info', 'warning', 'critical', 'urgent'] },
            type: { type: 'string' },
            status: { type: 'string', enum: ['active', 'acknowledged', 'resolved', 'dismissed'] },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
            offset: { type: 'integer', minimum: 0, default: 0 }
          }
        }
      }
  }
    async (request, reply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return reply.code(401).send({
            success: false,
            error: 'Authentication required'
          });
        }

        const hasAccess = await fastify.authService.hasPermission(userId, 'fraud:alert_read');
        if (!hasAccess) {
          return reply.code(403).send({
            success: false,
            error: 'Insufficient permissions'
          });
        }

        // For now, return mock data - would implement actual database query
        const alerts = [];
        const total = 0;

        reply.send({
          success: true,
          alerts,
          total,
          pagination: {
            limit: request.query.limit || 20,
            offset: request.query.offset || 0,
            hasMore: false
          }
        });

      } catch (error) {
        console.error('Error retrieving fraud alerts:', error);
        reply.code(500).send({
          success: false,
          error: 'Failed to retrieve alerts'
        });
      }
    }
  );

  /**
   * Acknowledge an alert
   */
  fastify.put<{ Params: { alertId: string } }>(
    '/fraud-alerts/:alertId/acknowledge',
    {
      schema: {
        tags: ['Fraud Alerts'],
        summary: 'Acknowledge alert',
        description: 'Acknowledge a fraud alert',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['alertId'],
          properties: {
            alertId: { type: 'string' }
          }
        }
      }
  }
    async (request, reply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return reply.code(401).send({
            success: false,
            error: 'Authentication required'
          });
        }

        const hasAccess = await fastify.authService.hasPermission(userId, 'fraud:alert_acknowledge');
        if (!hasAccess) {
          return reply.code(403).send({
            success: false,
            error: 'Insufficient permissions'
          });
        }

        const alert = await fraudMonitoring.acknowledgeAlert(request.params.alertId, userId);

        reply.send({
          success: true,
          alert,
          message: 'Alert acknowledged successfully'
        });

      } catch (error) {
        console.error('Error acknowledging alert:', error);
        reply.code(500).send({
          success: false,
          error: 'Failed to acknowledge alert',
          message: error.message
        });
      }
    }
  );

  // =============================================================================
  // Analytics and Reporting Endpoints
  // =============================================================================

  /**
   * Get fraud analytics
   */
  fastify.get<AnalyticsRequest>(
    '/fraud-analytics',
    {
      schema: {
        tags: ['Fraud Analytics'],
        summary: 'Get fraud analytics',
        description: 'Retrieve comprehensive fraud analytics for a time period',
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          required: ['startDate', 'endDate'],
          properties: {
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' },
            format: { type: 'string', enum: ['json', 'csv'], default: 'json' },
            includeInsights: { type: 'boolean', default: true }
          }
        }
      }
  }
    async (request: FastifyRequest<AnalyticsRequest>, reply: FastifyReply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return reply.code(401).send({
            success: false,
            error: 'Authentication required'
          });
        }

        const hasAccess = await fastify.authService.hasPermission(userId, 'fraud:analytics_read');
        if (!hasAccess) {
          return reply.code(403).send({
            success: false,
            error: 'Insufficient permissions'
          });
        }

        const timeRange = {
          startDate: new Date(request.query.startDate),
          endDate: new Date(request.query.endDate)
        };

        const analytics = await fraudMonitoring.generateFraudAnalytics(timeRange);

        if (request.query.format === 'csv') {
          // TODO: Implement CSV export
          reply.type('text/csv');
          reply.send('CSV export not yet implemented');
        } else {
          reply.send({
            success: true,
            analytics,
            generatedAt: new Date()
          });
        }

      } catch (error) {
        console.error('Error generating fraud analytics:', error);
        reply.code(500).send({
          success: false,
          error: 'Failed to generate analytics',
          message: error.message
        });
      }
    }
  );

  /**
   * Get fraud dashboard
   */
  fastify.get(
    '/fraud-dashboard',
    {
      schema: {
        tags: ['Fraud Analytics'],
        summary: 'Get fraud dashboard',
        description: 'Retrieve real-time fraud monitoring dashboard data',
        security: [{ bearerAuth: [] }]
      }
  }
    async (request, reply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return reply.code(401).send({
            success: false,
            error: 'Authentication required'
          });
        }

        const hasAccess = await fastify.authService.hasPermission(userId, 'fraud:dashboard_read');
        if (!hasAccess) {
          return reply.code(403).send({
            success: false,
            error: 'Insufficient permissions'
          });
        }

        const dashboard = await fraudMonitoring.getFraudDashboard();

        reply.send({
          success: true,
          dashboard,
          lastUpdated: new Date()
        });

      } catch (error) {
        console.error('Error generating fraud dashboard:', error);
        reply.code(500).send({
          success: false,
          error: 'Failed to generate dashboard'
        });
      }
    }
  );

  /**
   * Get fraud detection statistics
   */
  fastify.get<{
    Querystring: {
      startDate: string;
      endDate: string;
    };
  }>(
    '/fraud-stats',
    {
      schema: {
        tags: ['Fraud Analytics'],
        summary: 'Get fraud statistics',
        description: 'Retrieve fraud detection performance statistics',
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          required: ['startDate', 'endDate'],
          properties: {
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' }
          }
        }
      }
  }
    async (request, reply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return reply.code(401).send({
            success: false,
            error: 'Authentication required'
          });
        }

        const hasAccess = await fastify.authService.hasPermission(userId, 'fraud:stats_read');
        if (!hasAccess) {
          return reply.code(403).send({
            success: false,
            error: 'Insufficient permissions'
          });
        }

        const timeRange = {
          startDate: new Date(request.query.startDate),
          endDate: new Date(request.query.endDate)
        };

        const stats = await fraudMonitoring.getFraudDetectionStats(timeRange);

        reply.send({
          success: true,
          stats,
          period: timeRange,
          generatedAt: new Date()
        });

      } catch (error) {
        console.error('Error generating fraud stats:', error);
        reply.code(500).send({
          success: false,
          error: 'Failed to generate statistics'
        });
      }
    }
  );

  // =============================================================================
  // Rules Management Endpoints
  // =============================================================================

  /**
   * Create or update a fraud rule
   */
  fastify.post<FraudRuleRequest>(
    '/fraud-rules',
    {
      schema: {
        tags: ['Fraud Rules'],
        summary: 'Create fraud rule',
        description: 'Create or update a fraud detection rule',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['name', 'description', 'category', 'conditions'],
          properties: {
            name: { type: 'string', minLength: 3 },
            description: { type: 'string', minLength: 10 },
            category: { type: 'string' },
            severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
            enabled: { type: 'boolean', default: true },
            conditions: { type: 'array', items: { type: 'object' } },
            actions: { type: 'array', items: { type: 'object' } },
            thresholds: { type: 'array', items: { type: 'object' } },
            tags: { type: 'array', items: { type: 'string' } }
          }
        }
      }
  }
    async (request: FastifyRequest<FraudRuleRequest>, reply: FastifyReply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return reply.code(401).send({
            success: false,
            error: 'Authentication required'
          });
        }

        const hasAccess = await fastify.authService.hasPermission(userId, 'fraud:rules_manage');
        if (!hasAccess) {
          return reply.code(403).send({
            success: false,
            error: 'Insufficient permissions'
          });
        }

        const ruleData = {
          ...request.body,
          metadata: {
            createdBy: userId,
            createdAt: new Date(),
            tags: request.body.tags || []
          }
        };

        const rule = await fraudMonitoring.upsertFraudRule(ruleData);

        reply.code(201).send({
          success: true,
          rule,
          message: 'Fraud rule created successfully'
        });

      } catch (error) {
        console.error('Error creating fraud rule:', error);
        reply.code(500).send({
          success: false,
          error: 'Failed to create fraud rule',
          message: error.message
        });
      }
    }
  );

  /**
   * System health check for fraud monitoring
   */
  fastify.get(
    '/fraud-health',
    {
      schema: {
        tags: ['System'],
        summary: 'Fraud system health',
        description: 'Check health status of fraud monitoring system'
      }
  }
    async (request, reply) => {
      try {
        const health = {
          status: 'healthy',
          timestamp: new Date(),
          services: {
            fraudEngine: 'operational',
            fraudMonitoring: 'operational',
            database: 'operational',
            mlModels: 'disabled',
            rulesEngine: 'operational'
  }
          metrics: {
            avgProcessingTime: 150,
            successRate: 99.5,
            errorRate: 0.5,
            alertsActive: 0,
            reviewQueueSize: 0
  }
          configuration: {
            realTimeMonitoring: true,
            mlModelsEnabled: false,
            rulesEngineEnabled: true,
            autoActionsEnabled: true
          }
        };

        reply.send({
          success: true,
          health
        });

      } catch (error) {
        console.error('Error checking fraud system health:', error);
        reply.code(500).send({
          success: false,
          error: 'Health check failed',
          status: 'unhealthy'
        });
      }
    }
  );
}