/**
 * TrendIndicator - Trend arrows and colors component
 * REFACTOR-003: Dashboard Component Architecture Consolidation
 *
 * Provides consistent trend visualization across metrics
 */
import React from 'react';
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
export declare const TrendIndicator: React.FC<TrendIndicatorProps>;
export default TrendIndicator;
//# sourceMappingURL=TrendIndicator.d.ts.map