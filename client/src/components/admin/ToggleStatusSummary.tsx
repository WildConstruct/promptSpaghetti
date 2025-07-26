/**
 * Toggle Status Summary Component
 * Epic 17.1.2 - Admin Dashboard UI
 * Task: E17-1753114396756-9864C5
 * 
 * Comprehensive dashboard summary cards showing toggle system health,
 * Claude impact metrics, and real-time status indicators.
 */

import React, { useState, useEffect } from 'react';
import {
  ToggleLeft,
  ToggleRight,
  Zap,
  AlertTriangle,
  TrendingUp,
  Clock,
  Shield,
  Activity,
  Brain,
  Eye,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  BarChart3
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { LoadingSpinner } from '../common/LoadingSpinner';
import './ToggleStatusSummary.css';

interface ToggleSummaryMetrics {
  // System Overview
  totalToggles: number;
  activeToggles: number;
  inactiveToggles: number;
  archivedToggles: number;
  
  // Toggle Types Distribution
  typeBreakdown: {
    boolean: number;
    percentage_rollout: number;
    multivariate: number;
    scheduled: number;
    segmentation: number;
  };
  
  // Claude Impact Analysis
  claudeImpact: {
    NONE: number;
    PROMPT_COST: number;
    MODEL_VERSION: number;
    OUTPUT_QUALITY: number;
    HALLUCINATION_RISK: number;
  };
  
  // Health & Performance
  healthScore: number; // 0-100
  alertsActive: number;
  performanceIssues: number;
  averageResponseTime: number;
  
  // Recent Activity
  recentChanges: number; // Last 24h
  rolloutSuccess: number; // Percentage
  errorRate: number; // Percentage
  
  // Usage Statistics
  evaluationsToday: number;
  topPerformingToggles: Array<{
    id: string;
    name: string;
    evaluations: number;
    successRate: number;
  }>;
  
  // Organization Insights
  organizationCoverage: number; // Percentage of orgs using toggles
  averageTogglesPerOrg: number;
  
  // Trends
  growthRate: number; // Percentage change from last period
  lastUpdated: string;
}

interface StatusCard {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  variant: 'success' | 'warning' | 'danger' | 'info';
  description?: string;
  details?: Array<{ label: string; value: string | number }>;
}

export const ToggleStatusSummary: React.FC = () => {
  const [metrics, setMetrics] = useState<ToggleSummaryMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch metrics from API
  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real implementation, this would fetch from actual API endpoints
      // For now, we'll simulate realistic toggle metrics
      const response = await simulateMetricsAPI();
      
      setMetrics(response);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh functionality
  useEffect(() => {
    fetchMetrics();
    
    if (autoRefresh) {
      const interval = setInterval(fetchMetrics, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const handleRefresh = () => {
    fetchMetrics();
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };

  if (loading && !metrics) {
    return (
      <div className="toggle-status-summary loading">
        <LoadingSpinner size="small" />
        <span>Loading system status...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="toggle-status-summary error">
        <AlertTriangle className="error-icon" />
        <span>Failed to load system status: {error}</span>
        <button onClick={handleRefresh} className="retry-btn">
          <RefreshCw size={16} />
          Retry
        </button>
      </div>
    );
  }

  if (!metrics) return null;

  // Generate status cards based on metrics
  const statusCards: StatusCard[] = [
    {
      title: 'Total Toggles',
      value: metrics.totalToggles,
      change: metrics.growthRate,
      changeLabel: 'vs last week',
      icon: <ToggleRight />,
      variant: 'info',
      description: 'Active feature toggles in the system',
      details: [
        { label: 'Active', value: metrics.activeToggles },
        { label: 'Inactive', value: metrics.inactiveToggles },
        { label: 'Archived', value: metrics.archivedToggles }
      ]
    },
    {
      title: 'System Health',
      value: `${metrics.healthScore}%`,
      icon: metrics.healthScore >= 90 ? <CheckCircle /> : 
        metrics.healthScore >= 70 ? <AlertCircle /> : <AlertTriangle />,
      variant: metrics.healthScore >= 90 ? 'success' : 
        metrics.healthScore >= 70 ? 'warning' : 'danger',
      description: 'Overall system health score',
      details: [
        { label: 'Active Alerts', value: metrics.alertsActive },
        { label: 'Performance Issues', value: metrics.performanceIssues },
        { label: 'Avg Response Time', value: `${metrics.averageResponseTime}ms` }
      ]
    },
    {
      title: 'Claude Impact',
      value: Object.values(metrics.claudeImpact).reduce((a, b) => a + b, 0) - metrics.claudeImpact.NONE,
      icon: <Brain />,
      variant: 'warning',
      description: 'Toggles affecting Claude operations',
      details: [
        { label: 'Cost Impact', value: metrics.claudeImpact.PROMPT_COST },
        { label: 'Model Impact', value: metrics.claudeImpact.MODEL_VERSION },
        { label: 'Quality Impact', value: metrics.claudeImpact.OUTPUT_QUALITY },
        { label: 'Risk Impact', value: metrics.claudeImpact.HALLUCINATION_RISK }
      ]
    },
    {
      title: 'Daily Evaluations',
      value: formatLargeNumber(metrics.evaluationsToday),
      change: 15.2,
      changeLabel: 'vs yesterday',
      icon: <Activity />,
      variant: 'success',
      description: 'Toggle evaluations performed today',
      details: [
        { label: 'Success Rate', value: `${metrics.rolloutSuccess}%` },
        { label: 'Error Rate', value: `${metrics.errorRate}%` }
      ]
    },
    {
      title: 'Recent Changes',
      value: metrics.recentChanges,
      icon: <Clock />,
      variant: 'info',
      description: 'Toggle modifications in last 24h',
      details: [
        { label: 'Created', value: Math.floor(metrics.recentChanges * 0.3) },
        { label: 'Modified', value: Math.floor(metrics.recentChanges * 0.6) },
        { label: 'Archived', value: Math.floor(metrics.recentChanges * 0.1) }
      ]
    },
    {
      title: 'Organization Coverage',
      value: `${metrics.organizationCoverage}%`,
      icon: <Shield />,
      variant: 'success',
      description: 'Organizations using feature toggles',
      details: [
        { label: 'Avg per Org', value: metrics.averageTogglesPerOrg.toFixed(1) }
      ]
    }
  ];

  return (
    <div className="toggle-status-summary">
      {/* Header */}
      <div className="summary-header">
        <div className="header-info">
          <h2>System Status</h2>
          <p className="last-updated">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <div className="header-controls">
          <button 
            onClick={toggleAutoRefresh}
            className={`auto-refresh-btn ${autoRefresh ? 'active' : ''}`}
            title={`Auto-refresh: ${autoRefresh ? 'ON' : 'OFF'}`}
          >
            <Activity size={16} />
            {autoRefresh ? 'Auto' : 'Manual'}
          </button>
          <button onClick={handleRefresh} className="refresh-btn" disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spinning' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Status Cards Grid */}
      <div className="status-cards-grid">
        {statusCards.map((card, index) => (
          <StatusCard key={index} {...card} />
        ))}
      </div>

      {/* Toggle Types Distribution */}
      <div className="distribution-section">
        <h3>Toggle Types Distribution</h3>
        <div className="distribution-grid">
          <DistributionCard
            title="Boolean"
            value={metrics.typeBreakdown.boolean}
            total={metrics.totalToggles}
            color="#4CAF50"
            icon={<ToggleLeft />}
          />
          <DistributionCard
            title="Percentage Rollout"
            value={metrics.typeBreakdown.percentage_rollout}
            total={metrics.totalToggles}
            color="#2196F3"
            icon={<BarChart3 />}
          />
          <DistributionCard
            title="Multivariate"
            value={metrics.typeBreakdown.multivariate}
            total={metrics.totalToggles}
            color="#FF9800"
            icon={<Zap />}
          />
          <DistributionCard
            title="Scheduled"
            value={metrics.typeBreakdown.scheduled}
            total={metrics.totalToggles}
            color="#9C27B0"
            icon={<Clock />}
          />
          <DistributionCard
            title="Segmentation"
            value={metrics.typeBreakdown.segmentation}
            total={metrics.totalToggles}
            color="#607D8B"
            icon={<Eye />}
          />
        </div>
      </div>

      {/* Top Performing Toggles */}
      <div className="top-performers">
        <h3>Top Performing Toggles</h3>
        <div className="performers-list">
          {metrics.topPerformingToggles.map((toggle, index) => (
            <div key={toggle.id} className="performer-item">
              <div className="performer-rank">#{index + 1}</div>
              <div className="performer-info">
                <span className="performer-name">{toggle.name}</span>
                <span className="performer-evaluations">
                  {formatLargeNumber(toggle.evaluations)} evaluations
                </span>
              </div>
              <div className="performer-success">
                <Badge variant={toggle.successRate >= 95 ? 'success' : 'warning'}>
                  {toggle.successRate}%
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Status Card Component
const StatusCard: React.FC<StatusCard> = ({ 
  title, 
  value, 
  change, 
  changeLabel, 
  icon, 
  variant, 
  description, 
  details 
}) => (
  <div className={`status-card ${variant}`}>
    <div className="card-header">
      <div className="card-icon">{icon}</div>
      <div className="card-title-section">
        <h3>{title}</h3>
        {description && <p className="card-description">{description}</p>}
      </div>
    </div>
    
    <div className="card-value">
      <span className="value">{value}</span>
      {change !== undefined && (
        <div className={`change ${change >= 0 ? 'positive' : 'negative'}`}>
          <TrendingUp size={12} />
          <span>{change >= 0 ? '+' : ''}{change}%</span>
          {changeLabel && <span className="change-label">{changeLabel}</span>}
        </div>
      )}
    </div>

    {details && (
      <div className="card-details">
        {details.map((detail, index) => (
          <div key={index} className="detail-item">
            <span className="detail-label">{detail.label}</span>
            <span className="detail-value">{detail.value}</span>
          </div>
        ))}
      </div>
    )}
  </div>
);

// Distribution Card Component
interface DistributionCardProps {
  title: string;
  value: number;
  total: number;
  color: string;
  icon: React.ReactNode;
}

const DistributionCard: React.FC<DistributionCardProps> = ({ 
  title, 
  value, 
  total, 
  color, 
  icon 
}) => {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  
  return (
    <div className="distribution-card">
      <div className="distribution-header">
        <div className="distribution-icon" style={{ color }}>
          {icon}
        </div>
        <div className="distribution-info">
          <h4>{title}</h4>
          <span className="distribution-count">{value}</span>
        </div>
      </div>
      <div className="distribution-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${percentage}%`, backgroundColor: color }}
          />
        </div>
        <span className="progress-percentage">{percentage.toFixed(1)}%</span>
      </div>
    </div>
  );
};

// Helper Functions
const formatLargeNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// Simulate metrics API (replace with actual API call)
const simulateMetricsAPI = async (): Promise<ToggleSummaryMetrics> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    totalToggles: 247,
    activeToggles: 184,
    inactiveToggles: 51,
    archivedToggles: 12,
    
    typeBreakdown: {
      boolean: 145,
      percentage_rollout: 67,
      multivariate: 23,
      scheduled: 8,
      segmentation: 4
    },
    
    claudeImpact: {
      NONE: 156,
      PROMPT_COST: 34,
      MODEL_VERSION: 28,
      OUTPUT_QUALITY: 19,
      HALLUCINATION_RISK: 10
    },
    
    healthScore: 94,
    alertsActive: 2,
    performanceIssues: 1,
    averageResponseTime: 23,
    
    recentChanges: 18,
    rolloutSuccess: 97.3,
    errorRate: 0.8,
    
    evaluationsToday: 2847629,
    topPerformingToggles: [
      { id: '1', name: 'Advanced Prompt Enhancement', evaluations: 145627, successRate: 98.4 },
      { id: '2', name: 'Claude Model Optimization', evaluations: 98234, successRate: 96.7 },
      { id: '3', name: 'Response Quality Filter', evaluations: 76543, successRate: 99.1 },
      { id: '4', name: 'Cost Optimization Engine', evaluations: 54321, successRate: 95.8 },
      { id: '5', name: 'Hallucination Detection', evaluations: 43210, successRate: 97.9 }
    ],
    
    organizationCoverage: 78.5,
    averageTogglesPerOrg: 12.4,
    
    growthRate: 8.2,
    lastUpdated: new Date().toISOString()
  };
};

export default ToggleStatusSummary;