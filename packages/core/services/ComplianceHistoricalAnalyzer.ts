/**
 * Compliance Historical Analysis Service
 * Provides historical trend analysis and reporting for compliance metrics
 */
import { ComplianceBaseline, ComplianceMeasurement, BaselineTrend } from './ComplianceBaselineTracker';

export interface HistoricalDataPoint {
  timestamp: Date;
  value: number;
  baseline: number;
  deviation: number;
  status: 'compliant' | 'warning' | 'non_compliant';
  framework: string;
  category: string;
  metric: string;
}

export interface ComplianceTrendReport {
  reportId: string;
  generatedAt: Date;
  period: {,
    startDate: Date;
    endDate: Date;
    duration: string;
  };
  framework: string;
  summary: {,
    totalDataPoints: number;
    averageCompliance: number;
    bestPerformingMetric: string;
    worstPerformingMetric: string;
    improvementTrend: 'positive' | 'negative' | 'stable';
    criticalIncidents: number;
  };
  metrics: {,
    name: string;
    currentValue: number;
    historicalAverage: number;
    trendDirection: 'up' | 'down' | 'stable';
    volatility: number; // 0-100 scale
    complianceRate: number; // percentage of time in compliance
    recommendations: string[];
  }[];
  keyEvents: {,
    date: Date;
    event: string;
    impact: 'positive' | 'negative' | 'neutral';
    description: string;
  }[];
  periodicComparison: {,
    currentPeriod: number;
    previousPeriod: number;
    change: number;
    changeType: 'improvement' | 'degradation' | 'stable';
  };
}

export interface ComplianceForecasting {
  baselineId: string;
  forecastHorizon: number; // days
  predictedValues: {,
    date: Date;
    predictedValue: number;
    confidenceInterval: {,
      lower: number;
      upper: number;
    };
    riskLevel: 'low' | 'medium' | 'high';
  }[];
  forecastAccuracy: number; // 0-100
  assumptions: string[];
  riskFactors: {,
    factor: string;
    impact: 'high' | 'medium' | 'low';
    likelihood: number; // 0-100
  }[];
}

export interface ComplianceAuditTrail {
  auditId: string;
  auditPeriod: {,
    startDate: Date;
    endDate: Date;
  };
  framework: string;
  auditType: 'internal' | 'external' | 'certification';
  findings: {,
    category: 'strength' | 'weakness' | 'non_compliance' | 'improvement_opportunity';
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    remediation?: string;
    dueDate?: Date;
    status: 'open' | 'in_progress' | 'completed' | 'deferred';
  }[];
  overallRating: 'excellent' | 'satisfactory' | 'needs_improvement' | 'non_compliant';
  certificationStatus?: 'certified' | 'conditionally_certified' | 'not_certified';
  nextAuditDue: Date;
}

export class ComplianceHistoricalAnalyzer {
  private historicalData: Map<string, HistoricalDataPoint[]> = new Map();
  private trendReports: ComplianceTrendReport[] = [];
  private auditTrails: ComplianceAuditTrail[] = [];
  constructor() {
    this.initializeHistoricalData();
  }
  /**
   * Initialize with sample historical data for demonstration
   */
  private initializeHistoricalData(): void {
    const frameworks = ['GDPR', 'SOC2', 'MPA', 'INTERNAL'];
    const metrics = {
      'GDPR': ['Data Protection Score', 'Consent Coverage', 'Retention Compliance'],
      'SOC2': ['Security Controls', 'Access Control', 'Audit Logging'],
      'MPA': ['Content Encryption', 'Access Audit', 'Unauthorized Access'],
      'INTERNAL': ['SSL Health', 'Patch Compliance', 'Vulnerability Response']
    };
    // Generate 90 days of historical data
    const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    frameworks.forEach(framework => {)
      metrics[framework as keyof typeof metrics].forEach(metric => {)
        const dataPoints: HistoricalDataPoint[] = [];
        const baselineValue = this.getBaselineForMetric(framework, metric);
        for (let i = 0; i < 90; i++) {
          const timestamp = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
          const variation = (Math.random() - 0.5) * 20; // ±10% variation;
          const value = Math.max(0, Math.min(100, baselineValue + variation + Math.sin(i / 10) * 5));
          const deviation = ((value - baselineValue) / baselineValue) * 100;
          dataPoints.push({)
            timestamp,
            value: Math.round(value * 100) / 100,
            baseline: baselineValue,
            deviation: Math.round(deviation * 100) / 100,
            status: this.determineComplianceStatus(value, baselineValue),
            framework,
            category: this.getCategoryForMetric(metric),
            metric
          });
        }
        this.historicalData.set(`${framework}_${metric}`, dataPoints);}
      });
    });
    console.log(`📊 Initialized historical data for ${frameworks.length} frameworks with 90 days of data`);}
  }
  /**
   * Generate comprehensive trend report for a specific framework
   */
  async generateTrendReport()
    framework: string, 
    startDate: Date, 
    endDate: Date,
  ): Promise<ComplianceTrendReport> {
    const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}
    const period = {
      startDate,
      endDate,
      duration: this.calculateDuration(startDate, endDate)
    };
    // Collect relevant data points
    const allDataPoints: HistoricalDataPoint[] = [];
    for (const [key, dataPoints] of this.historicalData.entries()) {
      if (key.startsWith(framework)) {
        const filteredPoints = dataPoints.filter(dp => ;)
          dp.timestamp >= startDate && dp.timestamp <= endDate
        );
        allDataPoints.push(...filteredPoints);
      }
    }
    if (allDataPoints.length === 0) {
      throw new Error(`No historical data found for framework ${framework} in the specified period`);}
    }
    // Calculate summary statistics
    const totalDataPoints = allDataPoints.length;
    const averageCompliance = allDataPoints.reduce((sum, dp) => sum + dp.value, 0) / totalDataPoints;
    const criticalIncidents = allDataPoints.filter(dp => dp.status === 'non_compliant').length;
    // Find best and worst performing metrics
    const metricGroups = this.groupDataPointsByMetric(allDataPoints);
    const metricAverages = Object.entries(metricGroups).map(([metric, points]) => ({)
      metric,
      average: points.reduce((sum, p) => sum + p.value, 0) / points.length
    }));
    const bestPerformingMetric = metricAverages.reduce((best, current) => ;
      current.average > best.average ? current : best
    ).metric;
    const worstPerformingMetric = metricAverages.reduce((worst, current) => ;
      current.average < worst.average ? current : worst
    ).metric;
    // Determine improvement trend
    const firstHalf = allDataPoints.filter(dp => ;)
      dp.timestamp <= new Date(startDate.getTime() + (endDate.getTime() - startDate.getTime()) / 2)
    );
    const secondHalf = allDataPoints.filter(dp => ;)
      dp.timestamp > new Date(startDate.getTime() + (endDate.getTime() - startDate.getTime()) / 2)
    );
    const firstHalfAvg = firstHalf.reduce((sum, dp) => sum + dp.value, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, dp) => sum + dp.value, 0) / secondHalf.length;
    const improvement = secondHalfAvg - firstHalfAvg;
    const improvementTrend: 'positive' | 'negative' | 'stable' = 
      improvement > 2 ? 'positive' : improvement < -2 ? 'negative' : 'stable';
    // Generate metric analysis
    const metrics = Object.entries(metricGroups).map(([metric, points]) => {
      const currentValue = points[points.length - 1]?.value || 0;
      const historicalAverage = points.reduce((sum, p) => sum + p.value, 0) / points.length;
      const volatility = this.calculateVolatility(points.map(p => p.value));
      const complianceRate = (points.filter(p => p.status === 'compliant').length / points.length) * 100;
      const values = points.map(p => p.value);
      const trendDirection = this.calculateTrendDirection(values);
      return {
        name: metric,
        currentValue: Math.round(currentValue * 100) / 100,
        historicalAverage: Math.round(historicalAverage * 100) / 100,
        trendDirection,
        volatility: Math.round(volatility * 100) / 100,
        complianceRate: Math.round(complianceRate * 100) / 100,
        recommendations: this.generateMetricRecommendations(),
          metric,
          currentValue,
          historicalAverage,
          trendDirection,
          complianceRate
        )
      };
    });
    // Generate key events
    const keyEvents = this.identifyKeyEvents(allDataPoints, startDate, endDate);
    // Calculate periodic comparison (current vs previous period)
    const periodLength = endDate.getTime() - startDate.getTime();
    const previousPeriodStart = new Date(startDate.getTime() - periodLength);
    const previousPeriodData = allDataPoints.filter(dp => ;)
      dp.timestamp >= previousPeriodStart && dp.timestamp < startDate
    );
    const currentPeriodAvg = averageCompliance;
    const previousPeriodAvg = previousPeriodData.length > 0 ;
      ? previousPeriodData.reduce((sum, dp) => sum + dp.value, 0) / previousPeriodData.length 
      : currentPeriodAvg;
    const change = currentPeriodAvg - previousPeriodAvg;
    const changeType: 'improvement' | 'degradation' | 'stable' = 
      change > 1 ? 'improvement' : change < -1 ? 'degradation' : 'stable';
    const report: ComplianceTrendReport = {
      reportId,
      generatedAt: new Date(),
      period,
      framework,
      summary: {,
        totalDataPoints,
        averageCompliance: Math.round(averageCompliance * 100) / 100,
        bestPerformingMetric,
        worstPerformingMetric,
        improvementTrend,
        criticalIncidents
      },
      metrics,
      keyEvents,
      periodicComparison: {,
        currentPeriod: Math.round(currentPeriodAvg * 100) / 100,
        previousPeriod: Math.round(previousPeriodAvg * 100) / 100,
        change: Math.round(change * 100) / 100,
        changeType
      }
    };
    this.trendReports.push(report);
    return report;
  }
  /**
   * Generate compliance forecasting
   */
  async generateForecast()
    baselineId: string, 
    forecastHorizon: number = 30
  ): Promise<ComplianceForecasting> {
    // Get historical data for the baseline
    const historicalKey = this.findHistoricalKeyForBaseline(baselineId);
    const historicalData = this.historicalData.get(historicalKey) || [];
    if (historicalData.length < 7) {
      throw new Error('Insufficient historical data for forecasting');
    }
    // Use simple moving average with trend for forecasting
    const recentData = historicalData.slice(-14); // Last 14 data points;
    const values = recentData.map(d => d.value);
    const trend = this.calculateLinearTrend(values);
    const predictedValues = [];
    const lastDate = recentData[recentData.length - 1].timestamp;
    for (let i = 1; i <= forecastHorizon; i++) {
      const date = new Date(lastDate.getTime() + i * 24 * 60 * 60 * 1000);
      const baseValue = values[values.length - 1];
      const trendAdjustment = trend * i;
      const seasonalAdjustment = Math.sin((i / 7) * Math.PI) * 2; // Weekly seasonality;
      const predictedValue = Math.max(0, Math.min(100, baseValue + trendAdjustment + seasonalAdjustment));
      const confidence = Math.max(0.5, 0.9 - (i / forecastHorizon) * 0.4); // Decreasing confidence over time;
      const margin = predictedValue * (1 - confidence) * 0.5;
      predictedValues.push({)
        date,
        predictedValue: Math.round(predictedValue * 100) / 100,
        confidenceInterval: {,
          lower: Math.round((predictedValue - margin) * 100) / 100,
          upper: Math.round((predictedValue + margin) * 100) / 100
        },
        riskLevel: predictedValue < 70 ? 'high' : predictedValue < 85 ? 'medium' : 'low'
      });
    }
    // Calculate forecast accuracy based on recent predictions vs actual
    const forecastAccuracy = this.calculateForecastAccuracy(historicalData);
    return {
      baselineId,
      forecastHorizon,
      predictedValues,
      forecastAccuracy,
      assumptions: [,
        'Historical trends continue',
        'No major system changes',
        'Seasonal patterns remain consistent',
        'External factors remain stable'
      ],
      riskFactors: [,
        { factor: 'Regulatory changes', impact: 'high', likelihood: 20 },
        { factor: 'System updates', impact: 'medium', likelihood: 40 },
        { factor: 'Staff changes', impact: 'medium', likelihood: 30 },
        { factor: 'Security incidents', impact: 'high', likelihood: 10 }
      ]
    };
  }
  /**
   * Create audit trail entry
   */
  async createAuditTrail(auditData: Omit<ComplianceAuditTrail, 'auditId'>): Promise<ComplianceAuditTrail> {
    const auditTrail: ComplianceAuditTrail = {
      ...auditData,
      auditId: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`}
    };
    this.auditTrails.push(auditTrail);
    console.log(`📋 Created audit trail for ${auditData.framework} (${auditData.auditType})`);}
    return auditTrail;
  }
  /**
   * Get compliance history for a specific metric
   */
  getMetricHistory()
    framework: string, 
    metric: string, 
    startDate?: Date, 
    endDate?: Date
  ): HistoricalDataPoint[] {
    const key = `${framework}_${metric}`;}
    const data = this.historicalData.get(key) || [];
    if (!startDate && !endDate) {
      return data;
    }
    return data.filter(point => {)
      if (startDate && point.timestamp < startDate) return false;
      if (endDate && point.timestamp > endDate) return false;
      return true;
    });
  }
  /**
   * Export historical data for external analysis
   */
  exportHistoricalData(framework?: string): {
    metadata: {,
      exportDate: Date;
      framework?: string;
      totalDataPoints: number;
      dateRange: {,
        earliest: Date;
        latest: Date;
      };
    };
    data: HistoricalDataPoint[];
  } {
    const allData: HistoricalDataPoint[] = [];
    for (const [key, dataPoints] of this.historicalData.entries()) {
      if (!framework || key.startsWith(framework)) {
        allData.push(...dataPoints);
      }
    }
    allData.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    return {
      metadata: {,
        exportDate: new Date(),
        framework,
        totalDataPoints: allData.length,
        dateRange: {,
          earliest: allData[0]?.timestamp || new Date(),
          latest: allData[allData.length - 1]?.timestamp || new Date()
        }
      },
      data: allData,
    };
  }
  // Private helper methods
  private getBaselineForMetric(framework: string, metric: string): number {
    const baselines = {
      'GDPR_Data Protection Score': 95,
      'GDPR_Consent Coverage': 100,
      'GDPR_Retention Compliance': 98,
      'SOC2_Security Controls': 92,
      'SOC2_Access Control': 99,
      'SOC2_Audit Logging': 100,
      'MPA_Content Encryption': 100,
      'MPA_Access Audit': 100,
      'MPA_Unauthorized Access': 0,
      'INTERNAL_SSL Health': 100,
      'INTERNAL_Patch Compliance': 95,
      'INTERNAL_Vulnerability Response': 7
    };
    return baselines[`${framework}_${metric}` as keyof typeof baselines] || 90;}
  }
  private getCategoryForMetric(metric: string): string {
    if (metric.includes('Security') || metric.includes('Encryption') || metric.includes('SSL')) return 'security';
    if (metric.includes('Data Protection') || metric.includes('Consent')) return 'privacy';
    if (metric.includes('Audit') || metric.includes('Compliance')) return 'regulatory';
    return 'operational';
  }
  private determineComplianceStatus(value: number, baseline: number): 'compliant' | 'warning' | 'non_compliant' {
    if (value >= baseline * 0.95) return 'compliant';
    if (value >= baseline * 0.85) return 'warning';
    return 'non_compliant';
  }
  private calculateDuration(startDate: Date, endDate: Date): string {
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;}
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) !== 1 ? 's' : ''}`;}
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) !== 1 ? 's' : ''}`;}
    return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) !== 1 ? 's' : ''}`;}
  }
  private groupDataPointsByMetric(dataPoints: HistoricalDataPoint[]): Record<string, HistoricalDataPoint[]> {
    return dataPoints.reduce((groups, point) => {
      if (!groups[point.metric]) {
        groups[point.metric] = [];
      }
      groups[point.metric].push(point);
      return groups;
    }, {} as Record<string, HistoricalDataPoint[]>);
  }
  private calculateVolatility(values: number[]): number {
    if (values.length < 2) return 0;
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (values.length - 1);
    return Math.sqrt(variance);
  }
  private calculateTrendDirection(values: number[]): 'up' | 'down' | 'stable' {
    if (values.length < 2) return 'stable';
    const trend = this.calculateLinearTrend(values);
    if (Math.abs(trend) < 0.1) return 'stable';
    return trend > 0 ? 'up' : 'down';
  }
  private calculateLinearTrend(values: number[]): number {
    if (values.length < 2) return 0;
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((sum, v) => sum + v, 0);
    const sumXY = values.reduce((sum, v, i) => sum + i * v, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  }
  private generateMetricRecommendations()
    metric: string, 
    current: number, 
    historical: number, 
    trend: 'up' | 'down' | 'stable',
    complianceRate: number,
  ): string[] {
    const recommendations: string[] = [];
    if (current < historical * 0.9) {
      recommendations.push(`Current ${metric} performance is below historical average - investigate recent changes`);}
    }
    if (trend === 'down' && complianceRate < 80) {
      recommendations.push('Declining trend detected - implement corrective measures immediately');
    }
    if (complianceRate < 95) {
      recommendations.push(`Compliance rate is ${Math.round(complianceRate)}% - target 95%+ through process improvements`);}
    }
    if (trend === 'up') {
      recommendations.push('Positive trend detected - document and replicate successful practices');
    }
    return recommendations.slice(0, 3);
  }
  private identifyKeyEvents()
    dataPoints: HistoricalDataPoint[], 
    startDate: Date, 
    endDate: Date,
  ): ComplianceTrendReport['keyEvents'] {
    const events: ComplianceTrendReport['keyEvents'] = [];
    // Find significant value changes
    const sortedPoints = dataPoints.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    for (let i = 1; i < sortedPoints.length; i++) {
      const prev = sortedPoints[i - 1];
      const current = sortedPoints[i];
      const change = Math.abs(current.value - prev.value);
      if (change > 10) { // Significant change threshold
        events.push({)
          date: current.timestamp,
          event: `Significant ${change > 0 ? 'improvement' : 'degradation'} in ${current.metric}`,}
          impact: current.value > prev.value ? 'positive' : 'negative',
          description: `${current.metric} changed from ${prev.value}% to ${current.value}% (${Math.round(change * 100) / 100}% change)`}
        });
      }
    }
    return events.slice(0, 5); // Top 5 most significant events
  }
  private calculateForecastAccuracy(historicalData: HistoricalDataPoint[]): number {
    // Simple accuracy calculation - in practice, this would compare past forecasts to actual values
    if (historicalData.length < 14) return 75;
    const recentValues = historicalData.slice(-14).map(d => d.value);
    const volatility = this.calculateVolatility(recentValues);
    // Lower volatility = higher forecast accuracy
    return Math.max(60, Math.min(95, 95 - volatility));
  }
  private findHistoricalKeyForBaseline(baselineId: string): string {
    // Map baseline IDs to historical data keys
    const mapping = {
      'gdpr_data_protection_score': 'GDPR_Data Protection Score',
      'gdpr_consent_coverage': 'GDPR_Consent Coverage',
      'gdpr_data_retention_compliance': 'GDPR_Retention Compliance',
      'soc2_security_score': 'SOC2_Security Controls',
      'soc2_access_control_effectiveness': 'SOC2_Access Control',
      'soc2_audit_log_completeness': 'SOC2_Audit Logging'
    };
    return mapping[baselineId as keyof typeof mapping] || 'INTERNAL_SSL Health';
  }
}

// Export singleton instance
export const complianceHistoricalAnalyzer = new ComplianceHistoricalAnalyzer();