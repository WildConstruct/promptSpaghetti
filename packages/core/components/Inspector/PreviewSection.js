import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from "react";
import { CollapsibleSection } from "./CollapsibleSection";
import { hasVariations } from "../../utils/nodeDataUtils";
export const PreviewSection = ({ node }) => {
    const [previewCollapsed, setPreviewCollapsed] = useState(false);
    const [numExamples, setNumExamples] = useState(3);
    const [seed, setSeed] = useState(12345);
    const [examples, setExamples] = useState([]);
    // Generate preview examples based on node type and data
    const generateExamples = useMemo(() => {
        if (!node || !node.data)
            return [];
        const { type, data } = node;
        const results = [];
        // Check if node has variations and use them
        const nodeHasVariations = hasVariations(data);
        // Generate multiple examples using variations or default logic
        for (let i = 0; i < numExamples; i++) {
            const currentSeed = seed + i;
            let example = "";
            let highlightInfo = undefined;
            if (nodeHasVariations) {
                // Use variations if available with highlight info
                const variations = data.variations || [];
                const randomIndex = Math.floor((Math.abs(currentSeed) + 1) % variations.length);
                example = variations[randomIndex];
                highlightInfo = {
                    selectedVariation: example,
                    selectedIndex: randomIndex,
                    totalVariations: variations.length,
                };
            }
            else {
                // Fallback to type-specific generation
                switch (type) {
                    case "WeightedChoice":
                        const options = data.options || [];
                        if (options.length > 0) {
                            const randomIndex = Math.floor((currentSeed % options.length));
                            example = options[randomIndex];
                        }
                        else {
                            example = "No options defined";
                        }
                        break;
                    case "Concat":
                        const delimiter = data.delimiter || ", ";
                        example = `[Child 1]${delimiter}[Child 2]${delimiter}[Child 3]`;
                        break;
                    case "Output":
                        const prompt = data.prompt || "No prompt defined";
                        example = prompt;
                        break;
                    case "Include":
                        const ref = data.ref || "No reference defined";
                        example = `[Included: ${ref}]`;
                        break;
                    case "SetVariable":
                        const varName = data.name || "unnamed";
                        const varValue = data.value || "undefined";
                        example = `${varName} = ${varValue}`;
                        break;
                    case "GetVariable":
                        const getName = data.name || "unnamed";
                        example = `${getName} = [current value]`;
                        break;
                    case "Subject":
                        const subjects = data.subjects || [];
                        if (subjects.length > 0) {
                            const randomIndex = Math.floor((currentSeed % subjects.length));
                            example = subjects[randomIndex];
                        }
                        else {
                            example = "No subjects defined";
                        }
                        break;
                    case "Connector":
                        const connectors = data.connectors || [];
                        if (connectors.length > 0) {
                            const randomIndex = Math.floor((currentSeed % connectors.length));
                            example = connectors[randomIndex];
                        }
                        else {
                            example = "No connectors defined";
                        }
                        break;
                    case "Attribute":
                        const attributes = data.attributes || [];
                        if (attributes.length > 0) {
                            const randomIndex = Math.floor((currentSeed % attributes.length));
                            example = attributes[randomIndex];
                        }
                        else {
                            example = "No attributes defined";
                        }
                        break;
                    case "Action":
                        const actions = data.actions || [];
                        if (actions.length > 0) {
                            const randomIndex = Math.floor((currentSeed % actions.length));
                            example = actions[randomIndex];
                        }
                        else {
                            example = "No actions defined";
                        }
                        break;
                    default:
                        example = `Preview for ${type} not implemented`;
                }
            }
            results.push({ text: example, highlightInfo });
        }
        return results;
    }, [node, numExamples, seed]);
    useEffect(() => {
        setExamples(generateExamples);
    }, [generateExamples]);
    const refreshExamples = () => {
        setSeed(Math.floor(Math.random() * 100000));
    };
    return (_jsx(CollapsibleSection, { title: "Preview", collapsed: previewCollapsed, onToggle: () => setPreviewCollapsed(!previewCollapsed), children: _jsxs("div", { style: { padding: "16px 20px 8px" }, children: [_jsx("div", { style: { marginBottom: 16 }, children: _jsxs("div", { style: {
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            marginBottom: 12
                        }, children: [_jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [_jsx("label", { htmlFor: "num-examples", style: {
                                            fontSize: 12,
                                            fontWeight: 600,
                                            color: "#666"
                                        }, children: "Examples:" }), _jsx("input", { id: "num-examples", type: "number", min: "1", max: "10", value: numExamples, onChange: (e) => setNumExamples(Number(e.target.value)), style: {
                                            width: 60,
                                            padding: "4px 8px",
                                            border: "1px solid #4a5568",
                                            borderRadius: 4,
                                            fontSize: 12,
                                            background: "#2d3748",
                                            color: "#e2e8f0",
                                        } })] }), _jsx("button", { onClick: refreshExamples, style: {
                                    background: "#4a5568",
                                    border: "1px solid #4a5568",
                                    borderRadius: 4,
                                    padding: "4px 8px",
                                    fontSize: 12,
                                    color: "#e2e8f0",
                                    cursor: "pointer",
                                }, title: "Refresh examples", children: "\u21BB" })] }) }), _jsx("div", { style: {
                        background: "#2d3748",
                        border: "1px solid #4a5568",
                        borderRadius: 6,
                        minHeight: 100,
                    }, children: examples.length > 0 ? (_jsx("div", { style: { padding: 12 }, children: examples.map((example, index) => (_jsxs("div", { style: {
                                padding: "8px 12px",
                                background: "#374151",
                                border: "1px solid #4a5568",
                                borderRadius: 4,
                                marginBottom: index < examples.length - 1 ? 8 : 0,
                                fontFamily: "monospace",
                                fontSize: 13,
                                color: "#e2e8f0",
                            }, children: [_jsx("div", { style: { marginBottom: example.highlightInfo ? 4 : 0 }, children: example.text }), example.highlightInfo && (_jsxs("div", { style: {
                                        fontSize: 10,
                                        color: "#6b7280",
                                        fontStyle: "italic",
                                        background: "#4a5568",
                                        padding: "2px 6px",
                                        borderRadius: 3,
                                        display: "inline-block",
                                        border: "1px solid #f59e0b",
                                    }, children: ["Variation ", example.highlightInfo.selectedIndex + 1, " of ", example.highlightInfo.totalVariations] }))] }, index))) })) : (_jsx("div", { style: {
                            padding: 20,
                            textAlign: "center",
                            color: "#9ca3af",
                            fontStyle: "italic",
                            fontSize: 13,
                        }, children: "No preview available" })) }), _jsx("div", { style: {
                        marginTop: 12,
                        fontSize: 11,
                        color: "#6b7280",
                        fontStyle: "italic"
                    }, children: "Preview shows example outputs for this node type" })] }) }));
};
