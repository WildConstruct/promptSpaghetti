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
/**
 * Integration test helper for external security scanning
 */
export declare class SecurityHeaderScanner {
    static scanEndpoint(url: string): Promise<{
        score: number;
        headers: Record<string, string>;
        warnings: string[];
        recommendations: string[];
    }>;
    static generateSecurityReport(scanResults: any[]): Promise<string>;
}
//# sourceMappingURL=SecurityHeaders.test.d.ts.map