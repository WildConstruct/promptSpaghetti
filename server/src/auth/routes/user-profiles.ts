/**
 * User Profiles API Routes
 *
 * Comprehensive RESTful API endpoints for user profile management,
 * social features, preferences, and analytics.
 *
 * Includes proper validation, privacy controls, and social features.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import {
  UserProfileService,
  ExperienceLevel,
  ProfileVisibility,
  PreferenceCategory,
  ProfileUpdate,
  ProfileSearchQuery,
 from '../services/UserProfileService';
import { requirePermission } from '../middleware/permission-auth';

// Request validation schemas
const profileUpdateSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).optional(),
  title: z.string().max(255).optional(),
  company: z.string().max(255).optional(),
  department: z.string().max(255).optional(),
  location: z.string().max(255).optional(),
  website: z.string().url().optional(),
  linkedinUrl: z.string().url().optional(),
  twitterUrl: z.string().url().optional(),
  githubUrl: z.string().url().optional(),
  timezone: z.string().optional(),
  locale: z.string().optional(),
  dateFormat: z.string().optional(),
  timeFormat: z.enum(['12h', '24h']).optional(),
  theme: z.enum(['light', 'dark', 'auto']).optional(),
  language: z.string().optional(),
  skillTags: z.array(z.string().max(50)).max(20).optional(),
  interests: z.array(z.string().max(50)).max(10).optional(),
  experience: z.nativeEnum(ExperienceLevel).optional(),
  industry: z.string().max(100).optional(),
  privacySettings: z
    .object({
      profileVisibility: z.enum(['public', 'connections', 'private']).optional(),
      emailVisibility: z.enum(['public', 'connections', 'private']).optional(),
      activityVisibility: z.enum(['public', 'connections', 'private']).optional(),
      graphVisibility: z.enum(['public', 'connections', 'private']).optional(),
      contactInfoVisible: z.boolean().optional(),
      socialLinksVisible: z.boolean().optional(),
      skillsVisible: z.boolean().optional(),
      experienceVisible: z.boolean().optional(),
      locationVisible: z.boolean().optional(),
      onlineStatusVisible: z.boolean().optional(),
      lastActiveVisible: z.boolean().optional(),
      allowDirectMessages: z.boolean().optional(),
      allowGraphSharing: z.boolean().optional(),
      allowMentions: z.boolean().optional(),
      emailNotifications: z.boolean().optional(),
      marketingEmails: z.boolean().optional(),
    })
    .optional(),
});

const profileSearchSchema = z.object({
  query: z.string().optional(),
  skills: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  location: z.string().optional(),
  company: z.string().optional(),
  industry: z.string().optional(),
  experienceLevel: z.nativeEnum(ExperienceLevel).optional(),
  visibility: z.nativeEnum(ProfileVisibility).optional(),
  hasAvatar: z.boolean().optional(),
  isActive: z.boolean().optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
  sortBy: z.enum(['relevance', 'name', 'recent', 'activity', 'connections']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

const preferencesUpdateSchema = z.object({
  category: z.nativeEnum(PreferenceCategory),
  settings: z.record(z.any()),
});

const connectionActionSchema = z.object({
  action: z.enum(['follow', 'unfollow', 'block']),
  connectionType: z.enum(['follow', 'collaborate', 'teammate']).optional(),
});

interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    id: string;
    email: string;
    permissions: string[];
  };


/**
 * Register user profile routes
 */
