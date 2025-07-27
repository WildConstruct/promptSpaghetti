/**
 * MetricsCard - Consistent dashboard metrics display
 * REFACTOR-002: Admin Dashboard Architecture Consolidation
 * 
 * Standardized card component for displaying KPIs and metrics
 */

import React from 'react';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';

export interface MetricData {
  value: string | number;
  label: string;
  trend?: {
    value: number;
    label?: string;
    direction: 'up' | 'down' | 'neutral';
  };
  target?: {
    value: number;
    label?: string;
  };
  format?: 'number' | 'percentage' | 'currency' | 'duration';
}

interface MetricsCardProps {
  title: string;
  metrics: MetricData[];
  icon?: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'error';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  className?: string;
  onClick?: () => void;
}

const variantConfigs = {
  default: {
    background: '#ffffff',
    border: '#e5e7eb',
    iconColor: '#6b7280'
  },
  success: {
    background: '#f0fdf4',
    border: '#bbf7d0',
    iconColor: '#16a34a'
  },
  warning: {
    background: '#fffbeb',
    border: '#fed7aa',
    iconColor: '#d97706'
  },
  error: {
    background: '#fef2f2',
    border: '#fecaca',
    iconColor: '#dc2626'
  }
};

const sizeConfigs = {
  small: {
    padding: '16px',
    titleSize: '14px',
    valueSize: '20px',
    labelSize: '12px'
  },
  medium: {
    padding: '20px',
    titleSize: '16px',
    valueSize: '28px',
    labelSize: '14px'
  },
  large: {
    padding: '24px',
    titleSize: '18px',
    valueSize: '36px',
    labelSize: '16px'
  }
};

const formatValue = (value: string | number, format?: string): string => {
  if (typeof value === 'string') return value;

  switch (format) {
    case 'percentage':
      return `${value.toFixed(1)}%`;
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(value);
    case 'duration':
      if (value < 60) return `${value}s`;
      if (value < 3600) return `${Math.floor(value / 60)}m`;
      return `${Math.floor(value / 3600)}h`;
    case 'number':
    default:
      return new Intl.NumberFormat('en-US').format(value);
  }
};

const getTrendIcon = (direction: 'up' | 'down' | 'neutral') => {
  switch (direction) {
    case 'up':
      return TrendingUp;
    case 'down':
      return TrendingDown;
    case 'neutral':
    default:
      return Minus;
  }
};

const getTrendColor = (direction: 'up' | 'down' | 'neutral') => {
  switch (direction) {
    case 'up':
      return '#16a34a';
    case 'down':
      return '#dc2626';
    case 'neutral':
    default:
      return '#6b7280';
  }
};

export const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  metrics,
  icon: Icon,
  variant = 'default',
  size = 'medium',
  loading = false,
  className = '',
  onClick
}) => {
  const variantConfig = variantConfigs[variant];
  const sizeConfig = sizeConfigs[size];

  if (loading) {
    return (
      <div
        className={`metrics-card loading ${className}`}
        style={{
          background: variantConfig.background,
          border: `1px solid ${variantConfig.border}`,
          borderRadius: '8px',
          padding: sizeConfig.padding,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '120px'
        }}
      >
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          color: '#6b7280'
        }}>
          <div
            style={{
              width: '16px',
              height: '16px',
              border: '2px solid currentColor',
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}
          />
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div
      className={`metrics-card ${className}`}
      style={{
        background: variantConfig.background,
        border: `1px solid ${variantConfig.border}`,
        borderRadius: '8px',
        padding: sizeConfig.padding,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}
      onClick={onClick}
      onMouseOver={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        }
      }}
      onMouseOut={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
        }
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        <h3 style={{
          margin: 0,
          fontSize: sizeConfig.titleSize,
          fontWeight: '600',
          color: '#111827'
        }}>
          {title}
        </h3>
        
        {Icon && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            backgroundColor: `${variantConfig.iconColor}15`,
            borderRadius: '6px'
          }}>
            <Icon size={18} style={{ color: variantConfig.iconColor }} />
          </div>
        )}
      </div>

      {/* Metrics */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {metrics.map((metric, index) => (
          <div key={index} className="metric-item">
            {/* Value and Trend */}
            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '8px',
              marginBottom: '4px'
            }}>
              <span style={{
                fontSize: sizeConfig.valueSize,
                fontWeight: '700',
                color: '#111827'
              }}>
                {formatValue(metric.value, metric.format)}
              </span>
              
              {metric.trend && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: getTrendColor(metric.trend.direction)
                }}>
                  {React.createElement(getTrendIcon(metric.trend.direction), { size: 12 })}
                  {Math.abs(metric.trend.value)}%
                  {metric.trend.label && (
                    <span style={{ color: '#6b7280' }}>
                      {metric.trend.label}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Label */}
            <div style={{
              fontSize: sizeConfig.labelSize,
              color: '#6b7280',
              fontWeight: '500'
            }}>
              {metric.label}
            </div>

            {/* Target Progress */}
            {metric.target && (
              <div style={{
                marginTop: '8px',
                fontSize: '12px',
                color: '#6b7280'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '4px'
                }}>
                  <span>Target: {formatValue(metric.target.value, metric.format)}</span>
                  <span>
                    {Math.round((Number(metric.value) / metric.target.value) * 100)}%
                  </span>
                </div>
                
                <div style={{
                  width: '100%',
                  height: '4px',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${Math.min((Number(metric.value) / metric.target.value) * 100, 100)}%`,
                    height: '100%',
                    backgroundColor: variantConfig.iconColor,
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MetricsCard;