// Epic 17.1.6 - Audit Logging API Routes

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AuditService } from '../services/audit-service';
import {
  AuditEventType,
  AuditCategory,
  AuditSeverity,
  ComplianceStandard,
  AuditEventQuery,
  CreateComplianceReportRequest,
  AuditEvent
} from '../database/audit-models';

// Request type definitions
}
}
interface QueryAuditEventsRequest {
  Querystring: {
    startDate?: string;
    endDate?: string;
    eventTypes?: string; // comma-separated
    categories?: string; // comma-separated
    severities?: string; // comma-separated
    outcomes?: string; // comma-separated
    actorIds?: string; // comma-separated
    actorEmails?: string; // comma-separated
    actorTypes?: string; // comma-separated
    resourceTypes?: string; // comma-separated
    resourceIds?: string; // comma-separated
    ipAddress?: string;
    sessionId?: string;
    correlationId?: string;
    searchTerm?: string;
    tags?: string; // comma-separated
    complianceStandards?: string; // comma-separated
    page?: number;
    limit?: number;
    sortBy?: 'timestamp' | 'severity' | 'eventType' | 'actorEmail';
    sortOrder?: 'asc' | 'desc';
}
}
  };
}

}
}
interface GetStatisticsRequest {
  Querystring: {
    startDate?: string;
    endDate?: string;
}
}
  };
}

}
}
interface CreateComplianceReportRequestBody {
  Body: CreateComplianceReportRequest;
}
}
}

}
}
interface ExportAuditLogsRequest {
  Querystring: AuditEventQuery & {
    format?: 'json' | 'csv' | 'xml' | 'pdf';
    includeMetadata?: boolean;
    includeIntegrityData?: boolean;
}
}
  };
}

}
}
interface GetAuditTrailRequest {
  Params: {
    resourceType: string;
    resourceId: string;
}
}
  };
  Querystring: {
    limit?: number;
    page?: number;
  };
}

