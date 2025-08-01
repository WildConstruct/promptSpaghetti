import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Epic 16 Contribution Submission Form Component
 * Task: E16-1753114247118-46E576 - Design contribution UI components
 *
 * Multi-step form for creating new contributions with type-specific
 * fields, validation, and preview capabilities.
 */
import { useState } from 'react';
import { validateCreateContributionRequest, CONTRIBUTION_TYPE_DESCRIPTIONS } from '../../types/contributions';
{
    id: 'basic',
        title;
    'Basic Information',
        description;
    'Provide title, description, and categorization',
    ;
}
{
    id: 'content',
        title;
    'Content Details',
        description;
    'Add specific content based on contribution type',
    ;
}
{
    id: 'review',
        title;
    'Review & Submit',
        description;
    'Review your submission before publishing';
    ;
}
export const ContributionSubmissionForm = ({
    onSubmit,
    onCancel,
    initialData = {},
    className = ''
});
{
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({});
    type: 'template',
        title;
    '',
        description;
    '',
        category;
    '',
        tags;
    [],
        content;
    { }
    assets: [],
        saveAsDraft;
    false,
    ;
    initialData;
}
;
const [errors, setErrors] = useState({});
const [isSubmitting, setIsSubmitting] = useState(false);
// Available categories by type
const getCategoriesByType = (type) => {
    const categories = {
        template: ['Prompt Engineering', 'Character Creation', 'Story Generation', 'Data Analysis', 'Creative Writing', 'Business', 'Education'],
        knowledge_article: ['Getting Started', 'Best Practices', 'Advanced Techniques', 'Troubleshooting', 'API Reference'],
        tutorial: ['Beginner', 'Intermediate', 'Advanced', 'Project-Based', 'Quick Start'],
        case_study: ['Success Stories', 'ROI Analysis', 'Implementation', 'Before/After', 'Industry Specific'],
        pattern_library: ['Prompt Patterns', 'Graph Patterns', 'Workflow Patterns', 'Integration Patterns'],
        community_post: ['General Discussion', 'Questions', 'Announcements', 'Showcase', 'Feedback'],
        documentation: ['User Guides', 'API Documentation', 'Technical Specs', 'FAQs'],
        review: ['Template Reviews', 'Service Reviews', 'Tool Reviews', 'Case Study Reviews'],
    };
    return categories[type] || [];
};
// Update form data
const updateFormData = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
    // Clear errors for updated fields
    const updatedFields = Object.keys(updates);
    setErrors(prev => { });
    const newErrors = { ...prev };
    updatedFields.forEach(field => delete newErrors[field]);
    return newErrors;
};
;
// Add tag
const addTag = (tag) => {
    if (tag.trim() && !formData.tags?.includes(tag.trim())) {
        updateFormData({});
        tags: [...(formData.tags || []), tag.trim()],
        ;
    }
    ;
};
// Remove tag
const removeTag = (index) => {
    updateFormData({});
    tags: formData.tags?.filter((_, i) => i !== index) || [],
    ;
};
;
// Validate current step
const validateStep = (step) => {
    const newErrors = {};
    switch (step) {
        case 0: // Type selection,
            if (!formData.type) {
                newErrors.type = 'Please select a contribution type';
                break;
            }
        case 1: // Basic information,
            if (!formData.title?.trim()) {
                newErrors.title = 'Title is required';
            }
            else if (formData.title.length < 5) {
                newErrors.title = 'Title must be at least 5 characters';
            }
            else if (formData.title.length > 200) {
                newErrors.title = 'Title must be less than 200 characters';
                if (!formData.description?.trim()) {
                    newErrors.description = 'Description is required';
                }
                else if (formData.description.length < 20) {
                    newErrors.description = 'Description must be at least 20 characters';
                }
                else if (formData.description.length > 2000) {
                    newErrors.description = 'Description must be less than 2000 characters';
                    if (!formData.category?.trim()) {
                        newErrors.category = 'Category is required';
                        break;
                    }
                }
            }
        case 2: // Content details,
            if (!formData.content || Object.keys(formData.content).length === 0) {
                newErrors.content = 'Content details are required';
                break;
                setErrors(newErrors);
                return Object.keys(newErrors).length === 0;
            }
            ;
            // Handle next step
            const handleNext = () => {
                if (validateStep(currentStep)) {
                    setCurrentStep(prev => Math.min(prev + 1, FORM_STEPS.length - 1));
                }
                ;
                // Handle previous step
                const handlePrevious = () => {
                    setCurrentStep(prev => Math.max(prev - 1, 0));
                };
                // Handle form submission
                const handleSubmit = async (saveAsDraft = false) => {
                    if (!validateStep(currentStep))
                        return;
                    setIsSubmitting(true);
                    try {
                        const submissionData = {
                            ...formData,
                            saveAsDraft
                        };
                        // Validate with Zod
                        validateCreateContributionRequest(submissionData);
                        await onSubmit(submissionData);
                    }
                    catch (err) {
                        setErrors({});
                        submit: err instanceof Error ? err.message : 'Failed to submit contribution',
                        ;
                    }
                    ;
                };
                try { }
                finally {
                    setIsSubmitting(false);
                }
                ;
                // Render step content
                const renderStepContent = () => {
                    switch (currentStep) {
                        case 0:
                            return;
                            _jsxs("div", { className: "step-content", children: [_jsx("h3", { children: "What type of contribution are you creating?" }), _jsxs("div", { className: "type-grid", children: [Object.entries(CONTRIBUTION_TYPE_DESCRIPTIONS).map(([type, description]) => ()
                                                < div, key = { type }, className = {} `type-option ${formData.type === type ? 'selected' : ''}`), "onClick=", () => updateFormData({ type: type }), ">", _jsx("div", { className: "type-header", children: _jsx("h4", { children: description }) }), _jsx("p", { className: "type-description", children: getTypeDescription(type) })] }), "))}"] });
                            {
                                errors.type && _jsx("div", { className: "error-message", children: errors.type });
                            }
                    }
                };
            };
    }
};
div >
;
;
1;
return;
_jsxs("div", { className: "step-content", children: [_jsx("h3", { children: "Basic Information" }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "title", children: "Title *" }), _jsx("input", { id: "title", type: "text", value: formData.title || '', onChange: (e) => updateFormData({ title: e.target.value }), placeholder: "Enter a descriptive title...", className: errors.title ? 'error' : '' }), errors.title && _jsx("div", { className: "error-message", children: errors.title })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "description", children: "Description *" }), _jsx("textarea", { id: "description", value: formData.description || '', onChange: (e) => updateFormData({ description: e.target.value }), placeholder: "Provide a detailed description of your contribution...", rows: 4, className: errors.description ? 'error' : '' }), _jsxs("div", { className: "char-count", children: [formData.description?.length || 0, " / 2000 characters"] }), errors.description && _jsx("div", { className: "error-message", children: errors.description })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "category", children: "Category *" }), _jsxs("select", { id: "category", value: formData.category || '', onChange: (e) => updateFormData({ category: e.target.value }), className: errors.category ? 'error' : '', children: [_jsx("option", { value: "", children: "Select a category..." }), getCategoriesByType(formData.type).map((category) => ()
                            < option, key = { category }, value = { category } > { category })] }), "))}"] }), errors.category && _jsx("div", { className: "error-message", children: errors.category })] })
    ,
        _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Tags (optional)" }), _jsxs("div", { className: "tags-input", children: [_jsx("input", { type: "text", placeholder: "Add tags...", onKeyPress: (e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addTag(e.currentTarget.value);
                                    e.currentTarget.value = '';
                                }
                            } }), _jsxs("div", { className: "tags-list", children: [formData.tags?.map((tag, index) => ()
                                    < span, key = { index }, className = "tag" >
                                    { tag }
                                    < button, type = "button", onClick = {}()), " => removeTag(index)} className=\"tag-remove\" > \u00D7"] })] }), "))}"] });
