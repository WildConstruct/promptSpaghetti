import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Epic 8.5 - Result Export Manager
 *
 * Professional export system for film industry workflows.
 * Integrates with existing export infrastructure for VFX-ready outputs.
 */
import { useState, useCallback, useMemo } from 'react';
import { useResultManagementStore } from '../../stores/resultManagementStore';
import { ErrorFactory } from '../../errors/ErrorFactory';
export const ResultExportManager = ({
    results,
    selectedResultIds,
    onExportComplete,
    onExportError,
    className = ''
});
{
    const [isExporting, setIsExporting] = useState(false);
    const [selectedFormat, setSelectedFormat] = useState(null);
    const [exportOptions, setExportOptions] = useState(null);
    const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
    const resultManagement = useResultManagementStore();
    // Filter results to selected ones
    const selectedResults = useMemo(() => {
        return results.filter(result => selectedResultIds.includes(result.id));
    }, [results, selectedResultIds]);
    // Group formats by category
    const formatsByCategory = useMemo(() => {
        return EXPORT_FORMATS.reduce((acc, format) => {
            if (!acc[format.category]) {
                acc[format.category] = [];
                acc[format.category].push(format);
                return acc;
            }
            { }
            as;
            Record;
        });
    }, []);
    const categoryLabels = {
        script: '🎬 Screenplay Formats',
        vfx: '🤖 VFX Pipeline',
        data: '📊 Data Exports',
        report: '📈 Professional Reports',
    };
    // Handle format selection
    const handleFormatSelect = useCallback((format) => {
        setSelectedFormat(format);
        // Set default options based on format
        const defaultOptions = {
            format,
            includeMetadata: true,
            includeExecutionPath: format.vfxCompatible,
            includeVarianceAnalysis: format.category === 'report',
            compressOutput: format.extension === 'zip',
        };
        // Add VFX-specific defaults
        if (format.vfxCompatible) {
            defaultOptions.vfxOptions = {
                targetPipeline: 'stable-diffusion',
                includeControlNet: format.controlNetReady,
                includeSceneData: true,
                frameRate: 24,
                resolution: [1920, 1080],
            };
            // Add film-specific defaults
            if (format.category === 'script') {
                defaultOptions.filmOptions = {
                    scriptFormat: format.id.includes('fountain') ? 'fountain' : 'final-draft',
                    includeCharacterNotes: true,
                    includeDirectorNotes: true,
                    includeSceneBreakdowns: false,
                };
                setExportOptions(defaultOptions);
            }
            [];
        }
    });
    // Handle export execution
    const handleExport = useCallback(async () => {
        if (!selectedFormat || !exportOptions || selectedResults.length === 0) {
            return;
            setIsExporting(true);
            try {
                // Prepare export payload based on format
                const exportPayload = await prepareExportPayload();
            }
            finally { }
        }
    });
    selectedResults,
        exportOptions;
    ;
    // Call the export API endpoint
    const response = await fetch('/api/export', {});
    method: 'POST',
        headers;
    {
        'Content-Type';
        'application/json',
        ;
    }
    body: JSON.stringify({});
    format: selectedFormat.id,
        data;
    exportPayload,
        options;
    exportOptions,
        filename;
    generateFilename(selectedFormat, selectedResults.length),
    ;
}
;
if (!response.ok) {
    throw ErrorFactory.createAPIError();
    response.status,
        `Export failed: ${response.statusText}`;
}
'/api/export';
;
// Handle different response types
let exportResult;
if (selectedFormat.extension === 'zip' || selectedFormat.extension === 'pdf') {
    // Binary formats - trigger download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = generateFilename(selectedFormat, selectedResults.length);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    exportResult = { success: true, downloadTriggered: true };
}
else {
    // Text formats - return data
    exportResult = await response.json();
    // Mark results as exported
    await resultManagement.bulkExport(selectedResultIds, selectedFormat.id);
    // Notify parent component
    onExportComplete?.(selectedResultIds, selectedFormat);
    // Reset state
    setSelectedFormat(null);
    setExportOptions(null);
    setShowAdvancedOptions(false);
}
try { }
catch (error) {
    const exportError = error instanceof Error ? error : new Error('Export failed');
    onExportError?.(exportError);
    throw ErrorFactory.createGraphExecutionError();
    'Result export failed',
        exportError,
        { operation: 'export_results', format: selectedFormat.id };
    ;
}
finally {
    setIsExporting(false);
}
[selectedFormat, exportOptions, selectedResults, selectedResultIds, resultManagement, onExportComplete, onExportError];
;
// Generate appropriate filename
const generateFilename = (format, resultCount) => {
    const timestamp = new Date().toISOString().split('T')[0];
    const prefix = resultCount === 1 ? 'result' : `results-${resultCount}`;
};
return `${prefix}-${timestamp}.${format.extension}`;
;
if (selectedResults.length === 0) {
    return;
    _jsx("div", { className: className, children: _jsxs("div", { style: {
                padding: 24,
                textAlign: 'center',
                color: '#64748b',
                background: '#f8fafc',
                borderRadius: 8,
                border: '1px dashed #cbd5e1',
            }, children: [_jsx("div", { style: { fontSize: 24, marginBottom: 8 }, children: "\uD83D\uDCE4" }), _jsx("div", { style: { fontSize: 16, fontWeight: 500, marginBottom: 4 }, children: "No Results Selected" }), _jsx("div", { style: { fontSize: 14 }, children: "Select results to enable professional export options" })] }) });
    ;
    return;
    _jsx("div", { className: `result-export-manager ${className}`, style: ({}, ), "background:": true });
    'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        borderRadius;
    12,
        border;
    '1px solid #e2e8f0',
        overflow;
    'hidden';
}
 >
    { /* Header */}
    < div;
