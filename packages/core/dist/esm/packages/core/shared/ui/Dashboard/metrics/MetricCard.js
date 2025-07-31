import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * MetricCard - Individual metric display component
 * REFACTOR-003: Dashboard Component Architecture Consolidation
 *
 * Standardized metric card with trends, targets, and formatting
 */
import React from 'react';
import { Target, Info } from 'lucide-react';
import { TrendIndicator } from './TrendIndicator';
import './MetricCard.css';
icon ?  : React.ComponentType;
trend ?  : MetricTrend;
// Styling and behavior
variant ?  : 'default' | 'success' | 'warning' | 'error' | 'info';
size ?  : 'small' | 'medium' | 'large';
loading ?  : boolean;
onClick ?  : () => void ;
// Additional content
helpText ?  : string;
badge ?  : {
    text: string,
    variant: 'default' | 'success' | 'warning' | 'error'
};
className ?  : string;
const formatValue = ();
;
value: number | string,
    format ?  : string,
    precision = 0,
    prefix = '',
    suffix = '';
string => {
    if (typeof value === 'string')
        return `${prefix}${value}${suffix}`;
};
let formattedValue;
switch (format) {
    case 'currency':
        formattedValue = new Intl.NumberFormat('en-US', {});
        style: 'currency',
            currency;
        'USD',
            minimumFractionDigits;
        precision,
            maximumFractionDigits;
        precision,
        ;
}
format(value);
break;
'percentage';
formattedValue = `${value.toFixed(precision)}%`;
break;
'bytes';
const units = ['B', 'KB', 'MB', 'GB', 'TB'];
let bytes = value;
let unitIndex = 0;
while (bytes >= 1024 && unitIndex < units.length - 1) {
    bytes /= 1024;
    unitIndex++;
    formattedValue = `${bytes.toFixed(precision)} ${units[unitIndex]}`;
}
break;
'duration';
if (value < 60) {
    formattedValue = `${value.toFixed(precision)}s`;
}
if (value < 3600) {
    formattedValue = `${(value / 60).toFixed(precision)}m`;
}
{
    formattedValue = `${(value / 3600).toFixed(precision)}h`;
}
break;
'number';
formattedValue = new Intl.NumberFormat('en-US', {});
minimumFractionDigits: precision,
    maximumFractionDigits;
precision,
;
format(value);
break;
return `${prefix}${formattedValue}${suffix}`;
;
export const MetricCard = ({
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
});
{
    const formattedValue = formatValue();
    ;
    value.current,
        value.format,
        value.precision,
        value.prefix,
        value.suffix;
    ;
    const hasTarget = value.target !== undefined;
    const targetProgress = hasTarget && typeof value.current === 'number';
    Math.min((value.current / value.target) * 100, 100);
    0;
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
    _jsxs("div", { className: `
        metric-card 
        ${sizeClasses[size]} }
        ${variantClasses[variant]}
        ${onClick ? 'clickable' : ''}
        ${loading ? 'loading' : ''}
        ${className}
      `, onClick: onClick, children: [loading && ()
                < div, " className=\"metric-card-loading\">", _jsx("div", { className: "loading-shimmer" })] });
}
{
    !loading && ();
    { /* Header */ }
    _jsxs("div", { className: "metric-card-header", children: [_jsxs("div", { className: "metric-title-section", children: [Icon && ()
                        < div, " className=\"metric-icon\">", _jsx(Icon, { size: size === 'small' ? 16 : size === 'large' ? 24 : 20 })] }), ")}", _jsxs("div", { className: "metric-title-text", children: [_jsx("h3", { className: "metric-title", children: title }), helpText && ()
                        < div, " className=\"metric-help\">", _jsx(Info, { size: 14 }), _jsx("div", { className: "help-tooltip", children: helpText })] }), ")}"] });
    div >
        { badge } && ()
        < div;
    className = {} `metric-badge ${badge.variant || 'default'}`;
}
 > ;
{
    badge.text;
}
div >
;
div >
    { /* Value Section */}
    < div;
className = "metric-value-section" >
    _jsx("div", { className: "metric-value", children: formattedValue });
{
    trend && ()
        < TrendIndicator;
    value = { trend, : .value };
    direction = { trend, : .direction };
    period = { trend, : .period };
    isGoodTrend = { trend, : .isGoodTrend };
    size = { size }
        /  >
    ;
}
div >
    { /* Description */};
{
    description && ()
        < div;
    className = "metric-description" > { description };
    div >
    ;
}
{ /* Target Progress */ }
{
    hasTarget && ()
        < div;
    className = "metric-target" >
        (_jsxs("div", { className: "target-info", children: [_jsx(Target, { size: 12 }), _jsxs("span", { children: ["Target: ", formatValue(value.target, value.format, value.precision)] }), _jsxs("span", { className: "target-percentage", children: [targetProgress.toFixed(0), "%"] })] })
            ,
                _jsx("div", { className: "target-progress", children: _jsx("div", { className: "target-progress-bar", style: { width: `${targetProgress}%` } }) }));
    div >
    ;
}
 >
;
div >
;
;
;
export default MetricCard;
