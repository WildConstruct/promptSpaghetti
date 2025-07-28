import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// packages/core/components/DataSources/DataSourceConfigurationPanel.tsx
// Epic 8.8 Task 1: External Data Source Configuration Interface
import { useState, useCallback, useEffect } from 'react';
{
    const [dataSources, setDataSources] = useState(initialDataSources);
    const [selectedSourceId, setSelectedSourceId] = useState(null);
    const [editingSource, setEditingSource] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const selectedSource = dataSources.find(ds => ds.id === selectedSourceId);
    useEffect(() => {
        if (initialDataSources.length > 0) {
            setDataSources(initialDataSources);
        }
        [initialDataSources];
    });
    const handleNewSource = useCallback(() => {
        const newId = `custom-source-${Date.now()}`;
    }, setEditingSource({ ...defaultDataSourceForm, id: newId }));
    setShowForm(true);
}
[];
;
const handleEditSource = useCallback((source) => {
    setEditingSource({});
}, ...source, authentication, {
    type: source.authentication?.type || 'none',
    credentials: source.authentication?.credentials || {},
    headers: source.authentication?.headers || {}
});
setShowForm(true);
[];
;
const handleSaveSource = useCallback(() => {
    if (!editingSource)
        return;
    const updatedSources = dataSources.some(ds => ds.id === editingSource.id);
})
    ? dataSources.map(ds => ds.id === editingSource.id ? editingSource : ds) : ;
[...dataSources, editingSource];
setDataSources(updatedSources);
setEditingSource(null);
setShowForm(false);
onSave(updatedSources);
[editingSource, dataSources, onSave];
;
const handleDeleteSource = useCallback((sourceId) => {
    const updatedSources = dataSources.filter(ds => ds.id !== sourceId);
    setDataSources(updatedSources);
    if (selectedSourceId === sourceId) {
        setSelectedSourceId(null);
        onSave(updatedSources);
    }
    [dataSources, selectedSourceId, onSave];
});
const handleToggleSource = useCallback((sourceId) => {
    const updatedSources = dataSources.map(ds => );
});
ds.id === sourceId ? { ...ds, enabled: !ds.enabled } : ds;
;
setDataSources(updatedSources);
onSave(updatedSources);
[dataSources, onSave];
;
const updateEditingSource = useCallback((updates) => {
    if (!editingSource)
        return;
    setEditingSource({ ...editingSource, ...updates });
}, [editingSource]);
const addTag = useCallback((tag) => {
    if (!editingSource || editingSource.metadata.tags.includes(tag))
        return;
    updateEditingSource({});
    metadata: { }
}, ...editingSource.metadata, tags, [...editingSource.metadata.tags, tag]);
;
[editingSource, updateEditingSource];
;
const removeTag = useCallback((tag) => {
    if (!editingSource)
        return;
    updateEditingSource({});
    metadata: { }
}, ...editingSource.metadata, tags, editingSource.metadata.tags.filter(t => t !== tag));
;
[editingSource, updateEditingSource];
;
if (!visible)
    return null;
