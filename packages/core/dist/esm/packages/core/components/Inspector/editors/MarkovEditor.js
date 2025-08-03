import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { TextFieldEditor } from '../TextFieldEditor';
import { TextAreaEditor } from '../TextAreaEditor';
import { ProgressiveDisclosureSection } from '../ProgressiveDisclosureSection';
import { WeightSlider } from '../WeightSlider';
 >
    { states, : .map((state, index) => ()
            < div, key = { index }, style = {}, {
            display: 'flex',
            alignItems: 'center',
            marginBottom: index < states.length - 1 ? 8 : 0,
            gap: 8
        })
    }
    >
        (_jsx("input", { type: "text", value: state, onChange: (e) => handleUpdateState(index, e.target.value), style: {
                flex: 1,
                padding: 4,
                border: '1px solid #4a5568',
                borderRadius: 2,
                background: '#1a202c',
                color: '#e2e8f0',
                fontSize: 11
            }, placeholder: 'e.g., "Joyful", "Mysterious", "Tense"' })
            ,
                _jsx("button", { onClick: () => handleRemoveState(index), style: {
                        background: '#e53e3e',
                        border: 'none',
                        borderRadius: 2,
                        color: '#fff',
                        cursor: 'pointer',
                        padding: '2px 6px',
                        fontSize: 10
                    }, children: "Remove" }));
div >
;
div >
;
div >
;
ProgressiveDisclosureSection >
    { /* ADVANCED LEVEL: Transition matrix and probability controls */}
    < ProgressiveDisclosureSection;
title = "Transition Controls";
level = "advanced";
description = "Fine-tune how states flow into each other";
defaultExpanded = { false:  };
priority = "important";
fieldName = "transitions"
    >
        _jsxs("div", { style: { marginBottom: 12 }, children: [_jsxs("div", { style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 8
                    }, children: [_jsx("label", { style: {
                                fontWeight: 500,
                                color: '#e2e8f0',
                                fontSize: 12
                            }, children: "Markov Chain States" }), _jsx("button", { onClick: handleAddState, style: {
                                padding: '4px 8px',
                                fontSize: 10,
                                background: '#4299e1',
                                border: 'none',
                                borderRadius: 2,
                                color: '#fff',
                                cursor: 'pointer'
                            }, children: "Add State" })] }), states.length === 0 ? ()
                    < div : , " style=", {
                    background: '#2d3748',
                    border: '1px solid #4a5568',
                    borderRadius: 4,
                    padding: 16,
                    textAlign: 'center',
                    color: '#a0aec0',
                    fontSize: 12,
                    fontStyle: 'italic'
                }, "> No states defined. Add states to create your Markov chain."] });
()
    < div;
style = {};
{
    background: '#2d3748';
    border: '1px solid #4a5568';
    borderRadius: 4;
    padding: 8;
}
 >
    { states, : .map((state, index) => ()
            < div, key = { index }, style = {}, {
            display: 'flex',
            alignItems: 'center',
            marginBottom: index < states.length - 1 ? 8 : 0,
            gap: 8
        })
    }
    >
        _jsx("input", { type: "text", value: state, onChange: (e) => handleUpdateState(index, e.target.value), style: {
                flex: 1,
                padding: 4,
                border: '1px solid #4a5568',
                borderRadius: 2,
                background: '#1a202c',
                color: '#e2e8f0',
                fontSize: 11
            }, placeholder: `State ${index + 1}` });
{ /* Probability total indicator */ }
_jsx("div", { style: {
        fontSize: 10,
        color: probabilityTotals[state] === 1 ? '#68d391' : '#fbb6ce',
        minWidth: 50,
        textAlign: 'center'
    }, children: probabilityTotals[state]?.toFixed(2) || '0.00' })
    ,
        _jsx("button", { onClick: () => handleRemoveState(index), style: {
                background: '#e53e3e',
                border: 'none',
                borderRadius: 2,
                color: '#fff',
                cursor: 'pointer',
                padding: '2px 6px',
                fontSize: 10
            }, children: "Remove" });
div >
;
div >
;
div >
;
ProgressiveDisclosureSection >
    { /* Transitions */}
    < ProgressiveDisclosureSection;
