/**
 * Classification Enforcement Middleware
 *
 * Express middleware that integrates with the Classification Enforcer
 * Epic 19 Task T-1752989143998-694: Build classification enforcement
 *
 * This middleware provides:
 * - Automatic classification detection from requests
 * - Real-time enforcement of classification policies
 * - Integration with existing authentication systems
 * - Audit logging and compliance reporting
 */
import { Request, Response } from 'express';
import { type EnforcementResult, type AccessDecision } from './ClassificationEnforcer';
import { DataClassificationLevel, type OperationContext, type ClassificationAuditEvent } from '../types/DataClassification';
/**
 * Extended request with classification information
 */
export interface ClassificationAwareRequest extends Request {
    classification?: {
        level: DataClassificationLevel;
        dataId?: string;
        enforcement?: EnforcementResult;
        accessDecision?: AccessDecision;
    };
    user?: {
        id: string;
        roles?: string;
        authLevel?: string;
    };
}
/**
 * Middleware configuration
 */
export interface ClassificationEnforcementMiddlewareConfig {
    /** Environment preset for the enforcer */
    environment: 'development' | 'staging' | 'production';
    /** Function to extract classification from request */
    classificationExtractor?: (req: Request) => Promise<DataClassificationLevel | null>;
    /** Function to extract current security controls */
    controlsExtractor?: (req: Request) => string;
    /** Routes to exclude from enforcement */
    excludedRoutes?: string;
    /** Custom error handler */
    errorHandler?: (error: Error, req: Request, res: Response) => void;
    /** Enable detailed error responses (only in development) */
    detailedErrors?: boolean;
    /** Audit event handler */
    auditHandler?: (event: ClassificationAuditEvent) => Promise<void>;
    /**
    * Default configuration
    */
    const: any;
    DEFAULT_CONFIG: ClassificationEnforcementMiddlewareConfig;
    /**
     * Operation mapping from HTTP methods
     */
    const: any;
    HTTP_METHOD_TO_OPERATION: Record<string, OperationContext['operation']>;
}
export declare function createClassificationEnforcementMiddleware(config?: Partial<ClassificationEnforcementMiddlewareConfig>): any;
//# sourceMappingURL=ClassificationEnforcementMiddleware.d.ts.map