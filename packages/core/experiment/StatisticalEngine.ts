/**
 * Epic 14 - A/B Testing Framework
 * Statistical Analysis Engine for experiment results
 */

import {
  ExperimentResults,
  VariantResults,
  MetricResult,
  StatisticalResults,
  ExperimentMetric,
  ExperimentInsight
} from '../types/experiment';

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
  estimatedDuration: number; // hours
  powerAchieved: number;
  minimumDetectableEffect: number;
}

export class StatisticalEngine {
  private confidenceLevel: number;
  private minimumPracticalEffect: number;

  constructor(confidenceLevel = 0.95, minimumPracticalEffect = 0.02) {
    this.confidenceLevel = confidenceLevel;
    this.minimumPracticalEffect = minimumPracticalEffect;
  }

  /**
   * Perform comprehensive statistical analysis of experiment results
   */
  analyzeExperimentResults(
    variants: VariantResults[],
    metrics: ExperimentMetric[],
    controlVariantId: string
  ): ExperimentResults {
    const controlVariant = variants.find(v => v.variantId === controlVariantId);
    if (!controlVariant) {
      throw new Error(`Control variant ${controlVariantId} not found`);
    }

    const primaryMetric = metrics.find(m => m.isPrimary);
    if (!primaryMetric) {
      throw new Error('No primary metric found');
    }

    // Calculate statistical results for primary metric
    const primaryResults = this.calculatePrimaryMetricResults(
      variants,
      controlVariant,
      primaryMetric
    );

    // Calculate guardrail metrics
    const guardrailResults = this.calculateGuardrailResults(
      variants,
      controlVariant,
      metrics.filter(m => m.isGuardrail)
    );

    // Generate insights
    const insights = this.generateInsights(variants, controlVariant, metrics);

    return {
      experimentId: '',
      calculatedAt: new Date(),
      variants,
      statistical: {
        primaryMetric: primaryResults,
        guardrailMetrics: guardrailResults
      },
      segments: [], // Would be populated from segment analysis
      insights
    };
  }

  /**
   * Calculate required sample size for an experiment
   */
  calculateSampleSize(
    baselineRate: number,
    minimumDetectableEffect: number,
    power = 0.8,
    alpha = 0.05,
    twoTailed = true
  ): SampleSizeCalculation {
    // For proportion tests (conversion rates)
    if (baselineRate > 0 && baselineRate < 1) {
      return this.calculateProportionSampleSize(
        baselineRate,
        minimumDetectableEffect,
        power,
        alpha,
        twoTailed
      );
    }

    // For continuous metrics (latency, cost)
    return this.calculateContinuousSampleSize(
      baselineRate, // mean
      minimumDetectableEffect,
      power,
      alpha,
      twoTailed
    );
  }

  /**
   * Perform t-test for continuous metrics
   */
  tTest(
    controlValues: number[],
    treatmentValues: number[],
    twoTailed = true
  ): StatisticalTestResult {
    const controlMean = this.mean(controlValues);
    const treatmentMean = this.mean(treatmentValues);
    const controlVar = this.variance(controlValues);
    const treatmentVar = this.variance(treatmentValues);

    const n1 = controlValues.length;
    const n2 = treatmentValues.length;

    // Welch's t-test (unequal variances)
    const pooledVar = controlVar / n1 + treatmentVar / n2;
    const testStatistic = (treatmentMean - controlMean) / Math.sqrt(pooledVar);

    // Degrees of freedom (Welch's formula)
    const df = Math.pow(pooledVar, 2) / 
      (Math.pow(controlVar / n1, 2) / (n1 - 1) + Math.pow(treatmentVar / n2, 2) / (n2 - 1));

    const pValue = this.calculateTTestPValue(testStatistic, df, twoTailed);
    const effect = treatmentMean - controlMean;
    const relativeEffect = controlMean !== 0 ? effect / controlMean : 0;
    const effectSize = effect / Math.sqrt((controlVar + treatmentVar) / 2); // Cohen's d

    const margin = this.getTStatistic(this.confidenceLevel, df) * Math.sqrt(pooledVar);
    const confidenceInterval: [number, number] = [effect - margin, effect + margin];

    return {
      pValue,
      testStatistic,
      effect: relativeEffect,
      effectSize,
      confidenceInterval,
      significant: pValue < (1 - this.confidenceLevel),
      practicallySignificant: Math.abs(relativeEffect) >= this.minimumPracticalEffect
    };
  }

