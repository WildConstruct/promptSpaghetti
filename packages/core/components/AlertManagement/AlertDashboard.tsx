/**
 * Enhanced Alert Management Dashboard - Epic 17
 * 
 * Comprehensive interface for managing alerts, viewing statistics,
 * and configuring alert rules.
 */
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { 
  AlertTriangle, 
  Shield, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Search, 
  Filter, 
  Bell, 
  Settings,
  TrendingUp,
  AlertOctagon,
  Info,
  Zap
} from 'lucide-react';
import { 
  alertSystem,
  Alert as AlertType,
  AlertFilter,
  AlertStats,
  AlertSeverity,
  AlertStatus,
  AlertType as AlertTypeEnum,
  AlertCategory
} from '../../services/AlertSystem';
interface AlertDashboardProps {
  className?: string;
}
/**
 * Severity configurations for UI styling
 */
const SEVERITY_CONFIG = {
  critical: {,
    color: 'text-red-700 bg-red-50 border-red-200',
    badgeColor: 'bg-red-100 text-red-800',
    icon: AlertOctagon,
    priority: 5,
  },
  high: {,
    color: 'text-orange-700 bg-orange-50 border-orange-200',
    badgeColor: 'bg-orange-100 text-orange-800',
    icon: AlertTriangle,
    priority: 4,
  },
  medium: {,
    color: 'text-yellow-700 bg-yellow-50 border-yellow-200',
    badgeColor: 'bg-yellow-100 text-yellow-800',
    icon: Shield,
    priority: 3,
  },
  low: {,
    color: 'text-blue-700 bg-blue-50 border-blue-200',
    badgeColor: 'bg-blue-100 text-blue-800',
    icon: Info,
    priority: 2,
  },
  info: {,
    color: 'text-gray-700 bg-gray-50 border-gray-200',
    badgeColor: 'bg-gray-100 text-gray-800',
    icon: Info,
    priority: 1,
  }
};
/**
 * Status configurations for UI styling
 */
const STATUS_CONFIG = {
  active: {,
    color: 'text-red-600 bg-red-50',
    badgeColor: 'bg-red-100 text-red-800',
    icon: Bell,
  },
  acknowledged: {,
    color: 'text-yellow-600 bg-yellow-50',
    badgeColor: 'bg-yellow-100 text-yellow-800',
    icon: CheckCircle,
  },
  resolved: {,
    color: 'text-green-600 bg-green-50',
    badgeColor: 'bg-green-100 text-green-800',
    icon: CheckCircle,
  },
  suppressed: {,
    color: 'text-purple-600 bg-purple-50',
    badgeColor: 'bg-purple-100 text-purple-800',
    icon: XCircle,
  },
  expired: {,
    color: 'text-gray-600 bg-gray-50',
    badgeColor: 'bg-gray-100 text-gray-800',
    icon: Clock,
  }
};

