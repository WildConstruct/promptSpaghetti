/**
 * Epic 14 - A/B Testing Framework
 * Statistical Analysis Engine for experiment results
 */
import { VariantResults, ExperimentMetric } from '../types/experiment';
export interface StatisticalTestResult {
    pValue: number;
    testStatistic: number;
    effect: number;
    effectSize: number;
    confidenceInterval: [number, number];
    significant: boolean;
    practicallySignificant: boolean;
}
export interface BayesianResult {
    posteriorProbability: number;
    credibleInterval: [number, number];
    probabilityToBeatControl: number;
    expectedLoss: number;
}
export interface SampleSizeCalculation {
    requiredSampleSize: number;
    estimatedDuration: number;
    powerAchieved: number;
    minimumDetectableEffect: number;
}
export declare class StatisticalEngine {
    private confidenceLevel;
    private minimumPracticalEffect;
    constructor(confidenceLevel?: number, minimumPracticalEffect?: number);
    private calculatePrimaryMetricResults;
    controlVariant: VariantResults;
    metric: ExperimentMetric;
    StatisticalResults: any;
    ['primaryMetric']: any;
}
//# sourceMappingURL=StatisticalEngine.d.ts.map