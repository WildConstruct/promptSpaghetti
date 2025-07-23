/**
 * Comprehensive Security Headers Testing Suite
 *
 * This test suite validates security headers configuration and implementation
 * following OWASP guidelines and 2025 security best practices.
 *
 * Tests include:
 * - Content Security Policy (CSP) validation
 * - HTTP Strict Transport Security (HSTS) verification
 * - Additional security headers testing
 * - Header configuration validation
 * - Automated security scanning
 */
import request from 'supertest';
// Mock Express app for testing headers
import express from 'express';
describe('Security Headers Test Suite', () => {
    let app;
    beforeEach(() => {
        app = express();
        // Default security headers middleware
        app.use((req, res, next) => {
            // HSTS Header
            res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
            // CSP Header
            res.setHeader('Content-Security-Policy', 'default-src \'self\'; ' +
                'script-src \'self\' \'unsafe-inline\' https://cdn.jsdelivr.net; ' +
                'style-src \'self\' \'unsafe-inline\' https://fonts.googleapis.com; ' +
                'font-src \'self\' https://fonts.gstatic.com; ' +
                'img-src \'self\' data: https:; ' +
                'connect-src \'self\' https://api.example.com; ' +
                'frame-ancestors \'none\'; ' +
                'form-action \'self\'; ' +
                'base-uri \'self\'; ' +
                'object-src \'none\'; ' +
                'upgrade-insecure-requests');
            // Additional Security Headers
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('X-Frame-Options', 'DENY');
            res.setHeader('X-XSS-Protection', '1; mode=block');
            res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
            res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
            next();
        });
        // Test endpoints
        app.get('/test', (req, res) => {
            res.json({ message: 'Test endpoint' });
        });
        app.get('/api/data', (req, res) => {
            res.json({ data: 'sensitive information' });
        });
        app.post('/api/form', (req, res) => {
            res.json({ success: true });
        });
    });
    describe('HTTP Strict Transport Security (HSTS)', () => {
        test('should include HSTS header with correct directives', async () => {
            const response = await request(app).get('/test');
            const hstsHeader = response.headers['strict-transport-security'];
            expect(hstsHeader).toBeDefined();
            // Parse HSTS header
            const hstsDirectives = parseHSTSHeader(hstsHeader);
            expect(hstsDirectives).toHaveProperty('max-age');
            expect(parseInt(hstsDirectives['max-age'])).toBeGreaterThanOrEqual(31536000); // 1 year minimum
            expect(hstsDirectives).toHaveProperty('includeSubDomains');
            expect(hstsDirectives).toHaveProperty('preload');
        });
        test('should have sufficient max-age value', async () => {
            const response = await request(app).get('/test');
            const hstsHeader = response.headers['strict-transport-security'];
            const maxAgeMatch = hstsHeader.match(/max-age=(\d+)/);
            expect(maxAgeMatch).toBeTruthy();
            const maxAge = parseInt(maxAgeMatch[1]);
            expect(maxAge).toBeGreaterThanOrEqual(31536000); // 1 year minimum
            expect(maxAge).toBeLessThanOrEqual(63072000); // 2 years maximum (recommended)
        });
        test('should be present on all HTTPS endpoints', async () => {
            const endpoints = ['/test', '/api/data'];
            for (const endpoint of endpoints) {
                const response = await request(app).get(endpoint);
                expect(response.headers['strict-transport-security']).toBeDefined();
            }
        });
    });
    describe('Content Security Policy (CSP)', () => {
        test('should include CSP header with secure directives', async () => {
            const response = await request(app).get('/test');
            const cspHeader = response.headers['content-security-policy'];
            expect(cspHeader).toBeDefined();
            const cspDirectives = parseCSPHeader(cspHeader);
            // Essential directives should be present
            expect(cspDirectives).toHaveProperty('default-src');
            expect(cspDirectives).toHaveProperty('script-src');
            expect(cspDirectives).toHaveProperty('style-src');
            expect(cspDirectives).toHaveProperty('object-src');
            expect(cspDirectives).toHaveProperty('base-uri');
            expect(cspDirectives).toHaveProperty('form-action');
            expect(cspDirectives).toHaveProperty('frame-ancestors');
        });
        test('should restrict dangerous directives appropriately', async () => {
            const response = await request(app).get('/test');
            const cspHeader = response.headers['content-security-policy'];
            const cspDirectives = parseCSPHeader(cspHeader);
            // object-src should be 'none' to prevent Flash/plugin content
            expect(cspDirectives['object-src']).toBe('\'none\'');
            // base-uri should be restricted to prevent base tag injection
            expect(cspDirectives['base-uri']).toContain('\'self\'');
            // frame-ancestors should be 'none' or restricted to prevent clickjacking
            expect(cspDirectives['frame-ancestors']).toBe('\'none\'');
            // form-action should be restricted
            expect(cspDirectives['form-action']).toContain('\'self\'');
        });
        test('should include upgrade-insecure-requests directive', async () => {
            const response = await request(app).get('/test');
            const cspHeader = response.headers['content-security-policy'];
            expect(cspHeader).toContain('upgrade-insecure-requests');
        });
        test('should not allow unsafe-eval in script-src', async () => {
            const response = await request(app).get('/test');
            const cspHeader = response.headers['content-security-policy'];
            expect(cspHeader).not.toContain('\'unsafe-eval\'');
        });
        test('should validate nonce generation for inline scripts', () => {
            // Test nonce generation utility
            const nonce1 = generateCSPNonce();
            const nonce2 = generateCSPNonce();
            expect(nonce1).toHaveLength(32); // Base64 encoded 24 bytes
            expect(nonce2).toHaveLength(32);
            expect(nonce1).not.toBe(nonce2);
            expect(nonce1).toMatch(/^[A-Za-z0-9+/]+=*$/); // Valid base64
        });
    });
    describe('X-Content-Type-Options', () => {
        test('should include nosniff directive', async () => {
            const response = await request(app).get('/test');
            expect(response.headers['x-content-type-options']).toBe('nosniff');
        });
        test('should be present on all content responses', async () => {
            const endpoints = ['/test', '/api/data'];
            for (const endpoint of endpoints) {
                const response = await request(app).get(endpoint);
                expect(response.headers['x-content-type-options']).toBe('nosniff');
            }
        });
    });
    describe('X-Frame-Options', () => {
        test('should prevent framing with DENY or SAMEORIGIN', async () => {
            const response = await request(app).get('/test');
            const xFrameOptions = response.headers['x-frame-options'];
            expect(xFrameOptions).toMatch(/^(DENY|SAMEORIGIN)$/);
        });
        test('should be consistent with CSP frame-ancestors', async () => {
            const response = await request(app).get('/test');
            const xFrameOptions = response.headers['x-frame-options'];
            const cspHeader = response.headers['content-security-policy'];
            const cspDirectives = parseCSPHeader(cspHeader);
            if (xFrameOptions === 'DENY') {
                expect(cspDirectives['frame-ancestors']).toBe('\'none\'');
            }
            else if (xFrameOptions === 'SAMEORIGIN') {
                expect(cspDirectives['frame-ancestors']).toContain('\'self\'');
            }
        });
    });
    describe('X-XSS-Protection', () => {
        test('should enable XSS filtering with block mode', async () => {
            const response = await request(app).get('/test');
            const xssProtection = response.headers['x-xss-protection'];
            expect(xssProtection).toMatch(/^1(; mode=block)?$/);
        });
    });
    describe('Referrer-Policy', () => {
        test('should include appropriate referrer policy', async () => {
            const response = await request(app).get('/test');
            const referrerPolicy = response.headers['referrer-policy'];
            expect(referrerPolicy).toBeDefined();
            // Should be one of the secure options
            const secureReferrerPolicies = [
                'no-referrer',
                'no-referrer-when-downgrade',
                'strict-origin',
                'strict-origin-when-cross-origin',
                'same-origin'
            ];
            expect(secureReferrerPolicies).toContain(referrerPolicy);
        });
    });
    describe('Permissions-Policy (Feature-Policy)', () => {
        test('should restrict dangerous permissions', async () => {
            const response = await request(app).get('/test');
            const permissionsPolicy = response.headers['permissions-policy'];
            expect(permissionsPolicy).toBeDefined();
            // Should restrict camera, microphone, and geolocation by default
            expect(permissionsPolicy).toContain('camera=()');
            expect(permissionsPolicy).toContain('microphone=()');
            expect(permissionsPolicy).toContain('geolocation=()');
        });
    });
    describe('Security Header Configuration Validation', () => {
        test('should have all required security headers', async () => {
            const response = await request(app).get('/test');
            const requiredHeaders = [
                'strict-transport-security',
                'content-security-policy',
                'x-content-type-options',
                'x-frame-options',
                'x-xss-protection',
                'referrer-policy'
            ];
            requiredHeaders.forEach(header => {
                expect(response.headers[header]).toBeDefined();
            });
        });
        test('should not expose server information', async () => {
            const response = await request(app).get('/test');
            // Should not expose sensitive server information
            expect(response.headers['server']).toBeUndefined();
            expect(response.headers['x-powered-by']).toBeUndefined();
        });
        test('should include security headers on error responses', async () => {
            const response = await request(app).get('/nonexistent');
            // Even 404 responses should include security headers
            expect(response.headers['strict-transport-security']).toBeDefined();
            expect(response.headers['content-security-policy']).toBeDefined();
            expect(response.headers['x-content-type-options']).toBeDefined();
        });
    });
    describe('CSP Reporting and Monitoring', () => {
        test('should support CSP reporting endpoint', () => {
            const cspWithReporting = 'default-src \'self\'; ' +
                'script-src \'self\'; ' +
                'report-uri /csp-report; ' +
                'report-to csp-endpoint';
            const directives = parseCSPHeader(cspWithReporting);
            expect(directives).toHaveProperty('report-uri');
            expect(directives['report-uri']).toBe('/csp-report');
        });
        test('should validate CSP report format', () => {
            const mockCSPReport = {
                'csp-report': {
                    'document-uri': 'https://example.com/page',
                    'referrer': '',
                    'violated-directive': 'script-src',
                    'effective-directive': 'script-src',
                    'original-policy': 'default-src \'self\'; script-src \'self\'',
                    'blocked-uri': 'https://evil.com/script',
                    'status-code': 200
                }
            };
            expect(validateCSPReport(mockCSPReport)).toBe(true);
        });
    });
    describe('Header Security Scanning', () => {
        test('should pass OWASP security header checklist', async () => {
            const response = await request(app).get('/test');
            const headers = response.headers;
            const securityScore = calculateSecurityScore(headers);
            expect(securityScore.total).toBeGreaterThanOrEqual(80); // Minimum 80% score
            // Check for specific security requirements
            expect(securityScore.checks.hsts).toBe(true);
            expect(securityScore.checks.csp).toBe(true);
            expect(securityScore.checks.contentTypeOptions).toBe(true);
            expect(securityScore.checks.frameOptions).toBe(true);
        });
        test('should detect and warn about insecure configurations', async () => {
            // Test app with insecure headers
            const insecureApp = express();
            insecureApp.use((req, res, next) => {
                res.setHeader('Content-Security-Policy', 'default-src *; script-src * \'unsafe-eval\' \'unsafe-inline\'');
                next();
            });
            insecureApp.get('/test', (req, res) => res.json({ test: true }));
            const response = await request(insecureApp).get('/test');
            const warnings = analyzeSecurityHeaders(response.headers);
            expect(warnings).toContain('CSP_WILDCARD_SOURCE');
            expect(warnings).toContain('CSP_UNSAFE_EVAL');
            expect(warnings).toContain('CSP_UNSAFE_INLINE');
        });
    });
    describe('Performance Impact Assessment', () => {
        test('should measure header overhead', async () => {
            const startTime = Date.now();
            const response = await request(app).get('/test');
            const endTime = Date.now();
            const responseTime = endTime - startTime;
            const headerSize = JSON.stringify(response.headers).length;
            // Headers should not significantly impact performance
            expect(responseTime).toBeLessThan(100); // Sub-100ms response
            expect(headerSize).toBeLessThan(2048); // < 2KB of headers
        });
    });
});
// Utility Functions
/**
 * Parse HSTS header into directive object
 */
