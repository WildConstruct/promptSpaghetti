/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

/**
 * Personalization A/B Testing and Optimization Framework - Story 30.2 Task 11
 *
 * Comprehensive framework for running A/B tests on personalization strategies,
 * measuring effectiveness, and optimizing personalization algorithms based on results.
 */
import React from 'react';
import { ConversionAnalyticsInfrastructure } from '../../analytics/ConversionAnalyticsInfrastructure';

}
}
export interface PersonalizationABTestingFrameworkProps { analyticsInfrastructure: ConversionAnalyticsInfrastructure;
    testingConfig: ABTestingConfig;
    onTestResult?: (result: ABTestResult) => void;
    onOptimizationRecommendation?: (recommendation: OptimizationRecommendation) => void;
    onExport?: (data: ABTestingExportData) => void }
}
}
export interface ABTestingConfig { testFramework: TestFramework;
    statisticalSettings: StatisticalSettings;
    experimentDesign: ExperimentDesign;
    optimizationSettings: OptimizationSettings }
}
}
export interface PersonalizationABTest { testId: string;
    name: string;
    description: string;
    status: TestStatus;
    variants: TestVariant[];
    metrics: TestMetric[];
    targeting: TestTargeting;
    results: ABTestResult | null;
    timeline: TestTimeline;
    configuration: TestConfiguration;

export type TestStatus = 'draft' | 'running' | 'paused' | 'completed' | 'archived' }
}
}
export interface TestVariant { variantId: string;
    name: string;
    description: string;
    trafficAllocation: number;
    personalizationStrategy: PersonalizationStrategy;
    configuration: VariantConfiguration;
    performance: VariantPerformance }
}
}
export interface PersonalizationStrategy { strategyId: string;
    name: string;
    type: PersonalizationType;
    parameters: StrategyParameters;
    targetSegments: string[];
    adaptationRules: AdaptationRule[];

export type PersonalizationType = 'content_based' | 'collaborative_filtering' | 'hybrid' | 'contextual' | 'behavioral' | 'demographic' }
}
}
export interface ABTestResult { testId: string;
    startDate: number;
    endDate: number;
    participants: number;
    results: VariantResult[];
    statisticalSignificance: StatisticalSignificance;
    winningVariant: string | null;
    insights: TestInsight[];
    recommendations: TestRecommendation[] }
}
}
export interface VariantResult { variantId: string;
    participants: number;
    metrics: MetricResult[];
    confidence: number;
    statisticalPower: number;

export declare const PersonalizationABTestingFramework: React.FC<PersonalizationABTestingFrameworkProps> }
}
}
export interface TestFramework { platform: string;
    version: string;
    capabilities: string[] }
}
}
export interface StatisticalSettings { confidenceLevel: number;
    power: number;
    minimumDetectableEffect: number;
    multipleTestingCorrection: boolean }
}
}
export interface ExperimentDesign { designType: 'ab' | 'multivariate' | 'factorial';
    randomizationUnit: 'user' | 'session' | 'request';
    stratification: string[] }
}
}
export interface OptimizationSettings { algorithm: 'frequentist' | 'bayesian' | 'bandit';
    earlyStoppingRules: EarlyStoppingRule[];
    adaptiveAllocation: boolean }
}
}
export interface EarlyStoppingRule { condition: string;
    threshold: number;
    minimumSampleSize: number }
}
}
export interface TestMetric { metricId: string;
    name: string;
    type: 'primary' | 'secondary' | 'guardrail';
    target: number;
    minimumDetectableEffect: number }
}
}
export interface TestTargeting { audience: string;
    segments: string[];
    filters: TargetingFilter[];
    sampleSize: number }
}
}
export interface TargetingFilter { field: string;
    operator: string;
    value: Error }
}
}
export interface TestTimeline { plannedStart: number;
    plannedEnd: number;
    actualStart: number | null;
    actualEnd: number | null }
}
}
export interface TestConfiguration { confidenceLevel: number;
    minimumSampleSize: number;
    maximumDuration: number;
    earlyStoppingEnabled: boolean;
    multipleTestingCorrection: boolean;
    sequentialTesting: boolean }
}
}
export interface StrategyParameters { [key: string]: unknown }
}
}
export interface AdaptationRule { ruleId: string;
    condition: string;
    action: string;
    parameters: Record<string, any> }
}
}
export interface VariantConfiguration { maxRecommendations: number;
    diversityWeight: number;
    noveltyWeight: number;
    freshnessBias: number }
}
}
export interface VariantPerformance { clickThroughRate: number;
    conversionRate: number;
    engagementScore: number;
    userSatisfaction: number }
}
}
export interface MetricResult { metricId: string;
    value: number;
    standardError: number;
    confidenceInterval: {
        lower: number;
        upper: number }
}
    };

}
}
export interface StatisticalSignificance { pValue: number;
    confidence: number;
    effect: number;
    significance: boolean }
}
}
export interface TestInsight { insightId: string;
    type: string;
    message: string;
    evidence: string[] }
}
}
export interface TestRecommendation { recommendationId: string;
    action: string;
    rationale: string;
    priority: 'low' | 'medium' | 'high' }
}
}
export interface OptimizationRecommendation { recommendationId: string;
    type: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    expectedImpact: {
        conversionIncrease: number;
        engagementIncrease: number;
        revenueIncrease: number;
        confidenceLevel: number }
}
    };
    implementation: { complexity: 'low' | 'medium' | 'high';
        estimatedTime: string;
        resources: string[];
        steps: string[] };
    testEvidence: string[];

}
}
export interface ABTestingExportData { tests: PersonalizationABTest[];
    summary: {
        totalTests: number;
        runningTests: number;
        completedTests: number;
        significantResults: number;
        averageUplift: number }
}
    };
    exportTimestamp: number;

export default PersonalizationABTestingFramework;
//# sourceMappingURL=PersonalizationABTestingFramework.d.ts.map