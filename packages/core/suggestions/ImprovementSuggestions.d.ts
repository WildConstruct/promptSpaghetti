/**
 * Improvement Suggestions System (Epic 16)
 *
 * DEPLOYMENT BLOCKER FIX: Comprehensive improvement suggestions system
 * for analyzing user behavior, content performance, and system usage
 * to provide intelligent recommendations for optimization, enhancement,
 * and user experience improvements.
 *
 * Features:
 * - Intelligent suggestion generation
 * - Performance analysis and recommendations
 * - User experience optimization
 * - Content quality assessment
 * - Automated improvement detection
 * - Personalized suggestions
 * - A/B testing recommendations
 * - Predictive analytics
 */
import { EventEmitter } from 'events';
export interface ImprovementSuggestion {
    id: string;
    type: SuggestionType;
    category: SuggestionCategory;
    priority: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    rationale: string;
    impact: ImpactAssessment;
    implementation: ImplementationDetails;
    evidence: Evidence[];
    status: SuggestionStatus;
    confidence: number;
    targetAudience: string[];
    tags: string[];
    metadata: SuggestionMetadata;
}
export type SuggestionType = 'performance' | 'usability' | 'accessibility' | 'content' | 'workflow' | 'feature' | 'design' | 'technical' | 'business' | 'security';
export type SuggestionCategory = 'optimization' | 'enhancement' | 'fix' | 'new_feature' | 'removal' | 'modification' | 'reorganization' | 'automation';
export type SuggestionStatus = 'generated' | 'pending_review' | 'approved' | 'rejected' | 'in_progress' | 'completed' | 'deferred' | 'cancelled';
export interface ImpactAssessment {
    scope: 'individual' | 'team' | 'organization' | 'global';
    userExperience: number;
    performance: number;
    maintainability: number;
    businessValue: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    estimatedUsers: number;
    timeToValue: number;
    overallScore: number;
}
export interface ImplementationDetails {
    complexity: 'trivial' | 'simple' | 'moderate' | 'complex' | 'very_complex';
    estimatedEffort: number;
    skillsRequired: string[];
    dependencies: string[];
    prerequisites: string[];
    risksAndChallenges: string[];
    acceptanceCriteria: string[];
    testingStrategy: string;
    rolloutPlan: string;
}
export interface Evidence {
    id: string;
    type: 'data' | 'observation' | 'feedback' | 'analytics' | 'research' | 'experiment';
    source: string;
    description: string;
    data?: any;
    confidence: number;
    timestamp: Date;
    relevance: number;
}
export interface SuggestionMetadata {
    generatedBy: 'system' | 'user' | 'ai' | 'analysis';
    algorithm?: string;
    version: string;
    createdAt: Date;
    lastUpdated: Date;
    reviewedBy?: string;
    implementedBy?: string;
    relatedSuggestions: string[];
    parentSuggestion?: string;
    childSuggestions: string[];
}
export interface AnalysisContext {
    userId?: string;
    sessionId?: string;
    timeRange: {
        start: Date;
        end: Date;
    };
    scope: AnalysisScope;
    filters: AnalysisFilters;
    metrics: ContextMetrics;
    userBehavior: UserBehaviorData;
    systemState: SystemStateData;
}
export interface AnalysisScope {
    domain: 'user_experience' | 'performance' | 'content' | 'workflow' | 'system' | 'business';
    components: string[];
    userSegments: string[];
    features: string[];
    workflows: string[];
}
export interface AnalysisFilters {
    includeTypes: SuggestionType[];
    excludeTypes: SuggestionType[];
    minPriority: 'low' | 'medium' | 'high' | 'critical';
    maxComplexity: 'trivial' | 'simple' | 'moderate' | 'complex' | 'very_complex';
    minConfidence: number;
    targetAudience: string[];
}
export interface ContextMetrics {
    performanceMetrics: {
        responseTime: number;
        errorRate: number;
        throughput: number;
        availability: number;
    };
    usageMetrics: {
        activeUsers: number;
        sessionDuration: number;
        bounceRate: number;
        conversionRate: number;
    };
    qualityMetrics: {
        userSatisfaction: number;
        contentQuality: number;
        featureAdoption: number;
        supportTickets: number;
    };
}
export interface UserBehaviorData {
    commonPatterns: BehaviorPattern[];
    dropoffPoints: DropoffPoint[];
    painPoints: PainPoint[];
    successPaths: SuccessPath[];
    featureUsage: FeatureUsageData[];
    preferences: UserPreference[];
}
export interface BehaviorPattern {
    id: string;
    description: string;
    frequency: number;
    userSegment: string;
    actions: UserAction[];
    outcome: 'success' | 'failure' | 'abandonment' | 'completion';
    confidence: number;
}
export interface UserAction {
    type: string;
    target: string;
    timestamp: Date;
    duration: number;
    success: boolean;
    metadata: Record<string, any>;
}
export interface DropoffPoint {
    location: string;
    dropoffRate: number;
    commonReasons: string[];
    userSegments: string[];
    timeSpent: number;
    recoveryActions: string[];
}
export interface PainPoint {
    id: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    frequency: number;
    affectedUsers: number;
    userFeedback: string[];
    potentialCauses: string[];
    suggestedSolutions: string[];
}
export interface SuccessPath {
    id: string;
    description: string;
    steps: string[];
    completionRate: number;
    averageTime: number;
    userSatisfaction: number;
    variability: number;
}
export interface FeatureUsageData {
    feature: string;
    adoptionRate: number;
    usageFrequency: number;
    userSatisfaction: number;
    commonIssues: string[];
    improvementOpportunities: string[];
}
export interface UserPreference {
    category: string;
    preference: string;
    strength: number;
    userSegment: string;
    confidence: number;
}
export interface SystemStateData {
    performance: {
        cpu: number;
        memory: number;
        disk: number;
        network: number;
    };
    errors: ErrorPattern[];
    warnings: WarningPattern[];
    capacityMetrics: CapacityMetric[];
    trends: TrendData[];
}
export interface ErrorPattern {
    type: string;
    frequency: number;
    impact: 'low' | 'medium' | 'high' | 'critical';
    commonCauses: string[];
    affectedComponents: string[];
    trends: string;
}
export interface WarningPattern {
    type: string;
    frequency: number;
    threshold: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    predictedImpact: string;
}
export interface CapacityMetric {
    resource: string;
    utilization: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    projectedCapacity: number;
    timeToLimit: number;
}
export interface TrendData {
    metric: string;
    direction: 'up' | 'down' | 'stable';
    rate: number;
    confidence: number;
    significance: 'low' | 'medium' | 'high';
}
export interface SuggestionConfiguration {
    generation: {
        enableAutomaticGeneration: boolean;
        analysisInterval: number;
        batchSize: number;
        confidenceThreshold: number;
        diversityFactor: number;
    };
    filtering: {
        enableSmartFiltering: boolean;
        duplicateDetection: boolean;
        relevanceThreshold: number;
        impactThreshold: number;
    };
    prioritization: {
        algorithm: 'impact' | 'effort' | 'roi' | 'user_value' | 'business_value';
        weights: {
            impact: number;
            effort: number;
            confidence: number;
            urgency: number;
        };
    };
    delivery: {
        enableRealTimeDelivery: boolean;
        batchDelivery: boolean;
        personalization: boolean;
        contextAware: boolean;
    };
}
export declare class ImprovementSuggestionsSystem extends EventEmitter {
    private suggestions;
    private analysisContexts;
    private config;
    private analyzerWorkers;
    private generatorWorkers;
    private isAnalysisRunning;
    constructor(config?: Partial<SuggestionConfiguration>);
    generateSuggestions(context: AnalysisContext): Promise<string[]>;
    getSuggestions(filters?: {
        types?: SuggestionType[];
        categories?: SuggestionCategory[];
        priorities?: string[];
        status?: SuggestionStatus[];
        targetAudience?: string[];
        confidenceMin?: number;
        impactMin?: number;
    }): ImprovementSuggestion[];
    getPersonalizedSuggestions(userId: string, context?: Partial<AnalysisContext>): Promise<ImprovementSuggestion[]>;
    updateSuggestionStatus(suggestionId: string, status: SuggestionStatus, metadata?: Partial<SuggestionMetadata>): Promise<void>;
    provideFeedback(suggestionId: string, feedback: {
        rating: number;
        helpful: boolean;
        comment?: string;
        implemented?: boolean;
        outcome?: string;
    }): Promise<void>;
    generateTargetedSuggestions(problem: {
        type: string;
        description: string;
        context: Record<string, any>;
        urgency: 'low' | 'medium' | 'high' | 'critical';
    }): Promise<string[]>;
    approveSuggestions(suggestionIds: string[]): Promise<void>;
    rejectSuggestions(suggestionIds: string[], reason?: string): Promise<void>;
    getSuggestionAnalytics(): {
        totalSuggestions: number;
        byType: Record<SuggestionType, number>;
        byPriority: Record<string, number>;
        byStatus: Record<SuggestionStatus, number>;
        averageConfidence: number;
        averageImpact: number;
        implementationRate: number;
        approvalRate: number;
        topCategories: Array<{
            category: SuggestionCategory;
            count: number;
        }>;
    };
    updateConfiguration(config: Partial<SuggestionConfiguration>): void;
    destroy(): void;
    private initializeAnalyzers;
    private initializeGenerators;
    private analyzePerformance;
    private analyzeUserExperience;
    private analyzeContent;
    private analyzeWorkflows;
    private analyzeAccessibility;
    private analyzeSecurity;
    private generateSuggestionsFromAnalysis;
    private createSuggestionFromOpportunity;
    private filterSuggestions;
    private removeDuplicateSuggestions;
    private prioritizeSuggestions;
    private calculatePriorityScore;
    private getEffortScore;
    private getUrgencyScore;
    private storeSuggestion;
    private startAutomaticAnalysis;
    private stopAutomaticAnalysis;
    private restartAutomaticAnalysis;
    private runAutomaticAnalysis;
    private buildDefaultAnalysisContext;
    private buildUserContext;
    private getUserBehaviorData;
    private personalizeS;
    uggestions(suggestions: ImprovementSuggestion[], userBehavior: UserBehaviorData, context: AnalysisContext): ImprovementSuggestion[];
    private updateAlgorithmsFromFeedback;
    private mapProblemTypeToDomain;
    private mapProblemTypeToSuggestionTypes;
    private filterForProblemRelevance;
    private mapOpportunityToType;
    private mapOpportunityToCategory;
    private calculatePriority;
    private generateDetailedDescription;
    private generateRationale;
    private assessImpact;
    private generateImplementationDetails;
    private generateEvidence;
    private calculateConfidence;
    private identifyTargetAudience;
    private generateTags;
    private getCurrentMetrics;
    private getCurrentUserBehavior;
    private getCurrentSystemState;
    private generatePerformanceSuggestions;
    private generateUsabilitySuggestions;
    private generateContentSuggestions;
    private generateWorkflowSuggestions;
    private generateFeatureSuggestions;
}
declare const _default: {
    ImprovementSuggestionsSystem: typeof ImprovementSuggestionsSystem;
};
export default _default;
//# sourceMappingURL=ImprovementSuggestions.d.ts.map