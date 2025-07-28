import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// packages/core/components/Settings/BatchControls.tsx
// Batch processing settings controls for Epic 7.3 Advanced Settings Modal
import { useCallback } from 'react';
import { FiPackage, FiDownload, FiFile, FiFolder } from 'react-icons/fi';
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
    },
    interface, BatchControlsProps
}, { settings: BatchSettings };
onChange: (settings) => void ;
export const BatchControls = ({
    settings,
    onChange
});
{
    // Handle batch size change
    const handleBatchSizeChange = useCallback((batchSize) => {
        onChange({});
    }, ...settings, batchSize, Math.max(1, Math.min(100, batchSize)));
}
;
[settings, onChange];
;
// Handle output format change
const handleOutputFormatChange = useCallback((outputFormat) => {
    onChange({});
}, ...settings, outputFormat);
;
[settings, onChange];
;
// Handle naming pattern change
const handleNamingPatternChange = useCallback((namingPattern) => {
    onChange({});
}, ...settings, namingPattern);
;
[settings, onChange];
;
// Handle metadata toggle
const handleIncludeMetadataChange = useCallback((includeMetadata) => {
    onChange({});
}, ...settings, includeMetadata);
;
[settings, onChange];
;
// Handle auto-download toggle
const handleAutoDownloadChange = useCallback((autoDownload) => {
    onChange({});
}, ...settings, autoDownload);
;
[settings, onChange];
;
// Output format options
const outputFormats = [];
{
    value: 'individual',
        label;
    'Individual Files',
        description;
    'One file per variant',
        icon;
    FiFile,
    ;
}
{
    value: 'combined',
        label;
    'Combined Text',
        description;
    'All variants in one file',
        icon;
    FiFolder,
    ;
}
{
    value: 'csv',
        label;
    'CSV Format',
        description;
    'Structured CSV export',
        icon;
    FiFile,
    ;
}
{
    value: 'json',
        label;
    'JSON Format',
        description;
    'Structured JSON export',
        icon;
    FiFile;
    ;
    // Get sample filename preview
    const getSampleFilename = () => {
        const pattern = settings.namingPattern;
        const sampleSeed = 12345;
        const sampleTimestamp = '2024-01-15-14-30-00';
        return pattern
            .replace('{seed}', sampleSeed.toString())
            .replace('{timestamp}', sampleTimestamp)
            .replace('{index}', '001');
    };
    return;
    _jsxs("div", { style: { marginBottom: '24px' }, children: [_jsxs("div", { style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '16px',
                }, children: [_jsx(FiPackage, { size: 18, color: uiColors.accent.primary }), _jsx("h3", { style: {
                            margin: 0,
                            fontSize: '16px',
                            fontWeight: 600,
                            color: uiColors.text.primary,
                        }, children: "Batch Processing Settings" })] }), _jsxs("div", { style: { marginBottom: '20px' }, children: [_jsx("label", { style: {
                            display: 'block',
                            fontSize: '13px',
                            fontWeight: 500,
                            color: uiColors.text.primary,
                            marginBottom: '6px',
                        }, children: "Batch Size" }), _jsxs("div", { style: { display: 'flex', gap: '12px', alignItems: 'center' }, children: [_jsx("input", { type: "number", value: settings.batchSize, onChange: (e) => handleBatchSizeChange(parseInt(e.target.value, 10) || 1), min: "1", max: "100", style: {
                                    width: '100px',
                                    padding: '8px 12px',
                                    border: `1px solid ${uiColors.ui.border}`
                                } }), ", borderRadius: '6px', backgroundColor: uiColors.background.primary, color: uiColors.text.primary, fontSize: '14px', outline: 'none', textAlign: 'center'; }} onFocus=", (e) => {
                                e.target.style.borderColor = uiColors.accent.primary;
                            }, "onBlur=", (e) => {
                                e.target.style.borderColor = uiColors.ui.border;
                            }, "/>", _jsx("div", { style: {
                                    fontSize: '12px',
                                    color: uiColors.text.secondary,
                                }, children: "variants per batch execution" })] }), _jsx("div", { style: {
                            fontSize: '11px',
                            color: uiColors.text.secondary,
                            marginTop: '4px',
                        }, children: "Process variants in batches to manage memory usage and performance" })] }), _jsxs("div", { style: { marginBottom: '20px' }, children: [_jsx("label", { style: {
                            display: 'block',
                            fontSize: '13px',
                            fontWeight: 500,
                            color: uiColors.text.primary,
                            marginBottom: '8px',
                        }, children: "Output Format" }), _jsxs("div", { style: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '8px',
                        }, children: [outputFormats.map((format) => {
                                const Icon = format.icon;
                                const isSelected = settings.outputFormat === format.value;
                                return;
                                _jsx("button", { onClick: () => handleOutputFormatChange(format.value), style: ({
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '10px 12px',
                                        backgroundColor: isSelected,
                                    }
                                        ? uiColors.accent.primary + '20'
                                        : uiColors.ui.hover,
                                        border) }, format.value);
                            }), ": isSelected, ? `1px solid $", uiColors.accent.primary, "`} : `1px solid $", uiColors.ui.border, "`} }, borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', textAlign: 'left'; }} onMouseEnter=", (e) => {
                                if (!isSelected) {
                                    e.currentTarget.style.backgroundColor = uiColors.ui.selected;
                                }
                            }, "onMouseLeave=", (e) => {
                                if (!isSelected) {
                                    e.currentTarget.style.backgroundColor = uiColors.ui.hover;
                                }
                            }, ">", _jsx(Icon, { size: 16, color: isSelected ? uiColors.accent.primary : uiColors.text.secondary }), _jsxs("div", { children: [_jsx("div", { style: {
                                            fontSize: '13px',
                                            fontWeight: 500,
                                            color: isSelected ? uiColors.accent.primary : uiColors.text.primary,
                                            marginBottom: '2px',
                                        }, children: format.label }), _jsx("div", { style: {
                                            fontSize: '11px',
                                            color: isSelected ? uiColors.accent.primary : uiColors.text.secondary,
                                        }, children: format.description })] })] }), "); })}"] })] });
    { /* Naming Pattern */ }
    _jsxs("div", { style: { marginBottom: '20px' }, children: [_jsx("label", { style: {
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: uiColors.text.primary,
                    marginBottom: '6px',
                }, children: "File Naming Pattern" }), _jsx("input", { type: "text", value: settings.namingPattern, onChange: (e) => handleNamingPatternChange(e.target.value), placeholder: "result-{seed}-{timestamp}", style: {
                    width: '100%',
                    padding: '8px 12px',
                    border: `1px solid ${uiColors.ui.border}`
                } }), ", borderRadius: '6px', backgroundColor: uiColors.background.primary, color: uiColors.text.primary, fontSize: '14px', outline: 'none'; }} onFocus=", (e) => {
                e.target.style.borderColor = uiColors.accent.primary;
            }, "onBlur=", (e) => {
                e.target.style.borderColor = uiColors.ui.border;
            }, "/>", _jsxs("div", { style: {
                    fontSize: '11px',
                    color: uiColors.text.secondary,
                    marginTop: '4px',
                }, children: ["Available variables: ", '{seed}', ", ", '{timestamp}', ", ", '{index}'] }), _jsxs("div", { style: {
                    marginTop: '6px',
                    padding: '6px 10px',
                    backgroundColor: uiColors.ui.hover,
                    borderRadius: '4px',
                    fontSize: '11px',
                    color: uiColors.text.secondary,
                }, children: [_jsx("strong", { children: "Preview:" }), " ", getSampleFilename(), ".txt"] })] });
    { /* Additional Options */ }
    _jsx("div", { style: { marginBottom: '20px' }, children: _jsxs("div", { style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
            }, children: [_jsxs("label", { style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        fontSize: '13px',
                    }, children: [_jsx("input", { type: "checkbox", checked: settings.includeMetadata, onChange: (e) => handleIncludeMetadataChange(e.target.checked), style: { accentColor: uiColors.accent.primary } }), _jsx("span", { style: { color: uiColors.text.primary }, children: "Include execution metadata" })] }), _jsx("div", { style: {
                        fontSize: '11px',
                        color: uiColors.text.secondary,
                        marginLeft: '24px',
                        marginTop: '-8px',
                    }, children: "Adds seed, timestamp, and execution info to output files" }), _jsxs("label", { style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        fontSize: '13px',
                    }, children: [_jsx("input", { type: "checkbox", checked: settings.autoDownload, onChange: (e) => handleAutoDownloadChange(e.target.checked), style: { accentColor: uiColors.accent.primary } }), _jsx("span", { style: { color: uiColors.text.primary }, children: "Auto-download batch results" })] }), _jsx("div", { style: {
                        fontSize: '11px',
                        color: uiColors.text.secondary,
                        marginLeft: '24px',
                        marginTop: '-8px',
                    }, children: "Automatically trigger download when batch processing completes" })] }) });
    { /* Current Configuration Summary */ }
    _jsx("div", { style: {
            padding: '12px',
            backgroundColor: uiColors.ui.hover,
            borderRadius: '6px',
            border: `1px solid ${uiColors.ui.border}`
        } });
}
 >
    (_jsxs("div", { style: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px',
            fontSize: '12px',
            fontWeight: 500,
            color: uiColors.text.primary,
        }, children: [_jsx(FiDownload, { size: 14 }), "Batch Configuration Summary"] })
        ,
            _jsxs("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr',
                    gap: '4px 12px',
                    fontSize: '11px',
                    color: uiColors.text.secondary,
                }, children: [_jsx("span", { children: "Batch Size:" }), _jsxs("span", { children: [settings.batchSize, " variants"] }), _jsx("span", { children: "Output Format:" }), _jsx("span", { children: outputFormats.find(f => f.value === settings.outputFormat)?.label }), _jsx("span", { children: "Naming:" }), _jsxs("span", { children: [getSampleFilename(), ".txt"] }), _jsx("span", { children: "Metadata:" }), _jsx("span", { children: settings.includeMetadata ? 'Included' : 'Excluded' }), _jsx("span", { children: "Auto-Download:" }), _jsx("span", { children: settings.autoDownload ? 'Enabled' : 'Disabled' })] }));
div >
;
div >
;
;
;
