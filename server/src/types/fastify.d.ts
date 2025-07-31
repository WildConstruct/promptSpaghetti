/**
 * Fastify Type Augmentations
 * 
 * This file extends Fastify's built-in types to include custom properties
 * that are added via plugins and middleware throughout the application.
 * 
 * DEPLOYMENT BLOCKER FIX: Resolves TypeScript errors for missing properties:
 * - request.user (from auth middleware)
 * - fastify.database (from database plugin)
 * - AuditService.logAction (method alias)
 */

import 'fastify';
import { DatabaseService } from '../auth/database/DatabaseService';
import { AuditService } from '../auth/services/AuditService';

// Extend Fastify instance with custom properties
declare module 'fastify' {
  interface FastifyInstance {
    // Database service plugin
    database: DatabaseService;
    databaseService: DatabaseService;
    
    // Auth service plugin
    authService: unknown;
    auditService: AuditService;
    
    // Other plugin services
    redis?: unknown;
    websocket?: unknown;
}
}
  }

  interface FastifyRequest {
    // User information from auth middleware
    user?: {
      id: string;
      email: string;
      name: string;
      sessionId: string;
      roles?: string[];
      permissions?: string[];
}
}
    };
    
    // Workspace context
    workspace?: {
      id: string;
      permissions: number;
      roles: string[];
    };
    
    // Session information  
    sessionId?: string;
    
    // Client information
    clientInfo?: {
      ipAddress?: string;
      userAgent?: string;
      fingerprint?: string;
    };
    
    // Security context
    securityContext?: {
      riskScore?: number;
      deviceTrusted?: boolean;
      locationVerified?: boolean;
    };
  }

  interface FastifyReply {
    // Custom reply methods can be added here if needed
}
}
  }
}

// Extend AuditService to include logAction method
declare module '../auth/services/AuditService' {
  interface AuditService {
    logAction(params: {
      action: string;
      userId?: string;
      resourceType?: string;
      resourceId?: string;
      details?: Record<string, any>;
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      severity?: 'info' | 'warning' | 'error' | 'critical';
}
}
    }): Promise<void>;
  }
}

export {};