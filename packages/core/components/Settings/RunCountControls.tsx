// packages/core/components/Settings/RunCountControls.tsx
// Run count settings controls for Epic 7.3 Advanced Settings Modal
import React, { useCallback } from 'react';
import { RunCountSettings } from '../../settings/types';
import { FiPlayCircle, FiAlertTriangle, FiClock } from 'react-icons/fi';
import { uiColors } from '../../styles/professional-design-system';

// Enhanced color palette for better UI consistency
const uiColors = {},
  ui: { ...uiColors.ui,
  selected: '#353535',
  disabled: '#6b7280' }
},
  text: { ...uiColors.text,
  disabled: '#6b7280' }
};


export interface RunCountControlsProps {
  settings: RunCountSettings;
  onChange: (settings: RunCountSettings) => void;
  /**
  * Run Count Settings Controls Component
  * Manages number of preview variants to generate
  */


export const RunCountControls: React.FC<RunCountControlsProps> = ({ )
  settings }
  onChange
}) => { // Handle run count change
  const handleValueChange = useCallback((value: number) => {
  onChange({)
  ...settings
  value: Math.max(1, Math.min(50, value)) }
});
  }, [settings, onChange]);
  // Handle preset selection
  const handlePresetSelect = useCallback((presetValue: number) => { onChange({)
  ...settings
  value: presetValue }
});
  }, [settings, onChange]);
  // Handle performance warning toggle
  const handleShowWarningChange = useCallback((showPerformanceWarning: boolean) => { onChange({)
  ...settings }
      showPerformanceWarning
    });
  }, [settings, onChange]);
  // Get performance assessment
  const getPerformanceInfo = (count: number) => { if (count <= 3) {
  return {
  level: 'fast',
  color: '#10b981',
  icon: '🚀',
  description: 'Fast execution',
  estimatedTime: '< 1 second' }
};
 else if (count <= 10) { return {
  level: 'moderate',
  color: '#f59e0b',
  icon: '⚡',
  description: 'Moderate execution',
  estimatedTime: '1-3 seconds' }
};
 else if (count <= 20) { return {
  level: 'slow',
  color: '#f97316',
  icon: '⏳',
  description: 'Slower execution',
  estimatedTime: '3-6 seconds' }
};
 else { return {
  level: 'very-slow',
  color: '#ef4444',
  icon: '🐌',
  description: 'Very slow execution',
  estimatedTime: '6+ seconds' }
};
  };
  const perfInfo = getPerformanceInfo(settings.value);
  return;
    <div style={{ marginBottom: '24px' }}>
      {/* Section Header */}
      <div style={ {
  display: 'flex'
  alignItems: 'center'
  gap: '8px'
  marginBottom: '16px' }
}>
        <FiPlayCircle size={18} color={uiColors.accent.primary} />
        <h3 style={ {
  margin: 0
  fontSize: '16px'
  fontWeight: 600
  color: uiColors.text.primary }
}>
          Run Count Settings
        </h3>
      </div>
      {/* Run Count Input */}
      <div style={{ marginBottom: '16px' }}>
        <label style={ {
  display: 'block'
  fontSize: '13px'
  fontWeight: 500
  color: uiColors.text.primary
  marginBottom: '6px' }
}>
          Number of Preview Variants
        </label>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input
            type="number"
            value={settings.value}
            onChange={(e) => handleValueChange(parseInt(e.target.value, 10) || 1)}
            min="1"
            max="50"
            style={ {
              width: '100px'
              padding: '8px 12px' }
              border: `1px solid ${uiColors.ui.border}`}

  borderRadius: '6px'
              backgroundColor: uiColors.background.primary
              color: uiColors.text.primary
              fontSize: '14px'
              outline: 'none'
              textAlign: 'center';

            onFocus={ (e) => {
              e.target.style.borderColor = uiColors.accent.primary }}
            onBlur={ (e) => {
              e.target.style.borderColor = uiColors.ui.border }}
          />
          {/* Performance Indicator */}
          <div style={ {
            display: 'flex'
            alignItems: 'center'
            gap: '6px'
            padding: '6px 10px'
            backgroundColor: perfInfo.color + '20' }
            border: `1px solid ${perfInfo.color}`}

  borderRadius: '6px'
            fontSize: '12px'
            color: perfInfo.color
            fontWeight: 500;
}>
            <span>{perfInfo.icon}</span>
            <span>{perfInfo.description}</span>
            <FiClock size={12} />
            <span>{perfInfo.estimatedTime}</span>
          </div>
        </div>
        <div style={ {
  fontSize: '11px'
  color: uiColors.text.secondary
  marginTop: '4px' }
}>
          Higher counts provide more variation but take longer to generate
        </div>
      </div>
      {/* Run Count Presets */}
      <div style={{ marginBottom: '16px' }}>
        <label style={ {
  display: 'block'
  fontSize: '13px'
  fontWeight: 500
  color: uiColors.text.primary
  marginBottom: '8px' }
}>
          Quick Presets
        </label>
        <div style={ {
  display: 'flex'
  gap: '8px'
  flexWrap: 'wrap' }
}>
          {settings.presets.map((presetValue, index) => {
            const presetPerf = getPerformanceInfo(presetValue);
            const isSelected = settings.value === presetValue;
            return;
              <button
                key={index}
                onClick={() => handlePresetSelect(presetValue)}
                style={ {
                  display: 'flex'
                  flexDirection: 'column'
                  alignItems: 'center'
                  padding: '8px 12px'
                  backgroundColor: isSelected
                    ? presetPerf.color + '20'
                    : uiColors.ui.hover
                  border: isSelected }
                    ? `1px solid ${presetPerf.color}`}
                    : `1px solid ${uiColors.ui.border}`}

  borderRadius: '6px'
                  cursor: 'pointer'
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                  minWidth: '60px';

                title={`${presetValue} variants - ${presetPerf.description}`}
                onMouseEnter={ (e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = uiColors.ui.selected }}
                onMouseLeave={ (e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = uiColors.ui.hover }}
              >
                <div style={ {
  fontSize: '16px'
  fontWeight: 600
  color: isSelected ? presetPerf.color : uiColors.text.primary
  marginBottom: '2px' }
}>
                  {presetValue}
                </div>
                <div style={ {
  fontSize: '10px'
  color: isSelected ? presetPerf.color : uiColors.text.secondary }
}>
                  {presetPerf.icon}
                </div>
              </button>
            );
          })}
        </div>
      </div>
      {/* Performance Warning */}
      { settings.value > 10 && settings.showPerformanceWarning && ()
        <div style={{
  display: 'flex'
  alignItems: 'flex-start'
  gap: '8px'
  padding: '12px'
  backgroundColor: '#f59e0b' + '10'
  border: '1px solid #f59e0b'
  borderRadius: '6px'
  marginBottom: '16px' }
}>
          <FiAlertTriangle size={16} color="#f59e0b" style={{ marginTop: '2px' }} />
          <div>
            <div style={ {
  fontSize: '12px'
  fontWeight: 500
  color: '#f59e0b'
  marginBottom: '4px' }
}>
              Performance Notice
            </div>
            <div style={ {
  fontSize: '11px'
  color: uiColors.text.secondary
  lineHeight: 1.4 }
}>
              Higher run counts ({settings.value} variants) may take longer to generate and could impact UI responsiveness. 
              Consider using fewer variants for faster iteration.
            </div>
          </div>
        </div>
      )}
      {/* Show Performance Warning Toggle */}
      <div style={{ marginBottom: '16px' }}>
        <label style={ {
  display: 'flex'
  alignItems: 'center'
  gap: '8px'
  cursor: 'pointer'
  fontSize: '13px' }
}>
          <input
            type="checkbox"
            checked={settings.showPerformanceWarning}
            onChange={(e) => handleShowWarningChange(e.target.checked)}
            style={{ accentColor: uiColors.accent.primary }}
          />
          <span style={{ color: uiColors.text.primary }}>
            Show performance warnings for high run counts
          </span>
        </label>
        <div style={ {
  fontSize: '11px'
  color: uiColors.text.secondary
  marginTop: '2px'
  marginLeft: '24px' }
}>
          Displays warnings when run count may impact performance
        </div>
      </div>
      {/* Current Configuration Summary */}
      <div style={ {
        padding: '12px'
        backgroundColor: uiColors.ui.hover
        borderRadius: '6px' }
        border: `1px solid ${uiColors.ui.border}`}
}>
        <div style={ {
  display: 'flex'
  alignItems: 'center'
  justifyContent: 'space-between'
  fontSize: '12px' }
}>
          <span style={{ color: uiColors.text.secondary }}>
            Current Configuration:
          </span>
          <span style={ {
  color: perfInfo.color
  fontWeight: 500 }
}>
            {settings.value} variants • {perfInfo.estimatedTime}
          </span>
        </div>
      </div>
    </div>
  );
};