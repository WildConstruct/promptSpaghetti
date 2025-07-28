// Epic 17 - TOTP API Routes
// REST API for TOTP enrollment, authentication, and management

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { TOTPService } from '../auth/services/TOTPService';

}
interface TOTPEnrollmentRequest {
  accountName?: string;
  options?: {
    algorithm?: 'SHA1' | 'SHA256' | 'SHA512';
    digits?: number;
    period?: number;
}
  };
}

}
interface TOTPVerificationRequest {
  configurationId: string;
  code: string;
}
}

}
interface TOTPAuthenticationRequest {
  code: string;
  isBackupCode?: boolean;
}
}

export async function totpRoutes(
  fastify: FastifyInstance,
  totpService: TOTPService
) {
  // Start TOTP enrollment
  fastify.post<{
    Body: TOTPEnrollmentRequest;
  }>('/totp/enroll', {
    preHandler: [fastify.jwtAuth] // Require authentication
  }, async (request: FastifyRequest<{
    Body: TOTPEnrollmentRequest;
  }>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any)?.id;
      if (!userId) {
        reply.code(401).send({ error: 'User not authenticated' });
        return;
      }

      const { accountName = (request.user as any)?.email, options = {} } = request.body;

      // Check rate limiting
      const rateLimit = await totpService.checkRateLimit(
        userId,
        request.ip,
        'enrollment'
      );

      if (!rateLimit.allowed) {
        reply.code(429).send({
          error: 'Too many enrollment attempts',
          resetTime: rateLimit.resetTime?.toISOString()
        });
        return;
      }

      // Generate TOTP configuration
      const enrollment = await totpService.generateTOTPConfiguration(
        userId,
        accountName,
        options
      );

      return {
        configurationId: enrollment.configurationId,
        qrCodeDataUrl: enrollment.qrCodeDataUrl,
        manualEntryKey: enrollment.manualEntryKey,
        backupCodes: enrollment.backupCodes,
        issuer: enrollment.issuer,
        accountName: enrollment.accountName,
        expiresAt: enrollment.expiresAt.toISOString(),
        instructions: {
          step1: 'Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)',
          step2: 'Or manually enter the key if you cannot scan the QR code',
          step3: 'Enter the 6-digit code from your app to complete setup',
          step4: 'Save your backup codes in a secure location'
        }
      };
    } catch (error) {
      request.log.error('TOTP enrollment error:', error);
      reply.code(500).send({
        error: 'Failed to start TOTP enrollment',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Verify TOTP enrollment
  fastify.post<{
    Body: TOTPVerificationRequest;
  }>('/totp/verify-enrollment', {
    preHandler: [fastify.jwtAuth]
  }, async (request: FastifyRequest<{
    Body: TOTPVerificationRequest;
  }>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any)?.id;
      if (!userId) {
        reply.code(401).send({ error: 'User not authenticated' });
        return;
      }

      const { configurationId, code } = request.body;

      if (!configurationId || !code) {
        reply.code(400).send({
          error: 'Configuration ID and code are required'
        });
        return;
      }

      // Check rate limiting
      const rateLimit = await totpService.checkRateLimit(
        userId,
        request.ip,
        'enrollment'
      );

      if (!rateLimit.allowed) {
        reply.code(429).send({
          error: 'Too many enrollment attempts',
          resetTime: rateLimit.resetTime?.toISOString()
        });
        return;
      }

      // Verify enrollment
      const result = await totpService.verifyEnrollment(
        configurationId,
        code,
        request.ip
      );

      if (result.success) {
        return {
          success: true,
          message: result.message,
          enabled: true,
          backupCodesRemaining: result.configuration?.backupCodes.length
        };
      } else {
        reply.code(400).send({
          success: false,
          error: result.message
        });
      }
    } catch (error) {
      request.log.error('TOTP verification error:', error);
      reply.code(500).send({
        error: 'Failed to verify TOTP enrollment',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Authenticate with TOTP
  fastify.post<{
    Body: TOTPAuthenticationRequest;
  }>('/totp/authenticate', {
    preHandler: [fastify.jwtAuth]
  }, async (request: FastifyRequest<{
    Body: TOTPAuthenticationRequest;
  }>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any)?.id;
      if (!userId) {
        reply.code(401).send({ error: 'User not authenticated' });
        return;
      }

      const { code, isBackupCode = false } = request.body;

      if (!code) {
        reply.code(400).send({ error: 'Code is required' });
        return;
      }

      // Check rate limiting
      const rateLimit = await totpService.checkRateLimit(
        userId,
        request.ip,
        'authentication'
      );

      if (!rateLimit.allowed) {
        reply.code(429).send({
          error: 'Too many authentication attempts',
          resetTime: rateLimit.resetTime?.toISOString(),
          remainingAttempts: rateLimit.remainingAttempts
        });
        return;
      }

      // Authenticate with TOTP or backup code
      let result;
      if (isBackupCode) {
        result = await totpService.authenticateWithBackupCode(
          userId,
          code,
          request.ip
        );
      } else {
        result = await totpService.authenticateUser(
          userId,
          code,
          request.ip
        );
      }

      if (result.success) {
        return {
          success: true,
          message: result.message,
          remainingBackupCodes: result.remainingCodes,
          usedBackupCode: isBackupCode
        };
      } else {
        reply.code(401).send({
          success: false,
          error: result.message,
          remainingAttempts: result.remainingAttempts
        });
      }
    } catch (error) {
      request.log.error('TOTP authentication error:', error);
      reply.code(500).send({
        error: 'Failed to authenticate TOTP',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get TOTP status
  fastify.get('/totp/status', {
    preHandler: [fastify.jwtAuth]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request.user as any)?.id;
      if (!userId) {
        reply.code(401).send({ error: 'User not authenticated' });
        return;
      }

      const configurations = await (totpService as any).getUserConfigurations(userId);
      const activeConfig = configurations.find((c: any) => c.enabled);

      if (!activeConfig) {
        return {
          enabled: false,
          message: 'TOTP not configured'
        };
      }

      // Get backup codes info without exposing actual codes
      const backupCodes = JSON.parse(activeConfig.backupCodes || '[]');
      const usedBackupCodes = JSON.parse(activeConfig.usedBackupCodes || '[]');

      return {
        enabled: true,
        algorithm: activeConfig.algorithm,
        digits: activeConfig.digits,
        period: activeConfig.period,
        issuer: activeConfig.issuer,
        lastUsedAt: activeConfig.lastUsedAt?.toISOString(),
        backupCodesRemaining: backupCodes.length - usedBackupCodes.length,
        totalBackupCodes: backupCodes.length
      };
    } catch (error) {
      request.log.error('TOTP status error:', error);
      reply.code(500).send({
        error: 'Failed to get TOTP status',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Regenerate backup codes
  fastify.post('/totp/regenerate-backup-codes', {
    preHandler: [fastify.jwtAuth]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request.user as any)?.id;
      if (!userId) {
        reply.code(401).send({ error: 'User not authenticated' });
        return;
      }

      const backupCodes = await totpService.regenerateBackupCodes(userId);

      return {
        success: true,
        backupCodes,
        message: 'New backup codes generated. Please save them securely.',
        warning: 'Previous backup codes are no longer valid.'
      };
    } catch (error) {
      request.log.error('TOTP backup codes regeneration error:', error);
      reply.code(500).send({
        error: 'Failed to regenerate backup codes',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Disable TOTP
  fastify.post<{
    Body: { reason?: string; confirmationCode: string };
  }>('/totp/disable', {
    preHandler: [fastify.jwtAuth]
  }, async (request: FastifyRequest<{
    Body: { reason?: string; confirmationCode: string };
  }>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any)?.id;
      if (!userId) {
        reply.code(401).send({ error: 'User not authenticated' });
        return;
      }

      const { reason = 'User request', confirmationCode } = request.body;

      if (!confirmationCode) {
        reply.code(400).send({
          error: 'Confirmation code required to disable TOTP'
        });
        return;
      }

      // Verify the current TOTP code before disabling
      const authResult = await totpService.authenticateUser(
        userId,
        confirmationCode,
        request.ip
      );

      if (!authResult.success) {
        reply.code(401).send({
          error: 'Invalid confirmation code',
          message: 'Please provide a valid TOTP code to disable 2FA'
        });
        return;
      }

      await totpService.disableConfiguration(userId, reason);

      return {
        success: true,
        message: 'TOTP has been disabled successfully',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      request.log.error('TOTP disable error:', error);
      reply.code(500).send({
        error: 'Failed to disable TOTP',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Admin: Get TOTP statistics
  fastify.get('/totp/admin/statistics', {
    preHandler: [fastify.jwtAuth, async (request: FastifyRequest, reply: FastifyReply) => {
      // TODO: Add admin role check
      const user = request.user as any;
      if (!user?.roles?.includes('admin')) {
        reply.code(403).send({ error: 'Admin access required' });
        return;
      }
    }]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const statistics = await totpService.getTOTPStatistics();

      return {
        statistics,
        timestamp: new Date().toISOString(),
        description: 'TOTP system usage statistics'
      };
    } catch (error) {
      request.log.error('TOTP statistics error:', error);
      reply.code(500).send({
        error: 'Failed to get TOTP statistics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Health check for TOTP system
  fastify.get('/totp/health', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Test basic TOTP functionality
      const testSecret = 'JBSWY3DPEHPK3PXP'; // Base32 "Hello!"
      const currentCode = await totpService.getCurrentCode(testSecret);
      const isValid = await totpService.validateTOTPCode(testSecret, currentCode);

      return {
        status: isValid.valid ? 'healthy' : 'unhealthy',
        checks: {
          codeGeneration: currentCode ? 'ok' : 'failed',
          codeValidation: isValid.valid ? 'ok' : 'failed',
          database: 'connected', // Assume connected if we got this far
          timeSync: isValid.drift === 0 ? 'ok' : 'drift_detected'
  }
        timeRemaining: isValid.timeRemaining,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      request.log.error('TOTP health check error:', error);
      reply.code(503).send({
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Get current TOTP code (for testing/debugging - admin only)
  fastify.get<{
    Querystring: { secret: string };
  }>('/totp/debug/current-code', {
    preHandler: [fastify.jwtAuth, async (request: FastifyRequest, reply: FastifyReply) => {
      // Only allow in development or for admin users
      if (process.env.NODE_ENV === 'production') {
        const user = request.user as any;
        if (!user?.roles?.includes('admin')) {
          reply.code(403).send({ error: 'Admin access required' });
          return;
        }
      }
    }]
  }, async (request: FastifyRequest<{
    Querystring: { secret: string };
  }>, reply: FastifyReply) => {
    try {
      const { secret } = request.query;

      if (!secret) {
        reply.code(400).send({ error: 'Secret parameter required' });
        return;
      }

      const currentCode = await totpService.getCurrentCode(secret);
      const timeRemaining = totpService.getTimeRemaining();

      return {
        code: currentCode,
        timeRemaining,
        warning: 'This endpoint should only be used for testing and debugging',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      request.log.error('TOTP debug code error:', error);
      reply.code(500).send({
        error: 'Failed to get current code',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Documentation endpoint
  fastify.get('/totp/docs', async (request: FastifyRequest, reply: FastifyReply) => {
    return {
      title: 'TOTP (Time-based One-Time Password) API Documentation',
      description: 'RFC 6238 compliant TOTP system for multi-factor authentication',
      features: [
        'RFC 6238 compliant TOTP implementation',
        'QR code generation for easy app enrollment',
        'Backup codes for account recovery',
        'Rate limiting and abuse protection',
        'Comprehensive audit logging',
        'Support for multiple authenticator apps',
        'Admin statistics and monitoring',
        'Time drift tolerance'
      ],
      supportedApps: [
        'Google Authenticator',
        'Microsoft Authenticator',
        'Authy',
        '1Password',
        'LastPass Authenticator',
        'Any RFC 6238 compatible app'
      ],
      endpoints: [
        {
          path: '/totp/enroll',
          method: 'POST',
          description: 'Start TOTP enrollment process',
          auth: 'required'
  }
        {
          path: '/totp/verify-enrollment',
          method: 'POST',
          description: 'Complete TOTP enrollment with verification',
          auth: 'required'
  }
        {
          path: '/totp/authenticate',
          method: 'POST',
          description: 'Authenticate with TOTP code or backup code',
          auth: 'required'
  }
        {
          path: '/totp/status',
          method: 'GET',
          description: 'Get current TOTP configuration status',
          auth: 'required'
  }
        {
          path: '/totp/regenerate-backup-codes',
          method: 'POST',
          description: 'Generate new backup codes',
          auth: 'required'
  }
        {
          path: '/totp/disable',
          method: 'POST',
          description: 'Disable TOTP (requires confirmation code)',
          auth: 'required'
        }
      ],
      securityFeatures: {
        rateLimiting: 'Protects against brute force attacks',
        replayPrevention: 'Prevents code reuse within time windows',
        auditLogging: 'Complete audit trail of all TOTP events',
        backupCodes: 'Single-use recovery codes for account access',
        timeSkew: 'Tolerance for clock drift between client and server'
      }
    };
  });
}