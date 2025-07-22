// Epic 19.4 - Threat Detection Visualization Component
// Task: T-1752989145014 - Create frontend components for Security Monitoring & Incident Response

import React, { useState, useEffect } from 'react';
import {
  Shield,
  TrendingUp,
  Target,
  Eye,
  AlertTriangle,
  Activity,
  Zap,
  Globe,
  User,
  Clock,
  BarChart3,
  PieChart,
  Settings,
  RefreshCw
} from 'lucide-react';

interface ThreatData {
  id: string;
  type: 'malware' | 'phishing' | 'brute_force' | 'ddos' | 'injection' | 'data_breach';
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence: number;
  source_ip: string;
  target: string;
  detected_at: Date;
  status: 'active' | 'blocked' | 'investigating';
  description: string;
}

interface ThreatStats {
  total_threats: number;
  active_threats: number;
  blocked_threats: number;
  threat_types: Record<string, number>;
  severity_distribution: Record<string, number>;
  hourly_detection_rate: Array<{ hour: number; count: number }>;
}

interface ThreatDetectionVisualizerProps {
  onThreatClick?: (threat: ThreatData) => void;
  refreshInterval?: number;
}

export   const [stats, setStats] = useState<ThreatStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'realtime' | 'trends' | 'geo'>('realtime');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadThreatData();
    
    if (autoRefresh) {
      const interval = setInterval(loadThreatData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const loadThreatData = async () => {
    setIsLoading(true);
    
    // Mock data - replace with actual API calls
    setTimeout(() => {
      const mockThreats: ThreatData[] = [
        {
          id: 'threat-1',
          type: 'brute_force',
          severity: 'critical',
          confidence: 0.95,
          source_ip: '192.168.1.100',
          target: 'auth.company.com',
          detected_at: new Date(Date.now() - 2 * 60 * 1000),
          status: 'active',
          description: 'Coordinated brute force attack against authentication service'
        },
        {
          id: 'threat-2',
          type: 'injection',
          severity: 'high',
          confidence: 0.87,
          source_ip: '10.0.0.45',
          target: 'api.company.com',
          detected_at: new Date(Date.now() - 5 * 60 * 1000),
          status: 'blocked',
          description: 'SQL injection attempt detected in API parameters'
        },
        {
          id: 'threat-3',
          type: 'phishing',
          severity: 'medium',
          confidence: 0.72,
          source_ip: '203.0.113.50',
          target: 'users',
          detected_at: new Date(Date.now() - 8 * 60 * 1000),
          status: 'investigating',
          description: 'Suspicious email campaign targeting user credentials'
        },
        {
          id: 'threat-4',
          type: 'ddos',
          severity: 'high',
          confidence: 0.91,
          source_ip: '198.51.100.0/24',
          target: 'api.company.com',
          detected_at: new Date(Date.now() - 12 * 60 * 1000),
          status: 'blocked',
          description: 'Distributed denial of service attack from botnet'
        }
      ];

      const mockStats: ThreatStats = {
        total_threats: 47,
        active_threats: 3,
        blocked_threats: 41,
        threat_types: {
          brute_force: 15,
          injection: 12,
          phishing: 8,
          ddos: 7,
          malware: 3,
          data_breach: 2
        },
        severity_distribution: {
          critical: 5,
          high: 18,
          medium: 19,
          low: 5
        },
        hourly_detection_rate: Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          count: Math.floor(Math.random() * 10) + 1
        }))
      };

      setThreats(mockThreats);
      setStats(mockStats);
      setIsLoading(false);
    }, 1000);
  };

  const getThreatTypeIcon = (type: string) => {
    switch (type) {
      case 'brute_force': return <Target className="h-4 w-4" />;
      case 'injection': return <Zap className="h-4 w-4" />;
      case 'phishing': return <User className="h-4 w-4" />;
      case 'ddos': return <Globe className="h-4 w-4" />;
      case 'malware': return <AlertTriangle className="h-4 w-4" />;
      case 'data_breach': return <Shield className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-100 border-blue-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-red-600';
      case 'blocked': return 'text-green-600';
      case 'investigating': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getMaxHourlyCount = () => {
    return Math.max(...(stats?.hourly_detection_rate.map(h => h.count) || [1]));
  };

  if (isLoading && !stats) {
    return (
      <div className="threat-detection-visualizer loading">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading threat detection data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="threat-detection-visualizer">
      {/* Header */}
      <div className="visualizer-header">
        <div className="header-title">
          <Shield className="h-5 w-5 text-blue-600" />
          <h2>Threat Detection Analyzer</h2>
        </div>

        <div className="header-controls">
          <div className="view-tabs">
            <button 
              className={`view-tab ${viewMode === 'realtime' ? 'active' : ''}`}
              onClick={() => setViewMode('realtime')}
            >
              <Activity className="h-4 w-4" />
              Real-time
            </button>
            <button 
              className={`view-tab ${viewMode === 'trends' ? 'active' : ''}`}
              onClick={() => setViewMode('trends')}
            >
              <TrendingUp className="h-4 w-4" />
              Trends
            </button>
            <button 
              className={`view-tab ${viewMode === 'geo' ? 'active' : ''}`}
              onClick={() => setViewMode('geo')}
            >
              <Globe className="h-4 w-4" />
              Geographic
            </button>
          </div>

          <div className="control-buttons">
            <label className="auto-refresh-toggle">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
              <span>Auto-refresh</span>
            </label>
            
            <button 
              className="btn btn-secondary btn-sm"
              onClick={loadThreatData}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            <button className="btn btn-text btn-sm">
              <Settings className="h-4 w-4" />
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="threat-stats">
          <div className="stat-card primary">
            <div className="stat-icon">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.total_threats}</div>
              <div className="stat-label">Total Threats</div>
            </div>
          </div>

          <div className="stat-card danger">
            <div className="stat-icon">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.active_threats}</div>
              <div className="stat-label">Active Threats</div>
            </div>
          </div>

          <div className="stat-card success">
            <div className="stat-icon">
              <Target className="h-5 w-5 text-green-600" />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.blocked_threats}</div>
              <div className="stat-label">Blocked Threats</div>
            </div>
          </div>

          <div className="stat-card info">
            <div className="stat-icon">
              <BarChart3 className="h-5 w-5 text-purple-600" />
            </div>
            <div className="stat-content">
              <div className="stat-value">
                {((stats.blocked_threats / stats.total_threats) * 100).toFixed(1)}%
              </div>
              <div className="stat-label">Block Rate</div>
            </div>
          </div>
        </div>
      )}

      {/* Content based on view mode */}
      {viewMode === 'realtime' && (
        <div className="realtime-view">
          <div className="active-threats-section">
            <h3>Active Threats ({threats.filter(t => t.status === 'active').length})</h3>
            
            <div className="threats-list">
              {threats
                .filter(threat => threat.status === 'active')
                .map(threat => (
                  <div 
                    key={threat.id} 
                    className="threat-item active"
                    onClick={() => onThreatClick?.(threat)}
                  >
                    <div className="threat-indicator">
                      <div className="threat-pulse"></div>
                      {getThreatTypeIcon(threat.type)}
                    </div>
                    
                    <div className="threat-content">
                      <div className="threat-header">
                        <span className="threat-type">{threat.type.replace('_', ' ')}</span>
                        <span className={`threat-severity ${getSeverityColor(threat.severity)}`}>
                          {threat.severity}
                        </span>
                      </div>
                      
                      <p className="threat-description">{threat.description}</p>
                      
                      <div className="threat-meta">
                        <span className="threat-source">Source: {threat.source_ip}</span>
                        <span className="threat-target">Target: {threat.target}</span>
                        <span className="threat-confidence">
                          Confidence: {Math.round(threat.confidence * 100)}%
                        </span>
                      </div>
                    </div>

                    <div className="threat-status">
                      <span className={`status-indicator ${getStatusColor(threat.status)}`}>
                        {threat.status}
                      </span>
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="threat-time">
                        {Math.floor((Date.now() - threat.detected_at.getTime()) / 60000)}m ago
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="recent-threats-section">
            <h3>Recent Activity</h3>
            
            <div className="recent-threats-timeline">
              {threats
                .sort((a, b) => b.detected_at.getTime() - a.detected_at.getTime())
                .slice(0, 10)
                .map(threat => (
                  <div key={threat.id} className="timeline-threat">
                    <div className="timeline-marker">
                      {getThreatTypeIcon(threat.type)}
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <span className="threat-type">{threat.type.replace('_', ' ')}</span>
                        <span className={`status-badge ${getStatusColor(threat.status)}`}>
                          {threat.status}
                        </span>
                      </div>
                      <p className="timeline-description">{threat.description}</p>
                      <div className="timeline-time">
                        {Math.floor((Date.now() - threat.detected_at.getTime()) / 60000)} minutes ago
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {viewMode === 'trends' && stats && (
        <div className="trends-view">
          <div className="charts-grid">
            {/* Threat Types Distribution */}
            <div className="chart-card">
              <h3>Threat Types</h3>
              <div className="pie-chart-container">
                {Object.entries(stats.threat_types).map(([type, count]) => (
                  <div key={type} className="chart-item">
                    <div className="chart-bar">
                      <div 
                        className="chart-fill"
                        style={{ 
                          width: `${(count / Math.max(...Object.values(stats.threat_types))) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <div className="chart-label">
                      <span className="chart-type">{type.replace('_', ' ')}</span>
                      <span className="chart-count">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Severity Distribution */}
            <div className="chart-card">
              <h3>Severity Levels</h3>
              <div className="severity-chart">
                {Object.entries(stats.severity_distribution).map(([severity, count]) => (
                  <div key={severity} className="severity-item">
                    <div className="severity-label">
                      <span className={`severity-dot ${severity}`}></span>
                      <span className="capitalize">{severity}</span>
                    </div>
                    <div className="severity-count">{count}</div>
                    <div className="severity-bar">
                      <div 
                        className={`severity-fill ${severity}`}
                        style={{ 
                          width: `${(count / Math.max(...Object.values(stats.severity_distribution))) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hourly Detection Rate */}
            <div className="chart-card full-width">
              <h3>24-Hour Detection Rate</h3>
              <div className="hourly-chart">
                {stats.hourly_detection_rate.map(({ hour, count }) => (
                  <div key={hour} className="hour-bar">
                    <div 
                      className="bar-fill"
                      style={{ 
                        height: `${(count / getMaxHourlyCount()) * 100}%` 
                      }}
                      title={`${hour}:00 - ${count} threats`}
                    ></div>
                    <div className="hour-label">{hour}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'geo' && (
        <div className="geo-view">
          <div className="geo-placeholder">
            <Globe className="h-12 w-12 text-gray-400" />
            <h3>Geographic Threat Map</h3>
            <p>Interactive threat visualization map would be displayed here</p>
            <div className="geo-mock-data">
              <h4>Top Source Countries:</h4>
              <div className="country-list">
                <div className="country-item">
                  <span className="country-flag">🇨🇳</span>
                  <span className="country-name">China</span>
                  <span className="country-threats">23 threats</span>
                </div>
                <div className="country-item">
                  <span className="country-flag">🇷🇺</span>
                  <span className="country-name">Russia</span>
                  <span className="country-threats">18 threats</span>
                </div>
                <div className="country-item">
                  <span className="country-flag">🇺🇸</span>
                  <span className="country-name">United States</span>
                  <span className="country-threats">12 threats</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};