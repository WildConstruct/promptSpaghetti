// Epic 11.2 User Profile Service
// Comprehensive user profile management with preferences and settings

import { AuthConfig, UserProfile, UserPreferences } from '../types';
import { DatabaseService } from '../database/DatabaseService';
import { AuditService } from './AuditService';

}
export interface ProfileUpdateData {
  displayName?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  timezone?: string;
  locale?: string;
}
}

}
export interface ProfileImageData {
  originalName: string;
  mimeType: string;
  size: number;
  buffer: Buffer;
}
}

}
export interface PreferencesData {
  category: string;
  settings: Record<string, any>;
}
}

}
export interface NotificationPreferences {
  email: {
    enabled: boolean;
    frequency: 'immediate' | 'daily' | 'weekly' | 'never';
    types: {
      security: boolean;
      system: boolean;
      updates: boolean;
      marketing: boolean;
}
    };
  };
  inApp: {
    enabled: boolean;
    types: {
      security: boolean;
      system: boolean;
      updates: boolean;
      mentions: boolean;
    };
  };
  push: {
    enabled: boolean;
    types: {
      security: boolean;
      system: boolean;
      updates: boolean;
      mentions: boolean;
    };
  };
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string;   // HH:MM format
    timezone: string;
  };
}

export class ProfileService {
  private config: AuthConfig;
  private dbService: DatabaseService;
  private auditService: AuditService;

  constructor(config: AuthConfig, dbService: DatabaseService, auditService: AuditService) {
    this.config = config;
    this.dbService = dbService;
    this.auditService = auditService;
  }

