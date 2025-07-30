import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { TextFieldEditor } from '../TextFieldEditor';
import { SelectEditor } from '../SelectEditor';
import { ProgressiveDisclosureSection } from '../ProgressiveDisclosureSection';
import { WeightSlider } from '../WeightSlider';
import { WeightVisualizationPanel } from '../../WeightVisualization';
text: choice.value,
    weight;
choice.weight;
;
const handleChoicesChange = (newChoices) => {
    onChange({ choices: newChoices });
};
const handleAddChoice = () => {
    const newChoice = {
        value: `Choice ${choices.length + 1}` };
}, weight;
;
handleChoicesChange([...choices, newChoice]);
;
const handleRemoveChoice = (index) => {
    const newChoices = choices.filter((_, i) => i !== index);
    handleChoicesChange(newChoices);
};
const handleUpdateChoice = (index, field, value) => {
    const newChoices = [...choices];
    newChoices[index] = { ...newChoices[index], [field]: value };
    handleChoicesChange(newChoices);
};
const handleNameChange = (value) => {
    onChange({ name: value, label: value });
};
const handleDistributionTypeChange = (value) => {
    onChange({ distributionType: value });
};
const handleNormalizeChange = (value) => {
    onChange({ normalize: Boolean(value) });
};
const handleMinWeightChange = (value) => {
    onChange({ minWeight: Math.max(0, Number(value) || 0) });
};
const handleExponentialFactorChange = (value) => {
    onChange({ exponentialFactor: Math.max(0.1, Number(value) || 2) });
};
const handleGaussianMeanChange = (value) => {
    onChange({ gaussianMean: Math.max(0, Math.min(1, Number(value) || 0.5)) });
};
const handleGaussianStdChange = (value) => {
    onChange({ gaussianStd: Math.max(0.01, Number(value) || 0.2) });
};
const distributionOptions = [];
{
    value: 'linear', label;
    'Linear - Use original weights';
}
{
    value: 'exponential', label;
    'Exponential - Apply power transformation';
}
{
    value: 'gaussian', label;
    'Gaussian - Apply normal distribution curve';
}
{
    value: 'custom', label;
    'Custom - User-defined transformation';
}
;
const equalizeWeights = () => {
    const newChoices = choices.map(choice => ({ ...choice, weight: 1 }));
    handleChoicesChange(newChoices);
};
const randomizeWeights = () => {
    const newChoices = choices.map(choice => ({}), ...choice, weight, Math.random() * 10 + 1);
};
handleChoicesChange(newChoices);
;
const setLinearProgression = () => {
    const newChoices = choices.map((choice, index) => ({}), ...choice, weight, index + 1);
};
handleChoicesChange(newChoices);
;
// Calculate effective weights after distribution and normalization
const getEffectiveWeights = () => {
    if (choices.length === 0)
        return [];
    let weights = choices.map(choice => choice.weight);
    // Apply distribution transformation
    switch (distributionType) {
        case 'exponential':
            weights = weights.map(w => Math.pow(w, exponentialFactor));
            break;
        case 'gaussian':
            weights = weights.map((w, index) => {
                const x = index / (choices.length - 1 || 1);
                const gaussian = Math.exp(-0.5 * Math.pow((x - gaussianMean) / gaussianStd, 2));
                return w * gaussian;
            });
            break;
        case 'linear':
        case 'custom':
        default:
            // No transformation
            break;
            // Apply minimum weight
            if (minWeight > 0) {
                weights = weights.map(w => Math.max(w, minWeight));
                // Normalize if requested
                if (normalize) {
                    const total = weights.reduce((sum, w) => sum + w, 0);
                    if (total > 0) {
                        weights = weights.map(w => w / total);
                        return weights;
                    }
                    ;
                    const effectiveWeights = getEffectiveWeights();
                    return;
                    _jsx("div", { className: "weighted-advanced-editor", children: _jsxs(ProgressiveDisclosureSection, { title: "Essential Settings", level: "basic", description: "Core weighted selection configuration", defaultExpanded: true, priority: "critical", fieldName: "name", children: [_jsx("div", { style: { marginBottom: 16 }, children: _jsx(TextFieldEditor, { label: "Choice Set Name", value: name, fieldKey: "name", zodType: null, onChange: handleNameChange, placeholder: "e.g., Character Emotions, Scene Styles, Action Types" }) }), _jsxs("div", { style: { marginBottom: 12 }, children: [_jsxs("div", { style: {
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                marginBottom: 8,
                                            }, children: [_jsx("label", { style: {
                                                        fontWeight: 500,
                                                        color: '#e2e8f0',
                                                        fontSize: 12,
                                                    }, children: "Story Choices" }), _jsx("button", { onClick: handleAddChoice, style: {
                                                        padding: '4px 8px',
                                                        fontSize: 10,
                                                        background: '#4299e1',
                                                        border: 'none',
                                                        borderRadius: 2,
                                                        color: '#fff',
                                                        cursor: 'pointer',
                                                    }, children: "Add Choice" })] }), choices.length === 0 ? ()
                                            < div : , " style=", {
                                            background: '#2d3748',
                                            border: '1px solid #4a5568',
                                            borderRadius: 4,
                                            padding: 16,
                                            textAlign: 'center',
                                            color: '#a0aec0',
                                            fontSize: 12,
                                            fontStyle: 'italic',
                                        }, "> No story choices defined. Add options like \"Dramatic\", \"Comedy\", \"Action\" to create weighted selection."] }), ") : ()", _jsxs("div", { style: {
                                        background: '#2d3748',
                                        border: '1px solid #4a5568',
                                        borderRadius: 4,
                                        padding: 8,
                                    }, children: [choices.map((choice, index) => {
                                            const effectiveWeight = effectiveWeights[index] || 0;
                                            const percentage = effectiveWeights.length > 0;
                                        })
                                            ? Math.round()
                                            :
                                        , "effectiveWeight * (normalize ? 100 : effectiveWeights.reduce((sum) w ) => sum + w, 0) > 0 ? 100 / effectiveWeights.reduce((sum, w) => sum + w, 0) : 0)) : Math.round(100 / choices.length); return;", _jsxs("div", { style: {
                                                background: '#1a202c',
                                                border: '1px solid #4a5568',
                                                borderRadius: 4,
                                                padding: 8,
                                                marginBottom: index < choices.length - 1 ? 8 : 0,
                                            }, children: [_jsxs("div", { style: {
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        marginBottom: 8,
                                                        gap: 8,
                                                    }, children: [_jsx("input", { type: "text", value: choice.value, onChange: (e) => handleUpdateChoice(index, 'value', e.target.value), style: {
                                                                flex: 1,
                                                                padding: 4,
                                                                border: '1px solid #4a5568',
                                                                borderRadius: 2,
                                                                background: '#2d3748',
                                                                color: '#e2e8f0',
                                                                fontSize: 11,
                                                            }, placeholder: 'e.g., "Suspenseful", "Lighthearted", "Intense"' }), _jsx("button", { onClick: () => handleRemoveChoice(index), style: {
                                                                background: '#e53e3e',
                                                                border: 'none',
                                                                borderRadius: 2,
                                                                color: '#fff',
                                                                cursor: 'pointer',
                                                                padding: '2px 6px',
                                                                fontSize: 10,
                                                            }, children: "Remove" })] }), _jsxs("div", { style: {
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 8,
                                                    }, children: [_jsx("label", { style: { fontSize: 10, color: '#a0aec0', minWidth: 80 }, children: "Raw Weight:" }), _jsx(WeightSlider, { value: choice.weight, onChange: (newWeight) => handleUpdateChoice(index, 'weight', newWeight), min: 0, max: Math.max(10, Math.max(...choices.map(c => c.weight)) * 1.5), step: 0.1, showNumeric: true, label: "Raw Weight" }), _jsxs("div", { style: {
                                                                fontSize: 10,
                                                                color: '#a0aec0',
                                                                minWidth: 60,
                                                                textAlign: 'right',
                                                            }, children: [percentage.toFixed(1), "% chance"] })] })] }, index), "); })}"] }), ")}", _jsx("div", { style: {
                                        fontSize: 10,
                                        color: '#a0aec0',
                                        marginTop: 4,
                                    }, children: "Choose options and their relative likelihood. Higher weights = more likely to be selected." })] }) });
                }
            }
    }
};
ProgressiveDisclosureSection >
    { /* ADVANCED LEVEL: Distribution algorithms and weight controls */}
    < ProgressiveDisclosureSection;
