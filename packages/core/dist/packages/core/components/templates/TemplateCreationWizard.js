import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Epic 9.2.6 - Template Creation Wizard
 * Multi-step wizard for creating new project templates from existing graphs
 */
import { useState, useEffect } from 'react';
export const TemplateCreationWizard = ({
    graphData,
    isOpen,
    onClose,
    onComplete,
    templateManager
});
{
    const [currentStep, setCurrentStep] = useState('basic');
    const [templateData, setTemplateData] = useState({});
    name: '',
        description;
    '',
        category;
    '',
        tags;
    [],
        version;
    '1.0.0',
        complexity_level;
    'beginner',
        estimated_time;
    30,
        prerequisites;
    [],
        learning_objectives;
    [],
        is_public;
    false,
        is_featured;
    false,
        variables;
    [],
        customization_points;
    [],
        graph_data;
    graphData,
    ;
}
;
const [categories, setCategories] = useState([]);
const [errors, setErrors] = useState({});
useEffect(() => {
    if (isOpen) {
        loadCategories();
        setTemplateData(prev => ({ ...prev, graph_data: graphData }));
    }
    [isOpen, graphData];
});
const loadCategories = async () => {
    try {
        const cats = templateManager.getCategories();
        setCategories(cats);
    }
    catch (error) {
        console.error('Failed to load categories:', error);
    }
    ;
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
                    if (!templateData.description?.trim()) {
                        newErrors.description = 'Description is required';
                        if (!templateData.category) {
                            newErrors.category = 'Category is required';
                            if (!templateData.estimated_time || templateData.estimated_time <= 0) {
                                newErrors.estimated_time = 'Estimated time must be greater than 0';
                                break;
                                setErrors(newErrors);
                                return Object.keys(newErrors).length === 0;
                            }
                            ;
                            const nextStep = () => {
                                if (validateCurrentStep()) {
                                    const nextIndex = Math.min(currentStepIndex + 1, steps.length - 1);
                                    setCurrentStep(steps[nextIndex].key);
                                }
                                ;
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
                                    ;
                                    const updateTemplateData = (updates) => {
                                        setTemplateData(prev => ({ ...prev, ...updates }));
                                        // Clear related errors
                                        const newErrors = { ...errors };
                                        Object.keys(updates).forEach(key => { });
                                        delete newErrors[key];
                                    };
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
                                        required: false,
                                    };
                                    setTemplateData(prev => ({}), ...prev, variables, [...(prev.variables || []), newVariable]);
                                };
                            };
                            const updateVariable = (index, updates) => {
                                setTemplateData(prev => ({}), ...prev, variables, prev.variables?.map((variable, i) => i === index ? { ...variable, ...updates } : variable) || []);
                            };
                        }
                        ;
                        const removeVariable = (index) => {
                            setTemplateData(prev => ({}), ...prev, variables, prev.variables?.filter((_, i) => i !== index) || []);
                        };
                    }
                    ;
                    const addCustomizationPoint = () => {
                        const newPoint = {
                            id: crypto.randomUUID(),
                            name: '',
                            type: 'node_properties',
                            target_nodes: [],
                            properties: [],
                            description: '',
                            ui_component: 'input',
                        };
                        setTemplateData(prev => ({}), ...prev, customization_points, [...(prev.customization_points || []), newPoint]);
                    };
                }
                ;
                const updateCustomizationPoint = (index, updates) => {
                    setTemplateData(prev => ({}), ...prev, customization_points, prev.customization_points?.map((point, i) => i === index ? { ...point, ...updates } : point) || []);
                };
        }
        ;
        const removeCustomizationPoint = (index) => {
            setTemplateData(prev => ({}), ...prev, customization_points, prev.customization_points?.filter((_, i) => i !== index) || []);
        };
    };
    if (!isOpen)
        return null;
    return;
    _jsxs("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4", children: [_jsxs("div", { className: "bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden", children: [_jsx("div", { className: "border-b border-gray-200 px-6 py-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "Create Template" }), _jsxs("p", { className: "text-sm text-gray-600 mt-1", children: ["Step ", currentStepIndex + 1, " of ", steps.length, ": ", steps[currentStepIndex].title] })] }), _jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-500 transition-colors", children: _jsx("svg", { className: "h-6 w-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] }) }), _jsxs("div", { className: "bg-gray-50 px-6 py-3", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [steps.map((step, index) => ()
                                        < div, key = { step, : .key }, className = {} `flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`), ">", _jsx("div", { className: `flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${index <= currentStepIndex
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-200 text-gray-500',
                                        }`, children: index < currentStepIndex ? '✓' : index + 1 }), _jsx("span", { className: `ml-2 text-sm ${index <= currentStepIndex ? 'text-gray-900' : 'text-gray-500',
                                        }`, children: step.title }), index < steps.length - 1 && ()
                                        < div, " className=", `flex-1 h-0.5 mx-4 ${index < currentStepIndex ? 'bg-blue-500' : 'bg-gray-200',
                                    }`, " /> )}"] }), "))}"] })] }), _jsxs("div", { className: "px-6 py-6 overflow-y-auto max-h-[60vh]", children: [currentStep === 'basic' && ()
                        < BasicInfoStep, "data=", templateData, "categories=", categories, "errors=", errors, "onChange=", updateTemplateData, "/> )}", currentStep === 'variables' && ()
                        < VariablesStep, "variables=", templateData.variables || [], "onAdd=", addVariable, "onUpdate=", updateVariable, "onRemove=", removeVariable, "/> )}", currentStep === 'customization' && ()
                        < CustomizationStep, "points=", templateData.customization_points || [], "graphData=", graphData, "onAdd=", addCustomizationPoint, "onUpdate=", updateCustomizationPoint, "onRemove=", removeCustomizationPoint, "/> )}", currentStep === 'preview' && ()
                        < PreviewStep, " template=", templateData, " /> )}", currentStep === 'publish' && ()
                        < PublishStep, "data=", templateData, "errors=", errors, "onChange=", updateTemplateData, "/> )}"] }), _jsxs("div", { className: "border-t border-gray-200 px-6 py-4 flex justify-between", children: [_jsx("button", { onClick: prevStep, disabled: currentStepIndex === 0, className: "px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed", children: "Previous" }), _jsxs("div", { className: "flex space-x-3", children: [_jsx("button", { onClick: onClose, className: "px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors", children: "Cancel" }), currentStepIndex < steps.length - 1 ? ()
                                < button
                                :
                            , "onClick=", nextStep, "className=\"px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors\" > Next"] }), ") : ()", _jsx("button", { onClick: handleComplete, className: "px-4 py-2 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors", children: "Create Template" }), ")}"] })] });
};
div >
;
div >
;
;
;
div >
;
div >
;
div >
;
;
;
div >
;
;
;
div >
;
;
;
div >
;
;
;
