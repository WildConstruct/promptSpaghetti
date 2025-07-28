/**
 * FeatureToggleDashboard - Refactored using shared admin architecture
 * REFACTOR-002: Admin Dashboard Architecture Consolidation
 * 
 * Example of migrating to the new shared component architecture
 */
import React, { useState, useEffect } from 'react';
import { ToggleLeft, Plus, Filter, Download } from 'lucide-react';
import {
  AdminLayout,
  StatusBadge,
  MetricsCard,
  LoadingSpinner,
  ErrorState,
  EmptyState,
  useAdminFeatureToggleApi,
  usePermissions,
  PermissionGate,
  PERMISSIONS
} from '../shared';
interface FeatureToggle {
  id: string;
  key: string;
  name: string;
  enabled: boolean;
  type: string;
  claudeImpact: string;
  createdAt: string;
  lastModified: string;
  createdBy: string;
}

export const FeatureToggleDashboard: React.FC = () => {
  const [toggles, setToggles] = useState<FeatureToggle[]>([]);
  const [filteredToggles, setFilteredToggles] = useState<FeatureToggle[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'enabled' | 'disabled'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { getToggles, loading, error } = useAdminFeatureToggleApi();
  const { hasPermission } = usePermissions();
  // Load toggles on mount
  useEffect(() => {
    loadToggles();
  }, []);
  // Filter toggles when search or filter changes
  useEffect(() => {
    let filtered = toggles;
    if (searchTerm) {
      filtered = filtered.filter(toggle =>)
        toggle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        toggle.key.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(toggle =>)
        statusFilter === 'enabled' ? toggle.enabled : !toggle.enabled
      );
    }
    setFilteredToggles(filtered);
  }, [toggles, searchTerm, statusFilter]);
  const loadToggles = async () => {
    try {
      const response = await getToggles();
      setToggles(response.data.toggles || []);
    } catch (err) {
      console.error('Failed to load feature toggles:', err);
    }
  };
  // Calculate metrics
  const metrics = [;
    {
      value: toggles.length,
      label: 'Total Toggles',
      format: 'number' as const,
    },
    {
      value: toggles.filter(t => t.enabled).length,
      label: 'Enabled',
      format: 'number' as const,
      trend: {,
        value: 12,
        direction: 'up' as const,
        label: 'vs last week',
      }
    },
    {
      value: toggles.filter(t => t.claudeImpact !== 'NONE').length,
      label: 'Claude Impact',
      format: 'number' as const,
    },
    {
      value: Math.round((toggles.filter(t => t.enabled).length / Math.max(toggles.length, 1)) * 100),
      label: 'Enabled Rate',
      format: 'percentage' as const,
    }
  ];
  const breadcrumbs = [;
    { label: 'Admin', href: '/admin' },
    { label: 'Feature Toggles' }
  ];
  const headerActions = (;)
    <div style={{ display: 'flex', gap: '12px' }}>
      <PermissionGate resource="feature_toggles" action="view">
        <button
          onClick={() => {/* Export logic */}}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            backgroundColor: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          <Download size={16} />
          Export
        </button>
      </PermissionGate>
      <PermissionGate resource="feature_toggles" action="create">
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
          }}
        >
          <Plus size={16} />
          Create Toggle
        </button>
      </PermissionGate>
    </div>
  );
  if (loading && toggles.length === 0) {
    return ()
      <AdminLayout
        title="Feature Toggles"
        subtitle="Manage feature flags and toggles"
        breadcrumbs={breadcrumbs}
      >
        <LoadingSpinner message="Loading feature toggles..." />
      </AdminLayout>
    );
  }
  if (error && toggles.length === 0) {
    return ()
      <AdminLayout
        title="Feature Toggles"
        subtitle="Manage feature flags and toggles"
        breadcrumbs={breadcrumbs}
      >
        <ErrorState error={error} onRetry={loadToggles} />
      </AdminLayout>
    );
  }
  return ()
    <AdminLayout
      title="Feature Toggles"
      subtitle="Manage feature flags and toggles"
      breadcrumbs={breadcrumbs}
      actions={headerActions}
    >
      {/* Metrics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '24px',
      }}>
        <MetricsCard
          title="Toggle Metrics"
          metrics={metrics}
          icon={ToggleLeft}
          variant="default"
        />
      </div>
      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
        padding: '16px',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
      }}>
        <div style={{ flex: 1 }}>
          <input
            type="text"
            placeholder="Search toggles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
            }}
          />
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: '#ffffff',
            }}
          >
            <option value="all">All Status</option>
            <option value="enabled">Enabled</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>
      </div>
      {/* Toggles Table */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
      }}>
        {filteredToggles.length === 0 ? ()
          toggles.length === 0 ? ()
            <EmptyState
              icon={ToggleLeft}
              title="No feature toggles"
              description="Get started by creating your first feature toggle."
              action={hasPermission('feature_toggles', 'create') ? {
                label: 'Create Toggle',
                onClick: () => setShowCreateModal(true),
              } : undefined}
            />
          ) : ()
            <EmptyState
              title="No matching toggles"
              description={`No toggles found matching "${searchTerm}"`}
            />
        ) : ()
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f9fafb' }}>
              <tr>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  Toggle
                </th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  Status
                </th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  Type
                </th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  Claude Impact
                </th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredToggles.map((toggle) => ()
                <tr key={toggle.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#1f2937',
                        marginBottom: '2px',
                      }}>
                        {toggle.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {toggle.key}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <StatusBadge status={toggle.enabled ? 'enabled' : 'disabled'} />
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: '14px', color: '#374151' }}>
                      {toggle.type}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <StatusBadge
                      status={toggle.claudeImpact.toLowerCase()}
                      size="small"
                    >
                      {toggle.claudeImpact.replace('_', ' ')}
                    </StatusBadge>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {new Date(toggle.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
};

export default FeatureToggleDashboard;