// Epic 17 - Security Headers Middleware
// Implements comprehensive security headers for the application

import { FastifyRequest, FastifyReply } from 'fastify';

export interface SecurityHeadersConfig {
  contentSecurityPolicy?: {
    enabled: boolean;
    directives: Record<string, string[]>;
    reportOnly?: boolean;
    reportUri?: string;
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
    },
    reportOnly: false
  },
  frameOptions: {
    enabled: true,
    directive: 'DENY'
  },
  contentTypeOptions: {
    enabled: true
  },
  referrerPolicy: {
    enabled: true,
    directive: 'strict-origin-when-cross-origin'
  },
  strictTransportSecurity: {
    enabled: process.env.NODE_ENV === 'production',
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
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
  },
  crossOriginEmbedderPolicy: {
    enabled: false, // Can cause issues with third-party resources
    directive: 'unsafe-none'
  },
  crossOriginOpenerPolicy: {
    enabled: true,
    directive: 'same-origin-allow-popups'
  },
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
    })
    .join(', ');
}

// Security headers middleware
export function securityHeadersMiddleware(config: SecurityHeadersConfig = defaultSecurityConfig) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    // Content Security Policy
    if (config.contentSecurityPolicy?.enabled) {
      const cspValue = buildCSPHeader(config.contentSecurityPolicy.directives);
      const headerName = config.contentSecurityPolicy.reportOnly 
        ? 'Content-Security-Policy-Report-Only' 
        : 'Content-Security-Policy';
      
      reply.header(headerName, cspValue);
      
      // Add report-uri if specified
      if (config.contentSecurityPolicy.reportUri) {
        const cspWithReport = `${cspValue}; report-uri ${config.contentSecurityPolicy.reportUri}`;
        reply.header(headerName, cspWithReport);
      }
    }

    // X-Frame-Options
    if (config.frameOptions?.enabled) {
      let frameOptionsValue = config.frameOptions.directive;
      if (config.frameOptions.directive === 'ALLOW-FROM' && config.frameOptions.allowFromUri) {
        frameOptionsValue += ` ${config.frameOptions.allowFromUri}`;
      }
      reply.header('X-Frame-Options', frameOptionsValue);
    }

    // X-Content-Type-Options
    if (config.contentTypeOptions?.enabled) {
      reply.header('X-Content-Type-Options', 'nosniff');
    }

    // Referrer-Policy
    if (config.referrerPolicy?.enabled) {
      reply.header('Referrer-Policy', config.referrerPolicy.directive);
    }

    // Strict-Transport-Security (only in production with HTTPS)
    if (config.strictTransportSecurity?.enabled && request.protocol === 'https') {
      let hstsValue = `max-age=${config.strictTransportSecurity.maxAge}`;
      if (config.strictTransportSecurity.includeSubDomains) {
        hstsValue += '; includeSubDomains';
      }
      if (config.strictTransportSecurity.preload) {
        hstsValue += '; preload';
      }
      reply.header('Strict-Transport-Security', hstsValue);
    }

    // Permissions-Policy
    if (config.permissionsPolicy?.enabled) {
      const permissionsPolicyValue = buildPermissionsPolicyHeader(config.permissionsPolicy.directives);
      reply.header('Permissions-Policy', permissionsPolicyValue);
    }

    // Cross-Origin-Embedder-Policy
    if (config.crossOriginEmbedderPolicy?.enabled) {
      reply.header('Cross-Origin-Embedder-Policy', config.crossOriginEmbedderPolicy.directive);
    }

    // Cross-Origin-Opener-Policy
    if (config.crossOriginOpenerPolicy?.enabled) {
      reply.header('Cross-Origin-Opener-Policy', config.crossOriginOpenerPolicy.directive);
    }

    // Cross-Origin-Resource-Policy
    if (config.crossOriginResourcePolicy?.enabled) {
      reply.header('Cross-Origin-Resource-Policy', config.crossOriginResourcePolicy.directive);
    }

    // Additional security headers
    reply.header('X-Powered-By', ''); // Remove server fingerprinting
    reply.header('Server', ''); // Remove server fingerprinting
  };
}

// Security headers audit function
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
    },
    {
      name: 'X-Frame-Options',
      severity: 'medium' as const,
      score: 10,
      recommendation: 'Prevent clickjacking attacks'
    },
    {
      name: 'X-Content-Type-Options',
      severity: 'medium' as const,
      score: 8,
      recommendation: 'Prevent MIME type sniffing'
    },
    {
      name: 'Referrer-Policy',
      severity: 'low' as const,
      score: 5,
      recommendation: 'Control referrer information disclosure'
    },
    {
      name: 'Strict-Transport-Security',
      severity: 'high' as const,
      score: 12,
      recommendation: 'Enforce HTTPS connections (production only)'
    },
    {
      name: 'Permissions-Policy',
      severity: 'medium' as const,
      score: 8,
      recommendation: 'Control browser feature access'
    },
    {
      name: 'Cross-Origin-Opener-Policy',
      severity: 'low' as const,
      score: 5,
      recommendation: 'Isolate browsing context'
    },
    {
      name: 'Cross-Origin-Resource-Policy',
      severity: 'medium' as const,
      score: 7,
      recommendation: 'Control cross-origin resource access'
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