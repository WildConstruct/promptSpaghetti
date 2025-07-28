/**
 * Epic 16 - Contribution Management Service
 * Task: E16-1753114247115-253BF0 - Design contribution architecture
 *
 * Service implementation for managing community contributions through their lifecycle.
 * Integrates workflow management, quality assessment, and publication processes.
 */
import { ContributionRepository } from './ContributionArchitecture';
export declare class ContributionManagementService implements ContributionRepository {
    private apiClient;
    private versionManager;
    private qualityService;
    constructor(apiClient: any);
    catch(error: any): void;
}
//# sourceMappingURL=ContributionManagementService.d.ts.map