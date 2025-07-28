import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useCorrectionsStore, DEFAULT_CORRECTION_RULES } from './correctionsStore';
import { WorkflowManager } from './components/WorkflowManager';
import { NotificationSystem } from './components/NotificationSystem';
import { CorrectionsStatsDashboard } from './components/CorrectionsStatsDashboard';
export const CorrectionsManagerPanel = ({ isOpen, onClose }) => {
    const { rules, isEnabled, addRule, updateRule, deleteRule, toggleRule, reorderRules, clearAllRules, applyCorrections } = useCorrectionsStore();
    // UI State
    const [editingRule, setEditingRule] = useState(null);
    const [selectedRules, setSelectedRules] = useState(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [sortType, setSortType] = useState('priority');
    const [viewMode, setViewMode] = useState('list');
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [showImportExport, setShowImportExport] = useState(false);
    const [showStats, setShowStats] = useState(false);
    const [showWorkflow, setShowWorkflow] = useState(false);
    const [testText, setTestText] = useState('');
    // New rule form state
    const [newRule, setNewRule] = useState({});
    name: '',
        description;
    '',
        findPattern;
    '',
        replaceWith;
    '',
        isRegex;
    false,
        isActive;
    true,
        priority;
    rules.length,
        category;
    '',
        tags;
    [],
    ;
};
// Import/Export state
const [importContent, setImportContent] = useState('');
const [importFilename, setImportFilename] = useState('');
const [exportFormat, setExportFormat] = useState('json');
// Mobile detection
const [isMobile, setIsMobile] = useState(false);
useEffect(() => {
    const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
}, []);
// Filter and sort rules
const filteredAndSortedRules = useMemo(() => {
    let filtered = rules;
    // Apply search filter
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(rule => );
        rule.name.toLowerCase().includes(query) ||
            rule.description?.toLowerCase().includes(query) ||
            rule.findPattern.toLowerCase().includes(query) ||
            rule.replaceWith.toLowerCase().includes(query);
    }
});
// Apply type filter
switch (filterType) {
    case 'active':
        filtered = filtered.filter(rule => rule.isActive);
        break;
    case 'inactive':
        filtered = filtered.filter(rule => !rule.isActive);
        break;
    case 'regex':
        filtered = filtered.filter(rule => rule.isRegex);
        break;
    case 'text':
        filtered = filtered.filter(rule => !rule.isRegex);
        break;
    case 'draft':
        filtered = filtered.filter(rule => rule.status === 'draft');
        break;
    case 'published':
        filtered = filtered.filter(rule => rule.status === 'published');
        break;
    case 'deprecated':
        filtered = filtered.filter(rule => rule.status === 'deprecated');
        break;
        // Apply sorting
        switch (sortType) {
            case 'name':
                filtered.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'priority':
                filtered.sort((a, b) => a.priority - b.priority);
                break;
            case 'created':
                filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                break;
            case 'updated':
                filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
                break;
                return filtered;
        }
        [rules, searchQuery, filterType, sortType];
        ;
        // Event handlers
        const handleAddRule = useCallback(() => {
            if (newRule.name.trim() && newRule.findPattern.trim()) {
                addRule(newRule);
                setNewRule({});
                name: '',
                    description;
                '',
                    findPattern;
                '',
                    replaceWith;
                '',
                    isRegex;
                false,
                    isActive;
                true,
                    priority;
                rules.length,
                ;
            }
        });
}
[newRule, addRule, rules.length];
;
const handleUpdateRule = useCallback((rule) => {
    updateRule(rule.id, rule);
    setEditingRule(null);
}, [updateRule]);
const handleDeleteRule = useCallback((id) => {
    if (window.confirm('Are you sure you want to delete this correction rule?')) {
        deleteRule(id);
    }
    [deleteRule];
});
const handleBulkAction = useCallback((action) => {
    if (selectedRules.size === 0)
        return;
    const confirmed = window.confirm(`Are you sure you want to ${action} ${selectedRules.size} rule(s)?`);
});
if (!confirmed)
    return;
