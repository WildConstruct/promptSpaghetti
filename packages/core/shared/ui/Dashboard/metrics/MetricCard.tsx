/**
 * MetricCard - Individual metric display component
 * REFACTOR-003: Dashboard Component Architecture Consolidation
 * 
 * Standardized metric card with trends, targets, and formatting
 */
import React from 'react';
import { TrendingUp, TrendingDown, Minus, Target, Info } from 'lucide-react';
import { TrendIndicator } from './TrendIndicator';
import './MetricCard.css';

export interface MetricValue {
  current: number | string;
  previous?: number;
  target?: number;
  format?: 'number' | 'currency' | 'percentage' | 'bytes' | 'duration' | 'custom';
  precision?: number;
  suffix?: string;
  prefix?: string;
}
export interface MetricTrend {
  value: number;
  direction: 'up' | 'down' | 'neutral';
  period?: string;
  isGoodTrend?: boolean;
}
export interface MetricCardProps {
  // Core content
  title: string;
  value: MetricValue;
  description?: string;
  // Visual elements
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  trend?: MetricTrend;
  // Styling and behavior
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  onClick?: () => void;
  // Additional content
  helpText?: string;
  badge?: {
  text: string;
  variant?: 'default' | 'success' | 'warning' | 'error'
  };
  className?: string;
const formatValue = (;);
  value: number | string, 
  format?: string, 
  precision = 0, 
  prefix = '', 
  suffix = ''
): string => {
  if (typeof value === 'string') return `${prefix}${value}${suffix}`;}
  let formattedValue: string;
  switch (format) {
  case 'currency':,
  formattedValue = new Intl.NumberFormat('en-US', {)
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: precision,
  maximumFractionDigits: precision,
}).format(value);
      break;
    case 'percentage':
      formattedValue = `${value.toFixed(precision)}%`;}
      break;
    case 'bytes':
      const units = ['B', 'KB', 'MB', 'GB', 'TB'];
      let bytes = value;
      let unitIndex = 0;
      while (bytes >= 1024 && unitIndex < units.length - 1) {
        bytes /= 1024;
        unitIndex++;
      formattedValue = `${bytes.toFixed(precision)} ${units[unitIndex]}`;}
      break;
    case 'duration':
      if (value < 60) {
        formattedValue = `${value.toFixed(precision)}s`;}
      } else if (value < 3600) {
        formattedValue = `${(value / 60).toFixed(precision)}m`;}
      } else {
        formattedValue = `${(value / 3600).toFixed(precision)}h`;}
      break;
    case 'number':
    default:
      formattedValue = new Intl.NumberFormat('en-US', {)
  minimumFractionDigits: precision,
  maximumFractionDigits: precision,
}).format(value);
      break;
  return `${prefix}${formattedValue}${suffix}`;}
};
}
export const MetricCard: React.FC<MetricCardProps> = ({)
  title,
  value,
  description,
  icon: Icon,
  trend,
  variant = 'default',
  size = 'medium',
  loading = false,
  onClick,
  helpText,
  badge,
  className = ''
}) => {
  const formattedValue = formatValue(;);
  value.current,
  value.format,
  value.precision,
  value.prefix,
  value.suffix
  );
  const hasTarget = value.target !== undefined;
  const targetProgress = hasTarget && typeof value.current === 'number' ;
  ? Math.min((value.current / value.target!) * 100, 100)
  : 0;
  const sizeClasses = {
  small: 'metric-card-small',
  medium: 'metric-card-medium',
  large: 'metric-card-large',
};
  const variantClasses = {
  default: 'metric-card-default',
  success: 'metric-card-success',
  warning: 'metric-card-warning',
  error: 'metric-card-error',
  info: 'metric-card-info',
};
  return;
    <div 
      className={`
        metric-card 
        ${sizeClasses[size]} }
        ${variantClasses[variant]}
        ${onClick ? 'clickable' : ''}
        ${loading ? 'loading' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {/* Loading State */}
      {loading && ()
        <div className="metric-card-loading">
          <div className="loading-shimmer" />
        </div>
      )}
      {!loading && ()
        <>
          {/* Header */}
          <div className="metric-card-header">
            <div className="metric-title-section">
              {Icon && ()
                <div className="metric-icon">
                  <Icon size={size === 'small' ? 16 : size === 'large' ? 24 : 20} />
                </div>
              )}
              <div className="metric-title-text">
                <h3 className="metric-title">{title}</h3>
                {helpText && ()
                  <div className="metric-help">
                    <Info size={14} />
                    <div className="help-tooltip">{helpText}</div>
                  </div>
                )}
              </div>
            </div>
            {badge && ()
              <div className={`metric-badge ${badge.variant || 'default'}`}>}
                {badge.text}
              </div>
            )}
          </div>
          {/* Value Section */}
          <div className="metric-value-section">
            <div className="metric-value">{formattedValue}</div>
            {trend && ()
              <TrendIndicator
                value={trend.value}
                direction={trend.direction}
                period={trend.period}
                isGoodTrend={trend.isGoodTrend}
                size={size}
              />
            )}
          </div>
          {/* Description */}
          {description && ()
            <div className="metric-description">{description}</div>
          )}
          {/* Target Progress */}
          {hasTarget && ()
            <div className="metric-target">
              <div className="target-info">
                <Target size={12} />
                <span>Target: {formatValue(value.target!, value.format, value.precision)}</span>
                <span className="target-percentage">{targetProgress.toFixed(0)}%</span>
              </div>
              <div className="target-progress">
                <div 
                  className="target-progress-bar"
                  style={{ width: `${targetProgress}%` }}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MetricCard;