export const AlertDashboard: React.FC<AlertDashboardProps> = ({ className }) => {
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [stats, setStats] = useState<AlertStats | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>('overview');
  const [filter, setFilter] = useState<AlertFilter>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlert, setSelectedAlert] = useState<AlertType | null>(null);
  // Load alerts and stats
  useEffect(() => {
    const loadData = () => {
      setAlerts(alertSystem.getAlerts(filter));
      setStats(alertSystem.getAlertStats());
    };
    loadData();
    // Subscribe to real-time updates
    alertSystem.subscribe('alert-dashboard', (alert) => {
      loadData(); // Refresh data when alerts change
    });
    return () => {
      alertSystem.unsubscribe('alert-dashboard');
    };
  }, [filter]);
  // Filter alerts based on search query
  const filteredAlerts = useMemo(() => {
    if (!searchQuery) return alerts;
    const query = searchQuery.toLowerCase();
    return alerts.filter(alert =>)
      alert.title.toLowerCase().includes(query) ||
      alert.message.toLowerCase().includes(query) ||
      alert.source.toLowerCase().includes(query) ||
      alert.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }, [alerts, searchQuery]);
  // Group alerts by severity for overview
  const alertsBySeverity = useMemo(() => {
    const grouped: Record<AlertSeverity, AlertType[]> = {
      critical: [],
      high: [],
      medium: [],
      low: [],
      info: [],
    };
    filteredAlerts.forEach(alert => {)
      if (alert.status === 'active' || alert.status === 'acknowledged') {
        grouped[alert.severity].push(alert);
      }
    });
    return grouped;
  }, [filteredAlerts]);
  // Handle alert actions
  const handleAcknowledgeAlert = (alertId: string) => {
    alertSystem.acknowledgeAlert(alertId, 'user', 'Acknowledged via dashboard');
  };
  const handleResolveAlert = (alertId: string) => {
    alertSystem.resolveAlert(alertId, 'user', 'Resolved via dashboard');
  };
  const handleSuppressAlert = (alertId: string) => {
    alertSystem.suppressAlert(alertId, 'user', 60, 'Suppressed for 1 hour via dashboard');
  };
  // Update filter
  const updateFilter = (updates: Partial<AlertFilter>) => {
    setFilter(prev => ({ ...prev, ...updates }));
  };
  return ()
    <div className={`alert-dashboard space-y-6 ${className}`}>}
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Alert Management</h2>
          <p className="text-gray-600">Monitor and manage system alerts</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Rules
          </Button>
          <Button variant="outline" size="sm">
            <TrendingUp className="w-4 h-4 mr-2" />
            Analytics
          </Button>
        </div>
      </div>
      {/* Statistics Cards */}
      {stats && ()
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Bell className="w-5 h-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Alerts</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-red-900">{stats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Acknowledged</p>
                  <p className="text-2xl font-bold text-yellow-900">{stats.acknowledged}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Resolved</p>
                  <p className="text-2xl font-bold text-green-900">{stats.resolved}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Clock className="w-5 h-5 text-gray-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Avg Resolution</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(stats.averageResolutionTime)}m
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Alerts
            </CardTitle>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search alerts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select
                value={filter.severities?.[0] || 'all'}
                onValueChange={(value) => 
                  updateFilter({ )
                    severities: value === 'all' ? undefined : [value as AlertSeverity] 
                  })
                }
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
                <option value="info">Info</option>
              </Select>
              <Select
                value={filter.statuses?.[0] || 'all'}
                onValueChange={(value) => 
                  updateFilter({ )
                    statuses: value === 'all' ? undefined : [value as AlertStatus] 
                  })
                }
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="acknowledged">Acknowledged</option>
                <option value="resolved">Resolved</option>
                <option value="suppressed">Suppressed</option>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="all">All Alerts</TabsTrigger>
              <TabsTrigger value="active">Active ({stats?.active || 0})</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-6">
              <div className="space-y-6">
                {Object.entries(alertsBySeverity)
                  .sort(([, a], [, b]) => b.length - a.length)
                  .filter(([, alerts]) => alerts.length > 0)
                  .map(([severity, severityAlerts]) => ()
                    <div key={severity}>
                      <div className="flex items-center mb-3">
                        <Badge className={SEVERITY_CONFIG[severity as AlertSeverity].badgeColor}>
                          {severity.toUpperCase()} ({severityAlerts.length})
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {severityAlerts.slice(0, 5).map(alert => ()
                          <AlertCard
                            key={alert.id}
                            alert={alert}
                            onAcknowledge={handleAcknowledgeAlert}
                            onResolve={handleResolveAlert}
                            onSuppress={handleSuppressAlert}
                            onClick={setSelectedAlert}
                          />
                        ))}
                        {severityAlerts.length > 5 && ()
                          <div className="text-sm text-gray-500 text-center py-2">
                            and {severityAlerts.length - 5} more...
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </TabsContent>
            <TabsContent value="all" className="mt-6">
              <AlertList
                alerts={filteredAlerts}
                onAcknowledge={handleAcknowledgeAlert}
                onResolve={handleResolveAlert}
                onSuppress={handleSuppressAlert}
                onSelectAlert={setSelectedAlert}
              />
            </TabsContent>
            <TabsContent value="active" className="mt-6">
              <AlertList
                alerts={filteredAlerts.filter(a => a.status === 'active')}
                onAcknowledge={handleAcknowledgeAlert}
                onResolve={handleResolveAlert}
                onSuppress={handleSuppressAlert}
                onSelectAlert={setSelectedAlert}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      {/* Alert Detail Modal */}
      {selectedAlert && ()
        <AlertDetailModal
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
          onAcknowledge={handleAcknowledgeAlert}
          onResolve={handleResolveAlert}
          onSuppress={handleSuppressAlert}
        />
      )}
    </div>
  );
};
/**
 * Alert Card Component
 */
