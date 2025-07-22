/**
 * Compliance Baseline Tracking Service
 * Tracks and analyzes compliance metrics against established baselines
 * for GDPR, SOC2, MPA, and internal security standards
 */

export interface ComplianceBaseline {
  id: string;
  framework: 'GDPR' | 'CCPA' | 'SOC2' | 'ISO27001' | 'MPA' | 'INTERNAL';
  category: 'security' | 'privacy' | 'regulatory' | 'operational';
  name: string;
  description: string;
  targetValue: number; // 0-100
  toleranceThreshold: number; // acceptable deviation percentage
  measurementUnit: 'percentage' | 'count' | 'time' | 'score';
  measurementFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  baselineEstablishedAt: Date;
  lastUpdatedAt: Date;
  isActive: boolean;
}

export interface ComplianceMeasurement {
  id: string;
  baselineId: string;
  actualValue: number;
  targetValue: number;
  deviation: number; // percentage deviation from baseline
  status: 'above_baseline' | 'at_baseline' | 'below_baseline' | 'critical_deviation';
  measuredAt: Date;
  context?: Record<string, any>;
  notes?: string;
}

export interface BaselineTrend {
  baselineId: string;
  framework: string;
  category: string;
  name: string;
  measurements: ComplianceMeasurement[];
  trendDirection: 'improving' | 'stable' | 'declining' | 'critical';
  averageDeviation: number;
  consistencyScore: number; // 0-100, how consistent measurements are
  lastMeasurement: ComplianceMeasurement;
  recommendedActions: string[];
}

export interface BaselineDashboard {
  overallHealthScore: number; // 0-100
  frameworkHealth: Record<string, {
    score: number;
    status: 'healthy' | 'warning' | 'critical';
    baselinesTracked: number;
    baselinesMet: number;
    criticalDeviations: number;
  }>;
  recentDeviations: ComplianceMeasurement[];
  trendAnalysis: BaselineTrend[];
  improvementOpportunities: {
    baselineId: string;
    name: string;
    currentGap: number;
    potentialImpact: string;
    difficulty: 'low' | 'medium' | 'high';
    estimatedTimeframe: string;
  }[];
  alerts: {
    id: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    baselineId: string;
    triggeredAt: Date;
    acknowledged: boolean;
  }[];
}

export class ComplianceBaselineTracker {
  private baselines: Map<string, ComplianceBaseline> = new Map();
  private measurements: ComplianceMeasurement[] = [];
  private alerts: any[] = [];
  
  constructor() {
    this.initializeBaselines();
  }

