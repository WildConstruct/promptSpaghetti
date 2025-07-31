/**
 * User Profile Service
 * 
 * Comprehensive user profile management system with rich profiles,
 * preferences, customization options, and privacy controls.
 * 
 * Features:
 * - Complete profile management with validation
 * - User preferences and settings
 * - Avatar and media management
 * - Privacy and visibility controls
 * - Profile analytics and insights
 * - Social features and connections
 * - Profile completion tracking
 */

import { Database } from '../database/DatabaseService';
import { AuditService } from './AuditService';
import { ActivityHistoryService, ActivityType } from './ActivityHistoryService';

}
}
export interface UserProfile {
  id: string;
  userId: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  title?: string;
  company?: string;
  department?: string;
  location?: string;
  website?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  githubUrl?: string;
  avatarUrl?: string;
  coverImageUrl?: string;
  timezone: string;
  locale: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  theme: 'light' | 'dark' | 'auto';
  language: string;
  
  // Professional info
  skillTags: string[];
  interests: string[];
  experience: ExperienceLevel;
  industry?: string;
  
  // Profile completion
  completionScore: number;
  completionStatus: ProfileCompletionStatus;
  missingFields: string[];
  
  // Privacy settings
  visibility: ProfileVisibility;
  privacySettings: PrivacySettings;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastViewedAt?: Date;
  viewCount: number;
  
  // Social features
  followersCount: number;
  followingCount: number;
  isFollowing?: boolean;
  mutualConnectionsCount?: number;
}
}
}

}
}
export interface PrivacySettings {
  profileVisibility: 'public' | 'connections' | 'private';
  emailVisibility: 'public' | 'connections' | 'private';
  activityVisibility: 'public' | 'connections' | 'private';
  graphVisibility: 'public' | 'connections' | 'private';
  contactInfoVisible: boolean;
  socialLinksVisible: boolean;
  skillsVisible: boolean;
  experienceVisible: boolean;
  locationVisible: boolean;
  onlineStatusVisible: boolean;
  lastActiveVisible: boolean;
  allowDirectMessages: boolean;
  allowGraphSharing: boolean;
  allowMentions: boolean;
  emailNotifications: boolean;
  marketingEmails: boolean;
}
}
}

}
}
export interface UserPreferences {
  id: string;
  userId: string;
  category: PreferenceCategory;
  settings: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
}
}

}
}
export interface ProfileCompletionStatus {
  overall: number;
  sections: {
    basic: number;
    professional: number;
    contact: number;
    social: number;
    preferences: number;
}
}
  };
  nextSteps: string[];
  completedSteps: string[];
}

export enum ExperienceLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

export enum ProfileVisibility {
  PUBLIC = 'public',
  CONNECTIONS = 'connections',
  PRIVATE = 'private'
}

export enum PreferenceCategory {
  NOTIFICATIONS = 'notifications',
  PRIVACY = 'privacy',
  INTERFACE = 'interface',
  COLLABORATION = 'collaboration',
  ANALYTICS = 'analytics',
  INTEGRATIONS = 'integrations',
  ACCESSIBILITY = 'accessibility'
}

}
}
export interface UserConnection {
  id: string;
  followerId: string;
  followingId: string;
  status: 'pending' | 'accepted' | 'blocked';
  connectionType: 'follow' | 'collaborate' | 'teammate';
  createdAt: Date;
  acceptedAt?: Date;
}
}
}

}
}
export interface ProfileSearchQuery {
  query?: string;
  skills?: string[];
  interests?: string[];
  location?: string;
  company?: string;
  industry?: string;
  experienceLevel?: ExperienceLevel;
  visibility?: ProfileVisibility;
  hasAvatar?: boolean;
  isActive?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: 'relevance' | 'name' | 'recent' | 'activity' | 'connections';
  sortOrder?: 'asc' | 'desc';
}
}
}

}
}
export interface ProfileSearchResult {
  profiles: UserProfile[];
  totalCount: number;
  facets: {
}
}
    skills: Array<{ skill: string; count: number }>;
    locations: Array<{ location: string; count: number }>;
    companies: Array<{ company: string; count: number }>;
    industries: Array<{ industry: string; count: number }>;
    experienceLevels: Array<{ level: ExperienceLevel; count: number }>;
  };
}

}
}
export interface ProfileAnalytics {
  userId: string;
  profileViews: {
    total: number;
    unique: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
}
}
  };
  viewerDemographics: {
    byLocation: Record<string, number>;
    byCompany: Record<string, number>;
    byIndustry: Record<string, number>;
  };
  connectionGrowth: Array<{
    date: string;
    followers: number;
    following: number;
  }>;
  skillPopularity: Array<{
    skill: string;
    mentions: number;
    growth: number;
  }>;
  engagementMetrics: {
    profileCompleteness: number;
    lastUpdated: Date;
    updateFrequency: number;
    socialEngagement: number;
  };
}

}
}
export interface ProfileUpdate {
  displayName?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  title?: string;
  company?: string;
  department?: string;
  location?: string;
  website?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  githubUrl?: string;
  timezone?: string;
  locale?: string;
  dateFormat?: string;
  timeFormat?: '12h' | '24h';
  theme?: 'light' | 'dark' | 'auto';
  language?: string;
  skillTags?: string[];
  interests?: string[];
  experience?: ExperienceLevel;
  industry?: string;
  privacySettings?: Partial<PrivacySettings>;
}
}
}

