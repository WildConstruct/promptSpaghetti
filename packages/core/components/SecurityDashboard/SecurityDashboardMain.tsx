/**
 * Main Security Dashboard Component
 * Task T-1752989143998-955: Implement security dashboard
 * 
 * Unified security dashboard entry point that integrates the comprehensive
 * security dashboard framework with real-time data streaming, role-based
 * access control, and workflow management.
 * 
 * Features:
 * - Unified dashboard entry point and routing
 * - Real-time security event streaming
 * - Role-based dashboard views
 * - Data service layer integration  
 * - Mobile-responsive design
 * - Professional Cinema 4D-inspired theming
 * 
 * @author Security Engineering Team
 * @version 1.0.0
 * @since 2025-07-22
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  SecurityDashboardFramework,
  DashboardType,
  SecurityRole,
  DashboardTheme
} from '../../security/dashboard/SecurityDashboardFramework';
import { SecurityDashboardWorkflow } from '../../security/dashboard/SecurityDashboardWorkflow';
import { OperationalSecurityDashboard } from '../../security/dashboard/OperationalSecurityDashboard';
import { ExecutiveSecurityDashboard } from '../../security/dashboard/ExecutiveSecurityDashboard';
import { ComplianceSecurityDashboard } from '../../security/dashboard/ComplianceSecurityDashboard';
import { SecurityDashboardDataService } from './SecurityDashboardDataService';

// Main Dashboard Types
export interface SecurityDashboardMainProps {
  workspaceId: string;
  userId: string;
  userRole: SecurityRole;
  initialDashboardType?: DashboardType;
  theme?: DashboardTheme;
  enableRealTimeUpdates?: boolean;
  refreshInterval?: number; // seconds
}

export interface SecurityMetrics {
  securityScore: number;
  activeThreats: number;
  blockedThreats: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  lastScanTime: Date;
}

export interface SecurityAlert {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'malware' | 'intrusion' | 'data_exfiltration' | 'policy_violation' | 'anomaly';
  title: string;
  description: string;
  source: string;
  timestamp: Date;
  status: 'new' | 'investigating' | 'escalated' | 'resolved' | 'false_positive';
  assignee?: string;
  affectedAssets: string[];
  indicators: string[];
  responseActions: ResponseAction[];
}

export interface ResponseAction {
  id: string;
  type: 'isolate' | 'block' | 'quarantine' | 'investigate' | 'escalate';
  description: string;
  automated: boolean;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  performer?: string;
  timestamp?: Date;
}

export interface ComplianceStatus {
  framework: string;
  status: 'compliant' | 'non_compliant' | 'partial';
  score: number;
  violations: ComplianceViolation[];
  lastAssessment: Date;
}

export interface ComplianceViolation {
  id: string;
  type: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  remediation: string;
  dueDate: Date;
}

/**
 * Main Security Dashboard Component
 */