  /**
   * Perform chi-square test for proportions
   */
  chiSquareTest(
    controlSuccesses: number,
    controlTotal: number,
    treatmentSuccesses: number,
    treatmentTotal: number
  ): StatisticalTestResult {
    const controlRate = controlSuccesses / controlTotal;
    const treatmentRate = treatmentSuccesses / treatmentTotal;

    // Chi-square test statistic
    const pooledRate = (controlSuccesses + treatmentSuccesses) / (controlTotal + treatmentTotal);
    const expectedControl = controlTotal * pooledRate;
    const expectedTreatment = treatmentTotal * pooledRate;

    const chiSquare = 
      Math.pow(controlSuccesses - expectedControl, 2) / expectedControl +
      Math.pow(controlTotal - controlSuccesses - (controlTotal - expectedControl), 2) / (controlTotal - expectedControl) +
      Math.pow(treatmentSuccesses - expectedTreatment, 2) / expectedTreatment +
      Math.pow(treatmentTotal - treatmentSuccesses - (treatmentTotal - expectedTreatment), 2) / (treatmentTotal - expectedTreatment);

    const pValue = this.calculateChiSquarePValue(chiSquare, 1);
    const effect = treatmentRate - controlRate;
    const relativeEffect = controlRate !== 0 ? effect / controlRate : 0;

    // Confidence interval for difference in proportions
    const se = Math.sqrt(
      (controlRate * (1 - controlRate)) / controlTotal +
      (treatmentRate * (1 - treatmentRate)) / treatmentTotal
    );
    const margin = this.getZStatistic(this.confidenceLevel) * se;
    const confidenceInterval: [number, number] = [effect - margin, effect + margin];

    return {
      pValue,
      testStatistic: chiSquare,
      effect: relativeEffect,
      effectSize: this.calculateCohensH(controlRate, treatmentRate),
      confidenceInterval,
      significant: pValue < (1 - this.confidenceLevel),
      practicallySignificant: Math.abs(relativeEffect) >= this.minimumPracticalEffect
    };
  }

  /**
   * Perform Bayesian analysis for conversion rates
   */
  bayesianAnalysis(
    controlSuccesses: number,
    controlTotal: number,
    treatmentSuccesses: number,
    treatmentTotal: number,
    priorAlpha = 1,
    priorBeta = 1
  ): BayesianResult {
    // Beta-Binomial model
    const controlPosteriorAlpha = priorAlpha + controlSuccesses;
    const controlPosteriorBeta = priorBeta + controlTotal - controlSuccesses;
    const treatmentPosteriorAlpha = priorAlpha + treatmentSuccesses;
    const treatmentPosteriorBeta = priorBeta + treatmentTotal - treatmentSuccesses;

    // Monte Carlo simulation for probability comparison
    const samples = 10000;
    let treatmentWins = 0;
    let lossSum = 0;

    for (let i = 0; i < samples; i++) {
      const controlSample = this.betaRandom(controlPosteriorAlpha, controlPosteriorBeta);
      const treatmentSample = this.betaRandom(treatmentPosteriorAlpha, treatmentPosteriorBeta);
      
      if (treatmentSample > controlSample) {
        treatmentWins++;
      }
      
      // Expected loss calculation
      if (controlSample > treatmentSample) {
        lossSum += controlSample - treatmentSample;
      }
    }

    const probabilityToBeatControl = treatmentWins / samples;
    const expectedLoss = lossSum / samples;

    // Credible interval for treatment rate
    const credibleInterval = this.betaCredibleInterval(
      treatmentPosteriorAlpha,
      treatmentPosteriorBeta,
      this.confidenceLevel
    );

    return {
      posteriorProbability: probabilityToBeatControl,
      credibleInterval,
      probabilityToBeatControl,
      expectedLoss
    };
  }