div >
;
div >
;
div >
;
;
2;
return;
_jsxs("div", { className: "step-content", children: [_jsx("h3", { children: "Content Details" }), renderContentFields(), errors.content && _jsx("div", { className: "error-message", children: errors.content })] });
;
3;
return;
_jsxs("div", { className: "step-content", children: [_jsx("h3", { children: "Review Your Submission" }), _jsxs("div", { className: "review-section", children: [_jsxs("div", { className: "review-item", children: [_jsx("strong", { children: "Type:" }), " ", CONTRIBUTION_TYPE_DESCRIPTIONS[formData.type]] }), _jsxs("div", { className: "review-item", children: [_jsx("strong", { children: "Title:" }), " ", formData.title] }), _jsxs("div", { className: "review-item", children: [_jsx("strong", { children: "Category:" }), " ", formData.category] }), _jsxs("div", { className: "review-item", children: [_jsx("strong", { children: "Description:" }), _jsx("div", { className: "description-preview", children: formData.description })] }), formData.tags && formData.tags.length > 0 && ()
                    < div, " className=\"review-item\">", _jsx("strong", { children: "Tags:" }), _jsx("div", { className: "tags-preview", children: formData.tags.map((tag, index) => ()
                        < span, key = { index }, className = "tag" > { tag }) }), "))}"] })] });
