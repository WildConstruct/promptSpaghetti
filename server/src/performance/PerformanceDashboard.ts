import { EventEmitter } from 'events';
import { MetricsCollector, PerformanceAlert, SystemMetrics, WebSocketMetrics, CollaborationMetrics } from './MetricsCollector';
import { WebSocketServer } from '../websocket/WebSocketServer';

/**
 * Dashboard configuration
 */



export interface DashboardConfig {
  refreshInterval: number; // milliseconds
  historyWindow: number;   // milliseconds
  alertThreshold: number;  // number of alerts before critical status
  autoRefresh: boolean;





/**
 * Real-time dashboard data
 */



export interface DashboardData {
  timestamp: number;
  health: {
    overall: number;
    system: number;
    webSocket: number;
    collaboration: number;



  };
  metrics: {
    current: {
      system: SystemMetrics | null;
      webSocket: WebSocketMetrics | null;
      collaboration: CollaborationMetrics | null;
    };
    trends: {
      cpuTrend: number[];
      memoryTrend: number[];
      latencyTrend: number[];
      errorRateTrend: number[];
    };
  };
  alerts: {
    active: PerformanceAlert[];
    recent: PerformanceAlert[];
    count: {
      total: number;
      critical: number;
      warning: number;
    };
  };
  connections: {
    total: number;
    activeDocuments: number;
    averageUsersPerDocument: number;
    recentConnections: number;
    recentDisconnections: number;
  };
  recommendations: string[];


/**
 * Performance monitoring dashboard
 */
export class PerformanceDashboard extends EventEmitter {
  private metricsCollector: MetricsCollector;
  private wsServer: WebSocketServer | null = null;
  private config: DashboardConfig;
  private dashboardClients: Set<any> = new Set();
  private refreshTimer: NodeJS.Timeout | null = null;
  private isActive: boolean = false;

