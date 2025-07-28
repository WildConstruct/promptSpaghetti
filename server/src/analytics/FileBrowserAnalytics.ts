/**
 * File Browser Analytics Service
 * 
 * Comprehensive analytics tracking for file browser operations including:
 * - File operations (open, download, upload, delete, etc.)
 * - User behavior patterns
 * - Download statistics and usage metrics
 * - Developer insights for file browser system improvement
 * 
 * Task: T-1752989144373-75 - Integrate usage analytics & download stats for developers
 */

import { EventEmitter } from 'events';
import { AnalyticsCollector, AnalyticsEvent, AnalyticsEventType } from './AnalyticsCollector';
import { v4 as uuidv4 } from 'uuid';

/**
 * File browser specific event types
 */
export enum FileBrowserEventType {
  // File operations
  FILE_OPENED = 'file_browser_file_opened',
  FILE_DOWNLOADED = 'file_browser_file_downloaded', 
  FILE_UPLOADED = 'file_browser_file_uploaded',
  FILE_DELETED = 'file_browser_file_deleted',
  FILE_RENAMED = 'file_browser_file_renamed',
  FILE_DUPLICATED = 'file_browser_file_duplicated',
  FILE_MOVED = 'file_browser_file_moved',
  FILE_COPIED = 'file_browser_file_copied',
  
  // Folder operations
  FOLDER_CREATED = 'file_browser_folder_created',
  FOLDER_OPENED = 'file_browser_folder_opened',
  FOLDER_COLLAPSED = 'file_browser_folder_collapsed',
  FOLDER_EXPANDED = 'file_browser_folder_expanded',
  
  // Search and navigation
  SEARCH_PERFORMED = 'file_browser_search_performed',
  SEARCH_RESULT_CLICKED = 'file_browser_search_result_clicked',
  NAVIGATION_PATH_CHANGED = 'file_browser_navigation_path_changed',
  
  // UI interactions
  CONTEXT_MENU_OPENED = 'file_browser_context_menu_opened',
  BULK_OPERATION_PERFORMED = 'file_browser_bulk_operation_performed',
  DRAG_DROP_OPERATION = 'file_browser_drag_drop_operation',
  
  // Performance and errors
  OPERATION_PERFORMANCE = 'file_browser_operation_performance',
  OPERATION_ERROR = 'file_browser_operation_error',
  LOAD_TIME_MEASURED = 'file_browser_load_time_measured',
  
  // User engagement
  SESSION_STARTED = 'file_browser_session_started',
  SESSION_ENDED = 'file_browser_session_ended',
  FEATURE_USED = 'file_browser_feature_used'
}

/**
 * File operation event data
 */
}
export interface FileOperationEvent extends AnalyticsEvent {
  type: FileBrowserEventType;
  metadata: {
    fileId?: string;
    fileName: string;
    filePath: string;
    fileSize?: number;
    fileType: string;
    operationType: string;
    success: boolean;
    errorMessage?: string;
    duration?: number;
    userAgent?: string;
    clientType?: 'web' | 'mobile' | 'api';
  };
}

/**
 * Download statistics aggregation
 */
}
export interface DownloadStats {
  fileId: string;
  fileName: string;
  filePath: string;
  totalDownloads: number;
  uniqueUsers: number;
  lastDownloaded: Date;
  firstDownloaded: Date;
  averageFileSize: number;
  downloadsByTimeframe: {
    hourly: Map<string, number>;
    daily: Map<string, number>;
    weekly: Map<string, number>;
    monthly: Map<string, number>;
}
  };
  downloadsByUserAgent: Map<string, number>;
  downloadsByLocation: Map<string, number>;
  peakDownloadHour: number;
  downloadVelocity: number; // downloads per hour trend
}

