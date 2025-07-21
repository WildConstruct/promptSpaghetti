/**
 * Quality Metrics Hook - Epic 18
 * 
 * Custom React hook for managing quality metrics data, real-time updates,
 * caching, and API integration for the quality dashboard components.
 * 
 * Task: E18-1753114562561-695DBB - Create quality dashboards
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// =============================================================================
// Quality Metrics Types (matching backend service)
// =============================================================================

export interface QualityMetrics {
  timestamp: Date;
  overall: OverallQualityScore;
  testCoverage: TestCoverageMetrics;
  codeQuality: CodeQualityMetrics;
  performance: PerformanceQualityMetrics;
  security: SecurityQualityMetrics;
  documentation: DocumentationQualityMetrics;
  buildHealth: BuildHealthMetrics;
  trends: QualityTrends;
  recommendations: QualityRecommendation[];
  alerts: QualityAlert[];
  metadata: {
    collectionDuration: number;
    dataSourcesActive: string[];
    lastUpdated: Date;
    version: string;
  };
}

export interface OverallQualityScore {
  score: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
  status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  improvement: number;
  componentScores: {
    testCoverage: number;
    codeQuality: number;
    performance: number;
    security: number;
    documentation: number;
    buildHealth: number;
  };
  weights: {
    testCoverage: number;
    codeQuality: number;
    performance: number;
    security: number;
    documentation: number;
    buildHealth: number;
  };
}

export interface TestCoverageMetrics {
  overall: {
    percentage: number;
    linesTotal: number;
    linesCovered: number;
    branchesTotal: number;
    branchesCovered: number;
    functionsTotal: number;
    functionsCovered: number;
  };
  byPackage: Array<{
    name: string;
    percentage: number;
    linesTotal: number;
    linesCovered: number;
  }>;
  byComponent: Array<{
    name: string;
    type: 'component' | 'service' | 'utility';
    percentage: number;
    criticalPaths: number;
    uncoveredPaths: number;
  }>;
  trends: {
    last7Days: number[];
    last30Days: number[];
    changeFromLastWeek: number;
    changeFromLastMonth: number;
  };
  uncoveredCriticalPaths: string[];
  coverageHotspots: Array<{
    file: string;
    function: string;
    coverage: number;
    importance: 'low' | 'medium' | 'high' | 'critical';
    reason: string;
  }>;
}

export interface CodeQualityMetrics {
  complexity: {
    average: number;
    maximum: number;
    distribution: {
      '1-5': number;
      '6-10': number;
      '11-20': number;
      '21-50': number;
      '50+': number;
    };
    highComplexityFiles: string[];
  };
  duplication: {
    percentage: number;
    duplicatedLines: number;
    totalLines: number;
    duplicatedBlocks: Array<{
      lines: number;
      files: string[];
      similarity: number;
    }>;
  };
  maintainability: {
    index: number;
    byFile: Array<{
      file: string;
      index: number;
      complexity: number;
      size: number;
      issues: string[];
    }>;
    trends: number[];
  };
  linting: {
    totalIssues: number;
    errorCount: number;
    warningCount: number;
    ruleBreakdowns: Array<{
      rule: string;
      count: number;
      severity: 'error' | 'warning';
      trend: 'increasing' | 'stable' | 'decreasing';
    }>;
    trends: number[];
  };
  technicalDebt: {
    totalMinutes: number;
    breakdown: Array<{
      category: string;
      minutes: number;
      files: string[];
      priority: 'low' | 'medium' | 'high' | 'critical';
    }>;
    priority: 'low' | 'medium' | 'high' | 'critical';
  };
}

export interface PerformanceQualityMetrics {
  responseTime: {
    average: number;
    p50: number;
    p90: number;
    p95: number;
    p99: number;
  };
  throughput: {
    requestsPerSecond: number;
    peakRps: number;
    trends: number[];
  };
  resourceUtilization: {
    cpu: {
      average: number;
      peak: number;
      trends: number[];
    };
    memory: {
      average: number;
      peak: number;
      trends: number[];
    };
    disk: {
      usage: number;
      iops: number;
    };
  };
  errorRates: {
    overall: number;
    by4xx: number;
    by5xx: number;
    trends: number[];
  };
  loadTestResults: Array<{
    timestamp: Date;
    duration: number;
    virtualUsers: number;
    requestsPerSecond: number;
    averageResponseTime: number;
    errorRate: number;
    passed: boolean;
  }>;
}

export interface SecurityQualityMetrics {
  vulnerabilities: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    trends: number[];
  };
  dependencies: {
    total: number;
    outdated: number;
    vulnerable: number;
    licenses: Array<{
      license: string;
      count: number;
      compatible: boolean;
      risk: 'low' | 'medium' | 'high';
    }>;
  };
  codeSecurityIssues: {
    total: number;
    byCategory: Array<{
      category: string;
      count: number;
      severity: 'low' | 'medium' | 'high' | 'critical';
    }>;
    highRiskFiles: string[];
  };
  compliance: {
    frameworks: Array<{
      framework: string;
      score: number;
      status: 'compliant' | 'non_compliant' | 'partial';
      lastAssessed: Date;
    }>;
    overallScore: number;
    gaps: Array<{
      framework: string;
      requirement: string;
      status: 'missing' | 'partial' | 'outdated';
      priority: 'low' | 'medium' | 'high' | 'critical';
    }>;
  };
  accessControl: {
    privilegedAccounts: number;
    dormantAccounts: number;
    lastSecurityReview: Date;
  };
}

export interface DocumentationQualityMetrics {
  coverage: {
    apiDocumentation: number;
    codeDocumentation: number;
    userGuides: number;
    overall: number;
  };
  accuracy: {
    validCodeExamples: number;
    validApiExamples: number;
    brokenLinks: number;
    outdatedSections: string[];
  };
  completeness: {
    missingApiDocs: string[];
    missingUserGuides: string[];
    incompleteSections: string[];
  };
  maintenance: {
    lastUpdated: Date;
    staleSections: string[];
    maintenanceScore: number;
  };
}

export interface BuildHealthMetrics {
  builds: {
    successRate: number;
    averageDuration: number;
    failureReasons: Array<{
      reason: string;
      count: number;
      percentage: number;
      trend: 'increasing' | 'stable' | 'decreasing';
    }>;
    trends: number[];
  };
  tests: {
    passRate: number;
    totalTests: number;
    flakyTests: string[];
    slowTests: Array<{
      name: string;
      duration: number;
      file: string;
      trend: 'improving' | 'stable' | 'degrading';
    }>;
    trends: number[];
  };
  deployments: {
    successRate: number;
    frequency: number;
    rollbackRate: number;
    averageDeployTime: number;
  };
  pipeline: {
    stages: Array<{
      name: string;
      averageDuration: number;
      successRate: number;
      bottleneck: boolean;
    }>;
    bottlenecks: string[];
    healthScore: number;
  };
}

export interface QualityTrends {
  overall: TrendData;
  testCoverage: TrendData;
  codeQuality: TrendData;
  performance: TrendData;
  security: TrendData;
  documentation: TrendData;
  buildHealth: TrendData;
}

export interface TrendData {
  daily: number[];
  weekly: number[];
  monthly: number[];
  direction: 'improving' | 'stable' | 'degrading';
  velocity: number;
  projection: number;
}

export interface QualityRecommendation {
  id: string;
  category: 'testCoverage' | 'codeQuality' | 'performance' | 'security' | 'documentation' | 'buildHealth';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  actions: Array<{
    description: string;
    type: 'code_change' | 'configuration' | 'process' | 'tooling';
    effort: 'low' | 'medium' | 'high';
    automated: boolean;
  }>;
  expectedImprovement: {
    metric: string;
    currentValue: number;
    projectedValue: number;
    confidence: number;
  };
  relatedFiles: string[];
  relatedComponents: string[];
  status: 'new' | 'acknowledged' | 'in_progress' | 'completed' | 'dismissed';
  createdAt: Date;
  updatedAt: Date;
}

export interface QualityAlert {
  id: string;
  type: 'threshold_breach' | 'quality_degradation' | 'build_failure' | 'security_issue';
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  metric: string;
  currentValue: number;
  thresholdValue?: number;
  previousValue?: number;
  component?: string;
  file?: string;
  timestamp: Date;
  status: 'active' | 'acknowledged' | 'resolved';
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
}

// =============================================================================
// Hook Configuration
// =============================================================================

export interface UseQualityMetricsOptions {
  refreshInterval?: number; // milliseconds, 0 to disable auto-refresh
  enableCache?: boolean;
  cacheTimeout?: number; // milliseconds
  onError?: (error: Error) => void;
  onMetricsUpdate?: (metrics: QualityMetrics) => void;
}

export interface UseQualityMetricsReturn {
  // Data
  metrics: QualityMetrics | null;
  trends: QualityTrends | null;
  alerts: QualityAlert[];
  recommendations: QualityRecommendation[];
  
  // State
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  
  // Actions
  refreshMetrics: () => Promise<void>;
  acknowledgeAlert: (alertId: string) => Promise<void>;
  updateRecommendation: (recommendationId: string, status: string) => Promise<void>;
  getTrends: (timeframe?: 'week' | 'month' | 'quarter') => Promise<QualityTrends | null>;
  getHistoricalMetrics: (startDate: Date, endDate: Date) => Promise<QualityMetrics[]>;
}

// =============================================================================
// Quality Metrics Hook Implementation
// =============================================================================

export function useQualityMetrics(options: UseQualityMetricsOptions = {}): UseQualityMetricsReturn {
  const {
    refreshInterval = 60000, // 1 minute default
    enableCache = true,
    cacheTimeout = 300000, // 5 minutes
    onError,
    onMetricsUpdate
  } = options;
  
  // State
  const [metrics, setMetrics] = useState<QualityMetrics | null>(null);
  const [trends, setTrends] = useState<QualityTrends | null>(null);
  const [alerts, setAlerts] = useState<QualityAlert[]>([]);
  const [recommendations, setRecommendations] = useState<QualityRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Refs
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const cacheRef = useRef<{
    metrics: QualityMetrics | null;
    timestamp: number;
  }>({ metrics: null, timestamp: 0 });
  
  // API Base URL
  const API_BASE = '/api/quality';
  
  // Fetch quality metrics from API
  const fetchMetrics = useCallback(async (): Promise<QualityMetrics | null> => {
    try {
      const response = await fetch(`${API_BASE}/metrics`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch metrics: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Transform dates from strings to Date objects
      const transformedMetrics: QualityMetrics = {
        ...data,
        timestamp: new Date(data.timestamp),
        metadata: {
          ...data.metadata,
          lastUpdated: new Date(data.metadata.lastUpdated)
        },
        recommendations: data.recommendations.map((rec: any) => ({
          ...rec,
          createdAt: new Date(rec.createdAt),
          updatedAt: new Date(rec.updatedAt)
        })),
        alerts: data.alerts.map((alert: any) => ({
          ...alert,
          timestamp: new Date(alert.timestamp),
          acknowledgedAt: alert.acknowledgedAt ? new Date(alert.acknowledgedAt) : undefined,
          resolvedAt: alert.resolvedAt ? new Date(alert.resolvedAt) : undefined
        }))
      };
      
      return transformedMetrics;
      
    } catch (err) {
      console.error('Error fetching quality metrics:', err);
      throw err;
    }
  }, []);
  
  // Fetch trends data
  const fetchTrends = useCallback(async (timeframe: 'week' | 'month' | 'quarter' = 'month'): Promise<QualityTrends | null> => {
    try {
      const response = await fetch(`${API_BASE}/trends?timeframe=${timeframe}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch trends: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
      
    } catch (err) {
      console.error('Error fetching quality trends:', err);
      return null;
    }
  }, []);
  
  // Refresh metrics function
  const refreshMetrics = useCallback(async () => {
    try {
      setError(null);
      
      // Check cache first if enabled
      if (enableCache && cacheRef.current.metrics && 
          Date.now() - cacheRef.current.timestamp < cacheTimeout) {
        setMetrics(cacheRef.current.metrics);
        setAlerts(cacheRef.current.metrics.alerts);
        setRecommendations(cacheRef.current.metrics.recommendations);
        setIsLoading(false);
        setLastUpdated(cacheRef.current.metrics.metadata.lastUpdated);
        return;
      }
      
      setIsLoading(true);
      
      // Fetch fresh data
      const [metricsData, trendsData] = await Promise.all([
        fetchMetrics(),
        fetchTrends()
      ]);
      
      if (metricsData) {
        setMetrics(metricsData);
        setAlerts(metricsData.alerts);
        setRecommendations(metricsData.recommendations);
        setLastUpdated(metricsData.metadata.lastUpdated);
        
        // Update cache
        if (enableCache) {
          cacheRef.current = {
            metrics: metricsData,
            timestamp: Date.now()
          };
        }
        
        // Call update callback
        if (onMetricsUpdate) {
          onMetricsUpdate(metricsData);
        }
      }
      
      if (trendsData) {
        setTrends(trendsData);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      
      if (onError) {
        onError(err instanceof Error ? err : new Error(errorMessage));
      }
    } finally {
      setIsLoading(false);
    }
  }, [fetchMetrics, fetchTrends, enableCache, cacheTimeout, onError, onMetricsUpdate]);
  
  // Acknowledge alert
  const acknowledgeAlert = useCallback(async (alertId: string) => {
    try {
      const response = await fetch(`${API_BASE}/alerts/${alertId}/acknowledge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to acknowledge alert: ${response.status} ${response.statusText}`);
      }
      
      // Update local state
      setAlerts(prevAlerts => 
        prevAlerts.map(alert => 
          alert.id === alertId 
            ? { ...alert, status: 'acknowledged', acknowledgedAt: new Date() }
            : alert
        )
      );
      
    } catch (err) {
      console.error('Error acknowledging alert:', err);
      throw err;
    }
  }, []);
  
  // Update recommendation status
  const updateRecommendation = useCallback(async (recommendationId: string, status: string) => {
    try {
      const response = await fetch(`${API_BASE}/recommendations/${recommendationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update recommendation: ${response.status} ${response.statusText}`);
      }
      
      // Update local state
      setRecommendations(prevRecs => 
        prevRecs.map(rec => 
          rec.id === recommendationId 
            ? { ...rec, status: status as any, updatedAt: new Date() }
            : rec
        )
      );
      
    } catch (err) {
      console.error('Error updating recommendation:', err);
      throw err;
    }
  }, []);
  
  // Get trends for specific timeframe
  const getTrends = useCallback(async (timeframe: 'week' | 'month' | 'quarter' = 'month'): Promise<QualityTrends | null> => {
    return await fetchTrends(timeframe);
  }, [fetchTrends]);
  
  // Get historical metrics
  const getHistoricalMetrics = useCallback(async (startDate: Date, endDate: Date): Promise<QualityMetrics[]> => {
    try {
      const response = await fetch(
        `${API_BASE}/metrics/historical?start=${startDate.toISOString()}&end=${endDate.toISOString()}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch historical metrics: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Transform dates
      return data.map((metrics: any) => ({
        ...metrics,
        timestamp: new Date(metrics.timestamp),
        metadata: {
          ...metrics.metadata,
          lastUpdated: new Date(metrics.metadata.lastUpdated)
        }
      }));
      
    } catch (err) {
      console.error('Error fetching historical metrics:', err);
      return [];
    }
  }, []);
  
  // Setup auto-refresh
  useEffect(() => {
    if (refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(refreshMetrics, refreshInterval);
      
      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [refreshInterval, refreshMetrics]);
  
  // Initial load
  useEffect(() => {
    refreshMetrics();
  }, [refreshMetrics]);
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);
  
  return {
    // Data
    metrics,
    trends,
    alerts,
    recommendations,
    
    // State
    isLoading,
    error,
    lastUpdated,
    
    // Actions
    refreshMetrics,
    acknowledgeAlert,
    updateRecommendation,
    getTrends,
    getHistoricalMetrics
  };
}

export default useQualityMetrics;