selectedRules.forEach(ruleId => { });
switch (action) {
    case 'delete':
        deleteRule(ruleId);
        break;
    case 'activate':
        updateRule(ruleId, { isActive: true });
        break;
    case 'deactivate':
        updateRule(ruleId, { isActive: false });
        break;
}
;
setSelectedRules(new Set());
[selectedRules, deleteRule, updateRule];
;
const handleSelectAll = useCallback(() => {
    if (selectedRules.size === filteredAndSortedRules.length) {
        setSelectedRules(new Set());
    }
    else {
        setSelectedRules(new Set(filteredAndSortedRules.map(rule => rule.id)));
    }
    [selectedRules.size, filteredAndSortedRules];
});
const handleExport = useCallback(async () => {
    try {
        const result = await exportRules(exportFormat, {});
        includeInactive: filterType === 'all' || filterType === 'inactive',
            includeStatistics;
        true,
        ;
    }
    finally { }
});
if (result.success && result.data && result.filename) {
    const url = window.URL.createObjectURL(result.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}
else {
    console.error('Export failed:', result.error);
}
try { }
catch (error) {
    console.error('Export failed:', error);
}
[exportFormat, exportRules, filterType];
;
const handleImport = useCallback(async () => {
    if (!importContent || !importFilename)
        return;
    try {
        const result = await importRules(importContent, importFilename, {});
        skipDuplicates: true,
            merge;
        true,
        ;
    }
    finally { }
});
if (result.success) {
    alert(`Successfully imported ${result.importedCount} correction rules`);
}
setImportContent('');
setImportFilename('');
{
    console.error('Import failed:', result.error);
    alert(`Import failed: ${result.error}`);
}
try { }
catch (error) {
    console.error('Import failed:', error);
    alert('Import failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
}
[importContent, importFilename, importRules];
;
const handleTestCorrections = useCallback(() => {
    return applyCorrections(testText);
}, [testText, applyCorrections]);
const panelWidth = isMobile ? '100%' : isCollapsed ? '60px' : '500px';
// Don't render if panel is closed or corrections are not enabled
if (!isOpen || !isEnabled)
    return null;
return;
_jsxs("div", { style: {
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: panelWidth,
        background: '#23272f',
        color: '#fff',
        borderLeft: '1px solid #444',
        zIndex: 1000,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease',
    }, "data-testid": "corrections-manager-panel", children: [_jsx("div", { style: {
                padding: '12px 16px',
                borderBottom: '1px solid #444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                minHeight: '48px',
            }, children: !isCollapsed && ()
                <  >
                (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' }, children: [_jsx("h2", { style: { margin: 0, fontSize: '16px', fontWeight: 600 }, children: "Corrections Manager" }), _jsxs("span", { style: {
                                background: '#4a5568',
                                padding: '2px 6px',
                                borderRadius: '10px',
                                fontSize: '11px',
                                fontWeight: 500,
                            }, children: [filteredAndSortedRules.length, "/", rules.length] })] })
                    ,
                        _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' }, children: [_jsx("button", { onClick: () => setIsCollapsed(true), style: {
                                        background: 'none',
                                        border: 'none',
                                        color: '#a0aec0',
                                        cursor: 'pointer',
                                        padding: '4px',
                                        borderRadius: '4px',
                                        fontSize: '14px',
                                    }, title: "Collapse panel", children: "\u2190" }), _jsx("button", { onClick: onClose, style: {
                                        background: 'none',
                                        border: 'none',
                                        color: '#a0aec0',
                                        cursor: 'pointer',
                                        padding: '4px',
                                        borderRadius: '4px',
                                        fontSize: '16px',
                                    }, title: "Close panel", children: "\u00D7" })] })) }), ")}", isCollapsed && ()
            < div, " style=", { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }, ">", _jsx("button", { onClick: () => setIsCollapsed(false), style: {
                background: 'none',
                border: 'none',
                color: '#a0aec0',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                fontSize: '14px',
            }, title: "Expand panel", children: "\u2192" }), _jsx("div", { style: {
                writing: 'vertical-rl',
                textOrientation: 'mixed',
                fontSize: '12px',
                color: '#a0aec0',
                transform: 'rotate(180deg)',
            }, children: "Corrections" })] });
div >
    {};
isCollapsed && ()
    < div;
style = {};
{
    flex: 1, overflow;
    'auto', display;
    'flex', flexDirection;
    'column';
}
 >
    { /* Controls */}
    < div;