export class UserProfileService {
  private db: Database;
  private auditService: AuditService;
  private activityService: ActivityHistoryService;

  constructor(
    db: Database, 
    auditService: AuditService,
    activityService: ActivityHistoryService
  ) {
    this.db = db;
    this.auditService = auditService;
    this.activityService = activityService;
  }

  /**
   * Get a user's complete profile
   */
  async getUserProfile(
    userId: string, 
    viewerId?: string,
    includePrivate: boolean = false
  ): Promise<UserProfile | null> {

    const query = `
      SELECT 
        p.*,
        u.email,
        u.created_at as user_created_at,
        u.last_login_at,
        COALESCE(followers.count, 0) as followers_count,
        COALESCE(following.count, 0) as following_count,
        CASE WHEN conn.id IS NOT NULL THEN true ELSE false END as is_following
      FROM user_profiles p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN (
        SELECT following_id, COUNT(*) as count
        FROM user_connections 
        WHERE status = 'accepted'
        GROUP BY following_id
      ) followers ON p.user_id = followers.following_id
      LEFT JOIN (
        SELECT follower_id, COUNT(*) as count
        FROM user_connections 
        WHERE status = 'accepted'
        GROUP BY follower_id
      ) following ON p.user_id = following.follower_id
      LEFT JOIN user_connections conn ON (
        conn.follower_id = $2 AND conn.following_id = p.user_id AND conn.status = 'accepted'

      WHERE p.user_id = $1
    `;

    const result = await this.db.query(query, [userId, viewerId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    
    // Check if viewer has permission to see this profile
    if (!includePrivate && !this.canViewProfile(row, viewerId, userId)) {
      return null;
    }

    const profile = this.mapProfileRow(row);
    
    // Record profile view if viewer is different from profile owner
    if (viewerId && viewerId !== userId) {
      await this.recordProfileView(userId, viewerId);
    }

    // Apply privacy filtering
    if (!includePrivate && viewerId !== userId) {
      this.applyPrivacyFilters(profile, viewerId);
    }

    return profile;
  }

  /**
   * Create or update a user profile
   */
  async updateUserProfile(
    userId: string, 
    updates: ProfileUpdate,
    updatedBy: string
  ): Promise<UserProfile> {

    // Validate the updates
    this.validateProfileUpdate(updates);

    // Get existing profile or create new one
    let existingProfile = await this.getUserProfile(userId, userId, true);
    
    if (!existingProfile) {
      existingProfile = await this.createDefaultProfile(userId);
    }

    // Build update query
    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && key !== 'privacySettings') {
        const columnName = this.camelToSnakeCase(key);
        updateFields.push(`${columnName} = $${paramIndex++}`);
        values.push(value);
      }
    });

    if (updateFields.length > 0) {
      updateFields.push('updated_at = NOW()');
      values.push(userId);

      const query = `
        UPDATE user_profiles 
        SET ${updateFields.join(', ')}
        WHERE user_id = $${paramIndex}
        RETURNING *
      `;

      await this.db.query(query, values);
    }

    // Handle privacy settings separately
    if (updates.privacySettings) {
      await this.updatePrivacySettings(userId, updates.privacySettings);
    }

