import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { TextFieldEditor } from '../TextFieldEditor';
import { VariationList } from '../VariationList';
import { WeightSlider } from '../WeightSlider';
import { ProgressiveDisclosureSection } from '../ProgressiveDisclosureSection';
/**
 * Epic 8.4 - Enhanced WeightedChoice Editor with Progressive Disclosure
 *
 * Demonstrates the three-tier disclosure system:
 * - Basic: Essential name and choices only
 * - Advanced: Weight controls and randomization settings
 * - Debug: Node IDs, technical configurations, execution statistics
 */
export const EnhancedWeightedChoiceEditor = ({ nodeId, nodeData, onChange }) => {
    // WeightedChoice specific fields
    const choices = nodeData.choices || [];
    const weights = nodeData.weights || [];
    const name = nodeData.name || nodeData.label || 'WeightedChoice';
    const handleChoicesChange = (newChoices) => {
        onChange({
            choices: newChoices,
            // Ensure weights array matches choices length
            weights: newChoices.map((_, index) => weights[index] || 1)
        });
    };
    const handleWeightChange = (index, weight) => {
        const newWeights = [...weights];
        newWeights[index] = Math.max(0, weight); // Ensure non-negative weights
        onChange({ weights: newWeights });
    };
    const handleNameChange = (value) => {
        onChange({ name: value, label: value });
    };
    return (_jsxs("div", { className: "enhanced-weighted-choice-editor", children: [_jsxs(ProgressiveDisclosureSection, { title: "Essential Settings", level: "basic", description: "Core node configuration", defaultExpanded: true, children: [_jsx("div", { style: { marginBottom: 12 }, children: _jsx(TextFieldEditor, { label: "Name", value: name, onChange: handleNameChange, placeholder: "e.g., Character Emotion, Scene Type" }) }), _jsxs("div", { style: { marginBottom: 8 }, children: [_jsx("label", { style: {
                                    display: 'block',
                                    fontSize: 12,
                                    fontWeight: 500,
                                    color: '#e2e8f0',
                                    marginBottom: 6
                                }, children: "Choices" }), _jsx(VariationList, { variations: choices, onChange: handleChoicesChange, placeholder: "Add a choice option...", maxVariations: 10 })] })] }), _jsxs(ProgressiveDisclosureSection, { title: "Weight Controls", level: "advanced", description: "Fine-tune randomization probabilities", defaultExpanded: false, children: [choices.length > 0 && (_jsxs("div", { style: { marginBottom: 16 }, children: [_jsx("div", { style: {
                                    fontSize: 12,
                                    color: '#a0aec0',
                                    marginBottom: 12,
                                    fontStyle: 'italic'
                                }, children: "Adjust the probability of each choice being selected. Higher weights = more likely." }), choices.map((choice, index) => (_jsxs("div", { style: { marginBottom: 8 }, children: [_jsxs("div", { style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8,
                                            marginBottom: 4
                                        }, children: [_jsx("div", { style: {
                                                    fontSize: 11,
                                                    color: '#e2e8f0',
                                                    flex: 1,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }, children: choice.length > 20 ? `${choice.substring(0, 20)}...` : choice }), _jsxs("div", { style: {
                                                    fontSize: 10,
                                                    color: '#a0aec0',
                                                    minWidth: 40,
                                                    textAlign: 'right'
                                                }, children: [((weights[index] || 1) / (weights.reduce((sum, w) => sum + (w || 1), 0)) * 100).toFixed(0), "%"] })] }), _jsx(WeightSlider, { value: weights[index] || 1, onChange: (weight) => handleWeightChange(index, weight), min: 0, max: 10, step: 0.1 })] }, index)))] })), _jsxs("div", { style: {
                            padding: 8,
                            background: '#2a4365',
                            borderRadius: 4,
                            border: '1px solid #4a5568'
                        }, children: [_jsx("div", { style: {
                                    fontSize: 11,
                                    color: '#90cdf4',
                                    fontWeight: 500,
                                    marginBottom: 6
                                }, children: "\u2699\uFE0F Advanced Options" }), _jsxs("div", { style: {
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: 8,
                                    fontSize: 10,
                                    color: '#a0aec0'
                                }, children: [_jsxs("div", { children: ["Total Weights: ", weights.reduce((sum, w) => sum + (w || 1), 0).toFixed(1)] }), _jsxs("div", { children: ["Choices: ", choices.length] }), _jsxs("div", { children: ["Min Weight: ", Math.min(...weights.filter(w => w > 0)).toFixed(1) || 'N/A'] }), _jsxs("div", { children: ["Max Weight: ", Math.max(...weights).toFixed(1) || 'N/A'] })] })] })] }), _jsx(ProgressiveDisclosureSection, { title: "Debug Information", level: "debug", description: "Technical node details", defaultExpanded: false, children: _jsxs("div", { style: {
                        fontFamily: 'monospace',
                        fontSize: 10,
                        color: '#c4b5fd',
                        background: '#2d1b69',
                        padding: 8,
                        borderRadius: 4,
                        border: '1px solid #553c9a'
                    }, children: [_jsxs("div", { style: { marginBottom: 6 }, children: [_jsx("strong", { children: "Node ID:" }), " ", nodeId] }), _jsxs("div", { style: { marginBottom: 6 }, children: [_jsx("strong", { children: "Node Type:" }), " WeightedChoice"] }), _jsxs("div", { style: { marginBottom: 6 }, children: [_jsx("strong", { children: "Inputs:" }), " ", nodeData.inputs?.length || 0] }), _jsxs("div", { style: { marginBottom: 6 }, children: [_jsx("strong", { children: "Data Keys:" }), " ", Object.keys(nodeData).join(', ')] }), _jsxs("div", { style: { marginBottom: 6 }, children: [_jsx("strong", { children: "Validation:" }), " ", choices.length > 0 ? '✅ Valid' : '❌ No choices defined'] }), _jsxs("details", { style: { marginTop: 8 }, children: [_jsx("summary", { style: {
                                        cursor: 'pointer',
                                        color: '#a0aec0',
                                        fontSize: 9
                                    }, children: "Raw Node Data" }), _jsx("pre", { style: {
                                        marginTop: 4,
                                        padding: 4,
                                        background: '#1a1a2e',
                                        borderRadius: 2,
                                        fontSize: 8,
                                        overflow: 'auto',
                                        maxHeight: 100
                                    }, children: JSON.stringify(nodeData, null, 2) })] })] }) })] }));
};
export default EnhancedWeightedChoiceEditor;
