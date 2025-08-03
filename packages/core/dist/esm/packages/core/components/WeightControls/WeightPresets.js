import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// packages/core/components/WeightControls/WeightPresets.tsx
// Preset Weight Patterns for Story 8.3 Task 5
// Implements preset patterns: Equal, Linear Decrease, Exponential, Custom
import { useState } from 'react';
compact = false;
{
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [customPresetName, setCustomPresetName] = useState('');
    const [customPresetDescription, setCustomPresetDescription] = useState('');
    const allPresets = [...BUILT_IN_PRESETS, ...customPresets];
    const filteredPresets = selectedCategory === 'all';
    allPresets: allPresets.filter(preset => preset.category === selectedCategory);
    const categories = [
        { id: 'all', name: 'All', icon: '📋' },
        { id: 'basic', name: 'Basic', icon: '🎯' },
        { id: 'creative', name: 'Creative', icon: '🎨' },
        { id: 'advanced', name: 'Advanced', icon: '⚙️' },
        { id: 'custom', name: 'Custom', icon: '💾' }
    ];
    const handleApplyPreset = (preset) => {
        const newWeights = preset.pattern(options);
        onApplyPreset(newWeights);
    };
    const handleSaveCurrentWeights = () => {
        if (!customPresetName.trim())
            return;
        const currentWeights = options.map(opt => opt.weight);
        const newPreset = {
            name: customPresetName.trim(),
            description: customPresetDescription.trim() || 'Custom weight pattern',
            category: 'custom',
            pattern: () => [...currentWeights]
        };
        preview: currentWeights.map(w => `${w}%`).join(' ');
    };
}
;
onSaveCustomPreset?.(newPreset);
setShowSaveDialog(false);
setCustomPresetName('');
setCustomPresetDescription('');
;
const resetToEqual = () => {
    const equalPreset = BUILT_IN_PRESETS.find(p => p.id === 'equal');
    if (equalPreset) {
        handleApplyPreset(equalPreset);
    }
    ;
    if (compact) {
        return;
        _jsx("div", { className: `weight-presets compact ${className}`, style: ({}, ), "display:": true });
        'flex';
        gap: '4px';
        flexWrap: 'wrap';
    }
     >
        { BUILT_IN_PRESETS, : .slice(0, 4).map(preset => ()
                < button, key = { preset, : .id }, onClick = {}()) };
};
handleApplyPreset(preset);
title = { preset, : .description };
style = {};
{
    padding: '4px 8px';
    fontSize: '10px';
    background: '#4a5568';
    border: 'none';
    borderRadius: 3;
    color: '#e2e8f0';
    cursor: 'pointer';
    display: 'flex';
    alignItems: 'center';
    gap: '2px';
}
    >
        { preset, : .icon };
{
    preset.name;
}
button >
;
_jsx("button", { onClick: resetToEqual, title: "Reset to equal weights", style: {
        padding: '4px 8px',
        fontSize: '10px',
        background: '#e53e3e',
        border: 'none',
        borderRadius: 3,
        color: 'white',
        cursor: 'pointer'
    }, children: "Reset" });
div >
;
;
return;
_jsx("div", { className: `weight-presets ${className}`, style: ({}, ), "background:": true });
'#2d3748';
borderRadius: 6;
padding: 16;
color: '#e2e8f0';
 >
    _jsxs("div", { style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16
        }, children: [_jsx("h3", { style: { margin: 0, fontSize: 14, fontWeight: 600 }, children: "Weight Presets" }), _jsxs("div", { style: { display: 'flex', gap: '8px' }, children: [_jsx("button", { onClick: () => setShowSaveDialog(true), style: {
                            padding: '4px 8px',
                            fontSize: '10px',
                            background: '#38b2ac',
                            border: 'none',
                            borderRadius: 3,
                            color: 'white',
                            cursor: 'pointer'
                        }, children: "\uD83D\uDCBE Save Current" }), _jsx("button", { onClick: resetToEqual, style: {
                            padding: '4px 8px',
                            fontSize: '10px',
                            background: '#e53e3e',
                            border: 'none',
                            borderRadius: 3,
                            color: 'white',
                            cursor: 'pointer'
                        }, children: "\uD83D\uDD04 Reset" })] })] });
{ /* Category Filter */ }
{
    showCategories && ()
        < div;
    style = {};
    {
        display: 'flex';
        gap: '4px';
        marginBottom: 12;
        flexWrap: 'wrap';
    }
}
 >
    { categories, : .map(category => ()
            < button, key = { category, : .id }, onClick = {}(), setSelectedCategory(category.id)) };
