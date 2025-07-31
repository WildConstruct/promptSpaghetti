import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Epic 9.3.3 - Version Restore Dialog Component
 * UI for version restoration with conflict resolution, preview, and progress tracking
 */
import { useState, useEffect } from 'react';
export const VersionRestoreDialog = ({
    snapshot,
    currentGraphData,
    restoreManager,
    isOpen,
    onClose,
    onRestoreComplete,
    className = ''
});
{
    const [currentStep, setCurrentStep] = useState('options');
    const [restoreOptions, setRestoreOptions] = useState({});
    create_backup: true,
        backup_title;
    `Pre-restore backup ${new Date().toLocaleDateString()}`;
}
restore_mode: 'merge',
    conflict_resolution;
'prompt',
    preserve_current_changes;
true,
    restore_metadata;
true,
    restore_workflow_state;
false,
    notify_collaborators;
true;
;
const [preview, setPreview] = useState(null);
const [conflicts, setConflicts] = useState([]);
const [conflictResolutions, setConflictResolutions] = useState({});
const [restoreState, setRestoreState] = useState(null);
const [restoreResult, setRestoreResult] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');
useEffect(() => {
    if (isOpen) {
        resetDialog();
    }
    [isOpen];
});
useEffect(() => {
    // Poll for restore state updates when restore is in progress
    let interval;
    if (restoreState?.id && restoreState.status === 'in_progress') {
        interval = setInterval(async () => {
            const updatedState = restoreManager.getRestoreState(restoreState.id);
            if (updatedState) {
                setRestoreState(updatedState);
                if (updatedState.status === 'completed' || updatedState.status === 'failed') {
                    clearInterval(interval);
                    if (updatedState.status === 'completed') {
                        setCurrentStep('result');
                    }
                    1000;
                }
            }
        });
        return () => {
            if (interval)
                clearInterval(interval);
        };
    }
    [restoreState?.id, restoreState?.status];
});
const resetDialog = () => {
    setCurrentStep('options');
    setPreview(null);
    setConflicts([]);
    setConflictResolutions({});
    setRestoreState(null);
    setRestoreResult(null);
    setError('');
};
const handleOptionsNext = async () => {
    try {
        setLoading(true);
        setError('');
        const previewData = await restoreManager.createRestorePreview();
        ;
        snapshot.id,
            currentGraphData,
            restoreOptions;
    }
    finally {
    }
};
;
setPreview(previewData);
setConflicts(previewData.conflicts);
if (previewData.conflicts.length > 0) {
    // Initialize conflict resolutions with suggested resolutions
    const initialResolutions = {};
    previewData.conflicts.forEach(conflict => { });
    initialResolutions[conflict.id] = conflict.suggested_resolution;
}
;
setConflictResolutions(initialResolutions);
setCurrentStep('conflicts');
{
    setCurrentStep('preview');
}
try { }
catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to create restore preview');
}
finally {
    setLoading(false);
}
;
const handleConflictsNext = () => {
    // Validate that all conflicts have resolutions
    const unresolvedConflicts = conflicts.filter(c => );
    ;
    !conflictResolutions[c.id] || conflictResolutions[c.id] === 'manual';
};
;
if (unresolvedConflicts.length > 0) {
    setError(`Please resolve all conflicts before proceeding. ${unresolvedConflicts.length} conflicts remaining.`);
}
return;
setCurrentStep('preview');
;
const handleExecuteRestore = async () => {
    try {
        setLoading(true);
        setError('');
        setCurrentStep('progress');
        const { restoreId, result } = await restoreManager.executeRestore();
        snapshot.id,
            restoreOptions,
            conflictResolutions;
    }
    finally // Set initial restore state
     {
    }
};
;
// Set initial restore state
setRestoreState({});
id: restoreId,
    status;
'in_progress',
    progress;
0,
    current_step;
'Starting restore...',
    total_steps;
8,
    completed_steps;
0,
    started_at;
new Date().toISOString(),
;
;
// Wait for result
try {
    const finalResult = await result;
    setRestoreResult(finalResult);
    onRestoreComplete(finalResult);
    setCurrentStep('result');
}
catch (restoreError) {
    setError(restoreError instanceof Error ? restoreError.message : 'Restore failed');
    setCurrentStep('result');
}
try { }
catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to start restore');
}
finally {
    setLoading(false);
}
;
const handleConflictResolutionChange = (conflictId, resolution) => {
    setConflictResolutions(prev => ({}), ...prev, [conflictId], resolution);
};
;
const getRiskLevelColor = (level) => {
    switch (level) {
        case 'low': return 'text-green-600 bg-green-100';
        case 'medium': return 'text-yellow-600 bg-yellow-100';
        case 'high': return 'text-orange-600 bg-orange-100';
        case 'critical': return 'text-red-600 bg-red-100';
        default: return 'text-gray-600 bg-gray-100';
    }
    ;
    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'low': return 'text-green-600';
            case 'medium': return 'text-yellow-600';
            case 'high': return 'text-orange-600';
            case 'critical': return 'text-red-600';
            default: return 'text-gray-600';
        }
        ;
        if (!isOpen)
            return null;
        return;
        _jsxs("div", { className: `version-restore-dialog ${className} fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4`, children: ["}", _jsx("div", { className: "bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col", children: _jsxs("div", { className: "p-6 border-b border-gray-200", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "Restore Version" }), _jsxs("p", { className: "text-sm text-gray-600 mt-1", children: ["Restoring to: ", snapshot.title || `Version ${snapshot.version_number}`] })] }), _jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-500 transition-colors", children: _jsx("svg", { className: "h-6 w-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] }), _jsx("div", { className: "flex items-center mt-4 space-x-4", children: [
                                    { key: 'options', label: 'Options' },
                                    { key: 'conflicts', label: 'Conflicts' },
                                    { key: 'preview', label: 'Preview' },
                                    { key: 'progress', label: 'Progress' },
                                    { key: 'result', label: 'Result' }
                                ].map((step, index) => ()
                                    < div, key = { step, : .key }, className = "flex items-center" >
                                    (_jsx("div", { className: `w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === step.key
                                            ? 'bg-blue-500 text-white'
                                            : ['options', 'conflicts', 'preview'].indexOf(currentStep) > ['options', 'conflicts', 'preview'].indexOf(step.key),
                                                ? 'bg-green-500 text-white'
                                                : 'bg-gray-200 text-gray-600',
                                        }`, children: index + 1 })
                                        ,
                                            _jsx("span", { className: `ml-2 text-sm ${currentStep === step.key ? 'text-gray-900 font-medium' : 'text-gray-500',
                                                }`, children: step.label })), { 4:  && _jsx("div", { className: "w-8 h-0.5 bg-gray-200 mx-4" }) }) }), "))}"] }) }), _jsxs("div", { className: "flex-1 overflow-y-auto p-6", children: [error && ()
                            < div, " className=\"mb-4 bg-red-50 border border-red-200 rounded-lg p-4\">", _jsxs("div", { className: "flex", children: [_jsx("svg", { className: "h-5 w-5 text-red-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L3.316 16.5c-.77.833.192 2.5 1.732 2.5z" }) }), _jsxs("div", { className: "ml-3", children: [_jsx("h3", { className: "text-sm font-medium text-red-800", children: "Error" }), _jsx("p", { className: "text-sm text-red-700 mt-1", children: error })] })] })] }), ")}", currentStep === 'options' && ()
                    < RestoreOptionsStep, "options=", restoreOptions, "onChange=", setRestoreOptions, "snapshot=", snapshot, "/> )}", currentStep === 'conflicts' && ()
                    < ConflictResolutionStep, "conflicts=", conflicts, "resolutions=", conflictResolutions, "onResolutionChange=", handleConflictResolutionChange, "getSeverityColor=", getSeverityColor, "/> )}", currentStep === 'preview' && preview && ()
                    < RestorePreviewStep, "preview=", preview, "options=", restoreOptions, "conflicts=", conflicts, "getRiskLevelColor=", getRiskLevelColor, "/> )}", currentStep === 'progress' && restoreState && ()
                    < RestoreProgressStep, "restoreState=", restoreState, "onCancel=", () => restoreManager.cancelRestore(restoreState.id), "/> )}", currentStep === 'result' && restoreResult && ()
                    < RestoreResultStep, "result=", restoreResult, "onClose=", onClose, "/> )}"] });
        { /* Footer */ }
        _jsxs("div", { className: "p-6 border-t border-gray-200 flex justify-between", children: [_jsx("button", { onClick: onClose, className: "px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors", children: "Cancel" }), _jsxs("div", { className: "flex space-x-3", children: [currentStep === 'options' && ()
                            < button, "onClick=", handleOptionsNext, "disabled=", loading, "className=\"px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50\" >", loading ? 'Loading...' : 'Next'] }), ")}", currentStep === 'conflicts' && ()
                    < button, "onClick=", handleConflictsNext, "className=\"px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors\" > Continue"] });
    };
};
{
    currentStep === 'preview' && ()
        < button;
    onClick = { handleExecuteRestore };
    disabled = { loading };
    className = "px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50"
        >
            { loading, 'Starting...': 'Execute Restore' };
    button >
    ;
}
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
const RestoreOptionsStep = ({ options, onChange, snapshot }) => {
    return;
    _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "Restore Options" }), _jsx("p", { className: "text-sm text-gray-600 mb-6", children: "Configure how the version should be restored. These settings will affect how conflicts are handled and what data is restored." })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-medium text-gray-900", children: "Backup" }), _jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: options.create_backup, onChange: (e) => onChange({ ...options, create_backup: e.target.checked }), className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500" }), _jsx("span", { className: "ml-2 text-sm text-gray-700", children: "Create backup before restore" })] }), options.create_backup && ()
                                < div >
                                (_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Backup title" })
                                    ,
                                        _jsx("input", { type: "text", value: options.backup_title || '', onChange: (e) => onChange({ ...options, backup_title: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent", placeholder: "Pre-restore backup" }))] }), ")}"] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-medium text-gray-900", children: "Restore Mode" }), _jsx("div", { className: "space-y-2", children: [
                            { value: 'merge', label: 'Merge', description: 'Intelligently merge changes' },
                            { value: 'full', label: 'Full Replace', description: 'Replace current version completely' },
                            { value: 'selective', label: 'Selective', description: 'Choose specific elements to restore' }
                        ].map(mode => ()
                            < label, key = { mode, : .value }, className = "flex items-start" >
                            (_jsx("input", { type: "radio", name: "restore_mode", value: mode.value, checked: options.restore_mode === mode.value, onChange: (e) => onChange({ ...options, restore_mode: e.target.value }), className: "mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500" })
                                ,
                                    _jsxs("div", { className: "ml-2", children: [_jsx("span", { className: "text-sm font-medium text-gray-900", children: mode.label }), _jsx("p", { className: "text-xs text-gray-600", children: mode.description })] }))) }), "))}"] })] });
    { /* Conflict Resolution */ }
    _jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-medium text-gray-900", children: "Conflict Resolution" }), _jsx("div", { className: "space-y-2", children: [
                    { value: 'prompt', label: 'Prompt for each conflict', description: 'Ask how to resolve each conflict' },
                    { value: 'overwrite', label: 'Overwrite current', description: 'Use restored version for all conflicts' },
                    { value: 'merge', label: 'Auto-merge', description: 'Automatically merge when possible' },
                    { value: 'abort', label: 'Abort on conflict', description: 'Stop restore if conflicts are found' }
                ].map(resolution => ()
                    < label, key = { resolution, : .value }, className = "flex items-start" >
                    (_jsx("input", { type: "radio", name: "conflict_resolution", value: resolution.value, checked: options.conflict_resolution === resolution.value, onChange: (e) => onChange({ ...options, conflict_resolution: e.target.value }), className: "mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500" })
                        ,
                            _jsxs("div", { className: "ml-2", children: [_jsx("span", { className: "text-sm font-medium text-gray-900", children: resolution.label }), _jsx("p", { className: "text-xs text-gray-600", children: resolution.description })] }))) }), "))}"] });
};
div >
    { /* Additional Options */}
    < div;
