// Epic 11.2 User Profile Routes
// HTTP routes for user profile management and preferences

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { AuthenticationService } from '../AuthenticationService';
import { ProfileService } from '../services/ProfileService';
import multipart from '@fastify/multipart';

// Profile update schema
const profileUpdateSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).optional(),
  timezone: z.string().max(50).optional(),
  locale: z.string().max(10).optional()
});

// Preferences update schema
const preferencesUpdateSchema = z.object({
  category: z.string().min(1).max(50),
  settings: z.record(z.any())
});

// Notification preferences schema
const notificationPreferencesSchema = z.object({
  email: z.object({
    enabled: z.boolean(),
    frequency: z.enum(['immediate', 'daily', 'weekly', 'never']),
    types: z.object({
      security: z.boolean(),
      system: z.boolean(),
      updates: z.boolean(),
      marketing: z.boolean()
  }
  }),
  inApp: z.object({
    enabled: z.boolean(),
    types: z.object({
      security: z.boolean(),
      system: z.boolean(),
      updates: z.boolean(),
      mentions: z.boolean()
  }
  }),
  push: z.object({
    enabled: z.boolean(),
    types: z.object({
      security: z.boolean(),
      system: z.boolean(),
      updates: z.boolean(),
      mentions: z.boolean()
  }
  }),
  quietHours: z.object({
    enabled: z.boolean(),
    start: z.string().regex(/^\d{2}:\d{2}$/),
    end: z.string().regex(/^\d{2}:\d{2}$/),
    timezone: z.string()
  }
});

}
interface ProfileRouteContext {
  authService: AuthenticationService;
  profileService: ProfileService;
}
}

export async function profileRoutes(fastify: FastifyInstance, context: ProfileRouteContext) {
  const { authService, profileService } = context;

  // Register multipart support for file uploads
  await fastify.register(multipart, {
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB limit
    }
  });

  // Get user profile
  fastify.get('/profile', {
    preHandler: [fastify.authenticate],
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            profile: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                displayName: { type: 'string' },
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                bio: { type: 'string' },
                avatarUrl: { type: 'string' },
                timezone: { type: 'string' },
                locale: { type: 'string' },
                createdAt: { type: 'string' },
                updatedAt: { type: 'string' }
              }
  }
            completeness: {
              type: 'object',
              properties: {
                percentage: { type: 'number' },
                completedFields: { type: 'array', items: { type: 'string' } },
                missingFields: { type: 'array', items: { type: 'string' } }
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

      const profile = await profileService.getProfile(userId);
      const completeness = await profileService.getProfileCompleteness(userId);

      return reply.send({
        profile,
        completeness
      });
    } catch (error) {
      fastify.log.error('Get profile error:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to retrieve profile'
      });
    }
  });

  // Update user profile
  fastify.put<{
    Body: z.infer<typeof profileUpdateSchema>;
  }>('/profile', {
    preHandler: [fastify.authenticate],
    schema: {
      body: profileUpdateSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            profile: { type: 'object' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request.user as any)?.id;
      const profileData = request.body as z.infer<typeof profileUpdateSchema>;

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

      const profile = await profileService.updateProfile(userId, profileData, context);

      return reply.send({
        profile,
        message: 'Profile updated successfully'
      });
    } catch (error) {
      fastify.log.error('Update profile error:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to update profile'
      });
    }
  });

  // Upload profile image
  fastify.post('/profile/avatar', {
    preHandler: [fastify.authenticate],
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            avatarUrl: { type: 'string' },
            message: { type: 'string' }
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

      const data = await request.file();
      
      if (!data) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'No file uploaded'
        });
      }

      const buffer = await data.file.toBuffer();
      
      const imageData = {
        originalName: data.filename,
        mimeType: data.mimetype,
        size: buffer.length,
        buffer
      };

      const context = {
        ipAddress: request.ip,
        userAgent: request.headers['user-agent']
      };

      const result = await profileService.uploadProfileImage(userId, imageData, context);

      return reply.send({
        avatarUrl: result.avatarUrl,
        message: 'Profile image uploaded successfully'
      });
    } catch (error) {
      fastify.log.error('Upload profile image error:', error);
      return reply.status(400).send({
        error: 'Upload Failed',
        message: error.message || 'Failed to upload profile image'
      });
    }
  });

  // Delete profile image
  fastify.delete('/profile/avatar', {
    preHandler: [fastify.authenticate],
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' }
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

      const context = {
        ipAddress: request.ip,
        userAgent: request.headers['user-agent']
      };

      await profileService.deleteProfileImage(userId, context);

      return reply.send({
        message: 'Profile image deleted successfully'
      });
    } catch (error) {
      fastify.log.error('Delete profile image error:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to delete profile image'
      });
    }
  });

  // Get user preferences
  fastify.get('/preferences', {
    preHandler: [fastify.authenticate],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          category: { type: 'string' }
        }
  }
      response: {
        200: {
          type: 'object',
          properties: {
            preferences: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  category: { type: 'string' },
                  settings: { type: 'object' },
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
      const { category } = request.query as { category?: string };

      if (!userId) {
        return reply.status(401).send({
          error: 'Unauthorized',
          message: 'User authentication required'
        });
      }

      const preferences = await profileService.getPreferences(userId, category);

      return reply.send({
        preferences
      });
    } catch (error) {
      fastify.log.error('Get preferences error:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to retrieve preferences'
      });
    }
  });

  // Update user preferences
  fastify.put<{
    Body: z.infer<typeof preferencesUpdateSchema>;
  }>('/preferences', {
    preHandler: [fastify.authenticate],
    schema: {
      body: preferencesUpdateSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            preferences: { type: 'object' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request.user as any)?.id;
      const { category, settings } = request.body as z.infer<typeof preferencesUpdateSchema>;

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

      const preferences = await profileService.updatePreferences(userId, category, settings, context);

      return reply.send({
        preferences,
        message: 'Preferences updated successfully'
      });
    } catch (error) {
      fastify.log.error('Update preferences error:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to update preferences'
      });
    }
  });

  // Get notification preferences
  fastify.get('/preferences/notifications', {
    preHandler: [fastify.authenticate],
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            preferences: { type: 'object' }
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

      const preferences = await profileService.getNotificationPreferences(userId);

      return reply.send({
        preferences
      });
    } catch (error) {
      fastify.log.error('Get notification preferences error:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to retrieve notification preferences'
      });
    }
  });

  // Update notification preferences
  fastify.put<{
    Body: z.infer<typeof notificationPreferencesSchema>;
  }>('/preferences/notifications', {
    preHandler: [fastify.authenticate],
    schema: {
      body: notificationPreferencesSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            preferences: { type: 'object' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request.user as any)?.id;
      const preferencesData = request.body as z.infer<typeof notificationPreferencesSchema>;

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

      const preferences = await profileService.updateNotificationPreferences(userId, preferencesData, context);

      return reply.send({
        preferences,
        message: 'Notification preferences updated successfully'
      });
    } catch (error) {
      fastify.log.error('Update notification preferences error:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to update notification preferences'
      });
    }
  });

  // Search user profiles
  fastify.get('/profiles/search', {
    preHandler: [fastify.authenticate],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          q: { type: 'string', minLength: 1 },
          limit: { type: 'number', minimum: 1, maximum: 100, default: 20 },
          offset: { type: 'number', minimum: 0, default: 0 }
  }
        required: ['q']
  }
      response: {
        200: {
          type: 'object',
          properties: {
            profiles: {
              type: 'array',
              items: { type: 'object' }
  }
            total: { type: 'number' },
            pagination: {
              type: 'object',
              properties: {
                limit: { type: 'number' },
                offset: { type: 'number' },
                hasMore: { type: 'boolean' }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { q, limit = 20, offset = 0 } = request.query as {
        q: string;
        limit: number;
        offset: number;
      };

      const result = await profileService.searchProfiles(q, limit, offset);
      const hasMore = offset + limit < result.total;

      return reply.send({
        profiles: result.profiles,
        total: result.total,
        pagination: {
          limit,
          offset,
          hasMore
        }
      });
    } catch (error) {
      fastify.log.error('Search profiles error:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to search profiles'
      });
    }
  });

  // Get public profile (for other users to view)
  fastify.get('/profiles/:userId', {
    preHandler: [fastify.authenticate],
    schema: {
      params: {
        type: 'object',
        properties: {
          userId: { type: 'string', format: 'uuid' }
  }
        required: ['userId']
  }
      response: {
        200: {
          type: 'object',
          properties: {
            profile: { type: 'object' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { userId } = request.params as { userId: string };
      const currentUserId = (request.user as any)?.id;

      // Check if user is trying to view their own profile
      if (userId === currentUserId) {
        return reply.redirect(307, '/api/auth/profile');
      }

      const profile = await profileService.getProfile(userId);

      if (!profile) {
        return reply.status(404).send({
          error: 'Profile Not Found',
          message: 'User profile not found'
        });
      }

      // Return only public profile information
      const publicProfile = {
        id: profile.id,
        displayName: profile.displayName,
        firstName: profile.firstName,
        lastName: profile.lastName,
        bio: profile.bio,
        avatarUrl: profile.avatarUrl,
        createdAt: profile.createdAt
      };

      return reply.send({
        profile: publicProfile
      });
    } catch (error) {
      fastify.log.error('Get public profile error:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to retrieve profile'
      });
    }
  });

  // Delete user profile (soft delete)
  fastify.delete('/profile', {
    preHandler: [fastify.authenticate],
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' }
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

      const context = {
        ipAddress: request.ip,
        userAgent: request.headers['user-agent']
      };

      await profileService.deleteProfile(userId, context);

      return reply.send({
        message: 'Profile deleted successfully'
      });
    } catch (error) {
      fastify.log.error('Delete profile error:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to delete profile'
      });
    }
  });
}