  /**
   * Detect winner based on statistical criteria
   */
  detectWinner(
    variants: VariantResults[],
    controlVariantId: string,
    metric: ExperimentMetric
  ): { winner?: string; confidence: number; reason: string } {
    const controlVariant = variants.find(v => v.variantId === controlVariantId);
    if (!controlVariant) {
      return { confidence: 0, reason: 'Control variant not found' };
    }

    let bestVariant = controlVariant;
    let bestResult: StatisticalTestResult | null = null;
    let maxConfidence = 0;

    for (const variant of variants) {
      if (variant.variantId === controlVariantId) continue;

      const metricResult = variant.metrics.find(m => m.metricId === metric.id);
      const controlMetricResult = controlVariant.metrics.find(m => m.metricId === metric.id);

      if (!metricResult || !controlMetricResult) continue;

      // Perform appropriate statistical test
      let result: StatisticalTestResult;
      if (metric.type === 'conversion') {
        // Use chi-square for conversion rates
        const treatmentSuccesses = Math.round(metricResult.value * variant.sampleSize);
        const controlSuccesses = Math.round(controlMetricResult.value * controlVariant.sampleSize);
        
        result = this.chiSquareTest(
          controlSuccesses,
          controlVariant.sampleSize,
          treatmentSuccesses,
          variant.sampleSize
        );
      } else {
        // Use t-test for continuous metrics
        // Note: This is simplified - in practice, you'd need raw data
        const treatmentValues = Array(variant.sampleSize).fill(metricResult.value);
        const controlValues = Array(controlVariant.sampleSize).fill(controlMetricResult.value);
        
        result = this.tTest(controlValues, treatmentValues);
      }

      // Check if this variant beats control
      const isImprovement = metric.expectedDirection === 'increase' 
        ? result.effect > 0 
        : result.effect < 0;

      if (result.significant && result.practicallySignificant && isImprovement) {
        const confidence = 1 - result.pValue;
        if (confidence > maxConfidence) {
          maxConfidence = confidence;
          bestVariant = variant;
          bestResult = result;
        }
      }
    }

    if (bestResult && bestVariant.variantId !== controlVariantId) {
      return {
        winner: bestVariant.variantId,
        confidence: maxConfidence,
        reason: `Statistically significant improvement with ${(maxConfidence * 100).toFixed(1)}% confidence`
      };
    }

    return {
      confidence: maxConfidence,
      reason: maxConfidence > 0 
        ? 'Improvements detected but not statistically significant'
        : 'No significant improvements detected'
    };
  }

  // Private helper methods

  private calculatePrimaryMetricResults(
    variants: VariantResults[],
    controlVariant: VariantResults,
    metric: ExperimentMetric
  ): StatisticalResults['primaryMetric'] {
    const winnerDetection = this.detectWinner(variants, controlVariant.variantId, metric);
    
    return {
      winningVariant: winnerDetection.winner,
      pValue: 1 - winnerDetection.confidence,
      statisticalSignificance: winnerDetection.confidence >= this.confidenceLevel,
      practicalSignificance: winnerDetection.winner !== undefined,
      confidenceLevel: this.confidenceLevel
    };
  }

  private calculateGuardrailResults(
    variants: VariantResults[],
    controlVariant: VariantResults,
    guardrailMetrics: ExperimentMetric[]
  ): StatisticalResults['guardrailMetrics'] {
    const results: StatisticalResults['guardrailMetrics'] = [];

    for (const metric of guardrailMetrics) {
      for (const variant of variants) {
        if (variant.variantId === controlVariant.variantId) continue;

        const metricResult = variant.metrics.find(m => m.metricId === metric.id);
        const controlMetricResult = controlVariant.metrics.find(m => m.metricId === metric.id);

        if (metricResult && controlMetricResult) {
          // Check if guardrail is violated
          const threshold = metric.minimumDetectableEffect || this.minimumPracticalEffect;
          const relativeChange = (metricResult.value - controlMetricResult.value) / controlMetricResult.value;
          
          const passed = metric.expectedDirection === 'increase' 
            ? relativeChange >= -threshold
            : relativeChange <= threshold;

          results.push({
            metricId: metric.id,
            passed,
            threshold,
            actualValue: relativeChange
          });
        }
      }
    }

    return results;
  }

