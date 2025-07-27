/**
 * MetricCard - Individual metric display component
 * REFACTOR-003: Dashboard Component Architecture Consolidation
 *
 * Standardized metric card with trends, targets, and formatting
 */
import React from 'react';
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
    title: string;
    value: MetricValue;
    description?: string;
    icon?: React.ComponentType<{
        size?: number;
        className?: string;
    }>;
    trend?: MetricTrend;
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
    size?: 'small' | 'medium' | 'large';
    loading?: boolean;
    onClick?: () => void;
    helpText?: string;
    badge?: {
        text: string;
        variant?: 'default' | 'success' | 'warning' | 'error';
    };
    className?: string;
}
export declare const MetricCard: React.FC<MetricCardProps>;
export default MetricCard;
//# sourceMappingURL=MetricCard.d.ts.map