interface AlertCardProps {
  alert: AlertType;
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
  onSuppress: (id: string) => void;
  onClick: (alert: AlertType) => void;
}
const AlertCard: React.FC<AlertCardProps> = ({)
  alert,
  onAcknowledge,
  onResolve,
  onSuppress,
  onClick
}) => {
  const severityConfig = SEVERITY_CONFIG[alert.severity];
  const statusConfig = STATUS_CONFIG[alert.status];
  const SeverityIcon = severityConfig.icon;
  const _____StatusIcon = statusConfig.icon;
  return ()
    <div 
      className={`border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${severityConfig.color}`}
      onClick={() => onClick(alert)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <SeverityIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="text-sm font-medium truncate">{alert.title}</h4>
              <Badge className={severityConfig.badgeColor} size="sm">
                {alert.severity}
              </Badge>
              <Badge className={statusConfig.badgeColor} size="sm">
                {alert.status}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">{alert.message}</p>
            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
              <span>{alert.source}</span>
              <span>{new Date(alert.triggeredAt).toLocaleString()}</span>
              {alert.occurrenceCount > 1 && ()
                <span>{alert.occurrenceCount} occurrences</span>
              )}
            </div>
          </div>
        </div>
        {alert.status === 'active' && ()
          <div className="flex space-x-1 ml-4">
            <Button 
              size="sm" 
              variant="outline"
              onClick={(e) => { e.stopPropagation(); onAcknowledge(alert.id); }}
            >
              Ack
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={(e) => { e.stopPropagation(); onResolve(alert.id); }}
            >
              Resolve
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
/**
 * Alert List Component
 */
interface AlertListProps {
  alerts: AlertType[];
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
  onSuppress: (id: string) => void;
  onSelectAlert: (alert: AlertType) => void;
}
const AlertList: React.FC<AlertListProps> = ({)
  alerts,
  onAcknowledge,
  onResolve,
  onSuppress,
  onSelectAlert
}) => {
  if (alerts.length === 0) {
    return ()
      <div className="text-center py-8">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No alerts found</h3>
        <p className="text-gray-500">All quiet on this front!</p>
      </div>
    );
  }
  return ()
    <div className="space-y-3">
      {alerts.map(alert => ()
        <AlertCard
          key={alert.id}
          alert={alert}
          onAcknowledge={onAcknowledge}
          onResolve={onResolve}
          onSuppress={onSuppress}
          onClick={onSelectAlert}
        />
      ))}
    </div>
  );
};
/**
 * Alert Detail Modal Component
 */
interface AlertDetailModalProps {
  alert: AlertType;
  onClose: () => void;
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
  onSuppress: (id: string) => void;
}
const AlertDetailModal: React.FC<AlertDetailModalProps> = ({)
  alert,
  onClose,
  onAcknowledge,
  onResolve,
  onSuppress
}) => {
  const severityConfig = SEVERITY_CONFIG[alert.severity];
  const SeverityIcon = severityConfig.icon;
  return ()
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-auto">
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-3">
              <SeverityIcon className={`w-6 h-6 ${severityConfig.color.split(' ')[0]}`} />}
              <div>
                <h2 className="text-xl font-bold text-gray-900">{alert.title}</h2>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge className={severityConfig.badgeColor}>
                    {alert.severity}
                  </Badge>
                  <Badge className={STATUS_CONFIG[alert.status].badgeColor}>
                    {alert.status}
                  </Badge>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Message</h3>
              <p className="text-gray-700">{alert.message}</p>
            </div>
            {alert.description && ()
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700">{alert.description}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Details</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <div><span className="font-medium">Source:</span> {alert.source}</div>
                  <div><span className="font-medium">Category:</span> {alert.category}</div>
                  <div><span className="font-medium">Type:</span> {alert.type}</div>
                  <div><span className="font-medium">Priority:</span> {alert.priority}</div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Timing</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <div><span className="font-medium">Triggered:</span> {new Date(alert.triggeredAt).toLocaleString()}</div>
                  <div><span className="font-medium">Occurrences:</span> {alert.occurrenceCount}</div>
                  {alert.acknowledgedAt && ()
                    <div><span className="font-medium">Acknowledged:</span> {new Date(alert.acknowledgedAt).toLocaleString()}</div>
                  )}
                  {alert.resolvedAt && ()
                    <div><span className="font-medium">Resolved:</span> {new Date(alert.resolvedAt).toLocaleString()}</div>
                  )}
                </div>
              </div>
            </div>
            {alert.tags.length > 0 && ()
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-1">
                  {alert.tags.map(tag => ()
                    <Badge key={tag} variant="outline" size="sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {Object.keys(alert.metadata).length > 0 && ()
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Metadata</h3>
                <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
                  {JSON.stringify(alert.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
          {alert.status === 'active' && ()
            <div className="flex justify-end space-x-2 mt-6 pt-6 border-t">
              <Button 
                variant="outline" 
                onClick={() => { onSuppress(alert.id); onClose(); }}
              >
                Suppress
              </Button>
              <Button 
                variant="outline" 
                onClick={() => { onAcknowledge(alert.id); onClose(); }}
              >
                Acknowledge
              </Button>
              <Button 
                onClick={() => { onResolve(alert.id); onClose(); }}
              >
                Resolve
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertDashboard;