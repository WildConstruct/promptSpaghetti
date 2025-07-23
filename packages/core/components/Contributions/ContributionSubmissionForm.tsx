/**
 * Epic 16 Contribution Submission Form Component
 * Task: E16-1753114247118-46E576 - Design contribution UI components
 * 
 * Multi-step form for creating new contributions with type-specific
 * fields, validation, and preview capabilities.
 */

import React, { useState, useEffect } from 'react';
import { 
  CreateContributionRequest, 
  ContributionType,
  validateCreateContributionRequest,
  CONTRIBUTION_TYPE_DESCRIPTIONS 
} from '../../types/contributions';

export interface ContributionSubmissionFormProps {
  onSubmit: (data: CreateContributionRequest) => void;
  onCancel: () => void;
  initialData?: Partial<CreateContributionRequest>;
  className?: string;
}

interface FormStep {
  id: string;
  title: string;
  description: string;
}

const FORM_STEPS: FormStep[] = [
  {
    id: 'type',
    title: 'Choose Type',
    description: 'Select the type of contribution you want to create'
  },
  {
    id: 'basic',
    title: 'Basic Information',
    description: 'Provide title, description, and categorization'
  },
  {
    id: 'content',
    title: 'Content Details',
    description: 'Add specific content based on contribution type'
  },
  {
    id: 'review',
    title: 'Review & Submit',
    description: 'Review your submission before publishing'
  }
];

