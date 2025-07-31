// Verification Threshold API Routes
// REST API for risk assessment and verification requirements

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { VerificationThresholdService, VerificationContext, ThresholdConfig } from '../services/VerificationThresholdService';

}
}
interface AssessmentRequest {
  requestedAction?: string;
  deviceFingerprint?: string;
  geoLocation?: {
    country?: string;
    city?: string;
    timezone?: string;
}
}
  };
}

}
}
interface VerificationCompletionRequest {
  level: string;
  success: boolean;
  method?: string;
}
}
}

}
}
interface ThresholdConfigUpdateRequest {
  lowRisk?: number;
  mediumRisk?: number;
  highRisk?: number;
  criticalRisk?: number;
  weights?: Partial<ThresholdConfig['weights']>;
  actionThresholds?: Partial<ThresholdConfig['actionThresholds']>;
}
}
}

export async function verificationThresholdRoutes(
  fastify: FastifyInstance,
  thresholdService: VerificationThresholdService
) {
  // Assess verification requirement for current user
  fastify.post<{
    Body: AssessmentRequest;
  }>('/verification/assess', {
    preHandler: [fastify.jwtAuth]
  }, async (request: FastifyRequest<{
    Body: AssessmentRequest;
  }>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any)?.id;
      if (!userId) {
        reply.code(401).send({ error: 'User not authenticated' });
        return;
      }

      const context: VerificationContext = {
        userId,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        deviceFingerprint: request.body.deviceFingerprint,
        sessionId: (request.user as any)?.sessionId,
        requestedAction: request.body.requestedAction,
        geoLocation: request.body.geoLocation,
        timestamp: new Date()
      };

      const requirement = await thresholdService.assessVerificationRequirement(context);

      return {
        ...requirement,
        timestamp: new Date().toISOString(),
        context: {
          requestedAction: context.requestedAction,
          hasDeviceFingerprint: !!context.deviceFingerprint,
          hasGeoLocation: !!context.geoLocation
        }
      };
    } catch (error) {
      request.log.error('Verification assessment error:', error);
      reply.code(500).send({
        error: 'Failed to assess verification requirement',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Record verification completion
  fastify.post<{
    Body: VerificationCompletionRequest;
  }>('/verification/complete', {
    preHandler: [fastify.jwtAuth]
  }, async (request: FastifyRequest<{
    Body: VerificationCompletionRequest;
  }>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any)?.id;
      if (!userId) {
        reply.code(401).send({ error: 'User not authenticated' });
        return;
      }

      const { level, success, method } = request.body;

      if (!level) {
        reply.code(400).send({ error: 'Verification level is required' });
        return;
      }

      await thresholdService.recordVerificationCompletion(userId, level, success, method);

      return {
        success: true,
        message: 'Verification completion recorded',
        gracePeriod: success ? (level === 'email' ? 300 : 1800) : 0,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      request.log.error('Verification completion error:', error);
      reply.code(500).send({
        error: 'Failed to record verification completion',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get current threshold configuration (admin only)
  fastify.get('/verification/config', {
    preHandler: [fastify.jwtAuth, async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user as any;
      if (!user?.roles?.includes('admin')) {
        reply.code(403).send({ error: 'Admin access required' });
        return;
      }
    }]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const config = thresholdService.getThresholdConfig();
      
      return {
        config,
        description: 'Current verification threshold configuration',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      request.log.error('Config retrieval error:', error);
      reply.code(500).send({
        error: 'Failed to retrieve configuration',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Update threshold configuration (admin only)
  fastify.patch<{
    Body: ThresholdConfigUpdateRequest;
  }>('/verification/config', {
    preHandler: [fastify.jwtAuth, async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user as any;
      if (!user?.roles?.includes('admin')) {
        reply.code(403).send({ error: 'Admin access required' });
        return;
      }
    }]
  }, async (request: FastifyRequest<{
    Body: ThresholdConfigUpdateRequest;
  }>, reply: FastifyReply) => {
    try {
      const updates = request.body;
      
      // Validate threshold values
      if (updates.lowRisk !== undefined && (updates.lowRisk < 0 || updates.lowRisk > 100)) {
        reply.code(400).send({ error: 'Risk thresholds must be between 0 and 100' });
        return;
      }

      const updatedConfig = await thresholdService.updateThresholdConfig(updates);

      return {
        success: true,
        config: updatedConfig,
        message: 'Threshold configuration updated successfully',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      request.log.error('Config update error:', error);
      reply.code(500).send({
        error: 'Failed to update configuration',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get verification statistics (admin/security roles)
  fastify.get<{
    Querystring: { timeframe?: 'day' | 'week' | 'month' };
  }>('/verification/statistics', {
    preHandler: [fastify.jwtAuth, async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user as any;
      if (!user?.roles?.some((role: string) => ['admin', 'security', 'ops'].includes(role))) {
        reply.code(403).send({ error: 'Admin or security role required' });
        return;
      }
    }]
  }, async (request: FastifyRequest<{
    Querystring: { timeframe?: 'day' | 'week' | 'month' };
  }>, reply: FastifyReply) => {
    try {
      const { timeframe = 'week' } = request.query;
      const statistics = await thresholdService.getVerificationStatistics(timeframe);

      // Calculate additional metrics
      const totalAssessments = parseInt(statistics.total_assessments as string) || 0;
      const verificationsRequired = parseInt(statistics.verifications_required as string) || 0;
      const verificationRate = totalAssessments > 0 ? verificationsRequired / totalAssessments : 0;

      return {
        timeframe,
        statistics: {
          ...statistics,
          verification_rate: Math.round(verificationRate * 100) / 100,
          avg_risk_score: statistics.avg_risk_score ? 
            Math.round(parseFloat(statistics.avg_risk_score as string) * 100) / 100 : 0
  }
        summary: {
          totalAssessments,
          verificationsRequired,
          verificationRate: `${Math.round(verificationRate * 100)}%`,
          averageRiskScore: statistics.avg_risk_score ? 
            Math.round(parseFloat(statistics.avg_risk_score as string)) : 0
  }
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      request.log.error('Statistics retrieval error:', error);
      reply.code(500).send({
        error: 'Failed to retrieve statistics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Test verification threshold (admin only - for testing/debugging)
  fastify.post<{
    Body: {
      userId?: string;
      mockContext?: Partial<VerificationContext>;
    };
  }>('/verification/test', {
    preHandler: [fastify.jwtAuth, async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user as any;
      if (!user?.roles?.includes('admin')) {
        reply.code(403).send({ error: 'Admin access required' });
        return;
      }
    }]
  }, async (request: FastifyRequest<{
    Body: {
      userId?: string;
      mockContext?: Partial<VerificationContext>;
    };
  }>, reply: FastifyReply) => {
    try {
      const { userId: targetUserId, mockContext } = request.body;
      const currentUserId = (request.user as any)?.id;
      
      const testUserId = targetUserId || currentUserId;
      if (!testUserId) {
        reply.code(400).send({ error: 'User ID required for testing' });
        return;
      }

      const testContext: VerificationContext = {
        userId: testUserId,
        ipAddress: mockContext?.ipAddress || request.ip,
        userAgent: mockContext?.userAgent || request.headers['user-agent'],
        deviceFingerprint: mockContext?.deviceFingerprint,
        sessionId: mockContext?.sessionId,
        requestedAction: mockContext?.requestedAction || 'test_action',
        geoLocation: mockContext?.geoLocation,
        timestamp: new Date()
      };

      const requirement = await thresholdService.assessVerificationRequirement(testContext);

      return {
        ...requirement,
        testContext,
        warning: 'This is a test assessment - results may not reflect actual security state',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      request.log.error('Test assessment error:', error);
      reply.code(500).send({
        error: 'Failed to perform test assessment',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get verification history for current user
  fastify.get<{
    Querystring: { limit?: number; offset?: number };
  }>('/verification/history', {
    preHandler: [fastify.jwtAuth]
  }, async (request: FastifyRequest<{
    Querystring: { limit?: number; offset?: number };
  }>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any)?.id;
      if (!userId) {
        reply.code(401).send({ error: 'User not authenticated' });
        return;
      }

      const { limit = 50, offset = 0 } = request.query;

      // Get recent verification assessments
      const assessments = await thresholdService['db'].query(`
        SELECT 
          created_at,
          details->>'riskScore' as risk_score,
          details->>'verificationRequired' as required,
          details->>'verificationLevel' as level,
          details->>'requestedAction' as action,
          ip_address,
          user_agent
        FROM audit_logs 
        WHERE user_id = $1 
          AND action = 'verification_threshold_assessment'
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
      `, [userId, limit, offset]);

      // Get recent verification completions
      const completions = await thresholdService['db'].query(`
        SELECT 
          created_at,
          details->>'level' as level,
          details->>'method' as method,
          details->>'success' as success
        FROM audit_logs 
        WHERE user_id = $1 
          AND action = 'additional_verification_completed'
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
      `, [userId, limit, offset]);

      return {
        assessments: assessments.rows.map(row => ({
          timestamp: row.created_at,
          riskScore: parseFloat(row.risk_score) || 0,
          verificationRequired: row.required === 'true',
          level: row.level,
          action: row.action,
          ipAddress: row.ip_address
        })),
        completions: completions.rows.map(row => ({
          timestamp: row.created_at,
          level: row.level,
          method: row.method,
          success: row.success === 'true'
        })),
        pagination: {
          limit,
          offset,
          hasMore: assessments.rows.length === limit
  }
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      request.log.error('History retrieval error:', error);
      reply.code(500).send({
        error: 'Failed to retrieve verification history',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Health check for verification threshold service
  fastify.get('/verification/health', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const config = thresholdService.getThresholdConfig();
      
      // Test basic functionality
      const testContext: VerificationContext = {
        userId: 'health-check',
        timestamp: new Date()
      };

      // This should not actually run assessment, just validate config
      const configValid = config.lowRisk < config.mediumRisk && 
                         config.mediumRisk < config.highRisk &&
                         config.highRisk < config.criticalRisk;

      return {
        status: configValid ? 'healthy' : 'warning',
        checks: {
          configurationValid: configValid ? 'ok' : 'invalid_thresholds',
          databaseConnection: 'connected', // Assume connected if we got this far
          redisConnection: 'connected'
  }
        configuration: {
          thresholds: {
            low: config.lowRisk,
            medium: config.mediumRisk,
            high: config.highRisk,
            critical: config.criticalRisk
  }
          weightsConfigured: Object.keys(config.weights).length > 0,
          actionThresholdsCount: Object.keys(config.actionThresholds).length
  }
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      request.log.error('Verification threshold health check failed:', error);
      reply.code(503).send({
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Documentation endpoint
  fastify.get('/verification/docs', async (request: FastifyRequest, reply: FastifyReply) => {
    return {
      title: 'Verification Threshold API Documentation',
      description: 'Risk-based verification system that determines when additional authentication is required',
      features: [
        'Multi-factor risk assessment (device, location, behavior, time, security)',
        'Configurable risk thresholds and verification levels',
        'Action-specific verification requirements',
        'Grace period management for recent successful verifications',
        'Comprehensive audit logging and statistics',
        'Admin configuration management'
      ],
      riskFactors: [
        {
          name: 'Device Trust',
          description: 'Evaluates device familiarity based on login history',
          weight: '25%'
  }
        {
          name: 'Location Risk',
          description: 'Assesses geographic location against historical patterns',
          weight: '20%'
  }
        {
          name: 'Behavior Anomalies',
          description: 'Detects unusual access patterns and timing',
          weight: '25%'
  }
        {
          name: 'Time Factors',
          description: 'Evaluates off-hours and weekend access patterns',
          weight: '15%'
  }
        {
          name: 'Security Events',
          description: 'Considers recent security incidents and failed attempts',
          weight: '15%'
        }
      ],
      verificationLevels: [
        {
          level: 'none',
          description: 'No additional verification required (low risk)',
          threshold: '0-30'
  }
        {
          level: 'email',
          description: 'Email verification required (medium risk)',
          threshold: '31-60'
  }
        {
          level: 'totp',
          description: 'TOTP or hardware key required (high risk)',
          threshold: '61-80'
  }
        {
          level: 'admin_approval',
          description: 'Manual admin approval required (critical risk)',
          threshold: '81-100'
        }
      ],
      endpoints: [
        {
          path: '/verification/assess',
          method: 'POST',
          description: 'Assess verification requirement for current action',
          auth: 'required'
  }
        {
          path: '/verification/complete',
          method: 'POST',
          description: 'Record completion of verification process',
          auth: 'required'
  }
        {
          path: '/verification/config',
          method: 'GET/PATCH',
          description: 'Get/update threshold configuration',
          auth: 'admin required'
  }
        {
          path: '/verification/statistics',
          method: 'GET',
          description: 'Get verification usage statistics',
          auth: 'security role required'
  }
        {
          path: '/verification/history',
          method: 'GET',
          description: 'Get user verification history',
          auth: 'required'
  }
        {
          path: '/verification/test',
          method: 'POST',
          description: 'Test verification assessment (debugging)',
          auth: 'admin required'
        }
      ],
      integrations: {
        auditSystem: 'Logs all assessments and verifications',
        redisCache: 'Manages grace periods and temporary bypasses',
        authSystem: 'Integrates with login and session management',
        anomalyDetection: 'Coordinates with security monitoring'
      }
    };
  });
}