import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// packages/core/components/Modal/SettingsModal.tsx
// Advanced Settings Modal for Epic 7.3
import { useState, useEffect, useCallback } from 'react';
import { Modal } from './Modal';
import { getSettingsManager } from '../../settings/SettingsManager';
import { SeedControls } from '../Settings/SeedControls';
import { TemperatureControls } from '../Settings/TemperatureControls';
import { RunCountControls } from '../Settings/RunCountControls';
import { BatchControls } from '../Settings/BatchControls';
import { PerformanceControls } from '../Settings/PerformanceControls';
import { UIControls } from '../Settings/UIControls';
import { FiPlayCircle, FiPackage, FiMonitor, FiEye, FiRotateCcw, FiDownload, FiUpload, FiSave, FiCheck, FiAlertTriangle } from 'react-icons/fi';
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
/**
 * Settings group configuration for UI organization
 */
const SETTINGS_GROUPS = [
    {
        id: 'execution',
        name: 'Execution Settings',
        description: 'Control how graphs are executed and randomized',
        icon: FiPlayCircle,
        sections: ['seed', 'temperature', 'runCount']
    },
    {
        id: 'batch',
        name: 'Batch Processing',
        description: 'Configure batch execution and output options',
        icon: FiPackage,
        sections: ['batch']
    },
    {
        id: 'performance',
        name: 'Performance & Debug',
        description: 'Performance monitoring and debugging tools',
        icon: FiMonitor,
        sections: ['performance']
    },
    {
        id: 'interface',
        name: 'Interface & Accessibility',
        description: 'UI preferences and accessibility options',
        icon: FiEye,
        sections: ['ui']
    }
];
/**
 * Advanced Settings Modal Component
 */
