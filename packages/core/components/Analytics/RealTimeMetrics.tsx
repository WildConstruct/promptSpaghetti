/**
 * Real-Time Metrics Component - E17-1753114397418-21317A
 * 
 * Live dashboard for conversion and performance metrics
 */
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { conversionTracker } from '../../analytics/ConversionTracker';
import { performanceMonitor } from '../../utils/PerformanceMonitor';


export interface RealTimeMetricsProps { metrics: unknown;
  loading: boolean }

export const RealTimeMetrics: React.FC<RealTimeMetricsProps> = ({ metrics, loading }) => { const [liveData, setLiveData] = useState({)
  activeUsers: 0
  conversionsLast24h: 0
  averageSessionDuration: 0
  healthScore: 100
  topConvertingFunnel: ''
  recentEvents: [] }
});
  const [_____updateCount, setUpdateCount] = useState(0);
  useEffect(() => { if (metrics) {
  setLiveData(prev => ({)
  ...prev
  activeUsers: metrics.activeUsers || 0
  conversionsLast24h: metrics.conversionsLast24h || 0
  averageSessionDuration: metrics.averageSessionDuration || 0
  topConvertingFunnel: metrics.topConvertingFunnel || ''
  healthScore: metrics.performance?.healthScore || 100
  recentEvents: metrics.recentEvents || [] }
}));
  }, [metrics]);
  useEffect(() => { const interval = setInterval(() => {
  // Fetch real-time updates
  const dashboardData = conversionTracker.getDashboardData();
  const performanceData = performanceMonitor.getDashboardData();
  setLiveData(prev => ({)
  ...prev
  activeUsers: dashboardData.realTimeMetrics.activeUsers
  conversionsLast24h: dashboardData.realTimeMetrics.conversionsLast24h
  averageSessionDuration: dashboardData.realTimeMetrics.averageSessionDuration
  healthScore: performanceData.overview.healthScore
  topConvertingFunnel: dashboardData.realTimeMetrics.topConvertingFunnel }
}));
      setUpdateCount(prev => prev + 1);
    }, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);
  if (loading) {
    return;
      <div className="real-time-metrics loading">
        <div className="loading-spinner"></div>
        <p>Loading real-time metrics...</p>
      </div>
    );
  const formatDuration = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;}
  };
  const getHealthScoreColor = (score: number): string => {
    if (score >= 90) return 'success';
    if (score >= 70) return 'warning';
    return 'destructive'
  };
  return;
    <div className="real-time-metrics">
      <div className="metrics-header">
        <h3>Live Metrics</h3>
        <Badge variant="outline">
          Last updated: {new Date().toLocaleTimeString()}
        </Badge>
      </div>
      <div className="metrics-grid">
        <Card className="metric-card active-users">
          <CardHeader>
            <CardTitle className="metric-title">
              <span className="live-indicator"></span>
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="metric-value">{liveData.activeUsers}</div>
            <div className="metric-subtitle">Currently online</div>
          </CardContent>
        </Card>
        <Card className="metric-card conversions">
          <CardHeader>
            <CardTitle className="metric-title">Conversions (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="metric-value">{liveData.conversionsLast24h}</div>
            <div className="metric-subtitle">Key actions completed</div>
          </CardContent>
        </Card>
        <Card className="metric-card session-duration">
          <CardHeader>
            <CardTitle className="metric-title">Avg Session</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="metric-value">
              {formatDuration(liveData.averageSessionDuration)}
            </div>
            <div className="metric-subtitle">User engagement</div>
          </CardContent>
        </Card>
        <Card className="metric-card health-score">
          <CardHeader>
            <CardTitle className="metric-title">System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="metric-value">
              <Badge variant={getHealthScoreColor(liveData.healthScore) as any}>
                {liveData.healthScore}%
              </Badge>
            </div>
            <div className="metric-subtitle">Performance score</div>
          </CardContent>
        </Card>
        <Card className="metric-card top-funnel">
          <CardHeader>
            <CardTitle className="metric-title">Top Converting Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="metric-value funnel-name">
              {liveData.topConvertingFunnel || 'Director Onboarding'}
            </div>
            <div className="metric-subtitle">Best performing flow</div>
          </CardContent>
        </Card>
      </div>
      <style>{ `
        .real-time-metrics {
          margin-bottom: 2rem;
        .metrics-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        .metrics-header h3 {
          margin: 0;
          font-size: 1.2rem;
          font-weight: 600;
  color: #1f2937;
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        .metric-card {
          position: relative;
  transition: transform 0.2s ease;
        .metric-card:hover {
  transform: translateY(-2px);
        .metric-title {
          display: flex;
          align-items: center;
  gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
  color: #6b7280;
        .live-indicator {
          width: 8px;
  height: 8px;
          background: #10b981;
          border-radius: 50% }
  animation: pulse 2s infinite;
        @keyframes pulse { 0%, 100% { opacity: 1 }
          50% { opacity: 0.5 }
        .metric-value { font-size: 2rem;
          font-weight: 700;
  color: #1f2937;
          margin: 0.5rem 0;
        .funnel-name {
          font-size: 1.1rem;
          font-weight: 600;
        .metric-subtitle {
          font-size: 0.75rem
  color: #9ca3af;
        .loading {
          display: flex;
          flex-direction: column;
          align-items: center;
  padding: 2rem;
          gap: 1rem;
        .loading-spinner {
          width: 2rem;
  height: 2rem;
          border: 2px solid #e5e7eb;
          border-top: 2px solid #3b82f6;
          border-radius: 50% }
  animation: spin 1s linear infinite;
        @keyframes spin { 0% { transform: rotate(0deg) }
          100% { transform: rotate(360deg) }
      `}</style>
    </div>
  );
};

export default RealTimeMetrics;