export const ContributionSubmissionForm: React.FC<ContributionSubmissionFormProps> = ({
  onSubmit,
  onCancel,
  initialData = {},
  className = ''
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<CreateContributionRequest>>({
    type: 'template',
    title: '',
    description: '',
    category: '',
    tags: [],
    content: {},
    assets: [],
    saveAsDraft: false,
    ...initialData
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available categories by type
  const getCategoriesByType = (type: ContributionType): string[] => {
    const categories = {
      template: ['Prompt Engineering', 'Character Creation', 'Story Generation', 'Data Analysis', 'Creative Writing', 'Business', 'Education'],
      knowledge_article: ['Getting Started', 'Best Practices', 'Advanced Techniques', 'Troubleshooting', 'API Reference'],
      tutorial: ['Beginner', 'Intermediate', 'Advanced', 'Project-Based', 'Quick Start'],
      case_study: ['Success Stories', 'ROI Analysis', 'Implementation', 'Before/After', 'Industry Specific'],
      pattern_library: ['Prompt Patterns', 'Graph Patterns', 'Workflow Patterns', 'Integration Patterns'],
      community_post: ['General Discussion', 'Questions', 'Announcements', 'Showcase', 'Feedback'],
      documentation: ['User Guides', 'API Documentation', 'Technical Specs', 'FAQs'],
      review: ['Template Reviews', 'Service Reviews', 'Tool Reviews', 'Case Study Reviews']
    };
    return categories[type] || [];
  };

  // Update form data
  const updateFormData = (updates: Partial<CreateContributionRequest>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    // Clear errors for updated fields
    const updatedFields = Object.keys(updates);
    setErrors(prev => {
      const newErrors = { ...prev };
      updatedFields.forEach(field => delete newErrors[field]);
      return newErrors;
    });
  };

  // Add tag
  const addTag = (tag: string) => {
    if (tag.trim() && !formData.tags?.includes(tag.trim())) {
      updateFormData({ 
        tags: [...(formData.tags || []), tag.trim()]
      });
    }
  };

  // Remove tag
  const removeTag = (index: number) => {
    updateFormData({
      tags: formData.tags?.filter((_, i) => i !== index) || []
    });
  };

  // Validate current step
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
    case 0: // Type selection
      if (!formData.type) {
        newErrors.type = 'Please select a contribution type';
      }
      break;

    case 1: // Basic information
      if (!formData.title?.trim()) {
        newErrors.title = 'Title is required';
      } else if (formData.title.length < 5) {
        newErrors.title = 'Title must be at least 5 characters';
      } else if (formData.title.length > 200) {
        newErrors.title = 'Title must be less than 200 characters';
      }

      if (!formData.description?.trim()) {
        newErrors.description = 'Description is required';
      } else if (formData.description.length < 20) {
        newErrors.description = 'Description must be at least 20 characters';
      } else if (formData.description.length > 2000) {
        newErrors.description = 'Description must be less than 2000 characters';
      }

      if (!formData.category?.trim()) {
        newErrors.category = 'Category is required';
      }
      break;

    case 2: // Content details
      if (!formData.content || Object.keys(formData.content).length === 0) {
        newErrors.content = 'Content details are required';
      }
      break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, FORM_STEPS.length - 1));
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  // Handle form submission
  const handleSubmit = async (saveAsDraft: boolean = false) => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    try {
      const submissionData = {
        ...formData,
        saveAsDraft
      } as CreateContributionRequest;

      // Validate with Zod
      validateCreateContributionRequest(submissionData);
      
      await onSubmit(submissionData);
    } catch (err) {
      setErrors({ 
        submit: err instanceof Error ? err.message : 'Failed to submit contribution' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
    case 0:
      return (
        <div className="step-content">
          <h3>What type of contribution are you creating?</h3>
          <div className="type-grid">
            {Object.entries(CONTRIBUTION_TYPE_DESCRIPTIONS).map(([type, description]) => (
              <div
                key={type}
                className={`type-option ${formData.type === type ? 'selected' : ''}`}
                onClick={() => updateFormData({ type: type as ContributionType })}
              >
                <div className="type-header">
                  <h4>{description}</h4>
                </div>
                <p className="type-description">
                  {getTypeDescription(type as ContributionType)}
                </p>
              </div>
            ))}
          </div>
          {errors.type && <div className="error-message">{errors.type}</div>}
        </div>
      );

    case 1:
      return (
        <div className="step-content">
          <h3>Basic Information</h3>
            
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              id="title"
              type="text"
              value={formData.title || ''}
              onChange={(e) => updateFormData({ title: e.target.value })}
              placeholder="Enter a descriptive title..."
              className={errors.title ? 'error' : ''}
            />
            {errors.title && <div className="error-message">{errors.title}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => updateFormData({ description: e.target.value })}
              placeholder="Provide a detailed description of your contribution..."
              rows={4}
              className={errors.description ? 'error' : ''}
            />
            <div className="char-count">
              {formData.description?.length || 0} / 2000 characters
            </div>
            {errors.description && <div className="error-message">{errors.description}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              value={formData.category || ''}
              onChange={(e) => updateFormData({ category: e.target.value })}
              className={errors.category ? 'error' : ''}
            >
              <option value="">Select a category...</option>
              {getCategoriesByType(formData.type as ContributionType).map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            {errors.category && <div className="error-message">{errors.category}</div>}
          </div>

          <div className="form-group">
            <label>Tags (optional)</label>
            <div className="tags-input">
              <input
                type="text"
                placeholder="Add tags..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
              <div className="tags-list">
                {formData.tags?.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="tag-remove"
                    >
                        ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      );

    case 2:
      return (
        <div className="step-content">
          <h3>Content Details</h3>
          {renderContentFields()}
          {errors.content && <div className="error-message">{errors.content}</div>}
        </div>
      );

    case 3:
      return (
        <div className="step-content">
          <h3>Review Your Submission</h3>
          <div className="review-section">
            <div className="review-item">
              <strong>Type:</strong> {CONTRIBUTION_TYPE_DESCRIPTIONS[formData.type as ContributionType]}
            </div>
            <div className="review-item">
              <strong>Title:</strong> {formData.title}
            </div>
            <div className="review-item">
              <strong>Category:</strong> {formData.category}
            </div>
            <div className="review-item">
              <strong>Description:</strong>
              <div className="description-preview">{formData.description}</div>
            </div>
            {formData.tags && formData.tags.length > 0 && (
              <div className="review-item">
                <strong>Tags:</strong>
                <div className="tags-preview">
                  {formData.tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
          {errors.submit && <div className="error-message">{errors.submit}</div>}
        </div>
      );

    default:
      return null;
    }
  };

  // Get detailed type description
  const getTypeDescription = (type: ContributionType): string => {
    const descriptions = {
      template: 'Create reusable prompt templates that others can use and customize for their projects.',
      knowledge_article: 'Share educational content, guides, and best practices with the community.',
      tutorial: 'Create step-by-step learning content to help others master new skills.',
      case_study: 'Document real-world success stories and implementation examples.',
      pattern_library: 'Contribute reusable design patterns and architectural solutions.',
      community_post: 'Start discussions, ask questions, or share announcements with the community.',
      documentation: 'Help improve technical documentation and user guides.',
      review: 'Share your experience and feedback about templates, tools, or services.'
    };
    return descriptions[type] || '';
  };

  // Render content fields based on type
  const renderContentFields = () => {
    switch (formData.type) {
    case 'template':
      return (
        <div className="content-fields">
          <div className="form-group">
            <label>Graph JSON *</label>
            <textarea
              value={formData.content?.graphJson ? JSON.stringify(formData.content.graphJson, null, 2) : ''}
              onChange={(e) => {
                try {
                  const graphJson = JSON.parse(e.target.value);
                  updateFormData({ 
                    content: { ...formData.content, graphJson } 
                  });
                } catch (err) {
                  // Invalid JSON, but still update to show error
                  updateFormData({ 
                    content: { ...formData.content, graphJson: e.target.value } 
                  });
                }
              }}
              placeholder="Paste your graph JSON here..."
              rows={8}
            />
          </div>
            
          <div className="form-group">
            <label>Claude Model</label>
            <select
              value={formData.content?.claudeModel || 'claude-3-sonnet'}
              onChange={(e) => updateFormData({ 
                content: { ...formData.content, claudeModel: e.target.value } 
              })}
            >
              <option value="claude-3-sonnet">Claude 3 Sonnet</option>
              <option value="claude-3-opus">Claude 3 Opus</option>
              <option value="claude-3-haiku">Claude 3 Haiku</option>
            </select>
          </div>

          <div className="form-group">
            <label>Pricing</label>
            <div className="pricing-group">
              <select
                value={formData.content?.pricing?.type || 'free'}
                onChange={(e) => updateFormData({ 
                  content: { 
                    ...formData.content, 
                    pricing: { 
                      ...formData.content?.pricing, 
                      type: e.target.value as 'free' | 'paid' 
                    } 
                  } 
                })}
              >
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
                
              {formData.content?.pricing?.type === 'paid' && (
                <input
                  type="number"
                  placeholder="Price in cents"
                  value={formData.content?.pricing?.priceInCents || ''}
                  onChange={(e) => updateFormData({ 
                    content: { 
                      ...formData.content, 
                      pricing: { 
                        ...formData.content?.pricing, 
                        priceInCents: parseInt(e.target.value) || 0 
                      } 
                    } 
                  })}
                />
              )}
            </div>
          </div>
        </div>
      );

    case 'knowledge_article':
    case 'tutorial':
      return (
        <div className="content-fields">
          <div className="form-group">
            <label>Article/Tutorial Content *</label>
            <textarea
              value={formData.content?.body || ''}
              onChange={(e) => updateFormData({ 
                content: { ...formData.content, body: e.target.value } 
              })}
              placeholder="Write your content here..."
              rows={10}
            />
          </div>
            
          <div className="form-group">
            <label>Difficulty Level</label>
            <select
              value={formData.content?.difficulty || 'beginner'}
              onChange={(e) => updateFormData({ 
                content: { ...formData.content, difficulty: e.target.value } 
              })}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          </div>
        </div>
      );

    default:
      return (
        <div className="content-fields">
          <div className="form-group">
            <label>Content *</label>
            <textarea
              value={formData.content?.body || ''}
              onChange={(e) => updateFormData({ 
                content: { ...formData.content, body: e.target.value } 
              })}
              placeholder="Enter your content here..."
              rows={8}
            />
          </div>
        </div>
      );
    }
  };

  return (
    <div className={`contribution-submission-form ${className}`}>
      {/* Progress Indicator */}
      <div className="progress-indicator">
        {FORM_STEPS.map((step, index) => (
          <div
            key={step.id}
            className={`progress-step ${index <= currentStep ? 'active' : ''} ${index === currentStep ? 'current' : ''}`}
          >
            <div className="step-number">{index + 1}</div>
            <div className="step-info">
              <div className="step-title">{step.title}</div>
              <div className="step-description">{step.description}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Form Content */}
      <div className="form-content">
        {renderStepContent()}
      </div>

      {/* Form Actions */}
      <div className="form-actions">
        <div className="action-group">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
          >
            Cancel
          </button>
          
          {currentStep > 0 && (
            <button
              type="button"
              onClick={handlePrevious}
              className="btn-secondary"
            >
              Previous
            </button>
          )}
        </div>

        <div className="action-group">
          {currentStep === FORM_STEPS.length - 1 ? (
            <>
              <button
                type="button"
                onClick={() => handleSubmit(true)}
                disabled={isSubmitting}
                className="btn-outline"
              >
                Save as Draft
              </button>
              <button
                type="button"
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting}
                className="btn-primary"
              >
                {isSubmitting ? 'Submitting...' : 'Submit for Review'}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="btn-primary"
            >
              Next
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .contribution-submission-form {
          padding: 24px;
          max-height: 80vh;
          overflow-y: auto;
        }

        .progress-indicator {
          display: flex;
          margin-bottom: 32px;
          overflow-x: auto;
          padding-bottom: 8px;
        }

        .progress-step {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 20px 0 0;
          opacity: 0.5;
          transition: opacity 0.2s ease;
          min-width: 200px;
        }

        .progress-step.active {
          opacity: 1;
        }

        .progress-step.current {
          opacity: 1;
        }

        .step-number {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #e5e7eb;
          color: #6b7280;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
          flex-shrink: 0;
        }

        .progress-step.active .step-number {
          background: #3b82f6;
          color: #ffffff;
        }

        .step-info {
          flex: 1;
        }

        .step-title {
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 2px;
        }

        .step-description {
          font-size: 12px;
          color: #6b7280;
        }

        .form-content {
          margin-bottom: 32px;
        }

        .step-content h3 {
          margin: 0 0 24px 0;
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
        }

        .type-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
          margin-bottom: 16px;
        }

        .type-option {
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .type-option:hover {
          border-color: #3b82f6;
        }

        .type-option.selected {
          border-color: #3b82f6;
          background: #eff6ff;
        }

        .type-header h4 {
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
        }

        .type-description {
          margin: 0;
          font-size: 14px;
          color: #6b7280;
          line-height: 1.5;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
          color: #374151;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.2s ease;
        }

        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-group input.error,
        .form-group textarea.error,
        .form-group select.error {
          border-color: #ef4444;
        }

        .char-count {
          text-align: right;
          font-size: 12px;
          color: #9ca3af;
          margin-top: 4px;
        }

        .tags-input input {
          margin-bottom: 8px;
        }

        .tags-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .tag {
          background: #3b82f6;
          color: #ffffff;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .tag-remove {
          background: none;
          border: none;
          color: #ffffff;
          cursor: pointer;
          font-size: 14px;
          padding: 0;
          margin: 0;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .tag-remove:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .pricing-group {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .pricing-group select {
          flex: 1;
        }

        .pricing-group input {
          flex: 1;
        }

        .review-section {
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
        }

        .review-item {
          margin-bottom: 16px;
        }

        .review-item:last-child {
          margin-bottom: 0;
        }

        .review-item strong {
          display: block;
          margin-bottom: 4px;
          color: #374151;
        }

        .description-preview {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          padding: 12px;
          font-size: 14px;
          color: #6b7280;
          white-space: pre-wrap;
        }

        .tags-preview {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .tags-preview .tag {
          background: #e5e7eb;
          color: #4b5563;
        }

        .error-message {
          color: #ef4444;
          font-size: 12px;
          margin-top: 4px;
        }

        .form-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 24px;
          border-top: 1px solid #e5e7eb;
        }

        .action-group {
          display: flex;
          gap: 12px;
        }

        .btn-primary, .btn-secondary, .btn-outline {
          padding: 10px 20px;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid transparent;
        }

        .btn-primary {
          background: #3b82f6;
          color: #ffffff;
        }

        .btn-primary:hover:not(:disabled) {
          background: #2563eb;
        }

        .btn-secondary {
          background: #f3f4f6;
          color: #374151;
          border-color: #d1d5db;
        }

        .btn-secondary:hover {
          background: #e5e7eb;
        }

        .btn-outline {
          background: #ffffff;
          color: #374151;
          border-color: #d1d5db;
        }

        .btn-outline:hover {
          background: #f9fafb;
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .contribution-submission-form {
            padding: 16px;
          }

          .progress-indicator {
            flex-direction: column;
            gap: 12px;
          }

          .progress-step {
            min-width: auto;
            padding-right: 0;
          }

          .type-grid {
            grid-template-columns: 1fr;
          }

          .form-actions {
            flex-direction: column;
            gap: 16px;
          }

          .action-group {
            width: 100%;
            justify-content: center;
          }

          .pricing-group {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default ContributionSubmissionForm;