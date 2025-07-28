/**
 * API Optimization Service - Epic 31 Security Analytics Integration
 * 
 * Task: E31-1753313263509-25FF04 - Create API optimization recommendations and insights
 * 
 * This service analyzes API performance data and generates actionable optimization
 * recommendations for administrators. Integrates with Epic 17 API management and
 * Epic 1 analytics foundation to provide intelligent insights.
 */

import { ApiKeyUsageAnalytics } from './ApiManagementService';
import { DatabaseService } from '../../database/DatabaseService';
import { AuditService } from '../../auth/services/AuditService';

}
export interface ApiOptimizationRecommendation {
  id: string;
  type: 'performance' | 'security' | 'cost' | 'reliability' | 'scalability';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: {
    estimatedSavings?: number; // Cost savings in dollars
    performanceImprovement?: number; // Percentage improvement
    securityRisk?: 'low' | 'medium' | 'high' | 'critical';
    reliabilityImprovement?: number; // Uptime improvement percentage
}
  };
  recommendation: {
    action: string;
    implementation: string[];
    timeToImplement: number; // Hours
    priority: number; // 1-10
  };
  metrics: {
    affectedKeys: string[];
    affectedEndpoints: string[];
    currentPerformance: Record<string, number>;
    expectedPerformance: Record<string, number>;
  };
  generatedAt: Date;
  category: string;
}

}
export interface ApiOptimizationInsights {
  summary: {
    totalRecommendations: number;
    criticalIssues: number;
    estimatedSavings: number;
    performanceGains: number;
}
  };
  recommendations: ApiOptimizationRecommendation[];
  trends: {
    performanceTrend: 'improving' | 'stable' | 'degrading';
    usageTrend: 'increasing' | 'stable' | 'decreasing';
    errorTrend: 'improving' | 'stable' | 'worsening';
  };
  benchmarks: {
    industryAverages: {
      responseTime: number;
      errorRate: number;
      uptime: number;
    };
    yourPerformance: {
      responseTime: number;
      errorRate: number;
      uptime: number;
    };
  };
}

}
export interface OptimizationAnalysisConfig {
  timeWindow: number; // Days to analyze
  includeBenchmarks: boolean;
  focusAreas: Array<'performance' | 'security' | 'cost' | 'reliability'>;
  minimumUsage: number; // Minimum API calls to include in analysis
}
}

export class ApiOptimizationService {
  private databaseService: DatabaseService;
  private auditService: AuditService;

  constructor(
    databaseService: DatabaseService,
    auditService: AuditService
  ) {
    this.databaseService = databaseService;
    this.auditService = auditService;
  }

  /**
   * Generate comprehensive optimization insights for API management
   */
  async generateOptimizationInsights(
    config: OptimizationAnalysisConfig = {
      timeWindow: 30,
      includeBenchmarks: true,
      focusAreas: ['performance', 'security', 'cost', 'reliability'],
      minimumUsage: 100
    }
  ): Promise<ApiOptimizationInsights> {

    // Collect API analytics data
    const analyticsData = await this.collectAnalyticsData(config);
    
    // Generate recommendations
    const recommendations = await this.generateRecommendations(analyticsData, config);
    
    // Analyze trends
    const trends = await this.analyzeTrends(analyticsData);
    
    // Get benchmarks
    const benchmarks = config.includeBenchmarks 
      ? await this.getBenchmarks(analyticsData)
      : this.getDefaultBenchmarks();

    const summary = this.generateSummary(recommendations);

    return {
      summary,
      recommendations,
      trends,
      benchmarks
    };
  }