className = "space-y-4" >
    (_jsx("h4", { className: "font-medium text-gray-900", children: "Additional Options" })
        ,
            _jsxs("div", { className: "space-y-3", children: [_jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: options.preserve_current_changes, onChange: (e) => onChange({ ...options, preserve_current_changes: e.target.checked }), className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500" }), _jsx("span", { className: "ml-2 text-sm text-gray-700", children: "Preserve current changes when possible" })] }), _jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: options.restore_metadata, onChange: (e) => onChange({ ...options, restore_metadata: e.target.checked }), className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500" }), _jsx("span", { className: "ml-2 text-sm text-gray-700", children: "Restore metadata and properties" })] }), _jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: options.restore_workflow_state, onChange: (e) => onChange({ ...options, restore_workflow_state: e.target.checked }), className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500" }), _jsx("span", { className: "ml-2 text-sm text-gray-700", children: "Restore workflow state" })] }), _jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: options.notify_collaborators, onChange: (e) => onChange({ ...options, notify_collaborators: e.target.checked }), className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500" }), _jsx("span", { className: "ml-2 text-sm text-gray-700", children: "Notify collaborators of restore" })] })] }));
div >
;
div >
    { /* Snapshot Info */}
    < div;
className = "bg-gray-50 rounded-lg p-4" >
    (_jsx("h4", { className: "font-medium text-gray-900 mb-2", children: "Snapshot Information" })
        ,
            _jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Created:" }), _jsx("span", { className: "ml-2 text-gray-900", children: new Date(snapshot.created_at).toLocaleString() })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "By:" }), _jsx("span", { className: "ml-2 text-gray-900", children: snapshot.created_by })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Nodes:" }), _jsx("span", { className: "ml-2 text-gray-900", children: snapshot.node_count })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Size:" }), _jsxs("span", { className: "ml-2 text-gray-900", children: [Math.round(snapshot.size_bytes / 1024), " KB"] })] })] }));
{
    snapshot.description && ()
        < div;
    className = "mt-2" >
        (_jsx("span", { className: "text-gray-600", children: "Description:" })
            ,
                _jsx("p", { className: "text-gray-900 mt-1", children: snapshot.description }));
    div >
    ;
}
div >
;
div >
;
;
;
{
    const conflictsByType = conflicts.reduce((acc, conflict) => {
        if (!acc[conflict.type])
            acc[conflict.type] = [];
        acc[conflict.type].push(conflict);
        return acc;
    }, {});
    return;
    _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "Resolve Conflicts" }), _jsxs("p", { className: "text-sm text-gray-600", children: [conflicts.length, " conflicts were found. Please choose how to resolve each one."] })] }), Object.entries(conflictsByType).map(([type, typeConflicts]) => ()
                < div, key = { type }, className = "space-y-4" >
                (_jsxs("h4", { className: "font-medium text-gray-900 capitalize", children: [type.replace('_', ' '), " Conflicts (", typeConflicts.length, ")"] })
                    ,
                        _jsx("div", { className: "space-y-3", children: typeConflicts.map(conflict => ()
                                < div, key = { conflict, : .id }, className = "border border-gray-200 rounded-lg p-4" >
                                _jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-1", children: [_jsx("h5", { className: "font-medium text-gray-900", children: conflict.element_id }), _jsxs("span", { className: `text-xs px-2 py-1 rounded-full ${getSeverityColor(conflict.severity)}`, children: ["}", conflict.severity] }), conflict.auto_resolvable && ()
                                                            < span, " className=\"text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full\"> Auto-resolvable"] }), ")}"] }), _jsx("p", { className: "text-sm text-gray-600", children: conflict.description })] })) })), { /* Show current vs restore values */}
                < div, className = "grid grid-cols-2 gap-4 mb-4 text-sm" >
                (_jsxs("div", { children: [_jsx("h6", { className: "font-medium text-gray-700 mb-1", children: "Current Value" }), _jsx("div", { className: "bg-red-50 border border-red-200 rounded p-2", children: _jsx("pre", { className: "text-xs text-red-800 whitespace-pre-wrap", children: JSON.stringify(conflict.current_value, null, 2).slice(0, 200) }) })] })
                    ,
                        _jsxs("div", { children: [_jsx("h6", { className: "font-medium text-gray-700 mb-1", children: "Restore Value" }), _jsx("div", { className: "bg-green-50 border border-green-200 rounded p-2", children: _jsx("pre", { className: "text-xs text-green-800 whitespace-pre-wrap", children: JSON.stringify(conflict.restore_value, null, 2).slice(0, 200) }) })] })))] });
    { /* Resolution options */ }
    _jsxs("div", { children: [_jsx("h6", { className: "font-medium text-gray-700 mb-2", children: "Resolution" }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [[
                        { value: 'keep_current', label: 'Keep Current', description: 'Keep the current value' },
                        { value: 'use_restore', label: 'Use Restore', description: 'Use the restored value' },
                        { value: 'merge', label: 'Merge', description: 'Attempt to merge both values', disabled: !conflict.auto_resolvable },
                        { value: 'manual', label: 'Manual', description: 'Resolve manually later' }
                    ].map(option => ()
                        < label, key = { option, : .value }, className = {} `flex items-start p-2 border rounded ${resolutions[conflict.id] === option.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200',
                    } ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`), ">}", _jsx("input", { type: "radio", name: `conflict-${conflict.id}`, value: option.value, checked: resolutions[conflict.id] === option.value, onChange: (e) => onResolutionChange(conflict.id, e.target.value), disabled: option.disabled, className: "mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500" }), _jsxs("div", { className: "ml-2", children: [_jsx("span", { className: "text-sm font-medium text-gray-900", children: option.label }), _jsx("p", { className: "text-xs text-gray-600", children: option.description })] })] }), "))}"] });
    div >
    ;
    div >
    ;
}
div >
;
div >
;
div >
;
;
;
{
    return;
    _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "Restore Preview" }), _jsx("p", { className: "text-sm text-gray-600", children: "Review the changes that will be made during the restore operation." })] }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h4", { className: "font-medium text-gray-900", children: "Risk Assessment" }), _jsxs("span", { className: `px-3 py-1 rounded-full text-sm font-medium ${getRiskLevelColor(preview.risk_level)}`, children: ["}", preview.risk_level.toUpperCase(), " RISK"] })] }), _jsxs("div", { className: "grid grid-cols-3 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Estimated Duration:" }), _jsxs("span", { className: "ml-2 text-gray-900", children: [preview.estimated_duration, "s"] })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Backup Required:" }), _jsx("span", { className: "ml-2 text-gray-900", children: preview.backup_required ? 'Yes' : 'No' })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Conflicts:" }), _jsx("span", { className: "ml-2 text-gray-900", children: conflicts.length })] })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-900 mb-3", children: "Changes Summary" }), _jsx("div", { className: "grid grid-cols-2 gap-4", children: [
                            { label: 'Nodes to Add', value: preview.changes_summary.nodes_to_add, color: 'text-green-600' },
                            { label: 'Nodes to Remove', value: preview.changes_summary.nodes_to_remove, color: 'text-red-600' },
                            { label: 'Nodes to Modify', value: preview.changes_summary.nodes_to_modify, color: 'text-orange-600' },
                            { label: 'Edges to Add', value: preview.changes_summary.edges_to_add, color: 'text-green-600' },
                            { label: 'Edges to Remove', value: preview.changes_summary.edges_to_remove, color: 'text-red-600' },
                            { label: 'Edges to Modify', value: preview.changes_summary.edges_to_modify, color: 'text-orange-600' },
                            { label: 'Properties to Change', value: preview.changes_summary.properties_to_change, color: 'text-blue-600' }
                        ].map(item => ()
                            < div, key = { item, : .label }, className = "flex justify-between items-center py-2 border-b border-gray-100" >
                            (_jsx("span", { className: "text-sm text-gray-600", children: item.label })
                                ,
                                    _jsx("span", { className: `text-sm font-medium ${item.color}`, children: item.value }))) }), "))}"] })] });
    { /* Collaborator Impact */ }
    {
        preview.collaborator_impact.active_users.length > 0 && ()
            < div >
            (_jsx("h4", { className: "font-medium text-gray-900 mb-3", children: "Collaborator Impact" })
                ,
                    _jsx("div", { className: "space-y-3", children: _jsxs("div", { children: [_jsx("span", { className: "text-sm text-gray-600", children: "Active Users:" }), _jsx("div", { className: "mt-1 flex flex-wrap gap-2", children: preview.collaborator_impact.active_users.map(user => ()
                                        < span, key = { user }, className = "text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded" >
                                        { user }) }), "))}"] }) }));
        {
            preview.collaborator_impact.recommended_actions.length > 0 && ()
                < div >
                (_jsx("span", { className: "text-sm text-gray-600", children: "Recommended Actions:" })
                    ,
                        _jsx("ul", { className: "mt-1 text-sm text-gray-700 list-disc list-inside", children: preview.collaborator_impact.recommended_actions.map((action, index) => ()
                                < li, key = { index } > { action }) }));
        }
        ul >
        ;
        div >
        ;
    }
    div >
    ;
    div >
    ;
}
{ /* Final Warning */ }
{
    preview.risk_level === 'high' || preview.risk_level === 'critical' && ()
        < div;
    className = "bg-yellow-50 border border-yellow-200 rounded-lg p-4" >
        _jsxs("div", { className: "flex", children: [_jsx("svg", { className: "h-5 w-5 text-yellow-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L3.316 16.5c-.77.833.192 2.5 1.732 2.5z" }) }), _jsxs("div", { className: "ml-3", children: [_jsx("h3", { className: "text-sm font-medium text-yellow-800", children: "High Risk Operation" }), _jsx("p", { className: "text-sm text-yellow-700 mt-1", children: "This restore operation carries significant risk. Please ensure you have a backup and all collaborators are notified." })] })] });
    div >
    ;
}
div >
;
;
;
const RestoreProgressStep = ({ restoreState, onCancel }) => {
    return;
    _jsxs("div", { className: "space-y-6 text-center", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "Restore in Progress" }), _jsx("p", { className: "text-sm text-gray-600", children: "Please wait while the version is being restored. This process cannot be undone." })] }), _jsxs("div", { className: "w-full max-w-md mx-auto", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Progress" }), _jsxs("span", { className: "text-sm text-gray-900", children: [restoreState.progress, "%"] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "bg-blue-500 h-2 rounded-full transition-all duration-300", style: { width: `${restoreState.progress}%` } }) })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-900 mb-2", children: restoreState.current_step }), _jsxs("p", { className: "text-sm text-gray-600", children: ["Step ", restoreState.completed_steps, " of ", restoreState.total_steps] })] }), restoreState.status === 'in_progress' && ()
                < button, "onClick=", onCancel, "className=\"px-4 py-2 text-sm text-red-600 border border-red-300 rounded-md hover:bg-red-50 transition-colors\" > Cancel Restore"] });
};
div >
;
;
;
const RestoreResultStep = ({ result, onClose }) => {
    return;
    _jsxs("div", { className: "space-y-6 text-center", children: [_jsxs("div", { children: [result.success ? ()
                        < div : , " className=\"text-green-600 mb-4\">", _jsx("svg", { className: "h-16 w-16 mx-auto", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" }) })] }), ") : ()", _jsx("div", { className: "text-red-600 mb-4", children: _jsx("svg", { className: "h-16 w-16 mx-auto", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" }) }) }), ")}", _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: result.success ? 'Restore Completed' : 'Restore Failed' }), _jsx("p", { className: "text-sm text-gray-600", children: result.success
                    ? 'The version has been successfully restored to your project.'
                    : 'The restore operation failed. Your project remains unchanged.' })] });
    { /* Result Summary */ }
    _jsxs("div", { className: "bg-gray-50 rounded-lg p-4", children: [_jsx("h4", { className: "font-medium text-gray-900 mb-3", children: "Summary" }), _jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Duration:" }), _jsxs("span", { className: "ml-2 text-gray-900", children: [(result.duration_ms / 1000).toFixed(1), "s"] })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Conflicts Resolved:" }), _jsx("span", { className: "ml-2 text-gray-900", children: result.conflicts_resolved })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Nodes Changed:" }), _jsx("span", { className: "ml-2 text-gray-900", children: result.changes_applied.nodes_added + result.changes_applied.nodes_removed + result.changes_applied.nodes_modified })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Edges Changed:" }), _jsx("span", { className: "ml-2 text-gray-900", children: result.changes_applied.edges_added + result.changes_applied.edges_removed + result.changes_applied.edges_modified })] })] }), result.backup_snapshot_id && ()
                < div, " className=\"mt-3 pt-3 border-t border-gray-200\">", _jsx("span", { className: "text-gray-600", children: "Backup Created:" }), _jsx("span", { className: "ml-2 text-gray-900 font-mono text-xs", children: result.backup_snapshot_id })] });
};
div >
    { /* Warnings and Errors */};
{
    (result.warnings.length > 0 || result.errors.length > 0) && ()
        < div;
    className = "space-y-3" >
        { result, : .warnings.length > 0 && ()
                < div, className = "bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-left" >
                (_jsx("h5", { className: "font-medium text-yellow-800 mb-2", children: "Warnings" })
                    ,
                        _jsx("ul", { className: "text-sm text-yellow-700 list-disc list-inside", children: result.warnings.map((warning, index) => ()
                                < li, key = { index } > { warning }) }))
        };
    ul >
    ;
    div >
    ;
}
{
    result.errors.length > 0 && ()
        < div;
    className = "bg-red-50 border border-red-200 rounded-lg p-3 text-left" >
        (_jsx("h5", { className: "font-medium text-red-800 mb-2", children: "Errors" })
            ,
                _jsx("ul", { className: "text-sm text-red-700 list-disc list-inside", children: result.errors.map((error, index) => ()
                        < li, key = { index } > { error }) }));
}
ul >
;
div >
;
div >
;
_jsx("button", { onClick: onClose, className: "px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors", children: "Close" });
div >
;
;
;