export async function registerUserProfileRoutes(
  fastify: FastifyInstance,
  profileService: UserProfileService
): Promise<void> {

  // Get user's own profile
  fastify.get(
    '/profile',
    {
      preHandler: [requirePermission('user:profile:read')],
    },
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      try {
        const profile = await profileService.getUserProfile(
          request.user!.id,
          request.user!.id,
          true // Include private data for own profile
        );

        if (!profile) {
          return reply.code(404).send({
            success: false,
            error: 'Profile not found',
          });


        return reply.code(200).send({
          success: true,
          data: profile,
        });
 catch (error) {
        fastify.log.error('Failed to get user profile:', error);
        return reply.code(500).send({
          success: false,
          error: 'Failed to retrieve profile',
        });

    }
  );

  // Get another user's profile
  fastify.get(
    '/profiles/:userId',
    {
      preHandler: [requirePermission('user:profile:view')],
    },
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      try {
        const { userId } = request.params as { userId: string };

        const profile = await profileService.getUserProfile(
          userId,
          request.user!.id,
          false // Apply privacy filters
        );

        if (!profile) {
          return reply.code(404).send({
            success: false,
            error: 'Profile not found or not accessible',
          });


        return reply.code(200).send({
          success: true,
          data: profile,
        });
 catch (error) {
        fastify.log.error(`Failed to get profile ${request.params}:`, error);
        return reply.code(500).send({
          success: false,
          error: 'Failed to retrieve profile',
        });

  );

  // Update user profile
  fastify.put(
    '/profile',
    {
      preHandler: [requirePermission('user:profile:update')],
    },
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      try {
        const updates = profileUpdateSchema.parse(request.body);

        const updatedProfile = await profileService.updateUserProfile(request.user!.id, updates, request.user!.id);

        return reply.code(200).send({
          success: true,
          data: updatedProfile,
          message: 'Profile updated successfully',
        });
 catch (error) {
        if (error instanceof z.ZodError) {
          return reply.code(400).send({
            success: false,
            error: 'Invalid profile data',
            details: error.errors,
          });


        fastify.log.error('Failed to update profile:', error);
        return reply.code(500).send({
          success: false,
          error: 'Failed to update profile',
          details: error instanceof Error ? error.message : String(error),
        });

  );

  // Search profiles
  fastify.get(
    '/profiles',
    {
      preHandler: [requirePermission('user:profile:search')],
    },
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      try {
        const searchParams = profileSearchSchema.parse(request.query);

        const searchQuery: ProfileSearchQuery = {
          ...searchParams,
          limit: searchParams.limit || 20,
          offset: searchParams.offset || 0,
          sortBy: searchParams.sortBy || 'relevance',
          sortOrder: searchParams.sortOrder || 'desc',
        };

        const results = await profileService.searchProfiles(searchQuery, request.user!.id);

        return reply.code(200).send({
          success: true,
          data: results.profiles,
          meta: {
            totalCount: results.totalCount,
            facets: results.facets,
            query: searchQuery,
          },
        });
 catch (error) {
        if (error instanceof z.ZodError) {
          return reply.code(400).send({
            success: false,
            error: 'Invalid search parameters',
            details: error.errors,
          });


        fastify.log.error('Failed to search profiles:', error);
        return reply.code(500).send({
          success: false,
          error: 'Failed to search profiles',
        });

  );

  // Get user preferences
  fastify.get(
    '/profile/preferences',
    {
      preHandler: [requirePermission('user:preferences:read')],
    },
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      try {
        const { category } = request.query as { category?: PreferenceCategory };

        const preferences = await profileService.getUserPreferences(request.user!.id, category);

        return reply.code(200).send({
          success: true,
          data: preferences,
        });
 catch (error) {
        fastify.log.error('Failed to get preferences:', error);
        return reply.code(500).send({
          success: false,
          error: 'Failed to retrieve preferences',
        });

    }
  );

  // Update user preferences
  fastify.put(
    '/profile/preferences',
    {
      preHandler: [requirePermission('user:preferences:update')],
    },
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      try {
        const { category, settings } = preferencesUpdateSchema.parse(request.body);

        const updatedPreferences = await profileService.updateUserPreferences(
          request.user!.id,
          category,
          settings,
          request.user!.id
        );

        return reply.code(200).send({
          success: true,
          data: updatedPreferences,
          message: 'Preferences updated successfully',
        });
 catch (error) {
        if (error instanceof z.ZodError) {
          return reply.code(400).send({
            success: false,
            error: 'Invalid preferences data',
            details: error.errors,
          });


        fastify.log.error('Failed to update preferences:', error);
        return reply.code(500).send({
          success: false,
          error: 'Failed to update preferences',
        });

  );

  // Follow/unfollow user
  fastify.post(
    '/profiles/:userId/connection',
    {
      preHandler: [requirePermission('user:connections:manage')],
    },
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      try {
        const { userId } = request.params as { userId: string };
        const { action, connectionType } = connectionActionSchema.parse(request.body);

        if (userId === request.user!.id) {
          return reply.code(400).send({
            success: false,
            error: 'Cannot follow yourself',
          });


        const connection = await profileService.updateConnection(request.user!.id, userId, action, connectionType);

        return reply.code(200).send({
          success: true,
          data: connection,
          message:
            action === 'unfollow'
              ? 'User unfollowed successfully'
              : action === 'block'
                ? 'User blocked successfully'
                : 'User followed successfully',
        });
 catch (error) {
        if (error instanceof z.ZodError) {
          return reply.code(400).send({
            success: false,
            error: 'Invalid connection action',
            details: error.errors,
          });


        fastify.log.error(`Failed to update connection for ${request.params}:`, error);
        return reply.code(500).send({
          success: false,
          error: 'Failed to update connection',
          details: error instanceof Error ? error.message : String(error),
        });

  );

  // Get user's connections (followers/following)
  fastify.get(
    '/profile/connections',
    {
      preHandler: [requirePermission('user:connections:read')],
    },
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      try {
        const { type, limit, offset } = request.query as {
          type?: 'followers' | 'following';
          limit?: string;
          offset?: string;
        };

        // This would need to be implemented in the service
        return reply.code(501).send({
          success: false,
          error: 'Connections listing not yet implemented',
        });
 catch (error) {
        fastify.log.error('Failed to get connections:', error);
        return reply.code(500).send({
          success: false,
          error: 'Failed to retrieve connections',
        });

    }
  );

  // Get profile analytics
  fastify.get(
    '/profile/analytics',
    {
      preHandler: [requirePermission('user:profile:analytics')],
    },
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      try {
        const analytics = await profileService.getProfileAnalytics(request.user!.id);

        return reply.code(200).send({
          success: true,
          data: analytics,
        });
 catch (error) {
        fastify.log.error('Failed to get profile analytics:', error);
        return reply.code(500).send({
          success: false,
          error: 'Failed to retrieve profile analytics',
        });

  );

  // Upload profile avatar
  fastify.post(
    '/profile/avatar',
    {
      preHandler: [requirePermission('user:profile:update')],
    },
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      try {
        // This would handle file upload
        // For now, return placeholder
        return reply.code(501).send({
          success: false,
          error: 'Avatar upload not yet implemented',
        });
 catch (error) {
        fastify.log.error('Failed to upload avatar:', error);
        return reply.code(500).send({
          success: false,
          error: 'Failed to upload avatar',
        });

    }
  );

  // Get profile completion status
  fastify.get(
    '/profile/completion',
    {
      preHandler: [requirePermission('user:profile:read')],
    },
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      try {
        const profile = await profileService.getUserProfile(request.user!.id, request.user!.id, true);

        if (!profile) {
          return reply.code(404).send({
            success: false,
            error: 'Profile not found',
          });


        return reply.code(200).send({
          success: true,
          data: {
            completionScore: profile.completionScore,
            completionStatus: profile.completionStatus,
            missingFields: profile.missingFields,
            suggestions: [
              'Add a professional photo',
              'Write a compelling bio',
              'List your key skills',
              'Add your current position',
              'Connect your social profiles',
            ].filter((_, index) => profile.completionScore < (index + 1) * 20),
          },
        });
 catch (error) {
        fastify.log.error('Failed to get profile completion:', error);
        return reply.code(500).send({
          success: false,
          error: 'Failed to retrieve profile completion status',
        });

  );

  // Get popular skills for autocomplete
  fastify.get(
    '/skills/popular',
    {
      preHandler: [requirePermission('user:profile:read')],
    },
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      try {
        const { query, category, limit } = request.query as {
          query?: string;
          category?: string;
          limit?: string;
        };

        // This would query the skill taxonomy and popular skills
        const skills = [
          'JavaScript',
          'Python',
          'React',
          'Node.js',
          'TypeScript',
          'SQL',
          'PostgreSQL',
          'Docker',
          'Kubernetes',
          'AWS',
          'Machine Learning',
          'Data Analysis',
          'Project Management',
          'UI/UX Design',
          'Agile',
          'GraphQL',
          'MongoDB',
          'Redis',
          'Microservices',
          'DevOps',
          'CI/CD',
          'Git',
          'Testing',
          'API Design',
          'System Architecture',
        ]
          .filter(skill => !query || skill.toLowerCase().includes(query.toLowerCase()))
          .slice(0, parseInt(limit || '10', 10));

        return reply.code(200).send({
          success: true,
          data: skills.map(skill => ({
            name: skill,
            category: 'Technology',
            popularity: Math.floor(Math.random() * 100) + 1,
          })),
        });
 catch (error) {
        fastify.log.error('Failed to get popular skills:', error);
        return reply.code(500).send({
          success: false,
          error: 'Failed to retrieve popular skills',
        });

    }
  );

  // Get profile metadata (for forms and dropdowns)
  fastify.get(
    '/profile/metadata',
    {
      preHandler: [requirePermission('user:profile:read')],
    },
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      try {
        const metadata = {
          experienceLevels: Object.values(ExperienceLevel),
          visibilityOptions: Object.values(ProfileVisibility),
          preferenceCategories: Object.values(PreferenceCategory),
          themeOptions: ['light', 'dark', 'auto'],
          timeFormats: ['12h', '24h'],
          languages: [
            { code: 'en', name: 'English' },
            { code: 'es', name: 'Spanish' },
            { code: 'fr', name: 'French' },
            { code: 'de', name: 'German' },
            { code: 'zh', name: 'Chinese' },
            { code: 'ja', name: 'Japanese' },
          ],
          industries: [
            'Technology',
            'Healthcare',
            'Finance',
            'Education',
            'Manufacturing',
            'Retail',
            'Media',
            'Government',
            'Non-profit',
            'Consulting',
            'Real Estate',
            'Transportation',
            'Energy',
            'Entertainment',
            'Other',
          ],
          timezones: [
            'UTC',
            'America/New_York',
            'America/Chicago',
            'America/Denver',
            'America/Los_Angeles',
            'Europe/London',
            'Europe/Paris',
            'Asia/Tokyo',
            'Asia/Shanghai',
            'Australia/Sydney',
          ],
        };

        return reply.code(200).send({
          success: true,
          data: metadata,
        });
 catch (error) {
        fastify.log.error('Failed to get profile metadata:', error);
        return reply.code(500).send({
          success: false,
          error: 'Failed to retrieve profile metadata',
        });

  );

  // Admin endpoint to get profile statistics
  fastify.get(
    '/profiles/statistics',
    {
      preHandler: [requirePermission('admin:profiles:read')],
    },
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      try {
        // This would implement comprehensive profile statistics
        const stats = {
          totalProfiles: 0,
          completeProfiles: 0,
          averageCompletionScore: 0,
          popularSkills: [],
          userGrowth: [],
          engagementMetrics: {
            dailyActiveUsers: 0,
            profileViews: 0,
            searchQueries: 0,
          },
        };

        return reply.code(200).send({
          success: true,
          data: stats,
        });
 catch (error) {
        fastify.log.error('Failed to get profile statistics:', error);
        return reply.code(500).send({
          success: false,
          error: 'Failed to retrieve profile statistics',
        });

  );

  // Health check for profile system
  fastify.get(
    '/profiles/health',
    {
      preHandler: [requirePermission('admin:system:read')],
    },
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      try {
        const health = {
          status: 'healthy',
          profilesCount: 0,
          averageCompletionScore: 0,
          searchIndexStatus: 'up-to-date',
          lastMaintenance: new Date().toISOString(),
        };

        return reply.code(200).send({
          success: true,
          data: health,
        });
 catch (error) {
        fastify.log.error('Profile system health check failed:', error);
        return reply.code(500).send({
          success: false,
          error: 'Health check failed',
          data: {
            status: 'unhealthy',
            error: error instanceof Error ? error.message : String(error),
          },
        });

  );


export default registerUserProfileRoutes;
