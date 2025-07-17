// Epic 17.1.6 - Audit Middleware for Automatic Event Logging

import { FastifyRequest, FastifyReply } from 'fastify';
import { AuditService } from '../services/audit-service';
import { 
  AuditEventType, 
  AuditCategory, 
  AuditSeverity,
  AuditContext,
  CreateAuditEventRequest
} from '../database/audit-models';

export interface AuditMiddlewareOptions {
  enabled?: boolean;
  excludeRoutes?: string[];
  excludeMethods?: string[];
  logSuccessfulRequests?: boolean;
  logFailedRequests?: boolean;
  logSecurityEvents?: boolean;
  sensitiveHeaders?: string[];
  sensitiveParams?: string[];
}

export class AuditMiddleware {
  private options: Required<AuditMiddlewareOptions>;

  constructor(
    private auditService: AuditService,
    options: AuditMiddlewareOptions = {}
  ) {
    this.options = {
      enabled: true,
      excludeRoutes: ['/health', '/metrics', '/favicon.ico'],
      excludeMethods: ['OPTIONS'],
      logSuccessfulRequests: false, // Too noisy for most cases
      logFailedRequests: true,
      logSecurityEvents: true,
      sensitiveHeaders: ['authorization', 'cookie', 'x-api-key'],
      sensitiveParams: ['password', 'token', 'secret', 'key'],
      ...options
    };
  }

