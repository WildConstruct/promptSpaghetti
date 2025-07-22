/**
 * Security Headers Middleware
 *
 * Comprehensive security headers implementation following OWASP guidelines
 * and 2025 security best practices for MFA and authentication systems.
 */
import { Request, Response, NextFunction } from 'express';
export interface SecurityConfig {
    hsts: {
        enabled: boolean;
        maxAge: number;
        includeSubDomains: boolean;
        preload: boolean;
    };
    csp: {
        enabled: boolean;
        directives: Record<string, string | string[]>;
        reportUri?: string;
        reportOnly: boolean;
        useNonces: boolean;
    };
    frameOptions: {
        enabled: boolean;
        policy: 'DENY' | 'SAMEORIGIN' | 'ALLOW-FROM';
        allowFrom?: string;
    };
    contentTypeOptions: {
        enabled: boolean;
    };
    xssProtection: {
        enabled: boolean;
        mode: 'filter' | 'block';
    };
    referrerPolicy: {
        enabled: boolean;
        policy: string;
    };
    permissionsPolicy: {
        enabled: boolean;
        directives: Record<string, string>;
    };
}
/**
 * Security headers middleware factory
 */
export declare function createSecurityMiddleware(config?: Partial<SecurityConfig>): (req: Request, res: Response, next: NextFunction) => void;
/**
 * Security configuration presets for different environments
 */
export declare const SecurityPresets: {
    /**
     * Development preset - relaxed security for easier debugging
     */
    development: Partial<SecurityConfig>;
    /**
     * Production preset - strict security
     */
    production: Partial<SecurityConfig>;
    /**
     * MFA-specific preset - optimized for authentication flows
     */
    mfa: Partial<SecurityConfig>;
};
/**
 * CSP violation report handler
 */
export declare function createCSPReportHandler(): (req: Request, res: Response) => void;
/**
 * Security headers validation utility
 */
export declare class SecurityHeaderValidator {
    static validate(headers: Record<string, string>): {
        valid: boolean;
        warnings: string[];
        score: number;
    };
}
export declare const securityMiddleware: {
    development: () => (req: Request, res: Response, next: NextFunction) => void;
    production: () => (req: Request, res: Response, next: NextFunction) => void;
    mfa: () => (req: Request, res: Response, next: NextFunction) => void;
    custom: (config: Partial<SecurityConfig>) => (req: Request, res: Response, next: NextFunction) => void;
};
export default createSecurityMiddleware;
//# sourceMappingURL=SecurityMiddleware.d.ts.map