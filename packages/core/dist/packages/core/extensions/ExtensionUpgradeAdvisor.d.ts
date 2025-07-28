/**
 * Extension Upgrade Advisor - Epic 8.4 Story 8.4.4
 * Provides intelligent upgrade recommendations and migration assistance
 */
import { ExtensionManifest } from './ExtensionManifest';
export declare class ExtensionUpgradeAdvisor {
    private static instance;
    private upgradeStrategies;
    private migrationRules;
    private breakingChanges;
    private constructor();
    static getInstance(): ExtensionUpgradeAdvisor;
    /**
    * Get upgrade recommendations for an extension
    */
    getUpgradeRecommendations(currentExtension: ExtensionManifest): any;
    availableVersions: string;
    context: UpgradeContext;
    UpgradeRecommendation: any;
}
//# sourceMappingURL=ExtensionUpgradeAdvisor.d.ts.map