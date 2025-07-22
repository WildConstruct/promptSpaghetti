/**
 * Evidence Access Audit Middleware
 * 
 * Automatic middleware that intercepts evidence access requests and logs them
 * to the audit trail system. Integrates with existing access control patterns.
 * 
 * Task: T-1752989143998-782 - Add evidence access audit trail
 * Epic: 18 - Technical Debt & Refactoring
 */

import { Request, Response, NextFunction } from 'express';
import { FastifyRequest, FastifyReply } from 'fastify';
import { EvidenceAccessAuditService, EvidenceAccessAction, EvidenceAccessOutcome } from '../services/security/EvidenceAccessAuditService';
import { AccessControlFramework, AccessControlContext } from '../services/security/AccessControlFramework';
import { performance } from 'perf_hooks';
import crypto from 'crypto';

interface AuditableRequest extends Request {
  evidenceId?: string;
  evidenceAction?: EvidenceAccessAction;
  user?: {
    id: string;
    sessionId?: string;
    roles?: string[];
    permissions?: string[];
  };
  correlationId?: string;
  startTime?: number;
}

interface FastifyAuditableRequest extends FastifyRequest {
  evidenceId?: string;
  evidenceAction?: EvidenceAccessAction;
  user?: {
    id: string;
    sessionId?: string;
    roles?: string[];
    permissions?: string[];
  };
  correlationId?: string;
  startTime?: number;
}

export class EvidenceAccessAuditMiddleware {
  private auditService: EvidenceAccessAuditService;
  private accessControlFramework: AccessControlFramework;
  
  constructor(
    auditService: EvidenceAccessAuditService,
    accessControlFramework: AccessControlFramework
  ) {
    this.auditService = auditService;
    this.accessControlFramework = accessControlFramework;
  }

  /**
   * Express middleware for evidence access auditing
   */
  expressMiddleware() {
    return async (req: AuditableRequest, res: Response, next: NextFunction) => {
      // Skip non-evidence requests
      if (!this.isEvidenceRequest(req)) {
        return next();
      }

      // Initialize audit context
      req.correlationId = crypto.randomUUID();
      req.startTime = performance.now();
      
      // Extract evidence context from request
      const evidenceContext = this.extractEvidenceContext(req);
      
      // Create access control context
      const accessContext = await this.createAccessControlContext(req);
      
      // Hook into response to capture outcome
      const originalSend = res.send;
      res.send = function(body: any) {
        // Determine outcome based on status code and response
        const outcome = res.statusCode >= 200 && res.statusCode < 300 
          ? EvidenceAccessOutcome.SUCCESS 
          : res.statusCode === 403 
            ? EvidenceAccessOutcome.DENIED 
            : EvidenceAccessOutcome.ERROR;
        
        // Perform audit logging asynchronously
        setImmediate(async () => {
          try {
            await auditService.recordEvidenceAccess(
              accessContext,
              evidenceContext.evidenceId,
              evidenceContext.action,
              outcome,
              {
                responseStatus: res.statusCode,
                processingTime: performance.now() - (req.startTime || 0),
                responseSize: Buffer.isBuffer(body) ? body.length : JSON.stringify(body).length,
                correlationId: req.correlationId,
                requestPath: req.path,
                requestMethod: req.method
              }
            );
          } catch (auditError) {
            console.error('Audit logging failed:', auditError);
          }
        });
        
        return originalSend.call(this, body);
      };
      
      const auditService = this.auditService;
      
      next();
    };
  }

