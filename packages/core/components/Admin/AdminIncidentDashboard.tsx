/**
 * Admin Incident Dashboard - Epic 17
 * 
 * Specialized incident management dashboard for Epic 17 Backstage Admin Controls.
 * Provides real-time monitoring, playbook execution, and incident response
 * capabilities for all Epic 17 systems.
 * 
 * Task: E17-1753114397260-08F809 - Create incident playbooks
 * Epic: 17 - Backstage Admin Controls
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle,
  Activity,
  Shield,
  Settings,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  ArrowUp,
  ArrowDown,
  Bell,
  TrendingUp,
  RefreshCw,
  Filter as _Filter,
  Download as _Download,
  ChevronRight as _ChevronRight,
  AlertCircle,
  Info as _Info
} from 'lucide-react';
import {
  Epic17IncidentPlaybook as _Epic17IncidentPlaybook,
  PlaybookCategory,
  Epic17System,
  PlaybookExecutionResult,
  PlaybookExecutionContext as _PlaybookExecutionContext,
  BusinessImpact,
  UserImpact,
  HealthCheckTrigger as _HealthCheckTrigger,
  AlertTrigger as _AlertTrigger,
  MetricThreshold as _MetricThreshold
} from '../../types/Epic17IncidentPlaybooks';
import { ActionSeverity } from '../../types/EnforcementTypes';
interface AdminIncidentDashboardProps {
  onPlaybookExecute?: (playbookId: string, options: ExecutionOptions) => Promise<void>;
  onIncidentCreate?: (incident: IncidentCreationData) => Promise<void>;
  className?: string;
}
interface ExecutionOptions {
  manualTrigger?: boolean;
  userId?: string;
  urgencyOverride?: ActionSeverity;
  skipApproval?: boolean;
  dryRun?: boolean;
}
interface IncidentCreationData {
  title: string;
  description: string;
  severity: ActionSeverity;
  affectedSystems: Epic17System[];
  category: PlaybookCategory;
}
interface DashboardState {
  activeIncidents: ActiveIncident[];
  playbookExecutions: PlaybookExecution[];
  systemHealth: SystemHealthStatus[];
  alertsSummary: AlertsSummary;
  performanceMetrics: PerformanceMetrics;
  recentActivity: ActivityLog[];
}
interface ActiveIncident {
  id: string;
  title: string;
  severity: ActionSeverity;
  status: 'investigating' | 'responding' | 'monitoring' | 'resolved';
  affectedSystems: Epic17System[];
  startTime: Date;
  assignedTo: string;
  playbooks: string[];
  businessImpact: BusinessImpact;
  userImpact: UserImpact;
  timeline: IncidentTimelineEntry[];
}
interface PlaybookExecution {
  executionId: string;
  playbookId: string;
  playbookName: string;
  category: PlaybookCategory;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  startTime: Date;
  endTime?: Date;
  triggeredBy: string;
  affectedSystems: Epic17System[];
  result?: PlaybookExecutionResult;
}
interface SystemHealthStatus {
  system: Epic17System;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  lastCheck: Date;
  uptime: number;
  responseTime: number;
  errorRate: number;
  alertCount: number;
  healthScore: number;
}
interface AlertsSummary {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  recent: Alert[];
  trends: AlertTrend[];
}
interface Alert {
  id: string;
  title: string;
  severity: ActionSeverity;
  system: Epic17System;
  timestamp: Date;
  acknowledged: boolean;
  playbookTriggered: boolean;
}
interface AlertTrend {
  system: Epic17System;
  count: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  severity: ActionSeverity;
}
interface PerformanceMetrics {
  mttr: number; // Mean Time To Recovery (minutes)
  mtbf: number; // Mean Time Between Failures (hours)
  playbookSuccessRate: number; // percentage
  automatedResolutionRate: number; // percentage
  escalationRate: number; // percentage
  userSatisfactionScore: number; // 1-5
}
interface ActivityLog {
  id: string;
  timestamp: Date;
  type: 'playbook_execution' | 'incident_created' | 'system_alert' | 'manual_action';
  description: string;
  severity: ActionSeverity;
  system?: Epic17System;
  userId?: string;
}
interface IncidentTimelineEntry {
  timestamp: Date;
  type: 'created' | 'playbook_executed' | 'escalated' | 'resolved' | 'note_added';
  description: string;
  userId: string;
  data?: unknown;
}

export const AdminIncidentDashboard: React.FC<AdminIncidentDashboardProps> = ({)
  onPlaybookExecute,
  onIncidentCreate,
  className = ''
}) => {
  // State management
  const [dashboardState, setDashboardState] = useState<DashboardState | null>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'incidents' | 'playbooks' | 'systems' | 'analytics'>('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [_____filters, _____setFilters] = useState({)
    severity: [] as ActionSeverity[],
    systems: [] as Epic17System[],
    timeRange: '24h' as '1h' | '24h' | '7d' | '30d'
  });
  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      // Simulate API calls - would be replaced with actual service calls
      const mockDashboardState: DashboardState = {
        activeIncidents: [,
          {
            id: 'INC-001',
            title: 'Feature Toggle System Degradation',
            severity: 'high',
            status: 'responding',
            affectedSystems: ['feature_management'],
            startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
            assignedTo: 'admin-user-1',
            playbooks: ['feature-toggle-recovery'],
            businessImpact: {,
              severity: 'high',
              affectedUsers: 15000,
              revenueImpact: 50000,
              reputationRisk: 'medium',
              complianceRisk: 'low',
              description: 'Feature toggles not responding, affecting user experience'
            },
            userImpact: {,
              adminUsers: { affected: true, count: 25, impactType: 'degraded_performance', severity: 'high', estimatedDuration: 60 },
              regularUsers: { affected: true, count: 15000, impactType: 'limited_functionality', severity: 'medium', estimatedDuration: 30 },
              externalUsers: { affected: false, count: 0, impactType: 'service_unavailable', severity: 'low', estimatedDuration: 0 },
              systemUsers: { affected: true, count: 5, impactType: 'service_unavailable', severity: 'high', estimatedDuration: 45 }
            },
            timeline: [,
              {
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
                type: 'created',
                description: 'Incident created due to health check failure',
                userId: 'system',
              },
              {
                timestamp: new Date(Date.now() - 110 * 60 * 1000),
                type: 'playbook_executed',
                description: 'Feature Toggle Recovery playbook executed',
                userId: 'system',
              }
            ]
          }
        ],
        playbookExecutions: [,
          {
            executionId: 'EX-001',
            playbookId: 'feature-toggle-recovery',
            playbookName: 'Feature Toggle Emergency Recovery',
            category: 'feature_toggle_emergency',
            status: 'completed',
            progress: 100,
            startTime: new Date(Date.now() - 110 * 60 * 1000),
            endTime: new Date(Date.now() - 95 * 60 * 1000),
            triggeredBy: 'health-check-system',
            affectedSystems: ['feature_management'],
          }
        ],
        systemHealth: [,
          {
            system: 'feature_management',
            status: 'degraded',
            lastCheck: new Date(),
            uptime: 98.5,
            responseTime: 450,
            errorRate: 2.3,
            alertCount: 3,
            healthScore: 75,
          },
          {
            system: 'content_management',
            status: 'healthy',
            lastCheck: new Date(),
            uptime: 99.9,
            responseTime: 120,
            errorRate: 0.1,
            alertCount: 0,
            healthScore: 98,
          },
          {
            system: 'user_permission_management',
            status: 'healthy',
            lastCheck: new Date(),
            uptime: 99.7,
            responseTime: 85,
            errorRate: 0.2,
            alertCount: 1,
            healthScore: 95,
          }
        ],
        alertsSummary: {,
          total: 12,
          critical: 1,
          high: 3,
          medium: 5,
          low: 3,
          recent: [,
            {
              id: 'ALT-001',
              title: 'Feature toggle response time exceeded',
              severity: 'high',
              system: 'feature_management',
              timestamp: new Date(Date.now() - 30 * 60 * 1000),
              acknowledged: true,
              playbookTriggered: true,
            }
          ],
          trends: [,
            {
              system: 'feature_management',
              count: 8,
              trend: 'increasing',
              severity: 'high',
            }
          ]
        },
        performanceMetrics: {,
          mttr: 15.5,
          mtbf: 168,
          playbookSuccessRate: 92,
          automatedResolutionRate: 78,
          escalationRate: 12,
          userSatisfactionScore: 4.2,
        },
        recentActivity: [,
          {
            id: 'ACT-001',
            timestamp: new Date(Date.now() - 15 * 60 * 1000),
            type: 'playbook_execution',
            description: 'Feature Toggle Recovery playbook completed successfully',
            severity: 'medium',
            system: 'feature_management',
            userId: 'system',
          }
        ]
      };
      setDashboardState(mockDashboardState);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);
  const refreshDashboard = useCallback(async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  }, [loadDashboardData]);
  useEffect(() => {
    loadDashboardData();
    // Set up auto-refresh
    const interval = setInterval(refreshDashboard, 30000); // 30 seconds;
    return () => clearInterval(interval);
  }, [loadDashboardData, refreshDashboard]);
  // Event handlers
  const handlePlaybookExecute = async (playbookId: string, options: ExecutionOptions) => {
    if (onPlaybookExecute) {
      await onPlaybookExecute(playbookId, options);
      await refreshDashboard();
    }
  };
  const handleIncidentCreate = async (incident: IncidentCreationData) => {
    if (onIncidentCreate) {
      await onIncidentCreate(incident);
      await refreshDashboard();
    }
  };
  if (loading) {
    return ()
      <div className={`admin-incident-dashboard loading ${className}`}>}
        <div className="loading-spinner">
          <RefreshCw className="animate-spin" size={24} />
          <span>Loading incident dashboard...</span>
        </div>
      </div>
    );
  }
  if (!dashboardState) {
    return ()
      <div className={`admin-incident-dashboard error ${className}`}>}
        <div className="error-message">
          <AlertCircle size={24} />
          <span>Failed to load incident dashboard</span>
          <button onClick={refreshDashboard}>Retry</button>
        </div>
      </div>
    );
  }
  return ()
    <div className={`admin-incident-dashboard ${className}`}>}
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Epic 17 Incident Dashboard</h1>
          <div className="header-stats">
            <div className="stat">
              <AlertTriangle className="text-red-500" size={16} />
              <span>{dashboardState.activeIncidents.length} Active</span>
            </div>
            <div className="stat">
              <Activity className="text-blue-500" size={16} />
              <span>{dashboardState.playbookExecutions.filter(p => p.status === 'running').length} Running</span>
            </div>
            <div className="stat">
              <Shield className="text-green-500" size={16} />
              <span>{dashboardState.systemHealth.filter(s => s.status === 'healthy').length}/{dashboardState.systemHealth.length} Healthy</span>
            </div>
          </div>
          <div className="header-actions">
            <button
              onClick={refreshDashboard}
              disabled={refreshing}
              className="refresh-button"
            >
              <RefreshCw className={refreshing ? 'animate-spin' : ''} size={16} />
              Refresh
            </button>
            <button className="create-incident-button">
              <AlertTriangle size={16} />
              Create Incident
            </button>
          </div>
        </div>
        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button
            className={`tab ${selectedTab === 'overview' ? 'active' : ''}`}
            onClick={() => setSelectedTab('overview')}
          >
            <Activity size={16} />
            Overview
          </button>
          <button
            className={`tab ${selectedTab === 'incidents' ? 'active' : ''}`}
            onClick={() => setSelectedTab('incidents')}
          >
            <AlertTriangle size={16} />
            Incidents
          </button>
          <button
            className={`tab ${selectedTab === 'playbooks' ? 'active' : ''}`}
            onClick={() => setSelectedTab('playbooks')}
          >
            <Play size={16} />
            Playbooks
          </button>
          <button
            className={`tab ${selectedTab === 'systems' ? 'active' : ''}`}
            onClick={() => setSelectedTab('systems')}
          >
            <Settings size={16} />
            Systems
          </button>
          <button
            className={`tab ${selectedTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setSelectedTab('analytics')}
          >
            <TrendingUp size={16} />
            Analytics
          </button>
        </div>
      </div>
      {/* Dashboard Content */}
      <div className="dashboard-content">
        {selectedTab === 'overview' && ()
          <OverviewTab
            dashboardState={dashboardState}
            onPlaybookExecute={handlePlaybookExecute}
            onIncidentCreate={handleIncidentCreate}
          />
        )}
        {selectedTab === 'incidents' && ()
          <IncidentsTab
            incidents={dashboardState.activeIncidents}
            onIncidentCreate={handleIncidentCreate}
          />
        )}
        {selectedTab === 'playbooks' && ()
          <PlaybooksTab
            executions={dashboardState.playbookExecutions}
            onPlaybookExecute={handlePlaybookExecute}
          />
        )}
        {selectedTab === 'systems' && ()
          <SystemsTab
            systemHealth={dashboardState.systemHealth}
            alertsSummary={dashboardState.alertsSummary}
          />
        )}
        {selectedTab === 'analytics' && ()
          <AnalyticsTab
            performanceMetrics={dashboardState.performanceMetrics}
            recentActivity={dashboardState.recentActivity}
          />
        )}
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab: React.FC<{
  dashboardState: DashboardState;
  onPlaybookExecute: (playbookId: string, options: ExecutionOptions) => Promise<void>;
  onIncidentCreate: (incident: IncidentCreationData) => Promise<void>;
}> = ({ dashboardState, onPlaybookExecute: _onPlaybookExecute, onIncidentCreate: _onIncidentCreate }) => {
  return ()
    <div className="overview-tab">
      {/* Critical Alerts Section */}
      <div className="critical-section">
        <h2>
          <AlertCircle className="text-red-500" size={20} />
          Critical Issues
        </h2>
        <div className="critical-cards">
          {dashboardState.activeIncidents
            .filter(incident => incident.severity === 'critical' || incident.severity === 'high')
            .map(incident => ()
              <IncidentCard key={incident.id} incident={incident} />
            ))}
          {dashboardState.alertsSummary.recent
            .filter(alert => alert.severity === 'critical')
            .map(alert => ()
              <AlertCard key={alert.id} alert={alert} />
            ))}
        </div>
      </div>
      {/* System Health Overview */}
      <div className="system-health-overview">
        <h2>
          <Shield size={20} />
          System Health
        </h2>
        <div className="health-grid">
          {dashboardState.systemHealth.map(system => ()
            <SystemHealthCard key={system.system} health={system} />
          ))}
        </div>
      </div>
      {/* Running Playbooks */}
      <div className="running-playbooks">
        <h2>
          <Play size={20} />
          Active Playbooks
        </h2>
        <div className="playbook-executions">
          {dashboardState.playbookExecutions
            .filter(execution => execution.status === 'running')
            .map(execution => ()
              <PlaybookExecutionCard key={execution.executionId} execution={execution} />
            ))}
        </div>
      </div>
      {/* Performance Metrics */}
      <div className="performance-overview">
        <h2>
          <TrendingUp size={20} />
          Performance Metrics
        </h2>
        <div className="metrics-grid">
          <MetricCard
            label="MTTR"
            value={`${dashboardState.performanceMetrics.mttr} min`}
            trend="down"
            good={dashboardState.performanceMetrics.mttr < 20}
          />
          <MetricCard
            label="Success Rate"
            value={`${dashboardState.performanceMetrics.playbookSuccessRate}%`}
            trend="up"
            good={dashboardState.performanceMetrics.playbookSuccessRate > 90}
          />
          <MetricCard
            label="Automation Rate"
            value={`${dashboardState.performanceMetrics.automatedResolutionRate}%`}
            trend="stable"
            good={dashboardState.performanceMetrics.automatedResolutionRate > 75}
          />
        </div>
      </div>
    </div>
  );
};

