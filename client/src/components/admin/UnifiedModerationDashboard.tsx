/**
 * Epic 16 Unified Moderation Dashboard Component
 * Task: E16-1753114247011-98783E - Implement moderation tools
 * 
 * Comprehensive moderation dashboard that orchestrates all existing moderation
 * services into a unified interface. Provides real-time monitoring, advanced
 * search, bulk actions, and performance analytics.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  UnifiedModerationDashboard, 
  DashboardOverview, 
  ModerationAlert,
  ModerationWorkload,
  AdvancedSearchQuery,
  BulkModerationAction,
  DashboardMetrics
} from '../../../../packages/core/services/UnifiedModerationDashboard';
interface UnifiedModerationDashboardProps {
  moderatorId: string;,
  permissions: string;
  onNavigate?: (path: string) => void;
  export const UnifiedModerationDashboardComponent: React.FC<UnifiedModerationDashboardProps> = ({,)
  moderatorId,
  permissions,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onNavigate
}) => {
  // State management
  const [dashboard, setDashboard] = useState<UnifiedModerationDashboard | null>(null);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [workloads, setWorkloads] = useState<ModerationWorkload>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_searchResults, setSearchResults] = useState<unknown>([]);
  const [selectedItems, setSelectedItems] = useState<string>([]);
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'queue' | 'analytics' | 'workload' | 'search'>('overview');
  const [showAlerts, setShowAlerts] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  // Search and filter state
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_searchQuery, setSearchQuery] = useState<AdvancedSearchQuery>({});
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_showAdvancedSearch, _setShowAdvancedSearch] = useState(false);
  const loadInitialData = useCallback(async (dashboardService: UnifiedModerationDashboard): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const [overviewData, workloadData, metricsData] = await Promise.all([)
        dashboardService.getDashboardOverview(moderatorId),
        dashboardService.getModeratorWorkloads(),
        dashboardService.getDashboardMetrics()
      ]);
      setOverview(overviewData);
      setWorkloads(workloadData);
      setMetrics(metricsData);
    } catch (err) {
      setError(`Failed to load dashboard data: ${err instanceof Error ? err.message : 'Unknown error'}`);}
      console.error('Dashboard initialization failed:', err);
    } finally {
      setLoading(false);
  }, [moderatorId]);
  // Initialize dashboard service
  useEffect(() => {
  const dashboardService = new UnifiedModerationDashboard({)
  enableRealTimeUpdates: autoRefresh,
  autoRefreshInterval: 30000,
  enableAdvancedFiltering: true,
  enablePerformanceTracking: true,
  defaultModerationMode: 'assisted',
});
    setDashboard(dashboardService);
    loadInitialData(dashboardService);
  }, [moderatorId, autoRefresh, loadInitialData]);
  const refreshData = useCallback(async (): Promise<void> => {
    if (!dashboard) return;
    try {
      const newOverview = await dashboard.getDashboardOverview(moderatorId);
      setOverview(newOverview);
    } catch (err) {
  console.error('Failed to refresh dashboard:', err);
}, [dashboard, moderatorId]);
  // Auto-refresh data
  useEffect(() => {
    if (!dashboard || !autoRefresh) return;
    const interval = setInterval(() => {
      refreshData();
    }, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [dashboard, autoRefresh, refreshData]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setLoading(true);
    try {
      const results = await dashboard.advancedSearch(query, moderatorId);
      setSearchResults(results.items);
      setSearchQuery(query);
    } catch (err) {
      setError(`Search failed: ${err instanceof Error ? err.message : 'Unknown error'}`);}
    } finally {
      setLoading(false);
  }, [dashboard, moderatorId]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setLoading(true);
    try {
  const bulkAction: BulkModerationAction = {,
  ...action,
  itemIds: selectedItems,
};
      const result = await dashboard.executeBulkActions([bulkAction], moderatorId);
      // Show success message
      console.log(`✅ Bulk action completed: ${result.successful} successful, ${result.failed} failed`);}
      // Clear selection and refresh data
      setSelectedItems([]);
      await refreshData();
    } catch (err) {
      setError(`Bulk action failed: ${err instanceof Error ? err.message : 'Unknown error'}`);}
    } finally {
      setLoading(false);
  }, [dashboard, selectedItems, moderatorId, refreshData]);
  const handleWorkloadDistribution = async (type: 'urgent' | 'balanced' | 'expertise'): Promise<void> => {
    if (!dashboard || selectedItems.length === 0) return;
    setLoading(true);
    try {
      const result = await dashboard.distributeWorkload(selectedItems, type);
      console.log(`📊 Workload distributed: ${result.assignments.length} assignments`);}
      setSelectedItems([]);
      await refreshData();
    } catch (err) {
      setError(`Workload distribution failed: ${(err as Error).message}`);}
    } finally {
      setLoading(false);
  };
  // Computed values
  const hasPermission = useCallback((permission: string): boolean => {
  return permissions.includes(permission) || permissions.includes('moderation:admin');
}, [permissions]);
  const activeAlerts = useMemo(() => {
    return overview?.alerts.filter(alert => !alert.acknowledged) || [];
  }, [overview]);
  const criticalAlerts = useMemo(() => {
    return activeAlerts.filter(alert => alert.severity === 'critical');
  }, [activeAlerts]);
  // Render loading state
  if (loading && !overview) {
  return;
  <div style={{
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '400px',
  fontSize: '16px',
  color: '#6b7280',
}}>
        🔄 Loading moderation dashboard...
      </div>
    );
  // Render error state
  if (error) {
  return;
  <div style={{
  padding: '20px',
  backgroundColor: '#fef2f2',
  border: '1px solid #fecaca',
  borderRadius: '8px',
  color: '#dc2626',
}}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: '600' }}>
          ❌ Dashboard Error
        </h3>
        <p style={{ margin: 0, fontSize: '14px' }}>{error}</p>
        <button
          onClick={() => {
            setError(null);
            if (dashboard) loadInitialData(dashboard);
          }}
          style={{
  marginTop: '10px',
  padding: '6px 12px',
  backgroundColor: '#dc2626',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  fontSize: '12px',
  cursor: 'pointer',
}}
        >
          Retry
        </button>
      </div>
    );
  return;
    <div style={{
  padding: '20px',
  backgroundColor: '#ffffff',
  minHeight: '100vh',
}}>
      {/* Header */}
      <div style={{
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '20px',
  paddingBottom: '15px',
  borderBottom: '2px solid #e5e7eb',
}}>
        <div>
          <h1 style={{
  margin: 0,
  fontSize: '24px',
  fontWeight: '700',
  color: '#111827',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
}}>
            🛡️ Unified Moderation Dashboard
          </h1>
          <p style={{
  margin: '5px 0 0 0',
  fontSize: '14px',
  color: '#6b7280',
}}>
            Comprehensive moderation management and analytics
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Auto-refresh toggle */}
          <label style={{
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '12px',
  color: '#6b7280',
  cursor: 'pointer',
}}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              style={{ margin: 0 }}
            />
            Auto-refresh
          </label>
          {/* Manual refresh button */}
          <button
            onClick={refreshData}
            disabled={loading}
            style={{
  padding: '6px 12px',
  backgroundColor: '#3b82f6',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  fontSize: '12px',
  fontWeight: '500',
  cursor: loading ? 'not-allowed' : 'pointer',
  opacity: loading ? 0.6 : 1,
}}
          >
            {loading ? '🔄' : '↻'} Refresh
          </button>
        </div>
      </div>
      {/* Critical Alerts Banner */}
      {criticalAlerts.length > 0 && showAlerts && ()
        <div style={{
  marginBottom: '20px',
  padding: '12px 16px',
  backgroundColor: '#fef2f2',
  border: '1px solid #fecaca',
  borderRadius: '8px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}}>
          <div>
            <strong style={{ color: '#dc2626', fontSize: '14px' }}>
              🚨 {criticalAlerts.length} Critical Alert{criticalAlerts.length > 1 ? 's' : ''}
            </strong>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#7f1d1d' }}>
              {criticalAlerts[0]?.message}
              {criticalAlerts.length > 1 && ` (and ${criticalAlerts.length - 1} more)`}
            </p>
          </div>
          <button
            onClick={() => setShowAlerts(false)}
            style={{
  padding: '4px 8px',
  backgroundColor: 'transparent',
  border: 'none',
  fontSize: '16px',
  cursor: 'pointer',
  color: '#dc2626',
}}
          >
            ×
          </button>
        </div>
      )}
      {/* Tab Navigation */}
      <div style={{
  display: 'flex',
  borderBottom: '1px solid #e5e7eb',
  marginBottom: '20px',
}}>
        {[
          { key: 'overview', label: '📊 Overview', permission: 'moderation:view' },
          { key: 'queue', label: '📋 Queue', permission: 'moderation:queue' },
          { key: 'analytics', label: '📈 Analytics', permission: 'moderation:analytics' },
          { key: 'workload', label: '👥 Workload', permission: 'moderation:workload' },
          { key: 'search', label: '🔍 Search', permission: 'moderation:search' }
        ].map(tab => ()
          hasPermission(tab.permission) && ()
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as 'overview' | 'queue' | 'analytics' | 'workload' | 'search')}
              style={{
  padding: '12px 20px',
  backgroundColor: activeTab === tab.key ? '#f3f4f6' : 'transparent',
  border: 'none',
  borderBottom: activeTab === tab.key ? '2px solid #3b82f6' : '2px solid transparent',
  fontSize: '14px',
  fontWeight: activeTab === tab.key ? '600' : '400',
  color: activeTab === tab.key ? '#3b82f6' : '#6b7280',
  cursor: 'pointer',
  transition: 'all 0.2s',
}}
            >
              {tab.label}
            </button>
        ))}
      </div>
      {/* Tab Content */}
      {activeTab === 'overview' && overview && ()
        <div style={{ display: 'grid', gap: '20px' }}>
          {/* Summary Cards */}
          <div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '15px',
}}>
            <SummaryCard
              title="Total Items"
              value={overview.summary.totalItems}
              icon="📝"
              trend={overview.trends.volumeTrend}
            />
            <SummaryCard
              title="Pending Review"
              value={overview.summary.pendingReview}
              icon="⏳"
              color={overview.summary.pendingReview > 100 ? '#dc2626' : '#059669'}
            />
            <SummaryCard
              title="Auto Approved"
              value={overview.summary.autoApproved}
              icon="✅"
              color="#059669"
            />
            <SummaryCard
              title="Escalated"
              value={overview.summary.escalated}
              icon="⬆️"
              color={overview.summary.escalated > 50 ? '#dc2626' : '#d97706'}
            />
          </div>
          {/* Performance Metrics */}
          <div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '15px',
}}>
            <MetricCard
              title="Average Processing Time"
              value={`${overview.performance.avgProcessingTime} min`}
              subtitle="Target: <15 min"
              status={overview.performance.avgProcessingTime <= 15 ? 'good' : 'warning'}
            />
            <MetricCard
              title="24h Throughput"
              value={overview.performance.throughputLast24h}
              subtitle="Items processed"
              status="good"
            />
            <MetricCard
              title="SLA Compliance"
              value={`${overview.performance.slaCompliance}%`}
              subtitle="Target: >95%"
              status={overview.performance.slaCompliance >= 95 ? 'good' : 'warning'}
            />
            <MetricCard
              title="Moderator Efficiency"
              value={`${overview.performance.moderatorEfficiency}%`}
              subtitle="Overall performance"
              status={overview.performance.moderatorEfficiency >= 90 ? 'good' : 'warning'}
            />
          </div>
          {/* Active Alerts */}
          {activeAlerts.length > 0 && ()
            <div style={{
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '16px',
}}>
              <h3 style={{
  margin: '0 0 12px 0',
  fontSize: '16px',
  fontWeight: '600',
  color: '#111827',
}}>
                🚨 Active Alerts ({activeAlerts.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {activeAlerts.slice(0, 5).map(alert => ()
                  <AlertItem key={alert.id} alert={alert} />
                ))}
                {activeAlerts.length > 5 && ()
                  <p style={{
  margin: '8px 0 0 0',
  fontSize: '12px',
  color: '#6b7280',
  fontStyle: 'italic',
}}>
                    ...and {activeAlerts.length - 5} more alerts
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      {activeTab === 'workload' && ()
        <div style={{ display: 'grid', gap: '20px' }}>
          <div style={{
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}}>
            <h2 style={{
  margin: 0,
  fontSize: '18px',
  fontWeight: '600',
  color: '#111827',
}}>
              👥 Moderator Workloads
            </h2>
            {selectedItems.length > 0 && hasPermission('moderation:assign') && ()
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleWorkloadDistribution('urgent')}
                  style={{
  padding: '6px 12px',
  backgroundColor: '#dc2626',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  fontSize: '12px',
  cursor: 'pointer',
}}
                >
                  🚨 Urgent Assign
                </button>
                <button
                  onClick={() => handleWorkloadDistribution('balanced')}
                  style={{
  padding: '6px 12px',
  backgroundColor: '#3b82f6',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  fontSize: '12px',
  cursor: 'pointer',
}}
                >
                  ⚖️ Balanced
                </button>
                <button
                  onClick={() => handleWorkloadDistribution('expertise')}
                  style={{
  padding: '6px 12px',
  backgroundColor: '#059669',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  fontSize: '12px',
  cursor: 'pointer',
}}
                >
                  🎯 By Expertise
                </button>
              </div>
            )}
          </div>
          <div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
  gap: '16px',
}}>
            {workloads.map(workload => ()
              <WorkloadCard key={workload.moderatorId} workload={workload} />
            ))}
          </div>
        </div>
      )}
      {/* Additional tab content would go here... */}
      {activeTab === 'search' && ()
        <div style={{ display: 'grid', gap: '20px' }}>
          <h2 style={{
  margin: 0,
  fontSize: '18px',
  fontWeight: '600',
  color: '#111827',
}}>
            🔍 Advanced Search
          </h2>
          <div style={{
  padding: '16px',
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
}}>
            <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
              Advanced search functionality will be implemented here with filters for content type, status, date range, etc.
            </p>
          </div>
        </div>
      )}
      {activeTab === 'analytics' && metrics && ()
        <div style={{ display: 'grid', gap: '20px' }}>
          <h2 style={{
  margin: 0,
  fontSize: '18px',
  fontWeight: '600',
  color: '#111827',
}}>
            📈 Analytics & Insights
          </h2>
          <div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '16px',
}}>
            <div style={{
  padding: '16px',
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
}}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>
                Real-time Metrics
              </h3>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                <div>Active Moderators: {metrics.realTime.activeModerators}</div>
                <div>Items Being Reviewed: {metrics.realTime.itemsBeingReviewed}</div>
                <div>Average Wait Time: {metrics.realTime.averageWaitTime} min</div>
                <div>System Load: {metrics.realTime.systemLoad}%</div>
              </div>
            </div>
            <div style={{
  padding: '16px',
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
}}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>
                Predictions
              </h3>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                <div>Expected Volume (24h): {metrics.predictions.expectedVolume24h}</div>
                <div>Estimated Backlog: {metrics.predictions.estimatedBacklog}</div>
                <div>Additional Moderators Needed: {metrics.predictions.resourceNeeds.additionalModerators}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Components