export const SettingsModal = ({ isOpen, onClose, onSettingsChange }) => {
    const [settingsManager] = useState(() => getSettingsManager());
    const [settings, setSettings] = useState(() => settingsManager.getSettings());
    const [activeGroup, setActiveGroup] = useState('execution');
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [saveStatus, setSaveStatus] = useState('idle');
    // Listen for settings changes
    useEffect(() => {
        const unsubscribe = settingsManager.addChangeListener((event) => {
            setSettings(settingsManager.getSettings());
            onSettingsChange?.(settingsManager.getSettings());
            if (event.source === 'user') {
                setHasUnsavedChanges(true);
                setSaveStatus('idle');
            }
        });
        return unsubscribe;
    }, [settingsManager, onSettingsChange]);
    // Handle settings update
    const handleSettingsUpdate = useCallback((updates) => {
        const result = settingsManager.updateSettings(updates, 'user');
        if (!result.valid) {
            console.error('Settings validation failed:', result.errors);
            setSaveStatus('error');
        }
    }, [settingsManager]);
    // Save settings manually
    const handleSave = useCallback(() => {
        setSaveStatus('saving');
        const success = settingsManager.saveSettings();
        if (success) {
            setSaveStatus('saved');
            setHasUnsavedChanges(false);
            setTimeout(() => setSaveStatus('idle'), 2000);
        }
        else {
            setSaveStatus('error');
        }
    }, [settingsManager]);
    // Reset to defaults
    const handleReset = useCallback(() => {
        if (window.confirm('Reset all settings to defaults? This cannot be undone.')) {
            settingsManager.resetSettings();
            setHasUnsavedChanges(false);
            setSaveStatus('idle');
        }
    }, [settingsManager]);
    // Export settings
    const handleExport = useCallback(() => {
        const exportData = settingsManager.exportSettings();
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `prompt-spaghetti-settings-${new Date().toISOString().split('T')[0]}.json`;
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
            const file = e.target.files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const importData = JSON.parse(event.target?.result);
                        const result = settingsManager.importSettings(importData);
                        if (result.valid) {
                            alert('Settings imported successfully!');
                        }
                        else {
                            alert(`Import failed: ${result.errors.join(', ')}`);
                        }
                    }
                    catch (error) {
                        alert('Invalid settings file format');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }, [settingsManager]);
    // Handle keyboard shortcuts
    useEffect(() => {
        if (!isOpen)
            return;
        const handleKeyDown = (event) => {
            if (event.ctrlKey || event.metaKey) {
                switch (event.key) {
                    case 's':
                        event.preventDefault();
                        handleSave();
                        break;
                    case 'r':
                        event.preventDefault();
                        handleReset();
                        break;
                }
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, handleSave, handleReset]);
    // Render settings section
    const renderSettingsSection = (sectionId) => {
        switch (sectionId) {
            case 'seed':
                return (_jsx(SeedControls, { settings: settings.seed, onChange: (seedSettings) => handleSettingsUpdate({ seed: seedSettings }) }));
            case 'temperature':
                return (_jsx(TemperatureControls, { settings: settings.temperature, onChange: (tempSettings) => handleSettingsUpdate({ temperature: tempSettings }) }));
            case 'runCount':
                return (_jsx(RunCountControls, { settings: settings.runCount, onChange: (runSettings) => handleSettingsUpdate({ runCount: runSettings }) }));
            case 'batch':
                return (_jsx(BatchControls, { settings: settings.batch, onChange: (batchSettings) => handleSettingsUpdate({ batch: batchSettings }) }));
            case 'performance':
                return (_jsx(PerformanceControls, { settings: settings.performance, onChange: (perfSettings) => handleSettingsUpdate({ performance: perfSettings }) }));
            case 'ui':
                return (_jsx(UIControls, { settings: settings.ui, onChange: (uiSettings) => handleSettingsUpdate({ ui: uiSettings }) }));
            default:
                return null;
        }
    };
    return (_jsxs(Modal, { isOpen: isOpen, onClose: onClose, title: "Advanced Settings", size: "large", "aria-describedby": "settings-description", children: [_jsx("div", { id: "settings-description", className: "sr-only", children: "Configure advanced execution, batch processing, performance, and interface settings" }), _jsxs("div", { style: { display: 'flex', height: '600px', gap: '24px' }, children: [_jsxs("div", { style: {
                            width: '240px',
                            borderRight: `1px solid ${uiColors.ui.border}`,
                            paddingRight: '24px'
                        }, children: [_jsx("div", { style: {
                                    marginBottom: '16px',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    color: uiColors.text.secondary,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }, children: "Settings Groups" }), SETTINGS_GROUPS.map((group) => (_jsxs("button", { onClick: () => setActiveGroup(group.id), style: {
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '12px 16px',
                                    marginBottom: '4px',
                                    backgroundColor: activeGroup === group.id
                                        ? uiColors.accent.primary + '10'
                                        : 'transparent',
                                    border: activeGroup === group.id
                                        ? `1px solid ${uiColors.accent.primary}`
                                        : '1px solid transparent',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                    outline: 'none'
                                }, onMouseEnter: (e) => {
                                    if (activeGroup !== group.id) {
                                        e.currentTarget.style.backgroundColor = uiColors.ui.hover;
                                    }
                                }, onMouseLeave: (e) => {
                                    if (activeGroup !== group.id) {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    }
                                }, children: [_jsx(group.icon, { size: 18, color: activeGroup === group.id
                                            ? uiColors.accent.primary
                                            : uiColors.text.secondary }), _jsxs("div", { children: [_jsx("div", { style: {
                                                    fontSize: '14px',
                                                    fontWeight: 500,
                                                    color: activeGroup === group.id
                                                        ? uiColors.accent.primary
                                                        : uiColors.text.primary,
                                                    marginBottom: '2px'
                                                }, children: group.name }), _jsx("div", { style: {
                                                    fontSize: '12px',
                                                    color: uiColors.text.secondary,
                                                    lineHeight: 1.3
                                                }, children: group.description })] })] }, group.id)))] }), _jsx("div", { style: { flex: 1, overflow: 'auto' }, children: SETTINGS_GROUPS.find(g => g.id === activeGroup)?.sections.map(sectionId => (_jsx("div", { style: { marginBottom: '32px' }, children: renderSettingsSection(sectionId) }, sectionId))) })] }), _jsxs("div", { style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '24px',
                    paddingTop: '24px',
                    borderTop: `1px solid ${uiColors.ui.border}`
                }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '12px' }, children: [_jsxs("button", { onClick: handleExport, style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '8px 12px',
                                    backgroundColor: 'transparent',
                                    border: `1px solid ${uiColors.ui.border}`,
                                    borderRadius: '6px',
                                    color: uiColors.text.secondary,
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                                }, title: "Export settings to file", children: [_jsx(FiDownload, { size: 14 }), "Export"] }), _jsxs("button", { onClick: handleImport, style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '8px 12px',
                                    backgroundColor: 'transparent',
                                    border: `1px solid ${uiColors.ui.border}`,
                                    borderRadius: '6px',
                                    color: uiColors.text.secondary,
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                                }, title: "Import settings from file", children: [_jsx(FiUpload, { size: 14 }), "Import"] }), saveStatus !== 'idle' && (_jsxs("div", { style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '6px 10px',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    backgroundColor: saveStatus === 'saved'
                                        ? '#10b981' + '20'
                                        : saveStatus === 'error'
                                            ? '#ef4444' + '20'
                                            : uiColors.ui.hover,
                                    color: saveStatus === 'saved'
                                        ? '#10b981'
                                        : saveStatus === 'error'
                                            ? '#ef4444'
                                            : uiColors.text.secondary
                                }, children: [saveStatus === 'saving' && 'Saving...', saveStatus === 'saved' && (_jsxs(_Fragment, { children: [_jsx(FiCheck, { size: 12 }), "Saved"] })), saveStatus === 'error' && (_jsxs(_Fragment, { children: [_jsx(FiAlertTriangle, { size: 12 }), "Save failed"] }))] }))] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '12px' }, children: [_jsxs("button", { onClick: handleReset, style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '8px 16px',
                                    backgroundColor: 'transparent',
                                    border: `1px solid ${uiColors.ui.border}`,
                                    borderRadius: '6px',
                                    color: uiColors.text.secondary,
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                                }, title: "Reset all settings to defaults (Ctrl+R)", children: [_jsx(FiRotateCcw, { size: 14 }), "Reset"] }), _jsxs("button", { onClick: handleSave, disabled: !hasUnsavedChanges, style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '8px 16px',
                                    backgroundColor: hasUnsavedChanges
                                        ? uiColors.accent.primary
                                        : uiColors.ui.disabled,
                                    border: 'none',
                                    borderRadius: '6px',
                                    color: hasUnsavedChanges
                                        ? 'white'
                                        : uiColors.text.disabled,
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    cursor: hasUnsavedChanges ? 'pointer' : 'not-allowed',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                                }, title: "Save settings (Ctrl+S)", children: [_jsx(FiSave, { size: 14 }), "Save Changes"] })] })] })] }));
};