  private generateInsights(
    variants: VariantResults[],
    controlVariant: VariantResults,
    metrics: ExperimentMetric[]
  ): ExperimentInsight[] {
    const insights: ExperimentInsight[] = [];

    // Check for winner
    const primaryMetric = metrics.find(m => m.isPrimary);
    if (primaryMetric) {
      const winnerDetection = this.detectWinner(variants, controlVariant.variantId, primaryMetric);
      if (winnerDetection.winner) {
        insights.push({
          type: 'winner_detected',
          title: 'Statistical Winner Detected',
          description: `Variant ${winnerDetection.winner} shows significant improvement`,
          severity: 'high',
          actionable: true,
          recommendations: [
            'Consider implementing the winning variant',
            'Monitor performance after rollout',
            'Document learnings for future experiments'
          ]
        });
      }
    }

    // Check for cost anomalies
    for (const variant of variants) {
      if (variant.totalCost && controlVariant.totalCost) {
        const costIncrease = (variant.totalCost - controlVariant.totalCost) / controlVariant.totalCost;
        if (costIncrease > 0.5) { // 50% cost increase
          insights.push({
            type: 'cost_anomaly',
            title: 'High Cost Increase Detected',
            description: `Variant ${variant.variantId} shows ${(costIncrease * 100).toFixed(1)}% cost increase`,
            severity: 'high',
            actionable: true,
            recommendations: [
              'Review cost-benefit ratio',
              'Consider optimizing variant configuration',
              'Monitor budget impact'
            ]
          });
        }
      }
    }

    // Check for performance degradation
    for (const variant of variants) {
      if (variant.averageLatency && controlVariant.averageLatency) {
        const latencyIncrease = (variant.averageLatency - controlVariant.averageLatency) / controlVariant.averageLatency;
        if (latencyIncrease > 0.2) { // 20% latency increase
          insights.push({
            type: 'performance_degradation',
            title: 'Performance Degradation Detected',
            description: `Variant ${variant.variantId} shows ${(latencyIncrease * 100).toFixed(1)}% latency increase`,
            severity: 'medium',
            actionable: true,
            recommendations: [
              'Investigate performance bottlenecks',
              'Consider performance optimizations',
              'Monitor user experience metrics'
            ]
          });
        }
      }
    }

    return insights;
  }

  private calculateProportionSampleSize(
    baselineRate: number,
    minimumDetectableEffect: number,
    power: number,
    alpha: number,
    twoTailed: boolean
  ): SampleSizeCalculation {
    const treatmentRate = baselineRate * (1 + minimumDetectableEffect);
    const pooledRate = (baselineRate + treatmentRate) / 2;
    
    const zAlpha = twoTailed ? this.getZStatistic(1 - alpha / 2) : this.getZStatistic(1 - alpha);
    const zBeta = this.getZStatistic(power);
    
    const numerator = Math.pow(zAlpha * Math.sqrt(2 * pooledRate * (1 - pooledRate)) + 
                             zBeta * Math.sqrt(baselineRate * (1 - baselineRate) + treatmentRate * (1 - treatmentRate)), 2);
    const denominator = Math.pow(treatmentRate - baselineRate, 2);
    
    const sampleSizePerGroup = numerator / denominator;
    
    return {
      requiredSampleSize: Math.ceil(sampleSizePerGroup * 2), // Total for both groups
      estimatedDuration: 24, // Placeholder - would depend on traffic
      powerAchieved: power,
      minimumDetectableEffect
    };
  }