div >
    { errors, : .submit && _jsx("div", { className: "error-message", children: errors.submit }) };
div >
;
;
return null;
;
// Get detailed type description
const getTypeDescription = (type) => {
    const descriptions = {
        template: 'Create reusable prompt templates that others can use and customize for their projects.',
        knowledge_article: 'Share educational content, guides, and best practices with the community.',
        tutorial: 'Create step-by-step learning content to help others master new skills.',
        case_study: 'Document real-world success stories and implementation examples.',
        pattern_library: 'Contribute reusable design patterns and architectural solutions.',
        community_post: 'Start discussions, ask questions, or share announcements with the community.',
        documentation: 'Help improve technical documentation and user guides.',
        review: 'Share your experience and feedback about templates, tools, or services.',
    };
    return descriptions[type] || '';
};
// Render content fields based on type
const renderContentFields = () => {
    switch (formData.type) {
        case 'template':
            return;
            _jsxs("div", { className: "content-fields", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Graph JSON *" }), _jsx("textarea", { value: formData.content?.graphJson ? JSON.stringify(formData.content.graphJson, null, 2) : '', onChange: (e) => {
                                    try {
                                        const graphJson = JSON.parse(e.target.value);
                                        updateFormData({});
                                        content: { }
                                    }
                                    finally { }
                                } }), " ...formData.content, graphJson } }); } catch (err) ", 
                            // Invalid JSON, but still update to show error
                            updateFormData({}), "content: ", ...(formData.content, graphJson), ": e.target.value } }); }} placeholder=\"Paste your graph JSON here...\" rows=", 8, "/>"] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Claude Model" }), _jsx("select", { value: formData.content?.claudeModel || 'claude-3-sonnet', onChange: (e) => updateFormData({}), "content:": true, ...(formData.content, claudeModel) }), ": e.target.value } })} >", _jsx("option", { value: "claude-3-sonnet", children: "Claude 3 Sonnet" }), _jsx("option", { value: "claude-3-opus", children: "Claude 3 Opus" }), _jsx("option", { value: "claude-3-haiku", children: "Claude 3 Haiku" })] })] })
                ,
                    _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Pricing" }), _jsxs("div", { className: "pricing-group", children: [_jsx("select", { value: formData.content?.pricing?.type || 'free', onChange: (e) => updateFormData({}), "content:": true, ...(formData.content,
                                            pricing) }), ": ", (,
                                    ), "...formData.content?.pricing, type: e.target.value as 'free' | 'paid', })} >", _jsx("option", { value: "free", children: "Free" }), _jsx("option", { value: "paid", children: "Paid" })] }), formData.content?.pricing?.type === 'paid' && ()
                                < input, "type=\"number\" placeholder=\"Price in cents\" value=", formData.content?.pricing?.priceInCents || '', "onChange=", (e) => updateFormData({}), "content: ", ...(formData.content,
                                pricing), ": ", (,
                            ), "...formData.content?.pricing, priceInCents: parseInt(e.target.value) || 0, })} /> )}"] });
    }
};
div >
;
div >
;
;
'knowledge_article';
'tutorial';
return;
_jsxs("div", { className: "content-fields", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Article/Tutorial Content *" }), _jsx("textarea", { value: formData.content?.body || '', onChange: (e) => updateFormData({}), "content:": true, ...(formData.content, body) }), ": e.target.value } })} placeholder=\"Write your content here...\" rows=", 10, "/>"] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Difficulty Level" }), _jsx("select", { value: formData.content?.difficulty || 'beginner', onChange: (e) => updateFormData({}), "content:": true, ...(formData.content, difficulty) }), ": e.target.value } })} >", _jsx("option", { value: "beginner", children: "Beginner" }), _jsx("option", { value: "intermediate", children: "Intermediate" }), _jsx("option", { value: "advanced", children: "Advanced" }), _jsx("option", { value: "expert", children: "Expert" })] })] });
div >
;
;
return;
_jsx("div", { className: "content-fields", children: _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Content *" }), _jsx("textarea", { value: formData.content?.body || '', onChange: (e) => updateFormData({}), "content:": true, ...(formData.content, body) }), ": e.target.value } })} placeholder=\"Enter your content here...\" rows=", 8, "/>"] }) });
;
;
return;
_jsxs("div", { className: `contribution-submission-form ${className}`, children: ["}", _jsxs("div", { className: "progress-indicator", children: [FORM_STEPS.map((step, index) => ()
                    < div, key = { step, : .id }, className = {} `progress-step ${index <= currentStep ? 'active' : ''} ${index === currentStep ? 'current' : ''}`), ">", _jsx("div", { className: "step-number", children: index + 1 }), _jsxs("div", { className: "step-info", children: [_jsx("div", { className: "step-title", children: step.title }), _jsx("div", { className: "step-description", children: step.description })] })] }), "))}"] });
{ /* Form Content */ }
_jsx("div", { className: "form-content", children: renderStepContent() });
{ /* Form Actions */ }
_jsxs("div", { className: "form-actions", children: [_jsxs("div", { className: "action-group", children: [_jsx("button", { type: "button", onClick: onCancel, className: "btn-secondary", children: "Cancel" }), currentStep > 0 && ()
                    < button, "type=\"button\" onClick=", handlePrevious, "className=\"btn-secondary\" > Previous"] }), ")}"] })
    ,
        _jsx("div", { className: "action-group", children: currentStep === FORM_STEPS.length - 1 ? ()
                <  >
                (_jsx("button", { type: "button", onClick: () => handleSubmit(true), disabled: isSubmitting, className: "btn-outline", children: "Save as Draft" })
                    ,
                        _jsx("button", { type: "button", onClick: () => handleSubmit(false), disabled: isSubmitting, className: "btn-primary", children: isSubmitting ? 'Submitting...' : 'Submit for Review' }))
                :
         });