/**
 * Usage analytics aggregation
 */
}
export interface UsageAnalytics {
  timeframe: {
    startDate: Date;
    endDate: Date;
}
  };
  overview: {
    totalOperations: number;
    uniqueUsers: number;
    uniqueSessions: number;
    totalFilesAccessed: number;
    totalDownloads: number;
    totalUploads: number;
    averageSessionDuration: number;
    errorRate: number;
  };
  operationBreakdown: Map<string, number>;
  fileTypePopularity: Map<string, number>;
  searchMetrics: {
    totalSearches: number;
    uniqueSearchTerms: number;
    averageResultsClicked: number;
    topSearchTerms: Array<{ term: string; count: number; successRate: number }>;
  };
  performanceMetrics: {
    averageLoadTime: number;
    averageOperationTime: number;
    slowestOperations: Array<{ operation: string; averageTime: number }>;
  };
  userBehaviorPatterns: {
    mostUsedFeatures: Array<{ feature: string; usageCount: number }>;
    commonUserFlows: Array<{ flow: string[]; frequency: number }>;
    peakUsageHours: number[];
  };
}

/**
 * Developer insights for file browser optimization
 */
}
export interface DeveloperInsights {
  systemHealth: {
    overallScore: number; // 0-100
    reliability: number;
    performance: number;
    usability: number;
}
  };
  recommendations: Array<{
    category: 'performance' | 'usability' | 'features' | 'security';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    impact: string;
    effort: 'low' | 'medium' | 'high';
    metrics: Record<string, number>;
  }>;
  alerts: Array<{
    severity: 'critical' | 'warning' | 'info';
    category: string;
    message: string;
    timestamp: Date;
    affectedUsers: number;
    suggestedAction: string;
  }>;
  trends: {
    usageGrowth: number; // percentage change
    errorRateChange: number;
    performanceChange: number;
    userSatisfactionTrend: number;
  };
}

/**
 * Configuration for file browser analytics
 */
}
export interface FileBrowserAnalyticsConfig {
  enabled: boolean;
  trackDownloads: boolean;
  trackSearches: boolean;
  trackPerformance: boolean;
  aggregationInterval: number; // milliseconds
  retentionPeriod: number; // milliseconds
  anonymizeUserData: boolean;
  generateInsights: boolean;
  insightGenerationInterval: number; // milliseconds
}
}

/**
 * File Browser Analytics Service
 */
export class FileBrowserAnalytics extends EventEmitter {
  private analyticsCollector: AnalyticsCollector;
  private config: FileBrowserAnalyticsConfig;
  private downloadStats: Map<string, DownloadStats> = new Map();
  private sessionData: Map<string, any> = new Map();
  private aggregationTimer: NodeJS.Timeout | null = null;
  private insightTimer: NodeJS.Timeout | null = null;

  constructor(
    analyticsCollector: AnalyticsCollector,
    config: Partial<FileBrowserAnalyticsConfig> = {}
  ) {
    super();
    
    this.analyticsCollector = analyticsCollector;
    this.config = {
      enabled: true,
      trackDownloads: true,
      trackSearches: true,
      trackPerformance: true,
      aggregationInterval: 60000, // 1 minute
      retentionPeriod: 30 * 24 * 60 * 60 * 1000, // 30 days
      anonymizeUserData: true,
      generateInsights: true,
      insightGenerationInterval: 3600000, // 1 hour
      ...config
    };

    if (this.config.enabled) {
      this.startAnalytics();
    }
  }

  /**
   * Start file browser analytics collection
   */
  private startAnalytics(): void {
    console.log('Starting file browser analytics collection');
    
    // Start aggregation timer
    if (this.config.aggregationInterval > 0) {
      this.aggregationTimer = setInterval(() => {
        this.aggregateStats();
      }, this.config.aggregationInterval);
    }

    // Start insights generation timer
    if (this.config.generateInsights && this.config.insightGenerationInterval > 0) {
      this.insightTimer = setInterval(() => {
        this.generateInsights();
      }, this.config.insightGenerationInterval);
    }

    this.emit('analytics_started');
  }

  /**
   * Stop analytics collection
   */
  stopAnalytics(): void {
    console.log('Stopping file browser analytics collection');

    if (this.aggregationTimer) {
      clearInterval(this.aggregationTimer);
      this.aggregationTimer = null;
    }

    if (this.insightTimer) {
      clearInterval(this.insightTimer);
      this.insightTimer = null;
    }

    this.emit('analytics_stopped');
  }