  private calculateContinuousSampleSize(
    baselineMean: number,
    minimumDetectableEffect: number,
    power: number,
    alpha: number,
    twoTailed: boolean
  ): SampleSizeCalculation {
    // Simplified - assumes equal variances and standard deviation
    const effectSize = minimumDetectableEffect; // Cohen's d
    const zAlpha = twoTailed ? this.getZStatistic(1 - alpha / 2) : this.getZStatistic(1 - alpha);
    const zBeta = this.getZStatistic(power);
    
    const sampleSizePerGroup = Math.pow((zAlpha + zBeta) / effectSize, 2) * 2;
    
    return {
      requiredSampleSize: Math.ceil(sampleSizePerGroup * 2),
      estimatedDuration: 24,
      powerAchieved: power,
      minimumDetectableEffect
    };
  }

  // Statistical utility methods
  private mean(values: number[]): number {
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private variance(values: number[]): number {
    const avg = this.mean(values);
    return values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / (values.length - 1);
  }

  private calculateTTestPValue(tStat: number, df: number, twoTailed: boolean): number {
    // Simplified approximation - in practice, use proper t-distribution
    const pValue = 2 * (1 - this.normalCDF(Math.abs(tStat)));
    return twoTailed ? pValue : pValue / 2;
  }

  private calculateChiSquarePValue(chiSquare: number, df: number): number {
    // Simplified approximation for df=1
    return 2 * (1 - this.normalCDF(Math.sqrt(chiSquare)));
  }

  private normalCDF(x: number): number {
    // Approximation of standard normal CDF
    return 0.5 * (1 + this.erf(x / Math.sqrt(2)));
  }

  private erf(x: number): number {
    // Approximation of error function
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;

    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  }

  private getZStatistic(probability: number): number {
    // Approximate inverse normal CDF for common values
    if (probability >= 0.95) return 1.96;
    if (probability >= 0.90) return 1.645;
    if (probability >= 0.80) return 1.28;
    return 0;
  }

  private getTStatistic(probability: number, df: number): number {
    // Simplified - use z-statistic for large df
    if (df > 30) return this.getZStatistic(probability);
    // For small df, use approximation
    return this.getZStatistic(probability) * (1 + 1 / (4 * df));
  }

  private calculateCohensH(p1: number, p2: number): number {
    return 2 * (Math.asin(Math.sqrt(p1)) - Math.asin(Math.sqrt(p2)));
  }

  private betaRandom(alpha: number, beta: number): number {
    // Simplified beta random generation
    const gamma1 = this.gammaRandom(alpha);
    const gamma2 = this.gammaRandom(beta);
    return gamma1 / (gamma1 + gamma2);
  }

  private gammaRandom(shape: number): number {
    // Simplified gamma random generation (Marsaglia-Tsang method approximation)
    if (shape < 1) {
      return this.gammaRandom(shape + 1) * Math.pow(Math.random(), 1 / shape);
    }
    
    const d = shape - 1 / 3;
    const c = 1 / Math.sqrt(9 * d);
    
    while (true) {
      const x = this.normalRandom();
      const v = Math.pow(1 + c * x, 3);
      if (v > 0) {
        const u = Math.random();
        if (u < 1 - 0.0331 * Math.pow(x, 4) || 
            Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) {
          return d * v;
        }
      }
    }
  }

  private normalRandom(): number {
    // Box-Muller transform
    const u1 = Math.random();
    const u2 = Math.random();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }

  private betaCredibleInterval(alpha: number, beta: number, probability: number): [number, number] {
    // Simplified beta quantile approximation
    const mean = alpha / (alpha + beta);
    const variance = (alpha * beta) / (Math.pow(alpha + beta, 2) * (alpha + beta + 1));
    const stdDev = Math.sqrt(variance);
    
    const margin = this.getZStatistic(probability) * stdDev;
    return [
      Math.max(0, mean - margin),
      Math.min(1, mean + margin)
    ];
  }
}