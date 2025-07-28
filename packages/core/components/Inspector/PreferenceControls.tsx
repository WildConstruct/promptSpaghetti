import React from 'react';
import { useUISettingsStore } from '../../stores/uiSettingsStore';
import { SelectOption } from './SelectEditor';

export interface PreferenceControlsProps {
  nodeId?: string;
  nodeType?: string;
  showNodeSpecificControls?: boolean;
  compact?: boolean;

const DISCLOSURE_LEVELS: SelectOption = [
  { value: 'basic', label: 'Basic - Essential fields only' },
  { value: 'advanced', label: 'Advanced - Power user options' },
  { value: 'debug', label: 'Expert - Technical details' }
];
const INHERITANCE_MODES: SelectOption = [
  { value: 'global', label: 'Global - Use same preference for all elements' },
  { value: 'nodeType', label: 'Element Type - Different preferences per element type' },
  { value: 'individual', label: 'Individual - Custom preference per element' }
];
const PreferenceControls: React.FC<PreferenceControlsProps> = ()
  { nodeId,
  nodeType,
  showNodeSpecificControls = true,
  compact = false }
) => {
  const {
    globalDisclosureLevel,
    preferenceInheritance,
    setGlobalDisclosureLevel,
    setNodeDisclosureLevel,
    setNodeUseGlobalDefault,
    setPreferenceInheritance,
    getNodeDisclosureLevel,
    getEffectiveNodePreferences,
    clearNodePreferences
  } = useUISettingsStore();
  const effectiveLevel = nodeId ? getNodeDisclosureLevel(nodeId, nodeType) : globalDisclosureLevel;
  const nodePrefs = nodeId ? getEffectiveNodePreferences(nodeId, nodeType) : null;
  const handleGlobalLevelChange = (level: string) => {
    setGlobalDisclosureLevel(level as 'basic' | 'advanced' | 'debug');
  };
  const handleNodeLevelChange = (level: string) => {
    if (nodeId) {
      setNodeDisclosureLevel(nodeId, level as 'basic' | 'advanced' | 'debug');

  };
  const handleUseGlobalToggle = (useGlobal: boolean) => {
    if (nodeId) {
      setNodeUseGlobalDefault(nodeId, useGlobal);

  };
  const handleInheritanceChange = (inheritance: string) => {
    setPreferenceInheritance(inheritance as 'global' | 'nodeType' | 'individual');
  };
  const resetAllPreferences = () => {
    clearNodePreferences();
  };
  if (compact) {
  return;
  <div style={{
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '4px 8px',
  background: 'rgba(66, 153, 225, 0.1)',
  border: '1px solid #4a5568',
  borderRadius: 4,
  fontSize: 11,
}}>
        <span style={{ color: '#a0aec0', minWidth: 'fit-content' }}>Level:</span>
        <select
          value={effectiveLevel}
          onChange={(e) => showNodeSpecificControls && nodeId ? 
            handleNodeLevelChange(e.target.value) : 
            handleGlobalLevelChange(e.target.value)

          style={{
  background: '#2d3748',
  color: '#e2e8f0',
  border: '1px solid #4a5568',
  borderRadius: 2,
  padding: '2px 4px',
  fontSize: 10,
  cursor: 'pointer',
}}
        >
          {DISCLOSURE_LEVELS.map(option => ()
            <option key={option.value} value={option.value}>
              {option.label.split(' - ')[0]}
            </option>
          ))}
        </select>
      </div>
    );

  return;
    <div style={{ marginBottom: 16 }}>
      <div style={{
  background: '#1a202c',
  border: '1px solid #4a5568',
  borderRadius: 6,
  padding: 12,
}}>
        <div style={{
  fontSize: 12,
  fontWeight: 500,
  color: '#e2e8f0',
  marginBottom: 12,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
}}>
          <span>📋</span>
          Disclosure Preferences
        </div>
        {/* Global Settings */}
        <div style={{ marginBottom: 16 }}>
          <label style={{
  display: 'block',
  fontSize: 11,
  color: '#a0aec0',
  marginBottom: 4,
  fontWeight: 500,
}}>
            Global Default Level
          </label>
          <select
            value={globalDisclosureLevel}
            onChange={(e) => handleGlobalLevelChange(e.target.value)}
            style={{
  width: '100%',
  padding: '6px 8px',
  background: '#2d3748',
  color: '#e2e8f0',
  border: '1px solid #4a5568',
  borderRadius: 4,
  fontSize: 11,
  cursor: 'pointer',
}}
          >
            {DISCLOSURE_LEVELS.map(option => ()
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        {/* Inheritance Mode */}
        <div style={{ marginBottom: 16 }}>
          <label style={{
  display: 'block',
  fontSize: 11,
  color: '#a0aec0',
  marginBottom: 4,
  fontWeight: 500,
}}>
            Preference Inheritance
          </label>
          <select
            value={preferenceInheritance}
            onChange={(e) => handleInheritanceChange(e.target.value)}
            style={{
  width: '100%',
  padding: '6px 8px',
  background: '#2d3748',
  color: '#e2e8f0',
  border: '1px solid #4a5568',
  borderRadius: 4,
  fontSize: 11,
  cursor: 'pointer',
}}
          >
            {INHERITANCE_MODES.map(option => ()
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div style={{
  fontSize: 10,
  color: '#6b7280',
  marginTop: 2,
  lineHeight: 1.4,
}}>
            {preferenceInheritance === 'global' && 'All nodes use the global default level'}
            {preferenceInheritance === 'nodeType' && 'Nodes inherit from their type-specific preferences'}
            {preferenceInheritance === 'individual' && 'Each node can have its own disclosure level'}
          </div>
        </div>
        {/* Node-Specific Controls */}
        {showNodeSpecificControls && nodeId && ()
          <div style={{
  borderTop: '1px solid #4a5568',
  paddingTop: 12,
  marginTop: 12,
}}>
            <div style={{
  fontSize: 11,
  fontWeight: 500,
  color: '#e2e8f0',
  marginBottom: 8,
}}>
              This Node ({nodeType || 'unknown'})
            </div>
            {nodePrefs && ()
              <div style={{
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  marginBottom: 8,
}}>
                <label style={{
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  fontSize: 10,
  color: '#a0aec0',
  cursor: 'pointer',
}}>
                  <input
                    type="checkbox"
                    checked={nodePrefs.useGlobalDefault}
                    onChange={(e) => handleUseGlobalToggle(e.target.checked)}
                    style={{
  width: 12,
  height: 12,
  cursor: 'pointer',
}}
                  />
                  Use global default
                </label>
              </div>
            )}
            {!nodePrefs?.useGlobalDefault && ()
              <div style={{ marginBottom: 8 }}>
                <label style={{
  display: 'block',
  fontSize: 10,
  color: '#a0aec0',
  marginBottom: 4,
}}>
                  Node-specific level
                </label>
                <select
                  value={effectiveLevel}
                  onChange={(e) => handleNodeLevelChange(e.target.value)}
                  style={{
  width: '100%',
  padding: '4px 6px',
  background: '#2d3748',
  color: '#e2e8f0',
  border: '1px solid #4a5568',
  borderRadius: 3,
  fontSize: 10,
  cursor: 'pointer',
}}
                >
                  {DISCLOSURE_LEVELS.map(option => ()
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
        {/* Reset Button */}
        <div style={{
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: 12,
  paddingTop: 8,
  borderTop: '1px solid #4a5568',
}}>
          <div style={{ fontSize: 10, color: '#6b7280' }}>
            {Object.keys(nodePreferences).length} custom node preferences
          </div>
          <button
            onClick={resetAllPreferences}
            disabled={Object.keys(nodePreferences).length === 0}
            style={{
  padding: '4px 8px',
  fontSize: 9,
  background: Object.keys(nodePreferences).length > 0 ? '#e53e3e' : '#4a5568',
  color: 'white',
  border: 'none',
  borderRadius: 3,
  cursor: Object.keys(nodePreferences).length > 0 ? 'pointer' : 'not-allowed',
  opacity: Object.keys(nodePreferences).length > 0 ? 1 : 0.5,
}}
          >
            Reset All
          </button>
        </div>
      </div>
    </div>
  );
};
}
export default PreferenceControls;