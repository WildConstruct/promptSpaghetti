/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

/**
 * Quality Alerts Panel - Epic 18
 * 
 * Panel component displaying active quality alerts with filtering, 
 * acknowledgment capabilities, and severity-based prioritization.
 * 
 * Task: E18-1753114562561-695DBB - Create quality dashboards
 */
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
 from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  XCircle,
  Clock,
  CheckCircle,
  Filter,
  ArrowUpDown
 from 'lucide-react';
import { QualityAlert } from '../../hooks/useQualityMetrics';

// =============================================================================
// Quality Alerts Panel Component
// =============================================================================


export interface QualityAlertsPanelProps {
  alerts: QualityAlert;
  onAlertAction?: (alertId: string, action: 'acknowledge' | 'resolve' | 'dismiss') => void;
  compact?: boolean;
  className?: string;



export const QualityAlertsPanel: React.FC<QualityAlertsPanelProps> = ({)
  alerts,
  onAlertAction,
  compact = false,
  className = ''
}) => {
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'error' | 'warning' | 'info'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'acknowledged' | 'resolved'>('all');
  const [sortBy, setSortBy] = useState<'timestamp' | 'severity' | 'metric'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  // Helper function to get severity icon
  const getSeverityIcon = (severity: string) => {,
  switch (severity) {
  case 'critical':,
  return <XCircle className="w-4 h-4 text-red-600" />;
  case 'error':,
  return <AlertTriangle className="w-4 h-4 text-red-500" />;
  case 'warning':,
  return <AlertCircle className="w-4 h-4 text-yellow-500" />;
  case 'info':,
  return <Info className="w-4 h-4 text-blue-500" />;
  default:,
  return <AlertTriangle className="w-4 h-4 text-gray-500" />;
};
  // Helper function to get severity color
  const getSeverityColor = (severity: string) => {
  switch (severity) {
  case 'critical':,
  return 'destructive';
  case 'error':,
  return 'destructive';
  case 'warning':,
  return 'secondary';
  case 'info':,
  return 'outline';
  default:,
  return 'outline';
};
  // Helper function to get status icon
  const getStatusIcon = (status: string) => {
  switch (status) {
  case 'active':,
  return <Clock className="w-3 h-3" />;
  case 'acknowledged':,
  return <CheckCircle className="w-3 h-3" />;
  case 'resolved':,
  return <CheckCircle className="w-3 h-3 text-green-500" />;
  default:,
  return <Clock className="w-3 h-3" />;
};
  // Filter alerts
  const filteredAlerts = alerts.filter(alert => {)
  const severityMatch = severityFilter === 'all' || alert.severity === severityFilter;
    const statusMatch = statusFilter === 'all' || alert.status === statusFilter;
    return severityMatch && statusMatch;
  });
  // Sort alerts
  const sortedAlerts = [...filteredAlerts].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
    case 'timestamp':
      comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      break;
    case 'severity': {
      const severityOrder = { critical: 4, error: 3, warning: 2, info: 1 };
      comparison = (severityOrder[a.severity as keyof typeof severityOrder] || 0) - 
                    (severityOrder[b.severity as keyof typeof severityOrder] || 0);
      break;
    case 'metric':
      comparison = a.metric.localeCompare(b.metric);
      break;
    default:
      comparison = 0;
    return sortOrder === 'asc' ? comparison : -comparison;
  });
  // Handle alert actions
  const handleAlertAction = (alertId: string, action: 'acknowledge' | 'resolve' | 'dismiss') => {
    if (onAlertAction) {
      onAlertAction(alertId, action);
  };
  // Toggle sort order
  const toggleSort = () => {
  setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
};
  if (compact) {
    return;
      <div className={`quality-alerts-panel-compact ${className}`}>}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Active Alerts</span>
              <Badge variant="outline" className="text-xs">
                {filteredAlerts.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {sortedAlerts.slice(0, 5).map((alert) => ()
                <div key={alert.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                  <div className="flex items-center space-x-2 flex-1">
                    {getSeverityIcon(alert.severity)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {alert.message}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {alert.metric} • {alert.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={getSeverityColor(alert.severity)} size="sm">
                    {alert.severity}
                  </Badge>
                </div>
              ))}
              {sortedAlerts.length === 0 && ()
                <div className="text-center py-4 text-gray-500">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <p className="text-sm">No active alerts</p>
                </div>
              )}
              {sortedAlerts.length > 5 && ()
                <div className="text-center pt-2">
                  <p className="text-xs text-gray-500">
                    and {sortedAlerts.length - 5} more alerts...
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  return;
    <div className={`quality-alerts-panel ${className}`}>}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Quality Alerts</span>
            </CardTitle>
            <Badge variant="outline">
              {filteredAlerts.length} of {alerts.length} alerts
            </Badge>
          </div>
          {/* Filters and Controls */}
          <div className="flex items-center space-x-4 pt-4">
            {/* Severity Filter */}
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-32">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>
            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="acknowledged">Acknowledged</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            {/* Sort Controls */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="timestamp">Time</SelectItem>
                <SelectItem value="severity">Severity</SelectItem>
                <SelectItem value="metric">Metric</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={toggleSort}>
              <ArrowUpDown className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {sortedAlerts.map((alert) => ()
              <div key={alert.id} className="border border-gray-200 rounded-lg p-4">
                {/* Alert Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getSeverityIcon(alert.severity)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900">{alert.message}</h4>
                        <Badge variant={getSeverityColor(alert.severity)} size="sm">
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {alert.metric} metric alert
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(alert.status)}
                    <span className="text-xs text-gray-500 capitalize">
                      {alert.status}
                    </span>
                  </div>
                </div>
                {/* Alert Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Current:</span>
                    <div>{alert.currentValue}</div>
                  </div>
                  {alert.thresholdValue && ()
                    <div>
                      <span className="font-medium text-gray-700">Threshold:</span>
                      <div>{alert.thresholdValue}</div>
                    </div>
                  )}
                  {alert.previousValue && ()
                    <div>
                      <span className="font-medium text-gray-700">Previous:</span>
                      <div>{alert.previousValue}</div>
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-gray-700">Time:</span>
                    <div>{alert.timestamp.toLocaleString()}</div>
                  </div>
                </div>
                {/* Component/File Info */}
                {(alert.component || alert.file) && ()
                  <div className="mb-4 p-2 bg-gray-50 rounded text-sm">
                    {alert.component && ()
                      <div><span className="font-medium">Component:</span> {alert.component}</div>
                    )}
                    {alert.file && ()
                      <div><span className="font-medium">File:</span> {alert.file}</div>
                    )}
                  </div>
                )}
                {/* Actions */}
                {alert.status === 'active' && ()
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAlertAction(alert.id, 'acknowledge')}
                    >
                      Acknowledge
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAlertAction(alert.id, 'resolve')}
                    >
                      Resolve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAlertAction(alert.id, 'dismiss')}
                    >
                      Dismiss
                    </Button>
                  </div>
                )}
                {/* Acknowledged/Resolved Info */}
                {(alert.status === 'acknowledged' || alert.status === 'resolved') && ()
                  <div className="text-xs text-gray-500">
                    {alert.status === 'acknowledged' && alert.acknowledgedBy && alert.acknowledgedAt && ()
                      <p>Acknowledged by {alert.acknowledgedBy} on {alert.acknowledgedAt.toLocaleString()}</p>
                    )}
                    {alert.status === 'resolved' && alert.resolvedAt && ()
                      <p>Resolved on {alert.resolvedAt.toLocaleString()}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
            {sortedAlerts.length === 0 && ()
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Quality Alerts
                </h3>
                <p className="text-gray-500">
                  {severityFilter !== 'all' || statusFilter !== 'all' 
                    ? 'No alerts match the current filters.' 
                    : 'All quality metrics are within acceptable ranges.'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QualityAlertsPanel;