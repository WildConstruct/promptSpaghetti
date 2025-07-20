// Epic 17 - Security Headers Tests
// Tests for security headers middleware and audit functionality

import { auditSecurityHeaders, securityHeadersMiddleware, defaultSecurityConfig } from '../middleware/security-headers';

describe('Security Headers', () => {
  describe('auditSecurityHeaders', () => {
    it('should pass audit with all required headers present', () => {
      const headers = {
        'content-security-policy': "default-src 'self'",
        'x-frame-options': 'DENY',
        'x-content-type-options': 'nosniff',
        'referrer-policy': 'strict-origin-when-cross-origin',
        'strict-transport-security': 'max-age=31536000; includeSubDomains',
        'permissions-policy': 'camera=(), microphone=()',
        'cross-origin-opener-policy': 'same-origin-allow-popups',
        'cross-origin-resource-policy': 'same-origin'
      };

      const result = auditSecurityHeaders(headers);

      expect(result.passed).toBe(true);
      expect(result.score).toBeGreaterThan(result.maxScore * 0.7);
      expect(result.summary.critical).toBe(0);
      expect(result.summary.high).toBe(0);
    });

    it('should fail audit with missing critical headers', () => {
      const headers = {
        'x-content-type-options': 'nosniff'
      };

      const result = auditSecurityHeaders(headers);

      expect(result.passed).toBe(false);
      expect(result.score).toBeLessThan(result.maxScore * 0.7);
      expect(result.summary.high).toBeGreaterThan(0);
    });

    it('should accept CSP report-only header as alternative', () => {
      const headers = {
        'content-security-policy-report-only': "default-src 'self'",
        'x-frame-options': 'DENY',
        'x-content-type-options': 'nosniff',
        'referrer-policy': 'strict-origin-when-cross-origin'
      };

      const result = auditSecurityHeaders(headers);
      const cspHeader = result.headers.find(h => h.name === 'Content-Security-Policy');
      
      expect(cspHeader?.present).toBe(true);
    });

    it('should calculate score correctly', () => {
      const headers = {
        'x-content-type-options': 'nosniff', // 8 points
        'referrer-policy': 'strict-origin-when-cross-origin', // 5 points
        'cross-origin-opener-policy': 'same-origin-allow-popups' // 5 points
      };

      const result = auditSecurityHeaders(headers);
      
      expect(result.score).toBe(18); // 8 + 5 + 5 = 18
    });

    it('should provide recommendations for missing headers', () => {
      const headers = {};

      const result = auditSecurityHeaders(headers);
      
      const missingHeaders = result.headers.filter(h => !h.present);
      expect(missingHeaders.length).toBeGreaterThan(0);
      
      missingHeaders.forEach(header => {
        expect(header.recommendation).toBeDefined();
        expect(header.severity).toBeDefined();
      });
    });
  });

  describe('securityHeadersMiddleware', () => {
    let mockRequest: unknown;
    let mockReply: unknown;
    let headersSent: Record<string, string>;

    beforeEach(() => {
      headersSent = {};
      
      mockRequest = {
        protocol: 'https',
        headers: {
          origin: 'http://localhost:3000'
        }
      };

      mockReply = {
        header: jest.fn((name: string, value: string) => {
          headersSent[name.toLowerCase()] = value;
        })
      };
    });

    it('should set all security headers with default config', async () => {
      const middleware = securityHeadersMiddleware(defaultSecurityConfig);
      await middleware(mockRequest, mockReply);

      // Check CSP header
      expect(headersSent['content-security-policy']).toContain("default-src 'self'");
      
      // Check other headers
      expect(headersSent['x-frame-options']).toBe('DENY');
      expect(headersSent['x-content-type-options']).toBe('nosniff');
      expect(headersSent['referrer-policy']).toBe('strict-origin-when-cross-origin');
      expect(headersSent['permissions-policy']).toContain('camera=()');
      expect(headersSent['cross-origin-opener-policy']).toBe('same-origin-allow-popups');
      expect(headersSent['cross-origin-resource-policy']).toBe('same-origin');
    });

    it('should set HSTS header only for HTTPS requests', async () => {
      // Test HTTPS request with HSTS explicitly enabled
      mockRequest.protocol = 'https';
      const hstsConfig = {
        ...defaultSecurityConfig,
        strictTransportSecurity: {
          enabled: true, // Force enable for testing
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true
        }
      };
      const middleware = securityHeadersMiddleware(hstsConfig);
      await middleware(mockRequest, mockReply);
      
      expect(headersSent['strict-transport-security']).toContain('max-age=31536000');

      // Reset and test HTTP request
      headersSent = {};
      mockRequest.protocol = 'http';
      await middleware(mockRequest, mockReply);
      
      expect(headersSent['strict-transport-security']).toBeUndefined();
    });

    it('should build CSP header correctly from directives', async () => {
      const config = {
        ...defaultSecurityConfig,
        contentSecurityPolicy: {
          enabled: true,
          directives: {
            'default-src': ["'self'"],
            'script-src': ["'self'", "'unsafe-inline'"],
            'style-src': ["'self'", "'unsafe-inline'"]
          }
        }
      };

      const middleware = securityHeadersMiddleware(config);
      await middleware(mockRequest, mockReply);

      const cspHeader = headersSent['content-security-policy'];
      expect(cspHeader).toContain("default-src 'self'");
      expect(cspHeader).toContain("script-src 'self' 'unsafe-inline'");
      expect(cspHeader).toContain("style-src 'self' 'unsafe-inline'");
    });

    it('should use report-only CSP when configured', async () => {
      const config = {
        ...defaultSecurityConfig,
        contentSecurityPolicy: {
          enabled: true,
          directives: { 'default-src': ["'self'"] },
          reportOnly: true
        }
      };

      const middleware = securityHeadersMiddleware(config);
      await middleware(mockRequest, mockReply);

      expect(headersSent['content-security-policy-report-only']).toBeDefined();
      expect(headersSent['content-security-policy']).toBeUndefined();
    });

    it('should disable headers when configured', async () => {
      const config = {
        ...defaultSecurityConfig,
        frameOptions: { enabled: false, directive: 'DENY' as const },
        contentTypeOptions: { enabled: false }
      };

      const middleware = securityHeadersMiddleware(config);
      await middleware(mockRequest, mockReply);

      expect(headersSent['x-frame-options']).toBeUndefined();
      expect(headersSent['x-content-type-options']).toBeUndefined();
    });

    it('should build permissions policy correctly', async () => {
      const config = {
        ...defaultSecurityConfig,
        permissionsPolicy: {
          enabled: true,
          directives: {
            'camera': [],
            'microphone': [],
            'autoplay': ["'self'"],
            'fullscreen': ["'self'", 'https://example.com']
          }
        }
      };

      const middleware = securityHeadersMiddleware(config);
      await middleware(mockRequest, mockReply);

      const ppHeader = headersSent['permissions-policy'];
      expect(ppHeader).toContain('camera=()');
      expect(ppHeader).toContain('microphone=()');
      expect(ppHeader).toContain("autoplay=('self')");
      expect(ppHeader).toContain("fullscreen=('self' https://example.com)");
    });

    it('should remove server fingerprinting headers', async () => {
      const middleware = securityHeadersMiddleware(defaultSecurityConfig);
      await middleware(mockRequest, mockReply);

      expect(headersSent['x-powered-by']).toBe('');
      expect(headersSent['server']).toBe('');
    });
  });
});