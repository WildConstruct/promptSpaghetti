// Device Fingerprinting API Routes
// REST API for device identification and trust management

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { DeviceFingerprintingService } from '../services/DeviceFingerprintingService';

interface FingerprintRequest {
  components: {
    userAgent: string;
    screenResolution?: string;
    timezone: string;
    language: string;
    platform: string;
    hardwareConcurrency?: number;
    deviceMemory?: number;
    colorDepth?: number;
    pixelRatio?: number;
    touchSupport?: boolean;
    webGLVendor?: string;
    webGLRenderer?: string;
    fonts?: string[];
    plugins?: string[];
    canvas?: string;
    audio?: string;
    webRTC?: {
      localIP?: string;
      publicIP?: string;
    };
  };
  metadata?: {
    ipAddress?: string;
    location?: {
      country: string;
      city: string;
    };
  };
}

interface VerifyDeviceRequest {
  fingerprint: string;
  expectedFingerprint?: string;
}

interface TrustDeviceRequest {
  reason?: string;
}

interface BlockDeviceRequest {
  reason: string;
}

export async function deviceFingerprintingRoutes(
  fastify: FastifyInstance,
  deviceService: DeviceFingerprintingService
) {
  // Generate device fingerprint
  fastify.post<{
    Body: FingerprintRequest;
  }>('/device/fingerprint', async (request: FastifyRequest<{
    Body: FingerprintRequest;
  }>, reply: FastifyReply) => {
    try {
      const { components, metadata } = request.body;
      
      // Generate fingerprint hash
      const fingerprint = await deviceService.generateFingerprint(components);
      
      // Record device access
      const userId = (request.user as any)?.id;
      const trustProfile = await deviceService.recordDeviceAccess(
        fingerprint,
        components,
        userId,
        {
          ipAddress: metadata?.ipAddress || request.ip,
          location: metadata?.location
        }
      );
      
      return {
        fingerprint,
        trustProfile: {
          trustScore: trustProfile.trustScore,
          verificationStatus: trustProfile.verificationStatus,
          requiresVerification: trustProfile.verificationStatus === 'unverified',
          isNewDevice: trustProfile.firstSeen === trustProfile.lastSeen
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      request.log.error('Device fingerprinting error:', error);
      reply.code(500).send({
        error: 'Failed to generate device fingerprint',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Verify device fingerprint
  fastify.post<{
    Body: VerifyDeviceRequest;
  }>('/device/verify', {
    preHandler: [fastify.jwtAuth]
  }, async (request: FastifyRequest<{
    Body: VerifyDeviceRequest;
  }>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any)?.id;
      if (!userId) {
        reply.code(401).send({ error: 'User not authenticated' });
        return;
      }

      const { fingerprint, expectedFingerprint } = request.body;
      
      const verification = await deviceService.verifyDevice(
        fingerprint,
        expectedFingerprint,
        userId
      );
      
      return {
        verification,
        recommendations: verification.requiresAdditionalVerification
          ? ['Consider enabling 2FA', 'Verify device through email']
          : [],
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      request.log.error('Device verification error:', error);
      reply.code(500).send({
        error: 'Failed to verify device',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get device history
  fastify.get<{
    Params: { fingerprint: string };
    Querystring: { limit?: number };
  }>('/device/:fingerprint/history', {
    preHandler: [fastify.jwtAuth]
  }, async (request: FastifyRequest<{
    Params: { fingerprint: string };
    Querystring: { limit?: number };
  }>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any)?.id;
      if (!userId) {
        reply.code(401).send({ error: 'User not authenticated' });
        return;
      }

      const { fingerprint } = request.params;
      const { limit = 50 } = request.query;
      
      const history = await deviceService.getDeviceHistory(fingerprint, limit);
      
      // Check if user has access to this device
      const hasAccess = history.users.some(u => u.user_id === userId) ||
                       (request.user as any)?.roles?.includes('admin');
      
      if (!hasAccess) {
        reply.code(403).send({ error: 'Access denied to device history' });
        return;
      }
      
      return {
        device: {
          fingerprint: history.device.fingerprint,
          firstSeen: history.device.first_seen,
          lastSeen: history.device.last_seen,
          seenCount: history.device.seen_count,
          trustScore: history.device.trust_score,
          isBlocked: history.device.is_blocked
        },
        users: history.users.map(u => ({
          userId: u.user_id,
          email: u.email,
          displayName: u.display_name,
          firstAssociated: u.first_associated,
          lastAccessed: u.last_accessed,
          accessCount: u.access_count,
          isTrusted: u.is_trusted
        })),
        locations: history.locations,
        securityEvents: history.securityEvents,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      request.log.error('Device history error:', error);
      reply.code(500).send({
        error: 'Failed to retrieve device history',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Mark device as trusted
  fastify.post<{
    Params: { fingerprint: string };
    Body: TrustDeviceRequest;
  }>('/device/:fingerprint/trust', {
    preHandler: [fastify.jwtAuth]
  }, async (request: FastifyRequest<{
    Params: { fingerprint: string };
    Body: TrustDeviceRequest;
  }>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any)?.id;
      if (!userId) {
        reply.code(401).send({ error: 'User not authenticated' });
        return;
      }

      const { fingerprint } = request.params;
      const { reason } = request.body;
      
      await deviceService.markDeviceAsTrusted(fingerprint, userId, userId);
      
      return {
        success: true,
        message: 'Device marked as trusted',
        fingerprint,
        trustedBy: userId,
        reason,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      request.log.error('Device trust error:', error);
      reply.code(500).send({
        error: 'Failed to mark device as trusted',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get user's devices
  fastify.get<{
    Querystring: { includeBlocked?: boolean };
  }>('/device/my-devices', {
    preHandler: [fastify.jwtAuth]
  }, async (request: FastifyRequest<{
    Querystring: { includeBlocked?: boolean };
  }>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any)?.id;
      if (!userId) {
        reply.code(401).send({ error: 'User not authenticated' });
        return;
      }

      const { includeBlocked = false } = request.query;
      
      const devices = await (deviceService as any).db.query(`
        SELECT 
          df.fingerprint,
          df.first_seen,
          df.last_seen,
          df.seen_count,
          df.trust_score,
          df.is_blocked,
          df.components,
          dua.first_associated,
          dua.last_accessed,
          dua.access_count,
          dua.is_trusted,
          dua.is_primary,
          dtp.verification_status,
          dtp.location_history
        FROM device_user_associations dua
        JOIN device_fingerprints df ON df.fingerprint = dua.device_fingerprint
        LEFT JOIN device_trust_profiles dtp ON dtp.fingerprint = df.fingerprint
        WHERE dua.user_id = $1
          ${includeBlocked ? '' : 'AND df.is_blocked = false'}
        ORDER BY dua.last_accessed DESC
      `, [userId]);
      
      return {
        devices: devices.rows.map((d: any) => ({
          fingerprint: d.fingerprint,
          deviceInfo: {
            userAgent: d.components?.userAgent,
            platform: d.components?.platform,
            screenResolution: d.components?.screenResolution
          },
          firstSeen: d.first_seen,
          lastSeen: d.last_seen,
          accessCount: d.access_count,
          trustScore: d.trust_score,
          verificationStatus: d.verification_status,
          isTrusted: d.is_trusted,
          isPrimary: d.is_primary,
          isBlocked: d.is_blocked,
          recentLocations: (d.location_history || []).slice(-5)
        })),
        totalDevices: devices.rows.length,
        trustedDevices: devices.rows.filter((d: any) => d.is_trusted).length,
        blockedDevices: devices.rows.filter((d: any) => d.is_blocked).length,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      request.log.error('My devices error:', error);
      reply.code(500).send({
        error: 'Failed to retrieve user devices',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Admin: Block device
  fastify.post<{
    Params: { fingerprint: string };
    Body: BlockDeviceRequest;
  }>('/device/:fingerprint/block', {
    preHandler: [fastify.jwtAuth, async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user as any;
      if (!user?.roles?.some((role: string) => ['admin', 'security'].includes(role))) {
        reply.code(403).send({ error: 'Admin or security role required' });
        return;
      }
    }]
  }, async (request: FastifyRequest<{
    Params: { fingerprint: string };
    Body: BlockDeviceRequest;
  }>, reply: FastifyReply) => {
    try {
      const { fingerprint } = request.params;
      const { reason } = request.body;
      const blockedBy = (request.user as any)?.id;
      
      await deviceService.blockDevice(fingerprint, reason, blockedBy);
      
      return {
        success: true,
        message: 'Device blocked successfully',
        fingerprint,
        blockedBy,
        reason,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      request.log.error('Device block error:', error);
      reply.code(500).send({
        error: 'Failed to block device',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Admin: Get device statistics
  fastify.get<{
    Querystring: { timeframe?: 'day' | 'week' | 'month' };
  }>('/device/admin/statistics', {
    preHandler: [fastify.jwtAuth, async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user as any;
      if (!user?.roles?.some((role: string) => ['admin', 'security', 'ops'].includes(role))) {
        reply.code(403).send({ error: 'Admin, security, or ops role required' });
        return;
      }
    }]
  }, async (request: FastifyRequest<{
    Querystring: { timeframe?: 'day' | 'week' | 'month' };
  }>, reply: FastifyReply) => {
    try {
      const { timeframe = 'week' } = request.query;
      const statistics = await deviceService.getDeviceStatistics(timeframe);
      
      return {
        statistics,
        insights: {
          suspiciousDevicePercentage: statistics.devices.total_devices > 0
            ? Math.round((statistics.devices.suspicious_devices / statistics.devices.total_devices) * 100)
            : 0,
          newDeviceGrowth: statistics.devices.new_devices,
          unresolvedSecurityEvents: statistics.securityEvents.unresolved_events,
          averageTrustScore: Math.round(statistics.devices.avg_trust_score || 50)
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      request.log.error('Device statistics error:', error);
      reply.code(500).send({
        error: 'Failed to retrieve device statistics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Admin: Search devices
  fastify.get<{
    Querystring: {
      fingerprint?: string;
      userId?: string;
      trustScore?: number;
      verificationStatus?: string;
      limit?: number;
    };
  }>('/device/admin/search', {
    preHandler: [fastify.jwtAuth, async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user as any;
      if (!user?.roles?.some((role: string) => ['admin', 'security'].includes(role))) {
        reply.code(403).send({ error: 'Admin or security role required' });
        return;
      }
    }]
  }, async (request: FastifyRequest<{
    Querystring: {
      fingerprint?: string;
      userId?: string;
      trustScore?: number;
      verificationStatus?: string;
      limit?: number;
    };
  }>, reply: FastifyReply) => {
    try {
      const { fingerprint, userId, trustScore, verificationStatus, limit = 100 } = request.query;
      
      let query = `
        SELECT 
          df.*,
          dtp.verification_status,
          dtp.behavior_metrics,
          COUNT(DISTINCT dua.user_id) as user_count,
          COUNT(DISTINCT dse.id) as security_event_count
        FROM device_fingerprints df
        LEFT JOIN device_trust_profiles dtp ON dtp.fingerprint = df.fingerprint
        LEFT JOIN device_user_associations dua ON dua.device_fingerprint = df.fingerprint
        LEFT JOIN device_security_events dse ON dse.device_fingerprint = df.fingerprint
        WHERE 1=1
      `;
      
      const params: any[] = [];
      let paramIndex = 1;
      
      if (fingerprint) {
        query += ` AND df.fingerprint LIKE $${paramIndex}`;
        params.push(`%${fingerprint}%`);
        paramIndex++;
      }
      
      if (userId) {
        query += ` AND EXISTS (
          SELECT 1 FROM device_user_associations 
          WHERE device_fingerprint = df.fingerprint AND user_id = $${paramIndex}
        )`;
        params.push(userId);
        paramIndex++;
      }
      
      if (trustScore !== undefined) {
        query += ` AND df.trust_score <= $${paramIndex}`;
        params.push(trustScore);
        paramIndex++;
      }
      
      if (verificationStatus) {
        query += ` AND dtp.verification_status = $${paramIndex}`;
        params.push(verificationStatus);
        paramIndex++;
      }
      
      query += ' GROUP BY df.fingerprint, dtp.verification_status, dtp.behavior_metrics';
      query += ' ORDER BY df.last_seen DESC';
      query += ` LIMIT $${paramIndex}`;
      params.push(limit);
      
      const results = await (deviceService as any).db.query(query, params);
      
      return {
        devices: results.rows.map((d: any) => ({
          fingerprint: d.fingerprint,
          firstSeen: d.first_seen,
          lastSeen: d.last_seen,
          seenCount: d.seen_count,
          trustScore: d.trust_score,
          verificationStatus: d.verification_status,
          isBlocked: d.is_blocked,
          userCount: parseInt(d.user_count),
          securityEventCount: parseInt(d.security_event_count),
          riskFactors: d.risk_factors
        })),
        searchCriteria: { fingerprint, userId, trustScore, verificationStatus },
        resultCount: results.rows.length,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      request.log.error('Device search error:', error);
      reply.code(500).send({
        error: 'Failed to search devices',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Health check
  fastify.get('/device/health', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const stats = await deviceService.getDeviceStatistics('day');
      
      return {
        status: 'healthy',
        service: 'device_fingerprinting',
        statistics: {
          totalDevices: stats.devices.total_devices,
          newDevicesToday: stats.devices.new_devices,
          averageTrustScore: Math.round(stats.devices.avg_trust_score || 50)
        },
        features: [
          'Device fingerprint generation',
          'Trust scoring',
          'Behavior analysis',
          'Security event tracking',
          'Multi-user device support'
        ],
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      request.log.error('Device fingerprinting health check failed:', error);
      reply.code(503).send({
        status: 'unhealthy',
        service: 'device_fingerprinting',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Documentation endpoint
  fastify.get('/device/docs', async (request: FastifyRequest, reply: FastifyReply) => {
    return {
      title: 'Device Fingerprinting API Documentation',
      description: 'Advanced device identification and tracking for enhanced security',
      features: [
        'Browser fingerprint generation using multiple components',
        'Trust scoring based on device behavior',
        'Multi-user device association tracking',
        'Security event monitoring',
        'Location history tracking',
        'Suspicious device detection',
        'Device blocking capabilities'
      ],
      fingerprintComponents: [
        'User Agent',
        'Screen Resolution',
        'Timezone',
        'Language',
        'Platform',
        'Hardware Concurrency',
        'Device Memory',
        'Color Depth',
        'Pixel Ratio',
        'Touch Support',
        'WebGL Vendor/Renderer',
        'Font List',
        'Plugin List',
        'Canvas Fingerprint',
        'Audio Fingerprint'
      ],
      endpoints: [
        {
          path: '/device/fingerprint',
          method: 'POST',
          description: 'Generate device fingerprint and record access',
          auth: 'optional'
        },
        {
          path: '/device/verify',
          method: 'POST',
          description: 'Verify device fingerprint and check trust',
          auth: 'required'
        },
        {
          path: '/device/:fingerprint/history',
          method: 'GET',
          description: 'Get device history and associations',
          auth: 'required'
        },
        {
          path: '/device/:fingerprint/trust',
          method: 'POST',
          description: 'Mark device as trusted',
          auth: 'required'
        },
        {
          path: '/device/my-devices',
          method: 'GET',
          description: 'Get user\'s associated devices',
          auth: 'required'
        },
        {
          path: '/device/:fingerprint/block',
          method: 'POST',
          description: 'Block device (admin only)',
          auth: 'admin required'
        },
        {
          path: '/device/admin/statistics',
          method: 'GET',
          description: 'Get device statistics',
          auth: 'admin/security role required'
        },
        {
          path: '/device/admin/search',
          method: 'GET',
          description: 'Search devices with filters',
          auth: 'admin/security role required'
        }
      ],
      trustScoring: {
        factors: [
          'Device age (older devices score higher)',
          'Consistency of access patterns',
          'Number of security events',
          'Verification status',
          'User associations',
          'Geographic consistency'
        ],
        thresholds: {
          blocked: '< 20',
          suspicious: '20-40',
          unverified: '40-60',
          trusted: '60-80',
          verified: '80-100'
        }
      },
      securityEvents: [
        'new_device - First time device seen',
        'fingerprint_change - Significant fingerprint change',
        'new_user_association - New user on existing device',
        'device_trusted - Device marked as trusted',
        'device_blocked - Device blocked by admin'
      ]
    };
  });
}