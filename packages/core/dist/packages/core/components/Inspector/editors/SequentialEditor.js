import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { TextFieldEditor } from '../TextFieldEditor';
import { SelectEditor } from '../SelectEditor';
import { VariationList } from '../VariationList';
import { ProgressiveDisclosureSection } from '../ProgressiveDisclosureSection';
import { WeightSlider } from '../WeightSlider';
import { useContextualHelp } from '../../Help';
;
const handlePatternTypeChange = (value) => {
    const newPatternType = value;
    const newConfig = { ...patternConfig };
    // Initialize pattern-specific configuration
    if (newPatternType === 'weighted') {
        newConfig.weights = sequence.map((_, index) => weights[index] || 1);
    }
    else if (newPatternType === 'random') {
        newConfig.allowRepeats = allowRepeats;
        onChange({});
        patternType: newPatternType,
            patternConfig;
        newConfig,
        ;
    }
    ;
};
const handleWeightChange = (index, weight) => {
    const newWeights = [...weights];
    newWeights[index] = Math.max(0, weight);
    onChange({});
    patternConfig: { }
};
patternConfig,
    weights;
newWeights,
;
;
;
const handleAllowRepeatsChange = (value) => {
    onChange({});
    patternConfig: { }
};
patternConfig,
    allowRepeats;
Boolean(value),
;
;
;
const handleNameChange = (value) => {
    onChange({ name: value, label: value });
};
const patternOptions = [];
{
    value: 'linear', label;
    'Linear - Sequential order, stops at end';
}
{
    value: 'cyclical', label;
    'Cyclical - Cycles through infinitely';
}
{
    value: 'random', label;
    'Random - Random selection';
}
{
    value: 'weighted', label;
    'Weighted - Probability-based selection';
}
;
// Contextual help for the sequence name field
const { wrapWithHelp: wrapNameHelp } = useContextualHelp({});
id: 'sequential-sequence-name',
    title;
'Sequence Name',
    description;
'Give your sequential node a descriptive name that explains what sequence it manages.',
    category;
'basic',
    trigger;
'focus',
    position;
'right',
    showOnDisclosureLevel;
['basic', 'advanced', 'debug'],
    examples;
['Dialogue Styles', 'Scene Transitions', 'Character Arcs'],
    priority;
'high',
;
;
// Contextual help for sequence items
const { wrapWithHelp: wrapItemsHelp } = useContextualHelp({});
id: 'sequential-sequence-items',
    title;
'Sequence Items',
    description;
'Add items that will be cycled through in your chosen pattern. The order matters for linear and cyclical patterns.',
    category;
'basic',
    trigger;
'hover',
    position;
'left',
    showOnDisclosureLevel;
['basic', 'advanced', 'debug'],
    examples;
['Dramatic pause', 'Quick cut', 'Character entrance'],
    relatedFeatures;
['drag-reorder', 'pattern-selection'],
    priority;
'high',
;
;
// Contextual help for pattern selection
const { wrapWithHelp: wrapPatternHelp } = useContextualHelp({});
id: 'sequential-pattern-selection',
    title;
'Selection Method',
    description;
'Choose how items are selected from your sequence. Linear goes in order, cyclical repeats infinitely, random is unpredictable, and weighted uses probability.',
    category;
'advanced',
    trigger;
'hover',
    position;
'top',
    showOnDisclosureLevel;
['advanced', 'debug'],
    examples;
['Linear: 1→2→3→3...', 'Cyclical: 1→2→3→1→2...', 'Random: 2→1→3→1...'],
    priority;
