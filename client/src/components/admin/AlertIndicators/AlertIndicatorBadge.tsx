/**
 * Alert Indicator Badge Component
 * 
 * Epic 17.1.2 - Admin Dashboard UI
 * Task: E17-1753114396757-764E97 - Implement alert indicators
 * 
 * Small badge component that displays alert counts by severity level.
 * Used in navigation, headers, and dashboard sections to show at-a-glance alert status.
 */

import React from 'react';
import { AlertTriangle, AlertCircle, Info, Shield, Zap } from 'lucide-react';

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface AlertCount {
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
}

interface AlertIndicatorBadgeProps {
  alertCounts: AlertCount;
  severity?: AlertSeverity; // If specified, only shows this severity
  maxDisplayCount?: number; // Max number to display before showing "99+"
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  animate?: boolean; // Pulse animation for active alerts
}

const AlertIndicatorBadge: React.FC<AlertIndicatorBadgeProps> = ({
  alertCounts,
  severity,
  maxDisplayCount = 99,
  showIcon = true,
  size = 'md',
  className = '',
  onClick,
  animate = false
}) => {
  // Calculate total count or specific severity count
  const getDisplayCount = (): number => {
    if (severity) {
      return alertCounts[severity];
    }
    return Object.values(alertCounts).reduce((sum, count) => sum + count, 0);
  };

  // Get the highest severity alert for styling when showing total
  const getHighestSeverity = (): AlertSeverity => {
    if (severity) return severity;
    
    if (alertCounts.critical > 0) return 'critical';
    if (alertCounts.high > 0) return 'high';
    if (alertCounts.medium > 0) return 'medium';
    if (alertCounts.low > 0) return 'low';
    return 'info';
  };

  // Get severity configuration
  const getSeverityConfig = (sev: AlertSeverity) => {
    const configs = {
      critical: {
        icon: Zap,
        bgColor: 'bg-red-500',
        textColor: 'text-white',
        borderColor: 'border-red-500',
        ringColor: 'ring-red-500/20'
      },
      high: {
        icon: AlertTriangle,
        bgColor: 'bg-orange-500',
        textColor: 'text-white',
        borderColor: 'border-orange-500',
        ringColor: 'ring-orange-500/20'
      },
      medium: {
        icon: AlertCircle,
        bgColor: 'bg-yellow-500',
        textColor: 'text-white',
        borderColor: 'border-yellow-500',
        ringColor: 'ring-yellow-500/20'
      },
      low: {
        icon: Info,
        bgColor: 'bg-blue-500',
        textColor: 'text-white',
        borderColor: 'border-blue-500',
        ringColor: 'ring-blue-500/20'
      },
      info: {
        icon: Info,
        bgColor: 'bg-gray-500',
        textColor: 'text-white',
        borderColor: 'border-gray-500',
        ringColor: 'ring-gray-500/20'
      }
    };
    return configs[sev];
  };

  // Get size configuration
  const getSizeConfig = (sz: string) => {
    const configs = {
      sm: {
        container: 'px-1.5 py-0.5 text-xs min-w-[20px] h-5',
        icon: 'w-3 h-3',
        text: 'text-xs'
      },
      md: {
        container: 'px-2 py-1 text-sm min-w-[24px] h-6',
        icon: 'w-4 h-4',
        text: 'text-sm'
      },
      lg: {
        container: 'px-2.5 py-1.5 text-base min-w-[28px] h-7',
        icon: 'w-5 h-5',
        text: 'text-base'
      }
    };
    return configs[sz];
  };

  const displayCount = getDisplayCount();
  const highestSeverity = getHighestSeverity();
  const severityConfig = getSeverityConfig(highestSeverity);
  const sizeConfig = getSizeConfig(size);

  // Don't render if no alerts
  if (displayCount === 0) {
    return null;
  }

  const formattedCount = displayCount > maxDisplayCount ? `${maxDisplayCount}+` : displayCount.toString();
  const Icon = severityConfig.icon;

  const badgeClasses = [
    'inline-flex items-center justify-center gap-1 rounded-full font-medium',
    'transition-all duration-200 ease-in-out',
    severityConfig.bgColor,
    severityConfig.textColor,
    severityConfig.borderColor,
    sizeConfig.container,
    onClick ? 'cursor-pointer hover:scale-105 hover:shadow-lg' : '',
    animate ? 'animate-pulse' : '',
    animate ? `ring-2 ${severityConfig.ringColor}` : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <span
      className={badgeClasses}
      onClick={onClick}
      role={onClick ? 'button' : 'status'}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
      aria-label={`${displayCount} ${severity || 'total'} alerts`}
      title={`${displayCount} ${severity || 'total'} alerts`}
    >
      {showIcon && <Icon className={sizeConfig.icon} />}
      <span className={sizeConfig.text}>{formattedCount}</span>
    </span>
  );
};

export default AlertIndicatorBadge;