const SummaryCard: React.FC<{,
  title: string;
  value: number;,
  icon: string;
  color?: string;
  trend?: string;
}> = ({ title, value, icon, color = '#3b82f6', trend }) => ()
  <div style={{
  padding: '16px',
  backgroundColor: 'white',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
}}>
    <div style={{
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '8px',
}}>
      <span style={{ fontSize: '20px' }}>{icon}</span>
      {trend && ()
        <span style={{
  fontSize: '12px',
  color: trend === 'increasing' ? '#dc2626' : trend === 'decreasing' ? '#059669' : '#6b7280',
}}>
          {trend === 'increasing' ? '📈' : trend === 'decreasing' ? '📉' : '➡️'}
        </span>
      )}
    </div>
    <div style={{
  fontSize: '24px',
  fontWeight: '700',
  color: color,
  marginBottom: '4px',
}}>
      {value.toLocaleString()}
    </div>
    <div style={{
  fontSize: '12px',
  color: '#6b7280',
  fontWeight: '500',
}}>
      {title}
    </div>
  </div>
);
const MetricCard: React.FC<{,
  title: string;
  value: string | number;,
  subtitle: string;
  status: 'good' | 'warning' | 'error';
}> = ({ title, value, subtitle, status }) => {
  const statusColors = {
  good: '#059669',
  warning: '#d97706',
  error: '#dc2626',
};
  return;
    <div style={{
  padding: '16px',
  backgroundColor: 'white',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
}}>
      <div style={{
  fontSize: '12px',
  color: '#6b7280',
  fontWeight: '500',
  marginBottom: '4px',
}}>
        {title}
      </div>
      <div style={{
  fontSize: '20px',
  fontWeight: '700',
  color: statusColors[status],
  marginBottom: '4px',
}}>
        {value}
      </div>
      <div style={{
  fontSize: '11px',
  color: '#9ca3af',
}}>
        {subtitle}
      </div>
    </div>
  );
};
const AlertItem: React.FC<{ alert: ModerationAlert }> = ({ alert }) => {
  const severityColors = {
  low: '#6b7280',
  medium: '#d97706',
  high: '#dc2626',
  critical: '#7c2d12',
};
  const severityIcons = {
  low: 'ℹ️',
  medium: '⚠️',
  high: '🚨',
  critical: '💀',
};
  return;
    <div style={{
      padding: '8px 12px',
      backgroundColor: 'white',
      border: `1px solid ${severityColors[alert.severity]}40`}
},
  borderRadius: '6px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px';
  }}>
      <span style={{ fontSize: '16px' }}>{severityIcons[alert.severity]}</span>
      <div style={{ flex: 1 }}>
        <div style={{
  fontSize: '13px',
  fontWeight: '500',
  color: severityColors[alert.severity],
  marginBottom: '2px',
}}>
          {alert.type.replace('_', ' ').toUpperCase()}
        </div>
        <div style={{
  fontSize: '12px',
  color: '#374151',
}}>
          {alert.message}
        </div>
      </div>
      <div style={{
  fontSize: '10px',
  color: '#9ca3af',
}}>
        {alert.timestamp.toLocaleTimeString()}
      </div>
    </div>
  );
};
const WorkloadCard: React.FC<{ workload: ModerationWorkload }> = ({ workload }) => {
  const utilizationColor = workload.utilization >= 95 ? '#dc2626' :,;
  workload.utilization >= 85 ? '#d97706' : '#059669';
  return;
  <div style={{
  padding: '16px',
  backgroundColor: 'white',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
}}>
      <div style={{
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '12px',
}}>
        <div style={{
  fontSize: '14px',
  fontWeight: '600',
  color: '#111827',
}}>
          Moderator {workload.moderatorId.slice(-6)}
        </div>
        <div style={{
  fontSize: '12px',
  fontWeight: '600',
  color: utilizationColor,
}}>
          {workload.utilization}%
        </div>
      </div>
      <div style={{
  marginBottom: '8px',
  backgroundColor: '#f3f4f6',
  borderRadius: '4px',
  height: '6px',
  overflow: 'hidden',
}}>
        <div style={{
          height: '100%',
          backgroundColor: utilizationColor,
          width: `${workload.utilization}%`}
},
  transition: 'width 0.3s ease';
  }} />
      </div>
      <div style={{
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '8px',
  fontSize: '11px',
  color: '#6b7280',
}}>
        <div>Load: {workload.currentLoad}/{workload.capacity}</div>
        <div>Avg Time: {workload.averageResolutionTime}m</div>
        <div>Accuracy: {workload.accuracy}%</div>
        <div>Rating: {workload.performanceRating}/5</div>
      </div>
      {workload.specializations.length > 0 && ()
        <div style={{
  marginTop: '8px',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '4px',
}}>
          {workload.specializations.map(spec => ()
            <span
              key={spec}
              style={{
  padding: '2px 6px',
  backgroundColor: '#eff6ff',
  color: '#2563eb',
  borderRadius: '4px',
  fontSize: '10px',
  fontWeight: '500',
}}
            >
              {spec.replace('_', ' ')}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default UnifiedModerationDashboardComponent;