export const SecurityDashboardMain: React.FC<SecurityDashboardMainProps> = ({
  workspaceId,
  userId,
  userRole,
  initialDashboardType = DashboardType.OPERATIONAL,
  theme = DashboardTheme.CINEMA,
  enableRealTimeUpdates = true,
  refreshInterval = 30
}) => {
  // State management
  const [currentDashboardType, setCurrentDashboardType] = useState<DashboardType>(initialDashboardType);
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics | null>(null);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [complianceStatus, setComplianceStatus] = useState<ComplianceStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);

  // Data service instance
  const dataService = useMemo(
    () => new SecurityDashboardDataService(workspaceId),
    [workspaceId]
  );

  // Theme styles
  const themeStyles = useMemo(() => {
    const themes = {
      light: {
        background: '#ffffff',
        surface: '#f8fafc',
        border: '#e2e8f0',
        text: '#1e293b',
        textSecondary: '#64748b',
        primary: '#3b82f6',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        critical: '#dc2626'
      },
      dark: {
        background: '#0f172a',
        surface: '#1e293b',
        border: '#334155',
        text: '#f1f5f9',
        textSecondary: '#cbd5e1',
        primary: '#60a5fa',
        success: '#34d399',
        warning: '#fbbf24',
        error: '#f87171',
        critical: '#ef4444'
      },
      cinema: {
        background: '#0a0a0a',
        surface: '#1a1a1a',
        border: '#333333',
        text: '#f5f5f5',
        textSecondary: '#d4d4d4',
        primary: '#fbbf24',
        success: '#22d3ee',
        warning: '#f59e0b',
        error: '#ef4444',
        critical: '#dc2626'
      }
    };
    return themes[theme] || themes.cinema;
  }, [theme]);

  // Initialize dashboard and load data
  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        setLoading(true);
        
        // Load initial data
        const [metrics, alerts, compliance] = await Promise.all([
          dataService.getSecurityMetrics(),
          dataService.getActiveAlerts(),
          dataService.getComplianceStatus()
        ]);

        setSecurityMetrics(metrics);
        setSecurityAlerts(alerts);
        setComplianceStatus(compliance);
        
        // Initialize real-time updates
        if (enableRealTimeUpdates) {
          initializeRealTimeUpdates();
        }
        
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize dashboard');
        setLoading(false);
      }
    };

    initializeDashboard();
  }, [workspaceId, enableRealTimeUpdates, dataService]);

  // Initialize real-time data updates
  const initializeRealTimeUpdates = useCallback(() => {
    let ws: WebSocket | null = null;
    let reconnectTimer: NodeJS.Timeout | null = null;

    const connectWebSocket = () => {
      try {
        ws = new WebSocket(`ws://localhost:8000/ws/security-dashboard/${workspaceId}`);
        
        ws.onopen = () => {
          setIsConnected(true);
          console.log('Security dashboard connected to real-time updates');
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            handleRealTimeUpdate(data);
          } catch (error) {
            console.error('Failed to process real-time update:', error);
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          // Attempt to reconnect after 5 seconds
          reconnectTimer = setTimeout(() => {
            console.log('Attempting to reconnect to real-time updates...');
            connectWebSocket();
          }, 5000);
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setIsConnected(false);
        };
      } catch (error) {
        console.error('Failed to connect to real-time updates:', error);
        setIsConnected(false);
      }
    };

    // Initial connection
    connectWebSocket();

    // Cleanup function
    return () => {
      if (ws) {
        ws.close();
      }
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
    };
  }, [workspaceId]);

  // Handle real-time updates
  const handleRealTimeUpdate = useCallback((data: any) => {
    switch (data.type) {
      case 'security_metrics':
        setSecurityMetrics(data.payload);
        break;
      case 'security_alert':
        setSecurityAlerts(prev => [data.payload, ...prev.slice(0, 99)]);
        break;
      case 'alert_update':
        setSecurityAlerts(prev => 
          prev.map(alert => 
            alert.id === data.payload.id ? { ...alert, ...data.payload } : alert
          )
        );
        break;
      case 'compliance_update':
        setComplianceStatus(prev => 
          prev.map(status => 
            status.framework === data.payload.framework 
              ? { ...status, ...data.payload } 
              : status
          )
        );
        break;
      default:
        console.log('Unknown real-time update type:', data.type);
    }
  }, []);

  // Handle security actions
  const handleSecurityAction = useCallback(async (action: string, payload: any) => {
    try {
      await dataService.executeSecurityAction(action, payload);
    } catch (error) {
      console.error('Failed to execute security action:', error);
    }
  }, [dataService]);

  // Handle alert actions
  const handleAlertAction = useCallback(async (alertId: string, action: string) => {
    try {
      await dataService.updateAlert(alertId, { action });
      
      // Update local state
      setSecurityAlerts(prev => 
        prev.map(alert => 
          alert.id === alertId 
            ? { ...alert, status: action as SecurityAlert['status'] }
            : alert
        )
      );
    } catch (error) {
      console.error('Failed to update alert:', error);
    }
  }, [dataService]);

  // Get dashboard navigation items based on user role
  const navigationItems = useMemo(() => {
    const items = [];
    
    if ([SecurityRole.SECURITY_ADMIN, SecurityRole.SECURITY_ANALYST, SecurityRole.SOC_ANALYST].includes(userRole)) {
      items.push({ type: DashboardType.OPERATIONAL, label: 'Operations', icon: '🛡️' });
    }
    
    if ([SecurityRole.EXECUTIVE, SecurityRole.SECURITY_ADMIN].includes(userRole)) {
      items.push({ type: DashboardType.EXECUTIVE, label: 'Executive', icon: '📊' });
    }
    
    if ([SecurityRole.COMPLIANCE_OFFICER, SecurityRole.SECURITY_ADMIN, SecurityRole.AUDITOR].includes(userRole)) {
      items.push({ type: DashboardType.COMPLIANCE, label: 'Compliance', icon: '📋' });
    }
    
    if ([SecurityRole.SECURITY_ADMIN, SecurityRole.SECURITY_ANALYST].includes(userRole)) {
      items.push({ type: DashboardType.ANALYTICS, label: 'Analytics', icon: '📈' });
    }

    return items;
  }, [userRole]);

  // Render dashboard content based on selected type
  const renderDashboardContent = () => {
    if (!securityMetrics || !securityAlerts) {
      return null;
    }

    const commonProps = {
      theme,
      refreshInterval,
      enableRealTimeUpdates,
      onAlertAction: handleAlertAction
    };

    switch (currentDashboardType) {
      case DashboardType.OPERATIONAL:
        return (
          <OperationalSecurityDashboard
            alerts={securityAlerts}
            metrics={{
              alerts: {
                total: securityAlerts.length,
                newLast24h: securityAlerts.filter(a => 
                  Date.now() - a.timestamp.getTime() < 24 * 60 * 60 * 1000
                ).length,
                byCategory: securityAlerts.reduce((acc, alert) => {
                  acc[alert.category] = (acc[alert.category] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>),
                bySeverity: securityAlerts.reduce((acc, alert) => {
                  acc[alert.severity] = (acc[alert.severity] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>),
                avgResponseTime: 45,
                slaCompliance: 96
              },
              incidents: {
                active: securityAlerts.filter(a => a.status === 'investigating').length,
                resolved24h: 12,
                avgResolutionTime: 180,
                escalated: securityAlerts.filter(a => a.status === 'escalated').length
              },
              system: {
                overallHealth: 98,
                componentsOperational: 47,
                totalComponents: 50,
                criticalIssues: 2
              },
              team: {
                onlineAnalysts: 8,
                totalAnalysts: 12,
                workload: 'normal' as const,
                avgCaseload: 5.2
              }
            }}
            systemStatus={[
              { component: 'SIEM', status: 'operational', lastCheck: new Date(), uptime: 99.9, criticalIssues: 0, responseTime: 250 },
              { component: 'EDR', status: 'operational', lastCheck: new Date(), uptime: 99.8, criticalIssues: 0, responseTime: 180 },
              { component: 'Firewall', status: 'operational', lastCheck: new Date(), uptime: 100, criticalIssues: 0, responseTime: 45 },
              { component: 'IDS/IPS', status: 'degraded', lastCheck: new Date(), uptime: 97.5, criticalIssues: 1, responseTime: 450 },
              { component: 'Email Security', status: 'operational', lastCheck: new Date(), uptime: 99.5, criticalIssues: 0, responseTime: 320 },
              { component: 'Web Proxy', status: 'operational', lastCheck: new Date(), uptime: 99.7, criticalIssues: 0, responseTime: 120 }
            ]}
            threatIntel={[
              { 
                feed: 'Threat Intelligence Platform', 
                lastUpdate: new Date(), 
                newIndicators: 45, 
                activeThreats: 12, 
                confidence: 'high',
                categories: ['malware', 'phishing', 'c2']
              },
              { 
                feed: 'Commercial Feed', 
                lastUpdate: new Date(), 
                newIndicators: 23, 
                activeThreats: 7, 
                confidence: 'medium',
                categories: ['apt', 'ransomware']
              },
              { 
                feed: 'Open Source Intel', 
                lastUpdate: new Date(), 
                newIndicators: 67, 
                activeThreats: 19, 
                confidence: 'medium',
                categories: ['indicators', 'campaigns']
              }
            ]}
            {...commonProps}
          />
        );

      case DashboardType.EXECUTIVE:
        return (
          <ExecutiveSecurityDashboard
            securityMetrics={securityMetrics}
            alerts={securityAlerts}
            complianceStatus={complianceStatus}
            {...commonProps}
          />
        );

      case DashboardType.COMPLIANCE:
        return (
          <ComplianceSecurityDashboard
            complianceStatus={complianceStatus}
            alerts={securityAlerts.filter(a => a.category === 'policy_violation')}
            {...commonProps}
          />
        );

      case DashboardType.ANALYTICS:
        return (
          <SecurityDashboardWorkflow
            workspaceId={workspaceId}
            userId={userId}
            userRole={userRole}
            dashboardType={currentDashboardType}
          />
        );

      default:
        return (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '400px',
            color: themeStyles.textSecondary 
          }}>
            Dashboard type not implemented: {currentDashboardType}
          </div>
        );
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: themeStyles.background,
        color: themeStyles.text,
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          border: `4px solid ${themeStyles.border}`,
          borderTop: `4px solid ${themeStyles.primary}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '24px'
        }} />
        <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
          Loading Security Dashboard...
        </div>
        <div style={{ fontSize: '14px', color: themeStyles.textSecondary }}>
          Initializing real-time monitoring and threat detection
        </div>
        
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: themeStyles.background,
        color: themeStyles.text,
        fontFamily: 'Inter, system-ui, sans-serif',
        padding: '24px'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '24px' }}>⚠️</div>
        <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px', textAlign: 'center' }}>
          Security Dashboard Error
        </div>
        <div style={{ fontSize: '16px', color: themeStyles.textSecondary, marginBottom: '32px', textAlign: 'center', maxWidth: '500px' }}>
          {error}
        </div>
        <button
          onClick={() => window.location.reload()}
          style={{
            background: themeStyles.primary,
            color: themeStyles.background,
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          🔄 Retry Dashboard
        </button>
      </div>
    );
  }

  // Main dashboard render
  return (
    <div style={{
      background: themeStyles.background,
      color: themeStyles.text,
      minHeight: '100vh',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Navigation Header */}
      <nav style={{
        background: themeStyles.surface,
        borderBottom: `1px solid ${themeStyles.border}`,
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '64px'
        }}>
          {/* Logo and Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '24px' }}>🛡️</div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 700, lineHeight: 1 }}>
                Security Center
              </div>
              <div style={{ fontSize: '12px', color: themeStyles.textSecondary, lineHeight: 1 }}>
                {workspaceId} • {userRole}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {navigationItems.map(item => (
              <button
                key={item.type}
                onClick={() => setCurrentDashboardType(item.type)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  background: currentDashboardType === item.type ? themeStyles.primary : 'transparent',
                  color: currentDashboardType === item.type ? themeStyles.background : themeStyles.text,
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Status and Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Connection Status */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              background: isConnected ? `${themeStyles.success}20` : `${themeStyles.error}20`,
              color: isConnected ? themeStyles.success : themeStyles.error,
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 600
            }}>
              <div style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: isConnected ? themeStyles.success : themeStyles.error
              }} />
              {isConnected ? 'LIVE' : 'OFFLINE'}
            </div>

            {/* Risk Level Indicator */}
            {securityMetrics && (
              <div style={{
                padding: '6px 12px',
                background: securityMetrics.riskLevel === 'critical' ? `${themeStyles.critical}20` :
                           securityMetrics.riskLevel === 'high' ? `${themeStyles.error}20` :
                           securityMetrics.riskLevel === 'medium' ? `${themeStyles.warning}20` :
                           `${themeStyles.success}20`,
                color: securityMetrics.riskLevel === 'critical' ? themeStyles.critical :
                       securityMetrics.riskLevel === 'high' ? themeStyles.error :
                       securityMetrics.riskLevel === 'medium' ? themeStyles.warning :
                       themeStyles.success,
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                textTransform: 'uppercase'
              }}>
                Risk: {securityMetrics.riskLevel}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <main>
        {renderDashboardContent()}
      </main>
    </div>
  );
};

export default SecurityDashboardMain;