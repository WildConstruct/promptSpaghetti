/**
 * Admin Alert Panel Component
 * 
 * Epic 17.1.2 - Admin Dashboard UI
 * Task: E17-1753114396757-764E97 - Implement alert indicators
 * 
 * Collapsible alert summary panel for admin sections.
 * Shows alert breakdown, recent alerts, and quick actions.
 */

import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, ChevronUp, AlertTriangle, Clock, User, 
  ExternalLink, RefreshCw, Settings, Eye, Filter,
  Zap, Shield, Info, CheckCircle, XCircle
} from 'lucide-react';
import AlertIndicatorBadge, { AlertCount, AlertSeverity } from './AlertIndicatorBadge';
import AlertStatusIndicator from './AlertStatusIndicator';

interface AlertItem {
  id: string;
  type: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  timestamp: Date;
  source: string;
  status: 'active' | 'acknowledged' | 'resolved';
  affectedComponent?: string;
  userId?: string;
  userName?: string;
}

interface AdminAlertPanelProps {
  title: string;
  alertCounts: AlertCount;
  recentAlerts: AlertItem[];
  isLoading?: boolean;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
  onRefresh?: () => void;
  onViewAll?: () => void;
  onAcknowledgeAll?: () => void;
  className?: string;
  maxRecentAlerts?: number;
}

const AdminAlertPanel: React.FC<AdminAlertPanelProps> = ({
  title,
  alertCounts,
  recentAlerts,
  isLoading = false,
  isExpanded = false,
  onToggleExpanded,
  onRefresh,
  onViewAll,
  onAcknowledgeAll,
  className = '',
  maxRecentAlerts = 5
}) => {
  const [localExpanded, setLocalExpanded] = useState(isExpanded);

  useEffect(() => {
    setLocalExpanded(isExpanded);
  }, [isExpanded]);

  const handleToggleExpanded = () => {
    const newExpanded = !localExpanded;
    setLocalExpanded(newExpanded);
    onToggleExpanded?.();
  };

  const totalAlerts = Object.values(alertCounts).reduce((sum, count) => sum + count, 0);
  const hasActiveAlerts = totalAlerts > 0;
  const displayedAlerts = recentAlerts.slice(0, maxRecentAlerts);

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getSeverityIcon = (severity: AlertSeverity) => {
    const icons = {
      critical: Zap,
      high: AlertTriangle,
      medium: Shield,
      low: Info,
      info: Info
    };
    return icons[severity] || Info;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      active: AlertTriangle,
      acknowledged: CheckCircle,
      resolved: CheckCircle
    };
    return icons[status] || AlertTriangle;
  };

  const panelClasses = [
    'bg-white rounded-lg border border-gray-200 shadow-sm transition-all duration-200',
    hasActiveAlerts ? 'border-l-4 border-l-yellow-400' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={panelClasses}>
      {/* Panel Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="font-medium text-gray-900">{title}</h3>
            
            {/* Alert Status Indicator */}
            <AlertStatusIndicator
              alertCounts={alertCounts}
              size="sm"
              showTooltip={true}
              showPulse={hasActiveAlerts}
            />
            
            {/* Total Alert Badge */}
            {hasActiveAlerts && (
              <AlertIndicatorBadge
                alertCounts={alertCounts}
                size="sm"
                animate={true}
              />
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Actions */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isLoading}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Refresh alerts"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            )}

            {onViewAll && hasActiveAlerts && (
              <button
                onClick={onViewAll}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="View all alerts"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            )}

            {/* Expand/Collapse Button */}
            <button
              onClick={handleToggleExpanded}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title={localExpanded ? 'Collapse' : 'Expand'}
            >
              {localExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Alert Summary Row */}
        {localExpanded && hasActiveAlerts && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              {Object.entries(alertCounts).map(([severity, count]) => 
                count > 0 && (
                  <div key={severity} className="flex items-center space-x-1">
                    <AlertIndicatorBadge
                      alertCounts={{ [severity]: count } as AlertCount}
                      severity={severity as AlertSeverity}
                      size="sm"
                      showIcon={false}
                    />
                    <span className="capitalize">{severity}</span>
                  </div>
                )
              )}
            </div>

            {onAcknowledgeAll && (
              <button
                onClick={onAcknowledgeAll}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Acknowledge All
              </button>
            )}
          </div>
        )}
      </div>

      {/* Panel Content */}
      {localExpanded && (
        <div className="px-4 py-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <RefreshCw className="w-5 h-5 animate-spin text-gray-400" />
              <span className="ml-2 text-sm text-gray-500">Loading alerts...</span>
            </div>
          ) : displayedAlerts.length === 0 ? (
            <div className="text-center py-6">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No recent alerts</p>
              <p className="text-xs text-gray-400 mt-1">All systems operational</p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayedAlerts.map((alert) => {
                const SeverityIcon = getSeverityIcon(alert.severity);
                const StatusIcon = getStatusIcon(alert.status);
                
                return (
                  <div
                    key={alert.id}
                    className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {/* Severity Icon */}
                    <div className="flex-shrink-0 mt-0.5">
                      <SeverityIcon className={`w-4 h-4 ${
                        alert.severity === 'critical' ? 'text-red-500' :
                        alert.severity === 'high' ? 'text-orange-500' :
                        alert.severity === 'medium' ? 'text-yellow-500' :
                        'text-blue-500'
                      }`} />
                    </div>

                    {/* Alert Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {alert.title}
                        </h4>
                        <div className="flex items-center space-x-2 ml-2 flex-shrink-0">
                          <StatusIcon className={`w-3 h-3 ${
                            alert.status === 'resolved' ? 'text-green-500' :
                            alert.status === 'acknowledged' ? 'text-blue-500' :
                            'text-gray-400'
                          }`} />
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(alert.timestamp)}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {alert.description}
                      </p>
                      
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Settings className="w-3 h-3" />
                          <span>{alert.source}</span>
                        </span>
                        
                        {alert.affectedComponent && (
                          <span className="flex items-center space-x-1">
                            <Shield className="w-3 h-3" />
                            <span>{alert.affectedComponent}</span>
                          </span>
                        )}
                        
                        {alert.userName && (
                          <span className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span>{alert.userName}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Show More Link */}
              {recentAlerts.length > maxRecentAlerts && (
                <div className="text-center pt-2">
                  <button
                    onClick={onViewAll}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View {recentAlerts.length - maxRecentAlerts} more alerts
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminAlertPanel;