/**
 * Performance Regression Detection System
 * Epic 18 - Technical Debt & Refactoring
 * Task: E18-1753114562342-A89910 - Add performance testing
 *
 * Automated performance regression detection that:
 * - Tracks performance metrics over time
 * - Detects statistical anomalies and regressions
 * - Provides automated alerts and recommendations
 * - Integrates with CI/CD pipelines
 */

import { promises as fs } from 'fs';
import path from 'path';

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: string;
  context: {
    environment: string;
    version: string;
    commit: string;
    branch: string;
  };
}

export interface PerformanceBaseline {
  metric: string;
  mean: number;
  standardDeviation: number;
  min: number;
  max: number;
  sampleCount: number;
  lastUpdated: string;
  thresholds: {
    warning: number; // % deviation from baseline
    critical: number; // % deviation from baseline
  };
}

export interface RegressionDetectionResult {
  metric: string;
  currentValue: number;
  baselineValue: number;
  deviationPercent: number;
  severity: 'ok' | 'warning' | 'critical';
  isRegression: boolean;
  trend: 'improving' | 'stable' | 'degrading';
  recommendation?: string;
}

export interface RegressionReport {
  timestamp: string;
  environment: string;
  version: string;
  commit: string;
  summary: {
    totalMetrics: number;
    regressions: number;
    warnings: number;
    improvements: number;
  };
  results: RegressionDetectionResult[];
  recommendations: string[];
}

export class PerformanceRegressionDetector {
  private dataDir: string;
  private baselinesFile: string;
  private metricsFile: string;
  private reportsDir: string;

  constructor(dataDir: string = './performance-data') {
    this.dataDir = dataDir;
    this.baselinesFile = path.join(dataDir, 'baselines.json');
    this.metricsFile = path.join(dataDir, 'metrics.json');
    this.reportsDir = path.join(dataDir, 'regression-reports');
  }

  /**
   * Record performance metric
   */
  async recordMetric(metric: PerformanceMetric): Promise<void> {
    await this.ensureDataDirectories();

    const metrics = await this.loadMetrics();
    metrics.push(metric);

    // Keep only last 1000 metrics to prevent unbounded growth
    if (metrics.length > 1000) {
      metrics.splice(0, metrics.length - 1000);
    }

    await fs.writeFile(this.metricsFile, JSON.stringify(metrics, null, 2));
  }

  /**
   * Record multiple performance metrics
   */
  async recordMetrics(metrics: PerformanceMetric[]): Promise<void> {
    for (const metric of metrics) {
      await this.recordMetric(metric);
    }
  }

  /**
   * Update baseline for a metric
   */
  async updateBaseline(
    metricName: string,
    forceRecalculation: boolean = false
  ): Promise<void> {
    const metrics = await this.loadMetrics();
    const metricValues = metrics
      .filter(m => m.name === metricName)
      .map(m => m.value)
      .slice(-100); // Use last 100 values for baseline

    if (metricValues.length < 10) {
      console.warn(
        `Insufficient data points for baseline calculation: ${metricValues.length} < 10`
      );
      return;
    }

    const baselines = await this.loadBaselines();
    const existingBaseline = baselines.find(b => b.metric === metricName);

    if (existingBaseline && !forceRecalculation) {
      // Update existing baseline incrementally
      const newMean = this.calculateMean(metricValues);
      const newStdDev = this.calculateStandardDeviation(metricValues, newMean);

      existingBaseline.mean = (existingBaseline.mean + newMean) / 2;
      existingBaseline.standardDeviation =
        (existingBaseline.standardDeviation + newStdDev) / 2;
      existingBaseline.min = Math.min(existingBaseline.min, ...metricValues);
      existingBaseline.max = Math.max(existingBaseline.max, ...metricValues);
      existingBaseline.sampleCount += metricValues.length;
      existingBaseline.lastUpdated = new Date().toISOString();
    } else {
      // Create new baseline or force recalculation
      const mean = this.calculateMean(metricValues);
      const stdDev = this.calculateStandardDeviation(metricValues, mean);

      const newBaseline: PerformanceBaseline = {
        metric: metricName,
        mean,
        standardDeviation: stdDev,
        min: Math.min(...metricValues),
        max: Math.max(...metricValues),
        sampleCount: metricValues.length,
        lastUpdated: new Date().toISOString(),
        thresholds: {
          warning: 15, // 15% deviation triggers warning
          critical: 30 // 30% deviation triggers critical alert
        }
      };

      if (existingBaseline) {
        Object.assign(existingBaseline, newBaseline);
      } else {
        baselines.push(newBaseline);
      }
    }

    await this.saveBaselines(baselines);
  }

