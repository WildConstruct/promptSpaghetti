/**
 * Weight Distribution Visualization Chart
 * Epic 8.3 Task 2: Professional weight distribution visualization with pie chart and bar graph
 * 
 * Professional SVG-based weight visualization for creative professionals
 */

import React, { useMemo, useState, useCallback } from 'react';
import { WeightControlOption } from '../Inspector/WeightControlSlider';

export type ChartType = 'pie' | 'bar' | 'donut';

export interface WeightDistributionChartProps {
  options: WeightControlOption[];
  type?: ChartType;
  width?: number;
  height?: number;
  showLabels?: boolean;
  showPercentages?: boolean;
  showLegend?: boolean;
  colorScheme?: 'professional' | 'cinema4d' | 'warm' | 'cool';
  animationDuration?: number;
  onOptionHover?: (option: WeightControlOption | null) => void;
  onOptionClick?: (option: WeightControlOption) => void;
}

// Professional color schemes for visualization
const COLOR_SCHEMES = {
  professional: [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
  ],
  cinema4d: [
    '#ff7c00', '#4d9eff', '#00d4aa', '#ff4757', '#9c88ff',
    '#ffa502', '#2ed573', '#ff6b6b', '#5f27cd', '#00d2d3'
  ],
  warm: [
    '#ff6b6b', '#ffa500', '#ff7f50', '#dc143c', '#ff1493',
    '#ff69b4', '#ffb347', '#ff8c00', '#ff4500', '#ff6347'
  ],
  cool: [
    '#4169e1', '#00ced1', '#32cd32', '#20b2aa', '#4682b4',
    '#6495ed', '#00bfff', '#1e90ff', '#87ceeb', '#87cefa'
  ]
} as const;