style = {};
{
    padding: '16px', borderBottom;
    '1px solid #444';
}
 >
    { /* Search */}
    < div;
style = {};
{
    marginBottom: '12px';
}
 >
    _jsx("input", { type: "text", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), placeholder: "Search rules...", style: {
            width: '100%',
            padding: '8px 12px',
            background: '#2a2e37',
            color: '#fff',
            border: '1px solid #444',
            borderRadius: '6px',
            fontSize: '14px',
        } });
div >
    { /* Filters and Controls */}
    < div;
style = {};
{
    display: 'flex',
        gap;
    '8px',
        marginBottom;
    '12px',
        flexWrap;
    'wrap',
    ;
}
 >
    { /* Filter */}
    < select;
value = { filterType };
onChange = {}(e);
setFilterType(e.target.value);
style = {};
{
    padding: '6px 8px',
        background;
    '#2a2e37',
        color;
    '#fff',
        border;
    '1px solid #444',
        borderRadius;
    '4px',
        fontSize;
    '12px',
    ;
}
    >
        (_jsx("option", { value: "all", children: "All Rules" })
            ,
                _jsx("option", { value: "active", children: "Active" })
                    ,
                        _jsx("option", { value: "inactive", children: "Inactive" })
                            ,
                                _jsx("option", { value: "regex", children: "Regex" })
                                    ,
                                        _jsx("option", { value: "text", children: "Text" })
                                            ,
                                                _jsx("option", { value: "draft", children: "Draft" })
                                                    ,
                                                        _jsx("option", { value: "published", children: "Published" })
                                                            ,
                                                                _jsx("option", { value: "deprecated", children: "Deprecated" }));
select >
    { /* Sort */}
    < select;
value = { sortType };
onChange = {}(e);
setSortType(e.target.value);
style = {};
{
    padding: '6px 8px',
        background;
    '#2a2e37',
        color;
    '#fff',
        border;
    '1px solid #444',
        borderRadius;
    '4px',
        fontSize;
    '12px',
    ;
}
    >
        (_jsx("option", { value: "priority", children: "Priority" })
            ,
                _jsx("option", { value: "name", children: "Name" })
                    ,
                        _jsx("option", { value: "created", children: "Created" })
                            ,
                                _jsx("option", { value: "updated", children: "Updated" }));
select >
    { /* View Mode */}
    < select;
value = { viewMode };
onChange = {}(e);
setViewMode(e.target.value);
style = {};
{
    padding: '6px 8px',
        background;
    '#2a2e37',
        color;
    '#fff',
        border;
    '1px solid #444',
        borderRadius;
    '4px',
        fontSize;
    '12px',
    ;
}
    >
        (_jsx("option", { value: "list", children: "List" })
            ,
                _jsx("option", { value: "grid", children: "Grid" })
                    ,
                        _jsx("option", { value: "compact", children: "Compact" }));
select >
;
div >
    { /* Action Buttons */}
    < div;
style = {};
{
    display: 'flex', gap;
    '8px', flexWrap;
    'wrap';
}
 >
    _jsx("button", { onClick: handleSelectAll, style: {
            padding: '6px 12px',
            background: '#4a5568',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '12px',
            cursor: 'pointer',
        }, children: selectedRules.size === filteredAndSortedRules.length ? 'Deselect All' : 'Select All' });
{
    selectedRules.size > 0 && ()
        <  >
        (_jsxs("button", { onClick: () => handleBulkAction('activate'), style: {
                padding: '6px 12px',
                background: '#38a169',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer',
            }, children: ["Activate (", selectedRules.size, ")"] })
            ,
                _jsxs("button", { onClick: () => handleBulkAction('deactivate'), style: {
                        padding: '6px 12px',
                        background: '#e53e3e',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer',
                    }, children: ["Deactivate (", selectedRules.size, ")"] })
                    ,
                        _jsxs("button", { onClick: () => handleBulkAction('delete'), style: {
                                padding: '6px 12px',
                                background: '#e53e3e',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '12px',
                                cursor: 'pointer',
                            }, children: ["Delete (", selectedRules.size, ")"] }));
     >
    ;
}
_jsx("button", { onClick: () => setShowImportExport(!showImportExport), style: {
        padding: '6px 12px',
        background: '#63b3ed',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        fontSize: '12px',
        cursor: 'pointer',
    }, children: "Import/Export" })
    ,
        _jsx("button", { onClick: () => setShowStats(!showStats), style: {
                padding: '6px 12px',
                background: '#9f7aea',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer',
            }, children: "Stats" })
            ,
                _jsxs("button", { onClick: () => setShowWorkflow(!showWorkflow), style: {
                        padding: '6px 12px',
                        background: '#63b3ed',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        position: 'relative',
                    }, children: ["Workflow", getDraftRules().length > 0 && ()
                            < span, " style=", {
                            position: 'absolute',
                            top: '-4px',
                            right: '-4px',
                            background: '#fbb040',
                            color: '#1a202c',
                            borderRadius: '50%',
                            width: '16px',
                            height: '16px',
                            fontSize: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }, ">", getDraftRules().length] });
