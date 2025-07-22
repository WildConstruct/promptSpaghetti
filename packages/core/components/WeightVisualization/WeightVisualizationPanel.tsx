/**
 * Weight Visualization Panel
 * Epic 8.3 Task 2: Professional weight visualization panel with multiple chart types
 * 
 * Comprehensive visualization panel for creative weight management
 */

import React, { useState, useMemo, useCallback } from 'react';
import { WeightDistributionChart, ChartType } from './WeightDistributionChart';
import { WeightControlOption } from '../Inspector/WeightControlSlider';
import { CollapsibleSection } from '../Inspector/CollapsibleSection';

export interface WeightVisualizationPanelProps {
  options: WeightControlOption[];
  title?: string;
  defaultChartType?: ChartType;
  showChartControls?: boolean;
  showStatistics?: boolean;
  collapsed?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
  onOptionHover?: (option: WeightControlOption | null) => void;
  onOptionClick?: (option: WeightControlOption) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const WeightVisualizationPanel: React.FC<WeightVisualizationPanelProps> = ({
  options,
  title = 'Weight Distribution',
  defaultChartType = 'pie',
  showChartControls = true,
  showStatistics = true,
  collapsed = false,
  onCollapseChange,
  onOptionHover,
  onOptionClick,
  className,
  style
}) => {
  const [chartType, setChartType] = useState<ChartType>(defaultChartType);
  const [colorScheme, setColorScheme] = useState<'professional' | 'cinema4d' | 'warm' | 'cool'>('cinema4d');
  const [showLabels, setShowLabels] = useState(true);
  const [showPercentages, setShowPercentages] = useState(true);

  // Calculate statistics
  const statistics = useMemo(() => {
    if (options.length === 0) return null;

    const totalWeight = options.reduce((sum, opt) => sum + opt.weight, 0);
    const weights = options.map(opt => opt.weight);
    const normalizedWeights = weights.map(w => totalWeight > 0 ? w / totalWeight : 1 / options.length);

    // Calculate entropy (measure of distribution evenness)
    const entropy = -normalizedWeights.reduce((sum, p) => p > 0 ? sum + p * Math.log2(p) : sum, 0);
    const maxEntropy = Math.log2(options.length);
    const evenness = maxEntropy > 0 ? entropy / maxEntropy : 0;

    // Find dominant option
    const maxWeightIndex = weights.indexOf(Math.max(...weights));
    const dominantOption = options[maxWeightIndex];
    const dominancePercentage = normalizedWeights[maxWeightIndex] * 100;

    return {
      totalWeight,
      minWeight: Math.min(...weights),
      maxWeight: Math.max(...weights),
      avgWeight: totalWeight / options.length,
      entropy: entropy,
      evenness: evenness,
      dominantOption,
      dominancePercentage,
      isBalanced: evenness > 0.8, // Consider balanced if entropy > 80% of max
      optionCount: options.length
    };
  }, [options]);

  // Chart type controls
  const ChartTypeSelector = () => (
    <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
      {[
        { type: 'pie' as ChartType, icon: '◯', label: 'Pie' },
        { type: 'donut' as ChartType, icon: '○', label: 'Donut' },
        { type: 'bar' as ChartType, icon: '▬', label: 'Bar' }
      ].map(({ type, icon, label }) => (
        <button
          key={type}
          onClick={() => setChartType(type)}
          style={{
            padding: '6px 10px',
            fontSize: 11,
            fontWeight: 500,
            border: '1px solid rgba(55, 65, 81, 0.6)',
            borderRadius: 4,
            background: chartType === type ? '#ff7c00' : 'rgba(31, 41, 55, 0.5)',
            color: chartType === type ? '#fff' : '#e5e7eb',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}
          onMouseEnter={(e) => {
            if (chartType !== type) {
              e.currentTarget.style.background = 'rgba(255, 124, 0, 0.1)';
              e.currentTarget.style.borderColor = '#ff7c00';
            }
          }}
          onMouseLeave={(e) => {
            if (chartType !== type) {
              e.currentTarget.style.background = 'rgba(31, 41, 55, 0.5)';
              e.currentTarget.style.borderColor = 'rgba(55, 65, 81, 0.6)';
            }
          }}
        >
          <span style={{ fontSize: 12 }}>{icon}</span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );

  // Color scheme selector
  const ColorSchemeSelector = () => (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 11, color: '#9ca3af', marginBottom: 6, display: 'block' }}>
        Color Scheme
      </label>
      <select
        value={colorScheme}
        onChange={(e) => setColorScheme(e.target.value as any)}
        style={{
          width: '100%',
          padding: '6px 8px',
          fontSize: 11,
          background: 'rgba(31, 41, 55, 0.8)',
          border: '1px solid rgba(55, 65, 81, 0.6)',
          borderRadius: 4,
          color: '#e5e7eb',
          cursor: 'pointer'
        }}
      >
        <option value="cinema4d">Cinema 4D Orange</option>
        <option value="professional">Professional Blue</option>
        <option value="warm">Warm Palette</option>
        <option value="cool">Cool Palette</option>
      </select>
    </div>
  );

  // Display options
  const DisplayOptions = () => (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 11, color: '#9ca3af', marginBottom: 6, display: 'block' }}>
        Display Options
      </label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#e5e7eb', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={showLabels}
            onChange={(e) => setShowLabels(e.target.checked)}
            style={{ cursor: 'pointer' }}
          />
          Show Labels
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#e5e7eb', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={showPercentages}
            onChange={(e) => setShowPercentages(e.target.checked)}
            style={{ cursor: 'pointer' }}
          />
          Show Percentages
        </label>
      </div>
    </div>
  );

  // Statistics display
  const StatisticsDisplay = () => {
    if (!statistics || !showStatistics) return null;

    return (
      <div
        style={{
          marginTop: 16,
          padding: 12,
          background: 'rgba(31, 41, 55, 0.3)',
          borderRadius: 6,
          border: '1px solid rgba(55, 65, 81, 0.4)'
        }}
      >
        <h4 style={{ 
          fontSize: 11, 
          fontWeight: 600, 
          color: '#e5e7eb', 
          marginBottom: 8,
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Distribution Statistics
        </h4>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 10 }}>
          <div style={{ color: '#9ca3af' }}>
            <div>Options: <span style={{ color: '#e5e7eb', fontWeight: 500 }}>{statistics.optionCount}</span></div>
            <div>Total Weight: <span style={{ color: '#e5e7eb', fontWeight: 500 }}>{statistics.totalWeight.toFixed(2)}</span></div>
            <div>Average: <span style={{ color: '#e5e7eb', fontWeight: 500 }}>{statistics.avgWeight.toFixed(2)}</span></div>
          </div>
          <div style={{ color: '#9ca3af' }}>
            <div>Min: <span style={{ color: '#e5e7eb', fontWeight: 500 }}>{statistics.minWeight.toFixed(2)}</span></div>
            <div>Max: <span style={{ color: '#e5e7eb', fontWeight: 500 }}>{statistics.maxWeight.toFixed(2)}</span></div>
            <div>Range: <span style={{ color: '#e5e7eb', fontWeight: 500 }}>{(statistics.maxWeight - statistics.minWeight).toFixed(2)}</span></div>
          </div>
        </div>
        
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(55, 65, 81, 0.4)' }}>
          <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 4 }}>
            Dominant Option: <span style={{ color: '#ff7c00', fontWeight: 500 }}>
              {statistics.dominantOption.text} ({statistics.dominancePercentage.toFixed(1)}%)
            </span>
          </div>
          <div style={{ fontSize: 10, color: '#9ca3af' }}>
            Balance Score: <span style={{ 
              color: statistics.isBalanced ? '#10b981' : '#f59e0b', 
              fontWeight: 500 
            }}>
              {(statistics.evenness * 100).toFixed(0)}%
            </span>
            <span style={{ marginLeft: 4, fontSize: 9 }}>
              ({statistics.isBalanced ? 'Well Balanced' : 'Unbalanced'})
            </span>
          </div>
        </div>
      </div>
    );
  };

  const content = (
    <div style={{ padding: '0 4px' }}>
      {/* Chart Controls */}
      {showChartControls && (
        <>
          <ChartTypeSelector />
          <ColorSchemeSelector />
          <DisplayOptions />
        </>
      )}
      
      {/* Main Chart */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
        <WeightDistributionChart
          options={options}
          type={chartType}
          width={240}
          height={chartType === 'bar' ? Math.min(300, Math.max(160, options.length * 32 + 60)) : 240}
          showLabels={showLabels}
          showPercentages={showPercentages}
          colorScheme={colorScheme}
          onOptionHover={onOptionHover}
          onOptionClick={onOptionClick}
        />
      </div>
      
      {/* Statistics */}
      <StatisticsDisplay />
    </div>
  );

  // If no onCollapseChange provided, render non-collapsible version
  if (!onCollapseChange) {
    return (
      <div className={className} style={style}>
        <div style={{ 
          marginBottom: 12,
          paddingBottom: 8,
          borderBottom: '1px solid rgba(55, 65, 81, 0.4)'
        }}>
          <h3 style={{ 
            fontSize: 13, 
            fontWeight: 600, 
            color: '#e5e7eb',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            📊 {title}
          </h3>
        </div>
        {content}
      </div>
    );
  }

  // Collapsible version
  return (
    <div className={className} style={style}>
      <CollapsibleSection
        title={`📊 ${title}`}
        collapsed={collapsed}
        onToggle={onCollapseChange}
        className="weight-visualization-panel"
      >
        {content}
      </CollapsibleSection>
    </div>
  );
};

export default WeightVisualizationPanel;