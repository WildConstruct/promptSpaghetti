/**
 * Security Headers Middleware
 * 
 * Comprehensive security headers implementation following OWASP guidelines
 * and 2025 security best practices for MFA and authentication systems.
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

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

const DEFAULT_CONFIG: SecurityConfig = {
  hsts: {
    enabled: true,
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  csp: {
    enabled: true,
    reportOnly: false,
    useNonces: true,
    directives: {
      'default-src': "'self'",
      'script-src': "'self'",
      'style-src': "'self' 'unsafe-inline' https://fonts.googleapis.com",
      'font-src': "'self' https://fonts.gstatic.com",
      'img-src': "'self' data: https:",
      'connect-src': "'self'",
      'frame-ancestors': "'none'",
      'form-action': "'self'",
      'base-uri': "'self'",
      'object-src': "'none'",
      'upgrade-insecure-requests': ''
    }
  },
  frameOptions: {
    enabled: true,
    policy: 'DENY'
  },
  contentTypeOptions: {
    enabled: true
  },
  xssProtection: {
    enabled: true,
    mode: 'block'
  },
  referrerPolicy: {
    enabled: true,
    policy: 'strict-origin-when-cross-origin'
  },
  permissionsPolicy: {
    enabled: true,
    directives: {
      camera: '()',
      microphone: '()',
      geolocation: '()',
      payment: '()',
      usb: '()',
      magnetometer: '()',
      gyroscope: '()',
      accelerometer: '()'
    }
  }
};

/**
 * Security headers middleware factory
 */
export function createSecurityMiddleware(config?: Partial<SecurityConfig>) {
  const finalConfig = mergeConfig(DEFAULT_CONFIG, config || {});
  
  return (req: Request, res: Response, next: NextFunction) => {
    // Generate nonce for CSP if enabled
    if (finalConfig.csp.enabled && finalConfig.csp.useNonces) {
      (res.locals as any).cspNonce = generateNonce();
    }
    
    // Apply security headers
    applySecurityHeaders(res, finalConfig, req);
    
    next();
  };
}

/**
 * Apply all configured security headers
 */
function applySecurityHeaders(res: Response, config: SecurityConfig, req: Request): void {
  // HTTP Strict Transport Security (HSTS)
  if (config.hsts.enabled) {
    applyHSTSHeader(res, config.hsts);
  }
  
  // Content Security Policy (CSP)
  if (config.csp.enabled) {
    applyCSPHeader(res, config.csp, (res.locals as any).cspNonce);
  }
  
  // X-Frame-Options
  if (config.frameOptions.enabled) {
    applyFrameOptionsHeader(res, config.frameOptions);
  }
  
  // X-Content-Type-Options
  if (config.contentTypeOptions.enabled) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
  }
  
  // X-XSS-Protection
  if (config.xssProtection.enabled) {
    applyXSSProtectionHeader(res, config.xssProtection);
  }
  
  // Referrer-Policy
  if (config.referrerPolicy.enabled) {
    res.setHeader('Referrer-Policy', config.referrerPolicy.policy);
  }
  
  // Permissions-Policy
  if (config.permissionsPolicy.enabled) {
    applyPermissionsPolicyHeader(res, config.permissionsPolicy);
  }
  
  // Remove server identification headers
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');
}

/**
 * Apply HSTS header
 */
function applyHSTSHeader(res: Response, config: SecurityConfig['hsts']): void {
  let hstsValue = `max-age=${config.maxAge}`;
  
  if (config.includeSubDomains) {
    hstsValue += '; includeSubDomains';
  }
  
  if (config.preload) {
    hstsValue += '; preload';
  }
  
  res.setHeader('Strict-Transport-Security', hstsValue);
}

/**
 * Apply CSP header with nonce support
 */
