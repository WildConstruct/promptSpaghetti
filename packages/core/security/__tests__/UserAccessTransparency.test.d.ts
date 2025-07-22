/**
 * Test Suite for User Access Transparency Service
 *
 * Comprehensive tests for user access transparency including:
 * - Data inventory generation
 * - Access activity tracking
 * - DSAR processing
 * - Privacy scoring
 * - Notification handling
 * - Settings management
 */
declare global {
    namespace jest {
        interface Matchers<R> {
            toBeValidDate(): R;
            toBeWithinTimeRange(start: Date, end: Date): R;
        }
    }
}
export {};
//# sourceMappingURL=UserAccessTransparency.test.d.ts.map