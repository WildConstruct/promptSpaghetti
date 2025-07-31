/**
 * Epic 17 Feature Toggle Dependency Management Service
 *
 * Provides comprehensive dependency management for feature toggles including:
 * - Dependency visualization and impact analysis
 * - Conflict detection between dependent toggles
 * - Dependency enforcement during activation
 * - Critical path analysis for toggle rollouts
 * - Automated dependency resolution suggestions
 */
import { EventEmitter } from 'events';

}
export interface ToggleDependency {
    id: string;
    sourceToggleId: string;
    targetToggleId: string;
    dependencyType: DependencyType;
    relationship: DependencyRelationship;
    strength: number;
    reason: string;
    autoDetected: boolean;
    metadata: DependencyMetadata;
    created: Date;
    lastValidated: Date;

export declare enum DependencyType {
    REQUIRES = "requires",// Source requires target to be active
    BLOCKS = "blocks",// Source blocks target from being active
    CONFLICTS = "conflicts",// Source conflicts with target (mutual exclusion)
    ENHANCES = "enhances",// Source enhances target functionality
    FOLLOWS = "follows",// Source should activate after target
    PRECEDES = "precedes"

export declare enum DependencyRelationship {
    HARD = "hard",// Strict dependency - cannot be violated
    SOFT = "soft",// Preference - can be overridden with warning
    CONDITIONAL = "conditional",// Depends on conditions
    CONTEXTUAL = "contextual"

}
export interface DependencyMetadata {
    category: string;
    epic?: string;
    story?: string;
    tags: string[];
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    businessImpact: string;
    technicalNotes: string[];
    overrideHistory: DependencyOverride[];

}
export interface DependencyOverride {
    id: string;
    actor: string;
    reason: string;
    timestamp: Date;
    duration?: number;
    approved: boolean;
    approver?: string;

}
export interface DependencyGraph {
    nodes: ToggleNode[];
    edges: DependencyEdge[];
    clusters: DependencyCluster[];
    criticalPaths: CriticalPath[];
    conflicts: DependencyConflict[];
    metrics: GraphMetrics;

}
export interface ToggleNode {
    id: string;
    toggleId: string;
    name: string;
    type: string;
    status: 'active' | 'inactive' | 'staged' | 'error';
    level: number;
    dependencies: string[];
    dependents: string[];
    metadata: {
        epic?: string;
        story?: string;
        tags: string[];
        riskScore: number;
        activationCount: number;
        lastActivated?: Date;
}
    };

}
export interface DependencyEdge {
    id: string;
    source: string;
    target: string;
    type: DependencyType;
    relationship: DependencyRelationship;
    strength: number;
    status: 'valid' | 'invalid' | 'warning' | 'conflict';
    metadata: {
        reason: string;
        validated: Date;
        violations: number;
}
    };

}
export interface DependencyCluster {
    id: string;
    name: string;
    toggles: string[];
    type: 'feature' | 'epic' | 'story' | 'system';
    strength: number;
    external: string[];

}
export interface CriticalPath {
    id: string;
    toggles: string[];
    length: number;
    risk: 'low' | 'medium' | 'high' | 'critical';
    estimatedActivationTime: number;
    bottlenecks: string[];
    alternatives: string[][];

}
export interface DependencyConflict {
    id: string;
    type: ConflictType;
    severity: 'warning' | 'error' | 'critical';
    toggles: string[];
    description: string;
    resolution: ConflictResolution[];
    impact: ConflictImpact;

export declare enum ConflictType {
    CIRCULAR_DEPENDENCY = "circular_dependency",
    MUTUAL_EXCLUSION = "mutual_exclusion",
    TIMING_CONFLICT = "timing_conflict",
    RESOURCE_CONFLICT = "resource_conflict",
    BUSINESS_LOGIC = "business_logic"

}
export interface ConflictResolution {
    id: string;
    type: 'remove_dependency' | 'change_type' | 'add_condition' | 'manual_override';
    description: string;
    automated: boolean;
    confidence: number;
    impact: string;

}
export interface ConflictImpact {
    affectedToggles: number;
    userImpact: 'none' | 'minimal' | 'moderate' | 'significant';
    businessRisk: 'low' | 'medium' | 'high' | 'critical';
    estimatedDowntime?: number;

}
export interface GraphMetrics {
    totalToggles: number;
    totalDependencies: number;
    averageDependencies: number;
    maxDependencyDepth: number;
    circularDependencies: number;
    conflictCount: number;
    healthScore: number;
    lastAnalyzed: Date;

}
export interface DependencyAnalysis {
    graph: DependencyGraph;
    violations: DependencyViolation[];
    recommendations: DependencyRecommendation[];
    impactAssessment: ImpactAssessment;
    riskFactors: RiskFactor[];

}
export interface DependencyViolation {
    id: string;
    type: ViolationType;
    severity: 'low' | 'medium' | 'high' | 'critical';
    toggles: string[];
    dependencies: string[];
    description: string;
    detected: Date;
    resolved?: Date;
    resolution?: string;

export declare enum ViolationType {
    MISSING_DEPENDENCY = "missing_dependency",
    CIRCULAR_REFERENCE = "circular_reference",
    CONFLICTING_STATES = "conflicting_states",
    ORPHANED_TOGGLE = "orphaned_toggle",
    INCONSISTENT_RELATIONSHIP = "inconsistent_relationship"

}
export interface DependencyRecommendation {
    id: string;
    type: RecommendationType;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    toggles: string[];
    action: string;
    rationale: string;
    expectedBenefit: string;
    estimatedEffort: number;
    automated: boolean;

export declare enum RecommendationType {
    ADD_DEPENDENCY = "add_dependency",
    REMOVE_DEPENDENCY = "remove_dependency",
    CHANGE_RELATIONSHIP = "change_relationship",
    CREATE_CLUSTER = "create_cluster",
    OPTIMIZE_PATH = "optimize_path",
    RESOLVE_CONFLICT = "resolve_conflict"

}
export interface ImpactAssessment {
    directImpact: ToggleImpact[];
    indirectImpact: ToggleImpact[];
    userSegments: string[];
    systemComponents: string[];
    estimatedUsers: number;
    riskScore: number;
    mitigation: string[];

}
export interface ToggleImpact {
    toggleId: string;
    impactType: 'activation' | 'deactivation' | 'modification' | 'dependency_change';
    severity: 'minimal' | 'moderate' | 'significant' | 'critical';
    description: string;
    affectedFeatures: string[];
    userExperienceChange: string;

}
export interface RiskFactor {
    category: 'technical' | 'business' | 'user_experience' | 'compliance';
    risk: string;
    probability: number;
    impact: number;
    score: number;
    mitigation: string[];

}
export interface DependencyServiceConfig {
    detection: {
        autoDetectDependencies: boolean;
        detectionPatterns: string[];
        confidenceThreshold: number;
        maxDependencyDepth: number;
}
    };
    validation: {
        validateOnActivation: boolean;
        allowCircularDependencies: boolean;
        maxCircularDepth: number;
        strictMode: boolean;
    };
    visualization: {
        maxNodesInGraph: number;
        clusteringEnabled: boolean;
        layoutAlgorithm: 'hierarchical' | 'force' | 'circular' | 'dagre';
        showMetadata: boolean;
    };
    analysis: {
        analyzeInterval: number;
        riskAssessmentEnabled: boolean;
        impactAnalysisDepth: number;
        recommendationEngine: boolean;
    };
/**
 * Feature Toggle Dependency Management Service
 *
 * Core service for managing feature toggle dependencies in Epic 17.
 * Provides comprehensive dependency analysis, visualization, and enforcement.
 */
export declare class FeatureToggleDependencyService extends EventEmitter {
    private dependencies;
    private dependencyGraph;
    private config;
    private analysisCache;
    private conflictResolutions;
    constructor(config?: Partial<DependencyServiceConfig>);
    /**
     * Add or update a dependency between toggles
     */
    addDependency(dependency: Omit<ToggleDependency, 'id' | 'created' | 'lastValidated'>): Promise<ToggleDependency>;
    /**
     * Remove a dependency
     */
    removeDependency(dependencyId: string): Promise<boolean>;
    /**
     * Validate toggle activation against dependencies
     */
    validateToggleActivation(toggleId: string): Promise<{
        canActivate: boolean;
        blockers: string[];
        warnings: string[];
        requirements: string[];
    }>;
    /**
     * Generate dependency graph for visualization
     */
    generateDependencyGraph(toggleIds?: string[]): Promise<DependencyGraph>;
    /**
     * Analyze dependencies and provide recommendations
     */
    analyzeDependencies(toggleIds?: string[]): Promise<DependencyAnalysis>;
    /**
     * Get impact analysis for toggle changes
     */
    getImpactAnalysis(toggleId: string, action: 'activate' | 'deactivate'): Promise<ImpactAssessment>;
    private initializeEmptyGraph;
    private generateDependencyId;
    private validateDependency;
    private updateDependencyGraph;
    private calculateNodeLevels;
    private generateClusters;
    private findCriticalPaths;
    private detectConflicts;
    private calculateGraphMetrics;
    private performPeriodicAnalysis;
    private isToggleActive;
    private getToggleInfo;
    private calculateToggleRisk;
    private validateDependencyStatus;
    private countDependencyViolations;
    private wouldCreateCircularDependency;
    private findConflictingDependencies;
    private detectViolations;
    private generateRecommendations;
    private assessImpact;
    private analyzeRiskFactors;
    private calculateImpactSeverity;
    private getToggleFeatures;
    private describeUserImpact;
    private getCascadingImpact;
    private getAffectedUserSegments;
    private getAffectedSystemComponents;
    private estimateAffectedUsers;
    private calculateRiskScore;
    private generateMitigationStrategies;
    private calculateClusterStrength;
    private findExternalDependencies;
    private findLongestPath;
    private assessPathRisk;
    private estimateActivationTime;
    private identifyBottlenecks;
    private findAlternativePaths;
    private findCircularDependencies;
    private generateCircularResolutions;
    private assessCircularImpact;
    private findMutualExclusions;
    private generateExclusionResolutions;
    private assessExclusionImpact;

export default FeatureToggleDependencyService;
//# sourceMappingURL=FeatureToggleDependencyService.d.ts.map