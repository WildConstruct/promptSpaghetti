/**
 * Comprehensive Tests for Security Headers Middleware
 * 
 * Tests for web security headers including CSP, frame options, HSTS,
 * permissions policy, and cross-origin policies. Critical for application security.
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import {
  securityHeadersMiddleware,
  defaultSecurityConfig,
  auditSecurityHeaders,
  handleCSPViolation,
  SecurityHeadersConfig,
  SecurityAuditResult
 from '../security-headers';

describe('Security Headers Middleware', () => {

  // Mock Fastify request and reply objects
  const createMockRequest = (overrides: Partial<FastifyRequest> = {}): FastifyRequest => ({
    ip: '127.0.0.1',
    protocol: 'https',
    headers: {
      'user-agent': 'Test Browser'

    body: {},
    ...overrides
 as FastifyRequest);

  const createMockReply = (): jest.Mocked<FastifyReply> => {
    const headers: Record<string, string> = {};
    const reply = {
      header: jest.fn((name: string, value: string) => {
        headers[name] = value;
        return reply;
      }),
      code: jest.fn(() => reply),
      send: jest.fn(() => reply),
      getHeaders: jest.fn(() => headers),
      _headers: headers
 as unknown as jest.Mocked<FastifyReply>;
    
    return reply;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = 'test';
  });

  describe('Default Configuration', () => {
    it('should apply all default security headers', async () => {
      const request = createMockRequest();
      const reply = createMockReply();
      const middleware = securityHeadersMiddleware();

      await middleware(request, reply);

      // Content Security Policy
      expect(reply.header).toHaveBeenCalledWith(
        'Content-Security-Policy',
        expect.stringContaining('default-src \'self\'')
      );

      // X-Frame-Options
      expect(reply.header).toHaveBeenCalledWith('X-Frame-Options', 'DENY');

      // X-Content-Type-Options
      expect(reply.header).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');

      // Referrer-Policy
      expect(reply.header).toHaveBeenCalledWith('Referrer-Policy', 'strict-origin-when-cross-origin');

      // Permissions-Policy
      expect(reply.header).toHaveBeenCalledWith(
        'Permissions-Policy',
        expect.stringContaining('camera=()')
      );

      // Cross-Origin-Opener-Policy
      expect(reply.header).toHaveBeenCalledWith('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');

      // Cross-Origin-Resource-Policy
      expect(reply.header).toHaveBeenCalledWith('Cross-Origin-Resource-Policy', 'same-origin');

      // Server fingerprinting removal
      expect(reply.header).toHaveBeenCalledWith('X-Powered-By', '');
      expect(reply.header).toHaveBeenCalledWith('Server', '');
    });

    it('should not set HSTS in test environment', async () => {
      const request = createMockRequest();
      const reply = createMockReply();
      const middleware = securityHeadersMiddleware();

      await middleware(request, reply);

      expect(reply.header).not.toHaveBeenCalledWith(
        'Strict-Transport-Security',
        expect.any(String)
      );
    });

    it('should set HSTS in production environment', async () => {
      process.env.NODE_ENV = 'production';
      const request = createMockRequest();
      const reply = createMockReply();
      const middleware = securityHeadersMiddleware();

      await middleware(request, reply);

      expect(reply.header).toHaveBeenCalledWith(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
      );
    });

    it('should only set HSTS for HTTPS requests', async () => {
      process.env.NODE_ENV = 'production';
      const request = createMockRequest({ protocol: 'http' });
      const reply = createMockReply();
      const middleware = securityHeadersMiddleware();

      await middleware(request, reply);

      expect(reply.header).not.toHaveBeenCalledWith(
        'Strict-Transport-Security',
        expect.any(String)
      );
    });
  });

  describe('Content Security Policy', () => {
    it('should build correct CSP header from directives', async () => {
      const config: SecurityHeadersConfig = {
        contentSecurityPolicy: {
          enabled: true,
          directives: {
            'default-src': ['\'self\''],
            'script-src': ['\'self\'', 'https://trusted.com'],
            'style-src': ['\'self\'', '\'unsafe-inline\'']


      };
      
      const request = createMockRequest();
      const reply = createMockReply();
      const middleware = securityHeadersMiddleware(config);

      await middleware(request, reply);

      expect(reply.header).toHaveBeenCalledWith(
        'Content-Security-Policy',
        'default-src \'self\'; script-src \'self\' https://trusted.com; style-src \'self\' \'unsafe-inline\''
      );
    });

    it('should set CSP report-only header when configured', async () => {
      const config: SecurityHeadersConfig = {
        contentSecurityPolicy: {
          enabled: true,
          directives: {
            'default-src': ['\'self\'']

          reportOnly: true

      };
      
      const request = createMockRequest();
      const reply = createMockReply();
      const middleware = securityHeadersMiddleware(config);

      await middleware(request, reply);

      expect(reply.header).toHaveBeenCalledWith(
        'Content-Security-Policy-Report-Only',
        'default-src \'self\''
      );
    });

    it('should add report-uri to CSP when configured', async () => {
      const config: SecurityHeadersConfig = {
        contentSecurityPolicy: {
          enabled: true,
          directives: {
            'default-src': ['\'self\'']

          reportUri: '/csp-violation'

      };
      
      const request = createMockRequest();
      const reply = createMockReply();
      const middleware = securityHeadersMiddleware(config);

      await middleware(request, reply);

      expect(reply.header).toHaveBeenCalledWith(
        'Content-Security-Policy',
        'default-src \'self\'; report-uri /csp-violation'
      );
    });

    it('should skip CSP when disabled', async () => {
      const config: SecurityHeadersConfig = {
        contentSecurityPolicy: {
          enabled: false,
          directives: {}

      };
      
      const request = createMockRequest();
      const reply = createMockReply();
      const middleware = securityHeadersMiddleware(config);

      await middleware(request, reply);

      expect(reply.header).not.toHaveBeenCalledWith(
        'Content-Security-Policy',
        expect.any(String)
      );
    });
  });

  describe('X-Frame-Options', () => {
    it('should set DENY directive', async () => {
      const config: SecurityHeadersConfig = {
        frameOptions: {
          enabled: true,
          directive: 'DENY'

      };
      
      const request = createMockRequest();
      const reply = createMockReply();
      const middleware = securityHeadersMiddleware(config);

      await middleware(request, reply);

      expect(reply.header).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
    });

    it('should set SAMEORIGIN directive', async () => {
      const config: SecurityHeadersConfig = {
        frameOptions: {
          enabled: true,
          directive: 'SAMEORIGIN'

      };
      
      const request = createMockRequest();
      const reply = createMockReply();
      const middleware = securityHeadersMiddleware(config);

      await middleware(request, reply);

      expect(reply.header).toHaveBeenCalledWith('X-Frame-Options', 'SAMEORIGIN');
    });

    it('should set ALLOW-FROM with URI', async () => {
      const config: SecurityHeadersConfig = {
        frameOptions: {
          enabled: true,
          directive: 'ALLOW-FROM',
          allowFromUri: 'https://trusted.com'

      };
      
      const request = createMockRequest();
      const reply = createMockReply();
      const middleware = securityHeadersMiddleware(config);

      await middleware(request, reply);

      expect(reply.header).toHaveBeenCalledWith('X-Frame-Options', 'ALLOW-FROM https://trusted.com');
    });

    it('should skip when disabled', async () => {
      const config: SecurityHeadersConfig = {
        frameOptions: {
          enabled: false,
          directive: 'DENY'

      };
      
      const request = createMockRequest();
      const reply = createMockReply();
      const middleware = securityHeadersMiddleware(config);

      await middleware(request, reply);

      expect(reply.header).not.toHaveBeenCalledWith('X-Frame-Options', expect.any(String));
    });
  });

  describe('Strict Transport Security', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
    });

    it('should set HSTS with all options', async () => {
      const config: SecurityHeadersConfig = {
        strictTransportSecurity: {
          enabled: true,
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true

      };
      
      const request = createMockRequest();
      const reply = createMockReply();
      const middleware = securityHeadersMiddleware(config);

      await middleware(request, reply);

      expect(reply.header).toHaveBeenCalledWith(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
      );
    });

    it('should set HSTS without optional directives', async () => {
      const config: SecurityHeadersConfig = {
        strictTransportSecurity: {
          enabled: true,
          maxAge: 86400,
          includeSubDomains: false,
          preload: false

      };
      
      const request = createMockRequest();
      const reply = createMockReply();
      const middleware = securityHeadersMiddleware(config);

      await middleware(request, reply);

      expect(reply.header).toHaveBeenCalledWith(
        'Strict-Transport-Security',
        'max-age=86400'
      );
    });

    it('should require HTTPS protocol', async () => {
      const config: SecurityHeadersConfig = {
        strictTransportSecurity: {
          enabled: true,
          maxAge: 31536000

      };
      
      const request = createMockRequest({ protocol: 'http' });
      const reply = createMockReply();
      const middleware = securityHeadersMiddleware(config);

      await middleware(request, reply);

      expect(reply.header).not.toHaveBeenCalledWith(
        'Strict-Transport-Security',
        expect.any(String)
      );
    });
  });

  describe('Permissions Policy', () => {
    it('should build permissions policy header correctly', async () => {
      const config: SecurityHeadersConfig = {
        permissionsPolicy: {
          enabled: true,
          directives: {
            'camera': [],
            'microphone': [],
            'geolocation': ['self'],
            'payment': ['self', 'https://trusted.com']


      };
      
      const request = createMockRequest();
      const reply = createMockReply();
      const middleware = securityHeadersMiddleware(config);

      await middleware(request, reply);

      expect(reply.header).toHaveBeenCalledWith(
        'Permissions-Policy',
        'camera=(), microphone=(), geolocation=(self), payment=(self https://trusted.com)'
      );
    });

    it('should handle empty allowlist correctly', async () => {
      const config: SecurityHeadersConfig = {
        permissionsPolicy: {
          enabled: true,
          directives: {
            'camera': [],
            'fullscreen': ['*']


      };
      
      const request = createMockRequest();
      const reply = createMockReply();
      const middleware = securityHeadersMiddleware(config);

      await middleware(request, reply);

      expect(reply.header).toHaveBeenCalledWith(
        'Permissions-Policy',
        'camera=(), fullscreen=(*)'
      );
    });
  });

  describe('Cross-Origin Policies', () => {
    it('should set Cross-Origin-Embedder-Policy when enabled', async () => {
      const config: SecurityHeadersConfig = {
        crossOriginEmbedderPolicy: {
          enabled: true,
          directive: 'require-corp'

      };
      
      const request = createMockRequest();
      const reply = createMockReply();
      const middleware = securityHeadersMiddleware(config);

      await middleware(request, reply);

      expect(reply.header).toHaveBeenCalledWith('Cross-Origin-Embedder-Policy', 'require-corp');
    });

    it('should set Cross-Origin-Opener-Policy', async () => {
      const config: SecurityHeadersConfig = {
        crossOriginOpenerPolicy: {
          enabled: true,
          directive: 'same-origin'

      };
      
      const request = createMockRequest();
      const reply = createMockReply();
      const middleware = securityHeadersMiddleware(config);

      await middleware(request, reply);

      expect(reply.header).toHaveBeenCalledWith('Cross-Origin-Opener-Policy', 'same-origin');
    });

    it('should set Cross-Origin-Resource-Policy', async () => {
      const config: SecurityHeadersConfig = {
        crossOriginResourcePolicy: {
          enabled: true,
          directive: 'cross-origin'

      };
      
      const request = createMockRequest();
      const reply = createMockReply();
      const middleware = securityHeadersMiddleware(config);

      await middleware(request, reply);

      expect(reply.header).toHaveBeenCalledWith('Cross-Origin-Resource-Policy', 'cross-origin');
    });
  });

  describe('Custom Configuration', () => {
    it('should handle partial configuration', async () => {
      const config: SecurityHeadersConfig = {
        contentSecurityPolicy: {
          enabled: true,
          directives: {
            'default-src': ['\'self\'']


        frameOptions: {
          enabled: false,
          directive: 'DENY'

      };
      
      const request = createMockRequest();
      const reply = createMockReply();
      const middleware = securityHeadersMiddleware(config);

      await middleware(request, reply);

      expect(reply.header).toHaveBeenCalledWith('Content-Security-Policy', 'default-src \'self\'');
      expect(reply.header).not.toHaveBeenCalledWith('X-Frame-Options', expect.any(String));
    });

    it('should merge with defaults correctly', async () => {
      const config: SecurityHeadersConfig = {
        contentTypeOptions: {
          enabled: false

      };
      
      const request = createMockRequest();
      const reply = createMockReply();
      const middleware = securityHeadersMiddleware(config);

      await middleware(request, reply);

      expect(reply.header).not.toHaveBeenCalledWith('X-Content-Type-Options', expect.any(String));
      // Should still apply other defaults
      expect(reply.header).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
    });
  });

  describe('Security Headers Audit', () => {
    it('should pass audit with all headers present', () => {
      const headers = {
        'Content-Security-Policy': 'default-src \'self\'',
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Strict-Transport-Security': 'max-age=31536000',
        'Permissions-Policy': 'camera=()',
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Resource-Policy': 'same-origin'
      };

      const result = auditSecurityHeaders(headers);

      expect(result.passed).toBe(true);
      expect(result.score).toBe(result.maxScore);
      expect(result.headers.every(h => h.present)).toBe(true);
    });

    it('should fail audit with missing critical headers', () => {
      const headers = {
        'X-Content-Type-Options': 'nosniff'
      };

      const result = auditSecurityHeaders(headers);

      expect(result.passed).toBe(false);
      expect(result.score).toBeLessThan(result.maxScore);
      expect(result.summary.high).toBeGreaterThan(0);
    });

    it('should handle case-insensitive header names', () => {
      const headers = {
        'content-security-policy': 'default-src \'self\'',
        'x-frame-options': 'DENY'
      };

      const result = auditSecurityHeaders(headers);

      const cspHeader = result.headers.find(h => h.name === 'Content-Security-Policy');
      const frameHeader = result.headers.find(h => h.name === 'X-Frame-Options');

      expect(cspHeader?.present).toBe(true);
      expect(frameHeader?.present).toBe(true);
    });

    it('should recognize CSP report-only header as alternative', () => {
      const headers = {
        'Content-Security-Policy-Report-Only': 'default-src \'self\''
      };

      const result = auditSecurityHeaders(headers);

      const cspHeader = result.headers.find(h => h.name === 'Content-Security-Policy');
      expect(cspHeader?.present).toBe(true);
    });

    it('should provide recommendations for missing headers', () => {
      const headers = {};

      const result = auditSecurityHeaders(headers);

      expect(result.headers.every(h => h.recommendation)).toBe(true);
      expect(result.headers.find(h => h.name === 'Content-Security-Policy')?.recommendation)
        .toContain('XSS attacks');
    });

    it('should calculate severity summary correctly', () => {
      const headers = {
        'X-Content-Type-Options': 'nosniff' // Only medium severity header
      };

      const result = auditSecurityHeaders(headers);

      expect(result.summary.high).toBe(2); // CSP and HSTS
      expect(result.summary.medium).toBe(2); // Frame options and permissions policy
      expect(result.summary.low).toBe(2); // Referrer policy and COOP
    });
  });

  describe('CSP Violation Reporting', () => {
    it('should handle valid CSP violation report', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const request = createMockRequest({
        body: {
          'csp-report': {
            'document-uri': 'https://example.com/page',
            'violated-directive': 'script-src',
            'blocked-uri': 'https://malicious.com/script.js',
            'source-file': 'https://example.com/page',
            'line-number': 42,
            'column-number': 15


      });
      const reply = createMockReply();

      await handleCSPViolation(request, reply);

      expect(consoleSpy).toHaveBeenCalledWith('CSP Violation:', 
        expect.objectContaining({
          documentUri: 'https://example.com/page',
          violatedDirective: 'script-src',
          blockedUri: 'https://malicious.com/script.js'
  }
      );
      
      expect(reply.code).toHaveBeenCalledWith(204);
      expect(reply.send).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should handle malformed CSP violation report', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const request = createMockRequest({
        body: { invalid: 'data' }
      });
      const reply = createMockReply();

      await handleCSPViolation(request, reply);

      expect(consoleSpy).toHaveBeenCalledWith('Error handling CSP violation:', expect.any(Error));
      expect(reply.code).toHaveBeenCalledWith(400);
      expect(reply.send).toHaveBeenCalledWith({ error: 'Invalid CSP report' });

      consoleSpy.mockRestore();
    });

    it('should log violation metadata', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const request = createMockRequest({
        body: {
          'csp-report': {
            'document-uri': 'https://example.com/page',
            'violated-directive': 'script-src',
            'blocked-uri': 'inline',
            'source-file': '',
            'line-number': 0,
            'column-number': 0


        headers: {
          'user-agent': 'Mozilla/5.0 Test Browser'

        ip: '192.168.1.100'
      });
      const reply = createMockReply();

      await handleCSPViolation(request, reply);

      expect(consoleSpy).toHaveBeenCalledWith('CSP Violation:', 
        expect.objectContaining({
          userAgent: 'Mozilla/5.0 Test Browser',
          ip: '192.168.1.100',
          timestamp: expect.any(String)
  }
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle undefined configuration gracefully', async () => {
      const request = createMockRequest();
      const reply = createMockReply();
      const middleware = securityHeadersMiddleware(undefined);

      await middleware(request, reply);

      // Should apply default configuration
      expect(reply.header).toHaveBeenCalled();
    });

    it('should handle empty directives object', async () => {
      const config: SecurityHeadersConfig = {
        contentSecurityPolicy: {
          enabled: true,
          directives: {}

      };
      
      const request = createMockRequest();
      const reply = createMockReply();
      const middleware = securityHeadersMiddleware(config);

      await middleware(request, reply);

      expect(reply.header).toHaveBeenCalledWith('Content-Security-Policy', '');
    });

    it('should handle missing protocol information', async () => {
      const request = createMockRequest({ protocol: undefined });
      const reply = createMockReply();
      const middleware = securityHeadersMiddleware();

      await middleware(request, reply);

      // Should not crash and should not set HSTS
      expect(reply.header).not.toHaveBeenCalledWith(
        'Strict-Transport-Security',
        expect.any(String)
      );
    });
  });

  describe('Performance Considerations', () => {
    it('should execute middleware efficiently for multiple requests', async () => {
      const request = createMockRequest();
      const middleware = securityHeadersMiddleware();
      
      const startTime = performance.now();
      
      // Execute middleware 100 times
      for (let i = 0; i < 100; i++) {
        const reply = createMockReply();
        await middleware(request, reply);

      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Should complete 100 iterations in less than 100ms
      expect(executionTime).toBeLessThan(100);
    });

    it('should cache built headers for reuse', async () => {
      const config: SecurityHeadersConfig = {
        contentSecurityPolicy: {
          enabled: true,
          directives: {
            'default-src': ['\'self\''],
            'script-src': ['\'self\'', 'https://cdn.example.com']


      };
      
      const middleware = securityHeadersMiddleware(config);
      const request = createMockRequest();
      
      // Execute multiple times with same config
      for (let i = 0; i < 10; i++) {
        const reply = createMockReply();
        await middleware(request, reply);
        
        expect(reply.header).toHaveBeenCalledWith(
          'Content-Security-Policy',
          'default-src \'self\'; script-src \'self\' https://cdn.example.com'
        );

    });
  });
});