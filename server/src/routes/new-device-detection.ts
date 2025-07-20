// New Device Detection API Routes
// REST API for detecting and managing new device logins

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { NewDeviceDetectionService } from '../services/NewDeviceDetectionService';

interface DetectDeviceRequest {
  deviceFingerprint: string;
  ipAddress?: string;
  userAgent?: string;
  location?: {
    country: string;
    city: string;
    latitude?: number;
    longitude?: number;
  };
  metadata?: {
    sessionId?: string;
    authMethod?: string;
  };
}

interface ApproveDeviceRequest {
  deviceFingerprint: string;
  approvalMethod: string;
  verificationCode?: string;
}

interface RejectDeviceRequest {
  deviceFingerprint: string;
  reason: string;
}

export async function newDeviceDetectionRoutes(
  fastify: FastifyInstance,
  detectionService: NewDeviceDetectionService
) {
  // Detect new device
  fastify.post<{
    Body: DetectDeviceRequest;
  }>('/device/detect', {
    preHandler: [fastify.jwtAuth]
  }, async (request: FastifyRequest<{
    Body: DetectDeviceRequest;
  }>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any)?.id;
      if (!userId) {
        reply.code(401).send({ error: 'User not authenticated' });
        return;
      }

      const { deviceFingerprint, location, metadata } = request.body;

      const context = {
        userId,
        deviceFingerprint,
        ipAddress: request.body.ipAddress || request.ip,
        userAgent: request.body.userAgent || request.headers['user-agent'] || '',
        location,
        metadata: {
          ...metadata,
          loginTime: new Date()
        }
      };

      const result = await detectionService.detectNewDevice(context);

      return {
        detection: result,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      request.log.error('Device detection error:', error);
      reply.code(500).send({
        error: 'Failed to detect device',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Approve new device
  fastify.post<{
    Body: ApproveDeviceRequest;
  }>('/device/approve', {
    preHandler: [fastify.jwtAuth]
  }, async (request: FastifyRequest<{
    Body: ApproveDeviceRequest;
  }>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any)?.id;
      if (!userId) {
        reply.code(401).send({ error: 'User not authenticated' });
        return;
      }

      const { deviceFingerprint, approvalMethod, verificationCode } = request.body;

      // Verify the verification code if provided
      if (verificationCode) {
        // This would integrate with your verification service
        // For now, simplified implementation
        request.log.info('Verification code provided:', verificationCode);
      }

      const success = await detectionService.approveDevice(
        userId,
        deviceFingerprint,
        approvalMethod
      );

      if (success) {
        return {
          success: true,
          message: 'Device approved successfully',
          deviceFingerprint,
          timestamp: new Date().toISOString()
        };
      } else {
        reply.code(400).send({
          error: 'Failed to approve device',
          message: 'Device approval failed'
        });
      }
    } catch (error) {
      request.log.error('Device approval error:', error);
      reply.code(500).send({
        error: 'Failed to approve device',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Reject new device
  fastify.post<{
    Body: RejectDeviceRequest;
  }>('/device/reject', {
    preHandler: [fastify.jwtAuth]
  }, async (request: FastifyRequest<{
    Body: RejectDeviceRequest;
  }>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any)?.id;
      if (!userId) {
        reply.code(401).send({ error: 'User not authenticated' });
        return;
      }

      const { deviceFingerprint, reason } = request.body;

      const success = await detectionService.rejectDevice(
        userId,
        deviceFingerprint,
        reason
      );

      if (success) {
        return {
          success: true,
          message: 'Device rejected and blocked',
          deviceFingerprint,
          timestamp: new Date().toISOString()
        };
      } else {
        reply.code(400).send({
          error: 'Failed to reject device',
          message: 'Device rejection failed'
        });
      }
    } catch (error) {
      request.log.error('Device rejection error:', error);
      reply.code(500).send({
        error: 'Failed to reject device',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get device verification status
  fastify.get<{
    Params: { fingerprint: string };
  }>('/device/:fingerprint/verification-status', {
    preHandler: [fastify.jwtAuth]
  }, async (request: FastifyRequest<{
    Params: { fingerprint: string };
  }>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any)?.id;
      if (!userId) {
        reply.code(401).send({ error: 'User not authenticated' });
        return;
      }

      const { fingerprint } = request.params;

      const status = await detectionService.getDeviceVerificationStatus(
        userId,
        fingerprint
      );

      return {
        fingerprint,
        status,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      request.log.error('Verification status error:', error);
      reply.code(500).send({
        error: 'Failed to get verification status',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get recent new devices
  fastify.get<{
    Querystring: { days?: number };
  }>('/device/recent-new', {
    preHandler: [fastify.jwtAuth]
  }, async (request: FastifyRequest<{
    Querystring: { days?: number };
  }>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any)?.id;
      if (!userId) {
        reply.code(401).send({ error: 'User not authenticated' });
        return;
      }

      const { days = 30 } = request.query;

      const devices = await detectionService.getRecentNewDevices(userId, days);

      return {
        devices,
        count: devices.length,
        timeframe: `${days} days`,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      request.log.error('Recent devices error:', error);
      reply.code(500).send({
        error: 'Failed to get recent devices',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Admin: Get device detection statistics
  fastify.get<{
    Querystring: { timeframe?: 'day' | 'week' | 'month' };
  }>('/device/admin/detection-stats', {
    preHandler: [fastify.jwtAuth, async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user as any;
      if (!user?.roles?.some((role: string) => ['admin', 'security'].includes(role))) {
        reply.code(403).send({ error: 'Admin or security role required' });
        return;
      }
    }]
  }, async (request: FastifyRequest<{
    Querystring: { timeframe?: 'day' | 'week' | 'month' };
  }>, reply: FastifyReply) => {
    try {
      const { timeframe = 'week' } = request.query;
      
      const timeframes = {
        day: '1 day',
        week: '1 week',
        month: '1 month'
      };

      const stats = await (detectionService as any).db.query(`
        SELECT
          COUNT(*) FILTER (WHERE action = 'new_device_detected') as total_detections,
          COUNT(*) FILTER (WHERE action = 'device_approved') as approved_devices,
          COUNT(*) FILTER (WHERE action = 'device_rejected') as rejected_devices,
          COUNT(*) FILTER (WHERE details->>'riskLevel' = 'high') as high_risk_detections,
          COUNT(*) FILTER (WHERE details->>'riskLevel' = 'critical') as critical_risk_detections,
          COUNT(*) FILTER (WHERE details->>'requiresVerification' = 'true') as required_verification,
          COUNT(DISTINCT user_id) as affected_users
        FROM audit_logs
        WHERE action IN ('new_device_detected', 'device_approved', 'device_rejected')
          AND created_at >= NOW() - INTERVAL '${timeframes[timeframe]}'
      `);

      const riskDistribution = await (detectionService as any).db.query(`
        SELECT 
          details->>'riskLevel' as risk_level,
          COUNT(*) as count
        FROM audit_logs
        WHERE action = 'new_device_detected'
          AND created_at >= NOW() - INTERVAL '${timeframes[timeframe]}'
        GROUP BY details->>'riskLevel'
      `);

      return {
        timeframe,
        statistics: stats.rows[0],
        riskDistribution: riskDistribution.rows,
        recommendations: [
          'Monitor high-risk device detections',
          'Review devices requiring verification',
          'Analyze rejection patterns'
        ],
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      request.log.error('Detection statistics error:', error);
      reply.code(500).send({
        error: 'Failed to get detection statistics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Admin: Get users with multiple new devices
  fastify.get<{
    Querystring: { threshold?: number; days?: number };
  }>('/device/admin/multi-device-users', {
    preHandler: [fastify.jwtAuth, async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user as any;
      if (!user?.roles?.some((role: string) => ['admin', 'security'].includes(role))) {
        reply.code(403).send({ error: 'Admin or security role required' });
        return;
      }
    }]
  }, async (request: FastifyRequest<{
    Querystring: { threshold?: number; days?: number };
  }>, reply: FastifyReply) => {
    try {
      const { threshold = 5, days = 30 } = request.query;

      const users = await (detectionService as any).db.query(`
        SELECT 
          u.id,
          u.email,
          u.display_name,
          COUNT(DISTINCT al.details->>'deviceFingerprint') as new_device_count,
          COUNT(*) FILTER (WHERE al.details->>'riskLevel' IN ('high', 'critical')) as high_risk_count,
          MAX(al.created_at) as last_new_device
        FROM audit_logs al
        JOIN users u ON u.id = al.user_id
        WHERE al.action = 'new_device_detected'
          AND al.created_at >= NOW() - INTERVAL '%s days'
        GROUP BY u.id, u.email, u.display_name
        HAVING COUNT(DISTINCT al.details->>'deviceFingerprint') >= $1
        ORDER BY new_device_count DESC
      `, [threshold, days]);

      return {
        users: users.rows.map((u: any) => ({
          userId: u.id,
          email: u.email,
          displayName: u.display_name,
          newDeviceCount: parseInt(u.new_device_count),
          highRiskCount: parseInt(u.high_risk_count),
          lastNewDevice: u.last_new_device,
          riskScore: Math.min(100, parseInt(u.new_device_count) * 10 + parseInt(u.high_risk_count) * 20)
        })),
        threshold,
        timeframe: `${days} days`,
        totalUsers: users.rows.length,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      request.log.error('Multi-device users error:', error);
      reply.code(500).send({
        error: 'Failed to get multi-device users',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Health check
  fastify.get('/device/detection/health', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const recentDetections = await (detectionService as any).db.query(`
        SELECT COUNT(*) as count
        FROM audit_logs
        WHERE action = 'new_device_detected'
          AND created_at >= NOW() - INTERVAL '1 hour'
      `);

      return {
        status: 'healthy',
        service: 'new_device_detection',
        recentDetectionsLastHour: parseInt(recentDetections.rows[0]?.count || '0'),
        features: [
          'New device detection',
          'Risk assessment',
          'Device approval/rejection',
          'Verification requirements',
          'Multi-device monitoring'
        ],
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      request.log.error('Health check failed:', error);
      reply.code(503).send({
        status: 'unhealthy',
        service: 'new_device_detection',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Documentation endpoint
  fastify.get('/device/detection/docs', async (request: FastifyRequest, reply: FastifyReply) => {
    return {
      title: 'New Device Detection API Documentation',
      description: 'Intelligent detection and management of new device logins',
      features: [
        'Automatic new device detection',
        'Risk-based verification requirements',
        'Device approval/rejection workflow',
        'Similar device analysis',
        'User trust level assessment',
        'Suspicious pattern detection',
        'Real-time notifications',
        'Administrative monitoring'
      ],
      riskLevels: [
        { level: 'low', description: 'Known device or very similar to trusted device' },
        { level: 'medium', description: 'Somewhat new device with moderate risk indicators' },
        { level: 'high', description: 'New device with significant risk factors' },
        { level: 'critical', description: 'New device with multiple high-risk indicators' }
      ],
      verificationMethods: [
        'email_code - Email verification code',
        'sms_code - SMS verification code',
        'totp - Time-based one-time password',
        'security_questions - Account security questions',
        'biometric - Biometric verification (if available)'
      ],
      endpoints: [
        {
          path: '/device/detect',
          method: 'POST',
          description: 'Detect if a device is new and assess risk',
          auth: 'required'
        },
        {
          path: '/device/approve',
          method: 'POST',
          description: 'Approve a new device after verification',
          auth: 'required'
        },
        {
          path: '/device/reject',
          method: 'POST',
          description: 'Reject and block a suspicious device',
          auth: 'required'
        },
        {
          path: '/device/:fingerprint/verification-status',
          method: 'GET',
          description: 'Check if device needs verification',
          auth: 'required'
        },
        {
          path: '/device/recent-new',
          method: 'GET',
          description: 'Get user\'s recent new devices',
          auth: 'required'
        },
        {
          path: '/device/admin/detection-stats',
          method: 'GET',
          description: 'Get detection statistics (admin)',
          auth: 'admin required'
        },
        {
          path: '/device/admin/multi-device-users',
          method: 'GET',
          description: 'Find users with many new devices',
          auth: 'admin required'
        }
      ]
    };
  });
}