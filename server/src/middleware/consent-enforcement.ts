/**
 * Consent Enforcement Middleware
 * Automatically enforces user consent preferences across all API endpoints
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { ConsentBasedDataFilterService } from '../services/ConsentBasedDataFilterService';
import { ConsentCollectionService } from '../services/ConsentCollectionService';
import { logger } from '../utils/logger';

export interface ConsentContext {
  userId: string;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  consentRequired: string[]; // Required consent types for this operation
  dataCategories: string[]; // Types of data being processed
  processingPurpose: string; // Purpose of data processing
  thirdPartySharing?: boolean; // Whether data will be shared with third parties
}

export interface ConsentEnforcementRule {
  id: string;
  name: string;
  description: string;
  paths: string[]; // API paths this rule applies to
  methods: string[]; // HTTP methods
  requiredConsents: string[]; // Required consent types
  dataCategories: string[]; // Data categories affected
  enforcementLevel: 'strict' | 'permissive' | 'audit_only';
  exemptions: string[]; // User roles or conditions exempt from this rule
  enabled: boolean;
}

export interface ConsentViolation {
  id: string;
  timestamp: Date;
  userId: string;
  sessionId: string;
  path: string;
  method: string;
  rule: ConsentEnforcementRule;
  missingConsents: string[];
  action: 'blocked' | 'allowed_with_warning' | 'audit_logged';
  reason: string;
}

export class ConsentEnforcementMiddleware {
  private consentService: ConsentBasedDataFilterService;
  private collectionService: ConsentCollectionService;
  private enforcementRules: Map<string, ConsentEnforcementRule> = new Map();
  private violations: ConsentViolation[] = [];
  private exemptPaths = new Set([
    '/api/health',
    '/api/consent',
    '/api/auth/login',
    '/api/auth/logout',
    '/api/auth/register'
  ]);

  constructor(
    consentService: ConsentBasedDataFilterService,
    collectionService: ConsentCollectionService
  ) {
    this.consentService = consentService;
    this.collectionService = collectionService;
    this.initializeDefaultRules();
  }

  /**
   * Main middleware function for Fastify
   */
  public createMiddleware() {
    return async (request: FastifyRequest, reply: FastifyReply, done: Function) => {
      try {
        // Skip enforcement for exempt paths
        if (this.isExemptPath(request.url)) {
          return done();
        }

        // Extract user context
        const context = await this.extractConsentContext(request);
        if (!context) {
          // No user context available, allow request but log
          logger.log(`Consent enforcement skipped - no user context for ${request.url}`);
          return done();
        }

        // Find applicable enforcement rules
        const applicableRules = this.findApplicableRules(request.url, request.method);
        
        if (applicableRules.length === 0) {
          // No specific rules, use default consent checking
          return done();
        }

        // Check consent for each applicable rule
        for (const rule of applicableRules) {
          const violation = await this.checkConsentCompliance(context, rule, request);
          
          if (violation) {
            await this.handleConsentViolation(violation, request, reply);
            
            if (violation.action === 'blocked') {
              // Request blocked - don't call done()
              return;
            }
          }
        }

        // Add consent context to request for downstream handlers
        (request as any).consentContext = context;
        
        done();
      } catch (error) {
        logger.log(`Consent enforcement error: ${error}`);
        // On error, allow request but log the issue
        done();
      }
    };
  }

  /**
   * Extract consent context from request
   */
  private async extractConsentContext(request: FastifyRequest): Promise<ConsentContext | null> {
    // Extract user information from JWT token or session
    const userId = (request as any).user?.id || (request as any).userId;
    const sessionId = (request as any).sessionId || (request.headers as any)['x-session-id'];
    
    if (!userId) {
      return null;
    }

    return {
      userId,
      sessionId: sessionId || 'unknown',
      ipAddress: this.extractIPAddress(request),
      userAgent: request.headers['user-agent'] || 'unknown',
      consentRequired: [], // Will be populated based on rules
      dataCategories: [],
      processingPurpose: this.inferProcessingPurpose(request)
    };
  }

  /**
   * Find enforcement rules that apply to the current request
   */
  private findApplicableRules(path: string, method: string): ConsentEnforcementRule[] {
    const applicableRules = [];
    
    for (const rule of this.enforcementRules.values()) {
      if (!rule.enabled) continue;
      
      // Check if path matches
      const pathMatches = rule.paths.some(rulePath => {
        if (rulePath.includes('*')) {
          const regex = new RegExp(rulePath.replace(/\*/g, '.*'));
          return regex.test(path);
        }
        return path.startsWith(rulePath);
      });
      
      // Check if method matches
      const methodMatches = rule.methods.includes('*') || rule.methods.includes(method.toUpperCase());
      
      if (pathMatches && methodMatches) {
        applicableRules.push(rule);
      }
    }
    
    return applicableRules;
  }

  /**
   * Check if user has required consents for the rule
   */
  private async checkConsentCompliance(
    context: ConsentContext,
    rule: ConsentEnforcementRule,
    request: FastifyRequest
  ): Promise<ConsentViolation | null> {
    try {
      // Get user's current consent status
      const userConsents = await this.collectionService.getUserConsent(context.userId);
      
      if (!userConsents) {
        // No consent record found - treat as no consents granted
        return this.createViolation(context, rule, rule.requiredConsents, request);
      }

      // Check each required consent
      const missingConsents = [];
      
      for (const requiredConsent of rule.requiredConsents) {
        if (!this.hasValidConsent(userConsents, requiredConsent)) {
          missingConsents.push(requiredConsent);
        }
      }

      if (missingConsents.length > 0) {
        return this.createViolation(context, rule, missingConsents, request);
      }

      return null; // No violation
    } catch (error) {
      logger.log(`Consent compliance check failed: ${error}`);
      // On error, create a violation for safety
      return this.createViolation(
        context, 
        rule, 
        rule.requiredConsents, 
        request,
        `Consent check failed: ${error}`
      );
    }
  }

  /**
   * Check if user has valid consent for a specific type
   */
  private hasValidConsent(userConsents: Record<string, unknown>, consentType: string): boolean {
    const consent = userConsents.consents?.[consentType];
    
    if (!consent || !consent.granted) {
      return false;
    }

    // Check if consent has expired
    if (consent.expiresAt && new Date(consent.expiresAt) < new Date()) {
      return false;
    }

    // Check if consent has been withdrawn
    if (consent.withdrawn) {
      return false;
    }

    // Validate consent version compatibility
    if (consent.version && this.isConsentVersionOutdated(consent.version, consentType)) {
      return false;
    }

    return true;
  }

  /**
   * Check if consent version is outdated
   */
  private isConsentVersionOutdated(consentVersion: string, consentType: string): boolean {
    // This would check against current policy versions
    // For now, simplified implementation
    return false;
  }

  /**
   * Validate consent at database level before processing
   */
  private async validateDatabaseConsent(userId: string, operation: string, dataCategories: string[]): Promise<boolean> {
    try {
      // Check if user has database-level consent records
      const dbConsents = await this.getDatabaseConsentRecord(userId);
      
      if (!dbConsents) {
        logger.log(`No database consent record found for user ${userId}`);
        return false;
      }

      // Validate each data category has proper consent
      for (const category of dataCategories) {
        const requiredConsentType = this.mapDataCategoryToConsentType(category);
        
        if (!this.hasValidDatabaseConsent(dbConsents, requiredConsentType)) {
          logger.log(`User ${userId} lacks database consent for ${category} (${requiredConsentType})`);
          return false;
        }
      }

      // Log successful validation
      logger.log(`Database consent validated for user ${userId} on operation ${operation}`);
      return true;
      
    } catch (error) {
      logger.log(`Database consent validation error: ${error}`);
      return false; // Fail closed for security
    }
  }

  /**
   * Get database consent record for user
   */
  private async getDatabaseConsentRecord(userId: string): Promise<any> {
    // This would query the database for consent records
    // Implementation would depend on your database structure
    try {
      // Example database query (would use actual DB connection)
      const query = `
        SELECT consent_type, granted, granted_at, expires_at, withdrawn, version
        FROM user_consents 
        WHERE user_id = ? AND (expires_at IS NULL OR expires_at > NOW())
      `;
      
      // Would execute with actual database client
      // const results = await db.query(query, [userId]);
      // return results;
      
      // For now, return null to indicate no database integration yet
      return null;
      
    } catch (error) {
      logger.log(`Database consent query failed: ${error}`);
      return null;
    }
  }

  /**
   * Check if user has valid database-level consent
   */
  private hasValidDatabaseConsent(dbConsents: Record<string, unknown>, consentType: string): boolean {
    if (!dbConsents || !Array.isArray(dbConsents)) {
      return false;
    }

    const consent = dbConsents.find(c => c.consent_type === consentType);
    
    if (!consent || !consent.granted) {
      return false;
    }

    // Check expiration
    if (consent.expires_at && new Date(consent.expires_at) < new Date()) {
      return false;
    }

    // Check withdrawal
    if (consent.withdrawn) {
      return false;
    }

    return true;
  }

  /**
   * Map data category to required consent type
   */
  private mapDataCategoryToConsentType(dataCategory: string): string {
    const mappings: Record<string, string> = {
      'usage_data': 'ANALYTICS',
      'behavior_data': 'ANALYTICS',
      'performance_data': 'ANALYTICS',
      'contact_data': 'MARKETING',
      'preference_data': 'PERSONALIZATION',
      'social_data': 'SOCIAL_MEDIA',
      'sharing_data': 'SOCIAL_MEDIA',
      'advertising_data': 'MARKETING',
      'profile_data': 'FUNCTIONAL',
      'security_data': 'FUNCTIONAL'
    };

    return mappings[dataCategory] || 'FUNCTIONAL';
  }

  /**
   * Create a consent violation record
   */
  private createViolation(
    context: ConsentContext,
    rule: ConsentEnforcementRule,
    missingConsents: string[],
    request: FastifyRequest,
    reason?: string
  ): ConsentViolation {
    const violation: ConsentViolation = {
      id: this.generateViolationId(),
      timestamp: new Date(),
      userId: context.userId,
      sessionId: context.sessionId,
      path: request.url,
      method: request.method,
      rule,
      missingConsents,
      action: this.determineViolationAction(rule),
      reason: reason || `Missing required consents: ${missingConsents.join(', ')}`
    };

    // Store violation for reporting
    this.violations.push(violation);
    
    // Keep only recent violations in memory
    if (this.violations.length > 1000) {
      this.violations = this.violations.slice(-500);
    }

    return violation;
  }

  /**
   * Handle consent violations based on rule configuration
   */
  private async handleConsentViolation(
    violation: ConsentViolation,
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    // Log all violations
    logger.log(
      `Consent violation: User ${violation.userId} attempted ${violation.method} ${violation.path} ` +
      `without required consents: ${violation.missingConsents.join(', ')}`
    );

    switch (violation.action) {
    case 'blocked':
      await this.blockRequest(violation, reply);
      break;
        
    case 'allowed_with_warning':
      await this.allowWithWarning(violation, reply);
      break;
        
    case 'audit_logged':
      // Just log - request continues normally
      await this.auditLog(violation);
      break;
    }
  }

  /**
   * Block request due to consent violation
   */
  private async blockRequest(violation: ConsentViolation, reply: FastifyReply): Promise<void> {
    reply.code(403).send({
      error: 'Consent Required',
      message: 'This operation requires additional consent',
      required_consents: violation.missingConsents,
      violation_id: violation.id,
      consent_url: '/api/consent/preferences'
    });
  }

  /**
   * Allow request but add warning headers
   */
  private async allowWithWarning(violation: ConsentViolation, reply: FastifyReply): Promise<void> {
    reply.header('X-Consent-Warning', 'true');
    reply.header('X-Missing-Consents', violation.missingConsents.join(','));
    reply.header('X-Violation-Id', violation.id);
    
    await this.auditLog(violation);
  }

  /**
   * Log violation for audit purposes
   */
  private async auditLog(violation: ConsentViolation): Promise<void> {
    // Here you would typically log to your audit system
    logger.log(`AUDIT: Consent violation logged - ${violation.id}`);
  }

  /**
   * Add or update enforcement rule
   */
  public addEnforcementRule(rule: ConsentEnforcementRule): void {
    this.enforcementRules.set(rule.id, rule);
    logger.log(`Consent enforcement rule added: ${rule.name}`);
  }

  /**
   * Remove enforcement rule
   */
  public removeEnforcementRule(ruleId: string): void {
    this.enforcementRules.delete(ruleId);
    logger.log(`Consent enforcement rule removed: ${ruleId}`);
  }

  /**
   * Get enforcement statistics
   */
  public getEnforcementStats(): Record<string, unknown> {
    const recentViolations = this.violations.filter(
      v => Date.now() - v.timestamp.getTime() < 24 * 60 * 60 * 1000 // Last 24 hours
    );

    return {
      totalRules: this.enforcementRules.size,
      enabledRules: Array.from(this.enforcementRules.values()).filter(r => r.enabled).length,
      recentViolations: recentViolations.length,
      violationsByAction: this.groupBy(recentViolations, 'action'),
      violationsByRule: this.groupBy(recentViolations, 'rule.name'),
      topViolatingUsers: this.getTopViolatingUsers(recentViolations)
    };
  }

  /**
   * Helper methods
   */
  private extractIPAddress(request: FastifyRequest): string {
    return (request.headers['x-forwarded-for'] as string)?.split(',')[0] || 
           (request.headers['x-real-ip'] as string) || 
           request.ip || 
           'unknown';
  }

  private inferProcessingPurpose(request: FastifyRequest): string {
    const path = request.url.toLowerCase();
    
    if (path.includes('/analytics')) return 'analytics';
    if (path.includes('/marketing')) return 'marketing';
    if (path.includes('/profile') || path.includes('/user')) return 'personalization';
    if (path.includes('/social')) return 'social_media';
    if (path.includes('/ads') || path.includes('/advertising')) return 'advertising';
    
    return 'functional';
  }

  private isExemptPath(path: string): boolean {
    return this.exemptPaths.has(path) || path.startsWith('/api/consent');
  }

  private determineViolationAction(rule: ConsentEnforcementRule): ConsentViolation['action'] {
    switch (rule.enforcementLevel) {
    case 'strict':
      return 'blocked';
    case 'permissive':
      return 'allowed_with_warning';
    case 'audit_only':
      return 'audit_logged';
    default:
      return 'blocked';
    }
  }

  private generateViolationId(): string {
    return `viol_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private groupBy(array: Array<Record<string, unknown>>, key: string): Record<string, number> {
    return array.reduce((result, item) => {
      const value = key.split('.').reduce((obj, k) => obj?.[k], item) || 'unknown';
      result[value] = (result[value] || 0) + 1;
      return result;
    }, {});
  }

  private getTopViolatingUsers(violations: ConsentViolation[]): Array<{userId: string; count: number}> {
    const userCounts = this.groupBy(violations, 'userId');
    return Object.entries(userCounts)
      .map(([userId, count]) => ({ userId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  /**
   * Cross-service consent propagation
   */
  public async propagateConsentChange(userId: string, consentType: string, granted: boolean): Promise<void> {
    try {
      logger.log(`Propagating consent change: User ${userId}, Type ${consentType}, Granted: ${granted}`);
      
      // Update internal cache if applicable
      await this.updateConsentCache(userId, consentType, granted);
      
      // Notify other services of consent change
      await this.notifyServicesOfConsentChange(userId, consentType, granted);
      
      // Update enforcement rules if necessary
      await this.updateEnforcementRulesForConsent(userId, consentType, granted);
      
      logger.log(`Consent propagation completed for user ${userId}`);
      
    } catch (error) {
      logger.log(`Consent propagation failed: ${error}`);
      throw error;
    }
  }

  /**
   * Update consent cache
   */
  private async updateConsentCache(userId: string, consentType: string, granted: boolean): Promise<void> {
    // Implementation would update Redis cache or similar
    // For now, log the action
    logger.log(`Cache update: User ${userId}, ${consentType} = ${granted}`);
  }

  /**
   * Notify other services of consent changes
   */
  private async notifyServicesOfConsentChange(userId: string, consentType: string, granted: boolean): Promise<void> {
    const services = this.getServicesRequiringConsentNotification(consentType);
    
    for (const service of services) {
      try {
        await this.sendConsentNotification(service, userId, consentType, granted);
      } catch (error) {
        logger.log(`Failed to notify service ${service}: ${error}`);
        // Continue with other services despite individual failures
      }
    }
  }

  /**
   * Get services that need to be notified of consent changes
   */
  private getServicesRequiringConsentNotification(consentType: string): string[] {
    const serviceMap: Record<string, string[]> = {
      'ANALYTICS': ['analytics-service', 'metrics-service'],
      'MARKETING': ['email-service', 'campaign-service'],
      'SOCIAL_MEDIA': ['social-service', 'sharing-service'],
      'PERSONALIZATION': ['recommendation-service', 'personalization-service']
    };

    return serviceMap[consentType] || [];
  }

  /**
   * Send consent notification to service
   */
  private async sendConsentNotification(
    service: string,
    userId: string,
    consentType: string,
    granted: boolean
  ): Promise<void> {
    // Implementation would send HTTP request, message queue, or similar
    logger.log(`Notifying ${service}: User ${userId}, ${consentType} = ${granted}`);
  }

  /**
   * Update enforcement rules for specific consent
   */
  private async updateEnforcementRulesForConsent(
    userId: string,
    consentType: string,
    granted: boolean
  ): Promise<void> {
    // Implementation would update user-specific rules if needed
    logger.log(`Updated enforcement rules for user ${userId}, ${consentType} = ${granted}`);
  }

  /**
   * Cookie and tracking enforcement
   */
  public enforceCookieConsent(request: FastifyRequest, reply: FastifyReply): void {
    const cookies = request.cookies || {};
    const userAgent = request.headers['user-agent'] || '';
    const userId = (request as any).user?.id;

    // Check for tracking cookies that require consent
    this.validateTrackingCookies(cookies, userId, reply);
    
    // Set appropriate cookie headers based on consent
    this.setConsentCookieHeaders(reply, userId);
    
    // Block tracking scripts if no consent
    this.blockTrackingScripts(request, reply, userId);
  }

  /**
   * Validate tracking cookies against consent
   */
  private validateTrackingCookies(cookies: Record<string, string>, userId: string, reply: FastifyReply): void {
    const trackingCookies = this.identifyTrackingCookies(cookies);
    
    for (const [cookieName, cookieValue] of Object.entries(trackingCookies)) {
      const requiredConsent = this.getRequiredConsentForCookie(cookieName);
      
      if (requiredConsent && !this.hasUserConsent(userId, requiredConsent)) {
        // Remove unauthorized tracking cookie
        reply.clearCookie(cookieName);
        logger.log(`Removed unauthorized tracking cookie: ${cookieName} for user ${userId}`);
      }
    }
  }

  /**
   * Identify tracking cookies from request
   */
  private identifyTrackingCookies(cookies: Record<string, string>): Record<string, string> {
    const trackingPrefixes = ['_ga', '_gid', '_fbp', '_gcl', 'utm_', 'pixel_'];
    const trackingCookies: Record<string, string> = {};

    for (const [name, value] of Object.entries(cookies)) {
      if (trackingPrefixes.some(prefix => name.startsWith(prefix))) {
        trackingCookies[name] = value;
      }
    }

    return trackingCookies;
  }

  /**
   * Get required consent type for specific cookie
   */
  private getRequiredConsentForCookie(cookieName: string): string | null {
    if (cookieName.startsWith('_ga') || cookieName.startsWith('_gid')) {
      return 'ANALYTICS';
    }
    if (cookieName.startsWith('_fbp') || cookieName.startsWith('pixel_')) {
      return 'MARKETING';
    }
    if (cookieName.startsWith('utm_')) {
      return 'MARKETING';
    }
    
    return null; // No specific consent required
  }

  /**
   * Set consent-based cookie headers
   */
  private setConsentCookieHeaders(reply: FastifyReply, userId: string): void {
    // Set SameSite and Secure attributes based on consent
    if (this.hasUserConsent(userId, 'FUNCTIONAL')) {
      reply.header('Set-Cookie-SameSite', 'Lax');
    } else {
      reply.header('Set-Cookie-SameSite', 'Strict');
    }
    
    // Always set Secure in production
    reply.header('Set-Cookie-Secure', 'true');
    reply.header('Set-Cookie-HttpOnly', 'true');
  }

  /**
   * Block tracking scripts if no consent
   */
  private blockTrackingScripts(request: FastifyRequest, reply: FastifyReply, userId: string): void {
    const path = request.url.toLowerCase();
    
    // Block analytics scripts
    if (path.includes('analytics') && !this.hasUserConsent(userId, 'ANALYTICS')) {
      reply.header('X-Robots-Tag', 'noindex, nofollow');
      reply.header('X-Content-Security-Policy', 'script-src \'none\'');
    }
    
    // Block marketing pixels
    if (path.includes('pixel') && !this.hasUserConsent(userId, 'MARKETING')) {
      reply.header('X-Block-Marketing', 'true');
    }
  }

  /**
   * Check if user has specific consent (simplified)
   */
  private hasUserConsent(userId: string, consentType: string): boolean {
    // This would check against actual consent records
    // For now, return false to be conservative
    return false;
  }

  /**
   * Initialize default enforcement rules
   */
  private initializeDefaultRules(): void {
    // Analytics enforcement
    this.addEnforcementRule({
      id: 'analytics_enforcement',
      name: 'Analytics Data Collection',
      description: 'Enforce consent for analytics tracking',
      paths: ['/api/analytics/*', '/api/events/*', '/api/metrics/*'],
      methods: ['POST', 'PUT'],
      requiredConsents: ['ANALYTICS'],
      dataCategories: ['usage_data', 'behavior_data'],
      enforcementLevel: 'strict',
      exemptions: ['admin', 'system'],
      enabled: true
    });

    // Marketing enforcement
    this.addEnforcementRule({
      id: 'marketing_enforcement',
      name: 'Marketing Communications',
      description: 'Enforce consent for marketing activities',
      paths: ['/api/marketing/*', '/api/campaigns/*', '/api/newsletters/*'],
      methods: ['POST', 'PUT'],
      requiredConsents: ['MARKETING'],
      dataCategories: ['contact_data', 'preference_data'],
      enforcementLevel: 'strict',
      exemptions: [],
      enabled: true
    });

    // Personalization enforcement
    this.addEnforcementRule({
      id: 'personalization_enforcement',
      name: 'Personalization Features',
      description: 'Enforce consent for personalized experiences',
      paths: ['/api/recommendations/*', '/api/personalization/*'],
      methods: ['GET', 'POST'],
      requiredConsents: ['PERSONALIZATION'],
      dataCategories: ['behavior_data', 'preference_data'],
      enforcementLevel: 'permissive',
      exemptions: [],
      enabled: true
    });

    // Social media enforcement
    this.addEnforcementRule({
      id: 'social_media_enforcement',
      name: 'Social Media Integration',
      description: 'Enforce consent for social features',
      paths: ['/api/social/*', '/api/sharing/*'],
      methods: ['POST', 'PUT'],
      requiredConsents: ['SOCIAL_MEDIA'],
      dataCategories: ['social_data', 'sharing_data'],
      enforcementLevel: 'strict',
      exemptions: [],
      enabled: true
    });

    // Data export enforcement
    this.addEnforcementRule({
      id: 'data_export_enforcement',
      name: 'Data Export Operations',
      description: 'Enforce consent for data exports',
      paths: ['/api/export/*', '/api/reports/export/*'],
      methods: ['GET', 'POST'],
      requiredConsents: ['ANALYTICS', 'FUNCTIONAL'],
      dataCategories: ['all_user_data'],
      enforcementLevel: 'strict',
      exemptions: ['admin'],
      enabled: true
    });
  }
}
