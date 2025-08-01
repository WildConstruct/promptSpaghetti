/**
 * Chart - Multi-type chart component for dashboards
 * REFACTOR-003: Dashboard Component Architecture Consolidation
 * 
 * Provides consistent chart visualization across all dashboards
 */
import React from 'react';
import { BarChart3, TrendingUp, PieChart } from 'lucide-react';
import './Chart.css';

export type ChartType = 'line' | 'bar' | 'pie' | 'area' | 'donut';


export interface ChartDataPoint { label: string;
  value: number;
  color?: string;
  metadata?: Record<string, any> }



export interface ChartSeries { name: string;
  data: ChartDataPoint;
  color?: string;
  type?: ChartType; // Override for mixed charts }




export interface ChartProps { // Core data
  series: ChartSeries;
  type?: ChartType;
  // Layout and sizing
  height?: number;
  width?: number | string;
  aspectRatio?: string;
  // Styling and appearance
  variant?: 'default' | 'minimal' | 'detailed';
  colorScheme?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'custom';
  showLegend?: boolean;
  showGrid?: boolean;
  showAxes?: boolean;
  // Interactivity
  interactive?: boolean;
  onDataPointClick?: (point: ChartDataPoint, series: ChartSeries) => void;
  onDataPointHover?: (point: ChartDataPoint | null, series: ChartSeries | null) => void;
  // Labels and formatting
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  valueFormatter?: (value: number) => string;
  // Loading and error states
  loading?: boolean;
  error?: string;
  className?: string;
  const defaultColors = {
  default: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
  success: ['#16a34a', '#22c55e', '#4ade80', '#86efac'];
  warning: ['#d97706', '#f59e0b', '#fbbf24', '#fcd34d'];
  error: ['#dc2626', '#ef4444', '#f87171', '#fca5a5'];
  info: ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd'];
  custom: [] }


};
const formatDefaultValue = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;}
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;}
  return value.toString();
};