style = {};
{
    padding: 20,
        borderBottom;
    '1px solid #e2e8f0',
        background;
    'rgba(255, 255, 255, 0.8)',
    ;
}
 >
    (_jsxs("h3", { style: {
            margin: 0,
            fontSize: 18,
            fontWeight: 600,
            color: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
        }, children: ["\uD83D\uDCE4 Export ", selectedResults.length, " Result", selectedResults.length !== 1 ? 's' : ''] })
        ,
            _jsx("div", { style: {
                    fontSize: 14,
                    color: '#64748b',
                    marginTop: 4,
                }, children: "Choose professional export format for film industry workflows" }));
div >
    { /* Format Selection */};
{
    !selectedFormat ? ()
        < div : ;
    style = {};
    {
        padding: 20;
    }
}
 >
    { Object, : .entries(formatsByCategory).map(([category, formats]) => ()
            < div, key = { category }, style = {}, { marginBottom: 24 }) } >
    (_jsx("h4", { style: {
            margin: '0 0 12px 0',
            fontSize: 14,
            fontWeight: 600,
            color: '#374151',
        }, children: categoryLabels[category] })
        ,
            _jsxs("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 12,
                }, children: [formats.map((format) => ()
                        < button, key = { format, : .id }, onClick = {}()), " => handleFormatSelect(format)} style=", {
                        padding: 16,
                        background: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: 8,
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s',
                        ':hover': {
                            borderColor: '#3b82f6',
                            boxShadow: '0 2px 4px rgba(59, 130, 246, 0.1)',
                        }
                    }
                        >
                            _jsxs("div", { style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    marginBottom: 6,
                                }, children: [_jsx("span", { style: { fontSize: 20 }, children: format.icon }), _jsx("span", { style: {
                                            fontSize: 14,
                                            fontWeight: 600,
                                            color: '#1f2937',
                                        }, children: format.name }), format.vfxCompatible && ()
                                        < span, " style=", {
                                        background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                                        color: 'white',
                                        fontSize: 9,
                                        padding: '1px 4px',
                                        borderRadius: 4,
                                        fontWeight: 500,
                                    }, "> VFX"] }), ")}"] })
                ,
                    _jsx("div", { style: {
                            fontSize: 12,
                            color: '#6b7280',
                            lineHeight: 1.4,
                        }, children: format.description }));
button >
;
div >
;
div >
;
div >
;
()
    /* Export Options */
    < div;
