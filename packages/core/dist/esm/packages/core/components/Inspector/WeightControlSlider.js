import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback, useRef } from 'react';
import { WeightVisualization, WeightLegend } from '../WeightControls/WeightVisualization';
import { DragReorderList } from '../WeightControls/DragReorderList';
import { WeightPresets } from '../WeightControls/WeightPresets';
export const WeightControlSlider = ({
    options,
    onOptionsChange,
    onPreviewRequest,
    visualization = 'slider-only',
    showLegend = true,
    enableDragReorder = true,
    showPresets = true,
    compactPresets = false,
    customPresets = [],
    onSaveCustomPreset });
className = '';
{
    const [localOptions, setLocalOptions] = useState(options);
    useEffect(() => {
        setLocalOptions(options);
    }, [options]);
    const handleWeightChange = (optionId, newWeight) => {
        const updatedOptions = localOptions.map(option => );
        ;
        option.id === optionId ? { ...option, weight: Math.max(0, newWeight) } : option;
    };
    ;
    setLocalOptions(updatedOptions);
    onOptionsChange(updatedOptions);
}
;
const handleTextChange = (optionId, newText) => {
    const updatedOptions = localOptions.map(option => );
    ;
    option.id === optionId ? { ...option, text: newText } : option;
};
;
setLocalOptions(updatedOptions);
onOptionsChange(updatedOptions);
;
const handleReorder = (fromIndex, toIndex) => {
    const newOptions = [...localOptions];
    const [movedOption] = newOptions.splice(fromIndex, 1);
    newOptions.splice(toIndex, 0, movedOption);
    setLocalOptions(newOptions);
    onOptionsChange(newOptions);
};
const handleApplyPreset = (newWeights) => {
    const updatedOptions = localOptions.map((option, index) => ({}), ...option, weight, newWeights[index] || 0);
};
;
setLocalOptions(updatedOptions);
onOptionsChange(updatedOptions);
// Trigger preview if callback provided
if (onPreviewRequest) {
    onPreviewRequest(updatedOptions);
}
;
if (localOptions.length === 0) {
    return;
    _jsx("div", { className: `weight-control-slider ${className}`, style: ({}, ), "padding:": true });
    16;
    background: '#2d3748';
    borderRadius: 6;
    color: 'white';
    textAlign: 'center';
}
 >
    _jsx("p", { children: "No options to weight. Add some choices first." });
div >
;
;
return;
_jsx("div", { className: `weight-control-slider ${className}`, style: ({}, ), "padding:": true });
16;
background: '#2d3748';
borderRadius: 6;
color: 'white';
 >
    _jsx("h3", { style: { marginBottom: 16, color: '#e2e8f0' }, children: "Weight Controls" });
{ /* Visualization Section */ }
{
    visualization !== 'slider-only' && ()
        < div;
    style = {};
    {
        marginBottom: 20;
        display: 'flex';
        gap: '16px';
        alignItems: 'flex-start';
        flexWrap: 'wrap';
    }
}
 >
    _jsx(WeightVisualization, { options: localOptions, type: visualization, width: visualization === 'pie' ? 180 : 280, height: 180, showLabels: true, showPercentages: true });
{
    showLegend && ()
        < div;
    style = {};
    {
        flex: 1, minWidth;
        '150px';
    }
}
 >
    (_jsx("h4", { style: {
            margin: '0 0 8px 0',
            fontSize: '14px',
            color: '#e2e8f0',
            fontWeight: 'normal'
        }, children: "Distribution" })
        ,
            _jsx(WeightLegend, { options: localOptions }));
div >
;
div >
;
{
    enableDragReorder ? ()
        < DragReorderList
        :
    ;
    options = { localOptions };
    onReorder = { handleReorder };
    onWeightChange = { handleWeightChange };
    onTextChange = { handleTextChange };
    showWeights = { true:  }
        /  >
    ;
    ();
    localOptions.map((option, index) => ()
        < div, key = { option, : .id }, style = {}, { marginBottom: 12 });
}
 >
    (_jsx("div", { style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 4
        }, children: _jsx("input", { type: "text", value: option.text, onChange: (e) => handleTextChange(option.id, e.target.value), style: {
                background: '#4a5568',
                border: 'none',
                borderRadius: 4,
                padding: '4px 8px',
                color: 'white',
                flex: 1,
                marginRight: 8
            }
                /  >
                _jsxs("span", { style: {
                        minWidth: 40,
                        textAlign: 'right',
                        fontSize: 12,
                        color: '#a0aec0'
                    }, children: [option.weight, "%"] }) }) })
        ,
            _jsxs("input", { type: "range", min: "0", max: "100", value: option.weight, onChange: (e) => handleWeightChange(option.id, parseInt(e.target.value)), disabled: option.locked, style: {
                    width: '100%',
                    height: 6,
                    borderRadius: 3,
                    background: '#4a5568',
                    outline: 'none',
                    opacity: option.locked ? 0.5 : 1
                }
                    /  >
                , div: true, children: [")) )}", showPresets && localOptions.length > 0 && ()
                        < div, " style=", { marginTop: 16 }, ">", _jsx(WeightPresets, { options: localOptions, onApplyPreset: handleApplyPreset, onSaveCustomPreset: onSaveCustomPreset, customPresets: customPresets, compact: compactPresets, showCategories: !compactPresets })] }));
{
    onPreviewRequest && ()
        < button;
    onClick = {}();
    onPreviewRequest(localOptions);
}
style = {};
{
    marginTop: 16;
    padding: '8px 16px';
    background: '#4299e1';
    color: 'white';
    border: 'none';
    borderRadius: 4;
    cursor: 'pointer';
}
    >
        Preview;
button >
;
div >
;
;
;
// Helper function to get consistent colors for options
export const getOptionColor = (index) => {
    const colors = [
        '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b'
    ];
};
'#eb4d4b', '#6c5ce7', '#a29bfe', '#fd79a8', '#fdcb6e';
;
return colors[index % colors.length];
;
// Hook for integrating weight controls with preview system
// Epic 8.5 Task 6: Real-Time Weight Integration with debouncing
export const useWeightControlIntegration = (onPreviewRequest) => {
    const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());
    const updateTimeoutRef = useRef(null);
    const handleOptionsChange = useCallback((newOptions) => { }
    // Update immediately for UI responsiveness
    , 
    // Update immediately for UI responsiveness
    setLastUpdateTime(Date.now()));
    // Clear existing timeout
    if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
        // Debounce the preview request for performance (Epic 8.5 Task 6)
        updateTimeoutRef.current = setTimeout(() => {
            console.log('[Epic 8.5 Task 6] Triggering debounced preview update with', newOptions.length, 'weight options');
            onPreviewRequest(newOptions);
        }, 300); // 300ms debounce for optimal UX
    }
    [onPreviewRequest];
    ;
    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (updateTimeoutRef.current) {
                clearTimeout(updateTimeoutRef.current);
            }
            ;
        }, [];
    });
    return { handleOptionsChange };
    lastUpdateTime; // For debugging/monitoring
};
;
export default WeightControlSlider;