title = "Advanced Weight Controls";
level = "advanced";
description = "Fine-tune selection algorithms and probability distributions";
defaultExpanded = { false:  };
priority = "important";
fieldName = "distribution"
    >
        { /* Weight adjustment tools */};
{
    choices.length > 1 && ()
        < div;
    style = {};
    {
        marginBottom: 16,
            display;
        'flex',
            gap;
        8,
            flexWrap;
        'wrap',
        ;
    }
}
 >
    (_jsx("button", { onClick: equalizeWeights, style: {
            padding: '4px 8px',
            fontSize: 10,
            background: '#4a5568',
            border: 'none',
            borderRadius: 2,
            color: '#e2e8f0',
            cursor: 'pointer',
        }, children: "Equal Weights" })
        ,
            _jsx("button", { onClick: randomizeWeights, style: {
                    padding: '4px 8px',
                    fontSize: 10,
                    background: '#4a5568',
                    border: 'none',
                    borderRadius: 2,
                    color: '#e2e8f0',
                    cursor: 'pointer',
                }, children: "Random Weights" })
                ,
                    _jsx("button", { onClick: setLinearProgression, style: {
                            padding: '4px 8px',
                            fontSize: 10,
                            background: '#4a5568',
                            border: 'none',
                            borderRadius: 2,
                            color: '#e2e8f0',
                            cursor: 'pointer',
                        }, children: "Linear Progression" }));