button >
;
div >
;
div >
    { /* Import/Export Section */};
{
    showImportExport && ()
        < div;
    style = {};
    {
        padding: '16px',
            background;
        '#1e2228',
            borderBottom;
        '1px solid #444',
            margin;
        '0 16px',
            borderRadius;
        '6px',
            marginBottom;
        '16px',
        ;
    }
}
 >
    _jsx("h3", { style: { fontSize: '14px', margin: '0 0 12px 0', fontWeight: 600 }, children: "Import/Export" });
{ /* Export */ }
_jsxs("div", { style: { marginBottom: '16px' }, children: [_jsx("label", { style: { display: 'block', fontSize: '12px', marginBottom: '6px' }, children: "Export Format:" }), _jsxs("div", { style: { display: 'flex', gap: '8px', alignItems: 'center' }, children: [_jsxs("select", { value: exportFormat, onChange: (e) => setExportFormat(e.target.value), style: {
                        padding: '6px 8px',
                        background: '#2a2e37',
                        color: '#fff',
                        border: '1px solid #444',
                        borderRadius: '4px',
                        fontSize: '12px',
                    }, children: [_jsx("option", { value: "json", children: "JSON" }), _jsx("option", { value: "yaml", children: "YAML" }), _jsx("option", { value: "csv", children: "CSV" })] }), _jsx("button", { onClick: handleExport, style: {
                        padding: '6px 12px',
                        background: '#38a169',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer',
                    }, children: "Export" })] })] });
{ /* Import */ }
_jsxs("div", { children: [_jsx("label", { style: { display: 'block', fontSize: '12px', marginBottom: '6px' }, children: "Import File:" }), _jsx("input", { type: "file", accept: ".json,.yaml,.yml,.csv", onChange: (e) => {
                const file = e.target.files?.[0];
                if (file) {
                    setImportFilename(file.name);
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        setImportContent(e.target?.result);
                    };
                    reader.readAsText(file);
                }
            }, style: {
                width: '100%',
                padding: '6px',
                background: '#2a2e37',
                color: '#fff',
                border: '1px solid #444',
                borderRadius: '4px',
                fontSize: '12px',
                marginBottom: '8px',
            } }), importContent && ()
            < button, "onClick=", handleImport, "style=", {
            padding: '6px 12px',
            background: '#63b3ed',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '12px',
            cursor: 'pointer',
        }, "> Import"] });
div >
;
div >
;
{ /* Test Section */ }
_jsxs("div", { style: { padding: '16px', borderBottom: '1px solid #444' }, children: [_jsx("h3", { style: { fontSize: '14px', marginBottom: '8px', fontWeight: 600 }, children: "Test Corrections" }), _jsx("textarea", { value: testText, onChange: (e) => setTestText(e.target.value), placeholder: "Enter text to test corrections...", style: {
                width: '100%',
                minHeight: '60px',
                padding: '8px',
                background: '#2a2e37',
                color: '#fff',
                border: '1px solid #444',
                borderRadius: '6px',
                resize: 'vertical',
                fontSize: '14px',
            } }), testText && ()
            < div, " style=", { marginTop: '8px' }, ">", _jsx("strong", { style: { fontSize: '12px', color: '#a0aec0' }, children: "Result:" }), _jsx("div", { style: {
                padding: '8px',
                background: '#1e2228',
                border: '1px solid #444',
                borderRadius: '6px',
                marginTop: '4px',
                fontSize: '14px',
                wordBreak: 'break-word',
            }, children: handleTestCorrections() })] });
