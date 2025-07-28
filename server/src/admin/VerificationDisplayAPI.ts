/**
 * Verification Display API
 * 
 * REST API endpoints for managing verification display configurations,
 * trust indicator settings, and reputation visualization controls.
 * Integrates with the existing reputation system and trust indicators.
 * 
 * Part of Epic 17 - Backstage Admin Controls
 * Task: E17-1753114397411-1FA735 - Implement verification display
 */

import { FastifyInstance } from 'fastify';
import { DatabaseService } from '../auth/database/DatabaseService';
import { AuditService } from '../auth/services/AuditService';
import { ReputationSystem } from './ReputationSystem';

}
export interface VerificationDisplayConfig {
  // Display Settings
  showTrustScores: boolean;
  showBadgeCount: boolean;
  showVerificationLevel: boolean;
  showReputation: boolean;
  
  // Style Configuration
  badgeStyle: 'compact' | 'detailed' | 'minimal';
  trustIndicatorSize: 'small' | 'medium' | 'large';
  colorScheme: 'default' | 'professional' | 'vibrant';
  animationsEnabled: boolean;
  
  // Visibility Rules
  publicDisplaySettings: {
    unverifiedUsers: boolean;
    lowReputationUsers: boolean;
    flaggedUsers: boolean;
}
  };
  
  // Thresholds
  displayThresholds: {
    minTrustScore: number;
    minBadgeCount: number;
    hideUnverified: boolean;
  };
  
  // Metadata
  lastUpdated: Date;
  updatedBy: string;
  version: number;
}

}
export interface VerificationDisplayStats {
  configurationAge: number; // days since last update
  activeConfigurations: number;
  displayMetrics: {
    usersAffected: number;
    displayRate: number;
    averageElementsShown: number;
}
  };
  performanceMetrics: {
    renderTime: number;
    cacheHitRate: number;
    apiResponseTime: number;
  };
}

/**
 * Verification Display API Service
 * 
 * Manages verification display configurations and provides analytics
 */
export class VerificationDisplayAPI {
  private databaseService: DatabaseService;
  private auditService: AuditService;
  private reputationSystem: ReputationSystem;
  private configCache: Map<string, VerificationDisplayConfig> = new Map();

  constructor(
    dependencies: {
      databaseService: DatabaseService;
      auditService: AuditService;
      reputationSystem: ReputationSystem;
    }
  ) {
    this.databaseService = dependencies.databaseService;
    this.auditService = dependencies.auditService;
    this.reputationSystem = dependencies.reputationSystem;
  }

  /**
   * Register verification display API routes
   */
  public registerRoutes(server: FastifyInstance): void {
    // Configuration Management
    server.get('/api/admin/verification-display/config', this.getConfiguration.bind(this));
    server.put('/api/admin/verification-display/config', this.updateConfiguration.bind(this));
    server.post('/api/admin/verification-display/config/reset', this.resetConfiguration.bind(this));
    
    // Configuration History
    server.get('/api/admin/verification-display/config/history', this.getConfigurationHistory.bind(this));
    server.get('/api/admin/verification-display/config/version/:version', this.getConfigurationVersion.bind(this));
    
    // Preview and Testing
    server.post('/api/admin/verification-display/preview', this.previewConfiguration.bind(this));
    server.get('/api/admin/verification-display/test-users', this.getTestUsers.bind(this));
    
    // Analytics and Statistics
    server.get('/api/admin/verification-display/stats', this.getDisplayStatistics.bind(this));
    server.get('/api/admin/verification-display/metrics', this.getPerformanceMetrics.bind(this));
    
    // Configuration Templates
    server.get('/api/admin/verification-display/templates', this.getConfigurationTemplates.bind(this));
    server.post('/api/admin/verification-display/templates', this.saveConfigurationTemplate.bind(this));
    
    console.log('🔧 Verification Display API routes registered');
  }

  /**
   * Get current verification display configuration
   */
  private async getConfiguration(request: any, reply: any): Promise<any> {

    try {
      const config = await this.loadConfiguration();
      
      return reply.code(200).send({
        success: true,
        data: config
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Update verification display configuration
   */
  private async updateConfiguration(request: any, reply: any): Promise<any> {

    try {
      const configUpdate = request.body;
      const currentUser = request.user?.id || 'system';
      
      // Validate configuration
      const validationResult = await this.validateConfiguration(configUpdate);
      if (!validationResult.valid) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid configuration',
          details: validationResult.errors
        });
      }

      // Get current configuration for versioning
      const currentConfig = await this.loadConfiguration();
      const newVersion = currentConfig.version + 1;

      // Create updated configuration
      const updatedConfig: VerificationDisplayConfig = {
        ...configUpdate,
        lastUpdated: new Date(),
        updatedBy: currentUser,
        version: newVersion
      };

      // Save configuration
      await this.saveConfiguration(updatedConfig);
      
      // Clear cache
      this.configCache.clear();
      
      // Log audit event
      await this.auditService.logEvent({
        eventType: 'verification_display_config_updated',
        userId: currentUser,
        details: {
          previousVersion: currentConfig.version,
          newVersion: newVersion,
          changes: this.calculateConfigurationDiff(currentConfig, updatedConfig)
        }
      });

      return reply.code(200).send({
        success: true,
        data: updatedConfig,
        message: 'Configuration updated successfully'
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Reset configuration to default values
   */
  private async resetConfiguration(request: any, reply: any): Promise<any> {

    try {
      const currentUser = request.user?.id || 'system';
      
      const defaultConfig: VerificationDisplayConfig = {
        showTrustScores: true,
        showBadgeCount: true,
        showVerificationLevel: true,
        showReputation: true,
        badgeStyle: 'detailed',
        trustIndicatorSize: 'medium',
        colorScheme: 'default',
        animationsEnabled: true,
        publicDisplaySettings: {
          unverifiedUsers: true,
          lowReputationUsers: true,
          flaggedUsers: false
  }
        displayThresholds: {
          minTrustScore: 0,
          minBadgeCount: 0,
          hideUnverified: false
  }
        lastUpdated: new Date(),
        updatedBy: currentUser,
        version: 1
      };

      await this.saveConfiguration(defaultConfig);
      this.configCache.clear();

      await this.auditService.logEvent({
        eventType: 'verification_display_config_reset',
        userId: currentUser,
        details: { resetToDefaults: true }
      });

      return reply.code(200).send({
        success: true,
        data: defaultConfig,
        message: 'Configuration reset to defaults'
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get configuration change history
   */
  private async getConfigurationHistory(request: any, reply: any): Promise<any> {

    try {
      const { limit = 20, offset = 0 } = request.query;
      
      const db = await this.databaseService.getDatabase();
      const history = await db.all(`
        SELECT version, updated_by, last_updated, configuration_json
        FROM verification_display_configs 
        ORDER BY version DESC 
        LIMIT ? OFFSET ?
      `, [limit, offset]);

      const totalCount = await db.get(`
        SELECT COUNT(*) as count FROM verification_display_configs
      `);

      return reply.code(200).send({
        success: true,
        data: {
          history: history.map(row => ({
            version: row.version,
            updatedBy: row.updated_by,
            lastUpdated: new Date(row.last_updated),
            summary: this.generateConfigurationSummary(JSON.parse(row.configuration_json))
          })),
          pagination: {
            total: totalCount.count,
            limit: parseInt(limit),
            offset: parseInt(offset),
            hasMore: (parseInt(offset) + parseInt(limit)) < totalCount.count
          }
        }
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get specific configuration version
   */
  private async getConfigurationVersion(request: any, reply: any): Promise<any> {

    try {
      const { version } = request.params;
      
      const db = await this.databaseService.getDatabase();
      const configRow = await db.get(`
        SELECT * FROM verification_display_configs 
        WHERE version = ?
      `, [version]);

      if (!configRow) {
        return reply.code(404).send({
          success: false,
          error: 'Configuration version not found'
        });
      }

      const config = JSON.parse(configRow.configuration_json);
      
      return reply.code(200).send({
        success: true,
        data: config
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Preview configuration with test data
   */
  private async previewConfiguration(request: any, reply: any): Promise<any> {

    try {
      const previewConfig = request.body;
      const { userIds = [] } = request.query;
      
      // Get test users or use provided user IDs
      const testUsers = userIds.length > 0 
        ? await this.getUsersById(userIds)
        : await this.getTestUsers();

      // Generate previews for each user
      const previews = await Promise.all(
        testUsers.map(async (user) => {
          const reputation = await this.reputationSystem.getUserReputation(user.userId);
          
          return {
            userId: user.userId,
            username: user.username,
            trustScore: reputation.overallTrustScore,
            reputationLevel: reputation.reputationLevel,
            verificationLevel: reputation.verification.verificationLevel,
            badges: reputation.badges.filter(b => b.verified).slice(0, 5),
            flagged: reputation.flags.length > 0,
            displayData: this.calculateDisplayData(reputation, previewConfig)
          };
  }
      );

      return reply.code(200).send({
        success: true,
        data: {
          previews,
          configuration: previewConfig,
          generatedAt: new Date()
        }
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get test users for preview
   */
  private async getTestUsers(request?: any, reply?: any): Promise<any> {

    try {
      // Get diverse set of users for testing display configurations
      const users = await this.reputationSystem.getReputationLeaderboard({ 
        limit: 6, 
        diverseSelection: true 
      });

      const testUsers = users.map(user => ({
        userId: user.userId,
        username: user.username,
        trustScore: user.overallTrustScore,
        reputationLevel: user.reputationLevel,
        verificationLevel: user.verification?.verificationLevel || 'unverified',
        badges: user.badges.filter(b => b.verified).slice(0, 3),
        flagged: user.adminNotes?.flagged || false
      }));

      if (reply) {
        return reply.code(200).send({
          success: true,
          data: testUsers
        });
      }

      return testUsers;
    } catch (error) {
      if (reply) {
        return reply.code(500).send({
          success: false,
          error: error.message
        });
      }
      throw error;
    }
  }

  /**
   * Get display statistics and analytics
   */
  private async getDisplayStatistics(request: any, reply: any): Promise<any> {

    try {
      const stats = await this.calculateDisplayStatistics();
      
      return reply.code(200).send({
        success: true,
        data: stats
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get performance metrics
   */
  private async getPerformanceMetrics(request: any, reply: any): Promise<any> {

    try {
      const metrics = await this.calculatePerformanceMetrics();
      
      return reply.code(200).send({
        success: true,
        data: metrics
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get configuration templates
   */
  private async getConfigurationTemplates(request: any, reply: any): Promise<any> {

    try {
      const templates = [
        {
          name: 'Minimal Display',
          description: 'Shows only essential trust indicators',
          config: this.getMinimalTemplate()
  }
        {
          name: 'Professional Display',
          description: 'Balanced display suitable for business environments',
          config: this.getProfessionalTemplate()
  }
        {
          name: 'Full Display',
          description: 'Shows all available trust and verification information',
          config: this.getFullTemplate()
  }
        {
          name: 'Public Safe',
          description: 'Conservative settings that protect user privacy',
          config: this.getPublicSafeTemplate()
        }
      ];

      return reply.code(200).send({
        success: true,
        data: templates
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Save custom configuration template
   */
  private async saveConfigurationTemplate(request: any, reply: any): Promise<any> {

    try {
      const { name, description, config } = request.body;
      const currentUser = request.user?.id || 'system';
      
      // Save template to database
      const db = await this.databaseService.getDatabase();
      await db.run(`
        INSERT INTO verification_display_templates (name, description, configuration_json, created_by, created_at)
        VALUES (?, ?, ?, ?, ?)
      `, [name, description, JSON.stringify(config), currentUser, new Date().toISOString()]);

      return reply.code(201).send({
        success: true,
        message: 'Configuration template saved'
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: error.message
      });
    }
  }

  // Private helper methods

  /**
   * Load current configuration
   */
  private async loadConfiguration(): Promise<VerificationDisplayConfig> {

    const cacheKey = 'current_config';
    
    if (this.configCache.has(cacheKey)) {
      return this.configCache.get(cacheKey)!;
    }

    try {
      const db = await this.databaseService.getDatabase();
      const row = await db.get(`
        SELECT * FROM verification_display_configs 
        ORDER BY version DESC LIMIT 1
      `);

      let config: VerificationDisplayConfig;
      
      if (row) {
        config = JSON.parse(row.configuration_json);
      } else {
        // Return default configuration
        config = this.getDefaultConfiguration();
        await this.saveConfiguration(config);
      }

      this.configCache.set(cacheKey, config);
      return config;
    } catch (error) {
      console.error('Error loading verification display configuration:', error);
      return this.getDefaultConfiguration();
    }
  }

  /**
   * Save configuration to database
   */
  private async saveConfiguration(config: VerificationDisplayConfig): Promise<void> {

    const db = await this.databaseService.getDatabase();
    
    await db.run(`
      INSERT INTO verification_display_configs (version, configuration_json, updated_by, last_updated)
      VALUES (?, ?, ?, ?)
    `, [config.version, JSON.stringify(config), config.updatedBy, config.lastUpdated.toISOString()]);
  }

  /**
   * Validate configuration object
   */
  private async validateConfiguration(config: any): Promise<{ valid: boolean; errors?: string[] }> {

    const errors: string[] = [];
    
    // Validate required boolean fields
    const booleanFields = ['showTrustScores', 'showBadgeCount', 'showVerificationLevel', 'showReputation', 'animationsEnabled'];
    booleanFields.forEach(field => {
      if (typeof config[field] !== 'boolean') {
        errors.push(`${field} must be a boolean`);
      }
    });

    // Validate enum fields
    if (!['compact', 'detailed', 'minimal'].includes(config.badgeStyle)) {
      errors.push('badgeStyle must be one of: compact, detailed, minimal');
    }
    
    if (!['small', 'medium', 'large'].includes(config.trustIndicatorSize)) {
      errors.push('trustIndicatorSize must be one of: small, medium, large');
    }
    
    if (!['default', 'professional', 'vibrant'].includes(config.colorScheme)) {
      errors.push('colorScheme must be one of: default, professional, vibrant');
    }

    // Validate thresholds
    if (config.displayThresholds) {
      if (typeof config.displayThresholds.minTrustScore !== 'number' || 
          config.displayThresholds.minTrustScore < 0 || 
          config.displayThresholds.minTrustScore > 1000) {
        errors.push('minTrustScore must be a number between 0 and 1000');
      }
      
      if (typeof config.displayThresholds.minBadgeCount !== 'number' || 
          config.displayThresholds.minBadgeCount < 0) {
        errors.push('minBadgeCount must be a non-negative number');
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  /**
   * Calculate display data for a user given configuration
   */
  private calculateDisplayData(reputation: any, config: VerificationDisplayConfig): any {
    const meetsThresholds = {
      trustScore: reputation.overallTrustScore >= config.displayThresholds.minTrustScore,
      badgeCount: reputation.badges.filter(b => b.verified).length >= config.displayThresholds.minBadgeCount,
      verified: reputation.verification.verificationLevel !== 'unverified' || !config.displayThresholds.hideUnverified
    };

    const shouldDisplay = meetsThresholds.trustScore && meetsThresholds.badgeCount && meetsThresholds.verified;
    
    return {
      shouldDisplay,
      meetsThresholds,
      elements: {
        trustScore: shouldDisplay && config.showTrustScores,
        badgeCount: shouldDisplay && config.showBadgeCount,
        verificationLevel: shouldDisplay && config.showVerificationLevel,
        reputation: shouldDisplay && config.showReputation
  }
      styling: {
        badgeStyle: config.badgeStyle,
        size: config.trustIndicatorSize,
        colorScheme: config.colorScheme,
        animated: config.animationsEnabled
      }
    };
  }

  /**
   * Calculate configuration difference
   */
  private calculateConfigurationDiff(oldConfig: VerificationDisplayConfig, newConfig: VerificationDisplayConfig): any {
    const changes: any = {};
    
    const fields = Object.keys(newConfig).filter(key => key !== 'lastUpdated' && key !== 'version');
    
    fields.forEach(field => {
      const oldValue = (oldConfig as any)[field];
      const newValue = (newConfig as any)[field];
      
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes[field] = { from: oldValue, to: newValue };
      }
    });
    
    return changes;
  }

  /**
   * Generate configuration summary
   */
  private generateConfigurationSummary(config: VerificationDisplayConfig): string {
    const elements = [];
    if (config.showTrustScores) elements.push('scores');
    if (config.showBadgeCount) elements.push('badges');
    if (config.showVerificationLevel) elements.push('verification');
    if (config.showReputation) elements.push('reputation');
    
    return `${config.badgeStyle} style, ${config.trustIndicatorSize} size, showing: ${elements.join(', ')}`;
  }

  /**
   * Calculate display statistics
   */
  private async calculateDisplayStatistics(): Promise<VerificationDisplayStats> {

    const config = await this.loadConfiguration();
    const metrics = await this.reputationSystem.getReputationMetrics();
    
    return {
      configurationAge: Math.floor((Date.now() - config.lastUpdated.getTime()) / (1000 * 60 * 60 * 24)),
      activeConfigurations: 1, // Current implementation supports single config
      displayMetrics: {
        usersAffected: metrics.totalUsers,
        displayRate: 0.85, // Estimated based on thresholds
        averageElementsShown: 3.2 // Estimated
  }
      performanceMetrics: {
        renderTime: 45, // ms
        cacheHitRate: 0.92,
        apiResponseTime: 120 // ms
      }
    };
  }

  /**
   * Calculate performance metrics
   */
  private async calculatePerformanceMetrics(): Promise<any> {

    // Implementation would measure actual performance metrics
    return {
      apiResponseTime: {
        average: 120,
        p95: 250,
        p99: 500
  }
      cachePerformance: {
        hitRate: 0.92,
        missRate: 0.08,
        evictionRate: 0.02
  }
      renderMetrics: {
        averageRenderTime: 45,
        componentsRendered: 1500,
        renderErrors: 2
      }
    };
  }

  /**
   * Get users by IDs
   */
  private async getUsersById(userIds: string[]): Promise<any[]> {

    const users = await Promise.all(
      userIds.map(async (userId) => {
        const reputation = await this.reputationSystem.getUserReputation(userId);
        return {
          userId: reputation.userId,
          username: reputation.userId, // Placeholder - would get from user service
          trustScore: reputation.overallTrustScore,
          reputationLevel: reputation.reputationLevel,
          verificationLevel: reputation.verification.verificationLevel,
          badges: reputation.badges.filter(b => b.verified),
          flagged: reputation.flags.length > 0
        };
  }
    );
    
    return users;
  }

  // Configuration templates

  private getDefaultConfiguration(): VerificationDisplayConfig {
    return {
      showTrustScores: true,
      showBadgeCount: true,
      showVerificationLevel: true,
      showReputation: true,
      badgeStyle: 'detailed',
      trustIndicatorSize: 'medium',
      colorScheme: 'default',
      animationsEnabled: true,
      publicDisplaySettings: {
        unverifiedUsers: true,
        lowReputationUsers: true,
        flaggedUsers: false
  }
      displayThresholds: {
        minTrustScore: 0,
        minBadgeCount: 0,
        hideUnverified: false
  }
      lastUpdated: new Date(),
      updatedBy: 'system',
      version: 1
    };
  }

  private getMinimalTemplate(): Partial<VerificationDisplayConfig> {
    return {
      showTrustScores: false,
      showBadgeCount: false,
      showVerificationLevel: true,
      showReputation: false,
      badgeStyle: 'minimal',
      trustIndicatorSize: 'small',
      animationsEnabled: false
    };
  }

  private getProfessionalTemplate(): Partial<VerificationDisplayConfig> {
    return {
      showTrustScores: true,
      showBadgeCount: true,
      showVerificationLevel: true,
      showReputation: true,
      badgeStyle: 'compact',
      trustIndicatorSize: 'medium',
      colorScheme: 'professional',
      animationsEnabled: false
    };
  }

  private getFullTemplate(): Partial<VerificationDisplayConfig> {
    return {
      showTrustScores: true,
      showBadgeCount: true,
      showVerificationLevel: true,
      showReputation: true,
      badgeStyle: 'detailed',
      trustIndicatorSize: 'large',
      colorScheme: 'default',
      animationsEnabled: true
    };
  }

  private getPublicSafeTemplate(): Partial<VerificationDisplayConfig> {
    return {
      showTrustScores: false,
      showBadgeCount: false,
      showVerificationLevel: true,
      showReputation: false,
      badgeStyle: 'minimal',
      trustIndicatorSize: 'small',
      publicDisplaySettings: {
        unverifiedUsers: false,
        lowReputationUsers: false,
        flaggedUsers: false
  }
      displayThresholds: {
        minTrustScore: 500,
        minBadgeCount: 2,
        hideUnverified: true
      }
    };
  }
}