  /**
   * Detect regressions in recent performance metrics
   */
  async detectRegressions(
    environment: string = 'development',
    lookbackHours: number = 24
  ): Promise<RegressionReport> {
    const metrics = await this.loadMetrics();
    const baselines = await this.loadBaselines();

    const cutoffTime = new Date(Date.now() - lookbackHours * 60 * 60 * 1000);
    const recentMetrics = metrics.filter(
      m => new Date(m.timestamp) > cutoffTime
    );

    if (recentMetrics.length === 0) {
      throw new Error('No recent metrics found for regression detection');
    }

    const latestMetric = recentMetrics[recentMetrics.length - 1];
    const results: RegressionDetectionResult[] = [];

    // Group metrics by name and analyze each
    const metricGroups = this.groupMetricsByName(recentMetrics);

    for (const [metricName, metricList] of metricGroups.entries()) {
      const baseline = baselines.find(b => b.metric === metricName);

      if (!baseline) {
        console.warn(`No baseline found for metric: ${metricName}`);
        continue;
      }

      const currentValue = metricList[metricList.length - 1].value;
      const trend = this.calculateTrend(metricList.slice(-10)); // Last 10 values

      const result = this.analyzeMetricRegression(
        metricName,
        currentValue,
        baseline,
        trend
      );

      results.push(result);
    }

    const report: RegressionReport = {
      timestamp: new Date().toISOString(),
      environment,
      version: latestMetric.context.version,
      commit: latestMetric.context.commit,
      summary: {
        totalMetrics: results.length,
        regressions: results.filter(r => r.isRegression).length,
        warnings: results.filter(r => r.severity === 'warning').length,
        improvements: results.filter(r => r.deviationPercent < -5).length // 5% improvement
      },
      results,
      recommendations: this.generateRecommendations(results)
    };

    await this.saveRegressionReport(report);
    return report;
  }

  /**
   * Analyze a single metric for regression
   */
  private analyzeMetricRegression(
    metricName: string,
    currentValue: number,
    baseline: PerformanceBaseline,
    trend: 'improving' | 'stable' | 'degrading'
  ): RegressionDetectionResult {
    const deviationPercent =
      ((currentValue - baseline.mean) / baseline.mean) * 100;

    let severity: 'ok' | 'warning' | 'critical' = 'ok';
    let isRegression = false;

    if (Math.abs(deviationPercent) >= baseline.thresholds.critical) {
      severity = 'critical';
      isRegression = deviationPercent > 0; // Assuming higher values are worse
    } else if (Math.abs(deviationPercent) >= baseline.thresholds.warning) {
      severity = 'warning';
      isRegression = deviationPercent > 0;
    }

    const result: RegressionDetectionResult = {
      metric: metricName,
      currentValue,
      baselineValue: baseline.mean,
      deviationPercent,
      severity,
      isRegression,
      trend
    };

    if (isRegression) {
      result.recommendation = this.generateMetricRecommendation(
        metricName,
        deviationPercent
      );
    }

    return result;
  }

  /**
   * Generate recommendations based on regression results
   */
  private generateRecommendations(
    results: RegressionDetectionResult[]
  ): string[] {
    const recommendations: string[] = [];

    const criticalRegressions = results.filter(
      r => r.severity === 'critical' && r.isRegression
    );
    const warningRegressions = results.filter(
      r => r.severity === 'warning' && r.isRegression
    );

    if (criticalRegressions.length > 0) {
      recommendations.push(
        `🚨 CRITICAL: ${criticalRegressions.length} critical performance regressions detected`,
        'Immediate investigation required before deployment',
        'Consider reverting recent changes or implementing optimizations'
      );
    }

    if (warningRegressions.length > 0) {
      recommendations.push(
        `⚠️ WARNING: ${warningRegressions.length} performance warnings detected`,
        'Monitor closely and consider optimization opportunities'
      );
    }

    if (criticalRegressions.length === 0 && warningRegressions.length === 0) {
      recommendations.push(
        '✅ No significant performance regressions detected',
        'Performance is within acceptable thresholds'
      );
    }

    // Add specific metric recommendations
    const responseTimeRegression = results.find(
      r => r.metric.includes('response') && r.isRegression
    );
    if (responseTimeRegression) {
      recommendations.push(
        'Response time regression detected - check database queries and caching',
        'Profile API endpoints for bottlenecks'
      );
    }

    const memoryRegression = results.find(
      r => r.metric.includes('memory') && r.isRegression
    );
    if (memoryRegression) {
      recommendations.push(
        'Memory usage regression detected - check for memory leaks',
        'Review recent code changes for inefficient data structures'
      );
    }

    return recommendations;
  }

  /**
   * Generate metric-specific recommendation
   */
  private generateMetricRecommendation(
    metricName: string,
    deviationPercent: number
  ): string {
    const metricType = metricName.toLowerCase();

    if (metricType.includes('response') || metricType.includes('latency')) {
      return `Response time increased by ${deviationPercent.toFixed(1)}%. Check database queries, caching, and API optimizations.`;
    }

    if (metricType.includes('memory')) {
      return `Memory usage increased by ${deviationPercent.toFixed(1)}%. Investigate potential memory leaks and optimize data structures.`;
    }

    if (metricType.includes('cpu')) {
      return `CPU usage increased by ${deviationPercent.toFixed(1)}%. Profile code for algorithmic inefficiencies and optimization opportunities.`;
    }

    if (metricType.includes('throughput')) {
      return `Throughput decreased by ${Math.abs(deviationPercent).toFixed(1)}%. Check for bottlenecks in request processing pipeline.`;
    }

    return `Metric ${metricName} deviated by ${deviationPercent.toFixed(1)}% from baseline. Investigation recommended.`;
  }

  /**
   * Calculate trend from recent values
   */
  private calculateTrend(
    values: PerformanceMetric[]
  ): 'improving' | 'stable' | 'degrading' {
    if (values.length < 3) return 'stable';

    const numericValues = values.map(v => v.value);
    const firstHalf = numericValues.slice(
      0,
      Math.floor(numericValues.length / 2)
    );
    const secondHalf = numericValues.slice(
      Math.floor(numericValues.length / 2)
    );

    const firstAvg = this.calculateMean(firstHalf);
    const secondAvg = this.calculateMean(secondHalf);

    const changePercent = ((secondAvg - firstAvg) / firstAvg) * 100;

    if (changePercent < -5) return 'improving'; // Assuming lower is better for most metrics
    if (changePercent > 5) return 'degrading';
    return 'stable';
  }

  /**
   * Group metrics by name
   */
  private groupMetricsByName(
    metrics: PerformanceMetric[]
  ): Map<string, PerformanceMetric[]> {
    const groups = new Map<string, PerformanceMetric[]>();

    for (const metric of metrics) {
      if (!groups.has(metric.name)) {
        groups.set(metric.name, []);
      }
      groups.get(metric.name)!.push(metric);
    }

    return groups;
  }

  /**
   * Calculate mean of numeric values
   */
  private calculateMean(values: number[]): number {
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  /**
   * Calculate standard deviation
   */
  private calculateStandardDeviation(values: number[], mean: number): number {
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const avgSquaredDiff = this.calculateMean(squaredDiffs);
    return Math.sqrt(avgSquaredDiff);
  }

  /**
   * Load metrics from file
   */
  private async loadMetrics(): Promise<PerformanceMetric[]> {
    try {
      const data = await fs.readFile(this.metricsFile, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  /**
   * Load baselines from file
   */
  private async loadBaselines(): Promise<PerformanceBaseline[]> {
    try {
      const data = await fs.readFile(this.baselinesFile, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  /**
   * Save baselines to file
   */
  private async saveBaselines(baselines: PerformanceBaseline[]): Promise<void> {
    await fs.writeFile(this.baselinesFile, JSON.stringify(baselines, null, 2));
  }

  /**
   * Save regression report
   */
  private async saveRegressionReport(report: RegressionReport): Promise<void> {
    await this.ensureDataDirectories();

    const timestamp = report.timestamp.replace(/[:.]/g, '-');
    const filename = `regression-report-${timestamp}.json`;
    const filepath = path.join(this.reportsDir, filename);

    await fs.writeFile(filepath, JSON.stringify(report, null, 2));
    console.log(`📊 Regression report saved: ${filepath}`);
  }

  /**
   * Ensure data directories exist
   */
  private async ensureDataDirectories(): Promise<void> {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
      await fs.mkdir(this.reportsDir, { recursive: true });
    } catch (error) {
      console.warn('Warning: Failed to create data directories:', error);
    }
  }

  /**
   * Get regression summary for recent period
   */
  async getRegressionSummary(hours: number = 24): Promise<{
    hasRegressions: boolean;
    criticalCount: number;
    warningCount: number;
    summary: string;
  }> {
    try {
      const report = await this.detectRegressions('development', hours);

      return {
        hasRegressions: report.summary.regressions > 0,
        criticalCount: report.results.filter(r => r.severity === 'critical')
          .length,
        warningCount: report.results.filter(r => r.severity === 'warning')
          .length,
        summary:
          report.summary.regressions > 0
            ? `${report.summary.regressions} regressions detected`
            : 'No regressions detected'
      };
    } catch (error) {
      return {
        hasRegressions: false,
        criticalCount: 0,
        warningCount: 0,
        summary: 'Unable to detect regressions: ' + error.message
      };
    }
  }
}

export default PerformanceRegressionDetector;