return;
_jsxs("div", { style: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
    }, children: [_jsxs("div", { style: {
                background: '#2d3748',
                border: '1px solid #4a5568',
                borderRadius: 8,
                width: '90vw',
                maxWidth: 1200,
                maxHeight: '90vh',
                display: 'flex',
                overflow: 'hidden',
            }, children: [_jsxs("div", { style: {
                        width: 320,
                        background: '#1a202c',
                        borderRight: '1px solid #4a5568',
                        display: 'flex',
                        flexDirection: 'column',
                    }, children: [_jsxs("div", { style: {
                                padding: 16,
                                borderBottom: '1px solid #4a5568',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }, children: [_jsx("h3", { style: { color: '#e2e8f0', margin: 0, fontSize: 16 }, children: "Data Sources" }), _jsx("button", { onClick: handleNewSource, style: {
                                        padding: '6px 12px',
                                        background: '#4299e1',
                                        border: 'none',
                                        borderRadius: 4,
                                        color: 'white',
                                        fontSize: 12,
                                        cursor: 'pointer',
                                    }, children: "+ Add New" })] }), _jsxs("div", { style: { flex: 1, overflowY: 'auto', padding: 8 }, children: [dataSources.map(source => ()
                                    < div, key = { source, : .id }, style = {}, {
                                    padding: 12,
                                    marginBottom: 8,
                                    background: selectedSourceId === source.id ? '#2d3748' : 'transparent',
                                    border: `1px solid ${selectedSourceId === source.id ? '#4299e1' : '#4a5568'}`
                                }), ", borderRadius: 6, cursor: 'pointer'; }} onClick=", () => setSelectedSourceId(source.id), ">", _jsxs("div", { style: {
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        marginBottom: 8,
                                    }, children: [_jsxs("div", { children: [_jsx("div", { style: {
                                                        color: '#e2e8f0',
                                                        fontSize: 14,
                                                        fontWeight: 500,
                                                        marginBottom: 4,
                                                    }, children: source.name }), _jsx("div", { style: {
                                                        color: '#a0aec0',
                                                        fontSize: 12,
                                                        marginBottom: 4,
                                                    }, children: source.type.toUpperCase() })] }), _jsx("div", { style: {
                                                width: 12,
                                                height: 12,
                                                borderRadius: '50%',
                                                background: source.enabled ? '#48bb78' : '#f56565',
                                            } })] }), _jsx("div", { style: {
                                        color: '#a0aec0',
                                        fontSize: 11,
                                        marginBottom: 8,
                                        maxHeight: 36,
                                        overflow: 'hidden',
                                        lineHeight: 1.3,
                                    }, children: source.metadata.description }), _jsxs("div", { style: {
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: 4,
                                        marginBottom: 8,
                                    }, children: [source.metadata.tags.slice(0, 3).map(tag => ()
                                            < span, key = { tag }, style = {}, {
                                            background: '#4a5568',
                                            color: '#e2e8f0',
                                            padding: '2px 6px',
                                            borderRadius: 3,
                                            fontSize: 10,
                                        }), ">", tag] }), "))}", source.metadata.tags.length > 3 && ()
                                    < span, " style=", { color: '#a0aec0', fontSize: 10 }, "> +", source.metadata.tags.length - 3] }), ")}"] }), _jsxs("div", { style: { display: 'flex', gap: 4 }, children: [_jsx("button", { onClick: (e) => {
                                e.stopPropagation();
                                handleToggleSource(source.id);
                            }, style: {
                                padding: '2px 8px',
                                background: source.enabled ? '#f56565' : '#48bb78',
                                border: 'none',
                                borderRadius: 3,
                                color: 'white',
                                fontSize: 10,
                                cursor: 'pointer',
                            }, children: source.enabled ? 'Disable' : 'Enable' }), _jsx("button", { onClick: (e) => {
                                e.stopPropagation();
                                handleEditSource(source);
                            }, style: {
                                padding: '2px 8px',
                                background: '#9f7aea',
                                border: 'none',
                                borderRadius: 3,
                                color: 'white',
                                fontSize: 10,
                                cursor: 'pointer',
                            }, children: "Edit" }), _jsx("button", { onClick: (e) => {
                                e.stopPropagation();
                                handleDeleteSource(source.id);
                            }, style: {
                                padding: '2px 8px',
                                background: '#e53e3e',
                                border: 'none',
                                borderRadius: 3,
                                color: 'white',
                                fontSize: 10,
                                cursor: 'pointer',
                            }, children: "Delete" })] })] }), "))}"] });
div >
    { /* Main Content Area */}
    < div;
style = {};
{
    flex: 1, display;
    'flex', flexDirection;
    'column';
}
 >
    { /* Header */}
    < div;
style = {};
{
    padding: 16,
        borderBottom;
    '1px solid #4a5568',
        display;
    'flex',
        justifyContent;
    'space-between',
        alignItems;
    'center',
    ;
}
 >
    (_jsx("h2", { style: { color: '#e2e8f0', margin: 0, fontSize: 20 }, children: "External Data Sources Configuration" })
        ,
            _jsx("button", { onClick: onClose, style: {
                    padding: '8px 16px',
                    background: '#4a5568',
                    border: 'none',
                    borderRadius: 4,
                    color: 'white',
                    fontSize: 14,
                    cursor: 'pointer',
                }, children: "Close" }));
