/**
 * Evidence Access Audit Trail API Routes
 * 
 * RESTful API endpoints for querying, reporting, and managing evidence access audit trails.
 * Integrates with existing security and access control patterns.
 * 
 * Task: T-1752989143998-782 - Add evidence access audit trail
 * Epic: 18 - Technical Debt & Refactoring
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { 
  EvidenceAccessAuditService, 
  AuditTrailQuery, 
  EvidenceAccessAction, 
  EvidenceAccessOutcome 
} from '../services/security/EvidenceAccessAuditService';
import { AccessControlFramework } from '../services/security/AccessControlFramework';
import { z } from 'zod';

// Request/Response schemas for validation
const AuditTrailQuerySchema = z.object({
  evidenceId: z.string().optional(),
  userId: z.string().optional(),
  action: z.nativeEnum(EvidenceAccessAction).optional(),
  outcome: z.nativeEnum(EvidenceAccessOutcome).optional(),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  limit: z.number().int().min(1).max(1000).default(100),
  offset: z.number().int().min(0).default(0),
  includeDeleted: z.boolean().default(false)
});

const AuditReportParamsSchema = z.object({
  format: z.enum(['json', 'csv', 'xlsx']).default('json'),
  includeAnalytics: z.boolean().default(true),
  includeCharts: z.boolean().default(false)
});

const IntegrityVerificationSchema = z.object({
  evidenceId: z.string(),
  fullChainVerification: z.boolean().default(true)
});

const BulkAuditSchema = z.object({
  operations: z.array(z.object({
    evidenceId: z.string(),
    action: z.nativeEnum(EvidenceAccessAction),
    outcome: z.nativeEnum(EvidenceAccessOutcome),
    metadata: z.record(z.any()).optional()
  })).max(100), // Limit bulk operations
  sharedContext: z.object({
    userId: z.string(),
    sessionId: z.string().optional(),
    applicationContext: z.string().optional()
  })
});

interface AuthenticatedRequest extends FastifyRequest {
  user: {
    id: string;
    roles: string[];
    permissions: string[];
  };
}

export async function auditTrailRoutes(fastify: FastifyInstance) {
  const auditService = fastify.auditService as EvidenceAccessAuditService;
  const accessControl = fastify.accessControl as AccessControlFramework;

  // Middleware for authentication and authorization
  fastify.addHook('preHandler', async (request: AuthenticatedRequest, reply) => {
    // Ensure user is authenticated
    if (!request.user?.id) {
      return reply.code(401).send({ error: 'Authentication required' });
    }

    // Check if user has audit access permissions
    const hasAuditAccess = request.user.permissions?.includes('audit:read') ||
                          request.user.roles?.includes('auditor') ||
                          request.user.roles?.includes('admin');

    if (!hasAuditAccess) {
      return reply.code(403).send({ error: 'Insufficient permissions for audit access' });
    }
  });

  /**
   * GET /api/audit-trail
   * Query audit trail with filters and pagination
   */
  fastify.get('/api/audit-trail', {
    schema: {
      querystring: AuditTrailQuerySchema,
      response: {
        200: z.object({
          data: z.array(z.any()),
          pagination: z.object({
            total: z.number(),
            limit: z.number(),
            offset: z.number(),
            hasMore: z.boolean()
          }),
          summary: z.object({
            timeRange: z.object({
              from: z.string().datetime(),
              to: z.string().datetime()
            }),
            counts: z.object({
              total: z.number(),
              successful: z.number(),
              failed: z.number(),
              highRisk: z.number()
            })
          })
        })
      }
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const query: AuditTrailQuery = {
        ...request.query as any,
        dateFrom: request.query.dateFrom ? new Date(request.query.dateFrom) : undefined,
        dateTo: request.query.dateTo ? new Date(request.query.dateTo) : undefined
      };

      // Apply user-based restrictions if not admin
      if (!request.user.roles?.includes('admin')) {
        // Non-admin users can only see their own audit records or evidence they have access to
        if (!query.userId) {
          query.userId = request.user.id;
        } else if (query.userId !== request.user.id) {
          // Check if user has permission to view other users' audit trails
          const canViewOthers = request.user.permissions?.includes('audit:read:all');
          if (!canViewOthers) {
            return reply.code(403).send({ error: 'Cannot view audit trails for other users' });
          }
        }
      }

      const auditEntries = await auditService.getAuditTrail(query);
      
      // Get total count for pagination
      const totalQuery = { ...query, limit: undefined, offset: undefined };
      const totalEntries = await auditService.getAuditTrail(totalQuery);
      
      // Calculate summary statistics
      const summary = {
        timeRange: {
          from: auditEntries.length > 0 
            ? auditEntries[auditEntries.length - 1].timestamp.toISOString()
            : new Date().toISOString(),
          to: auditEntries.length > 0 
            ? auditEntries[0].timestamp.toISOString()
            : new Date().toISOString()
        },
        counts: {
          total: totalEntries.length,
          successful: totalEntries.filter(e => e.outcome === EvidenceAccessOutcome.SUCCESS).length,
          failed: totalEntries.filter(e => ['DENIED', 'ERROR'].includes(e.outcome)).length,
          highRisk: totalEntries.filter(e => ['HIGH', 'CRITICAL'].includes(e.risk.level)).length
        }
      };

      return {
        data: auditEntries,
        pagination: {
          total: totalEntries.length,
          limit: query.limit || 100,
          offset: query.offset || 0,
          hasMore: (query.offset || 0) + (query.limit || 100) < totalEntries.length
        },
        summary
      };

    } catch (error) {
      fastify.log.error('Failed to query audit trail:', error);
      return reply.code(500).send({ 
        error: 'Failed to retrieve audit trail',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * GET /api/audit-trail/report
   * Generate comprehensive audit report with analytics
   */
  fastify.get('/api/audit-trail/report', {
    schema: {
      querystring: AuditTrailQuerySchema.merge(AuditReportParamsSchema),
      response: {
        200: z.object({
          report: z.any(),
          metadata: z.object({
            generatedAt: z.string().datetime(),
            generatedBy: z.string(),
            format: z.string(),
            recordCount: z.number()
          })
        })
      }
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const query: AuditTrailQuery = {
        ...request.query as any,
        dateFrom: request.query.dateFrom ? new Date(request.query.dateFrom) : undefined,
        dateTo: request.query.dateTo ? new Date(request.query.dateTo) : undefined
      };

      // Apply same user restrictions as main query
      if (!request.user.roles?.includes('admin') && !query.userId) {
        query.userId = request.user.id;
      }

      const report = await auditService.generateAuditReport(query);

      // Format response based on requested format
      const format = (request.query as any).format || 'json';
      
      if (format === 'csv') {
        const csv = await convertReportToCSV(report);
        reply.header('Content-Type', 'text/csv');
        reply.header('Content-Disposition', `attachment; filename="audit-report-${Date.now()}.csv"`);
        return csv;
      }

      if (format === 'xlsx') {
        const xlsx = await convertReportToXLSX(report);
        reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        reply.header('Content-Disposition', `attachment; filename="audit-report-${Date.now()}.xlsx"`);
        return xlsx;
      }

      return {
        report,
        metadata: {
          generatedAt: new Date().toISOString(),
          generatedBy: request.user.id,
          format,
          recordCount: report.entries.length
        }
      };

    } catch (error) {
      fastify.log.error('Failed to generate audit report:', error);
      return reply.code(500).send({ 
        error: 'Failed to generate audit report',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * GET /api/audit-trail/:evidenceId
   * Get audit trail for specific evidence
   */
  fastify.get('/api/audit-trail/:evidenceId', {
    schema: {
      params: z.object({
        evidenceId: z.string()
      }),
      querystring: z.object({
        includeIntegrityCheck: z.boolean().default(true),
        limit: z.number().int().min(1).max(1000).default(100),
        offset: z.number().int().min(0).default(0)
      })
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const { evidenceId } = request.params as { evidenceId: string };
      const { includeIntegrityCheck, limit, offset } = request.query as any;

      // Check if user has access to this evidence
      const hasAccess = await checkEvidenceAccess(request.user, evidenceId, accessControl);
      if (!hasAccess) {
        return reply.code(403).send({ error: 'Access denied to evidence audit trail' });
      }

      const auditEntries = await auditService.getAuditTrail({
        evidenceId,
        limit,
        offset
      });

      let integrityReport = null;
      if (includeIntegrityCheck) {
        integrityReport = await auditService.verifyAuditIntegrity(evidenceId);
      }

      return {
        evidenceId,
        auditTrail: auditEntries,
        integrity: integrityReport,
        metadata: {
          totalEntries: auditEntries.length,
          oldestEntry: auditEntries.length > 0 ? auditEntries[auditEntries.length - 1].timestamp : null,
          newestEntry: auditEntries.length > 0 ? auditEntries[0].timestamp : null
        }
      };

    } catch (error) {
      fastify.log.error('Failed to get evidence audit trail:', error);
      return reply.code(500).send({ 
        error: 'Failed to retrieve evidence audit trail',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * POST /api/audit-trail/verify-integrity
   * Verify audit trail integrity for evidence
   */
  fastify.post('/api/audit-trail/verify-integrity', {
    schema: {
      body: IntegrityVerificationSchema,
      response: {
        200: z.object({
          isValid: z.boolean(),
          verificationReport: z.any(),
          brokenChains: z.array(z.string()),
          recommendations: z.array(z.string())
        })
      }
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const { evidenceId, fullChainVerification } = request.body as any;

      // Check admin permissions for integrity verification
      const isAdmin = request.user.roles?.includes('admin') || 
                     request.user.permissions?.includes('audit:verify');
      if (!isAdmin) {
        return reply.code(403).send({ error: 'Admin permissions required for integrity verification' });
      }

      const integrityResult = await auditService.verifyAuditIntegrity(evidenceId);
      
      const recommendations = [];
      if (!integrityResult.isValid) {
        recommendations.push('Investigate broken audit chain entries');
        recommendations.push('Review system security for potential tampering');
        recommendations.push('Consider restoring from backup if available');
      }

      // Log the integrity verification
      await auditService.recordEvidenceAccess(
        {
          subject: {
            id: request.user.id,
            type: 'user',
            roles: request.user.roles,
            permissions: request.user.permissions
          },
          resource: {
            id: evidenceId,
            type: 'evidence',
            attributes: {}
          },
          action: {
            operation: 'verify_integrity',
            intent: 'security_audit'
          },
          environment: {
            timestamp: new Date(),
            applicationContext: 'admin_api',
            sourceIP: request.ip,
            userAgent: request.headers['user-agent'] || 'unknown'
          }
        },
        evidenceId,
        EvidenceAccessAction.READ,
        EvidenceAccessOutcome.SUCCESS,
        {
          integrityCheck: true,
          fullChainVerification,
          verificationResult: integrityResult.isValid
        }
      );

      return {
        ...integrityResult,
        recommendations
      };

    } catch (error) {
      fastify.log.error('Failed to verify audit integrity:', error);
      return reply.code(500).send({ 
        error: 'Failed to verify audit integrity',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * POST /api/audit-trail/bulk
   * Bulk audit logging for batch operations
   */
  fastify.post('/api/audit-trail/bulk', {
    schema: {
      body: BulkAuditSchema,
      response: {
        201: z.object({
          recorded: z.number(),
          failed: z.number(),
          correlationId: z.string(),
          errors: z.array(z.string())
        })
      }
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const { operations, sharedContext } = request.body as any;

      // Verify user can audit for the specified user
      if (sharedContext.userId !== request.user.id && !request.user.roles?.includes('admin')) {
        return reply.code(403).send({ error: 'Cannot audit for other users' });
      }

      let recorded = 0;
      let failed = 0;
      const errors: string[] = [];

      await auditService.auditBatchEvidenceAccess(
        sharedContext.userId,
        operations,
        {
          subject: {
            id: sharedContext.userId,
            type: 'user',
            sessionId: sharedContext.sessionId
          },
          environment: {
            timestamp: new Date(),
            applicationContext: sharedContext.applicationContext || 'batch_api',
            sourceIP: request.ip,
            userAgent: request.headers['user-agent'] || 'unknown'
          }
        }
      );

      recorded = operations.length;

      const correlationId = crypto.randomUUID();

      return reply.code(201).send({
        recorded,
        failed,
        correlationId,
        errors
      });

    } catch (error) {
      fastify.log.error('Failed to process bulk audit:', error);
      return reply.code(500).send({ 
        error: 'Failed to process bulk audit operations',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * GET /api/audit-trail/analytics
   * Get audit trail analytics and insights
   */
  fastify.get('/api/audit-trail/analytics', {
    schema: {
      querystring: z.object({
        timeRange: z.enum(['24h', '7d', '30d', '90d']).default('7d'),
        groupBy: z.enum(['hour', 'day', 'week']).default('day'),
        includeRiskAnalysis: z.boolean().default(true)
      })
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const { timeRange, groupBy, includeRiskAnalysis } = request.query as any;

      // Calculate date range
      const now = new Date();
      const dateFrom = new Date();
      switch (timeRange) {
        case '24h':
          dateFrom.setHours(now.getHours() - 24);
          break;
        case '7d':
          dateFrom.setDate(now.getDate() - 7);
          break;
        case '30d':
          dateFrom.setDate(now.getDate() - 30);
          break;
        case '90d':
          dateFrom.setDate(now.getDate() - 90);
          break;
      }

      const analytics = await generateAuditAnalytics(auditService, {
        dateFrom,
        dateTo: now,
        groupBy,
        includeRiskAnalysis
      });

      return analytics;

    } catch (error) {
      fastify.log.error('Failed to generate audit analytics:', error);
      return reply.code(500).send({ 
        error: 'Failed to generate audit analytics',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}

// Helper functions

async function checkEvidenceAccess(
  user: { id: string; roles: string[]; permissions: string[] },
  evidenceId: string,
  accessControl: AccessControlFramework
): Promise<boolean> {
  // Check if user has access to evidence or is admin
  if (user.roles?.includes('admin')) {
    return true;
  }

  // TODO: Integrate with actual evidence access control
  // For now, allow access if user has audit permissions
  return user.permissions?.includes('audit:read') || user.roles?.includes('auditor');
}

async function convertReportToCSV(report: any): Promise<string> {
  // Convert audit report to CSV format
  const headers = [
    'Timestamp', 'Evidence ID', 'User ID', 'Action', 'Outcome', 
    'Risk Level', 'Risk Score', 'IP Address', 'User Agent'
  ];
  
  const rows = report.entries.map((entry: any) => [
    entry.timestamp,
    entry.evidenceId,
    entry.subject.userId,
    entry.action.type,
    entry.outcome,
    entry.risk.level,
    entry.risk.score,
    entry.subject.ipAddress,
    entry.subject.userAgent
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}

async function convertReportToXLSX(report: any): Promise<Buffer> {
  // TODO: Implement XLSX conversion using a library like exceljs
  // For now, return empty buffer
  return Buffer.from('');
}

async function generateAuditAnalytics(
  auditService: EvidenceAccessAuditService,
  options: {
    dateFrom: Date;
    dateTo: Date;
    groupBy: string;
    includeRiskAnalysis: boolean;
  }
): Promise<any> {
  const query = {
    dateFrom: options.dateFrom,
    dateTo: options.dateTo,
    limit: 10000 // Large limit for analytics
  };

  const auditEntries = await auditService.getAuditTrail(query);

  // Group data by time period
  const grouped = auditEntries.reduce((acc, entry) => {
    let key: string;
    const date = new Date(entry.timestamp);
    
    switch (options.groupBy) {
      case 'hour':
        key = date.toISOString().substring(0, 13) + ':00:00.000Z';
        break;
      case 'day':
        key = date.toISOString().substring(0, 10) + 'T00:00:00.000Z';
        break;
      case 'week':
        const week = new Date(date);
        week.setDate(date.getDate() - date.getDay());
        key = week.toISOString().substring(0, 10) + 'T00:00:00.000Z';
        break;
      default:
        key = date.toISOString();
    }

    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(entry);
    return acc;
  }, {} as Record<string, any[]>);

  // Calculate analytics for each time period
  const timeSeriesData = Object.keys(grouped).sort().map(key => {
    const entries = grouped[key];
    return {
      timestamp: key,
      totalAccesses: entries.length,
      uniqueUsers: new Set(entries.map(e => e.subject.userId)).size,
      uniqueEvidence: new Set(entries.map(e => e.evidenceId)).size,
      successfulAccesses: entries.filter(e => e.outcome === 'SUCCESS').length,
      deniedAccesses: entries.filter(e => e.outcome === 'DENIED').length,
      errorAccesses: entries.filter(e => e.outcome === 'ERROR').length,
      highRiskAccesses: entries.filter(e => ['HIGH', 'CRITICAL'].includes(e.risk.level)).length,
      avgRiskScore: entries.reduce((sum, e) => sum + e.risk.score, 0) / entries.length
    };
  });

  const analytics = {
    timeSeriesData,
    summary: {
      totalAccesses: auditEntries.length,
      uniqueUsers: new Set(auditEntries.map(e => e.subject.userId)).size,
      uniqueEvidence: new Set(auditEntries.map(e => e.evidenceId)).size,
      avgRiskScore: auditEntries.reduce((sum, e) => sum + e.risk.score, 0) / auditEntries.length,
      riskDistribution: auditEntries.reduce((acc, e) => {
        acc[e.risk.level] = (acc[e.risk.level] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    }
  };

  if (options.includeRiskAnalysis) {
    // Add risk analysis
    analytics.riskAnalysis = {
      topRiskUsers: getTopRiskUsers(auditEntries),
      topRiskEvidence: getTopRiskEvidence(auditEntries),
      riskTrends: calculateRiskTrends(timeSeriesData)
    };
  }

  return analytics;
}

function getTopRiskUsers(entries: any[]): any[] {
  const userRisk = entries.reduce((acc, entry) => {
    const userId = entry.subject.userId;
    if (!acc[userId]) {
      acc[userId] = { userId, totalRisk: 0, accessCount: 0, highRiskCount: 0 };
    }
    acc[userId].totalRisk += entry.risk.score;
    acc[userId].accessCount++;
    if (['HIGH', 'CRITICAL'].includes(entry.risk.level)) {
      acc[userId].highRiskCount++;
    }
    return acc;
  }, {} as Record<string, any>);

  return Object.values(userRisk)
    .map((user: any) => ({
      ...user,
      avgRisk: user.totalRisk / user.accessCount
    }))
    .sort((a, b) => b.avgRisk - a.avgRisk)
    .slice(0, 10);
}

function getTopRiskEvidence(entries: any[]): any[] {
  const evidenceRisk = entries.reduce((acc, entry) => {
    const evidenceId = entry.evidenceId;
    if (!acc[evidenceId]) {
      acc[evidenceId] = { evidenceId, totalRisk: 0, accessCount: 0, highRiskCount: 0 };
    }
    acc[evidenceId].totalRisk += entry.risk.score;
    acc[evidenceId].accessCount++;
    if (['HIGH', 'CRITICAL'].includes(entry.risk.level)) {
      acc[evidenceId].highRiskCount++;
    }
    return acc;
  }, {} as Record<string, any>);

  return Object.values(evidenceRisk)
    .map((evidence: any) => ({
      ...evidence,
      avgRisk: evidence.totalRisk / evidence.accessCount
    }))
    .sort((a, b) => b.avgRisk - a.avgRisk)
    .slice(0, 10);
}

function calculateRiskTrends(timeSeriesData: any[]): any {
  if (timeSeriesData.length < 2) {
    return { trend: 'insufficient_data' };
  }

  const recent = timeSeriesData.slice(-7); // Last 7 periods
  const older = timeSeriesData.slice(-14, -7); // Previous 7 periods

  const recentAvgRisk = recent.reduce((sum, d) => sum + d.avgRiskScore, 0) / recent.length;
  const olderAvgRisk = older.length > 0 
    ? older.reduce((sum, d) => sum + d.avgRiskScore, 0) / older.length 
    : recentAvgRisk;

  const trendPercent = ((recentAvgRisk - olderAvgRisk) / olderAvgRisk) * 100;

  return {
    trend: trendPercent > 5 ? 'increasing' : trendPercent < -5 ? 'decreasing' : 'stable',
    trendPercent,
    recentAvgRisk,
    olderAvgRisk
  };
}