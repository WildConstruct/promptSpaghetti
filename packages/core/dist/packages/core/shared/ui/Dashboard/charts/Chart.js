import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Chart - Multi-type chart component for dashboards
 * REFACTOR-003: Dashboard Component Architecture Consolidation
 *
 * Provides consistent chart visualization across all dashboards
 */
import React from 'react';
import './Chart.css';
const defaultColors = {
    default: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'],
    success: ['#16a34a', '#22c55e', '#4ade80', '#86efac'],
    warning: ['#d97706', '#f59e0b', '#fbbf24', '#fcd34d'],
    error: ['#dc2626', '#ef4444', '#f87171', '#fca5a5'],
    info: ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd'],
    custom: []
};
const formatDefaultValue = (value) => {
    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
};
export const Chart = ({ series, type = 'line', height = 300, width = '100%', aspectRatio = '16/9', variant = 'default', colorScheme = 'default', showLegend = true, showGrid = true, showAxes = true, interactive = true, onDataPointClick, onDataPointHover, title, xAxisLabel, yAxisLabel, valueFormatter = formatDefaultValue, loading = false, error, className = '' }) => {
    const [hoveredPoint, setHoveredPoint] = React.useState(null);
    const chartRef = React.useRef(null);
    const colors = defaultColors[colorScheme] || defaultColors.default;
    // Calculate chart dimensions and scales
    const chartData = React.useMemo(() => {
        if (!series.length)
            return null;
        const allPoints = series.flatMap(s => s.data);
        const maxValue = Math.max(...allPoints.map(p => p.value));
        const minValue = Math.min(...allPoints.map(p => p.value));
        return {
            maxValue,
            minValue,
            range: maxValue - minValue,
            totalPoints: allPoints.length
        };
    }, [series]);
    const getSeriesColor = (seriesIndex, series) => {
        return series.color || colors[seriesIndex % colors.length];
    };
    const handleDataPointInteraction = (point, series, event, action) => {
        if (!interactive)
            return;
        if (action === 'click' && onDataPointClick) {
            onDataPointClick(point, series);
        }
        if (action === 'hover') {
            const rect = chartRef.current?.getBoundingClientRect();
            if (rect) {
                setHoveredPoint({
                    point,
                    series,
                    x: event.clientX - rect.left,
                    y: event.clientY - rect.top
                });
            }
            onDataPointHover?.(point, series);
        }
    };
    const handleMouseLeave = () => {
        setHoveredPoint(null);
        onDataPointHover?.(null, null);
    };
    const renderLineChart = () => {
        if (!chartData)
            return null;
        const chartWidth = typeof width === 'number' ? width : 800;
        const chartHeight = height;
        const padding = { top: 20, right: 20, bottom: 40, left: 60 };
        const plotWidth = chartWidth - padding.left - padding.right;
        const plotHeight = chartHeight - padding.top - padding.bottom;
        return (_jsxs("svg", { width: chartWidth, height: chartHeight, className: "chart-svg", children: [showGrid && (_jsx("g", { className: "chart-grid", children: Array.from({ length: 6 }, (_, i) => {
                        const y = padding.top + (plotHeight / 5) * i;
                        return (_jsx("line", { x1: padding.left, y1: y, x2: padding.left + plotWidth, y2: y, className: "grid-line" }, `grid-${i}`));
                    }) })), series.map((seriesData, seriesIndex) => {
                    const color = getSeriesColor(seriesIndex, seriesData);
                    if (!seriesData.data.length)
                        return null;
                    const points = seriesData.data.map((point, pointIndex) => {
                        const x = padding.left + (plotWidth / (seriesData.data.length - 1)) * pointIndex;
                        const y = padding.top + plotHeight - ((point.value - chartData.minValue) / chartData.range) * plotHeight;
                        return { x, y, point };
                    });
                    const pathData = points
                        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
                        .join(' ');
                    return (_jsxs("g", { className: "chart-series", children: [_jsx("path", { d: pathData, fill: "none", stroke: color, strokeWidth: "3", className: "series-line" }), points.map((p, pointIndex) => (_jsx("circle", { cx: p.x, cy: p.y, r: "4", fill: color, className: "data-point", onMouseEnter: (e) => handleDataPointInteraction(p.point, seriesData, e, 'hover'), onClick: (e) => handleDataPointInteraction(p.point, seriesData, e, 'click') }, `point-${seriesIndex}-${pointIndex}`)))] }, `series-${seriesIndex}`));
                }), showAxes && (_jsxs("g", { className: "chart-axes", children: [_jsx("line", { x1: padding.left, y1: padding.top, x2: padding.left, y2: padding.top + plotHeight, className: "axis-line" }), _jsx("line", { x1: padding.left, y1: padding.top + plotHeight, x2: padding.left + plotWidth, y2: padding.top + plotHeight, className: "axis-line" }), Array.from({ length: 6 }, (_, i) => {
                            const value = chartData.minValue + (chartData.range / 5) * (5 - i);
                            const y = padding.top + (plotHeight / 5) * i;
                            return (_jsx("text", { x: padding.left - 10, y: y + 4, className: "axis-label", textAnchor: "end", children: valueFormatter(value) }, `y-label-${i}`));
                        }), series[0]?.data.map((point, i) => {
                            const x = padding.left + (plotWidth / (series[0].data.length - 1)) * i;
                            return (_jsx("text", { x: x, y: padding.top + plotHeight + 20, className: "axis-label", textAnchor: "middle", children: point.label }, `x-label-${i}`));
                        })] }))] }));
    };
    const renderBarChart = () => {
        if (!chartData || !series[0])
            return null;
        const chartWidth = typeof width === 'number' ? width : 800;
        const chartHeight = height;
        const padding = { top: 20, right: 20, bottom: 40, left: 60 };
        const plotWidth = chartWidth - padding.left - padding.right;
        const plotHeight = chartHeight - padding.top - padding.bottom;
        const barWidth = plotWidth / series[0].data.length * 0.8;
        const barSpacing = plotWidth / series[0].data.length * 0.2;
        return (_jsxs("svg", { width: chartWidth, height: chartHeight, className: "chart-svg", children: [showGrid && (_jsx("g", { className: "chart-grid", children: Array.from({ length: 6 }, (_, i) => {
                        const y = padding.top + (plotHeight / 5) * i;
                        return (_jsx("line", { x1: padding.left, y1: y, x2: padding.left + plotWidth, y2: y, className: "grid-line" }, `grid-${i}`));
                    }) })), series[0].data.map((point, index) => {
                    const barHeight = ((point.value - chartData.minValue) / chartData.range) * plotHeight;
                    const x = padding.left + (plotWidth / series[0].data.length) * index + barSpacing / 2;
                    const y = padding.top + plotHeight - barHeight;
                    const color = point.color || getSeriesColor(0, series[0]);
                    return (_jsx("rect", { x: x, y: y, width: barWidth, height: barHeight, fill: color, className: "chart-bar", onMouseEnter: (e) => handleDataPointInteraction(point, series[0], e, 'hover'), onClick: (e) => handleDataPointInteraction(point, series[0], e, 'click') }, `bar-${index}`));
                }), showAxes && (_jsxs("g", { className: "chart-axes", children: [_jsx("line", { x1: padding.left, y1: padding.top, x2: padding.left, y2: padding.top + plotHeight, className: "axis-line" }), _jsx("line", { x1: padding.left, y1: padding.top + plotHeight, x2: padding.left + plotWidth, y2: padding.top + plotHeight, className: "axis-line" }), Array.from({ length: 6 }, (_, i) => {
                            const value = chartData.minValue + (chartData.range / 5) * (5 - i);
                            const y = padding.top + (plotHeight / 5) * i;
                            return (_jsx("text", { x: padding.left - 10, y: y + 4, className: "axis-label", textAnchor: "end", children: valueFormatter(value) }, `y-label-${i}`));
                        }), series[0].data.map((point, i) => {
                            const x = padding.left + (plotWidth / series[0].data.length) * i + barWidth / 2 + barSpacing / 2;
                            return (_jsx("text", { x: x, y: padding.top + plotHeight + 20, className: "axis-label", textAnchor: "middle", children: point.label }, `x-label-${i}`));
                        })] }))] }));
    };
    const renderPieChart = () => {
        if (!series[0])
            return null;
        const chartSize = Math.min(typeof width === 'number' ? width : 400, height);
        const radius = chartSize / 2 - 40;
        const centerX = chartSize / 2;
        const centerY = chartSize / 2;
        const total = series[0].data.reduce((sum, point) => sum + point.value, 0);
        let currentAngle = -90; // Start from top
        return (_jsx("svg", { width: chartSize, height: chartSize, className: "chart-svg", children: series[0].data.map((point, index) => {
                const angle = (point.value / total) * 360;
                const x1 = centerX + radius * Math.cos((currentAngle * Math.PI) / 180);
                const y1 = centerY + radius * Math.sin((currentAngle * Math.PI) / 180);
                const x2 = centerX + radius * Math.cos(((currentAngle + angle) * Math.PI) / 180);
                const y2 = centerY + radius * Math.sin(((currentAngle + angle) * Math.PI) / 180);
                const largeArcFlag = angle > 180 ? 1 : 0;
                const pathData = [
                    `M ${centerX} ${centerY}`,
                    `L ${x1} ${y1}`,
                    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                    'Z'
                ].join(' ');
                const color = point.color || getSeriesColor(index, series[0]);
                const result = (_jsx("path", { d: pathData, fill: color, className: "pie-slice", onMouseEnter: (e) => handleDataPointInteraction(point, series[0], e, 'hover'), onClick: (e) => handleDataPointInteraction(point, series[0], e, 'click') }, `slice-${index}`));
                currentAngle += angle;
                return result;
            }) }));
    };
    const renderChart = () => {
        switch (type) {
            case 'bar':
                return renderBarChart();
            case 'pie':
            case 'donut':
                return renderPieChart();
            case 'line':
            case 'area':
            default:
                return renderLineChart();
        }
    };
    if (loading) {
        return (_jsx("div", { className: `chart chart-loading ${className}`, style: { height, width }, children: _jsxs("div", { className: "chart-loading-content", children: [_jsx("div", { className: "loading-shimmer" }), _jsx("div", { className: "loading-text", children: "Loading chart..." })] }) }));
    }
    if (error) {
        return (_jsx("div", { className: `chart chart-error ${className}`, style: { height, width }, children: _jsxs("div", { className: "chart-error-content", children: [_jsx("div", { className: "error-icon", children: "\u26A0\uFE0F" }), _jsx("div", { className: "error-text", children: error })] }) }));
    }
    if (!series.length || !chartData) {
        return (_jsx("div", { className: `chart chart-empty ${className}`, style: { height, width }, children: _jsxs("div", { className: "chart-empty-content", children: [_jsx("div", { className: "empty-icon", children: "\uD83D\uDCCA" }), _jsx("div", { className: "empty-text", children: "No data to display" })] }) }));
    }
    return (_jsxs("div", { ref: chartRef, className: `chart chart-${type} chart-${variant} ${className}`, style: { height, width, aspectRatio }, onMouseLeave: handleMouseLeave, children: [title && _jsx("div", { className: "chart-title", children: title }), _jsxs("div", { className: "chart-container", children: [renderChart(), hoveredPoint && (_jsxs("div", { className: "chart-tooltip", style: {
                            left: hoveredPoint.x,
                            top: hoveredPoint.y - 10
                        }, children: [_jsx("div", { className: "tooltip-series", children: hoveredPoint.series.name }), _jsx("div", { className: "tooltip-label", children: hoveredPoint.point.label }), _jsx("div", { className: "tooltip-value", children: valueFormatter(hoveredPoint.point.value) })] }))] }), showLegend && series.length > 1 && (_jsx("div", { className: "chart-legend", children: series.map((seriesData, index) => (_jsxs("div", { className: "legend-item", children: [_jsx("div", { className: "legend-color", style: { backgroundColor: getSeriesColor(index, seriesData) } }), _jsx("span", { className: "legend-label", children: seriesData.name })] }, `legend-${index}`))) })), (xAxisLabel || yAxisLabel) && (_jsxs("div", { className: "chart-axis-labels", children: [xAxisLabel && _jsx("div", { className: "x-axis-label", children: xAxisLabel }), yAxisLabel && _jsx("div", { className: "y-axis-label", children: yAxisLabel })] }))] }));
};
export default Chart;