function parseHSTSHeader(header) {
    const directives = {};
    header.split(';').forEach(directive => {
        const trimmed = directive.trim();
        if (trimmed.includes('=')) {
            const [key, value] = trimmed.split('=', 2);
            directives[key.trim()] = value.trim();
        }
        else {
            directives[trimmed] = 'true';
        }
    });
    return directives;
}
/**
 * Parse CSP header into directive object
 */
function parseCSPHeader(header) {
    const directives = {};
    header.split(';').forEach(directive => {
        const trimmed = directive.trim();
        if (trimmed) {
            const parts = trimmed.split(/\s+/);
            const directiveName = parts[0];
            const directiveValue = parts.slice(1).join(' ');
            directives[directiveName] = directiveValue;
        }
    });
    return directives;
}
/**
 * Generate cryptographically secure CSP nonce
 */
function generateCSPNonce() {
    const crypto = require('crypto');
    return crypto.randomBytes(24).toString('base64');
}
/**
 * Validate CSP violation report structure
 */
function validateCSPReport(report) {
    if (!report['csp-report'])
        return false;
    const cspReport = report['csp-report'];
    const requiredFields = [
        'document-uri',
        'violated-directive',
        'effective-directive',
        'original-policy'
    ];
    return requiredFields.every(field => field in cspReport);
}
/**
 * Calculate security score based on headers
 */