  /**
   * Track file operation
   */
  trackFileOperation(
    operationType: string,
    fileName: string,
    filePath: string,
    success: boolean = true,
    metadata: Record<string, any> = {}
  ): void {
    if (!this.config.enabled) return;

    const event: FileOperationEvent = {
      id: uuidv4(),
      type: this.mapOperationToEventType(operationType),
      timestamp: Date.now(),
      sessionId: metadata.sessionId || 'unknown',
      userId: this.config.anonymizeUserData ? this.hashUserId(metadata.userId) : metadata.userId,
      metadata: {
        fileName,
        filePath,
        fileSize: metadata.fileSize,
        fileType: this.extractFileType(fileName),
        operationType,
        success,
        errorMessage: metadata.errorMessage,
        duration: metadata.duration,
        userAgent: metadata.userAgent,
        clientType: metadata.clientType || 'web'
      }
    };

    // Record with main analytics collector
    this.analyticsCollector.recordEvent(event);

    // Update download stats if this is a download operation
    if (operationType === 'download' && this.config.trackDownloads) {
      this.updateDownloadStats(fileName, filePath, metadata);
    }

    this.emit('operation_tracked', event);
  }

  /**
   * Track search operation
   */
  trackSearch(
    searchTerm: string,
    resultsCount: number,
    clickedResults: number = 0,
    metadata: Record<string, any> = {}
  ): void {
    if (!this.config.enabled || !this.config.trackSearches) return;

    const searchEvent: FileOperationEvent = {
      id: uuidv4(),
      type: FileBrowserEventType.SEARCH_PERFORMED,
      timestamp: Date.now(),
      sessionId: metadata.sessionId || 'unknown',
      userId: this.config.anonymizeUserData ? this.hashUserId(metadata.userId) : metadata.userId,
      metadata: {
        fileName: '',
        filePath: '',
        fileType: 'search',
        operationType: 'search',
        success: resultsCount > 0,
        searchTerm: this.config.anonymizeUserData ? this.hashSearchTerm(searchTerm) : searchTerm,
        resultsCount,
        clickedResults,
        duration: metadata.duration,
        userAgent: metadata.userAgent,
        clientType: metadata.clientType || 'web'
      }
    };

    this.analyticsCollector.recordEvent(searchEvent);
    this.emit('search_tracked', searchEvent);
  }

  /**
   * Track performance metric
   */
  trackPerformance(
    operationType: string,
    duration: number,
    success: boolean = true,
    metadata: Record<string, any> = {}
  ): void {
    if (!this.config.enabled || !this.config.trackPerformance) return;

    const performanceEvent: FileOperationEvent = {
      id: uuidv4(),
      type: FileBrowserEventType.OPERATION_PERFORMANCE,
      timestamp: Date.now(),
      sessionId: metadata.sessionId || 'unknown',
      userId: this.config.anonymizeUserData ? this.hashUserId(metadata.userId) : metadata.userId,
      metadata: {
        fileName: metadata.fileName || '',
        filePath: metadata.filePath || '',
        fileType: 'performance',
        operationType,
        success,
        duration,
        userAgent: metadata.userAgent,
        clientType: metadata.clientType || 'web'
      }
    };

    this.analyticsCollector.recordEvent(performanceEvent);
    this.emit('performance_tracked', performanceEvent);
  }

  /**
   * Get download statistics for a specific file
   */
  getFileDownloadStats(filePath: string): DownloadStats | null {
    return this.downloadStats.get(filePath) || null;
  }

  /**
   * Get aggregated usage analytics for a time period
   */
  async getUsageAnalytics(
    startDate: Date,
    endDate: Date
  ): Promise<UsageAnalytics> {

    const window = this.analyticsCollector.getAnalyticsWindow(
      startDate.getTime(),
      endDate.getTime()
    );

    const fileBrowserEvents = window.events.filter(event => 
      Object.values(FileBrowserEventType).includes(event.type as FileBrowserEventType)
    ) as FileOperationEvent[];

    // Calculate metrics
    const uniqueUsers = new Set(fileBrowserEvents.map(e => e.userId).filter(Boolean));
    const uniqueSessions = new Set(fileBrowserEvents.map(e => e.sessionId));
    const uniqueFiles = new Set(fileBrowserEvents.map(e => e.metadata.filePath));
    
    const operationCounts = new Map<string, number>();
    const fileTypeCounts = new Map<string, number>();
    const searchData = {
      totalSearches: 0,
      searchTerms: new Set<string>(),
      totalClicked: 0
    };
    const performanceData: number[] = [];
    
    let totalDownloads = 0;
    let totalUploads = 0;
    let errorCount = 0;

    fileBrowserEvents.forEach(event => {
      // Operation breakdown
      const operation = event.metadata.operationType;
      operationCounts.set(operation, (operationCounts.get(operation) || 0) + 1);

      // File type popularity
      if (event.metadata.fileType && event.metadata.fileType !== 'search' && event.metadata.fileType !== 'performance') {
        fileTypeCounts.set(event.metadata.fileType, (fileTypeCounts.get(event.metadata.fileType) || 0) + 1);
      }

      // Count specific operations
      if (operation === 'download') totalDownloads++;
      if (operation === 'upload') totalUploads++;
      if (!event.metadata.success) errorCount++;

      // Search metrics
      if (event.type === FileBrowserEventType.SEARCH_PERFORMED) {
        searchData.totalSearches++;
        if (event.metadata.searchTerm) {
          searchData.searchTerms.add(event.metadata.searchTerm);
        }
        if (event.metadata.clickedResults) {
          searchData.totalClicked += event.metadata.clickedResults;
        }
      }

      // Performance data
      if (event.metadata.duration && event.metadata.duration > 0) {
        performanceData.push(event.metadata.duration);
      }
    });

    const averageLoadTime = performanceData.length > 0 
      ? performanceData.reduce((a, b) => a + b, 0) / performanceData.length 
      : 0;

    return {
      timeframe: { startDate, endDate },
      overview: {
        totalOperations: fileBrowserEvents.length,
        uniqueUsers: uniqueUsers.size,
        uniqueSessions: uniqueSessions.size,
        totalFilesAccessed: uniqueFiles.size,
        totalDownloads,
        totalUploads,
        averageSessionDuration: 0, // TODO: Calculate from session data
        errorRate: fileBrowserEvents.length > 0 ? (errorCount / fileBrowserEvents.length) * 100 : 0
  }
      operationBreakdown: operationCounts,
      fileTypePopularity: fileTypeCounts,
      searchMetrics: {
        totalSearches: searchData.totalSearches,
        uniqueSearchTerms: searchData.searchTerms.size,
        averageResultsClicked: searchData.totalSearches > 0 ? searchData.totalClicked / searchData.totalSearches : 0,
        topSearchTerms: [] // TODO: Implement top search terms aggregation
  }
      performanceMetrics: {
        averageLoadTime,
        averageOperationTime: averageLoadTime,
        slowestOperations: [] // TODO: Implement slowest operations tracking
  }
      userBehaviorPatterns: {
        mostUsedFeatures: Array.from(operationCounts.entries()).map(([feature, count]) => ({ feature, usageCount: count })),
        commonUserFlows: [], // TODO: Implement user flow analysis
        peakUsageHours: [] // TODO: Implement peak usage hour analysis
      }
    };
  }

  /**
   * Generate developer insights
   */
  async generateInsights(): Promise<DeveloperInsights> {

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const analytics = await this.getUsageAnalytics(oneWeekAgo, now);

    const insights: DeveloperInsights = {
      systemHealth: {
        overallScore: this.calculateOverallScore(analytics),
        reliability: Math.max(0, 100 - analytics.overview.errorRate),
        performance: this.calculatePerformanceScore(analytics),
        usability: this.calculateUsabilityScore(analytics)
  }
      recommendations: this.generateRecommendations(analytics),
      alerts: this.generateAlerts(analytics),
      trends: {
        usageGrowth: 0, // TODO: Calculate week-over-week growth
        errorRateChange: 0, // TODO: Calculate error rate change
        performanceChange: 0, // TODO: Calculate performance change
        userSatisfactionTrend: 0 // TODO: Calculate user satisfaction trend
      }
    };

    this.emit('insights_generated', insights);
    return insights;
  }

