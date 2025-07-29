import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { AlertTriangle, DollarSign, TrendingUp, Clock, X, Check, BellOff, Filter } from 'lucide-react';
/**
 * Alert severity colors
 */
const SEVERITY_COLORS = {
  info: 'text-blue-600 bg-blue-50 border-blue-200',
  warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  critical: 'text-red-600 bg-red-50 border-red-200',
};
/**
 * Alert type icons
 */
const ALERT_TYPE_ICONS = {
  threshold: AlertTriangle,
  budget_exceeded: DollarSign,
  unusual_usage: TrendingUp,
  performance: Clock,
  error: X,
};
/**
 * Alert item props
 */
interface AlertItemProps {
  alert: unknown;
  onAcknowledge: (alertId: string) => void;
  onDismiss?: (alertId: string) => void;
/**
 * Alert item component
 */
const AlertItem: React.FC<AlertItemProps> = ({ alert, onAcknowledge, onDismiss }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const handleAcknowledge = useCallback(async () => {
    setIsProcessing(true);
    try {
      await onAcknowledge(alert.id);
    } finally {
      setIsProcessing(false);
  }, [alert.id, onAcknowledge]);
  const handleDismiss = useCallback(async () => {
    if (onDismiss) {
      setIsProcessing(true);
      try {
        await onDismiss(alert.id);
      } finally {
        setIsProcessing(false);
  }, [alert.id, onDismiss]);
  const IconComponent = ALERT_TYPE_ICONS[alert.alertType as keyof typeof ALERT_TYPE_ICONS] || AlertTriangle;
  const severityClass = SEVERITY_COLORS[alert.severity as keyof typeof SEVERITY_COLORS] || SEVERITY_COLORS.info;
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };
  return;
    <Card className={`alert-item ${severityClass} border-l-4`}>}
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <IconComponent className="w-5 h-5 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Badge variant={alert.severity === 'critical' ? 'destructive' : alert.severity === 'warning' ? 'warning' : 'secondary'}>
                  {alert.severity}
                </Badge>
                <span className="text-sm text-gray-600">{alert.alertType.replace('_', ' ')}</span>
              </div>
              <div className="font-medium mt-1">{alert.message}</div>
              <div className="text-xs text-gray-500 mt-1">
                {formatTimestamp(alert.timestamp)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Less' : 'More'}
            </Button>
          </div>
        </div>
      </CardHeader>
      {isExpanded && ()
        <CardContent>
          <div className="space-y-3">
            {/* Alert Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Budget:</span> {alert.budgetAmount ? `$${alert.budgetAmount.toFixed(2)}` : 'N/A'}
              </div>
              <div>
                <span className="font-medium">Current Usage:</span> {alert.currentUsage ? `$${alert.currentUsage.toFixed(2)}` : 'N/A'}
              </div>
              {alert.threshold && ()
                <div>
                  <span className="font-medium">Threshold:</span> {alert.threshold}%
                </div>
              )}
              <div>
                <span className="font-medium">Status:</span> {alert.acknowledged ? 'Acknowledged' : 'Active'}
              </div>
            </div>
            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              {!alert.acknowledged && ()
                <Button
                  size="sm"
                  onClick={handleAcknowledge}
                  disabled={isProcessing}
                  className="flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  {isProcessing ? 'Processing...' : 'Acknowledge'}
                </Button>
              )}
              {onDismiss && ()
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDismiss}
                  disabled={isProcessing}
                  className="flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Dismiss
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
/**
 * Alert summary card props
 */
interface AlertSummaryProps {
  alerts: unknown;
  title: string;
  icon: React.ReactNode;
  color: string;
/**
 * Alert summary card component
 */
const AlertSummaryCard: React.FC<AlertSummaryProps> = ({ alerts, title, icon, color }) => {
  return;
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          {icon}
          <CardTitle className="text-sm text-gray-600">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className={`text-2xl font-bold ${color}`}>}
            {alerts.length}
          </div>
          {alerts.length > 0 && ()
            <div className="text-sm text-gray-600">
              {alerts.filter(a => a.severity === 'critical').length} critical,{' '}
              {alerts.filter(a => a.severity === 'warning').length} warning
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
/**
 * Alerts panel props
 */

export interface AlertsPanelProps {
  alerts: unknown;
  onAcknowledge: (alertId: string) => void;
  onDismiss?: (alertId: string) => void;
  showSummary?: boolean;
  className?: string;
  /**
  * Alerts panel component
  */
}
export const AlertsPanel: React.FC<AlertsPanelProps> = ({)
  alerts,
  onAcknowledge,
  onDismiss,
  showSummary = true,
  className = ''
}) => {
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [sortBy, setSortBy] = useState<'timestamp' | 'severity'>('timestamp');
  /**
   * Filter alerts based on selected filter
   */
  const filteredAlerts = alerts.filter(alert => {)
  if (filter === 'all') return true;
    return alert.severity === filter;
  });
  /**
   * Sort alerts
   */
  const sortedAlerts = [...filteredAlerts].sort((a, b) => {
    if (sortBy === 'timestamp') {
      return b.timestamp - a.timestamp;
    if (sortBy === 'severity') {
      const severityOrder = { critical: 3, warning: 2, info: 1 };
      return (severityOrder[b.severity as keyof typeof severityOrder] || 0) - 
             (severityOrder[a.severity as keyof typeof severityOrder] || 0);
    return 0;
  });
  /**
   * Get alert counts by type
   */
  const getAlertCounts = () => {
  const counts = {
  all: alerts.length,
  critical: alerts.filter(a => a.severity === 'critical').length,
  warning: alerts.filter(a => a.severity === 'warning').length,
  info: alerts.filter(a => a.severity === 'info').length,
};
    return counts;
  };
  /**
   * Get alerts by type
   */
  const getAlertsByType = () => {
    const budgetAlerts = alerts.filter(a => a.alertType === 'budget_exceeded' || a.alertType === 'threshold');
    const performanceAlerts = alerts.filter(a => a.alertType === 'unusual_usage' || a.alertType === 'performance');
    const errorAlerts = alerts.filter(a => a.alertType === 'error');
    return { budgetAlerts, performanceAlerts, errorAlerts };
  };
  const alertCounts = getAlertCounts();
  const { budgetAlerts, performanceAlerts, errorAlerts } = getAlertsByType();
  if (alerts.length === 0) {
    return;
      <div className={`alerts-panel ${className}`}>}
        <Card>
          <CardContent className="text-center py-8">
            <BellOff className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <div className="text-lg font-medium text-gray-600">No Active Alerts</div>
            <div className="text-sm text-gray-500">All systems are running normally</div>
          </CardContent>
        </Card>
      </div>
    );
  return;
    <div className={`alerts-panel ${className}`}>}
      {showSummary && ()
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <AlertSummaryCard
            alerts={budgetAlerts}
            title="Budget Alerts"
            icon={<DollarSign className="w-5 h-5 text-yellow-600" />}
            color="text-yellow-600"
          />
          <AlertSummaryCard
            alerts={performanceAlerts}
            title="Performance Alerts"
            icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
            color="text-blue-600"
          />
          <AlertSummaryCard
            alerts={errorAlerts}
            title="Error Alerts"
            icon={<AlertTriangle className="w-5 h-5 text-red-600" />}
            color="text-red-600"
          />
        </div>
      )}
      <Tabs defaultValue="all" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="grid grid-cols-4 w-fit">
            <TabsTrigger value="all" onClick={() => setFilter('all')}>
              All ({alertCounts.all})
            </TabsTrigger>
            <TabsTrigger value="critical" onClick={() => setFilter('critical')}>
              Critical ({alertCounts.critical})
            </TabsTrigger>
            <TabsTrigger value="warning" onClick={() => setFilter('warning')}>
              Warning ({alertCounts.warning})
            </TabsTrigger>
            <TabsTrigger value="info" onClick={() => setFilter('info')}>
              Info ({alertCounts.info})
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'timestamp' | 'severity')}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="timestamp">Sort by Time</option>
              <option value="severity">Sort by Severity</option>
            </select>
          </div>
        </div>
        <TabsContent value="all" className="space-y-4">
          {sortedAlerts.map((alert) => ()
            <AlertItem
              key={alert.id}
              alert={alert}
              onAcknowledge={onAcknowledge}
              onDismiss={onDismiss}
            />
          ))}
        </TabsContent>
        <TabsContent value="critical" className="space-y-4">
          {sortedAlerts.filter(a => a.severity === 'critical').map((alert) => ()
            <AlertItem
              key={alert.id}
              alert={alert}
              onAcknowledge={onAcknowledge}
              onDismiss={onDismiss}
            />
          ))}
        </TabsContent>
        <TabsContent value="warning" className="space-y-4">
          {sortedAlerts.filter(a => a.severity === 'warning').map((alert) => ()
            <AlertItem
              key={alert.id}
              alert={alert}
              onAcknowledge={onAcknowledge}
              onDismiss={onDismiss}
            />
          ))}
        </TabsContent>
        <TabsContent value="info" className="space-y-4">
          {sortedAlerts.filter(a => a.severity === 'info').map((alert) => ()
            <AlertItem
              key={alert.id}
              alert={alert}
              onAcknowledge={onAcknowledge}
              onDismiss={onDismiss}
            />
          ))}
        </TabsContent>
      </Tabs>
      {/* Bulk Actions */}
      {alerts.some(a => !a.acknowledged) && ()
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {alerts.filter(a => !a.acknowledged).length} unacknowledged alerts
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  alerts.filter(a => !a.acknowledged).forEach(alert => {)
  onAcknowledge(alert.id);
                  });
                }}
              >
                Acknowledge All
              </Button>
              {onDismiss && ()
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    alerts.forEach(alert => {)
  onDismiss(alert.id);
                    });
                  }}
                >
                  Dismiss All
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
/**
 * Alerts panel styles
 */
const styles = `;
  .alerts-panel {
    width: 100%;
  .alert-item {
    transition: all 0.2s ease-in-out;
  .alert-item:hover {,
  transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  .alert-item.border-l-4 {
    border-left-width: 4px;
  @media (max-width: 768px) {
    .alerts-panel .grid {
      grid-template-columns: 1fr;
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);

export default AlertsPanel;