  /**
   * Initialize default compliance baselines
   */
  private initializeBaselines(): void {
    const defaultBaselines: ComplianceBaseline[] = [
      // GDPR Baselines
      {
        id: 'gdpr_data_protection_score',
        framework: 'GDPR',
        category: 'privacy',
        name: 'Data Protection Compliance Score',
        description: 'Overall GDPR data protection compliance percentage',
        targetValue: 95,
        toleranceThreshold: 5, // 90-100% acceptable
        measurementUnit: 'percentage',
        measurementFrequency: 'daily',
        baselineEstablishedAt: new Date('2025-01-01'),
        lastUpdatedAt: new Date(),
        isActive: true
      },
      {
        id: 'gdpr_consent_coverage',
        framework: 'GDPR',
        category: 'privacy',
        name: 'User Consent Coverage',
        description: 'Percentage of user data processing activities with valid consent',
        targetValue: 100,
        toleranceThreshold: 2, // 98-100% acceptable
        measurementUnit: 'percentage',
        measurementFrequency: 'realtime',
        baselineEstablishedAt: new Date('2025-01-01'),
        lastUpdatedAt: new Date(),
        isActive: true
      },
      {
        id: 'gdpr_data_retention_compliance',
        framework: 'GDPR',
        category: 'privacy',
        name: 'Data Retention Policy Compliance',
        description: 'Percentage of data adhering to retention policies',
        targetValue: 98,
        toleranceThreshold: 3,
        measurementUnit: 'percentage',
        measurementFrequency: 'daily',
        baselineEstablishedAt: new Date('2025-01-01'),
        lastUpdatedAt: new Date(),
        isActive: true
      },
      {
        id: 'gdpr_breach_response_time',
        framework: 'GDPR',
        category: 'regulatory',
        name: 'Data Breach Response Time',
        description: 'Average time to detect and respond to data breaches (hours)',
        targetValue: 24, // Within 24 hours for GDPR compliance
        toleranceThreshold: 20, // Up to 29 hours acceptable
        measurementUnit: 'time',
        measurementFrequency: 'realtime',
        baselineEstablishedAt: new Date('2025-01-01'),
        lastUpdatedAt: new Date(),
        isActive: true
      },

      // SOC 2 Baselines
      {
        id: 'soc2_security_score',
        framework: 'SOC2',
        category: 'security',
        name: 'SOC 2 Security Controls Score',
        description: 'Overall SOC 2 security controls compliance percentage',
        targetValue: 92,
        toleranceThreshold: 5,
        measurementUnit: 'percentage',
        measurementFrequency: 'daily',
        baselineEstablishedAt: new Date('2025-01-01'),
        lastUpdatedAt: new Date(),
        isActive: true
      },
      {
        id: 'soc2_access_control_effectiveness',
        framework: 'SOC2',
        category: 'security',
        name: 'Access Control Effectiveness',
        description: 'Percentage of access requests properly validated and logged',
        targetValue: 99,
        toleranceThreshold: 1,
        measurementUnit: 'percentage',
        measurementFrequency: 'hourly',
        baselineEstablishedAt: new Date('2025-01-01'),
        lastUpdatedAt: new Date(),
        isActive: true
      },
      {
        id: 'soc2_audit_log_completeness',
        framework: 'SOC2',
        category: 'security',
        name: 'Audit Log Completeness',
        description: 'Percentage of security events properly logged and retained',
        targetValue: 100,
        toleranceThreshold: 1,
        measurementUnit: 'percentage',
        measurementFrequency: 'hourly',
        baselineEstablishedAt: new Date('2025-01-01'),
        lastUpdatedAt: new Date(),
        isActive: true
      },
      {
        id: 'soc2_incident_response_time',
        framework: 'SOC2',
        category: 'operational',
        name: 'Security Incident Response Time',
        description: 'Average time to respond to security incidents (minutes)',
        targetValue: 30,
        toleranceThreshold: 33, // Up to 40 minutes acceptable
        measurementUnit: 'time',
        measurementFrequency: 'realtime',
        baselineEstablishedAt: new Date('2025-01-01'),
        lastUpdatedAt: new Date(),
        isActive: true
      },

      // MPA Content Security Baselines
      {
        id: 'mpa_content_encryption_rate',
        framework: 'MPA',
        category: 'security',
        name: 'Pre-Release Content Encryption Rate',
        description: 'Percentage of pre-release content properly encrypted',
        targetValue: 100,
        toleranceThreshold: 0, // Zero tolerance for unencrypted pre-release content
        measurementUnit: 'percentage',
        measurementFrequency: 'realtime',
        baselineEstablishedAt: new Date('2025-01-01'),
        lastUpdatedAt: new Date(),
        isActive: true
      },
      {
        id: 'mpa_access_audit_coverage',
        framework: 'MPA',
        category: 'security',
        name: 'Content Access Audit Coverage',
        description: 'Percentage of content access events with complete audit trails',
        targetValue: 100,
        toleranceThreshold: 1,
        measurementUnit: 'percentage',
        measurementFrequency: 'hourly',
        baselineEstablishedAt: new Date('2025-01-01'),
        lastUpdatedAt: new Date(),
        isActive: true
      },
      {
        id: 'mpa_unauthorized_access_incidents',
        framework: 'MPA',
        category: 'security',
        name: 'Unauthorized Content Access Incidents',
        description: 'Number of unauthorized access attempts per month',
        targetValue: 0,
        toleranceThreshold: 200, // Up to 2 incidents per month acceptable
        measurementUnit: 'count',
        measurementFrequency: 'daily',
        baselineEstablishedAt: new Date('2025-01-01'),
        lastUpdatedAt: new Date(),
        isActive: true
      },

      // Internal Security Baselines
      {
        id: 'internal_ssl_certificate_health',
        framework: 'INTERNAL',
        category: 'security',
        name: 'SSL Certificate Health Score',
        description: 'Percentage of SSL certificates valid and not expiring soon',
        targetValue: 100,
        toleranceThreshold: 5,
        measurementUnit: 'percentage',
        measurementFrequency: 'daily',
        baselineEstablishedAt: new Date('2025-01-01'),
        lastUpdatedAt: new Date(),
        isActive: true
      },
      {
        id: 'internal_security_patch_compliance',
        framework: 'INTERNAL',
        category: 'security',
        name: 'Security Patch Compliance',
        description: 'Percentage of systems with latest security patches applied',
        targetValue: 95,
        toleranceThreshold: 5,
        measurementUnit: 'percentage',
        measurementFrequency: 'daily',
        baselineEstablishedAt: new Date('2025-01-01'),
        lastUpdatedAt: new Date(),
        isActive: true
      },
      {
        id: 'internal_vulnerability_remediation_time',
        framework: 'INTERNAL',
        category: 'operational',
        name: 'Vulnerability Remediation Time',
        description: 'Average time to remediate critical vulnerabilities (days)',
        targetValue: 7,
        toleranceThreshold: 43, // Up to 10 days acceptable
        measurementUnit: 'time',
        measurementFrequency: 'daily',
        baselineEstablishedAt: new Date('2025-01-01'),
        lastUpdatedAt: new Date(),
        isActive: true
      }
    ];

    defaultBaselines.forEach(baseline => {
      this.baselines.set(baseline.id, baseline);
    });

    console.log(`✅ Initialized ${defaultBaselines.length} compliance baselines`);
  }

