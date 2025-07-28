// Epic 11 Authentication Routes
// REST API endpoints for authentication with comprehensive security

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { AuthenticationService } from '../auth/AuthenticationService';
import { LoginService } from '../auth/services/LoginService';
import { UserService } from '../auth/services/UserService';
import { RegistrationService } from '../auth/services/RegistrationService';
import { PasswordResetService } from '../auth/services/PasswordResetService';
import { RateLimitService } from '../auth/services/RateLimitService';
import { RATE_LIMIT_RULES } from '../auth/config';

// Request schemas
const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  rememberMe: z.boolean().default(false),
  deviceInfo: z.object({
    fingerprint: z.string().optional(),
    userAgent: z.string().optional(),
    language: z.string().optional(),
    timezone: z.string().optional()
  }).optional()
});

const RefreshTokenRequestSchema = z.object({
  refreshToken: z.string()
});

const UnlockAccountRequestSchema = z.object({
  email: z.string().email(),
  unlockToken: z.string()
});

const RequestUnlockRequestSchema = z.object({
  email: z.string().email()
});

const LogoutRequestSchema = z.object({
  sessionId: z.string().optional()
});

interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    id: string;
    email: string;
    roles: string[];
  };
}

export async function authRoutes(fastify: FastifyInstance) {
  const authService = fastify.authService as AuthenticationService;
  const loginService = authService.getService('login') as LoginService;
  const userService = authService.getService('user') as UserService;
  const registrationService = authService.getService('registration') as RegistrationService;
  const passwordResetService = authService.getService('passwordReset') as PasswordResetService;
  const rateLimitService = authService.getService('rateLimit') as RateLimitService;

  // Helper function to extract client context
  const getClientContext = (request: FastifyRequest) => ({
    ipAddress: request.ip,
    userAgent: request.headers['user-agent'],
    geoLocation: {
      country: request.headers['cf-ipcountry'] as string, // Cloudflare header
      timezone: request.headers['cf-timezone'] as string
  }
    fingerprint: (request.headers['x-fingerprint'] || '') as string
  });

  // Login endpoint
  fastify.post('/api/auth/login', {
    schema: {
      body: LoginRequestSchema,
      response: {
        200: z.object({
          accessToken: z.string(),
          refreshToken: z.string(),
          user: z.object({
            id: z.string(),
            email: z.string(),
            emailVerified: z.boolean(),
            createdAt: z.string(),
            lastLoginAt: z.string().nullable(),
            roles: z.array(z.string()),
            permissions: z.array(z.string())
          }),
          expiresAt: z.string(),
          sessionId: z.string()
        }),
        400: z.object({ message: z.string() }),
        401: z.object({ message: z.string() }),
        429: z.object({ message: z.string() })
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = LoginRequestSchema.parse(request.body);
      const context = getClientContext(request);

      // Rate limiting check
      const rateLimitResult = await rateLimitService.checkIPRateLimit(
        context.ipAddress,
        'login',
        RATE_LIMIT_RULES.login
      );

      if (!rateLimitResult.allowed) {
        return reply.status(429).send({
          message: 'Too many login attempts. Please try again later.'
        });
      }

      const result = await loginService.login(body, context);
      
      // Set secure HTTP-only cookies for tokens
      reply.setCookie('accessToken', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000 // 15 minutes
      });

      reply.setCookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: body.rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000 // 30 days or 1 day
      });

      return {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        user: result.user,
        expiresAt: result.expiresAt.toISOString(),
        sessionId: result.sessionId
      };
    } catch (error: any) {
      if (error.message.includes('Invalid email or password')) {
        return reply.status(401).send({ message: 'Invalid email or password' });
      }
      if (error.message.includes('Account is locked')) {
        return reply.status(401).send({ message: error.message });
      }
      if (error.message.includes('Account is not active')) {
        return reply.status(401).send({ message: error.message });
      }
      if (error.message.includes('Too many login attempts')) {
        return reply.status(429).send({ message: error.message });
      }
      
      fastify.log.error('Login error:', error);
      return reply.status(400).send({ message: 'Login failed' });
    }
  });

  // Logout endpoint
  fastify.post('/api/auth/logout', {
    schema: {
      body: LogoutRequestSchema,
      response: {
        200: z.object({ message: z.string() })
      }
    }
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const body = LogoutRequestSchema.parse(request.body);
      const context = getClientContext(request);

      if (request.user) {
        await loginService.logout(request.user.id, body.sessionId, context);
      }

      // Clear cookies
      reply.clearCookie('accessToken');
      reply.clearCookie('refreshToken');

      return { message: 'Logged out successfully' };
    } catch (error: any) {
      fastify.log.error('Logout error:', error);
      return { message: 'Logged out successfully' }; // Always return success for logout
    }
  });

  // Refresh token endpoint
  fastify.post('/api/auth/refresh', {
    schema: {
      body: RefreshTokenRequestSchema,
      response: {
        200: z.object({
          accessToken: z.string(),
          refreshToken: z.string()
        }),
        401: z.object({ message: z.string() })
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = RefreshTokenRequestSchema.parse(request.body);
      const context = getClientContext(request);

      const tokens = await loginService.refreshSession(body.refreshToken, context);

      // Update cookies
      reply.setCookie('accessToken', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000 // 15 minutes
      });

      reply.setCookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
      });

      return tokens;
    } catch (error: any) {
      fastify.log.error('Token refresh error:', error);
      return reply.status(401).send({ message: 'Invalid or expired refresh token' });
    }
  });

  // Request account unlock
  fastify.post('/api/auth/request-unlock', {
    schema: {
      body: RequestUnlockRequestSchema,
      response: {
        200: z.object({ message: z.string() }),
        400: z.object({ message: z.string() }),
        429: z.object({ message: z.string() })
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = RequestUnlockRequestSchema.parse(request.body);
      const context = getClientContext(request);

      // Rate limiting for unlock requests
      const rateLimitResult = await rateLimitService.checkIPRateLimit(
        context.ipAddress,
        'unlock_request',
        { maxAttempts: 3, windowMs: 300000 } // 3 attempts per 5 minutes
      );

      if (!rateLimitResult.allowed) {
        return reply.status(429).send({
          message: 'Too many unlock requests. Please try again later.'
        });
      }

      // Check if user exists
      const user = await userService.getUserByEmail(body.email);
      if (!user) {
        // Don't reveal if email exists, but still return success
        return { message: 'If your account exists, unlock instructions have been sent to your email.' };
      }

      // Only send unlock email if account is actually locked
      if (user.accountLocked && user.lockedUntil && user.lockedUntil > new Date()) {
        const unlockToken = `unlock_${user.id}_${user.email}`; // In production, use a secure token
        
        // Send unlock email (implementation would call EmailService)
        await authService.getService('email').sendAccountUnlockRequest(user.email, {
          displayName: user.displayName,
          unlockToken,
          unlockUrl: `${process.env.FRONTEND_URL}/auth/unlock?token=${unlockToken}&email=${encodeURIComponent(user.email)}`,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
        });
      }

      return { message: 'If your account exists, unlock instructions have been sent to your email.' };
    } catch (error: any) {
      fastify.log.error('Request unlock error:', error);
      return reply.status(400).send({ message: 'Failed to process unlock request' });
    }
  });

  // Unlock account with token
  fastify.post('/api/auth/unlock-account', {
    schema: {
      body: UnlockAccountRequestSchema,
      response: {
        200: z.object({ message: z.string() }),
        400: z.object({ message: z.string() }),
        401: z.object({ message: z.string() })
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = UnlockAccountRequestSchema.parse(request.body);
      const context = getClientContext(request);

      await loginService.unlockAccount(body.email, body.unlockToken, context);

      return { message: 'Your account has been successfully unlocked. You can now sign in.' };
    } catch (error: any) {
      if (error.message.includes('Invalid unlock request') || error.message.includes('Invalid or expired unlock token')) {
        return reply.status(401).send({ message: 'Invalid or expired unlock token' });
      }
      
      fastify.log.error('Unlock account error:', error);
      return reply.status(400).send({ message: 'Failed to unlock account' });
    }
  });

  // Get current user profile
  fastify.get('/api/auth/me', {
    preValidation: [fastify.authenticate], // Requires authentication middleware
    schema: {
      response: {
        200: z.object({
          id: z.string(),
          email: z.string(),
          emailVerified: z.boolean(),
          createdAt: z.string(),
          lastLoginAt: z.string().nullable(),
          roles: z.array(z.string()),
          permissions: z.array(z.string())
        }),
        401: z.object({ message: z.string() })
      }
    }
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    if (!request.user) {
      return reply.status(401).send({ message: 'Unauthorized' });
    }

    try {
      const user = await userService.getUserById(request.user.id);
      if (!user) {
        return reply.status(401).send({ message: 'User not found' });
      }

      return {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt.toISOString(),
        lastLoginAt: user.lastLoginAt?.toISOString() || null,
        roles: ['user'], // Would fetch actual roles
        permissions: ['graphs:create:own'] // Would fetch actual permissions
      };
    } catch (error: any) {
      fastify.log.error('Get user profile error:', error);
      return reply.status(401).send({ message: 'Failed to get user profile' });
    }
  });

  // Get login analytics (admin only)
  fastify.get('/api/auth/analytics', {
    preValidation: [fastify.authenticate], // Requires authentication middleware
    schema: {
      querystring: z.object({
        timeframe: z.enum(['day', 'week', 'month']).default('week')
      }),
      response: {
        200: z.object({
          totalAttempts: z.number(),
          successfulLogins: z.number(),
          failedAttempts: z.number(),
          successRate: z.number(),
          topFailureReasons: z.array(z.object({
            reason: z.string(),
            count: z.number(),
            percentage: z.number()
          })),
          suspiciousActivity: z.array(z.object({
            type: z.string(),
            description: z.string(),
            count: z.number(),
            severity: z.enum(['low', 'medium', 'high'])
          })),
          deviceAnalysis: z.object({
            newDevices: z.number(),
            returningDevices: z.number(),
            suspiciousDevices: z.number()
  }
        }),
        401: z.object({ message: z.string() }),
        403: z.object({ message: z.string() })
      }
    }
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    // TODO: Add admin role check
    // if (!request.user?.roles.includes('admin')) {
    //   return reply.status(403).send({ message: 'Insufficient permissions' });
    // }

    try {
      const query = z.object({ timeframe: z.enum(['day', 'week', 'month']).default('week') }).parse(request.query);
      
      const analytics = await loginService.getLoginAnalytics(query.timeframe);
      return analytics;
    } catch (error: any) {
      fastify.log.error('Get analytics error:', error);
      return reply.status(400).send({ message: 'Failed to get analytics' });
    }
  });

  // Validate session endpoint
  fastify.get('/api/auth/validate', {
    preValidation: [fastify.authenticate],
    schema: {
      response: {
        200: z.object({
          valid: z.boolean(),
          user: z.object({
            id: z.string(),
            email: z.string(),
            roles: z.array(z.string())
  }
        }),
        401: z.object({ message: z.string() })
      }
    }
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    if (!request.user) {
      return reply.status(401).send({ message: 'Invalid session' });
    }

    return {
      valid: true,
      user: request.user
    };
  });

  // Password reset request
  fastify.post('/api/auth/password-reset/request', {
    schema: {
      body: z.object({
        email: z.string().email(),
        captchaToken: z.string().optional()
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
          estimatedDelivery: z.string().optional()
        }),
        400: z.object({ message: z.string() }),
        429: z.object({ message: z.string() })
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = request.body as { email: string; captchaToken?: string };
      const context = getClientContext(request);

      const passwordResetRequest = {
        email: body.email,
        captchaToken: body.captchaToken,
        clientInfo: {
          userAgent: context.userAgent,
          ipAddress: context.ipAddress,
          fingerprint: context.fingerprint
        }
      };

      const result = await passwordResetService.requestPasswordReset(passwordResetRequest);

      return {
        success: result.success,
        message: result.message,
        estimatedDelivery: result.estimatedDelivery?.toISOString()
      };
    } catch (error: any) {
      fastify.log.error('Password reset request error:', error);
      return reply.status(400).send({ message: error.message || 'Failed to process password reset request' });
    }
  });

  // Validate password reset token
  fastify.get('/api/auth/password-reset/validate/:token', {
    schema: {
      params: z.object({
        token: z.string().min(1)
      }),
      response: {
        200: z.object({
          valid: z.boolean(),
          error: z.string().optional(),
          canRetry: z.boolean().optional(),
          email: z.string().optional(),
          tokenExpiresAt: z.string().optional()
        }),
        400: z.object({ message: z.string() })
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as { token: string };
      const validation = await passwordResetService.validatePasswordResetToken(params.token);

      return {
        valid: validation.valid,
        error: validation.error,
        canRetry: validation.canRetry,
        email: validation.email,
        tokenExpiresAt: validation.tokenExpiresAt?.toISOString()
      };
    } catch (error: any) {
      fastify.log.error('Password reset token validation error:', error);
      return reply.status(400).send({ message: 'Failed to validate password reset token' });
    }
  });

  // Confirm password reset
  fastify.post('/api/auth/password-reset/confirm', {
    schema: {
      body: z.object({
        token: z.string().min(1),
        newPassword: z.string().min(8).max(128),
        confirmPassword: z.string().min(8).max(128)
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          message: z.string()
        }),
        400: z.object({ message: z.string() }),
        429: z.object({ message: z.string() })
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = request.body as {
        token: string;
        newPassword: string;
        confirmPassword: string;
      };
      const context = getClientContext(request);

      const confirmation = {
        token: body.token,
        newPassword: body.newPassword,
        confirmPassword: body.confirmPassword,
        clientInfo: {
          userAgent: context.userAgent,
          ipAddress: context.ipAddress,
          fingerprint: context.fingerprint
        }
      };

      const result = await passwordResetService.confirmPasswordReset(confirmation);

      return {
        success: result.success,
        message: result.message
      };
    } catch (error: any) {
      fastify.log.error('Password reset confirmation error:', error);
      
      if (error.message.includes('rate limit') || error.message.includes('too many')) {
        return reply.status(429).send({ message: error.message });
      }
      
      return reply.status(400).send({ message: error.message || 'Failed to reset password' });
    }
  });

  // Health check for auth service
  fastify.get('/api/auth/health', {
    schema: {
      response: {
        200: z.object({
          status: z.string(),
          timestamp: z.string(),
          services: z.object({
            database: z.string(),
            redis: z.string(),
            authentication: z.string()
  }
  }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const health = await authService.getHealthStatus();
      
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: health
      };
    } catch (error: any) {
      fastify.log.error('Health check error:', error);
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        services: {
          database: 'error',
          redis: 'error',
          authentication: 'error'
        }
      };
    }
  });
}

export default authRoutes;