title = "Transition Matrix";
level = "advanced";
description = "Define how states transition into each other";
defaultExpanded = { false:  };
priority = "important";
fieldName = "transitions"
    >
        _jsx("div", { style: { marginBottom: 12 }, children: _jsxs("div", { style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 8
                }, children: [_jsx("label", { style: {
                            fontWeight: 500,
                            color: '#e2e8f0',
                            fontSize: 12
                        }, children: "State Transitions" }), _jsx("button", { onClick: handleAddTransition, disabled: states.length < 2, style: {
                            padding: '4px 8px',
                            fontSize: 10,
                            background: states.length < 2 ? '#4a5568' : '#4299e1',
                            border: 'none',
                            borderRadius: 2,
                            color: '#fff',
                            cursor: states.length < 2 ? 'not-allowed' : 'pointer'
                        }
                            >
                                Add, Transition: true })] }) });
{
    transitionArray.length === 0 ? ()
        < div : ;
    style = {};
    {
        background: '#2d3748';
        border: '1px solid #4a5568';
        borderRadius: 4;
        padding: 16;
        textAlign: 'center';
        color: '#a0aec0';
        fontSize: 12;
        fontStyle: 'italic';
    }
}
 >
    No;
transitions;
defined.Add;
transitions;
to;
define;
state;
behavior.
;
div >
;
()
    < div;
style = {};
{
    background: '#2d3748';
    border: '1px solid #4a5568';
    borderRadius: 4;
    padding: 8;
}
 >
    { transitionArray, : .map((transition, index) => ()
            < div, key = { index }, style = {}, {
            background: '#1a202c',
            border: '1px solid #4a5568',
            borderRadius: 4,
            padding: 8,
            marginBottom: index < transitionArray.length - 1 ? 8 : 0
        })
    }
    >
        _jsx("div", { style: {
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 8
            }, children: _jsx("select", { value: transition.from, onChange: (e) => handleUpdateTransition(index, 'from', e.target.value), style: {
                    flex: 1,
                    padding: 4,
                    border: '1px solid #4a5568',
                    borderRadius: 2,
                    background: '#2d3748',
                    color: '#e2e8f0',
                    fontSize: 11
                }
                    >
                        { states, : .map((state) => ()
                                < option, key = { state }, value = { state } > { state }) } }) });
select >
    (_jsx("span", { style: { color: '#a0aec0', fontSize: 12 }, children: "\u2192" })
        ,
            _jsxs("select", { value: transition.to, onChange: (e) => handleUpdateTransition(index, 'to', e.target.value), style: {
                    flex: 1,
                    padding: 4,
                    border: '1px solid #4a5568',
                    borderRadius: 2,
                    background: '#2d3748',
                    color: '#e2e8f0',
                    fontSize: 11
                }
                    >
                        { states, : .map((state) => ()
                                < option, key = { state }, value = { state } > { state }, option >
                            ) }, select: true, children: [_jsx("button", { onClick: () => handleRemoveTransition(index), style: {
                            background: '#e53e3e',
                            border: 'none',
                            borderRadius: 2,
                            color: '#fff',
                            cursor: 'pointer',
                            padding: '2px 6px',
                            fontSize: 10
                        }
                            >
                     }), "\u2715"] }));
div >
    _jsxs("div", { style: {
            display: 'flex',
            alignItems: 'center',
            gap: 8
        }, children: [_jsx(WeightSlider, { value: transition.probability, onChange: (newProb) => handleUpdateTransition(index, 'probability', newProb), min: 0, max: 1, step: 0.01, showNumeric: true, label: "Probability" }), _jsx("button", { onClick: () => normalizeTransitions(transition.from), style: {
                    padding: '2px 6px',
                    fontSize: 9,
                    background: '#38a169',
                    border: 'none',
                    borderRadius: 2,
                    color: '#fff',
                    cursor: 'pointer'
                }
                    >
                        Normalize, ...transition.from })] });
div >
;
div >
;
div >
;
div >
    { /* Probability Summary */};
{
    states.length > 0 && ()
        < div;
    style = {};
    {
        background: '#1a202c';
        border: '1px solid #4a5568';
        borderRadius: 4;
        padding: 8;
        marginTop: 12;
    }
}
 >
    (_jsx("div", { style: {
            fontSize: 11,
            fontWeight: 500,
            color: '#e2e8f0',
            marginBottom: 4
        }, children: "Probability Totals by State:" })
        ,
            _jsxs("div", { style: {
                    fontSize: 10,
                    color: '#a0aec0',
                    lineHeight: 1.4
                }, children: [states.map(state => { }), "const total = probabilityTotals[state] || 0; const isValid = Math.abs(total - 1.0) ", _jsx(, {}), " 0.001; return;", _jsxs("div", { style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            color: isValid ? '#68d391' : '#fbb6ce'
                        }, children: [_jsxs("span", { children: [state, ":"] }), _jsxs("span", { children: [total.toFixed(3), " ", isValid ? '✓' : '⚠'] })] }, state), "); })}"] }));
