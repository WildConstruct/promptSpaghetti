import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Save As Preset Dialog Component
 * Allows users to save current node configuration as a reusable preset
 */
import { useState, useCallback } from 'react';
import { createPresetFromNode } from './presetUtils';
import './SaveAsPresetDialog.css';
export const SaveAsPresetDialog = ({ isOpen, nodeData, nodeType, onClose, onSave }) => {
    const [presetName, setPresetName] = useState('');
    const [category, setCategory] = useState('custom');
    const [tags, setTags] = useState('');
    const [description, setDescription] = useState('');
    const handleSave = useCallback(() => {
        if (!nodeData || !presetName.trim())
            return;
        // Parse tags from comma-separated string
        const tagArray = tags
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0);
        // Create preset
        const preset = createPresetFromNode(nodeData, nodeType, presetName.trim(), category, tagArray);
        // Add description to metadata
        if (description.trim()) {
            preset.metadata.description = description.trim();
        }
        onSave(preset);
        // Reset form
        setPresetName('');
        setCategory('custom');
        setTags('');
        setDescription('');
        onClose();
    }, [nodeData, nodeType, presetName, category, tags, description, onSave, onClose]);
    const handleCancel = useCallback(() => {
        setPresetName('');
        setCategory('custom');
        setTags('');
        setDescription('');
        onClose();
    }, [onClose]);
    if (!isOpen || !nodeData)
        return null;
    return (_jsx("div", { className: "save-preset-overlay", children: _jsxs("div", { className: "save-preset-dialog", children: [_jsx("h2", { children: "Save as Preset" }), _jsxs("div", { className: "save-preset-form", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "preset-name", children: "Preset Name *" }), _jsx("input", { id: "preset-name", type: "text", value: presetName, onChange: (e) => setPresetName(e.target.value), placeholder: "Enter preset name...", autoFocus: true })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "preset-category", children: "Category" }), _jsxs("select", { id: "preset-category", value: category, onChange: (e) => setCategory(e.target.value), children: [_jsx("option", { value: "custom", children: "Custom" }), _jsx("option", { value: "character-occupations", children: "Character Occupations" }), _jsx("option", { value: "character-states", children: "Character States" }), _jsx("option", { value: "clothing-appearance", children: "Clothing & Appearance" }), _jsx("option", { value: "items-props", children: "Items & Props" }), _jsx("option", { value: "settings-locations", children: "Settings & Locations" }), _jsx("option", { value: "utility", children: "Utility" })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "preset-tags", children: "Tags (comma-separated)" }), _jsx("input", { id: "preset-tags", type: "text", value: tags, onChange: (e) => setTags(e.target.value), placeholder: "e.g., character, medieval, fantasy" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "preset-description", children: "Description" }), _jsx("textarea", { id: "preset-description", value: description, onChange: (e) => setDescription(e.target.value), placeholder: "Describe what this preset does...", rows: 3 })] }), _jsxs("div", { className: "preview-section", children: [_jsx("h3", { children: "Preview" }), _jsxs("div", { className: "preview-content", children: [_jsx("div", { className: "preview-type", children: nodeType }), _jsx("pre", { children: JSON.stringify(nodeData, null, 2) })] })] })] }), _jsxs("div", { className: "dialog-buttons", children: [_jsx("button", { className: "save-btn", onClick: handleSave, disabled: !presetName.trim(), children: "Save Preset" }), _jsx("button", { className: "cancel-btn", onClick: handleCancel, children: "Cancel" })] })] }) }));
};
