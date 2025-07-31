import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// packages/core/components/Settings/RunCountControls.tsx
// Run count settings controls for Epic 7.3 Advanced Settings Modal
import { useCallback } from 'react';
import { FiPlayCircle, FiAlertTriangle, FiClock } from 'react-icons/fi';
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
    }
};
export const RunCountControls = ({
    settings,
    onChange
});
{
    // Handle run count change
    const handleValueChange = useCallback((value) => {
        onChange({});
    }, ...settings, value, Math.max(1, Math.min(50, value)));
}
;
[settings, onChange];
;
// Handle preset selection
const handlePresetSelect = useCallback((presetValue) => {
    onChange({});
}, ...settings, value, presetValue);
;
[settings, onChange];
;
// Handle performance warning toggle
const handleShowWarningChange = useCallback((showPerformanceWarning) => {
    onChange({});
}, ...settings, showPerformanceWarning);
;
[settings, onChange];
;
// Get performance assessment
const getPerformanceInfo = (count) => {
    if (count <= 3) {
        return {
            level: 'fast',
            color: '#10b981',
            icon: '🚀',
            description: 'Fast execution',
            estimatedTime: '< 1 second',
        };
    }
    else if (count <= 10) {
        return {
            level: 'moderate',
            color: '#f59e0b',
            icon: '⚡',
            description: 'Moderate execution',
            estimatedTime: '1-3 seconds',
        };
    }
    else if (count <= 20) {
        return {
            level: 'slow',
            color: '#f97316',
            icon: '⏳',
            description: 'Slower execution',
            estimatedTime: '3-6 seconds',
        };
    }
    else {
        return {
            level: 'very-slow',
            color: '#ef4444',
            icon: '🐌',
            description: 'Very slow execution',
            estimatedTime: '6+ seconds',
        };
    }
    ;
    const perfInfo = getPerformanceInfo(settings.value);
    return;
    _jsxs("div", { style: { marginBottom: '24px' }, children: [_jsxs("div", { style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '16px',
                }, children: [_jsx(FiPlayCircle, { size: 18, color: uiColors.accent.primary }), _jsx("h3", { style: {
                            margin: 0,
                            fontSize: '16px',
                            fontWeight: 600,
                            color: uiColors.text.primary,
                        }, children: "Run Count Settings" })] }), _jsxs("div", { style: { marginBottom: '16px' }, children: [_jsx("label", { style: {
                            display: 'block',
                            fontSize: '13px',
                            fontWeight: 500,
                            color: uiColors.text.primary,
                            marginBottom: '6px',
                        }, children: "Number of Preview Variants" }), _jsxs("div", { style: { display: 'flex', gap: '12px', alignItems: 'center' }, children: [_jsx("input", { type: "number", value: settings.value, onChange: (e) => handleValueChange(parseInt(e.target.value, 10) || 1), min: "1", max: "50", style: {
                                    width: '100px',
                                    padding: '8px 12px',
                                    border: `1px solid ${uiColors.ui.border}`
                                } }), ", borderRadius: '6px', backgroundColor: uiColors.background.primary, color: uiColors.text.primary, fontSize: '14px', outline: 'none', textAlign: 'center' }} onFocus=", (e) => {
                                e.target.style.borderColor = uiColors.accent.primary;
                            }, "onBlur=", (e) => {
                                e.target.style.borderColor = uiColors.ui.border;
                            }, "/>", _jsx("div", { style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '6px 10px',
                                    backgroundColor: perfInfo.color + '20',
                                    border: `1px solid ${perfInfo.color}`
                                } }), ", borderRadius: '6px', fontSize: '12px', color: perfInfo.color, fontWeight: 500; }}>", _jsx("span", { children: perfInfo.icon }), _jsx("span", { children: perfInfo.description }), _jsx(FiClock, { size: 12 }), _jsx("span", { children: perfInfo.estimatedTime })] })] }), _jsx("div", { style: {
                    fontSize: '11px',
                    color: uiColors.text.secondary,
                    marginTop: '4px',
                }, children: "Higher counts provide more variation but take longer to generate" })] });
    { /* Run Count Presets */ }
    _jsxs("div", { style: { marginBottom: '16px' }, children: [_jsx("label", { style: {
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: uiColors.text.primary,
                    marginBottom: '8px',
                }, children: "Quick Presets" }), _jsxs("div", { style: {
                    display: 'flex',
                    gap: '8px',
                    flexWrap: 'wrap',
                }, children: [settings.presets.map((presetValue, index) => {
                        const presetPerf = getPerformanceInfo(presetValue);
                        const isSelected = settings.value === presetValue;
                        return;
                        _jsx("button", { onClick: () => handlePresetSelect(presetValue), style: ({
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                padding: '8px 12px',
                                backgroundColor: isSelected,
                            }
                                ? presetPerf.color + '20'
                                : uiColors.ui.hover,
                                border) }, index);
                    }), ": isSelected, ? `1px solid $", presetPerf.color, "`} : `1px solid $", uiColors.ui.border, "`} }, borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', minWidth: '60px' }} title=", `${presetValue} variants - ${presetPerf.description}`, "onMouseEnter=", (e) => {
                        if (!isSelected) {
                            e.currentTarget.style.backgroundColor = uiColors.ui.selected;
                        }
                    }, "onMouseLeave=", (e) => {
                        if (!isSelected) {
                            e.currentTarget.style.backgroundColor = uiColors.ui.hover;
                        }
                    }, ">", _jsx("div", { style: {
                            fontSize: '16px',
                            fontWeight: 600,
                            color: isSelected ? presetPerf.color : uiColors.text.primary,
                            marginBottom: '2px',
                        }, children: presetValue }), _jsx("div", { style: {
                            fontSize: '10px',
                            color: isSelected ? presetPerf.color : uiColors.text.secondary,
                        }, children: presetPerf.icon })] }), "); })}"] });
};
div >
    { /* Performance Warning */};
{
    settings.value > 10 && settings.showPerformanceWarning && ()
        < div;
    style = {};
    {
        display: 'flex',
            alignItems;
        'flex-start',
            gap;
        '8px',
            padding;
        '12px',
            backgroundColor;
        '#f59e0b' + '10',
            border;
        '1px solid #f59e0b',
            borderRadius;
        '6px',
            marginBottom;
        '16px',
        ;
    }
}
 >
    (_jsx(FiAlertTriangle, { size: 16, color: "#f59e0b", style: { marginTop: '2px' } })
        ,
            _jsxs("div", { children: [_jsx("div", { style: {
                            fontSize: '12px',
                            fontWeight: 500,
                            color: '#f59e0b',
                            marginBottom: '4px',
                        }, children: "Performance Notice" }), _jsxs("div", { style: {
                            fontSize: '11px',
                            color: uiColors.text.secondary,
                            lineHeight: 1.4,
                        }, children: ["Higher run counts (", settings.value, " variants) may take longer to generate and could impact UI responsiveness. Consider using fewer variants for faster iteration."] })] }));