div >
;
_jsx("div", { style: { marginBottom: 16 }, children: _jsx(SelectEditor, { label: "Distribution Type", value: distributionType, fieldKey: "distributionType", zodType: null, onChange: handleDistributionTypeChange, options: distributionOptions }) });
{ /* Distribution-specific parameters */ }
{
    distributionType === 'exponential' && ()
        < div;
    style = {};
    {
        marginBottom: 16;
    }
}
 >
    (_jsx(TextFieldEditor, { label: "Exponential Factor", value: exponentialFactor, fieldKey: "exponentialFactor", zodType: null, onChange: handleExponentialFactorChange, placeholder: "2.0" })
        ,
            _jsx("div", { style: {
                    fontSize: 10,
                    color: '#a0aec0',
                    marginTop: 2,
                }, children: "Higher values create more extreme weight distributions (factor > 1 amplifies differences)" }));
div >
;
{
    distributionType === 'gaussian' && ()
        <  >
        (_jsxs("div", { style: { marginBottom: 12 }, children: [_jsx(TextFieldEditor, { label: "Gaussian Mean (0-1)", value: gaussianMean, fieldKey: "gaussianMean", zodType: null, onChange: handleGaussianMeanChange, placeholder: "0.5" }), _jsx("div", { style: {
                        fontSize: 10,
                        color: '#a0aec0',
                        marginTop: 2,
                    }, children: "Center of the bell curve (0 = first choice, 1 = last choice, 0.5 = middle)" })] })
            ,
                _jsxs("div", { style: { marginBottom: 16 }, children: [_jsx(TextFieldEditor, { label: "Standard Deviation", value: gaussianStd, fieldKey: "gaussianStd", zodType: null, onChange: handleGaussianStdChange, placeholder: "0.2" }), _jsx("div", { style: {
                                fontSize: 10,
                                color: '#a0aec0',
                                marginTop: 2,
                            }, children: "Width of the bell curve (smaller = more focused, larger = more spread)" })] }));
     >
    ;
}
{ /* General settings */ }
_jsxs("div", { style: { marginBottom: 12 }, children: [_jsxs("label", { style: {
                display: 'flex',
                alignItems: 'center',
                fontSize: 12,
                color: '#e2e8f0',
                cursor: 'pointer',
            }, children: [_jsx("input", { type: "checkbox", checked: normalize, onChange: (e) => handleNormalizeChange(e.target.checked), style: { marginRight: 8 } }), "Normalize Weights"] }), _jsx("div", { style: {
                fontSize: 10,
                color: '#a0aec0',
                marginTop: 2,
                marginLeft: 20,
            }, children: "Scale final weights to sum to 1.0 for probability calculations" })] })
    ,
        _jsxs("div", { style: { marginBottom: 16 }, children: [_jsx(TextFieldEditor, { label: "Minimum Weight", value: minWeight, fieldKey: "minWeight", zodType: null, onChange: handleMinWeightChange, placeholder: "0" }), _jsx("div", { style: {
                        fontSize: 10,
                        color: '#a0aec0',
                        marginTop: 2,
                    }, children: "Minimum weight threshold (0 = no minimum)" })] });
{ /* Distribution Explanation */ }
_jsxs("div", { style: {
        background: '#1a202c',
        border: '1px solid #4a5568',
        borderRadius: 4,
        padding: 8,
    }, children: [_jsx("div", { style: {
                fontSize: 11,
                fontWeight: 500,
                color: '#e2e8f0',
                marginBottom: 4,
            }, children: "Distribution Effects:" }), _jsxs("div", { style: {
                fontSize: 10,
                color: '#a0aec0',
                lineHeight: 1.4,
            }, children: [distributionType === 'linear' &&
                    'Uses original weights without modification. Simple and predictable.', distributionType === 'exponential' &&
                    `Applies power transformation: weight^${exponentialFactor}. Amplifies differences between weights.`, distributionType === 'gaussian' &&
                    `Applies bell curve centered at position ${gaussianMean} with spread ${gaussianStd}. Favors choices near the center.`, distributionType === 'custom' &&
                    'Uses custom transformation function. Implementation depends on specific requirements.'] })] });