'medium',
;
;
return;
_jsx("div", { className: "sequential-editor", children: _jsxs(ProgressiveDisclosureSection, { title: "Essential Settings", level: "basic", description: "Core sequence configuration for storytelling", defaultExpanded: true, priority: "critical", fieldName: "sequence", children: [wrapNameHelp()
                < div, " style=", { marginBottom: 16 }, ">", _jsx(TextFieldEditor, { label: "Sequence Name", value: name, fieldKey: "name", zodType: null, onChange: handleNameChange, placeholder: "e.g., Dialogue Styles, Scene Transitions, Character Arcs" })] }) });
{
    wrapItemsHelp()
        < div;
    style = {};
    {
        marginBottom: 8;
    }
}
 >
    (_jsx("label", { style: {
            display: 'block',
            fontWeight: 500,
            marginBottom: 8,
            color: '#e2e8f0',
            fontSize: 12,
        }, children: "Sequence Items" })
        ,
            _jsx(VariationList, { nodeId: nodeData.id, variations: sequence, onAdd: (item) => handleSequenceChange([...sequence, item]), onRemove: (index) => {
                    const newSequence = sequence.filter((_, i) => i !== index);
                    handleSequenceChange(newSequence);
                }, onUpdate: (index, newValue) => {
                    const newSequence = [...sequence];
                    newSequence[index] = newValue;
                    handleSequenceChange(newSequence);
                }, onReorder: (fromIndex, toIndex) => {
                    const newSequence = [...sequence];
                    const [movedItem] = newSequence.splice(fromIndex, 1);
                    newSequence.splice(toIndex, 0, movedItem);
                    handleSequenceChange(newSequence);
                }, placeholder: "Add sequence item... e.g., 'Dramatic pause', 'Quick cut', 'Character entrance'", maxVariations: 100, allowQuickEntry: true })
                ,
                    _jsx("div", { style: {
                            fontSize: 10,
                            color: '#a0aec0',
                            marginTop: 4,
                        }, children: "Add items that will be cycled through in your chosen pattern" }));
div >
;
ProgressiveDisclosureSection >
    { /* ADVANCED LEVEL: Pattern configuration for power users */}
    < ProgressiveDisclosureSection;
title = "Sequence Pattern";
level = "advanced";
description = "Control how items are selected from the sequence";
defaultExpanded = { false:  };
priority = "important";
fieldName = "patternType"
    >
        {}
    < div;
style = {};
{
    marginBottom: 16;
}
 >
    (_jsx(SelectEditor, { label: "Selection Method", value: patternType, fieldKey: "patternType", zodType: null, onChange: handlePatternTypeChange, options: patternOptions })
        ,
            _jsx("div", { style: {
                    fontSize: 10,
                    color: '#a0aec0',
                    marginTop: 4,
                }, children: "Choose how the system selects items from your sequence" }));
div >
;
{ /* Pattern-specific configuration */ }
{
    patternType === 'weighted' && sequence.length > 0 && ()
        < div;
    style = {};
    {
        marginBottom: 16;
    }
}
 >
    (_jsx("label", { style: {
            display: 'block',
            fontWeight: 500,
            marginBottom: 8,
            color: '#e2e8f0',
            fontSize: 12,
        }, children: "Item Weights" })
        ,
            _jsxs("div", { style: {
                    background: '#2d3748',
                    border: '1px solid #4a5568',
                    borderRadius: 4,
                    padding: 8,
                }, children: [sequence.map((item, index) => {
                        const weight = weights[index] || 1;
                        const percentage = weights.length > 0;
                    })
                        ? Math.round((weight / weights.reduce((sum, w) => sum + w, 0)) * 100)
                        : Math.round(100 / sequence.length), "; return;", _jsxs("div", { style: {
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: index < sequence.length - 1 ? 8 : 0,
                            gap: 8,
                        }, children: [_jsx("div", { style: {
                                    flex: 1,
                                    fontSize: 12,
                                    color: '#e2e8f0',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }, children: item || `Item ${index + 1}` }), _jsx("div", { style: { flex: 1, minWidth: 120 }, children: _jsx(WeightSlider, { value: weight, onChange: (newWeight) => handleWeightChange(index, newWeight), min: 0, max: Math.max(10, Math.max(...(nodeData.patternConfig?.weights || [1])) * 1.5), step: 0.1, showNumeric: false }) }), _jsxs("div", { style: {
                                    width: 40,
                                    fontSize: 10,
                                    color: '#a0aec0',
                                    textAlign: 'right',
                                }, children: [percentage, "%"] })] }, index), "); })}", _jsxs("div", { style: {
                            marginTop: 8,
                            paddingTop: 8,
                            borderTop: '1px solid #4a5568',
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: 11,
                            color: '#a0aec0',
                        }, children: [_jsx("span", { children: "Total Weight:" }), _jsx("span", { children: weights.reduce((sum, w) => sum + w, 0).toFixed(1) })] })] }));
{ /* Weight Controls */ }
_jsxs("div", { style: {
        marginTop: 8,
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
    }, children: [_jsx("button", { onClick: () => {
                const equalWeight = 1;
                const newWeights = sequence.map(() => equalWeight);
                onChange({});
                patternConfig: { }
            } }), " ...patternConfig, weights: newWeights } }); }} style=", {
            padding: '4px 8px',
            fontSize: 10,
            background: '#4a5568',
            border: 'none',
            borderRadius: 2,
            color: '#e2e8f0',
            cursor: 'pointer',
        }, "> Equal Weights"] })
    ,
        _jsx("button", { onClick: () => {
                const randomWeights = sequence.map(() => Math.random() * 10 + 1);
                onChange({});
                patternConfig: {
                    patternConfig, weights;
                    randomWeights;
                }
            }, style: {
                padding: '4px 8px',
                fontSize: 10,
                background: '#4a5568',
                border: 'none',
                borderRadius: 2,
                color: '#e2e8f0',
                cursor: 'pointer',
            }, children: "Random Weights" });
