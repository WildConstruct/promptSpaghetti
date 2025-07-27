import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Export Options Dialog Component
 * Epic 8.5: Real-Time Multi-Seed Preview - Task 4: Result Export System
 *
 * Professional export dialog with format selection, options configuration,
 * and size estimation for individual and batch result exports.
 */
import { useState, useMemo } from 'react';
import { ResultExportService } from '../services/ResultExportService';
const exportService = new ResultExportService();
const [isExporting, setIsExporting] = useState(false);
const [validationErrors, setValidationErrors] = useState([]);
const availableFormats = useMemo(() => {
    return exportService.getAvailableFormats().filter(format => {
        if (exportType === 'individual') {
            return format.supportsIndividual;
        }
        else if (exportType === 'batch') {
            return format.supportsBatch;
        }
        return format.supportsBatch; // comparison uses batch support
    });
}, [exportType]);
const exportResults = useMemo(() => {
    if (exportType === 'individual' && typeof individualIndex === 'number') {
        return [results[individualIndex]].filter(Boolean);
    }
    else if (exportType === 'batch') {
        return selectedIndices.map(index => results[index]).filter(Boolean);
    }
    return results;
}, [results, exportType, individualIndex, selectedIndices]);
const sizeEstimate = useMemo(() => {
    if (exportResults.length === 0)
        return null;
    return exportService.estimateExportSize(exportResults, selectedFormat, options);
}, [exportResults, selectedFormat, options]);
const formatInfo = useMemo(() => {
    return availableFormats.find(f => f.format === selectedFormat);
}, [availableFormats, selectedFormat]);
const handleFormatChange = (format) => {
    setSelectedFormat(format);
    setOptions(prev => ({ ...prev, format }));
    // Validate new format
    const errors = exportService.validateExportOptions(format, { ...options, format });
    setValidationErrors(errors);
};
const handleOptionChange = (path, value) => {
    setOptions(prev => {
        const newOptions = { ...prev };
        const keys = path.split('.');
        let current = newOptions;
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]])
                current[keys[i]] = {};
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        return newOptions;
    });
};
const handleExport = async () => {
    const errors = exportService.validateExportOptions(selectedFormat, options);
    if (errors.length > 0) {
        setValidationErrors(errors);
        return;
    }
    setIsExporting(true);
    try {
        await onExport(selectedFormat, options);
        onClose();
    }
    catch (error) {
        console.error('Export failed:', error);
        setValidationErrors(['Export failed: ' + (error instanceof Error ? error.message : 'Unknown error')]);
    }
    finally {
        setIsExporting(false);
    }
};
if (!open)
    return null;