div >
    { /* Content */}
    < div;
style = {};
{
    flex: 1, overflow;
    'hidden';
}
 >
    { showForm } && editingSource ? ()
    < DataSourceForm
    :
;
source = { editingSource };
onUpdate = { updateEditingSource };
onSave = { handleSaveSource };
onCancel = {}();
{
    setShowForm(false);
    setEditingSource(null);
}
onAddTag = { addTag };
onRemoveTag = { removeTag }
    /  >
;
selectedSource ? ()
    < DataSourceDetails
    :
;
source = { selectedSource };
onEdit = {}();
handleEditSource(selectedSource);
/>;
()
    < div;
style = {};
{
    display: 'flex',
        alignItems;
    'center',
        justifyContent;
    'center',
        height;
    '100%',
        color;
    '#a0aec0',
        fontSize;
    16,
    ;
}
 >
    Select;
a;
data;
source;
to;
view;
details;
or;
click;
"Add New";
to;
create;
one;
div >
;
div >
;
div >
;
div >
;
div >
;
;
;
// Data Source Form Component
const DataSourceForm, DataSourceFormData;
onUpdate: (updates) => void ;
onSave: () => void ;
onCancel: () => void ;
onAddTag: (tag) => void ;
onRemoveTag: (tag) => void ;
 > ;
