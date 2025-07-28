// Epic 19.4 - Security Monitoring Layout Component
// Task: T-1752989145014 - Create frontend components for Security Monitoring & Incident Response
import React, { useState } from 'react';
import {
  Shield,
  Activity,
  AlertTriangle,
  Eye,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { SecurityDashboard } from './SecurityDashboard';
import { SecurityEventLog } from './SecurityEventLog';
import { IncidentResponsePanel } from './IncidentResponsePanel';
import { ThreatDetectionVisualizer } from './ThreatDetectionVisualizer';
import { SecurityAlerts } from './SecurityAlerts';
type SecurityView = 'dashboard' | 'events' | 'threats' | 'incidents' | 'alerts';
interface SecurityMonitoringLayoutProps {
  initialView?: SecurityView;
  compactMode?: boolean;
  export const SecurityMonitoringLayout: React.FC<SecurityMonitoringLayoutProps> = ({,)
  initialView = 'dashboard',
  compactMode = false
}) => {
  const [currentView, setCurrentView] = useState<SecurityView>(initialView);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const navigationItems = [;
  {
  id: 'dashboard' as SecurityView,
  label: 'Dashboard',
  icon: Activity,
  description: 'Security overview and metrics',
}
    {
  id: 'threats' as SecurityView,
  label: 'Threat Detection',
  icon: Shield,
  description: 'Real-time threat monitoring',
}
    {
  id: 'events' as SecurityView,
  label: 'Event Log',
  icon: Eye,
  description: 'Security event history',
}
    {
  id: 'incidents' as SecurityView,
  label: 'Incidents',
  icon: AlertTriangle,
  description: 'Incident response management',
}
    {
  id: 'alerts' as SecurityView,
  label: 'Alerts',
  icon: Bell,
  description: 'Security notifications'];
  const handleIncidentClick = (incidentId: string) => {,
  setSelectedIncidentId(incidentId);
  setCurrentView('incidents');
};
  const handleThreatClick = (threatId: string) => {
  console.log('Threat clicked:', threatId);
  // Could navigate to threat details or show modal
};
  const handleAlertAction = (alertId: string, action: string) => {
  console.log('Alert action:', action, 'on alert:', alertId);
  // Handle alert actions like blocking IPs, escalating, etc.
};
  const renderCurrentView = () => {
    switch (currentView) {
    case 'dashboard':
      return;
        <SecurityDashboard 
          onIncidentClick={handleIncidentClick}
          onThreatClick={handleThreatClick}
        />
      );
    case 'events':
      return;
        <SecurityEventLog 
          onEventClick={(event) => console.log('Event clicked:', event)}
        />
      );
    case 'threats':
      return;
        <ThreatDetectionVisualizer 
          onThreatClick={handleThreatClick}
          refreshInterval={30000}
        />
      );
    case 'incidents':
      if (selectedIncidentId) {
        return;
          <IncidentResponsePanel 
            incidentId={selectedIncidentId}
            onIncidentUpdate={(incident) => console.log('Incident updated:', incident)}
            onClose={() => setSelectedIncidentId(null)}
          />
        );
      return;
        <div className="incident-list-placeholder">
          <AlertTriangle className="h-12 w-12 text-gray-400" />
          <h3>Incident Management</h3>
          <p>Click on an incident from the dashboard to view details</p>
        </div>
      );
    case 'alerts':
      return;
        <SecurityAlerts 
          onAlertAction={handleAlertAction}
          maxVisible={100}
          showDismissed={false}
        />
      );
    default:
      return <SecurityDashboard />;
  };
  const getCurrentViewTitle = () => {
    const item = navigationItems.find(item => item.id === currentView);
    return item?.label || 'Security Monitoring';
  };
  return;
    <div className={`security-monitoring-layout ${isFullscreen ? 'fullscreen' : ''} ${compactMode ? 'compact' : ''}`}>}
      {/* Sidebar Navigation */}
      <aside className={`security-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Shield className="h-6 w-6 text-blue-600" />
            {!sidebarCollapsed && ()
              <span className="sidebar-title">Security Center</span>
            )}
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? ()
              <ChevronRight className="h-4 w-4" />
            ) : ()
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
        <nav className="sidebar-nav">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === currentView;
            return;
              <button
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setCurrentView(item.id)}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon className="nav-icon" />
                {!sidebarCollapsed && ()
                  <div className="nav-content">
                    <span className="nav-label">{item.label}</span>
                    <span className="nav-description">{item.description}</span>
                  </div>
                )}
              </button>
            );
          })}
        </nav>
        {!sidebarCollapsed && ()
          <div className="sidebar-footer">
            <button className="sidebar-settings">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </button>
          </div>
        )}
      </aside>
      {/* Main Content */}
      <main className="security-main">
        {/* Header */}
        <div className="security-header">
          <div className="header-content">
            <h1 className="header-title">{getCurrentViewTitle()}</h1>
            <div className="header-breadcrumb">
              <span>Security Center</span>
              <span className="breadcrumb-separator">/</span>
              <span className="current">{getCurrentViewTitle()}</span>
            </div>
          </div>
          <div className="header-actions">
            <button
              className="header-action"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? ()
                <Minimize2 className="h-4 w-4" />
              ) : ()
                <Maximize2 className="h-4 w-4" />
              )}
            </button>
            <button className="header-action" title="Settings">
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
        {/* Content Area */}
        <div className="security-content">
          {renderCurrentView()}
        </div>
      </main>
      {/* Real-time Status Indicator */}
      <div className="status-indicator">
        <div className="status-dot online"></div>
        <span className="status-text">Live</span>
      </div>
    </div>
  );
};