  /**
   * Private helper methods
   */
  
  private mapOperationToEventType(operationType: string): FileBrowserEventType {
    const mapping: Record<string, FileBrowserEventType> = {
      'open': FileBrowserEventType.FILE_OPENED,
      'download': FileBrowserEventType.FILE_DOWNLOADED,
      'upload': FileBrowserEventType.FILE_UPLOADED,
      'delete': FileBrowserEventType.FILE_DELETED,
      'rename': FileBrowserEventType.FILE_RENAMED,
      'duplicate': FileBrowserEventType.FILE_DUPLICATED,
      'move': FileBrowserEventType.FILE_MOVED,
      'copy': FileBrowserEventType.FILE_COPIED,
      'create_folder': FileBrowserEventType.FOLDER_CREATED,
      'expand_folder': FileBrowserEventType.FOLDER_EXPANDED,
      'collapse_folder': FileBrowserEventType.FOLDER_COLLAPSED,
      'search': FileBrowserEventType.SEARCH_PERFORMED
    };

    return mapping[operationType] || FileBrowserEventType.FILE_OPENED;
  }

  private extractFileType(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return extension || 'unknown';
  }

  private updateDownloadStats(fileName: string, filePath: string, metadata: any): void {
    let stats = this.downloadStats.get(filePath);
    
    if (!stats) {
      stats = {
        fileId: filePath,
        fileName,
        filePath,
        totalDownloads: 0,
        uniqueUsers: 0,
        lastDownloaded: new Date(),
        firstDownloaded: new Date(),
        averageFileSize: metadata.fileSize || 0,
        downloadsByTimeframe: {
          hourly: new Map(),
          daily: new Map(),
          weekly: new Map(),
          monthly: new Map()
  }
        downloadsByUserAgent: new Map(),
        downloadsByLocation: new Map(),
        peakDownloadHour: 0,
        downloadVelocity: 0
      };
    }

    stats.totalDownloads++;
    stats.lastDownloaded = new Date();
    
    // Update timeframe stats
    const now = new Date();
    const hourKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}`;
    const dayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
    const weekKey = `${now.getFullYear()}-${Math.floor(now.getDate() / 7)}`;
    const monthKey = `${now.getFullYear()}-${now.getMonth()}`;

    stats.downloadsByTimeframe.hourly.set(hourKey, (stats.downloadsByTimeframe.hourly.get(hourKey) || 0) + 1);
    stats.downloadsByTimeframe.daily.set(dayKey, (stats.downloadsByTimeframe.daily.get(dayKey) || 0) + 1);
    stats.downloadsByTimeframe.weekly.set(weekKey, (stats.downloadsByTimeframe.weekly.get(weekKey) || 0) + 1);
    stats.downloadsByTimeframe.monthly.set(monthKey, (stats.downloadsByTimeframe.monthly.get(monthKey) || 0) + 1);

    // Update user agent stats
    if (metadata.userAgent) {
      stats.downloadsByUserAgent.set(metadata.userAgent, (stats.downloadsByUserAgent.get(metadata.userAgent) || 0) + 1);
    }

    this.downloadStats.set(filePath, stats);
  }

  private hashUserId(userId: string | undefined): string | undefined {
    if (!userId) return undefined;
    // Simple hash for anonymization
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  private hashSearchTerm(searchTerm: string): string {
    // Replace with generic terms to protect privacy
    return searchTerm.length > 0 ? `search_term_${searchTerm.length}_chars` : 'empty_search';
  }

  private calculateOverallScore(analytics: UsageAnalytics): number {
    const reliability = Math.max(0, 100 - analytics.overview.errorRate);
    const performance = this.calculatePerformanceScore(analytics);
    const usability = this.calculateUsabilityScore(analytics);
    
    return Math.round((reliability + performance + usability) / 3);
  }

  private calculatePerformanceScore(analytics: UsageAnalytics): number {
    const avgTime = analytics.performanceMetrics.averageLoadTime;
    if (avgTime === 0) return 100;
    
    // Score based on load time: <500ms = 100, >5000ms = 0
    return Math.max(0, Math.min(100, 100 - (avgTime - 500) / 45));
  }

  private calculateUsabilityScore(analytics: UsageAnalytics): number {
    const searchSuccessRate = analytics.searchMetrics.totalSearches > 0 
      ? (analytics.searchMetrics.averageResultsClicked / analytics.searchMetrics.totalSearches) * 100 
      : 50;
    
    return Math.min(100, searchSuccessRate + 50);
  }

  private generateRecommendations(analytics: UsageAnalytics): DeveloperInsights['recommendations'] {
    const recommendations: DeveloperInsights['recommendations'] = [];

    // Performance recommendations
    if (analytics.performanceMetrics.averageLoadTime > 2000) {
      recommendations.push({
        category: 'performance',
        priority: 'high',
        title: 'Slow File Browser Load Times',
        description: 'Average load time exceeds 2 seconds, affecting user experience',
        impact: 'Users may abandon operations or perceive the system as slow',
        effort: 'medium',
        metrics: { averageLoadTime: analytics.performanceMetrics.averageLoadTime }
      });
    }

    // Error rate recommendations
    if (analytics.overview.errorRate > 5) {
      recommendations.push({
        category: 'security',
        priority: 'high',
        title: 'High Error Rate in File Operations',
        description: 'Error rate exceeds acceptable threshold',
        impact: 'Users experiencing frequent failures, potential data loss',
        effort: 'high',
        metrics: { errorRate: analytics.overview.errorRate }
      });
    }

    // Usage pattern recommendations
    if (analytics.searchMetrics.totalSearches < analytics.overview.totalOperations * 0.1) {
      recommendations.push({
        category: 'usability',
        priority: 'medium',
        title: 'Low Search Feature Usage',
        description: 'Search feature is underutilized compared to total operations',
        impact: 'Users may have difficulty finding files, affecting productivity',
        effort: 'low',
        metrics: { searchUsageRatio: (analytics.searchMetrics.totalSearches / analytics.overview.totalOperations) * 100 }
      });
    }

    return recommendations;
  }

  private generateAlerts(analytics: UsageAnalytics): DeveloperInsights['alerts'] {
    const alerts: DeveloperInsights['alerts'] = [];

    // Critical error rate alert
    if (analytics.overview.errorRate > 10) {
      alerts.push({
        severity: 'critical',
        category: 'reliability',
        message: `File browser error rate at ${analytics.overview.errorRate.toFixed(1)}% - immediate attention required`,
        timestamp: new Date(),
        affectedUsers: analytics.overview.uniqueUsers,
        suggestedAction: 'Review error logs and implement immediate fixes for most common failure patterns'
      });
    }

    // Performance degradation alert
    if (analytics.performanceMetrics.averageLoadTime > 5000) {
      alerts.push({
        severity: 'warning',
        category: 'performance',
        message: `File browser load times averaging ${analytics.performanceMetrics.averageLoadTime}ms - optimization needed`,
        timestamp: new Date(),
        affectedUsers: analytics.overview.uniqueUsers,
        suggestedAction: 'Implement caching, optimize database queries, or reduce payload sizes'
      });
    }

    return alerts;
  }

  private aggregateStats(): void {
    // Periodic aggregation of statistics
    this.emit('stats_aggregated', {
      timestamp: Date.now(),
      downloadStatsCount: this.downloadStats.size,
      sessionCount: this.sessionData.size
    });
  }

  /**
   * Export analytics data
   */
  exportAnalyticsData(format: 'json' | 'csv' = 'json'): string {
    const data = {
      exportTimestamp: Date.now(),
      config: this.config,
      downloadStats: Array.from(this.downloadStats.entries()),
      sessionData: Array.from(this.sessionData.entries())
    };

    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    }

    // CSV export implementation would go here
    return 'CSV export not yet implemented';
  }
}