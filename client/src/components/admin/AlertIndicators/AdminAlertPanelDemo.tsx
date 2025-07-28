/**
 * Admin Alert Panel Demo Component
 * 
 * Epic 17.1.2 - Admin Dashboard UI
 * Task: E17-1753114396757-764E97 - Implement alert indicators
 * 
 * Demonstration of how to use AdminAlertPanel in different admin sections.
 * This can be used as a reference for integrating alerts into specific dashboards.
 */
import React, { useState } from 'react';
import AdminAlertPanel from './AdminAlertPanel';
import { AlertCount, AlertItem, createEmptyAlertCount } from './index';
const AdminAlertPanelDemo: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  // Mock alert data for different admin sections
  const featureToggleAlerts: AlertCount = {,
  critical: 1,
  high: 2,
  medium: 3,
  low: 1,
  info: 0,
};
  const userManagementAlerts: AlertCount = {,
  critical: 0,
  high: 1,
  medium: 2,
  low: 0,
  info: 1,
};
  const systemAlerts: AlertCount = {,
  critical: 2,
  high: 3,
  medium: 1,
  low: 0,
  info: 0,
};
  const mockRecentAlerts: AlertItem = [
    {
  id: 'alert-1',
  type: 'performance',
  severity: 'critical',
  title: 'High Memory Usage Detected',
  description: 'System memory usage has exceeded 85% threshold for more than 10 minutes',
  timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago,
  source: 'system-monitor',
  status: 'active',
  affectedComponent: 'API Gateway',
}
    {
  id: 'alert-2',
  type: 'security',
  severity: 'high',
  title: 'Multiple Failed Login Attempts',
  description: '15 failed login attempts detected from IP 192.168.1.100',
  timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago,
  source: 'auth-service',
  status: 'active',
  userId: 'user-123',
  userName: 'john.doe@example.com',
}
    {
  id: 'alert-3',
  type: 'feature-toggle',
  severity: 'medium',
  title: 'Feature Toggle Dependency Conflict',
  description: 'Toggle "advanced_search_v2" has conflicting dependencies with "search_filters"',
  timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago,
  source: 'feature-toggle-service',
  status: 'acknowledged',
  affectedComponent: 'Search Service',
}
    {
  id: 'alert-4',
  type: 'user-action',
  severity: 'high',
  title: 'Bulk User Deletion Detected',
  description: 'Administrator performed bulk deletion of 25 user accounts',
  timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago,
  source: 'user-management',
  status: 'resolved',
  userId: 'admin-456',
  userName: 'admin@example.com',
  affectedComponent: 'User Database',
}
    {
  id: 'alert-5',
  type: 'system',
  severity: 'info',
  title: 'Scheduled Maintenance Completed',
  description: 'Database maintenance window completed successfully',
  timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago,
  source: 'maintenance-scheduler',
  status: 'resolved',
  affectedComponent: 'Primary Database'];
  const handleRefresh = async () => {
  setIsLoading(true);
  // Simulate API call
  setTimeout(() => {
  setIsLoading(false);
}, 1000);
  };
  const handleViewAll = () => {
    console.log('Navigate to full alerts dashboard');
  };
  const handleAcknowledgeAll = () => {
    console.log('Acknowledge all active alerts');
  };
  return;
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Alert Indicators Demo</h1>
        <p className="text-gray-600 mb-8">
          This demonstrates how alert indicators can be integrated into different admin sections.
        </p>
        {/* Feature Toggle Alerts */}
        <AdminAlertPanel
          title="Feature Toggle Alerts"
          alertCounts={featureToggleAlerts}
          recentAlerts={mockRecentAlerts.filter(alert => alert.type === 'feature-toggle')}
          isLoading={isLoading}
          isExpanded={true}
          onRefresh={handleRefresh}
          onViewAll={handleViewAll}
          onAcknowledgeAll={handleAcknowledgeAll}
          className="mb-6"
        />
        {/* User Management Alerts */}
        <AdminAlertPanel
          title="User Management Alerts"
          alertCounts={userManagementAlerts}
          recentAlerts={mockRecentAlerts.filter(alert => alert.type === 'user-action' || alert.type === 'security')}
          isLoading={isLoading}
          isExpanded={false}
          onRefresh={handleRefresh}
          onViewAll={handleViewAll}
          onAcknowledgeAll={handleAcknowledgeAll}
          className="mb-6"
        />
        {/* System Alerts */}
        <AdminAlertPanel
          title="System Health Alerts"
          alertCounts={systemAlerts}
          recentAlerts={mockRecentAlerts.filter(alert => alert.type === 'performance' || alert.type === 'system')}
          isLoading={isLoading}
          isExpanded={true}
          onRefresh={handleRefresh}
          onViewAll={handleViewAll}
          onAcknowledgeAll={handleAcknowledgeAll}
          className="mb-6"
        />
        {/* No Alerts Example */}
        <AdminAlertPanel
          title="API Management Alerts"
          alertCounts={createEmptyAlertCount()}
          recentAlerts={[]}
          isLoading={isLoading}
          isExpanded={true}
          onRefresh={handleRefresh}
          onViewAll={handleViewAll}
          className="mb-6"
        />
        {/* Integration Notes */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Integration Notes</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• <strong>AdminLayout</strong>: Shows global alert status indicators in header and navigation</p>
            <p>• <strong>AdminAlertPanel</strong>: Can be embedded in any admin dashboard section</p>
            <p>• <strong>AlertIndicatorBadge</strong>: Displays alert counts with severity-based styling</p>
            <p>• <strong>AlertStatusIndicator</strong>: Shows overall system health with tooltips</p>
            <p>• <strong>Real-time updates</strong>: Components support live alert count updates</p>
            <p>• <strong>Responsive design</strong>: All components adapt to mobile and desktop layouts</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAlertPanelDemo;