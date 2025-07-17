import { ExtensionManifest } from './ExtensionManifest';
import { UpgradePath } from './ExtensionVersionManager';
import { ExtensionCompatibilityResult } from './ExtensionCompatibilityChecker';
export declare class ExtensionUpgradeAdvisor {
    private static instance;
    private upgradeStrategies;
    private migrationRules;
    private breakingChanges;
    private constructor();
    static getInstance(): ExtensionUpgradeAdvisor;
    getUpgradeRecommendations(currentExtension: ExtensionManifest, availableVersions: string[], context: UpgradeContext): UpgradeRecommendation;
    analyzeUpgradePath(currentExtension: ExtensionManifest, targetVersion: string, availableVersions: string[], context: UpgradeContext): UpgradeAnalysis;
    generateMigrationPlan(currentExtension: ExtensionManifest, targetVersion: string, context: UpgradeContext): MigrationPlan;
    checkBreakingChanges(extensionId: string, fromVersion: string, toVersion: string): BreakingChangeAnalysis;
    validateUpgradeCompatibility(currentExtension: ExtensionManifest, targetExtension: ExtensionManifest, context: UpgradeContext): UpgradeCompatibilityResult;
    private determineUpgradeStrategy;
    private getConservativeRecommendations;
    private getModerateRecommendations;
    private getAggressiveRecommendations;
    private getSecurityRecommendations;
    private generateMigrationTasks;
    private assessUpgradeRisks;
    private identifyUpgradeBenefits;
    private initializeDefaultStrategies;
    private calculateImpactLevel;
    private checkDependencyConflicts;
    private analyzePermissionChanges;
    private requiresRestart;
    private requiresDataBackup;
    private estimateUpgradeEffort;
    private generateUpgradeTimeline;
    private generateMigrationPhases;
    private generateRollbackPlan;
    private generateTestingPlan;
    private identifyPrerequisites;
}
export interface UpgradeContext {
    systemVersion: string;
    platform: string;
    availableExtensions: Map<string, ExtensionManifest>;
    grantedPermissions: string[];
    browserInfo?: Record<string, string>;
    securityPriority?: boolean;
    stabilityPriority?: boolean;
    featurePriority?: boolean;
}
export interface UpgradeRecommendation {
    hasUpdates: boolean;
    currentVersion: string;
    recommendations: VersionRecommendation[];
    strategy: UpgradeStrategyType;
}
export interface VersionRecommendation {
    version: string;
    priority: 'low' | 'medium' | 'high';
    reason: string;
    risk: 'low' | 'medium' | 'high';
    benefits: string[];
    effort: 'minimal' | 'low' | 'medium' | 'high';
}
export interface UpgradeAnalysis {
    feasible: boolean;
    reason?: string;
    path: UpgradePath;
    migrationTasks: MigrationTask[];
    risks: UpgradeRisk[];
    benefits: UpgradeBenefit[];
    estimatedEffort?: EffortEstimate;
    timeline?: UpgradeTimeline;
}
export interface MigrationPlan {
    viable: boolean;
    reason?: string;
    phases: MigrationPhase[];
    rollbackPlan?: RollbackPlan;
    testingPlan?: TestingPlan;
    estimatedDuration?: string;
    riskLevel?: 'low' | 'medium' | 'high';
    prerequisites?: string[];
}
interface BreakingChange {
    introducedIn: string;
    type: 'api' | 'config' | 'behavior' | 'dependency';
    description: string;
    impact: 'low' | 'medium' | 'high';
    migrationRequired: boolean;
    automatedMigration: boolean;
    migrationGuide?: string;
}
interface BreakingChangeAnalysis {
    hasBreakingChanges: boolean;
    changes: BreakingChange[];
    impactLevel: 'low' | 'medium' | 'high';
    migrationRequired: boolean;
    automatedMigration: boolean;
}
interface UpgradeCompatibilityResult {
    compatible: boolean;
    compatibilityResult: ExtensionCompatibilityResult;
    dependencyConflicts: DependencyConflict[];
    permissionChanges: PermissionChange[];
    requiresRestart: boolean;
    dataBackupRequired: boolean;
}
interface DependencyConflict {
    dependencyId: string;
    conflictType: 'version' | 'missing' | 'incompatible';
    description: string;
    resolution: string;
}
interface PermissionChange {
    permission: string;
    changeType: 'added' | 'removed' | 'modified';
    description: string;
    impact: 'low' | 'medium' | 'high';
}
interface MigrationTask {
    id: string;
    title: string;
    description: string;
    type: 'preparation' | 'validation' | 'migration' | 'verification';
    required: boolean;
    automated: boolean;
    estimatedDuration: string;
}
interface UpgradeRisk {
    type: 'breaking-changes' | 'dependency-conflicts' | 'data-loss' | 'performance' | 'security';
    severity: 'low' | 'medium' | 'high';
    description: string;
    mitigation: string;
    probability: 'low' | 'medium' | 'high';
}
interface UpgradeBenefit {
    type: 'features' | 'performance' | 'security' | 'stability' | 'compatibility';
    description: string;
    impact: 'low' | 'medium' | 'high';
}
interface EffortEstimate {
    level: 'low' | 'medium' | 'high';
    duration: string;
    complexity: 'simple' | 'moderate' | 'complex';
}
interface UpgradeTimeline {
    phases: Array<{
        name: string;
        duration: string;
        tasks: MigrationTask[];
    }>;
    totalDuration: string;
}
interface MigrationPhase {
    name: string;
    description: string;
    tasks: MigrationTask[];
    duration: string;
}
interface RollbackPlan {
    steps: string[];
    estimatedDuration: string;
    dataLossRisk: 'low' | 'medium' | 'high';
}
interface TestingPlan {
    preUpgradeTests: string[];
    postUpgradeTests: string[];
    rollbackTests: string[];
}
type UpgradeStrategyType = 'conservative' | 'moderate' | 'aggressive' | 'security' | 'none';
export declare const extensionUpgradeAdvisor: ExtensionUpgradeAdvisor;
export {};
//# sourceMappingURL=ExtensionUpgradeAdvisor.d.ts.map