ProgressiveDisclosureSection >
    { /* DEBUG LEVEL: Technical details and visualization */}
    < ProgressiveDisclosureSection;
title = "Technical Analysis & Preview";
level = "debug";
description = "Advanced distribution analysis, visualization, and raw data";
defaultExpanded = { false:  };
priority = "supplementary";
fieldName = "debug"
    >
        { /* Debug Node Information */}
    < div;
style = {};
{
    background: '#1a202c',
        border;
    '1px solid #4a5568',
        borderRadius;
    4,
        padding;
    8,
        marginBottom;
    16,
    ;
}
 >
    (_jsx("div", { style: {
            fontSize: 11,
            fontWeight: 500,
            color: '#e2e8f0',
            marginBottom: 4,
        }, children: "Node Configuration:" })
        ,
            _jsxs("div", { style: { fontSize: 10, color: '#a0aec0', lineHeight: 1.4 }, children: [_jsxs("div", { children: ["Node ID: ", props.nodeId] }), _jsx("div", { children: "Type: WeightedAdvanced" }), _jsxs("div", { children: ["Choices: ", choices.length] }), _jsxs("div", { children: ["Distribution: ", distributionType] }), _jsxs("div", { children: ["Normalization: ", normalize ? 'Enabled' : 'Disabled'] }), _jsxs("div", { children: ["Min Weight: ", minWeight] }), distributionType === 'exponential' && _jsxs("div", { children: ["Exponential Factor: ", exponentialFactor] }), distributionType === 'gaussian' && ()
                        <  >
                        (_jsxs("div", { children: ["Gaussian Mean: ", gaussianMean] })
                            ,
                                _jsxs("div", { children: ["Gaussian Std: ", gaussianStd] }))] }));
div >
;
div >
    { /* Selection Preview */}
    < div;
style = {};
{
    background: '#1a202c',
        border;
    '1px solid #4a5568',
        borderRadius;
    4,
        padding;
    12,
        fontSize;
    12,
        color;
    '#e2e8f0',
    ;
}
 >
    { choices, : .length === 0 ? ()
            < div : , style = {} };
{
    color: '#a0aec0', fontStyle;
    'italic';
}
 >
    Add;
weighted;
choices;
to;
see;
selection;
preview;
div >
;
()
    < div >
    _jsxs("div", { style: { marginBottom: 8, fontWeight: 500 }, children: ["Weighted Selection Preview (", distributionType, "):"] });
{
    choices.map((choice, index) => {
        const rawWeight = choice.weight;
        const effectiveWeight = effectiveWeights[index] || 0;
        const percentage = effectiveWeights.length > 0 && effectiveWeights.reduce((sum, w) => sum + w, 0) > 0;
        Math.round((effectiveWeight / effectiveWeights.reduce((sum, w) => sum + w, 0)) * 100);
        Math.round(100 / choices.length);
        return;
        _jsxs("div", { style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 4,
                padding: '4px 8px',
                background: 'rgba(66, 153, 225, 0.1)',
                borderRadius: 2,
            }, children: [_jsxs("span", { style: { flex: 1 }, children: ["\"", choice.value, "\""] }), _jsxs("span", { style: { color: '#a0aec0', fontSize: 10, minWidth: 80 }, children: [rawWeight, " \u2192 ", effectiveWeight.toFixed(3)] }), _jsxs("span", { style: { color: '#90cdf4', minWidth: 50, textAlign: 'right' }, children: [percentage, "%"] })] }, index);
    });
}
{ /* Total weights summary */ }
_jsxs("div", { style: {
        marginTop: 8,
        paddingTop: 8,
        borderTop: '1px solid #4a5568',
        fontSize: 10,
        color: '#a0aec0',
    }, children: ["Raw total: ", choices.reduce((sum, c) => sum + c.weight, 0).toFixed(2), " \u2192 Effective total: ", effectiveWeights.reduce((sum, w) => sum + w, 0).toFixed(3), normalize && ' (normalized to 1.0)'] });
div >
;
div >
    { /* Weight Distribution Visualization */};
{
    choices.length > 0 && weightOptions.length > 0 && ()
        < div;
    style = {};
    {
        marginTop: 16;
    }
}
 >
    _jsx(WeightVisualizationPanel, { options: weightOptions, title: "Distribution Visualization", defaultChartType: "donut", showChartControls: true, showStatistics: true, collapsed: false, onCollapseChange: () => { }, onOptionHover: (option) => {
            console.log('Advanced weight hovered:', option?.text);
        }, onOptionClick: (option) => {
            console.log('Advanced weight clicked:', option.text);
        } });
div >
;
ProgressiveDisclosureSection >
;
div >
;
;
;
export default WeightedAdvancedEditor;
