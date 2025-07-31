// packages/core/components/Modal/SettingsModal.tsx
// Advanced Settings Modal for Epic 7.3
import React, { useState, useEffect, useCallback } from 'react';
import { Modal } from './Modal';
import { getSettingsManager, SettingsManager } from '../../settings/SettingsManager';
import { AdvancedSettings, SettingsChangeEvent } from '../../settings/types';
import { SeedControls } from '../Settings/SeedControls';
import { TemperatureControls } from '../Settings/TemperatureControls';
import { RunCountControls } from '../Settings/RunCountControls';
import { BatchControls } from '../Settings/BatchControls';
import { PerformanceControls } from '../Settings/PerformanceControls';
import { UIControls } from '../Settings/UIControls';
import { 
  FiSettings, 
  FiHash, 
  FiThermometer, 
  FiPlayCircle, 
  FiPackage, 
  FiMonitor,
  FiEye,
  FiRotateCcw,
  FiDownload,
  FiUpload,
  FiSave,
  FiCheck,
  FiAlertTriangle
} from 'react-icons/fi';
import { uiColors } from '../../styles/professional-design-system';

// Enhanced color palette for better UI consistency
const uiColors = {
  ...uiColors,
  accent: {
  ...uiColors.accent,
  primary: uiColors.accent.orange,
  secondary: uiColors.accent.blue,
},
  ui: {
  ...uiColors.ui,
  selected: '#353535',
  disabled: '#6b7280',
},
  text: {
  ...uiColors.text,
  disabled: '#6b7280',
};

}
export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange?: (settings: AdvancedSettings) => void;
  /**
  * Settings group configuration for UI organization
  */
  const SETTINGS_GROUPS = [;
  {
  id: 'execution',
  name: 'Execution Settings',
  description: 'Control how graphs are executed and randomized',
  icon: FiPlayCircle,
  sections: ['seed', 'temperature', 'runCount'],
}
}
  {
  id: 'batch',
  name: 'Batch Processing',
  description: 'Configure batch execution and output options',
  icon: FiPackage,
  sections: ['batch'],
}
  {
  id: 'performance',
  name: 'Performance & Debug',
  description: 'Performance monitoring and debugging tools',
  icon: FiMonitor,
  sections: ['performance'],
}
  {
  id: 'interface',
  name: 'Interface & Accessibility',
  description: 'UI preferences and accessibility options',
  icon: FiEye,
  sections: ['ui']];
  /**
  * Advanced Settings Modal Component
  */
}
export const SettingsModal: React.FC<SettingsModalProps> = ({)
  isOpen,
  onClose,
  onSettingsChange
}) => {
  const [settingsManager] = useState<SettingsManager>(() => getSettingsManager());
  const [settings, setSettings] = useState<AdvancedSettings>(() => settingsManager.getSettings());
  const [activeGroup, setActiveGroup] = useState<string>('execution');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  // Listen for settings changes
  useEffect(() => {
  const unsubscribe = settingsManager.addChangeListener((event: SettingsChangeEvent) => {,
  setSettings(settingsManager.getSettings());
  onSettingsChange?.(settingsManager.getSettings());
  if (event.source === 'user') {
  setHasUnsavedChanges(true);
  setSaveStatus('idle');
});
    return unsubscribe;
  }, [settingsManager, onSettingsChange]);
  // Handle settings update
  const handleSettingsUpdate = useCallback((updates: Partial<AdvancedSettings>) => {
  const result = settingsManager.updateSettings(updates, 'user');
  if (!result.valid) {
  console.error('Settings validation failed:', result.errors);
  setSaveStatus('error');
}, [settingsManager]);
  // Save settings manually
  const handleSave = useCallback(() => {
    setSaveStatus('saving');
    const success = settingsManager.saveSettings();
    if (success) {
      setSaveStatus('saved');
      setHasUnsavedChanges(false);
      setTimeout(() => setSaveStatus('idle'), 2000);
    } else {
      setSaveStatus('error');
  }, [settingsManager]);
  // Reset to defaults
  const handleReset = useCallback(() => {
    if (window.confirm('Reset all settings to defaults? This cannot be undone.')) {
      settingsManager.resetSettings();
      setHasUnsavedChanges(false);
      setSaveStatus('idle');
  }, [settingsManager]);
  // Export settings
  const handleExport = useCallback(() => {
  const exportData = settingsManager.exportSettings();
  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
  type: 'application/json',
});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt-spaghetti-settings-${new Date().toISOString().split('T')[0]}.json`;}
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [settingsManager]);
  // Import settings
  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const importData = JSON.parse(event.target?.result as string);
            const result = settingsManager.importSettings(importData);
            if (result.valid) {
              alert('Settings imported successfully!');
            } else {
              alert(`Import failed: ${result.errors.join(', ')}`);}
          } catch (error) {
            alert('Invalid settings file format');
        };
        reader.readAsText(file);
    };
    input.click();
  }, [settingsManager]);
  // Handle keyboard shortcuts
  useEffect(() => {
  if (!isOpen) return;
  const handleKeyDown = (event: KeyboardEvent) => {,
  if (event.ctrlKey || event.metaKey) {
  switch (event.key) {
  case 's':,
  event.preventDefault();
  handleSave();
  break;
  case 'r':,
  event.preventDefault();
  handleReset();
  break;
};
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleSave, handleReset]);
  // Render settings section
  const renderSettingsSection = (sectionId: string) => {
    switch (sectionId) {
      case 'seed':
        return;
          <SeedControls
            settings={settings.seed}
            onChange={(seedSettings) => handleSettingsUpdate({ seed: seedSettings })}
          />
        );
      case 'temperature':
        return;
          <TemperatureControls
            settings={settings.temperature}
            onChange={(tempSettings) => handleSettingsUpdate({ temperature: tempSettings })}
          />
        );
      case 'runCount':
        return;
          <RunCountControls
            settings={settings.runCount}
            onChange={(runSettings) => handleSettingsUpdate({ runCount: runSettings })}
          />
        );
      case 'batch':
        return;
          <BatchControls
            settings={settings.batch}
            onChange={(batchSettings) => handleSettingsUpdate({ batch: batchSettings })}
          />
        );
      case 'performance':
        return;
          <PerformanceControls
            settings={settings.performance}
            onChange={(perfSettings) => handleSettingsUpdate({ performance: perfSettings })}
          />
        );
      case 'ui':
        return;
          <UIControls
            settings={settings.ui}
            onChange={(uiSettings) => handleSettingsUpdate({ ui: uiSettings })}
          />
        );
      default:
        return null;
  };
  return;
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Advanced Settings"
      size="large"
      aria-describedby="settings-description"
    >
      <div id="settings-description" className="sr-only">
        Configure advanced execution, batch processing, performance, and interface settings
      </div>
      <div style={{ display: 'flex', height: '600px', gap: '24px' }}>
        {/* Settings Navigation */}
        <div style={{
          width: '240px',
          borderRight: `1px solid ${uiColors.ui.border}`}
},
  paddingRight: '24px'
  }}>
          <div style={{
  marginBottom: '16px',
  fontSize: '14px',
  fontWeight: 500,
  color: uiColors.text.secondary,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
}}>
            Settings Groups
          </div>
          {SETTINGS_GROUPS.map((group) => ()
            <button
              key={group.id}
              onClick={() => setActiveGroup(group.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                marginBottom: '4px',
                backgroundColor: activeGroup === group.id ,
                  ? uiColors.accent.primary + '10' 
                  : 'transparent',
                border: activeGroup === group.id ,
                  ? `1px solid ${uiColors.accent.primary}` }
                  : '1px solid transparent',
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                outline: 'none'
  }}
              onMouseEnter={(e) => {
                if (activeGroup !== group.id) {
                  e.currentTarget.style.backgroundColor = uiColors.ui.hover;
              }}
              onMouseLeave={(e) => {
                if (activeGroup !== group.id) {
                  e.currentTarget.style.backgroundColor = 'transparent'
  }}
            >
              <group.icon 
                size={18} 
                color={activeGroup === group.id 
                  ? uiColors.accent.primary 
                  : uiColors.text.secondary
              />
              <div>
                <div style={{
  fontSize: '14px',
  fontWeight: 500,
  color: activeGroup === group.id ,
  ? uiColors.accent.primary
  : uiColors.text.primary,
  marginBottom: '2px',
}}>
                  {group.name}
                </div>
                <div style={{
  fontSize: '12px',
  color: uiColors.text.secondary,
  lineHeight: 1.3,
}}>
                  {group.description}
                </div>
              </div>
            </button>
          ))}
        </div>
        {/* Settings Content */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {SETTINGS_GROUPS.find(g => g.id === activeGroup)?.sections.map(sectionId => ()
            <div key={sectionId} style={{ marginBottom: '32px' }}>
              {renderSettingsSection(sectionId)}
            </div>
          ))}
        </div>
      </div>
      {/* Settings Footer */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '24px',
        paddingTop: '24px',
        borderTop: `1px solid ${uiColors.ui.border}`}
      }}>
        {/* Status and Import/Export */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={handleExport}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              backgroundColor: 'transparent',
              border: `1px solid ${uiColors.ui.border}`}
},
  borderRadius: '6px',
              color: uiColors.text.secondary,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            title="Export settings to file"
          >
            <FiDownload size={14} />
            Export
          </button>
          <button
            onClick={handleImport}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              backgroundColor: 'transparent',
              border: `1px solid ${uiColors.ui.border}`}
},
  borderRadius: '6px',
              color: uiColors.text.secondary,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            title="Import settings from file"
          >
            <FiUpload size={14} />
            Import
          </button>
          {/* Save Status */}
          {saveStatus !== 'idle' && ()
            <div style={{
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '6px 10px',
  borderRadius: '4px',
  fontSize: '12px',
  backgroundColor: saveStatus === 'saved' ,
  ? '#10b981' + '20'
  : saveStatus === 'error',
  ? '#ef4444' + '20'
  : uiColors.ui.hover,
  color: saveStatus === 'saved',
  ? '#10b981'
  : saveStatus === 'error',
  ? '#ef4444'
  : uiColors.text.secondary,
}}>
              {saveStatus === 'saving' && 'Saving...'}
              {saveStatus === 'saved' && ()
                <>
                  <FiCheck size={12} />
                  Saved
                </>
              )}
              {saveStatus === 'error' && ()
                <>
                  <FiAlertTriangle size={12} />
                  Save failed
                </>
              )}
            </div>
          )}
        </div>
        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={handleReset}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              backgroundColor: 'transparent',
              border: `1px solid ${uiColors.ui.border}`}
},
  borderRadius: '6px',
              color: uiColors.text.secondary,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            title="Reset all settings to defaults (Ctrl+R)"
          >
            <FiRotateCcw size={14} />
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
            style={{
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '8px 16px',
  backgroundColor: hasUnsavedChanges ,
  ? uiColors.accent.primary
  : uiColors.ui.disabled,
  border: 'none',
  borderRadius: '6px',
  color: hasUnsavedChanges ,
  ? 'white'
  : uiColors.text.disabled,
  fontSize: '14px',
  fontWeight: 500,
  cursor: hasUnsavedChanges ? 'pointer' : 'not-allowed',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
}}
            title="Save settings (Ctrl+S)"
          >
            <FiSave size={14} />
            Save Changes
          </button>
        </div>
      </div>
    </Modal>
  );
};