  /**
   * Fastify middleware for evidence access auditing
   */
  fastifyMiddleware() {
    return async (request: FastifyAuditableRequest, reply: FastifyReply) => {
      // Skip non-evidence requests
      if (!this.isEvidenceRequestFastify(request)) {
        return;
      }

      // Initialize audit context
      request.correlationId = crypto.randomUUID();
      request.startTime = performance.now();
      
      // Extract evidence context
      const evidenceContext = this.extractEvidenceContextFastify(request);
      
      // Create access control context
      const accessContext = await this.createAccessControlContextFastify(request);
      
      // Hook into reply to capture outcome
      reply.addHook('onSend', async (request, reply, payload) => {
        const outcome = reply.statusCode >= 200 && reply.statusCode < 300 
          ? EvidenceAccessOutcome.SUCCESS 
          : reply.statusCode === 403 
            ? EvidenceAccessOutcome.DENIED 
            : EvidenceAccessOutcome.ERROR;
        
        // Perform audit logging
        try {
          await this.auditService.recordEvidenceAccess(
            accessContext,
            evidenceContext.evidenceId,
            evidenceContext.action,
            outcome,
            {
              responseStatus: reply.statusCode,
              processingTime: performance.now() - (request.startTime || 0),
              responseSize: typeof payload === 'string' ? payload.length : Buffer.isBuffer(payload) ? payload.length : 0,
              correlationId: request.correlationId,
              requestPath: request.url,
              requestMethod: request.method
            }
          );
        } catch (auditError) {
          console.error('Audit logging failed:', auditError);
        }
        
        return payload;
      });
    };
  }

  /**
   * Manual audit logging for programmatic evidence access
   */
  async auditEvidenceAccess(
    userId: string,
    evidenceId: string,
    action: EvidenceAccessAction,
    context: Partial<AccessControlContext> = {},
    metadata: Record<string, any> = {}
  ): Promise<void> {
    const accessContext: AccessControlContext = {
      subject: {
        id: userId,
        type: 'user',
        sessionId: metadata.sessionId,
        roles: metadata.roles || [],
        permissions: metadata.permissions || [],
        ...context.subject
      },
      resource: {
        id: evidenceId,
        type: 'evidence',
        attributes: metadata.resourceAttributes || {},
        ...context.resource
      },
      action: {
        operation: action,
        intent: metadata.intent || 'programmatic',
        ...context.action
      },
      environment: {
        timestamp: new Date(),
        sourceIP: metadata.sourceIP || 'internal',
        userAgent: metadata.userAgent || 'system',
        applicationContext: metadata.applicationContext || 'backend',
        ...context.environment
      }
    };

    await this.auditService.recordEvidenceAccess(
      accessContext,
      evidenceId,
      action,
      EvidenceAccessOutcome.SUCCESS,
      metadata
    );
  }

  /**
   * Batch audit logging for multiple evidence accesses
   */
  async auditBatchEvidenceAccess(
    userId: string,
    evidenceAccesses: Array<{
      evidenceId: string;
      action: EvidenceAccessAction;
      outcome: EvidenceAccessOutcome;
      metadata?: Record<string, any>;
    }>,
    sharedContext: Partial<AccessControlContext> = {}
  ): Promise<void> {
    const batchCorrelationId = crypto.randomUUID();
    
    await Promise.all(
      evidenceAccesses.map(async (access, index) => {
        const accessContext: AccessControlContext = {
          subject: {
            id: userId,
            type: 'user',
            ...sharedContext.subject
          },
          resource: {
            id: access.evidenceId,
            type: 'evidence',
            ...sharedContext.resource
          },
          action: {
            operation: access.action,
            intent: 'batch_operation',
            ...sharedContext.action
          },
          environment: {
            timestamp: new Date(),
            applicationContext: 'batch_processor',
            ...sharedContext.environment
          }
        };

        await this.auditService.recordEvidenceAccess(
          accessContext,
          access.evidenceId,
          access.action,
          access.outcome,
          {
            ...access.metadata,
            batchCorrelationId,
            batchIndex: index,
            batchSize: evidenceAccesses.length
          }
        );
      })
    );
  }

  // Private helper methods

  private isEvidenceRequest(req: Request): boolean {
    // Check if request involves evidence based on path patterns
    const evidencePaths = [
      '/api/evidence',
      '/api/v1/evidence',
      '/evidence',
      '/audit/evidence'
    ];
    
    return evidencePaths.some(path => req.path.startsWith(path)) ||
           req.query.evidenceId !== undefined ||
           req.body?.evidenceId !== undefined ||
           req.params?.evidenceId !== undefined;
  }

