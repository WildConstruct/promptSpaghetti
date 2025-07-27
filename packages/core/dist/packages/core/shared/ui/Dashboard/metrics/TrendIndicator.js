import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import './TrendIndicator.css';
export const TrendIndicator = ({ value, direction, period = 'vs last period', isGoodTrend, size = 'medium', showIcon = true, showValue = true, showPeriod = true, format = 'percentage', className = '' }) => {
    // Determine if this trend is positive based on direction and context
    const isPositiveTrend = () => {
        if (isGoodTrend !== undefined) {
            return direction === 'up' ? isGoodTrend : !isGoodTrend;
        }
        // Default: up trends are positive, down trends are negative
        return direction === 'up';
    };
    const getTrendIcon = () => {
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
    const formatTrendValue = () => {
        const absValue = Math.abs(value);
        switch (format) {
            case 'percentage':
                return `${absValue.toFixed(1)}%`;
            case 'number':
                return new Intl.NumberFormat('en-US').format(absValue);
            case 'points':
                return `${absValue.toFixed(1)}pts`;
            default:
                return absValue.toString();
        }
    };
    const getTrendClass = () => {
        if (direction === 'neutral')
            return 'trend-neutral';
        return isPositiveTrend() ? 'trend-positive' : 'trend-negative';
    };
    const iconSizes = {
        small: 12,
        medium: 14,
        large: 16
    };
    const TrendIcon = getTrendIcon();
    return (_jsxs("div", { className: `trend-indicator ${getTrendClass()} trend-${size} ${className}`, children: [showIcon && (_jsx(TrendIcon, { size: iconSizes[size], className: "trend-icon" })), showValue && (_jsx("span", { className: "trend-value", children: formatTrendValue() })), showPeriod && period && (_jsx("span", { className: "trend-period", children: period }))] }));
};
export default TrendIndicator;
