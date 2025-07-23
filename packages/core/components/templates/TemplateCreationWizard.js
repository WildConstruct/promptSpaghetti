import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Epic 9.2.6 - Template Creation Wizard
 * Multi-step wizard for creating new project templates from existing graphs
 */
import { useState, useEffect } from 'react';
export const TemplateCreationWizard = ({ graphData, isOpen, onClose, onComplete, templateManager }) => {
    const [currentStep, setCurrentStep] = useState('basic');
    const [templateData, setTemplateData] = useState({
        name: '',
        description: '',
        category: '',
        tags: [],
        version: '1.0.0',
        complexity_level: 'beginner',
        estimated_time: 30,
        prerequisites: [],
        learning_objectives: [],
        is_public: false,
        is_featured: false,
        variables: [],
        customization_points: [],
        graph_data: graphData
    });
    const [categories, setCategories] = useState([]);
    const [errors, setErrors] = useState({});
    useEffect(() => {
        if (isOpen) {
            loadCategories();
            setTemplateData(prev => ({ ...prev, graph_data: graphData }));
        }
    }, [isOpen, graphData]);
    const loadCategories = async () => {
        try {
            const cats = templateManager.getCategories();
            setCategories(cats);
        }
        catch (error) {
            console.error('Failed to load categories:', error);
        }
    };
    const steps = [
        { key: 'basic', title: 'Basic Information', description: 'Template name, description, and category' },
        { key: 'variables', title: 'Variables', description: 'Define configurable variables' },
        { key: 'customization', title: 'Customization', description: 'Set up customization points' },
        { key: 'preview', title: 'Preview', description: 'Review your template' },
        { key: 'publish', title: 'Publish', description: 'Publish your template' }
    ];
    const currentStepIndex = steps.findIndex(step => step.key === currentStep);
    const validateCurrentStep = () => {
        const newErrors = {};
        switch (currentStep) {
            case 'basic':
                if (!templateData.name?.trim()) {
                    newErrors.name = 'Template name is required';
                }
                if (!templateData.description?.trim()) {
                    newErrors.description = 'Description is required';
                }
                if (!templateData.category) {
                    newErrors.category = 'Category is required';
                }
                if (!templateData.estimated_time || templateData.estimated_time <= 0) {
                    newErrors.estimated_time = 'Estimated time must be greater than 0';
                }
                break;
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const nextStep = () => {
        if (validateCurrentStep()) {
            const nextIndex = Math.min(currentStepIndex + 1, steps.length - 1);
            setCurrentStep(steps[nextIndex].key);
        }
    };
    const prevStep = () => {
        const prevIndex = Math.max(currentStepIndex - 1, 0);
        setCurrentStep(steps[prevIndex].key);
    };
    const handleComplete = async () => {
        try {
            const template = await templateManager.createTemplate(templateData);
            onComplete(template);
            onClose();
        }
        catch (error) {
            console.error('Failed to create template:', error);
            setErrors({ publish: 'Failed to create template. Please try again.' });
        }
    };
    const updateTemplateData = (updates) => {
        setTemplateData(prev => ({ ...prev, ...updates }));
        // Clear related errors
        const newErrors = { ...errors };
        Object.keys(updates).forEach(key => {
            delete newErrors[key];
        });
        setErrors(newErrors);
    };
    const addVariable = () => {
        const newVariable = {
            id: crypto.randomUUID(),
            name: '',
            label: '',
            type: 'text',
            description: '',
            default_value: '',
            required: false
        };
        setTemplateData(prev => ({
            ...prev,
            variables: [...(prev.variables || []), newVariable]
        }));
    };
    const updateVariable = (index, updates) => {
        setTemplateData(prev => ({
            ...prev,
            variables: prev.variables?.map((variable, i) => i === index ? { ...variable, ...updates } : variable) || []
        }));
    };
    const removeVariable = (index) => {
        setTemplateData(prev => ({
            ...prev,
            variables: prev.variables?.filter((_, i) => i !== index) || []
        }));
    };
    const addCustomizationPoint = () => {
        const newPoint = {
            id: crypto.randomUUID(),
            name: '',
            type: 'node_properties',
            target_nodes: [],
            properties: [],
            description: '',
            ui_component: 'input'
        };
        setTemplateData(prev => ({
            ...prev,
            customization_points: [...(prev.customization_points || []), newPoint]
        }));
    };
    const updateCustomizationPoint = (index, updates) => {
        setTemplateData(prev => ({
            ...prev,
            customization_points: prev.customization_points?.map((point, i) => i === index ? { ...point, ...updates } : point) || []
        }));
    };
    const removeCustomizationPoint = (index) => {
        setTemplateData(prev => ({
            ...prev,
            customization_points: prev.customization_points?.filter((_, i) => i !== index) || []
        }));
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden", children: [_jsx("div", { className: "border-b border-gray-200 px-6 py-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "Create Template" }), _jsxs("p", { className: "text-sm text-gray-600 mt-1", children: ["Step ", currentStepIndex + 1, " of ", steps.length, ": ", steps[currentStepIndex].title] })] }), _jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-500 transition-colors", children: _jsx("svg", { className: "h-6 w-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] }) }), _jsx("div", { className: "bg-gray-50 px-6 py-3", children: _jsx("div", { className: "flex items-center space-x-4", children: steps.map((step, index) => (_jsxs("div", { className: `flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`, children: [_jsx("div", { className: `flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${index <= currentStepIndex
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-200 text-gray-500'}`, children: index < currentStepIndex ? '✓' : index + 1 }), _jsx("span", { className: `ml-2 text-sm ${index <= currentStepIndex ? 'text-gray-900' : 'text-gray-500'}`, children: step.title }), index < steps.length - 1 && (_jsx("div", { className: `flex-1 h-0.5 mx-4 ${index < currentStepIndex ? 'bg-blue-500' : 'bg-gray-200'}` }))] }, step.key))) }) }), _jsxs("div", { className: "px-6 py-6 overflow-y-auto max-h-[60vh]", children: [currentStep === 'basic' && (_jsx(BasicInfoStep, { data: templateData, categories: categories, errors: errors, onChange: updateTemplateData })), currentStep === 'variables' && (_jsx(VariablesStep, { variables: templateData.variables || [], onAdd: addVariable, onUpdate: updateVariable, onRemove: removeVariable })), currentStep === 'customization' && (_jsx(CustomizationStep, { points: templateData.customization_points || [], graphData: graphData, onAdd: addCustomizationPoint, onUpdate: updateCustomizationPoint, onRemove: removeCustomizationPoint })), currentStep === 'preview' && (_jsx(PreviewStep, { template: templateData })), currentStep === 'publish' && (_jsx(PublishStep, { data: templateData, errors: errors, onChange: updateTemplateData }))] }), _jsxs("div", { className: "border-t border-gray-200 px-6 py-4 flex justify-between", children: [_jsx("button", { onClick: prevStep, disabled: currentStepIndex === 0, className: "px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed", children: "Previous" }), _jsxs("div", { className: "flex space-x-3", children: [_jsx("button", { onClick: onClose, className: "px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors", children: "Cancel" }), currentStepIndex < steps.length - 1 ? (_jsx("button", { onClick: nextStep, className: "px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors", children: "Next" })) : (_jsx("button", { onClick: handleComplete, className: "px-4 py-2 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors", children: "Create Template" }))] })] })] }) }));
};
const BasicInfoStep = ({ data, categories, errors, onChange }) => {
    const [newTag, setNewTag] = useState('');
    const addTag = () => {
        if (newTag.trim() && !data.tags?.includes(newTag.trim())) {
            onChange({ tags: [...(data.tags || []), newTag.trim()] });
            setNewTag('');
        }
    };
    const removeTag = (tag) => {
        onChange({ tags: data.tags?.filter(t => t !== tag) || [] });
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Template Name *" }), _jsx("input", { type: "text", value: data.name || '', onChange: (e) => onChange({ name: e.target.value }), placeholder: "Enter template name", className: `w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.name ? 'border-red-300' : 'border-gray-300'}` }), errors.name && _jsx("p", { className: "text-sm text-red-600 mt-1", children: errors.name })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Category *" }), _jsxs("select", { value: data.category || '', onChange: (e) => onChange({ category: e.target.value }), className: `w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.category ? 'border-red-300' : 'border-gray-300'}`, children: [_jsx("option", { value: "", children: "Select a category" }), categories.map(category => (_jsx("option", { value: category.id, children: category.name }, category.id)))] }), errors.category && _jsx("p", { className: "text-sm text-red-600 mt-1", children: errors.category })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Description *" }), _jsx("textarea", { value: data.description || '', onChange: (e) => onChange({ description: e.target.value }), placeholder: "Describe what this template does and when to use it", rows: 3, className: `w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.description ? 'border-red-300' : 'border-gray-300'}` }), errors.description && _jsx("p", { className: "text-sm text-red-600 mt-1", children: errors.description })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Complexity Level" }), _jsxs("select", { value: data.complexity_level || 'beginner', onChange: (e) => onChange({ complexity_level: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent", children: [_jsx("option", { value: "beginner", children: "Beginner" }), _jsx("option", { value: "intermediate", children: "Intermediate" }), _jsx("option", { value: "advanced", children: "Advanced" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Estimated Time (minutes) *" }), _jsx("input", { type: "number", value: data.estimated_time || '', onChange: (e) => onChange({ estimated_time: parseInt(e.target.value) || 0 }), placeholder: "30", min: "1", className: `w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.estimated_time ? 'border-red-300' : 'border-gray-300'}` }), errors.estimated_time && _jsx("p", { className: "text-sm text-red-600 mt-1", children: errors.estimated_time })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Tags" }), _jsxs("div", { className: "flex items-center space-x-2 mb-2", children: [_jsx("input", { type: "text", value: newTag, onChange: (e) => setNewTag(e.target.value), onKeyPress: (e) => e.key === 'Enter' && addTag(), placeholder: "Add a tag", className: "flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" }), _jsx("button", { type: "button", onClick: addTag, className: "px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors", children: "Add" })] }), _jsx("div", { className: "flex flex-wrap gap-2", children: data.tags?.map(tag => (_jsxs("span", { className: "inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md", children: [tag, _jsx("button", { type: "button", onClick: () => removeTag(tag), className: "ml-1 text-blue-600 hover:text-blue-800", children: "\u00D7" })] }, tag))) })] })] }));
};
const VariablesStep = ({ variables, onAdd, onUpdate, onRemove }) => {
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Template Variables" }), _jsx("p", { className: "text-sm text-gray-600", children: "Define variables that users can customize when using this template." })] }), _jsx("button", { onClick: onAdd, className: "px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors", children: "Add Variable" })] }), variables.length === 0 ? (_jsx("div", { className: "text-center py-8 text-gray-500", children: "No variables defined. Click \"Add Variable\" to create configurable elements." })) : (_jsx("div", { className: "space-y-4", children: variables.map((variable, index) => (_jsxs("div", { className: "border border-gray-200 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-start justify-between mb-4", children: [_jsxs("h4", { className: "font-medium text-gray-900", children: ["Variable ", index + 1] }), _jsx("button", { onClick: () => onRemove(index), className: "text-red-500 hover:text-red-700 transition-colors", children: "Remove" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Name" }), _jsx("input", { type: "text", value: variable.name, onChange: (e) => onUpdate(index, { name: e.target.value }), placeholder: "variable_name", className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Label" }), _jsx("input", { type: "text", value: variable.label, onChange: (e) => onUpdate(index, { label: e.target.value }), placeholder: "Display Label", className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Type" }), _jsxs("select", { value: variable.type, onChange: (e) => onUpdate(index, { type: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent", children: [_jsx("option", { value: "text", children: "Text" }), _jsx("option", { value: "textarea", children: "Textarea" }), _jsx("option", { value: "number", children: "Number" }), _jsx("option", { value: "boolean", children: "Boolean" }), _jsx("option", { value: "select", children: "Select" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Default Value" }), _jsx("input", { type: "text", value: variable.default_value || '', onChange: (e) => onUpdate(index, { default_value: e.target.value }), placeholder: "Default value", className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" })] })] }), _jsxs("div", { className: "mt-4", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Description" }), _jsx("input", { type: "text", value: variable.description, onChange: (e) => onUpdate(index, { description: e.target.value }), placeholder: "Describe what this variable controls", className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" })] }), _jsx("div", { className: "mt-4 flex items-center", children: _jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: variable.required, onChange: (e) => onUpdate(index, { required: e.target.checked }), className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500" }), _jsx("span", { className: "ml-2 text-sm text-gray-700", children: "Required" })] }) })] }, variable.id))) }))] }));
};
const CustomizationStep = ({ points, graphData, onAdd, onUpdate, onRemove }) => {
    const availableNodes = graphData?.nodes?.map((node) => node.id) || [];
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Customization Points" }), _jsx("p", { className: "text-sm text-gray-600", children: "Define which parts of the template users can customize." })] }), _jsx("button", { onClick: onAdd, className: "px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors", children: "Add Customization Point" })] }), points.length === 0 ? (_jsx("div", { className: "text-center py-8 text-gray-500", children: "No customization points defined. Users will use the template as-is." })) : (_jsx("div", { className: "space-y-4", children: points.map((point, index) => (_jsxs("div", { className: "border border-gray-200 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-start justify-between mb-4", children: [_jsxs("h4", { className: "font-medium text-gray-900", children: ["Customization Point ", index + 1] }), _jsx("button", { onClick: () => onRemove(index), className: "text-red-500 hover:text-red-700 transition-colors", children: "Remove" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Name" }), _jsx("input", { type: "text", value: point.name, onChange: (e) => onUpdate(index, { name: e.target.value }), placeholder: "Customization name", className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Type" }), _jsxs("select", { value: point.type, onChange: (e) => onUpdate(index, { type: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent", children: [_jsx("option", { value: "node_properties", children: "Node Properties" }), _jsx("option", { value: "graph_structure", children: "Graph Structure" }), _jsx("option", { value: "styling", children: "Styling" }), _jsx("option", { value: "behavior", children: "Behavior" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "UI Component" }), _jsxs("select", { value: point.ui_component, onChange: (e) => onUpdate(index, { ui_component: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent", children: [_jsx("option", { value: "input", children: "Input" }), _jsx("option", { value: "select", children: "Select" }), _jsx("option", { value: "color_picker", children: "Color Picker" }), _jsx("option", { value: "slider", children: "Slider" }), _jsx("option", { value: "toggle", children: "Toggle" })] })] })] }), _jsxs("div", { className: "mt-4", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Description" }), _jsx("input", { type: "text", value: point.description, onChange: (e) => onUpdate(index, { description: e.target.value }), placeholder: "Describe what this customization does", className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" })] })] }, point.id))) }))] }));
};
const PreviewStep = ({ template }) => {
    return (_jsxs("div", { className: "space-y-6", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Template Preview" }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-900 mb-2", children: "Basic Information" }), _jsxs("dl", { className: "space-y-2", children: [_jsxs("div", { children: [_jsx("dt", { className: "text-sm font-medium text-gray-500", children: "Name" }), _jsx("dd", { className: "text-sm text-gray-900", children: template.name })] }), _jsxs("div", { children: [_jsx("dt", { className: "text-sm font-medium text-gray-500", children: "Category" }), _jsx("dd", { className: "text-sm text-gray-900", children: template.category })] }), _jsxs("div", { children: [_jsx("dt", { className: "text-sm font-medium text-gray-500", children: "Complexity" }), _jsx("dd", { className: "text-sm text-gray-900", children: template.complexity_level })] }), _jsxs("div", { children: [_jsx("dt", { className: "text-sm font-medium text-gray-500", children: "Estimated Time" }), _jsxs("dd", { className: "text-sm text-gray-900", children: [template.estimated_time, " minutes"] })] })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-900 mb-2", children: "Configuration" }), _jsxs("dl", { className: "space-y-2", children: [_jsxs("div", { children: [_jsx("dt", { className: "text-sm font-medium text-gray-500", children: "Variables" }), _jsx("dd", { className: "text-sm text-gray-900", children: template.variables?.length || 0 })] }), _jsxs("div", { children: [_jsx("dt", { className: "text-sm font-medium text-gray-500", children: "Customization Points" }), _jsx("dd", { className: "text-sm text-gray-900", children: template.customization_points?.length || 0 })] }), _jsxs("div", { children: [_jsx("dt", { className: "text-sm font-medium text-gray-500", children: "Tags" }), _jsx("dd", { className: "text-sm text-gray-900", children: template.tags?.join(', ') || 'None' })] })] })] })] }), _jsxs("div", { className: "mt-6", children: [_jsx("h4", { className: "font-medium text-gray-900 mb-2", children: "Description" }), _jsx("p", { className: "text-sm text-gray-700", children: template.description })] })] })] }));
};
const PublishStep = ({ data, errors, onChange }) => {
    return (_jsxs("div", { className: "space-y-6", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Publish Template" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: data.is_public || false, onChange: (e) => onChange({ is_public: e.target.checked }), className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500" }), _jsx("span", { className: "ml-2 text-sm text-gray-700", children: "Make this template public" })] }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Public templates can be discovered and used by other users" })] }), _jsxs("div", { children: [_jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: data.is_featured || false, onChange: (e) => onChange({ is_featured: e.target.checked }), className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500" }), _jsx("span", { className: "ml-2 text-sm text-gray-700", children: "Request to feature this template" })] }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Featured templates appear in the featured section (subject to review)" })] })] }), errors.publish && (_jsx("div", { className: "bg-red-50 border border-red-200 rounded-md p-4", children: _jsxs("div", { className: "flex", children: [_jsx("svg", { className: "h-5 w-5 text-red-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L3.316 16.5c-.77.833.192 2.5 1.732 2.5z" }) }), _jsxs("div", { className: "ml-3", children: [_jsx("h3", { className: "text-sm font-medium text-red-800", children: "Error" }), _jsx("p", { className: "text-sm text-red-700 mt-1", children: errors.publish })] })] }) }))] }));
};
