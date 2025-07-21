// Epic 17 - Security Audit API Routes
// REST API for security audit management and monitoring

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { SecurityAuditService } from '../services/security-audit-service';
import { handleCSPViolation } from '../middleware/security-headers';

export async function securityAuditRoutes(
  fastify: FastifyInstance,
  auditService: SecurityAuditService
) {
  // Get current security audit status
  fastify.get('/security/audit/status', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const statistics = auditService.getAuditStatistics();
      const latestResults = auditService.getLatestAuditResults();

      return {
        status: 'running',
        statistics,
        latestResults: Object.entries(latestResults).map(([endpoint, record]) => ({
          endpoint,
          timestamp: record.timestamp,
          score: record.result.score,
          maxScore: record.result.maxScore,
          passed: record.result.passed,
          alertCount: record.alerts.length,
          summary: record.result.summary
        })),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      request.log.error('Failed to get audit status:', error);
      reply.code(500).send({
        error: 'Failed to retrieve audit status',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get audit history
  fastify.get<{
    Querystring: { limit?: string; endpoint?: string };
  }>('/security/audit/history', async (request: FastifyRequest<{
    Querystring: { limit?: string; endpoint?: string };
  }>, reply: FastifyReply) => {
    try {
      const limit = request.query.limit ? parseInt(request.query.limit) : 50;
      const endpoint = request.query.endpoint;
      
      let history = auditService.getAuditHistory(limit);
      
      // Filter by endpoint if specified
      if (endpoint) {
        history = history.filter(record => record.endpoint === endpoint);
      }

      return {
        history: history.map(record => ({
          id: record.id,
          timestamp: record.timestamp,
          endpoint: record.endpoint,
          score: record.result.score,
          maxScore: record.result.maxScore,
          passed: record.result.passed,
          alerts: record.alerts,
          summary: record.result.summary,
          headers: record.result.headers.map(h => ({
            name: h.name,
            present: h.present,
            severity: h.severity,
            recommendation: h.recommendation
          }))
        })),
        totalRecords: history.length
      };
    } catch (error) {
      request.log.error('Failed to get audit history:', error);
      reply.code(500).send({
        error: 'Failed to retrieve audit history',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Trigger manual security audit
  fastify.post<{
    Body: { endpoint?: string };
  }>('/security/audit/trigger', async (request: FastifyRequest<{
    Body: { endpoint?: string };
  }>, reply: FastifyReply) => {
    try {
      const { endpoint } = request.body || {};
      
      const results = await auditService.triggerManualAudit(endpoint);
      
      return {
        message: 'Manual audit completed',
        results: results.map(record => ({
          id: record.id,
          timestamp: record.timestamp,
          endpoint: record.endpoint,
          score: record.result.score,
          maxScore: record.result.maxScore,
          passed: record.result.passed,
          alerts: record.alerts,
          summary: record.result.summary
        }))
      };
    } catch (error) {
      request.log.error('Failed to trigger manual audit:', error);
      reply.code(500).send({
        error: 'Failed to trigger manual audit',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get detailed audit report for specific endpoint
  fastify.get<{
    Params: { endpoint: string };
  }>('/security/audit/report/:endpoint', async (request: FastifyRequest<{
    Params: { endpoint: string };
  }>, reply: FastifyReply) => {
    try {
      const { endpoint } = request.params;
      const decodedEndpoint = decodeURIComponent(endpoint);
      
      const latestResults = auditService.getLatestAuditResults();
      const record = latestResults[decodedEndpoint];
      
      if (!record) {
        reply.code(404).send({
          error: 'Audit report not found',
          message: `No audit data available for endpoint: ${decodedEndpoint}`
        });
        return;
      }

      return {
        endpoint: decodedEndpoint,
        lastAudit: record.timestamp,
        score: record.result.score,
        maxScore: record.result.maxScore,
        passed: record.result.passed,
        scorePercentage: ((record.result.score / record.result.maxScore) * 100).toFixed(1),
        alerts: record.alerts,
        summary: record.result.summary,
        headers: record.result.headers.map(h => ({
          name: h.name,
          present: h.present,
          value: h.value,
          severity: h.severity,
          recommendation: h.recommendation
        })),
        recommendations: record.result.headers
          .filter(h => !h.present && h.recommendation)
          .map(h => ({
            header: h.name,
            severity: h.severity,
            recommendation: h.recommendation
          }))
      };
    } catch (error) {
      request.log.error('Failed to get audit report:', error);
      reply.code(500).send({
        error: 'Failed to retrieve audit report',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get security audit dashboard data
  fastify.get('/security/audit/dashboard', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const statistics = auditService.getAuditStatistics();
      const latestResults = auditService.getLatestAuditResults();
      const recentHistory = auditService.getAuditHistory(20);

      // Calculate trends
      const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recent = recentHistory.filter(r => r.timestamp > last24h);
      const averageScoreLast24h = recent.length > 0 
        ? recent.reduce((sum, r) => sum + r.result.score, 0) / recent.length 
        : 0;

      // Security score trend (last 10 audits)
      const scoreHistory = recentHistory
        .slice(0, 10)
        .reverse()
        .map(record => ({
          timestamp: record.timestamp,
          score: record.result.score,
          maxScore: record.result.maxScore,
          percentage: ((record.result.score / record.result.maxScore) * 100).toFixed(1)
        }));

      // Alert summary
      const alertsByType = recentHistory.reduce((acc, record) => {
        record.alerts.forEach(alert => {
          if (alert.includes('CRITICAL')) acc.critical++;
          else if (alert.includes('HIGH')) acc.high++;
          else if (alert.includes('Missing')) acc.missing++;
          else acc.other++;
        });
        return acc;
      }, { critical: 0, high: 0, missing: 0, other: 0 });

      return {
        overview: {
          totalAudits: statistics.totalAudits,
          averageScore: statistics.averageScore.toFixed(1),
          passRate: statistics.passRate.toFixed(1),
          alertsLast24h: statistics.alertsLast24h,
          averageScoreLast24h: averageScoreLast24h.toFixed(1)
        },
        endpoints: Object.entries(statistics.endpoints).map(([endpoint, data]) => ({
          endpoint,
          lastAudit: data.lastAudit,
          score: data.score,
          passed: data.passed,
          alertCount: data.alertCount,
          status: data.passed ? 'healthy' : 'needs_attention'
        })),
        trends: {
          scoreHistory,
          alertsByType
        },
        recentAlerts: recentHistory
          .filter(r => r.alerts.length > 0)
          .slice(0, 10)
          .map(r => ({
            timestamp: r.timestamp,
            endpoint: r.endpoint,
            alerts: r.alerts.slice(0, 3), // Show top 3 alerts
            severity: r.alerts.some(a => a.includes('CRITICAL')) ? 'critical' :
              r.alerts.some(a => a.includes('HIGH')) ? 'high' : 'medium'
          }))
      };
    } catch (error) {
      request.log.error('Failed to get dashboard data:', error);
      reply.code(500).send({
        error: 'Failed to retrieve dashboard data',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // CSP violation reporting endpoint
  fastify.post('/security/csp-report', {
    schema: {
      body: {
        type: 'object',
        properties: {
          'csp-report': {
            type: 'object',
            properties: {
              'document-uri': { type: 'string' },
              'violated-directive': { type: 'string' },
              'blocked-uri': { type: 'string' },
              'source-file': { type: 'string' },
              'line-number': { type: 'number' },
              'column-number': { type: 'number' }
            },
            required: ['document-uri', 'violated-directive']
          }
        },
        required: ['csp-report']
      }
    }
  }, handleCSPViolation);

  // Security headers documentation endpoint
  fastify.get('/security/audit/docs', async (request: FastifyRequest, reply: FastifyReply) => {
    return {
      title: 'Security Headers Audit Documentation',
      description: 'Information about security headers and their importance',
      headers: [
        {
          name: 'Content-Security-Policy',
          description: 'Prevents XSS attacks by controlling resource loading',
          severity: 'high',
          moreInfo: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP'
        },
        {
          name: 'X-Frame-Options',
          description: 'Prevents clickjacking attacks',
          severity: 'medium',
          moreInfo: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options'
        },
        {
          name: 'X-Content-Type-Options',
          description: 'Prevents MIME type sniffing attacks',
          severity: 'medium',
          moreInfo: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options'
        },
        {
          name: 'Strict-Transport-Security',
          description: 'Enforces HTTPS connections',
          severity: 'high',
          moreInfo: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security'
        },
        {
          name: 'Referrer-Policy',
          description: 'Controls referrer information disclosure',
          severity: 'low',
          moreInfo: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy'
        },
        {
          name: 'Permissions-Policy',
          description: 'Controls browser feature access',
          severity: 'medium',
          moreInfo: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Feature-Policy'
        }
      ],
      auditCriteria: {
        scoreCalculation: 'Each header has a point value based on security importance',
        passingThreshold: '70% of maximum possible score',
        severityLevels: {
          critical: 'Immediate security risk',
          high: 'Significant security concern',
          medium: 'Moderate security improvement',
          low: 'Minor security enhancement'
        }
      }
    };
  });
}