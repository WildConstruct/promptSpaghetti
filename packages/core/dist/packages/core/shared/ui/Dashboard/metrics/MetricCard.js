import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Target, Info } from 'lucide-react';
import { TrendIndicator } from './TrendIndicator';
import './MetricCard.css';
const formatValue = (value, format, precision = 0, prefix = '', suffix = '') => {
    if (typeof value === 'string')
        return `${prefix}${value}${suffix}`;
    let formattedValue;
    switch (format) {
        case 'currency':
            formattedValue = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: precision,
                maximumFractionDigits: precision
            }).format(value);
            break;
        case 'percentage':
            formattedValue = `${value.toFixed(precision)}%`;
            break;
        case 'bytes':
            const units = ['B', 'KB', 'MB', 'GB', 'TB'];
            let bytes = value;
            let unitIndex = 0;
            while (bytes >= 1024 && unitIndex < units.length - 1) {
                bytes /= 1024;
                unitIndex++;
            }
            formattedValue = `${bytes.toFixed(precision)} ${units[unitIndex]}`;
            break;
        case 'duration':
            if (value < 60) {
                formattedValue = `${value.toFixed(precision)}s`;
            }
            else if (value < 3600) {
                formattedValue = `${(value / 60).toFixed(precision)}m`;
            }
            else {
                formattedValue = `${(value / 3600).toFixed(precision)}h`;
            }
            break;
        case 'number':
        default:
            formattedValue = new Intl.NumberFormat('en-US', {
                minimumFractionDigits: precision,
                maximumFractionDigits: precision
            }).format(value);
            break;
    }
    return `${prefix}${formattedValue}${suffix}`;
};
export const MetricCard = ({ title, value, description, icon: Icon, trend, variant = 'default', size = 'medium', loading = false, onClick, helpText, badge, className = '' }) => {
    const formattedValue = formatValue(value.current, value.format, value.precision, value.prefix, value.suffix);
    const hasTarget = value.target !== undefined;
    const targetProgress = hasTarget && typeof value.current === 'number'
        ? Math.min((value.current / value.target) * 100, 100)
        : 0;
    const sizeClasses = {
        small: 'metric-card-small',
        medium: 'metric-card-medium',
        large: 'metric-card-large'
    };
    const variantClasses = {
        default: 'metric-card-default',
        success: 'metric-card-success',
        warning: 'metric-card-warning',
        error: 'metric-card-error',
        info: 'metric-card-info'
    };
    return (_jsxs("div", { className: `
        metric-card 
        ${sizeClasses[size]} 
        ${variantClasses[variant]}
        ${onClick ? 'clickable' : ''}
        ${loading ? 'loading' : ''}
        ${className}
      `, onClick: onClick, children: [loading && (_jsx("div", { className: "metric-card-loading", children: _jsx("div", { className: "loading-shimmer" }) })), !loading && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "metric-card-header", children: [_jsxs("div", { className: "metric-title-section", children: [Icon && (_jsx("div", { className: "metric-icon", children: _jsx(Icon, { size: size === 'small' ? 16 : size === 'large' ? 24 : 20 }) })), _jsxs("div", { className: "metric-title-text", children: [_jsx("h3", { className: "metric-title", children: title }), helpText && (_jsxs("div", { className: "metric-help", children: [_jsx(Info, { size: 14 }), _jsx("div", { className: "help-tooltip", children: helpText })] }))] })] }), badge && (_jsx("div", { className: `metric-badge ${badge.variant || 'default'}`, children: badge.text }))] }), _jsxs("div", { className: "metric-value-section", children: [_jsx("div", { className: "metric-value", children: formattedValue }), trend && (_jsx(TrendIndicator, { value: trend.value, direction: trend.direction, period: trend.period, isGoodTrend: trend.isGoodTrend, size: size }))] }), description && (_jsx("div", { className: "metric-description", children: description })), hasTarget && (_jsxs("div", { className: "metric-target", children: [_jsxs("div", { className: "target-info", children: [_jsx(Target, { size: 12 }), _jsxs("span", { children: ["Target: ", formatValue(value.target, value.format, value.precision)] }), _jsxs("span", { className: "target-percentage", children: [targetProgress.toFixed(0), "%"] })] }), _jsx("div", { className: "target-progress", children: _jsx("div", { className: "target-progress-bar", style: { width: `${targetProgress}%` } }) })] }))] }))] }));
};
export default MetricCard;
