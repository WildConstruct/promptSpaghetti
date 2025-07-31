/**
 * Session Limit Middleware
 * 
 * Middleware for enforcing session limits across different endpoints and request types.
 * Integrates with existing authentication middleware and provides real-time enforcement.
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { SessionLimitManager, SessionEnforcementAction } from '../services/SessionLimitManager';
import { SessionService } from '../auth/services/SessionService';
import { AuditService } from '../auth/services/AuditService';

}
}
export interface SessionLimitMiddlewareOptions {
  enableSessionLimits: boolean;
  skipPaths: string[];
  adminBypassEnabled: boolean;
  gracefulDegradation: boolean;
  notificationWebhooks: {
    onViolation?: string;
    onEnforcement?: string;
}
}
  };
}

}
}
export interface RequestSessionContext {
  userId?: string;
  sessionId?: string;
  organizationId?: string;
  isAdmin?: boolean;
  isPremium?: boolean;
  deviceFingerprint?: string;
  ipAddress?: string;
  country?: string;
  userAgent?: string;
}
}
}

export class SessionLimitMiddleware {
  private sessionLimitManager: SessionLimitManager;
  private sessionService: SessionService;
  private auditService: AuditService;
  private options: SessionLimitMiddlewareOptions;
  
  constructor(
    sessionLimitManager: SessionLimitManager,
    sessionService: SessionService,
    auditService: AuditService,
    options: SessionLimitMiddlewareOptions
  ) {
    this.sessionLimitManager = sessionLimitManager;
    this.sessionService = sessionService;
    this.auditService = auditService;
    this.options = options;
  }
  
  /**
   * Main middleware function for session limit enforcement
   */
  async enforce(request: FastifyRequest, reply: FastifyReply): Promise<void> {

    try {
      // Skip if session limits are disabled
      if (!this.options.enableSessionLimits) {
        return;
      }
      
      // Skip certain paths
      if (this.shouldSkipPath(request.url)) {
        return;
      }
      
      // Extract session context from request
      const sessionContext = this.extractSessionContext(request);
      
      // Skip if no user context available
      if (!sessionContext.userId) {
        return;
      }
      
      // Check admin bypass
      if (this.options.adminBypassEnabled && sessionContext.isAdmin) {
        await this.logAdminBypass(sessionContext, request);
        return;
      }
      
      // Perform session limit check
      const limitCheck = await this.sessionLimitManager.canCreateSession(
        sessionContext.userId,
        {
          ipAddress: sessionContext.ipAddress,
          organizationId: sessionContext.organizationId,
          deviceFingerprint: sessionContext.deviceFingerprint,
          country: sessionContext.country,
          userAgent: sessionContext.userAgent,
          isAdmin: sessionContext.isAdmin,
          isPremium: sessionContext.isPremium
        }
      );
      
      if (!limitCheck.allowed) {
        await this.handleLimitViolation(
          sessionContext,
          limitCheck,
          request,
          reply
        );
        return;
      }
      
      // If this is a session creation request, perform additional checks
      if (this.isSessionCreationRequest(request)) {
        await this.handleSessionCreation(sessionContext, request);
      }
      
    } catch (error) {
      console.error('Session limit middleware error:', error);
      
      if (this.options.gracefulDegradation) {
        // Log error and continue
        await this.logMiddlewareError(error, request);
        return;
      } else {
        // Fail the request
        reply.status(500).send({
          error: 'Session limit check failed',
          code: 'SESSION_LIMIT_ERROR'
        });
      }
    }
  }
  
  /**
   * Middleware for WebSocket connections
   */
  async enforceWebSocket(
    connectionId: string,
    userId: string,
    sessionData: Record<string, unknown>,
    metadata: Record<string, unknown>
  ): Promise<{ allowed: boolean; reason?: string; action?: SessionEnforcementAction }> {

    try {
      if (!this.options.enableSessionLimits) {
        return { allowed: true };
      }
      
      const limitCheck = await this.sessionLimitManager.canCreateSession(userId, {
        ipAddress: metadata.ipAddress,
        organizationId: metadata.organizationId,
        deviceFingerprint: metadata.deviceFingerprint,
        country: metadata.country,
        userAgent: metadata.userAgent,
        isAdmin: metadata.isAdmin,
        isPremium: metadata.isPremium
      });
      
      if (!limitCheck.allowed) {
        await this.auditService.logEvent({
          userId,
          action: 'websocket_connection_denied',
          details: {
            connectionId,
            reason: limitCheck.reason,
            conflictingSessions: limitCheck.conflictingSessions
  }
          ipAddress: metadata.ipAddress,
          userAgent: metadata.userAgent,
          severity: 'warning'
        });
        
        return {
          allowed: false,
          reason: limitCheck.reason,
          action: limitCheck.action
        };
      }
      
      return { allowed: true };
      
    } catch (error) {
      console.error('WebSocket session limit enforcement error:', error);
      
      if (this.options.gracefulDegradation) {
        return { allowed: true };
      } else {
        return {
          allowed: false,
          reason: 'Session limit check failed'
        };
      }
    }
  }
  
  /**
   * Middleware for API token validation
   */
  async enforceAPIToken(
    tokenId: string,
    userId: string,
    metadata: Record<string, unknown>
  ): Promise<{ allowed: boolean; reason?: string }> {

    try {
      if (!this.options.enableSessionLimits) {
        return { allowed: true };
      }
      
      // API tokens have different limits - check API-specific limits
      const apiLimitCheck = await this.checkAPITokenLimits(userId, tokenId, metadata);
      
      if (!apiLimitCheck.allowed) {
        await this.auditService.logEvent({
          userId,
          action: 'api_token_denied',
          details: {
            tokenId,
            reason: apiLimitCheck.reason,
            metadata
  }
          ipAddress: metadata.ipAddress,
          severity: 'warning'
        });
        
        return apiLimitCheck;
      }
      
      return { allowed: true };
      
    } catch (error) {
      console.error('API token session limit enforcement error:', error);
      
      if (this.options.gracefulDegradation) {
        return { allowed: true };
      } else {
        return {
          allowed: false,
          reason: 'API token limit check failed'
        };
      }
    }
  }
  
  /**
   * Real-time session monitoring middleware
   */
  async monitorActiveSession(
    sessionId: string,
    userId: string,
    activityType: string
  ): Promise<void> {

    try {
      // Update session activity
      await this.sessionService.updateSessionActivity(sessionId);
      
      // Check if session still complies with current limits
      const sessionValidation = await this.sessionService.validateSession(sessionId);
      
      if (!sessionValidation.valid) {
        await this.handleSessionTermination(sessionId, userId, sessionValidation.reason || 'Session invalid');
        return;
      }
      
      // Check for suspicious activity patterns
      await this.checkSuspiciousActivity(sessionId, userId, activityType);
      
    } catch (error) {
      console.error('Session monitoring error:', error);
    }
  }
  
  /**
   * Graceful session termination with user notification
   */
  async terminateSessionGracefully(
    sessionId: string,
    userId: string,
    reason: string,
    gracePeriodMinutes: number = 5
  ): Promise<void> {

    try {
      // Notify user of impending termination
      await this.notifyUserSessionTermination(userId, sessionId, reason, gracePeriodMinutes);
      
      // Schedule termination after grace period
      setTimeout(async () => {
        try {
          await this.sessionService.revokeSession(sessionId, reason);
          
          await this.auditService.logEvent({
            userId,
            action: 'session_terminated_grace_period',
            details: {
              sessionId,
              reason,
              gracePeriodMinutes
  }
            sessionId,
            severity: 'info'
          });
          
        } catch (error) {
          console.error('Error terminating session after grace period:', error);
        }
      }, gracePeriodMinutes * 60 * 1000);
      
    } catch (error) {
      console.error('Error in graceful session termination:', error);
      throw error;
    }
  }
  
  private extractSessionContext(request: FastifyRequest): RequestSessionContext {
    // Extract from authentication context (assuming it's set by auth middleware)
    const auth = (request as any).auth || {};
    const headers = request.headers;
    
    return {
      userId: auth.userId,
      sessionId: auth.sessionId,
      organizationId: auth.organizationId,
      isAdmin: auth.isAdmin || false,
      isPremium: auth.isPremium || false,
      deviceFingerprint: headers['x-device-fingerprint'] as string,
      ipAddress: this.getClientIP(request),
      country: headers['x-country'] as string || this.getCountryFromIP(request),
      userAgent: headers['user-agent'] as string
    };
  }
  
  private shouldSkipPath(path: string): boolean {
    return this.options.skipPaths.some(skipPath => {
      if (skipPath.includes('*')) {
        const pattern = skipPath.replace(/\*/g, '.*');
        return new RegExp(`^${pattern}$`).test(path);
      }
      return path === skipPath;
    });
  }
  
  private isSessionCreationRequest(request: FastifyRequest): boolean {
    // Detect if this is a login/session creation request
    const path = request.url;
    const method = request.method;
    
    return (
      (method === 'POST' && path.includes('/auth/login')) ||
      (method === 'POST' && path.includes('/auth/session')) ||
      (method === 'POST' && path.includes('/auth/refresh'))
    );
  }
  
  private async handleLimitViolation(
    sessionContext: RequestSessionContext,
    limitCheck: Record<string, unknown>,
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {

    // Send webhook notification if configured
    if (this.options.notificationWebhooks.onViolation) {
      await this.sendWebhookNotification(
        this.options.notificationWebhooks.onViolation,
        'session_limit_violation',
        {
          userId: sessionContext.userId,
          reason: limitCheck.reason,
          ipAddress: sessionContext.ipAddress,
          timestamp: new Date()
        }
      );
    }
    
    // Handle different types of violations
    if (limitCheck.action) {
      switch (limitCheck.action.action) {
      case 'terminate':
        // Terminate conflicting sessions
        if (limitCheck.conflictingSessions) {
          for (const sessionId of limitCheck.conflictingSessions) {
            await this.sessionService.revokeSession(
              sessionId,
              'Session terminated due to concurrent session limit'
            );
          }
        }
          
        // Allow new session
        reply.header('X-Session-Action', 'terminated_conflicting');
        return;
          
      case 'warn':
        // Send warning response but allow session
        reply.header('X-Session-Warning', limitCheck.reason);
        reply.header('X-Grace-Period', limitCheck.gracePeriodMinutes?.toString() || '5');
        return;
          
      case 'extend_grace':
        // Extend grace period for existing sessions
        reply.header('X-Session-Action', 'grace_extended');
        reply.header('X-Grace-Period', limitCheck.gracePeriodMinutes?.toString() || '5');
        return;
          
      case 'upgrade_required':
        reply.status(402).send({
          error: 'Session limit exceeded',
          code: 'UPGRADE_REQUIRED',
          message: 'Your current plan has reached its session limit. Please upgrade to continue.',
          action: 'upgrade_required',
          details: limitCheck.action.details
        });
        return;
      }
    }
    
    // Default: deny the request
    reply.status(429).send({
      error: 'Session limit exceeded',
      code: 'SESSION_LIMIT_EXCEEDED',
      message: limitCheck.reason,
      retryAfter: limitCheck.gracePeriodMinutes ? limitCheck.gracePeriodMinutes * 60 : 300
    });
  }
  
  private async handleSessionCreation(
    sessionContext: RequestSessionContext,
    request: FastifyRequest
  ): Promise<void> {

    // Additional logging and monitoring for session creation
    await this.auditService.logEvent({
      userId: sessionContext.userId!,
      action: 'session_creation_allowed',
      details: {
        ipAddress: sessionContext.ipAddress,
        deviceFingerprint: sessionContext.deviceFingerprint,
        country: sessionContext.country,
        userAgent: sessionContext.userAgent
  }
      ipAddress: sessionContext.ipAddress,
      userAgent: sessionContext.userAgent,
      severity: 'info'
    });
  }
  
  private async checkAPITokenLimits(
    userId: string,
    tokenId: string,
    metadata: Record<string, unknown>
  ): Promise<{ allowed: boolean; reason?: string }> {

    // Implementation for API token specific limits
    // This would check rate limits, concurrent API sessions, etc.
    
    // Placeholder implementation
    return { allowed: true };
  }
  
  private async checkSuspiciousActivity(
    sessionId: string,
    userId: string,
    activityType: string
  ): Promise<void> {

    // Check for patterns that might indicate account compromise
    // This is a simplified implementation
    
    const recentActivity = await this.auditService.getRecentUserActivity(userId, 60); // Last hour
    
    const rapidRequests = recentActivity.filter(
      activity => activity.action === activityType && 
      Date.now() - activity.timestamp.getTime() < 5 * 60 * 1000 // Last 5 minutes
    );
    
    if (rapidRequests.length > 100) {
      await this.auditService.logEvent({
        userId,
        action: 'suspicious_activity_detected',
        details: {
          sessionId,
          activityType,
          requestCount: rapidRequests.length,
          timeWindow: '5 minutes'
  }
        sessionId,
        severity: 'warning'
      });
    }
  }
  
  private async handleSessionTermination(
    sessionId: string,
    userId: string,
    reason: string
  ): Promise<void> {

    await this.sessionService.revokeSession(sessionId, reason);
    
    // Notify user
    await this.notifyUserSessionTermination(userId, sessionId, reason, 0);
  }
  
  private async notifyUserSessionTermination(
    userId: string,
    sessionId: string,
    reason: string,
    gracePeriodMinutes: number
  ): Promise<void> {

    // Implementation would depend on notification system
    // This could send email, push notification, or WebSocket message
    
    console.log(`Notifying user ${userId} of session termination: ${reason}`);
    
    // Log the notification
    await this.auditService.logEvent({
      userId,
      action: 'session_termination_notification_sent',
      details: {
        sessionId,
        reason,
        gracePeriodMinutes
  }
      sessionId,
      severity: 'info'
    });
  }
  
  private async logAdminBypass(
    sessionContext: RequestSessionContext,
    request: FastifyRequest
  ): Promise<void> {

    await this.auditService.logEvent({
      userId: sessionContext.userId!,
      action: 'session_limit_admin_bypass',
      details: {
        path: request.url,
        method: request.method,
        ipAddress: sessionContext.ipAddress
  }
      ipAddress: sessionContext.ipAddress,
      userAgent: sessionContext.userAgent,
      severity: 'info'
    });
  }
  
  private async logMiddlewareError(error: unknown, request: FastifyRequest): Promise<void> {

    console.error('Session limit middleware error:', error);
    
    // Log to audit system
    await this.auditService.logEvent({
      action: 'session_limit_middleware_error',
      details: {
        error: error.message,
        path: request.url,
        method: request.method
  }
      severity: 'error'
    });
  }
  
  private getClientIP(request: FastifyRequest): string {
    const forwarded = request.headers['x-forwarded-for'] as string;
    const realIP = request.headers['x-real-ip'] as string;
    
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    
    if (realIP) {
      return realIP;
    }
    
    return request.socket.remoteAddress || 'unknown';
  }
  
  private getCountryFromIP(request: FastifyRequest): string {
    // This would integrate with a GeoIP service
    // For now, return a placeholder
    return request.headers['cf-ipcountry'] as string || 'unknown';
  }
  
  private async sendWebhookNotification(
    webhookUrl: string,
    eventType: string,
    data: Record<string, unknown>
  ): Promise<void> {

    try {
      // Implementation for webhook notifications
      // This would make an HTTP POST to the webhook URL
      console.log(`Sending webhook notification to ${webhookUrl}:`, { eventType, data });
      
    } catch (error) {
      console.error('Error sending webhook notification:', error);
    }
  }
}

/**
 * Factory function to create the middleware
 */
export function createSessionLimitMiddleware(
  sessionLimitManager: SessionLimitManager,
  sessionService: SessionService,
  auditService: AuditService,
  options: Partial<SessionLimitMiddlewareOptions> = {}
) {
  const defaultOptions: SessionLimitMiddlewareOptions = {
    enableSessionLimits: true,
    skipPaths: ['/health', '/metrics', '/auth/logout'],
    adminBypassEnabled: true,
    gracefulDegradation: true,
    notificationWebhooks: {}
  };
  
  const finalOptions = { ...defaultOptions, ...options };
  
  const middleware = new SessionLimitMiddleware(
    sessionLimitManager,
    sessionService,
    auditService,
    finalOptions
  );
  
  return {
    enforce: middleware.enforce.bind(middleware),
    enforceWebSocket: middleware.enforceWebSocket.bind(middleware),
    enforceAPIToken: middleware.enforceAPIToken.bind(middleware),
    monitorActiveSession: middleware.monitorActiveSession.bind(middleware),
    terminateSessionGracefully: middleware.terminateSessionGracefully.bind(middleware)
  };
}