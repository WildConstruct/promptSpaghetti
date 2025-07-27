/**
 * Extension Version Manager - Epic 8.4 Story 8.4.4
 * Comprehensive versioning and compatibility management for extensions
 */
import { ExtensionManifest } from './ExtensionManifest';
export declare class SemanticVersion {
    readonly major: number;
    readonly minor: number;
    readonly patch: number;
    readonly prerelease: string[];
    readonly build: string[];
    readonly raw: string;
    constructor(version: string);
    /**
     * Parse version string into components
     */
    private parseVersion;
    /**
     * Compare this version with another
     */
    compareTo(other: SemanticVersion): number;
    /**
     * Check if this version is compatible with a range
     */
    satisfies(range: string): boolean;
    /**
     * Get next version for different release types
     */
    getNextVersion(releaseType: ReleaseType): SemanticVersion;
    /**
     * Check if this is a prerelease version
     */
    isPrerelease(): boolean;
    /**
     * Check if this is a stable version
     */
    isStable(): boolean;
    /**
     * Get version string
     */
    toString(): string;
}
export declare class VersionRange {
    private ranges;
    constructor(ranges: RangeSet[]);
    /**
     * Parse range string into VersionRange
     */
    static parse(range: string): VersionRange;
    /**
     * Parse single comparator
     */
    private static parseComparator;
    /**
     * Check if version satisfies this range
     */
    satisfies(version: SemanticVersion): boolean;
    /**
     * Get string representation
     */
    toString(): string;
}
export declare class ExtensionVersionManager {
    private static instance;
    private versionCache;
    private compatibilityCache;
    private constructor();
    static getInstance(): ExtensionVersionManager;
    /**
     * Parse and validate version
     */
    parseVersion(version: string): SemanticVersion;
    /**
     * Check compatibility between extensions
     */
    checkCompatibility(extension: ExtensionManifest, systemVersion: string, availableExtensions: Map<string, ExtensionManifest>): CompatibilityResult;
    /**
     * Perform actual compatibility check
     */
    private performCompatibilityCheck;
    /**
     * Check system version compatibility
     */
    private checkSystemCompatibility;
    /**
     * Find circular dependencies
     */
    private findCircularDependencies;
    /**
     * Get upgrade path for extension
     */
    getUpgradePath(currentVersion: string, targetVersion: string, availableVersions: string[]): UpgradePath;
    /**
     * Get upgrade step type
     */
    private getUpgradeStepType;
    /**
     * Assess upgrade risk
     */
    private assessUpgradeRisk;
    /**
     * Get recommended actions for upgrade
     */
    private getRecommendedActions;
    /**
     * Calculate total risk for upgrade path
     */
    private calculateTotalRisk;
    /**
     * Estimate upgrade duration
     */
    private estimateDuration;
    /**
     * Clear caches
     */
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