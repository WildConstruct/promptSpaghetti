// Epic 11 Authentication Routes
// Fastify routes for authentication endpoints

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { AuthenticationService } from './AuthenticationService';
import { SECURITY_HEADERS, CORS_CONFIG } from './config';

// Request/Response schemas for validation
const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12),
  displayName: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  invitationToken: z.string().optional(),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  rememberMe: z.boolean().optional(),
  deviceInfo: z.record(z.any()).optional(),
});

const PasswordResetRequestSchema = z.object({
  email: z.string().email(),
});

const PasswordResetConfirmSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(12),
});

const EmailVerificationSchema = z.object({
  token: z.string(),
});

const RefreshTokenSchema = z.object({
  refreshToken: z.string(),
});

const ChangePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(12),
});

export async function authRoutes(fastify: FastifyInstance) {
  const authService = new AuthenticationService(fastify.authConfig);
  
  // Initialize authentication service
  await authService.initialize();
  
  // Add security headers to all auth routes
  fastify.addHook('onSend', async (request, reply) => {
    Object.entries(SECURITY_HEADERS).forEach(([header, value]) => {
      reply.header(header, value);
    });
  });

  // Helper function to extract request context
  function getRequestContext(request: FastifyRequest) {
    return {
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    };
  }

  // Helper function to extract user ID from JWT
  async function getUserFromToken(request: FastifyRequest): Promise<string> {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Missing or invalid authorization header');
    }
    
    const token = authHeader.substring(7);
    const user = await authService.validateToken(token);
    return user.id;
  }

  // User Registration
  fastify.post('/register', {
    schema: {
      body: RegisterSchema,
      response: {
        201: {
          type: 'object',
          properties: {
            user: { type: 'object' },
            emailVerificationRequired: { type: 'boolean' },
          },
        },
        400: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest<{ Body: z.infer<typeof RegisterSchema> }>, reply: FastifyReply) => {
    try {
      const result = await authService.register(request.body, getRequestContext(request));
      reply.code(201).send(result);
    } catch (error) {
      reply.code(400).send({ error: error.message });
    }
  });

  // User Login
  fastify.post('/login', {
    schema: {
      body: LoginSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
            user: { type: 'object' },
            expiresAt: { type: 'string', format: 'date-time' },
          },
        },
        401: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest<{ Body: z.infer<typeof LoginSchema> }>, reply: FastifyReply) => {
    try {
      const result = await authService.login(request.body, getRequestContext(request));
      reply.send(result);
    } catch (error) {
      reply.code(401).send({ error: error.message });
    }
  });

  // User Logout
  fastify.post('/logout', {
    preHandler: async (request) => {
      // Validate JWT token
      await getUserFromToken(request);
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = await getUserFromToken(request);
      await authService.logout(userId, undefined, getRequestContext(request));
      reply.send({ message: 'Logged out successfully' });
    } catch (error) {
      reply.code(401).send({ error: error.message });
    }
  });

  // Token Refresh
  fastify.post('/refresh', {
    schema: {
      body: RefreshTokenSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
          },
        },
        401: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest<{ Body: z.infer<typeof RefreshTokenSchema> }>, reply: FastifyReply) => {
    try {
      const result = await authService.refreshToken(request.body, getRequestContext(request));
      reply.send(result);
    } catch (error) {
      reply.code(401).send({ error: error.message });
    }
  });

  // Password Reset Request
  fastify.post('/password-reset/request', {
    schema: {
      body: PasswordResetRequestSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
        429: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest<{ Body: z.infer<typeof PasswordResetRequestSchema> }>, reply: FastifyReply) => {
    try {
      await authService.requestPasswordReset(request.body, getRequestContext(request));
      reply.send({ message: 'If the email exists, a password reset link has been sent.' });
    } catch (error) {
      const statusCode = error.message.includes('Rate limit') ? 429 : 400;
      reply.code(statusCode).send({ error: error.message });
    }
  });

  // Password Reset Confirmation
  fastify.post('/password-reset/confirm', {
    schema: {
      body: PasswordResetConfirmSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
        400: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest<{ Body: z.infer<typeof PasswordResetConfirmSchema> }>, reply: FastifyReply) => {
    try {
      await authService.resetPassword(request.body, getRequestContext(request));
      reply.send({ message: 'Password reset successfully.' });
    } catch (error) {
      reply.code(400).send({ error: error.message });
    }
  });

  // Email Verification
  fastify.post('/verify-email', {
    schema: {
      body: EmailVerificationSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
        400: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest<{ Body: z.infer<typeof EmailVerificationSchema> }>, reply: FastifyReply) => {
    try {
      await authService.verifyEmail(request.body, getRequestContext(request));
      reply.send({ message: 'Email verified successfully.' });
    } catch (error) {
      reply.code(400).send({ error: error.message });
    }
  });

  // Change Password
  fastify.post('/change-password', {
    preHandler: async (request) => {
      // Validate JWT token
      await getUserFromToken(request);
    },
    schema: {
      body: ChangePasswordSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
        400: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest<{ Body: z.infer<typeof ChangePasswordSchema> }>, reply: FastifyReply) => {
    try {
      const userId = await getUserFromToken(request);
      await authService.changePassword(userId, request.body, getRequestContext(request));
      reply.send({ message: 'Password changed successfully.' });
    } catch (error) {
      const statusCode = error.message.includes('Rate limit') ? 429 : 400;
      reply.code(statusCode).send({ error: error.message });
    }
  });

  // Get Current User Profile
  fastify.get('/me', {
    preHandler: async (request) => {
      // Validate JWT token
      await getUserFromToken(request);
    },
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            user: { type: 'object' },
          },
        },
        401: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const authHeader = request.headers.authorization;
      const token = authHeader!.substring(7);
      const user = await authService.validateToken(token);
      reply.send({ user });
    } catch (error) {
      reply.code(401).send({ error: error.message });
    }
  });

  // Health Check
  fastify.get('/health', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const health = await authService.healthCheck();
      const statusCode = health.status === 'healthy' ? 200 : 503;
      reply.code(statusCode).send(health);
    } catch (error) {
      reply.code(503).send({
        status: 'unhealthy',
        error: error.message,
      });
    }
  });

  // Token Validation (for internal use)
  fastify.post('/validate-token', {
    schema: {
      body: {
        type: 'object',
        properties: {
          token: { type: 'string' },
        },
        required: ['token'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            valid: { type: 'boolean' },
            user: { type: 'object' },
          },
        },
        401: {
          type: 'object',
          properties: {
            valid: { type: 'boolean' },
            error: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest<{ Body: { token: string } }>, reply: FastifyReply) => {
    try {
      const user = await authService.validateToken(request.body.token);
      reply.send({ valid: true, user });
    } catch (error) {
      reply.code(401).send({ valid: false, error: error.message });
    }
  });

  // Rate Limit Status (for debugging)
  fastify.get('/rate-limit-status/:key', async (request: FastifyRequest<{ Params: { key: string } }>, reply: FastifyReply) => {
    try {
      // This is a debug endpoint - in production, add proper authentication
      if (process.env.NODE_ENV === 'production') {
        reply.code(404).send({ error: 'Not found' });
        return;
      }

      // Get rate limit status without incrementing
      // This would require exposing the rate limit service
      reply.send({ message: 'Rate limit status endpoint - implement based on requirements' });
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Store auth service reference for middleware
  fastify.decorate('authService', authService);
}

// JWT Authentication Middleware
export async function jwtAuthMiddleware(fastify: FastifyInstance) {
  fastify.addHook('preHandler', async (request, reply) => {
    // Skip auth for certain routes
    const publicRoutes = [
      '/auth/register',
      '/auth/login',
      '/auth/password-reset/request',
      '/auth/password-reset/confirm',
      '/auth/verify-email',
      '/auth/health',
      '/health',
      '/preview',
      '/',
    ];

    const isPublicRoute = publicRoutes.some(route => 
      request.routerPath === route || request.routerPath?.startsWith(route)
    );

    if (isPublicRoute || !request.routerPath?.startsWith('/')) {
      return;
    }

    // Extract JWT token
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      reply.code(401).send({ error: 'Missing or invalid authorization header' });
      return;
    }

    try {
      const token = authHeader.substring(7);
      const authService = (fastify as any).authService as AuthenticationService;
      const user = await authService.validateToken(token);
      
      // Attach user to request
      (request as any).user = user;
    } catch (error) {
      reply.code(401).send({ error: 'Invalid or expired token' });
      return;
    }
  });
}