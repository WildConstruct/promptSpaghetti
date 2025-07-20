// Epic 11 OAuth Routes
// HTTP routes for OAuth authentication flows

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { AuthenticationService } from '../AuthenticationService';
import { OAuthService } from '../services/OAuthService';
import { OAuthProvider } from '../types';

// OAuth authorization initiation schema
const oauthAuthSchema = z.object({
  provider: z.enum(['google', 'github', 'microsoft']),
  returnUrl: z.string().optional()
});

// OAuth callback schema
const oauthCallbackSchema = z.object({
  code: z.string(),
  state: z.string(),
  error: z.string().optional(),
  error_description: z.string().optional()
});

// OAuth account linking schema
const oauthLinkSchema = z.object({
  provider: z.enum(['google', 'github', 'microsoft']),
  code: z.string()
});

// OAuth account unlinking schema
const oauthUnlinkSchema = z.object({
  provider: z.enum(['google', 'github', 'microsoft'])
});

interface OAuthRouteContext {
  authService: AuthenticationService;
  oauthService: OAuthService;
}

export async function oauthRoutes(fastify: FastifyInstance, context: OAuthRouteContext) {
  const { authService, oauthService } = context;

  // OAuth authorization initiation
  fastify.get<{
    Querystring: z.infer<typeof oauthAuthSchema>;
  }>('/oauth/authorize', {
    schema: {
      querystring: oauthAuthSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            url: { type: 'string' },
            state: { type: 'string' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { provider, returnUrl } = request.query as z.infer<typeof oauthAuthSchema>;
      
      const context = {
        ipAddress: request.ip,
        userAgent: request.headers['user-agent']
      };

      const { url, state } = await oauthService.generateAuthorizationUrl(
        provider as OAuthProvider,
        returnUrl,
        context
      );

      return reply.send({ url, state });
    } catch (error) {
      fastify.log.error('OAuth authorization error:', error);
      return reply.status(400).send({
        error: 'OAuth Authorization Failed',
        message: error.message
      });
    }
  });

  // OAuth callback handler
  fastify.get<{
    Querystring: z.infer<typeof oauthCallbackSchema>;
    Params: { provider: string };
  }>('/oauth/callback/:provider', {
    schema: {
      params: {
        type: 'object',
        properties: {
          provider: { type: 'string', enum: ['google', 'github', 'microsoft'] }
        }
      },
      querystring: oauthCallbackSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
            user: { type: 'object' },
            expiresAt: { type: 'string' },
            isNewUser: { type: 'boolean' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { provider } = request.params as { provider: string };
      const { code, state, error, error_description } = request.query as z.infer<typeof oauthCallbackSchema>;

      // Handle OAuth errors
      if (error) {
        fastify.log.warn('OAuth callback error:', { error, error_description });
        return reply.status(400).send({
          error: 'OAuth Authorization Failed',
          message: error_description || error
        });
      }

      if (!code || !state) {
        return reply.status(400).send({
          error: 'Invalid OAuth Callback',
          message: 'Missing authorization code or state parameter'
        });
      }

      const context = {
        ipAddress: request.ip,
        userAgent: request.headers['user-agent']
      };

      const result = await oauthService.handleCallback(
        provider as OAuthProvider,
        code,
        state,
        context
      );

      // Set secure HTTP-only cookies for tokens
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        path: '/'
      };

      reply.setCookie('access_token', result.tokens.accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000 // 15 minutes
      });

      reply.setCookie('refresh_token', result.tokens.refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      return reply.send({
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
        user: result.user,
        expiresAt: result.tokens.expiresAt.toISOString(),
        isNewUser: result.isNewUser
      });
    } catch (error) {
      fastify.log.error('OAuth callback error:', error);
      return reply.status(400).send({
        error: 'OAuth Callback Failed',
        message: error.message
      });
    }
  });

  // Link OAuth account to existing user (requires authentication)
  fastify.post<{
    Body: z.infer<typeof oauthLinkSchema>;
  }>('/oauth/link', {
    preHandler: [fastify.authenticate], // JWT authentication middleware
    schema: {
      body: oauthLinkSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { provider, code } = request.body as z.infer<typeof oauthLinkSchema>;
      const userId = (request.user as any)?.id;

      if (!userId) {
        return reply.status(401).send({
          error: 'Unauthorized',
          message: 'User authentication required'
        });
      }

      const context = {
        ipAddress: request.ip,
        userAgent: request.headers['user-agent']
      };

      await oauthService.linkAccount(userId, provider as OAuthProvider, code, context);

      return reply.send({
        success: true,
        message: `Successfully linked ${provider} account`
      });
    } catch (error) {
      fastify.log.error('OAuth link error:', error);
      return reply.status(400).send({
        error: 'OAuth Link Failed',
        message: error.message
      });
    }
  });

  // Unlink OAuth account from user (requires authentication)
  fastify.post<{
    Body: z.infer<typeof oauthUnlinkSchema>;
  }>('/oauth/unlink', {
    preHandler: [fastify.authenticate], // JWT authentication middleware
    schema: {
      body: oauthUnlinkSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { provider } = request.body as z.infer<typeof oauthUnlinkSchema>;
      const userId = (request.user as any)?.id;

      if (!userId) {
        return reply.status(401).send({
          error: 'Unauthorized',
          message: 'User authentication required'
        });
      }

      const context = {
        ipAddress: request.ip,
        userAgent: request.headers['user-agent']
      };

      await oauthService.unlinkAccount(userId, provider as OAuthProvider, context);

      return reply.send({
        success: true,
        message: `Successfully unlinked ${provider} account`
      });
    } catch (error) {
      fastify.log.error('OAuth unlink error:', error);
      return reply.status(400).send({
        error: 'OAuth Unlink Failed',
        message: error.message
      });
    }
  });

  // Get user's linked OAuth accounts (requires authentication)
  fastify.get('/oauth/accounts', {
    preHandler: [fastify.authenticate], // JWT authentication middleware
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            accounts: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  provider: { type: 'string' },
                  email: { type: 'string' },
                  name: { type: 'string' },
                  picture: { type: 'string' },
                  createdAt: { type: 'string' },
                  updatedAt: { type: 'string' }
                }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request.user as any)?.id;

      if (!userId) {
        return reply.status(401).send({
          error: 'Unauthorized',
          message: 'User authentication required'
        });
      }

      const accounts = await oauthService.getUserOAuthAccounts(userId);

      return reply.send({
        accounts: accounts.map(account => ({
          provider: account.provider,
          email: account.email,
          name: account.name,
          picture: account.picture,
          createdAt: account.created_at,
          updatedAt: account.updated_at
        }))
      });
    } catch (error) {
      fastify.log.error('Get OAuth accounts error:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to retrieve OAuth accounts'
      });
    }
  });

  // Get available OAuth providers
  fastify.get('/oauth/providers', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            providers: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  displayName: { type: 'string' },
                  icon: { type: 'string' },
                  color: { type: 'string' }
                }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const providers = [
      {
        name: 'google',
        displayName: 'Google',
        icon: 'google',
        color: '#4285f4'
      },
      {
        name: 'github',
        displayName: 'GitHub',
        icon: 'github',
        color: '#333333'
      },
      {
        name: 'microsoft',
        displayName: 'Microsoft',
        icon: 'microsoft',
        color: '#0078d4'
      }
    ];

    return reply.send({ providers });
  });
}