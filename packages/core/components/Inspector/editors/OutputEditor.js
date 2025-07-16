import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { TextFieldEditor } from "../TextFieldEditor";
import { TextAreaEditor } from "../TextAreaEditor";
import { SelectEditor } from "../SelectEditor";
import { CollapsibleSection } from "../CollapsibleSection";
const OUTPUT_FORMATS = [
    { value: "text", label: "Plain Text" },
    { value: "markdown", label: "Markdown" },
    { value: "html", label: "HTML" },
    { value: "json", label: "JSON" },
];
const OUTPUT_DESTINATIONS = [
    { value: "final", label: "Final Output" },
    { value: "intermediate", label: "Intermediate Result" },
    { value: "debug", label: "Debug Output" },
];
export const OutputEditor = (props) => {
    const { nodeData, onChange } = props;
    // Output specific fields
    const label = nodeData.label || "";
    const template = nodeData.template || "";
    const format = nodeData.format || "text";
    const destination = nodeData.destination || "final";
    const includeMetadata = !!nodeData.includeMetadata;
    const transformations = nodeData.transformations || [];
    // State for collapsible sections
    const [basicPropsCollapsed, setBasicPropsCollapsed] = useState(false);
    const [outputConfigCollapsed, setOutputConfigCollapsed] = useState(false);
    const [postProcessingCollapsed, setPostProcessingCollapsed] = useState(true);
    const [previewCollapsed, setPreviewCollapsed] = useState(true);
    const handleFieldChange = (field, value) => {
        onChange({ [field]: value });
    };
    const handleTransformationChange = (index, transformation) => {
        const newTransformations = [...transformations];
        newTransformations[index] = transformation;
        onChange({ transformations: newTransformations });
    };
    const addTransformation = () => {
        onChange({
            transformations: [...transformations, ""]
        });
    };
    const removeTransformation = (index) => {
        const newTransformations = transformations.filter((_, i) => i !== index);
        onChange({ transformations: newTransformations });
    };
    return (_jsxs("div", { className: "output-editor", children: [_jsxs(CollapsibleSection, { title: "Basic Properties", collapsed: basicPropsCollapsed, onToggle: () => setBasicPropsCollapsed(!basicPropsCollapsed), children: [_jsx(TextFieldEditor, { label: "Label", value: label, fieldKey: "label", zodType: null, onChange: (value) => handleFieldChange("label", value), placeholder: "Enter output label..." }), _jsx(TextAreaEditor, { label: "Output Template", value: template, fieldKey: "template", zodType: null, onChange: (value) => handleFieldChange("template", value), placeholder: "Enter output template... Use {input} to reference connected node output.", rows: 4, showWordCount: true, autoResize: true })] }), _jsxs(CollapsibleSection, { title: "Output Configuration", collapsed: outputConfigCollapsed, onToggle: () => setOutputConfigCollapsed(!outputConfigCollapsed), children: [_jsx(SelectEditor, { label: "Format", value: format, fieldKey: "format", options: OUTPUT_FORMATS, zodType: null, onChange: (value) => handleFieldChange("format", value) }), _jsx(SelectEditor, { label: "Destination", value: destination, fieldKey: "destination", options: OUTPUT_DESTINATIONS, zodType: null, onChange: (value) => handleFieldChange("destination", value) }), _jsxs("div", { style: { marginBottom: 16 }, children: [_jsxs("label", { style: {
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    fontSize: 12,
                                    color: "#e2e8f0",
                                    cursor: "pointer",
                                }, children: [_jsx("input", { type: "checkbox", checked: includeMetadata, onChange: (e) => handleFieldChange("includeMetadata", e.target.checked), style: {
                                            width: 14,
                                            height: 14,
                                            cursor: "pointer",
                                        } }), "Include metadata in output"] }), _jsx("div", { style: {
                                    fontSize: 10,
                                    color: "#a0aec0",
                                    marginTop: 2,
                                    marginLeft: 22,
                                }, children: "Adds execution metadata like timestamp, node path, and seed information" })] })] }), _jsxs(CollapsibleSection, { title: "Post-Processing", collapsed: postProcessingCollapsed, onToggle: () => setPostProcessingCollapsed(!postProcessingCollapsed), children: [_jsxs("div", { style: { marginBottom: 12 }, children: [_jsxs("div", { style: {
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: 8,
                                }, children: [_jsx("label", { style: {
                                            fontWeight: 500,
                                            color: "#e2e8f0",
                                            fontSize: 12,
                                        }, children: "Transformations" }), _jsx("button", { onClick: addTransformation, style: {
                                            padding: "4px 8px",
                                            fontSize: 10,
                                            background: "#4299e1",
                                            border: "none",
                                            borderRadius: 2,
                                            color: "white",
                                            cursor: "pointer",
                                        }, children: "+ Add" })] }), transformations.length === 0 ? (_jsx("div", { style: {
                                    padding: 12,
                                    background: "#2d3748",
                                    border: "1px dashed #4a5568",
                                    borderRadius: 4,
                                    textAlign: "center",
                                    color: "#a0aec0",
                                    fontSize: 12,
                                    fontStyle: "italic",
                                }, children: "No transformations configured. Add transformations to modify output." })) : (_jsx("div", { style: {
                                    background: "#2d3748",
                                    border: "1px solid #4a5568",
                                    borderRadius: 4,
                                    padding: 8,
                                }, children: transformations.map((transformation, index) => (_jsxs("div", { style: {
                                        display: "flex",
                                        gap: 8,
                                        marginBottom: index < transformations.length - 1 ? 8 : 0,
                                    }, children: [_jsx("input", { type: "text", value: transformation, onChange: (e) => handleTransformationChange(index, e.target.value), placeholder: "e.g., trim, lowercase, capitalize", style: {
                                                flex: 1,
                                                padding: 6,
                                                border: "1px solid #4a5568",
                                                borderRadius: 2,
                                                background: "#1a202c",
                                                color: "#e2e8f0",
                                                fontSize: 12,
                                            } }), _jsx("button", { onClick: () => removeTransformation(index), style: {
                                                padding: "4px 6px",
                                                background: "#e53e3e",
                                                border: "none",
                                                borderRadius: 2,
                                                color: "white",
                                                cursor: "pointer",
                                                fontSize: 10,
                                            }, children: "\u2715" })] }, index))) }))] }), _jsxs("div", { style: {
                            fontSize: 10,
                            color: "#a0aec0",
                            lineHeight: 1.4,
                        }, children: [_jsx("strong", { children: "Available transformations:" }), _jsx("br", {}), "\u2022 trim - Remove leading/trailing whitespace", _jsx("br", {}), "\u2022 lowercase, uppercase, capitalize - Text case transformations", _jsx("br", {}), "\u2022 stripHtml - Remove HTML tags", _jsx("br", {}), "\u2022 encode - URL encode output", _jsx("br", {}), "\u2022 Custom JavaScript expressions supported"] })] }), _jsx(CollapsibleSection, { title: "Preview", collapsed: previewCollapsed, onToggle: () => setPreviewCollapsed(!previewCollapsed), children: _jsxs("div", { style: {
                        background: "#1a202c",
                        border: "1px solid #4a5568",
                        borderRadius: 4,
                        padding: 12,
                        fontSize: 12,
                        color: "#e2e8f0",
                    }, children: [_jsx("div", { style: { marginBottom: 8, fontWeight: 500 }, children: "Output Configuration:" }), _jsxs("div", { style: { marginBottom: 4 }, children: [_jsx("span", { style: { color: "#a0aec0" }, children: "Format:" }), " ", format] }), _jsxs("div", { style: { marginBottom: 4 }, children: [_jsx("span", { style: { color: "#a0aec0" }, children: "Destination:" }), " ", destination] }), _jsxs("div", { style: { marginBottom: 4 }, children: [_jsx("span", { style: { color: "#a0aec0" }, children: "Metadata:" }), " ", includeMetadata ? "Included" : "Excluded"] }), transformations.length > 0 && (_jsxs("div", { style: { marginBottom: 4 }, children: [_jsx("span", { style: { color: "#a0aec0" }, children: "Transformations:" }), " ", transformations.filter(Boolean).join(" → ")] })), template && (_jsxs("div", { style: {
                                marginTop: 8,
                                padding: 8,
                                background: "rgba(66, 153, 225, 0.1)",
                                borderRadius: 2,
                            }, children: [_jsx("div", { style: { color: "#a0aec0", fontSize: 10, marginBottom: 4 }, children: "Template Preview:" }), _jsx("div", { style: { fontFamily: "monospace", fontSize: 11 }, children: template })] }))] }) })] }));
};