div >
;
div >
;
{
    patternType === 'random' && ()
        < div;
    style = {};
    {
        marginBottom: 16;
    }
}
 >
    (_jsxs("label", { style: {
            display: 'flex',
            alignItems: 'center',
            fontSize: 12,
            color: '#e2e8f0',
            cursor: 'pointer',
        }, children: [_jsx("input", { type: "checkbox", checked: allowRepeats, onChange: (e) => handleAllowRepeatsChange(e.target.checked), style: { marginRight: 8 } }), "Allow Repeats"] })
        ,
            _jsx("div", { style: {
                    fontSize: 10,
                    color: '#a0aec0',
                    marginTop: 2,
                    marginLeft: 20,
                }, children: "When unchecked, items won't repeat until all have been selected" }));
div >
;
ProgressiveDisclosureSection >
    { /* DEBUG LEVEL: Technical details and pattern behavior */}
    < ProgressiveDisclosureSection;
title = "Technical Details & Preview";
level = "debug";
description = "Pattern behavior explanation and execution preview";
defaultExpanded = { false:  };
priority = "supplementary";
fieldName = "preview"
    >
        { /* Pattern Description */}
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
        }, children: "Pattern Behavior:" })
        ,
            _jsxs("div", { style: {
                    fontSize: 10,
                    color: '#a0aec0',
                    lineHeight: 1.4,
                }, children: [patternType === 'linear' &&
                        'Goes through items in order from first to last, then continues returning the last item.', patternType === 'cyclical' &&
                        'Cycles through items infinitely: item1 → item2 → ... → itemN → item1 → ...', patternType === 'random' && (allowRepeats)
                        ? 'Selects items randomly with the possibility of repeating the same item.'
                        : 'Selects items randomly without repeats until all items have been chosen.', ")}", patternType === 'weighted' &&
                        'Selects items based on their assigned weights - higher weights have higher probability.'] }));
div >
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
            _jsxs("div", { style: { fontSize: 10, color: '#a0aec0', lineHeight: 1.4 }, children: [_jsxs("div", { children: ["Node ID: ", nodeData.id] }), _jsx("div", { children: "Type: Sequential" }), _jsxs("div", { children: ["Items: ", sequence.length] }), _jsxs("div", { children: ["Pattern: ", patternType] }), patternType === 'weighted' && ()
                        < div > Total, " Weight: ", weights.reduce((sum, w) => sum + w, 0).toFixed(1)] }));
