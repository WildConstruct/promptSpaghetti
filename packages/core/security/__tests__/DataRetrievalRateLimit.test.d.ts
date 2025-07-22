/**
 * Test Suite for Data Retrieval Rate Limiting System
 *
 * Comprehensive tests for data retrieval rate limiting including:
 * - Basic rate limiting functionality
 * - Classification-aware limiting
 * - Volume-based throttling
 * - Adaptive limits
 * - Anomaly detection
 * - Quota enforcement
 * - Exemption handling
 */
declare global {
    namespace jest {
        interface Matchers<R> {
            toBeWithinRange(floor: number, ceiling: number): R;
        }
    }
}
export {};
//# sourceMappingURL=DataRetrievalRateLimit.test.d.ts.map