// Supporting Components
const IncidentCard: React.FC<{ incident: ActiveIncident }> = ({ incident }) => {
  const severityColors = {
    critical: 'border-red-500 bg-red-50',
    high: 'border-orange-500 bg-orange-50',
    medium: 'border-yellow-500 bg-yellow-50',
    low: 'border-blue-500 bg-blue-50'
  };
  return ()
    <div className={`incident-card ${severityColors[incident.severity]}`}>}
      <div className="card-header">
        <span className="incident-id">{incident.id}</span>
        <span className={`severity-badge ${incident.severity}`}>}
          {incident.severity.toUpperCase()}
        </span>
      </div>
      <h3 className="incident-title">{incident.title}</h3>
      <div className="incident-meta">
        <div className="meta-item">
          <Clock size={14} />
          <span>{Math.floor((Date.now() - incident.startTime.getTime()) / 60000)} min ago</span>
        </div>
        <div className="meta-item">
          <Users size={14} />
          <span>{incident.businessImpact.affectedUsers.toLocaleString()} affected</span>
        </div>
      </div>
      <div className="affected-systems">
        {incident.affectedSystems.map(system => ()
          <span key={system} className="system-tag">{system}</span>
        ))}
      </div>
    </div>
  );
};
const AlertCard: React.FC<{ alert: Alert }> = ({ alert }) => {
  return ()
    <div className={`alert-card ${alert.severity}`}>}
      <div className="alert-header">
        <Bell size={16} />
        <span className="alert-time">
          {Math.floor((Date.now() - alert.timestamp.getTime()) / 60000)} min ago
        </span>
      </div>
      <h4 className="alert-title">{alert.title}</h4>
      <div className="alert-system">{alert.system}</div>
      {alert.playbookTriggered && ()
        <div className="playbook-triggered">
          <CheckCircle size={14} />
          <span>Playbook triggered</span>
        </div>
      )}
    </div>
  );
};
const SystemHealthCard: React.FC<{ health: SystemHealthStatus }> = ({ health }) => {
  const statusColors = {
    healthy: 'text-green-500 bg-green-50',
    degraded: 'text-yellow-500 bg-yellow-50',
    unhealthy: 'text-red-500 bg-red-50',
    unknown: 'text-gray-500 bg-gray-50'
  };
  return ()
    <div className="system-health-card">
      <div className="system-header">
        <span className="system-name">{health.system.replace('_', ' ')}</span>
        <span className={`status-indicator ${statusColors[health.status]}`}>}
          {health.status}
        </span>
      </div>
      <div className="health-metrics">
        <div className="metric">
          <span className="metric-label">Uptime</span>
          <span className="metric-value">{health.uptime}%</span>
        </div>
        <div className="metric">
          <span className="metric-label">Response</span>
          <span className="metric-value">{health.responseTime}ms</span>
        </div>
        <div className="metric">
          <span className="metric-label">Errors</span>
          <span className="metric-value">{health.errorRate}%</span>
        </div>
      </div>
      <div className="health-score">
        <div className="score-label">Health Score</div>
        <div className="score-value">{health.healthScore}/100</div>
      </div>
    </div>
  );
};
const PlaybookExecutionCard: React.FC<{ execution: PlaybookExecution }> = ({ execution }) => {
  const statusIcons = {
    running: <Play className="text-blue-500" size={16} />,
    completed: <CheckCircle className="text-green-500" size={16} />,
    failed: <XCircle className="text-red-500" size={16} />,
    cancelled: <Pause className="text-gray-500" size={16} />
  };
  return ()
    <div className="playbook-execution-card">
      <div className="execution-header">
        {statusIcons[execution.status]}
        <span className="playbook-name">{execution.playbookName}</span>
      </div>
      <div className="execution-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${execution.progress}%` }}
          />
        </div>
        <span className="progress-text">{execution.progress}%</span>
      </div>
      <div className="execution-meta">
        <span className="execution-time">
          {Math.floor((Date.now() - execution.startTime.getTime()) / 60000)} min
        </span>
        <span className="triggered-by">by {execution.triggeredBy}</span>
      </div>
    </div>
  );
};
const MetricCard: React.FC<{
  label: string;
  value: string;
  trend: 'up' | 'down' | 'stable';
  good: boolean;
}> = ({ label, value, trend, good }) => {
  const trendIcons = {
    up: <ArrowUp className={good ? 'text-green-500' : 'text-red-500'} size={16} />,
    down: <ArrowDown className={good ? 'text-green-500' : 'text-red-500'} size={16} />,
    stable: <div className="w-4 h-1 bg-gray-400" />
  };
  return ()
    <div className="metric-card">
      <div className="metric-header">
        <span className="metric-label">{label}</span>
        {trendIcons[trend]}
      </div>
      <div className={`metric-value ${good ? 'text-green-600' : 'text-red-600'}`}>}
        {value}
      </div>
    </div>
  );
};