()
    < button;
type = "button";
onClick = { handleNext };
className = "btn-primary"
    >
        Next;
button >
;
div >
;
div >
    _jsx("style", { children: `
        .contribution-submission-form {
          padding: 24px;
          max-height: 80vh;
          overflow-y: auto;
        .progress-indicator {
          display: flex;
          margin-bottom: 32px;
          overflow-x: auto;
          padding-bottom: 8px;
        .progress-step {
          display: flex;
          align-items: center;,
  gap: 12px;
          padding: 0 20px 0 0;,
  opacity: 0.5;
          transition: opacity 0.2s ease;
          min-width: 200px;
        .progress-step.active {
          opacity: 1;
        .progress-step.current {
          opacity: 1;
        .step-number {
          width: 32px;,
  height: 32px;
          border-radius: 50%;,
  background: #e5e7eb;
          color: #6b7280;,
  display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
          flex-shrink: 0;
        .progress-step.active .step-number {
          background: #3b82f6;,
  color: #ffffff;
        .step-info {
          flex: 1;
        .step-title {
          font-weight: 600;,
  color: #1f2937;
          margin-bottom: 2px;
        .step-description {
          font-size: 12px;,
  color: #6b7280;
        .form-content {
          margin-bottom: 32px;
        .step-content h3 {
          margin: 0 0 24px 0;
          font-size: 24px;
          font-weight: 700;,
  color: #1f2937;
        .type-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
          margin-bottom: 16px;
        .type-option {
          border: 2px solid #e5e7eb;
          border-radius: 8px;,
  padding: 20px;
          cursor: pointer;,
  transition: all 0.2s ease;
        .type-option:hover {
          border-color: #3b82f6;
        .type-option.selected {
          border-color: #3b82f6;,
  background: #eff6ff;
        .type-header h4 {
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: 600;,
  color: #1f2937;
        .type-description {
          margin: 0;
          font-size: 14px;,
  color: #6b7280;
          line-height: 1.5;
        .form-group {
          margin-bottom: 20px;
        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;,
  color: #374151;
        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;,
  padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;,
  transition: border-color 0.2s ease;
        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {,
  outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        .form-group input.error,
        .form-group textarea.error,
        .form-group select.error {
          border-color: #ef4444;
        .char-count {
          text-align: right;
          font-size: 12px;,
  color: #9ca3af;
          margin-top: 4px;
        .tags-input input {
          margin-bottom: 8px;
        .tags-list {
          display: flex;
          flex-wrap: wrap;,
  gap: 6px;
        .tag {
          background: #3b82f6;,
  color: #ffffff;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;,
  display: flex;
          align-items: center;,
  gap: 4px;
        .tag-remove {
          background: none;,
  border: none;
          color: #ffffff;,
  cursor: pointer;
          font-size: 14px;,
  padding: 0;
          margin: 0;,
  width: 16px;
          height: 16px;
          border-radius: 50%;,
  display: flex;
          align-items: center;
          justify-content: center;
        .tag-remove:hover {,
  background: rgba(255, 255, 255, 0.2);
        .pricing-group {
          display: flex;,
  gap: 12px;
          align-items: center;
        .pricing-group select {
          flex: 1;
        .pricing-group input {
          flex: 1;
        .review-section {
          background: #f8fafc;,
  border: 1px solid #e5e7eb;
          border-radius: 8px;,
  padding: 20px;
        .review-item {
          margin-bottom: 16px;
        .review-item:last-child {
          margin-bottom: 0;
        .review-item strong {
          display: block;
          margin-bottom: 4px;,
  color: #374151;
        .description-preview {
          background: #ffffff;,
  border: 1px solid #e5e7eb;
          border-radius: 4px;,
  padding: 12px;
          font-size: 14px;,
  color: #6b7280;
          white-space: pre-wrap;
        .tags-preview {
          display: flex;
          flex-wrap: wrap;,
  gap: 6px;
        .tags-preview .tag {
          background: #e5e7eb;,
  color: #4b5563;
        .error-message {
          color: #ef4444;
          font-size: 12px;
          margin-top: 4px;
        .form-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 24px;
          border-top: 1px solid #e5e7eb;
        .action-group {
          display: flex;,
  gap: 12px;
        .btn-primary, .btn-secondary, .btn-outline {
          padding: 10px 20px;
          border-radius: 6px;
          font-weight: 500;,
  cursor: pointer;
          transition: all 0.2s ease;,
  border: 1px solid transparent;
        .btn-primary {
          background: #3b82f6;,
  color: #ffffff;
        .btn-primary:hover:not(:disabled) {,
  background: #2563eb;
        .btn-secondary {
          background: #f3f4f6;,
  color: #374151;
          border-color: #d1d5db;
        .btn-secondary:hover {,
  background: #e5e7eb;
        .btn-outline {
          background: #ffffff;,
  color: #374151;
          border-color: #d1d5db;
        .btn-outline:hover {,
  background: #f9fafb;
        .btn-primary:disabled {,
  opacity: 0.5;,
  cursor: not-allowed;
        @media (max-width: 768px) {
          .contribution-submission-form {
            padding: 16px;
          .progress-indicator {
            flex-direction: column;,
  gap: 12px;
          .progress-step {
            min-width: auto;
            padding-right: 0;
          .type-grid {
            grid-template-columns: 1fr;
          .form-actions {
            flex-direction: column;,
  gap: 16px;
          .action-group {
            width: 100%;
            justify-content: center;
          .pricing-group {
            flex-direction: column;
      ` });
div >
;
;
;
export default ContributionSubmissionForm;
