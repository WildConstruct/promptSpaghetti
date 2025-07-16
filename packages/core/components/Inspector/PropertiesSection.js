import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { CollapsibleSection } from "./CollapsibleSection";
import { VariationList } from "./VariationList";
export const PropertiesSection = ({ node, schema, onChange, }) => {
    const [values, setValues] = useState({});
    const [fieldErrors, setFieldErrors] = useState({});
    const [commonPropsCollapsed, setCommonPropsCollapsed] = useState(false);
    const [specificPropsCollapsed, setSpecificPropsCollapsed] = useState(false);
    const debounceRef = useRef(null);
    useEffect(() => {
        if (node) {
            setValues({ ...node.data });
            setFieldErrors({});
        }
    }, [node]);
    const updateField = (key, val) => {
        const newVals = { ...values, [key]: val };
        setValues(newVals);
        // Validate single field via schema
        if (schema) {
            const fieldSchema = schema.shape?.[key] ?? schema._def?.shape?.()[key];
            if (fieldSchema) {
                const parsed = fieldSchema.safeParse(val);
                setFieldErrors((prev) => ({
                    ...prev,
                    [key]: parsed.success ? "" : parsed.error.issues[0]?.message || "Invalid"
                }));
            }
        }
        // Debounced onChange call
        if (debounceRef.current)
            clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            onChange({ [key]: val });
        }, 300);
    };
    // Extract schema shape
    let shape = {};
    if (schema) {
        const maybeShape = schema.shape;
        if (typeof maybeShape === 'function') {
            try {
                shape = maybeShape();
            }
            catch {
                shape = {};
            }
        }
        else if (maybeShape) {
            shape = maybeShape;
        }
        else if (schema._def?.shape) {
            const s = schema._def.shape;
            shape = typeof s === 'function' ? s() : s;
        }
    }
    // Separate common properties from node-specific ones
    const commonProps = ['label'];
    const variationProps = ['variations'];
    const commonFields = Object.entries(shape).filter(([key]) => commonProps.includes(key));
    const specificFields = Object.entries(shape).filter(([key]) => !commonProps.includes(key) && !variationProps.includes(key));
    const renderField = ([key, zodType]) => {
        const value = values[key] ?? "";
        const error = fieldErrors[key];
        return (_jsxs("div", { style: { marginBottom: 16 }, children: [_jsx("label", { htmlFor: `field-${key}`, style: {
                        display: "block",
                        fontSize: 12,
                        fontWeight: 600,
                        marginBottom: 4,
                        color: "#e2e8f0",
                        textTransform: "capitalize",
                    }, children: key.replace(/([A-Z])/g, ' $1').trim() }), _jsx("input", { id: `field-${key}`, type: zodType._def?.typeName === "ZodNumber" ? "number" : "text", defaultValue: String(values[key] ?? ""), onChange: (e) => {
                        e.stopPropagation();
                        const newValue = zodType._def?.typeName === "ZodNumber"
                            ? Number(e.target.value)
                            : e.target.value;
                        // Update local state for validation
                        setValues(prev => ({ ...prev, [key]: newValue }));
                        updateField(key, newValue);
                    }, onKeyDown: (e) => {
                        e.stopPropagation();
                    }, onFocus: (e) => {
                        e.stopPropagation();
                        e.target.style.borderColor = "#4CAF50";
                    }, onBlur: (e) => {
                        e.stopPropagation();
                        e.target.style.borderColor = error ? "#ef4444" : "#4a5568";
                    }, style: {
                        width: "100%",
                        padding: "8px 12px",
                        border: error ? "1px solid #ef4444" : "1px solid #4a5568",
                        borderRadius: 6,
                        fontSize: 14,
                        background: "#2d3748",
                        color: "#e2e8f0",
                        outline: "none",
                        transition: "border-color 0.2s",
                        pointerEvents: "auto",
                        userSelect: "text",
                        WebkitUserSelect: "text",
                    } }, `${key}-${node?.id}`), error && (_jsx("div", { style: {
                        color: "#ef4444",
                        fontSize: 12,
                        marginTop: 4,
                        fontWeight: 500,
                    }, children: error }))] }, key));
    };
    return (_jsxs("div", { children: [commonFields.length > 0 && (_jsx(CollapsibleSection, { title: "Common Properties", collapsed: commonPropsCollapsed, onToggle: () => setCommonPropsCollapsed(!commonPropsCollapsed), children: _jsx("div", { style: { padding: "16px 20px 8px" }, children: commonFields.map(renderField) }) })), specificFields.length > 0 && (_jsx(CollapsibleSection, { title: `${node.type} Properties`, collapsed: specificPropsCollapsed, onToggle: () => setSpecificPropsCollapsed(!specificPropsCollapsed), children: _jsx("div", { style: { padding: "16px 20px 8px" }, children: specificFields.map(renderField) }) })), _jsx(CollapsibleSection, { title: "Text Variations", collapsed: false, onToggle: () => { }, children: _jsx("div", { style: { padding: "16px 20px 8px" }, children: _jsx(VariationList, { nodeId: node.id, variations: values.variations || [], placeholder: "Add a text variation...", allowQuickEntry: true }) }) })] }));
};