// Placeholder components for other tabs
const IncidentsTab: React.FC<{
  incidents: ActiveIncident[];
  onIncidentCreate: (incident: IncidentCreationData) => Promise<void>;
}> = ({ incidents, onIncidentCreate: _onIncidentCreate }) => {
  return ()
    <div className="incidents-tab">
      <div className="tab-header">
        <h2>Active Incidents</h2>
        <button className="create-button">Create Incident</button>
      </div>
      <div className="incidents-list">
        {incidents.map(incident => ()
          <IncidentListItem key={incident.id} incident={incident} />
        ))}
      </div>
    </div>
  );
};
const PlaybooksTab: React.FC<{
  executions: PlaybookExecution[];
  onPlaybookExecute: (playbookId: string, options: ExecutionOptions) => Promise<void>;
}> = ({ executions, onPlaybookExecute: _onPlaybookExecute }) => {
  return ()
    <div className="playbooks-tab">
      <div className="tab-header">
        <h2>Playbook Executions</h2>
        <button className="execute-button">Execute Playbook</button>
      </div>
      <div className="executions-list">
        {executions.map(execution => ()
          <PlaybookExecutionItem key={execution.executionId} execution={execution} />
        ))}
      </div>
    </div>
  );
};
const SystemsTab: React.FC<{
  systemHealth: SystemHealthStatus[];
  alertsSummary: AlertsSummary;
}> = ({ systemHealth, alertsSummary }) => {
  return ()
    <div className="systems-tab">
      <div className="tab-header">
        <h2>System Health</h2>
        <div className="health-summary">
          {alertsSummary.total} alerts ({alertsSummary.critical} critical)
        </div>
      </div>
      <div className="systems-grid">
        {systemHealth.map(health => ()
          <SystemHealthCard key={health.system} health={health} />
        ))}
      </div>
    </div>
  );
};
const AnalyticsTab: React.FC<{
  performanceMetrics: PerformanceMetrics;
  recentActivity: ActivityLog[];
}> = ({ performanceMetrics, recentActivity: _recentActivity }) => {
  return ()
    <div className="analytics-tab">
      <div className="tab-header">
        <h2>Performance Analytics</h2>
      </div>
      <div className="analytics-content">
        <div className="metrics-overview">
          <MetricCard
            label="MTTR"
            value={`${performanceMetrics.mttr} min`}
            trend="down"
            good={performanceMetrics.mttr < 20}
          />
          <MetricCard
            label="MTBF"
            value={`${performanceMetrics.mtbf} hrs`}
            trend="up"
            good={performanceMetrics.mtbf > 100}
          />
          <MetricCard
            label="Success Rate"
            value={`${performanceMetrics.playbookSuccessRate}%`}
            trend="up"
            good={performanceMetrics.playbookSuccessRate > 90}
          />
        </div>
      </div>
    </div>
  );
};

// Placeholder item components
const IncidentListItem: React.FC<{ incident: ActiveIncident }> = ({ incident }) => ()
  <div className="incident-list-item">
    <span className="incident-title">{incident.title}</span>
    <span className={`severity-badge ${incident.severity}`}>{incident.severity}</span>}
  </div>
);
const PlaybookExecutionItem: React.FC<{ execution: PlaybookExecution }> = ({ execution }) => ()
  <div className="playbook-execution-item">
    <span className="playbook-name">{execution.playbookName}</span>
    <span className={`status-badge ${execution.status}`}>{execution.status}</span>}
  </div>
);

export default AdminIncidentDashboard;