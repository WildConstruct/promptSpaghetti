import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { shouldShowField, classifyField } from '../../stores/uiSettingsStore';
// Convert technical error messages to filmmaker-friendly language
const getFilmmakerFriendlyError = (message) => {
    const errorMappings = {
        'Required': 'This field is required',
        'String must contain at least 1 character(s)': 'Please enter some text',
        'Number must be greater than 0': 'Please enter a positive number',
        'Invalid enum value': 'Please select a valid option',
        'Expected string, received number': 'Please enter text, not a number',
        'Expected number, received string': 'Please enter a number',
        'Array must contain at least 1 element(s)': 'Please add at least one item',
        'Invalid': 'Please check this value',
        'node': 'element',
        'Node': 'Element',
        'property': 'setting',
        'Property': 'Setting',
        'configuration': 'setup',
        'Configuration': 'Setup',
        'parameter': 'option',
        'Parameter': 'Option',
        'schema': 'format',
        'Schema': 'Format'
    };
    let friendlyMessage = message;
    for (const [technical, friendly] of Object.entries(errorMappings)) {
        friendlyMessage = friendlyMessage.replace(new RegExp(technical, 'g'), friendly);
    }
    return friendlyMessage;
};
export const BaseNodeEditor = ({ nodeId, nodeData, schema, onChange, className = '', children }) => {
    const [values, setValues] = React.useState(nodeData || {});
    const [fieldErrors, setFieldErrors] = React.useState({});
    // Update local state when nodeData changes
    React.useEffect(() => {
        setValues(nodeData || {});
        setFieldErrors({});
    }, [nodeData]);
    const updateField = (key, val) => {
        const newVals = { ...values, [key]: val };
        setValues(newVals);
        // Validate single field via schema
        if (schema) {
            try {
                const fieldSchema = schema.shape?.[key] ?? schema._def?.shape?.()[key];
                if (fieldSchema) {
                    const parsed = fieldSchema.safeParse(val);
                    setFieldErrors((prev) => ({
                        ...prev,
                        [key]: parsed.success ? '' : getFilmmakerFriendlyError(parsed.error.issues[0]?.message || 'Invalid value')
                    }));
                }
            }
            catch (error) {
                console.warn('Error validating field:', key, error);
            }
        }
        // Call parent onChange
        onChange({ [key]: val });
    };
    const getFieldSchema = (key) => {
        if (!schema)
            return null;
        try {
            const shape = schema.shape;
            if (typeof shape === 'function') {
                return shape()[key] || null;
            }
            else if (shape) {
                return shape[key] || null;
            }
            else if (schema._def?.shape) {
                const s = schema._def.shape;
                const shapeObj = typeof s === 'function' ? s() : s;
                return shapeObj[key] || null;
            }
        }
        catch (error) {
            console.warn('Error getting field schema:', key, error);
        }
        return null;
    };
    const renderField = (key) => {
        const zodType = getFieldSchema(key);
        if (!zodType)
            return null;
        const fieldProps = {
            label: key,
            value: values[key],
            fieldKey: key,
            zodType,
            error: fieldErrors[key],
            onChange: (value) => updateField(key, value)
        };
        // Allow custom field rendering via children
        if (children && React.isValidElement(children)) {
            return React.cloneElement(children, {
                key,
                ...fieldProps
            });
        }
        // Default field rendering (basic input)
        return (_jsxs("div", { style: { marginBottom: 12 }, children: [_jsx("label", { htmlFor: `field-${nodeId}-${key}`, style: {
                        display: 'block',
                        fontWeight: 500,
                        marginBottom: 4,
                        color: '#e2e8f0',
                        fontSize: 12
                    }, children: key }), _jsx("input", { id: `field-${nodeId}-${key}`, type: zodType._def?.typeName === 'ZodNumber' ? 'number' : 'text', value: String(fieldProps.value ?? ''), onChange: (e) => {
                        const isNumber = zodType._def?.typeName === 'ZodNumber';
                        updateField(key, isNumber ? Number(e.target.value) : e.target.value);
                    }, style: {
                        width: '100%',
                        padding: 6,
                        border: fieldErrors[key] ? '1px solid #f56565' : '1px solid #4a5568',
                        borderRadius: 4,
                        background: '#2d3748',
                        color: '#e2e8f0',
                        fontSize: 12
                    }, placeholder: `Enter ${key}...` }), fieldErrors[key] && (_jsx("div", { style: {
                        color: '#f56565',
                        fontSize: 10,
                        marginTop: 2
                    }, children: fieldErrors[key] }))] }, key));
    };
    // Get all field keys from schema, filtered by UI settings
    const getFieldKeys = () => {
        if (!schema)
            return [];
        try {
            let shape = {};
            if (schema.shape) {
                const maybeShape = schema.shape;
                if (typeof maybeShape === 'function') {
                    shape = maybeShape();
                }
                else if (maybeShape) {
                    shape = maybeShape;
                }
            }
            else if (schema._def?.shape) {
                const s = schema._def.shape;
                shape = typeof s === 'function' ? s() : s;
            }
            const allKeys = Object.keys(shape);
            // Filter keys based on UI settings (hide technical fields unless in debug mode)
            return allKeys.filter(key => {
                const fieldType = classifyField(key);
                return shouldShowField(key, fieldType);
            });
        }
        catch (error) {
            console.warn('Error getting field keys:', error);
            return [];
        }
    };
    const fieldKeys = getFieldKeys();
    return (_jsx("div", { className: `base-node-editor ${className}`, children: fieldKeys.length > 0 ? (fieldKeys.map(renderField)) : (_jsx("div", { style: {
                color: '#a0aec0',
                fontStyle: 'italic',
                textAlign: 'center',
                padding: 16,
                fontSize: 12
            }, children: "No editable properties found" })) }));
};
export default BaseNodeEditor;
