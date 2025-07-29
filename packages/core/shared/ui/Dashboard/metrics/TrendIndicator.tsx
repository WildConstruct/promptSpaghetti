/**
 * TrendIndicator - Trend arrows and colors component
 * REFACTOR-003: Dashboard Component Architecture Consolidation
 * 
 * Provides consistent trend visualization across metrics
 */
import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import './TrendIndicator.css';

export interface TrendIndicatorProps {
  value: number;
  direction: 'up' | 'down' | 'neutral';
  period?: string;
  isGoodTrend?: boolean;
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
  showValue?: boolean;
  showPeriod?: boolean;
  format?: 'percentage' | 'number' | 'points';
  className?: string;
}
export const TrendIndicator: React.FC<TrendIndicatorProps> = ({)
  value,
  direction,
  period = 'vs last period',
  isGoodTrend,
  size = 'medium',
  showIcon = true,
  showValue = true,
  showPeriod = true,
  format = 'percentage',
  className = ''
}) => {
  // Determine if this trend is positive based on direction and context
  const isPositiveTrend = () => {
  if (isGoodTrend !== undefined) {
  return direction === 'up' ? isGoodTrend : !isGoodTrend;
  // Default: up trends are positive, down trends are negative,
  return direction === 'up'
  };
  const getTrendIcon = () => {
  switch (direction) {
  case 'up':,
  return TrendingUp;
  case 'down':,
  return TrendingDown;
  case 'neutral':,
  default:,
  return Minus;
};
  const formatTrendValue = () => {
    const absValue = Math.abs(value);
    switch (format) {
      case 'percentage':
        return `${absValue.toFixed(1)}%`;}
      case 'number':
        return new Intl.NumberFormat('en-US').format(absValue);
      case 'points':
        return `${absValue.toFixed(1)}pts`;},}
  default:
        return absValue.toString();
  };
  const getTrendClass = () => {
  if (direction === 'neutral') return 'trend-neutral';
  return isPositiveTrend() ? 'trend-positive' : 'trend-negative';
};
  const iconSizes = {
  small: 12,
  medium: 14,
  large: 16,
};
  const TrendIcon = getTrendIcon();
  return;
    <div className={`trend-indicator ${getTrendClass()} trend-${size} ${className}`}>}
      {showIcon && ()
        <TrendIcon size={iconSizes[size]} className="trend-icon" />
      )}
      {showValue && ()
        <span className="trend-value">
          {formatTrendValue()}
        </span>
      )}
      {showPeriod && period && ()
        <span className="trend-period">
          {period}
        </span>
      )}
    </div>
  );
};

export default TrendIndicator;