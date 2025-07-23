// Epic 19.4 - Security Alerts Component
// Task: T-1752989145014 - Create frontend components for Security Monitoring & Incident Response

import React, { useState, useEffect } from 'react';
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Settings,
  Volume2,
  VolumeX,
  Filter,
  X,
  Eye,
  EyeOff,
  Trash2,
  AlertOctagon,
  Info,
  Zap,
  Shield
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SecurityAlert {
  id: string;
  type: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: 'authentication' | 'authorization' | 'data_access' | 'system' | 'api' | 'network';
  title: string;
  message: string;
  timestamp: Date;
  source: string;
  status: 'unread' | 'read' | 'acknowledged' | 'dismissed';
  actions?: AlertAction[];
  metadata?: Record<string, any>;
  escalation_level: number;
}

interface AlertAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'danger';
  action: 'block_ip' | 'quarantine_user' | 'escalate' | 'investigate' | 'dismiss';
}

interface SecurityAlertsProps {
  onAlertAction?: (alertId: string, action: string) => void;
  maxVisible?: number;
  showDismissed?: boolean;
}

export const SecurityAlerts: React.FC<SecurityAlertsProps> = ({ onAlertAction, maxVisible = 10, showDismissed = false }) => {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<SecurityAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'timestamp' | 'severity'>('timestamp');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadAlerts();
    
    // Set up polling for new alerts
    const interval = setInterval(loadAlerts, 10000); // 10 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterAndSortAlerts();
  }, [alerts, selectedFilters, sortBy, showDismissed]);

  const loadAlerts = async () => {
    try {
      // Mock data - replace with actual API call
      const mockAlerts: SecurityAlert[] = [
        {
          id: 'alert-1',
          type: 'critical',
          category: 'authentication',
          title: 'Multiple Failed Login Attempts',
          message: 'Over 100 failed login attempts detected from IP 192.168.1.100 in the last 5 minutes',
          timestamp: new Date(Date.now() - 2 * 60 * 1000),
          source: 'Authentication Service',
          status: 'unread',
          escalation_level: 3,
          actions: [
            { id: 'block-ip', label: 'Block IP', type: 'danger', action: 'block_ip' },
            { id: 'investigate', label: 'Investigate', type: 'secondary', action: 'investigate' }
          ],
          metadata: { ip: '192.168.1.100', attempts: 127, duration: '5 minutes' }
        },
        {
          id: 'alert-2',
          type: 'high',
          category: 'api',
          title: 'Suspicious API Usage Pattern',
          message: 'API endpoint /api/templates being accessed at unusual rate from automated client',
          timestamp: new Date(Date.now() - 8 * 60 * 1000),
          source: 'API Gateway',
          status: 'read',
          escalation_level: 2,
          actions: [
            { id: 'rate-limit', label: 'Apply Rate Limit', type: 'primary', action: 'block_ip' },
            { id: 'investigate', label: 'Investigate', type: 'secondary', action: 'investigate' }
          ]
        },
        {
          id: 'alert-3',
          type: 'medium',
          category: 'authorization',
          title: 'Unauthorized Access Attempt',
          message: 'User attempted to access admin panel without proper permissions',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          source: 'Authorization Service',
          status: 'acknowledged',
          escalation_level: 1,
          actions: [
            { id: 'quarantine', label: 'Quarantine User', type: 'danger', action: 'quarantine_user' },
            { id: 'review', label: 'Review Permissions', type: 'secondary', action: 'investigate' }
          ]
        },
        {
          id: 'alert-4',
          type: 'info',
          category: 'system',
          title: 'Security Scan Completed',
          message: 'Daily security scan completed successfully. No issues detected.',
          timestamp: new Date(Date.now() - 45 * 60 * 1000),
          source: 'Security Scanner',
          status: 'read',
          escalation_level: 0
        },
        {
          id: 'alert-5',
          type: 'high',
          category: 'network',
          title: 'DDoS Attack Detected',
          message: 'Distributed denial of service attack detected and mitigated',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          source: 'Network Monitor',
          status: 'dismissed',
          escalation_level: 2
        }
      ];

      setAlerts(mockAlerts);
      setIsLoading(false);

      // Play sound for new critical alerts
      const newCriticalAlerts = mockAlerts.filter(
        alert => alert.type === 'critical' && alert.status === 'unread'
      );
      
      if (newCriticalAlerts.length > 0 && soundEnabled) {
        playAlertSound();
      }
    } catch (error) {
      console.error('Failed to load security alerts:', error);
      setIsLoading(false);
    }
  };

  const filterAndSortAlerts = () => {
    let filtered = alerts.filter(alert => {
      if (!showDismissed && alert.status === 'dismissed') return false;
      if (selectedFilters.length === 0) return true;
      return selectedFilters.includes(alert.type) || selectedFilters.includes(alert.category);
    });

    // Sort alerts
    filtered.sort((a, b) => {
      if (sortBy === 'timestamp') {
        return b.timestamp.getTime() - a.timestamp.getTime();
      } else {
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1, info: 0 };
        return severityOrder[b.type] - severityOrder[a.type];
      }
    });

    setFilteredAlerts(filtered.slice(0, maxVisible));
  };

  const playAlertSound = () => {
    // Create audio context and play alert sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  const getAlertIcon = (type: SecurityAlert['type']) => {
    switch (type) {
      case 'critical':
        return <AlertOctagon className="h-4 w-4 text-red-600" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'medium':
        return <Zap className="h-4 w-4 text-yellow-600" />;
      case 'low':
        return <Shield className="h-4 w-4 text-blue-600" />;
      case 'info':
        return <Info className="h-4 w-4 text-green-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusIcon = (status: SecurityAlert['status']) => {
    switch (status) {
      case 'unread':
        return <Eye className="h-3 w-3 text-blue-600" />;
      case 'read':
        return <EyeOff className="h-3 w-3 text-gray-500" />;
      case 'acknowledged':
        return <CheckCircle className="h-3 w-3 text-green-600" />;
      case 'dismissed':
        return <XCircle className="h-3 w-3 text-gray-400" />;
      default:
        return null;
    }
  };

  const handleAlertAction = async (alertId: string, actionType: string) => {
    try {
      // Update local state immediately for better UX
      setAlerts(prevAlerts => 
        prevAlerts.map(alert => 
          alert.id === alertId 
            ? { ...alert, status: 'acknowledged' as const }
            : alert
        )
      );

      // Call parent handler
      onAlertAction?.(alertId, actionType);

      // Here you would make the actual API call
      console.log(`Performing action: ${actionType} on alert: ${alertId}`);
    } catch (error) {
      console.error('Failed to perform alert action:', error);
    }
  };

  const handleStatusChange = (alertId: string, newStatus: SecurityAlert['status']) => {
    setAlerts(prevAlerts =>
      prevAlerts.map(alert =>
        alert.id === alertId ? { ...alert, status: newStatus } : alert
      )
    );
  };

  const dismissAlert = (alertId: string) => {
    handleStatusChange(alertId, 'dismissed');
  };

  const unreadCount = alerts.filter(alert => alert.status === 'unread').length;
  const criticalCount = alerts.filter(alert => alert.type === 'critical' && alert.status !== 'dismissed').length;

  if (isLoading) {
    return (
      <div className="security-alerts loading">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading alerts...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="security-alerts">
      {/* Header */}
      <div className="alerts-header">
        <div className="header-title">
          <div className="alert-icon-container">
            <Bell className="h-5 w-5 text-blue-600" />
            {unreadCount > 0 && (
              <span className="unread-badge">{unreadCount}</span>
            )}
          </div>
          <h3>Security Alerts</h3>
          {criticalCount > 0 && (
            <span className="critical-badge">
              {criticalCount} Critical
            </span>
          )}
        </div>

        <div className="header-controls">
          <button
            className={`control-btn ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
            title="Filter alerts"
          >
            <Filter className="h-4 w-4" />
          </button>
          
          <button
            className={`control-btn ${soundEnabled ? 'active' : ''}`}
            onClick={() => setSoundEnabled(!soundEnabled)}
            title="Toggle sound notifications"
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>

          <button className="control-btn" title="Alert settings">
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="alerts-filters">
          <div className="filter-section">
            <label>Severity</label>
            <div className="filter-options">
              {['critical', 'high', 'medium', 'low', 'info'].map(severity => (
                <label key={severity} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedFilters.includes(severity)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedFilters([...selectedFilters, severity]);
                      } else {
                        setSelectedFilters(selectedFilters.filter(f => f !== severity));
                      }
                    }}
                  />
                  <span className="capitalize">{severity}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <label>Category</label>
            <div className="filter-options">
              {['authentication', 'authorization', 'data_access', 'system', 'api', 'network'].map(category => (
                <label key={category} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedFilters.includes(category)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedFilters([...selectedFilters, category]);
                      } else {
                        setSelectedFilters(selectedFilters.filter(f => f !== category));
                      }
                    }}
                  />
                  <span className="capitalize">{category.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <label>Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'timestamp' | 'severity')}
              className="sort-select"
            >
              <option value="timestamp">Most Recent</option>
              <option value="severity">Severity</option>
            </select>
          </div>
        </div>
      )}

      {/* Alert Count */}
      <div className="alerts-count">
        Showing {filteredAlerts.length} of {alerts.length} alerts
        {selectedFilters.length > 0 && (
          <span className="filter-count">
            ({selectedFilters.length} filter{selectedFilters.length !== 1 ? 's' : ''} active)
          </span>
        )}
      </div>

      {/* Alerts List */}
      <div className="alerts-list">
        {filteredAlerts.length === 0 ? (
          <div className="no-alerts">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <p>No security alerts match your current filters.</p>
          </div>
        ) : (
          filteredAlerts.map(alert => (
            <div 
              key={alert.id} 
              className={`alert-item ${alert.type} ${alert.status}`}
            >
              <div className="alert-indicator">
                {getAlertIcon(alert.type)}
              </div>

              <div className="alert-content">
                <div className="alert-header">
                  <h4 className="alert-title">{alert.title}</h4>
                  <div className="alert-meta">
                    {getStatusIcon(alert.status)}
                    <span className="alert-time">
                      {formatDistanceToNow(alert.timestamp)} ago
                    </span>
                  </div>
                </div>

                <p className="alert-message">{alert.message}</p>

                <div className="alert-details">
                  <span className="alert-source">Source: {alert.source}</span>
                  <span className="alert-category">
                    Category: {alert.category.replace('_', ' ')}
                  </span>
                  {alert.escalation_level > 0 && (
                    <span className="escalation-level">
                      Escalation Level: {alert.escalation_level}
                    </span>
                  )}
                </div>

                {alert.actions && alert.actions.length > 0 && (
                  <div className="alert-actions">
                    {alert.actions.map(action => (
                      <button
                        key={action.id}
                        className={`alert-action-btn ${action.type}`}
                        onClick={() => handleAlertAction(alert.id, action.action)}
                        disabled={alert.status === 'dismissed'}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="alert-controls">
                {alert.status === 'unread' && (
                  <button
                    className="control-btn"
                    onClick={() => handleStatusChange(alert.id, 'read')}
                    title="Mark as read"
                  >
                    <Eye className="h-3 w-3" />
                  </button>
                )}
                
                {alert.status !== 'acknowledged' && (
                  <button
                    className="control-btn"
                    onClick={() => handleStatusChange(alert.id, 'acknowledged')}
                    title="Acknowledge"
                  >
                    <CheckCircle className="h-3 w-3" />
                  </button>
                )}

                <button
                  className="control-btn danger"
                  onClick={() => dismissAlert(alert.id)}
                  title="Dismiss alert"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More */}
      {alerts.length > maxVisible && (
        <div className="load-more">
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => setFilteredAlerts(alerts.slice(0, maxVisible + 25))}
          >
            Load More Alerts
          </button>
        </div>
      )}
    </div>
  );
};