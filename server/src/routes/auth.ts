import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { AuthService } from '../services/auth-service.js';
import { WorkspaceDAO } from '../database/workspace-dao.js';

// Request Schemas
const OAuthProviderConfigSchema = z.object({
  provider: z.enum(['google', 'github', 'microsoft', 'okta', 'auth0']),
  clientId: z.string(),
  clientSecret: z.string(),
  redirectUri: z.string(),
  scope: z.string().optional(),
  domain: z.string().optional(),
});

const OAuthCallbackSchema = z.object({
  code: z.string(),
  state: z.string().optional(),
  error: z.string().optional(),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  mfaToken: z.string().optional(),
});

const MFAVerificationSchema = z.object({
  token: z.string().length(6),
});

const SessionRefreshSchema = z.object({
  sessionId: z.string(),
});

interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    id: string;
    email: string;
    permissions: string[];
    workspaceId?: string;
  };
}

export default async function authRoutes(fastify: FastifyInstance) {
  const workspaceDAO = new WorkspaceDAO(fastify.pg);
  const authService = new AuthService(workspaceDAO, process.env.JWT_SECRET || 'default-secret');

  // Initialize OAuth providers from environment
  await initializeOAuthProviders(authService);

  // Authentication middleware
  async function authenticate(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        throw new Error('Missing authorization header');
      }

      const token = authHeader.substring(7);
      const payload = await authService.verifyJWT(token);
      
      // Validate session
      const session = await authService.validateSession(payload.sessionId);
      if (!session) {
        throw new Error('Invalid session');
      }

      request.user = {
        id: session.userId,
        email: payload.email,
        permissions: session.permissions,
        workspaceId: session.workspaceId,
      };
    } catch (error) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }

  // OAuth Configuration Routes
  fastify.post('/auth/oauth/configure', {
    schema: {
      body: OAuthProviderConfigSchema,
      response: {
        200: z.object({ success: z.boolean() }),
        400: z.object({ error: z.string() }),
      },
    },
  }, async (request, reply) => {
    try {
      await authService.registerOAuthProvider(request.body);
      reply.send({ success: true });
    } catch (error) {
      reply.status(400).send({ error: (error as Error).message });
    }
  });

  // OAuth Authorization URL
  fastify.get('/auth/oauth/:provider/authorize', {
    schema: {
      params: z.object({ provider: z.string() }),
      querystring: z.object({ state: z.string().optional() }),
      response: {
        200: z.object({ authUrl: z.string() }),
        400: z.object({ error: z.string() }),
      },
    },
  }, async (request, reply) => {
    try {
      const { provider } = request.params as { provider: string };
      const { state } = request.query as { state?: string };
      
      const authUrl = await authService.getAuthorizationUrl(provider, state);
      reply.send({ authUrl });
    } catch (error) {
      reply.status(400).send({ error: (error as Error).message });
    }
  });

  // OAuth Callback Handler
  fastify.get('/auth/oauth/:provider/callback', {
    schema: {
      params: z.object({ provider: z.string() }),
      querystring: OAuthCallbackSchema,
    },
  }, async (request, reply) => {
    try {
      const { provider } = request.params as { provider: string };
      const { code, state, error } = request.query as z.infer<typeof OAuthCallbackSchema>;

      if (error) {
        throw new Error(`OAuth error: ${error}`);
      }

      if (!code) {
        throw new Error('Authorization code not provided');
      }

      // Exchange code for token
      const tokenResponse = await authService.exchangeCodeForToken(provider, code, state);
      
      // Get user info
      const userInfo = await authService.getUserInfo(provider, tokenResponse.access_token);
      
      // Find or create user
      let user = await workspaceDAO.findUserByEmail(userInfo.email);
      if (!user) {
        user = await workspaceDAO.createUser({
          email: userInfo.email,
          name: userInfo.name,
          avatar: userInfo.picture,
          authProvider: provider,
          authProviderId: userInfo.id,
        });
      }

      // Create session
      const sessionId = await authService.createSession(user.id);
      
      // Generate JWT
      const jwt = await authService.generateJWT({
        userId: user.id,
        email: user.email,
        sessionId,
      });

      // Set secure cookie and redirect
      reply
        .setCookie('auth_token', jwt, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
        })
        .redirect('/dashboard');
    } catch (error) {
      reply.status(400).send({ error: (error as Error).message });
    }
  });

  // Traditional Login
  fastify.post('/auth/login', {
    schema: {
      body: LoginSchema,
      response: {
        200: z.object({ 
          token: z.string(),
          user: z.object({
            id: z.string(),
            email: z.string(),
            name: z.string(),
          }),
          mfaRequired: z.boolean().optional(),
        }),
        400: z.object({ error: z.string() }),
        401: z.object({ error: z.string() }),
      },
    },
  }, async (request, reply) => {
    try {
      const { email, password, mfaToken } = request.body;
      
      // Find user
      const user = await workspaceDAO.findUserByEmail(email);
      if (!user) {
        reply.status(401).send({ error: 'Invalid credentials' });
        return;
      }

      // Verify password (assuming password hash is stored)
      // This would need to be implemented in the user model
      const isValidPassword = true; // Placeholder
      if (!isValidPassword) {
        reply.status(401).send({ error: 'Invalid credentials' });
        return;
      }

      // Check MFA if enabled
      const mfaConfig = await authService.getMFAConfig?.(user.id);
      if (mfaConfig?.enabled) {
        if (!mfaToken) {
          reply.send({ 
            token: '', 
            user: { id: user.id, email: user.email, name: user.name },
            mfaRequired: true 
          });
          return;
        }

        const isMFAValid = await authService.verifyMFA(user.id, mfaToken);
        if (!isMFAValid) {
          reply.status(401).send({ error: 'Invalid MFA token' });
          return;
        }
      }

      // Create session and JWT
      const sessionId = await authService.createSession(user.id);
      const jwt = await authService.generateJWT({
        userId: user.id,
        email: user.email,
        sessionId,
      });

      reply.send({
        token: jwt,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        mfaRequired: false,
      });
    } catch (error) {
      reply.status(400).send({ error: (error as Error).message });
    }
  });

  // Logout
  fastify.post('/auth/logout', {
    preHandler: authenticate,
    schema: {
      response: {
        200: z.object({ success: z.boolean() }),
      },
    },
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const authHeader = request.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const payload = await authService.verifyJWT(token);
        await authService.revokeSession(payload.sessionId);
      }

      reply
        .clearCookie('auth_token')
        .send({ success: true });
    } catch (error) {
      reply.send({ success: true }); // Always succeed logout
    }
  });

  // Session Refresh
  fastify.post('/auth/refresh', {
    schema: {
      body: SessionRefreshSchema,
      response: {
        200: z.object({ token: z.string() }),
        401: z.object({ error: z.string() }),
      },
    },
  }, async (request, reply) => {
    try {
      const { sessionId } = request.body;
      
      const newSessionId = await authService.refreshSession(sessionId);
      const session = await authService.validateSession(newSessionId);
      
      if (!session) {
        reply.status(401).send({ error: 'Invalid session' });
        return;
      }

      const user = await workspaceDAO.findUserById(session.userId);
      if (!user) {
        reply.status(401).send({ error: 'User not found' });
        return;
      }

      const jwt = await authService.generateJWT({
        userId: user.id,
        email: user.email,
        sessionId: newSessionId,
      });

      reply.send({ token: jwt });
    } catch (error) {
      reply.status(401).send({ error: (error as Error).message });
    }
  });

  // MFA Setup
  fastify.post('/auth/mfa/enable', {
    preHandler: authenticate,
    schema: {
      response: {
        200: z.object({ 
          secret: z.string(),
          backupCodes: z.array(z.string()),
          qrCode: z.string(),
        }),
        400: z.object({ error: z.string() }),
      },
    },
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      if (!request.user) {
        reply.status(401).send({ error: 'Unauthorized' });
        return;
      }

      const { secret, backupCodes } = await authService.enableMFA(request.user.id);
      
      // Generate QR code URL for authenticator apps
      const qrCode = `otpauth://totp/PromptGraph:${request.user.email}?secret=${secret}&issuer=PromptGraph`;

      reply.send({ secret, backupCodes, qrCode });
    } catch (error) {
      reply.status(400).send({ error: (error as Error).message });
    }
  });

  // MFA Verification
  fastify.post('/auth/mfa/verify', {
    preHandler: authenticate,
    schema: {
      body: MFAVerificationSchema,
      response: {
        200: z.object({ valid: z.boolean() }),
        400: z.object({ error: z.string() }),
      },
    },
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      if (!request.user) {
        reply.status(401).send({ error: 'Unauthorized' });
        return;
      }

      const { token } = request.body;
      const isValid = await authService.verifyMFA(request.user.id, token);

      reply.send({ valid: isValid });
    } catch (error) {
      reply.status(400).send({ error: (error as Error).message });
    }
  });

  // MFA Disable
  fastify.post('/auth/mfa/disable', {
    preHandler: authenticate,
    schema: {
      response: {
        200: z.object({ success: z.boolean() }),
        400: z.object({ error: z.string() }),
      },
    },
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      if (!request.user) {
        reply.status(401).send({ error: 'Unauthorized' });
        return;
      }

      await authService.disableMFA(request.user.id);
      reply.send({ success: true });
    } catch (error) {
      reply.status(400).send({ error: (error as Error).message });
    }
  });

  // User Profile
  fastify.get('/auth/profile', {
    preHandler: authenticate,
    schema: {
      response: {
        200: z.object({
          id: z.string(),
          email: z.string(),
          name: z.string(),
          avatar: z.string().optional(),
          permissions: z.array(z.string()),
          workspaces: z.array(z.object({
            id: z.string(),
            name: z.string(),
            role: z.string(),
          })),
        }),
        401: z.object({ error: z.string() }),
      },
    },
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      if (!request.user) {
        reply.status(401).send({ error: 'Unauthorized' });
        return;
      }

      const user = await workspaceDAO.findUserById(request.user.id);
      if (!user) {
        reply.status(401).send({ error: 'User not found' });
        return;
      }

      const workspaces = await workspaceDAO.getUserWorkspaces(user.id);

      reply.send({
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        permissions: request.user.permissions,
        workspaces: workspaces.map(w => ({
          id: w.id,
          name: w.name,
          role: w.role,
        })),
      });
    } catch (error) {
      reply.status(400).send({ error: (error as Error).message });
    }
  });

  // Session Management
  fastify.get('/auth/sessions', {
    preHandler: authenticate,
    schema: {
      response: {
        200: z.array(z.object({
          sessionId: z.string(),
          createdAt: z.date(),
          lastActive: z.date(),
          userAgent: z.string(),
          ipAddress: z.string(),
        })),
        401: z.object({ error: z.string() }),
      },
    },
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      if (!request.user) {
        reply.status(401).send({ error: 'Unauthorized' });
        return;
      }

      const sessions = await authService.getUserSessions?.(request.user.id) || [];
      reply.send(sessions);
    } catch (error) {
      reply.status(400).send({ error: (error as Error).message });
    }
  });

  fastify.delete('/auth/sessions/:sessionId', {
    preHandler: authenticate,
    schema: {
      params: z.object({ sessionId: z.string() }),
      response: {
        200: z.object({ success: z.boolean() }),
        400: z.object({ error: z.string() }),
      },
    },
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const { sessionId } = request.params as { sessionId: string };
      await authService.revokeSession(sessionId);
      reply.send({ success: true });
    } catch (error) {
      reply.status(400).send({ error: (error as Error).message });
    }
  });
}

// Initialize OAuth providers from environment variables
async function initializeOAuthProviders(authService: AuthService) {
  const providers = ['google', 'github', 'microsoft', 'okta', 'auth0'];
  
  for (const provider of providers) {
    const clientId = process.env[`${provider.toUpperCase()}_CLIENT_ID`];
    const clientSecret = process.env[`${provider.toUpperCase()}_CLIENT_SECRET`];
    const redirectUri = process.env[`${provider.toUpperCase()}_REDIRECT_URI`];
    
    if (clientId && clientSecret && redirectUri) {
      await authService.registerOAuthProvider({
        provider: provider as any,
        clientId,
        clientSecret,
        redirectUri,
        scope: process.env[`${provider.toUpperCase()}_SCOPE`],
        domain: process.env[`${provider.toUpperCase()}_DOMAIN`],
      });
    }
  }
}