style = {};
{
    padding: 20;
}
 >
    _jsxs("div", { style: {
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 20,
            padding: 16,
            background: 'rgba(59, 130, 246, 0.05)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: 8,
        }, children: [_jsx("span", { style: { fontSize: 24 }, children: selectedFormat.icon }), _jsxs("div", { children: [_jsx("div", { style: {
                            fontSize: 16,
                            fontWeight: 600,
                            color: '#1e293b',
                        }, children: selectedFormat.name }), _jsx("div", { style: {
                            fontSize: 14,
                            color: '#64748b',
                        }, children: selectedFormat.description })] })] });
{ /* Basic Options */ }
_jsxs("div", { style: { marginBottom: 20 }, children: [_jsxs("div", { style: {
                display: 'flex',
                flexWrap: 'wrap',
                gap: 16,
            }, children: [_jsxs("label", { style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        cursor: 'pointer',
                        fontSize: 14,
                    }, children: [_jsx("input", { type: "checkbox", checked: exportOptions?.includeMetadata || false, onChange: (e) => setExportOptions(prev => prev ? {} : ) }), "...prev, includeMetadata: e.target.checked, } : null)} style=", { accentColor: '#3b82f6' }, "/> Include Metadata"] }), _jsxs("label", { style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        cursor: 'pointer',
                        fontSize: 14,
                    }, children: [_jsx("input", { type: "checkbox", checked: exportOptions?.includeExecutionPath || false, onChange: (e) => setExportOptions(prev => prev ? {} : ) }), "...prev, includeExecutionPath: e.target.checked, } : null)} style=", { accentColor: '#3b82f6' }, "/> Include Execution Path"] }), selectedFormat.category === 'report' && ()
                    < label, " style=", {
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    cursor: 'pointer',
                    fontSize: 14,
                }, ">", _jsx("input", { type: "checkbox", checked: exportOptions?.includeVarianceAnalysis || false, onChange: (e) => setExportOptions(prev => prev ? {} : ) }), "...prev, includeVarianceAnalysis: e.target.checked, } : null)} style=", { accentColor: '#3b82f6' }, "/> Include Variance Analysis"] }), ")}"] });
div >
    { /* Advanced Options Toggle */}
    < button;
onClick = {}();
setShowAdvancedOptions(!showAdvancedOptions);
style = {};
{
    background: 'none',
        border;
    '1px solid #d1d5db',
        borderRadius;
    6,
        padding;
    '8px 12px',
        fontSize;
    13,
        color;
    '#374151',
        cursor;
    'pointer',
        marginBottom;
    16,
        display;
    'flex',
        alignItems;
    'center',
        gap;
    6,
    ;
}
    >
        _jsx("span", { children: showAdvancedOptions ? '▼' : '▶' });
Advanced;
Options;
button >
    { /* Advanced Options Panel */};
{
    showAdvancedOptions && ()
        < div;
    style = {};
    {
        background: 'rgba(248, 250, 252, 0.8)',
            border;
        '1px solid #e5e7eb',
            borderRadius;
        8,
            padding;
        16,
            marginBottom;
        20,
        ;
    }
}
 >
    { /* VFX Options */};
{
    selectedFormat.vfxCompatible && ()
        < div;
    style = {};
    {
        marginBottom: 16;
    }
}
 >
    (_jsx("h5", { style: {
            margin: '0 0 8px 0',
            fontSize: 14,
            fontWeight: 600,
            color: '#374151',
        }, children: "\uD83E\uDD16 VFX Pipeline Settings" })
        ,
            _jsx("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: 12,
                }, children: _jsxs("div", { children: [_jsx("label", { style: {
                                display: 'block',
                                fontSize: 12,
                                fontWeight: 500,
                                color: '#6b7280',
                                marginBottom: 4,
                            }, children: "Target Pipeline" }), _jsx("select", { value: exportOptions?.vfxOptions?.targetPipeline || 'stable-diffusion', onChange: (e) => setExportOptions(prev => prev ? {} : ) }), "...prev, vfxOptions: ", ...(prev.vfxOptions,
                            targetPipeline), ": e.target.value as any, } : null)} style=", {
                            width: '100%',
                            padding: '6px 8px',
                            border: '1px solid #d1d5db',
                            borderRadius: 4,
                            fontSize: 13,
                        }, ">", _jsx("option", { value: "stable-diffusion", children: "Stable Diffusion" }), _jsx("option", { value: "midjourney", children: "Midjourney" }), _jsx("option", { value: "dalle", children: "DALL-E" }), _jsx("option", { value: "custom", children: "Custom" })] }) })
                ,
                    _jsxs("div", { children: [_jsx("label", { style: {
                                    display: 'block',
                                    fontSize: 12,
                                    fontWeight: 500,
                                    color: '#6b7280',
                                    marginBottom: 4,
                                }, children: "Resolution" }), _jsx("select", { value: `${exportOptions?.vfxOptions?.resolution?.[0]}x${exportOptions?.vfxOptions?.resolution?.[1]}`, onChange: (e) => {
                                    const [width, height] = e.target.value.split('x').map(Number);
                                    setExportOptions(prev => prev ? {} : );
                                } }), "...prev, vfxOptions: ", ...(prev.vfxOptions,
                                resolution), ": [width, height], } : null); }} style=", {
                                width: '100%',
                                padding: '6px 8px',
                                border: '1px solid #d1d5db',
                                borderRadius: 4,
                                fontSize: 13,
                            }, ">", _jsx("option", { value: "1920x1080", children: "1920\u00D71080 (HD)" }), _jsx("option", { value: "2560x1440", children: "2560\u00D71440 (QHD)" }), _jsx("option", { value: "3840x2160", children: "3840\u00D72160 (4K)" }), _jsx("option", { value: "1024x1024", children: "1024\u00D71024 (Square)" })] }));