  async getProfile(userId: string): Promise<UserProfile | null> {

    const result = await this.dbService.query(`
      SELECT * FROM user_profiles WHERE user_id = $1
    `, [userId]);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      userId: row.user_id,
      displayName: row.display_name,
      firstName: row.first_name,
      lastName: row.last_name,
      bio: row.bio,
      avatarUrl: row.avatar_url,
      timezone: row.timezone,
      locale: row.locale,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  async createProfile(userId: string, data: ProfileUpdateData): Promise<UserProfile> {

    const id = require('crypto').randomUUID();
    const now = new Date();

    await this.dbService.query(`
      INSERT INTO user_profiles (
        id, user_id, display_name, first_name, last_name, bio, 
        timezone, locale, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [
      id,
      userId,
      data.displayName,
      data.firstName,
      data.lastName,
      data.bio,
      data.timezone || 'UTC',
      data.locale || 'en-US',
      now,
      now
    ]);

    // Log profile creation
    await this.auditService.logEvent({
      userId,
      action: 'profile_created',
      resourceType: 'profile',
      resourceId: id,
      details: data,
      severity: 'info'
    });

    return {
      id,
      userId,
      displayName: data.displayName,
      firstName: data.firstName,
      lastName: data.lastName,
      bio: data.bio,
      avatarUrl: null,
      timezone: data.timezone || 'UTC',
      locale: data.locale || 'en-US',
      createdAt: now,
      updatedAt: now
    };
  }

  async updateProfile(
    userId: string,
    data: ProfileUpdateData,
    context: { ipAddress?: string; userAgent?: string } = {}
  ): Promise<UserProfile> {

    const now = new Date();
    
    // Check if profile exists
    let profile = await this.getProfile(userId);
    if (!profile) {
      profile = await this.createProfile(userId, data);
    } else {
      // Update existing profile
      await this.dbService.query(`
        UPDATE user_profiles 
        SET display_name = $1, first_name = $2, last_name = $3, bio = $4,
            timezone = $5, locale = $6, updated_at = $7
        WHERE user_id = $8
      `, [
        data.displayName ?? profile.displayName,
        data.firstName ?? profile.firstName,
        data.lastName ?? profile.lastName,
        data.bio ?? profile.bio,
        data.timezone ?? profile.timezone,
        data.locale ?? profile.locale,
        now,
        userId
      ]);

      // Log profile update
      await this.auditService.logEvent({
        userId,
        action: 'profile_updated',
        resourceType: 'profile',
        resourceId: profile.id,
        details: {
          changes: data,
          previousValues: {
            displayName: profile.displayName,
            firstName: profile.firstName,
            lastName: profile.lastName,
            bio: profile.bio,
            timezone: profile.timezone,
            locale: profile.locale
          }
  }
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        severity: 'info'
      });

      // Update profile object
      profile = {
        ...profile,
        displayName: data.displayName ?? profile.displayName,
        firstName: data.firstName ?? profile.firstName,
        lastName: data.lastName ?? profile.lastName,
        bio: data.bio ?? profile.bio,
        timezone: data.timezone ?? profile.timezone,
        locale: data.locale ?? profile.locale,
        updatedAt: now
      };
    }

    return profile;
  }

  async uploadProfileImage(
    userId: string,
    imageData: ProfileImageData,
    context: { ipAddress?: string; userAgent?: string } = {}
  ): Promise<{ avatarUrl: string }> {

    // Validate image
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (imageData.size > maxSize) {
      throw new Error('Image file too large. Maximum size is 5MB.');
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(imageData.mimeType)) {
      throw new Error('Invalid image type. Allowed types: JPEG, PNG, GIF, WebP.');
    }

    try {
      // Generate unique filename
      const fileExtension = imageData.mimeType.split('/')[1];
      const filename = `${userId}_${Date.now()}.${fileExtension}`;
      
      // In production, this would upload to S3, CloudFlare, etc.
      // For now, we'll simulate storing the image and return a URL
      const avatarUrl = `/api/uploads/avatars/${filename}`;
      
      // Store image metadata and URL in database
      await this.dbService.query(`
        UPDATE user_profiles 
        SET avatar_url = $1, updated_at = $2
        WHERE user_id = $3
      `, [avatarUrl, new Date(), userId]);

      // Store image metadata for tracking
      await this.dbService.query(`
        INSERT INTO user_uploads (user_id, filename, original_name, mime_type, size, upload_type, url)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        userId,
        filename,
        imageData.originalName,
        imageData.mimeType,
        imageData.size,
        'avatar',
        avatarUrl
      ]);

      // Log image upload
      await this.auditService.logEvent({
        userId,
        action: 'profile_image_uploaded',
        resourceType: 'profile',
        details: {
          filename,
          originalName: imageData.originalName,
          mimeType: imageData.mimeType,
          size: imageData.size
  }
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        severity: 'info'
      });

      return { avatarUrl };
    } catch (error) {
      // Log upload failure
      await this.auditService.logEvent({
        userId,
        action: 'profile_image_upload_failed',
        details: {
          error: error.message,
          originalName: imageData.originalName,
          mimeType: imageData.mimeType,
          size: imageData.size
  }
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        severity: 'error'
      });

      throw error;
    }
  }

  async deleteProfileImage(
    userId: string,
    context: { ipAddress?: string; userAgent?: string } = {}
  ): Promise<void> {

    const profile = await this.getProfile(userId);
    if (!profile || !profile.avatarUrl) {
      return;
    }

    // Remove avatar URL from profile
    await this.dbService.query(`
      UPDATE user_profiles 
      SET avatar_url = NULL, updated_at = $1
      WHERE user_id = $2
    `, [new Date(), userId]);

    // Mark upload as deleted
    await this.dbService.query(`
      UPDATE user_uploads 
      SET deleted_at = $1
      WHERE user_id = $2 AND upload_type = 'avatar' AND url = $3
    `, [new Date(), userId, profile.avatarUrl]);

    // Log image deletion
    await this.auditService.logEvent({
      userId,
      action: 'profile_image_deleted',
      resourceType: 'profile',
      details: {
        deletedAvatarUrl: profile.avatarUrl
  }
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      severity: 'info'
    });
  }

  async getPreferences(userId: string, category?: string): Promise<UserPreferences[]> {

    const query = category 
      ? 'SELECT * FROM user_preferences WHERE user_id = $1 AND category = $2'
      : 'SELECT * FROM user_preferences WHERE user_id = $1';
    
    const params = category ? [userId, category] : [userId];
    const result = await this.dbService.query(query, params);

    return result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      category: row.category,
      settings: row.settings,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  async updatePreferences(
    userId: string,
    category: string,
    settings: Record<string, any>,
    context: { ipAddress?: string; userAgent?: string } = {}
  ): Promise<UserPreferences> {

    const now = new Date();
    
    // Check if preferences exist
    const existing = await this.getPreferences(userId, category);
    
    if (existing.length > 0) {
      // Update existing preferences
      const preference = existing[0];
      const previousSettings = preference.settings;
      
      await this.dbService.query(`
        UPDATE user_preferences 
        SET settings = $1, updated_at = $2
        WHERE user_id = $3 AND category = $4
      `, [JSON.stringify(settings), now, userId, category]);

      // Log preferences update
      await this.auditService.logEvent({
        userId,
        action: 'preferences_updated',
        resourceType: 'preferences',
        resourceId: preference.id,
        details: {
          category,
          changes: settings,
          previousSettings
  }
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        severity: 'info'
      });

      return {
        ...preference,
        settings,
        updatedAt: now
      };
    } else {
      // Create new preferences
      const id = require('crypto').randomUUID();
      
      await this.dbService.query(`
        INSERT INTO user_preferences (id, user_id, category, settings, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [id, userId, category, JSON.stringify(settings), now, now]);

      // Log preferences creation
      await this.auditService.logEvent({
        userId,
        action: 'preferences_created',
        resourceType: 'preferences',
        resourceId: id,
        details: {
          category,
          settings
  }
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        severity: 'info'
      });

      return {
        id,
        userId,
        category,
        settings,
        createdAt: now,
        updatedAt: now
      };
    }
  }

  async getNotificationPreferences(userId: string): Promise<NotificationPreferences> {

    const preferences = await this.getPreferences(userId, 'notifications');
    
    if (preferences.length === 0) {
      // Return default notification preferences
      return {
        email: {
          enabled: true,
          frequency: 'immediate',
          types: {
            security: true,
            system: true,
            updates: false,
            marketing: false
          }
  }
        inApp: {
          enabled: true,
          types: {
            security: true,
            system: true,
            updates: true,
            mentions: true
          }
  }
        push: {
          enabled: false,
          types: {
            security: true,
            system: false,
            updates: false,
            mentions: true
          }
  }
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '08:00',
          timezone: 'UTC'
        }
      };
    }

    return preferences[0].settings as NotificationPreferences;
  }

  async updateNotificationPreferences(
    userId: string,
    preferences: NotificationPreferences,
    context: { ipAddress?: string; userAgent?: string } = {}
  ): Promise<NotificationPreferences> {

    await this.updatePreferences(userId, 'notifications', preferences, context);
    return preferences;
  }

  async deleteProfile(
    userId: string,
    context: { ipAddress?: string; userAgent?: string } = {}
  ): Promise<void> {

    // Delete profile image if exists
    await this.deleteProfileImage(userId, context);
    
    // Delete preferences
    await this.dbService.query(`
      DELETE FROM user_preferences WHERE user_id = $1
    `, [userId]);

    // Delete uploads
    await this.dbService.query(`
      UPDATE user_uploads 
      SET deleted_at = $1
      WHERE user_id = $2
    `, [new Date(), userId]);

    // Delete profile
    await this.dbService.query(`
      DELETE FROM user_profiles WHERE user_id = $1
    `, [userId]);

    // Log profile deletion
    await this.auditService.logEvent({
      userId,
      action: 'profile_deleted',
      resourceType: 'profile',
      details: {
        deletedAt: new Date()
  }
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      severity: 'info'
    });
  }

  async getProfileCompleteness(userId: string): Promise<{
    percentage: number;
    completedFields: string[];
    missingFields: string[];
  }> {

    const profile = await this.getProfile(userId);
    
    const allFields = [
      'displayName',
      'firstName',
      'lastName',
      'bio',
      'avatarUrl',
      'timezone',
      'locale'
    ];

    const completedFields: string[] = [];
    const missingFields: string[] = [];

    for (const field of allFields) {
      if (profile && profile[field as keyof UserProfile]) {
        completedFields.push(field);
      } else {
        missingFields.push(field);
      }
    }

    const percentage = Math.round((completedFields.length / allFields.length) * 100);

    return {
      percentage,
      completedFields,
      missingFields
    };
  }

  async searchProfiles(
    query: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<{
    profiles: Partial<UserProfile>[];
    total: number;
  }> {
    const searchQuery = `%${query.toLowerCase()}%`;
    
    const result = await this.dbService.query(`
      SELECT 
        p.id, p.user_id, p.display_name, p.first_name, p.last_name, 
        p.bio, p.avatar_url, p.created_at, p.updated_at,
        COUNT(*) OVER() as total_count
      FROM user_profiles p
      INNER JOIN users u ON p.user_id = u.id
      WHERE u.status = 'active' AND (
        LOWER(p.display_name) LIKE $1 OR 
        LOWER(p.first_name) LIKE $1 OR 
        LOWER(p.last_name) LIKE $1 OR
        LOWER(CONCAT(p.first_name, ' ', p.last_name)) LIKE $1

      ORDER BY p.display_name, p.first_name, p.last_name
      LIMIT $2 OFFSET $3
    `, [searchQuery, limit, offset]);

    const profiles = result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      displayName: row.display_name,
      firstName: row.first_name,
      lastName: row.last_name,
      bio: row.bio,
      avatarUrl: row.avatar_url,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    const total = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;

    return { profiles, total };
  }
}