/**
 * Revision Request Form - E17-1753114397311-674990
 * 
 * Comprehensive revision request form component for Epic 17 - Backstage Admin Controls.
 * Allows users to create and submit revision requests with evidence attachments.
 * 
 * Following patterns from DocumentReviewInterface and ApprovalWorkflowManager.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  RevisionRequestFormData,
  RevisionContentType,
  RevisionRequestType,
  RevisionRequestPriority,
  RevisionEvidenceType,
  DEFAULT_REVISION_REQUEST_CONFIG
} from '../../types/RevisionRequestTypes';

interface RevisionRequestFormProps {
  initialData?: Partial<RevisionRequestFormData>;
  contentType?: RevisionContentType;
  contentId?: string;
  contentTitle?: string;
  onSubmit: (formData: RevisionRequestFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  className?: string;
}

interface ValidationErrors {
  [key: string]: string;
}

interface EvidenceItem {
  id: string;
  type: RevisionEvidenceType;
  title: string;
  description: string;
  file?: File;
  preview?: string;
}

export const RevisionRequestForm: React.FC<RevisionRequestFormProps> = ({
  initialData = {},
  contentType: initialContentType,
  contentId: initialContentId,
  contentTitle: initialContentTitle,
  onSubmit,
  onCancel,
  isSubmitting = false,
  className = ''
}) => {
  // Form state
  const [formData, setFormData] = useState<RevisionRequestFormData>({
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

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [evidenceItems, setEvidenceItems] = useState<EvidenceItem[]>([]);
  const [newTag, setNewTag] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  const totalSteps = 4;

  // Memoized content title for display
  const displayContentTitle = useMemo(() => {
    return initialContentTitle || formData.contentId || 'Unknown Content';
  }, [initialContentTitle, formData.contentId]);

  // Validation logic
  const validateStep = useCallback((step: number): ValidationErrors => {
    const errors: ValidationErrors = {};

    switch (step) {
      case 1: // Basic Information
        if (!formData.title.trim()) {
          errors.title = 'Title is required';
        } else if (formData.title.length > 500) {
          errors.title = 'Title must be less than 500 characters';
        }

        if (!formData.description.trim()) {
          errors.description = 'Description is required';
        } else if (formData.description.length < 10) {
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
        } else if (formData.requestedChanges.length < 10) {
          errors.requestedChanges = 'Requested changes must be at least 10 characters';
        }

        if (!formData.businessJustification.trim()) {
          errors.businessJustification = 'Business justification is required';
        } else if (formData.businessJustification.length < 10) {
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
  const handleInputChange = useCallback((field: keyof RevisionRequestFormData, value: any) => {
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
    let allErrors: ValidationErrors = {};
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
    const finalFormData: RevisionRequestFormData = {
      ...formData,
      evidence: evidenceItems.map(item => item.file).filter(Boolean) as File[]
    };

    try {
      await onSubmit(finalFormData);
    } catch (error) {
      console.error('Failed to submit revision request:', error);
      setValidationErrors({
        submit: error instanceof Error ? error.message : 'Failed to submit revision request'
      });
    }
  }, [formData, evidenceItems, validateStep, onSubmit]);

  // Evidence handlers
  const handleAddEvidence = useCallback(() => {
    const newEvidence: EvidenceItem = {
      id: `evidence_${Date.now()}`,
      type: RevisionEvidenceType.SCREENSHOT,
      title: '',
      description: '',
    };
    setEvidenceItems(prev => [...prev, newEvidence]);
  }, []);

  const handleRemoveEvidence = useCallback((evidenceId: string) => {
    setEvidenceItems(prev => prev.filter(item => item.id !== evidenceId));
  }, []);

  const handleEvidenceChange = useCallback((evidenceId: string, field: keyof EvidenceItem, value: any) => {
    setEvidenceItems(prev => prev.map(item => 
      item.id === evidenceId ? { ...item, [field]: value } : item
    ));
  }, []);

  const handleFileUpload = useCallback((evidenceId: string, file: File) => {
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

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  }, [formData.tags, handleInputChange]);

  // Priority color mapping
  const getPriorityColor = (priority: RevisionRequestPriority): string => {
    switch (priority) {
      case RevisionRequestPriority.CRITICAL: return 'text-red-800 bg-red-100';
      case RevisionRequestPriority.URGENT: return 'text-orange-800 bg-orange-100';
      case RevisionRequestPriority.HIGH: return 'text-yellow-800 bg-yellow-100';
      case RevisionRequestPriority.MEDIUM: return 'text-blue-800 bg-blue-100';
      case RevisionRequestPriority.LOW: return 'text-gray-800 bg-gray-100';
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;
        
        return (
          <React.Fragment key={stepNumber}>
            <div className={`
              flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-semibold
              ${isActive ? 'border-blue-500 bg-blue-500 text-white' : 
                isCompleted ? 'border-green-500 bg-green-500 text-white' : 
                'border-gray-300 bg-white text-gray-500'}
            `}>
              {isCompleted ? '✓' : stepNumber}
            </div>
            {stepNumber < totalSteps && (
              <div className={`
                flex-1 h-0.5 mx-2
                ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}
              `} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
      
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Request Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            validationErrors.title ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Brief, descriptive title for your revision request"
          maxLength={500}
        />
        {validationErrors.title && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.title}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={4}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            validationErrors.description ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Provide a detailed description of what needs to be revised and why"
        />
        {validationErrors.description && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>
        )}
      </div>

      {/* Content Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content Type *
          </label>
          <select
            value={formData.contentType}
            onChange={(e) => handleInputChange('contentType', e.target.value as RevisionContentType)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              validationErrors.contentType ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            {Object.values(RevisionContentType).map((type) => (
              <option key={type} value={type}>
                {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
          {validationErrors.contentType && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.contentType}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content ID *
          </label>
          <input
            type="text"
            value={formData.contentId}
            onChange={(e) => handleInputChange('contentId', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              validationErrors.contentId ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="ID of the content to be revised"
          />
          {validationErrors.contentId && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.contentId}</p>
          )}
        </div>
      </div>

      {/* Content Preview */}
      {displayContentTitle && (
        <div className="bg-gray-50 p-4 rounded-md border">
          <h4 className="text-sm font-medium text-gray-700 mb-1">Content to be Revised:</h4>
          <p className="text-sm text-gray-900">{displayContentTitle}</p>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Request Details</h3>

      {/* Requested Changes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Requested Changes *
        </label>
        <textarea
          value={formData.requestedChanges}
          onChange={(e) => handleInputChange('requestedChanges', e.target.value)}
          rows={4}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            validationErrors.requestedChanges ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Describe exactly what changes you want made"
        />
        {validationErrors.requestedChanges && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.requestedChanges}</p>
        )}
      </div>

      {/* Business Justification */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Business Justification *
        </label>
        <textarea
          value={formData.businessJustification}
          onChange={(e) => handleInputChange('businessJustification', e.target.value)}
          rows={3}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            validationErrors.businessJustification ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Explain why these changes are needed from a business perspective"
        />
        {validationErrors.businessJustification && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.businessJustification}</p>
        )}
      </div>

      {/* Request Type and Priority */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Request Type *
          </label>
          <select
            value={formData.type}
            onChange={(e) => handleInputChange('type', e.target.value as RevisionRequestType)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              validationErrors.type ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            {Object.values(RevisionRequestType).map((type) => (
              <option key={type} value={type}>
                {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
          {validationErrors.type && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.type}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority *
          </label>
          <select
            value={formData.priority}
            onChange={(e) => handleInputChange('priority', e.target.value as RevisionRequestPriority)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              validationErrors.priority ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            {Object.values(RevisionRequestPriority).map((priority) => (
              <option key={priority} value={priority}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </option>
            ))}
          </select>
          {validationErrors.priority && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.priority}</p>
          )}
          
          {/* Priority indicator */}
          <div className={`mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(formData.priority)}`}>
            Priority: {formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Timeline & Estimation</h3>
      <p className="text-sm text-gray-600">
        This information helps with planning and assignment (optional).
      </p>

      {/* Due Date and Estimated Hours */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Due Date
          </label>
          <input
            type="datetime-local"
            value={formData.dueDate ? formData.dueDate.toISOString().slice(0, 16) : ''}
            onChange={(e) => handleInputChange('dueDate', e.target.value ? new Date(e.target.value) : undefined)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              validationErrors.dueDate ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {validationErrors.dueDate && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.dueDate}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estimated Hours
          </label>
          <input
            type="number"
            min="0"
            step="0.5"
            value={formData.estimatedHours || ''}
            onChange={(e) => handleInputChange('estimatedHours', e.target.value ? parseFloat(e.target.value) : undefined)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              validationErrors.estimatedHours ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="How many hours do you estimate this will take?"
          />
          {validationErrors.estimatedHours && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.estimatedHours}</p>
          )}
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add a tag"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Evidence & Attachments</h3>
      <p className="text-sm text-gray-600">
        Add supporting evidence like screenshots, documents, or mockups to help explain your request.
      </p>

      {/* Evidence Items */}
      <div className="space-y-4">
        {evidenceItems.map((evidence) => (
          <div key={evidence.id} className="border border-gray-300 rounded-md p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-900">Evidence Item</h4>
              <button
                type="button"
                onClick={() => handleRemoveEvidence(evidence.id)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Remove
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Evidence Type
                </label>
                <select
                  value={evidence.type}
                  onChange={(e) => handleEvidenceChange(evidence.id, 'type', e.target.value as RevisionEvidenceType)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.values(RevisionEvidenceType).map((type) => (
                    <option key={type} value={type}>
                      {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={evidence.title}
                  onChange={(e) => handleEvidenceChange(evidence.id, 'title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief title for this evidence"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={evidence.description}
                onChange={(e) => handleEvidenceChange(evidence.id, 'description', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe what this evidence shows"
              />
            </div>

            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                File Upload
              </label>
              <input
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(evidence.id, file);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.md"
              />
              {evidence.preview && (
                <div className="mt-2">
                  <img src={evidence.preview} alt="Preview" className="max-w-xs max-h-32 object-contain rounded-md border" />
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Add Evidence Button */}
        <button
          type="button"
          onClick={handleAddEvidence}
          className="w-full border-2 border-dashed border-gray-300 rounded-md p-4 text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
        >
          + Add Evidence
        </button>
      </div>

      {/* Summary */}
      <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Request Summary</h4>
        <div className="space-y-1 text-sm text-blue-800">
          <p><strong>Title:</strong> {formData.title}</p>
          <p><strong>Type:</strong> {formData.type.replace(/_/g, ' ')}</p>
          <p><strong>Priority:</strong> {formData.priority}</p>
          <p><strong>Content:</strong> {displayContentTitle}</p>
          {formData.dueDate && (
            <p><strong>Due Date:</strong> {formData.dueDate.toLocaleDateString()}</p>
          )}
          {formData.estimatedHours && (
            <p><strong>Estimated Hours:</strong> {formData.estimatedHours}</p>
          )}
          {formData.tags.length > 0 && (
            <p><strong>Tags:</strong> {formData.tags.join(', ')}</p>
          )}
          <p><strong>Evidence Items:</strong> {evidenceItems.length}</p>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.submit && (
        <div className="bg-red-50 p-4 rounded-md border border-red-200">
          <p className="text-sm text-red-800">{validationErrors.submit}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className={`max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <h2 className="text-xl font-semibold text-white">Create Revision Request</h2>
        <p className="text-blue-100 text-sm">
          Step {currentStep} of {totalSteps}
        </p>
      </div>

      <div className="p-6">
        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Step Content */}
        <div className="min-h-96">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Back
              </button>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Cancel
            </button>

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting && (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v8H4z" />
                  </svg>
                )}
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevisionRequestForm;