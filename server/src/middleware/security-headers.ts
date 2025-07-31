// Epic 17 - Security Headers Middleware
// Implements comprehensive security headers for the application

import { FastifyRequest, FastifyReply } from 'fastify';

}
}
export interface SecurityHeadersConfig {
  contentSecurityPolicy?: {
    enabled: boolean;
    directives: Record<string, string[]>;
    reportOnly?: boolean;
    reportUri?: string;
}
}
  };
  frameOptions?: {
    enabled: boolean;
    directive: 'DENY' | 'SAMEORIGIN' | 'ALLOW-FROM';
    allowFromUri?: string;
  };
  contentTypeOptions?: {
    enabled: boolean;
  };
  referrerPolicy?: {
    enabled: boolean;
    directive: 'no-referrer' | 'no-referrer-when-downgrade' | 'origin' | 'origin-when-cross-origin' | 'same-origin' | 'strict-origin' | 'strict-origin-when-cross-origin' | 'unsafe-url';
  };
  strictTransportSecurity?: {
    enabled: boolean;
    maxAge: number;
    includeSubDomains?: boolean;
    preload?: boolean;
  };
  permissionsPolicy?: {
    enabled: boolean;
    directives: Record<string, string[]>;
  };
  crossOriginEmbedderPolicy?: {
    enabled: boolean;
    directive: 'unsafe-none' | 'require-corp';
  };
  crossOriginOpenerPolicy?: {
    enabled: boolean;
    directive: 'unsafe-none' | 'same-origin-allow-popups' | 'same-origin';
  };
  crossOriginResourcePolicy?: {
    enabled: boolean;
    directive: 'same-site' | 'same-origin' | 'cross-origin';
  };
}

// Default security configuration
export const defaultSecurityConfig: SecurityHeadersConfig = {
  contentSecurityPolicy: {
    enabled: true,
    directives: {
      'default-src': ['\'self\''],
      'script-src': ['\'self\'', '\'unsafe-inline\'', '\'unsafe-eval\''],
      'style-src': ['\'self\'', '\'unsafe-inline\''],
      'img-src': ['\'self\'', 'data:', 'https:'],
      'font-src': ['\'self\'', 'https:', 'data:'],
      'connect-src': ['\'self\'', 'ws:', 'wss:'],
      'media-src': ['\'self\''],
      'object-src': ['\'none\''],
      'child-src': ['\'self\''],
      'worker-src': ['\'self\''],
      'frame-ancestors': ['\'none\''],
      'form-action': ['\'self\''],
      'base-uri': ['\'self\''],
      'manifest-src': ['\'self\'']
  }
    reportOnly: false
  }
  frameOptions: {
    enabled: true,
    directive: 'DENY'
  }
  contentTypeOptions: {
    enabled: true
  }
  referrerPolicy: {
    enabled: true,
    directive: 'strict-origin-when-cross-origin'
  }
  strictTransportSecurity: {
    enabled: true, // Will be conditionally applied based on environment and HTTPS
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  }
  permissionsPolicy: {
    enabled: true,
    directives: {
      'camera': [],
      'microphone': [],
      'geolocation': [],
      'payment': [],
      'autoplay': ['\'self\''],
      'fullscreen': ['\'self\''],
      'picture-in-picture': ['\'self\'']
    }
  }
  crossOriginEmbedderPolicy: {
    enabled: false, // Can cause issues with third-party resources
    directive: 'unsafe-none'
  }
  crossOriginOpenerPolicy: {
    enabled: true,
    directive: 'same-origin-allow-popups'
  }
  crossOriginResourcePolicy: {
    enabled: true,
    directive: 'same-origin'
  }
};

// Build CSP header value from directives
function buildCSPHeader(directives: Record<string, string[]>): string {
  return Object.entries(directives)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ');
}