    // Record activity
    await this.activityService.recordActivity(
      updatedBy,
      ActivityType.PROFILE_UPDATED,
      {
        resourceName: `User profile for ${userId}`,
        changeType: 'update',
        previousValue: existingProfile,
        newValue: updates,
        success: true
  }
      { correlationId: userId }
    );

    await this.auditService.logAction(updatedBy, 'user_profile', 'profile_updated', {
      userId,
      updatedFields: Object.keys(updates),
      profileCompletionBefore: existingProfile.completionScore,
      profileCompletionAfter: await this.calculateCompletionScore(userId)
    });

    // Return updated profile
    const updatedProfile = await this.getUserProfile(userId, userId, true);
    return updatedProfile!;
  }

  /**
   * Search user profiles
   */
  async searchProfiles(
    query: ProfileSearchQuery,
    searcherId?: string
  ): Promise<ProfileSearchResult> {

    const conditions = [];
    const values = [];
    let paramIndex = 1;

    // Base visibility filter
    conditions.push(`(
      p.visibility = 'public' OR 
      (p.visibility = 'connections' AND EXISTS (
        SELECT 1 FROM user_connections 
        WHERE follower_id = $${paramIndex} AND following_id = p.user_id AND status = 'accepted'
      ))
    )`);
    values.push(searcherId || null);
    paramIndex++;

    // Text search
    if (query.query) {
      conditions.push(`(
        p.display_name ILIKE $${paramIndex} OR 
        p.first_name ILIKE $${paramIndex} OR 
        p.last_name ILIKE $${paramIndex} OR 
        p.bio ILIKE $${paramIndex} OR
        p.title ILIKE $${paramIndex} OR
        p.company ILIKE $${paramIndex}
      )`);
      values.push(`%${query.query}%`);
      paramIndex++;
    }

    // Skills filter
    if (query.skills && query.skills.length > 0) {
      conditions.push(`p.skill_tags && $${paramIndex++}`);
      values.push(query.skills);
    }

    // Location filter
    if (query.location) {
      conditions.push(`p.location ILIKE $${paramIndex++}`);
      values.push(`%${query.location}%`);
    }

    // Company filter
    if (query.company) {
      conditions.push(`p.company ILIKE $${paramIndex++}`);
      values.push(`%${query.company}%`);
    }

    // Industry filter
    if (query.industry) {
      conditions.push(`p.industry = $${paramIndex++}`);
      values.push(query.industry);
    }

    // Experience level filter
    if (query.experienceLevel) {
      conditions.push(`p.experience = $${paramIndex++}`);
      values.push(query.experienceLevel);
    }

    // Avatar filter
    if (query.hasAvatar !== undefined) {
      if (query.hasAvatar) {
        conditions.push('p.avatar_url IS NOT NULL');
      } else {
        conditions.push('p.avatar_url IS NULL');
      }
    }

    // Active users filter
    if (query.isActive) {
      conditions.push('u.last_login_at > NOW() - INTERVAL \'30 days\'');
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as count 
      FROM user_profiles p
      JOIN users u ON p.user_id = u.id
      ${whereClause}
    `;
    const countResult = await this.db.query(countQuery, values);
    const totalCount = parseInt(countResult.rows[0].count);

    // Get profiles with pagination and sorting
    const sortBy = query.sortBy || 'relevance';
    const sortOrder = query.sortOrder || 'desc';
    const limit = Math.min(query.limit || 20, 100);
    const offset = query.offset || 0;

    let orderByClause: string;
    switch (sortBy) {
    case 'name':
      orderByClause = `ORDER BY p.display_name ${sortOrder}`;
      break;
    case 'recent':
      orderByClause = `ORDER BY p.updated_at ${sortOrder}`;
      break;
    case 'activity':
      orderByClause = `ORDER BY u.last_login_at ${sortOrder}`;
      break;
    case 'connections':
      orderByClause = `ORDER BY followers_count ${sortOrder}`;
      break;
    case 'relevance':
    default:
      // Simple relevance scoring
      orderByClause = `ORDER BY (
          CASE WHEN p.avatar_url IS NOT NULL THEN 1 ELSE 0 END +
          CASE WHEN p.bio IS NOT NULL THEN 1 ELSE 0 END +
          CASE WHEN array_length(p.skill_tags, 1) > 0 THEN 1 ELSE 0 END +
          p.completion_score / 100.0
        ) ${sortOrder}`;
      break;
    }

    const dataQuery = `
      SELECT 
        p.*,
        u.email,
        COALESCE(followers.count, 0) as followers_count,
        COALESCE(following.count, 0) as following_count
      FROM user_profiles p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN (
        SELECT following_id, COUNT(*) as count
        FROM user_connections 
        WHERE status = 'accepted'
        GROUP BY following_id
      ) followers ON p.user_id = followers.following_id
      LEFT JOIN (
        SELECT follower_id, COUNT(*) as count
        FROM user_connections 
        WHERE status = 'accepted'
        GROUP BY follower_id
      ) following ON p.user_id = following.follower_id
      ${whereClause}
      ${orderByClause}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    
    values.push(limit, offset);
    const dataResult = await this.db.query(dataQuery, values);

    const profiles = dataResult.rows.map(row => {
      const profile = this.mapProfileRow(row);
      // Apply privacy filtering for search results
      this.applyPrivacyFilters(profile, searcherId);
      return profile;
    });

    // Generate facets for filtering
    const facets = await this.generateSearchFacets(whereClause, values);

    return {
      profiles,
      totalCount,
      facets
    };
  }

  /**
   * Get user preferences by category
   */
  async getUserPreferences(userId: string, category?: PreferenceCategory): Promise<UserPreferences[]> {

    let query = 'SELECT * FROM user_preferences WHERE user_id = $1';
    const values = [userId];

    if (category) {
      query += ' AND category = $2';
      values.push(category);
    }

    query += ' ORDER BY category';

    const result = await this.db.query(query, values);
    return result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      category: row.category as PreferenceCategory,
      settings: row.settings,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  /**
   * Update user preferences
   */
  async updateUserPreferences(
    userId: string,
    category: PreferenceCategory,
    settings: Record<string, any>,
    updatedBy: string
  ): Promise<UserPreferences> {

    const query = `
      INSERT INTO user_preferences (user_id, category, settings)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, category)
      DO UPDATE SET settings = $3, updated_at = NOW()
      RETURNING *
    `;

    const result = await this.db.query(query, [userId, category, JSON.stringify(settings)]);
    
    await this.activityService.recordActivity(
      updatedBy,
      ActivityType.PROFILE_UPDATED,
      {
        resourceName: `User preferences: ${category}`,
        changeType: 'update',
        newValue: settings,
        success: true
  }
      { correlationId: userId }
    );

    return {
      id: result.rows[0].id,
      userId: result.rows[0].user_id,
      category: result.rows[0].category as PreferenceCategory,
      settings: result.rows[0].settings,
      createdAt: result.rows[0].created_at,
      updatedAt: result.rows[0].updated_at
    };
  }

  /**
   * Follow or unfollow a user
   */
  async updateConnection(
    followerId: string,
    followingId: string,
    action: 'follow' | 'unfollow' | 'block',
    connectionType: 'follow' | 'collaborate' | 'teammate' = 'follow'
  ): Promise<UserConnection | null> {

    if (followerId === followingId) {
      throw new Error('Cannot follow yourself');
    }

    if (action === 'unfollow') {
      await this.db.query(
        'DELETE FROM user_connections WHERE follower_id = $1 AND following_id = $2',
        [followerId, followingId]
      );
      
      await this.activityService.recordActivity(
        followerId,
        ActivityType.COLLABORATION_LEFT,
        {
          resourceName: 'User connection',
          resourceId: followingId,
          changeType: 'delete',
          success: true
        }
      );

      return null;
    }

    const status = action === 'block' ? 'blocked' : 'accepted';
    
    const query = `
      INSERT INTO user_connections (follower_id, following_id, status, connection_type)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (follower_id, following_id)
      DO UPDATE SET status = $3, connection_type = $4, updated_at = NOW()
      RETURNING *
    `;

    const result = await this.db.query(query, [followerId, followingId, status, connectionType]);
    
    await this.activityService.recordActivity(
      followerId,
      action === 'follow' ? ActivityType.COLLABORATION_JOINED : ActivityType.SECURITY_VIOLATION,
      {
        resourceName: 'User connection',
        resourceId: followingId,
        changeType: action === 'follow' ? 'create' : 'update',
        success: true
      }
    );

    return {
      id: result.rows[0].id,
      followerId: result.rows[0].follower_id,
      followingId: result.rows[0].following_id,
      status: result.rows[0].status,
      connectionType: result.rows[0].connection_type,
      createdAt: result.rows[0].created_at,
      acceptedAt: result.rows[0].accepted_at
    };
  }

  /**
   * Get profile analytics
   */
  async getProfileAnalytics(userId: string): Promise<ProfileAnalytics> {

    // This would implement comprehensive analytics
    // For now, return basic placeholder data
    
    const analytics: ProfileAnalytics = {
      userId,
      profileViews: {
        total: 0,
        unique: 0,
        today: 0,
        thisWeek: 0,
        thisMonth: 0
  }
      viewerDemographics: {
        byLocation: {},
        byCompany: {},
        byIndustry: {}
  }
      connectionGrowth: [],
      skillPopularity: [],
      engagementMetrics: {
        profileCompleteness: 0,
        lastUpdated: new Date(),
        updateFrequency: 0,
        socialEngagement: 0
      }
    };

    return analytics;
  }

  /**
   * Helper methods
   */
  
  private async createDefaultProfile(userId: string): Promise<UserProfile> {

    // Get user info
    const userResult = await this.db.query(
      'SELECT email, created_at FROM users WHERE id = $1',
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }

    const user = userResult.rows[0];
    
    // Create default profile
    const query = `
      INSERT INTO user_profiles (
        user_id, timezone, locale, date_format, time_format, theme, language,
        skill_tags, interests, experience, completion_score, visibility
      ) VALUES (
        $1, 'UTC', 'en-US', 'MM/dd/yyyy', '12h', 'light', 'en',
        '{}', '{}', 'beginner', 10, 'public'

      RETURNING *
    `;

    const result = await this.db.query(query, [userId]);
    
    return this.mapProfileRow({
      ...result.rows[0],
      email: user.email,
      user_created_at: user.created_at,
      followers_count: 0,
      following_count: 0,
      is_following: false
    });
  }

  private validateProfileUpdate(updates: ProfileUpdate): void {
    // Validate URLs
    const urlFields = ['website', 'linkedinUrl', 'twitterUrl', 'githubUrl'];
    urlFields.forEach(field => {
      const value = updates[field as keyof ProfileUpdate] as string;
      if (value && !this.isValidUrl(value)) {
        throw new Error(`Invalid URL for field: ${field}`);
      }
    });

    // Validate skill tags
    if (updates.skillTags && updates.skillTags.length > 20) {
      throw new Error('Maximum 20 skill tags allowed');
    }

    // Validate bio length
    if (updates.bio && updates.bio.length > 500) {
      throw new Error('Bio must be 500 characters or less');
    }
  }

  private async calculateCompletionScore(userId: string): Promise<number> {

    const profile = await this.getUserProfile(userId, userId, true);
    if (!profile) return 0;

    let score = 10; // Base score

    // Basic info (40 points)
    if (profile.displayName) score += 10;
    if (profile.firstName && profile.lastName) score += 10;
    if (profile.bio) score += 20;

    // Professional info (30 points)
    if (profile.title) score += 10;
    if (profile.company) score += 10;
    if (profile.skillTags.length > 0) score += 10;

    // Contact/Social (20 points)
    if (profile.location) score += 5;
    if (profile.website) score += 5;
    if (profile.linkedinUrl || profile.twitterUrl || profile.githubUrl) score += 10;

    // Avatar and customization (10 points)
    if (profile.avatarUrl) score += 10;

    return Math.min(score, 100);
  }

  private canViewProfile(profileRow: any, viewerId?: string, profileUserId?: string): boolean {
    if (!viewerId) {
      return profileRow.visibility === 'public';
    }

    if (viewerId === profileUserId) {
      return true; // Own profile
    }

    if (profileRow.visibility === 'public') {
      return true;
    }

    if (profileRow.visibility === 'connections') {
      // Would need to check if they're connected
      return false; // Simplified for now
    }

    return false; // Private profile
  }

  private applyPrivacyFilters(profile: UserProfile, viewerId?: string): void {
    if (!viewerId || viewerId === profile.userId) {
      return; // No filtering for own profile
    }

    // Apply privacy settings - simplified version
    const settings = profile.privacySettings;
    
    if (!settings.contactInfoVisible) {
      profile.website = undefined;
      profile.location = undefined;
    }

    if (!settings.socialLinksVisible) {
      profile.linkedinUrl = undefined;
      profile.twitterUrl = undefined;
      profile.githubUrl = undefined;
    }

    if (!settings.skillsVisible) {
      profile.skillTags = [];
    }

    if (!settings.experienceVisible) {
      profile.title = undefined;
      profile.company = undefined;
      profile.department = undefined;
      profile.industry = undefined;
    }
  }

  private async recordProfileView(profileUserId: string, viewerId: string): Promise<void> {

    // Update view count
    await this.db.query(
      'UPDATE user_profiles SET view_count = view_count + 1, last_viewed_at = NOW() WHERE user_id = $1',
      [profileUserId]
    );

    // Record activity
    await this.activityService.recordActivity(
      viewerId,
      ActivityType.PROFILE_UPDATED, // Using existing type for now
      {
        resourceName: 'User profile',
        resourceId: profileUserId,
        changeType: 'view',
        success: true
      }
    );
  }

  private async updatePrivacySettings(userId: string, settings: Partial<PrivacySettings>): Promise<void> {

    // Get current settings
    const currentPrefs = await this.getUserPreferences(userId, PreferenceCategory.PRIVACY);
    const currentSettings = currentPrefs.length > 0 ? currentPrefs[0].settings : {};

    // Merge with updates
    const mergedSettings = { ...currentSettings, ...settings };

    await this.updateUserPreferences(
      userId,
      PreferenceCategory.PRIVACY,
      mergedSettings,
      userId
    );
  }

  private async generateSearchFacets(whereClause: string, values: any[]): Promise<any> {

    // Generate facets for search filtering
    // This would implement actual facet queries
    return {
      skills: [],
      locations: [],
      companies: [],
      industries: [],
      experienceLevels: []
    };
  }

  private mapProfileRow(row: any): UserProfile {
    return {
      id: row.id,
      userId: row.user_id,
      displayName: row.display_name,
      firstName: row.first_name,
      lastName: row.last_name,
      bio: row.bio,
      title: row.title,
      company: row.company,
      department: row.department,
      location: row.location,
      website: row.website,
      linkedinUrl: row.linkedin_url,
      twitterUrl: row.twitter_url,
      githubUrl: row.github_url,
      avatarUrl: row.avatar_url,
      coverImageUrl: row.cover_image_url,
      timezone: row.timezone || 'UTC',
      locale: row.locale || 'en-US',
      dateFormat: row.date_format || 'MM/dd/yyyy',
      timeFormat: row.time_format || '12h',
      theme: row.theme || 'light',
      language: row.language || 'en',
      skillTags: row.skill_tags || [],
      interests: row.interests || [],
      experience: row.experience || ExperienceLevel.BEGINNER,
      industry: row.industry,
      completionScore: row.completion_score || 0,
      completionStatus: this.calculateCompletionStatus(row),
      missingFields: this.calculateMissingFields(row),
      visibility: row.visibility || ProfileVisibility.PUBLIC,
      privacySettings: this.getDefaultPrivacySettings(),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      lastViewedAt: row.last_viewed_at,
      viewCount: row.view_count || 0,
      followersCount: row.followers_count || 0,
      followingCount: row.following_count || 0,
      isFollowing: row.is_following || false,
      mutualConnectionsCount: 0
    };
  }

  private calculateCompletionStatus(row: any): ProfileCompletionStatus {
    // Calculate completion status based on filled fields
    return {
      overall: row.completion_score || 0,
      sections: {
        basic: 0,
        professional: 0,
        contact: 0,
        social: 0,
        preferences: 0
  }
      nextSteps: [],
      completedSteps: []
    };
  }

  private calculateMissingFields(row: any): string[] {
    const missing: string[] = [];
    
    if (!row.display_name) missing.push('displayName');
    if (!row.bio) missing.push('bio');
    if (!row.title) missing.push('title');
    if (!row.avatar_url) missing.push('avatar');
    if (!row.skill_tags?.length) missing.push('skills');

    return missing;
  }

  private getDefaultPrivacySettings(): PrivacySettings {
    return {
      profileVisibility: 'public',
      emailVisibility: 'private',
      activityVisibility: 'connections',
      graphVisibility: 'public',
      contactInfoVisible: true,
      socialLinksVisible: true,
      skillsVisible: true,
      experienceVisible: true,
      locationVisible: true,
      onlineStatusVisible: false,
      lastActiveVisible: false,
      allowDirectMessages: true,
      allowGraphSharing: true,
      allowMentions: true,
      emailNotifications: true,
      marketingEmails: false
    };
  }

  private camelToSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

export default UserProfileService;