div >
;
div >
    _jsxs("div", { style: {
            background: '#1a202c',
            border: '1px solid #4a5568',
            borderRadius: 4,
            padding: 12,
            fontSize: 12,
            color: '#e2e8f0',
        }, children: [sequence.length === 0 ? ()
                < div : , " style=", { color: '#a0aec0', fontStyle: 'italic' }, "> Add sequence items to see preview"] });
(_jsxs("div", { children: [")", _jsxs("div", { style: { marginBottom: 8, fontWeight: 500 }, children: ["Sequence Preview (", patternType, "):"] }), patternType === 'linear' && ()
            < div >
            _jsx("div", { style: { marginBottom: 6, color: '#90cdf4', fontSize: 11 }, children: "Linear execution order:" }), sequence.map((item, index) => ()
            < div, key = { index }, style = {}, {
            display: 'flex',
            alignItems: 'center',
            marginBottom: 2,
            padding: '2px 4px',
            background: index === 0 ? 'rgba(66, 153, 225, 0.2)' : 'rgba(66, 153, 225, 0.1)',
            borderRadius: 2,
        }), ">", _jsxs("span", { style: { minWidth: 20, color: '#a0aec0' }, children: [index + 1, "."] }), _jsxs("span", { children: ["\"", item, "\""] }), index === sequence.length - 1 && ()
            < span, " style=", { marginLeft: 8, fontSize: 9, color: '#fbb6ce' }, "> (repeats)"] }));
div >
;
div >
;
{
    patternType === 'cyclical' && ()
        < div >
        _jsx("div", { style: { marginBottom: 6, color: '#90cdf4', fontSize: 11 }, children: "Cyclical pattern:" });
    {
        sequence.slice(0, Math.min(5, sequence.length)).map((item, index) => ()
            < div, key = { index }, style = {}, {
            display: 'inline-block',
            margin: '2px 4px',
            padding: '2px 6px',
            background: 'rgba(66, 153, 225, 0.1)',
            borderRadius: 2,
        });
    }
     >
        & quot;
    {
        item;
    }
     & quot;
    div >
    ;
}
{
    sequence.length > 5 && ()
        < span;
    style = {};
    {
        color: '#a0aec0', fontSize;
        10;
    }
}
 >
;
+{ sequence, : .length - 5 };
more;
span >
;
_jsx("div", { style: { marginTop: 4, fontSize: 9, color: '#fbb6ce' }, children: "\u21BB Cycles infinitely" });
div >
;
{
    patternType === 'weighted' && weights.length > 0 && ()
        < div >
        _jsx("div", { style: { marginBottom: 6, color: '#90cdf4', fontSize: 11 }, children: "Selection probabilities:" });
    {
        sequence.map((item, index) => {
            const weight = weights[index] || 1;
            const percentage = Math.round((weight / weights.reduce((sum, w) => sum + w, 0)) * 100);
            return;
            _jsxs("div", { style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 2,
                    padding: '2px 4px',
                    background: 'rgba(66, 153, 225, 0.1)',
                    borderRadius: 2,
                }, children: [_jsxs("span", { children: ["\"", item, "\""] }), _jsxs("span", { style: { color: '#a0aec0' }, children: [percentage, "%"] })] }, index);
        });
    }
}
div >
;
{
    patternType === 'random' && ()
        < div >
        _jsx("div", { style: { marginBottom: 6, color: '#90cdf4', fontSize: 11 }, children: "Random selection from:" });
    {
        sequence.map((item, index) => ()
            < div, key = { index }, style = {}, {
            display: 'inline-block',
            margin: '2px 4px',
            padding: '2px 6px',
            background: 'rgba(66, 153, 225, 0.1)',
            borderRadius: 2,
        });
    }
     >
        & quot;
    {
        item;
    }
     & quot;
    div >
    ;
}
_jsx("div", { style: { marginTop: 6, fontSize: 9, color: '#fbb6ce' }, children: allowRepeats ? '🔄 With repeats' : '🔒 No repeats until exhausted' });
div >
;
div >
;
div >
;
ProgressiveDisclosureSection >
;
div >
;
;
;
export default SequentialEditor;