  private isEvidenceRequestFastify(req: FastifyRequest): boolean {
    const evidencePaths = [
      '/api/evidence',
      '/api/v1/evidence', 
      '/evidence',
      '/audit/evidence'
    ];
    
    return evidencePaths.some(path => req.url.startsWith(path)) ||
           (req.query as any)?.evidenceId !== undefined ||
           (req.body as any)?.evidenceId !== undefined ||
           (req.params as any)?.evidenceId !== undefined;
  }

  private extractEvidenceContext(req: AuditableRequest): {
    evidenceId: string;
    action: EvidenceAccessAction;
  } {
    // Extract evidence ID from various sources
    const evidenceId = req.params?.evidenceId || 
                      req.query?.evidenceId || 
                      req.body?.evidenceId ||
                      this.extractEvidenceIdFromPath(req.path);
    
    // Determine action based on HTTP method and path
    const action = this.determineActionFromRequest(req.method, req.path);
    
    return { evidenceId: evidenceId as string, action };
  }

  private extractEvidenceContextFastify(req: FastifyAuditableRequest): {
    evidenceId: string;
    action: EvidenceAccessAction;
  } {
    const params = req.params as any;
    const query = req.query as any;
    const body = req.body as any;
    
    const evidenceId = params?.evidenceId || 
                      query?.evidenceId || 
                      body?.evidenceId ||
                      this.extractEvidenceIdFromPath(req.url);
    
    const action = this.determineActionFromRequest(req.method, req.url);
    
    return { evidenceId: evidenceId as string, action };
  }

  private extractEvidenceIdFromPath(path: string): string | undefined {
    // Extract evidence ID from URL path patterns like /evidence/:id
    const pathSegments = path.split('/');
    const evidenceIndex = pathSegments.findIndex(segment => segment === 'evidence');
    
    if (evidenceIndex !== -1 && evidenceIndex + 1 < pathSegments.length) {
      return pathSegments[evidenceIndex + 1];
    }
    
    return undefined;
  }

  private determineActionFromRequest(method: string, path: string): EvidenceAccessAction {
    const upperMethod = method.toUpperCase();
    
    // Check for specific action patterns in path
    if (path.includes('/export')) return EvidenceAccessAction.EXPORT;
    if (path.includes('/share')) return EvidenceAccessAction.SHARE;
    if (path.includes('/search')) return EvidenceAccessAction.SEARCH;
    if (path.includes('/classify')) return EvidenceAccessAction.CLASSIFY;
    if (path.includes('/version')) return EvidenceAccessAction.VERSION;
    if (path.includes('/backup')) return EvidenceAccessAction.BACKUP;
    if (path.includes('/restore')) return EvidenceAccessAction.RESTORE;
    
    // Map HTTP methods to actions
    switch (upperMethod) {
      case 'GET':
      case 'HEAD':
        return EvidenceAccessAction.READ;
      case 'POST':
      case 'PUT':
      case 'PATCH':
        return EvidenceAccessAction.WRITE;
      case 'DELETE':
        return EvidenceAccessAction.DELETE;
      default:
        return EvidenceAccessAction.READ;
    }
  }

  private async createAccessControlContext(req: AuditableRequest): Promise<AccessControlContext> {
    return {
      subject: {
        id: req.user?.id || 'anonymous',
        type: 'user',
        sessionId: req.user?.sessionId,
        roles: req.user?.roles || [],
        permissions: req.user?.permissions || []
      },
      resource: {
        id: req.evidenceId || 'unknown',
        type: 'evidence',
        attributes: {}
      },
      action: {
        operation: req.evidenceAction || EvidenceAccessAction.READ,
        intent: 'user_request'
      },
      environment: {
        timestamp: new Date(),
        sourceIP: this.getClientIP(req),
        userAgent: req.get('User-Agent') || 'unknown',
        applicationContext: 'web',
        networkZone: this.determineNetworkZone(this.getClientIP(req)),
        deviceType: this.detectDeviceType(req.get('User-Agent') || ''),
        securityLevel: 'standard'
      }
    };
  }