function calculateSecurityScore(headers) {
    const checks = {
        hsts: !!headers['strict-transport-security'],
        csp: !!headers['content-security-policy'],
        contentTypeOptions: headers['x-content-type-options'] === 'nosniff',
        frameOptions: !!headers['x-frame-options'],
        xssProtection: !!headers['x-xss-protection'],
        referrerPolicy: !!headers['referrer-policy'],
        permissionsPolicy: !!headers['permissions-policy']
    };
    const totalChecks = Object.keys(checks).length;
    const passedChecks = Object.values(checks).filter(Boolean).length;
    const total = Math.round((passedChecks / totalChecks) * 100);
    return { total, checks };
}
/**
 * Analyze security headers for common issues
 */
function analyzeSecurityHeaders(headers) {
    const warnings = [];
    // Check CSP for common issues
    const csp = headers['content-security-policy'];
    if (csp) {
        if (csp.includes('\'unsafe-eval\'')) {
            warnings.push('CSP_UNSAFE_EVAL');
        }
        if (csp.includes('\'unsafe-inline\'')) {
            warnings.push('CSP_UNSAFE_INLINE');
        }
        if (csp.includes('default-src *') || csp.includes('script-src *')) {
            warnings.push('CSP_WILDCARD_SOURCE');
        }
    }
    // Check HSTS
    const hsts = headers['strict-transport-security'];
    if (hsts) {
        const maxAgeMatch = hsts.match(/max-age=(\d+)/);
        if (maxAgeMatch && parseInt(maxAgeMatch[1]) < 31536000) {
            warnings.push('HSTS_SHORT_MAX_AGE');
        }
    }
    else {
        warnings.push('MISSING_HSTS');
    }
    // Check for missing headers
    if (!headers['x-content-type-options']) {
        warnings.push('MISSING_CONTENT_TYPE_OPTIONS');
    }
    if (!headers['x-frame-options']) {
        warnings.push('MISSING_FRAME_OPTIONS');
    }
    return warnings;
}
/**
 * Integration test helper for external security scanning
 */
export class SecurityHeaderScanner {
    static async scanEndpoint(url) {
        // This would integrate with external security scanning services
        // For testing purposes, we'll simulate the functionality
        const mockResponse = {
            score: 85,
            headers: {
                'strict-transport-security': 'max-age=31536000; includeSubDomains',
                'content-security-policy': 'default-src \'self\'',
                'x-content-type-options': 'nosniff',
                'x-frame-options': 'DENY'
            },
            warnings: [],
            recommendations: [
                'Add Permissions-Policy header',
                'Include preload directive in HSTS',
                'Consider implementing CSP reporting'
            ]
        };
        return mockResponse;
    }
    static async generateSecurityReport(scanResults) {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalEndpoints: scanResults.length,
                averageScore: scanResults.reduce((sum, r) => sum + r.score, 0) / scanResults.length,
                criticalIssues: scanResults.filter(r => r.score < 60).length
            },
            details: scanResults,
            recommendations: [
                'Implement Content Security Policy on all endpoints',
                'Enable HSTS with preload for all domains',
                'Set up automated security header monitoring',
                'Configure CSP violation reporting'
            ]
        };
        return JSON.stringify(report, null, 2);
    }
}
