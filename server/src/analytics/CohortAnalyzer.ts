import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { AnalyticsDAO, AnalyticsFilters } from '../database/analytics-dao';
import { AnalyticsEventType } from './AnalyticsCollector';

/**
 * Cohort definition
 */
}
}
export interface CohortDefinition {
  id: string;
  name: string;
  description: string;
  criteria: CohortCriteria;
  timeframe: {
    startDate: number;
    endDate?: number;
}
}
  };
  type: 'acquisition' | 'behavior' | 'retention' | 'custom';
  refreshInterval?: number; // Auto-refresh interval in milliseconds
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

/**
 * Cohort criteria for user segmentation
 */
}
}
export interface CohortCriteria {
  // User demographics
  userAttributes?: {
    organizationId?: number;
    userType?: string;
    registrationPeriod?: {
      startDate: number;
      endDate: number;
}
}
    };
  };
  
  // Behavioral criteria
  eventCriteria?: {
    eventTypes: AnalyticsEventType[];
    minOccurrences?: number;
    maxOccurrences?: number;
    timeWindow?: number; // milliseconds
    sequence?: boolean; // Events must occur in sequence
  };
  
  // Usage patterns
  usagePatterns?: {
    minSessions?: number;
    maxSessions?: number;
    minDuration?: number;
    maxDuration?: number;
    feature?: string;
    frequency?: 'daily' | 'weekly' | 'monthly';
  };
  
  // Performance criteria
  performanceCriteria?: {
    minExecutions?: number;
    maxExecutions?: number;
    successRate?: {
      min: number;
      max: number;
    };
    tokenUsage?: {
      min: number;
      max: number;
    };
  };
}

/**
 * Cohort analysis result
 */
}
}
export interface CohortAnalysis {
  cohortId: string;
  analysisId: string;
  timestamp: number;
  cohortSize: number;
  members: CohortMember[];
  metrics: CohortMetrics;
  segments: CohortSegment[];
  trends: CohortTrend[];
  retentionData?: RetentionData;
  comparisonData?: CohortComparison;
}
}
}

/**
 * Cohort member
 */
}
}
export interface CohortMember {
  userId: number;
  sessionId: string;
  joinDate: number;
  lastActivity: number;
  metrics: {
    totalSessions: number;
    totalDuration: number;
    totalEvents: number;
    totalExecutions: number;
    successRate: number;
    tokenUsage: number;
    totalCost: number;
}
}
  };
  segments: string[];
  status: 'active' | 'inactive' | 'churned';
}

/**
 * Cohort metrics
 */
}
}
export interface CohortMetrics {
  totalUsers: number;
  activeUsers: number;
  churnedUsers: number;
  averageSessionDuration: number;
  averageExecutionsPerUser: number;
  averageTokenUsagePerUser: number;
  averageCostPerUser: number;
  overallSuccessRate: number;
  retentionRate: number;
  engagementScore: number;
}
}
}

/**
 * Cohort segment
 */
}
}
export interface CohortSegment {
  segmentId: string;
  name: string;
  description: string;
  userCount: number;
  percentage: number;
  avgMetrics: {
    sessions: number;
    duration: number;
    executions: number;
    successRate: number;
    tokenUsage: number;
}
}
  };
  characteristics: string[];
}

/**
 * Cohort trend data
 */
}
}
export interface CohortTrend {
  period: string;
  timestamp: number;
  activeUsers: number;
  newUsers: number;
  churnedUsers: number;
  totalSessions: number;
  totalExecutions: number;
  averageEngagement: number;
  retentionRate: number;
}
}
}

/**
 * Retention analysis data
 */
}
}
export interface RetentionData {
  cohortPeriod: string;
  periods: string[];
  retentionRates: number[][]; // [cohort][period] = retention rate
  absoluteRetention: number[][]; // [cohort][period] = absolute user count
  averageRetention: number[];
  retentionCurve: Array<{
    period: number;
    rate: number;
    users: number;
}
}
  }>;
}

/**
 * Cohort comparison data
 */
}
}
export interface CohortComparison {
  comparisonId: string;
  cohorts: Array<{
    cohortId: string;
    name: string;
    size: number;
    metrics: CohortMetrics;
}
}
  }>;
  differences: Array<{
    metric: string;
    cohort1Value: number;
    cohort2Value: number;
    difference: number;
    percentageChange: number;
    significance: 'high' | 'medium' | 'low';
  }>;
  insights: string[];
}

/**
 * Cohort analysis system
 */
export class CohortAnalyzer extends EventEmitter {
  private analyticsDAO: AnalyticsDAO;
  private cohortDefinitions: Map<string, CohortDefinition> = new Map();
  private analysisCache: Map<string, CohortAnalysis> = new Map();
  private refreshTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor(analyticsDAO: AnalyticsDAO) {
    super();
    this.analyticsDAO = analyticsDAO;
    this.setupPeriodicAnalysis();
  }

  /**
   * Create a new cohort definition
   */
  createCohort(definition: Omit<CohortDefinition, 'id' | 'createdAt' | 'updatedAt'>): CohortDefinition {
    const cohort: CohortDefinition = {
      ...definition,
      id: uuidv4(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    this.cohortDefinitions.set(cohort.id, cohort);
    
    // Setup auto-refresh if specified
    if (cohort.refreshInterval && cohort.isActive) {
      this.setupCohortRefresh(cohort.id, cohort.refreshInterval);
    }

    this.emit('cohort_created', cohort);
    return cohort;
  }

  /**
   * Update cohort definition
   */
  updateCohort(cohortId: string, updates: Partial<CohortDefinition>): CohortDefinition | null {
    const cohort = this.cohortDefinitions.get(cohortId);
    
    if (!cohort) {
      return null;
    }

    const updatedCohort = {
      ...cohort,
      ...updates,
      id: cohortId, // Prevent ID changes
      updatedAt: Date.now()
    };

    this.cohortDefinitions.set(cohortId, updatedCohort);
    
    // Update refresh timer
    if (this.refreshTimers.has(cohortId)) {
      clearInterval(this.refreshTimers.get(cohortId)!);
      this.refreshTimers.delete(cohortId);
    }
    
    if (updatedCohort.refreshInterval && updatedCohort.isActive) {
      this.setupCohortRefresh(cohortId, updatedCohort.refreshInterval);
    }

    // Clear cached analysis
    this.analysisCache.delete(cohortId);

    this.emit('cohort_updated', updatedCohort);
    return updatedCohort;
  }

  /**
   * Delete cohort definition
   */
  deleteCohort(cohortId: string): boolean {
    const cohort = this.cohortDefinitions.get(cohortId);
    
    if (!cohort) {
      return false;
    }

    this.cohortDefinitions.delete(cohortId);
    this.analysisCache.delete(cohortId);
    
    if (this.refreshTimers.has(cohortId)) {
      clearInterval(this.refreshTimers.get(cohortId)!);
      this.refreshTimers.delete(cohortId);
    }

    this.emit('cohort_deleted', { cohortId, name: cohort.name });
    return true;
  }

  /**
   * Get cohort definition
   */
  getCohort(cohortId: string): CohortDefinition | null {
    return this.cohortDefinitions.get(cohortId) || null;
  }

  /**
   * Get all cohort definitions
   */
  getAllCohorts(): CohortDefinition[] {
    return Array.from(this.cohortDefinitions.values());
  }

  /**
   * Analyze cohort
   */
  analyzeCohort(cohortId: string, useCache: boolean = true): CohortAnalysis | null {
    const cohort = this.cohortDefinitions.get(cohortId);
    
    if (!cohort) {
      return null;
    }

    // Check cache first
    if (useCache && this.analysisCache.has(cohortId)) {
      return this.analysisCache.get(cohortId)!;
    }

    const analysis = this.performCohortAnalysis(cohort);
    
    // Cache the result
    this.analysisCache.set(cohortId, analysis);
    
    // Clear cache after 5 minutes
    setTimeout(() => {
      this.analysisCache.delete(cohortId);
    }, 300000);

    this.emit('cohort_analyzed', { cohortId, analysis });
    return analysis;
  }

  /**
   * Perform retention analysis
   */
  performRetentionAnalysis(
    cohortId: string,
    periodType: 'daily' | 'weekly' | 'monthly' = 'weekly',
    periods: number = 12
  ): RetentionData | null {
    const cohort = this.cohortDefinitions.get(cohortId);
    
    if (!cohort) {
      return null;
    }

    const members = this.getCohortMembers(cohort);
    const retentionData = this.calculateRetentionRates(members, periodType, periods);
    
    return retentionData;
  }

  /**
   * Compare cohorts
   */
  compareCohorts(cohortIds: string[]): CohortComparison | null {
    if (cohortIds.length < 2) {
      return null;
    }

    const cohorts = cohortIds.map(id => {
      const cohort = this.cohortDefinitions.get(id);
      const analysis = cohort ? this.analyzeCohort(id) : null;
      return { cohort, analysis };
    }).filter(item => item.cohort && item.analysis);

    if (cohorts.length < 2) {
      return null;
    }

    return this.performCohortComparison(cohorts as any[]);
  }

  /**
   * Get cohort insights
   */
  getCohortInsights(cohortId: string): Array<{
    type: 'trend' | 'anomaly' | 'recommendation';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    actionItems: string[];
  }> {
    const analysis = this.analyzeCohort(cohortId);
    
    if (!analysis) {
      return [];
    }

    const insights: Array<any> = [];

    // Analyze retention trends
    if (analysis.retentionData) {
      const avgRetention = analysis.retentionData.averageRetention;
      const latestRetention = avgRetention[avgRetention.length - 1];
      
      if (latestRetention < 0.3) {
        insights.push({
          type: 'trend',
          title: 'Low Retention Rate',
          description: `Current retention rate is ${(latestRetention * 100).toFixed(1)}%`,
          impact: 'high',
          actionItems: [
            'Improve onboarding experience',
            'Add engagement features',
            'Implement user feedback system',
            'Analyze drop-off points'
          ]
        });
      }
    }

    // Analyze engagement patterns
    if (analysis.metrics.engagementScore < 0.5) {
      insights.push({
        type: 'recommendation',
        title: 'Low Engagement Score',
        description: `Engagement score is ${(analysis.metrics.engagementScore * 100).toFixed(1)}%`,
        impact: 'medium',
        actionItems: [
          'Implement gamification features',
          'Send personalized recommendations',
          'Improve feature discoverability',
          'Add social features'
        ]
      });
    }

    // Analyze success rate
    if (analysis.metrics.overallSuccessRate < 0.8) {
      insights.push({
        type: 'anomaly',
        title: 'Low Success Rate',
        description: `Overall success rate is ${(analysis.metrics.overallSuccessRate * 100).toFixed(1)}%`,
        impact: 'high',
        actionItems: [
          'Improve error handling',
          'Add better user guidance',
          'Optimize system performance',
          'Provide more examples and tutorials'
        ]
      });
    }

    // Analyze churn
    const churnRate = analysis.metrics.churnedUsers / analysis.metrics.totalUsers;
    if (churnRate > 0.2) {
      insights.push({
        type: 'trend',
        title: 'High Churn Rate',
        description: `${(churnRate * 100).toFixed(1)}% of users have churned`,
        impact: 'high',
        actionItems: [
          'Implement win-back campaigns',
          'Analyze churn reasons',
          'Improve product-market fit',
          'Add exit surveys'
        ]
      });
    }

    return insights;
  }

  /**
   * Export cohort data
   */
  exportCohortData(cohortId: string, format: 'json' | 'csv' = 'json'): string {
    const analysis = this.analyzeCohort(cohortId);
    
    if (!analysis) {
      throw new Error('Cohort not found');
    }

    if (format === 'json') {
      return JSON.stringify(analysis, null, 2);
    }

    // CSV format
    const headers = ['userId', 'joinDate', 'lastActivity', 'totalSessions', 'totalDuration', 'totalExecutions', 'successRate', 'tokenUsage', 'totalCost', 'status'];
    const rows = analysis.members.map(member => [
      member.userId,
      new Date(member.joinDate).toISOString(),
      new Date(member.lastActivity).toISOString(),
      member.metrics.totalSessions,
      member.metrics.totalDuration,
      member.metrics.totalExecutions,
      member.metrics.successRate,
      member.metrics.tokenUsage,
      member.metrics.totalCost,
      member.status
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  /**
   * Perform cohort analysis
   */
  private performCohortAnalysis(cohort: CohortDefinition): CohortAnalysis {
    const members = this.getCohortMembers(cohort);
    const metrics = this.calculateCohortMetrics(members);
    const segments = this.segmentCohort(members);
    const trends = this.calculateCohortTrends(cohort, members);
    const retentionData = this.calculateRetentionRates(members, 'weekly', 12);

    return {
      cohortId: cohort.id,
      analysisId: uuidv4(),
      timestamp: Date.now(),
      cohortSize: members.length,
      members,
      metrics,
      segments,
      trends,
      retentionData
    };
  }

  /**
   * Get cohort members based on criteria
   */
  private getCohortMembers(cohort: CohortDefinition): CohortMember[] {
    const filters: AnalyticsFilters = {
      startTime: cohort.timeframe.startDate,
      endTime: cohort.timeframe.endDate || Date.now()
    };

    // Apply user attribute filters
    if (cohort.criteria.userAttributes?.organizationId) {
      filters.organizationId = cohort.criteria.userAttributes.organizationId;
    }

    const events = this.analyticsDAO.getEvents(filters);
    const userSessions = new Map<number, any>();

    // Group events by user
    events.forEach(event => {
      if (event.userId) {
        if (!userSessions.has(event.userId)) {
          userSessions.set(event.userId, {
            userId: event.userId,
            sessions: new Set(),
            events: [],
            firstActivity: event.timestamp,
            lastActivity: event.timestamp
          });
        }
        
        const userSession = userSessions.get(event.userId)!;
        userSession.sessions.add(event.sessionId);
        userSession.events.push(event);
        userSession.lastActivity = Math.max(userSession.lastActivity, event.timestamp);
      }
    });

    // Filter users based on criteria and create members
    const members: CohortMember[] = [];
    
    userSessions.forEach((userSession, userId) => {
      if (this.userMatchesCriteria(userSession, cohort.criteria)) {
        const member = this.createCohortMember(userSession);
        members.push(member);
      }
    });

    return members;
  }

  /**
   * Check if user matches cohort criteria
   */
  private userMatchesCriteria(userSession: any, criteria: CohortCriteria): boolean {
    // Check event criteria
    if (criteria.eventCriteria) {
      const { eventTypes, minOccurrences, maxOccurrences } = criteria.eventCriteria;
      const relevantEvents = userSession.events.filter((e: any) => eventTypes.includes(e.type));
      
      if (minOccurrences && relevantEvents.length < minOccurrences) {
        return false;
      }
      
      if (maxOccurrences && relevantEvents.length > maxOccurrences) {
        return false;
      }
    }

    // Check usage patterns
    if (criteria.usagePatterns) {
      const sessionCount = userSession.sessions.size;
      const totalDuration = userSession.lastActivity - userSession.firstActivity;
      
      if (criteria.usagePatterns.minSessions && sessionCount < criteria.usagePatterns.minSessions) {
        return false;
      }
      
      if (criteria.usagePatterns.maxSessions && sessionCount > criteria.usagePatterns.maxSessions) {
        return false;
      }
      
      if (criteria.usagePatterns.minDuration && totalDuration < criteria.usagePatterns.minDuration) {
        return false;
      }
      
      if (criteria.usagePatterns.maxDuration && totalDuration > criteria.usagePatterns.maxDuration) {
        return false;
      }
    }

    return true;
  }

  /**
   * Create cohort member from user session data
   */
  private createCohortMember(userSession: any): CohortMember {
    const executionEvents = userSession.events.filter((e: any) => e.type.includes('execution'));
    const successfulExecutions = executionEvents.filter((e: any) => e.metadata?.success);
    const tokenEvents = userSession.events.filter((e: any) => e.type === AnalyticsEventType.TOKEN_USAGE);
    
    const totalTokenUsage = tokenEvents.reduce((sum: number, e: any) => sum + (e.metadata?.totalTokens || 0), 0);
    const totalCost = tokenEvents.reduce((sum: number, e: any) => sum + (e.metadata?.estimatedCost || 0), 0);
    
    // Determine status based on recent activity
    const daysSinceLastActivity = (Date.now() - userSession.lastActivity) / (24 * 60 * 60 * 1000);
    let status: 'active' | 'inactive' | 'churned' = 'active';
    
    if (daysSinceLastActivity > 30) {
      status = 'churned';
    } else if (daysSinceLastActivity > 7) {
      status = 'inactive';
    }

    return {
      userId: userSession.userId,
      sessionId: Array.from(userSession.sessions)[0], // Use first session ID
      joinDate: userSession.firstActivity,
      lastActivity: userSession.lastActivity,
      metrics: {
        totalSessions: userSession.sessions.size,
        totalDuration: userSession.lastActivity - userSession.firstActivity,
        totalEvents: userSession.events.length,
        totalExecutions: executionEvents.length,
        successRate: executionEvents.length > 0 ? successfulExecutions.length / executionEvents.length : 0,
        tokenUsage: totalTokenUsage,
        totalCost
  }
      segments: [], // Would be populated by segmentation logic
      status
    };
  }

  /**
   * Calculate cohort metrics
   */
  private calculateCohortMetrics(members: CohortMember[]): CohortMetrics {
    if (members.length === 0) {
      return {
        totalUsers: 0,
        activeUsers: 0,
        churnedUsers: 0,
        averageSessionDuration: 0,
        averageExecutionsPerUser: 0,
        averageTokenUsagePerUser: 0,
        averageCostPerUser: 0,
        overallSuccessRate: 0,
        retentionRate: 0,
        engagementScore: 0
      };
    }

    const totalUsers = members.length;
    const activeUsers = members.filter(m => m.status === 'active').length;
    const churnedUsers = members.filter(m => m.status === 'churned').length;
    
    const totalSessions = members.reduce((sum, m) => sum + m.metrics.totalSessions, 0);
    const totalDuration = members.reduce((sum, m) => sum + m.metrics.totalDuration, 0);
    const totalExecutions = members.reduce((sum, m) => sum + m.metrics.totalExecutions, 0);
    const totalTokenUsage = members.reduce((sum, m) => sum + m.metrics.tokenUsage, 0);
    const totalCost = members.reduce((sum, m) => sum + m.metrics.totalCost, 0);
    const totalSuccessRate = members.reduce((sum, m) => sum + m.metrics.successRate, 0);
    
    const averageSessionDuration = totalSessions > 0 ? totalDuration / totalSessions : 0;
    const averageExecutionsPerUser = totalExecutions / totalUsers;
    const averageTokenUsagePerUser = totalTokenUsage / totalUsers;
    const averageCostPerUser = totalCost / totalUsers;
    const overallSuccessRate = totalSuccessRate / totalUsers;
    const retentionRate = activeUsers / totalUsers;
    
    // Calculate engagement score (composite metric)
    const engagementScore = Math.min(1, (
      (averageExecutionsPerUser / 10) * 0.3 +
      (retentionRate) * 0.4 +
      (overallSuccessRate) * 0.3
    ));

    return {
      totalUsers,
      activeUsers,
      churnedUsers,
      averageSessionDuration,
      averageExecutionsPerUser,
      averageTokenUsagePerUser,
      averageCostPerUser,
      overallSuccessRate,
      retentionRate,
      engagementScore
    };
  }

  /**
   * Segment cohort members
   */
  private segmentCohort(members: CohortMember[]): CohortSegment[] {
    const segments: CohortSegment[] = [];
    
    // Segment by usage level
    const lightUsers = members.filter(m => m.metrics.totalExecutions < 10);
    const mediumUsers = members.filter(m => m.metrics.totalExecutions >= 10 && m.metrics.totalExecutions < 50);
    const heavyUsers = members.filter(m => m.metrics.totalExecutions >= 50);
    
    if (lightUsers.length > 0) {
      segments.push(this.createSegment('light_users', 'Light Users', lightUsers, members.length));
    }
    
    if (mediumUsers.length > 0) {
      segments.push(this.createSegment('medium_users', 'Medium Users', mediumUsers, members.length));
    }
    
    if (heavyUsers.length > 0) {
      segments.push(this.createSegment('heavy_users', 'Heavy Users', heavyUsers, members.length));
    }

    // Segment by success rate
    const strugglingUsers = members.filter(m => m.metrics.successRate < 0.5);
    const proficientUsers = members.filter(m => m.metrics.successRate >= 0.8);
    
    if (strugglingUsers.length > 0) {
      segments.push(this.createSegment('struggling_users', 'Struggling Users', strugglingUsers, members.length));
    }
    
    if (proficientUsers.length > 0) {
      segments.push(this.createSegment('proficient_users', 'Proficient Users', proficientUsers, members.length));
    }

    return segments;
  }

  /**
   * Create segment from users
   */
  private createSegment(
    segmentId: string,
    name: string,
    segmentMembers: CohortMember[],
    totalMembers: number
  ): CohortSegment {
    const avgMetrics = {
      sessions: segmentMembers.reduce((sum, m) => sum + m.metrics.totalSessions, 0) / segmentMembers.length,
      duration: segmentMembers.reduce((sum, m) => sum + m.metrics.totalDuration, 0) / segmentMembers.length,
      executions: segmentMembers.reduce((sum, m) => sum + m.metrics.totalExecutions, 0) / segmentMembers.length,
      successRate: segmentMembers.reduce((sum, m) => sum + m.metrics.successRate, 0) / segmentMembers.length,
      tokenUsage: segmentMembers.reduce((sum, m) => sum + m.metrics.tokenUsage, 0) / segmentMembers.length
    };

    return {
      segmentId,
      name,
      description: `${name} segment with ${segmentMembers.length} members`,
      userCount: segmentMembers.length,
      percentage: (segmentMembers.length / totalMembers) * 100,
      avgMetrics,
      characteristics: [] // Would be populated with segment characteristics
    };
  }

  /**
   * Calculate cohort trends
   */
  private calculateCohortTrends(cohort: CohortDefinition, members: CohortMember[]): CohortTrend[] {
    // This would calculate trends over time
    // For now, return empty array
    return [];
  }

  /**
   * Calculate retention rates
   */
  private calculateRetentionRates(
    members: CohortMember[],
    periodType: 'daily' | 'weekly' | 'monthly',
    periods: number
  ): RetentionData {
    // This would calculate actual retention rates
    // For now, return mock data
    const retentionRates = Array.from({ length: periods }, (_, i) => 
      Array.from({ length: periods }, (_, j) => Math.max(0, 1 - (i + j) * 0.1))
    );

    return {
      cohortPeriod: periodType,
      periods: Array.from({ length: periods }, (_, i) => `Period ${i + 1}`),
      retentionRates,
      absoluteRetention: retentionRates.map(rates => rates.map(rate => Math.floor(rate * members.length))),
      averageRetention: retentionRates[0] || [],
      retentionCurve: retentionRates[0]?.map((rate, i) => ({
        period: i + 1,
        rate,
        users: Math.floor(rate * members.length)
      })) || []
    };
  }

  /**
   * Perform cohort comparison
   */
  private performCohortComparison(cohorts: Array<{ cohort: CohortDefinition; analysis: CohortAnalysis }>): CohortComparison {
    const comparison: CohortComparison = {
      comparisonId: uuidv4(),
      cohorts: cohorts.map(c => ({
        cohortId: c.cohort.id,
        name: c.cohort.name,
        size: c.analysis.cohortSize,
        metrics: c.analysis.metrics
      })),
      differences: [],
      insights: []
    };

    // Calculate differences between first two cohorts
    if (cohorts.length >= 2) {
      const cohort1 = cohorts[0].analysis.metrics;
      const cohort2 = cohorts[1].analysis.metrics;

      const metricComparisons = [
        { metric: 'retentionRate', cohort1Value: cohort1.retentionRate, cohort2Value: cohort2.retentionRate },
        { metric: 'engagementScore', cohort1Value: cohort1.engagementScore, cohort2Value: cohort2.engagementScore },
        { metric: 'overallSuccessRate', cohort1Value: cohort1.overallSuccessRate, cohort2Value: cohort2.overallSuccessRate },
        { metric: 'averageTokenUsagePerUser', cohort1Value: cohort1.averageTokenUsagePerUser, cohort2Value: cohort2.averageTokenUsagePerUser }
      ];

      comparison.differences = metricComparisons.map(comp => {
        const difference = comp.cohort2Value - comp.cohort1Value;
        const percentageChange = comp.cohort1Value > 0 ? (difference / comp.cohort1Value) * 100 : 0;
        const significance = Math.abs(percentageChange) > 20 ? 'high' : 
          Math.abs(percentageChange) > 10 ? 'medium' : 'low';

        return {
          metric: comp.metric,
          cohort1Value: comp.cohort1Value,
          cohort2Value: comp.cohort2Value,
          difference,
          percentageChange,
          significance
        };
      });
    }

    return comparison;
  }

  /**
   * Setup cohort refresh timer
   */
  private setupCohortRefresh(cohortId: string, interval: number): void {
    const timer = setInterval(() => {
      this.analyzeCohort(cohortId, false); // Force refresh
    }, interval);

    this.refreshTimers.set(cohortId, timer);
  }

  /**
   * Setup periodic analysis for all active cohorts
   */
  private setupPeriodicAnalysis(): void {
    setInterval(() => {
      this.cohortDefinitions.forEach((cohort) => {
        if (cohort.isActive && !cohort.refreshInterval) {
          // Analyze cohorts without custom refresh intervals daily
          this.analyzeCohort(cohort.id, false);
        }
      });
    }, 24 * 60 * 60 * 1000); // Daily
  }
}