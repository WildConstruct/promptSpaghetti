import { ExtensionManifest } from './ExtensionManifest';
export declare class SemanticVersion {
    readonly major: number;
    readonly minor: number;
    readonly patch: number;
    readonly prerelease: string[];
    readonly build: string[];
    readonly raw: string;
    constructor(version: string);
    private parseVersion;
    compareTo(other: SemanticVersion): number;
    satisfies(range: string): boolean;
    getNextVersion(releaseType: ReleaseType): SemanticVersion;
    isPrerelease(): boolean;
    isStable(): boolean;
    toString(): string;
}
export declare class VersionRange {
    private ranges;
    constructor(ranges: RangeSet[]);
    static parse(range: string): VersionRange;
    private static parseComparator;
    satisfies(version: SemanticVersion): boolean;
    toString(): string;
}
export declare class ExtensionVersionManager {
    private static instance;
    private versionCache;
    private compatibilityCache;
    private constructor();
    static getInstance(): ExtensionVersionManager;
    parseVersion(version: string): SemanticVersion;
    checkCompatibility(extension: ExtensionManifest, systemVersion: string, availableExtensions: Map<string, ExtensionManifest>): CompatibilityResult;
    private performCompatibilityCheck;
    private checkSystemCompatibility;
    private findCircularDependencies;
    getUpgradePath(currentVersion: string, targetVersion: string, availableVersions: string[]): UpgradePath;
    private getUpgradeStepType;
    private assessUpgradeRisk;
    private getRecommendedActions;
    private calculateTotalRisk;
    private estimateDuration;
    clearCaches(): void;
}
type ReleaseType = 'major' | 'minor' | 'patch' | 'prerelease';
type RiskLevel = 'low' | 'medium' | 'high';
type UpgradeStepType = 'major' | 'minor' | 'patch' | 'prerelease';
interface Comparator {
    operator: string;
    version: SemanticVersion;
    satisfies: (version: SemanticVersion) => boolean;
}
type RangeSet = Comparator[];
export interface CompatibilityResult {
    compatible: boolean;
    issues: CompatibilityIssue[];
    warnings: string[];
    systemVersion: string;
    extensionVersion: string;
}
export interface CompatibilityIssue {
    type: 'system-version' | 'missing-dependency' | 'version-mismatch' | 'circular-dependency';
    severity: 'error' | 'warning';
    message: string;
    dependencyId?: string;
    currentVersion?: string;
    requiredVersion?: string;
    circularPath?: string[];
}
export interface UpgradePath {
    possible: boolean;
    reason?: string;
    steps: UpgradeStep[];
    totalRisk?: RiskLevel;
    estimatedDuration?: string;
}
export interface UpgradeStep {
    fromVersion: string;
    toVersion: string;
    type: UpgradeStepType;
    risk: RiskLevel;
    breakingChanges: boolean;
    recommendedActions: string[];
}
export declare const extensionVersionManager: ExtensionVersionManager;
export {};
//# sourceMappingURL=ExtensionVersionManager.d.ts.map