div >
;
ProgressiveDisclosureSection >
    { /* Settings */}
    < ProgressiveDisclosureSection;
title = "Debug Settings";
level = "debug";
description = "Advanced configuration and loop detection";
defaultExpanded = { false:  };
priority = "optional";
fieldName = "settings"
    >
        (_jsxs("div", { style: { marginBottom: 12 }, children: [_jsx(TextFieldEditor, { label: "Max Transitions", value: maxTransitions, fieldKey: "maxTransitions", zodType: null, onChange: handleMaxTransitionsChange, placeholder: "1000" }), _jsx("div", { style: {
                        fontSize: 10,
                        color: '#a0aec0',
                        marginTop: 2
                    }, children: "Maximum number of transitions before forcing termination" })] })
            ,
                _jsxs("div", { style: { marginBottom: 12 }, children: [_jsxs("label", { style: {
                                display: 'flex',
                                alignItems: 'center',
                                fontSize: 12,
                                color: '#e2e8f0',
                                cursor: 'pointer'
                            }, children: [_jsx("input", { type: "checkbox", checked: detectLoops, onChange: (e) => handleDetectLoopsChange(e.target.checked), style: { marginRight: 8 } }), "Detect Loops"] }), _jsx("div", { style: {
                                fontSize: 10,
                                color: '#a0aec0',
                                marginTop: 2,
                                marginLeft: 20
                            }, children: "Stop execution when repetitive state patterns are detected" })] })
                    ,
                        _jsxs("div", { children: [_jsx(TextAreaEditor, { label: "Termination States", value: terminationStates.join(', '), fieldKey: "terminationStates", zodType: null, onChange: handleTerminationStatesChange, placeholder: "State1, State2, State3...", rows: 2 }), _jsx("div", { style: {
                                        fontSize: 10,
                                        color: '#a0aec0',
                                        marginTop: 2
                                    }, children: "Comma-separated list of states that will stop the chain when reached" })] }));
ProgressiveDisclosureSection >
    { /* Preview */}
    < ProgressiveDisclosureSection;
title = "Chain Preview";
level = "debug";
description = "Visual representation of your Markov chain";
defaultExpanded = { false:  };
priority = "helpful";
fieldName = "preview"
    >
        _jsxs("div", { style: {
                background: '#1a202c',
                border: '1px solid #4a5568',
                borderRadius: 4,
                padding: 12,
                fontSize: 12,
                color: '#e2e8f0'
            }, children: [states.length === 0 ? ()
                    < div : , " style=", { color: '#a0aec0', fontStyle: 'italic' }, "> Add states to see Markov chain preview"] });
()
    < div >
    (_jsx("div", { style: { marginBottom: 8, fontWeight: 500 }, children: "Markov Chain Configuration:" })
        ,
            _jsxs("div", { style: { marginBottom: 8 }, children: [_jsx("span", { style: { color: '#90cdf4' }, children: "States:" }), " ", states.length, " total", _jsx("br", {}), _jsx("span", { style: { color: '#90cdf4' }, children: "Initial:" }), " ", initialState || 'Not set', _jsx("br", {}), _jsx("span", { style: { color: '#90cdf4' }, children: "Transitions:" }), " ", transitionArray.length, " defined"] }));
{
    transitionArray.length > 0 && ()
        < div;
    style = {};
    {
        marginTop: 8;
    }
}
 >
    _jsx("div", { style: { fontSize: 11, color: '#90cdf4', marginBottom: 4 }, children: "Transition Matrix:" });
{
    states.map(fromState => { });
    const stateTransitions = transitions[fromState] || {};
    const hasTransitions = Object.keys(stateTransitions).length > 0;
    if (!hasTransitions)
        return null;
    return;
    _jsxs("div", { style: {
            marginBottom: 4,
            padding: '2px 4px',
            background: 'rgba(66, 153, 225, 0.1)',
            borderRadius: 2,
            fontSize: 10
        }, children: [_jsx("span", { style: { fontWeight: 500 }, children: fromState }), " \u2192", ' ', Object.entries(stateTransitions).map(([toState, prob]) => () `${toState}(${(prob * 100).toFixed(1)}%)`), ")).join(', ')}"] }, fromState);
    ;
}
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