function applyCSPHeader(res: Response, config: SecurityConfig['csp'], nonce?: string): void {
  const directives: string[] = [];
  
  Object.entries(config.directives).forEach(([directive, value]) => {
    if (Array.isArray(value)) {
      // Handle array of values
      let directiveValue = value.join(' ');
      
      // Add nonce to script-src and style-src if nonce is provided
      if (nonce && (directive === 'script-src' || directive === 'style-src')) {
        directiveValue += ` 'nonce-${nonce}'`;
      }
      
      directives.push(`${directive} ${directiveValue}`);
    } else if (value === '') {
      // Handle directives without values (like upgrade-insecure-requests)
      directives.push(directive);
    } else {
      // Handle single string values
      let directiveValue = value;
      
      // Add nonce to script-src and style-src if nonce is provided
      if (nonce && (directive === 'script-src' || directive === 'style-src')) {
        directiveValue += ` 'nonce-${nonce}'`;
      }
      
      directives.push(`${directive} ${directiveValue}`);
    }
  });
  
  // Add report-uri if configured
  if (config.reportUri) {
    directives.push(`report-uri ${config.reportUri}`);
  }
  
  const cspValue = directives.join('; ');
  const headerName = config.reportOnly ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy';
  
  res.setHeader(headerName, cspValue);
}

/**
 * Apply X-Frame-Options header
 */
function applyFrameOptionsHeader(res: Response, config: SecurityConfig['frameOptions']): void {
  let frameOptionsValue = config.policy;
  
  if (config.policy === 'ALLOW-FROM' && config.allowFrom) {
    frameOptionsValue += ` ${config.allowFrom}`;
  }
  
  res.setHeader('X-Frame-Options', frameOptionsValue);
}

/**
 * Apply X-XSS-Protection header
 */
function applyXSSProtectionHeader(res: Response, config: SecurityConfig['xssProtection']): void {
  const xssValue = config.mode === 'block' ? '1; mode=block' : '1';
  res.setHeader('X-XSS-Protection', xssValue);
}

/**
 * Apply Permissions-Policy header
 */
function applyPermissionsPolicyHeader(res: Response, config: SecurityConfig['permissionsPolicy']): void {
  const permissions = Object.entries(config.directives)
    .map(([feature, allowlist]) => `${feature}=${allowlist}`)
    .join(', ');
  
  res.setHeader('Permissions-Policy', permissions);
}

/**
 * Generate cryptographically secure nonce
 */
function generateNonce(): string {
  return crypto.randomBytes(24).toString('base64');
}

/**
 * Deep merge configuration objects
 */
function mergeConfig(defaultConfig: SecurityConfig, userConfig: Partial<SecurityConfig>): SecurityConfig {
  const merged = JSON.parse(JSON.stringify(defaultConfig));
  
  Object.keys(userConfig).forEach(key => {
    const configKey = key as keyof SecurityConfig;
    if (userConfig[configKey]) {
      if (typeof userConfig[configKey] === 'object' && !Array.isArray(userConfig[configKey])) {
        merged[configKey] = { ...merged[configKey], ...userConfig[configKey] };
      } else {
        merged[configKey] = userConfig[configKey];
      }
    }
  });
  
  return merged;
}

/**
 * Security configuration presets for different environments
 */
export const SecurityPresets = {
  /**
   * Development preset - relaxed security for easier debugging
   */
  development: {
    hsts: {
      enabled: false, // HSTS only works over HTTPS
      maxAge: 300     // Short max-age for testing
    },
    csp: {
      enabled: true,
      reportOnly: true, // Use report-only mode in development
      directives: {
        'default-src': "'self'",
        'script-src': "'self' 'unsafe-inline' 'unsafe-eval'", // Allow inline scripts for dev tools
        'style-src': "'self' 'unsafe-inline'",
        'img-src': "'self' data: blob:",
        'connect-src': "'self' ws: wss:", // Allow WebSocket connections for dev servers
        'font-src': "'self' data:",
        'frame-ancestors': "'none'",
        'form-action': "'self'",
        'base-uri': "'self'",
        'object-src': "'none'"
      }
    },
    xssProtection: {
      enabled: false // Modern browsers don't need this and it can interfere with debugging
    }
  } as Partial<SecurityConfig>,
  
  /**
   * Production preset - strict security
   */
  production: {
    hsts: {
      enabled: true,
      maxAge: 63072000, // 2 years
      includeSubDomains: true,
      preload: true
    },
    csp: {
      enabled: true,
      reportOnly: false,
      useNonces: true,
      reportUri: '/csp-report',
      directives: {
        'default-src': "'self'",
        'script-src': "'self'",
        'style-src': "'self' https://fonts.googleapis.com",
        'font-src': "'self' https://fonts.gstatic.com",
        'img-src': "'self' data: https:",
        'connect-src': "'self'",
        'frame-ancestors': "'none'",
        'form-action': "'self'",
        'base-uri': "'self'",
        'object-src': "'none'",
        'upgrade-insecure-requests': ''
      }
    }
  } as Partial<SecurityConfig>,
  
  /**
   * MFA-specific preset - optimized for authentication flows
   */
  mfa: {
    csp: {
      directives: {
        'default-src': "'self'",
        'script-src': "'self'", // No inline scripts for security
        'style-src': "'self' 'unsafe-inline'", // Allow inline styles for dynamic UI
        'img-src': "'self' data: https:", // Allow QR code data URLs
        'connect-src': "'self' https:", // Allow API calls for verification
        'frame-ancestors': "'none'", // Prevent embedding in frames
        'form-action': "'self'", // Only allow form submissions to same origin
        'base-uri': "'self'",
        'object-src': "'none'",
        'upgrade-insecure-requests': '',
        'block-all-mixed-content': '' // Block mixed content
      }
    },
    permissionsPolicy: {
      directives: {
        camera: '()', // Block camera access unless explicitly needed for QR scanning
        microphone: '()',
        geolocation: '()',
        payment: '()',
        usb: '()',
        magnetometer: '()',
        gyroscope: '()',
        accelerometer: '()',
        'display-capture': '()',
        'document-domain': '()'
      }
    }
  } as Partial<SecurityConfig>
};