div >
    { /* Rules List */}
    < div;
style = {};
{
    flex: 1, overflow;
    'auto', padding;
    '16px';
}
 >
    _jsxs("div", { style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
        }, children: [_jsxs("h3", { style: { fontSize: '14px', margin: 0, fontWeight: 600 }, children: ["Rules (", filteredAndSortedRules.length, ")"] }), _jsxs("div", { style: { display: 'flex', gap: '8px' }, children: [_jsx("button", { onClick: () => {
                            if (window.confirm('This will add default correction rules. Continue?')) {
                                DEFAULT_CORRECTION_RULES.forEach(rule => addRule(rule));
                            }
                        }, style: {
                            padding: '6px 12px',
                            background: '#4a5568',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer',
                        }, children: "Load Defaults" }), _jsx("button", { onClick: () => {
                            if (window.confirm('This will delete all correction rules. Continue?')) {
                                clearAllRules();
                            }
                        }, style: {
                            padding: '6px 12px',
                            background: '#e53e3e',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer',
                        }, children: "Clear All" })] })] });
{ /* Rules */ }
_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '8px' }, children: [filteredAndSortedRules.map((rule) => ()
            < div, key = { rule, : .id }, style = {}, {
            background: selectedRules.has(rule.id) ? '#2d3748' : '#2a2e37',
            border: '1px solid #444',
            borderRadius: '6px',
            padding: '12px',
            transition: 'background 0.2s ease',
        }), ">", _jsxs("div", { style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px',
            }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' }, children: [_jsx("input", { type: "checkbox", checked: selectedRules.has(rule.id), onChange: (e) => {
                                const newSelected = new Set(selectedRules);
                                if (e.target.checked) {
                                    newSelected.add(rule.id);
                                }
                                else {
                                    newSelected.delete(rule.id);
                                    setSelectedRules(newSelected);
                                }
                            }, style: { marginRight: '4px' } }), _jsx("input", { type: "checkbox", checked: rule.isActive, onChange: () => toggleRule(rule.id), style: { marginRight: '4px' } }), _jsx("strong", { style: { fontSize: '14px', fontWeight: 600 }, children: rule.name }), rule.isRegex && ()
                            < span, " style=", {
                            background: '#4a5568',
                            color: '#fff',
                            padding: '2px 6px',
                            borderRadius: '2px',
                            fontSize: '10px',
                            fontWeight: 500,
                        }, "> REGEX"] }), ")}", rule.status && ()
                    < span, " style=", {
                    background: rule.status === 'draft' ? '#fbb040' : ,
                    rule, : .status === 'published' ? '#68d391' : ,
                    rule, : .status === 'deprecated' ? '#e53e3e' : '#a0aec0',
                    color: '#1a202c',
                    padding: '2px 6px',
                    borderRadius: '2px',
                    fontSize: '10px',
                    fontWeight: 500,
                    marginLeft: '4px',
                }, ">", rule.status.toUpperCase()] }), ")}"] })
    ,
        _jsxs("div", { style: { display: 'flex', gap: '8px' }, children: [_jsx("button", { onClick: () => setEditingRule(rule), style: {
                        background: 'none',
                        border: 'none',
                        color: '#63b3ed',
                        cursor: 'pointer',
                        fontSize: '12px',
                        padding: '4px 8px',
                        borderRadius: '4px',
                    }, children: "Edit" }), _jsx("button", { onClick: () => handleDeleteRule(rule.id), style: {
                        background: 'none',
                        border: 'none',
                        color: '#e53e3e',
                        cursor: 'pointer',
                        fontSize: '12px',
                        padding: '4px 8px',
                        borderRadius: '4px',
                    }, children: "Delete" })] });
div >
    { rule, : .description && ()
            < p, style = {} };
{
    fontSize: '12px',
        color;
    '#a0aec0',
        margin;
    '4px 0 8px 0',
    ;
}
 >
    { rule, : .description };