  /**
   * Main middleware function
   */
  middleware() {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      if (!this.options.enabled) {
        return;
      }

      // Skip excluded routes and methods
      if (this.shouldSkipRequest(request)) {
        return;
      }

      const startTime = Date.now();
      const context = this.createAuditContext(request);

      // Add audit context to request
      request.auditContext = context;
      request.audit = this.createAuditHelpers(context);

      // Log security-related events immediately
      if (this.options.logSecurityEvents) {
        await this.logSecurityEvents(request, context);
      }

      // Hook into response to log completion
      reply.addHook('onSend', async (request, reply, payload) => {
        const duration = Date.now() - startTime;
        await this.logRequestCompletion(request, reply, duration, context);
        return payload;
      });

      // Hook into errors
      reply.addHook('onError', async (request, reply, error) => {
        const duration = Date.now() - startTime;
        await this.logRequestError(request, reply, error, duration, context);
      });
    };
  }

  /**
   * Feature Toggle specific audit methods
   */
  createFeatureToggleAuditor(context: AuditContext) {
    return {
      logToggleCreated: async (toggleId: string, toggleData: any) => {
        await this.auditService.logToggleCreated(toggleId, toggleData, context);
      },

      logToggleUpdated: async (toggleId: string, beforeData: any, afterData: any) => {
        await this.auditService.logToggleUpdated(toggleId, beforeData, afterData, context);
      },

      logToggleEnabled: async (toggleId: string, toggleName: string) => {
        await this.auditService.logToggleEnabled(toggleId, toggleName, context);
      },

      logToggleDisabled: async (toggleId: string, toggleName: string) => {
        await this.auditService.logToggleDisabled(toggleId, toggleName, context);
      },

      logToggleDeleted: async (toggleId: string, toggleName: string) => {
        await this.auditService.logEvent({
          eventType: AuditEventType.TOGGLE_DELETED,
          category: AuditCategory.DATA_MODIFICATION,
          severity: AuditSeverity.HIGH,
          resourceType: 'feature_toggle',
          resourceId: toggleId,
          resourceName: toggleName,
          action: 'delete',
          description: `Feature toggle "${toggleName}" was deleted`,
          outcome: 'success'
        }, context);
      }
    };
  }

  /**
   * Schedule specific audit methods
   */
  createScheduleAuditor(context: AuditContext) {
    return {
      logScheduleCreated: async (scheduleId: string, scheduleData: any) => {
        await this.auditService.logScheduleCreated(scheduleId, scheduleData, context);
      },

      logScheduleExecuted: async (scheduleId: string, scheduleName: string, execution: any) => {
        await this.auditService.logScheduleExecuted(scheduleId, scheduleName, execution, context);
      },

      logScheduleDeleted: async (scheduleId: string, scheduleName: string) => {
        await this.auditService.logEvent({
          eventType: AuditEventType.SCHEDULE_DELETED,
          category: AuditCategory.DATA_MODIFICATION,
          severity: AuditSeverity.MEDIUM,
          resourceType: 'schedule',
          resourceId: scheduleId,
          resourceName: scheduleName,
          action: 'delete',
          description: `Schedule "${scheduleName}" was deleted`,
          outcome: 'success'
        }, context);
      },

      logSchedulePaused: async (scheduleId: string, scheduleName: string) => {
        await this.auditService.logEvent({
          eventType: AuditEventType.SCHEDULE_PAUSED,
          category: AuditCategory.SYSTEM_CONFIGURATION,
          severity: AuditSeverity.MEDIUM,
          resourceType: 'schedule',
          resourceId: scheduleId,
          resourceName: scheduleName,
          action: 'pause',
          description: `Schedule "${scheduleName}" was paused`,
          outcome: 'success'
        }, context);
      },

      logScheduleResumed: async (scheduleId: string, scheduleName: string) => {
        await this.auditService.logEvent({
          eventType: AuditEventType.SCHEDULE_RESUMED,
          category: AuditCategory.SYSTEM_CONFIGURATION,
          severity: AuditSeverity.MEDIUM,
          resourceType: 'schedule',
          resourceId: scheduleId,
          resourceName: scheduleName,
          action: 'resume',
          description: `Schedule "${scheduleName}" was resumed`,
          outcome: 'success'
        }, context);
      }
    };
  }

  /**
   * User management audit methods
   */
  createUserAuditor(context: AuditContext) {
    return {
      logUserCreated: async (userId: string, userData: any) => {
        await this.auditService.logEvent({
          eventType: AuditEventType.USER_CREATED,
          category: AuditCategory.DATA_MODIFICATION,
          severity: AuditSeverity.MEDIUM,
          resourceType: 'user',
          resourceId: userId,
          resourceName: userData.email,
          action: 'create',
          description: `User ${userData.email} was created`,
          outcome: 'success',
          afterValue: this.sanitizeUserData(userData)
        }, context);
      },

      logUserUpdated: async (userId: string, beforeData: any, afterData: any) => {
        await this.auditService.logEvent({
          eventType: AuditEventType.USER_UPDATED,
          category: AuditCategory.DATA_MODIFICATION,
          severity: AuditSeverity.MEDIUM,
          resourceType: 'user',
          resourceId: userId,
          resourceName: afterData.email,
          action: 'update',
          description: `User ${afterData.email} was updated`,
          outcome: 'success',
          beforeValue: this.sanitizeUserData(beforeData),
          afterValue: this.sanitizeUserData(afterData)
        }, context);
      },

      logUserDeleted: async (userId: string, userEmail: string) => {
        await this.auditService.logEvent({
          eventType: AuditEventType.USER_DELETED,
          category: AuditCategory.DATA_MODIFICATION,
          severity: AuditSeverity.HIGH,
          resourceType: 'user',
          resourceId: userId,
          resourceName: userEmail,
          action: 'delete',
          description: `User ${userEmail} was deleted`,
          outcome: 'success'
        }, context);
      },

      logPasswordChanged: async (userId: string, userEmail: string) => {
        await this.auditService.logEvent({
          eventType: AuditEventType.PASSWORD_CHANGED,
          category: AuditCategory.SECURITY,
          severity: AuditSeverity.MEDIUM,
          resourceType: 'user',
          resourceId: userId,
          resourceName: userEmail,
          action: 'change_password',
          description: `Password changed for user ${userEmail}`,
          outcome: 'success'
        }, context);
      }
    };
  }

  /**
   * System configuration audit methods
   */
  createSystemAuditor(context: AuditContext) {
    return {
      logConfigurationChanged: async (configKey: string, beforeValue: any, afterValue: any) => {
        await this.auditService.logEvent({
          eventType: AuditEventType.CONFIGURATION_CHANGED,
          category: AuditCategory.SYSTEM_CONFIGURATION,
          severity: AuditSeverity.HIGH,
          resourceType: 'configuration',
          resourceId: configKey,
          resourceName: configKey,
          action: 'update_config',
          description: `System configuration "${configKey}" was changed`,
          outcome: 'success',
          beforeValue,
          afterValue
        }, context);
      },

      logSystemStartup: async () => {
        await this.auditService.logEvent({
          eventType: AuditEventType.SYSTEM_STARTUP,
          category: AuditCategory.SYSTEM_CONFIGURATION,
          severity: AuditSeverity.MEDIUM,
          resourceType: 'system',
          action: 'startup',
          description: 'System started up',
          outcome: 'success'
        }, context);
      },

      logSystemShutdown: async () => {
        await this.auditService.logEvent({
          eventType: AuditEventType.SYSTEM_SHUTDOWN,
          category: AuditCategory.SYSTEM_CONFIGURATION,
          severity: AuditSeverity.MEDIUM,
          resourceType: 'system',
          action: 'shutdown',
          description: 'System shut down',
          outcome: 'success'
        }, context);
      }
    };
  }

  // Private helper methods
  private shouldSkipRequest(request: FastifyRequest): boolean {
    // Skip excluded routes
    if (this.options.excludeRoutes.some(route => request.url.includes(route))) {
      return true;
    }

    // Skip excluded methods
    if (this.options.excludeMethods.includes(request.method)) {
      return true;
    }

    return false;
  }

  private createAuditContext(request: FastifyRequest): AuditContext {
    return {
      actorId: (request as any).user?.id,
      actorType: (request as any).user ? 'user' : 'anonymous',
      actorEmail: (request as any).user?.email,
      actorName: (request as any).user?.name,
      actorRole: (request as any).user?.role,
      sessionId: (request as any).sessionID || (request as any).session?.id,
      requestId: request.id || request.headers['x-request-id'] as string,
      correlationId: request.headers['x-correlation-id'] as string,
      ipAddress: this.getClientIP(request),
      userAgent: request.headers['user-agent'],
      metadata: {
        method: request.method,
        url: request.url,
        headers: this.sanitizeHeaders(request.headers),
        params: this.sanitizeParams(request.params as any),
        query: this.sanitizeParams(request.query as any)
      }
    };
  }

  private createAuditHelpers(context: AuditContext) {
    return {
      log: (eventRequest: CreateAuditEventRequest) => 
        this.auditService.logEvent(eventRequest, context),
      
      logSuccess: (action: string, resourceType: string, resourceId?: string, description?: string) =>
        this.auditService.logEvent({
          eventType: AuditEventType.API_REQUEST,
          category: AuditCategory.DATA_MODIFICATION,
          severity: AuditSeverity.LOW,
          resourceType,
          resourceId,
          action,
          description: description || `${action} performed on ${resourceType}`,
          outcome: 'success'
        }, context),

      logFailure: (action: string, resourceType: string, error: any, resourceId?: string) =>
        this.auditService.logEvent({
          eventType: AuditEventType.API_ERROR,
          category: AuditCategory.ERROR,
          severity: AuditSeverity.HIGH,
          resourceType,
          resourceId,
          action,
          description: `${action} failed on ${resourceType}: ${error.message}`,
          outcome: 'failure',
          error: {
            code: error.code || 'UNKNOWN_ERROR',
            message: error.message
          }
        }, context),

      toggles: this.createFeatureToggleAuditor(context),
      schedules: this.createScheduleAuditor(context),
      users: this.createUserAuditor(context),
      system: this.createSystemAuditor(context)
    };
  }

  private async logSecurityEvents(request: FastifyRequest, context: AuditContext): Promise<void> {
    // Log suspicious patterns
    const userAgent = request.headers['user-agent'] || '';
    const ip = this.getClientIP(request);

    // Check for suspicious user agents
    const suspiciousUAPatterns = [
      /bot/i, /crawler/i, /spider/i, /scraper/i
    ];

    if (suspiciousUAPatterns.some(pattern => pattern.test(userAgent))) {
      await this.auditService.logSuspiciousActivity(
        `Suspicious user agent detected: ${userAgent}`,
        context,
        { userAgent, ip, reason: 'suspicious_user_agent' }
      );
    }

    // Check for rapid requests (basic rate limiting detection)
    // This would typically integrate with a rate limiting service
    
    // Check for authentication attempts on protected routes
    if (request.url.includes('/auth') || request.url.includes('/login')) {
      // This will be logged by the authentication handler
    }
  }

  private async logRequestCompletion(
    request: FastifyRequest, 
    reply: FastifyReply, 
    duration: number,
    context: AuditContext
  ): Promise<void> {
    const shouldLog = (reply.statusCode >= 400 && this.options.logFailedRequests) ||
                     (reply.statusCode < 400 && this.options.logSuccessfulRequests);

    if (shouldLog) {
      await this.auditService.logAPIRequest(
        request.url,
        request.method,
        reply.statusCode,
        context,
        duration
      );
    }

    // Always log failed requests with more detail
    if (reply.statusCode >= 400) {
      await this.auditService.logEvent({
        eventType: AuditEventType.API_ERROR,
        category: AuditCategory.ERROR,
        severity: reply.statusCode >= 500 ? AuditSeverity.HIGH : AuditSeverity.MEDIUM,
        resourceType: 'api_endpoint',
        resourceId: `${request.method}_${request.url}`,
        action: request.method.toLowerCase(),
        description: `API request failed: ${request.method} ${request.url} returned ${reply.statusCode}`,
        outcome: 'failure',
        metadata: {
          statusCode: reply.statusCode,
          duration,
          endpoint: request.url,
          method: request.method
        }
      }, context);
    }
  }

  private async logRequestError(
    request: FastifyRequest,
    reply: FastifyReply,
    error: Error,
    duration: number,
    context: AuditContext
  ): Promise<void> {
    await this.auditService.logEvent({
      eventType: AuditEventType.API_ERROR,
      category: AuditCategory.ERROR,
      severity: AuditSeverity.HIGH,
      resourceType: 'api_endpoint',
      resourceId: `${request.method}_${request.url}`,
      action: request.method.toLowerCase(),
      description: `API request error: ${error.message}`,
      outcome: 'failure',
      error: {
        code: (error as any).code || 'INTERNAL_ERROR',
        message: error.message,
        stack: error.stack
      },
      metadata: {
        duration,
        endpoint: request.url,
        method: request.method
      }
    }, context);
  }

  private getClientIP(request: FastifyRequest): string {
    // Check various headers for the real IP
    return (
      request.headers['x-forwarded-for'] as string ||
      request.headers['x-real-ip'] as string ||
      request.ip ||
      request.socket?.remoteAddress ||
      'unknown'
    )?.split(',')[0]?.trim() || 'unknown';
  }

  private sanitizeHeaders(headers: any): any {
    const sanitized = { ...headers };
    
    this.options.sensitiveHeaders.forEach(header => {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }

  private sanitizeParams(params: any): any {
    if (!params || typeof params !== 'object') return params;
    
    const sanitized = { ...params };
    
    this.options.sensitiveParams.forEach(param => {
      if (sanitized[param]) {
        sanitized[param] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }

  private sanitizeUserData(userData: any): any {
    if (!userData) return userData;
    
    const sanitized = { ...userData };
    
    // Always remove sensitive fields from user data
    delete sanitized.password;
    delete sanitized.passwordHash;
    delete sanitized.salt;
    delete sanitized.resetToken;
    delete sanitized.refreshToken;
    
    return sanitized;
  }
}

// Extend FastifyRequest interface to include audit context
declare module 'fastify' {
  interface FastifyRequest {
    auditContext?: AuditContext;
    audit?: {
      log: (eventRequest: CreateAuditEventRequest) => Promise<void>;
      logSuccess: (action: string, resourceType: string, resourceId?: string, description?: string) => Promise<void>;
      logFailure: (action: string, resourceType: string, error: any, resourceId?: string) => Promise<void>;
      toggles: ReturnType<AuditMiddleware['createFeatureToggleAuditor']>;
      schedules: ReturnType<AuditMiddleware['createScheduleAuditor']>;
      users: ReturnType<AuditMiddleware['createUserAuditor']>;
      system: ReturnType<AuditMiddleware['createSystemAuditor']>;
    };
  }
}