export const WeightDistributionChart: React.FC<WeightDistributionChartProps> = ({
  options,
  type = 'pie',
  width = 240,
  height = 240,
  showLabels = true,
  showPercentages = true,
  showLegend = false,
  colorScheme = 'cinema4d',
  animationDuration = 300,
  onOptionHover,
  onOptionClick
}) => {
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);
  
  // Calculate normalized weights and percentages
  const processedOptions = useMemo(() => {
    const totalWeight = options.reduce((sum, opt) => sum + opt.weight, 0);
    
    return options.map((option, index) => {
      const normalizedWeight = totalWeight > 0 ? option.weight / totalWeight : 1 / options.length;
      const percentage = normalizedWeight * 100;
      const color = COLOR_SCHEMES[colorScheme][index % COLOR_SCHEMES[colorScheme].length];
      
      return {
        ...option,
        normalizedWeight,
        percentage,
        color,
        index
      };
    });
  }, [options, colorScheme]);

  // Handle option interactions
  const handleOptionHover = useCallback((option: WeightControlOption | null) => {
    setHoveredOption(option?.id || null);
    onOptionHover?.(option);
  }, [onOptionHover]);

  const handleOptionClick = useCallback((option: WeightControlOption) => {
    onOptionClick?.(option);
  }, [onOptionClick]);

  // Pie Chart Component
  const PieChart: React.FC = () => {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;
    const innerRadius = type === 'donut' ? radius * 0.6 : 0;
    
    let cumulativeAngle = 0;
    
    return (
      <g>
        {processedOptions.map((option) => {
          const startAngle = cumulativeAngle;
          const endAngle = cumulativeAngle + (option.normalizedWeight * 2 * Math.PI);
          cumulativeAngle = endAngle;
          
          // Calculate arc path
          const x1 = centerX + Math.cos(startAngle) * radius;
          const y1 = centerY + Math.sin(startAngle) * radius;
          const x2 = centerX + Math.cos(endAngle) * radius;
          const y2 = centerY + Math.sin(endAngle) * radius;
          
          const x1Inner = centerX + Math.cos(startAngle) * innerRadius;
          const y1Inner = centerY + Math.sin(startAngle) * innerRadius;
          const x2Inner = centerX + Math.cos(endAngle) * innerRadius;
          const y2Inner = centerY + Math.sin(endAngle) * innerRadius;
          
          const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;
          
          const pathData = type === 'donut' ? 
            `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x2Inner} ${y2Inner} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1Inner} ${y1Inner} Z` :
            `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
          
          const isHovered = hoveredOption === option.id;
          const transform = isHovered ? 'scale(1.05)' : 'scale(1)';
          const transformOrigin = `${centerX}px ${centerY}px`;
          
          // Label position
          const labelAngle = (startAngle + endAngle) / 2;
          const labelRadius = radius * (type === 'donut' ? 0.8 : 0.7);
          const labelX = centerX + Math.cos(labelAngle) * labelRadius;
          const labelY = centerY + Math.sin(labelAngle) * labelRadius;
          
          return (
            <g key={option.id}>
              <path
                d={pathData}
                fill={option.color}
                stroke="rgba(255, 255, 255, 0.2)"
                strokeWidth="1"
                style={{
                  transform,
                  transformOrigin,
                  transition: `transform ${animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
                  filter: isHovered ? 'brightness(1.1) drop-shadow(0 4px 8px rgba(0,0,0,0.2))' : 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={() => handleOptionHover(option)}
                onMouseLeave={() => handleOptionHover(null)}
                onClick={() => handleOptionClick(option)}
              />
              
              {/* Labels */}
              {showLabels && option.percentage > 5 && (
                <g>
                  <text
                    x={labelX}
                    y={labelY - 6}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="500"
                    fill="#e5e7eb"
                    style={{ pointerEvents: 'none' }}
                  >
                    {option.text.length > 12 ? `${option.text.slice(0, 12)}...` : option.text}
                  </text>
                  {showPercentages && (
                    <text
                      x={labelX}
                      y={labelY + 6}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#9ca3af"
                      style={{ pointerEvents: 'none' }}
                    >
                      {option.percentage.toFixed(1)}%
                    </text>
                  )}
                </g>
              )}
            </g>
          );
        })}
        
        {/* Center label for donut chart */}
        {type === 'donut' && (
          <text
            x={centerX}
            y={centerY}
            textAnchor="middle"
            fontSize="14"
            fontWeight="600"
            fill="#e5e7eb"
            style={{ pointerEvents: 'none' }}
          >
            Weights
          </text>
        )}
      </g>
    );
  };

  // Bar Chart Component
  const BarChart: React.FC = () => {
    const margin = { top: 20, right: 20, bottom: 40, left: 80 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    const barHeight = Math.max(16, chartHeight / options.length - 8);
    const maxBarWidth = chartWidth * 0.8;
    
    return (
      <g transform={`translate(${margin.left}, ${margin.top})`}>
        {processedOptions.map((option, index) => {
          const y = index * (barHeight + 8);
          const barWidth = option.normalizedWeight * maxBarWidth;
          const isHovered = hoveredOption === option.id;
          
          return (
            <g key={option.id}>
              {/* Bar background */}
              <rect
                x={0}
                y={y}
                width={maxBarWidth}
                height={barHeight}
                fill="rgba(55, 65, 81, 0.3)"
                rx={2}
              />
              
              {/* Actual bar */}
              <rect
                x={0}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={option.color}
                rx={2}
                style={{
                  transition: `width ${animationDuration}ms cubic-bezier(
                    0.4,
                    0,
                    0.2,
                    1
                  ), filter ${animationDuration}ms`,
                  filter: isHovered ? 'brightness(1.1) drop-shadow(0 2px 4px rgba(0,0,0,0.2))' : 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={() => handleOptionHover(option)}
                onMouseLeave={() => handleOptionHover(null)}
                onClick={() => handleOptionClick(option)}
              />
              
              {/* Label */}
              <text
                x={-8}
                y={y + barHeight / 2}
                textAnchor="end"
                fontSize="11"
                fontWeight="500"
                fill="#e5e7eb"
                dominantBaseline="middle"
                style={{ pointerEvents: 'none' }}
              >
                {option.text.length > 10 ? `${option.text.slice(0, 10)}...` : option.text}
              </text>
              
              {/* Percentage */}
              {showPercentages && (
                <text
                  x={barWidth + 8}
                  y={y + barHeight / 2}
                  textAnchor="start"
                  fontSize="10"
                  fill="#9ca3af"
                  dominantBaseline="middle"
                  style={{ pointerEvents: 'none' }}
                >
                  {option.percentage.toFixed(1)}%
                </text>
              )}
            </g>
          );
        })}
        
        {/* Chart title */}
        <text
          x={chartWidth / 2}
          y={-8}
          textAnchor="middle"
          fontSize="12"
          fontWeight="600"
          fill="#e5e7eb"
          style={{ pointerEvents: 'none' }}
        >
          Weight Distribution
        </text>
      </g>
    );
  };

  // Legend Component
  const Legend: React.FC = () => (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 16,
        padding: 12,
        background: 'rgba(31, 41, 55, 0.5)',
        borderRadius: 8,
        border: '1px solid rgba(55, 65, 81, 0.6)'
      }}
    >
      {processedOptions.map((option) => (
        <div
          key={option.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 8px',
            borderRadius: 4,
            background: hoveredOption === option.id ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
            cursor: 'pointer',
            transition: 'background 0.2s ease'
          }}
          onMouseEnter={() => handleOptionHover(option)}
          onMouseLeave={() => handleOptionHover(null)}
          onClick={() => handleOptionClick(option)}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: option.color,
              boxShadow: `0 0 0 2px ${option.color}20`
            }}
          />
          <span
            style={{
              fontSize: 11,
              color: '#e5e7eb',
              fontWeight: 500
            }}
          >
            {option.text} ({option.percentage.toFixed(1)}%)
          </span>
        </div>
      ))}
    </div>
  );

  if (options.length === 0) {
    return (
      <div
        style={{
          width,
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6b7280',
          fontSize: 12,
          fontStyle: 'italic'
        }}
      >
        No options to visualize
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <svg
        width={width}
        height={height}
        style={{
          background: 'transparent',
          overflow: 'visible'
        }}
      >
        {type === 'bar' ? <BarChart /> : <PieChart />}
      </svg>
      
      {showLegend && <Legend />}
      
      {/* Tooltip for hovered option */}
      {hoveredOption && (
        <div
          style={{
            position: 'absolute',
            top: -40,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.9)',
            color: 'white',
            padding: '6px 12px',
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 500,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            zIndex: 1000
          }}
        >
          {processedOptions.find(opt => opt.id === hoveredOption)?.text}
          {showPercentages && ` (${processedOptions.find(opt => opt.id === hoveredOption)?.percentage.toFixed(1)}%)`}
        </div>
      )}
    </div>
  );
};

export default WeightDistributionChart;