p >
;
_jsxs("div", { style: { fontSize: '12px', marginBottom: '4px' }, children: [_jsx("span", { style: { color: '#68d391', fontWeight: 500 }, children: "Find:" }), _jsx("code", { style: {
                background: '#1e2228',
                padding: '2px 4px',
                borderRadius: '2px',
                marginLeft: '4px',
            }, children: rule.findPattern })] })
    ,
        _jsxs("div", { style: { fontSize: '12px' }, children: [_jsx("span", { style: { color: '#63b3ed', fontWeight: 500 }, children: "Replace:" }), _jsx("code", { style: {
                        background: '#1e2228',
                        padding: '2px 4px',
                        borderRadius: '2px',
                        marginLeft: '4px',
                    }, children: rule.replaceWith })] });
div >
;
div >
    { filteredAndSortedRules, : .length === 0 && ()
            < div, style = {} };
{
    textAlign: 'center',
        padding;
    '40px',
        color;
    '#a0aec0',
    ;
}
 >
    _jsx("p", { children: "No correction rules found." });
{
    searchQuery && ()
        < p;
    style = {};
    {
        fontSize: '12px';
    }
}
 >
    Try;
adjusting;
your;
search;
or;
filter;
criteria.
;
p >
;
div >
;
div >
    { /* Add New Rule Section */}
    < div;
style = {};
{
    padding: '16px',
        borderTop;
    '1px solid #444',
        background;
    '#1e2228',
    ;
}
 >
    (_jsx("h3", { style: { fontSize: '14px', marginBottom: '12px', fontWeight: 600 }, children: "Add New Rule" })
        ,
            _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '8px' }, children: [_jsx("input", { type: "text", value: newRule.name, onChange: (e) => setNewRule(prev => ({ ...prev, name: e.target.value })), placeholder: "Rule name", style: {
                            padding: '8px',
                            background: '#2a2e37',
                            color: '#fff',
                            border: '1px solid #444',
                            borderRadius: '4px',
                            fontSize: '14px',
                        } }), _jsx("input", { type: "text", value: newRule.description, onChange: (e) => setNewRule(prev => ({ ...prev, description: e.target.value })), placeholder: "Description (optional)", style: {
                            padding: '8px',
                            background: '#2a2e37',
                            color: '#fff',
                            border: '1px solid #444',
                            borderRadius: '4px',
                            fontSize: '14px',
                        } }), _jsx("input", { type: "text", value: newRule.findPattern, onChange: (e) => setNewRule(prev => ({ ...prev, findPattern: e.target.value })), placeholder: "Find pattern", style: {
                            padding: '8px',
                            background: '#2a2e37',
                            color: '#fff',
                            border: '1px solid #444',
                            borderRadius: '4px',
                            fontSize: '14px',
                        } }), _jsx("input", { type: "text", value: newRule.replaceWith, onChange: (e) => setNewRule(prev => ({ ...prev, replaceWith: e.target.value })), placeholder: "Replace with", style: {
                            padding: '8px',
                            background: '#2a2e37',
                            color: '#fff',
                            border: '1px solid #444',
                            borderRadius: '4px',
                            fontSize: '14px',
                        } }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '12px' }, children: [_jsxs("label", { style: { display: 'flex', alignItems: 'center', fontSize: '14px' }, children: [_jsx("input", { type: "checkbox", checked: newRule.isRegex, onChange: (e) => setNewRule(prev => ({ ...prev, isRegex: e.target.checked })), style: { marginRight: '4px' } }), "Use regex"] }), _jsxs("label", { style: { display: 'flex', alignItems: 'center', fontSize: '14px' }, children: [_jsx("input", { type: "checkbox", checked: newRule.isActive, onChange: (e) => setNewRule(prev => ({ ...prev, isActive: e.target.checked })), style: { marginRight: '4px' } }), "Active"] })] }), _jsx("button", { onClick: handleAddRule, disabled: !newRule.name.trim() || !newRule.findPattern.trim(), style: {
                            background: newRule.name.trim() && newRule.findPattern.trim() ? '#38a169' : '#4a5568',
                            color: '#fff',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            cursor: newRule.name.trim() && newRule.findPattern.trim() ? 'pointer' : 'not-allowed',
                            fontSize: '14px',
                            fontWeight: 500,
                        }, children: "Add Rule" })] }));