  /**
   * Record a new measurement against a baseline
   */
  async recordMeasurement(
    baselineId: string,
    actualValue: number,
    context?: Record<string, any>,
    notes?: string
  ): Promise<ComplianceMeasurement> {
    const baseline = this.baselines.get(baselineId);
    if (!baseline) {
      throw new Error(`Baseline not found: ${baselineId}`);
    }

    const deviation = this.calculateDeviation(actualValue, baseline.targetValue);
    const status = this.determineStatus(deviation, baseline.toleranceThreshold);

    const measurement: ComplianceMeasurement = {
      id: `measurement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      baselineId,
      actualValue,
      targetValue: baseline.targetValue,
      deviation,
      status,
      measuredAt: new Date(),
      context,
      notes
    };

    this.measurements.push(measurement);

    // Check for alerts
    if (status === 'critical_deviation') {
      await this.createAlert({
        severity: 'critical',
        message: `Critical deviation detected for ${baseline.name}: ${actualValue}${this.getUnitSymbol(baseline.measurementUnit)} (target: ${baseline.targetValue}${this.getUnitSymbol(baseline.measurementUnit)})`,
        baselineId,
        measurement
      });
    } else if (status === 'below_baseline' && Math.abs(deviation) > baseline.toleranceThreshold / 2) {
      await this.createAlert({
        severity: 'medium',
        message: `Below baseline performance for ${baseline.name}: ${actualValue}${this.getUnitSymbol(baseline.measurementUnit)} (target: ${baseline.targetValue}${this.getUnitSymbol(baseline.measurementUnit)})`,
        baselineId,
        measurement
      });
    }

    console.log(`📊 Recorded measurement for ${baseline.name}: ${actualValue}${this.getUnitSymbol(baseline.measurementUnit)} (${status})`);
    return measurement;
  }

  /**
   * Get baseline trend analysis
   */
  getBaselineTrend(baselineId: string, daysPeriod: number = 30): BaselineTrend | null {
    const baseline = this.baselines.get(baselineId);
    if (!baseline) {
      return null;
    }

    const cutoffDate = new Date(Date.now() - daysPeriod * 24 * 60 * 60 * 1000);
    const measurements = this.measurements
      .filter(m => m.baselineId === baselineId && m.measuredAt >= cutoffDate)
      .sort((a, b) => a.measuredAt.getTime() - b.measuredAt.getTime());

    if (measurements.length === 0) {
      return null;
    }

    const averageDeviation = measurements.reduce((sum, m) => sum + Math.abs(m.deviation), 0) / measurements.length;
    const consistencyScore = this.calculateConsistencyScore(measurements);
    const trendDirection = this.analyzeTrendDirection(measurements);
    const recommendedActions = this.generateRecommendations(baseline, measurements, trendDirection);

    return {
      baselineId,
      framework: baseline.framework,
      category: baseline.category,
      name: baseline.name,
      measurements,
      trendDirection,
      averageDeviation,
      consistencyScore,
      lastMeasurement: measurements[measurements.length - 1],
      recommendedActions
    };
  }

  /**
   * Generate comprehensive baseline dashboard
   */
  async generateDashboard(): Promise<BaselineDashboard> {
    const frameworkHealth: Record<string, any> = {};
    const trendAnalysis: BaselineTrend[] = [];
    const recentDeviations: ComplianceMeasurement[] = [];

    // Calculate framework health scores
    const frameworks = ['GDPR', 'SOC2', 'MPA', 'INTERNAL'];
    for (const framework of frameworks) {
      const frameworkBaselines = Array.from(this.baselines.values())
        .filter(b => b.framework === framework && b.isActive);

      let totalScore = 0;
      let baselinesMet = 0;
      let criticalDeviations = 0;

      for (const baseline of frameworkBaselines) {
        const trend = this.getBaselineTrend(baseline.id, 7); // Last 7 days
        if (trend && trend.lastMeasurement) {
          const score = Math.max(0, 100 - Math.abs(trend.lastMeasurement.deviation));
          totalScore += score;

          if (trend.lastMeasurement.status === 'at_baseline' || trend.lastMeasurement.status === 'above_baseline') {
            baselinesMet++;
          }

          if (trend.lastMeasurement.status === 'critical_deviation') {
            criticalDeviations++;
          }

          // Add to trend analysis
          trendAnalysis.push(trend);

          // Collect recent deviations
          if (Math.abs(trend.lastMeasurement.deviation) > baseline.toleranceThreshold) {
            recentDeviations.push(trend.lastMeasurement);
          }
        }
      }

      const averageScore = frameworkBaselines.length > 0 ? totalScore / frameworkBaselines.length : 0;
      const status = averageScore >= 90 ? 'healthy' : 
                    averageScore >= 70 ? 'warning' : 'critical';

      frameworkHealth[framework] = {
        score: Math.round(averageScore),
        status,
        baselinesTracked: frameworkBaselines.length,
        baselinesMet,
        criticalDeviations
      };
    }

    // Calculate overall health score
    const overallHealthScore = Object.values(frameworkHealth)
      .reduce((sum: number, fh: any) => sum + fh.score, 0) / Object.keys(frameworkHealth).length;

    // Generate improvement opportunities
    const improvementOpportunities = this.identifyImprovementOpportunities(trendAnalysis);

    // Get recent alerts
    const recentAlerts = this.alerts
      .filter(a => Date.now() - a.triggeredAt.getTime() < 7 * 24 * 60 * 60 * 1000) // Last 7 days
      .sort((a, b) => b.triggeredAt.getTime() - a.triggeredAt.getTime())
      .slice(0, 10);

    return {
      overallHealthScore: Math.round(overallHealthScore),
      frameworkHealth,
      recentDeviations: recentDeviations
        .sort((a, b) => b.measuredAt.getTime() - a.measuredAt.getTime())
        .slice(0, 10),
      trendAnalysis: trendAnalysis
        .sort((a, b) => Math.abs(b.averageDeviation) - Math.abs(a.averageDeviation))
        .slice(0, 20),
      improvementOpportunities,
      alerts: recentAlerts
    };
  }

  /**
   * Update baseline target or tolerance
   */
  async updateBaseline(
    baselineId: string,
    updates: Partial<Pick<ComplianceBaseline, 'targetValue' | 'toleranceThreshold' | 'isActive'>>
  ): Promise<void> {
    const baseline = this.baselines.get(baselineId);
    if (!baseline) {
      throw new Error(`Baseline not found: ${baselineId}`);
    }

    const updatedBaseline = {
      ...baseline,
      ...updates,
      lastUpdatedAt: new Date()
    };

    this.baselines.set(baselineId, updatedBaseline);
    console.log(`📝 Updated baseline ${baseline.name}`);
  }

  /**
   * Create custom baseline
   */
  async createCustomBaseline(
    baseline: Omit<ComplianceBaseline, 'id' | 'baselineEstablishedAt' | 'lastUpdatedAt'>
  ): Promise<ComplianceBaseline> {
    const customBaseline: ComplianceBaseline = {
      ...baseline,
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      baselineEstablishedAt: new Date(),
      lastUpdatedAt: new Date()
    };

    this.baselines.set(customBaseline.id, customBaseline);
    console.log(`✅ Created custom baseline: ${customBaseline.name}`);
    return customBaseline;
  }

  /**
   * Get all active baselines
   */
  getActiveBaselines(): ComplianceBaseline[] {
    return Array.from(this.baselines.values())
      .filter(b => b.isActive)
      .sort((a, b) => a.framework.localeCompare(b.framework));
  }

  /**
   * Export baseline data for reporting
   */
  exportBaselineData(framework?: string, daysPeriod: number = 30): {
    baselines: ComplianceBaseline[];
    measurements: ComplianceMeasurement[];
    summary: Record<string, any>;
  } {
    const baselines = Array.from(this.baselines.values())
      .filter(b => b.isActive && (!framework || b.framework === framework));

    const cutoffDate = new Date(Date.now() - daysPeriod * 24 * 60 * 60 * 1000);
    const measurements = this.measurements
      .filter(m => {
        const baseline = this.baselines.get(m.baselineId);
        return baseline && baselines.includes(baseline) && m.measuredAt >= cutoffDate;
      });

    const summary = {
      totalBaselines: baselines.length,
      totalMeasurements: measurements.length,
      averageCompliance: measurements.length > 0 
        ? measurements.reduce((sum, m) => sum + (100 - Math.abs(m.deviation)), 0) / measurements.length 
        : 0,
      criticalDeviations: measurements.filter(m => m.status === 'critical_deviation').length,
      period: `${daysPeriod} days`,
      generatedAt: new Date()
    };

    return { baselines, measurements, summary };
  }

  // Private helper methods

  private calculateDeviation(actualValue: number, targetValue: number): number {
    return ((actualValue - targetValue) / targetValue) * 100;
  }

  private determineStatus(deviation: number, toleranceThreshold: number): ComplianceMeasurement['status'] {
    const absDeviation = Math.abs(deviation);
    
    if (absDeviation <= toleranceThreshold) {
      return deviation >= 0 ? 'above_baseline' : 'at_baseline';
    } else if (absDeviation <= toleranceThreshold * 2) {
      return 'below_baseline';
    } else {
      return 'critical_deviation';
    }
  }

  private calculateConsistencyScore(measurements: ComplianceMeasurement[]): number {
    if (measurements.length < 2) return 100;

    const deviations = measurements.map(m => Math.abs(m.deviation));
    const average = deviations.reduce((sum, d) => sum + d, 0) / deviations.length;
    const variance = deviations.reduce((sum, d) => sum + Math.pow(d - average, 2), 0) / deviations.length;
    const standardDeviation = Math.sqrt(variance);

    // Convert to 0-100 score (lower std deviation = higher consistency)
    return Math.max(0, 100 - standardDeviation * 2);
  }

  private analyzeTrendDirection(measurements: ComplianceMeasurement[]): BaselineTrend['trendDirection'] {
    if (measurements.length < 3) return 'stable';

    const recentMeasurements = measurements.slice(-5); // Last 5 measurements
    const first = recentMeasurements[0];
    const last = recentMeasurements[recentMeasurements.length - 1];

    const trendValue = last.actualValue - first.actualValue;
    const criticalCount = recentMeasurements.filter(m => m.status === 'critical_deviation').length;

    if (criticalCount >= recentMeasurements.length / 2) {
      return 'critical';
    } else if (Math.abs(trendValue) < first.targetValue * 0.02) { // Less than 2% change
      return 'stable';
    } else if (trendValue > 0) {
      return 'improving';
    } else {
      return 'declining';
    }
  }

  private generateRecommendations(
    baseline: ComplianceBaseline, 
    measurements: ComplianceMeasurement[], 
    trend: BaselineTrend['trendDirection']
  ): string[] {
    const recommendations: string[] = [];
    const lastMeasurement = measurements[measurements.length - 1];

    switch (trend) {
      case 'critical':
        recommendations.push(`Immediate action required: ${baseline.name} shows critical deviations`);
        recommendations.push('Engage incident response team and compliance officer');
        recommendations.push('Review and update security controls immediately');
        break;

      case 'declining':
        recommendations.push(`Address declining trend in ${baseline.name}`);
        recommendations.push('Investigate root causes of performance degradation');
        recommendations.push('Consider adjusting baseline targets if industry standards have changed');
        break;

      case 'stable':
        if (lastMeasurement.status === 'below_baseline') {
          recommendations.push(`Optimize ${baseline.name} to exceed baseline targets`);
          recommendations.push('Implement continuous improvement initiatives');
        } else {
          recommendations.push(`Maintain current performance levels for ${baseline.name}`);
        }
        break;

      case 'improving':
        recommendations.push(`Continue positive momentum for ${baseline.name}`);
        recommendations.push('Document successful practices for replication');
        recommendations.push('Consider raising baseline targets to drive further improvement');
        break;
    }

    // Framework-specific recommendations
    switch (baseline.framework) {
      case 'GDPR':
        if (lastMeasurement.status !== 'at_baseline' && lastMeasurement.status !== 'above_baseline') {
          recommendations.push('Review data processing activities and consent mechanisms');
          recommendations.push('Audit data retention and deletion procedures');
        }
        break;

      case 'SOC2':
        if (lastMeasurement.status !== 'at_baseline' && lastMeasurement.status !== 'above_baseline') {
          recommendations.push('Review access controls and audit logging mechanisms');
          recommendations.push('Validate security monitoring and incident response procedures');
        }
        break;

      case 'MPA':
        if (lastMeasurement.status !== 'at_baseline' && lastMeasurement.status !== 'above_baseline') {
          recommendations.push('Strengthen content encryption and access tracking');
          recommendations.push('Review pre-release content handling procedures');
        }
        break;
    }

    return recommendations.slice(0, 5); // Limit to top 5 recommendations
  }

  private identifyImprovementOpportunities(trends: BaselineTrend[]): BaselineDashboard['improvementOpportunities'] {
    return trends
      .filter(trend => trend.trendDirection === 'declining' || trend.lastMeasurement.status === 'below_baseline')
      .map(trend => {
        const gap = Math.abs(trend.lastMeasurement.deviation);
        const impact = gap > 20 ? 'high' : gap > 10 ? 'medium' : 'low';
        const difficulty: 'low' | 'medium' | 'high' = trend.framework === 'GDPR' ? 'high' : 
                          trend.framework === 'SOC2' ? 'medium' : 'low';
        const timeframe = difficulty === 'high' ? '3-6 months' : 
                         difficulty === 'medium' ? '1-3 months' : '2-4 weeks';

        return {
          baselineId: trend.baselineId,
          name: trend.name,
          currentGap: Math.round(gap),
          potentialImpact: `Improve ${trend.framework} compliance by ${Math.round(gap)}%`,
          difficulty,
          estimatedTimeframe: timeframe
        };
      })
      .sort((a, b) => b.currentGap - a.currentGap)
      .slice(0, 10);
  }

  private async createAlert(alertData: {
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    baselineId: string;
    measurement: ComplianceMeasurement;
  }): Promise<void> {
    const alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      severity: alertData.severity,
      message: alertData.message,
      baselineId: alertData.baselineId,
      triggeredAt: new Date(),
      acknowledged: false
    };

    this.alerts.push(alert);
    console.log(`🚨 ${alertData.severity.toUpperCase()} ALERT: ${alertData.message}`);
  }

  private getUnitSymbol(unit: ComplianceBaseline['measurementUnit']): string {
    switch (unit) {
      case 'percentage': return '%';
      case 'time': return 'h';
      case 'count': return '';
      case 'score': return '/100';
      default: return '';
    }
  }
}

// Export singleton instance
export const complianceBaselineTracker = new ComplianceBaselineTracker();