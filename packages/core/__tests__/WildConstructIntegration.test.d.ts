/**
 * Integration Testing Framework for Wild Construct Ecosystem
 * Tests for CrowdControl, Backdrop, Meteor, Maestro, and UTDG integration
 */
import type { Era } from '../types/UTDG';
export declare class IntegrationTestUtils {
    static createMockEra(name: string, startYear: number, endYear: number): Era;
    static validateHistoricalAccuracy(accuracy: number): boolean;
    static mockAPICall(endpoint: string, data: unknown): Promise<any>;
}
export default IntegrationTestUtils;
//# sourceMappingURL=WildConstructIntegration.test.d.ts.map