// packages/core/components/Settings/SeedControls.tsx
// Seed settings controls for Epic 7.3 Advanced Settings Modal
import React, { useState, useCallback } from 'react';
import { SeedSettings } from '../../settings/types';
import { FiHash, FiRefreshCw, FiClock, FiEye, FiEyeOff } from 'react-icons/fi';
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


export interface SeedControlsProps {
  settings: SeedSettings;
  onChange: (settings: SeedSettings) => void;
  /**
  * Seed Settings Controls Component
  * Manages seed configuration for deterministic execution
  */


export const SeedControls: React.FC<SeedControlsProps> = ({ )
  settings }
  onChange
}) => { const [tempSeedValue, setTempSeedValue] = useState<string>()
  settings.value?.toString() || ''
  );
  // Handle seed enable/disable
  const handleEnabledChange = useCallback((enabled: boolean) => {
  onChange({)
  ...settings
  enabled
  value: enabled && !settings.value ? Math.floor(Math.random() * Number.MAX_SAFE_INTEGER) : settings.value }
});
  }, [settings, onChange]);
  // Handle seed value change
  const handleSeedChange = useCallback((value: string) => { setTempSeedValue(value);
  const numValue = parseInt(value, 10);
  if (!isNaN(numValue) && numValue >= 0) {
  onChange({)
  ...settings
  value: numValue }
});
  }, [settings, onChange]);
  // Generate new random seed
  const handleGenerateNew = useCallback(() => { const newSeed = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
  setTempSeedValue(newSeed.toString());
  onChange({)
  ...settings
  value: newSeed
  enabled: true }
});
  }, [settings, onChange]);
  // Use seed from history
  const handleUseHistorySeed = useCallback((seed: number) => { setTempSeedValue(seed.toString());
  onChange({)
  ...settings
  value: seed
  enabled: true }
});
  }, [settings, onChange]);
  // Clear seed history
  const handleClearHistory = useCallback(() => { onChange({)
  ...settings
  history: [] }
});
  }, [settings, onChange]);
  // Handle auto-generate toggle
  const handleAutoGenerateChange = useCallback((autoGenerate: boolean) => { onChange({)
  ...settings }
      autoGenerate
    });
  }, [settings, onChange]);
  return;
    <div style={{ marginBottom: '24px' }}>
      {/* Section Header */}
      <div style={ {
  display: 'flex'
  alignItems: 'center'
  gap: '8px'
  marginBottom: '16px' }
}>
        <FiHash size={18} color={uiColors.accent.primary} />
        <h3 style={ {
  margin: 0
  fontSize: '16px'
  fontWeight: 600
  color: uiColors.text.primary }
}>
          Seed Settings
        </h3>
      </div>
      {/* Enable Seed Control */}
      <div style={ {
        display: 'flex'
        alignItems: 'center'
        gap: '12px'
        marginBottom: '16px'
        padding: '12px'
        backgroundColor: uiColors.ui.hover
        borderRadius: '8px' }
        border: `1px solid ${uiColors.ui.border}`}
}>
        <label style={ {
  display: 'flex'
  alignItems: 'center'
  gap: '8px'
  cursor: 'pointer'
  fontSize: '14px'
  fontWeight: 500 }
}>
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) => handleEnabledChange(e.target.checked)}
            style={{ accentColor: uiColors.accent.primary }}
          />
          <span style={{ color: uiColors.text.primary }}>
            Enable Deterministic Seed
          </span>
        </label>
        <div style={ {
  fontSize: '12px'
  color: uiColors.text.secondary
  marginLeft: 'auto' }
}>
          {settings.enabled ? ()
            <span style={{ color: uiColors.accent.primary }}>
              <FiEye size={12} style={{ marginRight: '4px' }} />
              Deterministic
            </span>
          ) : ()
            <span>
              <FiEyeOff size={12} style={{ marginRight: '4px' }} />
              Random
            </span>
          )}
        </div>
      </div>
      {/* Seed Configuration (when enabled) */}
      {settings.enabled && ()
        <div style={{ marginLeft: '20px' }}>
          {/* Seed Value Input */}
          <div style={{ marginBottom: '16px' }}>
            <label style={ {
  display: 'block'
  fontSize: '13px'
  fontWeight: 500
  color: uiColors.text.primary
  marginBottom: '6px' }
}>
              Seed Value
            </label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="number"
                value={tempSeedValue}
                onChange={(e) => handleSeedChange(e.target.value)}
                placeholder="Enter seed number"
                min="0"
                style={ {
                  flex: 1
                  padding: '8px 12px' }
                  border: `1px solid ${uiColors.ui.border}`}

  borderRadius: '6px'
                  backgroundColor: uiColors.background.primary
                  color: uiColors.text.primary
                  fontSize: '14px'
                  outline: 'none';

                onFocus={ (e) => {
                  e.target.style.borderColor = uiColors.accent.primary }}
                onBlur={ (e) => {
                  e.target.style.borderColor = uiColors.ui.border }}
              />
              <button
                onClick={handleGenerateNew}
                title="Generate new random seed"
                style={ {
  display: 'flex'
  alignItems: 'center'
  gap: '6px'
  padding: '8px 12px'
  backgroundColor: uiColors.accent.primary
  border: 'none'
  borderRadius: '6px'
  color: 'white'
  fontSize: '13px'
  fontWeight: 500
  cursor: 'pointer'
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }

                onMouseEnter={ (e) => {
                  e.currentTarget.style.backgroundColor = uiColors.accent.secondary }}
                onMouseLeave={ (e) => {
                  e.currentTarget.style.backgroundColor = uiColors.accent.primary }}
              >
                <FiRefreshCw size={14} />
                Generate
              </button>
            </div>
            <div style={ {
  fontSize: '11px'
  color: uiColors.text.secondary
  marginTop: '4px' }
}>
              Same seed produces identical results across runs
            </div>
          </div>
          {/* Auto-Generate Option */}
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
                checked={settings.autoGenerate}
                onChange={(e) => handleAutoGenerateChange(e.target.checked)}
                style={{ accentColor: uiColors.accent.primary }}
              />
              <span style={{ color: uiColors.text.primary }}>
                Auto-generate new seed for each execution
              </span>
            </label>
          </div>
          {/* Seed History */}
          { settings.history && settings.history.length > 0 && ()
            <div>
              <div style={{
  display: 'flex'
  alignItems: 'center'
  justifyContent: 'space-between'
  marginBottom: '8px' }
}>
                <label style={ {
  fontSize: '13px'
  fontWeight: 500
  color: uiColors.text.primary }
}>
                  <FiClock size={12} style={{ marginRight: '6px' }} />
                  Recent Seeds
                </label>
                <button
                  onClick={handleClearHistory}
                  style={ {
                    padding: '4px 8px'
                    backgroundColor: 'transparent' }
                    border: `1px solid ${uiColors.ui.border}`}

  borderRadius: '4px'
                    color: uiColors.text.secondary
                    fontSize: '11px'
                    cursor: 'pointer'
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'

                  title="Clear seed history"
                >
                  Clear
                </button>
              </div>
              <div style={ {
  display: 'flex'
  flexWrap: 'wrap'
  gap: '6px' }
}>
                {settings.history.slice(0, 5).map((historySeed, index) => ()
                  <button
                    key={index}
                    onClick={() => handleUseHistorySeed(historySeed)}
                    style={ {
                      padding: '4px 8px'
                      backgroundColor: settings.value === historySeed 
                        ? uiColors.accent.primary + '20'
                        : uiColors.ui.hover
                      border: settings.value === historySeed }
                        ? `1px solid ${uiColors.accent.primary}`}
                        : `1px solid ${uiColors.ui.border}`}

  borderRadius: '4px'
                      color: settings.value === historySeed
                        ? uiColors.accent.primary
                        : uiColors.text.secondary
                      fontSize: '11px'
                      cursor: 'pointer'
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'

                    title={`Use seed: ${historySeed}`}
                  >
                    {historySeed.toString().slice(0, 8)}...
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};