export async function auditRoutes(fastify: FastifyInstance) {
  const auditService: AuditService = fastify.auditService;

  // Query audit events
  fastify.get<QueryAuditEventsRequest>('/audit/events', {
    schema: {
      description: 'Query audit events with filters',
      tags: ['Audit'],
      querystring: {
        type: 'object',
        properties: {
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          eventTypes: { type: 'string', description: 'Comma-separated event types' },
          categories: { type: 'string', description: 'Comma-separated categories' },
          severities: { type: 'string', description: 'Comma-separated severities' },
          outcomes: { type: 'string', description: 'Comma-separated outcomes' },
          actorIds: { type: 'string', description: 'Comma-separated actor IDs' },
          actorEmails: { type: 'string', description: 'Comma-separated actor emails' },
          resourceTypes: { type: 'string', description: 'Comma-separated resource types' },
          resourceIds: { type: 'string', description: 'Comma-separated resource IDs' },
          searchTerm: { type: 'string' },
          page: { type: 'number', minimum: 1, default: 1 },
          limit: { type: 'number', minimum: 1, maximum: 1000, default: 50 },
          sortBy: { type: 'string', enum: ['timestamp', 'severity', 'eventType', 'actorEmail'], default: 'timestamp' },
          sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc' }
        }
  }
      security: [{ bearerAuth: [] }]
    }
  }, async (request: FastifyRequest<QueryAuditEventsRequest>, reply: FastifyReply) => {
    try {
      // Parse comma-separated values
      const query: AuditEventQuery = {
        startDate: request.query.startDate,
        endDate: request.query.endDate,
        eventTypes: request.query.eventTypes ? 
          request.query.eventTypes.split(',').map(t => t.trim() as AuditEventType) : undefined,
        categories: request.query.categories ? 
          request.query.categories.split(',').map(c => c.trim() as AuditCategory) : undefined,
        severities: request.query.severities ? 
          request.query.severities.split(',').map(s => s.trim() as AuditSeverity) : undefined,
        outcomes: request.query.outcomes ? 
          request.query.outcomes.split(',').map(o => o.trim() as 'success' | 'failure' | 'partial') : undefined,
        actorIds: request.query.actorIds ? 
          request.query.actorIds.split(',').map(id => id.trim()) : undefined,
        actorEmails: request.query.actorEmails ? 
          request.query.actorEmails.split(',').map(email => email.trim()) : undefined,
        resourceTypes: request.query.resourceTypes ? 
          request.query.resourceTypes.split(',').map(type => type.trim()) : undefined,
        resourceIds: request.query.resourceIds ? 
          request.query.resourceIds.split(',').map(id => id.trim()) : undefined,
        ipAddress: request.query.ipAddress,
        sessionId: request.query.sessionId,
        correlationId: request.query.correlationId,
        searchTerm: request.query.searchTerm,
        tags: request.query.tags ? 
          request.query.tags.split(',').map(tag => tag.trim()) : undefined,
        complianceStandards: request.query.complianceStandards ? 
          request.query.complianceStandards.split(',').map(std => std.trim() as ComplianceStandard) : undefined,
        page: request.query.page,
        limit: request.query.limit,
        sortBy: request.query.sortBy,
        sortOrder: request.query.sortOrder
      };

      const result = await auditService.queryEvents(query);

      // Log this audit query for compliance
      if (request.audit) {
        await request.audit.log({
          eventType: AuditEventType.DATA_EXPORTED,
          category: AuditCategory.COMPLIANCE,
          severity: AuditSeverity.LOW,
          resourceType: 'audit_log',
          action: 'query',
          description: `Audit logs queried by ${request.user?.email || 'unknown'}`,
          outcome: 'success',
          metadata: {
            queryParameters: query,
            resultCount: result.events.length
  }
          complianceStandards: [ComplianceStandard.SOC2, ComplianceStandard.GDPR]
        });
      }

      reply.send({
        success: true,
        data: result.events,
        pagination: result.pagination,
        summary: result.summary
      });
    } catch (error: unknown) {
      reply.code(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  });

  // Get audit statistics
  fastify.get<GetStatisticsRequest>('/audit/statistics', {
    schema: {
      description: 'Get audit statistics and metrics',
      tags: ['Audit'],
      querystring: {
        type: 'object',
        properties: {
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' }
        }
  }
      security: [{ bearerAuth: [] }]
    }
  }, async (request: FastifyRequest<GetStatisticsRequest>, reply: FastifyReply) => {
    try {
      const startDate = request.query.startDate ? new Date(request.query.startDate) : undefined;
      const endDate = request.query.endDate ? new Date(request.query.endDate) : undefined;

      const statistics = await auditService.getStatistics(startDate, endDate);

      reply.send({
        success: true,
        data: statistics
      });
    } catch (error: unknown) {
      reply.code(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  });

  // Generate compliance report
  fastify.post<CreateComplianceReportRequestBody>('/audit/compliance-reports', {
    schema: {
      description: 'Generate compliance report',
      tags: ['Audit'],
      body: {
        type: 'object',
        required: ['reportType', 'standard', 'startDate', 'endDate'],
        properties: {
          reportType: { 
            type: 'string', 
            enum: ['access_report', 'change_report', 'security_report', 'retention_report'] 
  }
          standard: { 
            type: 'string', 
            enum: Object.values(ComplianceStandard) 
  }
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          scope: {
            type: 'object',
            properties: {
              userIds: { type: 'array', items: { type: 'string' } },
              resourceTypes: { type: 'array', items: { type: 'string' } },
              eventTypes: { type: 'array', items: { type: 'string' } }
            }
  }
          format: { type: 'string', enum: ['json', 'pdf', 'csv', 'xml'], default: 'json' }
        }
  }
      security: [{ bearerAuth: [] }]
    }
  }, async (request: FastifyRequest<CreateComplianceReportRequestBody>, reply: FastifyReply) => {
    try {
      const generatedBy = request.user?.id || 'system';
      const report = await auditService.generateComplianceReport(request.body, generatedBy);

      // Log compliance report generation
      if (request.audit) {
        await request.audit.log({
          eventType: AuditEventType.COMPLIANCE_REPORT_GENERATED,
          category: AuditCategory.COMPLIANCE,
          severity: AuditSeverity.MEDIUM,
          resourceType: 'compliance_report',
          resourceId: report.id,
          action: 'generate',
          description: `${request.body.standard} compliance report generated`,
          outcome: 'success',
          metadata: {
            reportType: report.reportType,
            standard: report.standard,
            eventCount: report.events.length,
            violationCount: report.violations.length
  }
          complianceStandards: [request.body.standard]
        });
      }

      reply.code(201).send({
        success: true,
        data: {
          id: report.id,
          reportType: report.reportType,
          standard: report.standard,
          summary: report.summary,
          generatedAt: report.generatedAt,
          format: report.format,
          violationCount: report.violations.length
        }
      });
    } catch (error: unknown) {
      reply.code(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  });

  // Export audit logs
  fastify.get<ExportAuditLogsRequest>('/audit/export', {
    schema: {
      description: 'Export audit logs in various formats',
      tags: ['Audit'],
      querystring: {
        type: 'object',
        properties: {
          // Include all query parameters from AuditEventQuery
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          format: { type: 'string', enum: ['json', 'csv', 'xml', 'pdf'], default: 'json' },
          includeMetadata: { type: 'boolean', default: true },
          includeIntegrityData: { type: 'boolean', default: false }
        }
  }
      security: [{ bearerAuth: [] }]
    }
  }, async (request: FastifyRequest<ExportAuditLogsRequest>, reply: FastifyReply) => {
    try {
      const query: AuditEventQuery = {
        startDate: request.query.startDate,
        endDate: request.query.endDate,
        limit: 10000 // Large limit for exports
      };

      const result = await auditService.queryEvents(query);
      const format = request.query.format || 'json';

      // Log export operation
      if (request.audit) {
        await request.audit.log({
          eventType: AuditEventType.DATA_EXPORTED,
          category: AuditCategory.COMPLIANCE,
          severity: AuditSeverity.MEDIUM,
          resourceType: 'audit_log',
          action: 'export',
          description: `Audit logs exported in ${format} format`,
          outcome: 'success',
          metadata: {
            format,
            eventCount: result.events.length,
            includeMetadata: request.query.includeMetadata,
            includeIntegrityData: request.query.includeIntegrityData
  }
          complianceStandards: [ComplianceStandard.SOC2, ComplianceStandard.GDPR]
        });
      }

      // Set appropriate content type and filename
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `audit-logs-${timestamp}.${format}`;
      
      switch (format) {
      case 'csv':
        reply.header('Content-Type', 'text/csv');
        reply.header('Content-Disposition', `attachment; filename="${filename}"`);
        reply.send(await this.exportAsCSV(result.events, request.query));
        break;
          
      case 'xml':
        reply.header('Content-Type', 'application/xml');
        reply.header('Content-Disposition', `attachment; filename="${filename}"`);
        reply.send(await this.exportAsXML(result.events, request.query));
        break;
          
      case 'pdf':
        reply.header('Content-Type', 'application/pdf');
        reply.header('Content-Disposition', `attachment; filename="${filename}"`);
        reply.send(await this.exportAsPDF(result.events, request.query));
        break;
          
      default: // json
        reply.header('Content-Type', 'application/json');
        reply.header('Content-Disposition', `attachment; filename="${filename}"`);
        reply.send({
          exportInfo: {
            generatedAt: new Date().toISOString(),
            format: 'json',
            eventCount: result.events.length,
            query: request.query
  }
          events: result.events,
          summary: result.summary
        });
      }
    } catch (error: unknown) {
      reply.code(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  });

  // Get audit trail for specific resource
  fastify.get<GetAuditTrailRequest>('/audit/trail/:resourceType/:resourceId', {
    schema: {
      description: 'Get audit trail for a specific resource',
      tags: ['Audit'],
      params: {
        type: 'object',
        properties: {
          resourceType: { type: 'string' },
          resourceId: { type: 'string' }
  }
        required: ['resourceType', 'resourceId']
  }
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', minimum: 1, maximum: 1000, default: 100 },
          page: { type: 'number', minimum: 1, default: 1 }
        }
  }
      security: [{ bearerAuth: [] }]
    }
  }, async (request: FastifyRequest<GetAuditTrailRequest>, reply: FastifyReply) => {
    try {
      const { resourceType, resourceId } = request.params;
      
      const query: AuditEventQuery = {
        resourceTypes: [resourceType],
        resourceIds: [resourceId],
        limit: request.query.limit,
        page: request.query.page,
        sortBy: 'timestamp',
        sortOrder: 'desc'
      };

      const result = await auditService.queryEvents(query);

      reply.send({
        success: true,
        data: {
          resourceType,
          resourceId,
          events: result.events,
          pagination: result.pagination,
          summary: {
            totalEvents: result.pagination.total,
            timeRange: result.summary.timeRange,
            uniqueActors: result.summary.uniqueActors
          }
        }
      });
    } catch (error: unknown) {
      reply.code(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  });

  // Get audit event types and metadata
  fastify.get('/audit/metadata', {
    schema: {
      description: 'Get audit system metadata (event types, categories, etc.)',
      tags: ['Audit']
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    reply.send({
      success: true,
      data: {
        eventTypes: Object.values(AuditEventType),
        categories: Object.values(AuditCategory),
        severities: Object.values(AuditSeverity),
        complianceStandards: Object.values(ComplianceStandard),
        supportedExportFormats: ['json', 'csv', 'xml', 'pdf'],
        supportedReportTypes: ['access_report', 'change_report', 'security_report', 'retention_report']
      }
    });
  });

  // Health check for audit system
  fastify.get('/audit/health', {
    schema: {
      description: 'Check audit system health',
      tags: ['Audit']
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Check basic functionality
      const stats = await auditService.getStatistics();
      
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        statistics: {
          totalEvents: stats.totalEvents,
          eventsToday: stats.eventsToday,
          uniqueUsers: stats.uniqueUsers
  }
        services: {
          database: 'connected',
          eventProcessing: 'active',
          compliance: 'enabled'
        }
      };

      reply.send({
        success: true,
        data: health
      });
    } catch (error: unknown) {
      reply.code(503).send({
        success: false,
        error: 'Audit system unhealthy',
        details: error.message
      });
    }
  });

  // Helper methods for export functionality (would be implemented)
  async function exportAsCSV(events: AuditEvent[], options: Record<string, unknown>): Promise<string> {

    // CSV export implementation
    return 'CSV export not yet implemented';
  }

  async function exportAsXML(events: AuditEvent[], options: Record<string, unknown>): Promise<string> {

    // XML export implementation
    return 'XML export not yet implemented';
  }

  async function exportAsPDF(events: AuditEvent[], options: Record<string, unknown>): Promise<Buffer> {

    // PDF export implementation
    return Buffer.from('PDF export not yet implemented');
  }
}