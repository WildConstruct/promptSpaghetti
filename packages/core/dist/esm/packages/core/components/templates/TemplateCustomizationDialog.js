import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Epic 9.2.6 - Template Customization Dialog
 * Allows users to customize template variables and customization points before instantiation
 */
import { useState, useEffect } from 'react';
{
    const [customizations, setCustomizations] = useState({});
    const [errors, setErrors] = useState({});
    const [activeTab, setActiveTab] = useState('variables');
    useEffect(() => {
        if (isOpen) {
            // Initialize customizations with default values
            const initialCustomizations = {};
            template.variables.forEach(variable => { });
            initialCustomizations[variable.id] = variable.default_value;
        }
    });
    template.customization_points.forEach(point => { });
    initialCustomizations[point.id] = undefined;
}
;
setCustomizations(initialCustomizations);
setErrors({});
[isOpen, template];
;
const validateCustomizations = () => {
    const newErrors = {};
    // Validate variables
    template.variables.forEach(variable => { });
    const value = customizations[variable.id];
    if (variable.required && (value === undefined || value === '' || value === null)) {
        newErrors[variable.id] = `${variable.label} is required`;
    }
    return;
    if (value !== undefined && value !== '' && variable.validation) {
        const validation = variable.validation;
        if (variable.type === 'number') {
            const numValue = Number(value);
            if (isNaN(numValue)) {
                newErrors[variable.id] = `${variable.label} must be a number`;
            }
            else if (validation.min !== undefined && numValue < validation.min) {
                newErrors[variable.id] = `${variable.label} must be at least ${validation.min}`;
            }
            else if (validation.max !== undefined && numValue > validation.max) {
                newErrors[variable.id] = `${variable.label} must be at most ${validation.max}`;
            }
            if (variable.type === 'text' && validation.pattern) {
                const regex = new RegExp(validation.pattern);
                if (!regex.test(String(value))) {
                    newErrors[variable.id] = `${variable.label} format is invalid`;
                }
            }
            ;
            setErrors(newErrors);
            return Object.keys(newErrors).length === 0;
        }
        ;
        const handleCustomizationChange = (id, value) => {
            setCustomizations(prev => ({}), ...prev, [id], value);
        };
    }
    ;
    // Clear error for this field
    if (errors[id]) {
        setErrors(prev => { });
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
    }
    ;
};
const handlePreview = () => {
    if (validateCustomizations()) {
        onPreview(customizations);
    }
    ;
    const handleConfirm = () => {
        if (validateCustomizations()) {
            onConfirm(customizations);
        }
        ;
        if (!isOpen)
            return null;
        return;
        _jsxs("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4", children: [_jsxs("div", { className: "bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden", children: [_jsx("div", { className: "border-b border-gray-200 px-6 py-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "Customize Template" }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: template.name })] }), _jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-500 transition-colors", children: _jsx("svg", { className: "h-6 w-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] }) }), _jsx("div", { className: "border-b border-gray-200", children: _jsxs("nav", { className: "flex px-6", children: [_jsxs("button", { onClick: () => setActiveTab('variables'), className: `py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'variables'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'}
`, children: ["Variables (", template.variables.length, ")"] }), _jsxs("button", { onClick: () => setActiveTab('customization'), className: `py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'customization'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'}
`, children: ["Customization (", template.customization_points.length, ")"] })] }) }), _jsxs("div", { className: "px-6 py-4 overflow-y-auto max-h-[60vh]", children: [activeTab === 'variables' && ()
                                    < div, " className=\"space-y-6\">", _jsx("p", { className: "text-sm text-gray-600", children: "Configure the variables that will be used throughout the template." }), template.variables.map(variable => ()
                                    < VariableEditor, key = { variable, : .id }, variable = { variable }, value = { customizations, [variable.id]:  }, error = { errors, [variable.id]:  }, onChange = {}(value)), " => handleCustomizationChange(variable.id, value)} /> ))}", template.variables.length === 0 && ()
                                    < div, " className=\"text-center py-8 text-gray-500\"> This template has no configurable variables."] }), ")}"] }), ")}", activeTab === 'customization' && ()
                    < div, " className=\"space-y-6\">", _jsx("p", { className: "text-sm text-gray-600", children: "Customize the appearance and behavior of specific parts of the template." }), template.customization_points.map(point => ()
                    < CustomizationPointEditor, key = { point, : .id }, point = { point }, value = { customizations, [point.id]:  }, onChange = {}(value)), " => handleCustomizationChange(point.id, value)} /> ))}", template.customization_points.length === 0 && ()
                    < div, " className=\"text-center py-8 text-gray-500\"> This template has no customization points."] });
    };
};
div >
;
div >
    { /* Footer */}
    < div;
className = "border-t border-gray-200 px-6 py-4 flex justify-between" >
    (_jsxs("div", { className: "flex items-center text-sm text-gray-600", children: [_jsx("svg", { className: "h-4 w-4 mr-1", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }), "Estimated time: ", template.estimated_time, " minutes"] })
        ,
            _jsxs("div", { className: "flex space-x-3", children: [_jsx("button", { onClick: onClose, className: "px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors", children: "Cancel" }), _jsx("button", { onClick: handlePreview, className: "px-4 py-2 text-sm border border-blue-300 text-blue-700 rounded-md hover:bg-blue-50 transition-colors", children: "Preview" }), _jsx("button", { onClick: handleConfirm, className: "px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors", children: "Create Project" })] }));
div >
;
div >
;
div >
;
;
;
const VariableEditor = ({ variable, value, error, onChange }) => {
    const renderInput = () => {
        switch (variable.type) {
            case 'text':
                return;
                _jsx("input", { type: "text", value: value || '', onChange: (e) => onChange(e.target.value), placeholder: variable.description, className: `w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${error ? 'border-red-300' : 'border-gray-300'}
` });
        }
    };
};
;
'textarea';
return;
_jsx("textarea", { value: value || '', onChange: (e) => onChange(e.target.value), placeholder: variable.description, rows: 3, className: `w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${error ? 'border-red-300' : 'border-gray-300'}
` });
;
'number';
return;
_jsx("input", { type: "number", value: value || '', onChange: (e) => onChange(e.target.value ? Number(e.target.value) : undefined), placeholder: variable.description, min: variable.validation?.min, max: variable.validation?.max, className: `w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${error ? 'border-red-300' : 'border-gray-300'}
` });
;
'boolean';
return;
_jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: value || false, onChange: (e) => onChange(e.target.checked), className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500" }), _jsx("span", { className: "ml-2 text-sm text-gray-700", children: variable.description })] });
;
'select';
return;
_jsxs("select", { value: value || '', onChange: (e) => onChange(e.target.value), className: `w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${error ? 'border-red-300' : 'border-gray-300'}
`, children: [_jsx("option", { value: "", children: "Select an option" }), variable.validation?.options?.map(option => ()
            < option, key = { option }, value = { option } > { option })] });
select >
;
;
return null;
;
return;
_jsxs("div", { className: "space-y-2", children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700", children: [variable.label, variable.required && _jsx("span", { className: "text-red-500 ml-1", children: "*" })] }), renderInput(), error && ()
            < p, " className=\"text-sm text-red-600\">", error] });
{
    variable.description && variable.type !== 'boolean' && ()
        < p;
    className = "text-xs text-gray-500" > { variable, : .description };
    p >
    ;
}
div >
;
;
;
const CustomizationPointEditor = ({ point, value, onChange }) => {
    const renderInput = () => {
        switch (point.ui_component) {
            case 'input':
                return;
                _jsx("input", { type: "text", value: value || '', onChange: (e) => onChange(e.target.value), placeholder: point.description, className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" });
        }
    };
};
;
'select';
return;
_jsx("select", { value: value || '', onChange: (e) => onChange(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent", children: _jsx("option", { value: "", children: "Default" }) });
;
'color_picker';
return;
_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "color", value: value || '#000000', onChange: (e) => onChange(e.target.value), className: "h-10 w-16 border border-gray-300 rounded cursor-pointer" }), _jsx("input", { type: "text", value: value || '', onChange: (e) => onChange(e.target.value), placeholder: "#000000", className: "flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" })] });
;
'slider';
return;
_jsxs("div", { className: "space-y-2", children: [_jsx("input", { type: "range", min: "0", max: "100", value: value || 50, onChange: (e) => onChange(Number(e.target.value)), className: "w-full" }), _jsx("div", { className: "text-center text-sm text-gray-600", children: value || 50 })] });
;
'toggle';
return;
_jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: value || false, onChange: (e) => onChange(e.target.checked), className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500" }), _jsxs("span", { className: "ml-2 text-sm text-gray-700", children: ["Enable ", point.name] })] });
;
return null;
;
return;
_jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: point.name }), renderInput(), _jsx("p", { className: "text-xs text-gray-500", children: point.description }), _jsxs("div", { className: "text-xs text-gray-400", children: ["Affects: ", point.target_nodes.join(', '), " \u2022 Type: ", point.type] })] });
;
;