return (_jsxs("div", { style: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.5)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    }, children: [_jsxs("div", { style: {
                background: professionalColors.background.elevated,
                borderRadius: 12,
                padding: 24,
                minWidth: 600,
                maxWidth: 800,
                maxHeight: '90vh',
                overflow: 'auto',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                color: professionalColors.text.primary
            }, children: [_jsxs("div", { style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 20,
                        paddingBottom: 16,
                        borderBottom: `1px solid ${professionalColors.border.subtle}`
                    }, children: [_jsx("h2", { style: { margin: 0, fontSize: 18, fontWeight: 600 }, children: "Export Options" }), _jsxs("div", { style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                fontSize: 12,
                                color: professionalColors.text.secondary
                            }, children: [_jsxs("span", { children: ["\uD83D\uDCCA ", exportType === 'individual' ? '1 result' : `${exportResults.length} results`] }), sizeEstimate && (_jsxs("span", { children: ["\uD83D\uDCBE ~", sizeEstimate.estimatedSize, sizeEstimate.unit] }))] })] }), validationErrors.length > 0 && (_jsx("div", { style: {
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: 6,
                        padding: 12,
                        marginBottom: 16
                    }, children: validationErrors.map((error, index) => (_jsxs("div", { style: {
                            color: '#dc2626',
                            fontSize: 12,
                            marginBottom: index < validationErrors.length - 1 ? 6 : 0
                        }, children: ["\u26A0\uFE0F ", error] }, index))) })), sizeEstimate?.warning && (_jsxs("div", { style: {
                        background: '#fffbeb',
                        border: '1px solid #fed7aa',
                        borderRadius: 6,
                        padding: 12,
                        marginBottom: 16,
                        color: '#92400e',
                        fontSize: 12
                    }, children: ["\u26A1 ", sizeEstimate.warning] })), _jsxs("div", { style: { marginBottom: 20 }, children: [_jsx("label", { style: {
                                display: 'block',
                                marginBottom: 8,
                                fontSize: 14,
                                fontWeight: 500,
                                color: professionalColors.text.primary
                            }, children: "Export Format" }), _jsx("div", { style: {
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                                gap: 8
                            }, children: availableFormats.map(format => (_jsxs("div", { onClick: () => handleFormatChange(format.format), style: {
                                    padding: 12,
                                    border: selectedFormat === format.format
                                        ? '2px solid #4d7cff'
                                        : '1px solid #e5e7eb',
                                    borderRadius: 6,
                                    cursor: 'pointer',
                                    background: selectedFormat === format.format ? '#f0f4ff' : '#fff',
                                    transition: 'all 0.2s'
                                }, children: [_jsxs("div", { style: {
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                            marginBottom: 4
                                        }, children: [_jsx("div", { style: { fontSize: 14, fontWeight: 500 }, children: format.name }), _jsx("div", { style: {
                                                    fontSize: 10,
                                                    padding: '2px 6px',
                                                    borderRadius: 4,
                                                    background: {
                                                        text: '#e5e7eb',
                                                        data: '#dbeafe',
                                                        film: '#fef3c7',
                                                        vfx: '#f3e8ff',
                                                        analysis: '#ecfdf5'
                                                    }[format.category],
                                                    color: {
                                                        text: '#374151',
                                                        data: '#1e40af',
                                                        film: '#92400e',
                                                        vfx: '#7c3aed',
                                                        analysis: '#065f46'
                                                    }[format.category]
                                                }, children: format.category.toUpperCase() })] }), _jsx("div", { style: {
                                            fontSize: 11,
                                            color: professionalColors.text.secondary,
                                            lineHeight: 1.4
                                        }, children: format.description })] }, format.format))) })] }), formatInfo && (_jsxs("div", { style: {
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: 6,
                        padding: 16,
                        marginBottom: 20
                    }, children: [_jsxs("h3", { style: {
                                margin: '0 0 12px 0',
                                fontSize: 14,
                                fontWeight: 500
                            }, children: [formatInfo.name, " Options"] }), _jsxs("div", { style: {
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: 12,
                                marginBottom: 16
                            }, children: [_jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }, children: [_jsx("input", { type: "checkbox", checked: options.includeMetadata, onChange: (e) => handleOptionChange('includeMetadata', e.target.checked) }), "Include Metadata"] }), _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }, children: [_jsx("input", { type: "checkbox", checked: options.includeExecutionPaths, onChange: (e) => handleOptionChange('includeExecutionPaths', e.target.checked) }), "Include Execution Paths"] }), _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }, children: [_jsx("input", { type: "checkbox", checked: options.includeDebugInfo, onChange: (e) => handleOptionChange('includeDebugInfo', e.target.checked) }), "Include Debug Info"] })] }), formatInfo.category === 'film' && (_jsxs("div", { style: { marginBottom: 16 }, children: [_jsx("h4", { style: { margin: '0 0 8px 0', fontSize: 12, fontWeight: 500 }, children: "Film Industry Options" }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }, children: [_jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }, children: [_jsx("input", { type: "checkbox", checked: options.filmOptions?.includeDirectorNotes, onChange: (e) => handleOptionChange('filmOptions.includeDirectorNotes', e.target.checked) }), "Director Notes"] }), _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }, children: [_jsx("input", { type: "checkbox", checked: options.filmOptions?.sceneNumbering, onChange: (e) => handleOptionChange('filmOptions.sceneNumbering', e.target.checked) }), "Scene Numbering"] }), _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }, children: [_jsx("input", { type: "checkbox", checked: options.filmOptions?.shotBreakdown, onChange: (e) => handleOptionChange('filmOptions.shotBreakdown', e.target.checked) }), "Shot Breakdown"] }), _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }, children: [_jsx("input", { type: "checkbox", checked: options.filmOptions?.timingNotes, onChange: (e) => handleOptionChange('filmOptions.timingNotes', e.target.checked) }), "Timing Notes"] })] })] })), formatInfo.category === 'vfx' && (_jsxs("div", { style: { marginBottom: 16 }, children: [_jsx("h4", { style: { margin: '0 0 8px 0', fontSize: 12, fontWeight: 500 }, children: "VFX Pipeline Options" }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }, children: [_jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }, children: [_jsx("input", { type: "checkbox", checked: options.vfxOptions?.controlNetCompatible, onChange: (e) => handleOptionChange('vfxOptions.controlNetCompatible', e.target.checked) }), "ControlNet Compatible"] }), _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }, children: [_jsx("input", { type: "checkbox", checked: options.vfxOptions?.sceneDataIntegration, onChange: (e) => handleOptionChange('vfxOptions.sceneDataIntegration', e.target.checked) }), "Scene Data Integration"] }), _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }, children: [_jsx("input", { type: "checkbox", checked: options.vfxOptions?.cameraMetadata, onChange: (e) => handleOptionChange('vfxOptions.cameraMetadata', e.target.checked) }), "Camera Metadata"] }), _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }, children: [_jsx("input", { type: "checkbox", checked: options.vfxOptions?.lightingData, onChange: (e) => handleOptionChange('vfxOptions.lightingData', e.target.checked) }), "Lighting Data"] })] })] })), formatInfo.category === 'analysis' && (_jsxs("div", { children: [_jsx("h4", { style: { margin: '0 0 8px 0', fontSize: 12, fontWeight: 500 }, children: "Analysis Options" }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }, children: [_jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }, children: [_jsx("input", { type: "checkbox", checked: options.analysisOptions?.varianceAnalysis, onChange: (e) => handleOptionChange('analysisOptions.varianceAnalysis', e.target.checked) }), "Variance Analysis"] }), _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }, children: [_jsx("input", { type: "checkbox", checked: options.analysisOptions?.performanceBreakdown, onChange: (e) => handleOptionChange('analysisOptions.performanceBreakdown', e.target.checked) }), "Performance Breakdown"] }), _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }, children: [_jsx("input", { type: "checkbox", checked: options.analysisOptions?.creativityMetrics, onChange: (e) => handleOptionChange('analysisOptions.creativityMetrics', e.target.checked) }), "Creativity Metrics"] }), _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }, children: [_jsx("input", { type: "checkbox", checked: options.analysisOptions?.comparisonMatrix, onChange: (e) => handleOptionChange('analysisOptions.comparisonMatrix', e.target.checked) }), "Comparison Matrix"] })] })] }))] })), _jsxs("div", { style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingTop: 16,
                        borderTop: `1px solid ${professionalColors.border.subtle}`
                    }, children: [_jsx("div", { style: {
                                fontSize: 11,
                                color: professionalColors.text.secondary
                            }, children: exportType === 'individual'
                                ? `Exporting result ${(individualIndex || 0) + 1} of ${results.length}`
                                : exportType === 'batch'
                                    ? `Exporting ${selectedIndices.length} selected results`
                                    : `Exporting all ${results.length} results for comparison` }), _jsxs("div", { style: { display: 'flex', gap: 12 }, children: [_jsx("button", { onClick: onClose, disabled: isExporting, style: {
                                        padding: '8px 16px',
                                        background: 'transparent',
                                        border: '1px solid #d1d5db',
                                        borderRadius: 4,
                                        cursor: isExporting ? 'not-allowed' : 'pointer',
                                        fontSize: 12,
                                        color: professionalColors.text.secondary
                                    }, children: "Cancel" }), _jsx("button", { onClick: handleExport, disabled: isExporting || validationErrors.length > 0, style: {
                                        padding: '8px 16px',
                                        background: isExporting || validationErrors.length > 0 ? '#9ca3af' : '#4d7cff',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: 4,
                                        cursor: isExporting || validationErrors.length > 0 ? 'not-allowed' : 'pointer',
                                        fontSize: 12,
                                        fontWeight: 500,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8
                                    }, children: isExporting ? (_jsxs(_Fragment, { children: [_jsx("div", { style: {
                                                    width: 12,
                                                    height: 12,
                                                    border: '2px solid transparent',
                                                    borderTop: '2px solid #fff',
                                                    borderRadius: '50%',
                                                    animation: 'spin 1s linear infinite'
                                                } }), "Exporting..."] })) : (_jsxs(_Fragment, { children: ["\uD83D\uDCBE Export ", formatInfo?.name] })) })] })] })] }), _jsx("style", { children: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      ` })] }));
;