({ source, onUpdate, onSave, onCancel, onAddTag, onRemoveTag }) => {
    const [newTag, setNewTag] = useState('');
    const handleTagAdd = useCallback(() => {
        if (newTag.trim()) {
            onAddTag(newTag.trim());
            setNewTag('');
        }
        [newTag, onAddTag];
    });
    return;
    _jsxs("div", { style: { height: '100%', overflowY: 'auto', padding: 24 }, children: [_jsxs("div", { style: { maxWidth: 800 }, children: [_jsxs("div", { style: { marginBottom: 24 }, children: [_jsx("h3", { style: { color: '#e2e8f0', marginBottom: 16, fontSize: 16 }, children: "Basic Information" }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }, children: [_jsxs("div", { children: [_jsx("label", { style: { display: 'block', color: '#a0aec0', fontSize: 12, marginBottom: 4 }, children: "Name *" }), _jsx("input", { type: "text", value: source.name, onChange: (e) => onUpdate({ name: e.target.value }), style: {
                                                    width: '100%',
                                                    padding: 8,
                                                    background: '#1a202c',
                                                    border: '1px solid #4a5568',
                                                    borderRadius: 4,
                                                    color: '#e2e8f0',
                                                    fontSize: 14,
                                                }, placeholder: "Enter source name" })] }), _jsxs("div", { children: [_jsx("label", { style: { display: 'block', color: '#a0aec0', fontSize: 12, marginBottom: 4 }, children: "Type *" }), _jsxs("select", { value: source.type, onChange: (e) => onUpdate({ type: e.target.value }), style: {
                                                    width: '100%',
                                                    padding: 8,
                                                    background: '#1a202c',
                                                    border: '1px solid #4a5568',
                                                    borderRadius: 4,
                                                    color: '#e2e8f0',
                                                    fontSize: 14,
                                                }, children: [_jsx("option", { value: "api", children: "API" }), _jsx("option", { value: "database", children: "Database" }), _jsx("option", { value: "file", children: "File" }), _jsx("option", { value: "static", children: "Static Data" })] })] })] }), _jsxs("div", { style: { marginBottom: 16 }, children: [_jsx("label", { style: { display: 'block', color: '#a0aec0', fontSize: 12, marginBottom: 4 }, children: "Description" }), _jsx("textarea", { value: source.metadata.description, onChange: (e) => onUpdate({}), "metadata:": true, ...(source.metadata, description) }), ": e.target.value } })} rows=", 3, "style=", {
                                        width: '100%',
                                        padding: 8,
                                        background: '#1a202c',
                                        border: '1px solid #4a5568',
                                        borderRadius: 4,
                                        color: '#e2e8f0',
                                        fontSize: 14,
                                        resize: 'vertical',
                                    }, "placeholder=\"Describe this data source...\" />"] }), source.type === 'api' && ()
                                < div >
                                (_jsx("label", { style: { display: 'block', color: '#a0aec0', fontSize: 12, marginBottom: 4 }, children: "API Endpoint *" })
                                    ,
                                        _jsx("input", { type: "url", value: source.endpoint || '', onChange: (e) => onUpdate({ endpoint: e.target.value }), style: {
                                                width: '100%',
                                                padding: 8,
                                                background: '#1a202c',
                                                border: '1px solid #4a5568',
                                                borderRadius: 4,
                                                color: '#e2e8f0',
                                                fontSize: 14,
                                            }, placeholder: "https://api.example.com/v1" }))] }), ")}"] }), _jsxs("div", { style: { marginBottom: 24 }, children: [_jsx("h3", { style: { color: '#e2e8f0', marginBottom: 16, fontSize: 16 }, children: "Tags" }), _jsxs("div", { style: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }, children: [source.metadata.tags.map(tag => ()
                                < span, key = { tag }, style = {}, {
                                background: '#4a5568',
                                color: '#e2e8f0',
                                padding: '4px 8px',
                                borderRadius: 4,
                                fontSize: 12,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                            }), ">", tag, _jsx("button", { onClick: () => onRemoveTag(tag), style: {
                                    background: 'none',
                                    border: 'none',
                                    color: '#f56565',
                                    cursor: 'pointer',
                                    fontSize: 12,
                                    padding: 0,
                                }, children: "\u00D7" })] }), "))}"] }), _jsxs("div", { style: { display: 'flex', gap: 8 }, children: [_jsx("input", { type: "text", value: newTag, onChange: (e) => setNewTag(e.target.value), onKeyDown: (e) => e.key === 'Enter' && handleTagAdd(), placeholder: "Add tag...", style: {
                            flex: 1,
                            padding: 6,
                            background: '#1a202c',
                            border: '1px solid #4a5568',
                            borderRadius: 4,
                            color: '#e2e8f0',
                            fontSize: 12,
                        } }), _jsx("button", { onClick: handleTagAdd, disabled: !newTag.trim(), style: {
                            padding: '6px 12px',
                            background: newTag.trim() ? '#4299e1' : '#4a5568',
                            border: 'none',
                            borderRadius: 4,
                            color: 'white',
                            fontSize: 12,
                            cursor: newTag.trim() ? 'pointer' : 'not-allowed',
                        }, children: "Add" })] })] });
    { /* Save/Cancel Buttons */ }
    _jsxs("div", { style: {
            display: 'flex',
            gap: 12,
            paddingTop: 16,
            borderTop: '1px solid #4a5568',
        }, children: [_jsx("button", { onClick: onSave, disabled: !source.name.trim(), style: {
                    padding: '10px 20px',
                    background: source.name.trim() ? '#48bb78' : '#4a5568',
                    border: 'none',
                    borderRadius: 4,
                    color: 'white',
                    fontSize: 14,
                    cursor: source.name.trim() ? 'pointer' : 'not-allowed',
                }, children: "Save Data Source" }), _jsx("button", { onClick: onCancel, style: {
                    padding: '10px 20px',
                    background: '#4a5568',
                    border: 'none',
                    borderRadius: 4,
                    color: 'white',
                    fontSize: 14,
                    cursor: 'pointer',
                }, children: "Cancel" })] });
    div >
    ;
    div >
    ;
    ;
};
// Data Source Details Component
const DataSourceDetails, DataSource;
onEdit: () => void ;
 > ;
