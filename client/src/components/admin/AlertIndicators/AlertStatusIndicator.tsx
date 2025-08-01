/**
 * Alert Status Indicator Component
 * 
 * Epic 17.1.2 - Admin Dashboard UI
 * Task: E17-1753114396757-764E97 - Implement alert indicators
 * 
 * Status icon component that shows the overall system alert state.
 * Provides visual feedback with tooltips and can trigger alert management views.
 */
import React, { useState } from 'react';
import { 
  CheckCircle, AlertTriangle, AlertCircle, AlertOctagon, Settings 
 from 'lucide-react';
import { AlertCount } from './AlertIndicatorBadge';

export type AlertSystemStatus = 'healthy' | 'warning' | 'critical' | 'maintenance' | 'unknown';


interface AlertStatusIndicatorProps {
  alertCounts: AlertCount;
  systemStatus?: AlertSystemStatus;
  lastUpdated?: Date;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  showPulse?: boolean;
  onClick?: () => void;



className?: string;
  const AlertStatusIndicator: React.FC<AlertStatusIndicatorProps> = ({
  alertCounts,
  systemStatus = 'healthy',
  lastUpdated,
  size = 'md',
  showTooltip = true,
  showPulse = true,
  onClick,
  className = ''

}) => {
  const [showTooltipState, setShowTooltipState] = useState(false);
  // Calculate system status based on alert counts if not provided
  const calculateSystemStatus = (): AlertSystemStatus => {
  if (systemStatus !== 'healthy') return systemStatus;
  if (alertCounts.critical > 0) return 'critical';
  if (alertCounts.high > 0) return 'warning';
  if (alertCounts.medium > 0 || alertCounts.low > 0 || alertCounts.info > 0) return 'warning';
  return 'healthy';
};
  // Get status configuration
  const getStatusConfig = (status: AlertSystemStatus) => {
  const configs = {
  healthy: {
  icon: CheckCircle,
  color: 'text-green-500',
  bgColor: 'bg-green-50',
  borderColor: 'border-green-200',
  label: 'System Healthy',
  description: 'All systems operating normally'
},
  warning: {
  icon: AlertTriangle,
  color: 'text-yellow-500',
  bgColor: 'bg-yellow-50',
  borderColor: 'border-yellow-200',
  label: 'System Warning',
  description: 'Some alerts require attention'
},
  critical: {
  icon: AlertOctagon,
  color: 'text-red-500',
  bgColor: 'bg-red-50',
  borderColor: 'border-red-200',
  label: 'Critical Alerts',
  description: 'Immediate attention required'
},
  maintenance: {
  icon: Settings,
  color: 'text-blue-500',
  bgColor: 'bg-blue-50',
  borderColor: 'border-blue-200',
  label: 'Maintenance Mode',
  description: 'System maintenance in progress'
},
  unknown: {
  icon: AlertCircle,
  color: 'text-gray-500',
  bgColor: 'bg-gray-50',
  borderColor: 'border-gray-200',
  label: 'Status Unknown',
  description: 'Unable to determine system status'
};
    return configs[status];
  };
  // Get size configuration
  const getSizeConfig = (sz: string) => {
    const configs: Record<string, { icon: string, container: string, tooltip: string }> = {
  sm: {
  icon: 'w-4 h-4',
  container: 'p-1.5',
  tooltip: 'text-xs'
},
  md: {
  icon: 'w-5 h-5',
  container: 'p-2',
  tooltip: 'text-sm'
},
  lg: {
  icon: 'w-6 h-6',
  container: 'p-2.5',
  tooltip: 'text-base'
};
    return configs[sz];
  };
  // Generate tooltip content
  const getTooltipContent = () => {
    const totalAlerts = Object.values(alertCounts).reduce((sum, count) => sum + count, 0);
    const currentStatus = calculateSystemStatus();
    const statusConfig = getStatusConfig(currentStatus);
    const alertBreakdown = Object.entries(alertCounts);
      .filter(([ count]) => count > 0)
      .map(([severity, count]) => `${count} ${severity}`)}
      .join(', ');
    const lastUpdatedStr = lastUpdated ;
      ? `Last updated: ${lastUpdated.toLocaleTimeString()}`}
      : '';
    return {
      title: statusConfig.label,
      description: totalAlerts > 0 ,
        ? `${totalAlerts} active alerts (${alertBreakdown})`}
        : statusConfig.description,
      lastUpdated: lastUpdatedStr;
  };
  };
  const currentStatus = calculateSystemStatus();
  const statusConfig = getStatusConfig(currentStatus);
  const sizeConfig = getSizeConfig(size);
  const Icon = statusConfig.icon;
  const tooltipContent = getTooltipContent();
  const shouldPulse = showPulse && (currentStatus === 'critical' || currentStatus === 'warning');
  const indicatorClasses = [
    'inline-flex items-center justify-center rounded-full border-2 transition-all duration-200',
    statusConfig.bgColor,
    statusConfig.borderColor,
    sizeConfig.container,
    onClick ? 'cursor-pointer hover:scale-105 hover:shadow-md' : '',
    shouldPulse ? 'animate-pulse' : '',
    className
  ].filter(Boolean).join(' ');
  const iconClasses = [
    statusConfig.color,
    sizeConfig.icon,
    'transition-colors duration-200'
  ].join(' ');
  return;
    <div className="relative inline-block">
      <div
        className={indicatorClasses}
        onClick={onClick}
        onMouseEnter={() => showTooltip && setShowTooltipState(true)}
        onMouseLeave={() => setShowTooltipState(false)}
        role={onClick ? 'button' : 'status'}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={onClick ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
 : undefined}
        aria-label={`System status: ${tooltipContent.title}`}
      >
        <Icon className={iconClasses} />
      </div>
      {/* Tooltip */}
      {showTooltip && showTooltipState && ()
        <div className="absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg -top-2 left-full ml-2 whitespace-nowrap">
          <div className="font-medium">{tooltipContent.title}</div>
          <div className="text-gray-300">{tooltipContent.description}</div>
          {tooltipContent.lastUpdated && ()
            <div className="text-xs text-gray-400 mt-1">{tooltipContent.lastUpdated}</div>
          )}
          {/* Tooltip arrow */}
          <div className="absolute top-3 left-0 transform -translate-x-1 rotate-45 w-2 h-2 bg-gray-900"></div>
        </div>
      )}
      {/* Additional status indicators for critical state */}
      {currentStatus === 'critical' && ()
        <div className="absolute -top-1 -right-1">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
          <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full"></div>
        </div>
      )}
    </div>
  );
};

export default AlertStatusIndicator;