  constructor(metricsCollector: MetricsCollector, config?: Partial<DashboardConfig>) {
    super();
    
    this.metricsCollector = metricsCollector;
    this.config = {
      refreshInterval: 2000, // 2 seconds
      historyWindow: 300000, // 5 minutes
      alertThreshold: 5,
      autoRefresh: true,
      ...config
    };

    this.setupMetricsListeners();


  /**
   * Set WebSocket server for connection metrics
   */
  setWebSocketServer(wsServer: WebSocketServer): void {
    this.wsServer = wsServer;


  /**
   * Start the dashboard
   */
  start(): void {
    if (this.isActive) {
      return;


    this.isActive = true;
    console.log('Starting performance dashboard');

    if (this.config.autoRefresh) {
      this.refreshTimer = setInterval(() => {
        this.broadcastUpdate();
      }, this.config.refreshInterval);


    this.emit('dashboard_started');


  /**
   * Stop the dashboard
   */
  stop(): void {
    if (!this.isActive) {
      return;


    this.isActive = false;
    console.log('Stopping performance dashboard');

    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;


    this.emit('dashboard_stopped');


  /**
   * Add a dashboard client
   */
  addClient(client: any): void {
    this.dashboardClients.add(client);
    
    // Send initial data to new client
    const dashboardData = this.generateDashboardData();
    this.sendToClient(client, dashboardData);
    
    this.emit('client_connected', { clientCount: this.dashboardClients.size });


  /**
   * Remove a dashboard client
   */
  removeClient(client: any): void {
    this.dashboardClients.delete(client);
    this.emit('client_disconnected', { clientCount: this.dashboardClients.size });


  /**
   * Get current dashboard data
   */
  getDashboardData(): DashboardData {
    return this.generateDashboardData();


  /**
   * Get performance report for a time period
   */
  getPerformanceReport(startTime: number, endTime: number): any {
    const aggregated = this.metricsCollector.getAggregatedMetrics(startTime, endTime);
    const window = this.metricsCollector.getMetricsWindow(startTime, endTime);
    
    return {
      period: {
        start: startTime,
        end: endTime,
        duration: endTime - startTime

      summary: {
        totalMetrics: window.systemMetrics.length + window.webSocketMetrics.length + window.collaborationMetrics.length,
        averageHealth: this.calculateAverageHealth(window),
        alertCount: aggregated.alerts.length,
        criticalAlerts: aggregated.alerts.filter((a: PerformanceAlert) => a.severity === 'critical').length

      metrics: aggregated,
      trends: this.calculateTrends(window),
      insights: this.generateInsights(aggregated, window)
    };


  /**
   * Force a dashboard refresh
   */
  refresh(): void {
    this.broadcastUpdate();


  /**
   * Generate HTML dashboard
   */
  generateHTML(): string {
    const data = this.generateDashboardData();
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Performance Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;


        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #1a1a1a;
            color: #ffffff;
            line-height: 1.6;


        .dashboard {
            padding: 20px;
            max-width: 1400px;
            margin: 0 auto;


        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid #333;


        .title {
            font-size: 28px;
            font-weight: 600;
            color: #ffffff;


        .timestamp {
            color: #888;
            font-size: 14px;


        .health-overview {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;


        .health-card {
            background: #2a2a2a;
            border-radius: 8px;
            padding: 20px;
            border: 1px solid #333;


        .health-score {
            font-size: 36px;
            font-weight: bold;
            margin-bottom: 10px;


        .health-score.excellent { color: #22c55e; }
        .health-score.good { color: #84cc16; }
        .health-score.warning { color: #f59e0b; }
        .health-score.critical { color: #ef4444; }

        .health-label {
            color: #888;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;


        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;


        .metric-card {
            background: #2a2a2a;
            border-radius: 8px;
            padding: 20px;
            border: 1px solid #333;


        .metric-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
            color: #ffffff;


        .metric-value {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;


        .metric-unit {
            color: #888;
            font-size: 14px;


        .trend-indicator {
            display: inline-block;
            margin-left: 10px;
            font-size: 14px;


        .trend-up { color: #ef4444; }
        .trend-down { color: #22c55e; }
        .trend-stable { color: #888; }

        .alerts-section {
            margin-bottom: 30px;


        .section-title {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 15px;
            color: #ffffff;


        .alert-item {
            background: #2a2a2a;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 10px;
            border-left: 4px solid;


        .alert-item.warning { border-left-color: #f59e0b; }
        .alert-item.critical { border-left-color: #ef4444; }

        .alert-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 5px;


        .alert-severity {
            font-weight: 600;
            text-transform: uppercase;
            font-size: 12px;
            padding: 2px 8px;
            border-radius: 4px;


        .alert-severity.warning {
            background: rgba(245, 158, 11, 0.2);
            color: #f59e0b;


        .alert-severity.critical {
            background: rgba(239, 68, 68, 0.2);
            color: #ef4444;


        .connections-info {
            display: flex;
            gap: 20px;
            margin-bottom: 30px;


        .connection-stat {
            background: #2a2a2a;
            border-radius: 8px;
            padding: 15px;
            flex: 1;
            border: 1px solid #333;
            text-align: center;


        .connection-value {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;


        .connection-label {
            color: #888;
            font-size: 14px;


        .recommendations {
            background: #2a2a2a;
            border-radius: 8px;
            padding: 20px;
            border: 1px solid #333;


        .recommendation-item {
            margin-bottom: 10px;
            padding-left: 20px;
            position: relative;


        .recommendation-item:before {
            content: "•";
            position: absolute;
            left: 0;
            color: #22c55e;


        .no-data {
            text-align: center;
            color: #888;
            font-style: italic;
            padding: 20px;


        .auto-refresh {
            display: flex;
            align-items: center;
            gap: 10px;
            color: #888;
            font-size: 14px;


        .refresh-indicator {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #22c55e;
            animation: pulse 2s infinite;


        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }

    </style>
</head>
<body>
    <div class="dashboard">
        <div class="header">
            <h1 class="title">Performance Dashboard</h1>
            <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 5px;">
                <div class="timestamp">Last updated: ${new Date(data.timestamp).toLocaleString()}</div>
                <div class="auto-refresh">
                    <div class="refresh-indicator"></div>
                    Auto-refresh enabled
                </div>
            </div>
        </div>

        <div class="health-overview">
            <div class="health-card">
                <div class="health-score ${this.getHealthClass(data.health.overall)}">${data.health.overall}%</div>
                <div class="health-label">Overall Health</div>
            </div>
            <div class="health-card">
                <div class="health-score ${this.getHealthClass(data.health.system)}">${data.health.system}%</div>
                <div class="health-label">System Health</div>
            </div>
            <div class="health-card">
                <div class="health-score ${this.getHealthClass(data.health.webSocket)}">${data.health.webSocket}%</div>
                <div class="health-label">WebSocket Health</div>
            </div>
            <div class="health-card">
                <div class="health-score ${this.getHealthClass(data.health.collaboration)}">${data.health.collaboration}%</div>
                <div class="health-label">Collaboration Health</div>
            </div>
        </div>

        <div class="connections-info">
            <div class="connection-stat">
                <div class="connection-value">${data.connections.total}</div>
                <div class="connection-label">Total Connections</div>
            </div>
            <div class="connection-stat">
                <div class="connection-value">${data.connections.activeDocuments}</div>
                <div class="connection-label">Active Documents</div>
            </div>
            <div class="connection-stat">
                <div class="connection-value">${data.connections.averageUsersPerDocument.toFixed(1)}</div>
                <div class="connection-label">Avg Users/Document</div>
            </div>
        </div>

        <div class="metrics-grid">
            ${data.metrics.current.system ? `
            <div class="metric-card">
                <div class="metric-title">CPU Usage</div>
                <div class="metric-value">${data.metrics.current.system.cpuUsage.toFixed(1)}<span class="metric-unit">%</span></div>
            </div>
            <div class="metric-card">
                <div class="metric-title">Memory Usage</div>
                <div class="metric-value">${data.metrics.current.system.memoryUsage.percentage.toFixed(1)}<span class="metric-unit">%</span></div>
            </div>
            ` : ''}
            
            ${data.metrics.current.webSocket ? `
            <div class="metric-card">
                <div class="metric-title">Message Latency</div>
                <div class="metric-value">${data.metrics.current.webSocket.messageLatency}<span class="metric-unit">ms</span></div>
            </div>
            <div class="metric-card">
                <div class="metric-title">Error Rate</div>
                <div class="metric-value">${data.metrics.current.webSocket.errorRate.toFixed(1)}<span class="metric-unit">%</span></div>
            </div>
            ` : ''}
            
            ${data.metrics.current.collaboration ? `
            <div class="metric-card">
                <div class="metric-title">Conflict Resolution Time</div>
                <div class="metric-value">${data.metrics.current.collaboration.conflictResolutionTime}<span class="metric-unit">ms</span></div>
            </div>
            <div class="metric-card">
                <div class="metric-title">Sync Latency</div>
                <div class="metric-value">${data.metrics.current.collaboration.synchronizationLatency}<span class="metric-unit">ms</span></div>
            </div>
            ` : ''}
        </div>

        <div class="alerts-section">
            <h2 class="section-title">Active Alerts (${data.alerts.count.total})</h2>
            ${data.alerts.active.length > 0 ? data.alerts.active.map(alert => `
                <div class="alert-item ${alert.severity}">
                    <div class="alert-header">
                        <span>${alert.description}</span>
                        <span class="alert-severity ${alert.severity}">${alert.severity}</span>
                    </div>
                    <div style="color: #888; font-size: 14px;">
                        ${alert.metric}: ${alert.currentValue} (threshold: ${alert.threshold})
                    </div>
                </div>
            `).join('') : '<div class="no-data">No active alerts</div>'}
        </div>

        <div class="recommendations">
            <h2 class="section-title">Recommendations</h2>
            ${data.recommendations.length > 0 ? data.recommendations.map(rec => `
                <div class="recommendation-item">${rec}</div>
            `).join('') : '<div class="no-data">No recommendations at this time</div>'}
        </div>
    </div>

    <script>
        // Auto-refresh the page every 30 seconds
        setTimeout(() => {
            window.location.reload();
        }, 30000);
    </script>
</body>
</html>`;


  /**
   * Setup metrics event listeners
   */
  private setupMetricsListeners(): void {
    this.metricsCollector.on('alert_created', (alert: PerformanceAlert) => {
      this.broadcastAlert(alert);
    });

    this.metricsCollector.on('system_metrics', () => {
      if (this.isActive && this.dashboardClients.size > 0) {
        // Throttled updates to avoid overwhelming clients
        setTimeout(() => this.broadcastUpdate(), 100);

    });


  /**
   * Generate current dashboard data
   */
  private generateDashboardData(): DashboardData {
    const currentMetrics = this.metricsCollector.getCurrentMetrics();
    const activeAlerts = this.metricsCollector.getActiveAlerts();
    const recentAlerts = this.getRecentAlerts();
    const connectionInfo = this.getConnectionInfo();
    const trends = this.calculateCurrentTrends();
    const health = this.calculateHealthScores(currentMetrics, activeAlerts);
    const recommendations = this.generateCurrentRecommendations(currentMetrics, activeAlerts);

    return {
      timestamp: Date.now(),
      health,
      metrics: {
        current: currentMetrics,
        trends

      alerts: {
        active: activeAlerts,
        recent: recentAlerts,
        count: {
          total: activeAlerts.length,
          critical: activeAlerts.filter(a => a.severity === 'critical').length,
          warning: activeAlerts.filter(a => a.severity === 'warning').length


      connections: connectionInfo,
      recommendations
    };


  /**
   * Calculate health scores for different systems
   */
  private calculateHealthScores(metrics: any, alerts: PerformanceAlert[]): any {
    const systemHealth = this.calculateSystemHealth(metrics.system, alerts);
    const webSocketHealth = this.calculateWebSocketHealth(metrics.webSocket, alerts);
    const collaborationHealth = this.calculateCollaborationHealth(metrics.collaboration, alerts);
    
    const overall = Math.round((systemHealth + webSocketHealth + collaborationHealth) / 3);

    return {
      overall,
      system: systemHealth,
      webSocket: webSocketHealth,
      collaboration: collaborationHealth
    };


  /**
   * Calculate system health score
   */
  private calculateSystemHealth(systemMetrics: SystemMetrics | null, alerts: PerformanceAlert[]): number {
    if (!systemMetrics) return 50;

    let score = 100;
    
    // Deduct for high CPU usage
    if (systemMetrics.cpuUsage > 80) score -= 30;
    else if (systemMetrics.cpuUsage > 60) score -= 15;
    
    // Deduct for high memory usage
    if (systemMetrics.memoryUsage.percentage > 85) score -= 25;
    else if (systemMetrics.memoryUsage.percentage > 70) score -= 10;
    
    // Deduct for system-related alerts
    const systemAlerts = alerts.filter(a => a.metric.includes('cpu') || a.metric.includes('memory'));
    score -= systemAlerts.filter(a => a.severity === 'critical').length * 20;
    score -= systemAlerts.filter(a => a.severity === 'warning').length * 10;
    
    return Math.max(0, Math.min(100, Math.round(score)));


  /**
   * Calculate WebSocket health score
   */
  private calculateWebSocketHealth(wsMetrics: WebSocketMetrics | null, alerts: PerformanceAlert[]): number {
    if (!wsMetrics) return 50;

    let score = 100;
    
    // Deduct for high latency
    if (wsMetrics.messageLatency > 1000) score -= 25;
    else if (wsMetrics.messageLatency > 500) score -= 10;
    
    // Deduct for high error rate
    if (wsMetrics.errorRate > 5) score -= 30;
    else if (wsMetrics.errorRate > 2) score -= 15;
    
    // Deduct for WebSocket-related alerts
    const wsAlerts = alerts.filter(a => a.metric.includes('message') || a.metric.includes('error'));
    score -= wsAlerts.filter(a => a.severity === 'critical').length * 20;
    score -= wsAlerts.filter(a => a.severity === 'warning').length * 10;
    
    return Math.max(0, Math.min(100, Math.round(score)));


  /**
   * Calculate collaboration health score
   */
  private calculateCollaborationHealth(collabMetrics: CollaborationMetrics | null, alerts: PerformanceAlert[]): number {
    if (!collabMetrics) return 50;

    let score = 100;
    
    // Deduct for slow conflict resolution
    if (collabMetrics.conflictResolutionTime > 5000) score -= 25;
    else if (collabMetrics.conflictResolutionTime > 2000) score -= 10;
    
    // Deduct for high sync latency
    if (collabMetrics.synchronizationLatency > 2000) score -= 20;
    else if (collabMetrics.synchronizationLatency > 1000) score -= 10;
    
    // Deduct for collaboration-related alerts
    const collabAlerts = alerts.filter(a => a.metric.includes('conflict') || a.metric.includes('sync'));
    score -= collabAlerts.filter(a => a.severity === 'critical').length * 20;
    score -= collabAlerts.filter(a => a.severity === 'warning').length * 10;
    
    return Math.max(0, Math.min(100, Math.round(score)));


  /**
   * Get recent alerts (last hour)
   */
  private getRecentAlerts(): PerformanceAlert[] {
    const oneHourAgo = Date.now() - 3600000;
    return this.metricsCollector.getMetricsWindow(oneHourAgo, Date.now()).systemMetrics
      .map(() => []) // Simplified - would get actual recent alerts
      .flat();


  /**
   * Get connection information
   */
  private getConnectionInfo(): any {
    if (!this.wsServer) {
      return {
        total: 0,
        activeDocuments: 0,
        averageUsersPerDocument: 0,
        recentConnections: 0,
        recentDisconnections: 0
      };


    const healthMetrics = this.wsServer.getHealthMetrics();
    const documentSessions = this.wsServer.getDocumentSessions();

    return {
      total: healthMetrics.totalConnections,
      activeDocuments: documentSessions.activeDocuments,
      averageUsersPerDocument: documentSessions.activeDocuments > 0 
        ? healthMetrics.totalConnections / documentSessions.activeDocuments 
        : 0,
      recentConnections: 0, // Would track recent connections
      recentDisconnections: 0 // Would track recent disconnections
    };


  /**
   * Calculate current performance trends
   */
  private calculateCurrentTrends(): any {
    const endTime = Date.now();
    const startTime = endTime - this.config.historyWindow;
    const window = this.metricsCollector.getMetricsWindow(startTime, endTime);

    return {
      cpuTrend: window.systemMetrics.slice(-20).map(m => m.cpuUsage),
      memoryTrend: window.systemMetrics.slice(-20).map(m => m.memoryUsage.percentage),
      latencyTrend: window.webSocketMetrics.slice(-20).map(m => m.messageLatency),
      errorRateTrend: window.webSocketMetrics.slice(-20).map(m => m.errorRate)
    };


  /**
   * Generate current recommendations
   */
  private generateCurrentRecommendations(metrics: any, alerts: PerformanceAlert[]): string[] {
    const recommendations: string[] = [];

    if (alerts.length > this.config.alertThreshold) {
      recommendations.push(`High alert count (${alerts.length}). Consider investigating underlying issues.`);


    if (metrics.system?.cpuUsage > 80) {
      recommendations.push('CPU usage is high. Consider scaling or optimizing processes.');


    if (metrics.system?.memoryUsage.percentage > 85) {
      recommendations.push('Memory usage is critical. Implement garbage collection or add more memory.');


    if (metrics.webSocket?.messageLatency > 1000) {
      recommendations.push('WebSocket latency is high. Optimize message processing or check network conditions.');


    if (alerts.filter(a => a.severity === 'critical').length > 0) {
      recommendations.push('Critical alerts detected. Immediate attention required.');


    if (recommendations.length === 0) {
      recommendations.push('System is performing well. Continue monitoring.');


    return recommendations;


  /**
   * Calculate average health over a time window
   */
  private calculateAverageHealth(window: any): number {
    // Simplified calculation - would be more sophisticated in real implementation
    const alertCount = window.systemMetrics.length + window.webSocketMetrics.length + window.collaborationMetrics.length;
    return Math.max(0, 100 - (alertCount * 2));


  /**
   * Calculate performance trends
   */
  private calculateTrends(window: any): any {
    return {
      cpuTrend: this.calculateTrendDirection(window.systemMetrics.map((m: SystemMetrics) => m.cpuUsage)),
      memoryTrend: this.calculateTrendDirection(window.systemMetrics.map((m: SystemMetrics) => m.memoryUsage.percentage)),
      latencyTrend: this.calculateTrendDirection(window.webSocketMetrics.map((m: WebSocketMetrics) => m.messageLatency)),
      errorRateTrend: this.calculateTrendDirection(window.webSocketMetrics.map((m: WebSocketMetrics) => m.errorRate))
    };


  /**
   * Calculate trend direction (up, down, stable)
   */
  private calculateTrendDirection(values: number[]): string {
    if (values.length < 2) return 'stable';
    
    const recent = values.slice(-5);
    const earlier = values.slice(-10, -5);
    
    if (recent.length === 0 || earlier.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;
    
    const change = ((recentAvg - earlierAvg) / earlierAvg) * 100;
    
    if (change > 5) return 'up';
    if (change < -5) return 'down';
    return 'stable';


  /**
   * Generate insights from performance data
   */
  private generateInsights(aggregated: any, window: any): string[] {
    const insights: string[] = [];

    // Performance insights
    if (aggregated.system?.cpu.mean > 70) {
      insights.push('Sustained high CPU usage detected. Consider horizontal scaling.');


    if (aggregated.webSocket?.messageLatency.p95 > 2000) {
      insights.push('95th percentile message latency is concerning. Network optimization needed.');


    if (aggregated.collaboration?.conflictRate.mean > 0.1) {
      insights.push('High conflict rate suggests user workflow improvements needed.');


    return insights;


  /**
   * Broadcast dashboard update to all clients
   */
  private broadcastUpdate(): void {
    if (this.dashboardClients.size === 0) {
      return;


    const dashboardData = this.generateDashboardData();
    
    this.dashboardClients.forEach(client => {
      this.sendToClient(client, dashboardData);
    });


  /**
   * Broadcast alert to all clients
   */
  private broadcastAlert(alert: PerformanceAlert): void {
    this.dashboardClients.forEach(client => {
      this.sendToClient(client, { type: 'alert', alert });
    });


  /**
   * Send data to a specific client
   */
  private sendToClient(client: any, data: any): void {
    try {
      if (client.send && typeof client.send === 'function') {
        client.send(JSON.stringify(data));
 else if (client.write && typeof client.write === 'function') {
        client.write(JSON.stringify(data));

 catch (error) {
      console.error('Failed to send data to dashboard client:', error);
      this.dashboardClients.delete(client);



  /**
   * Get health class for styling
   */
  private getHealthClass(score: number): string {
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 50) return 'warning';
    return 'critical';