({ source, onEdit }) => {
    return;
    _jsxs("div", { style: { height: '100%', overflowY: 'auto', padding: 24 }, children: [_jsxs("div", { style: { maxWidth: 800 }, children: [_jsxs("div", { style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: 24,
                        }, children: [_jsxs("div", { children: [_jsx("h3", { style: { color: '#e2e8f0', fontSize: 20, margin: '0 0 8px 0' }, children: source.name }), _jsxs("div", { style: { color: '#a0aec0', fontSize: 14, marginBottom: 8 }, children: [source.type.toUpperCase(), " \u2022 ", source.enabled ? 'Enabled' : 'Disabled'] }), _jsx("div", { style: { color: '#a0aec0', fontSize: 14 }, children: source.metadata.description })] }), _jsx("button", { onClick: onEdit, style: {
                                    padding: '8px 16px',
                                    background: '#4299e1',
                                    border: 'none',
                                    borderRadius: 4,
                                    color: 'white',
                                    fontSize: 14,
                                    cursor: 'pointer',
                                }, children: "Edit" })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }, children: [_jsxs("div", { children: [_jsx("h4", { style: { color: '#e2e8f0', fontSize: 16, marginBottom: 12 }, children: "Connection" }), source.endpoint && ()
                                        < div, " style=", { marginBottom: 8 }, ">", _jsx("span", { style: { color: '#a0aec0', fontSize: 12 }, children: "Endpoint: " }), _jsx("span", { style: { color: '#e2e8f0', fontSize: 12, fontFamily: 'monospace' }, children: source.endpoint })] }), ")}", _jsxs("div", { style: { marginBottom: 8 }, children: [_jsx("span", { style: { color: '#a0aec0', fontSize: 12 }, children: "Auth: " }), _jsx("span", { style: { color: '#e2e8f0', fontSize: 12 }, children: source.authentication?.type || 'None' })] })] }), _jsxs("div", { children: [_jsx("h4", { style: { color: '#e2e8f0', fontSize: 16, marginBottom: 12 }, children: "Caching" }), _jsxs("div", { style: { marginBottom: 8 }, children: [_jsx("span", { style: { color: '#a0aec0', fontSize: 12 }, children: "Strategy: " }), _jsx("span", { style: { color: '#e2e8f0', fontSize: 12 }, children: source.caching.strategy })] }), _jsxs("div", { style: { marginBottom: 8 }, children: [_jsx("span", { style: { color: '#a0aec0', fontSize: 12 }, children: "TTL: " }), _jsxs("span", { style: { color: '#e2e8f0', fontSize: 12 }, children: [source.caching.ttl, "s"] })] }), _jsxs("div", { style: { marginBottom: 8 }, children: [_jsx("span", { style: { color: '#a0aec0', fontSize: 12 }, children: "Max Size: " }), _jsxs("span", { style: { color: '#e2e8f0', fontSize: 12 }, children: [source.caching.maxSize, "MB"] })] })] })] }), _jsxs("div", { style: { marginTop: 24 }, children: [_jsx("h4", { style: { color: '#e2e8f0', fontSize: 16, marginBottom: 12 }, children: "Tags" }), _jsxs("div", { style: { display: 'flex', flexWrap: 'wrap', gap: 8 }, children: [source.metadata.tags.map(tag => ()
                                < span, key = { tag }, style = {}, {
                                background: '#4a5568',
                                color: '#e2e8f0',
                                padding: '4px 8px',
                                borderRadius: 4,
                                fontSize: 12,
                            }), ">", tag] }), "))}"] })] });
    { /* Transforms */ }
    {
        source.transforms.length > 0 && ()
            < div;
        style = {};
        {
            marginTop: 24;
        }
    }
     >
        (_jsxs("h4", { style: { color: '#e2e8f0', fontSize: 16, marginBottom: 12 }, children: ["Data Transforms (", source.transforms.length, ")"] })
            ,
                _jsxs("div", { style: { background: '#1a202c', padding: 16, borderRadius: 6 }, children: [source.transforms.map((transform, index) => ()
                            < div, key = { transform, : .id }, style = {}, { marginBottom: index < source.transforms.length - 1 ? 12 : 0 }), ">", _jsxs("div", { style: { color: '#e2e8f0', fontSize: 14, marginBottom: 4 }, children: [transform.name, " (", transform.type, ")"] }), _jsx("div", { style: { color: '#a0aec0', fontSize: 12 }, children: transform.enabled ? 'Enabled' : 'Disabled' })] }));
};
div >
;
div >
;
div >
;
div >
;
;
;