/**
 * CSP violation report handler
 */
export function createCSPReportHandler() {
  return (req: Request, res: Response) => {
    try {
      const report = req.body;
      
      if (report && report['csp-report']) {
        const violation = report['csp-report'];
        
        // Log the violation (in production, send to monitoring service)
        console.warn('CSP Violation:', {
          documentUri: violation['document-uri'],
          violatedDirective: violation['violated-directive'],
          blockedUri: violation['blocked-uri'],
          referrer: violation.referrer,
          userAgent: req.get('User-Agent'),
          timestamp: new Date().toISOString()
        });
        
        // In production, you might want to:
        // - Send to a monitoring service (e.g., Sentry, DataDog)
        // - Store in database for analysis
        // - Alert security team for critical violations
      }
      
      res.status(204).end();
    } catch (error) {
      console.error('Error processing CSP report:', error);
      res.status(400).end();
    }
  };
}

/**
 * Security headers validation utility
 */
export class SecurityHeaderValidator {
  static validate(headers: Record<string, string>): {
    valid: boolean;
    warnings: string[];
    score: number;
  } {
    const warnings: string[] = [];
    let score = 100;
    
    // Check HSTS
    if (!headers['strict-transport-security']) {
      warnings.push('Missing HSTS header');
      score -= 20;
    } else {
      const hsts = headers['strict-transport-security'];
      const maxAgeMatch = hsts.match(/max-age=(\d+)/);
      if (!maxAgeMatch || parseInt(maxAgeMatch[1]) < 31536000) {
        warnings.push('HSTS max-age is too short (recommended: 1 year minimum)');
        score -= 5;
      }
    }
    
    // Check CSP
    if (!headers['content-security-policy'] && !headers['content-security-policy-report-only']) {
      warnings.push('Missing Content Security Policy');
      score -= 25;
    } else {
      const csp = headers['content-security-policy'] || headers['content-security-policy-report-only'];
      if (csp.includes("'unsafe-eval'")) {
        warnings.push('CSP allows unsafe-eval');
        score -= 10;
      }
      if (csp.includes("'unsafe-inline'") && !csp.includes("'nonce-")) {
        warnings.push('CSP allows unsafe-inline without nonce');
        score -= 5;
      }
    }
    
    // Check other headers
    if (!headers['x-content-type-options']) {
      warnings.push('Missing X-Content-Type-Options header');
      score -= 10;
    }
    
    if (!headers['x-frame-options'] && !headers['content-security-policy']?.includes('frame-ancestors')) {
      warnings.push('Missing frame protection (X-Frame-Options or CSP frame-ancestors)');
      score -= 10;
    }
    
    return {
      valid: warnings.length === 0,
      warnings,
      score: Math.max(0, score)
    };
  }
}

// Export middleware with common presets
export const securityMiddleware = {
  development: () => createSecurityMiddleware(SecurityPresets.development),
  production: () => createSecurityMiddleware(SecurityPresets.production),
  mfa: () => createSecurityMiddleware(SecurityPresets.mfa),
  custom: (config: Partial<SecurityConfig>) => createSecurityMiddleware(config)
};

export default createSecurityMiddleware;