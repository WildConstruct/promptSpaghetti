import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { z } from 'zod';
export const InspectorSidebar = ({ node, schema, onChange }) => {
    const [values, setValues] = React.useState({});
    const [fieldErrors, setFieldErrors] = React.useState({});
    const debounceRef = React.useRef(null);
    React.useEffect(() => {
        if (node) {
            setValues({ ...node.data });
            setFieldErrors({});
        }
    }, [node]);
    const updateField = (key, val) => {
        const newVals = { ...values, [key]: val };
        setValues(newVals);
        // Validate single field via schema.pick
        if (schema) {
            const fieldSchema = schema.shape?.[key] ??
                schema._def?.shape?.()[key];
            if (fieldSchema) {
                const parsed = fieldSchema.safeParse(val);
                setFieldErrors((prev) => ({ ...prev, [key]: parsed.success ? '' : parsed.error.issues[0]?.message || 'Invalid' }));
            }
        }
        // Call immediately for responsiveness
        onChange({ [key]: val });
        if (debounceRef.current)
            clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            onChange({ [key]: val });
        }, 300);
    };
    if (!node || !schema) {
        return (_jsx("aside", { style: { padding: 16, width: 320, borderLeft: '1px solid #eee', background: '#fafbfc', height: '100%' }, children: _jsx("em", { children: "Select a node to edit its properties." }) }));
    }
    // Generate form fields from schema (support different Zod versions)
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
    return (_jsxs("aside", { style: { padding: 16, width: 320, borderLeft: '1px solid #eee', background: '#fafbfc', height: '100%' }, children: [_jsxs("h3", { style: { marginTop: 0 }, children: [node.data?.label || node.type, " Properties"] }), _jsx("form", { children: Object.entries(shape).map(([key, zodType]) => {
                    // Render basic input for string/number; customize per type as needed
                    return (_jsxs("div", { style: { marginBottom: 12 }, children: [_jsx("label", { htmlFor: `field-${key}`, style: { display: 'block', fontWeight: 500, marginBottom: 4 }, children: key }), _jsx("input", { id: `field-${key}`, type: zodType._def?.typeName === 'ZodNumber' ? 'number' : 'text', value: (() => {
                                    const v = values[key];
                                    if (v === undefined || v === null) {
                                        return zodType._def?.typeName === 'ZodNumber' ? 0 : '';
                                    }
                                    return v;
                                })(), onChange: e => {
                                    const isNumber = zodType instanceof z.ZodNumber || zodType._def?.typeName === 'ZodNumber';
                                    updateField(key, isNumber ? Number(e.target.value) : e.target.value);
                                }, style: { width: '100%', padding: 6, border: fieldErrors[key] ? '1px solid #f00' : '1px solid #ccc', borderRadius: 4 } }), fieldErrors[key] && _jsx("div", { style: { color: '#f00', fontSize: 12 }, children: fieldErrors[key] })] }, key));
                }) })] }));
};
