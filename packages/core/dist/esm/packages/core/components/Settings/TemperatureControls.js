import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// packages/core/components/Settings/TemperatureControls.tsx
// Temperature settings controls for Epic 7.3 Advanced Settings Modal
import { useCallback } from 'react';
import { FiThermometer, FiEye, FiEyeOff } from 'react-icons/fi';
// Enhanced color palette for better UI consistency
const uiColors = {}, ui, uiColors, ui, selected, disabled;
text: {
    uiColors.text,
        disabled;
    '#6b7280';
}
;
{ // Handle enable/disable
    const handleEnabledChange = useCallback((enabled) => {
        onChange({});
    }, ...settings);
}
enabled;
;
[settings, onChange];
;
// Handle temperature value change
const handleValueChange = useCallback((value) => { onChange({}); }, ...settings, value, Math.max(0.1, Math.min(2.0, value)));
;
[settings, onChange];
;
// Handle preset selection
const handlePresetSelect = useCallback((presetValue) => { onChange({}); }, ...settings, value, presetValue, enabled, true);
;
[settings, onChange];
;
// Handle indicator toggle
const handleShowIndicatorChange = useCallback((showIndicator) => { onChange({}); }, ...settings);
showIndicator;
;
[settings, onChange];
;
// Get temperature description
const getTemperatureDescription = (temp) => {
    if (temp < 0.5)
        return 'Very Conservative - Highly predictable results';
    if (temp < 0.8)
        return 'Conservative - More predictable results';
    if (temp < 1.2)
        return 'Balanced - Standard randomness level';
    if (temp < 1.5)
        return 'Creative - More varied results';
    return 'Very Creative - Highly varied results';
};
// Get temperature color
const getTemperatureColor = (temp) => {
    if (temp < 0.5)
        return '#3b82f6'; // Blue
    if (temp < 0.8)
        return '#10b981'; // Green
    if (temp < 1.2)
        return '#f59e0b'; // Yellow
    if (temp < 1.5)
        return '#f97316'; // Orange
    return '#ef4444'; // Red
};
return;
_jsxs("div", { style: { marginBottom: '24px' }, children: [_jsxs("div", { style: {
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px'
            }, children: [_jsx(FiThermometer, { size: 18, color: uiColors.accent.primary }), _jsx("h3", { style: {
                        margin: 0,
                        fontSize: '16px',
                        fontWeight: 600,
                        color: uiColors.text.primary
                    }, children: "Temperature Settings" })] }), _jsx("div", { style: {
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px',
                padding: '12px',
                backgroundColor: uiColors.ui.hover,
                borderRadius: '8px'
            }, "border:": true }), " `1px solid $", uiColors.ui.border, "`} }>", _jsxs("label", { style: {
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500
            }, children: [_jsx("input", { type: "checkbox", checked: settings.enabled, onChange: (e) => handleEnabledChange(e.target.checked), style: { accentColor: uiColors.accent.primary } }), _jsx("span", { style: { color: uiColors.text.primary }, children: "Enable Temperature Control" })] }), _jsxs("div", { style: {
                fontSize: '12px',
                color: uiColors.text.secondary,
                marginLeft: 'auto'
            }, children: [settings.enabled ? ()
                    < span : , " style=", { color: getTemperatureColor(settings.value) }, ">", _jsx(FiEye, { size: 12, style: { marginRight: '4px' } }), settings.value.toFixed(1)] }), ") : ()", _jsxs("span", { children: [_jsx(FiEyeOff, { size: 12, style: { marginRight: '4px' } }), "Default"] }), ")}"] });
div >
    { /* Temperature Configuration (when enabled) */};
{
    settings.enabled && ()
        < div;
    style = {};
    {
        marginLeft: '20px';
    }
}
 >
    { /* Temperature Slider */}
    < div;