style = {};
{
    padding: '4px 8px';
    fontSize: '10px';
    background: selectedCategory === category.id ? '#4299e1' : '#4a5568';
    border: 'none';
    borderRadius: 3;
    color: '#e2e8f0';
    cursor: 'pointer';
    display: 'flex';
    alignItems: 'center';
    gap: '4px';
}
    >
        { category, : .icon };
{
    category.name;
}
button >
;
div >
;
{ /* Preset Grid */ }
_jsxs("div", { style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '8px'
    }, children: [filteredPresets.map(preset => ()
            < button, key = { preset, : .id }, onClick = {}()), " => handleApplyPreset(preset)} style=", {
            padding: '8px',
            background: '#4a5568',
            border: '1px solid #718096',
            borderRadius: 4,
            color: '#e2e8f0',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.2s ease'
        }, "onMouseEnter=", (e) => {
            e.currentTarget.style.background = '#718096';
            e.currentTarget.style.borderColor = '#4299e1';
        }, "onMouseLeave=", (e) => {
            e.currentTarget.style.background = '#4a5568';
            e.currentTarget.style.borderColor = '#718096';
        }, ">", _jsxs("div", { style: {
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: 4
            }, children: [_jsx("span", { style: { fontSize: '12px' }, children: preset.icon }), _jsx("span", { style: { fontSize: '11px', fontWeight: 600 }, children: preset.name })] }), _jsx("div", { style: {
                fontSize: '9px',
                color: '#a0aec0',
                marginBottom: 4,
                lineHeight: 1.3
            }, children: preset.description }), preset.preview && ()
            < div, " style=", {
            fontSize: '8px',
            color: '#68d391',
            fontFamily: 'monospace'
        }, ">", preset.preview] });
button >
;
div >
    { /* Save Custom Preset Dialog */};
{
    showSaveDialog && ()
        < div;
    style = {};
    {
        position: 'fixed';
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: 'rgba(0, 0, 0, 0.5)';
        display: 'flex';
        alignItems: 'center';
        justifyContent: 'center';
        zIndex: 1000;
    }
}
 >
    _jsxs("div", { style: {
            background: '#2d3748',
            padding: 20,
            borderRadius: 6,
            border: '1px solid #4a5568',
            minWidth: 300
        }, children: [_jsx("h3", { style: { margin: '0 0 16px 0', fontSize: 14 }, children: "Save Custom Preset" }), _jsxs("div", { style: { marginBottom: 12 }, children: [_jsx("label", { style: {
                            display: 'block',
                            fontSize: 12,
                            marginBottom: 4,
                            color: '#a0aec0'
                        }, children: "Preset Name" }), _jsx("input", { type: "text", value: customPresetName, onChange: (e) => setCustomPresetName(e.target.value), placeholder: "Enter preset name...", style: {
                            width: '100%',
                            padding: '6px 8px',
                            background: '#4a5568',
                            border: '1px solid #718096',
                            borderRadius: 3,
                            color: '#e2e8f0',
                            fontSize: 12
                        }, autoFocus: true })] }), _jsxs("div", { style: { marginBottom: 16 }, children: [_jsx("label", { style: {
                            display: 'block',
                            fontSize: 12,
                            marginBottom: 4,
                            color: '#a0aec0'
                        }, children: "Description (optional)" }), _jsx("input", { type: "text", value: customPresetDescription, onChange: (e) => setCustomPresetDescription(e.target.value), placeholder: "Describe this weight pattern...", style: {
                            width: '100%',
                            padding: '6px 8px',
                            background: '#4a5568',
                            border: '1px solid #718096',
                            borderRadius: 3,
                            color: '#e2e8f0',
                            fontSize: 12
                        } })] }), _jsxs("div", { style: { display: 'flex', gap: '8px', justifyContent: 'flex-end' }, children: [_jsx("button", { onClick: () => setShowSaveDialog(false), style: {
                            padding: '6px 12px',
                            background: '#4a5568',
                            border: 'none',
                            borderRadius: 3,
                            color: '#e2e8f0',
                            cursor: 'pointer',
                            fontSize: 12
                        }, children: "Cancel" }), _jsx("button", { onClick: handleSaveCurrentWeights, disabled: !customPresetName.trim(), style: {
                            padding: '6px 12px',
                            background: customPresetName.trim() ? '#38b2ac' : '#4a5568',
                            border: 'none',
                            borderRadius: 3,
                            color: customPresetName.trim() ? 'white' : '#a0aec0',
                            cursor: customPresetName.trim() ? 'pointer' : 'not-allowed',
                            fontSize: 12
                        }
                            >
                                Save, Preset: true })] })] });
div >
;
div >
;
div >
;
;
;
export default WeightPresets;
