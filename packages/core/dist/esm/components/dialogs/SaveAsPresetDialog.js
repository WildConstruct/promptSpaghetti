import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { createPSGLib, serializePSGLib, trackPresetUsage } from '../../fileFormats/psglib';
export function SaveAsPresetDialog({ isOpen, onClose, selectedNodes, selectedEdges, currentUser = 'Unknown', onSave, saveToLibrary = false }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [license, setLicense] = useState('MIT');
    const [saveToLibraryChecked, setSaveToLibraryChecked] = useState(saveToLibrary);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    if (!isOpen)
        return null;
    const handleAddTag = () => {
        const trimmed = tagInput.trim();
        if (trimmed && !tags.includes(trimmed)) {
            setTags([...tags, trimmed]);
            setTagInput('');
        }
    };
    const handleRemoveTag = (tag) => {
        setTags(tags.filter(t => t !== tag));
    };
    const handleSave = async () => {
        if (!name.trim()) {
            setError('Please enter a preset name');
            return;
        }
        if (selectedNodes.length === 0) {
            setError('No nodes selected');
            return;
        }
        setSaving(true);
        setError(null);
        try {
            // Create PSGLib file
            const psglib = createPSGLib(selectedNodes, selectedEdges, {
                name: name.trim(),
                description: description.trim(),
                author: currentUser,
                tags,
                license
            });
            // Track creation for analytics
            trackPresetUsage(psglib, 'export');
            // Serialize to JSON
            const jsonString = serializePSGLib(psglib);
            const filename = `${name.trim().replace(/[^a-z0-9-_]/gi, '-').toLowerCase()}.psglib`;
            if (saveToLibraryChecked) {
                // Save to library directory
                const response = await fetch('/api/presets/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ filename, content: jsonString })
                });
                if (!response.ok) {
                    throw new Error('Failed to save to library');
                }
            }
            // Download file
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
            // Callback if provided
            onSave?.(jsonString, filename);
            onClose();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save preset');
        }
        finally {
            setSaving(false);
        }
    };
    return (_jsx("div", { role: "dialog", "aria-modal": "true", "aria-label": "Save as Preset", style: {
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }, children: _jsxs("div", { style: {
                background: '#fff',
                borderRadius: 8,
                width: 520,
                maxWidth: '95vw',
                maxHeight: '80vh',
                overflow: 'auto',
                boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
            }, children: [_jsxs("div", { style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '16px 20px',
                        borderBottom: '1px solid #e1e4e8'
                    }, children: [_jsx("h2", { style: { margin: 0, fontSize: 18 }, children: "Save as Preset" }), _jsx("button", { onClick: onClose, "aria-label": "Close", style: {
                                background: 'none',
                                border: 'none',
                                fontSize: 24,
                                cursor: 'pointer',
                                padding: 0,
                                width: 32,
                                height: 32,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }, children: "\u00D7" })] }), _jsxs("div", { style: { padding: 20 }, children: [_jsxs("div", { style: { marginBottom: 16 }, children: [_jsx("label", { style: { display: 'block', marginBottom: 4, fontWeight: 500 }, children: "Name *" }), _jsx("input", { type: "text", value: name, onChange: (e) => setName(e.target.value), placeholder: "My Awesome Preset", style: {
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #d1d5da',
                                        borderRadius: 4,
                                        fontSize: 14
                                    } })] }), _jsxs("div", { style: { marginBottom: 16 }, children: [_jsx("label", { style: { display: 'block', marginBottom: 4, fontWeight: 500 }, children: "Description" }), _jsx("textarea", { value: description, onChange: (e) => setDescription(e.target.value), placeholder: "What does this preset do?", rows: 3, style: {
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #d1d5da',
                                        borderRadius: 4,
                                        fontSize: 14,
                                        resize: 'vertical'
                                    } })] }), _jsxs("div", { style: { marginBottom: 16 }, children: [_jsx("label", { style: { display: 'block', marginBottom: 4, fontWeight: 500 }, children: "Tags" }), _jsx("div", { style: { display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }, children: tags.map(tag => (_jsxs("span", { style: {
                                            background: '#f1f3f4',
                                            padding: '4px 8px',
                                            borderRadius: 4,
                                            fontSize: 13,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 4
                                        }, children: [tag, _jsx("button", { onClick: () => handleRemoveTag(tag), style: {
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    padding: 0,
                                                    fontSize: 16,
                                                    lineHeight: 1
                                                }, children: "\u00D7" })] }, tag))) }), _jsxs("div", { style: { display: 'flex', gap: 8 }, children: [_jsx("input", { type: "text", value: tagInput, onChange: (e) => setTagInput(e.target.value), onKeyDown: (e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag()), placeholder: "Add a tag", style: {
                                                flex: 1,
                                                padding: '8px 12px',
                                                border: '1px solid #d1d5da',
                                                borderRadius: 4,
                                                fontSize: 14
                                            } }), _jsx("button", { onClick: handleAddTag, style: {
                                                padding: '8px 16px',
                                                background: '#f6f8fa',
                                                border: '1px solid #d1d5da',
                                                borderRadius: 4,
                                                cursor: 'pointer',
                                                fontSize: 14
                                            }, children: "Add" })] })] }), _jsxs("div", { style: { marginBottom: 16 }, children: [_jsx("label", { style: { display: 'block', marginBottom: 4, fontWeight: 500 }, children: "License" }), _jsxs("select", { value: license, onChange: (e) => setLicense(e.target.value), style: {
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #d1d5da',
                                        borderRadius: 4,
                                        fontSize: 14,
                                        background: '#fff'
                                    }, children: [_jsx("option", { value: "MIT", children: "MIT" }), _jsx("option", { value: "CC-BY", children: "CC-BY" }), _jsx("option", { value: "CC-BY-SA", children: "CC-BY-SA" }), _jsx("option", { value: "CC0", children: "CC0 (Public Domain)" }), _jsx("option", { value: "proprietary", children: "Proprietary" }), _jsx("option", { value: "custom", children: "Custom" })] })] }), _jsxs("div", { style: { marginBottom: 16 }, children: [_jsx("label", { style: { display: 'block', marginBottom: 4, fontWeight: 500 }, children: "Author" }), _jsx("input", { type: "text", value: currentUser, disabled: true, style: {
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #d1d5da',
                                        borderRadius: 4,
                                        fontSize: 14,
                                        background: '#f6f8fa',
                                        color: '#586069'
                                    } })] }), _jsx("div", { style: { marginBottom: 16 }, children: _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: 8 }, children: [_jsx("input", { type: "checkbox", checked: saveToLibraryChecked, onChange: (e) => setSaveToLibraryChecked(e.target.checked) }), _jsx("span", { children: "Save to library for immediate use" })] }) }), error && (_jsx("div", { role: "alert", style: {
                                background: '#ffeef0',
                                border: '1px solid #d73a49',
                                borderRadius: 4,
                                padding: '8px 12px',
                                marginBottom: 16,
                                color: '#d73a49',
                                fontSize: 14
                            }, children: error }))] }), _jsxs("div", { style: {
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 8,
                        padding: '16px 20px',
                        borderTop: '1px solid #e1e4e8'
                    }, children: [_jsx("button", { onClick: onClose, style: {
                                padding: '8px 16px',
                                background: '#fff',
                                border: '1px solid #d1d5da',
                                borderRadius: 4,
                                cursor: 'pointer',
                                fontSize: 14
                            }, children: "Cancel" }), _jsx("button", { onClick: handleSave, disabled: saving || !name.trim(), style: {
                                padding: '8px 16px',
                                background: saving || !name.trim() ? '#94d3a2' : '#2ea44f',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 4,
                                cursor: saving || !name.trim() ? 'not-allowed' : 'pointer',
                                fontSize: 14,
                                fontWeight: 500
                            }, children: saving ? 'Saving...' : 'Save as .psglib' })] })] }) }));
}