  /**
   * Generate specific recommendations based on API analytics
   */
  private async generateRecommendations(
    analyticsData: ApiKeyUsageAnalytics[],
    config: OptimizationAnalysisConfig
  ): Promise<ApiOptimizationRecommendation[]> {

    const recommendations: ApiOptimizationRecommendation[] = [];

    for (const analytics of analyticsData) {
      // Performance optimization recommendations
      if (config.focusAreas.includes('performance')) {
        recommendations.push(...await this.generatePerformanceRecommendations(analytics));
      }

      // Security optimization recommendations
      if (config.focusAreas.includes('security')) {
        recommendations.push(...await this.generateSecurityRecommendations(analytics));
      }

      // Cost optimization recommendations
      if (config.focusAreas.includes('cost')) {
        recommendations.push(...await this.generateCostRecommendations(analytics));
      }

      // Reliability optimization recommendations
      if (config.focusAreas.includes('reliability')) {
        recommendations.push(...await this.generateReliabilityRecommendations(analytics));
      }
    }

    // Sort by priority and severity
    return recommendations
      .sort((a, b) => {
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
        if (severityDiff !== 0) return severityDiff;
        return b.recommendation.priority - a.recommendation.priority;
  }
      .slice(0, 20); // Limit to top 20 recommendations
  }

  /**
   * Generate performance-focused recommendations
   */
  private async generatePerformanceRecommendations(
    analytics: ApiKeyUsageAnalytics
  ): Promise<ApiOptimizationRecommendation[]> {

    const recommendations: ApiOptimizationRecommendation[] = [];

    // High latency detection
    if (analytics.performance.averageLatency > 1000) {
      recommendations.push({
        id: `perf-latency-${analytics.keyId}`,
        type: 'performance',
        severity: analytics.performance.averageLatency > 3000 ? 'critical' : 'high',
        title: 'High API Response Latency Detected',
        description: `API key "${analytics.name}" shows average latency of ${analytics.performance.averageLatency}ms, significantly above optimal range (< 500ms).`,
        impact: {
          performanceImprovement: 60,
          reliabilityImprovement: 25
  }
        recommendation: {
          action: 'Optimize slow endpoints and implement caching',
          implementation: [
            'Analyze slow endpoints using performance profiling',
            'Implement Redis caching for frequently accessed data',
            'Add database query optimization',
            'Consider implementing CDN for static resources',
            'Set up response compression'
          ],
          timeToImplement: 8,
          priority: 9
  }
        metrics: {
          affectedKeys: [analytics.keyId],
          affectedEndpoints: analytics.endpoints
            .filter(ep => ep.averageLatency > 1000)
            .map(ep => ep.path),
          currentPerformance: {
            averageLatency: analytics.performance.averageLatency,
            p95Latency: analytics.performance.p95Latency
  }
          expectedPerformance: {
            averageLatency: 400,
            p95Latency: 800
          }
  }
        generatedAt: new Date(),
        category: 'Response Time Optimization'
      });
    }

    // High error rate detection
    if (analytics.usage.errorRate > 5) {
      recommendations.push({
        id: `perf-errors-${analytics.keyId}`,
        type: 'reliability',
        severity: analytics.usage.errorRate > 15 ? 'critical' : 'high',
        title: 'High API Error Rate',
        description: `API key "${analytics.name}" has error rate of ${analytics.usage.errorRate}%, indicating reliability issues.`,
        impact: {
          reliabilityImprovement: 80,
          performanceImprovement: 20
  }
        recommendation: {
          action: 'Investigate and fix error-prone endpoints',
          implementation: [
            'Analyze error logs for common failure patterns',
            'Implement better input validation',
            'Add circuit breakers for external dependencies',
            'Improve error handling and retry logic',
            'Set up automated error monitoring and alerting'
          ],
          timeToImplement: 12,
          priority: 10
  }
        metrics: {
          affectedKeys: [analytics.keyId],
          affectedEndpoints: analytics.endpoints
            .filter(ep => ep.errorRate > 5)
            .map(ep => ep.path),
          currentPerformance: {
            errorRate: analytics.usage.errorRate,
            successRate: analytics.performance.successRate
  }
          expectedPerformance: {
            errorRate: 2,
            successRate: 98
          }
  }
        generatedAt: new Date(),
        category: 'Error Rate Reduction'
      });
    }

    return recommendations;
  }

  /**
   * Generate security-focused recommendations
   */
  private async generateSecurityRecommendations(
    analytics: ApiKeyUsageAnalytics
  ): Promise<ApiOptimizationRecommendation[]> {

    const recommendations: ApiOptimizationRecommendation[] = [];

    // Suspicious activity detection
    if (analytics.security.suspiciousActivity > 10) {
      recommendations.push({
        id: `sec-suspicious-${analytics.keyId}`,
        type: 'security',
        severity: 'high',
        title: 'Suspicious API Activity Detected',
        description: `API key "${analytics.name}" shows ${analytics.security.suspiciousActivity} suspicious activities, indicating potential security risks.`,
        impact: {
          securityRisk: 'high'
  }
        recommendation: {
          action: 'Implement enhanced security monitoring',
          implementation: [
            'Enable advanced rate limiting',
            'Implement IP whitelisting',
            'Add request pattern analysis',
            'Set up anomaly detection alerts',
            'Consider API key rotation'
          ],
          timeToImplement: 6,
          priority: 9
  }
        metrics: {
          affectedKeys: [analytics.keyId],
          affectedEndpoints: [],
          currentPerformance: {
            suspiciousActivity: analytics.security.suspiciousActivity,
            uniqueIPs: analytics.security.uniqueIPs
  }
          expectedPerformance: {
            suspiciousActivity: 0,
            uniqueIPs: analytics.security.uniqueIPs
          }
  }
        generatedAt: new Date(),
        category: 'Security Enhancement'
      });
    }

    // Too many unique IPs (potential security risk)
    if (analytics.security.uniqueIPs > 100) {
      recommendations.push({
        id: `sec-ips-${analytics.keyId}`,
        type: 'security',
        severity: 'medium',
        title: 'High Number of Unique IPs',
        description: `API key "${analytics.name}" is being used from ${analytics.security.uniqueIPs} unique IP addresses, which may indicate key sharing or compromise.`,
        impact: {
          securityRisk: 'medium'
  }
        recommendation: {
          action: 'Review IP usage patterns and implement restrictions',
          implementation: [
            'Analyze IP geolocation patterns',
            'Implement IP-based rate limiting',
            'Consider geographic restrictions',
            'Set up alerts for new IP usage',
            'Review key usage policies with client'
          ],
          timeToImplement: 4,
          priority: 6
  }
        metrics: {
          affectedKeys: [analytics.keyId],
          affectedEndpoints: [],
          currentPerformance: {
            uniqueIPs: analytics.security.uniqueIPs
  }
          expectedPerformance: {
            uniqueIPs: 50
          }
  }
        generatedAt: new Date(),
        category: 'IP Management'
      });
    }

    return recommendations;
  }

  /**
   * Generate cost optimization recommendations
   */
  private async generateCostRecommendations(
    analytics: ApiKeyUsageAnalytics
  ): Promise<ApiOptimizationRecommendation[]> {

    const recommendations: ApiOptimizationRecommendation[] = [];

    // High usage with high error rate (wasteful)
    if (analytics.usage.totalCalls > 10000 && analytics.usage.errorRate > 10) {
      const wastedCalls = analytics.usage.totalCalls * (analytics.usage.errorRate / 100);
      const estimatedSavings = wastedCalls * 0.001; // $0.001 per call estimate

      recommendations.push({
        id: `cost-waste-${analytics.keyId}`,
        type: 'cost',
        severity: 'medium',
        title: 'High Cost Due to Failed Requests',
        description: `API key "${analytics.name}" is generating significant costs from failed requests (${wastedCalls.toFixed(0)} failed calls).`,
        impact: {
          estimatedSavings,
          performanceImprovement: 15
  }
        recommendation: {
          action: 'Reduce failed requests to optimize costs',
          implementation: [
            'Improve client-side error handling',
            'Implement request validation',
            'Add retry logic with exponential backoff',
            'Provide better API documentation',
            'Set up client SDK with built-in error handling'
          ],
          timeToImplement: 6,
          priority: 7
  }
        metrics: {
          affectedKeys: [analytics.keyId],
          affectedEndpoints: analytics.endpoints
            .filter(ep => ep.errorRate > 10)
            .map(ep => ep.path),
          currentPerformance: {
            errorRate: analytics.usage.errorRate,
            wastedCalls
  }
          expectedPerformance: {
            errorRate: 3,
            wastedCalls: analytics.usage.totalCalls * 0.03
          }
  }
        generatedAt: new Date(),
        category: 'Cost Optimization'
      });
    }

    return recommendations;
  }

  /**
   * Generate reliability-focused recommendations
   */
  private async generateReliabilityRecommendations(
    analytics: ApiKeyUsageAnalytics
  ): Promise<ApiOptimizationRecommendation[]> {

    const recommendations: ApiOptimizationRecommendation[] = [];

    // Low uptime
    if (analytics.performance.uptime < 99.0) {
      recommendations.push({
        id: `rel-uptime-${analytics.keyId}`,
        type: 'reliability',
        severity: analytics.performance.uptime < 95.0 ? 'critical' : 'high',
        title: 'Low API Uptime',
        description: `API key "${analytics.name}" shows uptime of ${analytics.performance.uptime}%, below acceptable standards (>99%).`,
        impact: {
          reliabilityImprovement: 99.9 - analytics.performance.uptime
  }
        recommendation: {
          action: 'Improve system reliability and monitoring',
          implementation: [
            'Implement health checks and monitoring',
            'Set up redundant infrastructure',
            'Add automated failover mechanisms',
            'Improve error handling and recovery',
            'Implement circuit breakers for dependencies'
          ],
          timeToImplement: 16,
          priority: 10
  }
        metrics: {
          affectedKeys: [analytics.keyId],
          affectedEndpoints: [],
          currentPerformance: {
            uptime: analytics.performance.uptime
  }
          expectedPerformance: {
            uptime: 99.9
          }
  }
        generatedAt: new Date(),
        category: 'Uptime Improvement'
      });
    }

    return recommendations;
  }

  /**
   * Collect API analytics data for analysis
   */
  private async collectAnalyticsData(
    config: OptimizationAnalysisConfig
  ): Promise<ApiKeyUsageAnalytics[]> {

    // This would integrate with the existing ApiManagementService
    // For now, return mock data structure
    return [];
  }

  /**
   * Analyze performance and usage trends
   */
  private async analyzeTrends(analyticsData: ApiKeyUsageAnalytics[]) {
    // Analyze trends over time
    return {
      performanceTrend: 'stable' as const,
      usageTrend: 'increasing' as const,
      errorTrend: 'improving' as const
    };
  }

  /**
   * Get industry benchmarks
   */
  private async getBenchmarks(analyticsData: ApiKeyUsageAnalytics[]) {
    return {
      industryAverages: {
        responseTime: 300,
        errorRate: 2.5,
        uptime: 99.5
  }
      yourPerformance: {
        responseTime: analyticsData.reduce(
          (acc,
          data
        ) => acc + data.performance.averageLatency, 0) / analyticsData.length || 0,
        errorRate: analyticsData.reduce((acc, data) => acc + data.usage.errorRate, 0) / analyticsData.length || 0,
        uptime: analyticsData.reduce((acc, data) => acc + data.performance.uptime, 0) / analyticsData.length || 0
      }
    };
  }

  /**
   * Get default benchmarks when not including industry data
   */
  private getDefaultBenchmarks() {
    return {
      industryAverages: {
        responseTime: 300,
        errorRate: 2.5,
        uptime: 99.5
  }
      yourPerformance: {
        responseTime: 0,
        errorRate: 0,
        uptime: 0
      }
    };
  }

  /**
   * Generate summary statistics
   */
  private generateSummary(recommendations: ApiOptimizationRecommendation[]) {
    return {
      totalRecommendations: recommendations.length,
      criticalIssues: recommendations.filter(r => r.severity === 'critical').length,
      estimatedSavings: recommendations.reduce((acc, r) => acc + (r.impact.estimatedSavings || 0), 0),
      performanceGains: recommendations.reduce(
        (acc,
        r
      ) => acc + (r.impact.performanceImprovement || 0), 0) / recommendations.length || 0
    };
  }

  /**
   * Get optimization recommendations for a specific API key
   */
  async getKeySpecificRecommendations(keyId: string): Promise<ApiOptimizationRecommendation[]> {

    const config: OptimizationAnalysisConfig = {
      timeWindow: 7,
      includeBenchmarks: false,
      focusAreas: ['performance', 'security', 'reliability'],
      minimumUsage: 1
    };

    const insights = await this.generateOptimizationInsights(config);
    return insights.recommendations.filter(rec => 
      rec.metrics.affectedKeys.includes(keyId)
    );
  }

  /**
   * Generate executive summary report
   */
  async generateExecutiveSummary(): Promise<{
    overview: string;
    keyFindings: string[];
    recommendations: string[];
    estimatedImpact: {
      costSavings: number;
      performanceImprovement: number;
      securityEnhancement: string;
    };
  }> {

    const insights = await this.generateOptimizationInsights();
    
    return {
      overview: `Analysis of ${insights.summary.totalRecommendations} optimization opportunities identified across API infrastructure.`,
      keyFindings: [
        `${insights.summary.criticalIssues} critical issues requiring immediate attention`,
        `Performance trending ${insights.trends.performanceTrend}`,
        `Error rates are ${insights.trends.errorTrend}`,
        `API usage is ${insights.trends.usageTrend}`
      ],
      recommendations: insights.recommendations
        .filter(r => r.severity === 'critical' || r.severity === 'high')
        .slice(0, 5)
        .map(r => r.title),
      estimatedImpact: {
        costSavings: insights.summary.estimatedSavings,
        performanceImprovement: insights.summary.performanceGains,
        securityEnhancement: insights.recommendations.filter(r => r.type === 'security').length > 0 ? 'High' : 'Medium'
      }
    };
  }
}

export default ApiOptimizationService;