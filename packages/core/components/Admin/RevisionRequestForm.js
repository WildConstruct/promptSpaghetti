import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Revision Request Form - E17-1753114397311-674990
 *
 * Comprehensive revision request form component for Epic 17 - Backstage Admin Controls.
 * Allows users to create and submit revision requests with evidence attachments.
 *
 * Following patterns from DocumentReviewInterface and ApprovalWorkflowManager.
 */
import React, { useState, useCallback, useMemo } from 'react';
import { RevisionContentType, RevisionRequestType, RevisionRequestPriority, RevisionEvidenceType } from '../../types/RevisionRequestTypes';
export const RevisionRequestForm = ({ initialData = {}, contentType: initialContentType, contentId: initialContentId, contentTitle: initialContentTitle, onSubmit, onCancel, isSubmitting = false, className = '' }) => {
    // Form state
    const [formData, setFormData] = useState({
        title: initialData.title || '',
        description: initialData.description || '',
        requestedChanges: initialData.requestedChanges || '',
        businessJustification: initialData.businessJustification || '',
        contentType: initialData.contentType || initialContentType || RevisionContentType.TEMPLATE,
        contentId: initialData.contentId || initialContentId || '',
        type: initialData.type || RevisionRequestType.CONTENT_UPDATE,
        priority: initialData.priority || RevisionRequestPriority.MEDIUM,
        dueDate: initialData.dueDate,
        estimatedHours: initialData.estimatedHours,
        tags: initialData.tags || [],
        evidence: initialData.evidence || []
    });
    const [currentStep, setCurrentStep] = useState(1);
    const [validationErrors, setValidationErrors] = useState({});
    const [evidenceItems, setEvidenceItems] = useState([]);
    const [newTag, setNewTag] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const totalSteps = 4;
    // Memoized content title for display
    const displayContentTitle = useMemo(() => {
        return initialContentTitle || formData.contentId || 'Unknown Content';
    }, [initialContentTitle, formData.contentId]);
    // Validation logic
    const validateStep = useCallback((step) => {
        const errors = {};
        switch (step) {
            case 1: // Basic Information
                if (!formData.title.trim()) {
                    errors.title = 'Title is required';
                }
                else if (formData.title.length > 500) {
                    errors.title = 'Title must be less than 500 characters';
                }
                if (!formData.description.trim()) {
                    errors.description = 'Description is required';
                }
                else if (formData.description.length < 10) {
                    errors.description = 'Description must be at least 10 characters';
                }
                if (!formData.contentType) {
                    errors.contentType = 'Content type is required';
                }
                if (!formData.contentId.trim()) {
                    errors.contentId = 'Content ID is required';
                }
                break;
            case 2: // Request Details
                if (!formData.requestedChanges.trim()) {
                    errors.requestedChanges = 'Requested changes are required';
                }
                else if (formData.requestedChanges.length < 10) {
                    errors.requestedChanges = 'Requested changes must be at least 10 characters';
                }
                if (!formData.businessJustification.trim()) {
                    errors.businessJustification = 'Business justification is required';
                }
                else if (formData.businessJustification.length < 10) {
                    errors.businessJustification = 'Business justification must be at least 10 characters';
                }
                if (!formData.type) {
                    errors.type = 'Request type is required';
                }
                if (!formData.priority) {
                    errors.priority = 'Priority is required';
                }
                break;
            case 3: // Timeline & Estimation (optional)
                if (formData.estimatedHours && formData.estimatedHours < 0) {
                    errors.estimatedHours = 'Estimated hours must be positive';
                }
                if (formData.dueDate && formData.dueDate < new Date()) {
                    errors.dueDate = 'Due date cannot be in the past';
                }
                break;
            case 4: // Evidence & Review (optional)
                // No required validations for evidence
                break;
        }
        return errors;
    }, [formData]);
    // Form handlers
    const handleInputChange = useCallback((field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        // Clear validation error for this field
        if (validationErrors[field]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    }, [validationErrors]);
    const handleNext = useCallback(() => {
        const errors = validateStep(currentStep);
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }
        setValidationErrors({});
        setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }, [currentStep, validateStep]);
    const handleBack = useCallback(() => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
        setValidationErrors({});
    }, []);
    const handleSubmit = useCallback(async () => {
        // Validate all steps
        let allErrors = {};
        for (let step = 1; step <= totalSteps; step++) {
            const stepErrors = validateStep(step);
            allErrors = { ...allErrors, ...stepErrors };
        }
        if (Object.keys(allErrors).length > 0) {
            setValidationErrors(allErrors);
            setCurrentStep(1); // Go to first step with errors
            return;
        }
        // Prepare final form data
        const finalFormData = {
            ...formData,
            evidence: evidenceItems.map(item => item.file).filter(Boolean)
        };
        try {
            await onSubmit(finalFormData);
        }
        catch (error) {
            console.error('Failed to submit revision request:', error);
            setValidationErrors({
                submit: error instanceof Error ? error.message : 'Failed to submit revision request'
            });
        }
    }, [formData, evidenceItems, validateStep, onSubmit]);
    // Evidence handlers
    const handleAddEvidence = useCallback(() => {
        const newEvidence = {
            id: `evidence_${Date.now()}`,
            type: RevisionEvidenceType.SCREENSHOT,
            title: '',
            description: '',
        };
        setEvidenceItems(prev => [...prev, newEvidence]);
    }, []);
    const handleRemoveEvidence = useCallback((evidenceId) => {
        setEvidenceItems(prev => prev.filter(item => item.id !== evidenceId));
    }, []);
    const handleEvidenceChange = useCallback((evidenceId, field, value) => {
        setEvidenceItems(prev => prev.map(item => item.id === evidenceId ? { ...item, [field]: value } : item));
    }, []);
    const handleFileUpload = useCallback((evidenceId, file) => {
        setEvidenceItems(prev => prev.map(item => {
            if (item.id === evidenceId) {
                const preview = file.type.startsWith('image/')
                    ? URL.createObjectURL(file)
                    : undefined;
                return { ...item, file, preview };
            }
            return item;
        }));
    }, []);
    // Tag handlers
    const handleAddTag = useCallback(() => {
        if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
            handleInputChange('tags', [...formData.tags, newTag.trim()]);
            setNewTag('');
        }
    }, [newTag, formData.tags, handleInputChange]);
    const handleRemoveTag = useCallback((tagToRemove) => {
        handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
    }, [formData.tags, handleInputChange]);
    // Priority color mapping
    const getPriorityColor = (priority) => {
        switch (priority) {
            case RevisionRequestPriority.CRITICAL: return 'text-red-800 bg-red-100';
            case RevisionRequestPriority.URGENT: return 'text-orange-800 bg-orange-100';
            case RevisionRequestPriority.HIGH: return 'text-yellow-800 bg-yellow-100';
            case RevisionRequestPriority.MEDIUM: return 'text-blue-800 bg-blue-100';
            case RevisionRequestPriority.LOW: return 'text-gray-800 bg-gray-100';
        }
    };
    const renderStepIndicator = () => (_jsx("div", { className: "flex items-center justify-center mb-8", children: Array.from({ length: totalSteps }, (_, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep;
            return (_jsxs(React.Fragment, { children: [_jsx("div", { className: `
              flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-semibold
              ${isActive ? 'border-blue-500 bg-blue-500 text-white' :
                            isCompleted ? 'border-green-500 bg-green-500 text-white' :
                                'border-gray-300 bg-white text-gray-500'}
            `, children: isCompleted ? '✓' : stepNumber }), stepNumber < totalSteps && (_jsx("div", { className: `
                flex-1 h-0.5 mx-2
                ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}
              ` }))] }, stepNumber));
        }) }));
    const renderStep1 = () => (_jsxs("div", { className: "space-y-6", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Basic Information" }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Request Title *" }), _jsx("input", { type: "text", value: formData.title, onChange: (e) => handleInputChange('title', e.target.value), className: `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.title ? 'border-red-500' : 'border-gray-300'}`, placeholder: "Brief, descriptive title for your revision request", maxLength: 500 }), validationErrors.title && (_jsx("p", { className: "mt-1 text-sm text-red-600", children: validationErrors.title }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Description *" }), _jsx("textarea", { value: formData.description, onChange: (e) => handleInputChange('description', e.target.value), rows: 4, className: `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.description ? 'border-red-500' : 'border-gray-300'}`, placeholder: "Provide a detailed description of what needs to be revised and why" }), validationErrors.description && (_jsx("p", { className: "mt-1 text-sm text-red-600", children: validationErrors.description }))] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Content Type *" }), _jsx("select", { value: formData.contentType, onChange: (e) => handleInputChange('contentType', e.target.value), className: `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.contentType ? 'border-red-500' : 'border-gray-300'}`, children: Object.values(RevisionContentType).map((type) => (_jsx("option", { value: type, children: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }, type))) }), validationErrors.contentType && (_jsx("p", { className: "mt-1 text-sm text-red-600", children: validationErrors.contentType }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Content ID *" }), _jsx("input", { type: "text", value: formData.contentId, onChange: (e) => handleInputChange('contentId', e.target.value), className: `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.contentId ? 'border-red-500' : 'border-gray-300'}`, placeholder: "ID of the content to be revised" }), validationErrors.contentId && (_jsx("p", { className: "mt-1 text-sm text-red-600", children: validationErrors.contentId }))] })] }), displayContentTitle && (_jsxs("div", { className: "bg-gray-50 p-4 rounded-md border", children: [_jsx("h4", { className: "text-sm font-medium text-gray-700 mb-1", children: "Content to be Revised:" }), _jsx("p", { className: "text-sm text-gray-900", children: displayContentTitle })] }))] }));
    const renderStep2 = () => (_jsxs("div", { className: "space-y-6", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Request Details" }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Requested Changes *" }), _jsx("textarea", { value: formData.requestedChanges, onChange: (e) => handleInputChange('requestedChanges', e.target.value), rows: 4, className: `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.requestedChanges ? 'border-red-500' : 'border-gray-300'}`, placeholder: "Describe exactly what changes you want made" }), validationErrors.requestedChanges && (_jsx("p", { className: "mt-1 text-sm text-red-600", children: validationErrors.requestedChanges }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Business Justification *" }), _jsx("textarea", { value: formData.businessJustification, onChange: (e) => handleInputChange('businessJustification', e.target.value), rows: 3, className: `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.businessJustification ? 'border-red-500' : 'border-gray-300'}`, placeholder: "Explain why these changes are needed from a business perspective" }), validationErrors.businessJustification && (_jsx("p", { className: "mt-1 text-sm text-red-600", children: validationErrors.businessJustification }))] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Request Type *" }), _jsx("select", { value: formData.type, onChange: (e) => handleInputChange('type', e.target.value), className: `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.type ? 'border-red-500' : 'border-gray-300'}`, children: Object.values(RevisionRequestType).map((type) => (_jsx("option", { value: type, children: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }, type))) }), validationErrors.type && (_jsx("p", { className: "mt-1 text-sm text-red-600", children: validationErrors.type }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Priority *" }), _jsx("select", { value: formData.priority, onChange: (e) => handleInputChange('priority', e.target.value), className: `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.priority ? 'border-red-500' : 'border-gray-300'}`, children: Object.values(RevisionRequestPriority).map((priority) => (_jsx("option", { value: priority, children: priority.charAt(0).toUpperCase() + priority.slice(1) }, priority))) }), validationErrors.priority && (_jsx("p", { className: "mt-1 text-sm text-red-600", children: validationErrors.priority })), _jsxs("div", { className: `mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(formData.priority)}`, children: ["Priority: ", formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)] })] })] })] }));
    const renderStep3 = () => (_jsxs("div", { className: "space-y-6", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Timeline & Estimation" }), _jsx("p", { className: "text-sm text-gray-600", children: "This information helps with planning and assignment (optional)." }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Due Date" }), _jsx("input", { type: "datetime-local", value: formData.dueDate ? formData.dueDate.toISOString().slice(0, 16) : '', onChange: (e) => handleInputChange('dueDate', e.target.value ? new Date(e.target.value) : undefined), className: `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.dueDate ? 'border-red-500' : 'border-gray-300'}` }), validationErrors.dueDate && (_jsx("p", { className: "mt-1 text-sm text-red-600", children: validationErrors.dueDate }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Estimated Hours" }), _jsx("input", { type: "number", min: "0", step: "0.5", value: formData.estimatedHours || '', onChange: (e) => handleInputChange('estimatedHours', e.target.value ? parseFloat(e.target.value) : undefined), className: `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.estimatedHours ? 'border-red-500' : 'border-gray-300'}`, placeholder: "How many hours do you estimate this will take?" }), validationErrors.estimatedHours && (_jsx("p", { className: "mt-1 text-sm text-red-600", children: validationErrors.estimatedHours }))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Tags" }), _jsx("div", { className: "flex flex-wrap gap-2 mb-2", children: formData.tags.map((tag) => (_jsxs("span", { className: "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800", children: [tag, _jsx("button", { type: "button", onClick: () => handleRemoveTag(tag), className: "ml-1 text-blue-600 hover:text-blue-800", children: "\u00D7" })] }, tag))) }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "text", value: newTag, onChange: (e) => setNewTag(e.target.value), onKeyPress: (e) => e.key === 'Enter' && handleAddTag(), className: "flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "Add a tag" }), _jsx("button", { type: "button", onClick: handleAddTag, className: "px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500", children: "Add" })] })] })] }));
    const renderStep4 = () => (_jsxs("div", { className: "space-y-6", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Evidence & Attachments" }), _jsx("p", { className: "text-sm text-gray-600", children: "Add supporting evidence like screenshots, documents, or mockups to help explain your request." }), _jsxs("div", { className: "space-y-4", children: [evidenceItems.map((evidence) => (_jsxs("div", { className: "border border-gray-300 rounded-md p-4 bg-gray-50", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("h4", { className: "text-sm font-medium text-gray-900", children: "Evidence Item" }), _jsx("button", { type: "button", onClick: () => handleRemoveEvidence(evidence.id), className: "text-red-600 hover:text-red-800 text-sm", children: "Remove" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Evidence Type" }), _jsx("select", { value: evidence.type, onChange: (e) => handleEvidenceChange(evidence.id, 'type', e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", children: Object.values(RevisionEvidenceType).map((type) => (_jsx("option", { value: type, children: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }, type))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Title" }), _jsx("input", { type: "text", value: evidence.title, onChange: (e) => handleEvidenceChange(evidence.id, 'title', e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "Brief title for this evidence" })] })] }), _jsxs("div", { className: "mt-3", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Description" }), _jsx("textarea", { value: evidence.description, onChange: (e) => handleEvidenceChange(evidence.id, 'description', e.target.value), rows: 2, className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "Describe what this evidence shows" })] }), _jsxs("div", { className: "mt-3", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "File Upload" }), _jsx("input", { type: "file", onChange: (e) => {
                                            const file = e.target.files?.[0];
                                            if (file)
                                                handleFileUpload(evidence.id, file);
                                        }, className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", accept: ".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.md" }), evidence.preview && (_jsx("div", { className: "mt-2", children: _jsx("img", { src: evidence.preview, alt: "Preview", className: "max-w-xs max-h-32 object-contain rounded-md border" }) }))] })] }, evidence.id))), _jsx("button", { type: "button", onClick: handleAddEvidence, className: "w-full border-2 border-dashed border-gray-300 rounded-md p-4 text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors", children: "+ Add Evidence" })] }), _jsxs("div", { className: "bg-blue-50 p-4 rounded-md border border-blue-200", children: [_jsx("h4", { className: "text-sm font-medium text-blue-900 mb-2", children: "Request Summary" }), _jsxs("div", { className: "space-y-1 text-sm text-blue-800", children: [_jsxs("p", { children: [_jsx("strong", { children: "Title:" }), " ", formData.title] }), _jsxs("p", { children: [_jsx("strong", { children: "Type:" }), " ", formData.type.replace(/_/g, ' ')] }), _jsxs("p", { children: [_jsx("strong", { children: "Priority:" }), " ", formData.priority] }), _jsxs("p", { children: [_jsx("strong", { children: "Content:" }), " ", displayContentTitle] }), formData.dueDate && (_jsxs("p", { children: [_jsx("strong", { children: "Due Date:" }), " ", formData.dueDate.toLocaleDateString()] })), formData.estimatedHours && (_jsxs("p", { children: [_jsx("strong", { children: "Estimated Hours:" }), " ", formData.estimatedHours] })), formData.tags.length > 0 && (_jsxs("p", { children: [_jsx("strong", { children: "Tags:" }), " ", formData.tags.join(', ')] })), _jsxs("p", { children: [_jsx("strong", { children: "Evidence Items:" }), " ", evidenceItems.length] })] })] }), validationErrors.submit && (_jsx("div", { className: "bg-red-50 p-4 rounded-md border border-red-200", children: _jsx("p", { className: "text-sm text-red-800", children: validationErrors.submit }) }))] }));
    return (_jsxs("div", { className: `max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden ${className}`, children: [_jsxs("div", { className: "bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4", children: [_jsx("h2", { className: "text-xl font-semibold text-white", children: "Create Revision Request" }), _jsxs("p", { className: "text-blue-100 text-sm", children: ["Step ", currentStep, " of ", totalSteps] })] }), _jsxs("div", { className: "p-6", children: [renderStepIndicator(), _jsxs("div", { className: "min-h-96", children: [currentStep === 1 && renderStep1(), currentStep === 2 && renderStep2(), currentStep === 3 && renderStep3(), currentStep === 4 && renderStep4()] }), _jsxs("div", { className: "flex justify-between mt-8 pt-6 border-t border-gray-200", children: [_jsx("div", { children: currentStep > 1 && (_jsx("button", { type: "button", onClick: handleBack, disabled: isSubmitting, className: "px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50", children: "Back" })) }), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { type: "button", onClick: onCancel, disabled: isSubmitting, className: "px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50", children: "Cancel" }), currentStep < totalSteps ? (_jsx("button", { type: "button", onClick: handleNext, disabled: isSubmitting, className: "px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50", children: "Next" })) : (_jsxs("button", { type: "button", onClick: handleSubmit, disabled: isSubmitting, className: "px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 flex items-center gap-2", children: [isSubmitting && (_jsxs("svg", { className: "animate-spin h-4 w-4", viewBox: "0 0 24 24", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4", fill: "none" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 0 1 8-8v8H4z" })] })), isSubmitting ? 'Submitting...' : 'Submit Request'] }))] })] })] })] }));
};
export default RevisionRequestForm;