div >
;
div >
;
{ /* Edit Rule Modal */ }
{
    editingRule && ()
        < div;
    style = {};
    {
        position: 'fixed',
            top;
        0,
            left;
        0,
            right;
        0,
            bottom;
        0,
            background;
        'rgba(0, 0, 0, 0.8)',
            display;
        'flex',
            alignItems;
        'center',
            justifyContent;
        'center',
            zIndex;
        1001,
        ;
    }
}
    >
        _jsxs("div", { style: {
                background: '#23272f',
                padding: '24px',
                borderRadius: '8px',
                width: isMobile ? '90%' : '400px',
                maxWidth: '90vw',
                maxHeight: '90vh',
                overflow: 'auto',
            }, children: [_jsx("h3", { style: { marginBottom: '16px', fontSize: '16px', fontWeight: 600 }, children: "Edit Rule" }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '12px' }, children: [_jsx("input", { type: "text", value: editingRule.name, onChange: (e) => setEditingRule(prev => prev ? ({ ...prev, name: e.target.value }) : null), placeholder: "Rule name", style: {
                                padding: '8px',
                                background: '#2a2e37',
                                color: '#fff',
                                border: '1px solid #444',
                                borderRadius: '4px',
                                fontSize: '14px',
                            } }), _jsx("input", { type: "text", value: editingRule.description || '', onChange: (e) => setEditingRule(prev => prev ? ({ ...prev, description: e.target.value }) : null), placeholder: "Description (optional)", style: {
                                padding: '8px',
                                background: '#2a2e37',
                                color: '#fff',
                                border: '1px solid #444',
                                borderRadius: '4px',
                                fontSize: '14px',
                            } }), _jsx("input", { type: "text", value: editingRule.findPattern, onChange: (e) => setEditingRule(prev => prev ? ({ ...prev, findPattern: e.target.value }) : null), placeholder: "Find pattern", style: {
                                padding: '8px',
                                background: '#2a2e37',
                                color: '#fff',
                                border: '1px solid #444',
                                borderRadius: '4px',
                                fontSize: '14px',
                            } }), _jsx("input", { type: "text", value: editingRule.replaceWith, onChange: (e) => setEditingRule(prev => prev ? ({ ...prev, replaceWith: e.target.value }) : null), placeholder: "Replace with", style: {
                                padding: '8px',
                                background: '#2a2e37',
                                color: '#fff',
                                border: '1px solid #444',
                                borderRadius: '4px',
                                fontSize: '14px',
                            } }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '12px' }, children: [_jsxs("label", { style: { display: 'flex', alignItems: 'center', fontSize: '14px' }, children: [_jsx("input", { type: "checkbox", checked: editingRule.isRegex, onChange: (e) => setEditingRule(prev => prev ? ({ ...prev, isRegex: e.target.checked }) : null), style: { marginRight: '4px' } }), "Use regex"] }), _jsxs("label", { style: { display: 'flex', alignItems: 'center', fontSize: '14px' }, children: [_jsx("input", { type: "checkbox", checked: editingRule.isActive, onChange: (e) => setEditingRule(prev => prev ? ({ ...prev, isActive: e.target.checked }) : null), style: { marginRight: '4px' } }), "Active"] })] }), _jsxs("div", { style: { display: 'flex', gap: '8px', marginTop: '16px' }, children: [_jsx("button", { onClick: () => handleUpdateRule(editingRule), style: {
                                        background: '#38a169',
                                        color: '#fff',
                                        border: 'none',
                                        padding: '8px 16px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        flex: 1,
                                        fontSize: '14px',
                                        fontWeight: 500,
                                    }, children: "Save" }), _jsx("button", { onClick: () => setEditingRule(null), style: {
                                        background: '#4a5568',
                                        color: '#fff',
                                        border: 'none',
                                        padding: '8px 16px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        flex: 1,
                                        fontSize: '14px',
                                        fontWeight: 500,
                                    }, children: "Cancel" })] })] })] });
div >
;
{ /* Workflow Manager */ }
_jsx(WorkflowManager, { isOpen: showWorkflow, onClose: () => setShowWorkflow(false) });
{ /* Notification System */ }
_jsx(NotificationSystem, { position: "top-right", maxVisible: 3, autoHideDuration: 5000 });
{ /* Statistics Dashboard */ }
_jsx(CorrectionsStatsDashboard, { isOpen: showStats, onClose: () => setShowStats(false) });
div >
;
;
;
