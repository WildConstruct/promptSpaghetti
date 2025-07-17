import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from "react";
import { TextFieldEditor } from "../TextFieldEditor";
import { VariationList } from "../VariationList";
import { CollapsibleSection } from "../CollapsibleSection";
export const WeightedChoiceEditor = (props) => {
    const { nodeData, onChange } = props;
    // WeightedChoice specific fields
    const choices = nodeData.choices || [];
    const weights = nodeData.weights || [];
    const label = nodeData.label || "";
    // State for collapsible sections
    const [basicPropsCollapsed, setBasicPropsCollapsed] = useState(false);
    const [choicesCollapsed, setChoicesCollapsed] = useState(false);
    const [previewCollapsed, setPreviewCollapsed] = useState(true);
    const handleChoicesChange = (newChoices) => {
        onChange({
            choices: newChoices,
            // Ensure weights array matches choices length
            weights: newChoices.map((_, index) => weights[index] || 1),
        });
    };
    const handleWeightChange = (index, weight) => {
        const newWeights = [...weights];
        newWeights[index] = Math.max(0, weight); // Ensure non-negative weights
        onChange({ weights: newWeights });
    };
    const handleLabelChange = (value) => {
        onChange({ label: value });
    };
    return (_jsxs("div", { className: "weighted-choice-editor", children: [_jsx(CollapsibleSection, { title: "Basic Properties", collapsed: basicPropsCollapsed, onToggle: () => setBasicPropsCollapsed(!basicPropsCollapsed), children: _jsx(TextFieldEditor, { label: "Label", value: label, fieldKey: "label", zodType: null, onChange: handleLabelChange, placeholder: "Enter node label..." }) }), _jsxs(CollapsibleSection, { title: "Weighted Choices", collapsed: choicesCollapsed, onToggle: () => setChoicesCollapsed(!choicesCollapsed), children: [_jsxs("div", { style: { marginBottom: 12 }, children: [_jsx("label", { style: {
                                    display: "block",
                                    fontWeight: 500,
                                    marginBottom: 8,
                                    color: "#e2e8f0",
                                    fontSize: 12,
                                }, children: "Choice Options" }), _jsx(VariationList, { nodeId: nodeData.id, variations: choices, onAdd: (choice) => handleChoicesChange([...choices, choice]), onRemove: (index) => {
                                    const newChoices = choices.filter((_, i) => i !== index);
                                    handleChoicesChange(newChoices);
                                }, onUpdate: (index, newValue) => {
                                    const newChoices = [...choices];
                                    newChoices[index] = newValue;
                                    handleChoicesChange(newChoices);
                                }, onReorder: (fromIndex, toIndex) => {
                                    const newChoices = [...choices];
                                    const [movedItem] = newChoices.splice(fromIndex, 1);
                                    newChoices.splice(toIndex, 0, movedItem);
                                    handleChoicesChange(newChoices);
                                }, placeholder: "Enter choice option...", maxVariations: 20, allowQuickEntry: true })] }), choices.length > 0 && (_jsxs("div", { style: { marginTop: 16 }, children: [_jsx("label", { style: {
                                    display: "block",
                                    fontWeight: 500,
                                    marginBottom: 8,
                                    color: "#e2e8f0",
                                    fontSize: 12,
                                }, children: "Weights" }), _jsxs("div", { style: {
                                    background: "#2d3748",
                                    border: "1px solid #4a5568",
                                    borderRadius: 4,
                                    padding: 8,
                                }, children: [choices.map((choice, index) => {
                                        const weight = weights[index] || 1;
                                        const percentage = weights.length > 0
                                            ? Math.round((weight / weights.reduce((sum, w) => sum + w, 0)) * 100)
                                            : Math.round(100 / choices.length);
                                        return (_jsxs("div", { style: {
                                                display: "flex",
                                                alignItems: "center",
                                                marginBottom: index < choices.length - 1 ? 8 : 0,
                                                gap: 8,
                                            }, children: [_jsx("div", { style: {
                                                        flex: 1,
                                                        fontSize: 12,
                                                        color: "#e2e8f0",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        whiteSpace: "nowrap",
                                                    }, children: choice || `Choice ${index + 1}` }), _jsx("input", { type: "number", min: "0", step: "0.1", value: weight, onChange: (e) => handleWeightChange(index, parseFloat(e.target.value) || 0), style: {
                                                        width: 60,
                                                        padding: 4,
                                                        border: "1px solid #4a5568",
                                                        borderRadius: 2,
                                                        background: "#1a202c",
                                                        color: "#e2e8f0",
                                                        fontSize: 11,
                                                        textAlign: "center",
                                                    } }), _jsxs("div", { style: {
                                                        width: 40,
                                                        fontSize: 10,
                                                        color: "#a0aec0",
                                                        textAlign: "right",
                                                    }, children: [percentage, "%"] })] }, index));
                                    }), _jsxs("div", { style: {
                                            marginTop: 8,
                                            paddingTop: 8,
                                            borderTop: "1px solid #4a5568",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            fontSize: 11,
                                            color: "#a0aec0",
                                        }, children: [_jsx("span", { children: "Total Weight:" }), _jsx("span", { children: weights.reduce((sum, w) => sum + w, 0).toFixed(1) })] })] })] })), choices.length > 1 && (_jsxs("div", { style: {
                            marginTop: 12,
                            display: "flex",
                            gap: 8,
                            flexWrap: "wrap",
                        }, children: [_jsx("button", { onClick: () => {
                                    const equalWeight = 1;
                                    const newWeights = choices.map(() => equalWeight);
                                    onChange({ weights: newWeights });
                                }, style: {
                                    padding: "4px 8px",
                                    fontSize: 10,
                                    background: "#4a5568",
                                    border: "none",
                                    borderRadius: 2,
                                    color: "#e2e8f0",
                                    cursor: "pointer",
                                }, children: "Equal Weights" }), _jsx("button", { onClick: () => {
                                    const randomWeights = choices.map(() => Math.random() * 10 + 1);
                                    onChange({ weights: randomWeights });
                                }, style: {
                                    padding: "4px 8px",
                                    fontSize: 10,
                                    background: "#4a5568",
                                    border: "none",
                                    borderRadius: 2,
                                    color: "#e2e8f0",
                                    cursor: "pointer",
                                }, children: "Random Weights" })] }))] }), _jsx(CollapsibleSection, { title: "Preview", collapsed: previewCollapsed, onToggle: () => setPreviewCollapsed(!previewCollapsed), children: _jsx("div", { style: {
                        background: "#1a202c",
                        border: "1px solid #4a5568",
                        borderRadius: 4,
                        padding: 12,
                        fontSize: 12,
                        color: "#e2e8f0",
                    }, children: choices.length === 0 ? (_jsx("div", { style: { color: "#a0aec0", fontStyle: "italic" }, children: "Add choices to see preview" })) : (_jsxs("div", { children: [_jsx("div", { style: { marginBottom: 8, fontWeight: 500 }, children: "This node will randomly select one of:" }), choices.map((choice, index) => {
                                const weight = weights[index] || 1;
                                const percentage = weights.length > 0
                                    ? Math.round((weight / weights.reduce((sum, w) => sum + w, 0)) * 100)
                                    : Math.round(100 / choices.length);
                                return (_jsxs("div", { style: {
                                        display: "flex",
                                        justifyContent: "space-between",
                                        marginBottom: 4,
                                        padding: "2px 4px",
                                        background: "rgba(66, 153, 225, 0.1)",
                                        borderRadius: 2,
                                    }, children: [_jsxs("span", { children: ["\"", choice, "\""] }), _jsxs("span", { style: { color: "#a0aec0" }, children: [percentage, "% chance"] })] }, index));
                            })] })) }) })] }));
};
