// Epic 19.4 - Security Monitoring Dashboard
// Task: T-1752989145014 - Create frontend components for Security Monitoring & Incident Response
import React, { useState, useEffect } from 'react';
import {
  Shield,
  AlertTriangle,
  Activity,
  Eye,
  Clock,
  TrendingUp,
  Users,
  Lock,
  Zap,
  CheckCircle,
  XCircle,
  AlertCircle
 from 'lucide-react';
// SecurityMetric type was removed as unused
import { formatDistanceToNow } from 'date-fns';
import './SecurityDashboard.css';


interface SecurityDashboardProps {
  onIncidentClick?: (incidentId: string) => void;
  onThreatClick?: (threatId: string) => void;
  interface SecurityAlert {
  id: string;,
  type: 'critical' | 'high' | 'medium' | 'low';,
  title: string;,
  description: string;,
  timestamp: Date;,
  source: string;,
  status: 'open' | 'investigating' | 'resolved';
  interface ThreatMetrics {
  totalThreats: number;,
  blockedThreats: number;,
  activeIncidents: number;,
  riskScore: number;,
  lastScan: Date;
  export const SecurityDashboard: React.FC<SecurityDashboardProps> = ({),
  onIncidentClick,
  // onThreatClick // Commented out unused prop


}) => {
  const [metrics, setMetrics] = useState<ThreatMetrics>({)
  totalThreats: 0,
  blockedThreats: 0,
  activeIncidents: 0,
  riskScore: 0,
  lastScan: new Date(),
});
  const [alerts, setAlerts] = useState<SecurityAlert>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
  // Simulate loading security metrics
  const loadSecurityData = async () => {
  setIsLoading(true);
  // Mock data - replace with actual API calls
  setTimeout(() => {
  setMetrics({)
  totalThreats: 127,
  blockedThreats: 119,
  activeIncidents: 3,
  riskScore: 7.2,
  lastScan: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago,
});
        setAlerts([)
          {
  id: 'alert-1',
  type: 'critical',
  title: 'Multiple Failed Login Attempts',
  description: 'Unusual login activity detected from IP 192.168.1.100',
  timestamp: new Date(Date.now() - 2 * 60 * 1000),
  source: 'Authentication System',
  status: 'investigating',

          {
  id: 'alert-2',
  type: 'high',
  title: 'Suspicious API Usage Pattern',
  description: 'Potential data scraping detected on /api/templates endpoint',
  timestamp: new Date(Date.now() - 10 * 60 * 1000),
  source: 'API Gateway',
  status: 'open',

          {
  id: 'alert-3',
  type: 'medium',
  title: 'Rate Limit Threshold Exceeded',
  description: 'Client exceeded rate limit by 150%',
  timestamp: new Date(Date.now() - 15 * 60 * 1000),
  source: 'Rate Limiter',
  status: 'resolved']);
  setIsLoading(false);
}, 1000);
    };
    loadSecurityData();
  }, []);
  const getAlertIcon = (type: SecurityAlert['type']) => {
  switch (type) {
  case 'critical':,
  return <XCircle className="h-4 w-4 text-red-500" />;
  case 'high':,
  return <AlertCircle className="h-4 w-4 text-orange-500" />;
  case 'medium':,
  return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  case 'low':,
  return <CheckCircle className="h-4 w-4 text-blue-500" />;
  default:,
  return <AlertCircle className="h-4 w-4 text-gray-500" />;
};
  const getStatusColor = (status: SecurityAlert['status']) => {
  switch (status) {
  case 'open':,
  return 'bg-red-100 text-red-800';
  case 'investigating':,
  return 'bg-yellow-100 text-yellow-800';
  case 'resolved':,
  return 'bg-green-100 text-green-800';
  default:,
  return 'bg-gray-100 text-gray-800';
};
  const getRiskScoreColor = (score: number) => {
    if (score >= 8) return 'text-red-600';
    if (score >= 6) return 'text-yellow-600';
    if (score >= 4) return 'text-orange-600';
    return 'text-green-600';
  };
  if (isLoading) {
    return;
      <div className="security-dashboard loading">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading security dashboard...</span>
        </div>
      </div>
    );
  return;
    <div className="security-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-title">
            <Shield className="h-6 w-6 text-blue-600" />
            <h1>Security Monitoring Dashboard</h1>
          </div>
          <div className="header-actions">
            <button className="btn btn-secondary">
              <Activity className="h-4 w-4" />
              Real-time View
            </button>
            <button className="btn btn-primary">
              <Eye className="h-4 w-4" />
              Generate Report
            </button>
          </div>
        </div>
        <div className="last-updated">
          <Clock className="h-4 w-4 text-gray-500" />
          <span>Last scan: {formatDistanceToNow(metrics.lastScan)} ago</span>
        </div>
      </div>
      {/* Security Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-card primary">
          <div className="metric-header">
            <Shield className="h-5 w-5 text-blue-600" />
            <span className="metric-title">Total Threats Detected</span>
          </div>
          <div className="metric-value">{metrics.totalThreats}</div>
          <div className="metric-change positive">
            <TrendingUp className="h-4 w-4" />
            <span>+12% from last week</span>
          </div>
        </div>
        <div className="metric-card success">
          <div className="metric-header">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="metric-title">Threats Blocked</span>
          </div>
          <div className="metric-value">{metrics.blockedThreats}</div>
          <div className="metric-subtitle">
            {((metrics.blockedThreats / metrics.totalThreats) * 100).toFixed(1)}% success rate
          </div>
        </div>
        <div className="metric-card warning">
          <div className="metric-header">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <span className="metric-title">Active Incidents</span>
          </div>
          <div className="metric-value">{metrics.activeIncidents}</div>
          <div className="metric-subtitle">Requiring immediate attention</div>
        </div>
        <div className="metric-card">
          <div className="metric-header">
            <Zap className="h-5 w-5 text-purple-600" />
            <span className="metric-title">Risk Score</span>
          </div>
          <div className={`metric-value ${getRiskScoreColor(metrics.riskScore)}`}>}
            {metrics.riskScore.toFixed(1)}/10
          </div>
          <div className="metric-subtitle">Overall system risk level</div>
        </div>
      </div>
      {/* Security Alerts Section */}
      <div className="alerts-section">
        <div className="section-header">
          <h2>Recent Security Alerts</h2>
          <button className="btn btn-text">View All Alerts</button>
        </div>
        <div className="alerts-list">
          {alerts.map((alert) => ()
            <div key={alert.id} className="alert-item">
              <div className="alert-indicator">
                {getAlertIcon(alert.type)}
              </div>
              <div className="alert-content">
                <div className="alert-header">
                  <h3 className="alert-title">{alert.title}</h3>
                  <span className={`alert-status ${getStatusColor(alert.status)}`}>}
                    {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                  </span>
                </div>
                <p className="alert-description">{alert.description}</p>
                <div className="alert-meta">
                  <span className="alert-source">{alert.source}</span>
                  <span className="alert-time">
                    {formatDistanceToNow(alert.timestamp)} ago
                  </span>
                </div>
              </div>
              <div className="alert-actions">
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => onIncidentClick?.(alert.id)}
                >
                  Investigate
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          <button className="action-card">
            <Users className="h-5 w-5" />
            <span>Active Sessions</span>
          </button>
          <button className="action-card">
            <Lock className="h-5 w-5" />
            <span>Security Policies</span>
          </button>
          <button className="action-card">
            <Activity className="h-5 w-5" />
            <span>System Health</span>
          </button>
          <button className="action-card">
            <Eye className="h-5 w-5" />
            <span>Audit Logs</span>
          </button>
        </div>
      </div>
    </div>
  );
};