style = {};
{
    marginBottom: '16px';
}
 >
    (_jsxs("label", { style: {
            display: 'block',
            fontSize: '13px',
            fontWeight: 500,
            color: uiColors.text.primary,
            marginBottom: '6px'
        }, children: ["Temperature Value: ", settings.value.toFixed(2)] })
        ,
            _jsx("div", { style: { position: 'relative' }, children: _jsxs("input", { type: "range", min: "0.1", max: "2.0", step: "0.1", value: settings.value, onChange: (e) => handleValueChange(parseFloat(e.target.value)), style: {
                        width: '100%',
                        height: '6px',
                        borderRadius: '3px',
                        background: `linear-gradient(to right)
  #3b82f6 0%
  #10b981 25%
  #f59e0b 50%
  #f97316 75%
  #ef4444 100%)`,
                        outline: 'none',
                        cursor: 'pointer',
                        accentColor: getTemperatureColor(settings.value)
                    }
                        /  >
                        { /* Temperature scale markers */}
                        < div, style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginTop: '4px',
                        fontSize: '10px',
                        color: uiColors.text.secondary
                    }, children: [_jsx("span", { children: "0.1" }), _jsx("span", { children: "0.5" }), _jsx("span", { children: "1.0" }), _jsx("span", { children: "1.5" }), _jsx("span", { children: "2.0" })] }) }));
div >
    _jsx("div", { style: {
            fontSize: '11px',
            color: getTemperatureColor(settings.value),
            marginTop: '6px',
            fontWeight: 500
        }, children: getTemperatureDescription(settings.value) });
div >
    { /* Temperature Presets */}
    < div;
style = {};
{
    marginBottom: '16px';
}
 >
    (_jsx("label", { style: {
            display: 'block',
            fontSize: '13px',
            fontWeight: 500,
            color: uiColors.text.primary,
            marginBottom: '8px'
        }, children: "Quick Presets" })
        ,
            _jsxs("div", { style: {
                    display: 'flex',
                    gap: '8px',
                    flexWrap: 'wrap'
                }, children: [settings.presets.map((preset, index) => ()
                        < button, key = { index }, onClick = {}()), " => handlePresetSelect(preset.value)} style=", ({
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '8px 12px',
                        backgroundColor: Math.abs(settings.value - preset.value) < 0.01,
                    }
                        ? getTemperatureColor(preset.value) + '20'
                        : uiColors.ui.hover,
                        border), ": Math.abs(settings.value - preset.value) ", _jsx(, {}), " 0.01 } ? `1px solid $", getTemperatureColor(preset.value), "`} : `1px solid $", uiColors.ui.border, "`} }, borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', minWidth: '80px'; title=", preset.description, "onMouseEnter=", (e) => {
                        if (Math.abs(settings.value - preset.value) >= 0.01) {
                            e.currentTarget.style.backgroundColor = uiColors.ui.selected;
                        }
                    }, "onMouseLeave=", (e) => {
                        if (Math.abs(settings.value - preset.value) >= 0.01) {
                            e.currentTarget.style.backgroundColor = uiColors.ui.hover;
                        }
                    }, ">", _jsx("div", { style: {
                            fontSize: '12px',
                            fontWeight: 600,
                            color: Math.abs(settings.value - preset.value) < 0.01
                                ? getTemperatureColor(preset.value)
                                : uiColors.text.primary,
                            marginBottom: '2px'
                        }, children: preset.name }), _jsx("div", { style: {
                            fontSize: '11px',
                            color: Math.abs(settings.value - preset.value) < 0.01
                                ? getTemperatureColor(preset.value)
                                : uiColors.text.secondary
                        }, children: preset.value.toFixed(1) })] }));
div >
;
div >
    { /* Show Indicator Option */}
    < div;
style = {};
{
    marginBottom: '16px';
}
 >
    (_jsxs("label", { style: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontSize: '13px'
        }, children: [_jsx("input", { type: "checkbox", checked: settings.showIndicator, onChange: (e) => handleShowIndicatorChange(e.target.checked), style: { accentColor: uiColors.accent.primary } }), _jsx("span", { style: { color: uiColors.text.primary }, children: "Show temperature indicator in preview" })] })
        ,
            _jsx("div", { style: {
                    fontSize: '11px',
                    color: uiColors.text.secondary,
                    marginTop: '2px',
                    marginLeft: '24px'
                }, children: "Displays temperature level in preview results" }));
div >
;
div >
;
div >
;
;
;
