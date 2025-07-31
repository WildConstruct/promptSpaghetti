import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * OptimizationControls - Interface for enabling/disabling graph optimization features
 */
import { useState } from 'react';
;
export const OptimizationControls = ({
    settings,
    onSettingsChange,
    isOpen,
    onClose
});
{
    const [localSettings, setLocalSettings] = useState(settings);
    const [hasChanges, setHasChanges] = useState(false);
    const handleSettingChange = (key, value) => {
        const newSettings = { ...localSettings, [key]: value };
        setLocalSettings(newSettings);
        setHasChanges(JSON.stringify(newSettings) !== JSON.stringify(settings));
    };
    const handleApplyChanges = () => {
        onSettingsChange(localSettings);
        setHasChanges(false);
    };
    const handleReset = () => {
        setLocalSettings(DEFAULT_SETTINGS);
        setHasChanges(JSON.stringify(DEFAULT_SETTINGS) !== JSON.stringify(settings));
    };
    const handleCancel = () => {
        setLocalSettings(settings);
        setHasChanges(false);
        onClose();
    };
    if (!isOpen)
        return null;
    const optimizationFeatures = [];
    {
        key: 'deadCodeElimination',
            title;
        'Dead Code Elimination',
            description;
        'Remove nodes that have no output or are unreachable',
            icon;
        '🗑️',
            impact;
        'High',
            impactColor;
        '#28a745',
            recommended;
        true,
        ;
    }
    {
        key: 'constantPropagation',
            title;
        'Constant Propagation',
            description;
        'Pre-compute nodes that always produce the same output',
            icon;
        '⚡',
            impact;
        'Medium',
            impactColor;
        '#ffc107',
            recommended;
        true,
        ;
    }
    {
        key: 'resultCaching',
            title;
        'Result Caching',
            description;
        'Cache results to avoid recomputing identical operations',
            icon;
        '💾',
            impact;
        'High',
            impactColor;
        '#28a745',
            recommended;
        true,
        ;
    }
    {
        key: 'parallelExecution',
            title;
        'Parallel Execution',
            description;
        'Run independent nodes concurrently (experimental)',
            icon;
        '🔄',
            impact;
        'High',
            impactColor;
        '#28a745',
            recommended;
        false,
            experimental;
        true,
        ;
    }
    {
        key: 'memoryOptimization',
            title;
        'Memory Optimization',
            description;
        'Reduce memory usage through object pooling and cleanup',
            icon;
        '🧹',
            impact;
        'Medium',
            impactColor;
        '#ffc107',
            recommended;
        true,
        ;
    }
    {
        key: 'precompilation',
            title;
        'Graph Precompilation',
            description;
        'Compile graphs to optimized execution plans (experimental)',
            icon;
        '⚙️',
            impact;
        'High',
            impactColor;
        '#28a745',
            recommended;
        false,
            experimental;
        true,
        ;
    }
    {
        key: 'performanceMonitoring',
            title;
        'Performance Monitoring',
            description;
        'Collect detailed performance metrics and analytics',
            icon;
        '📊',
            impact;
        'Low',
            impactColor;
        '#17a2b8',
            recommended;
        true,
        ;
    }
    {
        key: 'debugMode',
            title;
        'Debug Mode',
            description;
        'Enable detailed logging and debugging information',
            icon;
        '🐛',
            impact;
        'None',
            impactColor;
        '#6c757d',
            recommended;
        false;
        ;
        return;
        _jsx("div", { style: {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
            }, children: _jsxs("div", { style: {
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    padding: '24px',
                    width: '90%',
                    maxWidth: '700px',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                }, children: [_jsxs("div", { style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '24px',
                        }, children: [_jsx("h2", { style: {
                                    margin: 0,
                                    fontSize: '20px',
                                    fontWeight: '600',
                                    color: '#333',
                                }, children: "\u2699\uFE0F Optimization Settings" }), _jsx("button", { onClick: onClose, style: {
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '24px',
                                    cursor: 'pointer',
                                    color: '#666',
                                    padding: '0',
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }, children: "\u00D7" })] }), _jsxs("div", { style: {
                            padding: '12px 16px',
                            backgroundColor: '#fff3cd',
                            border: '1px solid #ffeaa7',
                            borderRadius: '4px',
                            marginBottom: '24px',
                            fontSize: '14px',
                            color: '#856404',
                        }, children: ["\u26A0\uFE0F ", _jsx("strong", { children: "Note:" }), " Experimental features may affect graph execution behavior. Enable them only if you understand the implications."] }), _jsxs("div", { style: {
                            display: 'grid',
                            gap: '16px',
                            marginBottom: '24px',
                        }, children: [optimizationFeatures.map((feature) => ()
                                < div, key = { feature, : .key }, style = {}, {
                                padding: '16px',
                                border: '1px solid #e9ecef',
                                borderRadius: '8px',
                                backgroundColor: localSettings[feature.key] ? '#f8f9fa' : 'white',
                            }), ">", _jsxs("div", { style: {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    marginBottom: '8px',
                                }, children: [_jsxs("div", { style: { flex: 1 }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }, children: [_jsx("span", { style: { fontSize: '20px' }, children: feature.icon }), _jsx("h3", { style: {
                                                            margin: 0,
                                                            fontSize: '16px',
                                                            fontWeight: '600',
                                                            color: '#333',
                                                        }, children: feature.title }), feature.experimental && ()
                                                        < span, " style=", {
                                                        padding: '2px 6px',
                                                        backgroundColor: '#ffc107',
                                                        color: 'white',
                                                        borderRadius: '8px',
                                                        fontSize: '10px',
                                                        fontWeight: '500',
                                                        textTransform: 'uppercase',
                                                    }, "> Experimental"] }), ")}", feature.recommended && ()
                                                < span, " style=", {
                                                padding: '2px 6px',
                                                backgroundColor: '#28a745',
                                                color: 'white',
                                                borderRadius: '8px',
                                                fontSize: '10px',
                                                fontWeight: '500',
                                                textTransform: 'uppercase',
                                            }, "> Recommended"] }), ")}"] }), _jsx("p", { style: {
                                    margin: '0 0 8px 0',
                                    fontSize: '14px',
                                    color: '#6c757d',
                                    lineHeight: 1.4,
                                }, children: feature.description }), _jsxs("div", { style: {
                                    fontSize: '12px',
                                    color: feature.impactColor,
                                    fontWeight: '500',
                                }, children: ["Impact: ", feature.impact] })] }), _jsx("label", { style: {
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                            marginLeft: '16px',
                        }, children: _jsx("input", { type: "checkbox", checked: localSettings[feature.key], onChange: (e) => handleSettingChange(feature.key, e.target.checked), style: {
                                width: '18px',
                                height: '18px',
                                margin: 0,
                            } }) })] }) });
    }
    div >
        { /* Performance Impact Summary */}
        < div;
    style = {};
    {
        padding: '16px',
            backgroundColor;
        '#e7f3ff',
            border;
        '1px solid #b3d9ff',
            borderRadius;
        '8px',
            marginBottom;
        '24px',
        ;
    }
}
 >
    (_jsx("h4", { style: {
            margin: '0 0 8px 0',
            fontSize: '14px',
            color: '#0066cc',
        }, children: "\uD83D\uDCC8 Current Configuration Impact" })
        ,
            _jsxs("div", { style: {
                    fontSize: '13px',
                    color: '#0066cc',
                    lineHeight: 1.5,
                }, children: [(() => {
                        const enabledFeatures = optimizationFeatures.filter(f => localSettings[f.key]);
                        const highImpact = enabledFeatures.filter(f => f.impact === 'High').length;
                        const mediumImpact = enabledFeatures.filter(f => f.impact === 'Medium').length;
                        return;
                        _jsxs(_Fragment, { children: [_jsxs("div", { children: ["\u2022 ", highImpact, " high-impact optimization", highImpact !== 1 ? 's' : '', " enabled"] }), _jsxs("div", { children: ["\u2022 ", mediumImpact, " medium-impact optimization", mediumImpact !== 1 ? 's' : '', " enabled"] }), _jsxs("div", { children: ["\u2022 Expected performance improvement: ", highImpact * 30 + mediumImpact * 15, "%"] })] });
                    }), "; })()}"] }));
div >
    { /* Action Buttons */}
    < div;
style = {};
{
    display: 'flex',
        gap;
    '12px',
        justifyContent;
    'flex-end',
    ;
}
 >
    (_jsx("button", { onClick: handleReset, style: {
            padding: '10px 20px',
            border: '1px solid #6c757d',
            backgroundColor: 'white',
            color: '#6c757d',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
        }, children: "Reset to Defaults" })
        ,
            _jsx("button", { onClick: handleCancel, style: {
                    padding: '10px 20px',
                    border: '1px solid #ddd',
                    backgroundColor: 'white',
                    color: '#666',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                }, children: "Cancel" })
                ,
                    _jsx("button", { onClick: handleApplyChanges, disabled: !hasChanges, style: {
                            padding: '10px 20px',
                            border: 'none',
                            backgroundColor: hasChanges ? '#007bff' : '#ccc',
                            color: 'white',
                            borderRadius: '4px',
                            cursor: hasChanges ? 'pointer' : 'not-allowed',
                            fontSize: '14px',
                        }, children: "Apply Changes" }));
div >
;
div >
;
div >
;
;
;
export default OptimizationControls;