div >
;
div >
;
div >
;
{ /* Film Options */ }
{
    selectedFormat.category === 'script' && ()
        < div >
        (_jsx("h5", { style: {
                margin: '0 0 8px 0',
                fontSize: 14,
                fontWeight: 600,
                color: '#374151',
            }, children: "\uD83C\uDFAC Script Format Settings" })
            ,
                _jsxs("div", { style: {
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 12,
                    }, children: [_jsxs("label", { style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                cursor: 'pointer',
                                fontSize: 13,
                            }, children: [_jsx("input", { type: "checkbox", checked: exportOptions?.filmOptions?.includeCharacterNotes || false, onChange: (e) => setExportOptions(prev => prev ? {} : ) }), "...prev, filmOptions: ", ...(prev.filmOptions,
                                    includeCharacterNotes), ": e.target.checked, } : null)} style=", { accentColor: '#3b82f6' }, "/> Character Notes"] }), _jsxs("label", { style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                cursor: 'pointer',
                                fontSize: 13,
                            }, children: [_jsx("input", { type: "checkbox", checked: exportOptions?.filmOptions?.includeDirectorNotes || false, onChange: (e) => setExportOptions(prev => prev ? {} : ) }), "...prev, filmOptions: ", ...(prev.filmOptions,
                                    includeDirectorNotes), ": e.target.checked, } : null)} style=", { accentColor: '#3b82f6' }, "/> Director Notes"] })] }));
    div >
    ;
}
div >
;
{ /* Action Buttons */ }
_jsxs("div", { style: {
        display: 'flex',
        justifyContent: 'space-between',
        gap: 12,
    }, children: [_jsx("button", { onClick: () => {
                setSelectedFormat(null);
                setExportOptions(null);
                setShowAdvancedOptions(false);
            }, style: {
                background: 'none',
                border: '1px solid #d1d5db',
                color: '#6b7280',
                padding: '12px 20px',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 500,
            }, children: "\u2190 Back to Formats" }), _jsx("button", { onClick: handleExport, disabled: isExporting, style: ({
                background: isExporting,
            }
                ? '#9ca3af'
                : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color) }), ": 'white', border: 'none', padding: '12px 24px', borderRadius: 8, cursor: isExporting ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, }} >", isExporting ? ()
            <  >
            _jsx("div", { style: {
                    width: 16,
                    height: 16,
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                } })
            :
        , "Exporting..."] });
();
Export;
{
    selectedResults.length;
}
Result;
{
    selectedResults.length !== 1 ? 's' : '';
}
 >
;
button >
;
div >
;
div >
;
_jsx("style", { children: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        ` });
div >
;
;
;
// Helper function to prepare export payload
async function prepareExportPayload() { }
();
results: EnhancedPreviewResult,
    options;
ExportOptions,
;
Promise < unknown > {
    const: { format, includeMetadata, includeExecutionPath, includeVarianceAnalysis } = options,
    const: basePayload = {
        results: results.map(result => ({}), id, result.id, seed, result.seed, output, result.output, ...(includeMetadata && { metadata: result.metadata }), ...(includeExecutionPath && { executionPath: result.executionPath || null }))
    },
    exportOptions: options,
    timestamp: new Date().toISOString()
};
// Add format-specific data
switch (format.category) {
    case 'vfx':
        return {
            ...basePayload,
            vfxData: {
                pipeline: options.vfxOptions?.targetPipeline,
                resolution: options.vfxOptions?.resolution,
                controlNetCompatible: format.controlNetReady,
            },
            case: 'script',
            return: {
                ...basePayload,
                scriptData: {
                    format: options.filmOptions?.scriptFormat,
                    includeNotes: options.filmOptions?.includeCharacterNotes || options.filmOptions?.includeDirectorNotes,
                },
                case: 'report',
                // Add variance analysis if requested
                if(includeVarianceAnalysis) {
                    // This would calculate variance analysis across results
                    // Implementation would depend on the specific analytics needed
                    return basePayload;
                },
                default: ,
                return: basePayload
            }
        };
}
