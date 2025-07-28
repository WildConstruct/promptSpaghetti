// Anomaly Detection API Routes
// REST API for anomaly detection management and monitoring

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AnomalyDetectionService } from '../services/AnomalyDetectionService';

}
interface AnomalyFilters {
  severity?: 'low' | 'medium' | 'high' | 'critical';
  resolved?: boolean;
  patternId?: string;
  limit?: number;
  offset?: number;
}
}

}
interface ResolveAnomalyRequest {
  resolvedBy: string;
  falsePositive?: boolean;
  notes?: string;
}
}

}
interface UpdatePatternRequest {
  enabled?: boolean;
  threshold?: number;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}
}

export async function anomalyDetectionRoutes(
  fastify: FastifyInstance,
  anomalyService: AnomalyDetectionService
) {
  // Get all anomaly events with filtering
  fastify.get<{
    Querystring: AnomalyFilters;
  }>('/anomalies', {
    preHandler: [fastify.jwtAuth, async (request: FastifyRequest, reply: FastifyReply) => {
      // Require security or admin role
      const user = request.user as any;
      if (!user?.roles?.some((role: string) => ['admin', 'security', 'ops'].includes(role))) {
        reply.code(403).send({ error: 'Security role required' });
        return;
      }
    }]
  }, async (request: FastifyRequest<{
    Querystring: AnomalyFilters;
  }>, reply: FastifyReply) => {
    try {
      const filters = request.query;
      const anomalies = await anomalyService.getAnomalyEvents(filters);

      return {
        anomalies,
        count: anomalies.length,
        filters: filters,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      request.log.error('Failed to get anomalies:', error);
      reply.code(500).send({
        error: 'Failed to retrieve anomalies',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get specific anomaly by ID
  fastify.get<{
    Params: { id: string };
  }>('/anomalies/:id', {
    preHandler: [fastify.jwtAuth, async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user as any;
      if (!user?.roles?.some((role: string) => ['admin', 'security', 'ops'].includes(role))) {
        reply.code(403).send({ error: 'Security role required' });
        return;
      }
    }]
  }, async (request: FastifyRequest<{
    Params: { id: string };
  }>, reply: FastifyReply) => {
    try {
      const { id } = request.params;
      const anomalies = await anomalyService.getAnomalyEvents({ limit: 1 });
      const anomaly = anomalies.find(a => a.id === id);

      if (!anomaly) {
        reply.code(404).send({ error: 'Anomaly not found' });
        return;
      }

      return {
        anomaly,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      request.log.error('Failed to get anomaly:', error);
      reply.code(500).send({
        error: 'Failed to retrieve anomaly',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Resolve an anomaly
  fastify.post<{
    Params: { id: string };
    Body: ResolveAnomalyRequest;
  }>('/anomalies/:id/resolve', {
    preHandler: [fastify.jwtAuth, async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user as any;
      if (!user?.roles?.some((role: string) => ['admin', 'security'].includes(role))) {
        reply.code(403).send({ error: 'Admin or security role required' });
        return;
      }
    }]
  }, async (request: FastifyRequest<{
    Params: { id: string };
    Body: ResolveAnomalyRequest;
  }>, reply: FastifyReply) => {
    try {
      const { id } = request.params;
      const { resolvedBy, falsePositive = false } = request.body;

      if (!resolvedBy) {
        reply.code(400).send({ error: 'resolvedBy is required' });
        return;
      }

      await anomalyService.resolveAnomaly(id, resolvedBy, falsePositive);

      return {
        success: true,
        message: `Anomaly ${id} resolved successfully`,
        resolvedBy,
        falsePositive,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      request.log.error('Failed to resolve anomaly:', error);
      reply.code(500).send({
        error: 'Failed to resolve anomaly',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get anomaly detection statistics
  fastify.get('/anomalies/statistics', {
    preHandler: [fastify.jwtAuth, async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user as any;
      if (!user?.roles?.some((role: string) => ['admin', 'security', 'ops'].includes(role))) {
        reply.code(403).send({ error: 'Security role required' });
        return;
      }
    }]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const statistics = await anomalyService.getAnomalyStatistics();

      return {
        statistics,
        timestamp: new Date().toISOString(),
        description: 'Anomaly detection system statistics'
      };
    } catch (error) {
      request.log.error('Failed to get anomaly statistics:', error);
      reply.code(500).send({
        error: 'Failed to retrieve statistics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get all anomaly patterns
  fastify.get('/anomalies/patterns', {
    preHandler: [fastify.jwtAuth, async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user as any;
      if (!user?.roles?.some((role: string) => ['admin', 'security'].includes(role))) {
        reply.code(403).send({ error: 'Admin or security role required' });
        return;
      }
    }]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const patterns = await (anomalyService as any).getEnabledPatterns();

      return {
        patterns,
        count: patterns.length,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      request.log.error('Failed to get patterns:', error);
      reply.code(500).send({
        error: 'Failed to retrieve patterns',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Update anomaly pattern
  fastify.patch<{
    Params: { patternId: string };
    Body: UpdatePatternRequest;
  }>('/anomalies/patterns/:patternId', {
    preHandler: [fastify.jwtAuth, async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user as any;
      if (!user?.roles?.includes('admin')) {
        reply.code(403).send({ error: 'Admin role required' });
        return;
      }
    }]
  }, async (request: FastifyRequest<{
    Params: { patternId: string };
    Body: UpdatePatternRequest;
  }>, reply: FastifyReply) => {
    try {
      const { patternId } = request.params;
      const updates = request.body;

      // Build update query
      const updateFields = [];
      const params = [patternId];
      let paramIndex = 2;

      if (updates.enabled !== undefined) {
        updateFields.push(`enabled = $${paramIndex}`);
        params.push(updates.enabled);
        paramIndex++;
      }

      if (updates.threshold !== undefined) {
        updateFields.push(`threshold = $${paramIndex}`);
        params.push(updates.threshold);
        paramIndex++;
      }

      if (updates.severity) {
        updateFields.push(`severity = $${paramIndex}`);
        params.push(updates.severity);
        paramIndex++;
      }

      if (updateFields.length === 0) {
        reply.code(400).send({ error: 'No valid update fields provided' });
        return;
      }

      updateFields.push('updated_at = NOW()');

      const sql = `
        UPDATE anomaly_patterns 
        SET ${updateFields.join(', ')}
        WHERE id = $1
        RETURNING *
      `;

      const result = await (anomalyService as any).db.query(sql, params);

      if (result.rows.length === 0) {
        reply.code(404).send({ error: 'Pattern not found' });
        return;
      }

      return {
        success: true,
        pattern: result.rows[0],
        message: `Pattern ${patternId} updated successfully`,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      request.log.error('Failed to update pattern:', error);
      reply.code(500).send({
        error: 'Failed to update pattern',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Force anomaly check (manual trigger)
  fastify.post('/anomalies/check', {
    preHandler: [fastify.jwtAuth, async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user as any;
      if (!user?.roles?.some((role: string) => ['admin', 'security'].includes(role))) {
        reply.code(403).send({ error: 'Admin or security role required' });
        return;
      }
    }]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Trigger manual anomaly check
      await (anomalyService as any).performAnomalyCheck();

      return {
        success: true,
        message: 'Manual anomaly check completed',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      request.log.error('Failed to perform manual check:', error);
      reply.code(500).send({
        error: 'Failed to perform anomaly check',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get recent anomaly detection events (for dashboard)
  fastify.get('/anomalies/recent', {
    preHandler: [fastify.jwtAuth, async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user as any;
      if (!user?.roles?.some((role: string) => ['admin', 'security', 'ops'].includes(role))) {
        reply.code(403).send({ error: 'Security role required' });
        return;
      }
    }]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Get recent anomalies (last 24 hours)
      const recentAnomalies = await anomalyService.getAnomalyEvents({
        limit: 50,
        resolved: false
      });

      // Get statistics
      const stats = await anomalyService.getAnomalyStatistics();

      return {
        recentAnomalies,
        statistics: stats,
        summary: {
          totalRecent: recentAnomalies.length,
          critical: recentAnomalies.filter(a => a.severity === 'critical').length,
          high: recentAnomalies.filter(a => a.severity === 'high').length,
          unresolved: recentAnomalies.filter(a => !a.resolved).length
  }
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      request.log.error('Failed to get recent anomalies:', error);
      reply.code(500).send({
        error: 'Failed to retrieve recent anomalies',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Health check for anomaly detection service
  fastify.get('/anomalies/health', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const isRunning = (anomalyService as any).isRunning;
      const stats = await anomalyService.getAnomalyStatistics();

      return {
        status: isRunning ? 'healthy' : 'stopped',
        service: {
          running: isRunning,
          checkInterval: (anomalyService as any).config.checkIntervalSeconds,
          patternsEnabled: (anomalyService as any).config.patterns.filter((p: any) => p.enabled).length
  }
        statistics: {
          totalAnomalies: stats.total_anomalies,
          recentAnomalies: stats.anomalies_24h,
          criticalCount: stats.critical_anomalies
  }
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      request.log.error('Anomaly service health check failed:', error);
      reply.code(503).send({
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Documentation endpoint
  fastify.get('/anomalies/docs', async (request: FastifyRequest, reply: FastifyReply) => {
    return {
      title: 'Anomaly Detection System API Documentation',
      description: 'AI-powered security anomaly detection and automated response system',
      features: [
        'Real-time anomaly pattern detection',
        'Configurable detection patterns and thresholds',
        'Automated security response actions',
        'Comprehensive audit logging',
        'False positive handling',
        'Statistical analysis and reporting',
        'Integration with security monitoring tools'
      ],
      detectionPatterns: [
        {
          name: 'Brute Force Login Detection',
          description: 'Detects multiple failed login attempts from the same IP'
  }
        {
          name: 'Credential Stuffing Detection',
          description: 'Detects login attempts across multiple accounts from same IP'
  }
        {
          name: 'Privilege Escalation Detection',
          description: 'Detects rapid role changes or permission escalations'
  }
        {
          name: 'Data Access Anomalies',
          description: 'Detects unusual data access patterns or bulk retrieval'
  }
        {
          name: 'Geographic Anomalies',
          description: 'Detects login from unusual geographic locations'
        }
      ],
      responseActions: [
        'IP Address Blocking',
        'Account Lockout/Suspension',
        'Two-Factor Authentication Enforcement',
        'Security Team Notifications',
        'Incident Creation and Escalation'
      ],
      endpoints: [
        {
          path: '/anomalies',
          method: 'GET',
          description: 'Get all anomaly events with filtering',
          auth: 'security role required'
  }
        {
          path: '/anomalies/:id',
          method: 'GET',
          description: 'Get specific anomaly by ID',
          auth: 'security role required'
  }
        {
          path: '/anomalies/:id/resolve',
          method: 'POST',
          description: 'Resolve an anomaly (mark as handled)',
          auth: 'admin or security role required'
  }
        {
          path: '/anomalies/statistics',
          method: 'GET',
          description: 'Get anomaly detection statistics',
          auth: 'security role required'
  }
        {
          path: '/anomalies/patterns',
          method: 'GET',
          description: 'Get all detection patterns',
          auth: 'admin or security role required'
  }
        {
          path: '/anomalies/patterns/:id',
          method: 'PATCH',
          description: 'Update detection pattern configuration',
          auth: 'admin role required'
  }
        {
          path: '/anomalies/check',
          method: 'POST',
          description: 'Trigger manual anomaly check',
          auth: 'admin or security role required'
        }
      ],
      integrations: {
        auditSystem: 'Reads from audit_logs table for pattern analysis',
        authSystem: 'Integrates with authentication and authorization',
        notificationSystem: 'Sends alerts via webhooks, email, and Slack',
        incidentManagement: 'Creates security incidents for escalation'
      }
    };
  });
}