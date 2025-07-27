/**
 * Epic 14 - A/B Testing Framework
 * Statistical Analysis Engine for experiment results
 */
import { ExperimentResults, VariantResults, ExperimentMetric } from '../types/experiment';
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
    /**
     * Perform comprehensive statistical analysis of experiment results
     */
    analyzeExperimentResults(variants: VariantResults[], metrics: ExperimentMetric[], controlVariantId: string): ExperimentResults;
    /**
     * Calculate required sample size for an experiment
     */
    calculateSampleSize(baselineRate: number, minimumDetectableEffect: number, power?: number, alpha?: number, twoTailed?: boolean): SampleSizeCalculation;
    /**
     * Perform t-test for continuous metrics
     */
    tTest(controlValues: number[], treatmentValues: number[], twoTailed?: boolean): StatisticalTestResult;
    /**
     * Perform chi-square test for proportions
     */
    chiSquareTest(controlSuccesses: number, controlTotal: number, treatmentSuccesses: number, treatmentTotal: number): StatisticalTestResult;
    /**
     * Perform Bayesian analysis for conversion rates
     */
    bayesianAnalysis(controlSuccesses: number, controlTotal: number, treatmentSuccesses: number, treatmentTotal: number, priorAlpha?: number, priorBeta?: number): BayesianResult;
    /**
     * Detect winner based on statistical criteria
     */
    detectWinner(variants: VariantResults[], controlVariantId: string, metric: ExperimentMetric): {
        winner?: string;
        confidence: number;
        reason: string;
    };
    private calculatePrimaryMetricResults;
    private calculateGuardrailResults;
    private generateInsights;
    private calculateProportionSampleSize;
    private calculateContinuousSampleSize;
    private mean;
    private variance;
    private calculateTTestPValue;
    private calculateChiSquarePValue;
    private normalCDF;
    private erf;
    private getZStatistic;
    private getTStatistic;
    private calculateCohensH;
    private betaRandom;
    private gammaRandom;
    private normalRandom;
    private betaCredibleInterval;
}
//# sourceMappingURL=StatisticalEngine.d.ts.map