  private async createAccessControlContextFastify(req: FastifyAuditableRequest): Promise<AccessControlContext> {
    return {
      subject: {
        id: req.user?.id || 'anonymous',
        type: 'user',
        sessionId: req.user?.sessionId,
        roles: req.user?.roles || [],
        permissions: req.user?.permissions || []
      },
      resource: {
        id: req.evidenceId || 'unknown',
        type: 'evidence',
        attributes: {}
      },
      action: {
        operation: req.evidenceAction || EvidenceAccessAction.READ,
        intent: 'user_request'
      },
      environment: {
        timestamp: new Date(),
        sourceIP: this.getClientIPFastify(req),
        userAgent: req.headers['user-agent'] || 'unknown',
        applicationContext: 'api',
        networkZone: this.determineNetworkZone(this.getClientIPFastify(req)),
        deviceType: this.detectDeviceType(req.headers['user-agent'] || ''),
        securityLevel: 'standard'
      }
    };
  }

  private getClientIP(req: Request): string {
    return req.ip || 
           req.connection?.remoteAddress || 
           req.socket?.remoteAddress ||
           (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
           'unknown';
  }

  private getClientIPFastify(req: FastifyRequest): string {
    return req.ip || 
           req.connection?.remoteAddress ||
           req.socket?.remoteAddress ||
           (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
           'unknown';
  }

  private determineNetworkZone(ip: string): string {
    if (ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.16.')) {
      return 'internal';
    }
    if (ip === '127.0.0.1' || ip === '::1') {
      return 'localhost';
    }
    return 'external';
  }

  private detectDeviceType(userAgent: string): string {
    const ua = userAgent.toLowerCase();
    
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return 'mobile';
    }
    if (ua.includes('tablet') || ua.includes('ipad')) {
      return 'tablet';
    }
    if (ua.includes('bot') || ua.includes('crawler') || ua.includes('spider')) {
      return 'bot';
    }
    
    return 'desktop';
  }
}

// Utility functions for easy integration

/**
 * Creates pre-configured Express middleware instance
 */
export function createExpressAuditMiddleware(
  auditService: EvidenceAccessAuditService,
  accessControlFramework: AccessControlFramework
) {
  const middleware = new EvidenceAccessAuditMiddleware(auditService, accessControlFramework);
  return middleware.expressMiddleware();
}

/**
 * Creates pre-configured Fastify middleware instance
 */
export function createFastifyAuditMiddleware(
  auditService: EvidenceAccessAuditService,
  accessControlFramework: AccessControlFramework
) {
  const middleware = new EvidenceAccessAuditMiddleware(auditService, accessControlFramework);
  return middleware.fastifyMiddleware();
}

/**
 * Decorator for automatic audit logging of service methods
 */
export function AuditEvidenceAccess(
  action: EvidenceAccessAction,
  evidenceIdParam: string = 'evidenceId'
) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const auditService = this.auditService as EvidenceAccessAuditService;
      
      if (auditService) {
        // Extract evidence ID from method parameters
        const evidenceId = args.find(arg => 
          typeof arg === 'object' && arg !== null && arg[evidenceIdParam]
        )?.[evidenceIdParam] || args[0];
        
        const userId = this.getCurrentUserId?.() || 'system';
        
        try {
          const result = await originalMethod.apply(this, args);
          
          // Log successful access
          await auditService.auditEvidenceAccess(
            userId,
            evidenceId,
            action,
            {},
            {
              methodName: propertyKey,
              className: target.constructor.name,
              resultType: typeof result
            }
          );
          
          return result;
        } catch (error) {
          // Log failed access
          await auditService.auditEvidenceAccess(
            userId,
            evidenceId,
            action,
            {},
            {
              methodName: propertyKey,
              className: target.constructor.name,
              error: error instanceof Error ? error.message : 'Unknown error',
              outcome: EvidenceAccessOutcome.ERROR
            }
          );
          
          throw error;
        }
      }
      
      return originalMethod.apply(this, args);
    };
    
    return descriptor;
  };
}