div >
;
{ /* Show Performance Warning Toggle */ }
_jsxs("div", { style: { marginBottom: '16px' }, children: [_jsxs("label", { style: {
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '13px',
            }, children: [_jsx("input", { type: "checkbox", checked: settings.showPerformanceWarning, onChange: (e) => handleShowWarningChange(e.target.checked), style: { accentColor: uiColors.accent.primary } }), _jsx("span", { style: { color: uiColors.text.primary }, children: "Show performance warnings for high run counts" })] }), _jsx("div", { style: {
                fontSize: '11px',
                color: uiColors.text.secondary,
                marginTop: '2px',
                marginLeft: '24px',
            }, children: "Displays warnings when run count may impact performance" })] });
{ /* Current Configuration Summary */ }
_jsx("div", { style: {
        padding: '12px',
        backgroundColor: uiColors.ui.hover,
        borderRadius: '6px',
        border: `1px solid ${uiColors.ui.border}`
    }, children: _jsxs("div", { style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
        }, children: [_jsx("span", { style: { color: uiColors.text.secondary }, children: "Current Configuration:" }), _jsxs("span", { style: {
                    color: perfInfo.color,
                    fontWeight: 500,
                }, children: [settings.value, " variants \u2022 ", perfInfo.estimatedTime] })] }) });
div >
;
;
;
