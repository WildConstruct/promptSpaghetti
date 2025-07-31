// Epic 17.1.2 - Main Admin Dashboard Component
import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import { FeatureToggleDashboard } from './FeatureToggleDashboard';
import { ApiManagementDashboard } from './ApiManagementDashboard';
import { ModerationAdminDashboard } from './ModerationAdminDashboard';
import { LogVisualizationDashboard } from './logs/LogVisualizationDashboard';
import { AuditLogViewer } from './audit/AuditLogViewer';
import DataProtectionDashboard from './DataProtectionDashboard';
import './AdminLayout.css';

// Placeholder components for other sections
const UserManagementDashboard: React.FC = () => (
  <div style={{ padding: '24px', textAlign: 'center' }}>
    <h2>User Management</h2>
    <p>User management functionality will be implemented in Epic 17.3</p>
  </div>
);
const ContentManagementDashboard: React.FC = () => (
  <ModerationAdminDashboard />
);
const MarketplaceAdminDashboard: React.FC = () => (
  <div style={{ padding: '24px', textAlign: 'center' }}>
    <h2>Marketplace Administration</h2>
    <p>Marketplace administration functionality will be implemented in Epic 17.5</p>
  </div>
);
const AnalyticsMonitoringDashboard: React.FC = () => (
  <LogVisualizationDashboard />
);
const SystemConfigurationDashboard: React.FC = () => (
  <div style={{ padding: '24px', textAlign: 'center' }}>
    <h2>System Configuration</h2>
    <p>System configuration functionality will be implemented in Epic 17.4</p>
  </div>
);


  const renderCurrentSection = () => {
  switch (currentSection) {
  case 'feature-toggles':,
  return <FeatureToggleDashboard />;
  case 'users':,
  return <UserManagementDashboard />;
  case 'content':,
  return <ContentManagementDashboard />;
  case 'api-management':,
  return <ApiManagementDashboard />;
  case 'marketplace':,
  return <MarketplaceAdminDashboard />;
  case 'analytics':,
  return <AnalyticsMonitoringDashboard />;
  case 'system':,
  return <SystemConfigurationDashboard />;
  case 'audit-logs':,
  return <AuditLogViewer />;
  case 'data-protection':,
  return <DataProtectionDashboard />;
  default:,
  return <FeatureToggleDashboard />;
};
  return;
    <AdminLayout 
      currentSection={currentSection}
      onSectionChange={setCurrentSection}
    >
      {renderCurrentSection()}
    </AdminLayout>
  );
};