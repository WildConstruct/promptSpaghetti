import { EventEmitter } from 'events';
import { PerformanceDashboard, DashboardData } from '../performance/PerformanceDashboard';
import { MetricsCollector } from '../performance/MetricsCollector';
import { AnalyticsCollector, AnalyticsWindow } from './AnalyticsCollector';
import { AnalyticsDAO, AnalyticsSummary, AnalyticsFilters } from '../database/analytics-dao';
import { CostTracker, BudgetConfig, CostAlert } from './CostTracker';

/**
 * Analytics dashboard configuration
 */
export interface AnalyticsDashboardConfig {
  refreshInterval: number;
  historyWindow: number;
  realTimeEnabled: boolean;
  costTrackingEnabled: boolean;
  heatMapEnabled: boolean;
  exportFormats: string[];
}

/**
 * Analytics dashboard data structure
 */
export interface AnalyticsDashboardData extends DashboardData {
  analytics: {
    summary: AnalyticsSummary;
    executions: {
      total: number;
      successful: number;
      failed: number;
      averageTime: number;
    };
    usage: {
      totalUsers: number;
      activeSessions: number;
      popularNodes: Array<{ type: string; count: number }>;
      topGraphs: Array<{ id: string; executions: number }>;
    };
    costs: {
      totalSpent: number;
      dailyAverage: number;
      topProviders: Array<{ provider: string; cost: number }>;
      budgetAlerts: CostAlert[];
    };
    patterns: {
      hourlyUsage: Array<{ hour: number; count: number }>;
      userJourneys: Array<{ path: string; count: number }>;
      errorHotspots: Array<{ type: string; count: number }>;
    };
  };
}

/**
 * Heat map data point
 */
export interface HeatMapPoint {
  x: number;
  y: number;
  intensity: number;
  interactions: number;
}

/**
 * Usage pattern data
 */
export interface UsagePattern {
  type: 'hourly' | 'daily' | 'weekly';
  data: Array<{ period: string; value: number }>;
  trend: 'increasing' | 'decreasing' | 'stable';
  changePercent: number;
}

/**
 * Enhanced analytics dashboard extending the performance dashboard
 */
export class AnalyticsDashboard extends EventEmitter {
  private performanceDashboard: PerformanceDashboard;
  private analyticsCollector: AnalyticsCollector;
  private analyticsDAO: AnalyticsDAO;
  private costTracker: CostTracker;
  private config: AnalyticsDashboardConfig;
  private dashboardClients: Set<any> = new Set();
  private refreshTimer: NodeJS.Timeout | null = null;
  private isActive: boolean = false;

  constructor(
    performanceDashboard: PerformanceDashboard,
    analyticsCollector: AnalyticsCollector,
    analyticsDAO: AnalyticsDAO,
    costTracker: CostTracker,
    config?: Partial<AnalyticsDashboardConfig>
  ) {
    super();
    
    this.performanceDashboard = performanceDashboard;
    this.analyticsCollector = analyticsCollector;
    this.analyticsDAO = analyticsDAO;
    this.costTracker = costTracker;
    
    this.config = {
      refreshInterval: 5000, // 5 seconds
      historyWindow: 3600000, // 1 hour
      realTimeEnabled: true,
      costTrackingEnabled: true,
      heatMapEnabled: true,
      exportFormats: ['json', 'csv', 'pdf'],
      ...config
    };

    this.setupEventListeners();
  }

  /**
   * Start the analytics dashboard
   */
  start(): void {
    if (this.isActive) return;

    this.isActive = true;
    console.log('Starting analytics dashboard');

    // Start the underlying performance dashboard
    this.performanceDashboard.start();

    if (this.config.realTimeEnabled) {
      this.refreshTimer = setInterval(() => {
        this.broadcastAnalyticsUpdate();
      }, this.config.refreshInterval);
    }

    this.emit('dashboard_started');
  }

  /**
   * Stop the analytics dashboard
   */
  stop(): void {
    if (!this.isActive) return;

    this.isActive = false;
    console.log('Stopping analytics dashboard');

    this.performanceDashboard.stop();

    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }

    this.emit('dashboard_stopped');
  }

  /**
   * Add a dashboard client
   */
  addClient(client: any): void {
    this.dashboardClients.add(client);
    
    // Send initial analytics data
    const analyticsData = this.generateAnalyticsDashboardData();
    this.sendToClient(client, analyticsData);
    
    this.emit('analytics_client_connected', { clientCount: this.dashboardClients.size });
  }

  /**
   * Remove a dashboard client
   */
  removeClient(client: any): void {
    this.dashboardClients.delete(client);
    this.emit('analytics_client_disconnected', { clientCount: this.dashboardClients.size });
  }

  /**
   * Get current analytics dashboard data
   */
  getAnalyticsDashboardData(): AnalyticsDashboardData {
    return this.generateAnalyticsDashboardData();
  }

  /**
   * Get analytics summary for a time period
   */
  getAnalyticsSummary(
    startTime: number,
    endTime: number,
    filters?: AnalyticsFilters
  ): AnalyticsSummary {
    const analyticsFilters: AnalyticsFilters = {
      startTime,
      endTime,
      ...filters
    };
    
    return this.analyticsDAO.getAnalyticsSummary(analyticsFilters);
  }

  /**
   * Get heat map data for canvas interactions
   */
  getHeatMapData(
    startTime: number,
    endTime: number,
    granularity: number = 50
  ): HeatMapPoint[] {
    if (!this.config.heatMapEnabled) {
      return [];
    }

    const filters: AnalyticsFilters = { startTime, endTime };
    const rawData = this.analyticsDAO.getHeatMapData(filters);
    
    return rawData.map(point => ({
      x: point.x,
      y: point.y,
      intensity: point.intensity,
      interactions: point.intensity
    }));
  }

  /**
   * Get usage patterns for different time periods
   */
  getUsagePatterns(type: 'hourly' | 'daily' | 'weekly'): UsagePattern {
    const endTime = Date.now();
    let startTime: number;
    let granularity: 'hour' | 'day';

    switch (type) {
      case 'hourly':
        startTime = endTime - (24 * 60 * 60 * 1000); // Last 24 hours
        granularity = 'hour';
        break;
      case 'daily':
        startTime = endTime - (30 * 24 * 60 * 60 * 1000); // Last 30 days
        granularity = 'day';
        break;
      case 'weekly':
        startTime = endTime - (12 * 7 * 24 * 60 * 60 * 1000); // Last 12 weeks
        granularity = 'day';
        break;
    }

    const timeSeriesData = this.analyticsDAO.getTimeSeriesData(
      'executions',
      granularity,
      { startTime, endTime }
    );

    // Calculate trend
    const recent = timeSeriesData.slice(-Math.floor(timeSeriesData.length / 2));
    const earlier = timeSeriesData.slice(0, Math.floor(timeSeriesData.length / 2));
    
    const recentAvg = recent.reduce((sum, d) => sum + d.value, 0) / recent.length;
    const earlierAvg = earlier.reduce((sum, d) => sum + d.value, 0) / earlier.length;
    
    const changePercent = earlierAvg > 0 ? ((recentAvg - earlierAvg) / earlierAvg) * 100 : 0;
    const trend = changePercent > 5 ? 'increasing' : changePercent < -5 ? 'decreasing' : 'stable';

    return {
      type,
      data: timeSeriesData.map(d => ({
        period: new Date(d.timestamp).toISOString(),
        value: d.value
      })),
      trend,
      changePercent: Math.abs(changePercent)
    };
  }

  /**
   * Get cost analysis data
   */
  getCostAnalysis(
    startTime: number,
    endTime: number,
    userId?: number,
    organizationId?: number
  ): any {
    if (!this.config.costTrackingEnabled) {
      return null;
    }

    const summary = this.costTracker.getCostSummary(startTime, endTime, userId, organizationId);
    const forecast = this.costTracker.forecastCosts(30, userId, organizationId);
    const budgets = this.costTracker.getBudgets(userId, organizationId);
    const alerts = this.costTracker.getActiveAlerts();
    const recommendations = this.costTracker.getEfficiencyRecommendations(userId, organizationId);

    return {
      summary,
      forecast,
      budgets,
      alerts,
      recommendations,
      trends: {
        daily: this.analyticsDAO.getTimeSeriesData('cost', 'day', { startTime, endTime }),
        hourly: this.analyticsDAO.getTimeSeriesData('cost', 'hour', { 
          startTime: endTime - (24 * 60 * 60 * 1000), 
          endTime 
        })
      }
    };
  }

  /**
   * Generate comprehensive analytics report
   */
  generateAnalyticsReport(
    startTime: number,
    endTime: number,
    format: 'json' | 'html' | 'pdf' = 'json'
  ): string {
    const summary = this.getAnalyticsSummary(startTime, endTime);
    const costAnalysis = this.getCostAnalysis(startTime, endTime);
    const patterns = {
      hourly: this.getUsagePatterns('hourly'),
      daily: this.getUsagePatterns('daily'),
      weekly: this.getUsagePatterns('weekly')
    };
    const heatMapData = this.getHeatMapData(startTime, endTime);

    const reportData = {
      generatedAt: Date.now(),
      period: { startTime, endTime },
      summary,
      costAnalysis,
      patterns,
      heatMapData,
      metadata: {
        format,
        version: '1.0',
        totalEvents: summary.totalEvents,
        uniqueUsers: summary.uniqueUsers
      }
    };

    switch (format) {
      case 'json':
        return JSON.stringify(reportData, null, 2);
      
      case 'html':
        return this.generateHTMLReport(reportData);
      
      case 'pdf':
        // Would integrate with PDF generation library
        return JSON.stringify(reportData, null, 2);
      
      default:
        return JSON.stringify(reportData, null, 2);
    }
  }

  /**
   * Generate HTML analytics dashboard
   */
  generateHTMLDashboard(): string {
    const analyticsData = this.generateAnalyticsDashboardData();
    const performanceHTML = this.performanceDashboard.generateHTML();
    
    // Inject analytics sections into the performance dashboard HTML
    const analyticsSection = this.generateAnalyticsHTMLSection(analyticsData);
    
    return performanceHTML.replace(
      '<div class="recommendations">',
      `${analyticsSection}<div class="recommendations">`
    );
  }

  /**
   * Setup event listeners for real-time updates
   */
  private setupEventListeners(): void {
    // Listen to analytics events
    this.analyticsCollector.on('event_recorded', (event) => {
      if (this.config.realTimeEnabled && this.dashboardClients.size > 0) {
        this.emit('analytics_event', event);
      }
    });

    // Listen to cost tracking events
    this.costTracker.on('budget_alert', (alert) => {
      this.broadcastAlert('budget_alert', alert);
    });

    this.costTracker.on('cost_calculated', (costCalc) => {
      if (this.config.realTimeEnabled) {
        this.emit('cost_update', costCalc);
      }
    });

    // Listen to performance dashboard events
    this.performanceDashboard.on('dashboard_updated', () => {
      if (this.isActive) {
        this.broadcastAnalyticsUpdate();
      }
    });
  }

  /**
   * Generate comprehensive analytics dashboard data
   */
  private generateAnalyticsDashboardData(): AnalyticsDashboardData {
    const performanceData = this.performanceDashboard.getDashboardData();
    const endTime = Date.now();
    const startTime = endTime - this.config.historyWindow;
    
    const summary = this.getAnalyticsSummary(startTime, endTime);
    const costAnalysis = this.getCostAnalysis(startTime, endTime);
    const patterns = this.getUsagePatterns('hourly');

    return {
      ...performanceData,
      analytics: {
        summary,
        executions: {
          total: summary.totalGraphExecutions,
          successful: Math.round(summary.totalGraphExecutions * summary.successRate / 100),
          failed: Math.round(summary.totalGraphExecutions * (100 - summary.successRate) / 100),
          averageTime: summary.averageExecutionTime
        },
        usage: {
          totalUsers: summary.uniqueUsers,
          activeSessions: summary.uniqueSessions,
          popularNodes: summary.topNodeTypes.slice(0, 5),
          topGraphs: [] // Would need to track graph IDs
        },
        costs: {
          totalSpent: costAnalysis?.summary?.totalCost || 0,
          dailyAverage: (costAnalysis?.summary?.totalCost || 0) / 30,
          topProviders: costAnalysis?.summary?.providerUsage || [],
          budgetAlerts: costAnalysis?.alerts || []
        },
        patterns: {
          hourlyUsage: patterns.data.map(d => ({
            hour: new Date(d.period).getHours(),
            count: d.value
          })),
          userJourneys: [], // Would implement journey tracking
          errorHotspots: summary.errorBreakdown.slice(0, 5)
        }
      }
    };
  }

  /**
   * Generate HTML section for analytics
   */
  private generateAnalyticsHTMLSection(data: AnalyticsDashboardData): string {
    return `
      <div class="analytics-section">
        <h2 class="section-title">Analytics Overview</h2>
        
        <div class="analytics-grid">
          <div class="analytics-card">
            <div class="analytics-title">Total Executions</div>
            <div class="analytics-value">${data.analytics.executions.total.toLocaleString()}</div>
            <div class="analytics-subtitle">Success Rate: ${((data.analytics.executions.successful / data.analytics.executions.total) * 100).toFixed(1)}%</div>
          </div>
          
          <div class="analytics-card">
            <div class="analytics-title">Active Users</div>
            <div class="analytics-value">${data.analytics.usage.totalUsers}</div>
            <div class="analytics-subtitle">${data.analytics.usage.activeSessions} active sessions</div>
          </div>
          
          <div class="analytics-card">
            <div class="analytics-title">Total Costs</div>
            <div class="analytics-value">$${data.analytics.costs.totalSpent.toFixed(2)}</div>
            <div class="analytics-subtitle">$${data.analytics.costs.dailyAverage.toFixed(2)}/day average</div>
          </div>
          
          <div class="analytics-card">
            <div class="analytics-title">Average Execution Time</div>
            <div class="analytics-value">${data.analytics.executions.averageTime.toFixed(0)}ms</div>
            <div class="analytics-subtitle">Performance metric</div>
          </div>
        </div>

        <div class="popular-nodes">
          <h3>Popular Node Types</h3>
          ${data.analytics.usage.popularNodes.map(node => `
            <div class="node-stat">
              <span class="node-type">${node.type}</span>
              <span class="node-count">${node.count} uses</span>
            </div>
          `).join('')}
        </div>

        ${data.analytics.costs.budgetAlerts.length > 0 ? `
          <div class="budget-alerts">
            <h3>Budget Alerts</h3>
            ${data.analytics.costs.budgetAlerts.map(alert => `
              <div class="alert-item ${alert.severity}">
                <div class="alert-message">${alert.message}</div>
                <div class="alert-time">${new Date(alert.timestamp).toLocaleString()}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>

      <style>
        .analytics-section {
          margin-bottom: 30px;
          background: #2a2a2a;
          border-radius: 8px;
          padding: 20px;
          border: 1px solid #333;
        }
        
        .analytics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }
        
        .analytics-card {
          background: #1a1a1a;
          border-radius: 6px;
          padding: 15px;
          border: 1px solid #444;
        }
        
        .analytics-title {
          font-size: 14px;
          color: #888;
          margin-bottom: 5px;
        }
        
        .analytics-value {
          font-size: 24px;
          font-weight: bold;
          color: #22c55e;
          margin-bottom: 5px;
        }
        
        .analytics-subtitle {
          font-size: 12px;
          color: #666;
        }
        
        .popular-nodes {
          margin-bottom: 20px;
        }
        
        .node-stat {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #333;
        }
        
        .node-type {
          color: #fff;
        }
        
        .node-count {
          color: #888;
        }
        
        .budget-alerts .alert-item {
          margin-bottom: 10px;
          padding: 10px;
          border-radius: 4px;
          border-left: 4px solid #f59e0b;
        }
        
        .budget-alerts .alert-item.critical {
          border-left-color: #ef4444;
        }
      </style>
    `;
  }

  /**
   * Generate HTML report
   */
  private generateHTMLReport(reportData: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Analytics Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .section { margin-bottom: 20px; }
          .metric { display: inline-block; margin: 10px; padding: 10px; border: 1px solid #ddd; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Analytics Report</h1>
          <p>Generated: ${new Date(reportData.generatedAt).toLocaleString()}</p>
          <p>Period: ${new Date(reportData.period.startTime).toLocaleDateString()} - ${new Date(reportData.period.endTime).toLocaleDateString()}</p>
        </div>
        
        <div class="section">
          <h2>Summary</h2>
          <div class="metric">Total Events: ${reportData.summary.totalEvents}</div>
          <div class="metric">Unique Users: ${reportData.summary.uniqueUsers}</div>
          <div class="metric">Total Cost: $${reportData.summary.totalCost}</div>
          <div class="metric">Success Rate: ${reportData.summary.successRate}%</div>
        </div>
        
        ${reportData.costAnalysis ? `
          <div class="section">
            <h2>Cost Analysis</h2>
            <div class="metric">Total Spent: $${reportData.costAnalysis.summary.totalCost}</div>
            <div class="metric">Token Usage: ${reportData.costAnalysis.summary.totalTokenUsage}</div>
            <div class="metric">Active Budgets: ${reportData.costAnalysis.budgets.length}</div>
          </div>
        ` : ''}
        
        <div class="section">
          <h2>Usage Patterns</h2>
          <p>Hourly trend: ${reportData.patterns.hourly.trend} (${reportData.patterns.hourly.changePercent.toFixed(1)}% change)</p>
          <p>Daily trend: ${reportData.patterns.daily.trend} (${reportData.patterns.daily.changePercent.toFixed(1)}% change)</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Broadcast analytics update to all clients
   */
  private broadcastAnalyticsUpdate(): void {
    if (this.dashboardClients.size === 0) return;

    const analyticsData = this.generateAnalyticsDashboardData();
    
    this.dashboardClients.forEach(client => {
      this.sendToClient(client, analyticsData);
    });
  }

  /**
   * Broadcast alert to all clients
   */
  private broadcastAlert(type: string, data: any): void {
    this.dashboardClients.forEach(client => {
      this.sendToClient(client, { type, alert: data });
    });
  }

  /**
   * Send data to a specific client
   */
  private sendToClient(client: any, data: any): void {
    try {
      if (client.send && typeof client.send === 'function') {
        client.send(JSON.stringify(data));
      } else if (client.write && typeof client.write === 'function') {
        client.write(JSON.stringify(data));
      }
    } catch (error) {
      console.error('Failed to send analytics data to client:', error);
      this.dashboardClients.delete(client);
    }
  }
}