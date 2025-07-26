// packages/core/components/Settings/TemperatureControls.tsx
// Temperature settings controls for Epic 7.3 Advanced Settings Modal

import React, { useCallback } from 'react';
import { TemperatureSettings } from '../../settings/types';
import { FiThermometer, FiEye, FiEyeOff } from 'react-icons/fi';
import { uiColors } from '../../styles/professional-design-system';

// Enhanced color palette for better UI consistency
const uiColors = {
  ...uiColors,
  accent: {
    ...uiColors.accent,
    primary: uiColors.accent.orange,
    secondary: uiColors.accent.blue
  },
  ui: {
    ...uiColors.ui,
    selected: '#353535',
    disabled: '#6b7280'
  },
  text: {
    ...uiColors.text,
    disabled: '#6b7280'
  }
};

export interface TemperatureControlsProps {
  settings: TemperatureSettings;
  onChange: (settings: TemperatureSettings) => void;
}

/**
 * Temperature Settings Controls Component
 * Manages randomness/creativity level for execution
 */
export const TemperatureControls: React.FC<TemperatureControlsProps> = ({
  settings,
  onChange
}) => {

  // Handle enable/disable
  const handleEnabledChange = useCallback((enabled: boolean) => {
    onChange({
      ...settings,
      enabled
    });
  }, [settings, onChange]);

  // Handle temperature value change
  const handleValueChange = useCallback((value: number) => {
    onChange({
      ...settings,
      value: Math.max(0.1, Math.min(2.0, value))
    });
  }, [settings, onChange]);

  // Handle preset selection
  const handlePresetSelect = useCallback((presetValue: number) => {
    onChange({
      ...settings,
      value: presetValue,
      enabled: true
    });
  }, [settings, onChange]);

  // Handle indicator toggle
  const handleShowIndicatorChange = useCallback((showIndicator: boolean) => {
    onChange({
      ...settings,
      showIndicator
    });
  }, [settings, onChange]);

  // Get temperature description
  const getTemperatureDescription = (temp: number): string => {
    if (temp < 0.5) return 'Very Conservative - Highly predictable results';
    if (temp < 0.8) return 'Conservative - More predictable results';
    if (temp < 1.2) return 'Balanced - Standard randomness level';
    if (temp < 1.5) return 'Creative - More varied results';
    return 'Very Creative - Highly varied results';
  };

  // Get temperature color
  const getTemperatureColor = (temp: number): string => {
    if (temp < 0.5) return '#3b82f6'; // Blue
    if (temp < 0.8) return '#10b981'; // Green
    if (temp < 1.2) return '#f59e0b'; // Yellow
    if (temp < 1.5) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  return (
    <div style={{ marginBottom: '24px' }}>
      {/* Section Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '16px'
      }}>
        <FiThermometer size={18} color={uiColors.accent.primary} />
        <h3 style={{
          margin: 0,
          fontSize: '16px',
          fontWeight: 600,
          color: uiColors.text.primary
        }}>
          Temperature Settings
        </h3>
      </div>

      {/* Enable Temperature Control */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '16px',
        padding: '12px',
        backgroundColor: uiColors.ui.hover,
        borderRadius: '8px',
        border: `1px solid ${uiColors.ui.border}`
      }}>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 500
        }}>
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) => handleEnabledChange(e.target.checked)}
            style={{ accentColor: uiColors.accent.primary }}
          />
          <span style={{ color: uiColors.text.primary }}>
            Enable Temperature Control
          </span>
        </label>
        
        <div style={{
          fontSize: '12px',
          color: uiColors.text.secondary,
          marginLeft: 'auto'
        }}>
          {settings.enabled ? (
            <span style={{ color: getTemperatureColor(settings.value) }}>
              <FiEye size={12} style={{ marginRight: '4px' }} />
              {settings.value.toFixed(1)}
            </span>
          ) : (
            <span>
              <FiEyeOff size={12} style={{ marginRight: '4px' }} />
              Default
            </span>
          )}
        </div>
      </div>

      {/* Temperature Configuration (when enabled) */}
      {settings.enabled && (
        <div style={{ marginLeft: '20px' }}>
          {/* Temperature Slider */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 500,
              color: uiColors.text.primary,
              marginBottom: '6px'
            }}>
              Temperature Value: {settings.value.toFixed(2)}
            </label>
            
            <div style={{ position: 'relative' }}>
              <input
                type="range"
                min="0.1"
                max="2.0"
                step="0.1"
                value={settings.value}
                onChange={(e) => handleValueChange(parseFloat(e.target.value))}
                style={{
                  width: '100%',
                  height: '6px',
                  borderRadius: '3px',
                  background: `linear-gradient(to right, 
                    #3b82f6 0%, 
                    #10b981 25%, 
                    #f59e0b 50%, 
                    #f97316 75%, 
                    #ef4444 100%)`,
                  outline: 'none',
                  cursor: 'pointer',
                  accentColor: getTemperatureColor(settings.value)
                }}
              />
              
              {/* Temperature scale markers */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '4px',
                fontSize: '10px',
                color: uiColors.text.secondary
              }}>
                <span>0.1</span>
                <span>0.5</span>
                <span>1.0</span>
                <span>1.5</span>
                <span>2.0</span>
              </div>
            </div>
            
            <div style={{
              fontSize: '11px',
              color: getTemperatureColor(settings.value),
              marginTop: '6px',
              fontWeight: 500
            }}>
              {getTemperatureDescription(settings.value)}
            </div>
          </div>

          {/* Temperature Presets */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 500,
              color: uiColors.text.primary,
              marginBottom: '8px'
            }}>
              Quick Presets
            </label>
            
            <div style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap'
            }}>
              {settings.presets.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => handlePresetSelect(preset.value)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '8px 12px',
                    backgroundColor: Math.abs(settings.value - preset.value) < 0.01
                      ? getTemperatureColor(preset.value) + '20'
                      : uiColors.ui.hover,
                    border: Math.abs(settings.value - preset.value) < 0.01
                      ? `1px solid ${getTemperatureColor(preset.value)}`
                      : `1px solid ${uiColors.ui.border}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    minWidth: '80px'
                  }}
                  title={preset.description}
                  onMouseEnter={(e) => {
                    if (Math.abs(settings.value - preset.value) >= 0.01) {
                      e.currentTarget.style.backgroundColor = uiColors.ui.selected;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (Math.abs(settings.value - preset.value) >= 0.01) {
                      e.currentTarget.style.backgroundColor = uiColors.ui.hover;
                    }
                  }}
                >
                  <div style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: Math.abs(settings.value - preset.value) < 0.01
                      ? getTemperatureColor(preset.value)
                      : uiColors.text.primary,
                    marginBottom: '2px'
                  }}>
                    {preset.name}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: Math.abs(settings.value - preset.value) < 0.01
                      ? getTemperatureColor(preset.value)
                      : uiColors.text.secondary
                  }}>
                    {preset.value.toFixed(1)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Show Indicator Option */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontSize: '13px'
            }}>
              <input
                type="checkbox"
                checked={settings.showIndicator}
                onChange={(e) => handleShowIndicatorChange(e.target.checked)}
                style={{ accentColor: uiColors.accent.primary }}
              />
              <span style={{ color: uiColors.text.primary }}>
                Show temperature indicator in preview
              </span>
            </label>
            <div style={{
              fontSize: '11px',
              color: uiColors.text.secondary,
              marginTop: '2px',
              marginLeft: '24px'
            }}>
              Displays temperature level in preview results
            </div>
          </div>
        </div>
      )}
    </div>
  );
};