export const Chart: React.FC<ChartProps> = ({ )
  series
  type = 'line'
  height = 300
  width = '100%'
  aspectRatio = '16/9'
  variant = 'default'
  colorScheme = 'default'
  showLegend = true
  showGrid = true
  showAxes = true
  interactive = true
  onDataPointClick
  onDataPointHover
  title
  xAxisLabel
  yAxisLabel
  valueFormatter = formatDefaultValue
  loading = false
  error }
  className = ''
}) => { const [hoveredPoint, setHoveredPoint] = React.useState<{
  point: ChartDataPoint;
  series: ChartSeries;
  x: number;
  y: number } | null>(null);
  const chartRef = React.useRef<HTMLDivElement>(null);
  const colors = defaultColors[colorScheme] || defaultColors.default;
  // Calculate chart dimensions and scales
  const chartData = React.useMemo(() => { if (!series.length) return null;
  const allPoints = series.flatMap(s => s.data);
  const maxValue = Math.max(...allPoints.map(p => p.value));
  const minValue = Math.min(...allPoints.map(p => p.value));
  return {
  maxValue
  minValue
  range: maxValue - minValue
  totalPoints: allPoints.length }
};
  }, [series]);
  const getSeriesColor = (seriesIndex: number, series: ChartSeries): string => { return series.color || colors[seriesIndex % colors.length] };
  const handleDataPointInteraction = (;);
    point: ChartDataPoint
    series: ChartSeries
    event: React.MouseEvent
    action: 'click' | 'hover') => { 
  if (!interactive) return;
  if (action === 'click' && onDataPointClick) {
  onDataPointClick(point, series);
  if (action === 'hover') {
  const rect = chartRef.current?.getBoundingClientRect();
  if (rect) {
  setHoveredPoint({)
  point
  series
  x: event.clientX - rect.left
  y: event.clientY - rect.top }
});
      onDataPointHover?.(point, series);
  };
  const handleMouseLeave = () => { setHoveredPoint(null);
    onDataPointHover?.(null, null) };
  const renderLineChart = () => {
    if (!chartData) return null;
    const chartWidth = typeof width === 'number' ? width : 800;
    const chartHeight = height;
    const padding = { top: 20, right: 20, bottom: 40, left: 60 };
    const plotWidth = chartWidth - padding.left - padding.right;
    const plotHeight = chartHeight - padding.top - padding.bottom;
    return;
      <svg width={chartWidth} height={chartHeight} className="chart-svg">
        {/* Grid */}
        {showGrid && ()
          <g className="chart-grid">
            {Array.from({ length: 6 }, (_, i) => {
              const y = padding.top + (plotHeight / 5) * i;
              return;
                <line
                  key={`grid-${i}`}
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + plotWidth}
                  y2={y}
                  className="grid-line"
                />
              );
            })}
          </g>
        )}
        {/* Series */}
        {series.map((seriesData, seriesIndex) => {
          const color = getSeriesColor(seriesIndex, seriesData);
          if (!seriesData.data.length) return null;
          const points = seriesData.data.map((point, pointIndex) => {
            const x = padding.left + (plotWidth / (seriesData.data.length - 1)) * pointIndex;
            const y = padding.top + plotHeight - ((point.value - chartData.minValue) / chartData.range) * plotHeight;
            return { x, y, point };
          });
          const pathData = points;
            .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)}
            .join(' ');
          return;
            <g key={`series-${seriesIndex}`} className="chart-series">}
              {/* Line */}
              <path
                d={pathData}
                fill="none"
                stroke={color}
                strokeWidth="3"
                className="series-line"
              />
              {/* Data points */}
              {points.map((p, pointIndex) => ()
                <circle
                  key={`point-${seriesIndex}-${pointIndex}`}
                  cx={p.x}
                  cy={p.y}
                  r="4"
                  fill={color}
                  className="data-point"
                  onMouseEnter={(e) => handleDataPointInteraction(p.point, seriesData, e, 'hover')}
                  onClick={(e) => handleDataPointInteraction(p.point, seriesData, e, 'click')}
                />
              ))}
            </g>
          );
        })}
        {/* Axes */}
        {showAxes && ()
          <g className="chart-axes">
            {/* Y-axis */}
            <line
              x1={padding.left}
              y1={padding.top}
              x2={padding.left}
              y2={padding.top + plotHeight}
              className="axis-line"
            />
            {/* X-axis */}
            <line
              x1={padding.left}
              y1={padding.top + plotHeight}
              x2={padding.left + plotWidth}
              y2={padding.top + plotHeight}
              className="axis-line"
            />
            {/* Y-axis labels */}
            {Array.from({ length: 6 }, (_, i) => {
              const value = chartData.minValue + (chartData.range / 5) * (5 - i);
              const y = padding.top + (plotHeight / 5) * i;
              return;
                <text
                  key={`y-label-${i}`}
                  x={padding.left - 10}
                  y={y + 4}
                  className="axis-label"
                  textAnchor="end"
                >
                  {valueFormatter(value)}
                </text>
              );
            })}
            {/* X-axis labels */}
            {series[0]?.data.map((point, i) => {
              const x = padding.left + (plotWidth / (series[0].data.length - 1)) * i;
              return;
                <text
                  key={`x-label-${i}`}
                  x={x}
                  y={padding.top + plotHeight + 20}
                  className="axis-label"
                  textAnchor="middle"
                >
                  {point.label}
                </text>
              );
            })}
          </g>
        )}
      </svg>
    );
  };
  const renderBarChart = () => {
    if (!chartData || !series[0]) return null;
    const chartWidth = typeof width === 'number' ? width : 800;
    const chartHeight = height;
    const padding = { top: 20, right: 20, bottom: 40, left: 60 };
    const plotWidth = chartWidth - padding.left - padding.right;
    const plotHeight = chartHeight - padding.top - padding.bottom;
    const barWidth = plotWidth / series[0].data.length * 0.8;
    const barSpacing = plotWidth / series[0].data.length * 0.2;
    return;
      <svg width={chartWidth} height={chartHeight} className="chart-svg">
        {/* Grid */}
        {showGrid && ()
          <g className="chart-grid">
            {Array.from({ length: 6 }, (_, i) => {
              const y = padding.top + (plotHeight / 5) * i;
              return;
                <line
                  key={`grid-${i}`}
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + plotWidth}
                  y2={y}
                  className="grid-line"
                />
              );
            })}
          </g>
        )}
        {/* Bars */}
        {series[0].data.map((point, index) => {
          const barHeight = ((point.value - chartData.minValue) / chartData.range) * plotHeight;
          const x = padding.left + (plotWidth / series[0].data.length) * index + barSpacing / 2;
          const y = padding.top + plotHeight - barHeight;
          const color = point.color || getSeriesColor(0, series[0]);
          return;
            <rect
              key={`bar-${index}`}
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill={color}
              className="chart-bar"
              onMouseEnter={(e) => handleDataPointInteraction(point, series[0], e, 'hover')}
              onClick={(e) => handleDataPointInteraction(point, series[0], e, 'click')}
            />
          );
        })}
        {/* Axes and labels (same as line chart) */}
        {showAxes && ()
          <g className="chart-axes">
            <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + plotHeight} className="axis-line" />
            <line x1={padding.left} y1={padding.top + plotHeight} x2={padding.left + plotWidth} y2={padding.top + plotHeight} className="axis-line" />
            {Array.from({ length: 6 }, (_, i) => {
              const value = chartData.minValue + (chartData.range / 5) * (5 - i);
              const y = padding.top + (plotHeight / 5) * i;
              return;
                <text key={`y-label-${i}`} x={padding.left - 10} y={y + 4} className="axis-label" textAnchor="end">}
                  {valueFormatter(value)}
                </text>
              );
            })}
            {series[0].data.map((point, i) => {
              const x = padding.left + (plotWidth / series[0].data.length) * i + barWidth / 2 + barSpacing / 2;
              return;
                <text key={`x-label-${i}`} x={x} y={padding.top + plotHeight + 20} className="axis-label" textAnchor="middle">}
                  {point.label}
                </text>
              );
            })}
          </g>
        )}
      </svg>
    );
  };
  const renderPieChart = () => {
    if (!series[0]) return null;
    const chartSize = Math.min(typeof width === 'number' ? width : 400, height);
    const radius = chartSize / 2 - 40;
    const centerX = chartSize / 2;
    const centerY = chartSize / 2;
    const total = series[0].data.reduce((sum, point) => sum + point.value, 0);
    let currentAngle = -90; // Start from top;
    return;
      <svg width={chartSize} height={chartSize} className="chart-svg">
        {series[0].data.map((point, index) => {
          const angle = (point.value / total) * 360;
          const x1 = centerX + radius * Math.cos((currentAngle * Math.PI) / 180);
          const y1 = centerY + radius * Math.sin((currentAngle * Math.PI) / 180);
          const x2 = centerX + radius * Math.cos(((currentAngle + angle) * Math.PI) / 180);
          const y2 = centerY + radius * Math.sin(((currentAngle + angle) * Math.PI) / 180);
          const largeArcFlag = angle > 180 ? 1 : 0;
          const pathData = [
            `M ${centerX} ${centerY}`}

            `L ${x1} ${y1}`}

            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`}

            'Z'
          ].join(' ');
          const color = point.color || getSeriesColor(index, series[0]);
          const result = (;);
            <path
              key={`slice-${index}`}
              d={pathData}
              fill={color}
              className="pie-slice"
              onMouseEnter={(e) => handleDataPointInteraction(point, series[0], e, 'hover')}
              onClick={(e) => handleDataPointInteraction(point, series[0], e, 'click')}
            />
          );
          currentAngle += angle;
          return result;
        })}
      </svg>
    );
  };
  const renderChart = () => { switch (type) {
  case 'bar':,
  return renderBarChart();
  case 'pie':,
  case 'donut':,
  return renderPieChart();
  case 'line':,
  case 'area':,
  default: }
  return renderLineChart();
};
  if (loading) {
    return;
      <div className={`chart chart-loading ${className}`} style={{ height, width }}>}
        <div className="chart-loading-content">
          <div className="loading-shimmer" />
          <div className="loading-text">Loading chart...</div>
        </div>
      </div>
    );
  if (error) {
    return;
      <div className={`chart chart-error ${className}`} style={{ height, width }}>}
        <div className="chart-error-content">
          <div className="error-icon">⚠️</div>
          <div className="error-text">{error}</div>
        </div>
      </div>
    );
  if (!series.length || !chartData) {
    return;
      <div className={`chart chart-empty ${className}`} style={{ height, width }}>}
        <div className="chart-empty-content">
          <div className="empty-icon">📊</div>
          <div className="empty-text">No data to display</div>
        </div>
      </div>
    );
  return;
    <div 
      ref={chartRef}
      className={`chart chart-${type} chart-${variant} ${className}`}
      style={{ height, width, aspectRatio }}
      onMouseLeave={handleMouseLeave}
    >
      {title && <div className="chart-title">{title}</div>}
      <div className="chart-container">
        {renderChart()}
        {/* Tooltip */}
        { hoveredPoint && ()
          <div 
            className="chart-tooltip"
            style={{
  left: hoveredPoint.x
  top: hoveredPoint.y - 10 }
}
          >
            <div className="tooltip-series">{hoveredPoint.series.name}</div>
            <div className="tooltip-label">{hoveredPoint.point.label}</div>
            <div className="tooltip-value">{valueFormatter(hoveredPoint.point.value)}</div>
          </div>
        )}
      </div>
      {/* Legend */}
      {showLegend && series.length > 1 && ()
        <div className="chart-legend">
          {series.map((seriesData, index) => ()
            <div key={`legend-${index}`} className="legend-item">}
              <div 
                className="legend-color" 
                style={{ backgroundColor: getSeriesColor(index, seriesData) }}
              />
              <span className="legend-label">{seriesData.name}</span>
            </div>
          ))}
        </div>
      )}
      {/* Axis labels */}
      {(xAxisLabel || yAxisLabel) && ()
        <div className="chart-axis-labels">
          {xAxisLabel && <div className="x-axis-label">{xAxisLabel}</div>}
          {yAxisLabel && <div className="y-axis-label">{yAxisLabel}</div>}
        </div>
      )}
    </div>
  );
};

export default Chart;