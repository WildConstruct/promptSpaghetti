import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// packages/core/components/WeightControls/WeightVisualization.tsx
// Weight Distribution Visualization Components for Story 8.3 Task 2
// Implements pie chart and bar graph alternatives for visual weight distribution
import { useMemo } from 'react';
// Shared color palette for consistent option visualization across all weight components
export const WEIGHT_OPTION_COLORS = [
    '#4299e1', // Blue
    '#48bb78', // Green
    '#ed8936', // Orange
    '#9f7aea', // Purple
    '#38b2ac', // Teal
    '#ec4899', // Pink
    '#f6ad55', // Light Orange
    '#68d391', // Light Green
    '#a78bfa', // Light Purple
    '#4fd1c7' // Light Teal
];
export const getOptionColor = (index) => {
    return WEIGHT_OPTION_COLORS[index % WEIGHT_OPTION_COLORS.length];
};
// Pie Chart Component
const PieChart = ({ options, width = 200, height = 200, showLabels = true, showPercentages = true, className = '' }) => {
    const { slices, totalWeight } = useMemo(() => {
        const total = options.reduce((sum, option) => sum + option.weight, 0);
        let currentAngle = 0;
        const slices = options.map((option, index) => {
            const percentage = total > 0 ? (option.weight / total) * 100 : 0;
            const angle = total > 0 ? (option.weight / total) * 360 : 0;
            const startAngle = currentAngle;
            currentAngle += angle;
            return {
                option,
                percentage,
                angle,
                startAngle,
                endAngle: currentAngle,
                color: getOptionColor(index)
            };
        });
        return { slices, totalWeight: total };
    }, [options]);
    const radius = Math.min(width, height) / 2 - 10;
    const centerX = width / 2;
    const centerY = height / 2;
    // Generate SVG path for pie slice
    const createPieSlice = (startAngle, endAngle, radius) => {
        const startAngleRad = (startAngle - 90) * (Math.PI / 180);
        const endAngleRad = (endAngle - 90) * (Math.PI / 180);
        const x1 = centerX + radius * Math.cos(startAngleRad);
        const y1 = centerY + radius * Math.sin(startAngleRad);
        const x2 = centerX + radius * Math.cos(endAngleRad);
        const y2 = centerY + radius * Math.sin(endAngleRad);
        const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
        return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
    };
    // Calculate label position
    const getLabelPosition = (startAngle, endAngle, radius) => {
        const midAngle = (startAngle + endAngle) / 2;
        const midAngleRad = (midAngle - 90) * (Math.PI / 180);
        const labelRadius = radius * 0.7;
        return {
            x: centerX + labelRadius * Math.cos(midAngleRad),
            y: centerY + labelRadius * Math.sin(midAngleRad)
        };
    };
    if (totalWeight === 0) {
        return (_jsx("div", { className: `weight-visualization pie-chart ${className}`, style: { width, height }, children: _jsxs("svg", { width: width, height: height, children: [_jsx("circle", { cx: centerX, cy: centerY, r: radius, fill: "#4a5568", stroke: "#2d3748", strokeWidth: "2" }), _jsx("text", { x: centerX, y: centerY, textAnchor: "middle", dominantBaseline: "middle", fill: "#a0aec0", fontSize: "12", children: "No Data" })] }) }));
    }
    return (_jsx("div", { className: `weight-visualization pie-chart ${className}`, style: { width, height }, children: _jsx("svg", { width: width, height: height, children: slices.map((slice, index) => (_jsxs("g", { children: [_jsx("path", { d: createPieSlice(slice.startAngle, slice.endAngle, radius), fill: slice.color, stroke: "#2d3748", strokeWidth: "2", opacity: 0.9 }), showLabels && slice.percentage > 5 && (_jsx("text", { x: getLabelPosition(slice.startAngle, slice.endAngle, radius).x, y: getLabelPosition(slice.startAngle, slice.endAngle, radius).y, textAnchor: "middle", dominantBaseline: "middle", fill: "white", fontSize: "10", fontWeight: "bold", children: showPercentages ? `${Math.round(slice.percentage)}%` : slice.option.text }))] }, slice.option.id))) }) }));
};
// Bar Graph Component
const BarGraph = ({ options, width = 300, height = 200, showLabels = true, showPercentages = true, className = '' }) => {
    const { bars, maxWeight, totalWeight } = useMemo(() => {
        const total = options.reduce((sum, option) => sum + option.weight, 0);
        const max = Math.max(...options.map(option => option.weight), 1);
        const bars = options.map((option, index) => ({
            option,
            percentage: total > 0 ? (option.weight / total) * 100 : 0,
            height: max > 0 ? (option.weight / max) * (height - 60) : 0,
            color: getOptionColor(index)
        }));
        return { bars, maxWeight: max, totalWeight: total };
    }, [options, height]);
    const barWidth = Math.max(20, (width - 40) / options.length - 5);
    const barSpacing = 5;
    return (_jsx("div", { className: `weight-visualization bar-graph ${className}`, style: { width, height }, children: _jsxs("svg", { width: width, height: height, children: [_jsx("line", { x1: "30", y1: "20", x2: "30", y2: height - 40, stroke: "#4a5568", strokeWidth: "1" }), _jsx("line", { x1: "30", y1: height - 40, x2: width - 10, y2: height - 40, stroke: "#4a5568", strokeWidth: "1" }), bars.map((bar, index) => {
                    const x = 35 + index * (barWidth + barSpacing);
                    const y = height - 40 - bar.height;
                    return (_jsxs("g", { children: [_jsx("rect", { x: x, y: y, width: barWidth, height: bar.height, fill: bar.color, stroke: "#2d3748", strokeWidth: "1", opacity: 0.9 }), showPercentages && bar.height > 15 && (_jsxs("text", { x: x + barWidth / 2, y: y - 5, textAnchor: "middle", fill: "#e2e8f0", fontSize: "10", fontWeight: "bold", children: [Math.round(bar.percentage), "%"] })), showLabels && (_jsx("text", { x: x + barWidth / 2, y: height - 25, textAnchor: "middle", fill: "#a0aec0", fontSize: "9", transform: `rotate(-15, ${x + barWidth / 2}, ${height - 25})`, children: bar.option.text.length > 8 ? `${bar.option.text.slice(0, 8)}...` : bar.option.text }))] }, bar.option.id));
                }), _jsx("text", { x: "5", y: "25", fill: "#a0aec0", fontSize: "9", children: maxWeight }), _jsx("text", { x: "5", y: height - 35, fill: "#a0aec0", fontSize: "9", children: "0" }), _jsx("text", { x: "5", y: (height - 40) / 2 + 15, fill: "#a0aec0", fontSize: "9", children: Math.round(maxWeight / 2) })] }) }));
};
// Main Weight Visualization Component
export const WeightVisualization = (props) => {
    if (props.type === 'pie') {
        return _jsx(PieChart, { ...props });
    }
    else {
        return _jsx(BarGraph, { ...props });
    }
};
export const WeightLegend = ({ options, className = '' }) => {
    const totalWeight = options.reduce((sum, option) => sum + option.weight, 0);
    return (_jsx("div", { className: `weight-legend ${className}`, style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            fontSize: '12px',
            color: '#e2e8f0'
        }, children: options.map((option, index) => {
            const percentage = totalWeight > 0 ? (option.weight / totalWeight) * 100 : 0;
            return (_jsxs("div", { style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }, children: [_jsx("div", { style: {
                            width: '12px',
                            height: '12px',
                            borderRadius: '2px',
                            backgroundColor: getOptionColor(index),
                            flexShrink: 0
                        } }), _jsx("span", { style: { flex: 1, minWidth: 0 }, children: option.text }), _jsxs("span", { style: { color: '#a0aec0', fontWeight: 'bold' }, children: [Math.round(percentage), "%"] })] }, option.id));
        }) }));
};
export default WeightVisualization;
