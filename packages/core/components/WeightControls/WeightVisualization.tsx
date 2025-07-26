// packages/core/components/WeightControls/WeightVisualization.tsx
// Weight Distribution Visualization Components for Story 8.3 Task 2
// Implements pie chart and bar graph alternatives for visual weight distribution

import React, { useMemo } from 'react';
import { WeightControlOption } from '../Inspector/WeightControlSlider';

export interface WeightVisualizationProps {
  options: WeightControlOption[];
  type: 'pie' | 'bar';
  width?: number;
  height?: number;
  showLabels?: boolean;
  showPercentages?: boolean;
  className?: string;
}

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
  '#4fd1c7'  // Light Teal
];

export const getOptionColor = (index: number): string => {
  return WEIGHT_OPTION_COLORS[index % WEIGHT_OPTION_COLORS.length];
};

// Pie Chart Component
const PieChart: React.FC<WeightVisualizationProps> = ({
  options,
  width = 200,
  height = 200,
  showLabels = true,
  showPercentages = true,
  className = ''
}) => {
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
  const createPieSlice = (startAngle: number, endAngle: number, radius: number) => {
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
  const getLabelPosition = (startAngle: number, endAngle: number, radius: number) => {
    const midAngle = (startAngle + endAngle) / 2;
    const midAngleRad = (midAngle - 90) * (Math.PI / 180);
    const labelRadius = radius * 0.7;
    
    return {
      x: centerX + labelRadius * Math.cos(midAngleRad),
      y: centerY + labelRadius * Math.sin(midAngleRad)
    };
  };

  if (totalWeight === 0) {
    return (
      <div className={`weight-visualization pie-chart ${className}`} style={{ width, height }}>
        <svg width={width} height={height}>
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill="#4a5568"
            stroke="#2d3748"
            strokeWidth="2"
          />
          <text
            x={centerX}
            y={centerY}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#a0aec0"
            fontSize="12"
          >
            No Data
          </text>
        </svg>
      </div>
    );
  }

  return (
    <div className={`weight-visualization pie-chart ${className}`} style={{ width, height }}>
      <svg width={width} height={height}>
        {slices.map((slice, index) => (
          <g key={slice.option.id}>
            <path
              d={createPieSlice(slice.startAngle, slice.endAngle, radius)}
              fill={slice.color}
              stroke="#2d3748"
              strokeWidth="2"
              opacity={0.9}
            />
            {showLabels && slice.percentage > 5 && (
              <text
                x={getLabelPosition(slice.startAngle, slice.endAngle, radius).x}
                y={getLabelPosition(slice.startAngle, slice.endAngle, radius).y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize="10"
                fontWeight="bold"
              >
                {showPercentages ? `${Math.round(slice.percentage)}%` : slice.option.text}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
};

// Bar Graph Component
const BarGraph: React.FC<WeightVisualizationProps> = ({
  options,
  width = 300,
  height = 200,
  showLabels = true,
  showPercentages = true,
  className = ''
}) => {
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

  return (
    <div className={`weight-visualization bar-graph ${className}`} style={{ width, height }}>
      <svg width={width} height={height}>
        {/* Y-axis */}
        <line
          x1="30"
          y1="20"
          x2="30"
          y2={height - 40}
          stroke="#4a5568"
          strokeWidth="1"
        />
        
        {/* X-axis */}
        <line
          x1="30"
          y1={height - 40}
          x2={width - 10}
          y2={height - 40}
          stroke="#4a5568"
          strokeWidth="1"
        />

        {/* Bars */}
        {bars.map((bar, index) => {
          const x = 35 + index * (barWidth + barSpacing);
          const y = height - 40 - bar.height;
          
          return (
            <g key={bar.option.id}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={bar.height}
                fill={bar.color}
                stroke="#2d3748"
                strokeWidth="1"
                opacity={0.9}
              />
              
              {/* Percentage label on top of bar */}
              {showPercentages && bar.height > 15 && (
                <text
                  x={x + barWidth / 2}
                  y={y - 5}
                  textAnchor="middle"
                  fill="#e2e8f0"
                  fontSize="10"
                  fontWeight="bold"
                >
                  {Math.round(bar.percentage)}%
                </text>
              )}
              
              {/* Option label at bottom */}
              {showLabels && (
                <text
                  x={x + barWidth / 2}
                  y={height - 25}
                  textAnchor="middle"
                  fill="#a0aec0"
                  fontSize="9"
                  transform={`rotate(-15, ${x + barWidth / 2}, ${height - 25})`}
                >
                  {bar.option.text.length > 8 ? `${bar.option.text.slice(0, 8)}...` : bar.option.text}
                </text>
              )}
            </g>
          );
        })}

        {/* Y-axis labels */}
        <text x="5" y="25" fill="#a0aec0" fontSize="9">{maxWeight}</text>
        <text x="5" y={height - 35} fill="#a0aec0" fontSize="9">0</text>
        <text x="5" y={(height - 40) / 2 + 15} fill="#a0aec0" fontSize="9">{Math.round(maxWeight / 2)}</text>
      </svg>
    </div>
  );
};

// Main Weight Visualization Component
export const WeightVisualization: React.FC<WeightVisualizationProps> = (props) => {
  if (props.type === 'pie') {
    return <PieChart {...props} />;
  } else {
    return <BarGraph {...props} />;
  }
};

// Legend Component for both visualizations
export interface WeightLegendProps {
  options: WeightControlOption[];
  className?: string;
}

export 
  return (
    <div className={`weight-legend ${className}`} style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      fontSize: '12px',
      color: '#e2e8f0'
    }}>
      {options.map((option, index) => {
        const percentage = totalWeight > 0 ? (option.weight / totalWeight) * 100 : 0;
        
        return (
          <div
            key={option.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '2px',
                backgroundColor: getOptionColor(index),
                flexShrink: 0
              }}
            />
            <span style={{ flex: 1, minWidth: 0 }}>
              {option.text}
            </span>
            <span style={{ color: '#a0aec0', fontWeight: 'bold' }}>
              {Math.round(percentage)}%
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default WeightVisualization;