// Build Permissions Policy header value from directives
function buildPermissionsPolicyHeader(directives: Record<string, string[]>): string {
  return Object.entries(directives)
    .map(([feature, allowlist]) => {
      if (allowlist.length === 0) {
        return `${feature}=()`;
      }
      return `${feature}=(${allowlist.join(' ')})`;
  }
    .join(', ');
}

// Deep merge configuration with defaults
function mergeWithDefaults(config: SecurityHeadersConfig): SecurityHeadersConfig {
  return {
    contentSecurityPolicy: {
      ...defaultSecurityConfig.contentSecurityPolicy,
      ...config.contentSecurityPolicy
  }
    frameOptions: {
      ...defaultSecurityConfig.frameOptions,
      ...config.frameOptions
  }
    contentTypeOptions: {
      ...defaultSecurityConfig.contentTypeOptions,
      ...config.contentTypeOptions
  }
    referrerPolicy: {
      ...defaultSecurityConfig.referrerPolicy,
      ...config.referrerPolicy
  }
    strictTransportSecurity: {
      ...defaultSecurityConfig.strictTransportSecurity,
      ...config.strictTransportSecurity
  }
    permissionsPolicy: {
      ...defaultSecurityConfig.permissionsPolicy,
      ...config.permissionsPolicy
  }
    crossOriginEmbedderPolicy: {
      ...defaultSecurityConfig.crossOriginEmbedderPolicy,
      ...config.crossOriginEmbedderPolicy
  }
    crossOriginOpenerPolicy: {
      ...defaultSecurityConfig.crossOriginOpenerPolicy,
      ...config.crossOriginOpenerPolicy
  }
    crossOriginResourcePolicy: {
      ...defaultSecurityConfig.crossOriginResourcePolicy,
      ...config.crossOriginResourcePolicy
    }
  };
}

// Security headers middleware
export function securityHeadersMiddleware(config?: SecurityHeadersConfig) {
  // Deep merge with defaults
  const mergedConfig = config ? mergeWithDefaults(config) : defaultSecurityConfig;
  
  return async (request: FastifyRequest, reply: FastifyReply) => {
    // Content Security Policy
    if (mergedConfig.contentSecurityPolicy?.enabled) {
      const cspValue = buildCSPHeader(mergedConfig.contentSecurityPolicy.directives);
      const headerName = mergedConfig.contentSecurityPolicy.reportOnly 
        ? 'Content-Security-Policy-Report-Only' 
        : 'Content-Security-Policy';
      
      reply.header(headerName, cspValue);
      
      // Add report-uri if specified
      if (mergedConfig.contentSecurityPolicy.reportUri) {
        const cspWithReport = `${cspValue}; report-uri ${mergedConfig.contentSecurityPolicy.reportUri}`;
        reply.header(headerName, cspWithReport);
      }
    }

    // X-Frame-Options
    if (mergedConfig.frameOptions?.enabled) {
      let frameOptionsValue = mergedConfig.frameOptions.directive;
      if (mergedConfig.frameOptions.directive === 'ALLOW-FROM' && mergedConfig.frameOptions.allowFromUri) {
        frameOptionsValue += ` ${mergedConfig.frameOptions.allowFromUri}`;
      }
      reply.header('X-Frame-Options', frameOptionsValue);
    }

    // X-Content-Type-Options
    if (mergedConfig.contentTypeOptions?.enabled) {
      reply.header('X-Content-Type-Options', 'nosniff');
    }

    // Referrer-Policy
    if (mergedConfig.referrerPolicy?.enabled) {
      reply.header('Referrer-Policy', mergedConfig.referrerPolicy.directive);
    }

    // Strict-Transport-Security (only in production with HTTPS)
    if (mergedConfig.strictTransportSecurity?.enabled && request.protocol === 'https' && process.env.NODE_ENV === 'production') {
      let hstsValue = `max-age=${mergedConfig.strictTransportSecurity.maxAge}`;
      if (mergedConfig.strictTransportSecurity.includeSubDomains) {
        hstsValue += '; includeSubDomains';
      }
      if (mergedConfig.strictTransportSecurity.preload) {
        hstsValue += '; preload';
      }
      reply.header('Strict-Transport-Security', hstsValue);
    }

    // Permissions-Policy
    if (mergedConfig.permissionsPolicy?.enabled) {
      const permissionsPolicyValue = buildPermissionsPolicyHeader(mergedConfig.permissionsPolicy.directives);
      reply.header('Permissions-Policy', permissionsPolicyValue);
    }

    // Cross-Origin-Embedder-Policy
    if (mergedConfig.crossOriginEmbedderPolicy?.enabled) {
      reply.header('Cross-Origin-Embedder-Policy', mergedConfig.crossOriginEmbedderPolicy.directive);
    }

    // Cross-Origin-Opener-Policy
    if (mergedConfig.crossOriginOpenerPolicy?.enabled) {
      reply.header('Cross-Origin-Opener-Policy', mergedConfig.crossOriginOpenerPolicy.directive);
    }

    // Cross-Origin-Resource-Policy
    if (mergedConfig.crossOriginResourcePolicy?.enabled) {
      reply.header('Cross-Origin-Resource-Policy', mergedConfig.crossOriginResourcePolicy.directive);
    }

    // Additional security headers
    reply.header('X-Powered-By', ''); // Remove server fingerprinting
    reply.header('Server', ''); // Remove server fingerprinting
  };
}

// Security headers audit function
}
}
export interface SecurityAuditResult {
  passed: boolean;
  score: number;
  maxScore: number;
  headers: {
    name: string;
    present: boolean;
    value?: string;
    recommendation?: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
}
}
  }[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export function auditSecurityHeaders(responseHeaders: Record<string, string>): SecurityAuditResult {
  const expectedHeaders = [
    {
      name: 'Content-Security-Policy',
      alternatives: ['Content-Security-Policy-Report-Only'],
      severity: 'high' as const,
      score: 15,
      recommendation: 'Implement CSP to prevent XSS attacks'
  }
    {
      name: 'X-Frame-Options',
      severity: 'medium' as const,
      score: 10,
      recommendation: 'Prevent clickjacking attacks'
  }
    {
      name: 'X-Content-Type-Options',
      severity: 'medium' as const,
      score: 8,
      recommendation: 'Prevent MIME type sniffing'
  }
    {
      name: 'Referrer-Policy',
      severity: 'low' as const,
      score: 5,
      recommendation: 'Control referrer information disclosure'
  }
    {
      name: 'Strict-Transport-Security',
      severity: 'high' as const,
      score: 12,
      recommendation: 'Enforce HTTPS connections (production only)'
  }
    {
      name: 'Permissions-Policy',
      severity: 'medium' as const,
      score: 8,
      recommendation: 'Control browser feature access'
  }
    {
      name: 'Cross-Origin-Opener-Policy',
      severity: 'low' as const,
      score: 5,
      recommendation: 'Isolate browsing context'
    }
  ];

  const results = expectedHeaders.map(expected => {
    // Case-insensitive header lookup
    const headerKeys = Object.keys(responseHeaders);
    const headerName = headerKeys.find(key => key.toLowerCase() === expected.name.toLowerCase()) || expected.name;
    const altHeaderName = expected.alternatives?.find(alt => 
      headerKeys.find(key => key.toLowerCase() === alt.toLowerCase())
    );
    
    const present = headerName in responseHeaders || altHeaderName !== undefined;
    const value = responseHeaders[headerName] || (altHeaderName ? responseHeaders[headerKeys.find(key => key.toLowerCase() === altHeaderName.toLowerCase())!] : undefined);
    
    return {
      name: expected.name,
      present,
      value,
      recommendation: present ? undefined : expected.recommendation,
      severity: expected.severity,
      score: present ? expected.score : 0
    };
  });

  const totalScore = results.reduce((sum, result) => sum + result.score, 0);
  const maxScore = expectedHeaders.reduce((sum, expected) => sum + expected.score, 0);

  const summary = results.reduce((acc, result) => {
    if (!result.present) {
      acc[result.severity]++;
    }
    return acc;
  }, { critical: 0, high: 0, medium: 0, low: 0 });

  return {
    passed: totalScore >= maxScore * 0.7, // 70% threshold
    score: totalScore,
    maxScore,
    headers: results,
    summary
  };
}

// CSP violation reporting endpoint handler
export async function handleCSPViolation(request: FastifyRequest, reply: FastifyReply) {
  try {
    const violation = request.body as {
      'csp-report': {
        'document-uri': string;
        'violated-directive': string;
        'blocked-uri': string;
        'source-file': string;
        'line-number': number;
        'column-number': number;
      };
    };

    // Log CSP violation for monitoring
    console.warn('CSP Violation:', {
      documentUri: violation['csp-report']['document-uri'],
      violatedDirective: violation['csp-report']['violated-directive'],
      blockedUri: violation['csp-report']['blocked-uri'],
      sourceFile: violation['csp-report']['source-file'],
      lineNumber: violation['csp-report']['line-number'],
      columnNumber: violation['csp-report']['column-number'],
      timestamp: new Date().toISOString(),
      userAgent: request.headers['user-agent'],
      ip: request.ip
    });

    // TODO: Store violations in database for analysis
    // TODO: Alert on critical violations
    // TODO: Generate CSP violation reports

    reply.code(204).send();
  } catch (error) {
    console.error('Error handling CSP violation:', error);
    reply.code(400).send({ error: 'Invalid CSP report' });
  }
}